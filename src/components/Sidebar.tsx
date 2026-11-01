import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Crown,
  Video,
  PhoneCall,
  ScanLine,
  Wallet,
  ShoppingCart,
  Boxes,
  Users,
  Home,
  ShieldAlert,
  Zap,
  Mail,
  Truck,
  FolderArchive,
  Cpu,
  ChevronRight,
  Sparkles,
  FileCheck2,
  BrainCircuit,
  CalendarRange,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { getUIText } from '../utils/langHelper';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    purchaseOrders,
    foreignWorkers,
    gateLogs,
    projectReports,
    anomalyAlerts,
    currentUser
  } = useERP();
  const { t, language, isRtl } = useLanguage();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sas4erp_sidebar_collapsed');
      if (saved !== null) return JSON.parse(saved);
      return false;
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sas4erp_sidebar_collapsed', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isTopManagement = currentUser.role === 'HOLDING_OWNER' || currentUser.role === 'SUPER_ADMIN';

  const pendingApprovalsCount = purchaseOrders.filter(p => p.status === 'PENDING_OWNER_APPROVAL').length;
  const expiringIqamasCount = foreignWorkers.filter(w => w.visaStatus === 'EXPIRING_SOON' || w.visaStatus === 'EXPIRED').length;
  const submittedReportsCount = (projectReports || []).filter(r => r.status === 'SUBMITTED_TO_UPPER_MANAGEMENT').length;
  const activeAnomaliesCount = (anomalyAlerts || []).filter(a => a.status === 'TRIGGERED' || a.status === 'INVESTIGATING').length;

  const navGroups = [
    {
      groupTitle: isTopManagement
        ? t('holdingGroup')
        : getUIText(language, { en: 'Branch Operational Portal', ku: 'پۆرتاڵی دەسەڵاتی لق و پڕۆژە', ar: 'بوابة الفرع والمشروع' }),
      items: [
        {
          id: 'holding-dashboard',
          label: isTopManagement
            ? t('navHoldingDashboard')
            : getUIText(language, { en: 'Branch & Site Portal', ku: 'پۆرتاڵی مەیدانی لق و پڕۆژە', ar: 'بوابة الفرع والمشروع' }),
          icon: LayoutDashboard,
          badge: isTopManagement ? null : (language === 'ku' ? 'لق' : 'BRANCH'),
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        },
        {
          id: 'procurement',
          label: isTopManagement
            ? t('navProcurement')
            : getUIText(language, { en: 'My Requests & Signatures', ku: 'داواکارییەکانم و بەدواداچوونی واژۆ', ar: 'طلباتي ومتابعة التواقيع' }),
          icon: isTopManagement ? ShoppingCart : FileCheck2,
          badge: isTopManagement ? null : (language === 'ku' ? 'چاودێری' : 'TRACK'),
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
        },
        {
          id: 'ml-anomaly-detection',
          label: getUIText(language, {
            en: 'AI Anomaly Sentinel (ML Sentinel)',
            ku: 'چاودێری ژیری دەستکرد (ML Sentinel)',
            ar: 'مراقبة الذكاء الاصطناعي (ML Sentinel)'
          }),
          icon: BrainCircuit,
          badge: activeAnomaliesCount > 0 ? `${activeAnomaliesCount} ALERT` : 'AI',
          badgeColor: activeAnomaliesCount > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        },
        {
          id: 'owner-approvals',
          label: isTopManagement
            ? t('navOwnerApprovals')
            : getUIText(language, { en: 'Holding Approvals (Executive)', ku: 'واژۆی سەرۆکایەتی (سەرەوە)', ar: 'موافقات الرئاسة (الإدارة العليا)' }),
          icon: Crown,
          badge: isTopManagement
            ? (pendingApprovalsCount > 0 ? pendingApprovalsCount : null)
            : '🔒 سەرەوە',
          badgeColor: isTopManagement
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            : 'bg-slate-700 text-slate-300 border-slate-600'
        },
        { id: 'virtual-meetings', label: t('navVirtualMeetings'), icon: Video, badge: 'LIVE', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' },
        { id: 'direct-comms', label: t('navContactManagers'), icon: PhoneCall, badge: null },
        { id: 'companies-projects', label: t('navCompaniesProjects'), icon: Building2, badge: null },
        {
          id: 'project-reports',
          label: getUIText(language, {
            en: 'Gantt & Project Reports',
            ku: 'مخطەتی گانت و ڕاپۆرتەکان',
            ar: 'مخطط جانت والتقارير'
          }),
          icon: CalendarRange,
          badge: submittedReportsCount > 0 ? submittedReportsCount : 'GANTT',
          badgeColor: submittedReportsCount > 0 ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
        },
      ]
    },
    {
      groupTitle: getUIText(language, {
        en: 'Core Operations & Automation',
        ku: 'ئۆپەراسیۆنە سەرەکییەکان و ئۆتۆمەیشن',
        ar: 'العمليات الأساسية والأتمتة'
      }),
      items: [
        { id: 'gate-scanner', label: t('navGateScanner'), icon: ScanLine, badge: 'AUTO', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
        { id: 'procurement', label: t('navProcurement'), icon: ShoppingCart, badge: null },
        { id: 'finance', label: t('navFinance'), icon: Wallet, badge: null },
        { id: 'warehouse', label: t('navWarehouse'), icon: Boxes, badge: null },
        { id: 'dispatch-logistics', label: t('navDispatchLogistics'), icon: Truck, badge: null },
      ]
    },
    {
      groupTitle: getUIText(language, {
        en: 'Field, Safety & Infrastructure',
        ku: 'مەیدانی، سەلامەتی و ژێرخان',
        ar: 'الميدان والسلامة والبنية التحتية'
      }),
      items: [
        { id: 'technical-electrical', label: t('navTechnicalElectrical'), icon: Zap, badge: null },
        { id: 'camps-accommodation', label: t('navAccommodation'), icon: Home, badge: null },
        { id: 'hse-fire-security', label: t('navHseSecurity'), icon: ShieldAlert, badge: null },
      ]
    },
    {
      groupTitle: getUIText(language, {
        en: 'People, Legal & Administration',
        ku: 'کارمەندان، یاسایی و کارگێڕی',
        ar: 'الموارد البشرية والشؤون القانونية والإدارة'
      }),
      items: [
        { id: 'foreign-workers', label: t('navForeignWorkers'), icon: Users, badge: expiringIqamasCount > 0 ? expiringIqamasCount : null, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
        { id: 'hr-payroll', label: t('navHrPayroll'), icon: Users, badge: null },
        { id: 'correspondence', label: t('navCorrespondence'), icon: Mail, badge: null },
        { id: 'doc-archive', label: t('navDocArchive'), icon: FolderArchive, badge: null },
        { id: 'it-systems', label: t('navItSystems'), icon: Cpu, badge: null },
      ]
    }
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64 sm:w-72'
      } bg-[#0F172A] border-r border-slate-800/90 flex flex-col shrink-0 h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto transition-all duration-300 ease-in-out z-30`}
    >
      {/* Sidebar Header with Collapse Toggle */}
      <div className={`p-2.5 border-b border-slate-800/80 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-2">
            {getUIText(language, { en: 'Holding Navigation', ku: 'مێنیوی هۆلدینگ', ar: 'قائمة المجموعة' })}
          </span>
        )}
        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          title={isCollapsed ? (isRtl ? 'فراوانکردنی مێنیو' : 'Expand Sidebar') : (isRtl ? 'بچووککردنەوەی مێنیو' : 'Collapse Sidebar')}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-amber-400" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-slate-300" />
          )}
        </button>
      </div>

      <div className={`${isCollapsed ? 'p-2' : 'p-3.5'} space-y-5 flex-1`}>
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400/90">
                {group.groupTitle}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    id={`sidebar-nav-${item.id}`}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                    } rounded-xl text-xs font-semibold transition-all group cursor-pointer relative ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {item.badge && !isCollapsed && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}

                    {item.badge && isCollapsed && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Holding Owner Direct Access Banner (Collapsible) */}
      {!isCollapsed ? (
        <div className="p-3.5 border border-slate-800/80 bg-slate-950/60 m-2.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">
              {getUIText(language, {
                en: 'Owner Gatekeeper Active',
                ku: 'دەروازەی خاوەنی هۆلدینگ چالاکە',
                ar: 'بوابة مالك المجموعة نشطة'
              })}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            {getUIText(language, {
              en: 'Centralized pre-approval gate & triple sync scanner protecting holding assets.',
              ku: 'دەروازەی پەسەندکردنی پێشوەختە و سکانی سێقۆڵی پارێزەری سەروەت و سامانی هۆلدینگ.',
              ar: 'بوابة الموافقة المسبقة المركزية والماسح الثلاثي لحماية أصول المجموعة.'
            })}
          </p>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-800 flex justify-center pb-3">
          <button
            onClick={() => setActiveTab('owner-approvals')}
            className="p-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition cursor-pointer"
            title={getUIText(language, { en: 'Owner Approvals', ku: 'پەسەندکردنی خاوەن', ar: 'موافقات المالك' })}
          >
            <Crown className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
