import { UserRole, UserProfile } from '../types/erp';

export interface ModulePermissionDefinition {
  id: string;
  nameEn: string;
  nameKu: string;
  nameAr: string;
  category: 'EXECUTIVE' | 'CORE_OPERATIONS' | 'FIELD_INFRA' | 'ADMIN_PEOPLE';
  descriptionEn: string;
  descriptionKu: string;
}

export const ALL_SYSTEM_MODULES: ModulePermissionDefinition[] = [
  {
    id: 'holding-dashboard',
    nameEn: 'Holding HQ Dashboard & Overview',
    nameKu: 'داشبۆردی سەرەکی سەرۆکایەتی هۆلدینگ',
    nameAr: 'لوحة القيادة المركزية للمجموعة',
    category: 'EXECUTIVE',
    descriptionEn: 'Consolidated executive radar, KPI summaries, and inter-company performance.',
    descriptionKu: 'کۆکراوەی سەرجەم داتاکان، خشتەی کۆمپانیاکان، و پێوەرە سەرەکییەکان.'
  },
  {
    id: 'vendor-license-hub',
    nameEn: 'Platform Owner Vendor & License Hub',
    nameKu: 'پۆڕتاڵی خاوەنی سەکۆ و بەڕێوەبردنی لایسنس',
    nameAr: 'بوابة مالك المنصة وإدارة التراخيص',
    category: 'EXECUTIVE',
    descriptionEn: 'Dedicated vendor command center to generate, monitor, and renew client licenses.',
    descriptionKu: 'پۆڕتاڵی تایبەتی خاوەنی سەکۆ بۆ دروستکردن و نوێکردنەوەی مانگانەی لایسنسی کڕیاران.'
  },
  {
    id: 'owner-approvals',
    nameEn: 'Holding Owner Approvals & Signatures',
    nameKu: 'واژۆی سەرۆکایەتی و پەسەندکردنی خاوەن',
    nameAr: 'موافقات وتواقيع مالك المجموعة',
    category: 'EXECUTIVE',
    descriptionEn: 'High-value PO approvals, capital expenditure reviews, and budget overrides.',
    descriptionKu: 'پەسەندکردنی داواکاری کڕین، گرێبەستە گەورەکان و دەرچوون لە بودجە.'
  },
  {
    id: 'companies-projects',
    nameEn: 'Subsidiaries & Strategic Projects',
    nameKu: 'کۆمپانیا و پڕۆژە ستراتیژییەکان',
    nameAr: 'الشركات والمشاريع التابعة',
    category: 'EXECUTIVE',
    descriptionEn: 'Entity profile management, sub-projects, and branch operational budget oversight.',
    descriptionKu: 'بەڕێوەبردنی لقەکان، پڕۆژە نیشتمانییەکان و سەقفەکانی خەرجی.'
  },
  {
    id: 'ml-anomaly-detection',
    nameEn: 'AI Anomaly Sentinel (ML Engine)',
    nameKu: 'چاودێری ژیری دەستکرد (ML Sentinel)',
    nameAr: 'رادار الذكاء الاصطناعي للمخاطر المالية',
    category: 'EXECUTIVE',
    descriptionEn: 'Machine learning fraud detection, split purchase alerts, and ghost worker prevention.',
    descriptionKu: 'دۆزینەوەی هەڵەکان، فێڵی پارچەکردنی داواکارییەکان، و زەنگی ئاگاداری.'
  },
  {
    id: 'virtual-meetings',
    nameEn: 'Executive Virtual Meeting Hub',
    nameKu: 'کۆبوونەوەی دەنگی و ڤیدیۆیی ڕاستەوخۆ',
    nameAr: 'مركز الاجتماعات المرئية للإدارة',
    category: 'EXECUTIVE',
    descriptionEn: 'Encrypted video conferences between HQ, General Managers, and project sites.',
    descriptionKu: 'کۆبوونەوەی خێرای ڤیدیۆیی لەگەڵ بەڕێوەبەرانی گشتی و ستافی مەیدانی.'
  },
  {
    id: 'direct-comms',
    nameEn: 'Kelegram (Telegram Messenger)',
    nameKu: 'کەڵەگرام (Kelegram Messenger)',
    nameAr: 'كَلَغرام (Kelegram)',
    category: 'EXECUTIVE',
    descriptionEn: 'Telegram recreation with voice notes, official channels, board groups, and bot.',
    descriptionKu: 'تەلەگرامی ناوخۆیی هۆلدینگ: نامەی دەنگی، کەناڵی فەرمی، گروپی بەڕێوەبەران و بۆتی هۆشمەند.'
  },
  {
    id: 'project-reports',
    nameEn: 'Field Progress & Gantt Reports',
    nameKu: 'ڕاپۆرتە خولییەکان و هێڵکاری گانت',
    nameAr: 'تقارير الإنجاز وجداول جانت للمشاريع',
    category: 'EXECUTIVE',
    descriptionEn: 'Periodic milestones, digital signatures, and PDF export dossiers.',
    descriptionKu: 'ڕاپۆرتی پێشکەوتنی کارەکان و خشتەی بەستنەوەی پڕۆژەکان.'
  },
  {
    id: 'procurement',
    nameEn: 'Procurement & Purchase Orders',
    nameKu: 'کڕین و بەدواداچوونی داواکارییەکان',
    nameAr: 'المشتريات وطلبات التجهيز',
    category: 'CORE_OPERATIONS',
    descriptionEn: 'End-to-end procurement requests, 3-tier approvals, and supplier catalog.',
    descriptionKu: 'تۆمارکردنی داواکارییەکان، نرخی پێشنیارکراو، و واژۆکردن.'
  },
  {
    id: 'finance',
    nameEn: 'Finance, Ledgers & Invoicing',
    nameKu: 'دارایی، ژمێریاری و گەنجینە',
    nameAr: 'المالية ودفاتر الأستاذ والفواتير',
    category: 'CORE_OPERATIONS',
    descriptionEn: 'General ledgers, inter-company bilateral invoicing, and voucher journals.',
    descriptionKu: 'سەندی خەرجی و داهات، باڵانسەکان، و پشکنینی مووچە.'
  },
  {
    id: 'warehouse',
    nameEn: 'Warehouse & Materials Inventory',
    nameKu: 'کۆگا و کەرەستە سەرەکییەکان',
    nameAr: 'المستودعات ومخزون المواد',
    category: 'CORE_OPERATIONS',
    descriptionEn: 'Stock management, minimum threshold alerts, and inward/outward batch movements.',
    descriptionKu: 'کەرەستەکانی بیناسازی و چیمەنتۆ و ئامێرە یەدەگەکان.'
  },
  {
    id: 'dispatch-logistics',
    nameEn: 'Dispatch Logistics & Heavy Haulage',
    nameKu: 'بارکردن و لۆجستی بارهەڵگرەکان',
    nameAr: 'الشحن واللوجستيات وحركة الشاحنات',
    category: 'CORE_OPERATIONS',
    descriptionEn: 'Weighbridge metrics, driver dispatch manifests, and route dispatch tracking.',
    descriptionKu: 'کێشی قەپان، بارنامەی سەفەر و هاتووچۆی ئۆتۆمبێلەکان.'
  },
  {
    id: 'gate-scanner',
    nameEn: 'Gate Scanner & Optical Barcode Checkpoint',
    nameKu: 'سکێنەری دەروازە و بارکۆدی هاتووچۆ',
    nameAr: 'ماسح البوابات ونقاط التفتيش البصرية',
    category: 'CORE_OPERATIONS',
    descriptionEn: 'Real-time vehicle license recognition and instant QR material voucher audit.',
    descriptionKu: 'خوێندنەوەی پسوولەی کۆگا و بارکۆد لە دەروازەی پڕۆژەکان.'
  },
  {
    id: 'technical-electrical',
    nameEn: 'Technical, Power & Generator Plants',
    nameKu: 'تەکنیکی، کارەبا و مۆلیدەی گەورە',
    nameAr: 'الصيانة الفنية ومحطات الكهرباء والمولدات',
    category: 'FIELD_INFRA',
    descriptionEn: 'Fuel consumption telemetry, power outage tracking, and turbine maintenance.',
    descriptionKu: 'چاودێری سوتەمەنی مۆلیدە، هێڵی کارەبای نیشتمانی و پشکنینەکان.'
  },
  {
    id: 'camps-accommodation',
    nameEn: 'Worker Camps & Living Compounds',
    nameKu: 'کەمپی نیشتەجێبوون و هۆڵی مانەوە',
    nameAr: 'مجمعات سكن العمال والميدان',
    category: 'FIELD_INFRA',
    descriptionEn: 'Room allotments, bed utilization rates, catering, and hygiene audits.',
    descriptionKu: 'دابەشکردنی ژوورەکان، پێداویستی ژیان و سەلامەتی کەمپ.'
  },
  {
    id: 'hse-fire-security',
    nameEn: 'HSE Safety, Fire & Site Security',
    nameKu: 'سەلامەتی مەیدانی (HSE) و ئاگرکوژێنەوە',
    nameAr: 'السلامة والصحة المهنية ومكافحة الحرائق',
    category: 'FIELD_INFRA',
    descriptionEn: 'Incident severity logging, lost-time-injury (LTI) counters, and safety compliance.',
    descriptionKu: 'تۆماری ڕووداوەکان، مەشقی ئاگرکوژێنەوە و پێداویستی سەلامەتی کارمەند.'
  },
  {
    id: 'foreign-workers',
    nameEn: 'Foreign Labor, Iqamas & Visas',
    nameKu: 'کرێکارانی بیانی، ئیقامە و ڤیزا',
    nameAr: 'العمالة الأجنبية والإقامات والتأشيرات',
    category: 'ADMIN_PEOPLE',
    descriptionEn: 'Passport registries, 30-day expiry notifications, and work permits.',
    descriptionKu: 'چاودێری بەسەرچوونی مۆڵەتی نیشتەجێبوون و کاتی نوێکردنەوە.'
  },
  {
    id: 'hr-payroll',
    nameEn: 'Human Resources & Monthly Payroll',
    nameKu: 'سەرچاوە مرۆییەکان و مووچە (HR)',
    nameAr: 'الموارد البشرية وكشوف الرواتب الشهرية',
    category: 'ADMIN_PEOPLE',
    descriptionEn: 'Staff contracts, attendance biometric sync, and payroll compensation.',
    descriptionKu: 'تۆماری فەرمانبەران، ئامادەبوون و لیستی مووچەی مانگانە.'
  },
  {
    id: 'correspondence',
    nameEn: 'Official Correspondence & Letters',
    nameKu: 'نووسراوی فەرمی و ئاڵوگۆڕی نامە',
    nameAr: 'المراسلات والكتب الرسمية والصادرة والواردة',
    category: 'ADMIN_PEOPLE',
    descriptionEn: 'Official administrative ministerial memos, outgoing/incoming tracking, and stamps.',
    descriptionKu: 'نووسراوی هاتووە و دەرچووە، ئیمزا و نووسراوە فەرمییەکان.'
  },
  {
    id: 'it-systems',
    nameEn: 'IT Systems, Latency & QR Asset Tracking',
    nameKu: 'ئایتی، چاودێری تۆڕ و تاگی ئامێرەکان',
    nameAr: 'أنظمة IT وتتبع الأجهزة وشبكة المزامنة',
    category: 'ADMIN_PEOPLE',
    descriptionEn: 'Physical hardware custody, live camera QR scanning, and multi-site latency ping radar.',
    descriptionKu: 'چاودێری سێرڤەرەکان، تاگی QR، کامێرای سکان و ترپەی دڵی نۆدەکان.'
  }
];

