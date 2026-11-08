export type Language = 'en' | 'ku' | 'ar';
export * from './workflow';
import { TransactionType, WorkflowRequestState } from './workflow';

export type UserRole = 
  | 'HOLDING_OWNER'
  | 'SUPER_ADMIN'
  | 'COMPANY_GM'
  | 'PROJECT_MANAGER'
  | 'EMPLOYEE'
  | 'FINANCE_HEAD'
  | 'WAREHOUSE_OFFICER'
  | 'SECURITY_GATE'
  | 'HR_MANAGER'
  | 'HSE_OFFICER'
  | 'TECHNICAL_HEAD';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  companyId?: string;
  projectId?: string;
  email: string;
  avatar: string;
  phone: string;
  nativeLanguage: Language;
  title: string;
  accessibleModules?: string[]; // Specific module IDs this user is authorized to access
}

export type DepartmentCategory = 
  | 'ENGINEERING'
  | 'FINANCE'
  | 'PROCUREMENT'
  | 'HSE_SECURITY'
  | 'HR_LABOR'
  | 'QUALITY_CONTROL'
  | 'LEGAL_CONTRACTS'
  | 'WAREHOUSE_LOGISTICS'
  | 'SITE_OPERATIONS';

export interface DepartmentOverview {
  id: string;
  category: DepartmentCategory;
  name: string;
  nameKu: string;
  nameAr: string;
  headName: string;
  headTitle: string;
  headPhone: string;
  headEmail: string;
  staffCount: number;
  healthScore: number; // 0-100%
  activeTasksCount: number;
  pendingMemosCount: number;
  budgetAllocatedUSD: number;
  budgetSpentUSD: number;
  statusSummary: string;
  statusSummaryKu: string;
  keyResponsibilitiesKu: string[];
  recentMilestoneKu?: string;
  holdingSupervisionActive: boolean;
  reportsTo: string; // 'Project Manager' or 'Company General Manager'
  code?: string;
  headRole?: string;
  status?: string;
  iconName?: string;
  linkedToEntity?: 'HOLDING_HQ' | 'COMPANY_HQ' | 'PROJECT';
  linkedTargetName?: string;
  isForeignAffairsDept?: boolean;
}

export interface ProjectAccommodationDetails {
  campId?: string;
  campName: string;
  campNameKu?: string;
  location: string;
  type: 'ENGINEERS_RESIDENCE' | 'WORKERS_CAMP' | 'VIP_GUESTHOUSE';
  totalBeds: number;
  occupiedBeds: number;
  supervisorName: string;
  supervisorPhone: string;
  facilities: string[];
  blockName?: string;
}

export type ProjectReportType = 'WEEKLY' | 'MONTHLY';

export type ProjectReportStatus =
  | 'DRAFT'
  | 'PM_SIGNED'
  | 'SCANNED_AND_ATTACHED'
  | 'SUBMITTED_TO_UPPER_MANAGEMENT'
  | 'REVIEWED_BY_GM'
  | 'APPROVED_BY_HOLDING';

export interface ProjectPeriodicReport {
  id: string;
  reportNumber: string; // e.g., REP-WK-2026-001 or REP-MO-2026-09
  projectId: string;
  projectName: string;
  projectNameKu?: string;
  companyId: string;
  companyName?: string;
  reportType: ProjectReportType;
  periodLabel: string;
  periodLabelKu: string;
  dateCreated: string;
  
  // Executive summary & KPIs
  executiveSummaryKu: string;
  executiveSummaryEn?: string;
  progressPercentage: number;
  progressDelta: number; // e.g. +4.2%
  budgetSpentThisPeriodUSD: number;
  totalBudgetSpentUSD: number;
  engineersCount: number;
  localWorkersCount: number;
  foreignWorkersCount: number;
  hseIncidentsCount: number;
  keyMilestonesKu: string[];
  challengesAndNeedsKu: string[];

