export type BufferItemType = 
  | 'APPROVAL_REQUEST' 
  | 'OPERATIONAL_DATA_LOG' 
  | 'FINANCIAL_TRANSACTION' 
  | 'GATE_SECURITY_SCAN'
  | 'WEIGHBRIDGE_TICKET';

export type BufferItemStatus = 
  | 'QUEUED_ENCRYPTED' 
  | 'TRANSMITTING' 
  | 'SYNCED_HOLDING' 
  | 'RETRY_PENDING';

export interface EncryptedPayloadEnvelope {
  cipherTextBase64: string;
  ivHex: string;
  saltHex: string;
  algorithm: 'AES-256-GCM';
  sha256Digest: string;
  keyFingerprint: string;
  encryptedAt: string;
}

export interface BufferedQueueItem {
  id: string;
  queueSequence: number;
  itemType: BufferItemType;
  siteId: string;
  siteNameEn: string;
  siteNameKu: string;
  createdAt: string;
  status: BufferItemStatus;
  priority: 'MISSION_CRITICAL' | 'HIGH' | 'NORMAL';
  titleEn: string;
  titleKu: string;
  requesterName: string;
  requesterRole: string;
  amountUSD?: number;
  entityReference: string;
  encryptedPayload: EncryptedPayloadEnvelope;
  plainTextPreview: {
    reference: string;
    details: string;
    actionType: string;
    metadata?: Record<string, any>;
  };
  syncedAt?: string;
  holdingAckToken?: string;
  retryCount: number;
}

export interface BufferTelemetryStats {
  totalItemsQueued: number;
  approvalsQueuedCount: number;
  logsQueuedCount: number;
  totalEncryptedBytes: number;
  isNetworkOnline: boolean;
  isSimulatedOffline: boolean;
  autoFlushEnabled: boolean;
  lastFlushTimestamp?: string;
  indexedDbStatus: 'INITIALIZED' | 'WRITING' | 'READING' | 'ERROR';
  flushedSuccessfullyCount: number;
}

export interface FlushBatchResult {
  success: boolean;
  flushedCount: number;
  failedCount: number;
  serverTimestamp: string;
  holdingAckTokens: Record<string, string>;
  messageKu: string;
  messageEn: string;
}
