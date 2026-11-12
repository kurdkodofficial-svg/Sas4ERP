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
  Activity,
  ChevronRight,
  Sparkles,
  FileCheck2,
  BrainCircuit,
  CalendarRange,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  FileText,
  BookOpen,
  Download,
  Key,
  Send
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { getUIText } from '../utils/langHelper';
import { hasModuleAccess, checkIsMasterVendorOwner } from '../utils/rbacPermissions';
import { getRemainingTrialDays } from '../utils/licenseManager';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    purchaseOrders,
    foreignWorkers,
    gateLogs,
    projectReports,
    anomalyAlerts,
    currentUser,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    setIsUserManualOpen,
    openLicenseModal,
    setIsOwnerVerifyModalOpen,
    systemLicense
  } = useERP();
  const { t, language, isRtl } = useLanguage();

  const isMasterVendorOwner = checkIsMasterVendorOwner(currentUser);

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
        ...(isMasterVendorOwner ? [{
          id: 'vendor-license-hub',
          label: language === 'ku' ? '👑 پۆڕتاڵی لایسنس (سیستەمی ٢)' : language === 'ar' ? '👑 إدارة التراخيص (النظام ٢)' : '👑 Vendor License Hub',
          icon: Crown,
          badge: 'OWNER',
          badgeColor: 'bg-amber-400 text-slate-950 border-amber-300 font-black'
        }] : []),
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
        {
          id: 'direct-comms',
          label: getUIText(language, {
            en: 'Kelegram (Telegram Messenger)',
            ku: 'کەڵەگرام (Kelegram)',
            ar: 'كَلَغرام (Kelegram)'
          }),
          icon: Send,
          badge: 'TELEGRAM',
          badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
        },
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
        {
          id: 'it-systems',
          label: getUIText(language, { en: 'IT Systems, Latency & Sync', ku: 'ئایتی، چاودێری تۆڕ و سینک', ar: 'أنظمة IT وسرعة الاتصال والمزامنة' }),
          icon: Activity,
          badge: 'PING RADAR',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        },
      ]
    }
  ];

  // Filter navigation items by currentUser role & custom permissions (RBAC)
  const visibleNavGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => hasModuleAccess(currentUser, item.id))
    }))
    .filter(group => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
        />
      )}

      <aside
        className={`fixed md:sticky top-[61px] left-0 md:left-auto ${
          isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${
          isCollapsed ? 'md:w-16' : 'md:w-64 sm:w-72'
        } bg-[#0F172A] border-r border-slate-800/90 flex flex-col shrink-0 h-[calc(100vh-61px)] overflow-y-auto transition-all duration-300 ease-in-out z-50 md:z-30 shadow-2xl md:shadow-none`}
      >
        {/* Sidebar Header with Collapse Toggle & Mobile Close */}
        <div className={`p-2.5 border-b border-slate-800/80 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 pl-2">
              {getUIText(language, { en: 'Holding Navigation', ku: 'مێنیوی هۆلدینگ', ar: 'قائمة المجموعة' })}
            </span>
          )}

          <div className="flex items-center gap-1">
            {/* Close button on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white md:hidden cursor-pointer"
              title="Close menu"
            >
              <X className="w-4 h-4 text-amber-400" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={toggleCollapsed}
              className="hidden md:flex p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title={isCollapsed ? (isRtl ? 'فراوانکردنی مێنیو' : 'Expand Sidebar') : (isRtl ? 'بچووککردنەوەی مێنیو' : 'Collapse Sidebar')}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-amber-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-slate-300" />
              )}
            </button>
          </div>
        </div>

        <div className={`${isCollapsed ? 'p-2' : 'p-3.5'} space-y-5 flex-1`}>
          {/* Executive Manager File (فایلی بەڕێوەبەر) - Only for Managers & Holding Owner */}
          {(currentUser.role === 'HOLDING_OWNER' || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'COMPANY_GM' || currentUser.role === 'PROJECT_MANAGER') && (
            <div className="space-y-2 mb-3">
              <button
                onClick={() => {
                  setIsUserManualOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                id="sidebar-pinned-manual-btn"
                title={getUIText(language, {
                  en: 'Executive Manager File, Powers & Documentation (Word ⇄ PDF)',
                  ku: 'فایلی فەرمی بەڕێوەبەر: ڕێنمایی، دەسەڵاتەکان و دۆکیومێنت (Word ⇄ PDF)',
                  ar: 'ملف المدير التنفيذي: الصلاحيات والتوثيق (Word ⇄ PDF)'
                })}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                } rounded-2xl text-xs font-black transition-all cursor-pointer relative bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md shadow-indigo-900/30 border-2 border-amber-400/80 ring-2 ring-amber-400/20 transform active:scale-95 group`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-4 h-4 shrink-0 text-amber-300 animate-pulse" />
                  {!isCollapsed && (
                    <span className="truncate tracking-wide font-extrabold text-amber-100">
                      {language === 'ku'
                        ? '📁 فایلی بەڕێوەبەر (Word/PDF)'
                        : language === 'ar'
                        ? '📁 ملف المدير (Word/PDF)'
                        : '📁 Manager File (Word/PDF)'}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black font-mono shadow-2xs">
                    {language === 'ku' ? 'بەڕێوەبەر' : language === 'ar' ? 'مدير' : 'MGR'}
                  </span>
                )}
              </button>
            </div>
          )}

            {/* License & Key Generator Section:
                If Owner / ME: Shows the dedicated "Platform Owner Vendor Hub (System 2)" + Modal button
                If Subscriber / Client: Vendor Hub is completely HIDDEN; only client license status is shown */}
            {isMasterVendorOwner ? (
              <div className="space-y-1.5">
                {/* System 2: Platform Owner Command Center Navigation Item */}
                <button
                  onClick={() => {
                    setActiveTab('vendor-license-hub');
                    setIsMobileMenuOpen(false);
                  }}
                  id="sidebar-vendor-license-hub-btn"
                  title={getUIText(language, {
                    en: 'Platform Owner: License Command Hub & Monthly Renewals',
                    ku: 'خاوەنی سەکۆ: پۆڕتاڵی لایسنس و نوێکردنەوەی مانگانەی کڕیاران',
                    ar: 'مالك المنصة: بوابة إدارة وتجديد التراخيص الشهرية'
                  })}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                  } rounded-2xl text-xs font-black transition-all cursor-pointer relative ${
                    activeTab === 'vendor-license-hub'
                      ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 shadow-xl border-2 border-amber-300 ring-2 ring-amber-400/40'
                      : 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white shadow-lg border-2 border-amber-400 hover:border-amber-300'
                  } transform active:scale-95 group`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                      activeTab === 'vendor-license-hub' ? 'bg-slate-950 text-amber-400' : 'bg-amber-400 text-slate-950'
                    }`}>
                      <Crown className="w-4 h-4 animate-pulse" />
                    </div>
                    {!isCollapsed && (
                      <div className="flex flex-col items-start text-right leading-tight truncate">
                        <span className={`truncate tracking-wide font-black text-xs ${
                          activeTab === 'vendor-license-hub' ? 'text-slate-950' : 'text-amber-300'
                        }`}>
                          {language === 'ku' ? '👑 پۆڕتاڵی لایسنس (خاوەن)' : language === 'ar' ? '👑 بوابة التراخيص (المالك)' : '👑 Vendor License Hub'}
                        </span>
                        <span className={`text-[10px] font-mono truncate font-semibold ${
                          activeTab === 'vendor-license-hub' ? 'text-slate-800' : 'text-amber-200/90'
                        }`}>
                          {language === 'ku' ? 'تایبەت بە من (سیستەمی ٢)' : language === 'ar' ? 'خاص بي (النظام ٢)' : 'Owner Only (System 2)'}
                        </span>
                      </div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-black ${
                      activeTab === 'vendor-license-hub' ? 'bg-slate-950 text-amber-400' : 'bg-amber-400 text-slate-950'
                    }`}>
                      OWNER
                    </span>
                  )}
                </button>

                {/* Quick Key Activation / Check Popup */}
                <button
                  onClick={() => {
                    openLicenseModal('generator');
                    setIsMobileMenuOpen(false);
                  }}
                  id="sidebar-pinned-license-btn"
                  title={getUIText(language, {
                    en: 'Open License Modal',
                    ku: 'کردنەوەی پەنجەرەی کلیل',
                    ar: 'فتح نافذة المفاتيح'
                  })}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
                  } rounded-xl text-xs font-bold transition-all cursor-pointer relative bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transform active:scale-95 group`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    {!isCollapsed && (
                      <span className="text-[11px] truncate">
                        {language === 'ku' ? 'پەنجەرەی کاراکردنی کلیل' : 'License Key Modal'}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className="text-[9px] text-amber-400/80 font-mono">
                      POPUP
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openLicenseModal('activate');
                  setIsMobileMenuOpen(false);
                }}
                id="sidebar-pinned-license-btn"
                title={getUIText(language, {
                  en: 'Node License Status',
                  ku: 'ڕەوشی لایسنس و مۆڵەتی ئامێر',
                  ar: 'حالة ترخيص الجهاز'
                })}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                } rounded-2xl text-xs font-black transition-all cursor-pointer relative bg-slate-900 text-white shadow-md border border-slate-700/80 hover:bg-slate-800 transform active:scale-95 group`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  {!isCollapsed && (
                    <div className="flex flex-col items-start text-right leading-tight truncate">
                      <span className="truncate tracking-wide font-bold text-slate-200 text-xs">
                        {language === 'ku' ? 'ڕەوشی لایسنس' : language === 'ar' ? 'حالة الترخيص' : 'License Status'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono truncate font-semibold">
                        {systemLicense?.licenseType === 'COMMERCIAL_ACTIVE' || systemLicense?.isPerpetual
                          ? 'چالاک (بازرگانی)'
                          : systemLicense?.licenseType === 'EXPIRED'
                          ? 'بەسەرچووە'
                          : `تاقیکردنەوە (${getRemainingTrialDays(systemLicense?.expiresAt || '')} ڕۆژ)`}
                      </span>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                    systemLicense?.isPerpetual || systemLicense?.licenseType === 'COMMERCIAL_ACTIVE'
                      ? 'bg-emerald-500 text-white'
                      : systemLicense?.licenseType === 'EXPIRED'
                      ? 'bg-rose-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}>
                    {systemLicense?.isPerpetual ? 'ACTIVE' : `${getRemainingTrialDays(systemLicense?.expiresAt || '')}d`}
                  </span>
                )}
              </button>
            )}

            {/* Quick Owner Verification Link if not verified */}
            {(!currentUser?.isOwnerVerified && (typeof localStorage === 'undefined' || localStorage.getItem('sas4erp_owner_session') !== 'verified')) && (
              <button
                onClick={() => {
                  setIsOwnerVerifyModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
                } rounded-xl text-xs font-bold transition-all cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/30 group`}
                title="مسۆگەرکردنی خاوەنی سەکۆ (kurdkodofficial@gmail.com)"
              >
                <div className="flex items-center gap-2 truncate">
                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {!isCollapsed && (
                    <span className="text-[11px] truncate">
                      {language === 'ku' ? 'مسۆگەرکردنی خاوەن' : 'Owner OTP Verify'}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded font-mono">
                    OTP
                  </span>
                )}
              </button>
            )}

          {visibleNavGroups.map((group, idx) => (
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
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
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

      {/* Role-Specific Portal Badge (Collapsible) */}
      {!isCollapsed ? (
        <div className="p-3.5 border border-slate-800/80 bg-slate-950/60 m-2.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-1.5">
            {currentUser.role === 'HOLDING_OWNER' ? (
              <Crown className="w-4 h-4 text-amber-400" />
            ) : currentUser.role === 'COMPANY_GM' ? (
              <Building2 className="w-4 h-4 text-blue-400" />
            ) : currentUser.role === 'PROJECT_MANAGER' ? (
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Users className="w-4 h-4 text-slate-300" />
            )}
            <span className="text-xs font-bold text-slate-200 truncate">
              {currentUser.role === 'HOLDING_OWNER'
                ? getUIText(language, { en: 'Owner Gatekeeper Active', ku: 'دەروازەی خاوەنی هۆلدینگ', ar: 'بوابة مالك المجموعة نشطة' })
                : currentUser.role === 'COMPANY_GM'
                ? getUIText(language, { en: 'General Manager Portal', ku: 'پۆرتاڵی بەڕێوەبەری گشتی (GM)', ar: 'بوابة المدير العام للشركة' })
                : currentUser.role === 'PROJECT_MANAGER'
                ? getUIText(language, { en: 'Project Manager Portal', ku: 'پۆرتاڵی بەڕێوەبەری پرۆژە (PM)', ar: 'بوابة مدير المشروع' })
                : currentUser.role === 'EMPLOYEE'
                ? getUIText(language, { en: 'Employee Self-Service', ku: 'خزمەتگوزاری کارمەند (Employee)', ar: 'بوابة الموظف' })
                : getUIText(language, { en: 'Authorized Workspace', ku: 'بەشی ڕێگەپێدراوی کارمەند', ar: 'مساحة العمل المصرحة' })}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            {currentUser.role === 'HOLDING_OWNER'
              ? getUIText(language, {
                  en: 'Centralized pre-approval gate & triple sync scanner protecting holding assets.',
                  ku: 'دەروازەی پەسەندکردنی پێشوەختە و سکانی سێقۆڵی پارێزەری سەروەت و سامانی هۆلدینگ.',
                  ar: 'بوابة الموافقة المسبقة المركزية والماسح الثلاثي لحماية أصول المجموعة.'
                })
              : getUIText(language, {
                  en: 'Role-based access applied. You have visibility only to authorized company and project modules.',
                  ku: 'دەسەڵاتی ڕۆڵ جێبەجێکراوە. تەنها ئەو بەشانە دەبینیت کە بەستراونەتەوە بە ئەرکەکەت.',
                  ar: 'تم تطبيق صلاحيات الدور. يمكنك رؤية الأقسام المخصصة لاختصاصك فقط.'
                })}
          </p>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-800 flex justify-center pb-3">
          <button
            onClick={() => {
              if (hasModuleAccess(currentUser, 'owner-approvals')) {
                setActiveTab('owner-approvals');
              } else if (hasModuleAccess(currentUser, 'procurement')) {
                setActiveTab('procurement');
              }
            }}
            className="p-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition cursor-pointer"
            title={getUIText(language, { en: 'Authorized Module', ku: 'بەشی چالاک', ar: 'القسم المصرح' })}
          >
            <Crown className="w-4 h-4" />
          </button>
        </div>
      )}
      </aside>
    </>
  );
};
