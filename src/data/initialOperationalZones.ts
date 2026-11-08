import { OperationalZone } from '../types/operationalZone';

export const initialOperationalZones: OperationalZone[] = [
  {
    id: 'zone-erbil-hq',
    siteCode: 'ZONE-EBL-HQ',
    nameKu: 'زۆنی ئۆپەراسیۆنی سەرۆکایەتی هۆڵدینگ (هەولێر)',
    nameEn: 'Erbil Executive HQ Central Zone',
    nameAr: 'المنطقة التشغيلية للمقر الرئيسي بأربيل',
    category: 'HOLDING_HQ',
    governorate: 'Erbil',
    coordinates: {
      lat: 36.1901,
      lng: 44.0091,
      svgX: 52,
      svgY: 30
    },
    radiusKm: 25,
    allowedIpSubnets: ['185.120.76.0/24', '192.168.1.0/24', '37.238.100.0/20'],
    activeCarrierIsp: 'Newroz Telecom FTTH Enterprise / Fiber Core',
    currentDetectedIp: '185.120.76.19',
    enforcementPolicy: 'HYBRID_DYNAMIC_TOLERANT',
    status: 'ACTIVE_IN_BOUNDS',
    connectedLaptopsCount: 4,
    activeLaptops: [
      { id: 'lap-ebl-01', name: 'Chairman Executive Laptop (A1)', ip: '185.120.76.19', lastPing: 'Just now', isInsideBoundary: true },
      { id: 'lap-ebl-02', name: 'HQ Finance Ledger Terminal', ip: '185.120.76.22', lastPing: '1 min ago', isInsideBoundary: true },
      { id: 'lap-ebl-03', name: 'Group Procurement Server Gateway', ip: '192.168.1.180', lastPing: 'Just now', isInsideBoundary: true },
      { id: 'lap-ebl-04', name: 'IT Infrastructure Controller', ip: '192.168.1.100', lastPing: 'Just now', isInsideBoundary: true }
    ],
    lastSyncVerificationTime: 'Just now',
    notesKu: 'ناوەندی سەرەکی دەسەڵاتی هۆڵدینگ و سێرڤەری گشتی، خاوەنی مافی پەسەندکردنی کۆتاییە.',
    notesEn: 'Central authoritative holding gateway with master ledger validation rights.'
  },
  {
    id: 'zone-najaf-cement',
    siteCode: 'ZONE-NJF-CMT',
    nameKu: 'زۆنی پیشەسازی و کانییەکانی کارگەی چیمەنتۆی نەجەف',
    nameAr: 'منطقة مصنع إسمنت النجف والمقالع التشغيلية',
    nameEn: 'Najaf Cement Kiln & Industrial Quarry Zone',
    category: 'CEMENT_PLANT',
    governorate: 'Najaf',
    coordinates: {
      lat: 32.0259,
      lng: 44.3463,
      svgX: 47,
      svgY: 86
    },
    radiusKm: 40,
    allowedIpSubnets: ['94.207.130.0/24', '151.236.0.0/18', '94.207.0.0/16'],
    activeCarrierIsp: 'Earthlink Southern Iraq / Asiacell Cellular Gateway',
    currentDetectedIp: '94.207.130.65',
    enforcementPolicy: 'HYBRID_DYNAMIC_TOLERANT',
    status: 'ACTIVE_IN_BOUNDS',
    connectedLaptopsCount: 2,
    activeLaptops: [
      { id: 'lap-njf-01', name: 'Najaf Plant Manager Workstation', ip: '94.207.130.65', lastPing: 'Just now', isInsideBoundary: true },
      { id: 'lap-njf-02', name: 'Quarry Weighbridge & Gate Terminal', ip: '94.207.130.71', lastPing: '2 mins ago', isInsideBoundary: true }
    ],
    lastSyncVerificationTime: 'Just now',
    notesKu: 'بەرهەمهێنانی چیمەنتۆ و کڵینکەر، پێوانی ترێلەکان و ناردنی پسوولەی دەروازە بە شێوەی خۆکار بۆ هەولێر.',
    notesEn: 'Cement rotary kiln production, quarry scale weight bridges, and automated truck waybill sync.'
  },
  {
    id: 'zone-halabja-site',
    siteCode: 'ZONE-HLB-PRJ',
    nameKu: 'زۆنی ئۆپەراسیۆنی پڕۆژەی بیناسازی هەڵەبجە',
    nameAr: 'المنطقة التشغيلية لمشروع حلبجة الإنشائي',
    nameEn: 'Halabja Construction Field Operations Zone',
    category: 'CONSTRUCTION_SITE',
    governorate: 'Halabja',
    coordinates: {
      lat: 35.1778,
      lng: 45.9861,
      svgX: 82,
      svgY: 52
    },
    radiusKm: 20,
    allowedIpSubnets: ['37.238.114.0/24', '37.238.0.0/16', '185.120.0.0/16'],
    activeCarrierIsp: 'Fastlink LTE Iraq / GoranNet Fiber',
    currentDetectedIp: '37.238.114.82',
    enforcementPolicy: 'HYBRID_DYNAMIC_TOLERANT',
    status: 'ACTIVE_IN_BOUNDS',
    connectedLaptopsCount: 2,
    activeLaptops: [
      { id: 'lap-hlb-01', name: 'Halabja Site Engineer Laptop', ip: '37.238.114.82', lastPing: 'Just now', isInsideBoundary: true },
      { id: 'lap-hlb-02', name: 'Field Storekeeper POS Terminal', ip: '37.238.114.90', lastPing: '4 mins ago', isInsideBoundary: true }
    ],
    lastSyncVerificationTime: 'Just now',
    notesKu: 'پڕۆژەی مەیدانی بیناسازی، خەرجی و داواکاری کەرەستە ڕاستەوخۆ دەنێرێتە سەرۆکایەتی هۆڵدینگ.',
    notesEn: 'Civil construction site with direct PO requisition submissions to Chairman.'
  },
  {
    id: 'zone-sulaymaniyah-energy',
    siteCode: 'ZONE-SLE-ENG',
    nameKu: 'زۆنی کۆمپانیای وزە و دابەشکردن (سلێمانی)',
    nameAr: 'منطقة شركة الطاقة والخدمات (السليمانية)',
    nameEn: 'Sulaymaniyah Energy Operations Hub',
    category: 'ENERGY_HUB',
    governorate: 'Sulaymaniyah',
    coordinates: {
      lat: 35.5558,
      lng: 45.4351,
      svgX: 74,
      svgY: 44
    },
    radiusKm: 30,
    allowedIpSubnets: ['185.120.76.0/24', '185.120.0.0/16'],
    activeCarrierIsp: 'Newroz Telecom FTTH Enterprise',
    currentDetectedIp: '185.120.76.19',
    enforcementPolicy: 'HYBRID_DYNAMIC_TOLERANT',
    status: 'ACTIVE_IN_BOUNDS',
    connectedLaptopsCount: 1,
    activeLaptops: [
      { id: 'lap-sle-01', name: 'Sulaymaniyah Energy Ops Lead', ip: '185.120.76.19', lastPing: 'Just now', isInsideBoundary: true }
    ],
    lastSyncVerificationTime: 'Just now',
    notesKu: 'تۆڕی کارەبا، مۆلیدەی گەورە و کۆگای سووتەمەنی ناوچەی سلێمانی.',
    notesEn: 'Electrical microgrid and heavy regional generator fleet coordination.'
  },
  {
    id: 'zone-duhok-concrete',
    siteCode: 'ZONE-DHK-PLT',
    nameKu: 'زۆنی پیشەسازی کارگەی کۆنکرێت و پۆڵا (دهۆک)',
    nameAr: 'منطقة مصنع الخرسانة والصلب (دهوك)',
    nameEn: 'Duhok Concrete & Rebar Fabrication Zone',
    category: 'CEMENT_PLANT',
    governorate: 'Duhok',
    coordinates: {
      lat: 36.8679,
      lng: 42.9886,
      svgX: 35,
      svgY: 18
    },
    radiusKm: 25,
    allowedIpSubnets: ['149.255.228.0/24', '149.255.0.0/16'],
    activeCarrierIsp: 'Korek Telecom 4G Data Core',
    currentDetectedIp: '149.255.228.34',
    enforcementPolicy: 'HYBRID_DYNAMIC_TOLERANT',
    status: 'ACTIVE_IN_BOUNDS',
    connectedLaptopsCount: 1,
    activeLaptops: [
      { id: 'lap-dhk-01', name: 'Duhok Plant Batching Controller', ip: '149.255.228.34', lastPing: 'Just now', isInsideBoundary: true }
    ],
    lastSyncVerificationTime: 'Just now',
    notesKu: 'کارگەی بەرهەمهێنانی کۆنکرێتی ئامادەکراو و بڕینی شیشی پۆڵا.',
    notesEn: 'Ready-mix concrete batching and computerized rebar fabrication.'
  },
  {
    id: 'zone-zakho-terminal',
    siteCode: 'ZONE-ZKH-GAT',
    nameKu: 'زۆنی دەروازەی لۆجستیكس و ترانزێتی زاخۆ',
    nameAr: 'منطقة منفذ زاخو اللوجستي والترانزيت',
    nameEn: 'Zakho Logistics & Border Transit Gate Zone',
    category: 'LOGISTICS_GATE',
    governorate: 'Zakho',
    coordinates: {
      lat: 37.1439,
      lng: 42.6874,
      svgX: 28,
      svgY: 12
    },
    radiusKm: 15,
    allowedIpSubnets: ['151.236.14.0/24', '151.236.0.0/16'],
    activeCarrierIsp: 'Asiacell 4G Roaming Gateway',
    currentDetectedIp: '151.236.14.99',
    enforcementPolicy: 'HYBRID_DYNAMIC_TOLERANT',
    status: 'ACTIVE_IN_BOUNDS',
    connectedLaptopsCount: 1,
    activeLaptops: [
      { id: 'lap-zkh-01', name: 'Zakho Gate OCR Scanner Terminal', ip: '151.236.14.99', lastPing: 'Just now', isInsideBoundary: true }
    ],
    lastSyncVerificationTime: 'Just now',
    notesKu: 'پشکنینی ئۆتۆماتیکی ژمارەی بارهەڵگرەکان و سەلامەتی بارە هاوردەکراوەکان.',
    notesEn: 'Automated optical plate recognition and import manifest synchronization.'
  },
  {
    id: 'zone-baghdad-liaison',
    siteCode: 'ZONE-BGD-CML',
    nameKu: 'زۆنی لقی بازرگانی و دارایی ناوەندی بەغدا',
    nameAr: 'منطقة فرع بغداد التجاري والتنسيق المالي',
    nameEn: 'Baghdad Commercial & Ministry Liaison Zone',
    category: 'COMMERCIAL_OFFICE',
    governorate: 'Baghdad',
    coordinates: {
      lat: 33.3152,
      lng: 44.3661,
      svgX: 55,
      svgY: 72
    },
    radiusKm: 35,
    allowedIpSubnets: ['194.36.110.0/24', '194.36.0.0/16', '94.207.0.0/16'],
    activeCarrierIsp: 'TarinNet Wireless / Earthlink Enterprise',
    currentDetectedIp: '194.36.110.42',
    enforcementPolicy: 'HYBRID_DYNAMIC_TOLERANT',
    status: 'ACTIVE_IN_BOUNDS',
    connectedLaptopsCount: 1,
    activeLaptops: [
      { id: 'lap-bgd-01', name: 'Baghdad Trade Director Laptop', ip: '194.36.110.42', lastPing: 'Just now', isInsideBoundary: true }
    ],
    lastSyncVerificationTime: 'Just now',
    notesKu: 'بەدواداچوونی گرێبەستە حکومییەکان و بەبازاڕکردنی بەرهەمەکانی کارگەی چیمەنتۆی نەجەف لە بەغدا.',
    notesEn: 'Federal ministry tender contracts and distribution hub for Najaf cement in Baghdad.'
  }
];
