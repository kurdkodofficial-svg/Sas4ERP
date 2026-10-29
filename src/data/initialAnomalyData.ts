import { MLAnomalyAlert, AttendanceRecord, ERPLogEntry, AnomalyEngineStats } from '../types/anomaly';

export const initialAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'ATT-2026-001',
    employeeId: 'EMP-102',
    employeeName: 'بەختیار کمال محمود (Bakhtiar K.)',
    employeeRole: 'Heavy Machinery Crane Operator',
    companyId: 'comp-1',
    companyName: 'SAS Construction Ltd',
    projectId: 'proj-1',
    projectName: 'Erbil Heights Tower A',
    date: '2026-10-18',
    checkInTime: '06:00',
    checkOutTime: '04:00 (Next Day)',
    siteLocation: 'Erbil Heights - Tower A Site Gate #2',
    deviceType: 'BIOMETRIC_THUMBPRINT',
    workHours: 22.0,
    overtimeHours: 14.0,
    status: 'EXCESSIVE_OVERTIME',
    anomalyFlag: true
  },
  {
    id: 'ATT-2026-002',
    employeeId: 'EMP-188',
    employeeName: 'ڕێبین فەریق نامیق (Rebin Fariq)',
    employeeRole: 'Senior Electrical Engineer',
    companyId: 'comp-2',
    companyName: 'SAS Energy & Power Solutions',
    projectId: 'proj-2',
    projectName: 'Sulaymaniyah Solar Farm Phase 1',
    date: '2026-10-18',
    checkInTime: '08:15',
    checkOutTime: '17:00',
    siteLocation: 'Erbil Main HQ Gate #1',
    deviceType: 'FACIAL_RECOGNITION',
    workHours: 8.75,
    overtimeHours: 0.75,
    status: 'IMPOSSIBLE_TRANSIT',
    anomalyFlag: true
  },
  {
    id: 'ATT-2026-003',
    employeeId: 'EMP-188',
    employeeName: 'ڕێبین فەریق نامیق (Rebin Fariq)',
    employeeRole: 'Senior Electrical Engineer',
    companyId: 'comp-2',
    companyName: 'SAS Energy & Power Solutions',
    projectId: 'proj-2',
    projectName: 'Sulaymaniyah Solar Farm Phase 1',
    date: '2026-10-18',
    checkInTime: '08:38', // 23 minutes after Erbil check-in!
    checkOutTime: '16:45',
    siteLocation: 'Sulaymaniyah Solar Substation Gate #4',
    deviceType: 'RFID_GATE',
    workHours: 8.0,
    overtimeHours: 0,
    status: 'IMPOSSIBLE_TRANSIT',
    anomalyFlag: true
  },
  {
    id: 'ATT-2026-004',
    employeeId: 'EMP-304',
    employeeName: 'عەلی سەڵاح مەهدی (Ali Salah)',
    employeeRole: 'Junior Warehouse Assistant',
    companyId: 'comp-3',
    companyName: 'SAS Industrial Logistics Co.',
    projectId: 'proj-3',
    projectName: 'Duhok Distribution Hub',
    date: '2026-10-17',
    checkInTime: '02:42', // Off-hours!
    checkOutTime: '03:55',
    siteLocation: 'Duhok High-Value Bonded Warehouse Vault',
    deviceType: 'BIOMETRIC_THUMBPRINT',
    workHours: 1.2,
    overtimeHours: 1.2,
    status: 'OFF_HOURS_SITE',
    anomalyFlag: true
  },
  {
    id: 'ATT-2026-005',
    employeeId: 'EMP-211',
    employeeName: 'Sara Vance',
    employeeRole: 'Procurement Specialist',
    companyId: 'comp-1',
    companyName: 'SAS Construction Ltd',
    date: '2026-10-18',
    checkInTime: '08:00',
    checkOutTime: '16:30',
    siteLocation: 'Holding HQ Suite 402',
    deviceType: 'FACIAL_RECOGNITION',
    workHours: 8.5,
    overtimeHours: 0.5,
    status: 'NORMAL',
    anomalyFlag: false
  },
  {
    id: 'ATT-2026-006',
    employeeId: 'EMP-212',
    employeeName: 'کاروان شێرزاد (Karwan Sherzad)',
    employeeRole: 'Site Civil Engineer',
    companyId: 'comp-1',
    companyName: 'SAS Construction Ltd',
    projectId: 'proj-1',
    projectName: 'Erbil Heights Tower A',
    date: '2026-10-18',
    checkInTime: '07:30',
    checkOutTime: '16:00',
    siteLocation: 'Erbil Heights - Tower A Site Gate #1',
    deviceType: 'BIOMETRIC_THUMBPRINT',
    workHours: 8.5,
    overtimeHours: 0.5,
    status: 'NORMAL',
    anomalyFlag: false
  }
];

