export type AnomalyCategory = 'PROCUREMENT' | 'FINANCIAL' | 'ATTENDANCE';

export type AnomalySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type AnomalyStatus = 
  | 'TRIGGERED' 
  | 'INVESTIGATING' 
  | 'CONFIRMED_IRREGULARITY' 
  | 'RESOLVED' 
  | 'DISMISSED';

export type MLSensitivityLevel = 'STRICT' | 'STANDARD' | 'RELAXED';

export type ERPLogType = 
  | 'PURCHASE_ORDER'
  | 'FINANCE_LEDGER'
  | 'ATTENDANCE_CHECKIN'
  | 'GATE_ENTRY'
  | 'VENDOR_INVOICE'
  | 'PAYROLL_DISBURSEMENT';

export interface ERPLogEntry {
  id: string;
  timestamp: string;
  logType: ERPLogType;
  category: AnomalyCategory;
  companyId: string;
  companyName: string;
  projectId?: string;
  projectName?: string;
  actorName: string;
  actorRole: string;
  action: string;
  amountUSD?: number;
  expectedBaselineUSD?: number;
  location?: string;
  deviceOrIp?: string;
  targetEntity?: string;
  metadata?: Record<string, any>;
  anomalyScore?: number;
}

export interface AnomalyFeatureContribution {
  featureName: string;
  featureNameKu: string;
  observedValue: string | number;
  expectedRange: string;
  zScore: number;
  weight: number; // 0.0 to 1.0
  severityImpact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MLAnomalyAlert {
  id: string;
  title: string;
  titleKu: string;
  titleAr: string;
  category: AnomalyCategory;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  score: number; // 0 - 100 anomaly score
  confidence: number; // 0.0 to 1.0 (e.g. 0.94)
  algorithmUsed: string; // e.g. "Isolation Forest + Robust MAD Z-Score"
  detectedAt: string;
  companyId: string;
  companyName: string;
  projectId?: string;
  projectName?: string;
  triggerLogId: string;
  
  description: string;
  descriptionKu: string;
  descriptionAr: string;
  
  rootCauseHypothesis: string;
  rootCauseHypothesisKu: string;
  
  featuresContributing: AnomalyFeatureContribution[];
  
  relatedEntityId?: string; // e.g. poId, employeeId, voucherNo
  relatedEntityType?: 'PURCHASE_ORDER' | 'EMPLOYEE' | 'FINANCE_VOUCHER' | 'SUPPLIER';
  
  recommendedActions: string[];
  recommendedActionsKu: string[];
  
  actionTaken?: string;
  executiveDecisionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  
  aiForensicReport?: {
    diagnosisText: string;
    diagnosisTextKu?: string;
    riskVector: string;
    immediateMitigation: string;
    generatedAt: string;
  };
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  companyId: string;
  companyName: string;
  projectId?: string;
  projectName?: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  siteLocation: string;
  deviceType: 'BIOMETRIC_THUMBPRINT' | 'FACIAL_RECOGNITION' | 'RFID_GATE' | 'MOBILE_GPS';
  workHours: number;
  overtimeHours: number;
  status: 'NORMAL' | 'IRREGULAR_HOURS' | 'IMPOSSIBLE_TRANSIT' | 'EXCESSIVE_OVERTIME' | 'OFF_HOURS_SITE';
  anomalyFlag?: boolean;
}

export interface AnomalyEngineStats {
  totalLogsAnalyzed: number;
  totalAlertsTriggered: number;
  criticalAlertsCount: number;
  highAlertsCount: number;
  mediumAlertsCount: number;
  financialRiskPreventedUSD: number;
  procurementAnomaliesCount: number;
  financialAnomaliesCount: number;
  attendanceAnomaliesCount: number;
  modelConfidenceAverage: number;
  lastScanTimestamp: string;
}
