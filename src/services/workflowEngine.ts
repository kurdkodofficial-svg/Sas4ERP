import {
  ApprovalChainRule,
  ApprovalAuditEntry,
  HoldingThresholdPolicy,
  TransactionType,
  WorkflowRequestState,
  WorkflowActiveStepState,
  ApproverRole,
  GMProjectBudgetPolicy,
  GMEvaluationResult,
  GMDecisionMode
} from '../types/workflow';

export const defaultHoldingThresholdPolicy: HoldingThresholdPolicy = {
  defaultOwnerThresholdUSD: 5000,
  capexOwnerThresholdUSD: 15000,
  subcontractOwnerThresholdUSD: 10000,
  budgetOverrunThresholdUSD: 0, // Any budget overrun strictly requires Owner signature
  autoEscalateAfterHours: 48,
  requireDualSignatureAboveUSD: 50000,
  enableDelegatedAuthority: true,
  lastUpdated: '2026-10-28',
  updatedBy: 'Holding Chairman'
};

export const defaultWorkflowRules: ApprovalChainRule[] = [
  {
    id: 'rule-std-procurement',
    nameEn: 'Standard Procurement & Materials Chain',
    nameKu: 'زنجیرەی پەسەندکردنی کڕینی گشتی و کەرەستە',
    nameAr: 'سلسلة اعتمادات المشتريات والمواد العامة',
    descriptionEn: 'Automated 4-tier procurement gatekeeper. Requisitions above $5,000 escalate to Holding Owner.',
    descriptionKu: 'دەروازەی ٤ قۆناغی کڕین؛ داواکاری سەرووی ٥,٠٠٠ دۆلار پێویستی بە واژۆی فەرمی خاوەن هۆلدینگ دەبێت.',
    descriptionAr: 'بوابة مشتريات رباعية المراحل؛ الطلبات فوق 5,000 دولار تتطلب توقيع مالك المجموعة.',
    companyId: 'ALL',
    projectId: 'ALL',
    transactionType: 'PURCHASE_ORDER',
    minAmountUSD: 0,
    isActive: true,
    ownerThresholdUSD: 5000,
    steps: [
      {
        stepNumber: 1,
        role: 'PROJECT_MANAGER',
        titleEn: 'Project Site Manager Verification',
        titleKu: 'پشتڕاستکردنەوەی بەڕێوەبەری پڕۆژە لە مەیدان',
        titleAr: 'تحقق وتأييد مدير موقع المشروع',
        minAmountUSD: 0,
        slaHours: 24
      },
      {
        stepNumber: 2,
        role: 'COST_CONTROLLER',
        titleEn: 'Finance & Cost Controller Review',
        titleKu: 'وردبینی بەشی دارایی و کۆنتڕۆڵی تێچوو',
        titleAr: 'تدقيق المالية والرقابة على التكاليف',
        minAmountUSD: 2500,
        slaHours: 24
      },
      {
        stepNumber: 3,
        role: 'GENERAL_MANAGER',
        titleEn: 'Subsidiary General Manager Approval',
        titleKu: 'پەسەندکردنی بەڕێوەبەری گشتی کۆمپانیا',
        titleAr: 'موافقة المدير العام للشركة التابعة',
        minAmountUSD: 5000,
        slaHours: 24
      },
      {
        stepNumber: 4,
        role: 'HOLDING_OWNER',
        titleEn: 'Holding Owner / Chairman Final Signature',
        titleKu: 'واژۆ و مۆری کۆتایی خاوەنی هۆلدینگ',
        titleAr: 'الموافقة والختم النهائي لمالك ورئيس المجموعة',
        minAmountUSD: 5000,
        requiresOwnerSignature: true,
        slaHours: 48
      }
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-10-25'
  },
  {
    id: 'rule-capex-machinery',
    nameEn: 'Capital Expenditure & Heavy Machinery (CAPEX)',
    nameKu: 'خەرجی سەرمایەداری، ئامێری قورس و موڵک (CAPEX)',
    nameAr: 'النفقات الرأسمالية والآليات الثقيلة (CAPEX)',
    descriptionEn: 'High-rigor governance for equipment, vehicles, batch steel & batch concrete investments.',
    descriptionKu: 'چاودێری توند بۆ کڕینی ئامێر، سەیارە، حەدید و چیمەنتۆی بڕی گەورە لەسەر ئاستی سەرۆکایەتی.',
    descriptionAr: 'حوكمة صارمة لشراء الآليات والسيارات واستثمارات الأصول الرأسمالية الكبرى.',
    companyId: 'ALL',
    projectId: 'ALL',
    transactionType: 'CAPITAL_EXPENDITURE',
    minAmountUSD: 10000,
    isActive: true,
    ownerThresholdUSD: 15000,
    steps: [
      {
        stepNumber: 1,
        role: 'DEPARTMENT_HEAD',
        titleEn: 'Lead Mechanical & Engineering Specialist',
        titleKu: 'سەرپەرشتیاری ئەندازیاری میکانیکی و ئامێرەکان',
        titleAr: 'كبير مهندسي الآليات والمعدات',
        minAmountUSD: 0,
        slaHours: 24
      },
      {
        stepNumber: 2,
        role: 'GENERAL_MANAGER',
        titleEn: 'Subsidiary General Manager Sign-Off',
        titleKu: 'واژۆی بەڕێوەبەری گشتی کۆمپانیا',
        titleAr: 'توقيع المدير العام للشركة التابعة',
        minAmountUSD: 10000,
        slaHours: 24
      },
      {
        stepNumber: 3,
        role: 'HOLDING_VP',
        titleEn: 'Holding Chief Operating Officer / VP',
        titleKu: 'جێگری سەرۆکی هۆلدینگ بۆ ئۆپەراسیۆنەکان',
        titleAr: 'نائب رئيس المجموعة للعمليات',
        minAmountUSD: 25000,
        slaHours: 48
      },
      {
        stepNumber: 4,
        role: 'HOLDING_OWNER',
        titleEn: 'Holding Owner Authorization & Asset Allocation',
        titleKu: 'بڕیاری خاوەنی هۆلدینگ و تەرخانکردنی سەرمایە',
        titleAr: 'تفويض مالك المجموعة وتخصيص الأصول',
        minAmountUSD: 15000,
        requiresOwnerSignature: true,
        slaHours: 48
      }
    ],
    createdAt: '2026-02-15',
    updatedAt: '2026-10-25'
  },
  {
    id: 'rule-subcontracts',
    nameEn: 'Subcontracts & Commercial Agreements',
    nameKu: 'گرێبەستی بەڵێندەرایەتی و دابینکەرانی پسپۆڕ',
    nameAr: 'عقود مقاولي الباطن والاتفاقيات التجارية',
    descriptionEn: 'Multi-party legal, engineering & executive threshold sign-offs for project subcontracts.',
    descriptionKu: 'واژۆی ئەندازیاری، یاسایی و خاوەن هۆلدینگ بۆ گرێبەستی کارە لاوەکییەکان.',
    descriptionAr: 'اعتمادات هندسية وقانونية ورئاسية لعقود مقاولي الباطن للمشاريع.',
    companyId: 'ALL',
    projectId: 'ALL',
    transactionType: 'SUBCONTRACT_AGREEMENT',
    minAmountUSD: 5000,
    isActive: true,
    ownerThresholdUSD: 10000,
    steps: [
      {
        stepNumber: 1,
        role: 'PROJECT_MANAGER',
        titleEn: 'Site Technical & Scope Clearance',
        titleKu: 'پەسەندکردنی بواری کار لەلایەن بەڕێوەبەری پڕۆژە',
        titleAr: 'اعتماد نطاق العمل من مدير المشروع',
        minAmountUSD: 0,
        slaHours: 24
      },
      {
        stepNumber: 2,
        role: 'DEPARTMENT_HEAD',
        titleEn: 'Legal & Contracts Department Review',
        titleKu: 'وردبینی بەشی یاسایی و گرێبەستەکان',
        titleAr: 'مراجعة الدائرة القانونية والعقود',
        minAmountUSD: 5000,
        slaHours: 48
      },
      {
        stepNumber: 3,
        role: 'GENERAL_MANAGER',
        titleEn: 'Subsidiary General Manager Endorsement',
        titleKu: 'تەئکیدی بەڕێوەبەری گشتی کۆمپانیا',
        titleAr: 'تأييد المدير العام للشركة',
        minAmountUSD: 10000,
        slaHours: 24
      },
      {
        stepNumber: 4,
        role: 'HOLDING_OWNER',
        titleEn: 'Holding Owner Strategic Execution Approval',
        titleKu: 'ڕەزامەندی ستراتیژی خاوەن هۆلدینگ بۆ واژۆی گرێبەست',
        titleAr: 'الموافقة الاستراتيجية لمالك المجموعة',
        minAmountUSD: 10000,
        requiresOwnerSignature: true,
        slaHours: 48
      }
    ],
    createdAt: '2026-03-01',
    updatedAt: '2026-10-25'
  },
  {
    id: 'rule-budget-overrun',
    nameEn: 'Budget Overrun & Contingency Authorization',
    nameKu: 'بەزاندنی بودجە و داواکاری بەکارهێنانی فریاگوزاری',
    nameAr: 'تجاوز الميزانية وصرف مبالغ الطوارئ',
    descriptionEn: 'Strict zero-tolerance protocol. ANY budget variance strictly requires Holding Owner direct consent.',
    descriptionKu: 'پڕۆتۆکۆلی سفڕ-تێپەڕاندن؛ هەر لادانێک لە بودجە بەبێ واژۆی ڕاستەوخۆی خاوەن هۆلدینگ ڕادەگیرێت.',
    descriptionAr: 'بروتوكول صارم؛ أي تجاوز للميزانية المعتمدة يتطلب موافقة مباشرة من مالك المجموعة.',
    companyId: 'ALL',
    projectId: 'ALL',
    transactionType: 'BUDGET_OVERRUN_EXCEPTION',
    minAmountUSD: 0,
    isActive: true,
    ownerThresholdUSD: 0,
    steps: [
      {
        stepNumber: 1,
        role: 'COST_CONTROLLER',
        titleEn: 'Cost Variance & Root Cause Report',
        titleKu: 'ڕاپۆرتی هۆکاری لادان لە تێچوو لەلایەن کۆنتڕۆڵەری دارایی',
        titleAr: 'تقرير أسباب انحراف التكاليف من مدقق التكاليف',
        minAmountUSD: 0,
        slaHours: 12
      },
      {
        stepNumber: 2,
        role: 'GENERAL_MANAGER',
        titleEn: 'GM Justification & Corrective Plan',
        titleKu: 'بەڵگە و پلانی ڕاستکردنەوەی بەڕێوەبەری گشتی',
        titleAr: 'المبررات وخطة التصحيح من المدير العام',
        minAmountUSD: 0,
        slaHours: 24
      },
      {
        stepNumber: 3,
        role: 'HOLDING_OWNER',
        titleEn: 'Holding Owner Sovereign Budget Amendment',
        titleKu: 'بڕیاری دەسەڵاتداری خاوەن هۆلدینگ بۆ هەموارکردنی بودجە',
        titleAr: 'قرار مالك المجموعة الاستثنائي لتعديل الميزانية',
        minAmountUSD: 0,
        requiresOwnerSignature: true,
        slaHours: 24
      }
    ],
    createdAt: '2026-01-05',
    updatedAt: '2026-10-25'
  }
];

/**
 * Matches the optimal approval chain rule based on company, project, type and value
 */
export function matchApprovalChain(
  companyId: string,
  projectId: string | undefined,
  transactionType: TransactionType,
  amountUSD: number,
  customRules: ApprovalChainRule[]
): ApprovalChainRule {
  const activeRules = (customRules && customRules.length > 0 ? customRules : defaultWorkflowRules).filter(r => r.isActive);

  // 1. Most specific: company + project + type
  if (projectId) {
    const specificProj = activeRules.find(
      r => r.companyId === companyId && r.projectId === projectId && r.transactionType === transactionType
    );
    if (specificProj) return specificProj;
  }

  // 2. Company-specific + type
  const compSpecific = activeRules.find(
    r => r.companyId === companyId && r.projectId === 'ALL' && r.transactionType === transactionType
  );
  if (compSpecific) return compSpecific;

  // 3. General type rule across ALL companies
  const generalType = activeRules.find(
    r => r.companyId === 'ALL' && r.transactionType === transactionType
  );
  if (generalType) return generalType;

  // 4. Default fallback: Standard Procurement
  return activeRules[0] || defaultWorkflowRules[0];
}

/**
 * Initializes a structured workflow state for a new request
 */
export function generateInitialWorkflowState(
  rule: ApprovalChainRule,
  amountUSD: number,
  requesterName: string,
  requesterRole: string,
  companyName: string,
  poNumber: string
): WorkflowRequestState {
  const ownerThreshold = rule.ownerThresholdUSD;
  const requiresOwner = amountUSD >= ownerThreshold;

  // Filter steps that apply to this amount
  const applicableSteps = rule.steps.filter(step => amountUSD >= step.minAmountUSD);

  const activeSteps: WorkflowActiveStepState[] = applicableSteps.map((s, idx) => {
    // If Step 1 is PM and requester is PM or Engineer, it can be marked as auto-submitted
    const isStep1Submitted = idx === 0;

    return {
      stepNumber: s.stepNumber,
      role: s.role,
      titleEn: s.titleEn,
      titleKu: s.titleKu,
      titleAr: s.titleAr,
      approverName: isStep1Submitted ? requesterName : undefined,
      status: isStep1Submitted ? 'APPROVED' : 'PENDING',
      actionDate: isStep1Submitted ? new Date().toISOString().split('T')[0] : undefined,
      comments: isStep1Submitted ? `Submitted by ${requesterName} (${requesterRole})` : undefined,
      signatureHash: isStep1Submitted ? `SUB-${poNumber}-${Math.random().toString(36).substring(2, 7).toUpperCase()}` : undefined
    };
  });

  // Identify next pending step number
  const nextPendingStep = activeSteps.find(s => s.status === 'PENDING');
  const currentStepNumber = nextPendingStep ? nextPendingStep.stepNumber : activeSteps.length;

  const initialAudit: ApprovalAuditEntry[] = [
    {
      id: `audit-${Date.now()}-sub`,
      requestId: poNumber,
      poNumber,
      stepNumber: 1,
      action: 'SUBMITTED',
      performedBy: requesterName,
      performerRole: requesterRole,
      timestamp: new Date().toISOString(),
      comments: `Request initiated for $${amountUSD.toLocaleString()} under workflow: ${rule.nameEn}`,
      signatureHash: `SIG-SUB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    }
  ];

  return {
    chainRuleId: rule.id,
    chainRuleName: rule.nameEn,
    chainRuleNameKu: rule.nameKu,
    chainRuleNameAr: rule.nameAr,
    currentStepNumber,
    totalSteps: activeSteps.length,
    requiresHoldingOwner: requiresOwner,
    steps: activeSteps,
    auditTrail: initialAudit
  };
}

/**
 * Processes an approval step transition
 */
export function advanceWorkflowStep(
  currentState: WorkflowRequestState,
  poNumber: string,
  stepNumber: number,
  decision: 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_INFO',
  performerName: string,
  performerRole: ApproverRole | string,
  comments: string = ''
): WorkflowRequestState {
  const timestamp = new Date().toISOString();
  const signatureHash = `SIG-SAS-${performerRole.substring(0, 3)}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const updatedSteps = currentState.steps.map(s => {
    if (s.stepNumber === stepNumber) {
      return {
        ...s,
        status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
        approverName: performerName,
        actionDate: timestamp.split('T')[0],
        comments,
        signatureHash: decision === 'APPROVED' ? signatureHash : undefined
      } as WorkflowActiveStepState;
    }
    return s;
  });

  const newAuditEntry: ApprovalAuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    requestId: poNumber,
    poNumber,
    stepNumber,
    action: decision,
    performedBy: performerName,
    performerRole,
    timestamp,
    comments,
    signatureHash: decision === 'APPROVED' ? signatureHash : undefined
  };

  if (decision === 'REJECTED') {
    return {
      ...currentState,
      steps: updatedSteps,
      finalDecision: 'REJECTED',
      finalDecisionAt: timestamp,
      auditTrail: [newAuditEntry, ...currentState.auditTrail]
    };
  }

  // Find next pending step
  const remainingPending = updatedSteps.find(s => s.status === 'PENDING');
  const isAllApproved = !remainingPending;

  return {
    ...currentState,
    steps: updatedSteps,
    currentStepNumber: remainingPending ? remainingPending.stepNumber : currentState.totalSteps,
    finalDecision: isAllApproved ? 'APPROVED' : undefined,
    finalDecisionAt: isAllApproved ? timestamp : undefined,
    auditTrail: [newAuditEntry, ...currentState.auditTrail]
  };
}

export const defaultGMBudgetPolicies: GMProjectBudgetPolicy[] = [
  {
    id: 'gm-pol-skyline',
    gmId: 'gm-dara',
    gmName: 'ئەندازیار دارا فەریق',
    companyId: 'comp-1',
    projectId: 'ALL',
    decisionMode: 'AUTO_WITHIN_BUDGET',
    autoApproveMaxAmountUSD: 20000,
    maxBudgetConsumedPercent: 80,
    requireManualIfOverBudget: true,
    requireManualForCapex: true,
    autoEscalateAfterDays: 3,
    notesKu: 'پەسەندکردنی خۆکار بۆ خەرجی پڕۆژە لەژێر ٪٨٠ی بودجە و کەمتر لە ٢٠,٠٠٠ دۆلار، جگە لە ئامێری قورس و موڵک.',
    notesEn: 'Auto-approve requisitions below $20,000 provided project budget consumed stays under 80%. CAPEX strictly manual.',
    notesAr: 'موافقة تلقائية للطلبات دون 20,000$ إذا كان استهلاك الميزانية أقل من 80%، مع استثناء النفقات الرأسمالية.',
    isActive: true,
    updatedAt: '2026-10-28'
  },
  {
    id: 'gm-pol-apex',
    gmId: 'gm-hemin',
    gmName: 'ئەندازیار هێمن کەمال',
    companyId: 'comp-2',
    projectId: 'ALL',
    decisionMode: 'CONDITIONAL_HYBRID',
    autoApproveMaxAmountUSD: 25000,
    maxBudgetConsumedPercent: 75,
    requireManualIfOverBudget: true,
    requireManualForCapex: true,
    autoEscalateAfterDays: 2,
    notesKu: 'تێکەڵاو: خۆکار بۆ داواکاری خوار ٢٥,٠٠٠ دۆلار ئەگەر خەرجی ڕێگاوبان لەژێر ٪٧٥ بوو، دەستی بۆ سەرووی ئەو ڕێژەیە.',
    notesEn: 'Hybrid mode: Auto-pass up to $25k if highway project budget under 75% utilized; mandatory manual review otherwise.',
    notesAr: 'نظام هجين: اعتماد تلقائي حتى 25,000$ إذا كان استهلاك ميزانية المشروع دون 75%، وإلا تتطلب مراجعة يدوية.',
    isActive: true,
    updatedAt: '2026-10-27'
  },
  {
    id: 'gm-pol-horizon',
    gmId: 'gm-aras',
    gmName: 'دکتۆر ئاراس نەوزاد',
    companyId: 'comp-3',
    projectId: 'ALL',
    decisionMode: 'AUTO_WITHIN_BUDGET',
    autoApproveMaxAmountUSD: 15000,
    maxBudgetConsumedPercent: 85,
    requireManualIfOverBudget: true,
    requireManualForCapex: false,
    autoEscalateAfterDays: 3,
    notesKu: 'خۆکارانە بۆ کەرەستە و پێداویستی کارەبایی تا ١٥,٠٠٠ دۆلار بە مەرجی سەروو ٪٨٥ نەبوونی تێچووی پڕۆژە.',
    notesEn: 'Automated procurement for clean energy components up to $15k if project budget burn is below 85%.',
    notesAr: 'اعتماد تلقائي للمكونات الكهروميكانيكية حتى 15,000$ بشرط عدم تجاوز نسبة 85% من الميزانية.',
    isActive: true,
    updatedAt: '2026-10-25'
  },
  {
    id: 'gm-pol-vertex',
    gmId: 'gm-karwan',
    gmName: 'ئەندازیار کاروان جەمیل',
    companyId: 'comp-4',
    projectId: 'ALL',
    decisionMode: 'MANUAL_ONLY',
    autoApproveMaxAmountUSD: 5000,
    maxBudgetConsumedPercent: 70,
    requireManualIfOverBudget: true,
    requireManualForCapex: true,
    autoEscalateAfterDays: 2,
    notesKu: 'پێداچوونەوەی دەستی توند بۆ هەموو پڕۆژەکانی بنکەسازی قورس و گواستنەوە، بەبێ ڕەزامەندی دەستی هیچی تێناپەڕێت.',
    notesEn: 'Strict manual review mode active for all foundation and heavy logistics purchases. No automated signoffs permitted.',
    notesAr: 'مراجعة يدوية صارمة لجميع مشتريات الأساسات الثقيلة؛ لا يُسمح بأي اعتماد تلقائي دون توقيع يدوي شخصي.',
    isActive: true,
    updatedAt: '2026-10-26'
  }
];

export function findGMPolicy(
  policies: GMProjectBudgetPolicy[],
  companyId: string,
  projectId?: string
): GMProjectBudgetPolicy | undefined {
  if (projectId) {
    const specific = policies.find(p => p.isActive && p.companyId === companyId && p.projectId === projectId);
    if (specific) return specific;
  }
  const compMatch = policies.find(p => p.isActive && p.companyId === companyId && p.projectId === 'ALL');
  if (compMatch) return compMatch;
  return policies.find(p => p.isActive && p.companyId === 'ALL');
}

export function evaluateGMWorkflowDecision(
  policy: GMProjectBudgetPolicy | undefined,
  projectBudgetUSD: number,
  projectSpentUSD: number,
  requestAmountUSD: number,
  transactionType: TransactionType
): GMEvaluationResult {
  const currentBudget = projectBudgetUSD > 0 ? projectBudgetUSD : 1000000;
  const currentSpent = projectSpentUSD || 0;
  const currentConsumedPercent = Number(((currentSpent / currentBudget) * 100).toFixed(1));
  const projectedSpent = currentSpent + requestAmountUSD;
  const projectedConsumedPercent = Number(((projectedSpent / currentBudget) * 100).toFixed(1));
  const isBudgetExceeded = projectedSpent > currentBudget;

  // Fallback default policy if none set
  const activePolicy: GMProjectBudgetPolicy = policy || {
    id: 'fallback-gm',
    gmId: 'gm-default',
    gmName: 'General Manager',
    companyId: 'ALL',
    projectId: 'ALL',
    decisionMode: 'CONDITIONAL_HYBRID',
    autoApproveMaxAmountUSD: 10000,
    maxBudgetConsumedPercent: 80,
    requireManualIfOverBudget: true,
    requireManualForCapex: true,
    autoEscalateAfterDays: 3,
    isActive: true,
    updatedAt: new Date().toISOString()
  };

  const isOverAmountThreshold = requestAmountUSD > activePolicy.autoApproveMaxAmountUSD;
  const isOverConsumptionThreshold = projectedConsumedPercent > activePolicy.maxBudgetConsumedPercent;
  const isCapexBlocked = (transactionType === 'CAPITAL_EXPENDITURE' || transactionType === 'BUDGET_OVERRUN_EXCEPTION') && activePolicy.requireManualForCapex;

  if (activePolicy.decisionMode === 'MANUAL_ONLY') {
    return {
      canAutoApprove: false,
      reasonEn: `GM Policy is set to Strict Manual Review for this project. Direct signature required.`,
      reasonKu: `سیاسەتی بەڕێوەبەری گشتی لەسەر پێداچوونەوەی دەستی توند ڕێکخراوە. واژۆی کەسیی بەڕێوەبەر پێویستە.`,
      reasonAr: `سياسة المدير العام مضبوطة على المراجعة اليدوية الصارمة لهذا المشروع. يتطلب توقيعاً يدوياً شخصياً.`,
      decisionMode: 'MANUAL_ONLY',
      currentBudgetUSD: currentBudget,
      currentSpentUSD: currentSpent,
      requestAmountUSD,
      currentConsumedPercent,
      projectedConsumedPercent,
      isBudgetExceeded,
      isOverConsumptionThreshold,
      isOverAmountThreshold
    };
  }

  if (activePolicy.requireManualIfOverBudget && isBudgetExceeded) {
    return {
      canAutoApprove: false,
      reasonEn: `Budget Overrun Alert: Request pushes project to ${projectedConsumedPercent}% of budget. Manual GM sign-off mandatory.`,
      reasonKu: `ئاگاداری بەزاندنی بودجە: داواکارییەکە تێچووی پڕۆژەکە دەگەیەنێتە ٪${projectedConsumedPercent}ی بودجە. واژۆی دەستی مەرجە.`,
      reasonAr: `تنبيه تجاوز الميزانية: الطلب يدفع المشروع إلى ٪${projectedConsumedPercent} من الميزانية. التوقيع اليدوي إلزامي.`,
      decisionMode: activePolicy.decisionMode,
      currentBudgetUSD: currentBudget,
      currentSpentUSD: currentSpent,
      requestAmountUSD,
      currentConsumedPercent,
      projectedConsumedPercent,
      isBudgetExceeded,
      isOverConsumptionThreshold,
      isOverAmountThreshold
    };
  }

  if (isCapexBlocked) {
    return {
      canAutoApprove: false,
      reasonEn: `High-Impact Transaction: ${transactionType} requires manual review by General Manager per policy.`,
      reasonKu: `مامەڵەی سەرمایەداری هەستیار (${transactionType}): بەپێی ڕێسای بەڕێوەبەری گشتی پێویستی بە واژۆی دەستییە.`,
      reasonAr: `معاملة رأسمالية حساسة (${transactionType}): تتطلب توقيعاً يدوياً للمدير العام حسب السياسة.`,
      decisionMode: activePolicy.decisionMode,
      currentBudgetUSD: currentBudget,
      currentSpentUSD: currentSpent,
      requestAmountUSD,
      currentConsumedPercent,
      projectedConsumedPercent,
      isBudgetExceeded,
      isOverConsumptionThreshold,
      isOverAmountThreshold
    };
  }

  if (isOverAmountThreshold) {
    return {
      canAutoApprove: false,
      reasonEn: `Value Threshold Exceeded: $${requestAmountUSD.toLocaleString()} exceeds GM auto-limit ($${activePolicy.autoApproveMaxAmountUSD.toLocaleString()}). Manual GM approval needed.`,
      reasonKu: `تێپەڕاندنی بڕی پارە: داواکاری $${requestAmountUSD.toLocaleString()} زیاترە لە سنووری خۆکاری ($${activePolicy.autoApproveMaxAmountUSD.toLocaleString()}). واژۆی دەستی پێویستە.`,
      reasonAr: `تجاوز سقف القيمة: الطلب بقيمة $${requestAmountUSD.toLocaleString()} يتجاوز حد الاعتماد التلقائي ($${activePolicy.autoApproveMaxAmountUSD.toLocaleString()}).`,
      decisionMode: activePolicy.decisionMode,
      currentBudgetUSD: currentBudget,
      currentSpentUSD: currentSpent,
      requestAmountUSD,
      currentConsumedPercent,
      projectedConsumedPercent,
      isBudgetExceeded,
      isOverConsumptionThreshold,
      isOverAmountThreshold
    };
  }

  if (isOverConsumptionThreshold) {
    return {
      canAutoApprove: false,
      reasonEn: `Budget Stress Alert: Projected consumption (${projectedConsumedPercent}%) exceeds GM allowable auto-limit (${activePolicy.maxBudgetConsumedPercent}%).`,
      reasonKu: `ئاگاداری ڕێژەی بودجە: ڕێژەی پێشبینیکراو (٪${projectedConsumedPercent}) لە سنووری دیاریکراوی خۆکار (٪${activePolicy.maxBudgetConsumedPercent}) زیاترە. پێداچوونەوەی دەستی مەرجە.`,
      reasonAr: `تنبيه ضغط الميزانية: الاستهلاك المتوقع (٪${projectedConsumedPercent}) يتجاوز الحد المسموح للاعتماد التلقائي (٪${activePolicy.maxBudgetConsumedPercent}).`,
      decisionMode: activePolicy.decisionMode,
      currentBudgetUSD: currentBudget,
      currentSpentUSD: currentSpent,
      requestAmountUSD,
      currentConsumedPercent,
      projectedConsumedPercent,
      isBudgetExceeded,
      isOverConsumptionThreshold,
      isOverAmountThreshold
    };
  }

  // Eligible for auto-approval!
  return {
    canAutoApprove: true,
    reasonEn: `Budget Ratio Safe: Projected spend (${projectedConsumedPercent}%) is within ${activePolicy.maxBudgetConsumedPercent}% cap and amount ($${requestAmountUSD.toLocaleString()} <= $${activePolicy.autoApproveMaxAmountUSD.toLocaleString()}). Auto-approved by GM Policy.`,
    reasonKu: `ڕێژەی بودجە سەلامەتە: خەرجی پێشبینیکراو (٪${projectedConsumedPercent}) لەژێر سنووری ٪${activePolicy.maxBudgetConsumedPercent} و بڕی پارەکە لەژێر سنووری $${activePolicy.autoApproveMaxAmountUSD.toLocaleString()} دایە. شایستەی پەسەندکردنی خۆکارانەیە.`,
    reasonAr: `نسبة الميزانية آمنة: الإنفاق المتوقع (٪${projectedConsumedPercent}) ضمن سقف ٪${activePolicy.maxBudgetConsumedPercent} والمبلغ ضمن الحد المسموح. مؤهل للاعتماد التلقائي.`,
    decisionMode: activePolicy.decisionMode,
    currentBudgetUSD: currentBudget,
    currentSpentUSD: currentSpent,
    requestAmountUSD,
    currentConsumedPercent,
    projectedConsumedPercent,
    isBudgetExceeded,
    isOverConsumptionThreshold: false,
    isOverAmountThreshold: false
  };
}