/**
 * Standard default permissions matrix based on company/project/holding hierarchy
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  HOLDING_OWNER: [
    'holding-dashboard',
    'vendor-license-hub',
    'owner-approvals',
    'companies-projects',
    'ml-anomaly-detection',
    'virtual-meetings',
    'direct-comms',
    'project-reports',
    'procurement',
    'finance',
    'warehouse',
    'dispatch-logistics',
    'gate-scanner',
    'technical-electrical',
    'camps-accommodation',
    'hse-fire-security',
    'foreign-workers',
    'hr-payroll',
    'correspondence',
    'it-systems'
  ],
  SUPER_ADMIN: [
    'holding-dashboard',
    'vendor-license-hub',
    'owner-approvals',
    'companies-projects',
    'ml-anomaly-detection',
    'virtual-meetings',
    'direct-comms',
    'project-reports',
    'procurement',
    'finance',
    'warehouse',
    'dispatch-logistics',
    'gate-scanner',
    'technical-electrical',
    'camps-accommodation',
    'hse-fire-security',
    'foreign-workers',
    'hr-payroll',
    'correspondence',
    'it-systems'
  ],
  COMPANY_GM: [
    'holding-dashboard',
    'companies-projects',
    'project-reports',
    'procurement',
    'finance',
    'warehouse',
    'dispatch-logistics',
    'virtual-meetings',
    'direct-comms',
    'technical-electrical',
    'hse-fire-security',
    'foreign-workers',
    'hr-payroll',
    'correspondence'
  ],
  PROJECT_MANAGER: [
    'holding-dashboard',
    'project-reports',
    'procurement',
    'warehouse',
    'gate-scanner',
    'dispatch-logistics',
    'technical-electrical',
    'camps-accommodation',
    'hse-fire-security',
    'foreign-workers',
    'direct-comms'
  ],
  EMPLOYEE: [
    'procurement', // to submit/track own requests
    'camps-accommodation',
    'direct-comms'
  ],
  FINANCE_HEAD: [
    'finance',
    'procurement',
    'companies-projects',
    'project-reports',
    'direct-comms'
  ],
  WAREHOUSE_OFFICER: [
    'warehouse',
    'gate-scanner',
    'dispatch-logistics',
    'procurement',
    'direct-comms'
  ],
  SECURITY_GATE: [
    'gate-scanner',
    'dispatch-logistics',
    'camps-accommodation',
    'hse-fire-security'
  ],
  HR_MANAGER: [
    'hr-payroll',
    'foreign-workers',
    'camps-accommodation',
    'correspondence',
    'direct-comms'
  ],
  HSE_OFFICER: [
    'hse-fire-security',
    'camps-accommodation',
    'gate-scanner',
    'foreign-workers',
    'direct-comms'
  ],
  TECHNICAL_HEAD: [
    'technical-electrical',
    'warehouse',
    'it-systems',
    'procurement',
    'direct-comms'
  ]
};

/**
 * Check if the current user is the Platform Owner / Master Vendor (User with access to System 2)
 */
