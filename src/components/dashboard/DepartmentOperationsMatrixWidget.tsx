import React, { useState, useMemo } from 'react';
import {
  Layers,
  Building2,
  FolderKanban,
  Users,
  Eye,
  Video,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Award
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { DepartmentOverview } from '../../types/erp';
import { DepartmentInspectionModal } from '../DepartmentInspectionModal';
import { getUIText, resolveEntityText } from '../../utils/langHelper';
import { generateDefaultDepartments } from '../../data/departmentsData';

export const DepartmentOperationsMatrixWidget: React.FC = () => {
  const { companies, projects, requestHoldingMeeting } = useERP();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'COMPANIES' | 'PROJECTS'>('COMPANIES');
  const [selectedEntityId, setSelectedEntityId] = useState<string>(companies[0]?.id || 'comp-1');
  const [deptSearch, setDeptSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Inspection modal state
  const [inspectingDept, setInspectingDept] = useState<DepartmentOverview | null>(null);
  const [inspectingCompName, setInspectingCompName] = useState('');
  const [inspectingProjName, setInspectingProjName] = useState<string | undefined>(undefined);
  const [inspectingType, setInspectingType] = useState<'COMPANY' | 'PROJECT'>('COMPANY');

  const currentCompany = companies.find(c => c.id === selectedEntityId) || companies[0];
  const currentProject = projects.find(p => p.id === selectedEntityId) || projects[0];

  // Ensure balanced departments for any selected entity
  const rawDepartments = useMemo(() => {
    if (activeTab === 'COMPANIES') {
      const depts = currentCompany?.departments;
      if (depts && depts.length >= 4) return depts;
      return generateDefaultDepartments('COMPANY', currentCompany?.name || 'Subsidiary', currentCompany?.generalManager || 'General Manager');
    } else {
      const depts = currentProject?.departments;
      if (depts && depts.length >= 4) return depts;
      return generateDefaultDepartments('PROJECT', currentProject?.name || 'Project Site', currentProject?.projectManager || 'Project Director');
    }
  }, [activeTab, currentCompany, currentProject]);

  const filteredDepts = useMemo(() => {
    return rawDepartments.filter(d => {
      const matchCategory = selectedCategory === 'ALL' || d.category === selectedCategory;
      if (!matchCategory) return false;

      if (!deptSearch.trim()) return true;
      const q = deptSearch.toLowerCase();
      const name = (d.name || '').toLowerCase();
      const nameKu = (d.nameKu || '').toLowerCase();
      const nameAr = (d.nameAr || '').toLowerCase();
      const head = (d.headName || '').toLowerCase();
      const summary = (d.statusSummaryKu || d.statusSummary || '').toLowerCase();

      return name.includes(q) || nameKu.includes(q) || nameAr.includes(q) || head.includes(q) || summary.includes(q);
    });
  }, [rawDepartments, selectedCategory, deptSearch]);

  const handleOpenDept = (dept: DepartmentOverview) => {
    setInspectingDept(dept);
    if (activeTab === 'COMPANIES') {
      setInspectingCompName(resolveEntityText(currentCompany, 'name', language));
      setInspectingProjName(undefined);
      setInspectingType('COMPANY');
    } else {
      const parentComp = companies.find(c => c.id === currentProject?.companyId);
      setInspectingCompName(parentComp ? resolveEntityText(parentComp, 'name', language) : '');
      setInspectingProjName(resolveEntityText(currentProject, 'name', language));
      setInspectingType('PROJECT');
    }
  };

  const categories = [
    { id: 'ALL', label: getUIText(language, { en: 'All Departments', ku: 'هەموو بەشەکان', ar: 'كافة الأقسام' }) },
    { id: 'ENGINEERING', label: getUIText(language, { en: 'Engineering', ku: 'ئەندازیاری', ar: 'الهندسة' }) },
    { id: 'FINANCE', label: getUIText(language, { en: 'Finance', ku: 'دارایی', ar: 'المالية' }) },
    { id: 'PROCUREMENT', label: getUIText(language, { en: 'Procurement', ku: 'کڕین و دابینکاری', ar: 'المشتريات' }) },
    { id: 'HSE_SECURITY', label: getUIText(language, { en: 'HSE & Safety', ku: 'سەلامەتی و HSE', ar: 'السلامة والبيئة' }) },
    { id: 'HR_LABOR', label: getUIText(language, { en: 'HR & Labor', ku: 'سەرچاوە مرۆییەکان', ar: 'الموارد البشرية' }) },
    { id: 'QUALITY_CONTROL', label: getUIText(language, { en: 'Quality / QA', ku: 'کۆنتڕۆڵی جۆری', ar: 'الجودة' }) },
    { id: 'LEGAL_CONTRACTS', label: getUIText(language, { en: 'Legal', ku: 'یاسایی', ar: 'الشؤون القانونية' }) },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 shrink-0">
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-slate-900">
                {getUIText(language, {
                  en: 'Holding Department Operations Matrix (Cross-Subsidiary Oversight)',
                  ku: 'شەفافیەتی بەشەکان لەسەر ئاستی سەرۆکایەتی هۆلدینگ',
                  ar: 'مصفوفة عمليات الأقسام والرقابة المركزية للهولدينغ'
                })}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                {getUIText(language, {
                  en: 'Direct Owner Oversight',
                  ku: 'چاودێری ڕاستەوخۆی خاوەن هۆلدینگ',
                  ar: 'رقابة مباشرة لمالك الهولدينغ'
                })}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {getUIText(language, {
                en: 'Holding Chairman and General Management direct inspection into tasks, budgets, staffing, and workflows across all operational departments.',
                ku: 'خاوەن هۆلدینگ یان بەڕێوەبەری گشتی دەتوانێت لەم بەشەدا کار، بودجە، کادیر، و ڕێڕەوی کارکردنی سەرجەم بەشەکان ببینێت.',
                ar: 'تمكين رئاسة المجموعة والإدارة العامة من الاطلاع المباشر على ميزانيات وكوادر ومسارات عمل كافة الأقسام التشغيلية.'
              })}
            </p>
          </div>
        </div>

        {/* Global Meeting Request Button */}
        <button
          onClick={() => requestHoldingMeeting({
            sourceType: activeTab === 'COMPANIES' ? 'COMPANY' : 'PROJECT',
            sourceId: selectedEntityId,
            sourceName: activeTab === 'COMPANIES' 
              ? resolveEntityText(currentCompany, 'name', language)
              : resolveEntityText(currentProject, 'name', language),
            departmentName: 'All Strategic Departments',
            agendaTopic: 'Holding Executive Strategic Alignment with Department Heads',
          })}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer shrink-0 transition"
        >
          <Video className="w-4 h-4" />
          <span>
            {getUIText(language, {
              en: 'Hold All-Department Executive Meeting',
              ku: 'کۆبوونەوەی هۆلدینگ لەگەڵ سەرجەم بەشەکان',
              ar: 'اجتماع رئاسة الهولدينغ مع كافة الأقسام'
            })}
          </span>
        </button>
      </div>

      {/* Entity Selector (Companies vs Projects) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setActiveTab('COMPANIES');
              setSelectedEntityId(companies[0]?.id || 'comp-1');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'COMPANIES'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>
              {getUIText(language, {
                en: `Subsidiary Companies (${companies.length})`,
                ku: `کۆمپانیاکانی هۆلدینگ (${companies.length})`,
                ar: `شركات المجموعة (${companies.length})`
              })}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('PROJECTS');
              setSelectedEntityId(projects[0]?.id || 'proj-101');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'PROJECTS'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>
              {getUIText(language, {
                en: `Field Projects (${projects.length})`,
                ku: `پڕۆژە مەیدانییەکان (${projects.length})`,
                ar: `المشاريع الميدانية (${projects.length})`
              })}
            </span>
          </button>
        </div>

        {/* Dropdown to switch entity */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 shrink-0">
            {getUIText(language, {
              en: 'Select Target Entity:',
              ku: 'هەڵبژاردنی ناوەند:',
              ar: 'اختيار الجهة:'
            })}
          </span>
          <select
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            className="bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs cursor-pointer max-w-xs truncate"
          >
            {activeTab === 'COMPANIES'
              ? companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {resolveEntityText(c, 'name', language)} (GM: {c.generalManager})
                  </option>
                ))
              : projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {resolveEntityText(p, 'name', language)} (PM: {p.projectManager})
                  </option>
                ))}
          </select>
        </div>
      </div>

      {/* Category Pills & Search Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={getUIText(language, {
              en: 'Search departments, leads, tasks...',
              ku: 'گەڕان لە بەشەکان (ئەندازیاری، کڕین، دارایی، HSE...)',
              ar: 'البحث في الأقسام والمسؤولين والمهام...'
            })}
            value={deptSearch}
            onChange={(e) => setDeptSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Departments Grid - Clean, Balanced 3-column / 2-column cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => {
          return (
            <div
              key={dept.id}
              className="bg-slate-50/70 border border-slate-200/90 hover:border-blue-300 rounded-2xl p-4 transition space-y-3 flex flex-col justify-between group shadow-2xs hover:shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                      {dept.category}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1.5 group-hover:text-blue-600 transition">
                      {resolveEntityText(dept, 'name', language)}
                    </h3>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {language === 'en' ? dept.headTitle : (dept.name || dept.nameKu)}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                    {dept.healthScore || 100}% {getUIText(language, { en: 'Efficiency', ku: 'کارامەیی', ar: 'كفاءة' })}
                  </span>
                </div>

                {/* Head of Department */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-xs">
                  <span className="text-slate-400 text-[10px] block font-medium">
                    {getUIText(language, {
                      en: `Department Lead (${dept.headTitle || 'Head'}):`,
                      ku: `بەرپرسی بەش (${dept.headTitle || 'سەرپەرشتیار'}):`,
                      ar: `رئيس القسم (${dept.headTitle || 'المسؤول'}):`
                    })}
                  </span>
                  <span className="font-bold text-slate-900">{dept.headName}</span>
                  <span className="text-[10px] text-blue-600 font-mono block mt-0.5">{dept.headPhone}</span>
                </div>

                {/* Operational Summary snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/70 font-sans">
                  {resolveEntityText(dept, 'statusSummary', language) || getUIText(language, {
                    en: 'Operations running smoothly according to Holding standards.',
                    ku: 'کارەکان بەپێی ستانداردەکانی هۆلدینگ بەڕێوەدەچن.',
                    ar: 'العمليات تسير وفق معايير المجموعة القابضة.'
                  })}
                </p>

                {/* Budget & Staff Mini Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                  <div className="bg-white p-2 rounded-xl border border-slate-200/70">
                    <span className="text-slate-400 text-[10px] block">
                      {getUIText(language, { en: 'Personnel:', ku: 'کارمەندان:', ar: 'الكوادر:' })}
                    </span>
                    <strong className="text-slate-900 font-mono">
                      {dept.staffCount || 0} {getUIText(language, { en: 'Staff', ku: 'کادیر', ar: 'موظف' })}
                    </strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200/70">
                    <span className="text-slate-400 text-[10px] block">
                      {getUIText(language, { en: 'Budget:', ku: 'بودجە:', ar: 'الميزانية:' })}
                    </span>
                    <strong className="text-slate-900 font-mono">
                      ${(((dept.budgetAllocatedUSD || 0)) / 1000).toFixed(0)}K
                    </strong>
                  </div>
                </div>
              </div>

              {/* Bottom Inspection Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                <button
                  onClick={() => handleOpenDept(dept)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>
                    {getUIText(language, {
                      en: 'Inspect Department Deep Dive',
                      ku: 'پشکنینی وردەکاری بەش',
                      ar: 'فحص تفاصيل القسم'
                    })}
                  </span>
                </button>

                <button
                  onClick={() => requestHoldingMeeting({
                    sourceType: activeTab === 'COMPANIES' ? 'COMPANY' : 'PROJECT',
                    sourceId: selectedEntityId,
                    sourceName: activeTab === 'COMPANIES' 
                      ? resolveEntityText(currentCompany, 'name', language)
                      : resolveEntityText(currentProject, 'name', language),
                    departmentName: resolveEntityText(dept, 'name', language),
                    agendaTopic: `Holding Executive Meeting with Head of ${dept.name} (${dept.headName})`,
                  })}
                  className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white border border-purple-200 transition cursor-pointer"
                  title={getUIText(language, {
                    en: 'Hold executive video meeting with this department',
                    ku: 'کۆبوونەوەی هۆلدینگ لەگەڵ ئەم بەشە',
                    ar: 'عقد اجتماع تنفيذي مع هذا القسم'
                  })}
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDepts.length === 0 && (
        <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
          {getUIText(language, {
            en: 'No departments match the selected filter or search keyword.',
            ku: 'هیچ بەشێک لەگەڵ فلتەر یان وشەی گەڕانەکە یەکناگرێتەوە.',
            ar: 'لا توجد أقسام تطابق الفلتر أو كلمة البحث المحددة.'
          })}
        </div>
      )}

      {/* Department Inspection Modal */}
      <DepartmentInspectionModal
        isOpen={!!inspectingDept}
        onClose={() => setInspectingDept(null)}
        department={inspectingDept}
        companyName={inspectingCompName}
        projectName={inspectingProjName}
        entityType={inspectingType}
        entityId={selectedEntityId}
      />
    </div>
  );
};
