import React, { useState } from 'react';
import {
  Users,
  Truck,
  FolderArchive,
  Cpu,
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  DollarSign,
  ShieldCheck,
  Server,
  Camera,
  FileCheck2,
  FileText,
  ArrowRightLeft,
  Radio,
  Wifi,
  CloudLightning,
  Activity,
  Compass,
  Network,
  Gauge,
  HardDrive,
  Inbox,
  QrCode,
  Wrench,
  BarChart3,
  ShieldAlert,
  Building2,
  FolderKanban,
  Shield,
  Printer,
  PenTool,
  Image,
  FileSpreadsheet,
  Key,
  Settings2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { SyncConflictResolutionView } from './it/SyncConflictResolutionView';
import { NetworkLatencyMonitorView } from './it/NetworkLatencyMonitorView';
import { NetworkBandwidthManagerView } from './it/NetworkBandwidthManagerView';
import { CloudAgnosticBackupView } from './it/CloudAgnosticBackupView';
import { LocalDataBufferView } from './it/LocalDataBufferView';
import { GeographicalOperationalZonesView } from './it/GeographicalOperationalZonesView';
import { SmartSyncRelayView } from './it/SmartSyncRelayView';
import { SecurityAuditReportPdfView } from './it/SecurityAuditReportPdfView';
import { SyncHealthDashboardView } from './it/SyncHealthDashboardView';
import { HardwareAssetTrackingView } from './it/HardwareAssetTrackingView';
import { HardwareMaintenanceView } from './it/HardwareMaintenanceView';
import { AssetUtilizationDashboardView } from './it/AssetUtilizationDashboardView';
import { HardwareAlertThresholdView } from './it/HardwareAlertThresholdView';
import { FirebaseOneClickConnect } from './FirebaseOneClickConnect';

// 1. Owner Approvals Dedicated View
export const OwnerApprovalsView: React.FC = () => {
  const { holding, purchaseOrders, companies, projects, approvePurchaseByOwner, rejectPurchaseByOwner } = useERP();
  const { t, language } = useLanguage();

  const pendingPOs = purchaseOrders.filter(p => p.status === 'PENDING_OWNER_APPROVAL');
  const pastPOs = purchaseOrders.filter(p => p.status !== 'PENDING_OWNER_APPROVAL');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-amber-300 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t('navOwnerApprovals')}
            </h1>
            <p className="text-xs text-slate-500">
              {t('holdingOwnerRuleBanner')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-amber-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Awaiting Chairman Signature ({pendingPOs.length})</span>
        </h2>

        {pendingPOs.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center text-slate-500 space-y-2 shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Pending Approvals!</h3>
            <p className="text-xs">All subsidiary requisitions have been processed and authorized by the holding owner.</p>
          </div>
        ) : (
          pendingPOs.map((po) => {
            const comp = companies.find(c => c.id === po.companyId);
            return (
              <div
                key={po.id}
                className="bg-white border border-amber-300 rounded-3xl p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-base font-extrabold text-slate-900">{po.poNumber}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold">
                      {comp?.name}
                    </span>
                  </div>
                  <span className="text-lg font-extrabold text-emerald-600 font-mono">
                    ${po.totalAmountUSD.toLocaleString()} {po.currency}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-400 block font-medium">Vendor & Requester:</span>
                    <span className="font-bold text-slate-900">{po.supplierName}</span>
                    <p className="text-slate-500 mt-0.5">Requested by {po.requestedBy} ({po.requesterRole})</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Operational Reason:</span>
                    <p className="italic text-slate-700 mt-0.5">"{po.purpose}"</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => rejectPurchaseByOwner(po.id, `Rejected by ${holding.chairmanName || 'Holding Chairman'}`)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
                  >
                    Reject Order
                  </button>
                  <button
                    onClick={() => approvePurchaseByOwner(po.id, `Approved by ${holding.chairmanName || 'Holding Chairman'}`)}
                    className="px-6 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize & Sign Purchase</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// 2. HR & Payroll View
export const HrPayrollView: React.FC = () => {
  const { employees, companies } = useERP();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>{t('navHrPayroll')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Holding personnel, corporate payroll, and executive rosters.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Role / Title</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Nationality</th>
              <th className="py-3 px-4 text-right">Monthly Salary</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/70">
                <td className="py-3.5 px-4 font-bold text-slate-900">{emp.fullName}</td>
                <td className="py-3.5 px-4 text-slate-700">{emp.jobTitle}</td>
                <td className="py-3.5 px-4 text-slate-500">{emp.department}</td>
                <td className="py-3.5 px-4 text-slate-700">{emp.nationality}</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">${emp.salaryUSD.toLocaleString()} USD</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 3. Dispatch & Logistics
export const DispatchLogisticsView: React.FC = () => {
  const { dispatchShipments } = useERP();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-600" />
          <span>{t('navDispatchLogistics')}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Outbound product dispatching, commercial waybills, and fleet trucks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dispatchShipments.map((shipment) => (
          <div key={shipment.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-mono font-bold text-blue-600">{shipment.shipmentNumber}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {shipment.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">{shipment.materialDescription}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Destination:</span>
                <p className="font-bold text-slate-900">{shipment.destination}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Driver & Truck:</span>
                <p className="font-bold text-slate-900">{shipment.driverName} ({shipment.vehiclePlate})</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Document Archive
export const DocArchiveView: React.FC = () => {
  const { t } = useLanguage();
  const { holding } = useERP();

  const holdingTitle = holding.name || 'Executive Holding';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <FolderArchive className="w-5 h-5 text-purple-600" />
          <span>{t('navDocArchive')} & Engineering Blueprints</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">ISO certifications, master contracts, land titles, and CAD drawings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Skyline Towers Architectural CAD v4', 'Ministry of Natural Resources Refinery License', 'ISO 9001:2025 Quality Certification', `${holdingTitle} Corporate Articles of Association`].map((doc, idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-2 hover:border-blue-400 transition cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">{doc}</h3>
            <span className="text-[10px] text-slate-400 block font-medium">Digitally Signed & Encrypted PDF</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. IT Systems, Cloud Sync & Conflict Resolution Module
export const ItSystemsView: React.FC = () => {
  const {
    itAssets,
    setIsCloudSyncModalOpen,
    holdingCloudSyncStatus,
    setIsHoldingSetupOpen,
    setIsUserRolesModalOpen,
    setActiveTab,
    setIsPrinterModalOpen,
    setIsSignatureModalOpen,
    setIsSkylineModalOpen,
    setIsImportModalOpen,
    openLicenseModal,
    systemLicense,
    holding
  } = useERP();
  const { language } = useLanguage();
  const [activeItTab, setActiveItTab] = useState<'SYNC_HEALTH' | 'THRESHOLD_ALERTS' | 'ASSET_UTILIZATION' | 'ASSET_TRACKING' | 'HARDWARE_MAINTENANCE' | 'LATENCY_MONITOR' | 'BANDWIDTH_MANAGER' | 'LOCAL_BUFFER' | 'CLOUD_BACKUP' | 'SMART_RELAY' | 'GEO_ZONES' | 'CONFLICTS' | 'AUDIT_REPORT' | 'INFRASTRUCTURE' | 'CLOUD_TOPOLOGY'>('SYNC_HEALTH');
  const [showAdvancedDiagnostics, setShowAdvancedDiagnostics] = useState<boolean>(false);

  const coreItTabs = [
    {
      id: 'SYNC_HEALTH' as const,
      icon: Radio,
      labelKu: 'تەندروستی سینک',
      labelEn: 'Sync Health'
    },
    {
      id: 'ASSET_TRACKING' as const,
      icon: QrCode,
      labelKu: 'ئامێرەکان و QR',
      labelEn: 'Hardware & QR'
    },
    {
      id: 'HARDWARE_MAINTENANCE' as const,
      icon: Wrench,
      labelKu: 'چاککردنەوە و گەرەنتی',
      labelEn: 'Maintenance'
    },
    {
      id: 'AUDIT_REPORT' as const,
      icon: FileText,
      labelKu: 'وردبینی ئاسایش',
      labelEn: 'Security Audit'
    },
    {
      id: 'INFRASTRUCTURE' as const,
      icon: Cpu,
      labelKu: 'سێرڤەر و دەروازە',
      labelEn: 'Servers & Gates'
    },
    {
      id: 'CLOUD_TOPOLOGY' as const,
      icon: CloudLightning,
      labelKu: 'لاپتۆپە بەستراوەکان',
      labelEn: 'Connected Nodes'
    }
  ];

  const advancedItTabs = [
    {
      id: 'THRESHOLD_ALERTS' as const,
      icon: ShieldAlert,
      labelKu: 'ئاگاداری سنوورەکان',
      labelEn: 'Threshold Alerts'
    },
    {
      id: 'ASSET_UTILIZATION' as const,
      icon: BarChart3,
      labelKu: 'بەکارهێنانی ئامێرەکان',
      labelEn: 'Asset Utilization'
    },
    {
      id: 'LATENCY_MONITOR' as const,
      icon: Activity,
      labelKu: 'خێرایی و سەقامگیری تۆڕ',
      labelEn: 'Network Latency'
    },
    {
      id: 'BANDWIDTH_MANAGER' as const,
      icon: Gauge,
      labelKu: 'بەڕێوەبەری باندویس',
      labelEn: 'Bandwidth QoS'
    },
    {
      id: 'LOCAL_BUFFER' as const,
      icon: Inbox,
      labelKu: 'بافەری ئۆفلاین',
      labelEn: 'Local Buffer'
    },
    {
      id: 'CLOUD_BACKUP' as const,
      icon: HardDrive,
      labelKu: 'پاڵپشتی خۆکار',
      labelEn: 'Backup Vault'
    },
    {
      id: 'SMART_RELAY' as const,
      icon: Network,
      labelKu: 'ڕیلەیی زیرەک',
      labelEn: 'Smart Relay'
    },
    {
      id: 'GEO_ZONES' as const,
      icon: Compass,
      labelKu: 'زۆنە جوگرافییەکان',
      labelEn: 'Geo Zones & IP'
    },
    {
      id: 'CONFLICTS' as const,
      icon: ArrowRightLeft,
      labelKu: 'چارەسەری ناکۆکی سینک',
      labelEn: 'Sync Conflicts'
    }
  ];

  const isAdvancedTabActive = advancedItTabs.some(t => t.id === activeItTab);

  const quickSettingsCards = [
    {
      id: 'holding-identity',
      titleKu: 'ناسنامە و لۆگۆی هۆڵدینگ',
      titleEn: 'Holding Identity & Logo',
      descKu: 'دەستکاریکردنی ناوی هۆڵدینگ، لۆگۆ، ئیمەیڵ و زانیاری خاوەن',
      descEn: 'Configure holding name, logo, email & chairman profile',
      icon: Building2,
      action: () => setIsHoldingSetupOpen(true)
    },
    {
      id: 'users-rbac',
      titleKu: 'بەکارهێنەران و دەسەڵات (RBAC)',
      titleEn: 'Users & Roles (RBAC)',
      descKu: 'زیادکردنی بەکارهێنەر، دیاریکردنی ڕۆڵ و بەشە ڕێگەپێدراوەکان',
      descEn: 'Add staff, assign GM/PM/Employee roles & module access',
      icon: Shield,
      action: () => setIsUserRolesModalOpen(true)
    },
    {
      id: 'companies-projects',
      titleKu: 'کۆمپانیاکان و پڕۆژەکان',
      titleEn: 'Companies & Projects',
      descKu: 'دروستکردن و ڕێکخستنی کۆمپانیاکان، بەشەکان و بودجەکان',
      descEn: 'Create & manage subsidiary companies, departments & projects',
      icon: FolderKanban,
      action: () => setActiveTab('companies-projects')
    },
    {
      id: 'cloud-sync',
      titleKu: 'ئامێرەکان و Cloud Sync',
      titleEn: 'Multi-Laptop Cloud Sync',
      descKu: 'بەستنەوەی لاپتۆپ و لقەکان بە کلیلی هاوبەشی هۆڵدینگ',
      descEn: 'Link branch laptops & terminals with holding sync gateway',
      icon: CloudLightning,
      action: () => setIsCloudSyncModalOpen(true)
    },
    {
      id: 'printer-station',
      titleKu: 'وێستگەی چاپ و پرینتەر',
      titleEn: 'Printer & Print Station',
      descKu: 'بەڕێوەبردنی پرینتەرەکان، پسوولەکان و قەبارەی کاغەز',
      descEn: 'Manage holding printers, voucher layouts & default device',
      icon: Printer,
      action: () => setIsPrinterModalOpen(true)
    },
    {
      id: 'esignature-studio',
      titleKu: 'ستۆدیۆی واژۆی ئەلیکترۆنی',
      titleEn: 'E-Signature Studio',
      descKu: 'تۆمارکردن و بەڕێوەبردنی واژۆی فەرمی بەڕێوەبەران',
      descEn: 'Create & assign authorized digital signatures for approvals',
      icon: PenTool,
      action: () => setIsSignatureModalOpen(true)
    },
    {
      id: 'skyline-theme',
      titleKu: 'باکگراوند و ڕووکاری هۆڵدینگ',
      titleEn: 'Skyline Background Theme',
      descKu: 'گۆڕینی وێنەی باکگراوند، شەفافییەت و تەڵخی ڕووکار',
      descEn: 'Customize corporate skyline backdrop, opacity & blur',
      icon: Image,
      action: () => setIsSkylineModalOpen(true)
    },
    {
      id: 'bulk-import',
      titleKu: 'هاوردەکردنی داتای Excel/CSV',
      titleEn: 'Bulk Excel / CSV Import',
      descKu: 'هاوردەکردنی خێرای کۆمپانیا، کارمەند، کۆگا و ژمێریاری',
      descEn: 'Batch import companies, projects, staff, warehouse & ledgers',
      icon: FileSpreadsheet,
      action: () => setIsImportModalOpen(true)
    },
    {
      id: 'client-license',
      titleKu: 'کاراکردنی کلیلی لایسنس',
      titleEn: 'Client License Activation',
      descKu: `باری مۆڵەت: ${systemLicense.licenseType} · داخڵکردنی کلیل بۆ هۆڵدینگ`,
      descEn: `Status: ${systemLicense.licenseType} · Enter holding activation key`,
      icon: Key,
      action: () => openLicenseModal('activate')
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1-Click Official Firebase Cloud Database Card */}
      <FirebaseOneClickConnect variant="card" />

      {/* Autonomous Holding & IT Control Center */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {language === 'ku'
                  ? 'ناوەندی سەربەخۆی ڕێکخستنەکانی هۆڵدینگ و IT'
                  : 'Holding & IT Settings Hub'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ku'
                  ? `سەرجەم ڕێکخستنەکانی "${holding.nameKu || holding.name || 'هۆڵدینگ'}" لێرەوە بە سەربەخۆیی بەڕێوەدەبرێن.`
                  : `All configurations for "${holding.name || 'Holding'}" are autonomously managed here.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCloudSyncModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shrink-0 self-start md:self-auto"
          >
            <CloudLightning className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'وێستگەی Cloud Sync' : 'Cloud Sync Gateway'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickSettingsCards.map((card) => {
            const IconComp = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={card.action}
                className="group p-3.5 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-slate-300 text-start transition flex items-start gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 group-hover:text-slate-900 group-hover:border-slate-300 flex items-center justify-center shrink-0 transition">
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs text-slate-900 truncate">
                    {language === 'ku' ? card.titleKu : card.titleEn}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                    {language === 'ku' ? card.descKu : card.descEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Clean 2-Tier IT Operational Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl flex-wrap gap-0.5">
            {coreItTabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeItTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveItTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{language === 'ku' ? tab.labelKu : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedDiagnostics(prev => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer inline-flex items-center gap-1.5 ${
              showAdvancedDiagnostics || isAdvancedTabActive
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <span>
              {language === 'ku'
                ? `پشکنین و تۆڕی پێشکەوتوو (${advancedItTabs.length})`
                : `Advanced Diagnostics (${advancedItTabs.length})`}
            </span>
            {showAdvancedDiagnostics || isAdvancedTabActive ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {(showAdvancedDiagnostics || isAdvancedTabActive) && (
          <div className="pt-2.5 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
            {advancedItTabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeItTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveItTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{language === 'ku' ? tab.labelKu : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tab 0: Real-Time Sync Health Dashboard (Aggregated Fleet Heartbeats, Buffer Caches & Sync Queues) */}
      {activeItTab === 'SYNC_HEALTH' && <SyncHealthDashboardView />}

      {/* Automated Threshold-Based Hardware Alert & Notification System */}
      {activeItTab === 'THRESHOLD_ALERTS' && <HardwareAlertThresholdView />}

      {/* D3.js Visual Asset Utilization & Maintenance Distribution Dashboard */}
      {activeItTab === 'ASSET_UTILIZATION' && <AssetUtilizationDashboardView />}

      {/* Hardware Asset Tracking & ERP QR Code Mapping View */}
      {activeItTab === 'ASSET_TRACKING' && <HardwareAssetTrackingView />}

      {/* Hardware Maintenance, Inspection Scheduling & Warranty Management */}
      {activeItTab === 'HARDWARE_MAINTENANCE' && <HardwareMaintenanceView />}

      {/* Tab 1: Real-Time Network Latency & Multi-Site Connectivity Monitor */}
      {activeItTab === 'LATENCY_MONITOR' && <NetworkLatencyMonitorView />}

      {/* Tab 2: Network Bandwidth Manager & Dynamic Auto-QoS Traffic Prioritization */}
      {activeItTab === 'BANDWIDTH_MANAGER' && <NetworkBandwidthManagerView />}

      {/* Tab 3: Automated Cloud-Agnostic Backup & Secondary Encrypted Vault */}
      {activeItTab === 'CLOUD_BACKUP' && <CloudAgnosticBackupView />}

      {/* Tab 3b: Local Data Buffer & Encrypted Offline IndexedDB Cache */}
      {activeItTab === 'LOCAL_BUFFER' && <LocalDataBufferView />}

      {/* Tab 2: Smart Sync Relay & Central Discovery Service */}
      {activeItTab === 'SMART_RELAY' && <SmartSyncRelayView />}

      {/* Tab 3: Geographical Operational Zones & IP Boundary Management */}
      {activeItTab === 'GEO_ZONES' && <GeographicalOperationalZonesView />}

      {/* Tab 4: Sync Conflict Resolution Engine */}
      {activeItTab === 'CONFLICTS' && <SyncConflictResolutionView />}

      {/* Tab 5: 30-Day Periodic Security Audit Report with Direct PDF Export */}
      {activeItTab === 'AUDIT_REPORT' && <SecurityAuditReportPdfView />}

      {/* Tab 5: Enterprise IT Infrastructure & Gate Network */}
      {activeItTab === 'INFRASTRUCTURE' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                <span>{language === 'ku' ? 'سێرڤەرە سەرەکییەکان و ژێرخانی دەروازە' : 'Central Servers & Gate Surveillance Hardware'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'ku'
                  ? 'چاودێری بەردەوامی سێرڤەری سەرەکی، فایەروۆڵ، و کامێراکانی دەروازەی مەیدانی'
                  : 'Central high-availability servers, firewall appliances, and optical gate cameras across subsidiaries.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {itAssets.map((asset) => (
              <div key={asset.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                    {asset.assetTag}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {asset.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">{asset.deviceType}</h3>
                <div className="text-xs text-slate-600 space-y-1">
                  <span className="font-mono text-blue-600 block font-semibold">{asset.ipAddress}</span>
                  <span className="text-slate-400 text-[11px] block">Assigned: {asset.assignedTo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Cloud Topology & Multi-Site Active Sync State */}
      {activeItTab === 'CLOUD_TOPOLOGY' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <CloudLightning className="w-5 h-5 text-indigo-600" />
                <span>{language === 'ku' ? 'تۆڕی لاپتۆپ و لقە بەستراوەکانی هۆڵدینگ' : 'Holding Multi-Laptop Connected Nodes'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'ku'
                  ? 'هەموو ئەو لاپتۆپ و ئامێرانەی ئێستا لەسەر ئەم هۆڵدینگەیە کراوەن'
                  : 'Active laptops and branch workstations connected with the shared holding sync key.'}
              </p>
            </div>
            <button
              onClick={() => setIsCloudSyncModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {language === 'ku' ? 'بەڕێوەبردنی کلیلی هۆڵدینگ و لقەکان' : 'Manage Holding Key & Sites'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Holding Sync Key</span>
              <span className="font-mono text-base font-extrabold text-indigo-700 block">
                {holdingCloudSyncStatus.holdingKey}
              </span>
              <span className="text-xs text-slate-500">
                Mode: <strong className="text-emerald-600">{holdingCloudSyncStatus.connectionMode}</strong> • Version: v{holdingCloudSyncStatus.version}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase block">Connected Devices</span>
              <span className="text-xl font-black text-slate-900 block font-mono">
                {holdingCloudSyncStatus.activeLaptops.length} Laptops Online
              </span>
              <span className="text-xs text-slate-500">
                Last broadcast: {holdingCloudSyncStatus.lastSyncTime ? new Date(holdingCloudSyncStatus.lastSyncTime).toLocaleTimeString() : 'Active'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
