/**
 * SAS4ERP Real-Time Holding Cloud Synchronization Service
 * 
 * Automatically synchronizes multi-laptop deployments belonging to the same Holding
 * across geographic locations (e.g. Erbil HQ <---> Halabja Project Site).
 * 
 * Features:
 * 1. Automatic Holding Key pairing & validation
 * 2. Real-time Server-Sent Events (SSE) push/pull stream
 * 3. Bidirectional delta/snapshot state replication
 * 4. Active Peer Heartbeat & laptop device presence tracker
 * 5. Offline outbox with auto-flush on reconnect
 */

export interface SyncNodeDevice {
  nodeId: string;
  nodeName: string;
  location: string;
  role: 'HOLDING_HQ' | 'BRANCH_PROJECT' | 'FIELD_OFFICE' | 'PEER';
  lastPing: string;
  ipAddress?: string;
  isCurrentDevice?: boolean;
}

export interface HoldingCloudSyncStatus {
  connected: boolean;
  holdingKey: string;
  version: number;
  lastSyncTime: string | null;
  lastSyncBy: string | null;
  activeLaptops: SyncNodeDevice[];
  isSyncing: boolean;
  pendingChangesCount: number;
  connectionMode: 'LIVE_CLOUD' | 'CONNECTING' | 'OFFLINE_RETRY';
}

const STORAGE_SYNC_KEY = 'sas4erp_holding_sync_key';
const STORAGE_NODE_ID = 'sas4erp_sync_node_id';
const STORAGE_NODE_NAME = 'sas4erp_sync_node_name';
const STORAGE_NODE_LOCATION = 'sas4erp_sync_node_location';
const STORAGE_NODE_ROLE = 'sas4erp_sync_node_role';
const STORAGE_OFFLINE_OUTBOX = 'sas4erp_cloud_sync_outbox';

class HoldingCloudSyncService {
  private holdingKey: string = 'HLD-KEY-2026-HQ-ERBIL';
  private nodeId: string = '';
  private nodeName: string = 'Erbil HQ Executive Hub (خاوەنی هۆڵدینگ)';
  private nodeLocation: string = 'Erbil - World Trade Center';
  private nodeRole: 'HOLDING_HQ' | 'BRANCH_PROJECT' | 'FIELD_OFFICE' | 'PEER' = 'HOLDING_HQ';
  
  private eventSource: EventSource | null = null;
  private pingInterval: any = null;
  private pushDebounceTimer: any = null;
  private isPushing: boolean = false;
  private pendingUpdates: Record<string, any> = {};

  private statusSubscribers: Set<(status: HoldingCloudSyncStatus) => void> = new Set();
  private remoteUpdateSubscribers: Set<(remoteState: any, meta: { version: number; updatedBy: string }) => void> = new Set();

  private status: HoldingCloudSyncStatus = {
    connected: false,
    holdingKey: 'HLD-KEY-2026-HQ-ERBIL',
    version: 1,
    lastSyncTime: null,
    lastSyncBy: null,
    activeLaptops: [],
    isSyncing: false,
    pendingChangesCount: 0,
    connectionMode: 'CONNECTING',
  };

  constructor() {
    this.initNodeProfile();
  }

  private initNodeProfile() {
    if (typeof window === 'undefined') return;

    // Load or generate holdingKey
    const savedKey = localStorage.getItem(STORAGE_SYNC_KEY);
    if (savedKey) {
      this.holdingKey = savedKey;
    } else {
      localStorage.setItem(STORAGE_SYNC_KEY, this.holdingKey);
    }

    // Load or generate nodeId
    let savedNodeId = localStorage.getItem(STORAGE_NODE_ID);
    if (!savedNodeId) {
      savedNodeId = 'lap-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
      localStorage.setItem(STORAGE_NODE_ID, savedNodeId);
    }
    this.nodeId = savedNodeId;

    // Load or detect node profile
    const savedName = localStorage.getItem(STORAGE_NODE_NAME);
    if (savedName) this.nodeName = savedName;

    const savedLoc = localStorage.getItem(STORAGE_NODE_LOCATION);
    if (savedLoc) this.nodeLocation = savedLoc;

    const savedRole = localStorage.getItem(STORAGE_NODE_ROLE) as any;
    if (savedRole) this.nodeRole = savedRole;

    this.status.holdingKey = this.holdingKey;
  }

  public getStatus(): HoldingCloudSyncStatus {
    return { ...this.status };
  }

  public getNodeProfile() {
    return {
      nodeId: this.nodeId,
      nodeName: this.nodeName,
      location: this.nodeLocation,
      role: this.nodeRole,
      holdingKey: this.holdingKey,
    };
  }

