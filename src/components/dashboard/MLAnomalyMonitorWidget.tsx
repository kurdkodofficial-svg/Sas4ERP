import React from 'react';
import {
  BrainCircuit,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Cpu,
  Lock,
  ExternalLink,
  ShoppingCart,
  Wallet,
  Users
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { getUIText, resolveEntityText } from '../../utils/langHelper';

export const MLAnomalyMonitorWidget: React.FC = () => {
  const { anomalyAlerts, anomalyStats, setActiveTab } = useERP();
  const { language } = useLanguage();

  const activeAlerts = (anomalyAlerts || []).filter(a => a.status === 'TRIGGERED' || a.status === 'INVESTIGATING');
  const criticalCount = activeAlerts.filter(a => a.severity === 'CRITICAL').length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 h-full flex flex-col justify-between">
      {/* Widget Header */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">
              <BrainCircuit className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-slate-900">
                  {getUIText(language, {
                    en: 'AI Risk & Anomaly Sentinel (ML Sentinel)',
                    ku: 'چاودێری زیرەکی دەستکرد بۆ مەترسییەکان (ML Sentinel)',
                    ar: 'مراقبة الذكاء الاصطناعي للمخاطر (ML Sentinel)'
                  })}
                </h3>
                {criticalCount > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                    {criticalCount} {getUIText(language, { en: 'Critical Alerts', ku: 'مەترسی هەستیار', ar: 'تنبيهات حرجة' })}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {getUIText(language, {
                  en: 'Automated ML detection for split-PO procurement, ledger anomalies & ghost attendance',
                  ku: 'دۆزینەوەی ئۆتۆماتیکی نائاسایی لە کڕین (Split-PO)، دەفتەری دارایی و ئامادەبوونی کارمەندان',
                  ar: 'رصد آلي للمخاطر وتجزئة أوامر الشراء والشذوذ المالي وسجلات الحضور'
                })}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ml-anomaly-detection')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>
              {getUIText(language, {
                en: 'All Logs ➜',
                ku: 'تەواوی لۆگەکان ➜',
                ar: 'كافة السجلات ➜'
              })}
            </span>
          </button>
        </div>

        {/* Stats Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-3.5">
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
            <span className="text-slate-400 text-[10px] block font-bold">
              {getUIText(language, { en: 'Analyzed Logs', ku: 'لۆگی پشکنراو', ar: 'السجلات المفحوصة' })}
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
              {(anomalyStats?.totalLogsAnalyzed || 0).toLocaleString()}
            </span>
          </div>
          <div className="bg-rose-50/60 p-2.5 rounded-2xl border border-rose-200/80">
            <span className="text-rose-800 text-[10px] block font-bold">
              {getUIText(language, { en: 'Active Risks', ku: 'مەترسی چالاک', ar: 'المخاطر النشطة' })}
            </span>
            <span className="text-base sm:text-lg font-black text-rose-700 font-mono">
              {activeAlerts.length} <span className="text-xs font-normal text-rose-600">
                {getUIText(language, { en: 'found', ku: 'دۆزراوە', ar: 'مرصود' })}
              </span>
            </span>
          </div>
          <div className="bg-emerald-50/60 p-2.5 rounded-2xl border border-emerald-200/80">
            <span className="text-emerald-800 text-[10px] block font-bold">
              {getUIText(language, { en: 'Waste Prevented', ku: 'پارێزراو لە بەفیڕۆدان', ar: 'وفر محمي' })}
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-700 font-mono">
              ${(((anomalyStats?.financialRiskPreventedUSD || 0)) / 1000).toFixed(0)}k
            </span>
          </div>
          <div className="bg-purple-50/60 p-2.5 rounded-2xl border border-purple-200/80">
            <span className="text-purple-800 text-[10px] block font-bold">
              {getUIText(language, { en: 'Confidence', ku: 'متمانەی شیکاری', ar: 'دقة التحليل' })}
            </span>
            <span className="text-base sm:text-lg font-black text-purple-700 font-mono">
              {((anomalyStats?.modelConfidenceAverage || 0.94) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Top Active Alerts Preview */}
      <div className="space-y-2 mt-2">
        {activeAlerts.length === 0 ? (
          <div className="p-4 text-center rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800 font-bold">
            {getUIText(language, {
              en: 'No active anomalies detected across subsidiary companies.',
              ku: 'هیچ مەترسییەکی نائاسایی لە کۆمپانیاکان تۆمار نەکراوە.',
              ar: 'لا توجد مخاطر أو شذوذ غير اعتيادي مسجل حالياً.'
            })}
          </div>
        ) : (
          activeAlerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              onClick={() => setActiveTab('ml-anomaly-detection')}
              className="p-3 rounded-2xl border border-slate-200/90 hover:border-purple-300 bg-slate-50/50 hover:bg-white transition cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  alert.category === 'PROCUREMENT'
                    ? 'bg-blue-100 text-blue-700'
                    : alert.category === 'FINANCIAL'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-purple-100 text-purple-700'
                }`}>
                  {alert.category === 'PROCUREMENT' && <ShoppingCart className="w-4 h-4" />}
                  {alert.category === 'FINANCIAL' && <Wallet className="w-4 h-4" />}
                  {alert.category === 'ATTENDANCE' && <Users className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 truncate">
                    <span className={`text-[10px] font-black px-1.5 py-0.2 rounded uppercase shrink-0 ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-black text-slate-900 group-hover:text-purple-700 transition truncate">
                      {resolveEntityText(alert, 'title', language)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {alert.companyName} • {resolveEntityText(alert, 'description', language)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-black font-mono px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  Score: {alert.score}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-[-2px] transition" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
