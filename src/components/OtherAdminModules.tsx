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
  ShieldAlert
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
  const { itAssets, setIsCloudSyncModalOpen, holdingCloudSyncStatus } = useERP();
  const { t, language } = useLanguage();
  const [activeItTab, setActiveItTab] = useState<'SYNC_HEALTH' | 'THRESHOLD_ALERTS' | 'ASSET_UTILIZATION' | 'ASSET_TRACKING' | 'HARDWARE_MAINTENANCE' | 'LATENCY_MONITOR' | 'BANDWIDTH_MANAGER' | 'LOCAL_BUFFER' | 'CLOUD_BACKUP' | 'SMART_RELAY' | 'GEO_ZONES' | 'CONFLICTS' | 'AUDIT_REPORT' | 'INFRASTRUCTURE' | 'CLOUD_TOPOLOGY'>('SYNC_HEALTH');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Module Navigation Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-3 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveItTab('SYNC_HEALTH')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'SYNC_HEALTH'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{language === 'ku' ? 'داشبۆردی تەندروستی سینک' : 'Sync Health Dashboard'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              activeItTab === 'SYNC_HEALTH' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Fleet
            </span>
          </button>

          <button
            onClick={() => setActiveItTab('THRESHOLD_ALERTS')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'THRESHOLD_ALERTS'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 ring-2 ring-rose-400/30'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-300" />
            <span>{language === 'ku' ? 'سستەمی ئاگاداری سنورەکان' : 'Threshold Alert Engine'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              activeItTab === 'THRESHOLD_ALERTS' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              SLA Auto-Alerts
            </span>
          </button>

          <button
            onClick={() => setActiveItTab('ASSET_UTILIZATION')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'ASSET_UTILIZATION'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-400/30'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>{language === 'ku' ? 'داشبۆردی بەکارهێنانی ئامێرەکان (D3)' : 'Asset Utilization Dashboard'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              activeItTab === 'ASSET_UTILIZATION' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
            }`}>
              D3 Visual
            </span>
          </button>

          <button
            onClick={() => setActiveItTab('ASSET_TRACKING')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'ASSET_TRACKING'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{language === 'ku' ? 'چاودێری ئامێرەکان و QR' : 'Hardware Asset Tracking & QR'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              activeItTab === 'ASSET_TRACKING' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
            }`}>
              QR Mapped
            </span>
          </button>

          <button
            onClick={() => setActiveItTab('HARDWARE_MAINTENANCE')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'HARDWARE_MAINTENANCE'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>{language === 'ku' ? 'چاککردنەوە و گەرەنتی' : 'Maintenance & Warranty'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              activeItTab === 'HARDWARE_MAINTENANCE' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              Repair SLA
            </span>
          </button>

          <button
            onClick={() => setActiveItTab('LATENCY_MONITOR')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'LATENCY_MONITOR'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{language === 'ku' ? 'چاودێری خێرایی و سەقامگیری تۆڕ' : 'Network Latency & Stability'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              activeItTab === 'LATENCY_MONITOR' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Ping
            </span>
          </button>

          <button
            onClick={() => setActiveItTab('BANDWIDTH_MANAGER')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'BANDWIDTH_MANAGER'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>{language === 'ku' ? 'بەڕێوەبەری باندویس (Auto-QoS)' : 'Bandwidth Manager (Auto-QoS)'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              activeItTab === 'BANDWIDTH_MANAGER' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
            }`}>
              Auto-QoS Active
            </span>
          </button>

          <button
            onClick={() => setActiveItTab('LOCAL_BUFFER')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'LOCAL_BUFFER'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>{language === 'ku' ? 'بافەری داتای لۆکاڵ (IndexedDB)' : 'Local Data Buffer (IndexedDB)'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              activeItTab === 'LOCAL_BUFFER' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              Offline Cache
            </span>
          </button>

          <button
            onClick={() => setActiveItTab('CLOUD_BACKUP')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'CLOUD_BACKUP'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>{language === 'ku' ? 'گرتەی ئۆتۆماتیکی و گەنجینە' : 'Auto-Backup & Secondary Vault'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              activeItTab === 'CLOUD_BACKUP' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              Zero Loss
            </span>
          </button>

          <button
            onClick={() => setActiveItTab('SMART_RELAY')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'SMART_RELAY'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>{language === 'ku' ? 'ڕیلەیی زیرەک و سێرڤیسی دۆزینەوە' : 'Smart Sync Relay & Discovery'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeItTab === 'SMART_RELAY' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
            }`}>
              No Static IP
            </span>
          </button>

          <button
            onClick={() => setActiveItTab('GEO_ZONES')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'GEO_ZONES'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{language === 'ku' ? 'نەخشەی زۆنەکان و سنووری ئایپی' : 'Geographical Operational Zones & IP Boundaries'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeItTab === 'GEO_ZONES' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
            }`}>
              7 Sites
            </span>
          </button>

          <button
            onClick={() => setActiveItTab('CONFLICTS')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'CONFLICTS'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{language === 'ku' ? 'چارەسەری ناکۆکییەکانی سینک (Sync Conflicts)' : 'Sync Conflict Resolution'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeItTab === 'CONFLICTS' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              Live Engine
            </span>
          </button>

          <button
            onClick={() => setActiveItTab('AUDIT_REPORT')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'AUDIT_REPORT'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'ku' ? 'ڕاپۆرتی وردبینی ئاسایش (PDF, Excel, CSV)' : 'Security Audit Report (PDF, Excel, CSV)'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              activeItTab === 'AUDIT_REPORT' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              <ShieldCheck className="w-3 h-3" />
              PDF • XLSX • CSV
            </span>
          </button>

          <button
            onClick={() => setActiveItTab('INFRASTRUCTURE')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'INFRASTRUCTURE'
                ? 'bg-slate-800 text-white shadow-md shadow-slate-800/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{language === 'ku' ? 'سێرڤەر و ژێرخانی ئایتی' : 'Hardware & Gate Infrastructure'}</span>
          </button>

          <button
            onClick={() => setActiveItTab('CLOUD_TOPOLOGY')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeItTab === 'CLOUD_TOPOLOGY'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <CloudLightning className="w-4 h-4" />
            <span>{language === 'ku' ? 'تۆڕی لاپتۆپەکانی هۆڵدینگ' : 'Holding Cloud Nodes'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </div>

        <button
          onClick={() => setIsCloudSyncModalOpen(true)}
          className="px-3.5 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <CloudLightning className="w-3.5 h-3.5 text-blue-600" />
          <span>{language === 'ku' ? 'کردنەوەی وێستگەی سینکی خۆکار' : 'Holding Cloud Gateway Station'}</span>
        </button>
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
