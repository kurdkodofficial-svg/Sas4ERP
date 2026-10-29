import React, { useState } from 'react';
import {
  BrainCircuit,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Cpu,
  Sliders,
  Filter,
  Play,
  Sparkles,
  Lock,
  FileText,
  Clock,
  RefreshCw,
  Search,
  ShoppingCart,
  Wallet,
  Users,
  Eye,
  FileCheck2,
  ChevronRight,
  ArrowUpRight,
  Printer,
  Zap,
  Activity,
  Layers,
  Building2,
  Fingerprint
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import {
  MLAnomalyAlert,
  AnomalyCategory,
  AnomalySeverity,
  AnomalyStatus,
  MLSensitivityLevel,
  AttendanceRecord
} from '../types/anomaly';
import { requestGeminiForensicDiagnosis } from '../services/mlAnomalyDetector';

export const AnomalyDetectionModule: React.FC = () => {
  const {
    anomalyAlerts,
    attendanceRecords,
    anomalyStats,
    mlSensitivity,
    setMlSensitivity,
    isRealTimeMlActive,
    setIsRealTimeMlActive,
    runMLScan,
    updateAnomalyStatus,
    executeAnomalyAction,
    simulateAnomalyPattern,
    purchaseOrders,
    financeLedgers,
    companies
  } = useERP();

  const { language } = useLanguage();

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<AnomalyCategory | 'ALL'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<AnomalySeverity | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<AnomalyStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'ALERTS' | 'ATTENDANCE_LOGS' | 'ANALYTICS'>('ALERTS');
  
  // Modals & Inspection
  const [selectedAlert, setSelectedAlert] = useState<MLAnomalyAlert | null>(null);
  const [isAiDiagnosing, setIsAiDiagnosing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showSimulateDropdown, setShowSimulateDropdown] = useState(false);
  const [executiveDecisionInput, setExecutiveDecisionInput] = useState('');

  // Handle Scan Action
  const handleTriggerScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      runMLScan();
      setIsScanning(false);
    }, 900);
  };

  // Handle AI Forensic Diagnosis
  const handleOpenAiDiagnosis = async (alert: MLAnomalyAlert) => {
    setSelectedAlert(alert);
    setExecutiveDecisionInput('');
    if (!alert.aiForensicReport) {
      setIsAiDiagnosing(true);
      const forensic = await requestGeminiForensicDiagnosis(alert, language);
      setSelectedAlert(prev => {
        if (!prev || prev.id !== alert.id) return prev;
        return {
          ...prev,
          aiForensicReport: {
            ...forensic,
            generatedAt: new Date().toISOString()
          }
        };
      });
      setIsAiDiagnosing(false);
    }
  };

  // Filter Alerts
  const filteredAlerts = anomalyAlerts.filter(alert => {
    const matchCategory = selectedCategory === 'ALL' || alert.category === selectedCategory;
    const matchSeverity = selectedSeverity === 'ALL' || alert.severity === selectedSeverity;
    const matchStatus = selectedStatus === 'ALL' || alert.status === selectedStatus;
    const matchSearch = searchTerm === '' ||
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.titleKu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSeverity && matchStatus && matchSearch;
  });

  // Recharts Chart Data
  const chartScoreData = anomalyAlerts.map((a, idx) => ({
    name: `#${a.id.slice(-3)}`,
    title: a.titleKu || a.title,
    score: a.score,
    category: a.category,
    severity: a.severity
  }));

  const categoryDistributionData = [
    { name: language === 'ku' ? 'کڕین و دابینکردن' : 'Procurement', value: anomalyStats.procurementAnomaliesCount || 1, color: '#3B82F6' },
    { name: language === 'ku' ? 'دارایی و خەرجی' : 'Financial', value: anomalyStats.financialAnomaliesCount || 1, color: '#10B981' },
    { name: language === 'ku' ? 'ئامادەبوونی کارمەندان' : 'Attendance', value: anomalyStats.attendanceAnomaliesCount || 1, color: '#8B5CF6' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Hero Header: ML Anomaly Sentinel */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-bold font-mono">
                <BrainCircuit className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                <span>سیستەمی چاودێری زیرەکی دەستکرد (ML Sentinel)</span>
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border font-mono ${
                isRealTimeMlActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-700/50 text-slate-400 border-slate-600'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isRealTimeMlActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <span>{isRealTimeMlActive ? 'Real-Time Ingestion: Active' : 'Sensor Paused'}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold">
                <Cpu className="w-3 h-3 text-blue-300" />
                <span>Isolation Forest + Robust MAD Z-Score</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>دۆزینەوەی مەترسی و نائاسایی لە کڕین، دارایی، و ئامادەبوون</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              سیستەمێکی پێشکەوتووی فێربوونی ئامێر (Machine Learning) کە سەرجەم لۆگەکانی ERP بەردەوام دەپشکنێت و هەر جۆرە هەوڵێکی ساختەکاری لە کڕین (وەک Split-PO)، جووڵەی دارایی نائاسایی لە دەرەوەی کاتژمێری فەرمی، یان ئامادەبوونی ساختەی کارمەندان (Ghost Worker) لە دوو شوێنی جیاواز بە خێرایی دەستنیشان دەکات.
            </p>
          </div>

          {/* Quick Interactive Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Sensitivity Selector */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-1 flex items-center text-xs font-bold">
              <span className="px-2 text-slate-400 text-[10px] uppercase">ئاستی وردبینی:</span>
              {(['STRICT', 'STANDARD', 'RELAXED'] as MLSensitivityLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setMlSensitivity(level);
                    runMLScan(level);
                  }}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer text-xs font-bold ${
                    mlSensitivity === level
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {level === 'STRICT' ? 'توند (Z>2.0)' : level === 'STANDARD' ? 'ستاندارد (Z>2.5)' : 'سادە'}
                </button>
              ))}
            </div>

            {/* Run Scan Button */}
            <button
              onClick={handleTriggerScan}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'پشکنینی لۆگەکان...' : 'پشکنینی ئێستا (ML Scan)'}</span>
            </button>

            {/* Simulate Irregular Pattern Button */}
            <div className="relative">
              <button
                onClick={() => setShowSimulateDropdown(!showSimulateDropdown)}
                className="px-3.5 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="تەقاندنەوەی نموونەیی نائاسایی بۆ تاقیکردنەوەی خێرای سیستەم"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>تاقیکردنەوەی مەترسی ▾</span>
              </button>

              {showSimulateDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                    تەقاندنەوەی حالەتی نائاسایی
                  </div>
                  <button
                    onClick={() => {
                      simulateAnomalyPattern('SPLIT_PO');
                      setShowSimulateDropdown(false);
                    }}
                    className="w-full text-right px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition flex items-center justify-between"
                  >
                    <span>دابەشکردنی کڕین (Split PO under $50k)</span>
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => {
                      simulateAnomalyPattern('OFF_HOURS_FINANCE');
                      setShowSimulateDropdown(false);
                    }}
                    className="w-full text-right px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition flex items-center justify-between"
                  >
                    <span>خەرجی شەوانەی دارایی (02:15 AM)</span>
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                  <button
                    onClick={() => {
                      simulateAnomalyPattern('GHOST_WORKER');
                      setShowSimulateDropdown(false);
                    }}
                    className="w-full text-right px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 transition flex items-center justify-between"
                  >
                    <span>ئامادەبوونی ساختە لە دوو شاردا</span>
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monitored Logs */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">لۆگە پشکنراوەکان</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {anomalyStats.totalLogsAnalyzed.toLocaleString()}
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ArrowUpRight className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                <span>+100% داپۆشین</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              سەرجەم کڕینەکان، قەیدەکانی دەفتەری ڕۆژنامە و پەنجەمۆرەکان
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>کۆتا سکان:</span>
            <span>{new Date(anomalyStats.lastScanTimestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Card 2: Active Triggered Anomalies */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">مەترسییە دۆزراوەکان</span>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
                {anomalyAlerts.filter(a => a.status === 'TRIGGERED' || a.status === 'INVESTIGATING').length}
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <span>{anomalyStats.criticalAlertsCount} مەترسی گەورە (Critical)</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {anomalyStats.procurementAnomaliesCount} کڕین
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                {anomalyStats.financialAnomaliesCount} دارایی
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                {anomalyStats.attendanceAnomaliesCount} ئامادەبوون
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[11px] text-rose-700 font-bold">
            <span>پێویستی بە پێداچوونەوەیە</span>
            <ChevronRight className="w-3.5 h-3.5 text-rose-500" />
          </div>
        </div>

        {/* Card 3: Financial Loss Prevented */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">بەفیڕۆدان و زیانی پارێزراو</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                ${(anomalyStats.financialRiskPreventedUSD / 1000).toFixed(1)}k
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>پارێزراوە</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              ڕێگری لە خەرجی نائاسایی و داواکاری کڕینی تەندەرنەکراو
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[11px] text-slate-500 font-bold">
            <span>پاراستنی دارایی هۆلدینگ</span>
            <span className="text-emerald-700 font-mono font-bold">100% Monitored</span>
          </div>
        </div>

        {/* Card 4: Model Confidence */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">متمانەی مۆدێلی ژیری (Confidence)</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold">
                <BrainCircuit className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-black text-purple-700 font-mono">
                {(anomalyStats.modelConfidenceAverage * 100).toFixed(1)}%
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                <span>MAD Z-Score</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              شیکاری چڕیی داتا بەپێی کات، شوێن و ڕەفتاری پێشووی کۆمپانیاکان
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[11px] text-purple-700 font-bold">
            <span>Gemini AI Forensic Ready</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('ALERTS')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'ALERTS'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>هۆشداری و نائاساییەکان ({filteredAlerts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ATTENDANCE_LOGS')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'ATTENDANCE_LOGS'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>لۆگی ئامادەبوونی بایۆمەتری ({attendanceRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ANALYTICS')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'ANALYTICS'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>شیکاری و گرافەکانی فێربوونی ئامێر</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="گەڕان بەدوای هۆشداری، کۆمپانیا یان پڕۆژە..."
            className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'ALERTS' && (
        <div className="space-y-4">
          
          {/* Domain & Severity Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>بوار:</span>
              </span>
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                هەموو بوارەکان ({anomalyAlerts.length})
              </button>
              <button
                onClick={() => setSelectedCategory('PROCUREMENT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === 'PROCUREMENT'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>کڕین و دابینکردن ({anomalyAlerts.filter(a => a.category === 'PROCUREMENT').length})</span>
              </button>
              <button
                onClick={() => setSelectedCategory('FINANCIAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === 'FINANCIAL'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>دارایی و خەرجی ({anomalyAlerts.filter(a => a.category === 'FINANCIAL').length})</span>
              </button>
              <button
                onClick={() => setSelectedCategory('ATTENDANCE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === 'ATTENDANCE'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>ئامادەبوونی کارمەندان ({anomalyAlerts.filter(a => a.category === 'ATTENDANCE').length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">پلەی مەترسی:</span>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none"
              >
                <option value="ALL">هەموو پلەکان</option>
                <option value="CRITICAL">مەترسیداری زۆر (Critical)</option>
                <option value="HIGH">بەرز (High)</option>
                <option value="MEDIUM">مامناوەند</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none"
              >
                <option value="ALL">هەموو دۆخەکان</option>
                <option value="TRIGGERED">دەستنیشانکراو (Active)</option>
                <option value="INVESTIGATING">لەژێر لێکۆڵینەوە</option>
                <option value="RESOLVED">چارەسەرکراو</option>
              </select>
            </div>
          </div>

          {/* Anomaly Cards List */}
          {filteredAlerts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-900">هیچ نائاساییەک لەم بەشەدا بەدی نەکراوە</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                سەرجەم لۆگەکانی کڕین، دارایی، و ئامادەبوون لە چوارچێوەی سنووری ئاسایی و ڕێنماییەکانی هۆلدینگدان.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const isCritical = alert.severity === 'CRITICAL';
                const isResolved = alert.status === 'RESOLVED';

                return (
                  <div
                    key={alert.id}
                    className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-xs transition hover:shadow-md space-y-4 ${
                      isResolved
                        ? 'border-emerald-200 bg-emerald-50/20 opacity-80'
                        : isCritical
                          ? 'border-rose-300 ring-1 ring-rose-300/50'
                          : 'border-amber-200/90'
                    }`}
                  >
                    {/* Header: Badges & Anomaly Score */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                            : alert.severity === 'HIGH'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-yellow-100 text-yellow-900'
                        }`}>
                          {alert.severity} SEVERITY
                        </span>

                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 ${
                          alert.category === 'PROCUREMENT'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : alert.category === 'FINANCIAL'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-purple-50 text-purple-800 border border-purple-200'
                        }`}>
                          {alert.category === 'PROCUREMENT' && <ShoppingCart className="w-3.5 h-3.5" />}
                          {alert.category === 'FINANCIAL' && <Wallet className="w-3.5 h-3.5" />}
                          {alert.category === 'ATTENDANCE' && <Users className="w-3.5 h-3.5" />}
                          <span>{alert.category}</span>
                        </span>

                        <span className="text-[11px] font-bold text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {alert.companyName} {alert.projectName ? `• ${alert.projectName}` : ''}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {alert.algorithmUsed}
                        </span>
                      </div>

                      {/* Anomaly Score Gauge & Status */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">نمرەی نائاسایی (Score):</span>
                          <span className={`text-base font-black font-mono px-2.5 py-0.5 rounded-xl border ${
                            alert.score >= 90
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}>
                            {alert.score}/100
                          </span>
                        </div>

                        <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                          isResolved
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : alert.status === 'INVESTIGATING'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {alert.status === 'RESOLVED' ? 'چارەسەرکراو ✓' : alert.status === 'INVESTIGATING' ? 'لێکۆڵینەوە ⏳' : 'چالاک ⚠️'}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        {alert.titleKu || alert.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {alert.descriptionKu || alert.description}
                      </p>
                    </div>

                    {/* Features Contributing (Z-Score & Deviation Breakdown) */}
                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200/80 pb-1.5">
                        <span className="flex items-center gap-1.5">
                          <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
                          <span>هۆکارە سەرەکییەکانی دەستنیشانکراو بەپێی فێربوونی ئامێر (Contributing Vectors)</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">Z-Score Deviation</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {alert.featuresContributing.map((feat, fIdx) => (
                          <div key={fIdx} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1 text-xs">
                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                              <span>{feat.featureNameKu || feat.featureName}</span>
                              <span className="text-rose-600 font-mono font-black">Z=+{feat.zScore}</span>
                            </div>
                            <div className="flex items-baseline justify-between">
                              <span className="text-slate-900 font-black text-xs font-mono">{feat.observedValue}</span>
                              <span className="text-[10px] text-slate-400">ئاسایی: {feat.expectedRange}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Actions & Executive Buttons */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-slate-700">ڕاسپاردەی خێرا: </span>
                        <span>{alert.recommendedActionsKu?.[0] || alert.recommendedActions[0]}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenAiDiagnosis(alert)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                          <span>شیکاری وردی ژیری دەستکرد (AI Forensic)</span>
                        </button>

                        {!isResolved && (
                          <>
                            <button
                              onClick={() => {
                                const actionName = alert.category === 'PROCUREMENT' 
                                  ? 'Freeze PO & Require Board Review' 
                                  : alert.category === 'ATTENDANCE' 
                                    ? 'Block Biometric Card & Initiate Audit' 
                                    : 'Halt Bank Ledger Transfer';
                                executeAnomalyAction(alert.id, actionName);
                              }}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>بڕیاری بلۆککردن / سزادان</span>
                            </button>

                            <button
                              onClick={() => updateAnomalyStatus(alert.id, 'RESOLVED', 'Manual resolution after review')}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            >
                              چارەسەرکراو ✓
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Attendance Biometric Logs Sub-Tab */}
      {activeSubTab === 'ATTENDANCE_LOGS' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-purple-600" />
                <span>لۆگی ئامادەبوونی بایۆمەتری و پشکنینی کارمەندان</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تۆماری ئامادەبوون لە دەروازە و پڕۆژەکان بە دەستنیشانکردنی کاتی نائاسایی و جووڵەی دووبارە
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                کۆی تۆمارەکان: {attendanceRecords.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-black">
                  <th className="p-3">کارمەند / ئەندازیار</th>
                  <th className="p-3">کۆمپانیا و پڕۆژە</th>
                  <th className="p-3">بەروار و کات</th>
                  <th className="p-3">شوێنی پشکنین</th>
                  <th className="p-3">ئامێری ناسینەوە</th>
                  <th className="p-3">کاتژمێری کار</th>
                  <th className="p-3">دۆخی چاودێری ML</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceRecords.map((rec) => (
                  <tr key={rec.id} className={`hover:bg-slate-50 transition ${rec.anomalyFlag ? 'bg-rose-50/40' : ''}`}>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{rec.employeeName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{rec.employeeRole}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{rec.companyName}</div>
                      <div className="text-[11px] text-blue-600 font-bold">{rec.projectName || 'General Office'}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      <div>{rec.date}</div>
                      <div className="text-[11px] text-slate-500">{rec.checkInTime} - {rec.checkOutTime}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      {rec.siteLocation}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        {rec.deviceType}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {rec.workHours}h
                      {rec.overtimeHours > 0 && (
                        <span className="text-amber-600 text-[11px] block">+{rec.overtimeHours}h over</span>
                      )}
                    </td>
                    <td className="p-3">
                      {rec.anomalyFlag ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>{rec.status}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>ئاسایی</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Sub-Tab */}
      {activeSubTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Anomaly Score Distribution */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">نمرەی نائاسایی (Anomaly Score Distribution)</h3>
              <p className="text-xs text-slate-500">هەر نمرەیەک لەسەرووی ٧٠ مەترسیدارە، و لەسەرووی ٨٥ سنووری سوورە</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartScoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <ReferenceLine y={85} stroke="#E11D48" strokeDasharray="4 4" label={{ value: 'Critical Threshold (85)', fill: '#E11D48', fontSize: 10 }} />
                  <ReferenceLine y={70} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Warning (70)', fill: '#F59E0B', fontSize: 10 }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartScoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 85 ? '#E11D48' : entry.score >= 70 ? '#F59E0B' : '#3B82F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Domain Breakdown */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">دابەشبوونی نائاساییەکان بەپێی بوار</h3>
              <p className="text-xs text-slate-500">ڕێژەی ڕووداوەکان لە کڕین، دارایی، و ئامادەبوون</p>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDistributionData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs font-bold">
              {categoryDistributionData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Forensic Diagnosis & Executive Action Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 uppercase tracking-wider">
                  AI Forensic Examination
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  شیکاری دادوەری ژیری دەستکرد بۆ کێشەکە
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedAlert.titleKu || selectedAlert.title}
                </p>
              </div>

              <button
                onClick={() => setSelectedAlert(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* AI Diagnosis Content */}
            {isAiDiagnosing ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-700">Gemini 3.8 Flash لە شیکاری وردبینی و دۆزینەوەی بەڵگەدایە...</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Executive Hypothesis Box */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-purple-900">
                    <BrainCircuit className="w-4 h-4 text-purple-600" />
                    <span>کورتەی لێکۆڵینەوە و شیکاری مەترسی:</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {selectedAlert.aiForensicReport?.diagnosisTextKu || selectedAlert.rootCauseHypothesisKu || selectedAlert.descriptionKu}
                  </p>
                  {selectedAlert.aiForensicReport?.riskVector && (
                    <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-purple-900">ئاستی دەستوەردان:</span>
                      <span className="font-mono font-bold text-rose-700">{selectedAlert.aiForensicReport.riskVector}</span>
                    </div>
                  )}
                </div>

                {/* Evidence Metrics */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">بەڵگە و نیشاندەرە ئامارییەکان:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] block font-bold">پلەی نائاسایی (Score):</span>
                      <span className="font-mono font-black text-rose-600 text-sm">{selectedAlert.score}/100</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] block font-bold">متمانەی دەستنیشانکردن:</span>
                      <span className="font-mono font-black text-purple-600 text-sm">{(selectedAlert.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Immediate Mitigation Directives */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
                  <span className="text-xs font-bold text-slate-800 block">ڕێنمایی خێرای سەرۆکایەتی هۆلدینگ:</span>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    {(selectedAlert.recommendedActionsKu || selectedAlert.recommendedActions).map((act, aIdx) => (
                      <li key={aIdx}>{act}</li>
                    ))}
                  </ul>
                </div>

                {/* Executive Action Note Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    تێبینی یان بڕیاری خاوەن هۆلدینگ:
                  </label>
                  <input
                    type="text"
                    value={executiveDecisionInput}
                    onChange={(e) => setExecutiveDecisionInput(e.target.value)}
                    placeholder="وەک: ڕاگرتنی دەستبەجێی کڕین و دەستپێکردنی لێکۆڵینەوە لەگەڵ بەڕێوەبەری پڕۆژە..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>چاپکردنی ڕاپۆرت</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        updateAnomalyStatus(selectedAlert.id, 'RESOLVED', executiveDecisionInput);
                        setSelectedAlert(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
                    >
                      پەسەندکردنی بڕیار و چارەسەرکردن ✓
                    </button>
                    <button
                      onClick={() => {
                        executeAnomalyAction(selectedAlert.id, executiveDecisionInput || 'Executive Freeze Directive Enforced');
                        setSelectedAlert(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
                    >
                      بلۆککردنی دەستبەجێ (Freeze)
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