  // Project Manager Signature Workflow
  projectManagerName: string;
  pmSignatureDate?: string;
  pmSignatureDataUrl?: string;
  isPmSigned: boolean;

  // Physical Paper Scan Upload & Verification Workflow
  scannedDocumentUrl?: string;
  scannedFileName?: string;
  scannedFileSize?: string;
  scannedUploadedAt?: string;
  isScanVerified: boolean;

  // Upper Management Submission & Approval
  status: ProjectReportStatus;
  submittedToUpperAt?: string;
  gmReviewedBy?: string;
  gmReviewedAt?: string;
  gmNotesKu?: string;
  holdingApprovedBy?: string;
  holdingApprovalDate?: string;
  holdingOwnerNotesKu?: string;
}

export interface HoldingGroup {
  id: string;
  name: string;
  nameKu?: string;
  nameAr?: string;
  legalRegistration: string;
  foundedYear: number;
  headquarters: string;
  chairmanName: string;
  totalCompanies: number;
  totalProjects: number;
  totalEmployees: number;
  totalBudgetUSD: number;
  totalRevenueUSD: number;
  totalExpensesUSD: number;
  logoUrl?: string;
  isConfigured: boolean;
  systemPlatformName?: string; // 'SAS4ERP'
  defaultSignatureUrl?: string; // Holding Owner electronic signature
  defaultSealUrl?: string; // Holding corporate seal
}

export interface ExecutiveSignatureProfile {
  id: string;
  name: string;
  role: 'HOLDING_OWNER' | 'GENERAL_MANAGER' | 'FINANCE_DIRECTOR' | 'PROJECT_MANAGER' | 'CHIEF_AUDITOR';
  signatureType: 'DRAWN' | 'TYPED' | 'UPLOADED';
  signatureDataUrl: string; // base64 PNG
  officialSealDataUrl?: string; // base64 PNG seal
  digitalCertHash: string;
  createdDate: string;
  isActive: boolean;
}

export interface PrinterDeviceConfig {
  id: string;
  name: string;
  type: 'STANDARD_A4' | 'THERMAL_80MM' | 'THERMAL_58MM' | 'NETWORK_IP';
  ipAddress?: string;
  port?: number;
  isDefault: boolean;
  status: 'ONLINE' | 'STANDBY' | 'DISCONNECTED';
  autoPrintOnApproval: boolean;
  paperSize: 'A4' | 'Letter' | '80mm' | '58mm';
  copies: number;
}

export interface GeneralManagerProfile {
  id: string;
  fullName: string;
  fullNameKu?: string;
  fullNameAr?: string;
  title: string;
  assignedCompanyId?: string; // which company or division they lead
  assignedCompanyName?: string;
  phone: string;
  email: string;
  avatar: string;
  status: 'ACTIVE' | 'ON_MISSION' | 'IN_MEETING' | 'OFFLINE';
  kpiHealthScore: number; // 0 - 100%
  completedMilestones: number;
  totalAssignedTasks: number;
  pendingApprovalsCount: number;
  latestAchievementKu: string;
  latestAchievementEn: string;
  currentWorkSummaryKu: string;
  currentWorkSummaryEn: string;
  directReportsCount: number;
  allocatedBudgetUSD: number;
  spentBudgetUSD: number;
  joinDate: string;
  lastActive: string;
}

export interface Company {
  id: string;
  name: string;
  nameKu?: string;
  nameAr?: string;
  code: string;
  industry: string;
  generalManager: string;
  gmPhone: string;
  gmEmail: string;
  location: string;
  annualBudgetUSD: number;
  spentUSD: number;
  activeProjectsCount: number;
  employeeCount: number;
  establishedDate: string;
  color: string;
  iconName: string;
  holdingLinkStatus?: 'CONNECTED_LIVE' | 'SYNCED' | 'MAINTENANCE';
  holdingConnectionId?: string;
  isHoldingOwnerApproved?: boolean;
  logoUrl?: string;
  departments?: DepartmentOverview[];
}

