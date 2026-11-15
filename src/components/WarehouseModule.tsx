import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  ScanLine,
  CheckCircle2,
  ArrowDownToLine,
  ShieldCheck,
  Lock,
  Clock,
  Check,
  XCircle,
  ShoppingCart
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { DepartmentCategory, WarehouseItem } from '../types/erp';
import { generateDefaultDepartments } from '../data/departmentsData';
import { getUIText } from '../utils/langHelper';

const COMPANY_DEPARTMENTS = generateDefaultDepartments('COMPANY', 'Subsidiary', 'Company Manager').map((d) => ({
  category: d.category,
  name: d.name,
  nameKu: d.nameKu,
  nameAr: d.nameAr,
}));

export const WarehouseModule: React.FC = () => {
  const {
    warehouseItems,
    addWarehouseItem,
    addPurchaseOrder,
    companies,
    projects,
    currentUser,
    selectedCompanyId,
    setIsGateScannerOpen,
    purchaseOrders,
    isPoFullyApproved,
    receiveApprovedPoToWarehouse,
  } = useERP();

  const { t, language } = useLanguage();

  const [warehouseTab, setWarehouseTab] = useState<'STOCK' | 'INWARD_REQUISITIONS'>('STOCK');

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('کەرەستەی بیناسازی و کارەبایی');
  const [quantityOnHand, setQuantityOnHand] = useState(10);
  const [minThreshold, setMinThreshold] = useState(5);
  const [unit, setUnit] = useState('دانە');
  const [unitCostUSD, setUnitCostUSD] = useState(150);
  const [binLocation, setBinLocation] = useState('Zone B, Rack 02');

  const [restockTargetItem, setRestockTargetItem] = useState<WarehouseItem | null>(null);
  const [restockQty, setRestockQty] = useState(25);
  const [restockSupplier, setRestockSupplier] = useState('');
  const [restockDept, setRestockDept] = useState<DepartmentCategory>('WAREHOUSE_LOGISTICS');
  const [restockUnitCost, setRestockUnitCost] = useState(0);
  const [restockFeedback, setRestockFeedback] = useState<string | null>(null);

  const getItemUnitCost = (item: WarehouseItem) => item.unitCostUSD ?? item.averageUnitCostUSD ?? 0;
  const getItemSku = (item: WarehouseItem) => item.sku || item.itemCode || item.id;

  const filteredItems = warehouseItems.filter(item => {
    if (selectedCompanyId !== 'ALL' && item.companyId !== selectedCompanyId) return false;
    const itemSku = getItemSku(item).toLowerCase();
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && !itemSku.includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalValuation = filteredItems.reduce((sum, it) => sum + ((it.quantityOnHand || 0) * getItemUnitCost(it)), 0);
  const lowStockCount = filteredItems.filter(it => (it.quantityOnHand || 0) <= (it.minimumThreshold || 0)).length;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    addWarehouseItem({
      sku: sku || `SKU-SAS-${Math.floor(1000 + Math.random() * 9000)}`,
      itemCode: sku || `ITM-SAS-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      category,
      companyId: selectedCompanyId !== 'ALL' ? selectedCompanyId : (companies[0]?.id || 'comp-1'),
      projectId: projects[0]?.id || 'proj-101',
      quantityOnHand: Number(quantityOnHand),
      minimumThreshold: Number(minThreshold),
      unit,
      unitCostUSD: Number(unitCostUSD),
      averageUnitCostUSD: Number(unitCostUSD),
      binLocation,
      lastRestockedDate: new Date().toISOString().split('T')[0],
      supplier: getUIText(language, { ku: 'کۆگای سەرەکی', ar: 'المستودع المركزي', en: 'Central Stock' }),
    });
    setIsAddItemOpen(false);
    setName('');
    setSku('');
  };

  const openRestockModal = (item: WarehouseItem) => {
    setRestockTargetItem(item);
    setRestockQty(Math.max(10, (item.minimumThreshold || 10) * 2));
    setRestockSupplier(item.supplier || getUIText(language, { ku: 'دابینکەری پەسەندکراو', ar: 'مورد معتمد', en: 'Approved Vendor' }));
    setRestockDept('WAREHOUSE_LOGISTICS');
    setRestockUnitCost(getItemUnitCost(item) || 100);
  };

  const handleSubmitRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockTargetItem) return;
    const deptMeta = COMPANY_DEPARTMENTS.find(d => d.category === restockDept) || COMPANY_DEPARTMENTS[0];
    const qty = Number(restockQty) || 1;
    const price = Number(restockUnitCost) || 0;
    const total = qty * price;
    const targetProject = projects.find(p => p.companyId === restockTargetItem.companyId) || projects[0];

    addPurchaseOrder({
      companyId: restockTargetItem.companyId,
      projectId: restockTargetItem.projectId || targetProject?.id || 'proj-101',
      departmentCategory: deptMeta.category,
      departmentName: deptMeta.name,
      departmentNameKu: deptMeta.nameKu,
      departmentNameAr: deptMeta.nameAr,
      requestedBy: currentUser.name,
      requesterRole: currentUser.title || 'بەرپرسی کۆگا',
      supplierName: restockSupplier || 'دابینکەری پەسەندکراو',
      purpose: `داواکاری پڕکردنەوەی کۆگا بۆ ${restockTargetItem.name} (${getItemSku(restockTargetItem)}). بڕی ئێستا: ${restockTargetItem.quantityOnHand} ${restockTargetItem.unit}.`,
      items: [
        {
          id: `it-restock-${Date.now()}`,
          name: restockTargetItem.name,
          quantity: qty,
          unit: restockTargetItem.unit,
          unitPriceUSD: price,
          totalUSD: total,
          category: restockTargetItem.category,
        }
      ],
      subtotalUSD: total,
      taxUSD: 0,
      totalAmountUSD: total,
      currency: 'USD',
      originalLanguage: currentUser.nativeLanguage,
    });

    setRestockFeedback(
      getUIText(language, {
        ku: `داواکاری پڕکردنەوەی کۆگا بۆ (${restockTargetItem.name}) نێردرا بۆ قۆناغی ١ (بەش ← بەڕێوەبەر ← خاوەن هۆڵدینگ).`,
        ar: `تم إرسال طلب إعادة تعبئة (${restockTargetItem.name}) إلى المرحلة الأولى (القسم ← مدير الشركة ← مالك القابضة).`,
        en: `Restock requisition for ${restockTargetItem.name} submitted to Tier 1 (Department Review).`
      })
    );
    setRestockTargetItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {getUIText(language, {
                ku: `${t('navWarehouse')} و کۆگای ناوەندی`,
                ar: `${t('navWarehouse')} والمخزون المركزي`,
                en: `${t('navWarehouse')} & Central Inventory`
              })}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {getUIText(language, {
              ku: 'ڕێژەی کۆگا، داواکاری پڕکردنەوەی کەرەستە و وەرگرتنی فەرمی تەنها پاش ڕەزامەندی ٣ قۆناغی.',
              ar: 'أرصدة المخزون الفورية، طلبات إعادة التزويد، والاستلام المقيد بثلاث موافقات.',
              en: 'Live stock balances, low-stock restock requisitions, and 3-tier approval-gated inward receiving.'
            })}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsGateScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <ScanLine className="w-4 h-4 text-emerald-600" />
            <span>{getUIText(language, { ku: 'سکانی پسوولەی دەروازە', ar: 'مسح باركود البوابة', en: 'Scan Gate Receipt' })}</span>
          </button>
          <button
            onClick={() => setIsAddItemOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{getUIText(language, { ku: 'زیادکردنی کەرەستە', ar: 'إضافة صنف للمخزون', en: 'Add Stock Item' })}</span>
          </button>
        </div>
      </div>

      {restockFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{restockFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setRestockFeedback(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Warehouse Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setWarehouseTab('STOCK')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            warehouseTab === 'STOCK'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>{getUIText(language, { ku: 'کۆگای سەرەکی و کەرەستەکان', ar: 'أرصدة المستودع', en: 'Inventory Stock Items' })}</span>
          <span className="font-mono text-[11px] text-slate-500">({filteredItems.length})</span>
        </button>

        <button
          onClick={() => setWarehouseTab('INWARD_REQUISITIONS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
            warehouseTab === 'INWARD_REQUISITIONS'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{getUIText(language, { ku: 'دەروازەی وەرگرتنی کەرەستە', ar: 'بوابة استلام المواد', en: 'Inward Requisitions & Clearance' })}</span>
          <span className="font-mono text-[11px] text-emerald-700">
            ({purchaseOrders.filter(p => isPoFullyApproved(p) && p.status !== 'INSPECTED_AND_STORED').length}{' '}
            {getUIText(language, { ku: 'ئامادەیە', ar: 'جاهز', en: 'Ready' })})
          </span>
        </button>
      </div>

      {warehouseTab === 'INWARD_REQUISITIONS' ? (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {getUIText(language, {
                  ku: 'وەرگرتنی کەرەستە پاش ڕەزامەندی ٣ قۆناغی',
                  ar: 'استلام المستودع وتخليص الموافقات ثلاثية المراحل',
                  en: 'Inward Warehouse Receiving & Approval Clearance'
                })}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                {getUIText(language, {
                  ku: 'وەرگرتنی بار لە کۆگا تەنها کاتێک چالاک دەبێت کە بەش ← بەڕێوەبەری کۆمپانیا ← خاوەنی هۆڵدینگ پەسەندیان کردبێت.',
                  ar: 'لا يمكن استلام وإدخال المواد إلا بعد موافقة القسم ثم مدير الشركة ثم مالك القابضة.',
                  en: 'Warehouse Gate Protocol: Cargo can only be received and added to stock once Department, Company Manager, and Holding Owner consents are complete.'
                })}
              </p>
            </div>

            <button
              onClick={() => setIsGateScannerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <ScanLine className="w-4 h-4" />
              <span>{getUIText(language, { ku: 'سکانی بارکۆدی دەروازە', ar: 'مسح باركود البوابة', en: 'Scan Gate Receipt' })}</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{getUIText(language, { ku: 'فەرمانی کڕین / کەرەستە', ar: 'رقم الطلب / المواد', en: 'PO Reference / Cargo' })}</th>
                    <th className="py-3 px-4">{getUIText(language, { ku: 'کۆمپانیا · بەش · دابینکەر', ar: 'الشركة · القسم · المورد', en: 'Company · Department · Supplier' })}</th>
                    <th className="py-3 px-4 text-end">{getUIText(language, { ku: 'بەها (USD)', ar: 'القيمة (دولار)', en: 'Value (USD)' })}</th>
                    <th className="py-3 px-4">{getUIText(language, { ku: 'ڕەزامەندی ٣ قۆناغی', ar: 'حالة الموافقات', en: '3-Tier Consent Status' })}</th>
                    <th className="py-3 px-4">{getUIText(language, { ku: 'باری وەرگرتن لە کۆگا', ar: 'حالة التخزين', en: 'Warehouse Clearance' })}</th>
                    <th className="py-3 px-4 text-end">{getUIText(language, { ku: 'کرداری وەرگرتن', ar: 'إجراء الاستلام', en: 'Receiving Action' })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseOrders
                    .filter(po => selectedCompanyId === 'ALL' || po.companyId === selectedCompanyId)
                    .map(po => {
                      const comp = companies.find(c => c.id === po.companyId);
                      const isRejected = po.status === 'REJECTED_BY_OWNER' || po.workflowState?.finalDecision === 'REJECTED';
                      const isApproved = !isRejected && isPoFullyApproved(po);
                      const isStored = po.status === 'INSPECTED_AND_STORED' || Boolean(po.inventorySync?.stockUpdatedOnReceive);
                      const pendingStep = po.workflowState?.steps?.find(s => s.status === 'PENDING');

                      return (
                        <tr key={po.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 block">{po.poNumber}</span>
                            <span className="text-slate-600">{po.items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join('، ')}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-900 block">{comp?.nameKu || comp?.name || getUIText(language, { ku: 'کۆمپانیا', ar: 'شركة', en: 'Subsidiary' })}</span>
                            <span className="text-slate-500 text-[11px]">
                              {language === 'ku' ? (po.departmentNameKu || 'بەشی کۆمپانیا') : language === 'ar' ? (po.departmentNameAr || 'القسم') : (po.departmentName || 'Company Dept')} · {po.supplierName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-end font-mono tabular-nums font-bold text-slate-900">
                            ${po.totalAmountUSD.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2 flex-wrap text-[11px]">
                              {po.workflowState?.steps.map((st, idx) => {
                                const done = st.status === 'APPROVED';
                                const rej = st.status === 'REJECTED';
                                const cur = !isRejected && st.status === 'PENDING' && st.stepNumber === pendingStep?.stepNumber;
                                return (
                                  <React.Fragment key={st.stepNumber}>
                                    {idx > 0 && <span className="text-slate-300">←</span>}
                                    <span
                                      className={`inline-flex items-center gap-1 font-medium ${
                                        done
                                          ? 'text-emerald-700'
                                          : rej
                                          ? 'text-rose-700'
                                          : cur
                                          ? 'text-blue-700 font-semibold'
                                          : 'text-slate-400'
                                      }`}
                                    >
                                      {done ? <Check className="w-3 h-3" /> : rej ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                      <span>{getUIText(language, { ku: `ق${st.stepNumber}`, ar: `م${st.stepNumber}`, en: `L${st.stepNumber}` })}</span>
                                    </span>
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {isStored ? (
                              <span className="text-blue-700 font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{getUIText(language, { ku: 'تۆمارکرا لە کۆگا', ar: 'تم التخزين', en: 'Stocked in Inventory' })}</span>
                              </span>
                            ) : isRejected ? (
                              <span className="text-rose-700 font-semibold inline-flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>{getUIText(language, { ku: 'ڕەتکراوە — ڕاگیراوە', ar: 'مرفوض — متوقف', en: 'Rejected — Entry Halted' })}</span>
                              </span>
                            ) : isApproved ? (
                              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{getUIText(language, { ku: 'ڕێگەپێدراو بۆ وەرگرتن', ar: 'مصرح للاستلام', en: 'Cleared for Receiving' })}</span>
                              </span>
                            ) : (
                              <span className="text-amber-700 font-semibold inline-flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5" />
                                <span>{getUIText(language, {
                                  ku: `قفڵە (${pendingStep?.titleKu || 'چاوەڕوانی ڕەزامەندی'})`,
                                  ar: `مقفل (المستوى ${pendingStep?.stepNumber || 1})`,
                                  en: `Blocked (Awaiting Tier ${pendingStep?.stepNumber || 1})`
                                })}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-end">
                            {isStored ? (
                              <span className="text-[11px] font-mono text-slate-500">
                                {po.warehouseReceipt?.binLocation || getUIText(language, { ku: 'ڕەفەی سەرەکی', ar: 'الرف المركزي', en: 'Central Bin' })}
                              </span>
                            ) : isApproved ? (
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => setIsGateScannerOpen(true)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs transition cursor-pointer flex items-center gap-1 whitespace-nowrap"
                                >
                                  <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{getUIText(language, { ku: 'سکان', ar: 'مسح', en: 'Scan' })}</span>
                                </button>
                                <button
                                  onClick={() => receiveApprovedPoToWarehouse(po.id)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                                >
                                  <ArrowDownToLine className="w-3.5 h-3.5" />
                                  <span>{getUIText(language, { ku: 'وەرگرتن لە کۆگا', ar: 'استلام وتخزين', en: 'Receive & Shelve' })}</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                disabled
                                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 font-semibold text-xs border border-slate-200 inline-flex items-center gap-1 cursor-not-allowed whitespace-nowrap"
                              >
                                <Lock className="w-3 h-3" />
                                <span>{isRejected
                                  ? getUIText(language, { ku: 'ڕاگیراوە', ar: 'متوقف', en: 'Halted' })
                                  : getUIText(language, { ku: 'قفڵە', ar: 'مقفل', en: 'Locked' })}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
              <span className="text-xs font-semibold text-slate-500">
                {getUIText(language, { ku: 'بەهای گشتی کۆگا', ar: 'إجمالي قيمة المخزون', en: 'Total Stock Valuation' })}
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                ${totalValuation.toLocaleString()} USD
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {getUIText(language, {
                  ku: `لە ${filteredItems.length} جۆر کەرەستە`,
                  ar: `عبر ${filteredItems.length} صنفاً`,
                  en: `Across ${filteredItems.length} stock SKUs`
                })}
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
              <span className="text-xs font-semibold text-slate-500">
                {getUIText(language, { ku: 'ئاگادارکردنەوەی کەمی کۆگا', ar: 'تنبيهات انخفاض المخزون', en: 'Low Stock Reorder Alerts' })}
              </span>
              <div className={`text-2xl font-bold mt-1 font-mono tabular-nums ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {lowStockCount} {getUIText(language, { ku: 'کەرەستە', ar: 'أصناف', en: 'Items' })}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {getUIText(language, { ku: 'ژێر ئاستی سەلامەتی کۆگا', ar: 'تحت الحد الأدنى للمخزون', en: 'Below minimum safety threshold' })}
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
              <span className="text-xs font-semibold text-slate-500">
                {getUIText(language, { ku: 'بەستنەوە بە کڕین و دارایی', ar: 'الربط مع المشتريات والمالية', en: 'Procurement & Finance Link' })}
              </span>
              <div className="text-2xl font-bold text-emerald-700 mt-1 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{getUIText(language, { ku: 'چالاکە (٣ قۆناغ)', ar: 'مفعل (٣ مستويات)', en: '3-Tier Gated' })}</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {getUIText(language, {
                  ku: 'داواکاری کڕین دەچێتە بەش ← بەڕێوەبەر ← خاوەن هۆڵدینگ',
                  ar: 'تمر طلبات الشراء عبر القسم ثم المدير ثم المالك',
                  en: 'Restock requests enter Department → GM → Owner chain'
                })}
              </span>
            </div>
          </div>

          {/* Search & Stock Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:bg-white focus-within:border-blue-500">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={getUIText(language, {
                    ku: 'گەڕان بە پێی کۆد، ناوی کەرەستە، یان شوێن...',
                    ar: 'ابحث بالكود أو اسم المادة...',
                    en: 'Search stock by SKU, product name, or bin...'
                  })}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-slate-900 text-xs focus:outline-none"
                />
              </div>
              <span className="text-xs text-slate-500 font-medium tabular-nums">
                {getUIText(language, {
                  ku: `پیشاندانی ${filteredItems.length} تۆمار لە کۆگادا`,
                  ar: `عرض ${filteredItems.length} سجل مخزني`,
                  en: `Showing ${filteredItems.length} inventory records`
                })}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{getUIText(language, { ku: 'کۆد / ناوی کەرەستە', ar: 'الكود / اسم المادة', en: 'Item SKU / Name' })}</th>
                    <th className="py-3 px-4">{getUIText(language, { ku: 'جۆر', ar: 'الفئة', en: 'Category' })}</th>
                    <th className="py-3 px-4">{getUIText(language, { ku: 'شوێنی عەمبار', ar: 'موقع التخزين', en: 'Bin Location' })}</th>
                    <th className="py-3 px-4 text-end">{getUIText(language, { ku: 'بڕی بەردەست', ar: 'الكمية المتاحة', en: 'On Hand' })}</th>
                    <th className="py-3 px-4 text-end">{getUIText(language, { ku: 'نرخی یەکە', ar: 'تكلفة الوحدة', en: 'Unit Cost' })}</th>
                    <th className="py-3 px-4 text-end">{getUIText(language, { ku: 'بەهای گشتی', ar: 'القيمة الإجمالية', en: 'Total Value' })}</th>
                    <th className="py-3 px-4 text-end">{getUIText(language, { ku: 'داواکاری کڕین', ar: 'طلب تعبئة', en: 'Restock Action' })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const isLow = (item.quantityOnHand || 0) <= (item.minimumThreshold || 0);
                    const cost = getItemUnitCost(item);
                    const totalItemVal = (item.quantityOnHand || 0) * cost;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <span className="font-mono text-[11px] text-slate-500">{getItemSku(item)}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {item.category}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono">
                          {item.binLocation}
                        </td>
                        <td className="py-3.5 px-4 text-end font-mono tabular-nums font-bold">
                          <span className={isLow ? 'text-rose-600' : 'text-slate-900'}>
                            {item.quantityOnHand} {item.unit}
                          </span>
                          {isLow && (
                            <span className="block text-[10px] text-rose-600 font-semibold">
                              {getUIText(language, {
                                ku: `ژێر کەمترین بڕ (${item.minimumThreshold})`,
                                ar: `تحت الحد الأدنى (${item.minimumThreshold})`,
                                en: `Below min (${item.minimumThreshold})`
                              })}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-end text-slate-700 font-mono tabular-nums">
                          ${cost.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-end text-emerald-700 font-mono tabular-nums font-semibold">
                          ${totalItemVal.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-end">
                          <button
                            type="button"
                            onClick={() => openRestockModal(item)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                              isLow
                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{getUIText(language, { ku: 'داواکاری کڕین', ar: 'طلب شراء وتعبئة', en: 'Request Restock' })}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Restock Requisition Modal */}
      {restockTargetItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {getUIText(language, { ku: 'داواکاری پڕکردنەوەی کۆگا', ar: 'طلب إعادة تعبئة المخزون', en: 'Trigger Inventory Restock Request' })}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {restockTargetItem.name} · {getItemSku(restockTargetItem)}
                </p>
              </div>
              <button onClick={() => setRestockTargetItem(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmitRestock} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {getUIText(language, { ku: 'بەشی داواکار لە کۆمپانیا', ar: 'القسم الطالب في الشركة', en: 'Requesting Company Department' })}
                </label>
                <select
                  value={restockDept}
                  onChange={(e) => setRestockDept(e.target.value as DepartmentCategory)}
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
                  {getUIText(language, { ku: 'دابینکەر / فرۆشیار', ar: 'المورد', en: 'Supplier / Vendor' })}
                </label>
                <input
                  type="text"
                  required
                  value={restockSupplier}
                  onChange={(e) => setRestockSupplier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {getUIText(language, { ku: `بڕی داواکراو (${restockTargetItem.unit})`, ar: `الكمية (${restockTargetItem.unit})`, en: `Restock Quantity (${restockTargetItem.unit})` })}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {getUIText(language, { ku: 'نرخی یەکە ($ USD)', ar: 'تكلفة الوحدة ($)', en: 'Unit Cost ($ USD)' })}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={restockUnitCost}
                    onChange={(e) => setRestockUnitCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span>{getUIText(language, { ku: 'بەهای خەمڵێندراو:', ar: 'القيمة التقديرية:', en: 'Estimated Requisition Total:' })}</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    ${(Number(restockQty) * Number(restockUnitCost)).toLocaleString()} USD
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {getUIText(language, {
                    ku: 'دەنێردرێت بۆ قۆناغی ١ (بەش) ← قۆناغی ٢ (بەڕێوەبەری کۆمپانیا) ← قۆناغی ٣ (خاوەنی هۆڵدینگ).',
                    ar: 'يُرسل إلى المرحلة ١ (القسم) ← المرحلة ٢ (مدير الشركة) ← المرحلة ٣ (مالك القابضة).',
                    en: 'Submits directly to Tier 1 (Department) → Tier 2 (Company Manager) → Tier 3 (Holding Owner).'
                  })}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockTargetItem(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  {getUIText(language, { ku: 'پاشگەزبوونەوە', ar: 'إلغاء', en: 'Cancel' })}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {getUIText(language, { ku: 'ناردنی داواکاری کڕین', ar: 'إرسال طلب الشراء', en: 'Submit Restock Request' })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {getUIText(language, { ku: 'زیادکردنی کەرەستە بۆ کۆگا', ar: 'إضافة مادة إلى المستودع', en: 'Add Warehouse Stock Item' })}
            </h3>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {getUIText(language, { ku: 'ناوی کەرەستە یان ماددە', ar: 'اسم المادة', en: 'Item / Material Name' })}
                </label>
                <input
                  type="text"
                  required
                  placeholder={getUIText(language, { ku: 'نموونە: کێبڵی مس 4x185mm', ar: 'مثال: كابل نحاس مسلح', en: 'e.g. Copper Armored Cable 4x185mm' })}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {getUIText(language, { ku: 'کۆدی کەرەستە (SKU)', ar: 'كود المادة', en: 'SKU / Code' })}
                  </label>
                  <input
                    type="text"
                    placeholder="ITM-108"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {getUIText(language, { ku: 'جۆر / پۆل', ar: 'الفئة', en: 'Category' })}
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {getUIText(language, { ku: 'بڕ', ar: 'الكمية', en: 'Quantity' })}
                  </label>
                  <input
                    type="number"
                    required
                    value={quantityOnHand}
                    onChange={(e) => setQuantityOnHand(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {getUIText(language, { ku: 'کەمترین ئاست', ar: 'الحد الأدنى', en: 'Min Alert' })}
                  </label>
                  <input
                    type="number"
                    required
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {getUIText(language, { ku: 'یەکە', ar: 'الوحدة', en: 'Unit' })}
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {getUIText(language, { ku: 'تێچووی یەکە ($)', ar: 'تكلفة الوحدة ($)', en: 'Unit Cost ($)' })}
                  </label>
                  <input
                    type="number"
                    required
                    value={unitCostUSD}
                    onChange={(e) => setUnitCostUSD(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs font-mono tabular-nums focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {getUIText(language, { ku: 'شوێن لە کۆگا', ar: 'موقع التخزين', en: 'Bin Location' })}
                  </label>
                  <input
                    type="text"
                    value={binLocation}
                    onChange={(e) => setBinLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  {getUIText(language, { ku: 'پاشگەزبوونەوە', ar: 'إلغاء', en: 'Cancel' })}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {getUIText(language, { ku: 'پاشەکەوتکردن', ar: 'حفظ المادة', en: 'Save Item' })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
