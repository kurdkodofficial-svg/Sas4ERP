import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Bell,
  Globe,
  ScanLine,
  Video,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronDown,
  ShieldCheck,
  Crown,
  Settings,
  Upload,
  Radio,
  WifiOff,
  Printer,
  PenTool,
  CloudLightning,
  Wrench,
  BookOpen,
  Key,
  Menu,
  X,
  Send,
  Maximize2,
  Wallet,
  Download,
  SlidersHorizontal,
  User
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { HoldingMeshSyncHubModal } from './dashboard/HoldingMeshSyncHubModal';
import { ManagerFileDropdown } from './ManagerFileDropdown';
import { OwnerVerificationModal } from './OwnerVerificationModal';
import { PWAInstallButton } from './common/PWAInstallButton';
import { getRemainingTrialDays } from '../utils/licenseManager';
import { getUIText } from '../utils/langHelper';
import { KelegramApp } from './kelegram/KelegramApp';
import { checkIsMasterVendorOwner, checkIsHoldingOrItAdmin } from '../utils/rbacPermissions';
import { PLATFORM_VENDOR_OWNER_PROFILE } from '../data/initialData';
import { getApiUrl } from '../utils/apiConfig';
import { FirebaseOneClickConnect } from './FirebaseOneClickConnect';

