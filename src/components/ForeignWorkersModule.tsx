import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  Home,
  ShieldCheck,
  FileText,
  Clock,
  RefreshCw,
  FolderKanban,
  Bed,
  MapPin,
  Phone,
  Printer,
  X,
  Check,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { ForeignWorker } from '../types/erp';

export const ForeignWorkersModule: React.FC = () => {
  const {
    foreignWorkers,
    addForeignWorker,
    updateForeignWorker,
    renewForeignWorkerResidency,
    companies,
    projects,
    camps,
    selectedCompanyId,
  } = useERP();

  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'WORKERS' | 'PROJECT_HOUSING'>('WORKERS');
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [renewingWorker, setRenewingWorker] = useState<ForeignWorker | null>(null);

  // Filters
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [filterNationality, setFilterNationality] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL'); // ALL | EXPIRING_30_DAYS | EXPIRED | VALID
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Renewal Modal Form
  const [renewalNewDate, setRenewalNewDate] = useState('2027-10-20');
  const [renewalFeeUSD, setRenewalFeeUSD] = useState(350);
  const [renewalReceiptNo, setRenewalReceiptNo] = useState('');
  const [renewalNotes, setRenewalNotes] = useState('نوێکردنەوەی ساڵانەی ئیقامەی فەرمی لە ڕێگەی بەڕێوەبەرایەتی نشینگە');

  // New Foreign Worker Form State
  const [fullName, setFullName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [nationality, setNationality] = useState('Turkish (تورکی)');
  const [jobTitle, setJobTitle] = useState('Senior Tunnel & Structural Engineer');
  const [professionKu, setProfessionKu] = useState('ئەندازیاری باڵای ستراکچەر');
  const [departmentKu, setDepartmentKu] = useState('بەشی ئەندازیاری و جێبەجێکردن');
  const [sponsorCompanyId, setSponsorCompanyId] = useState(companies[0]?.id || 'comp-1');
  const [assignedProjectId, setAssignedProjectId] = useState(projects[0]?.id || 'proj-101');
  const [iqamaNumber, setIqamaNumber] = useState('');
  const [iqamaIssueDate, setIqamaIssueDate] = useState('2025-10-20');
  const [iqamaExpiryDate, setIqamaExpiryDate] = useState('2026-10-20');
  const [campName, setCampName] = useState('کەمپی نیشتەجێبوونی ئەندازیاران و بیانیەکانی پڕۆژە');
  const [buildingOrBlock, setBuildingOrBlock] = useState('Block B (Engineers Wing)');
  const [roomNumber, setRoomNumber] = useState('Room 204');
  const [bedNumber, setBedNumber] = useState('Bed 1');
  const [salaryUSD, setSalaryUSD] = useState(3500);
  const [emergencyContact, setEmergencyContact] = useState('+90 532 000 0000');

  // Calculate dynamic days remaining for any worker
  const getDaysRemaining = (worker: ForeignWorker) => {
    if (worker.daysRemaining !== undefined) return worker.daysRemaining;
    const expStr = worker.iqamaExpiryDate || worker.iqamaExpiry;
    if (!expStr) return 999;
    const today = new Date();
    const expDate = new Date(expStr);
    return Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Critical 30-Day Alert Workers
  const urgentExpiringWorkers = foreignWorkers.filter(w => {
    const days = getDaysRemaining(w);
    return days <= 30;
  });

  const expiredWorkers = foreignWorkers.filter(w => {
    const days = getDaysRemaining(w);
    return days <= 0;
  });

  const filteredWorkers = foreignWorkers.filter((worker) => {
    const days = getDaysRemaining(worker);

    if (filterProject !== 'ALL') {
      const matchP = worker.projectId === filterProject || worker.assignedProjectId === filterProject;
      if (!matchP) return false;
    }

    if (filterNationality !== 'ALL') {
      if (!worker.nationality.toLowerCase().includes(filterNationality.toLowerCase())) return false;
    }

    if (filterUrgency === 'EXPIRING_30_DAYS') {
      if (days > 30 || days <= 0) return false;
    } else if (filterUrgency === 'EXPIRED') {
      if (days > 0) return false;
    } else if (filterUrgency === 'VALID') {
      if (days <= 30) return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = (worker.fullName || worker.name || '').toLowerCase().includes(q);
      const matchPass = (worker.passportNumber || '').toLowerCase().includes(q);
      const matchIqama = (worker.iqamaNumber || '').toLowerCase().includes(q);
      const matchRoom = (worker.roomNumber || '').toLowerCase().includes(q);
      const matchTitle = (worker.jobTitle || '').toLowerCase().includes(q) || (worker.professionKu || '').includes(q);
      if (!matchName && !matchPass && !matchIqama && !matchRoom && !matchTitle) return false;
    }

    return true;
  });

  const handleOpenRenewal = (worker: ForeignWorker) => {
    setRenewingWorker(worker);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setRenewalNewDate(nextYear.toISOString().split('T')[0]);
    setRenewalReceiptNo(`REC-IQ-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const handleSaveRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingWorker) return;
    renewForeignWorkerResidency(renewingWorker.id, renewalNewDate, renewalReceiptNo, renewalNotes);
    setRenewingWorker(null);
  };

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === assignedProjectId);

    const today = new Date();
    const expDate = new Date(iqamaExpiryDate);
    const days = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let visaStatus: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' = 'VALID';
    if (days <= 0) visaStatus = 'EXPIRED';
    else if (days <= 30) visaStatus = 'EXPIRING_SOON';

    addForeignWorker({
      name: fullName,
      fullName,
      passportNumber,
      passportExpiry: '2029-12-31',
      nationality,
      jobTitle,
      professionKu,
      departmentKu,
      companyId: sponsorCompanyId,
      sponsorCompanyId,
      projectId: assignedProjectId,
      assignedProjectId,
      projectNameKu: proj?.nameKu || proj?.name,
      iqamaNumber: iqamaNumber || `IQ-${Math.floor(100000 + Math.random() * 900000)}`,
      iqamaIssueDate,
      iqamaExpiry: iqamaExpiryDate,
      iqamaExpiryDate,
      daysRemaining: days,
      visaStatus,
      accommodationCampId: proj?.accommodationDetails?.campId || 'camp-01',
      accommodationCampName: campName,
      housingLocation: `${proj?.location || 'Site Camp'} - ${campName}`,
      buildingOrBlock,
      roomNumber,
      bedNumber,
      salaryUSD: Number(salaryUSD) || 0,
      emergencyContact,
      sponsorCompany: companies.find(c => c.id === sponsorCompanyId)?.nameKu || 'Holding Company',
      joinDate: new Date().toISOString().split('T')[0],
    });

    setIsAddWorkerOpen(false);
    setFullName('');
    setPassportNumber('');
    setIqamaNumber('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white border border-purple-900/60 rounded-3xl p-6 sm:p-7 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                بەشی کاروباری بیانیەکان و نشینگە (Foreign Affairs & Iqama Dept)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-bold">
                سیستەمی چاودێری نیشتەجێبوون و ئاگاداری ١ مانگ
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              بەڕێوەبەرایەتی کارمەندانی بیانی و خاڵەکانی نیشتەجێبوون
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              چاودێری و نوێکردنەوەی بەردەوامی نیشتەجێبوون (ئیقامە)، پاسپۆرت، شوێنی حەوانەوە و کەمپ لە سەرجەم پڕۆژەکان، لەگەڵ سیستەمی ئاگادارکردنەوەی ئۆتۆماتیکی ١ مانگ پێش بەسەرچوون بۆ بەشی بیانیەکان.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddWorkerOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تۆمارکردنی کارمەندی نوێی بیانی</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-5 border-t border-purple-900/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('WORKERS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'WORKERS'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              تۆماری کارمەندان و ئیقامەکان ({foreignWorkers.length})
            </button>
            <button
              onClick={() => setActiveTab('PROJECT_HOUSING')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'PROJECT_HOUSING'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>خاڵەکانی نیشتەجێبوونی پڕۆژەکان (Camps)</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-slate-300 font-medium">کۆی بیانیەکان: </span>
              <strong className="text-white font-black">{foreignWorkers.length} کەس</strong>
            </div>
            <div className="bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-300">
              <span className="font-medium">ئاگاداری بەپەلە (≤٣٠ ڕۆژ): </span>
              <strong className="font-black text-rose-200">{urgentExpiringWorkers.length} کەس</strong>
            </div>
          </div>
        </div>
      </div>

      {/* CRITICAL 30-DAY WARNING BANNER (User requirement: بە مانگێک ئاگادارکردنەوەی بەشی بیانیەکان) */}
      {urgentExpiringWorkers.length > 0 && (
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white rounded-3xl p-5 shadow-lg border border-rose-700/80 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-300 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">
                    ⚠️ ئاگاداری بەپەلەی بەشی بیانیەکان: نیشتەجێبوون (ئیقامە)ی {urgentExpiringWorkers.length} کارمەند لە بەسەرچووندایە!
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-white text-rose-900 text-[10px] font-black uppercase">
                    ئاگاداری ١ مانگ
                  </span>
                </div>
                <p className="text-xs text-rose-200 mt-0.5 leading-relaxed">
                  بەپێی ڕێنماییەکانی بەڕێوەبەرایەتی نشینگە، پێویستە پێش ٣٠ ڕۆژ ڕێکارەکانی نوێکردنەوە یان دەرچوون دەستپێبکات بۆ دوورکەوتنەوە لە سزای دارایی.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFilterUrgency('EXPIRING_30_DAYS');
                setActiveTab('WORKERS');
              }}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-rose-900 font-black text-xs rounded-xl shadow-md shrink-0 cursor-pointer"
            >
              بینینی کەسانی دیاریکراو ({urgentExpiringWorkers.length})
            </button>
          </div>

          {/* Quick list of urgent personnel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-white/20">
            {urgentExpiringWorkers.slice(0, 3).map((w) => {
              const days = getDaysRemaining(w);
              const isPast = days <= 0;

              return (
                <div key={w.id} className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/15 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-extrabold text-white block truncate">{w.fullName || w.name}</span>
                    <span className="text-[11px] text-rose-200 block truncate">{w.nationality} • {w.jobTitle}</span>
                    <span className="text-[10px] font-bold font-mono mt-0.5 inline-block text-amber-300">
                      {isPast ? `بەسەرچووە (${Math.abs(days)} ڕۆژ پێش ئێستا)` : `${days} ڕۆژی ماوە`}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenRenewal(w)}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] shadow-sm shrink-0 cursor-pointer"
                  >
                    نوێکردنەوە
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 1: WORKERS REGISTRY */}
      {activeTab === 'WORKERS' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Project Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">سەرجەم پڕۆژەکان</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.nameKu || p.name}</option>
                  ))}
                </select>
              </div>

              {/* Urgency Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">هەموو دۆخەکانی نیشتەجێبوون</option>
                  <option value="EXPIRING_30_DAYS">⚠️ کەمتر لە ٣٠ ڕۆژ (ئاگاداری بەپەلە)</option>
                  <option value="EXPIRED">❌ بەسەرچووە</option>
                  <option value="VALID">✅ چالاک و نوێکراوە</option>
                </select>
              </div>

              {/* Nationality Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={filterNationality}
                  onChange={(e) => setFilterNationality(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">سەرجەم نەتەوەکان</option>
                  <option value="Turkish">تورکی (Turkish)</option>
                  <option value="Indian">هیندی (Indian)</option>
                  <option value="Egyptian">میسری (Egyptian)</option>
                  <option value="Syrian">سوری (Syrian)</option>
                  <option value="Lebanese">لوبنانی (Lebanese)</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="گەڕان بەپێی ناو، پاسپۆرت، ئیقامە، ژوور..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-purple-500"
              />
            </div>
          </div>

          {/* Foreign Workers Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkers.map((worker) => {
              const days = getDaysRemaining(worker);
              const isPast = days <= 0;
              const isWithin30 = days > 0 && days <= 30;
              const isValid = days > 30;

              const proj = projects.find(p => p.id === worker.projectId || p.id === worker.assignedProjectId);

              return (
                <div
                  key={worker.id}
                  className={`bg-white border rounded-3xl p-5 shadow-xs space-y-3.5 relative overflow-hidden transition ${
                    isPast
                      ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/15'
                      : isWithin30
                      ? 'border-amber-400 ring-2 ring-amber-200 bg-amber-50/15'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {/* Top Bar: Name, Job, Nationality */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-slate-900 text-base">
                        {worker.fullName || worker.name}
                      </h3>
                      <p className="text-xs text-purple-700 font-extrabold mt-0.5">
                        {worker.professionKu || worker.jobTitle}
                      </p>
                      <span className="text-[11px] text-slate-400 block">
                        {worker.departmentKu || worker.department || 'بەشی ئەندازیاری'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-black">
                        {worker.nationality}
                      </span>
                    </div>
                  </div>

                  {/* Iqama & Residency Status Box with 30-Day Alert */}
                  <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                    isPast
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : isWithin30
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">ژمارەی ئیقامە / نشینگە:</span>
                      <span className="font-mono font-black text-slate-900">{worker.iqamaNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">ژمارەی پاسپۆرت:</span>
                      <span className="font-mono font-bold text-slate-900">{worker.passportNumber}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">کاتی تەواوبوونی نیشتەجێبوون:</span>
                      <span className="font-mono font-black">
                        {worker.iqamaExpiryDate || worker.iqamaExpiry}
                      </span>
                    </div>

                    {/* Expiration Countdown Badge */}
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold">دۆخی یاسایی ئیقامە:</span>
                      {isPast ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black animate-pulse">
                          بەسەرچووە ({Math.abs(days)} ڕۆژ پێش ئێستا)
                        </span>
                      ) : isWithin30 ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black animate-bounce">
                          ئاگاداری بەپەلە: {days} ڕۆژی ماوە
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          چالاکە ({days} ڕۆژ ماوە)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Exact Housing Location Details (User requirement: خاڵی نیشتەجێبوون و شوێنی نیشتەجێبوون) */}
                  <div className="p-3 bg-purple-50/40 rounded-2xl border border-purple-100 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-purple-950">
                      <Home className="w-3.5 h-3.5 text-purple-700" />
                      <span>شوێنی نیشتەجێبوون لە پڕۆژە (Housing Hub):</span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5 pr-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">پڕۆژەی پەیوەستکراو:</span>
                        <strong className="text-slate-800">{worker.projectNameKu || proj?.nameKu || 'پڕۆژەی سەرەکی'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">کەمپ / باڵەخانە:</span>
                        <span className="font-bold text-slate-800">{worker.accommodationCampName || worker.campLocation || 'کەمپی ئەندازیاران'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">بلۆک و ژمارەی ژوور:</span>
                        <span className="font-mono font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                          {worker.buildingOrBlock || 'Block B'} • {worker.roomNumber} ({worker.bedNumber || 'Bed 1'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      مووچە: ${worker.salaryUSD?.toLocaleString()} USD
                    </span>

                    <button
                      onClick={() => handleOpenRenewal(worker)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        isPast || isWithin30
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                          : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>نوێکردنەوەی نیشتەجێبوون</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: PROJECT HOUSING POINTS (خاڵی نیشتەجێبوونی بیانیەکان لە سەرجەم پڕۆژەکان) */}
      {activeTab === 'PROJECT_HOUSING' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Home className="w-5 h-5 text-indigo-600" />
              <span>خاڵەکانی نیشتەجێبوونی بیانیەکان لە هەموو پڕۆژەکاندا</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              هەر پڕۆژەیەک خاوەنی خاڵی نیشتەجێبوون و کەمپی تایبەت بە خۆیەتی بۆ حەوانەوەی ئەندازیار و کرێکارە بیانییەکان بە سەرپەرشتیاری تایبەت و خزمەتگوزاری سەلامەتی.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => {
              // Find workers living in this project
              const projWorkers = foreignWorkers.filter(w => w.projectId === proj.id || w.assignedProjectId === proj.id);
              const campDetails = proj.accommodationDetails || {
                campName: `کەمپی نیشتەجێبوونی ${proj.nameKu || proj.name}`,
                campNameKu: `کەمپی نیشتەجێبوونی ئەندازیاران و کارمەندانی بیانی پڕۆژەی ${proj.nameKu || proj.name}`,
                location: `${proj.location} - Residential Campus`,
                type: 'ENGINEERS_RESIDENCE',
                totalBeds: 40,
                occupiedBeds: projWorkers.length,
                supervisorName: 'سەرپەرشتیاری کەمپ',
                supervisorPhone: proj.managerPhone,
                facilities: ['Central HVAC', 'High-Speed Wi-Fi', 'Dining Hall', '24/7 Security'],
                blockName: 'Foreign Staff Quarters'
              };

              return (
                <div key={proj.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {proj.code}
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-1">
                        {campDetails.campNameKu || campDetails.campName}
                      </h4>
                      <p className="text-xs text-slate-500">{proj.nameKu || proj.name} • {campDetails.location}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 block">نیشتەجێبووانی بیانی</span>
                      <span className="text-xl font-black text-purple-700">{projWorkers.length} کەس</span>
                    </div>
                  </div>

                  {/* Bed Capacity and Occupancy */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-center font-bold">
                    <div>
                      <span className="text-[10px] text-slate-400 block">قەبارەی تەواو</span>
                      <span className="text-sm text-slate-800">{campDetails.totalBeds} قەرەوێڵە</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">نیشتەجێبوو</span>
                      <span className="text-sm text-purple-700">{projWorkers.length} کەس</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">جێگەی بەتاڵ</span>
                      <span className="text-sm text-emerald-600">{Math.max(0, campDetails.totalBeds - projWorkers.length)} شوێن</span>
                    </div>
                  </div>

                  {/* Supervisor & Facilities */}
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">سەرپەرشتیاری کەمپ:</span>
                      <span className="font-bold text-slate-900">{campDetails.supervisorName} ({campDetails.supervisorPhone})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">خزمەتگوزارییەکان:</span>
                      <span className="font-semibold text-slate-700">{campDetails.facilities?.join(' • ')}</span>
                    </div>
                  </div>

                  {/* List of Foreign Personnel in this Project Camp */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-black text-slate-700 block mb-2">لیستی کارمەندانی نیشتەجێ لەم کەمپە:</span>
                    {projWorkers.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">هیچ کارمەندێکی بیانی تۆمار نەکراوە بۆ ئەم کەمپە.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {projWorkers.map(w => (
                          <div key={w.id} className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50 border border-purple-100 text-xs">
                            <div>
                              <strong className="text-slate-900 block font-bold">{w.fullName || w.name}</strong>
                              <span className="text-[10px] text-purple-700">{w.nationality} • {w.jobTitle}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono text-[11px] font-black text-purple-900 block">{w.roomNumber}</span>
                              <span className="text-[10px] text-slate-400">{w.iqamaExpiryDate || w.iqamaExpiry}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENEWAL MODAL (مۆداڵی نوێکردنەوەی نیشتەجێبوون و ئیقامە) */}
      {renewingWorker && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-black text-slate-900">ڕێکاری نوێکردنەوەی نیشتەجێبوون (ئیقامە)</h3>
              </div>
              <button onClick={() => setRenewingWorker(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs space-y-1">
              <strong className="text-purple-950 font-black block text-sm">
                {renewingWorker.fullName || renewingWorker.name}
              </strong>
              <div className="flex justify-between text-slate-600">
                <span>نەتەوە و پیشە:</span>
                <span className="font-bold">{renewingWorker.nationality} • {renewingWorker.jobTitle}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ژمارەی ئیقامەی ئێستا:</span>
                <span className="font-mono font-bold">{renewingWorker.iqamaNumber}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>بەرواری بەسەرچوونی ئێستا:</span>
                <span className="font-mono font-bold text-rose-700">{renewingWorker.iqamaExpiryDate || renewingWorker.iqamaExpiry}</span>
              </div>
            </div>

            <form onSubmit={handleSaveRenewal} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">بەرواری نوێی تەواوبوونی ئیقامە (ساڵێکی تر) *</label>
                <input
                  type="date"
                  value={renewalNewDate}
                  onChange={(e) => setRenewalNewDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">تێچووی رسومات ($ USD)</label>
                  <input
                    type="number"
                    value={renewalFeeUSD}
                    onChange={(e) => setRenewalFeeUSD(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ژمارەی وەسڵی فەرمانگەی نشینگە</label>
                  <input
                    type="text"
                    value={renewalReceiptNo}
                    onChange={(e) => setRenewalReceiptNo(e.target.value)}
                    placeholder="REC-IQ-..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">تێبینی و هۆکاری نوێکردنەوە</label>
                <textarea
                  rows={2}
                  value={renewalNotes}
                  onChange={(e) => setRenewalNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRenewingWorker(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>تەواوکردنی نوێکردنەوە و ئاگادارکردنەوەی هۆلدینگ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER NEW FOREIGN WORKER MODAL */}
      {isAddWorkerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-black text-slate-900">تۆمارکردنی کارمەند و ئەندازیاری نوێی بیانی</h3>
              </div>
              <button onClick={() => setIsAddWorkerOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWorker} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ناوی تەواو بە ئینگلیزی/فەرمی *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mehmet Yilmaz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">نەتەوە / ڕەگەزنامە *</label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="Turkish (تورکی)">Turkish (تورکی)</option>
                    <option value="Indian (هیندی)">Indian (هیندی)</option>
                    <option value="Egyptian (میسری)">Egyptian (میسری)</option>
                    <option value="Syrian (سوری)">Syrian (سوری)</option>
                    <option value="Lebanese (لوبنانی)">Lebanese (لوبنانی)</option>
                    <option value="European (ئەوروپی)">European (ئەوروپی)</option>
                    <option value="Chinese (چینی)">Chinese (چینی)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">پیشە و پسپۆڕی بە کوردی *</label>
                  <input
                    type="text"
                    required
                    value={professionKu}
                    onChange={(e) => setProfessionKu(e.target.value)}
                    placeholder="وەک: ئەندازیاری ستراکچەر"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">بەشی کارکردن لە پڕۆژە</label>
                  <input
                    type="text"
                    value={departmentKu}
                    onChange={(e) => setDepartmentKu(e.target.value)}
                    placeholder="بەشی ئەندازیاری، میکانیکی، HSE..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">پڕۆژەی دیاریکراو *</label>
                  <select
                    value={assignedProjectId}
                    onChange={(e) => setAssignedProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.nameKu || p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">کۆمپانیای کەفیل</label>
                  <select
                    value={sponsorCompanyId}
                    onChange={(e) => setSponsorCompanyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.nameKu || c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ژمارەی پاسپۆرت *</label>
                  <input
                    type="text"
                    required
                    placeholder="TR-..."
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ژمارەی ئیقامە *</label>
                  <input
                    type="text"
                    placeholder="IQ-ERB-..."
                    value={iqamaNumber}
                    onChange={(e) => setIqamaNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">بەرواری بەسەرچوونی ئیقامە *</label>
                  <input
                    type="date"
                    required
                    value={iqamaExpiryDate}
                    onChange={(e) => setIqamaExpiryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Exact Accommodation in Project */}
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200/80 space-y-3">
                <span className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-purple-700" />
                  خاڵی نیشتەجێبوون لەناو پڕۆژە (Project Accommodation Details):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ناوی کەمپ / نیشتەجێبوون</label>
                    <input
                      type="text"
                      value={campName}
                      onChange={(e) => setCampName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">بلۆک یان بەش</label>
                    <input
                      type="text"
                      value={buildingOrBlock}
                      onChange={(e) => setBuildingOrBlock(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ژمارەی ژوور و قەرەوێڵە</label>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="Room 102, Bed 1"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddWorkerOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  تۆمارکردن لە بەشی بیانیەکان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