  public setNodeProfile(profile: {
    nodeName?: string;
    location?: string;
    role?: 'HOLDING_HQ' | 'BRANCH_PROJECT' | 'FIELD_OFFICE' | 'PEER';
    holdingKey?: string;
  }) {
    if (profile.holdingKey && profile.holdingKey !== this.holdingKey) {
      this.holdingKey = profile.holdingKey.trim().toUpperCase();
      localStorage.setItem(STORAGE_SYNC_KEY, this.holdingKey);
      this.status.holdingKey = this.holdingKey;
      // Reconnect with new key
      this.connect();
    }

    if (profile.nodeName) {
      this.nodeName = profile.nodeName;
      localStorage.setItem(STORAGE_NODE_NAME, profile.nodeName);
    }
    if (profile.location) {
      this.nodeLocation = profile.location;
      localStorage.setItem(STORAGE_NODE_LOCATION, profile.location);
    }
    if (profile.role) {
      this.nodeRole = profile.role;
      localStorage.setItem(STORAGE_NODE_ROLE, profile.role);
    }

    this.notifyStatus();
  }

  public onStatusChange(callback: (status: HoldingCloudSyncStatus) => void): () => void {
    this.statusSubscribers.add(callback);
    callback(this.getStatus());
    return () => {
      this.statusSubscribers.delete(callback);
    };
  }

  public onRemoteUpdate(callback: (remoteState: any, meta: { version: number; updatedBy: string }) => void): () => void {
    this.remoteUpdateSubscribers.add(callback);
    return () => {
      this.remoteUpdateSubscribers.delete(callback);
    };
  }

  private notifyStatus() {
    const current = this.getStatus();
    this.statusSubscribers.forEach((cb) => cb(current));
  }

