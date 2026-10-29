import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  Line,
  ComposedChart,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  Building2,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  Download,
  Eye,
  Sparkles,
  Maximize2,
  RefreshCw,
  Clock,
  ShieldAlert,
  ChevronRight,
  X,
  PhoneCall,
  Phone,
  AlertCircle
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { Project, Company } from '../../types/erp';

interface Props {
  currencyDisplay?: 'USD' | 'IQD';
  selectedCompanyFilter?: string | 'ALL';
}

export const ProjectExpenditureBudgetRechartsDashboard: React.FC<Props> = ({
  currencyDisplay = 'USD',
  selectedCompanyFilter = 'ALL',
}) => {
  const { companies, projects, setActiveTab, setSelectedCompanyId, startCallWithManager } = useERP();
  const { t, language } = useLanguage();

  // Internal visual toggles
  const [chartView, setChartView] = useState<'SUBSIDIARY_COMPOSED' | 'PROJECT_BREAKDOWN' | 'DONUT_DISTRIBUTION' | 'BURN_CURVE'>('SUBSIDIARY_COMPOSED');
  const [internalCompanyFilter, setInternalCompanyFilter] = useState<string>(selectedCompanyFilter || 'ALL');
  const [sortBy, setSortBy] = useState<'BUDGET_DESC' | 'SPENT_DESC' | 'BURN_RATE_DESC' | 'NAME'>('BUDGET_DESC');
  const [hoveredSubsidiary, setHoveredSubsidiary] = useState<string | null>(null);
  const [inspectingCompany, setInspectingCompany] = useState<Company | null>(null);
  const [isLivePulsing, setIsLivePulsing] = useState(true);

  // Handle clicking on a Recharts bar to open detailed subsidiary modal
  const handleBarClick = (entry: any) => {
    if (!entry) return;
    const compId = entry.companyId || entry.payload?.companyId || (entry.activePayload && entry.activePayload[0]?.payload?.companyId);
    const found = companies.find(c => c.id === compId) || (entry.code ? companies.find(c => c.code === entry.code) : null);
    if (found) {
      setInspectingCompany(found);
    }
  };

  const handleProjectBarClick = (entry: any) => {
    if (!entry) return;
    const compId = entry.companyId || entry.payload?.companyId;
    const found = companies.find(c => c.id === compId);
    if (found) {
      setInspectingCompany(found);
    }
  };

  // Conversion rates (1 USD = 1,310 IQD)
  const isIQD = currencyDisplay === 'IQD';
  const formatMoney = (valUSD: number) => {
    if (isIQD) {
      const iqdVal = valUSD * 1310;
      if (iqdVal >= 1000000000) return `${(iqdVal / 1000000000).toFixed(2)}B ع.د`;
      if (iqdVal >= 1000000) return `${(iqdVal / 1000000).toFixed(1)}M ع.د`;
      return `${iqdVal.toLocaleString()} ع.د`;
    }
    if (valUSD >= 1000000) return `$${(valUSD / 1000000).toFixed(2)}M`;
    if (valUSD >= 1000) return `$${(valUSD / 1000).toFixed(0)}k`;
    return `$${valUSD.toLocaleString()}`;
  };

  const formatMillionsOnly = (valUSD: number) => {
    if (isIQD) {
      const iqdVal = valUSD * 1310;
      return (iqdVal / 1000000000).toFixed(1);
    }
    return (valUSD / 1000000).toFixed(2);
  };

  // Filtered subsidiaries
  const effectiveCompanyFilter = internalCompanyFilter !== 'ALL' ? internalCompanyFilter : selectedCompanyFilter;
  const filteredCompanies = useMemo(() => {
    if (effectiveCompanyFilter === 'ALL') return companies;
    return companies.filter(c => c.id === effectiveCompanyFilter);
  }, [companies, effectiveCompanyFilter]);

  // Aggregate project data per subsidiary
  const subsidiaryAggregates = useMemo(() => {
    return filteredCompanies.map((comp) => {
      const compProjects = projects.filter(p => p.companyId === comp.id);
      const totalProjectBudget = compProjects.reduce((sum, p) => sum + (p.budgetUSD || 0), 0);
      const totalProjectSpent = compProjects.reduce((sum, p) => sum + (p.spentUSD || 0), 0);
      const remainingBudget = Math.max(0, totalProjectBudget - totalProjectSpent);
      const burnRate = totalProjectBudget > 0 ? (totalProjectSpent / totalProjectBudget) * 100 : 0;
      const overBudgetAmount = totalProjectSpent > totalProjectBudget ? totalProjectSpent - totalProjectBudget : 0;
      const avgProgress = compProjects.length > 0
        ? compProjects.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / compProjects.length
        : 0;

      return {
        companyId: comp.id,
        code: comp.code || comp.name.slice(0, 4).toUpperCase(),
        name: comp.name,
        nameKu: comp.nameKu || comp.name,
        generalManager: comp.generalManager,
        projectCount: compProjects.length,
        projects: compProjects,
        totalProjectBudget,
        totalProjectSpent,
        remainingBudget,
        burnRate: Number(burnRate.toFixed(1)),
        overBudgetAmount,
        avgProgress: Number(avgProgress.toFixed(1)),
        budgetMillions: Number((totalProjectBudget / 1000000).toFixed(2)),
        spentMillions: Number((totalProjectSpent / 1000000).toFixed(2)),
        remainingMillions: Number((remainingBudget / 1000000).toFixed(2)),
      };
    }).sort((a, b) => {
      if (sortBy === 'BUDGET_DESC') return b.totalProjectBudget - a.totalProjectBudget;
      if (sortBy === 'SPENT_DESC') return b.totalProjectSpent - a.totalProjectSpent;
      if (sortBy === 'BURN_RATE_DESC') return b.burnRate - a.burnRate;
      return a.name.localeCompare(b.name);
    });
  }, [filteredCompanies, projects, sortBy]);

  // Holding Global Totals
  const holdingTotals = useMemo(() => {
    const totalBudget = subsidiaryAggregates.reduce((s, a) => s + a.totalProjectBudget, 0);
    const totalSpent = subsidiaryAggregates.reduce((s, a) => s + a.totalProjectSpent, 0);
    const remaining = totalBudget - totalSpent;
    const overallBurnRate = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0';
    const totalProjectsCount = subsidiaryAggregates.reduce((s, a) => s + a.projectCount, 0);

    return {
      totalBudget,
      totalSpent,
      remaining,
      overallBurnRate,
      totalProjectsCount,
    };
  }, [subsidiaryAggregates]);

  // Project Level Breakdown Data for Bar Chart
  const projectDetailData = useMemo(() => {
    const list: Array<{
      projectId: string;
      projectName: string;
      projectNameKu: string;
      companyCode: string;
      companyName: string;
      budgetUSD: number;
      spentUSD: number;
      remainingUSD: number;
      burnRate: number;
      progress: number;
      budgetMillions: number;
      spentMillions: number;
      health: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    }> = [];

    subsidiaryAggregates.forEach(sub => {
      sub.projects.forEach(p => {
        const burn = p.budgetUSD > 0 ? (p.spentUSD / p.budgetUSD) * 100 : 0;
        let health: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
        if (burn > 90) health = 'CRITICAL';
        else if (burn > 75) health = 'WARNING';

        list.push({
          projectId: p.id,
          projectName: p.name,
          projectNameKu: p.nameKu || p.name,
          companyCode: sub.code,
          companyName: sub.nameKu,
          budgetUSD: p.budgetUSD,
          spentUSD: p.spentUSD,
          remainingUSD: Math.max(0, p.budgetUSD - p.spentUSD),
          burnRate: Number(burn.toFixed(1)),
          progress: p.progressPercentage || 0,
          budgetMillions: Number((p.budgetUSD / 1000000).toFixed(2)),
          spentMillions: Number((p.spentUSD / 1000000).toFixed(2)),
          health,
        });
      });
    });

    return list.sort((a, b) => b.budgetUSD - a.budgetUSD);
  }, [subsidiaryAggregates]);

  // Donut chart colors
  const SUBSIDIARY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

  // Donut data for budget share
  const budgetDonutData = useMemo(() => {
    return subsidiaryAggregates.map((sub, idx) => ({
      name: sub.code,
      fullName: sub.nameKu,
      value: sub.totalProjectBudget,
      color: SUBSIDIARY_COLORS[idx % SUBSIDIARY_COLORS.length]
    }));
  }, [subsidiaryAggregates]);

  // Donut data for expenditure share
  const spentDonutData = useMemo(() => {
    return subsidiaryAggregates.map((sub, idx) => ({
      name: sub.code,
      fullName: sub.nameKu,
      value: sub.totalProjectSpent,
      color: SUBSIDIARY_COLORS[idx % SUBSIDIARY_COLORS.length]
    }));
  }, [subsidiaryAggregates]);

  // Burn curve simulation trajectory based on actual totals
  const burnCurveData = useMemo(() => {
    const totalB = holdingTotals.totalBudget;
    const totalS = holdingTotals.totalSpent;
    return [
      { period: 'Jan 2026', PlannedBudget: totalB * 0.15, ActualExpenditure: totalS * 0.12, ProjectedBurn: totalS * 0.12 },
      { period: 'Mar 2026', PlannedBudget: totalB * 0.32, ActualExpenditure: totalS * 0.28, ProjectedBurn: totalS * 0.29 },
      { period: 'May 2026', PlannedBudget: totalB * 0.50, ActualExpenditure: totalS * 0.48, ProjectedBurn: totalS * 0.49 },
      { period: 'Jul 2026', PlannedBudget: totalB * 0.68, ActualExpenditure: totalS * 0.71, ProjectedBurn: totalS * 0.72 },
      { period: 'Sep 2026', PlannedBudget: totalB * 0.85, ActualExpenditure: totalS * 0.89, ProjectedBurn: totalS * 0.90 },
      { period: 'Oct 2026 (Live)', PlannedBudget: totalB, ActualExpenditure: totalS, ProjectedBurn: totalS * 1.05 },
    ];
  }, [holdingTotals]);

  // Custom Recharts Tooltip
  const CustomComposedTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 text-xs space-y-2 min-w-[240px] z-50">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="font-mono font-bold text-blue-400 text-[10px] uppercase">{data.code}</span>
              <h4 className="font-extrabold text-sm text-white">{data.nameKu || data.name}</h4>
              <p className="text-[11px] text-slate-400">{data.generalManager} (GM)</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {data.projectCount} پڕۆژە
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                کۆی بودجەی پڕۆژەکان:
              </span>
              <strong className="text-white font-mono">{formatMoney(data.totalProjectBudget)}</strong>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                کۆی خەرجکراوی ڕاستەقینە:
              </span>
              <strong className="text-emerald-400 font-mono">{formatMoney(data.totalProjectSpent)}</strong>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-400" />
                بڕی ماوە (Variance):
              </span>
              <strong className="text-sky-300 font-mono">{formatMoney(data.remainingBudget)}</strong>
            </div>

            <div className="flex justify-between items-center pt-1.5 border-t border-slate-800 text-slate-200">
              <span>ڕێژەی خەرجکردن (Burn Rate):</span>
              <span className={`font-black font-mono px-1.5 py-0.5 rounded text-[11px] ${
                data.burnRate > 90 ? 'bg-rose-500/30 text-rose-300' : data.burnRate > 75 ? 'bg-amber-500/30 text-amber-300' : 'bg-emerald-500/30 text-emerald-300'
              }`}>
                {data.burnRate}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomProjectTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-800 text-xs space-y-1.5 min-w-[220px]">
          <span className="font-mono text-[10px] text-indigo-400 uppercase">{data.companyCode} • {data.companyName}</span>
          <h4 className="font-extrabold text-white text-xs">{data.projectNameKu}</h4>
          <div className="flex justify-between pt-1 border-t border-slate-800 text-slate-300">
            <span>بودجە:</span>
            <span className="font-bold text-white font-mono">{formatMoney(data.budgetUSD)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>خەرجکراو:</span>
            <span className="font-bold text-emerald-400 font-mono">{formatMoney(data.spentUSD)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>پێشکەوتنی کار:</span>
            <span className="font-bold text-blue-400 font-mono">{data.progress}%</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Burn Rate:</span>
            <span className="font-bold text-amber-400 font-mono">{data.burnRate}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Export CSV summary
  const handleExportCSV = () => {
    const headers = 'Subsidiary Code,Subsidiary Name,General Manager,Project Count,Budget (USD),Spent (USD),Remaining (USD),Burn Rate (%)\n';
    const rows = subsidiaryAggregates.map(s => 
      `"${s.code}","${s.nameKu}","${s.generalManager}",${s.projectCount},${s.totalProjectBudget},${s.totalProjectSpent},${s.remainingBudget},${s.burnRate}%`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `holding_subsidiary_project_expenditure_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & Live Indicators */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  خەرجی و بودجەی ڕاستەقینەی پڕۆژەکان لە سەرجەم کۆمپانیاکان
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Recharts Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-Time Project Expenditure vs Allocated Budget across Group Subsidiaries with Burn Rate & Variance Analysis.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setChartView('SUBSIDIARY_COMPOSED')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                chartView === 'SUBSIDIARY_COMPOSED'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="کۆکراوەی کۆمپانیاکان"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>بەراوردی کۆمپانیاکان</span>
            </button>

            <button
              onClick={() => setChartView('PROJECT_BREAKDOWN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                chartView === 'PROJECT_BREAKDOWN'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="بەپێی تاکە پڕۆژە"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>پڕۆژە بە پڕۆژە</span>
            </button>

            <button
              onClick={() => setChartView('DONUT_DISTRIBUTION')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                chartView === 'DONUT_DISTRIBUTION'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="دابەشبوونی پشکەکان"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>پشکی بودجە و خەرجی</span>
            </button>

            <button
              onClick={() => setChartView('BURN_CURVE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                chartView === 'BURN_CURVE'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="هێڵی خەرجکردن بەپێی کات"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>هێڵی خێرایی (Velocity)</span>
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 transition hover:bg-slate-50">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">کۆی بودجەی دیاریکراو</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatMoney(holdingTotals.totalBudget)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            لە سەرجەم {holdingTotals.totalProjectsCount} پڕۆژەی کۆمپانیاکان
          </span>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 transition hover:bg-emerald-50">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">خەرجکراوی ڕاستەقینە</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 font-mono">
            {formatMoney(holdingTotals.totalSpent)}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            تەواوی پارەی خەرجکراوی مەیدانی
          </span>
        </div>

        <div className="bg-sky-50/50 border border-sky-200/80 rounded-2xl p-4 transition hover:bg-sky-50">
          <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">بڕی ماوە (Remaining)</span>
          <div className="text-xl sm:text-2xl font-black text-sky-700 mt-1 font-mono">
            {formatMoney(holdingTotals.remaining)}
          </div>
          <span className="text-[11px] text-sky-600 font-semibold mt-0.5 block">
            پارێزراو بۆ قۆناغەکانی داهاتوو
          </span>
        </div>

        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 transition hover:bg-amber-50">
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">ڕێژەی خەرجکردن (Burn Rate)</span>
          <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1 font-mono">
            {holdingTotals.overallBurnRate}%
          </div>
          <div className="w-full bg-amber-200/60 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Number(holdingTotals.overallBurnRate))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Sorting Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            فلتەر:
          </span>

          {/* Subsidiary Filter */}
          <select
            value={internalCompanyFilter}
            onChange={(e) => setInternalCompanyFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="ALL">سەرجەم کۆمپانیاکانی هۆلدینگ ({companies.length})</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.nameKu || c.name} ({c.code})</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="BUDGET_DESC">ڕیزبەندی: بەرزترین بودجە</option>
            <option value="SPENT_DESC">ڕیزبەندی: بەرزترین خەرجی</option>
            <option value="BURN_RATE_DESC">ڕیزبەندی: بەرزترین ڕێژەی خەرجکردن (%)</option>
            <option value="NAME">ڕیزبەندی بەپێی ئەلفوبێ</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-slate-500 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-600" />
            بودجەی پڕۆژە
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            خەرجی ڕاستەقینە
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sky-400" />
            بڕی ماوە
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-500" />
            ڕێژەی خەرجکردن (%)
          </span>
          <span className="hidden md:inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
            👆 کلیک لەسەر باڕەکان بکە بۆ وردەکاری
          </span>
        </div>
      </div>

      {/* MAIN CHART CONTAINER */}
      <div className="w-full h-[400px] sm:h-[440px] pt-2">
        {chartView === 'SUBSIDIARY_COMPOSED' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={subsidiaryAggregates}
              margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="code"
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#475569', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => formatMoney(val)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: '#d97706', fontSize: 11, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomComposedTooltip />} />
              <ReferenceLine
                yAxisId="right"
                y={100}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: '100% Budget Threshold', fill: '#ef4444', fontSize: 10, position: 'top' }}
              />
              
              {/* Grouped Bars with Click Handler */}
              <Bar
                yAxisId="left"
                dataKey="totalProjectBudget"
                name="Project Budget"
                fill="#4f46e5"
                radius={[6, 6, 0, 0]}
                barSize={24}
                className="cursor-pointer hover:opacity-85 transition"
                onClick={(entry: any) => handleBarClick(entry)}
              />
              <Bar
                yAxisId="left"
                dataKey="totalProjectSpent"
                name="Actual Spent"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                barSize={24}
                className="cursor-pointer hover:opacity-85 transition"
                onClick={(entry: any) => handleBarClick(entry)}
              />
              <Bar
                yAxisId="left"
                dataKey="remainingBudget"
                name="Remaining Balance"
                fill="#38bdf8"
                radius={[6, 6, 0, 0]}
                barSize={24}
                className="cursor-pointer hover:opacity-85 transition"
                onClick={(entry: any) => handleBarClick(entry)}
              />

              {/* Line for Burn Rate */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="burnRate"
                name="Burn Rate %"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#b45309' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {chartView === 'PROJECT_BREAKDOWN' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={projectDetailData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis
                type="number"
                tick={{ fill: '#475569', fontSize: 11 }}
                tickFormatter={(val) => formatMoney(val)}
              />
              <YAxis
                type="category"
                dataKey="projectNameKu"
                tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 700 }}
                width={120}
              />
              <Tooltip content={<CustomProjectTooltip />} />
              <Bar
                dataKey="budgetUSD"
                name="Project Budget"
                fill="#6366f1"
                radius={[0, 4, 4, 0]}
                barSize={14}
                className="cursor-pointer hover:opacity-85 transition"
                onClick={(entry: any) => handleProjectBarClick(entry)}
              />
              <Bar
                dataKey="spentUSD"
                name="Actual Expenditure"
                fill="#10b981"
                radius={[0, 4, 4, 0]}
                barSize={14}
                className="cursor-pointer hover:opacity-85 transition"
                onClick={(entry: any) => handleProjectBarClick(entry)}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartView === 'DONUT_DISTRIBUTION' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Left Donut: Budget Allocation Share */}
            <div className="flex flex-col items-center justify-center relative">
              <span className="text-xs font-black text-slate-800 mb-2">
                دابەشبوونی بودجە بەپێی کۆمپانیاکان (Budget Share)
              </span>
              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetDonutData}
                      dataKey="value"
                      nameKey="fullName"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {budgetDonutData.map((entry, index) => (
                        <Cell key={`cell-budget-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatMoney(Number(val))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center -mt-6">
                <span className="text-[10px] text-slate-400 font-bold block">کۆی گشتی بودجە</span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {formatMoney(holdingTotals.totalBudget)}
                </span>
              </div>
            </div>

            {/* Right Donut: Real-Time Expenditure Share */}
            <div className="flex flex-col items-center justify-center relative">
              <span className="text-xs font-black text-slate-800 mb-2">
                دابەشبوونی پارەی خەرجکراو بەپێی کۆمپانیاکان (Expenditure Share)
              </span>
              <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spentDonutData}
                      dataKey="value"
                      nameKey="fullName"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {spentDonutData.map((entry, index) => (
                        <Cell key={`cell-spent-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatMoney(Number(val))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center -mt-6">
                <span className="text-[10px] text-slate-400 font-bold block">کۆی خەرجکراوی ڕاستەقینە</span>
                <span className="text-sm font-black text-emerald-700 font-mono">
                  {formatMoney(holdingTotals.totalSpent)}
                </span>
              </div>
            </div>
          </div>
        )}

        {chartView === 'BURN_CURVE' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={burnCurveData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="period" tick={{ fill: '#475569', fontSize: 11 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} tickFormatter={(val) => formatMoney(val)} />
              <Tooltip formatter={(val: any) => formatMoney(Number(val))} />
              <Legend verticalAlign="top" height={36} />
              <Area
                type="monotone"
                dataKey="PlannedBudget"
                name="Planned Budget Trajectory"
                stroke="#4f46e5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#budgetGrad)"
              />
              <Area
                type="monotone"
                dataKey="ActualExpenditure"
                name="Actual Expenditure Velocity"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#spendGrad)"
              />
              <Line
                type="monotone"
                dataKey="ProjectedBurn"
                name="Year-End Projected Burn"
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Subsidiary Detailed Breakdown Table */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>خشتەی وردەکاری کۆمپانیا باڵادەستەکان و پڕۆژەکانیان:</span>
          </h3>
          <span className="text-[11px] text-slate-500">
            کلیک لەسەر هەر کۆمپانیایەک بکە بۆ بینینی پڕۆژەکانی لە بەشی بەڕێوەبردن
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-extrabold border-b border-slate-200">
                <th className="py-2.5 px-3">کۆمپانیا (Subsidiary)</th>
                <th className="py-2.5 px-3">بەڕێوەبەری گشتی (GM)</th>
                <th className="py-2.5 px-3">ژمارەی پڕۆژە</th>
                <th className="py-2.5 px-3">بودجەی پڕۆژەکان</th>
                <th className="py-2.5 px-3">خەرجی ڕاستەقینە</th>
                <th className="py-2.5 px-3">بڕی ماوە (Variance)</th>
                <th className="py-2.5 px-3">Burn Rate (%)</th>
                <th className="py-2.5 px-3 text-center">کردار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subsidiaryAggregates.map((sub) => {
                const isOverBudget = sub.burnRate > 90;
                const isWarning = sub.burnRate > 75 && sub.burnRate <= 90;

                return (
                  <tr
                    key={sub.companyId}
                    className="hover:bg-blue-50/40 transition group"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-blue-100/70 text-blue-800 font-bold text-[10px] flex items-center justify-center font-mono">
                          {sub.code}
                        </span>
                        <div>
                          <strong className="text-slate-900 block font-bold">{sub.nameKu}</strong>
                          <span className="text-[10px] text-slate-400 block">{sub.name}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-semibold">
                      {sub.generalManager}
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[11px]">
                        {sub.projectCount} پڕۆژە
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {formatMoney(sub.totalProjectBudget)}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      {formatMoney(sub.totalProjectSpent)}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-sky-700">
                      {formatMoney(sub.remainingBudget)}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-black text-xs ${
                          isOverBudget ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {sub.burnRate}%
                        </span>
                        <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOverBudget ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, sub.burnRate)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedCompanyId(sub.companyId);
                          setActiveTab('companies-projects');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white font-bold text-[11px] transition cursor-pointer flex items-center gap-1 mx-auto"
                        title="View Projects in Companies Module"
                      >
                        <Eye className="w-3 h-3" />
                        <span>بینینی پڕۆژەکان</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal View for Selected Subsidiary Breakdown */}
      {inspectingCompany && (() => {
        const compProjects = projects.filter(p => p.companyId === inspectingCompany.id);
        const totalBudget = compProjects.reduce((sum, p) => sum + (p.budgetUSD || 0), 0);
        const totalSpent = compProjects.reduce((sum, p) => sum + (p.spentUSD || 0), 0);
        const remaining = Math.max(0, totalBudget - totalSpent);
        const burnRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
        const highBurnProjects = compProjects.filter(p => {
          const b = p.budgetUSD || 0;
          const s = p.spentUSD || 0;
          return b > 0 && (s / b) >= 0.90;
        });

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                        {inspectingCompany.code}
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {inspectingCompany.nameKu || inspectingCompany.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>بەڕێوەبەری گشتی: {inspectingCompany.generalManager}</span>
                      <span>•</span>
                      <span className="font-mono text-blue-600">{inspectingCompany.gmPhone}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (startCallWithManager) {
                        startCallWithManager({
                          name: inspectingCompany.generalManager,
                          role: 'General Manager',
                          phone: inspectingCompany.gmPhone,
                          company: inspectingCompany.nameKu || inspectingCompany.name,
                          avatar: '👔'
                        });
                      }
                    }}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 transition cursor-pointer"
                    title="پەیوەندی ڕاستەوخۆ بە GM"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setInspectingCompany(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                
                {/* Threshold Alert if any project exceeds 90% */}
                {highBurnProjects.length > 0 && (
                  <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3 text-rose-900 animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-rose-900">
                        ئاگاداری مەترسی تێپەڕاندنی سنووری ٩٠٪ی بودجە ({highBurnProjects.length} پڕۆژە لە مەترسیدایە)
                      </h4>
                      <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                        ڕێژەی خەرجکردنی پارە لەم پڕۆژانەدا گەیشتووەتە زیاتر لە ٩٠٪ی کۆی بودجەی پەسەندکراو. پێویستە خاوەنی هۆلدینگ یان سەرۆکایەتی پێداچوونەوە بکات.
                      </p>
                    </div>
                  </div>
                )}

                {/* Subsidiary Financial KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">کۆی پڕۆژەکان</span>
                    <span className="text-xl font-black text-slate-900 mt-0.5 block font-mono">{compProjects.length} پڕۆژە</span>
                  </div>
                  <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-3.5">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase block">کۆی بودجەی پەسەندکراو</span>
                    <span className="text-xl font-black text-indigo-900 mt-0.5 block font-mono">{formatMoney(totalBudget)}</span>
                  </div>
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">خەرجکراوی مەیدانی</span>
                    <span className="text-xl font-black text-emerald-900 mt-0.5 block font-mono">{formatMoney(totalSpent)}</span>
                  </div>
                  <div className={`rounded-2xl p-3.5 border ${
                    burnRate >= 90 ? 'bg-rose-50 border-rose-300' : burnRate >= 75 ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] font-bold uppercase block text-slate-600">ڕێژەی بەکارهێنان (Burn Rate)</span>
                    <span className={`text-xl font-black mt-0.5 block font-mono ${
                      burnRate >= 90 ? 'text-rose-600' : burnRate >= 75 ? 'text-amber-600' : 'text-slate-900'
                    }`}>{burnRate.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Projects Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-blue-600" />
                      <span>لیستی پڕۆژەکانی ئەم کۆمپانیایە ({compProjects.length})</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">کلیک بۆ بینینی ڕاپۆرت و بەستنەوە</span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <tr>
                          <th className="py-2.5 px-3">ناوی پڕۆژە و شوێن</th>
                          <th className="py-2.5 px-3">بەڕێوەبەری پڕۆژە (PM)</th>
                          <th className="py-2.5 px-3">بودجە</th>
                          <th className="py-2.5 px-3">خەرجکراو</th>
                          <th className="py-2.5 px-3">ڕێژەی خەرجکردن</th>
                          <th className="py-2.5 px-3 text-center">کردار</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {compProjects.map((p) => {
                          const b = p.budgetUSD || 0;
                          const s = p.spentUSD || 0;
                          const pBurn = b > 0 ? (s / b) * 100 : 0;
                          const isExceed90 = pBurn >= 90;

                          return (
                            <tr key={p.id} className={`hover:bg-slate-50/80 transition ${isExceed90 ? 'bg-rose-50/30' : ''}`}>
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900">{p.nameKu || p.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{p.code} • {p.location}</div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-semibold text-slate-800">{p.manager}</div>
                                <div className="text-[10px] text-blue-600 font-mono">{p.managerPhone}</div>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-slate-800">
                                {formatMoney(b)}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                                {formatMoney(s)}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-mono font-extrabold text-xs ${
                                    isExceed90 ? 'text-rose-600' : pBurn >= 75 ? 'text-amber-600' : 'text-slate-700'
                                  }`}>
                                    {pBurn.toFixed(1)}%
                                  </span>
                                  {isExceed90 && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold border border-rose-300">
                                      ⚠️ 90%+
                                    </span>
                                  )}
                                </div>
                                <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      isExceed90 ? 'bg-rose-500' : pBurn >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(100, pBurn)}%` }}
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedCompanyId(inspectingCompany.id);
                                    setActiveTab('companies-projects');
                                    setInspectingCompany(null);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-[11px] transition cursor-pointer"
                                >
                                  بەڕێوەبردن
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedCompanyId(inspectingCompany.id);
                    setActiveTab('companies-projects');
                    setInspectingCompany(null);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>بینینی تەواوی بەشەکان و ڕاپۆرتەکانی ئەم کۆمپانیایە</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setInspectingCompany(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  داخستن
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
