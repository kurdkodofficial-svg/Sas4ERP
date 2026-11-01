import React, { useState } from 'react';
import {
  Users,
  Plus,
  Crown,
  TrendingUp,
  CheckCircle2,
  PhoneCall,
  Video,
  BarChart3,
  Target,
  X,
  Activity,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { GeneralManagerProfile } from '../../types/erp';
import { getUIText, resolveEntityText } from '../../utils/langHelper';

export const GeneralManagersWidget: React.FC = () => {
  const {
    generalManagers,
    addGeneralManager,
    deleteGeneralManager,
    companies,
    currentUser,
    startCallWithManager,
    requestHoldingMeeting,
  } = useERP();

  const { t, language } = useLanguage();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGmForInspect, setSelectedGmForInspect] = useState<GeneralManagerProfile | null>(null);

  // Form states for adding General Manager
  const [fullName, setFullName] = useState('');
  const [fullNameKu, setFullNameKu] = useState('');
  const [title, setTitle] = useState('');
  const [assignedCompanyId, setAssignedCompanyId] = useState<string>(companies[0]?.id || '');
  const [phone, setPhone] = useState('+964 750 ');
  const [email, setEmail] = useState('');
  const [allocatedBudgetUSD, setAllocatedBudgetUSD] = useState<number>(0);
  const [currentWorkSummaryKu, setCurrentWorkSummaryKu] = useState('');
  const [currentWorkSummaryEn, setCurrentWorkSummaryEn] = useState('');
  const [latestAchievementKu, setLatestAchievementKu] = useState('');
  const [latestAchievementEn, setLatestAchievementEn] = useState('');

  // Check if current user is Super Admin or Holding Owner
  const isSuperAdminOrOwner = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HOLDING_OWNER';

  const handleOpenAddModal = () => {
    setFullName('');
    setFullNameKu('');
    setTitle(getUIText(language, { en: 'General Manager', ku: 'بەڕێوەبەری گشتی', ar: 'المدير العام' }));
    setAssignedCompanyId(companies[0]?.id || '');
    setPhone('+964 750 ');
    setEmail('');
    setAllocatedBudgetUSD(0);
    setCurrentWorkSummaryKu('');
    setCurrentWorkSummaryEn('');
    setLatestAchievementKu('');
    setLatestAchievementEn('');
    setIsAddModalOpen(true);
  };

  const handleCreateGM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() && !fullNameKu.trim()) return;

    const assignedComp = companies.find(c => c.id === assignedCompanyId);

    addGeneralManager({
      fullName: fullName.trim() || fullNameKu.trim(),
      fullNameKu: fullNameKu.trim() || fullName.trim(),
      title: title.trim() || getUIText(language, { en: 'General Manager', ku: 'بەڕێوەبەری گشتی', ar: 'المدير العام' }),
      assignedCompanyId: assignedCompanyId || undefined,
      assignedCompanyName: assignedComp ? resolveEntityText(assignedComp, 'name', language) : 'Holding Operations',
      phone: phone.trim() || '+964 750 000 0000',
      email: email.trim() || `gm.${(fullName || 'director').toLowerCase().replace(/\s+/g, '.')}@holding.com`,
      avatar: '👔',
      status: 'ACTIVE',
      kpiHealthScore: 92,
      completedMilestones: 4,
      totalAssignedTasks: 6,
      pendingApprovalsCount: 1,
      latestAchievementKu: latestAchievementKu.trim() || 'دەستپێکردنی قۆناغی سەرەکی پڕۆژە و ڕێکخستنی ستاف',
      latestAchievementEn: latestAchievementEn.trim() || 'Commenced primary operational phase and workforce structuring',
      currentWorkSummaryKu: currentWorkSummaryKu.trim() || 'سەرپەرشتیکردنی کارەکانی رۆژانە، دابینکردنی پێداویستی، و وردبینی لە خەرجییەکان',
      currentWorkSummaryEn: currentWorkSummaryEn.trim() || 'Supervising daily operations, procurement, and expenditure audits',
      directReportsCount: 12,
      allocatedBudgetUSD: Number(allocatedBudgetUSD) || 0,
      spentBudgetUSD: 0,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: getUIText(language, { en: 'Just now', ku: 'ئێستا', ar: 'الآن' }),
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      
      {/* Widget Header with Super Admin (+) Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {t('generalManagersTitle')}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {generalManagers.length} {getUIText(language, { en: 'General Managers', ku: 'بەڕێوەبەری گشتی', ar: 'مدراء عامون' })}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>{getUIText(language, { en: 'Visible to Holding Owner', ku: 'بینراوە بۆ خاوەنی هۆلدینگ', ar: 'مرئي لمالك المجموعة' })}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {getUIText(language, {
                  en: 'Holding Super Admin adds and assigns Subsidiary General Managers via (+); all operations, milestones, and dashboards report directly under Holding Owner oversight.',
                  ku: 'سوپەر ئەدمینی هۆلدینگ بەڕێوەبەری گشتی کۆمپانیاکان بە دوگمەی (+) زیاد دەکات؛ هەموو کار و بەرەوپێشچوون و داشبۆردەکانیان ڕاستەوخۆ لەژێر چاودێری خاوەنی هۆلدینگدایە.',
                  ar: 'يقوم المشرف العام للمجموعة بإضافة وتعيين المدراء العامين عبر زر (+)؛ وتخضع جميع أعمالهم ومؤشراتهم لإشراف مباشر من مالك المجموعة.'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Super Admin Add Button (+) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm hover:shadow-md transition cursor-pointer"
            id="super-admin-add-gm-btn"
            title={getUIText(language, {
              en: 'Super Admin can add a new Subsidiary General Manager',
              ku: 'سوپەر ئەدمین دەتوانێت بەڕێوەبەری گشتی نوێ زیادبکات',
              ar: 'المشرف العام يمكنه إضافة مدير عام جديد للشركة'
            })}
          >
            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-white" />
            </div>
            <span>{t('addGeneralManagerBtn')}</span>
          </button>
        </div>
      </div>

      {/* Overview Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-slate-500 font-medium block text-[11px]">
            {getUIText(language, { en: 'Total General Managers', ku: 'کۆی بەڕێوەبەرانی گشتی', ar: 'إجمالي المدراء العامين' })}
          </span>
          <span className="font-extrabold text-slate-900 text-lg mt-0.5 block">
            {generalManagers.length} {getUIText(language, { en: 'Managers', ku: 'بەڕێوەبەر', ar: 'مدير' })}
          </span>
          <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">
            {getUIText(language, { en: 'All linked to Holding', ku: 'هەموویان لە هۆلدینگ بەستراون', ar: 'مرتبطون بالمجموعة' })}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
          <span className="text-emerald-700 font-medium block text-[11px]">
            {getUIText(language, { en: 'Average Progress Rate', ku: 'تێکڕای بەرەوپێشچوونی کارەکان', ar: 'متوسط نسبة الإنجاز' })}
          </span>
          <span className="font-extrabold text-emerald-950 text-lg mt-0.5 block">
            {generalManagers.length > 0
              ? `${Math.round(generalManagers.reduce((acc, g) => acc + (g.kpiHealthScore || 85), 0) / generalManagers.length)}%`
              : '100%'}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {getUIText(language, { en: 'Optimal Performance', ku: 'ئاستی سەرکەوتوو', ar: 'أداء متميز' })}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
          <span className="text-amber-800 font-medium block text-[11px]">
            {getUIText(language, { en: 'Completed Milestones', ku: 'مایڵستۆنە تەواوکراوەکان', ar: 'المراحل المنجزة' })}
          </span>
          <span className="font-extrabold text-amber-950 text-lg mt-0.5 block">
            {generalManagers.reduce((acc, g) => acc + (g.completedMilestones || 0), 0)} {getUIText(language, { en: 'Delivered', ku: 'قۆناغی گەیشتوو', ar: 'مكتملة' })}
          </span>
          <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">
            {getUIText(language, { en: 'Verified by Owner', ku: 'لە لایەن خاوەنەوە بینراون', ar: 'معتمدة من المالك' })}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200">
          <span className="text-purple-800 font-medium block text-[11px]">
            {getUIText(language, { en: 'Budget Supervised by GMs', ku: 'بودجەی ژێر سەرپەرشتی GMs', ar: 'الميزانية بإشراف المدراء' })}
          </span>
          <span className="font-extrabold text-purple-950 text-lg mt-0.5 block">
            ${(generalManagers.reduce((acc, g) => acc + (g.allocatedBudgetUSD || 0), 0) / 1000000).toFixed(2)}M
          </span>
          <span className="text-[10px] text-purple-700 font-semibold mt-0.5 block">
            {getUIText(language, { en: 'Approved by Holding Owner', ku: 'پەسەندکراوی خاوەنی هۆلدینگ', ar: 'معتمد من مالك المجموعة' })}
          </span>
        </div>
      </div>

      {/* General Managers Cards Grid */}
      {generalManagers.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              {getUIText(language, {
                en: 'No General Managers Recorded Yet',
                ku: 'هیچ بەڕێوەبەرێکی گشتی هێشتا تۆمار نەکراوە',
                ar: 'لم يتم تسجيل أي مدير عام حتى الآن'
              })}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {getUIText(language, {
                en: 'Holding Super Admin can click the blue button above (+) to assign Subsidiary General Managers, providing full visibility for the Holding Owner.',
                ku: 'سوپەر ئەدمینی هۆلدینگ دەتوانێت لە ڕێگەی دوگمەی شینی سەرەوە (+) بەڕێوەبەری گشتی بۆ کۆمپانیاکانی هۆلدینگ زیاد بکات تا خاوەنی هۆلدینگ کارەکانیان بە ڕوونی ببینێت.',
                ar: 'يمكن للمشرف العام الضغط على الزر الأزرق (+) بالأعلى لتعيين مدراء عامين لشركات المجموعة لتوفير رؤية شاملة للمالك.'
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{getUIText(language, { en: 'Add First General Manager', ku: 'زیادکردنی یەکەم بەڕێوەبەری گشتی', ar: 'إضافة أول مدير عام' })}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generalManagers.map((gm) => {
            const comp = companies.find(c => c.id === gm.assignedCompanyId);
            const progress = gm.totalAssignedTasks > 0
              ? Math.round((gm.completedMilestones / gm.totalAssignedTasks) * 100)
              : gm.kpiHealthScore || 90;

            const displayName = language === 'en' ? (gm.fullName || gm.fullNameKu) : (gm.fullNameKu || gm.fullName);
            const compName = comp ? resolveEntityText(comp, 'name', language) : (gm.assignedCompanyName || 'Holding Subsidiary');

            return (
              <div
                key={gm.id}
                className="bg-slate-50/80 hover:bg-white border border-slate-200/90 hover:border-blue-400/80 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition group flex flex-col justify-between"
              >
                <div>
                  {/* Top GM identity bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-2xs group-hover:scale-105 transition-transform">
                        {gm.avatar || '👔'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-slate-900 text-sm">
                            {displayName}
                          </h3>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online" />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {gm.title}
                        </p>
                        <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-800 border border-blue-200/60">
                          {compName}
                        </span>
                      </div>
                    </div>

                    <div className={language === 'en' ? 'text-right' : 'text-left'}>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {getUIText(language, { en: 'Health KPI', ku: 'تەندروستی کار', ar: 'مؤشر الأداء' })}
                      </span>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                        {gm.kpiHealthScore || 95}%
                      </span>
                    </div>
                  </div>

                  {/* Progress: Milestones */}
                  <div className="mt-3.5 p-3 rounded-xl bg-white border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1 text-[11px] text-slate-600">
                        <Target className="w-3.5 h-3.5 text-blue-600" />
                        <span>{getUIText(language, { en: 'Milestones:', ku: 'بەرەوپێشچوونی کارەکان (Milestones):', ar: 'المراحل المنجزة:' })}</span>
                      </span>
                      <span className="text-blue-700 font-mono">
                        {gm.completedMilestones} {getUIText(language, { en: 'of', ku: 'لە', ar: 'من' })} {gm.totalAssignedTasks} {getUIText(language, { en: 'tasks', ku: 'ئەرک', ar: 'مهام' })} ({progress}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(10, progress))}%` }}
                      />
                    </div>

                    <div className="pt-1.5 text-[11px] space-y-1">
                      <div className="text-slate-800 font-bold leading-relaxed">
                        <span className="text-emerald-600 font-extrabold mr-1">
                          {getUIText(language, { en: '✓ Latest Milestone:', ku: '✓ دوایین دەستکەوت:', ar: '✓ آخر إنجاز:' })}
                        </span>
                        <span className="text-slate-700 font-medium">
                          {language === 'en'
                            ? (gm.latestAchievementEn || gm.latestAchievementKu || 'Project progressing according to master schedule.')
                            : (gm.latestAchievementKu || gm.latestAchievementEn || 'پڕۆژەکە بەپێی خشتەی کاتی بەرەوپێش دەچێت.')}
                        </span>
                      </div>
                      <div className="text-slate-600 text-[10px] leading-relaxed line-clamp-2">
                        <span className="text-blue-600 font-semibold mr-1">
                          {getUIText(language, { en: 'Current Focus:', ku: 'کاری ئێستا:', ar: 'العمل الجاري:' })}
                        </span>
                        <span>
                          {language === 'en'
                            ? (gm.currentWorkSummaryEn || gm.currentWorkSummaryKu || 'Expense auditing and synchronization with Holding.')
                            : (gm.currentWorkSummaryKu || gm.currentWorkSummaryEn || 'چاودێری خەرجییەکان و بەستنەوەی پڕۆژە لەگەڵ هۆلدینگ.')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info & Budget */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="p-2 rounded-lg bg-slate-100/70">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {getUIText(language, { en: 'Direct Phone:', ku: 'تەلەفۆن:', ar: 'الهاتف المباشر:' })}
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-[11px] truncate block">{gm.phone}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100/70">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {getUIText(language, { en: 'Allocated Budget:', ku: 'بودجەی دیاریکراو:', ar: 'الميزانية المخصصة:' })}
                      </span>
                      <span className="font-bold text-slate-900 text-[11px] block truncate">
                        ${gm.allocatedBudgetUSD ? gm.allocatedBudgetUSD.toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Bar for Holding Owner & Admin */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedGmForInspect(gm)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 transition cursor-pointer"
                    title={getUIText(language, {
                      en: 'View complete dashboard and GM metrics by Owner',
                      ku: 'بینینی تەواوی داشبۆرد و وردەکارییەکانی بەڕێوەبەری گشتی لەلایەن خاوەنەوە',
                      ar: 'عرض لوحة التحكم وتفاصيل المدير العام من قبل المالك'
                    })}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>{getUIText(language, { en: 'Dashboard & Milestones', ku: 'داشبۆرد و کارەکان', ar: 'اللوحة والمهام' })}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => startCallWithManager({
                      name: displayName,
                      role: 'General Manager',
                      phone: gm.phone,
                      company: compName,
                      avatar: gm.avatar || '👔'
                    })}
                    className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 transition cursor-pointer"
                    title={getUIText(language, {
                      en: 'Direct phone call with GM',
                      ku: 'پەیوەندی ڕاستەوخۆ بە بەڕێوەبەری گشتی',
                      ar: 'اتصال هاتفي مباشر بالمدير العام'
                    })}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => requestHoldingMeeting({
                      sourceType: 'COMPANY',
                      sourceId: gm.assignedCompanyId || 'comp-1',
                      sourceName: compName,
                      departmentName: 'General Management Hub',
                      agendaTopic: `Strategic Review with GM ${displayName}`
                    })}
                    className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white border border-purple-200 transition cursor-pointer"
                    title={getUIText(language, {
                      en: 'Emergency video meeting with Owner',
                      ku: 'کۆبوونەوەی بەپەلەی ڤیدیۆیی لەگەڵ خاوەن',
                      ar: 'اجتماع فيديو عاجل مع المالك'
                    })}
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>

                  {isSuperAdminOrOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        const confirmMsg = getUIText(language, {
                          en: `Are you sure you want to remove General Manager ${displayName}?`,
                          ku: `ئایا دڵنیایت لە سڕینەوەی بەڕێوەبەری گشتی ${displayName}؟`,
                          ar: `هل أنت متأكد من حذف المدير العام ${displayName}؟`
                        });
                        if (confirm(confirmMsg)) {
                          deleteGeneralManager(gm.id);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-600 text-slate-400 hover:text-white transition cursor-pointer"
                      title={getUIText(language, {
                        en: 'Delete this General Manager by Super Admin',
                        ku: 'سڕینەوەی ئەم بەڕێوەبەرە لەلایەن سوپەر ئەدمین',
                        ar: 'حذف هذا المدير العام من قبل المشرف'
                      })}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Super Admin Add General Manager Modal (+) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {getUIText(language, {
                    en: 'Add New Subsidiary General Manager (Super Admin)',
                    ku: 'زیادکردنی بەڕێوەبەری گشتی نوێ (Super Admin)',
                    ar: 'إضافة مدير عام جديد للشركة (المشرف العام)'
                  })}
                </h3>
                <p className="text-xs text-slate-500">
                  {getUIText(language, {
                    en: 'Super Admin authority to assign subsidiary GMs under direct Holding Owner visibility',
                    ku: 'دەسەڵاتی سوپەر ئەدمین بۆ دانانی بەڕێوەبەری گشتی بۆ کۆمپانیاکانی هۆلدینگ بە تەواوی بینراو بۆ خاوەن',
                    ar: 'صلاحية المشرف العام لتعيين مدراء الشركات تحت المتابعة المباشرة للمالك'
                  })}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateGM} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, {
                      en: 'Full Name (English / Latin) *',
                      ku: 'ناوی فەرمی (ئینگلیزی / لاتینی) *',
                      ar: 'الاسم الرسمي (إنجليزي / لاتيني) *'
                    })}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (!fullNameKu) setFullNameKu(e.target.value);
                    }}
                    placeholder={getUIText(language, { en: 'e.g. Dr. Sardar Kamal', ku: 'e.g. Dr. Sardar Kamal', ar: 'مثال: د. سردار كمال' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, {
                      en: 'Full Name (Kurdish / Local)',
                      ku: 'ناوی تەواوی بەڕێوەبەری گشتی (کوردی)',
                      ar: 'الاسم الكامل (محلي / كردي)'
                    })}
                  </label>
                  <input
                    type="text"
                    value={fullNameKu}
                    onChange={(e) => setFullNameKu(e.target.value)}
                    placeholder={getUIText(language, { en: 'e.g. د. سەردار کەمال مەحمود', ku: 'بۆ نموونە: د. سەردار کەمال مەحمود', ar: 'مثال: د. سردار كمال' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, {
                      en: 'Assigned Holding Subsidiary',
                      ku: 'دەستنیشانکردن بۆ کۆمپانیا / کەرتی هۆلدینگ',
                      ar: 'تعيين للشركة التابعة بالمجموعة'
                    })}
                  </label>
                  <select
                    value={assignedCompanyId}
                    onChange={(e) => setAssignedCompanyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {resolveEntityText(c, 'name', language)}
                      </option>
                    ))}
                    <option value="">
                      {getUIText(language, { en: 'Central Holding Operations', ku: 'کەرتی ناوەندی بەڕێوەبردنی هۆلدینگ', ar: 'عمليات الإدارة المركزية للمجموعة' })}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, {
                      en: 'Position Title',
                      ku: 'ناونیشانی وەزیفی (Position Title)',
                      ar: 'المسمى الوظيفي'
                    })}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={getUIText(language, { en: 'General Manager', ku: 'بەڕێوەبەری گشتی', ar: 'المدير العام' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, { en: 'Direct Phone *', ku: 'ژمارەی مۆبایل و پەیوەندی *', ar: 'رقم الهاتف المباشر *' })}
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, { en: 'Allocated Budget ($ USD)', ku: 'بودجەی تەرخانکراو ($ USD)', ar: 'الميزانية المعتمدة ($ دولاری)' })}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={allocatedBudgetUSD || ''}
                    onChange={(e) => setAllocatedBudgetUSD(Number(e.target.value))}
                    placeholder="500,000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {getUIText(language, {
                    en: 'Current Operational Focus (for Owner)',
                    ku: 'پوختەی ئەرک و کارەکانی ئێستای (بۆ خاوەنی هۆلدینگ)',
                    ar: 'ملخص العمل والتركيز الحالي (للمالك)'
                  })}
                </label>
                <textarea
                  rows={2}
                  value={language === 'en' ? currentWorkSummaryEn : currentWorkSummaryKu}
                  onChange={(e) => {
                    if (language === 'en') {
                      setCurrentWorkSummaryEn(e.target.value);
                      if (!currentWorkSummaryKu) setCurrentWorkSummaryKu(e.target.value);
                    } else {
                      setCurrentWorkSummaryKu(e.target.value);
                      if (!currentWorkSummaryEn) setCurrentWorkSummaryEn(e.target.value);
                    }
                  }}
                  placeholder={getUIText(language, {
                    en: 'e.g. Overseeing factory construction, managing supplier procurement, and workforce governance...',
                    ku: 'بۆ نموونە: سەرپەرشتیکردنی قۆناغی دروستکردنی کارگە، دانانی گرێبەستی کڕین، و بەڕێوەبردنی ستافی ئەندازیاران...',
                    ar: 'مثال: الإشراف على بناء المصنع، عقود التوريد وإدارة الكوادر الفنية...'
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {getUIText(language, {
                    en: 'Latest Milestone Achieved',
                    ku: 'بە چی گەیشتوون لە کارەکان؟ (دوایین قۆناغی سەرکەوتوو)',
                    ar: 'آخر مرحلة منجزة بنجاح'
                  })}
                </label>
                <input
                  type="text"
                  value={language === 'en' ? latestAchievementEn : latestAchievementKu}
                  onChange={(e) => {
                    if (language === 'en') {
                      setLatestAchievementEn(e.target.value);
                      if (!latestAchievementKu) setLatestAchievementKu(e.target.value);
                    } else {
                      setLatestAchievementKu(e.target.value);
                      if (!latestAchievementEn) setLatestAchievementEn(e.target.value);
                    }
                  }}
                  placeholder={getUIText(language, {
                    en: 'e.g. Completed 85% of Phase 1 and integrated central inventory with Holding',
                    ku: 'بۆ نموونە: تەواوکردنی 85%ـی قۆناغی یەکەم و بەستنەوەی عەمبار بە هۆلدینگ',
                    ar: 'مثال: إنجاز 85% من المرحلة الأولى وربط المستودعات بالمجموعة'
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  {getUIText(language, { en: 'Cancel', ku: 'پاشگەزبوونەوە', ar: 'إلغاء' })}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{getUIText(language, { en: 'Register & Connect to Holding', ku: 'تۆمارکردن و بەستنەوە بە هۆلدینگ', ar: 'تسجيل وربط بالمجموعة' })}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holding Owner Inspection Modal: بەدواداچوونی وردی داشبۆرد و کارەکان */}
      {selectedGmForInspect && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedGmForInspect(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-3xl shrink-0">
                {selectedGmForInspect.avatar || '👔'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-slate-900">
                    {language === 'en' ? (selectedGmForInspect.fullName || selectedGmForInspect.fullNameKu) : (selectedGmForInspect.fullNameKu || selectedGmForInspect.fullName)}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {getUIText(language, { en: 'Active General Manager', ku: 'بەڕێوەبەری گشتی چالاک', ar: 'مدير عام نشط' })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {selectedGmForInspect.title} • {selectedGmForInspect.assignedCompanyName}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-600">
                  <span>📞 {selectedGmForInspect.phone}</span>
                  <span>✉️ {selectedGmForInspect.email}</span>
                </div>
              </div>
            </div>

            {/* Holding Owner Status Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300 text-xs text-amber-900 flex items-center gap-2.5">
              <Crown className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong>{getUIText(language, { en: 'Direct Holding Owner Oversight:', ku: 'بینراوی ڕاستەوخۆی خاوەنی هۆلدینگ:', ar: 'إشراف مباشر لمالك المجموعة:' })}</strong>{' '}
                {getUIText(language, {
                  en: 'All milestones, budgets, and operational progress under this General Manager report directly to the Holding Owner command center.',
                  ku: 'ئەم بەڕێوەبەرە گشتییە سەرجەم کارەکان و خەرجی و راپۆرتەکانی ڕاستەوخۆ دەگاتە مێزی خاوەنی هۆلدینگ.',
                  ar: 'تخضع كافة أعمال ومصروفات وتقارير هذا المدير العام لمتابعة مباشرة من مكتب مالك المجموعة.'
                })}
              </div>
            </div>

            {/* Detailed Progress Breakdown */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {getUIText(language, { en: 'Operational Milestones & Performance', ku: 'بەرەوپێشچوونی کارەکان و دەستکەوتەکان', ar: 'مراحل العمل والأداء الميداني' })}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    {getUIText(language, { en: 'Health KPI', ku: 'تەندروستی ئەرکەکان', ar: 'مؤشر الأداء' })}
                  </span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">
                    {selectedGmForInspect.kpiHealthScore || 95}%
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    {getUIText(language, { en: 'Delivered Milestones', ku: 'قۆناغی تەواوکراو', ar: 'المراحل المنجزة' })}
                  </span>
                  <span className="text-2xl font-black text-blue-600 mt-1 block">
                    {selectedGmForInspect.completedMilestones} / {selectedGmForInspect.totalAssignedTasks}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    {getUIText(language, { en: 'Allocated Budget', ku: 'بودجەی کۆنترۆڵکراو', ar: 'الميزانية المخصصة' })}
                  </span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    ${(selectedGmForInspect.allocatedBudgetUSD || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">
                    {getUIText(language, { en: 'Overall Delivery Completion Rate:', ku: 'ڕێژەی تەواوبوونی گشتی کارەکان:', ar: 'نسبة الإنجاز الكلية للمهام:' })}
                  </span>
                  <span className="text-blue-600 font-mono">
                    {selectedGmForInspect.totalAssignedTasks > 0
                      ? Math.round((selectedGmForInspect.completedMilestones / selectedGmForInspect.totalAssignedTasks) * 100)
                      : 85}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-emerald-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        selectedGmForInspect.totalAssignedTasks > 0
                          ? Math.round((selectedGmForInspect.completedMilestones / selectedGmForInspect.totalAssignedTasks) * 100)
                          : 85
                      }%`
                    }}
                  />
                </div>
              </div>

              {/* Detailed Sections */}
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
                  <span className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{getUIText(language, { en: 'Latest Field Milestone Delivered:', ku: 'بە چی گەیشتوون لە کارەکان؟ (دوایین دەستکەوتی مەیدانی):', ar: 'آخر إنجاز ميداني متحقق:' })}</span>
                  </span>
                  <p className="text-emerald-950 font-medium leading-relaxed pt-1">
                    {language === 'en'
                      ? (selectedGmForInspect.latestAchievementEn || selectedGmForInspect.latestAchievementKu || 'Successfully interconnected all company departments and ahead of delivery schedule.')
                      : (selectedGmForInspect.latestAchievementKu || selectedGmForInspect.latestAchievementEn || 'سەرکەوتووانە سەرجەم ڕاپۆرت و بەشەکانی کۆمپانیا بەستراونەتەوە و کاتی جێبەجێکردن لەپێش وادەی دیاریکراوە.')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1">
                  <span className="font-extrabold text-blue-800 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>{getUIText(language, { en: 'Current Operational Focus for this GM:', ku: 'پوختەی کارەکانی ئێستای ئەم بەڕێوەبەرە گشتییە:', ar: 'التركيز التنفيذي الحالي لهذا المدير:' })}</span>
                  </span>
                  <p className="text-blue-950 font-medium leading-relaxed pt-1">
                    {language === 'en'
                      ? (selectedGmForInspect.currentWorkSummaryEn || selectedGmForInspect.currentWorkSummaryKu || 'Direct workforce supervision, financial audits, and weekly reporting to Holding Owner.')
                      : (selectedGmForInspect.currentWorkSummaryKu || selectedGmForInspect.currentWorkSummaryEn || 'سەرپەرشتی راستەوخۆی ستاف، وردبینی دارایی، و ئامادەکردنی راپۆرتی هەفتانە بۆ خاوەنی هۆلدینگ.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {getUIText(language, { en: 'Appointed Date:', ku: 'بەرواری پەیوەستبوون:', ar: 'تاريخ التعيين:' })}{' '}
                <span className="font-mono font-bold text-slate-800">{selectedGmForInspect.joinDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const dispName = language === 'en'
                      ? (selectedGmForInspect.fullName || selectedGmForInspect.fullNameKu)
                      : (selectedGmForInspect.fullNameKu || selectedGmForInspect.fullName);
                    startCallWithManager({
                      name: dispName,
                      role: 'General Manager',
                      phone: selectedGmForInspect.phone,
                      company: selectedGmForInspect.assignedCompanyName || 'Holding Company',
                      avatar: selectedGmForInspect.avatar || '👔'
                    });
                    setSelectedGmForInspect(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{getUIText(language, { en: 'Direct Phone Call', ku: 'پەیوەندی تەلەفۆنی ڕاستەوخۆ', ar: 'اتصال هاتفي مباشر' })}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const dispName = language === 'en'
                      ? (selectedGmForInspect.fullName || selectedGmForInspect.fullNameKu)
                      : (selectedGmForInspect.fullNameKu || selectedGmForInspect.fullName);
                    requestHoldingMeeting({
                      sourceType: 'COMPANY',
                      sourceId: selectedGmForInspect.assignedCompanyId || 'comp-1',
                      sourceName: selectedGmForInspect.assignedCompanyName || dispName,
                      departmentName: 'Executive GM Desk',
                      agendaTopic: `Strategic Review with GM ${dispName}`
                    });
                    setSelectedGmForInspect(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{getUIText(language, { en: 'Urgent Video Meeting', ku: 'کۆبوونەوەی ڤیدیۆیی بەپەلە', ar: 'اجتماع فيديو عاجل' })}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
