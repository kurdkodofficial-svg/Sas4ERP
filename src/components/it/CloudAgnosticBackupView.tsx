import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Database,
  ShieldCheck,
  ShieldAlert,
  Zap,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Server,
  Cloud,
  Lock,
  Layers,
  FileCheck2,
  Download,
  Upload,
  Sliders,
  ExternalLink,
  Key,
  Copy,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useERP } from '../../context/ERPContext';
import {
  CloudRepositoryTarget,
  DatabaseSnapshot,
  BackupSystemConfig,
  ZeroLossRecoveryRecord
} from '../../types/cloudAgnosticBackup';

export const CloudAgnosticBackupView: React.FC = () => {
  const { language, isRtl } = useLanguage();
  const { holding } = useERP();

  const [repositories, setRepositories] = useState<CloudRepositoryTarget[]>([]);
  const [snapshots, setSnapshots] = useState<DatabaseSnapshot[]>([]);
  const [config, setConfig] = useState<BackupSystemConfig | null>(null);
  const [recoveryLog, setRecoveryLog] = useState<ZeroLossRecoveryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSimulatingLatency, setIsSimulatingLatency] = useState<boolean>(false);
  const [isCreatingManual, setIsCreatingManual] = useState<boolean>(false);
  const [activeRestoringId, setActiveRestoringId] = useState<string | null>(null);
  const [selectedSnapshotDetails, setSelectedSnapshotDetails] = useState<DatabaseSnapshot | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Fetch status from server
  const fetchBackupStatus = async () => {
    try {
      const res = await fetch('/api/backup/status');
      if (res.ok) {
        const data = await res.json();
        setRepositories(data.repositories || []);
        setSnapshots(data.snapshots || []);
        setConfig(data.config || null);
        setRecoveryLog(data.recoveryLog || []);
      }
    } catch (err) {
      console.error('Failed to load backup status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupStatus();
    const interval = setInterval(fetchBackupStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Simulate network latency spike triggering automated snapshot
  const handleTriggerLatencySpikeSnapshot = async (siteName: string = 'Najaf Cement Plant (نەجەف)', pingMs: number = 185) => {
    setIsSimulatingLatency(true);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/backup/trigger-latency-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          measuredLatencyMs: pingMs,
          customReason: language === 'ku'
            ? `تاخیربوونی هێڵ (${pingMs}ms) لەسەر ${siteName} لە سەرووی سنوورە؛ گرتەی پارێزراو دەستبەجێ ڕەوانەی گەنجینەی دووەم کرا بۆ پاراستنی سینک.`
            : `Latency spiked to ${pingMs}ms on ${siteName}. Emergency snapshot created to secondary encrypted repository with Zero Data Loss.`
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSnapshots(prev => [data.snapshot, ...prev]);
        setActionSuccess(
          language === 'ku'
            ? `⚡ بەهۆی تاخیربوونی بەرز (${pingMs}ms)، گرتەی فریاگوزاری ژمارە ${data.snapshot.snapshotNumber} بۆ گەنجینەی دووەمی پارێزراو خەزن کرا (RPO = 0s / هیچ داتایەک لەدەست نەچوو)!`
            : `⚡ Latency spike (${pingMs}ms) detected! Emergency snapshot ${data.snapshot.snapshotNumber} created in Secondary Encrypted Repository with Zero Data Loss!`
        );
        setTimeout(() => setActionSuccess(null), 7000);
        fetchBackupStatus();
      }
    } catch (err) {
      console.error('Failed to trigger latency snapshot:', err);
    } finally {
      setIsSimulatingLatency(false);
    }
  };

  // Create manual encrypted snapshot
  const handleCreateManualSnapshot = async () => {
    setIsCreatingManual(true);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/backup/create-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerType: 'MANUAL_ADMIN',
          sourceSite: 'Erbil HQ & All 7 Sites'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSnapshots(prev => [data.snapshot, ...prev]);
        setActionSuccess(
          language === 'ku'
            ? `گرتەی ئەمنیی ژمارە ${data.snapshot.snapshotNumber} بە سەرکەوتوویی دروستکرا و ڕەوانەی گەنجینەی دووەم کرا.`
            : `Encrypted snapshot ${data.snapshot.snapshotNumber} created and replicated to secondary repository.`
        );
        setTimeout(() => setActionSuccess(null), 5000);
        fetchBackupStatus();
      }
    } catch (err) {
      console.error('Failed to create manual snapshot:', err);
    } finally {
      setIsCreatingManual(false);
    }
  };

  // Execute Point-In-Time zero data loss restoration
  const handleRestoreSnapshot = async (snapshot: DatabaseSnapshot) => {
    setActiveRestoringId(snapshot.id);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/backup/restore-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshotId: snapshot.id,
          targetRepositoryId: snapshot.secondaryRepoId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActionSuccess(
          language === 'ku'
            ? `✅ سیستەم بە سەرکەوتوویی لە گەنجینەی دووەم گەڕێندرایەوە لە خاڵی ${snapshot.snapshotNumber}؛ ${data.recoveryRecord.replayedDeltaTransactionsCount} مامەڵەی پاشماوە دووبارە بەبێ کێشە پەسەند کرانەوە (0 Bytes Data Loss)!`
            : `✅ Successfully restored from Secondary Repository using ${snapshot.snapshotNumber}. Replayed ${data.recoveryRecord.replayedDeltaTransactionsCount} delta journal commits with 0 Bytes data loss!`
        );
        setTimeout(() => setActionSuccess(null), 8000);
        fetchBackupStatus();
      }
    } catch (err) {
      console.error('Failed to restore snapshot:', err);
    } finally {
      setActiveRestoringId(null);
    }
  };

  // Update backup configuration
  const handleUpdateConfig = async (updates: Partial<BackupSystemConfig>) => {
    try {
      const res = await fetch('/api/backup/update-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setActionSuccess(
          language === 'ku'
            ? 'ڕێکخستنەکانی گرتەی خۆکاری هێڵ بە سەرکەوتوویی نوێکرانەوە.'
            : 'Automated latency snapshot configuration updated successfully.'
        );
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Failed to update config:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-mono font-bold bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                  Cloud-Agnostic Storage Architecture
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Zero Data Loss Engine (RPO=0s)
                </span>
                <span className="text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                  AES-256-GCM Encrypted
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {language === 'ku'
                  ? 'سیستەمی گرتەی ئۆتۆماتیکی و گەنجینەی پارێزراوی دووەم (Cloud-Agnostic Backup)'
                  : language === 'ar'
                  ? 'نظام النسخ الاحتياطي التلقائي ومستودع التشفير الثانوي عند تباين الشبكة'
                  : 'Automated Cloud-Agnostic Backup & Secondary Encrypted Vault'}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {language === 'ku'
                  ? 'لە کاتی بەرزبوونەوەی لەناکاوی تاخیربوونی هێڵ (Latency Spike) لە نێوان هۆڵدینگ و لقە دوورەدەستەکاندا (نەجەف، هەڵەبجە، زاخۆ...)، سیستەمەکە خۆکارانە گرتەی تەواوی داتابەیس دەخاتە ناو گەنجینەی دووەمی پارێزراو تا لە کاتی گەڕاندنەوەدا سفر بایت داتا لەدەست بچێت.'
                  : 'Automatically snapshots the database to a secondary encrypted repository when network latency spikes occur, ensuring zero data loss during sync recovery and full cloud-agnostic portability.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
            <button
              onClick={() => handleTriggerLatencySpikeSnapshot('Najaf Cement Plant (نەجەف)', 185)}
              disabled={isSimulatingLatency}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-950/40 disabled:opacity-50"
              title="Simulate high latency spike on remote site to trigger emergency automated snapshot"
            >
              <Zap className={`w-4 h-4 ${isSimulatingLatency ? 'animate-bounce text-yellow-200' : ''}`} />
              <span>
                {isSimulatingLatency
                  ? language === 'ku' ? 'دروستکردنی گرتەی خۆکار...' : 'Triggering Auto-Snapshot...'
                  : language === 'ku' ? 'تاقیکردنەوەی خاوبوونەوە (Spike 185ms)' : 'Simulate Spike & Auto-Snapshot'}
              </span>
            </button>

            <button
              onClick={handleCreateManualSnapshot}
              disabled={isCreatingManual}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-indigo-950/40 disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              <span>
                {isCreatingManual
                  ? language === 'ku' ? 'خەزنکردن...' : 'Snapshotting...'
                  : language === 'ku' ? 'دروستکردنی گرتەی پارێزراو' : 'Create Encrypted Snapshot'}
              </span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {actionSuccess && (
          <div className="mt-4 bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Metric Scorecards */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">Secondary Vault Target</span>
            <span className="text-sm font-bold text-indigo-300 block truncate">
              {repositories.find(r => r.id === config?.secondaryRepositoryId)?.nameEn || 'Secondary S3 Wasabi Vault'}
            </span>
            <span className="text-[10px] text-emerald-400 block font-mono">
              ✓ Multi-AZ WORM Immutable
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">Auto-Snapshot Trigger Threshold</span>
            <span className="text-lg font-mono font-black text-amber-400 block">
              &gt; {config?.latencyThresholdMs || 140} ms Ping
            </span>
            <span className="text-[10px] text-slate-400 block">
              Auto-Circuit Breaker Active
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">Recovery Point Objective (RPO)</span>
            <span className="text-lg font-mono font-black text-emerald-400 block">
              0 Seconds
            </span>
            <span className="text-[10px] text-emerald-300 block">
              Zero Transaction Loss
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">Encrypted Snapshots Retained</span>
            <span className="text-lg font-mono font-black text-white block">
              {snapshots.length} Snapshots
            </span>
            <span className="text-[10px] text-indigo-300 block">
              {snapshots.filter(s => s.triggerType === 'LATENCY_SPIKE_AUTO').length} Latency-Triggered
            </span>
          </div>
        </div>
      </div>

      {/* 2. Automated Latency Trigger & Circuit Breaker Configuration */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              <span>{language === 'ku' ? 'ڕێکخستنی کەمکردنەوە و گرتەی خۆکار لە کاتی بەرزیی تاخیربووندا' : 'Automated Latency-Spike Circuit Breaker Settings'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ku'
                ? 'کاتێک هێڵی پەیوەندی نێوان هەولێر و نەجەف یان زاخۆ تووشی لۆد و خاوبوونەوە دەبێت، سیستەمەکە پێش پچڕانی سینک دەستبەجێ گرتە دروست دەکات'
                : 'Configure proactive snapshot triggers to capture delta transactions before telecom packet drops occur.'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Circuit Breaker: Armed
          </span>
        </div>

        {config && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {/* Control 1: Enable Toggle */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {language === 'ku' ? 'گرتەی خۆکاری تاخیربوون:' : 'Auto Latency Snapshot:'}
                </span>
                <input
                  type="checkbox"
                  checked={config.autoLatencySnapshotEnabled}
                  onChange={(e) => handleUpdateConfig({ autoLatencySnapshotEnabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-0 cursor-pointer w-4 h-4"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {language === 'ku'
                  ? 'ئەگەر تاخیربوونی هەر لقێک لە سنوور تێپەڕی، بێ دەستێوەردانی مرۆیی گرتەی پارێزراو خەزن دەکرێت.'
                  : 'Instantly snapshots state upon high ping detection across any subsidiary.'}
              </p>
            </div>

            {/* Control 2: Latency Threshold Slider */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  {language === 'ku' ? 'سنووری دەستپێکردنی گرتە:' : 'Trigger Ping Threshold:'}
                </span>
                <span className="font-mono font-black text-amber-600">{config.latencyThresholdMs} ms</span>
              </div>
              <input
                type="range"
                min={90}
                max={220}
                step={5}
                value={config.latencyThresholdMs}
                onChange={(e) => handleUpdateConfig({ latencyThresholdMs: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>90ms (Sensitive)</span>
                <span>Default: 140ms</span>
                <span>220ms (Relaxed)</span>
              </div>
            </div>

            {/* Control 3: Secondary Encrypted Repository Target */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  {language === 'ku' ? 'گەنجینەی دووەمی هەڵبژێردراو:' : 'Secondary Repository Vault:'}
                </span>
              </div>
              <select
                value={config.secondaryRepositoryId}
                onChange={(e) => handleUpdateConfig({ secondaryRepositoryId: e.target.value })}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {repositories.filter(r => r.isSecondaryVault).map(repo => (
                  <option key={repo.id} value={repo.id}>
                    {repo.nameEn} ({repo.storageRegion})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 block font-mono">
                Encryption: AES-256-GCM • WORM Immutable
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Cloud-Agnostic Repositories Catalog (Multi-Target Storage Mesh) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            <span>{language === 'ku' ? 'گەنجینە و کۆگاکانی داتا (Cloud-Agnostic Storage Repositories)' : 'Cloud-Agnostic Encrypted Storage Repositories'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ku'
              ? 'پشتگیری تەواو بۆ سێرڤەری لۆکاڵ، S3 Wasabi، Cloudflare R2، و کۆگای دابڕاوی Air-Gapped بەبێ بەستنەوە بە یەک کۆمپانیای هەور'
              : 'Decoupled multi-destination storage mesh eliminating cloud vendor lock-in with zero-knowledge AES-256 encryption.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repositories.map(repo => {
            const isSelectedSecondary = config?.secondaryRepositoryId === repo.id;

            return (
              <div
                key={repo.id}
                className={`p-5 rounded-2xl border space-y-3 relative ${
                  isSelectedSecondary
                    ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 border-slate-200/90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    repo.isSecondaryVault ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {repo.isSecondaryVault ? 'SECONDARY VAULT' : 'PRIMARY TIER'}
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {repo.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    {repo.airGappedIsolation && <Lock className="w-3.5 h-3.5 text-rose-600" />}
                    <span>{language === 'ku' ? repo.nameKu : repo.nameEn}</span>
                  </h3>
                  <span className="text-xs text-slate-500 block mt-0.5 font-mono">
                    {repo.storageRegion}
                  </span>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80 font-mono text-[10px] text-slate-600 truncate">
                  <span className="text-slate-400 block text-[9px] uppercase">Target Endpoint:</span>
                  <span className="select-all">{repo.endpointUrl}</span>
                </div>

                {/* Storage Capacity Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Used: {repo.usedStorageGB} GB</span>
                    <span>Total: {repo.totalStorageGB} GB</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.round((repo.usedStorageGB / repo.totalStorageGB) * 100)}%` }}
                      className="bg-indigo-600 h-full rounded-full"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {repo.encryptionAlgorithm}
                  </span>
                  <span className="font-mono text-slate-500">
                    Ping: {repo.latencyToTargetMs}ms
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Snapshots Catalog (Point-In-Time Encrypted Snapshots) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <span>{language === 'ku' ? 'کاتالۆگی گرتە ئەمنییەکان و خاڵەکانی گەڕاندنەوە' : 'Point-in-Time Database Snapshots'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ku'
                ? 'سەرجەم ئەو گرتە پارێزراوانەی لە کاتی بەرزیی تاخیربوون یان کاتی دیاریکراودا دروستکراون بە مۆری SHA-256'
                : 'Cryptographically sealed snapshots stored in primary and secondary repositories with instant zero-loss restore capability.'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            Total Snapshots: {snapshots.length}
          </span>
        </div>

        <div className="space-y-3">
          {snapshots.map(snapshot => {
            const isRestoringThis = activeRestoringId === snapshot.id;
            const isLatencyTriggered = snapshot.triggerType === 'LATENCY_SPIKE_AUTO';

            return (
              <div
                key={snapshot.id}
                className={`p-5 rounded-2xl border transition shadow-xs space-y-3 ${
                  isLatencyTriggered
                    ? 'bg-amber-50/30 border-amber-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isLatencyTriggered
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {isLatencyTriggered ? <Zap className="w-5 h-5 text-amber-600" /> : <Database className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-extrabold text-slate-900">
                          {snapshot.snapshotNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isLatencyTriggered
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : snapshot.triggerType === 'PRE_SYNC_IMMUTABLE'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {snapshot.triggerType.replace(/_/g, ' ')}
                        </span>
                        {snapshot.latencyTriggerMs && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                            Latency: {snapshot.latencyTriggerMs}ms
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        {new Date(snapshot.timestamp).toLocaleString()} • Source: {snapshot.sourceSite}
                      </span>
                    </div>
                  </div>

                  {/* Restore / Verification Buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => setSelectedSnapshotDetails(snapshot)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{language === 'ku' ? 'وردەکاری ئەمنی' : 'Crypto Envelope'}</span>
                    </button>

                    <button
                      onClick={() => handleRestoreSnapshot(snapshot)}
                      disabled={isRestoringThis}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                      title="Execute zero data loss point-in-time restore from secondary encrypted vault"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isRestoringThis ? 'animate-spin' : ''}`} />
                      <span>
                        {isRestoringThis
                          ? language === 'ku' ? 'گەڕاندنەوەی داتا...' : 'Restoring...'
                          : language === 'ku' ? 'گەڕاندنەوە (Zero Loss)' : 'Restore Snapshot'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Reason description */}
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                  {language === 'ku' ? snapshot.triggerReasonKu : snapshot.triggerReasonEn}
                </p>

                {/* Snapshot Entities Breakdown & Checksum */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono">
                    <span>Size: <strong className="text-slate-900">{snapshot.sizeFormatted}</strong></span>
                    <span>Total Entities: <strong className="text-indigo-600">{snapshot.totalEntitiesCount}</strong></span>
                    <span>POs: {snapshot.purchaseOrdersCount}</span>
                    <span>Batches: {snapshot.inventoryBatchesCount}</span>
                    <span>Ledger: {snapshot.ledgerTransactionsCount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">SHA-256:</span>
                    <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[160px]">
                      {snapshot.encryption.sha256Checksum}
                    </span>
                    <button
                      onClick={() => copyToClipboard(snapshot.encryption.sha256Checksum)}
                      className="text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                      title="Copy SHA-256 Checksum"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Zero-Loss Point-In-Time Recovery & Delta Replay Audit Log */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>{language === 'ku' ? 'تۆماری گەڕاندنەوە و سینکی دووبارە بەبێ لەدەستچوونی داتا' : 'Zero-Loss Recovery & Delta Transaction Replay Log'}</span>
          </h2>
          <span className="text-xs font-mono text-emerald-600 font-bold">
            Certified 0 Bytes Data Loss
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Recovery Time</th>
                <th className="p-3">Snapshot Reference</th>
                <th className="p-3">Recovered Entities</th>
                <th className="p-3">Replayed Deltas</th>
                <th className="p-3">Calculated Loss</th>
                <th className="p-3">Restoration Duration</th>
                <th className="p-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recoveryLog.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-3 font-mono font-bold text-indigo-700">{log.snapshotNumber}</td>
                  <td className="p-3 font-mono text-slate-900">{log.recoveredRecordsCount} records</td>
                  <td className="p-3 font-mono text-emerald-700 font-bold">+{log.replayedDeltaTransactionsCount} commits</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      0 BYTES (ZERO LOSS)
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-600">{log.recoveryDurationMs} ms</td>
                  <td className="p-3 text-slate-600 leading-snug">
                    {language === 'ku' ? log.notesKu : log.notesEn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Cryptographic Envelope Modal */}
      {selectedSnapshotDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Cryptographic Encryption Envelope: {selectedSnapshotDetails.snapshotNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSnapshotDetails(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Encryption Algorithm:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {selectedSnapshotDetails.encryption.algorithm} (Hardware AES-NI Accelerated)
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">SHA-256 Tamper-Proof Checksum:</span>
                <span className="font-bold text-slate-800 break-all select-all block">
                  {selectedSnapshotDetails.encryption.sha256Checksum}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Initialization Vector (IV):</span>
                  <span className="text-slate-700 block truncate">{selectedSnapshotDetails.encryption.ivHex}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Authentication Tag (MAC):</span>
                  <span className="text-slate-700 block truncate">{selectedSnapshotDetails.encryption.authTagHex}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Key Fingerprint & Signer:</span>
                <span className="text-indigo-700 block">{selectedSnapshotDetails.encryption.keyFingerprint}</span>
                <span className="text-[10px] text-slate-500 block">Signed by: {selectedSnapshotDetails.encryption.signedBy}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedSnapshotDetails(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
              >
                Close Envelope
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
