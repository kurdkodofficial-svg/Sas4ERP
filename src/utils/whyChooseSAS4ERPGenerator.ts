import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType
} from 'docx';

export interface WhyChooseDocOptions {
  includeKurdish?: boolean;
  includeEnglish?: boolean;
  includeArabic?: boolean;
}

export interface ComparisonRow {
  featureKu: string;
  featureEn: string;
  featureAr: string;
  sas4erpKu: string;
  sas4erpEn: string;
  othersKu: string;
  othersEn: string;
}

export const COMPARISON_MATRIX: ComparisonRow[] = [
  {
    featureKu: 'پشتگیری ٣ زمانی هاوکات (کوردی، ئینگلیزی، عەرەبی)',
    featureEn: 'Native Trilingual Support (Kurdish, English, Arabic)',
    featureAr: 'دعم ثلاث لغات أصيلة متزامنة في نظام واحد',
    sas4erpKu: 'هەر بەکارهێنەرێک لە یەک کاتدا دەتوانێت بە زمانی هەڵبژێردراوی خۆی داتاکان ببینێت',
    sas4erpEn: 'Simultaneous trilingual views: each user selects their preferred language in real time',
    othersKu: 'تەنها ئینگلیزی یان عەرەبی ناتەواو؛ کوردی سۆرانی بەهیچ شێوەیەک تێیاندا نییە',
    othersEn: 'English-only or poor Arabic translation; zero support for Kurdish Sorani'
  },
  {
    featureKu: 'مۆدێلی لایسنس و تاقیکردنەوە',
    featureEn: 'Licensing & Trial Model',
    featureAr: 'نموذج التراخيص وفترة التجربة',
    sas4erpKu: 'فرۆشتنی بەکارهێنان بەبێ کرینی سیستەم، ١٤ ڕۆژ تاقیکردنەوەی بێبەرامبەر و قفڵی ئامێر',
    sas4erpEn: 'Managed usage service model, 14-day zero-risk trial & hardware lock',
    othersKu: 'داواکردنی دەستپێکی زەبەلاح ($50,000 - $200,000) لەگەڵ سزای بەکارهێنەر',
    othersEn: 'Massive upfront capex ($50k - $200k+), expensive per-seat licenses'
  },
  {
    featureKu: 'دروستبوونی خۆکارانەی بەشەکانی کۆمپانیا و پڕۆژە',
    featureEn: 'Instant Auto-Provisioning of Departments & Camps',
    featureAr: 'التوليد التلقائي لـ ٩ أقسام وبنية تحتية للمشاريع',
    sas4erpKu: 'خۆکارانە ٩ بەشی سەرەکی و کەمپی نیشتەجێبوون و پڕۆفایلی GM لەسەر خاڵی سفڕ دروست دەبێت',
    sas4erpEn: 'Instant auto-provisioning of 9 departments, worker camps & GM profiles',
    othersKu: 'پێویستی بە چەندین مانگ کارکردنی کۆمپانیای ڕاوێژکاری و پارەی زۆر هەیە',
    othersEn: 'Requires months of manual setup and costly external consultants'
  },
  {
    featureKu: 'هاوردەکردنی بەڵگەنامە بە Drag & Drop',
    featureEn: 'Universal Drag & Drop Document Hub (Zero-Retyping)',
    featureAr: 'استيراد المستندات بالسحب والإفلات دون إعادة كتابة',
    sas4erpKu: 'هەر بەشێک سەکۆی فڕێدانی هەیە بۆ Excel, PDF, Word و وێنەکان بەبێ دووبارە نووسینەوە',
    sas4erpEn: 'Direct drop-zone in every department: instant ingestion of Excel, PDF, Word, & scans',
    othersKu: 'دەبێت کارمەند بە دەست داتاکان بنووسێتەوە یان بە کۆدی ئاڵۆزی CSV دایبنێت',
    othersEn: 'Painful manual retyping or rigid developer-level database import maps'
  },
  {
    featureKu: 'کارکردن لە دۆخی بێ ئینتەرنێت لە مەیداندا',
    featureEn: 'Offline-First PWA & Remote Field Mesh',
    featureAr: 'العمل دون إنترنت في المواقع النائية (Offline PWA)',
    sas4erpKu: 'لە کێڵگە نەوتی و پڕۆژە دوورەدەستەکان ١٠٠٪ کار دەکات و بە هاتنەوەی هێڵ سینک دەبێتەوە',
    sas4erpEn: '100% operational in desert/pipeline sites during blackouts; auto-syncs on reconnect',
    othersKu: 'سیستەم دەوەستێت و ڕادەگیرێت گەر ئینتەرنێت نەبێت',
    othersEn: 'Entire enterprise application grinds to a halt without cloud connectivity'
  },
  {
    featureKu: 'پاسەوانی ژیری دەستکرد بۆ ڕێگری لە فێڵکردن',
    featureEn: 'AI Anomaly Sentinel (Fraud Prevention)',
    featureAr: 'رادار الذكاء الاصطناعي لكشف الاحتيال وتجزئة المشتريات',
    sas4erpKu: 'کەشفکردنی پارچەکردنی کڕین (Split POs)، تۆماری شەوانە، و کرێکاری وەهمی',
    sas4erpEn: 'Autonomous machine learning catches split purchase orders, midnight vouchers & ghost labor',
    othersKu: 'سیستەمی بێدەنگ کە هیچ فێڵ و دزییەک پێشوەختە ئاشکرا ناکات',
    othersEn: 'Passive accounting databases with zero proactive fraud detection'
  },
  {
    featureKu: 'واژۆ و مۆری دیجیتاڵی خاوەن هۆڵدینگ',
    featureEn: 'Presidential Stylus E-Signature & Seal',
    featureAr: 'استوديو التوقيع والختم الرئاسي الرقمي',
    sas4erpKu: 'کێشانی واژۆی دەستی لەسەر شاشە و پەسەندکردنی خێرای داواکارییە گەورەکان بەبێ کاغەز',
    sas4erpEn: 'In-app executive digital signature studio & official seal stamping',
    othersKu: 'پێویستی بە پرینتی کاغەز یان کڕینی بەشداریکردنی DocuSignی دەرەکی هەیە',
    othersEn: 'Requires physical paper printouts or expensive external 3rd-party signature add-ons'
  },
  {
    featureKu: 'سکێنەری کامێرا لە دەروازە بۆ بارکۆد',
    featureEn: 'Live Optical Camera Gate Scanner',
    featureAr: 'ماسح البوابات البصري بكاميرا الهاتف',
    sas4erpKu: 'پاسەوان بە مۆبایلەکەی بارکۆدی پسوولە دەپشکنێت و ڕاستەوخۆ دەبەسترێت بە کۆگا',
    sas4erpEn: 'Checkpoint guards use smartphone cameras to scan waybill barcodes into warehouse inventory',
    othersKu: 'پێویستی بە کڕینی ئامێری گرانبەهای سکانەری دستی یان تۆماری کاغەزی هەیە',
    othersEn: 'Demands expensive dedicated hardware scanners or slow paper gate books'
  },
  {
    featureKu: 'ئاگاداری بەسەرچوونی ئیقامەی بیانیان',
    featureEn: 'Foreign Labor Visa/Iqama 30-Day Alert',
    featureAr: 'إنذار مبكر لانتهاء إقامات العمالة الأجنبية قبل ٣٠ يوماً',
    sas4erpKu: 'ئاگاداری سوور ٣٠ ڕۆژ پێش بەسەرچوونی ئیقامە بۆ ڕێگری لە سزای دەوڵەت',
    sas4erpEn: 'Automated 30-day pre-expiry alerts for expat work permits and visas',
    othersKu: 'تایبەتمەندی بەدواداچوونی ئیقامەی بیانیانی تێدا نییە',
    othersEn: 'No localized residency regulation workflows; leads to sudden penalties'
  },
  {
    featureKu: 'گۆڕەری دوولایەنەی دۆکیومێنت Word ⇄ PDF',
    featureEn: 'Integrated Two-Way Word ⇄ PDF Converter',
    featureAr: 'محوّل مستندات مزدوج Word ⇄ PDF داخل المنظومة',
    sas4erpKu: 'گۆڕینی خێرای وۆرد بۆ پی دی ئێف و بە پێچەوانەش لەناو خودی سیستەمدا',
    sas4erpEn: 'Bi-directional document conversion between Word (.docx) and PDF built right in',
    othersKu: 'پێویست بە کڕینی بەرنامەی جیاوازی وەک Adobe Acrobat هەیە',
    othersEn: 'Requires separate external subscriptions like Adobe Acrobat Pro'
  },
  {
    featureKu: 'دەستکاریکردنی تێبینی چەسپاو، پەسەندکردن و ژمارەکانی بودجە',
    featureEn: 'Dynamic Live Sticky Notes, Pending Approvals & Budget Values',
    featureAr: 'تعديل الملاحظات اللاصقة والموافقات المعلقة وأرقام الميزانيات فورياً',
    sas4erpKu: 'دەستکاریکردنی ڕاستەوخۆی تێبینییە چەسپاوەکان، پەسەندکردنەکان و هەموو ژمارەکانی بودجە بەپێی ڕۆڵی بەکارهێنەر',
    sas4erpEn: 'Direct in-place dynamic editing of executive notes, pending POs, and live financial budget numbers',
    othersKu: 'ژمارەکان بەستوو و نەگۆڕن؛ پێویستی بە دروستکردنی فۆڕمی ئاڵۆز یان کۆدکردنی بەرنامەساز هەیە',
    othersEn: 'Rigid static values; requires complex engineering requests or code refactoring to adjust figures'
  }
];

