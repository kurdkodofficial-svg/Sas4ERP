import React, { useState, useMemo } from 'react';
import {
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  DollarSign,
  ShieldCheck,
  Layers,
  ArrowRight,
  Sliders,
  FileCheck2,
  FileText,
  AlertTriangle,
  History,
  Building2,
  FolderKanban,
  Send,
  Eye,
  Check,
  Trash2,
  Edit3,
  HelpCircle,
  TrendingUp,
  Cpu,
  Printer,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { getUIText, resolveEntityText } from '../utils/langHelper';
import {
  ApprovalChainRule,
  ApprovalAuditEntry,
  TransactionType,
  ApproverRole,
  WorkflowStepDefinition,
  WorkflowActiveStepState,
  GMProjectBudgetPolicy,
  GMEvaluationResult,
  GMDecisionMode
} from '../types/workflow';
import { PurchaseOrder } from '../types/erp';
import {
  matchApprovalChain,
  generateInitialWorkflowState,
  findGMPolicy,
  evaluateGMWorkflowDecision
} from '../services/workflowEngine';

export const ApprovalWorkflowEngineModule: React.FC = () => {
  const {
    holding,
    companies,
    projects,
    purchaseOrders,
    workflowRules,
    thresholdPolicy,
    approvalAuditTrail,
    addWorkflowRule,
    updateWorkflowRule,
    deleteWorkflowRule,
    updateThresholdPolicy,
    processWorkflowStep,
    approvePurchaseByOwner,
    rejectPurchaseByOwner,
    submitPurchaseRequest,
    gmBudgetPolicies,
    addGmBudgetPolicy,
    updateGmBudgetPolicy,
    deleteGmBudgetPolicy,
    evaluateGMForPO,
    autoApproveGMStep,
    currentUser,
    setActiveTab
  } = useERP();

  const { t, language } = useLanguage();

  // Active Tab within Module
  const [activeEngineTab, setActiveEngineTab] = useState<
    'QUEUE' | 'CHAINS' | 'POLICIES' | 'GM_BUDGET_RULES' | 'SIMULATOR' | 'AUDIT'
  >('QUEUE');

  // Filter States for Queue
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');
  const [selectedTxTypeFilter, setSelectedTxTypeFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'PENDING_MY_ACTION' | 'ALL_PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING_MY_ACTION');

  // Modal States
  const [selectedPoForDetails, setSelectedPoForDetails] = useState<PurchaseOrder | null>(null);
  const [selectedPoForSeal, setSelectedPoForSeal] = useState<PurchaseOrder | null>(null);
  const [rejectionModalPo, setRejectionModalPo] = useState<PurchaseOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isChainRuleModalOpen, setIsChainRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalChainRule | null>(null);

  // New Request Form State
  const [newReqCompanyId, setNewReqCompanyId] = useState<string>(companies[0]?.id || 'comp-1');
  const [newReqProjectId, setNewReqProjectId] = useState<string>(projects[0]?.id || '');
  const [newReqTxType, setNewReqTxType] = useState<TransactionType>('PURCHASE_ORDER');
  const [newReqPurpose, setNewReqPurpose] = useState('');
  const [newReqSupplier, setNewReqSupplier] = useState('');
  const [newReqAmountUSD, setNewReqAmountUSD] = useState<number>(8500);
  const [newReqItemName, setNewReqItemName] = useState('');

  // Policy Sliders State
  const [policyOwnerThreshold, setPolicyOwnerThreshold] = useState<number>(thresholdPolicy.defaultOwnerThresholdUSD);
  const [policyCapexThreshold, setPolicyCapexThreshold] = useState<number>(thresholdPolicy.capexOwnerThresholdUSD);
  const [policySubcontractThreshold, setPolicySubcontractThreshold] = useState<number>(thresholdPolicy.subcontractOwnerThresholdUSD);
  const [policyDualSignatureThreshold, setPolicyDualSignatureThreshold] = useState<number>(thresholdPolicy.requireDualSignatureAboveUSD);
  const [policyAutoEscalateHours, setPolicyAutoEscalateHours] = useState<number>(thresholdPolicy.autoEscalateAfterHours);

  // Simulator State
  const [simCompanyId, setSimCompanyId] = useState<string>(companies[0]?.id || 'comp-1');
  const [simProjectId, setSimProjectId] = useState<string>(projects[0]?.id || '');
  const [simTxType, setSimTxType] = useState<TransactionType>('PURCHASE_ORDER');
  const [simAmountUSD, setSimAmountUSD] = useState<number>(12500);

  // Filtered Queue
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      // Company Filter
      if (selectedCompanyFilter !== 'ALL' && po.companyId !== selectedCompanyFilter) return false;
      // Transaction Type Filter
      if (selectedTxTypeFilter !== 'ALL' && (po.transactionType || 'PURCHASE_ORDER') !== selectedTxTypeFilter) return false;

      // Status Filter
      if (selectedStatusFilter === 'PENDING_MY_ACTION') {
        if (po.status !== 'PENDING_OWNER_APPROVAL') return false;
      } else if (selectedStatusFilter === 'ALL_PENDING') {
        if (po.status !== 'PENDING_OWNER_APPROVAL') return false;
      } else if (selectedStatusFilter === 'APPROVED') {
        if (po.status !== 'APPROVED_BY_OWNER') return false;
      } else if (selectedStatusFilter === 'REJECTED') {
        if (po.status !== 'REJECTED_BY_OWNER') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const num = (po.poNumber || '').toLowerCase();
        const supp = (po.supplierName || '').toLowerCase();
        const purp = (po.purpose || '').toLowerCase();
        const req = (po.requestedBy || '').toLowerCase();
        return num.includes(q) || supp.includes(q) || purp.includes(q) || req.includes(q);
      }

      return true;
    });
  }, [purchaseOrders, selectedCompanyFilter, selectedTxTypeFilter, selectedStatusFilter, searchQuery]);

  // Key KPI Numbers
  const pendingChairmanPOs = purchaseOrders.filter(p => p.status === 'PENDING_OWNER_APPROVAL');
  const pendingChairmanValue = pendingChairmanPOs.reduce((acc, p) => acc + p.totalAmountUSD, 0);
  const approvedThisMonth = purchaseOrders.filter(p => p.status === 'APPROVED_BY_OWNER');
  const approvedThisMonthValue = approvedThisMonth.reduce((acc, p) => acc + p.totalAmountUSD, 0);
  const rejectedCount = purchaseOrders.filter(p => p.status === 'REJECTED_BY_OWNER').length;

  // Simulator match
  const simulatedRule = useMemo(() => {
    return matchApprovalChain(simCompanyId, simProjectId || undefined, simTxType, simAmountUSD, workflowRules);
  }, [simCompanyId, simProjectId, simTxType, simAmountUSD, workflowRules]);

  const simulatedRequiresOwner = simAmountUSD >= simulatedRule.ownerThresholdUSD;
  const simulatedSteps = simulatedRule.steps.filter(s => simAmountUSD >= s.minAmountUSD);

  // Handlers
  const handleApproveWithSeal = (po: PurchaseOrder) => {
    approvePurchaseByOwner(po.id, `Executive signature and seal applied by ${holding.chairmanName || 'Holding Chairman'}`);
    setSelectedPoForSeal(po);
  };

  const handleConfirmRejection = () => {
    if (!rejectionModalPo) return;
    rejectPurchaseByOwner(rejectionModalPo.id, rejectionReason || 'Budget or policy limits exceeded upon executive review');
    setRejectionModalPo(null);
    setRejectionReason('');
  };

  const handleSaveThresholdPolicies = () => {
    updateThresholdPolicy({
      defaultOwnerThresholdUSD: policyOwnerThreshold,
      capexOwnerThresholdUSD: policyCapexThreshold,
      subcontractOwnerThresholdUSD: policySubcontractThreshold,
      requireDualSignatureAboveUSD: policyDualSignatureThreshold,
      autoEscalateAfterHours: policyAutoEscalateHours
    });
  };

  const handleCreateNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqPurpose || newReqAmountUSD <= 0) return;

    submitPurchaseRequest({
      companyId: newReqCompanyId,
      projectId: newReqProjectId || undefined,
      requestedBy: currentUser.name || 'Project Director',
      requesterRole: currentUser.role === 'HOLDING_OWNER' ? 'Project Director' : currentUser.title || 'Director',
      supplierName: newReqSupplier || 'Verified Holding Contractor',
      purpose: newReqPurpose,
      totalAmountUSD: Number(newReqAmountUSD),
      subtotalUSD: Number(newReqAmountUSD),
      taxUSD: 0,
      currency: 'USD',
      originalLanguage: language,
      transactionType: newReqTxType,
      items: [
        {
          id: `item-${Date.now()}`,
          name: newReqItemName || newReqPurpose,
          quantity: 1,
          unit: 'Lot',
          unitPriceUSD: Number(newReqAmountUSD),
          totalUSD: Number(newReqAmountUSD),
          category: newReqTxType
        }
      ]
    });

    setIsNewRequestModalOpen(false);
    setNewReqPurpose('');
    setNewReqSupplier('');
    setNewReqItemName('');
  };

  const getTxTypeBadge = (type?: TransactionType) => {
    const t = type || 'PURCHASE_ORDER';
    switch (t) {
      case 'CAPITAL_EXPENDITURE':
        return {
          bg: 'bg-purple-100 text-purple-800 border-purple-300',
          label: getUIText(language, { en: 'CAPEX / Machinery', ku: 'سەرمایەداری / ئامێر', ar: 'نفقات رأسمالية' })
        };
      case 'SUBCONTRACT_AGREEMENT':
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          label: getUIText(language, { en: 'Subcontract', ku: 'گرێبەستی لاوەکی', ar: 'عقد مقاولة باطن' })
        };
      case 'BUDGET_OVERRUN_EXCEPTION':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          label: getUIText(language, { en: 'Budget Overrun', ku: 'بەزاندنی بودجە', ar: 'تجاوز الميزانية' })
        };
      case 'PAYMENT_DISBURSEMENT':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          label: getUIText(language, { en: 'Disbursement', ku: 'دەرکردنی پارە', ar: 'صرف مستحقات' })
        };
      default:
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          label: getUIText(language, { en: 'Procurement / PO', ku: 'فەرمانی کڕین', ar: 'أمر شراء' })
        };
    }
  };

  const getRoleLabel = (role: ApproverRole | string) => {
    switch (role) {
      case 'PROJECT_MANAGER':
        return getUIText(language, { en: 'Project Site Manager', ku: 'بەڕێوەبەری پڕۆژە لە مەیدان', ar: 'مدير موقع المشروع' });
      case 'COST_CONTROLLER':
        return getUIText(language, { en: 'Finance & Cost Controller', ku: 'کۆنتڕۆڵەری تێچوو و وردبینی دارایی', ar: 'مدقق التكاليف والمالية' });
      case 'DEPARTMENT_HEAD':
        return getUIText(language, { en: 'Technical Department Head', ku: 'سەرپەرشتیاری بەشی تەکنیکی', ar: 'رئيس القسم الفني' });
      case 'GENERAL_MANAGER':
        return getUIText(language, { en: 'Subsidiary General Manager', ku: 'بەڕێوەبەری گشتی کۆمپانیا', ar: 'المدير العام للشركة التابعة' });
      case 'HOLDING_VP':
        return getUIText(language, { en: 'Holding Executive VP', ku: 'جێگری سەرۆکی هۆلدینگ', ar: 'نائب رئيس المجموعة' });
      case 'HOLDING_OWNER':
        return getUIText(language, { en: 'Holding Chairman / Owner', ku: 'سەرۆکی هۆلدینگ (خاوەنی گرووپ)', ar: 'مالك ورئيس المجموعة' });
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Hero Header & Governance Banner */}
      <div className="bg-gradient-to-r from-[#0B1528] via-[#101F3C] to-[#0A1324] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 shadow-2xs">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{getUIText(language, { en: 'Holding Owner Sovereign Gate', ku: 'دەروازەی دەسەڵاتداری سەرۆکایەتی هۆلدینگ', ar: 'البوابة السيادية لرئاسة المجموعة' })}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {getUIText(language, { en: 'Engine v4.2 Live', ku: 'ماتۆڕی چالاک v4.2', ar: 'المحرك نشط v4.2' })}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{getUIText(language, { en: 'Workflow & Approval Engine', ku: 'ماتۆڕی پەسەندکردن و بەڕێوەبردنی ڕێڕەوی کار', ar: 'محرك سير العمل والموافقات التنفيذية' })}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {getUIText(language, {
                en: 'Automate multi-tier authorization chains across subsidiaries and projects. Enforce Holding Owner thresholds, inspect pending queues, sign with digital verification seals, and audit all corporate transactions.',
                ku: 'ئۆتۆماتیککردنی زنجیرەی ڕەزامەندی لەسەر ئاستی کۆمپانیا و پڕۆژەکان. چەسپاندنی سنووری دەسەڵاتی خاوەن هۆلدینگ، واژۆکردنی فەرمانی کڕین بە مۆری فەرمی، و تۆمارکردنی تەواوی مێژووی وردبینی دارایی.',
                ar: 'أتمتة سلاسل الموافقات متعددة المستويات للشركات والمشاريع التابعة. فرض حدود صلاحيات المالك، الاعتماد بالأختام الرقمية الموثقة، ومراقبة سجل التدقيق الشامل.'
              })}
            </p>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsNewRequestModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{getUIText(language, { en: 'New Approval Request', ku: 'داواکاری نوێی ڕەزامەندی', ar: 'طلب اعتماد جديد' })}</span>
            </button>

            <button
              onClick={() => setActiveEngineTab('SIMULATOR')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer backdrop-blur-md"
            >
              <Cpu className="w-4 h-4 text-purple-300" />
              <span>{getUIText(language, { en: 'Workflow Simulator', ku: 'تاقیکردنەوەی خێرای زنجیرە', ar: 'محاكي سير العمل' })}</span>
            </button>

            <button
              onClick={() => setActiveEngineTab('POLICIES')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer backdrop-blur-md"
            >
              <Sliders className="w-4 h-4 text-amber-300" />
              <span>{getUIText(language, { en: 'Threshold Policies', ku: 'سیاسەتی سنوورەکان', ar: 'سياسات الحدود' })}</span>
            </button>
          </div>
        </div>

        {/* Executive Macro KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {getUIText(language, { en: 'Awaiting Chairman Action', ku: 'چاوەڕوانی واژۆی خاوەن', ar: 'بانتظار توقيع المالك' })}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {pendingChairmanPOs.length}
              </span>
              <span className="text-xs text-amber-200/80 font-mono">
                (${pendingChairmanValue.toLocaleString()})
              </span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {getUIText(language, { en: 'Owner Threshold Rule', ku: 'سنووری دەسەڵاتی خاوەن', ar: 'حد اعتماد المالك' })}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                ${thresholdPolicy.defaultOwnerThresholdUSD.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">USD</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {getUIText(language, { en: 'Approved Value (MTD)', ku: 'بڕی پەسەندکراوی مانگانە', ar: 'إجمالي المعتمد شهرياً' })}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
                ${(approvedThisMonthValue / 1000).toFixed(0)}k
              </span>
              <span className="text-xs text-slate-400">({approvedThisMonth.length})</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {getUIText(language, { en: 'Active Workflow Rules', ku: 'ڕێساکانی زنجیرەی چالاک', ar: 'سلاسل الاعتماد النشطة' })}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono">
                {workflowRules.filter(r => r.isActive).length}
              </span>
              <span className="text-xs text-slate-400">/ {workflowRules.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveEngineTab('QUEUE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeEngineTab === 'QUEUE'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{getUIText(language, { en: 'Approvals Queue', ku: 'ڕیزی داواکارییەکان', ar: 'قائمة الاعتمادات' })}</span>
          {pendingChairmanPOs.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeEngineTab === 'QUEUE' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {pendingChairmanPOs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveEngineTab('CHAINS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeEngineTab === 'CHAINS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{getUIText(language, { en: 'Configurable Workflow Chains', ku: 'ڕێساکانی زنجیرەی پەسەندکردن', ar: 'سلاسل الاعتماد والقواعد' })}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-mono">
            {workflowRules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveEngineTab('POLICIES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeEngineTab === 'POLICIES'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{getUIText(language, { en: 'Holding Threshold Policies', ku: 'سیاسەتی سنوورەکانی دەسەڵاتی خاوەن', ar: 'سياسات حدود الصلاحيات' })}</span>
        </button>

        <button
          onClick={() => setActiveEngineTab('GM_BUDGET_RULES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeEngineTab === 'GM_BUDGET_RULES'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>{getUIText(language, { en: 'GM Budget Decisions & Thresholds', ku: 'بڕیاری بەڕێوەبەری گشتی بەپێی بودجە', ar: 'قرارات وميزانيات المدراء العامين' })}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-700 font-bold font-mono">
            {gmBudgetPolicies.length}
          </span>
        </button>

        <button
          onClick={() => setActiveEngineTab('SIMULATOR')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeEngineTab === 'SIMULATOR'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>{getUIText(language, { en: 'Live Workflow Simulator', ku: 'تاقیکردنەوەی خێرای زنجیرە', ar: 'محاكي سير العمل' })}</span>
        </button>

        <button
          onClick={() => setActiveEngineTab('AUDIT')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeEngineTab === 'AUDIT'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{getUIText(language, { en: 'Audit Trail & Compliance Log', ku: 'تۆماری مێژوویی و وردبینی', ar: 'سجل التدقيق والامتثال' })}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-mono">
            {approvalAuditTrail.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: APPROVALS QUEUE */}
      {/* ========================================================================= */}
      {activeEngineTab === 'QUEUE' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setSelectedStatusFilter('PENDING_MY_ACTION')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedStatusFilter === 'PENDING_MY_ACTION'
                      ? 'bg-amber-500 text-slate-950 shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {getUIText(language, { en: 'Awaiting My Signature', ku: 'چاوەڕوانی واژۆی من', ar: 'بانتظار توقيعي' })} ({pendingChairmanPOs.length})
                </button>
                <button
                  onClick={() => setSelectedStatusFilter('APPROVED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedStatusFilter === 'APPROVED'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {getUIText(language, { en: 'Approved History', ku: 'پەسەندکراوەکان', ar: 'المعتمدة' })} ({approvedThisMonth.length})
                </button>
                <button
                  onClick={() => setSelectedStatusFilter('REJECTED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedStatusFilter === 'REJECTED'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {getUIText(language, { en: 'Rejected', ku: 'ڕەتکراوەکان', ar: 'المرفوضة' })} ({rejectedCount})
                </button>
                <button
                  onClick={() => setSelectedStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedStatusFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {getUIText(language, { en: 'All Transactions', ku: 'سەرجەم داواکارییەکان', ar: 'كافة المعاملات' })}
                </button>
              </div>

              {/* Subsidiary Filter */}
              <select
                value={selectedCompanyFilter}
                onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="ALL">{getUIText(language, { en: 'All Subsidiaries', ku: 'هەموو کۆمپانیاکان', ar: 'كافة الشركات التابعة' })}</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{resolveEntityText(c, 'name', language)}</option>
                ))}
              </select>

              {/* Transaction Type Filter */}
              <select
                value={selectedTxTypeFilter}
                onChange={(e) => setSelectedTxTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="ALL">{getUIText(language, { en: 'All Transaction Types', ku: 'هەموو جۆرەکانی مامەڵە', ar: 'كافة أنواع المعاملات' })}</option>
                <option value="PURCHASE_ORDER">{getUIText(language, { en: 'Procurement / PO', ku: 'فەرمانی کڕین', ar: 'أمر شراء' })}</option>
                <option value="CAPITAL_EXPENDITURE">{getUIText(language, { en: 'CAPEX / Machinery', ku: 'سەرمایەداری / ئامێری قورس', ar: 'نفقات رأسمالية' })}</option>
                <option value="SUBCONTRACT_AGREEMENT">{getUIText(language, { en: 'Subcontract Agreements', ku: 'گرێبەستی بەڵێندەرایەتی', ar: 'عقود مقاولي الباطن' })}</option>
                <option value="BUDGET_OVERRUN_EXCEPTION">{getUIText(language, { en: 'Budget Overrun Exceptions', ku: 'بەزاندنی بودجە', ar: 'تجاوز الميزانية' })}</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={getUIText(language, { en: 'Search PO, vendor, requester...', ku: 'گەڕان بەپێی ژمارە، دابینکەر، داواکار...', ar: 'بحث برقم الأمر أو المورد أو الطلب...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Queue List */}
          {filteredPOs.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-500 space-y-3 shadow-xs">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">
                {getUIText(language, {
                  en: 'No Pending Approvals in Current Queue!',
                  ku: 'هیچ داواکارییەکی چاوەڕوانکراو لەم بەشەدا نییە!',
                  ar: 'لا توجد طلبات اعتماد معلقة في هذا القسم!'
                })}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {getUIText(language, {
                  en: 'All subsidiary requisitions have been processed or are within delegation limits under current threshold rules.',
                  ku: 'سەرجەم داواکارییەکان لەلایەن خاوەن هۆلدینگ یان بەڕێوەبەرانی گشتی پەسەندکراون بەپێی سنووری دیاریکراو.',
                  ar: 'تمت معالجة كافة الطلبات أو أنها تقع ضمن حدود التفويض المعتمدة.'
                })}
              </p>
              <button
                onClick={() => setIsNewRequestModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>{getUIText(language, { en: 'Initiate Test Request', ku: 'دروستکردنی داواکاری بۆ تاقیکردنەوە', ar: 'بدء طلب للاختبار' })}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPOs.map((po) => {
                const comp = companies.find(c => c.id === po.companyId);
                const proj = projects.find(p => p.id === po.projectId);
                const badge = getTxTypeBadge(po.transactionType);
                const isPendingOwner = po.status === 'PENDING_OWNER_APPROVAL';
                const wf = po.workflowState;

                return (
                  <div
                    key={po.id}
                    className={`bg-white rounded-3xl p-6 shadow-xs border transition space-y-4 ${
                      isPendingOwner 
                        ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-amber-500/5' 
                        : po.status === 'APPROVED_BY_OWNER'
                          ? 'border-emerald-200/90'
                          : 'border-slate-200/90'
                    }`}
                  >
                    {/* Top Transaction Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-base font-extrabold text-slate-900">{po.poNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold truncate max-w-[180px]">
                          {comp ? resolveEntityText(comp, 'name', language) : 'Holding Subsidiary'}
                        </span>
                        {proj && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                            {proj.code}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {po.createdDate}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-slate-900 font-mono">
                          ${po.totalAmountUSD.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">{po.currency}</span>
                      </div>
                    </div>

                    {/* Multi-Tier Visual Workflow Stepper */}
                    {wf && wf.steps && wf.steps.length > 0 && (
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70">
                        <div className="flex items-center justify-between mb-3 text-xs">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            <span>{getUIText(language, { en: 'Multi-Tier Approval Chain:', ku: 'زنجیرەی قۆناغەکانی پەسەندکردن:', ar: 'سلسلة مراحل الاعتماد:' })}</span>
                            <span className="font-mono text-slate-500 font-normal">
                              ({wf.chainRuleName})
                            </span>
                          </span>

                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            {getUIText(language, { en: 'Threshold:', ku: 'سنووری خاوەن:', ar: 'حد المالك:' })} ${po.totalAmountUSD >= 5000 ? '5,000+' : '< 5,000'}
                          </span>
                        </div>

                        {/* Responsive Stepper Container */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {wf.steps.map((step, sIdx) => {
                            const isStepApproved = step.status === 'APPROVED';
                            const isStepRejected = step.status === 'REJECTED';
                            const isStepPending = step.status === 'PENDING';
                            const isCurrent = wf.currentStepNumber === step.stepNumber && isPendingOwner;

                            return (
                              <div
                                key={sIdx}
                                className={`rounded-xl p-3 border transition flex flex-col justify-between ${
                                  isStepApproved
                                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                    : isStepRejected
                                      ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                                      : isCurrent
                                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30 text-amber-950 animate-pulse'
                                        : 'bg-white border-slate-200 text-slate-400'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-mono font-bold">
                                      {getUIText(language, { en: `Step ${step.stepNumber}`, ku: `قۆناغی ${step.stepNumber}`, ar: `المرحلة ${step.stepNumber}` })}
                                    </span>
                                    {isStepApproved && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                    {isStepRejected && <XCircle className="w-4 h-4 text-rose-600" />}
                                    {isStepPending && isCurrent && (
                                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 uppercase">
                                        {getUIText(language, { en: 'ACTION NEEDED', ku: 'واژۆ بکە', ar: 'مطلوب إجراء' })}
                                      </span>
                                    )}
                                  </div>

                                  <div className="font-bold text-xs truncate">
                                    {resolveEntityText(step, 'title', language)}
                                  </div>

                                  <div className="text-[10px] text-slate-500 mt-1 truncate">
                                    {step.approverName || getRoleLabel(step.role)}
                                  </div>
                                </div>

                                {step.signatureHash && (
                                  <div className="text-[9px] font-mono text-slate-400 mt-2 pt-1 border-t border-slate-200/60 truncate">
                                    {step.signatureHash}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* General Manager Budget Ratio & Auto-Decision Assessment */}
                    {(() => {
                      const gmEval = evaluateGMForPO(po);
                      const gmStep = wf?.steps.find(s => s.role === 'GENERAL_MANAGER');
                      const isGmPending = gmStep?.status === 'PENDING';
                      const isGmApproved = gmStep?.status === 'APPROVED';

                      return (
                        <div className="bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 rounded-2xl p-3.5 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                                <span>{getUIText(language, { en: 'Project Budget Consumption Ratio:', ku: 'ڕێژەی خەرجکردنی بودجەی پڕۆژە:', ar: 'نسبة استهلاك ميزانية المشروع:' })}</span>
                              </span>
                              <span className="font-mono font-bold text-slate-700">
                                ${gmEval.currentSpentUSD.toLocaleString()} / ${gmEval.currentBudgetUSD.toLocaleString()}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                                gmEval.projectedConsumedPercent > 85 ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                gmEval.projectedConsumedPercent > 70 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {gmEval.currentConsumedPercent}% ➔ {gmEval.projectedConsumedPercent}%
                              </span>
                            </div>

                            {/* Visual Progress Bar */}
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex max-w-md">
                              <div
                                className="bg-blue-600 h-full"
                                style={{ width: `${Math.min(100, gmEval.currentConsumedPercent)}%` }}
                              />
                              <div
                                className={`h-full ${gmEval.isBudgetExceeded ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100 - gmEval.currentConsumedPercent, Math.max(0, gmEval.projectedConsumedPercent - gmEval.currentConsumedPercent))}%` }}
                              />
                            </div>

                            <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                              <span>{getUIText(language, { en: 'GM Evaluation:', ku: 'بڕیاری بەڕێوەبەری گشتی:', ar: 'قرار المدير العام:' })}</span>
                              <span className={`font-semibold ${gmEval.canAutoApprove ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {getUIText(language, { en: gmEval.reasonEn, ku: gmEval.reasonKu, ar: gmEval.reasonAr })}
                              </span>
                            </p>
                          </div>

                          {/* Quick GM Action */}
                          {isGmPending && (
                            <div className="shrink-0 flex items-center gap-2">
                              {gmEval.canAutoApprove ? (
                                <button
                                  onClick={() => autoApproveGMStep(po.id)}
                                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                                  title="Auto-Approve based on safe budget threshold"
                                >
                                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                                  <span>{getUIText(language, { en: 'Apply GM Auto-Stamp', ku: 'پەسەندکردنی خۆکاری GM', ar: 'اعتماد فوري لمدير عام' })}</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => autoApproveGMStep(po.id, 'Manually reviewed and endorsed by General Manager')}
                                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{getUIText(language, { en: 'GM Manual Sign-off', ku: 'واژۆی دەستی GM', ar: 'توقيع يدوي للمدير' })}</span>
                                </button>
                              )}
                            </div>
                          )}

                          {isGmApproved && (
                            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{getUIText(language, { en: 'GM Approved', ku: 'پەسەندکراوە لەلایەن GM', ar: 'معتمد من المدير العام' })}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Operational Details & Justification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 bg-white p-3 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block font-medium">
                          {getUIText(language, { en: 'Vendor & Originating Department:', ku: 'دابینکەر و بەشی داواکار:', ar: 'المورّد والجهة الطالبة:' })}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{po.supplierName}</span>
                        <p className="text-slate-500 mt-0.5">
                          {getUIText(language, { en: 'Requested by:', ku: 'داواکراوە لەلایەن:', ar: 'بواسطة:' })} <strong className="text-slate-700">{po.requestedBy}</strong> ({po.requesterRole})
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400 block font-medium">
                          {getUIText(language, { en: 'Operational Justification & Purpose:', ku: 'هۆکاری پێویستی و بواری بەکارهێنان:', ar: 'المبررات التشغيلية والغرض:' })}
                        </span>
                        <p className="italic text-slate-800 mt-0.5 leading-relaxed">
                          "{po.purpose}"
                        </p>
                      </div>
                    </div>

                    {/* Items table preview */}
                    {po.items && po.items.length > 0 && (
                      <div className="border border-slate-200/70 rounded-2xl overflow-hidden">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">{getUIText(language, { en: 'Requisition Item', ku: 'کەرەستە / خزمەتگوزاری', ar: 'المادة / الخدمة' })}</th>
                              <th className="py-2 px-3 text-center">{getUIText(language, { en: 'Qty', ku: 'بڕ', ar: 'الكمية' })}</th>
                              <th className="py-2 px-3 text-right">{getUIText(language, { en: 'Unit Price', ku: 'نرخی یەکە', ar: 'سعر الوحدة' })}</th>
                              <th className="py-2 px-3 text-right">{getUIText(language, { en: 'Total Amount', ku: 'کۆی گشتی', ar: 'الإجمالي' })}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {po.items.map((it) => (
                              <tr key={it.id} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3 font-semibold text-slate-900">
                                  {resolveEntityText(it, 'name', language)}
                                </td>
                                <td className="py-2 px-3 text-center font-mono">
                                  {it.quantity} {it.unit}
                                </td>
                                <td className="py-2 px-3 text-right font-mono">
                                  ${it.unitPriceUSD.toLocaleString()}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                  ${it.totalUSD.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Executive Actions Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPoForDetails(po)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{getUIText(language, { en: 'Audit Log & History', ku: 'مێژووی وردبینی', ar: 'سجل التدقيق' })}</span>
                        </button>

                        {po.holdingApproval && (
                          <button
                            onClick={() => setSelectedPoForSeal(po)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition cursor-pointer"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>{getUIText(language, { en: 'Digital Executive Stamp', ku: 'مۆری فەرمی خاوەن', ar: 'الختم الرقمي للمالك' })}</span>
                          </button>
                        )}
                      </div>

                      {isPendingOwner && (
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => setRejectionModalPo(po)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>{getUIText(language, { en: 'Reject with Reason', ku: 'ڕەتکردنەوە بە هۆکار', ar: 'رفض مع بيان السبب' })}</span>
                          </button>

                          <button
                            onClick={() => handleApproveWithSeal(po)}
                            className="px-6 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{getUIText(language, { en: 'Authorize & Sign Order', ku: 'پەسەندکردن و واژۆی کۆتایی', ar: 'اعتماد وتوقيع الطلب' })}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONFIGURABLE WORKFLOW CHAINS */}
      {/* ========================================================================= */}
      {activeEngineTab === 'CHAINS' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>{getUIText(language, { en: 'Configurable Approval Chain Rules', ku: 'ڕێساکانی زنجیرەی پەسەندکردن', ar: 'قواعد سلاسل الاعتماد القابلة للتخصيص' })}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {getUIText(language, {
                  en: 'Define role hierarchies and mandatory signature stages based on company subsidiary, project, transaction type, and financial thresholds.',
                  ku: 'دیاریکردنی پلەبەندی قۆناغەکان و واژۆی ناچاری بەپێی کۆمپانیا، پڕۆژە، جۆری مامەڵە و بڕی دارایی.',
                  ar: 'تحديد مستويات الاعتماد والتوقيع الإلزامي بناءً على الشركة والمشروع ونوع المعاملة والمبالغ المالية.'
                })}
              </p>
            </div>

            <button
              onClick={() => {
                setEditingRule(null);
                setIsChainRuleModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{getUIText(language, { en: 'Create Approval Chain Rule', ku: 'دروستکردنی زنجیرەی نوێ', ar: 'إنشاء سلسلة اعتماد جديدة' })}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {workflowRules.map((rule) => {
              const comp = rule.companyId === 'ALL' ? null : companies.find(c => c.id === rule.companyId);
              const proj = rule.projectId === 'ALL' ? null : projects.find(p => p.id === rule.projectId);
              const badge = getTxTypeBadge(rule.transactionType);

              return (
                <div
                  key={rule.id}
                  className={`bg-white border rounded-3xl p-6 shadow-xs flex flex-col justify-between transition space-y-4 ${
                    rule.isActive ? 'border-slate-200/90 hover:border-blue-300' : 'border-slate-200/50 opacity-60 bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                            {rule.companyId === 'ALL' ? getUIText(language, { en: 'All Subsidiaries', ku: 'هەموو کۆمپانیاکان', ar: 'كافة الشركات' }) : (comp?.name || rule.companyId)}
                          </span>
                          {proj && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono">
                              {proj.code}
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-sm">
                          {resolveEntityText(rule, 'name', language)}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {resolveEntityText(rule, 'description', language)}
                        </p>
                      </div>

                      {/* Active Toggle Switch */}
                      <button
                        onClick={() => updateWorkflowRule(rule.id, { isActive: !rule.isActive })}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full transition cursor-pointer shrink-0 ${
                          rule.isActive 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {rule.isActive 
                          ? getUIText(language, { en: 'ACTIVE', ku: 'چالاک', ar: 'نشط' }) 
                          : getUIText(language, { en: 'INACTIVE', ku: 'ناچالاک', ar: 'معطل' })}
                      </button>
                    </div>

                    {/* Threshold Banner */}
                    <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-600" />
                        <span className="font-bold text-amber-900">
                          {getUIText(language, { en: 'Holding Owner Threshold:', ku: 'سنووری واژۆی خاوەن هۆلدینگ:', ar: 'حد توقيع مالك المجموعة:' })}
                        </span>
                      </div>
                      <span className="font-mono font-black text-amber-900">
                        ${rule.ownerThresholdUSD.toLocaleString()} USD
                      </span>
                    </div>

                    {/* Steps Visual Chain */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        {getUIText(language, { en: 'Mandatory Approval Sequence:', ku: 'ڕیزبەندی قۆناغەکان:', ar: 'تسلسل مراحل الاعتماد:' })}
                      </span>
                      <div className="space-y-1.5">
                        {rule.steps.map((st, idx) => (
                          <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
                                {st.stepNumber}
                              </span>
                              <span className="font-bold text-slate-900 truncate">
                                {resolveEntityText(st, 'title', language)}
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-500 font-mono shrink-0">
                              {st.minAmountUSD > 0 ? `≥ $${st.minAmountUSD.toLocaleString()}` : 'Always'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Rule Card Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 text-[10px]">
                      {getUIText(language, { en: 'Last Updated:', ku: 'دوایین نوێکردنەوە:', ar: 'آخر تحديث:' })} {rule.updatedAt}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteWorkflowRule(rule.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title={getUIText(language, { en: 'Delete Rule', ku: 'سڕینەوەی ڕێسا', ar: 'حذف القاعدة' })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HOLDING OWNER THRESHOLDS & POLICY SETTINGS */}
      {/* ========================================================================= */}
      {activeEngineTab === 'POLICIES' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              <span>{getUIText(language, { en: 'Holding Sovereign Thresholds & Authority Governance', ku: 'سنوورەکانی دەسەڵاتی خاوەن هۆلدینگ و سەروەری بڕیار', ar: 'سياسات وحدود صلاحيات مالك ورئاسة المجموعة' })}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {getUIText(language, {
                en: 'Configure default monetary thresholds where General Managers can autonomously clear requisitions, and beyond which Holding Chairman authorization is legally required.',
                ku: 'دیاریکردنی سنووری دارایی کە بەڕێوەبەرانی گشتی دەتوانن خۆیان پەسەندی بکەن، و ئەو بڕەی کە بە ناچاری پێویستی بە مۆری سەرۆکایەتی هۆلدینگە.',
                ar: 'ضبط الحدود المالية التي يحق للمدراء العامين اعتمادها، وتلك التي تتطلب توقيع مالك المجموعة بشكل إلزامي.'
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Procurement Threshold Slider */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {getUIText(language, { en: 'Default Procurement Threshold', ku: 'سنووری ستانداردی فەرمانی کڕین', ar: 'الحد الافتراضي لأوامر الشراء' })}
                </span>
                <span className="font-mono text-base font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                  ${policyOwnerThreshold.toLocaleString()} USD
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {getUIText(language, {
                  en: 'Any purchase request above this amount triggers mandatory Holding Owner review and signature.',
                  ku: 'هەر داواکارییەکی کڕین لەم بڕە بەرزتر بێت، ڕاستەوخۆ دێتە بەردەم خاوەنی هۆلدینگ بۆ واژۆ.',
                  ar: 'أي أمر شراء يتجاوز هذا المبلغ يستلزم توقيع مالك المجموعة.'
                })}
              </p>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={policyOwnerThreshold}
                onChange={(e) => setPolicyOwnerThreshold(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>$1,000 (Strict)</span>
                <span>$10,000 (Moderate)</span>
                <span>$50,000 (High Autonomy)</span>
              </div>
            </div>

            {/* CAPEX Threshold */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {getUIText(language, { en: 'Capital Expenditure & Machinery Threshold', ku: 'سنووری کڕینی ئامێر و سەرمایەداری', ar: 'حد النفقات الرأسمالية والآليات' })}
                </span>
                <span className="font-mono text-base font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                  ${policyCapexThreshold.toLocaleString()} USD
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {getUIText(language, {
                  en: 'Threshold for high-value fixed assets, plant leases, batch raw materials, and heavy fleet investments.',
                  ku: 'سنووری کڕین و کرێی ئامێری قورس، سەیارە، و سەرمایەداری بەردەوام.',
                  ar: 'حد الأصول الثابتة والآليات ومعدات الحفر واستثمارات الأسطول الثقيل.'
                })}
              </p>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={policyCapexThreshold}
                onChange={(e) => setPolicyCapexThreshold(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>$5,000</span>
                <span>$50,000</span>
                <span>$100,000</span>
              </div>
            </div>

            {/* Subcontract Agreements Threshold */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {getUIText(language, { en: 'Subcontract Agreements Threshold', ku: 'سنووری گرێبەستی بەڵێندەرایەتی لاوەکی', ar: 'حد عقود مقاولي الباطن' })}
                </span>
                <span className="font-mono text-base font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  ${policySubcontractThreshold.toLocaleString()} USD
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {getUIText(language, {
                  en: 'Mandatory Holding Chairman signature for subcontractor commitments above this threshold.',
                  ku: 'ناچارکردنی واژۆی خاوەن هۆلدینگ بۆ هەر گرێبەستێکی بەڵێندەرایەتی سەرووی ئەم بڕە.',
                  ar: 'توقيع إلزامي لمالك المجموعة لأي التزامات مع مقاولي الباطن تتجاوز هذا الحد.'
                })}
              </p>
              <input
                type="range"
                min="5000"
                max="50000"
                step="2500"
                value={policySubcontractThreshold}
                onChange={(e) => setPolicySubcontractThreshold(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>$5,000</span>
                <span>$25,000</span>
                <span>$50,000</span>
              </div>
            </div>

            {/* Auto-Escalation SLA */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {getUIText(language, { en: 'Auto-Escalation SLA (Hours)', ku: 'ماوەی هۆشداری و بەرزکردنەوەی ئۆتۆماتیکی (کاتژمێر)', ar: 'مهلة التصعيد التلقائي (بالساعات)' })}
                </span>
                <span className="font-mono text-base font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  {policyAutoEscalateHours} Hours
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {getUIText(language, {
                  en: 'If a subsidiary GM has not acted within this time window, request automatically escalates to Chairman dashboard.',
                  ku: 'ئەگەر بەڕێوەبەری گشتی کۆمپانیا لەم ماوەیەدا بڕیار نەدات، داواکاری ڕاستەوخۆ دەگاتە سەر داشبۆردی خاوەن.',
                  ar: 'في حال لم يتخذ المدير العام إجراءً خلال هذه المدة، يتم تصعيد الطلب تلقائياً إلى لوحة تحكم المالك.'
                })}
              </p>
              <input
                type="range"
                min="12"
                max="96"
                step="12"
                value={policyAutoEscalateHours}
                onChange={(e) => setPolicyAutoEscalateHours(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>12h (Urgent)</span>
                <span>48h (Standard)</span>
                <span>96h (Extended)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleSaveThresholdPolicies}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition transform active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{getUIText(language, { en: 'Save & Enforce Policies in Real-Time', ku: 'پاشەکەوتکردن و جێبەجێکردنی دەستبەجێی سنوورەکان', ar: 'حفظ وتطبيق السياسات فورياً' })}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: GENERAL MANAGER BUDGET THRESHOLDS & DECISIONS */}
      {/* ========================================================================= */}
      {activeEngineTab === 'GM_BUDGET_RULES' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5 mb-2">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{getUIText(language, { en: 'Subsidiary General Manager Delegation', ku: 'دەسەڵاتی بەڕێوەبەرە گشتییەکانی کۆمپانیا', ar: 'تفويض المدراء العامين للشركات' })}</span>
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {getUIText(language, {
                    en: 'GM Project Budget Thresholds & Automated Decision Rules',
                    ku: 'سیاسەت و سنووری بڕیاری بەڕێوەبەرە گشتییەکان بەپێی بودجەی پڕۆژە',
                    ar: 'سياسات وقواعد قرارات المدراء العامين وفق نسب الميزانية'
                  })}
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                  {getUIText(language, {
                    en: 'Configure how subsidiary General Managers evaluate and authorize requisitions for their projects. Select between fully automated approvals within safe budget consumption ratios, conditional hybrid mode, or strict manual sign-off.',
                    ku: 'دیاریکردنی شێوازی بڕیاردانی بەڕێوەبەرە گشتییەکان بۆ پڕۆژەکانیان: هەڵبژاردن لە نێوان پەسەندکردنی خۆکارانە لەژێر ڕێژەی بودجە و سەقفی پارە، یاخود سەپاندنی پێداچوونەوەی دەستی و مەرجدار بە واژۆی فەرمی.',
                    ar: 'ضبط آلية اتخاذ القرار للمدراء العامين لمشاريعهم: الاختيار بين الاعتماد التلقائي الذاتي ضمن نسب الميزانية الآمنة، أو النظام الهجين المشروط، أو التدقيق اليدوي الإلزامي.'
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                  {getUIText(language, { en: 'Active Policies:', ku: 'سیاسەتە چالاکەکان:', ar: 'السياسات النشطة:' })} <strong className="text-slate-900">{gmBudgetPolicies.length}</strong>
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>{getUIText(language, { en: 'Automated Mode (Safe Budget)', ku: 'دۆخی خۆکار (بودجەی سەلامەت)', ar: 'الوضع التلقائي (ميزانية آمنة)' })}</span>
                </div>
                <div className="text-xl font-black text-emerald-950 font-mono mt-1">
                  {gmBudgetPolicies.filter(p => p.decisionMode === 'AUTO_WITHIN_BUDGET').length} {getUIText(language, { en: 'Divisions', ku: 'بەش', ar: 'أقسام' })}
                </div>
                <p className="text-[11px] text-emerald-700/80 mt-0.5">
                  {getUIText(language, { en: 'Auto-approves within budget limit without manual bottleneck', ku: 'پەسەندکردنی خۆکار بێ چاوەڕوانی واژۆی دەستی', ar: 'اعتماد ذاتي دون تعطيل' })}
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span>{getUIText(language, { en: 'Conditional Hybrid Mode', ku: 'دۆخی تێکەڵاو / مەرجدار', ar: 'الوضع الهجين المشروط' })}</span>
                </div>
                <div className="text-xl font-black text-amber-950 font-mono mt-1">
                  {gmBudgetPolicies.filter(p => p.decisionMode === 'CONDITIONAL_HYBRID').length} {getUIText(language, { en: 'Divisions', ku: 'بەش', ar: 'أقسام' })}
                </div>
                <p className="text-[11px] text-amber-700/80 mt-0.5">
                  {getUIText(language, { en: 'Auto-approves routine supplies, escalates heavy items', ku: 'خۆکار بۆ کەرەستەی ئاسایی و دەستی بۆ خەرجی گەورە', ar: 'تلقائي للروتين ويدوي للأصول الكبرى' })}
                </p>
              </div>

              <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-purple-800 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <span>{getUIText(language, { en: 'Strict Manual Review', ku: 'پێداچوونەوەی دەستی توند', ar: 'المراجعة اليدوية الصارمة' })}</span>
                </div>
                <div className="text-xl font-black text-purple-950 font-mono mt-1">
                  {gmBudgetPolicies.filter(p => p.decisionMode === 'MANUAL_ONLY').length} {getUIText(language, { en: 'Divisions', ku: 'بەش', ar: 'أقسام' })}
                </div>
                <p className="text-[11px] text-purple-700/80 mt-0.5">
                  {getUIText(language, { en: '100% of requisitions require personal GM authorization', ku: 'واژۆی کەسی بەڕێوەبەری گشتی بۆ هەموو داواکارییەک', ar: 'توقيع يدوي شخصي لكافة الطلبات' })}
                </p>
              </div>
            </div>
          </div>

          {/* General Managers Settings Cards */}
          <div className="space-y-6">
            {companies.map((comp) => {
              const policy = findGMPolicy(gmBudgetPolicies, comp.id) || {
                id: `gm-pol-${comp.id}`,
                gmId: `gm-${comp.id}`,
                gmName: comp.generalManager,
                companyId: comp.id,
                projectId: 'ALL',
                decisionMode: 'AUTO_WITHIN_BUDGET' as GMDecisionMode,
                autoApproveMaxAmountUSD: 20000,
                maxBudgetConsumedPercent: 80,
                requireManualIfOverBudget: true,
                requireManualForCapex: true,
                autoEscalateAfterDays: 3,
                isActive: true,
                updatedAt: '2026-10-28'
              };

              const compProjects = projects.filter(p => p.companyId === comp.id);

              return (
                <div key={comp.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                  {/* Top GM Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-sm">
                        {comp.generalManager.substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                            {comp.generalManager}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                            {comp.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {resolveEntityText(comp, 'name', language)} • {comp.gmEmail} • {comp.gmPhone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">
                        {getUIText(language, { en: 'Annual Company Budget:', ku: 'بودجەی ساڵانەی کۆمپانیا:', ar: 'ميزانية الشركة السنوية:' })}
                      </span>
                      <span className="font-mono font-black text-slate-900 text-sm">
                        ${comp.annualBudgetUSD.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      {getUIText(language, { en: 'Select GM Decision & Approval Mode:', ku: 'هەڵبژاردنی دۆخی بڕیاردانی بەڕێوەبەری گشتی:', ar: 'اختر وضع اتخاذ القرار للمدير العام:' })}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          updateGmBudgetPolicy(policy.id, { decisionMode: 'AUTO_WITHIN_BUDGET' });
                        }}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between space-y-2 ${
                          policy.decisionMode === 'AUTO_WITHIN_BUDGET'
                            ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 text-emerald-950'
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs flex items-center gap-1.5 text-emerald-800">
                            <Zap className="w-4 h-4 text-emerald-600" />
                            <span>{getUIText(language, { en: 'Auto-Pilot Within Budget', ku: 'پەسەندکردنی خۆکار (لەژێر ڕێژەی بودجە)', ar: 'اعتماد تلقائي ضمن الميزانية' })}</span>
                          </span>
                          {policy.decisionMode === 'AUTO_WITHIN_BUDGET' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {getUIText(language, {
                            en: 'Automatically approves steps if project expenditure is within allowable ceiling and value threshold.',
                            ku: 'ئەگەر خەرجی پڕۆژەکە لەژێر ڕێژەی دیاریکراو بوو، داواکارییەکان بە خۆکاری پەسەند دەکرێن بێ چاوەڕوانی.',
                            ar: 'اعتماد فوري للطلبات إذا كانت نسبة استهلاك المشروع ضمن السقف المحدد ودون تجاوز القيمة.'
                          })}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateGmBudgetPolicy(policy.id, { decisionMode: 'CONDITIONAL_HYBRID' });
                        }}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between space-y-2 ${
                          policy.decisionMode === 'CONDITIONAL_HYBRID'
                            ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 text-amber-950'
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs flex items-center gap-1.5 text-amber-800">
                            <Sliders className="w-4 h-4 text-amber-600" />
                            <span>{getUIText(language, { en: 'Conditional Hybrid', ku: 'تێکەڵاو / مەرجدار', ar: 'نظام هجين مشروط' })}</span>
                          </span>
                          {policy.decisionMode === 'CONDITIONAL_HYBRID' && (
                            <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {getUIText(language, {
                            en: 'Auto-approves routine operational items; routes large capital expenditures to personal GM review.',
                            ku: 'پەسەندکردنی خۆکار بۆ کەرەستەی ئاسایی ڕۆژانە؛ داواکارییە گەورەکان پێویستیان بە واژۆی دەستی دەبێت.',
                            ar: 'اعتماد تلقائي للمواد التشغيلية الروتينية، ومراجعة يدوية للمشتريات الكبرى.'
                          })}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateGmBudgetPolicy(policy.id, { decisionMode: 'MANUAL_ONLY' });
                        }}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between space-y-2 ${
                          policy.decisionMode === 'MANUAL_ONLY'
                            ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-500/20 text-purple-950'
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs flex items-center gap-1.5 text-purple-800">
                            <ShieldAlert className="w-4 h-4 text-purple-600" />
                            <span>{getUIText(language, { en: 'Strict Manual Review Only', ku: 'پێداچوونەوەی دەستی توند', ar: 'مراجعة يدوية صارمة فقط' })}</span>
                          </span>
                          {policy.decisionMode === 'MANUAL_ONLY' && (
                            <CheckCircle2 className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {getUIText(language, {
                            en: 'Disables all automated sign-offs. General Manager must manually inspect and sign every single request.',
                            ku: 'سەرجەم پەسەندکردنی خۆکار ڕادەگرێت؛ پێویستە بەڕێوەبەری گشتی یەکە بە یەکەی داواکارییەکان واژۆ بکات.',
                            ar: 'تعطيل كافة الموافقات التلقائية؛ يتطلب توقيعاً يدوياً شخصياً للمدير العام لكل معاملة.'
                          })}
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Threshold Sliders & Logic Controls */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                    {/* Max Auto Amount */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">
                          {getUIText(language, { en: 'Auto-Approve Max Amount (USD):', ku: 'سەقفی پەسەندکردنی خۆکار (دۆلار):', ar: 'الحد الأقصى للاعتماد التلقائي (دولار):' })}
                        </span>
                        <span className="font-mono font-black text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                          ${policy.autoApproveMaxAmountUSD.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {getUIText(language, {
                          en: 'Requisitions above this value will strictly require manual GM signature.',
                          ku: 'داواکارییەکانی سەرووی ئەم بڕە بە هیچ شێوەیەک خۆکار تێناپەڕن و واژۆی دەستییان دەوێت.',
                          ar: 'الطلبات التي تتجاوز هذا المبلغ تتطلب توقيعاً يدوياً للمدير العام حصراً.'
                        })}
                      </p>
                      <input
                        type="range"
                        min="2500"
                        max="100000"
                        step="2500"
                        value={policy.autoApproveMaxAmountUSD}
                        onChange={(e) => {
                          updateGmBudgetPolicy(policy.id, { autoApproveMaxAmountUSD: Number(e.target.value) });
                        }}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>$2,500</span>
                        <span>$50,000</span>
                        <span>$100,000</span>
                      </div>
                    </div>

                    {/* Max Budget Burn Ratio % */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">
                          {getUIText(language, { en: 'Max Allowable Project Budget Burn Ratio (%):', ku: 'بەرزترین ڕێژەی بەکارهێنانی بودجەی پڕۆژە (%):', ar: 'الحد الأقصى لنسبة استهلاك ميزانية المشروع (%):' })}
                        </span>
                        <span className="font-mono font-black text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                          {policy.maxBudgetConsumedPercent}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {getUIText(language, {
                          en: 'If project current spend + this request exceeds this percentage, auto-approval is blocked.',
                          ku: 'ئەگەر کۆی خەرجی پڕۆژەکە ئەم ڕێژەیە تێپەڕێنێت، خۆکارکردن دەوەستێت و واژۆی دەستی مەرج دەبێت.',
                          ar: 'في حال تجاوز إجمالي إنفاق المشروع هذه النسبة، يتم إيقاف الاعتماد التلقائي وفرض المراجعة اليدوية.'
                        })}
                      </p>
                      <input
                        type="range"
                        min="50"
                        max="95"
                        step="5"
                        value={policy.maxBudgetConsumedPercent}
                        onChange={(e) => {
                          updateGmBudgetPolicy(policy.id, { maxBudgetConsumedPercent: Number(e.target.value) });
                        }}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>50% (Conservative)</span>
                        <span>75% (Balanced)</span>
                        <span>95% (Aggressive)</span>
                      </div>
                    </div>
                  </div>

                  {/* Toggles Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <label className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 cursor-pointer hover:bg-slate-100/50 transition">
                      <input
                        type="checkbox"
                        checked={policy.requireManualIfOverBudget}
                        onChange={(e) => updateGmBudgetPolicy(policy.id, { requireManualIfOverBudget: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {getUIText(language, { en: 'Force Manual Review on Budget Overrun', ku: 'ناچارکردنی واژۆی دەستی لە کاتی بەزاندنی بودجە', ar: 'فرض المراجعة اليدوية عند تجاوز الميزانية' })}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {getUIText(language, { en: 'Any project that exceeds 100% budget immediately locks auto-approval.', ku: 'هەر پڕۆژەیەک بودجەی تەواو کردبێت دەستبەجێ خۆکارکردنی لێ دەسەنرێتەوە.', ar: 'أي مشروع يتجاوز 100% يقفل الاعتماد التلقائي فوراً.' })}
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 cursor-pointer hover:bg-slate-100/50 transition">
                      <input
                        type="checkbox"
                        checked={policy.requireManualForCapex}
                        onChange={(e) => updateGmBudgetPolicy(policy.id, { requireManualForCapex: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {getUIText(language, { en: 'Strict Manual Sign-Off for Heavy CAPEX', ku: 'واژۆی دەستی مەرجە بۆ ئامێری قورس و موڵک (CAPEX)', ar: 'مراجعة يدوية إلزامية للنفقات الرأسمالية والآليات' })}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {getUIText(language, { en: 'Never auto-approve machinery, trucks, or permanent structural assets.', ku: 'هیچ ئامێرێکی قورس و سەیارە بە خۆکاری تێناپەڕێت.', ar: 'عدم اعتماد أي آليات أو شاحنات بشكل تلقائي.' })}
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Projects Under This GM with Live Budget Gauges */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>{getUIText(language, { en: 'Projects Managed by this General Manager:', ku: 'پڕۆژەکانی ژێر سەرپەرشتی ئەم بەڕێوەبەرە گشتییە:', ar: 'المشاريع التابعة لإشراف هذا المدير العام:' })}</span>
                      <span className="text-[11px] font-mono text-slate-400 font-normal">({compProjects.length} Projects)</span>
                    </h4>

                    {compProjects.length === 0 ? (
                      <div className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                        {getUIText(language, { en: 'No active projects linked to this subsidiary yet.', ku: 'هیچ پڕۆژەیەکی چالاک بەم کۆمپانیایەوە نەبەستراوەتەوە.', ar: 'لا توجد مشاريع نشطة مرتبطة بهذه الشركة حالياً.' })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {compProjects.map((p) => {
                          const spentPercent = Number(((p.spentUSD / (p.budgetUSD || 1)) * 100).toFixed(1));
                          const isOverThreshold = spentPercent > policy.maxBudgetConsumedPercent;
                          const isAutoEligible = policy.decisionMode !== 'MANUAL_ONLY' && !isOverThreshold;

                          return (
                            <div key={p.id} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                                  {p.code}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  isAutoEligible 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  {isAutoEligible 
                                    ? getUIText(language, { en: `Auto-Eligible (< ${policy.maxBudgetConsumedPercent}%)`, ku: `خۆکار (لەژێر ٪${policy.maxBudgetConsumedPercent})`, ar: `مؤهل للتلقائي (< ٪${policy.maxBudgetConsumedPercent})` })
                                    : getUIText(language, { en: 'Manual Review Required', ku: 'واژۆی دەستی مەرجە', ar: 'مراجعة يدوية مطلوبة' })
                                  }
                                </span>
                              </div>

                              <div className="font-bold text-xs text-slate-900 truncate">
                                {resolveEntityText(p, 'name', language)}
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                                <span>${p.spentUSD.toLocaleString()} / ${p.budgetUSD.toLocaleString()}</span>
                                <span className="font-bold">{spentPercent}%</span>
                              </div>

                              {/* Budget Progress Bar */}
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    spentPercent > 85 ? 'bg-rose-500' :
                                    spentPercent > 70 ? 'bg-amber-500' :
                                    'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(100, spentPercent)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: WORKFLOW SIMULATOR & SANDBOX */}
      {/* ========================================================================= */}
      {activeEngineTab === 'SIMULATOR' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-600" />
              <span>{getUIText(language, { en: 'Workflow Decision Engine Simulator', ku: 'تاقیکردنەوە و شیکاری خێرای ڕێڕەوی پەسەندکردن', ar: 'محاكي محرك اتخاذ القرار لمسارات العمل' })}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {getUIText(language, {
                en: 'Test how any requisition parameters will evaluate in real-time. Verify which chain rule triggers, what steps are required, and if Holding Chairman authorization is mandatory.',
                ku: 'پشکنینی ئەوەی کە چۆن هەر داواکارییەک بەپێی نرخ و کۆمپانیا دەگاتە دەسەڵاتداران و کەی واژۆی خاوەن هۆلدینگ ناچاری دەبێت.',
                ar: 'اختبر كيف سيتم تقييم أي طلب بناءً على المبلغ والشركة ونوع المعاملة ومن هم المسؤولون المطالبون بالتوقيع.'
              })}
            </p>
          </div>

          {/* Simulator Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                {getUIText(language, { en: 'Target Subsidiary Company:', ku: 'کۆمپانیای داواکار:', ar: 'الشركة التابعة:' })}
              </label>
              <select
                value={simCompanyId}
                onChange={(e) => setSimCompanyId(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-xl px-3 py-2"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{resolveEntityText(c, 'name', language)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                {getUIText(language, { en: 'Project (Optional):', ku: 'پڕۆژە (ئارەزوومەندانە):', ar: 'المشروع (اختياري):' })}
              </label>
              <select
                value={simProjectId}
                onChange={(e) => setSimProjectId(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-xl px-3 py-2"
              >
                <option value="">{getUIText(language, { en: 'General Company Requisition', ku: 'داواکاری گشتی کۆمپانیا', ar: 'طلب عام للشركة' })}</option>
                {projects.filter(p => p.companyId === simCompanyId).map(p => (
                  <option key={p.id} value={p.id}>{resolveEntityText(p, 'name', language)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                {getUIText(language, { en: 'Transaction Type:', ku: 'جۆری مامەڵە:', ar: 'نوع المعاملة:' })}
              </label>
              <select
                value={simTxType}
                onChange={(e) => setSimTxType(e.target.value as TransactionType)}
                className="w-full bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-xl px-3 py-2"
              >
                <option value="PURCHASE_ORDER">{getUIText(language, { en: 'Procurement / PO', ku: 'فەرمانی کڕین', ar: 'أمر شراء' })}</option>
                <option value="CAPITAL_EXPENDITURE">{getUIText(language, { en: 'CAPEX / Machinery', ku: 'سەرمایەداری / ئامێر', ar: 'نفقات رأسمالية' })}</option>
                <option value="SUBCONTRACT_AGREEMENT">{getUIText(language, { en: 'Subcontract Agreement', ku: 'گرێبەستی لاوەکی', ar: 'عقد مقاولة باطن' })}</option>
                <option value="BUDGET_OVERRUN_EXCEPTION">{getUIText(language, { en: 'Budget Overrun Exception', ku: 'بەزاندنی بودجە', ar: 'تجاوز ميزانية' })}</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                {getUIText(language, { en: 'Requisition Amount (USD):', ku: 'بڕی پارەی داواکراو (دۆلار):', ar: 'مبلغ الطلب (دولار):' })}
              </label>
              <input
                type="number"
                value={simAmountUSD}
                onChange={(e) => setSimAmountUSD(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 text-slate-900 text-xs font-black font-mono rounded-xl px-3 py-2"
              />
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 p-6 rounded-3xl border border-blue-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200/80 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                  {getUIText(language, { en: 'Matched Approval Rule:', ku: 'ڕێسای دیاریکراوی زنجیرە:', ar: 'القاعدة المطابقة:' })}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  {resolveEntityText(simulatedRule, 'name', language)}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {simulatedRequiresOwner ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span>{getUIText(language, { en: 'Holding Owner Signature MANDATORY', ku: 'واژۆی خاوەن هۆلدینگ ناچارییە', ar: 'توقيع مالك المجموعة إلزامي' })}</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{getUIText(language, { en: 'Subsidiary GM Authority Cleared', ku: 'بە دەسەڵاتی بەڕێوەبەری گشتی جێبەجێ دەبێت', ar: 'ضمن صلاحيات المدير العام للشركة' })}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Simulated Stepper */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                {getUIText(language, { en: 'Live Evaluation Sequence (Steps Triggered):', ku: 'قۆناغە چالاککراوەکان بەپێی ئەم بڕە:', ar: 'المراحل المفعلة لهذا المبلغ:' })}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {simulatedSteps.map((st) => (
                  <div key={st.stepNumber} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 block">
                        Step {st.stepNumber}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 mt-0.5">
                        {resolveEntityText(st, 'title', language)}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {getRoleLabel(st.role)}
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>{getUIText(language, { en: 'Est. SLA:', ku: 'وادە:', ar: 'المدة:' })} {st.slaHours}h</span>
                      {st.requiresOwnerSignature && (
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live General Manager Budget Evaluation Card in Simulator */}
            {(() => {
              const simProj = projects.find(p => p.id === simProjectId);
              const simGMPolicy = findGMPolicy(gmBudgetPolicies, simCompanyId, simProjectId);
              const simGMEval = evaluateGMWorkflowDecision(
                simGMPolicy,
                simProj?.budgetUSD || 1000000,
                simProj?.spentUSD || 0,
                Number(simAmountUSD),
                simTxType
              );

              return (
                <div className="bg-white/90 p-4 rounded-2xl border border-blue-200/90 space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-extrabold text-xs text-slate-900">
                        {getUIText(language, { en: 'Simulated GM Budget & Delegation Analysis:', ku: 'شیکاری بڕیاری بەڕێوەبەری گشتی بەپێی بودجە:', ar: 'تحليل قرار المدير العام وفق الميزانية المحاكاة:' })}
                      </span>
                    </div>

                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      simGMEval.canAutoApprove 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {simGMEval.canAutoApprove
                        ? getUIText(language, { en: '⚡ AUTO-APPROVAL CLEARED', ku: '⚡ پەسەندکردنی خۆکار ڕێگەپێدراوە', ar: '⚡ مؤهل للاعتماد التلقائي' })
                        : getUIText(language, { en: '⚠️ MANDATORY MANUAL GM REVIEW', ku: '⚠️ پێداچوونەوەی دەستی مەرجە', ar: '⚠️ مراجعة يدوية إلزامية' })
                      }
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">{getUIText(language, { en: 'Project Budget', ku: 'بودجەی پڕۆژە', ar: 'ميزانية المشروع' })}</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">${simGMEval.currentBudgetUSD.toLocaleString()}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">{getUIText(language, { en: 'Current Spent', ku: 'خەرجکراوی ئێستا', ar: 'المنفق حالياً' })}</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">${simGMEval.currentSpentUSD.toLocaleString()} ({simGMEval.currentConsumedPercent}%)</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">{getUIText(language, { en: 'Projected Total', ku: 'خەرجی دوای داواکاری', ar: 'المتوقع بعد الطلب' })}</span>
                      <span className={`font-mono font-bold text-sm ${simGMEval.isBudgetExceeded ? 'text-rose-600' : 'text-slate-800'}`}>
                        ${(simGMEval.currentSpentUSD + simGMEval.requestAmountUSD).toLocaleString()} ({simGMEval.projectedConsumedPercent}%)
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">{getUIText(language, { en: 'GM Policy Mode', ku: 'دۆخی سیاسەتی GM', ar: 'وضع سياسة المدير' })}</span>
                      <span className="font-mono font-bold text-xs text-blue-700">{simGMEval.decisionMode}</span>
                    </div>
                  </div>

                  <div className="text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 flex items-start gap-2">
                    <span className="font-bold text-slate-900 shrink-0">{getUIText(language, { en: 'Engine Verdict:', ku: 'ئەنجامی ماتۆڕ:', ar: 'قرار النظام:' })}</span>
                    <span>{getUIText(language, { en: simGMEval.reasonEn, ku: simGMEval.reasonKu, ar: simGMEval.reasonAr })}</span>
                  </div>
                </div>
              );
            })()}

            {/* Test Injection Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  submitPurchaseRequest({
                    companyId: simCompanyId,
                    projectId: simProjectId || undefined,
                    requestedBy: 'Simulation Test Engineer',
                    requesterRole: 'Project Manager',
                    supplierName: 'Simulated Technical Supplier Co.',
                    purpose: `Simulated testing of ${simTxType} evaluation ($${simAmountUSD.toLocaleString()})`,
                    totalAmountUSD: Number(simAmountUSD),
                    subtotalUSD: Number(simAmountUSD),
                    taxUSD: 0,
                    currency: 'USD',
                    originalLanguage: language,
                    transactionType: simTxType,
                    items: [
                      {
                        id: `sim-item-${Date.now()}`,
                        name: `Simulated Material Lot for ${simTxType}`,
                        quantity: 1,
                        unit: 'Lot',
                        unitPriceUSD: Number(simAmountUSD),
                        totalUSD: Number(simAmountUSD),
                        category: simTxType
                      }
                    ]
                  });
                  setActiveEngineTab('QUEUE');
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{getUIText(language, { en: 'Inject As Live Approval Request', ku: 'ناردنی وەک داواکاری ڕاستەقینە بۆ ناو ڕیز', ar: 'إرسال كطلب اعتماد فعلي إلى القائمة' })}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AUDIT TRAIL & COMPLIANCE LOG */}
      {/* ========================================================================= */}
      {activeEngineTab === 'AUDIT' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <span>{getUIText(language, { en: 'Executive Audit Trail & Governance Ledger', ku: 'تۆماری مێژوویی، وردبینی و ڕەزامەندییەکان', ar: 'سجل التدقيق التاريخي وحوكمة الاعتمادات' })}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {getUIText(language, {
                  en: 'Tamper-evident audit logs with cryptographic signature hashes and timestamps for all approvals and rejections.',
                  ku: 'تۆماری تەواوی واژۆ، ڕەتکردنەوە، و مۆری فەرمی ئەلیکترۆنی لەگەڵ کۆدی تاقیکردنەوەی دیجیتاڵی.',
                  ar: 'سجل غير قابل للتعديل يوثق كافة التوقيعات والأختام الرقمية والأوقات الزمنية للاعتمادات.'
                })}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>{getUIText(language, { en: 'Print Audit Report', ku: 'پرینتکردنی ڕاپۆرتی وردبینی', ar: 'طباعة تقرير التدقيق' })}</span>
            </button>
          </div>

          {approvalAuditTrail.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {getUIText(language, {
                en: 'No audit records logged yet. Process approval actions to populate the audit ledger.',
                ku: 'هێشتا هیچ تۆمارێکی وردبینی نییە. کردارەکانی واژۆ دەستپێبکە بۆ پڕکردنەوەی لۆگەکە.',
                ar: 'لا توجد سجلات تدقيق حتى الآن.'
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">{getUIText(language, { en: 'Timestamp', ku: 'کات و ڕێکەوت', ar: 'الوقت والتاريخ' })}</th>
                    <th className="py-2.5 px-3">{getUIText(language, { en: 'PO Number', ku: 'ژمارەی فەرمان', ar: 'رقم الأمر' })}</th>
                    <th className="py-2.5 px-3">{getUIText(language, { en: 'Action', ku: 'کردار', ar: 'الإجراء' })}</th>
                    <th className="py-2.5 px-3">{getUIText(language, { en: 'Approver & Role', ku: 'بڕیاردەر و پلە', ar: 'المعتمد والمنصب' })}</th>
                    <th className="py-2.5 px-3">{getUIText(language, { en: 'Comments & Decision Notes', ku: 'تێبینی و ڕوونکردنەوە', ar: 'الملاحظات' })}</th>
                    <th className="py-2.5 px-3 font-mono text-right">{getUIText(language, { en: 'Signature Hash', ku: 'کۆدی واژۆی دیجیتاڵی', ar: 'رمز التوقيع' })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvalAuditTrail.map((audit) => {
                    return (
                      <tr key={audit.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {new Date(audit.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {audit.poNumber}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            audit.action === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : audit.action === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {audit.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-slate-900">{audit.performedBy}</span>
                          <span className="text-[10px] text-slate-400 block">{getRoleLabel(audit.performerRole)}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                          {audit.comments}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[10px] text-blue-600 font-bold whitespace-nowrap">
                          {audit.signatureHash || 'VERIFIED-LEGACY'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DIGITAL EXECUTIVE STAMP / VERIFICATION SEAL */}
      {/* ========================================================================= */}
      {selectedPoForSeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative">
            <button
              onClick={() => setSelectedPoForSeal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>

            {/* Certificate Header */}
            <div className="text-center space-y-2 border-b border-slate-100 pb-5">
              <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto text-amber-600 shadow-md">
                <Crown className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {getUIText(language, { en: 'Official Holding Digital Authorization Seal', ku: 'مۆری فەرمی ئەلیکترۆنی سەرۆکایەتی هۆلدینگ', ar: 'الختم والاعتماد الرقمي الرسمي لرئاسة المجموعة' })}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {holding.name || 'Holding Enterprise'} • SAS4ERP Platform
              </p>
            </div>

            {/* Certificate Data */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">{getUIText(language, { en: 'Requisition Number:', ku: 'ژمارەی فەرمان:', ar: 'رقم المعاملة:' })}</span>
                <span className="font-mono font-bold text-slate-900">{selectedPoForSeal.poNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">{getUIText(language, { en: 'Authorized Amount:', ku: 'بڕی پەسەندکراو:', ar: 'المبلغ المعتمد:' })}</span>
                <span className="font-mono font-black text-emerald-600 text-sm">
                  ${selectedPoForSeal.totalAmountUSD.toLocaleString()} {selectedPoForSeal.currency}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">{getUIText(language, { en: 'Authorized By:', ku: 'واژۆکراوە لەلایەن:', ar: 'المعتمد بواسطة:' })}</span>
                <span className="font-bold text-slate-900">{selectedPoForSeal.holdingApproval?.approvedBy || holding.chairmanName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">{getUIText(language, { en: 'Authorization Date:', ku: 'ڕێکەوتی واژۆ:', ar: 'تاريخ الاعتماد:' })}</span>
                <span className="font-mono text-slate-700">{selectedPoForSeal.holdingApproval?.approvedAt || new Date().toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">{getUIText(language, { en: 'Cryptographic Signature Hash:', ku: 'کۆدی پارێزراوی دیجیتاڵی:', ar: 'رمز التوقيع الرقمي المشفر:' })}</span>
                <span className="font-mono text-blue-700 font-bold bg-white p-2 rounded-xl border border-slate-200 block text-center break-all select-all">
                  {selectedPoForSeal.holdingApproval?.signatureHash || `SIG-HOLDING-${Math.random().toString(36).substring(2, 10).toUpperCase()}`}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPoForSeal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              {getUIText(language, { en: 'Close Certificate', ku: 'داخستنی بڕوانامە', ar: 'إغلاق الشهادة' })}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT WITH FEEDBACK */}
      {/* ========================================================================= */}
      {rejectionModalPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {getUIText(language, { en: 'Reject Requisition', ku: 'ڕەتکردنەوەی داواکاری کڕین', ar: 'رفض المعاملة' })}
                </h3>
                <span className="font-mono text-xs text-slate-500">{rejectionModalPo.poNumber}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {getUIText(language, {
                en: 'Please state the operational or financial reason for rejection. This feedback will be immediately transmitted to the subsidiary General Manager.',
                ku: 'تکایە هۆکاری ڕەتکردنەوە بنووسە. ئەم هۆکارە ڕاستەوخۆ دەگاتەوە بە بەڕێوەبەری گشتی کۆمپانیاکە.',
                ar: 'يرجى تدوين سبب الرفض المالي أو التشغيلي ليتم إرساله فوراً للمدير العام للشركة.'
              })}
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={getUIText(language, { en: 'e.g., Exceeds allocated Q3 sub-budget; obtain three competitive bids.', ku: 'نموونە: تێچوو زیاترە لە بودجەی تەرخانکراو؛ سێ نرخی بەراوردکاری پێشکەش بکەن.', ar: 'مثال: يتجاوز الميزانية الربعية المخصصة؛ يرجى تقديم ثلاثة عروض أسعار.' })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionModalPo(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                {getUIText(language, { en: 'Cancel', ku: 'پاشگەزبوونەوە', ar: 'إلغاء' })}
              </button>
              <button
                onClick={handleConfirmRejection}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-sm"
              >
                {getUIText(language, { en: 'Confirm Rejection', ku: 'تەئکیدکردنەوەی ڕەتکردنەوە', ar: 'تأكيد الرفض' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INITIATE NEW APPROVAL REQUEST */}
      {/* ========================================================================= */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {getUIText(language, { en: 'Initiate Corporate Approval Request', ku: 'دروستکردنی داواکاری نوێی پەسەندکردن', ar: 'بدء طلب اعتماد مؤسسي جديد' })}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {getUIText(language, { en: 'Routes through multi-tier workflow engine based on company & value', ku: 'بەپێی کۆمپانیا و بڕی دارایی دەخرێتە ناو ڕێڕەوی پەسەندکردن', ar: 'يتم توجيهه تلقائياً وفق نوع المعاملة والمبلغ' })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNewRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewRequest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {getUIText(language, { en: 'Subsidiary Company:', ku: 'کۆمپانیای داواکار:', ar: 'الشركة التابعة:' })}
                  </label>
                  <select
                    value={newReqCompanyId}
                    onChange={(e) => {
                      setNewReqCompanyId(e.target.value);
                      const compProjects = projects.filter(p => p.companyId === e.target.value);
                      setNewReqProjectId(compProjects[0]?.id || '');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{resolveEntityText(c, 'name', language)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {getUIText(language, { en: 'Project (Site):', ku: 'پڕۆژە:', ar: 'المشروع:' })}
                  </label>
                  <select
                    value={newReqProjectId}
                    onChange={(e) => setNewReqProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  >
                    <option value="">{getUIText(language, { en: 'Company HQ / Non-Project', ku: 'بارەگای سەرەکی کۆمپانیا', ar: 'المقر العام' })}</option>
                    {projects.filter(p => p.companyId === newReqCompanyId).map(p => (
                      <option key={p.id} value={p.id}>{resolveEntityText(p, 'name', language)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {getUIText(language, { en: 'Transaction Type:', ku: 'جۆری مامەڵە:', ar: 'نوع المعاملة:' })}
                  </label>
                  <select
                    value={newReqTxType}
                    onChange={(e) => setNewReqTxType(e.target.value as TransactionType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="PURCHASE_ORDER">{getUIText(language, { en: 'Procurement / PO', ku: 'فەرمانی کڕین', ar: 'أمر شراء' })}</option>
                    <option value="CAPITAL_EXPENDITURE">{getUIText(language, { en: 'CAPEX / Machinery', ku: 'سەرمایەداری / ئامێر', ar: 'نفقات رأسمالية' })}</option>
                    <option value="SUBCONTRACT_AGREEMENT">{getUIText(language, { en: 'Subcontract Agreement', ku: 'گرێبەستی لاوەکی', ar: 'عقد مقاولة باطن' })}</option>
                    <option value="BUDGET_OVERRUN_EXCEPTION">{getUIText(language, { en: 'Budget Overrun Exception', ku: 'بەزاندنی بودجە', ar: 'تجاوز ميزانية' })}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {getUIText(language, { en: 'Amount (USD):', ku: 'بڕی پارە (دۆلار):', ar: 'المبلغ (دولار):' })}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newReqAmountUSD}
                    onChange={(e) => setNewReqAmountUSD(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-black font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="text-xs space-y-1">
                <label className="font-bold text-slate-700 block">
                  {getUIText(language, { en: 'Supplier / Contractor Name:', ku: 'ناوی دابینکەر یان بەڵێندەر:', ar: 'اسم المورد أو المقاول:' })}
                </label>
                <input
                  type="text"
                  required
                  value={newReqSupplier}
                  onChange={(e) => setNewReqSupplier(e.target.value)}
                  placeholder={getUIText(language, { en: 'e.g. Al-Mansoor Industrial Steel Ltd.', ku: 'نموونە: کۆمپانیای دابینکاری کەرەستە', ar: 'مثال: شركة المنصور لتوريد المواد' })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="text-xs space-y-1">
                <label className="font-bold text-slate-700 block">
                  {getUIText(language, { en: 'Item / Material Description:', ku: 'ناونیشانی کەرەستە:', ar: 'وصف المادة أو الخدمة:' })}
                </label>
                <input
                  type="text"
                  required
                  value={newReqItemName}
                  onChange={(e) => setNewReqItemName(e.target.value)}
                  placeholder={getUIText(language, { en: 'e.g. High-Pressure Concrete Pumping Pipes and Clamps', ku: 'نموونە: بۆڕی پەستانی بەرز بۆ پەمپی کۆنکرێت', ar: 'أنابيب ضخ الخرسانة وملحقاتها' })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="text-xs space-y-1">
                <label className="font-bold text-slate-700 block">
                  {getUIText(language, { en: 'Operational Justification & Reason:', ku: 'هۆکاری پێویستی بۆ کار:', ar: 'المبررات التشغيلية:' })}
                </label>
                <textarea
                  rows={2}
                  required
                  value={newReqPurpose}
                  onChange={(e) => setNewReqPurpose(e.target.value)}
                  placeholder={getUIText(language, { en: 'Detailed technical need and alignment with site milestone.', ku: 'ڕوونکردنەوەی تەکنیکی بۆ پڕۆژەکە.', ar: 'الاحتياج الفني للمشروع.' })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  {getUIText(language, { en: 'Cancel', ku: 'پاشگەزبوونەوە', ar: 'إلغاء' })}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer"
                >
                  {getUIText(language, { en: 'Submit to Approval Engine', ku: 'ناردن بۆ ناو سیستەمی پەسەندکردن', ar: 'إرسال إلى محرك الاعتماد' })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
