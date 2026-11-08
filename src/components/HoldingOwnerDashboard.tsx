import React, { useState, useEffect, useMemo } from 'react';
import { SparklineChart } from './SparklineChart';
import {
  Crown,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Video,
  ScanLine,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  DollarSign,
  Wallet,
  BrainCircuit,
  Sliders,
  Filter,
  Calendar,
  Layers,
  Clock,
  Briefcase,
  Globe,
  Edit3,
  Printer,
  FolderKanban,
  Radio,
  PenTool,
  LayoutGrid,
  ShoppingCart,
  Boxes,
  Truck,
  Zap,
  Home,
  ShieldAlert,
  Cpu,
  Activity,
  CalendarRange,
  Mail,
  BookOpen
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { resolveEntityText, getUIText } from '../utils/langHelper';
import { hasModuleAccess } from '../utils/rbacPermissions';
import { Company, PurchaseOrder } from '../types/erp';
import {
  DashboardSettings,
  defaultDashboardSettings,
  WidgetId,
  MacroKpiId,
  ExecutiveFocusPreset
} from '../types/dashboardConfig';
import { DashboardConfigModal } from './dashboard/DashboardConfigModal';
import { HoldingFinancialSummaryWidget } from './dashboard/HoldingFinancialSummaryWidget';
import { GroupProjectsRadarWidget } from './dashboard/GroupProjectsRadarWidget';
import { LiveActivityFeedWidget } from './dashboard/LiveActivityFeedWidget';
import { SubsidiaryEfficiencyWidget } from './dashboard/SubsidiaryEfficiencyWidget';
import { RiskComplianceWidget } from './dashboard/RiskComplianceWidget';
import { DepartmentOperationsMatrixWidget } from './dashboard/DepartmentOperationsMatrixWidget';
import { KpiOverviewWidget } from './dashboard/KpiOverviewWidget';
import { GeneralManagersWidget } from './dashboard/GeneralManagersWidget';
import { ProjectExpenditureBudgetRechartsDashboard } from './dashboard/ProjectExpenditureBudgetRechartsDashboard';
import { MLAnomalyMonitorWidget } from './dashboard/MLAnomalyMonitorWidget';
import { ExecutiveStickyNoteWidget } from './dashboard/ExecutiveStickyNoteWidget';
import { HoldingMeshSyncHubModal } from './dashboard/HoldingMeshSyncHubModal';
import { BranchProjectOperationalPortal } from './dashboard/BranchProjectOperationalPortal';

export const HoldingOwnerDashboard: React.FC = () => {
  const {
    holding,
    companies,
    projects,
    purchaseOrders,
    gateLogs,
    foreignWorkers,
    anomalyAlerts,
    approvePurchaseByOwner,
    rejectPurchaseByOwner,
    startCallWithManager,
    setIsGateScannerOpen,
    setIsMeetingModalOpen,
    setIsHoldingSetupOpen,
    setActiveTab,
    setSelectedCompanyId,
    setIsSignatureModalOpen,
    setIsPrinterModalOpen,
    setIsUserRolesModalOpen,
    setIsUserManualOpen,
    currentUser,
  } = useERP();

  const { t, language } = useLanguage();

  // Settings State with LocalStorage Persistence
  const [settings, setSettings] = useState<DashboardSettings>(() => {
    const saved = localStorage.getItem('sas4erp_owner_dashboard_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.visibleWidgets.includes('kpi_overview')) {
          parsed.visibleWidgets.splice(1, 0, 'kpi_overview');
        }
        if (!parsed.widgetOrder.includes('kpi_overview')) {
          parsed.widgetOrder.splice(1, 0, 'kpi_overview');
        }
        if (!parsed.visibleWidgets.includes('project_expenditure_chart')) {
          parsed.visibleWidgets.splice(2, 0, 'project_expenditure_chart');
        }
        if (!parsed.widgetOrder.includes('project_expenditure_chart')) {
          parsed.widgetOrder.splice(2, 0, 'project_expenditure_chart');
        }
        if (!parsed.visibleWidgets.includes('general_managers')) {
          parsed.visibleWidgets.splice(3, 0, 'general_managers');
        }
        if (!parsed.widgetOrder.includes('general_managers')) {
          parsed.widgetOrder.splice(3, 0, 'general_managers');
        }
        return parsed;
      } catch {
        // fallback
      }
    }
    return defaultDashboardSettings;
  });

  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isMeshHubOpen, setIsMeshHubOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('sas4erp_owner_dashboard_config', JSON.stringify(settings));
  }, [settings]);

  const handleSaveSettings = (newSettings: DashboardSettings) => {
    setSettings(newSettings);
  };

  const handlePresetSelect = (preset: ExecutiveFocusPreset) => {
    if (preset === 'ALL') {
      setSettings(prev => ({
        ...prev,
        preset: 'ALL',
        visibleWidgets: defaultDashboardSettings.visibleWidgets,
        selectedMacroKpis: ['total_budget', 'total_spent', 'total_workforce', 'pending_pos']
      }));
    } else if (preset === 'FINANCE') {
      setSettings(prev => ({
        ...prev,
        preset: 'FINANCE',
        visibleWidgets: ['macro_kpis', 'kpi_overview', 'pending_approvals', 'financial_summary', 'subsidiary_matrix', 'recent_activities'],
        selectedMacroKpis: ['total_budget', 'total_spent', 'revenue_runway', 'pending_pos']
      }));
    } else if (preset === 'PROJECTS') {
      setSettings(prev => ({
        ...prev,
        preset: 'PROJECTS',
        visibleWidgets: ['macro_kpis', 'kpi_overview', 'projects_radar', 'subsidiary_matrix', 'directors_directory', 'recent_activities'],
        selectedMacroKpis: ['active_projects', 'total_workforce', 'total_spent', 'gate_deliveries']
      }));
    } else if (preset === 'RISK') {
      setSettings(prev => ({
        ...prev,
        preset: 'RISK',
        visibleWidgets: ['macro_kpis', 'kpi_overview', 'risk_compliance', 'pending_approvals', 'recent_activities', 'directors_directory'],
        selectedMacroKpis: ['iqama_risk', 'pending_pos', 'gate_deliveries', 'total_workforce']
      }));
    }
  };

  // Scope Filtering
  const filteredCompanies = settings.selectedCompanyFilter === 'ALL'
    ? companies
    : companies.filter(c => c.id === settings.selectedCompanyFilter);

  const filteredProjects = settings.selectedCompanyFilter === 'ALL'
    ? projects
    : projects.filter(p => p.companyId === settings.selectedCompanyFilter);

  const pendingPOs = purchaseOrders.filter(p => {
    const matchStatus = p.status === 'PENDING_OWNER_APPROVAL';
    const matchCompany = settings.selectedCompanyFilter === 'ALL' || p.companyId === settings.selectedCompanyFilter;
    return matchStatus && matchCompany;
  });

  const expiringIqamas = foreignWorkers.filter(w => {
    const matchVisa = w.visaStatus === 'EXPIRING_SOON' || w.visaStatus === 'EXPIRED';
    const matchCompany = settings.selectedCompanyFilter === 'ALL' || w.companyId === settings.selectedCompanyFilter;
    return matchVisa && matchCompany;
  });

  const totalHoldingBudget = filteredCompanies.reduce((acc, c) => acc + c.annualBudgetUSD, 0);
  const totalHoldingSpent = filteredCompanies.reduce((acc, c) => acc + c.spentUSD, 0);
  const totalEmployees = filteredCompanies.reduce((acc, c) => acc + c.employeeCount, 0);
  const totalForeignSpecialists = foreignWorkers.filter(w => settings.selectedCompanyFilter === 'ALL' || w.companyId === settings.selectedCompanyFilter).length;

  // Top-Level Project Budget & 90% Threshold Monitoring
  const totalProjectBudget = filteredProjects.reduce((sum, p) => sum + (p.budgetUSD || 0), 0);
  const totalProjectSpent = filteredProjects.reduce((sum, p) => sum + (p.spentUSD || 0), 0);
  const activeBudgetUtilizationRate = totalProjectBudget > 0
    ? ((totalProjectSpent / totalProjectBudget) * 100).toFixed(1)
    : totalHoldingBudget > 0
      ? ((totalHoldingSpent / totalHoldingBudget) * 100).toFixed(1)
      : '0.0';

  const highBurnProjects = filteredProjects.filter(p => {
    const budget = p.budgetUSD || 0;
    const spent = p.spentUSD || 0;
    return budget > 0 && (spent / budget) >= 0.90;
  });

  const criticalMlAlerts = anomalyAlerts.filter(a => a.severity === 'CRITICAL' && (a.status === 'TRIGGERED' || a.status === 'INVESTIGATING'));

  const systemModuleCards = [
    {
      id: 'procurement',
      icon: ShoppingCart,
      badge: 'PO',
      title: language === 'ku' ? 'کڕین و داواکارییەکان' : language === 'ar' ? 'المشتريات' : 'Procurement & POs',
      subtitle: `${purchaseOrders.length} ${language === 'ku' ? 'داواکاری تۆمارکراو' : 'Orders'}`, 
      onClick: () => setActiveTab('procurement')
    },
    {
      id: 'finance',
      icon: Wallet,
      badge: 'USD',
      title: language === 'ku' ? 'دارایی و گەنجینە' : language === 'ar' ? 'المالية والمحاسبة' : 'Finance & Accounting',
      subtitle: language === 'ku' ? 'سەند و بودجە' : 'Vouchers & Ledgers',
      onClick: () => setActiveTab('finance')
    },
    {
      id: 'companies-projects',
      icon: Building2,
      badge: 'GRP',
      title: language === 'ku' ? 'کۆمپانیا و پڕۆژەکان' : language === 'ar' ? 'الشركات والمشاريع' : 'Companies & Projects',
      subtitle: `${filteredCompanies.length} ${language === 'ku' ? 'کۆمپانیا' : 'Cos'} • ${filteredProjects.length} ${language === 'ku' ? 'پڕۆژە' : 'Projs'}`, 
      onClick: () => setActiveTab('companies-projects')
    },
    {
      id: 'it-systems',
      icon: Activity,
      badge: 'NET',
      title: language === 'ku' ? 'ئایتی و چاودێری نۆدەکان' : language === 'ar' ? 'أنظمة IT والشبكة' : 'IT Systems & Radar',
      subtitle: language === 'ku' ? 'خێرایی تۆڕ و سێرڤەر' : 'Node Latency Ping',
      onClick: () => setActiveTab('it-systems')
    },
    {
      id: 'gate-scanner',
      icon: ScanLine,
      badge: 'SCAN',
      title: language === 'ku' ? 'سکێنەری دەروازە (Gate)' : language === 'ar' ? 'ماسح البوابة' : 'Gate QR Scanner',
      subtitle: `${gateLogs.length} ${language === 'ku' ? 'تۆماری هاتووچۆ' : 'Gate Scans'}`, 
      onClick: () => {
        setActiveTab('gate-scanner');
        setIsGateScannerOpen(true);
      }
    },
    {
      id: 'warehouse',
      icon: Boxes,
      badge: 'INV',
      title: language === 'ku' ? 'کۆگا و کەرەستەکان' : language === 'ar' ? 'المستودعات والمخزون' : 'Warehouse Inventory',
      subtitle: language === 'ku' ? 'کەرەستە و چیمەنتۆ' : 'Materials & Batches',
      onClick: () => setActiveTab('warehouse')
    },
    {
      id: 'dispatch-logistics',
      icon: Truck,
      badge: 'FLEET',
      title: language === 'ku' ? 'بارکردن و لۆجستی' : language === 'ar' ? 'الشحن واللوجستيات' : 'Dispatch Logistics',
      subtitle: language === 'ku' ? 'بارنامە و قەپان' : 'Waybills & Weighbridge',
      onClick: () => setActiveTab('dispatch-logistics')
    },
    {
      id: 'foreign-workers',
      icon: Users,
      badge: 'VISA',
      title: language === 'ku' ? 'کرێکارانی بیانی و ڤیزا' : language === 'ar' ? 'العمالة والإقامات' : 'Foreign Labor & Visas',
      subtitle: `${foreignWorkers.length} ${language === 'ku' ? 'کارمەند تۆمارکراوە' : 'Workers'}`, 
      onClick: () => setActiveTab('foreign-workers')
    },
    {
      id: 'ml-anomaly-detection',
      icon: BrainCircuit,
      badge: 'AI',
      title: language === 'ku' ? 'چاودێری ژیری دەستکرد' : language === 'ar' ? 'رادار الذكاء الاصطناعي' : 'AI Sentinel Radar',
      subtitle: `${anomalyAlerts.length} ${language === 'ku' ? 'هۆشداری دارایی' : 'Alerts'}`, 
      onClick: () => setActiveTab('ml-anomaly-detection')
    },
    {
      id: 'project-reports',
      icon: CalendarRange,
      badge: 'GANTT',
      title: language === 'ku' ? 'هێڵکاری گانت و ڕاپۆرت' : language === 'ar' ? 'مخطط جانت والتقارير' : 'Gantt Progress & Reports',
      subtitle: language === 'ku' ? 'ڕاپۆرتی خولی و خشتە' : 'Periodic Submissions',
      onClick: () => setActiveTab('project-reports')
    },
    {
      id: 'owner-approvals',
      icon: Crown,
      badge: 'EXEC',
      title: language === 'ku' ? 'واژۆی سەرۆکایەتی هۆلدینگ' : language === 'ar' ? 'موافقات الرئاسة' : 'Owner Approvals',
      subtitle: `${pendingPOs.length} ${language === 'ku' ? 'داواکاری چاوەڕوان' : 'Pending Release'}`, 
      onClick: () => setActiveTab('owner-approvals')
    },
    {
      id: 'virtual-meetings',
      icon: Video,
      badge: 'LIVE',
      title: language === 'ku' ? 'کۆبوونەوەی ڤیدیۆیی ڕاستەوخۆ' : language === 'ar' ? 'اجتماعات مرئية فورية' : 'Virtual Meeting Hub',
      subtitle: language === 'ku' ? 'پەیوەندی لەگەڵ لقەکان' : 'Branch HQ Calls',
      onClick: () => {
        setActiveTab('virtual-meetings');
        setIsMeetingModalOpen(true);
      }
    },
    {
      id: 'technical-electrical',
      icon: Zap,
      badge: 'PWR',
      title: language === 'ku' ? 'تەکنیکی، کارەبا و مۆلیدە' : language === 'ar' ? 'الصيانة والمولدات' : 'Power & Generator Plant',
      subtitle: language === 'ku' ? 'سوتەمەنی و پشکنین' : 'Turbine & Fuel Sync',
      onClick: () => setActiveTab('technical-electrical')
    },
    {
      id: 'hse-fire-security',
      icon: ShieldAlert,
      badge: 'HSE',
      title: language === 'ku' ? 'سەلامەتی مەیدانی (HSE)' : language === 'ar' ? 'السلامة والصحة المهنية' : 'HSE Safety & Fire',
      subtitle: language === 'ku' ? 'ئاگرکوژێنەوە و پێکان' : 'Fire & Incident Logs',
      onClick: () => setActiveTab('hse-fire-security')
    },
    {
      id: 'camps-accommodation',
      icon: Home,
      badge: 'CAMP',
      title: language === 'ku' ? 'کەمپ و مانەوە' : language === 'ar' ? 'مجمعات السكن' : 'Camps & Rooms',
      subtitle: language === 'ku' ? 'ژوور و کارمەندان' : 'Housing & Beds',
      onClick: () => setActiveTab('camps-accommodation')
    }
  ];

  const visibleModuleCards = systemModuleCards.filter(m => hasModuleAccess(currentUser, m.id));

  const formatCurrency = (valUSD: number) => {
    if (settings.currencyDisplay === 'IQD') {
      const iqd = valUSD * 1310;
      return `${(iqd / 1000000000).toFixed(2)}B IQD`;
    }
    return `$${(valUSD / 1000000).toFixed(2)}M`;
  };

  // Memoized 30-Day Historical Trend Datasets for inline SVG Sparklines
  const sparklineData = useMemo(() => {
    // 1. Projects Trend (30 Days)
    const curProj = filteredProjects.length;
    const baseProj = Math.max(1, curProj - 1);
    const projects30d = Array.from({ length: 30 }, (_, i) => {
      if (i < 10) return baseProj;
      if (i < 24) return baseProj;
      return curProj;
    });

    // 2. Budget Utilization Rate (30 Days)
    const curUtil = Number(activeBudgetUtilizationRate) || 88.4;
    const startUtil = Math.max(30, curUtil - 7.6);
    const utilization30d = Array.from({ length: 30 }, (_, i) => {
      const progress = i / 29;
      const wave = Math.sin(i * 1.2) * 0.45;
      const v = startUtil + (curUtil - startUtil) * progress + wave;
      return Number(Math.min(100, Math.max(0, v)).toFixed(1));
    });
    utilization30d[29] = curUtil;

    // 3. Pending Approvals Queue (30 Days)
    const curPending = pendingPOs.length;
    const approvals30d = Array.from({ length: 30 }, (_, i) => {
      const wave = Math.sin(i * 0.8) * 2 + Math.cos(i * 0.4) * 1.2;
      const base = 4 + (29 - i) * 0.08;
      return Math.max(0, Math.round(base + wave));
    });
    approvals30d[29] = curPending;

    // 4. Threshold & Risk Alerts (30 Days)
    const curRisks = highBurnProjects.length;
    const risk30d = Array.from({ length: 30 }, (_, i) => {
      if (curRisks === 0) return 0;
      return i < 18 ? 0 : curRisks;
    });
    risk30d[29] = curRisks;

    // 5. Total Consolidated Budget (30 Days)
    const budget30d = Array.from({ length: 30 }, (_, i) => {
      const start = totalHoldingBudget * 0.92;
      return Math.round(start + (totalHoldingBudget - start) * (i / 29));
    });

    // 6. Total Spent (30 Days)
    const spent30d = Array.from({ length: 30 }, (_, i) => {
      const start = totalHoldingSpent * 0.88;
      const wave = Math.sin(i * 0.7) * (totalHoldingSpent * 0.006);
      return Math.round(start + (totalHoldingSpent - start) * (i / 29) + wave);
    });

    // 7. Revenue Influx (30 Days)
    const revStart = holding.totalRevenueUSD * 0.86;
    const revenue30d = Array.from({ length: 30 }, (_, i) => {
      const wave = Math.cos(i * 0.9) * (holding.totalRevenueUSD * 0.008);
      return Math.round(revStart + (holding.totalRevenueUSD - revStart) * (i / 29) + wave);
    });

    // 8. Total Workforce / Staff (30 Days)
    const staff30d = Array.from({ length: 30 }, (_, i) => {
      const base = Math.max(1, totalEmployees - 3);
      if (i < 8) return base;
      if (i < 20) return base + 1;
      return totalEmployees;
    });

    // 9. Residency / Iqama Risk (30 Days)
    const curIqama = expiringIqamas.length;
    const iqamaRisk30d = Array.from({ length: 30 }, (_, i) => {
      const v = Math.round(curIqama + Math.sin(i * 0.6) * 1.5);
      return Math.max(0, v);
    });
    iqamaRisk30d[29] = curIqama;

    // 10. Gate Deliveries Scanned (30 Days)
    const curGate = gateLogs.length;
    const gateLogs30d = Array.from({ length: 30 }, (_, i) => {
      const wave = Math.sin(i * 0.5) * 3 + Math.cos(i * 0.9) * 2;
      const v = Math.max(1, Math.round((curGate * 0.4) + (curGate * 0.6 * (i / 29)) + wave));
      return v;
    });
    gateLogs30d[29] = curGate;

    return {
      projects30d,
      utilization30d,
      approvals30d,
      risk30d,
      budget30d,
      spent30d,
      revenue30d,
      staff30d,
      iqamaRisk30d,
      gateLogs30d
    };
  }, [
    filteredProjects.length,
    activeBudgetUtilizationRate,
    pendingPOs.length,
    highBurnProjects.length,
    totalHoldingBudget,
    totalHoldingSpent,
    holding.totalRevenueUSD,
    totalEmployees,
    expiringIqamas.length,
    gateLogs.length
  ]);

  // Helper to render KPI Card with Visual Trend Indicators
  const renderMacroKpiCard = (kpiId: MacroKpiId) => {
    switch (kpiId) {
      case 'total_budget':
        return (
          <div key={kpiId} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">{t('totalBudget')}</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl font-extrabold text-slate-900">
                  {formatCurrency(totalHoldingBudget)}
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <ArrowUpRight className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                  <span>+8.5%</span>
                  <span className="text-slate-400 font-normal hidden sm:inline">({language === 'ku' ? 'vs پێشوو' : language === 'ar' ? 'vs السابق' : 'vs prev'})</span>
                </div>
              </div>
              <div className="text-xs text-blue-600 mt-2 flex items-center justify-between font-semibold">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Across {filteredCompanies.length} Subsidiaries</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">QoQ Allocation</span>
              </div>
            </div>

            {/* Small Inline SVG Sparkline (30-Day Historical Trend) */}
            <div className="mt-2.5 pt-2 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.budget30d}
                color="blue"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Allocation Trend', ku: 'ڕەوتی بودجەی ٣٠ ڕۆژ', ar: 'مسار الميزانية ٣٠ يوم' })}
                formatTooltip={(v) => formatCurrency(v)}
              />
            </div>
          </div>
        );

      case 'total_spent':
        return (
          <div key={kpiId} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">{t('totalSpent')}</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl font-extrabold text-slate-900">
                  {formatCurrency(totalHoldingSpent)}
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <ArrowUpRight className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                  <span>+3.4%</span>
                  <span className="text-slate-400 font-normal hidden sm:inline">({language === 'ku' ? 'مانگانە' : language === 'ar' ? 'شهري' : 'MoM'})</span>
                </div>
              </div>
              <div className="text-xs text-emerald-600 mt-2 flex items-center justify-between font-semibold">
                <span>{((totalHoldingSpent / (totalHoldingBudget || 1)) * 100).toFixed(1)}% Utilization Rate</span>
                <span className="text-[10px] text-slate-400 font-normal">Controlled pace</span>
              </div>
            </div>

            {/* Small Inline SVG Sparkline (30-Day Historical Trend) */}
            <div className="mt-2.5 pt-2 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.spent30d}
                color="emerald"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Spend Trend', ku: 'ڕەوتی خەرجی ٣٠ ڕۆژ', ar: 'مسار النفقات ٣٠ يوم' })}
                formatTooltip={(v) => formatCurrency(v)}
              />
            </div>
          </div>
        );

      case 'revenue_runway':
        return (
          <div key={kpiId} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Group Revenue Influx</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl font-extrabold text-indigo-900">
                  {formatCurrency(holding.totalRevenueUSD)}
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <ArrowUpRight className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                  <span>+12.8%</span>
                  <span className="text-slate-400 font-normal hidden sm:inline">({language === 'ku' ? 'داهات' : language === 'ar' ? 'إيراد' : 'growth'})</span>
                </div>
              </div>
              <div className="text-xs text-indigo-600 mt-2 flex items-center justify-between font-semibold">
                <span>Net Surplus: +${((holding.totalRevenueUSD - holding.totalExpensesUSD) / 1000000).toFixed(1)}M</span>
                <span className="text-[10px] text-slate-400 font-normal">Ahead of target</span>
              </div>
            </div>

            {/* Small Inline SVG Sparkline (30-Day Historical Trend) */}
            <div className="mt-2.5 pt-2 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.revenue30d}
                color="indigo"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Revenue Trend', ku: 'ڕەوتی داهاتی ٣٠ ڕۆژ', ar: 'مسار الإيرادات ٣٠ يوم' })}
                formatTooltip={(v) => formatCurrency(v)}
              />
            </div>
          </div>
        );

      case 'total_workforce':
        return (
          <div key={kpiId} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">{t('totalStaff')}</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl font-extrabold text-slate-900">
                  {totalEmployees.toLocaleString()}
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <ArrowUpRight className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                  <span>+5.2%</span>
                  <span className="text-slate-400 font-normal hidden sm:inline">({language === 'ku' ? 'زیادبوون' : language === 'ar' ? 'نمو' : 'growth'})</span>
                </div>
              </div>
              <div className="text-xs text-purple-600 mt-2 flex items-center justify-between font-semibold">
                <span>{totalForeignSpecialists} Expatriates & Specialists</span>
                <span className="text-[10px] text-slate-400 font-normal">{totalEmployees} total staff</span>
              </div>
            </div>

            {/* Small Inline SVG Sparkline (30-Day Historical Trend) */}
            <div className="mt-2.5 pt-2 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.staff30d}
                color="purple"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Staff Trend', ku: 'ڕەوتی کارمەندانی ٣٠ ڕۆژ', ar: 'مسار الكوادر ٣٠ يوم' })}
                formatTooltip={(v) => `${v} Workers`}
              />
            </div>
          </div>
        );

      case 'pending_pos':
        return (
          <div key={kpiId} className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-amber-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Awaiting Owner Approval</span>
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Crown className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl font-extrabold text-amber-900">
                  {pendingPOs.length} POs
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                  <ArrowDownRight className="w-3 h-3 text-emerald-700 stroke-[2.5]" />
                  <span>-14.0%</span>
                  <span className="text-emerald-700 font-normal hidden sm:inline">({language === 'ku' ? 'کەمبوونەوەی ڕیز' : language === 'ar' ? 'تسريع الدورة' : 'faster cycle'})</span>
                </div>
              </div>
              <div className="text-xs text-amber-700 mt-2 flex items-center justify-between font-semibold">
                <span>${pendingPOs.reduce((acc, p) => acc + p.totalAmountUSD, 0).toLocaleString()} Pending Release</span>
                <span className="text-[10px] text-amber-800/80 font-normal">Fast track</span>
              </div>
            </div>

            {/* Small Inline SVG Sparkline (30-Day Historical Trend) */}
            <div className="mt-2.5 pt-2 border-t border-amber-200/60">
              <SparklineChart
                data={sparklineData.approvals30d}
                color="amber"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Approvals Trend', ku: 'ڕەوتی چاوەڕوانی ٣٠ ڕۆژ', ar: 'مسار المعلقات ٣٠ يوم' })}
                formatTooltip={(v) => `${v} POs`}
              />
            </div>
          </div>
        );

      case 'active_projects':
        return (
          <div key={kpiId} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Group Projects</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl font-extrabold text-slate-900">
                  {filteredProjects.length} Projects
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <ArrowUpRight className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                  <span>+16.7%</span>
                  <span className="text-slate-400 font-normal hidden sm:inline">({language === 'ku' ? 'پڕۆژەی نوێ' : language === 'ar' ? 'مشاريع جديدة' : 'new'})</span>
                </div>
              </div>
              <div className="text-xs text-blue-600 mt-2 flex items-center justify-between font-semibold">
                <span>100% On-Schedule Across Sites</span>
                <span className="text-[10px] text-slate-400 font-normal">Active milestones</span>
              </div>
            </div>

            {/* Small Inline SVG Sparkline (30-Day Historical Trend) */}
            <div className="mt-2.5 pt-2 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.projects30d}
                color="blue"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Project Milestones', ku: 'ڕەوتی پڕۆژەی ٣٠ ڕۆژ', ar: 'مسار المشاريع ٣٠ يوم' })}
                formatTooltip={(v) => `${v} Projects`}
              />
            </div>
          </div>
        );

      case 'iqama_risk':
        return (
          <div key={kpiId} className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-rose-800 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Expiring Iqamas & Visas</span>
                <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl font-extrabold text-rose-900">
                  {expiringIqamas.length} Workers
                </div>
                {expiringIqamas.length > 0 ? (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                    <ArrowUpRight className="w-3 h-3 text-rose-600 stroke-[2.5]" />
                    <span>+20.0%</span>
                    <span className="text-rose-700 font-normal hidden sm:inline">({language === 'ku' ? 'هۆشداری نوێکردنەوە' : language === 'ar' ? 'تنبيه إقامات' : 'alert'})</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                    <ArrowDownRight className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                    <span>-33.3%</span>
                    <span className="text-emerald-700 font-normal hidden sm:inline">({language === 'ku' ? 'چارەسەرکرا' : language === 'ar' ? 'تم التجديد' : 'resolved'})</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-rose-700 mt-2 flex items-center justify-between font-semibold">
                <span>{expiringIqamas.length > 0 ? 'Action Required to avoid fines' : 'All residency permits compliant'}</span>
                <span className="text-[10px] text-rose-800/80 font-normal">HSE & Legal</span>
              </div>
            </div>

            {/* Small Inline SVG Sparkline (30-Day Historical Trend) */}
            <div className="mt-2.5 pt-2 border-t border-rose-200/60">
              <SparklineChart
                data={sparklineData.iqamaRisk30d}
                color="rose"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Iqama Alert Trend', ku: 'ڕەوتی مەترسی ئیقامە', ar: 'مسار الإقامات ٣٠ يوم' })}
                formatTooltip={(v) => `${v} Expiring`}
              />
            </div>
          </div>
        );

      case 'gate_deliveries':
        return (
          <div key={kpiId} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Gate Deliveries Scanned</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <ScanLine className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-2xl font-extrabold text-slate-900">
                  {gateLogs.length} Trucks
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <ArrowUpRight className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                  <span>+9.4%</span>
                  <span className="text-slate-400 font-normal hidden sm:inline">({language === 'ku' ? 'هاتووچۆ' : language === 'ar' ? 'تدفق الشاحنات' : 'flow'})</span>
                </div>
              </div>
              <div className="text-xs text-emerald-600 mt-2 flex items-center justify-between font-semibold">
                <span>Triple-notified & synced</span>
                <span className="text-[10px] text-slate-400 font-normal">Zero unauthorized</span>
              </div>
            </div>

            {/* Small Inline SVG Sparkline (30-Day Historical Trend) */}
            <div className="mt-2.5 pt-2 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.gateLogs30d}
                color="emerald"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Gate Logistics', ku: 'ڕەوتی بارهەڵگر (٣٠ ڕۆژ)', ar: 'مسار الشاحنات ٣٠ يوم' })}
                formatTooltip={(v) => `${v} Trucks`}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // RBAC Boundary: Top Management (سەرەوە) vs Subordinates (خوارەوە)
  const isTopManagement = currentUser.role === 'HOLDING_OWNER' || currentUser.role === 'SUPER_ADMIN';

  if (!isTopManagement) {
    return <BranchProjectOperationalPortal />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner: Holding Owner Executive Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 border border-indigo-500/20 p-6 sm:p-8 shadow-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        {/* Tier 1: Executive Brand & Symmetrical Live Macro Statuses */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Holding Custom Logo or Platform Emblem */}
            {holding.logoUrl ? (
              <img
                src={holding.logoUrl}
                alt={holding.name || 'Holding Logo'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-white/10 p-1.5 border border-white/20 shadow-lg shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 via-blue-500/20 to-indigo-600/30 border border-white/20 flex flex-col items-center justify-center text-amber-300 shadow-lg shrink-0 backdrop-blur-md">
                <Crown className="w-7 h-7 text-amber-400" />
                <span className="text-[9px] font-black tracking-wider text-slate-200 mt-0.5">SAS ERP</span>
              </div>
            )}

            <div>
              {/* System Identifier & Owner Identity Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold font-mono">
                  <span>⚡</span>
                  <span>{getUIText(language, { en: 'SAS ERP System', ku: 'سیستەمی SAS ERP', ar: 'نظام SAS ERP' })}</span>
                </span>

                <button
                  onClick={() => setIsHoldingSetupOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer"
                  title={getUIText(language, { en: 'Click to configure holding and owner identity', ku: 'کلیک بکە بۆ گۆڕینی ناوی خاوەنی هۆلدینگ', ar: 'انقر لضبط هوية المالك والهولدينغ' })}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('holdingOwner')}:</span>
                  <span className="text-white font-extrabold underline decoration-amber-400 decoration-dotted underline-offset-2">
                    {holding.chairmanName ? holding.chairmanName : t('setOwnerNamePrompt')}
                  </span>
                  <Edit3 className="w-3 h-3 text-amber-300" />
                </button>
              </div>

              {/* Holding Name Title */}
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {resolveEntityText(holding, 'name', language) || (
                    <span className="text-indigo-200 italic font-semibold">
                      {t('setHoldingNamePrompt')}
                    </span>
                  )}
                </h1>
                <button
                  onClick={() => setIsHoldingSetupOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 border border-white/20 text-xs font-bold transition cursor-pointer backdrop-blur-md"
                  title={getUIText(language, { en: 'Edit holding name & logo', ku: 'دەستکاریکردنی ناوی هۆلدینگ و لۆگۆ', ar: 'تعديل اسم وشعار الهولدينغ' })}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{getUIText(language, { en: 'Edit Identity', ku: 'دەستکاری ناو و لۆگۆ', ar: 'تعديل الهوية' })}</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                <span className="font-bold text-amber-300">
                  {getUIText(language, { en: 'SAS ERP: ', ku: 'سیستەمی SAS: ', ar: 'منصة SAS: ' })}
                </span>
                {t('tagline')} — {getUIText(language, {
                  en: 'Central executive governance, subsidiary oversight, threshold approvals, and high-level communications.',
                  ku: 'چاودێری ناوەندی بەڕێوەبردن، دابەشکاریی بودجەی کەرتی، پەسەندکردنی خاوەنی هۆلدینگ، و پەیوەندی بەڕێوەبەرانی گشتی.',
                  ar: 'الرقابة المركزية للمجموعة، إدارة ميزانيات الشركات، موافقات الرئاسة، والتواصل المباشر.'
                })}
              </p>
            </div>
          </div>

          {/* Symmetrical Executive Macro Badges on Trailing Side */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5 backdrop-blur-md flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{getUIText(language, { en: 'Subsidiaries', ku: 'کۆمپانیاکان', ar: 'الشركات' })}</span>
                <span className="font-mono text-sm font-black text-white">{filteredCompanies.length} Active</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5 backdrop-blur-md flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">{getUIText(language, { en: 'Awaiting Sign', ku: 'چاوەڕوانی واژۆ', ar: 'بانتظار توقيع' })}</span>
                <span className="font-mono text-sm font-black text-amber-400">{pendingPOs.length} POs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier 2: Symmetrical Full-Width Action Deck */}
        <div className="relative z-10 mt-6 pt-5 border-t border-indigo-900/60 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <button
            onClick={() => setIsHoldingSetupOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition transform active:scale-95 cursor-pointer text-center"
            id="dashboard-holding-identity-btn"
            title={getUIText(language, { en: 'Setup Holding Name, Logo & Owner', ku: 'ڕێکخستنی ناوی هۆلدینگ، لۆگۆ و خاوەن', ar: 'ضبط اسم وشعار ومالك الهولدينغ' })}
          >
            <Crown className="w-4 h-4 text-slate-950 shrink-0" />
            <span className="truncate">{getUIText(language, { en: 'Holding Identity', ku: 'ناوی هۆلدینگ و خاوەن', ar: 'هوية الهولدينغ' })}</span>
          </button>

          <button
            onClick={() => setIsSignatureModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm transition transform active:scale-95 cursor-pointer text-center"
            id="dashboard-e-signature-btn"
            title={getUIText(language, { en: 'Electronic Signature Studio & Official Seal', ku: 'ستۆدیۆی واژۆی ئەلیکترۆنی و مۆری فەرمی', ar: 'استوديو التوقيع الإلكتروني والختم' })}
          >
            <PenTool className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">{getUIText(language, { en: 'E-Signature Studio', ku: 'واژۆی ئەلیکترۆنی', ar: 'التوقيع الإلكتروني' })}</span>
          </button>

          <button
            onClick={() => setIsPrinterModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-sm transition transform active:scale-95 cursor-pointer text-center"
            id="dashboard-printer-station-btn"
            title={getUIText(language, { en: 'Hardware Printer Station & Output Settings', ku: 'بەستنەوە بە پرینتەر و ڕێکخستنی چاپ', ar: 'محطة الطباعة المادية' })}
          >
            <Printer className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">{getUIText(language, { en: 'Printer Station', ku: 'بەستنەوە بە پرینتەر', ar: 'محطة الطباعة' })}</span>
          </button>

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm transition transform active:scale-95 cursor-pointer backdrop-blur-md text-center"
            id="dashboard-customize-btn"
            title={t('customizeDashboard')}
          >
            <Sliders className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">{t('customizeDashboard')}</span>
          </button>

          <button
            onClick={() => setIsMeetingModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition transform active:scale-95 cursor-pointer text-center"
            id="dashboard-start-meeting-btn"
          >
            <Video className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('startInstantMeeting')}</span>
          </button>

          <button
            onClick={() => setIsGateScannerOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition transform active:scale-95 cursor-pointer text-center"
            id="dashboard-gate-scanner-btn"
          >
            <ScanLine className="w-4 h-4 animate-pulse shrink-0" />
            <span className="truncate">{t('scanReceiptBtn')}</span>
          </button>

          <button
            onClick={() => setIsMeshHubOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition transform active:scale-95 cursor-pointer text-center"
            id="dashboard-mesh-hub-btn"
            title={getUIText(language, { en: 'Offline local mesh sync', ku: 'تۆڕی خۆجێیی میش بۆ کاتی نەبوونی ئینتەرنێت', ar: 'شبكة المش المحلية عند انقطاع الإنترنت' })}
          >
            <Radio className="w-4 h-4 animate-pulse shrink-0" />
            <span className="truncate">{t('localMeshNetwork')}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 shadow-sm transition transform active:scale-95 cursor-pointer text-center"
            id="dashboard-export-pdf-btn"
            title={getUIText(language, { en: 'Export and print dashboard report as PDF', ku: 'داگرتن و پرینتکردنی گشتگیری پێوەرەکان بە PDF', ar: 'تصدير وطباعة التقرير بصيغة PDF' })}
          >
            <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{getUIText(language, { en: 'Export PDF', ku: 'داگرتنی PDF', ar: 'تصدير PDF' })}</span>
          </button>

          {/* User Roles & Permissions Button (Exclusive for Holding Owner & Admins) */}
          {(currentUser.role === 'HOLDING_OWNER' || currentUser.role === 'SUPER_ADMIN') && (
            <button
              onClick={() => setIsUserRolesModalOpen(true)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition transform active:scale-95 cursor-pointer text-center"
              id="dashboard-user-roles-btn"
              title={getUIText(language, {
                en: 'User Roles & Access Permissions Management (RBAC)',
                ku: 'بەڕێوەبردنی ڕۆڵی بەکارهێنەران و دەسەڵاتەکان',
                ar: 'إدارة أدوار المستخدمين وصلاحيات الوصول'
              })}
            >
              <Users className="w-4 h-4 text-purple-200 shrink-0" />
              <span className="truncate">{getUIText(language, { en: 'Roles & RBAC', ku: 'ڕۆڵ و دەسەڵاتەکان', ar: 'الأدوار والصلاحيات' })}</span>
            </button>
          )}

          {/* Trilingual User Manual & Word <-> PDF Converter Button */}
          <button
            onClick={() => setIsUserManualOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white shadow-md transition transform active:scale-95 cursor-pointer text-center"
            id="dashboard-user-manual-btn"
            title={getUIText(language, {
              en: 'Comprehensive User Manual & Two-Way Word ⇄ PDF Converter',
              ku: 'ڕێبەری گشتگیر و گۆڕەری دوولایەنەی وۆرد ⇄ پی دی ئێف',
              ar: 'دليل الاستخدام الشامل ومحوّل المستندات المزدوج Word ⇄ PDF'
            })}
          >
            <BookOpen className="w-4 h-4 text-blue-200 shrink-0" />
            <span className="truncate">{getUIText(language, { en: 'Manual & Converter (Word ⇄ PDF)', ku: 'ڕێبەر و گۆڕەر (Word ⇄ PDF)', ar: 'الدليل والمحوّل (Word ⇄ PDF)' })}</span>
          </button>
        </div>

        {/* Holding Owner Rule Highlight Banner */}
        <div className="mt-6 pt-4 border-t border-indigo-900/60 flex items-center justify-between text-xs text-amber-200/90 font-medium">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t('holdingOwnerRuleBanner')}</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
            {holding.legalRegistration || 'REG-SAS-2026'}
          </span>
        </div>
      </div>

      {/* Enterprise System Modules Directory (سەرجەم بەشە سەرەکییەکان لەژێر دەستی خاوەن و بە تایبەت بۆ دیتنی مۆبایل) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span>{language === 'ku' ? 'بەشەکانی سیستەم (مۆدیوڵە کارگێڕی و مەیدانییەکان)' : language === 'ar' ? 'أقسام النظام الشاملة' : 'Enterprise Modules Directory'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold font-mono">
                  All Modules
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'ku'
                  ? 'دەستگەیشتنی خێرا بە سەرجەم بەشەکان بۆ هەردوو دیتنی مۆبایل و کۆمپیوتەر'
                  : 'Instant one-tap navigation to every system module across mobile and desktop.'}
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            {visibleModuleCards.length} {language === 'ku' ? 'بەشی ڕێگەپێدراو بۆ ئەم ڕۆڵە' : 'Accessible Modules'}
          </span>
        </div>

        {/* Responsive Grid for Filtered System Sections */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {visibleModuleCards.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={m.onClick}
                id={`dashboard-nav-${m.id}`}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/80 hover:border-indigo-300 text-left transition flex flex-col justify-between group cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-bold border border-slate-300 font-mono">
                    {m.badge}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-indigo-700">
                    {m.title}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {m.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Welcome Card if Holding Name or Owner Name Not Configured */}
      {(!holding.name || !holding.chairmanName) && (
        <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-purple-500/10 border border-amber-400/40 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{getUIText(language, { en: 'Welcome to SAS ERP Platform', ku: 'بەخێربێن بۆ سیستەمی SAS', ar: 'مرحباً بكم في نظام SAS ERP' })}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                  {getUIText(language, { en: 'Identity Setup Required', ku: 'پێویستی بە نووسینی ناوە', ar: 'مطلوب ضبط الهوية' })}
                </span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {getUIText(language, {
                  en: 'SAS ERP is the enterprise management platform. Every holding can personalize their official holding name, upload their custom logo, and register the Chairman name for all official reports and stamps.',
                  ku: 'سیستەمی SAS ناوی پلاتفۆرمەکەیە. هەموو هۆلدینگێک دەتوانێت ناوی فەرمی هۆلدینگ، لۆگۆ، و ناوی بەڕێز خاوەنی هۆلدینگ دابنێن بۆ ئەوەی لە سەرجەم راپۆرتەکان و مۆرە فەرمییەکاندا دەربکەوێت.',
                  ar: 'نظام SAS هو المحرك الأساسي. يمكن لكل مجموعة قابضة تخصيص اسمها الرسمي وشعارها واسم المالك ليظهر في كافة التقارير والوثائق الرسمية.'
                })}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHoldingSetupOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition shrink-0 flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>{getUIText(language, { en: 'Set Holding & Owner Identity', ku: 'نووسینی ناوی هۆلدینگ و خاوەن', ar: 'ضبط اسم الهولدينغ والمالك' })}</span>
          </button>
        </div>
      )}

      {/* Interactive Controls & Filters Strip */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Executive Focus Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
            {t('executiveFocus')}:
          </span>
          <button
            type="button"
            onClick={() => handlePresetSelect('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              settings.preset === 'ALL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {t('presetAll')}
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('FINANCE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              settings.preset === 'FINANCE'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {t('presetFinance')}
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('PROJECTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              settings.preset === 'PROJECTS'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {t('presetProjects')}
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('RISK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              settings.preset === 'RISK'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {t('presetRisk')}
          </button>
        </div>

        {/* Subsidiary Scope Filter & Currency Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={settings.selectedCompanyFilter}
              onChange={(e) => setSettings(prev => ({ ...prev, selectedCompanyFilter: e.target.value }))}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">
                {getUIText(language, {
                  en: `All Holding Companies (${companies.length})`,
                  ku: `سەرجەم کۆمپانیاکانی هۆلدینگ (${companies.length})`,
                  ar: `كافة شركات المجموعة (${companies.length})`
                })}
              </option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} — {resolveEntityText(c, 'name', language)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, currencyDisplay: 'USD' }))}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                settings.currencyDisplay === 'USD' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              $ USD
            </button>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, currencyDisplay: 'IQD' }))}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                settings.currencyDisplay === 'IQD' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              IQD
            </button>
          </div>
        </div>

      </div>

      {/* ML Sentinel Anomaly Alert Banner (Procurement, Financial, Attendance) */}
      {criticalMlAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-400 rounded-3xl p-4 sm:p-5 shadow-lg text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
              <BrainCircuit className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 font-black uppercase tracking-wider">
                  {t('mlSentinelAlert')}
                </span>
                <span className="text-xs font-mono font-bold text-rose-300">
                  {criticalMlAlerts.length} {getUIText(language, { en: 'Critical Risks Detected', ku: 'مەترسی نائاسایی دەستنیشانکراو', ar: 'مخاطر شذوذ محددة' })}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white mt-1">
                {t('mlAlertUrgentTitle')}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
                {t('mlAlertUrgentDesc')}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {criticalMlAlerts.map(ca => (
                  <span key={ca.id} className="text-[11px] font-bold bg-slate-800 text-purple-200 px-2.5 py-1 rounded-lg border border-purple-500/40 shadow-2xs">
                    {resolveEntityText(ca, 'title', language)} (Score: {ca.score})
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('ml-anomaly-detection')}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-500 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{t('inspectRisks')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top-Level KPI Summary Card Row Complementing Recharts Visualizations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Projects */}
        <div
          onClick={() => setActiveTab('companies-projects')}
          className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-3xl p-5 shadow-xs transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('totalProjectsKPI')}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                <FolderKanban className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {filteredProjects.length}
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span>+14.3%</span>
                <span className="text-[10px] text-emerald-600/80 font-normal">({language === 'ku' ? 'vs پێشوو' : language === 'ar' ? 'vs السابق' : 'vs prev'})</span>
              </div>
            </div>
            <div className="text-xs text-blue-600 mt-2 font-bold flex items-center gap-1">
              <span>{filteredCompanies.length} {t('subsidiaryCompanies')}</span>
            </div>

            {/* Small Inline SVG Sparkline (30-Day Historical Trend) */}
            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.projects30d}
                color="blue"
                height={34}
                trendLabel={getUIText(language, { en: '30-Day Project Trend', ku: 'ڕەوتی ٣٠ ڕۆژ', ar: 'مسار ٣٠ يوم' })}
                formatTooltip={(v) => `${v} ${getUIText(language, { en: 'Projects', ku: 'پڕۆژە', ar: 'مشاريع' })}`}
              />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>{t('underDirectSupervision')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-[-2px] transition" />
          </div>
        </div>

        {/* Card 2: Active Budget Utilization (With 90% Threshold Warning) */}
        <div className={`rounded-3xl p-5 shadow-xs transition flex flex-col justify-between border ${
          highBurnProjects.length > 0 
            ? 'bg-rose-50/40 border-rose-300 shadow-rose-500/10' 
            : 'bg-white border-slate-200/90'
        }`}>
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('budgetUtilizationKPI')}
              </span>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                highBurnProjects.length > 0
                  ? 'bg-rose-100 text-rose-600 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}>
                {highBurnProjects.length > 0 ? (
                  <TrendingUp className="w-5 h-5 text-rose-600" />
                ) : (
                  <TrendingUp className="w-5 h-5" />
                )}
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <div className={`text-2xl sm:text-3xl font-black font-mono ${
                  Number(activeBudgetUtilizationRate) >= 90 ? 'text-rose-600' : 'text-slate-900'
                }`}>
                  {activeBudgetUtilizationRate}%
                </div>
                {highBurnProjects.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                    {t('thresholdWarning90')}
                  </span>
                )}
              </div>
              <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                Number(activeBudgetUtilizationRate) >= 90
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
              }`}>
                {Number(activeBudgetUtilizationRate) >= 90 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                )}
                <span>{Number(activeBudgetUtilizationRate) >= 90 ? '+5.4%' : '+2.8%'}</span>
                <span className="text-[10px] opacity-75 font-normal">({language === 'ku' ? 'مانگانە' : language === 'ar' ? 'شهري' : 'MoM'})</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-2 font-mono">
              {t('spentOf')} {formatCurrency(totalProjectSpent || totalHoldingSpent)} / {formatCurrency(totalProjectBudget || totalHoldingBudget)}
            </div>

            {/* Small Inline SVG Sparkline (30-Day Historical Trend) */}
            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.utilization30d}
                color={Number(activeBudgetUtilizationRate) >= 90 ? 'rose' : 'emerald'}
                height={34}
                trendLabel={getUIText(language, { en: '30-Day Burn Trajectory', ku: 'ڕەوتی سوودوەرگرتن (٣٠ ڕۆژ)', ar: 'مسار الاستهلاك (٣٠ يوم)' })}
                formatTooltip={(v) => `${v}%`}
              />
            </div>
          </div>
          
          <div className="pt-3 border-t border-slate-100 mt-2 space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/70">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  Number(activeBudgetUtilizationRate) >= 90 
                    ? 'bg-rose-500' 
                    : Number(activeBudgetUtilizationRate) >= 75 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Number(activeBudgetUtilizationRate))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{getUIText(language, { en: 'Burn Rate', ku: 'ڕێژەی خەرجکردن', ar: 'نسبة الصرف' })}</span>
              <span>{100 - Number(activeBudgetUtilizationRate) > 0 ? `${(100 - Number(activeBudgetUtilizationRate)).toFixed(1)}% ${t('remainingBudget')}` : t('budgetDepleted')}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Approval Count */}
        <div
          onClick={() => setActiveTab('owner-approvals')}
          className="bg-white border border-amber-300 hover:border-amber-400 rounded-3xl p-5 shadow-xs transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                {t('pendingApprovalsKPI')}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition">
                <Crown className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-black text-amber-950 font-mono">
                {pendingPOs.length} {getUIText(language, { en: 'POs', ku: 'داواکاری', ar: 'طلبات' })}
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span>-18.2%</span>
                <span className="text-[10px] text-emerald-600/80 font-normal">({language === 'ku' ? 'خێرایی کار' : language === 'ar' ? 'تسريع الدورة' : 'cleared'})</span>
              </div>
            </div>
            <div className="text-xs text-amber-700 mt-2 font-bold font-mono">
              ${pendingPOs.reduce((acc, p) => acc + p.totalAmountUSD, 0).toLocaleString()} USD {getUIText(language, { en: 'Pending Value', ku: 'بەهای چاوەڕوانکراو', ar: 'قيمة معلقة' })}
            </div>

            {/* Small Inline SVG Sparkline (30-Day Historical Trend) */}
            <div className="mt-3 pt-2.5 border-t border-amber-100">
              <SparklineChart
                data={sparklineData.approvals30d}
                color="amber"
                height={34}
                trendLabel={getUIText(language, { en: '30-Day Approvals Trend', ku: 'ڕەوتی چاوەڕوانی (٣٠ ڕۆژ)', ar: 'مسار المعلقات (٣٠ يوم)' })}
                formatTooltip={(v) => `${v} ${getUIText(language, { en: 'POs', ku: 'داواکاری', ar: 'طلبات' })}`}
              />
            </div>
          </div>
          <div className="pt-3 border-t border-amber-100 mt-2 flex items-center justify-between text-[11px] text-amber-800 font-bold">
            <span>{t('directOwnerAuthority')}</span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 group-hover:bg-amber-200 transition">
              {t('approveAction')}
            </span>
          </div>
        </div>

        {/* Card 4: Threshold Health & Risk Monitoring */}
        <div className={`rounded-3xl p-5 shadow-xs transition flex flex-col justify-between border ${
          highBurnProjects.length > 0 
            ? 'bg-rose-50/70 border-rose-300' 
            : 'bg-emerald-50/50 border-emerald-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {t('thresholdHealthKPI')}
              </span>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                highBurnProjects.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-xl sm:text-2xl font-black font-mono">
                {highBurnProjects.length > 0 ? (
                  <span className="text-rose-700">{highBurnProjects.length} {t('atRisk')}</span>
                ) : (
                  <span className="text-emerald-700">{t('optimalHealth')}</span>
                )}
              </div>
              {highBurnProjects.length > 0 ? (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                  <span>+{highBurnProjects.length} {getUIText(language, { en: 'Risk Alert', ku: 'مەترسی', ar: 'تنبيه خطر' })}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>-100% {getUIText(language, { en: 'Risk Free', ku: 'پارێزراو', ar: 'آمن' })}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {highBurnProjects.length > 0 
                ? t('projectsRequiringIntervention')
                : t('allProjectsUnderThreshold')}
            </p>

            {/* Small Inline SVG Sparkline (30-Day Historical Trend) */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/60">
              <SparklineChart
                data={sparklineData.risk30d}
                color={highBurnProjects.length > 0 ? 'rose' : 'emerald'}
                height={34}
                trendLabel={getUIText(language, { en: '30-Day Risk Sentinel', ku: 'دۆخی مەترسی (٣٠ ڕۆژ)', ar: 'مسار المخاطر (٣٠ يوم)' })}
                formatTooltip={(v) => v > 0 ? `${v} ${getUIText(language, { en: 'High Burn Alert', ku: 'هۆشداری خەرجی بەرز', ar: 'تنبيه استهلاك عالي' })}` : getUIText(language, { en: 'Optimal Safe (0)', ku: 'تەواو سەقامگیر (٠)', ar: 'مثالي وآمن (٠)' })}
              />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200/60 mt-2 flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-600">{getUIText(language, { en: 'Waste Prevention:', ku: 'ڕێگری لە بەفیڕۆدان:', ar: 'منع الهدر المالي:' })}</span>
            <span className={`font-bold font-mono px-2 py-0.5 rounded ${
              highBurnProjects.length > 0 ? 'bg-rose-200/80 text-rose-900' : 'bg-emerald-200/80 text-emerald-900'
            }`}>
              {highBurnProjects.length > 0 ? getUIText(language, { en: 'ACTIVE ALERT', ku: 'هۆشداری چالاک', ar: 'تنبيه نشط' }) : getUIText(language, { en: 'SECURE', ku: 'پارێزراو', ar: 'آمن' })}
            </span>
          </div>
        </div>

      </div>

      {/* Balanced Executive Layout Blocks */}
      {(() => {
        const fullWidthSet = new Set<WidgetId>([
          'macro_kpis',
          'kpi_overview',
          'project_expenditure_chart',
          'departmental_operations'
        ]);

        const renderSingleWidget = (widgetId: WidgetId) => {
          switch (widgetId) {
            case 'macro_kpis':
              return (
                <div key="macro_kpis" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  {settings.selectedMacroKpis.map(kpiId => renderMacroKpiCard(kpiId))}
                </div>
              );

            case 'kpi_overview':
              return (
                <KpiOverviewWidget
                  key="kpi_overview"
                  currencyDisplay={settings.currencyDisplay}
                  selectedCompanyFilter={settings.selectedCompanyFilter}
                />
              );

            case 'ml_anomaly_monitor':
              return (
                <MLAnomalyMonitorWidget
                  key="ml_anomaly_monitor"
                />
              );

            case 'project_expenditure_chart':
              return (
                <ProjectExpenditureBudgetRechartsDashboard
                  key="project_expenditure_chart"
                  currencyDisplay={settings.currencyDisplay}
                  selectedCompanyFilter={settings.selectedCompanyFilter}
                />
              );

            case 'general_managers':
              return (
                <GeneralManagersWidget
                  key="general_managers"
                />
              );

            case 'pending_approvals':
              return (
                <div key="pending_approvals" className="bg-white border border-amber-300 rounded-3xl p-6 shadow-xs relative overflow-hidden h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 font-bold shrink-0">
                          <Crown className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900">
                            {t('pendingOwnerApproval')} ({pendingPOs.length})
                          </h2>
                          <p className="text-xs text-slate-500">
                            {t('holdingOwnerRuleBanner')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('owner-approvals')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>{getUIText(language, { en: 'View Queue', ku: 'بینینی تەواوی ڕیز', ar: 'عرض القائمة' })}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {pendingPOs.length === 0 ? (
                      <div className="p-6 text-center rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800 font-bold space-y-1">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                        <div>
                          {getUIText(language, {
                            en: 'All clear: No pending purchase orders awaiting Owner signature.',
                            ku: 'تەواوی داواکارییەکان سەقامگیرن: هیچ داواکارییەکی کڕین لە چاوەڕوانیدا نەماوەتەوە.',
                            ar: 'لا توجد طلبات شراء معلقة تتطلب توقيع المالك.'
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingPOs.slice(0, 3).map((po) => {
                          const comp = companies.find(c => c.id === po.companyId);
                          return (
                            <div
                              key={po.id}
                              className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 text-xs sm:text-sm font-mono">{po.poNumber}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold truncate max-w-[140px]">
                                    {comp ? resolveEntityText(comp, 'name', language) : 'Holding Subsidiary'}
                                  </span>
                                  <span className="text-xs font-extrabold text-emerald-600 font-mono">
                                    ${po.totalAmountUSD.toLocaleString()} {po.currency}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 truncate">
                                  <strong>{getUIText(language, { en: 'Supplier:', ku: 'دابینکەر:', ar: 'المورّد:' })}</strong> {po.supplierName} • <strong>{getUIText(language, { en: 'By:', ku: 'لەلایەن:', ar: 'بواسطة:' })}</strong> {po.requestedBy}
                                </p>
                                <p className="text-[11px] text-slate-500 italic truncate">
                                  "{po.purpose}"
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => approvePurchaseByOwner(po.id, 'Holding Owner Approved directly from dashboard')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition transform active:scale-95 cursor-pointer"
                                  id={`owner-quick-approve-${po.id}`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{t('approvePurchase')}</span>
                                </button>
                                <button
                                  onClick={() => rejectPurchaseByOwner(po.id, 'Holding Owner rejected: Budget limit exceeded')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition transform active:scale-95 cursor-pointer"
                                  id={`owner-quick-reject-${po.id}`}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>{t('rejectPurchase')}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{getUIText(language, { en: 'Threshold Gate: $5,000+ USD', ku: 'سنووری پەسەندکردن: سەروو $٥,٠٠٠ دۆلار', ar: 'حد الموافقة: أكثر من 5000 دولار' })}</span>
                    <span className="font-mono text-amber-700 font-bold">${pendingPOs.reduce((acc, p) => acc + p.totalAmountUSD, 0).toLocaleString()} Total</span>
                  </div>
                </div>
              );

            case 'financial_summary':
              return (
                <HoldingFinancialSummaryWidget
                  key="financial_summary"
                  currencyDisplay={settings.currencyDisplay}
                  selectedCompanyFilter={settings.selectedCompanyFilter}
                />
              );

            case 'projects_radar':
              return (
                <GroupProjectsRadarWidget
                  key="projects_radar"
                  selectedCompanyFilter={settings.selectedCompanyFilter}
                />
              );

            case 'subsidiary_matrix':
              return (
                <SubsidiaryEfficiencyWidget
                  key="subsidiary_matrix"
                />
              );

            case 'departmental_operations':
              return (
                <DepartmentOperationsMatrixWidget
                  key="departmental_operations"
                />
              );

            case 'recent_activities':
              return (
                <LiveActivityFeedWidget
                  key="recent_activities"
                />
              );

            case 'directors_directory':
              return (
                <div key="directors_directory" className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-blue-600" />
                          <span>{t('navContactManagers')}</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {getUIText(language, {
                            en: 'Direct hotlines and high-priority holding directive dispatch to all Subsidiary GMs.',
                            ku: 'هێڵی ڕاستەوخۆ و ناردنی ڕاسپاردەی خێرای سەرۆکایەتی هۆلدینگ بۆ بەڕێوەبەرانی گشتی.',
                            ar: 'خط مباشر وتوجيهات عليا فورية لكافة المدراء العامين للشركات التابعة.'
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('direct-comms')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>{getUIText(language, { en: 'Comms Hub', ku: 'ناوەندی پەیوەندی', ar: 'مركز الاتصالات' })}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredCompanies.slice(0, 4).map((comp) => (
                        <div
                          key={comp.id}
                          className="bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-2xl p-3 flex flex-col justify-between transition group shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-2xs font-mono">
                                {comp.code}
                              </span>
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{comp.generalManager}</h3>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{resolveEntityText(comp, 'name', language)}</p>
                            <p className="text-[11px] text-blue-600 font-mono mt-1 font-semibold">{comp.gmPhone}</p>
                          </div>

                          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-200">
                            <button
                              onClick={() => startCallWithManager({
                                name: comp.generalManager,
                                role: 'General Manager',
                                phone: comp.gmPhone,
                                company: resolveEntityText(comp, 'name', language),
                                avatar: '👔'
                              })}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 transition cursor-pointer"
                              title={getUIText(language, { en: 'Call GM', ku: 'پەیوەندی بەڕێوەبەر', ar: 'اتصال بالمدير' })}
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>{getUIText(language, { en: 'Call GM', ku: 'پەیوەندی', ar: 'اتصال' })}</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCompanyId(comp.id);
                                setActiveTab('companies-projects');
                              }}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
                              title={getUIText(language, { en: 'View Subsidiary', ku: 'بینینی کۆمپانیا', ar: 'عرض الشركة' })}
                            >
                              <Building2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );

            case 'risk_compliance':
              return (
                <RiskComplianceWidget
                  key="risk_compliance"
                />
              );

            default:
              return null;
          }
        };

        // Group into balanced blocks
        const blocks: { type: 'full' | 'pair'; widgets: WidgetId[] }[] = [];
        const activeWidgets = settings.widgetOrder.filter(wId => settings.visibleWidgets.includes(wId));
        let currentPair: WidgetId[] = [];

        for (const wId of activeWidgets) {
          if (fullWidthSet.has(wId)) {
            if (currentPair.length > 0) {
              blocks.push({ type: 'pair', widgets: [...currentPair] });
              currentPair = [];
            }
            blocks.push({ type: 'full', widgets: [wId] });
          } else {
            currentPair.push(wId);
            if (currentPair.length === 2) {
              blocks.push({ type: 'pair', widgets: [...currentPair] });
              currentPair = [];
            }
          }
        }
        if (currentPair.length > 0) {
          blocks.push({ type: 'pair', widgets: [...currentPair] });
        }

        return blocks.map((block, idx) => {
          if (block.type === 'full') {
            return (
              <div key={`full-block-${block.widgets[0]}-${idx}`} className="w-full">
                {renderSingleWidget(block.widgets[0])}
              </div>
            );
          }

          return (
            <div
              key={`pair-block-${block.widgets.join('-')}-${idx}`}
              className={`grid gap-6 items-stretch ${
                block.widgets.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
              }`}
            >
              {block.widgets.map((wId) => (
                <div key={wId} className="h-full flex flex-col">
                  {renderSingleWidget(wId)}
                </div>
              ))}
            </div>
          );
        });
      })()}

      {/* Dashboard Configuration Modal */}
      <DashboardConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Floating Executive Sticky Note Widget (Session Draft Reminders) */}
      <ExecutiveStickyNoteWidget />

      {/* Holding Local Mesh & Offline Sync Hub Modal */}
      <HoldingMeshSyncHubModal
        isOpen={isMeshHubOpen}
        onClose={() => setIsMeshHubOpen(false)}
      />

    </div>
  );
};