export const initialERPLogEntries: ERPLogEntry[] = [
  {
    id: 'LOG-ML-801',
    timestamp: '2026-10-18T09:12:00Z',
    logType: 'PURCHASE_ORDER',
    category: 'PROCUREMENT',
    companyId: 'comp-1',
    companyName: 'SAS Construction Ltd',
    projectId: 'proj-1',
    projectName: 'Erbil Heights Tower A',
    actorName: 'سەرکار نوری (Sarkar Nouri)',
    actorRole: 'Procurement Officer',
    action: 'CREATE_PURCHASE_ORDER',
    amountUSD: 48900,
    expectedBaselineUSD: 16500,
    location: 'Erbil Site Office',
    targetEntity: 'Al-Rawi Cement Suppliers',
    metadata: { poNumber: 'PO-CON-9021', itemsCount: 4, splitCluster: true },
    anomalyScore: 92
  },
  {
    id: 'LOG-ML-802',
    timestamp: '2026-10-18T10:45:00Z',
    logType: 'PURCHASE_ORDER',
    category: 'PROCUREMENT',
    companyId: 'comp-1',
    companyName: 'SAS Construction Ltd',
    projectId: 'proj-1',
    projectName: 'Erbil Heights Tower A',
    actorName: 'سەرکار نوری (Sarkar Nouri)',
    actorRole: 'Procurement Officer',
    action: 'CREATE_PURCHASE_ORDER',
    amountUSD: 49200,
    expectedBaselineUSD: 16500,
    location: 'Erbil Site Office',
    targetEntity: 'Al-Rawi Cement Suppliers',
    metadata: { poNumber: 'PO-CON-9022', itemsCount: 4, splitCluster: true },
    anomalyScore: 94
  },
  {
    id: 'LOG-ML-803',
    timestamp: '2026-10-18T01:35:00Z',
    logType: 'FINANCE_LEDGER',
    category: 'FINANCIAL',
    companyId: 'comp-3',
    companyName: 'SAS Industrial Logistics Co.',
    projectId: 'proj-3',
    projectName: 'Duhok Distribution Hub',
    actorName: 'نەوزاد ڕەزا (Nawzad R.)',
    actorRole: 'Accountant',
    action: 'MANUAL_DEBIT_POSTING',
    amountUSD: 84500,
    expectedBaselineUSD: 12000,
    location: 'Off-site Remote VPN (IP: 194.26.29.14)',
    targetEntity: 'Petty Cash Clearing & Unreconciled Sundry',
    metadata: { voucherNo: 'VOUCH-2026-9904', isWeekendOffHours: true },
    anomalyScore: 89
  },
  {
    id: 'LOG-ML-804',
    timestamp: '2026-10-18T08:38:00Z',
    logType: 'ATTENDANCE_CHECKIN',
    category: 'ATTENDANCE',
    companyId: 'comp-2',
    companyName: 'SAS Energy & Power Solutions',
    projectId: 'proj-2',
    projectName: 'Sulaymaniyah Solar Farm Phase 1',
    actorName: 'ڕێبین فەریق نامیق (Rebin Fariq)',
    actorRole: 'Senior Electrical Engineer',
    action: 'BIOMETRIC_SCAN_DUPLICATION',
    location: 'Sulaymaniyah Solar Substation Gate #4',
    metadata: { previousScanLocation: 'Erbil Main HQ Gate #1', timeDeltaMinutes: 23, physicalDistanceKm: 165 },
    anomalyScore: 96
  },
  {
    id: 'LOG-ML-805',
    timestamp: '2026-10-17T15:20:00Z',
    logType: 'PURCHASE_ORDER',
    category: 'PROCUREMENT',
    companyId: 'comp-2',
    companyName: 'SAS Energy & Power Solutions',
    projectId: 'proj-2',
    projectName: 'Sulaymaniyah Solar Farm Phase 1',
    actorName: 'David H. Miller',
    actorRole: 'Supply Officer',
    action: 'UNIT_PRICE_VARIANCE_SPIKE',
    amountUSD: 62400,
    expectedBaselineUSD: 19500,
    targetEntity: 'Apex Inverter Technologies',
    metadata: { itemCode: 'INV-500KVA', historicalAvgPrice: 3200, proposedUnitPrice: 10400, inflationPercent: 325 },
    anomalyScore: 86
  },
  {
    id: 'LOG-ML-806',
    timestamp: '2026-10-18T06:00:00Z',
    logType: 'ATTENDANCE_CHECKIN',
    category: 'ATTENDANCE',
    companyId: 'comp-1',
    companyName: 'SAS Construction Ltd',
    projectId: 'proj-1',
    projectName: 'Erbil Heights Tower A',
    actorName: 'بەختیار کمال محمود (Bakhtiar K.)',
    actorRole: 'Heavy Machinery Crane Operator',
    action: 'CONTINUOUS_WORK_WITHOUT_REST',
    metadata: { totalHoursWorked: 22, consecutiveDays: 4, hseRestBreach: true },
    anomalyScore: 88
  }
];