export const WHY_CHOOSE_POINTS = [
  {
    id: 1,
    titleKu: '١. مۆدێلی فرۆشتنی خزمەتگوزاری و بەکارهێنان نەک فرۆشتنی سیستەم (SaaS Utility Model)',
    descKu: 'ئێمە سیستەم نافرۆشین، بەڵکو تەنها مافی بەکارهێنان پێشکەش دەکەین. خاوەنی هۆڵدینگ دەتوانێت بەخۆڕایی بیدات بە هەر کۆمپانیایەکی ژێر دەستی، لەگەڵ ماوەی تاقیکردنەوەی ١٤ ڕۆژی بێبەرامبەر و قفڵی پارێزراوی ئامێر (Hardware Lock).',
    titleEn: '1. Service & Usage Model Instead of Selling the Software',
    descEn: 'We deliver software as a managed utility service rather than a one-time software license sale. The Holding Owner has full discretion to grant usage rights across any corporate subsidiary with a 14-day zero-risk trial and hardware-bound encryption.',
    titleAr: '١. نموذج تقديم خدمة الاستخدام وليس بيع النظام',
    descAr: 'نحن لا نبيع النظام كبرمجية مغلقة، بل نقدم رخصة خدمة استخدام متكاملة. يملك رئيس المجموعة كامل الصلاحية لمنح الاستخدام لأي شركة تابعة مجاناً، مع فترة تجربة مجانية لمدة ١٤ يوماً وقفل العتاد المشفر.'
  },
  {
    id: 2,
    titleKu: '٢. بەکارهێنانی ٣ زمانی هاوکات لە یەک سیستەمدا بەپێی ویستی هەر بەکارهێنەرێک (Native Trilingual Simultaneous Ingestion)',
    descKu: 'گەورەترین خاڵی جیاکەرەوە: خاوەن هۆڵدینگ دەتوانێت هەموو شتێک بە کوردی ببینێت، بەڕێوەبەر و ئەندازیارە بیانییەکان لە هەمان کاتدا بە ئینگلیزی کار بکەن، و لقی کۆمپانیاکانی عێراق یان بەڵێندەرە عەرەبەکان بە زمانی عەرەبی سەیری دۆکیومێنتەکان بکەن، بەبێ پێویستی بە وەرگێڕان یان بەرنامەی تر!',
    titleEn: '2. Native Trilingual Simultaneous Operation inside a Single System',
    descEn: 'A decisive strategic capability: the Holding Owner operates in Kurdish, expatriate engineers interact simultaneously in English, and regional Arabic partners review invoices in Arabic—all referencing the identical real-time ledger without requiring separate software instances.',
    titleAr: '٢. تشغيل ثلاث لغات متزامنة في نظام واحد حسب اختيار كل مستخدم',
    descAr: 'أقوى ميزة استراتيجية: يمكن لمالك الهولدينغ مراجعة التقارير بالكردية، بينما يعمل المهندسون الأجانب بالإنجليزية، والشركاء والمقاولون بالعربية على نفس السجلات الموحدة في نفس اللحظة.'
  },
  {
    id: 3,
    titleKu: '٣. دروستبوونی خۆکارانەی ٩ بەشە سەرەکییەکە و کەمپی نیشتەجێبوون بۆ هەر کۆمپانیا و پڕۆژەیەک (Automated Entity Provisioning)',
    descKu: 'لەگەڵ تۆمارکردنی ناوی هەر کۆمپانیا یان پڕۆژەیەک، سیستەمەکە دەستبەجێ بە شێوەیەکی خۆکارانە ٩ بەشی کارگێڕی و مەیدانی (ئەندازیاری، دارایی، کڕین، HSE، سەرچاوە مرۆییەکان و ئیقامە، کۆنتڕۆڵی کوالێتی QC، یاسایی، کۆگا، و ئۆپەراسیۆن) لەگەڵ کەمپی نیشتەجێبوونی بیانیەکان و پڕۆفایلی بەڕێوەبەری گشتی بۆ دادەمەزرێنێت بێ ماندووبوون.',
    titleEn: '3. Instant Automated Provisioning of 9 Departments & Infrastructure for Every Company/Project',
    descEn: 'Adding any corporate entity or field project instantly provisions 9 specialized functional departments (Engineering, Finance, Procurement, HSE, HR/Labor, QA/QC, Legal, Warehouse, Operations) alongside accommodation camps and GM executive profiles connected to holding HQ.',
    titleAr: '٣. التوليد التلقائي لـ ٩ أقسام وبنية تحتية كاملة لأي شركة أو مشروع جديد',
    descAr: 'بمجرد تسجيل اسم أي شركة أو مشروع في المنظومة، يتم فورياً وبصورة آلية إنشاء ٩ أقسام تخصصية كاملة، وسكن عمال متكامل، وملف المدير العام مع ربط المعاملات بمقر الهولدينغ دون الحاجة للبناء اليدوي.'
  },
  {
    id: 4,
    titleKu: '٤. هاوردەکردنی بەڵگەنامە و داتاکان بە Drag & Drop بۆ هەموو بەشەکان (Zero-Retyping Data Onboarding)',
    descKu: 'پێویست ناکات کاتێکی زۆر بەفیڕۆ بدەن بە دووبارە نووسینەوەی داتاکان؛ هەر بەشێک لە پڕۆژە و کۆمپانیاکان خاوەنی سەکۆی تایبەتی Drag & Dropـە کە دەتوانرێت فایلەکانی Excel، PDF، Word، و وێنە و نەخشەکان ڕاستەوخۆ فڕێبدرێنە ناو بەشەکە و بخرێنە ناو ئەرشیفی پارێزراوی کارەکانیان.',
    titleEn: '4. Universal Drag & Drop Document & Data Import Hub (Zero-Retyping Onboarding)',
    descEn: 'Eliminates hundreds of hours of redundant manual typing: every department in every company and project includes a native Drag & Drop document repository allowing instant ingestion of Excel spreadsheets, PDFs, Word contracts, and blueprints.',
    titleAr: '٤. استيراد المستندات والبيانات بالسحب والإفلات (Drag & Drop) دون إعادة كتابة',
    descAr: 'يوفر مئات الساعات المهدورة في إعادة إدخال البيانات يدوياً؛ حيث يمتلك كل قسم في أي شركة أو مشروع نافذة سحب وإفلات لرفع ملفات Excel و PDF و Word ومخططات العمل فورياً وأرشفتها بأمان.'
  },
  {
    id: 5,
    titleKu: '٥. ڕاداری ژیری دەستکرد بۆ ڕێگری لە فێڵ و دزینی بودجە (AI Anomaly Sentinel)',
    descKu: 'سیستەمی ML بەردەوام بە شێوەی ئۆتۆماتیکی داتاکان دەپشکنێت: ئاشکراکردنی فێڵی پارچەکردنی داواکاری کڕین (Split POs)، تۆمارکردنی پسوولەی دارایی لە کاتژمێر ٢ی شەو، و ڕێگری لە کرێکاری وەهمی لە لیستی مووچەدا.',
    titleEn: '5. AI Anomaly Sentinel & Algorithmic Fraud Prevention',
    descEn: 'Real-time machine learning monitors financial and field ledger entries: detecting split purchase orders engineered to bypass approval caps, off-hours midnight postings, and phantom workforce payroll duplicates.',
    titleAr: '٥. رادار الذكاء الاصطناعي لمنع الاحتيال وهدر الميزانيات',
    descAr: 'نظام تعلّم آلي يراقب المعاملات الميدانية والمالية على مدار الساعة: كشف تجزئة أوامر الشراء لتفادي صلاحيات المالك، رصد القيود المحاسبية في أوقات غير اعتيادية، ومنع العمالة الوهمية.'
  },
  {
    id: 6,
    titleKu: '٦. واژۆی سەرۆکایەتی و مۆری فەرمی دیجیتاڵی (Presidential E-Signature & Seal)',
    descKu: 'خاوەنی هۆڵدینگ لە مۆبایل یان تابلێتەکەیەوە واژۆی دەستی و مۆری هۆڵدینگ پاشەکەوت دەکات، و بە یەک پەنجە مۆر و واژۆی دەخاتە سەر هەر کڕینێکی گەورە یان دۆکیومێنتێکی فەرمی بەبێ پێویستی بە کاغەز.',
    titleEn: '6. Presidential Digital E-Signature & Official Holding Seal',
    descEn: 'The Holding Owner captures handwritten stylus signatures and official corporate stamps directly in-app, authorizing multi-million purchase orders and executive dossiers with cryptographic verification.',
    titleAr: '٦. استوديو التوقيع والختم الرئاسي الرقمي',
    descAr: 'يتيح لمالك الهولدينغ رسم توقيعه اليدوي وحفظ الختم الرسمي للمجموعة، وتطبيق الاعتماد الرقمي على صفقات الشراء الكبرى والتقارير التنفيذية بضغطة زر واحدة دون ورق.'
  },
  {
    id: 7,
    titleKu: '٧. سکێنەری کامێرا لە دەروازە و بەستنەوەی ڕاستەوخۆ بە کۆگاکان (Live Gate Optical Scanner)',
    descKu: 'پاسەوانی پڕۆژە لە مەیداندا بە کامێرای مۆبایلەکەی بارکۆدی پسوولەی بارهەڵگر دەپشکنێت؛ بە پەسەندکردنی بارەکە، دەستبەجێ کەرەستەکان دەخرێنە سەر باڵانسی کۆگا و پێویست بە تۆماری دەستی ناکات.',
    titleEn: '7. Live Gate Optical Camera Scanner & Instant Warehouse Sync',
    descEn: 'Security checkpoint staff scan delivery waybills using any smartphone camera, cross-validating purchase order approvals in real time and automatically updating warehouse inventory.',
    titleAr: '٧. ماسح البوابات البصري والربط الفوري مع المستودعات',
    descAr: 'يقوم حراس بوابات المشاريع بمسح باركود شاحنات التوريد بكاميرا الهاتف؛ وعند التحقق، يتم إدخال المواد إلى رصيد المخزن فورياً دون أي تأخير ورقي.'
  },
  {
    id: 8,
    titleKu: '٨. کارکردنی تەواو لە دۆخی بێ ئینتەرنێت لە پڕۆژە دوورەدەستەکان (Offline-First PWA)',
    descKu: 'لە کێڵگە نەوتییەکان و پڕۆژە شاخاوییەکان کە هێڵی ئینتەرنێت دەپچڕێت، سیستەمەکە بە تەواوی کار دەکات؛ کرێکاران و ئەندازیاران داتاکان دەنووسن و لەگەڵ گەڕانەوەی هێڵ هەمووی خۆکار لەگەڵ هۆڵدینگ سینک دەبێتەوە.',
    titleEn: '8. True Offline-First PWA & Local Mesh Field Operation',
    descEn: 'Engineered with Service Worker and local database caching. Remote pipeline and desert construction sites continue full operations during network blackouts, syncing cleanly upon reconnection.',
    titleAr: '٨. التشغيل الكامل دون إنترنت في المشاريع الميدانية (Offline PWA)',
    descAr: 'يعمل النظام بكفاءة كاملة في المواقع النائية والمنقطعة عبر تقنية Service Worker، مع مزامنة سحابية تلقائية لكافة العمليات فور عودة الاتصال.'
  },
  {
    id: 9,
    titleKu: '٩. مصفوفەی وردی دەسەڵاتی کارمەندان بە ١٩ بەش (Granular 19-Module RBAC Matrix)',
    descKu: 'دابەشکردنی دەسەڵات بەسەر ٤ ئاستی سەرەکی (خاوەن هۆڵدینگ، GM، بەڕێوەبەری پڕۆژە، کارمەند) بە توانای زیادکردن و بڕینی هەر بەشێک لە لایەن خاوەن هۆڵدینگ بە چێک بۆکس.',
    titleEn: '9. Granular 19-Module Role-Based Access Control (RBAC)',
    descEn: 'Four calibrated enterprise personas (Holding Owner, General Manager, Project Manager, Employee) with a granular 19-module visibility matrix configurable exclusively by the holding owner.',
    titleAr: '٩. مصفوفة الصلاحيات الميدانية الدقيقة لـ ١٩ قسماً (RBAC Matrix)',
    descAr: 'توزيع الصلاحيات على ٤ مستويات قيادية مع تحكم دقيق في ظهور أو إخفاء أي من أقسام المنظومة الـ ١٩ بمرونة مطلقة لمالك المجموعة.'
  },
  {
    id: 10,
    titleKu: '١٠. چاودێری و ئاگاداری پێشوەختەی ئیقامەی کرێکارانی بیانی (Foreign Labor 30-Day Alert)',
    descKu: 'سیستەم ٣٠ ڕۆژ پێش بەسەرچوونی ئیقامە و ڤیزای ئەندازیار و کرێکارانی بیانی ئاگاداری سوور دەدات، تا لە سزای دارایی قورسی حکومی و وەستاندنی کار ڕزگارتان بێت.',
    titleEn: '10. Automated 30-Day Expat Residency & Visa Expiration Safeguard',
    descEn: 'Automated advance notification engine flags foreign labor visas and residency (Iqama) papers 30 days before statutory expiration, preventing severe regulatory fines.',
    titleAr: '١٠. إنذار مبكر لانتهاء إقامات العمالة الأجنبية قبل ٣٠ يوماً',
    descAr: 'نظام تنبيهات استباقي يراقب صلاحية إقامات وجوازات العمال والمهندسين الأجانب وينبه الإدارة قبل ٣٠ يوماً لتفادي الغرامات الحكومية وتعطل العمل.'
  },
  {
    id: 11,
    titleKu: '١١. ژێرخانی مەیدانی: کەمپ، مۆلیدەکان، تاقیگەی کۆنکرێت و ئامێری قورس',
    descKu: 'بەڕێوەبردنی تەواوی کەمپی مانەوەی کرێکاران، چاودێری سووتەمەنی مۆلیدەکان، ئەنجامی پشکنینی تاقیگەی شکاندنی کۆنکرێت (٧ و ٢٨ ڕۆژ)، و چاکسازی ئامێرە قورسەکان.',
    titleEn: '11. Complete Field Infrastructure: Camps, Generators, Heavy Fleet & QC Labs',
    descEn: 'Dedicated modules manage worker camp dorms, generator telemetry, compressive concrete cylinder slump/break lab tests, and heavy equipment preventive maintenance.',
    titleAr: '١١. إدارة البنية التحتية الميدانية: السكن، المولدات، والمختبرات',
    descAr: 'إدارة متكاملة لمجمعات سكن العمال، مراقبة وقود المولدات، نتائج فحص كسر الخرسانة المخبرية، وجداول صيانة الآليات الثقيلة.'
  },
  {
    id: 12,
    titleKu: '١٢. فاکتوورەی نێوان کۆمپانیاکان (Intercompany Invoicing & Settlements)',
    descKu: 'چارەسەرکردنی گەورەترین کێشەی هۆڵدینگەکان کاتێک کۆمپانیایەکی هۆڵدینگ کەرەستە یان ئامێر دەدات بە کۆمپانیایەکی تر، بە فاکتوورەی ڕەسمی ناوخۆیی بەبێ ناکۆکی دارایی.',
    titleEn: '12. Bilateral Intercompany Invoicing & Internal Clearing',
    descEn: 'Eliminates cross-entity reconciliation headaches: automates internal invoicing and equipment transfer billing between sister subsidiaries within the holding umbrella.',
    titleAr: '١٢. الفواتير التبادلية بين الشركات الشقيقة (Intercompany Billing)',
    descAr: 'معالجة أكبر معضلات المجموعات القابضة عند تبادل المواد والآليات بين الشركات التابعة، عبر قيود وفواتير تبادلية موحدة تمنع الخلافات المحاسبية.'
  },
  {
    id: 13,
    titleKu: '١٣. ستۆدیۆی گۆڕەری دوولایەنەی دۆکیومێنت: وۆرد ⇄ پی دی ئێف (Word ⇄ PDF Studio)',
    descKu: 'توانای گۆڕینی خێرای هەر فایلێکی وۆرد بۆ پی دی ئێف و بە پێچەوانەشەوە، لەگەڵ هەناردەکردنی دەستبەجێی ڕێبەر و دۆکیومێنتەکان بە فۆرماتی Word (.docx) و PDF بە ٣ زمان.',
    titleEn: '13. Integrated Two-Way Document Converter Studio (Word ⇄ PDF)',
    descEn: 'Embedded document engineering tools convert Word (.docx) to PDF and PDF to editable Word files directly in-browser with complete RTL Arabic/Kurdish typographic fidelity.',
    titleAr: '١٣. استوديو تحويل المستندات المزدوج (Word ⇄ PDF)',
    descAr: 'أداة متطورة للتحويل الفوري بين ملفات مايكروسوفت وورد وملفات أدوبي PDF مع الحفاظ على التنسيق واللغات الثلاث.'
  },
  {
    id: 14,
    titleKu: '١٤. پاراستنی باڵا و تەواوی داتاکان لەژێر کۆنتڕۆڵی خۆت (Data Sovereignty)',
    descKu: 'هیچ داتایەکی دارایی یان نەهێنی کۆمپانیاکانتان نافرۆشرێت و ناچێتە دەرەوە؛ داتاکان لەناو کۆگای پارێزراوی خۆتان دەمێنێتەوە بە کۆدکردنی توندوتۆڵ.',
    titleEn: '14. Complete Data Sovereignty & Enterprise Cryptographic Security',
    descEn: 'Your corporate ledgers and strategic contracts never leave your custody. Zero data brokering, enterprise cryptographic standards, and strict local tenancy.',
    titleAr: '١٤. السيادة الكاملة على البيانات وأعلى معايير الأمان المشفر',
    descAr: 'جميع بيانات المجموعة المالية وعقود المشاريع تبقى تحت السيطرة الحصرية لمالك الهولدينغ، دون أي مشاركة خارجية مع تشفير سيادي متكامل.'
  },
  {
    id: 15,
    titleKu: '١٥. دەستکاریکردنی تێبینییە چەسپاوەکان، پەسەندکردنە هەڵپەسێردراوەکان، و گۆڕینی ژمارەی بودجە و داتاکان',
    descKu: 'بەکارهێنەرانی سیستەم و بەتایبەت خاوەن هۆڵدینگ دەتوانن بە شێوازی ڕاستەوخۆ دەستکاری تێبینییە چەسپاوەکان (Executive Sticky Notes)، داواکارییە چاوەڕوانکراوەکان (Pending Approvals) و گۆڕینی ژمارەکانی بودجە و هەر ژمارەیەکی ناو سیستەم بکەن بەبێ هیچ بەربەست یان کێشەیەکی تەکنیکی.',
    titleEn: '15. Dynamic Live Editing for Executive Sticky Notes, Pending Approvals & Live Budgets',
    descEn: 'Authorized executives and managers enjoy instant in-place capabilities to modify executive sticky notes, process pending approvals, and adjust financial budget allocations and operational figures on the fly.',
    titleAr: '١٥. التعديل المباشر للملاحظات اللاصقة القيادية، المعاملات المعلقة، وتحديث أرقام الميزانيات',
    descAr: 'مرونة تشغيلية تامة تمنح المستخدمين ورئيس المجموعة صلاحية تحرير الملاحظات اللاصقة، البت في المعاملات المعلقة، وتعديل أرقام الميزانيات وأي رقم بالمنظومة بشكل فوري ومباشر.'
  }
];

