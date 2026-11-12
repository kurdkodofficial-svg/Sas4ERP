import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  ScanLine,
  Filter,
  Search,
  Sparkles,
  ShieldCheck,
  Building2,
  FileText,
  AlertTriangle,
  Trash2,
  PenTool,
  ChevronRight,
  Wallet,
  Lock,
  Check,
  Zap
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { PurchaseOrder, PurchaseItem } from '../types/erp';
import { RequestApprovalJourneyModal } from './workflow/RequestApprovalJourneyModal';

export const ProcurementModule: React.FC = () => {
  const {
    purchaseOrders,
    companies,
    projects,
    addPurchaseOrder,
    deletePurchaseOrder,
    approvePurchaseByOwner,
    rejectPurchaseByOwner,
    approveWorkflowStep,
    canUserApproveWorkflowStep,
    isPoFullyApproved,
    canPoEnterProject,
    grantCeoPreApproval,
    delegatePoSpendingAuthority,
    isPoDelegatedOrAutonomous,
    signPmReleaseForProcurement,
    collectFundsByProcurement,
    currentUser,
    selectedCompanyId,
    setIsGateScannerOpen,
  } = useERP();

  const { t, language } = useLanguage();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [supplierName, setSupplierName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [targetCompanyId, setTargetCompanyId] = useState(companies[0]?.id || 'comp-1');
  const [targetProjectId, setTargetProjectId] = useState(projects[0]?.id || 'proj-101');
  const [items, setItems] = useState<{ name: string; quantity: number; unit: string; unitPriceUSD: number }[]>([
    { name: 'Reinforced Steel Bars 16mm', quantity: 20, unit: 'Tons', unitPriceUSD: 720 },
  ]);

  const [aiAuditResult, setAiAuditResult] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [trackingPo, setTrackingPo] = useState<PurchaseOrder | null>(null);
  const [delegatingPo, setDelegatingPo] = useState<PurchaseOrder | null>(null);
  const [poDecreeNo, setPoDecreeNo] = useState('');
  const [poDelegationNotes, setPoDelegationNotes] = useState('');

  const isHoldingApprover = currentUser.role === 'HOLDING_OWNER' || currentUser.role === 'SUPER_ADMIN';

  const filteredPOs = purchaseOrders.filter((po) => {
    // If subordinate has designated project or company
    if (currentUser.role === 'PROJECT_MANAGER' && currentUser.projectId && po.projectId !== currentUser.projectId) {
      return false;
    }
    if (currentUser.role === 'COMPANY_GM' && currentUser.companyId && po.companyId !== currentUser.companyId) {
      return false;
    }
    if (selectedCompanyId !== 'ALL' && po.companyId !== selectedCompanyId) return false;

    if (filterStatus !== 'ALL') {
      const activePending = po.workflowState?.steps?.find(s => s.status === 'PENDING');
      if (filterStatus === 'STAGE_PM') {
        if (activePending?.stepNumber !== 1 && activePending?.role !== 'PROJECT_MANAGER') return false;
      } else if (filterStatus === 'STAGE_WAREHOUSE') {
        if (activePending?.stepNumber !== 2 && activePending?.role !== 'WAREHOUSE_OFFICER') return false;
      } else if (filterStatus === 'STAGE_FINANCE') {
        if (activePending?.stepNumber !== 3 && activePending?.role !== 'FINANCE_HEAD' && activePending?.role !== 'COST_CONTROLLER') return false;
      } else if (filterStatus === 'STAGE_GM') {
        if (activePending?.stepNumber !== 4 && activePending?.role !== 'GENERAL_MANAGER') return false;
      } else if (filterStatus === 'STAGE_OWNER') {
        if (activePending?.stepNumber !== 5 && activePending?.role !== 'HOLDING_OWNER') return false;
      } else if (filterStatus === 'STAGE_APPROVED') {
        if (!isPoFullyApproved(po)) return false;
      } else if (po.status !== filterStatus) {
        return false;
      }
    }

    return true;
  });

  const handleAddItemRow = () => {
    setItems(prev => [...prev, { name: '', quantity: 1, unit: 'Units', unitPriceUSD: 100 }]);
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    setItems(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, idx) => idx !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPriceUSD), 0);
  };

  const handleSubmitPO = (e: React.FormEvent) => {
    e.preventDefault();
    const purchaseItems: PurchaseItem[] = items.map((it, idx) => ({
      id: `it-${idx}`,
      name: it.name,
      quantity: Number(it.quantity),
      unit: it.unit,
      unitPriceUSD: Number(it.unitPriceUSD),
      totalUSD: Number(it.quantity) * Number(it.unitPriceUSD),
      category: 'General Supplies',
    }));

    const total = calculateTotal();

    addPurchaseOrder({
      companyId: targetCompanyId,
      projectId: targetProjectId,
      requestedBy: currentUser.name,
      requesterRole: currentUser.title,
      supplierName,
      items: purchaseItems,
      subtotalUSD: total,
      taxUSD: 0,
      totalAmountUSD: total,
      currency: 'USD',
      purpose,
      originalLanguage: currentUser.nativeLanguage,
    });

    setIsCreateModalOpen(false);
    setSupplierName('');
    setPurpose('');
  };

  const handleAiAudit = (po: PurchaseOrder) => {
    setIsAuditing(true);
    setTimeout(() => {
      setAiAuditResult(
        `AI Compliance Audit for ${po.poNumber}:\n• Total: $${po.totalAmountUSD.toLocaleString()} USD.\n• Budget Verification: Passed within subsidiary annual allocation.\n• Holding Owner Authorization: STRICT REQUIREMENT before gate release.\n• Supplier Reputation: Verified in KRG Trade Registry.`
      );
      setIsAuditing(false);
    }, 900);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t('navProcurement')} & Supply Chain
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized purchase requisitions with strict Holding Owner digital pre-approval gate.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGateScannerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition transform active:scale-95 cursor-pointer"
          >
            <ScanLine className="w-4 h-4 animate-pulse" />
            <span>{language === 'ku' ? 'سکانی بارکۆدی پسوولە' : 'Scan Barcode Receipt'}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition transform active:scale-95 cursor-pointer"
            id="create-po-btn"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createPurchaseOrder')}</span>
          </button>
        </div>
      </div>

      {/* Holding Rule Mandatory Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-900 text-xs font-medium">
        <Crown className="w-5 h-5 text-amber-600 shrink-0" />
        <span>{t('holdingOwnerRuleBanner')}</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'ALL', labelEn: 'All Requisitions', labelKu: 'هەموو داواکارییەکان' },
          { id: 'STAGE_WAREHOUSE', labelEn: '📦 Awaiting Warehouse (Step 2)', labelKu: '📦 چاوەڕوانی کۆگا (قۆناغی ۲)' },
          { id: 'STAGE_FINANCE', labelEn: '💰 Awaiting Finance (Step 3)', labelKu: '💰 چاوەڕوانی دارایی (قۆناغی ۳)' },
          { id: 'STAGE_GM', labelEn: '🏢 Awaiting GM (Step 4)', labelKu: '🏢 چاوەڕوانی بەڕێوەبەری گشتی (قۆناغی ٤)' },
          { id: 'STAGE_OWNER', labelEn: '👑 Awaiting Holding Owner (Step 5)', labelKu: '👑 چاوەڕوانی خاوەنی هۆڵدینگ (قۆناغی ٥)' },
          { id: 'STAGE_APPROVED', labelEn: '✅ Fully Approved & Ready to Execute', labelKu: '✅ پەسەندکراو و مۆڵەتدراو' },
          { id: 'ARRIVED_AT_GATE', labelEn: '🚚 Arrived at Project Gate', labelKu: '🚚 گەیشتوو بۆ پڕۆژە' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            {language === 'ku' ? tab.labelKu : tab.labelEn}
          </button>
        ))}
      </div>

      {/* PO Cards Grid */}
      <div className="space-y-4">
        {filteredPOs.map((po) => {
          const comp = companies.find(c => c.id === po.companyId);
          const proj = projects.find(p => p.id === po.projectId);
          const isPending = po.status === 'PENDING_OWNER_APPROVAL' || Boolean(po.workflowState?.steps?.some(s => s.status === 'PENDING'));
          const isApproved = po.status === 'APPROVED_BY_OWNER' || isPoFullyApproved(po);
          const isArrived = po.status === 'ARRIVED_AT_GATE' || po.status === 'INSPECTED_AND_STORED';
          const delegation = isPoDelegatedOrAutonomous(po);

          return (
            <div
              key={po.id}
              className={`bg-white border rounded-3xl p-6 shadow-xs space-y-4 transition ${
                delegation.isDelegated ? 'border-amber-400 ring-1 ring-amber-300 bg-amber-50/20' :
                isPending ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20' : isApproved ? 'border-blue-200' : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-base text-slate-900 font-mono">{po.poNumber}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {comp?.name || 'Subsidiary'}
                  </span>
                  {proj && (
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">
                      {proj.name}
                    </span>
                  )}
                  {delegation.isDelegated && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold flex items-center gap-1 shadow-2xs">
                      <Zap className="w-3 h-3 fill-white" />
                      <span>{language === 'ku' ? '⚡ دەسەڵاتی خەرجکردن شۆڕکراوەتەوە' : '⚡ Delegated Authority'}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-emerald-600 font-mono">
                    ${po.totalAmountUSD.toLocaleString()} {po.currency}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    isPending ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse-subtle' :
                    isApproved ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    isArrived ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {po.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Items & Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 font-semibold block">Supplier:</span>
                  <span className="font-bold text-slate-900 text-sm">{po.supplierName}</span>
                  <span className="text-slate-500 block mt-1">Requested by: {po.requestedBy} ({po.requesterRole})</span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block">Purpose / Justification:</span>
                  <p className="text-slate-700 italic mt-0.5 leading-relaxed">"{po.purpose}"</p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block">Items Summary:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 mt-1">
                    {po.items.map((it, idx) => (
                      <li key={idx} className="truncate">
                        {it.quantity} {it.unit} • {it.name} (${it.totalUSD.toLocaleString()})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Strict Execution Authorization Gate */}
              <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                isApproved
                  ? 'bg-emerald-500/10 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-xl text-white shrink-0 ${isApproved ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                    {isApproved ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-extrabold block">
                      {isApproved
                        ? (language === 'ku' ? '🔓 مۆڵەتی جێبەجێکردنی کڕین درا (Execution Authorized)' : '🔓 Purchase Execution Authorized')
                        : (language === 'ku' ? '🔒 ڕاگرتنی جێبەجێکردنی کڕین (Execution Locked)' : '🔒 Purchase Execution Strictly Locked')}
                    </span>
                    <span className="text-[11px] opacity-90 block">
                      {isApproved
                        ? (language === 'ku' ? 'ڕەزامەندی و مۆری خاوەنی هۆڵدینگ دراوە. کڕین و سەرفکردنی پارە لەلایەن بەشی کڕین و دارایی ڕێگەپێدراوە.' : 'Holding Company Owner final seal has been captured. Procurement and finance are authorized to execute order.')
                        : (language === 'ku' ? 'هیچ کڕین و سەرفکردنی پارەیەک ناکرێت تاوەکو ڕەزامەندی و مۆری کۆتایی خاوەنی هۆڵدینگ نەدرێت.' : 'Strict gate: No vendor issuance, cash disbursement, or item entry permitted until final Holding Owner approval.')}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shrink-0 self-start sm:self-auto ${
                  isApproved ? 'bg-emerald-200 text-emerald-900 border border-emerald-300' : 'bg-rose-200 text-rose-900 border border-rose-300'
                }`}>
                  {isApproved ? 'OWNER SEAL ACTIVE' : 'AWAITING HOLDING OWNER'}
                </span>
              </div>

              {/* Approval Workflow Pipeline Stepper */}
              {po.workflowState && (
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 my-2 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      {language === 'ku' ? 'زنجیرەی پەسەندکردنی دارایی ٥ قۆناغی (Sequential 5-Step Approval):' : 'Executive Approval Pipeline (5-Step Sequential):'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {language === 'ku' ? (po.workflowState.chainRuleNameKu || po.workflowState.chainRuleName) : po.workflowState.chainRuleName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                    {po.workflowState.steps.map((st) => {
                      const isDone = st.status === 'APPROVED';
                      const isPending = st.status === 'PENDING';
                      const isCurrentActive = isPending && st.stepNumber === po.workflowState?.currentStepNumber;
                      return (
                        <div
                          key={st.stepNumber}
                          className={`p-2.5 rounded-xl border text-[11px] transition flex flex-col justify-between ${
                            isDone
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                              : isCurrentActive
                              ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs ring-1 ring-blue-300'
                              : 'bg-white border-slate-200 text-slate-500 opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between font-bold mb-1">
                              <span className="flex items-center gap-1">
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : isCurrentActive ? (
                                  <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse shrink-0" />
                                ) : (
                                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-mono shrink-0">
                                    {st.stepNumber}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 font-mono">#{st.stepNumber}</span>
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                                  isDone
                                    ? 'bg-emerald-200 text-emerald-900'
                                    : isCurrentActive
                                    ? 'bg-blue-200 text-blue-900'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {isDone ? (language === 'ku' ? 'تەواو' : 'Approved') : (language === 'ku' ? 'ماوە' : 'Pending')}
                              </span>
                            </div>

                            <p className="font-extrabold text-[11px] leading-tight text-slate-900 mt-1 line-clamp-2">
                              {language === 'ku' ? st.titleKu : st.titleEn}
                            </p>
                          </div>

                          <div className="text-[10px] mt-2 pt-1.5 border-t border-slate-200/60 text-slate-600 flex flex-col gap-0.5">
                            <span className="truncate font-medium">
                              {st.approverName || (st.role === 'HOLDING_OWNER' ? 'خاوەنی هۆڵدینگ (Holding Owner)' : 'Authorized Manager')}
                            </span>
                            {st.actionDate && <span className="font-mono text-[9px] text-slate-400">{st.actionDate}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CEO Pre-Approval Notice Banner */}
              {po.ceoPreApproved && (
                <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-3 my-2 flex items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                      <Crown className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <span className="font-black text-amber-950 block">
                        {language === 'ku' ? '👑 ڕەزامەندی پێشوەختەی سەرۆکایەتی (CEO Pre-Approved)' : '👑 Sovereign CEO Pre-Approval Active'}
                      </span>
                      <span className="text-[11px] text-amber-800 font-medium">
                        {language === 'ku'
                          ? `ڕەزامەندی لەلایەن ${po.ceoPreApprovedBy || 'سەرۆکایەتی'} دراوە. بۆ هاتنە ناو پڕۆژە، تەنها واژۆی بەڕێوەبەری پڕۆژە (PM) یان بەڕێوەبەری کارگێڕی (GM) پێویستە.`
                          : `Pre-approved by ${po.ceoPreApprovedBy || 'Holding Owner'}. Project site entry strictly requires only PM or Admin Manager (GM) sign-off.`}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg shrink-0">
                    GATE CLEARED ON PM/GM
                  </span>
                </div>
              )}

              {/* Automated Project Fund Deduction & Procurement Escrow Allocation */}
              {po.projectFundDeduction && (
                <div className="bg-gradient-to-br from-indigo-50/95 via-white to-purple-50/90 border-2 border-indigo-200 rounded-2xl p-3.5 my-2 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-indigo-950 block">
                          {language === 'ku'
                            ? 'پارەی کەمکراوە لە پڕۆژە و گواستراوە بۆ بەشی کڕین (Procurement Escrow):'
                            : 'Project Fund Deduction Transferred to Procurement:'}
                        </span>
                        <span className="text-[10px] text-indigo-700 font-mono">
                          {po.projectFundDeduction.deductedAt} • {po.projectFundDeduction.projectName}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-black text-sm text-indigo-900 bg-white px-2.5 py-1 rounded-xl border border-indigo-200 shadow-2xs">
                      ${po.projectFundDeduction.amountUSD.toLocaleString()} USD
                    </span>
                  </div>

                  <p className="text-[11px] text-indigo-900/80 leading-relaxed font-medium">
                    {language === 'ku'
                      ? `چونکە شتەکە گەیشت و دارایی هێشتا پارەکەی خەرج نەکردبوو، ئەم بڕە خۆکارانە لە پارەی پڕۆژە کەمکرایەوە و بۆ بەشی کڕین زیادکرا. کاتێک بەشی کڕین دەتوانێت وەریگرێت کە یەک لە بەڕێوەبەرانی پڕۆژە واژۆی بکات.`
                      : `Items arrived at site before treasury payout. Amount was auto-deducted from project budget and credited to Procurement escrow. Procurement can collect funds once a Project Manager signs off.`}
                  </p>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-indigo-100">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {po.projectFundDeduction.procurementStatus === 'HELD_IN_ESCROW' && (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-amber-700" />
                          <span>{language === 'ku' ? '🔒 چاوەڕوانی واژۆی بەڕێوەبەری پڕۆژەیە بۆ ڕادەستکردن' : '🔒 Awaiting Project Manager Sign-off'}</span>
                        </span>
                      )}

                      {po.projectFundDeduction.procurementStatus === 'PM_RELEASE_SIGNED' && (
                        <span className="px-2.5 py-1 rounded-xl bg-blue-100 border border-blue-300 text-blue-900 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                          <span>{language === 'ku' ? `✅ واژۆکرا لەلایەن بەڕێوەبەری پڕۆژە (${po.projectFundDeduction.authorizedByPm})` : `✅ PM Sign-off by ${po.projectFundDeduction.authorizedByPm}`}</span>
                        </span>
                      )}

                      {po.projectFundDeduction.procurementStatus === 'COLLECTED_BY_PROCUREMENT' && (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{language === 'ku' ? '🎉 پارەکە لەلایەن بەشی کڕین وەرگیرا' : '🎉 Successfully Collected by Procurement'}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {po.projectFundDeduction.procurementStatus === 'HELD_IN_ESCROW' && (
                        <button
                          onClick={() => {
                            const res = signPmReleaseForProcurement(po.id);
                            if (!res.success) {
                              alert(res.message);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                          title={language === 'ku' ? 'واژۆکردن وەک بەڕێوەبەری پڕۆژە بۆ ڕادەستکردنی پارە بە کڕین' : 'Sign as PM to release funds to procurement'}
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>{language === 'ku' ? '✍️ واژۆی بەڕێوەبەری پڕۆژە بۆ ڕادەستکردنی پارە' : '✍️ PM Sign-off to Release'}</span>
                        </button>
                      )}

                      {po.projectFundDeduction.procurementStatus === 'PM_RELEASE_SIGNED' && (
                        <button
                          onClick={() => {
                            const res = collectFundsByProcurement(po.id);
                            if (!res.success) alert(res.message);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>{language === 'ku' ? '💰 وەرگرتنی پارە لەلایەن بەشی کڕین' : '💰 Collect Funds (Procurement)'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Delegation decree banner */}
              {delegation.isDelegated && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-xl bg-amber-500 text-white shadow-xs shrink-0 mt-0.5">
                      <Zap className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs text-amber-950">
                          {language === 'ku' ? '⚡ دەسەڵاتی خەرجکردن لە بنکەی سەرەکییەوە شۆڕکراوەتەوە بۆ لقی کۆمپانیا/پڕۆژە' : '⚡ Spending Authority Delegated Downward by HQ'}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
                          {delegation.mandate?.decreeNumber || 'HQ-DECREE'}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        {language === 'ku'
                          ? `بنکەی سەرەکی دەسەڵاتی تەواوی بەخشیوە بە کۆمپانیا/پڕۆژە بۆ بڕیاردان لەسەر ئەم خەرجییە بەبێ گەڕانەوە بۆ بنکەی سەرەکی. واژۆی بەڕێوەبەری پڕۆژە (PM) یان بەڕێوەبەری کارگێڕی (GM) دەسەڵاتی جێبەجێکردن دەبەخشێت.`
                          : `Holding HQ delegated full spending discretion to this unit without referral back to the CEO. PM or GM sign-off authorizes execution.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Holding Decision Stamp or Gating Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {po.holdingApproval ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
                      <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Approved by <strong>{po.holdingApproval.approvedBy}</strong> ({po.holdingApproval.approvedAt})</span>
                      <span className="font-mono text-[10px] text-slate-500">[{po.holdingApproval.signatureHash}]</span>
                    </div>
                  ) : delegation.isDelegated ? (
                    <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-xl font-bold">
                      <Zap className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
                      <span>
                        {language === 'ku'
                          ? `دەسەڵاتی بڕیاردان شۆڕکراوەتەوە بۆ: ${po.workflowState?.steps?.find(s => s.status === 'PENDING')?.titleKu || 'بەڕێوەبەری مەیدانی'}`
                          : `Delegated to Branch: ${po.workflowState?.steps?.find(s => s.status === 'PENDING')?.titleEn || 'Local Field Manager'}`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-medium">
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                      <span>
                        {language === 'ku'
                          ? `گەیشتۆتە لای: ${po.workflowState?.steps?.find(s => s.status === 'PENDING')?.titleKu || 'خاوەنی هۆڵدینگ (سەرۆکایەتی)'}`
                          : `Currently with: ${po.workflowState?.steps?.find(s => s.status === 'PENDING')?.titleEn || 'Holding Owner Signature'}`}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => setTrackingPo(po)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shadow-2xs"
                  >
                    <PenTool className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'ku' ? 'چاودێری واژۆ و مۆرەکان' : 'Track Approval Journey'}</span>
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>

                  <button
                    onClick={() => setIsGateScannerOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shadow-2xs"
                    title={language === 'ku' ? 'سکانی بارکۆدی ئەم پسوولەیە لە دەروازەی پڕۆژە' : 'Scan this receipt barcode at security gate'}
                  >
                    <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'ku' ? 'سکانی بارکۆدی پسوولە' : 'Scan Barcode'}</span>
                  </button>
                </div>

                {/* Workflow Actions with Sequential Permissions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleAiAudit(po)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>AI Audit</span>
                  </button>

                  {/* CEO Fast-Track Pre-Approval Button for Holding Owner */}
                  {isHoldingApprover && !po.ceoPreApproved && isPending && (
                    <button
                      onClick={() => grantCeoPreApproval(po.id, 'CEO Fast-Track Pre-Approval Authorized')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-xs transition cursor-pointer"
                      title="ڕەزامەندی پێشوەختەی CEO: تەنها واژۆی PM یان GM پێویست دەبێت بۆ هاتنە ناو پڕۆژە"
                    >
                      <Crown className="w-3.5 h-3.5 text-slate-950" />
                      <span>{language === 'ku' ? '👑 ڕەزامەندی پێشوەختەی CEO' : '👑 CEO Pre-Approval'}</span>
                    </button>
                  )}

                  {/* Dedicated Button for Delegating Spending Authority Downwards from HQ */}
                  {isHoldingApprover && !delegation.isDelegated && isPending && (
                    <button
                      onClick={() => {
                        setDelegatingPo(po);
                        setPoDecreeNo(`DEC-HQ-${Math.floor(1000 + Math.random() * 9000)}`);
                        setPoDelegationNotes('بڕیاری سەرۆکایەتی بنکەی سەرەکی: دەسەڵاتی خەرجکردن شۆڕکرایەوە بۆ خوارەوە بۆ کۆمپانیا و پڕۆژە بەبێ پێویستی گەڕانەوە بۆ سەرۆکایەتی (CEO).');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xs transition cursor-pointer"
                      title="شۆڕکردنەوەی دەسەڵاتی خەرجکردن بۆ خوارەوە بەبێ گەڕانەوە بۆ بنکەی سەرەکی"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>{language === 'ku' ? '⚡ شۆڕکردنەوەی دەسەڵات بۆ خوارەوە' : '⚡ Delegate Downward'}</span>
                    </button>
                  )}

                  {isPending && (() => {
                    const activePendingStep = po.workflowState?.steps?.find(s => s.status === 'PENDING');
                    if (!activePendingStep) return null;

                    const auth = canUserApproveWorkflowStep(currentUser, po, activePendingStep.stepNumber);

                    if (auth.allowed) {
                      return (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveWorkflowStep(po.id, activePendingStep.stepNumber, 'APPROVED')}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              {language === 'ku'
                                ? `واژۆکردن وەک (${activePendingStep.titleKu})`
                                : `Sign Step (${activePendingStep.titleEn})`}
                            </span>
                          </button>
                          <button
                            onClick={() => approveWorkflowStep(po.id, activePendingStep.stepNumber, 'REJECTED', 'Rejected during procurement review')}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{t('rejectPurchase')}</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <span>🔒 {language === 'ku' ? `چاوەڕوانی واژۆی (${activePendingStep.titleKu})یە` : `Awaiting (${activePendingStep.titleEn}) sign-off`}</span>
                        </span>
                        {auth.requiresOverride && (
                          <button
                            onClick={() => approveWorkflowStep(po.id, activePendingStep.stepNumber, 'APPROVED', 'Executive Sovereign Override Decree by Holding Chairman', undefined, undefined, true)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="بڕیاری دەسەڵاتداری سەرۆکایەتی بەپەلە"
                          >
                            <Crown className="w-3.5 h-3.5 text-amber-600" />
                            <span>{language === 'ku' ? 'واژۆی دەسەڵاتداری (Override)' : 'Executive Override'}</span>
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {isHoldingApprover && (
                    <button
                      type="button"
                      onClick={() => deletePurchaseOrder(po.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="سڕینەوەی ئەم داواکارییە (Delete PO)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* AI Audit Dialog */}
              {aiAuditResult && (
                <div className="bg-slate-50 rounded-2xl p-4 text-xs font-mono text-slate-800 border border-blue-200 whitespace-pre-line leading-relaxed">
                  {aiAuditResult}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Create PO Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Create Purchase Requisition</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmitPO} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Subsidiary</label>
                  <select
                    value={targetCompanyId}
                    onChange={(e) => setTargetCompanyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  >
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project</label>
                  <select
                    value={targetProjectId}
                    onChange={(e) => setTargetProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier / Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Bayan Industrial Supplies Ltd"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purpose / Justification</label>
                <textarea
                  rows={2}
                  required
                  placeholder="State the operational reason for this procurement..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Items & Materials</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    + Add Item
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                      className="col-span-5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                      className="col-span-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2 py-1.5 text-xs focus:bg-white focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                      className="col-span-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2 py-1.5 text-xs focus:bg-white focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Price $"
                      value={item.unitPriceUSD}
                      onChange={(e) => handleUpdateItem(idx, 'unitPriceUSD', Number(e.target.value))}
                      className="col-span-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2 py-1.5 text-xs font-mono focus:bg-white focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="col-span-1 text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-sm font-extrabold text-emerald-600 font-mono">
                  Total: ${calculateTotal().toLocaleString()} USD
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                  >
                    Submit for Holding Owner Approval
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PO Specific Delegation Decree Modal */}
      {delegatingPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-300 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-amber-500 text-white shadow-xs">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {language === 'ku' ? '⚡ شۆڕکردنەوەی دەسەڵاتی خەرجکردن بۆ خوارەوە' : '⚡ Delegate Authority Downward'}
                  </h3>
                  <span className="text-xs font-mono font-bold text-amber-700">{delegatingPo.poNumber} • ${delegatingPo.totalAmountUSD.toLocaleString()} USD</span>
                </div>
              </div>
              <button onClick={() => setDelegatingPo(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'ku'
                  ? 'بە دەرکردنی ئەم فەرمانە، سەرۆکایەتی هۆڵدینگ دەسەڵاتی بڕیاردان لەسەر ئەم خەرجییە دەبەخشێت بە بەڕێوەبەری کۆمپانیا/پڕۆژە تاوەکو خۆیان بڕیاردەری کۆتایی بن بەبێ ئەوەی پێویست بکات بگەڕێنەوە بۆ بنکەی سەرەکی.'
                  : 'Holding HQ delegates full spending discretion downwards to the company/project manager, eliminating the need to refer back to Headquarters.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ku' ? 'ژمارەی فەرمانی سەرۆکایەتی (Decree Number):' : 'Decree Number:'}
                </label>
                <input
                  type="text"
                  value={poDecreeNo}
                  onChange={(e) => setPoDecreeNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ku' ? 'ڕێنمایی و ڕەزامەندی شۆڕکردنەوە (Directives / Notes):' : 'Directives & Notes:'}
                </label>
                <textarea
                  rows={3}
                  value={poDelegationNotes}
                  onChange={(e) => setPoDelegationNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 space-y-0.5">
                <div className="font-bold flex items-center gap-1 text-amber-950">
                  <Zap className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
                  <span>{language === 'ku' ? 'ئاگاداری بۆ هاتنە ناو پڕۆژە و کۆگا:' : 'Gate & Warehouse Direct Clearance:'}</span>
                </div>
                <p>
                  {language === 'ku'
                    ? 'ئەم فەرمانە وا دەکات خاوەنی هۆڵدینگ وەک پەسەندکراو/شاندراو تۆمار بکرێت و تەنها واژۆی بەڕێوەبەری پڕۆژە یان بەڕێوەبەری کارگێڕی بەس بێت بۆ هێنانی کەرەستە و هەموو قۆناغەکان.'
                    : 'The Holding Owner approval step will be satisfied as delegated, and local PM or GM sign-off will immediately authorize site entry and warehouse receipt.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDelegatingPo(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
              >
                {language === 'ku' ? 'پەشیمانبوونەوە' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  delegatePoSpendingAuthority(delegatingPo.id, poDelegationNotes, poDecreeNo);
                  setDelegatingPo(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{language === 'ku' ? '⚡ دەرکردنی فەرمانی شۆڕکردنەوە' : 'Execute Delegation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Approval Journey Modal */}
      <RequestApprovalJourneyModal
        isOpen={Boolean(trackingPo)}
        onClose={() => setTrackingPo(null)}
        purchaseOrder={trackingPo}
      />
    </div>
  );
};
