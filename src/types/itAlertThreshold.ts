import { UserRole } from './erp';
import { HardwareDeviceType, MaintenancePriority, MaintenanceStatus } from './itAssetTracking';

export type HardwareRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type HardwareRiskFactorType =
  | 'OVERDUE_MAINTENANCE'
  | 'STATUS_MAINTENANCE_REQUIRED'
  | 'WARRANTY_EXPIRED_CRITICAL'
  | 'HIGH_POWER_TEMPERATURE_DRAW'
  | 'UNVERIFIED_RELOCATION'
  | 'CRITICAL_INFRASTRUCTURE_EXPOSURE';

export interface HardwareRiskFactor {
  factor: HardwareRiskFactorType;
  points: number;
  labelEn: string;
  labelKu: string;
  detailEn: string;
  detailKu: string;
}

export interface HardwareAlertThresholdPolicy {
  id: string;
  overdueDaysWarningThreshold: number; // e.g., 1 day
  overdueDaysUrgentThreshold: number; // e.g., 5 days
  highRiskScoreThreshold: number; // e.g., 60 points
  criticalRiskScoreThreshold: number; // e.g., 85 points
  autoDispatchToNotificationCenter: boolean;
  notifyOnMaintenanceOverdue: boolean;
  notifyOnHighRiskAsset: boolean;
  notifyOnExpiredCriticalWarranty: boolean;
  targetRolesToNotify: UserRole[]; // e.g., ['PROJECT_MANAGER', 'COMPANY_GM', 'HOLDING_OWNER']
  evaluationIntervalMinutes: number;
  lastEvaluationTimestamp: string;
  updatedBy: string;
}

export interface HardwareRiskEvaluatedAsset {
  assetId: string;
  assetTag: string;
  model: string;
  deviceType: HardwareDeviceType;
  siteId: string;
  siteCode: string;
  siteNameEn: string;
  siteNameKu: string;
  locationRoom: string;
  operationalStatus: string;
  riskScore: number; // 0 to 100
  riskLevel: HardwareRiskLevel;
  isFlaggedHighRisk: boolean;
  riskFactors: HardwareRiskFactor[];
  overdueTicketsCount: number;
  activeOverdueTickets: {
    ticketNumber: string;
    titleEn: string;
    titleKu: string;
    scheduledDate: string;
    daysOverdue: number;
    priority: MaintenancePriority;
  }[];
  warrantyStatus: 'ACTIVE_WARRANTY' | 'EXPIRING_SOON_30D' | 'EXPIRED' | 'EXTENDED_SLA';
  warrantyExpiry: string;
  assignedTechnician: string;
  technicianPhone: string;
  powerWatts: number;
  lastAuditDate: string;
}

export interface GeneratedHardwareAlert {
  id: string;
  alertType: 'OVERDUE_MAINTENANCE' | 'HIGH_RISK_ASSET' | 'EXPIRED_WARRANTY' | 'SURGE_ANOMALY';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  assetId: string;
  assetTag: string;
  model: string;
  siteId: string;
  siteNameEn: string;
  siteNameKu: string;
  titleEn: string;
  titleKu: string;
  messageEn: string;
  messageKu: string;
  riskScore?: number;
  daysOverdue?: number;
  directivesEn: string[];
  directivesKu: string[];
  targetRoles: UserRole[];
  assignedManagerName: string;
  assignedManagerPhone: string;
  dispatchedToNotificationCenter: boolean;
  dispatchedAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolutionNotes?: string;
}

export interface HardwareAlertSystemStatusResponse {
  success: boolean;
  timestamp: string;
  policy: HardwareAlertThresholdPolicy;
  summary: {
    totalAssetsEvaluated: number;
    highRiskAssetsCount: number;
    criticalRiskAssetsCount: number;
    overdueMaintenanceTicketsCount: number;
    activeAlertsCount: number;
    unacknowledgedAlertsCount: number;
    dispatchedToNotificationCenterCount: number;
  };
  highRiskAssets: HardwareRiskEvaluatedAsset[];
  allEvaluatedAssets: HardwareRiskEvaluatedAsset[];
  alerts: GeneratedHardwareAlert[];
}
