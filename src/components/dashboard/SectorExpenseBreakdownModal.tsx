import React, { useState } from 'react';
import {
  X,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  FileSpreadsheet,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Tag,
  Briefcase,
  Layers,
  Download
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { HoldingSectorKpi } from '../../types/kpi';
import { exportSingleSectorToExcel, exportSingleSectorToPdf } from '../../utils/kpiExportUtils';
import { useLanguage } from '../../context/LanguageContext';

interface SectorExpenseBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  sector: HoldingSectorKpi | null;
  holdingName?: string;
}

export const SectorExpenseBreakdownModal: React.FC<SectorExpenseBreakdownModalProps> = ({
  isOpen,
  onClose,
  sector,
  holdingName = 'SAS4ERP Holding Group',
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'SUBCATEGORIES' | 'VOUCHERS' | 'CHART'>('SUBCATEGORIES');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  if (!isOpen || !sector) return null;

  const formatUSD = (amount: number) => `$${amount.toLocaleString()}`;
  const formatMillions = (amount: number) => `$${(amount / 1000000).toFixed(2)}M`;

  const handleExportExcel = () => {
    setIsExporting('excel');
    setTimeout(() => {
      exportSingleSectorToExcel(sector, holdingName);
      setIsExporting(null);
    }, 150);
  };

  const handleExportPdf = () => {
    setIsExporting('pdf');
    setTimeout(() => {
      exportSingleSectorToPdf(sector, holdingName);
      setIsExporting(null);
    }, 150);
  };

  const pieData = sector.subcategories.map(s => ({
    name: s.name,
    value: s.spentUSD,
    color: s.color,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
          <div className="flex items-start gap-3.5">
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-sm shrink-0 mt-0.5"
              style={{ backgroundColor: sector.color }}
            >
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-200 text-slate-800">
                  {sector.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  {sector.primaryKpiMetric}: {sector.primaryKpiValue}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  sector.status === 'EXCELLENT' ? 'bg-emerald-100 text-emerald-800' :
                  sector.status === 'ON_TRACK' ? 'bg-blue-100 text-blue-800' :
                  sector.status === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {sector.status === 'EXCELLENT' ? 'Optimal Performance' : sector.status === 'ON_TRACK' ? 'Within Budget' : 'Review Required'}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {sector.name}
              </h2>
              {language === 'ku' && sector.nameKu && (
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{sector.nameKu}</p>
              )}
              {language === 'ar' && sector.nameAr && (
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{sector.nameAr}</p>
              )}
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                {sector.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Summary Metrics Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Annual Sector Budget
            </span>
            <span className="text-lg font-extrabold text-slate-900 block mt-0.5">
              {formatMillions(sector.annualBudgetUSD)}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {formatUSD(sector.annualBudgetUSD)}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Actual Spending to Date
            </span>
            <span className="text-lg font-extrabold text-blue-600 block mt-0.5">
              {formatMillions(sector.spentUSD)}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {sector.utilizationRate}% Burned
            </span>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Remaining Reserve Variance
            </span>
            <span className="text-lg font-extrabold text-emerald-600 block mt-0.5">
              {formatMillions(sector.varianceUSD)}
            </span>
            <span className="text-[11px] text-slate-500">
              {sector.varianceUSD >= 0 ? 'Surplus / Available' : 'Overrun Alert'}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Subsidiaries & Sites
            </span>
            <span className="text-lg font-extrabold text-purple-600 block mt-0.5">
              {sector.companiesCount} Co. / {sector.activeProjectsCount} Sites
            </span>
            <span className="text-[11px] text-purple-700 font-semibold">
              Health: {sector.healthScore}%
            </span>
          </div>
        </div>

        {/* Tab Navigation & Export Actions Bar */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('SUBCATEGORIES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'SUBCATEGORIES'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Expense Categories ({sector.subcategories.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('VOUCHERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'VOUCHERS'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Audited Vouchers ({sector.recentVouchers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('CHART')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'CHART'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Cost Allocation Donut</span>
            </button>
          </div>

          {/* Quick Export for this Sector */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={isExporting !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
              title="Download Sector Excel Breakdown"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isExporting === 'excel' ? 'Exporting...' : 'Export Excel'}</span>
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExporting !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
              title="Download Sector PDF Statement"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExporting === 'pdf' ? 'Exporting...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'SUBCATEGORIES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Detailed Expense Categories & Variance</span>
                <span>Values in USD ($)</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Line Item / Subcategory</th>
                      <th className="py-3 px-3 text-right">Allocated Budget</th>
                      <th className="py-3 px-3 text-right">Actual Spent</th>
                      <th className="py-3 px-3 text-right">Variance Balance</th>
                      <th className="py-3 px-4 text-center">Utilization</th>
                      <th className="py-3 px-4 text-right">Share of Sector</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sector.subcategories.map((sub) => {
                      const share = sector.spentUSD > 0 ? ((sub.spentUSD / sector.spentUSD) * 100).toFixed(1) : '0';
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                              <div>
                                <span className="font-bold text-slate-900 block">{sub.name}</span>
                                {sub.nameKu && <span className="text-[10px] text-slate-500 block">{sub.nameKu}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-800">
                            {formatUSD(sub.budgetUSD)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-bold text-blue-600">
                            {formatUSD(sub.spentUSD)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-semibold text-emerald-600">
                            +{formatUSD(sub.varianceUSD)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="w-28 mx-auto space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                                <span>{sub.utilizationRate}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(sub.utilizationRate, 100)}%`,
                                    backgroundColor: sub.utilizationRate > 90 ? '#eab308' : '#2563eb'
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                            {share}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-200 font-extrabold text-slate-900">
                      <td className="py-3.5 px-4">Sector Total</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-900">{formatUSD(sector.annualBudgetUSD)}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-blue-600">{formatUSD(sector.spentUSD)}</td>
                      <td className="py-3.5 px-3 text-right font-mono text-emerald-600">+{formatUSD(sector.varianceUSD)}</td>
                      <td className="py-3.5 px-4 text-center text-blue-700">{sector.utilizationRate}%</td>
                      <td className="py-3.5 px-4 text-right">100.0%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'VOUCHERS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Audited General Ledger Disbursements</span>
                <span>Verified with official holding seals</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Voucher / Date</th>
                      <th className="py-3 px-4">Description & Cost Line</th>
                      <th className="py-3 px-4">Subsidiary / Payee</th>
                      <th className="py-3 px-4 text-right">Amount ($)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sector.recentVouchers.map((vch) => (
                      <tr key={vch.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900 block">{vch.voucherNumber}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {vch.date}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{vch.description}</span>
                          <span className="text-[11px] text-blue-600 font-semibold">{vch.subcategory}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block">{vch.companyName}</span>
                          <span className="text-[11px] text-slate-500">Vendor: {vch.vendor}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatUSD(vch.amountUSD)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            vch.status === 'HOLDING_APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            <ShieldCheck className="w-3 h-3" />
                            {vch.status === 'HOLDING_APPROVED' ? 'Holding Approved' : 'Audited'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'CHART' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatUSD(Number(val)), 'Spent Amount']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#cbd5e1' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Subcategory Spending Concentration
                </h4>
                <div className="space-y-2">
                  {sector.subcategories.map((sub) => {
                    const pct = sector.spentUSD > 0 ? ((sub.spentUSD / sector.spentUSD) * 100).toFixed(1) : '0';
                    return (
                      <div key={sub.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                          <span className="font-semibold text-slate-800">{sub.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-600">{formatMillions(sub.spentUSD)}</span>
                          <span className="font-bold text-slate-900 w-12 text-right">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Audited & consolidated from holding general ledger vouchers</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Excel (.xlsx)</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download PDF Statement</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
