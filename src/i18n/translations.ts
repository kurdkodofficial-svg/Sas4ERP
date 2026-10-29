import { Language } from '../types/erp';

export interface TranslationDict {
  [key: string]: {
    en: string;
    ku: string;
    ar: string;
  };
}

export const translations: TranslationDict = {
  // Brand & Header
  appName: {
    en: 'SAS4ERP Holding Suite',
    ku: 'سیستەمی هۆلدینگی SAS4ERP',
    ar: 'منظومة ساس القابضة SAS4ERP',
  },
  tagline: {
    en: 'Enterprise Multi-Company & Multi-Project Ecosystem',
    ku: 'سیستەمی فرە کۆمپانیا و پرۆژەی هۆلدینگ',
    ar: 'منظومة الشركات المتعددة والمشاريع القابضة',
  },
  holdingGroup: {
    en: 'Holding Group',
    ku: 'گرووپی هۆلدینگ',
    ar: 'المجموعة القابضة',
  },
  allCompanies: {
    en: 'All Holding Companies',
    ku: 'هەموو کۆمپانیاکانی هۆلدینگ',
    ar: 'جميع شركات المجموعة',
  },
  allProjects: {
    en: 'All Projects',
    ku: 'هەموو پرۆژەکان',
    ar: 'كافة المشاريع',
  },
  holdingOwner: {
    en: 'Holding Owner / Chairman',
    ku: 'خاوەنی هۆلدینگ / سەرۆک',
    ar: 'مالك المجموعة / رئيس مجلس الإدارة',
  },
  systemPlatformName: {
    en: 'SAS System',
    ku: 'سیستەمی SAS',
    ar: 'نظام SAS',
  },
  setupHoldingTitle: {
    en: 'Configure Holding & Owner Identity in SAS',
    ku: 'ڕێکخستنی ناوی هۆلدینگ و خاوەنی هۆلدینگ لە سیستەمی SAS',
    ar: 'إعداد اسم المجموعة القابضة والمالك في نظام SAS',
  },
  setupHoldingSubtitle: {
    en: 'SAS is the enterprise system. Each holding writes its own holding name and owner name.',
    ku: 'SAS ناوی سیستەمەکەیە. هەموو هۆلدینگێک دەتوانێت ناوی هۆلدینگی خۆی و ناوی خاوەنەکەی بەخۆی بنووسێت.',
    ar: 'SAS هو اسم النظام. يمكن لكل مجموعة كتابة اسم الهولدينغ واسم المالك بنفسها.',
  },
  holdingOwnerNameInput: {
    en: 'Holding Owner / Chairman Name',
    ku: 'ناوی خاوەن یان سەرۆکی هۆلدینگ',
    ar: 'اسم مالك أو رئيس المجموعة القابضة',
  },
  activeLanguage: {
    en: 'Language',
    ku: 'زمان',
    ar: 'اللغة',
  },
  nativeLangMode: {
    en: 'Native Language Auto-Translator',
    ku: 'وەرگێڕی خۆکاری زمانی دایک',
    ar: 'المترجم الآلي للغة الأم',
  },
  viewInMyLanguage: {
    en: 'Translate to My Language',
    ku: 'وەرگێڕان بۆ زمانی من',
    ar: 'ترجمة إلى لغتي الأم',
  },

  // Navigation Items
  navHoldingDashboard: {
    en: 'Holding HQ Dashboard',
    ku: 'داشبۆردی سەرەکی هۆلدینگ',
    ar: 'لوحة قيادة المقر القابض',
  },
  navCompaniesProjects: {
    en: 'Companies & Projects',
    ku: 'کۆمپانیاکان و پرۆژەکان',
    ar: 'الشركات والمشاريع',
  },
  navOwnerApprovals: {
    en: 'Owner Purchase Approvals',
    ku: 'ڕەزامەندی خاوەن بۆ کڕین',
    ar: 'موافقات المالك للشراء',
  },
  navVirtualMeetings: {
    en: 'Executive Virtual Meetings',
    ku: 'کۆبوونەوەی دەنگی و ڤیدیۆیی بەڕێوەبەران',
    ar: 'الاجتماعات الافتراضية للإدارة',
  },
  navContactManagers: {
    en: 'Direct Manager Communications',
    ku: 'پەیوەندی ڕاستەوخۆ بە بەڕێوەبەران',
    ar: 'الاتصال المباشر بالمدراء',
  },
  navGateScanner: {
    en: 'Main Gate Barcode Scanner',
    ku: 'دەرگای سەرەکی و سکانی پسوولە',
    ar: 'البوابة الرئيسية والمسح الآلي',
  },
  navFinance: {
    en: 'Finance & Accounting',
    ku: 'دارایی و ژمێریاری',
    ar: 'المالية والحسابات',
  },
  navProcurement: {
    en: 'Procurement & Supply Chain',
    ku: 'کڕین و دابینکردنی پێداویستی',
    ar: 'المشتريات وسلسلة الإمداد',
  },
  navWarehouse: {
    en: 'Warehouse & Inventory',
    ku: 'کۆگا و ماددەکان',
    ar: 'المستودعات والمخزون',
  },
  navHrPayroll: {
    en: 'HR & Payroll',
    ku: 'سەرچاوە مرۆییەکان و مووچە',
    ar: 'الموارد البشرية والرواتب',
  },
  navForeignWorkers: {
    en: 'Foreign Workers & Expatriates',
    ku: 'بەرێوەبردنی بێگانەکان و ئیقامە',
    ar: 'إدارة العمالة الأجنبية والإقامات',
  },
  navAccommodation: {
    en: 'Engineers & Workers Camp',
    ku: 'شوێنی مانەوەی ئەندازیار و کارکەران',
    ar: 'سكن المهندسين ومخيمات العمال',
  },
  navHseSecurity: {
    en: 'HSE, Fire Safety & Site Security',
    ku: 'ئاگرکوژێنەوە، سەلامەتی و سکیوریتی',
    ar: 'السلامة، الإطفاء وأمن الموقع',
  },
  navTechnicalElectrical: {
    en: 'Technical, Electrical & Machinery',
    ku: 'بەشی تەکنیکی، کارەبا و مەکینە',
    ar: 'القسم الفني، الكهرباء والمعدات',
  },
  navCorrespondence: {
    en: 'Inbound & Outbound (الصادرة والواردة)',
    ku: 'نوسراوی هاتو و نێردراو (الصادرة والواردة)',
    ar: 'الاتصالات الإدارية (الصادرة والواردة)',
  },
  navDispatchLogistics: {
    en: 'Product Dispatch & Fleet',
    ku: 'بەڕێکردنی بەرهەم و لۆجستیك',
    ar: 'شحن وتوزيع المنتجات والأسطول',
  },
  navDocArchive: {
    en: 'Document Control & Archiving',
    ku: 'دێکۆمێنت و ئەرشیف',
    ar: 'إدارة الوثائق والأرشفة',
  },
  navItSystems: {
    en: 'IT & Digital Infrastructure',
    ku: 'تەکنەلۆجیای زانیاری و سیستەم',
    ar: 'تكنولوجيا المعلومات والأنظمة',
  },

  // Gate Scanner Automation Specifics
  gateScannerTitle: {
    en: 'Gate Arrival & Automatic Multi-Department Sync',
    ku: 'هاتنەژوورەوەی دەرگای سەرەکی و هاوکاتکردنی خۆکاری بەشەکان',
    ar: 'دخول البوابة الرئيسية والتزامن الآلي للأقسام',
  },
  scanReceiptBtn: {
    en: 'Scan Delivery Barcode / Invoice',
    ku: 'سکانکردنی بارکۆد / پسوولەی کڕین',
    ar: 'مسح باركود / فاتورة الشراء',
  },
  tripleNotificationNotice: {
    en: 'Scanning instantly updates Warehouse, triggers Finance Journal entry, and alerts Project Managers.',
    ku: 'سکانکردن بە یەک چرکە ئاگاداری بۆ کۆگا، دروستکردنی قەیدی دارایی، و ئاگاداری بۆ بەڕێوەبەری پرۆژە دەنێرێت.',
    ar: 'المسح يرسل فوراً إشعاراً للمستودع، ويُنشئ قيداً محاسبياً بالمالية، ويخطر مدير المشروع.',
  },
  warehouseNotified: {
    en: 'Warehouse Notified for Stock Inward',
    ku: 'بەشی کۆگا ئاگادارکرایەوە بۆ وەرگرتنی ماددەکان',
    ar: 'تم إخطار المستودع للاستلام الفوري',
  },
  financeAutoPosted: {
    en: 'Finance Automated Journal Posted',
    ku: 'لە بەشی دارایی خۆکارانە قەیدی ژمێریاری تۆمارکرا',
    ar: 'تم تسجيل القيد المحاسبي آلياً في قسم المالية',
  },
  managerAlerted: {
    en: 'Company & Project Manager Alerted',
    ku: 'بەڕێوەبەری کۆمپانیا و پرۆژە ئاگادارکرایەوە',
    ar: 'تم إشعار مدير الشركة ومدير المشروع بالوصول',
  },

  // Holding Approval Rule
  holdingOwnerRuleBanner: {
    en: 'Holding Rule: No purchase order is processed without direct approval from the Holding Owner.',
    ku: 'یاسای هۆلدینگ: هیچ کڕینێک جێبەجێ ناکرێت تا خاوەنی هۆلدینگ ڕەزامەندی نەدات.',
    ar: 'قانون المجموعة: لا يتم صرف أي أمر شراء دون الموافقة المباشرة لمالك المجموعة.',
  },
  generalManagersTitle: {
    en: 'Subsidiary General Managers (بەڕێوەبەرە گشتیەکان)',
    ku: 'بەڕێوەبەرە گشتیەکانی کۆمپانیاکانی هۆلدینگ',
    ar: 'المدراء العامون لشركات المجموعة القابضة',
  },
  addGeneralManagerBtn: {
    en: 'Add General Manager (+)',
    ku: 'زیادکردنی بەڕێوەبەری گشتی (+)',
    ar: 'إضافة مدير عام (+)',
  },
  gmProgressAndDashboard: {
    en: 'General Manager Performance & Progress Dashboard',
    ku: 'داشبۆرد و بەدواداچوونی بەرەوپێشچوونی کارەکانی بەڕێوەبەری گشتی',
    ar: 'لوحة متابعة وإنجازات أعمال المدير العام',
  },
  superAdminOnlyNotice: {
    en: 'Super Admin Action: Add & Assign Subsidiary General Managers',
    ku: 'دەسەڵاتی سوپەر ئەدمین: زیادکردن و دەستنیشانکردنی بەڕێوەبەرە گشتیەکان',
    ar: 'صلاحية المشرف العام: إضافة وتعيين المدراء العامين',
  },
  holdingOwnerOversightNotice: {
    en: 'Holding Owner Oversight: Full real-time visibility into all GM activities & milestones',
    ku: 'چاودێری خاوەنی هۆلدینگ: بینینی تەواوی داشبۆرد و بەرەوپێشچوونی هەموو بەڕێوەبەرە گشتیەکان',
    ar: 'إشراف مالك المجموعة: اطلاع مباشر على كافة أعمال ولوحات المدراء العامين',
  },
  approvePurchase: {
    en: 'Approve Purchase',
    ku: 'پەسەندکردنی کڕین',
    ar: 'اعتماد الشراء',
  },
  rejectPurchase: {
    en: 'Reject Purchase',
    ku: 'ڕەتکردنەوەی کڕین',
    ar: 'رفض الشراء',
  },
  pendingOwnerApproval: {
    en: 'Pending Owner Approval',
    ku: 'چاوەڕوانی ڕەزامەندی خاوەن',
    ar: 'بانتظار موافقة المالك',
  },
  approvedByOwner: {
    en: 'Approved by Holding Owner',
    ku: 'لەلایەن خاوەنی هۆلدینگ پەسەندکرا',
    ar: 'معتمد من مالك المجموعة',
  },

  // Foreign Workers & Residency
  foreignWorkersTitle: {
    en: 'Foreign Workers, Passports & Iqama Residency',
    ku: 'بەرێوەبردنی بێگانەکان، پاسپۆرت و ئیقامە',
    ar: 'إدارة العمالة الوافدة، الجوازات والإقامات',
  },
  iqamaExpiryWarning: {
    en: 'Residency (Iqama) Expiry Alert',
    ku: 'ئاگاداری بەسەرچوونی ماوەی ئیقامە',
    ar: 'تنبيه انتهاء صلاحية الإقامة',
  },

  // Accommodations
  accommodationTitle: {
    en: 'Engineers Residence & Workers Living Camps',
    ku: 'شوێنی مانەوەی ئەندازیار و کەمپی کرێکاران',
    ar: 'سكن المهندسين ومخيمات معيشة العمال',
  },
  occupancyRate: {
    en: 'Occupancy Rate',
    ku: 'ڕێژەی پڕبوونی ژوورەکان',
    ar: 'نسبة الإشغال السكني',
  },

  // HSE & Safety
  fireSafetyStatus: {
    en: 'Fire Extinguishers & Safety Readiness',
    ku: 'ئامادەباشی ئاگرکوژێنەوە و سەلامەتی کار',
    ar: 'جاهزية طفايات الحريق والسلامة المهنية',
  },
  evacuationDrill: {
    en: 'Evacuation Drills & Site Security',
    ku: 'ڕاهێنانی فریاگوزاری و سکیوریتی',
    ar: 'تمارين الإخلاء وأمن الموقع',
  },

  // Technical & Electrical
  technicalGenerators: {
    en: 'Generators, High Voltage & Machinery Maintenance',
    ku: 'مۆلیدە، کارەبای پەستانی بەرز و مەکینەکان',
    ar: 'المولدات، الضغط العالي وصيانة الآليات',
  },

  // Virtual Meetings
  startInstantMeeting: {
    en: 'Start Executive Virtual Meeting',
    ku: 'دەستپێکردنی کۆبوونەوەی بەپەلەی بەڕێوەبەران',
    ar: 'بدء اجتماع افتراضي فوري للإدارة',
  },
  callManager: {
    en: 'Direct Audio/Video Call to Manager',
    ku: 'پەیوەندی دەنگی و ڕەنگاوڕەنگ بە بەڕێوەبەر',
    ar: 'اتصال مباشر بالصوت والصورة بالمدير',
  },
  generateAiMinutes: {
    en: 'Generate AI Meeting Minutes',
    ku: 'دروستکردنی کۆنووسی زیرەکی کۆبوونەوە',
    ar: 'توليد محضر الاجتماع بالذكاء الاصطناعي',
  },
  liveVoiceTranslation: {
    en: 'Live AI Voice & Text Translation',
    ku: 'وەرگێڕانی زیندووی دەنگ و نووسین',
    ar: 'الترجمة الفورية المباشرة للصوت والنص',
  },
  realtimeCaptions: {
    en: 'Live Subtitles & Interpretation',
    ku: 'ژێرنووس و وەرگێڕانی هاوکات',
    ar: 'الترجمة الفورية والترجمة النصية المباشرة',
  },
  speakToTranslate: {
    en: 'Speak to Translate (Mic)',
    ku: 'قسەبکە و وەربگێڕە (مایکرۆفۆن)',
    ar: 'تحدث للترجمة المباشرة (المايكروفون)',
  },
  autoTranslateChat: {
    en: 'Auto-Translate Room Chat',
    ku: 'وەرگێڕانی ئۆتۆماتیکی چات بۆ زمانی من',
    ar: 'الترجمة التلقائية لمحادثة القاعة',
  },
  listenAudio: {
    en: 'Listen to Voice',
    ku: 'گوێگرتن لە دەنگ',
    ar: 'الاستماع بالصوت',
  },
  translateNotes: {
    en: 'Translate Notes to My Language',
    ku: 'وەرگێڕانی تێبینییەکان بۆ زمانی من',
    ar: 'ترجمة الملاحظات إلى لغتي',
  },
  testExecutiveVoice: {
    en: 'Simulate Spoken Speech',
    ku: 'تاقیکردنەوەی دەنگی قسەکەر بە زمانەکانی تر',
    ar: 'محاكاة تحدث المدراء بلغات أخرى',
  },

  // Correspondence
  inboundOutboundTitle: {
    en: 'Official Letters (Inbound & Outbound / الصادرة والواردة)',
    ku: 'نوسراوی فەرمی (الصادرة والواردة / هاتوو و نێردراو)',
    ar: 'الاتصالات الإدارية والمراسلات الرسمية (الصادرة والواردة)',
  },
  draftAiLetter: {
    en: 'Draft Official Memo with AI',
    ku: 'داڕشتنی نووسراوی فەرمی بە زیرەکی دەستکرد',
    ar: 'صياغة خطاب رسمي بالذكاء الاصطناعي',
  },

  // General Actions
  addNewCompany: {
    en: 'Add New Company',
    ku: 'زیادکردنی کۆمپانیای نوێ',
    ar: 'إضافة شركة جديدة',
  },
  addNewProject: {
    en: 'Add New Project',
    ku: 'زیادکردنی پرۆژەی نوێ',
    ar: 'إضافة مشروع جديد',
  },
  createPurchaseOrder: {
    en: 'New Purchase Requisition',
    ku: 'داواکاری کڕینی نوێ',
    ar: 'طلب شراء جديد',
  },
  searchPlaceholder: {
    en: 'Search holding records, POs, workers, machines, letters...',
    ku: 'گەڕان لەناو هەموو کۆمپانیاکان، پسوولە، کرێکار، ئامێر، نووسراوەکان...',
    ar: 'بحث في سجلات المجموعة، الفواتير، العمال، الآليات، المراسلات...',
  },
  save: {
    en: 'Save Changes',
    ku: 'پاشەکەوتکردن',
    ar: 'حفظ التغييرات',
  },
  cancel: {
    en: 'Cancel',
    ku: 'پاشگەزبوونەوە',
    ar: 'إلغاء',
  },
  close: {
    en: 'Close',
    ku: 'داخستن',
    ar: 'إغلاق',
  },
  totalBudget: {
    en: 'Total Holding Budget',
    ku: 'کۆی گشتی بودجەی هۆلدینگ',
    ar: 'إجمالي ميزانية المجموعة',
  },
  totalSpent: {
    en: 'Total Expenditure',
    ku: 'کۆی خەرجییەکان',
    ar: 'إجمالي المصروفات',
  },
  totalStaff: {
    en: 'Total Workforce',
    ku: 'کۆی کارمەندان و کرێکاران',
    ar: 'إجمالي الكادر والعمال',
  },
  customizeDashboard: {
    en: 'Customize Dashboard',
    ku: 'ڕێکخستنی داشبۆرد',
    ar: 'تخصيص لوحة القيادة',
  },
  executiveFocus: {
    en: 'Executive Focus',
    ku: 'سەرنجی سەرەکی',
    ar: 'التركيز التنفيذي',
  },
  presetAll: {
    en: 'Comprehensive Overview',
    ku: 'دیدگای گشتگیر',
    ar: 'نظرة عامة شاملة',
  },
  presetFinance: {
    en: 'Financial & Cashflow Focus',
    ku: 'سەرنجی دارایی و نەختینە',
    ar: 'تركيز المالية والسيولة',
  },
  presetProjects: {
    en: 'Projects & Delivery Radar',
    ku: 'پڕۆژەکان و کاتی جێبەجێکردن',
    ar: 'المشاريع وجداول التسليم',
  },
  presetRisk: {
    en: 'Risk, Safety & Compliance',
    ku: 'مەترسی، سەلامەتی و یاسایی',
    ar: 'المخاطر والسلامة والامتثال',
  },
  financialSummaryTitle: {
    en: 'Holding Financial Matrix & Burn Rate',
    ku: 'ماتریکسی دارایی هۆلدینگ و ڕێژەی خەرجکردن',
    ar: 'مصفوفة مالية المجموعة ومعدل الإنفاق',
  },
  projectRadarTitle: {
    en: 'Group Projects Delivery & Milestones',
    ku: 'جێبەجێکردنی پڕۆژەکانی گرووپ و قۆناغەکان',
    ar: 'تسليم مشاريع المجموعة والمراحل',
  },
  recentActivitiesTitle: {
    en: 'Live Corporate Activity Feed',
    ku: 'جووڵە و چالاکییە ڕاستەوخۆکانی گرووپ',
    ar: 'شريط الأنشطة الحية للمجموعة',
  },
  subsidiaryMatrixTitle: {
    en: 'Subsidiaries Performance & Efficiency',
    ku: 'کارایی و ئەدای کۆمپانیاکانی هۆلدینگ',
    ar: 'أداء وكفاءة الشركات التابعة',
  },
  expatriateRiskTitle: {
    en: 'Expatriate Residence & Iqama Compliance',
    ku: 'مۆڵەتی نشینگە و ئیقامەی کارمەندانی بیانی',
    ar: 'امتثال إقامات وتأشيرات الكوادر الأجنبية',
  },
  machineryFleetTitle: {
    en: 'Generators, Power & Heavy Fleet Telemetry',
    ku: 'مۆلیدە، وێستگەی کارەبا و ئامێرە قورسەکان',
    ar: 'المولدات، محطات الطاقة وأسطول الآليات',
  },
  kpiOverviewTitle: {
    en: 'KPI Overview: Sector Budget vs. Actual Trends',
    ku: 'پوختەی KPI: بودجە بەرامبەر خەرجی ڕاستەقینەی کەرتەکان',
    ar: 'نظرة عامة على المؤشرات: الميزانية مقابل الإنفاق الفعلي للقطاعات',
  },
  exportPdfReport: {
    en: 'Export PDF Report',
    ku: 'داگرتنی ڕاپۆرتی PDF',
    ar: 'تصدير تقرير PDF',
  },
  exportExcelReport: {
    en: 'Export Excel Report',
    ku: 'داگرتنی ڕاپۆرتی Excel',
    ar: 'تصدير تقرير إكسل',
  },
  detailedExpenseBreakdown: {
    en: 'Detailed Sector Expense Breakdown',
    ku: 'وردەکاری خەرجییەکانی کەرت',
    ar: 'تفاصيل نفقات القطاع',
  },
  // KPI Cards & Dashboard Banners
  totalProjectsKPI: {
    en: 'Total Projects',
    ku: 'کۆی گشتی پڕۆژەکان',
    ar: 'إجمالي المشاريع',
  },
  budgetUtilizationKPI: {
    en: 'Active Budget Utilization',
    ku: 'ڕێژەی سوودوەرگرتن لە بودجە',
    ar: 'نسبة استهلاك الميزانية',
  },
  thresholdWarning90: {
    en: '⚠️ 90% Threshold Alert',
    ku: '⚠️ سنووری ٩٠٪',
    ar: '⚠️ تنبيه سقف ٩٠٪',
  },
  pendingApprovalsKPI: {
    en: 'Awaiting Owner Approval',
    ku: 'چاوەڕوانی واژۆ و پەسەندکردن',
    ar: 'بانتظار موافقة المالك',
  },
  thresholdHealthKPI: {
    en: '90% Threshold Health & Risk',
    ku: 'دۆخی چاودێری سنووری ٩٠٪',
    ar: 'مراقبة سقف الميزانية ٩٠٪',
  },
  optimalHealth: {
    en: 'Optimal & Stable',
    ku: 'سەقامگیر (Optimal)',
    ar: 'مستقر ومثالي',
  },
  atRisk: {
    en: 'At Risk',
    ku: 'مەترسیدار',
    ar: 'تحت المخاطر',
  },
  spentOf: {
    en: 'Spent of',
    ku: 'خەرجکراو لە',
    ar: 'منفق من',
  },
  remainingBudget: {
    en: 'remaining',
    ku: 'ماوە',
    ar: 'متبقي',
  },
  budgetDepleted: {
    en: 'Budget depleted',
    ku: 'بودجە تەواوبووە',
    ar: 'الميزانية استنفدت',
  },
  directOwnerAuthority: {
    en: 'Holding Owner Authority',
    ku: 'دەسەڵاتی سەرۆکی هۆلدینگ',
    ar: 'صلاحية رئيس المجموعة',
  },
  approveAction: {
    en: 'Approve ➜',
    ku: 'پەسەندکردن ➜',
    ar: 'الموافقة ➜',
  },
  allProjectsUnderThreshold: {
    en: 'All projects are within approved 90% budget limits',
    ku: 'سەرجەم پڕۆژەکان لەژێر سنووری ٩٠٪ی بودجەی پەسەندکراودان',
    ar: 'كافة المشاريع ضمن السقف المعتمد ٩٠٪ للميزانية',
  },
  projectsRequiringIntervention: {
    en: 'Projects exceeding 90% threshold requiring presidential intervention',
    ku: 'پێویستی بە هۆشداری پێشوەختە و دەستوەردانی سەرۆکایەتییە',
    ar: 'مشاريع تجاوزت السقف وتتطلب تدخلاً رئاسياً عاجلاً',
  },
  subsidiaryCompanies: {
    en: 'Subsidiaries',
    ku: 'کۆمپانیای لق (Subsidiaries)',
    ar: 'شركات تابعة',
  },
  underDirectSupervision: {
    en: '100% under direct executive supervision',
    ku: '١٠٠٪ لەژێر چاودێری ڕاستەوخۆدان',
    ar: '١٠٠٪ تحت الإشراف المباشر',
  },
  revenueRunway: {
    en: 'Group Revenue Influx',
    ku: 'داهاتی گشتی گرووپ',
    ar: 'إيرادات المجموعة الكلية',
  },
  netSurplus: {
    en: 'Net Surplus',
    ku: 'زیادەی دارایی پاک',
    ar: 'الفائض المالي الصافي',
  },
  aheadOfTarget: {
    en: 'Ahead of target',
    ku: 'پێش وادەی دیاریکراو',
    ar: 'متقدم عن الخطة',
  },
  expiringIqamas: {
    en: 'Expiring Iqamas & Visas',
    ku: 'ئیقامە و ڤیزای بەسەرچوو',
    ar: 'الإقامات والتأشيرات المنتهية',
  },
  gateDeliveries: {
    en: 'Gate Deliveries Scanned',
    ku: 'بارهەڵگرەکانی دەروازە',
    ar: 'شحنات البوابة الممسوحة',
  },
  mlSentinelAlert: {
    en: 'ML Sentinel AI Anomaly Alert',
    ku: 'سیستەمی چاودێری فێربوونی ئامێر (ML Sentinel Alert)',
    ar: 'نظام الذكاء الاصطناعي لرصد الشذوذ (ML Sentinel Alert)',
  },
  mlAlertUrgentTitle: {
    en: 'Urgent Alert: AI detected potential anomalies in procurement and attendance!',
    ku: 'ئاگاداری بەپەلە: مۆدێلی ژیری دەستکرد چەندین نائاسایی مەترسیداری لە کڕین و ئامادەبوون دۆزیوەتەوە!',
    ar: 'تنبيه عاجل: رصد نموذج الذكاء الاصطناعي حالات شذوذ محتملة في المشتريات والدوام!',
  },
  mlAlertUrgentDesc: {
    en: 'Suspected split purchase orders below $50k threshold or ghost attendance detected.',
    ku: 'گومانی دابەشکردنی داواکاری کڕین (Split-PO) لەژێر سقفێ ٥٠ هەزار دۆلار، یان تۆمارکردنی ئامادەبوونی ساختە بەدی کراوە.',
    ar: 'اشتباه في تجزئة أوامر الشراء دون سقف ٥٠ ألف دولار أو تسجيل دوام وهمي.',
  },
  inspectRisks: {
    en: 'Inspect Risks',
    ku: 'پشکنینی مەترسییەکان',
    ar: 'فحص المخاطر',
  },
  localMeshNetwork: {
    en: 'Local Mesh Network',
    ku: 'تۆڕی خۆجێیی میش (Mesh Sync)',
    ar: 'شبكة المش المحلية (Mesh Sync)',
  },
  offlineMesh: {
    en: 'Offline (Mesh Active)',
    ku: 'ئۆفلاین (میش چالاکە)',
    ar: 'أوفلاين (المش فعال)',
  },
  clearAllMockData: {
    en: 'Clear All Sample/Mock Data',
    ku: 'سڕینەوەی هەموو داتای تاقیکاری',
    ar: 'مسح كافة البيانات الوهمية والتجريبية',
  },
  restoreSampleData: {
    en: 'Restore Sample Template',
    ku: 'گەڕاندنەوەی داتای نموونەیی',
    ar: 'استعادة النموذج التجريبي',
  },
  editAction: {
    en: 'Edit',
    ku: 'دەستکاری',
    ar: 'تعديل',
  },
  deleteAction: {
    en: 'Delete',
    ku: 'سڕینەوە',
    ar: 'حذف',
  },
  cancelAction: {
    en: 'Cancel',
    ku: 'پاشگەزبوونەوە',
    ar: 'إلغاء',
  },
  confirmDeleteTitle: {
    en: 'Are you sure you want to delete this?',
    ku: 'ئایا دڵنیایت لە سڕینەوە؟',
    ar: 'هل أنت متأكد من الحذف؟',
  },
  confirmDeleteSubtitle: {
    en: 'This action cannot be undone.',
    ku: 'ئەم کردارە پاشگەزبوونەوەی نییە.',
    ar: 'لا يمكن التراجع عن هذا الإجراء.',
  },
  yesDelete: {
    en: 'Yes, Delete',
    ku: 'بەڵێ، دەستبەجێ بیسڕەوە',
    ar: 'نعم، حذف نهائي',
  },
  uploadLogo: {
    en: 'Upload Holding Logo',
    ku: 'دانانی لۆگۆی هۆلدینگ',
    ar: 'تحميل شعار المجموعة القابضة',
  },
  removeLogo: {
    en: 'Remove Logo',
    ku: 'سڕینەوەی لۆگۆ',
    ar: 'إزالة الشعار',
  },
  logoPreview: {
    en: 'Logo Preview',
    ku: 'پێشبینینی لۆگۆ',
    ar: 'معاينة الشعار',
  },
  setHoldingNamePrompt: {
    en: 'Configure Holding Name ✏️',
    ku: 'دیاریکردنی ناوی هۆلدینگ ✏️',
    ar: 'تحديد اسم المجموعة القابضة ✏️',
  },
  setOwnerNamePrompt: {
    en: 'Set Owner Name ✏️',
    ku: 'ناوی خاوەن بنووسە ✏️',
    ar: 'اكتب اسم المالك ✏️',
  },
  executiveStickyNotesTitle: {
    en: 'Executive Sticky Notes',
    ku: 'تێبینی و یاداشتی سەرۆکایەتی',
    ar: 'الملاحظات السريعة للرئاسة',
  },
  autoSavedPerSession: {
    en: 'Auto-saved per session',
    ku: 'خۆکارانە لە دانیشتندا پاشەکەوت دەبێت',
    ar: 'محفوظ تلقائياً خلال الجلسة',
  },
  newNoteBtn: {
    en: 'New Note',
    ku: 'تێبینی نوێ',
    ar: 'ملاحظة جديدة',
  },
  memoMode: {
    en: 'Memo',
    ku: 'دەق',
    ar: 'نص',
  },
  checklistMode: {
    en: 'Checklist',
    ku: 'هەنگاوەکان',
    ar: 'قائمة مهام',
  },
};

export function getTranslation(key: string, lang: Language): string {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  return translations[key]?.en || key;
}
