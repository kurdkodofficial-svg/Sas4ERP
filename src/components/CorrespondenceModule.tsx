import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Inbox,
  Plus,
  Sparkles,
  Search,
  Filter,
  FileText,
  Building2,
  Stamp,
  Printer,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Video,
  AlertTriangle,
  Layers,
  ArrowRight,
  UserCheck,
  Award,
  Calendar,
  Eye,
  FileCheck
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { CorrespondenceLetter, DepartmentCategory, LetterApprovalStage } from '../types/erp';

export const CorrespondenceModule: React.FC = () => {
  const {
    correspondence,
    addCorrespondence,
    approveLetterByPM,
    approveLetterByGM,
    decideLetterByHolding,
    requestHoldingMeeting,
    companies,
    projects,
    holding,
    currentUser
  } = useERP();
  const { t, language } = useLanguage();

  const [filterType, setFilterType] = useState<'ALL' | 'INBOUND' | 'OUTBOUND' | 'PENDING_PM' | 'PENDING_GM' | 'PENDING_HOLDING' | 'APPROVED'>('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<CorrespondenceLetter | null>(null);

  // Form State for new memo
  const [letterType, setLetterType] = useState<'INBOUND' | 'OUTBOUND'>('OUTBOUND');
  const [subject, setSubject] = useState('');
  const [subjectKu, setSubjectKu] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || 'comp-1');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-101');
  const [isProjectOrigin, setIsProjectOrigin] = useState(true);
  const [originDept, setOriginDept] = useState<DepartmentCategory>('ENGINEERING');
  const [originDeptNameKu, setOriginDeptNameKu] = useState('بەشی ئەندازیاری و نەخشەسازی تەکنیکی');
  const [originDeptNameEn, setOriginDeptNameEn] = useState('Technical & Engineering Department');
  const [senderPerson, setSenderPerson] = useState(currentUser.name);
  const [senderRole, setSenderRole] = useState(currentUser.role);
  const [receiverOrg, setReceiverOrg] = useState(holding.nameKu || holding.name || 'Holding Executive Directorate');
  const [receiverPerson, setReceiverPerson] = useState(holding.chairmanName || 'Holding Chairman / Owner');
  const [urgency, setUrgency] = useState<'REGULAR' | 'URGENT' | 'TOP_SECRET_EXECUTIVE'>('URGENT');
  const [bodyText, setBodyText] = useState('');
  const [isAiDrafting, setIsAiDrafting] = useState(false);

  useEffect(() => {
    setReceiverOrg(holding.nameKu || holding.name || 'Holding Executive Directorate');
    setReceiverPerson(holding.chairmanName || 'Holding Chairman / Owner');
  }, [holding.nameKu, holding.name, holding.chairmanName]);

  const deptOptions: { id: DepartmentCategory; nameEn: string; nameKu: string; iconColor: string }[] = [
    { id: 'ENGINEERING', nameEn: 'Technical & Engineering', nameKu: 'بەشی ئەندازیاری و تەکنیکی', iconColor: 'text-blue-600 bg-blue-50' },
    { id: 'PROCUREMENT', nameEn: 'Procurement & Supply', nameKu: 'بەشی کڕین و دابینکردن', iconColor: 'text-amber-600 bg-amber-50' },
    { id: 'FINANCE', nameEn: 'Finance & Cost Control', nameKu: 'بەشی دارایی و کۆنتڕۆڵی تێچوو', iconColor: 'text-emerald-600 bg-emerald-50' },
    { id: 'HSE_SECURITY', nameEn: 'HSE & Safety', nameKu: 'بەشی تەندروستی و سەلامەتی (HSE)', iconColor: 'text-red-600 bg-red-50' },
    { id: 'SITE_OPERATIONS', nameEn: 'Site Operations & Machinery', nameKu: 'بەشی ئۆپەراسیۆن و ئامێرەکان', iconColor: 'text-purple-600 bg-purple-50' },
    { id: 'HR_LABOR', nameEn: 'Human Resources & Camps', nameKu: 'بەشی سەرچاوە مرۆییەکان و کەمپ', iconColor: 'text-pink-600 bg-pink-50' },
    { id: 'LEGAL_CONTRACTS', nameEn: 'Legal & Ministry Relations', nameKu: 'بەشی یاسایی و پەیوەندییەکان', iconColor: 'text-slate-600 bg-slate-100' },
    { id: 'WAREHOUSE_LOGISTICS', nameEn: 'Warehouse & Logistics', nameKu: 'بەشی کۆگا و لۆجستیك', iconColor: 'text-cyan-600 bg-cyan-50' },
    { id: 'QUALITY_CONTROL', nameEn: 'Quality Control (QA/QC)', nameKu: 'بەشی کۆنتڕۆڵی جۆری (QA/QC)', iconColor: 'text-indigo-600 bg-indigo-50' },
  ];

  const handleDeptChange = (deptId: DepartmentCategory) => {
    setOriginDept(deptId);
    const opt = deptOptions.find(d => d.id === deptId);
    if (opt) {
      setOriginDeptNameEn(opt.nameEn);
      setOriginDeptNameKu(opt.nameKu);
    }
  };

  const filteredLetters = correspondence.filter(l => {
    if (filterType === 'INBOUND' && l.type !== 'INBOUND') return false;
    if (filterType === 'OUTBOUND' && l.type !== 'OUTBOUND') return false;
    if (filterType === 'PENDING_PM' && l.approvalStage !== 'PENDING_PM_APPROVAL') return false;
    if (filterType === 'PENDING_GM' && l.approvalStage !== 'PENDING_GM_APPROVAL') return false;
    if (filterType === 'PENDING_HOLDING' && l.approvalStage !== 'PENDING_HOLDING_REVIEW') return false;
    if (filterType === 'APPROVED' && l.approvalStage !== 'HOLDING_APPROVED') return false;

    if (selectedDeptFilter !== 'ALL' && l.originDepartment !== selectedDeptFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubj = (l.subject || '').toLowerCase().includes(q) || (l.subjectKu || '').toLowerCase().includes(q);
      const matchNum = (l.letterNumber || '').toLowerCase().includes(q);
      const matchSender = (l.senderOrg || '').toLowerCase().includes(q) || (l.senderPerson || '').toLowerCase().includes(q);
      const matchDept = (l.originDepartmentNameKu || '').toLowerCase().includes(q) || (l.originDepartmentNameEn || '').toLowerCase().includes(q);
      if (!matchSubj && !matchNum && !matchSender && !matchDept) return false;
    }

    return true;
  });

  const handleAiDraft = async () => {
    if (!subject && !subjectKu) return;
    setIsAiDrafting(true);
    try {
      const res = await fetch('/api/gemini/generate-memo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: subjectKu || subject,
          from: `${senderPerson} (${originDeptNameKu})`,
          to: `${receiverPerson} (${receiverOrg})`,
          classification: urgency,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.memo) {
          setBodyText(data.memo);
        }
      } else {
        setBodyText(
          language === 'ku'
            ? `بەڕێز ${receiverPerson}،\nسڵاو و ڕێز\n\nئەم نووسراوە بە فەرمی لەلایەن ${originDeptNameKu} بەرز دەکرێتەوە سەبارەت بە: "${subjectKu || subject}". تکایە بەڕێزتان ڕەزامەندی و مۆری پێویستی لەسەر بدەن بەپێی ڕێنماییەکانی هۆلدینگ.`
            : `To: ${receiverPerson} (${receiverOrg})\n\nThis official correspondence is submitted by ${originDeptNameEn} regarding "${subject || subjectKu}". Awaiting executive endorsement according to holding governance.`
        );
      }
    } catch (err) {
      setBodyText(`Official memo submitted by ${originDeptNameKu} regarding ${subject || subjectKu}.`);
    } finally {
      setIsAiDrafting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const company = companies.find(c => c.id === selectedCompanyId) || companies[0];
    const project = isProjectOrigin ? projects.find(p => p.id === selectedProjectId) : undefined;

    addCorrespondence({
      type: letterType,
      companyId: selectedCompanyId,
      projectId: isProjectOrigin ? selectedProjectId : undefined,
      originDepartment: originDept,
      originDepartmentNameKu: originDeptNameKu,
      originDepartmentNameEn: originDeptNameEn,
      senderOrg: isProjectOrigin ? (project?.nameKu || project?.name || 'Project Site') : (company?.nameKu || company?.name),
      senderPerson,
      senderRole,
      receiverOrg,
      receiverPerson,
      subject: subject || subjectKu,
      subjectKu: subjectKu || subject,
      bodyText,
      date: new Date().toISOString().split('T')[0],
      urgency,
      originalLanguage: (language as any) || 'ku',
      attachmentName: 'Official_Stamped_Documentation.pdf',
      stampApproved: false,
      approvalStage: isProjectOrigin ? 'PENDING_PM_APPROVAL' : 'PENDING_GM_APPROVAL',
      isProjectOrigin,
      isBlockedWithoutPmApproval: isProjectOrigin,
      routingSteps: [
        {
          stage: 'DRAFT',
          stageNameKu: `ئامادەکردن لەلایەن ${originDeptNameKu}`,
          actorName: senderPerson,
          actorRole: senderRole,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'APPROVED',
        },
        ...(isProjectOrigin ? [{
          stage: 'PENDING_PM_APPROVAL' as const,
          stageNameKu: `چاوەڕوانی پەسەندکردنی بەڕێوەبەری پڕۆژە (${project?.manager || 'PM'})`,
          actorName: project?.manager || 'Project Manager',
          actorRole: 'Site PM',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'PENDING' as const,
          comments: 'قەدەغەیە بەبێ مۆری بەڕێوەبەری پڕۆژە ڕەوانەی هۆلدینگ بکرێت',
        }] : [{
          stage: 'PENDING_GM_APPROVAL' as const,
          stageNameKu: `چاوەڕوانی پەسەندکردنی بەڕێوەبەری گشتی (${company?.generalManager || 'GM'})`,
          actorName: company?.generalManager || 'General Manager',
          actorRole: 'Company GM',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'PENDING' as const,
        }])
      ]
    });

    setIsComposeOpen(false);
    setSubject('');
    setSubjectKu('');
    setBodyText('');
  };

  const getStageBadge = (stage: LetterApprovalStage, isBlocked?: boolean) => {
    switch (stage) {
      case 'PENDING_PM_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>چاوەڕوانی مۆری بەڕێوەبەری پڕۆژە (PM)</span>
          </span>
        );
      case 'PENDING_GM_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs">
            <UserCheck className="w-3 h-3 text-blue-600" />
            <span>چاوەڕوانی پەسەندی بەڕێوەبەری گشتی (GM)</span>
          </span>
        );
      case 'PENDING_HOLDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-300 shadow-2xs">
            <Award className="w-3 h-3 text-purple-600 animate-pulse" />
            <span>لەسەر مێزی خاوەن هۆلدینگ (Holding Seal)</span>
          </span>
        );
      case 'HOLDING_APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>مۆری کۆتایی هۆلدینگ لێدراوە (Approved & Sealed)</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-300 shadow-2xs">
            <ShieldAlert className="w-3 h-3 text-red-600" />
            <span>ڕەتکراوەتەوە (Rejected)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>ڕەشنووس (Draft)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                سیستەمی فەرمی نوسراوەکان و پەسەندکردنی پلەبەندی (Correspondence Workflow)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                چاودێری هەموو نوسراوێک لە بەشی سەرەکیەوە تا بەڕێوەبەری پڕۆژە (PM)، بەڕێوەبەری گشتی (GM)، و مۆری کۆتایی سەرۆکی هۆلدینگ
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition transform active:scale-95 cursor-pointer"
            id="compose-letter-btn"
          >
            <Plus className="w-4 h-4" />
            <span>دەرکردنی نوسراوی فەرمی نوێ (New Official Memo)</span>
          </button>
        </div>
      </div>

      {/* Governance Banner & Strict Pipeline Rule */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-3xl p-5 shadow-xs border border-blue-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-300 shrink-0 border border-blue-400/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-200 font-mono text-[10px] font-bold tracking-wider">SAS4ERP GOVERNANCE PIPELINE</span>
              <span className="text-xs font-bold text-amber-400">یاسای پلەبەندی هۆلدینگ</span>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              <strong>یاسای قەدەغەکردنی بەرزکردنەوەی ڕاستەوخۆ:</strong> پرۆژەکان ناتوانن بەبێ ڕەزامەندی و مۆری بەڕێوەبەری پرۆژە (PM) هیچ نوسراوێک بۆ هۆلدینگ بەرز بکەنەوە. نوسراو دەبێت لە <strong>بەشی پەیوەندیدار</strong> دەستپێبکات، لەلایەن <strong>PM</strong> پەسەند بکرێت، لەلایەن <strong>GM</strong> کۆمپانیا پەسەند بکرێت، و لەکۆتاییدا لەلایەن <strong>خاوەنی هۆلدینگ</strong> مۆری فەرمی لێبدرێت.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/15 text-xs">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>هۆلدینگ: <strong>{holding.nameKu || holding.name}</strong></span>
        </div>
      </div>

      {/* Filtering & Department Tabs */}
      <div className="space-y-3">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            هەموو نوسراوەکان ({correspondence.length})
          </button>
          <button
            onClick={() => setFilterType('PENDING_PM')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'PENDING_PM' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>چاوەڕوانی مۆری PM ({correspondence.filter(c => c.approvalStage === 'PENDING_PM_APPROVAL').length})</span>
          </button>
          <button
            onClick={() => setFilterType('PENDING_GM')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'PENDING_GM' ? 'bg-blue-600 text-white shadow-xs' : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>چاوەڕوانی پەسەندی GM ({correspondence.filter(c => c.approvalStage === 'PENDING_GM_APPROVAL').length})</span>
          </button>
          <button
            onClick={() => setFilterType('PENDING_HOLDING')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'PENDING_HOLDING' ? 'bg-purple-600 text-white shadow-xs' : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>لەسەر مێزی خاوەنی هۆلدینگ ({correspondence.filter(c => c.approvalStage === 'PENDING_HOLDING_REVIEW').length})</span>
          </button>
          <button
            onClick={() => setFilterType('APPROVED')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === 'APPROVED' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مۆری کۆتایی هۆلدینگ ({correspondence.filter(c => c.approvalStage === 'HOLDING_APPROVED').length})</span>
          </button>
        </div>

        {/* Department Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> بەشی سەرچاوە:
          </span>
          <button
            onClick={() => setSelectedDeptFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
              selectedDeptFilter === 'ALL' ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            هەموو بەشەکان
          </button>
          {deptOptions.map(dept => (
            <button
              key={dept.id}
              onClick={() => setSelectedDeptFilter(dept.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
                selectedDeptFilter === dept.id ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {dept.nameKu}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="گەڕان بەدوای بابەت، ژمارەی نوسراو، ناوی بەش، نێرەر، یان وەرگر..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200/80 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
        />
      </div>

      {/* Letters List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredLetters.map((letter) => {
          const isOut = letter.type === 'OUTBOUND';
          const company = companies.find(c => c.id === letter.companyId);
          const project = projects.find(p => p.id === letter.projectId);
          const isBlocked = letter.isBlockedWithoutPmApproval;

          return (
            <div
              key={letter.id}
              className={`bg-white border rounded-3xl p-5 shadow-xs space-y-4 transition flex flex-col justify-between ${
                isBlocked ? 'border-amber-300 ring-2 ring-amber-200/50 bg-amber-50/10' : 'border-slate-200/80 hover:border-blue-300'
              }`}
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isOut ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {isOut ? 'OUTBOUND / نێردراو' : 'INBOUND / هاتوو'}
                      </span>
                      {getStageBadge(letter.approvalStage, isBlocked)}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base mt-2 leading-snug">
                      {letter.subjectKu || letter.subject}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-blue-600 font-bold">{letter.letterNumber}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">{letter.date}</span>
                    </div>
                  </div>

                  {/* Urgency Badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 border ${
                    letter.urgency === 'TOP_SECRET_EXECUTIVE' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                    letter.urgency === 'URGENT' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {letter.urgency}
                  </span>
                </div>

                {/* Originating Department and Entity Block */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/70 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">کەم بەشەیە (Origin Dept):</span>
                    <span className="font-bold text-blue-700 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {letter.originDepartmentNameKu || letter.originDepartment || 'بەشی ئەندازیاری'}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {letter.senderOrg} ({letter.senderPerson})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">ئاراستەکراو بۆ (Destination):</span>
                    <span className="font-bold text-slate-900 block truncate">{letter.receiverOrg}</span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      بۆ: {letter.receiverPerson}
                    </span>
                  </div>
                </div>

                {/* Project Manager Block Alert if applicable */}
                {isBlocked && (
                  <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">ڕێگری بەڕێوەبەری پڕۆژە (PM Gate Required):</strong>
                      <span>ئەم نووسراوە لە پڕۆژەوە دەرچووە و قەدەغەیە بگاتە دەستەی هۆلدینگ تا لەلایەن بەڕێوەبەری پڕۆژە ({project?.manager || 'PM'}) مۆر و پەسەند نەکرێت.</span>
                    </div>
                  </div>
                )}

                {/* Body Snippet */}
                <div className="text-xs text-slate-700 line-clamp-3 bg-white p-3 rounded-2xl border border-slate-200/80 leading-relaxed font-serif">
                  {letter.bodyText}
                </div>

                {/* Routing Steps Mini Progress */}
                {letter.routingSteps && letter.routingSteps.length > 0 && (
                  <div className="pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1.5">ڕێڕەوی پەسەندکردن (Pipeline Path):</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {letter.routingSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                            step.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                            step.status === 'PENDING' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-red-100 text-red-800'
                          }`}>
                            {step.status === 'APPROVED' ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> : <Clock className="w-2.5 h-2.5 text-amber-600" />}
                            {step.stageNameKu}
                          </span>
                          {idx < letter.routingSteps.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedLetter(letter)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>پشکنینی وردەکاری و مۆرەکان</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* Action 1: PM Approval */}
                  {letter.approvalStage === 'PENDING_PM_APPROVAL' && (
                    <button
                      onClick={() => approveLetterByPM(letter.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      <Stamp className="w-3.5 h-3.5" />
                      <span>مۆری PM لێبدە</span>
                    </button>
                  )}

                  {/* Action 2: GM Approval */}
                  {letter.approvalStage === 'PENDING_GM_APPROVAL' && (
                    <button
                      onClick={() => approveLetterByGM(letter.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>پەسەندی GM و بەرزکردنەوە بۆ هۆلدینگ</span>
                    </button>
                  )}

                  {/* Action 3: Holding Owner Final Seal */}
                  {letter.approvalStage === 'PENDING_HOLDING_REVIEW' && (
                    <button
                      onClick={() => decideLetterByHolding(letter.id, 'APPROVED', 'Approved with Holding Chairman Seal')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer animate-bounce"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>مۆری کۆتایی خاوەنی هۆلدینگ (Seal)</span>
                    </button>
                  )}

                  {/* Action 4: Schedule Meeting with Holding */}
                  <button
                    onClick={() => requestHoldingMeeting({
                      sourceType: letter.projectId ? 'PROJECT' : 'COMPANY',
                      sourceId: letter.projectId || letter.companyId,
                      sourceName: letter.senderOrg,
                      departmentName: letter.originDepartmentNameKu,
                      agendaTopic: `Urgent review on letter: ${letter.subjectKu || letter.subject}`,
                    })}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 cursor-pointer"
                    title="ڕێکخستنی کۆبوونەوە لەگەڵ سەرۆکی هۆلدینگ لەسەر ئەم نوسراوە"
                  >
                    <Video className="w-3.5 h-3.5 text-purple-600" />
                    <span>کۆبوونەوە لەگەڵ هۆلدینگ</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Letter & Stamping Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <span className="text-7xl font-extrabold rotate-45 text-slate-900 font-serif uppercase tracking-widest">
                ZAGROS HOLDING GROUP
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-blue-600 font-bold">{selectedLetter.letterNumber}</span>
                  {getStageBadge(selectedLetter.approvalStage, selectedLetter.isBlockedWithoutPmApproval)}
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">{selectedLetter.subjectKu || selectedLetter.subject}</h2>
              </div>
              <button onClick={() => setSelectedLetter(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">✕</button>
            </div>

            {/* Department & Entity metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">کەم بەشەیە (Origin Department):</span>
                <span className="font-extrabold text-blue-700">{selectedLetter.originDepartmentNameKu || 'بەشی ئەندازیاری'}</span>
                <span className="text-slate-500 block text-[11px] mt-0.5">{selectedLetter.originDepartmentNameEn}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">نێرەر (From Entity):</span>
                <span className="font-bold text-slate-900">{selectedLetter.senderOrg}</span>
                <span className="text-slate-500 block text-[11px] mt-0.5">{selectedLetter.senderPerson} ({selectedLetter.senderRole || 'Director'})</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">وەرگر (To Entity):</span>
                <span className="font-bold text-slate-900">{selectedLetter.receiverOrg}</span>
                <span className="text-slate-500 block text-[11px] mt-0.5">{selectedLetter.receiverPerson}</span>
              </div>
            </div>

            {/* Official Letter Body with Official Letterhead Border */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-line space-y-4 relative shadow-inner">
              <div className="text-center border-b border-slate-200/80 pb-3">
                <span className="text-xs font-bold tracking-widest text-slate-700 uppercase">
                  {holding.nameKu || holding.name} {holding.name ? `• ${holding.name}` : ''}
                </span>
                <p className="text-[11px] text-slate-400">سیستەمی فەرمی هۆلدینگ • کەرتی نوسراوە یاسایی و کارگێڕییەکان</p>
              </div>

              <div className="py-2">
                {selectedLetter.bodyText}
              </div>

              {/* Digital Stamps Grid */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                {/* PM Stamp */}
                <div className={`p-3 rounded-2xl border ${
                  selectedLetter.projectManagerApproval?.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  <Stamp className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-[10px] font-bold block uppercase tracking-wider">مۆری بەڕێوەبەری پڕۆژە (PM)</span>
                  {selectedLetter.projectManagerApproval?.status === 'APPROVED' ? (
                    <div className="mt-1">
                      <strong className="text-xs block text-emerald-900">{selectedLetter.projectManagerApproval.approvedBy}</strong>
                      <span className="text-[10px] font-mono block">{selectedLetter.projectManagerApproval.digitalStampId}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] italic mt-1 block">چاوەڕوانی پەسەندکردن</span>
                  )}
                </div>

                {/* GM Stamp */}
                <div className={`p-3 rounded-2xl border ${
                  selectedLetter.subsidiaryGmApproval?.status === 'APPROVED' ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  <UserCheck className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-[10px] font-bold block uppercase tracking-wider">مۆری بەڕێوەبەری گشتی (GM)</span>
                  {selectedLetter.subsidiaryGmApproval?.status === 'APPROVED' ? (
                    <div className="mt-1">
                      <strong className="text-xs block text-blue-900">{selectedLetter.subsidiaryGmApproval.approvedBy}</strong>
                      <span className="text-[10px] font-mono block">{selectedLetter.subsidiaryGmApproval.digitalStampId}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] italic mt-1 block">چاوەڕوانی بەرزکردنەوە</span>
                  )}
                </div>

                {/* Holding Chairman Executive Seal */}
                <div className={`p-3 rounded-2xl border ${
                  selectedLetter.holdingExecutiveDecision?.decision === 'APPROVED' ? 'bg-purple-50 border-purple-300 text-purple-800 ring-2 ring-purple-300' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  <Award className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                  <span className="text-[10px] font-bold block uppercase tracking-wider">مۆری فەرمی خاوەنی هۆلدینگ</span>
                  {selectedLetter.holdingExecutiveDecision?.decision === 'APPROVED' ? (
                    <div className="mt-1">
                      <strong className="text-xs block text-purple-900">{selectedLetter.holdingExecutiveDecision.decidedBy}</strong>
                      <span className="text-[10px] font-mono block text-purple-700">{selectedLetter.holdingExecutiveDecision.officialSealNumber}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] italic mt-1 block">لەسەر مێزی خاوەن هۆلدینگ</span>
                  )}
                </div>
              </div>
            </div>

            {/* Pipeline Stepper Log */}
            {selectedLetter.routingSteps && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-700">تۆماری مێژوویی بڕیارەکان (Approval Audit Log):</h4>
                <div className="space-y-2">
                  {selectedLetter.routingSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200/80">
                      <div className="flex items-center gap-2">
                        {step.status === 'APPROVED' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-600 animate-pulse" />}
                        <div>
                          <strong className="text-slate-900 block">{step.stageNameKu}</strong>
                          <span className="text-[11px] text-slate-500">{step.actorName} ({step.actorRole}) - {step.comments || 'No remarks'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{step.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 text-xs">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>چاپکردنی فەرمی نوسراو (Print with Watermark)</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedLetter.approvalStage === 'PENDING_PM_APPROVAL' && (
                  <button
                    onClick={() => {
                      approveLetterByPM(selectedLetter.id);
                      setSelectedLetter(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                  >
                    پەسەندکردن بە مۆری بەڕێوەبەری پڕۆژە (PM)
                  </button>
                )}

                {selectedLetter.approvalStage === 'PENDING_GM_APPROVAL' && (
                  <button
                    onClick={() => {
                      approveLetterByGM(selectedLetter.id);
                      setSelectedLetter(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                  >
                    پەسەندکردن بە مۆری بەڕێوەبەری گشتی (GM)
                  </button>
                )}

                {selectedLetter.approvalStage === 'PENDING_HOLDING_REVIEW' && (
                  <button
                    onClick={() => {
                      decideLetterByHolding(selectedLetter.id, 'APPROVED');
                      setSelectedLetter(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs cursor-pointer animate-pulse"
                  >
                    لێدانی مۆری سەرۆکی هۆلدینگ (Holding Seal)
                  </button>
                )}

                <button
                  onClick={() => setSelectedLetter(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  داخستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compose Official Correspondence Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">دەرکردنی نوسراوی فەرمی (Compose Official Memo)</h3>
                <p className="text-xs text-slate-500">بەستنەوە بە بەش و پڕۆژە لەگەڵ چاودێری مۆری PM و GM تا هۆلدینگ</p>
              </div>
              <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Origin Type */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                  isProjectOrigin ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="originType"
                    checked={isProjectOrigin}
                    onChange={() => setIsProjectOrigin(true)}
                    className="accent-blue-600"
                  />
                  <span>لە پڕۆژەی مەیدانیەوە (Requires PM Stamp)</span>
                </label>

                <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                  !isProjectOrigin ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="originType"
                    checked={!isProjectOrigin}
                    onChange={() => setIsProjectOrigin(false)}
                    className="accent-blue-600"
                  />
                  <span>لە کۆمپانیای لاوەکیەوە (Direct to GM)</span>
                </label>
              </div>

              {/* Company & Project selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">کۆمپانیای پەیوەندیدار</label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.nameKu || c.name}</option>
                    ))}
                  </select>
                </div>

                {isProjectOrigin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">پڕۆژەی مەیدانی</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.nameKu || p.name} (PM: {p.manager})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Department Origin Selector (کەم بەشەیە) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">دیاریکردنی بەشی سەرچاوە (کەم بەشەیە)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {deptOptions.map(dept => (
                    <button
                      type="button"
                      key={dept.id}
                      onClick={() => handleDeptChange(dept.id)}
                      className={`p-2 rounded-xl text-xs font-bold text-right border transition flex items-center gap-2 cursor-pointer ${
                        originDept === dept.id ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{dept.nameKu}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">بابەتی نوسراو (Subject)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="بۆ نموونە: داواکاری دابینکردنی بودجەی کەرەستەی ئەندازیاری و کرینی سێیەم..."
                    value={subjectKu}
                    onChange={(e) => {
                      setSubjectKu(e.target.value);
                      setSubject(e.target.value);
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAiDraft}
                    disabled={isAiDrafting || !subjectKu}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 shadow-xs cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAiDrafting ? 'ئامادەکردن...' : 'داڕشتن بە AI'}</span>
                  </button>
                </div>
              </div>

              {/* Senders & Receivers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ئاراستەکراو بۆ (دەستەی هۆلدینگ / وەزارەت)</label>
                  <input
                    type="text"
                    value={receiverOrg}
                    onChange={(e) => setReceiverOrg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">پلەی گرنگی (Classification)</label>
                  <select
                    value={urgency}
                    onChange={(e: any) => setUrgency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  >
                    <option value="REGULAR">ئاسایی (Regular)</option>
                    <option value="URGENT">بەپەلە (Urgent)</option>
                    <option value="TOP_SECRET_EXECUTIVE">نھێنی و خاوەن هۆلدینگ (Executive)</option>
                  </select>
                </div>
              </div>

              {/* Body Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">دەقی فەرمی نوسراوەکە (Letter Body)</label>
                <textarea
                  rows={5}
                  required
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="دەقی فەرمی نوسراوەکە بە کوردی، عەرەبی یان ئینگلیزی بنووسە..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs leading-relaxed font-serif focus:bg-white focus:outline-none"
                />
              </div>

              {/* Pipeline summary warning */}
              {isProjectOrigin && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>تێبینی سیستەم: ئەم نوسراوە یەکسەر ناگاتە هۆلدینگ، سەرەتا دەچێتە بەردەستی بەڕێوەبەری پڕۆژە بۆ پەسەندکردن.</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                >
                  تۆمارکردن و خستنە ناو ڕێڕەوی پەسەندکردن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
