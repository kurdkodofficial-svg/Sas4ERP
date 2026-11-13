import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  HoldingGroup,
  Company,
  Project,
  PurchaseOrder,
  POStatus,
  GateEntryLog,
  ForeignWorker,
  AccommodationCamp,
  HseIncidentSafety,
  TechnicalMaintenance,
  CorrespondenceLetter,
  WarehouseItem,
  DispatchShipment,
  FinanceLedgerEntry,
  Employee,
  ItSystemAsset,
  UserProfile,
  VirtualMeeting,
  AppNotification,
  UserRole,
  DirectMessage,
  DepartmentOverview,
  DepartmentCategory,
  LetterApprovalStage,
  GeneralManagerProfile,
  ProjectPeriodicReport,
  SubProject,
  PrinterDeviceConfig,
  ExecutiveSignatureProfile,
  DelegatedSpendingMandate
} from '../types/erp';
import { initialSubProjects } from '../data/initialSubProjects';
import { generateDefaultDepartments } from '../data/departmentsData';
import {
  initialHolding,
  initialCompanies,
  initialGeneralManagers,
  initialProjects,
  initialPurchaseOrders,
  initialGateLogs,
  initialForeignWorkers,
  initialProjectReports,
  initialCamps,
  initialHseLogs,
  initialTechnicalEquipments,
  initialCorrespondence,
  initialWarehouseItems,
  initialFinanceLedgers,
  initialVirtualMeetings,
  initialNotifications,
  initialItAssets,
  initialDispatchShipments,
  initialEmployees,
  currentUserProfiles,
  initialPrinterDevices,
  initialSignatureProfiles
} from '../data/initialData';
import { ElectronicSignatureModal } from '../components/ElectronicSignatureModal';
import { PrinterConnectivityModal } from '../components/PrinterConnectivityModal';
import { DocumentPrintPreviewModal } from '../components/DocumentPrintPreviewModal';
import { PrintManagerModal } from '../components/PrintManagerModal';
import { HoldingCloudSyncModal } from '../components/dashboard/HoldingCloudSyncModal';
import { holdingCloudSyncService, HoldingCloudSyncStatus } from '../services/holdingCloudSyncService';
import { PrintManagerService } from '../services/printManager';
import { PrintJob, PrintOptions, PrintResult, PrintableReportData } from '../types/print';
import { HoldingSectorKpi } from '../types/kpi';
import { SystemLicenseInfo, getStoredSystemLicense } from '../utils/licenseManager';
import { getHoldingSectorsData } from '../data/holdingSectorsData';
import {
  IntercompanyInvoice,
  IntercompanyBilateralPair,
  ConsolidationSummary,
  CreateBilateralInvoiceParams
} from '../types/intercompany';
import { initialIntercompanyInvoices } from '../data/initialIntercompanyData';
import { ConsolidationEngine } from '../services/consolidationEngine';
import {
  MLAnomalyAlert,
  AttendanceRecord,
  AnomalyEngineStats,
  MLSensitivityLevel,
  AnomalyStatus
} from '../types/anomaly';
import {
  initialMLAnomalyAlerts,
  initialAttendanceRecords,
  initialAnomalyEngineStats
} from '../data/initialAnomalyData';
import {
  runFullMLScan,
  detectProcurementAnomalies,
  detectFinancialAnomalies,
  detectAttendanceAnomalies
} from '../services/mlAnomalyDetector';
import { offlineMeshService } from '../utils/offlineMeshSync';
import {
  ApprovalChainRule,
  ApprovalAuditEntry,
  HoldingThresholdPolicy,
  TransactionType,
  WorkflowRequestState,
  GMProjectBudgetPolicy,
  GMEvaluationResult,
  GMDecisionMode
} from '../types/workflow';
import {
  defaultWorkflowRules,
  defaultHoldingThresholdPolicy,
  defaultGMBudgetPolicies,
  findGMPolicy,
  evaluateGMWorkflowDecision,
  matchApprovalChain,
  generateInitialWorkflowState,
  advanceWorkflowStep
} from '../services/workflowEngine';
import { getApiUrl } from '../utils/apiConfig';

interface ERPContextType {
  holding: HoldingGroup;
  updateHolding: (data: Partial<HoldingGroup>) => void;
  companies: Company[];
  addCompany: (company: Omit<Company, 'id'>) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;
  deleteCompany: (id: string) => void;

  generalManagers: GeneralManagerProfile[];
  addGeneralManager: (gm: Omit<GeneralManagerProfile, 'id'>) => void;
  updateGeneralManager: (id: string, gm: Partial<GeneralManagerProfile>) => void;
  deleteGeneralManager: (id: string) => void;
  selectedGmId: string | null;
  setSelectedGmId: (id: string | null) => void;

  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addSubProject: (projectId: string, subProject: Omit<SubProject, 'id' | 'projectId'>) => void;
  updateSubProject: (projectId: string, subProjectId: string, data: Partial<SubProject>) => void;
  deleteSubProject: (projectId: string, subProjectId: string) => void;
  
  selectedCompanyId: string | 'ALL';
  setSelectedCompanyId: (id: string | 'ALL') => void;
  selectedProjectId: string | 'ALL';
  setSelectedProjectId: (id: string | 'ALL') => void;

  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  userProfiles: UserProfile[];
  updateUserProfile: (id: string, updates: Partial<UserProfile>) => void;
  addUserProfile: (profile: Omit<UserProfile, 'id'>) => void;
  deleteUserProfile: (id: string) => void;
  isUserRolesModalOpen: boolean;
  setIsUserRolesModalOpen: (open: boolean) => void;

  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdDate' | 'status'>) => void;
  deletePurchaseOrder: (id: string) => void;
  approvePurchaseByOwner: (poId: string, comments?: string, signatureImage?: string, sealStampImage?: string) => void;
  rejectPurchaseByOwner: (poId: string, comments?: string) => void;

  gateLogs: GateEntryLog[];
  processGateScan: (barcodeOrPo: string, customDetails?: any) => Promise<{
    success: boolean;
    po?: PurchaseOrder;
    message: string;
    itemsUpdated?: { name: string; quantityAdded: number; newTotal: number; unit: string }[];
    voucherNo?: string;
    notificationsDispatched?: string[];
  }>;
  deleteGateLog: (id: string) => void;

  foreignWorkers: ForeignWorker[];
  addForeignWorker: (worker: Omit<ForeignWorker, 'id'>) => void;
  updateForeignWorker: (id: string, worker: Partial<ForeignWorker>) => void;
  deleteForeignWorker: (id: string) => void;
  renewForeignWorkerResidency: (workerId: string, newExpiryDate: string, receiptNo?: string, notes?: string) => void;

  projectReports: ProjectPeriodicReport[];
  addProjectReport: (report: Omit<ProjectPeriodicReport, 'id'>) => void;
  updateProjectReport: (id: string, data: Partial<ProjectPeriodicReport>) => void;
  signProjectReport: (id: string, pmName: string, signatureDataUrl?: string) => void;
  attachScannedReport: (id: string, scanDataUrl: string, fileName: string) => void;
  submitReportToUpper: (id: string) => void;
  approveReportByHolding: (id: string, approvedBy: string, notesKu?: string) => void;

  camps: AccommodationCamp[];
  addCamp: (camp: Omit<AccommodationCamp, 'id'>) => void;

  hseLogs: HseIncidentSafety[];
  addHseLog: (log: Omit<HseIncidentSafety, 'id'>) => void;

  technicalEquipments: TechnicalMaintenance[];
  addTechnicalEquipment: (eq: Omit<TechnicalMaintenance, 'id'>) => void;
  updateTechnicalEquipment: (id: string, eq: Partial<TechnicalMaintenance>) => void;

  correspondence: CorrespondenceLetter[];
  addCorrespondence: (letter: Omit<CorrespondenceLetter, 'id' | 'letterNumber'>) => void;
  approveLetterByPM: (letterId: string, comments?: string) => void;
  approveLetterByGM: (letterId: string, comments?: string) => void;
  decideLetterByHolding: (letterId: string, decision: 'APPROVED' | 'REJECTED', notes?: string) => void;

  warehouseItems: WarehouseItem[];
  addWarehouseItem: (item: Omit<WarehouseItem, 'id'>) => void;

  financeLedgers: FinanceLedgerEntry[];
  addFinanceEntry: (entry: Omit<FinanceLedgerEntry, 'id' | 'voucherNumber'>) => void;
  deleteFinanceEntry: (id: string) => void;
  resetAllFinancialsToZero: () => void;
  clearAllMockData: () => void;
  restoreSampleData: () => void;

  virtualMeetings: VirtualMeeting[];
  activeMeeting: VirtualMeeting | null;
  startMeeting: (meeting: Partial<VirtualMeeting>) => void;
  endMeeting: (id: string) => void;
  updateMeetingMinutes: (id: string, minutes: string) => void;
  requestHoldingMeeting: (params: { sourceType: 'COMPANY' | 'PROJECT'; sourceId: string; sourceName: string; departmentName?: string; agendaTopic?: string }) => void;

  directMessages: DirectMessage[];
  sendDirectMessage: (receiverId: string, text: string, priority?: 'NORMAL' | 'URGENT' | 'HOLDING_DIRECTIVE') => void;

  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  syncHardwareThresholdAlertsNow: () => Promise<void>;

  // Active Modals & Views
  isGateScannerOpen: boolean;
  setIsGateScannerOpen: (open: boolean) => void;
  isMeetingModalOpen: boolean;
  setIsMeetingModalOpen: (open: boolean) => void;
  isCallModalOpen: boolean;
  setIsCallModalOpen: (open: boolean) => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
  activeCallingManager: { name: string; role: string; phone: string; company: string; avatar: string } | null;
  startCallWithManager: (manager: { name: string; role: string; phone: string; company: string; avatar: string }) => void;
  closeCallModal: () => void;

  activeInspectingDept: { companyId: string; projectId?: string; department: DepartmentOverview } | null;
  setActiveInspectingDept: (dept: { companyId: string; projectId?: string; department: DepartmentOverview } | null) => void;

  addDepartmentToEntity: (entityType: 'COMPANY' | 'PROJECT', entityId: string, dept: Omit<DepartmentOverview, 'id'>) => void;
  deleteDepartmentFromEntity: (entityType: 'COMPANY' | 'PROJECT', entityId: string, deptId: string) => void;

  importBatchCompanies: (newCompanies: Partial<Company>[]) => void;
  importBatchProjects: (newProjects: Partial<Project>[]) => void;
  importBatchFinanceLedgers: (newEntries: Partial<FinanceLedgerEntry>[]) => void;
  importBatchEmployees: (newEmployees: Partial<Employee>[]) => void;
  importBatchWarehouseItems: (newItems: Partial<WarehouseItem>[]) => void;

  isHoldingSetupOpen: boolean;
  setIsHoldingSetupOpen: (open: boolean) => void;
  isUserManualOpen: boolean;
  setIsUserManualOpen: (open: boolean) => void;
  isLicenseModalOpen: boolean;
  setIsLicenseModalOpen: (open: boolean) => void;
  licenseModalInitialTab: 'activate' | 'generator';
  setLicenseModalInitialTab: (tab: 'activate' | 'generator') => void;
  openLicenseModal: (tab?: 'activate' | 'generator') => void;
  isOwnerVerifyModalOpen: boolean;
  setIsOwnerVerifyModalOpen: (open: boolean) => void;
  systemLicense: SystemLicenseInfo;
  setSystemLicense: React.Dispatch<React.SetStateAction<SystemLicenseInfo>>;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Skyline Background Theme State
  isSkylineBgEnabled: boolean;
  setIsSkylineBgEnabled: (enabled: boolean) => void;
  skylineBgPreset: 'corporate_prism' | 'district_violet' | 'skyline_waterfront';
  setSkylineBgPreset: (preset: 'corporate_prism' | 'district_violet' | 'skyline_waterfront') => void;
  skylineBgOpacity: number;
  setSkylineBgOpacity: (opacity: number) => void;
  skylineBgBlur: boolean;
  setSkylineBgBlur: (blur: boolean) => void;
  isSkylineModalOpen: boolean;
  setIsSkylineModalOpen: (open: boolean) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  dispatchShipments: DispatchShipment[];
  itAssets: ItSystemAsset[];
  employees: Employee[];

  // Machine Learning Anomaly Detection Sentinel
  anomalyAlerts: MLAnomalyAlert[];
  attendanceRecords: AttendanceRecord[];
  anomalyStats: AnomalyEngineStats;
  mlSensitivity: MLSensitivityLevel;
  setMlSensitivity: (level: MLSensitivityLevel) => void;
  isRealTimeMlActive: boolean;
  setIsRealTimeMlActive: (active: boolean) => void;
  runMLScan: (sensitivity?: MLSensitivityLevel) => void;
  updateAnomalyStatus: (alertId: string, status: AnomalyStatus, decisionNotes?: string) => void;
  executeAnomalyAction: (alertId: string, actionName: string) => void;
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  simulateAnomalyPattern: (patternType: 'SPLIT_PO' | 'OFF_HOURS_FINANCE' | 'GHOST_WORKER') => void;

  // Workflow & Approval Engine
  workflowRules: ApprovalChainRule[];
  addWorkflowRule: (rule: Omit<ApprovalChainRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkflowRule: (id: string, rule: Partial<ApprovalChainRule>) => void;
  deleteWorkflowRule: (id: string) => void;
  thresholdPolicy: HoldingThresholdPolicy;
  updateThresholdPolicy: (policy: Partial<HoldingThresholdPolicy>) => void;
  approvalAuditTrail: ApprovalAuditEntry[];
  processWorkflowStep: (poId: string, stepNumber: number, decision: 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_INFO', comments?: string) => void;
  submitPurchaseRequest: (data: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdDate' | 'status'> & { transactionType?: TransactionType }) => void;
  isPoFullyApproved: (po: PurchaseOrder) => boolean;
  canPoEnterProject: (po: PurchaseOrder) => {
    allowed: boolean;
    reasonKu: string;
    reasonEn: string;
    isCeoPreApproved?: boolean;
    missingSignersKu?: string;
  };
  grantCeoPreApproval: (poId: string, comments?: string) => void;
  delegatePoSpendingAuthority: (poId: string, notes?: string, decreeNumber?: string) => { success: boolean; message: string };
  setEntitySpendingAutonomy: (type: 'COMPANY' | 'PROJECT', id: string, mandate: DelegatedSpendingMandate | null) => void;
  isPoDelegatedOrAutonomous: (po: PurchaseOrder) => { isDelegated: boolean; mandate?: DelegatedSpendingMandate };
  signPmReleaseForProcurement: (poId: string, comments?: string) => { success: boolean; message: string };
  collectFundsByProcurement: (poId: string) => { success: boolean; message: string };
  canUserApproveWorkflowStep: (
    user: UserProfile,
    po: PurchaseOrder,
    stepNumber: number
  ) => { allowed: boolean; reasonKu: string; reasonEn: string; requiresOverride?: boolean };
  approveWorkflowStep: (
    poId: string,
    stepNumber: number,
    decision: 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_INFO',
    comments?: string,
    signatureImage?: string,
    sealStampImage?: string,
    isOverride?: boolean
  ) => { success: boolean; message: string };
  disbursePoPayment: (
    poId: string,
    paymentMethod?: string,
    notes?: string
  ) => { success: boolean; message: string };
  receiveApprovedPoToWarehouse: (
    poId: string,
    binLocation?: string,
    condition?: string
  ) => { success: boolean; message: string };

  // General Manager Budget Policies & Decisions
  gmBudgetPolicies: GMProjectBudgetPolicy[];
  addGmBudgetPolicy: (policy: Omit<GMProjectBudgetPolicy, 'id' | 'updatedAt'>) => void;
  updateGmBudgetPolicy: (id: string, policy: Partial<GMProjectBudgetPolicy>) => void;
  deleteGmBudgetPolicy: (id: string) => void;
  evaluateGMForPO: (po: PurchaseOrder) => GMEvaluationResult;
  autoApproveGMStep: (poId: string, comments?: string) => void;

  // Electronic Signature & Seal Engine
  signatureProfiles: ExecutiveSignatureProfile[];
  defaultSignature: ExecutiveSignatureProfile | null;
  saveSignatureProfile: (profile: Omit<ExecutiveSignatureProfile, 'id' | 'createdDate'>) => void;
  deleteSignatureProfile: (id: string) => void;
  isSignatureModalOpen: boolean;
  setIsSignatureModalOpen: (open: boolean) => void;
  signatureTargetPoId: string | null;
  setSignatureTargetPoId: (poId: string | null) => void;

  // Hardware Printer Connectivity Engine
  printerDevices: PrinterDeviceConfig[];
  defaultPrinter: PrinterDeviceConfig | null;
  addPrinterDevice: (device: Omit<PrinterDeviceConfig, 'id'>) => void;
  updatePrinterDevice: (id: string, updates: Partial<PrinterDeviceConfig>) => void;
  deletePrinterDevice: (id: string) => void;
  setDefaultPrinter: (id: string) => void;
  isPrinterModalOpen: boolean;
  setIsPrinterModalOpen: (open: boolean) => void;

  // Universal Document Print Preview
  printPreviewPO: PurchaseOrder | null;
  setPrintPreviewPO: (po: PurchaseOrder | null) => void;

  // ERP PrintManager Utility & Network Printing
  printManager: PrintManagerService;
  printQueue: PrintJob[];
  printPurchaseOrder: (po: PurchaseOrder, options?: PrintOptions) => Promise<PrintResult>;
  printDigitalApproval: (po: PurchaseOrder, options?: PrintOptions) => Promise<PrintResult>;
  printKpiReport: (reportData: PrintableReportData, options?: PrintOptions) => Promise<PrintResult>;
  reprintJob: (jobId: string) => Promise<PrintResult | null>;
  cancelPrintJob: (jobId: string) => void;
  clearPrintHistory: () => void;
  isPrintManagerModalOpen: boolean;
  setIsPrintManagerModalOpen: (open: boolean) => void;
  openPrintManager: (documentToPrint?: PurchaseOrder | null) => void;

  // Holding Sectors & Financial KPI State (Customizable by Admin)
  holdingSectors: HoldingSectorKpi[];
  addHoldingSector: (sector: Omit<HoldingSectorKpi, 'id'>) => void;
  updateHoldingSector: (id: string, updates: Partial<HoldingSectorKpi>) => void;
  deleteHoldingSector: (id: string) => void;
  resetHoldingSectorsToDefault: () => void;
  syncSectorsWithCompanies: () => void;

  // Intercompany Bilateral Invoicing & Financial Consolidation (IFRS 10 / GAAP)
  intercompanyInvoices: IntercompanyInvoice[];
  createBilateralIntercompanyInvoice: (params: CreateBilateralInvoiceParams) => { expenseInvoice: IntercompanyInvoice; revenueInvoice: IntercompanyInvoice };
  settleIntercompanyInvoice: (pairId: string) => void;
  deleteIntercompanyPair: (pairId: string) => void;
  isConsolidationEnabled: boolean;
  setIsConsolidationEnabled: (enabled: boolean) => void;
  consolidationSummary: ConsolidationSummary;

  // Holding Cloud Real-Time Multi-Laptop Synchronization (Erbil HQ <-> Halabja Site)
  isCloudSyncModalOpen: boolean;
  setIsCloudSyncModalOpen: (open: boolean) => void;
  holdingCloudSyncStatus: HoldingCloudSyncStatus;
  triggerForceSync: () => Promise<void>;
  holdingSyncKey: string;
  setHoldingSyncKey: (key: string) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or default
  const [holding, setHolding] = useState<HoldingGroup>(() => {
    const saved = localStorage.getItem('sas4erp_holding');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.systemPlatformName = 'SAS';
        // Cleanse any legacy/mock names from local storage
        if (
          parsed.chairmanName &&
          (parsed.chairmanName.includes('سۆران') ||
            parsed.chairmanName.toLowerCase().includes('soran') ||
            parsed.chairmanName.includes('عبدالرحمن') ||
            parsed.chairmanName.toLowerCase().includes('abdulrahman'))
        ) {
          parsed.chairmanName = '';
        }

        // Cleanse holding name if it was set to SAS Holding, SAS Holding International, etc.
        if (
          parsed.name &&
          (parsed.name.toLowerCase().includes('sas holding') ||
            parsed.name.toLowerCase().includes('holding international') ||
            parsed.name.toLowerCase().includes('sas international') ||
            parsed.name.trim() === 'SAS' ||
            parsed.name.trim() === 'SAS Holding')
        ) {
          parsed.name = '';
        }
        if (
          parsed.nameKu &&
          (parsed.nameKu.toLowerCase().includes('sas holding') ||
            parsed.nameKu.includes('ساس') ||
            parsed.nameKu.includes('SAS'))
        ) {
          parsed.nameKu = '';
        }
        if (
          parsed.nameAr &&
          (parsed.nameAr.toLowerCase().includes('sas holding') ||
            parsed.nameAr.includes('ساس') ||
            parsed.nameAr.includes('SAS'))
        ) {
          parsed.nameAr = '';
        }

        return parsed;
      } catch (e) {
        console.error('Failed to parse saved holding', e);
      }
    }
    return initialHolding;
  });

  // Electronic Signature & Seal State
  const [signatureProfiles, setSignatureProfiles] = useState<ExecutiveSignatureProfile[]>(() => {
    const saved = localStorage.getItem('sas4erp_signatures');
    return saved ? JSON.parse(saved) : initialSignatureProfiles;
  });
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureTargetPoId, setSignatureTargetPoId] = useState<string | null>(null);

  // Hardware Printer Connectivity State
  const [printerDevices, setPrinterDevices] = useState<PrinterDeviceConfig[]>(() => {
    const saved = localStorage.getItem('sas4erp_printers');
    return saved ? JSON.parse(saved) : initialPrinterDevices;
  });
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [printPreviewPO, setPrintPreviewPO] = useState<PurchaseOrder | null>(null);

  const defaultPrinter = printerDevices.find(p => p.isDefault) || printerDevices[0] || null;
  const defaultSignature = signatureProfiles.find(s => s.isActive) || signatureProfiles[0] || null;

