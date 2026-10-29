import React, { useState, useEffect, useRef } from 'react';
import {
  Crown,
  Check,
  X,
  Building2,
  MapPin,
  FileText,
  DollarSign,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { getUIText } from '../utils/langHelper';

export const HoldingSetupModal: React.FC = () => {
  const {
    holding,
    updateHolding,
    resetAllFinancialsToZero,
    clearAllMockData,
    restoreSampleData,
    isHoldingSetupOpen,
    setIsHoldingSetupOpen,
  } = useERP();

  const { t, language } = useLanguage();
  const isRTL = language === 'ku' || language === 'ar';

  const [name, setName] = useState(holding.name || '');
  const [nameKu, setNameKu] = useState(holding.nameKu || '');
  const [nameAr, setNameAr] = useState(holding.nameAr || '');
  const [chairmanName, setChairmanName] = useState(holding.chairmanName || '');
  const [totalBudgetUSD, setTotalBudgetUSD] = useState(holding.totalBudgetUSD || 0);
  const [totalExpensesUSD, setTotalExpensesUSD] = useState(holding.totalExpensesUSD || 0);
  const [headquarters, setHeadquarters] = useState(holding.headquarters || '');
  const [registrationNumber, setRegistrationNumber] = useState(holding.legalRegistration || '');
  const [logoUrl, setLogoUrl] = useState<string>(holding.logoUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(holding.name || '');
    setNameKu(holding.nameKu || '');
    setNameAr(holding.nameAr || '');
    setChairmanName(holding.chairmanName || '');
    setTotalBudgetUSD(holding.totalBudgetUSD || 0);
    setTotalExpensesUSD(holding.totalExpensesUSD || 0);
    setHeadquarters(holding.headquarters || '');
    setRegistrationNumber(holding.legalRegistration || '');
    setLogoUrl(holding.logoUrl || '');
    setSaveSuccess(false);
    setConfirmClearOpen(false);
  }, [holding, isHoldingSetupOpen]);

  if (!isHoldingSetupOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setLogoUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExecuteClearMock = () => {
    clearAllMockData();
    setConfirmClearOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateHolding({
      name: name.trim() || 'Enterprise Holding Group',
      nameKu: nameKu.trim() || name.trim() || 'گرووپی هۆلدینگ',
      nameAr: nameAr.trim() || name.trim() || 'المجموعة القابضة',
      chairmanName: chairmanName.trim(),
      totalBudgetUSD: Number(totalBudgetUSD) || 0,
      totalExpensesUSD: Number(totalExpensesUSD) || 0,
      headquarters: headquarters.trim() || (language === 'ku' ? 'بارەگای سەرەکی' : 'Holding HQ'),
      legalRegistration: registrationNumber.trim() || 'REG-SAS-2026',
      logoUrl: logoUrl.trim(),
      isConfigured: true,
      systemPlatformName: 'SAS',
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setIsHoldingSetupOpen(false);
      setSaveSuccess(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto">
        
        <button
          onClick={() => setIsHoldingSetupOpen(false)}
          className={`absolute top-5 ${isRTL ? 'left-5' : 'right-5'} w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          {/* System Name Distinction Banner */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>
              {getUIText(language, {
                en: 'System Platform: SAS (SAS ERP)',
                ku: 'ناوی سیستەم: SAS (SAS ERP)',
                ar: 'منصة النظام: SAS (SAS ERP)'
              })}
            </span>
            <span className="text-blue-300">•</span>
            <span className="text-slate-600 font-medium">
              {getUIText(language, {
                en: 'Holding Enterprise Suite',
                ku: 'پلاتفۆرمی کارگێڕیی هۆلدینگ',
                ar: 'منظومة إدارة المجموعات القابضة'
              })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-md font-extrabold text-lg shrink-0">
              <Crown className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {t('setupHoldingTitle')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('setupHoldingSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              {getUIText(language, {
                en: 'Holding profile & logo updated successfully!',
                ku: 'ناوی هۆلدینگ، لۆگۆ و خاوەن بە سەرکەوتوویی پاشەکەوت کران!',
                ar: 'تم تحديث بيانات وشعار المجموعة القابضة بنجاح!'
              })}
            </span>
          </div>
        )}

        {/* Clear Mock Data Confirmation Modal Inline */}
        {confirmClearOpen && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-900 font-black text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>
                {getUIText(language, {
                  en: 'Wipe all sample & dummy data?',
                  ku: 'ئایا دڵنیایت لە سڕینەوەی هەموو کۆمپانیا و پڕۆژە تاقیکارییەکان؟',
                  ar: 'هل أنت متأكد من مسح كافة الشركات والمشاريع الوهمية؟'
                })}
              </span>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              {getUIText(language, {
                en: 'This will purge all pre-loaded mock companies, dummy projects, mock POs, and employees, providing a completely clean workspace for your real corporate data.',
                ku: 'ئەم کردارە سەرجەم کۆمپانیا و پڕۆژە و فەرمانە تاقیکارییەکان دەسڕێتەوە، تاوەکو دەستبەجێ بە خاوێنی ناوی کۆمپانیا و پڕۆژە ڕاستەقینەکانی خۆتان بنووسن.',
                ar: 'سيؤدي هذا الإجراء إلى حذف جميع البيانات التجريبية الوهمية لتمكينك من بدء العمل ببيانات حقيقية نظيفة.'
              })}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleExecuteClearMock}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {getUIText(language, {
                  en: 'Yes, Clear All Mock Data',
                  ku: 'بەڵێ، دەستبەجێ پاکی بکەرەوە',
                  ar: 'نعم، امسح كافة البيانات التجريبية'
                })}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                {t('cancelAction')}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Custom Holding Logo Uploader */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>{t('uploadLogo')}</span>
              </label>
              <span className="text-[10px] text-slate-500 font-medium">PNG, SVG, JPG</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Logo Preview */}
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                {logoUrl ? (
                  <img src={logoUrl} alt="Holding Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="text-center p-1 text-slate-400">
                    <Building2 className="w-6 h-6 mx-auto opacity-50" />
                    <span className="text-[9px] block">No logo</span>
                  </div>
                )}
              </div>

              {/* Upload & Remove Controls */}
              <div className="space-y-1.5 flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t('uploadLogo')}</span>
                  </button>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {getUIText(language, {
                    en: 'Upload your holding company logo to display on dashboard, header, and official PDF exports.',
                    ku: 'لۆگۆی فەرمی هۆلدینگەکەت دابنێ بۆ ئەوەی لە سەرەوەی داشبۆرد و ڕاپۆرتەکانی PDF دەربکەوێت.',
                    ar: 'قم بتحميل شعار المجموعة القابضة للظهور على اللوحة والتقارير الرسمية.'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Holding Legal Name (English) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Holding Legal Name (English) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Global Holding Group"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ناوی هۆلدینگ بە کوردی (Kurdish)
              </label>
              <input
                type="text"
                placeholder="بۆ نموونە: گرووپی هۆلدینگی ئەپێکس"
                value={nameKu}
                onChange={(e) => setNameKu(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم المجموعة القابضة (Arabic)
              </label>
              <input
                type="text"
                placeholder="مثال: مجموعة القمة القابضة"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Owner / Chairman Name */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-amber-950">
                <Crown className="w-4 h-4 text-amber-600" />
                <span>{t('holdingOwnerNameInput')} *</span>
              </label>
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-100/80 px-2 py-0.5 rounded-full">
                {getUIText(language, { en: 'Executive Authority', ku: 'دەسەڵاتی باڵا', ar: 'السلطة التنفيذية' })}
              </span>
            </div>
            <input
              type="text"
              required
              placeholder={getUIText(language, {
                en: 'Enter Chairman / Holding Owner Full Name',
                ku: 'ناوی تەواوی خاوەنی هۆلدینگ بنووسن',
                ar: 'أدخل الاسم الكامل لمالك أو رئيس المجموعة'
              })}
              value={chairmanName}
              onChange={(e) => setChairmanName(e.target.value)}
              className="w-full bg-white border border-amber-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none shadow-2xs"
            />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              {getUIText(language, {
                en: 'This name appears across executive approvals, electronic seals, budget directives, and official reports.',
                ku: 'ئەم ناوە ڕاستەوخۆ لە سەرجەم واژۆکان، مۆری ئەلیکترۆنی، بڕیارەکانی خەرجی و ڕاپۆرتەکاندا تۆمار دەکرێت.',
                ar: 'يظهر هذا الاسم في كافة الموافقات التنفيذية، الأختام الإلكترونية، وتوجيهات الصرف.'
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {getUIText(language, { en: 'Headquarters Address', ku: 'ناونیشانی بارەگای سەرەکی', ar: 'عنوان المقر الرئيسي' })}
              </label>
              <input
                type="text"
                placeholder="Erbil / Baghdad / Sulaymaniyah Tower"
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {getUIText(language, { en: 'Commercial Registration / Tax ID', ku: 'ژمارەی تۆماری کۆمپانیاکان', ar: 'رقم السجل التجاري' })}
              </label>
              <input
                type="text"
                placeholder="REG-2026-XXXX"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {getUIText(language, { en: 'Annual Consolidated Budget ($ USD)', ku: 'بودجەی ساڵانەی گشتی ($ USD)', ar: 'الميزانية المجمعة السنوية ($ USD)' })}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={totalBudgetUSD}
                  onChange={(e) => setTotalBudgetUSD(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-7 pr-3.5 py-2.5 text-xs font-mono font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {getUIText(language, { en: 'Total Expenses to Date ($ USD)', ku: 'کۆی خەرجییەکان تا ئێستا ($ USD)', ar: 'إجمالي المصروفات حتى الآن ($ USD)' })}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={totalExpensesUSD}
                  onChange={(e) => setTotalExpensesUSD(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-7 pr-3.5 py-2.5 text-xs font-mono font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Data Cleanup & Mock Purge Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Wipe mock companies, dummy projects and fake data"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('clearAllMockData')}</span>
              </button>

              <button
                type="button"
                onClick={restoreSampleData}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                title="Restore sample holding data"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('restoreSampleData')}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsHoldingSetupOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                {t('cancelAction')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{getUIText(language, { en: 'Save Holding Profile', ku: 'پاشەکەوتکردن', ar: 'حفظ البيانات' })}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