/**
 * Generates Microsoft Word document (.docx) for "Why Choose SAS4ERP" with Comparison Table
 */
export async function generateWhyChooseSAS4ERPDocx(options: WhyChooseDocOptions = {}): Promise<Blob> {
  const includeKu = options.includeKurdish !== false;
  const includeEn = options.includeEnglish !== false;
  const includeAr = options.includeArabic !== false;

  const children: (Paragraph | Table)[] = [];

  // Title Dossier
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120, before: 200 },
      children: [
        new TextRun({
          text: 'بۆچی ئەم سیستەمە بەکاربێنم؟ (خاڵە جیاکەرەوەکانی SAS4ERP)',
          bold: true,
          size: 34,
          color: '1E3A8A'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 150 },
      children: [
        new TextRun({
          text: 'Why Choose SAS4ERP? — Strategic Differentiators & Comparative Matrix',
          bold: true,
          size: 24,
          color: '2563EB'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [
        new TextRun({
          text: 'لماذا استخدام منظومة SAS4ERP؟ — جدول المقارنة الاستراتيجي والمزايا التنافسية الحصرية',
          bold: true,
          size: 22,
          color: '0F172A'
        })
      ]
    }),

    // Enterprise metadata
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'بەڵگەنامە / Document: ', bold: true }),
                    new TextRun({ text: 'Comparative Enterprise Advantage & Architecture Dossier' })
                  ]
                })
              ]
            }),
            new TableCell({
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'وەشان / Edition: ', bold: true }),
                    new TextRun({ text: 'SAS4ERP Industrial v5.0 (November 2026)' })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { after: 240 } })
  );

  // COMPARATIVE TABLE (Word docx table)
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: 'خشتەی بەراوردی سیستەمی SAS4ERP لەگەڵ سیستەمەکانی تر (SAP, Oracle, Odoo)',
          bold: true,
          size: 26,
          color: '1E3A8A'
        })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: 'تایبەتمەندی / Feature', bold: true, color: 'FFFFFF' })] })]
            }),
            new TableCell({
              shading: { fill: '2563EB', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: 'SAS4ERP Holding System', bold: true, color: 'FFFFFF' })] })]
            }),
            new TableCell({
              shading: { fill: '64748B', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: 'سیستەمەکانی تر (SAP / Odoo / Oracle)', bold: true, color: 'FFFFFF' })] })]
            })
          ]
        }),
        ...COMPARISON_MATRIX.map(row => (
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                children: [
                  new Paragraph({ children: [new TextRun({ text: row.featureKu, bold: true, color: '0F172A' })] }),
                  new Paragraph({ children: [new TextRun({ text: row.featureEn, italics: true, size: 18, color: '64748B' })] })
                ]
              }),
              new TableCell({
                shading: { fill: 'EFF6FF', type: ShadingType.CLEAR },
                children: [
                  new Paragraph({ children: [new TextRun({ text: `✓ ${row.sas4erpKu}`, bold: true, color: '1D4ED8' })] }),
                  new Paragraph({ children: [new TextRun({ text: row.sas4erpEn, size: 18, color: '3B82F6' })] })
                ]
              }),
              new TableCell({
                shading: { fill: 'FFFFFF', type: ShadingType.CLEAR },
                children: [
                  new Paragraph({ children: [new TextRun({ text: `✗ ${row.othersKu}`, color: '64748B' })] }),
                  new Paragraph({ children: [new TextRun({ text: row.othersEn, size: 18, color: '94A3B8' })] })
                ]
              })
            ]
          })
        ))
      ]
    }),
    new Paragraph({ spacing: { after: 300 } })
  );

  // KURDISH SECTION
  if (includeKu) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 140 },
        children: [
          new TextRun({
            text: 'بەشی کوردی: بۆچی سیستەمی SAS4ERP هەڵبژێرم؟ (١٤ خاڵی جیاکەرەوە)',
            bold: true,
            size: 26,
            color: '1E3A8A'
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: 'سیستەمی SAS4ERP سەکۆیەکی گشتگیری فەرماندەیی باڵای هۆڵدینگە کە بۆ چاودێریکردن و ئاراستەکردنی کۆمپانیا باڵکێشەکان و پڕۆژە نیشتمانییەکان دروستکراوە بە تایبەتمەندی ٣ زمانی هاوکات، ئۆتۆماتیککردنی بەشەکان، هاوردەکردنی Drag & Drop، و ڕێگری لە فێڵکردن:',
            italics: true,
            color: '475569'
          })
        ]
      })
    );

    WHY_CHOOSE_POINTS.forEach((pt) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 60 },
          children: [
            new TextRun({
              text: pt.titleKu,
              bold: true,
              size: 22,
              color: '2563EB'
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 120, line: 260 },
          children: [new TextRun({ text: pt.descKu, size: 21, color: '1E293B' })]
        })
      );
    });
  }

  // ENGLISH SECTION
  if (includeEn) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 340, after: 140 },
        children: [
          new TextRun({
            text: 'English Section: Why Choose SAS4ERP? (14 Core Differentiators)',
            bold: true,
            size: 26,
            color: '1E3A8A'
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: 'SAS4ERP is engineered specifically for multi-subsidiary industrial conglomerates and strategic national project portfolios. Below are the key differentiators that set it apart from legacy ERP systems:',
            italics: true,
            color: '475569'
          })
        ]
      })
    );

    WHY_CHOOSE_POINTS.forEach((pt) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 60 },
          children: [
            new TextRun({
              text: pt.titleEn,
              bold: true,
              size: 22,
              color: '2563EB'
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 120, line: 260 },
          children: [new TextRun({ text: pt.descEn, size: 21, color: '1E293B' })]
        })
      );
    });
  }

  // ARABIC SECTION
  if (includeAr) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 340, after: 140 },
        children: [
          new TextRun({
            text: 'القسم العربي: لماذا اختار منظومة SAS4ERP؟ (١٤ ميزة تنافسية حصرية)',
            bold: true,
            size: 26,
            color: '1E3A8A'
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: 'تعد منظومة SAS4ERP منصة استراتيجية لقيادة وإدارة المجموعات الاستثمارية والهولدينغ الصناعي الكبرى، وتتميز بحزمة من الخصائص الميدانية والرقابية الحصرية ومصفوفة المقارنة المباشرة مع الأنظمة التقليدية:',
            italics: true,
            color: '475569'
          })
        ]
      })
    );

    WHY_CHOOSE_POINTS.forEach((pt) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 60 },
          children: [
            new TextRun({
              text: pt.titleAr,
              bold: true,
              size: 22,
              color: '2563EB'
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 120, line: 260 },
          children: [new TextRun({ text: pt.descAr, size: 21, color: '1E293B' })]
        })
      );
    });
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 21, color: '1E293B' },
          paragraph: { spacing: { line: 280, after: 120 } }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children
      }
    ]
  });

  return await Packer.toBlob(doc);
}

