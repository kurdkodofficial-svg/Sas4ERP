import React, { useState } from 'react';
import {
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle2,
  Layers,
  TrendingDown,
  Building2,
  Plus,
  Printer,
  Sparkles,
  Info,
  Calendar,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Check,
  RotateCcw,
  Scale
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { getUIText } from '../../utils/langHelper';
import { groupInvoicesIntoBilateralPairs } from '../../data/initialIntercompanyData';
import { CreateIntercompanyModal } from './CreateIntercompanyModal';

export const IntercompanyConsolidationModule: React.FC = () => {
  const {
    companies,
    holding,
    intercompanyInvoices,
    settleIntercompanyInvoice,
    deleteIntercompanyPair,
    isConsolidationEnabled,
    setIsConsolidationEnabled,
    consolidationSummary,
    openPrintManager
  } = useERP();

  const { language, isRtl } = useLanguage();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'MUTUALLY_CONFIRMED' | 'SETTLED'>('ALL');
  const [selectedPairDetails, setSelectedPairDetails] = useState<string | null>(null);

  const bilateralPairs = groupInvoicesIntoBilateralPairs(intercompanyInvoices);

  const filteredPairs = statusFilter === 'ALL'
    ? bilateralPairs
    : bilateralPairs.filter(p => p.status === statusFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-blue-900/40">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {getUIText(language, {
                    en: 'Intercompany Bilateral Invoicing & Financial Consolidation',
                    ku: 'فاکتۆری دوولایەنە و هاوسەنگیی دارایی هۆڵدینگ (Consolidation)',
                    ar: 'الفواتير البينية الثنائية وتوحيد حسابات المجموعة'
                  })}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase">
                  IFRS 10 / GAAP
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {getUIText(language, {
                  en: 'Automated mirror billing between subsidiaries with zero-inflation consolidation elimination.',
                  ku: 'دروستبوونی خۆکارانەی فاکتۆری دوولایەنە (خەرجی بەرامبەر داهات) لەگەڵ سڕینەوەی ژماردنی دووبارە بۆ پاراستنی سەرمایەی خاوەن هۆڵدینگ.',
                  ar: 'توليد آلي للفواتير المتقابلة بين الشركات التابعة واستبعاد المعاملات الداخلية لمنع تضخيم الأرباح ورأس المال.'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Consolidation Switch Toggle */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3.5 py-2 rounded-2xl">
            <span className="text-xs font-bold text-slate-300">
              {getUIText(language, {
                en: 'Consolidation Elimination:',
                ku: 'ڕاگرتنی هاوسەنگی:',
                ar: 'استبعاد التكرار:'
              })}
            </span>
            <button
              type="button"
              onClick={() => setIsConsolidationEnabled(!isConsolidationEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isConsolidationEnabled ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isConsolidationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-[11px] font-extrabold ${isConsolidationEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isConsolidationEnabled ? 'ACTIVE (GAAP)' : 'OFF (GROSS)'}
            </span>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              {getUIText(language, {
                en: 'New Bilateral Invoices',
                ku: 'فاکتۆری دوولایەنەی نوێ',
                ar: 'فاتورة بينية جديدة'
              })}
            </span>
          </button>
        </div>
      </div>

      {/* Consolidation Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue vs Consolidated Revenue */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>
              {getUIText(language, { en: 'Consolidated Revenue', ku: 'داهاتی خاوێنکراوی هۆڵدینگ', ar: 'الإيراد الموحد الصافي' })}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ${(consolidationSummary.consolidatedRevenueUSD / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Gross: ${(consolidationSummary.grossRevenueUSD / 1000000).toFixed(2)}M</span>
            <span className="text-rose-600 font-bold font-mono">
              -${(consolidationSummary.intercompanyEliminationsUSD / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>

        {/* Gross Expenses vs Consolidated Expenses */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>
              {getUIText(language, { en: 'Consolidated Expenses', ku: 'خەرجیی خاوێنکراوی هۆڵدینگ', ar: 'المصروف الموحد الصافي' })}
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ${(consolidationSummary.consolidatedExpensesUSD / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Gross: ${(consolidationSummary.grossExpensesUSD / 1000000).toFixed(2)}M</span>
            <span className="text-rose-600 font-bold font-mono">
              -${(consolidationSummary.intercompanyEliminationsUSD / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>

        {/* Eliminated Volume */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-blue-700 font-bold uppercase tracking-wider">
            <span>
              {getUIText(language, { en: 'Intercompany Eliminated', ku: 'سڕینەوەی مامەڵەی ناوخۆ', ar: 'المستبعد من التكرار' })}
            </span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900 mt-2 font-mono">
            ${consolidationSummary.intercompanyEliminationsUSD.toLocaleString()} USD
          </div>
          <div className="text-xs text-blue-700 font-medium mt-1">
            {consolidationSummary.intercompanyPairsCount} {getUIText(language, { en: 'Active bilateral pairs neutralized', ku: 'مامەڵەی دوولایەنە لە ژماردنی دووبارە پارێزراون', ar: 'معاملة ثنائية تم استبعادها' })}
          </div>
        </div>

        {/* Double Counting Prevention Guarantee */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold uppercase tracking-wider">
            <span>
              {getUIText(language, { en: 'Equity Integrity Status', ku: 'دۆخی دروستیی سەرمایە', ar: 'سلامة رأس المال' })}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-900 mt-2 flex items-center gap-2">
            <span>100% Balanced</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">IFRS 10</span>
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-1">
            {getUIText(language, {
              en: 'Zero artificial inflation on holding net margin.',
              ku: 'هیچ هەڵئاوسانێکی دەستکرد لە قازانج و داهاتی هۆڵدینگ نییە.',
              ar: 'لا يوجد تضخيم وهمي في هوامش ربح المجموعة.'
            })}
          </div>
        </div>
      </div>

      {/* Visual Explanation Banner */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-extrabold block mb-0.5">
            {getUIText(language, {
              en: 'How Bilateral Mirror Invoicing and Consolidation Works:',
              ku: 'چۆنیەتی کارکردنی فاکتۆری دوولایەنە و هاوسەنگیی هۆڵدینگ:',
              ar: 'كيف تعمل الفواتير المتقابلة وتوحيد الحسابات:'
            })}
          </strong>
          <span>
            {getUIText(language, {
              en: 'When Subsidiary A purchases $540,000 of steel from Subsidiary B, Side 1 posts a Cost/Payable voucher for Sub A, while Side 2 simultaneously posts a Revenue/Receivable voucher for Sub B. At the Holding HQ level, SAS4ERP subtracts $540,000 from both total revenue and total expenses so the holding owner sees the true net external performance.',
              ku: 'کاتێک کۆمپانیای (A) بڕی ٥٤٠،٠٠٠ دۆلار ئاسن لە کۆمپانیای (B) دەکڕێت، سیستەم بۆ (A) بە خەرجی تۆماری دەکات و دەستبەجێ بە شێوەی خۆکارانە بۆ (B) بە داهات تۆماری دەکات. لە چارتەکانی سەرەوەی هۆڵدینگدا ٥٤٠،٠٠٠ دۆلار لە هەردوو لا دادەشکێنرێت تا سەرمایەی خاوەن هۆڵدینگ دوو هێندە هەژمار نەکرێت.',
              ar: 'عندما تشتري شركة (أ) بضاعة من شركة (ب)، يسجل النظام نفقة للأولى وإيراداً للثانية فوراً. وفي لوحة مالك المجموعة، يتم استبعاد هذا المبلغ من الطرفين لمنع احتساب نفس رأس المال مرتين.'
            })}
          </span>
        </div>
      </div>

      {/* Bilateral Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                {getUIText(language, {
                  en: 'Bilateral Mirror Invoices Registry',
                  ku: 'تۆماری فاکتۆرە دوولایەنە هاوبەشەکان',
                  ar: 'سجل الفواتير البينية المتقابلة'
                })}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                {bilateralPairs.length} {getUIText(language, { en: 'Pairs', ku: 'جووت', ar: 'أزواج' })}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {getUIText(language, {
                en: 'Synchronized pairs linked with immutable cryptographic mirror keys.',
                ku: 'جووتە فاکتۆرە بەستراوەکان بە کلیل و هاشی کریپتۆگرافی پارێزراو.',
                ar: 'أزواج فواتير متزامنة ومحمية بمفاتيح تشفير غير قابلة للتلاعب.'
              })}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getUIText(language, { en: 'All Pairs', ku: 'هەموو', ar: 'الكل' })}
            </button>
            <button
              onClick={() => setStatusFilter('MUTUALLY_CONFIRMED')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                statusFilter === 'MUTUALLY_CONFIRMED' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getUIText(language, { en: 'Active Confirmed', ku: 'پەسەندکراو', ar: 'معتمد' })}
            </button>
            <button
              onClick={() => setStatusFilter('SETTLED')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                statusFilter === 'SETTLED' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getUIText(language, { en: 'Settled', ku: 'یەکلاکراوە', ar: 'مسوى' })}
            </button>
          </div>
        </div>

        {filteredPairs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <ArrowRightLeft className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold">هیچ مامەڵەیەکی دوولایەنە لەم فلتەرەدا نییە.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" dir={isRtl ? 'rtl' : 'ltr'}>
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{getUIText(language, { en: 'Pair Code / Date', ku: 'کۆدی جووت / بەروار', ar: 'رمز المعاملة / التاريخ' })}</th>
                  <th className="py-3 px-4">{getUIText(language, { en: 'Bilateral Parties (Buyer vs Seller)', ku: 'لایەنەکان (کڕیار بەرامبەر فرۆشیار)', ar: 'طرفي المعاملة' })}</th>
                  <th className="py-3 px-4">{getUIText(language, { en: 'Title & Category', ku: 'بابەت و کەرەستە', ar: 'الوصف والتصنيف' })}</th>
                  <th className="py-3 px-4 text-right">{getUIText(language, { en: 'Volume ($)', ku: 'بڕی پارە ($)', ar: 'المبلغ' })}</th>
                  <th className="py-3 px-4 text-center">{getUIText(language, { en: 'Consolidation', ku: 'هاوسەنگی', ar: 'الاستبعاد' })}</th>
                  <th className="py-3 px-4 text-center">{getUIText(language, { en: 'Status', ku: 'دۆخ', ar: 'الحالة' })}</th>
                  <th className="py-3 px-4 text-center">{getUIText(language, { en: 'Actions', ku: 'کردارەکان', ar: 'الإجراءات' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPairs.map((pair) => {
                  const isSettled = pair.status === 'SETTLED';
                  return (
                    <tr key={pair.pairId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-extrabold text-blue-900 text-xs flex items-center gap-1.5">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                          <span>{pair.pairCode}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{pair.issueDate}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">BUYER</span>
                            <span className="font-bold text-slate-800 text-xs">{pair.buyerCompanyName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">SELLER</span>
                            <span className="font-bold text-slate-800 text-xs">{pair.sellerCompanyName}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">
                          {pair.titleKu && language === 'ku' ? pair.titleKu : pair.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {pair.category} • Ref: {pair.expenseInvoice.referencePoNumber || 'DIRECT'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className="font-black text-slate-900 text-sm">
                          ${pair.amountUSD.toLocaleString()} USD
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {(pair.amountIQD / 1000000).toFixed(1)}M IQD
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          <span>ELIMINATED</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isSettled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>SETTLED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            <span>CONFIRMED</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isSettled && (
                            <button
                              onClick={() => settleIntercompanyInvoice(pair.pairId)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer"
                              title="یەکلاکردنەوەی دارایی لە نێوان هەردوو کۆمپانیا"
                            >
                              Settle
                            </button>
                          )}
                          <button
                            onClick={() => openPrintManager(null)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="چاپکردنی بەڵگەنامەی فەرمی لە ڕێگەی PrintManager"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bilateral Invoicing Creation Modal */}
      <CreateIntercompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
