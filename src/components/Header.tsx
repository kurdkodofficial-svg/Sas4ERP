import React, { useState, useEffect } from 'react';
import {
  Building2,
  Bell,
  Globe,
  ScanLine,
  Video,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronDown,
  Layers,
  Sparkles,
  ShieldCheck,
  Crown,
  Settings,
  Upload,
  Database,
  Radio,
  Wifi,
  WifiOff,
  Printer,
  PenTool,
  CloudLightning,
  Wrench,
  BookOpen,
  FileText,
  Key,
  Lock,
  Unlock,
  Menu,
  X,
  Send,
  Maximize2,
  Boxes,
  Wallet,
  Download
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { Language, UserProfile } from '../types/erp';
import { HoldingMeshSyncHubModal } from './dashboard/HoldingMeshSyncHubModal';
import { ManagerFileDropdown } from './ManagerFileDropdown';
import { LicenseActivationModal } from './LicenseActivationModal';
import { OwnerVerificationModal } from './OwnerVerificationModal';
import { PWAInstallButton } from './common/PWAInstallButton';
import { getStoredSystemLicense, SystemLicenseInfo, getRemainingTrialDays } from '../utils/licenseManager';
import { getUIText } from '../utils/langHelper';
import { KelegramApp } from './kelegram/KelegramApp';
import { checkIsMasterVendorOwner } from '../utils/rbacPermissions';
import { getApiUrl } from '../utils/apiConfig';

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
    startCallWithManager,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    setIsPrinterModalOpen,
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
    isLicenseModalOpen,
    setIsLicenseModalOpen,
    licenseModalInitialTab,
    openLicenseModal,
    isOwnerVerifyModalOpen,
    setIsOwnerVerifyModalOpen,
    systemLicense,
    setSystemLicense,
  } = useERP();

  const { language, setLanguage, userNativeLanguage, setUserNativeLanguage, t, isRtl } = useLanguage();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMeshHubOpen, setIsMeshHubOpen] = useState(false);
  const [isKelegramQuickOpen, setIsKelegramQuickOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

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

  const pendingApprovalsCount = purchaseOrders.filter(p => p.status === 'PENDING_OWNER_APPROVAL').length;
  
  // Targeted notification filtering:
  // Shows notifications relevant to the active role (Warehouse, Finance, PM/GM, Owner)
  const visibleNotifications = notifications.filter(notif => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
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

  const currentCompany = companies.find(c => c.id === selectedCompanyId);
  const filteredProjects = selectedCompanyId === 'ALL'
    ? projects
    : projects.filter(p => p.companyId === selectedCompanyId);

  const holdingDisplayName = language === 'ku' && holding.nameKu
    ? holding.nameKu
    : language === 'ar' && holding.nameAr
      ? holding.nameAr
      : holding.name;

  const isMasterVendorOwner = checkIsMasterVendorOwner(currentUser);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 shadow-xs">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Holding Logo + Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-max">
          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer shadow-xs flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
            id="mobile-nav-toggle-btn"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-amber-400" /> : <Menu className="w-4 h-4 text-white" />}
          </button>

          <button
            onClick={() => setActiveTab('holding-dashboard')}
            className="flex items-center gap-2.5 group text-left transition-all hover:opacity-90 cursor-pointer"
            id="brand-logo-btn"
          >
            {holding.logoUrl ? (
              <img
                src={holding.logoUrl}
                alt="Holding Logo"
                className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200 shadow-md group-hover:scale-105 transition-transform p-0.5"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 flex items-center justify-center shadow-md shadow-blue-600/20 text-white font-extrabold text-lg tracking-wider border border-blue-400/30 group-hover:scale-105 transition-transform">
                SAS
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  SAS ERP
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  SYSTEM
                </span>
              </div>
              <p className="text-xs text-slate-600 font-bold truncate max-w-[180px] sm:max-w-[220px]">
                {holdingDisplayName || (
                  <span className="text-amber-600 font-medium">{t('setHoldingNamePrompt')}</span>
                )}
              </p>
            </div>
          </button>

          {/* Edit Holding Button */}
          <button
            onClick={() => setIsHoldingSetupOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold transition cursor-pointer shadow-2xs"
            title={t('setupHoldingTitle')}
            id="holding-config-btn"
          >
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">
              {holding.chairmanName
                ? `${holding.chairmanName} (${getUIText(language, { en: 'Chairman', ku: 'خاوەن', ar: 'المالك' })})`
                : t('setOwnerNamePrompt')}
            </span>
          </button>
        </div>

        {/* Middle: Company & Project Selectors + Global Search */}
        <div className="hidden lg:flex items-center gap-2.5 flex-1 max-w-2xl">
          {/* Company Selector */}
          <div className="relative flex-1 max-w-[240px]">
            <select
              value={selectedCompanyId}
              onChange={(e) => {
                setSelectedCompanyId(e.target.value);
                setSelectedProjectId('ALL');
              }}
              className="w-full text-xs font-semibold bg-slate-100/90 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none appearance-none cursor-pointer pr-8 shadow-2xs"
              id="company-filter-select"
            >
              <option value="ALL">🏢 {t('allCompanies')} ({companies.length})</option>
              {companies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {language === 'ku' && comp.nameKu ? comp.nameKu : language === 'ar' && comp.nameAr ? comp.nameAr : comp.name} ({comp.code})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Project Selector */}
          <div className="relative flex-1 max-w-[220px]">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-100/90 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none appearance-none cursor-pointer pr-8 shadow-2xs"
              id="project-filter-select"
            >
              <option value="ALL">📐 {t('allProjects')} ({filteredProjects.length})</option>
              {filteredProjects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {language === 'ku' && proj.nameKu ? proj.nameKu : language === 'ar' && proj.nameAr ? proj.nameAr : proj.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-100/90 hover:bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition shadow-2xs"
              id="global-search-input"
            />
          </div>
        </div>

        {/* Right: Quick Action Buttons & Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Universal Data / File Import Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition transform active:scale-95 cursor-pointer"
            id="bulk-import-header-btn"
            title={getUIText(language, {
              en: 'Import Excel/CSV legacy records and batch files',
              ku: 'هاوردەکردنی بەکۆمەڵی فایلی Excel/CSV و داتای پێشوو',
              ar: 'استيراد السجلات والملفات المجمعة بصيغة إكسل'
            })}
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {getUIText(language, { en: 'Import Data', ku: 'هێنانی فایلی کۆن', ar: 'استيراد ملفات' })}
            </span>
          </button>

          {/* Main Gate Scanner Quick Trigger */}
          <button
            onClick={() => setIsGateScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition transform active:scale-95 cursor-pointer"
            id="gate-scanner-header-btn"
            title="Scan Delivery Barcode / Invoice"
          >
            <ScanLine className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">{t('scanReceiptBtn')}</span>
          </button>

          {/* Virtual Meeting Hub Quick Button */}
          <button
            onClick={() => setIsMeetingModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition transform active:scale-95 cursor-pointer"
            id="executive-meeting-header-btn"
            title="Start / Join Virtual Meeting"
          >
            <Video className="w-4 h-4" />
            <span className="hidden md:inline">{t('navVirtualMeetings')}</span>
          </button>

          {/* Kelegram (کەڵەگرام) Telegram Recreation Header Launcher */}
          <div className="relative">
            <button
              onClick={() => setIsKelegramQuickOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2AABEE] hover:bg-[#229ED9] text-white shadow-sm transition transform active:scale-95 cursor-pointer relative"
              id="header-kelegram-quick-btn"
              title={getUIText(language, {
                en: 'Kelegram (کەڵەگرام) - Enterprise Telegram Recreation (Voice notes, channels, groups & bots)',
                ku: 'کەڵەگرام - تەلەگرامی ناوخۆیی هۆلدینگ بە تەواوی تایبەتمەندی دەنگ، کەناڵ، گروپ و بۆت',
                ar: 'كَلَغرام (Kelegram) - تطبيق التلغرام المؤسسي المتكامل'
              })}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <Send className="w-3.5 h-3.5 -rotate-45 -translate-y-0.5 translate-x-0.5 text-white" />
              </div>
              <span className="font-extrabold tracking-wide">
                {language === 'ku' ? 'کەڵەگرام' : language === 'ar' ? 'كَلَغرام' : 'Kelegram'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-300 absolute -top-0.5 -right-0.5 border border-white" />
              <span className="bg-white/25 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                3
              </span>
            </button>

            {/* Quick Telegram Floating Window from Header */}
            {isKelegramQuickOpen && (
              <div
                className="fixed inset-4 sm:inset-auto sm:top-14 sm:right-6 sm:w-[760px] sm:max-w-[calc(100vw-3rem)] z-50 shadow-2xl rounded-3xl animate-in zoom-in-95 duration-200"
              >
                <div className="relative">
                  {/* Maximize to full page button */}
                  <div className="absolute top-2.5 right-12 z-50 flex items-center gap-1">
                    <button
                      onClick={() => {
                        setIsKelegramQuickOpen(false);
                        setActiveTab('direct-comms');
                      }}
                      className="p-1 rounded-lg bg-white/20 hover:bg-white/40 text-white transition text-xs flex items-center gap-1 font-bold px-2 cursor-pointer"
                      title="Open Full Screen Workspace"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] hidden sm:inline">
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

          {/* Electronic Signature Studio Header Trigger */}
          <button
            onClick={() => setIsSignatureModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition transform active:scale-95 cursor-pointer shadow-2xs"
            id="header-e-signature-btn"
            title={getUIText(language, { en: 'Electronic Signature Studio & Official Seal', ku: 'ستۆدیۆی واژۆی ئەلیکترۆنی و مۆری فەرمی', ar: 'استوديو التوقيع الإلكتروني والختم' })}
          >
            <PenTool className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden xl:inline">{getUIText(language, { en: 'E-Signature', ku: 'واژۆی ئەلیکترۆنی', ar: 'التوقيع' })}</span>
          </button>

          {/* Universal PrintManager Utility Header Trigger */}
          <button
            onClick={() => openPrintManager(null)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition transform active:scale-95 cursor-pointer shadow-2xs relative"
            id="header-printer-station-btn"
            title={getUIText(language, { en: 'PrintManager - Direct Network Printing & Spooler', ku: 'بەڕێوەبەری چاپ (PrintManager) - چاپی ڕاستەوخۆ بە پرینتەری تۆڕ', ar: 'مدير الطباعة المباشرة والشبكية' })}
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="hidden xl:inline">{getUIText(language, { en: 'Print Manager', ku: 'بەڕێوەبەری چاپ', ar: 'مدير الطباعة' })}</span>
            {printQueue.some(j => j.status === 'QUEUED' || j.status === 'SPOOLING' || j.status === 'TRANSMITTING') && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Holding Owner Approvals Badge */}
          {pendingApprovalsCount > 0 && (
            <button
              onClick={() => setActiveTab('owner-approvals')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition shadow-2xs cursor-pointer"
              id="owner-approval-header-badge"
              title={`${pendingApprovalsCount} Purchases awaiting Holding Owner Approval`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingApprovalsCount} {language === 'ku' ? 'چاوەڕوان' : language === 'ar' ? 'معلق' : 'Pending'}</span>
            </button>
          )}

          {/* Holding Real-Time Cloud Sync Button (Erbil HQ <-> Halabja Site) */}
          <button
            onClick={() => setIsCloudSyncModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shadow-2xs ${
              holdingCloudSyncStatus.connected
                ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            id="holding-cloud-sync-btn"
            title={
              language === 'ku'
                ? `سینکرۆنایزی خۆکارانەی هۆڵدینگ (هەولێر ⟷ هەڵەبجە) - ${holdingCloudSyncStatus.activeLaptops.length} لاپتۆپ بەستراوەتەوە`
                : language === 'ar'
                ? `المزامنة السحابية المباشرة (أربيل ⟷ حلبجة) - ${holdingCloudSyncStatus.activeLaptops.length} أجهزة متصلة`
                : `Holding Real-Time Cloud Sync (Erbil ⟷ Halabja) - ${holdingCloudSyncStatus.activeLaptops.length} laptops connected`
            }
          >
            <CloudLightning className={`w-3.5 h-3.5 text-blue-600 ${holdingCloudSyncStatus.isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">
              {language === 'ku' ? 'سینکی هۆڵدینگ' : language === 'ar' ? 'سحابة الهولدينغ' : 'Holding Cloud'}
            </span>
            {holdingCloudSyncStatus.activeLaptops.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] bg-blue-200/70 text-blue-900 px-1.5 py-0.2 rounded-full font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                {holdingCloudSyncStatus.activeLaptops.length}
              </span>
            )}
          </button>

          {/* Holding Local Mesh & Offline Sync Hub Trigger */}
          <button
            onClick={() => setIsMeshHubOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shadow-2xs ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200 animate-pulse'
            }`}
            id="mesh-network-hub-btn"
            title={isOnline
              ? getUIText(language, { en: 'Holding Local Mesh & Offline Sync Ready', ku: 'تۆڕی ناوخۆیی میش و ئۆفلاین (Holding Mesh Ready)', ar: 'الشبكة المحلية الخاصة والمزامنة بدون إنترنت' })
              : getUIText(language, { en: 'Offline Mode: Local Mesh Active', ku: 'دۆخی ئۆفلاین: تۆڕی خۆجێیی میش کاردەکات', ar: 'وضع عدم الاتصال: شبكة مش مفعلة' })
            }
          >
            {isOnline ? (
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-700" />
            )}
            <span className="hidden sm:inline">
              {isOnline
                ? (language === 'ku' ? 'تۆڕی میش' : language === 'ar' ? 'شبكة مش' : 'Local Mesh')
                : (language === 'ku' ? 'ئۆفلاین (میش)' : language === 'ar' ? 'أوفلاين مش' : 'Offline Mesh')}
            </span>
          </button>

          {/* Architectural Skyline Background Toggle Button */}
          <button
            onClick={() => setIsSkylineModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shadow-2xs ${
              isSkylineBgEnabled
                ? 'bg-blue-50/90 text-blue-900 border-blue-200/90 hover:bg-blue-100'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/80'
            }`}
            id="skyline-bg-modal-btn"
            title={
              language === 'ku'
                ? 'ڕێکخستنی باکگراوندی باڵاخانە ڕەنگکراوەکان'
                : language === 'ar'
                ? 'تخصيص خلفية الأبراج المعمارية الملونة'
                : 'Architectural Skyline Background Settings'
            }
          >
            <Building2 className={`w-3.5 h-3.5 ${isSkylineBgEnabled ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="hidden xl:inline">
              {language === 'ku' ? 'باڵاخانەکان' : language === 'ar' ? 'الأبراج' : 'Skyline'}
            </span>
            {isSkylineBgEnabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block animate-pulse" />
            )}
          </button>

          {/* Executive Manager File (فایلی بەڕێوەبەر) Dropdown - Exclusively for Managers & Holding Owner */}
          <ManagerFileDropdown
            isOpen={isUserManualOpen}
            onToggle={() => setIsUserManualOpen(prev => !prev)}
            onClose={() => setIsUserManualOpen(false)}
          />

          {/* In-App PWA Install Button */}
          <PWAInstallButton />

          {/* Direct Full Source Code ZIP Download Button */}
          <a
            href={getApiUrl('/api/export-codebase-zip')}
            download="SAS4ERP-Full-Source-Code.zip"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 shadow-sm transition transform active:scale-95 cursor-pointer shrink-0"
            id="download-source-code-header-btn"
            title={getUIText(language, {
              en: 'Download Complete Source Code (ZIP Archive)',
              ku: 'داگرتنی تەواوی کۆدەکانی سیستم بە فایلی ZIP',
              ar: 'تحميل كامل الكود المصدري بصيغة ZIP'
            })}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-bold">
              {language === 'ku' ? 'داگرتنی کۆدەکان' : language === 'ar' ? 'تحميل الكود' : 'Download Code'}
            </span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-black border border-emerald-500/30">
              ZIP
            </span>
          </a>

          {/* Dual-System Switcher (Strictly for Platform Owner - completely hidden from client subscribers) */}
          {isMasterVendorOwner && (
            <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200 gap-1 shadow-2xs">
              <button
                onClick={() => setActiveTab('holding-dashboard')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab !== 'vendor-license-hub'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                id="header-switch-to-erp-btn"
                title={language === 'ku' ? 'سیستەمی هۆڵدینگ و بەشداربووان (ERP)' : 'Client ERP System'}
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="hidden sm:inline">{language === 'ku' ? '🏢 هۆڵدینگ (کڕیار)' : '🏢 Client ERP'}</span>
              </button>

              <button
                onClick={() => setActiveTab('vendor-license-hub')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'vendor-license-hub'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md ring-1 ring-amber-400'
                    : 'text-amber-900 hover:text-amber-950 font-bold bg-amber-50/80 hover:bg-amber-100'
                }`}
                id="header-switch-to-vendor-btn"
                title={language === 'ku' ? 'پۆڕتاڵی خاوەنی سەکۆ: دروستکردن و نوێکردنەوەی لایسنسی کڕیاران' : 'Owner Vendor License Hub'}
              >
                <Crown className="w-3.5 h-3.5 text-amber-700 animate-pulse shrink-0" />
                <span className="inline">{language === 'ku' ? '👑 لایسنس (خاوەن)' : '👑 Vendor Hub'}</span>
              </button>
            </div>
          )}

          {/* Platform Owner OTP Verification Button */}
          <button
            onClick={() => setIsOwnerVerifyModalOpen(true)}
            id="header-owner-verify-btn"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border shadow-2xs ${
              currentUser?.isOwnerVerified || (typeof localStorage !== 'undefined' && localStorage.getItem('sas4erp_owner_session') === 'verified')
                ? 'bg-amber-500/15 text-amber-900 border-amber-300 hover:bg-amber-500/25'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 border-amber-400 shadow-md animate-pulse'
            }`}
            title={language === 'ku' ? 'مسۆگەرکردنی خاوەنی سەکۆ بە ئیمەیلی kurdkodofficial@gmail.com' : 'Verify Platform Owner with kurdkodofficial@gmail.com'}
          >
            <Crown className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="hidden sm:inline">
              {currentUser?.isOwnerVerified || (typeof localStorage !== 'undefined' && localStorage.getItem('sas4erp_owner_session') === 'verified')
                ? (language === 'ku' ? 'خاوەنی مسۆگەرکراو ✓' : 'Verified Owner ✓')
                : (language === 'ku' ? 'مسۆگەرکردنی خاوەن' : 'Owner OTP Verify')}
            </span>
            <span className="sm:hidden">
              {language === 'ku' ? 'خاوەن' : 'Owner'}
            </span>
          </button>

          {/* System License & Hardware Lock Status Button */}
          <button
            onClick={() => openLicenseModal(isMasterVendorOwner ? 'generator' : 'activate')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shadow-2xs ${
              systemLicense?.licenseType === 'VIP_OWNER_GIFT'
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 ring-1 ring-amber-400/40'
                : systemLicense?.licenseType === 'COMMERCIAL_ACTIVE'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                : systemLicense?.licenseType === 'EXPIRED'
                ? 'bg-rose-100 text-rose-900 border-rose-400 hover:bg-rose-200 animate-pulse'
                : 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100'
            }`}
            id="system-license-header-btn"
            title={
              language === 'ku'
                ? `سیستەمی لایسنس و بەستنەوە بە کلیل - باری ئێستا: ${systemLicense?.licenseType || 'TRIAL_14D'}`
                : `System License & Hardware Lock: ${systemLicense?.licenseType || 'TRIAL_14D'}`
            }
          >
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-600 flex items-center justify-center shrink-0">
                {systemLicense?.licenseType === 'VIP_OWNER_GIFT' ? (
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                ) : systemLicense?.licenseType === 'COMMERCIAL_ACTIVE' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                ) : systemLicense?.licenseType === 'EXPIRED' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </div>

              <div className="flex flex-col items-start text-right leading-none">
                <span className="font-black text-[11px] text-slate-900 flex items-center gap-1">
                  <span>{language === 'ku' ? 'کلیلی لایسنس' : language === 'ar' ? 'مفتاح الترخيص' : 'License Key'}</span>
                  {systemLicense?.isPerpetual && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-ping" />
                  )}
                </span>
                <span className="text-[9px] font-bold text-slate-500 mt-0.5 font-mono">
                  {systemLicense?.licenseType === 'VIP_OWNER_GIFT'
                    ? (language === 'ku' ? 'VIP هەمیشەیی' : 'VIP Gift')
                    : systemLicense?.licenseType === 'COMMERCIAL_ACTIVE'
                    ? (language === 'ku' ? 'مۆڵەتی بازرگانی' : 'Enterprise')
                    : systemLicense?.licenseType === 'EXPIRED'
                    ? (language === 'ku' ? 'بەسەرچووە' : 'Expired')
                    : (language === 'ku' ? `تاقیکردنەوە (${getRemainingTrialDays(systemLicense?.expiresAt || '')} ڕۆژ)` : `Trial (${getRemainingTrialDays(systemLicense?.expiresAt || '')}d)`)}
                </span>
              </div>
            </div>
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLangMenuOpen(!isLangMenuOpen);
                setIsUserMenuOpen(false);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition cursor-pointer"
              id="language-switcher-btn"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className="uppercase font-bold">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select System Language
                </div>
                <button
                  onClick={() => {
                    setLanguage('en');
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    language === 'en' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🇬🇧</span> English (Primary)
                  </span>
                  {language === 'en' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    setLanguage('ku');
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    language === 'ku' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2 font-kurdish">
                    <span>☀️</span> کوردی سۆرانی (Kurdish)
                  </span>
                  {language === 'ku' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    setLanguage('ar');
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    language === 'ar' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2 font-kurdish">
                    <span>🇮🇶</span> العربية (Arabic)
                  </span>
                  {language === 'ar' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsLangMenuOpen(false);
                setIsUserMenuOpen(false);
              }}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 border border-slate-200 transition cursor-pointer"
              id="notifications-header-btn"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 max-h-[480px] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-slate-800">Real-Time Holding Alerts</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-medium">
                    {unreadNotifsCount} Unread
                  </span>
                </div>
                <div className="space-y-2">
                  {visibleNotifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
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
                            setActiveTab('it-infrastructure');
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                          notif.isRead
                            ? 'bg-slate-50 border-slate-100 text-slate-500'
                            : notif.type === 'HARDWARE_ALERT'
                            ? 'bg-rose-50/70 border-rose-300 text-slate-800 shadow-2xs'
                            : 'bg-blue-50/60 border-blue-200 text-slate-800 shadow-2xs'
                        }`}
                      >
                      <div className="flex items-start gap-2">
                        {notif.type === 'GATE_ALERT' && <ScanLine className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                        {notif.type === 'PROJECT_ALERT' && <Building2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />}
                        {notif.type === 'FINANCE_ENTRY' && <Wallet className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />}
                        {notif.type === 'OWNER_APPROVAL_REQUIRED' && <Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                        {notif.type === 'EXPIRY_WARNING' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                        {notif.type === 'BUDGET_THRESHOLD_ALERT' && <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-pulse" />}
                        {notif.type === 'HARDWARE_ALERT' && (
                          <div className="relative shrink-0 mt-0.5">
                            <Wrench className="w-4 h-4 text-rose-600" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-slate-900">
                              {language === 'ku' && notif.titleKu ? notif.titleKu : language === 'ar' && notif.titleAr ? notif.titleAr : notif.title}
                            </p>
                            {notif.type === 'HARDWARE_ALERT' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                                {language === 'ku' ? 'هۆشداری ئایتی مەیدانی' : 'IT Fleet Alert'}
                              </span>
                            )}
                            {notif.targetRole && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                                {notif.targetRole === 'PROJECT_MANAGER' ? 'بۆ بەڕێوەبەری پڕۆژە (PM)' : 'بۆ بەڕێوەبەری گشتی (GM)'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                            {language === 'ku' && notif.messageKu ? notif.messageKu : language === 'ar' && notif.messageAr ? notif.messageAr : notif.message}
                          </p>
                          {notif.directives && notif.directives.length > 0 && (
                            <div className="mt-1 p-1.5 bg-blue-50/80 rounded-lg border border-blue-200/60 text-[10px] text-blue-900">
                              <span className="font-bold block mb-0.5">ڕاسپاردە سەرەکییەکان:</span>
                              <ul className="list-disc list-inside space-y-0.5">
                                {notif.directives.slice(0, 3).map((d, dIdx) => (
                                  <li key={dIdx} className="truncate">{d}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <span className="text-[9px] text-slate-400 mt-1 block">{notif.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                </div>
              </div>
            )}
          </div>

          {/* User Persona & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsLangMenuOpen(false);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 transition cursor-pointer"
              id="user-profile-menu-btn"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-sm">
                {currentUser.avatar}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold leading-tight truncate max-w-[110px] text-slate-900">{currentUser.name}</div>
                <div className="text-[10px] text-blue-600 font-semibold">{currentUser.role}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50">
                {isMasterVendorOwner && (
                  <button
                    onClick={() => {
                      setActiveTab('vendor-license-hub');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md transition cursor-pointer mb-2.5 border border-amber-300 transform active:scale-95"
                  >
                    <span className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-slate-950 animate-pulse" />
                      <span>{language === 'ku' ? '👑 پۆڕتاڵی لایسنس (سیستەمی ٢)' : '👑 Platform Owner Vendor Hub'}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-amber-400 font-mono font-bold">OWNER</span>
                  </button>
                )}

                {/* Platform Owner Status / Verification Card */}
                <div className="mb-2 p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-amber-950 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === 'ku' ? 'خاوەنی سەکۆ' : 'Platform Owner'}</span>
                    </span>
                    {currentUser?.isOwnerVerified || (typeof localStorage !== 'undefined' && localStorage.getItem('sas4erp_owner_session') === 'verified') ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                        {language === 'ku' ? 'مسۆگەرکراوە ✓' : 'Verified ✓'}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                        {language === 'ku' ? 'نەسەلمێنراوە' : 'Unverified'}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono mb-2 truncate">
                    kurdkodofficial@gmail.com
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsOwnerVerifyModalOpen(true);
                    }}
                    className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-lg text-[11px] shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Key className="w-3 h-3" />
                    <span>
                      {currentUser?.isOwnerVerified || (typeof localStorage !== 'undefined' && localStorage.getItem('sas4erp_owner_session') === 'verified')
                        ? (language === 'ku' ? 'نوێکردنەوەی مسۆگەرکردن' : 'Re-verify / Status')
                        : (language === 'ku' ? 'مسۆگەرکردن بە کۆدی ژمارەیی' : 'Verify via Numeric OTP')}
                    </span>
                  </button>
                </div>

                <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100">
                  Switch Active Role Persona (Testing)
                </div>
                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {userProfiles.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition cursor-pointer ${
                        currentUser.id === user.id ? 'bg-blue-50 border border-blue-200 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-lg">{user.avatar}</span>
                      <div className="flex-1 truncate">
                        <div className="text-xs font-bold text-slate-900">{user.name}</div>
                        <div className="text-[10px] text-slate-500">{user.title}</div>
                      </div>
                      {currentUser.id === user.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5">
                  {(currentUser.role === 'HOLDING_OWNER' || currentUser.role === 'SUPER_ADMIN') && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsUserRolesModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{getUIText(language, { en: 'Manage Roles & RBAC', ku: 'بەڕێوەبردنی ڕۆڵ و دەسەڵاتەکان', ar: 'إدارة الأدوار وصلاحيات الوصول' })}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsHoldingSetupOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('setupHoldingTitle')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Holding Local Mesh & Offline Sync Hub Modal */}
      <HoldingMeshSyncHubModal
        isOpen={isMeshHubOpen}
        onClose={() => setIsMeshHubOpen(false)}
      />

      {/* Platform Owner OTP Verification Modal */}
      <OwnerVerificationModal
        isOpen={isOwnerVerifyModalOpen}
        onClose={() => setIsOwnerVerifyModalOpen(false)}
      />
    </header>
  );
};
