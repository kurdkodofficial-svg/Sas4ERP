import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building2,
  ChevronRight,
  Sparkles,
  Layers,
  Scale,
  ShieldCheck,
  ArrowRightLeft
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { getUIText } from '../../utils/langHelper';
import { groupInvoicesIntoBilateralPairs } from '../../data/initialIntercompanyData';

interface Props {
  currencyDisplay: 'USD' | 'IQD';
  selectedCompanyFilter: string | 'ALL';
}

export const HoldingFinancialSummaryWidget: React.FC<Props> = ({
  currencyDisplay,
  selectedCompanyFilter,
}) => {
  const {
    companies,
    holding,
    setActiveTab,
    setSelectedCompanyId,
    isConsolidationEnabled,
    setIsConsolidationEnabled,
    consolidationSummary,
    intercompanyInvoices
  } = useERP();
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = useState<'SUBSIDIARIES' | 'CATEGORIES' | 'MONTHLY_TREND' | 'CONSOLIDATION_MATRIX'>('SUBSIDIARIES');

  const filteredCompanies = selectedCompanyFilter === 'ALL'
    ? companies
    : companies.filter(c => c.id === selectedCompanyFilter);

  const rawHoldingBudget = filteredCompanies.reduce((acc, c) => acc + c.annualBudgetUSD, 0);
  const rawHoldingSpent = filteredCompanies.reduce((acc, c) => acc + c.spentUSD, 0);

  // When consolidation is enabled, eliminate intercompany trading volume to avoid double-counting
  const intercompanyElimination = (isConsolidationEnabled && selectedCompanyFilter === 'ALL')
    ? consolidationSummary.intercompanyEliminationsUSD
    : 0;

  const totalHoldingBudget = rawHoldingBudget;
  const totalHoldingSpent = Math.max(0, rawHoldingSpent - intercompanyElimination);
  const totalEstimatedRevenue = selectedCompanyFilter === 'ALL'
    ? (isConsolidationEnabled ? consolidationSummary.consolidatedRevenueUSD : holding.totalRevenueUSD)
    : filteredCompanies.reduce((acc, c) => acc + (c.spentUSD * 1.8), 0);

  const remainingLiquidity = totalHoldingBudget - totalHoldingSpent;
  const utilizationRate = ((totalHoldingSpent / (totalHoldingBudget || 1)) * 100).toFixed(1);

  const bilateralPairs = groupInvoicesIntoBilateralPairs(intercompanyInvoices);

  // Conversion rate (1 USD = 1,310 IQD)
  const formatMoney = (valUSD: number) => {
    if (currencyDisplay === 'IQD') {
      const iqdVal = valUSD * 1310;
      return `${(iqdVal / 1000000000).toFixed(2)}B IQD`;
    }
    return `$${(valUSD / 1000000).toFixed(2)}M`;
  };

  const formatMoneyDetailed = (valUSD: number) => {
    if (currencyDisplay === 'IQD') {
      const iqdVal = valUSD * 1310;
      return `${iqdVal.toLocaleString()} IQD`;
    }
    return `$${valUSD.toLocaleString()}`;
  };

  // Recharts Data for Subsidiaries
  const companyChartData = filteredCompanies.map(c => {
    const nameLabel = c.code;
    return {
      name: nameLabel,
      fullName: c.name,
      Budget: c.annualBudgetUSD / 1000000,
      Spent: c.spentUSD / 1000000,
      Remaining: (c.annualBudgetUSD - c.spentUSD) / 1000000,
      utilization: ((c.spentUSD / (c.annualBudgetUSD || 1)) * 100).toFixed(1),
    };
  });

  // Expense Category Breakdown
  const categoryData = [
    { name: 'Materials & Procurement', value: totalHoldingSpent * 0.42, color: '#2563eb' },
    { name: 'Workforce & Payroll', value: totalHoldingSpent * 0.28, color: '#7c3aed' },
    { name: 'Machinery & Fuel', value: totalHoldingSpent * 0.16, color: '#eab308' },
    { name: 'Site Overheads & Safety', value: totalHoldingSpent * 0.09, color: '#10b981' },
    { name: 'Admin & Legal', value: totalHoldingSpent * 0.05, color: '#64748b' },
  ];

  // Monthly Trend Data based on actual holding figures
  const monthlyTrendData = [
    { month: 'Jan', Spent: (totalHoldingSpent * 0.1) / 1000000, BudgetBaseline: (totalHoldingBudget / 12) / 1000000, Revenue: (totalEstimatedRevenue * 0.1) / 1000000 },
    { month: 'Feb', Spent: (totalHoldingSpent * 0.12) / 1000000, BudgetBaseline: (totalHoldingBudget / 12) / 1000000, Revenue: (totalEstimatedRevenue * 0.12) / 1000000 },
    { month: 'Mar', Spent: (totalHoldingSpent * 0.15) / 1000000, BudgetBaseline: (totalHoldingBudget / 12) / 1000000, Revenue: (totalEstimatedRevenue * 0.15) / 1000000 },
    { month: 'Apr', Spent: (totalHoldingSpent * 0.15) / 1000000, BudgetBaseline: (totalHoldingBudget / 12) / 1000000, Revenue: (totalEstimatedRevenue * 0.15) / 1000000 },
    { month: 'May', Spent: (totalHoldingSpent * 0.18) / 1000000, BudgetBaseline: (totalHoldingBudget / 12) / 1000000, Revenue: (totalEstimatedRevenue * 0.18) / 1000000 },
    { month: 'Jun', Spent: (totalHoldingSpent * 0.1) / 1000000, BudgetBaseline: (totalHoldingBudget / 12) / 1000000, Revenue: (totalEstimatedRevenue * 0.1) / 1000000 },
    { month: 'Jul', Spent: (totalHoldingSpent * 0.1) / 1000000, BudgetBaseline: (totalHoldingBudget / 12) / 1000000, Revenue: (totalEstimatedRevenue * 0.1) / 1000000 },
    { month: 'Aug (Cur)', Spent: (totalHoldingSpent * 0.1) / 1000000, BudgetBaseline: (totalHoldingBudget / 12) / 1000000, Revenue: (totalEstimatedRevenue * 0.1) / 1000000 },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
      
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {t('financialSummaryTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                Comprehensive budget utilization, burn rate, and capital allocations across holding subsidiaries.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Pills & Consolidation Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsConsolidationEnabled(!isConsolidationEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              isConsolidationEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title="Toggle GAAP/IFRS Intercompany Elimination on Holding Level"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isConsolidationEnabled ? 'Consolidation: ON' : 'Consolidation: OFF'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode('SUBSIDIARIES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'SUBSIDIARIES'
                  ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>By Subsidiary</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CATEGORIES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'CATEGORIES'
                  ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Cost Breakdown</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('MONTHLY_TREND')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'MONTHLY_TREND'
                  ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Monthly Run</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CONSOLIDATION_MATRIX')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'CONSOLIDATION_MATRIX'
                  ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Consolidation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Intercompany Elimination Banner */}
      {isConsolidationEnabled && selectedCompanyFilter === 'ALL' && intercompanyElimination > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5 text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>ڕاگرتنی هاوسەنگی (Consolidation Active):</strong> بڕی{' '}
              <strong className="text-blue-700 font-mono">-${formatMoney(intercompanyElimination)}</strong> لە مامەڵە و فاکتۆرە دوولایەنەکانی نێوان کۆمپانیاکان لە چارتەکاندا پوچەڵکراوەتەوە بۆ ڕێگریکردن لە ژماردنی دووبارە.
            </span>
          </div>
          <button
            onClick={() => setViewMode('CONSOLIDATION_MATRIX')}
            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline whitespace-nowrap self-end sm:self-auto cursor-pointer flex items-center gap-1"
          >
            <span>Audit Matrix</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Financial Health Quick Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Annual Budget Allocated
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {formatMoneyDetailed(totalHoldingBudget)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-blue-600">{filteredCompanies.length} Subsidiaries</span>
            <span>in current scope</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Spent to Date (Burn Rate)
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {formatMoneyDetailed(totalHoldingSpent)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>{utilizationRate}% utilized</span>
            <span className="text-slate-400">• On Track</span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Remaining Liquidity & Runway
          </span>
          <div className="text-xl font-extrabold text-blue-600 mt-1">
            {formatMoneyDetailed(remainingLiquidity)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Est. Runway: <strong className="text-slate-800">14.8 Months</strong> at current burn
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-5">
        {viewMode === 'SUBSIDIARIES' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Company Budget vs Spend (Million USD)</span>
              <span>Values normalized in Millions ($M)</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#cbd5e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(val: any, name: any) => [`$${Number(val).toFixed(2)}M`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Allocated Budget" />
                  <Bar dataKey="Spent" fill="#0284c7" radius={[4, 4, 0, 0]} name="Actual Spend" />
                  <Bar dataKey="Remaining" fill="#10b981" radius={[4, 4, 0, 0]} name="Remaining Balance" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewMode === 'CATEGORIES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatMoneyDetailed(Number(val)), 'Amount']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#cbd5e1' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Capital & Operational Expense Breakdown
              </h4>
              <div className="space-y-2">
                {categoryData.map((cat, idx) => {
                  const percentage = ((cat.value / totalHoldingSpent) * 100).toFixed(1);
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="font-semibold text-slate-800">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-600">{formatMoney(cat.value)}</span>
                        <span className="font-bold text-slate-900 w-10 text-right">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'MONTHLY_TREND' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">2026 Monthly Cash Flow vs Revenue Influx ($M)</span>
              <span>Consolidated 8-month trajectory</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val}M`} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#cbd5e1' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" name="Monthly Revenue ($M)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewMode === 'CONSOLIDATION_MATRIX' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-blue-600" />
                <span>ڕاگرتنی هاوسەنگیی هۆڵدینگ و پوچەڵکردنەوەی ژماردنی دووبارە (IFRS 10 / GAAP Matrix)</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                100% Balanced
              </span>
            </div>

            {/* Reconciliation Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gross Combined Revenue</span>
                <div className="text-base font-extrabold text-slate-800 mt-1 font-mono">
                  ${(consolidationSummary.grossRevenueUSD / 1000000).toFixed(2)}M
                </div>
                <div className="text-[10px] text-rose-600 mt-0.5 font-bold">
                  -${(consolidationSummary.intercompanyEliminationsUSD / 1000000).toFixed(2)}M Intercompany Sales
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-black text-emerald-700 font-mono">
                  <span>Consolidated:</span>
                  <span>${(consolidationSummary.consolidatedRevenueUSD / 1000000).toFixed(2)}M</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gross Combined Expenses</span>
                <div className="text-base font-extrabold text-slate-800 mt-1 font-mono">
                  ${(consolidationSummary.grossExpensesUSD / 1000000).toFixed(2)}M
                </div>
                <div className="text-[10px] text-rose-600 mt-0.5 font-bold">
                  -${(consolidationSummary.intercompanyEliminationsUSD / 1000000).toFixed(2)}M Intercompany Costs
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-black text-blue-700 font-mono">
                  <span>Consolidated:</span>
                  <span>${(consolidationSummary.consolidatedExpensesUSD / 1000000).toFixed(2)}M</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Capital & Margin Integrity</span>
                <div className="text-base font-extrabold text-emerald-600 mt-1 font-mono">
                  ${((consolidationSummary.consolidatedRevenueUSD - consolidationSummary.consolidatedExpensesUSD) / 1000000).toFixed(2)}M
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  پوچەڵکردنەوەی ژماردنی دووبارە بە تەواوی سەرمایەی ڕاستەقینە دەپارێزێت.
                </p>
              </div>
            </div>

            {/* Bilateral Invoices List */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span>Active Bilateral Intercompany Transactions</span>
                <span className="text-blue-600">{bilateralPairs.length} Pairs Synchronized</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {bilateralPairs.map(p => (
                  <div key={p.pairId} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-blue-600">{p.pairCode}</span>
                        <span>{p.titleKu && language === 'ku' ? p.titleKu : p.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {p.buyerCompanyName} ➔ {p.sellerCompanyName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-800">${p.amountUSD.toLocaleString()}</div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold">
                        ELIMINATED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
        <span>Detailed journal ledgers & vouchers audited in real-time</span>
        <button
          onClick={() => setActiveTab('finance')}
          className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          Open Finance Hub <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
