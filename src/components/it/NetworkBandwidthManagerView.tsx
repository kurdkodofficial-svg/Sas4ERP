import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Sliders,
  SlidersHorizontal,
  Wifi,
  Zap,
  TrendingDown,
  Layers,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Activity,
  ArrowRightLeft,
  ShieldCheck,
  ShieldAlert,
  Server,
  Radio,
  FileCheck2,
  HardDriveDownload,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useERP } from '../../context/ERPContext';
import {
  BandwidthSitePolicy,
  FleetBandwidthSummary,
  TrafficPriorityTier,
  BandwidthEventLog,
  ThrottleMode
} from '../../types/bandwidthManager';

export const NetworkBandwidthManagerView: React.FC = () => {
  const { language, isRtl } = useLanguage();
  const { holding } = useERP();

  const [policies, setPolicies] = useState<BandwidthSitePolicy[]>([]);
  const [summary, setSummary] = useState<FleetBandwidthSummary | null>(null);
  const [trafficTiers, setTrafficTiers] = useState<TrafficPriorityTier[]>([]);
  const [events, setEvents] = useState<BandwidthEventLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>('BALANCED_DEFAULT');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [simulatingSiteId, setSimulatingSiteId] = useState<string | null>(null);
  const [testPayloadStatus, setTestPayloadStatus] = useState<string | null>(null);
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('ALL');

  // Fetch policies and telemetry from server
  const fetchPolicies = async () => {
    try {
      const res = await fetch('/api/bandwidth/policies');
      if (res.ok) {
        const data = await res.json();
        setPolicies(data.policies || []);
        setSummary(data.summary || null);
        setTrafficTiers(data.trafficPriorityTiers || []);
        setEvents(data.recentEvents || []);
        if (data.summary?.activePresetProfile) {
          setActivePreset(data.summary.activePresetProfile);
        }
      }
    } catch (err) {
      console.error('Failed to load bandwidth policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
    const interval = setInterval(fetchPolicies, 8000);
    return () => clearInterval(interval);
  }, []);

  // Update Bandwidth Policy for a Site
  const handleUpdatePolicy = async (
    siteId: string,
    updates: Partial<{
      allocatedBandwidthKbps: number;
      throttleMode: ThrottleMode;
      autoQoSEnabled: boolean;
      autoQoSLatencyThresholdMs: number;
    }>
  ) => {
    try {
      const res = await fetch('/api/bandwidth/update-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, ...updates })
      });
      if (res.ok) {
        const data = await res.json();
        setPolicies(prev => prev.map(p => p.siteId === siteId ? data.policy : p));
        setActionSuccessMessage(
          language === 'ku'
            ? `ڕێکخستنی باندویس بۆ پڕۆژەکە بە سەرکەوتوویی نوێکرایەوە`
            : `Bandwidth policy updated successfully for ${data.policy.siteNameEn}`
        );
        setTimeout(() => setActionSuccessMessage(null), 4000);
        fetchPolicies();
      }
    } catch (err) {
      console.error('Error updating bandwidth policy:', err);
    }
  };

  // Apply fleet-wide preset profile
  const handleApplyPreset = async (preset: string) => {
    try {
      const res = await fetch('/api/bandwidth/apply-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset })
      });
      if (res.ok) {
        const data = await res.json();
        setActivePreset(preset);
        setPolicies(data.policies || []);
        setActionSuccessMessage(
          language === 'ku'
            ? `پڕۆفایلی گشتی تۆڕ گۆڕدرا بۆ: ${preset}`
            : `Fleet bandwidth QoS preset switched to: ${preset}`
        );
        setTimeout(() => setActionSuccessMessage(null), 4000);
        fetchPolicies();
      }
    } catch (err) {
      console.error('Error applying preset:', err);
    }
  };

  // Simulate a high latency spike to trigger auto-shedding
  const handleSimulateLatencySpike = async (siteId: string, spikeMs: number = 220) => {
    setSimulatingSiteId(siteId);
    try {
      const res = await fetch('/api/bandwidth/simulate-latency-spike', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, spikeLatencyMs: spikeMs })
      });
      if (res.ok) {
        const data = await res.json();
        setPolicies(prev => prev.map(p => p.siteId === siteId ? data.policy : p));
        setActionSuccessMessage(
          language === 'ku'
            ? `تاخیربوونی بەرز (${spikeMs}ms) تاقیکرایەوە! سیستەمی Auto-QoS دەستبەجێ پاشبنەمای ڕاگرت و ترافیکی کڕینی پاراست.`
            : `High latency spike (${spikeMs}ms) triggered! Auto-QoS shed background sync to protect mission-critical traffic.`
        );
        setTimeout(() => setActionSuccessMessage(null), 6000);
        fetchPolicies();
      }
    } catch (err) {
      console.error('Error simulating latency spike:', err);
    } finally {
      setSimulatingSiteId(null);
    }
  };

  // Restore normal latency
  const handleResetLatency = async (siteId: string) => {
    try {
      const res = await fetch('/api/bandwidth/reset-latency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId })
      });
      if (res.ok) {
        const data = await res.json();
        setPolicies(prev => prev.map(p => p.siteId === siteId ? data.policy : p));
        setActionSuccessMessage(
          language === 'ku'
            ? `سەقامگیری هێڵ ئاسایی بووەوە و هەموو خزمەتگوزارییەکان گەڕانەوە دۆخی کارکردن.`
            : `Latency restored to normal. Full bandwidth restored.`
        );
        setTimeout(() => setActionSuccessMessage(null), 4000);
        fetchPolicies();
      }
    } catch (err) {
      console.error('Error resetting latency:', err);
    }
  };

  // Test Payload Simulation (Compare Priority Queue Transmission)
  const handleRunPayloadTest = (siteName: string) => {
    setTestPayloadStatus('TESTING');
    setTimeout(() => {
      setTestPayloadStatus('COMPLETED');
      setTimeout(() => setTestPayloadStatus(null), 7000);
    }, 1500);
  };

  const filteredPolicies = selectedSiteFilter === 'ALL'
    ? policies
    : policies.filter(p => p.siteId === selectedSiteFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Header Banner: Fleet Bandwidth & Auto-QoS Control Hub */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
              <Gauge className="w-7 h-7 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-mono font-bold bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                  SAS-IP-ROAM-V2 Bandwidth QoS
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Auto-QoS Active: {policies.filter(p => p.autoQoSEnabled).length}/{policies.length} Sites
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {language === 'ku'
                  ? 'بەڕێوەبەری باندویس و ترافیکی تۆڕ (Network Bandwidth Manager)'
                  : language === 'ar'
                  ? 'مدير النطاق الترددي للشبكة وتحديد أولويات حركة المرور'
                  : 'Remote Network Bandwidth Manager & Auto-QoS Prioritization'}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {language === 'ku'
                  ? 'کۆنترۆڵکردنی خێرایی و داتای سینکرۆنایزی پڕۆژە دوورەدەستەکان (نەجەف، هەڵەبجە، زاخۆ...)، لەگەڵ لەپێشینەکردنی خۆکاری داواکارییەکانی کڕین (PO) و داتای دارایی لە کاتی خاوبوونەوە یان بەرزبوونەوەی تاخیربوونی هێڵ (Ping).'
                  : 'Throttle remote project sync data usage and enforce automated QoS shedding during high-latency periods, ensuring mission-critical approvals and gate security scans never drop packets.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchPolicies}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'نوێکردنەوە' : 'Refresh Telemetry'}</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {actionSuccessMessage && (
          <div className="mt-4 bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Fleet KPI Meters */}
        {summary && (
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">Fleet Bandwidth Allocated</span>
              <span className="text-lg font-mono font-extrabold text-white block">
                {(summary.totalAllocatedKbps / 1024).toFixed(1)} Mbps
              </span>
              <span className="text-[10px] text-slate-500 block">
                Capacity: {(summary.totalCapacityKbps / 1024).toFixed(0)} Mbps
              </span>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">Current Live Fleet Traffic</span>
              <span className="text-lg font-mono font-extrabold text-indigo-400 block">
                {(summary.currentFleetUsageKbps / 1024).toFixed(2)} Mbps
              </span>
              <span className="text-[10px] text-indigo-300 block">
                {((summary.currentFleetUsageKbps / summary.totalAllocatedKbps) * 100).toFixed(0)}% Link Saturation
              </span>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">Throttled & Shedding Sites</span>
              <span className="text-lg font-mono font-extrabold text-amber-400 block">
                {summary.activeThrottledSitesCount} / {policies.length} Sites
              </span>
              <span className="text-[10px] text-amber-300 block">
                Dynamic QoS Active
              </span>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block font-medium">Prioritized Critical Packets</span>
              <span className="text-lg font-mono font-extrabold text-emerald-400 block">
                {summary.totalPrioritizedPackets.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-300 block">
                0% Packet Loss
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Fleet QoS Profile Presets Selector */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>{language === 'ku' ? 'پڕۆفایلە ئامادەکراوەکانی بەڕێوەبردنی هێڵ (Fleet QoS Presets)' : 'Fleet QoS Bandwidth Profiles'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ku'
                ? 'بە یەک کلیک شێوازی دابەشکردنی خێرایی لەسەر تەواوی پڕۆژە دوورەدەستەکان بەپێی کات یان دۆخی هێڵ بگۆڕە'
                : 'Instantly apply policy templates across all remote subsidiaries based on operational peak times or infrastructure conditions.'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            Active: {activePreset}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleApplyPreset('BALANCED_DEFAULT')}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer relative ${
              activePreset === 'BALANCED_DEFAULT'
                ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-xs text-slate-900">
                {language === 'ku' ? '١. هاوسەنگ (Balanced Enterprise)' : '1. Balanced Enterprise'}
              </span>
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {language === 'ku'
                ? 'بەستنی ئاسایی بۆ کارەکانی ڕۆژانە؛ داواکارییەکان لەپێشینەن و پاشبنەما سنوردار دەکرێت ئەگەر هێڵ خاو ببێتەوە.'
                : 'Standard day-to-day operations. 100% priority for orders, background sync throttled on latency spikes.'}
            </p>
          </button>

          <button
            onClick={() => handleApplyPreset('PEAK_HOURS')}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer relative ${
              activePreset === 'PEAK_HOURS'
                ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20'
                : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-xs text-slate-900">
                {language === 'ku' ? '٢. کاتەکانی لوتکەی کار (Peak Hours)' : '2. Peak Business Hours'}
              </span>
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {language === 'ku'
                ? 'تەرخانکردنی زۆرترین خێرایی بۆ واژۆ و فۆڕمەکان؛ وێنە و نەخشەی ئەندازیاری دەوەستێندرێن تا ئێوارە.'
                : 'Prioritizes PO sign-offs & financial commits. Large CAD files & camera media deferred until off-peak.'}
            </p>
          </button>

          <button
            onClick={() => handleApplyPreset('NIGHT_BACKUP')}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer relative ${
              activePreset === 'NIGHT_BACKUP'
                ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
                : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-xs text-slate-900">
                {language === 'ku' ? '٣. سینکی شەوانە (Night Bulk Backup)' : '3. Night Bulk Backup'}
              </span>
              <HardDriveDownload className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {language === 'ku'
                ? 'کردنەوەی تەواوی خێرایی بۆ بەرزکردنەوەی وێنە، ڤیدیۆی کامێراکان، و نەخشە ئەندازیارییە قورسەکان.'
                : 'Unrestricted bandwidth for heavy CAD schematics, surveillance clips, and historical database replication.'}
            </p>
          </button>

          <button
            onClick={() => handleApplyPreset('EMERGENCY_DEGRADED')}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer relative ${
              activePreset === 'EMERGENCY_DEGRADED'
                ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20'
                : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-xs text-slate-900">
                {language === 'ku' ? '٤. حاڵەتی کتوپڕ (Degraded Telecom)' : '4. Degraded Link Emergency'}
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {language === 'ku'
                ? 'لە کاتی کێشەی هێڵەکانی مۆبایل لە عێراق؛ تەنها فەرمانی خاوەندارێتی و پارە دەگوازرێتەوە (توندترین فلـتەر).'
                : 'Minimal bandwidth survival mode. Shuts down all non-essential traffic, passing only cryptographically sealed requisitions.'}
            </p>
          </button>
        </div>
      </div>

      {/* 3. Traffic Priority Tiers Explanation (QoS Hierarchy) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>{language === 'ku' ? 'پلەبەندی لەپێشینەیی ترافیکی داتا (Quality of Service Hierarchy)' : 'Enterprise QoS Traffic Classes & DSCP Tagging'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ku'
              ? 'چۆن سیستەمەکە داتاکان جیا دەکاتەوە لە کاتی بەرزیی تاخیربوون (Ping) دا تا مامەڵە گرنگەکان نەوەستن'
              : 'Deterministic packet classification tagging packets with DSCP headers to enforce prioritized transmission queues.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trafficTiers.map(tier => (
            <div
              key={tier.id}
              className={`p-5 rounded-2xl border space-y-3 ${
                tier.id === 'MISSION_CRITICAL'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : tier.id === 'OPERATIONAL_SYNC'
                  ? 'bg-blue-50/50 border-blue-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${
                  tier.id === 'MISSION_CRITICAL'
                    ? 'bg-emerald-100 text-emerald-800'
                    : tier.id === 'OPERATIONAL_SYNC'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {tier.dscpTag}
                </span>
                <span className="text-[11px] font-extrabold text-slate-600">
                  {tier.weightPercent}% Allocation
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {language === 'ku' ? tier.nameKu : tier.nameEn}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {language === 'ku' ? tier.descriptionKu : tier.descriptionEn}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Sample Data Packets:
                </span>
                <div className="flex flex-wrap gap-1">
                  {tier.samplePayloads.map((payload, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700"
                    >
                      {payload}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                {tier.isThrottledDuringCongestion ? (
                  <span className="text-amber-700 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {language === 'ku' ? 'خۆکارانە دەوەستێندرێت لە کاتی لۆدی هێڵ' : 'Automatically throttled / deferred'}
                  </span>
                ) : (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {language === 'ku' ? '١٠٠٪ پارێزراوە و هەرگیز ناپچڕێت' : 'Guaranteed 0% drop policy'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Individual Remote Site Bandwidth Controllers */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
              <span>{language === 'ku' ? 'کۆنترۆڵی خێرایی و فلـتەری هەر پڕۆژەیەک بە جیا' : 'Site-by-Site Bandwidth Allocations & Auto-Shedding'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ku'
                ? 'دیاریکردنی سنوری باندویس (Kbps/Mbps)، دۆخی فلـتەر، و کاتی دەستپێکردنی کەمکردنەوەی خۆکاری داتای پاشبنەما'
                : 'Adjust individual bandwidth caps, throttle mode, and auto-shed latency thresholds for each branch.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">{language === 'ku' ? 'سەرجەم پڕۆژەکان (7 Sites)' : 'All 7 Operational Sites'}</option>
              {policies.map(p => (
                <option key={p.siteId} value={p.siteId}>
                  {language === 'ku' ? p.siteNameKu : p.siteNameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Site Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredPolicies.map(policy => {
            const isAutoSheddingNow = policy.isThrottledDueToLatency || (policy.autoQoSEnabled && policy.currentLatencyMs >= policy.autoQoSLatencyThresholdMs);
            const utilizationPercent = Math.round((policy.currentUsageKbps / policy.allocatedBandwidthKbps) * 100);

            return (
              <div
                key={policy.siteId}
                className={`p-6 rounded-3xl border transition shadow-xs space-y-4 ${
                  isAutoSheddingNow
                    ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-400/40'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Site Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {policy.siteCode}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        {policy.carrierIsp}
                      </span>
                      {isAutoSheddingNow && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Auto-Shed Active
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {language === 'ku' ? policy.siteNameKu : policy.siteNameEn}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {language === 'ku' ? policy.locationKu : policy.locationEn}
                    </span>
                  </div>

                  {/* Latency Meter */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Ping Latency</span>
                    <span className={`text-lg font-mono font-black block ${
                      policy.currentLatencyMs < 75
                        ? 'text-emerald-600'
                        : policy.currentLatencyMs < 130
                        ? 'text-amber-600'
                        : 'text-rose-600 animate-bounce'
                    }`}>
                      {policy.currentLatencyMs} ms
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Threshold: {policy.autoQoSLatencyThresholdMs}ms
                    </span>
                  </div>
                </div>

                {/* Bandwidth Cap Slider & Allocation */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                      {language === 'ku' ? 'سنووری باندویس (Bandwidth Cap):' : 'Bandwidth Throttle Cap:'}
                    </span>
                    <span className="font-mono font-black text-indigo-700 text-sm">
                      {policy.allocatedBandwidthKbps >= 1024
                        ? `${(policy.allocatedBandwidthKbps / 1024).toFixed(1)} Mbps`
                        : `${policy.allocatedBandwidthKbps} Kbps`}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={512}
                    max={policy.maxAvailableBandwidthKbps}
                    step={256}
                    value={policy.allocatedBandwidthKbps}
                    onChange={(e) => handleUpdatePolicy(policy.siteId, {
                      allocatedBandwidthKbps: Number(e.target.value)
                    })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Min: 512 Kbps</span>
                    <span>Usage: {(policy.currentUsageKbps / 1024).toFixed(2)} Mbps ({utilizationPercent}%)</span>
                    <span>Max: {(policy.maxAvailableBandwidthKbps / 1024).toFixed(0)} Mbps</span>
                  </div>
                </div>

                {/* Traffic Composition Breakdown Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium text-[11px]">
                      {language === 'ku' ? 'شێوازی دابەشبوونی داتا لەم چرکەیەدا:' : 'Live Traffic Distribution:'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-600">
                      {policy.currentUsageKbps} Kbps Total
                    </span>
                  </div>

                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      style={{ width: `${Math.min(100, (policy.criticalUsageKbps / policy.currentUsageKbps) * 100)}%` }}
                      className="bg-emerald-500 h-full transition-all duration-300"
                      title={`Critical Traffic: ${policy.criticalUsageKbps} Kbps`}
                    />
                    <div
                      style={{ width: `${Math.min(100, (policy.operationalUsageKbps / policy.currentUsageKbps) * 100)}%` }}
                      className="bg-blue-500 h-full transition-all duration-300"
                      title={`Operational Sync: ${policy.operationalUsageKbps} Kbps`}
                    />
                    <div
                      style={{ width: `${Math.min(100, (policy.backgroundUsageKbps / policy.currentUsageKbps) * 100)}%` }}
                      className={`h-full transition-all duration-300 ${isAutoSheddingNow ? 'bg-amber-400 animate-pulse' : 'bg-slate-400'}`}
                      title={`Background Media: ${policy.backgroundUsageKbps} Kbps`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Critical: {policy.criticalUsageKbps} Kbps (100% OK)
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-blue-700">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Operations: {policy.operationalUsageKbps} Kbps
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <span className={`w-2 h-2 rounded-full ${isAutoSheddingNow ? 'bg-amber-500' : 'bg-slate-400'}`} />
                      Background: {policy.backgroundUsageKbps} Kbps {isAutoSheddingNow && '(Shed)'}
                    </span>
                  </div>
                </div>

                {/* Throttle Mode & Auto-QoS Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1 font-medium">
                      {language === 'ku' ? 'دۆخی فلـتەرکردن:' : 'Throttling Mode:'}
                    </label>
                    <select
                      value={policy.throttleMode}
                      onChange={(e) => handleUpdatePolicy(policy.siteId, {
                        throttleMode: e.target.value as ThrottleMode
                      })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1.5 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="UNRESTRICTED">Unrestricted (No Cap)</option>
                      <option value="BALANCED_QOS">Balanced QoS (Standard)</option>
                      <option value="AGGRESSIVE_THROTTLE">Aggressive Throttle</option>
                      <option value="EMERGENCY_CRITICAL_ONLY">Emergency Critical Only</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-500 font-medium">
                        {language === 'ku' ? 'دەستپێکردنی کەمکردنەوە لە:' : 'Auto-Shed Latency:'}
                      </label>
                      <span className="font-mono font-bold text-slate-700">{policy.autoQoSLatencyThresholdMs}ms</span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={200}
                      step={5}
                      value={policy.autoQoSLatencyThresholdMs}
                      onChange={(e) => handleUpdatePolicy(policy.siteId, {
                        autoQoSLatencyThresholdMs: Number(e.target.value)
                      })}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                {/* Action Buttons: Latency Spike Simulator */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={policy.autoQoSEnabled}
                        onChange={(e) => handleUpdatePolicy(policy.siteId, { autoQoSEnabled: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                      <span>{language === 'ku' ? 'چالاککردنی Auto-QoS' : 'Enable Auto-QoS Shedding'}</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAutoSheddingNow ? (
                      <button
                        onClick={() => handleResetLatency(policy.siteId)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'ku' ? 'ئاساییکردنەوە' : 'Restore Normal'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSimulateLatencySpike(policy.siteId, 220)}
                        disabled={simulatingSiteId === policy.siteId}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 flex items-center gap-1 transition cursor-pointer"
                        title="Simulate network congestion to verify automated background shedding"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === 'ku' ? 'تاقیکردنەوەی خاوبوونەوە (220ms)' : 'Simulate Spike (220ms)'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleRunPayloadTest(policy.siteNameEn)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition cursor-pointer"
                      title="Test prioritized transmission queue"
                    >
                      <Radio className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{language === 'ku' ? 'تاقیکردنەوەی پاکێت' : 'Test Queue'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Live Interactive Queue Transmission Test Feedback */}
      {testPayloadStatus && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 text-white shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Interactive QoS Transmission Benchmark Results</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {testPayloadStatus === 'TESTING' ? 'Benchmarking Queues...' : 'Completed - Zero Packet Drops'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-emerald-300 font-bold">
                <span>Packet 1: Purchase Order #PO-2026-904 Owner Approval</span>
                <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px]">Tier 1 (DSCP 46)</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Payload size: 4.2 KB (JSON + Electronic Signature). Transmitted via Expedited Forwarding queue.
              </p>
              <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold pt-1 border-t border-slate-700">
                <span>Latency: 14 ms</span>
                <span>Queue Delay: 0 ms [IMMEDIATE TRANSMISSION]</span>
              </div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span>Packet 2: High-Resolution Engineering Blueprint CAD Blob</span>
                <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[10px]">Tier 3 (DSCP 0)</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Payload size: 14.8 MB (DWG Drawing Archive). Transmitted via Elastic Best-Effort queue.
              </p>
              <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold pt-1 border-t border-slate-700">
                <span>Throttled to: 20 Kbps</span>
                <span>Status: Buffer Queued [PREVENTED LINK SATURATION]</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Real-Time QoS Activity & Auto-Shedding Event Log */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>{language === 'ku' ? 'تۆماری کردارەکانی بەڕێوەبردنی باندویس و Auto-QoS' : 'Real-Time Bandwidth & Auto-Shedding Event Log'}</span>
          </h2>
          <span className="text-xs font-mono text-slate-500">
            {events.length} Recorded Incidents
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Project Site</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">Recorded Ping</th>
                <th className="p-3">QoS Action & Enforced Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3 font-semibold text-slate-900">{event.siteName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      event.eventType === 'AUTO_SHED_TRIGGERED'
                        ? 'bg-amber-100 text-amber-800'
                        : event.eventType === 'CONGESTION_CLEARED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {event.eventType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-700">{event.latencyMs} ms</td>
                  <td className="p-3 text-slate-700 leading-snug">
                    {language === 'ku' ? event.messageKu : event.messageEn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
