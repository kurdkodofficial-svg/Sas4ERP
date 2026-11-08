import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudLightning,
  Laptop,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Shield,
  Wifi,
  Radio,
  Server,
  ArrowRightLeft,
  X,
  MapPin,
  Lock,
  Building2,
  Sparkles,
  Info,
  Network,
  Activity,
  Globe,
  Shuffle
} from 'lucide-react';
import {
  holdingCloudSyncService,
  HoldingCloudSyncStatus,
  SyncNodeDevice
} from '../../services/holdingCloudSyncService';
import { useERP } from '../../context/ERPContext';

interface HoldingCloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'ku' | 'en' | 'ar';
  holdingName?: string;
  onForceSync?: () => Promise<void>;
}

export const HoldingCloudSyncModal: React.FC<HoldingCloudSyncModalProps> = ({
  isOpen,
  onClose,
  language = 'ku',
  holdingName = 'SAS Holding Group',
  onForceSync
}) => {
  const { companies, projects, currentUser } = useERP();
  const [syncStatus, setSyncStatus] = useState<HoldingCloudSyncStatus>(holdingCloudSyncService.getStatus());
  const [copiedKey, setCopiedKey] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSimulatingIpHop, setIsSimulatingIpHop] = useState(false);
  const [lastIpHopData, setLastIpHopData] = useState<{ newIp?: string; ispName?: string } | null>(null);

  // Profile form state
  const currentProfile = holdingCloudSyncService.getNodeProfile();
  const [nodeName, setNodeName] = useState(currentProfile.nodeName);
  const [location, setLocation] = useState(currentProfile.location);
  const [nodeRole, setNodeRole] = useState(currentProfile.role);

  useEffect(() => {
    const unsub = holdingCloudSyncService.onStatusChange((status) => {
      setSyncStatus(status);
      setKeyInput(status.holdingKey);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const isRtl = language === 'ku' || language === 'ar';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(syncStatus.holdingKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleApplyHoldingKey = async (targetKey: string) => {
    if (!targetKey.trim()) return;
    setIsSyncingLocal(true);
    holdingCloudSyncService.setNodeProfile({ holdingKey: targetKey.trim().toUpperCase() });
    await holdingCloudSyncService.connect();
    setIsEditingKey(false);
    setIsSyncingLocal(false);
    setSuccessMessage(
      language === 'ku'
        ? 'کلیلی هۆڵدینگ نوێکرایەوە و لاپتۆپەکە بەستراوەتەوە!'
        : 'Holding Sync Key updated and laptop paired successfully!'
    );
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleSaveProfile = () => {
    holdingCloudSyncService.setNodeProfile({
      nodeName,
      location,
      role: nodeRole,
    });
    setSuccessMessage(
      language === 'ku'
        ? 'زانیاری ئەم لاپتۆپە بەسەرکەوتوویی نوێکرایەوە'
        : 'This laptop profile was updated successfully'
    );
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleTriggerForceSync = async () => {
    setIsSyncingLocal(true);
    if (onForceSync) {
      await onForceSync();
    } else {
      await holdingCloudSyncService.pullLatestState();
      await holdingCloudSyncService.executePush();
    }
    setIsSyncingLocal(false);
    setSuccessMessage(
      language === 'ku'
        ? 'سینکرۆنایزکردنی داتاکان لەگەڵ هەموو ئۆفیس و پڕۆژەکان کۆتایی هات!'
        : 'Data synchronized with all branch laptops successfully!'
    );
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Presets for various branch locations across Kurdistan & Iraq
  const applyPreset = (name: string, loc: string, role: 'HOLDING_HQ' | 'BRANCH_PROJECT' | 'FIELD_OFFICE' | 'PEER') => {
    setNodeName(name);
    setLocation(loc);
    setNodeRole(role);
    holdingCloudSyncService.setNodeProfile({
      nodeName: name,
      location: loc,
      role
    });
    setSuccessMessage(
      language === 'ku'
        ? `ئەم ئامێرە بەستراوە بە: ${name}`
        : `Device assigned to: ${name}`
    );
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSimulateIpHop = async () => {
    setIsSimulatingIpHop(true);
    try {
      const res = await holdingCloudSyncService.simulateDynamicIpHop();
      if (res.success) {
        setLastIpHopData({ newIp: res.newIp, ispName: res.ispName });
        setSuccessMessage(
          language === 'ku'
            ? `ئایپی گۆڕدرا بۆ ${res.newIp} لەڕێگەی (${res.ispName}) - سینکرۆنایز بەبێ پچڕان بەردەوامە!`
            : `IP dynamically shifted to ${res.newIp} via ${res.ispName} - Sync session remained 100% active!`
        );
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingIpHop(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-8"
      >
        {/* Header with Cloud Gradient */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-5 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner">
              <CloudLightning className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {language === 'ku'
                    ? 'وێستگەی بەستنەوە و سینکرۆنایزی خۆکارانەی کۆمپانیا و پڕۆژەکانی هۆڵدینگ'
                    : language === 'ar'
                    ? 'محطة المزامنة السحابية الفورية لكافة شركات ومشاريع الهولدينغ'
                    : 'Holding Multi-Company & Multi-Project Real-Time Cloud Sync Hub'}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live SSE Hub
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {language === 'ku'
                  ? `هەموو کۆمپانیا، پڕۆژە و عەمبارەکانی سەر بەم هۆڵدینگەیە بە هەمان کلیلی نهێنی خۆکارانە سات بە سات هاوکات دەبن`
                  : `All subsidiary companies and field projects belonging to this holding automatically sync state in real time`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-2.5 flex items-center gap-2 text-emerald-300 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Visual Topology Architecture Diagram */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>{language === 'ku' ? 'تۆڕی بەستنەوەی سەرجەم لق و پڕۆژەکان' : 'Multi-Branch Holding Synchronization Topology'}</span>
              <span className="text-blue-400 text-xs font-mono">{holdingName}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center relative">
              {/* Node 1: Erbil HQ (سەرەوە) */}
              <div className="bg-slate-900/90 rounded-lg p-3 border border-blue-500/30 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50" />
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-white">Erbil Executive HQ</span>
                <span className="text-xs text-blue-300">سەرۆکایەتی هۆڵدینگ (سەرەوە)</span>
                <span className="text-[10px] text-slate-400 mt-1 bg-slate-800 px-2 py-0.5 rounded">
                  چاودێری ٣٦٠ پلە / بڕیار و واژۆی دەسەڵاتی دارایی
                </span>
              </div>

              {/* Central Cloud Gateway */}
              <div className="bg-gradient-to-b from-indigo-950/80 to-slate-900 rounded-lg p-3 border border-indigo-500/40 flex flex-col items-center text-center shadow-lg shadow-indigo-950/40">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1">
                  <Cloud className="w-5 h-5 animate-bounce" />
                </div>
                <span className="font-bold text-xs text-indigo-200">SAS Holding Cloud Hub</span>
                <span className="text-[11px] text-slate-300 font-mono mt-0.5">
                  v{syncStatus.version} • {syncStatus.activeLaptops.length} Laptops Active
                </span>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-400">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Real-time Zero-Latency SSE</span>
                </div>
              </div>

              {/* Node 2: Subsidiaries & Field Projects (خوارەوە) */}
              <div className="bg-slate-900/90 rounded-lg p-3 border border-purple-500/30 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50" />
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                  <Laptop className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-white">Subsidiaries & Sites</span>
                <span className="text-xs text-purple-300">کۆمپانیا و پڕۆژە مەیدانییەکان (خوارەوە)</span>
                <span className="text-[10px] text-slate-400 mt-1 bg-slate-800 px-2 py-0.5 rounded">
                  {projects.length} پڕۆژە • {companies.length} کۆمپانیا لە هەموو شارەکان
                </span>
              </div>
            </div>

            {/* Information Flow Banner */}
            <div className="mt-3 pt-3 border-t border-slate-700/80 flex items-center gap-2 text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {language === 'ku'
                  ? 'یاسای بەڕێوەبردن: سەرەوە دەسەڵاتی تەواوی بەسەر خوارەوەدا هەیە، خوارەوە زانیاری سەرەوە نابینێت مەگەر بەدواداچوونی داواکارییەکان بێت (گەیشتۆتە لای کێ و کێ ماوە واژووی بکات).'
                  : 'Hierarchy Rule: Upper management has complete oversight; subordinates are partitioned and only track their submitted requisitions.'}
              </span>
            </div>
          </div>

          {/* Holding Sync Key Display & Pairing */}
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  {language === 'ku' ? 'کلیلی هاوبەشی هۆڵدینگ (Holding Sync Key)' : 'Shared Holding Sync Key'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'ku'
                    ? 'ئەم کلیلە لەسەر لاپتۆپی هەڵەبجە یان هەر شارێکی تر دابنێ بۆ ئەوەی دەستبەجێ بە یەک هۆڵدینگ ببەسترێنەوە'
                    : 'Paste this key on the Halabja laptop to immediately join this Holding network'}
                </p>
              </div>

              {!isEditingKey ? (
                <button
                  onClick={() => {
                    setIsEditingKey(true);
                    setKeyInput(syncStatus.holdingKey);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 underline self-start sm:self-auto"
                >
                  {language === 'ku' ? 'گۆڕین یان پەیوەستبوون بە کلیلێکی تر' : 'Change or Enter Sister Key'}
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingKey(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {language === 'ku' ? 'پەشیمانبوونەوە' : 'Cancel'}
                </button>
              )}
            </div>

            {!isEditingKey ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-2.5">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono text-sm tracking-wider font-semibold text-emerald-400 flex-1 select-all">
                  {syncStatus.holdingKey}
                </span>
                <button
                  onClick={handleCopyKey}
                  className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition border border-slate-700"
                  title="Copy Key"
                >
                  {copiedKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{language === 'ku' ? 'کۆپیکرا' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{language === 'ku' ? 'کۆپیکردن' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="e.g. HLD-KEY-2026-HQ-ERBIL"
                  className="w-full bg-slate-900 border border-blue-500/50 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleApplyHoldingKey(keyInput)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs whitespace-nowrap transition"
                >
                  {language === 'ku' ? 'پەیوەستکردنی ئەم لاپتۆپە' : 'Pair Laptop with Key'}
                </button>
              </div>
            )}

            {/* Quick Demo Location Toggles for All Holding Branches */}
            <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {language === 'ku' ? 'دیاریکردنی خێرای لقی ئەم لاپتۆپە:' : 'Quick Branch Assignment:'}
              </span>
              <button
                onClick={() => applyPreset('Erbil Executive HQ (سەرۆکایەتی هۆڵدینگ - هەولێر)', 'Erbil - World Trade Center Floor 14', 'HOLDING_HQ')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-blue-900/40 text-blue-300 text-xs border border-slate-700 hover:border-blue-500/40 transition"
              >
                🏢 {language === 'ku' ? 'هەولێر (سەرۆکایەتی هۆڵدینگ)' : 'Erbil HQ Hub'}
              </button>
              <button
                onClick={() => applyPreset('Halabja Branch Office & Field Project (ئۆفیسی پڕۆژەی هەڵەبجە)', 'Halabja - Industrial Zone', 'BRANCH_PROJECT')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-purple-900/40 text-purple-300 text-xs border border-slate-700 hover:border-purple-500/40 transition"
              >
                🏭 {language === 'ku' ? 'هەڵەبجە (پڕۆژەی بیناسازی)' : 'Halabja Site'}
              </button>
              <button
                onClick={() => applyPreset('Sulaymaniyah Energy Subsidiary (کۆمپانیای وزە - سلێمانی)', 'Sulaymaniyah - Salim St Hub', 'BRANCH_PROJECT')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-900/40 text-emerald-300 text-xs border border-slate-700 hover:border-emerald-500/40 transition"
              >
                ⛽ {language === 'ku' ? 'سلێمانی (کۆمپانیای وزە)' : 'Sulaymaniyah Energy'}
              </button>
              <button
                onClick={() => applyPreset('Duhok Concrete & Steel Plant (کارگەی کۆنکرێت - دهۆک)', 'Duhok - Industrial Area', 'FIELD_OFFICE')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-900/40 text-amber-300 text-xs border border-slate-700 hover:border-amber-500/40 transition"
              >
                🏗️ {language === 'ku' ? 'دهۆک (کارگەی بەرهەمهێنان)' : 'Duhok Plant'}
              </button>
              <button
                onClick={() => applyPreset('Zakho Logistics & Gate Terminal (دەروازەی زاخۆ)', 'Zakho Border Gate', 'FIELD_OFFICE')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-900/40 text-rose-300 text-xs border border-slate-700 hover:border-rose-500/40 transition"
              >
                🚚 {language === 'ku' ? 'زاخۆ (دەروازەی بار)' : 'Zakho Gate'}
              </button>
              <button
                onClick={() => applyPreset('Baghdad Commercial Branch (لقی بازرگانی بەغدا)', 'Baghdad - Al-Mansour Hub', 'BRANCH_PROJECT')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-900/40 text-cyan-300 text-xs border border-slate-700 hover:border-cyan-500/40 transition"
              >
                🏢 {language === 'ku' ? 'بەغدا (لقی بازرگانی)' : 'Baghdad Branch'}
              </button>
              <button
                onClick={() => applyPreset('Najaf Cement Manufacturing Plant (کارگەی چیمەنتۆی نەجەف)', 'Najaf - Industrial City & Quarry Zone', 'BRANCH_PROJECT')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-950/60 text-emerald-300 text-xs border border-slate-700 hover:border-emerald-500/50 transition font-bold"
              >
                🏭 {language === 'ku' ? 'نەجەف (کارگەی چیمەنتۆ)' : 'Najaf Cement Plant'}
              </button>
            </div>
          </div>

          {/* Current Laptop Profile Settings */}
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/80">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-blue-400" />
              {language === 'ku' ? 'ناسنامەی ئەم لاپتۆپە لە تۆڕی هۆڵدینگ' : 'Current Laptop Node Profile'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {language === 'ku' ? 'ناوی لاپتۆپ / ئۆفیس' : 'Laptop / Node Name'}
                </label>
                <input
                  type="text"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {language === 'ku' ? 'شوێنی جوگرافی (شار / پڕۆژە)' : 'Location / Branch'}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Halabja, Erbil, Sulaymaniyah"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {language === 'ku' ? 'ڕۆڵی کارگێڕی' : 'Operational Role'}
                </label>
                <select
                  value={nodeRole}
                  onChange={(e) => setNodeRole(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="HOLDING_HQ">Holding HQ (سەرۆکایەتی هۆڵدینگ - هەولێر)</option>
                  <option value="BRANCH_PROJECT">Branch / Project (پڕۆژەی ناوچەیی - هەڵەبجە)</option>
                  <option value="FIELD_OFFICE">Field Site Office (کەمپ یان دەروازە)</option>
                  <option value="PEER">Peer Terminal (ئامێری کارمەند)</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-medium text-white rounded-lg transition"
              >
                {language === 'ku' ? 'پاشەکەوتکردنی ناسنامە' : 'Save Profile'}
              </button>
            </div>
          </div>

          {/* Dynamic IP & Kurdistan/Iraq Network Resilience Shield */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-xl p-5 border border-indigo-500/30 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                  <Network className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {language === 'ku'
                        ? 'تۆڕی پارێزراو لە بەرامبەر گۆڕانی ئایپی (Dynamic IP & CGNAT Resilient)'
                        : 'Dynamic IP & CGNAT Roaming Resilience Engine'}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      100% Anti-Disconnect
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {language === 'ku'
                      ? 'تەنانەت ئەگەر ئایپی لە نەجەف، هەڵەبجە یان هەولێر بە هۆی Fastlink, Korek, Asiacell یان Fiber بگۆڕێت، سینکرۆنایز هەرگیز ناپچڕێت'
                      : 'Nodes are identified by cryptographically bound UUIDs and Holding Keys, ensuring zero disconnection during ISP IP rotations.'}
                  </p>
                </div>
              </div>

              {/* Simulation button */}
              <button
                onClick={handleSimulateIpHop}
                disabled={isSimulatingIpHop}
                className="px-3.5 py-2 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition border border-indigo-400/40 shadow-md hover:shadow-indigo-500/20 disabled:opacity-50 shrink-0"
              >
                <Shuffle className={`w-3.5 h-3.5 ${isSimulatingIpHop ? 'animate-spin' : ''}`} />
                <span>
                  {isSimulatingIpHop
                    ? language === 'ku'
                      ? 'گۆڕانی ئایپی تاقی دەکرێتەوە...'
                      : 'Switching IP...'
                    : language === 'ku'
                    ? 'تاقیکردنەوەی گۆڕانی ئایپی (Simulate IP Hop)'
                    : 'Simulate Dynamic IP Hop'}
                </span>
              </button>
            </div>

            {/* 3 Metric cards for Dynamic IP telemetry */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/80">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  {language === 'ku' ? 'ئایپی دەستنیشانکراوی ئێستا' : 'Detected Active IP'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-sm font-bold text-white">
                    {syncStatus.currentIp || '127.0.0.1'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    (Live Dynamic)
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/80">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'ku' ? 'گۆڕانی ئایپی بێ پچڕان' : 'Seamless IP Migrations'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-sm font-bold text-emerald-300">
                    {syncStatus.ipChangesCount || 0}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {language === 'ku' ? 'جار گۆڕانی تێپەڕاندووە' : 'Hops handled without drop'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/80">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  {language === 'ku' ? 'پڕۆتۆکۆڵی پەیوەستبوون' : 'Network Roaming Protocol'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs font-semibold text-amber-300">
                    SAS-IP-ROAM-V2
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    Auto-Recover (500ms)
                  </span>
                </div>
              </div>
            </div>

            {/* IP Hop result notification banner */}
            {lastIpHopData && (
              <div className="mt-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg px-3 py-2 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {language === 'ku'
                    ? `ئایپی گۆڕدرا بۆ [${lastIpHopData.newIp}] لەڕێگەی هێڵی (${lastIpHopData.ispName}). بەستنەوەی سەرجەم لاپتۆپ و لقەکان بە بێ هیچ کەموکوڕییەک ١٠٠٪ بەردەوامە.`
                    : `IP roamed to [${lastIpHopData.newIp}] via (${lastIpHopData.ispName}). All holding branches remained 100% synchronized.`}
                </span>
              </div>
            )}
          </div>

          {/* Active Connected Laptops List */}
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                {language === 'ku' ? 'لاپتۆپە چالاکەکانی سەر بەم هۆڵدینگەیە' : 'Active Laptops in this Holding'}
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                  {syncStatus.activeLaptops.length} online
                </span>
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>
                  {language === 'ku' ? 'دواین نوێبوونەوە:' : 'Last update:'}{' '}
                  {syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {syncStatus.activeLaptops.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  {language === 'ku'
                    ? 'هیچ لاپتۆپێکی تر دیار نییە، چاوەڕوانی پەیوەستبوونی لاپتۆپی هەڵەبجە یان هەولێر بە کلیلی هاوبەش دەکرێت...'
                    : 'No peer laptops connected yet. Waiting for other branch laptops to join with this key...'}
                </div>
              ) : (
                syncStatus.activeLaptops.map((lap) => (
                  <div
                    key={lap.nodeId}
                    className={`flex items-center justify-between p-3 rounded-lg border transition ${
                      lap.isCurrentDevice
                        ? 'bg-blue-950/30 border-blue-500/40 text-blue-100'
                        : 'bg-slate-900/60 border-slate-700/80 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          lap.isCurrentDevice
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{lap.nodeName}</span>
                          {lap.isCurrentDevice && (
                            <span className="text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/40">
                              {language === 'ku' ? 'ئەم لاپتۆپەی ئێستا' : 'This Laptop'}
                            </span>
                          )}
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30 font-mono">
                            IP: {lap.ipAddress || 'Dynamic'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{lap.location}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-500">
                            {lap.role === 'HOLDING_HQ'
                              ? 'Erbil HQ Hub'
                              : lap.role === 'BRANCH_PROJECT'
                              ? 'Branch Project Node'
                              : 'Field Terminal'}
                          </span>
                          {(lap.ipChangesCount && lap.ipChangesCount > 0) ? (
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 rounded">
                              ✓ {lap.ipChangesCount}x IP Hops OK
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-[11px] text-slate-400">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Online
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(lap.lastPing).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Explanation Box on How Erbil & Halabja Sync Works */}
          <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3 text-blue-200 text-xs leading-relaxed">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-1">
                {language === 'ku'
                  ? 'چۆن سیستەم لە هەولێر و هەڵەبجە خۆکارانە سینکرۆنایز دەبێت؟'
                  : 'How does real-time synchronization between Erbil HQ and Halabja work?'}
              </span>
              <p>
                {language === 'ku'
                  ? 'کاتێک لە پڕۆژەی هەڵەبجە داواکاری کڕین (PO)، پسوولەی دەروازە، خەرجی، یان فاکتۆری دوولایەنە تۆمار دەکرێت، دەستبەجێ بە کەمتر لە ٠.٥ چرکە لە ڕێگەی گەیاندنی سێرڤەری هۆڵدینگ لە چارت و داشبۆردی خاوەنی هۆڵدینگ لە هەولێر دەردەکەوێت. کاتێکیش خاوەنی هۆڵدینگ لە هەولێر ڕەزامەندی دەدات یان کۆمپانیایەک زیاد دەکات، لاپتۆپەکەی هەڵەبجە بەبێ دەستێوەردان پەڕەکەی نوێ دەبێتەوە.'
                  : 'Whenever an invoice, gate log, or PO is recorded in Halabja, it streams instantaneously via SSE to the Erbil HQ executive dashboard. Conversely, when the Chairman signs or updates budgets in Erbil, the Halabja branch reflects the change automatically.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-900 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              {language === 'ku' ? 'دۆخی بەستنەوە:' : 'Status:'}{' '}
              <strong className="text-white font-mono">{syncStatus.connectionMode}</strong>
            </span>
            <span>•</span>
            <span>Version: <strong className="text-emerald-400 font-mono">v{syncStatus.version}</strong></span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleTriggerForceSync}
              disabled={isSyncingLocal}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLocal ? 'animate-spin' : ''}`} />
              <span>
                {isSyncingLocal
                  ? language === 'ku'
                    ? 'سینکرۆنایز دەکرێت...'
                    : 'Syncing...'
                  : language === 'ku'
                  ? 'سینکرۆنایزکردنی ئێستا (Force Sync)'
                  : 'Force Sync Now'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
            >
              {language === 'ku' ? 'داخستن' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
