import React, { useState, useEffect } from 'react';
import { WifiOff, Radio, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const OfflineStatusIndicator: React.FC = () => {
  const { language } = useLanguage();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setDismissed(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-amber-500/95 backdrop-blur-md text-slate-950 p-3.5 rounded-2xl shadow-xl border border-amber-300 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-amber-600/30 text-slate-950 flex items-center justify-center shrink-0">
          <WifiOff className="w-4 h-4 animate-pulse" />
        </div>
        <div className="text-xs">
          <div className="font-extrabold flex items-center gap-1.5">
            <span>{language === 'ar' ? 'وضع عدم الاتصال بالإنترنت نشط (Offline Mode)' : language === 'ku' ? 'دۆخی ئۆفلاین چاڵاکە' : 'Offline Mode Active'}</span>
            <span className="w-2 h-2 rounded-full bg-slate-900 inline-block animate-ping" />
          </div>
          <p className="text-[11px] text-amber-950/80 font-medium leading-tight mt-0.5">
            {language === 'ar'
              ? 'تم تحميل لوحة التحكم وأصول PWA من الذاكرة المؤقتة. يمكنك متابعة العمل وسجل البيانات.'
              : language === 'ku'
              ? 'داشبۆرد و تەواوی سەکۆکە لە بافەری ئۆفلاینەوە کاردەکەن بەبێ کێشە.'
              : 'App shell and dashboard loaded from offline cache. Local operations continue seamlessly.'}
          </p>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded-lg hover:bg-amber-600/20 text-slate-900 transition"
        title="Dismiss notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
