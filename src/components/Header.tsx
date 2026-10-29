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
  WifiOff
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { Language, UserProfile } from '../types/erp';
import { HoldingMeshSyncHubModal } from './dashboard/HoldingMeshSyncHubModal';
import { getUIText } from '../utils/langHelper';

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
    startCallWithManager,
    setActiveTab,
    searchQuery,
    setSearchQuery,
  } = useERP();

  const { language, setLanguage, userNativeLanguage, setUserNativeLanguage, t, isRtl } = useLanguage();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMeshHubOpen, setIsMeshHubOpen] = useState(false);
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
  // The holding owner does NOT receive operational budget threshold alerts; those are strictly for Project Managers and Company GMs
  const visibleNotifications = notifications.filter(notif => {
    if (currentUser.role === 'HOLDING_OWNER') {
      return notif.type !== 'BUDGET_THRESHOLD_ALERT';
    }
    if (currentUser.role === 'PROJECT_MANAGER') {
      return notif.targetRole === 'PROJECT_MANAGER' || !notif.targetRole;
    }
    if (currentUser.role === 'COMPANY_GM') {
      return notif.targetRole === 'COMPANY_GM' || notif.targetRole === 'PROJECT_MANAGER' || !notif.targetRole;
    }
    return true;
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 shadow-xs">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Holding Logo */}
        <div className="flex items-center gap-3.5 min-w-max">
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

          {/* Holding Local Mesh & Offline Sync Hub Trigger */}
          <button
            onClick={() => setIsMeshHubOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shadow-2xs ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200 animate-pulse'
            }`}
            id="mesh-network-hub-btn"
            title={isOnline ? 'تۆڕی ناوخۆیی میش و ئۆفلاین (Holding Mesh Ready)' : 'دۆخی ئۆفلاین: تۆڕی خۆجێیی میش کاردەکات'}
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
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                          notif.isRead
                            ? 'bg-slate-50 border-slate-100 text-slate-500'
                            : 'bg-blue-50/60 border-blue-200 text-slate-800 shadow-2xs'
                        }`}
                      >
                      <div className="flex items-start gap-2">
                        {notif.type === 'GATE_ALERT' && <ScanLine className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                        {notif.type === 'OWNER_APPROVAL_REQUIRED' && <Crown className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                        {notif.type === 'EXPIRY_WARNING' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                        {notif.type === 'BUDGET_THRESHOLD_ALERT' && <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-pulse" />}
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-slate-900">
                              {language === 'ku' && notif.titleKu ? notif.titleKu : language === 'ar' && notif.titleAr ? notif.titleAr : notif.title}
                            </p>
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

                <div className="pt-2 mt-2 border-t border-slate-100">
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
    </header>
  );
};
