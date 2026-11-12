import React from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Crown,
  Building2,
  ShieldCheck,
  ArrowRight,
  ArrowDown,
  User,
  PenTool,
  Stamp,
  Printer,
  FileText,
  BadgeCheck,
  Share2,
  Send,
  Zap,
  Lock,
  Boxes
} from 'lucide-react';
import { PurchaseOrder } from '../../types/erp';
import { WorkflowActiveStepState } from '../../types/workflow';
import { useLanguage } from '../../context/LanguageContext';
import { useERP } from '../../context/ERPContext';
import { getUIText } from '../../utils/langHelper';

interface RequestApprovalJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder | null;
  onOpenPrint?: (po: PurchaseOrder) => void;
}

export const RequestApprovalJourneyModal: React.FC<RequestApprovalJourneyModalProps> = ({
  isOpen,
  onClose,
  purchaseOrder,
  onOpenPrint
}) => {
  const { language, isRtl } = useLanguage();
  const { currentUser, canUserApproveWorkflowStep, approveWorkflowStep, delegatePoSpendingAuthority } = useERP();
  const [activeComment, setActiveComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen || !purchaseOrder) return null;

  const wf = purchaseOrder.workflowState;
  const steps: WorkflowActiveStepState[] = wf?.steps || [
    {
      stepNumber: 1,
      role: 'PROJECT_MANAGER',
      titleEn: 'Project Site Requisition & Scope Validation',
      titleKu: 'پشتڕاستکردنەوەی بەڕێوەبەری پڕۆژە (داواکاری مەیدانی)',
      titleAr: 'تحقق مدير المشروع ومطابقة الحاجة الميدانية',
      approverName: purchaseOrder.requestedBy || 'Project Manager',
      status: 'APPROVED',
      actionDate: purchaseOrder.createdDate,
      comments: 'Technical scope, quantity justification & bill of quantities verified',
      signatureHash: 'SIG-PM-INIT-VERIFIED'
    },
    {
      stepNumber: 2,
      role: 'WAREHOUSE_OFFICER',
      titleEn: 'Warehouse Stock & Inventory Availability Clearance',
      titleKu: 'پشکنینی کۆگا و نەبوونی کەلوپەل لە بەردەست (بەرپرسی کۆگا)',
      titleAr: 'تدقيق مسؤول المستودع والتأكد من عدم توفر المواد بالمخزون',
      approverName: 'Warehouse Officer',
      status: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'APPROVED' : 'PENDING',
      actionDate: purchaseOrder.status === 'APPROVED_BY_OWNER' ? purchaseOrder.createdDate : undefined,
      comments: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'Cleared: zero available buffer stock in central warehouse' : undefined,
      signatureHash: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'SIG-WH-STOCK-CLEARED' : undefined
    },
    {
      stepNumber: 3,
      role: 'FINANCE_HEAD',
      titleEn: 'Finance & Budget Allocation Review',
      titleKu: 'پێداچوونەوەی دارایی و دیاریکردنی بودجەی شایستە',
      titleAr: 'مراجعة الإدارة المالية والتحقق من الموازنة',
      approverName: 'Finance Head / Cost Controller',
      status: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'APPROVED' : 'PENDING',
      actionDate: purchaseOrder.status === 'APPROVED_BY_OWNER' ? purchaseOrder.createdDate : undefined,
      comments: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'Audited: project fund code and expenditure line allocated' : undefined,
      signatureHash: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'SIG-FIN-BUDGET-CONFIRMED' : undefined
    },
    {
      stepNumber: 4,
      role: 'GENERAL_MANAGER',
      titleEn: 'Subsidiary General Manager Endorsement',
      titleKu: 'پێداچوونەوەی بەڕێوەبەری گشتی کۆمپانیا (GM)',
      titleAr: 'موافقة وتزكية المدير العام للشركة',
      approverName: 'Company General Manager',
      status: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'APPROVED' : 'PENDING',
      actionDate: purchaseOrder.status === 'APPROVED_BY_OWNER' ? purchaseOrder.createdDate : undefined,
      comments: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'Endorsed for final executive authorization' : undefined,
      signatureHash: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'SIG-GM-ENDORSED' : undefined
    },
    {
      stepNumber: 5,
      role: 'HOLDING_OWNER',
      titleEn: 'Holding Company Owner Final Executive Approval & Seal',
      titleKu: 'واژۆ و مۆری کۆتایی خاوەنی هۆڵدینگ (مەرجی جێبەجێکردن)',
      titleAr: 'موافقة وختم مالك المجموعة النهائي (شرط التنفيذ)',
      approverName: purchaseOrder.holdingApproval?.approvedBy || 'Holding Owner',
      status: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'APPROVED' : 'PENDING',
      actionDate: purchaseOrder.holdingApproval?.approvedAt,
      comments: purchaseOrder.holdingApproval?.comments,
      signatureHash: purchaseOrder.holdingApproval?.signatureHash
    }
  ];

  // Determine which step it currently is at
  const currentStep = steps.find(s => s.status === 'PENDING') || steps[steps.length - 1];
  const isFullyApproved = purchaseOrder.status === 'APPROVED_BY_OWNER' || steps.every(s => s.status === 'APPROVED' || s.status === 'DELEGATED_TO_BRANCH');
  const isRejected = purchaseOrder.status === 'REJECTED_BY_OWNER' || steps.some(s => s.status === 'REJECTED');

  const approvedSteps = steps.filter(s => s.status === 'APPROVED' || s.status === 'DELEGATED_TO_BRANCH');
  const pendingSteps = steps.filter(s => s.status === 'PENDING');

  const progressPercent = isFullyApproved
    ? 100
    : isRejected
    ? 100
    : Math.round((approvedSteps.length / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl text-slate-800 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <FileText className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                  {purchaseOrder.poNumber}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isFullyApproved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : isRejected
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/30 animate-pulse'
                }`}>
                  {isFullyApproved
                    ? (language === 'ku' ? 'ڕەزامەندی تەواوی دراوە ✅' : 'Fully Approved & Sealed')
                    : isRejected
                    ? (language === 'ku' ? 'داواکاری ڕەتکراوەتەوە ❌' : 'Rejected')
                    : (language === 'ku' ? 'لە ڕێڕەوی پەسەندکردندایە ⏳' : 'In Approval Pipeline')}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-white mt-1">
                {language === 'ku'
                  ? 'ڕێڕەوی چاودێری داواکاری: گەیشتۆتە لای کێ و کێ ماوە واژووی بکات؟'
                  : language === 'ar'
                  ? 'مسار متابعة الطلب: عند من وصل ومن بقي ليوقع بالموافقة؟'
                  : 'Request Lifecycle Tracker: Current Holder & Remaining Approvers'}
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                {purchaseOrder.purpose} • <strong className="font-mono">${purchaseOrder.totalAmountUSD.toLocaleString()} USD</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>
              {language === 'ku' ? 'ڕێژەی تەواوبوونی قۆناغەکانی پەسەندکردن:' : 'Approval Pipeline Progress:'}
            </span>
            <span className="font-mono text-blue-600 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isFullyApproved ? 'bg-emerald-500' : isRejected ? 'bg-rose-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Strict Execution Authorization Gate */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            isFullyApproved
              ? 'bg-emerald-500/10 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div className={`p-2 rounded-xl text-white shrink-0 ${isFullyApproved ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              {isFullyApproved ? <BadgeCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-sm">
                  {isFullyApproved
                    ? (language === 'ku' ? 'مۆڵەتی جێبەجێکردنی کڕین دراوە (Execution Authorized)' : 'Purchase Execution Authorized')
                    : (language === 'ku' ? 'ڕاگرتنی فەرمی کڕین (Execution Locked)' : 'Purchase Execution Strictly Locked')}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isFullyApproved ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                }`}>
                  {isFullyApproved ? 'OWNER SEAL ACTIVE' : 'AWAITING HOLDING OWNER'}
                </span>
              </div>
              <p className="text-xs mt-1 leading-relaxed">
                {isFullyApproved
                  ? (language === 'ku'
                      ? 'ڕەزامەندی و مۆری کۆتایی خاوەنی هۆڵدینگ تەواو بووە. بەشی کڕین و دارایی و کۆگا مۆڵەتی تەواویان هەیە بۆ دەرکردنی فەرمانی کڕین و سەرفکردنی پارە.'
                      : 'Holding Company Owner final seal has been captured. Procurement, finance and inventory teams are authorized to issue PO to vendor and disburse funds.')
                  : (language === 'ku'
                      ? 'بەپێی یاسای سیستەمی SAS4ERP، هیچ کڕین و سەرفکردنی پارەیەک ناکرێت تاوەکو خاوەنی هۆڵدینگ (Holding Owner) ڕەزامەندی و مۆری کۆتایی نەدات.'
                      : 'Under SAS4ERP governance, no purchase may be executed, vendor PO issued, or payment disbursed until the Holding Company Owner provides final seal.')}
              </p>
            </div>
          </div>

          {/* Key Answers Cards: Currently At & Remaining Approvers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Currently At */}
            <div className={`p-4 rounded-2xl border ${
              isFullyApproved
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : isRejected
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-blue-50/80 border-blue-200 text-blue-900'
            }`}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{language === 'ku' ? '📍 ئێستا داواکارییەکە لە لای کێیە؟' : '📍 Current Approval Location:'}</span>
              </div>
              <div className="text-sm font-extrabold">
                {isFullyApproved ? (
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <BadgeCheck className="w-5 h-5 text-emerald-600" />
                    {language === 'ku' ? 'کۆتایی هاتووە (هەموو واژۆکان تەواو بوون)' : 'Completed (All signatures captured)'}
                  </span>
                ) : isRejected ? (
                  <span className="text-rose-700">
                    {language === 'ku' ? 'داواکاری ڕەتکرایەوە لە لایەن خاوەنی هۆڵدینگ' : 'Request rejected by Holding Owner'}
                  </span>
                ) : (
                  <div className="space-y-1">
                    <div className="text-blue-950 font-bold text-base flex items-center gap-2">
                      {currentStep.role === 'HOLDING_OWNER' && <Crown className="w-5 h-5 text-amber-500 shrink-0" />}
                      {currentStep.role === 'GENERAL_MANAGER' && <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />}
                      <span>
                        {language === 'ku' ? currentStep.titleKu : currentStep.titleEn}
                      </span>
                    </div>
                    <p className="text-xs text-blue-800 font-medium">
                      {language === 'ku'
                        ? `چاوەڕوانی واژۆ و بڕیاری: ${currentStep.approverName || 'بەرپرسی دەسەڵاتدار'}`
                        : `Awaiting action from: ${currentStep.approverName || 'Authorized Approver'}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Who is remaining / pending */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1.5 text-amber-900">
                <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{language === 'ku' ? '⏳ کێ ماوە واژووی ڕەزامەندی بکات؟' : '⏳ Pending Remaining Signatures:'}</span>
              </div>
              {pendingSteps.length === 0 ? (
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ku' ? 'هیچ واژۆیەک نەماوە - داواکاری بەتەواوی پەسەند کراوە!' : 'None remaining - Full authorization achieved!'}</span>
                </div>
              ) : (
                <div className="space-y-1.5 mt-1">
                  {pendingSteps.map((s, idx) => (
                    <div key={s.stepNumber} className="flex items-center justify-between text-xs bg-white/80 p-2 rounded-xl border border-amber-200/80">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-mono">
                          {idx + 1}
                        </span>
                        <span>{language === 'ku' ? s.titleKu : s.titleEn}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {language === 'ku' ? 'ماوە' : 'Pending'}
                      </span>
                    </div>
                  ))}
                  {purchaseOrder.totalAmountUSD > 50000 && pendingSteps.some(s => s.role === 'HOLDING_OWNER') && (
                    <span className="text-[10px] text-amber-700 block mt-1 font-medium">
                      * {language === 'ku' ? 'چونکە بڕی داواکارییەکە سەروو $50,000 دۆلارە، واژۆی خاوەنی هۆڵدینگ مەرجە.' : 'Exceeds $50,000 threshold: Requires Holding Chairman signature.'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Stepper Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>{language === 'ku' ? 'هێڵی زەمەنی وردی قۆناغەکانی واژۆ و پەسەندکردن:' : 'Detailed Step-by-Step Approval Timeline:'}</span>
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {steps.map((step, idx) => {
                const isStepApproved = step.status === 'APPROVED';
                const isStepDelegated = step.status === 'DELEGATED_TO_BRANCH';
                const isStepCurrent = step.status === 'PENDING' && currentStep.stepNumber === step.stepNumber;
                const isStepPending = step.status === 'PENDING' && !isStepCurrent;
                const isStepRejected = step.status === 'REJECTED';

                return (
                  <div key={step.stepNumber} className="relative flex items-start gap-4">
                    {/* Step Icon Badge */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                        isStepApproved
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                          : isStepDelegated
                          ? 'bg-amber-500 text-white ring-4 ring-amber-100 shadow-sm'
                          : isStepCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                          : isStepRejected
                          ? 'bg-rose-500 text-white ring-4 ring-rose-50'
                          : 'bg-slate-300 text-slate-600 ring-4 ring-slate-100'
                      }`}
                    >
                      {isStepApproved ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isStepDelegated ? (
                        <Zap className="w-3.5 h-3.5 fill-white" />
                      ) : isStepRejected ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <span>{step.stepNumber}</span>
                      )}
                    </div>

                    {/* Step Details Box */}
                    <div className={`flex-1 p-4 rounded-2xl border transition ${
                      isStepCurrent
                        ? 'bg-blue-50/70 border-blue-300 shadow-sm'
                        : isStepDelegated
                        ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                        : isStepApproved
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-50/40 border-slate-200/60 opacity-80'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">
                            {language === 'ku' ? step.titleKu : step.titleEn}
                          </span>
                          {step.role === 'HOLDING_OWNER' && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                              <Crown className="w-3 h-3 text-amber-600" />
                              {language === 'ku' ? 'خاوەنی هۆڵدینگ' : 'Owner Authority'}
                            </span>
                          )}
                        </div>

                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                          isStepApproved
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isStepDelegated
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1'
                            : isStepCurrent
                            ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isStepApproved
                            ? (language === 'ku' ? 'واژوو کرا' : 'Signed & Approved')
                            : isStepDelegated
                            ? (language === 'ku' ? '⚡ شۆڕکراوەتەوە بۆ لقی مەیدانی (بێ HQ)' : '⚡ Delegated to Branch')
                            : isStepCurrent
                            ? (language === 'ku' ? 'ئێستا لێرەیە (چاوەڕوانە)' : 'Awaiting Action Now')
                            : (language === 'ku' ? 'ماوە' : 'Pending')}
                        </span>
                      </div>

                      {/* Approver Person & Timestamp */}
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <strong className="text-slate-800">
                            {step.approverName || (step.role === 'HOLDING_OWNER' ? 'خاوەنی هۆڵدینگ (Holding Owner)' : 'Authorized Manager')}
                          </strong>
                        </span>
                        {step.actionDate && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            📅 {step.actionDate}
                          </span>
                        )}
                      </div>

                      {/* Comments / Notes */}
                      {step.comments && (
                        <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 mt-2 font-medium">
                          💬 "{step.comments}"
                        </p>
                      )}

                      {/* Action Bar for Pending Current Step */}
                      {step.status === 'PENDING' && (() => {
                        const check = canUserApproveWorkflowStep(currentUser, purchaseOrder, step.stepNumber);
                        return (
                          <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                            {check.allowed ? (
                              <div className="bg-white p-3 rounded-2xl border border-blue-200 space-y-2 shadow-2xs">
                                <div className="text-[11px] font-bold text-blue-900 flex items-center justify-between">
                                  <span>{language === 'ku' ? `تۆ وەک (${currentUser.title || currentUser.role}) دەسەڵاتی واژۆت هەیە:` : `Authorized to sign as (${currentUser.title || currentUser.role}):`}</span>
                                </div>
                                <input
                                  type="text"
                                  placeholder={language === 'ku' ? 'تێبینی یان ڕوونکردنەوەی فەرمی (ئارەزوومەندانە)...' : 'Official comments or sign-off notes (optional)...'}
                                  value={activeComment}
                                  onChange={(e) => setActiveComment(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                                />
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    disabled={isSubmitting}
                                    onClick={async () => {
                                      setIsSubmitting(true);
                                      approveWorkflowStep(purchaseOrder.id, step.stepNumber, 'APPROVED', activeComment);
                                      setIsSubmitting(false);
                                      onClose();
                                    }}
                                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{language === 'ku' ? 'واژۆ و پەسەندکردنی ئەم قۆناغە' : 'Approve & Sign Step'}</span>
                                  </button>
                                    <button
                                      disabled={isSubmitting}
                                      onClick={async () => {
                                        setIsSubmitting(true);
                                        approveWorkflowStep(purchaseOrder.id, step.stepNumber, 'REJECTED', activeComment || 'Rejected by approver');
                                        setIsSubmitting(false);
                                        onClose();
                                      }}
                                      className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                                    >
                                      <X className="w-4 h-4" />
                                      <span>{language === 'ku' ? 'ڕەتکردنەوە' : 'Reject'}</span>
                                    </button>

                                    {(step.role === 'HOLDING_OWNER' || step.role === 'HOLDING_VP') && (currentUser.role === 'HOLDING_OWNER' || currentUser.role === 'SUPER_ADMIN') && (
                                      <button
                                        disabled={isSubmitting}
                                        type="button"
                                        onClick={() => {
                                          delegatePoSpendingAuthority(purchaseOrder.id, activeComment || 'شۆڕکردنەوەی دەسەڵاتی خەرجکردن بۆ کۆمپانیا/پڕۆژە بەبێ گەڕانەوە بۆ بنکەی سەرەکی');
                                          onClose();
                                        }}
                                        className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                                        title="شۆڕکردنەوەی دەسەڵاتی خەرجکردن بۆ خوارەوە بەبێ گەڕانەوە بۆ بنکەی سەرەکی"
                                      >
                                        <Zap className="w-4 h-4 fill-white" />
                                        <span>{language === 'ku' ? '⚡ شۆڕکردنەوە بۆ خوارەوە' : '⚡ Delegate Down'}</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                            ) : (
                              <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                  <p className="font-semibold">{language === 'ku' ? check.reasonKu : check.reasonEn}</p>
                                  {check.requiresOverride && (
                                    <button
                                      onClick={() => {
                                        approveWorkflowStep(purchaseOrder.id, step.stepNumber, 'APPROVED', activeComment || 'Holding Owner Sovereign Override Decree', undefined, undefined, true);
                                        onClose();
                                      }}
                                      className="mt-1 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1 transition cursor-pointer shadow-xs"
                                    >
                                      <Crown className="w-3.5 h-3.5" />
                                      <span>{language === 'ku' ? 'بڕیاری دەسەڵاتداری بەپەلەی خاوەن هۆلدینگ (Executive Override)' : 'Apply Executive Sovereign Override'}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Cryptographic Signature Stamp if Approved */}
                      {isStepApproved && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 text-emerald-700 font-mono">
                            <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{step.signatureHash || `SIG-VERIFIED-${purchaseOrder.id.slice(-6).toUpperCase()}`}</span>
                          </div>
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <Stamp className="w-3 h-3 text-emerald-600" />
                            {language === 'ku' ? 'مۆری ئەلیکترۆنی دانراوە' : 'Digitally Sealed'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>
              {language === 'ku'
                ? 'ئەم ڕێڕەوە ڕاستەوخۆ بە کاتی ڕاستەقینە نوێ دەبێتەوە'
                : 'This tracking journey is updated in real time across the holding cloud'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenPrint && (
              <button
                onClick={() => onOpenPrint(purchaseOrder)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'ku' ? 'چاپکردنی پسوولەی بەدواداچوون' : 'Print Tracking Slip'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-xs"
            >
              {language === 'ku' ? 'داخستن' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
