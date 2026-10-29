import React, { useState, useMemo } from 'react';
import {
  CalendarRange,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  Building2,
  DollarSign,
  Users,
  Eye,
  Edit3,
  Trash2,
  Printer,
  SlidersHorizontal,
  FolderKanban,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  FileText,
  Info,
  Maximize2
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { SubProject, SubProjectPhase, Project } from '../types/erp';

interface ProjectGanttTimelineProps {
  selectedProjectId?: string;
  onOpenReportCreate?: (projectId: string) => void;
}

export const ProjectGanttTimeline: React.FC<ProjectGanttTimelineProps> = ({
  selectedProjectId: initialSelectedProject,
  onOpenReportCreate
}) => {
  const { projects, companies, addSubProject, updateSubProject, deleteSubProject } = useERP();
  const { t, language, isRtl } = useLanguage();

  // Filters & View state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('ALL');
  const [selectedProjFilter, setSelectedProjFilter] = useState<string>(initialSelectedProject || 'ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'GANTT' | 'TABLE' | 'ROADMAP'>('GANTT');
  const [zoomScale, setZoomScale] = useState<'MONTHLY' | 'QUARTERLY'>('MONTHLY');
  const [isGroupedByProject, setIsGroupedByProject] = useState<boolean>(true);
  const [collapsedProjects, setCollapsedProjects] = useState<Record<string, boolean>>({});

  // Modals state
  const [selectedSubProject, setSelectedSubProject] = useState<{ sub: SubProject; parent: Project } | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubProject, setEditingSubProject] = useState<{ sub: SubProject; parent: Project } | null>(null);

  // New subproject form state
  const [formProjectId, setFormProjectId] = useState<string>(projects[0]?.id || 'proj-101');
  const [formName, setFormName] = useState('');
  const [formNameKu, setFormNameKu] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formPhase, setFormPhase] = useState<SubProjectPhase>('CONCRETE_SUPERSTRUCTURE');
  const [formStartDate, setFormStartDate] = useState('2026-03-01');
  const [formEndDate, setFormEndDate] = useState('2026-11-30');
  const [formProgress, setFormProgress] = useState(15);
  const [formBudgetUSD, setFormBudgetUSD] = useState(500000);
  const [formSpentUSD, setFormSpentUSD] = useState(75000);
  const [formManager, setFormManager] = useState('ئەندازیار ئەحمەد سەعید');
  const [formManagerPhone, setFormManagerPhone] = useState('+964 750 334 7711');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'COMPLETED' | 'DELAYED' | 'PLANNING' | 'ON_HOLD'>('ACTIVE');
  const [formCriticalPath, setFormCriticalPath] = useState(false);
  const [formNotesKu, setFormNotesKu] = useState('');

  // Editing state
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'COMPLETED' | 'DELAYED' | 'PLANNING' | 'ON_HOLD'>('ACTIVE');
  const [editSpentUSD, setEditSpentUSD] = useState(0);
  const [editNotesKu, setEditNotesKu] = useState('');

  // Collect all sub-projects across relevant projects
  const allSubProjectsWithParent = useMemo(() => {
    const list: { sub: SubProject; parent: Project }[] = [];
    projects.forEach(proj => {
      (proj.subProjects || []).forEach(sub => {
        list.push({ sub, parent: proj });
      });
    });
    return list;
  }, [projects]);

  // Filtered sub-projects
  const filteredSubProjects = useMemo(() => {
    return allSubProjectsWithParent.filter(({ sub, parent }) => {
      if (selectedCompanyId !== 'ALL' && parent.companyId !== selectedCompanyId) return false;
      if (selectedProjFilter !== 'ALL' && parent.id !== selectedProjFilter) return false;
      if (selectedStatusFilter !== 'ALL' && sub.status !== selectedStatusFilter) return false;
      if (selectedPhaseFilter !== 'ALL' && sub.phase !== selectedPhaseFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = sub.name.toLowerCase().includes(q) ||
          (sub.nameKu && sub.nameKu.toLowerCase().includes(q)) ||
          (sub.nameAr && sub.nameAr.toLowerCase().includes(q));
        const matchProj = parent.name.toLowerCase().includes(q) ||
          (parent.nameKu && parent.nameKu.toLowerCase().includes(q));
        const matchMgr = (sub.manager || '').toLowerCase().includes(q);
        if (!matchName && !matchProj && !matchMgr) return false;
      }
      return true;
    });
  }, [allSubProjectsWithParent, selectedCompanyId, selectedProjFilter, selectedStatusFilter, selectedPhaseFilter, searchQuery]);

  // Group sub-projects by project for hierarchical Gantt view
  const groupedProjects = useMemo(() => {
    const groups: { project: Project; subProjects: SubProject[] }[] = [];
    projects.forEach(proj => {
      if (selectedCompanyId !== 'ALL' && proj.companyId !== selectedCompanyId) return;
      if (selectedProjFilter !== 'ALL' && proj.id !== selectedProjFilter) return;

      const matchingSubs = (proj.subProjects || []).filter(sub => {
        if (selectedStatusFilter !== 'ALL' && sub.status !== selectedStatusFilter) return false;
        if (selectedPhaseFilter !== 'ALL' && sub.phase !== selectedPhaseFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = sub.name.toLowerCase().includes(q) ||
            (sub.nameKu && sub.nameKu.toLowerCase().includes(q)) ||
            (sub.nameAr && sub.nameAr.toLowerCase().includes(q));
          const matchMgr = (sub.manager || '').toLowerCase().includes(q);
          if (!matchName && !matchMgr) return false;
        }
        return true;
      });

      if (matchingSubs.length > 0 || (selectedStatusFilter === 'ALL' && selectedPhaseFilter === 'ALL' && !searchQuery)) {
        groups.push({
          project: proj,
          subProjects: matchingSubs
        });
      }
    });
    return groups;
  }, [projects, selectedCompanyId, selectedProjFilter, selectedStatusFilter, selectedPhaseFilter, searchQuery]);

  // Overall Timeline Bounds (Min Start & Max Target Date)
  const timelineBounds = useMemo(() => {
    let minTime = new Date('2024-10-01').getTime();
    let maxTime = new Date('2027-12-31').getTime();

    allSubProjectsWithParent.forEach(({ sub }) => {
      if (sub.startDate) {
        const tStart = new Date(sub.startDate).getTime();
        if (!isNaN(tStart) && tStart < minTime) minTime = tStart;
      }
      if (sub.targetCompletionDate) {
        const tEnd = new Date(sub.targetCompletionDate).getTime();
        if (!isNaN(tEnd) && tEnd > maxTime) maxTime = tEnd;
      }
    });

    const minDate = new Date(minTime);
    minDate.setDate(1);
    const maxDate = new Date(maxTime);
    maxDate.setMonth(maxDate.getMonth() + 1);
    maxDate.setDate(0);

    return {
      minDate,
      maxDate,
      totalDurationMs: maxDate.getTime() - minDate.getTime()
    };
  }, [allSubProjectsWithParent]);

  // Generate Month Columns for Timeline Header
  const timeColumns = useMemo(() => {
    const cols: { key: string; label: string; year: number; month: number; startMs: number; endMs: number }[] = [];
    const current = new Date(timelineBounds.minDate);
    const end = new Date(timelineBounds.maxDate);

    while (current <= end) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const monthStart = new Date(year, month, 1).getTime();
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59).getTime();

      const monthNamesKu = [
        'کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران',
        'تەممووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'
      ];
      const monthNamesAr = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      const monthNamesEn = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];

      const label = language === 'ku'
        ? `${monthNamesKu[month]} ${year}`
        : language === 'ar'
          ? `${monthNamesAr[month]} ${year}`
          : `${monthNamesEn[month]} ${year}`;

      cols.push({
        key: `${year}-${month}`,
        label,
        year,
        month,
        startMs: monthStart,
        endMs: monthEnd
      });

      current.setMonth(current.getMonth() + 1);
    }
    return cols;
  }, [timelineBounds, language]);

  // Quarterly aggregated columns if zoom is quarterly
  const quarterColumns = useMemo(() => {
    const quarters: { key: string; label: string; year: number; q: number; startMs: number; endMs: number }[] = [];
    const startYear = timelineBounds.minDate.getFullYear();
    const endYear = timelineBounds.maxDate.getFullYear();

    for (let yr = startYear; yr <= endYear; yr++) {
      for (let q = 1; q <= 4; q++) {
        const startM = (q - 1) * 3;
        const endM = startM + 2;
        const startMs = new Date(yr, startM, 1).getTime();
        const endMs = new Date(yr, endM + 1, 0, 23, 59, 59).getTime();
        quarters.push({
          key: `${yr}-Q${q}`,
          label: `${yr} Q${q}`,
          year: yr,
          q,
          startMs,
          endMs
        });
      }
    }
    return quarters;
  }, [timelineBounds]);

  // Current today marker position percentage
  const todayMs = new Date().getTime();
  const todayPercentage = useMemo(() => {
    const { minDate, totalDurationMs } = timelineBounds;
    const diff = todayMs - minDate.getTime();
    if (diff < 0) return 0;
    if (diff > totalDurationMs) return 100;
    return (diff / totalDurationMs) * 100;
  }, [todayMs, timelineBounds]);

  // Helper to get bar position & width percentage for a sub-project
  const getBarPosition = (startDateStr: string, endDateStr: string) => {
    const { minDate, totalDurationMs } = timelineBounds;
    const startMs = new Date(startDateStr).getTime();
    const endMs = new Date(endDateStr).getTime();

    const left = Math.max(0, Math.min(100, ((startMs - minDate.getTime()) / totalDurationMs) * 100));
    const right = Math.max(0, Math.min(100, ((endMs - minDate.getTime()) / totalDurationMs) * 100));
    const width = Math.max(1.5, right - left);

    return { left, width };
  };

  // Phase badge color and styling
  const getPhaseColor = (phase: SubProjectPhase) => {
    switch (phase) {
      case 'EXCAVATION_FOUNDATION':
        return 'from-amber-500 to-amber-600 border-amber-400 text-amber-950 bg-amber-50';
      case 'CONCRETE_SUPERSTRUCTURE':
        return 'from-blue-600 to-indigo-600 border-blue-400 text-blue-950 bg-blue-50';
      case 'STEEL_FRAMING':
        return 'from-purple-600 to-violet-700 border-purple-400 text-purple-950 bg-purple-50';
      case 'MEP_HVAC_ELECTRICAL':
        return 'from-teal-600 to-cyan-600 border-teal-400 text-teal-950 bg-teal-50';
      case 'FACADE_CLADDING':
        return 'from-sky-500 to-blue-500 border-sky-400 text-sky-950 bg-sky-50';
      case 'INTERIOR_FINISHING':
        return 'from-emerald-500 to-teal-600 border-emerald-400 text-emerald-950 bg-emerald-50';
      case 'INFRASTRUCTURE_ROADS':
        return 'from-slate-600 to-zinc-700 border-slate-400 text-slate-950 bg-slate-50';
      case 'LANDSCAPING':
        return 'from-lime-600 to-emerald-600 border-lime-400 text-lime-950 bg-lime-50';
      case 'TESTING_COMMISSIONING':
        return 'from-rose-500 to-pink-600 border-rose-400 text-rose-950 bg-rose-50';
      case 'FINAL_INSPECTION':
        return 'from-yellow-500 to-amber-600 border-yellow-400 text-yellow-950 bg-yellow-50';
      default:
        return 'from-blue-600 to-indigo-600 border-blue-400 text-blue-950 bg-blue-50';
    }
  };

  const getStatusBadge = (status: SubProject['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {language === 'ku' ? 'تەواوبووە' : language === 'ar' ? 'مكتمل' : 'Completed'}
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3 h-3 text-blue-600" />
            {language === 'ku' ? 'لە جێبەجێکردندایە' : language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}
          </span>
        );
      case 'DELAYED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            {language === 'ku' ? 'دواکەوتوو / هۆشداری' : language === 'ar' ? 'متأخر / تنبيه' : 'Delayed / Alert'}
          </span>
        );
      case 'PLANNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
            <Layers className="w-3 h-3 text-amber-600" />
            {language === 'ku' ? 'پلاندانان' : language === 'ar' ? 'قيد التخطيط' : 'Planning'}
          </span>
        );
      default:
        return null;
    }
  };

  // Toggle Collapse
  const toggleProjectCollapse = (projId: string) => {
    setCollapsedProjects(prev => ({
      ...prev,
      [projId]: !prev[projId]
    }));
  };

  // Calculate high-level metrics
  const totalSubProjectsCount = allSubProjectsWithParent.length;
  const activeSubsCount = allSubProjectsWithParent.filter(s => s.sub.status === 'ACTIVE').length;
  const completedSubsCount = allSubProjectsWithParent.filter(s => s.sub.status === 'COMPLETED').length;
  const delayedSubsCount = allSubProjectsWithParent.filter(s => s.sub.status === 'DELAYED').length;
  const totalAllocatedUSD = allSubProjectsWithParent.reduce((acc, s) => acc + s.sub.budgetUSD, 0);
  const totalSpentUSD = allSubProjectsWithParent.reduce((acc, s) => acc + s.sub.spentUSD, 0);
  const averageProgress = totalSubProjectsCount > 0
    ? Math.round(allSubProjectsWithParent.reduce((acc, s) => acc + s.sub.progressPercentage, 0) / totalSubProjectsCount)
    : 0;

  // Handle Add Sub-project
  const handleCreateSubProject = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === formProjectId) || projects[0];
    if (!proj) return;

    addSubProject(proj.id, {
      name: formName || `Phase ${Date.now().toString().slice(-3)}`,
      nameKu: formNameKu || formName || `قۆناغی جێبەجێکردنی نوێ`,
      nameAr: formNameAr || formName,
      phase: formPhase,
      manager: formManager,
      managerPhone: formManagerPhone,
      startDate: formStartDate,
      targetCompletionDate: formEndDate,
      progressPercentage: Number(formProgress),
      status: formStatus,
      budgetUSD: Number(formBudgetUSD),
      spentUSD: Number(formSpentUSD),
      criticalPath: formCriticalPath,
      notesKu: formNotesKu || 'قۆناغی نوێ زیادکرا بەپێی خشتەی سەرۆکایەتی هۆلدینگ.'
    });

    setIsCreateOpen(false);
    setFormName('');
    setFormNameKu('');
    setFormNameAr('');
    setFormNotesKu('');
  };

  // Handle Open Edit
  const handleOpenEdit = (sub: SubProject, parent: Project) => {
    setEditingSubProject({ sub, parent });
    setEditProgress(sub.progressPercentage);
    setEditStatus(sub.status);
    setEditSpentUSD(sub.spentUSD);
    setEditNotesKu(sub.notesKu || '');
  };

  const handleSaveEdit = () => {
    if (!editingSubProject) return;
    updateSubProject(editingSubProject.parent.id, editingSubProject.sub.id, {
      progressPercentage: Number(editProgress),
      status: editStatus,
      spentUSD: Number(editSpentUSD),
      notesKu: editNotesKu
    });
    setEditingSubProject(null);
    if (selectedSubProject?.sub.id === editingSubProject.sub.id) {
      setSelectedSubProject({
        parent: editingSubProject.parent,
        sub: {
          ...editingSubProject.sub,
          progressPercentage: Number(editProgress),
          status: editStatus,
          spentUSD: Number(editSpentUSD),
          notesKu: editNotesKu
        }
      });
    }
  };

  const handleDelete = (projectId: string, subProjectId: string) => {
    if (confirm(language === 'ku' ? 'ئایا دڵنیایت لە سڕینەوەی ئەم ژێرپڕۆژەیە؟' : 'Are you sure you want to delete this sub-project?')) {
      deleteSubProject(projectId, subProjectId);
      setSelectedSubProject(null);
      setEditingSubProject(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-blue-400" />
                {language === 'ku' ? 'مخطەتی فەرمی جانت و خشتەی کات' : language === 'ar' ? 'مخطط جانت والجدول الزمني التنفيذي' : 'Master Gantt Chart & Schedule'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                {projects.length} {language === 'ku' ? 'پڕۆژەی سەرەکی' : language === 'ar' ? 'مشاريع رئيسية' : 'Parent Projects'} • {totalSubProjectsCount} {language === 'ku' ? 'ژێرپڕۆژە' : language === 'ar' ? 'مشروع فرعي' : 'Sub-Projects'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                {language === 'ku' ? 'چاودێری خاوەنی هۆلدینگ' : language === 'ar' ? 'إشراف مالك المجموعة' : 'Holding Owner Supervision'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {language === 'ku'
                ? 'مخطەتی گانت و بینینی خشتەی کاتی ژێرپڕۆژەکان بە یەک چاو لێکردن'
                : language === 'ar'
                  ? 'مخطط جانت والتصور الزمني لتتبّع مواعيد بدء وانتهاء المشاريع الفرعية'
                  : 'Executive Sub-Projects Gantt Chart & Schedule Timeline'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {language === 'ku'
                ? 'بینینی هاوکاتی ڕێکەوتی دەستپێکردن، کۆتایی، ڕێژەی پێشکەوتن، خەرجی بوودجە و ڕێڕەوی چارەنووسساز (Critical Path) بۆ سەرجەم کۆمپانیاکانی ژێر دەستی هۆلدینگ.'
                : language === 'ar'
                  ? 'رؤية شاملة ودقيقة لتواريخ البدء والانتهاء، نسب الإنجاز، الصرف المالي، والمسار الحرج لجميع المشاريع الفرعية تحت مظلة المجموعة بنظرة واحدة سريعة.'
                  : 'Consolidated visual timeline for Holding Owners showing start and completion dates, progress bars, budget allocation, and critical path milestones.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ku' ? 'زیادکردنی ژێرپڕۆژەی نوێ' : language === 'ar' ? 'إضافة مشروع فرعي جديد' : 'Add Sub-Project'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Print Gantt Chart"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'ku' ? 'چاپکردن' : language === 'ar' ? 'طباعة' : 'Print'}</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] text-slate-400 font-bold block">
              {language === 'ku' ? 'کۆی ژێرپڕۆژەکان' : language === 'ar' ? 'إجمالي المشاريع الفرعية' : 'Total Sub-Projects'}
            </span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{totalSubProjectsCount}</span>
            <span className="text-[10px] text-slate-400">${(totalAllocatedUSD / 1000000).toFixed(1)}M {language === 'ku' ? 'بوودجە' : 'Budget'}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] text-blue-300 font-bold block">
              {language === 'ku' ? 'بەردەوام و چالاک' : language === 'ar' ? 'قيد التنفيذ النشط' : 'Active / In Progress'}
            </span>
            <span className="text-xl font-extrabold text-blue-200 mt-0.5 block">{activeSubsCount}</span>
            <span className="text-[10px] text-blue-300">{((activeSubsCount / (totalSubProjectsCount || 1)) * 100).toFixed(0)}% {language === 'ku' ? 'لە سەرجەم' : 'of total'}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] text-emerald-300 font-bold block">
              {language === 'ku' ? 'تەواوبوو (١٠٠٪)' : language === 'ar' ? 'مكتمل بنجاح' : 'Completed'}
            </span>
            <span className="text-xl font-extrabold text-emerald-300 mt-0.5 block">{completedSubsCount}</span>
            <span className="text-[10px] text-emerald-400 font-mono">100% Verified</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] text-rose-300 font-bold block">
              {language === 'ku' ? 'دواکەوتوو / مەترسی' : language === 'ar' ? 'متأخر / تحت المتابعة' : 'Delayed / At Risk'}
            </span>
            <span className="text-xl font-extrabold text-rose-300 mt-0.5 block">{delayedSubsCount}</span>
            <span className="text-[10px] text-rose-400 font-bold">{delayedSubsCount > 0 ? (language === 'ku' ? 'پێویستی بە بڕیارە' : 'Action Required') : 'Optimal'}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] text-indigo-300 font-bold block">
              {language === 'ku' ? 'تێکڕای پێشکەوتن' : language === 'ar' ? 'متوسط نسبة الإنجاز' : 'Avg Progress'}
            </span>
            <span className="text-xl font-extrabold text-indigo-200 mt-0.5 block">{averageProgress}%</span>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full rounded-full" style={{ width: `${averageProgress}%` }} />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
            <span className="text-[11px] text-amber-300 font-bold block">
              {language === 'ku' ? 'خەرجی کۆکراوە' : language === 'ar' ? 'الإنفاق الفعلي' : 'Spent vs Budget'}
            </span>
            <span className="text-lg font-extrabold text-amber-200 mt-0.5 block">${(totalSpentUSD / 1000000).toFixed(2)}M</span>
            <span className="text-[10px] text-amber-300">{((totalSpentUSD / (totalAllocatedUSD || 1)) * 100).toFixed(0)}% {language === 'ku' ? 'خەرجکراوە' : 'utilized'}</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Subsidiary Company Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs"
              >
                <option value="ALL">{language === 'ku' ? 'سەرجەم کۆمپانیاکانی هۆلدینگ' : language === 'ar' ? 'جميع شركات المجموعة' : 'All Subsidiary Companies'}</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.nameKu || c.name}</option>
                ))}
              </select>
            </div>

            {/* Parent Project Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
              <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedProjFilter}
                onChange={(e) => setSelectedProjFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs"
              >
                <option value="ALL">{language === 'ku' ? 'سەرجەم پڕۆژە سەرەکییەکان' : language === 'ar' ? 'جميع المشاريع الرئيسية' : 'All Parent Projects'} ({projects.length})</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.nameKu || p.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs"
              >
                <option value="ALL">{language === 'ku' ? 'سەرجەم دۆخەکان' : language === 'ar' ? 'كافة الحالات' : 'All Statuses'}</option>
                <option value="ACTIVE">{language === 'ku' ? 'لە جێبەجێکردندا' : language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</option>
                <option value="COMPLETED">{language === 'ku' ? 'تەواوبوو (١٠٠٪)' : language === 'ar' ? 'مكتمل' : 'Completed'}</option>
                <option value="DELAYED">{language === 'ku' ? 'دواکەوتوو / هۆشداری' : language === 'ar' ? 'متأخر' : 'Delayed'}</option>
                <option value="PLANNING">{language === 'ku' ? 'قۆناغی پلاندانان' : language === 'ar' ? 'تخطيط' : 'Planning'}</option>
              </select>
            </div>

            {/* Phase Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedPhaseFilter}
                onChange={(e) => setSelectedPhaseFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs"
              >
                <option value="ALL">{language === 'ku' ? 'سەرجەم قۆناغەکان' : language === 'ar' ? 'كافة المراحل الإنشائية' : 'All Engineering Phases'}</option>
                <option value="EXCAVATION_FOUNDATION">{language === 'ku' ? 'بنکە و هەڵکەندن' : language === 'ar' ? 'الحفر والأساسات' : 'Foundations'}</option>
                <option value="CONCRETE_SUPERSTRUCTURE">{language === 'ku' ? 'پەیکەری کۆنکرێتی' : language === 'ar' ? 'الهيكل الخرساني' : 'Superstructure'}</option>
                <option value="STEEL_FRAMING">{language === 'ku' ? 'پەیکەری پۆڵایین' : language === 'ar' ? 'الهياكل الفولاذية' : 'Steel Framing'}</option>
                <option value="MEP_HVAC_ELECTRICAL">{language === 'ku' ? 'کارەبا و MEP' : language === 'ar' ? 'كهروميكانيك وتكييف' : 'MEP & HVAC'}</option>
                <option value="FACADE_CLADDING">{language === 'ku' ? 'ڕووبەری دەرەوە' : language === 'ar' ? 'الواجهات الخارجية' : 'Facade'}</option>
                <option value="INTERIOR_FINISHING">{language === 'ku' ? 'تەواوکاری ناوەوە' : language === 'ar' ? 'التشطيبات الداخلية' : 'Interior'}</option>
                <option value="INFRASTRUCTURE_ROADS">{language === 'ku' ? 'ژێرخان و ڕێگا' : language === 'ar' ? 'البنية التحتية' : 'Infrastructure'}</option>
                <option value="TESTING_COMMISSIONING">{language === 'ku' ? 'تاقیکردنەوە و ڕادەستکردن' : language === 'ar' ? 'الفحص والتشغيل' : 'Commissioning'}</option>
              </select>
            </div>
          </div>

          {/* Right: Search & View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder={language === 'ku' ? 'گەڕان بۆ ژێرپڕۆژە، ئەندازیار...' : language === 'ar' ? 'بحث عن مشروع فرعي، مهندس...' : 'Search sub-project, manager...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-blue-500"
              />
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
              <button
                onClick={() => setViewMode('GANTT')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'GANTT' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>{language === 'ku' ? 'مخطەتی جانت' : language === 'ar' ? 'مخطط جانت' : 'Gantt'}</span>
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'TABLE' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{language === 'ku' ? 'خشتەی ورد' : language === 'ar' ? 'جدول مفصل' : 'Table'}</span>
              </button>
            </div>

            {/* Zoom Switcher */}
            {viewMode === 'GANTT' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
                <button
                  onClick={() => setZoomScale('MONTHLY')}
                  className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                    zoomScale === 'MONTHLY' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
                  }`}
                  title="Monthly View"
                >
                  {language === 'ku' ? 'مانگانە' : language === 'ar' ? 'شهري' : 'Months'}
                </button>
                <button
                  onClick={() => setZoomScale('QUARTERLY')}
                  className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                    zoomScale === 'QUARTERLY' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
                  }`}
                  title="Quarterly View"
                >
                  {language === 'ku' ? 'وەرزی' : language === 'ar' ? 'فصلي' : 'Quarters'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Legend strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700">{language === 'ku' ? 'ڕێبەری ڕەنگەکان:' : language === 'ar' ? 'دليل الألوان:' : 'Legend:'}</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
              <span>{language === 'ku' ? 'تەواوبوو (١٠٠٪)' : language === 'ar' ? 'مكتمل' : 'Completed'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-blue-600 inline-block" />
              <span>{language === 'ku' ? 'لە جێبەجێکردندایە' : language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500 inline-block animate-pulse" />
              <span>{language === 'ku' ? 'دواکەوتوو / هۆشداری' : language === 'ar' ? 'متأخر' : 'Delayed'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" />
              <span>{language === 'ku' ? 'قۆناغی پلاندانان' : language === 'ar' ? 'تخطيط' : 'Planning'}</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 font-bold">
              <Flame className="w-3 h-3 text-rose-600" />
              <span>{language === 'ku' ? 'ڕێڕەوی چارەنووسساز (Critical Path)' : language === 'ar' ? 'المسار الحرج' : 'Critical Path'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block animate-ping" />
            <span>
              {language === 'ku' ? 'هێڵی سوور: ئەمڕۆ' : language === 'ar' ? 'الخط الأحمر: اليوم' : 'Red Line: Today'} ({new Date().toISOString().split('T')[0]})
            </span>
          </div>
        </div>
      </div>

      {/* Main Gantt View */}
      {viewMode === 'GANTT' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
          
          <div className="overflow-x-auto">
            <div className="min-w-[1100px]">
              
              {/* Header: Left hierarchy label + Timeline date markers */}
              <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 text-slate-700 sticky top-0 z-20">
                {/* Left Header: Project / Phase Info */}
                <div className="col-span-4 p-3.5 font-black text-xs text-slate-800 border-l border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-blue-600" />
                    <span>{language === 'ku' ? 'پڕۆژە و ژێرپڕۆژە / سەرپەرشتیار' : language === 'ar' ? 'المشروع والمشاريع الفرعية / المسؤول' : 'Project Hierarchy & Manager'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {language === 'ku' ? 'دەستپێک ➔ تەواوبوون' : language === 'ar' ? 'البدء ➔ النهاية' : 'Start ➔ End'}
                  </span>
                </div>

                {/* Right Header: Calendar Months or Quarters */}
                <div className="col-span-8 relative py-2.5 px-2 overflow-hidden">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    {zoomScale === 'MONTHLY' ? (
                      timeColumns.map((col, idx) => {
                        // Show every 2nd or 3rd month label if tight
                        const isEven = idx % 2 === 0;
                        return (
                          <div
                            key={col.key}
                            className="flex-1 text-center border-r border-slate-200/60 first:border-r-0 px-1 truncate"
                            title={col.label}
                          >
                            <span className="font-extrabold text-slate-800 text-[10px] block">{col.label.split(' ')[0]}</span>
                            <span className="text-[9px] text-slate-400 block font-mono">{col.year}</span>
                          </div>
                        );
                      })
                    ) : (
                      quarterColumns.map((col) => (
                        <div
                          key={col.key}
                          className="flex-1 text-center border-r border-slate-200 first:border-r-0 px-1 py-1"
                        >
                          <span className="font-black text-indigo-900 text-xs block">{col.label}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Rows Container with Vertical 'Today' Line */}
              <div className="relative divide-y divide-slate-100">
                
                {/* Vertical TODAY Line spanning through the table */}
                <div
                  className="absolute top-0 bottom-0 pointer-events-none z-10 flex flex-col items-center"
                  style={{ left: `calc(33.333% + (66.666% * ${todayPercentage / 100}))` }}
                >
                  <div className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap -mt-2">
                    {language === 'ku' ? 'ئەمڕۆ' : language === 'ar' ? 'اليوم' : 'Today'}
                  </div>
                  <div className="w-[2px] h-full bg-rose-500/80 dashed" />
                </div>

                {/* Grouped Projects and their Sub-Projects */}
                {groupedProjects.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <CalendarRange className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-600">
                      {language === 'ku' ? 'هیچ ژێرپڕۆژەیەک نەدۆزرایەوە بەم فلتەرانە.' : 'No sub-projects found matching filters.'}
                    </p>
                  </div>
                ) : (
                  groupedProjects.map(({ project, subProjects }) => {
                    const isCollapsed = collapsedProjects[project.id];
                    const comp = companies.find(c => c.id === project.companyId);
                    const projBar = getBarPosition(project.startDate, project.targetCompletionDate);

                    return (
                      <div key={project.id} className="group/proj">
                        
                        {/* Parent Project Summary Row */}
                        <div className="grid grid-cols-12 bg-slate-50/90 hover:bg-slate-100/90 transition border-y border-slate-200/80 py-3 items-center">
                          {/* Parent Project Title Column */}
                          <div className="col-span-4 px-3.5 flex items-center justify-between border-l border-slate-200">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <button
                                onClick={() => toggleProjectCollapse(project.id)}
                                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition cursor-pointer shrink-0"
                              >
                                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              
                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] font-black text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded">
                                    {project.code}
                                  </span>
                                  <h3 className="text-xs font-black text-slate-900 truncate">
                                    {project.nameKu || project.name}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                  <span>{comp?.nameKu || comp?.name}</span>
                                  <span>•</span>
                                  <span className="font-semibold text-slate-700">{subProjects.length} {language === 'ku' ? 'قۆناغ/ژێرپڕۆژە' : 'sub-projects'}</span>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-bold">{project.progressPercentage}%</span>
                                </div>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono text-slate-500 shrink-0 font-bold">
                              {project.startDate} ➔ {project.targetCompletionDate}
                            </span>
                          </div>

                          {/* Parent Project Macro Timeline Bar */}
                          <div className="col-span-8 px-2 relative h-8 flex items-center">
                            {/* Visual Grid Lines */}
                            <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
                              {timeColumns.map(col => (
                                <div key={col.key} className="flex-1 border-r border-slate-400 h-full" />
                              ))}
                            </div>

                            {/* Macro Project Bar */}
                            <div
                              className="absolute h-4 rounded-full bg-slate-300 border border-slate-400 overflow-hidden shadow-xs cursor-pointer group-hover/proj:h-5 transition-all"
                              style={{ left: `${projBar.left}%`, width: `${projBar.width}%` }}
                              title={`${project.name}: ${project.startDate} to ${project.targetCompletionDate} (${project.progressPercentage}%)`}
                            >
                              <div
                                className="h-full bg-gradient-to-r from-slate-700 via-indigo-800 to-slate-900 rounded-full"
                                style={{ width: `${project.progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Sub-Projects Rows (Collapsible) */}
                        {!isCollapsed && (
                          <div className="divide-y divide-slate-100/80">
                            {subProjects.map(sub => {
                              const bar = getBarPosition(sub.startDate, sub.targetCompletionDate);
                              const isDelayed = sub.status === 'DELAYED';
                              const isCompleted = sub.status === 'COMPLETED';

                              return (
                                <div
                                  key={sub.id}
                                  onClick={() => setSelectedSubProject({ sub, parent: project })}
                                  className="grid grid-cols-12 py-2.5 hover:bg-blue-50/40 transition cursor-pointer items-center group/row"
                                >
                                  {/* Left: Sub-Project details */}
                                  <div className="col-span-4 px-3.5 pr-6 border-l border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                      <div className={`w-2 h-7 rounded-full shrink-0 ${
                                        isCompleted ? 'bg-emerald-500' : isDelayed ? 'bg-rose-500 animate-pulse' : 'bg-blue-600'
                                      }`} />

                                      <div className="truncate">
                                        <div className="flex items-center gap-1.5">
                                          {sub.criticalPath && (
                                            <span title="Critical Path" className="text-rose-600 shrink-0">
                                              <Flame className="w-3.5 h-3.5" />
                                            </span>
                                          )}
                                          <h4 className="text-xs font-bold text-slate-800 group-hover/row:text-blue-700 truncate">
                                            {sub.nameKu || sub.name}
                                          </h4>
                                        </div>

                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                          <span className="font-semibold text-slate-600">{sub.manager}</span>
                                          <span>•</span>
                                          <span className="text-indigo-600 font-bold">{sub.phaseKu || sub.phase}</span>
                                          <span>•</span>
                                          <span className="font-mono text-emerald-700 font-bold">{sub.progressPercentage}%</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="shrink-0 text-left">
                                      <span className="text-[10px] font-mono text-slate-500 block">
                                        {sub.startDate} ➔ {sub.targetCompletionDate}
                                      </span>
                                      <span className="block">{getStatusBadge(sub.status)}</span>
                                    </div>
                                  </div>

                                  {/* Right: Gantt Bar Canvas */}
                                  <div className="col-span-8 px-2 relative h-9 flex items-center">
                                    {/* Grid background markers */}
                                    <div className="absolute inset-0 flex justify-between pointer-events-none opacity-10">
                                      {timeColumns.map(col => (
                                        <div key={col.key} className="flex-1 border-r border-slate-500 h-full" />
                                      ))}
                                    </div>

                                    {/* Interactive Gantt Bar */}
                                    <div
                                      className={`absolute h-6 rounded-xl border transition-all duration-200 overflow-hidden shadow-xs flex items-center justify-between px-2 text-[10px] font-bold text-white group-hover/row:scale-[1.02] group-hover/row:shadow-md ${
                                        isCompleted
                                          ? 'bg-emerald-600 border-emerald-400'
                                          : isDelayed
                                            ? 'bg-rose-600 border-rose-400 ring-2 ring-rose-400/40'
                                            : 'bg-indigo-600 border-indigo-400'
                                      }`}
                                      style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
                                      title={`${sub.nameKu || sub.name} (${sub.startDate} to ${sub.targetCompletionDate}) - ${sub.progressPercentage}% Completed`}
                                    >
                                      {/* Inner Progress Fill */}
                                      <div
                                        className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-l-xl transition-all"
                                        style={{ width: `${sub.progressPercentage}%` }}
                                      />

                                      {/* Bar Labels (if bar is wide enough) */}
                                      <span className="relative z-10 truncate text-[10px] font-bold drop-shadow-xs">
                                        {sub.nameKu || sub.name}
                                      </span>
                                      <span className="relative z-10 shrink-0 font-mono text-[9px] bg-black/30 px-1 py-0.5 rounded ml-1">
                                        {sub.progressPercentage}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Table View */}
      {viewMode === 'TABLE' && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
                <tr>
                  <th className="py-3.5 px-4">{language === 'ku' ? 'ژێرپڕۆژە' : 'Sub-Project'}</th>
                  <th className="py-3.5 px-4">{language === 'ku' ? 'پڕۆژەی سەرەکی' : 'Parent Project'}</th>
                  <th className="py-3.5 px-4">{language === 'ku' ? 'قۆناغ' : 'Phase'}</th>
                  <th className="py-3.5 px-4">{language === 'ku' ? 'ڕێکەوتی دەستپێکردن' : 'Start Date'}</th>
                  <th className="py-3.5 px-4">{language === 'ku' ? 'ڕێکەوتی تەواوبوون' : 'Target End'}</th>
                  <th className="py-3.5 px-4">{language === 'ku' ? 'پێشکەوتن' : 'Progress'}</th>
                  <th className="py-3.5 px-4">{language === 'ku' ? 'بوودجە و خەرجی' : 'Budget / Spent'}</th>
                  <th className="py-3.5 px-4">{language === 'ku' ? 'بەرپرسی قۆناغ' : 'Manager'}</th>
                  <th className="py-3.5 px-4">{language === 'ku' ? 'دۆخ' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-center">{language === 'ku' ? 'کردارەکان' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubProjects.map(({ sub, parent }) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        {sub.criticalPath && (
                          <span title="Critical Path" className="text-rose-600">
                            <Flame className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span>{sub.nameKu || sub.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{parent.nameKu || parent.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {sub.phaseKu || sub.phase}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{sub.startDate}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{sub.targetCompletionDate}</td>
                    <td className="py-3 px-4">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 mb-0.5">
                          <span>{sub.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sub.progressPercentage === 100
                                ? 'bg-emerald-500'
                                : sub.status === 'DELAYED'
                                  ? 'bg-rose-500'
                                  : 'bg-blue-600'
                            }`}
                            style={{ width: `${sub.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      <div>${sub.spentUSD.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">/ ${sub.budgetUSD.toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{sub.manager}</td>
                    <td className="py-3 px-4">{getStatusBadge(sub.status)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedSubProject({ sub, parent })}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(sub, parent)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Sub-Project Detailed View & Progress Manager */}
      {selectedSubProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedSubProject.sub.phaseKu || selectedSubProject.sub.phase}
                  </span>
                  {selectedSubProject.sub.criticalPath && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-600" />
                      Critical Path
                    </span>
                  )}
                  {getStatusBadge(selectedSubProject.sub.status)}
                </div>
                <h2 className="text-lg font-black text-slate-900">
                  {selectedSubProject.sub.nameKu || selectedSubProject.sub.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedSubProject.parent.nameKu || selectedSubProject.parent.name} • {selectedSubProject.sub.name}
                </p>
              </div>

              <button
                onClick={() => setSelectedSubProject(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Date Span Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <span className="text-[11px] text-blue-700 font-bold block">{language === 'ku' ? 'بەرواری دەستپێکردن' : 'Start Date'}</span>
                  <span className="font-mono text-sm font-black text-slate-900 mt-0.5 block">{selectedSubProject.sub.startDate}</span>
                </div>
                <div>
                  <span className="text-[11px] text-indigo-700 font-bold block">{language === 'ku' ? 'بەرواری تەواوبوون' : 'Target Completion'}</span>
                  <span className="font-mono text-sm font-black text-indigo-900 mt-0.5 block">{selectedSubProject.sub.targetCompletionDate}</span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-700 font-bold block">{language === 'ku' ? 'ڕێژەی پێشکەوتن' : 'Progress'}</span>
                  <span className="text-sm font-black text-emerald-800 mt-0.5 block">{selectedSubProject.sub.progressPercentage}%</span>
                </div>
                <div>
                  <span className="text-[11px] text-amber-700 font-bold block">{language === 'ku' ? 'بوودجەی دیاریکراو' : 'Budget Allocated'}</span>
                  <span className="font-mono text-sm font-black text-slate-900 mt-0.5 block">${selectedSubProject.sub.budgetUSD.toLocaleString()}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3.5 pt-3 border-t border-blue-200/60">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{language === 'ku' ? 'پێشکەوتنی جێبەجێکردن' : 'Execution Progress'}</span>
                  <span>{selectedSubProject.sub.progressPercentage}%</span>
                </div>
                <div className="w-full bg-blue-200/60 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${selectedSubProject.sub.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Financial & Supervision Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ku' ? 'خەرجی و بوودجە' : 'Financial Status'}</span>
                </h4>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>{language === 'ku' ? 'کۆی بوودجە:' : 'Allocated Budget:'}</span>
                    <strong className="text-slate-900 font-mono">${selectedSubProject.sub.budgetUSD.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ku' ? 'خەرجکراو تا ئێستا:' : 'Spent to Date:'}</span>
                    <strong className="text-amber-700 font-mono">${selectedSubProject.sub.spentUSD.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ku' ? 'ماوەی بوودجە:' : 'Remaining Balance:'}</span>
                    <strong className="text-emerald-700 font-mono">${(selectedSubProject.sub.budgetUSD - selectedSubProject.sub.spentUSD).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ku' ? 'ڕێژەی بەکارهێنان:' : 'Utilization Rate:'}</span>
                    <strong className="text-indigo-700">{((selectedSubProject.sub.spentUSD / selectedSubProject.sub.budgetUSD) * 100).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{language === 'ku' ? 'تیمی سەرپەرشتیاری پڕۆژە' : 'Project Management'}</span>
                </h4>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>{language === 'ku' ? 'بەڕێوەبەری قۆناغ:' : 'Phase Manager:'}</span>
                    <strong className="text-slate-900">{selectedSubProject.sub.manager}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ku' ? 'ژمارەی مۆبایل:' : 'Contact Phone:'}</span>
                    <strong className="text-blue-700 font-mono">{selectedSubProject.sub.managerPhone || '+964 750 000 0000'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ku' ? 'ئەندازیارانی بەشدار:' : 'Engineers:'}</span>
                    <strong className="text-slate-900">{selectedSubProject.sub.assignedEngineersCount || 4} {language === 'ku' ? 'ئەندازیار' : 'Engineers'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ku' ? 'کرێکارانی گۆڕەپان:' : 'Field Workers:'}</span>
                    <strong className="text-slate-900">{selectedSubProject.sub.assignedWorkersCount || 35} {language === 'ku' ? 'کرێکار' : 'Workers'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Milestones description */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs font-black text-slate-900 block mb-1">
                {language === 'ku' ? 'تێبینی و ڕێنماییەکانی خاوەنی هۆلدینگ و ئەندازیار:' : 'Directives & Milestone Notes:'}
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedSubProject.sub.notesKu || 'قۆناغەکە بەپێی پلانی دیاریکراو بەردەوامە و کەرەستەکان بە ڕێکوپێکی دابین کراون.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedSubProject.sub, selectedSubProject.parent)}
                  className="px-4 py-2 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{language === 'ku' ? 'دەستکاریکردنی پێشکەوتن و دۆخ' : 'Update Progress & Status'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(selectedSubProject.parent.id, selectedSubProject.sub.id)}
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {onOpenReportCreate && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenReportCreate(selectedSubProject.parent.id);
                      setSelectedSubProject(null);
                    }}
                    className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{language === 'ku' ? 'ئامادەکردنی ڕاپۆرتی فەرمی بۆ ئەم پڕۆژەیە' : 'Write Periodic Report'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedSubProject(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {language === 'ku' ? 'داخستن' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Sub-Project */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">
                  {language === 'ku' ? 'زیادکردنی ژێرپڕۆژەی نوێ بۆ خشتەی جانت' : language === 'ar' ? 'إضافة مشروع فرعي جديد لمخطط جانت' : 'Add New Sub-Project to Schedule'}
                </h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubProject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'ku' ? 'پڕۆژەی سەرەکی:' : 'Parent Project:'}
                </label>
                <select
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.nameKu || p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ku' ? 'ناوی قۆناغ / ژێرپڕۆژە (کوردی):' : 'Sub-Project Name (Kurdish):'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameKu}
                    onChange={(e) => setFormNameKu(e.target.value)}
                    placeholder="نموونە: شیشبەندی و کۆنکرێتڕێژی نهۆمەکان"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ku' ? 'ناوی قۆناغ بە ئینگلیزی:' : 'Sub-Project Name (English):'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Reinforced Concrete Superstructure"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ku' ? 'قۆناغی ئەندازیاری:' : 'Engineering Phase:'}
                  </label>
                  <select
                    value={formPhase}
                    onChange={(e) => setFormPhase(e.target.value as SubProjectPhase)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="EXCAVATION_FOUNDATION">بنکە و هەڵکەندن (Foundations)</option>
                    <option value="CONCRETE_SUPERSTRUCTURE">پەیکەری کۆنکرێتی (Concrete Superstructure)</option>
                    <option value="STEEL_FRAMING">پەیکەری پۆڵایین (Steel Framing)</option>
                    <option value="MEP_HVAC_ELECTRICAL">کارەبا و فێنککەرەوە (MEP & HVAC)</option>
                    <option value="FACADE_CLADDING">ڕووبەری دەرەوە (Facade Cladding)</option>
                    <option value="INTERIOR_FINISHING">تەواوکاری ناوەوە (Interior Finishing)</option>
                    <option value="INFRASTRUCTURE_ROADS">ژێرخان و ڕێگا (Roads & Infrastructure)</option>
                    <option value="TESTING_COMMISSIONING">تاقیکردنەوە و ڕادەستکردن (Commissioning)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ku' ? 'دۆخی سەرەتایی:' : 'Initial Status:'}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="ACTIVE">لە جێبەجێکردندا (Active)</option>
                    <option value="PLANNING">پلاندانان (Planning)</option>
                    <option value="COMPLETED">تەواوبوو (Completed)</option>
                    <option value="DELAYED">دواکەوتوو (Delayed)</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ku' ? 'بەرواری دەستپێکردن:' : 'Start Date:'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ku' ? 'بەرواری تەواوبوون:' : 'Target End Date:'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Progress & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ku' ? 'ڕێژەی پێشکەوتن (%):' : 'Progress (%):'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formProgress}
                    onChange={(e) => setFormProgress(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ku' ? 'بوودجەی دیاریکراو (USD):' : 'Budget (USD):'}
                  </label>
                  <input
                    type="number"
                    min={1000}
                    value={formBudgetUSD}
                    onChange={(e) => setFormBudgetUSD(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ku' ? 'خەرجکراو (USD):' : 'Spent (USD):'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formSpentUSD}
                    onChange={(e) => setFormSpentUSD(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Manager & Critical Path */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ku' ? 'ئەندازیاری سەرپەرشتیار:' : 'Supervising Engineer:'}
                  </label>
                  <input
                    type="text"
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCriticalPath}
                      onChange={(e) => setFormCriticalPath(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-600" />
                      {language === 'ku' ? 'ڕێڕەوی چارەنووسساز (Critical Path)' : 'Critical Path Milestone'}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'ku' ? 'تێبینی سەرەتایی:' : 'Initial Notes:'}
                </label>
                <textarea
                  rows={2}
                  value={formNotesKu}
                  onChange={(e) => setFormNotesKu(e.target.value)}
                  placeholder="ڕێنمایی و بەرنامەی کارکردن..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {language === 'ku' ? 'پاشگەزبوونەوە' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'ku' ? 'تۆمارکردن و زیادکردن بۆ خشتە' : 'Save Sub-Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Quick Edit Sub-Project Progress & Status */}
      {editingSubProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">{editingSubProject.parent.nameKu}</span>
                <h3 className="text-sm font-black text-slate-900">
                  {editingSubProject.sub.nameKu || editingSubProject.sub.name}
                </h3>
              </div>
              <button onClick={() => setEditingSubProject(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{language === 'ku' ? 'ڕێژەی پێشکەوتن:' : 'Progress Percentage:'}</span>
                  <span className="text-blue-700 font-extrabold text-sm">{editProgress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editProgress}
                  onChange={(e) => setEditProgress(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'ku' ? 'دۆخی جێبەجێکردن:' : 'Status:'}
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                >
                  <option value="ACTIVE">لە جێبەجێکردندا (Active)</option>
                  <option value="COMPLETED">تەواوبوو (Completed - 100%)</option>
                  <option value="DELAYED">دواکەوتوو / هۆشداری (Delayed)</option>
                  <option value="PLANNING">پلاندانان (Planning)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'ku' ? 'کۆی خەرجکراو (USD):' : 'Spent (USD):'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={editSpentUSD}
                  onChange={(e) => setEditSpentUSD(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'ku' ? 'تێبینی نوێ:' : 'Notes:'}
                </label>
                <textarea
                  rows={2}
                  value={editNotesKu}
                  onChange={(e) => setEditNotesKu(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSubProject(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                {language === 'ku' ? 'پاشگەزبوونەوە' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2.5 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'ku' ? 'پاشەکەوتکردنی گۆڕانکارییەکان' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
