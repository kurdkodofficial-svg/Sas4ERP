import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Send,
  Building2,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  Clock,
  PhoneCall,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
  Check,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Sliders,
  Users,
  Lock,
  PauseCircle,
  Video,
  FileCheck2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { Project, CostSavingSuggestion } from '../types/erp';

interface SmartBudgetAlertPanelProps {
  onNavigateToProjects?: () => void;
  onNavigateToProcurement?: () => void;
  onNavigateToFinance?: () => void;
}

export const SmartBudgetAlertPanel: React.FC<SmartBudgetAlertPanelProps> = ({
  onNavigateToProjects,
  onNavigateToProcurement,
  onNavigateToFinance
}) => {
  const {
    projects,
    companies,
    purchaseOrders,
    financeLedgers,
    addNotification,
    currentUser,
    startCallWithManager,
    setActiveTab
  } = useERP();

  const { language, isRtl } = useLanguage();

  // Audience perspective: Project Managers vs Company GMs vs All
  const [audienceFilter, setAudienceFilter] = useState<'ALL' | 'PROJECT_MANAGER' | 'COMPANY_GM'>(() => {
    if (currentUser?.role === 'PROJECT_MANAGER') return 'PROJECT_MANAGER';
    if (currentUser?.role === 'COMPANY_GM') return 'COMPANY_GM';
    return 'ALL';
  });

  // Threshold selector (default 90%, with options 80%, 85%, 90%, 95%)
  const [thresholdLimit, setThresholdLimit] = useState<number>(90);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [autoDispatchToManagers, setAutoDispatchToManagers] = useState<boolean>(() => {
    return localStorage.getItem('sas4erp_auto_dispatch_pm') === 'true';
  });

  // Frozen PO status flag per project
  const [frozenPurchases, setFrozenPurchases] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sas4erp_frozen_project_pos');
    return saved ? JSON.parse(saved) : {};
  });

  // Track dispatched & acknowledged status per project
  const [dispatchedDirectives, setDispatchedDirectives] = useState<Record<string, {
    dispatchedAt: string;
    targetPm: string;
    targetGm: string;
    acknowledged: boolean;
    acknowledgedAt?: string;
    actionTakenSummaryKu?: string;
  }>>(() => {
    const saved = localStorage.getItem('sas4erp_pm_budget_directives');
    return saved ? JSON.parse(saved) : {};
  });

  // Stored AI suggestions per project
  const [projectAiData, setProjectAiData] = useState<Record<string, {
    executiveDiagnosisKu: string;
    executiveDiagnosisEn: string;
    totalSavingsUSD: number;
    suggestions: CostSavingSuggestion[];
    managerDirectiveKu: string;
    managerDirectiveEn: string;
  }>>({});

  const [isPreviewDirectiveOpen, setIsPreviewDirectiveOpen] = useState(false);
  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Identify projects that reached or exceeded the threshold
  const thresholdProjects = projects.filter(p => {
    const budget = p.budgetUSD || 0;
    const spent = p.spentUSD || 0;
    return budget > 0 && ((spent / budget) * 100) >= thresholdLimit;
  });

  // Set default selected project
  useEffect(() => {
    if (thresholdProjects.length > 0 && (!selectedProjectId || !thresholdProjects.some(p => p.id === selectedProjectId))) {
      // If user is PM, prioritize their assigned project
      if (currentUser?.role === 'PROJECT_MANAGER' && currentUser.projectId) {
        const userProj = thresholdProjects.find(p => p.id === currentUser.projectId);
        if (userProj) {
          setSelectedProjectId(userProj.id);
          return;
        }
      }
      setSelectedProjectId(thresholdProjects[0].id);
    }
  }, [thresholdProjects, selectedProjectId, currentUser]);

  const activeProject = thresholdProjects.find(p => p.id === selectedProjectId) || thresholdProjects[0] || projects[0];
  const activeCompany = companies.find(c => c.id === activeProject?.companyId);

  // Procurement & Finance context for this project
  const projectPOs = purchaseOrders.filter(po => po.projectId === activeProject?.id || po.companyId === activeProject?.companyId);
  const projectFinanceEntries = financeLedgers.filter(fe => fe.projectId === activeProject?.id || fe.companyId === activeProject?.companyId);

  // Fetch or generate AI cost savings for the active project
  const fetchCostSavingMeasures = async (proj: Project) => {
    if (!proj) return;
    setIsGeneratingAI(true);

    try {
      const comp = companies.find(c => c.id === proj.companyId);
      const relevantPOs = purchaseOrders
        .filter(po => po.projectId === proj.id || po.companyId === proj.companyId)
        .slice(0, 5)
        .map(po => ({
          poNumber: po.poNumber,
          supplier: po.supplierName,
          amountUSD: po.totalAmountUSD,
          items: (po.items || []).map(i => `${i.name} ($${i.totalUSD})`)
        }));

      const relevantFinance = {
        totalDebitsUSD: financeLedgers
          .filter(f => f.projectId === proj.id || f.companyId === proj.companyId)
          .reduce((acc, curr) => acc + curr.debitUSD, 0),
        majorAccounts: Array.from(new Set(
          financeLedgers
            .filter(f => f.projectId === proj.id || f.companyId === proj.companyId)
            .map(f => f.accountName)
        )).slice(0, 4)
      };

      const response = await fetch('/api/gemini/suggest-cost-savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: {
            id: proj.id,
            name: proj.name,
            nameKu: proj.nameKu,
            code: proj.code,
            budgetUSD: proj.budgetUSD,
            spentUSD: proj.spentUSD,
            spentPercent: (((proj.spentUSD || 0) / (proj.budgetUSD || 1)) * 100).toFixed(1),
            manager: proj.manager,
            managerPhone: proj.managerPhone
          },
          company: comp ? {
            name: comp.name,
            nameKu: comp.nameKu,
            generalManager: comp.generalManager,
            gmPhone: comp.gmPhone
          } : undefined,
          procurementSummary: {
            recentPOs: relevantPOs,
            topSuppliers: Array.from(new Set(relevantPOs.map(p => p.supplier)))
          },
          financeSummary: relevantFinance,
          thresholdPercent: thresholdLimit,
          language
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProjectAiData(prev => ({
          ...prev,
          [proj.id]: {
            executiveDiagnosisKu: data.executiveDiagnosisKu || '',
            executiveDiagnosisEn: data.executiveDiagnosis || '',
            totalSavingsUSD: data.totalPotentialSavingsUSD || 380000,
            suggestions: data.suggestions || [],
            managerDirectiveKu: data.managerDirectiveKu || '',
            managerDirectiveEn: data.managerDirectiveEn || ''
          }
        }));
      }
    } catch (err) {
      console.warn('AI Cost-saving suggestion fallback', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Load suggestions when project changes if not cached
  useEffect(() => {
    if (activeProject && !projectAiData[activeProject.id]) {
      fetchCostSavingMeasures(activeProject);
    }
  }, [activeProject?.id]);

  // Handle Dispatch to Project Manager & GM
  const handleDispatchDirectiveToManagers = () => {
    if (!activeProject) return;

    const pmName = activeProject.manager || 'بەڕێوەبەری پڕۆژە';
    const gmName = activeCompany?.generalManager || 'بەڕێوەبەری گشتی کۆمپانیا';
    const currentData = projectAiData[activeProject.id];
    const timestamp = new Date().toISOString();

    // 1. Dispatch Targeted Notification to Project Manager (PM)
    addNotification({
      title: `🚨 ئاگاداری فەرمی کەمکردنەوەی خەرجی بۆ بەڕێوەبەری پڕۆژە (${pmName})`,
      titleKu: `🚨 ئاگاداری فەرمی کەمکردنەوەی خەرجی: ${activeProject.nameKu || activeProject.name}`,
      titleAr: `🚨 تنبيه ترشيد النفقات لمدير المشروع: ${activeProject.nameAr || activeProject.name}`,
      message: `بۆ بەڕێوەبەری پڕۆژە ${pmName}: بودجەی پڕۆژەکەتان گەیشتووەتە ${(((activeProject.spentUSD || 0) / (activeProject.budgetUSD || 1)) * 100).toFixed(1)}%. ڕاسپاردەی ژیری دەستکرد بۆ کەمکردنەوەی تێچوو بە بڕی $${(currentData?.totalSavingsUSD || 380000).toLocaleString()} دەرکرا. پێویستە دەستبەجێ کڕینە لاوەکییەکان بوەستێنن و ڕاپۆرت پێشکەش بکەن.`,
      type: 'BUDGET_THRESHOLD_ALERT',
      targetRole: 'PROJECT_MANAGER',
      targetRecipientName: pmName,
      targetEntityId: activeProject.id,
      directives: currentData?.suggestions?.map(s => s.titleKu || s.title) || [
        'نوێکردنەوەی دانوستان لەسەر نرخی کڕینی شیش بە کۆمەڵ',
        'گواستنەوەی کرێی ئامێر بۆ بەشی ناوخۆیی هۆلدینگ',
        'ڕێکخستنەوەی شفتەکانی شەوانە بۆ کەمکردنەوەی ئۆڤەرتایم'
      ]
    });

    // 2. Dispatch Targeted Notification to Company GM
    addNotification({
      title: `🚨 ئاگاداری چاودێری بودجە بۆ بەڕێوەبەری گشتی کۆمپانیا (${gmName})`,
      titleKu: `ئاگاداری بەڕێوەبەری گشتی: پڕۆژەی ${activeProject.nameKu || activeProject.name} لە سنووری بودجەدایە`,
      titleAr: `توجيه إداري للمدير العام: مشروع ${activeProject.nameAr || activeProject.name} بلغ سقف الميزانية`,
      message: `بەڕێوەبەری گشتی بەڕێز (${gmName}): ڕاسپاردەکانی ژیری دەستکرد ئاراستەی بەڕێوەبەری پڕۆژە ${pmName} کران بۆ دابینکردنی پاشەکەوتی $${(currentData?.totalSavingsUSD || 380000).toLocaleString()}. تکایە چاودێری جێبەجێکردنی بکەن.`,
      type: 'BUDGET_THRESHOLD_ALERT',
      targetRole: 'COMPANY_GM',
      targetRecipientName: gmName,
      targetEntityId: activeCompany?.id
    });

    // Save dispatched state
    const updated = {
      ...dispatchedDirectives,
      [activeProject.id]: {
        dispatchedAt: timestamp,
        targetPm: pmName,
        targetGm: gmName,
        acknowledged: false
      }
    };
    setDispatchedDirectives(updated);
    localStorage.setItem('sas4erp_pm_budget_directives', JSON.stringify(updated));

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}
  };

  // Action: Project Manager acknowledges and signs mitigation commitment
  const handleAcknowledgeCommitmentByPM = () => {
    if (!activeProject) return;

    const pmName = activeProject.manager || 'بەڕێوەبەری پڕۆژە';
    const timestamp = new Date().toISOString();
    const currentData = projectAiData[activeProject.id];
    const totalSavings = currentData?.totalSavingsUSD || 380000;

    const updated = {
      ...dispatchedDirectives,
      [activeProject.id]: {
        dispatchedAt: dispatchedDirectives[activeProject.id]?.dispatchedAt || timestamp,
        targetPm: pmName,
        targetGm: activeCompany?.generalManager || 'بەڕێوەبەری گشتی',
        acknowledged: true,
        acknowledgedAt: timestamp,
        actionTakenSummaryKu: `پەیماننامەی پابەندبوون بە کەمکردنەوەی $${totalSavings.toLocaleString()} لەلایەن ${pmName} واژۆ کرا.`
      }
    };
    setDispatchedDirectives(updated);
    localStorage.setItem('sas4erp_pm_budget_directives', JSON.stringify(updated));
    setIsCommitmentModalOpen(false);

    // Notify Company GM that PM has complied
    addNotification({
      title: `✅ بەڕێوەبەری پڕۆژە (${pmName}) بەڵێننامەی پاشەکەوتی واژۆ کرد`,
      titleKu: `✅ پەسەندکردنی پلانی پاشەکەوت: بەڕێوەبەری پڕۆژە ${pmName} پەیمانی دەستبەجێی دا`,
      titleAr: `✅ إقرار مدير المشروع: تم توقيع خطة ترشيد النفقات رسمياً`,
      message: `بۆ بەڕێوەبەری گشتی: بەڕێوەبەری پڕۆژە ${pmName} لە پڕۆژەی ${activeProject.nameKu || activeProject.name} پلانەکانی ژیری دەستکردی قبوڵکرد و پابەندبوو بە کەمکردنەوەی $${totalSavings.toLocaleString()}.`,
      type: 'BUDGET_THRESHOLD_ALERT',
      targetRole: 'COMPANY_GM',
      targetRecipientName: activeCompany?.generalManager,
      targetEntityId: activeCompany?.id
    });

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  // Action: Freeze Discretionary POs on site
  const handleToggleFreezePurchases = () => {
    if (!activeProject) return;
    const isNowFrozen = !frozenPurchases[activeProject.id];
    const updated = {
      ...frozenPurchases,
      [activeProject.id]: isNowFrozen
    };
    setFrozenPurchases(updated);
    localStorage.setItem('sas4erp_frozen_project_pos', JSON.stringify(updated));

    if (isNowFrozen) {
      addNotification({
        title: `🛑 فەرمانی ڕاگرتنی کڕینی لاوەکی بۆ پڕۆژەی ${activeProject.nameKu || activeProject.name}`,
        titleKu: `🛑 فەرمانی دەستبەجێ: بەڕێوەبەری پڕۆژە سەرجەم داواکارییە ناپێویستەکانی لە بەشی تدارکات ڕاگرت`,
        titleAr: `🛑 تجميد المشتريات غير الطارئة من قبل مدير المشروع`,
        message: `لە چوارچێوەی ڕاسپاردەکانی ژیری دەستکرد، داواکاری کڕینی کەرەستەی ناپێویست لە عەمبار و دابینکەران ڕاگیرا تا هاوسەنگبوونی بودجە.`,
        type: 'BUDGET_THRESHOLD_ALERT',
        targetRole: 'PROJECT_MANAGER',
        targetRecipientName: activeProject.manager,
        targetEntityId: activeProject.id
      });
    }
  };

  // Auto-dispatch persistence toggle
  const toggleAutoDispatch = () => {
    const nextVal = !autoDispatchToManagers;
    setAutoDispatchToManagers(nextVal);
    localStorage.setItem('sas4erp_auto_dispatch_pm', String(nextVal));
  };

  if (!activeProject || thresholdProjects.length === 0) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                سیستەمی چاودێری بودجە بۆ بەڕێوەبەرانی پڕۆژە و کۆمپانیا
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-emerald-950 mt-0.5">
              سەرجەم پڕۆژەکان لەژێر سنووری دیاریکراوی {thresholdLimit}٪ی بودجەدان
            </h3>
            <p className="text-xs text-emerald-800/80 leading-relaxed">
              ئاگادارکردنەوەی ژیری دەستکرد بە شێوەی ئۆتۆماتیک ڕاستەوخۆ دەچێت بۆ بەڕێوەبەری پڕۆژە و بەڕێوەبەری کۆمپانیا کاتێک هەر پڕۆژەیەک دەگاتە سنووری هۆشداری (نەک بۆ خاوەنی هۆلدینگ).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={thresholdLimit}
            onChange={(e) => setThresholdLimit(Number(e.target.value))}
            className="bg-white border border-emerald-300 text-xs font-bold text-emerald-900 rounded-xl px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value={80}>سنووری هۆشداری: ٨٠٪</option>
            <option value={85}>سنووری هۆشداری: ٨٥٪</option>
            <option value={90}>سنووری هۆشداری: ٩٠٪</option>
            <option value={95}>سنووری هۆشداری: ٩٥٪</option>
          </select>
        </div>
      </div>
    );
  }

  const currentProjectAi = projectAiData[activeProject.id];
  const isDispatched = !!dispatchedDirectives[activeProject.id];
  const dispatchInfo = dispatchedDirectives[activeProject.id];
  const isAcknowledged = !!dispatchInfo?.acknowledged;
  const isFrozen = !!frozenPurchases[activeProject.id];
  const burnRate = (((activeProject.spentUSD || 0) / (activeProject.budgetUSD || 1)) * 100).toFixed(1);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-indigo-800/60 relative overflow-hidden animate-in fade-in">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Notice: Clear Designation for Project Managers & Company GMs (Not for Holding Owner) */}
      <div className="mb-4 bg-blue-500/15 border border-blue-400/30 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs text-blue-100 leading-relaxed font-sans">
            <strong className="text-amber-300 font-bold block sm:inline">
              ئاگاداری تایبەت بە بەڕێوەبەری پڕۆژە و کۆمپانیا:
            </strong>{' '}
            ئەم هۆشدارییە بارگرانی لەسەر خاوەنی هۆلدینگ دروست ناکات؛ بەڵکو ڕاستەوخۆ بەڕێوەبەری پڕۆژە (PM) و بەڕێوەبەری گشتی (GM) بەرپرسیار دەکات لە جێبەجێکردنی پلانەکانی پاشەکەوت.
          </p>
        </div>

        {/* Audience Perspective Toggle Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setAudienceFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
              audienceFilter === 'ALL' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            هەموو
          </button>
          <button
            type="button"
            onClick={() => setAudienceFilter('PROJECT_MANAGER')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
              audienceFilter === 'PROJECT_MANAGER' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>بەڕێوەبەری پڕۆژە (PM)</span>
          </button>
          <button
            type="button"
            onClick={() => setAudienceFilter('COMPANY_GM')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
              audienceFilter === 'COMPANY_GM' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>بەڕێوەبەری کۆمپانیا (GM)</span>
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-800/60">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                {language === 'ku' ? 'ئاگادارکردنەوەی زیرەکی بودجە' : 'Smart Budget Alert'}
              </span>

              {/* Target Manager Badge */}
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[11px] font-black flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                {language === 'ku'
                  ? 'ئاراستەکراو بۆ: بەڕێوەبەری پڕۆژە و بەڕێوەبەری کۆمپانیا'
                  : 'Targeted to Project Manager & General Manager'}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-white mt-1">
              {language === 'ku'
                ? `ڕاسپاردەکانی ژیری دەستکرد بۆ کەمکردنەوەی تێچوو و دەسەڵاتی بەڕێوەبەران`
                : `AI Proactive Cost-Saving Directives & Manager Action Panel`}
            </h2>

            <p className="text-xs text-indigo-200/90 mt-0.5 max-w-2xl leading-relaxed">
              {language === 'ku'
                ? `پڕۆژەی (${activeProject.nameKu || activeProject.name}) گەیشتووەتە ${burnRate}٪ی بودجە. ڕاسپاردەی خێرا لە بەشەکانی کڕین و دارایی ئامادەکراون تا بەڕێوەبەری پڕۆژە جێبەجێیان بکات.`
                : `Project has reached ${burnRate}% utilization. Proactive measures from procurement and finance are generated for PM implementation.`}
            </p>
          </div>
        </div>

        {/* Project Selector & Threshold Adjuster */}
        <div className="flex flex-wrap items-center gap-2">
          {thresholdProjects.length > 1 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
            >
              {thresholdProjects.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.nameKu || p.name} ({(((p.spentUSD || 0) / (p.budgetUSD || 1)) * 100).toFixed(0)}%)
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-indigo-200">
            <Sliders className="w-3.5 h-3.5" />
            <span className="font-bold">{language === 'ku' ? 'سنوور:' : 'Limit:'}</span>
            <select
              value={thresholdLimit}
              onChange={(e) => setThresholdLimit(Number(e.target.value))}
              className="bg-transparent font-black text-white outline-none cursor-pointer"
            >
              <option value={80} className="bg-slate-900">80%</option>
              <option value={85} className="bg-slate-900">85%</option>
              <option value={90} className="bg-slate-900">90%</option>
              <option value={95} className="bg-slate-900">95%</option>
            </select>
          </div>

          <button
            onClick={() => fetchCostSavingMeasures(activeProject)}
            disabled={isGeneratingAI}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition cursor-pointer"
            title="Re-run AI Analysis"
          >
            <RefreshCw className={`w-4 h-4 ${isGeneratingAI ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="relative z-10 space-y-5 pt-4">
          
          {/* Project & Target Managers Spotlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Box 1: Project Budget Breakdown */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-bold block">{activeCompany?.nameKu || activeCompany?.name}</span>
                <h3 className="text-sm font-black text-white mt-0.5">{activeProject.nameKu || activeProject.name}</h3>
                <span className="text-[10px] font-mono text-indigo-300">{activeProject.code}</span>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-300 font-bold">{language === 'ku' ? 'خەرجی بودجە:' : 'Budget Used:'}</span>
                  <span className="text-base font-black text-rose-400 font-mono">{burnRate}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full"
                    style={{ width: `${Math.min(100, Number(burnRate))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>${((activeProject.spentUSD || 0) / 1000000).toFixed(2)}M خەرجکراو</span>
                  <span>/ ${((activeProject.budgetUSD || 0) / 1000000).toFixed(2)}M بودجە</span>
                </div>
              </div>
            </div>

            {/* Box 2: Target Project Manager & Company GM Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-blue-300 font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  {language === 'ku' ? 'بەڕێوەبەرانی بەرپرسیار لە کۆنترۆڵی خەرجی:' : 'Responsible Managers for Cost Control:'}
                </span>

                {/* Project Manager Card */}
                <div className="mt-2 p-2 rounded-xl bg-blue-500/10 border border-blue-400/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-blue-300 font-bold block">{language === 'ku' ? 'بەڕێوەبەری پڕۆژە (PM):' : 'Project Manager:'}</span>
                      <strong className="text-xs text-white block">{activeProject.manager}</strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startCallWithManager({
                          name: activeProject.manager,
                          role: 'Project Manager',
                          phone: activeProject.managerPhone,
                          company: activeProject.nameKu || activeProject.name,
                          avatar: '📐'
                        })}
                        className="p-1.5 bg-blue-600/30 hover:bg-blue-600/50 rounded-lg text-blue-300 transition cursor-pointer"
                        title="پەیوەندی لەگەڵ بەڕێوەبەری پڕۆژە"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-blue-300/80">{activeProject.managerPhone}</span>
                </div>

                {/* General Manager Card */}
                <div className="mt-1.5 p-2 rounded-xl bg-purple-500/10 border border-purple-400/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-purple-300 font-bold block">{language === 'ku' ? 'بەڕێوەبەری گشتی کۆمپانیا (GM):' : 'Company General Manager:'}</span>
                      <strong className="text-xs text-white block">{activeCompany?.generalManager || 'بەڕێوەبەری کۆمپانیا'}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => startCallWithManager({
                        name: activeCompany?.generalManager || 'General Manager',
                        role: 'Company GM',
                        phone: activeCompany?.gmPhone || '+964 750 000 0001',
                        company: activeCompany?.nameKu || activeCompany?.name || 'کۆمپانیا',
                        avatar: '🏢'
                      })}
                      className="p-1.5 bg-purple-600/30 hover:bg-purple-600/50 rounded-lg text-purple-300 transition cursor-pointer"
                      title="پەیوەندی لەگەڵ بەڕێوەبەری گشتی"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{language === 'ku' ? 'دۆخی پابەندبوونی PM:' : 'PM Commitment:'}</span>
                {isAcknowledged ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {language === 'ku' ? 'واژۆ و پەسەند کراوە' : 'Signed by PM'}
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {language === 'ku' ? 'چاوەڕوانی واژۆی بەڕێوەبەری پڕۆژە' : 'Awaiting PM Signature'}
                  </span>
                )}
              </div>
            </div>

            {/* Box 3: Procurement & Finance Context Summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-indigo-300 font-bold flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                  {language === 'ku' ? 'داتای پەیوەندیداری کڕین و دارایی:' : 'Procurement & Finance Data:'}
                </span>

                <div className="space-y-1.5 text-xs text-slate-300 mt-2">
                  <div className="flex justify-between items-center">
                    <span>{language === 'ku' ? 'داواکارییەکانی کڕین (POs):' : 'Total POs:'}</span>
                    <button
                      type="button"
                      onClick={onNavigateToProcurement}
                      className="text-white hover:text-blue-300 font-mono underline flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <span>{projectPOs.length} داواکاری فەرمی</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ku' ? 'گەورەترین دابینکەر:' : 'Top Supplier:'}</span>
                    <strong className="text-amber-300 truncate max-w-[150px]">Kani Heavy Materials</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{language === 'ku' ? 'تۆمارەکانی دارایی (Ledger):' : 'Finance Entries:'}</span>
                    <button
                      type="button"
                      onClick={onNavigateToFinance}
                      className="text-white hover:text-emerald-300 font-mono underline flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <span>{projectFinanceEntries.length} قەواڵەی خەرجی</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ku' ? 'پۆلی سەرەکی خەرجی:' : 'Top Category:'}</span>
                    <strong className="text-indigo-300">Rebar Steel & Rig Rental</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-bold">{language === 'ku' ? 'پاشەکەوتی دەستەبەرکراو:' : 'Potential Savings:'}</span>
                <span className="text-base font-black text-emerald-300 font-mono">
                  ${(currentProjectAi?.totalSavingsUSD || 380000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Manager Action Bar */}
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                {language === 'ku' ? 'دەسەڵاتی دەستبەجێی بەڕێوەبەر بۆ کەمکردنەوەی خەرجی:' : 'Immediate Manager Action Tools:'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Button: Freeze Non-Essential POs */}
              <button
                type="button"
                onClick={handleToggleFreezePurchases}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isFrozen
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>
                  {isFrozen
                    ? (language === 'ku' ? 'کڕینە لاوەکییەکان ڕاگیراون 🛑' : 'Discretionary POs Frozen')
                    : (language === 'ku' ? 'ڕاگرتنی کڕینە ناپێویستەکان' : 'Freeze Discretionary POs')}
                </span>
              </button>

              {/* Button: Sign Commitment by PM */}
              <button
                type="button"
                onClick={() => setIsCommitmentModalOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isAcknowledged
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-md'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>
                  {isAcknowledged
                    ? (language === 'ku' ? 'بەڵێننامەی PM واژۆ کرا ✓' : 'Commitment Signed')
                    : (language === 'ku' ? 'واژۆکردنی بەڵێننامەی بەڕێوەبەری پڕۆژە' : 'Sign PM Mitigation Commitment')}
                </span>
              </button>

              {/* Button: Call Emergency GM/PM Alignment */}
              <button
                type="button"
                onClick={() => startCallWithManager({
                  name: activeProject.manager,
                  role: 'Project Manager',
                  phone: activeProject.managerPhone,
                  company: activeProject.nameKu || activeProject.name,
                  avatar: '📐'
                })}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{language === 'ku' ? 'کۆبوونەوەی بەپەلەی تێچوو' : 'Emergency Cost Review'}</span>
              </button>
            </div>
          </div>

          {/* AI Suggestions Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-black text-white">
                  {language === 'ku'
                    ? 'ڕاسپاردەکانی ژیری دەستکرد کە پێویستە بەڕێوەبەری پڕۆژە جێبەجێیان بکات:'
                    : 'AI-Generated Proactive Cost-Saving Directives for Project Manager:'}
                </h4>
              </div>

              {isGeneratingAI && (
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {language === 'ku' ? 'شیکردنەوەی داتای کڕین و دارایی بە Gemini...' : 'Analyzing Procurement & Finance...'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {(currentProjectAi?.suggestions || [
                {
                  id: 'opt-1',
                  title: 'Renegotiate Rebar Batch & Bulk Discount',
                  titleKu: 'نوێکردنەوەی دانوستان لەسەر نرخی کڕینی شیشی کۆنکرێتی بە کۆمەڵ',
                  domain: 'PROCUREMENT',
                  estimatedSavingsUSD: 140000,
                  impactLevel: 'CRITICAL',
                  timeframe: 'IMMEDIATE_48H',
                  relatedModuleContext: 'Procurement: PO-SAS-VTX-001 (High-Tensile Rebar)',
                  actionableStepsKu: [
                    'داواکردنی داشکاندنی ٨٪ لە کۆمپانیای دابینکەری کانی بەهۆی کڕینی قەبارەی زۆر',
                    'یەکخستنی داواکارییەکان لەگەڵ پڕۆژەکانی تری هۆلدینگ بۆ بەدەستهێنانی نرخی گروپ'
                  ]
                },
                {
                  id: 'opt-2',
                  title: 'Demobilize External Rig Leases & Switch to Group Fleet',
                  titleKu: 'کۆتاییهێنان بە کرێی مانگانەی ئامێری دەرەکی و بەکارهێنانی ئامێرەکانی هۆلدینگ',
                  domain: 'EQUIPMENT',
                  estimatedSavingsUSD: 115000,
                  impactLevel: 'HIGH',
                  timeframe: 'NEXT_14_DAYS',
                  relatedModuleContext: 'Procurement & Logistics: PO-SAS-VTX-002 ($235,000 rig lease)',
                  actionableStepsKu: [
                    'ڕاگرتنی نوێکردنەوەی کرێی ئامێری Bauer پاش کۆتاییهاتنی پێویستی لە مانگی داهاتوودا',
                    'گواستنەوەی ترێلە و ئامێرەکانی کۆمپانیای ڤێرتێکس لەبری کۆمپانیای بەکرێدەر'
                  ]
                },
                {
                  id: 'opt-3',
                  title: 'Optimize Night Shift Pouring & Reduce Overtime Premiums',
                  titleKu: 'ڕێکخستنەوەی کاتی کۆنکرێتڕێژی و کەمکردنەوەی پاداشتی شەوانە',
                  domain: 'FINANCE',
                  estimatedSavingsUSD: 75000,
                  impactLevel: 'HIGH',
                  timeframe: 'IMMEDIATE_48H',
                  relatedModuleContext: 'Finance Ledger: JV-2026-1089 ($94,800 labor disbursements)',
                  actionableStepsKu: [
                    'گۆڕینی کاتی کۆنکرێتڕێژی بۆ بەیانیانی زوو لەبری شەوی درەنگ بۆ کەمکردنەوەی ئۆڤەرتایم',
                    'کۆنترۆڵکردنی هاتنی لۆری کۆنکرێت تا کرێی چاوەڕوانی (Idle surcharges) نەدرێت'
                  ]
                },
                {
                  id: 'opt-4',
                  title: 'Freeze Secondary Discretionary Procurement & Enforce Warehouse Check',
                  titleKu: 'ڕاگرتنی کڕینی کەرەستەی لاوەکی و دابینکردن لە عەمباری ناوەندی',
                  domain: 'OPERATIONS',
                  estimatedSavingsUSD: 50000,
                  impactLevel: 'MEDIUM',
                  timeframe: 'NEXT_14_DAYS',
                  relatedModuleContext: 'Procurement & Warehouse Stock',
                  actionableStepsKu: [
                    'پێویستە بەڕێوەبەری پڕۆژە پێش هەر داواکارییەکی کڕین لە عەمباری ناوەندی بپشکنێت',
                    'ڕاگرتنی هەر خەرجییەکی لاوەکی تا ئەو کاتەی هاوسەنگی بودجە ئاسایی دەبێتەوە'
                  ]
                }
              ]).map((sug, i) => (
                <div
                  key={sug.id || i}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        sug.domain === 'PROCUREMENT'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                          : sug.domain === 'FINANCE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                            : sug.domain === 'EQUIPMENT'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      }`}>
                        {sug.domain}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        sug.impactLevel === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {sug.impactLevel} IMPACT
                      </span>
                    </div>

                    <span className="font-mono text-sm font-black text-emerald-300">
                      +${sug.estimatedSavingsUSD.toLocaleString()}
                    </span>
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold text-white">
                    {language === 'ku' ? sug.titleKu : sug.title}
                  </h5>

                  <div className="p-2.5 bg-black/30 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {language === 'ku' ? 'هەنگاوەکانی جێبەجێکردن بۆ بەڕێوەبەری پڕۆژە:' : 'Actionable Directives for PM:'}
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300 leading-relaxed">
                      {(sug.actionableStepsKu || sug.actionableStepsEn || []).map((step: string, sIdx: number) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="font-mono">{sug.relatedModuleContext}</span>
                    <span className="text-amber-300 font-bold">
                      {sug.timeframe === 'IMMEDIATE_48H' ? 'جێبەجێکردن لە ٤٨ کاتژمێردا' : 'لە ماوەی ١٤ ڕۆژدا'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row: Dispatch Directives to PM & GM */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-indigo-800/60">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-indigo-200">
                <input
                  type="checkbox"
                  checked={autoDispatchToManagers}
                  onChange={toggleAutoDispatch}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <span className="font-bold">
                  {language === 'ku'
                    ? 'ناردنی ئۆتۆماتیکی ڕاستەوخۆ بۆ بەڕێوەبەری پڕۆژە لە کاتی گەیشتن بە سنوور'
                    : 'Auto-dispatch to Project Managers on threshold'}
                </span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPreviewDirectiveOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{language === 'ku' ? 'بینینی دەقی فەرمانی بەڕێوەبەر' : 'Preview PM Directive'}</span>
              </button>

              <button
                type="button"
                onClick={handleDispatchDirectiveToManagers}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 transition transform active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isDispatched
                    ? (language === 'ku' ? 'دووبارە ناردنی ئاگاداری بۆ PM و GM' : 'Re-Dispatch Directives to PM')
                    : (language === 'ku' ? 'ناردنی دەستبەجێی ئاگادارکردنەوە بۆ بەڕێوەبەری پڕۆژە و کۆمپانیا' : 'Dispatch Directives to PM & GM')}
                </span>
              </button>
            </div>
          </div>

          {/* If Dispatched Status Strip */}
          {isDispatched && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {language === 'ku'
                    ? `فەرمانی کەمکردنەوەی تێچوو بە سەرکەوتوویی ئاراستەی بەڕێوەبەری پڕۆژە (${dispatchInfo.targetPm}) و بەڕێوەبەری گشتی (${dispatchInfo.targetGm}) کرا.`
                    : `Directives successfully dispatched to Project Manager (${dispatchInfo.targetPm}) & General Manager.`}
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400">
                {dispatchInfo.dispatchedAt.split('T')[0]} {dispatchInfo.dispatchedAt.split('T')[1]?.slice(0, 5)}
              </span>
            </div>
          )}

        </div>
      )}

      {/* MODAL 1: Directive Preview addressed to Project Manager */}
      {isPreviewDirectiveOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                  فەرمانی کارگێڕی فەرمی (EXECUTIVE DIRECTIVE)
                </span>
                <h3 className="text-base font-black text-slate-900">
                  ڕێنمایی کەمکردنەوەی خەرجی بۆ بەڕێوەبەری پڕۆژە
                </h3>
              </div>
              <button onClick={() => setIsPreviewDirectiveOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3 font-sans">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span><strong>بۆ:</strong> {activeProject.manager} (بەڕێوەبەری پڕۆژە)</span>
                <span><strong>کۆپی بۆ:</strong> {activeCompany?.generalManager} (بەڕێوەبەری گشتی)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span><strong>پڕۆژە:</strong> {activeProject.nameKu || activeProject.name}</span>
                <span className="text-rose-700 font-bold"><strong>ڕێژەی خەرجی:</strong> {burnRate}%</span>
              </div>

              <div>
                <p className="leading-relaxed text-slate-800">
                  {currentProjectAi?.managerDirectiveKu || `بەهۆی گەیشتنی خەرجییەکانی پڕۆژەکەتان بە ${burnRate}٪ی بودجەی تەرخانکراو، بەپێی شیکاری ژیری دەستکرد بۆ تۆماری کڕین و دارایی، فەرمانتان پێدەکرێت دەستبەجێ ئەم هەنگاوانە بگرنەبەر بۆ دەستەبەرکردنی $${(currentProjectAi?.totalSavingsUSD || 380000).toLocaleString()} پاشەکەوت.`}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <strong className="block text-slate-900">هەنگاوە ڕاسپێردراوەکان:</strong>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                  {(currentProjectAi?.suggestions || []).map((s, idx) => (
                    <li key={idx}><strong>{s.titleKu}:</strong> دەستکەوتی پاشەکەوت: ${s.estimatedSavingsUSD.toLocaleString()}</li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                ماوەی پابەندبوون: <strong>٤٨ کاتژمێر</strong> لە ساتی وەرگرتنی ئەم ئاگادارییە ئەلیکترۆنییەوە.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewDirectiveOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                داخستن
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDispatchDirectiveToManagers();
                  setIsPreviewDirectiveOpen(false);
                }}
                className="px-5 py-2.5 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ناردنی فەرمی بۆ بەڕێوەبەر</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Project Manager Commitment Signing Modal */}
      {isCommitmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-900 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    بەڵێننامەی فەرمی بەڕێوەبەری پڕۆژە (PM)
                  </h3>
                  <span className="text-[11px] text-slate-500">پابەندبوون بە پلانی کەمکردنەوەی تێچوو</span>
                </div>
              </div>
              <button onClick={() => setIsCommitmentModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2 text-emerald-950 font-sans">
              <p className="leading-relaxed">
                من وەک بەڕێوەبەری پڕۆژە (<strong>{activeProject.manager}</strong>) لە پڕۆژەی (<strong>{activeProject.nameKu || activeProject.name}</strong>)، بە فەرمی ڕایدەگەیەنم کە ڕاسپاردەکانی ژیری دەستکردم وەرگرت و پابەندم بە جێبەجێکردنی ئەم خاڵانەی خوارەوە بە هاوئاهەنگی بەڕێوەبەری گشتی کۆمپانیا:
              </p>
              <ul className="list-disc list-inside space-y-1 font-semibold text-emerald-900">
                <li>نوێکردنەوەی دانوستان لەسەر نرخی کڕینی شیشی بە کۆمەڵ لە تدارکات.</li>
                <li>کۆتاییهێنان بە کرێی ئامێرە دەرەکییەکان و بەکارهێنانی کەرەستەی هۆلدینگ.</li>
                <li>ڕێکخستنەوەی کاتی کۆنکرێتڕێژی بۆ کەمکردنەوەی ئۆڤەرتایمی شەوانە.</li>
                <li>بەستنی سەرجەم کڕینە لاوەکییە ناپێویستەکان تا گەیشتنەوە بە هاوسەنگی.</li>
              </ul>
              <div className="pt-2 font-mono text-emerald-800 font-bold border-t border-emerald-200 flex justify-between">
                <span>ئامانجی پاشەکەوت:</span>
                <span className="text-sm font-black text-emerald-700">+${(currentProjectAi?.totalSavingsUSD || 380000).toLocaleString()} USD</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCommitmentModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                پاشگەزبوونەوە
              </button>
              <button
                type="button"
                onClick={handleAcknowledgeCommitmentByPM}
                className="px-5 py-2.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
              >
                <Check className="w-4 h-4" />
                <span>واژۆکردن و ناردن بۆ بەڕێوەبەری گشتی</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
