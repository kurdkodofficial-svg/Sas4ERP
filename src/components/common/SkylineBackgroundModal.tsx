import React from 'react';
import {
  Building2,
  X,
  Sparkles,
  Sliders,
  CheckCircle2,
  Eye,
  ShieldCheck,
  RefreshCw,
  Power
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { SKYLINE_PRESETS, SkylinePreset } from './SkylineBackground';

export const SkylineBackgroundModal: React.FC = () => {
  const {
    isSkylineModalOpen,
    setIsSkylineModalOpen,
    isSkylineBgEnabled,
    setIsSkylineBgEnabled,
    skylineBgPreset,
    setSkylineBgPreset,
    skylineBgOpacity,
    setSkylineBgOpacity,
    skylineBgBlur,
    setSkylineBgBlur
  } = useERP();

  const { language } = useLanguage();

  if (!isSkylineModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsSkylineModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir={language === 'en' ? 'ltr' : 'rtl'}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-2xs">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>
                  {language === 'ku'
                    ? 'ڕێکخستنی باکگراوندی باڵاخانەکان'
                    : language === 'ar'
                    ? 'تخصيص خلفية الأبراج الملونة'
                    : 'Enterprise Skyline Background'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {language === 'ku' ? 'تەلارسازی مۆدێرن' : language === 'ar' ? 'معماري' : 'Architectural'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ku'
                  ? 'باڵاخانە ڕەنگکراوەکان بە جۆرێک ڕێکخراون کە نووسین و داتاکان بە تەواوی ڕوون بمێننەوە'
                  : language === 'ar'
                  ? 'تم تصميم الخلفية المعمارية الملونة بحيث لا تؤثر على وضوح وقراءة النصوص إطلاقاً'
                  : 'High-aesthetic colored architectural backdrops optimized for 100% text legibility.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSkylineModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Master Enable/Disable Switch */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                  isSkylineBgEnabled
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                <Power className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {language === 'ku'
                    ? 'چالاککردنی باکگراوندی باڵاخانەکان'
                    : language === 'ar'
                    ? 'تفعيل خلفية الأبراج'
                    : 'Enable Skyline Background'}
                </p>
                <p className="text-xs text-slate-500">
                  {isSkylineBgEnabled
                    ? (language === 'ku'
                        ? 'تەلارە ڕەنگاوڕەنگەکان لە باکگراونددا بە ڕوونی دەردەکەون'
                        : language === 'ar'
                        ? 'الخلفية مفعلة حالياً في واجهة النظام'
                        : 'Architectural skyline is currently active')
                    : (language === 'ku'
                        ? 'باکگراوندی سادەی سیستم بەکاردێت'
                        : language === 'ar'
                        ? 'يتم استخدام الخلفية الافتراضية العادية'
                        : 'Default plain background is active')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSkylineBgEnabled(!isSkylineBgEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                isSkylineBgEnabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={isSkylineBgEnabled}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isSkylineBgEnabled
                    ? language === 'en'
                      ? 'translate-x-6'
                      : '-translate-x-6'
                    : language === 'en'
                    ? 'translate-x-1'
                    : '-translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Preset Selection Cards */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {language === 'ku'
                  ? 'هەڵبژاردنی جۆری باڵاخانە و تەلارەکان'
                  : language === 'ar'
                  ? 'اختر مظهر الأبراج الملونة'
                  : 'Select Skyline Style'}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SKYLINE_PRESETS.map((preset) => {
                const isSelected = skylineBgPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSkylineBgPreset(preset.id);
                      if (!isSkylineBgEnabled) setIsSkylineBgEnabled(true);
                    }}
                    className={`group relative text-left rounded-2xl overflow-hidden border-2 transition-all p-3 flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2.5 bg-slate-900">
                      <img
                        src={preset.imageSrc}
                        alt={preset.nameEn}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                      
                      {/* Active Indicator Checkmark */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {/* Badge */}
                      <span className="absolute bottom-1.5 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-900 backdrop-blur-xs">
                        {language === 'ku'
                          ? preset.badgeKu
                          : language === 'ar'
                          ? preset.badgeEn
                          : preset.badgeEn}
                      </span>
                    </div>

                    {/* Titles */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {language === 'ku'
                          ? preset.nameKu
                          : language === 'ar'
                          ? preset.nameAr
                          : preset.nameEn}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {language === 'ku'
                          ? preset.descriptionKu
                          : preset.descriptionEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opacity & Visibility Slider */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {language === 'ku'
                    ? 'تۆخی باکگراوند (ڕێژەی ڕووناکی)'
                    : language === 'ar'
                    ? 'كثافة ظهور الخلفية'
                    : 'Background Intensity & Opacity'}
                </span>
              </label>

              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                {skylineBgOpacity}%
              </span>
            </div>

            <input
              type="range"
              min="8"
              max="50"
              step="2"
              value={skylineBgOpacity}
              onChange={(e) => setSkylineBgOpacity(Number(e.target.value))}
              disabled={!isSkylineBgEnabled}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
            />

            {/* Quick preset chips */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => setSkylineBgOpacity(14)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  skylineBgOpacity === 14
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {language === 'ku' ? 'سووک (14%)' : 'Subtle (14%)'}
              </button>

              <button
                onClick={() => setSkylineBgOpacity(22)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  skylineBgOpacity === 22
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {language === 'ku' ? 'پێشنیارکراو (22%)' : 'Balanced (22%)'}
              </button>

              <button
                onClick={() => setSkylineBgOpacity(34)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  skylineBgOpacity === 34
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {language === 'ku' ? 'دیار (34%)' : 'Vibrant (34%)'}
              </button>
            </div>
          </div>

          {/* Soft Blur Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {language === 'ku'
                    ? 'لێڵکردنی نەرم (بۆ پاراستنی خوێندنەوەی نایاب)'
                    : language === 'ar'
                    ? 'تنعيم بصري ناعم (لضمان راحة القراءة)'
                    : 'Atmospheric Soft Blur (Maximum Legibility)'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {language === 'ku'
                    ? 'ڕێگری دەکات لە تێکچوونی چاو لە کاتی خوێندنەوەی ژمارە و خشتەکان'
                    : language === 'ar'
                    ? 'يمنع التشتت البصري أثناء قراءة الجداول والأرقام المالية'
                    : 'Ensures data charts, numbers and tables remain 100% focused.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSkylineBgBlur(!skylineBgBlur)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                skylineBgBlur ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  skylineBgBlur
                    ? language === 'en'
                      ? 'translate-x-4.5'
                      : '-translate-x-4.5'
                    : language === 'en'
                    ? 'translate-x-0.5'
                    : '-translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Verification / Text Legibility Guarantee Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-emerald-900">
                {language === 'ku'
                  ? 'نووسین و داتاکان هەمیشە بە پارێزراوی و ڕوونی دەمێننەوە'
                  : language === 'ar'
                  ? 'ضمان الوضوح التام للنصوص والبيانات (WCAG AA)'
                  : 'Text Legibility & Contrast Protected (WCAG AA)'}
              </h5>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                {language === 'ku'
                  ? 'سیستمەکە بە شێوەیەکی زیرەکانە چینێکی سپی/ڕووناک (Scrim Overlay) بەکاردەهێنێت لەنێوان باکگراوند و کارتەکاندا، بۆیە تەنانەت لە ئەوپەڕی ڕەنگاوڕەنگیشدا هیچ پیت یان ژمارەیەک بزر نابێت.'
                  : language === 'ar'
                  ? 'يستخدم النظام طبقة حماية ضوئية ذكية تفصل الخلفية عن البطاقات لضمان عدم اختفاء أي أرقام أو نصوص.'
                  : 'An intelligent multi-stop protective scrim isolates the background from cards and tables, ensuring crisp readability.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              setIsSkylineBgEnabled(true);
              setSkylineBgPreset('corporate_prism');
              setSkylineBgOpacity(22);
              setSkylineBgBlur(true);
            }}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? 'گێڕانەوەی بنەڕەتی' : language === 'ar' ? 'استعادة الافتراضي' : 'Reset Default'}</span>
          </button>

          <button
            onClick={() => setIsSkylineModalOpen(false)}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm cursor-pointer"
          >
            {language === 'ku' ? 'تەواو و پاشەکەوتکردن' : language === 'ar' ? 'حفظ وإغلاق' : 'Apply & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
