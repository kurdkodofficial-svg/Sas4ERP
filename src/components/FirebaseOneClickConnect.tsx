import React, { useState, useRef, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  LogOut,
  AlertCircle,
  Loader2,
  Database,
  ExternalLink
} from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';

interface FirebaseOneClickConnectProps {
  variant?: 'header' | 'card';
}

export const FirebaseOneClickConnect: React.FC<FirebaseOneClickConnectProps> = ({
  variant = 'header',
}) => {
  const {
    firebaseUser,
    authReady,
    isConnecting,
    syncState,
    lastSyncedAt,
    errorMessage,
    quotaUpgradeUrl,
    cloudCounts,
    connectWithGoogle,
    disconnectFirebase,
    syncWorkspaceToCloud,
    clearError,
  } = useFirebase();

  const { holding, companies, projects, purchaseOrders } = useERP();
  const { language, isRtl } = useLanguage();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleOneClickConnect = async () => {
    const ok = await connectWithGoogle();
    if (ok) {
      setIsPopoverOpen(false);
    }
  };

  const handleManualSync = async () => {
    setManualSuccess(false);
    const ok = await syncWorkspaceToCloud(
      { holding, companies, projects, purchaseOrders },
      'MANUAL_ONE_CLICK_SYNC'
    );
    if (ok) {
      setManualSuccess(true);
      setTimeout(() => setManualSuccess(false), 3000);
    }
  };

  const isConnected = Boolean(authReady && firebaseUser);
  const isBusy = isConnecting || syncState === 'SYNCING';

  // Card variant for IT Settings Hub & Cloud Control
  if (variant === 'card') {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-900 text-white'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'ku'
                    ? 'داتابەیسی فەرمی هەوری Firebase (بە یەک کلیک)'
                    : language === 'ar'
                      ? 'قاعدة بيانات Firebase السحابية (بنقرة واحدة)'
                      : 'Firebase Cloud Database (1-Click Sync)'}
                </h3>
                {isConnected && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {language === 'ku' ? 'بەستراوەتەوە' : 'Connected'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {isConnected
                  ? language === 'ku'
                    ? `بە هەژماری (${firebaseUser?.email}) بەستراوەتەوە. داتاکان بە شێوەی ڕاستەوخۆ لە Firestore پاشەکەوت دەبن و لە هەموو لاپتۆپێکەوە هاوکات دەبن.`
                    : `Connected as ${firebaseUser?.email}. Holding records sync securely to Cloud Firestore across devices.`
                  : language === 'ku'
                    ? 'بێ هیچ ڕێکخستنێکی ئاڵۆز، تەنها یەک کلیک بکە و بە هەژماری Google بچۆرە ژوورەوە تا هەموو داتاکانی هۆڵدینگ لە هەوری Firebase پاشەکەوت ببن.'
                    : 'Click once to sign in with Google and automatically connect your holding workspace to Cloud Firestore.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {!isConnected ? (
              <button
                type="button"
                onClick={handleOneClickConnect}
                disabled={isBusy}
                id="it-hub-firebase-connect-btn"
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
              >
                {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
                <span>
                  {language === 'ku'
                    ? 'بەستنەوە بە Firebase (یەک کلیک)'
                    : language === 'ar'
                      ? 'الاتصال بـ Firebase'
                      : 'Connect Firebase (1-Click)'}
                </span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isBusy}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                  <span>
                    {language === 'ku' ? 'پاشەکەوتکردنی ئێستا' : 'Sync Now'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={disconnectFirebase}
                  className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language === 'ku' ? 'چوونەدەرەوە' : 'Sign Out'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {isConnected && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2">
              <div className="text-[11px] text-slate-500">{language === 'ku' ? 'کۆمپانیاکان' : 'Companies'}</div>
              <div className="font-bold text-slate-900 font-mono tabular-nums mt-0.5">{cloudCounts.companies}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2">
              <div className="text-[11px] text-slate-500">{language === 'ku' ? 'پڕۆژەکان' : 'Projects'}</div>
              <div className="font-bold text-slate-900 font-mono tabular-nums mt-0.5">{cloudCounts.projects}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2">
              <div className="text-[11px] text-slate-500">{language === 'ku' ? 'داواکاری کڕین' : 'Purchase Orders'}</div>
              <div className="font-bold text-slate-900 font-mono tabular-nums mt-0.5">{cloudCounts.purchaseOrders}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2">
              <div className="text-[11px] text-slate-500">{language === 'ku' ? 'دوایین سینک' : 'Last Sync'}</div>
              <div className="font-semibold text-slate-900 font-mono tabular-nums mt-0.5">
                {lastSyncedAt || '—'}
              </div>
            </div>
          </div>
        )}

        {manualSuccess && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {language === 'ku'
                ? 'هەموو داتاکانی هۆڵدینگ بە سەرکەوتوویی لە Firebase پاشەکەوت کران.'
                : 'Workspace successfully saved to Firebase Firestore.'}
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start justify-between gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div>{errorMessage}</div>
                {quotaUpgradeUrl && (
                  <a
                    href={quotaUpgradeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 underline font-semibold text-rose-900"
                  >
                    <span>Open Firestore Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-rose-600 hover:text-rose-900 font-semibold text-[11px] cursor-pointer"
            >
              ×
            </button>
          </div>
        )}
      </div>
    );
  }

  // Header variant: compact single-click button + clean popover
  const dropdownAlign = isRtl ? 'left-0' : 'right-0';

  if (!isConnected) {
    return (
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={handleOneClickConnect}
          disabled={isBusy}
          id="header-firebase-connect-btn"
          className="h-9 px-3 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap disabled:opacity-60"
          title={
            language === 'ku'
              ? 'بە یەک کلیک بە داتابەیسی هەوری Firebase ببەستەرەوە'
              : 'Connect to Firebase Cloud Database in 1 click'
          }
        >
          {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">
            {language === 'ku' ? 'بەستنەوە بە Firebase' : language === 'ar' ? 'ربط Firebase' : 'Connect Firebase'}
          </span>
        </button>

        {errorMessage && (
          <div
            className={`absolute ${dropdownAlign} mt-2 w-72 bg-white border border-rose-200 rounded-xl shadow-xl p-3 z-50 text-xs text-rose-800 space-y-2`}
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] cursor-pointer"
            >
              {language === 'ku' ? 'داخستن' : 'Dismiss'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsPopoverOpen((prev) => !prev)}
        id="header-firebase-status-btn"
        className="h-9 px-2.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
        title={firebaseUser?.email || 'Firebase Connected'}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            syncState === 'ERROR'
              ? 'bg-rose-500'
              : syncState === 'SYNCING'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
          }`}
        />
        <span className="hidden md:inline">Firebase</span>
      </button>

      {isPopoverOpen && (
        <div
          className={`absolute ${dropdownAlign} mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 z-50 space-y-3`}
        >
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
            {firebaseUser?.photoURL ? (
              <img
                src={firebaseUser.photoURL}
                alt={firebaseUser.displayName || 'User'}
                className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                {(firebaseUser?.displayName || firebaseUser?.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {firebaseUser?.displayName || 'Firebase Account'}
              </div>
              <div className="text-[11px] text-slate-500 truncate">{firebaseUser?.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-slate-50 border border-slate-200/70 rounded-lg py-1.5 px-1">
              <div className="text-[10px] text-slate-500">{language === 'ku' ? 'کۆمپانیا' : 'Cos'}</div>
              <div className="text-xs font-bold text-slate-900 font-mono tabular-nums">{cloudCounts.companies}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/70 rounded-lg py-1.5 px-1">
              <div className="text-[10px] text-slate-500">{language === 'ku' ? 'پڕۆژە' : 'Projs'}</div>
              <div className="text-xs font-bold text-slate-900 font-mono tabular-nums">{cloudCounts.projects}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/70 rounded-lg py-1.5 px-1">
              <div className="text-[10px] text-slate-500">{language === 'ku' ? 'داواکاری' : 'POs'}</div>
              <div className="text-xs font-bold text-slate-900 font-mono tabular-nums">{cloudCounts.purchaseOrders}</div>
            </div>
          </div>

          {lastSyncedAt && (
            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>{language === 'ku' ? 'دوایین سینک:' : 'Last synced:'}</span>
              <span className="font-mono text-slate-700 tabular-nums">{lastSyncedAt}</span>
            </div>
          )}

          {manualSuccess && (
            <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'ku' ? 'بە سەرکەوتوویی پاشەکەوت کرا' : 'Synced to Firestore'}</span>
            </div>
          )}

          {errorMessage && (
            <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isBusy}
              className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
              <span>{language === 'ku' ? 'پاشەکەوتی ئێستا' : 'Sync Now'}</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                setIsPopoverOpen(false);
                await disconnectFirebase();
              }}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold inline-flex items-center justify-center gap-1 transition cursor-pointer"
              title={language === 'ku' ? 'چوونەدەرەوە' : 'Sign Out'}
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