export type SubProjectPhase = 
  | 'EXCAVATION_FOUNDATION'
  | 'CONCRETE_SUPERSTRUCTURE'
  | 'STEEL_FRAMING'
  | 'MEP_HVAC_ELECTRICAL'
  | 'FACADE_CLADDING'
  | 'INTERIOR_FINISHING'
  | 'INFRASTRUCTURE_ROADS'
  | 'LANDSCAPING'
  | 'TESTING_COMMISSIONING'
  | 'FINAL_INSPECTION';

export interface SubProject {
  id: string;
  projectId: string;
  name: string;
  nameKu: string;
  nameAr?: string;
  phase: SubProjectPhase;
  phaseKu?: string;
  phaseAr?: string;
  manager: string;
  managerPhone?: string;
  startDate: string; // YYYY-MM-DD
  targetCompletionDate: string; // YYYY-MM-DD
  progressPercentage: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DELAYED' | 'PLANNING' | 'ON_HOLD';
  budgetUSD: number;
  spentUSD: number;
  assignedEngineersCount?: number;
  assignedWorkersCount?: number;
  criticalPath?: boolean;
  notesKu?: string;
  notesAr?: string;
  dependencies?: string[]; // IDs of predecessor sub-projects
}

export interface Project {
  id: string;
  companyId: string;
  name: string;
  nameKu?: string;
  nameAr?: string;
  code: string;
  manager: string;
  managerPhone: string;
  budgetUSD: number;
  spentUSD: number;
  startDate: string;
  targetCompletionDate: string;
  progressPercentage: number;
  location: string;
  engineersCount: number;
  workersCount: number;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'PLANNING';
  holdingLinkStatus?: 'CONNECTED_LIVE' | 'SYNCED' | 'MAINTENANCE';
  holdingConnectionId?: string;
  departments?: DepartmentOverview[];
  accommodationDetails?: ProjectAccommodationDetails;
  subProjects?: SubProject[];
}

export interface PurchaseItem {
  id: string;
  name: string;
  nameKu?: string;
  nameAr?: string;
  quantity: number;
  unit: string;
  unitPriceUSD: number;
  totalUSD: number;
  category: string;
}

export type POStatus = 
  | 'DRAFT'
  | 'PENDING_OWNER_APPROVAL'
  | 'APPROVED_BY_OWNER'
  | 'REJECTED_BY_OWNER'
  | 'ARRIVED_AT_GATE'
  | 'INSPECTED_AND_STORED'
  | 'FINANCIALLY_SETTLED';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  companyId: string;
  projectId?: string;
  requestedBy: string;
  requesterRole: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotalUSD: number;
  taxUSD: number;
  totalAmountUSD: number;
  currency: 'USD' | 'IQD' | 'EUR';
  purpose: string;
  originalLanguage: Language;
  createdDate: string;
  status: POStatus;
  transactionType?: TransactionType;
  workflowState?: WorkflowRequestState;
  holdingApproval?: {
    approvedBy: string;
    approvedAt: string;
    decision: 'APPROVED' | 'REJECTED';
    comments: string;
    signatureHash: string;
    signatureImage?: string;
    sealStampImage?: string;
    signerRole?: string;
    encryptedTimestamp?: string;
    uniqueKey?: string;
    certificateSerial?: string;
    stampScope?: 'HOLDING' | 'COMPANY' | 'PROJECT' | 'DEPARTMENT';
    stampEntityName?: string;
    signaturePosition?: { x: number; y: number };
    sealPosition?: { x: number; y: number };
    badgePosition?: { x: number; y: number };
  };
  gateScanLog?: {
    scannedAt: string;
    scannedBy: string;
    gateName: string;
    driverName: string;
    vehiclePlate: string;
    notes: string;
  };
  warehouseReceipt?: {
    receivedAt: string;
    receivedBy: string;
    binLocation: string;
    condition: string;
  };
  financeEntry?: {
    postedAt: string;
    journalRef: string;
    paymentStatus: 'PAID' | 'ACCRUED' | 'PENDING_INVOICE';
    voucherNo: string;
  };
}

