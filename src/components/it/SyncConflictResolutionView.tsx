import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRightLeft,
  Server,
  Laptop,
  Building2,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Sliders,
  Sparkles,
  Printer,
  ChevronDown,
  ChevronUp,
  FileText,
  BadgeAlert,
  Layers,
  ArrowRight,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  SyncConflictLog,
  ConflictResolutionPolicy,
  ConflictResolutionStatus
} from '../../types/syncConflict';
import {
  initialSyncConflictLogs,
  initialConflictPolicy
} from '../../data/initialSyncConflictData';

export const SyncConflictResolutionView: React.FC = () => {
  const { currentUser, holding, companies, projects, openPrintManager } = useERP();
  const { language, isRtl } = useLanguage();

  const [conflictLogs, setConflictLogs] = useState<SyncConflictLog[]>(() => {
    try {
      const saved = localStorage.getItem('sas4erp_sync_conflicts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialSyncConflictLogs;
  });

  const [policy, setPolicy] = useState<ConflictResolutionPolicy>(() => {
    try {
      const saved = localStorage.getItem('sas4erp_sync_conflict_policy');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialConflictPolicy;
  });

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedConflictId, setExpandedConflictId] = useState<string | null>(conflictLogs[0]?.id || null);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const saveConflicts = (newLogs: SyncConflictLog[]) => {
    setConflictLogs(newLogs);
    try {
      localStorage.setItem('sas4erp_sync_conflicts', JSON.stringify(newLogs));
    } catch {}
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Resolution Action Handlers
  const handleResolveConflict = (
    conflictId: string,
    decision: 'HOLDING_WINS' | 'BRANCH_WINS' | 'MERGE'
  ) => {
    const updated = conflictLogs.map((log) => {
      if (log.id !== conflictId) return log;

      let newStatus: ConflictResolutionStatus = 'RESOLVED_HOLDING_WINS';
      let note = 'Resolved by enforcing Holding Master central database record.';
      let noteKu = 'بڕیاری خاوەنی هۆڵدینگ و سێرڤەری سەرەکی جێبەجێ کرا.';

      if (decision === 'BRANCH_WINS') {
        newStatus = 'RESOLVED_BRANCH_WINS';
        note = 'Accepted site physical field measurement / branch revision.';
        noteKu = 'داتای ڕاستەقینەی ناوچەیی و لقی مەیدانی پەسەند کرا.';
      } else if (decision === 'MERGE') {
        newStatus = 'RESOLVED_MERGED';
        note = 'Intelligent merge applied: Authorized contingent tolerance applied to balance accounts.';
        noteKu = 'تێکەڵکردنی ژیرانە بە بڕیاری هاوبەش و زیادکردنی پاشکۆ جێبەجێ کرا.';
      }

      const updatedDiffs = log.diffs.map((d) => ({
        ...d,
        resolvedValue:
          decision === 'HOLDING_WINS'
            ? d.holdingValue
            : decision === 'BRANCH_WINS'
            ? d.branchValue
            : `Merged (${d.holdingValue} ➔ ${d.branchValue})`
      }));

      return {
        ...log,
        status: newStatus,
        resolvedAt: new Date().toISOString(),
        resolvedBy: `${currentUser.name} (${currentUser.title || 'IT Systems Director'})`,
        resolutionNotes: language === 'ku' ? noteKu : note,
        diffs: updatedDiffs
      };
    });

    saveConflicts(updated);
    showToast(
      language === 'ku'
        ? 'ناکۆکی سینک بە سەرکەوتوویی چارەسەر کرا و هەموو لقەکان هاوتا کران!'
        : 'Sync conflict resolved and state reconciled across all sites!'
    );
  };

  // Auto-resolve all unresolved conflicts according to Holding Policy
  const handleAutoResolveAll = () => {
    const updated = conflictLogs.map((log) => {
      if (log.status !== 'UNRESOLVED') return log;
      return {
        ...log,
        status: 'RESOLVED_HOLDING_WINS' as ConflictResolutionStatus,
        resolvedAt: new Date().toISOString(),
        resolvedBy: `Auto-Policy Engine (${currentUser.name})`,
        resolutionNotes: 'Auto-resolved: Holding Master Central Authority rule applied automatically.',
        diffs: log.diffs.map(d => ({ ...d, resolvedValue: d.holdingValue }))
      };
    });

    saveConflicts(updated);
    showToast(
      language === 'ku'
        ? 'سەرجەم ناکۆکییەکان بەپێی یاسای هۆڵدینگ چارەسەر کران!'
        : 'All unresolved sync conflicts resolved via Holding Master Rule!'
    );
  };

  // Simulate a realistic sync conflict (alternating between Najaf Cement Plant and Halabja Site)
  const handleSimulateConflict = () => {
    const isNajafScenario = Math.random() > 0.5;
    const randomBatch = Math.floor(100 + Math.random() * 900);

    const newSimConflict: SyncConflictLog = isNajafScenario
      ? {
          id: `conf-sim-${Date.now()}`,
          timestamp: new Date().toISOString(),
          entityType: 'WAREHOUSE_ITEM',
          entityId: `wh-najaf-${Date.now()}`,
          entityReference: `CMT-BATCH-NJF-${randomBatch} (بەرهەمهێنانی چیمەنتۆ - کارگەی نەجەف)`,
          holdingNodeName: 'Erbil Executive HQ (سەرۆکایەتی هۆڵدینگ)',
          holdingLocation: 'Erbil - World Trade Center Floor 14',
          branchNodeName: 'Najaf Cement Manufacturing Plant (کارگەی چیمەنتۆی نەجەف)',
          branchLocation: 'Najaf - Industrial City & Quarry Zone',
          conflictType: 'CONCURRENT_EDIT',
          severity: 'CRITICAL',
          status: 'UNRESOLVED',
          descriptionEn: `Najaf Cement Plant laptop recorded 4,800 tons produced and dispatched to Baghdad, while Erbil Central Logistics capped allocation at 4,200 tons.`,
          descriptionKu: `لاپتۆپی کارگەی چیمەنتۆی نەجەف بڕی ٤,٨٠٠ تۆن چیمەنتۆی بەرهەمهێندراوی بۆ بەغدا تۆمارکردووە، لە کاتێکدا لۆجستیكسی سەرەکی لە هەولێر بڕی ٤,٢٠٠ تۆنی تۆمارکردووە.`,
          diffs: [
            {
              fieldName: 'producedTons',
              fieldLabelEn: 'Cement Batch Output (Tons)',
              fieldLabelKu: 'بڕی چیمەنتۆی بەرهەمهێنراو (تۆن)',
              holdingValue: '4,200 Tons (HQ Central Production Quota)',
              branchValue: '4,800 Tons (Actual kiln output logged at Najaf Plant)'
            },
            {
              fieldName: 'dispatchVoucherUSD',
              fieldLabelEn: 'Dispatched Sales Value (USD)',
              fieldLabelKu: 'بڕی پارەی هەناردەکراو (دۆلار)',
              holdingValue: '$336,000 USD',
              branchValue: '$384,000 USD (Includes emergency shift output)'
            }
          ]
        }
      : {
          id: `conf-sim-${Date.now()}`,
          timestamp: new Date().toISOString(),
          entityType: 'PURCHASE_ORDER',
          entityId: `po-sim-${Date.now()}`,
          entityReference: `PO-2026-${randomBatch} (کڕینی کەرەستەی خێرا - پڕۆژەی هەڵەبجە)`,
          holdingNodeName: 'Erbil Executive HQ (سەرۆکایەتی هۆڵدینگ)',
          holdingLocation: 'Erbil - World Trade Center Floor 14',
          branchNodeName: 'Halabja Branch Office & Field Site (پڕۆژەی هەڵەبجە)',
          branchLocation: 'Halabja - Industrial Zone',
          conflictType: 'CONCURRENT_EDIT',
          severity: 'CRITICAL',
          status: 'UNRESOLVED',
          descriptionEn: `Simulated live conflict: Halabja Field laptop re-submitted invoice total of $64,000 while Erbil HQ capped authorization at $58,000.`,
          descriptionKu: `ناکۆکی دروستکراوی ئەزموونی: لاپتۆپی هەڵەبجە بڕی $64,000 تۆمارکردووە لە کاتێکدا لە هەولێر بڕی ڕێگەپێدراو $58,000 دۆلار بووە.`,
          diffs: [
            {
              fieldName: 'totalAmountUSD',
              fieldLabelEn: 'Total Amount (USD)',
              fieldLabelKu: 'کۆی گشتی پارە (دۆلار)',
              holdingValue: '$58,000 USD (Approved ceiling by Chairman)',
              branchValue: '$64,000 USD (Emergency price increase at Halabja)'
            },
            {
              fieldName: 'deliveryTerms',
              fieldLabelEn: 'Delivery Schedule',
              fieldLabelKu: 'کاتی گەیشتنی بار',
              holdingValue: 'Standard 7-Day Net',
              branchValue: 'Urgent 24-Hour Express Arrival'
            }
          ]
        };

    saveConflicts([newSimConflict, ...conflictLogs]);
    setExpandedConflictId(newSimConflict.id);
    showToast(
      language === 'ku'
        ? `ناکۆکی نوێی سینک تۆمارکرا: ${newSimConflict.entityReference}`
        : `Simulated sync conflict generated: ${newSimConflict.entityReference}`
    );
  };

  // Filter logs
  const filteredLogs = conflictLogs.filter((log) => {
    if (filterStatus === 'UNRESOLVED' && log.status !== 'UNRESOLVED') return false;
    if (filterStatus === 'RESOLVED' && log.status === 'UNRESOLVED') return false;
    if (filterSeverity !== 'ALL' && log.severity !== filterSeverity) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = log.entityReference.toLowerCase().includes(q);
      const matchDesc = log.descriptionEn.toLowerCase().includes(q) || log.descriptionKu.toLowerCase().includes(q);
      const matchNode = log.holdingNodeName.toLowerCase().includes(q) || log.branchNodeName.toLowerCase().includes(q);
      if (!matchRef && !matchDesc && !matchNode) return false;
    }
    return true;
  });

  const unresolvedCount = conflictLogs.filter(c => c.status === 'UNRESOLVED').length;
  const criticalCount = conflictLogs.filter(c => c.severity === 'CRITICAL' && c.status === 'UNRESOLVED').length;
  const resolvedCount = conflictLogs.filter(c => c.status !== 'UNRESOLVED').length;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <ArrowRightLeft className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold bg-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  IT Systems Sentinel
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Holding Master Authority: ACTIVE
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Dynamic IP & CGNAT Resilient: 100% OK
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                {language === 'ku'
                  ? 'سیستەمی چارەسەرکردنی ناکۆکییەکانی سینک (Sync Conflict Resolution)'
                  : language === 'ar'
                  ? 'إدارة وحل تعارضات المزامنة بين المركز والمواقع البعيدة'
                  : 'Sync Conflict Resolution & Remote Site Mismatches Engine'}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {language === 'ku'
                  ? 'تۆماری ناکۆکی و جیاوازی داتاکان لە کاتی پچڕانی ئینتەرنێت یان دەستکاریکردنی هاوکات لە نێوان سەرۆکایەتی هۆڵدینگ (هەولێر) و پڕۆژە مەیدانییەکان (هەڵەبجە، سلێمانی، دهۆک، زاخۆ و بەغدا).'
                  : 'Logs synchronization discrepancies and concurrent edit collisions between the central holding hub and remote site laptops with side-by-side reconciliation.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <button
              onClick={handleSimulateConflict}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 flex items-center gap-2 transition cursor-pointer"
              title="Simulate a real-time conflict between Erbil and Halabja"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'ku' ? 'تاقیکردنەوەی ناکۆکی نوێ' : 'Simulate Conflict'}</span>
            </button>
            <button
              onClick={() => setIsPolicyModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 flex items-center gap-2 transition cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>{language === 'ku' ? 'یاساکانی هۆڵدینگ' : 'Policy Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{language === 'ku' ? 'کۆی ناکۆکییە تۆمارکراوەکان' : 'Total Conflicts Logged'}</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {conflictLogs.length}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {language === 'ku' ? 'بە هەردوو باری سەرەوە و خوارەوە' : 'Across all monitored sites'}
          </span>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
            <span>{language === 'ku' ? 'ناکۆکی کراوە و چارەسەرنەکراو' : 'Unresolved Conflicts'}</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-600">
            {unresolvedCount}
          </div>
          <span className="text-[11px] text-amber-700 block font-semibold">
            {criticalCount} {language === 'ku' ? 'ناکۆکی مەترسیدار (Critical)' : 'critical divergence'}
          </span>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{language === 'ku' ? 'چارەسەرکراو لە ڕابردوودا' : 'Resolved & Reconciled'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600">
            {resolvedCount}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {language === 'ku' ? 'بەپێی بڕیاری سەرۆکایەتی هۆڵدینگ' : 'Overridden or Merged cleanly'}
          </span>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{language === 'ku' ? 'یاسای جێبەجێکراوی سیستم' : 'Active Resolution Policy'}</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-sm font-extrabold text-indigo-950 truncate">
            {policy.defaultStrategy === 'HOLDING_AUTHORITY'
              ? (language === 'ku' ? 'دەسەڵاتی هۆڵدینگ باڵادەستە' : 'Holding Master Priority')
              : (language === 'ku' ? 'دواین کات سەردەکەوێت (LWW)' : 'Last Write Wins')}
          </div>
          <span className="text-[11px] text-slate-400 block">
            {language === 'ku' ? 'ئاگادارکردنەوەی CFO سەروو $10K' : `Alerts CFO > $${policy.alertCfoAboveUSD.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Main Filter & Action Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={language === 'ku' ? 'گەڕان بەپێی بەڵگەنامە، پڕۆژە، یان جۆری ناکۆکی...' : 'Search by entity, branch, or conflict reason...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-bold">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
              >
                {language === 'ku' ? 'هەموو' : 'All'} ({conflictLogs.length})
              </button>
              <button
                onClick={() => setFilterStatus('UNRESOLVED')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filterStatus === 'UNRESOLVED' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-500'}`}
              >
                {language === 'ku' ? 'چارەسەرنەکراو' : 'Unresolved'} ({unresolvedCount})
              </button>
              <button
                onClick={() => setFilterStatus('RESOLVED')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${filterStatus === 'RESOLVED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500'}`}
              >
                {language === 'ku' ? 'چارەسەرکراو' : 'Resolved'} ({resolvedCount})
              </button>
            </div>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">{language === 'ku' ? 'هەموو ئاستەکانی مەترسی' : 'All Severities'}</option>
              <option value="CRITICAL">{language === 'ku' ? 'مەترسیدار (Critical)' : 'Critical Only'}</option>
              <option value="WARNING">{language === 'ku' ? 'ئاگاداری (Warning)' : 'Warnings'}</option>
            </select>
          </div>

          {unresolvedCount > 0 && (
            <button
              onClick={handleAutoResolveAll}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'ku' ? 'چارەسەرکردنی هەمووی بە یاسای هۆڵدینگ' : 'Auto-Resolve All via Holding Master'}</span>
            </button>
          )}
        </div>

        {/* Conflicts List */}
        <div className="space-y-4 pt-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                {language === 'ku' ? 'هیچ جیاوازی و ناکۆکییەکی داتا لەم فلتەرەدا نییە!' : 'No sync conflicts found matching your filter!'}
              </p>
              <p className="text-xs text-slate-400">
                {language === 'ku' ? 'سەرجەم لاپتۆپ و لقە مەیدانییەکان لەگەڵ هۆڵدینگ هاوتان.' : 'All remote sites and holding laptops are currently in harmony.'}
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedConflictId === log.id;
              const isUnresolved = log.status === 'UNRESOLVED';

              return (
                <div
                  key={log.id}
                  className={`rounded-2xl border transition-all ${
                    isUnresolved
                      ? 'bg-amber-50/20 border-amber-300 shadow-2xs hover:border-amber-400'
                      : 'bg-white border-slate-200/90 shadow-2xs'
                  }`}
                >
                  {/* Card Header Summary */}
                  <div
                    onClick={() => setExpandedConflictId(isExpanded ? null : log.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          log.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-600 border border-rose-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {log.severity === 'CRITICAL' ? (
                          <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
                        ) : (
                          <BadgeAlert className="w-5 h-5 text-amber-600" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            {log.id}
                          </span>
                          <span className="font-extrabold text-sm text-slate-900">
                            {log.entityReference}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isUnresolved
                                ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {isUnresolved
                              ? (language === 'ku' ? '⚠️ چارەسەرنەکراو' : '⚠️ UNRESOLVED')
                              : (language === 'ku' ? '✅ چارەسەرکراو' : '✅ RESOLVED')}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                            {log.conflictType}
                          </span>
                        </div>

                        {/* Topology Route */}
                        <div className="flex items-center gap-2 text-xs text-slate-600 mt-1.5 flex-wrap">
                          <span className="font-bold text-blue-700 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {log.holdingNodeName}
                          </span>
                          <ArrowRightLeft className="w-3 h-3 text-amber-500" />
                          <span className="font-bold text-purple-700 flex items-center gap-1">
                            <Laptop className="w-3.5 h-3.5" />
                            {log.branchNodeName}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400 text-[11px] font-mono">
                            📅 {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      {isUnresolved && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-100/60 px-3 py-1 rounded-xl">
                          {log.diffs.length} {language === 'ku' ? 'خانەی جیاواز' : 'fields mismatched'}
                        </span>
                      )}
                      <button className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Body: Side-by-Side Diff & Resolution Actions */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4">
                      {/* Description */}
                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70 font-medium">
                        💬 {language === 'ku' ? log.descriptionKu : log.descriptionEn}
                      </p>

                      {/* Side-by-Side Diff Table */}
                      <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                        <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>{language === 'ku' ? 'بەراوردی ڕووبەڕووی داتای سەنتەری هۆڵدینگ بەرامبەر لقی مەیدانی' : 'Side-by-Side Entity Discrepancy Diff'}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Entity: {log.entityType} ({log.entityId})</span>
                        </div>

                        <div className="divide-y divide-slate-100 text-xs">
                          {log.diffs.map((diff, dIdx) => (
                            <div key={dIdx} className="grid grid-cols-1 md:grid-cols-12 p-3 gap-3 bg-white">
                              {/* Field Name */}
                              <div className="md:col-span-3 font-bold text-slate-800">
                                <div>{language === 'ku' ? diff.fieldLabelKu : diff.fieldLabelEn}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{diff.fieldName}</div>
                              </div>

                              {/* Holding Central Value */}
                              <div className="md:col-span-4 bg-blue-50/60 p-2.5 rounded-xl border border-blue-200">
                                <span className="text-[10px] font-bold text-blue-800 uppercase block mb-1 flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-blue-600" />
                                  {language === 'ku' ? 'سەنتەری هۆڵدینگ (Erbil HQ)' : 'Holding Center Value'}
                                </span>
                                <div className="font-extrabold text-slate-900 break-words">
                                  {String(diff.holdingValue)}
                                </div>
                              </div>

                              {/* Branch Field Value */}
                              <div className="md:col-span-4 bg-purple-50/60 p-2.5 rounded-xl border border-purple-200">
                                <span className="text-[10px] font-bold text-purple-800 uppercase block mb-1 flex items-center gap-1">
                                  <Laptop className="w-3 h-3 text-purple-600" />
                                  {language === 'ku' ? 'لقی پڕۆژە (Branch / Site)' : 'Remote Site Value'}
                                </span>
                                <div className="font-extrabold text-slate-900 break-words">
                                  {String(diff.branchValue)}
                                </div>
                              </div>

                              {/* Status Indicator */}
                              <div className="md:col-span-1 flex items-center justify-center">
                                {diff.resolvedValue ? (
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    Resolved
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                                    Mismatch
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resolution Audit if Resolved */}
                      {!isUnresolved && (
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 space-y-1">
                          <div className="flex items-center gap-2 font-bold text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>{language === 'ku' ? 'بڕیاری چارەسەرکردن و هاوتاکردن:' : 'Reconciliation Decision Applied:'}</span>
                          </div>
                          <p className="font-medium">{log.resolutionNotes}</p>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-3 pt-1">
                            <span>بەرپرسی پەسەندکەر: {log.resolvedBy}</span>
                            <span>•</span>
                            <span>کاتی جێبەجێکردن: {log.resolvedAt ? new Date(log.resolvedAt).toLocaleString() : ''}</span>
                          </div>
                        </div>
                      )}

                      {/* Resolution Action Controls if Unresolved */}
                      {isUnresolved && (
                        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="text-xs text-slate-500 flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-amber-600" />
                            <span>
                              {language === 'ku'
                                ? 'هەڵبژاردنی یەکێک لە چارەسەرەکان دەستبەجێ هەردوو لاپتۆپەکە هاوتا دەکات:'
                                : 'Selecting a resolution action immediately synchronizes both nodes:'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Option 1: Holding Master Wins */}
                            <button
                              onClick={() => handleResolveConflict(log.id, 'HOLDING_WINS')}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span>{language === 'ku' ? 'پەسەندکردنی بڕیاری هۆڵدینگ (سەرەوە)' : 'Enforce Holding Master'}</span>
                            </button>

                            {/* Option 2: Branch Site Wins */}
                            <button
                              onClick={() => handleResolveConflict(log.id, 'BRANCH_WINS')}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
                            >
                              <Laptop className="w-3.5 h-3.5" />
                              <span>{language === 'ku' ? 'پەسەندکردنی داتای مەیدانی (لق)' : 'Accept Branch Site'}</span>
                            </button>

                            {/* Option 3: Intelligent Merge */}
                            <button
                              onClick={() => handleResolveConflict(log.id, 'MERGE')}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{language === 'ku' ? 'تێکەڵکردنی ژیرانە (Merge)' : 'Intelligent Merge'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Policy Settings Modal */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {language === 'ku' ? 'یاساکانی چارەسەری ناکۆکی هۆڵدینگ' : 'Holding Sync Conflict Policy'}
                </h3>
              </div>
              <button onClick={() => setIsPolicyModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-bold mb-1 text-slate-800">
                  {language === 'ku' ? 'ستراتیژی بنەڕەتی لە کاتی ناکۆکی:' : 'Default Resolution Strategy:'}
                </label>
                <select
                  value={policy.defaultStrategy}
                  onChange={(e) => setPolicy(prev => ({ ...prev, defaultStrategy: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="HOLDING_AUTHORITY">
                    🏢 Holding Master Central Authority (بڕیاری سەرۆکایەتی هۆڵدینگ سەردەکەوێت)
                  </option>
                  <option value="LAST_WRITE_WINS">
                    ⏱️ Last Write Wins (دواین کات و نوێترین ڕێکەوت)
                  </option>
                  <option value="MANUAL_SUPERVISOR">
                    🔒 Mandatory IT Supervisor Review (پێویستی بە پێداچوونەوەی ئەدمینە)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800">
                  {language === 'ku' ? 'سنوری ئاگادارکردنەوەی بەڕێوەبەری دارایی (CFO) بە دۆلار:' : 'Alert CFO Discrepancy Threshold (USD):'}
                </label>
                <input
                  type="number"
                  value={policy.alertCfoAboveUSD}
                  onChange={(e) => setPolicy(prev => ({ ...prev, alertCfoAboveUSD: Number(e.target.value) }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="autoResolveMinor"
                  checked={policy.autoResolveMinorDiscrepancies}
                  onChange={(e) => setPolicy(prev => ({ ...prev, autoResolveMinorDiscrepancies: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="autoResolveMinor" className="font-bold text-slate-800 cursor-pointer">
                  {language === 'ku'
                    ? 'چارەسەری خۆکارانەی جیاوازییە کەمەکان (خوار $500)'
                    : 'Auto-resolve minor non-material discrepancies (<$500)'}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsPolicyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                {language === 'ku' ? 'داخستن' : 'Close'}
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.setItem('sas4erp_sync_conflict_policy', JSON.stringify(policy));
                  } catch {}
                  setIsPolicyModalOpen(false);
                  showToast(language === 'ku' ? 'یاسای هۆڵدینگ نوێکرایەوە!' : 'Conflict policy saved!');
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                {language === 'ku' ? 'پاشەکەوتکردن' : 'Save Policy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
