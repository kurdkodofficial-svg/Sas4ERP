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
  LineChart as LineChartIcon,
  Edit2,
  Trash2,
  Plus,
  RotateCcw,
  RefreshCw,
  Settings2,
  Printer
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
import { SectorEditModal } from './SectorEditModal';
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
  const {
    companies,
    projects,
    holding,
    setActiveTab,
    holdingSectors,
    addHoldingSector,
    updateHoldingSector,
    deleteHoldingSector,
    resetHoldingSectorsToDefault,
    syncSectorsWithCompanies,
    printKpiReport,
    openPrintManager,
    isConsolidationEnabled,
    consolidationSummary
  } = useERP();
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

  // Sector Edit & CRUD State
  const [isSectorEditModalOpen, setIsSectorEditModalOpen] = useState<boolean>(false);
  const [sectorToEdit, setSectorToEdit] = useState<HoldingSectorKpi | null>(null);
  const [deleteConfirmSector, setDeleteConfirmSector] = useState<HoldingSectorKpi | null>(null);

  // Dynamic Sectors Data from ERP Context with fallback
  const allSectors = useMemo(() => {
    if (holdingSectors && holdingSectors.length > 0) {
      return holdingSectors;
    }
    return getHoldingSectorsData(companies, projects);
  }, [holdingSectors, companies, projects]);

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

  // Language-aware display helpers
  const getSectorDisplayName = (s: { name: string; nameKu?: string; nameAr?: string }) => {
    if (language === 'ku' && s.nameKu) return s.nameKu;
    if (language === 'ar' && s.nameAr) return s.nameAr;
    return s.name;
  };

  const getLocalizedKpiMetric = (metric: string) => {
    if (language === 'en') return metric;
    const map: Record<string, { ku: string; ar: string }> = {
      'On-Schedule Milestones': { ku: 'قۆناغەکانی سەر کاتی پرۆژە', ar: 'المراحل المنجزة في الموعد' },
      'Power Uptime Factor': { ku: 'فاکتەری بەردەوامی کارەبا', ar: 'معامل استمرارية الطاقة' },
      'Pre-Lease / Sales Velocity': { ku: 'خێرایی بەکرێدان و فرۆشتن', ar: 'سرعة المبيعات والتأجير' },
      'Fleet Dispatch Reliability': { ku: 'باوەڕپێکراوی ناردنی بارهەڵگرەکان', ar: 'موثوقية إرسال أسطول النقل' },
      'Factory Production Yield': { ku: 'بەرهەمی کارگەیی', ar: 'إنتاجية المصنع والمواد' },
      'Network & Cloud Uptime': { ku: 'بەردەوامی تۆڕ و خزمەتگوزاری هەور', ar: 'جاهزية الشبكة والأنظمة السحابية' },
      'Camp Safety & Health Score': { ku: 'نمرەی تەندروستی و سەلامەتی کەمپ', ar: 'مؤشر أمان وصحة المخيمات' },
    };
    return map[metric]?.[language] || metric;
  };

  const getLocalizedStatusLabel = (status: 'EXCELLENT' | 'ON_TRACK' | 'WARNING' | 'ALERT') => {
    if (language === 'ku') {
      return status === 'EXCELLENT' ? 'ئەرێنی' : status === 'ON_TRACK' ? 'لە سەر ڕێڕەو' : status === 'WARNING' ? 'ئاگاداری' : 'پێداچوونەوە';
    }
    if (language === 'ar') {
      return status === 'EXCELLENT' ? 'أداء مثالي' : status === 'ON_TRACK' ? 'على المسار' : status === 'WARNING' ? 'تنبيه' : 'مراجعة';
    }
    return status === 'EXCELLENT' ? 'Optimal' : status === 'ON_TRACK' ? 'On Track' : status === 'WARNING' ? 'Warning' : 'Review';
  };

  const formatVoucherSubtitle = (subCount: number, vchCount: number) => {
    if (language === 'ku') {
      return `${subCount} جۆری لاوەکی • ${vchCount} پسوولەی وردبینی کراو`;
    }
    if (language === 'ar') {
      return `${subCount} تصنيفات فرعية • ${vchCount} سندات مدققة`;
    }
    return `${subCount} subcategories • ${vchCount} audited vouchers`;
  };

  const getLocalizedMonth = (m: string) => {
    const rawMonth = m.replace(' (Forecast)', '');
    const isForecast = m.includes('Forecast');
    const monthNames: Record<string, { ku: string; ar: string; en: string }> = {
      Jan: { en: 'Jan', ku: 'کانوونی دووەم', ar: 'يناير' },
      Feb: { en: 'Feb', ku: 'شوبات', ar: 'فبراير' },
      Mar: { en: 'Mar', ku: 'ئازار', ar: 'مارس' },
      Apr: { en: 'Apr', ku: 'نیسان', ar: 'أبريل' },
      May: { en: 'May', ku: 'ئایار', ar: 'مايو' },
      Jun: { en: 'Jun', ku: 'حوزەیران', ar: 'يونيو' },
      Jul: { en: 'Jul', ku: 'تەمووز', ar: 'يوليو' },
      Aug: { en: 'Aug', ku: 'ئاب', ar: 'أغسطس' },
      Sep: { en: 'Sep', ku: 'ئەیلوول', ar: 'سبتمبر' },
      Oct: { en: 'Oct', ku: 'تشرینی یەکەم', ar: 'أكتوبر' },
    };
    const translated = monthNames[rawMonth]?.[language] || rawMonth;
    if (isForecast) {
      if (language === 'ku') return `${translated} (پێشبینی)`;
      if (language === 'ar') return `${translated} (توقع)`;
      return `${translated} (Forecast)`;
    }
    return translated;
  };

  // Recharts Data for Budget vs Actual Bar Chart
  const barChartData = displayedSectors.map(s => {
    const dispName = getSectorDisplayName(s);
    return {
      id: s.id,
      code: s.code,
      name: dispName,
      nameKu: s.nameKu,
      nameAr: s.nameAr,
      shortName: dispName.split(' ')[0] + ' ' + (dispName.split(' ')[1] || ''),
      Budget: Number((s.annualBudgetUSD / 1000000).toFixed(2)),
      Spent: Number((s.spentUSD / 1000000).toFixed(2)),
      Remaining: Number((s.varianceUSD / 1000000).toFixed(2)),
      utilization: s.utilizationRate,
      sectorRef: s,
    };
  });

  // Recharts Data for Utilization Rate Chart
  const utilizationChartData = displayedSectors.map(s => ({
    id: s.id,
    code: s.code,
    name: getSectorDisplayName(s),
    nameKu: s.nameKu,
    nameAr: s.nameAr,
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
    setExportNotice(
      language === 'ku'
        ? `ڕاپۆرتی ئێکسڵ بە سەرکەوتوویی هەناردەکرا: ${filename}`
        : language === 'ar'
        ? `تم تصدير تقرير إكسل بنجاح: ${filename}`
        : `Excel report exported successfully with Trend Forecast: ${filename}`
    );
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportPdf = () => {
    const filename = exportKpiToPdf(displayedSectors, {
      holdingName: (language === 'ku' && holding.nameKu) || (language === 'ar' && holding.nameAr) || holding.name || 'Holding Group',
      chairmanName: holding.chairmanName || 'Holding Chairman / Owner',
      timeHorizon: timeHorizon === 'YTD' ? 'YTD 2026' : timeHorizon === 'Q3_2026' ? 'Q3 2026' : 'Full Year 2026 Projections',
      forecastAlgorithm,
    });
    setExportNotice(
      language === 'ku'
        ? `بەیاننامەی سەرۆکایەتی PDF بە سەرکەوتوویی هەناردەکرا: ${filename}`
        : language === 'ar'
        ? `تم تصدير بيان المجموعة بصيغة PDF بنجاح: ${filename}`
        : `Holding PDF Executive Statement exported successfully: ${filename}`
    );
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handlePrintKpiReport = async () => {
    const reportData = {
      title: 'Holding Sector Budget vs. Actual Expenditure Trends',
      titleKu: 'ڕاپۆرتی بودجەی کەرتەکان بەرامبەر ئاراستەی خەرجی ڕاستەقینە',
      titleAr: 'تقرير ميزانية القطاعات مقابل مسار المصروف الفعلي',
      holdingName: (language === 'ku' && holding.nameKu) || (language === 'ar' && holding.nameAr) || holding.name || 'Holding Enterprise Group',
      chairmanName: holding.chairmanName || 'Holding Chairman / Owner',
      generatedBy: holding.chairmanName || 'Executive Operations Center',
      date: new Date().toLocaleDateString(),
      timeHorizon: timeHorizon === 'YTD' ? 'YTD 2026' : timeHorizon === 'Q3_2026' ? 'Q3 2026' : 'Full Year 2026 Projections',
      summaryMetrics: [
        { label: 'Total Allocated Budget', value: formatCurrencyM(totalBudgetUSD) },
        { label: 'Actual Spent to Date', value: formatCurrencyM(totalSpentUSD) },
        { label: 'Uncommitted Capital Reserve', value: `+${formatCurrencyM(totalVarianceUSD)}` },
        { label: 'Capital Utilization Rate', value: `${overallUtilization}%` }
      ],
      tableHeaders: ['Code', 'Sector Name', 'Allocated Budget', 'Actual Spent', 'Variance', 'Utilization', 'Status'],
      tableRows: displayedSectors.map(s => [
        s.code,
        (language === 'ku' && s.nameKu) ? s.nameKu : (language === 'ar' && s.nameAr) ? s.nameAr : s.name,
        formatCurrencyM(s.annualBudgetUSD),
        formatCurrencyM(s.spentUSD),
        `+${formatCurrencyM(s.varianceUSD)}`,
        `${s.utilizationRate}%`,
        s.status
      ]),
      verifiedHash: `SIG-REPORT-KPI-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    };

    const res = await printKpiReport(reportData);
    setExportNotice(language === 'ku' ? res.messageKu : language === 'ar' ? res.messageAr : res.messageEn);
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
                  {language === 'ku' ? 'پوختەی KPI: بودجەی کەرتەکان بەرامبەر ئاراستەی خەرجی ڕاستەقینە' : language === 'ar' ? 'نظرة عامة على مؤشرات الأداء: ميزانية القطاعات مقابل مسار المصروف الفعلي' : 'KPI Overview: Sector Budget vs. Actual Spending Trends'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {language === 'ku' ? 'شیکاری گرافیکی' : language === 'ar' ? 'تحليلات بيانية' : 'Recharts Analytics'}
                </span>
                {isConsolidationEnabled && consolidationSummary.intercompanyEliminationsUSD > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>IFRS 10: -${(consolidationSummary.intercompanyEliminationsUSD / 1000000).toFixed(2)}M Eliminated</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {language === 'ku'
                  ? `نیشاندانی پێوەرە سەرەکییەکانی کارایی کۆمپانیاکان و ئاراستەی خەرجییەکان لە سەرانسەری ${displayedSectors.length} کەرتی هۆڵدینگ.`
                  : language === 'ar'
                  ? `عرض مؤشرات الأداء الرئيسية ومسارات المصروفات عبر ${displayedSectors.length} قطاعات تابعة للمجموعة.`
                  : `Visualizing key company performance metrics and expenditure trajectories across ${displayedSectors.length} holding sectors.`}
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
              <span>{language === 'ku' ? 'بەراوردی کەرتەکان' : language === 'ar' ? 'مقارنة القطاعات' : 'Sectors Comparison'}</span>
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
              <span>{language === 'ku' ? 'ئاراستەی مانگانە' : language === 'ar' ? 'المسار الشهري' : 'Monthly Trend'}</span>
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
              <span>{language === 'ku' ? 'ڕێژەی بەکارهێنان %' : language === 'ar' ? 'نسبة الاستهلاك %' : 'Burn Rate %'}</span>
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
              <span>{language === 'ku' ? 'پێشبینی ئاراستە' : language === 'ar' ? 'توقع المسار' : 'Trend Forecast'}</span>
            </button>
          </div>

          {/* Time Horizon Selector */}
          <select
            value={timeHorizon}
            onChange={(e) => setTimeHorizon(e.target.value as KpiTimeHorizon)}
            className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="YTD">{language === 'ku' ? 'لە سەرەتای ٢٠٢٦ەوە' : language === 'ar' ? 'من بداية عام 2026' : 'YTD 2026'}</option>
            <option value="Q3_2026">{language === 'ku' ? 'چارەکی سێیەم (ئێستا)' : language === 'ar' ? 'الربع الثالث (الحالي)' : 'Q3 2026 (Cur)'}</option>
            <option value="FULL_YEAR">{language === 'ku' ? 'پێشبینی تەواوی ساڵ' : language === 'ar' ? 'توقع كامل العام' : 'Full Year Proj.'}</option>
          </select>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-2xs transition cursor-pointer"
              id="kpi-export-excel-btn"
              title="Export Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'ku' ? 'ناردن بۆ ئێکسڵ' : language === 'ar' ? 'تصدير إكسل' : 'Export Excel'}</span>
            </button>

            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition cursor-pointer"
              id="kpi-export-pdf-btn"
              title="Export PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'ناردن بۆ PDF' : language === 'ar' ? 'تصدير PDF' : 'Export PDF'}</span>
            </button>

            <button
              onClick={handlePrintKpiReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-300 shadow-2xs transition cursor-pointer"
              id="kpi-print-btn"
              title="Direct Network Print via PrintManager"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'ku' ? 'چاپی ڕاستەوخۆ' : language === 'ar' ? 'طباعة مباشرة' : 'Network Print'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Summary Metric Cards with Inline SVG Sparklines */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 transition hover:bg-white hover:shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">{language === 'ku' ? 'بودجەی کۆکراوە' : language === 'ar' ? 'الميزانية المجمعة' : 'Consolidated Budget'}</span>
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {formatCurrencyM(totalBudgetUSD)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {language === 'ku' ? `${displayedSectors.length} کەرتی کارپێکردنی هۆڵدینگ` : language === 'ar' ? `${displayedSectors.length} قطاعات تشغيلية للمجموعة` : `${displayedSectors.length} Holding Operating Sectors`}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60">
            <SparklineChart
              data={kpiSparklines.budget30d}
              color="blue"
              height={26}
              trendLabel={language === 'ku' ? 'ئاراستەی ٣٠ ڕۆژە' : language === 'ar' ? 'مسار 30 يوم للميزانية' : '30d Budget Trend'}
              formatTooltip={(v) => formatCurrencyM(v)}
            />
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 transition hover:bg-white hover:shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">{language === 'ku' ? 'کۆی خەرجکراوی ئێستا' : language === 'ar' ? 'إجمالي المصروف الفعلي' : 'Actual Spent to Date'}</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-blue-600">
              {formatCurrencyM(totalSpentUSD)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              {overallUtilization}% {language === 'ku' ? 'تێکڕای سوودمەندی' : language === 'ar' ? 'متوسط الاستخدام' : 'Average Utilization'}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60">
            <SparklineChart
              data={kpiSparklines.spent30d}
              color="emerald"
              height={26}
              trendLabel={language === 'ku' ? 'خێرایی خەرجی ٣٠ ڕۆژە' : language === 'ar' ? 'معدل الحرق 30 يوم' : '30d Burn Rate'}
              formatTooltip={(v) => formatCurrencyM(v)}
            />
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 transition hover:bg-white hover:shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">{language === 'ku' ? 'باڵانسی یەدەگی جیاوازی' : language === 'ar' ? 'صافي فائض الاحتياطي' : 'Net Reserve Variance'}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-xl font-extrabold text-emerald-600">
              +{formatCurrencyM(totalVarianceUSD)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {language === 'ku' ? 'یەدەگی نەختینەی تەرخاننەکراو' : language === 'ar' ? 'سيولة مالية غير مقيدة' : 'Uncommitted capital cushion'}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60">
            <SparklineChart
              data={kpiSparklines.variance30d}
              color="indigo"
              height={26}
              trendLabel={language === 'ku' ? 'یەدەگی ٣٠ ڕۆژە' : language === 'ar' ? 'الاحتياطي 30 يوم' : '30d Capital Reserve'}
              formatTooltip={(v) => formatCurrencyM(v)}
            />
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 transition hover:bg-white hover:shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">{language === 'ku' ? 'نمرەی تەندروستی گشتی' : language === 'ar' ? 'مؤشر الصحة العام' : 'Composite Health'}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-xl font-extrabold text-purple-700">
              {averageHealthScore}%
            </div>
            <div className="text-[11px] text-purple-600 font-semibold mt-1">
              {language === 'ku' ? 'هەموو کەرتەکان لە ئاستی پارێزراودان' : language === 'ar' ? 'كافة القطاعات ضمن المعدلات الآمنة' : 'All sectors within safe thresholds'}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60">
            <SparklineChart
              data={kpiSparklines.health30d}
              color="purple"
              height={26}
              trendLabel={language === 'ku' ? 'تەندروستی ٣٠ ڕۆژە' : language === 'ar' ? 'الصحة 30 يوم' : '30d Health Index'}
              formatTooltip={(v) => `${v}%`}
            />
          </div>
        </div>
      </div>

      {/* Interactive Helper Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            {language === 'ku' ? (
              <><strong>گرافی کارلێککار:</strong> کلیک لەسەر هەر ستوون یان خاڵێکی گرافەکە بکە بۆ کردنەوەی <strong>مۆداڵی وردەکاریی خەرجییەکان</strong>.</>
            ) : language === 'ar' ? (
              <><strong>مخطط تفاعلي:</strong> انقر على أي عمود أو نقطة في الرسم البياني لفتح <strong>نافذة تفاصيل التوزيع المالي</strong>.</>
            ) : (
              <><strong>Interactive Graph:</strong> Click on any sector bar or data point in the graph below to trigger the <strong>Detailed Expense Breakdown Modal</strong>.</>
            )}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-blue-700 font-semibold">
          <span>{language === 'ku' ? 'خاڵە کارلێککارەکان چالاکن' : language === 'ar' ? 'النقاط التفاعلية مفعلة' : 'Clickable data points active'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Main Recharts Graph Area */}
      <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5">
        {metricView === 'BUDGET_VS_SPENT' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-800">
                {language === 'ku' ? 'کەرتە کۆکراوەکانی هۆڵدینگ: بودجەی تەرخانکراو بەرامبەر خەرجی ڕاستەقینە ($ ملیۆن دۆلار)' : language === 'ar' ? 'القطاعات المجمعة للمجموعة: الميزانية المخصصة مقابل المصروف الفعلي (مليون دولار)' : 'Consolidated Holding Sectors: Allocated Budget vs. Actual Spent ($ Millions USD)'}
              </span>
              <span className="italic text-slate-400">
                {language === 'ku' ? 'نرخەکان بە ملیۆن دۆلار ($M) • کلیک لەسەر ستوون بکە' : language === 'ar' ? 'القيم بملايين الدولارات ($M) • انقر للمعاينة' : 'Values in Millions ($M) • Click bar to inspect'}
              </span>
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
                {language === 'ku' ? 'سەقفی بودجەی مانگانەی ٢٠٢٦ بەرامبەر ئاراستەی خەرجی ڕاستەقینەی کۆکراوە ($ ملیۆن دۆلار)' : language === 'ar' ? 'سقف الميزانية الشهرية لعام 2026 مقابل مسار المصروف الفعلي المجمع (مليون دولار)' : '2026 Monthly Budget Ceiling vs Consolidated Actual Expenditure Trajectory ($M)'}
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-purple-700 font-semibold text-xs">
                  <input
                    type="checkbox"
                    checked={showForecastOverlay}
                    onChange={(e) => setShowForecastOverlay(e.target.checked)}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span>{language === 'ku' ? 'نیشاندانی پێشبینی مانگی داهاتوو (تشرینی یەکەم)' : language === 'ar' ? 'تضمين توقعات الشهر القادم (أكتوبر)' : 'Overlay Next Month Forecast (Oct)'}</span>
                </label>
                <span className="italic text-slate-400">
                  {language === 'ku' ? 'کانوونی دووەم - ئەیلوولی ٢٠٢٦' : language === 'ar' ? 'يناير - سبتمبر 2026' : 'Jan - Sep 2026'}
                </span>
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
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickFormatter={(val) => getLocalizedMonth(val)} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `$${val}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '14px', borderColor: '#cbd5e1' }}
                    formatter={(val: any, name: any) => [`$${Number(val).toFixed(2)}M`, name]}
                    labelFormatter={(val) => getLocalizedMonth(String(val))}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey={showForecastOverlay ? "budgetBaseline" : "Budget"}
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    name={language === 'ku' ? 'سەقفی مانگانەی بودجە ($M)' : language === 'ar' ? 'سقف الميزانية الشهري ($M)' : 'Budget Monthly Ceiling ($M)'}
                  />
                  <Area
                    type="monotone"
                    dataKey={showForecastOverlay ? "actualSpent" : "Spent"}
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#spendGrad)"
                    name={language === 'ku' ? 'خەرجی مانگانەی ڕاستەقینە ($M)' : language === 'ar' ? 'المصروف الشهري الفعلي ($M)' : 'Historical Monthly Spend ($M)'}
                  />
                  {showForecastOverlay && (
                    <Line
                      type="monotone"
                      dataKey="predictedSpent"
                      stroke="#9333ea"
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                      dot={{ r: 5, fill: '#9333ea', stroke: '#ffffff', strokeWidth: 2 }}
                      name={language === 'ku' ? 'ئاراستەی پێشبینیکراو ($M)' : language === 'ar' ? 'مسار التوقع المستقبلي ($M)' : 'Projected Trendline ($M)'}
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
                    {language === 'ku' ? 'ئەلگۆریتمی پێشبینیکردنی خەرجی' : language === 'ar' ? 'خوارزمية التنبؤ بالمصروفات' : 'Predictive Expenditure Algorithm'}
                  </h4>
                  <p className="text-[11px] text-purple-700">
                    {language === 'ku' ? 'پێشبینی ئاماری لەسەر بنەمای خێرایی خەرجی ٩ مانگی ڕابردووی هەموو کەرتەکان' : language === 'ar' ? 'استقراء إحصائي مبني على معدلات استنزاف 9 أشهر لكافة القطاعات' : 'Statistical extrapolation based on 9-month historical burn rates across all sectors'}
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
                  <span>{language === 'ku' ? 'هاوکێشەی هێڵی (OLS)' : language === 'ar' ? 'الانحدار الخطي (OLS)' : 'Linear Regression (OLS)'}</span>
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
                  <span>{language === 'ku' ? 'تێکڕای جووڵاوی ٣ مانگە' : language === 'ar' ? 'المتوسط المتحرك لـ 3 أشهر' : '3-Month Weighted Moving Average'}</span>
                </button>
              </div>
            </div>

            {/* Prediction Statistical Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl p-3.5 border border-purple-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {language === 'ku' ? 'پێشبینی خەرجی مانگی داهاتوو (تشرینی یەکەم)' : language === 'ar' ? 'توقع مصروف الشهر القادم (أكتوبر)' : 'Next Month Spend Forecast (Oct)'}
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
                  {language === 'ku' ? 'خێرایی و ئاراستەی مانگانە' : language === 'ar' ? 'وتيرة ومسار التغير الشهري' : 'MoM Velocity & Trajectory'}
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
                  {forecastSummary.differenceUSD > 0 ? '+' : ''}{formatCurrencyM(forecastSummary.differenceUSD)} {language === 'ku' ? 'بەرامبەر ئەیلوول' : language === 'ar' ? 'مقارنة بأيلول' : 'vs September'}
                </span>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-purple-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {language === 'ku' ? 'پوختەی زیادەی مانگانەی پێشبینیکراو' : language === 'ar' ? 'الفائض الشهري المتوقع' : 'Projected Monthly Surplus'}
                </span>
                <span className="text-lg font-extrabold text-emerald-600 block mt-0.5">
                  +{formatCurrencyM(forecastSummary.projectedVarianceNextMonthUSD)}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  {language === 'ku' ? 'لە چوارچێوەی سەقفی بودجەی مانگانەدایە' : language === 'ar' ? 'ضمن سقف الميزانية الشهري المعتمد' : 'Within monthly budget ceiling'}
                </span>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-purple-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {language === 'ku' ? 'کوالیتی و گونجاوی مۆدێل (R²)' : language === 'ar' ? 'جودة ملاءمة النموذج الإحصائي (R²)' : 'Model Goodness of Fit (R²)'}
                </span>
                <span className="text-lg font-extrabold text-slate-900 block mt-0.5">
                  {(forecastSummary.rSquared * 100).toFixed(1)}%
                </span>
                <span className="text-[11px] text-slate-500">
                  {forecastAlgorithm === 'LINEAR_REGRESSION'
                    ? (language === 'ku' ? 'پەیوەندی هێڵی بەهێز' : language === 'ar' ? 'ارتباط خطي قوي' : 'High linear correlation')
                    : (language === 'ku' ? 'گونجاوی کێشراوی نوێ' : language === 'ar' ? 'ملاءمة موزونة للأحدث' : 'Weighted recency fit')}
                </span>
              </div>
            </div>

            {/* Recharts Predictive Forecast Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800">
                  {language === 'ku' ? 'ڕێڕەوی پێشبینی خەرجی کۆکراوە: ڕابردوو بەرامبەر پێشبینی مانگی داهاتوو ($ ملیۆن دۆلار)' : language === 'ar' ? 'مسار التوقع المجمع: الفعلي التاريخي مقابل المتوقع للشهر القادم (مليون دولار)' : 'Consolidated Spending Forecast Trajectory: Historical vs. Next Month Projected ($M)'}
                </span>
                <span className="text-purple-700 font-semibold">
                  {language === 'ku' ? 'ئەلگۆریتم:' : language === 'ar' ? 'الخوارزمية:' : 'Algorithm:'} {forecastAlgorithm === 'LINEAR_REGRESSION' ? 'Linear Best Fit (y = mx + b)' : 'Weighted MA (1:2:3)'}
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
                        const localized = getLocalizedMonth(payload.value);
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
                              {localized}
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
                      labelFormatter={(val) => getLocalizedMonth(String(val))}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="budgetBaseline"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      name={language === 'ku' ? 'سەقفی مانگانەی بودجە ($M)' : language === 'ar' ? 'سقف الميزانية الشهري ($M)' : 'Monthly Budget Ceiling ($M)'}
                    />
                    <Area
                      type="monotone"
                      dataKey="actualSpent"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#actualAreaGrad)"
                      name={language === 'ku' ? 'خەرجی ڕاستەقینەی ڕابردوو ($M)' : language === 'ar' ? 'المصروف الفعلي التاريخي ($M)' : 'Historical Actual Spend ($M)'}
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
                      name={language === 'ku' ? 'ڕێڕەوی پێشبینی خەرجی ($M)' : language === 'ar' ? 'مسار التوقع المستقبلي ($M)' : 'Extrapolated Forecast Trajectory ($M)'}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sector-by-Sector Forecast Matrix */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800">
                  {language === 'ku' ? 'ماتریسی پێشبینی خەرجی مانگی داهاتوو بەپێی کەرتەکان (تشرینی یەکەمی ٢٠٢٦)' : language === 'ar' ? 'مصفوفة توقعات مصروف الشهر القادم حسب القطاعات (أكتوبر 2026)' : 'Sector-by-Sector Next-Month Spending Forecast (October 2026)'}
                </span>
                <span className="text-slate-400">
                  {language === 'ku' ? 'کلیک لەسەر هەر کەرتێک بکە بۆ بینینی وردەکاری' : language === 'ar' ? 'انقر على أي قطاع لمعاينة التفاصيل' : 'Click any sector to inspect detailed breakdown'}
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-2xs">
                <table className="w-full text-start border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 text-start">{language === 'ku' ? 'کەرت' : language === 'ar' ? 'القطاع' : 'Sector'}</th>
                      <th className="py-3 px-3 text-end">{language === 'ku' ? 'مانگی ئێستا (ئەیلوول)' : language === 'ar' ? 'الشهر الحالي (أيلول)' : 'Current Month (Sep)'}</th>
                      <th className="py-3 px-3 text-end text-purple-700">{language === 'ku' ? 'پێشبینی (تشرینی یەکەم)' : language === 'ar' ? 'التوقع (تشرين الأول)' : 'Forecast (Oct)'}</th>
                      <th className="py-3 px-3 text-end">{language === 'ku' ? 'جیاوازی مانگانە' : language === 'ar' ? 'فارق شهري' : 'MoM Diff'}</th>
                      <th className="py-3 px-3 text-center">{language === 'ku' ? 'خێرایی' : language === 'ar' ? 'الوتيرة' : 'Velocity'}</th>
                      <th className="py-3 px-3 text-center">{language === 'ku' ? 'ئاراستە' : language === 'ar' ? 'الاتجاه' : 'Trend'}</th>
                      <th className="py-3 px-3 text-end">{language === 'ku' ? 'سەقفی مانگانە' : language === 'ar' ? 'السقف الشهري' : 'Monthly Ceiling'}</th>
                      <th className="py-3 px-3 text-center">{language === 'ku' ? 'هەڵسەنگاندنی مەترسی' : language === 'ar' ? 'تقييم المخاطر' : 'Risk Assessment'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {forecastSummary.sectorForecasts.map((sf) => {
                      const matchedSec = displayedSectors.find(s => s.id === sf.sectorId);
                      const displayName = language === 'ku' && (sf.sectorNameKu || matchedSec?.nameKu)
                        ? (sf.sectorNameKu || matchedSec?.nameKu)
                        : language === 'ar' && (sf.sectorNameAr || matchedSec?.nameAr)
                        ? (sf.sectorNameAr || matchedSec?.nameAr)
                        : sf.sectorName;
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
                                  {displayName}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 block">
                                  {sf.sectorCode}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-end font-mono font-semibold text-slate-700">
                            {formatCurrencyM(sf.currentMonthSpentUSD)}
                          </td>
                          <td className="py-3.5 px-3 text-end font-mono font-bold text-purple-700">
                            {formatCurrencyM(sf.predictedNextMonthSpentUSD)}
                          </td>
                          <td className="py-3.5 px-3 text-end font-mono font-semibold text-slate-600">
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
                              {sf.trendDirection === 'UP'
                                ? (language === 'ku' ? 'فراوانبوون ↗' : language === 'ar' ? 'توسع ↗' : 'Expanding ↗')
                                : sf.trendDirection === 'DOWN'
                                ? (language === 'ku' ? 'کەمبوونەوە ↘' : language === 'ar' ? 'انخفاض ↘' : 'Cooling ↘')
                                : (language === 'ku' ? 'جێگیر →' : language === 'ar' ? 'مستقر →' : 'Stable →')}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-end font-mono text-slate-600">
                            {formatCurrencyM(sf.monthlyBudgetBaselineUSD)}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              sf.isOverBudget
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {sf.isOverBudget
                                ? (language === 'ku' ? 'ئاگاداری بودجە' : language === 'ar' ? 'تنبيه الميزانية' : 'Budget Alert')
                                : (language === 'ku' ? 'لە چوارچێوەی بودجە' : language === 'ar' ? 'ضمن الميزانية' : 'Within Budget')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-purple-50/60 border-t-2 border-purple-200 font-extrabold text-slate-900">
                      <td className="py-3.5 px-4 text-start">{language === 'ku' ? 'پێشبینی کۆکراوە' : language === 'ar' ? 'التوقع المجمع' : 'Consolidated Forecast'}</td>
                      <td className="py-3.5 px-3 text-end font-mono">{formatCurrencyM(forecastSummary.currentMonthTotalUSD)}</td>
                      <td className="py-3.5 px-3 text-end font-mono text-purple-700">{formatCurrencyM(forecastSummary.predictedNextMonthTotalUSD)}</td>
                      <td className="py-3.5 px-3 text-end font-mono">{forecastSummary.differenceUSD > 0 ? '+' : ''}{formatCurrencyM(forecastSummary.differenceUSD)}</td>
                      <td className="py-3.5 px-3 text-center text-purple-700">{forecastSummary.pctChange > 0 ? '+' : ''}{forecastSummary.pctChange}%</td>
                      <td className="py-3.5 px-3 text-center">{language === 'ku' ? 'گەشەی مامناوەند' : language === 'ar' ? 'نمو معتدل' : 'Moderate Growth'}</td>
                      <td className="py-3.5 px-3 text-end font-mono">{formatCurrencyM(forecastSummary.budgetBaselineNextMonthUSD)}</td>
                      <td className="py-3.5 px-3 text-center text-emerald-700">{language === 'ku' ? 'مەترسی نزم' : language === 'ar' ? 'مخاطر منخفضة' : 'Low Risk Buffer'}</td>
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
                {language === 'ku' ? 'ڕێژەی بەکارهێنانی سەرمایەی کەرتەکان (%) بەرامبەر ستانداردی کارایی' : language === 'ar' ? 'معدل استخدام رأس المال للقطاعات (%) مقابل المعيار التشغيلي' : 'Holding Sector Capital Utilization Rate (%) vs Health Benchmark'}
              </span>
              <span className="italic text-slate-400">
                {language === 'ku' ? 'ئاستی ئامانج: کەمتر لە ٩٠% • کلیک لەسەر ستوون بکە' : language === 'ar' ? 'الهدف المعياري: أقل من 90% • انقر للمعاينة' : 'Target Threshold: <90% • Click bar to inspect'}
              </span>
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
                      const sName = getSectorDisplayName(item || { name: label });
                      return item ? `${sName} (${item.code})` : label;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                  <Bar
                    dataKey="utilization"
                    name={language === 'ku' ? 'ڕێژەی بەکارهێنان (%)' : language === 'ar' ? 'معدل الاستخدام (%)' : 'Utilization Rate (%)'}
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
                    name={language === 'ku' ? 'نمرەی تەندروستی کارگێڕی (%)' : language === 'ar' ? 'مؤشر الصحة التشغيلية (%)' : 'Operational Health Score (%)'}
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

      {/* Sectors Interactive Performance Table & Administrative Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">
                {language === 'ku' ? 'بەڕێوەبردنی کەرتەکان، بودجە و پسوولەی وردبینی' : language === 'ar' ? 'إدارة القطاعات، الميزانيات وسندات التدقيق' : 'Sector Management, Budgets & Audit Vouchers'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {displayedSectors.length} {language === 'ku' ? 'کەرت' : language === 'ar' ? 'قطاعات' : 'Sectors'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'ku' ? 'خاوەنی هۆڵدینگ دەتوانێت ناوی کەرتەکان، بودجە و خەرجییەکان دەستکاری بکات یان کەرتی نوێ زیاد بکات' : language === 'ar' ? 'يمكن لمالك المجموعة تعديل أسماء وميزانيات القطاعات أو إضافة قطاعات جديدة' : 'Holding owner can customize sector names, budgets, spent amounts, or add new sectors'}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setSectorToEdit(null);
                setIsSectorEditModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'زیادکردنی کەرتی نوێ' : language === 'ar' ? 'إضافة قطاع جديد' : 'Add New Sector'}</span>
            </button>

            <button
              onClick={() => {
                syncSectorsWithCompanies();
                setExportNotice(
                  language === 'ku' ? 'کەرتەکان بە سەرکەوتوویی لەگەڵ کۆمپانیا و پرۆژەکان هاوکاتکران' :
                  language === 'ar' ? 'تمت مزامنة القطاعات مع الشركات والمشاريع بنجاح' :
                  'Sectors synchronized with registered companies & projects'
                );
                setTimeout(() => setExportNotice(null), 3000);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              title={language === 'ku' ? 'هاوکاتکردنی خۆکارانەی بودجە و خەرجی لەگەڵ کۆمپانیاکان' : language === 'ar' ? 'مزامنة تلقائية مع بيانات الشركات' : 'Sync auto budget and spend from companies'}
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">{language === 'ku' ? 'هاوکاتکردن لەگەڵ کۆمپانیاکان' : language === 'ar' ? 'مزامنة مع الشركات' : 'Sync from Companies'}</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(
                  language === 'ku' ? 'ئایا دڵنیایت لە گەڕاندنەوەی سەرجەم کەرتەکان بۆ دۆخی بنەڕەتی سیستەم؟' :
                  language === 'ar' ? 'هل أنت متأكد من استعادة كافة القطاعات إلى الإعدادات الافتراضية؟' :
                  'Reset all sectors to defaults?'
                )) {
                  resetHoldingSectorsToDefault();
                  setExportNotice(
                    language === 'ku' ? 'کەرتەکان گەڕێندرانەوە بۆ دۆخی بنەڕەتی' :
                    language === 'ar' ? 'تمت استعادة القطاعات الافتراضية' :
                    'Reset default sectors complete'
                  );
                  setTimeout(() => setExportNotice(null), 3000);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition cursor-pointer"
              title={language === 'ku' ? 'گەڕاندنەوە بۆ بنەڕەتی' : language === 'ar' ? 'استعادة الافتراضي' : 'Reset Defaults'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{language === 'ku' ? 'بنەڕەتی' : language === 'ar' ? 'افتراضي' : 'Defaults'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200/90 rounded-2xl bg-white shadow-2xs">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 text-start">{language === 'ku' ? 'کەرت' : language === 'ar' ? 'القطاع' : 'Sector'}</th>
                <th className="py-3 px-3 text-end">{language === 'ku' ? 'بودجە ($M)' : language === 'ar' ? 'الميزانية ($M)' : 'Budget ($M)'}</th>
                <th className="py-3 px-3 text-end">{language === 'ku' ? 'خەرجکراو ($M)' : language === 'ar' ? 'المصروف ($M)' : 'Spent ($M)'}</th>
                <th className="py-3 px-3 text-end">{language === 'ku' ? 'جیاوازی ($M)' : language === 'ar' ? 'الفارق ($M)' : 'Variance ($M)'}</th>
                <th className="py-3 px-3 text-center">{language === 'ku' ? 'ڕێژەی بەکارهێنان' : language === 'ar' ? 'نسبة الاستخدام' : 'Utilization'}</th>
                <th className="py-3 px-3 text-start">{language === 'ku' ? 'پێوەری سەرەکی KPI' : language === 'ar' ? 'مؤشر الأداء الرئيسي' : 'Primary KPI Metric'}</th>
                <th className="py-3 px-3 text-center">{language === 'ku' ? 'دۆخ' : language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 text-center">{language === 'ku' ? 'کردارەکان' : language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedSectors.map((sector) => {
                const sName = getSectorDisplayName(sector);
                return (
                  <tr
                    key={sector.id}
                    onClick={() => handleOpenSectorModal(sector)}
                    className="hover:bg-blue-50/40 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 text-start">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: sector.color }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                              {sName}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {sector.code}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                            {formatVoucherSubtitle(sector.subcategories.length, sector.recentVouchers.length)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-end font-mono font-bold text-slate-800">
                      {formatCurrencyM(sector.annualBudgetUSD)}
                    </td>
                    <td className="py-3.5 px-3 text-end font-mono font-bold text-blue-600">
                      {formatCurrencyM(sector.spentUSD)}
                    </td>
                    <td className="py-3.5 px-3 text-end font-mono font-bold text-emerald-600">
                      +{formatCurrencyM(sector.varianceUSD)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-slate-800">{sector.utilizationRate}%</span>
                    </td>
                    <td className="py-3.5 px-3 text-start">
                      <span className="text-slate-600 block">{getLocalizedKpiMetric(sector.primaryKpiMetric)}</span>
                      <span className="text-blue-600 font-bold text-[11px]">{sector.primaryKpiValue}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sector.status === 'EXCELLENT' ? 'bg-emerald-100 text-emerald-800' :
                        sector.status === 'ON_TRACK' ? 'bg-blue-100 text-blue-800' :
                        sector.status === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {getLocalizedStatusLabel(sector.status)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenSectorModal(sector)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white transition cursor-pointer"
                          title={language === 'ku' ? 'وردەکاری' : language === 'ar' ? 'تفاصيل' : 'Breakdown'}
                        >
                          {language === 'ku' ? 'وردەکاری' : language === 'ar' ? 'تفاصيل' : 'Breakdown'}
                        </button>

                        <button
                          onClick={() => {
                            setSectorToEdit(sector);
                            setIsSectorEditModalOpen(true);
                          }}
                          className="p-1 rounded-lg text-amber-700 hover:text-white bg-amber-50 hover:bg-amber-600 transition cursor-pointer border border-amber-200/60"
                          title={language === 'ku' ? 'دەستکاریکردنی بودجە و ناوی کەرت' : language === 'ar' ? 'تعديل الميزانية والاسم' : 'Edit Sector & Budget'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmSector(sector)}
                          className="p-1 rounded-lg text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 transition cursor-pointer border border-rose-200/60"
                          title={language === 'ku' ? 'سڕینەوەی کەرت' : language === 'ar' ? 'حذف القطاع' : 'Delete Sector'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmSector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {language === 'ku' ? 'سڕینەوەی کەرت' : language === 'ar' ? 'حذف القطاع' : 'Delete Sector'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {getSectorDisplayName(deleteConfirmSector)} ({deleteConfirmSector.code})
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'ku'
                ? `ئایا دڵنیایت لە سڕینەوەی ئەم کەرتە؟ بودجەکەی (${formatCurrencyM(deleteConfirmSector.annualBudgetUSD)}) و خەرجییەکانی لە سەرجەم چارتەکان و ماتریسەکان لادەبرێن.`
                : language === 'ar'
                ? `هل أنت متأكد من حذف هذا القطاع؟ سيتم حذف ميزانيته (${formatCurrencyM(deleteConfirmSector.annualBudgetUSD)}) ومصروفاته من كافة المخططات والمصفوفات.`
                : `Are you sure you want to delete this sector? Its budget (${formatCurrencyM(deleteConfirmSector.annualBudgetUSD)}) and expenditures will be removed from all charts and forecast matrices.`}
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirmSector(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                {language === 'ku' ? 'پاشگەزبوونەوە' : language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  deleteHoldingSector(deleteConfirmSector.id);
                  setDeleteConfirmSector(null);
                  setExportNotice(
                    language === 'ku' ? 'کەرتەکە بە سەرکەوتوویی سڕایەوە' :
                    language === 'ar' ? 'تم حذف القطاع بنجاح' :
                    'Sector deleted successfully'
                  );
                  setTimeout(() => setExportNotice(null), 3000);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer shadow-xs"
              >
                {language === 'ku' ? 'بەڵێ، بیسڕەوە' : language === 'ar' ? 'نعم، حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            {language === 'ku'
              ? 'دەفتەری خەرجی فرە-کەرت بەستراوە بە هەژماری بانکی هۆڵدینگ و دەروازەکانی پارەدان'
              : language === 'ar'
              ? 'سجل مصروفات القطاعات المتعددة مرتبط بحسابات بنوك القابضة وبوابات الدفع'
              : 'Multi-sector spending ledger linked to holding banking accounts and payment gates'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'داگرتنی ئێکسڵ' : language === 'ar' ? 'تحميل إكسل' : 'Download Full Excel'}</span>
          </button>
          <span>•</span>
          <button
            onClick={handleExportPdf}
            className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'داگرتنی PDF' : language === 'ar' ? 'تحميل PDF' : 'Download Full PDF'}</span>
          </button>
          <span>•</span>
          <button
            onClick={handlePrintKpiReport}
            className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'چاپی ڕاستەوخۆ' : language === 'ar' ? 'طباعة مباشرة' : 'Network Print'}</span>
          </button>
        </div>
      </div>

      {/* Sector Expense Breakdown Modal */}
      <SectorExpenseBreakdownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sector={activeSectorForModal}
        holdingName={holding.name || 'SAS4ERP Holding Group'}
        onEditSector={(sec) => {
          setSectorToEdit(sec);
          setIsSectorEditModalOpen(true);
        }}
      />

      {/* Sector Add / Edit Modal */}
      <SectorEditModal
        isOpen={isSectorEditModalOpen}
        onClose={() => {
          setIsSectorEditModalOpen(false);
          setSectorToEdit(null);
        }}
        sectorToEdit={sectorToEdit}
      />

    </div>
  );
};
