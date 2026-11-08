export type ConflictSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type ConflictType =
  | 'CONCURRENT_EDIT'
  | 'VERSION_MISMATCH'
  | 'BUDGET_CEILING_DIVERGENCE'
  | 'DUPLICATE_KEY_COLLISION'
  | 'GATE_STATUS_DESYNC'
  | 'OFFLINE_RECONCILIATION_LAG';

export type ConflictResolutionStatus =
  | 'UNRESOLVED'
  | 'RESOLVED_HOLDING_WINS'
  | 'RESOLVED_BRANCH_WINS'
  | 'RESOLVED_MERGED';

export interface FieldDiff {
  fieldName: string;
  fieldLabelKu: string;
  fieldLabelEn: string;
  holdingValue: any;
  branchValue: any;
  resolvedValue?: any;
}

export interface SyncConflictLog {
  id: string;
  timestamp: string;
  entityType: 'PURCHASE_ORDER' | 'WAREHOUSE_ITEM' | 'GATE_LOG' | 'FINANCE_LEDGER' | 'PROJECT_BUDGET';
  entityId: string;
  entityReference: string;
  holdingNodeName: string;
  holdingLocation: string;
  branchNodeName: string;
  branchLocation: string;
  conflictType: ConflictType;
  severity: ConflictSeverity;
  status: ConflictResolutionStatus;
  descriptionEn: string;
  descriptionKu: string;
  diffs: FieldDiff[];
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface ConflictResolutionPolicy {
  defaultStrategy: 'HOLDING_AUTHORITY' | 'LAST_WRITE_WINS' | 'MANUAL_SUPERVISOR';
  autoResolveMinorDiscrepancies: boolean;
  alertCfoAboveUSD: number;
  quarantineDesyncedNodes: boolean;
}
