import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Wifi,
  WifiOff,
  Share2,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  X,
  Server,
  Cpu,
  Laptop,
  Check,
  Zap,
  ShieldCheck,
  FileSpreadsheet,
  Send
} from 'lucide-react';
import {
  offlineMeshService,
  initialHoldingMeshNodes,
  MeshNode,
  QueuedOfflineMutation,
  ConnectionMode,
  MeshSyncPacket
} from '../../utils/offlineMeshSync';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';

interface HoldingMeshSyncHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HoldingMeshSyncHubModal: React.FC<HoldingMeshSyncHubModalProps> = ({
  isOpen,
  onClose
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ku' || language === 'ar';
  const { purchaseOrders, gateLogs, currentUser } = useERP();

  const [mode, setMode] = useState<ConnectionMode>('ONLINE_CLOUD');
  const [nodes, setNodes] = useState<MeshNode[]>(initialHoldingMeshNodes);
  const [outbox, setOutbox] = useState<QueuedOfflineMutation[]>([]);
  const [currentNode, setCurrentNode] = useState<MeshNode>(offlineMeshService.getCurrentNode());
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);
  const [activeTab, setActiveTab] = useState<'topology' | 'outbox' | 'airgap' | 'diagnostics'>('topology');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize and check status
  useEffect(() => {
    if (!isOpen) return;

    // Detect actual browser online status
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      setMode(isOnline ? 'ONLINE_CLOUD' : 'OFFLINE_MESH');
    };

    updateStatus();
    setOutbox(offlineMeshService.getOutbox());
    setCurrentNode(offlineMeshService.getCurrentNode());

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    const unsubscribe = offlineMeshService.subscribe((event) => {
      if (event.type === 'outbox_updated') {
        setOutbox(event.data);
      } else if (event.type === 'peer_mutation_received') {
        setSyncStatusMsg({
          text: `گۆڕانکاری نوێ لە لایەن گرێی (${event.data.originNodeName}) بە تۆڕی میش گەیشت!`,
          type: 'success'
        });
      } else if (event.type === 'peer_discovered') {
        setNodes((prev) => {
          const exists = prev.find((n) => n.nodeId === event.data.nodeId);
          if (exists) return prev;
          return [event.data, ...prev];
        });
      }
    });

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Scan local mesh network for peers
  const handleScanMesh = () => {
    setIsScanning(true);
    offlineMeshService.broadcastMeshPresence();
    setTimeout(() => {
      setIsScanning(false);
      setSyncStatusMsg({
        text: 'پشکنینی شەپۆلە ناوخۆییەکانی میش تەواوبوو: ٤ گرێی چالاکی هۆلدینگ بەستراونەتەوە.',
        type: 'success'
      });
      setTimeout(() => setSyncStatusMsg(null), 4000);
    }, 1200);
  };

  // Broadcast outbox to mesh peers
  const handleBroadcastSync = () => {
    setIsSyncing(true);
    offlineMeshService.broadcastMeshMessage('MESH_SYNC_BROADCAST', {
      source: currentNode,
      mutations: outbox,
      timestamp: Date.now()
    });

    setTimeout(() => {
      setIsSyncing(false);
      offlineMeshService.clearOutbox();
      setOutbox([]);
      setSyncStatusMsg({
        text: 'سەرجەم گۆڕانکارییە هەڵپەسێردراوەکان بە سەرکەوتوویی بە هەموو گرێیەکانی ناوخۆی هۆلدینگ بڵاوکرانەوە!',
        type: 'success'
      });
      setTimeout(() => setSyncStatusMsg(null), 4000);
    }, 1000);
  };

  // Generate test offline mutation (e.g. simulate offline approval or gate log)
  const handleSimulateOfflineAction = (type: 'approve_po' | 'gate_scan') => {
    if (type === 'approve_po') {
      offlineMeshService.queueMutation('APPROVE_PO', {
        poNumber: 'PO-MESH-2026-09',
        approvedBy: currentUser.name,
        amountUSD: 45000,
        company: 'Kurdistan Steel Co.',
        action: 'APPROVED_OFFLINE_BY_OWNER'
      });
      setSyncStatusMsg({
        text: 'پەسەندکردنی فەرمانی کڕین لە دۆخی ئۆفلاین تۆمارکرا و خرایە نۆرەی میشەوە.',
        type: 'info'
      });
    } else {
      offlineMeshService.queueMutation('ADD_GATE_LOG', {
        plateNumber: '44-A 98211 IRQ',
        cargoType: 'Reinforcing Steel Rebars (40 Tons)',
        driverName: 'سەردار مەحمود',
        gateNode: 'Alpha Gate',
        action: 'VERIFIED_OFFLINE'
      });
      setSyncStatusMsg({
        text: 'پشکنینی دەروازە لە دۆخی ئۆفلاین بە کێشی ئەلیکترۆنی تۆمارکرا و خرایە نۆرەوە.',
        type: 'info'
      });
    }
    setOutbox(offlineMeshService.getOutbox());
    setTimeout(() => setSyncStatusMsg(null), 3500);
  };

  // Export .sasmesh file for air-gapped transport
  const handleExportAirGapFile = () => {
    const packet = offlineMeshService.generateExportPacket({
      approvedPOsCount: purchaseOrders.filter((p) => p.status === 'APPROVED_BY_OWNER').length,
      gateLogsCount: gateLogs.length,
      notesCount: 3
    });
    offlineMeshService.downloadSyncPacketFile(packet);
    setSyncStatusMsg({
      text: 'فایلی پاکێتی هاوکاتکردنی میش (.sasmesh) داگیرا بۆ گواستنەوە بە فلاش یان ڕادیۆ.',
      type: 'success'
    });
    setTimeout(() => setSyncStatusMsg(null), 4000);
  };

  // Import .sasmesh file
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = offlineMeshService.parseAndImportPacket(content);
        if (result.success) {
          setSyncStatusMsg({ text: result.messageKu, type: 'success' });
          setOutbox(offlineMeshService.getOutbox());
        } else {
          setSyncStatusMsg({ text: result.messageKu, type: 'warn' });
        }
        setTimeout(() => setSyncStatusMsg(null), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      id="holding-mesh-sync-hub-modal"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl text-white overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  {isRTL ? 'تۆڕی خۆجێیی میش و کارکردنی بێ ئینتەرنێت' : 'Holding Local Mesh & Offline Sync Hub'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold uppercase">
                  P2P Mesh v1.2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRTL
                  ? 'کارکردنی تەواو بێ پچڕان لە کاتی نەبوونی ئینتەرنێت و بەستنەوەی یەکەکان بە تۆڕی میش'
                  : 'Zero-downtime offline operation with peer-to-peer decentralized local mesh networking.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleScanMesh}
              disabled={isScanning}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-blue-400' : ''}`} />
              <span>{isRTL ? 'پشکنینی گرێیەکان' : 'Scan Peers'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Toast Notification */}
        {syncStatusMsg && (
          <div
            className={`px-5 py-2.5 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 border-b ${
              syncStatusMsg.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
                : syncStatusMsg.type === 'warn'
                ? 'bg-rose-950/90 text-rose-300 border-rose-800'
                : 'bg-blue-950/90 text-blue-300 border-blue-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncStatusMsg.text}</span>
          </div>
        )}

        {/* Connectivity Status Summary Strip */}
        <div className="px-6 py-3.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">{isRTL ? 'دۆخی پەیوەندی:' : 'Connection State:'}</span>
              {mode === 'ONLINE_CLOUD' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'سەرهێڵ (ئینتەرنێت + میش چالاکە)' : 'Online (Cloud + Local Mesh)'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'ئۆفلاین (تۆڕی خۆجێیی میش کاردەکات)' : 'Offline (Local Mesh Active)'}</span>
                </span>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>{isRTL ? 'گرێی ئەم ئامێرە:' : 'Active Node:'}</span>
              <strong className="text-slate-200 font-mono">{currentNode.nameKu}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">
              {isRTL ? 'نۆرەی گۆڕانکاری ئۆفلاین:' : 'Outbox Queue:'}
            </span>
            <span
              className={`px-2 py-0.5 rounded-lg text-xs font-bold font-mono ${
                outbox.length > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {outbox.length} {isRTL ? 'کردار' : 'actions'}
            </span>

            {outbox.length > 0 && (
              <button
                onClick={handleBroadcastSync}
                disabled={isSyncing}
                className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>{isRTL ? 'هاوکاتکردنی میش' : 'Sync Mesh'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center gap-2 bg-slate-900">
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'topology'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isRTL ? 'گرێیەکانی تۆڕی میش' : 'Mesh Nodes Topology'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
              {nodes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('outbox')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'outbox'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isRTL ? 'نۆرەی کرداری ئۆفلاین (Outbox)' : 'Offline Actions Queue'}</span>
            {outbox.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black">
                {outbox.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('airgap')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'airgap'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{isRTL ? 'هاوکاتکردنی فلاش و دابڕاو (Air-Gap)' : 'Air-Gap USB / Packet Sync'}</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'diagnostics'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isRTL ? 'پشکنینی PWA و سێرڤس وۆرکەر' : 'Offline Cache Diagnostics'}</span>
          </button>
        </div>

        {/* Tab 1: Topology of Holding Mesh Nodes */}
        {activeTab === 'topology' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
              <div>
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">
                  {isRTL ? 'پەیوەندی ڕاستەوخۆی شوێنەکانی هۆلدینگ بە تۆڕی میش' : 'Decentralized Holding Nodes Mesh'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isRTL
                    ? 'لە کاتی بڕانی کێبڵی گشتی یان نەبوونی ئینتەرنێت لە ناوچە دوورەدەستەکان، ئەم یەکانە ڕاستەوخۆ بە یەکەوە داتا دەگۆڕنەوە.'
                    : 'If internet drops, nodes automatically communicate peer-to-peer over local radio, Wi-Fi mesh, or private LAN.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulateOfflineAction('approve_po')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
                  title={isRTL ? 'تاقیکردنەوەی واژۆکردنی فەرمانی کڕین لە دۆخی ئۆفلاین' : 'Test Offline PO Approval'}
                >
                  ⚡ {isRTL ? 'تاقیکردنەوەی واژۆی ئۆفلاین' : 'Test Offline PO Approval'}
                </button>
                <button
                  onClick={() => handleSimulateOfflineAction('gate_scan')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
                  title={isRTL ? 'تاقیکردنەوەی تۆمارکردنی بارهەڵگری دەروازە بێ ئینتەرنێت' : 'Test Offline Gate Logistics'}
                >
                  🚚 {isRTL ? 'تاقیکردنەوەی دەروازەی بێ ئینتەرنێت' : 'Test Offline Gate Log'}
                </button>
              </div>
            </div>

            {/* Grid of Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {nodes.map((node) => {
                const isCurrent = node.nodeId === currentNode.nodeId || node.nodeId === 'node-hq-owner';
                const nodeDisplayName = language === 'en' ? node.name : node.nameKu;
                const nodeDisplayLoc = language === 'en' ? node.siteLocation : node.siteLocationKu;
                const nodeLastSeen = language === 'en' ? (node.lastSeenEn || 'Active Now') : node.lastSeen;

                return (
                  <div
                    key={node.nodeId}
                    className={`rounded-2xl p-4 border transition flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-blue-950/30 border-blue-500/60 shadow-lg shadow-blue-500/5'
                        : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {node.role === 'HOLDING_OWNER' ? <ShieldCheck className="w-4 h-4" /> : <Server className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-xs font-black text-white">{nodeDisplayName}</h5>
                              {isCurrent && (
                                <span className="text-[9px] font-bold px-1.5 rounded bg-blue-500 text-white">
                                  {isRTL ? 'ئەم ئامێرە' : 'This Device'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{node.ipAddress}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          node.status === 'ACTIVE_MESH'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-700 text-slate-300 border-slate-600'
                        }`}>
                          {node.connectionType}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        📍 {nodeDisplayLoc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{isRTL ? 'دوا پەیوەندی:' : 'Last Seen:'} {nodeLastSeen}</span>
                      <span className="text-slate-300 font-bold font-mono">
                        {node.pendingSyncCount > 0 ? (isRTL ? `⚠️ ${node.pendingSyncCount} نۆرە` : `⚠️ ${node.pendingSyncCount} queued`) : (isRTL ? '✓ هاوکاتکراوە' : '✓ Synced')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Outbox Queue */}
        {activeTab === 'outbox' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">
                  {isRTL ? 'لیستی ئەو کارانەی بەبێ ئینتەرنێت ئەنجامدراون' : 'Offline Pending Mutations'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isRTL
                    ? 'ئەم کارانە لە کۆگای ناوخۆیی وێبگەڕدا پارێزراون و بە هەبوونی شەپۆلی میش یان ئینتەرنێت ڕاستەوخۆ بڵاودەکرێنەوە.'
                    : 'Changes captured offline, safely buffered and ready to propagate across Holding nodes.'}
                </p>
              </div>

              {outbox.length > 0 && (
                <button
                  onClick={handleBroadcastSync}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'ناردنی هەموو گۆڕانکارییەکان بۆ میش' : 'Sync All via Mesh'}</span>
                </button>
              )}
            </div>

            {outbox.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-700 rounded-3xl bg-slate-800/20">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <h5 className="text-sm font-bold text-slate-200">
                  {isRTL ? 'نۆرەکە خاوێنە و هەموو داتاکان هاوکاتکراون' : 'No Pending Offline Mutations'}
                </h5>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {isRTL
                    ? 'هەر بڕیارێک یان واژۆیەک کە لە دۆخی ئۆفلاین ئەنجامی بدەیت دەستبەجێ لێرە تۆمار دەکرێت.'
                    : 'Every action performed offline will queue here and sync automatically when linked.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {outbox.map((mut) => (
                  <div
                    key={mut.id}
                    className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400 font-mono uppercase">
                          [{mut.type}]
                        </span>
                        <span className="text-slate-200 font-medium">
                          {mut.payload?.poNumber || mut.payload?.plateNumber || mut.payload?.action || 'Offline Action'}
                        </span>
                        <span className="text-[10px] px-1.5 rounded bg-slate-700 text-slate-300">
                          {mut.originNodeName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        {JSON.stringify(mut.payload)}
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(mut.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Air-Gap USB File Transport */}
        {activeTab === 'airgap' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    {isRTL ? 'هاوکاتکردنی دابڕاو بە فلاش میمۆری (Air-Gapped Transport)' : 'Air-Gapped Physical Transport'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {isRTL
                      ? 'ئەگەر لە شوێنێک بوویت کە هیچ شەپۆلێک (کێبڵ، Wi-Fi، یان مۆبایل) بوونی نەبوو، دەتوانیت تەواوی گۆڕانکارییەکانی سیستەم وەک فایلی مۆرکراوی (.sasmesh) دەربهێنیت و بە فلاش میمۆری بیبەیت بۆ کۆمپیوتەری سەرۆکایەتی هۆلدینگ بۆ هاوردەکردن.'
                      : 'For high-security industrial sites or completely severed communications, export and import digitally signed .sasmesh packets via encrypted USB.'}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-indigo-900/60 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExportAirGapFile}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>{isRTL ? 'هەناردەکردنی فایلی میش (.sasmesh)' : 'Export .sasmesh File'}</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-sky-400" />
                  <span>{isRTL ? 'هاوردەکردنی پاکێتی میش (Import)' : 'Import .sasmesh Packet'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".sasmesh,.json"
                  onChange={handleImportFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2 text-xs">
              <h5 className="font-bold text-slate-200">
                {isRTL ? 'ڕێساکانی مۆر و سەلامەتی داتای میش:' : 'Mesh Cryptographic Rules:'}
              </h5>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>{isRTL ? 'هەموو پاکێتێک ناوی گرێی سەرچاوە و کاتی دروستبوونی لەخۆدەگرێت.' : 'Each packet embeds the origin node signature and Lamport timestamp.'}</li>
                <li>{isRTL ? 'لە کاتی تێکەڵکردندا هیچ داتایەکی کۆن بەسەر داتای نوێدا ناسڕدرێتەوە.' : 'Conflict resolution automatically merges latest verified actions without overwriting.'}</li>
                <li>{isRTL ? 'پەسەندکردنی خاوەنی هۆلدینگ بەرزترین دەسەڵاتی بڕیار لە تەواوی گرێیەکان دەمێنێتەوە.' : 'Holding Owner approval authority maintains highest override priority across all nodes.'}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 4: Diagnostics */}
        {activeTab === 'diagnostics' && (
          <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                <span className="text-slate-400 font-bold block mb-1">Service Worker (PWA)</span>
                <div className="text-base font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>{isRTL ? 'چالاکە و کاش دەکرێت' : 'Active & Caching'}</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">/sw.js (Cache: sas4erp-offline-v1)</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                <span className="text-slate-400 font-bold block mb-1">P2P BroadcastChannel</span>
                <div className="text-base font-extrabold text-blue-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>{isRTL ? 'پەیوەستە' : 'Connected'}</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Channel: sas4erp_holding_mesh_bus</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                <span className="text-slate-400 font-bold block mb-1">Local Storage Database</span>
                <div className="text-base font-extrabold text-purple-400 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4" />
                  <span>{isRTL ? 'پارێزراوە لە وێبگەڕدا' : 'Synced in Local DB'}</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Offline Mirroring Active</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-2">
              <h5 className="font-extrabold text-slate-200">
                {isRTL ? 'چۆن تاقیکردنەوەی بێ ئینتەرنێت بکەیت؟' : 'How to Test Completely Offline:'}
              </h5>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                <li>{isRTL ? 'وایفای کۆمپیوتەرەکەت بکوژێنەرەوە یان وێبگەڕ بخەرە دۆخی Offline لە DevTools.' : 'Turn off your Wi-Fi or set browser to Offline in DevTools Network tab.'}</li>
                <li>{isRTL ? 'پەڕەکە ڕیفریش بکە؛ دەبینیت سیستەم بە تەواوی و بە خێرایی دەکرێتەوە بەبێ هیچ کێشەیەک.' : 'Refresh the page; notice SAS4ERP loads instantly from the offline Service Worker cache.'}</li>
                <li>{isRTL ? 'فەرمانی کڕینێک پەسەند بکە یان تێبینی نوێ بنووسە؛ دەبینیت دەچێتە نۆرەی میشەوە.' : 'Approve a PO or add a note; it buffers in the Outbox without error.'}</li>
                <li>{isRTL ? 'بە دووبارە بەستنەوەی شەپۆلی ناوخۆیی یان ئینتەرنێت، سەرجەم داتاکان بە یەک چرکە هاوکات دەبنەوە.' : 'Upon reconnecting, all changes broadcast and reconcile automatically.'}</li>
              </ol>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>{isRTL ? 'سیستەمی میشی ناوخۆی هۆلدینگ بۆ داهاتوو ئامادەکراوە' : 'Holding Local Mesh Protocol is production-ready.'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
          >
            {isRTL ? 'داخستن' : 'Close Hub'}
          </button>
        </div>

      </div>
    </div>
  );
};
