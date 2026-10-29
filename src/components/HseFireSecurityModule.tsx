import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Calendar,
  Lock,
  Building2
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';

export const HseFireSecurityModule: React.FC = () => {
  const { hseLogs, addHseLog, companies, projects, selectedCompanyId } = useERP();
  const { t, language } = useLanguage();

  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'FIRE_SAFETY_INSPECTION' | 'GATE_SECURITY_INCIDENT' | 'DRILL_EXERCISE' | 'PPE_COMPLIANCE'>('FIRE_SAFETY_INSPECTION');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('LOW');
  const [description, setDescription] = useState('');

  const filteredLogs = hseLogs.filter(l => {
    if (selectedCompanyId !== 'ALL' && l.companyId !== selectedCompanyId) return false;
    return true;
  });

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    addHseLog({
      companyId: companies[0]?.id || 'comp-1',
      projectId: 'proj-101',
      type,
      title,
      severity,
      dateReported: new Date().toISOString().split('T')[0],
      reportedBy: 'Civil Defense & Safety Officer',
      description,
      actionTaken: 'Inspected and verified compliant with KRG Civil Defense regulations.',
      status: 'RESOLVED',
      fireExtinguisherChecked: true,
      emergencyExitClear: true,
    });
    setIsAddLogOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4 text-rose-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t('navHseSecurity')} (HSE, Fire Fighting & Site Security)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Civil defense protocols, fire suppression readiness, hydrants, perimeter gate security, and incident logs.
          </p>
        </div>

        <button
          onClick={() => setIsAddLogOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition transform active:scale-95 cursor-pointer"
          id="add-hse-report-btn"
        >
          <Plus className="w-4 h-4" />
          <span>New Safety / Fire Report</span>
        </button>
      </div>

      {/* Fire Readiness Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Civil Defense Compliance</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            99.4%
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Certified Across All Subsidiaries</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fire Extinguishers Active</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            420 Units
          </div>
          <span className="text-xs text-emerald-600 mt-1 block">100% Tested & Tagged</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Evacuation Readiness</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            2.4 Mins
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Average Site Clearing Time</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Perimeter Gate Guards</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">
            36 On Duty
          </div>
          <span className="text-xs text-slate-400 mt-1 block">24/7 Barcode & OCR Control</span>
        </div>
      </div>

      {/* Safety Logs */}
      <div className="space-y-3">
        {filteredLogs.map((log) => {
          const isResolved = log.status === 'RESOLVED';
          return (
            <div
              key={log.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <h3 className="font-extrabold text-slate-900 text-sm">{log.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {log.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{log.dateReported}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isResolved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {log.description}
              </p>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span><strong>Corrective Action:</strong> {log.actionTaken}</span>
                </div>
                <span className="text-[11px] text-slate-400">Reported by: {log.reportedBy}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Log Modal */}
      {isAddLogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Record Safety / Fire Log</h3>
            <form onSubmit={handleAddLog} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Report Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Fire Hydrant Pressure Verification"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Log Type</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                >
                  <option value="FIRE_SAFETY_INSPECTION">Fire Safety Inspection</option>
                  <option value="GATE_SECURITY_INCIDENT">Gate Security Incident</option>
                  <option value="DRILL_EXERCISE">Drill Exercise</option>
                  <option value="PPE_COMPLIANCE">PPE Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Findings</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddLogOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                >
                  Save HSE Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
