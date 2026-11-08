export interface SecurityAuditSummary {
  reportId: string;
  reportDate: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  holdingName: string;
  classification: 'STRICTLY_CONFIDENTIAL' | 'INTERNAL_AUDIT' | 'RESTRICTED';
  securityScore: number; // 0 - 100
  totalAuditedEvents: number;
  unauthorizedBreaches: number;
  syncUptimePercent: number;
  cryptoSealHash: string;
}

export interface SyncConflictAuditItem {
  id: string;
  date: string;
  siteName: string;
  entityType: string;
  entityReference: string;
  conflictType: 'CONCURRENT_EDIT' | 'FIELD_OVERWRITE' | 'VALUE_MISMATCH' | 'BUDGET_CAP_EXCEEDED';
  holdingValue: string;
  branchValue: string;
  resolutionStatus: 'RESOLVED_HOLDING_MASTER' | 'RESOLVED_BRANCH' | 'AUTO_MERGED' | 'UNDER_REVIEW';
  resolutionDurationMin: number;
}

export interface ConnectionStabilityAuditItem {
  siteId: string;
  siteName: string;
  governorate: string;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  uptimePercent: number;
  carrierIsp: string;
  ipRotationsHandled: number;
  packetLossPercent: number;
  status: 'EXCELLENT' | 'STABLE' | 'DEGRADED';
}

export interface LoginAnomalyAuditItem {
  id: string;
  timestamp: string;
  username: string;
  siteLocation: string;
  detectedIp: string;
  carrierIsp: string;
  anomalyType: 
    | 'MULTI_CITY_CONCURRENT_LOGIN'
    | 'FAILED_AUTH_BURST'
    | 'OUT_OF_GEOFENCE_ACCESS'
    | 'UNUSUAL_HOURS_ACCESS'
    | 'PRIVILEGE_ELEVATION_ATTEMPT';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionTaken: 'BLOCKED' | 'CHALLENGED_MFA' | 'QUARANTINED' | 'RESOLVED_LEGITIMATE';
  details: string;
}

export interface CompleteSecurityAuditData {
  summary: SecurityAuditSummary;
  syncConflicts: SyncConflictAuditItem[];
  connectionStability: ConnectionStabilityAuditItem[];
  loginAnomalies: LoginAnomalyAuditItem[];
}
