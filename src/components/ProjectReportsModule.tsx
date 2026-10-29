import React, { useState, useRef } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  Upload,
  Eye,
  FileCheck2,
  Printer,
  Building2,
  Users,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  X,
  FileSignature,
  Download,
  AlertCircle,
  FolderKanban,
  Check,
  Crown,
  Search,
  Filter,
  CalendarRange,
  Layers
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { ProjectPeriodicReport, ProjectReportType, ProjectReportStatus } from '../types/erp';
import { ProjectGanttTimeline } from './ProjectGanttTimeline';

interface ProjectReportsModuleProps {
  initialProjectId?: string;
  onCloseModal?: () => void;
  isEmbedded?: boolean;
}

export const ProjectReportsModule: React.FC<ProjectReportsModuleProps> = ({
  initialProjectId,
  onCloseModal,
  isEmbedded = false
}) => {
  const {
    projects,
    companies,
    projectReports,
    addProjectReport,
    updateProjectReport,
    signProjectReport,
    attachScannedReport,
    submitReportToUpper,
    approveReportByHolding,
    currentUser,
    foreignWorkers
  } = useERP();

  const { t, language } = useLanguage();

  // Active Tab: Gantt Timeline vs Periodic Reports
  const [activeTab, setActiveTab] = useState<'GANTT_TIMELINE' | 'PERIODIC_REPORTS'>('GANTT_TIMELINE');

  // Filters
  const [selectedProjFilter, setSelectedProjFilter] = useState<string>(initialProjectId || 'ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [signingReport, setSigningReport] = useState<ProjectPeriodicReport | null>(null);
  const [scanningReport, setScanningReport] = useState<ProjectPeriodicReport | null>(null);
  const [previewingReport, setPreviewingReport] = useState<ProjectPeriodicReport | null>(null);
  const [approvingReport, setApprovingReport] = useState<ProjectPeriodicReport | null>(null);

  // New Report Form
  const [formProjectId, setFormProjectId] = useState(projects[0]?.id || 'proj-101');
  const [formReportType, setFormReportType] = useState<ProjectReportType>('WEEKLY');
  const [formPeriodLabelKu, setFormPeriodLabelKu] = useState('هەفتەی ٤٢ (٨ تا ١٥ی تشرینی یەکەمی ٢٠٢٦)');
  const [formSummaryKu, setFormSummaryKu] = useState('');
  const [formProgressPct, setFormProgressPct] = useState(60);
  const [formProgressDelta, setFormProgressDelta] = useState(2.5);
  const [formBudgetSpentPeriod, setFormBudgetSpentPeriod] = useState(125000);
  const [formMilestonesKu, setFormMilestonesKu] = useState('تەواوکردنی قۆناغی کۆنکرێتڕێژی نهۆم و بەستنی سیستمەکانی کارەبا\nپشکنینی مەرجەکانی سەلامەتی لە کەمپی نیشتەجێبوونی بیانیەکان');
  const [formChallengesKu, setFormChallengesKu] = useState('پێویستی بە پەسەندکردنی خێرای کەلوپەلی نوێ لەلایەن هۆلدینگ\nئاگادارکردنەوەی بەشی بیانیەکان بۆ نوێکردنەوەی ئیقامەکان');

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [pmSignerName, setPmSignerName] = useState('ئەندازیار ڕێباز ئەحمەد (بەڕێوەبەری پڕۆژە)');

  // Holding approval notes
  const [holdingNotes, setHoldingNotes] = useState('ڕاپۆرتەکە بە وردی پشکنرا و ڕێنماییەکان جێبەجێ کراون. پەسەندکرا.');

  // Filtered reports
  const filteredReports = projectReports.filter((rep) => {
    if (selectedProjFilter !== 'ALL' && rep.projectId !== selectedProjFilter) return false;
    if (selectedTypeFilter !== 'ALL' && rep.reportType !== selectedTypeFilter) return false;
    if (selectedStatusFilter !== 'ALL' && rep.status !== selectedStatusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = rep.reportNumber.toLowerCase().includes(q);
      const matchName = rep.projectName.toLowerCase().includes(q) || (rep.projectNameKu && rep.projectNameKu.includes(q));
      const matchPeriod = rep.periodLabelKu?.toLowerCase().includes(q) || rep.periodLabel.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchPeriod) return false;
    }
    return true;
  });

  const weeklyCount = projectReports.filter(r => r.reportType === 'WEEKLY').length;
  const monthlyCount = projectReports.filter(r => r.reportType === 'MONTHLY').length;
  const submittedCount = projectReports.filter(r => r.status === 'SUBMITTED_TO_UPPER_MANAGEMENT').length;
  const approvedCount = projectReports.filter(r => r.status === 'APPROVED_BY_HOLDING').length;

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === formProjectId) || projects[0];
    const comp = companies.find(c => c.id === proj?.companyId) || companies[0];

    const milestones = formMilestonesKu
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const challenges = formChallengesKu
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    // Count project foreign workers
    const foreignWorkersInProj = foreignWorkers.filter(w => (w.projectId === proj?.id || w.assignedProjectId === proj?.id)).length;

    addProjectReport({
      reportNumber: `REP-${formReportType === 'WEEKLY' ? 'WK' : 'MO'}-2026-${Math.floor(100 + Math.random() * 900)}`,
      projectId: proj?.id || 'proj-101',
      projectName: proj?.name || 'Project Name',
      projectNameKu: proj?.nameKu || proj?.name,
      companyId: comp?.id || 'comp-1',
      companyName: comp?.nameKu || comp?.name,
      reportType: formReportType,
      periodLabel: formPeriodLabelKu,
      periodLabelKu: formPeriodLabelKu,
      dateCreated: new Date().toISOString().split('T')[0],
      executiveSummaryKu: formSummaryKu || `ڕاپۆرتی کارەکانی پڕۆژەی ${proj?.nameKu || proj?.name} بۆ ماوەی دیاریکراو بە دەستکەوتی بەرچاو.`,
      progressPercentage: Number(formProgressPct),
      progressDelta: Number(formProgressDelta),
      budgetSpentThisPeriodUSD: Number(formBudgetSpentPeriod),
      totalBudgetSpentUSD: (proj?.spentUSD || 0) + Number(formBudgetSpentPeriod),
      engineersCount: proj?.engineersCount || 12,
      localWorkersCount: proj?.workersCount || 85,
      foreignWorkersCount: foreignWorkersInProj || 4,
      hseIncidentsCount: 0,
      keyMilestonesKu: milestones.length > 0 ? milestones : ['پێشکەوتنی قۆناغەکانی کارکردن'],
      challengesAndNeedsKu: challenges.length > 0 ? challenges : ['پێویستی بە پەسەندکردنی داواکارییەکان لەلایەن هۆلدینگ'],
      projectManagerName: proj?.manager || 'بەڕێوەبەری پڕۆژە',
      isPmSigned: false,
      isScanVerified: false,
      status: 'DRAFT',
    });

    setIsCreateOpen(false);
    setFormSummaryKu('');
  };

  // Canvas Drawing for PM Signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSaveSignature = () => {
    if (!signingReport) return;
    const canvas = canvasRef.current;
    let dataUrl = '';
    if (canvas && hasDrawn) {
      dataUrl = canvas.toDataURL('image/png');
    }
    signProjectReport(signingReport.id, pmSignerName, dataUrl);
    setSigningReport(null);
  };

  const handleAttachScan = (repId: string, customName?: string) => {
    const scanName = customName || `SIGNED_SCAN_${Date.now().toString().slice(-4)}.pdf`;
    const mockScanUrl = `scanned_verified_document_${Date.now().toString().slice(-4)}.pdf`;
    attachScannedReport(repId, mockScanUrl, scanName);
    setScanningReport(null);
  };

  const handleConfirmApproval = () => {
    if (!approvingReport) return;
    approveReportByHolding(
      approvingReport.id,
      currentUser.name || 'خاوەنی هۆلدینگ (Holding Owner)',
      holdingNotes
    );
    setApprovingReport(null);
  };

  const getStatusBadge = (status: ProjectReportStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            ڕەشنووس (چاوەڕوانی واژۆ)
          </span>
        );
      case 'PM_SIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
            <FileSignature className="w-3.5 h-3.5 text-amber-600" />
            واژۆکرا لەلایەن PM (پێویستی بە سکانە)
          </span>
        );
      case 'SCANNED_AND_ATTACHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-300">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            سکانکراوە و هاوپێچە (ئامادەی ناردن)
          </span>
        );
      case 'SUBMITTED_TO_UPPER_MANAGEMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-300 animate-pulse">
            <Send className="w-3.5 h-3.5 text-indigo-600" />
            نێردراوە بۆ سەرەوە (چاوەڕوانی پەسەندکردن)
          </span>
        );
      case 'APPROVED_BY_HOLDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            پەسەندکرا لەلایەن خاوەنی هۆلدینگ
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Module View Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('GANTT_TIMELINE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
              activeTab === 'GANTT_TIMELINE'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>
              {language === 'ku'
                ? 'مخطەتی گانت و خشتەی کاتی پڕۆژەکان'
                : language === 'ar'
                  ? 'مخطط جانت والجدول الزمني للمشاريع الفرعية'
                  : 'Sub-Projects Gantt Timeline'}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'GANTT_TIMELINE' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {projects.reduce((acc, p) => acc + (p.subProjects?.length || 0), 0)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PERIODIC_REPORTS')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
              activeTab === 'PERIODIC_REPORTS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>
              {language === 'ku'
                ? 'ڕاپۆرتە خولییە فەرمییەکان و سکان'
                : language === 'ar'
                  ? 'التقارير الدورية الرسمية والوثائق'
                  : 'Periodic Reports & Scans'}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'PERIODIC_REPORTS' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {projectReports.length}
            </span>
          </button>
        </div>

        {onCloseModal && (
          <button
            onClick={onCloseModal}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* View 1: Gantt Chart and Sub-Projects Timeline */}
      {activeTab === 'GANTT_TIMELINE' && (
        <ProjectGanttTimeline
          selectedProjectId={selectedProjFilter !== 'ALL' ? selectedProjFilter : undefined}
          onOpenReportCreate={(projId) => {
            setFormProjectId(projId);
            setIsCreateOpen(true);
            setActiveTab('PERIODIC_REPORTS');
          }}
        />
      )}

      {/* View 2: Periodic Written Reports & Physical Scans Workflow */}
      {activeTab === 'PERIODIC_REPORTS' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
                    سیستەمی فەرمی ڕاپۆرتەکانی پڕۆژە
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                    واژۆ + سکان + بەستنەوە بە هۆلدینگ
                  </span>
                </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ڕاپۆرتە خولییەکانی پڕۆژەکان (هەفتانە و مانگانە)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              ئامادەکردنی ڕاپۆرتی بەردەوامی هەفتانە و مانگانە بە واژۆی فەرمی بەڕێوەبەری پڕۆژە (PM) و بەڵگەنامەی سکانکراوی واژۆکراوی دەستی، ئنجا ناردنی ڕاستەوخۆ بۆ بەڕێوەبەری گشتی و خاوەنی هۆلدینگ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ئامادەکردنی ڕاپۆرتی نوێ</span>
            </button>
            {onCloseModal && (
              <button
                onClick={onCloseModal}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[11px] text-slate-400 font-bold block">کۆی ڕاپۆرتەکان</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{projectReports.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[11px] text-blue-300 font-bold block">ڕاپۆرتی هەفتانە</span>
            <span className="text-xl font-extrabold text-blue-200 mt-0.5 block">{weeklyCount}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[11px] text-purple-300 font-bold block">ڕاپۆرتی مانگانە</span>
            <span className="text-xl font-extrabold text-purple-200 mt-0.5 block">{monthlyCount}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[11px] text-emerald-300 font-bold block">پەسەندکراوی هۆلدینگ</span>
            <span className="text-xl font-extrabold text-emerald-300 mt-0.5 block">{approvedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Project Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedProjFilter}
              onChange={(e) => setSelectedProjFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs"
            >
              <option value="ALL">هەموو پڕۆژەکان ({projects.length})</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.nameKu || p.name}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs"
            >
              <option value="ALL">هەموو جۆرەکان (هەفتانە و مانگانە)</option>
              <option value="WEEKLY">ڕاپۆرتی هەفتانە</option>
              <option value="MONTHLY">ڕاپۆرتی مانگانە</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs"
            >
              <option value="ALL">سەرجەم دۆخەکان</option>
              <option value="DRAFT">ڕەشنووس</option>
              <option value="PM_SIGNED">واژۆکراوی PM</option>
              <option value="SCANNED_AND_ATTACHED">سکانکراوە و هاوپێچە</option>
              <option value="SUBMITTED_TO_UPPER_MANAGEMENT">نێردراوە بۆ سەرەوە</option>
              <option value="APPROVED_BY_HOLDING">پەسەندکراوی هۆلدینگ</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="گەڕان بەپێی ژمارەی ڕاپۆرت، پڕۆژە..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500"
          />
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">هیچ ڕاپۆرتێک نەدۆزرایەوە</h3>
          <p className="text-xs text-slate-400 mt-1">
            دەتوانیت یەکەمین ڕاپۆرتی هەفتانە یان مانگانەی پڕۆژە لێرەوە دروستبکەیت.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            دروستکردنی ڕاپۆرت
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const proj = projects.find(p => p.id === report.projectId);
            const comp = companies.find(c => c.id === report.companyId);

            return (
              <div
                key={report.id}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-5 sm:p-6 shadow-xs transition duration-200 space-y-4"
              >
                {/* Top Row: Title, Badges, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                      report.reportType === 'WEEKLY'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {report.reportType === 'WEEKLY' ? 'هەفتانە' : 'مانگانە'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          {report.reportNumber}
                        </span>
                        <h2 className="text-base font-black text-slate-900">
                          {report.projectNameKu || report.projectName}
                        </h2>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-600">{report.periodLabelKu}</span>
                        <span>•</span>
                        <span>بەروار: {report.dateCreated}</span>
                        <span>•</span>
                        <span>کۆمپانیا: {report.companyName || comp?.nameKu}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {getStatusBadge(report.status)}
                  </div>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">ڕێژەی پێشکەوتن</span>
                    <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      {report.progressPercentage}%
                      <span className="text-[10px] text-emerald-600 font-bold">(+{report.progressDelta}%)</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">خەرجی ئەم خولە</span>
                    <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">
                      ${report.budgetSpentThisPeriodUSD?.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">ئەندازیاران و دەستەی تەکنیکی</span>
                    <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">
                      {report.engineersCount} ئەندازیار
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">کارمەندانی ناوخۆ و بیانی</span>
                    <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">
                      {report.localWorkersCount} ناوخۆ / <span className="text-purple-700 font-bold">{report.foreignWorkersCount} بیانی</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">سەلامەتی HSE</span>
                    <span className="text-sm font-extrabold text-emerald-700 mt-0.5 block">
                      {report.hseIncidentsCount === 0 ? 'سفر ڕووداو (پارێزراو)' : `${report.hseIncidentsCount} ڕووداو`}
                    </span>
                  </div>
                </div>

                {/* Executive Summary & Milestones */}
                <div className="text-xs text-slate-600 space-y-2">
                  <p className="bg-blue-50/40 p-3 rounded-xl border border-blue-100/60 leading-relaxed font-medium">
                    <strong className="text-blue-900 font-black">پوختەی کارەکان: </strong>
                    {report.executiveSummaryKu}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <h4 className="text-[11px] font-extrabold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        دەستکەوتە سەرەکییەکان:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                        {report.keyMilestonesKu.map((m, idx) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                      <h4 className="text-[11px] font-extrabold text-amber-900 mb-1.5 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                        ئاڵنگاری و پێداویستییەکان لە هۆلدینگ:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-amber-800 text-[11px]">
                        {report.challengesAndNeedsKu.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Workflow Status Bar: PM Signature & Scan Verification */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 p-5 rounded-b-3xl">
                  {/* Left: Sign & Scan indicators */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* PM Signature Status */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      report.isPmSigned
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      <FileSignature className="w-4 h-4" />
                      <span>
                        {report.isPmSigned ? `واژۆکراوە لەلایەن: ${report.projectManagerName}` : 'چاوەڕوانی واژۆی بەڕێوەبەری پڕۆژەیە'}
                      </span>
                    </div>

                    {/* Scanned Physical Copy Status */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      report.isScanVerified
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      <Upload className="w-4 h-4" />
                      <span>
                        {report.isScanVerified
                          ? `نوسراوی فەرمی سکانکراو هاوپێچە (${report.scannedFileName || 'PDF'})`
                          : 'نوسراوی سکانکراو هاوپێچ نەکراوە'}
                      </span>
                    </div>

                    {/* Holding Owner Status */}
                    {report.holdingApprovedBy && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-800 border border-purple-300">
                        <Crown className="w-4 h-4 text-amber-600" />
                        <span>پەسەندکرا لەلایەن: {report.holdingApprovedBy}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Step 1: Sign Button */}
                    {!report.isPmSigned && (
                      <button
                        onClick={() => setSigningReport(report)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
                      >
                        <FileSignature className="w-3.5 h-3.5" />
                        <span>واژۆکردنی بەڕێوەبەری پڕۆژە</span>
                      </button>
                    )}

                    {/* Step 2: Upload Scan Button */}
                    {report.isPmSigned && !report.isScanVerified && (
                      <button
                        onClick={() => setScanningReport(report)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>هاوپێچکردنی سکانی واژۆکراو</span>
                      </button>
                    )}

                    {/* Step 3: Send Upward Button */}
                    {report.isPmSigned && report.isScanVerified && report.status !== 'SUBMITTED_TO_UPPER_MANAGEMENT' && report.status !== 'APPROVED_BY_HOLDING' && (
                      <button
                        onClick={() => submitReportToUpper(report.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>ناردن بۆ سەرەوە (GM و خاوەنی هۆلدینگ)</span>
                      </button>
                    )}

                    {/* Holding Owner Approval Button */}
                    {report.status === 'SUBMITTED_TO_UPPER_MANAGEMENT' && (
                      <button
                        onClick={() => setApprovingReport(report)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>پەسەندکردنی خاوەنی هۆلدینگ</span>
                      </button>
                    )}

                    {/* Preview Scan Document Button */}
                    <button
                      onClick={() => setPreviewingReport(report)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>بینینی بەڵگەنامەی فەرمی</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </div>
      )}

      {/* MODAL 1: Create Periodic Report Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">ئامادەکردنی ڕاپۆرتی خولیی پڕۆژە</h3>
                  <p className="text-xs text-slate-500">ڕاپۆرتی هەفتانە یان مانگانەی بەرەوپێشچوون بە واژۆ و سکانی فەرمی</p>
                </div>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">دیاریکردنی پڕۆژە *</label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.nameKu || p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">جۆری ڕاپۆرت *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormReportType('WEEKLY')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        formReportType === 'WEEKLY'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      ڕاپۆرتی هەفتانە
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormReportType('MONTHLY')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        formReportType === 'MONTHLY'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      ڕاپۆرتی مانگانە
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ناونیشانی ماوە (خول) *</label>
                <input
                  type="text"
                  value={formPeriodLabelKu}
                  onChange={(e) => setFormPeriodLabelKu(e.target.value)}
                  placeholder="وەک: هەفتەی ٤٢ (٨ تا ١٥ی تشرینی یەکەمی ٢٠٢٦) یان مانگی ئەیلوول"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ڕێژەی گشتی پێشکەوتن (%)</label>
                  <input
                    type="number"
                    value={formProgressPct}
                    onChange={(e) => setFormProgressPct(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">پێشکەوتنی ئەم خولە (+%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formProgressDelta}
                    onChange={(e) => setFormProgressDelta(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">خەرجی ئەم خولە (USD)</label>
                  <input
                    type="number"
                    value={formBudgetSpentPeriod}
                    onChange={(e) => setFormBudgetSpentPeriod(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">پوختەی دەستکەوت و کارەکانی ئەنجامدراو *</label>
                <textarea
                  rows={3}
                  value={formSummaryKu}
                  onChange={(e) => setFormSummaryKu(e.target.value)}
                  placeholder="ڕوونکردنەوەی کارە تەواوکراوەکانی بیناسازی، میکانیکی، سەلامەتی و نیشتەجێبوونی بیانیەکان..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">دەستکەوتە سەرەکییەکان (هەر دێڕێک خاڵێک)</label>
                  <textarea
                    rows={2}
                    value={formMilestonesKu}
                    onChange={(e) => setFormMilestonesKu(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">داواکاری لە هۆلدینگ (هەر دێڕێک خاڵێک)</label>
                  <textarea
                    rows={2}
                    value={formChallengesKu}
                    onChange={(e) => setFormChallengesKu(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  تۆمارکردنی ڕەشنووسی ڕاپۆرت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Signature Modal (PM Sign off with signature canvas) */}
      {signingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">واژۆی فەرمی بەڕێوەبەری پڕۆژە (PM)</h3>
              </div>
              <button onClick={() => setSigningReport(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              واژۆکردنی فەرمی ڕاپۆرتی <strong className="text-slate-800">{signingReport.reportNumber}</strong> بۆ پڕۆژەی{' '}
              <strong className="text-slate-800">{signingReport.projectNameKu || signingReport.projectName}</strong>.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">ناوی واژۆکەر (بەڕێوەبەری پڕۆژە):</label>
              <input
                type="text"
                value={pmSignerName}
                onChange={(e) => setPmSignerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">دەستی خۆت بە ماوس یا تاچ لەم چوارچێوەیەدا بنووسە:</label>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[11px] text-rose-600 hover:underline font-bold"
                >
                  سڕینەوەی واژۆ
                </button>
              </div>

              <div className="border-2 border-dashed border-blue-300 rounded-2xl bg-blue-50/20 overflow-hidden flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="cursor-crosshair bg-white w-full h-[150px]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                یان دەتوانیت ڕاستەوخۆ بە مۆری فەرمی پڕۆژە پەسەندی بکەیت.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSigningReport(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                پاشگەزبوونەوە
              </button>
              <button
                type="button"
                onClick={handleSaveSignature}
                className="px-5 py-2.5 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>پەسەندکردن و جێبەجێکردنی واژۆ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Scanned Paper Upload Modal */}
      {scanningReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">هاوپێچکردنی نوسراوی سکانکراوی دەستی</h3>
              </div>
              <button onClick={() => setScanningReport(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              ڕاپۆرتی چاپکراوی پڕۆژە دوای واژۆکردنی فەرمی، سکان بکە و وێنە یان PDF ـەکەی لێرە دابنێ بۆ ئەوەی ڕەوانەی سەرەوەی خۆتان بکرێت.
            </p>

            <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-6 text-center bg-indigo-50/20 space-y-3">
              <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
              <div>
                <span className="text-xs font-extrabold text-indigo-900 block">فایلی سکانکراوی واژۆکراو دابنێ (PDF / Image)</span>
                <span className="text-[11px] text-slate-400">قەبارەی پەسەندکراو تا 10MB بە مۆری فەرمی پڕۆژە</span>
              </div>
              <input
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                id="file-scan-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleAttachScan(scanningReport.id, file.name);
                  }
                }}
              />
              <label
                htmlFor="file-scan-upload"
                className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition"
              >
                هەڵبژاردنی فایل لە کۆمپیوتەر
              </label>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-700 block">یان دەستبەجێ بە سیستەمی سکانی ئۆتۆماتیکی هاوپێچی بکە:</span>
              <button
                type="button"
                onClick={() => handleAttachScan(scanningReport.id, `${scanningReport.reportNumber}_SIGNED_OFFICIAL_SCAN.pdf`)}
                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition cursor-pointer"
              >
                تەواوکردنی سکانی فەرمی بە بارکۆد و مۆری کۆمپانیا
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: High-Res Scanned Document & Letterhead Preview */}
      {previewingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">
                  بەڵگەنامەی فەرمی سکانکراوی ڕاپۆرت ({previewingReport.reportNumber})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>چاپکردن (Print)</span>
                </button>
                <button onClick={() => setPreviewingReport(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Letterhead Scanned Document Mockup */}
            <div className="border border-slate-300 rounded-2xl p-8 bg-amber-50/10 shadow-inner relative space-y-6 text-slate-800">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                <span className="text-7xl font-black text-slate-900 rotate-[-25deg]">SAS4ERP HOLDING</span>
              </div>

              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h4 className="text-lg font-black text-slate-900">گروپی کۆمپانیاکانی هۆلدینگ</h4>
                  <p className="text-xs font-bold text-slate-600">بەڕێوەبەرایەتی باڵای جێبەجێکردن و کۆنترۆڵی پڕۆژەکان</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Holding Directorate for Civil & Mega Projects</p>
                </div>
                <div className="text-left font-mono text-xs text-slate-700 space-y-0.5">
                  <div className="font-black text-slate-900">No: {previewingReport.reportNumber}</div>
                  <div>Date: {previewingReport.dateCreated}</div>
                  <div className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                    CONFIDENTIAL & OFFICIAL
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2 bg-slate-100 rounded-xl border border-slate-200">
                <h3 className="text-base font-black text-slate-900">
                  {previewingReport.reportType === 'WEEKLY' ? 'ڕاپۆرتی فەرمی هەفتانە' : 'ڕاپۆرتی فەرمی مانگانە'} - {previewingReport.projectNameKu || previewingReport.projectName}
                </h3>
                <p className="text-xs font-semibold text-slate-600">{previewingReport.periodLabelKu}</p>
              </div>

              {/* Body */}
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-extrabold text-slate-900 block mb-1">پوختەی ئەندازیاری و جێبەجێکردن:</span>
                  <p className="text-slate-700">{previewingReport.executiveSummaryKu}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-slate-200 text-center font-bold">
                  <div>
                    <span className="text-[10px] text-slate-500 block">پێشکەوتنی گشتی</span>
                    <span className="text-sm text-slate-900">{previewingReport.progressPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">خەرجی ئەم خولە</span>
                    <span className="text-sm text-slate-900">${previewingReport.budgetSpentThisPeriodUSD?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ژمارەی کارمەندی بیانی</span>
                    <span className="text-sm text-purple-700">{previewingReport.foreignWorkersCount} بیانی (لە کەمپ)</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-extrabold text-slate-900 block mb-1">دەستکەوتە تۆمارکراوەکان:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                    {previewingReport.keyMilestonesKu.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Signatures & Stamps Footer */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t-2 border-slate-900 mt-6 text-xs">
                {/* PM Signature Stamp */}
                <div className="border border-blue-200 bg-blue-50/40 p-4 rounded-2xl relative">
                  <span className="font-black text-slate-900 block">واژۆ و مۆری بەڕێوەبەری پڕۆژە:</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">{previewingReport.projectManagerName}</p>

                  <div className="mt-3 h-14 flex items-center justify-center">
                    {previewingReport.pmSignatureDataUrl ? (
                      <img src={previewingReport.pmSignatureDataUrl} alt="PM Signature" className="max-h-12 object-contain" />
                    ) : (
                      <div className="font-serif italic font-bold text-blue-900 text-sm border-b-2 border-blue-900 pb-1">
                        {previewingReport.projectManagerName} - VERIFIED SIGNATURE
                      </div>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-400 text-center font-mono mt-1">
                    Stamp ID: PM-SAS-CERT-{previewingReport.id}
                  </div>
                </div>

                {/* Holding Approval Stamp */}
                <div className="border border-purple-200 bg-purple-50/40 p-4 rounded-2xl relative">
                  <span className="font-black text-slate-900 block">پەسەندکردنی خاوەنی هۆلدینگ:</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {previewingReport.holdingApprovedBy || 'چاوەڕوانی پەسەندکردنی کۆتاییە'}
                  </p>

                  <div className="mt-3 h-14 flex items-center justify-center">
                    {previewingReport.holdingApprovedBy ? (
                      <div className="w-16 h-16 rounded-full border-4 border-emerald-600 flex flex-col items-center justify-center rotate-[-12deg] text-emerald-800 font-black text-[9px] text-center shadow-xs">
                        <span>HOLDING</span>
                        <span className="text-[11px]">👑 APPROVED</span>
                        <span>OFFICIAL</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">چاوەڕوانی واژۆ و مۆری سەرۆکایەتی</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Holding Owner Approval Modal */}
      {approvingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-slate-900">پەسەندکردنی فەرمی ڕاپۆرت لەلایەن خاوەنی هۆلدینگ</h3>
              </div>
              <button onClick={() => setApprovingReport(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              ڕاپۆرتی <strong className="text-slate-900">{approvingReport.reportNumber}</strong> بە سەرکەوتوویی واژۆکراوە و بەڵگەنامەی سکانکراوی هاوپێچە. بە پەسەندکردنی لەلایەن خاوەنی هۆلدینگەوە، دەچێتە ناو مێژووی پەسەندکراوەکانی گروپی کۆمپانیاکان.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">تێبینی یان دەستخۆشی سەرۆکی هۆلدینگ:</label>
              <textarea
                rows={3}
                value={holdingNotes}
                onChange={(e) => setHoldingNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApprovingReport(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                پاشگەزبوونەوە
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="px-5 py-2.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>پەسەندکردنی فەرمی و لێدانی مۆری هۆلدینگ</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
