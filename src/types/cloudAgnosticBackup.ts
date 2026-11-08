export type BackupTriggerType = 
  | 'LATENCY_SPIKE_AUTO'
  | 'SCHEDULED_HOURLY'
  | 'MANUAL_ADMIN'
  | 'PRE_SYNC_IMMUTABLE';

export type RepositoryProvider = 
  | 'LOCAL_ENCRYPTED_NVME' 
  | 'S3_COMPATIBLE_WASABI' 
  | 'CLOUDFLARE_R2_AGNOSTIC' 
  | 'ONPREM_AIRGAPPED_NAS' 
  | 'MINIO_PRIVATE_CLUSTER';

export interface CloudRepositoryTarget {
  id: string;
  nameEn: string;
  nameKu: string;
  provider: RepositoryProvider;
  endpointUrl: string;
  storageRegion: string;
  encryptionAlgorithm: 'AES-256-GCM' | 'CHACHA20-POLY1305';
  status: 'ONLINE_ACTIVE' | 'SYNCHRONIZING' | 'STANDBY_READY' | 'MAINTENANCE';
  isSecondaryVault: boolean;
  totalStorageGB: number;
  usedStorageGB: number;
  latencyToTargetMs: number;
  immutabilityWORM: boolean;
  airGappedIsolation: boolean;
}

export interface SnapshotEncryptionEnvelope {
  algorithm: 'AES-256-GCM';
  keyFingerprint: string;
  sha256Checksum: string;
  ivHex: string;
  authTagHex: string;
  cryptoSignature: string;
  signedBy: string;
}

export interface DatabaseSnapshot {
  id: string;
  snapshotNumber: string;
  timestamp: string;
  triggerType: BackupTriggerType;
  triggerReasonKu: string;
  triggerReasonEn: string;
  sourceSite: string;
  latencyTriggerMs?: number;
  primaryRepoId: string;
  secondaryRepoId: string;
  encryption: SnapshotEncryptionEnvelope;
  
  // Entity statistics
  totalEntitiesCount: number;
  purchaseOrdersCount: number;
  inventoryBatchesCount: number;
  ledgerTransactionsCount: number;
  operationalZonesCount: number;
  
  sizeBytes: number;
  sizeFormatted: string;
  status: 'ACTIVE_VERIFIED' | 'REPLICATING' | 'RESTORING' | 'ARCHIVED';
  recoveryPointObjectiveSec: number; // e.g. 0 (Zero Data Loss)
  payloadPreview?: any;
}

export interface BackupSystemConfig {
  autoLatencySnapshotEnabled: boolean;
  latencyThresholdMs: number; // default 140ms
  packetLossThresholdPercent: number; // default 3%
  primaryRepositoryId: string;
  secondaryRepositoryId: string;
  encryptionEnabled: boolean;
  compressionAlgorithm: 'ZSTD_LEVEL_3' | 'GZIP_MAX';
  zeroLossDeltaJournalEnabled: boolean;
  maxRetainedSnapshots: number;
  lastLatencyTriggerTimestamp?: string;
}

export interface ZeroLossRecoveryRecord {
  id: string;
  timestamp: string;
  snapshotId: string;
  snapshotNumber: string;
  recoveredRecordsCount: number;
  replayedDeltaTransactionsCount: number;
  recoveryDurationMs: number;
  dataLossCalculated: '0_BYTES_ZERO_LOSS';
  integrityVerified: boolean;
  restoredBy: string;
  notesKu: string;
  notesEn: string;
}
