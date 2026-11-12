import { Language } from './erp';

export type TransactionType =
  | 'PURCHASE_ORDER'
  | 'SUBCONTRACT_AGREEMENT'
  | 'BUDGET_OVERRUN_EXCEPTION'
  | 'PAYMENT_DISBURSEMENT'
  | 'CAPITAL_EXPENDITURE';

export type ApproverRole =
  | 'PROJECT_MANAGER'
  | 'WAREHOUSE_OFFICER'
  | 'FINANCE_HEAD'
  | 'DEPARTMENT_HEAD'
  | 'COST_CONTROLLER'
  | 'GENERAL_MANAGER'
  | 'HOLDING_VP'
  | 'HOLDING_OWNER';

export type ApprovalStepStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SKIPPED'
  | 'DELEGATED_TO_BRANCH';

export interface WorkflowStepDefinition {
  stepNumber: number;
  role: ApproverRole;
  titleEn: string;
  titleKu: string;
  titleAr: string;
  minAmountUSD: number;
  requiresOwnerSignature?: boolean;
  slaHours?: number;
  autoEscalate?: boolean;
}

export interface ApprovalChainRule {
  id: string;
  nameEn: string;
  nameKu: string;
  nameAr: string;
  descriptionEn: string;
  descriptionKu: string;
  descriptionAr: string;
  companyId: string | 'ALL';
  projectId: string | 'ALL';
  transactionType: TransactionType;
  minAmountUSD: number;
  maxAmountUSD?: number;
  isActive: boolean;
  steps: WorkflowStepDefinition[];
  ownerThresholdUSD: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalAuditEntry {
  id: string;
  requestId: string;
  poNumber: string;
  stepNumber: number;
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_INFO' | 'ESCALATED' | 'DELEGATED_SIGNATURE' | 'DELEGATED_TO_BRANCH';
  performedBy: string;
  performerRole: ApproverRole | string;
  performerEmail?: string;
  timestamp: string;
  comments: string;
  signatureHash?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowActiveStepState {
  stepNumber: number;
  role: ApproverRole;
  titleEn: string;
  titleKu: string;
  titleAr: string;
  approverName?: string;
  status: ApprovalStepStatus;
  actionDate?: string;
  comments?: string;
  signatureHash?: string;
}

export interface WorkflowRequestState {
  chainRuleId: string;
  chainRuleName: string;
  chainRuleNameKu?: string;
  chainRuleNameAr?: string;
  currentStepNumber: number;
  totalSteps: number;
  requiresHoldingOwner: boolean;
  steps: WorkflowActiveStepState[];
  auditTrail: ApprovalAuditEntry[];
  finalDecision?: 'APPROVED' | 'REJECTED';
  finalDecisionAt?: string;
}

export interface HoldingThresholdPolicy {
  defaultOwnerThresholdUSD: number;
  capexOwnerThresholdUSD: number;
  subcontractOwnerThresholdUSD: number;
  budgetOverrunThresholdUSD: number;
  autoEscalateAfterHours: number;
  requireDualSignatureAboveUSD: number;
  enableDelegatedAuthority: boolean;
  lastUpdated: string;
  updatedBy: string;
}

export type GMDecisionMode = 
  | 'AUTO_WITHIN_BUDGET'     // پەسەندکردنی خۆکارانە بەپێی ڕێژەی بودجە و بڕی دارایی
  | 'MANUAL_ONLY'           // پێداچوونەوەی دەستی و مەرجدار بە واژۆی شەخسی
  | 'CONDITIONAL_HYBRID';   // تێکەڵاو: خۆکار بۆ خەرجی کەم لەژێر ڕێژەی بودجە، دەستی بۆ گەورە

export interface GMProjectBudgetPolicy {
  id: string;
  gmId: string;
  gmName: string;
  companyId: string;
  projectId: string | 'ALL';
  decisionMode: GMDecisionMode;
  autoApproveMaxAmountUSD: number;
  maxBudgetConsumedPercent: number;
  requireManualIfOverBudget: boolean;
  requireManualForCapex: boolean;
  autoEscalateAfterDays: number;
  notesKu?: string;
  notesEn?: string;
  notesAr?: string;
  isActive: boolean;
  updatedAt: string;
}

export interface GMEvaluationResult {
  canAutoApprove: boolean;
  reasonEn: string;
  reasonKu: string;
  reasonAr: string;
  decisionMode: GMDecisionMode;
  currentBudgetUSD: number;
  currentSpentUSD: number;
  requestAmountUSD: number;
  currentConsumedPercent: number;
  projectedConsumedPercent: number;
  isBudgetExceeded: boolean;
  isOverConsumptionThreshold: boolean;
  isOverAmountThreshold: boolean;
}

export type OfficialSealScope = 'HOLDING' | 'COMPANY' | 'PROJECT' | 'DEPARTMENT';
export type OfficialSealShape = 'CIRCULAR' | 'DOUBLE_RING' | 'OVAL' | 'RECTANGULAR';

export interface OfficialSealTemplate {
  id: string;
  name: string;
  nameKu?: string;
  nameAr?: string;
  scope: OfficialSealScope;
  entityId: string;
  entityName: string;
  entityNameKu?: string;
  departmentName?: string;
  shape: OfficialSealShape;
  colorHex: string;
  centerEmblem: 'CROWN' | 'SHIELD' | 'BUILDING' | 'EAGLE' | 'SCALES' | 'CHECK';
  statusBadgeText: string;
  registrationNumber?: string;
  establishedYear?: string;
  customImageDataUrl?: string;
  rotationDeg?: number;
  createdAt: string;
}

export interface DigitalSignatureData {
  signatureDataUrl: string;
  signatureType: 'DRAW' | 'TYPE' | 'UPLOAD' | 'SAVED';
  sealDataUrl?: string;
  sealTemplateId?: string;
  sealScope: OfficialSealScope;
  signerName: string;
  signerRole: string;
  encryptedTimestamp: string;
  uniqueKey: string;
  certificateSerial: string;
  securityHash: string;
  signaturePosition: { x: number; y: number };
  sealPosition: { x: number; y: number };
  badgePosition: { x: number; y: number };
  isVerified: boolean;
  pinVerified: boolean;
}