export interface GateEntryLog {
  id: string;
  scannedAt: string;
  barcode: string;
  poNumber: string;
  companyId: string;
  projectId?: string;
  supplierName: string;
  materialSummary: string;
  totalAmountUSD: number;
  securityOfficer: string;
  gateLocation: string;
  vehiclePlate: string;
  driverName: string;
  status: 'PENDING_SCAN' | 'VERIFIED' | 'DISPATCHED_TO_WAREHOUSE' | 'FLAGGED';
  tripleNotification: {
    warehouseNotified: boolean;
    warehouseAckAt?: string;
    financeNotified: boolean;
    financeAutoEntryCreated: boolean;
    journalEntryId?: string;
    managerNotified: boolean;
    managerName?: string;
  };
}

export interface VirtualMeeting {
  id: string;
  title: string;
  titleKu?: string;
  titleAr?: string;
  companyId?: string;
  projectId?: string;
  meetingType?: 'JOINT_PM_GM' | 'GM_REVIEW' | 'PM_REVIEW' | 'BOARD_GENERAL';
  hostName: string;
  scheduledTime: string;
  status: 'LIVE' | 'SCHEDULED' | 'CONCLUDED';
  attendees: {
    name: string;
    role: string;
    company: string;
    avatar: string;
    isAudioOn: boolean;
    isVideoOn: boolean;
    nativeLang?: string;
    category?: 'OWNER' | 'GM' | 'PM' | 'STAFF';
  }[];
  agenda: string[];
  meetingMinutes?: string;
  actionItems: {
    task: string;
    assignee: string;
    deadline: string;
    isDone: boolean;
  }[];
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  timestamp: string;
  messageText: string;
  originalLanguage: Language;
  translatedText?: {
    en?: string;
    ku?: string;
    ar?: string;
  };
  priority: 'NORMAL' | 'URGENT' | 'HOLDING_DIRECTIVE';
}

export interface ForeignWorker {
  id: string;
  name: string;
  fullName?: string;
  companyId: string;
  sponsorCompanyId?: string;
  projectId?: string;
  assignedProjectId?: string;
  projectNameKu?: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  iqamaNumber: string;
  iqamaIssueDate?: string;
  iqamaExpiry: string;
  iqamaExpiryDate?: string;
  jobTitle: string;
  professionKu?: string;
  professionAr?: string;
  department?: string;
  departmentKu?: string;
  accommodationCampId: string;
  accommodationCampName?: string;
  housingLocation?: string;
  campLocation?: string;
  buildingOrBlock?: string;
  roomNumber: string;
  bedNumber?: string;
  visaStatus: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'RENEWAL_IN_PROGRESS';
  sponsorCompany: string;
  joinDate: string;
  salaryUSD: number;
  emergencyContact?: string;
  daysRemaining?: number;
  lastRenewalDate?: string;
  renewalReceiptNo?: string;
  renewalNotes?: string;
  renewalInitiatedDate?: string;
}

export interface AccommodationCamp {
  id: string;
  name: string;
  nameKu?: string;
  companyId: string;
  projectId?: string;
  projectName?: string;
  location: string;
  type: 'ENGINEERS_RESIDENCE' | 'WORKERS_CAMP' | 'EXECUTIVE_SUITE' | 'VIP_GUESTHOUSE';
  totalCapacity: number;
  currentOccupants: number;
  buildingsCount: number;
  roomsCount: number;
  facilities: string[];
  campSupervisor: string;
  supervisorName?: string;
  supervisorPhone: string;
  cateringStatus: 'OPERATIONAL' | 'INSPECTION_DUE';
  safetyScore: number;
  lastInspectionDate?: string;
  inspectionStatus?: string;
}

