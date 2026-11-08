import React, { useState, useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  Globe,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Building2,
  HardDrive,
  QrCode,
  ScanLine,
  Wrench,
  Activity,
  Layers,
  Key,
  Users,
  Search,
  ShoppingCart,
  Boxes,
  Truck,
  Cpu,
  Crown,
  Eye,
  Check,
  ArrowRightLeft,
  Upload,
  RefreshCw,
  AlertCircle,
  FileCode,
  FileType,
  Star,
  Award,
  Zap,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { generateEnterpriseUserManualDocx } from '../utils/userManualDocxGenerator';
import { openUserManualPrintView } from '../utils/userManualPdfGenerator';
import {
  convertDocxToPdfView,
  convertPdfToDocx
} from '../utils/documentConverter';
import {
  generateWhyChooseSAS4ERPDocx,
  openWhyChooseSAS4ERPPdfView,
  WHY_CHOOSE_POINTS
} from '../utils/whyChooseSAS4ERPGenerator';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'manual' | 'why_choose' | 'converter';
}

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'manual'
}) => {
  const { language, isRtl } = useLanguage();

  // Top Mode Tab: 'manual' (ڕێبەری کارپێکردن) | 'why_choose' (بۆچی ئەم سیستەمە بەکاربێنم) | 'converter' (گۆڕەری دۆکیومێنت Word ⇄ PDF)
  const [activeMainMode, setActiveMainMode] = useState<'manual' | 'why_choose' | 'converter'>(defaultTab);

  // Reader Settings
  const [includeKu, setIncludeKu] = useState<boolean>(true);
  const [includeEn, setIncludeEn] = useState<boolean>(true);
  const [includeAr, setIncludeAr] = useState<boolean>(true);
  const [activeTabLang, setActiveTabLang] = useState<'ku' | 'en' | 'ar'>('ku');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingWord, setIsGeneratingWord] = useState<boolean>(false);
  const [isGeneratingWhyChooseWord, setIsGeneratingWhyChooseWord] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Converter States
  const [converterDirection, setConverterDirection] = useState<'docxToPdf' | 'pdfToDocx'>('docxToPdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // 1. Download User Manual Word docx
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
      a.download = `SAS_Holding_ERP_User_Manual_Trilingual_2026.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotice(
        language === 'ku'
          ? 'فایلی وۆردی ڕێبەری بەکارهێنان (.docx) بۆ سەرجەم ٢١ بەشەکە بە سەرکەوتوویی دابەزێنرا!'
          : 'Trilingual Word manual (.docx) with all 21 modules downloaded successfully!'
      );
    } catch (err) {
      console.error('Failed to generate docx manual:', err);
    } finally {
      setIsGeneratingWord(false);
    }
  };

  // 2. Open User Manual PDF print view
  const handlePrintOrSavePdf = () => {
    openUserManualPrintView({
      includeKurdish: includeKu,
      includeEnglish: includeEn,
      includeArabic: includeAr
    });
  };

  // 3. Download "Why Choose SAS4ERP" Word docx
  const handleDownloadWhyChooseWordDoc = async () => {
    try {
      setIsGeneratingWhyChooseWord(true);
      const blob = await generateWhyChooseSAS4ERPDocx({
        includeKurdish: includeKu,
        includeEnglish: includeEn,
        includeArabic: includeAr
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bo_Chi_Am_Systema_Bakarbenm_SAS4ERP_Differentiators.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotice(
        language === 'ku'
          ? 'فایلی وۆردی «بۆچی ئەم سیستەمە بەکاربێنم» بە سەرکەوتوویی دابەزێنرا!'
          : '"Why Choose SAS4ERP" Word document (.docx) downloaded successfully!'
      );
    } catch (err) {
      console.error('Failed to generate Why Choose docx:', err);
    } finally {
      setIsGeneratingWhyChooseWord(false);
    }
  };

  // 4. Open "Why Choose SAS4ERP" PDF view
  const handlePrintWhyChoosePdf = () => {
    openWhyChooseSAS4ERPPdfView({
      includeKurdish: includeKu,
      includeEnglish: includeEn,
      includeArabic: includeAr
    });
  };

  // 5. Convert current SAS4ERP manual Word document to PDF preview
  const handleConvertSystemManualDocxToPdf = async () => {
    try {
      setIsConverting(true);
      setConversionError(null);
      const docxBlob = await generateEnterpriseUserManualDocx({
        includeKurdish: includeKu,
        includeEnglish: includeEn,
        includeArabic: includeAr
      });
      await convertDocxToPdfView(docxBlob, 'SAS4ERP_User_Manual_Trilingual_21_Modules.docx');
      showNotice(
        language === 'ku'
          ? 'ڕێبەری وۆرد گۆڕدرا بۆ PDF و پەنجەرەی چاپکردن کرایەوە!'
          : 'Manual Word document converted to PDF print view successfully!'
      );
    } catch (err: any) {
      setConversionError(err?.message || 'Error converting manual to PDF');
    } finally {
      setIsConverting(false);
    }
  };

  // 6. Convert "Why Choose SAS4ERP" Word document to PDF
  const handleConvertWhyChooseDocxToPdf = async () => {
    try {
      setIsConverting(true);
      setConversionError(null);
      const docxBlob = await generateWhyChooseSAS4ERPDocx({
        includeKurdish: includeKu,
        includeEnglish: includeEn,
        includeArabic: includeAr
      });
      await convertDocxToPdfView(docxBlob, 'Bo_Chi_Am_Systema_Bakarbenm_SAS4ERP.docx');
      showNotice(
        language === 'ku'
          ? 'فایلی «بۆچی ئەم سیستەمە بەکاربێنم» لە Word گۆڕدرا بۆ PDF!'
          : '"Why Choose SAS4ERP" Word document converted to PDF print view successfully!'
      );
    } catch (err: any) {
      setConversionError(err?.message || 'Error converting dossier to PDF');
    } finally {
      setIsConverting(false);
    }
  };

  // Handle uploaded file conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setConversionError(null);
    }
  };

  const handleExecuteUploadedConversion = async () => {
    if (!selectedFile) return;
    try {
      setIsConverting(true);
      setConversionError(null);

      if (converterDirection === 'docxToPdf') {
        await convertDocxToPdfView(selectedFile, selectedFile.name);
        showNotice(
          language === 'ku'
            ? `فایلی «${selectedFile.name}» بە سەرکەوتوویی گۆڕدرا بۆ PDF و پەنجەرەی چاپکراو کرایەوە!`
            : `File "${selectedFile.name}" converted to PDF and opened for saving/printing!`
        );
      } else {
        // PDF to Word (.docx)
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

        showNotice(
          language === 'ku'
            ? `فایلی PDF بە سەرکەوتوویی گۆڕدرا بۆ فایلی وۆرد (${outputName}) و دابەزێنرا!`
            : `PDF successfully parsed and downloaded as Microsoft Word (${outputName})!`
        );
      }
    } catch (err: any) {
      console.error('Conversion failed:', err);
      setConversionError(err?.message || 'Conversion error occurred. Please verify the document format.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800 my-auto">
        
        {/* Header Bar */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md font-bold shrink-0">
              {activeMainMode === 'manual' ? (
                <BookOpen className="w-6 h-6" />
              ) : activeMainMode === 'why_choose' ? (
                <Award className="w-6 h-6 text-amber-300" />
              ) : (
                <ArrowRightLeft className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base sm:text-xl">
                  {language === 'ku'
                    ? 'ناوەندی دۆکیومێنت، ڕێبەری کارپێکردن و گۆڕەری Word ⇄ PDF'
                    : language === 'ar'
                    ? 'مركز التوثيق، دليل الاستخدام ومحوّل Word ⇄ PDF'
                    : 'SAS4ERP Documentation & Two-Way Word ⇄ PDF Studio'}
                </h3>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-2xs">
                  {language === 'ku' ? '٣ زمانی فەرمی' : 'Trilingual'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === 'ku'
                  ? 'ڕێبەری ٢١ بەشەکە، فایلی «بۆچی ئەم سیستەمە بەکاربێنم»، و گۆڕەری دوولایەنەی Word و PDF'
                  : 'Complete 21-module operations guide, "Why Choose SAS4ERP" dossier, and two-way Word ⇄ PDF converter.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Notice / Success Bar */}
        {actionNotice && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 flex items-center justify-center gap-2 animate-in slide-in-from-top-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Main 3-Tab Navigation Bar */}
        <div className="px-6 py-2.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {/* Tab 1: User Manual */}
            <button
              onClick={() => setActiveMainMode('manual')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeMainMode === 'manual'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-200" />
              <span>{language === 'ku' ? 'ڕێبەری کارپێکردن (٢١ بەش)' : 'User Manual (21 Modules)'}</span>
            </button>

            {/* Tab 2: Why Choose SAS4ERP */}
            <button
              onClick={() => setActiveMainMode('why_choose')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeMainMode === 'why_choose'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>{language === 'ku' ? 'بۆچی ئەم سیستەمە بەکاربێنم؟ (خاڵە جیاکەرەوەکان)' : 'Why Choose SAS4ERP?'}</span>
            </button>

            {/* Tab 3: Document Converter */}
            <button
              onClick={() => setActiveMainMode('converter')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeMainMode === 'converter'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-indigo-200" />
              <span>{language === 'ku' ? 'گۆڕەری دۆکیومێنت (Word ⇄ PDF)' : 'Document Converter (Word ⇄ PDF)'}</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>SAS4ERP Enterprise v5.0</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: SYSTEM USER MANUAL (21 MODULES)                     */}
        {/* ========================================================= */}
        {activeMainMode === 'manual' && (
          <>
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              
              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTabLang('ku')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTabLang === 'ku' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>☀️</span>
                  <span>کوردی</span>
                </button>
                <button
                  onClick={() => setActiveTabLang('en')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTabLang === 'en' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>English</span>
                </button>
                <button
                  onClick={() => setActiveTabLang('ar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTabLang === 'ar' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🇮🇶</span>
                  <span>العربية</span>
                </button>
              </div>

              {/* Quick Search */}
              <div className="flex-1 max-w-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'ku' ? 'گەڕان لە ٢١ بەشەکەدا...' : 'Search in 21 modules...'}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Dual Export: Word (.docx) & PDF */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintOrSavePdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  title="Open print view to save as high-resolution PDF"
                  id="export-pdf-manual-btn"
                >
                  <Printer className="w-3.5 h-3.5 text-red-200" />
                  <span>{language === 'ku' ? 'داگرتنی PDF' : 'Save as PDF'}</span>
                </button>

                <button
                  onClick={handleDownloadWordDoc}
                  disabled={isGeneratingWord}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                  title="Download Microsoft Word .docx file"
                  id="download-word-manual-btn"
                >
                  <Download className="w-3.5 h-3.5 text-blue-200" />
                  <span>
                    {isGeneratingWord
                      ? (language === 'ku' ? 'دروستکردن...' : 'Generating...')
                      : (language === 'ku' ? 'داگرتنی وۆرد (.docx)' : 'Word (.docx)')}
                  </span>
                </button>
              </div>

            </div>

            {/* Content Body: All 21 Modules */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm leading-relaxed">
              {activeTabLang === 'ku' && (
                <div className="space-y-3.5 text-right font-kurdish" dir="rtl">
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-sm block">بەشی کوردی: ڕێبەری فەرمی و دەستووری کارپێکردنی ٢١ بەشەکەی SAS4ERP</span>
                      <span className="text-xs text-indigo-800">تەواوی شێوازی کارپێکردن، واژۆکان، مۆڵەتەکان، کۆگا و دەسەڵاتەکان.</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-indigo-200 text-indigo-900 font-bold text-xs font-mono">
                      ٢١ بەشی تەواو
                    </span>
                  </div>

                  {/* Module 1 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <h4 className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                      <Key className="w-4 h-4 text-blue-600" />
                      <span>١. سیستەمی لایسنس، ماوەی تاقیکردنەوەی ١٤ ڕۆژ و قفڵی ئامێر (Hardware Lock)</span>
                    </h4>
                    <p className="text-slate-600 text-xs">
                      سیستەمەکە بەخۆڕایی بۆ ١٤ ڕۆژ ماوەی تاقیکردنەوەی چالاک دەبێت. خاوەنی هۆڵدینگ دەتوانێت بیدات بە هەر هۆڵدینگێک بەخۆڕایی، و کلیلی چالاککردن دەبەسترێتەوە بە ئامێرەکە.
                    </p>
                  </div>

                  {/* Module 2 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <h4 className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>٢. دیاریکردنی ڕۆڵی بەکارهێنەران و دەسەڵاتەکان (User Roles & RBAC Matrix)</span>
                    </h4>
                    <p className="text-slate-600 text-xs">
                      خاوەنی هۆڵدینگ دەسەڵات دیاری دەکات بۆ: «خاوەنی هۆڵدینگ»، «بەڕێوەبەری گشتی - GM»، «بەڕێوەبەری پڕۆژە - PM»، و «کارمەند - Employee» بە مصفوفەی ١٩ بەش.
                    </p>
                  </div>

                  {/* Module 3 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <h4 className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span>٣. هۆیەتی هۆڵدینگ و ستۆدیۆی واژۆ و مۆری فەرمی (Identity & E-Signature)</span>
                    </h4>
                    <p className="text-slate-600 text-xs">
                      دانانی ناوی هۆڵدینگ، ناوی سەرۆکی بۆرد، لۆگۆ و سەرمایە. کێشانی واژۆی دەستی لەسەر شاشە و مۆرکردنی فەرمی بەڵگەنامە و داواکارییەکان.
                    </p>
                  </div>

                  {/* Module 4 & 5 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <h4 className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <span>٤ و ٥. کۆمپانیاکان، لقەکان و پڕۆژە نیشتمانییەکان (Projects & Gantt Charts)</span>
                    </h4>
                    <p className="text-slate-600 text-xs">
                      بەڕێوەبردنی کۆمپانیاکانی بیناسازی، نەوت، پیشەسازی و هتد لەگەڵ هێڵکاری گانت، دیاریکردنی ڕێژەی تەواوبوون، و دەرهێنانی دۆکیومێنتی ئەندازیاری بە PDF.
                    </p>
                  </div>

                  {/* Module 6 & 7 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <h4 className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-emerald-600" />
                      <span>٦ و ٧. داواکاری کڕین، ڕەزامەندی سێقۆڵی و کۆگای کەرەستە (Procurement & Warehouse)</span>
                    </h4>
                    <p className="text-slate-600 text-xs">
                      زنجیرەی ڕەزامەندی کڕین: ئەندازیاری مەیدان داوا دەکات ➔ بەڕێوەبەری پڕۆژە و GM بودجە دەپشکنن ➔ واژۆی سەرۆکایەتی هۆلدینگ بۆ پارەی گەورە. کۆگا هۆشداری کەمبوونەوەی چیمەنتۆ و ئاسن دەدات.
                    </p>
                  </div>

                  {/* Module 8 & 9 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <h4 className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                      <ScanLine className="w-4 h-4 text-violet-600" />
                      <span>٨ و ٩. سکێنەری کامێرا لە دەروازە و مێزانی قەپان (Gate Barcode & Weighbridge)</span>
                    </h4>
                    <p className="text-slate-600 text-xs">
                      پاسەوانی دەروازە بە کامێرا بارکۆدی سەر بارهەڵگر دەخوێنێتەوە و ڕاستەوخۆ بە کۆگاوە دەبەسترێت. مێزانی قەپان کێشی پوختەی چەو و چیمەنتۆ تۆمار دەکات.
                    </p>
                  </div>

                  {/* Module 10 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <h4 className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-red-600" />
                      <span>١٠. چاودێری ژیری دەستکرد بۆ ڕێگری لە فێڵکردن (AI Anomaly Sentinel)</span>
                    </h4>
                    <p className="text-slate-600 text-xs">
                      دۆزینەوەی فێڵی پارچەکردنی کڕین (Split PO)، تۆماری دارایی لە کاتژمێر ٢ی شەو، و دەستنیشانکردنی کرێکاری وەهمی لە مووچەدا.
                    </p>
                  </div>

                  {/* Modules 11-15 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <h4 className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-600" />
                      <span>١١ تا ١٥. کەمپی نووستن، کارەبا، سەلامەتی HSE، ئامێری قورس، و تاقیگەی QC</span>
                    </h4>
                    <p className="text-slate-600 text-xs">
                      دابەشکردنی ژوور لە کەمپ، کاتژمێرەکانی کارکردنی مۆلیدە و بەنزین، کاتژمێری بێ ڕووداوی LTI، بەدواداچوونی حەفارە و شۆفڵ، و تاقیکردنەوەی تەقینی کۆنکرێت لە تاقیگە.
                    </p>
                  </div>

                  {/* Modules 16-20 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <h4 className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-600" />
                      <span>١٦ تا ٢٠. دارایی یەکگرتوو، فاکتوورەی نێوان کۆمپانیاکان، ئیقامەی بیانیان و دۆخی ئۆفلاین (Offline PWA)</span>
                    </h4>
                    <p className="text-slate-600 text-xs">
                      تەرازووی پێداچوونەوە، فاکتوورەی نێوان کۆمپانیاکان، ئاگاداری ٣٠ ڕۆژ پێش بەسەرچوونی ئیقامەی کرێکاری بیانی، و کارکردنی تەواو بەبێ ئینتەرنێت.
                    </p>
                  </div>

                  {/* Module 21 */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <h4 className="text-sm font-extrabold text-blue-900 flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                      <span>٢١. ستۆدیۆی گۆڕەری دۆکیومێنت (Word ⇄ PDF Two-Way Converter)</span>
                    </h4>
                    <p className="text-slate-600 text-xs">
                      گۆڕینی ڕاستەوخۆی فایلەکانی مایکرۆسۆفت وۆرد (.docx) بۆ پی دی ئێف (PDF) و بە پێچەوانەشەوە لە تەبی سێیەم بەردەستە.
                    </p>
                  </div>
                </div>
              )}

              {activeTabLang === 'en' && (
                <div className="space-y-3.5 text-left" dir="ltr">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-sm block">English Section: All 21 Modules Operations Manual</span>
                      <span className="text-xs text-blue-800">Operational manual for Holding Chairman, General Managers, Project Managers & Site Staff.</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-200 text-blue-900 font-bold text-xs font-mono">
                      21 Modules
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <h4 className="text-sm font-extrabold text-blue-900">1. Licensing Model, 14-Day Free Trial & Hardware Fingerprint Lock</h4>
                    <p className="text-slate-600 text-xs">14-day free trial on initial deployment. Permanent operation binds cryptographically to device hardware identifiers.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <h4 className="text-sm font-extrabold text-blue-900">2. Role-Based Access Control (RBAC) & 19-Module Matrix</h4>
                    <p className="text-slate-600 text-xs">Custom visibility scopes for Holding Owner, GM, Project Manager, and Employee personas.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <h4 className="text-sm font-extrabold text-blue-900">3 to 7. Procurement, Warehouse, Gate Scanner & Strategic Projects</h4>
                    <p className="text-slate-600 text-xs">Multi-signature approval chain, safety reorder thresholds, optical gate waybill scanner, and Gantt charts.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <h4 className="text-sm font-extrabold text-blue-900">8 to 15. AI Sentinel, HSE Safety, Camps, Fleet & QC Labs</h4>
                    <p className="text-slate-600 text-xs">Split PO fraud detection, worker dorm allotments, generator telemetry, Zero-Harm LTI logs, concrete break testing.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <h4 className="text-sm font-extrabold text-blue-900">16 to 21. Consolidated Ledger, Offline PWA & Word ⇄ PDF Studio</h4>
                    <p className="text-slate-600 text-xs">Cross-entity balances, Service Worker offline mesh access, foreign visa alerts, and two-way Word ⇄ PDF conversion.</p>
                  </div>
                </div>
              )}

              {activeTabLang === 'ar' && (
                <div className="space-y-3.5 text-right font-kurdish" dir="rtl">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-sm block">القسم العربي: دليل التشغيل لكافة الـ ٢١ قسماً لمنظومة SAS4ERP</span>
                      <span className="text-xs text-emerald-800">إرشادات كاملة لكافة العمليات وصلاحيات الأدوار والتشغيل الميداني والهندسي.</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-900 font-bold text-xs font-mono">
                      ٢١ قسماً
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <h4 className="text-sm font-extrabold text-emerald-900">١. نظام التراخيص وفترة التجربة المجانية ١٤ يوماً</h4>
                    <p className="text-slate-600 text-xs">فترة تجربة مجانية لمدة أسبوعين بكافة الأقسام، مع قفل التفعيل بهوية العتاد لضمان حماية المنظومة.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <h4 className="text-sm font-extrabold text-emerald-900">٢. مصفوفة الصلاحيات والأدوار (User Roles & RBAC Matrix)</h4>
                    <p className="text-slate-600 text-xs">أدوار محددة لمالك المجموعة، المدير العام، مدير المشروع الميداني، والموظف مع تحكم كامل بالـ ١٩ قسماً.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                    <h4 className="text-sm font-extrabold text-emerald-900">٣ إلى ٢١. المشتريات، ماسح البوابات، الذكاء الاصطناعي، ومحوّل المستندات (Word ⇄ PDF)</h4>
                    <p className="text-slate-600 text-xs">سلسلة الموافقات الثلاثية، مسح الباركود بالكاميرا، رادار كشف الاحتيال، سكن العمال، فحص الخرسانة، التشغيل دون إنترنت، والتحويل المزدوج بين Word و PDF.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">
                  {language === 'ku' ? 'زمانەکانی پەڕگە:' : 'Included Languages:'}
                </span>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeKu}
                      onChange={(e) => setIncludeKu(e.target.checked)}
                      className="rounded text-indigo-600 cursor-pointer"
                    />
                    <span>کوردی</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeEn}
                      onChange={(e) => setIncludeEn(e.target.checked)}
                      className="rounded text-indigo-600 cursor-pointer"
                    />
                    <span>English</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAr}
                      onChange={(e) => setIncludeAr(e.target.checked)}
                      className="rounded text-indigo-600 cursor-pointer"
                    />
                    <span>العربية</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handlePrintOrSavePdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-red-200" />
                  <span>{language === 'ku' ? 'داگرتن و پرینتی PDF' : 'Export & Print PDF'}</span>
                </button>

                <button
                  onClick={handleDownloadWordDoc}
                  disabled={isGeneratingWord}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-blue-200" />
                  <span>
                    {isGeneratingWord
                      ? (language === 'ku' ? 'دروستکردن...' : 'Generating...')
                      : (language === 'ku' ? 'داگرتنی وۆرد (.docx)' : 'Download Word (.docx)')}
                  </span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  {language === 'ku' ? 'داخستن' : 'Close'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: بۆچی ئەم سیستەمە بەکاربێنم؟ (WHY CHOOSE SAS4ERP)    */}
        {/* ========================================================= */}
        {activeMainMode === 'why_choose' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Hero Banner with Direct Download Action */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-white/20 text-white backdrop-blur-xs">
                    <Award className="w-5 h-5 text-amber-200" />
                  </span>
                  <h4 className="text-lg font-black tracking-wide">
                    {language === 'ku'
                      ? 'بۆچی ئەم سیستەمە بەکاربێنم؟ (خاڵە جیاکەرەوەکانی SAS4ERP)'
                      : 'Why Choose SAS4ERP? — Strategic Differentiators Dossier'}
                  </h4>
                </div>
                <p className="text-xs text-amber-100 leading-relaxed">
                  {language === 'ku'
                    ? 'ئەم پەڕگەیە بە وردی ڕوونی دەکاتەوە بۆچی SAS4ERP جیاوازە لە هەموو سیستەمەکانی تر: مۆدێلی بەکارهێنان بەبێ فرۆشتن، پاسەوانی ژیری دەستکرد، کارکردنی ئۆفلاین، و پاراستنی سەرمایەی هۆڵدینگ.'
                    : 'A comprehensive briefing outlining why SAS4ERP leads enterprise ERPs: managed usage model, fraud prevention AI, offline resilience, and holding governance.'}
                </p>
              </div>

              {/* DUAL DOWNLOAD FOR THIS DOSSIER */}
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={handlePrintWhyChoosePdf}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-md hover:bg-amber-50 transition cursor-pointer"
                  id="why-choose-pdf-btn"
                >
                  <Printer className="w-3.5 h-3.5 text-red-600" />
                  <span>{language === 'ku' ? 'داگرتن و پرینتی PDF' : 'Save as PDF'}</span>
                </button>

                <button
                  onClick={handleDownloadWhyChooseWordDoc}
                  disabled={isGeneratingWhyChooseWord}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                  id="why-choose-word-btn"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isGeneratingWhyChooseWord
                      ? (language === 'ku' ? 'دروستکردن...' : 'Generating...')
                      : (language === 'ku' ? 'داگرتنی وۆرد (.docx)' : 'Word (.docx)')}
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Language Toggle for "Why Choose" */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-slate-700">
                {language === 'ku' ? '١٢ خاڵی جیاکەرەوە و هۆکاری سەرەکی:' : '12 Core Strategic Differentiators:'}
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTabLang('ku')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTabLang === 'ku' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  کوردی
                </button>
                <button
                  onClick={() => setActiveTabLang('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTabLang === 'en' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setActiveTabLang('ar')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTabLang === 'ar' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  العربية
                </button>
              </div>
            </div>

            {/* Grid of the 12 Differentiators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WHY_CHOOSE_POINTS.map((point) => (
                <div
                  key={point.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-md transition space-y-2 flex flex-col justify-between"
                  dir={activeTabLang === 'en' ? 'ltr' : 'rtl'}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        #{point.id}
                      </span>
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                    <h5 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {activeTabLang === 'ku'
                        ? point.titleKu
                        : activeTabLang === 'ar'
                        ? point.titleAr
                        : point.titleEn}
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      {activeTabLang === 'ku'
                        ? point.descKu
                        : activeTabLang === 'ar'
                        ? point.descAr
                        : point.descEn}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>SAS4ERP Enterprise Advantage</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Action Footer for Why Choose */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-600">
                {language === 'ku'
                  ? 'دەتوانیت ئەم فایلە بە شێوازی Word یان PDF دابەزێنیت و پێشکەشی بەڕێوەبەران یان هۆڵدینگی بکەیت.'
                  : 'You can export this dossier as Word (.docx) or PDF and present it to executive holding committees.'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConvertWhyChooseDocxToPdf}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  {language === 'ku' ? 'گۆڕینی فایلی بۆچی بەکاربێنم بۆ PDF' : 'Convert Dossier to PDF'}
                </button>
                <button
                  onClick={handleDownloadWhyChooseWordDoc}
                  disabled={isGeneratingWhyChooseWord}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {language === 'ku' ? 'داگرتنی وۆرد (.docx)' : 'Download Word (.docx)'}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DOCUMENT STUDIO & TWO-WAY CONVERTER (Word ⇄ PDF)   */}
        {/* ========================================================= */}
        {activeMainMode === 'converter' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Top Converter Intro Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                  <h4 className="text-base font-extrabold">
                    {language === 'ku'
                      ? 'ستۆدیۆی گۆڕەری دوولایەنەی دۆکیومێنت: وۆرد بۆ پی دی ئێف و بە پێچەوانەش'
                      : 'Two-Way Document Studio: Word to PDF & PDF to Word'}
                  </h4>
                </div>
                <p className="text-xs text-blue-200 leading-relaxed max-w-2xl">
                  {language === 'ku'
                    ? 'دەتوانیت هەر دۆکیومێنتێکی Microsoft Word (.docx) بکەیتە فایلی چاپکراوی PDF، یان هەر فایلیكی PDF بگۆڕیت بۆ وۆرد (.docx) بۆ دەستکاریکردن بە پشتگیری تەواوی زمانی کوردی، ئینگلیزی و عەرەبی.'
                    : 'Convert any Microsoft Word (.docx) file into a formatted PDF or convert any PDF into an editable Word document with trilingual support.'}
                </p>
              </div>

              {/* Quick Actions for Built-In Files */}
              <div className="shrink-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={handleConvertSystemManualDocxToPdf}
                  disabled={isConverting}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                  id="convert-manual-to-pdf-btn"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isConverting ? 'animate-spin' : ''}`} />
                  <span>{language === 'ku' ? 'گۆڕینی ڕێبەر: Word ➔ PDF' : 'Convert Manual to PDF'}</span>
                </button>

                <button
                  onClick={handleConvertWhyChooseDocxToPdf}
                  disabled={isConverting}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                  id="convert-why-choose-to-pdf-btn"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isConverting ? 'animate-spin' : ''}`} />
                  <span>{language === 'ku' ? 'گۆڕینی بۆچی بەکاربێنم: Word ➔ PDF' : 'Convert Why Choose to PDF'}</span>
                </button>
              </div>
            </div>

            {/* Error Message if any */}
            {conversionError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{conversionError}</span>
              </div>
            )}

            {/* Direction Toggle Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option A: Word (.docx) -> PDF */}
              <div
                onClick={() => {
                  setConverterDirection('docxToPdf');
                  setSelectedFile(null);
                }}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-4 ${
                  converterDirection === 'docxToPdf'
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                  <FileCode className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">
                      {language === 'ku' ? 'وۆرد بۆ پی دی ئێف (Word ➔ PDF)' : 'Word (.docx) to PDF'}
                    </span>
                    {converterDirection === 'docxToPdf' && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'ku'
                      ? 'فایلی مایکرۆسۆفت وۆرد (.docx) دادەنێیت و دەیگۆڕێت بۆ فایلی ستاندارد و خاوێن بە فۆرماتی PDF بۆ چاپ و پاراستن.'
                      : 'Upload any .docx file and convert it into a clean, formatted PDF ready for printing or sharing.'}
                  </p>
                </div>
              </div>

              {/* Option B: PDF -> Word (.docx) */}
              <div
                onClick={() => {
                  setConverterDirection('pdfToDocx');
                  setSelectedFile(null);
                }}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-4 ${
                  converterDirection === 'pdfToDocx'
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                  <FileType className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">
                      {language === 'ku' ? 'پی دی ئێف بۆ وۆرد (PDF ➔ Word)' : 'PDF to Word (.docx)'}
                    </span>
                    {converterDirection === 'pdfToDocx' && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'ku'
                      ? 'فایلی PDF دادەنێیت، دەق و خشتە و پەڕەکان دەردەهێنێت و دەیکاتە فایلی دەستکاریکراوی وۆرد (.docx).'
                      : 'Extract text, headers, and pages from any PDF document and generate an editable Microsoft Word (.docx) file.'}
                  </p>
                </div>
              </div>

            </div>

            {/* Upload & Convert Drop Zone */}
            <div className="p-8 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept={converterDirection === 'docxToPdf' ? '.docx' : '.pdf'}
                onChange={handleFileChange}
                className="hidden"
                id="file-converter-input"
              />

              <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-600">
                <Upload className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  {selectedFile ? (
                    <span className="text-blue-600">📄 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  ) : converterDirection === 'docxToPdf' ? (
                    language === 'ku'
                      ? 'فایلی وۆرد (.docx) لێرە هەڵبژێرە بۆ گۆڕین بۆ PDF'
                      : 'Select a Word (.docx) file to convert to PDF'
                  ) : (
                    language === 'ku'
                      ? 'فایلی پی دی ئێف (.pdf) لێرە هەڵبژێرە بۆ گۆڕین بۆ Word'
                      : 'Select a PDF (.pdf) file to convert to Word'
                  )}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {converterDirection === 'docxToPdf'
                    ? 'پشتگیری لە سەرجەم وەشانەکانی Microsoft Word (.docx) دەکات'
                    : 'پشتگیری لە سەرجەم فۆرماتەکانی Adobe PDF دەکات'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  {selectedFile
                    ? (language === 'ku' ? 'گۆڕینی فایل...' : 'Choose different file...')
                    : (language === 'ku' ? '📁 هەڵبژاردنی فایل لە کۆمپیوتەر' : '📁 Browse file')}
                </button>

                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleExecuteUploadedConversion}
                    disabled={isConverting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isConverting ? 'animate-spin' : ''}`} />
                    <span>
                      {isConverting
                        ? (language === 'ku' ? 'لە گۆڕیندایە...' : 'Converting...')
                        : converterDirection === 'docxToPdf'
                        ? (language === 'ku' ? 'گۆڕین بۆ PDF و پاشەکەوتکردن' : 'Convert to PDF & View')
                        : (language === 'ku' ? 'گۆڕین بۆ Word و دابەزاندن (.docx)' : 'Convert to Word (.docx)')}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Helper Tips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                <strong className="text-slate-900 block mb-1">⚡ خێرایی و پارێزراوی</strong>
                <span>گۆڕینەکە لەناو براوسەر ئەنجام دەدرێت بەبێ ناردنی داتا بۆ هیچ سێرڤەرێکی دەرەکی.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                <strong className="text-slate-900 block mb-1">🌍 پشتگیری زمانی کوردی و عەرەبی</strong>
                <span>تایپۆگرافی تەواو و ئاراستەی نووسینی ڕاست بۆ چەپ (RTL) لە هەردوو فۆرماتدا پارێزراوە.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                <strong className="text-slate-900 block mb-1">📋 هەموو ٢١ بەشەکەی سیستەم</strong>
                <span>ڕێبەری فەرمی سیستەم دەتوانیت بە یەک کلیک بە شێوازی Word یان PDF بەکاربێنیت.</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