  /**
   * Connect to Holding Cloud Hub & initialize SSE Stream
   */
  public async connect(): Promise<boolean> {
    try {
      this.status.connectionMode = 'CONNECTING';
      this.notifyStatus();

      // Close existing SSE stream if any
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }

      // Handshake with server
      const res = await fetch('/api/sync/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdingKey: this.holdingKey,
          nodeId: this.nodeId,
          nodeName: this.nodeName,
          location: this.nodeLocation,
          role: this.nodeRole,
        }),
      });

      if (!res.ok) {
        throw new Error(`Sync connect HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        this.status.connected = true;
        this.status.connectionMode = 'LIVE_CLOUD';
        this.status.version = data.storeVersion || 1;
        this.status.lastSyncTime = new Date().toISOString();

        // Map active laptops
        if (Array.isArray(data.connectedNodes)) {
          this.status.activeLaptops = data.connectedNodes.map((n: any) => ({
            ...n,
            isCurrentDevice: n.nodeId === this.nodeId,
          }));
        }

        // Start real-time SSE listener
        this.startSSE();

        // Start ping loop
        this.startPing();

        // Flush any offline outbox
        this.flushOfflineOutbox();

        this.notifyStatus();
        return true;
      }
    } catch (err) {
      console.warn('Holding Cloud Sync connect failed, falling back to offline retry mode:', err);
      this.status.connected = false;
      this.status.connectionMode = 'OFFLINE_RETRY';
      this.notifyStatus();
    }
    return false;
  }

  /**
   * Start Server-Sent Events (SSE) stream for instantaneous remote updates
   */
  private startSSE() {
    try {
      const sseUrl = `/api/sync/events?key=${encodeURIComponent(this.holdingKey)}&nodeId=${encodeURIComponent(this.nodeId)}&nodeName=${encodeURIComponent(this.nodeName)}&location=${encodeURIComponent(this.nodeLocation)}`;
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        this.status.connected = true;
        this.status.connectionMode = 'LIVE_CLOUD';
        this.notifyStatus();
      };

      this.eventSource.onmessage = async (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'HANDSHAKE') {
            this.status.version = payload.version;
            this.notifyStatus();
          } else if (payload.type === 'STATE_UPDATED') {
            // New updates pushed by another laptop (e.g. Halabja or Erbil)
            this.status.version = payload.version;
            this.status.lastSyncBy = payload.updatedBy;
            this.status.lastSyncTime = payload.lastUpdated || new Date().toISOString();
            
            // Pull full state snapshot from cloud
            await this.pullLatestState();
          }
        } catch (e) {
          console.error('Error processing sync SSE message:', e);
        }
      };

      this.eventSource.onerror = () => {
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          this.status.connected = false;
          this.status.connectionMode = 'OFFLINE_RETRY';
          this.notifyStatus();
        }
      };
    } catch (e) {
      console.warn('Failed to initialize SSE EventSource:', e);
    }
  }

  /**
   * Heartbeat ping to server
   */
  private startPing() {
    this.pingInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/sync/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            holdingKey: this.holdingKey,
            nodeId: this.nodeId,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.activeNodes) {
            this.status.activeLaptops = data.activeNodes.map((n: any) => ({
              ...n,
              isCurrentDevice: n.nodeId === this.nodeId,
            }));
            this.notifyStatus();
          }
        }
      } catch (err) {
        // network silent
      }
    }, 25000);
  }

  /**
   * Pull latest snapshot from Cloud Store and pass to subscribers
   */
  public async pullLatestState(): Promise<any> {
    try {
      this.status.isSyncing = true;
      this.notifyStatus();

      const res = await fetch(`/api/sync/pull?key=${encodeURIComponent(this.holdingKey)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.state) {
          this.status.version = data.version;
          this.status.lastSyncTime = data.lastUpdated || new Date().toISOString();
          this.status.lastSyncBy = data.lastUpdatedByNode;

          if (Array.isArray(data.connectedNodes)) {
            this.status.activeLaptops = data.connectedNodes.map((n: any) => ({
              ...n,
              isCurrentDevice: n.nodeId === this.nodeId,
            }));
          }

          // Trigger state listeners
          this.remoteUpdateSubscribers.forEach((cb) => {
            cb(data.state, {
              version: data.version,
              updatedBy: data.lastUpdatedByNode || 'Remote Laptop',
            });
          });

          return data.state;
        }
      }
    } catch (err) {
      console.error('Failed to pull holding cloud state:', err);
    } finally {
      this.status.isSyncing = false;
      this.notifyStatus();
    }
    return null;
  }

  /**
   * Schedule debounced auto-push whenever local state changes in ERP
   */
  public schedulePush(stateChunk: Record<string, any>) {
    this.pendingUpdates = {
      ...this.pendingUpdates,
      ...stateChunk,
    };
    this.status.pendingChangesCount = Object.keys(this.pendingUpdates).length;
    this.notifyStatus();

    if (this.pushDebounceTimer) {
      clearTimeout(this.pushDebounceTimer);
    }

    this.pushDebounceTimer = setTimeout(() => {
      this.executePush();
    }, 900);
  }

  /**
   * Immediately execute push to Cloud Store
   */
  public async executePush(): Promise<boolean> {
    if (this.isPushing) return false;
    const toSend = { ...this.pendingUpdates };
    if (Object.keys(toSend).length === 0) return true;

    try {
      this.isPushing = true;
      this.status.isSyncing = true;
      this.notifyStatus();

      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdingKey: this.holdingKey,
          nodeId: this.nodeId,
          nodeName: this.nodeName,
          stateUpdates: toSend,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          this.pendingUpdates = {};
          this.status.pendingChangesCount = 0;
          this.status.version = data.version;
          this.status.lastSyncTime = data.lastUpdated;
          this.status.lastSyncBy = `${this.nodeName} (ئەم لاپتۆپە)`;
          this.notifyStatus();
          return true;
        }
      } else {
        throw new Error(`Push HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('Sync push failed, saving to offline outbox:', err);
      this.saveToOfflineOutbox(toSend);
      this.status.connectionMode = 'OFFLINE_RETRY';
      this.notifyStatus();
    } finally {
      this.isPushing = false;
      this.status.isSyncing = false;
      this.notifyStatus();
    }
    return false;
  }

  private saveToOfflineOutbox(chunk: Record<string, any>) {
    try {
      const raw = localStorage.getItem(STORAGE_OFFLINE_OUTBOX);
      const existing = raw ? JSON.parse(raw) : {};
      const merged = { ...existing, ...chunk };
      localStorage.setItem(STORAGE_OFFLINE_OUTBOX, JSON.stringify(merged));
    } catch (e) {
      console.error('Error saving to offline sync outbox:', e);
    }
  }

  private async flushOfflineOutbox() {
    try {
      const raw = localStorage.getItem(STORAGE_OFFLINE_OUTBOX);
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (Object.keys(cached).length > 0) {
        this.schedulePush(cached);
        localStorage.removeItem(STORAGE_OFFLINE_OUTBOX);
      }
    } catch (e) {
      console.error('Error flushing offline sync outbox:', e);
    }
  }

  public disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.status.connected = false;
    this.notifyStatus();
  }
}

export const holdingCloudSyncService = new HoldingCloudSyncService();
