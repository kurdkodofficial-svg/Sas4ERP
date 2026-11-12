import React, { useState, useRef } from 'react';
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
  Trash2,
  Upload,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Download,
  Sparkles,
  Check
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

interface DeptUploadedDoc {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'excel' | 'word' | 'image' | 'generic';
  uploadedAt: string;
  tag: string;
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

  // Drag and drop documents state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [departmentDocs, setDepartmentDocs] = useState<DeptUploadedDoc[]>([
    {
      id: 'doc-sample-1',
      name: `${department?.nameKu || 'Department'}_Official_Operational_Charter.pdf`,
      size: '1.4 MB',
      type: 'pdf',
      uploadedAt: '2026-11-01',
      tag: 'بەڵگەنامەی فەرمی'
    },
    {
      id: 'doc-sample-2',
      name: `Q4_Budget_Allocation_Sheet.xlsx`,
      size: '620 KB',
      type: 'excel',
      uploadedAt: '2026-11-05',
      tag: 'خشتەی دارایی و تێچوو'
    }
  ]);

  const fileDropInputRef = useRef<HTMLInputElement>(null);

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

  const determineFileType = (fileName: string): 'pdf' | 'excel' | 'word' | 'image' | 'generic' => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return 'excel';
    if (ext === 'docx' || ext === 'doc') return 'word';
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp') return 'image';
    return 'generic';
  };

  const handleFilesIngest = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: DeptUploadedDoc[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const type = determineFileType(f.name);
      const sizeStr = f.size > 1024 * 1024
        ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(f.size / 1024)} KB`;

      let defaultTag = 'بەڵگەنامەی گشتی';
      if (type === 'excel') defaultTag = 'خشتەی داتا (Excel)';
      else if (type === 'pdf') defaultTag = 'ڕاپۆرتی پەسەندکراو (PDF)';
      else if (type === 'word') defaultTag = 'گرێبەست و ڕێنمایی (Word)';
      else if (type === 'image') defaultTag = 'وێنە و بەڵگەی مەیدانی';

      newItems.push({
        id: `doc-${Date.now()}-${i}`,
        name: f.name,
        size: sizeStr,
        type,
        uploadedAt: new Date().toISOString().split('T')[0],
        tag: defaultTag
      });
    }

    setDepartmentDocs(prev => [...newItems, ...prev]);
    setUploadNotice(`سەرکەوتوو بوو: ${newItems.length} پەڕگە بە Drag & Drop بۆ ئەم بەشە هاوردەکران بەبێ پێویستی بە دووبارە نووسینەوە!`);
    setTimeout(() => setUploadNotice(null), 5000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesIngest(e.dataTransfer.files);
    }
  };

  const handleDeleteDoc = (id: string) => {
    setDepartmentDocs(prev => prev.filter(d => d.id !== id));
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

        {/* Operational Overview */}
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

        {/* DRAG & DROP DOCUMENT & DATA IMPORT HUB */}
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-extrabold text-slate-900">
                هاوردەکردنی بەڵگەنامە و داتاکان بە Drag & Drop (بێ دووبارە نووسینەوە):
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              Excel • PDF • Word • Images
            </span>
          </div>

          {/* Upload notice message */}
          {uploadNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadNotice}</span>
            </div>
          )}

          {/* Drop Zone Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-indigo-600 bg-indigo-50/80 scale-[1.01]'
                : 'border-slate-300 bg-slate-50/70 hover:bg-slate-100/70'
            }`}
            onClick={() => fileDropInputRef.current?.click()}
          >
            <input
              ref={fileDropInputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.png,.jpg,.jpeg"
              onChange={(e) => handleFilesIngest(e.target.files)}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 text-indigo-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                فایلەکانی Excel، PDF، یان Word بهێنە لێرە فڕێیان بدە (Drag & Drop)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                یان کلیک لێرە بکە بۆ هەڵبژاردنی پەڕگە لە کۆمپیوتەرەکەت
              </p>
            </div>
          </div>

          {/* List of Ingested Documents for this Department */}
          <div className="space-y-2 mt-2">
            <span className="text-[11px] font-bold text-slate-500 block">
              پەڕگە و بەڵگەنامە هاوردەکراوەکانی ئەم بەشە ({departmentDocs.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {departmentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      {doc.type === 'excel' ? (
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      ) : doc.type === 'pdf' ? (
                        <FileText className="w-4 h-4 text-red-600" />
                      ) : doc.type === 'word' ? (
                        <FileCode className="w-4 h-4 text-blue-600" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate text-[11px]">{doc.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span className="text-indigo-600 font-medium">{doc.tag}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => alert(`پەڕگەی «${doc.name}» بە سەلامەتی لە ئەرشیفی ئەم بەشەدا پارێزراوە.`)}
                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      title="بینین / داگرتن"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="سڕینەوە"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Responsibilities */}
        {department.keyResponsibilitiesKu && department.keyResponsibilitiesKu.length > 0 && (
          <div className="space-y-2 border-t border-slate-200 pt-4">
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
