import React, { useState } from 'react';
import {
  Building2,
  FolderKanban,
  Plus,
  PhoneCall,
  Video,
  DollarSign,
  Users,
  MapPin,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Layers,
  CheckCircle2,
  ArrowUpRight,
  Calendar,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  X,
  Check,
  Home,
  FileCheck2,
  Bed,
  FileSignature,
  FileSpreadsheet
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { resolveEntityText, getUIText } from '../utils/langHelper';
import { Company, Project, DepartmentOverview } from '../types/erp';
import { DepartmentInspectionModal } from './DepartmentInspectionModal';
import { ProjectReportsModule } from './ProjectReportsModule';
import { SmartBudgetAlertPanel } from './SmartBudgetAlertPanel';

export const CompaniesProjectsModule: React.FC = () => {
  const {
    companies,
    addCompany,
    updateCompany,
    deleteCompany,
    projects,
    addProject,
    updateProject,
    deleteProject,
    addDepartmentToEntity,
    deleteDepartmentFromEntity,
    clearAllMockData,
    holding,
    startCallWithManager,
    requestHoldingMeeting,
    setIsHoldingSetupOpen,
    projectReports,
    foreignWorkers,
    setActiveTab
  } = useERP();

  const { t, language } = useLanguage();

  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // In-App Deletion and Mock Purge Confirmation States
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'COMPANY' | 'PROJECT';
    id: string;
    name: string;
  } | null>(null);
  const [isClearMockModalOpen, setIsClearMockModalOpen] = useState(false);

  // Custom Department Modal State
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [deptTargetType, setDeptTargetType] = useState<'COMPANY' | 'PROJECT'>('COMPANY');
  const [deptTargetId, setDeptTargetId] = useState('');
  const [deptTargetName, setDeptTargetName] = useState('');
  const [newDeptNameKu, setNewDeptNameKu] = useState('');
  const [newDeptNameEn, setNewDeptNameEn] = useState('');
  const [newDeptHeadName, setNewDeptHeadName] = useState('');
  const [newDeptHeadPhone, setNewDeptHeadPhone] = useState('+964 750 ');
  const [newDeptBudgetUSD, setNewDeptBudgetUSD] = useState(0);
  const [newDeptStaffCount, setNewDeptStaffCount] = useState(5);

  // Department inspection modal state
  const [inspectingDept, setInspectingDept] = useState<DepartmentOverview | null>(null);
  const [inspectingCompanyName, setInspectingCompanyName] = useState('');
  const [inspectingProjectName, setInspectingProjectName] = useState<string | undefined>(undefined);
  const [inspectingEntityType, setInspectingEntityType] = useState<'COMPANY' | 'PROJECT'>('COMPANY');
  const [inspectingEntityId, setInspectingEntityId] = useState('');

  // New Company Form
  const [compName, setCompName] = useState('');
  const [compNameKu, setCompNameKu] = useState('');
  const [compNameAr, setCompNameAr] = useState('');
  const [compCode, setCompCode] = useState('');
  const [industry, setIndustry] = useState('Construction & Infrastructure');
  const [generalManager, setGeneralManager] = useState('');
  const [gmPhone, setGmPhone] = useState('+964 750 ');
  const [annualBudget, setAnnualBudget] = useState(0);
  const [location, setLocation] = useState('Main HQ');

  // New Project Form
  const [projName, setProjName] = useState('');
  const [projNameKu, setProjNameKu] = useState('');
  const [projNameAr, setProjNameAr] = useState('');
  const [projCode, setProjCode] = useState('');
  const [targetCompId, setTargetCompId] = useState(companies[0]?.id || 'comp-1');
  const [projectManager, setProjectManager] = useState('');
  const [pmPhone, setPmPhone] = useState('+964 750 ');
  const [projBudget, setProjBudget] = useState(0);
  const [projLocation, setProjLocation] = useState('Site 1');

  // Project Expatriates Accommodation Hub Setup
  const [projCampName, setProjCampName] = useState('');
  const [projCampType, setProjCampType] = useState<'ENGINEERS_RESIDENCE' | 'WORKER_HOUSING_CAMP' | 'HOTEL_SUITES' | 'PORTABLE_CABINS'>('ENGINEERS_RESIDENCE');
  const [projCampCapacity, setProjCampCapacity] = useState(40);
  const [projCampSupervisor, setProjCampSupervisor] = useState('');
  const [projCampSupervisorPhone, setProjCampSupervisorPhone] = useState('+964 750 ');
  const [projFacilities, setProjFacilities] = useState<string[]>([
    'سیستەمی فێنککەرەوە و گەرمکەرەوە (Central HVAC)',
    'ئینتەرنێتی خێرا (High-Speed Wi-Fi)',
    'چێشتخانە و هۆڵی نانخواردن (Dining Hall)',
    'پاسەوانی و کامێرای چاودێری 24/7 (Security & CCTV)',
    'ژووری پزیشکی و فریاگوزاری سەرەتایی (Medical Room)'
  ]);

  // Project Departments & Reporting Linkage Setup
  const [linkToHolding, setLinkToHolding] = useState(true);
  const [enableWeeklyMonthlyReports, setEnableWeeklyMonthlyReports] = useState(true);
  const [requirePmScanSignature, setRequirePmScanSignature] = useState(true);
  const [selectedDeptCategories, setSelectedDeptCategories] = useState<string[]>([
    'ENGINEERING',
    'FINANCE',
    'SAFETY_HSE',
    'EXPATRIATES_HOUSING',
    'PROCUREMENT',
    'QUALITY_CONTROL'
  ]);

  // Viewing Project Reports modal
  const [viewingReportsProjectId, setViewingReportsProjectId] = useState<string | null>(null);

  const handleInspectDepartment = (
    dept: DepartmentOverview,
    compNameStr: string,
    projNameStr: string | undefined,
    eType: 'COMPANY' | 'PROJECT',
    eId: string
  ) => {
    setInspectingDept(dept);
    setInspectingCompanyName(compNameStr);
    setInspectingProjectName(projNameStr);
    setInspectingEntityType(eType);
    setInspectingEntityId(eId);
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    addCompany({
      name: compName || compNameKu,
      nameKu: compNameKu || compName,
      nameAr: compNameAr || compNameKu,
      code: compCode || `CMP-${Math.floor(10 + Math.random() * 90)}`,
      industry,
      location,
      generalManager: generalManager || 'بەڕێوەبەری گشتی',
      gmPhone,
      gmEmail: `${(generalManager || 'gm').toLowerCase().replace(/\s+/g, '.')}@holding.com`,
      annualBudgetUSD: Number(annualBudget) || 0,
      spentUSD: 0,
      activeProjectsCount: 0,
      employeeCount: 0,
      isHoldingOwnerApproved: true,
      holdingLinkStatus: 'CONNECTED_LIVE',
      logoUrl: '',
    });
    setIsAddCompanyOpen(false);
    setCompName('');
    setCompNameKu('');
    setGeneralManager('');
    setAnnualBudget(0);
  };

  const handleSaveEditCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    updateCompany(editingCompany.id, {
      nameKu: editingCompany.nameKu,
      name: editingCompany.name,
      generalManager: editingCompany.generalManager,
      gmPhone: editingCompany.gmPhone,
      annualBudgetUSD: Number(editingCompany.annualBudgetUSD) || 0,
      location: editingCompany.location,
      industry: editingCompany.industry,
    });
    setEditingCompany(null);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();

    const campNameFinal = projCampName || `کەمپی نیشتەجێبوونی بیانیەکانی ${projNameKu || projName}`;
    const generatedCamp = {
      campId: `camp-${Date.now()}`,
      campName: campNameFinal,
      campNameKu: `خاڵی نیشتەجێبوون و کەمپی کارمەندانی بیانی پڕۆژەی ${projNameKu || projName}`,
      location: `${projLocation} - Residential Zone`,
      type: projCampType,
      totalBeds: Number(projCampCapacity) || 40,
      occupiedBeds: 0,
      supervisorName: projCampSupervisor || 'سەرپەرشتیاری نیشتەجێبوونی بیانیەکان',
      supervisorPhone: projCampSupervisorPhone || pmPhone,
      facilities: projFacilities,
      blockName: 'Foreign Staff & Engineers Quarters'
    };

    // Build custom departments based on selection
    const deptTemplates: Record<string, { name: string; nameKu: string; category: any; headTitle: string }> = {
      ENGINEERING: { name: 'Engineering & Field Works', nameKu: 'بەشی ئەندازیاری و جێبەجێکردن', category: 'ENGINEERING', headTitle: 'Chief Site Engineer' },
      FINANCE: { name: 'Site Accounts & Cost Control', nameKu: 'بەشی دارایی و خەرجی پڕۆژە', category: 'FINANCE', headTitle: 'Site Financial Controller' },
      SAFETY_HSE: { name: 'Safety, HSE & Fire Security', nameKu: 'بەشی سەلامەتی و پاراستنی ژینگە (HSE)', category: 'HSE', headTitle: 'Lead HSE Officer' },
      EXPATRIATES_HOUSING: { name: 'Foreign Workers & Housing Affairs', nameKu: 'بەشی کاروباری بیانیەکان و شوێنی حەوانەوە', category: 'ACCOMMODATION', headTitle: 'Expatriates Affairs Coordinator' },
      PROCUREMENT: { name: 'Site Procurement & Material Supply', nameKu: 'بەشی کڕین و دابینکردنی کەرەستە', category: 'PROCUREMENT', headTitle: 'Site Procurement Officer' },
      QUALITY_CONTROL: { name: 'QA/QC Quality Inspection', nameKu: 'بەشی کۆنتڕۆڵی جۆری و تاقیگە (QC)', category: 'ENGINEERING', headTitle: 'QA/QC Manager' },
    };

    const initialDepts: DepartmentOverview[] = selectedDeptCategories.map(catKey => {
      const tmpl = deptTemplates[catKey] || { name: 'Site Operations', nameKu: 'بەشی ئۆپەراسیۆن', category: 'MANAGEMENT', headTitle: 'Lead' };
      return {
        id: `dept-prj-${catKey.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: tmpl.category,
        name: tmpl.name,
        nameKu: tmpl.nameKu,
        nameAr: tmpl.nameKu,
        headName: `${projectManager} (یان نوێنەری بەش)`,
        headTitle: tmpl.headTitle,
        headPhone: pmPhone,
        headEmail: `${catKey.toLowerCase()}.${projCode.toLowerCase() || 'site'}@holding.com`,
        staffCount: 4,
        healthStatus: 'HEALTHY',
        statusSummaryKu: 'بەشەکە بە فەرمی پەیوەستکراوە بە پڕۆژە و سیستەمی چاودێری هۆلدینگ.',
        isReportingToHolding: true,
        budgetAllocatedUSD: Math.round((Number(projBudget) || 1000000) * 0.12),
        budgetSpentUSD: 0,
        pendingApprovalsCount: 0,
        activeTasksCount: 3,
        kpiScore: 95,
        lastReportDate: new Date().toISOString().split('T')[0],
      };
    });

    addProject({
      companyId: targetCompId,
      name: projName || projNameKu,
      nameKu: projNameKu || projName,
      nameAr: projNameAr || projNameKu,
      code: projCode || `PRJ-${Math.floor(10 + Math.random() * 90)}`,
      location: projLocation,
      manager: projectManager || 'بەڕێوەبەری پڕۆژە',
      managerPhone: pmPhone,
      budgetUSD: Number(projBudget) || 0,
      spentUSD: 0,
      startDate: new Date().toISOString().split('T')[0],
      targetCompletionDate: '2027-12-31',
      status: 'ACTIVE',
      progressPercentage: 0,
      engineersCount: 6,
      workersCount: 40,
      holdingLinkStatus: linkToHolding ? 'CONNECTED_LIVE' : 'INTERNAL_ONLY',
      holdingConnectionId: linkToHolding ? `LINK-HQ-PRJ-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      departments: initialDepts,
      accommodationDetails: generatedCamp,
    });

    setIsAddProjectOpen(false);
    setProjName('');
    setProjNameKu('');
    setProjectManager('');
    setProjBudget(0);
    setProjCampName('');
    setProjCampSupervisor('');
  };

  const handleOpenAddDept = (type: 'COMPANY' | 'PROJECT', id: string, name: string) => {
    setDeptTargetType(type);
    setDeptTargetId(id);
    setDeptTargetName(name);
    setNewDeptNameKu('');
    setNewDeptNameEn('');
    setNewDeptHeadName('');
    setNewDeptHeadPhone('+964 750 ');
    setNewDeptBudgetUSD(0);
    setNewDeptStaffCount(5);
    setIsAddDeptModalOpen(true);
  };

  const handleSaveCustomDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptNameKu && !newDeptNameEn) return;

    addDepartmentToEntity(deptTargetType, deptTargetId, {
      code: `DEP-${Math.floor(100 + Math.random() * 900)}`,
      name: newDeptNameEn || newDeptNameKu,
      nameKu: newDeptNameKu || newDeptNameEn,
      nameAr: newDeptNameKu || newDeptNameEn,
      headName: newDeptHeadName || 'بەڕێوەبەری بەش',
      headRole: 'Department Director',
      headPhone: newDeptHeadPhone,
      headEmail: 'dept@holding.com',
      staffCount: Number(newDeptStaffCount) || 1,
      budgetAllocatedUSD: Number(newDeptBudgetUSD) || 0,
      budgetSpentUSD: 0,
      statusSummary: 'Custom department created and operational.',
      statusSummaryKu: 'بەشی نوێ دروستکرا و پەیوەستکرا بە چاودێری ڕاستەوخۆی هۆلدینگ.',
      status: 'NORMAL',
      iconName: 'Layers'
    });

    setIsAddDeptModalOpen(false);
  };

  const handleSaveEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    updateProject(editingProject.id, {
      nameKu: editingProject.nameKu,
      name: editingProject.name,
      manager: editingProject.manager,
      managerPhone: editingProject.managerPhone,
      budgetUSD: Number(editingProject.budgetUSD) || 0,
      location: editingProject.location,
      companyId: editingProject.companyId,
    });
    setEditingProject(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {t('navCompaniesProjects')}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {getUIText(language, {
                  en: 'Manage holding subsidiaries, active projects, allocated budgets, and leadership profiles.',
                  ku: 'بەڕێوەبردنی کۆمپانیاکانی هۆلدینگ، پڕۆژە چالاکەکان، بودجەی تەرخانکراو و بەڕێوەبەران.',
                  ar: 'إدارة الشركات التابعة للهولدينغ والمشاريع النشطة والميزانيات المعتمدة وقيادات العمل.'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsClearMockModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
            title={t('clearAllMockData')}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>{t('clearAllMockData')}</span>
          </button>
          <button
            onClick={() => setIsHoldingSetupOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition transform active:scale-95 cursor-pointer"
          >
            <span>{getUIText(language, { en: 'Edit Holding & Logo', ku: 'دەستکاری ناوی هۆلدینگ و لۆگۆ', ar: 'تعديل هوية وشعار الهولدينغ' })}</span>
          </button>
          <button
            onClick={() => setIsAddProjectOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition transform active:scale-95 cursor-pointer"
            id="add-project-btn"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>{getUIText(language, { en: 'Add Project (+)', ku: 'زیادکردنی پڕۆژە (+)', ar: 'إضافة مشروع (+)' })}</span>
          </button>
          <button
            onClick={() => setIsAddCompanyOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition transform active:scale-95 cursor-pointer"
            id="add-company-btn"
          >
            <Plus className="w-4 h-4" />
            <span>{getUIText(language, { en: 'Add Company (+)', ku: 'زیادکردنی کۆمپانیا (+)', ar: 'إضافة شركة (+)' })}</span>
          </button>
        </div>
      </div>

      {/* Holding Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 shadow-xs border border-blue-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {holding.logoUrl ? (
            <img
              src={holding.logoUrl}
              alt={holding.name || 'Holding Logo'}
              className="w-12 h-12 rounded-2xl object-cover bg-white/10 p-1 border border-white/20 shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0 border border-blue-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm text-white">
                {getUIText(language, { en: 'Active Holding: ', ku: 'هۆلدینگی ئێستا: ', ar: 'المجموعة الحالية: ' })}
                {resolveEntityText(holding, 'name', language) || t('setHoldingNamePrompt')}
              </span>
              <span className="text-xs text-blue-300 font-medium">
                ({holding.chairmanName || t('holdingOwner')})
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {getUIText(language, { en: 'Companies: ', ku: 'ژمارەی کۆمپانیاکان: ', ar: 'عدد الشركات: ' })}<strong>{companies.length}</strong> • {getUIText(language, { en: 'Projects: ', ku: 'ژمارەی پڕۆژەکان: ', ar: 'عدد المشاريع: ' })}<strong>{projects.length}</strong> • {getUIText(language, { en: 'Total Budget: ', ku: 'بودجەی گشتی: ', ar: 'الميزانية الإجمالية: ' })}<strong>${holding.totalBudgetUSD.toLocaleString()} USD</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsHoldingSetupOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0 transition active:scale-95 border border-white/20"
        >
          <Edit2 className="w-4 h-4 text-blue-300" />
          <span>{getUIText(language, { en: 'Edit Holding Identity', ku: 'گۆڕینی ناوی هۆلدینگ و خاوەن', ar: 'تعديل هوية الهولدينغ والمالك' })}</span>
        </button>
      </div>

      {/* AI Smart Alert Panel: Targeted Specifically to Project Managers (PMs) & Company General Managers (GMs) */}
      <div className="space-y-2">
        <SmartBudgetAlertPanel
          onNavigateToProcurement={() => setActiveTab('procurement')}
          onNavigateToFinance={() => setActiveTab('finance')}
        />
      </div>

      {/* Companies Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>{getUIText(language, { en: `Holding Subsidiaries (${companies.length})`, ku: `کۆمپانیاکانی سەر بە هۆلدینگ (${companies.length} کۆمپانیا)`, ar: `الشركات التابعة للهولدينغ (${companies.length})` })}</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {getUIText(language, { en: 'Full CRUD: You can edit or delete any company anytime', ku: 'دەتوانیت هەر کۆمپانیایەک دەستکاری بکەیت یان بسڕیتەوە', ar: 'يمكنك تعديل أو حذف أي شركة في أي وقت' })}
          </span>
        </div>

        {companies.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">هیچ کۆمپانیایەک دیاری نەکراوە</h3>
            <p className="text-xs text-slate-500">تکایە کلیک لەسەر &quot;زیادکردنی کۆمپانیا&quot; بکە بۆ ناونووسینی کۆمپانیای خۆت.</p>
            <button
              onClick={() => setIsAddCompanyOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              زیادکردنی یەکەم کۆمپانیا
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {companies.map((comp) => {
              const compProjects = projects.filter(p => p.companyId === comp.id);
              const spentPercent = comp.annualBudgetUSD > 0 ? ((comp.spentUSD / comp.annualBudgetUSD) * 100).toFixed(1) : '0.0';

              return (
                <div
                  key={comp.id}
                  className="bg-white border border-slate-200/80 hover:border-blue-300 rounded-3xl p-6 shadow-xs space-y-5 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Top Bar with Edit / Delete */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                          {comp.code}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{getUIText(language, { en: 'Connected Live', ku: 'بەستراوە بە هۆلدینگ', ar: 'متصل بالهولدينغ' })}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingCompany(comp)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition cursor-pointer text-xs font-medium flex items-center gap-1"
                          title={t('editAction')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{t('editAction')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirmTarget({
                              type: 'COMPANY',
                              id: comp.id,
                              name: resolveEntityText(comp, 'name', language)
                            });
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition cursor-pointer text-xs font-medium"
                          title={t('deleteAction')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Company Name */}
                    <div className="mt-3">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        {resolveEntityText(comp, 'name', language)}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{comp.industry} • {comp.location}</p>
                    </div>

                    {/* General Manager Card */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                          {getUIText(language, { en: 'General Manager (GM)', ku: 'بەڕێوەبەری گشتی کۆمپانیا (GM)', ar: 'المدير العام للشركة (GM)' })}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{comp.generalManager}</span>
                        <span className="text-[11px] text-blue-600 font-mono block font-medium">{comp.gmPhone}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startCallWithManager({
                            name: comp.generalManager,
                            role: 'General Manager',
                            phone: comp.gmPhone,
                            company: comp.nameKu || comp.name,
                            avatar: '👔'
                          })}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-100 transition cursor-pointer"
                          title="پەیوەندی تەلەفۆنی ڕاستەوخۆ"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => requestHoldingMeeting({
                            sourceType: 'COMPANY',
                            sourceId: comp.id,
                            sourceName: comp.nameKu || comp.name,
                            departmentName: 'Executive Directorate',
                            agendaTopic: `Strategic Review with GM ${comp.generalManager}`,
                          })}
                          className="p-2 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white border border-purple-100 transition cursor-pointer"
                          title="ڕێکخستنی کۆبوونەوەی ڤیدیۆیی لەگەڵ هۆلدینگ"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Department Grid */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-blue-600" />
                          <span>بەشە بەستراوەکانی ئەم کۆمپانیایە:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenAddDept('COMPANY', comp.id, comp.nameKu || comp.name)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>زیادکردنی بەش</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {(comp.departments || []).map((dept) => (
                          <button
                            key={dept.id}
                            onClick={() => handleInspectDepartment(dept, comp.nameKu || comp.name, undefined, 'COMPANY', comp.id)}
                            className="text-right p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 transition text-xs group cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 group-hover:text-blue-700 truncate block text-[11px]">
                                {dept.nameKu}
                              </span>
                              <Eye className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                              {dept.headName}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget & Stats */}
                    <div className="mt-4 space-y-2 text-xs bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">بودجەی دیاریکراو لەلایەن کۆمپانیا:</span>
                        <span className="font-bold text-slate-900 font-mono">${(comp.annualBudgetUSD || 0).toLocaleString()} USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">تێچووی خەرجکراوی ڕاستەقینە:</span>
                        <span className="font-bold text-emerald-600 font-mono">${(comp.spentUSD || 0).toLocaleString()} USD</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{compProjects.length} پڕۆژەی پەیوەستکراو</span>
                    <span className="text-blue-600 font-bold">{comp.employeeCount || 0} کارمەند</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-600" />
            <span>{getUIText(language, { en: `Active Projects (${projects.length})`, ku: `پڕۆژەکان (${projects.length} پڕۆژە)`, ar: `المشاريع النشطة (${projects.length})` })}</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {getUIText(language, { en: 'Full CRUD: You can configure names, budgets, and managers anytime', ku: 'دەتوانیت ناوی پڕۆژەکان و بودجەکانیان بنووسیت و دەستکاری بکەیت', ar: 'يمكنك تعديل أسماء وميزانيات المشاريع في أي وقت' })}
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 text-center space-y-3">
            <FolderKanban className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">
              {getUIText(language, { en: 'No projects registered yet', ku: 'هیچ پڕۆژەیەک تۆمار نەکراوە', ar: 'لم يتم تسجيل أي مشروع بعد' })}
            </h3>
            <p className="text-xs text-slate-500">
              {getUIText(language, { en: 'Click "Add Project" to register your first project site.', ku: 'کلیک لەسەر "زیادکردنی پڕۆژە" بکە تا یەکەم پڕۆژەت بنووسیت.', ar: 'انقر على "إضافة مشروع" لتسجيل مشروعك الأول.' })}
            </p>
            <button
              onClick={() => setIsAddProjectOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              {getUIText(language, { en: 'Register Project', ku: 'تۆمارکردنی پڕۆژە', ar: 'تسجيل مشروع جديد' })}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const comp = companies.find(c => c.id === proj.companyId);

              return (
                <div
                  key={proj.id}
                  className="bg-white border border-slate-200/80 hover:border-blue-300 rounded-3xl p-5 shadow-xs space-y-4 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {proj.code}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingProject(proj)}
                          className="p-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          title={t('editAction')}
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{t('editAction')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirmTarget({
                              type: 'PROJECT',
                              id: proj.id,
                              name: resolveEntityText(proj, 'name', language)
                            });
                          }}
                          className="p-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition text-[11px] cursor-pointer"
                          title={t('deleteAction')}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 mt-2">
                      {resolveEntityText(proj, 'name', language)}
                    </h3>
                    <span className="text-xs text-slate-500 block">{comp?.nameKu || comp?.name || 'کۆمپانیا'} • {proj.location}</span>

                    {/* Project Manager Card */}
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 mt-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-bold">بەڕێوەبەری پڕۆژە (PM):</span>
                        <span className="font-bold text-slate-900">{proj.manager}</span>
                        <span className="text-[10px] text-blue-600 font-mono block">{proj.managerPhone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startCallWithManager({
                            name: proj.manager,
                            role: 'Project Director',
                            phone: proj.managerPhone,
                            company: comp?.nameKu || 'Project Site',
                            avatar: '👷'
                          })}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-100 transition cursor-pointer"
                          title="پەیوەندی تەلەفۆنی"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => requestHoldingMeeting({
                            sourceType: 'PROJECT',
                            sourceId: proj.id,
                            sourceName: proj.nameKu || proj.name,
                            departmentName: 'Project Field Command',
                            agendaTopic: `Holding Sync with PM ${proj.manager} on ${proj.nameKu || proj.name}`,
                          })}
                          className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white border border-purple-100 transition cursor-pointer"
                          title="کۆبوونەوە لەگەڵ هۆلدینگ"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Holding HQ Connection Status */}
                    <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>پەیوەندی بەستنەوە بە هۆلدینگ:</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                        {proj.holdingConnectionId || 'LINK-HQ-ONLINE'}
                      </span>
                    </div>

                    {/* Department Grid for Projects */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-blue-600" />
                          <span>بەشەکانی ئەم پڕۆژەیە ({proj.departments?.length || 0}):</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenAddDept('PROJECT', proj.id, proj.nameKu || proj.name)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded-md border border-blue-200 transition cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>زیادکردنی بەش</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1 max-h-28 overflow-y-auto pr-0.5">
                        {(proj.departments || []).map(dept => (
                          <button
                            key={dept.id}
                            onClick={() => handleInspectDepartment(dept, comp?.nameKu || comp?.name || '', proj.nameKu || proj.name, 'PROJECT', proj.id)}
                            className="text-right p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-[10px] font-bold text-slate-800 hover:text-blue-700 truncate cursor-pointer transition flex items-center justify-between"
                            title={dept.nameKu}
                          >
                            <span className="truncate">{dept.nameKu}</span>
                            <span className="text-[9px] text-emerald-600 font-mono">HQ✓</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Project Expatriates Accommodation Hub */}
                    {(() => {
                      const projWorkers = foreignWorkers.filter(w => w.projectId === proj.id || w.assignedProjectId === proj.id);
                      const camp = proj.accommodationDetails;
                      return (
                        <div className="mt-3 bg-purple-50/70 border border-purple-200/90 rounded-2xl p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 font-extrabold text-purple-950 text-[11px]">
                              <Home className="w-3.5 h-3.5 text-purple-600" />
                              <span>خاڵی نیشتەجێبوونی بیانیەکان:</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-900 font-black border border-purple-300">
                              {projWorkers.length} کارمەندی بیانی
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-purple-900 truncate">
                            {camp?.campNameKu || camp?.campName || `کەمپی نیشتەجێبوونی پڕۆژە`}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-purple-800 pt-1 border-t border-purple-200/70">
                            <span className="flex items-center gap-1 font-medium">
                              <Bed className="w-3 h-3 text-purple-600" />
                              <span>جێگا: {camp?.totalBeds || 40} قەرەوێڵە</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveTab('foreign-workers')}
                              className="text-purple-700 hover:text-purple-950 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                            >
                              <span>بەشی بیانیەکان</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Project Periodic Weekly & Monthly Reports */}
                    {(() => {
                      const pReports = projectReports.filter(r => r.projectId === proj.id);
                      const latestRep = pReports[0];
                      return (
                        <div className="mt-3 bg-blue-50/70 border border-blue-200/90 rounded-2xl p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 font-extrabold text-blue-950 text-[11px]">
                              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>ڕاپۆرتی هەفتانە و مانگانە (PM):</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200/80 text-blue-900 font-black border border-blue-300">
                              {pReports.length} ڕاپۆرت
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-blue-800 truncate font-medium">
                              {latestRep 
                                ? `${latestRep.reportType === 'WEEKLY' ? 'هەفتانە' : 'مانگانە'} - ${latestRep.status === 'APPROVED_BY_HOLDING' ? 'پەسەندکراوی هۆلدینگ' : 'واژۆکراو و نێردراو'}`
                                : 'سیستەمی ڕاپۆرتی خولی چالاکە'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setViewingReportsProjectId(proj.id)}
                              className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <FileSignature className="w-3 h-3" />
                              <span>ڕاپۆرتی PM</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                  </div>

                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-slate-500">
                      <span>بودجەی پڕۆژە:</span>
                      <span className="font-bold text-slate-900 font-mono">${(proj.budgetUSD || 0).toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>خەرجکراو:</span>
                      <span className="font-bold text-emerald-600 font-mono">${(proj.spentUSD || 0).toLocaleString()} USD</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Department Inspection Modal */}
      <DepartmentInspectionModal
        isOpen={!!inspectingDept}
        onClose={() => setInspectingDept(null)}
        department={inspectingDept}
        companyName={inspectingCompanyName}
        projectName={inspectingProjectName}
        entityType={inspectingEntityType}
        entityId={inspectingEntityId}
      />

      {/* Add Company Modal */}
      {isAddCompanyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">تۆمارکردنی کۆمپانیای نوێ</h3>
              <button onClick={() => setIsAddCompanyOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">ناوی کۆمپانیاکەت و بەڕێوەبەر و بودجەکەی بە ویستی خۆت بنووسە.</p>
            <form onSubmit={handleCreateCompany} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ناوی کۆمپانیا بە کوردی *</label>
                <input
                  type="text"
                  required
                  placeholder="ناوی کۆمپانیا بنووسە"
                  value={compNameKu}
                  onChange={(e) => {
                    setCompNameKu(e.target.value);
                    if (!compName) setCompName(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ناوی کۆمپانیا بە ئینگلیزی (یان دەتوانی بەتاڵی جێبهێڵیت)</label>
                <input
                  type="text"
                  placeholder="Company Legal Name in English"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">بەڕێوەبەری گشتی (GM)</label>
                  <input
                    type="text"
                    required
                    placeholder="ناوی بەڕێوەبەری گشتی"
                    value={generalManager}
                    onChange={(e) => setGeneralManager(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تەلەفۆنی GM</label>
                  <input
                    type="text"
                    required
                    value={gmPhone}
                    onChange={(e) => setGmPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">بودجەی کۆمپانیا ($ USD)</label>
                  <input
                    type="number"
                    value={annualBudget}
                    onChange={(e) => setAnnualBudget(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ناونیشان / شوێن</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddCompanyOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  تۆمارکردن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">دەستکاریکردنی زانیاری کۆمپانیا</h3>
              <button onClick={() => setEditingCompany(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditCompany} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ناوی کۆمپانیا بە کوردی</label>
                <input
                  type="text"
                  required
                  value={editingCompany.nameKu || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, nameKu: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ناوی کۆمپانیا بە ئینگلیزی</label>
                <input
                  type="text"
                  value={editingCompany.name || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">بەڕێوەبەری گشتی (GM)</label>
                  <input
                    type="text"
                    required
                    value={editingCompany.generalManager || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, generalManager: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تەلەفۆنی GM</label>
                  <input
                    type="text"
                    value={editingCompany.gmPhone || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, gmPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">بودجەی ساڵانە ($ USD)</label>
                  <input
                    type="number"
                    value={editingCompany.annualBudgetUSD ?? 0}
                    onChange={(e) => setEditingCompany({ ...editingCompany, annualBudgetUSD: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شوێن / ناونیشان</label>
                  <input
                    type="text"
                    value={editingCompany.location || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  پاشەکەوتکردن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-blue-600" />
                  <span>تۆمارکردنی پڕۆژەی نوێ لەگەڵ خاڵی نیشتەجێبوون و بەشەکان</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  دەسەڵاتی دروستکردنی بەش، بەستنەوە بە هۆلدینگ، خاڵی نیشتەجێبوونی بیانیەکان و ڕاپۆرتی خولی
                </p>
              </div>
              <button onClick={() => setIsAddProjectOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5">
              
              {/* Section 1: Core Details */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>١. زانیارییە سەرەکییەکانی پڕۆژە و سەرپەرشتیار</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">کۆمپانیای خاوەن پڕۆژە (Subsidiary) *</label>
                    <select
                      value={targetCompId}
                      onChange={(e) => setTargetCompId(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    >
                      {companies.map(c => <option key={c.id} value={c.id}>{c.nameKu || c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">کۆدی پڕۆژە (Project Code)</label>
                    <input
                      type="text"
                      placeholder="وەک: PRJ-99"
                      value={projCode}
                      onChange={(e) => setProjCode(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ناوی پڕۆژە بە کوردی *</label>
                  <input
                    type="text"
                    required
                    placeholder="وەک: تاوەری نیشتەجێبوونی ئاراس، پردی دەربەندیخان..."
                    value={projNameKu}
                    onChange={(e) => {
                      setProjNameKu(e.target.value);
                      if (!projName) setProjName(e.target.value);
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-none font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">بەڕێوەبەری پڕۆژە (Project Manager) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ناوی بەڕێوەبەری پڕۆژە"
                      value={projectManager}
                      onChange={(e) => setProjectManager(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تەلەفۆنی ڕاستەوخۆی PM</label>
                    <input
                      type="text"
                      required
                      value={pmPhone}
                      onChange={(e) => setPmPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">بودجەی پڕۆژە ($ USD)</label>
                    <input
                      type="number"
                      value={projBudget}
                      onChange={(e) => setProjBudget(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">شوێنی پڕۆژە (Location)</label>
                    <input
                      type="text"
                      required
                      placeholder="شار / ناوچەی جێبەجێکردن"
                      value={projLocation}
                      onChange={(e) => setProjLocation(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Department Selection & Linkage to Holding */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>٢. دەسەڵاتی زیادکردنی بەشەکان و بەستنەوەیان بە پڕۆژە و هۆلدینگ</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    پەیوەستی ئۆتۆماتیکی
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  هەمان دەسەڵاتت هەیە کە بەشە پێویستەکان لەناو پڕۆژەکەدا زیاد بکەیت و بە بارەگای سەرەکی هۆلدینگەوە ببەستیتەوە بۆ ڕاپۆرت و چاودێری ڕاستەوخۆ:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'ENGINEERING', label: 'بەشی ئەندازیاری و مەیدانی (Engineering)' },
                    { id: 'FINANCE', label: 'بەشی دارایی و کۆنتڕۆڵی خەرجی پڕۆژە (Finance)' },
                    { id: 'SAFETY_HSE', label: 'بەشی سەلامەتی، ژینگە و ئاسایش (HSE)' },
                    { id: 'EXPATRIATES_HOUSING', label: 'بەشی کاروباری بیانیەکان و کەمپی حەوانەوە' },
                    { id: 'PROCUREMENT', label: 'بەشی کڕین و دابینکردنی کەرەستە (Procurement)' },
                    { id: 'QUALITY_CONTROL', label: 'بەشی کۆنتڕۆڵی جۆری و پشکنین (QA/QC)' },
                  ].map((deptItem) => {
                    const isChecked = selectedDeptCategories.includes(deptItem.id);
                    return (
                      <label
                        key={deptItem.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold cursor-pointer transition ${
                          isChecked ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDeptCategories(prev => [...prev, deptItem.id]);
                            } else {
                              setSelectedDeptCategories(prev => prev.filter(k => k !== deptItem.id));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="truncate">{deptItem.label}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200">
                  <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={linkToHolding}
                      onChange={(e) => setLinkToHolding(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>بەستنەوەی ڕاستەوخۆ بە بارەگای سەرەکی هۆلدینگ (Holding HQ Live Link)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">24/7 Sync</span>
                </div>
              </div>

              {/* Section 3: Expatriates Accommodation Point */}
              <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-950">
                    <Home className="w-4 h-4 text-purple-700" />
                    <span>٣. خاڵی نیشتەجێبوونی بێگانەکان و کارمەندانی بیانی پڕۆژە</span>
                  </div>
                  <span className="text-[10px] text-purple-800 bg-purple-200 font-extrabold px-2 py-0.5 rounded-full border border-purple-300">
                    مەرجی سەرەکی پڕۆژە
                  </span>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  خاڵی نیشتەجێبوون بۆ سەرجەم ئەندازیاران و کارمەندانی بیانی دیاری دەکرێت تا بەشی بیانیەکان بتوانێت چاودێری ئیقامە و نیشتەجێبوونیان بکات:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-purple-950 mb-1">ناوی خاڵی نیشتەجێبوون / کەمپ *</label>
                    <input
                      type="text"
                      placeholder="وەک: کەمپی نیشتەجێبوونی بیانیەکانی پڕۆژە"
                      value={projCampName}
                      onChange={(e) => setProjCampName(e.target.value)}
                      className="w-full bg-white border border-purple-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:border-purple-500 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-950 mb-1">جۆری شوێنی نیشتەجێبوون</label>
                    <select
                      value={projCampType}
                      onChange={(e) => setProjCampType(e.target.value as any)}
                      className="w-full bg-white border border-purple-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:border-purple-500 focus:outline-none font-bold"
                    >
                      <option value="ENGINEERS_RESIDENCE">کەمپی تایبەتی ئەندازیارانی بیانی (Engineers Camp)</option>
                      <option value="WORKER_HOUSING_CAMP">کەمپی نیشتەجێبوونی کارمەندان و کرێکاران</option>
                      <option value="HOTEL_SUITES">سویت و باڵەخانەی نیشتەجێبوون (Hotel Suites)</option>
                      <option value="PORTABLE_CABINS">کابینە و کاراڤانی گەڕۆک (Site Cabins)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-purple-950 mb-1">توانای گرتن (قەرەوێڵە)</label>
                    <input
                      type="number"
                      value={projCampCapacity}
                      onChange={(e) => setProjCampCapacity(Number(e.target.value))}
                      className="w-full bg-white border border-purple-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-950 mb-1">سەرپەرشتیاری کەمپ</label>
                    <input
                      type="text"
                      placeholder="ناوی سەرپەرشتیار"
                      value={projCampSupervisor}
                      onChange={(e) => setProjCampSupervisor(e.target.value)}
                      className="w-full bg-white border border-purple-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-950 mb-1">تەلەفۆنی سەرپەرشتیار</label>
                    <input
                      type="text"
                      value={projCampSupervisorPhone}
                      onChange={(e) => setProjCampSupervisorPhone(e.target.value)}
                      className="w-full bg-white border border-purple-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Periodic Reports Policy */}
              <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-950">
                    <FileCheck2 className="w-4 h-4 text-blue-700" />
                    <span>٤. ناردنی ڕاپۆرتی مانگانە و هەفتانە بە واژۆ و سکانی PM</span>
                  </div>
                  <span className="text-[10px] text-blue-800 bg-blue-200 font-extrabold px-2 py-0.5 rounded-full border border-blue-300">
                    واژۆ + سکانی کاغەز
                  </span>
                </div>
                <div className="text-[11px] text-blue-800 leading-relaxed space-y-1">
                  <p>
                    ✓ بەڕێوەبەری پڕۆژە (PM) ڕاپۆرتی هەفتانە و مانگانە پڕ دەکاتەوە و بە شێوازی دیجیتاڵی واژۆی دەکات.
                  </p>
                  <p>
                    ✓ کۆپییە کاغەزییەکە مۆردەکرێت و سکان دەکرێت (Scanned Document Attachment)، ئینجا ڕاستەوخۆ دەنێردرێت بۆ سەرەوەی خۆیان و بارەگای هۆلدینگ بۆ پەسەندکردن.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProjectOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 cursor-pointer transition transform active:scale-95"
                >
                  تۆمارکردن و بەستنەوەی تەواوی پڕۆژە
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Reports Modal for Individual Project */}
      {viewingReportsProjectId && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    ڕاپۆرتە خولییەکانی پڕۆژە (واژۆی PM و سکانی کاغەز)
                  </h3>
                  <span className="text-xs text-slate-500">
                    ناردنی ڕاپۆرتی هەفتانە و مانگانە دوای واژۆکردنی بەڕێوەبەری پڕۆژە و سکانکردن بۆ سەرەوەی خۆیان
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingReportsProjectId(null)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <ProjectReportsModule
                initialProjectId={viewingReportsProjectId}
                onCloseModal={() => setViewingReportsProjectId(null)}
                isEmbedded={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">دەستکاریکردنی زانیاری پڕۆژە</h3>
              <button onClick={() => setEditingProject(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditProject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ناوی پڕۆژە بە کوردی</label>
                <input
                  type="text"
                  required
                  value={editingProject.nameKu || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, nameKu: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">بەڕێوەبەری پڕۆژە (PM)</label>
                  <input
                    type="text"
                    required
                    value={editingProject.manager || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, manager: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تەلەفۆنی PM</label>
                  <input
                    type="text"
                    value={editingProject.managerPhone || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, managerPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">بودجەی پڕۆژە ($ USD)</label>
                  <input
                    type="number"
                    value={editingProject.budgetUSD ?? 0}
                    onChange={(e) => setEditingProject({ ...editingProject, budgetUSD: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شوێنی پڕۆژە</label>
                  <input
                    type="text"
                    value={editingProject.location || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  پاشەکەوتکردن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Department Modal */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">زیادکردنی بەشی تایبەت</h3>
                  <p className="text-[11px] text-slate-500">
                    بۆ: {deptTargetType === 'PROJECT' ? `پڕۆژەی ${deptTargetName}` : `کۆمپانیای ${deptTargetName}`}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsAddDeptModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
              <strong>سیستەمی SAS4ERP:</strong> بەشە سەرەکییەکان (دارایی، سکیوریتی و HSE، سەرچاوە مرۆییەکان HR، کارگێڕی، کڕین، کۆگا و ئەندازیاری) خۆکارانە بوونیان هەیە. دەتوانیت هەر بەشێکی زیاتری تر لەم فۆڕمەوە زیاد بکەیت.
            </div>

            <form onSubmit={handleSaveCustomDept} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ناوی بەش بە کوردی *</label>
                <input
                  type="text"
                  required
                  placeholder="وەک: بەشی یاسایی، کۆنتڕۆڵی جۆری، پەرەپێدان..."
                  value={newDeptNameKu}
                  onChange={(e) => setNewDeptNameKu(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ناوی بەش بە ئینگلیزی (Department Name EN)</label>
                <input
                  type="text"
                  placeholder="e.g. Legal Affairs, Quality Assurance, R&D..."
                  value={newDeptNameEn}
                  onChange={(e) => setNewDeptNameEn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">بەڕێوەبەری بەش (Head of Dept)</label>
                  <input
                    type="text"
                    required
                    placeholder="ناوی بەڕێوەبەری بەش"
                    value={newDeptHeadName}
                    onChange={(e) => setNewDeptHeadName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تەلەفۆنی بەڕێوەبەر</label>
                  <input
                    type="text"
                    value={newDeptHeadPhone}
                    onChange={(e) => setNewDeptHeadPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">بودجەی بەش ($ USD)</label>
                  <input
                    type="number"
                    value={newDeptBudgetUSD}
                    onChange={(e) => setNewDeptBudgetUSD(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ژمارەی کارمەندان</label>
                  <input
                    type="number"
                    value={newDeptStaffCount}
                    onChange={(e) => setNewDeptStaffCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDeptModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  {t('cancelAction')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {getUIText(language, { en: 'Create Department', ku: 'زیادکردنی بەش', ar: 'إضافة القسم' })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Deletion Confirmation Modal (Replaces blocked window.confirm) */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                {t('confirmDeleteTitle')}
              </h3>
              <p className="text-sm text-slate-600">
                {getUIText(language, {
                  en: `Are you sure you want to delete ${deleteConfirmTarget.type === 'COMPANY' ? 'company' : 'project'} "${deleteConfirmTarget.name}"? This action cannot be undone.`,
                  ku: `ئایا دڵنیایت لە سڕینەوەی ${deleteConfirmTarget.type === 'COMPANY' ? 'کۆمپانیای' : 'پڕۆژەی'} "${deleteConfirmTarget.name}"؟ ئەم کردارە پاشگەزبوونەوەی نییە.`,
                  ar: `هل أنت متأكد من حذف ${deleteConfirmTarget.type === 'COMPANY' ? 'الشركة' : 'المشروع'} "${deleteConfirmTarget.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                })}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
              >
                {t('cancelAction')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirmTarget.type === 'COMPANY') {
                    deleteCompany(deleteConfirmTarget.id);
                  } else {
                    deleteProject(deleteConfirmTarget.id);
                  }
                  setDeleteConfirmTarget(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md cursor-pointer"
              >
                {t('yesDelete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Purge All Mock Data Modal */}
      {isClearMockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-rose-950">
                {t('clearAllMockData')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {getUIText(language, {
                  en: 'This will purge all pre-loaded sample companies, mock projects, and dummy data. You will have a clean canvas to enter your holding real operational units.',
                  ku: 'ئەم کردارە سەرجەم کۆمپانیا و پڕۆژە و ژمارە تاقیکارییەکان بە یەکجاری دەسڕێتەوە تا بتوانیت داتای ڕاستەقینەی خۆت تۆمار بکەیت.',
                  ar: 'سيؤدي هذا الإجراء إلى مسح كافة الشركات والمشاريع والبيانات الوهمية التجريبية لتبدأ بإدخال بياناتك الحقيقية.'
                })}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClearMockModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
              >
                {t('cancelAction')}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllMockData();
                  setIsClearMockModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md cursor-pointer"
              >
                {t('yesDelete')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