  const saveSignatureProfile = (profile: Omit<ExecutiveSignatureProfile, 'id' | 'createdDate'>) => {
    const newProfile: ExecutiveSignatureProfile = {
      ...profile,
      id: `sig-${Date.now()}`,
      createdDate: new Date().toISOString()
    };
    setSignatureProfiles(prev => {
      const updated = [newProfile, ...prev.map(p => ({ ...p, isActive: false }))];
      try {
        localStorage.setItem('sas4erp_signatures', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteSignatureProfile = (id: string) => {
    setSignatureProfiles(prev => {
      const updated = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('sas4erp_signatures', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const addPrinterDevice = (device: Omit<PrinterDeviceConfig, 'id'>) => {
    const newDevice: PrinterDeviceConfig = {
      ...device,
      id: `prn-${Date.now()}`
    };
    setPrinterDevices(prev => {
      const updated = [...prev, newDevice];
      try {
        localStorage.setItem('sas4erp_printers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updatePrinterDevice = (id: string, updates: Partial<PrinterDeviceConfig>) => {
    setPrinterDevices(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      try {
        localStorage.setItem('sas4erp_printers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deletePrinterDevice = (id: string) => {
    setPrinterDevices(prev => {
      const updated = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('sas4erp_printers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const setDefaultPrinter = (id: string) => {
    setPrinterDevices(prev => {
      const updated = prev.map(p => ({
        ...p,
        isDefault: p.id === id
      }));
      try {
        localStorage.setItem('sas4erp_printers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // ERP PrintManager Utility Initialization
  const printManager = useMemo(() => new PrintManagerService(printerDevices), []);
  const [printQueue, setPrintQueue] = useState<PrintJob[]>(() => printManager.getQueue());
  const [isPrintManagerModalOpen, setIsPrintManagerModalOpen] = useState(false);
  const [printManagerActiveDoc, setPrintManagerActiveDoc] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    printManager.updatePrinters(printerDevices);
  }, [printerDevices, printManager]);

  useEffect(() => {
    const unsubscribe = printManager.subscribeToQueue((q) => {
      setPrintQueue(q);
    });
    return () => unsubscribe();
  }, [printManager]);

  const printPurchaseOrder = useCallback(
    (po: PurchaseOrder, options?: PrintOptions) => printManager.printPurchaseOrder(po, options),
    [printManager]
  );

  const printDigitalApproval = useCallback(
    (po: PurchaseOrder, options?: PrintOptions) => printManager.printDigitalApproval(po, options),
    [printManager]
  );

  const printKpiReport = useCallback(
    (reportData: PrintableReportData, options?: PrintOptions) => printManager.printKpiReport(reportData, options),
    [printManager]
  );

  const reprintJob = useCallback(
    (jobId: string) => printManager.reprintJob(jobId),
    [printManager]
  );

  const cancelPrintJob = useCallback(
    (jobId: string) => printManager.cancelJob(jobId),
    [printManager]
  );

  const clearPrintHistory = useCallback(
    () => printManager.clearHistory(),
    [printManager]
  );

  const openPrintManager = useCallback(
    (doc?: PurchaseOrder | null) => {
      setPrintManagerActiveDoc(doc || null);
      setIsPrintManagerModalOpen(true);
    },
    []
  );

  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('sas4erp_companies');
    return saved ? JSON.parse(saved) : initialCompanies;
  });

  const [generalManagers, setGeneralManagers] = useState<GeneralManagerProfile[]>(() => {
    const saved = localStorage.getItem('sas4erp_general_managers');
    return saved ? JSON.parse(saved) : initialGeneralManagers;
  });

  const [selectedGmId, setSelectedGmId] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('sas4erp_projects');
    const loaded: Project[] = saved ? JSON.parse(saved) : initialProjects;
    return loaded.map(p => {
      const spentUSD = (p.id === 'proj-107' && p.spentUSD < 6880000) ? 6880000 : p.spentUSD;
      return {
        ...p,
        spentUSD,
        subProjects: (p.subProjects && p.subProjects.length > 0)
          ? p.subProjects
          : (initialSubProjects[p.id] || [])
      };
    });
  });

  // Holding Sectors & Financial KPI State (Customizable by Admin)
  const [holdingSectors, setHoldingSectors] = useState<HoldingSectorKpi[]>(() => {
    const saved = localStorage.getItem('sas4erp_holding_sectors');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved holding sectors', e);
      }
    }
    return getHoldingSectorsData(initialCompanies, initialProjects);
  });

  const addHoldingSector = (sectorData: Omit<HoldingSectorKpi, 'id'>) => {
    const newSector: HoldingSectorKpi = {
      ...sectorData,
      id: `sec-${Date.now()}`
    };
    setHoldingSectors(prev => {
      const updated = [...prev, newSector];
      try {
        localStorage.setItem('sas4erp_holding_sectors', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateHoldingSector = (id: string, updates: Partial<HoldingSectorKpi>) => {
    setHoldingSectors(prev => {
      const updated = prev.map(sec => {
        if (sec.id === id) {
          const merged = { ...sec, ...updates };
          if (updates.annualBudgetUSD !== undefined || updates.spentUSD !== undefined) {
            const b = updates.annualBudgetUSD !== undefined ? Number(updates.annualBudgetUSD) : sec.annualBudgetUSD;
            const s = updates.spentUSD !== undefined ? Number(updates.spentUSD) : sec.spentUSD;
            merged.annualBudgetUSD = b;
            merged.spentUSD = s;
            merged.varianceUSD = b - s;
            merged.utilizationRate = b > 0 ? Number(((s / b) * 100).toFixed(1)) : 0;
            merged.status = merged.utilizationRate > 95 ? 'ALERT' : merged.utilizationRate > 85 ? 'WARNING' : merged.utilizationRate > 70 ? 'ON_TRACK' : 'EXCELLENT';
          }
          return merged;
        }
        return sec;
      });
      try {
        localStorage.setItem('sas4erp_holding_sectors', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteHoldingSector = (id: string) => {
    setHoldingSectors(prev => {
      const updated = prev.filter(sec => sec.id !== id);
      try {
        localStorage.setItem('sas4erp_holding_sectors', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const resetHoldingSectorsToDefault = () => {
    const defaults = getHoldingSectorsData(companies, projects);
    setHoldingSectors(defaults);
    try {
      localStorage.setItem('sas4erp_holding_sectors', JSON.stringify(defaults));
    } catch {}
  };

  const syncSectorsWithCompanies = () => {
    const synced = getHoldingSectorsData(companies, projects);
    setHoldingSectors(synced);
    try {
      localStorage.setItem('sas4erp_holding_sectors', JSON.stringify(synced));
    } catch {}
  };

  // Intercompany Bilateral Invoicing & Financial Consolidation (IFRS 10 / GAAP)
  const [intercompanyInvoices, setIntercompanyInvoices] = useState<IntercompanyInvoice[]>(() => {
    const saved = localStorage.getItem('sas4erp_intercompany_invoices');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return initialIntercompanyInvoices;
  });

  const [isConsolidationEnabled, setIsConsolidationEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('sas4erp_consolidation_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const consolidationSummary: ConsolidationSummary = useMemo(() => {
    return ConsolidationEngine.computeConsolidation(
      companies,
      holding,
      intercompanyInvoices,
      isConsolidationEnabled
    );
  }, [companies, holding, intercompanyInvoices, isConsolidationEnabled]);

  // Workflow Engine States
  const [workflowRules, setWorkflowRules] = useState<ApprovalChainRule[]>(() => {
    const saved = localStorage.getItem('sas4erp_workflow_rules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return defaultWorkflowRules;
  });

  const [thresholdPolicy, setThresholdPolicy] = useState<HoldingThresholdPolicy>(() => {
    const saved = localStorage.getItem('sas4erp_threshold_policy');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return defaultHoldingThresholdPolicy;
  });

  const [approvalAuditTrail, setApprovalAuditTrail] = useState<ApprovalAuditEntry[]>(() => {
    const saved = localStorage.getItem('sas4erp_approval_audit_trail');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
  });

  const [gmBudgetPolicies, setGmBudgetPolicies] = useState<GMProjectBudgetPolicy[]>(() => {
    const saved = localStorage.getItem('sas4erp_gm_budget_policies');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return defaultGMBudgetPolicies;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    let list: PurchaseOrder[] = initialPurchaseOrders;
    const saved = localStorage.getItem('sas4erp_pos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      } catch {}
    }

    return list.map(po => {
      const txType: TransactionType = po.transactionType || (
        po.totalAmountUSD > 100000 ? 'CAPITAL_EXPENDITURE' :
        po.purpose.toLowerCase().includes('emergency') || po.purpose.toLowerCase().includes('retaining') ? 'BUDGET_OVERRUN_EXCEPTION' :
        po.purpose.toLowerCase().includes('wearing') || po.purpose.toLowerCase().includes('contract') ? 'SUBCONTRACT_AGREEMENT' :
        'PURCHASE_ORDER'
      );

      if (!po.workflowState) {
        const matchedRule = matchApprovalChain(po.companyId, po.projectId, txType, po.totalAmountUSD, defaultWorkflowRules);
        const wf = generateInitialWorkflowState(
          matchedRule,
          po.totalAmountUSD,
          po.requestedBy,
          po.requesterRole,
          'Subsidiary',
          po.poNumber
        );

        if (po.status === 'APPROVED_BY_OWNER') {
          wf.steps = wf.steps.map(s => ({
            ...s,
            status: 'APPROVED',
            approverName: s.role === 'HOLDING_OWNER' ? 'خاوەنی هۆلدینگ (Holding Owner)' : (s.approverName || 'Authorized Approver'),
            actionDate: po.createdDate,
            comments: 'Historical authorization verified in ledger',
            signatureHash: `SIG-SAS-${s.role.substring(0, 3)}-VERIFIED`
          }));
          wf.finalDecision = 'APPROVED';
          wf.finalDecisionAt = po.createdDate;
        } else if (po.status === 'PENDING_OWNER_APPROVAL') {
          wf.steps = wf.steps.map(s => {
            if (s.role === 'HOLDING_OWNER') {
              return { ...s, status: 'PENDING' };
            }
            return {
              ...s,
              status: 'APPROVED',
              approverName: s.role === 'PROJECT_MANAGER' ? po.requestedBy : s.role === 'GENERAL_MANAGER' ? 'Company General Manager' : 'Cost Controller & Audit',
              actionDate: po.createdDate,
              comments: 'Verified and passed forward to Holding Owner',
              signatureHash: `SIG-PASSED-${s.role.substring(0, 3)}`
            };
          });
          const ownerStep = wf.steps.find(s => s.role === 'HOLDING_OWNER');
          if (ownerStep) {
            wf.currentStepNumber = ownerStep.stepNumber;
          }
        }

        return {
          ...po,
          transactionType: txType,
          workflowState: wf
        };
      }

      return {
        ...po,
        transactionType: txType
      };
    });
  });

  const [gateLogs, setGateLogs] = useState<GateEntryLog[]>(() => {
    const saved = localStorage.getItem('sas4erp_gate_logs');
    return saved ? JSON.parse(saved) : initialGateLogs;
  });

  const [foreignWorkers, setForeignWorkers] = useState<ForeignWorker[]>(() => {
    const saved = localStorage.getItem('sas4erp_foreign_workers');
    const list: ForeignWorker[] = saved ? JSON.parse(saved) : initialForeignWorkers;
    // Calculate dynamic daysRemaining and auto-update visaStatus
    const today = new Date();
    return list.map(w => {
      const expStr = w.iqamaExpiry || w.iqamaExpiryDate;
      if (!expStr) return w;
      const expDate = new Date(expStr);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      let status = w.visaStatus;
      if (diffDays <= 0) {
        status = 'EXPIRED';
      } else if (diffDays <= 30) {
        status = 'EXPIRING_SOON';
      } else if (status !== 'RENEWAL_IN_PROGRESS') {
        status = 'VALID';
      }
      return {
        ...w,
        daysRemaining: diffDays,
        visaStatus: status
      };
    });
  });

  const [projectReports, setProjectReports] = useState<ProjectPeriodicReport[]>(() => {
    const saved = localStorage.getItem('sas4erp_project_reports');
    return saved ? JSON.parse(saved) : initialProjectReports;
  });

  const [camps, setCamps] = useState<AccommodationCamp[]>(initialCamps);
  const [hseLogs, setHseLogs] = useState<HseIncidentSafety[]>(initialHseLogs);
  const [technicalEquipments, setTechnicalEquipments] = useState<TechnicalMaintenance[]>(initialTechnicalEquipments);
  const [correspondence, setCorrespondence] = useState<CorrespondenceLetter[]>(initialCorrespondence);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>(initialWarehouseItems);
  const [financeLedgers, setFinanceLedgers] = useState<FinanceLedgerEntry[]>(initialFinanceLedgers);
  const [virtualMeetings, setVirtualMeetings] = useState<VirtualMeeting[]>(initialVirtualMeetings);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);
  const [dispatchShipments, setDispatchShipments] = useState<DispatchShipment[]>(initialDispatchShipments);
  const [itAssets, setItAssets] = useState<ItSystemAsset[]>(initialItAssets);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  // Machine Learning Anomaly Detection States
  const [anomalyAlerts, setAnomalyAlerts] = useState<MLAnomalyAlert[]>(() => {
    const saved = localStorage.getItem('sas4erp_anomaly_alerts');
    return saved ? JSON.parse(saved) : initialMLAnomalyAlerts;
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('sas4erp_attendance_records');
    return saved ? JSON.parse(saved) : initialAttendanceRecords;
  });
  const [anomalyStats, setAnomalyStats] = useState<AnomalyEngineStats>(() => {
    const saved = localStorage.getItem('sas4erp_anomaly_stats');
    return saved ? JSON.parse(saved) : initialAnomalyEngineStats;
  });
  const [mlSensitivity, setMlSensitivity] = useState<MLSensitivityLevel>('STANDARD');
  const [isRealTimeMlActive, setIsRealTimeMlActive] = useState<boolean>(true);

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([
    {
      id: 'dm-1',
      senderId: 'user-owner',
      senderName: 'خاوەنی هۆلدینگ (Holding Owner)',
      senderRole: 'HOLDING_OWNER',
      receiverId: 'user-gm-1',
      receiverName: 'بەڕێوەبەری گشتی (GM)',
      timestamp: 'Today, 09:00',
      messageText: 'سەرجەم کارەکان لەسەر سیستەمی هۆلدینگ بەستراونەتەوە، تکایە ڕاپۆرتی ڕۆژانە بنێرن.',
      originalLanguage: 'ku',
      priority: 'HOLDING_DIRECTIVE',
    }
  ]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | 'ALL'>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string | 'ALL'>('ALL');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const defaultUser = currentUserProfiles[0];
    const isOwnerVerifiedStorage = typeof localStorage !== 'undefined' && (
      localStorage.getItem('sas4erp_verified_owner_email') === 'kurdkodofficial@gmail.com' ||
      localStorage.getItem('sas4erp_owner_session') === 'verified'
    );
    const verifiedAtStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('sas4erp_owner_verified_at') : undefined;
    const baseUser: UserProfile = isOwnerVerifiedStorage ? {
      ...defaultUser,
      email: 'kurdkodofficial@gmail.com',
      isOwnerVerified: true,
      verifiedAt: verifiedAtStorage || new Date().toISOString(),
      name: 'خاوەنی سیستەم و هۆڵدینگ (kurdkodofficial@gmail.com)',
      title: 'سەرۆک و خاوەنی سەکۆ و هۆڵدینگ',
      role: 'HOLDING_OWNER',
      avatar: '👑'
    } : defaultUser;

    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('sas4erp_holding') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.chairmanName?.trim() && !isOwnerVerifiedStorage) {
          return {
            ...baseUser,
            name: parsed.chairmanName.trim(),
          };
        }
      } catch (e) {}
    }
    return baseUser;
  });
  const [activeTab, setActiveTab] = useState<string>('holding-dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // User Profiles and RBAC Management State
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('sas4erp_user_profiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return currentUserProfiles;
  });
  const [isUserRolesModalOpen, setIsUserRolesModalOpen] = useState(false);

  const updateUserProfile = useCallback((id: string, updates: Partial<UserProfile>) => {
    setUserProfiles(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, ...updates } : u);
      try {
        localStorage.setItem('sas4erp_user_profiles', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setCurrentUser(curr => {
      if (curr.id === id) {
        return { ...curr, ...updates };
      }
      return curr;
    });
  }, []);

  const addUserProfile = useCallback((profile: Omit<UserProfile, 'id'>) => {
    const newUser: UserProfile = {
      ...profile,
      id: `user-${Date.now()}`
    };
    setUserProfiles(prev => {
      const updated = [...prev, newUser];
      try {
        localStorage.setItem('sas4erp_user_profiles', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const deleteUserProfile = useCallback((id: string) => {
    setUserProfiles(prev => {
      const updated = prev.filter(u => u.id !== id);
      try {
        localStorage.setItem('sas4erp_user_profiles', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Intercompany Bilateral Operations & Mirror Postings
  const createBilateralIntercompanyInvoice = useCallback((params: CreateBilateralInvoiceParams) => {
    const { expenseInvoice, revenueInvoice } = ConsolidationEngine.generateBilateralPair(params, companies);
    
    setIntercompanyInvoices(prev => {
      const updated = [expenseInvoice, revenueInvoice, ...prev];
      try {
        localStorage.setItem('sas4erp_intercompany_invoices', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Auto-post paired general ledger journal vouchers
    const expVoucherNo = `IC-VCH-${expenseInvoice.invoiceNumber}`;
    const revVoucherNo = `IC-VCH-${revenueInvoice.invoiceNumber}`;

    const expVoucher: FinanceLedgerEntry = {
      id: `fin-${expenseInvoice.id}`,
      companyId: expenseInvoice.buyerCompanyId,
      projectId: expenseInvoice.buyerProjectId,
      entryDate: expenseInvoice.issueDate,
      voucherNumber: expVoucherNo,
      accountName: `Intercompany Cost - ${expenseInvoice.sellerCompanyName}`,
      debitUSD: expenseInvoice.amountUSD,
      creditUSD: 0,
      description: `Bilateral Procurement: ${expenseInvoice.title} from sister subsidiary ${expenseInvoice.sellerCompanyName} (Eliminated in Consolidation)`,
      sourceModule: 'PROCUREMENT',
      postedBy: `${currentUser.name} (Intercompany Mirror Engine)`
    };

    const revVoucher: FinanceLedgerEntry = {
      id: `fin-${revenueInvoice.id}`,
      companyId: revenueInvoice.sellerCompanyId,
      projectId: revenueInvoice.sellerProjectId,
      entryDate: revenueInvoice.issueDate,
      voucherNumber: revVoucherNo,
      accountName: `Intercompany Revenue - ${revenueInvoice.buyerCompanyName}`,
      debitUSD: 0,
      creditUSD: revenueInvoice.amountUSD,
      description: `Bilateral Sales Revenue: ${revenueInvoice.title} to sister subsidiary ${revenueInvoice.buyerCompanyName} (Eliminated in Consolidation)`,
      sourceModule: 'GATE_SCAN_AUTO',
      postedBy: `${currentUser.name} (Intercompany Mirror Engine)`
    };

    setFinanceLedgers(prev => [expVoucher, revVoucher, ...prev]);

    addNotification({
      title: `Bilateral Invoices Generated: ${expenseInvoice.pairCode}`,
      titleKu: `فاکتۆری دوولایەنە دروستکرا: ${expenseInvoice.pairCode}`,
      titleAr: `تم توليد فاتورتين متقابلتين: ${expenseInvoice.pairCode}`,
      message: `Pair ${expenseInvoice.pairCode} created: Expense for ${expenseInvoice.buyerCompanyName} ($${expenseInvoice.amountUSD.toLocaleString()}) and Revenue for ${expenseInvoice.sellerCompanyName}. Auto-eliminated in holding consolidation.`,
      type: 'FINANCE_ENTRY'
    });

    return { expenseInvoice, revenueInvoice };
  }, [companies, currentUser.name]);

  const settleIntercompanyInvoice = useCallback((pairId: string) => {
    setIntercompanyInvoices(prev => {
      const updated = prev.map(inv => {
        if (inv.pairId === pairId) {
          return {
            ...inv,
            status: 'SETTLED' as const,
            settledAt: new Date().toISOString().split('T')[0],
            settledBy: currentUser.name || 'Holding Central Treasury'
          };
        }
        return inv;
      });
      try {
        localStorage.setItem('sas4erp_intercompany_invoices', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    addNotification({
      title: 'Intercompany Pair Settled',
      titleKu: 'مامەڵەی دوولایەنەی نێوان کۆمپانیاکان یەکلاکرایەوە',
      titleAr: 'تمت تسوية المعاملة البينية بنجاح',
      message: `Bilateral transaction cleared through Holding Central Treasury with mutual offset.`,
      type: 'FINANCE_ENTRY'
    });
  }, [currentUser.name]);

  const deleteIntercompanyPair = useCallback((pairId: string) => {
    setIntercompanyInvoices(prev => {
      const updated = prev.filter(inv => inv.pairId !== pairId);
      try {
        localStorage.setItem('sas4erp_intercompany_invoices', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Modals
  const [isGateScannerOpen, setIsGateScannerOpen] = useState<boolean>(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState<boolean>(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isHoldingSetupOpen, setIsHoldingSetupOpen] = useState<boolean>(false);
  const [isUserManualOpen, setIsUserManualOpen] = useState<boolean>(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState<boolean>(false);
  const [licenseModalInitialTab, setLicenseModalInitialTab] = useState<'activate' | 'generator'>('activate');
  const [isOwnerVerifyModalOpen, setIsOwnerVerifyModalOpen] = useState<boolean>(false);
  const [systemLicense, setSystemLicense] = useState<SystemLicenseInfo>(() => getStoredSystemLicense());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const openLicenseModal = (tab: 'activate' | 'generator' = 'activate') => {
    setLicenseModalInitialTab(tab);
    setIsLicenseModalOpen(true);
  };
  const [activeCallingManager, setActiveCallingManager] = useState<{ name: string; role: string; phone: string; company: string; avatar: string } | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<VirtualMeeting | null>(initialVirtualMeetings[0]);
  const [activeInspectingDept, setActiveInspectingDept] = useState<{ companyId: string; projectId?: string; department: DepartmentOverview } | null>(null);

  // Skyline Architectural Colored Background State
  const [isSkylineBgEnabled, setIsSkylineBgEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sas4erp_skyline_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [skylineBgPreset, setSkylineBgPresetState] = useState<'corporate_prism' | 'district_violet' | 'skyline_waterfront'>(() => {
    try {
      const saved = localStorage.getItem('sas4erp_skyline_preset');
      if (saved === 'district_violet' || saved === 'skyline_waterfront' || saved === 'corporate_prism') {
        return saved;
      }
      return 'corporate_prism';
    } catch {
      return 'corporate_prism';
    }
  });

  const [skylineBgOpacity, setSkylineBgOpacityState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sas4erp_skyline_opacity');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 5 && parsed <= 60) return parsed;
      }
      return 22; // Default 22% ensures vibrant colors without washing out text
    } catch {
      return 22;
    }
  });

  const [skylineBgBlur, setSkylineBgBlurState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sas4erp_skyline_blur');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isSkylineModalOpen, setIsSkylineModalOpen] = useState<boolean>(false);

  const setIsSkylineBgEnabled = (enabled: boolean) => {
    setIsSkylineBgEnabledState(enabled);
    try {
      localStorage.setItem('sas4erp_skyline_enabled', String(enabled));
    } catch {}
  };

  const setSkylineBgPreset = (preset: 'corporate_prism' | 'district_violet' | 'skyline_waterfront') => {
    setSkylineBgPresetState(preset);
    try {
      localStorage.setItem('sas4erp_skyline_preset', preset);
    } catch {}
  };

  const setSkylineBgOpacity = (opacity: number) => {
    const val = Math.max(5, Math.min(60, opacity));
    setSkylineBgOpacityState(val);
    try {
      localStorage.setItem('sas4erp_skyline_opacity', String(val));
    } catch {}
  };

  const setSkylineBgBlur = (blur: boolean) => {
    setSkylineBgBlurState(blur);
    try {
      localStorage.setItem('sas4erp_skyline_blur', String(blur));
    } catch {}
  };

  // Holding Cloud Real-Time Multi-Laptop Synchronization State (Erbil HQ <-> Halabja Site)
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState<boolean>(false);
  const [holdingCloudSyncStatus, setHoldingCloudSyncStatus] = useState<HoldingCloudSyncStatus>(
    holdingCloudSyncService.getStatus()
  );
  const [holdingSyncKey, setHoldingSyncKey] = useState<string>(
    () => holdingCloudSyncService.getNodeProfile().holdingKey
  );

  const triggerForceSync = useCallback(async () => {
    const remoteState = await holdingCloudSyncService.pullLatestState();
    if (remoteState) {
      if (Array.isArray(remoteState.companies)) setCompanies(remoteState.companies);
      if (Array.isArray(remoteState.projects)) setProjects(remoteState.projects);
      if (Array.isArray(remoteState.purchaseOrders)) setPurchaseOrders(remoteState.purchaseOrders);
      if (Array.isArray(remoteState.gateLogs)) setGateLogs(remoteState.gateLogs);
      if (Array.isArray(remoteState.financeLedgers)) setFinanceLedgers(remoteState.financeLedgers);
      if (Array.isArray(remoteState.intercompanyInvoices)) setIntercompanyInvoices(remoteState.intercompanyInvoices);
      if (Array.isArray(remoteState.warehouseItems)) setWarehouseItems(remoteState.warehouseItems);
      if (Array.isArray(remoteState.projectReports)) setProjectReports(remoteState.projectReports);
      if (remoteState.holding && typeof remoteState.holding === 'object') {
        setHolding(prev => ({ ...prev, ...remoteState.holding }));
      }
    }
    await holdingCloudSyncService.executePush();
  }, []);

  const handleUpdateHoldingSyncKey = useCallback((newKey: string) => {
    setHoldingSyncKey(newKey);
    holdingCloudSyncService.setNodeProfile({ holdingKey: newKey });
  }, []);

  useEffect(() => {
    // 1. Subscribe to sync status updates
    const unsubStatus = holdingCloudSyncService.onStatusChange((status) => {
      setHoldingCloudSyncStatus(status);
      setHoldingSyncKey(status.holdingKey);
    });

    // 2. Subscribe to remote SSE pushes
    const unsubRemote = holdingCloudSyncService.onRemoteUpdate((remoteState) => {
      if (!remoteState) return;
      if (Array.isArray(remoteState.companies)) setCompanies(remoteState.companies);
      if (Array.isArray(remoteState.projects)) setProjects(remoteState.projects);
      if (Array.isArray(remoteState.purchaseOrders)) setPurchaseOrders(remoteState.purchaseOrders);
      if (Array.isArray(remoteState.gateLogs)) setGateLogs(remoteState.gateLogs);
      if (Array.isArray(remoteState.financeLedgers)) setFinanceLedgers(remoteState.financeLedgers);
      if (Array.isArray(remoteState.intercompanyInvoices)) setIntercompanyInvoices(remoteState.intercompanyInvoices);
      if (Array.isArray(remoteState.warehouseItems)) setWarehouseItems(remoteState.warehouseItems);
      if (Array.isArray(remoteState.projectReports)) setProjectReports(remoteState.projectReports);
      if (remoteState.holding && typeof remoteState.holding === 'object') {
        setHolding(prev => ({ ...prev, ...remoteState.holding }));
      }
    });

    // 3. Handshake and connect with Holding Cloud Hub
    holdingCloudSyncService.connect();

    return () => {
      unsubStatus();
      unsubRemote();
    };
  }, []);

  // Debounced Auto-Push local updates to Holding Cloud
  useEffect(() => {
    holdingCloudSyncService.schedulePush({
      holding,
      companies,
      projects,
      purchaseOrders,
      gateLogs,
      financeLedgers,
      intercompanyInvoices,
      warehouseItems,
      projectReports,
    });
  }, [
    holding,
    companies,
    projects,
    purchaseOrders,
    gateLogs,
    financeLedgers,
    intercompanyInvoices,
    warehouseItems,
    projectReports,
  ]);

  // Persist key state
  useEffect(() => {
    localStorage.setItem('sas4erp_holding', JSON.stringify(holding));
  }, [holding]);

  useEffect(() => {
    localStorage.setItem('sas4erp_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('sas4erp_general_managers', JSON.stringify(generalManagers));
  }, [generalManagers]);

  useEffect(() => {
    localStorage.setItem('sas4erp_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('sas4erp_pos', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('sas4erp_foreign_workers', JSON.stringify(foreignWorkers));
  }, [foreignWorkers]);

  useEffect(() => {
    localStorage.setItem('sas4erp_project_reports', JSON.stringify(projectReports));
  }, [projectReports]);

  useEffect(() => {
    localStorage.setItem('sas4erp_anomaly_alerts', JSON.stringify(anomalyAlerts));
  }, [anomalyAlerts]);

  useEffect(() => {
    localStorage.setItem('sas4erp_attendance_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('sas4erp_anomaly_stats', JSON.stringify(anomalyStats));
  }, [anomalyStats]);

  // Holding Local Mesh Network Synchronization Listener
  useEffect(() => {
    const unsubscribe = offlineMeshService.subscribe((event) => {
      if (event.type === 'peer_mutation_received') {
        const mut = event.data;
        if (mut?.type === 'APPROVE_PO') {
          const poNumber = mut.payload?.poNumber;
          if (poNumber) {
            setPurchaseOrders((prev) =>
              prev.map((po) =>
                po.poNumber === poNumber ? { ...po, status: 'APPROVED_BY_OWNER' } : po
              )
            );
          }
        } else if (mut?.type === 'ADD_GATE_LOG' && mut.payload) {
          const newEntry: GateEntryLog = {
            id: `gate-mesh-${Date.now()}`,
            scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            barcode: `BC-MESH-${Date.now().toString().slice(-6)}`,
            poNumber: mut.payload.poNumber || 'PO-OFFLINE-SYNC',
            companyId: companies[0]?.id || 'comp-1',
            supplierName: mut.payload.driverName || 'Mesh Logistics Driver',
            materialSummary: mut.payload.cargoType || 'Industrial Supplies',
            totalAmountUSD: mut.payload.amountUSD || 0,
            securityOfficer: 'Mesh Auto Guard',
            gateLocation: mut.payload.gateNode || 'Gate Alpha',
            vehiclePlate: mut.payload.plateNumber || 'IRAQ-LOGISTICS',
            driverName: mut.payload.driverName || 'Driver',
            status: 'VERIFIED',
            tripleNotification: {
              warehouseNotified: true,
              financeNotified: true,
              financeAutoEntryCreated: true,
              managerNotified: true
            }
          };
          setGateLogs((prev) => [newEntry, ...prev]);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [companies]);

  const runMLScan = (customSensitivity?: MLSensitivityLevel) => {
    const sensitivity = customSensitivity || mlSensitivity;
    const result = runFullMLScan(
      purchaseOrders,
      financeLedgers,
      attendanceRecords,
      companies,
      projects,
      anomalyAlerts,
      sensitivity
    );
    setAnomalyAlerts(result.alerts);
    setAnomalyStats(result.stats);

    const newCritical = result.alerts.find(a => a.severity === 'CRITICAL' && a.status === 'TRIGGERED');
    if (newCritical) {
      addNotification({
        title: `🚨 ML Sentinel Alert: ${newCritical.titleKu || newCritical.title}`,
        titleKu: `🚨 چاودێری زیرەکی دەستکرد: ${newCritical.titleKu}`,
        titleAr: `🚨 تنبيه الذكاء الاصطناعي: ${newCritical.titleAr}`,
        message: newCritical.descriptionKu || newCritical.description,
        type: 'ML_ANOMALY_ALERT',
        relatedId: newCritical.id
      });
    }
  };

  const updateAnomalyStatus = (alertId: string, status: AnomalyStatus, decisionNotes?: string) => {
    setAnomalyAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status,
          executiveDecisionNotes: decisionNotes || a.executiveDecisionNotes,
          resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : a.resolvedAt,
          resolvedBy: status === 'RESOLVED' ? currentUser.name : a.resolvedBy
        };
      }
      return a;
    }));
  };

  const executeAnomalyAction = (alertId: string, actionName: string) => {
    const alert = anomalyAlerts.find(a => a.id === alertId);
    if (!alert) return;

    if (alert.category === 'PROCUREMENT' && alert.relatedEntityId) {
      setPurchaseOrders(prev => prev.map(p => {
        if (p.poNumber === alert.relatedEntityId) {
          return { ...p, status: 'REJECTED_BY_OWNER' };
        }
        return p;
      }));
    }

    setAnomalyAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'RESOLVED',
          actionTaken: actionName,
          executiveDecisionNotes: `Executive action taken: ${actionName} by ${currentUser.name}`,
          resolvedBy: currentUser.name,
          resolvedAt: new Date().toISOString()
        };
      }
      return a;
    }));

    addNotification({
      title: `Executive Action Executed: ${actionName}`,
      titleKu: `بڕیاری خاوەن هۆلدینگ جێبەجێکرا: ${actionName}`,
      titleAr: `تم تنفيذ الإجراء التنفيذي: ${actionName}`,
      message: `Action successfully enforced for anomaly alert #${alertId}.`,
      type: 'ML_ANOMALY_ALERT'
    });
  };

  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: `ATT-REC-${Date.now()}`
    };
    setAttendanceRecords(prev => [newRecord, ...prev]);
  };

  const simulateAnomalyPattern = (patternType: 'SPLIT_PO' | 'OFF_HOURS_FINANCE' | 'GHOST_WORKER') => {
    if (patternType === 'SPLIT_PO') {
      const now = new Date();
      const compId = companies[0]?.id || 'comp-1';
      const projId = projects[0]?.id || 'proj-1';
      const po1: PurchaseOrder = {
        id: `po-sim-1-${Date.now()}`,
        poNumber: `PO-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        companyId: compId,
        projectId: projId,
        requestedBy: 'Karwan N. (Site Procurement)',
        requesterRole: 'Procurement Officer',
        supplierName: 'Kani Heavy Materials Co.',
        items: [{ id: '1', name: 'Reinforced Steel Rebar 16mm', quantity: 45, unit: 'Tons', unitPriceUSD: 1080, totalUSD: 48600, category: 'Steel' }],
        subtotalUSD: 48600,
        taxUSD: 0,
        totalAmountUSD: 48600,
        currency: 'USD',
        purpose: 'Batch allocation delivery Phase 2',
        originalLanguage: 'ku',
        createdDate: now.toISOString(),
        status: 'PENDING_OWNER_APPROVAL'
      };
      const po2: PurchaseOrder = {
        id: `po-sim-2-${Date.now()}`,
        poNumber: `PO-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        companyId: compId,
        projectId: projId,
        requestedBy: 'Karwan N. (Site Procurement)',
        requesterRole: 'Procurement Officer',
        supplierName: 'Kani Heavy Materials Co.',
        items: [{ id: '2', name: 'Reinforced Steel Rebar 12mm', quantity: 44, unit: 'Tons', unitPriceUSD: 1120, totalUSD: 49280, category: 'Steel' }],
        subtotalUSD: 49280,
        taxUSD: 0,
        totalAmountUSD: 49280,
        currency: 'USD',
        purpose: 'Batch allocation delivery Phase 2 Part B',
        originalLanguage: 'ku',
        createdDate: new Date(now.getTime() + 15 * 60000).toISOString(),
        status: 'PENDING_OWNER_APPROVAL'
      };
      setPurchaseOrders(prev => [po1, po2, ...prev]);

      setTimeout(() => {
        runMLScan('STRICT');
      }, 300);
    } else if (patternType === 'OFF_HOURS_FINANCE') {
      const simVoucher: FinanceLedgerEntry = {
        id: `fin-sim-${Date.now()}`,
        companyId: companies[0]?.id || 'comp-1',
        projectId: projects[0]?.id,
        entryDate: '2026-10-18T02:15:00Z',
        voucherNumber: `VOUCH-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        accountName: 'Unreconciled Clearing Account',
        debitUSD: 72500,
        creditUSD: 0,
        description: 'Off-hours emergency manual transfer without PO link',
        sourceModule: 'DIRECT_MANUAL',
        postedBy: 'Remote Accountant VPN'
      };
      setFinanceLedgers(prev => [simVoucher, ...prev]);

      setTimeout(() => {
        runMLScan('STANDARD');
      }, 300);
    } else if (patternType === 'GHOST_WORKER') {
      const ghostRec: AttendanceRecord = {
        id: `att-sim-${Date.now()}`,
        employeeId: 'EMP-GHOST',
        employeeName: 'حەمید ئەحمەد تاهیر (Hamid A.)',
        employeeRole: 'Field Inspector',
        companyId: companies[0]?.id || 'comp-1',
        companyName: companies[0]?.name || 'Subsidiary',
        projectId: projects[0]?.id,
        projectName: projects[0]?.nameKu || 'Project Site',
        date: '2026-10-18',
        checkInTime: '09:05',
        checkOutTime: '17:00',
        siteLocation: 'Erbil Heights Gate #3',
        deviceType: 'RFID_GATE',
        workHours: 8.0,
        overtimeHours: 0,
        status: 'IMPOSSIBLE_TRANSIT',
        anomalyFlag: true
      };
      const ghostRec2: AttendanceRecord = {
        id: `att-sim-2-${Date.now()}`,
        employeeId: 'EMP-GHOST',
        employeeName: 'حەمید ئەحمەد تاهیر (Hamid A.)',
        employeeRole: 'Field Inspector',
        companyId: companies[0]?.id || 'comp-1',
        companyName: companies[0]?.name || 'Subsidiary',
        projectId: projects[1]?.id,
        projectName: projects[1]?.nameKu || 'Distant Site',
        date: '2026-10-18',
        checkInTime: '09:22',
        checkOutTime: '17:00',
        siteLocation: 'Sulaymaniyah Gate #1',
        deviceType: 'RFID_GATE',
        workHours: 8.0,
        overtimeHours: 0,
        status: 'IMPOSSIBLE_TRANSIT',
        anomalyFlag: true
      };
      setAttendanceRecords(prev => [ghostRec2, ghostRec, ...prev]);

      setTimeout(() => {
        runMLScan('STRICT');
      }, 300);
    }
  };

  const updateHolding = (data: Partial<HoldingGroup>) => {
    setHolding(prev => {
      const updated = {
        ...prev,
        ...data,
        systemPlatformName: 'SAS',
      };
      if (data.chairmanName !== undefined) {
        const trimmed = data.chairmanName.trim();
        setCurrentUser(curr => {
          if (curr.role === 'HOLDING_OWNER') {
            return {
              ...curr,
              name: trimmed || 'خاوەنی هۆلدینگ (Holding Owner)',
            };
          }
          return curr;
        });
      }
      return updated;
    });
  };

  const addDepartmentToEntity = (entityType: 'COMPANY' | 'PROJECT', entityId: string, dept: Omit<DepartmentOverview, 'id'>) => {
    const newDept: DepartmentOverview = {
      ...dept,
      id: `${entityType === 'PROJECT' ? 'PRJ-DEP' : 'CMP-DEP'}-CUSTOM-${Date.now().toString().slice(-4)}`
    };

    if (entityType === 'COMPANY') {
      setCompanies(prev => prev.map(c => {
        if (c.id === entityId) {
          return {
            ...c,
            departments: [...(c.departments || []), newDept]
          };
        }
        return c;
      }));
    } else {
      setProjects(prev => prev.map(p => {
        if (p.id === entityId) {
          return {
            ...p,
            departments: [...(p.departments || []), newDept]
          };
        }
        return p;
      }));
    }

    addNotification({
      title: `New Department Added: ${newDept.nameKu || newDept.name}`,
      titleKu: `بەشی نوێ زیادکرا: ${newDept.nameKu || newDept.name}`,
      titleAr: `تمت إضافة قسم جديد: ${newDept.nameAr || newDept.name}`,
      message: `New department successfully activated under holding supervision.`,
      type: 'FINANCE_ENTRY'
    });
  };

  const deleteDepartmentFromEntity = (entityType: 'COMPANY' | 'PROJECT', entityId: string, deptId: string) => {
    if (entityType === 'COMPANY') {
      setCompanies(prev => prev.map(c => c.id === entityId ? { ...c, departments: (c.departments || []).filter(d => d.id !== deptId) } : c));
    } else {
      setProjects(prev => prev.map(p => p.id === entityId ? { ...p, departments: (p.departments || []).filter(d => d.id !== deptId) } : p));
    }
  };

  const importBatchCompanies = (newComps: Partial<Company>[]) => {
    const fullComps: Company[] = newComps.map((c, idx) => {
      const id = c.id || `comp-${Date.now()}-${idx}`;
      const name = c.name || `Company ${idx + 1}`;
      const gm = c.generalManager || 'بەڕێوەبەری گشتی';
      return {
        id,
        name,
        nameKu: c.nameKu || name,
        nameAr: c.nameAr || name,
        code: c.code || `CMP-${Math.floor(10 + Math.random() * 90)}`,
        industry: c.industry || 'General Industry',
        generalManager: gm,
        gmPhone: c.gmPhone || '+964 750 000 0000',
        gmEmail: c.gmEmail || 'info@holding.com',
        location: c.location || 'Headquarters',
        annualBudgetUSD: Number(c.annualBudgetUSD) || 0,
        spentUSD: Number(c.spentUSD) || 0,
        activeProjectsCount: c.activeProjectsCount || 0,
        employeeCount: c.employeeCount || 0,
        establishedDate: c.establishedDate || '2026-01-01',
        color: c.color || '#0284c7',
        iconName: c.iconName || 'Building2',
        holdingLinkStatus: 'CONNECTED_LIVE',
        holdingConnectionId: `LINK-HQ-CMP-${Date.now().toString().slice(-4)}`,
        departments: c.departments || generateDefaultDepartments('COMPANY', name, gm)
      };
    });

    setCompanies(prev => [...prev, ...fullComps]);
    setHolding(prev => ({ ...prev, totalCompanies: prev.totalCompanies + fullComps.length }));
  };

  const importBatchProjects = (newProjs: Partial<Project>[]) => {
    const fullProjs: Project[] = newProjs.map((p, idx) => {
      const id = p.id || `proj-${Date.now()}-${idx}`;
      const name = p.name || `Project ${idx + 1}`;
      const manager = p.manager || 'بەڕێوەبەری پڕۆژە';
      return {
        id,
        companyId: p.companyId || (companies[0]?.id || 'comp-1'),
        name,
        nameKu: p.nameKu || name,
        nameAr: p.nameAr || name,
        code: p.code || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
        manager,
        managerPhone: p.managerPhone || '+964 750 000 0000',
        budgetUSD: Number(p.budgetUSD) || 0,
        spentUSD: Number(p.spentUSD) || 0,
        startDate: p.startDate || '2026-01-01',
        targetCompletionDate: p.targetCompletionDate || '2027-12-31',
        progressPercentage: Number(p.progressPercentage) || 0,
        location: p.location || 'Project Site',
        engineersCount: Number(p.engineersCount) || 0,
        workersCount: Number(p.workersCount) || 0,
        status: (p.status || 'ACTIVE') as any,
        holdingLinkStatus: 'CONNECTED_LIVE',
        holdingConnectionId: `LINK-SITE-PRJ-${Date.now().toString().slice(-4)}`,
        departments: p.departments || generateDefaultDepartments('PROJECT', name, manager)
      };
    });

    setProjects(prev => [...prev, ...fullProjs]);
    setHolding(prev => ({ ...prev, totalProjects: prev.totalProjects + fullProjs.length }));
  };

  const importBatchFinanceLedgers = (newEntries: Partial<FinanceLedgerEntry>[]) => {
    const fullEntries: FinanceLedgerEntry[] = newEntries.map((e, idx) => ({
      id: `led-${Date.now()}-${idx}`,
      voucherNumber: e.voucherNumber || `VCH-IMP-${1000 + idx}`,
      companyId: e.companyId || (companies[0]?.id || 'comp-1'),
      projectId: e.projectId,
      accountName: e.accountName || 'Account Ledger Entry',
      debitUSD: Number(e.debitUSD) || 0,
      creditUSD: Number(e.creditUSD) || 0,
      description: e.description || 'Imported historical accounting record',
      entryDate: e.entryDate || new Date().toISOString().split('T')[0],
      sourceModule: (e.sourceModule || 'DIRECT_MANUAL') as any,
      postedBy: e.postedBy || 'Data Migration Hub'
    }));

    setFinanceLedgers(prev => [...fullEntries, ...prev]);
  };

  const importBatchEmployees = (newEmps: Partial<Employee>[]) => {
    const fullEmps: Employee[] = newEmps.map((emp, idx) => ({
      id: `emp-${Date.now()}-${idx}`,
      companyId: emp.companyId || (companies[0]?.id || 'comp-1'),
      projectId: emp.projectId,
      fullName: emp.fullName || `Employee ${idx + 1}`,
      department: emp.department || 'General Administration',
      role: emp.role || 'Staff Member',
      salaryUSD: Number(emp.salaryUSD) || 0,
      phone: emp.phone || '+964 750 000 0000',
      email: emp.email || 'employee@holding.com',
      joinDate: emp.joinDate || '2026-01-01',
      status: (emp.status || 'ACTIVE') as any,
      nationality: emp.nationality || 'Local'
    }));

    setEmployees(prev => [...prev, ...fullEmps]);
    setHolding(prev => ({ ...prev, totalEmployees: prev.totalEmployees + fullEmps.length }));
  };

  const importBatchWarehouseItems = (newItems: Partial<WarehouseItem>[]) => {
    const fullItems: WarehouseItem[] = newItems.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      companyId: item.companyId || (companies[0]?.id || 'comp-1'),
      itemCode: item.itemCode || `SKU-${100 + idx}`,
      name: item.name || `Inventory Item ${idx + 1}`,
      category: item.category || 'GENERAL',
      quantityOnHand: Number(item.quantityOnHand) || 0,
      unit: item.unit || 'PCS',
      minimumThreshold: Number(item.minimumThreshold) || 10,
      averageUnitCostUSD: Number(item.averageUnitCostUSD) || 0,
      binLocation: item.binLocation || 'Shelf-1',
      lastRestockedDate: item.lastRestockedDate || new Date().toISOString().split('T')[0],
      supplier: item.supplier || 'Imported Vendor'
    }));

    setWarehouseItems(prev => [...prev, ...fullItems]);
  };

  const addCompany = (newComp: Omit<Company, 'id'>) => {
    const id = `comp-${Date.now()}`;
    const generatedDepts = newComp.departments || generateDefaultDepartments('COMPANY', newComp.name, newComp.generalManager);
    const fullComp: Company = {
      ...newComp,
      id,
      holdingLinkStatus: newComp.holdingLinkStatus || 'CONNECTED_LIVE',
      holdingConnectionId: newComp.holdingConnectionId || `LINK-HQ-COMP-${Date.now().toString().slice(-4)}`,
      departments: generatedDepts,
    };
    setCompanies(prev => [...prev, fullComp]);
    setHolding(prev => ({ ...prev, totalCompanies: prev.totalCompanies + 1 }));

    // Automatically register the GM profile if specified
    if (fullComp.generalManager) {
      const gmId = `gm-comp-${fullComp.id}`;
      const gmProfile: GeneralManagerProfile = {
        id: gmId,
        fullName: fullComp.generalManager,
        fullNameKu: fullComp.generalManager,
        title: 'General Manager (بەڕێوەبەری گشتی)',
        assignedCompanyId: fullComp.id,
        assignedCompanyName: fullComp.nameKu || fullComp.name,
        phone: fullComp.gmPhone || '+964 750 000 0000',
        email: fullComp.gmEmail || 'gm@holding.com',
        avatar: '👔',
        status: 'ACTIVE',
        kpiHealthScore: 94,
        completedMilestones: 3,
        totalAssignedTasks: 5,
        pendingApprovalsCount: 0,
        latestAchievementKu: 'بەستنەوەی سەرکەوتووانەی بەشەکان بە سیستەمی هۆلدینگ',
        latestAchievementEn: 'Successful integration of departments with holding ERP',
        currentWorkSummaryKu: 'دەستبەکاربوون و ڕێکخستنی ئەرکە دارایی و بەرهەمهێنانەکان',
        currentWorkSummaryEn: 'Operations kick-off and fiscal structuring',
        directReportsCount: fullComp.employeeCount || 8,
        allocatedBudgetUSD: fullComp.annualBudgetUSD || 0,
        spentBudgetUSD: fullComp.spentUSD || 0,
        joinDate: fullComp.establishedDate || new Date().toISOString().split('T')[0],
        lastActive: 'Just now',
      };
      setGeneralManagers(prev => [...prev.filter(g => g.assignedCompanyId !== fullComp.id), gmProfile]);
    }

    addNotification({
      title: `New Subsidiary Connected: ${fullComp.name}`,
      titleKu: `کۆمپانیای نوێ بەستراوە بە هۆلدینگ: ${fullComp.nameKu || fullComp.name}`,
      titleAr: `تم ربط شركة جديدة بالمجموعة: ${fullComp.nameAr || fullComp.name}`,
      message: `Company ${fullComp.code} successfully registered and connected to SAS4ERP Holding with live departmental reporting.`,
      type: 'OWNER_APPROVAL_REQUIRED',
    });
  };

  const updateCompany = (id: string, data: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    setProjects(prev => prev.filter(p => p.companyId !== id));
    setGeneralManagers(prev => prev.filter(g => g.assignedCompanyId !== id));
    setHolding(prev => ({
      ...prev,
      totalCompanies: Math.max(0, prev.totalCompanies - 1)
    }));
  };

  const addGeneralManager = (newGm: Omit<GeneralManagerProfile, 'id'>) => {
    const id = `gm-${Date.now()}`;
    const fullGm: GeneralManagerProfile = {
      ...newGm,
      id,
      kpiHealthScore: newGm.kpiHealthScore !== undefined ? newGm.kpiHealthScore : 100,
      completedMilestones: newGm.completedMilestones || 0,
      totalAssignedTasks: newGm.totalAssignedTasks || 0,
      pendingApprovalsCount: newGm.pendingApprovalsCount || 0,
      directReportsCount: newGm.directReportsCount || 0,
      allocatedBudgetUSD: newGm.allocatedBudgetUSD || 0,
      spentBudgetUSD: newGm.spentBudgetUSD || 0,
      joinDate: newGm.joinDate || new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
    };

    setGeneralManagers(prev => [...prev, fullGm]);

    // If assigned to a company, sync company GM info
    if (fullGm.assignedCompanyId) {
      setCompanies(prev => prev.map(c => {
        if (c.id === fullGm.assignedCompanyId) {
          return {
            ...c,
            generalManager: fullGm.fullNameKu || fullGm.fullName,
            gmPhone: fullGm.phone || c.gmPhone,
            gmEmail: fullGm.email || c.gmEmail,
          };
        }
        return c;
      }));
    }

    addNotification({
      title: `New General Manager Appointed: ${fullGm.fullNameKu || fullGm.fullName}`,
      titleKu: `بەڕێوەبەری گشتی نوێ دەستنیشانکرا: ${fullGm.fullNameKu || fullGm.fullName}`,
      titleAr: `تم تعيين مدير عام جديد: ${fullGm.fullNameAr || fullGm.fullName}`,
      message: `General Manager appointed to supervise subsidiary operations with full live dashboard visibility to Holding Owner.`,
      type: 'OWNER_APPROVAL_REQUIRED',
    });
  };

  const updateGeneralManager = (id: string, data: Partial<GeneralManagerProfile>) => {
    setGeneralManagers(prev => prev.map(gm => {
      if (gm.id === id) {
        const updated = { ...gm, ...data, lastActive: 'Just now' };
        if (updated.assignedCompanyId) {
          setCompanies(comps => comps.map(c => {
            if (c.id === updated.assignedCompanyId) {
              return {
                ...c,
                generalManager: updated.fullNameKu || updated.fullName,
                gmPhone: updated.phone || c.gmPhone,
                gmEmail: updated.email || c.gmEmail,
              };
            }
            return c;
          }));
        }
        return updated;
      }
      return gm;
    }));
  };

  const deleteGeneralManager = (id: string) => {
    setGeneralManagers(prev => prev.filter(gm => gm.id !== id));
  };

  const addProject = (newProj: Omit<Project, 'id'>) => {
    const id = `proj-${Date.now()}`;
    const generatedDepts = newProj.departments || generateDefaultDepartments('PROJECT', newProj.name, newProj.manager);
    
    // Project Expatriates Accommodation Hub
    const projCamp = newProj.accommodationDetails || {
      campId: `camp-${Date.now()}`,
      campName: `کەمپی نیشتەجێبوونی بیانیەکانی ${newProj.nameKu || newProj.name}`,
      campNameKu: `خاڵی نیشتەجێبوون و کەمپی کارمەندانی بیانی پڕۆژەی ${newProj.nameKu || newProj.name}`,
      location: `${newProj.location} - Residential Camp Zone`,
      type: 'ENGINEERS_RESIDENCE',
      totalBeds: 40,
      occupiedBeds: 0,
      supervisorName: 'سەرپەرشتیاری نیشتەجێبوونی بیانیەکان',
      supervisorPhone: newProj.managerPhone || '+964 750 000 0000',
      facilities: ['Central HVAC', 'High-Speed Wi-Fi', 'Dining Hall & Catering', '24/7 Security & CCTV', 'Medical Room'],
      blockName: 'Foreign Staff Quarters Block'
    };

    const fullProj: Project = {
      ...newProj,
      id,
      holdingLinkStatus: newProj.holdingLinkStatus || 'CONNECTED_LIVE',
      holdingConnectionId: newProj.holdingConnectionId || `LINK-SITE-PRJ-${Date.now().toString().slice(-4)}`,
      departments: generatedDepts,
      accommodationDetails: projCamp,
    };
    setProjects(prev => [...prev, fullProj]);
    setCompanies(prev => prev.map(c => c.id === fullProj.companyId ? { ...c, activeProjectsCount: c.activeProjectsCount + 1 } : c));
    setHolding(prev => ({ ...prev, totalProjects: prev.totalProjects + 1 }));

    // Register project's housing camp in the camps registry
    addCamp({
      name: projCamp.campNameKu || projCamp.campName,
      nameKu: projCamp.campNameKu || projCamp.campName,
      companyId: fullProj.companyId,
      projectId: id,
      projectName: fullProj.nameKu || fullProj.name,
      location: projCamp.location,
      type: projCamp.type,
      totalCapacity: projCamp.totalBeds,
      currentOccupants: projCamp.occupiedBeds,
      buildingsCount: 2,
      roomsCount: 16,
      facilities: projCamp.facilities,
      campSupervisor: projCamp.supervisorName,
      supervisorName: projCamp.supervisorName,
      supervisorPhone: projCamp.supervisorPhone,
      cateringStatus: 'OPERATIONAL',
      safetyScore: 99,
    });

    addNotification({
      title: `New Project Connected: ${fullProj.name}`,
      titleKu: `پڕۆژەی نوێ زیادکرا و بەسترایەوە: ${fullProj.nameKu || fullProj.name}`,
      titleAr: `تم ربط مشروع جديد بالمجموعة: ${fullProj.nameAr || fullProj.name}`,
      message: `Project ${fullProj.code} registered under holding supervision with departments, reporting workflow, and foreign housing hub.`,
      type: 'OWNER_APPROVAL_REQUIRED',
    });
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setHolding(prev => ({
      ...prev,
      totalProjects: Math.max(0, prev.totalProjects - 1)
    }));
  };

  const addSubProject = (projectId: string, subProjectData: Omit<SubProject, 'id' | 'projectId'>) => {
    const newSub: SubProject = {
      ...subProjectData,
      id: `sub-${projectId}-${Date.now().toString().slice(-4)}`,
      projectId
    };
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const currentSubs = p.subProjects || [];
      return {
        ...p,
        subProjects: [...currentSubs, newSub]
      };
    }));

    addNotification({
      title: `Sub-Project Added: ${newSub.name}`,
      titleKu: `ژێرپڕۆژەی نوێ زیادکرا: ${newSub.nameKu || newSub.name}`,
      titleAr: `تمت إضافة مشروع فرعي جديد: ${newSub.nameAr || newSub.name}`,
      message: `Start: ${newSub.startDate} | Target: ${newSub.targetCompletionDate} | Progress: ${newSub.progressPercentage}%`,
      type: 'OWNER_APPROVAL_REQUIRED'
    });
  };

  const updateSubProject = (projectId: string, subProjectId: string, data: Partial<SubProject>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updatedSubs = (p.subProjects || []).map(sub => sub.id === subProjectId ? { ...sub, ...data } : sub);
      return {
        ...p,
        subProjects: updatedSubs
      };
    }));
  };

  const deleteSubProject = (projectId: string, subProjectId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        subProjects: (p.subProjects || []).filter(sub => sub.id !== subProjectId)
      };
    }));
  };

  const addWorkflowRule = (ruleData: Omit<ApprovalChainRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRule: ApprovalChainRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setWorkflowRules(prev => {
      const updated = [newRule, ...prev];
      try {
        localStorage.setItem('sas4erp_workflow_rules', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addNotification({
      title: `Workflow Chain Created: ${newRule.nameEn}`,
      titleKu: `زنجیرەی نوێی پەسەندکردن دروستکرا: ${newRule.nameKu}`,
      titleAr: `تم إنشاء سلسلة اعتماد جديدة: ${newRule.nameAr}`,
      message: `Approval threshold set to $${newRule.ownerThresholdUSD.toLocaleString()} USD with ${newRule.steps.length} verification steps.`,
      type: 'OWNER_APPROVAL_REQUIRED'
    });
  };

  const updateWorkflowRule = (id: string, data: Partial<ApprovalChainRule>) => {
    setWorkflowRules(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString().split('T')[0] } : r);
      try {
        localStorage.setItem('sas4erp_workflow_rules', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteWorkflowRule = (id: string) => {
    setWorkflowRules(prev => {
      const updated = prev.filter(r => r.id !== id);
      try {
        localStorage.setItem('sas4erp_workflow_rules', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateThresholdPolicy = (policyData: Partial<HoldingThresholdPolicy>) => {
    setThresholdPolicy(prev => {
      const updated = {
        ...prev,
        ...policyData,
        lastUpdated: new Date().toISOString().split('T')[0],
        updatedBy: currentUser.name || 'Holding Chairman'
      };
      try {
        localStorage.setItem('sas4erp_threshold_policy', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addNotification({
      title: 'Holding Approval Thresholds Updated',
      titleKu: 'سنوورەکانی دەسەڵاتی پەسەندکردنی خاوەن هۆلدینگ نوێکرایەوە',
      titleAr: 'تم تحديث سياسات وصلاحيات مالك المجموعة',
      message: `Default owner threshold set to $${(policyData.defaultOwnerThresholdUSD || thresholdPolicy.defaultOwnerThresholdUSD).toLocaleString()} USD.`,
      type: 'FINANCE_ENTRY'
    });
  };

  const isPoDelegatedOrAutonomous = useCallback((po: PurchaseOrder): { isDelegated: boolean; mandate?: DelegatedSpendingMandate } => {
    if (po.delegatedToLocal && po.delegatedMandate) {
      return { isDelegated: true, mandate: po.delegatedMandate };
    }
    if (po.projectId) {
      const prj = projects.find(p => p.id === po.projectId);
      if (prj?.delegatedSpendingMandate?.isAutonomous) {
        if (!prj.delegatedSpendingMandate.maxAutonomousLimitUSD || po.totalAmountUSD <= prj.delegatedSpendingMandate.maxAutonomousLimitUSD) {
          return { isDelegated: true, mandate: prj.delegatedSpendingMandate };
        }
      }
    }
    if (po.companyId) {
      const comp = companies.find(c => c.id === po.companyId);
      if (comp?.delegatedSpendingMandate?.isAutonomous) {
        if (!comp.delegatedSpendingMandate.maxAutonomousLimitUSD || po.totalAmountUSD <= comp.delegatedSpendingMandate.maxAutonomousLimitUSD) {
          return { isDelegated: true, mandate: comp.delegatedSpendingMandate };
        }
      }
    }
    return { isDelegated: false };
  }, [projects, companies]);

  const isPoFullyApproved = useCallback((po: PurchaseOrder): boolean => {
    if (po.status === 'APPROVED_BY_OWNER' || po.status === 'ARRIVED_AT_GATE' || po.status === 'INSPECTED_AND_STORED' || po.status === 'FINANCIALLY_SETTLED') {
      return true;
    }
    if (po.workflowState) {
      if (po.workflowState.finalDecision === 'APPROVED') return true;

      // Check if PO is delegated to local / branch autonomy:
      const delegation = isPoDelegatedOrAutonomous(po);
      if (delegation.isDelegated) {
        const hasPmApproval = po.workflowState.steps.some(s => s.role === 'PROJECT_MANAGER' && s.status === 'APPROVED');
        const hasGmApproval = po.workflowState.steps.some(s => s.role === 'GENERAL_MANAGER' && s.status === 'APPROVED');
        const hasRejected = po.workflowState.steps.some(s => s.status === 'REJECTED');
        if (!hasRejected && (hasPmApproval || hasGmApproval)) {
          return true;
        }

        const pending = po.workflowState.steps.filter(s => s.status === 'PENDING');
        const nonHoldingPending = pending.filter(s => s.role !== 'HOLDING_OWNER' && s.role !== 'HOLDING_VP');
        if (nonHoldingPending.length === 0 && po.workflowState.steps.length > 0 && !hasRejected) {
          return true;
        }
      }

      const pending = po.workflowState.steps.filter(s => s.status === 'PENDING');
      return pending.length === 0 && po.workflowState.steps.length > 0;
    }
    return false;
  }, [isPoDelegatedOrAutonomous]);

  // Specialized Project Gate & Site Inward Entry Rule:
  // "کاتێک CEO پێشتر ڕەزامەندی لەسەر کڕینێک کردبێت، بۆ هاتنە ناو پڕۆژە تەنها رەزامەندی بەڕێوەبەری پڕۆژە یان بەڕێوەبەری کارگێری پێویستە"
  // "هەندێک حاڵەت ، CEO ماوە دەداتە کۆمپانیا یا پرۆژەکان کە خۆیان بریاردەری خەرجکردن بدەن بەبێ گەڕانەوە بۆ بنکەی سەرەکی"
  const canPoEnterProject = useCallback((po: PurchaseOrder): {
    allowed: boolean;
    reasonKu: string;
    reasonEn: string;
    isCeoPreApproved?: boolean;
    isDelegated?: boolean;
    missingSignersKu?: string;
  } => {
    if (po.status === 'APPROVED_BY_OWNER' || po.status === 'ARRIVED_AT_GATE' || po.status === 'INSPECTED_AND_STORED' || po.status === 'FINANCIALLY_SETTLED') {
      return { allowed: true, reasonKu: 'تەواوی مەرجەکان بەسەرکەوتوویی پەسەندکراون', reasonEn: 'All conditions fully met' };
    }
    if (po.workflowState?.finalDecision === 'APPROVED') {
      return { allowed: true, reasonKu: 'بڕیاری کۆتایی پەسەندکردنی جێبەجێکاری هەیە', reasonEn: 'Final approval decree granted' };
    }

    // SPECIAL BUSINESS RULE: DELEGATED SPENDING AUTHORITY FROM HQ TO BRANCH/PROJECT:
    const delegation = isPoDelegatedOrAutonomous(po);
    if (delegation.isDelegated) {
      const hasPmApproval = po.workflowState?.steps.some(
        s => s.role === 'PROJECT_MANAGER' && s.status === 'APPROVED'
      );
      const hasGmApproval = po.workflowState?.steps.some(
        s => s.role === 'GENERAL_MANAGER' && s.status === 'APPROVED'
      );

      if (hasPmApproval || hasGmApproval) {
        const signedBy = hasPmApproval && hasGmApproval
          ? 'بەڕێوەبەری پڕۆژە و بەڕێوەبەری کارگێڕی'
          : hasPmApproval ? 'بەڕێوەبەری پڕۆژە (PM)' : 'بەڕێوەبەری کارگێڕی (GM)';
        return {
          allowed: true,
          isDelegated: true,
          reasonKu: `⚡ بەپێی بڕیاری شۆڕکردنەوەی دەسەڵاتی بنکەی سەرەکی (${delegation.mandate?.decreeNumber || 'سەربەخۆیی مەیدانی'})، ${signedBy} بڕیاری خەرجی داوە بەبێ پێویستی گەڕانەوە بۆ بنکەی سەرەکی. هاتنە ناو پڕۆژە پەسەندە.`,
          reasonEn: `Spending authority delegated downward by HQ (${delegation.mandate?.decreeNumber || 'Autonomous Mandate'}). Approved locally by ${signedBy}. Project entry cleared without HQ referral.`
        };
      } else {
        return {
          allowed: false,
          isDelegated: true,
          missingSignersKu: 'بەڕێوەبەری پڕۆژە (PM) یان بەڕێوەبەری کارگێڕی (GM)',
          reasonKu: '⚡ بنکەی سەرەکی دەسەڵاتی خەرجکردنی شۆڕکردۆتەوە بۆ خوارەوە؛ تەنها واژۆی بەڕێوەبەری پڕۆژە یان بەڕێوەبەری کارگێڕی ماوە بۆ هاتنە ناو پڕۆژە.',
          reasonEn: 'HQ delegated spending authority downward; awaiting Project Manager or Admin General Manager signature to clear entry.'
        };
      }
    }

    // SPECIAL BUSINESS RULE (CEO PRE-APPROVAL + PM OR GM SIGN-OFF FOR SITE ENTRY):
    const hasCeoApproval = po.ceoPreApproved || 
      po.workflowState?.steps.some(s => (s.role === 'HOLDING_OWNER' || s.role === 'HOLDING_VP') && s.status === 'APPROVED') ||
      po.holdingApproval?.decision === 'APPROVED';

    if (hasCeoApproval) {
      const hasPmApproval = po.workflowState?.steps.some(
        s => s.role === 'PROJECT_MANAGER' && s.status === 'APPROVED'
      );
      const hasGmApproval = po.workflowState?.steps.some(
        s => s.role === 'GENERAL_MANAGER' && s.status === 'APPROVED'
      );

      if (hasPmApproval || hasGmApproval) {
        const approvedBy = hasPmApproval && hasGmApproval
          ? 'بەڕێوەبەری پڕۆژە و بەڕێوەبەری کارگێڕی'
          : hasPmApproval ? 'بەڕێوەبەری پڕۆژە (PM)' : 'بەڕێوەبەری کارگێڕی (GM)';
        return {
          allowed: true,
          isCeoPreApproved: true,
          reasonKu: `ڕەزامەندی CEO پێشتر دراوە + ${approvedBy} واژۆی کردووە. مۆڵەتی هاتنە ناو پڕۆژە بەتەواوی پەسەندە.`,
          reasonEn: `CEO pre-approved + signed by ${hasPmApproval ? 'Project Manager' : 'Admin Manager'}. Project entry cleared.`
        };
      } else {
        return {
          allowed: false,
          isCeoPreApproved: true,
          missingSignersKu: 'بەڕێوەبەری پڕۆژە (PM) یان بەڕێوەبەری کارگێڕی (GM)',
          reasonKu: 'ڕەزامەندی پێشوەختەی CEO هەیە، بەڵام بۆ هاتنە ناو پڕۆژە تەنها ڕەزامەندی بەڕێوەبەری پڕۆژە یان بەڕێوەبەری کارگێڕی پێویستە و هێشتا واژۆ نەکراوە.',
          reasonEn: 'CEO approved, but project site entry strictly requires sign-off from either the Project Manager or Administrative Manager.'
        };
      }
    }

    // Default sequential workflow check
    if (po.workflowState) {
      const pendingSteps = po.workflowState.steps.filter(s => s.status === 'PENDING');
      if (pendingSteps.length === 0 && po.workflowState.steps.length > 0) {
        return { allowed: true, reasonKu: 'تەواوی قۆناغەکان پەسەندکراون', reasonEn: 'All workflow steps fully approved' };
      }
      const nextPending = pendingSteps[0];
      return {
        allowed: false,
        missingSignersKu: nextPending?.titleKu || nextPending?.titleEn,
        reasonKu: `هێشتا زنجیرەی پەسەندکردن تەواو نەبووە (چاوەڕوانی: ${nextPending?.titleKu || nextPending?.titleEn})`,
        reasonEn: `Approval chain pending (${nextPending?.titleEn})`
      };
    }

    return { allowed: false, reasonKu: 'داواکارییەکە پەسەند نەکراوە', reasonEn: 'PO is unapproved' };
  }, [isPoDelegatedOrAutonomous]);

  const canUserApproveWorkflowStep = useCallback((
    user: UserProfile,
    po: PurchaseOrder,
    stepNumber: number
  ): { allowed: boolean; reasonKu: string; reasonEn: string; requiresOverride?: boolean } => {
    if (!po.workflowState) {
      return { allowed: false, reasonKu: 'هیچ ڕێڕەوێکی پەسەندکردن بوونی نییە', reasonEn: 'No workflow chain attached' };
    }

    const targetStep = po.workflowState.steps.find(s => s.stepNumber === stepNumber);
    if (!targetStep) {
      return { allowed: false, reasonKu: 'قۆناغی داواکراو نەدۆزرایەوە', reasonEn: 'Requested step not found' };
    }

    if (targetStep.status !== 'PENDING') {
      return {
        allowed: false,
        reasonKu: `ئەم قۆناغە پێشتر بڕیاری لەسەر دراوە (${targetStep.status})`,
        reasonEn: `This step has already been processed (${targetStep.status})`
      };
    }

    // Check if authority is delegated from HQ downwards
    const delegation = isPoDelegatedOrAutonomous(po);
    const isDelegatedStep = delegation.isDelegated && (targetStep.role === 'HOLDING_OWNER' || targetStep.role === 'HOLDING_VP');
    if (isDelegatedStep) {
      return {
        allowed: false,
        reasonKu: 'ئەم قۆناغە لەلایەن بنکەی سەرەکییەوە شۆڕکراوەتەوە بۆ لقی کۆمپانیا/پڕۆژە؛ پێویست بە واژۆی سەرۆکایەتی ناکات.',
        reasonEn: 'This step was delegated downward to branch/project autonomy; HQ referral bypassed.'
      };
    }

    // Check Sequential Gating: All prior steps (stepNumber < current) MUST be APPROVED
    // EXCEPTION 1: When CEO pre-approved, PM or GM can approve directly without waiting for other prior steps!
    // EXCEPTION 2: When delegated from HQ, local PM/GM can approve without holding owner blockage!
    const isCeoApproved = po.ceoPreApproved || po.workflowState.steps.some(s => (s.role === 'HOLDING_OWNER' || s.role === 'HOLDING_VP') && (s.status === 'APPROVED' || s.status === 'DELEGATED_TO_BRANCH'));
    const isTargetPmOrGm = targetStep.role === 'PROJECT_MANAGER' || targetStep.role === 'GENERAL_MANAGER' || targetStep.role === 'DEPARTMENT_HEAD';

    const priorPendingSteps = po.workflowState.steps.filter(s => {
      if (s.stepNumber >= stepNumber) return false;
      if (s.status === 'APPROVED' || s.status === 'DELEGATED_TO_BRANCH' || s.status === 'SKIPPED') return false;
      if (delegation.isDelegated && (s.role === 'HOLDING_OWNER' || s.role === 'HOLDING_VP')) return false;
      return true;
    });

    if (priorPendingSteps.length > 0 && !(isCeoApproved && isTargetPmOrGm) && !delegation.isDelegated) {
      const priorStepNames = priorPendingSteps.map(s => s.titleKu || s.titleEn).join(', ');
      const isExecutive = user.role === 'HOLDING_OWNER' || user.role === 'SUPER_ADMIN';
      return {
        allowed: false,
        requiresOverride: isExecutive,
        reasonKu: `قۆناغەکانی پێشوو هێشتا پەسەند نەکراون: (${priorStepNames}). پێویستە سەرەتا ئەوان تەواو بکرێن.`,
        reasonEn: `Prior steps must be approved first: (${priorPendingSteps.map(s => s.titleEn).join(', ')}).`
      };
    }

    // Role-based authorization
    const isSuperAdmin = user.role === 'SUPER_ADMIN';
    const isOwner = user.role === 'HOLDING_OWNER';
    const isGM = user.role === 'COMPANY_GM';
    const isPM = user.role === 'PROJECT_MANAGER' || user.role === 'TECHNICAL_HEAD';
    const isFinance = user.role === 'FINANCE_HEAD';
    const isWarehouse = user.role === 'WAREHOUSE_OFFICER';

    let roleMatches = false;
    switch (targetStep.role) {
      case 'PROJECT_MANAGER':
        roleMatches = isPM || isSuperAdmin;
        break;
      case 'WAREHOUSE_OFFICER':
        roleMatches = isWarehouse || isSuperAdmin;
        break;
      case 'FINANCE_HEAD':
      case 'COST_CONTROLLER':
        roleMatches = isFinance || isSuperAdmin;
        break;
      case 'DEPARTMENT_HEAD':
        roleMatches = isFinance || isGM || isPM || isSuperAdmin;
        break;
      case 'GENERAL_MANAGER':
        roleMatches = isGM || isSuperAdmin;
        break;
      case 'HOLDING_VP':
      case 'HOLDING_OWNER':
        roleMatches = isOwner || isSuperAdmin;
        break;
      default:
        roleMatches = isSuperAdmin;
    }

    if (!roleMatches) {
      return {
        allowed: false,
        reasonKu: `تۆ دەسەڵاتی پەسەندکردنی (${targetStep.titleKu || targetStep.titleEn})ت نییە وەک ${user.title || user.role}.`,
        reasonEn: `You lack authority for (${targetStep.titleEn}) as ${user.title || user.role}.`
      };
    }

    return {
      allowed: true,
      reasonKu: 'ڕێگەپێدراوە بۆ پەسەندکردن',
      reasonEn: 'Authorized to approve step'
    };
  }, [isPoDelegatedOrAutonomous]);

  const approveWorkflowStep = useCallback((
    poId: string,
    stepNumber: number,
    decision: 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_INFO',
    comments: string = '',
    signatureImage?: string,
    sealStampImage?: string,
    isOverride: boolean = false
  ): { success: boolean; message: string } => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO || !targetPO.workflowState) {
      return { success: false, message: 'Purchase order or workflow not found' };
    }

    const check = canUserApproveWorkflowStep(currentUser, targetPO, stepNumber);
    if (!check.allowed && (!isOverride || !check.requiresOverride)) {
      addNotification({
        title: 'Approval Blocked / ڕێگری لە پەسەندکردن',
        titleKu: 'ڕێگری لە پەسەندکردن بەپێی زنجیرەی یاسایی',
        titleAr: 'تم منع الموافقة لمخالفة التسلسل الإداري',
        message: check.reasonKu || check.reasonEn,
        type: 'OWNER_APPROVAL_REQUIRED'
      });
      return { success: false, message: check.reasonEn };
    }

    const currentStep = targetPO.workflowState.steps.find(s => s.stepNumber === stepNumber);
    const performerRole = currentStep ? currentStep.role : currentUser.role;
    const performerName = currentUser.name;
    const finalComment = isOverride
      ? `[EXECUTIVE OVERRIDE BY ${currentUser.name}] ${comments || 'Authorized with holding sovereign authority overriding prior pending steps.'}`
      : (comments || (decision === 'APPROVED' ? `Step approved by ${performerName} (${performerRole})` : `Step rejected: ${comments}`));

    let updatedWorkflow = advanceWorkflowStep(
      targetPO.workflowState,
      targetPO.poNumber,
      stepNumber,
      decision,
      performerName,
      performerRole,
      finalComment
    );

    if (isOverride) {
      const updatedSteps = updatedWorkflow.steps.map(s => {
        if (s.stepNumber < stepNumber && s.status === 'PENDING') {
          return {
            ...s,
            status: 'APPROVED' as const,
            approverName: `${currentUser.name} (Override Decree)`,
            actionDate: new Date().toISOString().split('T')[0],
            comments: `Automatically endorsed by Holding Chairman override decree.`
          };
        }
        return s;
      });
      const remainingPending = updatedSteps.find(s => s.status === 'PENDING');
      updatedWorkflow = {
        ...updatedWorkflow,
        steps: updatedSteps,
        currentStepNumber: remainingPending ? remainingPending.stepNumber : updatedWorkflow.totalSteps,
        finalDecision: !remainingPending ? 'APPROVED' : updatedWorkflow.finalDecision
      };
    }

    const isFinalApproved = updatedWorkflow.finalDecision === 'APPROVED';
    const isRejected = updatedWorkflow.finalDecision === 'REJECTED';

    const appliedSig = signatureImage || defaultSignature?.signatureDataUrl;
    const appliedSeal = sealStampImage || defaultSignature?.officialSealDataUrl;

    const newPOStatus: POStatus = isFinalApproved 
      ? 'APPROVED_BY_OWNER'
      : isRejected
        ? 'REJECTED_BY_OWNER'
        : 'PENDING_OWNER_APPROVAL';

    setPurchaseOrders(prev => {
      const updated = prev.map(p => {
        if (p.id === poId) {
          return {
            ...p,
            status: newPOStatus,
            workflowState: updatedWorkflow,
            holdingApproval: isFinalApproved ? {
              approvedBy: performerName,
              approvedAt: new Date().toLocaleString(),
              decision: 'APPROVED' as const,
              comments: finalComment,
              signatureHash: updatedWorkflow.steps.find(s => s.role === 'HOLDING_OWNER')?.signatureHash || `SIG-SAS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
              signatureImage: appliedSig,
              sealStampImage: appliedSeal,
              signerRole: performerRole
            } : isRejected ? {
              approvedBy: performerName,
              approvedAt: new Date().toLocaleString(),
              decision: 'REJECTED' as const,
              comments: finalComment,
              signatureHash: `REJ-SAS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
            } : p.holdingApproval
          };
        }
        return p;
      });

      try {
        localStorage.setItem('sas4erp_pos', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (updatedWorkflow.auditTrail && updatedWorkflow.auditTrail[0]) {
      setApprovalAuditTrail(prev => {
        const updated = [updatedWorkflow.auditTrail[0], ...prev];
        try {
          localStorage.setItem('sas4erp_approval_audit_trail', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    // FINANCE INTEGRATION: Auto-Post Approved Commitment to Ledger
    if (isFinalApproved) {
      const commitmentEntry: FinanceLedgerEntry = {
        id: `fin-wf-commit-${Date.now()}`,
        companyId: targetPO.companyId,
        projectId: targetPO.projectId || 'proj-101',
        entryDate: new Date().toISOString().split('T')[0],
        voucherNumber: `VCH-COMMITTED-${Math.floor(1000 + Math.random() * 9000)}`,
        accountName: `Accounts Payable & Committed Capital (PO: ${targetPO.poNumber})`,
        debitUSD: targetPO.totalAmountUSD,
        creditUSD: 0,
        description: `Approved Purchase Commitment: ${targetPO.purpose} - Supplier: ${targetPO.supplierName} (PO: ${targetPO.poNumber}) [Fully Authorized by ${currentUser.name}]`,
        sourceModule: 'WORKFLOW_ENGINE_AUTO',
        postedBy: `${currentUser.name} (Holding Executive Approval Engine)`
      };

      setFinanceLedgers(prev => [commitmentEntry, ...prev]);

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      addNotification({
        title: `✅ PO ${targetPO.poNumber} Fully Authorized & Committed!`,
        titleKu: `✅ داواکاری ${targetPO.poNumber} بە تەواوی لەلایەن خاوەنی هۆڵدینگ پەسەندکرا!`,
        titleAr: `✅ تم اعتماد أمر الشراء ${targetPO.poNumber} بالكامل وتقييده مالياً!`,
        message: `All approval chain tiers satisfied ($${targetPO.totalAmountUSD.toLocaleString()}). Financial commitment posted to ledger, gate access unlocked, and purchase execution authorized.`,
        messageKu: `سەرجەم قۆناغەکانی پەسەندکردن (کۆگا، دارایی، بەڕێوەبەر و واژۆی کۆتایی خاوەنی هۆڵدینگ) تەواو بوون. داواکارییەکە ئێستا بە فەرمی ئامادەی جێبەجێکردنە.`,
        type: 'OWNER_APPROVAL_REQUIRED',
        relatedId: targetPO.id,
      });
    } else if (decision === 'REJECTED') {
      addNotification({
        title: `PO ${targetPO.poNumber} Rejected`,
        titleKu: `داواکاری کڕینی ${targetPO.poNumber} ڕەتکرایەوە`,
        titleAr: `تم رفض أمر الشراء ${targetPO.poNumber}`,
        message: `Reason: ${finalComment}`,
        messageKu: `هۆکار: ${finalComment}`,
        type: 'OWNER_APPROVAL_REQUIRED',
        relatedId: targetPO.id,
      });
    } else {
      const nextPending = updatedWorkflow.steps.find(s => s.status === 'PENDING');
      const nextRole = nextPending ? nextPending.role : 'HOLDING_OWNER';
      addNotification({
        title: `Step ${stepNumber} Approved for PO ${targetPO.poNumber}`,
        titleKu: `قۆناغی ${stepNumber} پەسەندکرا بۆ ${targetPO.poNumber} - گەیشتە ${nextPending ? nextPending.titleKu : 'واژۆی کۆتایی خاوەن'}`,
        titleAr: `تم اعتماد المرحلة ${stepNumber} لأمر الشراء ${targetPO.poNumber}`,
        message: `Approved by ${performerName}. Advanced to: ${nextPending ? nextPending.titleEn : 'Holding Owner'}.`,
        messageKu: `لە لایەن ${performerName} پەسەندکرا. ڕێڕەوەکە گەیشتە بەردەم: ${nextPending ? nextPending.titleKu : 'واژۆی کۆتایی خاوەن'}.`,
        type: 'OWNER_APPROVAL_REQUIRED',
        relatedId: targetPO.id,
        targetRole: nextRole as any
      });
    }

    return { success: true, message: `Step ${stepNumber} processed successfully.` };
  }, [purchaseOrders, currentUser, canUserApproveWorkflowStep, defaultSignature]);

  const processWorkflowStep = (
    poId: string,
    stepNumber: number,
    decision: 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_INFO',
    comments: string = ''
  ) => {
    approveWorkflowStep(poId, stepNumber, decision, comments);
  };

  const submitPurchaseRequest = (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdDate' | 'status'> & { transactionType?: TransactionType }) => {
    const poNumber = `PO-SAS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const txType: TransactionType = poData.transactionType || 'PURCHASE_ORDER';
    const comp = companies.find(c => c.id === poData.companyId);

    const matchedRule = matchApprovalChain(
      poData.companyId,
      poData.projectId,
      txType,
      poData.totalAmountUSD,
      workflowRules
    );

    const initialWorkflow = generateInitialWorkflowState(
      matchedRule,
      poData.totalAmountUSD,
      poData.requestedBy,
      poData.requesterRole,
      comp ? (comp.nameKu || comp.name) : 'Subsidiary',
      poNumber
    );

    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      poNumber,
      transactionType: txType,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'PENDING_OWNER_APPROVAL',
      workflowState: initialWorkflow,
    };

    setPurchaseOrders(prev => {
      const updated = [newPO, ...prev];
      try {
        localStorage.setItem('sas4erp_pos', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (initialWorkflow.auditTrail[0]) {
      setApprovalAuditTrail(prev => {
        const updated = [initialWorkflow.auditTrail[0], ...prev];
        try {
          localStorage.setItem('sas4erp_approval_audit_trail', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    // 1. Warehouse Officer Alert
    addNotification({
      title: `📦 Warehouse Alert: New Purchase Request (${poNumber})`,
      titleKu: `📦 ئاگاداری کۆگا: داواکاری نوێی کڕین تۆمارکرا (${poNumber})`,
      titleAr: `📦 إشعار المستودع: تم تسجيل طلب شراء جديد (${poNumber})`,
      message: `Requisition initiated for ${poData.purpose} ($${poData.totalAmountUSD.toLocaleString()}). Check warehouse stock availability and clear Step 2.`,
      messageKu: `داواکارییەکی نوێی کڕین بۆ (${poData.purpose}) بە بڕی $${poData.totalAmountUSD.toLocaleString()} تۆمارکرا. تکایە بوونی کەرەستە لە کۆگادا بپشکنە پێش بەردەوامبوونی کڕین.`,
      messageAr: `تم تسجيل طلب شراء بقيمة $${poData.totalAmountUSD.toLocaleString()} لمواد (${poData.purpose}). يرجى تدقيق توفر المواد بالمستودع.`,
      type: 'GATE_ALERT',
      relatedId: newPO.id,
      targetRole: 'WAREHOUSE_OFFICER',
    });

    // 2. Finance Head Alert
    addNotification({
      title: `💰 Finance Alert: Budget Clearance Required (${poNumber})`,
      titleKu: `💰 ئاگاداری دارایی: پشکنینی بودجەی داواکاری (${poNumber})`,
      titleAr: `💰 إشعار المالية: تدقيق ميزانية طلب الشراء (${poNumber})`,
      message: `Requisition initiated for $${poData.totalAmountUSD.toLocaleString()} (${comp?.name || 'Subsidiary'}). Review project budget ceiling and prepare financial clearance.`,
      messageKu: `داواکاری نوێی کڕین بە بڕی $${poData.totalAmountUSD.toLocaleString()} بۆ (${comp ? comp.nameKu || comp.name : 'کۆمپانیا'}) تۆمارکرا. پێویستی بە پشکنینی بودجەی پڕۆژە و تەرخانکردنی داراییە.`,
      messageAr: `تم تقديم طلب شراء جديد بقيمة $${poData.totalAmountUSD.toLocaleString()}. يتطلب تدقيق ميزانية المشروع والاعتماد المالي.`,
      type: 'BUDGET_THRESHOLD_ALERT',
      relatedId: newPO.id,
      targetRole: 'FINANCE_HEAD',
    });

    // 3. Project / Company Manager Alert
    addNotification({
      title: `🏢 Manager Alert: Site Purchase Request Initiated (${poNumber})`,
      titleKu: `🏢 ئاگاداری بەڕێوەبەر: داواکاری کڕین لە پڕۆژەدا (${poNumber})`,
      titleAr: `🏢 إشعار الإدارة: طلب شراء جديد للمشروع / الشركة (${poNumber})`,
      message: `Purchase requisition initiated by ${poData.requestedBy} for $${poData.totalAmountUSD.toLocaleString()} (${poData.purpose}). Operational endorsement required.`,
      messageKu: `داواکاری کڕین لە پڕۆژەکەتەوە تۆمارکرا بە بڕی $${poData.totalAmountUSD.toLocaleString()} لەلایەن ${poData.requestedBy}. پێویستی بە پێداچوونەوە و ڕەزامەندیی بەڕێوەبەرە.`,
      messageAr: `تم تسجيل طلب شراء من قبل ${poData.requestedBy} بقيمة $${poData.totalAmountUSD.toLocaleString()}. يتطلب الاعتماد التشغيلي للمدير.`,
      type: 'OWNER_APPROVAL_REQUIRED',
      relatedId: newPO.id,
      targetRole: 'PROJECT_MANAGER',
    });

    // 4. Holding Company Owner Alert
    addNotification({
      title: `👑 Holding Owner: Purchase Request Initiated (${poNumber})`,
      titleKu: `👑 داواکاری نوێ لە زنجیرەی پەسەندکردندایە (${poNumber})`,
      titleAr: `👑 إشعار مالك المجموعة: طلب شراء جديد في مسار الاعتماد (${poNumber})`,
      message: `${poData.requestedBy} initiated purchase for $${poData.totalAmountUSD.toLocaleString()} (${poData.purpose}). Proceeds sequentially through Warehouse, Finance, and GM to Holding Owner for final approval before purchase execution.`,
      messageKu: `داواکارییەکی نوێ بە بڕی $${poData.totalAmountUSD.toLocaleString()} بۆ (${poData.purpose}) لە پڕۆژەوە نێردرا. دوای پشکنینی کۆگا، دارایی و بەڕێوەبەر، دەگاتە واژۆی کۆتایی جەنابت پێش جێبەجێکردن.`,
      messageAr: `طلب شراء جديد بقيمة $${poData.totalAmountUSD.toLocaleString()} انطلق في مسار الاعتماد، وسيصل لمالك المجموعة للموافقة والختم النهائي قبل التنفيذ.`,
      type: 'OWNER_APPROVAL_REQUIRED',
      relatedId: newPO.id,
      targetRole: 'HOLDING_OWNER',
    });
  };

  const addGmBudgetPolicy = (policyData: Omit<GMProjectBudgetPolicy, 'id' | 'updatedAt'>) => {
    const newPolicy: GMProjectBudgetPolicy = {
      ...policyData,
      id: `gm-pol-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setGmBudgetPolicies(prev => {
      const updated = [newPolicy, ...prev];
      try {
        localStorage.setItem('sas4erp_gm_budget_policies', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addNotification({
      title: 'New GM Budget Policy Established',
      titleKu: 'ڕێسای نوێی بودجەی بەڕێوەبەری گشتی زیادکرا',
      titleAr: 'تمت إضافة سياسة ميزانية جديدة للمدير العام',
      message: `Policy established for ${newPolicy.gmName} with mode: ${newPolicy.decisionMode}.`,
      type: 'FINANCE_ENTRY'
    });
  };

  const updateGmBudgetPolicy = (id: string, data: Partial<GMProjectBudgetPolicy>) => {
    setGmBudgetPolicies(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString().split('T')[0] } : p);
      try {
        localStorage.setItem('sas4erp_gm_budget_policies', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteGmBudgetPolicy = (id: string) => {
    setGmBudgetPolicies(prev => {
      const updated = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('sas4erp_gm_budget_policies', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const evaluateGMForPO = (po: PurchaseOrder): GMEvaluationResult => {
    const policy = findGMPolicy(gmBudgetPolicies, po.companyId, po.projectId);
    const project = projects.find(p => p.id === po.projectId);
    const budget = project?.budgetUSD || 1000000;
    const spent = project?.spentUSD || 0;
    const txType = po.transactionType || 'PURCHASE_ORDER';
    return evaluateGMWorkflowDecision(policy, budget, spent, po.totalAmountUSD, txType);
  };

  const autoApproveGMStep = (poId: string, comments?: string) => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO || !targetPO.workflowState) return;

    const gmStep = targetPO.workflowState.steps.find(s => s.role === 'GENERAL_MANAGER');
    if (!gmStep || gmStep.status !== 'PENDING') return;

    const evaluation = evaluateGMForPO(targetPO);
    const autoNote = comments || (
      evaluation.canAutoApprove
        ? `[Auto-Approved by GM Policy] Budget consumed: ${evaluation.projectedConsumedPercent}% (Within ${evaluation.decisionMode} cap).`
        : `[GM Manual Review Override] ${comments || 'Manually approved with GM authorization'}`
    );

    const comp = companies.find(c => c.id === targetPO.companyId);
    const gmName = comp?.generalManager || 'Company General Manager';

    processWorkflowStep(
      poId,
      gmStep.stepNumber,
      'APPROVED',
      autoNote
    );
  };

  const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdDate' | 'status'>) => {
    submitPurchaseRequest({ ...poData, transactionType: 'PURCHASE_ORDER' });
  };

  const deletePurchaseOrder = (id: string) => {
    setPurchaseOrders(prev => {
      const updated = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('sas4erp_pos', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save pos to localStorage', err);
      }
      return updated;
    });
  };

  const approvePurchaseByOwner = (
    poId: string,
    comments: string = 'Approved by Holding Chairman',
    signatureImage?: string,
    sealStampImage?: string
  ) => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO) return;

    if (targetPO.workflowState) {
      const ownerStep = targetPO.workflowState.steps.find(s => s.role === 'HOLDING_OWNER' && s.status === 'PENDING') 
        || targetPO.workflowState.steps.find(s => s.status === 'PENDING')
        || targetPO.workflowState.steps[targetPO.workflowState.steps.length - 1];

      if (ownerStep) {
        approveWorkflowStep(poId, ownerStep.stepNumber, 'APPROVED', comments, signatureImage, sealStampImage, true);
        return;
      }
    }

    const appliedSig = signatureImage || defaultSignature?.signatureDataUrl;
    const appliedSeal = sealStampImage || defaultSignature?.officialSealDataUrl;

    let finalApprovedPO: PurchaseOrder | null = null;

    setPurchaseOrders(prev => {
      const updated = prev.map(po => {
        if (po.id === poId) {
          const approved: PurchaseOrder = {
            ...po,
            status: 'APPROVED_BY_OWNER' as POStatus,
            holdingApproval: {
              approvedBy: currentUser.name,
              approvedAt: new Date().toLocaleString(),
              decision: 'APPROVED' as const,
              comments,
              signatureHash: `SIG-HOLDING-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
              signatureImage: appliedSig,
              sealStampImage: appliedSeal,
              signerRole: 'HOLDING_OWNER'
            }
          };
          finalApprovedPO = approved;
          return approved;
        }
        return po;
      });
      try {
        localStorage.setItem('sas4erp_pos', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (defaultPrinter?.autoPrintOnApproval && finalApprovedPO) {
      setTimeout(() => {
        setPrintPreviewPO(finalApprovedPO);
      }, 500);
    }

    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (_) {}

    addNotification({
      title: `Purchase Order ${targetPO.poNumber} Approved!`,
      titleKu: `داواکاری کڕینی ${targetPO.poNumber} لەلایەن خاوەن پەسەندکرا!`,
      titleAr: `تم اعتماد أمر الشراء ${targetPO.poNumber} من مالك المجموعة!`,
      message: `Holding Owner approved the purchase of $${targetPO.totalAmountUSD.toLocaleString()} from ${targetPO.supplierName}. Procurement can proceed.`,
      type: 'OWNER_APPROVAL_REQUIRED',
    });
  };

  const disbursePoPayment = useCallback((
    poId: string,
    paymentMethod: string = 'Central Treasury Bank Transfer',
    notes: string = ''
  ): { success: boolean; message: string } => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO) {
      return { success: false, message: 'Purchase order not found' };
    }

    if (!isPoFullyApproved(targetPO)) {
      addNotification({
        title: 'Payment Disbursal Blocked! / پارەدان ڕاگیرا',
        titleKu: 'خەرجکردنی پارە ڕاگیرا: داواکارییەکە هێشتا پەسەندکردنی تەواوی نییە!',
        titleAr: 'تم إيقاف صرف المبلغ: أمر الشراء لم يستكمل سلسلة الموافقات التنفيذية!',
        message: 'Strict Treasury Policy: Funds cannot be disbursed without full PM, GM, and Holding Owner authorization.',
        type: 'FINANCE_ENTRY'
      });
      return { success: false, message: 'Cannot disburse unapproved purchase order.' };
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const voucherNumber = `VCH-PAY-${Math.floor(1000 + Math.random() * 9000)}`;

    const paymentVoucher: FinanceLedgerEntry = {
      id: `fin-pay-${Date.now()}`,
      companyId: targetPO.companyId,
      projectId: targetPO.projectId || 'proj-101',
      entryDate: timestamp,
      voucherNumber,
      accountName: 'Holding Central Treasury Liquidity',
      debitUSD: 0,
      creditUSD: targetPO.totalAmountUSD,
      description: `Disbursement for PO ${targetPO.poNumber} (${targetPO.supplierName}) via ${paymentMethod}. Cleared by full workflow chain. Notes: ${notes || 'Cleared'}`,
      sourceModule: 'TREASURY_DISBURSEMENT',
      postedBy: `${currentUser.name} (Finance Treasury)`
    };

    setFinanceLedgers(prev => [paymentVoucher, ...prev]);

    setPurchaseOrders(prev => {
      const updated = prev.map(p => {
        if (p.id === poId) {
          return {
            ...p,
            status: 'FINANCIALLY_SETTLED' as const,
            financeEntry: {
              postedAt: new Date().toLocaleString(),
              journalRef: voucherNumber,
              paymentStatus: 'PAID' as const,
              voucherNo: voucherNumber
            }
          };
        }
        return p;
      });
      try {
        localStorage.setItem('sas4erp_pos', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    addNotification({
      title: `Disbursement Cleared: $${targetPO.totalAmountUSD.toLocaleString()}`,
      titleKu: `پارەی داواکاری ${targetPO.poNumber} خەرجکرا: $${targetPO.totalAmountUSD.toLocaleString()}`,
      titleAr: `تم صرف مستحقات أمر الشراء ${targetPO.poNumber}: $${targetPO.totalAmountUSD.toLocaleString()}`,
      message: `Payment successfully released to ${targetPO.supplierName} under voucher #${voucherNumber}.`,
      type: 'FINANCE_ENTRY'
    });

    return { success: true, message: `Disbursement successful under voucher ${voucherNumber}` };
  }, [purchaseOrders, isPoFullyApproved, currentUser.name]);

  const receiveApprovedPoToWarehouse = useCallback((
    poId: string,
    binLocation: string = 'Zone A-Primary Stacking',
    condition: string = 'Verified & Inspected'
  ): { success: boolean; message: string } => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO) {
      return { success: false, message: 'Purchase order not found' };
    }

    const inwardCheck = canPoEnterProject(targetPO);
    if (!inwardCheck.allowed) {
      addNotification({
        title: 'Warehouse Inward Blocked! / وەرگرتنی کەرەستە ڕاگیرا',
        titleKu: 'وەرگرتنی کەرەستە لە کۆگا ڕاگیرا: داواکاری پەسەندکراوی تەواوی نییە!',
        titleAr: 'تم منع إدخال المواد للمستودع: أمر الشراء غير معتمد!',
        message: inwardCheck.reasonKu,
        type: 'GATE_ALERT'
      });
      return { success: false, message: `Cannot receive items: ${inwardCheck.reasonKu}` };
    }

    const timestamp = new Date().toLocaleString();

    // Check if Finance already paid. If not, auto-deduct from project budget and transfer to procurement
    const isFinancePaid = targetPO.status === 'FINANCIALLY_SETTLED' || targetPO.financeEntry?.paymentStatus === 'PAID';
    let autoProjectDeduction = targetPO.projectFundDeduction;

    if (!isFinancePaid && !autoProjectDeduction) {
      const targetProjId = targetPO.projectId || 'proj-101';
      let targetProjName = 'پڕۆژەی دیاریکراو';

      setProjects(prevProjs => {
        const updated = prevProjs.map(prj => {
          if (prj.id === targetProjId || (!targetPO.projectId && prj.id === 'proj-101')) {
            targetProjName = prj.nameKu || prj.name;
            return {
              ...prj,
              spentUSD: (prj.spentUSD || 0) + targetPO.totalAmountUSD
            };
          }
          return prj;
        });
        try {
          localStorage.setItem('sas4erp_projects', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      const escrowLedgerEntry: FinanceLedgerEntry = {
        id: `fin-escrow-${Date.now()}`,
        companyId: targetPO.companyId,
        projectId: targetProjId,
        entryDate: timestamp,
        voucherNumber: `VCH-AUTO-ESCROW-${Math.floor(1000 + Math.random() * 9000)}`,
        accountName: `Project Budget Deduction -> Procurement Escrow Allocation`,
        debitUSD: targetPO.totalAmountUSD,
        creditUSD: 0,
        description: `خۆکارانە لە پارەی پڕۆژەی (${targetProjName}) کەمکرایەوە و بۆ بەشی کڕین زیادکرا بەهۆی وەرگرتنی کەلوپەل بۆ پڕۆژە (PO: ${targetPO.poNumber}) پێش خەرجکردنی دارایی.`,
        sourceModule: 'WORKFLOW_ENGINE_AUTO',
        referencePoId: targetPO.id,
        postedBy: 'SAS4ERP Project-to-Procurement Auto Escrow Engine'
      };
      setFinanceLedgers(prev => [escrowLedgerEntry, ...prev]);

      autoProjectDeduction = {
        deductedAt: timestamp,
        amountUSD: targetPO.totalAmountUSD,
        projectId: targetProjId,
        projectName: targetProjName,
        transferredToProcurement: true,
        procurementStatus: 'HELD_IN_ESCROW',
        notes: 'دارایی هێشتا پارەکەی خەرج نەکردبوو، کاتێک شتەکە گەیشت خۆکارانە لە پارەی پڕۆژە کەمکرایەوە و بۆ بەشی کڕین زیادکرا. کاتێک بەشی کڕین دەتوانێت وەریگرێت کە یەک لە بەڕێوەبەرانی پڕۆژە واژۆی بکات.'
      };

      // Notify Finance
      addNotification({
        title: `💼 ئاگاداری دارایی: کەلوپەلەکانی ${targetPO.poNumber} گەیشتە پڕۆژە`,
        titleKu: `💼 ئاگاداری دارایی: کەلوپەلەکانی ${targetPO.poNumber} گەیشتە پڕۆژە`,
        titleAr: `💼 إشعار الإدارة المالية: وصول مواد ${targetPO.poNumber} إلى المشروع`,
        message: `کەرەستەی کڕینی ${targetPO.poNumber} گەیشتە ناو پڕۆژە پێش ئەوەی دارایی پارەکەی خەرج بکات. بڕەکە خۆکارانە لە پارەی پڕۆژە کەمکرایەوە و بۆ بەشی کڕین زیادکرا.`,
        type: 'FINANCE_ENTRY',
        relatedId: targetPO.id
      });
    }

    setWarehouseItems(prev => {
      let updated = [...prev];
      targetPO.items.forEach(it => {
        const existingIdx = updated.findIndex(w => w.name.toLowerCase() === it.name.toLowerCase() || (it.category && w.category === it.category));
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantityOnHand: updated[existingIdx].quantityOnHand + it.quantity,
            lastRestockedDate: new Date().toISOString().split('T')[0]
          };
        } else {
          updated.push({
            id: `wh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            sku: `SKU-${targetPO.companyId.slice(-3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
            name: it.name,
            category: it.category || 'Materials & Components',
            companyId: targetPO.companyId,
            projectId: targetPO.projectId || 'proj-101',
            quantityOnHand: it.quantity,
            minimumThreshold: 5,
            unit: it.unit || 'Units',
            unitCostUSD: it.unitPriceUSD || (it.totalUSD / (it.quantity || 1)),
            binLocation,
            lastRestockedDate: new Date().toISOString().split('T')[0]
          });
        }
      });
      try {
        localStorage.setItem('sas4erp_warehouse_items', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setPurchaseOrders(prev => {
      const updated = prev.map(p => {
        if (p.id === poId) {
          return {
            ...p,
            status: 'INSPECTED_AND_STORED' as const,
            projectFundDeduction: autoProjectDeduction || p.projectFundDeduction,
            warehouseReceipt: {
              receivedAt: timestamp,
              receivedBy: `${currentUser.name} (Warehouse Receiving)`,
              binLocation,
              condition
            }
          };
        }
        return p;
      });
      try {
        localStorage.setItem('sas4erp_pos', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    addNotification({
      title: `Warehouse Stock Received: ${targetPO.poNumber}`,
      titleKu: `کەرەستەکانی داواکاری ${targetPO.poNumber} بەسەرکەوتوویی لە کۆگا وەرگیران`,
      titleAr: `تم استلام مواد أمر الشراء ${targetPO.poNumber} وتخزينها في المستودع`,
      message: `${targetPO.items.length} item lines added to inventory at ${binLocation}. Verified against executive authorization.`,
      type: 'GATE_ALERT'
    });

    return { success: true, message: 'Materials stocked successfully into warehouse' };
  }, [purchaseOrders, canPoEnterProject, currentUser.name]);

  const grantCeoPreApproval = useCallback((
    poId: string,
    comments: string = 'CEO Sovereign Pre-Approval Granted'
  ) => {
    setPurchaseOrders(prev => {
      const updated = prev.map(p => {
        if (p.id === poId) {
          const timestamp = new Date().toLocaleString();
          const sigHash = `SIG-CEO-PRE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

          let updatedWorkflow = p.workflowState;
          if (updatedWorkflow) {
            const steps = updatedWorkflow.steps.map(s => {
              if (s.role === 'HOLDING_OWNER' || s.role === 'HOLDING_VP') {
                return {
                  ...s,
                  status: 'APPROVED' as const,
                  approverName: `${currentUser.name} (CEO Pre-Approval)`,
                  approvalDate: timestamp,
                  signatureHash: sigHash,
                  notes: comments
                };
              }
              return s;
            });
            updatedWorkflow = {
              ...updatedWorkflow,
              steps,
              finalDecision: steps.every(s => s.status === 'APPROVED') ? 'APPROVED' : 'IN_PROGRESS'
            };
          }

          return {
            ...p,
            ceoPreApproved: true,
            ceoPreApprovedAt: timestamp,
            ceoPreApprovedBy: currentUser.name,
            workflowState: updatedWorkflow,
            holdingApproval: {
              approvedBy: currentUser.name,
              approvedAt: timestamp,
              decision: 'APPROVED' as const,
              comments: `[CEO PRE-APPROVAL] ${comments}`,
              signatureHash: sigHash,
              signerRole: 'HOLDING_OWNER'
            }
          };
        }
        return p;
      });
      try {
        localStorage.setItem('sas4erp_pos', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    addNotification({
      title: '👑 CEO Fast-Track Pre-Approval Granted',
      titleKu: '👑 ڕەزامەندی پێشوەختەی CEO پێبەخشرا',
      titleAr: '👑 تم منح الموافقة المسبقة من الرئيس التنفيذي (CEO)',
      message: `داواکاری کڕین ڕەزامەندی CEOی پێدرا. ئێستا بۆ هاتنە ناو پڕۆژە تەنها واژۆی بەڕێوەبەری پڕۆژە یان بەڕێوەبەری کارگێڕی پێویستە.`,
      type: 'OWNER_APPROVAL_REQUIRED'
    });
  }, [currentUser.name]);

  const delegatePoSpendingAuthority = useCallback((
    poId: string,
    notes: string = 'بڕیاری سەرۆکایەتی هۆڵدینگ: شۆڕکردنەوەی دەسەڵاتی خەرجکردن بۆ کۆمپانیا/پڕۆژە بەبێ پێویستی گەڕانەوە بۆ بنکەی سەرەکی',
    decreeNumber?: string
  ): { success: boolean; message: string } => {
    const targetPo = purchaseOrders.find(p => p.id === poId);
    if (!targetPo) {
      return { success: false, message: 'Purchase order not found' };
    }

    const generatedDecree = decreeNumber || `DEC-HQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toLocaleString();
    const sigHash = `SIG-DELEGATED-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const mandate: DelegatedSpendingMandate = {
      isAutonomous: true,
      delegatedBy: currentUser.name,
      delegatedAt: timestamp,
      decreeNumber: generatedDecree,
      notes,
      scope: 'PO_SPECIFIC',
      targetEntityId: targetPo.id
    };

    setPurchaseOrders(prev => {
      const updated = prev.map(p => {
        if (p.id === poId) {
          let updatedWorkflow = p.workflowState;
          if (updatedWorkflow) {
            const steps = updatedWorkflow.steps.map(s => {
              if (s.role === 'HOLDING_OWNER' || s.role === 'HOLDING_VP') {
                return {
                  ...s,
                  status: 'DELEGATED_TO_BRANCH' as const,
                  approverName: `${currentUser.name} (شۆڕکراوەتەوە بۆ لقی مەیدانی)`,
                  actionDate: timestamp,
                  comments: `[بڕیاری شۆڕکردنەوەی دەسەڵات: ${generatedDecree}] ${notes}`,
                  signatureHash: sigHash
                };
              }
              return s;
            });

            // Check if all non-holding steps are already approved
            const pendingRemaining = steps.filter(s => s.status === 'PENDING' && s.role !== 'HOLDING_OWNER' && s.role !== 'HOLDING_VP');
            const isFullyDone = pendingRemaining.length === 0;

            updatedWorkflow = {
              ...updatedWorkflow,
              steps,
              finalDecision: isFullyDone ? 'APPROVED' : updatedWorkflow.finalDecision,
              finalDecisionAt: isFullyDone ? timestamp : updatedWorkflow.finalDecisionAt
            };
          }

          return {
            ...p,
            delegatedToLocal: true,
            delegatedMandate: mandate,
            workflowState: updatedWorkflow,
            holdingApproval: {
              approvedBy: `${currentUser.name} (شاندرا بۆ لقی مەیدانی)`,
              approvedAt: timestamp,
              decision: 'APPROVED' as const,
              comments: `[شۆڕکردنەوەی دەسەڵات بۆ خوارەوە - بڕیاری ${generatedDecree}] ${notes}`,
              signatureHash: sigHash,
              signerRole: 'HOLDING_OWNER'
            }
          };
        }
        return p;
      });
      try {
        localStorage.setItem('sas4erp_pos', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Record in audit trail
    const auditEntry: ApprovalAuditEntry = {
      id: `audit-del-${Date.now()}`,
      requestId: targetPo.id,
      poNumber: targetPo.poNumber,
      stepNumber: 0,
      action: 'DELEGATED_TO_BRANCH',
      performedBy: currentUser.name,
      performerRole: currentUser.role,
      timestamp,
      comments: `[بڕیاری سەرۆکایەتی ژمارە ${generatedDecree}] شۆڕکردنەوەی دەسەڵاتی خەرجکردن بۆ کۆمپانیا/پڕۆژە بەبێ گەڕانەوە بۆ بنکەی سەرەکی. تێبینی: ${notes}`,
      signatureHash: sigHash
    };
    setApprovalAuditTrail(prev => [auditEntry, ...prev]);

    addNotification({
      title: '⚡ Authority Delegated Downward / شۆڕکردنەوەی دەسەڵاتی خەرجکردن',
      titleKu: `⚡ بنکەی سەرەکی دەسەڵاتی خەرجکردنی بۆ ${targetPo.poNumber} شۆڕکردەوە بۆ کۆمپانیا/پڕۆژە (بێ گەڕانەوە بۆ بنکەی سەرەکی)`,
      titleAr: `⚡ تفويض سلطة اتخاذ القرار لأمر الشراء ${targetPo.poNumber} للموقع والفرع مباشرة`,
      message: `بەپێی فەرمانی سەرۆکایەتی هۆڵدینگ ژمارە ${generatedDecree}، بەڕێوەبەرانی کۆمپانیا و پڕۆژە دەسەڵاتی تەواویان هەیە لەسەر بڕیاردان بەبێ پێویستی ڕەزامەندی CEO.`,
      type: 'FINANCE_ENTRY'
    });

    return { success: true, message: `دەسەڵاتی خەرجکردن شۆڕکرایەوە بەپێی فەرمانی ${generatedDecree}` };
  }, [purchaseOrders, currentUser.name, currentUser.role, addNotification]);

  const setEntitySpendingAutonomy = useCallback((
    type: 'COMPANY' | 'PROJECT',
    id: string,
    mandate: DelegatedSpendingMandate | null
  ) => {
    if (type === 'COMPANY') {
      setCompanies(prev => {
        const updated = prev.map(c => c.id === id ? { ...c, delegatedSpendingMandate: mandate || undefined } : c);
        try {
          localStorage.setItem('sas4erp_companies', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } else {
      setProjects(prev => {
        const updated = prev.map(p => p.id === id ? { ...p, delegatedSpendingMandate: mandate || undefined } : p);
        try {
          localStorage.setItem('sas4erp_projects', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    if (mandate && mandate.isAutonomous) {
      addNotification({
        title: '⚡ Spending Autonomy Granted / پێدانی سەربەخۆیی خەرجکردن',
        titleKu: `⚡ بنکەی سەرەکی دەسەڵاتی بڕیاردانی خەرجکردنی شۆڕکردەوە بۆ ${type === 'COMPANY' ? 'کۆمپانیا' : 'پڕۆژە'} (بێ گەڕانەوە بۆ بنکەی سەرەکی)`,
        titleAr: `⚡ منح صلاحيات الصرف المستقل للفرع/المشروع دون الرجوع للمقر الرئيسي`,
        message: `بڕیاری سەرۆکایەتی هۆڵدینگ ژمارە ${mandate.decreeNumber}: پێدانی سەربەخۆیی تەواوی خەرجکردن ${mandate.maxAutonomousLimitUSD ? `تا سەقفی $${mandate.maxAutonomousLimitUSD.toLocaleString()}` : '(بێسنوور)'}.`,
        type: 'FINANCE_ENTRY'
      });
    } else {
      addNotification({
        title: '🔒 Autonomy Revoked / هەڵوەشاندنەوەی دەسەڵاتی سەربەخۆیی',
        titleKu: '🔒 دەسەڵاتی سەربەخۆیی خەرجکردن هەڵوەشێنرایەوە؛ سەرجەم خەرجییەکان دەبێت بگەڕێنەوە بۆ بنکەی سەرەکی',
        titleAr: '🔒 إلغاء التفويض المالي وإعادة الارتباط بالمركز الرئيسي',
        message: 'Spending mandate revoked. Standard holding approval chain enforced.',
        type: 'BUDGET_THRESHOLD_ALERT'
      });
    }
  }, [addNotification]);

  const signPmReleaseForProcurement = useCallback((
    poId: string,
    comments: string = 'Authorized by Project Director for procurement funds release'
  ): { success: boolean; message: string } => {
    const isPM = currentUser.role === 'PROJECT_MANAGER' || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HOLDING_OWNER';
    if (!isPM) {
      return {
        success: false,
        message: 'تەنها یەک لە بەڕێوەبەرانی پڕۆژە (PM) دەسەڵاتی واژۆکردنی ڕادەستکردنی ئەم پارەیەی هەیە بە بەشی کڕین.'
      };
    }

    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO || !targetPO.projectFundDeduction) {
      return { success: false, message: 'داواکاری یان حیسابی تەرخانکراوی پڕۆژە نەدۆزرایەوە.' };
    }

    const timestamp = new Date().toLocaleString();
    const sigHash = `SIG-PM-REL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    setPurchaseOrders(prev => {
      const updated = prev.map(p => {
        if (p.id === poId && p.projectFundDeduction) {
          return {
            ...p,
            projectFundDeduction: {
              ...p.projectFundDeduction,
              procurementStatus: 'PM_RELEASE_SIGNED' as const,
              authorizedByPm: currentUser.name,
              pmSignatureHash: sigHash,
              pmSignedAt: timestamp,
              notes: `${p.projectFundDeduction.notes || ''} [واژۆکرا لەلایەن بەڕێوەبەری پڕۆژە ${currentUser.name}: ${comments}]`
            }
          };
        }
        return p;
      });
      try {
        localStorage.setItem('sas4erp_pos', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    addNotification({
      title: `واژۆی بەڕێوەبەری پڕۆژە بۆ بەشی کڕین: ${targetPO.poNumber}`,
      titleKu: `واژۆی بەڕێوەبەری پڕۆژە درا بۆ بەشی کڕین: ${targetPO.poNumber}`,
      titleAr: `تم توقيع مدير المشروع لصرف المبلغ لقسم المشتريات: ${targetPO.poNumber}`,
      message: `بەڕێوەبەری پڕۆژە (${currentUser.name}) واژۆی ڕادەستکردنی بڕی $${targetPO.totalAmountUSD.toLocaleString()}ی کرد بۆ بەشی کڕین. ئێستا بەشی کڕین دەتوانێت وەریگرێت.`,
      type: 'FINANCE_ENTRY',
      relatedId: targetPO.id
    });

    return {
      success: true,
      message: `بە سەرکەوتوویی لەلایەن بەڕێوەبەری پڕۆژە واژۆکرا! بەشی کڕین دەتوانێت بڕی $${targetPO.totalAmountUSD.toLocaleString()} وەربگرێت.`
    };
  }, [purchaseOrders, currentUser]);

  const collectFundsByProcurement = useCallback((poId: string): { success: boolean; message: string } => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO || !targetPO.projectFundDeduction) {
      return { success: false, message: 'زانیاری داواکاری نەدۆزرایەوە' };
    }

    if (targetPO.projectFundDeduction.procurementStatus !== 'PM_RELEASE_SIGNED') {
      return {
        success: false,
        message: 'ناتوانرێت وەربگیرێت! پێویستە سەرەتا یەک لە بەڕێوەبەرانی پڕۆژە واژۆی ڕەزامەندی بکات.'
      };
    }

    const timestamp = new Date().toLocaleString();
    setPurchaseOrders(prev => {
      const updated = prev.map(p => {
        if (p.id === poId && p.projectFundDeduction) {
          return {
            ...p,
            projectFundDeduction: {
              ...p.projectFundDeduction,
              procurementStatus: 'COLLECTED_BY_PROCUREMENT' as const,
              collectedAt: timestamp
            }
          };
        }
        return p;
      });
      try {
        localStorage.setItem('sas4erp_pos', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    addNotification({
      title: `وەرگرتنی پارە لەلایەن بەشی کڕین: ${targetPO.poNumber}`,
      titleKu: `پارەی داواکاری ${targetPO.poNumber} لەلایەن بەشی کڕینەوە وەرگیرا`,
      titleAr: `تم استلام المبلغ بنجاح من قبل قسم المشتريات: ${targetPO.poNumber}`,
      message: `بڕی $${targetPO.totalAmountUSD.toLocaleString()} لەلایەن بەشی کڕین وەرگیرا پاش پەسەندکردنی واژۆی بەڕێوەبەری پڕۆژە.`,
      type: 'FINANCE_ENTRY',
      relatedId: targetPO.id
    });

    return {
      success: true,
      message: `بڕی $${targetPO.totalAmountUSD.toLocaleString()} بەسەرکەوتوویی لەلایەن بەشی کڕینەوە وەرگیرا.`
    };
  }, [purchaseOrders]);

  const rejectPurchaseByOwner = (poId: string, comments: string = 'Rejected by Holding Chairman') => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO) return;

    if (targetPO.workflowState) {
      const pendingStep = targetPO.workflowState.steps.find(s => s.status === 'PENDING') 
        || targetPO.workflowState.steps[targetPO.workflowState.steps.length - 1];

      if (pendingStep) {
        processWorkflowStep(poId, pendingStep.stepNumber, 'REJECTED', comments);
        return;
      }
    }

    setPurchaseOrders(prev => {
      const updated = prev.map(po => {
        if (po.id === poId) {
          return {
            ...po,
            status: 'REJECTED_BY_OWNER' as POStatus,
            holdingApproval: {
              approvedBy: currentUser.name,
              approvedAt: new Date().toLocaleString(),
              decision: 'REJECTED' as const,
              comments,
              signatureHash: `REJ-HOLDING-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            }
          };
        }
        return po;
      });
      try {
        localStorage.setItem('sas4erp_pos', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    addNotification({
      title: `Purchase Order ${targetPO.poNumber} Rejected`,
      titleKu: `داواکاری کڕینی ${targetPO.poNumber} لەلایەن خاوەن ڕەتکرایەوە`,
      titleAr: `تم رفض أمر الشراء ${targetPO.poNumber} من قبل المالك`,
      message: `Holding Owner rejected the purchase request. Reason: ${comments}`,
      type: 'OWNER_APPROVAL_REQUIRED',
    });
  };

  // Automated Gate Scanner Logic
  const processGateScan = async (barcodeOrPo: string, customDetails?: any): Promise<{
    success: boolean;
    po?: PurchaseOrder;
    message: string;
    itemsUpdated?: { name: string; quantityAdded: number; newTotal: number; unit: string }[];
    voucherNo?: string;
    notificationsDispatched?: string[];
  }> => {
    // Look up PO in system
    let po = purchaseOrders.find(p => p.poNumber.toLowerCase() === barcodeOrPo.toLowerCase() || p.id === barcodeOrPo);
    
    // If not found, check approved PO
    if (!po) {
      const approvedPo = purchaseOrders.find(p => canPoEnterProject(p).allowed && !p.gateScanLog);
      if (approvedPo) {
        po = approvedPo;
      } else {
        po = purchaseOrders[0];
      }
    }

    if (!po) {
      return { success: false, message: 'No purchase order found for scanned barcode.' };
    }

    // STRICT EXECUTIVE GATING CHECK (SPECIAL RULE: CEO PRE-APPROVAL + PM OR GM SIGN-OFF FOR SITE ENTRY):
    const gatePerm = canPoEnterProject(po);
    if (!gatePerm.allowed) {
      addNotification({
        title: `⛔ Gate Entry Refused: ${po.poNumber}`,
        titleKu: `⛔ ڕێگری لە هاتنە ناو پڕۆژە: ${po.poNumber}`,
        titleAr: `⛔ تم منع دخول الشحنة عبر البوابة: ${po.poNumber}`,
        message: gatePerm.reasonKu,
        type: 'GATE_ALERT'
      });
      return {
        success: false,
        po,
        message: `⛔ ڕێگری لە هاتنە ناو پڕۆژە: ${gatePerm.reasonKu}`
      };
    }

    const timestamp = new Date().toLocaleString();
    const driverName = customDetails?.driverName || 'Mustafa Tariq';
    const vehiclePlate = customDetails?.vehiclePlate || '48122 Erbil Commercial';
    const gateName = customDetails?.gateName || 'Main Gate #1 (North Inbound Security)';
    const journalVoucherNo = `VCH-AUTO-${Math.floor(1000 + Math.random() * 9000)}`;

    // Check if Finance already paid. If not: auto-deduct from project budget and credit to Procurement Escrow
    const isFinancePaid = po.status === 'FINANCIALLY_SETTLED' || po.financeEntry?.paymentStatus === 'PAID';
    let autoProjectDeduction = po.projectFundDeduction;

    if (!isFinancePaid && !autoProjectDeduction) {
      const targetProjId = po.projectId || 'proj-101';
      let targetProjName = 'پڕۆژەی دیاریکراو';

      // 1. Deduct from target project budget
      setProjects(prevProjs => {
        const updated = prevProjs.map(prj => {
          if (prj.id === targetProjId || (!po!.projectId && prj.id === 'proj-101')) {
            targetProjName = prj.nameKu || prj.name;
            return {
              ...prj,
              spentUSD: (prj.spentUSD || 0) + po!.totalAmountUSD
            };
          }
          return prj;
        });
        try {
          localStorage.setItem('sas4erp_projects', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // 2. Transfer into Procurement Escrow ledger
      const escrowLedgerEntry: FinanceLedgerEntry = {
        id: `fin-escrow-${Date.now()}`,
        companyId: po.companyId,
        projectId: targetProjId,
        entryDate: timestamp,
        voucherNumber: `VCH-AUTO-ESCROW-${Math.floor(1000 + Math.random() * 9000)}`,
        accountName: `Project Budget Deduction -> Procurement Escrow Allocation`,
        debitUSD: po.totalAmountUSD,
        creditUSD: 0,
        description: `خۆکارانە لە پارەی پڕۆژەی (${targetProjName}) کەمکرایەوە و بۆ بەشی کڕین زیادکرا بەهۆی گەیشتنی کەلوپەل بۆ پڕۆژە (PO: ${po.poNumber}) پێش خەرجکردنی دارایی.`,
        sourceModule: 'WORKFLOW_ENGINE_AUTO',
        referencePoId: po.id,
        postedBy: 'SAS4ERP Project-to-Procurement Auto Escrow Engine'
      };
      setFinanceLedgers(prev => [escrowLedgerEntry, ...prev]);

      // 3. Mark deduction record on PO
      autoProjectDeduction = {
        deductedAt: timestamp,
        amountUSD: po.totalAmountUSD,
        projectId: targetProjId,
        projectName: targetProjName,
        transferredToProcurement: true,
        procurementStatus: 'HELD_IN_ESCROW',
        notes: 'دارایی هێشتا پارەکەی خەرج نەکردبوو، کاتێک کەلوپەلەکە گەیشتە ناو پڕۆژە خۆکارانە لە پارەی پڕۆژە کەمکرایەوە و بۆ بەشی کڕین زیادکرا. کاتێک بەشی کڕین دەتوانێت وەریگرێت کە یەک لە بەڕێوەبەرانی پڕۆژە واژۆی بکات.'
      };
    }

    // 1. Update PO with Gate Scan Log and Project Fund Deduction
    setPurchaseOrders(prev => prev.map(p => {
      if (p.id === po!.id) {
        return {
          ...p,
          status: 'ARRIVED_AT_GATE',
          projectFundDeduction: autoProjectDeduction || p.projectFundDeduction,
          gateScanLog: {
            scannedAt: timestamp,
            scannedBy: currentUser.name,
            gateName,
            driverName,
            vehiclePlate,
            notes: 'Verified barcode scan. Seals verified. Triple notifications triggered automatically.',
          },
          warehouseReceipt: {
            receivedAt: timestamp,
            receivedBy: 'Central Warehouse Receiving Staff',
            binLocation: 'Pending Final Stacking Area',
            condition: 'Verified by Security Scanner',
          },
          financeEntry: {
            postedAt: timestamp,
            journalRef: `JRNL-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
            paymentStatus: isFinancePaid ? 'PAID' : 'ACCRUED',
            voucherNo: journalVoucherNo,
          }
        };
      }
      return p;
    }));

    // 2. Add Gate Log
    const newGateLog: GateEntryLog = {
      id: `gate-${Date.now()}`,
      scannedAt: timestamp,
      barcode: po.poNumber,
      poNumber: po.poNumber,
      companyId: po.companyId,
      projectId: po.projectId,
      supplierName: po.supplierName,
      materialSummary: po.items.map(i => i.name).join(', ') || 'Materials & Components',
      totalAmountUSD: po.totalAmountUSD,
      securityOfficer: currentUser.name,
      gateLocation: gateName,
      vehiclePlate,
      driverName,
      status: 'DISPATCHED_TO_WAREHOUSE',
      tripleNotification: {
        warehouseNotified: true,
        warehouseAckAt: timestamp,
        financeNotified: true,
        financeAutoEntryCreated: true,
        journalEntryId: `JRNL-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
        managerNotified: true,
        managerName: po.requestedBy,
      }
    };
    setGateLogs(prev => [newGateLog, ...prev]);

    // 3. Automated Finance Ledger Posting
    const autoFinanceEntry: FinanceLedgerEntry = {
      id: `fin-auto-${Date.now()}`,
      companyId: po.companyId,
      projectId: po.projectId,
      entryDate: timestamp,
      voucherNumber: journalVoucherNo,
      accountName: `Accounts Payable - ${po.supplierName}`,
      debitUSD: po.totalAmountUSD,
      creditUSD: 0,
      description: `Automated Journal Entry on Gate Barcode Scan for ${po.poNumber} (${po.items.length} items arrived at site)`,
      sourceModule: 'GATE_SCAN_AUTO',
      referencePoId: po.id,
      postedBy: 'SAS4ERP Gate-to-Finance Automated Engine',
    };
    setFinanceLedgers(prev => {
      const updated = [autoFinanceEntry, ...prev];
      try {
        localStorage.setItem('sas4erp_finance_ledgers', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    // 4. Automatically update inventory stock levels (increment existing or add new)
    const itemsUpdatedSummary: { name: string; quantityAdded: number; newTotal: number; unit: string }[] = [];
    if (po.items && po.items.length > 0) {
      setWarehouseItems(prev => {
        const updated = [...prev];
        po!.items.forEach((item, idx) => {
          const matchIndex = updated.findIndex(wh =>
            (wh.name && wh.name.toLowerCase().trim() === item.name.toLowerCase().trim()) ||
            (wh.sku && wh.sku.toLowerCase() === item.name.toLowerCase()) ||
            (wh.name && item.name && (wh.name.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(wh.name.toLowerCase())))
          );

          if (matchIndex >= 0) {
            const currentQty = updated[matchIndex].quantityOnHand || 0;
            const newQty = currentQty + item.quantity;
            updated[matchIndex] = {
              ...updated[matchIndex],
              quantityOnHand: newQty,
              lastRestockedDate: new Date().toISOString().split('T')[0],
            };
            itemsUpdatedSummary.push({
              name: updated[matchIndex].name,
              quantityAdded: item.quantity,
              newTotal: newQty,
              unit: item.unit || updated[matchIndex].unit || 'Units',
            });
          } else {
            const newItem: WarehouseItem = {
              id: `wh-gate-${Date.now()}-${idx}`,
              itemCode: `ITM-${po!.poNumber.slice(-4)}-${idx + 1}`,
              name: item.name,
              category: item.category || 'Inward Procured Materials',
              companyId: po!.companyId,
              quantityOnHand: item.quantity,
              minimumThreshold: Math.max(5, Math.floor(item.quantity * 0.2)),
              unit: item.unit || 'Units',
              binLocation: `Bay-${po!.projectId?.slice(-3) || '01'}-Rack01`,
              averageUnitCostUSD: item.unitPriceUSD || (item.totalUSD / (item.quantity || 1)) || 100,
              lastRestockedDate: new Date().toISOString().split('T')[0],
              supplier: po!.supplierName || 'Verified Supplier',
            };
            updated.push(newItem);
            itemsUpdatedSummary.push({
              name: newItem.name,
              quantityAdded: item.quantity,
              newTotal: item.quantity,
              unit: item.unit || 'Units',
            });
          }
        });

        try {
          localStorage.setItem('sas4erp_warehouse_items', JSON.stringify(updated));
        } catch (err) {}
        return updated;
      });
    }

    // 5. Automated Real-Time Notification to WAREHOUSE:
    addNotification({
      title: `📦 کەلوپەلەکانی ${po.poNumber} گەیشتە کۆگا / پڕۆژە`,
      titleKu: `📦 ئاگاداری ڕاستەوخۆ بۆ کۆگا: کەرەستەکانی ${po.poNumber} گەیشت و کۆگا نوێکرایەوە`,
      titleAr: `📦 إشعار فوري للمستودع: استلام وتحديث مخزون مواد ${po.poNumber}`,
      message: `بەپێی سکانی بارکۆد لە دەروازە، سەرجەم کەرەستەکانی فەرمانی ${po.poNumber} (${po.items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join('، ')}) بە فەرمی وەرگیران و ڕێژەی کۆگا (Inventory Levels) خۆکارانە زیادکرا.`,
      type: 'GATE_ALERT',
      relatedId: po.id,
      targetRole: 'WAREHOUSE_OFFICER',
    });

    // 6. Automated Real-Time Notification to FINANCE:
    addNotification({
      title: `💼 تۆماری دارایی خۆکار بۆ پسوولەی ${po.poNumber}`,
      titleKu: `💼 ئاگاداری دارایی: تۆمارکردنی فەرمی خەرجی ${po.poNumber} لە سیستەمی دارایی`,
      titleAr: `💼 إشعار الإدارة المالية: قيد محاسبي تلقائي لأمر الشراء ${po.poNumber}`,
      message: `پسوولەی بارکۆدی داواکاری کڕینی ${po.poNumber} بە بەهای $${po.totalAmountUSD.toLocaleString()} USD لە دەروازە سکان کرا و قەواڵەی دارایی پەیوەندیدار (${journalVoucherNo}) خۆکارانە لە سیستەمی دارایی تۆمار کرا.`,
      type: 'FINANCE_ENTRY',
      relatedId: po.id,
      targetRole: 'FINANCE_HEAD',
    });

    // 7. Automated Real-Time Notification to PROJECT / COMPANY MANAGER:
    addNotification({
      title: `🏢 ئاگاداری بەڕێوەبەری پڕۆژە/کۆمپانیا: گەیشتنی کەرەستەی ${po.poNumber}`,
      titleKu: `🏢 ئاگاداری بەڕێوەبەر: کەرەستەکانی ${po.poNumber} داخڵی پڕۆژە بوون`,
      titleAr: `🏢 إشعار مدير المشروع والشركة: استلام وتفريغ مواد ${po.poNumber} في الموقع`,
      message: `بۆ بەڕێز بەڕێوەبەر (${po.requestedBy || 'Project Manager'}): کەرەستەکانی پڕۆژە بەپێی پسوولەی ${po.poNumber} لە خاڵی پشکنین و دەروازە سکان کرا و داخڵ کرا. تۆماری کۆگا و قەواڵەی دارایی خۆکارانە بەستراوەتەوە.`,
      type: 'PROJECT_ALERT',
      relatedId: po.id,
      targetRole: 'PROJECT_MANAGER',
    });

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 }
      });
    } catch (_) {}

    return {
      success: true,
      po,
      message: `Triple notification executed successfully! Warehouse, Finance, and Project Managers synced.`,
      itemsUpdated: itemsUpdatedSummary,
      voucherNo: journalVoucherNo,
      notificationsDispatched: ['Warehouse Officer', 'Finance Head', 'Project / Company Manager']
    };
  };

  const deleteGateLog = (id: string) => {
    setGateLogs(prev => {
      const updated = prev.filter(g => g.id !== id);
      try {
        localStorage.setItem('sas4erp_gate_logs', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  const addForeignWorker = (worker: Omit<ForeignWorker, 'id'>) => {
    const newWorker: ForeignWorker = { ...worker, id: `fw-${Date.now()}` };
    setForeignWorkers(prev => [newWorker, ...prev]);
  };

  const updateForeignWorker = (id: string, data: Partial<ForeignWorker>) => {
    setForeignWorkers(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
  };

  const renewForeignWorkerResidency = (workerId: string, newExpiryDate: string, receiptNo?: string, notes?: string) => {
    const today = new Date();
    const expDate = new Date(newExpiryDate);
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    setForeignWorkers(prev => prev.map(w => {
      if (w.id === workerId) {
        return {
          ...w,
          iqamaExpiry: newExpiryDate,
          iqamaExpiryDate: newExpiryDate,
          visaStatus: 'VALID',
          daysRemaining: diffDays > 0 ? diffDays : 365,
          lastRenewalDate: new Date().toISOString().split('T')[0],
          renewalReceiptNo: receiptNo || `REC-IQ-${Math.floor(10000 + Math.random() * 90000)}`,
          renewalNotes: notes || 'Residency renewed and extended for one calendar year.',
        };
      }
      return w;
    }));

    addNotification({
      title: 'Residency Renewed Successfully',
      titleKu: 'نشینگەی کارمەندی بیانی نوێکرایەوە',
      titleAr: 'تم تجديد إقامة الموظف الأجنبي بنجاح',
      message: `Iqama renewed until ${newExpiryDate} with receipt ${receiptNo || 'official'}.`,
      messageKu: `نیشتەجێبوونی کارمەند نوێکرایەوە تا بەرواری ${newExpiryDate} بە وەسڵی فەرمی فەرمانگەی نشینگە.`,
      type: 'EXPIRY_WARNING',
    });
  };

  const deleteForeignWorker = (id: string) => {
    setForeignWorkers(prev => {
      const updated = prev.filter(w => w.id !== id);
      try {
        localStorage.setItem('sas4erp_foreign_workers', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  // Weekly & Monthly Project Reports Workflow
  const addProjectReport = (report: Omit<ProjectPeriodicReport, 'id'>) => {
    const newReport: ProjectPeriodicReport = {
      ...report,
      id: `rep-${Date.now()}`,
      reportNumber: report.reportNumber || `REP-${report.reportType === 'WEEKLY' ? 'WK' : 'MO'}-2026-${Math.floor(100 + Math.random() * 900)}`,
      dateCreated: report.dateCreated || new Date().toISOString().split('T')[0],
      status: report.status || 'DRAFT'
    };
    setProjectReports(prev => [newReport, ...prev]);
    addNotification({
      title: `New Project Report Drafted: ${newReport.reportNumber}`,
      titleKu: `ڕاپۆرتی نوێی پڕۆژە ئامادەکرا: ${newReport.reportNumber}`,
      titleAr: `تم إعداد مسودة تقرير المشروع: ${newReport.reportNumber}`,
      message: `Report prepared for ${newReport.projectName}. Pending signature and scanned physical copy.`,
      type: 'OWNER_APPROVAL_REQUIRED',
    });
  };

  const updateProjectReport = (id: string, data: Partial<ProjectPeriodicReport>) => {
    setProjectReports(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  };

  const signProjectReport = (id: string, pmName: string, signatureDataUrl?: string) => {
    setProjectReports(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          isPmSigned: true,
          projectManagerName: pmName,
          pmSignatureDate: new Date().toISOString(),
          pmSignatureDataUrl: signatureDataUrl || r.pmSignatureDataUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70"><path d="M15,45 Q40,15 70,35 T130,25 T190,40" fill="none" stroke="%231e40af" stroke-width="3"/><text x="20" y="62" font-size="11" fill="%231e3a8a" font-family="sans-serif">Rebaz Ahmed - PM Verified 2026</text></svg>',
          status: r.scannedDocumentUrl ? 'SUBMITTED_TO_UPPER_MANAGEMENT' : 'PM_SIGNED'
        };
      }
      return r;
    }));
  };

  const attachScannedReport = (id: string, scanDataUrl: string, fileName: string) => {
    setProjectReports(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          scannedDocumentUrl: scanDataUrl,
          scannedFileName: fileName,
          scannedFileSize: '2.4 MB',
          scannedUploadedAt: new Date().toISOString(),
          isScanVerified: true,
          status: r.isPmSigned ? 'SUBMITTED_TO_UPPER_MANAGEMENT' : 'SCANNED_AND_ATTACHED'
        };
      }
      return r;
    }));
  };

  const submitReportToUpper = (id: string) => {
    setProjectReports(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'SUBMITTED_TO_UPPER_MANAGEMENT',
          submittedToUpperAt: new Date().toISOString()
        };
      }
      return r;
    }));

    addNotification({
      title: 'Project Report Submitted to Holding',
      titleKu: 'ڕاپۆرتی واژۆکراو و سکانکراوی پڕۆژە نێردرا بۆ خاوەنی هۆلدینگ',
      titleAr: 'تم إرسال التقرير الدوري الموقع والممسوح ضوئياً إلى إدارة المجموعة',
      message: 'Weekly/Monthly report received with signed scan verification.',
      type: 'OWNER_APPROVAL_REQUIRED'
    });
  };

  const approveReportByHolding = (id: string, approvedBy: string, notesKu?: string) => {
    setProjectReports(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'APPROVED_BY_HOLDING',
          holdingApprovedBy: approvedBy,
          holdingApprovalDate: new Date().toISOString(),
          holdingOwnerNotesKu: notesKu || 'پەسەندکرا لەلایەن خاوەنی هۆلدینگ بە سەرکەوتوویی.'
        };
      }
      return r;
    }));

    addNotification({
      title: 'Project Report Approved by Holding Owner',
      titleKu: 'ڕاپۆرتی پڕۆژە لەلایەن خاوەنی هۆلدینگەوە پەسەندکرا',
      titleAr: 'تمت المصادقة النهائية على تقرير المشروع من قبل مالك المجموعة',
      message: 'Official approval registered in holding audit trail.',
      type: 'OWNER_APPROVAL_REQUIRED'
    });
  };

  const addCamp = (camp: Omit<AccommodationCamp, 'id'>) => {
    const newCamp: AccommodationCamp = { ...camp, id: `camp-${Date.now()}` };
    setCamps(prev => [newCamp, ...prev]);
  };

  const addHseLog = (log: Omit<HseIncidentSafety, 'id'>) => {
    const newLog: HseIncidentSafety = { ...log, id: `hse-${Date.now()}` };
    setHseLogs(prev => [newLog, ...prev]);
  };

  const addTechnicalEquipment = (eq: Omit<TechnicalMaintenance, 'id'>) => {
    const newEq: TechnicalMaintenance = { ...eq, id: `tech-${Date.now()}` };
    setTechnicalEquipments(prev => [newEq, ...prev]);
  };

  const updateTechnicalEquipment = (id: string, data: Partial<TechnicalMaintenance>) => {
    setTechnicalEquipments(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const addCorrespondence = (letter: Omit<CorrespondenceLetter, 'id' | 'letterNumber'>) => {
    const isProject = !!letter.projectId && letter.projectId !== 'ALL';
    const letterNumber = `SAS-${letter.type === 'OUTBOUND' ? 'OUT' : 'IN'}/2026-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Strict Workflow Rule: If letter originates from a project, it MUST start at PENDING_PM_APPROVAL and is BLOCKED from holding!
    const initialStage: LetterApprovalStage = letter.approvalStage || (isProject ? 'PENDING_PM_APPROVAL' : 'PENDING_GM_APPROVAL');
    const isBlocked = isProject && initialStage === 'PENDING_PM_APPROVAL';

    const newLetter: CorrespondenceLetter = {
      ...letter,
      id: `let-${Date.now()}`,
      letterNumber,
      approvalStage: initialStage,
      isProjectOrigin: isProject,
      isBlockedWithoutPmApproval: isBlocked,
      routingSteps: letter.routingSteps || [
        {
          stage: 'DRAFT',
          stageNameKu: `داڕشتن لەلایەن ${letter.originDepartmentNameKu || 'بەش'}`,
          actorName: letter.senderPerson,
          actorRole: letter.senderRole || 'Department Officer',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'APPROVED',
        },
        ...(isProject ? [{
          stage: 'PENDING_PM_APPROVAL' as const,
          stageNameKu: 'پەسەندکردنی بەڕێوەبەری پرۆژە (PM)',
          actorName: 'Project Manager',
          actorRole: 'Site PM',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'PENDING' as const,
          comments: 'بەبێ مۆری بەڕێوەبەری پرۆژە ناتوانرێت بۆ هۆلدینگ بەرز بکرێتەوە',
        }] : [{
          stage: 'PENDING_GM_APPROVAL' as const,
          stageNameKu: 'پەسەندکردنی بەڕێوەبەری گشتی کۆمپانیا (GM)',
          actorName: 'Company GM',
          actorRole: 'General Manager',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'PENDING' as const,
        }])
      ],
    };

    setCorrespondence(prev => [newLetter, ...prev]);

    addNotification({
      title: `New Memo Logged: ${newLetter.letterNumber}`,
      titleKu: `نوسراوی نوێ تۆمارکرا: ${newLetter.subjectKu || newLetter.subject}`,
      titleAr: `تم تسجيل مذكرة جديدة: ${newLetter.subjectAr || newLetter.subject}`,
      message: `Originating Department: ${newLetter.originDepartmentNameKu || newLetter.originDepartment}. Current Gate: ${newLetter.approvalStage}.`,
      type: 'OWNER_APPROVAL_REQUIRED',
      relatedId: newLetter.id,
    });
  };

  const approveLetterByPM = (letterId: string, comments: string = 'Verified & Approved by Project Manager') => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const stampId = `STAMP-PM-${Math.floor(1000 + Math.random() * 9000)}`;

    setCorrespondence(prev => prev.map(letter => {
      if (letter.id === letterId) {
        const updatedSteps = [
          ...letter.routingSteps.map(s => s.stage === 'PENDING_PM_APPROVAL' ? { ...s, status: 'APPROVED' as const, comments, sealHash: stampId } : s),
          {
            stage: 'PENDING_GM_APPROVAL' as const,
            stageNameKu: 'پەسەندکردنی بەڕێوەبەری گشتی کۆمپانیا (GM)',
            actorName: 'Company GM',
            actorRole: 'General Manager',
            timestamp,
            status: 'PENDING' as const,
            comments: 'Escalated from Project to General Manager Desk',
          }
        ];

        return {
          ...letter,
          approvalStage: 'PENDING_GM_APPROVAL' as const,
          isBlockedWithoutPmApproval: false,
          projectManagerApproval: {
            approvedBy: currentUser.name,
            approvedAt: timestamp,
            status: 'APPROVED',
            comments,
            digitalStampId: stampId,
          },
          routingSteps: updatedSteps,
        };
      }
      return letter;
    }));

    addNotification({
      title: `Letter PM Stamp Granted`,
      titleKu: `مۆری بەڕێوەبەری پرۆژە لێدرا بۆ نوسراو`,
      titleAr: `تم اعتماد المذكرة من قبل مدير المشروع`,
      message: `Letter has passed project verification and is now forwarded to Subsidiary GM desk.`,
      type: 'OWNER_APPROVAL_REQUIRED',
    });
  };

  const approveLetterByGM = (letterId: string, comments: string = 'Endorsed by Subsidiary General Manager') => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const stampId = `STAMP-GM-${Math.floor(1000 + Math.random() * 9000)}`;

    setCorrespondence(prev => prev.map(letter => {
      if (letter.id === letterId) {
        const updatedSteps = [
          ...letter.routingSteps.map(s => s.stage === 'PENDING_GM_APPROVAL' ? { ...s, status: 'APPROVED' as const, comments, sealHash: stampId } : s),
          {
            stage: 'PENDING_HOLDING_REVIEW' as const,
            stageNameKu: 'بڕیاری کۆتایی دەستەی هۆلدینگ و خاوەن',
            actorName: holding.chairmanName,
            actorRole: 'Holding Chairman',
            timestamp,
            status: 'PENDING' as const,
            comments: 'Awaiting Executive Holding Seal from Owner',
          }
        ];

        return {
          ...letter,
          approvalStage: 'PENDING_HOLDING_REVIEW' as const,
          subsidiaryGmApproval: {
            approvedBy: currentUser.name,
            approvedAt: timestamp,
            status: 'APPROVED',
            comments,
            digitalStampId: stampId,
          },
          routingSteps: updatedSteps,
        };
      }
      return letter;
    }));

    addNotification({
      title: `Letter GM Endorsement Granted`,
      titleKu: `نوسراو پەسەندکرا لەلایەن بەڕێوەبەری گشتی و بەرزکرایەوە بۆ هۆلدینگ`,
      titleAr: `تمت المصادقة من المدير العام ورفعها إلى رئيس الهولدينغ`,
      message: `Letter is now on the Holding Owner / Chairman desk for final executive decision.`,
      type: 'OWNER_APPROVAL_REQUIRED',
    });
  };

  const decideLetterByHolding = (letterId: string, decision: 'APPROVED' | 'REJECTED', notes: string = 'Executive Holding Decision Rendered') => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const sealNumber = `SEAL-HOLDING-EXEC-${Math.floor(10000 + Math.random() * 90000)}`;

    setCorrespondence(prev => prev.map(letter => {
      if (letter.id === letterId) {
        const updatedSteps = [
          ...letter.routingSteps.map(s => s.stage === 'PENDING_HOLDING_REVIEW' ? {
            ...s,
            status: decision === 'APPROVED' ? ('APPROVED' as const) : ('REJECTED' as const),
            comments: notes,
            sealHash: decision === 'APPROVED' ? sealNumber : undefined
          } : s)
        ];

        return {
          ...letter,
          approvalStage: decision === 'APPROVED' ? ('HOLDING_APPROVED' as const) : ('REJECTED' as const),
          stampApproved: decision === 'APPROVED',
          holdingExecutiveDecision: {
            decidedBy: currentUser.name,
            decidedAt: timestamp,
            decision: decision,
            directiveNotes: notes,
            officialSealNumber: decision === 'APPROVED' ? sealNumber : undefined,
          },
          routingSteps: updatedSteps,
        };
      }
      return letter;
    }));

    if (decision === 'APPROVED') {
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (_) {}
    }

    addNotification({
      title: `Holding Executive Decision: ${decision}`,
      titleKu: `بڕیاری سەرۆکی هۆلدینگ: ${decision === 'APPROVED' ? 'مۆری فەرمی لێدرا و پەسەندکرا' : 'ڕەتکرایەوە'}`,
      titleAr: `قرار رئاسة الهولدينغ: ${decision === 'APPROVED' ? 'تم الختم والاعتماد الرسمي' : 'تم الرفض'}`,
      message: `Directive issued with official seal ${sealNumber}. All subsidiary units synchronized.`,
      type: 'OWNER_APPROVAL_REQUIRED',
    });
  };

  const requestHoldingMeeting = (params: { sourceType: 'COMPANY' | 'PROJECT'; sourceId: string; sourceName: string; departmentName?: string; agendaTopic?: string }) => {
    const title = `Urgent Holding Strategic Coordination: ${params.sourceName} (${params.departmentName || 'All Depts'})`;
    const newMeeting: VirtualMeeting = {
      id: `meet-${Date.now()}`,
      title,
      hostName: currentUser.name,
      scheduledTime: 'Today, 03:00 PM (Holding Direct Line)',
      status: 'LIVE',
      attendees: [
        { name: holding.chairmanName || 'خاوەنی هۆلدینگ', role: 'Holding Chairman / Owner', company: holding.nameKu || holding.name, avatar: '👑', isAudioOn: true, isVideoOn: true },
        { name: currentUser.name, role: currentUser.role, company: params.sourceName, avatar: currentUser.avatar || '👔', isAudioOn: true, isVideoOn: true },
        { name: 'بەڕێوەبەری بەشی پەیوەندیدار', role: 'Department Lead', company: params.sourceName, avatar: '📐', isAudioOn: true, isVideoOn: true },
      ],
      agenda: [
        `Direct operational sync between ${params.sourceName} and Holding Leadership`,
        params.agendaTopic || 'Review departmental KPIs, ongoing bottlenecks, and direct holding support',
        'Review pending correspondence approvals & procurement sanctions',
      ],
      actionItems: [],
    };

    setVirtualMeetings(prev => [newMeeting, ...prev]);
    setActiveMeeting(newMeeting);
    setIsMeetingModalOpen(true);

    addNotification({
      title: `Holding Strategic Meeting Convened`,
      titleKu: `کۆبوونەوەی ڕاستەوخۆ لەگەڵ هۆلدینگ ڕێکخرا بۆ ${params.sourceName}`,
      titleAr: `تم ترتيب اجتماع استراتيجي مباشر مع الهولدينغ لـ ${params.sourceName}`,
      message: `Direct channel opened with Holding Chairman for ${params.sourceName} ${params.departmentName ? `[${params.departmentName}]` : ''}.`,
      type: 'MEETING_INVITE',
    });
  };

  const addWarehouseItem = (item: Omit<WarehouseItem, 'id'>) => {
    const newItem: WarehouseItem = { ...item, id: `wh-${Date.now()}` };
    setWarehouseItems(prev => [newItem, ...prev]);
  };

  const resetAllFinancialsToZero = () => {
    setHolding(prev => ({
      ...prev,
      totalBudgetUSD: 0,
      totalRevenueUSD: 0,
      totalExpensesUSD: 0,
      totalEmployees: 0,
    }));
    setCompanies(prev => prev.map(c => ({
      ...c,
      annualBudgetUSD: 0,
      spentUSD: 0,
      employeeCount: 0,
      departments: c.departments?.map(d => ({ ...d, budgetAllocatedUSD: 0, budgetSpentUSD: 0, staffCount: 0 })) || []
    })));
    setProjects(prev => prev.map(p => ({
      ...p,
      budgetUSD: 0,
      spentUSD: 0,
      progressPercentage: 0,
      engineersCount: 0,
      workersCount: 0,
      departments: p.departments?.map(d => ({ ...d, budgetAllocatedUSD: 0, budgetSpentUSD: 0, staffCount: 0 })) || []
    })));
    setPurchaseOrders([]);
    setGateLogs([]);
    setFinanceLedgers([]);
    setEmployees(prev => prev.map(e => ({ ...e, salaryUSD: 0 })));
    setForeignWorkers(prev => prev.map(w => ({ ...w, salaryUSD: 0 })));
    setWarehouseItems(prev => prev.map(item => ({ ...item, quantityOnHand: 0, averageUnitCostUSD: 0 })));

    localStorage.removeItem('sas4erp_holding');
    localStorage.removeItem('sas4erp_companies');
    localStorage.removeItem('sas4erp_projects');
    localStorage.removeItem('sas4erp_pos');
    localStorage.removeItem('sas4erp_gate_logs');
    localStorage.removeItem('sas4erp_foreign_workers');
    
    addNotification({
      titleKu: 'سەرجەم ژمارە داراییەکان و دەفتەرەکان کران بە سفڕ (0)',
      title: 'All Accounting Numbers & Ledgers Reset to Zero (0)',
      messageKu: 'ژمارە نا دروستەکان سڕانەوە و هەموو ژمارەکان بە سەرکەوتوویی کران بە 0 بۆ ژمێریاری پاک.',
      message: 'All inaccurate mock numbers were successfully cleared and set to 0 for accurate bookkeeping.',
      type: 'FINANCE_ENTRY'
    });
  };

  const clearAllMockData = () => {
    setCompanies([]);
    setProjects([]);
    setPurchaseOrders([]);
    setGateLogs([]);
    setForeignWorkers([]);
    setEmployees([]);
    setFinanceLedgers([]);
    setProjectReports([]);
    setAnomalyAlerts([]);
    setGeneralManagers([]);
    setHolding(prev => ({
      ...prev,
      totalCompanies: 0,
      totalProjects: 0,
      totalEmployees: 0,
      totalBudgetUSD: 0,
      totalRevenueUSD: 0,
      totalExpensesUSD: 0,
    }));
    try {
      localStorage.setItem('sas4erp_companies', JSON.stringify([]));
      localStorage.setItem('sas4erp_projects', JSON.stringify([]));
      localStorage.setItem('sas4erp_pos', JSON.stringify([]));
      localStorage.setItem('sas4erp_gate_logs', JSON.stringify([]));
      localStorage.setItem('sas4erp_foreign_workers', JSON.stringify([]));
      localStorage.setItem('sas4erp_employees', JSON.stringify([]));
      localStorage.setItem('sas4erp_finance_ledgers', JSON.stringify([]));
      localStorage.setItem('sas4erp_general_managers', JSON.stringify([]));
    } catch (_) {}

    addNotification({
      titleKu: 'تەواوی داتای تاقیکاری بە سەرکەوتوویی سڕایەوە',
      title: 'All Mock & Dummy Data Cleared',
      messageKu: 'سیستەم ئێستا تەواو خاوێنە و دەتوانیت کۆمپانیا و پڕۆژە ڕاستەقینەکانی خۆت زیاد بکەیت.',
      message: 'Workspace cleared. You can now register real companies, projects, and staff.',
      type: 'FINANCE_ENTRY'
    });
  };

  const restoreSampleData = () => {
    setCompanies(initialCompanies);
    setProjects(initialProjects);
    setPurchaseOrders(initialPurchaseOrders);
    setGateLogs(initialGateLogs);
    setForeignWorkers(initialForeignWorkers);
    setEmployees(initialEmployees);
    setFinanceLedgers(initialFinanceLedgers);
    setGeneralManagers(initialGeneralManagers);
    try {
      localStorage.removeItem('sas4erp_companies');
      localStorage.removeItem('sas4erp_projects');
      localStorage.removeItem('sas4erp_pos');
      localStorage.removeItem('sas4erp_gate_logs');
      localStorage.removeItem('sas4erp_foreign_workers');
      localStorage.removeItem('sas4erp_employees');
      localStorage.removeItem('sas4erp_finance_ledgers');
      localStorage.removeItem('sas4erp_general_managers');
    } catch (_) {}

    addNotification({
      titleKu: 'داتای نموونەیی گەڕێنرایەوە',
      title: 'Sample Data Restored',
      messageKu: 'داتای نموونەیی بۆ تاقیکردنەوە گەڕێنرایەوە.',
      message: 'Sample holding data restored for exploration.',
      type: 'FINANCE_ENTRY'
    });
  };

  const addFinanceEntry = (entry: Omit<FinanceLedgerEntry, 'id' | 'voucherNumber'>) => {
    const voucherNumber = `VCH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry: FinanceLedgerEntry = {
      ...entry,
      id: `fin-${Date.now()}`,
      voucherNumber,
    };
    setFinanceLedgers(prev => [newEntry, ...prev]);
  };

  const deleteFinanceEntry = (id: string) => {
    setFinanceLedgers(prev => prev.filter(e => e.id !== id));
  };

  const startMeeting = (meetingData: Partial<VirtualMeeting>) => {
    const newMeeting: VirtualMeeting = {
      id: `meet-${Date.now()}`,
      title: meetingData.title || 'Holding Executive Strategic Meeting',
      hostName: currentUser.name,
      scheduledTime: 'In Progress (Live)',
      status: 'LIVE',
      attendees: meetingData.attendees || initialVirtualMeetings[0].attendees,
      agenda: meetingData.agenda || [
        'Review subsidiary budget & progress',
        'Approve urgent procurement requisitions',
        'Gate logistics & camp management'
      ],
      actionItems: [],
      ...meetingData,
    };
    setVirtualMeetings(prev => [newMeeting, ...prev]);
    setActiveMeeting(newMeeting);
    setIsMeetingModalOpen(true);
  };

  const endMeeting = (id: string) => {
    setVirtualMeetings(prev => prev.map(m => m.id === id ? { ...m, status: 'CONCLUDED' } : m));
    setIsMeetingModalOpen(false);
  };

  const updateMeetingMinutes = (id: string, minutes: string) => {
    setVirtualMeetings(prev => prev.map(m => m.id === id ? { ...m, meetingMinutes: minutes } : m));
    if (activeMeeting?.id === id) {
      setActiveMeeting(prev => prev ? { ...prev, meetingMinutes: minutes } : null);
    }
  };

  const sendDirectMessage = (receiverId: string, text: string, priority: 'NORMAL' | 'URGENT' | 'HOLDING_DIRECTIVE' = 'NORMAL') => {
    const receiver = currentUserProfiles.find(u => u.id === receiverId) || currentUserProfiles[1];
    const newMsg: DirectMessage = {
      id: `dm-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId,
      receiverName: receiver.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messageText: text,
      originalLanguage: currentUser.nativeLanguage,
      priority,
    };
    setDirectMessages(prev => [...prev, newMsg]);
  };

  const startCallWithManager = (manager: { name: string; role: string; phone: string; company: string; avatar: string }) => {
    setActiveCallingManager(manager);
    setIsCallModalOpen(true);
  };

  const closeCallModal = () => {
    setIsCallModalOpen(false);
    setActiveCallingManager(null);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const syncHardwareThresholdAlertsNow = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/it-alerts/status'));
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.alerts)) {
        setNotifications((prevNotifs) => {
          const updatedNotifs = [...prevNotifs];
          let changed = false;

          data.alerts.forEach((alert: any) => {
            if (alert.dispatchedToNotificationCenter && !alert.acknowledged) {
              const alreadyExists = updatedNotifs.some(n => n.relatedId === alert.id);
              if (!alreadyExists) {
                changed = true;
                updatedNotifs.unshift({
                  id: `notif-${alert.id}`,
                  title: alert.titleEn,
                  titleKu: alert.titleKu,
                  message: alert.messageEn,
                  messageKu: alert.messageKu,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  type: 'HARDWARE_ALERT',
                  isRead: false,
                  relatedId: alert.id,
                  targetRole: alert.targetRoles?.[0] || 'PROJECT_MANAGER',
                  targetRecipientName: alert.assignedManagerName,
                  targetEntityId: alert.assetId,
                  directives: alert.directivesEn
                });
              }
            }
          });

          return changed ? updatedNotifs : prevNotifs;
        });
      }
    } catch (err) {
      console.error('Error syncing hardware threshold alerts:', err);
    }
  }, []);

  // Automated background threshold evaluation sync
  useEffect(() => {
    syncHardwareThresholdAlertsNow();
    const interval = setInterval(syncHardwareThresholdAlertsNow, 45000);
    return () => clearInterval(interval);
  }, [syncHardwareThresholdAlertsNow]);

  return (
    <ERPContext.Provider
      value={{
        holding,
        updateHolding,
        companies,
        addCompany,
        updateCompany,
        deleteCompany,
        generalManagers,
        addGeneralManager,
        updateGeneralManager,
        deleteGeneralManager,
        selectedGmId,
        setSelectedGmId,
        projects,
        addProject,
        updateProject,
        deleteProject,
        addSubProject,
        updateSubProject,
        deleteSubProject,
        selectedCompanyId,
        setSelectedCompanyId,
        selectedProjectId,
        setSelectedProjectId,
        currentUser,
        setCurrentUser,
        userProfiles: userProfiles.map(p => {
          if (p.role === 'HOLDING_OWNER') {
            return {
              ...p,
              name: holding.chairmanName?.trim()
                ? `${holding.chairmanName.trim()} (خاوەنی هۆلدینگ)`
                : p.name,
            };
          }
          return p;
        }),
        updateUserProfile,
        addUserProfile,
        deleteUserProfile,
        isUserRolesModalOpen,
        setIsUserRolesModalOpen,
        purchaseOrders,
        addPurchaseOrder,
        deletePurchaseOrder,
        approvePurchaseByOwner,
        rejectPurchaseByOwner,
        gateLogs,
        processGateScan,
        deleteGateLog,
        foreignWorkers,
        addForeignWorker,
        updateForeignWorker,
        renewForeignWorkerResidency,
        deleteForeignWorker,
        projectReports,
        addProjectReport,
        updateProjectReport,
        signProjectReport,
        attachScannedReport,
        submitReportToUpper,
        approveReportByHolding,
        camps,
        addCamp,
        hseLogs,
        addHseLog,
        technicalEquipments,
        addTechnicalEquipment,
        updateTechnicalEquipment,
        correspondence,
        addCorrespondence,
        approveLetterByPM,
        approveLetterByGM,
        decideLetterByHolding,
        warehouseItems,
        addWarehouseItem,
        financeLedgers,
        addFinanceEntry,
        deleteFinanceEntry,
        resetAllFinancialsToZero,
        clearAllMockData,
        restoreSampleData,
        virtualMeetings,
        activeMeeting,
        startMeeting,
        endMeeting,
        updateMeetingMinutes,
        requestHoldingMeeting,
        directMessages,
        sendDirectMessage,
        notifications,
        markNotificationAsRead,
        addNotification,
        syncHardwareThresholdAlertsNow,
        isGateScannerOpen,
        setIsGateScannerOpen,
        isMeetingModalOpen,
        setIsMeetingModalOpen,
        isCallModalOpen,
        setIsCallModalOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        activeCallingManager,
        startCallWithManager,
        closeCallModal,
        activeInspectingDept,
        setActiveInspectingDept,
        addDepartmentToEntity,
        deleteDepartmentFromEntity,
        importBatchCompanies,
        importBatchProjects,
        importBatchFinanceLedgers,
        importBatchEmployees,
        importBatchWarehouseItems,
        isHoldingSetupOpen,
        setIsHoldingSetupOpen,
        isUserManualOpen,
        setIsUserManualOpen,
        isLicenseModalOpen,
        setIsLicenseModalOpen,
        licenseModalInitialTab,
        setLicenseModalInitialTab,
        openLicenseModal,
        isOwnerVerifyModalOpen,
        setIsOwnerVerifyModalOpen,
        systemLicense,
        setSystemLicense,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isSkylineBgEnabled,
        setIsSkylineBgEnabled,
        skylineBgPreset,
        setSkylineBgPreset,
        skylineBgOpacity,
        setSkylineBgOpacity,
        skylineBgBlur,
        setSkylineBgBlur,
        isSkylineModalOpen,
        setIsSkylineModalOpen,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        dispatchShipments,
        itAssets,
        employees,
        anomalyAlerts,
        attendanceRecords,
        anomalyStats,
        mlSensitivity,
        setMlSensitivity,
        isRealTimeMlActive,
        setIsRealTimeMlActive,
        runMLScan,
        updateAnomalyStatus,
        executeAnomalyAction,
        addAttendanceRecord,
        simulateAnomalyPattern,
        workflowRules,
        addWorkflowRule,
        updateWorkflowRule,
        deleteWorkflowRule,
        thresholdPolicy,
        updateThresholdPolicy,
        approvalAuditTrail,
        processWorkflowStep,
        submitPurchaseRequest,
        isPoFullyApproved,
        canPoEnterProject,
        grantCeoPreApproval,
        delegatePoSpendingAuthority,
        setEntitySpendingAutonomy,
        isPoDelegatedOrAutonomous,
        signPmReleaseForProcurement,
        collectFundsByProcurement,
        canUserApproveWorkflowStep,
        approveWorkflowStep,
        disbursePoPayment,
        receiveApprovedPoToWarehouse,
        gmBudgetPolicies,
        addGmBudgetPolicy,
        updateGmBudgetPolicy,
        deleteGmBudgetPolicy,
        evaluateGMForPO,
        autoApproveGMStep,
        signatureProfiles,
        defaultSignature,
        saveSignatureProfile,
        deleteSignatureProfile,
        isSignatureModalOpen,
        setIsSignatureModalOpen,
        signatureTargetPoId,
        setSignatureTargetPoId,
        printerDevices,
        defaultPrinter,
        addPrinterDevice,
        updatePrinterDevice,
        deletePrinterDevice,
        setDefaultPrinter,
        isPrinterModalOpen,
        setIsPrinterModalOpen,
        printPreviewPO,
        setPrintPreviewPO,
        holdingSectors,
        addHoldingSector,
        updateHoldingSector,
        deleteHoldingSector,
        resetHoldingSectorsToDefault,
        syncSectorsWithCompanies,
        printManager,
        printQueue,
        printPurchaseOrder,
        printDigitalApproval,
        printKpiReport,
        reprintJob,
        cancelPrintJob,
        clearPrintHistory,
        isPrintManagerModalOpen,
        setIsPrintManagerModalOpen,
        openPrintManager,
        intercompanyInvoices,
        createBilateralIntercompanyInvoice,
        settleIntercompanyInvoice,
        deleteIntercompanyPair,
        isConsolidationEnabled,
        setIsConsolidationEnabled,
        consolidationSummary,
        isCloudSyncModalOpen,
        setIsCloudSyncModalOpen,
        holdingCloudSyncStatus,
        triggerForceSync,
        holdingSyncKey,
        setHoldingSyncKey: handleUpdateHoldingSyncKey,
      }}
    >
      {children}
      <HoldingCloudSyncModal
        isOpen={isCloudSyncModalOpen}
        onClose={() => setIsCloudSyncModalOpen(false)}
        holdingName={holding.name}
        onForceSync={triggerForceSync}
      />
      <PrintManagerModal
        isOpen={isPrintManagerModalOpen}
        onClose={() => {
          setIsPrintManagerModalOpen(false);
          setPrintManagerActiveDoc(null);
        }}
        initialDocument={printManagerActiveDoc}
      />
      <ElectronicSignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => {
          setIsSignatureModalOpen(false);
          setSignatureTargetPoId(null);
        }}
        targetPoId={signatureTargetPoId || undefined}
        onSignComplete={(signatureUrl, sealUrl) => {
          if (signatureTargetPoId) {
            approvePurchaseByOwner(
              signatureTargetPoId,
              `Digitally signed and sealed by ${currentUser.name || 'Holding Owner'}`,
              signatureUrl,
              sealUrl
            );
            setSignatureTargetPoId(null);
          }
        }}
      />
      <PrinterConnectivityModal
        isOpen={isPrinterModalOpen}
        onClose={() => setIsPrinterModalOpen(false)}
        onOpenTestPrint={(device) => {
          const testPO: PurchaseOrder = {
            id: 'po-test-print',
            poNumber: `TEST-PRINT-${Date.now().toString().slice(-4)}`,
            companyId: companies[0]?.id || 'comp-1',
            projectId: projects[0]?.id || 'proj-1',
            requestedBy: currentUser.name || 'System Administrator',
            requesterRole: 'Holding Operations Director',
            supplierName: 'Global Enterprise Test Equipment Ltd.',
            items: [
              {
                id: 'item-t-1',
                name: 'Hardware Printer Station Diagnostic & Calibration Page',
                nameKu: 'تاقیکردنەوەی پەیوەندی پرینتەر و کالیبرەیکردنی فەرمی',
                nameAr: 'صفحة تشخيص ومعايرة محطة الطباعة المادية',
                quantity: 1,
                unit: 'UNIT',
                unitPriceUSD: 0,
                totalUSD: 0,
                category: 'TEST_DIAGNOSTIC'
              }
            ],
            subtotalUSD: 0,
            taxUSD: 0,
            totalAmountUSD: 0,
            currency: 'USD',
            purpose: `Hardware Connectivity Diagnostic Test for ${device.name} (${device.type}). Verifying alignment, barcode rastering, and cryptographic seal output.`,
            originalLanguage: 'en',
            createdDate: new Date().toISOString(),
            status: 'APPROVED_BY_OWNER',
            holdingApproval: {
              approvedBy: holding.chairmanName || currentUser.name || 'Holding Owner',
              approvedAt: new Date().toLocaleString(),
              decision: 'APPROVED',
              comments: 'Hardware print test successful',
              signatureHash: `SIG-TEST-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
            }
          };
          setPrintPreviewPO(testPO);
        }}
      />
      {printPreviewPO && (
        <DocumentPrintPreviewModal
          isOpen={Boolean(printPreviewPO)}
          onClose={() => setPrintPreviewPO(null)}
          purchaseOrder={printPreviewPO}
          defaultFormat={defaultPrinter?.paperSize === '80mm' ? '80MM' : 'A4'}
        />
      )}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
