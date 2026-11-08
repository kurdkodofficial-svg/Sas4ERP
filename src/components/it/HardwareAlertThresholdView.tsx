import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Bell,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Clock,
  RefreshCw,
  Server,
  Zap,
  Cpu,
  MapPin,
  ChevronRight,
  Flame,
  UserCheck,
  Send,
  Eye,
  Info,
  Check,
  Filter,
  Search,
  Sparkles,
  ExternalLink,
  PhoneCall,
  ShieldCheck,
  Layers,
  Wrench
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useERP } from '../../context/ERPContext';
import {
  HardwareAlertThresholdPolicy,
  HardwareRiskEvaluatedAsset,
  GeneratedHardwareAlert,
  HardwareAlertSystemStatusResponse
} from '../../types/itAlertThreshold';

export const HardwareAlertThresholdView: React.FC = () => {
  const { language } = useLanguage();
  const { syncHardwareThresholdAlertsNow, setActiveTab } = useERP();

  // State
  const [data, setData] = useState<HardwareAlertSystemStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isSavingPolicy, setIsSavingPolicy] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{ ku: string; en: string } | null>(null);

  // Tab View within Alerts Engine
  const [activeTab, setActiveTabInternal] = useState<'OVERVIEW' | 'HIGH_RISK_ASSETS' | 'ALERTS_STREAM' | 'POLICY_SETTINGS'>('OVERVIEW');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [siteFilter, setSiteFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL'); // 'ALL' | 'HIGH_ONLY' | 'OVERDUE_ONLY'

  // Policy Form State
  const [formPolicy, setFormPolicy] = useState<HardwareAlertThresholdPolicy | null>(null);

  // Acknowledge Alert Modal
  const [acknowledgingAlert, setAcknowledgingAlert] = useState<GeneratedHardwareAlert | null>(null);
  const [acknowledgeNotes, setAcknowledgeNotes] = useState<string>('');

  // Fetch full system status
  const fetchStatus = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch('/api/it-alerts/status');
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        return;
      }
      const json: HardwareAlertSystemStatusResponse = await res.json();
      if (json.success) {
        setData(json);
        setFormPolicy(json.policy);
      }
    } catch (err: any) {
      console.error('Failed to fetch hardware alert threshold status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Trigger Immediate Threshold Evaluation Scan
  const handleTriggerEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/it-alerts/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        return;
      }
      const json = await res.json();
      if (json.success) {
        setActionNotice({
          ku: json.messageKu,
          en: json.messageEn
        });
        await fetchStatus(true);
        // Sync Notification Center immediately
        await syncHardwareThresholdAlertsNow();
        setTimeout(() => setActionNotice(null), 6000);
      }
    } catch (err: any) {
      console.error('Error triggering evaluation:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Save Policy Changes
  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPolicy) return;
    setIsSavingPolicy(true);
    try {
      const res = await fetch('/api/it-alerts/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPolicy)
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        return;
      }
      const json = await res.json();
      if (json.success) {
        setActionNotice({
          ku: json.messageKu,
          en: json.messageEn
        });
        await fetchStatus(true);
        await syncHardwareThresholdAlertsNow();
        setTimeout(() => setActionNotice(null), 6000);
      }
    } catch (err: any) {
      console.error('Error updating threshold policy:', err);
    } finally {
      setIsSavingPolicy(false);
    }
  };

  // Acknowledge an Alert
  const handleAcknowledgeAlert = async () => {
    if (!acknowledgingAlert) return;
    try {
      const res = await fetch('/api/it-alerts/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: acknowledgingAlert.id,
          acknowledgedBy: 'IT Infrastructure Lead & Project Manager',
          resolutionNotes: acknowledgeNotes || 'Maintenance scheduled and operational mitigation verified.'
        })
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        return;
      }
      const json = await res.json();
      if (json.success) {
        setActionNotice({
          ku: json.messageKu,
          en: json.messageEn
        });
        setAcknowledgingAlert(null);
        setAcknowledgeNotes('');
        await fetchStatus(true);
        await syncHardwareThresholdAlertsNow();
        setTimeout(() => setActionNotice(null), 6000);
      }
    } catch (err: any) {
      console.error('Error acknowledging alert:', err);
    }
  };

  // Manually Dispatch an Alert to the Notification Center
  const handleDispatchNotification = async (alertId: string) => {
    try {
      const res = await fetch('/api/it-alerts/dispatch-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        return;
      }
      const json = await res.json();
      if (json.success) {
        setActionNotice({
          ku: json.messageKu,
          en: json.messageEn
        });
        await fetchStatus(true);
        await syncHardwareThresholdAlertsNow();
        setTimeout(() => setActionNotice(null), 6000);
      }
    } catch (err: any) {
      console.error('Error dispatching notification:', err);
    }
  };

  // Filtered Assets List
  const filteredAssets = useMemo(() => {
    if (!data) return [];
    let list = data.allEvaluatedAssets;

    if (riskFilter === 'HIGH_ONLY') {
      list = list.filter(a => a.isFlaggedHighRisk);
    } else if (riskFilter === 'OVERDUE_ONLY') {
      list = list.filter(a => a.overdueTicketsCount > 0);
    }

    if (siteFilter !== 'ALL') {
      list = list.filter(a => a.siteId === siteFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.assetTag.toLowerCase().includes(q) ||
        a.model.toLowerCase().includes(q) ||
        a.siteNameEn.toLowerCase().includes(q) ||
        a.siteNameKu.includes(q) ||
        a.assignedTechnician.toLowerCase().includes(q)
      );
    }

    return list;
  }, [data, riskFilter, siteFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                Automated Threshold Alert Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
                SLA & Risk Sentinel
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Bell className="w-8 h-8 text-rose-400" />
              <span>
                {language === 'ku'
                  ? 'سستەمی خۆکاری ئاگاداری سنورەکان و چاککردنەوەی دواکەوتوو'
                  : 'Automated Hardware Threshold Alert & Manager Notification System'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {language === 'ku'
                ? 'چاودێری بەردەوامی کاتی پشکنینەکان و دیاریکردنی ئامێرە مەترسیدارەکان؛ بە شێوەیەکی ئۆتۆماتیکی ئاگاداری و ڕاسپاردەی خێرا (Directives) دەنێرێت بۆ سەنتەری ئاگادارییەکانی بەڕێوەبەرانی پڕۆژە (PM) و بەڕێوەبەری گشتی (GM).'
                : 'Automated threshold monitoring engine continuously tracking overdue maintenance deadlines, expired manufacturer SLAs, and critical gate hardware degradation—dispatching actionable directives to manager notification feeds.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleTriggerEvaluation}
              disabled={isEvaluating}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shadow-md shadow-rose-900/30 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>{language === 'ku' ? 'پشکنینی دەستبەجێی سنورەکان (Scan)' : 'Run Threshold Audit Now'}</span>
            </button>

            <button
              onClick={() => fetchStatus()}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{language === 'ku' ? 'نوێکردنەوە' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Metric Cards */}
        {data && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-slate-800/80">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-slate-400 block">
                {language === 'ku' ? 'ئامێرە پشکنراوەکان' : 'Evaluated Hardware'}
              </span>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {data.summary.totalAssetsEvaluated}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Fleet 100% Monitored
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {language === 'ku' ? 'ئامێری مەترسی باڵا' : 'High Risk Assets'}
              </span>
              <div className="text-2xl font-black font-mono text-rose-300 mt-1">
                {data.summary.highRiskAssetsCount}
              </div>
              <span className="text-[10px] text-rose-400/80 mt-0.5 block">
                {data.summary.criticalRiskAssetsCount} {language === 'ku' ? 'لە دۆخی هەستیارن' : 'Critical Level'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {language === 'ku' ? 'چاککردنەوەی دواکەوتوو' : 'Overdue Tickets'}
              </span>
              <div className="text-2xl font-black font-mono text-amber-300 mt-1">
                {data.summary.overdueMaintenanceTicketsCount}
              </div>
              <span className="text-[10px] text-amber-400/80 mt-0.5 block">
                Breaching SLA Threshold
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-indigo-400 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" />
                {language === 'ku' ? 'هۆشدارییە چالاکەکان' : 'Generated Alerts'}
              </span>
              <div className="text-2xl font-black font-mono text-indigo-300 mt-1">
                {data.summary.activeAlertsCount}
              </div>
              <span className="text-[10px] text-indigo-400/80 mt-0.5 block">
                {data.summary.unacknowledgedAlertsCount} Unacknowledged
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {language === 'ku' ? 'نێردراو بۆ ئاگادارییەکان' : 'In Notification Center'}
              </span>
              <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
                {data.summary.dispatchedToNotificationCenterCount}
              </div>
              <span className="text-[10px] text-emerald-400/80 mt-0.5 block">
                Dispatched to PMs/GMs
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
              <span className="text-[11px] font-medium text-blue-400 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" />
                {language === 'ku' ? 'سنوری ئاگاداری خێرا' : 'Warning SLA'}
              </span>
              <div className="text-xl font-black font-mono text-blue-300 mt-1">
                &gt; {data.policy.overdueDaysWarningThreshold} {language === 'ku' ? 'ڕۆژ' : 'Days'}
              </div>
              <span className="text-[10px] text-blue-400/80 mt-0.5 block font-mono">
                Urgent: &gt; {data.policy.overdueDaysUrgentThreshold} Days
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>{language === 'ku' ? actionNotice.ku : actionNotice.en}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs within Threshold System */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-3 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTabInternal('OVERVIEW')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{language === 'ku' ? 'کورتەی هۆشدارییەکان' : 'Alerts Overview'}</span>
          </button>

          <button
            onClick={() => setActiveTabInternal('HIGH_RISK_ASSETS')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'HIGH_RISK_ASSETS'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>{language === 'ku' ? 'ئامێرە دیاریکراوەکانی مەترسی باڵا' : 'High Risk Hardware Units'}</span>
            {data && data.summary.highRiskAssetsCount > 0 && (
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                activeTab === 'HIGH_RISK_ASSETS' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
              }`}>
                {data.summary.highRiskAssetsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTabInternal('ALERTS_STREAM')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'ALERTS_STREAM'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{language === 'ku' ? 'هۆشدارییە نێردراوەکانی بەڕێوەبەران' : 'Dispatched Manager Alerts'}</span>
            {data && data.summary.unacknowledgedAlertsCount > 0 && (
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                activeTab === 'ALERTS_STREAM' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {data.summary.unacknowledgedAlertsCount} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTabInternal('POLICY_SETTINGS')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'POLICY_SETTINGS'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{language === 'ku' ? 'ڕێکخستنی سنورەکان (Threshold Policy)' : 'Threshold Policy Settings'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ACTIVE HIGHLIGHTS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Overdue Maintenance Banner if Present */}
          {data && data.summary.overdueMaintenanceTicketsCount > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-rose-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-rose-100 rounded-2xl text-rose-700 shrink-0">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>
                      {language === 'ku'
                        ? 'پێشێلکاری کاتی چاککردنەوە: پشکنینەکان دواکەوتوون لە سنوری دیاریکراو'
                        : 'SLA Alert: Overdue Maintenance Inspections Detected Across Fleet'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    {language === 'ku'
                      ? `بەپێی یاسای سنورەکان (> ${data.policy.overdueDaysWarningThreshold} ڕۆژ)، ${data.summary.overdueMaintenanceTicketsCount} تیکتی چاککردنەوە لە بەرواری دیاریکراوی خۆیان تێپەڕیون و هۆشداری پێویست نێردراوە بۆ بەڕێوەبەرانی پڕۆژە لە ڕێگەی Notification Center.`
                      : `The automated engine identified ${data.summary.overdueMaintenanceTicketsCount} maintenance inspection(s) exceeding the warning threshold of ${data.policy.overdueDaysWarningThreshold} days past due. Actionable directives have been dispatched to target project managers.`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTabInternal('ALERTS_STREAM')}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                <span>{language === 'ku' ? 'بینینی هۆشدارییەکان' : 'View Overdue Alerts'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick 2-Column: Flagged High-Risk Cards & Threshold Engine Live Logic */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Top Flagged High-Risk Units */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span>{language === 'ku' ? 'ئامێرە لەپێشینەکان بەپێی نمرەی مەترسی' : 'Priority High-Risk Assets'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'ku' ? 'ئەو ئامێرانەی نمرەی مەترسییان گەیشتووەتە سنوری دیاریکراو' : 'Units currently meeting or exceeding risk threshold criteria'}
                  </p>
                </div>

                <button
                  onClick={() => setActiveTabInternal('HIGH_RISK_ASSETS')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <span>{language === 'ku' ? 'هەموو ئامێرەکان' : 'View All'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {data?.highRiskAssets.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">{language === 'ku' ? 'هیچ ئامێرێک لە مەترسیدا نییە' : 'No assets currently flagged as High Risk'}</p>
                    <p className="text-[11px] mt-0.5">{language === 'ku' ? 'سەرجەم ئامێرەکان لە دۆخی ئاسایی و لەژێر گەرەنتیدان.' : 'All hardware nodes operational and within maintenance SLA.'}</p>
                  </div>
                ) : (
                  data?.highRiskAssets.slice(0, 3).map(asset => (
                    <div
                      key={asset.assetId}
                      className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 hover:bg-rose-50/60 transition space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black px-2.5 py-0.5 bg-slate-900 text-white rounded-lg">
                              {asset.assetTag}
                            </span>
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white">
                              Score: {asset.riskScore}/100 • {asset.riskLevel}
                            </span>
                            {asset.overdueTicketsCount > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                ⚠️ Overdue SLA
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-1.5">{asset.model}</h4>
                          <span className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {language === 'ku' ? asset.siteNameKu : asset.siteNameEn} ({asset.locationRoom})
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 block font-semibold">Lead Technician</span>
                          <span className="text-xs font-bold text-slate-800 block">{asset.assignedTechnician}</span>
                          <span className="text-[11px] font-mono text-blue-600 block">{asset.technicianPhone}</span>
                        </div>
                      </div>

                      {/* Risk Factors */}
                      <div className="space-y-1.5 pt-2 border-t border-rose-100">
                        {asset.riskFactors.map((rf, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] bg-white/80 p-2 rounded-xl border border-rose-100">
                            <span className="font-semibold text-rose-950 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                              {language === 'ku' ? rf.labelKu : rf.labelEn}
                            </span>
                            <span className="font-bold font-mono text-rose-700">+{rf.points} pts</span>
                          </div>
                        ))}
                      </div>

                      {/* Overdue Ticket Warning */}
                      {asset.activeOverdueTickets.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Ticket [{asset.activeOverdueTickets[0].ticketNumber}] is {asset.activeOverdueTickets[0].daysOverdue} days past scheduled date ({asset.activeOverdueTickets[0].scheduledDate})</span>
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: How the Threshold System Works */}
            <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>{language === 'ku' ? 'یاساکانی دیاریکردنی سنور و ئاگاداری' : 'Threshold Scoring & SLA Rules'}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {language === 'ku' ? 'شێوازی هەژمارکردنی خاڵەکانی مەترسی بە شێوەی خۆکار' : 'Dynamic algorithm scoring hardware degradation in real time'}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Overdue Maintenance Penalty</span>
                    <span className="font-mono text-rose-600 font-extrabold">+35 to +50 pts</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Triggered when a scheduled inspection exceeds the warning threshold (&gt; {data?.policy.overdueDaysWarningThreshold} days). Escalates to Urgent SLA Breach (+50 pts) past {data?.policy.overdueDaysUrgentThreshold} days.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Degraded Hardware Status</span>
                    <span className="font-mono text-rose-600 font-extrabold">+30 pts</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Applied when a physical unit enters <code className="bg-slate-200 px-1 rounded text-slate-800">MAINTENANCE_REQUIRED</code>, reducing cluster redundancy.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Lapsed Manufacturer SLA / Warranty</span>
                    <span className="font-mono text-amber-600 font-extrabold">+25 pts</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Servers and border scanners operating without active Dell ProSupport or Cisco SmartNet contracts.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">High Risk Classification Threshold</span>
                    <span className="font-mono text-slate-900 font-extrabold">&gt;= {data?.policy.highRiskScoreThreshold} pts</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Any asset reaching this score is flagged in the dashboard and dispatched directly to the Notification Center.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTabInternal('POLICY_SETTINGS')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{language === 'ku' ? 'دەستکاریکردنی ڕێژەی سنورەکان' : 'Customize Threshold Settings'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FLAGGED HIGH-RISK ASSETS GRID */}
      {activeTab === 'HIGH_RISK_ASSETS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={language === 'ku' ? 'گەڕان بەدوای تابلۆی ئامێر، مۆدێل، ئەندازیار...' : 'Search by asset tag, model, location, technician...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="ALL">{language === 'ku' ? 'هەموو ئامێرەکان (All Assets)' : 'All Assets'}</option>
                <option value="HIGH_ONLY">{language === 'ku' ? '🔴 تەنها مەترسی باڵا (High Risk)' : '🔴 Flagged High Risk Only'}</option>
                <option value="OVERDUE_ONLY">{language === 'ku' ? '⚠️ تەنها چاککردنەوەی دواکەوتوو' : '⚠️ Overdue Tickets Only'}</option>
              </select>

              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="ALL">{language === 'ku' ? 'هەموو بنکەکان' : 'All Project Sites'}</option>
                {Array.from(new Set(data?.allEvaluatedAssets.map(a => a.siteId))).map(siteId => {
                  const item = data?.allEvaluatedAssets.find(a => a.siteId === siteId);
                  return (
                    <option key={siteId} value={siteId}>
                      {language === 'ku' ? item?.siteNameKu : item?.siteNameEn}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssets.length === 0 ? (
              <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                {language === 'ku' ? 'هیچ ئامێرێک نەدۆزرایەوە بەپێی ئەم فلتەرە.' : 'No hardware units matched the selected filters.'}
              </div>
            ) : (
              filteredAssets.map(asset => (
                <div
                  key={asset.assetId}
                  className={`bg-white rounded-3xl p-5 border shadow-xs transition space-y-4 ${
                    asset.isFlaggedHighRisk
                      ? 'border-rose-300 ring-2 ring-rose-500/10'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black px-2.5 py-0.5 bg-slate-900 text-white rounded-lg">
                          {asset.assetTag}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                            asset.riskLevel === 'CRITICAL'
                              ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                              : asset.riskLevel === 'HIGH'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : asset.riskLevel === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          Score: {asset.riskScore}/100 • {asset.riskLevel}
                        </span>

                        {asset.isFlaggedHighRisk && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-rose-500" />
                            Flagged High Risk
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm mt-2">{asset.model}</h4>
                      <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{language === 'ku' ? asset.siteNameKu : asset.siteNameEn}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">{asset.locationRoom}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-semibold">Assigned Technician</span>
                      <span className="text-xs font-bold text-slate-800 block">{asset.assignedTechnician}</span>
                      <span className="text-[11px] font-mono text-blue-600 block">{asset.technicianPhone}</span>
                    </div>
                  </div>

                  {/* Overdue Ticket Banner */}
                  {asset.overdueTicketsCount > 0 && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Overdue Maintenance SLA ({asset.activeOverdueTickets[0].daysOverdue} Days Past Due)</span>
                        </span>
                        <span className="font-mono text-amber-700">{asset.activeOverdueTickets[0].ticketNumber}</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-tight">
                        {asset.activeOverdueTickets[0].titleEn} (Scheduled: {asset.activeOverdueTickets[0].scheduledDate})
                      </p>
                    </div>
                  )}

                  {/* Risk Factors List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Active Contributing Risk Factors
                    </span>
                    {asset.riskFactors.map((rf, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-700 font-medium">
                          {language === 'ku' ? rf.labelKu : rf.labelEn}
                        </span>
                        <span className="font-bold font-mono text-rose-600">+{rf.points} pts</span>
                      </div>
                    ))}
                  </div>

                  {/* Card Bottom Meta & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <div className="text-slate-500 text-[11px]">
                      <span>Power: <strong>{asset.powerWatts}W</strong></span>
                      <span className="mx-2">•</span>
                      <span>Warranty: <strong className={asset.warrantyStatus === 'EXPIRED' ? 'text-rose-600' : 'text-emerald-600'}>{asset.warrantyStatus}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          // Find matching alert or dispatch immediate notification
                          const matchingAlert = data?.alerts.find(a => a.assetId === asset.assetId);
                          if (matchingAlert) {
                            await handleDispatchNotification(matchingAlert.id);
                          } else {
                            handleTriggerEvaluation();
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5 text-rose-600" />
                        <span>{language === 'ku' ? 'ئاگادارکردنەوە' : 'Notify PM'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DISPATCHED MANAGER ALERTS STREAM */}
      {activeTab === 'ALERTS_STREAM' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-rose-600" />
                <span>{language === 'ku' ? 'هۆشدارییە فەرمییەکانی سەر مێزی بەڕێوەبەران' : 'Manager Directives & Official Notification Feed'}</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === 'ku'
                  ? 'هەموو ئەو هۆشدارییانەی ڕاستەوخۆ دەگەنە سەنتەری ئاگاداری بەڕێوەبەرانی پڕۆژە لەگەڵ ڕاسپاردە سەرەکییەکان.'
                  : 'Alerts active in the Notification Center with targeted directives for Project Managers and Subsidiary GMs.'}
              </p>
            </div>

            <button
              onClick={handleTriggerEvaluation}
              disabled={isEvaluating}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>{language === 'ku' ? 'نوێکردنەوەی پشکنین' : 'Re-Evaluate Feed'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {data?.alerts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-700">{language === 'ku' ? 'هیچ هۆشدارییەکی کاتی چاککردنەوە چالاک نییە' : 'No active alerts pending in the Notification Center'}</p>
                <p className="text-[11px] mt-0.5">{language === 'ku' ? 'سەرجەم ئامێرەکان لەژێر یاسای سنورەکان کاردەکەن.' : 'All maintenance tickets and hardware nodes comply with SLA policies.'}</p>
              </div>
            ) : (
              data?.alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`bg-white rounded-3xl p-6 border shadow-xs transition space-y-4 ${
                    alert.acknowledged
                      ? 'border-slate-200 opacity-80'
                      : alert.severity === 'CRITICAL'
                      ? 'border-rose-300 ring-2 ring-rose-500/10'
                      : 'border-amber-300 ring-2 ring-amber-500/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-rose-600 text-white animate-pulse'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {alert.severity} ALERT
                        </span>

                        <span className="font-mono text-xs font-extrabold px-2 py-0.5 bg-slate-100 rounded text-slate-800">
                          {alert.assetTag}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                          Target: {alert.targetRoles.join(', ')}
                        </span>

                        {alert.acknowledged ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Acknowledged by {alert.acknowledgedBy}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending Manager Action
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900 mt-2">
                        {language === 'ku' ? alert.titleKu : alert.titleEn}
                      </h4>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {language === 'ku' ? alert.messageKu : alert.messageEn}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-semibold">Assigned Manager</span>
                      <span className="text-xs font-bold text-slate-900 block">{alert.assignedManagerName}</span>
                      <span className="text-[11px] font-mono text-blue-600 block">{alert.assignedManagerPhone}</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Dispatched: {new Date(alert.dispatchedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Priority Directives Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>{language === 'ku' ? 'ڕاسپاردە سەرەکییەکان بۆ بەڕێوەبەران (Actionable Directives)' : 'Actionable Manager Directives:'}</span>
                    </span>

                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {(language === 'ku' ? alert.directivesKu : alert.directivesEn).map((directive, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {dIdx + 1}
                          </span>
                          <span>{directive}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Resolution Notes if Acknowledged */}
                  {alert.acknowledged && alert.resolutionNotes && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Resolution Logged:</span>
                      </span>
                      <p className="text-[11px] italic text-emerald-800">"{alert.resolutionNotes}"</p>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Bell className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Live in Notification Center Bell</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => setAcknowledgingAlert(alert)}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{language === 'ku' ? 'پەسەندکردنی هۆشداری' : 'Acknowledge Alert'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDispatchNotification(alert.id)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-slate-600" />
                        <span>{language === 'ku' ? 'ناردنەوەی ئاگاداری' : 'Re-Dispatch'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: THRESHOLD POLICY SETTINGS */}
      {activeTab === 'POLICY_SETTINGS' && formPolicy && (
        <form onSubmit={handleSavePolicy} className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <span>{language === 'ku' ? 'ڕێکخستنی سنووری هۆشدارییەکان و کاتی چاککردنەوە' : 'Automated Alert Threshold Policies & Notification Rules'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'ku'
                  ? 'دیاریکردنی ماوەی دواکەوتنی چاککردنەوە، نمرەی پێوانەیی مەترسی، و دۆخی ناردنی خۆکار بۆ Notification Center.'
                  : 'Define overdue day thresholds, risk sensitivity levels, and auto-dispatch behavior for manager feeds.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSavingPolicy}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{isSavingPolicy ? (language === 'ku' ? 'پاشەکەوت دەکرێت...' : 'Saving...') : (language === 'ku' ? 'پاشەکەوتکردنی سنوورەکان' : 'Save Threshold Policy')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Overdue SLA Days Warning */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                {language === 'ku' ? 'سنووری دواکەوتنی ئاگاداری سەرەتایی (Warning Overdue Days):' : 'Maintenance Overdue Warning Threshold (Days):'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formPolicy.overdueDaysWarningThreshold}
                  onChange={(e) => setFormPolicy({ ...formPolicy, overdueDaysWarningThreshold: Number(e.target.value) })}
                  className="w-24 px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                />
                <span className="text-xs text-slate-500">
                  {language === 'ku'
                    ? 'ڕۆژ دوای بەرواری دیاریکراو پێش ناردنی هۆشداری'
                    : 'Days past scheduled date before triggering warning notification.'}
                </span>
              </div>
            </div>

            {/* 2. Overdue Urgent Escalation */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                {language === 'ku' ? 'سنووری دواکەوتنی هەستیار (Urgent SLA Breach Days):' : 'Urgent SLA Escalation Threshold (Days):'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="2"
                  max="60"
                  value={formPolicy.overdueDaysUrgentThreshold}
                  onChange={(e) => setFormPolicy({ ...formPolicy, overdueDaysUrgentThreshold: Number(e.target.value) })}
                  className="w-24 px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                />
                <span className="text-xs text-slate-500">
                  {language === 'ku'
                    ? 'ڕۆژ دوای بەروار پێش ئەوەی پلەی هۆشدارییەکە بێتە CRITICAL'
                    : 'Days past scheduled date before escalating to Critical severity.'}
                </span>
              </div>
            </div>

            {/* 3. High Risk Score Threshold */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                {language === 'ku' ? 'سنووری نمرەی مەترسی باڵا (High Risk Threshold Score):' : 'High Risk Score Threshold (0 - 100):'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="30"
                  max="90"
                  value={formPolicy.highRiskScoreThreshold}
                  onChange={(e) => setFormPolicy({ ...formPolicy, highRiskScoreThreshold: Number(e.target.value) })}
                  className="w-24 px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                />
                <span className="text-xs text-slate-500">
                  {language === 'ku' ? 'نمرەی گشتی پێش ئەوەی ئامێرەکە وەک High Risk هەژمار بکرێت' : 'Points required to flag asset as High Risk in the dashboard.'}
                </span>
              </div>
            </div>

            {/* 4. Critical Risk Score Threshold */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                {language === 'ku' ? 'سنووری نمرەی مەترسی زۆر هەستیار (Critical Risk Threshold):' : 'Critical Risk Score Threshold (0 - 100):'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={formPolicy.criticalRiskScoreThreshold}
                  onChange={(e) => setFormPolicy({ ...formPolicy, criticalRiskScoreThreshold: Number(e.target.value) })}
                  className="w-24 px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                />
                <span className="text-xs text-slate-500">
                  {language === 'ku' ? 'نمرەی پێویست بۆ بەرزکردنەوە بۆ ئاستی سور و هۆشداری دەستبەجێ' : 'Points required for maximum Critical alert escalation.'}
                </span>
              </div>
            </div>
          </div>

          {/* Automated Notification Toggles */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              {language === 'ku' ? 'یاساکانی ناردنی خۆکار بۆ Notification Center' : 'Manager Notification Center Automated Rules'}
            </h4>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
                <input
                  type="checkbox"
                  checked={formPolicy.autoDispatchToNotificationCenter}
                  onChange={(e) => setFormPolicy({ ...formPolicy, autoDispatchToNotificationCenter: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    {language === 'ku' ? 'ناردنی خۆکار بۆ سەنتەری ئاگادارییەکان (Auto-Dispatch to Notification Center)' : 'Auto-Dispatch to Manager Notification Center'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                    {language === 'ku'
                      ? 'کاتێک ئامێرێک لە سنور تێپەڕی یان چاککردنەوەی دواکەوت، دەستبەجێ ئاگاداری فەرمی لە زەنگۆڵەی سەرەوە دروست دەبێت.'
                      : 'Automatically populates the header Notification Center bell with actionable directives whenever an asset breaches threshold.'}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
                <input
                  type="checkbox"
                  checked={formPolicy.notifyOnMaintenanceOverdue}
                  onChange={(e) => setFormPolicy({ ...formPolicy, notifyOnMaintenanceOverdue: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    {language === 'ku' ? 'ئاگادارکردنەوە لەسەر تیکتی چاککردنەوەی دواکەوتوو' : 'Notify Managers on Overdue Maintenance Inspections'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                    Alert target project managers and technicians immediately when scheduled deadlines pass.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
                <input
                  type="checkbox"
                  checked={formPolicy.notifyOnHighRiskAsset}
                  onChange={(e) => setFormPolicy({ ...formPolicy, notifyOnHighRiskAsset: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    {language === 'ku' ? 'ئاگادارکردنەوە لەسەر ئامێرەکانی مەترسی باڵا' : 'Notify Managers when Asset is Flagged as High Risk'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                    Escalate priority notification when compounding risk factors (power surges, expired SLA, critical gate exposure) breach threshold.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* Acknowledge Alert Modal */}
      {acknowledgingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  {acknowledgingAlert.severity} Escalation
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {language === 'ku' ? 'پەسەندکردنی هۆشداری و تۆمارکردنی چارەسەر' : 'Acknowledge Hardware Alert'}
                </h3>
              </div>
              <button
                onClick={() => setAcknowledgingAlert(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'ku' ? acknowledgingAlert.messageKu : acknowledgingAlert.messageEn}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {language === 'ku' ? 'تێبینی بەڕێوەبەر یان تیمی چاککردنەوە:' : 'Resolution & Mitigation Action Notes:'}
              </label>
              <textarea
                rows={3}
                placeholder={language === 'ku' ? 'بۆ نموونە: تیمی تەکنیکی سەردانی دەروازەی زاخۆی کرد و هاوێنەی کامێراکە بە سەرکەوتوویی پشکنرا...' : 'e.g. Technician dispatched to site, spare parts ordered under warranty RMA...'}
                value={acknowledgeNotes}
                onChange={(e) => setAcknowledgeNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAcknowledgingAlert(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                {language === 'ku' ? 'پاشگەزبوونەوە' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleAcknowledgeAlert}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'ku' ? 'تۆمارکردن و پەسەندکردن' : 'Confirm & Acknowledge'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
