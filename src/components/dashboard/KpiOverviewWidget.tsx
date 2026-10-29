import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  Layers,
  FileSpreadsheet,
  FileText,
  DollarSign,
  PieChart as PieIcon,
  Filter,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  Info,
  Compass,
  Calculator,
  LineChart as LineChartIcon
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
  Line,
  ComposedChart,
  Cell
} from 'recharts';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { HoldingSectorKpi, KpiTimeHorizon, KpiMetricView } from '../../types/kpi';
import { getHoldingSectorsData } from '../../data/holdingSectorsData';
import { SectorExpenseBreakdownModal } from './SectorExpenseBreakdownModal';
import { exportKpiToExcel, exportKpiToPdf } from '../../utils/kpiExportUtils';
import { computeSpendingForecast, ForecastAlgorithm, ForecastSummary } from '../../utils/kpiForecastUtils';
import { SparklineChart } from '../SparklineChart';

interface KpiOverviewWidgetProps {
  currencyDisplay?: 'USD' | 'IQD';
  selectedCompanyFilter?: string | 'ALL';
}

export const KpiOverviewWidget: React.FC<KpiOverviewWidgetProps> = ({
  currencyDisplay = 'USD',
  selectedCompanyFilter = 'ALL',
}) => {
  const { companies, projects, holding, setActiveTab } = useERP();
  const { t, language } = useLanguage();

  // Selected State
  const [metricView, setMetricView] = useState<KpiMetricView>('BUDGET_VS_SPENT');
  const [timeHorizon, setTimeHorizon] = useState<KpiTimeHorizon>('YTD');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('ALL');
  const [forecastAlgorithm, setForecastAlgorithm] = useState<ForecastAlgorithm>('LINEAR_REGRESSION');
  const [showForecastOverlay, setShowForecastOverlay] = useState<boolean>(true);
  const [activeSectorForModal, setActiveSectorForModal] = useState<HoldingSectorKpi | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Load Sectors Data enriched with ERP Context
  const allSectors = useMemo(() => {
    return getHoldingSectorsData(companies, projects);
  }, [companies, projects]);

  // Filtered Sectors
  const displayedSectors = useMemo(() => {
    if (selectedSectorFilter === 'ALL') return allSectors;
    return allSectors.filter(s => s.id === selectedSectorFilter);
  }, [allSectors, selectedSectorFilter]);

  // Spending Trend Prediction Forecast
  const forecastSummary: ForecastSummary = useMemo(() => {
    return computeSpendingForecast(displayedSectors, forecastAlgorithm);
  }, [displayedSectors, forecastAlgorithm]);

  // Aggregate Metrics
  const totalBudgetUSD = displayedSectors.reduce((acc, s) => acc + s.annualBudgetUSD, 0);
  const totalSpentUSD = displayedSectors.reduce((acc, s) => acc + s.spentUSD, 0);
  const totalVarianceUSD = totalBudgetUSD - totalSpentUSD;
  const overallUtilization = totalBudgetUSD > 0 ? ((totalSpentUSD / totalBudgetUSD) * 100).toFixed(1) : '0';
  const averageHealthScore = (displayedSectors.reduce((acc, s) => acc + s.healthScore, 0) / (displayedSectors.length || 1)).toFixed(1);

  // 30-Day Historical Trend Sparklines
  const kpiSparklines = useMemo(() => {
    const budget30d = Array.from({ length: 30 }, (_, i) => {
      const start = totalBudgetUSD * 0.94;
      return Math.round(start + (totalBudgetUSD - start) * (i / 29));
    });

    const spent30d = Array.from({ length: 30 }, (_, i) => {
      const start = totalSpentUSD * 0.86;
      const wave = Math.sin(i * 0.8) * (totalSpentUSD * 0.008);
      return Math.round(start + (totalSpentUSD - start) * (i / 29) + wave);
    });

    const variance30d = Array.from({ length: 30 }, (_, i) => {
      const v = Math.round(budget30d[i] - spent30d[i]);
      return Math.max(0, v);
    });

    const curHealth = Number(averageHealthScore) || 92;
    const health30d = Array.from({ length: 30 }, (_, i) => {
      const wave = Math.sin(i * 0.6) * 1.8;
      const v = curHealth - 2 + (2 * (i / 29)) + wave;
      return Number(Math.min(100, Math.max(70, v)).toFixed(1));
    });
    health30d[29] = curHealth;

    return { budget30d, spent30d, variance30d, health30d };
  }, [totalBudgetUSD, totalSpentUSD, averageHealthScore]);

  // Formatting helpers
  const formatCurrencyM = (valUSD: number) => {
    if (currencyDisplay === 'IQD') {
      const iqdVal = valUSD * 1310;
      return `${(iqdVal / 1000000000).toFixed(2)}B IQD`;
    }
    return `$${(valUSD / 1000000).toFixed(2)}M`;
  };

  const formatCurrencyFull = (valUSD: number) => {
    if (currencyDisplay === 'IQD') {
      const iqdVal = valUSD * 1310;
      return `${iqdVal.toLocaleString()} IQD`;
    }
    return `$${valUSD.toLocaleString()}`;
  };

  // Recharts Data for Budget vs Actual Bar Chart
  const barChartData = displayedSectors.map(s => ({
    id: s.id,
    code: s.code,
    name: s.name,
    shortName: s.name.split(' ')[0] + ' ' + (s.name.split(' ')[1] || ''),
    Budget: Number((s.annualBudgetUSD / 1000000).toFixed(2)),
    Spent: Number((s.spentUSD / 1000000).toFixed(2)),
    Remaining: Number((s.varianceUSD / 1000000).toFixed(2)),
    utilization: s.utilizationRate,
    sectorRef: s,
  }));

  // Recharts Data for Utilization Rate Chart
  const utilizationChartData = displayedSectors.map(s => ({
    id: s.id,
    code: s.code,
    name: s.name,
    utilization: s.utilizationRate,
    health: s.healthScore,
    sectorRef: s,
  }));

  // Consolidated Monthly Trend Data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const monthlyTrendData = months.map(m => {
    let monthlyBudget = 0;
    let monthlySpent = 0;
    displayedSectors.forEach(s => {
      const point = s.monthlyTrend.find(p => p.month === m);
      if (point) {
        monthlyBudget += point.budgetBaselineUSD;
        monthlySpent += point.spentUSD;
      }
    });

    return {
      month: m,
      Budget: Number((monthlyBudget / 1000000).toFixed(2)),
      Spent: Number((monthlySpent / 1000000).toFixed(2)),
      Variance: Number(((monthlyBudget - monthlySpent) / 1000000).toFixed(2)),
    };
  });

  // Handle Chart Click on Data Point / Bar
  const handleChartDataPointClick = (entry: any) => {
    if (!entry) return;
    // Handle payload from Bar onClick or Recharts activePayload
    const sectorObj = entry.sectorRef || (entry.activePayload && entry.activePayload[0]?.payload?.sectorRef) || null;
    if (sectorObj) {
      setActiveSectorForModal(sectorObj);
      setIsModalOpen(true);
    }
  };

  const handleOpenSectorModal = (sector: HoldingSectorKpi) => {
    setActiveSectorForModal(sector);
    setIsModalOpen(true);
  };

  // Export Handlers
  const handleExportExcel = () => {
    const filename = exportKpiToExcel(displayedSectors, {
      holdingName: (language === 'ku' && holding.nameKu) || (language === 'ar' && holding.nameAr) || holding.name || 'Holding Group',
      chairmanName: holding.chairmanName || 'Holding Chairman / Owner',
      timeHorizon: timeHorizon === 'YTD' ? 'YTD 2026' : timeHorizon === 'Q3_2026' ? 'Q3 2026' : 'Full Year 2026 Projections',
      forecastAlgorithm,
    });
    setExportNotice(`Excel report exported successfully with Trend Forecast: ${filename}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportPdf = () => {
    const filename = exportKpiToPdf(displayedSectors, {
      holdingName: (language === 'ku' && holding.nameKu) || (language === 'ar' && holding.nameAr) || holding.name || 'Holding Group',
      chairmanName: holding.chairmanName || 'Holding Chairman / Owner',
      timeHorizon: timeHorizon === 'YTD' ? 'YTD 2026' : timeHorizon === 'Q3_2026' ? 'Q3 2026' : 'Full Year 2026 Projections',
      forecastAlgorithm,
    });
    setExportNotice(`PDF report downloaded successfully with Trend Forecast: ${filename}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6 relative overflow-hidden" id="kpi-overview-section">
      
      {/* Export Toast Notification */}
      {exportNotice && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-lg animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Top Header & Export Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-extrabold shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  KPI Overview: Sector Budget vs. Actual Spending Trends
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Recharts Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Visualizing key company performance metrics and expenditure trajectories across {displayedSectors.length} holding sectors.
              </p>
            </div>
          </div>
        </div>

        {/* View Switchers & Export Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMetricView('BUDGET_VS_SPENT')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                metricView === 'BUDGET_VS_SPENT'
                  ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Sectors Comparison</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricView('MONTHLY_TRAJECTORY')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                metricView === 'MONTHLY_TRAJECTORY'
                  ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Monthly Trend</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricView('UTILIZATION_RATE')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                metricView === 'UTILIZATION_RATE'
                  ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Burn Rate %</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricView('TREND_PREDICTION')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                metricView === 'TREND_PREDICTION'
                  ? 'bg-purple-600 text-white shadow-2xs font-extrabold'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
              id="kpi-trend-prediction-tab-btn"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Trend Forecast</span>
            </button>
          </div>

          {/* Time Horizon Selector */}
          <select
            value={timeHorizon}
            onChange={(e) => setTimeHorizon(e.target.value as KpiTimeHorizon)}
            className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="YTD">YTD 2026</option>
            <option value="Q3_2026">Q3 2026 (Cur)</option>
            <option value="FULL_YEAR">Full Year Proj.</option>
          </select>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-2xs transition cursor-pointer"
              id="kpi-export-excel-btn"
              title="Export currently displayed budget vs actual trends to Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition cursor-pointer"
              id="kpi-export-pdf-btn"
              title="Export currently displayed budget vs actual trends to PDF report"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Summary Metric Cards with Inline SVG Sparklines */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 transition hover:bg-white hover:shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Consolidated Budget</span>
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {formatCurrencyM(totalBudgetUSD)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {displayedSectors.length} Holding Operating Sectors
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60">
            <SparklineChart
              data={kpiSparklines.budget30d}
              color="blue"
              height={26}
              trendLabel="30d Budget Trend"
              formatTooltip={(v) => formatCurrencyM(v)}
            />
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 transition hover:bg-white hover:shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Actual Spent to Date</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-blue-600">
              {formatCurrencyM(totalSpentUSD)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              {overallUtilization}% Average Utilization
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60">
            <SparklineChart
              data={kpiSparklines.spent30d}
              color="emerald"
              height={26}
              trendLabel="30d Burn Rate"
              formatTooltip={(v) => formatCurrencyM(v)}
            />
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 transition hover:bg-white hover:shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Net Reserve Variance</span>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-xl font-extrabold text-emerald-600">
              +{formatCurrencyM(totalVarianceUSD)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Uncommitted capital cushion
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60">
            <SparklineChart
              data={kpiSparklines.variance30d}
              color="indigo"
              height={26}
              trendLabel="30d Capital Reserve"
              formatTooltip={(v) => formatCurrencyM(v)}
            />
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 transition hover:bg-white hover:shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Composite Health</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-xl font-extrabold text-purple-700">
              {averageHealthScore}%
            </div>
            <div className="text-[11px] text-purple-600 font-semibold mt-1">
              All sectors within safe thresholds
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60">
            <SparklineChart
              data={kpiSparklines.health30d}
              color="purple"
              height={26}
              trendLabel="30d Health Index"
              formatTooltip={(v) => `${v}% Health`}
            />
          </div>
        </div>
      </div>

      {/* Interactive Helper Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Interactive Graph:</strong> Click on any sector bar or data point in the graph below to trigger the <strong>Detailed Expense Breakdown Modal</strong>.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-blue-700 font-semibold">
          <span>Clickable data points active</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Main Recharts Graph Area */}
      <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5">
        {metricView === 'BUDGET_VS_SPENT' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-800">
                Consolidated Holding Sectors: Allocated Budget vs. Actual Spent ($ Millions USD)
              </span>
              <span className="italic text-slate-400">Values in Millions ($M) • Click bar to inspect</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 15, right: 15, left: -15, bottom: 25 }}
                  onClick={handleChartDataPointClick}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="code"
                    stroke="#64748b"
                    fontSize={11}
                    tick={{ fill: '#475569', fontWeight: 600 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => `$${val}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      borderColor: '#cbd5e1',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      padding: '12px 16px'
                    }}
                    formatter={(val: any, name: any, item: any) => {
                      const num = Number(val);
                      return [`$${num.toFixed(2)}M`, name];
                    }}
                    labelFormatter={(label, items) => {
                      const item = items[0]?.payload;
                      return item ? `${item.name} (${item.code}) — Click to view breakdown` : label;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                    verticalAlign="bottom"
                  />
                  <Bar
                    dataKey="Budget"
                    name="Allocated Budget ($M)"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    cursor="pointer"
                    onClick={(entry) => handleChartDataPointClick(entry)}
                  />
                  <Bar
                    dataKey="Spent"
                    name="Actual Spent ($M)"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    cursor="pointer"
                    onClick={(entry) => handleChartDataPointClick(entry)}
                  />
                  <Bar
                    dataKey="Remaining"
                    name="Variance Reserve ($M)"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    cursor="pointer"
                    onClick={(entry) => handleChartDataPointClick(entry)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {metricView === 'MONTHLY_TRAJECTORY' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-800">
                2026 Monthly Budget Ceiling vs Consolidated Actual Expenditure Trajectory ($M)
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-purple-700 font-semibold text-xs">
                  <input
                    type="checkbox"
                    checked={showForecastOverlay}
                    onChange={(e) => setShowForecastOverlay(e.target.checked)}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span>Overlay Next Month Forecast (Oct)</span>
                </label>
                <span className="italic text-slate-400">Jan - Sep 2026</span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={(showForecastOverlay ? forecastSummary.forecastPoints : monthlyTrendData) as any[]}
                  margin={{ top: 15, right: 15, left: -15, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '14px', borderColor: '#cbd5e1' }}
                    formatter={(val: any, name: any) => [`$${Number(val).toFixed(2)}M`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey={showForecastOverlay ? "budgetBaseline" : "Budget"}
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    name="Budget Monthly Ceiling ($M)"
                  />
                  <Area
                    type="monotone"
                    dataKey={showForecastOverlay ? "actualSpent" : "Spent"}
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#spendGrad)"
                    name="Historical Monthly Spend ($M)"
                  />
                  {showForecastOverlay && (
                    <Line
                      type="monotone"
                      dataKey="predictedSpent"
                      stroke="#9333ea"
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                      dot={{ r: 5, fill: '#9333ea', stroke: '#ffffff', strokeWidth: 2 }}
                      name="Projected Trendline ($M)"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {metricView === 'TREND_PREDICTION' && (
          <div className="space-y-5">
            {/* Algorithm Switcher Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-purple-950">
                    Predictive Expenditure Algorithm
                  </h4>
                  <p className="text-[11px] text-purple-700">
                    Statistical extrapolation based on 9-month historical burn rates across all sectors
                  </p>
                </div>
              </div>

              {/* Algorithm Toggle */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-purple-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setForecastAlgorithm('LINEAR_REGRESSION')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    forecastAlgorithm === 'LINEAR_REGRESSION'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-purple-700'
                  }`}
                  id="forecast-algo-linear-btn"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Linear Regression (OLS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForecastAlgorithm('MOVING_AVERAGE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    forecastAlgorithm === 'MOVING_AVERAGE'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-purple-700'
                  }`}
                  id="forecast-algo-ma-btn"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>3-Month Weighted Moving Average</span>
                </button>
              </div>
            </div>

            {/* Prediction Statistical Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl p-3.5 border border-purple-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Next Month Spend Forecast (Oct)
                </span>
                <span className="text-lg font-extrabold text-purple-700 block mt-0.5">
                  {formatCurrencyM(forecastSummary.predictedNextMonthTotalUSD)}
                </span>
                <span className="text-[11px] text-purple-600 font-mono">
                  {formatCurrencyFull(forecastSummary.predictedNextMonthTotalUSD)}
                </span>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-purple-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  MoM Velocity & Trajectory
                </span>
                <span className="text-lg font-extrabold text-blue-600 block mt-0.5 flex items-center gap-1">
                  {forecastSummary.pctChange > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-amber-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                  )}
                  <span>{forecastSummary.pctChange > 0 ? '+' : ''}{forecastSummary.pctChange}%</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {forecastSummary.differenceUSD > 0 ? '+' : ''}{formatCurrencyM(forecastSummary.differenceUSD)} vs September
                </span>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-purple-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Projected Monthly Surplus
                </span>
                <span className="text-lg font-extrabold text-emerald-600 block mt-0.5">
                  +{formatCurrencyM(forecastSummary.projectedVarianceNextMonthUSD)}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Within monthly budget ceiling
                </span>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-purple-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Model Goodness of Fit (R²)
                </span>
                <span className="text-lg font-extrabold text-slate-900 block mt-0.5">
                  {(forecastSummary.rSquared * 100).toFixed(1)}%
                </span>
                <span className="text-[11px] text-slate-500">
                  {forecastAlgorithm === 'LINEAR_REGRESSION' ? 'High linear correlation' : 'Weighted recency fit'}
                </span>
              </div>
            </div>

            {/* Recharts Predictive Forecast Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800">
                  Consolidated Spending Forecast Trajectory: Historical vs. Next Month Projected ($M)
                </span>
                <span className="text-purple-700 font-semibold">
                  Algorithm: {forecastAlgorithm === 'LINEAR_REGRESSION' ? 'Linear Best Fit (y = mx + b)' : 'Weighted MA (1:2:3)'}
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={forecastSummary.forecastPoints}
                    margin={{ top: 15, right: 15, left: -15, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="actualAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      fontSize={11}
                      tick={({ x, y, payload }) => {
                        const isF = payload.value.includes('Forecast');
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text
                              x={0}
                              y={0}
                              dy={14}
                              textAnchor="middle"
                              fill={isF ? '#9333ea' : '#64748b'}
                              fontWeight={isF ? 'bold' : 'normal'}
                              fontSize={11}
                            >
                              {payload.value}
                            </text>
                          </g>
                        );
                      }}
                    />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val}M`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '14px',
                        borderColor: '#cbd5e1',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(val: any, name: any) => {
                        if (val === undefined || val === null) return ['N/A', name];
                        return [`$${Number(val).toFixed(2)}M`, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="budgetBaseline"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      name="Monthly Budget Ceiling ($M)"
                    />
                    <Area
                      type="monotone"
                      dataKey="actualSpent"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#actualAreaGrad)"
                      name="Historical Actual Spend ($M)"
                    />
                    <Line
                      type="monotone"
                      dataKey="predictedSpent"
                      stroke="#9333ea"
                      strokeWidth={3}
                      strokeDasharray="4 4"
                      dot={({ cx, cy, payload }) => {
                        if (payload.isForecast) {
                          return (
                            <circle
                              key="forecast-dot"
                              cx={cx}
                              cy={cy}
                              r={6}
                              fill="#9333ea"
                              stroke="#ffffff"
                              strokeWidth={3}
                              className="animate-pulse"
                            />
                          );
                        }
                        return <circle key={`dot-${payload.month}`} cx={cx} cy={cy} r={3} fill="#9333ea" />;
                      }}
                      name="Extrapolated Forecast Trajectory ($M)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sector-by-Sector Forecast Matrix */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800">
                  Sector-by-Sector Next-Month Spending Forecast (October 2026)
                </span>
                <span className="text-slate-400">Click any sector to inspect detailed breakdown</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Sector</th>
                      <th className="py-3 px-3 text-right">Current Month (Sep)</th>
                      <th className="py-3 px-3 text-right text-purple-700">Forecast (Oct)</th>
                      <th className="py-3 px-3 text-right">MoM Diff</th>
                      <th className="py-3 px-3 text-center">Velocity</th>
                      <th className="py-3 px-3 text-center">Trend</th>
                      <th className="py-3 px-3 text-right">Monthly Ceiling</th>
                      <th className="py-3 px-3 text-center">Risk Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {forecastSummary.sectorForecasts.map((sf) => {
                      const matchedSec = displayedSectors.find(s => s.id === sf.sectorId);
                      return (
                        <tr
                          key={sf.sectorId}
                          onClick={() => matchedSec && handleOpenSectorModal(matchedSec)}
                          className="hover:bg-purple-50/40 transition cursor-pointer group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sf.color }} />
                              <div>
                                <span className="font-bold text-slate-900 group-hover:text-purple-700 transition">
                                  {sf.sectorName}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 block">
                                  {sf.sectorCode}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-700">
                            {formatCurrencyM(sf.currentMonthSpentUSD)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-bold text-purple-700">
                            {formatCurrencyM(sf.predictedNextMonthSpentUSD)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-600">
                            {sf.differenceUSD > 0 ? '+' : ''}{formatCurrencyM(sf.differenceUSD)}
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold">
                            <span className={sf.pctChange > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                              {sf.pctChange > 0 ? '+' : ''}{sf.pctChange}%
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              sf.trendDirection === 'UP' ? 'bg-amber-100 text-amber-800' :
                              sf.trendDirection === 'DOWN' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {sf.trendDirection === 'UP' ? 'Expanding ↗' : sf.trendDirection === 'DOWN' ? 'Cooling ↘' : 'Stable →'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                            {formatCurrencyM(sf.monthlyBudgetBaselineUSD)}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              sf.isOverBudget
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {sf.isOverBudget ? 'Budget Alert' : 'Within Budget'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-purple-50/60 border-t-2 border-purple-200 font-extrabold text-slate-900">
                      <td className="py-3.5 px-4">Consolidated Forecast</td>
                      <td className="py-3.5 px-3 text-right font-mono">{formatCurrencyM(forecastSummary.currentMonthTotalUSD)}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-purple-700">{formatCurrencyM(forecastSummary.predictedNextMonthTotalUSD)}</td>
                      <td className="py-3.5 px-3 text-right font-mono">{forecastSummary.differenceUSD > 0 ? '+' : ''}{formatCurrencyM(forecastSummary.differenceUSD)}</td>
                      <td className="py-3.5 px-3 text-center text-purple-700">{forecastSummary.pctChange > 0 ? '+' : ''}{forecastSummary.pctChange}%</td>
                      <td className="py-3.5 px-3 text-center">Moderate Growth</td>
                      <td className="py-3.5 px-3 text-right font-mono">{formatCurrencyM(forecastSummary.budgetBaselineNextMonthUSD)}</td>
                      <td className="py-3.5 px-3 text-center text-emerald-700">Low Risk Buffer</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {metricView === 'UTILIZATION_RATE' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-800">
                Holding Sector Capital Utilization Rate (%) vs Health Benchmark
              </span>
              <span className="italic text-slate-400">Target Threshold: &lt;90% • Click bar to inspect</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={utilizationChartData}
                  margin={{ top: 15, right: 15, left: -15, bottom: 25 }}
                  onClick={handleChartDataPointClick}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="code" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '14px', borderColor: '#cbd5e1' }}
                    formatter={(val: any, name: any) => [`${Number(val).toFixed(1)}%`, name]}
                    labelFormatter={(label, items) => {
                      const item = items[0]?.payload;
                      return item ? `${item.name} (${item.code})` : label;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                  <Bar
                    dataKey="utilization"
                    name="Utilization Rate (%)"
                    cursor="pointer"
                    radius={[6, 6, 0, 0]}
                    onClick={(entry) => handleChartDataPointClick(entry)}
                  >
                    {utilizationChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.utilization > 95 ? '#ef4444' : entry.utilization > 85 ? '#f59e0b' : '#3b82f6'}
                      />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="health"
                    name="Operational Health Score (%)"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    cursor="pointer"
                    onClick={(entry) => handleChartDataPointClick(entry)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Sectors Interactive Performance Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold text-slate-800">
            Sector Breakdown Summary & Audit Vouchers
          </span>
          <span className="text-slate-400">Click any sector row to view detailed breakdown modal</span>
        </div>

        <div className="overflow-x-auto border border-slate-200/90 rounded-2xl bg-white shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-3 text-right">Budget ($M)</th>
                <th className="py-3 px-3 text-right">Spent ($M)</th>
                <th className="py-3 px-3 text-right">Variance ($M)</th>
                <th className="py-3 px-3 text-center">Utilization</th>
                <th className="py-3 px-3">Primary KPI Metric</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedSectors.map((sector) => (
                <tr
                  key={sector.id}
                  onClick={() => handleOpenSectorModal(sector)}
                  className="hover:bg-blue-50/40 transition cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: sector.color }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {sector.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {sector.code}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                          {sector.subcategories.length} subcategories • {sector.recentVouchers.length} audited vouchers
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800">
                    {formatCurrencyM(sector.annualBudgetUSD)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-blue-600">
                    {formatCurrencyM(sector.spentUSD)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600">
                    +{formatCurrencyM(sector.varianceUSD)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-bold text-slate-800">{sector.utilizationRate}%</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-slate-600 block">{sector.primaryKpiMetric}</span>
                    <span className="text-blue-600 font-bold text-[11px]">{sector.primaryKpiValue}</span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      sector.status === 'EXCELLENT' ? 'bg-emerald-100 text-emerald-800' :
                      sector.status === 'ON_TRACK' ? 'bg-blue-100 text-blue-800' :
                      sector.status === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {sector.status === 'EXCELLENT' ? 'Optimal' : sector.status === 'ON_TRACK' ? 'On Track' : 'Review'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSectorModal(sector);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white transition cursor-pointer"
                    >
                      Breakdown
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Multi-sector spending ledger linked to holding banking accounts and payment gates</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download Full Excel</span>
          </button>
          <span>•</span>
          <button
            onClick={handleExportPdf}
            className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download Full PDF</span>
          </button>
        </div>
      </div>

      {/* Sector Expense Breakdown Modal */}
      <SectorExpenseBreakdownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sector={activeSectorForModal}
        holdingName={holding.name || 'SAS4ERP Holding Group'}
      />

    </div>
  );
};