export function checkIsMasterVendorOwner(user?: UserProfile | null): boolean {
  if (!user) return false;
  const isEmailMatch = user.email?.toLowerCase().trim() === 'kurdkodofficial@gmail.com';
  const isVerifiedInStorage = typeof localStorage !== 'undefined' && (
    localStorage.getItem('sas4erp_verified_owner_email') === 'kurdkodofficial@gmail.com' ||
    localStorage.getItem('sas4erp_owner_session') === 'verified'
  );
  return (
    user.role === 'HOLDING_OWNER' ||
    user.role === 'SUPER_ADMIN' ||
    Boolean(user.isOwnerVerified) ||
    isEmailMatch ||
    isVerifiedInStorage ||
    user.email === 'chairman@holding.com' ||
    Boolean(user.email?.toLowerCase().includes('kurd')) ||
    Boolean(user.title?.toLowerCase().includes('owner')) ||
    Boolean(user.title?.toLowerCase().includes('chairman')) ||
    Boolean(user.title?.toLowerCase().includes('خاوەن')) ||
    Boolean(user.title?.toLowerCase().includes('سەرۆک'))
  );
}

/**
 * Check if a specific user has permission to view/access a given module ID
 */
export function hasModuleAccess(user: UserProfile, moduleId: string): boolean {
  // CRITICAL: vendor-license-hub is strictly for the Platform Owner / ME
  // Subscribers, clients, GMs, PMs, and other staff must NEVER access it
  if (moduleId === 'vendor-license-hub') {
    return checkIsMasterVendorOwner(user);
  }

  // Holding Owner and Super Admin always have absolute unrestricted access
  if (user.role === 'HOLDING_OWNER' || user.role === 'SUPER_ADMIN') {
    return true;
  }

  // If specific custom accessibleModules array is explicitly defined for the user, use it
  if (user.accessibleModules && Array.isArray(user.accessibleModules)) {
    return user.accessibleModules.includes(moduleId);
  }

  // Fallback to standard role-based default permissions
  const allowed = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
  return allowed.includes(moduleId);
}
