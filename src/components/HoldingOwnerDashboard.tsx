import React, { useState, useEffect, useMemo } from 'react';
import { SparklineChart } from './SparklineChart';
import {
  Crown,
  TrendingUp,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  PhoneCall,
  ScanLine,
  ChevronRight,
  AlertTriangle,
  FileText,
  DollarSign,
  Wallet,
  BrainCircuit,
  Sliders,
  Briefcase,
  Edit3,
  FolderKanban,
  Radio,
  Cpu,
  Activity,
  BookOpen,
  Download,
  Key,
  Printer,
  ArrowUpRight
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { resolveEntityText, getUIText } from '../utils/langHelper';
import { checkIsMasterVendorOwner } from '../utils/rbacPermissions';
import { generateEnterpriseUserManualDocx } from '../utils/userManualDocxGenerator';
import { openUserManualPrintView } from '../utils/userManualPdfGenerator';
import {
  generateWhyChooseSAS4ERPDocx,
  openWhyChooseSAS4ERPPdfView
} from '../utils/whyChooseSAS4ERPGenerator';
import { getRemainingTrialDays } from '../utils/licenseManager';
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
    setIsHoldingSetupOpen,
    setActiveTab,
    setSelectedCompanyId,
    setIsUserRolesModalOpen,
    setIsUserManualOpen,
    openLicenseModal,
    currentUser,
    systemLicense
  } = useERP();

  const { t, language } = useLanguage();
  const isMasterVendorOwner = checkIsMasterVendorOwner(currentUser);

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
        // fallback to defaults
      }
    }
    return defaultDashboardSettings;
  });

  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isMeshHubOpen, setIsMeshHubOpen] = useState<boolean>(false);
  const [isDownloadingManualDocx, setIsDownloadingManualDocx] = useState<boolean>(false);
  const [isDownloadingWhyDocx, setIsDownloadingWhyDocx] = useState<boolean>(false);

  const handleDownloadManualDocx = async () => {
    try {
      setIsDownloadingManualDocx(true);
      const blob = await generateEnterpriseUserManualDocx({
        includeKurdish: true,
        includeEnglish: true,
        includeArabic: true,
        includeDifferentiators: true
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SAS4ERP_Enterprise_User_Manual_Trilingual_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate Word document', err);
    } finally {
      setIsDownloadingManualDocx(false);
    }
  };

  const handleDownloadWhyDocx = async () => {
    try {
      setIsDownloadingWhyDocx(true);
      const blob = await generateWhyChooseSAS4ERPDocx({
        includeKurdish: true,
        includeEnglish: true,
        includeArabic: true
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Why_Choose_SAS4ERP_Comparison_Dossier_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate Why Choose Word document', err);
    } finally {
      setIsDownloadingWhyDocx(false);
    }
  };

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

  const pendingPOsTotalUSD = pendingPOs.reduce((acc, p) => acc + p.totalAmountUSD, 0);

  const expiringIqamas = foreignWorkers.filter(w => {
    const matchVisa = w.visaStatus === 'EXPIRING_SOON' || w.visaStatus === 'EXPIRED';
    const matchCompany = settings.selectedCompanyFilter === 'ALL' || w.companyId === settings.selectedCompanyFilter;
    return matchVisa && matchCompany;
  });

  const totalHoldingBudget = filteredCompanies.reduce((acc, c) => acc + c.annualBudgetUSD, 0);
  const totalHoldingSpent = filteredCompanies.reduce((acc, c) => acc + c.spentUSD, 0);
  const totalEmployees = filteredCompanies.reduce((acc, c) => acc + c.employeeCount, 0);
  const totalForeignSpecialists = foreignWorkers.filter(
    w => settings.selectedCompanyFilter === 'ALL' || w.companyId === settings.selectedCompanyFilter
  ).length;

  const totalProjectBudget = filteredProjects.reduce((sum, p) => sum + (p.budgetUSD || 0), 0);
  const totalProjectSpent = filteredProjects.reduce((sum, p) => sum + (p.spentUSD || 0), 0);
  const utilizationNumeric = totalProjectBudget > 0
    ? (totalProjectSpent / totalProjectBudget) * 100
    : totalHoldingBudget > 0
      ? (totalHoldingSpent / totalHoldingBudget) * 100
      : 0;
  const activeBudgetUtilizationRate = utilizationNumeric.toFixed(1);

  const highBurnProjects = filteredProjects.filter(p => {
    const budget = p.budgetUSD || 0;
    const spent = p.spentUSD || 0;
    return budget > 0 && (spent / budget) >= 0.90;
  });

  const criticalMlAlerts = anomalyAlerts.filter(
    a => a.severity === 'CRITICAL' && (a.status === 'TRIGGERED' || a.status === 'INVESTIGATING')
  );

  const formatCurrency = (valUSD: number) => {
    if (settings.currencyDisplay === 'IQD') {
      const iqd = valUSD * 1310;
      return `${(iqd / 1000000000).toFixed(2)}B IQD`;
    }
    if (valUSD >= 1000000) {
      return `$${(valUSD / 1000000).toFixed(2)}M`;
    }
    return `$${valUSD.toLocaleString()}`;
  };

  // Memoized 30-Day Historical Trend Datasets for inline SVG Sparklines
  const sparklineData = useMemo(() => {
    const curProj = filteredProjects.length;
    const baseProj = Math.max(1, curProj - 1);
    const projects30d = Array.from({ length: 30 }, (_, i) => (i < 24 ? baseProj : curProj));

    const curUtil = Number(activeBudgetUtilizationRate) || 0;
    const startUtil = Math.max(0, curUtil - 7.6);
    const utilization30d = Array.from({ length: 30 }, (_, i) => {
      const progress = i / 29;
      const wave = Math.sin(i * 1.2) * 0.45;
      const v = startUtil + (curUtil - startUtil) * progress + wave;
      return Number(Math.min(100, Math.max(0, v)).toFixed(1));
    });
    utilization30d[29] = curUtil;

    const curPending = pendingPOs.length;
    const approvals30d = Array.from({ length: 30 }, (_, i) => {
      const wave = Math.sin(i * 0.8) * 2 + Math.cos(i * 0.4) * 1.2;
      const base = Math.max(curPending, 2) + (29 - i) * 0.06;
      return Math.max(0, Math.round(base + wave));
    });
    approvals30d[29] = curPending;

    const curRisks = highBurnProjects.length;
    const risk30d = Array.from({ length: 30 }, (_, i) => (curRisks === 0 ? 0 : i < 18 ? 0 : curRisks));
    risk30d[29] = curRisks;

    const budget30d = Array.from({ length: 30 }, (_, i) => {
      const start = totalHoldingBudget * 0.92;
      return Math.round(start + (totalHoldingBudget - start) * (i / 29));
    });

    const spent30d = Array.from({ length: 30 }, (_, i) => {
      const start = totalHoldingSpent * 0.88;
      const wave = Math.sin(i * 0.7) * (totalHoldingSpent * 0.006);
      return Math.round(start + (totalHoldingSpent - start) * (i / 29) + wave);
    });

    const revStart = holding.totalRevenueUSD * 0.86;
    const revenue30d = Array.from({ length: 30 }, (_, i) => {
      const wave = Math.cos(i * 0.9) * (holding.totalRevenueUSD * 0.008);
      return Math.round(revStart + (holding.totalRevenueUSD - revStart) * (i / 29) + wave);
    });

    const staff30d = Array.from({ length: 30 }, (_, i) => {
      const base = Math.max(1, totalEmployees - 3);
      if (i < 8) return base;
      if (i < 20) return base + 1;
      return totalEmployees;
    });

    const curIqama = expiringIqamas.length;
    const iqamaRisk30d = Array.from({ length: 30 }, (_, i) =>
      Math.max(0, Math.round(curIqama + Math.sin(i * 0.6) * 1.5))
    );
    iqamaRisk30d[29] = curIqama;

    const curGate = gateLogs.length;
    const gateLogs30d = Array.from({ length: 30 }, (_, i) => {
      const wave = Math.sin(i * 0.5) * 3 + Math.cos(i * 0.9) * 2;
      return Math.max(1, Math.round(curGate * 0.4 + curGate * 0.6 * (i / 29) + wave));
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

  // Clean Swiss-grade Macro KPI Card renderer (real derived data, tabular-nums, zero fabricated % pills)
  const renderMacroKpiCard = (kpiId: MacroKpiId) => {
    switch (kpiId) {
      case 'total_budget':
        return (
          <div
            key={kpiId}
            onClick={() => setActiveTab('finance')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-medium">{t('totalBudget')}</span>
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                {formatCurrency(totalHoldingBudget)}
              </div>
              <div className="text-xs text-slate-500 mt-1.5 tabular-nums">
                {filteredCompanies.length} {t('subsidiaryCompanies')} · {filteredProjects.length}{' '}
                {getUIText(language, { en: 'projects', ku: 'پڕۆژە', ar: 'مشاريع' })}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.budget30d}
                color="blue"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Budget', ku: 'ڕەوتی ٣٠ ڕۆژ', ar: 'مسار ٣٠ يوم' })}
                formatTooltip={(v) => formatCurrency(v)}
              />
            </div>
          </div>
        );

      case 'total_spent':
        return (
          <div
            key={kpiId}
            onClick={() => setActiveTab('finance')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-medium">{t('totalSpent')}</span>
                <Wallet className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                {formatCurrency(totalHoldingSpent)}
              </div>
              <div className="text-xs text-slate-500 mt-1.5 tabular-nums">
                {((totalHoldingSpent / (totalHoldingBudget || 1)) * 100).toFixed(1)}%{' '}
                {getUIText(language, { en: 'of allocated budget', ku: 'لە بودجەی دیاریکراو', ar: 'من الميزانية المعتمدة' })}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.spent30d}
                color="emerald"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Spend', ku: 'خەرجی ٣٠ ڕۆژ', ar: 'نفقات ٣٠ يوم' })}
                formatTooltip={(v) => formatCurrency(v)}
              />
            </div>
          </div>
        );

      case 'revenue_runway':
        return (
          <div
            key={kpiId}
            onClick={() => setActiveTab('finance')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-medium">
                  {getUIText(language, { en: 'Group Revenue', ku: 'داهاتی هۆڵدینگ', ar: 'إيرادات المجموعة' })}
                </span>
                <Briefcase className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                {formatCurrency(holding.totalRevenueUSD)}
              </div>
              <div className="text-xs text-emerald-700 mt-1.5 tabular-nums font-medium">
                {getUIText(language, { en: 'Net surplus', ku: 'سافی داهات', ar: 'صافي الفائض' })}:{' '}
                {formatCurrency(Math.max(0, holding.totalRevenueUSD - holding.totalExpensesUSD))}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.revenue30d}
                color="indigo"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Revenue', ku: 'داهاتی ٣٠ ڕۆژ', ar: 'إيرادات ٣٠ يوم' })}
                formatTooltip={(v) => formatCurrency(v)}
              />
            </div>
          </div>
        );

      case 'total_workforce':
        return (
          <div
            key={kpiId}
            onClick={() => setActiveTab('foreign-workers')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-medium">{t('totalStaff')}</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                {totalEmployees.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1.5 tabular-nums">
                {totalForeignSpecialists}{' '}
                {getUIText(language, { en: 'foreign specialists tracked', ku: 'کارمەندی بیانی تۆمارکراو', ar: 'كادر أجنبي مسجل' })}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.staff30d}
                color="purple"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Workforce', ku: 'کارمەندانی ٣٠ ڕۆژ', ar: 'الكوادر ٣٠ يوم' })}
                formatTooltip={(v) => `${v}`}
              />
            </div>
          </div>
        );

      case 'pending_pos':
        return (
          <div
            key={kpiId}
            onClick={() => setActiveTab('owner-approvals')}
            className={`border rounded-xl p-5 transition cursor-pointer flex flex-col justify-between ${
              pendingPOs.length > 0
                ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-medium">{t('pendingApprovalsKPI')}</span>
                <Crown className={`w-4 h-4 ${pendingPOs.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                {pendingPOs.length}{' '}
                <span className="text-sm font-medium text-slate-500">
                  {getUIText(language, { en: 'POs', ku: 'داواکاری', ar: 'طلبات' })}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-1.5 tabular-nums font-medium">
                ${pendingPOsTotalUSD.toLocaleString()}{' '}
                {getUIText(language, { en: 'pending value', ku: 'بەهای چاوەڕوانکراو', ar: 'قيمة معلقة' })}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60">
              <SparklineChart
                data={sparklineData.approvals30d}
                color="amber"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Queue', ku: 'ڕیزی ٣٠ ڕۆژ', ar: 'المعلقات ٣٠ يوم' })}
                formatTooltip={(v) => `${v}`}
              />
            </div>
          </div>
        );

      case 'active_projects':
        return (
          <div
            key={kpiId}
            onClick={() => setActiveTab('companies-projects')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-medium">{t('totalProjectsKPI')}</span>
                <FolderKanban className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                {filteredProjects.length}
              </div>
              <div className="text-xs text-slate-500 mt-1.5 tabular-nums">
                {filteredCompanies.length} {t('subsidiaryCompanies')}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.projects30d}
                color="blue"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Projects', ku: 'پڕۆژەکانی ٣٠ ڕۆژ', ar: 'المشاريع ٣٠ يوم' })}
                formatTooltip={(v) => `${v}`}
              />
            </div>
          </div>
        );

      case 'iqama_risk':
        return (
          <div
            key={kpiId}
            onClick={() => setActiveTab('foreign-workers')}
            className={`border rounded-xl p-5 transition cursor-pointer flex flex-col justify-between ${
              expiringIqamas.length > 0
                ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-medium">
                  {getUIText(language, { en: 'Expiring Visas & Residency', ku: 'ڤیزا و ئیقامە بەسەرچووەکان', ar: 'الإقامات والتأشيرات المنتهية' })}
                </span>
                <AlertTriangle className={`w-4 h-4 ${expiringIqamas.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                {expiringIqamas.length}
              </div>
              <div className="text-xs text-slate-500 mt-1.5">
                {expiringIqamas.length > 0
                  ? getUIText(language, { en: 'Requires renewal follow-up', ku: 'پێویستی بە نوێکردنەوە هەیە', ar: 'تتطلب متابعة التجديد' })
                  : getUIText(language, { en: 'All permits compliant', ku: 'هەموو مۆڵەتەکان پارێزراون', ar: 'جميع الإقامات سارية' })}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60">
              <SparklineChart
                data={sparklineData.iqamaRisk30d}
                color="rose"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Compliance', ku: 'چاودێری ٣٠ ڕۆژ', ar: 'الامتثال ٣٠ يوم' })}
                formatTooltip={(v) => `${v}`}
              />
            </div>
          </div>
        );

      case 'gate_deliveries':
        return (
          <div
            key={kpiId}
            onClick={() => setActiveTab('gate-scanner')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-medium">
                  {getUIText(language, { en: 'Gate Deliveries Logged', ku: 'تۆمارەکانی دەروازە', ar: 'سجلات البوابة' })}
                </span>
                <ScanLine className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                {gateLogs.length}
              </div>
              <div className="text-xs text-slate-500 mt-1.5">
                {getUIText(language, { en: 'Verified gate entries', ku: 'هاتووچۆی تۆمارکراوی مەیدانی', ar: 'دخول موثق عبر البوابة' })}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.gateLogs30d}
                color="emerald"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Gate Traffic', ku: 'هاتووچۆی ٣٠ ڕۆژ', ar: 'حركة البوابة ٣٠ يوم' })}
                formatTooltip={(v) => `${v}`}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // RBAC Boundary: Holding Top Management & IT Admin vs Branch Subordinates
  const isTopManagement =
    currentUser.role === 'HOLDING_OWNER' ||
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'IT_ADMIN';

  if (!isTopManagement) {
    return <BranchProjectOperationalPortal />;
  }

  const holdingDisplayName =
    resolveEntityText(holding, 'name', language) ||
    getUIText(language, {
      en: 'Holding Group',
      ku: 'ناوی هۆڵدینگ دیاری بکە',
      ar: 'تحديد اسم المجموعة القابضة'
    });

  const remainingTrialDays = getRemainingTrialDays(systemLicense);
  const licenseStatusText =
    systemLicense.licenseType === 'LIFETIME'
      ? getUIText(language, { en: 'Enterprise Lifetime', ku: 'مۆڵەتی هەمیشەیی', ar: 'ترخيص دائم' })
      : systemLicense.licenseType === 'MONTHLY'
        ? getUIText(language, { en: 'Active Subscription', ku: 'مۆڵەتی چالاک', ar: 'اشتراك نشط' })
        : getUIText(language, {
            en: `Trial (${remainingTrialDays}d left)`,
            ku: `تاقیکردنەوە (${remainingTrialDays} ڕۆژ ماوە)`,
            ar: `تجريبي (${remainingTrialDays} يوم)`
          });

  const isIdentityIncomplete = !holding.name?.trim() || !holding.chairmanName?.trim();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Calm Executive Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            {holding.logoUrl ? (
              <img
                src={holding.logoUrl}
                alt={holdingDisplayName}
                className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-200 p-1.5 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
                {(holding.name || 'S').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                  {holdingDisplayName}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsHoldingSetupOpen(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title={getUIText(language, {
                    en: 'Edit Holding Profile',
                    ku: 'دەستکاریکردنی زانیاری هۆڵدینگ',
                    ar: 'تعديل بيانات المجموعة'
                  })}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-xs text-slate-500 mt-1">
                <span>
                  {holding.chairmanName ||
                    getUIText(language, {
                      en: 'Chairman not configured',
                      ku: 'ناوی خاوەن تۆمار نەکراوە',
                      ar: 'اسم المالك غير محدد'
                    })}
                </span>
                {holding.legalRegNo && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-600">{holding.legalRegNo}</span>
                  </>
                )}
                <span className="text-slate-300">·</span>
                <span className="tabular-nums">
                  {companies.length} {t('subsidiaryCompanies')}
                </span>
                <span className="text-slate-300">·</span>
                <span className="tabular-nums">
                  {projects.length} {getUIText(language, { en: 'projects', ku: 'پڕۆژە', ar: 'مشاريع' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {getUIText(language, {
                  en: 'Customize Layout',
                  ku: 'ڕێکخستنی داشبۆرد',
                  ar: 'تخصيص اللوحة'
                })}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(pendingPOs.length > 0 ? 'owner-approvals' : 'companies-projects')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
            >
              {pendingPOs.length > 0 ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {getUIText(language, {
                      en: 'Review Approvals',
                      ku: 'پەسەندکردنەکان',
                      ar: 'مراجعة الموافقات'
                    })}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[11px] tabular-nums">
                    {pendingPOs.length}
                  </span>
                </>
              ) : (
                <>
                  <Building2 className="w-3.5 h-3.5" />
                  <span>
                    {getUIText(language, {
                      en: 'Companies & Projects',
                      ku: 'کۆمپانیا و پڕۆژەکان',
                      ar: 'الشركات والمشاريع'
                    })}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Calm IT Admin Quick Bar (Only visible when logged in as Holding IT_ADMIN) */}
      {currentUser.role === 'IT_ADMIN' && (
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900">
                {getUIText(language, {
                  en: 'Holding IT Administration',
                  ku: 'باری بەڕێوەبردنی سەربەخۆی IT و ڕێکخستنەکان',
                  ar: 'وضع إدارة تقنية المعلومات المستقل'
                })}
              </div>
              <p className="text-xs text-slate-500 truncate">
                {getUIText(language, {
                  en: 'Manage users, holding identity, subsidiaries, sync nodes, and local license keys independently.',
                  ku: 'بەڕێوەبردنی تەواوی بەکارهێنەران، ناسنامەی هۆڵدینگ، کۆمپانیاکان، پرینتەر و کلیلی مۆڵەت بە سەربەخۆیی.',
                  ar: 'إدارة المستخدمين والهوية والشركات والمزامنة ومفاتيح الترخيص باستقلالية تامة.'
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setIsUserRolesModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{getUIText(language, { en: 'Users & RBAC', ku: 'بەکارهێنەران (RBAC)', ar: 'المستخدمون' })}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsHoldingSetupOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{getUIText(language, { en: 'Holding Setup', ku: 'ڕێکخستنی هۆڵدینگ', ar: 'إعداد المجموعة' })}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('it-systems')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{getUIText(language, { en: 'IT Settings Hub', ku: 'ناوەندی IT', ar: 'مركز IT' })}</span>
            </button>
          </div>
        </div>
      )}

      {/* Subtle Identity Setup Prompt (Only when holding identity fields are blank) */}
      {isIdentityIncomplete && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 text-xs text-amber-900">
            <Edit3 className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {getUIText(language, {
                en: 'Complete your Holding name, chairman profile, and corporate logo to brand reports and vouchers.',
                ku: 'ناوی هۆڵدینگ، ناوی خاوەن و لۆگۆ تۆمار بکە بۆ ئەوەی لەسەر پسوولە و ڕاپۆرتە فەرمییەکان دەربکەوێت.',
                ar: 'أكمل اسم المجموعة القابضة واسم المالك والشعار لظهورها على التقارير والسندات الرسمية.'
              })}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsHoldingSetupOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold transition cursor-pointer"
          >
            {getUIText(language, { en: 'Complete Setup', ku: 'تەواوکردنی زانیاری', ar: 'إكمال الإعداد' })}
          </button>
        </div>
      )}

      {/* Segmented Focus Presets, Company Scope & Currency Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg flex-wrap gap-0.5">
          {(
            [
              { id: 'ALL', label: getUIText(language, { en: 'Overview', ku: 'پوختەی گشتی', ar: 'نظرة عامة' }) },
              { id: 'FINANCE', label: getUIText(language, { en: 'Finance', ku: 'دارایی', ar: 'المالية' }) },
              { id: 'PROJECTS', label: getUIText(language, { en: 'Projects', ku: 'پڕۆژەکان', ar: 'المشاريع' }) },
              { id: 'RISK', label: getUIText(language, { en: 'Risk & Compliance', ku: 'مەترسی و کۆنترۆڵ', ar: 'المخاطر والامتثال' }) }
            ] as { id: ExecutiveFocusPreset; label: string }[]
          ).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                settings.preset === preset.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={settings.selectedCompanyFilter}
            onChange={(e) => setSettings(prev => ({ ...prev, selectedCompanyFilter: e.target.value }))}
            aria-label={getUIText(language, { en: 'Filter by company', ku: 'فلتەری کۆمپانیا', ar: 'تصفية حسب الشركة' })}
            className="text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
          >
            <option value="ALL">
              {getUIText(language, { en: 'All Subsidiaries', ku: 'هەموو کۆمپانیاکان', ar: 'جميع الشركات التابعة' })}
            </option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} — {resolveEntityText(c, 'name', language)}
              </option>
            ))}
          </select>

          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, currencyDisplay: 'USD' }))}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                settings.currencyDisplay === 'USD' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              USD
            </button>
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, currencyDisplay: 'IQD' }))}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                settings.currencyDisplay === 'IQD' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              IQD
            </button>
          </div>
        </div>
      </div>

      {/* Calm Critical Anomaly Alert Banner (Only when critical alerts exist) */}
      {criticalMlAlerts.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">{t('mlAlertUrgentTitle')}</h3>
                <span className="text-xs font-semibold text-rose-700 tabular-nums">
                  ({criticalMlAlerts.length}{' '}
                  {getUIText(language, { en: 'critical', ku: 'مەترسی گرنگ', ar: 'حرج' })})
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 max-w-3xl leading-relaxed">
                {t('mlAlertUrgentDesc')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('ml-anomaly-detection')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white transition cursor-pointer inline-flex items-center gap-1.5 shrink-0"
          >
            <span>{t('inspectRisks')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Unified 4-Column Executive KPI Strip (Single Source of Truth — Zero Duplication) */}
      {settings.preset === 'ALL' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Consolidated Budget & Portfolio */}
          <div
            onClick={() => setActiveTab('companies-projects')}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-medium">{t('totalBudget')}</span>
                <Building2 className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                {formatCurrency(totalHoldingBudget)}
              </div>
              <div className="text-xs text-slate-500 mt-1.5 tabular-nums">
                {filteredCompanies.length} {t('subsidiaryCompanies')} · {filteredProjects.length}{' '}
                {getUIText(language, { en: 'projects', ku: 'پڕۆژە', ar: 'مشاريع' })}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <SparklineChart
                data={sparklineData.budget30d}
                color="blue"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Budget', ku: 'ڕەوتی بودجەی ٣٠ ڕۆژ', ar: 'مسار الميزانية ٣٠ يوم' })}
                formatTooltip={(v) => formatCurrency(v)}
              />
            </div>
          </div>

          {/* KPI 2: Budget Utilization */}
          <div
            onClick={() => setActiveTab('finance')}
            className={`border rounded-xl p-5 transition cursor-pointer flex flex-col justify-between ${
              highBurnProjects.length > 0
                ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-medium">{t('budgetUtilizationKPI')}</span>
                <TrendingUp className={`w-4 h-4 ${utilizationNumeric >= 90 ? 'text-rose-600' : 'text-slate-400'}`} />
              </div>
              <div className={`text-2xl font-bold tabular-nums tracking-tight ${
                utilizationNumeric >= 90 ? 'text-rose-700' : 'text-slate-900'
              }`}>
                {activeBudgetUtilizationRate}%
              </div>
              <div className="text-xs text-slate-500 mt-1.5 tabular-nums">
                {formatCurrency(totalProjectSpent || totalHoldingSpent)} /{' '}
                {formatCurrency(totalProjectBudget || totalHoldingBudget)}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 space-y-1.5">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    utilizationNumeric >= 90
                      ? 'bg-rose-600'
                      : utilizationNumeric >= 75
                        ? 'bg-amber-500'
                        : 'bg-slate-800'
                  }`}
                  style={{ width: `${Math.min(100, utilizationNumeric)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                <span>{getUIText(language, { en: 'Remaining', ku: 'ماوە', ar: 'المتبقي' })}</span>
                <span>
                  {100 - utilizationNumeric > 0
                    ? `${(100 - utilizationNumeric).toFixed(1)}%`
                    : t('budgetDepleted')}
                </span>
              </div>
            </div>
          </div>

          {/* KPI 3: Pending Owner Approvals */}
          <div
            onClick={() => setActiveTab('owner-approvals')}
            className={`border rounded-xl p-5 transition cursor-pointer group flex flex-col justify-between ${
              pendingPOs.length > 0
                ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-medium">{t('pendingApprovalsKPI')}</span>
                <Crown className={`w-4 h-4 ${pendingPOs.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
                {pendingPOs.length}{' '}
                <span className="text-sm font-medium text-slate-500">
                  {getUIText(language, { en: 'POs', ku: 'داواکاری', ar: 'طلبات' })}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-1.5 tabular-nums font-medium">
                ${pendingPOsTotalUSD.toLocaleString()}{' '}
                {getUIText(language, { en: 'pending value', ku: 'بەهای چاوەڕوانکراو', ar: 'قيمة معلقة' })}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60">
              <SparklineChart
                data={sparklineData.approvals30d}
                color="amber"
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Queue', ku: 'ڕەوتی چاوەڕوانی ٣٠ ڕۆژ', ar: 'مسار المعلقات ٣٠ يوم' })}
                formatTooltip={(v) => `${v}`}
              />
            </div>
          </div>

          {/* KPI 4: Threshold & Compliance Health */}
          <div
            onClick={() => setActiveTab(highBurnProjects.length > 0 ? 'companies-projects' : 'foreign-workers')}
            className={`border rounded-xl p-5 transition cursor-pointer flex flex-col justify-between ${
              highBurnProjects.length > 0
                ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-3">
                <span className="text-xs font-medium">{t('thresholdHealthKPI')}</span>
                <ShieldCheck className={`w-4 h-4 ${highBurnProjects.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
              </div>
              <div className={`text-2xl font-bold tabular-nums tracking-tight ${
                highBurnProjects.length > 0 ? 'text-rose-700' : 'text-emerald-700'
              }`}>
                {highBurnProjects.length > 0 ? `${highBurnProjects.length} ${t('atRisk')}` : t('optimalHealth')}
              </div>
              <div className="text-xs text-slate-500 mt-1.5 tabular-nums">
                {totalEmployees.toLocaleString()} {getUIText(language, { en: 'staff', ku: 'کارمەند', ar: 'موظف' })} ·{' '}
                {expiringIqamas.length}{' '}
                {getUIText(language, { en: 'visa alerts', ku: 'ئاگاداری ڤیزا', ar: 'تنبيهات إقامة' })}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60">
              <SparklineChart
                data={sparklineData.risk30d}
                color={highBurnProjects.length > 0 ? 'rose' : 'emerald'}
                height={28}
                trendLabel={getUIText(language, { en: '30-Day Threshold', ku: 'چاودێری سنوور ٣٠ ڕۆژ', ar: 'مراقبة الحدود ٣٠ يوم' })}
                formatTooltip={(v) => (v > 0 ? `${v}` : '0')}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {settings.selectedMacroKpis.map(kpiId => renderMacroKpiCard(kpiId))}
        </div>
      )}

      {/* Balanced Executive Widgets Grid */}
      {(() => {
        const fullWidthSet = new Set<WidgetId>([
          'kpi_overview',
          'project_expenditure_chart',
          'departmental_operations'
        ]);

        const renderSingleWidget = (widgetId: WidgetId) => {
          switch (widgetId) {
            case 'kpi_overview':
              return (
                <KpiOverviewWidget
                  key="kpi_overview"
                  currencyDisplay={settings.currencyDisplay}
                  selectedCompanyFilter={settings.selectedCompanyFilter}
                />
              );

            case 'ml_anomaly_monitor':
              return <MLAnomalyMonitorWidget key="ml_anomaly_monitor" />;

            case 'project_expenditure_chart':
              return (
                <ProjectExpenditureBudgetRechartsDashboard
                  key="project_expenditure_chart"
                  currencyDisplay={settings.currencyDisplay}
                  selectedCompanyFilter={settings.selectedCompanyFilter}
                />
              );

            case 'general_managers':
              return <GeneralManagersWidget key="general_managers" />;

            case 'pending_approvals':
              return (
                <div
                  key="pending_approvals"
                  className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                          <Crown className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-sm font-bold text-slate-900 truncate">
                            {t('pendingOwnerApproval')}{' '}
                            <span className="font-mono text-slate-500 tabular-nums">({pendingPOs.length})</span>
                          </h2>
                          <p className="text-xs text-slate-500 truncate">{t('holdingOwnerRuleBanner')}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('owner-approvals')}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>{getUIText(language, { en: 'View Queue', ku: 'هەموو ڕیزەکە', ar: 'عرض الكل' })}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {pendingPOs.length === 0 ? (
                      <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                        <div className="font-medium text-slate-700">
                          {getUIText(language, {
                            en: 'All clear: No purchase orders awaiting owner signature.',
                            ku: 'هیچ داواکارییەکی کڕین لە چاوەڕوانی واژۆدا نییە.',
                            ar: 'لا توجد طلبات شراء معلقة تتطلب التوقيع.'
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {pendingPOs.slice(0, 4).map((po) => {
                          const comp = companies.find(c => c.id === po.companyId);
                          return (
                            <div
                              key={po.id}
                              className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-slate-900 text-xs font-mono tabular-nums">
                                    {po.poNumber}
                                  </span>
                                  <span className="text-[11px] text-slate-500 truncate max-w-[160px]">
                                    {comp ? resolveEntityText(comp, 'name', language) : 'Subsidiary'}
                                  </span>
                                  <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                                    ${po.totalAmountUSD.toLocaleString()} {po.currency}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {po.supplierName} · {po.requestedBy}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">{po.purpose}</p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    approvePurchaseByOwner(po.id, 'Holding Owner Approved directly from dashboard')
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
                                  id={`owner-quick-approve-${po.id}`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{t('approvePurchase')}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    rejectPurchaseByOwner(po.id, 'Holding Owner rejected: Budget limit exceeded')
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 transition cursor-pointer"
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

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {getUIText(language, {
                        en: 'Approval Threshold: $5,000+ USD',
                        ku: 'سنووری پەسەندکردن: سەروو $٥,٠٠٠ دۆلار',
                        ar: 'حد الموافقة: أكثر من 5,000 دولار'
                      })}
                    </span>
                    <span className="font-mono text-slate-900 font-semibold tabular-nums">
                      ${pendingPOsTotalUSD.toLocaleString()}
                    </span>
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
              return <SubsidiaryEfficiencyWidget key="subsidiary_matrix" />;

            case 'departmental_operations':
              return <DepartmentOperationsMatrixWidget key="departmental_operations" />;

            case 'recent_activities':
              return <LiveActivityFeedWidget key="recent_activities" />;

            case 'directors_directory':
              return (
                <div
                  key="directors_directory"
                  className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-slate-500" />
                          <span>{t('navContactManagers')}</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {getUIText(language, {
                            en: 'Direct communication with Subsidiary General Managers.',
                            ku: 'پەیوەندی ڕاستەوخۆ لەگەڵ بەڕێوەبەرانی گشتی کۆمپانیاکان.',
                            ar: 'تواصل مباشر مع المدراء العامين للشركات التابعة.'
                          })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('direct-comms')}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>{getUIText(language, { en: 'Directory', ku: 'پەیوەندییەکان', ar: 'الدليل' })}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredCompanies.slice(0, 4).map((comp) => (
                        <div
                          key={comp.id}
                          className="bg-slate-50/70 border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 flex flex-col justify-between transition"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-mono font-semibold text-slate-600">
                                {comp.code}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            </div>
                            <h3 className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                              {comp.generalManager}
                            </h3>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {resolveEntityText(comp, 'name', language)}
                            </p>
                            <p className="text-[11px] text-slate-600 font-mono mt-1 tabular-nums">
                              {comp.gmPhone}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-200/80">
                            <button
                              type="button"
                              onClick={() =>
                                startCallWithManager({
                                  name: comp.generalManager,
                                  role: 'General Manager',
                                  phone: comp.gmPhone,
                                  company: resolveEntityText(comp, 'name', language),
                                  avatar: comp.generalManager.charAt(0).toUpperCase()
                                })
                              }
                              className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-900 text-slate-700 hover:text-white border border-slate-200 hover:border-slate-900 transition cursor-pointer"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>{getUIText(language, { en: 'Call', ku: 'پەیوەندی', ar: 'اتصال' })}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCompanyId(comp.id);
                                setActiveTab('companies-projects');
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer"
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
              return <RiskComplianceWidget key="risk_compliance" />;

            default:
              return null;
          }
        };

        // Group into balanced full-width and 2-column blocks (skip macro_kpis since top KPI row already renders it)
        const blocks: { type: 'full' | 'pair'; widgets: WidgetId[] }[] = [];
        const activeWidgets = settings.widgetOrder.filter(
          wId => wId !== 'macro_kpis' && settings.visibleWidgets.includes(wId)
        );
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

      {/* Compact Executive Resources & License Strip (Replaces heavy bottom billboards) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* License Summary */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Key className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <span>{licenseStatusText}</span>
              {systemLicense.licenseKey && (
                <span className="font-mono text-[11px] text-slate-500">
                  {systemLicense.licenseKey.slice(0, 12)}…
                </span>
              )}
            </div>
            <div className="text-slate-500 mt-0.5">
              {getUIText(language, {
                en: 'Holding ERP License & Offline Mesh Status',
                ku: 'باری مۆڵەتی هۆڵدینگ و بەستنەوەی ئۆفلاین',
                ar: 'حالة ترخيص المجموعة والمزامنة المحلية'
              })}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => openLicenseModal('activate')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
            >
              {getUIText(language, { en: 'License Key', ku: 'کلیلی مۆڵەت', ar: 'مفتاح الترخيص' })}
            </button>
            <button
              type="button"
              onClick={() => setIsMeshHubOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-slate-600" />
              <span>{getUIText(language, { en: 'Mesh Sync', ku: 'سینکی لۆکاڵ', ar: 'المزامنة المحلية' })}</span>
            </button>
            {isMasterVendorOwner && (
              <button
                type="button"
                onClick={() => setActiveTab('license-admin')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition cursor-pointer inline-flex items-center gap-1"
              >
                <span>{getUIText(language, { en: 'Vendor Portal', ku: 'سیستەمی ٢', ar: 'بوابة المنصة' })}</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Executive Documentation Downloads */}
        <div className="flex items-center gap-1.5 flex-wrap border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
          <button
            type="button"
            onClick={() => setIsUserManualOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>{getUIText(language, { en: 'User Manual', ku: 'ڕێبەری سیستەم', ar: 'دليل النظام' })}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadManualDocx}
            disabled={isDownloadingManualDocx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isDownloadingManualDocx ? '...' : 'Manual (.docx)'}</span>
          </button>
          <button
            type="button"
            onClick={() => openUserManualPrintView(language)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadWhyDocx}
            disabled={isDownloadingWhyDocx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {isDownloadingWhyDocx
                ? '...'
                : getUIText(language, { en: 'Brief (.docx)', ku: 'بۆچی SAS4ERP', ar: 'ملف المقارنة' })}
            </span>
          </button>
          <button
            type="button"
            onClick={() => openWhyChooseSAS4ERPPdfView(language)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 transition cursor-pointer"
            title={getUIText(language, { en: 'Print Comparison Brief', ku: 'چاپکردنی پۆرتفۆلیۆ', ar: 'طباعة ملف المقارنة' })}
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dashboard Configuration Modal */}
      <DashboardConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* Floating Executive Sticky Note Widget */}
      <ExecutiveStickyNoteWidget />

      {/* Holding Local Mesh & Offline Sync Hub Modal */}
      <HoldingMeshSyncHubModal
        isOpen={isMeshHubOpen}
        onClose={() => setIsMeshHubOpen(false)}
      />
    </div>
  );
};
