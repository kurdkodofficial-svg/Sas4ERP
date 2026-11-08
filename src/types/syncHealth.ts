export type NodeHeartbeatStatus = 
  | 'HEALTHY_PULSE' 
  | 'DEGRADED_LATENCY' 
  | 'STALE_WARNING' 
  | 'OFFLINE_BLACKOUT' 
  | 'LOCAL_EDGE_ACTIVE';

export type SyncQueueStatus = 
  | 'DRAINED_IDLE' 
  | 'SYNCING_ACTIVE' 
  | 'ACCUMULATING_BACKLOG' 
  | 'BLOCKED_ERROR';

export type OfflineBufferHealth = 
  | 'EMPTY_SYNCED' 
  | 'LIGHT_CACHED' 
  | 'HEAVY_BUFFERED' 
  | 'OVERFLOW_RISK';

export type SyncJobPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export interface SyncJobItem {
  id: string;
  jobCode: string;
  targetEntity: 
    | 'PURCHASE_ORDER' 
    | 'INVENTORY_DISPATCH' 
    | 'PAYROLL_BATCH' 
    | 'WEIGHBRIDGE_LOG' 
    | 'SECURITY_ANOMALY'
    | 'INTERCOMPANY_LEDGER';
  direction: 'OUTBOUND_PUSH' | 'INBOUND_PULL' | 'BIDIRECTIONAL_MERGE';
  titleEn: string;
  titleKu: string;
  priority: SyncJobPriority;
  payloadSizeBytes: number;
  queuedAt: string;
  retryCount: number;
  status: 'PENDING' | 'IN_FLIGHT' | 'COMPLETED' | 'FAILED';
  payloadSummary?: string;
}

export interface NodeBufferCacheSummary {
  health: OfflineBufferHealth;
  totalPendingCount: number;
  approvalsCount: number;
  logsCount: number;
  totalSizeBytes: number;
  sizeFormatted: string;
  storageEngine: 'INDEXED_DB_AES_GCM' | 'LOCAL_SQLITE_EDGE' | 'VOLATILE_RAM';
  encryptionVerified: boolean;
  oldestPendingTimestamp: string | null;
  lastFlushedAt: string | null;
}

export interface NodeHeartbeatTelemetry {
  status: NodeHeartbeatStatus;
  lastHeartbeatAt: string;
  secondsSincePing: number;
  latencyMs: number;
  jitterMs: number;
  packetLossPercent: number;
  carrierIsp: string;
  connectionType: 'FIBER_FTTH' | '4G_LTE' | 'WIRELESS_TOWER' | 'SATELLITE_VSAT' | 'LOCAL_LOOPBACK';
  publicIp: string;
  dynamicIpRotationsCount: number;
  uptimePercent30d: number;
}

export interface SyncHealthNode {
  nodeId: string;
  siteCode: string;
  siteNameEn: string;
  siteNameKu: string;
  regionEn: string;
  regionKu: string;
  nodeType: 
    | 'CENTRAL_HQ_HUB' 
    | 'REMOTE_PRODUCTION_SITE' 
    | 'REMOTE_WAREHOUSE_DEPOT' 
    | 'BORDER_GATEWAY' 
    | 'LOCAL_CLIENT_EDGE';
  isLocalNode: boolean;
  heartbeat: NodeHeartbeatTelemetry;
  bufferCache: NodeBufferCacheSummary;
  syncQueue: {
    status: SyncQueueStatus;
    queueDepth: number;
    inFlightJobsCount: number;
    estimatedDrainTimeSeconds: number;
    pendingJobs: SyncJobItem[];
  };
  overallHealthScore: number;
  isSimulatedGlitch: boolean;
  notesKu?: string;
  notesEn?: string;
}

export interface SyncHealthOverviewKPIs {
  totalNodes: number;
  onlineNodes: number;
  degradedNodes: number;
  offlineNodes: number;
  fleetHealthScore: number;
  totalFleetBufferPendingItems: number;
  totalFleetBufferSizeBytes: number;
  totalFleetBufferSizeFormatted: string;
  totalPendingSyncJobs: number;
  avgLatencyMs: number;
  lastFleetHeartbeatSweep: string;
}
