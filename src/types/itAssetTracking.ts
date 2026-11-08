export type HardwareDeviceType =
  | 'SERVER'
  | 'GATE_SCANNER'
  | 'ROUTER_GATEWAY'
  | 'FIREWALL'
  | 'NETWORK_SWITCH'
  | 'WEIGHBRIDGE_TERMINAL'
  | 'BIOMETRIC_ATTENDANCE'
  | 'CCTV_SURVEILLANCE'
  | 'WORKSTATION';

export type HardwareOperationalStatus =
  | 'OPERATIONAL_ACTIVE'
  | 'MAINTENANCE_REQUIRED'
  | 'PROVISIONING'
  | 'STANDBY_BACKUP'
  | 'DECOMMISSIONED'
  | 'CHECKED_OUT';

export type MaintenanceType =
  | 'SCHEDULED_INSPECTION'
  | 'REPAIR_TICKET'
  | 'PREVENTATIVE_CLEANING'
  | 'FIRMWARE_SECURITY_PATCH'
  | 'WARRANTY_RMA_CLAIM'
  | 'EMERGENCY_BREAKDOWN';

export type MaintenanceStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'CANCELLED';

export type MaintenancePriority =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export interface HardwareAssetQRCodePayload {
  qrPayloadVersion: string;
  assetTag: string;
  serialNumber: string;
  model: string;
  deviceType: HardwareDeviceType;
  siteId: string;
  siteCode: string;
  siteNameEn: string;
  siteNameKu: string;
  macAddress: string;
  ipAddress: string;
  registeredDate: string;
  digitalSecuritySeal: string;
}

export interface HardwareRelocationLog {
  id: string;
  timestamp: string;
  fromSiteId: string;
  fromSiteName: string;
  toSiteId: string;
  toSiteName: string;
  reason: string;
  technicianName: string;
  verifiedViaQR: boolean;
}

export interface HardwareCheckoutLog {
  id: string;
  timestamp: string;
  checkedOutTo: string;
  technicianPhone: string;
  destinationSiteId: string;
  destinationSiteName: string;
  purpose: 'FIELD_MAINTENANCE' | 'CLIENT_SITE_DEPLOYMENT' | 'EMERGENCY_SPARE_SWAP' | 'SYSTEMS_UPGRADE' | 'TEMPORARY_TESTING';
  expectedReturnDate: string;
  authorizedBy: string;
  status: 'ACTIVE' | 'RETURNED';
  returnTimestamp?: string;
  notes?: string;
}

export interface HardwareAssetRecord {
  id: string;
  assetTag: string;
  deviceType: HardwareDeviceType;
  model: string;
  manufacturer: string;
  serialNumber: string;
  macAddress: string;
  ipAddress: string;
  status: HardwareOperationalStatus;
  assignedSiteId: string;
  assignedSiteCode: string;
  assignedSiteNameEn: string;
  assignedSiteNameKu: string;
  locationRoom: string;
  assignedTechnician: string;
  technicianPhone: string;
  installDate: string;
  lastAuditDate: string;
  warrantyExpiry: string;
  warrantyProvider?: string;
  warrantyStatus?: 'ACTIVE_WARRANTY' | 'EXPIRING_SOON_30D' | 'EXPIRED' | 'EXTENDED_SLA';
  nextInspectionDueDate?: string;
  specsSummaryEn: string;
  specsSummaryKu: string;
  powerSupplyWatts: number;
  qrCodeDataUrl: string;
  qrPayload: HardwareAssetQRCodePayload;
  relocationHistory: HardwareRelocationLog[];
  currentCheckout?: HardwareCheckoutLog;
  checkoutHistory?: HardwareCheckoutLog[];
  notesEn?: string;
  notesKu?: string;
}

export interface HardwareMaintenanceRecord {
  id: string;
  ticketNumber: string;
  assetId: string;
  assetTag: string;
  assetModel: string;
  deviceType: HardwareDeviceType;
  siteId: string;
  siteNameEn: string;
  siteNameKu: string;
  maintenanceType: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  scheduledDate: string; // YYYY-MM-DD
  completedDate?: string;
  technicianName: string;
  technicianPhone: string;
  serviceProvider: 'INTERNAL_HOLDING_IT' | 'MANUFACTURER_DELL_PROSUPPORT' | 'CISCO_SMARTNET' | 'LOCAL_AUTHORIZED_VENDOR' | 'HIKVISION_SERVICE_CENTER';
  warrantyCovered: boolean;
  costUSD: number;
  titleEn: string;
  titleKu: string;
  descriptionEn: string;
  descriptionKu: string;
  partsReplaced: string[];
  findingsAndOutcomeEn?: string;
  findingsAndOutcomeKu?: string;
  nextInspectionDueDate?: string;
  attachmentsCount?: number;
  verifiedByAdmin?: string;
}

export interface HardwareWarrantyMatrixItem {
  assetId: string;
  assetTag: string;
  deviceType: HardwareDeviceType;
  model: string;
  manufacturer: string;
  assignedSiteId: string;
  assignedSiteNameEn: string;
  assignedSiteNameKu: string;
  installDate: string;
  warrantyExpiry: string;
  daysRemaining: number;
  warrantyStatus: 'ACTIVE_WARRANTY' | 'EXPIRING_SOON_30D' | 'EXPIRED' | 'EXTENDED_SLA';
  warrantyProvider: string;
  rmaClaimEligible: boolean;
  totalRepairTicketsCount: number;
  lastServiceDate?: string;
}

export interface MaintenanceOverviewKPIs {
  totalMaintenanceRecords: number;
  scheduledUpcomingCount: number;
  overdueInspectionsCount: number;
  completedThisYearCount: number;
  underWarrantyPercent: number;
  activeWarrantyCount: number;
  expiringSoonWarrantyCount: number;
  expiredWarrantyCount: number;
  totalRepairSpendUSD: number;
}

export interface SiteHardwareSummary {
  siteId: string;
  siteCode: string;
  siteNameEn: string;
  siteNameKu: string;
  totalAssets: number;
  serversCount: number;
  gateScannersCount: number;
  routersCount: number;
  operationalCount: number;
  maintenanceCount: number;
}
