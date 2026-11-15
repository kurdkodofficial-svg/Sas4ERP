import React, { useMemo, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  ScanLine,
  ShieldCheck,
  Trash2,
  PenTool,
  ChevronRight,
  Wallet,
  Lock,
  Boxes,
  ArrowDownToLine,
  Coins,
  UserCheck
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { DepartmentCategory, PurchaseOrder, PurchaseItem } from '../types/erp';
import { generateDefaultDepartments } from '../data/departmentsData';
import { getUIText } from '../utils/langHelper';
import { RequestApprovalJourneyModal } from './workflow/RequestApprovalJourneyModal';

const COMPANY_DEPARTMENTS = generateDefaultDepartments('COMPANY', 'Subsidiary', 'Company Manager').map((d) => ({
  category: d.category,
  name: d.name,
  nameKu: d.nameKu,
  nameAr: d.nameAr,
}));

export const ProcurementModule: React.FC = () => {
  const {
    purchaseOrders,
    companies,
    projects,
    warehouseItems,
    addPurchaseOrder,
    deletePurchaseOrder,
    approveWorkflowStep,
    canUserApproveWorkflowStep,
    isPoFullyApproved,
    disbursePoPayment,
    receiveApprovedPoToWarehouse,
    currentUser,
    setCurrentUser,
    userProfiles,
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
  const [targetDeptCategory, setTargetDeptCategory] = useState<DepartmentCategory>('ENGINEERING');
  const [items, setItems] = useState<{ name: string; quantity: number; unit: string; unitPriceUSD: number }[]>([
    { name: 'شیشی تەسلیح 16mm', quantity: 20, unit: 'تۆن', unitPriceUSD: 720 },
  ]);
  const [trackingPo, setTrackingPo] = useState<PurchaseOrder | null>(null);

  const isHoldingAdmin = currentUser.role === 'HOLDING_OWNER' || currentUser.role === 'SUPER_ADMIN';

  const quickTierProfiles = useMemo(() => {
    const deptProfile = userProfiles.find(u => u.role === 'DEPARTMENT_HEAD' || u.role === 'PROJECT_MANAGER');
    const gmProfile = userProfiles.find(u => u.role === 'COMPANY_GM');
    const ownerProfile = userProfiles.find(u => u.role === 'HOLDING_OWNER');
    return [deptProfile, gmProfile, ownerProfile].filter((u): u is NonNullable<typeof u> => Boolean(u));
  }, [userProfiles]);

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      if (currentUser.role === 'PROJECT_MANAGER' && currentUser.projectId && po.projectId !== currentUser.projectId) {
        return false;
      }
      if ((currentUser.role === 'COMPANY_GM' || currentUser.role === 'DEPARTMENT_HEAD') && currentUser.companyId && po.companyId !== currentUser.companyId) {
        return false;
      }
      if (selectedCompanyId !== 'ALL' && po.companyId !== selectedCompanyId) return false;

      if (filterStatus !== 'ALL') {
        const activePending = po.workflowState?.steps?.find(s => s.status === 'PENDING');
        const isRejected = po.status === 'REJECTED_BY_OWNER' || po.workflowState?.finalDecision === 'REJECTED';

        if (filterStatus === 'STAGE_DEPT') {
          if (isRejected || (activePending?.stepNumber !== 1 && activePending?.role !== 'DEPARTMENT_HEAD')) return false;
        } else if (filterStatus === 'STAGE_GM') {
          if (isRejected || (activePending?.stepNumber !== 2 && activePending?.role !== 'GENERAL_MANAGER')) return false;
        } else if (filterStatus === 'STAGE_OWNER') {
          if (isRejected || (activePending?.stepNumber !== 3 && activePending?.role !== 'HOLDING_OWNER')) return false;
        } else if (filterStatus === 'STAGE_APPROVED') {
          if (!isPoFullyApproved(po)) return false;
        } else if (filterStatus === 'REJECTED_BY_OWNER') {
          if (!isRejected) return false;
        } else if (po.status !== filterStatus) {
          return false;
        }
      }

      return true;
    });
  }, [purchaseOrders, currentUser, selectedCompanyId, filterStatus, isPoFullyApproved]);

  const handleAddItemRow = () => {
    setItems(prev => [...prev, { name: '', quantity: 1, unit: getUIText(language, { ku: 'دانە', ar: 'وحدة', en: 'Units' }), unitPriceUSD: 100 }]);
  };

  const handleUpdateItem = (index: number, field: string, value: string | number) => {
    setItems(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, idx) => idx !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPriceUSD)), 0);
  };

  const liveModalPreview = useMemo(() => {
    const matchedStock = items
      .filter(it => it.name.trim().length > 1)
      .map(it => {
        const match = warehouseItems.find(
          w =>
            w.companyId === targetCompanyId &&
            (w.name.toLowerCase().includes(it.name.toLowerCase().trim()) ||
              it.name.toLowerCase().includes(w.name.toLowerCase().trim()))
        ) || warehouseItems.find(
          w =>
            w.name.toLowerCase().includes(it.name.toLowerCase().trim()) ||
            it.name.toLowerCase().includes(w.name.toLowerCase().trim())
        );
        return { itemName: it.name, requestedQty: it.quantity, match };
      });

    const targetComp = companies.find(c => c.id === targetCompanyId);
    const total = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPriceUSD)), 0);
    const remainingBudget = Math.max(0, (targetComp?.allocatedBudgetUSD || 0) - (targetComp?.spentUSD || 0));
    const withinBudget = targetComp ? total <= remainingBudget || targetComp.allocatedBudgetUSD === 0 : true;

    return { matchedStock, targetComp, remainingBudget, withinBudget, total };
  }, [items, warehouseItems, companies, targetCompanyId]);

  const handleSubmitPO = (e: React.FormEvent) => {
    e.preventDefault();
    const deptMeta = COMPANY_DEPARTMENTS.find(d => d.category === targetDeptCategory) || COMPANY_DEPARTMENTS[0];
    const purchaseItems: PurchaseItem[] = items.map((it, idx) => ({
      id: `it-${idx}-${Date.now()}`,
      name: it.name,
      quantity: Number(it.quantity),
      unit: it.unit,
      unitPriceUSD: Number(it.unitPriceUSD),
      totalUSD: Number(it.quantity) * Number(it.unitPriceUSD),
      category: deptMeta.name,
    }));

    const total = calculateTotal();

    addPurchaseOrder({
      companyId: targetCompanyId,
      projectId: targetProjectId,
      departmentCategory: deptMeta.category,
      departmentName: deptMeta.name,
      departmentNameKu: deptMeta.nameKu,
      departmentNameAr: deptMeta.nameAr,
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

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {getUIText(language, {
                ku: `${t('navProcurement')} و زنجیرەی ئۆتۆماتیکی پەسەندکردن`,
                ar: `${t('navProcurement')} وسلسلة الموافقات الآلية`,
                en: `${t('navProcurement')} & Automated Approval Chain`
              })}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {getUIText(language, {
              ku: 'داواکاری کڕین دەبێت بە ٣ قۆناغدا تێپەڕێت: بەشی کۆمپانیا ← بەڕێوەبەری کۆمپانیا ← خاوەنی هۆڵدینگ، بەبێ بوونی هیچ ڕێگایەکی تێپەڕاندن.',
              ar: 'تمر طلبات الشراء بثلاث موافقات متسلسلة: القسم المختص ← مدير الشركة ← مالك القابضة، مع تكامل مباشر مع المخزون والمالية.',
              en: 'Mandatory 3-tier consent workflow (Company Department → Company Manager → Holding Owner) synced with Inventory & Finance.'
            })}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsGateScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <ScanLine className="w-4 h-4 text-emerald-600" />
            <span>{getUIText(language, { ku: 'سکانی دەروازە', ar: 'مسح باركود البوابة', en: 'Gate Receipt Scan' })}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer whitespace-nowrap shrink-0"
            id="create-po-btn"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createPurchaseOrder')}</span>
          </button>
        </div>
      </div>

      {/* Role Switcher & Mandatory Consent Governance Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3 text-xs text-slate-700">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block">
              {getUIText(language, {
                ku: 'یاسای ڕەزامەندی فرە-ئاست (بێ تێپەڕاندن)',
                ar: 'سياسة الاعتماد متعدد المستويات الإلزامية',
                en: 'Non-Bypassable 3-Level Consent Policy'
              })}
            </span>
            <span className="text-slate-600">
              {getUIText(language, {
                ku: '١. بەشی پەیوەندیدار ← ٢. بەڕێوەبەری کۆمپانیا ← ٣. خاوەنی هۆڵدینگ. هیچ کڕینێک لە کۆگا و دارایی جێبەجێ نابێت بێ تەواوبوونی هەر سێ قۆناغەکە.',
                ar: '١. القسم المختص ← ٢. مدير الشركة ← ٣. مالك القابضة. يبقى الصرف المالي وإدخال المخزون مقفلين حتى إتمام جميع الموافقات.',
                en: 'Level 1: Company Department · Level 2: Company Manager · Level 3: Holding Owner. Finance disbursement and Inventory receiving stay locked until all 3 sign.'
              })}
            </span>
          </div>
        </div>

        {quickTierProfiles.length > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg shrink-0 overflow-x-auto">
            <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1 whitespace-nowrap">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{getUIText(language, { ku: 'ڕۆڵ:', ar: 'الدور:', en: 'Act as:' })}</span>
            </span>
            {quickTierProfiles.map((prof) => {
              const active = currentUser.id === prof.id;
              return (
                <button
                  key={prof.id}
                  type="button"
                  onClick={() => setCurrentUser(prof)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {prof.role === 'DEPARTMENT_HEAD'
                    ? getUIText(language, { ku: '١. سەرۆکی بەش', ar: '١. رئيس القسم', en: '1. Dept Head' })
                    : prof.role === 'COMPANY_GM'
                    ? getUIText(language, { ku: '٢. بەڕێوەبەری کۆمپانیا', ar: '٢. مدير الشركة', en: '2. Company Manager' })
                    : prof.role === 'HOLDING_OWNER'
                    ? getUIText(language, { ku: '٣. خاوەنی هۆڵدینگ', ar: '٣. مالك القابضة', en: '3. Holding Owner' })
                    : prof.title}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto w-fit max-w-full">
        {[
          { id: 'ALL', labelKu: 'هەموو داواکارییەکان', labelAr: 'كافة الطلبات', labelEn: 'All Requests' },
          { id: 'STAGE_DEPT', labelKu: '١. پێداچوونەوەی بەش', labelAr: '١. مراجعة القسم', labelEn: '1. Dept Review' },
          { id: 'STAGE_GM', labelKu: '٢. بەڕێوەبەری کۆمپانیا', labelAr: '٢. مدير الشركة', labelEn: '2. Company Manager' },
          { id: 'STAGE_OWNER', labelKu: '٣. خاوەنی هۆڵدینگ', labelAr: '٣. مالك القابضة', labelEn: '3. Holding Owner' },
          { id: 'STAGE_APPROVED', labelKu: 'پەسەندکراوی تەواو', labelAr: 'معتمد نهائياً', labelEn: 'Finalized & Unlocked' },
          { id: 'REJECTED_BY_OWNER', labelKu: 'ڕەتکراوە', labelAr: 'مرفوض', labelEn: 'Rejected' },
          { id: 'ARRIVED_AT_GATE', labelKu: 'گەیشتوو بە دەروازە', labelAr: 'وصل للبوابة', labelEn: 'Arrived at Gate' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {getUIText(language, { ku: tab.labelKu, ar: tab.labelAr, en: tab.labelEn })}
          </button>
        ))}
      </div>

      {/* PO Cards Grid */}
      <div className="space-y-4">
        {filteredPOs.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-800">
              {getUIText(language, {
                ku: 'هیچ داواکارییەکی کڕین لەم فلتەرەدا نییە',
                ar: 'لا توجد طلبات شراء في هذه المرحلة',
                en: 'No purchase requisitions match this stage'
              })}
            </p>
            <p className="text-xs text-slate-500">
              {getUIText(language, {
                ku: 'داواکاری نوێ دروست بکە بۆ دەستپێکردنی زنجیرەی ٣ قۆناغی پەسەندکردن.',
                ar: 'أنشئ طلباً جديداً لبدء سلسلة الاعتماد ثلاثية المراحل.',
                en: 'Create a purchase requisition to initiate the 3-level approval workflow.'
              })}
            </p>
          </div>
        ) : (
          filteredPOs.map((po) => {
            const comp = companies.find(c => c.id === po.companyId);
            const proj = projects.find(p => p.id === po.projectId);
            const isRejected = po.status === 'REJECTED_BY_OWNER' || po.workflowState?.finalDecision === 'REJECTED';
            const isApproved = !isRejected && isPoFullyApproved(po);
            const isPending = !isRejected && !isApproved;
            const activePendingStep = po.workflowState?.steps?.find(s => s.status === 'PENDING');
            const isStored = po.status === 'INSPECTED_AND_STORED' || Boolean(po.inventorySync?.stockUpdatedOnReceive);
            const isPaid = po.financeEntry?.paymentStatus === 'PAID' || po.financeSync?.encumbranceStatus === 'DISBURSED';

            return (
              <div
                key={po.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4"
              >
                {/* Header Row: PO Number + Unboxed Metadata + Amount */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-base text-slate-900">{po.poNumber}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className={`text-xs font-semibold ${
                        isRejected
                          ? 'text-rose-700'
                          : isApproved
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}>
                        {isRejected
                          ? getUIText(language, { ku: 'ڕەتکراوەتەوە (کڕین ڕاگیرا)', ar: 'مرفوض — متوقف', en: 'Rejected — Halted' })
                          : isApproved
                          ? getUIText(language, { ku: 'ڕەزامەندی تەواوی هەیە (١٠٠٪)', ar: 'معتمد بالكامل (٣ مستويات)', en: 'Finalized — Multi-Level Consent Complete' })
                          : getUIText(language, {
                              ku: `چاوەڕوانی قۆناغی ${activePendingStep?.stepNumber || 1}`,
                              ar: `بانتظار موافقة المستوى ${activePendingStep?.stepNumber || 1}`,
                              en: `Pending Level ${activePendingStep?.stepNumber || 1} Approval`
                            })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <span className="font-medium text-slate-700">{comp?.nameKu || comp?.name || getUIText(language, { ku: 'کۆمپانیا', ar: 'الشركة', en: 'Subsidiary' })}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {language === 'ku'
                          ? (po.departmentNameKu || 'بەشی کۆمپانیا')
                          : language === 'ar'
                          ? (po.departmentNameAr || 'قسم الشركة')
                          : (po.departmentName || 'Company Department')}
                      </span>
                      {proj && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{proj.nameKu || proj.name}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{po.createdDate}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                      ${po.totalAmountUSD.toLocaleString()} {po.currency}
                    </div>
                    <div className="text-xs text-slate-500">
                      {po.supplierName}
                    </div>
                  </div>
                </div>

                {/* Items & Purpose */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 font-semibold block">
                      {getUIText(language, { ku: 'داواکار و سەرچاوە', ar: 'مقدم الطلب', en: 'Requester & Origin' })}
                    </span>
                    <span className="font-semibold text-slate-900 block mt-0.5">{po.requestedBy}</span>
                    <span className="text-slate-500 block">{po.requesterRole}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block">
                      {getUIText(language, { ku: 'مەبەست و هۆکاری کڕین', ar: 'الغرض والمبرر', en: 'Purpose / Justification' })}
                    </span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{po.purpose}</p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block">
                      {getUIText(language, {
                        ku: `کەرەستە داواکراوەکان (${po.items.length})`,
                        ar: `الأصناف المطلوبة (${po.items.length})`,
                        en: `Line Items (${po.items.length})`
                      })}
                    </span>
                    <ul className="space-y-0.5 text-slate-700 mt-0.5 tabular-nums">
                      {po.items.map((it, idx) => (
                        <li key={idx} className="truncate">
                          <span className="font-mono font-semibold">{it.quantity} {it.unit}</span> · {it.name} (<span className="font-mono">${it.totalUSD.toLocaleString()}</span>)
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 3-Tier Sequential Approval Pipeline */}
                {po.workflowState && (
                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>
                          {getUIText(language, {
                            ku: 'زنجیرەی پەسەندکردنی ٣ قۆناغی (بەش ← بەڕێوەبەری کۆمپانیا ← خاوەنی هۆڵدینگ)',
                            ar: 'سلسلة الموافقات ثلاثية المراحل (القسم ← مدير الشركة ← مالك القابضة)',
                            en: '3-Level Sequential Consent Chain'
                          })}
                        </span>
                      </span>
                      <span className="text-slate-500 font-mono tabular-nums">
                        {po.workflowState.steps.filter(s => s.status === 'APPROVED').length}/{po.workflowState.steps.length}{' '}
                        {getUIText(language, { ku: 'تەواو', ar: 'مكتمل', en: 'Approved' })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {po.workflowState.steps.map((st) => {
                        const isDone = st.status === 'APPROVED';
                        const isStepRejected = st.status === 'REJECTED';
                        const isCurrentActive = isPending && st.status === 'PENDING' && st.stepNumber === activePendingStep?.stepNumber;
                        return (
                          <div
                            key={st.stepNumber}
                            className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                              isDone
                                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                                : isStepRejected
                                ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                                : isCurrentActive
                                ? 'bg-blue-50/60 border-blue-300 text-slate-900'
                                : 'bg-slate-50/60 border-slate-200 text-slate-500'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-mono font-bold text-slate-500">
                                {getUIText(language, { ku: `قۆناغی ${st.stepNumber}`, ar: `المستوى ${st.stepNumber}`, en: `Level ${st.stepNumber}` })}
                              </span>
                              <span className={`font-semibold inline-flex items-center gap-1 ${
                                isDone ? 'text-emerald-700' : isStepRejected ? 'text-rose-700' : isCurrentActive ? 'text-blue-700' : 'text-slate-500'
                              }`}>
                                {isDone ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{getUIText(language, { ku: 'پەسەندکراو', ar: 'معتمد', en: 'Approved' })}</span>
                                  </>
                                ) : isStepRejected ? (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>{getUIText(language, { ku: 'ڕەتکراوە', ar: 'مرفوض', en: 'Rejected' })}</span>
                                  </>
                                ) : isCurrentActive ? (
                                  <>
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{getUIText(language, { ku: 'ئێستا لێرەیە', ar: 'قيد المراجعة الآن', en: 'Awaiting Sign-Off' })}</span>
                                  </>
                                ) : (
                                  <span>{getUIText(language, { ku: 'قفڵکراو (پێشوو ماوە)', ar: 'مقفل (بانتظار السابق)', en: 'Locked' })}</span>
                                )}
                              </span>
                            </div>

                            <div className="font-semibold text-slate-900 leading-snug">
                              {language === 'ku' ? st.titleKu : language === 'ar' ? (st.titleAr || st.titleEn) : st.titleEn}
                            </div>

                            <div className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between gap-2">
                              <span className="truncate">
                                {st.approverName || getUIText(language, { ku: 'چاوەڕوانی واژۆ', ar: 'بانتظار التوقيع', en: 'Pending Signer' })}
                              </span>
                              {st.actionDate && <span className="font-mono tabular-nums shrink-0">{st.actionDate}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Integrated Inventory & Finance Module Status Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                  {/* Inventory Module Integration */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{getUIText(language, { ku: 'هاوکاتکردنی کۆگا', ar: 'مزامنة المخزون', en: 'Inventory Sync' })}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">
                        {isStored
                          ? `${getUIText(language, { ku: 'تۆمارکرا لە کۆگا:', ar: 'مخزن في:', en: 'Stocked in:' })} ${po.warehouseReceipt?.binLocation || getUIText(language, { ku: 'کۆگای سەرەکی', ar: 'المستودع المركزي', en: 'Central Warehouse' })}`
                          : po.inventorySync?.preCheckSummary || getUIText(language, {
                              ku: 'پشکنینی کۆگا کراوە — وەرگرتن قفڵە تا مۆری خاوەن هۆڵدینگ',
                              ar: 'تم فحص المخزون — الاستلام مقفل حتى اعتماد المالك',
                              en: 'Pre-checked — receiving gated until Holding Owner signs'
                            })}
                      </p>
                    </div>
                    {isStored ? (
                      <span className="text-[11px] font-semibold text-emerald-700 whitespace-nowrap shrink-0">
                        {getUIText(language, { ku: 'زیادکرا', ar: 'تم التخزين', en: 'Stocked' })}
                      </span>
                    ) : isApproved ? (
                      <button
                        type="button"
                        onClick={() => receiveApprovedPoToWarehouse(po.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                        <span>{getUIText(language, { ku: 'وەرگرتن لە کۆگا', ar: 'استلام بالمستودع', en: 'Receive to Stock' })}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Lock className="w-3 h-3" />
                        <span>{isRejected
                          ? getUIText(language, { ku: 'ڕاگیراوە', ar: 'موقوف', en: 'Blocked' })
                          : getUIText(language, { ku: 'قفڵە', ar: 'مقفل', en: 'Gated' })}</span>
                      </span>
                    )}
                  </div>

                  {/* Finance Module Integration */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{getUIText(language, { ku: 'هاوکاتکردنی دارایی', ar: 'مزامنة المالية', en: 'Finance Sync' })}</span>
                        {po.financeSync?.encumbranceRef && (
                          <span className="font-mono text-[10px] text-slate-500">· {po.financeSync.encumbranceRef}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">
                        {isPaid
                          ? `${getUIText(language, { ku: 'سەرفکرا:', ar: 'تم الصرف:', en: 'Disbursed:' })} ${po.financeEntry?.voucherNo || getUIText(language, { ku: 'پارەدراوە', ar: 'مسدد', en: 'Settled' })}`
                          : isRejected
                          ? getUIText(language, { ku: 'تەرخانکراو هەڵوەشێندرایەوە (پارەدان قفڵە)', ar: 'تحرر الحجز المالي بعد الرفض', en: 'Encumbrance released on rejection — payout blocked' })
                          : isApproved
                          ? getUIText(language, { ku: 'بودجە تەرخانکرا — ئامادەیە بۆ سەرفکردن', ar: 'مقيد بالدفتر — جاهز للصرف', en: 'Committed in ledger — cleared for treasury disbursal' })
                          : getUIText(language, { ku: 'پێشوەختە بەستراوە — پارەدان قفڵە تا مۆری خاوەن هۆڵدینگ', ar: 'محجوز — الصرف مقفل حتى موافقة المالك', en: 'Encumbered — disbursal locked until 3-tier approval' })}
                      </p>
                    </div>
                    {isPaid ? (
                      <span className="text-[11px] font-semibold text-blue-700 whitespace-nowrap shrink-0">
                        {getUIText(language, { ku: 'پارە درا', ar: 'تم الدفع', en: 'Disbursed' })}
                      </span>
                    ) : isApproved ? (
                      <button
                        type="button"
                        onClick={() => disbursePoPayment(po.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>{getUIText(language, { ku: 'سەرفکردنی پارە', ar: 'صرف المبلغ', en: 'Disburse Funds' })}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Lock className="w-3 h-3" />
                        <span>{isRejected
                          ? getUIText(language, { ku: 'هەڵوەشاوە', ar: 'محرر', en: 'Released' })
                          : getUIText(language, { ku: 'قفڵە', ar: 'مقفل', en: 'Locked' })}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setTrackingPo(po)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <PenTool className="w-3.5 h-3.5 text-blue-600" />
                      <span>{getUIText(language, { ku: 'ڕێڕەوی واژۆکان', ar: 'تتبع الموافقات', en: 'Inspect Approval Chain' })}</span>
                      <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>

                    {isApproved && (
                      <button
                        onClick={() => setIsGateScannerOpen(true)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{getUIText(language, { ku: 'سکانی دەروازە', ar: 'مسح البوابة', en: 'Gate Scan' })}</span>
                      </button>
                    )}
                  </div>

                  {/* Sequential Tier Sign-Off Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isPending && activePendingStep && (() => {
                      const auth = canUserApproveWorkflowStep(currentUser, po, activePendingStep.stepNumber);

                      if (auth.allowed) {
                        return (
                          <>
                            <button
                              onClick={() => approveWorkflowStep(po.id, activePendingStep.stepNumber, 'APPROVED')}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>
                                {getUIText(language, {
                                  ku: `پەسەندکردنی قۆناغی ${activePendingStep.stepNumber}`,
                                  ar: `اعتماد المرحلة ${activePendingStep.stepNumber}`,
                                  en: `Approve Tier ${activePendingStep.stepNumber}`
                                })}
                              </span>
                            </button>
                            <button
                              onClick={() => approveWorkflowStep(po.id, activePendingStep.stepNumber, 'REJECTED', 'ڕەتکرایەوە لە کاتی پێداچوونەوەی زنجیرەییدا')}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{t('rejectPurchase')}</span>
                            </button>
                          </>
                        );
                      }

                      return (
                        <span className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {getUIText(language, {
                              ku: `چاوەڕوانی (${activePendingStep.titleKu}) — ناتوانرێت تێپەڕێندرێت`,
                              ar: `مقفل بانتظار (${activePendingStep.titleAr || activePendingStep.titleEn})`,
                              en: `Locked on Tier ${activePendingStep.stepNumber}: ${activePendingStep.titleEn}`
                            })}
                          </span>
                        </span>
                      );
                    })()}

                    {po.holdingApproval && (
                      <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 text-amber-600" />
                        <span>{po.holdingApproval.approvedBy}</span>
                        <span className="font-mono text-slate-400">· {po.holdingApproval.signatureHash}</span>
                      </span>
                    )}

                    {isHoldingAdmin && (
                      <button
                        type="button"
                        onClick={() => deletePurchaseOrder(po.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title={getUIText(language, { ku: 'سڕینەوەی داواکاری', ar: 'حذف الطلب', en: 'Delete Purchase Order' })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create PO Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {getUIText(language, { ku: 'دروستکردنی داواکاری کڕین', ar: 'إنشاء طلب شراء', en: 'Create Purchase Requisition' })}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {getUIText(language, {
                    ku: 'دەبێت ڕەزامەندی بەش ← بەڕێوەبەری کۆمپانیا ← خاوەنی هۆڵدینگ وەربگرێت.',
                    ar: 'يمر آلياً عبر: القسم المختص ← مدير الشركة ← مالك القابضة',
                    en: 'Routes automatically: Company Department → Company Manager → Holding Owner'
                  })}
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPO} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {getUIText(language, { ku: 'کۆمپانیا', ar: 'الشركة التابعة', en: 'Subsidiary Company' })}
                  </label>
                  <select
                    value={targetCompanyId}
                    onChange={(e) => setTargetCompanyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  >
                    {companies.map(c => <option key={c.id} value={c.id}>{c.nameKu || c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {getUIText(language, { ku: 'بەشی داواکار لە کۆمپانیا', ar: 'القسم المختص', en: 'Company Department' })}
                  </label>
                  <select
                    value={targetDeptCategory}
                    onChange={(e) => setTargetDeptCategory(e.target.value as DepartmentCategory)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  >
                    {COMPANY_DEPARTMENTS.map(d => (
                      <option key={d.category} value={d.category}>
                        {language === 'ku' ? d.nameKu : language === 'ar' ? d.nameAr : d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {getUIText(language, { ku: 'پڕۆژە / شوێن', ar: 'المشروع / الموقع', en: 'Project / Site' })}
                  </label>
                  <select
                    value={targetProjectId}
                    onChange={(e) => setTargetProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.nameKu || p.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {getUIText(language, { ku: 'ناوی دابینکەر یان کۆمپانیای فرۆشیار', ar: 'اسم المورد', en: 'Supplier / Vendor Name' })}
                </label>
                <input
                  type="text"
                  required
                  placeholder={getUIText(language, { ku: 'بۆ نموونە: کۆمپانیای بەیان بۆ کەرەستەی بیناسازی', ar: 'مثال: شركة البيان للتجهيزات', en: 'e.g. Al-Bayan Industrial Supplies Ltd' })}
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {getUIText(language, { ku: 'مەبەست و ڕوونکردنەوەی پێویستی کڕین', ar: 'الغرض والمبررات الفنية', en: 'Purpose / Technical Justification' })}
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder={getUIText(language, { ku: 'هۆکاری پێویستی کڕینی ئەم کەرەستانە بنووسە...', ar: 'اشرح الحاجة التشغيلية لهذا الطلب...', en: 'State the operational reason for this procurement...' })}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    {getUIText(language, { ku: 'کەرەستە و ماددەکان', ar: 'المواد والأصناف', en: 'Items & Materials' })}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    + {getUIText(language, { ku: 'زیادکردنی کەرەستە', ar: 'إضافة صنف', en: 'Add Item' })}
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2">
                    <input
                      type="text"
                      placeholder={getUIText(language, { ku: 'ناوی کەرەستە', ar: 'اسم المادة', en: 'Item name' })}
                      value={item.name}
                      onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                      className="col-span-5 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none"
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder={getUIText(language, { ku: 'بڕ', ar: 'الكمية', en: 'Qty' })}
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                      className="col-span-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2 py-1.5 text-xs font-mono tabular-nums focus:bg-white focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder={getUIText(language, { ku: 'یەکە', ar: 'الوحدة', en: 'Unit' })}
                      value={item.unit}
                      onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                      className="col-span-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2 py-1.5 text-xs focus:bg-white focus:outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder={getUIText(language, { ku: 'نرخ $', ar: 'السعر $', en: 'Price $' })}
                      value={item.unitPriceUSD}
                      onChange={(e) => handleUpdateItem(idx, 'unitPriceUSD', Number(e.target.value))}
                      className="col-span-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2 py-1.5 text-xs font-mono tabular-nums focus:bg-white focus:outline-none"
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

              {/* Live Inventory & Finance Integration Pre-Check */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Boxes className="w-3.5 h-3.5 text-blue-600" />
                    <span>{getUIText(language, { ku: 'پشکنینی کۆگا (پێشوەختە)', ar: 'فحص المخزون المسبق', en: 'Inventory Stock Pre-Check' })}</span>
                  </div>
                  {liveModalPreview.matchedStock.some(m => m.match) ? (
                    <div className="space-y-0.5 text-[11px] text-slate-600">
                      {liveModalPreview.matchedStock.map((m, i) => m.match ? (
                        <div key={i}>
                          <span className="font-medium text-slate-800">{m.match.name}:</span>{' '}
                          <span className="font-mono">{m.match.quantityOnHand} {m.match.unit}</span>{' '}
                          {getUIText(language, { ku: 'لە کۆگادایە', ar: 'متوفر بالمستودع', en: 'on hand' })}
                          {m.match.quantityOnHand <= m.match.minimumThreshold && (
                            <span className="text-amber-700 font-semibold">
                              {' '}({getUIText(language, { ku: 'کەمبووە — پێویستی پڕکردنەوەیە', ar: 'منخفض — يحتاج تعبئة', en: 'Low stock — restock needed' })})
                            </span>
                          )}
                        </div>
                      ) : null)}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      {getUIText(language, {
                        ku: 'کەرەستەی نوێ — پاش ڕەزامەندی کۆتایی دەخرێتە ناو کۆگاوە.',
                        ar: 'صنف جديد — يُضاف للمستودع بعد الاعتماد النهائي.',
                        en: 'New catalog procurement — warehouse entry queued on final approval.'
                      })}
                    </p>
                  )}
                </div>

                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{getUIText(language, { ku: 'پشکنینی بودجەی دارایی', ar: 'فحص الميزانية المالية', en: 'Finance Budget Encumbrance' })}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 tabular-nums">
                    {getUIText(language, { ku: 'بودجەی بەردەستی کۆمپانیا:', ar: 'الميزانية المتاحة للشركة:', en: 'Available company budget:' })}{' '}
                    <span className="font-mono font-semibold text-slate-900">
                      ${liveModalPreview.remainingBudget.toLocaleString()} USD
                    </span>
                    {' · '}
                    <span className={liveModalPreview.withinBudget ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                      {liveModalPreview.withinBudget
                        ? getUIText(language, { ku: 'لە ناو بودجەدایە', ar: 'ضمن الميزانية', en: 'Within Budget' })
                        : getUIText(language, { ku: 'لە بودجە تێپەڕیوە', ar: 'يتجاوز الميزانية', en: 'Exceeds Subsidiary Budget' })}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                  {getUIText(language, { ku: 'کۆی گشتی:', ar: 'الإجمالي:', en: 'Total:' })} ${calculateTotal().toLocaleString()} USD
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer whitespace-nowrap"
                  >
                    {getUIText(language, { ku: 'پاشگەزبوونەوە', ar: 'إلغاء', en: 'Cancel' })}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer whitespace-nowrap"
                  >
                    {getUIText(language, { ku: 'ناردن بۆ زنجیرەی ٣ قۆناغی', ar: 'إرسال لسلسلة الموافقات', en: 'Submit to 3-Tier Approval Chain' })}
                  </button>
                </div>
              </div>
            </form>
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
