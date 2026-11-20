import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Crown,
  Video,
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
  BrainCircuit,
  CalendarRange,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  FileText,
  Key,
  Send,
  Settings,
  FileCheck2
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { getUIText } from '../utils/langHelper';
import { hasModuleAccess, checkIsMasterVendorOwner, checkIsHoldingOrItAdmin } from '../utils/rbacPermissions';
import { getRemainingTrialDays } from '../utils/licenseManager';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    purchaseOrders,
    foreignWorkers,
    projectReports,
    anomalyAlerts,
    currentUser,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    setIsUserManualOpen,
    openLicenseModal,
    systemLicense
  } = useERP();
  const { t, language, isRtl } = useLanguage();

  const isMasterVendorOwner = checkIsMasterVendorOwner(currentUser);
  const canManageHolding = checkIsHoldingOrItAdmin(currentUser);

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

  const isTopManagement =
    currentUser.role === 'HOLDING_OWNER' ||
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'IT_ADMIN';

  const pendingApprovalsCount = purchaseOrders.filter(p => p.status === 'PENDING_OWNER_APPROVAL').length;
  const expiringIqamasCount = foreignWorkers.filter(w => w.visaStatus === 'EXPIRING_SOON' || w.visaStatus === 'EXPIRED').length;
  const submittedReportsCount = (projectReports || []).filter(r => r.status === 'SUBMITTED_TO_UPPER_MANAGEMENT').length;
  const activeAnomaliesCount = (anomalyAlerts || []).filter(a => a.status === 'TRIGGERED' || a.status === 'INVESTIGATING').length;

  const navGroups = isMasterVendorOwner
    ? [
        {
          groupTitle: language === 'ku' ? 'سیستەمی ٢ · خاوەنی سەکۆ' : 'Platform Vendor (System 2)',
          items: [
            {
              id: 'vendor-license-hub',
              label: language === 'ku' ? 'پۆڕتاڵی لایسنس و کڕیاران' : 'Vendor License Hub',
              icon: Crown,
              count: null as number | null,
              isAlert: false
            },
            {
              id: 'it-systems',
              label: language === 'ku' ? 'ژێرخان و پشکنینی سێرڤەر' : 'System Diagnostics',
              icon: Settings,
              count: null as number | null,
              isAlert: false
            }
          ]
        }
      ]
    : [
        {
          groupTitle: isTopManagement
            ? getUIText(language, { en: 'Executive', ku: 'بەڕێوەبردنی گشتی', ar: 'الإدارة التنفيذية' })
            : getUIText(language, { en: 'Branch Portal', ku: 'پۆرتاڵی لق و پڕۆژە', ar: 'بوابة الفرع' }),
          items: [
            {
              id: 'holding-dashboard',
              label: isTopManagement
                ? t('navHoldingDashboard')
                : getUIText(language, { en: 'Branch Overview', ku: 'پوختەی لق و پڕۆژە', ar: 'ملخص الفرع' }),
              icon: LayoutDashboard,
              count: null as number | null,
              isAlert: false
            },
            {
              id: 'owner-approvals',
              label: isTopManagement
                ? t('navOwnerApprovals')
                : getUIText(language, { en: 'Approvals Queue', ku: 'واژۆی سەرۆکایەتی', ar: 'الموافقات' }),
              icon: Crown,
              count: isTopManagement && pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
              isAlert: pendingApprovalsCount > 0
            },
            {
              id: 'companies-projects',
              label: t('navCompaniesProjects'),
              icon: Building2,
              count: null as number | null,
              isAlert: false
            },
            {
              id: 'project-reports',
              label: getUIText(language, { en: 'Schedule & Reports', ku: 'خشتەی گانت و ڕاپۆرت', ar: 'الجدول والتقارير' }),
              icon: CalendarRange,
              count: submittedReportsCount > 0 ? submittedReportsCount : null,
              isAlert: false
            },
            {
              id: 'ml-anomaly-detection',
              label: getUIText(language, { en: 'Risk & Anomaly Audit', ku: 'وردبینی مەترسی و نائاسایی', ar: 'تدقيق المخاطر' }),
              icon: BrainCircuit,
              count: activeAnomaliesCount > 0 ? activeAnomaliesCount : null,
              isAlert: activeAnomaliesCount > 0
            }
          ]
        },
        {
          groupTitle: getUIText(language, { en: 'Operations & Finance', ku: 'ئۆپەراسیۆن و دارایی', ar: 'العمليات والمالية' }),
          items: [
            {
              id: 'procurement',
              label: isTopManagement
                ? t('navProcurement')
                : getUIText(language, { en: 'My Requests', ku: 'داواکارییەکانم', ar: 'طلباتي' }),
              icon: isTopManagement ? ShoppingCart : FileCheck2,
              count: null as number | null,
              isAlert: false
            },
            { id: 'finance', label: t('navFinance'), icon: Wallet, count: null as number | null, isAlert: false },
            { id: 'warehouse', label: t('navWarehouse'), icon: Boxes, count: null as number | null, isAlert: false },
            { id: 'dispatch-logistics', label: t('navDispatchLogistics'), icon: Truck, count: null as number | null, isAlert: false },
            { id: 'gate-scanner', label: t('navGateScanner'), icon: ScanLine, count: null as number | null, isAlert: false }
          ]
        },
        {
          groupTitle: getUIText(language, { en: 'Field & People', ku: 'مەیدان و کارمەندان', ar: 'الميدان والموارد البشرية' }),
          items: [
            { id: 'technical-electrical', label: t('navTechnicalElectrical'), icon: Zap, count: null as number | null, isAlert: false },
            { id: 'hse-fire-security', label: t('navHseSecurity'), icon: ShieldAlert, count: null as number | null, isAlert: false },
            { id: 'camps-accommodation', label: t('navAccommodation'), icon: Home, count: null as number | null, isAlert: false },
            {
              id: 'foreign-workers',
              label: t('navForeignWorkers'),
              icon: Users,
              count: expiringIqamasCount > 0 ? expiringIqamasCount : null,
              isAlert: expiringIqamasCount > 0
            },
            { id: 'hr-payroll', label: t('navHrPayroll'), icon: Users, count: null as number | null, isAlert: false }
          ]
        },
        {
          groupTitle: getUIText(language, { en: 'Comms & Administration', ku: 'پەیوەندی و ڕێکخستن', ar: 'الاتصالات والإدارة' }),
          items: [
            { id: 'direct-comms', label: language === 'ku' ? 'کەڵەگرام' : 'Kelegram', icon: Send, count: null as number | null, isAlert: false },
            { id: 'virtual-meetings', label: t('navVirtualMeetings'), icon: Video, count: null as number | null, isAlert: false },
            { id: 'correspondence', label: t('navCorrespondence'), icon: Mail, count: null as number | null, isAlert: false },
            {
              id: 'it-systems',
              label: getUIText(language, { en: 'Holding & IT Settings', ku: 'ڕێکخستنی هۆڵدینگ و IT', ar: 'إعدادات الهولدينغ و IT' }),
              icon: Settings,
              count: null as number | null,
              isAlert: false
            }
          ]
        }
      ];

  const visibleNavGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => hasModuleAccess(currentUser, item.id))
    }))
    .filter(group => group.items.length > 0);

  const canSeeManagerFile =
    !isMasterVendorOwner &&
    (canManageHolding || currentUser.role === 'COMPANY_GM' || currentUser.role === 'PROJECT_MANAGER');

  return (
    <>
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-40 md:hidden animate-in fade-in duration-150"
        />
      )}

      <aside
        className={`fixed md:sticky top-[60px] start-0 ${
          isMobileMenuOpen ? 'translate-x-0 w-68' : (isRtl ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')
        } ${
          isCollapsed ? 'md:w-16' : 'md:w-64'
        } bg-white border-e border-slate-200 flex flex-col shrink-0 h-[calc(100vh-60px)] overflow-y-auto transition-all duration-200 ease-out z-50 md:z-30`}
      >
        {/* Minimal Sidebar Top Strip */}
        <div className={`px-3 h-11 border-b border-slate-100 flex items-center shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <span className="text-[11px] font-semibold text-slate-400">
              {getUIText(language, { en: 'Workspace', ku: 'بەشەکانی سیستەم', ar: 'أقسام النظام' })}
            </span>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 md:hidden cursor-pointer"
              title="Close menu"
            >
              <X className="w-4 h-4" />
            </button>

            <button
              onClick={toggleCollapsed}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              title={isCollapsed ? (isRtl ? 'فراوانکردنی مێنیو' : 'Expand Sidebar') : (isRtl ? 'بچووککردنەوەی مێنیو' : 'Collapse Sidebar')}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className={`${isCollapsed ? 'p-2' : 'p-3'} space-y-5 flex-1`}>
          {visibleNavGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 pb-1 text-[11px] font-semibold text-slate-400">
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
                        isCollapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-2'
                      } rounded-lg text-[13px] transition-colors cursor-pointer relative ${
                        isActive
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {item.count !== null && item.count > 0 && !isCollapsed && (
                        <span
                          className={`text-[11px] font-mono tabular-nums font-semibold shrink-0 ${
                            isActive
                              ? 'text-slate-300'
                              : item.isAlert
                              ? 'text-rose-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Clean Minimal Footer Utilities */}
        <div className={`border-t border-slate-100 ${isCollapsed ? 'p-2' : 'p-3'} space-y-1 shrink-0`}>
          {canSeeManagerFile && (
            <button
              onClick={() => {
                setIsUserManualOpen(true);
                setIsMobileMenuOpen(false);
              }}
              id="sidebar-pinned-manual-btn"
              title={language === 'ku' ? 'فایلی بەڕێوەبەر (Word/PDF)' : 'Manager File (Word/PDF)'}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2'
              } rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition cursor-pointer`}
            >
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              {!isCollapsed && (
                <span className="truncate">
                  {language === 'ku' ? 'فایلی بەڕێوەبەر (Word/PDF)' : 'Manager Dossier'}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => {
              openLicenseModal(isMasterVendorOwner ? 'generator' : 'activate');
              setIsMobileMenuOpen(false);
            }}
            id="sidebar-pinned-license-btn"
            title={language === 'ku' ? 'ڕەوشی لایسنس' : 'License Status'}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-2'
            } rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition cursor-pointer`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Key className="w-4 h-4 text-slate-400 shrink-0" />
              {!isCollapsed && (
                <span className="truncate">
                  {isMasterVendorOwner
                    ? (language === 'ku' ? 'دروستکردنی کلیل' : 'Key Generator')
                    : (language === 'ku' ? 'لایسنس' : 'License')}
                </span>
              )}
            </span>
            {!isCollapsed && !isMasterVendorOwner && (
              <span className={`text-[11px] font-mono tabular-nums ${
                systemLicense?.licenseType === 'EXPIRED'
                  ? 'text-rose-600 font-semibold'
                  : 'text-slate-400'
              }`}>
                {systemLicense?.isPerpetual
                  ? 'VIP'
                  : systemLicense?.licenseType === 'COMMERCIAL_ACTIVE'
                  ? (language === 'ku' ? 'چالاک' : 'Active')
                  : `${getRemainingTrialDays(systemLicense?.expiresAt || '')}d`}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