export const initialMLAnomalyAlerts: MLAnomalyAlert[] = [
  {
    id: 'ALT-ML-2026-001',
    title: 'Smurfing & PO Splitting Scheme Detected to Evade Holding Owner Approval',
    titleKu: 'دۆزینەوەی گومانی دابەشکردنی کڕین (Split-PO) بۆ خۆدزینەوە لە واژۆی خاوەنی هۆلدینگ',
    titleAr: 'كشف نمط تجزئة أوامر الشراء لتفادي صلاحية موافقة رئيس المجموعة ($50k)',
    category: 'PROCUREMENT',
    severity: 'CRITICAL',
    status: 'TRIGGERED',
    score: 94,
    confidence: 0.96,
    algorithmUsed: 'Sequential Graph Cluster + Isolation Forest',
    detectedAt: '2026-10-18T10:48:22Z',
    companyId: 'comp-1',
    companyName: 'SAS Construction Ltd',
    projectId: 'proj-1',
    projectName: 'Erbil Heights Tower A',
    triggerLogId: 'LOG-ML-802',
    relatedEntityId: 'PO-CON-9022',
    relatedEntityType: 'PURCHASE_ORDER',
    description: 'Two consecutive purchase orders ($48,900 and $49,200) were created within 93 minutes for the same vendor (Al-Rawi Cement Suppliers) targeting the same project. Both sit just below the mandatory $50,000 Holding Owner approval ceiling, combining to $98,100.',
    descriptionKu: 'دوو داواکاری کڕینی یەک لەدوای یەک (بە بڕی ٤٨,٩٠٠$ و ٤٩,٢٠٠$) لە ماوەی ٩٣ خولەکدا بۆ هەمان دابینکەر تۆمارکراون کە هەردووکیان ڕێک کەمترن لە سنووری ٥٠,٠٠٠ دۆلاری دەسەڵاتی خاوەن هۆلدینگ بە کۆی ٩٨,١٠٠ دۆلار.',
    descriptionAr: 'تم رصد إصدار أمري شراء متتاليين بقيمة 48,900$ و 49,200$ لنفس المورد خلال 93 دقيقة تحت سقف صلاحية المالك الإلزامية ($50,000) بإجمالي 98,100$.',
    rootCauseHypothesis: 'Intentional split-structuring by site procurement officers to bypass Board of Directors / Holding Chairman sign-off protocols and bypass competitive bidding.',
    rootCauseHypothesisKu: 'هەوڵی ئەنقەست بۆ دابەشکردنی کڕین بە مەبەستی تێپەڕاندنی دەسەڵاتی پەسەندکردنی خاوەنی هۆلدینگ و پێدانی ڕاستەوخۆ بە دابینکەر بەبێ تەندەرین.',
    featuresContributing: [
      {
        featureName: 'Amount Proximity to $50k Ceiling',
        featureNameKu: 'نزیکی بڕی پارە لە سنووری ٥٠ هەزار دۆلار',
        observedValue: '$48,900 & $49,200 (98.1%)',
        expectedRange: '< $30,000 or > $55,000',
        zScore: 3.42,
        weight: 0.45,
        severityImpact: 'HIGH'
      },
      {
        featureName: 'Time Delta Between Repeated Vendor Orders',
        featureNameKu: 'ماوەی کاتی نێوان داواکارییە دووبارەکان',
        observedValue: '93 Minutes',
        expectedRange: '> 14 Days',
        zScore: 3.88,
        weight: 0.35,
        severityImpact: 'HIGH'
      },
      {
        featureName: 'Vendor Concentration Index',
        featureNameKu: 'ڕێژەی چڕبوونەوە لەسەر یەک دابینکەر',
        observedValue: '100% (Single Source)',
        expectedRange: '3-Bid Tender Comparison',
        zScore: 2.75,
        weight: 0.20,
        severityImpact: 'MEDIUM'
      }
    ],
    recommendedActions: [
      'Immediately freeze PO-CON-9021 and PO-CON-9022 pending owner committee review.',
      'Consolidate items into single $98,100 PO and route to Holding Owner Approval inbox.',
      'Audit procurement officer communication records with Al-Rawi Cement Suppliers.'
    ],
    recommendedActionsKu: [
      'ڕاگرتنی دەستبەجێی فەرمانی کڕینی PO-CON-9021 و PO-CON-9022.',
      'یەکخستنی هەردوو داواکارییەکە لە یەک داواکاری بە بەهای ٩٨,١٠٠$ و ناردنی بۆ سەرۆکی هۆلدینگ بۆ بڕیاردان.',
      'وردبینی کردنی پەیوەندییەکانی ئەفسەری کڕین لەگەڵ کۆمپانیای دابینکەر.'
    ]
  },
  {
    id: 'ALT-ML-2026-002',
    title: 'Ghost Worker Check-In: Physically Impossible Multi-Site Geolocation Velocity',
    titleKu: 'تۆماری ئامادەبوونی نائاسایی: گومانی کارمەندی کارتپێکەر (Ghost Worker) لە دوو شاری جیاواز',
    titleAr: 'تسجيل حضور وهمي: حركة جغرافية مستحيلة فيزيائياً بين موقعين في أربيل والسليمانية',
    category: 'ATTENDANCE',
    severity: 'CRITICAL',
    status: 'TRIGGERED',
    score: 96,
    confidence: 0.99,
    algorithmUsed: 'Kinetic Spatiotemporal Graph Check',
    detectedAt: '2026-10-18T08:40:15Z',
    companyId: 'comp-2',
    companyName: 'SAS Energy & Power Solutions',
    projectId: 'proj-2',
    projectName: 'Sulaymaniyah Solar Farm Phase 1',
    triggerLogId: 'LOG-ML-804',
    relatedEntityId: 'EMP-188',
    relatedEntityType: 'EMPLOYEE',
    description: 'Engineer Rebin Fariq was recorded scanning his facial ID at Erbil HQ at 08:15 AM, and then his RFID badge scanned into Sulaymaniyah Solar Substation at 08:38 AM (165 km distance traversed in 23 minutes, requiring an impossible ground speed of 430 km/h).',
    descriptionKu: 'ئەندازیار ڕێبین فەریق لە کاتژمێر ٠٨:١٥ دەموچاوی لە هەولێر ناسێنراوە، پاشان لە ٠٨:٣٨ باجەکەی لە وێستگەی سلێمانی تێپەڕیوە (١٦٥ کم لە ٢٣ خولەکدا، خێرایی پێویست ٤٣٠ کم/کەژمێرە کە مەحاڵە).',
    descriptionAr: 'تم تسجيل بصمة المهندس في أربيل الساعة 08:15 وبطاقته في السليمانية الساعة 08:38 (مسافة 165 كم خلال 23 دقيقة - سرعة مستحيلة 430 كم/ساعة).',
    rootCauseHypothesis: 'Badge sharing / proxy clock-in fraud. The employee likely shared his physical RFID card with a colleague in Sulaymaniyah while physically remaining in Erbil.',
    rootCauseHypothesisKu: 'کارت بەکارهێنان لەلایەن کەسی دیکەوە (Proxy Badge Scanning). کارمەند باجەکەی داوەتە هاوپیشەیەکی لە پڕۆژەی تر بۆ ئەوەی ئامادەبوونی ساختە تۆمار بکات.',
    featuresContributing: [
      {
        featureName: 'Required Transit Speed',
        featureNameKu: 'خێرایی گواستنەوەی پێویست',
        observedValue: '430.4 km/h',
        expectedRange: '< 95.0 km/h (Highway)',
        zScore: 6.82,
        weight: 0.60,
        severityImpact: 'HIGH'
      },
      {
        featureName: 'Biometric Modal Discrepancy',
        featureNameKu: 'جیاوازی شێوازی ناسینەوە',
        observedValue: 'Facial Scan vs RFID Tag',
        expectedRange: 'Single Verified Device',
        zScore: 3.10,
        weight: 0.25,
        severityImpact: 'MEDIUM'
      },
      {
        featureName: 'Site Cross-Assignment Conflict',
        featureNameKu: 'تەداخولی ئامادەبوون لە دوو پڕۆژە',
        observedValue: 'Dual Active Session',
        expectedRange: '1 Active Site at a Time',
        zScore: 4.15,
        weight: 0.15,
        severityImpact: 'HIGH'
      }
    ],
    recommendedActions: [
      'Revoke remote RFID badge access and enforce mandatory live biometric verification.',
      'Flag attendance record for HR salary deduction & initiate compliance investigation.',
      'Cross-check security CCTV footage at Sulaymaniyah Substation Gate #4 at 08:38 AM.'
    ],
    recommendedActionsKu: [
      'ڕاگرتنی دەستبەجێی باجە RFIDـەکە و ناچارکردنی بە پەنجەمۆر یان دەموچاو.',
      'سڕینەوەی تۆماری ئامادەبوون لە سیستەمی مووچە و دەستپێکردنی لێکۆڵینەوەی کارگێڕی.',
      'پێداچوونەوە بە کامێرای چاودێری (CCTV) دەروازەی ژمارە ٤ی وێستگەی سلێمانی لە کاتژمێر ٠٨:٣٨.'
    ]
  },
  {
    id: 'ALT-ML-2026-003',
    title: 'Off-Hours Weekend High-Value Debit Posting to Unreconciled Sundry Account',
    titleKu: 'تۆمارکردنی خەرجی گەورەی دارایی ($84,500) لە کاتی پشوو بەبێ بەڵگەنامەی ڕەزامەندی',
    titleAr: 'قيد محاسبي مدين كبير ومريب ($84,500) خارج أوقات الدوام الرسمي في عطلة نهاية الأسبوع',
    category: 'FINANCIAL',
    severity: 'HIGH',
    status: 'TRIGGERED',
    score: 89,
    confidence: 0.92,
    algorithmUsed: 'Robust MAD Z-Score + Time-Series Matrix',
    detectedAt: '2026-10-18T01:38:00Z',
    companyId: 'comp-3',
    companyName: 'SAS Industrial Logistics Co.',
    projectId: 'proj-3',
    projectName: 'Duhok Distribution Hub',
    triggerLogId: 'LOG-ML-803',
    relatedEntityId: 'VOUCH-2026-9904',
    relatedEntityType: 'FINANCE_VOUCHER',
    description: 'Manual ledger debit entry of $84,500 USD posted at 01:35 AM on Sunday morning from a remote VPN IP. The account credited is an unmonitored sundry clearing account with zero matching PO or receipt voucher attached.',
    descriptionKu: 'تۆمارکردنی مامەڵەیەکی دەستی دارایی بە بڕی ٨٤,٥٠٠ دۆلار لە کاتژمێر ٠١:٣٥ی بەرەبەیانی ڕۆژی پشوو لە ڕێگەی VPN بەبێ هیچ فەرمانێکی کڕین یان پەسەندکردنی سەرۆکی دارایی.',
    descriptionAr: 'تسجيل قيد مدين يدوي بقيمة 84,500 دولار في تمام الساعة 01:35 فجراً في عطلة نهاية الأسبوع عبر شبكة VPN إلى حساب تسويات معلق دون إرفاق إذن صرف أو موافقة مالية.',
    rootCauseHypothesis: 'Unauthorized manual ledger manipulation or off-books cash redirection attempt during supervision blackout hours.',
    rootCauseHypothesisKu: 'گومانی مامەڵەی دارایی نادروست یان دەستکاریکردنی حسابی دەستی لە کاتی نەبوونی چاودێری وردبینان.',
    featuresContributing: [
      {
        featureName: 'Posting Hour Anomaly (Time of Day)',
        featureNameKu: 'کاتی نائاسایی تۆمارکردنی مامەڵە',
        observedValue: '01:35 AM (Sunday)',
        expectedRange: '08:00 AM - 17:00 PM (Mon-Sat)',
        zScore: 4.88,
        weight: 0.50,
        severityImpact: 'HIGH'
      },
      {
        featureName: 'Amount vs Historical Daily Account Variance',
        featureNameKu: 'بەراوردی بڕی پارە لەگەڵ تێکڕای مێژوویی حسابەکە',
        observedValue: '$84,500 USD',
        expectedRange: '$2,000 - $14,000 USD (Baseline)',
        zScore: 3.92,
        weight: 0.35,
        severityImpact: 'HIGH'
      },
      {
        featureName: 'Supporting Document Attachment Integrity',
        featureNameKu: 'بوونی بەڵگەنامەی سەلمێنەری کڕین',
        observedValue: '0 Attachments (Missing PO)',
        expectedRange: 'Signed PO + Bank Slip Attached',
        zScore: 3.15,
        weight: 0.15,
        severityImpact: 'MEDIUM'
      }
    ],
    recommendedActions: [
      'Lock Voucher VOUCH-2026-9904 from bank transfer execution immediately.',
      'Require written justification and sign-off from Head of Finance within 24 hours.',
      'Review access logs and session activity of user account Nawzad R.'
    ],
    recommendedActionsKu: [
      'ڕاگرتنی دەستبەجێی مامەڵەی VOUCH-2026-9904 پێش ڕاکێشانی پارە لە بانک.',
      'داواکردنی ڕوونکردنەوەی فەرمی نووسراو لە بەرپرسی دارایی لە ماوەی ٢٤ کاتژمێردا.',
      'پشکنینی لۆگەکانی هاتنەژوورەوەی ژمێریار نەوزاد ڕەزا.'
    ]
  },
  {
    id: 'ALT-ML-2026-004',
    title: 'Extreme Unit Cost Inflation (+325%) on Inverter Replacement Parts',
    titleKu: 'بەرزبوونەوەی نائاسایی نرخی یەکە (+٣٢٥٪) لە کڕینی کەلوپەلی کارەبا',
    titleAr: 'تضخم غير مبرر في سعر الوحدة بنسبة +325% لقطع غيار المحولات الشمسية',
    category: 'PROCUREMENT',
    severity: 'HIGH',
    status: 'TRIGGERED',
    score: 86,
    confidence: 0.91,
    algorithmUsed: 'Price Dispersion Density & Historical Benchmark',
    detectedAt: '2026-10-17T15:25:00Z',
    companyId: 'comp-2',
    companyName: 'SAS Energy & Power Solutions',
    projectId: 'proj-2',
    projectName: 'Sulaymaniyah Solar Farm Phase 1',
    triggerLogId: 'LOG-ML-805',
    relatedEntityId: 'PO-ENG-4410',
    relatedEntityType: 'PURCHASE_ORDER',
    description: 'Purchase Order PO-ENG-4410 lists 500kVA Solar Inverter Units at $10,400 USD per unit. SAS Historical ERP benchmark across 14 past orders establishes the median price at $3,200 USD (Z-Score +3.65).',
    descriptionKu: 'داواکاری کڕینی ئینڤێرتەری کارەبایی بە نرخی ١٠,٤٠٠$ بۆ هەر دانەیەک دانراوە، لە کاتێکدا بەپێی ئەرشیفی ڕابردووی کۆمپانیا نرخی ئاسایی ٣,٢٠٠ دۆلار بووە (٣٢٥٪ بەرزترە لە نرخی بازاڕ).',
    descriptionAr: 'يتضمن أمر الشراء وحدات محولات بسعر 10,400$ للوحدة، بينما يحدد متوسط الأسعار التاريخية لـ SAS السعر عند 3,200$ بانحراف معياري مرتفع.',
    rootCauseHypothesis: 'Supplier price gouging or kickback arrangement inflating prices above market indices.',
    rootCauseHypothesisKu: 'گرانفرۆشی نائاسایی لەلایەن کۆمپانیای دابینکەر یان ڕێککەوتنی ژێر بەژێر بۆ زیادکردنی نرخ.',
    featuresContributing: [
      {
        featureName: 'Unit Price vs Historical Benchmark',
        featureNameKu: 'بەراوردی نرخی یەکە لەگەڵ مێژووی کڕین',
        observedValue: '$10,400 USD / unit',
        expectedRange: '$2,900 - $3,500 USD',
        zScore: 3.65,
        weight: 0.70,
        severityImpact: 'HIGH'
      },
      {
        featureName: 'Market Price Variance Index',
        featureNameKu: 'جیاوازی نرخ لەگەڵ بازاڕی عێراق و نێودەوڵەتی',
        observedValue: '+325.0% Inflation',
        expectedRange: '± 8% Inflation Allowance',
        zScore: 3.40,
        weight: 0.30,
        severityImpact: 'HIGH'
      }
    ],
    recommendedActions: [
      'Reject the quote and request 3 independent supplier price quotations.',
      'Engage central engineering procurement board to renegotiate catalog terms.',
      'Notify Project Manager of $43,200 potential budget overcharge prevention.'
    ],
    recommendedActionsKu: [
      'ڕەتکردنەوەی نرخەکە و داواکردنی ٣ تەندەری سەربەخۆ لە بازاڕ.',
      'دەستوەردانی لیژنەی ناوەندی هۆلدینگ بۆ ڕێکخستنەوەی نرخ لەگەڵ بەرهەمهێنەر.',
      'ئاگادارکردنەوەی بەڕێوەبەری پڕۆژە لە پاراستنی ٤٣,٢٠٠ دۆلار لە بەفیڕۆچوون.'
    ]
  },
  {
    id: 'ALT-ML-2026-005',
    title: 'Severe Operator Fatigue & HSE Violation (22 Continuous Hours on Crane)',
    titleKu: 'مەترسی گەورەی سەلامەتی (HSE): کارکردنی ٢٢ کاتژمێری شۆفێری کەرەستەی قورس بەبێ پشوو',
    titleAr: 'مخالفة سلامة مهنية حرجة (HSE): تشغيل رافعة ثقيلة لمدة 22 ساعة متواصلة دون راحة',
    category: 'ATTENDANCE',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    score: 88,
    confidence: 0.95,
    algorithmUsed: 'Fatigue Risk Modeling & Chronobiology Pattern',
    detectedAt: '2026-10-18T06:10:00Z',
    companyId: 'comp-1',
    companyName: 'SAS Construction Ltd',
    projectId: 'proj-1',
    projectName: 'Erbil Heights Tower A',
    triggerLogId: 'LOG-ML-806',
    relatedEntityId: 'EMP-102',
    relatedEntityType: 'EMPLOYEE',
    description: 'Crane Operator Bakhtiar Kamal logged 22 consecutive hours of machinery operation without the legally required 8-hour rest interval between shifts, for the 4th consecutive day. This poses severe structural and catastrophic safety risks to the tower site.',
    descriptionKu: 'شۆفێری کرێنی تاوەری کەرەستەی قورس بۆ ماوەی ٢٢ کاتژمێری لەسەریەک کاری پێکراوە بەبێ ٨ کاتژمێر پشووی یاسایی، بۆ چوارەم ڕۆژی لەسەریەک کە مەترسی کارەساتی گەورەی لەسەر پڕۆژەکە دروستکردووە.',
    descriptionAr: 'سجل مشغل الرافعة البرجية 22 ساعة عمل متواصلة لليوم الرابع على التوالي دون راحة إلزامية مما يهدد بوقوع حوادث كارثية في موقع البرج.',
    rootCauseHypothesis: 'Subcontractor crew shortage leading to unsafe shift-extension by site supervisors to avoid schedule delay penalties.',
    rootCauseHypothesisKu: 'کەمی کارمەندی جێگرەوە لەلایەن بەڵێندەری لاوەکی کە بووەتە هۆی ناچارکردنی شۆفێرەکە بە مانەوە لەپێناو دوا نەکەوتنی پڕۆژەکە.',
    featuresContributing: [
      {
        featureName: 'Consecutive Operational Hours',
        featureNameKu: 'کاتژمێری کارکردنی لەسەریەک',
        observedValue: '22.0 Hours',
        expectedRange: '< 10.0 Hours Max (HSE Standard)',
        zScore: 4.25,
        weight: 0.65,
        severityImpact: 'HIGH'
      },
      {
        featureName: 'Fatigue Risk Probability Index',
        featureNameKu: 'ئەگەری مەترسی ماندووبوون و هەڵەی کوشندە',
        observedValue: '96.2% High Risk',
        expectedRange: '< 20% Safe Threshold',
        zScore: 3.90,
        weight: 0.35,
        severityImpact: 'HIGH'
      }
    ],
    recommendedActions: [
      'Immediately order crane shutdown and stand down operator for mandatory 16-hour rest.',
      'Deploy certified backup crane operator from SAS Construction Reserve Pool.',
      'Issue safety citation to site supervisor for gross HSE non-compliance.'
    ],
    recommendedActionsKu: [
      'ڕاگرتنی دەستبەجێی کرێنەکە و ناردنی شۆفێرەکە بۆ پشووی یاسایی بەلایەنی کەم ١٦ کاتژمێر.',
      'ناردنی شۆفێری جێگرەوەی یەدەگ لە کۆگای سەرەکی هۆلدینگ بۆ پڕۆژەکە.',
      'سزادانی کارگێڕی بۆ سەرپەرشتیاری پڕۆژە بەهۆی پێشێلکردنی یاساکانی سەلامەتی (HSE).'
    ]
  }
];

export const initialAnomalyEngineStats: AnomalyEngineStats = {
  totalLogsAnalyzed: 14820,
  totalAlertsTriggered: 5,
  criticalAlertsCount: 2,
  highAlertsCount: 3,
  mediumAlertsCount: 0,
  financialRiskPreventedUSD: 428500,
  procurementAnomaliesCount: 2,
  financialAnomaliesCount: 1,
  attendanceAnomaliesCount: 2,
  modelConfidenceAverage: 0.946,
  lastScanTimestamp: '2026-10-18T10:48:22Z'
};
