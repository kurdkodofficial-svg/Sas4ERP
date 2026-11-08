import { BufferedQueueItem, EncryptedPayloadEnvelope } from '../types/localDataBuffer';

const DB_NAME = 'SAS_ERP_OFFLINE_BUFFER_DB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_queue';

// Key for browser Web Crypto AES-256-GCM
const MASTER_SALT = 'SAS-HOLDING-OFFLINE-AES-256-KEY-SALT';

/**
 * Derives a cryptographic CryptoKey for AES-GCM using Web Crypto API
 */
async function getCryptoKey(): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not supported in this browser environment.');
  }

  const enc = new TextEncoder();
  const rawKeyMaterial = enc.encode('SAS-ERP-AIRGAPPED-VAULT-2026-ENCRYPTION-PASSPHRASE-V1');

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    rawKeyMaterial,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(MASTER_SALT),
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts an object using AES-256-GCM and computes a SHA-256 digest
 */
export async function encryptBufferPayload(data: any): Promise<EncryptedPayloadEnvelope> {
  const enc = new TextEncoder();
  const jsonString = JSON.stringify(data);
  const plainBytes = enc.encode(jsonString);

  // 1. Compute SHA-256 digest
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', plainBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha256Digest = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // 2. Generate random 12-byte IV for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

  // 3. Encrypt via AES-GCM
  const key = await getCryptoKey();
  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plainBytes
  );

  // Convert cipher bytes to Base64
  const cipherBytes = new Uint8Array(cipherBuffer);
  let binaryStr = '';
  for (let i = 0; i < cipherBytes.length; i++) {
    binaryStr += String.fromCharCode(cipherBytes[i]);
  }
  const cipherTextBase64 = btoa(binaryStr);

  return {
    cipherTextBase64,
    ivHex,
    saltHex: btoa(MASTER_SALT),
    algorithm: 'AES-256-GCM',
    sha256Digest,
    keyFingerprint: `AES256:${sha256Digest.slice(0, 16)}`,
    encryptedAt: new Date().toISOString()
  };
}

/**
 * Decrypts an encrypted payload envelope back to original JSON object
 */
export async function decryptBufferPayload(envelope: EncryptedPayloadEnvelope): Promise<any> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API not available');
  }

  // Parse IV from Hex
  const iv = new Uint8Array(
    envelope.ivHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );

  // Parse cipher bytes from Base64
  const binaryStr = atob(envelope.cipherTextBase64);
  const cipherBytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    cipherBytes[i] = binaryStr.charCodeAt(i);
  }

  const key = await getCryptoKey();
  const plainBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipherBytes
  );

  const dec = new TextDecoder();
  const jsonStr = dec.decode(plainBuffer);
  return JSON.parse(jsonStr);
}

/**
 * Open or initialize the browser IndexedDB database
 */
export function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('itemType', 'itemType', { unique: false });
        store.createIndex('siteId', 'siteId', { unique: false });
        store.createIndex('priority', 'priority', { unique: false });
      }
    };

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event: Event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Save a newly buffered item into IndexedDB
 */
export async function saveItemToIndexedDB(item: BufferedQueueItem): Promise<void> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(item);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve all buffered queue items from IndexedDB
 */
export async function getAllBufferedItemsFromIndexedDB(): Promise<BufferedQueueItem[]> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => {
      const items = (req.result as BufferedQueueItem[]) || [];
      // Sort in strict chronological FIFO order
      items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Update an item in IndexedDB
 */
export async function updateItemInIndexedDB(item: BufferedQueueItem): Promise<void> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(item);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Delete an item from IndexedDB
 */
export async function deleteItemFromIndexedDB(id: string): Promise<void> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Clear all acknowledged (SYNCED_HOLDING) items from IndexedDB
 */
export async function clearAcknowledgedFromIndexedDB(): Promise<number> {
  const items = await getAllBufferedItemsFromIndexedDB();
  const db = await openIndexedDB();
  let deletedCount = 0;

  for (const item of items) {
    if (item.status === 'SYNCED_HOLDING') {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(item.id);
        req.onsuccess = () => {
          deletedCount++;
          resolve();
        };
        req.onerror = () => reject(req.error);
      });
    }
  }

  return deletedCount;
}
