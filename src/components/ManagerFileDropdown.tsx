import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  BookOpen,
  Crown,
  Building2,
  FileCheck2,
  ShieldCheck,
  ChevronDown,
  ArrowRightLeft,
  Upload,
  AlertCircle,
  FileCode,
  FileType,
  Award,
  Sparkles,
  Zap,
  Lock,
  Boxes,
  Wallet,
  PenTool
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useERP } from '../context/ERPContext';
import { generateEnterpriseUserManualDocx } from '../utils/userManualDocxGenerator';
import { openUserManualPrintView } from '../utils/userManualPdfGenerator';
import { convertDocxToPdfView, convertPdfToDocx } from '../utils/documentConverter';
import { generateWhyChooseSAS4ERPDocx, openWhyChooseSAS4ERPPdfView } from '../utils/whyChooseSAS4ERPGenerator';

interface ManagerFileDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const ManagerFileDropdown: React.FC<ManagerFileDropdownProps> = ({
  isOpen,
  onToggle,
  onClose
}) => {
  const { language, isRtl } = useLanguage();
  const { currentUser } = useERP();

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'guidelines' | 'downloads' | 'converter'>('guidelines');
  const [includeKu, setIncludeKu] = useState<boolean>(true);
  const [includeEn, setIncludeEn] = useState<boolean>(true);
  const [includeAr, setIncludeAr] = useState<boolean>(true);
  const [isGeneratingWord, setIsGeneratingWord] = useState<boolean>(false);
  const [isGeneratingWhyChoose, setIsGeneratingWhyChoose] = useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Converter States
  const [converterDirection, setConverterDirection] = useState<'docxToPdf' | 'pdfToDocx'>('docxToPdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Restrict access: Only for executive managers
  const isManager =
    currentUser.role === 'HOLDING_OWNER' ||
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'COMPANY_GM' ||
    currentUser.role === 'PROJECT_MANAGER';

  if (!isManager) return null;

  const showNotification = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4500);
  };

  const handleDownloadWordDoc = async () => {
    try {
      setIsGeneratingWord(true);
      const blob = await generateEnterpriseUserManualDocx({
        includeKurdish: includeKu,
        includeEnglish: includeEn,
        includeArabic: includeAr
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SAS4ERP_Executive_Manager_Manual_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification(language === 'ku' ? 'فایلی فەرمی وۆرد (.docx) بۆ بەڕێوەبەر دابەزێنرا!' : 'Executive Word manual (.docx) downloaded successfully!');
    } catch (err: any) {
      showNotification(err?.message || 'Error generating Word doc');
    } finally {
      setIsGeneratingWord(false);
    }
  };

  const handleDownloadWhyChooseDoc = async () => {
    try {
      setIsGeneratingWhyChoose(true);
      const blob = await generateWhyChooseSAS4ERPDocx({
        includeKurdish: includeKu,
        includeEnglish: includeEn,
        includeArabic: includeAr
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bo_Chi_Am_Systema_Bakarbenm_SAS4ERP.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification(language === 'ku' ? 'فایلی «بۆچی ئەم سیستەمە بەکاربێنم» بە سەرکەوتوویی دابەزێنرا!' : '"Why Choose SAS4ERP" Word document downloaded!');
    } catch (err: any) {
      showNotification(err?.message || 'Error generating file');
    } finally {
      setIsGeneratingWhyChoose(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setConversionError(null);
    }
  };

  const handleExecuteConversion = async () => {
    if (!selectedFile) return;
    try {
      setIsConverting(true);
      setConversionError(null);
      if (converterDirection === 'docxToPdf') {
        await convertDocxToPdfView(selectedFile, selectedFile.name);
        showNotification(language === 'ku' ? `فایلی «${selectedFile.name}» گۆڕدرا بۆ PDF و کرایەوە!` : `Converted to PDF successfully!`);
      } else {
        const docxBlob = await convertPdfToDocx(selectedFile, selectedFile.name);
        const outputName = selectedFile.name.replace(/\.[^/.]+$/, '') + '_Converted.docx';
        const url = URL.createObjectURL(docxBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outputName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification(language === 'ku' ? `فایلی PDF بە سەرکەوتوویی گۆڕدرا بۆ Word!` : `PDF converted and downloaded as Word!`);
      }
    } catch (err: any) {
      setConversionError(err?.message || 'Conversion error occurred');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="relative" ref={containerRef} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Trigger Button - Replaces "فایلی ڕێبەر" with "فایلی بەڕێوەبەر" */}
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer transform active:scale-95 shrink-0 shadow-md border ${
          isOpen
            ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300/50'
            : 'bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 hover:from-blue-800 hover:to-slate-950 text-white border-amber-400/90'
        }`}
        id="user-manual-word-btn"
        title={
          language === 'ku'
            ? 'فایلی تایبەتی بەڕێوەبەر: ڕێنماییەکان، دەسەڵاتەکان و دۆکیومێنتە فەرمییەکان'
            : 'Executive Manager File: Powers, Guidelines & Official Documentation'
        }
      >
        <FileText className={`w-4 h-4 ${isOpen ? 'text-slate-950' : 'text-amber-300 animate-pulse'}`} />
        <span className="font-black">
          {language === 'ku' ? '📁 فایلی بەڕێوەبەر' : language === 'ar' ? '📁 ملف المدير' : '📁 Manager File'}
        </span>
        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-mono font-black shadow-2xs">
          {currentUser.role === 'HOLDING_OWNER' ? 'OWNER' : currentUser.role === 'COMPANY_GM' ? 'GM' : 'PM'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-950' : 'text-amber-300'}`} />
      </button>

      {/* Anchored Dropdown Popover Panel Directly Underneath */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2.5 z-50 w-[92vw] sm:w-[580px] max-w-[620px] bg-white border-2 border-amber-400/90 rounded-3xl shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150 ${
            isRtl ? 'left-0 sm:left-0' : 'right-0 sm:right-0'
          }`}
          style={{ maxHeight: 'calc(100vh - 90px)' }}
        >
          {/* Header Strip with Manager Badge */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white p-4.5 border-b border-indigo-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                {currentUser.role === 'HOLDING_OWNER' ? (
                  <Crown className="w-5 h-5" />
                ) : currentUser.role === 'COMPANY_GM' ? (
                  <Building2 className="w-5 h-5" />
                ) : (
                  <FileCheck2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-sm sm:text-base text-white">
                    {language === 'ku' ? '📁 فایلی تایبەتی بەڕێوەبەر' : language === 'ar' ? '📁 ملف المدير التنفيذي' : '📁 Executive Manager Dossier'}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
                    {currentUser.role === 'HOLDING_OWNER' ? '👑 HOLDING OWNER' : currentUser.role === 'COMPANY_GM' ? '🏢 GENERAL MANAGER' : '🏗️ PROJECT MANAGER'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
                  {language === 'ku'
                    ? `بەخێربێیت بەڕێز (${currentUser.name}) • تایبەت بە کادیرانی باڵای بەڕێوەبردن`
                    : `Active Manager: ${currentUser.name} (${currentUser.title || currentUser.role})`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-3 py-1.5 gap-1.5 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('guidelines')}
              className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'guidelines'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'ڕێنمایی و دەسەڵاتەکان' : 'Manager Powers & Rules'}</span>
            </button>

            <button
              onClick={() => setActiveTab('downloads')}
              className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'downloads'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'داگرتنی دۆکیومێنت (Word / PDF)' : 'Official Downloads'}</span>
            </button>

            <button
              onClick={() => setActiveTab('converter')}
              className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'converter'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'گۆڕەری Word ⇄ PDF' : 'Document Converter'}</span>
            </button>
          </div>

          {/* Notice Feedback Banner */}
          {noticeMessage && (
            <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 px-4 py-2 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{noticeMessage}</span>
            </div>
          )}

          {/* Dropdown Scrollable Body */}
          <div className="p-4 sm:p-5 overflow-y-auto max-h-[58vh] space-y-4 text-slate-800 text-xs">
            
            {/* TAB 1: EXECUTIVE GUIDELINES & POWERS */}
            {activeTab === 'guidelines' && (
              <div className="space-y-3.5">
                {/* Specific Role Authority Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-amber-950">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span>
                      {currentUser.role === 'HOLDING_OWNER'
                        ? (language === 'ku' ? 'دەسەڵاتی باڵای خاوەنی هۆڵدینگ (Sovereign Authority):' : 'Holding Owner Sovereign Authority:')
                        : currentUser.role === 'COMPANY_GM'
                        ? (language === 'ku' ? 'دەسەڵاتی بەڕێوەبەری گشتی کۆمپانیا (GM Authority):' : 'Company General Manager Authority:')
                        : (language === 'ku' ? 'دەسەڵاتی بەڕێوەبەری مەیدانی پڕۆژە (PM Authority):' : 'Project Manager Authority:')}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-amber-900 font-medium">
                    {currentUser.role === 'HOLDING_OWNER'
                      ? (language === 'ku'
                          ? 'هیچ فەرمانێکی کڕین یان خەرجییەکی دارایی جێبەجێ ناکرێت تاوەکو واژۆ و مۆری کۆتایی جەنابت نەکەوێتە سەری. دەتوانیت لە ڕێگەی دوگمەی تایبەت دەسەڵات شۆڕ بکەیتەوە بۆ خوارەوە یان ڕەزامەندی پێشوەختە (CEO Pre-Approval) ببەخشیت.'
                          : 'Under ERP governance, purchases cannot be executed without your executive seal. You maintain authority to delegate spending downward or grant fast-track CEO pre-approval.')
                      : currentUser.role === 'COMPANY_GM'
                      ? (language === 'ku'
                          ? 'ئەرکی جەنابت پێداچوونەوە و تەزکیەی فەرمانەکانی کڕینە لە قۆناغی ٤ (Endorsement). لە کاتی ڕەزامەندی پێشوەختەی سەرۆکایەتی، واژۆی تۆ دەسەڵاتی هاتنەناوەوە بۆ پڕۆژە دەبەخشێت.'
                          : 'You review and endorse purchase orders at Step 4. When CEO pre-approval is active, your sign-off clears project entry.')
                      : (language === 'ku'
                          ? 'ئەرکی جەنابت دەستنیشانکردنی پێداویستی مەیدانییە (قۆناغی ١). کاتێک کەلوپەل دەگات بەڵام دارایی هێشتا پارەکەی سەرف نەکردووە، واژۆی جەنابت مەرجە بۆ بەردانی پارە لە پڕۆژەوە بۆ بەشی کڕین.'
                          : 'You initiate requisitions at Step 1. When cargo arrives before treasury disbursal, your sign-off is required to release project escrow to procurement.')}
                  </p>
                </div>

                {/* 5-Step Automated Workflow Rules */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                  <span className="font-extrabold text-xs text-slate-900 block flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>{language === 'ku' ? 'ڕێڕەوی ٥ قۆناغی پەسەندکردنی فەرمانی کڕین:' : '5-Step Purchase Approval Chain:'}</span>
                  </span>

                  <div className="space-y-1.5 font-medium text-[11px]">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <span><strong>١. بەڕێوەبەری پڕۆژە (PM):</strong> پشتڕاستکردنەوەی پێداویستی مەیدانی و بڕی کەرەستە</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">قۆناغی ١</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <span><strong>٢. بەرپرسی کۆگا (Warehouse):</strong> پشکنینی عەمبار و دڵنیابوون لە نەبوونی کەرەستە</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">قۆناغی ٢</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <span><strong>٣. بەشی دارایی (Finance):</strong> وردبینی دارایی و تەرخانکردنی بڕی پارەی پێویست</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">قۆناغی ٣</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <span><strong>٤. بەڕێوەبەری گشتی (GM):</strong> تەزکیە و پەسەندکردنی بەڕێوەبەری کۆمپانیا</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">قۆناغی ٤</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between text-amber-950 font-bold">
                      <span><strong>٥. خاوەنی هۆڵدینگ (Owner):</strong> واژۆ و مۆری کۆتایی بۆ ڕێگەپێدانی کڕین</span>
                      <span className="text-[10px] font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded">قۆناغی ٥</span>
                    </div>
                  </div>
                </div>

                {/* Gate Scanner Protocol Notice */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-1.5 text-emerald-950">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                    <Boxes className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'ku' ? 'پرۆتۆکۆلی سکانی دەروازە و پارەی کەمکراوە لە پڕۆژە:' : 'Inward Gate Scanner Protocol:'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-900/90 font-medium">
                    {language === 'ku'
                      ? 'لەگەڵ سکانکردنی بارکۆد، ڕێژەی کۆگا ڕاستەوخۆ نوێ دەبێتەوە و قەواڵەی دارایی خۆکارانە تۆمار دەکرێت. ئەگەر دارایی پارەکەی نەدابێت، خۆکار لە پارەی پڕۆژە کەم دەکرێتەوە و بۆ بەشی کڕین هەڵدەگیرێت.'
                      : 'Barcode scan instantly updates inventory and records accounting journal. If unpaid, project budget is deducted to procurement escrow.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: DOWNLOAD OFFICIAL DOCUMENTS */}
            {activeTab === 'downloads' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 font-medium">
                  {language === 'ku'
                    ? 'داگرتنی دۆکیومێنتە فەرمییەکانی سیستەم بە فۆرماتی Word (.docx) و PDF بۆ پێداچوونەوە، واژۆکردن و ئەرشیف:'
                    : 'Download certified enterprise documentation formatted for Microsoft Word and PDF print inspection:'}
                </p>

                {/* Card 1: Official Executive Manual */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">
                        {language === 'ku' ? '📖 فایلی ڕێنمایی تەواوی بەڕێوەبەر و سیستەم' : 'Official Enterprise System Manual'}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">٢١ بەش</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {language === 'ku' ? 'فایلی فەرمی Word بە ٣ زمان (کوردی، ئینگلیزی، عەرەبی)' : 'Comprehensive Word .docx containing all 21 modules & rules'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleDownloadWordDoc}
                      disabled={isGeneratingWord}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isGeneratingWord ? 'داگرتن...' : 'Word (.docx)'}</span>
                    </button>

                    <button
                      onClick={() => openUserManualPrintView({ includeKurdish: includeKu, includeEnglish: includeEn, includeArabic: includeAr })}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>

                {/* Card 2: Why Choose SAS4ERP Dossier */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-amber-950">
                        {language === 'ku' ? '⭐ فایلی «بۆچی ئەم سیستەمە بەکاربێنم»' : '"Why Choose SAS4ERP" Dossier'}
                      </span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">بۆ خاوەنکاران</span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5 font-medium">
                      {language === 'ku' ? 'بەراوردکاری تەواو لەگەڵ سیستەمەکانی تر لە بەشی کۆنترۆڵی خەرجی' : 'Enterprise comparison matrix & 14 unique holding differentiators'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleDownloadWhyChooseDoc}
                      disabled={isGeneratingWhyChoose}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isGeneratingWhyChoose ? '...' : 'Word (.docx)'}</span>
                    </button>

                    <button
                      onClick={() => openWhyChooseSAS4ERPPdfView({ includeKurdish: includeKu, includeEnglish: includeEn, includeArabic: includeAr })}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DOCUMENT CONVERTER WORD <-> PDF */}
            {activeTab === 'converter' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                  <button
                    onClick={() => {
                      setConverterDirection('docxToPdf');
                      setSelectedFile(null);
                      setConversionError(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      converterDirection === 'docxToPdf' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Word (.docx) ➔ PDF
                  </button>
                  <button
                    onClick={() => {
                      setConverterDirection('pdfToDocx');
                      setSelectedFile(null);
                      setConversionError(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      converterDirection === 'pdfToDocx' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    PDF ➔ Word (.docx)
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept={converterDirection === 'docxToPdf' ? '.docx' : '.pdf'}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-xs text-slate-800">
                    {selectedFile ? selectedFile.name : (language === 'ku' ? 'فایلەکە هەڵبژێرە بۆ گۆڕین' : 'Select file to convert')}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                  >
                    {language === 'ku' ? 'گەڕان لە کۆمپیوتەر...' : 'Browse file...'}
                  </button>
                </div>

                {conversionError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{conversionError}</span>
                  </div>
                )}

                {selectedFile && (
                  <button
                    onClick={handleExecuteConversion}
                    disabled={isConverting}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>{isConverting ? 'خەریکی گۆڕینە...' : (language === 'ku' ? 'دەستپێکردنی گۆڕین' : 'Start Conversion')}</span>
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Footer Bar */}
          <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>SAS4ERP Executive Governance System</span>
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              {language === 'ku' ? 'داخستن' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
