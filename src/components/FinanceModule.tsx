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
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {language === 'ku'
                    ? 'دەروازەی خەرجکردنی دارایی و کۆنتڕۆڵی تەرخانکراوەکان'
                    : 'Executive Financial Commitments & Treasury Disbursals'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {language === 'ku'
                  ? 'بەپێی یاسای سیستەم، هیچ بڕە پارەیەک خەرج ناکرێت بەبێ پەسەندکردنی یەک لە دوای یەکی بەڕێوەبەری پڕۆژە، بەڕێوەبەری گشتی و واژۆی کۆتایی خاوەنی هۆڵدینگ.'
                  : 'Zero-disbursal policy: Funds cannot be released from central treasury without sequential sign-off by Project Manager, General Manager, and ultimate Holding Owner signature.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ku' ? 'پارێزراوە بە مۆری سەرۆکایەتی' : 'Treasury Gating Active'}</span>
              </span>
            </div>
          </div>

          {/* KPI Numbers */}
          {(() => {
            const activePOs = purchaseOrders.filter(po => {
              if (selectedCompanyId !== 'ALL' && po.companyId !== selectedCompanyId) return false;
              if (selectedProjectId !== 'ALL' && po.projectId !== selectedProjectId) return false;
              return true;
            });
            const totalVal = activePOs.reduce((acc, p) => acc + p.totalAmountUSD, 0);
            const frozenVal = activePOs.filter(p => !isPoFullyApproved(p)).reduce((acc, p) => acc + p.totalAmountUSD, 0);
            const clearedVal = activePOs.filter(p => isPoFullyApproved(p) && p.financeEntry?.paymentStatus !== 'PAID').reduce((acc, p) => acc + p.totalAmountUSD, 0);
            const settledVal = activePOs.filter(p => p.financeEntry?.paymentStatus === 'PAID').reduce((acc, p) => acc + p.totalAmountUSD, 0);

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {language === 'ku' ? 'کۆی داواکارییە داراییەکان' : 'Total Requisition Value'}
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                    ${totalVal.toLocaleString()} USD
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {activePOs.length} {language === 'ku' ? 'مامەڵەی دارایی' : 'Financial Requisitions'}
                  </span>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center justify-between">
                    <span>{language === 'ku' ? 'بەستراو لە ڕێڕەو (Frozen)' : 'Frozen in Approval Chain'}</span>
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                  </span>
                  <div className="text-xl font-extrabold text-amber-950 mt-1 font-mono">
                    ${frozenVal.toLocaleString()} USD
                  </div>
                  <span className="text-[10px] text-amber-700 mt-1 block font-medium">
                    {activePOs.filter(p => !isPoFullyApproved(p)).length} {language === 'ku' ? 'چاوەڕوانی واژۆیە (خەرجکردن ڕاگیراوە)' : 'Awaiting sign-off (Disbursal Blocked)'}
                  </span>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                    <span>{language === 'ku' ? 'ئامادە بۆ خەرجکردن (Cleared)' : 'Cleared for Disbursal'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                  <div className="text-xl font-extrabold text-emerald-950 mt-1 font-mono">
                    ${clearedVal.toLocaleString()} USD
                  </div>
                  <span className="text-[10px] text-emerald-700 mt-1 block font-medium">
                    {activePOs.filter(p => isPoFullyApproved(p) && p.financeEntry?.paymentStatus !== 'PAID').length} {language === 'ku' ? 'پەسەندکراوی تەواو - چاوەڕوانی پارەدان' : 'Authorized - Ready for Release'}
                  </span>
                </div>

                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center justify-between">
                    <span>{language === 'ku' ? 'خەرجکراو لە خەزێنە (Settled)' : 'Settled & Disbursed'}</span>
                    <Coins className="w-3.5 h-3.5 text-blue-600" />
                  </span>
                  <div className="text-xl font-extrabold text-blue-950 mt-1 font-mono">
                    ${settledVal.toLocaleString()} USD
                  </div>
                  <span className="text-[10px] text-blue-700 mt-1 block font-medium">
                    {activePOs.filter(p => p.financeEntry?.paymentStatus === 'PAID').length} {language === 'ku' ? 'پسوولەی پارەدراو' : 'Completed Vouchers'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setCommitmentFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                commitmentFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {language === 'ku' ? 'هەموو پابەندییەکان' : 'All Commitments'}
            </button>
            <button
              onClick={() => setCommitmentFilter('CLEARED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                commitmentFilter === 'CLEARED' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {language === 'ku' ? 'ئامادە بۆ خەرجکردن (Cleared)' : 'Ready for Payment'}
            </button>
            <button
              onClick={() => setCommitmentFilter('FROZEN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                commitmentFilter === 'FROZEN' ? 'bg-amber-600 text-white' : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              {language === 'ku' ? 'بەستراو لە پەسەندکردن (Frozen)' : 'Frozen in Pipeline'}
            </button>
            <button
              onClick={() => setCommitmentFilter('SETTLED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                commitmentFilter === 'SETTLED' ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              {language === 'ku' ? 'پارەدراو لە خەزێنە (Settled)' : 'Settled Vouchers'}
            </button>
          </div>

          {/* Commitments Table */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">PO Ref / Purpose</th>
                    <th className="py-3 px-4">Subsidiary / Supplier</th>
                    <th className="py-3 px-4 text-right">Commitment ($)</th>
                    <th className="py-3 px-4">Sequential Approval Chain</th>
                    <th className="py-3 px-4">Treasury Clearance</th>
                    <th className="py-3 px-4 text-right">Disbursal Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {purchaseOrders
                    .filter(po => {
                      if (selectedCompanyId !== 'ALL' && po.companyId !== selectedCompanyId) return false;
                      if (selectedProjectId !== 'ALL' && po.projectId !== selectedProjectId) return false;
                      if (commitmentFilter === 'CLEARED') return isPoFullyApproved(po) && po.financeEntry?.paymentStatus !== 'PAID';
                      if (commitmentFilter === 'FROZEN') return !isPoFullyApproved(po);
                      if (commitmentFilter === 'SETTLED') return po.financeEntry?.paymentStatus === 'PAID';
                      return true;
                    })
                    .map(po => {
                      const comp = companies.find(c => c.id === po.companyId);
                      const isApproved = isPoFullyApproved(po);
                      const isPaid = po.financeEntry?.paymentStatus === 'PAID';
                      const currentPending = po.workflowState?.steps?.find(s => s.status === 'PENDING');

                      return (
                        <tr key={po.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-blue-600 block">{po.poNumber}</span>
                            <span className="text-slate-800 font-semibold">{po.purpose}</span>
                            {po.projectFundDeduction && (
                              <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-mono block mt-1 w-fit">
                                🏷️ لە پارەی پڕۆژە کەمکرایەوە بۆ کڕین: ${po.projectFundDeduction.amountUSD.toLocaleString()} ({po.projectFundDeduction.procurementStatus})
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{comp?.nameKu || comp?.name || 'Subsidiary'}</span>
                            <span className="text-slate-500 text-[11px]">{po.supplierName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                            ${po.totalAmountUSD.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {po.workflowState?.steps.map((st) => {
                                const done = st.status === 'APPROVED';
                                const cur = st.status === 'PENDING' && st.stepNumber === po.workflowState?.currentStepNumber;
                                return (
                                  <span
                                    key={st.stepNumber}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border ${
                                      done
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : cur
                                        ? 'bg-blue-50 text-blue-800 border-blue-300 animate-pulse'
                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}
                                    title={st.titleEn}
                                  >
                                    {done ? <Check className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-blue-600" />}
                                    <span>{st.role.replace('_', ' ')}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {isPaid ? (
                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[10px] flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>{language === 'ku' ? 'پارە دراوە (Disbursed)' : 'Disbursed & Settled'}</span>
                              </span>
                            ) : isApproved ? (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{language === 'ku' ? 'ڕێگەپێدراوە بۆ خەرجکردن' : 'Cleared by Owner'}</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px] flex items-center gap-1 w-fit">
                                <Lock className="w-3.5 h-3.5 text-amber-600" />
                                <span>{language === 'ku' ? `بەستراوە (چاوەڕوانی ${currentPending?.titleKu || 'واژۆ'}یە)` : `Frozen (Awaiting ${currentPending?.role || 'Approval'})`}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isPaid ? (
                              <span className="text-[10px] font-mono text-slate-400">
                                {po.financeEntry?.voucherNo || 'VOUCH-PAID'}
                              </span>
                            ) : isApproved ? (
                              <button
                                onClick={() => disbursePoPayment(po.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 ml-auto"
                              >
                                <Coins className="w-3.5 h-3.5" />
                                <span>{language === 'ku' ? 'خەرجکردن لە خەزێنە' : 'Disburse Funds'}</span>
                              </button>
                            ) : (
                              <button
                                disabled
                                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-[11px] border border-slate-200 flex items-center gap-1 ml-auto cursor-not-allowed opacity-75"
                                title="خەرجکردن ڕاگیراوە هەتا سەرجەم قۆناغەکانی پەسەندکردن تەواو دەبن"
                              >
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span>{language === 'ku' ? 'پارەدان قفڵە' : 'Disbursal Locked'}</span>
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
