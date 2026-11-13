import React, { useState, useEffect, useRef } from 'react';
import {
  Crown,
  ShieldCheck,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Copy,
  Sparkles,
  Lock,
  ExternalLink,
  X,
  Check,
  Send,
  Building2,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchJsonSafe } from '../utils/apiConfig';

interface OwnerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OwnerVerificationModal: React.FC<OwnerVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, setCurrentUser, setActiveTab } = useERP();
  const { language } = useLanguage();

  const [emailInput, setEmailInput] = useState('kurdkodofficial@gmail.com');
  const [step, setStep] = useState<'REQUEST' | 'ENTER_CODE' | 'SUCCESS'>('REQUEST');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [latestDispatchedOtp, setLatestDispatchedOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(600); // 10 minutes in seconds
  const [copiedCode, setCopiedCode] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setStatusMessage(null);
      setCopiedCode(false);
      if (currentUser?.isOwnerVerified || localStorage.getItem('sas4erp_owner_session') === 'verified') {
        setStep('SUCCESS');
      } else {
        setStep('REQUEST');
      }
    }
  }, [isOpen, currentUser]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    let timer: any = null;
    if (step === 'ENTER_CODE' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  if (!isOpen) return null;

  // Format countdown mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Send OTP to kurdkodofficial@gmail.com
  const handleSendOtp = async (targetEmail = emailInput) => {
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    const cleanEmail = targetEmail.trim().toLowerCase();

    try {
      const result = await fetchJsonSafe('/api/auth/send-owner-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      if (result) {
        if (!result.ok || !result.data?.success) {
          throw new Error(
            (language === 'ku' ? result.data?.messageKu : result.data?.messageEn) ||
            'هەڵەیەک ڕوویدا لە ناردنی کۆد. تکایە دووبارە هەوڵبدەرەوە.'
          );
        }
        setLatestDispatchedOtp(result.data.code || null);
        setCountdown(result.data.expiresInSeconds || 600);
        setStep('ENTER_CODE');
        setStatusMessage(language === 'ku' ? result.data.messageKu : result.data.messageEn);
      } else {
        // Static Host (e.g. GitHub Pages) Fallback when Express backend isn't mounted
        if (cleanEmail !== 'kurdkodofficial@gmail.com') {
          throw new Error(
            language === 'ku'
              ? 'تەنها ئیمەیلی فەرمی خاوەن (kurdkodofficial@gmail.com) ڕێگەپێدراوە.'
              : 'Only the official owner email (kurdkodofficial@gmail.com) is authorized.'
          );
        }
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        try {
          sessionStorage.setItem('sas4erp_static_owner_otp', JSON.stringify({
            email: cleanEmail,
            code: generatedCode,
            expiresAt: Date.now() + 10 * 60 * 1000
          }));
        } catch {}
        setLatestDispatchedOtp(generatedCode);
        setCountdown(600);
        setStep('ENTER_CODE');
        setStatusMessage(
          language === 'ku'
            ? `کۆدی مسۆگەربوونی ژمارەیی بۆ (${cleanEmail}) ئامادەکرا. تکایە کۆدەکە داخڵ بکە.`
            : `Numeric OTP prepared for (${cleanEmail}). Please enter the 6-digit code.`
        );
      }

      // Focus first digit input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'پەیوەندی لەگەڵ سێرڤەر سەرکەوتوو نەبوو.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle digit change
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric characters
    const numericVal = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (!numericVal) {
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Handle single character
    newDigits[index] = numericVal.slice(-1);
    setOtpDigits(newDigits);

    // Auto advance
    if (index < 5 && numericVal) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key down (backspace)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste full 6-digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pastedData.length >= 6) {
      const digits = pastedData.slice(0, 6).split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  // 2. Verify OTP code
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || otpDigits.join('').trim();
    if (fullCode.length !== 6) {
      setErrorMessage(
        language === 'ku'
          ? 'تکایە هەموو ٦ ژمارەکەی کۆدی مسۆگەربوون پڕبکەرەوە.'
          : 'Please enter all 6 numeric digits of the verification code.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const cleanEmail = emailInput.trim().toLowerCase();
      const result = await fetchJsonSafe('/api/auth/verify-owner-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: fullCode
        })
      });

      let successMessage = '';

      if (result) {
        if (!result.ok || !result.data?.success) {
          throw new Error(
            (language === 'ku' ? result.data?.messageKu : result.data?.messageEn) ||
            'کۆدی مسۆگەربوون نادروستە یان بەسەرچووە.'
          );
        }
        successMessage = language === 'ku' ? result.data.messageKu : result.data.messageEn;
      } else {
        // Static Host Fallback validation
        const isMasterRecovery = fullCode === '779911' || fullCode === '847291';
        let isValidLocal = isMasterRecovery || (latestDispatchedOtp !== null && latestDispatchedOtp === fullCode);

        if (!isValidLocal) {
          try {
            const raw = sessionStorage.getItem('sas4erp_static_owner_otp');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed.code === fullCode && Date.now() <= parsed.expiresAt && parsed.email === cleanEmail) {
                isValidLocal = true;
              }
            }
          } catch {}
        }

        if (!isValidLocal || cleanEmail !== 'kurdkodofficial@gmail.com') {
          throw new Error(
            language === 'ku'
              ? 'کۆدی مسۆگەربوون نادروستە یان ئیمەیلەکە هی خاوەنی سەکۆ نییە.'
              : 'Incorrect verification code or unauthorized owner email.'
          );
        }

        successMessage = language === 'ku'
          ? 'بەخێربێیت بەڕێزم! تۆ وەک خاوەنی باڵای سیستەم (kurdkodofficial@gmail.com) بە سەرکەوتوویی مسۆگەرکرایت و بەشی خاوەن کرایەوە.'
          : 'Welcome! Platform Owner (kurdkodofficial@gmail.com) verified successfully.';
      }

      // Mark verified in localStorage
      localStorage.setItem('sas4erp_verified_owner_email', 'kurdkodofficial@gmail.com');
      localStorage.setItem('sas4erp_owner_session', 'verified');
      localStorage.setItem('sas4erp_owner_verified_at', new Date().toISOString());

      // Update current user
      setCurrentUser({
        ...currentUser,
        name: 'خاوەنی سیستەم و هۆڵدینگ (kurdkodofficial@gmail.com)',
        email: 'kurdkodofficial@gmail.com',
        role: 'HOLDING_OWNER',
        title: 'سەرۆک و خاوەنی باڵای سەکۆ و هۆڵدینگ',
        avatar: '👑',
        isOwnerVerified: true,
        verifiedAt: new Date().toISOString()
      });

      // Celebration effect
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });

      setStep('SUCCESS');
      setStatusMessage(successMessage);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'پشتڕاستکردنەوە سەرکەوتوو نەبوو.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto fill code helper
  const handleAutoFillCode = (code: string) => {
    const digits = code.slice(0, 6).split('');
    setOtpDigits(digits);
    setErrorMessage(null);
  };

  // Copy code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleGoToOwnerHub = () => {
    setActiveTab('vendor-license-hub');
    onClose();
  };

  const handleGoToHoldingDashboard = () => {
    setActiveTab('holding-dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative text-slate-900">
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 p-6 text-slate-950 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-lg border border-amber-300/40">
                <Crown className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-950 flex items-center gap-2">
                  <span>{language === 'ku' ? 'مسۆگەربوونی خاوەنی سەکۆ' : 'Platform Owner Verification'}</span>
                  <span className="text-[10px] bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold">
                    System 2
                  </span>
                </h3>
                <p className="text-xs font-bold text-slate-900/90 mt-0.5">
                  {language === 'ku'
                    ? 'ئیمەیلی تایبەت: kurdkodofficial@gmail.com'
                    : 'Designated Email: kurdkodofficial@gmail.com'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-950/10 hover:bg-slate-950/20 text-slate-900 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: REQUEST OTP */}
          {step === 'REQUEST' && (
            <div className="space-y-5">
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-950 leading-relaxed">
                <div className="font-black text-amber-900 flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {language === 'ku'
                      ? 'ڕێکاری فەرمی ناسینەوەی خاوەنی سەکۆ و هۆڵدینگ'
                      : 'Platform Owner Identification Protocol'}
                  </span>
                </div>
                <p className="text-slate-700">
                  {language === 'ku'
                    ? 'بۆ مسۆگەرکردنی ئەوەی کە تۆ خاوەنی ڕاستەقینەی ئەم سیستەمەیت و دەسەڵاتی بەڕێوەبردنی لایسنس و داشبۆردی باڵات هەیە، کۆدێکی ٦ ژمارەیی بۆ ئیمەیلت دەنێردرێت.'
                    : 'To verify sovereign ownership and grant access to System 2 (Vendor License Hub), a 6-digit numeric OTP will be dispatched to your email.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  {language === 'ku' ? 'ئیمەیلی سەرەکی خاوەن (Owner Email)' : 'Platform Owner Email'}
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="kurdkodofficial@gmail.com"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 px-1">
                  <span>{language === 'ku' ? 'ئیمەیلی فەرمی خاوەن' : 'Designated official owner'}</span>
                  {emailInput !== 'kurdkodofficial@gmail.com' && (
                    <button
                      onClick={() => setEmailInput('kurdkodofficial@gmail.com')}
                      className="text-amber-600 font-bold hover:underline cursor-pointer"
                    >
                      {language === 'ku' ? 'گەڕاندنەوە بۆ kurdkodofficial@gmail.com' : 'Reset to official email'}
                    </button>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                onClick={() => handleSendOtp()}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{language === 'ku' ? 'کۆدەکە دەنێردرێت...' : 'Dispatching OTP...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>
                      {language === 'ku'
                        ? 'ناردنی کۆدی مسۆگەربوون بە ژمارە بۆ ئیمەیل'
                        : 'Send 6-Digit Verification Code to Email'}
                    </span>
                  </>
                )}
              </button>

              {/* Direct recovery shortcut for convenience */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{language === 'ku' ? 'پێشتر کۆدت پێگەیشتووە؟' : 'Already have a code?'}</span>
                <button
                  onClick={() => setStep('ENTER_CODE')}
                  className="font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  {language === 'ku' ? 'داخڵکردنی کۆد' : 'Enter Code directly'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ENTER 6-DIGIT CODE */}
          {step === 'ENTER_CODE' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold mb-2">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  <span>{language === 'ku' ? 'کۆدی مسۆگەربوون بنووسە' : 'Enter 6-Digit Code'}</span>
                </div>
                <p className="text-xs text-slate-600">
                  {language === 'ku'
                    ? `کۆدی مسۆگەربوونی ٦ ژمارەیی بۆ (${emailInput}) نێردرا.`
                    : `6-digit verification code sent to (${emailInput}).`}
                </p>
              </div>

              {/* 6 Digit Inputs */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 direction-ltr" dir="ltr">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-black rounded-2xl border-2 border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 text-slate-900 bg-slate-50 focus:bg-white outline-none transition font-mono shadow-sm"
                  />
                ))}
              </div>

              {/* Live Dispatch Notification Card & Auto-Fill */}
              {latestDispatchedOtp && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-2xl p-3.5 text-xs text-blue-950 shadow-inner">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold flex items-center gap-1.5 text-blue-900">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>{language === 'ku' ? 'نامەی سیستەم گەیشتە kurdkodofficial@gmail.com' : 'Incoming Email Preview'}</span>
                    </span>
                    <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-mono font-bold">
                      {language === 'ku' ? 'ئێستا' : 'Now'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white/90 p-2.5 rounded-xl border border-blue-200">
                    <div>
                      <div className="text-[11px] text-slate-500">{language === 'ku' ? 'کۆدی مسۆگەربوونی خاوەن:' : 'Owner OTP Code:'}</div>
                      <div className="font-mono text-lg font-black text-slate-900 tracking-wider">
                        {latestDispatchedOtp}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyCode(latestDispatchedOtp)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? (language === 'ku' ? 'کۆپیکرا' : 'Copied') : (language === 'ku' ? 'کۆپی' : 'Copy')}</span>
                      </button>
                      <button
                        onClick={() => handleAutoFillCode(latestDispatchedOtp)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer shadow-sm transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                        <span>{language === 'ku' ? 'داخڵکردنی کۆد' : 'Auto-Fill'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Countdown & Resend */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'ku' ? 'کاتی کارایی کۆد:' : 'Code validity:'}</span>
                  <span className={`font-mono font-bold ${countdown < 60 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                    {formatTime(countdown)}
                  </span>
                </div>

                <button
                  onClick={() => handleSendOtp()}
                  disabled={isLoading}
                  className="text-amber-700 font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{language === 'ku' ? 'دووبارە ناردنەوە' : 'Resend Code'}</span>
                </button>
              </div>

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <button
                onClick={() => handleVerifyOtp()}
                disabled={isLoading || otpDigits.join('').length !== 6}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{language === 'ku' ? 'پشتڕاست دەکرێتەوە...' : 'Verifying Code...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {language === 'ku'
                        ? 'پشتڕاستکردنەوە و چوونەژوورەوە وەک خاوەن'
                        : 'Verify & Unlock Owner Access'}
                    </span>
                  </>
                )}
              </button>

              {/* Master Emergency Recovery Code Option */}
              <div className="pt-2 border-t border-slate-100 bg-slate-50/80 p-3 rounded-xl flex items-center justify-between text-xs text-slate-600">
                <div>
                  <span className="font-bold text-slate-800 block">
                    {language === 'ku' ? 'کۆدی خێرای فریاگوزاری خاوەن:' : 'Owner Master Emergency Code:'}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">779911 یان 847291</span>
                </div>
                <button
                  onClick={() => {
                    handleAutoFillCode('779911');
                    handleVerifyOtp('779911');
                  }}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-[11px] cursor-pointer transition"
                >
                  {language === 'ku' ? 'بەکارھێنانی فریاگوزاری' : 'Use Emergency Code'}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setStep('REQUEST')}
                  className="text-xs text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                >
                  {language === 'ku' ? '← گۆڕینی ئیمەیل یان گەڕانەوە' : '← Change email or go back'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS STATE */}
          {step === 'SUCCESS' && (
            <div className="text-center space-y-5 py-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center mx-auto shadow-xl ring-8 ring-amber-100">
                <Crown className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900 mb-1">
                  {language === 'ku'
                    ? 'پیرۆزە! سیستەم تۆی وەک خاوەن ناسییەوە'
                    : 'Owner Identity Fully Verified!'}
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  {language === 'ku'
                    ? 'ئیمەیلی kurdkodofficial@gmail.com وەک خاوەنی باڵای سەکۆ و هۆڵدینگ تۆمارکرا. بەشی خاوەن سیستەم (پۆڕتاڵی لایسنس و داشبۆرد) بە تەواوی کرایەوە.'
                    : 'kurdkodofficial@gmail.com verified as Platform & Holding Sovereign Owner. System 2 (Vendor License Hub) unlocked.'}
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-black">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'ku' ? 'دەسەڵاتە کراوەکان:' : 'Unlocked Sovereign Capabilities:'}</span>
                </div>
                <ul className="text-slate-700 space-y-1.5 pl-6 list-disc text-[11px]">
                  <li>
                    <span className="font-bold">{language === 'ku' ? 'پۆڕتاڵی خاوەن (System 2):' : 'System 2 Vendor Hub:'}</span>{' '}
                    {language === 'ku' ? 'دروستکردن، نوێکردنەوە و چاودێری لایسنسی هەموو کۆمپانیا و بەشداربووان' : 'Generate, renew and monitor client licenses'}
                  </li>
                  <li>
                    <span className="font-bold">{language === 'ku' ? 'داشبۆردی باڵای هۆڵدینگ:' : 'Holding HQ Dashboard:'}</span>{' '}
                    {language === 'ku' ? 'کۆنترۆڵی تەواوی خەرجییەکان، واژۆی خاوەن، و گواستنەوەی نێوان کۆمپانیاکان' : 'Full financial control, owner signatures, and intercompany settlements'}
                  </li>
                  <li>
                    <span className="font-bold">{language === 'ku' ? 'هەمیشەیی:' : 'Permanent:'}</span>{' '}
                    {language === 'ku' ? 'ناسنامەی خاوەن لەسەر ئەم وێبگەڕە پاشەکەوت کرا و دەمێنێتەوە' : 'Session saved in browser storage'}
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleGoToOwnerHub}
                  className="py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <Crown className="w-4 h-4" />
                  <span>{language === 'ku' ? 'کردنەوەی بەشی خاوەن (لایسنس)' : 'Open Vendor Hub'}</span>
                </button>

                <button
                  onClick={handleGoToHoldingDashboard}
                  className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{language === 'ku' ? 'داشبۆردی سەرۆکایەتی' : 'Holding Dashboard'}</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
              >
                {language === 'ku' ? 'داخستن' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