/**
 * Opens a print-to-PDF view for "Why Choose SAS4ERP" with Comparison Matrix
 */
export function openWhyChooseSAS4ERPPdfView(options: WhyChooseDocOptions = {}) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download or print the dossier.');
    return;
  }

  const includeKu = options.includeKurdish !== false;
  const includeEn = options.includeEnglish !== false;
  const includeAr = options.includeArabic !== false;

  const comparisonTableHtml = `
    <div class="comparison-section">
      <h2 style="font-size: 16pt; color: #1e3a8a; margin-bottom: 12px;">خشتەی بەراوردی فەرمی: SAS4ERP بەرامبەر سیستەمەکانی تر (SAP, Oracle, Odoo)</h2>
      <table class="comp-table">
        <thead>
          <tr>
            <th style="width: 25%;">تایبەتمەندی / Feature</th>
            <th style="width: 45%; background: #1e40af; color: white;">SAS4ERP Holding System</th>
            <th style="width: 30%; background: #64748b; color: white;">سیستەمەکانی تر (SAP, Odoo, Oracle)</th>
          </tr>
        </thead>
        <tbody>
          ${COMPARISON_MATRIX.map(row => `
            <tr>
              <td>
                <strong>${row.featureKu}</strong>
                <div style="font-size: 9pt; color: #64748b;">${row.featureEn}</div>
              </td>
              <td style="background: #eff6ff;">
                <span style="color: #16a34a; font-weight: bold;">✓ </span>
                <strong style="color: #1e3a8a;">${row.sas4erpKu}</strong>
                <div style="font-size: 9pt; color: #2563eb; margin-top: 2px;">${row.sas4erpEn}</div>
              </td>
              <td>
                <span style="color: #dc2626; font-weight: bold;">✗ </span>
                <span>${row.othersKu}</span>
                <div style="font-size: 8.5pt; color: #94a3b8; margin-top: 2px;">${row.othersEn}</div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const kuContent = includeKu ? `
    <div class="lang-section rtl" dir="rtl">
      <div class="badge">بەشی کوردی سۆرانی</div>
      <h2>بۆچی ئەم سیستەمە بەکاربێنم؟ (١٤ خاڵی جیاکەرەوەی سەرەکی)</h2>
      <p class="intro-p">
        سیستەمی کارگێڕی SAS4ERP سەکۆیەکی فەرماندەیی باڵای هۆڵدینگە کە بۆ چاودێریکردن و ئاراستەکردنی کۆمپانیا باڵکێشەکان و پڕۆژە نیشتمانییەکان دروستکراوە بە تایبەتمەندی کارکردنی ٣ زمانی هاوکات، ئۆتۆماتیککردنی بەشەکان، هاوردەکردنی Drag & Drop، ڕێگری لە فێڵ و کارکردنی ئۆفلاین.
      </p>
      <div class="cards-grid">
        ${WHY_CHOOSE_POINTS.map(pt => `
          <div class="point-card">
            <h3>${pt.titleKu}</h3>
            <p>${pt.descKu}</p>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const enContent = includeEn ? `
    <div class="lang-section ltr" dir="ltr">
      <div class="badge">English Section</div>
      <h2>Why Choose SAS4ERP? (14 Core Differentiators)</h2>
      <p class="intro-p">
        Built specifically for multi-company holding conglomerates and strategic national infrastructure projects with simultaneous trilingual operation, automated department provisioning, drag & drop data onboarding, offline resilience and AI-powered fraud safeguards.
      </p>
      <div class="cards-grid">
        ${WHY_CHOOSE_POINTS.map(pt => `
          <div class="point-card">
            <h3>${pt.titleEn}</h3>
            <p>${pt.descEn}</p>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const arContent = includeAr ? `
    <div class="lang-section rtl" dir="rtl">
      <div class="badge">القسم العربي</div>
      <h2>لماذا اختار منظومة SAS4ERP؟ (١٤ ميزة تنافسية حصرية)</h2>
      <p class="intro-p">
        منظومة قيادية متطورة لإدارة المجموعات الاستثمارية والهولدينغ الصناعي الكبرى والمشاريع الاستراتيجية مع دعم تشغيل ثلاث لغات متزامنة، والتوليد الآلي لـ ٩ أقسام، واستيراد البيانات بالسحب والإفلات، ودعم كامل للتشغيل دون إنترنت ورادار الذكاء الاصطناعي لكشف المخاطر.
      </p>
      <div class="cards-grid">
        ${WHY_CHOOSE_POINTS.map(pt => `
          <div class="point-card">
            <h3>${pt.titleAr}</h3>
            <p>${pt.descAr}</p>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ku" dir="auto">
    <head>
      <meta charset="UTF-8">
      <title>بۆچی ئەم سیستەمە بەکاربێنم - SAS4ERP Competitive Differentiators</title>
      <style>
        @page { size: A4; margin: 18mm 15mm; }
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
        }
        .container { max-width: 920px; margin: 0 auto; }
        .no-print-bar {
          background: #1e3a8a;
          color: white;
          padding: 14px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .print-btn {
          background: #fbbf24;
          color: #0f172a;
          border: none;
          padding: 8px 18px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }
        .header-cover {
          text-align: center;
          padding: 24px;
          border-bottom: 3px double #cbd5e1;
          margin-bottom: 24px;
        }
        .header-cover h1 {
          font-size: 26px;
          color: #1e3a8a;
          margin: 0 0 8px 0;
        }
        .header-cover p {
          font-size: 14px;
          color: #475569;
          margin: 0;
        }
        .comp-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 28px;
          font-size: 10pt;
        }
        .comp-table th, .comp-table td {
          border: 1px solid #cbd5e1;
          padding: 10px 12px;
          text-align: inherit;
        }
        .comp-table th { font-weight: bold; }
        .lang-section {
          padding: 20px 0;
          border-bottom: 2px dashed #e2e8f0;
        }
        .rtl { direction: rtl; text-align: right; }
        .ltr { direction: ltr; text-align: left; }
        .badge {
          display: inline-block;
          background: #e0e7ff;
          color: #3730a3;
          font-size: 11px;
          font-weight: bold;
          padding: 4px 10px;
          border-radius: 6px;
          margin-bottom: 8px;
        }
        h2 { font-size: 18px; color: #1e3a8a; margin: 4px 0 10px; }
        .intro-p { font-size: 12.5px; color: #475569; margin-bottom: 16px; }
        .cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .point-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px 16px;
        }
        .point-card h3 {
          font-size: 13.5px;
          color: #2563eb;
          margin: 0 0 6px 0;
        }
        .point-card p {
          font-size: 12px;
          color: #334155;
          margin: 0;
          line-height: 1.55;
        }
        @media print {
          .no-print-bar { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="no-print-bar">
          <span>📄 <strong>بۆچی ئەم سیستەمە بەکاربێنم؟</strong> — خشتەی بەراورد لەگەڵ سیستەمەکانی تر</span>
          <button class="print-btn" onclick="window.print()">🖨️ پرینت یان پاشەکەوتکردن بە PDF</button>
        </div>

        <div class="header-cover">
          <h1>بۆچی ئەم سیستەمە بەکاربێنم؟ (خاڵە جیاکەرەوەکانی SAS4ERP)</h1>
          <p>Why Choose SAS4ERP Enterprise? • خشتەی بەراورد لەگەڵ SAP, Oracle, Odoo</p>
        </div>

        ${comparisonTableHtml}
        ${kuContent}
        ${enContent}
        ${arContent}
      </div>
      <script>
        window.addEventListener('load', () => {
          setTimeout(() => window.print(), 600);
        });
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
