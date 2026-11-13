import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  Crown,
  Clock,
  CheckCircle2,
  Building2,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Gift
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  SystemLicenseInfo,
  getStoredSystemLicense,
  getOrCreateHardwareFingerprint,
  verifyAndApplyLicenseKey,
  getRemainingTrialDays
} from '../utils/licenseManager';
import { getApiUrl } from '../utils/apiConfig';

interface EntryLicenseVerificationGateProps {
  onLicenseChanged?: (license: SystemLicenseInfo) => void;
  children: React.ReactNode;
}

export const EntryLicenseVerificationGate: React.FC<EntryLicenseVerificationGateProps> = ({
  onLicenseChanged,
  children
}) => {
  const { language } = useLanguage();

  const [license, setLicense] = useState<SystemLicenseInfo>(() => getStoredSystemLicense());
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [inputKey, setInputKey] = useState<string>('');
  const [holdingName, setHoldingName] = useState<string>(license.licensedToHolding || '');
  const [supervisorEmail, setSupervisorEmail] = useState<string>(license.licensedToEmail || '');
  const [copiedHw, setCopiedHw] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ success: boolean; messageKu: string; messageEn: string } | null>(null);

  // Synchronize server status upon entry
  useEffect(() => {
    let isMounted = true;
    const checkServerStatus = async () => {
      try {
        const res = await fetch(getApiUrl('/api/license/status'));
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (data && data.license && isMounted) {
            // If server reports expired or updated, harmonize state
            if (data.isExpired) {
              setLicense(prev => ({ ...prev, licenseType: 'EXPIRED' }));
            }
          }
        }
      } catch (err) {
        // Fallback to local client evaluation
      } finally {
        if (isMounted) setIsVerifying(false);
      }
    };

    checkServerStatus();
    return () => { isMounted = false; };
  }, []);

  const remainingDays = getRemainingTrialDays(license.expiresAt);
  const isExpired = !license.isPerpetual && (license.licenseType === 'EXPIRED' || remainingDays <= 0);
  const hwFingerprint = getOrCreateHardwareFingerprint();

  const handleCopyHw = () => {
    navigator.clipboard.writeText(hwFingerprint);
    setCopiedHw(true);
    setTimeout(() => setCopiedHw(false), 2000);
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      // 1. Sync activation with server
      let serverRes: any = null;
      try {
        const res = await fetch(getApiUrl('/api/license/activate'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            licenseKey: inputKey,
            holdingName: holdingName || 'SAS Holding Enterprise',
            email: supervisorEmail || 'admin@sasholding.com'
          })
        });
        if (res.headers.get('content-type')?.includes('application/json')) {
          serverRes = await res.json();
        }
      } catch (e) {
        console.warn('Server offline, relying on client verification engine', e);
      }

      // 2. Client verification engine
      const clientRes = verifyAndApplyLicenseKey(inputKey, holdingName, supervisorEmail);

      if (clientRes.success && clientRes.license) {
        setLicense(clientRes.license);
        if (onLicenseChanged) onLicenseChanged(clientRes.license);
        setFeedback({
          success: true,
          messageKu: clientRes.messageKu || 'مۆڵەتەکە بە سەرکەوتوویی کارا کرا!',
          messageEn: clientRes.messageEn || 'License key verified and applied successfully!'
        });
        setInputKey('');
      } else if (serverRes && serverRes.success && serverRes.license) {
        setLicense(serverRes.license);
        if (onLicenseChanged) onLicenseChanged(serverRes.license);
        setFeedback({
          success: true,
          messageKu: serverRes.messageKu,
          messageEn: serverRes.messageEn
        });
        setInputKey('');
      } else {
        setFeedback({
          success: false,
          messageKu: clientRes.messageKu || 'کۆدی لایسنس نادروستە.',
          messageEn: clientRes.messageEn || 'Invalid activation license key.'
        });
      }
    } catch (err) {
      setFeedback({
        success: false,
        messageKu: 'کێشەیەک لە پەیوەندی بە سێرڤەر ڕوویدا.',
        messageEn: 'Error processing license activation request.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick preset shortcuts for Holding Owner
  const handleOwnerShortcut = (key: string) => {
    setInputKey(key);
  };

  // If initial verification is in flight, render smooth loader
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 animate-pulse">
          <Key className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold">Verifying Enterprise License...</h2>
        <p className="text-xs text-slate-400 mt-1">پشکنینی مۆڵەتی بەکارهێنان و ڕەقەکاڵا</p>
      </div>
    );
  }

  // If License has completely EXPIRED (14-day trial elapsed without activation), BLOCK app access and present activation gate
  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 shrink-0">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-white">
                  {language === 'ku'
                    ? 'ماوەی تاقیکردنەوەی ١٤ ڕۆژەی خۆڕایی بەسەرچوو'
                    : '14-Day Free Trial Period Expired'}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold uppercase">
                  License Required
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ku'
                  ? 'بۆ بەردەوامبوونی کارکردنی سەکۆکە، تکایە کۆدی فەرمی لایسنس لە خاوەنی سیستەم وەربگرە و داخیڵی بکە.'
                  : 'To unlock enterprise access and continue operations, enter your holding activation key.'}
              </p>
            </div>
          </div>

          {/* Machine Hardware Lock info */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'ku' ? 'ناسنامەی ڕەقەکاڵای ئەم ئامێرە (Hardware Fingerprint):' : 'Machine Hardware Fingerprint:'}</span>
              </span>
              <button
                type="button"
                onClick={handleCopyHw}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedHw ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHw ? 'کۆپیکرا' : 'کۆپی بکە'}</span>
              </button>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-center text-amber-300 select-all">
              {hwFingerprint}
            </div>
          </div>

          {/* Activation Form */}
          <form onSubmit={handleActivate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                {language === 'ku' ? 'کۆدی چالاککردنی لایسنس (License Activation Key):' : 'License Activation Key:'}
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="SAS-MON-XXXX-XXXX یان کلیلی بەخشراوی خاوەن"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 font-mono text-xs text-white uppercase font-bold focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Clear Writings & Instructions under the key */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5 mt-1">
                <span className="font-extrabold text-amber-300 text-xs flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ku' ? 'نووسین و ڕێنماییەکانی تایبەت بە کلیلەکە:' : 'License Key Terms & Instructions:'}</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {language === 'ku'
                    ? '📌 ئەم کلیلە مۆڵەتی فەرمی بەکارهێنانە لەلایەن خاوەنی سەکۆوە. کلیلەکە بەستراوەتەوە بە ناسنامەی ئامێرەکەت (Hardware Node ID) و مانگانە نوێ دەکرێتەوە بۆ دڵنیایی لە کارکردنی بەردەوامی سیستەم.'
                    : '📌 This key is provided by the platform author and bound to your workstation node ID with periodic renewal.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 block">
                  {language === 'ku' ? 'ناوی هۆڵدینگ:' : 'Holding Entity Name:'}
                </label>
                <input
                  type="text"
                  value={holdingName}
                  onChange={(e) => setHoldingName(e.target.value)}
                  placeholder="Skyline Towers Holding"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 block">
                  {language === 'ku' ? 'ئیمەیڵی سەرپەرشتیار:' : 'Supervisor Email:'}
                </label>
                <input
                  type="email"
                  value={supervisorEmail}
                  onChange={(e) => setSupervisorEmail(e.target.value)}
                  placeholder="supervisor@holding.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Holding Owner Direct VIP Grant Options */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'ku' ? 'دەسەڵاتی ڕاستەوخۆی خاوەن (Owner VIP Grant):' : 'Owner VIP Authorization Options:'}</span>
              </span>
              <p className="text-[10px] text-slate-400">
                {language === 'ku'
                  ? 'خاوەنی سەرەکی دەتوانێت دەستبەجێ بە یەک کرتە ئەم هۆڵدینگەی تر کارا بکات بەخۆڕایی:'
                  : 'Holding owner can grant perpetual free access directly to any sister holding partner:'}
              </p>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <button
                  type="button"
                  onClick={() => handleOwnerShortcut('SAS-OWNER-GIFT-PERPETUAL-VIP')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-amber-500/30"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>{language === 'ku' ? 'بەخشینی VIP بێبەرامبەر لەلایەن خاوەنەوە' : 'Grant Perpetual VIP Free'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOwnerShortcut('SAS-PRO-ENTERPRISE-2026')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  <span>1-Year Commercial Key</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOwnerShortcut('SAS-TRIAL-RESET-14')}
                  className="px-3 py-1.5 rounded-xl bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 text-xs font-bold border border-blue-500/30 transition cursor-pointer"
                >
                  <span>+14 Days Trial</span>
                </button>
              </div>
            </div>

            {/* Error or Success Feedback */}
            {feedback && (
              <div className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                feedback.success
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {feedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{language === 'ku' ? feedback.messageKu : feedback.messageEn}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              <Unlock className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? (language === 'ku' ? 'پشکنینی کلیل...' : 'Verifying Key...')
                  : (language === 'ku' ? 'چالاککردن و کردنەوەی سەکۆ' : 'Activate & Unlock Platform')}
              </span>
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 font-mono">
              SAS Holding Infrastructure Engine v4.5 • Hardware Lock Enforced
            </span>
          </div>
        </div>
      </div>
    );
  }

  // If in 14-day Free Trial or Licensed, render the application normally with a non-intrusive trial reminder banner if in trial
  return (
    <>
      {license.licenseType === 'TRIAL_14D' && remainingDays <= 14 && (
        <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-slate-900/90 text-white text-xs px-4 py-2 border-b border-indigo-500/30 flex items-center justify-between gap-3 relative z-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/40 text-[10px] font-bold font-mono">
              FREE TRIAL
            </span>
            <span className="font-semibold">
              {language === 'ku'
                ? `ماوەی تاقیکردنەوەی ١٤ ڕۆژەی خۆڕایی کارایە: تەنها (${remainingDays}) ڕۆژ ماوە.`
                : `14-Day Free Evaluation Active: ${remainingDays} days remaining.`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-300 hidden md:inline">
              {language === 'ku' ? 'ئەم ئەپە پێویستی بە مۆڵەتی بەکارهێنانە' : 'Commercial license required after trial'}
            </span>
            <button
              onClick={() => {
                const triggerBtn = document.getElementById('system-license-header-btn');
                if (triggerBtn) triggerBtn.click();
              }}
              className="px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center gap-1 transition cursor-pointer shadow-xs"
            >
              <Key className="w-3 h-3" />
              <span>{language === 'ku' ? 'داخڵکردنی کلیل' : 'Enter Key'}</span>
            </button>
          </div>
        </div>
      )}

      {children}
    </>
  );
};