export interface HseIncidentSafety {
  id: string;
  companyId: string;
  projectId?: string;
  type: 'FIRE_EQUIPMENT_INSPECTION' | 'DRILL_LOG' | 'SECURITY_INCIDENT' | 'SAFETY_AUDIT';
  title: string;
  description: string;
  date: string;
  inspectorName: string;
  status: 'PASSED' | 'ACTION_REQUIRED' | 'RESOLVED';
  fireExtinguishersChecked?: number;
  fireHydrantsOperational?: boolean;
  evacuationDrillScore?: number;
  guardsOnDuty?: number;
}

export interface TechnicalMaintenance {
  id: string;
  companyId: string;
  projectId?: string;
  equipmentName: string;
  equipmentCategory: 'GENERATOR' | 'TRANSFORMER' | 'HEAVY_MACHINERY' | 'ELECTRICAL_PANEL' | 'HVAC';
  status: 'OPERATIONAL' | 'MAINTENANCE_REQUIRED' | 'UNDER_REPAIR' | 'CRITICAL';
  serialNumber: string;
  powerRatingKW?: number;
  fuelLevelPercentage?: number;
  lastServiceDate: string;
  nextServiceDate: string;
  technicianInCharge: string;
  runningHours: number;
}

export type LetterApprovalStage =
  | 'DRAFT'
  | 'PENDING_PM_APPROVAL'
  | 'PENDING_GM_APPROVAL'
  | 'PENDING_HOLDING_REVIEW'
  | 'HOLDING_APPROVED'
  | 'REJECTED';

export interface LetterRoutingStep {
  stage: LetterApprovalStage;
  stageNameKu: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BYPASSED';
  comments?: string;
  sealHash?: string;
}

export interface CorrespondenceLetter {
  id: string;
  letterNumber: string;
  type: 'INBOUND' | 'OUTBOUND';
  companyId: string;
  projectId?: string;
  originDepartment: DepartmentCategory;
  originDepartmentNameKu: string;
  originDepartmentNameEn: string;
  senderOrg: string;
  senderPerson: string;
  senderRole: string;
  receiverOrg: string;
  receiverPerson: string;
  subject: string;
  subjectKu?: string;
  subjectAr?: string;
  bodyText: string;
  date: string;
  urgency: 'REGULAR' | 'URGENT' | 'TOP_SECRET_EXECUTIVE';
  originalLanguage: Language;
  attachmentName?: string;
  stampApproved: boolean;
  approvalStage: LetterApprovalStage;
  isProjectOrigin: boolean;
  isBlockedWithoutPmApproval: boolean;
  projectManagerApproval?: {
    approvedBy: string;
    approvedAt: string;
    status: 'APPROVED' | 'REJECTED';
    comments?: string;
    digitalStampId?: string;
  };
  subsidiaryGmApproval?: {
    approvedBy: string;
    approvedAt: string;
    status: 'APPROVED' | 'REJECTED';
    comments?: string;
    digitalStampId?: string;
  };
  holdingExecutiveDecision?: {
    decidedBy: string;
    decidedAt: string;
    decision: 'APPROVED' | 'REJECTED';
    directiveNotes?: string;
    officialSealNumber?: string;
  };
  routingSteps: LetterRoutingStep[];
}

export interface WarehouseItem {
  id: string;
  companyId: string;
  itemCode: string;
  name: string;
  category: string;
  quantityOnHand: number;
  minimumThreshold: number;
  unit: string;
  binLocation: string;
  averageUnitCostUSD: number;
  lastRestockedDate: string;
  supplier: string;
}

export interface DispatchShipment {
  id: string;
  waybillNumber: string;
  companyId: string;
  clientName: string;
  destination: string;
  driverName: string;
  vehiclePlate: string;
  itemsList: string;
  dispatchTime: string;
  deliveryStatus: 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED';
  driverPhone: string;
}

