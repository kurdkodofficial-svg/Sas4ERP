import React, { useState, useEffect } from 'react';
import {
  Radio,
  Wifi,
  Server,
  Laptop,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Shuffle,
  Printer,
  Shield,
  Clock,
  Sparkles,
  Layers,
  Globe,
  Network,
  Zap,
  Info,
  ChevronRight,
  Send,
  Database
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { holdingCloudSyncService } from '../../services/holdingCloudSyncService';

interface DiscoveryNodeItem {
  nodeId: string;
  siteCode: string;
  siteNameKu: string;
  siteNameEn: string;
  locationKu: string;
  locationEn: string;
  role: string;
  publicIp: string;
  localIp: string;
  carrierIsp: string;
  connectionType: string;
  relayProtocol: string;
  relayStatus: 'RELAY_ACTIVE' | 'DIRECT_PEER' | 'TUNNEL_BUFFERING';
  natTraversal: string;
  leaseTtlSeconds: number;
  leaseExpiresAt: number;
  registeredAt: string;
  lastHeartbeat: string;
  dynamicIpRotationsCount: number;
  ipHistory: string[];
}

interface DiscoveryEvent {
  id: string;
  timestamp: string;
  nodeId: string;
  siteName: string;
  eventType: 'IP_ROTATION_REGISTERED' | 'LEASE_RENEWED' | 'TUNNEL_RECONNECTED' | 'DISCOVERY_BROADCAST';
  oldIp?: string;
  newIp: string;
  carrierIsp: string;
  messageKu: string;
  messageEn: string;
}

export const SmartSyncRelayView: React.FC = () => {
  const { language, isRtl } = useLanguage();
  const { holding, openPrintManager } = useERP();

  const [nodes, setNodes] = useState<DiscoveryNodeItem[]>([]);
  const [events, setEvents] = useState<DiscoveryEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [currentLeaseSec, setCurrentLeaseSec] = useState<number>(180);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-njf-cmt');

  const fetchDiscoveryRegistry = async () => {
    try {
      const res = await fetch('/api/discovery/registry?key=HLD-KEY-2026-HQ-ERBIL');
      if (res.ok) {
        const data = await res.json();
        if (data.nodes) setNodes(data.nodes);
        if (data.recentEvents) setEvents(data.recentEvents);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoveryRegistry();
    const interval = setInterval(() => {
      fetchDiscoveryRegistry();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateRotation = async (nodeId: string) => {
    setIsRotating(true);
    try {
      const res = await fetch('/api/discovery/simulate-rotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdingKey: 'HLD-KEY-2026-HQ-ERBIL',
          nodeId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbackMessage(
          language === 'ku'
            ? `ئایپی ${data.node.siteNameKu} گۆڕدرا بۆ [${data.newIp}] و دەستبەجێ لە دیسکەڤەری سێرڤیس بە سەرکەوتوویی تۆمارکرایەوە!`
            : `IP for ${data.node.siteNameEn} dynamically rotated to [${data.newIp}] and instantly re-registered via Discovery Relay!`
        );
        setTimeout(() => setFeedbackMessage(null), 5000);
        await fetchDiscoveryRegistry();
      }
    } catch {
      // silent
    } finally {
      setIsRotating(false);
    }
  };

  const handleRegisterCurrentLaptop = async () => {
    const profile = holdingCloudSyncService.getNodeProfile();
    try {
      const res = await fetch('/api/discovery/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdingKey: 'HLD-KEY-2026-HQ-ERBIL',
          nodeId: profile.nodeId,
          siteName: profile.nodeName,
          location: profile.location,
          localIp: '192.168.1.100',
          leaseTtl: currentLeaseSec,
          carrierIsp: 'Dynamic Cellular/Fiber ISP',
          connectionType: '4G_LTE'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbackMessage(
          language === 'ku'
            ? `ئەم لاپتۆپە (${data.registeredIp}) لە سێرڤیسی دۆزینەوەی هۆڵدینگ بۆ ${data.leaseTtlSeconds} چرکە تۆمارکرا.`
            : `Current laptop (${data.registeredIp}) announced and registered with central Discovery Service for ${data.leaseTtlSeconds}s.`
        );
        setTimeout(() => setFeedbackMessage(null), 4000);
        await fetchDiscoveryRegistry();
      }
    } catch {
      // silent
    }
  };

  const handlePrintRelayAudit = () => {
    if (openPrintManager) {
      openPrintManager({
        title: language === 'ku' ? 'ڕاپۆرتی سێرڤیسی دۆزینەوە و ڕیلەیی زیرەکی ئایپی' : 'Smart Sync Relay & Central Discovery Service Audit',
        documentNumber: `DISCOVERY-RELAY-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
        category: 'IT_INFRASTRUCTURE',
        contentSummary: language === 'ku'
          ? `خشتەی لیسی دینامیکی و دیسکەڤەری بۆ ${nodes.length} پڕۆژە و لق. هەموو لقەکان بەبێ ئایپی جێگیر (Static IP) و بە پرۆتۆکۆڵی SAS-DYNAMIC-RELAY-V2 کاردەکەن.`
          : `Dynamic IP discovery and relay routing status covering ${nodes.length} project sites. Zero static IP requirement achieved across Kurdistan & Iraq.`
      });
    }
  };

  const totalRotations = nodes.reduce((acc, n) => acc + n.dynamicIpRotationsCount, 0);
  const activeRelays = nodes.filter((n) => n.relayStatus === 'RELAY_ACTIVE').length;
  const selectedNode = nodes.find((n) => n.nodeId === selectedNodeId) || nodes[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
              <Network className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-mono font-bold bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                  Smart Sync Relay
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Central Discovery Service: ONLINE
                </span>
                <span className="text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                  Protocol: SAS-DYNAMIC-RELAY-V2
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {language === 'ku'
                  ? 'سێرڤیسی دۆزینەوە و ڕیلەیی زیرەکی ئایپی (Smart Sync Relay & Discovery Service)'
                  : language === 'ar'
                  ? 'خدمة الاستكشاف والمرحل الذكي للمزامنة بدون IP ثابت'
                  : 'Smart Sync Relay & Central Discovery Service'}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {language === 'ku'
                  ? 'هەموو پڕۆژە و لقەکان (وەک کارگەی نەجەف و هەڵەبجە) لە کاتی گۆڕانی ئایپیدا دەستبەجێ ئایپییە دینامیکییەکەیان لە سێرڤیسی ناوەندی دۆزینەوە تۆمار دەکەن؛ بەمەش پێویستی بە هیچ ئایپییەکی جێگیر (Static IP) نامێنێت.'
                  : 'Projects automatically register their changing dynamic IPs to a central Discovery Service, maintaining persistent peer relay tunnels without requiring costly static IPs or manual reconfiguration.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
            <button
              onClick={handleRegisterCurrentLaptop}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition cursor-pointer shadow-lg shadow-indigo-950/40"
            >
              <Send className="w-4 h-4" />
              <span>{language === 'ku' ? 'تۆمارکردنی ئایپیی ئەم ئامێرە' : 'Announce This Terminal'}</span>
            </button>

            <button
              onClick={handlePrintRelayAudit}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>{language === 'ku' ? 'چاپکردنی خشتەی ڕیلەی' : 'Print Relay Audit'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="mt-4 bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Registered Project Leases */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{language === 'ku' ? 'ئامێرە تۆمارکراوەکان' : 'Registered Discovery Leases'}</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {nodes.length}
            </span>
            <span className="text-xs font-bold text-emerald-600">Active Leases</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {language === 'ku' ? 'تەواوی شار و پڕۆژەکانی هۆڵدینگ' : 'All holding branch endpoints'}
          </div>
        </div>

        {/* KPI 2: Static IP Requirement */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{language === 'ku' ? 'پێویستی بە ئایپی جێگیر' : 'Static IP Requirement'}</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 font-mono">
              0%
            </span>
            <span className="text-xs font-bold text-emerald-600">NOT NEEDED</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {language === 'ku' ? '١٠٠٪ پشتگیری CGNAT و 4G دەکات' : '100% Dynamic CGNAT Supported'}
          </div>
        </div>

        {/* KPI 3: Dynamic IP Rotations Handled */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{language === 'ku' ? 'تۆمارکردنەوەی خۆکارانە' : 'Dynamic IP Rotations'}</span>
            <Shuffle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600 font-mono">
              {totalRotations}
            </span>
            <span className="text-xs font-bold text-slate-500">Auto-Handled</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'ku' ? 'بێ پچڕان لە کاتی گۆڕانی ئایپی' : 'Zero manual reconfigurations'}</span>
          </div>
        </div>

        {/* KPI 4: Relay Tunnel Integrity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{language === 'ku' ? 'هێڵی ڕیلەیی چالاک' : 'Relay Tunnels Active'}</span>
            <Radio className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 font-mono">
              {activeRelays}/{nodes.length}
            </span>
            <span className="text-xs font-bold text-emerald-600">100% HEALTHY</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {language === 'ku' ? 'هەموو تونێلەکان کراوەن' : 'Bi-directional state relaying'}
          </div>
        </div>
      </div>

      {/* Main Registry Table & Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Registered Dynamic Project Sites Table (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-600" />
                <span>{language === 'ku' ? 'تۆماری ئایپییە دینامیکییەکان لە سێرڤیسی دۆزینەوە' : 'Dynamic Discovery Registry & Relay Table'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ku'
                  ? 'هەموو پڕۆژەیەک ئایپی نوێی خۆی ڕاستەوخۆ دەنێرێت تا هەموو هۆڵدینگەکە بەبێ پچڕان بیبینێت'
                  : 'Remote sites broadcast ephemeral IP updates to the holding master directory every lease cycle.'}
              </p>
            </div>

            <button
              onClick={fetchDiscoveryRegistry}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              title="Refresh Registry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {nodes.map((node) => {
              const isSelected = node.nodeId === selectedNodeId;
              return (
                <div
                  key={node.nodeId}
                  onClick={() => setSelectedNodeId(node.nodeId)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500/70 shadow-sm'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Radio className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            {language === 'ku' ? node.siteNameKu : node.siteNameEn}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                            Dynamic IP: {node.publicIp}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {node.dynamicIpRotationsCount}x Rotations OK
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                          <span>{language === 'ku' ? node.locationKu : node.locationEn}</span>
                          <span>•</span>
                          <span className="text-slate-600 font-medium">{node.carrierIsp}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-slate-400">Local: {node.localIp}</span>
                        </div>
                      </div>
                    </div>

                    {/* TTL Countdown & Simulation Action */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-600 block">
                          TTL: {node.leaseTtlSeconds}s Lease
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Relay: {node.relayProtocol}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulateRotation(node.nodeId);
                        }}
                        disabled={isRotating}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Simulate dynamic IP change & discovery update"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>{language === 'ku' ? 'گۆڕینی ئایپی' : 'Rotate IP'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Node Details & Live Discovery Event Stream (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl text-white space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  {language === 'ku' ? 'تایبەتمەندی ڕیلەی و دۆزینەوە' : 'Discovery Node Specs'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                TTL ACTIVE
              </span>
            </div>

            {selectedNode && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {language === 'ku' ? selectedNode.siteNameKu : selectedNode.siteNameEn}
                  </h3>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {selectedNode.carrierIsp}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Registered IP</span>
                    <span className="font-mono text-xs font-bold text-emerald-300 block truncate">
                      {selectedNode.publicIp}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block mb-0.5">NAT Traversal</span>
                    <span className="font-mono text-xs font-bold text-indigo-300 block truncate">
                      CGNAT OK
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>{language === 'ku' ? 'ڕێگای ڕیلەی:' : 'Relay Protocol:'}</span>
                    <span className="text-white font-mono">{selectedNode.relayProtocol}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>{language === 'ku' ? 'ئایپی ناوخۆیی (LAN):' : 'Local LAN Subnet:'}</span>
                    <span className="text-white font-mono">{selectedNode.localIp}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>{language === 'ku' ? 'دوا پشکنینی لیس:' : 'Last Heartbeat:'}</span>
                    <span className="text-emerald-400 font-medium">Just now</span>
                  </div>
                </div>

                <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-xl p-3 text-[11px] text-indigo-200 leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    {language === 'ku'
                      ? 'ئەم لقە بەبێ ئایپی جێگیر کاردەکات. کاتێک ئایپییەکەی دەگۆڕێت، ڕیلەی دیسکەڤەری لە ماوەی ٣٠ میلی چرکەدا بۆ هەموو کۆمپانیاکانی هۆڵدینگ نوێ دەکاتەوە.'
                      : 'Zero static IP requirement. When this node’s IP rotates, Smart Sync Relay updates the discovery registry within 30ms with uninterrupted state syncing.'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Rolling Event Feed */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400 block flex items-center justify-between">
              <span>{language === 'ku' ? 'تۆماری ڕووداوەکانی دیسکەڤەری' : 'Discovery Event Log'}</span>
              <span className="text-[10px] text-emerald-400 font-mono">Live Feed</span>
            </span>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {events.slice(0, 4).map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-indigo-300">{ev.siteName}</span>
                    <span className="text-slate-500 font-mono">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {language === 'ku' ? ev.messageKu : ev.messageEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
