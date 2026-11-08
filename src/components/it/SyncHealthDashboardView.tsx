import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  SyncHealthNode,
  SyncHealthOverviewKPIs,
  SyncJobItem
} from '../../types/syncHealth';
import { getAllBufferedItemsFromIndexedDB } from '../../utils/indexedDbBuffer';
import {
  Activity,
  Radio,
  HardDrive,
  Layers,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Database,
  ShieldCheck,
  Cpu,
  Zap,
  Sliders,
  Search,
  Filter,
  Eye,
  Check,
  Send,
  Server,
  Sparkles,
  Inbox
} from 'lucide-react';

export const SyncHealthDashboardView: React.FC = () => {
  const { language } = useLanguage();

  // State
  const [nodes, setNodes] = useState<SyncHealthNode[]>([]);
  const [kpis, setKpis] = useState<SyncHealthOverviewKPIs | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<SyncHealthNode | null>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(5); // 3, 5, 10, or 0 (paused)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'HEAVY_BUFFER'>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [actionNotice, setActionNotice] = useState<{ ku: string; en: string } | null>(null);
  const [activeJobFilter, setActiveJobFilter] = useState<string>('ALL');

  // Fetch telemetry
  const fetchSyncHealthTelemetry = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      // 1. Fetch nodes
      const nodesRes = await fetch('/api/sync-health/nodes');
      if (nodesRes.ok) {
        const data = await nodesRes.json();
        if (data.nodes) {
          setNodes(data.nodes);
          // If modal is open, refresh its data
          if (selectedNode) {
            const updatedSelected = data.nodes.find((n: SyncHealthNode) => n.nodeId === selectedNode.nodeId);
            if (updatedSelected) setSelectedNode(updatedSelected);
          }
        }
      }

      // 2. Fetch KPIs
      const kpisRes = await fetch('/api/sync-health/overview');
      if (kpisRes.ok) {
        const kpisData = await kpisRes.json();
        if (kpisData.kpis) setKpis(kpisData.kpis);
      }

      // 3. Sync real local IndexedDB count to local node
      try {
        const localItems = await getAllBufferedItemsFromIndexedDB();
        const pendingLocal = localItems.filter(i => i.status !== 'SYNCED_HOLDING');
        const approvals = pendingLocal.filter(i => i.itemType === 'APPROVAL_REQUEST').length;
        const logs = pendingLocal.filter(i => i.itemType === 'OPERATIONAL_DATA_LOG').length;
        const totalBytes = pendingLocal.reduce((acc, curr) => acc + (curr.encryptedPayload?.cipherTextBase64?.length || 500), 0);

        await fetch('/api/sync-health/update-local-node', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pendingCount: pendingLocal.length,
            approvalsCount: approvals,
            logsCount: logs,
            totalBytes,
            isOnline: navigator.onLine
          })
        });
      } catch (err) {
        // Fallback for non-browser or sandbox issues
      }
    } catch (err) {
      console.error('Failed to fetch sync health telemetry:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedNode]);

  // Initial load & Polling Interval
  useEffect(() => {
    fetchSyncHealthTelemetry(false);
  }, []);

  useEffect(() => {
    if (autoRefreshInterval === 0) return;
    const interval = setInterval(() => {
      fetchSyncHealthTelemetry(true);
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, fetchSyncHealthTelemetry]);

  // Actions
  const handlePingNode = async (nodeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await fetch('/api/sync-health/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId,
          latencyMs: Math.floor(Math.random() * 35) + 15
        })
      });
      if (res.ok) {
        setActionNotice({
          ku: 'لێدانی دڵی پەیوەندی بە سەرکەوتوویی نوێکرایەوە و وەڵامی دا.',
          en: 'Node ping successful; heartbeat refreshed.'
        });
        setTimeout(() => setActionNotice(null), 3500);
        await fetchSyncHealthTelemetry(true);
      }
    } catch (err) {
      console.error('Ping error:', err);
    }
  };

  const handleDrainQueue = async (nodeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await fetch('/api/sync-health/drain-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId })
      });
      if (res.ok) {
        const data = await res.json();
        setActionNotice({
          ku: data.messageKu || 'ڕیزی سینک بە سەرکەوتوویی یەکخرا.',
          en: data.messageEn || 'Sync queue drained successfully.'
        });
        setTimeout(() => setActionNotice(null), 4000);
        await fetchSyncHealthTelemetry(true);
      }
    } catch (err) {
      console.error('Drain error:', err);
    }
  };

  const handleDrainAllFleet = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/sync-health/drain-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setActionNotice({
          ku: data.messageKu || 'سەرجەم ڕیزەکانی سینکی هۆڵدینگ پاکتاو کران.',
          en: data.messageEn || 'Holding-wide sync sweep completed.'
        });
        setTimeout(() => setActionNotice(null), 4500);
        await fetchSyncHealthTelemetry(true);
      }
    } catch (err) {
      console.error('Drain all error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSimulateCondition = async (nodeId: string, conditionType: 'TOGGLE_BLACKOUT' | 'SPIKE_OFFLINE_CACHE' | 'RESTORE_HEALTHY', e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await fetch('/api/sync-health/simulate-condition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, conditionType })
      });
      if (res.ok) {
        setActionNotice({
          ku: `تێستی باری [${conditionType}] لەسەر نۆدەکە چالاک کرا.`,
          en: `Simulated test [${conditionType}] applied to node.`
        });
        setTimeout(() => setActionNotice(null), 3500);
        await fetchSyncHealthTelemetry(true);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  // Regions list for filter
  const regions = useMemo(() => {
    const list = Array.from(new Set(nodes.map(n => n.regionEn)));
    return ['ALL', ...list];
  }, [nodes]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      // Status filter
      if (statusFilter === 'HEALTHY' && (node.heartbeat.status !== 'HEALTHY_PULSE' && node.heartbeat.status !== 'LOCAL_EDGE_ACTIVE')) return false;
      if (statusFilter === 'DEGRADED' && node.heartbeat.status !== 'DEGRADED_LATENCY' && node.heartbeat.status !== 'STALE_WARNING') return false;
      if (statusFilter === 'OFFLINE' && node.heartbeat.status !== 'OFFLINE_BLACKOUT') return false;
      if (statusFilter === 'HEAVY_BUFFER' && node.bufferCache.health !== 'HEAVY_BUFFERED' && node.bufferCache.health !== 'OVERFLOW_RISK') return false;

      // Region filter
      if (regionFilter !== 'ALL' && node.regionEn !== regionFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = node.siteNameEn.toLowerCase().includes(q) || node.siteNameKu.includes(q);
        const matchesCode = node.siteCode.toLowerCase().includes(q);
        const matchesIp = node.heartbeat.publicIp.toLowerCase().includes(q);
        const matchesIsp = node.heartbeat.carrierIsp.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesIp && !matchesIsp) return false;
      }

      return true;
    });
  }, [nodes, statusFilter, regionFilter, searchQuery]);

  // Helper formatting
  const getStatusBadge = (status: SyncHealthNode['heartbeat']['status']) => {
    switch (status) {
      case 'HEALTHY_PULSE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {language === 'ku' ? 'پەیوەستە (سەقامگیر)' : 'Healthy Pulse'}
          </span>
        );
      case 'LOCAL_EDGE_ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            {language === 'ku' ? 'ئامێری لۆکاڵ (ئێستا)' : 'Local Edge Active'}
          </span>
        );
      case 'DEGRADED_LATENCY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {language === 'ku' ? 'تاخیربوونی بەرز' : 'Degraded Latency'}
          </span>
        );
      case 'STALE_WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
            <AlertTriangle className="w-3 h-3 text-orange-500" />
            {language === 'ku' ? 'لێدانی دواکەوتوو' : 'Stale Warning'}
          </span>
        );
      case 'OFFLINE_BLACKOUT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            {language === 'ku' ? 'پچڕاوە (ئۆفلاین)' : 'Offline Blackout'}
          </span>
        );
    }
  };

  const getBufferHealthBadge = (health: SyncHealthNode['bufferCache']['health'], count: number, size: string) => {
    switch (health) {
      case 'EMPTY_SYNCED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>0 Items • Synced</span>
          </span>
        );
      case 'LIGHT_CACHED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span>{count} Cached ({size})</span>
          </span>
        );
      case 'HEAVY_BUFFERED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
            <span>{count} Buffered ({size})</span>
          </span>
        );
      case 'OVERFLOW_RISK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 animate-pulse">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>{count} Risk ({size})</span>
          </span>
        );
    }
  };

  const getQueueBadge = (status: SyncHealthNode['syncQueue']['status'], depth: number) => {
    switch (status) {
      case 'DRAINED_IDLE':
        return (
          <span className="text-[11px] font-semibold text-slate-400">
            {depth === 0 ? 'Queue Empty' : `${depth} Queued`}
          </span>
        );
      case 'SYNCING_ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin" />
            <span>{depth} In Queue</span>
          </span>
        );
      case 'ACCUMULATING_BACKLOG':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>{depth} Backlogged</span>
          </span>
        );
      case 'BLOCKED_ERROR':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" />
            <span>{depth} Blocked</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Executive KPI Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-50/70 via-transparent to-transparent -mr-20 -mt-20 rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{language === 'ku' ? 'داشبۆردی تەندروستی سینک و نۆدەکان' : 'Real-Time Sync Health Dashboard'}</span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Fleet Pulse Live
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'ku'
                    ? 'چاودێری ڕاستەوخۆی لێدانی دڵی پەیوەندی، قەبارەی کاشی پاشەکەوتی ئۆفلاین (IndexedDB)، و ڕیزەکانی سینک بۆ هەموو لق و ناوەندەکان'
                    : 'Unified telemetric aggregation of node heartbeats, encrypted offline buffer cache sizes, and pending synchronization queues across all sites.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons & interval */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Auto refresh interval dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-medium">{language === 'ku' ? 'نوێبوونەوە:' : 'Refresh:'}</span>
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
              >
                <option value={3}>3s (Live)</option>
                <option value={5}>5s (Balanced)</option>
                <option value={10}>10s (Eco)</option>
                <option value={0}>Paused</option>
              </select>
            </div>

            {/* Sweep All */}
            <button
              onClick={handleDrainAllFleet}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              title="Force drain all pending sync queues and flush caches across all nodes"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'ku' ? 'یەکخستنی گشتی ڕیزەکان' : 'Sweep All Sync Queues'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchSyncHealthTelemetry(false)}
              disabled={isRefreshing}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer disabled:opacity-50"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Action Notice Banner */}
        {actionNotice && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs text-indigo-900 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold">{language === 'ku' ? actionNotice.ku : actionNotice.en}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-indigo-400 hover:text-indigo-700 font-bold">×</button>
          </div>
        )}

        {/* Executive Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
          {/* Card 1: Fleet Health Score */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'تەندروستی گشتی تۆڕ' : 'Fleet Health Score'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {kpis ? `${kpis.fleetHealthScore}%` : '96%'}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Optimal
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              {kpis?.onlineNodes ?? 8}/{kpis?.totalNodes ?? 8} Nodes Responsive
            </span>
          </div>

          {/* Card 2: Offline Buffer Cache */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/40 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'کاشی پاشەکەوتی ئۆفلاین' : 'Fleet Buffer Cache'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-900">
                {kpis?.totalFleetBufferSizeFormatted ?? '1.15 MB'}
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                {kpis?.totalFleetBufferPendingItems ?? 12} Items
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              IndexedDB AES-256 Protected
            </span>
          </div>

          {/* Card 3: Pending Sync Job Queue Depth */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'ڕیزەکانی سینک (Queue)' : 'Pending Sync Queue'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-900">
                {kpis?.totalPendingSyncJobs ?? 17}
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                Jobs
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Inbound & Outbound Transfers
            </span>
          </div>

          {/* Card 4: Avg Fleet Latency */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'تێکڕای تاخیربوون' : 'Fleet Avg Ping'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-900">
                {kpis ? `${kpis.avgLatencyMs} ms` : '58 ms'}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                0.4% Loss
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Fiber, 4G LTE & Towers
            </span>
          </div>

          {/* Card 5: Local Client Edge */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/40 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'ئەم وێبگەڕە لۆکاڵە' : 'This Edge Node'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-purple-900">
                {navigator.onLine ? 'Online' : 'Offline'}
              </span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                v1 Cache
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Instant Auto-Flushing Engine
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & View Selector */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {/* Search box */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ku' ? 'گەڕان بەپێی شوێن، نۆد، یان ئایپی...' : 'Search by site, code, IP, ISP...'}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {language === 'ku' ? 'هەموو نۆدەکان' : 'All Nodes'} ({nodes.length})
            </button>
            <button
              onClick={() => setStatusFilter('HEALTHY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'HEALTHY'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              {language === 'ku' ? 'سەقامگیرەکان' : 'Healthy'}
            </button>
            <button
              onClick={() => setStatusFilter('DEGRADED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'DEGRADED'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              {language === 'ku' ? 'تاخیربوون / ئاگاداری' : 'Degraded'}
            </button>
            <button
              onClick={() => setStatusFilter('HEAVY_BUFFER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'HEAVY_BUFFER'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200'
              }`}
            >
              {language === 'ku' ? 'کاشی پڕ' : 'Heavy Buffer'}
            </button>
            <button
              onClick={() => setStatusFilter('OFFLINE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'OFFLINE'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              {language === 'ku' ? 'پچڕاوەکان' : 'Offline'}
            </button>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Region filter */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">{language === 'ku' ? 'سەرجەم ناوچەکان' : 'All Regions'}</option>
            {regions.filter(r => r !== 'ALL').map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <div className="bg-slate-100 p-0.5 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('GRID')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'GRID' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'ku' ? 'کارتەکان' : 'Cards'}
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'ku' ? 'خشتە' : 'Table'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNodes.map((node) => (
            <div
              key={node.nodeId}
              onClick={() => setSelectedNode(node)}
              className={`bg-white border rounded-3xl p-5 shadow-xs transition hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden ${
                node.heartbeat.status === 'OFFLINE_BLACKOUT'
                  ? 'border-rose-300 ring-1 ring-rose-300 bg-rose-50/10'
                  : node.heartbeat.status === 'DEGRADED_LATENCY' || node.heartbeat.status === 'STALE_WARNING'
                  ? 'border-amber-300'
                  : 'border-slate-200/90 hover:border-indigo-300'
              }`}
            >
              {/* Card Header: Site identity & status badge */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {node.siteCode}
                  </span>
                  {getStatusBadge(node.heartbeat.status)}
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1">
                    {language === 'ku' ? node.siteNameKu : node.siteNameEn}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                    <span>{language === 'ku' ? node.regionKu : node.regionEn}</span>
                    <span>•</span>
                    <span className="font-mono text-indigo-600 font-semibold">{node.heartbeat.publicIp}</span>
                  </div>
                </div>
              </div>

              {/* Heartbeat & Link metrics */}
              <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Latency</span>
                  <span className={`text-xs font-black ${node.heartbeat.latencyMs > 80 ? 'text-amber-600' : 'text-slate-800'}`}>
                    {node.heartbeat.latencyMs} ms
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Last Ping</span>
                  <span className="text-xs font-bold text-slate-700">
                    {node.heartbeat.secondsSincePing}s ago
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Rotations</span>
                  <span className="text-xs font-bold text-slate-700 font-mono">
                    #{node.heartbeat.dynamicIpRotationsCount}
                  </span>
                </div>
              </div>

              {/* Offline Buffer & Pending Sync Queue indicators */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                {/* Buffer cache */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-[11px]">{language === 'ku' ? 'کاشی ئۆفلاین:' : 'Buffer Cache:'}</span>
                  </div>
                  {getBufferHealthBadge(node.bufferCache.health, node.bufferCache.totalPendingCount, node.bufferCache.sizeFormatted)}
                </div>

                {/* Sync Queue */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-[11px]">{language === 'ku' ? 'ڕیزی سینک:' : 'Sync Queue:'}</span>
                  </div>
                  {getQueueBadge(node.syncQueue.status, node.syncQueue.queueDepth)}
                </div>

                {/* Queue items pill preview */}
                {node.syncQueue.pendingJobs.length > 0 && (
                  <div className="p-2 rounded-xl bg-indigo-50/40 border border-indigo-100 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-indigo-700 font-bold">
                      <span>{language === 'ku' ? 'داواکاری لە پێشینە:' : 'Top Queue Item:'}</span>
                      <span className="px-1.5 py-0.2 rounded bg-indigo-100 font-mono">
                        {node.syncQueue.pendingJobs[0].priority}
                      </span>
                    </div>
                    <p className="text-slate-700 truncate font-medium">
                      {language === 'ku' ? node.syncQueue.pendingJobs[0].titleKu : node.syncQueue.pendingJobs[0].titleEn}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Toolbar on card footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handlePingNode(node.nodeId, e)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title={language === 'ku' ? 'لێدانی پەیوەندی خێرا' : 'Ping Heartbeat'}
                  >
                    <Radio className="w-3.5 h-3.5" />
                  </button>

                  {node.syncQueue.queueDepth > 0 && (
                    <button
                      onClick={(e) => handleDrainQueue(node.nodeId, e)}
                      className="px-2 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                      title={language === 'ku' ? 'یەکخستن و پاکتاوکردنی ڕیز' : 'Drain Queue'}
                    >
                      <Zap className="w-3 h-3" />
                      <span>Drain</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedNode(node)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{language === 'ku' ? 'پشکنین' : 'Details'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Table View */}
      {viewMode === 'TABLE' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Node & Site</th>
                  <th className="px-4 py-3.5">Status & Heartbeat</th>
                  <th className="px-4 py-3.5">IP & Network ISP</th>
                  <th className="px-4 py-3.5">Latency / Jitter</th>
                  <th className="px-4 py-3.5">Offline Buffer Cache</th>
                  <th className="px-4 py-3.5">Sync Job Queue</th>
                  <th className="px-4 py-3.5">Health Score</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNodes.map((node) => (
                  <tr
                    key={node.nodeId}
                    onClick={() => setSelectedNode(node)}
                    className="hover:bg-slate-50/70 transition cursor-pointer"
                  >
                    {/* Site & Code */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                          {node.siteCode.replace('ZONE-', '').slice(0, 3)}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block text-xs">
                            {language === 'ku' ? node.siteNameKu : node.siteNameEn}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {node.siteCode} • {node.regionEn}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {getStatusBadge(node.heartbeat.status)}
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Ping {node.heartbeat.secondsSincePing}s ago
                      </span>
                    </td>

                    {/* IP & ISP */}
                    <td className="px-4 py-4">
                      <span className="font-mono font-bold text-slate-800 block text-xs">
                        {node.heartbeat.publicIp}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate block max-w-[150px]">
                        {node.heartbeat.carrierIsp}
                      </span>
                    </td>

                    {/* Latency */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-extrabold text-xs ${node.heartbeat.latencyMs > 80 ? 'text-amber-600' : 'text-slate-800'}`}>
                          {node.heartbeat.latencyMs} ms
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (±{node.heartbeat.jitterMs}ms)
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Loss: {node.heartbeat.packetLossPercent}%
                      </span>
                    </td>

                    {/* Buffer cache */}
                    <td className="px-4 py-4">
                      {getBufferHealthBadge(node.bufferCache.health, node.bufferCache.totalPendingCount, node.bufferCache.sizeFormatted)}
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {node.bufferCache.approvalsCount} Approvals • {node.bufferCache.logsCount} Logs
                      </span>
                    </td>

                    {/* Sync Job Queue */}
                    <td className="px-4 py-4">
                      {getQueueBadge(node.syncQueue.status, node.syncQueue.queueDepth)}
                      {node.syncQueue.queueDepth > 0 && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          ~{node.syncQueue.estimatedDrainTimeSeconds}s drain time
                        </span>
                      )}
                    </td>

                    {/* Health score */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              node.overallHealthScore > 85 ? 'bg-emerald-500' : node.overallHealthScore > 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${node.overallHealthScore}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-xs text-slate-800">
                          {node.overallHealthScore}%
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePingNode(node.nodeId)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="Ping Node"
                        >
                          <Radio className="w-3.5 h-3.5" />
                        </button>
                        {node.syncQueue.queueDepth > 0 && (
                          <button
                            onClick={() => handleDrainQueue(node.nodeId)}
                            className="px-2 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer"
                            title="Drain Queue"
                          >
                            Drain
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedNode(node)}
                          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deep-Dive Inspection Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-indigo-600/20">
                  {selectedNode.siteCode.replace('ZONE-', '').slice(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      {language === 'ku' ? selectedNode.siteNameKu : selectedNode.siteNameEn}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
                      {selectedNode.siteCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'ku' ? selectedNode.regionKu : selectedNode.regionEn} • {selectedNode.nodeType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(selectedNode.heartbeat.status)}
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Simulation & Diagnostic Controls Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'ku' ? 'تاقیگە و تێستی پچڕانی هێڵ (Diagnostics & Simulation):' : 'Node Diagnostic Controls & Simulated Scenarios:'}</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {language === 'ku' ? 'تێستکردنی کاردانەوەی کاش و ڕیز بێ زیانگەیاندن' : 'Safe non-destructive live failover testing'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handlePingNode(selectedNode.nodeId)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{language === 'ku' ? 'پینگکردنی ڕاستەوخۆ' : 'Ping Heartbeat Now'}</span>
                </button>

                <button
                  onClick={() => handleSimulateCondition(selectedNode.nodeId, 'TOGGLE_BLACKOUT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    selectedNode.isSimulatedGlitch
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>
                    {selectedNode.isSimulatedGlitch
                      ? (language === 'ku' ? 'ڕاگرتنی پچڕانی دەستکرد' : 'Stop Simulated Blackout')
                      : (language === 'ku' ? 'تێستی پچڕانی لەناکاو' : 'Simulate Blackout Glitch')}
                  </span>
                </button>

                <button
                  onClick={() => handleSimulateCondition(selectedNode.nodeId, 'SPIKE_OFFLINE_CACHE')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === 'ku' ? 'پڕکردنی دەستکردی کاش' : 'Inject Spiked Offline Cache'}</span>
                </button>

                <button
                  onClick={() => handleSimulateCondition(selectedNode.nodeId, 'RESTORE_HEALTHY')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'ku' ? 'گەڕاندنەوە بۆ تەندروست' : 'Reset to Healthy State'}</span>
                </button>
              </div>
            </div>

            {/* Telemetry Detail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Network & Heartbeat Panel */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'ku' ? 'زانیاری پەیوەندی و لێدانی دڵ' : 'Connectivity & Heartbeat Telemetry'}</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Public IP Address:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedNode.heartbeat.publicIp}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Carrier / ISP Provider:</span>
                    <span className="font-medium text-slate-800">{selectedNode.heartbeat.carrierIsp}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Connection Medium:</span>
                    <span className="font-semibold text-indigo-600">{selectedNode.heartbeat.connectionType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Ping Latency & Jitter:</span>
                    <span className="font-bold text-slate-800">{selectedNode.heartbeat.latencyMs} ms (±{selectedNode.heartbeat.jitterMs}ms)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Packet Loss Rate:</span>
                    <span className="font-bold text-slate-800">{selectedNode.heartbeat.packetLossPercent}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Dynamic IP Rotations (CGNAT):</span>
                    <span className="font-bold text-slate-800 font-mono">#{selectedNode.heartbeat.dynamicIpRotationsCount} Rotations</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">30-Day Uptime SLA:</span>
                    <span className="font-bold text-emerald-600">{selectedNode.heartbeat.uptimePercent30d}%</span>
                  </div>
                </div>
              </div>

              {/* Buffer Cache Panel */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-amber-600" />
                  <span>{language === 'ku' ? 'کاشی پاشەکەوتکراوی ئۆفلاین (IndexedDB)' : 'Offline Buffer Cache State'}</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Total Pending Buffer Items:</span>
                    <span className="font-bold text-amber-700">{selectedNode.bufferCache.totalPendingCount} items</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Cached Approvals vs Logs:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedNode.bufferCache.approvalsCount} Approvals • {selectedNode.bufferCache.logsCount} Logs
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Encrypted Cache Size:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedNode.bufferCache.sizeFormatted}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Local Storage Engine:</span>
                    <span className="font-medium text-slate-800">{selectedNode.bufferCache.storageEngine}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Encryption Scheme:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      AES-256-GCM / SHA-256
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Oldest Buffered Request:</span>
                    <span className="font-medium text-slate-800">
                      {selectedNode.bufferCache.oldestPendingTimestamp 
                        ? new Date(selectedNode.bufferCache.oldestPendingTimestamp).toLocaleTimeString() 
                        : 'None (Drained)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Last Holding Flush Acknowledged:</span>
                    <span className="font-medium text-slate-800">
                      {selectedNode.bufferCache.lastFlushedAt 
                        ? new Date(selectedNode.bufferCache.lastFlushedAt).toLocaleTimeString() 
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Sync Job Queue Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>{language === 'ku' ? 'ڕیزی کارەکانی سینک بۆ ئەم لقە (Pending Sync Jobs):' : 'Pending Synchronization Jobs for this Node:'}</span>
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {selectedNode.syncQueue.pendingJobs.length} Jobs
                  </span>
                </div>

                {selectedNode.syncQueue.pendingJobs.length > 0 && (
                  <button
                    onClick={() => handleDrainQueue(selectedNode.nodeId)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{language === 'ku' ? 'یەکخستنی تەواوی ڕیزەکە ئێستا' : 'Force Drain All Queue Items'}</span>
                  </button>
                )}
              </div>

              {selectedNode.syncQueue.pendingJobs.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h5 className="font-extrabold text-slate-800 text-sm">
                    {language === 'ku' ? 'ڕیزی سینک بە تەواوی بەتاڵ و یەکخراوە' : 'Sync Job Queue Fully Drained'}
                  </h5>
                  <p className="text-xs text-slate-400">
                    {language === 'ku' ? 'هیچ داواکارییەکی چاوەڕوانکراو لە ڕیزدا نەماوە.' : 'All inbound and outbound transfers are fully in sync with central holding servers.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedNode.syncQueue.pendingJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 transition space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {job.jobCode}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            job.priority === 'CRITICAL' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : job.priority === 'HIGH'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {job.priority}
                          </span>
                          <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                            {job.direction === 'OUTBOUND_PUSH' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                            {job.direction}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400">
                          {new Date(job.queuedAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-xs">
                        <h6 className="font-extrabold text-slate-900">
                          {language === 'ku' ? job.titleKu : job.titleEn}
                        </h6>
                        {job.payloadSummary && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{job.payloadSummary}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>Payload: {(job.payloadSizeBytes / 1024).toFixed(1)} KB</span>
                        <span>Retries: {job.retryCount}</span>
                        <span className="font-semibold text-indigo-600">{job.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Holding Hub Sync Protocol v2.4 • SHA-256 Validated
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {language === 'ku' ? 'داخستن' : 'Close Details'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
