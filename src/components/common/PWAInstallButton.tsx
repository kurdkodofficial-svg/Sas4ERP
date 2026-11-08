import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useLanguage } from '../../context/LanguageContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language } = useLanguage();
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  // Hide if already running in standalone PWA window
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-600/25 transition cursor-pointer"
        id="pwa-install-header-btn"
        title={
          language === 'ar'
            ? 'تثبيت التطبيق على جهازك (PWA)'
            : language === 'ku'
            ? 'داگرتن و دامەزراندنی ئەپ لەسەر ئامێرەکەت (PWA)'
            : 'Install SAS4ERP App (PWA)'
        }
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {language === 'ar' ? 'تثبيت التطبيق' : language === 'ku' ? 'تەتبیق دابەزێنە' : 'Install PWA'}
        </span>
      </button>
    );
  }

  // iOS Safari flow (Apple requires Add to Home Screen via Share sheet)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
          id="pwa-install-ios-btn"
          title="Install on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">
            {language === 'ar' ? 'تثبيت على iOS' : language === 'ku' ? 'دامەزراندن لەسەر iOS' : 'Install on iOS'}
          </span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    {language === 'ar' ? 'التثبيت على iPhone / iPad' : language === 'ku' ? 'دامەزراندن لەسەر iPhone / iPad' : 'Install on iPhone / iPad'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                <p>
                  1. {language === 'ar' ? 'اضغط على زر المشاركة (Share) في أسفل متصفح Safari.' : language === 'ku' ? 'کرتە لەسەر دوگمەی هاوبەشکردن (Share) لە خوارەوەی وێبگەڕی سەفاری بکە.' : 'Tap the Share icon in the Safari toolbar.'}
                </p>
                <p>
                  2. {language === 'ar' ? 'مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).' : language === 'ku' ? 'بڕۆ خوارەوە و هەڵبژاردنی (Add to Home Screen) دیاری بکە.' : 'Scroll down and tap "Add to Home Screen".'}
                </p>
                <p>
                  3. {language === 'ar' ? 'ستتمكن من فتح لوحة التحكم والعمل دون اتصال بالإنترنت في أي وقت.' : language === 'ku' ? 'ئێستا دەتوانیت لە هەر شوێنێک بێ ئینتەرنێت سەکۆکە بکەیتەوە.' : 'The app will launch in full standalone mode with offline caching enabled.'}
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
              >
                {language === 'ar' ? 'فهمت ذلك' : language === 'ku' ? 'تێگەیشتم' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
