import React from 'react';
import { useERP } from '../../context/ERPContext';
import corporateBuildingsImg from '../../assets/images/corporate_buildings_ambient_1793871402465.jpg';
import businessDistrictImg from '../../assets/images/business_district_towers_1793871401775.jpg';
import holdingSkylineImg from '../../assets/images/holding_colored_skyline_1793871401402.jpg';

export interface SkylinePreset {
  id: 'corporate_prism' | 'district_violet' | 'skyline_waterfront';
  imageSrc: string;
  nameEn: string;
  nameKu: string;
  nameAr: string;
  badgeEn: string;
  badgeKu: string;
  descriptionEn: string;
  descriptionKu: string;
  dominantColor: string;
}

export const SKYLINE_PRESETS: SkylinePreset[] = [
  {
    id: 'corporate_prism',
    imageSrc: corporateBuildingsImg,
    nameEn: 'Corporate Prism Towers',
    nameKu: 'تەلارە شووشەییە ڕەنگاوڕەنگەکان',
    nameAr: 'أبراج الكريستال الهندسية الملونة',
    badgeEn: 'Recommended',
    badgeKu: 'پێشنیارکراو',
    descriptionEn: 'Vibrant geometric towers illuminated with amber, blue and prism hues at dusk.',
    descriptionKu: 'باڵاخانە مۆدێرنە ئەندازەییەکان بە ڕەنگی زێڕین، شین و مۆری درەوشاوە.',
    dominantColor: '#3B82F6'
  },
  {
    id: 'district_violet',
    imageSrc: businessDistrictImg,
    nameEn: 'Violet & Emerald District',
    nameKu: 'تاوەرە درەوشاوەکانی هۆڵدینگ',
    nameAr: 'أبراج الأعمال الحديثة البنفسجية',
    badgeEn: 'Futuristic',
    badgeKu: 'مۆدێرن و پێشکەوتوو',
    descriptionEn: 'Curved enterprise skyscrapers with illuminated violet and teal facade fins.',
    descriptionKu: 'باڵاخانە پێچاوپێچە بەرزەکانی هۆڵدینگ بە ڕووناکی مۆر و سەوزی نەرم.',
    dominantColor: '#8B5CF6'
  },
  {
    id: 'skyline_waterfront',
    imageSrc: holdingSkylineImg,
    nameEn: 'Metropolitan Waterfront Panorama',
    nameKu: 'کەناراوی ئاسمانی پایتەخت',
    nameAr: 'بانوراما الأبراج الكبرى',
    badgeEn: 'Panoramic',
    badgeKu: 'پانۆراما',
    descriptionEn: 'Wide high-rise skyline with jewel-toned emerald and golden lights reflecting on water.',
    descriptionKu: 'دیمەنی پانۆرامای تەلارە بەرزە ڕەنگاوڕەنگەکان بەسەر ئاوەوە بە شەوان.',
    dominantColor: '#10B981'
  }
];

export const SkylineBackground: React.FC = () => {
  const {
    isSkylineBgEnabled,
    skylineBgPreset,
    skylineBgOpacity,
    skylineBgBlur
  } = useERP();

  if (!isSkylineBgEnabled) {
    return null;
  }

  const activePreset =
    SKYLINE_PRESETS.find(p => p.id === skylineBgPreset) || SKYLINE_PRESETS[0];

  // Opacity factor calculation (bounded between 5% and 55% to guarantee text legibility)
  const normalizedOpacity = Math.max(0.06, Math.min(0.55, skylineBgOpacity / 100));

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Background Architectural Image */}
      <img
        src={activePreset.imageSrc}
        alt=""
        role="presentation"
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover object-center transition-all duration-1000 ease-in-out ${
          skylineBgBlur ? 'blur-[1.5px] scale-[1.03]' : 'scale-100'
        }`}
        style={{
          opacity: normalizedOpacity
        }}
      />

      {/* Multi-tier protective contrast scrim:
          Ensures that no matter what text sits in front, contrast remains WCAG AA compliant.
          The user explicitly requested: "بە جۆرێک نووسینەکان بزر نەکات" (in a way that does NOT obscure writing)
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F4F7FA]/75 via-[#F4F7FA]/70 to-[#F4F7FA]/85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-slate-900/10" />

      {/* Subtle fine architectural mesh grid (adds precision feel without visual noise) */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
};
