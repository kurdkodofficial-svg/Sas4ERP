import React, { useState } from 'react';
import {
  X,
  Repeat,
  ArrowRightLeft,
  Building2,
  DollarSign,
  Layers,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { getUIText } from '../../utils/langHelper';
import { CreateBilateralInvoiceParams } from '../../types/intercompany';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateIntercompanyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { companies, projects, createBilateralIntercompanyInvoice } = useERP();
  const { language, isRtl } = useLanguage();

  const [buyerCompanyId, setBuyerCompanyId] = useState<string>(companies[0]?.id || '');
  const [sellerCompanyId, setSellerCompanyId] = useState<string>(companies[1]?.id || companies[0]?.id || '');
  const [buyerProjectId, setBuyerProjectId] = useState<string>('');
  const [category, setCategory] = useState<'RAW_MATERIALS' | 'LOGISTICS_TRANSPORT' | 'HEAVY_MACHINERY_RENTAL' | 'ENGINEERING_SERVICES' | 'SUB_CONTRACTING'>('RAW_MATERIALS');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState('Tons');
  const [unitPriceUSD, setUnitPriceUSD] = useState<number>(450);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const totalAmountUSD = Number(quantity || 0) * Number(unitPriceUSD || 0);
  const buyerComp = companies.find(c => c.id === buyerCompanyId);
  const sellerComp = companies.find(c => c.id === sellerCompanyId);
  const buyerProjects = projects.filter(p => p.companyId === buyerCompanyId);

  const isSameCompany = buyerCompanyId === sellerCompanyId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSameCompany) return;
    if (!title.trim() || totalAmountUSD <= 0) return;

    createBilateralIntercompanyInvoice({
      buyerCompanyId,
      sellerCompanyId,
      buyerProjectId: buyerProjectId || undefined,
      title: title.trim(),
      description: description.trim() || `Intercompany delivery of ${quantity} ${unit} for ${buyerComp?.name}`,
      category,
      quantity: Number(quantity),
      unit: unit.trim() || 'Units',
      unitPriceUSD: Number(unitPriceUSD),
      notes: notes.trim()
    });

    onClose();
    // Reset form
    setTitle('');
    setDescription('');
    setQuantity(100);
    setUnitPriceUSD(450);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <span>
                  {getUIText(language, {
                    en: 'New Bilateral Intercompany Invoice',
                    ku: 'دروستکردنی فاکتۆری دوولایەنەی نێوان کۆمپانیاکان',
                    ar: 'إنشاء فاتورة بينية ثنائية للمجموعة'
                  })}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold">
                  AUTO-MIRROR
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                {getUIText(language, {
                  en: 'One action creates both: Expense for buyer & Revenue for seller with holding elimination.',
                  ku: 'بە یەک کلیک دوو پسوولە دروست دەبێت: خەرجی بۆ کڕیار و داهات بۆ فرۆشیار لەگەڵ هاوسەنگکردن.',
                  ar: 'إجراء واحد ينشئ نفقة للمشتري وإيراداً للبائع مع استبعاد التكرار المالي.'
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Bilateral Entity Pairing */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              {getUIText(language, {
                en: 'Subsidiaries Pairing (Buyer & Seller)',
                ku: 'دیاریکردنی کۆمپانیاکانی کڕیار و فرۆشیار',
                ar: 'تحديد طرفي المعاملة (المشتري والبائع)'
              })}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Buyer (Expense) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{getUIText(language, { en: 'Buyer Subsidiary (Expense)', ku: 'کۆمپانیای کڕیار (خەرجی)', ar: 'الشركة المشترية (المصروف)' })}</span>
                  <span className="text-[10px] font-semibold text-rose-600">DEBIT COST</span>
                </label>
                <select
                  value={buyerCompanyId}
                  onChange={(e) => setBuyerCompanyId(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Seller (Revenue) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{getUIText(language, { en: 'Seller Subsidiary (Revenue)', ku: 'کۆمپانیای فرۆشیار (داهات)', ar: 'الشركة البائعة (الإيراد)' })}</span>
                  <span className="text-[10px] font-semibold text-emerald-600">CREDIT REV</span>
                </label>
                <select
                  value={sellerCompanyId}
                  onChange={(e) => setSellerCompanyId(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isSameCompany && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {getUIText(language, {
                    en: 'Buyer and Seller subsidiaries cannot be the same company. Intercompany transactions must occur between distinct holding entities.',
                    ku: 'کۆمپانیای کڕیار و فرۆشیار ناکرێت یەک کۆمپانیا بن. مامەڵەی دوولایەنە دەبێت لە نێوان دوو کۆمپانیای جیاوازی هۆڵدینگ بێت.',
                    ar: 'لا يمكن أن تكون الشركة المشترية والبائعة هي نفس الشركة. المعاملات البينية تتم بين كيانين مختلفين.'
                  })}
                </span>
              </div>
            )}

            {/* Optional Buyer Project */}
            {buyerProjects.length > 0 && (
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {getUIText(language, { en: 'Target Project / Cost Center (Optional)', ku: 'پڕۆژەی کڕیار / سەنتەری تێچوو (ئارەزوومەندانە)', ar: 'مشروع المشتري / مركز التكلفة' })}
                </label>
                <select
                  value={buyerProjectId}
                  onChange={(e) => setBuyerProjectId(e.target.value)}
                  className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- General Subsidiary Overhead / کۆگای سەرەکی --</option>
                  {buyerProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.nameKu || p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Transaction Category & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {getUIText(language, { en: 'Category', ku: 'جۆری کەرەستە یان خزمەتگوزاری', ar: 'التصنيف' })}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="RAW_MATERIALS">Raw Materials & Steel (کەرەستەی خاو و ئاسن)</option>
                <option value="LOGISTICS_TRANSPORT">Fleet Logistics & Freight (گواستنەوە و بارهەڵگری)</option>
                <option value="HEAVY_MACHINERY_RENTAL">Heavy Machinery Rental (بەکرێگرتنی ئامێری قورس)</option>
                <option value="ENGINEERING_SERVICES">Engineering & Technical (خزمەتگوزاری ئەندازیاری)</option>
                <option value="SUB_CONTRACTING">Internal Subcontracting (بەڵێندەرایەتی ناوخۆیی)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {getUIText(language, { en: 'Transaction Title / Reference', ku: 'ناونیشانی مامەڵە و کەرەستە', ar: 'عنوان المعاملة' })}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ready-Mix Concrete or Crane Dispatch..."
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Pricing & Quantities */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {getUIText(language, { en: 'Quantity', ku: 'بڕ (Quantity)', ar: 'الكمية' })}
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {getUIText(language, { en: 'Unit', ku: 'یەکە (Unit)', ar: 'الوحدة' })}
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Tons, Convoys, Hours..."
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {getUIText(language, { en: 'Unit Price ($)', ku: 'نرخی یەکە ($)', ar: 'سعر الوحدة' })}
              </label>
              <input
                type="number"
                min="0"
                required
                value={unitPriceUSD}
                onChange={(e) => setUnitPriceUSD(Number(e.target.value))}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Live Financial Mirror Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                {getUIText(language, {
                  en: 'Live Bilateral Impact Preview',
                  ku: 'پێشبینینی کاریگەری دوولایەنەی فاکتۆرەکان',
                  ar: 'معاينة التأثير المالي الثنائي المباشر'
                })}
              </span>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">{getUIText(language, { en: 'Bilateral Volume', ku: 'قەبارەی مامەڵەکە', ar: 'حجم المعاملة' })}</span>
                <span className="text-lg font-black text-blue-900 font-mono">
                  ${totalAmountUSD.toLocaleString()} USD
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-rose-200 shadow-2xs">
                <div className="text-[11px] font-bold text-rose-700 flex items-center justify-between">
                  <span>{buyerComp?.name || 'Buyer'}</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-50 text-[10px]">خەرجی (Cost)</span>
                </div>
                <div className="font-mono font-bold text-rose-600 mt-1">
                  +${totalAmountUSD.toLocaleString()} USD
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  تۆمار دەبێت وەک قەرز و خەرجی لە ئەکاونتی کڕیاردا
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                <div className="text-[11px] font-bold text-emerald-700 flex items-center justify-between">
                  <span>{sellerComp?.name || 'Seller'}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[10px]">داهات (Revenue)</span>
                </div>
                <div className="font-mono font-bold text-emerald-600 mt-1">
                  +${totalAmountUSD.toLocaleString()} USD
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  تۆمار دەبێت وەک داهاتی فرۆشتن لە ئەکاونتی فرۆشیاردا
                </p>
              </div>
            </div>

            {/* Holding Elimination Guarantee */}
            <div className="p-2.5 rounded-xl bg-blue-100/70 border border-blue-300 text-blue-900 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                <strong>ڕاگرتنی هاوسەنگی (Consolidation Guarantee):</strong> لە چارتەکانی هۆڵدینگدا ئەم بڕە بە تەواوی دەسڕێتەوە تا سەرمایەی خاوەن هۆڵدینگ دوو هێندە هەژمار نەکرێت.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              {getUIText(language, { en: 'Cancel', ku: 'پاشگەزبوونەوە', ar: 'إلغاء' })}
            </button>
            <button
              type="submit"
              disabled={isSameCompany || !title.trim() || totalAmountUSD <= 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Repeat className="w-4 h-4" />
              <span>
                {getUIText(language, {
                  en: 'Generate Bilateral Mirror Invoices',
                  ku: 'دروستکردنی فاکتۆری دوولایەنە (خەرجی + داهات)',
                  ar: 'توليد الفاتورتين المتقابلتين'
                })}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
