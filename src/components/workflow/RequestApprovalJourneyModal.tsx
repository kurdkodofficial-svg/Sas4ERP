import React from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Crown,
  Building2,
  ShieldCheck,
  User,
  PenTool,
  Stamp,
  Printer,
  FileText,
  BadgeCheck,
  Lock,
  Boxes,
  Wallet
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
  const { currentUser, canUserApproveWorkflowStep, approveWorkflowStep, isPoFullyApproved } = useERP();
  const [activeComment, setActiveComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen || !purchaseOrder) return null;

  const wf = purchaseOrder.workflowState;
  const deptLabel = getUIText(language, {
    ku: purchaseOrder.departmentNameKu || 'بەشی پەیوەندیدار لە کۆمپانیا',
    ar: purchaseOrder.departmentNameAr || 'القسم المختص بالشركة',
    en: purchaseOrder.departmentName || 'Company Department',
  });

  const steps: WorkflowActiveStepState[] = wf?.steps || [
    {
      stepNumber: 1,
      role: 'DEPARTMENT_HEAD',
      titleEn: `Department Approval (${purchaseOrder.departmentName || 'Department'})`,
      titleKu: `ڕەزامەندی بەش (${purchaseOrder.departmentNameKu || 'بەشی پەیوەندیدار'})`,
      titleAr: 'موافقة القسم المختص داخل الشركة',
      approverName: purchaseOrder.requestedBy || getUIText(language, { ku: 'سەرۆکی بەش', ar: 'رئيس القسم', en: 'Department Head' }),
      status: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'APPROVED' : 'PENDING',
      actionDate: purchaseOrder.status === 'APPROVED_BY_OWNER' ? purchaseOrder.createdDate : undefined,
      comments: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'پێداچوونەوەی تەکنیکی و بڕی پێویست لەلایەن بەشەوە پەسەندکرا' : undefined,
      signatureHash: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'SIG-DEPT-VERIFIED' : undefined
    },
    {
      stepNumber: 2,
      role: 'GENERAL_MANAGER',
      titleEn: 'Company Manager Approval',
      titleKu: 'پەسەندکردنی بەڕێوەبەری کۆمپانیا',
      titleAr: 'موافقة مدير الشركة',
      approverName: getUIText(language, { ku: 'بەڕێوەبەری کۆمپانیا', ar: 'مدير الشركة', en: 'Company General Manager' }),
      status: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'APPROVED' : 'PENDING',
      actionDate: purchaseOrder.status === 'APPROVED_BY_OWNER' ? purchaseOrder.createdDate : undefined,
      comments: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'پەسەندکرا لە ئاستی کارگێڕی کۆمپانیا' : undefined,
      signatureHash: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'SIG-GM-ENDORSED' : undefined
    },
    {
      stepNumber: 3,
      role: 'HOLDING_OWNER',
      titleEn: 'Holding Owner Final Approval & Seal',
      titleKu: 'واژۆ و مۆری کۆتایی خاوەنی هۆڵدینگ',
      titleAr: 'الموافقة النهائية وختم مالك القابضة',
      approverName: purchaseOrder.holdingApproval?.approvedBy || getUIText(language, { ku: 'خاوەنی هۆڵدینگ', ar: 'مالك القابضة', en: 'Holding Owner' }),
      status: purchaseOrder.status === 'APPROVED_BY_OWNER' ? 'APPROVED' : 'PENDING',
      actionDate: purchaseOrder.holdingApproval?.approvedAt,
      comments: purchaseOrder.holdingApproval?.comments,
      signatureHash: purchaseOrder.holdingApproval?.signatureHash
    }
  ];

  const currentStep = steps.find(s => s.status === 'PENDING') || steps[steps.length - 1];
  const isRejected = purchaseOrder.status === 'REJECTED_BY_OWNER' || steps.some(s => s.status === 'REJECTED');
  const isFullyApproved = !isRejected && (isPoFullyApproved(purchaseOrder) || steps.every(s => s.status === 'APPROVED'));

  const approvedSteps = steps.filter(s => s.status === 'APPROVED');
  const pendingSteps = steps.filter(s => s.status === 'PENDING');

  const progressPercent = isFullyApproved || isRejected
    ? 100
    : Math.round((approvedSteps.length / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-xl text-slate-800 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-start justify-between gap-4 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
                <span className="font-mono font-bold text-white">{purchaseOrder.poNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{deptLabel}</span>
                <span aria-hidden="true">·</span>
                <span className={
                  isFullyApproved
                    ? 'text-emerald-400 font-semibold'
                    : isRejected
                    ? 'text-rose-400 font-semibold'
                    : 'text-amber-300 font-semibold'
                }>
                  {isFullyApproved
                    ? getUIText(language, { ku: 'ڕەزامەندی تەواو دراوە', ar: 'معتمد نهائياً', en: 'Finalized & Authorized' })
                    : isRejected
                    ? getUIText(language, { ku: 'داواکاری ڕەتکراوەتەوە', ar: 'مرفوض', en: 'Halted / Rejected' })
                    : getUIText(language, {
                        ku: `قۆناغی ${currentStep.stepNumber} لە ${steps.length}`,
                        ar: `المرحلة ${currentStep.stepNumber} من ${steps.length}`,
                        en: `Tier ${currentStep.stepNumber} of ${steps.length}`
                      })}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {getUIText(language, {
                  ku: 'ڕێڕەوی ٣ قۆناغی پەسەندکردنی کڕین (بەش ← بەڕێوەبەر ← خاوەن هۆڵدینگ)',
                  ar: 'مسار اعتماد المشتريات ثلاثي المراحل',
                  en: '3-Tier Sequential Procurement Approval Chain'
                })}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 tabular-nums">
                {purchaseOrder.purpose} · <span className="font-mono font-semibold text-white">${purchaseOrder.totalAmountUSD.toLocaleString()} {purchaseOrder.currency}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
            aria-label={getUIText(language, { ku: 'داخستن', ar: 'إغلاق', en: 'Close modal' })}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>
              {getUIText(language, {
                ku: 'پێشکەوتنی ڕەزامەندی زنجیرەیی (بێ تێپەڕاندن):',
                ar: 'تقدم الموافقات المتسلسلة:',
                en: 'Sequential Multi-Level Consent Progress:'
              })}
            </span>
            <span className="font-mono tabular-nums text-slate-900 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isFullyApproved ? 'bg-emerald-600' : isRejected ? 'bg-rose-600' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[68vh] overflow-y-auto">
          {/* Governance Enforcement Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isFullyApproved
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : isRejected
              ? 'bg-rose-50/80 border-rose-200 text-rose-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}>
            <div className={`p-2 rounded-lg text-white shrink-0 ${
              isFullyApproved ? 'bg-emerald-600' : isRejected ? 'bg-rose-600' : 'bg-amber-600'
            }`}>
              {isFullyApproved ? <BadgeCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-sm">
                {isFullyApproved
                  ? getUIText(language, { ku: 'کڕین و سەرفکردنی دارایی مۆڵەتدراوە', ar: 'تم اعتماد الشراء والصرف المالي', en: 'Purchase Finalized & Treasury / Gate Unlocked' })
                  : isRejected
                  ? getUIText(language, { ku: 'داواکاری کڕین ڕاگیراوە و تەرخانکردنی دارایی هەڵوەشێندرایەوە', ar: 'تم إيقاف الطلب وتحرير الحجز المالي', en: 'Purchase Halted — Encumbrance Released' })
                  : getUIText(language, { ku: 'جێبەجێکردن قفڵە تا هەموو قۆناغەکان پەسەند دەکرێن', ar: 'التنفيذ مقفل لحين اكتمال جميع الموافقات', en: 'Finalization Locked Pending Multi-Level Consent' })}
              </div>
              <p className="mt-0.5 text-slate-700">
                {isFullyApproved
                  ? getUIText(language, {
                      ku: 'هەر سێ قۆناغ (بەش، بەڕێوەبەری کۆمپانیا، خاوەنی هۆڵدینگ) پەسەندیان داوە. کۆگا و دارایی دەتوانن مامەڵەکە تەواو بکەن.',
                      ar: 'وافقت جميع المستويات الثلاثة. يمكن للمستودع والمالية إتمام الاستلام والصرف.',
                      en: 'Department, Company Manager, and Holding Owner have sequentially consented. Warehouse receiving and Finance disbursement are authorized.'
                    })
                  : isRejected
                  ? getUIText(language, {
                      ku: 'بەهۆی ڕەتکردنەوە لە یەکێک لە قۆناغەکاندا، کڕینەکە ئەنجام نادرێت و کۆگا یان دارایی ناتوانن جێبەجێی بکەن.',
                      ar: 'تم الرفض في إحدى المراحل، لذا تبقى إجراءات المستودع والمالية متوقفة.',
                      en: 'Rejected inside the approval chain. Inventory entry and Finance payout remain permanently blocked.'
                    })
                  : getUIText(language, {
                      ku: 'ناتوانرێت هیچ قۆناغێک تێپەڕێندرێت. دەبێت سەرەتا بەش، پاشان بەڕێوەبەری کۆمپانیا، و لە کۆتاییدا خاوەنی هۆڵدینگ پەسەندی بکەن.',
                      ar: 'لا يمكن تخطي أي مستوى: القسم المختص ثم مدير الشركة ثم مالك القابضة.',
                      en: 'Strict sequential consent enforced: Department → Company Manager → Holding Owner. Higher tiers cannot approve before lower tiers sign.'
                    })}
              </p>
            </div>
          </div>

          {/* Inventory & Finance Sync Strip */}
          {(purchaseOrder.inventorySync || purchaseOrder.financeSync) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Boxes className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{getUIText(language, { ku: 'پەیوەندی لەگەڵ کۆگا', ar: 'مزامنة المستودع', en: 'Inventory Module Sync' })}</span>
                </div>
                <div className="text-xs text-slate-700">
                  <span className="font-semibold">
                    {purchaseOrder.inventorySync?.preCheckStatus === 'LOW_STOCK_RESTOCK'
                      ? getUIText(language, { ku: 'کەمی کۆگا — پێویستی پڕکردنەوە', ar: 'نقص مخزون — إعادة تزويد', en: 'Low Stock Restock' })
                      : purchaseOrder.inventorySync?.preCheckStatus === 'OUT_OF_STOCK'
                      ? getUIText(language, { ku: 'تەواوبوونی کۆگا', ar: 'نفاد المخزون', en: 'Out of Stock' })
                      : purchaseOrder.inventorySync?.preCheckStatus === 'IN_STOCK_SUPPLEMENT'
                      ? getUIText(language, { ku: 'زیادکردنی بڕی کۆگا', ar: 'دعم المخزون الحالي', en: 'Stock Supplement' })
                      : getUIText(language, { ku: 'کەرەستەی نوێی کۆگا', ar: 'صنف مخزني جديد', en: 'New Catalog Item' })}
                  </span>
                  {purchaseOrder.inventorySync?.stockUpdatedOnReceive && (
                    <span className="text-emerald-700 font-semibold">
                      {' · '}{getUIText(language, { ku: 'کۆگا نوێکرایەوە', ar: 'تم التحديث بالمستودع', en: 'Stock Shelved' })}
                    </span>
                  )}
                </div>
                {purchaseOrder.inventorySync?.preCheckSummary && (
                  <p className="text-[11px] text-slate-600 leading-snug">{purchaseOrder.inventorySync.preCheckSummary}</p>
                )}
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{getUIText(language, { ku: 'پەیوەندی لەگەڵ دارایی', ar: 'مزامنة المالية', en: 'Finance Module Sync' })}</span>
                </div>
                <div className="text-xs text-slate-700 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">
                    {purchaseOrder.financeSync?.encumbranceStatus === 'DISBURSED'
                      ? getUIText(language, { ku: 'خەرجکراوە', ar: 'تم الصرف', en: 'Disbursed' })
                      : purchaseOrder.financeSync?.encumbranceStatus === 'COMMITTED_APPROVED'
                      ? getUIText(language, { ku: 'پەسەندکراو بۆ پارەدان', ar: 'معتمد للصرف', en: 'Committed Approved' })
                      : purchaseOrder.financeSync?.encumbranceStatus === 'RELEASED_REJECTED'
                      ? getUIText(language, { ku: 'تەرخانکراو هەڵوەشێندرایەوە', ar: 'محرر بعد الرفض', en: 'Released / Rejected' })
                      : getUIText(language, { ku: 'بەستراوی چاوەڕوان', ar: 'محجوز بالاعتماد', en: 'Encumbered Pending' })}
                  </span>
                  {purchaseOrder.financeSync?.encumbranceRef && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px] text-slate-600">{purchaseOrder.financeSync.encumbranceRef}</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-600">
                  {purchaseOrder.financeSync?.budgetAvailableUSD !== undefined
                    ? `${getUIText(language, { ku: 'بودجەی بەردەست پێش کڕین:', ar: 'الميزانية المتاحة قبل الطلب:', en: 'Available budget prior to request:' })} $${purchaseOrder.financeSync.budgetAvailableUSD.toLocaleString()} (${
                        purchaseOrder.financeSync.withinBudget
                          ? getUIText(language, { ku: 'لە سنووری بودجەدایە', ar: 'ضمن الميزانية', en: 'Within Budget' })
                          : getUIText(language, { ku: 'زیادە لە بودجە', ar: 'يتجاوز الميزانية', en: 'Exceeds Budget' })
                      })`
                    : getUIText(language, {
                        ku: 'تەرخانکراوی دارایی بەستراوەتەوە بە مۆڵەتی خاوەنی هۆڵدینگ',
                        ar: 'الحجز المالي مرتبط بموافقة مالك القابضة',
                        en: 'Budget encumbrance held pending final approval'
                      })}
                </p>
              </div>
            </div>
          )}

          {/* Current Holder & Remaining Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{getUIText(language, { ku: 'قۆناغی ئێستای داواکاری', ar: 'الجهة الحالية للطلب', en: 'Current Active Holder' })}</span>
              </div>
              {isFullyApproved ? (
                <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 shrink-0" />
                  <span>{getUIText(language, { ku: 'تەواو بووە (هەموو ڕەزامەندییەکان وەرگیراون)', ar: 'مكتمل (تم جمع كافة الموافقات)', en: 'Completed — All 3 Consents Captured' })}</span>
                </div>
              ) : isRejected ? (
                <div className="text-sm font-bold text-rose-700">
                  {getUIText(language, { ku: 'داواکاری ڕەتکراوەتەوە', ar: 'تم إيقاف مسار الطلب (مرفوض)', en: 'Workflow Halted (Rejected)' })}
                </div>
              ) : (
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {currentStep.role === 'HOLDING_OWNER' && <Crown className="w-4 h-4 text-amber-600 shrink-0" />}
                    {currentStep.role === 'GENERAL_MANAGER' && <Building2 className="w-4 h-4 text-blue-600 shrink-0" />}
                    <span>{language === 'ku' ? currentStep.titleKu : language === 'ar' ? (currentStep.titleAr || currentStep.titleEn) : currentStep.titleEn}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {getUIText(language, {
                      ku: `ئاستی ${currentStep.stepNumber} لە ${steps.length}`,
                      ar: `المستوى ${currentStep.stepNumber} من ${steps.length}`,
                      en: `Level ${currentStep.stepNumber} of ${steps.length}`
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>{getUIText(language, { ku: 'قۆناغە ماوەکان', ar: 'الموافقات المتبقية', en: 'Remaining Required Consents' })}</span>
              </div>
              {pendingSteps.length === 0 || isRejected ? (
                <div className="text-xs font-semibold text-slate-700 mt-1">
                  {isRejected
                    ? getUIText(language, { ku: 'ڕاگیراوە — هیچ واژۆیەکی تر وەرناگیرێت.', ar: 'تم الإغلاق بسبب الرفض.', en: 'None — workflow closed on rejection.' })
                    : getUIText(language, { ku: 'هیچ واژۆیەک نەماوە.', ar: 'اكتملت كافة التوقيعات المطلوبة.', en: 'All required signatures completed.' })}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {pendingSteps.map((s) => (
                    <div key={s.stepNumber} className="flex items-center justify-between text-xs text-slate-800">
                      <span className="font-medium truncate">
                        <span className="font-mono text-slate-400 mr-1.5">{s.stepNumber}.</span>
                        {language === 'ku' ? s.titleKu : language === 'ar' ? (s.titleAr || s.titleEn) : s.titleEn}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-700 shrink-0">
                        {getUIText(language, { ku: 'چاوەڕوانە', ar: 'قيد الانتظار', en: 'Pending' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3-Step Sequential Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>{getUIText(language, { ku: 'زنجیرەی واژۆ و پەسەندکردن', ar: 'سلسلة الموافقات المتسلسلة', en: 'Sequential Approval Chain' })}</span>
            </h3>

            <div className="space-y-3">
              {steps.map((step) => {
                const isStepApproved = step.status === 'APPROVED';
                const isStepCurrent = !isRejected && step.status === 'PENDING' && currentStep.stepNumber === step.stepNumber;
                const isStepRejected = step.status === 'REJECTED';

                return (
                  <div
                    key={step.stepNumber}
                    className={`p-4 rounded-xl border transition ${
                      isStepCurrent
                        ? 'bg-blue-50/50 border-blue-300'
                        : isStepApproved
                        ? 'bg-slate-50/70 border-slate-200'
                        : isStepRejected
                        ? 'bg-rose-50/70 border-rose-200'
                        : 'bg-white border-slate-200/80 opacity-85'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isStepApproved
                            ? 'bg-emerald-600 text-white'
                            : isStepCurrent
                            ? 'bg-blue-600 text-white'
                            : isStepRejected
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isStepApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : isStepRejected ? <X className="w-3.5 h-3.5" /> : step.stepNumber}
                        </span>
                        <span className="font-bold text-sm text-slate-900">
                          {language === 'ku' ? step.titleKu : language === 'ar' ? (step.titleAr || step.titleEn) : step.titleEn}
                        </span>
                      </div>

                      <span className={`text-xs font-semibold shrink-0 ${
                        isStepApproved
                          ? 'text-emerald-700'
                          : isStepRejected
                          ? 'text-rose-700'
                          : isStepCurrent
                          ? 'text-blue-700'
                          : 'text-slate-500'
                      }`}>
                        {isStepApproved
                          ? getUIText(language, { ku: 'پەسەندکراو', ar: 'تمت الموافقة', en: 'Approved' })
                          : isStepRejected
                          ? getUIText(language, { ku: 'ڕەتکراوەتەوە', ar: 'مرفوض', en: 'Rejected' })
                          : isStepCurrent
                          ? getUIText(language, { ku: 'قۆناغی چالاک', ar: 'المرحلة النشطة', en: 'Active Tier' })
                          : getUIText(language, { ku: 'چاوەڕوانی قۆناغی پێشوو', ar: 'بانتظار المرحلة السابقة', en: 'Waiting on Prior Tier' })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-800">
                          {step.approverName || getUIText(language, { ku: 'بەرپرسی دەسەڵاتدار', ar: 'المخول بالاعتماد', en: 'Authorized Approver' })}
                        </strong>
                      </span>
                      {step.actionDate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-500">{step.actionDate}</span>
                        </>
                      )}
                      {isStepApproved && step.signatureHash && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-emerald-700 inline-flex items-center gap-1">
                            <Stamp className="w-3 h-3" />
                            {step.signatureHash}
                          </span>
                        </>
                      )}
                    </div>

                    {step.comments && (
                      <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
                        "{step.comments}"
                      </p>
                    )}

                    {/* Sequential Action Box */}
                    {step.status === 'PENDING' && !isRejected && (() => {
                      const check = canUserApproveWorkflowStep(currentUser, purchaseOrder, step.stepNumber);
                      return (
                        <div className="mt-3 pt-3 border-t border-slate-200/80">
                          {check.allowed ? (
                            <div className="space-y-2.5">
                              <div className="text-xs font-semibold text-blue-900">
                                {getUIText(language, {
                                  ku: `پەسەندکردن وەک (${currentUser.title || currentUser.role}):`,
                                  ar: `التوقيع بصفة (${currentUser.title || currentUser.role}):`,
                                  en: `Authorized Sign-Off (${currentUser.title || currentUser.role}):`
                                })}
                              </div>
                              <input
                                type="text"
                                placeholder={getUIText(language, {
                                  ku: 'تێبینی فەرمی (ئارەزوومەندانە)...',
                                  ar: 'ملاحظات رسمية (اختياري)...',
                                  en: 'Official review note (optional)...'
                                })}
                                value={activeComment}
                                onChange={(e) => setActiveComment(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  disabled={isSubmitting}
                                  onClick={() => {
                                    setIsSubmitting(true);
                                    approveWorkflowStep(purchaseOrder.id, step.stepNumber, 'APPROVED', activeComment);
                                    setIsSubmitting(false);
                                    onClose();
                                  }}
                                  className="flex-1 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                                >
                                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                                  <span>{getUIText(language, { ku: 'پەسەندکردنی ئەم قۆناغە', ar: 'اعتماد وتمرير', en: 'Approve & Advance' })}</span>
                                </button>
                                <button
                                  disabled={isSubmitting}
                                  onClick={() => {
                                    setIsSubmitting(true);
                                    approveWorkflowStep(purchaseOrder.id, step.stepNumber, 'REJECTED', activeComment || 'ڕەتکرایەوە لە کاتی پێداچوونەوە');
                                    setIsSubmitting(false);
                                    onClose();
                                  }}
                                  className="py-2 px-4 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                                >
                                  <X className="w-4 h-4 shrink-0" />
                                  <span>{getUIText(language, { ku: 'ڕەتکردنەوە', ar: 'رفض', en: 'Reject' })}</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2 text-xs text-slate-600">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <span>{language === 'ku' ? check.reasonKu : check.reasonEn}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {getUIText(language, {
                ku: 'پەسەندکردنی ٣ قۆناغی یەک لە دوای یەک پێویستە پێش تەواوکردنی کڕین',
                ar: 'موافقة المستويات الثلاثة مطلوبة قبل تنفيذ الشراء والصرف',
                en: 'Mandatory 3-tier consent audited across Procurement, Inventory & Finance'
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenPrint && (
              <button
                onClick={() => onOpenPrint(purchaseOrder)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{getUIText(language, { ku: 'چاپکردن', ar: 'طباعة', en: 'Print' })}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer whitespace-nowrap"
            >
              {getUIText(language, { ku: 'داخستن', ar: 'إغلاق', en: 'Close' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
