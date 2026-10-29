import React, { useState } from 'react';
import {
  Users,
  Plus,
  Crown,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Clock,
  PhoneCall,
  Video,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Building2,
  DollarSign,
  FileText,
  Target,
  BarChart3,
  Calendar,
  Layers,
  X,
  Mail,
  UserCheck,
  Activity,
  Award
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { GeneralManagerProfile } from '../../types/erp';

export const GeneralManagersWidget: React.FC = () => {
  const {
    generalManagers,
    addGeneralManager,
    updateGeneralManager,
    deleteGeneralManager,
    companies,
    currentUser,
    startCallWithManager,
    requestHoldingMeeting,
    setSelectedCompanyId,
    setActiveTab,
    holding,
  } = useERP();

  const { t, language } = useLanguage();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGmForInspect, setSelectedGmForInspect] = useState<GeneralManagerProfile | null>(null);

  // Form states for adding General Manager
  const [fullName, setFullName] = useState('');
  const [fullNameKu, setFullNameKu] = useState('');
  const [title, setTitle] = useState('General Manager');
  const [assignedCompanyId, setAssignedCompanyId] = useState<string>(companies[0]?.id || '');
  const [phone, setPhone] = useState('+964 750 ');
  const [email, setEmail] = useState('');
  const [allocatedBudgetUSD, setAllocatedBudgetUSD] = useState<number>(0);
  const [currentWorkSummaryKu, setCurrentWorkSummaryKu] = useState('');
  const [latestAchievementKu, setLatestAchievementKu] = useState('');

  // Check if current user is Super Admin or Holding Owner
  const isSuperAdminOrOwner = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'HOLDING_OWNER';

  const handleOpenAddModal = () => {
    setFullName('');
    setFullNameKu('');
    setTitle('General Manager (بەڕێوەبەری گشتی)');
    setAssignedCompanyId(companies[0]?.id || '');
    setPhone('+964 750 ');
    setEmail('');
    setAllocatedBudgetUSD(0);
    setCurrentWorkSummaryKu('');
    setLatestAchievementKu('');
    setIsAddModalOpen(true);
  };

  const handleCreateGM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() && !fullNameKu.trim()) return;

    const assignedComp = companies.find(c => c.id === assignedCompanyId);

    addGeneralManager({
      fullName: fullName.trim() || fullNameKu.trim(),
      fullNameKu: fullNameKu.trim() || fullName.trim(),
      title: title.trim() || 'General Manager',
      assignedCompanyId: assignedCompanyId || undefined,
      assignedCompanyName: assignedComp ? (assignedComp.nameKu || assignedComp.name) : 'Holding Operations',
      phone: phone.trim() || '+964 750 000 0000',
      email: email.trim() || `gm.${(fullName || 'director').toLowerCase().replace(/\s+/g, '.')}@holding.com`,
      avatar: '👔',
      status: 'ACTIVE',
      kpiHealthScore: 92,
      completedMilestones: 4,
      totalAssignedTasks: 6,
      pendingApprovalsCount: 1,
      latestAchievementKu: latestAchievementKu.trim() || 'دەستپێکردنی قۆناغی سەرەکی پڕۆژە و ڕێکخستنی ستاف',
      latestAchievementEn: 'Commenced primary operational phase and workforce structuring',
      currentWorkSummaryKu: currentWorkSummaryKu.trim() || 'سەرپەرشتیکردنی کارەکانی رۆژانە، دابینکردنی پێداویستی، و وردبینی لە خەرجییەکان',
      currentWorkSummaryEn: 'Supervising daily operations, procurement, and expenditure audits',
      directReportsCount: 12,
      allocatedBudgetUSD: Number(allocatedBudgetUSD) || 0,
      spentBudgetUSD: 0,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
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
                  {generalManagers.length} {language === 'ku' ? 'بەڕێوەبەری گشتی' : language === 'ar' ? 'مدير عام' : 'General Managers'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>بینراوە بۆ خاوەنی هۆلدینگ</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                سوپەر ئەدمینی هۆلدینگ بەڕێوەبەری گشتی کۆمپانیاکان بە دوگمەی (+) زیاد دەکات؛ هەموو کار و بەرەوپێشچوون و داشبۆردەکانیان ڕاستەوخۆ لەژێر چاودێری خاوەنی هۆلدینگدایە.
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
            title="سوپەر ئەدمین دەتوانێت بەڕێوەبەری گشتی نوێ زیادبکات"
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
          <span className="text-slate-400 font-medium block text-[11px]">کۆی بەڕێوەبەرانی گشتی</span>
          <span className="font-extrabold text-slate-900 text-lg mt-0.5 block">
            {generalManagers.length} بەڕێوەبەر
          </span>
          <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">
            هەموویان لە هۆلدینگ بەستراون
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
          <span className="text-emerald-700 font-medium block text-[11px]">تێکڕای بەرەوپێشچوونی کارەکان</span>
          <span className="font-extrabold text-emerald-950 text-lg mt-0.5 block">
            {generalManagers.length > 0
              ? `${Math.round(generalManagers.reduce((acc, g) => acc + (g.kpiHealthScore || 85), 0) / generalManagers.length)}%`
              : '100%'}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> ئاستی سەرکەوتوو
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
          <span className="text-amber-800 font-medium block text-[11px]">مایڵستۆنە تەواوکراوەکان</span>
          <span className="font-extrabold text-amber-950 text-lg mt-0.5 block">
            {generalManagers.reduce((acc, g) => acc + (g.completedMilestones || 0), 0)} قۆناغی گەیشتوو
          </span>
          <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">
            لە لایەن خاوەنەوە بینراون
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200">
          <span className="text-purple-800 font-medium block text-[11px]">بودجەی ژێر سەرپەرشتی GMs</span>
          <span className="font-extrabold text-purple-950 text-lg mt-0.5 block">
            ${(generalManagers.reduce((acc, g) => acc + (g.allocatedBudgetUSD || 0), 0) / 1000000).toFixed(2)}M
          </span>
          <span className="text-[10px] text-purple-700 font-semibold mt-0.5 block">
            پەسەندکراوی خاوەنی هۆلدینگ
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
              هیچ بەڕێوەبەرێکی گشتی هێشتا تۆمار نەکراوە
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              سوپەر ئەدمینی هۆلدینگ دەتوانێت لە ڕێگەی دوگمەی شینی سەرەوە <strong>(+)</strong> بەڕێوەبەری گشتی بۆ کۆمپانیاکانی هۆلدینگ زیاد بکات تا خاوەنی هۆلدینگ کارەکانیان بە ڕوونی ببینێت.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>زیادکردنی یەکەم بەڕێوەبەری گشتی</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generalManagers.map((gm) => {
            const comp = companies.find(c => c.id === gm.assignedCompanyId);
            const progress = gm.totalAssignedTasks > 0
              ? Math.round((gm.completedMilestones / gm.totalAssignedTasks) * 100)
              : gm.kpiHealthScore || 90;

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
                            {gm.fullNameKu || gm.fullName}
                          </h3>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online" />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {gm.title}
                        </p>
                        <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-800 border border-blue-200/60">
                          {gm.assignedCompanyName || comp?.nameKu || comp?.name || 'کۆمپانیای هۆلدینگ'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">تەندروستی کار</span>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                        {gm.kpiHealthScore || 95}%
                      </span>
                    </div>
                  </div>

                  {/* Progress: بە چی گەیشتوون لە کارەکان */}
                  <div className="mt-3.5 p-3 rounded-xl bg-white border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1 text-[11px] text-slate-600">
                        <Target className="w-3.5 h-3.5 text-blue-600" />
                        <span>بەرەوپێشچوونی کارەکان (Milestones):</span>
                      </span>
                      <span className="text-blue-700 font-mono">{gm.completedMilestones} لە {gm.totalAssignedTasks} ئەرک ({progress}%)</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(10, progress))}%` }}
                      />
                    </div>

                    <div className="pt-1.5 text-[11px] space-y-1">
                      <div className="text-slate-800 font-bold leading-relaxed">
                        <span className="text-emerald-600 ml-1">✓ دوایین دەستکەوت:</span>
                        <span className="text-slate-700 font-medium">{gm.latestAchievementKu || 'پڕۆژەکە بەپێی خشتەی کاتی بەرەوپێش دەچێت.'}</span>
                      </div>
                      <div className="text-slate-600 text-[10px] leading-relaxed line-clamp-2">
                        <span className="text-blue-600 font-semibold ml-1">کاری ئێستا:</span>
                        <span>{gm.currentWorkSummaryKu || 'چاودێری خەرجییەکان و بەستنەوەی پڕۆژە لەگەڵ هۆلدینگ.'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info & Budget */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="p-2 rounded-lg bg-slate-100/70">
                      <span className="text-[10px] text-slate-400 block font-semibold">تەلەفۆن:</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px] truncate block">{gm.phone}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100/70">
                      <span className="text-[10px] text-slate-400 block font-semibold">بودجەی دیاریکراو:</span>
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
                    title="بینینی تەواوی داشبۆرد و وردەکارییەکانی بەڕێوەبەری گشتی لەلایەن خاوەنەوە"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>داشبۆرد و کارەکان</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => startCallWithManager({
                      name: gm.fullNameKu || gm.fullName,
                      role: 'General Manager',
                      phone: gm.phone,
                      company: gm.assignedCompanyName || 'Holding Subsidiary',
                      avatar: gm.avatar || '👔'
                    })}
                    className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 transition cursor-pointer"
                    title="پەیوەندی ڕاستەوخۆ بە بەڕێوەبەری گشتی"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => requestHoldingMeeting({
                      sourceType: 'COMPANY',
                      sourceId: gm.assignedCompanyId || 'comp-1',
                      sourceName: gm.assignedCompanyName || gm.fullName,
                      departmentName: 'General Management Hub',
                      agendaTopic: `Strategic Review with GM ${gm.fullNameKu || gm.fullName}`
                    })}
                    className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white border border-purple-200 transition cursor-pointer"
                    title="کۆبوونەوەی بەپەلەی ڤیدیۆیی لەگەڵ خاوەن"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>

                  {isSuperAdminOrOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`ئایا دڵنیایت لە سڕینەوەی بەڕێوەبەری گشتی ${gm.fullNameKu || gm.fullName}؟`)) {
                          deleteGeneralManager(gm.id);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-600 text-slate-400 hover:text-white transition cursor-pointer"
                      title="سڕینەوەی ئەم بەڕێوەبەرە لەلایەن سوپەر ئەدمین"
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
                  زیادکردنی بەڕێوەبەری گشتی نوێ (Super Admin)
                </h3>
                <p className="text-xs text-slate-500">
                  دەسەڵاتی سوپەر ئەدمین بۆ دانانی بەڕێوەبەری گشتی بۆ کۆمپانیاکانی هۆلدینگ بە تەواوی بینراو بۆ خاوەن
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateGM} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ناوی تەواوی بەڕێوەبەری گشتی (کوردی) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullNameKu}
                    onChange={(e) => {
                      setFullNameKu(e.target.value);
                      if (!fullName) setFullName(e.target.value);
                    }}
                    placeholder="بۆ نموونە: د. سەردار کەمال مەحمود"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ناوی فەرمی (ئینگلیزی / لاتینی)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Sardar Kamal"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    دەستنیشانکردن بۆ کۆمپانیا / کەرتی هۆلدینگ
                  </label>
                  <select
                    value={assignedCompanyId}
                    onChange={(e) => setAssignedCompanyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.nameKu || c.name}
                      </option>
                    ))}
                    <option value="">کەرتی ناوەندی بەڕێوەبردنی هۆلدینگ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ناونیشانی وەزیفی (Position Title)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="General Manager (بەڕێوەبەری گشتی)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ژمارەی مۆبایل و پەیوەندی *
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
                    بودجەی تەخانکراو بۆ ئەم GM ($ USD)
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
                  پوختەی ئەرک و کارەکانی ئێستای (بۆ خاوەنی هۆلدینگ)
                </label>
                <textarea
                  rows={2}
                  value={currentWorkSummaryKu}
                  onChange={(e) => setCurrentWorkSummaryKu(e.target.value)}
                  placeholder="بۆ نموونە: سەرپەرشتیکردنی قۆناغی دروستکردنی کارگە، دانانی گرێبەستی کڕین، و بەڕێوەبردنی ستافی ئەندازیاران..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  بە چی گەیشتوون لە کارەکان؟ (دوایین قۆناغی سەرکەوتوو)
                </label>
                <input
                  type="text"
                  value={latestAchievementKu}
                  onChange={(e) => setLatestAchievementKu(e.target.value)}
                  placeholder="بۆ نموونە: تەواوکردنی 85%ـی قۆناغی یەکەم و بەستنەوەی عەمبار بە هۆلدینگ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>تۆمارکردن و بەستنەوە بە هۆلدینگ</span>
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
                    {selectedGmForInspect.fullNameKu || selectedGmForInspect.fullName}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    بەڕێوەبەری گشتی چالاک
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
                <strong>بینراوی ڕاستەوخۆی خاوەنی هۆلدینگ:</strong> ئەم بەڕێوەبەرە گشتییە سەرجەم کارەکان و خەرجی و راپۆرتەکانی ڕاستەوخۆ دەگاتە مێزی خاوەنی هۆلدینگ.
              </div>
            </div>

            {/* Detailed Progress Breakdown: بە چی گەیشتوون لە کارەکان */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                بەرەوپێشچوونی کارەکان و دەستکەوتەکان
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-400 block font-semibold">تەندروستی ئەرکەکان</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">
                    {selectedGmForInspect.kpiHealthScore || 95}%
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-400 block font-semibold">قۆناغی تەواوکراو</span>
                  <span className="text-2xl font-black text-blue-600 mt-1 block">
                    {selectedGmForInspect.completedMilestones} / {selectedGmForInspect.totalAssignedTasks}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] text-slate-400 block font-semibold">بودجەی کۆنترۆڵکراو</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    ${(selectedGmForInspect.allocatedBudgetUSD || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">ڕێژەی تەواوبوونی گشتی کارەکان:</span>
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
                    <span>بە چی گەیشتوون لە کارەکان؟ (دوایین دەستکەوتی مەیدانی):</span>
                  </span>
                  <p className="text-emerald-950 font-medium leading-relaxed pt-1">
                    {selectedGmForInspect.latestAchievementKu || 'سەرکەوتووانە سەرجەم ڕاپۆرت و بەشەکانی کۆمپانیا بەستراونەتەوە و کاتی جێبەجێکردن لەپێش وادەی دیاریکراوە.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1">
                  <span className="font-extrabold text-blue-800 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>پوختەی کارەکانی ئێستای ئەم بەڕێوەبەرە گشتییە:</span>
                  </span>
                  <p className="text-blue-950 font-medium leading-relaxed pt-1">
                    {selectedGmForInspect.currentWorkSummaryKu || 'سەرپەرشتی راستەوخۆی ستاف، وردبینی دارایی، و ئامادەکردنی راپۆرتی هەفتانە بۆ خاوەنی هۆلدینگ.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                بەرواری پەیوەستبوون: <span className="font-mono font-bold text-slate-800">{selectedGmForInspect.joinDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    startCallWithManager({
                      name: selectedGmForInspect.fullNameKu || selectedGmForInspect.fullName,
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
                  <span>پەیوەندی تەلەفۆنی ڕاستەوخۆ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    requestHoldingMeeting({
                      sourceType: 'COMPANY',
                      sourceId: selectedGmForInspect.assignedCompanyId || 'comp-1',
                      sourceName: selectedGmForInspect.assignedCompanyName || selectedGmForInspect.fullName,
                      departmentName: 'Executive GM Desk',
                      agendaTopic: `Strategic Review with GM ${selectedGmForInspect.fullNameKu || selectedGmForInspect.fullName}`
                    });
                    setSelectedGmForInspect(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>کۆبوونەوەی ڤیدیۆیی بەپەلە</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
