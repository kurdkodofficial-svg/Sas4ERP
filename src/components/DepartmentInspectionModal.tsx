import React, { useState } from 'react';
import {
  Layers,
  X,
  UserCheck,
  Phone,
  Mail,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Video,
  Send,
  Building2,
  ShieldCheck,
  BarChart3,
  Calendar,
  Award,
  Trash2
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { DepartmentOverview } from '../types/erp';

interface DepartmentInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: DepartmentOverview | null;
  companyName: string;
  projectName?: string;
  entityType: 'COMPANY' | 'PROJECT';
  entityId: string;
}

export const DepartmentInspectionModal: React.FC<DepartmentInspectionModalProps> = ({
  isOpen,
  onClose,
  department,
  companyName,
  projectName,
  entityType,
  entityId,
}) => {
  const { requestHoldingMeeting, sendDirectMessage, deleteDepartmentFromEntity } = useERP();
  const [directiveText, setDirectiveText] = useState('');
  const [isDirectiveSent, setIsDirectiveSent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !department) return null;

  const budgetUsagePercent = department.budgetAllocatedUSD > 0
    ? Math.round((department.budgetSpentUSD / department.budgetAllocatedUSD) * 100)
    : 0;

  const handleSendDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directiveText.trim()) return;

    sendDirectMessage(
      'user-comp1-gm',
      `[HOLDING DIRECTIVE TO ${department.nameKu}]: ${directiveText}`,
      'HOLDING_DIRECTIVE'
    );
    setIsDirectiveSent(true);
    setDirectiveText('');
    setTimeout(() => setIsDirectiveSent(false), 4000);
  };

  const handleStartMeeting = () => {
    requestHoldingMeeting({
      sourceType: entityType,
      sourceId: entityId,
      sourceName: projectName || companyName,
      departmentName: department.nameKu,
      agendaTopic: `Holding Executive Departmental Review: Performance & KPI audit for ${department.nameKu}`,
    });
    onClose();
  };

  const headName = department.headName || 'Eng. Director';
  const headPhone = department.headPhone || '+964 750 111 2233';
  const headEmail = department.headEmail || 'dept.head@sas4holding.com';
  const staffCount = department.staffCount || 12;
  const statusSummaryKu = department.statusSummaryKu || 'کارەکان بەپێی پلانی ستراتیجی هۆلدینگ و پێوەرەکانی سەلامەتی و نەخشەسازی تەکنیکی بەڕێوەدەچن.';
  const statusSummary = department.statusSummary || 'Operations aligned with holding standards.';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 border border-blue-100">
              <Layers className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  {entityType === 'PROJECT' ? `پڕۆژە: ${projectName}` : `کۆمپانیا: ${companyName}`}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  پلەی کارامەیی: {department.healthScore || 94}%
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {department.nameKu}
              </h2>
              <p className="text-xs text-slate-500">{department.name} • {department.nameAr}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Head of Department Card & Quick Holding Contact */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              {headName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">بەرپرسی بەش ({department.headTitle || 'Head of Dept'}):</span>
              <h4 className="font-extrabold text-slate-900 text-sm">{headName}</h4>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                <span className="flex items-center gap-1 font-mono"><Phone className="w-3 h-3 text-slate-400" /> {headPhone}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {headEmail}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleStartMeeting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>کۆبوونەوەی دەستبەجێی هۆلدینگ</span>
            </button>
          </div>
        </div>

        {/* Operational Overview & How They Manage Work */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>چۆنیەتی بەڕێوەچوونی کارەکانی ئەم بەشە (Operational Methodology):</span>
          </h4>
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-xs text-slate-800 leading-relaxed">
            <p className="font-medium text-slate-900 mb-1">{statusSummaryKu}</p>
            <p className="text-[11px] text-slate-500 italic mt-1 border-t border-blue-100 pt-1.5">{statusSummary}</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
            <span className="text-[11px] text-slate-400 font-medium block">ژمارەی کارمەندان:</span>
            <span className="text-lg font-black text-slate-900">{staffCount} کارمەند</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
            <span className="text-[11px] text-slate-400 font-medium block">بودجەی تەرخانکراو:</span>
            <span className="text-lg font-black text-slate-900">${(department.budgetAllocatedUSD || 250000).toLocaleString()}</span>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full ${budgetUsagePercent > 85 ? 'bg-amber-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(100, budgetUsagePercent || 60)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block font-mono">خەرجکراو: ${(department.budgetSpentUSD || 150000).toLocaleString()} ({budgetUsagePercent || 60}%)</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 font-medium block">تۆماری بەستنەوە بە هۆلدینگ:</span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              بەستراوە بە SAS4ERP HQ
            </span>
          </div>
        </div>

        {/* Key Responsibilities */}
        {department.keyResponsibilitiesKu && department.keyResponsibilitiesKu.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-600" />
              <span>ئەرک و بەرپرسیارێتییە سەرەکییەکان (Core Responsibilities):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {department.keyResponsibilitiesKu.map((resp, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 text-xs flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span className="text-slate-800 font-medium">{resp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Send Direct Holding Executive Directive */}
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <Send className="w-4 h-4 text-blue-600" />
            <span>ناردنی ڕێنمایی و بڕیاری ڕاستەوخۆ لە سەرۆکی هۆلدینگەوە بۆ ئەم بەشە:</span>
          </h4>

          {isDirectiveSent && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>ڕێنمایی سەرۆکی هۆلدینگ بە سەرکەوتوویی گەیشتە بەڕێوەبەری ئەم بەشە!</span>
            </div>
          )}

          <form onSubmit={handleSendDirective} className="flex gap-2">
            <input
              type="text"
              placeholder={`بۆ نموونە: تکایە لە ماوەی ٤٨ کاتژمێردا ڕاپۆرتی وەرزی ڕادەستی هۆلدینگ بکەن...`}
              value={directiveText}
              onChange={(e) => setDirectiveText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!directiveText.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ناردنی فەرمان</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>سڕینەوەی ئەم بەشە</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-700 font-bold">دڵنیایت لە سڕینەوە؟</span>
                <button
                  type="button"
                  onClick={() => {
                    deleteDepartmentFromEntity(entityType, entityId, department.id);
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                >
                  بەڵێ، بسڕەوە
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
          >
            داخستن
          </button>
        </div>

      </div>
    </div>
  );
};
