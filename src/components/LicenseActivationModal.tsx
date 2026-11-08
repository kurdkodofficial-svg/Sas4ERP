import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  ShieldAlert,
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
  Clock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  SystemLicenseInfo,
  getOrCreateHardwareFingerprint,
  verifyAndApplyLicenseKey,
  getRemainingTrialDays
} from '../utils/licenseManager';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: SystemLicenseInfo;
  onLicenseUpdated: (updated: SystemLicenseInfo) => void;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({
  isOpen,
  onClose,
  license,
  onLicenseUpdated
}) => {
  const { language } = useLanguage();

  const [inputKey, setInputKey] = useState<string>('');
  const [holdingName, setHoldingName] = useState<string>(license.licensedToHolding || '');
  const [contactEmail, setContactEmail] = useState<string>(license.licensedToEmail || '');
  const [copiedHw, setCopiedHw] = useState<boolean>(false);
  const [activationResult, setActivationResult] = useState<{ success: boolean; messageKu: string; messageEn: string } | null>(null);

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

  // Quick preset keys for Owner testing or gift granting
  const handleQuickGrant = (key: string) => {
    setInputKey(key);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
              license.licenseType === 'VIP_OWNER_GIFT'
                ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-amber-500/30'
                : license.licenseType === 'COMMERCIAL_ACTIVE'
                ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-emerald-600/30'
                : license.licenseType === 'EXPIRED'
                ? 'bg-rose-600 text-white shadow-rose-600/30'
                : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-600/30'
            }`}>
              {license.licenseType === 'VIP_OWNER_GIFT' ? (
                <Crown className="w-6 h-6" />
              ) : (
                <Key className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-lg sm:text-xl">
                  {language === 'ku'
                    ? 'سیستەمی لایسنس و بەستنەوەی کلیل (Hardware Lock)'
                    : 'System License & Hardware Lock'}
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
                {language === 'ku'
                  ? 'مۆڵەتی بەکارهێنانی سەکۆ و ڕێگریکردن لە بەکارهێنانی بێبەرامبەر'
                  : 'Platform usage authorization and hardware-locked license activation'}
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
              <span>{language === 'ku' ? 'ڕەوشی ئێستای لایسنس:' : 'Current License Status:'}</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">
              {license.licenseKey}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-200/60">
            <div>
              <span className="text-slate-500 block text-[11px]">{language === 'ku' ? 'تۆمارکراو بەناوی هۆڵدینگی:' : 'Licensed Holding:'}</span>
              <strong className="text-slate-800 font-extrabold truncate block">{license.licensedToHolding}</strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">{language === 'ku' ? 'ماوەی ماوە:' : 'Remaining Duration:'}</span>
              {license.isPerpetual ? (
                <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'ku' ? 'بێسنوور (VIP خاوەن)' : 'Perpetual Unlimited'}</span>
                </span>
              ) : remainingDays > 0 ? (
                <span className="font-extrabold text-blue-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{remainingDays} {language === 'ku' ? 'ڕۆژ ماوە' : 'Days Left'}</span>
                </span>
              ) : (
                <span className="font-extrabold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{language === 'ku' ? 'بەسەرچووە (Expired)' : 'Expired'}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hardware Fingerprint Lock Section */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-slate-600" />
              <span>{language === 'ku' ? 'ناسنامەی ڕەقەکاڵای ئامێرەکە (Hardware Fingerprint):' : 'Client Hardware Fingerprint:'}</span>
            </span>
            <button
              onClick={handleCopyHw}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              {copiedHw ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedHw ? 'کۆپیکرا' : 'کۆپی'}</span>
            </button>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold text-slate-800 text-center select-all">
            {hwFingerprint}
          </div>
          <span className="text-[10px] text-slate-400 block">
            {language === 'ku'
              ? 'کلیلەکانی لایسنس دەبەسترێنەوە بەم ناسنامەیە تا لەسەر ئامێری بێ مۆڵەت کار نەکەن.'
              : 'Licenses are anchored to this machine fingerprint to prevent unauthorized redistribution.'}
          </span>
        </div>

        {/* Activation Form */}
        <form onSubmit={handleActivate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'ku' ? 'کۆدی چالاککردنی لایسنس (License Activation Key):' : 'License Activation Key:'}
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="SAS-PRO-XXXX-XXXX یان کۆدی بەخشراوی خاوەن"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 uppercase font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">
                {language === 'ku' ? 'ناوی هۆڵدینگی کڕیار:' : 'Client Holding Name:'}
              </label>
              <input
                type="text"
                value={holdingName}
                onChange={(e) => setHoldingName(e.target.value)}
                placeholder="Skyline Towers Holding"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">
                {language === 'ku' ? 'ئیمەیڵی سەرپەرشتیار:' : 'Supervisor Email:'}
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="supervisor@holding.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Owner Quick Grant / VIP Buttons */}
          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'ku' ? 'دەسەڵاتی تایبەتی خاوەن (Owner VIP Grant):' : 'Owner Special Grant Options:'}</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickGrant('SAS-OWNER-GIFT-PERPETUAL-VIP')}
                className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                title="پێدانی مۆڵەتی بەخۆڕایی لەلایەن خاوەنەوە بۆ هۆڵدینگێک بەبێ پارەدان"
              >
                <Gift className="w-3 h-3" />
                <span>{language === 'ku' ? 'پێدانی مۆڵەتی بەخۆڕایی (VIP Gift)' : 'Grant VIP Free by Owner'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickGrant('SAS-PRO-ENTERPRISE-2026')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Key className="w-3 h-3" />
                <span>{language === 'ku' ? 'لایسنسی بازرگانی ١ ساڵە' : '1-Year Enterprise Key'}</span>
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
              className="px-6 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-blue-600/25"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'چالاککردنی لایسنس' : 'Activate License'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