export const Header: React.FC = () => {
  const {
    holding,
    companies,
    projects,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedProjectId,
    setSelectedProjectId,
    currentUser,
    setCurrentUser,
    userProfiles,
    purchaseOrders,
    notifications,
    markNotificationAsRead,
    setIsGateScannerOpen,
    setIsMeetingModalOpen,
    setIsImportModalOpen,
    setIsHoldingSetupOpen,
    setIsUserRolesModalOpen,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    setIsSignatureModalOpen,
    openPrintManager,
    printQueue,
    setIsCloudSyncModalOpen,
    holdingCloudSyncStatus,
    isSkylineBgEnabled,
    setIsSkylineModalOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isUserManualOpen,
    setIsUserManualOpen,
    openLicenseModal,
    isOwnerVerifyModalOpen,
    setIsOwnerVerifyModalOpen,
    systemLicense,
  } = useERP();

  const { language, setLanguage, t, isRtl } = useLanguage();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isMeshHubOpen, setIsMeshHubOpen] = useState(false);
  const [isKelegramQuickOpen, setIsKelegramQuickOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
        setIsLangMenuOpen(false);
        setIsNotifOpen(false);
        setIsToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeAllDropdowns = () => {
    setIsUserMenuOpen(false);
    setIsLangMenuOpen(false);
    setIsNotifOpen(false);
    setIsToolsMenuOpen(false);
  };

  const pendingApprovalsCount = purchaseOrders.filter(p => p.status === 'PENDING_OWNER_APPROVAL').length;

  const visibleNotifications = notifications.filter(notif => {
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'IT_ADMIN') return true;
    if (currentUser.role === 'HOLDING_OWNER') {
      if (notif.type === 'BUDGET_THRESHOLD_ALERT' && notif.targetRole !== 'HOLDING_OWNER') return false;
      return notif.targetRole === 'HOLDING_OWNER' || !notif.targetRole;
    }
    if (currentUser.role === 'WAREHOUSE_OFFICER') {
      return notif.targetRole === 'WAREHOUSE_OFFICER' || notif.type === 'GATE_ALERT' || !notif.targetRole;
    }
    if (currentUser.role === 'FINANCE_HEAD') {
      return notif.targetRole === 'FINANCE_HEAD' || notif.type === 'BUDGET_THRESHOLD_ALERT' || notif.type === 'FINANCE_ENTRY' || !notif.targetRole;
    }
    if (currentUser.role === 'PROJECT_MANAGER') {
      return notif.targetRole === 'PROJECT_MANAGER' || notif.type === 'PROJECT_ALERT' || notif.type === 'GATE_ALERT' || !notif.targetRole;
    }
    if (currentUser.role === 'COMPANY_GM') {
      return notif.targetRole === 'COMPANY_GM' || notif.targetRole === 'PROJECT_MANAGER' || notif.type === 'PROJECT_ALERT' || notif.type === 'GATE_ALERT' || !notif.targetRole;
    }
    return notif.targetRole === currentUser.role || !notif.targetRole;
  });

  const unreadNotifsCount = visibleNotifications.filter(n => !n.isRead).length;

  const filteredProjects = selectedCompanyId === 'ALL'
    ? projects
    : projects.filter(p => p.companyId === selectedCompanyId);

  const holdingDisplayName = language === 'ku' && holding.nameKu
    ? holding.nameKu
    : language === 'ar' && holding.nameAr
      ? holding.nameAr
      : holding.name;

  const isMasterVendorOwner = checkIsMasterVendorOwner(currentUser);
  const canManageHolding = checkIsHoldingOrItAdmin(currentUser);
  const activePrintJobs = printQueue.filter(j => j.status === 'QUEUED' || j.status === 'SPOOLING' || j.status === 'TRANSMITTING').length;

  const roleLabel = (role: string) => {
    switch (role) {
      case 'PLATFORM_OWNER':
        return language === 'ku' ? 'خاوەنی سەکۆ (سیستەمی ٢)' : 'Platform Owner';
      case 'HOLDING_OWNER':
        return language === 'ku' ? 'خاوەنی هۆڵدینگ' : 'Holding Owner';
      case 'IT_ADMIN':
        return language === 'ku' ? 'بەڕێوەبەری IT' : 'IT Administrator';
      case 'SUPER_ADMIN':
        return language === 'ku' ? 'بەڕێوەبەری باڵا' : 'Super Admin';
      case 'COMPANY_GM':
        return language === 'ku' ? 'بەڕێوەبەری گشتی' : 'General Manager';
      case 'PROJECT_MANAGER':
        return language === 'ku' ? 'بەڕێوەبەری پڕۆژە' : 'Project Manager';
      default:
        return role.replace(/_/g, ' ');
    }
  };

  const dropdownAlign = isRtl ? 'left-0' : 'right-0';

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 h-15 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900"
    >
      <div className="max-w-[1920px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Zone 1: Mobile Menu + Brand Wordmark */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Toggle Navigation Menu"
            id="mobile-nav-toggle-btn"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setActiveTab(isMasterVendorOwner ? 'vendor-license-hub' : 'holding-dashboard')}
            className="flex items-center gap-2.5 text-start transition hover:opacity-85 cursor-pointer min-w-0"
            id="brand-logo-btn"
          >
            {holding.logoUrl ? (
              <img
                src={holding.logoUrl}
                alt={holdingDisplayName || 'SAS ERP'}
                className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs tracking-wider shrink-0">
                SAS
              </div>
            )}
            <div className="min-w-0 leading-tight">
              <div className="font-bold text-sm tracking-tight text-slate-900 whitespace-nowrap">
                {holdingDisplayName || 'SAS ERP'}
              </div>
              <div className="text-[11px] text-slate-500 truncate max-w-[160px] sm:max-w-[200px]">
                {holdingDisplayName
                  ? (holding.chairmanName || 'SAS Enterprise ERP')
                  : t('setHoldingNamePrompt')}
              </div>
            </div>
          </button>
        </div>

        {/* Zone 2: Unified Scope Filters & Global Search */}
        {!isMasterVendorOwner && (
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-2xl">
            <div className="relative w-48 shrink-0">
              <select
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value);
                  setSelectedProjectId('ALL');
                }}
                className="w-full h-9 text-xs font-medium bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 rounded-lg px-3 pe-7 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white focus:outline-none appearance-none cursor-pointer transition"
                id="company-filter-select"
              >
                <option value="ALL">
                  {t('allCompanies')} ({companies.length})
                </option>
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {language === 'ku' && comp.nameKu ? comp.nameKu : language === 'ar' && comp.nameAr ? comp.nameAr : comp.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative w-44 shrink-0">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full h-9 text-xs font-medium bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 rounded-lg px-3 pe-7 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white focus:outline-none appearance-none cursor-pointer transition"
                id="project-filter-select"
              >
                <option value="ALL">
                  {t('allProjects')} ({filteredProjects.length})
                </option>
                {filteredProjects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {language === 'ku' && proj.nameKu ? proj.nameKu : language === 'ar' && proj.nameAr ? proj.nameAr : proj.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative flex-1 min-w-[160px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg ps-8 pe-3 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white focus:outline-none transition"
                id="global-search-input"
              />
            </div>
          </div>
        )}

        {/* Zone 3: Focused Executive Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Hidden/stable ID trigger for EntryLicenseVerificationGate fallback */}
          <button
            id="system-license-header-btn"
            onClick={() => openLicenseModal(isMasterVendorOwner ? 'generator' : 'activate')}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          >
            License
          </button>

          {/* System 2 Active Indicator (Strictly when logged in as Platform Owner) */}
          {isMasterVendorOwner && (
            <button
              onClick={() => setActiveTab('vendor-license-hub')}
              className={`h-9 px-3 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
                activeTab === 'vendor-license-hub'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              id="header-switch-to-vendor-btn"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'سیستەمی ٢ (خاوەن سەکۆ)' : 'System 2 (Vendor)'}</span>
            </button>
          )}

          {/* 1-Click Firebase Cloud Connect & Real-Time Sync */}
          <FirebaseOneClickConnect variant="header" />

          {/* Pending Owner Approvals Quick Counter (Clean semantic indicator when > 0) */}
          {!isMasterVendorOwner && pendingApprovalsCount > 0 && (
            <button
              onClick={() => setActiveTab('owner-approvals')}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition cursor-pointer whitespace-nowrap"
              id="owner-approval-header-badge"
            >
              <span className="tabular-nums font-mono">{pendingApprovalsCount}</span>
              <span>{language === 'ku' ? 'چاوەڕوانی واژۆ' : language === 'ar' ? 'بانتظار الموافقة' : 'Pending'}</span>
            </button>
          )}

          {/* Unified Quick Tools & Utilities Drawer (Consolidates 10+ tools cleanly) */}
          {!isMasterVendorOwner && (
            <div className="relative">
              <button
                onClick={() => {
                  const next = !isToolsMenuOpen;
                  closeAllDropdowns();
                  setIsToolsMenuOpen(next);
                }}
                className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer whitespace-nowrap ${
                  isToolsMenuOpen
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                id="header-quick-tools-btn"
                title={language === 'ku' ? 'ئامرازە خێراکان و ڕێکخستنەکان' : 'Workspace Tools'}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {language === 'ku' ? 'ئامرازەکان' : language === 'ar' ? 'الأدوات' : 'Tools'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${isToolsMenuOpen ? 'rotate-180' : 'text-slate-400'}`} />
              </button>

              {isToolsMenuOpen && (
                <div className={`absolute ${dropdownAlign} mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in duration-150`}>
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100 mb-1">
                    {language === 'ku' ? 'ئامرازە کارگێڕی و مەیدانییەکان' : 'Operations & Workspace Tools'}
                  </div>

                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        setIsGateScannerOpen(true);
                      }}
                      id="gate-scanner-header-btn"
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-start"
                    >
                      <ScanLine className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="flex-1 truncate">{t('scanReceiptBtn')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        setIsMeetingModalOpen(true);
                      }}
                      id="executive-meeting-header-btn"
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-start"
                    >
                      <Video className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="flex-1 truncate">{t('navVirtualMeetings')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        setIsImportModalOpen(true);
                      }}
                      id="bulk-import-header-btn"
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-start"
                    >
                      <Upload className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="flex-1 truncate">
                        {getUIText(language, { en: 'Import Excel / CSV Data', ku: 'هێنانی داتای Excel / CSV', ar: 'استيراد ملفات إكسل' })}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        setIsSignatureModalOpen(true);
                      }}
                      id="header-e-signature-btn"
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-start"
                    >
                      <PenTool className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="flex-1 truncate">
                        {getUIText(language, { en: 'E-Signature Studio', ku: 'ستۆدیۆی واژۆی ئەلیکترۆنی', ar: 'استوديو التوقيع الإلكتروني' })}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        openPrintManager(null);
                      }}
                      id="header-printer-station-btn"
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-start"
                    >
                      <Printer className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="flex-1 truncate">
                        {getUIText(language, { en: 'Print Manager', ku: 'بەڕێوەبەری چاپ و پرینتەر', ar: 'مدير الطباعة' })}
                      </span>
                      {activePrintJobs > 0 && (
                        <span className="text-[11px] font-mono text-slate-500 tabular-nums">{activePrintJobs}</span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        setIsUserManualOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-start"
                    >
                      <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="flex-1 truncate">
                        {language === 'ku' ? 'فایلی بەڕێوەبەر و Word ⇄ PDF' : 'Manager Dossier (Word ⇄ PDF)'}
                      </span>
                    </button>
                  </div>

                  <div className="my-1.5 border-t border-slate-100" />
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                    {language === 'ku' ? 'تۆڕ، ڕووکار و کۆپیکردن' : 'Sync & Environment'}
                  </div>

                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        setIsCloudSyncModalOpen(true);
                      }}
                      id="holding-cloud-sync-btn"
                      className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-start"
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <CloudLightning className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="truncate">{language === 'ku' ? 'سینکی هۆڵدینگ' : 'Holding Cloud Sync'}</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {holdingCloudSyncStatus.activeLaptops.length}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        setIsMeshHubOpen(true);
                      }}
                      id="mesh-network-hub-btn"
                      className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-start"
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        {isOnline ? <Radio className="w-4 h-4 text-slate-500 shrink-0" /> : <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />}
                        <span className="truncate">{isOnline ? (language === 'ku' ? 'تۆڕی خۆجێیی میش' : 'Local Mesh') : (language === 'ku' ? 'ئۆفلاین (میش)' : 'Offline Mesh')}</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {isOnline ? (language === 'ku' ? 'ئامادە' : 'Ready') : (language === 'ku' ? 'ئۆفلاین' : 'Offline')}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        setIsSkylineModalOpen(true);
                      }}
                      id="skyline-bg-modal-btn"
                      className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-start"
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="truncate">{language === 'ku' ? 'باکگراوندی ڕووکار' : 'Workspace Backdrop'}</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {isSkylineBgEnabled ? (language === 'ku' ? 'کراوە' : 'On') : (language === 'ku' ? 'کوژاوە' : 'Off')}
                      </span>
                    </button>

                    <a
                      href={getApiUrl('/api/export-codebase-zip')}
                      download="SAS4ERP-Full-Source-Code.zip"
                      onClick={() => setIsToolsMenuOpen(false)}
                      id="download-source-code-header-btn"
                      className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-start"
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Download className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="truncate">{language === 'ku' ? 'داگرتنی کۆدەکان (ZIP)' : 'Download Source (ZIP)'}</span>
                      </span>
                    </a>
                  </div>

                  <div className="pt-1.5 mt-1 border-t border-slate-100 px-1">
                    <PWAInstallButton />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Kelegram Quick Messenger Button */}
          {!isMasterVendorOwner && (
            <div className="relative">
              <button
                onClick={() => {
                  closeAllDropdowns();
                  setIsKelegramQuickOpen(prev => !prev);
                }}
                className={`w-9 h-9 rounded-lg border transition cursor-pointer flex items-center justify-center relative ${
                  isKelegramQuickOpen
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
                id="header-kelegram-quick-btn"
                title={language === 'ku' ? 'کەڵەگرام - پەیوەندی ناوخۆیی' : 'Kelegram Internal Messenger'}
              >
                <Send className="w-4 h-4" />
              </button>

              {isKelegramQuickOpen && (
                <div className="fixed inset-4 sm:inset-auto sm:top-16 sm:end-6 sm:w-[760px] sm:max-w-[calc(100vw-3rem)] z-50 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-150">
                  <div className="relative">
                    <div className="absolute top-2.5 right-12 z-50 flex items-center gap-1">
                      <button
                        onClick={() => {
                          setIsKelegramQuickOpen(false);
                          setActiveTab('direct-comms');
                        }}
                        className="p-1 rounded-lg bg-white/20 hover:bg-white/35 text-white transition text-xs flex items-center gap-1 font-medium px-2 cursor-pointer"
                        title="Open Full Screen Workspace"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="text-[11px] hidden sm:inline">
                          {language === 'ku' ? 'تەواوی شاشە' : 'Full Screen'}
                        </span>
                      </button>
                    </div>
                    <KelegramApp
                      isCompactMode={true}
                      onClose={() => setIsKelegramQuickOpen(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                const next = !isNotifOpen;
                closeAllDropdowns();
                setIsNotifOpen(next);
              }}
              className="relative w-9 h-9 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition cursor-pointer flex items-center justify-center"
              id="notifications-header-btn"
              title={language === 'ku' ? 'ئاگادارکردنەوەکان' : 'Notifications'}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -end-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-semibold tabular-nums flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className={`absolute ${dropdownAlign} mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 max-h-[460px] overflow-y-auto`}>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
                  <span className="text-xs font-semibold text-slate-900">
                    {language === 'ku' ? 'ئاگادارکردنەوەکانی هۆڵدینگ' : 'Holding Alerts'}
                  </span>
                  <span className="text-[11px] text-slate-500 tabular-nums">
                    {unreadNotifsCount} {language === 'ku' ? 'نەخوێندراوە' : 'Unread'}
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {visibleNotifications.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      {language === 'ku' ? 'هیچ ئاگادارییەکی نوێ نییە' : 'No new notifications'}
                    </div>
                  ) : (
                    visibleNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.type === 'BUDGET_THRESHOLD_ALERT') {
                            setActiveTab('companies-projects');
                            setIsNotifOpen(false);
                          } else if (notif.type === 'HARDWARE_ALERT') {
                            setActiveTab('it-systems');
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`py-2.5 px-2 rounded-lg text-xs cursor-pointer transition hover:bg-slate-50 ${
                          notif.isRead ? 'opacity-65' : 'bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0 text-slate-500">
                            {notif.type === 'GATE_ALERT' && <ScanLine className="w-4 h-4 text-emerald-600" />}
                            {notif.type === 'PROJECT_ALERT' && <Building2 className="w-4 h-4 text-slate-700" />}
                            {notif.type === 'FINANCE_ENTRY' && <Wallet className="w-4 h-4 text-slate-700" />}
                            {notif.type === 'OWNER_APPROVAL_REQUIRED' && <Crown className="w-4 h-4 text-amber-600" />}
                            {notif.type === 'EXPIRY_WARNING' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                            {notif.type === 'BUDGET_THRESHOLD_ALERT' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                            {notif.type === 'HARDWARE_ALERT' && <Wrench className="w-4 h-4 text-rose-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900">
                              {language === 'ku' && notif.titleKu ? notif.titleKu : language === 'ar' && notif.titleAr ? notif.titleAr : notif.title}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              {language === 'ku' && notif.messageKu ? notif.messageKu : language === 'ar' && notif.messageAr ? notif.messageAr : notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-mono">{notif.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                const next = !isLangMenuOpen;
                closeAllDropdowns();
                setIsLangMenuOpen(next);
              }}
              className="h-9 px-2.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
              id="language-switcher-btn"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="uppercase">{language}</span>
            </button>

            {isLangMenuOpen && (
              <div className={`absolute ${dropdownAlign} mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50`}>
                {[
                  { id: 'ku' as const, label: 'کوردی سۆرانی' },
                  { id: 'en' as const, label: 'English' },
                  { id: 'ar' as const, label: 'العربية' }
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setLanguage(lang.id);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition cursor-pointer ${
                      language === lang.id ? 'bg-slate-100 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {language === lang.id && <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile & Role Menu */}
          <div className="relative">
            <button
              onClick={() => {
                const next = !isUserMenuOpen;
                closeAllDropdowns();
                setIsUserMenuOpen(next);
              }}
              className="h-9 px-2 sm:px-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition cursor-pointer flex items-center gap-2"
              id="user-profile-menu-btn"
            >
              <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block text-start leading-tight">
                <div className="text-xs font-semibold truncate max-w-[110px] text-slate-900">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 truncate max-w-[110px]">{roleLabel(currentUser.role)}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className={`absolute ${dropdownAlign} mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50`}>
                {isMasterVendorOwner && (
                  <button
                    onClick={() => {
                      setActiveTab('vendor-license-hub');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer mb-2"
                  >
                    <span className="flex items-center gap-2">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'ku' ? 'پۆڕتاڵی لایسنس (سیستەمی ٢)' : 'Vendor License Hub (System 2)'}</span>
                    </span>
                  </button>
                )}

                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100 mb-1">
                  {language === 'ku' ? 'گۆڕینی هەژمار و ڕۆڵەکان' : 'Switch Active Role'}
                </div>

                <div className="space-y-0.5 max-h-60 overflow-y-auto">
                  {userProfiles.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-start transition cursor-pointer ${
                        currentUser.id === user.id
                          ? 'bg-slate-100 text-slate-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-900 truncate">{user.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{roleLabel(user.role)}</div>
                      </div>
                      {currentUser.id === user.id && <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 shrink-0" />}
                    </button>
                  ))}
                </div>

                {canManageHolding && (
                  <div className="pt-2 mt-2 border-t border-slate-100 space-y-0.5">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsUserRolesModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-start"
                    >
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                      <span>{getUIText(language, { en: 'Manage Roles & Permissions', ku: 'بەڕێوەبردنی ڕۆڵ و دەسەڵاتەکان', ar: 'إدارة الأدوار والصلاحيات' })}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveTab('it-systems');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-start"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>{getUIText(language, { en: 'Holding & IT Settings Hub', ku: 'ناوەندی ڕێکخستنی هۆڵدینگ و IT', ar: 'مركز إعدادات الهولدينغ و IT' })}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsHoldingSetupOpen(true);
                      }}
                      id="holding-config-btn"
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-start"
                    >
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span>{t('setupHoldingTitle')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openLicenseModal('activate');
                      }}
                      className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-start"
                    >
                      <span className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-slate-500" />
                        <span>{language === 'ku' ? 'ڕەوشی لایسنس و مۆڵەت' : 'License & Activation'}</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {systemLicense?.isPerpetual
                          ? 'VIP'
                          : systemLicense?.licenseType === 'EXPIRED'
                          ? 'Expired'
                          : `${getRemainingTrialDays(systemLicense?.expiresAt || '')}d`}
                      </span>
                    </button>
                  </div>
                )}

                {!isMasterVendorOwner && (
                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (typeof localStorage !== 'undefined' && localStorage.getItem('sas4erp_owner_session') === 'verified') {
                          setCurrentUser({
                            ...PLATFORM_VENDOR_OWNER_PROFILE,
                            verifiedAt: localStorage.getItem('sas4erp_owner_verified_at') || new Date().toISOString()
                          });
                        } else {
                          setIsOwnerVerifyModalOpen(true);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Key className="w-3 h-3" />
                      <span>{language === 'ku' ? 'دەروازەی خاوەنی سەکۆ (سیستەمی ٢)' : 'System Vendor Portal (System 2)'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Executive Manager File Panel (Triggered via Quick Tools, Sidebar, or Dashboard Resources) */}
      <ManagerFileDropdown
        isOpen={isUserManualOpen}
        onToggle={() => setIsUserManualOpen(prev => !prev)}
        onClose={() => setIsUserManualOpen(false)}
        hideTriggerButton={true}
      />

      <HoldingMeshSyncHubModal
        isOpen={isMeshHubOpen}
        onClose={() => setIsMeshHubOpen(false)}
      />

      <OwnerVerificationModal
        isOpen={isOwnerVerifyModalOpen}
        onClose={() => setIsOwnerVerifyModalOpen(false)}
      />
    </header>
  );
};
