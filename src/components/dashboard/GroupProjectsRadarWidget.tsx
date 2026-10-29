import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  HardHat,
  Users,
  ChevronRight,
  TrendingUp,
  MapPin,
  Filter,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { Project } from '../../types/erp';

interface Props {
  selectedCompanyFilter: string | 'ALL';
}

export const GroupProjectsRadarWidget: React.FC<Props> = ({
  selectedCompanyFilter,
}) => {
  const { projects, companies, setSelectedCompanyId, setActiveTab } = useERP();
  const { t, language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'>('ALL');

  const filteredProjects = projects.filter(p => {
    const matchCompany = selectedCompanyFilter === 'ALL' || p.companyId === selectedCompanyFilter;
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchCompany && matchStatus;
  });

  const totalEngineers = filteredProjects.reduce((acc, p) => acc + (p.engineersCount || 0), 0);
  const totalWorkers = filteredProjects.reduce((acc, p) => acc + (p.workersCount || 0), 0);
  const avgProgress = filteredProjects.length > 0
    ? (filteredProjects.reduce((acc, p) => acc + p.progressPercentage, 0) / filteredProjects.length).toFixed(0)
    : 0;

  const totalProjectsBudget = filteredProjects.reduce((acc, p) => acc + p.budgetUSD, 0);
  const totalProjectsSpent = filteredProjects.reduce((acc, p) => acc + p.spentUSD, 0);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
      
      {/* Header & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {t('projectRadarTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                Multi-site milestone tracking, workforce deployment, and delivery schedule adherence across subsidiaries.
              </p>
            </div>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'bg-white text-blue-600 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ON_HOLD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'ON_HOLD'
                ? 'bg-white text-amber-600 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            On Hold
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Overall Group Progress
          </span>
          <div className="text-xl font-extrabold text-blue-600 mt-1">
            {avgProgress}%
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Weighted average milestone</span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Site Engineers
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {totalEngineers} Lead Engineers
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Full-time on group sites</span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Field Workforce
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {totalWorkers} Technicians & Staff
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Active site workers</span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Project Budgets
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            ${(totalProjectsBudget / 1000000).toFixed(1)}M USD
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
            ${(totalProjectsSpent / 1000000).toFixed(1)}M spent ({((totalProjectsSpent / (totalProjectsBudget || 1)) * 100).toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* Projects List Grid */}
      <div className="space-y-3.5">
        {filteredProjects.map((proj) => {
          const comp = companies.find(c => c.id === proj.companyId);
          const isHighProgress = proj.progressPercentage >= 60;
          const localizedName = language === 'ku' && proj.nameKu ? proj.nameKu : language === 'ar' && proj.nameAr ? proj.nameAr : proj.name;

          return (
            <div
              key={proj.id}
              className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4.5 transition group space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      {comp?.code || 'HOLDING'}
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      {proj.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      proj.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {localizedName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {proj.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Manager: <strong className="text-slate-700">{proj.manager}</strong> ({proj.managerPhone})
                    </span>
                  </div>
                </div>

                <div className="flex md:flex-col items-end justify-between md:justify-center shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target Delivery</span>
                    <span className="text-xs font-bold text-slate-900 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      {proj.targetCompletionDate}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCompanyId(proj.companyId);
                      setActiveTab('companies-projects');
                    }}
                    className="mt-1 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Inspect Site</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress & Budget Utilization Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{proj.progressPercentage}% Completed</span>
                    <span className="text-slate-400">• Budget: ${proj.budgetUSD.toLocaleString()} (${proj.spentUSD.toLocaleString()} spent)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {proj.engineersCount} Eng • {proj.workersCount} Workers
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighProgress ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${proj.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
