import React, { useState } from 'react';
import {
  Activity,
  ScanLine,
  CheckCircle2,
  XCircle,
  Flame,
  Mail,
  Zap,
  Users,
  Clock,
  ChevronRight,
  Filter,
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';

type ActivityCategory = 'ALL' | 'FINANCE' | 'LOGISTICS' | 'HSE' | 'LETTERS';

interface UnifiedActivityItem {
  id: string;
  timestamp: string;
  category: 'FINANCE' | 'LOGISTICS' | 'HSE' | 'LETTERS' | 'TECHNICAL';
  title: string;
  subtitle: string;
  companyName: string;
  badgeText: string;
  badgeType: 'success' | 'warning' | 'info' | 'danger';
  icon: any;
  targetTab?: string;
}

export const LiveActivityFeedWidget: React.FC = () => {
  const {
    gateLogs,
    purchaseOrders,
    hseLogs,
    correspondence,
    technicalEquipments,
    companies,
    setActiveTab,
    setIsGateScannerOpen,
  } = useERP();

  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>('ALL');

  // Build unified activities stream
  const activities: UnifiedActivityItem[] = [
    // Gate Scans
    ...gateLogs.map(log => {
      const comp = companies.find(c => c.id === log.companyId);
      return {
        id: `gate-${log.id}`,
        timestamp: log.scannedAt,
        category: 'LOGISTICS' as const,
        title: `Gate Verified: ${log.materialSummary}`,
        subtitle: `PO ${log.poNumber} • Truck Plate: ${log.vehiclePlate} (${log.driverName}) • Officer: ${log.securityOfficer}`,
        companyName: comp?.code || 'HOLDING',
        badgeText: `$${log.totalAmountUSD.toLocaleString()}`,
        badgeType: 'success' as const,
        icon: ScanLine,
        targetTab: 'gate-scanner',
      };
    }),

    // Purchase Orders (Recent)
    ...purchaseOrders.map(po => {
      const comp = companies.find(c => c.id === po.companyId);
      const isApproved = po.status === 'APPROVED_BY_OWNER';
      const isPending = po.status === 'PENDING_OWNER_APPROVAL';
      return {
        id: `po-${po.id}`,
        timestamp: po.createdDate,
        category: 'FINANCE' as const,
        title: `PO ${po.poNumber}: ${po.supplierName}`,
        subtitle: `"${po.purpose}" • Requested by: ${po.requestedBy}`,
        companyName: comp?.code || 'HOLDING',
        badgeText: isApproved ? 'Owner Approved' : isPending ? 'Pending Owner' : po.status,
        badgeType: isApproved ? 'success' as const : isPending ? 'warning' as const : 'info' as const,
        icon: DollarSign,
        targetTab: 'owner-approvals',
      };
    }),

    // HSE Logs
    ...hseLogs.map(log => {
      const comp = companies.find(c => c.id === log.companyId);
      return {
        id: `hse-${log.id}`,
        timestamp: log.date || '',
        category: 'HSE' as const,
        title: `Safety Log: ${log.title}`,
        subtitle: `${log.description} • Inspector: ${log.inspectorName}`,
        companyName: comp?.code || 'HOLDING',
        badgeText: log.status,
        badgeType: log.status === 'PASSED' || log.status === 'RESOLVED' ? 'success' as const : 'warning' as const,
        icon: Flame,
        targetTab: 'hse-security',
      };
    }),

    // Correspondence
    ...correspondence.map(letter => {
      return {
        id: `letter-${letter.id}`,
        timestamp: letter.date || '',
        category: 'LETTERS' as const,
        title: `Official Letter ${letter.letterNumber}: ${letter.subject}`,
        subtitle: `From: ${letter.senderOrg} (${letter.senderPerson}) ➔ To: ${letter.receiverOrg} • Stage: ${letter.approvalStage}`,
        companyName: 'HQ DIRECTIVE',
        badgeText: letter.urgency,
        badgeType: letter.urgency === 'TOP_SECRET_EXECUTIVE' || letter.urgency === 'URGENT' ? 'warning' as const : 'info' as const,
        icon: Mail,
        targetTab: 'correspondence',
      };
    }),
  ];

  // Sort descending by timestamp safely
  const sortedActivities = [...activities].sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

  const filteredActivities = selectedCategory === 'ALL'
    ? sortedActivities
    : sortedActivities.filter(a => a.category === selectedCategory);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
      
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {t('recentActivitiesTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                Real-time corporate timeline of truck gate entries, PO authorizations, safety audits, and official decrees.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Stream
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('LOGISTICS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'LOGISTICS'
                ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gate Deliveries
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('FINANCE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'FINANCE'
                ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            POs & Sign-offs
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('HSE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'HSE'
                ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HSE & Safety
          </button>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {filteredActivities.slice(0, 6).map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.targetTab === 'gate-scanner') {
                  setIsGateScannerOpen(true);
                } else if (item.targetTab) {
                  setActiveTab(item.targetTab);
                }
              }}
              className="bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-blue-300 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition group cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                      {item.companyName}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200/60">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  item.badgeType === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : item.badgeType === 'warning'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {item.badgeText}
                </span>
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {item.timestamp}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
