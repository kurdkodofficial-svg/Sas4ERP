import React from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Users,
  Flame,
  ChevronRight,
  Clock,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';

export const RiskComplianceWidget: React.FC = () => {
  const { foreignWorkers, hseLogs, companies, setActiveTab } = useERP();
  const { t } = useLanguage();

  const expiringWorkers = foreignWorkers.filter(
    w => w.visaStatus === 'EXPIRING_SOON' || w.visaStatus === 'EXPIRED'
  );

  const pendingHseLogs = hseLogs.filter(l => l.status === 'UNDER_INVESTIGATION');

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {t('expatriateRiskTitle')} & Civil Defense
              </h2>
              <p className="text-xs text-slate-500">
                Residence permit (Iqama) renewals, labor visa compliance, and civil defense safety protocols.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('foreign-workers')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          <span>Expatriate Registry</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Risk Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Iqama Watchlist */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Expiring Iqamas / Visas ({expiringWorkers.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Action Required
            </span>
          </div>

          <div className="space-y-2">
            {expiringWorkers.slice(0, 3).map(worker => {
              const comp = companies.find(c => c.id === worker.companyId);
              return (
                <div
                  key={worker.id}
                  className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{worker.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {worker.jobTitle} • {worker.nationality} ({comp?.code})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Expires:</span>
                    <span className="font-bold text-rose-600 font-mono text-xs">{worker.iqamaExpiry}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Civil Defense & Safety Readiness */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Civil Defense Safety Readiness
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              99.4% Ready
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Fire Suppression & Extinguishers</div>
                <div className="text-[11px] text-slate-500">420 Active units across all project sites</div>
              </div>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 100% Tagged
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">HSE Safety Logs Investigated</div>
                <div className="text-[11px] text-slate-500">All recent safety audits cleared by officers</div>
              </div>
              <span className="text-blue-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 0 Major Violations
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
