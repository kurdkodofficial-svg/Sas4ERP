import React from 'react';
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  PhoneCall,
  Video,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';

export const SubsidiaryEfficiencyWidget: React.FC = () => {
  const {
    companies,
    startCallWithManager,
    setSelectedCompanyId,
    setActiveTab,
    setIsMeetingModalOpen,
  } = useERP();

  const { t, language } = useLanguage();

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {t('subsidiaryMatrixTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                Executive comparative benchmark of all managed subsidiary companies, GM hotlines, and capital efficiency.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('companies-projects')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          <span>Manage Group Companies</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((comp) => {
          const percentSpent = ((comp.spentUSD / (comp.annualBudgetUSD || 1)) * 100).toFixed(1);
          const localizedName = language === 'ku' && comp.nameKu ? comp.nameKu : language === 'ar' && comp.nameAr ? comp.nameAr : comp.name;

          return (
            <div
              key={comp.id}
              className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 space-y-4 transition shadow-2xs"
            >
              {/* Company Info Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      {comp.code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Est. {comp.establishedDate}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {localizedName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {comp.industry} • {comp.location}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Annual Budget</span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                    ${(comp.annualBudgetUSD / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>

              {/* Budget Burn & Utilization */}
              <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Spent: <strong className="text-slate-800 font-mono">${(comp.spentUSD / 1000000).toFixed(2)}M</strong></span>
                  <span className="font-bold text-slate-900">{percentSpent}% of Budget</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(parseFloat(percentSpent), 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-400 font-medium block text-[11px]">Active Projects</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                    {comp.activeProjectsCount} Major Sites
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-400 font-medium block text-[11px]">Workforce</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                    {comp.employeeCount} Personnel
                  </span>
                </div>
              </div>

              {/* GM & Direct Actions */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block font-medium">General Manager:</span>
                  <span className="text-xs font-bold text-slate-800 truncate block">{comp.generalManager}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => startCallWithManager({
                      name: comp.generalManager,
                      role: 'General Manager',
                      phone: comp.gmPhone,
                      company: comp.name,
                      avatar: '👔'
                    })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 transition cursor-pointer"
                    title="Direct Call GM"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call GM</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCompanyId(comp.id);
                      setActiveTab('companies-projects');
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
                    title="Inspect Subsidiary Details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