export interface FinanceLedgerEntry {
  id: string;
  companyId: string;
  projectId?: string;
  entryDate: string;
  voucherNumber: string;
  accountName: string;
  debitUSD: number;
  creditUSD: number;
  description: string;
  sourceModule: 'GATE_SCAN_AUTO' | 'PROCUREMENT' | 'PAYROLL' | 'DIRECT_MANUAL';
  referencePoId?: string;
  postedBy: string;
}

export interface Employee {
  id: string;
  companyId: string;
  projectId?: string;
  fullName: string;
  department: string;
  role: string;
  salaryUSD: number;
  phone: string;
  email: string;
  joinDate: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
  nationality: string;
}

export interface ItSystemAsset {
  id: string;
  companyId: string;
  assetTag: string;
  deviceType: 'SERVER' | 'FIREWALL' | 'WORKSTATION' | 'CCTV_SYSTEM' | 'IP_PHONE';
  assignedTo: string;
  ipAddress: string;
  status: 'ONLINE' | 'WARNING' | 'OFFLINE';
  lastSecurityPatch: string;
}

export interface CostSavingSuggestion {
  id: string;
  title: string;
  titleKu: string;
  titleAr?: string;
  domain: 'PROCUREMENT' | 'FINANCE' | 'EQUIPMENT' | 'OPERATIONS';
  estimatedSavingsUSD: number;
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  actionableStepsKu: string[];
  actionableStepsEn: string[];
  actionableStepsAr?: string[];
  timeframe: 'IMMEDIATE_48H' | 'NEXT_14_DAYS' | 'ONGOING';
  relatedModuleContext: string;
}

export interface SmartBudgetAlert {
  id: string;
  projectId: string;
  projectName: string;
  projectNameKu?: string;
  projectNameAr?: string;
  companyId: string;
  companyName: string;
  budgetUSD: number;
  spentUSD: number;
  burnRatePercentage: number;
  thresholdPercentage: number;
  
  // Assigned target managers (targeted to PM & GM, not Holding Owner!)
  targetRole: 'PROJECT_MANAGER' | 'COMPANY_GM';
  assignedProjectManager: string;
  projectManagerPhone: string;
  assignedGeneralManager: string;
  generalManagerPhone: string;
  
  // Procurement & Finance context
  procurementContext: {
    totalPoCount: number;
    totalPoSpentUSD: number;
    topSuppliers: string[];
    recentHighCostItems: string[];
  };
  financeContext: {
    totalDebitUSD: number;
    majorAccounts: string[];
    recentVouchers: string[];
  };

  // AI Suggestions
  aiGeneratedAt: string;
  executiveDiagnosisKu: string;
  executiveDiagnosisEn: string;
  suggestions: CostSavingSuggestion[];
  totalPotentialSavingsUSD: number;

  // Directive dispatch status
  dispatchStatus: 'PENDING_DISPATCH' | 'DISPATCHED_TO_MANAGERS' | 'ACKNOWLEDGED_BY_PM' | 'SAVINGS_APPLIED';
  dispatchedAt?: string;
  dispatchedDirectiveKu?: string;
  acknowledgedAt?: string;
  managerActionPlanKu?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  titleKu?: string;
  titleAr?: string;
  message: string;
  messageKu?: string;
  messageAr?: string;
  timestamp: string;
  type: 'GATE_ALERT' | 'OWNER_APPROVAL_REQUIRED' | 'MEETING_INVITE' | 'EXPIRY_WARNING' | 'FINANCE_ENTRY' | 'ML_ANOMALY_ALERT' | 'BUDGET_THRESHOLD_ALERT' | 'HARDWARE_ALERT';
  isRead: boolean;
  relatedId?: string;
  targetRole?: UserRole;
  targetRecipientName?: string;
  targetEntityId?: string;
  directives?: string[];
}
