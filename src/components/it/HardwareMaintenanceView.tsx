import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  HardwareMaintenanceRecord,
  HardwareWarrantyMatrixItem,
  MaintenanceOverviewKPIs,
  MaintenanceType,
  MaintenanceStatus,
  MaintenancePriority,
  HardwareAssetRecord
} from '../../types/itAssetTracking';
import {
  Wrench,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Server,
  Scan,
  Radio,
  Cpu,
  MapPin,
  Phone,
  DollarSign,
  FileText,
  Check,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Sliders,
  AlertCircle
} from 'lucide-react';

export const HardwareMaintenanceView: React.FC = () => {
  const { language } = useLanguage();

  // State
  const [activeTab, setActiveTab] = useState<'LOGS' | 'WARRANTY_MATRIX' | 'SCHEDULED_ROADMAP'>('LOGS');
  const [records, setRecords] = useState<HardwareMaintenanceRecord[]>([]);
  const [warrantyMatrix, setWarrantyMatrix] = useState<HardwareWarrantyMatrixItem[]>([]);
  const [kpis, setKpis] = useState<MaintenanceOverviewKPIs | null>(null);
  const [hardwareAssets, setHardwareAssets] = useState<HardwareAssetRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [siteFilter, setSiteFilter] = useState<string>('ALL');

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState<boolean>(false);
  const [completeModalRecord, setCompleteModalRecord] = useState<HardwareMaintenanceRecord | null>(null);
  const [detailModalRecord, setDetailModalRecord] = useState<HardwareMaintenanceRecord | null>(null);
  const [actionNotice, setActionNotice] = useState<{ ku: string; en: string } | null>(null);

  // Form State: Schedule New Ticket
  const [formAssetId, setFormAssetId] = useState<string>('');
  const [formMaintenanceType, setFormMaintenanceType] = useState<MaintenanceType>('SCHEDULED_INSPECTION');
  const [formPriority, setFormPriority] = useState<MaintenancePriority>('MEDIUM');
  const [formScheduledDate, setFormScheduledDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [formTechnicianName, setFormTechnicianName] = useState<string>('Diyar Nawzad');
  const [formTechnicianPhone, setFormTechnicianPhone] = useState<string>('+964 750 441 2289');
  const [formServiceProvider, setFormServiceProvider] = useState<any>('INTERNAL_HOLDING_IT');
  const [formWarrantyCovered, setFormWarrantyCovered] = useState<boolean>(true);
  const [formCostUSD, setFormCostUSD] = useState<number>(0);
  const [formTitleEn, setFormTitleEn] = useState<string>('');
  const [formTitleKu, setFormTitleKu] = useState<string>('');
  const [formDescriptionEn, setFormDescriptionEn] = useState<string>('');
  const [formDescriptionKu, setFormDescriptionKu] = useState<string>('');

  // Form State: Complete Ticket
  const [completeFindingsEn, setCompleteFindingsEn] = useState<string>('');
  const [completeFindingsKu, setCompleteFindingsKu] = useState<string>('');
  const [completePartsText, setCompletePartsText] = useState<string>('');
  const [completeFinalCost, setCompleteFinalCost] = useState<number>(0);

  // Fetch all maintenance data
  const fetchMaintenanceData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [recordsRes, matrixRes, overviewRes, assetsRes] = await Promise.all([
        fetch('/api/it-maintenance'),
        fetch('/api/it-maintenance/warranty-matrix'),
        fetch('/api/it-maintenance/overview'),
        fetch('/api/it-assets')
      ]);

      if (recordsRes.ok && recordsRes.headers.get('content-type')?.includes('application/json')) {
        const data = await recordsRes.json();
        if (data.records) setRecords(data.records);
      }

      if (matrixRes.ok && matrixRes.headers.get('content-type')?.includes('application/json')) {
        const matrixData = await matrixRes.json();
        if (matrixData.matrix) setWarrantyMatrix(matrixData.matrix);
      }

      if (overviewRes.ok && overviewRes.headers.get('content-type')?.includes('application/json')) {
        const kpiData = await overviewRes.json();
        if (kpiData.kpis) setKpis(kpiData.kpis);
      }

      if (assetsRes.ok && assetsRes.headers.get('content-type')?.includes('application/json')) {
        const assetsData = await assetsRes.json();
        if (assetsData.assets) {
          setHardwareAssets(assetsData.assets);
          if (!formAssetId && assetsData.assets.length > 0) {
            setFormAssetId(assetsData.assets[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch maintenance data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  // Filtered maintenance records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && r.maintenanceType !== typeFilter) return false;
      if (siteFilter !== 'ALL' && r.siteId !== siteFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTicket = r.ticketNumber.toLowerCase().includes(q);
        const matchTag = r.assetTag.toLowerCase().includes(q);
        const matchModel = r.assetModel.toLowerCase().includes(q);
        const matchTitle = r.titleEn.toLowerCase().includes(q) || r.titleKu.includes(q);
        const matchTech = r.technicianName.toLowerCase().includes(q);
        if (!matchTicket && !matchTag && !matchModel && !matchTitle && !matchTech) return false;
      }
      return true;
    });
  }, [records, statusFilter, typeFilter, siteFilter, searchQuery]);

  // Project sites list
  const sitesList = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach(r => map.set(r.siteId, r.siteNameEn));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [records]);

  // Handle Submit New Ticket
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAssetId || !formTitleEn.trim() || !formScheduledDate) return;

    try {
      const res = await fetch('/api/it-maintenance/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: formAssetId,
          maintenanceType: formMaintenanceType,
          priority: formPriority,
          scheduledDate: formScheduledDate,
          technicianName: formTechnicianName,
          technicianPhone: formTechnicianPhone,
          serviceProvider: formServiceProvider,
          warrantyCovered: formWarrantyCovered,
          costUSD: formCostUSD,
          titleEn: formTitleEn,
          titleKu: formTitleKu || formTitleEn,
          descriptionEn: formDescriptionEn,
          descriptionKu: formDescriptionKu
        })
      });

      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setActionNotice({
          ku: data.messageKu || 'تیکتی چاککردنەوە بە سەرکەوتوویی تۆمارکرا.',
          en: data.messageEn || 'Maintenance ticket scheduled successfully.'
        });
        setTimeout(() => setActionNotice(null), 4000);
        setScheduleModalOpen(false);
        // Reset form inputs
        setFormTitleEn('');
        setFormTitleKu('');
        setFormDescriptionEn('');
        setFormDescriptionKu('');
        await fetchMaintenanceData(true);
      }
    } catch (err) {
      console.error('Failed to schedule maintenance:', err);
    }
  };

  // Handle Mark Complete
  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalRecord) return;

    const parts = completePartsText
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/it-maintenance/${completeModalRecord.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          findingsAndOutcomeEn: completeFindingsEn,
          findingsAndOutcomeKu: completeFindingsKu,
          partsReplaced: parts,
          costUSD: completeFinalCost
        })
      });

      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setActionNotice({
          ku: data.messageKu || 'تیکت بە سەرکەوتوویی وەک تەواوبوو لۆگ کرا.',
          en: data.messageEn || 'Maintenance marked completed.'
        });
        setTimeout(() => setActionNotice(null), 4000);
        setCompleteModalRecord(null);
        await fetchMaintenanceData(true);
      }
    } catch (err) {
      console.error('Failed to complete maintenance:', err);
    }
  };

  // Status & Priority Badges
  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-500" />
            Scheduled
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 animate-pulse">
            <Wrench className="w-3 h-3 text-indigo-500" />
            In Progress
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            Overdue
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
            Cancelled
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: MaintenancePriority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-slate-500">LOW</span>;
    }
  };

  const getTypeBadge = (type: MaintenanceType) => {
    switch (type) {
      case 'SCHEDULED_INSPECTION':
        return <span className="text-indigo-600 font-bold flex items-center gap-1 text-[11px]"><Calendar className="w-3 h-3" /> Inspection</span>;
      case 'REPAIR_TICKET':
        return <span className="text-amber-700 font-bold flex items-center gap-1 text-[11px]"><Wrench className="w-3 h-3" /> Repair</span>;
      case 'EMERGENCY_BREAKDOWN':
        return <span className="text-rose-700 font-bold flex items-center gap-1 text-[11px]"><AlertCircle className="w-3 h-3" /> Emergency</span>;
      case 'FIRMWARE_SECURITY_PATCH':
        return <span className="text-blue-600 font-bold flex items-center gap-1 text-[11px]"><ShieldCheck className="w-3 h-3" /> Firmware Patch</span>;
      case 'PREVENTATIVE_CLEANING':
        return <span className="text-teal-600 font-bold flex items-center gap-1 text-[11px]"><Sliders className="w-3 h-3" /> Cleaning & Service</span>;
      default:
        return <span className="text-slate-600 font-medium text-[11px]">{type}</span>;
    }
  };

  const getWarrantyBadge = (status: HardwareWarrantyMatrixItem['warrantyStatus'], days: number) => {
    switch (status) {
      case 'ACTIVE_WARRANTY':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Active ({days}d left)
          </span>
        );
      case 'EXPIRING_SOON_30D':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Expiring ({days}d left)
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Expired
          </span>
        );
      case 'EXTENDED_SLA':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Extended SLA
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Maintenance KPI Stat Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-50/70 via-transparent to-transparent -mr-20 -mt-20 rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{language === 'ku' ? 'خشتەی چاککردنەوە و گەرەنتی ئامێرەکان' : 'Hardware Maintenance & Warranty Management'}</span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    SLA Active
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'ku'
                    ? 'تۆماری مێژووی چاککردنەوە، پشکنینە خولییەکان، ڕەوشی گەرەنتی (Warranty SLA)، و گۆڕینی کەلوپەلە یەدەگەکانی سێرڤەر و دەروازە'
                    : 'Track repair history, scheduled periodic inspections, warranty coverage periods, and spare parts logs across physical IT hardware.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'دیاریکردنی پشکنین یان چاککردنەوە' : 'Schedule Inspection / Repair'}</span>
            </button>

            <button
              onClick={() => fetchMaintenanceData(false)}
              disabled={isRefreshing}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer disabled:opacity-50"
              title="Refresh Maintenance Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Action Notice */}
        {actionNotice && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs text-indigo-900 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold">{language === 'ku' ? actionNotice.ku : actionNotice.en}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-indigo-400 hover:text-indigo-700 font-bold">×</button>
          </div>
        )}

        {/* Maintenance Stat KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
          {/* Card 1: Total Records */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'تێکڕای لۆگی چاککردنەوە' : 'Total Service Tickets'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {kpis?.totalMaintenanceRecords ?? records.length}
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                Logged
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              {kpis?.completedThisYearCount ?? 3} Closed & Restored
            </span>
          </div>

          {/* Card 2: Scheduled Inspections */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'پشکنینی داهاتوو' : 'Scheduled Inspections'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-900">
                {kpis?.scheduledUpcomingCount ?? 3}
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                Upcoming
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Quarterly Hardware PMs
            </span>
          </div>

          {/* Card 3: Overdue Alerts */}
          <div className={`p-3.5 rounded-2xl border space-y-1 transition ${
            (kpis?.overdueInspectionsCount ?? 0) > 0
              ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-200'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              {language === 'ku' ? 'پشکنینی دواکەوتوو' : 'Overdue Tickets'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-900">
                {kpis?.overdueInspectionsCount ?? 1}
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                Attention
              </span>
            </div>
            <span className="text-[10px] text-rose-500 block truncate">
              Zakho Border Scanner Lens
            </span>
          </div>

          {/* Card 4: Warranty SLA Coverage */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'ڕێژەی گەرەنتی (SLA)' : 'Warranty Coverage'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-900">
                {kpis?.underWarrantyPercent ?? 93}%
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                Active SLA
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Dell, Cisco & Hikvision Care
            </span>
          </div>

          {/* Card 5: Total Spend */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/40 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'تێچووی پارچەکان' : 'Maintenance Spend'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-900">
                ${kpis?.totalRepairSpendUSD ?? 470}
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                USD
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Non-Warranty Spares & Labor
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-3 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'LOGS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'تیکت و لۆگەکان' : 'Maintenance Tickets & Logs'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-white">
              {records.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('WARRANTY_MATRIX')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'WARRANTY_MATRIX'
                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'خشتەی گەرەنتی ئامێرەکان' : 'Hardware Warranty Matrix'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
              {warrantyMatrix.length} Units
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SCHEDULED_ROADMAP')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'SCHEDULED_ROADMAP'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'ڕێڕەوی پشکنینی خولیی' : 'Inspection Due Roadmap'}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Maintenance Tickets & Logs */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <div className="relative min-w-[200px] flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ku' ? 'گەڕان بەپێی تیکت، تاگی ئامێر، تەکنیکار...' : 'Search by ticket #, asset tag, title, tech...'}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1 overflow-x-auto py-1">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  All ({records.length})
                </button>
                <button
                  onClick={() => setStatusFilter('SCHEDULED')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'SCHEDULED' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  Scheduled
                </button>
                <button
                  onClick={() => setStatusFilter('OVERDUE')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'OVERDUE' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  Overdue
                </button>
                <button
                  onClick={() => setStatusFilter('COMPLETED')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Site selector */}
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none cursor-pointer self-end md:self-auto"
            >
              <option value="ALL">{language === 'ku' ? 'سەرجەم پڕۆژەکان' : 'All Project Sites'}</option>
              {sitesList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Ticket Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecords.map((ticket) => (
              <div
                key={ticket.id}
                className={`bg-white border rounded-3xl p-5 shadow-xs transition hover:shadow-md space-y-4 flex flex-col justify-between ${
                  ticket.status === 'OVERDUE'
                    ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/10'
                    : 'border-slate-200/90 hover:border-indigo-200'
                }`}
              >
                {/* Header: Ticket # + Priority + Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white">
                        {ticket.ticketNumber}
                      </span>
                      {getPriorityBadge(ticket.priority)}
                      {getTypeBadge(ticket.maintenanceType)}
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {language === 'ku' ? ticket.titleKu : ticket.titleEn}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {language === 'ku' ? ticket.descriptionKu : ticket.descriptionEn}
                    </p>
                  </div>
                </div>

                {/* Target Hardware Mapping & Site */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{ticket.assetTag}</span>
                    </span>
                    <span className="text-slate-500 text-[11px] truncate max-w-[200px]">
                      {ticket.assetModel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                      <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span>{language === 'ku' ? ticket.siteNameKu : ticket.siteNameEn}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Date: <strong className="text-slate-800">{ticket.scheduledDate}</strong></span>
                    </span>
                  </div>
                </div>

                {/* Parts Replaced & Findings (If completed) */}
                {ticket.partsReplaced && ticket.partsReplaced.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {language === 'ku' ? 'پارچەی گۆڕدراو (Parts Replaced):' : 'Replaced Hardware Components:'}
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {ticket.partsReplaced.map((part, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technician & Action Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500">
                    <span className="block font-medium text-slate-700">{ticket.technicianName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{ticket.technicianPhone}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {ticket.status !== 'COMPLETED' && (
                      <button
                        onClick={() => {
                          setCompleteModalRecord(ticket);
                          setCompleteFindingsEn('');
                          setCompleteFindingsKu('');
                          setCompletePartsText('');
                          setCompleteFinalCost(ticket.costUSD || 0);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'ku' ? 'لۆگکردن و تەواوکردن' : 'Mark Completed'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setDetailModalRecord(ticket)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      {language === 'ku' ? 'وردەکاری' : 'Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Hardware Warranty Expiration Matrix */}
      {activeTab === 'WARRANTY_MATRIX' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>{language === 'ku' ? 'خشتەی گەرەنتی و پاراستنی ئامێرە فیزیاییەکان' : 'Enterprise Hardware Warranty SLA Matrix'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ku'
                  ? 'چاودێری ماوەی گەرەنتی کارگە، کاتی بەسەرچوون، و ڕێگەپێدانی گۆڕینەوەی RMA'
                  : 'Hardware manufacturer warranties, expiration countdowns, and RMA return entitlement.'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Asset & Device</th>
                  <th className="px-4 py-3.5">Project Site</th>
                  <th className="px-4 py-3.5">Install Date</th>
                  <th className="px-4 py-3.5">Warranty Expiry</th>
                  <th className="px-4 py-3.5">SLA Days Remaining</th>
                  <th className="px-4 py-3.5">Support Agreement</th>
                  <th className="px-4 py-3.5">RMA Eligible</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {warrantyMatrix.map((item) => (
                  <tr key={item.assetId} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-slate-900 text-white">
                          {item.assetTag}
                        </span>
                        <div>
                          <strong className="block text-slate-900">{item.model}</strong>
                          <span className="text-[11px] text-slate-400">{item.manufacturer}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-800 block">
                        {language === 'ku' ? item.assignedSiteNameKu : item.assignedSiteNameEn}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-mono text-slate-600">
                      {item.installDate}
                    </td>

                    <td className="px-4 py-4 font-mono font-bold text-slate-800">
                      {item.warrantyExpiry}
                    </td>

                    <td className="px-4 py-4">
                      {getWarrantyBadge(item.warrantyStatus, item.daysRemaining)}
                    </td>

                    <td className="px-4 py-4 text-xs font-medium text-slate-700">
                      {item.warrantyProvider}
                    </td>

                    <td className="px-4 py-4">
                      {item.rmaClaimEligible ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Yes (Active RMA)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                          Expired (Paid Service)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => {
                          setFormAssetId(item.assetId);
                          setFormTitleEn(`Pre-warranty inspection & hardware certification for ${item.assetTag}`);
                          setFormMaintenanceType('SCHEDULED_INSPECTION');
                          setScheduleModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer"
                      >
                        Schedule Inspection
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Scheduled Roadmap & Upcoming Inspections */}
      {activeTab === 'SCHEDULED_ROADMAP' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>{language === 'ku' ? 'خشتەی پشکنینە چاوەڕوانکراوەکان (Upcoming Inspection Schedule)' : 'Scheduled Hardware Inspection Timeline'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ku'
                  ? 'ڕێکخستنی کاتی سەردانی ئەندازیاران بۆ کارگە و دەروازەکان'
                  : 'Chronological timeline of upcoming preventive maintenance windows across project sites.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {records
              .filter(r => r.status === 'SCHEDULED' || r.status === 'IN_PROGRESS' || r.status === 'OVERDUE')
              .map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {new Date(ticket.scheduledDate).getDate()}
                      <span className="text-[9px] uppercase block">
                        {new Date(ticket.scheduledDate).toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">{ticket.ticketNumber}</span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-100 font-bold">{ticket.assetTag}</span>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {language === 'ku' ? ticket.titleKu : ticket.titleEn}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {language === 'ku' ? ticket.siteNameKu : ticket.siteNameEn} • Tech: {ticket.technicianName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => {
                        setCompleteModalRecord(ticket);
                        setCompleteFindingsEn('');
                        setCompleteFindingsKu('');
                        setCompletePartsText('');
                        setCompleteFinalCost(ticket.costUSD || 0);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Complete Now
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modal 1: Schedule Inspection or Log Repair Ticket */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {language === 'ku' ? 'دیاریکردنی پشکنین یان چاککردنەوەی نوێ' : 'Schedule Hardware Inspection or Log Repair'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Create maintenance ticket with warranty & technician assignment
                  </span>
                </div>
              </div>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Target Asset */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {language === 'ku' ? 'ئامێری مەبەست (Physical Hardware Unit):' : 'Target Hardware Unit:'}
                  </label>
                  <select
                    value={formAssetId}
                    onChange={(e) => setFormAssetId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none"
                    required
                  >
                    {hardwareAssets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.assetTag} — {a.model} ({a.assignedSiteNameEn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Maintenance Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Maintenance Type</label>
                  <select
                    value={formMaintenanceType}
                    onChange={(e) => setFormMaintenanceType(e.target.value as MaintenanceType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="SCHEDULED_INSPECTION">Scheduled Inspection (Periodic Check)</option>
                    <option value="REPAIR_TICKET">Repair Ticket (Hardware Defect)</option>
                    <option value="PREVENTATIVE_CLEANING">Preventative Cleaning & Thermal Paste</option>
                    <option value="FIRMWARE_SECURITY_PATCH">Firmware & Security Patch</option>
                    <option value="WARRANTY_RMA_CLAIM">Warranty RMA Return / Replacement</option>
                    <option value="EMERGENCY_BREAKDOWN">Emergency Breakdown (Surge/Failure)</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Priority Level</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as MaintenancePriority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="CRITICAL">CRITICAL (Emergency / Gate Blocked)</option>
                    <option value="HIGH">HIGH (Degraded Performance / Alert)</option>
                    <option value="MEDIUM">MEDIUM (Standard Routine Schedule)</option>
                    <option value="LOW">LOW (Cosmetic / Cable Management)</option>
                  </select>
                </div>

                {/* Scheduled Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Scheduled Date</label>
                  <input
                    type="date"
                    value={formScheduledDate}
                    onChange={(e) => setFormScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none"
                    required
                  />
                </div>

                {/* Service Provider */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Service Provider</label>
                  <select
                    value={formServiceProvider}
                    onChange={(e) => setFormServiceProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="INTERNAL_HOLDING_IT">Internal Holding IT Team</option>
                    <option value="MANUFACTURER_DELL_PROSUPPORT">Dell ProSupport On-Site</option>
                    <option value="CISCO_SMARTNET">Cisco SmartNet Engineer</option>
                    <option value="HIKVISION_SERVICE_CENTER">Hikvision Service Center</option>
                    <option value="LOCAL_AUTHORIZED_VENDOR">Local Certified Partner</option>
                  </select>
                </div>

                {/* Technician Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Lead Technician Name</label>
                  <input
                    type="text"
                    value={formTechnicianName}
                    onChange={(e) => setFormTechnicianName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none"
                    required
                  />
                </div>

                {/* Technician Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Technician Phone</label>
                  <input
                    type="text"
                    value={formTechnicianPhone}
                    onChange={(e) => setFormTechnicianPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 outline-none"
                  />
                </div>

                {/* Estimated Cost */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Estimated Cost (USD)</label>
                  <input
                    type="number"
                    value={formCostUSD}
                    onChange={(e) => setFormCostUSD(Number(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none"
                  />
                </div>

                {/* Warranty Covered Checkbox */}
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="chk-warranty"
                    checked={formWarrantyCovered}
                    onChange={(e) => setFormWarrantyCovered(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="chk-warranty" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Covered Under Manufacturer Warranty SLA
                  </label>
                </div>
              </div>

              {/* Title En */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Ticket Title (English)</label>
                <input
                  type="text"
                  value={formTitleEn}
                  onChange={(e) => setFormTitleEn(e.target.value)}
                  placeholder="e.g. Quarterly Optical Strobe Recalibration & Lens Heater Check"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none"
                  required
                />
              </div>

              {/* Title Ku */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Ticket Title (Kurdish)</label>
                <input
                  type="text"
                  value={formTitleKu}
                  onChange={(e) => setFormTitleKu(e.target.value)}
                  placeholder="سەردێڕی تیکت بە زمانی کوردی..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none"
                />
              </div>

              {/* Description En */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Description & Scope (English)</label>
                <textarea
                  value={formDescriptionEn}
                  onChange={(e) => setFormDescriptionEn(e.target.value)}
                  placeholder="Provide scope of inspection, expected parts, or reason for repair..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Create Maintenance Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Complete Maintenance Ticket & Log Findings */}
      {completeModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {language === 'ku' ? 'تەواوکردنی تیکت و تۆماری دەرئەنجام' : 'Complete Ticket & Log Outcome'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Restores hardware to Operational Active and logs audit
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCompleteModalRecord(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
              <span className="font-mono font-bold text-slate-900">{completeModalRecord.ticketNumber}</span>
              <h4 className="font-bold text-slate-800">{completeModalRecord.titleEn}</h4>
              <span className="text-[11px] text-slate-500 block">
                Target: {completeModalRecord.assetTag} ({completeModalRecord.assetModel})
              </span>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'ku' ? 'دەرئەنجامی پشکنین و چاککردنەوە (Findings & Outcome En):' : 'Findings & Technical Outcome (English):'}
                </label>
                <textarea
                  value={completeFindingsEn}
                  onChange={(e) => setCompleteFindingsEn(e.target.value)}
                  placeholder="e.g. Cleaned optical sensor, verified laser strobe accuracy at 99.8%, thermal benchmark optimal."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'ku' ? 'دەرئەنجام بە زمانی کوردی (Findings Ku):' : 'Findings & Outcome (Kurdish):'}
                </label>
                <textarea
                  value={completeFindingsKu}
                  onChange={(e) => setCompleteFindingsKu(e.target.value)}
                  placeholder="دەرئەنجامی چاککردنەوە بە زمانی کوردی بنووسە..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'ku' ? 'پارچە یەدەگە گۆڕدراوەکان (Parts Replaced, comma separated):' : 'Parts Replaced (comma-separated):'}
                </label>
                <input
                  type="text"
                  value={completePartsText}
                  onChange={(e) => setCompletePartsText(e.target.value)}
                  placeholder="e.g. Hot-Swap Fan Module 02, Anti-Fog Heated Lens"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'ku' ? 'تێچووی کۆتایی (Final Cost USD):' : 'Final Incurred Cost (USD):'}
                </label>
                <input
                  type="number"
                  value={completeFinalCost}
                  onChange={(e) => setCompleteFinalCost(Number(e.target.value))}
                  min="0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCompleteModalRecord(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Completion & Restore Asset</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Ticket Deep-Dive Detail Modal */}
      {detailModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white">
                  {detailModalRecord.ticketNumber}
                </span>
                {getStatusBadge(detailModalRecord.status)}
              </div>
              <button
                onClick={() => setDetailModalRecord(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">
                {language === 'ku' ? detailModalRecord.titleKu : detailModalRecord.titleEn}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'ku' ? detailModalRecord.descriptionKu : detailModalRecord.descriptionEn}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Hardware Asset:</span>
                <strong className="text-slate-900 font-mono">{detailModalRecord.assetTag}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Project Site:</span>
                <strong className="text-indigo-700">{detailModalRecord.siteNameEn}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Scheduled Date:</span>
                <span className="font-semibold text-slate-800">{detailModalRecord.scheduledDate}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Completed Date:</span>
                <span className="font-semibold text-slate-800">{detailModalRecord.completedDate || 'Pending'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Technician:</span>
                <span className="text-slate-800">{detailModalRecord.technicianName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Service Provider:</span>
                <span className="text-slate-800">{detailModalRecord.serviceProvider}</span>
              </div>
            </div>

            {detailModalRecord.findingsAndOutcomeEn && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Service Findings & Outcome:
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {language === 'ku' && detailModalRecord.findingsAndOutcomeKu ? detailModalRecord.findingsAndOutcomeKu : detailModalRecord.findingsAndOutcomeEn}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-mono">
                Verified: {detailModalRecord.verifiedByAdmin}
              </span>
              <button
                onClick={() => setDetailModalRecord(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
