import React, { useState } from 'react';
import {
  Home,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  Building,
  Coffee,
  ShieldCheck,
  UtensilsCrossed,
  Bed,
  FolderKanban,
  ChevronRight
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';

export const AccommodationModule: React.FC = () => {
  const { camps, addCamp, companies, projects, foreignWorkers, setActiveTab } = useERP();
  const { t, language } = useLanguage();

  const [isAddCampOpen, setIsAddCampOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [type, setType] = useState<'ENGINEERS_RESIDENCE' | 'WORKERS_CAMP' | 'VIP_GUESTHOUSE'>('ENGINEERS_RESIDENCE');
  const [totalCapacity, setTotalCapacity] = useState(60);
  const [supervisorName, setSupervisorName] = useState('سەرپەرشتیاری نیشتەجێبوون');

  const totalBeds = camps.reduce((sum, c) => sum + (c.totalCapacity || 0), 0);
  const totalOccupants = camps.reduce((sum, c) => sum + (c.currentOccupants || 0), 0);

  const handleAddCamp = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === selectedProjectId);
    addCamp({
      name,
      nameKu: name,
      type,
      location: proj ? `${proj.location} - Residential Hub` : 'Erbil Construction Zone #4',
      totalCapacity: Number(totalCapacity),
      currentOccupants: 0,
      supervisorName,
      supervisorPhone: '+964 750 441 9898',
      projectId: proj?.id,
      projectName: proj?.nameKu || proj?.name,
      companyId: proj?.companyId,
      facilities: ['High-speed Wi-Fi', 'Central HVAC', '24/7 Catering & Dining', 'Laundry Room', 'First Aid Room'],
      inspectionStatus: 'COMPLIANT',
      lastInspectionDate: new Date().toISOString().split('T')[0],
    });
    setIsAddCampOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Home className="w-4 h-4 text-indigo-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t('navAccommodation')} (Engineers & Labor Camps)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Housing compounds, engineers residences, labor village facilities, hygiene and catering tracking.
          </p>
        </div>

        <button
          onClick={() => setIsAddCampOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition transform active:scale-95 cursor-pointer"
          id="add-camp-facility-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Add Housing Camp</span>
        </button>
      </div>

      {/* Capacity Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Bed Capacity</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {totalBeds} Beds
          </div>
          <span className="text-xs text-blue-600 mt-1 block font-medium">Across {camps.length} Managed Compounds</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Inhabitants</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {totalOccupants} Residents
          </div>
          <span className="text-xs text-emerald-600 mt-1 block font-medium">{((totalOccupants / (totalBeds || 1)) * 100).toFixed(0)}% Occupancy Rate</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Vacancies</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {totalBeds - totalOccupants} Ready Beds
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Available for incoming engineers & staff</span>
        </div>
      </div>

      {/* Camps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {camps.map((camp) => {
          const occupancyRate = ((camp.currentOccupants / (camp.totalCapacity || 1)) * 100).toFixed(0);
          const campWorkers = foreignWorkers.filter(w => 
            w.accommodationCampId === camp.id || 
            (camp.projectId && (w.projectId === camp.projectId || w.assignedProjectId === camp.projectId))
          );

          return (
            <div
              key={camp.id}
              className="bg-white border border-slate-200/80 hover:border-purple-300 rounded-3xl p-6 shadow-xs space-y-4 transition"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {camp.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {camp.inspectionStatus}
                    </span>
                    {camp.projectName && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <FolderKanban className="w-3 h-3" /> {camp.projectName}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1.5">{camp.nameKu || camp.name}</h3>
                  <p className="text-xs text-slate-500">{camp.location}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('foreign-workers')}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>{campWorkers.length} بیانی</span>
                  <ChevronRight className="w-3 h-3 text-purple-400" />
                </button>
              </div>

              {/* Occupancy Gauge */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">توانای گرتن و جێگاکان (Capacity)</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {campWorkers.length || camp.currentOccupants} / {camp.totalCapacity} ({((Math.max(campWorkers.length, camp.currentOccupants) / (camp.totalCapacity || 1)) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className="bg-purple-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.round((Math.max(campWorkers.length, camp.currentOccupants) / (camp.totalCapacity || 1)) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Supervisor & Facilities */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 font-medium block">سەرپەرشتیاری کەمپ:</span>
                  <span className="font-bold text-slate-900">{camp.supervisorName}</span>
                  <span className="text-[11px] text-blue-600 block font-mono">{camp.supervisorPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">خزمەتگوزارییەکان:</span>
                  <span className="text-[11px] text-slate-600 line-clamp-2">{camp.facilities.join('، ')}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Camp Modal */}
      {isAddCampOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">تۆمارکردنی خاڵی نیشتەجێبوون و کەمپ</h3>
            <form onSubmit={handleAddCamp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">پڕۆژەی پەیوەستکراو</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                >
                  <option value="">کەمپی سەربەخۆ / گشتی</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.nameKu || p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ناوی کەمپ / خاڵی نیشتەجێبوون</label>
                <input
                  type="text"
                  required
                  placeholder="وەک: کەمپی نیشتەجێبوونی بیانیەکانی پڕۆژە"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">جۆری شوێن</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                >
                  <option value="ENGINEERS_RESIDENCE">کەمپی ئەندازیارانی بیانی (Engineers Residence)</option>
                  <option value="WORKERS_CAMP">کەمپی کارمەندان و کرێکاران (Workers Camp)</option>
                  <option value="VIP_GUESTHOUSE">سویت و میوانخانەی تایبەت (VIP Guesthouse)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">توانای گرتن (ژمارەی قەرەوێڵە)</label>
                <input
                  type="number"
                  required
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ناوی سەرپەرشتیار</label>
                <input
                  type="text"
                  required
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddCampOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                >
                  تۆمارکردنی کەمپ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
