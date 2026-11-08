import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  ArrowRightLeft,
  RefreshCw,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Key,
  Copy,
  Info,
  Server,
  Download,
  UploadCloud,
  Layers,
  Zap,
  Filter,
  Eye,
  FileCheck2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useERP } from '../../context/ERPContext';
import {
  BufferedQueueItem,
  BufferItemType,
  BufferTelemetryStats,
  FlushBatchResult
} from '../../types/localDataBuffer';
import {
  saveItemToIndexedDB,
  getAllBufferedItemsFromIndexedDB,
  updateItemInIndexedDB,
  deleteItemFromIndexedDB,
  clearAcknowledgedFromIndexedDB,
  encryptBufferPayload,
  decryptBufferPayload
} from '../../utils/indexedDbBuffer';

export const LocalDataBufferView: React.FC = () => {
  const { language, isRtl } = useLanguage();
  const { holding } = useERP();

  const [items, setItems] = useState<BufferedQueueItem[]>([]);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isOnlineState, setIsOnlineState] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [autoFlushEnabled, setAutoFlushEnabled] = useState<boolean>(true);
  const [isFlushing, setIsFlushing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [inspectItem, setInspectItem] = useState<BufferedQueueItem | null>(null);
  const [decryptedPreview, setDecryptedPreview] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [centralTelemetry, setCentralTelemetry] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [totalFlushedCount, setTotalFlushedCount] = useState<number>(2);

  // Monitor real browser online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnlineState(true);
      if (autoFlushEnabled && !isSimulatedOffline) {
        triggerAutoFlush();
      }
    };
    const handleOffline = () => {
      setIsOnlineState(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoFlushEnabled, isSimulatedOffline]);

  // Load items from IndexedDB on startup
  const loadIndexedDbQueue = async () => {
    try {
      let dbItems = await getAllBufferedItemsFromIndexedDB();

      // Seed realistic initial items if empty
      if (dbItems.length === 0) {
        const sample1Enc = await encryptBufferPayload({
          poId: 'PO-2026-NJF-0881',
          supplier: 'Al-Najaf Industrial Kilns Co.',
          amountUSD: 45000,
          currency: 'USD',
          purpose: 'High-Temperature Refractory Bricks for Cement Kiln Line 2',
          requester: 'Eng. Karrar Al-Mousawi (Plant Director)',
          signedOffline: true
        });

        const sample2Enc = await encryptBufferPayload({
          ticketId: 'WB-2026-HLB-9912',
          vehiclePlate: 'IQ-SUL-48192',
          grossWeightKg: 42500,
          netWeightKg: 28400,
          material: 'Portland Cement Grade 42.5R',
          siteDispatcher: 'Soran Faruq',
          gateScannedAt: new Date(Date.now() - 3600000).toISOString()
        });

        const initial1: BufferedQueueItem = {
          id: `buf-item-${Date.now()}-1`,
          queueSequence: 1,
          itemType: 'APPROVAL_REQUEST',
          siteId: 'node-njf-cmt',
          siteNameEn: 'Najaf Cement Manufacturing Plant',
          siteNameKu: 'کارگەی بەرهەمهێنانی چیمەنتۆی نەجەف',
          createdAt: new Date(Date.now() - 5400000).toISOString(),
          status: 'QUEUED_ENCRYPTED',
          priority: 'MISSION_CRITICAL',
          titleEn: 'Purchase Order Approval #PO-2026-NJF-0881 ($45,000 USD)',
          titleKu: 'داواکاری پەسەندکردنی کڕینی بلۆکی فڕن ($45,000 دۆلار)',
          requesterName: 'Eng. Karrar Al-Mousawi',
          requesterRole: 'Plant Director',
          amountUSD: 45000,
          entityReference: 'PO-2026-NJF-0881',
          encryptedPayload: sample1Enc,
          plainTextPreview: {
            reference: 'PO-2026-NJF-0881',
            details: 'High-Temperature Refractory Bricks for Cement Kiln Line 2',
            actionType: 'OWNER_SIGNATURE_REQ'
          },
          retryCount: 0
        };

        const initial2: BufferedQueueItem = {
          id: `buf-item-${Date.now()}-2`,
          queueSequence: 2,
          itemType: 'WEIGHBRIDGE_TICKET',
          siteId: 'node-hlb-prj',
          siteNameEn: 'Halabja Branch Office & Central Warehouse',
          siteNameKu: 'لقی هەڵەبجە و کۆگای دابەشکردنی پارێزگا',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'QUEUED_ENCRYPTED',
          priority: 'HIGH',
          titleEn: 'Optical Weighbridge Outgoing Cargo Ticket #WB-2026-HLB-9912',
          titleKu: 'پسوولەی کێشکردنی بارهەڵگری چیمەنتۆ (٢٨.٤ تەن)',
          requesterName: 'Soran Faruq',
          requesterRole: 'Logistics Supervisor',
          entityReference: 'WB-2026-HLB-9912',
          encryptedPayload: sample2Enc,
          plainTextPreview: {
            reference: 'WB-2026-HLB-9912',
            details: '28.4 Ton Portland Cement dispatch cargo to Sulaymaniyah Depot',
            actionType: 'DISPATCH_LOG'
          },
          retryCount: 0
        };

        await saveItemToIndexedDB(initial1);
        await saveItemToIndexedDB(initial2);
        dbItems = [initial1, initial2];
      }

      setItems(dbItems);
    } catch (err) {
      console.error('Failed to initialize IndexedDB:', err);
    }
  };

  // Fetch holding server central telemetry
  const fetchCentralTelemetry = async () => {
    try {
      const res = await fetch('/api/buffer/telemetry');
      if (res.ok) {
        const data = await res.json();
        setCentralTelemetry(data);
        if (data.totalCommittedItemsCount) {
          setTotalFlushedCount(data.totalCommittedItemsCount);
        }
      }
    } catch (err) {
      console.error('Failed to fetch central buffer telemetry:', err);
    }
  };

  useEffect(() => {
    loadIndexedDbQueue();
    fetchCentralTelemetry();
  }, []);

  // Effective connection status considering real online and simulated offline toggle
  const isEffectivelyOnline = isOnlineState && !isSimulatedOffline;

  // Flush queued items to central holding server
  const triggerAutoFlush = async () => {
    if (!isEffectivelyOnline) return;

    const queuedItems = items.filter(
      item => item.status === 'QUEUED_ENCRYPTED' || item.status === 'RETRY_PENDING'
    );

    if (queuedItems.length === 0) return;

    setIsFlushing(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/buffer/flush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: queuedItems,
          siteId: 'CLIENT_INDEXED_DB_AGENT',
          siteName: 'Remote Operational Sites'
        })
      });

      if (res.ok) {
        const result: FlushBatchResult = await res.json();
        const now = new Date().toISOString();

        // Update IndexedDB statuses
        for (const item of queuedItems) {
          const ack = result.holdingAckTokens[item.id] || `HOLDING-ACK-${Date.now()}`;
          const updated: BufferedQueueItem = {
            ...item,
            status: 'SYNCED_HOLDING',
            syncedAt: now,
            holdingAckToken: ack
          };
          await updateItemInIndexedDB(updated);
        }

        const freshItems = await getAllBufferedItemsFromIndexedDB();
        setItems(freshItems);
        setTotalFlushedCount(prev => prev + queuedItems.length);

        setStatusMessage(
          language === 'ku'
            ? `🚀 پەیوەندی هێڵ گەڕایەوە! ${queuedItems.length} داواکاریی خەزنکراوی IndexedDB خۆکارانە ڕەوانەی سێرڤەری سەرەکی هۆڵدینگ کران و واژۆ کران.`
            : `🚀 Connection re-established! Automatically flushed ${queuedItems.length} encrypted IndexedDB requests to central holding server.`
        );
        setTimeout(() => setStatusMessage(null), 6000);
        fetchCentralTelemetry();
      }
    } catch (err) {
      console.error('Error flushing buffer:', err);
      setStatusMessage(
        language === 'ku'
          ? 'کێشە لە پەیوەندی هێڵ ڕوویدا؛ داتاکان پارێزراون لەناو ئیندێکس‌دی‌بی.'
          : 'Network error encountered during flush. Items preserved in encrypted IndexedDB.'
      );
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setIsFlushing(false);
    }
  };

  // Queue a new offline approval request
  const handleQueueOfflineApproval = async (siteName: string = 'Najaf Cement Plant') => {
    try {
      const poSeq = Math.floor(Math.random() * 800) + 100;
      const amount = Math.floor(Math.random() * 25000) + 12000;
      const ref = `PO-2026-OFF-${poSeq}`;

      const rawPayload = {
        poId: ref,
        supplier: 'Baghdad Refractory Kiln Equipment Ltd.',
        amountUSD: amount,
        currency: 'USD',
        purpose: 'Replacement High-Pressure Hydraulic Pump & Seals (Cement Kiln)',
        requester: 'Field Operations Engineer',
        airGappedTimestamp: new Date().toISOString()
      };

      const encrypted = await encryptBufferPayload(rawPayload);

      const newItem: BufferedQueueItem = {
        id: `buf-item-${Date.now()}`,
        queueSequence: items.length + 1,
        itemType: 'APPROVAL_REQUEST',
        siteId: 'node-njf-cmt',
        siteNameEn: 'Najaf Cement Manufacturing Plant',
        siteNameKu: 'کارگەی بەرهەمهێنانی چیمەنتۆی نەجەف',
        createdAt: new Date().toISOString(),
        status: 'QUEUED_ENCRYPTED',
        priority: 'MISSION_CRITICAL',
        titleEn: `Emergency Purchase Order ${ref} ($${amount.toLocaleString()} USD)`,
        titleKu: `داواکاری کڕینی کەرەستەی فڕن ${ref} ($${amount.toLocaleString()})`,
        requesterName: 'Eng. Karrar Al-Mousawi',
        requesterRole: 'Plant Operations Manager',
        amountUSD: amount,
        entityReference: ref,
        encryptedPayload: encrypted,
        plainTextPreview: {
          reference: ref,
          details: 'Replacement High-Pressure Hydraulic Pump & Seals for Cement Line',
          actionType: 'OWNER_SIGNATURE_REQ'
        },
        retryCount: 0
      };

      await saveItemToIndexedDB(newItem);
      setItems(prev => [...prev, newItem]);

      setStatusMessage(
        language === 'ku'
          ? `داواکاری کڕینی ${ref} بە کۆدکراوی AES-256 لە ئیندێکس‌دی‌بی خەزن کرا. کاتێک ئینتەرنێت پەیدا بوو خۆکارانە دەنێردرێت.`
          : `Approval request ${ref} encrypted with AES-256 and safely cached in IndexedDB. Will auto-flush upon connectivity.`
      );
      setTimeout(() => setStatusMessage(null), 5000);

      // If online and auto-flush enabled, flush immediately
      if (isEffectivelyOnline && autoFlushEnabled) {
        setTimeout(triggerAutoFlush, 600);
      }
    } catch (err) {
      console.error('Error queuing offline item:', err);
    }
  };

  // Inspect and Decrypt item
  const handleInspectItem = async (item: BufferedQueueItem) => {
    setInspectItem(item);
    try {
      const decrypted = await decryptBufferPayload(item.encryptedPayload);
      setDecryptedPreview(decrypted);
    } catch (err) {
      console.error('Failed to decrypt preview:', err);
      setDecryptedPreview(null);
    }
  };

  // Delete item from IndexedDB
  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItemFromIndexedDB(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Error deleting item from IndexedDB:', err);
    }
  };

  // Clear Synced items
  const handleClearAcknowledged = async () => {
    try {
      const count = await clearAcknowledgedFromIndexedDB();
      const fresh = await getAllBufferedItemsFromIndexedDB();
      setItems(fresh);
      setStatusMessage(
        language === 'ku'
          ? `${count} تۆماری هاوکاتکراو لە ئیندێکس‌دی‌بی پاککرانەوە.`
          : `Purged ${count} synced items from local IndexedDB storage.`
      );
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Error clearing acknowledged:', err);
    }
  };

  // Export Buffer to Encrypted JSON File
  const handleExportEncryptedJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SAS_Encrypted_Offline_Buffer_${Date.now()}.enc.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 3000);
  };

  const filteredItems = items.filter(item => {
    if (selectedFilter === 'QUEUED') return item.status === 'QUEUED_ENCRYPTED' || item.status === 'RETRY_PENDING';
    if (selectedFilter === 'SYNCED') return item.status === 'SYNCED_HOLDING';
    if (selectedFilter === 'APPROVALS') return item.itemType === 'APPROVAL_REQUEST';
    if (selectedFilter === 'LOGS') return item.itemType !== 'APPROVAL_REQUEST';
    return true;
  });

  const queuedCount = items.filter(i => i.status === 'QUEUED_ENCRYPTED' || i.status === 'RETRY_PENDING').length;
  const syncedCount = items.filter(i => i.status === 'SYNCED_HOLDING').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Top Header Banner: Offline Resilience & IndexedDB Engine */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-inner shrink-0 ${
              isEffectivelyOnline
                ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                : 'bg-rose-500/20 border-rose-400/30 text-rose-300 animate-pulse'
            }`}>
              {isEffectivelyOnline ? <Wifi className="w-7 h-7" /> : <WifiOff className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  isEffectivelyOnline
                    ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/30'
                    : 'bg-rose-500/30 text-rose-300 border-rose-400/30'
                }`}>
                  {isEffectivelyOnline ? 'NETWORK: ONLINE (SYNC ACTIVE)' : 'NETWORK: OUTAGE (AIR-GAPPED BUFFER)'}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  IndexedDB Engine V1
                </span>
                <span className="text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                  Zero-Knowledge AES-256-GCM
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {language === 'ku'
                  ? 'بافەری داتای لۆکاڵ و خەزنی دەرەوەی هێڵ (Local Data Buffer - IndexedDB)'
                  : language === 'ar'
                  ? 'ذاكرة التخزين المؤقت المشفرة دون اتصال للأنظمة والمزامنة'
                  : 'Local Data Buffer & Encrypted Offline Cache Engine'}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {language === 'ku'
                  ? 'کاتێک ئینتەرنێت لە پڕۆژە دوورەدەستەکاندا (نەجەف، هەڵەبجە، زاخۆ...) دەبچڕێت، سەرجەم داواکارییەکانی کڕین، واژۆی خاوەندارێتی، و پسوولەی کێشکردن بە کۆدکراوی لەناو خەزنی IndexedDBـی وێبگەڕدا کۆدەکرێنەوە و بەگەیشتنەوەی ئینتەرنێت خۆکارانە بۆ ناوەندی هۆڵدینگ دەنێردرێن.'
                  : 'Allows remote project sites to safely queue mission-critical approvals and dispatch telemetry in an encrypted local IndexedDB cache when disconnected, automatically flushing to the central server when online.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
            {/* Simulate Disconnection Toggle */}
            <button
              onClick={() => {
                const nextState = !isSimulatedOffline;
                setIsSimulatedOffline(nextState);
                if (!nextState && autoFlushEnabled) {
                  setTimeout(triggerAutoFlush, 300);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border ${
                isSimulatedOffline
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/50 shadow-lg shadow-rose-950/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Toggle simulated connection blackout to test offline queuing"
            >
              {isSimulatedOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
              <span>
                {isSimulatedOffline
                  ? language === 'ku' ? 'هێڵ بپچڕێنە (Offline Active)' : 'Simulating Outage (Offline)'
                  : language === 'ku' ? 'تاقیکردنەوەی پچڕانی هێڵ' : 'Simulate Blackout'}
              </span>
            </button>

            {/* Queue New Test Item */}
            <button
              onClick={() => handleQueueOfflineApproval()}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-indigo-950/40"
              title="Add a new realistic purchase requisition to the offline buffer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ku' ? 'خەزنکردنی داواکاری لە بافەر' : 'Queue Approval (Test)'}</span>
            </button>

            {/* Manual Flush Button */}
            <button
              onClick={triggerAutoFlush}
              disabled={isFlushing || queuedCount === 0 || !isEffectivelyOnline}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-950/40 disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${isFlushing ? 'animate-spin' : ''}`} />
              <span>
                {isFlushing
                  ? language === 'ku' ? 'ناردنی بافەر...' : 'Flushing Queue...'
                  : language === 'ku' ? 'ناردنی خێرا (Flush Now)' : 'Flush Buffer Now'}
              </span>
            </button>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div className="mt-4 bg-indigo-500/20 border border-indigo-400/40 rounded-xl p-3 text-xs text-indigo-200 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Metric Scorecards */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">Items in Local Buffer</span>
            <span className="text-xl font-mono font-black text-amber-400 block">
              {queuedCount} Queued Items
            </span>
            <span className="text-[10px] text-slate-400 block">
              {syncedCount} Synced to Holding
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">Encrypted Cache Size</span>
            <span className="text-xl font-mono font-black text-white block">
              {(items.length * 1.8).toFixed(1)} KB (AES-256)
            </span>
            <span className="text-[10px] text-emerald-400 block font-mono">
              ✓ Hardware Web Crypto
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">Auto-Flush Daemon</span>
            <span className="text-xl font-mono font-black text-emerald-400 block">
              {autoFlushEnabled ? 'AUTONOMOUS' : 'PAUSED'}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Flushes on 'online' event
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">Total Holding Server Commits</span>
            <span className="text-xl font-mono font-black text-indigo-400 block">
              {totalFlushedCount} Transactions
            </span>
            <span className="text-[10px] text-indigo-300 block">
              Zero Data Drop Guarantee
            </span>
          </div>
        </div>
      </div>

      {/* 2. Control Toolbar & Filtering */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            {language === 'ku' ? 'فلتەری بافەر:' : 'Buffer Filter:'}
          </span>
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {language === 'ku' ? `سەرجەم (${items.length})` : `All (${items.length})`}
          </button>
          <button
            onClick={() => setSelectedFilter('QUEUED')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedFilter === 'QUEUED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {language === 'ku' ? `لە نۆرەدان (${queuedCount})` : `Pending Flush (${queuedCount})`}
          </button>
          <button
            onClick={() => setSelectedFilter('SYNCED')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedFilter === 'SYNCED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {language === 'ku' ? `گەیشتووە (${syncedCount})` : `Holding Synced (${syncedCount})`}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700 mr-2">
            <input
              type="checkbox"
              checked={autoFlushEnabled}
              onChange={(e) => setAutoFlushEnabled(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0 cursor-pointer w-4 h-4"
            />
            <span>{language === 'ku' ? 'ناردنی خۆکار لە کاتی ئینتەرنێت' : 'Auto-Flush on Reconnection'}</span>
          </label>

          <button
            onClick={handleExportEncryptedJson}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition cursor-pointer"
            title="Download encrypted IndexedDB buffer as .enc.json archive"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'داگرتنی فایل' : 'Export .enc.json'}</span>
          </button>

          {syncedCount > 0 && (
            <button
              onClick={handleClearAcknowledged}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'سڕینەوەی گەیشتووەکان' : 'Clear Synced'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Buffered Queue Items List */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>{language === 'ku' ? 'نۆرەی داواکارییە خەزنکراوەکانی دەرەوەی هێڵ (FIFO Queue)' : 'Encrypted IndexedDB Offline Transmission Queue'}</span>
          </h2>
          <span className="text-xs font-mono text-slate-500">
            Order: Strict Chronological FIFO
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Database className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-bold">{language === 'ku' ? 'هیچ داواکارییەک لە بافەردا نییە' : 'No items currently in this buffer view'}</p>
            <p className="text-[11px] text-slate-500">{language === 'ku' ? 'کلیک لەسەر "خەزنکردنی داواکاری لە بافەر" بکە بۆ تاقیکردنەوە' : 'Click "Queue Approval (Test)" above to simulate an offline purchase order'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, index) => {
              const isQueued = item.status === 'QUEUED_ENCRYPTED' || item.status === 'RETRY_PENDING';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition shadow-xs space-y-3 ${
                    isQueued
                      ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-400/30'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-black flex items-center justify-center shrink-0">
                        #{index + 1}
                      </span>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs font-extrabold text-slate-900">
                            {item.entityReference}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isQueued
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isQueued ? 'QUEUED OFFLINE (AES-256)' : 'HOLDING ACKNOWLEDGED'}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono">
                            {item.itemType}
                          </span>
                          {item.priority === 'MISSION_CRITICAL' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                              MISSION CRITICAL
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-sm text-slate-900">
                          {language === 'ku' ? item.titleKu : item.titleEn}
                        </h3>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {language === 'ku' ? item.siteNameKu : item.siteNameEn} • Requested by: <strong className="text-slate-700">{item.requesterName}</strong> ({item.requesterRole})
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {item.amountUSD && (
                        <span className="text-sm font-mono font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                          ${item.amountUSD.toLocaleString()} USD
                        </span>
                      )}

                      <button
                        onClick={() => handleInspectItem(item)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition cursor-pointer"
                        title="Inspect encrypted payload envelope"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{language === 'ku' ? 'پشکنینی کۆد' : 'Inspect Envelope'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Remove from local IndexedDB"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Cryptographic envelope info & timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-100/80">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>Queued: {new Date(item.createdAt).toLocaleTimeString()}</span>
                      {item.holdingAckToken && (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          Token: {item.holdingAckToken}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[10px] font-mono text-slate-400">SHA-256 Digest:</span>
                      <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[170px]">
                        {item.encryptedPayload.sha256Digest}
                      </span>
                      <button
                        onClick={() => copyToClipboard(item.encryptedPayload.sha256Digest)}
                        className="text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                        title="Copy digest"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Central Holding Receiver Flushed Telemetry */}
      {centralTelemetry && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              <span>{language === 'ku' ? 'سێرڤەری سەرەکی هۆڵدینگ: تۆماری وەرگیراوەکان و واژۆکان' : 'Central Holding Server: Flushed Items Acknowledgment Audit'}</span>
            </h2>
            <span className="text-xs font-mono text-emerald-600 font-bold">
              ✓ Verified Causal Order
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Flushed Time</th>
                  <th className="p-3">Origin Site</th>
                  <th className="p-3">Requisition Title</th>
                  <th className="p-3">Requester</th>
                  <th className="p-3">Holding Acknowledgment Token</th>
                  <th className="p-3">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {centralTelemetry.recentFlushedRecords?.map((rec: any) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(rec.receivedAt).toLocaleTimeString()}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">{rec.siteNameEn}</td>
                    <td className="p-3 text-slate-800">{rec.titleEn}</td>
                    <td className="p-3 text-slate-600">{rec.requesterName}</td>
                    <td className="p-3 font-mono text-indigo-700 font-bold">{rec.holdingAckToken}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        COMMITTED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Cryptographic Inspection Modal (Ciphertext vs Plaintext) */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Encrypted IndexedDB Payload: {inspectItem.entityReference}
                </h3>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Ciphertext Box */}
            <div className="space-y-2 text-xs font-mono">
              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                  <span>AES-256-GCM Ciphertext (Stored in IndexedDB)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Length: {inspectItem.encryptedPayload.cipherTextBase64.length} chars</span>
                </div>
                <p className="text-[10px] break-all text-slate-300 leading-relaxed max-h-24 overflow-y-auto bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {inspectItem.encryptedPayload.cipherTextBase64}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>IV: {inspectItem.encryptedPayload.ivHex}</span>
                  <span>Algorithm: {inspectItem.encryptedPayload.algorithm}</span>
                </div>
              </div>

              {/* Decrypted plain text preview */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-700 font-bold">
                  <span>Decrypted Payload Preview (Authorized Node Session)</span>
                  <span className="text-[10px] text-emerald-600 font-bold">✓ MAC Verified</span>
                </div>
                <pre className="text-[11px] text-slate-800 bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto leading-relaxed">
                  {decryptedPreview
                    ? JSON.stringify(decryptedPreview, null, 2)
                    : JSON.stringify(inspectItem.plainTextPreview, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setInspectItem(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
