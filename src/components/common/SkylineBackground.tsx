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

  // Soft subtle backdrop opacity so executive data tables and text stay razor-sharp
  const normalizedOpacity = Math.max(0.04, Math.min(0.28, (skylineBgOpacity / 100) * 0.5));

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      <img
        src={activePreset.imageSrc}
        alt=""
        role="presentation"
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover object-center transition-opacity duration-500 ${
          skylineBgBlur ? 'blur-[2px] scale-[1.02]' : 'scale-100'
        }`}
        style={{
          opacity: normalizedOpacity
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC]/88 via-[#F8FAFC]/85 to-[#F8FAFC]/94" />
    </div>
  );
};
