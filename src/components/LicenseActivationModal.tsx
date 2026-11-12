import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Crown,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  Sparkles,
  Lock,
  Unlock,
  Cpu,
  Building2,
  Calendar,
  Gift,
  RefreshCw,
  Clock,
  Printer,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useERP } from '../context/ERPContext';
import {
  SystemLicenseInfo,
  getOrCreateHardwareFingerprint,
  verifyAndApplyLicenseKey,
  getRemainingTrialDays,
  generateClientLicenseKey,
  openLicenseCertificatePrintView,
  GeneratedClientLicenseResult,
  resetTrialTo14Days
} from '../utils/licenseManager';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: SystemLicenseInfo;
  onLicenseUpdated: (updated: SystemLicenseInfo) => void;
  defaultMode?: 'activate' | 'generator';
}

const GENERATED_KEYS_STORAGE_KEY = 'sas4erp_owner_generated_licenses_v1';
const MASTER_PIN_SECRET = '9026'; // Secret master vendor PIN (also accepts 2026)

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({
  isOpen,
  onClose,
  license,
  onLicenseUpdated,
  defaultMode = 'activate'
}) => {
  const { language } = useLanguage();
  const { currentUser, setActiveTab: setERPActiveTab } = useERP();

  // Strict check: Only ME (Platform Creator / Holding Owner / Super Admin) can access Generator & Monthly Subscription Studio
  const isMasterVendorOwner = 
    currentUser.role === 'HOLDING_OWNER' || 
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.email === 'kurdkodofficial@gmail.com' ||
    currentUser.email === 'chairman@holding.com';

  // Master vendor authorization state (Instantly unlocked for Owner, PIN protected for secondary delegates)
  const [isMasterUnlocked, setIsMasterUnlocked] = useState<boolean>(() => {
    if (isMasterVendorOwner) return true;
    try {
      return sessionStorage.getItem('sas4erp_master_owner_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Current active view
  const [activeTab, setActiveTab] = useState<'activate' | 'generator'>(() => {
    if (isMasterVendorOwner && defaultMode === 'generator') return 'generator';
    return 'activate';
  });

  // Master PIN dialog states
  const [showPinDialog, setShowPinDialog] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Activation Tab States (Visible to Clients)
  const [inputKey, setInputKey] = useState<string>('');
  const [holdingName, setHoldingName] = useState<string>(license.licensedToHolding || '');
  const [contactEmail, setContactEmail] = useState<string>(license.licensedToEmail || '');
  const [copiedHw, setCopiedHw] = useState<boolean>(false);
  const [activationResult, setActivationResult] = useState<{ success: boolean; messageKu: string; messageEn: string } | null>(null);

  // Generator Tab States (Vendor Only)
  const [genHoldingName, setGenHoldingName] = useState<string>('');
  const [genClientEmail, setGenClientEmail] = useState<string>('');
  const [genClientHw, setGenClientHw] = useState<string>('');
  const [genTier, setGenTier] = useState<'VIP_OWNER_GIFT' | 'COMMERCIAL_1Y' | 'COMMERCIAL_6M' | 'COMMERCIAL_1M' | 'TRIAL_RESET'>('COMMERCIAL_1M');
  const [generatedResult, setGeneratedResult] = useState<GeneratedClientLicenseResult | null>(null);
  const [dispatchLang, setDispatchLang] = useState<'ku' | 'en' | 'ar'>('ku');
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false);

  // History of generated licenses (Vendor Only)
  const [licenseHistory, setLicenseHistory] = useState<GeneratedClientLicenseResult[]>(() => {
    try {
      const saved = localStorage.getItem(GENERATED_KEYS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Ensure clients NEVER see the generator tab; only Owner/ME can access it
  useEffect(() => {
    if (isOpen) {
      if (!isMasterVendorOwner) {
        setActiveTab('activate');
        setIsMasterUnlocked(false);
      } else {
        setIsMasterUnlocked(true);
        if (defaultMode === 'generator') {
          setActiveTab('generator');
        }
      }
      setShowPinDialog(false);
      setEnteredPin('');
      setPinError(null);
    }
  }, [isOpen, isMasterVendorOwner, defaultMode]);

  useEffect(() => {
    if (licenseHistory.length > 0) {
      try {
        localStorage.setItem(GENERATED_KEYS_STORAGE_KEY, JSON.stringify(licenseHistory));
      } catch {}
    }
  }, [licenseHistory]);

  if (!isOpen) return null;

  const hwFingerprint = getOrCreateHardwareFingerprint();
  const remainingDays = getRemainingTrialDays(license.expiresAt);

  const handleCopyHw = () => {
    navigator.clipboard.writeText(hwFingerprint);
    setCopiedHw(true);
    setTimeout(() => setCopiedHw(false), 2000);
  };

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = verifyAndApplyLicenseKey(inputKey, holdingName, contactEmail);
    setActivationResult(res);
    if (res.success && res.license) {
      onLicenseUpdated(res.license);
      setTimeout(() => {
        setActivationResult(null);
        onClose();
      }, 2500);
    }
  };

  const handleResetTrial = async () => {
    const refreshed = resetTrialTo14Days();
    onLicenseUpdated(refreshed);
    try {
      await fetch('/api/license/reset-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdingName: holdingName || 'SAS Holding Evaluation Client' })
      });
    } catch {}
  };

  // Master PIN Verification
  const handleVerifyMasterPin = () => {
    const pin = enteredPin.trim();
    if (pin === MASTER_PIN_SECRET || pin === '2026') {
      setIsMasterUnlocked(true);
      try {
        sessionStorage.setItem('sas4erp_master_owner_auth', 'true');
      } catch {}
      setShowPinDialog(false);
      setEnteredPin('');
      setPinError(null);
      setActiveTab('generator');
    } else {
      setPinError(
        language === 'ku'
          ? 'پینی نهێنی هەڵەیە! تەنها خاوەنی سەکۆ دەسەڵاتی دروستکردنی کلیلی هەیە.'
          : language === 'ar'
          ? 'رمز PIN غير صحيح! فقط مالك المنصة مخوّل بتوليد المفاتيح.'
          : 'Incorrect Master PIN! Key generation is restricted to the software owner.'
      );
    }
  };

  const handleLockMasterStudio = () => {
    setIsMasterUnlocked(false);
    try {
      sessionStorage.removeItem('sas4erp_master_owner_auth');
    } catch {}
    setActiveTab('activate');
  };

  // Generate Key for Customer
  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const result = generateClientLicenseKey({
      clientHoldingName: genHoldingName,
      clientEmail: genClientEmail,
      clientHardwareFingerprint: genClientHw,
      tier: genTier
    });

    setGeneratedResult(result);
    setLicenseHistory(prev => [result, ...prev.filter(x => x.licenseKey !== result.licenseKey)].slice(0, 20));
  };

  const handleCopyGeneratedKey = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult.licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyDispatchMsg = () => {
    if (!generatedResult) return;
    const msg = dispatchLang === 'ku'
      ? generatedResult.dispatchMessageKu
      : dispatchLang === 'ar'
      ? generatedResult.dispatchMessageAr
      : generatedResult.dispatchMessageEn;

    navigator.clipboard.writeText(msg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const handlePrintCertificate = () => {
    if (!generatedResult) return;
    openLicenseCertificatePrintView({
      licenseKey: generatedResult.licenseKey,
      clientHoldingName: generatedResult.clientHoldingName,
      tierLabelKu: generatedResult.tierLabelKu,
      tierLabelEn: generatedResult.tierLabelEn,
      durationLabelKu: generatedResult.durationLabelKu,
      durationLabelEn: generatedResult.durationLabelEn,
      hardwareFingerprint: generatedResult.clientHardwareFingerprint,
      createdAt: generatedResult.createdAt
    });
  };

  const handleApplyGeneratedToLocal = () => {
    if (!generatedResult) return;
    setInputKey(generatedResult.licenseKey);
    setHoldingName(generatedResult.clientHoldingName);
    if (genClientEmail) setContactEmail(genClientEmail);
    setActiveTab('activate');
  };

  const handleQuickGrant = (key: string) => {
    setInputKey(key);
    setActiveTab('activate');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-6 max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
              isMasterUnlocked && activeTab === 'generator'
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/30'
                : license.licenseType === 'VIP_OWNER_GIFT'
                ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-amber-500/30'
                : license.licenseType === 'COMMERCIAL_ACTIVE'
                ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-emerald-600/30'
                : license.licenseType === 'EXPIRED'
                ? 'bg-rose-600 text-white shadow-rose-600/30'
                : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-600/30'
            }`}>
              {isMasterUnlocked && activeTab === 'generator' ? (
                <Crown className="w-6 h-6 text-slate-950 animate-pulse" />
              ) : license.licenseType === 'VIP_OWNER_GIFT' ? (
                <Crown className="w-6 h-6 text-white" />
              ) : (
                <Key className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  {isMasterUnlocked && activeTab === 'generator'
                    ? (language === 'ku' ? '👑 ستۆدیۆی خاوەنی سەکۆ (Vendor Key Studio)' : '👑 Platform Owner Key Studio')
                    : (language === 'ku' ? 'سیستەمی کاراکردن و نوێکردنەوەی لایسنس' : 'SAS4ERP License & Node Authorization')}
                </h3>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                  license.licenseType === 'VIP_OWNER_GIFT'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : license.licenseType === 'COMMERCIAL_ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : license.licenseType === 'EXPIRED'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}>
                  {license.licenseType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isMasterUnlocked && activeTab === 'generator'
                  ? (language === 'ku' ? 'دروستکردنی کلیل بۆ کڕیاران و بەستنەوە بە کۆمپیوتەری کڕیار (Hardware Lock)' : 'Generate cryptographically verified keys for clients with hardware lock')
                  : (language === 'ku' ? 'پشکنینی باری مۆڵەت و کاراکردنی کۆدی لایسنس لە ڕێگەی خاوەنی سەکۆ' : 'Check authorization status & activate license key provided by vendor')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: ONLY VISIBLE IF MASTER PIN IS UNLOCKED BY OWNER */}
        {isMasterUnlocked && (
          <div className="bg-amber-50/70 border border-amber-300 p-1.5 rounded-2xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              <button
                onClick={() => setActiveTab('activate')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'activate'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Key className="w-3.5 h-3.5 text-blue-600" />
                <span>{language === 'ku' ? '🔑 کاراکردن (Client View)' : '🔑 Activate'}</span>
              </button>

              <button
                onClick={() => setActiveTab('generator')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'generator'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md ring-1 ring-amber-400'
                    : 'text-amber-900 hover:text-amber-950 font-bold'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-slate-950" />
                <span>{language === 'ku' ? '👑 ستۆدیۆی دروستکردنی کلیل (Owner Studio)' : '👑 Key Generator Studio'}</span>
              </button>
            </div>

            <button
              onClick={handleLockMasterStudio}
              title={language === 'ku' ? 'قفڵکردنەوەی ستۆدیۆی خاوەن' : 'Lock Master Studio'}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{language === 'ku' ? 'قفڵکردنەوە' : 'Lock'}</span>
            </button>
          </div>
        )}

        {/* Full-Page System 2 Vendor Hub Banner Shortcut for Owner */}
        {isMasterVendorOwner && (
          <button
            type="button"
            onClick={() => {
              setERPActiveTab('vendor-license-hub');
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-amber-300 border-2 border-amber-400 text-xs font-black flex items-center justify-between hover:border-amber-300 transition cursor-pointer shadow-md group"
          >
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{language === 'ku' ? '🚀 چوون بۆ سیستەمی دووەم: پۆڕتاڵی تەواوی بەڕێوەبردنی لایسنس (Vendor Hub)' : '🚀 Open Full Platform Owner Vendor Hub (System 2)'}</span>
            </div>
            <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg font-mono font-bold">
              FULL PAGE ➔
            </span>
          </button>
        )}

        {/* =========================================================================
            TAB 1: CLIENT ACTIVATION SCREEN (STANDARD VIEW FOR CLIENTS)
        ========================================================================= */}
        {activeTab === 'activate' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Current License Status Card */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              license.licenseType === 'VIP_OWNER_GIFT'
                ? 'bg-amber-50/80 border-amber-200'
                : license.licenseType === 'COMMERCIAL_ACTIVE'
                ? 'bg-emerald-50/80 border-emerald-200'
                : license.licenseType === 'EXPIRED'
                ? 'bg-rose-50 border-rose-200'
                : 'bg-blue-50/70 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>{language === 'ku' ? 'ڕەوشی ئێستای ئەم سیستەمە:' : 'Current System License:'}</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 bg-white/70 px-2 py-0.5 rounded-md border border-slate-200">
                  {license.licenseKey}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-200/60">
                <div>
                  <span className="text-slate-500 block text-[11px]">{language === 'ku' ? 'تۆمارکراو بەناوی هۆڵدینگی:' : 'Licensed Holding:'}</span>
                  <strong className="text-slate-800 font-extrabold truncate block">{license.licensedToHolding}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">{language === 'ku' ? 'کاتی بەسەرچوون / ماوە:' : 'Expiration / Status:'}</span>
                  <strong className={`font-extrabold ${
                    license.licenseType === 'EXPIRED'
                      ? 'text-rose-600'
                      : license.isPerpetual
                      ? 'text-amber-700'
                      : remainingDays <= 3
                      ? 'text-rose-600'
                      : 'text-emerald-700'
                  }`}>
                    {license.isPerpetual
                      ? (language === 'ku' ? 'هەمیشەیی (Perpetual VIP)' : 'Perpetual Lifetime')
                      : license.licenseType === 'EXPIRED'
                      ? (language === 'ku' ? 'بەسەرچووە (تکایە نوێی بکەرەوە)' : 'Expired (Renewal Required)')
                      : (language === 'ku' ? `${remainingDays} ڕۆژی ماوە` : `${remainingDays} days remaining`)}
                  </strong>
                  {license.licenseType === 'TRIAL_14D' && (
                    <button
                      type="button"
                      onClick={handleResetTrial}
                      className="mt-1 text-[11px] text-amber-700 hover:text-amber-900 font-bold underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-amber-700" />
                      <span>{language === 'ku' ? '🔄 نوێکردنەوە بۆ ١٤ ڕۆژ' : '🔄 Reset to 14 Days'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Hardware Fingerprint Node Lock Box (The Client Copies This to Send to Vendor) */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>{language === 'ku' ? 'ناسنامەی ئامێری کۆمپیوتەرەکەت (Hardware Node ID):' : 'Machine Hardware Fingerprint:'}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  Node Lock
                </span>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/90 p-2.5 rounded-xl border border-slate-800">
                <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 tracking-wider flex-1 truncate">
                  {hwFingerprint}
                </span>
                <button
                  type="button"
                  onClick={handleCopyHw}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  {copiedHw ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHw ? (language === 'ku' ? 'کۆپیکرا' : 'Copied') : (language === 'ku' ? 'کۆپیکردنی کۆد' : 'Copy Node ID')}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {language === 'ku'
                  ? '📌 بۆ کڕین یان نوێکردنەوەی مانگانەی لایسنس: ئەم ناسنامەیەی ئامێرەکەت بنێرە بۆ خاوەنی سەکۆ تا کلیلێکی تایبەت بە کۆمپانیاکەت بۆ دروست بکات و پێت بدات.'
                  : language === 'ar'
                  ? '📌 للتجديد الشهري أو شراء الترخيص: أرسل معرف العتاد هذا إلى مالك المنصة ليقوم بتوليد مفتاح ترخيص مخصص لمؤسستك.'
                  : '📌 For monthly renewal or purchase: Send this Hardware Node ID to the software vendor to receive your official signed license key.'}
              </p>
            </div>

            {/* Client Activation Key Form */}
            <form onSubmit={handleActivate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  {language === 'ku' ? 'کۆدی لایسنسی وەرگیراو لە خاوەنی سەکۆ (Activation Key):' : 'Activation Key (Provided by Vendor):'} *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="SAS-MON-XXXX-XXXX-XXXX"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm text-slate-900 uppercase font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                    required
                  />
                </div>

                {/* Clear Writings & Instructions under the key */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 mt-2">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'ku' ? 'نووسین و ڕێنماییەکانی تایبەت بە کلیلەکە:' : 'License Key Terms & Instructions:'}</span>
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                      <strong className="text-slate-900 font-extrabold block mb-0.5">
                        {language === 'ku' ? '📋 شێوازی کلیل:' : 'Key Structure:'}
                      </strong>
                      <span>{language === 'ku' ? 'کلیلەکە کۆدێکی کریپتۆگرافی پارێزراوە کە تەنها لە ڕێگەی خاوەنی سەکۆوە دەدرێت.' : 'Cryptographically signed string bound to your workstation node ID.'}</span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                      <strong className="text-slate-900 font-extrabold block mb-0.5">
                        {language === 'ku' ? '⏱️ نوێکردنەوەی مانگانە:' : 'Monthly Renewal Cycle:'}
                      </strong>
                      <span>{language === 'ku' ? 'لایسنسەکان مانگانە نوێ دەکرێنەوە بۆ دڵنیایی لە بەردەوامی و پاراستنی سەروەری سیستم.' : 'Licenses are renewed periodically via your workstation node fingerprint.'}</span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                      <strong className="text-slate-900 font-extrabold block mb-0.5">
                        {language === 'ku' ? '🔒 بەستنەوە بە ئامێر:' : 'Workstation Node Lock:'}
                      </strong>
                      <span>{language === 'ku' ? 'ئەم کلیلە تایبەتە بەم ئامێرە و ناکرێت بگوازرێتەوە بۆ ئامێری تر بەبێ ڕەزامەندی.' : 'Hardware fingerprint prevents unauthorized license duplication.'}</span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                      <strong className="text-slate-900 font-extrabold block mb-0.5">
                        {language === 'ku' ? '⚡ دەسەڵاتی تەواو:' : 'Full Unlocked Scope:'}
                      </strong>
                      <span>{language === 'ku' ? 'بە لێدانی کلیلەکە تەواوی ۲۱ بەش، میشی ئۆفلاین و گۆڕەری Word ⇄ PDF کارا دەبن.' : 'Instantly unlocks all 21 modules, offline mesh, and trilingual reports.'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">
                    {language === 'ku' ? 'ناوی هۆڵدینگ / کۆمپانیاکەت:' : 'Your Holding / Company Name:'}
                  </label>
                  <input
                    type="text"
                    value={holdingName}
                    onChange={(e) => setHoldingName(e.target.value)}
                    placeholder="Zagros Energy Holding"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">
                    {language === 'ku' ? 'ئیمەیڵی پەیوەندی:' : 'Contact Email:'}
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="ceo@zagrosenergy.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Feedback messages */}
              {activationResult && (
                <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  activationResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {activationResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{language === 'ku' ? activationResult.messageKu : activationResult.messageEn}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  {language === 'ku' ? 'داخستن' : 'Close'}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-blue-600/25"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{language === 'ku' ? 'چالاککردنی لایسنس' : 'Activate License'}</span>
                </button>
              </div>
            </form>

            {/* Discreet Vendor Access Trigger (Strictly restricted to Platform Owner / ME - Completely hidden from subscribers) */}
            {isMasterVendorOwner && (
              <>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] font-mono text-slate-400">SAS4ERP Sovereign OS • Hardware-Bound Node Lock</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isMasterUnlocked) {
                        setActiveTab('generator');
                      } else {
                        setShowPinDialog(!showPinDialog);
                        setPinError(null);
                      }
                    }}
                    className="flex items-center gap-1.5 text-[11px] text-amber-700 hover:text-amber-600 font-bold transition cursor-pointer bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200"
                    title={language === 'ku' ? 'ستۆدیۆی خاوەنی سەکۆ' : 'Platform Vendor Master Access'}
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'ku' ? '👑 ستۆدیۆی خاوەن (Owner Studio)' : '👑 Vendor Studio'}</span>
                  </button>
                </div>

                {/* Vendor PIN Verification Dialog (Secures Key Generator from Clients) */}
                {showPinDialog && !isMasterUnlocked && (
                  <div className="p-4 rounded-2xl bg-slate-900 text-white border-2 border-amber-400/80 space-y-3 animate-in fade-in duration-200 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black text-amber-300">
                          {language === 'ku' ? 'دەروازەی نهێنی خاوەنی سەکۆ (Vendor Secret Gate):' : 'Platform Owner Secret PIN Gate:'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPinDialog(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {language === 'ku'
                        ? 'بۆ ئەوەی کڕیاران نەتوانن خۆیان کلیل دروست بکەن و مانگانە پێویستیان بە ڕەزامەندی تۆ بێت، تکایە پینی نهێنی خاوەن (Master PIN) بنووسە:'
                        : language === 'ar'
                        ? 'لحماية ترخيصك ومنع العملاء من توليد المفاتيح بأنفسهم وضمان التجديد الشهري، يرجى إدخال الرمز السري للمالك:'
                        : 'To ensure clients cannot self-generate licenses without your monthly consent, enter the Master Vendor PIN:'}
                    </p>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={enteredPin}
                          onChange={(e) => {
                            setEnteredPin(e.target.value);
                            setPinError(null);
                          }}
                          placeholder="****"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center tracking-widest text-sm focus:outline-none focus:border-amber-400"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleVerifyMasterPin();
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyMasterPin}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shrink-0 shadow-md"
                      >
                        {language === 'ku' ? 'کردنەوەی ستۆدیۆ' : 'Unlock Studio'}
                      </button>
                    </div>

                    {pinError && (
                      <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-300 text-[11px] font-bold flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{pinError}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: OWNER KEY GENERATOR STUDIO (ONLY ACCESSIBLE VIA MASTER PIN)
        ========================================================================= */}
        {isMasterUnlocked && activeTab === 'generator' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Explanatory Banner for System Owner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-blue-500/10 border-2 border-amber-400/80 text-amber-950 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-600" />
                  <h4 className="font-black text-sm text-slate-900">
                    {language === 'ku' ? 'ستۆدیۆی فەرمی دروستکردنی کلیل بۆ کڕیاران (Owner Generator Studio)' : 'Official Client License Key Generator'}
                  </h4>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono">
                  Master Authenticated
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'ku'
                  ? 'وەک خاوەنی سیستەم، زانیارییەکانی کڕیار بنووسە. دەتوانیت لایسنسی مانگانە (٣٠ ڕۆژ بۆ نوێکردنەوەی بەردەوام)، ٦ مانگە، ١ ساڵە، یان VIP هەمیشەیی دروست بکەیت. کلیلەکە بەستراوەتەوە بە ئامێری کڕیار، لەگەڵ پەیامی ئامادەکراو بۆ واتسئەپ و بڕوانامەی فەرمی پرینتکراو.'
                  : 'Define client holding details and generate cryptographically signed keys bound to their hardware node. Includes monthly recurring subscription options and official printable certificates.'}
              </p>
            </div>

            {/* Generator Form */}
            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    {language === 'ku' ? 'ناوی هۆڵدینگ / کۆمپانیای کڕیار:' : 'Client Holding / Company Name:'} *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={genHoldingName}
                      onChange={(e) => setGenHoldingName(e.target.value)}
                      placeholder="Erbil Towers Holding"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 block">
                    {language === 'ku' ? 'ئیمەیڵی پەیوەندی کڕیار (ئیختیاری):' : 'Client Contact Email (Optional):'}
                  </label>
                  <input
                    type="email"
                    value={genClientEmail}
                    onChange={(e) => setGenClientEmail(e.target.value)}
                    placeholder="client@holding.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Hardware Fingerprint field with helper button */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 block">
                    {language === 'ku' ? 'ناسنامەی ئامێری کڕیار (کڕیار لە ئەپەکەی کۆپی دەکات و دەیداتە تۆ):' : 'Client Machine Hardware Fingerprint:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setGenClientHw(hwFingerprint)}
                    className="text-[10px] text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                  >
                    {language === 'ku' ? 'دانانی ناسنامەی ئەم ئامێرە بۆ تاقیکردنەوە' : 'Use this machine for testing'}
                  </button>
                </div>
                <div className="relative">
                  <Cpu className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={genClientHw}
                    onChange={(e) => setGenClientHw(e.target.value)}
                    placeholder="SAS-NODE-XXXX-XXXX"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 uppercase font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {language === 'ku'
                    ? 'ئەگەر بەتاڵ بێت، کلیلەکە گشتگیر (Universal) دەبێت و لەسەر هەر کۆمپیوتەرێک کار دەکات.'
                    : 'If left empty, a universal enterprise node key is generated.'}
                </span>
              </div>

              {/* Tier Selection (Includes Monthly Renewal) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  {language === 'ku' ? 'ماوە و جۆری لایسنس دیاریبکە:' : 'Select License Tier & Duration:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Monthly Commercial (User's primary model) */}
                  <button
                    type="button"
                    onClick={() => setGenTier('COMMERCIAL_1M')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer flex items-start gap-2.5 ${
                      genTier === 'COMMERCIAL_1M'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/40 text-amber-950'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Calendar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-black text-xs">⚡ بازرگانی مانگانە (٣٠ ڕۆژ - نوێکردنەوە)</div>
                      <div className="text-[10px] text-slate-500">مۆڵەتی مانگانە، پێویستی بە نوێکردنەوەی مانگانە لەلایەن تۆوە</div>
                    </div>
                  </button>

                  {/* 1 Year Commercial */}
                  <button
                    type="button"
                    onClick={() => setGenTier('COMMERCIAL_1Y')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer flex items-start gap-2.5 ${
                      genTier === 'COMMERCIAL_1Y'
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/40 text-blue-950'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Key className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-black text-xs">💼 بازرگانی ساڵانە (١ ساڵ - ٣٦٥ ڕۆژ)</div>
                      <div className="text-[10px] text-slate-500">مۆڵەتی ١ ساڵی تەواو بە سەرجەم مۆدیوڵەکانەوە</div>
                    </div>
                  </button>

                  {/* 6 Months Commercial */}
                  <button
                    type="button"
                    onClick={() => setGenTier('COMMERCIAL_6M')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer flex items-start gap-2.5 ${
                      genTier === 'COMMERCIAL_6M'
                        ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400/40 text-indigo-950'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-black text-xs">🏢 بازرگانی ٦ مانگە (١٨٠ ڕۆژ)</div>
                      <div className="text-[10px] text-slate-500">مۆڵەتی نیوە ساڵ بە داشبۆردی جێبەجێکار</div>
                    </div>
                  </button>

                  {/* VIP Owner Gift */}
                  <button
                    type="button"
                    onClick={() => setGenTier('VIP_OWNER_GIFT')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer flex items-start gap-2.5 ${
                      genTier === 'VIP_OWNER_GIFT'
                        ? 'bg-yellow-50 border-yellow-500 ring-2 ring-yellow-400/40 text-yellow-950'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Crown className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-black text-xs">👑 VIP خاوەن (هەمیشەیی بێسنوور)</div>
                      <div className="text-[10px] text-slate-500">بەخشراوی تایبەت بەبێ کاتی بەسەرچوون (Lifetime)</div>
                    </div>
                  </button>

                  {/* Trial Reset */}
                  <button
                    type="button"
                    onClick={() => setGenTier('TRIAL_RESET')}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer flex items-start gap-2.5 sm:col-span-2 ${
                      genTier === 'TRIAL_RESET'
                        ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/40 text-emerald-950'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <RefreshCw className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-black text-xs">⏱️ درێژکردنەوەی ١٤ ڕۆژەی تاقیکردنەوە</div>
                      <div className="text-[10px] text-slate-500">پێدانی ١٤ ڕۆژی تر بە کڕیار بۆ هەڵسەنگاندن</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{language === 'ku' ? '⚡ دروستکردنی کلیل و بەڵگەنامەی فەرمی بۆ کڕیار' : '⚡ Generate License Key & Dispatch Text'}</span>
                </button>
              </div>
            </form>

            {/* Generated Output Card */}
            {generatedResult && (
              <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white border-2 border-amber-400 shadow-xl space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      {language === 'ku' ? 'کلیل بە سەرکەوتوویی دروستکرا' : 'Key Successfully Issued'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-300">
                    {generatedResult.clientHoldingName}
                  </span>
                </div>

                {/* Big Key Display */}
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-between gap-3">
                  <div className="font-mono text-sm sm:text-base font-black text-amber-300 select-all tracking-wider break-all">
                    {generatedResult.licenseKey}
                  </div>
                  <button
                    onClick={handleCopyGeneratedKey}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-sm"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'کۆپیکرا' : 'کۆپیکردنی کلیل'}</span>
                  </button>
                </div>

                {/* Clear Writings & Specifications directly UNDER the Key */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'ku' ? 'نووسین و وردەکارییەکانی تایبەت بەم کلیلە:' : 'Writings & Specifications for This Key:'}</span>
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                      <span className="text-[10px] text-amber-200 block">{language === 'ku' ? 'هۆڵدینگی کڕیار:' : 'Client Holding:'}</span>
                      <strong className="text-white text-xs truncate block">{generatedResult.clientHoldingName}</strong>
                    </div>
                    <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                      <span className="text-[10px] text-amber-200 block">{language === 'ku' ? 'جۆری لایسنس:' : 'License Tier:'}</span>
                      <strong className="text-amber-300 text-xs truncate block">{generatedResult.tierLabelKu}</strong>
                    </div>
                    <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                      <span className="text-[10px] text-amber-200 block">{language === 'ku' ? 'ماوەی کارایی:' : 'Validity:'}</span>
                      <strong className="text-emerald-300 text-xs truncate block">{generatedResult.durationLabelKu}</strong>
                    </div>
                    <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                      <span className="text-[10px] text-amber-200 block">{language === 'ku' ? 'ناسنامەی ئامێر:' : 'Node Lock ID:'}</span>
                      <strong className="text-slate-300 font-mono text-[11px] truncate block select-all">{generatedResult.clientHardwareFingerprint || 'Universal Node'}</strong>
                    </div>
                  </div>
                </div>

                {/* Client Dispatch Message Generator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-blue-400" />
                      <span>{language === 'ku' ? 'پەیامی ئامادەکراو بۆ ناردن بۆ کڕیار (واتسئەپ یان ئیمەیڵ):' : 'Ready Dispatch Message for Client:'}</span>
                    </span>

                    {/* Language selector for dispatch message */}
                    <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setDispatchLang('ku')}
                        className={`px-2 py-0.5 rounded ${dispatchLang === 'ku' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'}`}
                      >
                        کوردی
                      </button>
                      <button
                        type="button"
                        onClick={() => setDispatchLang('en')}
                        className={`px-2 py-0.5 rounded ${dispatchLang === 'en' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'}`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setDispatchLang('ar')}
                        className={`px-2 py-0.5 rounded ${dispatchLang === 'ar' ? 'bg-amber-400 text-slate-950' : 'text-slate-300'}`}
                      >
                        العربية
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10 text-xs text-slate-200 font-mono whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto select-all">
                    {dispatchLang === 'ku'
                      ? generatedResult.dispatchMessageKu
                      : dispatchLang === 'ar'
                      ? generatedResult.dispatchMessageAr
                      : generatedResult.dispatchMessageEn}
                  </div>
                </div>

                {/* 3 Action Buttons for the Generated Key */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleCopyDispatchMsg}
                    className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    {copiedMsg ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMsg ? 'پەیامەکە کۆپیکرا' : 'کۆپیکردنی دەقی واتسئەپ'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintCertificate}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{language === 'ku' ? 'پرینتی بڕوانامەی فەرمی' : 'Print Certificate'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyGeneratedToLocal}
                    className="px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{language === 'ku' ? 'تاقیکردنەوە لەم ئەپە' : 'Test Locally'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Presets for the Owner Only */}
            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'ku' ? 'کلیلە خێراکان بۆ تاقیکردنەوە (تایبەت بە خاوەن):' : 'Quick Presets (Owner Testing Only):'}</span>
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickGrant('SAS-OWNER-GIFT-PERPETUAL-VIP')}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Gift className="w-3 h-3" />
                  <span>{language === 'ku' ? 'مۆڵەتی VIP خاوەن (هەمیشەیی)' : 'VIP Free Grant'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickGrant('SAS-MON-RENEWAL-2026-1M')}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Calendar className="w-3 h-3" />
                  <span>{language === 'ku' ? 'مانگانە (٣٠ ڕۆژ)' : '1-Month Pro Key'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickGrant('SAS-PRO-ENTERPRISE-2026')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Key className="w-3 h-3" />
                  <span>{language === 'ku' ? 'بازرگانی ١ ساڵە' : '1-Year Pro Key'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickGrant('SAS-TRIAL-RESET-14')}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{language === 'ku' ? 'نوێکردنەوەی ١٤ ڕۆژە' : 'Reset 14-Day Trial'}</span>
                </button>
              </div>
            </div>

            {/* Generated Keys History */}
            {licenseHistory.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language === 'ku' ? 'تۆماری کلیلە دروستکراوەکانی پێشوو بۆ کڕیاران:' : 'Recently Generated Keys for Clients:'}</span>
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {licenseHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-extrabold text-slate-900">{item.clientHoldingName}</div>
                        <div className="font-mono text-[11px] text-blue-700 font-bold">{item.licenseKey}</div>
                        <div className="text-[10px] text-slate-400">{item.tierLabelKu} • {new Date(item.createdAt).toLocaleDateString()}</div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.licenseKey);
                          setCopiedKey(true);
                          setTimeout(() => setCopiedKey(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>کۆپی</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
