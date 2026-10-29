import React, { createContext, useContext, useState, useEffect } from 'react';
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
  SubProject
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
  currentUserProfiles
} from '../data/initialData';
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

  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdDate' | 'status'>) => void;
  deletePurchaseOrder: (id: string) => void;
  approvePurchaseByOwner: (poId: string, comments?: string) => void;
  rejectPurchaseByOwner: (poId: string, comments?: string) => void;

  gateLogs: GateEntryLog[];
  processGateScan: (barcodeOrPo: string, customDetails?: any) => Promise<{ success: boolean; po?: PurchaseOrder; message: string }>;
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

  // General Manager Budget Policies & Decisions
  gmBudgetPolicies: GMProjectBudgetPolicy[];
  addGmBudgetPolicy: (policy: Omit<GMProjectBudgetPolicy, 'id' | 'updatedAt'>) => void;
  updateGmBudgetPolicy: (id: string, policy: Partial<GMProjectBudgetPolicy>) => void;
  deleteGmBudgetPolicy: (id: string) => void;
  evaluateGMForPO: (po: PurchaseOrder) => GMEvaluationResult;
  autoApproveGMStep: (poId: string, comments?: string) => void;
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
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved holding', e);
      }
    }
    return initialHolding;
  });

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
    const saved = localStorage.getItem('sas4erp_holding');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.chairmanName?.trim()) {
          return {
            ...defaultUser,
            name: parsed.chairmanName.trim(),
          };
        }
      } catch (e) {}
    }
    return defaultUser;
  });
  const [activeTab, setActiveTab] = useState<string>('holding-dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isGateScannerOpen, setIsGateScannerOpen] = useState<boolean>(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState<boolean>(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isHoldingSetupOpen, setIsHoldingSetupOpen] = useState<boolean>(false);
  const [activeCallingManager, setActiveCallingManager] = useState<{ name: string; role: string; phone: string; company: string; avatar: string } | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<VirtualMeeting | null>(initialVirtualMeetings[0]);
  const [activeInspectingDept, setActiveInspectingDept] = useState<{ companyId: string; projectId?: string; department: DepartmentOverview } | null>(null);

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

  const processWorkflowStep = (
    poId: string,
    stepNumber: number,
    decision: 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_INFO',
    comments: string = ''
  ) => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO || !targetPO.workflowState) return;

    const currentStep = targetPO.workflowState.steps.find(s => s.stepNumber === stepNumber);
    const performerRole = currentStep ? currentStep.role : currentUser.role;
    const performerName = currentUser.name;

    const updatedWorkflow = advanceWorkflowStep(
      targetPO.workflowState,
      targetPO.poNumber,
      stepNumber,
      decision,
      performerName,
      performerRole,
      comments || (decision === 'APPROVED' ? `Step approved by ${performerName}` : `Step rejected: ${comments}`)
    );

    const isFinalApproved = updatedWorkflow.finalDecision === 'APPROVED';
    const isRejected = updatedWorkflow.finalDecision === 'REJECTED';

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
              comments: comments || 'Workflow chain completed with full executive authorization',
              signatureHash: updatedWorkflow.steps.find(s => s.role === 'HOLDING_OWNER')?.signatureHash || `SIG-SAS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
            } : isRejected ? {
              approvedBy: performerName,
              approvedAt: new Date().toLocaleString(),
              decision: 'REJECTED' as const,
              comments: comments || 'Request rejected during workflow review',
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

    // Update global audit trail
    if (updatedWorkflow.auditTrail && updatedWorkflow.auditTrail[0]) {
      setApprovalAuditTrail(prev => {
        const updated = [updatedWorkflow.auditTrail[0], ...prev];
        try {
          localStorage.setItem('sas4erp_approval_audit_trail', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    if (isFinalApproved) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
      addNotification({
        title: `PO ${targetPO.poNumber} Fully Authorized!`,
        titleKu: `داواکاری کڕینی ${targetPO.poNumber} بە تەواوی پەسەندکرا!`,
        titleAr: `تم اعتماد أمر الشراء ${targetPO.poNumber} بالكامل!`,
        message: `All approval workflow tiers verified. Released for gate scanner and warehouse receiving.`,
        type: 'OWNER_APPROVAL_REQUIRED'
      });
    } else if (decision === 'REJECTED') {
      addNotification({
        title: `PO ${targetPO.poNumber} Rejected`,
        titleKu: `داواکاری کڕینی ${targetPO.poNumber} ڕەتکرایەوە`,
        titleAr: `تم رفض أمر الشراء ${targetPO.poNumber}`,
        message: `Reason: ${comments || 'Rejected during workflow review'}`,
        type: 'OWNER_APPROVAL_REQUIRED'
      });
    }
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

    addNotification({
      title: `New Approval Workflow Initiated (${poNumber})`,
      titleKu: `ڕێڕەوی نوێی پەسەندکردن دەستیپێکرد (${poNumber})`,
      titleAr: `بدأت دورة اعتماد جديدة (${poNumber})`,
      message: `${poData.requestedBy} requested $${poData.totalAmountUSD.toLocaleString()} for ${poData.purpose}. Routed to: ${matchedRule.nameEn}.`,
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

  const approvePurchaseByOwner = (poId: string, comments: string = 'Approved by Holding Chairman') => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO) return;

    if (targetPO.workflowState) {
      const ownerStep = targetPO.workflowState.steps.find(s => s.role === 'HOLDING_OWNER' && s.status === 'PENDING') 
        || targetPO.workflowState.steps.find(s => s.status === 'PENDING')
        || targetPO.workflowState.steps[targetPO.workflowState.steps.length - 1];

      if (ownerStep) {
        processWorkflowStep(poId, ownerStep.stepNumber, 'APPROVED', comments);
        return;
      }
    }

    setPurchaseOrders(prev => {
      const updated = prev.map(po => {
        if (po.id === poId) {
          return {
            ...po,
            status: 'APPROVED_BY_OWNER' as POStatus,
            holdingApproval: {
              approvedBy: currentUser.name,
              approvedAt: new Date().toLocaleString(),
              decision: 'APPROVED' as const,
              comments,
              signatureHash: `SIG-HOLDING-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
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
  const processGateScan = async (barcodeOrPo: string, customDetails?: any): Promise<{ success: boolean; po?: PurchaseOrder; message: string }> => {
    // Look up PO in system
    let po = purchaseOrders.find(p => p.poNumber.toLowerCase() === barcodeOrPo.toLowerCase() || p.id === barcodeOrPo);
    
    // If not found, create or match fallback
    if (!po) {
      // Find an approved PO or create a valid gate delivery PO
      const approvedPo = purchaseOrders.find(p => p.status === 'APPROVED_BY_OWNER' && !p.gateScanLog);
      if (approvedPo) {
        po = approvedPo;
      } else {
        po = purchaseOrders[0];
      }
    }

    const timestamp = new Date().toLocaleString();
    const driverName = customDetails?.driverName || 'Mustafa Tariq';
    const vehiclePlate = customDetails?.vehiclePlate || '48122 Erbil Commercial';
    const gateName = customDetails?.gateName || 'Main Gate #1 (North Inbound Security)';
    const journalVoucherNo = `VCH-AUTO-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Update PO with Gate Scan Log
    setPurchaseOrders(prev => prev.map(p => {
      if (p.id === po!.id) {
        return {
          ...p,
          status: 'ARRIVED_AT_GATE',
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
            paymentStatus: 'ACCRUED',
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
      description: `Automated Journal Entry on Gate Barcode Scan for ${po.poNumber} (${po.items.length} items arrived)`,
      sourceModule: 'GATE_SCAN_AUTO',
      referencePoId: po.id,
      postedBy: 'SAS4ERP Gate-to-Finance Automated Engine',
    };
    setFinanceLedgers(prev => [autoFinanceEntry, ...prev]);

    // 4. Update Warehouse stock
    if (po.items && po.items.length > 0) {
      setWarehouseItems(prev => {
        return prev.map(wh => {
          const matchedItem = po!.items.find(i => i.name.toLowerCase().includes(wh.name.toLowerCase()) || wh.name.toLowerCase().includes(i.name.toLowerCase()));
          if (matchedItem) {
            return {
              ...wh,
              quantityOnHand: wh.quantityOnHand + matchedItem.quantity,
              lastRestockedDate: new Date().toISOString().split('T')[0],
            };
          }
          return wh;
        });
      });
    }

    // 5. Send Triple Notification System
    addNotification({
      title: `Gate Inward: ${po.poNumber} Arrived!`,
      titleKu: `دەرگای سەرەکی: باری پسوولەی ${po.poNumber} گەیشت و سکانکرا!`,
      titleAr: `دخول البوابة: وصول شحنة أمر الشراء ${po.poNumber}!`,
      message: `Triple Automation Activated: (1) Warehouse notified (2) Finance auto-posted voucher ${journalVoucherNo} for $${po.totalAmountUSD.toLocaleString()} (3) Project Director ${po.requestedBy} alerted.`,
      messageAr: `تم تفعيل التزامن الثلاثي: إخطار المستودع، قيد آلي بالمالية (${journalVoucherNo})، وإشعار مدير المشروع.`,
      type: 'GATE_ALERT',
      relatedId: po.id,
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
      message: `Triple notification executed successfully! Warehouse, Finance, and Project Managers synced.`
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

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

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
        userProfiles: currentUserProfiles.map(p => {
          if (p.role === 'HOLDING_OWNER') {
            return {
              ...p,
              name: holding.chairmanName?.trim()
                ? `${holding.chairmanName.trim()} (خاوەنی هۆلدینگ)`
                : 'خاوەنی هۆلدینگ (Holding Owner)',
            };
          }
          return p;
        }),
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
        gmBudgetPolicies,
        addGmBudgetPolicy,
        updateGmBudgetPolicy,
        deleteGmBudgetPolicy,
        evaluateGMForPO,
        autoApproveGMStep,
      }}
    >
      {children}
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
