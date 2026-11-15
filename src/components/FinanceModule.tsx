import React, { useState } from 'react';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileCheck2,
  ScanLine,
  Plus,
  Filter,
  Download,
  Building2,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Check,
  Trash2,
  ArrowRightLeft,
  Scale,
  Lock,
  Clock,
  Coins,
  CreditCard,
  AlertTriangle,
  Crown
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { FinanceLedgerEntry, PurchaseOrder } from '../types/erp';
import { getUIText } from '../utils/langHelper';
import { IntercompanyConsolidationModule } from './finance/IntercompanyConsolidationModule';

export const FinanceModule: React.FC = () => {
  const {
    financeLedgers,
    addFinanceEntry,
    deleteFinanceEntry,
    resetAllFinancialsToZero,
    companies,
    projects,
    selectedCompanyId,
    selectedProjectId,
    currentUser,
    purchaseOrders,
    isPoFullyApproved,
    disbursePoPayment,
  } = useERP();

  const { t, language } = useLanguage();

  const [financeSubTab, setFinanceSubTab] = useState<'LEDGER' | 'INTERCOMPANY_CONSOLIDATION' | 'WORKFLOW_COMMITMENTS'>('WORKFLOW_COMMITMENTS');
  const [commitmentFilter, setCommitmentFilter] = useState<'ALL' | 'CLEARED' | 'FROZEN' | 'SETTLED'>('ALL');
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [accountName, setAccountName] = useState('Accounts Payable - Raw Materials');
  const [debitUSD, setDebitUSD] = useState<number>(0);
  const [creditUSD, setCreditUSD] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [targetCompany, setTargetCompany] = useState(companies[0]?.id || 'comp-1');

  const filteredEntries = financeLedgers.filter((entry) => {
    if (selectedCompanyId !== 'ALL' && entry.companyId !== selectedCompanyId) return false;
    if (selectedProjectId !== 'ALL' && entry.projectId !== selectedProjectId) return false;
    return true;
  });

  const totalDebits = filteredEntries.reduce((sum, e) => sum + (e.debitUSD || 0), 0);
  const totalCredits = filteredEntries.reduce((sum, e) => sum + (e.creditUSD || 0), 0);
  const netVariance = totalDebits - totalCredits;

  const handleAddManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    addFinanceEntry({
      companyId: targetCompany,
      projectId: 'proj-101',
      entryDate: new Date().toISOString().split('T')[0],
      accountName,
      debitUSD: Number(debitUSD),
      creditUSD: Number(creditUSD),
      description,
      sourceModule: 'MANUAL_JOURNAL',
      postedBy: currentUser.name,
    });
    setIsAddEntryOpen(false);
    setDescription('');
    setDebitUSD(0);
    setCreditUSD(0);
  };

  const handleConfirmReset = () => {
    resetAllFinancialsToZero();
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Finance Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs w-fit flex-wrap">
        <button
          onClick={() => setFinanceSubTab('WORKFLOW_COMMITMENTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            financeSubTab === 'WORKFLOW_COMMITMENTS'
              ? 'bg-blue-600 text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>
            {getUIText(language, {
              en: 'Workflow Commitments & Disbursal Gate',
              ku: 'کۆنتڕۆڵی تەرخانکراو و خەرجکردنی دارایی',
              ar: 'الارتباطات المالية وبوابة الصرف المشروطة'
            })}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
            financeSubTab === 'WORKFLOW_COMMITMENTS' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            {purchaseOrders.filter(p => !isPoFullyApproved(p)).length} {language === 'ku' ? 'پێویستە' : 'Pending'}
          </span>
        </button>

        <button
          onClick={() => setFinanceSubTab('INTERCOMPANY_CONSOLIDATION')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            financeSubTab === 'INTERCOMPANY_CONSOLIDATION'
              ? 'bg-blue-600 text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>
            {getUIText(language, {
              en: 'Intercompany & Consolidation (IFRS 10)',
              ku: 'فاکتۆری دوولایەنە و هاوسەنگیی هۆڵدینگ',
              ar: 'المعاملات البينية وتوحيد القوائم'
            })}
          </span>
        </button>

        <button
          onClick={() => setFinanceSubTab('LEDGER')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            financeSubTab === 'LEDGER'
              ? 'bg-blue-600 text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>
            {getUIText(language, {
              en: 'General Ledger & Journal Vouchers',
              ku: 'دەفتەری حیسابات و قەیدە داراییەکان',
              ar: 'دفتر الأستاذ العام والقيود اليومية'
            })}
          </span>
        </button>
      </div>

      {financeSubTab === 'WORKFLOW_COMMITMENTS' ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  {language === 'ku'
                    ? 'کۆنتڕۆڵی تەرخانکراوی دارایی و دەروازەی سەرفکردن'
                    : 'Financial Encumbrances & Treasury Disbursal Gate'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {language === 'ku'
                  ? 'هیچ بڕە پارەیەک لە خەزێنە سەرف ناکرێت هەتا بەش ← بەڕێوەبەری کۆمپانیا ← خاوەنی هۆڵدینگ ڕەزامەندی یەک لە دوای یەک نەدەن.'
                  : 'Strict zero-disbursal policy: Encumbered procurement funds remain frozen until sequential approval from Department → Company Manager → Holding Owner is complete.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold shrink-0">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'ku' ? 'دەروازەی سەرفکردنی سێ-قۆناغی چالاکە' : '3-Tier Treasury Gating Active'}</span>
            </div>
          </div>

          {/* KPI Numbers */}
          {(() => {
            const activePOs = purchaseOrders.filter(po => {
              if (selectedCompanyId !== 'ALL' && po.companyId !== selectedCompanyId) return false;
              if (selectedProjectId !== 'ALL' && po.projectId !== selectedProjectId) return false;
              return true;
            });
            const isPoRejected = (p: PurchaseOrder) =>
              p.status === 'REJECTED_BY_OWNER' || p.workflowState?.finalDecision === 'REJECTED';
            const totalVal = activePOs.filter(p => !isPoRejected(p)).reduce((acc, p) => acc + p.totalAmountUSD, 0);
            const frozenPOs = activePOs.filter(p => !isPoRejected(p) && !isPoFullyApproved(p));
            const frozenVal = frozenPOs.reduce((acc, p) => acc + p.totalAmountUSD, 0);
            const clearedPOs = activePOs.filter(p => !isPoRejected(p) && isPoFullyApproved(p) && p.financeEntry?.paymentStatus !== 'PAID');
            const clearedVal = clearedPOs.reduce((acc, p) => acc + p.totalAmountUSD, 0);
            const settledPOs = activePOs.filter(p => p.financeEntry?.paymentStatus === 'PAID');
            const settledVal = settledPOs.reduce((acc, p) => acc + p.totalAmountUSD, 0);

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4">
                  <span className="text-xs font-semibold text-slate-500">
                    {language === 'ku' ? 'کۆی داواکارییە چالاکەکان' : 'Active Requisition Value'}
                  </span>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                    ${totalVal.toLocaleString()} USD
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {activePOs.filter(p => !isPoRejected(p)).length} {language === 'ku' ? 'مامەڵەی چالاک' : 'Active Requests'}
                  </span>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4">
                  <span className="text-xs font-semibold text-amber-800 flex items-center justify-between">
                    <span>{language === 'ku' ? 'بەستراو لە ڕێڕەو (Encumbered)' : 'Encumbered in Chain'}</span>
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                  </span>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                    ${frozenVal.toLocaleString()} USD
                  </div>
                  <span className="text-[11px] text-amber-700 mt-1 block font-medium">
                    {frozenPOs.length} {language === 'ku' ? 'چاوەڕوانی ڕەزامەندی (سەرفکردن قفڵە)' : 'Awaiting consent (Disbursal Locked)'}
                  </span>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4">
                  <span className="text-xs font-semibold text-emerald-800 flex items-center justify-between">
                    <span>{language === 'ku' ? 'ئامادە بۆ خەرجکردن (Cleared)' : 'Cleared for Disbursal'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                    ${clearedVal.toLocaleString()} USD
                  </div>
                  <span className="text-[11px] text-emerald-700 mt-1 block font-medium">
                    {clearedPOs.length} {language === 'ku' ? 'خاوەن هۆڵدینگ پەسەندی کردووە' : 'Owner-Authorized · Ready to Pay'}
                  </span>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4">
                  <span className="text-xs font-semibold text-blue-800 flex items-center justify-between">
                    <span>{language === 'ku' ? 'خەرجکراو لە خەزێنە (Settled)' : 'Settled & Disbursed'}</span>
                    <Coins className="w-3.5 h-3.5 text-blue-600" />
                  </span>
                  <div className="text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                    ${settledVal.toLocaleString()} USD
                  </div>
                  <span className="text-[11px] text-blue-700 mt-1 block font-medium">
                    {settledPOs.length} {language === 'ku' ? 'پسوولەی پارەدراو' : 'Completed Vouchers'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit max-w-full overflow-x-auto">
            <button
              onClick={() => setCommitmentFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                commitmentFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ku' ? 'هەموو پابەندییەکان' : 'All Commitments'}
            </button>
            <button
              onClick={() => setCommitmentFilter('CLEARED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                commitmentFilter === 'CLEARED' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ku' ? 'ئامادە بۆ سەرفکردن' : 'Cleared for Disbursal'}
            </button>
            <button
              onClick={() => setCommitmentFilter('FROZEN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                commitmentFilter === 'FROZEN' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ku' ? 'بەستراو لە پەسەندکردن' : 'Encumbered / Pending'}
            </button>
            <button
              onClick={() => setCommitmentFilter('SETTLED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                commitmentFilter === 'SETTLED' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ku' ? 'سەرفکراو' : 'Settled Vouchers'}
            </button>
          </div>

          {/* Commitments Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{getUIText(language, { ku: 'فەرمانی کڕین · تەرخانکراو', ar: 'رقم الطلب · الحجز المالي', en: 'PO Ref · Encumbrance' })}</th>
                    <th className="py-3 px-4">{getUIText(language, { ku: 'کۆمپانیا · بەش · دابینکەر', ar: 'الشركة · القسم · المورد', en: 'Company · Department · Supplier' })}</th>
                    <th className="py-3 px-4 text-end">{getUIText(language, { ku: 'بڕی پارە (USD)', ar: 'المبلغ (دولار)', en: 'Amount (USD)' })}</th>
                    <th className="py-3 px-4">{getUIText(language, { ku: 'ڕەزامەندی ٣ قۆناغی', ar: 'سلسلة الموافقات', en: '3-Tier Approval Chain' })}</th>
                    <th className="py-3 px-4">{getUIText(language, { ku: 'باری خەزێنە و پارەدان', ar: 'حالة الصرف المالي', en: 'Treasury Clearance' })}</th>
                    <th className="py-3 px-4 text-end">{getUIText(language, { ku: 'کرداری سەرفکردن', ar: 'إجراء الصرف', en: 'Disbursal Action' })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseOrders
                    .filter(po => {
                      if (selectedCompanyId !== 'ALL' && po.companyId !== selectedCompanyId) return false;
                      if (selectedProjectId !== 'ALL' && po.projectId !== selectedProjectId) return false;
                      const rejected = po.status === 'REJECTED_BY_OWNER' || po.workflowState?.finalDecision === 'REJECTED';
                      if (commitmentFilter === 'CLEARED') return !rejected && isPoFullyApproved(po) && po.financeEntry?.paymentStatus !== 'PAID';
                      if (commitmentFilter === 'FROZEN') return !rejected && !isPoFullyApproved(po);
                      if (commitmentFilter === 'SETTLED') return po.financeEntry?.paymentStatus === 'PAID';
                      return true;
                    })
                    .map(po => {
                      const comp = companies.find(c => c.id === po.companyId);
                      const isRejected = po.status === 'REJECTED_BY_OWNER' || po.workflowState?.finalDecision === 'REJECTED';
                      const isApproved = !isRejected && isPoFullyApproved(po);
                      const isPaid = po.financeEntry?.paymentStatus === 'PAID' || po.financeSync?.encumbranceStatus === 'DISBURSED';
                      const currentPending = po.workflowState?.steps?.find(s => s.status === 'PENDING');

                      return (
                        <tr key={po.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">{po.poNumber}</span>
                              {po.financeSync?.encumbranceRef && (
                                <span className="font-mono text-[10px] text-slate-500">· {po.financeSync.encumbranceRef}</span>
                              )}
                            </div>
                            <span className="text-slate-700 font-medium block mt-0.5">{po.purpose}</span>
                            {po.financeSync && (
                              <span className={`text-[10px] font-medium block mt-0.5 ${po.financeSync.withinBudget ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {po.financeSync.withinBudget
                                  ? getUIText(language, { ku: 'لە ناو سنووری بودجەی کۆمپانیادایە', ar: 'ضمن ميزانية الشركة', en: 'Within subsidiary budget' })
                                  : getUIText(language, { ku: 'زیادە لە بودجەی تەرخانکراو', ar: 'يتجاوز الميزانية المخصصة', en: 'Exceeds allocated budget' })}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-900 block">{comp?.nameKu || comp?.name || getUIText(language, { ku: 'کۆمپانیا', ar: 'شركة', en: 'Subsidiary' })}</span>
                            <span className="text-slate-500 text-[11px]">
                              {language === 'ku' ? (po.departmentNameKu || 'بەشی کۆمپانیا') : language === 'ar' ? (po.departmentNameAr || 'القسم') : (po.departmentName || 'Company Dept')} · {po.supplierName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-end font-mono tabular-nums font-bold text-slate-900 text-sm">
                            ${po.totalAmountUSD.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2 flex-wrap text-[11px]">
                              {po.workflowState?.steps.map((st, idx) => {
                                const done = st.status === 'APPROVED';
                                const rej = st.status === 'REJECTED';
                                const cur = !isRejected && st.status === 'PENDING' && st.stepNumber === currentPending?.stepNumber;
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
                                      title={language === 'ku' ? st.titleKu : st.titleEn}
                                    >
                                      {done ? <Check className="w-3 h-3" /> : rej ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                      <span>{getUIText(language, { ku: `ق${st.stepNumber}`, ar: `م${st.stepNumber}`, en: `L${st.stepNumber}` })}</span>
                                    </span>
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {isPaid ? (
                              <span className="text-blue-700 font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{getUIText(language, { ku: 'سەرفکراوە', ar: 'تم الصرف', en: 'Disbursed & Settled' })}</span>
                              </span>
                            ) : isRejected ? (
                              <span className="text-rose-700 font-semibold inline-flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>{getUIText(language, { ku: 'ڕەتکراوەتەوە (تەرخانکراو هەڵوەشاوە)', ar: 'مرفوض (تحرر الحجز)', en: 'Rejected (Encumbrance Released)' })}</span>
                              </span>
                            ) : isApproved ? (
                              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{getUIText(language, { ku: 'پەسەندکراوی تەواو — ئامادە بۆ پارەدان', ar: 'معتمد نهائياً — جاهز للصرف', en: 'Cleared by Holding Owner' })}</span>
                              </span>
                            ) : (
                              <span className="text-amber-700 font-semibold inline-flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5" />
                                <span>{getUIText(language, {
                                  ku: `بەستراوە (قۆناغی ${currentPending?.stepNumber || 1})`,
                                  ar: `محجوز (المستوى ${currentPending?.stepNumber || 1})`,
                                  en: `Encumbered (Awaiting Tier ${currentPending?.stepNumber || 1})`
                                })}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-end">
                            {isPaid ? (
                              <span className="text-[11px] font-mono text-slate-500">
                                {po.financeEntry?.voucherNo || 'VOUCH-PAID'}
                              </span>
                            ) : isApproved ? (
                              <button
                                onClick={() => disbursePoPayment(po.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                              >
                                <Coins className="w-3.5 h-3.5" />
                                <span>{getUIText(language, { ku: 'سەرفکردن لە خەزێنە', ar: 'صرف من الخزينة', en: 'Disburse Funds' })}</span>
                              </button>
                            ) : (
                              <button
                                disabled
                                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 font-semibold text-xs border border-slate-200 inline-flex items-center gap-1 cursor-not-allowed whitespace-nowrap"
                              >
                                <Lock className="w-3 h-3" />
                                <span>{isRejected
                                  ? getUIText(language, { ku: 'ڕاگیراوە', ar: 'متوقف', en: 'Blocked' })
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
      ) : financeSubTab === 'INTERCOMPANY_CONSOLIDATION' ? (
        <IntercompanyConsolidationModule />
      ) : (
        <>
          {/* Finance Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {t('navFinance')} & General Ledger
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Real-time accounting, accounts payable, and zero-based balance auditing.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition cursor-pointer"
                title={getUIText(language, { en: 'Reset all accounting figures and mock entries to 0', ku: 'سفرکردنەوەی هەموو ژمارە داراییەکان بۆ 0', ar: 'تصفير كافة الأرقام المالية إلى 0' })}
                id="reset-financials-btn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{getUIText(language, { en: 'Zero-Base Reset', ku: 'سفرکردنەوەی ژمارەکان بۆ 0', ar: 'تصفير الحسابات إلى 0' })}</span>
              </button>

              <button
                onClick={() => setIsAddEntryOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition transform active:scale-95 cursor-pointer"
                id="new-journal-entry-btn"
              >
                <Plus className="w-4 h-4" />
                <span>{getUIText(language, { en: 'New Journal Voucher', ku: 'قەیدی دارایی نوێ', ar: 'قيد محاسبي جديد' })}</span>
              </button>
            </div>
          </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Debit (Accruals & Purchases)</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            ${totalDebits.toLocaleString()} USD
          </div>
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{filteredEntries.filter(e => e.sourceModule === 'GATE_SCAN_AUTO').length} Auto-Posted from Gate</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Credit (Payments & Liabilities)</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            ${totalCredits.toLocaleString()} USD
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Balanced Ledger Entries
          </div>
        </div>

        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Zero-Base Accounting Standard</span>
          <div className="text-2xl font-extrabold text-blue-900 mt-1 font-mono">
            ${netVariance.toLocaleString()} USD
          </div>
          <div className="text-xs text-blue-700 mt-1 font-medium">
            Net Ledger Variance • Clean audit readiness
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">General Ledger & Journal Vouchers</h2>
            <p className="text-xs text-slate-500">Chronological transaction audit trail.</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
            {filteredEntries.length} Recorded Entries
          </span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {getUIText(language, {
                  en: 'General Ledger Cleared to Zero-Base',
                  ku: 'دەفتەری حیسابات لەسەر 0 داندراوە و پاککراوەتەوە',
                  ar: 'دفتر الأستاذ العام مصفّر ومطهر بالكامل'
                })}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {getUIText(language, {
                  en: 'No dummy entries exist. You can record live financial vouchers using the New Journal Voucher button.',
                  ku: 'هیچ ژمارە و قەیدێکی نادروست بوونی نییە. ئێستا دەتوانیت لە ڕێگەی دوگمەی "قەیدی دارایی نوێ" قەیدی دارایی ڕاستەقینە تۆمار بکەیت.',
                  ar: 'لا توجد قيود وهمية. يمكنك الآن تسجيل قيود مالية حقيقية عبر زر قيد محاسبي جديد.'
                })}
              </p>
            </div>
            <button
              onClick={() => setIsAddEntryOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{getUIText(language, { en: 'Record New Voucher', ku: 'تۆمارکردنی قەیدی نوێ', ar: 'تسجيل قيد جديد' })}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Voucher / Date</th>
                  <th className="py-3 px-4">Account Name</th>
                  <th className="py-3 px-4">Subsidiary / Project</th>
                  <th className="py-3 px-4">Source Origin</th>
                  <th className="py-3 px-4 text-right">Debit ($)</th>
                  <th className="py-3 px-4 text-right">Credit ($)</th>
                  <th className="py-3 px-4">Posted By</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredEntries.map((entry) => {
                  const comp = companies.find(c => c.id === entry.companyId);
                  const isAutoGate = entry.sourceModule === 'GATE_SCAN_AUTO';
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">{entry.voucherNumber}</div>
                        <span className="text-[10px] text-slate-400">{entry.entryDate}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 font-bold text-xs">{entry.accountName}</div>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{entry.description}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                          {comp?.name || 'Subsidiary'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isAutoGate ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            <ScanLine className="w-3 h-3" /> Gate Barcode Auto
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                            {entry.sourceModule}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                        {entry.debitUSD > 0 ? `$${entry.debitUSD.toLocaleString()}` : '$0'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                        {entry.creditUSD > 0 ? `$${entry.creditUSD.toLocaleString()}` : '$0'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {entry.postedBy}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => deleteFinanceEntry(entry.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="سڕینەوەی ئەم قەید و خەرجییە (Delete entry)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal to Reset Financials to 0 */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900">
                {getUIText(language, {
                  en: 'Zero-Base Reset All Financial Numbers?',
                  ku: 'سفرکردنەوەی سەرجەم ژمارە داراییەکان؟',
                  ar: 'تصفير كافة الأرقام المالية؟'
                })}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {getUIText(language, {
                  en: 'This action clears all budgets, expenses, revenues, and ledgers to $0 to begin clean zero-base accounting.',
                  ku: 'ئەم کارە تەواوی بودجەکان، خەرجییەکان، داهاتەکان و دەفتەرە داراییەکان دەکات بە 0 دۆلار بۆ ئەوەی ژمێریاری لەسەر خاڵی سفر دەستپێبکات.',
                  ar: 'سيؤدي هذا الإجراء إلى تصفير كافة الميزانيات والمصروفات والإيرادات للبدء بمحاسبة نظيفة من الصفر.'
                })}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                {getUIText(language, { en: 'Cancel', ku: 'پاشگەزبوونەوە', ar: 'إلغاء' })}
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>
                  {getUIText(language, {
                    en: 'Yes, Reset to 0',
                    ku: 'بەڵێ، ژمارەکان بکە بە 0',
                    ar: 'نعم، قم بالتصفير إلى 0'
                  })}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* Manual Entry Modal */}
      {isAddEntryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Create Journal Entry Voucher</h3>
            
            <form onSubmit={handleAddManualEntry} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
                <select
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                >
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Debit ($)</label>
                  <input
                    type="number"
                    value={debitUSD}
                    onChange={(e) => setDebitUSD(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Credit ($)</label>
                  <input
                    type="number"
                    value={creditUSD}
                    onChange={(e) => setCreditUSD(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Memo</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddEntryOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
                >
                  Post Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
