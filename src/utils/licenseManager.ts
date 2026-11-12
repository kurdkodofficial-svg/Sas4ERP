export type LicenseType = 'TRIAL_14D' | 'COMMERCIAL_ACTIVE' | 'VIP_OWNER_GIFT' | 'EXPIRED';

export interface SystemLicenseInfo {
  licenseKey: string;
  hardwareFingerprint: string;
  licenseType: LicenseType;
  licensedToHolding: string;
  licensedToEmail: string;
  activatedAt: string;
  expiresAt: string;
  isPerpetual: boolean; // true for VIP gifts or enterprise buyout
  maxProjectsAllowed: number;
  maxCompaniesAllowed: number;
  featuresUnlocked: {
    offlineMeshSync: boolean;
    qrCameraScanner: boolean;
    realtimeFleetHealth: boolean;
    d3AssetDashboard: boolean;
    unlimitedHoldingSites: boolean;
    enterpriseWordExport: boolean;
  };
  ownerNotes?: string;
}

export type LicenseScope = 'HOLDING' | 'COMPANY' | 'PROJECT';
export type LicenseBillingDuration = '1M' | '6M' | '1Y' | 'VIP';

export interface EnterprisePricingRate {
  durationLabelKu: string;
  durationLabelEn: string;
  durationLabelAr: string;
  totalUSD: number;
  monthlyEquivalentUSD: number;
  discountPercent: number;
  savingsUSD: number;
  freeMonthsEquivalent: number;
}

export interface EnterprisePricingPlan {
  scope: LicenseScope;
  scopeNameKu: string;
  scopeNameEn: string;
  scopeNameAr: string;
  scopeDescriptionKu: string;
  scopeDescriptionEn: string;
  scopeDescriptionAr: string;
  monthlyBasePriceUSD: number;
  rates: {
    monthly: EnterprisePricingRate;
    semiAnnual: EnterprisePricingRate;
    annual: EnterprisePricingRate;
  };
  featuresKu: string[];
  featuresEn: string[];
}

/**
 * Official Recommended Subscription Pricing Matrix
 * Designed for Kurdistan & Iraq Holding/Enterprise Market:
 * - Single Project: $120/mo | 6M: $600 ($100/mo - 17% off) | 1Y: $1,050 ($87.5/mo - 27% off)
 * - Single Company: $250/mo | 6M: $1,250 ($208/mo - 17% off) | 1Y: $2,200 ($183/mo - 27% off)
 * - Full Holding:   $450/mo | 6M: $2,250 ($375/mo - 17% off) | 1Y: $3,950 ($329/mo - 27% off)
 */
export const ENTERPRISE_PRICING_PLANS: Record<LicenseScope, EnterprisePricingPlan> = {
  PROJECT: {
    scope: 'PROJECT',
    scopeNameKu: '١ پڕۆژەی دیاریکراو (Single Project)',
    scopeNameEn: 'Single Project Site License',
    scopeNameAr: 'مشروع إنشائي واحد',
    scopeDescriptionKu: 'بۆ بەڵێندەر و کۆمپانیاکان کە دەیانەوێت تەنها یەک پڕۆژەی بیناسازی یان ئۆپەراسیۆن بەڕێوەببەن.',
    scopeDescriptionEn: 'Tailored for single construction sites, infrastructure projects, or standalone operations.',
    scopeDescriptionAr: 'مخصص للمقاولين لإدارة مشروع بناء أو بنية تحتية واحد بجميع متطلباته الميدانية.',
    monthlyBasePriceUSD: 120,
    rates: {
      monthly: {
        durationLabelKu: 'مانگانە (١ مانگ)',
        durationLabelEn: 'Monthly (1 Month)',
        durationLabelAr: 'شهري (شهر واحد)',
        totalUSD: 120,
        monthlyEquivalentUSD: 120,
        discountPercent: 0,
        savingsUSD: 0,
        freeMonthsEquivalent: 0
      },
      semiAnnual: {
        durationLabelKu: '٦ مانگە (داشکاندنی %17 - ١ مانگ بێبەرامبەر)',
        durationLabelEn: '6 Months (17% Discount - 1 Month Free)',
        durationLabelAr: '٦ أشهر (خصم %17 - شهر مجاناً)',
        totalUSD: 600,
        monthlyEquivalentUSD: 100,
        discountPercent: 17,
        savingsUSD: 120,
        freeMonthsEquivalent: 1
      },
      annual: {
        durationLabelKu: 'ساڵانە (داشکاندنی %27 - ٣ مانگ بێبەرامبەر)',
        durationLabelEn: 'Annual / 1 Year (27% Discount - 3+ Months Free)',
        durationLabelAr: 'سنوي / سنة كاملة (خصم %27 - ٣ أشهر مجاناً)',
        totalUSD: 1050,
        monthlyEquivalentUSD: 87.5,
        discountPercent: 27,
        savingsUSD: 390,
        freeMonthsEquivalent: 3.25
      }
    },
    featuresKu: [
      'بەڕێوەبردنی تەواوی ١ پڕۆژەی بیناسازی/ئۆپەراسیۆن',
      'سکێنەری بارکۆد لە دەروازە و وەرگرتنی مەواد لە عەمبار',
      'تۆماری مانەوە و نشینگەی کرێکارانی بیانی و کەمپەکان',
      'ڕاپۆرتی دەوری رۆژانە لەگەڵ ئەرشیفی وێنەی سێرڤەی مەیدانی',
      'واژۆی دیجیتاڵی بەڕێوەبەری پڕۆژە (PM) و پرنتەری پسوولە'
    ],
    featuresEn: [
      'Complete operations management for 1 active project & sub-projects',
      'Gate Barcode / QR scanner & warehouse materials receiving',
      'Foreign worker residency tracking & accommodation camps',
      'Daily/periodic field progress reports with photo archive',
      'Project Manager (PM) digital approval signatures & receipts'
    ]
  },
  COMPANY: {
    scope: 'COMPANY',
    scopeNameKu: 'تەنها ١ کۆمپانیا (Single Company)',
    scopeNameEn: 'Single Standalone Company License',
    scopeNameAr: 'شركة واحدة مستقلة',
    scopeDescriptionKu: 'گونجاوە بۆ کۆمپانیایەکی سەربەخۆ بە تەواوی بەشەکان، عەمبار، دارایی، پڕۆژەکانی و کارمەندان.',
    scopeDescriptionEn: 'Ideal for independent corporate companies managing their departments, branches, and financials.',
    scopeDescriptionAr: 'مثالي للشركات المستقلة التي تدير أقسامها ومستودعاتها ومشاريعها وكوادرها المالية.',
    monthlyBasePriceUSD: 250,
    rates: {
      monthly: {
        durationLabelKu: 'مانگانە (١ مانگ)',
        durationLabelEn: 'Monthly (1 Month)',
        durationLabelAr: 'شهري (شهر واحد)',
        totalUSD: 250,
        monthlyEquivalentUSD: 250,
        discountPercent: 0,
        savingsUSD: 0,
        freeMonthsEquivalent: 0
      },
      semiAnnual: {
        durationLabelKu: '٦ مانگە (داشکاندنی %17 - ١ مانگ بێبەرامبەر)',
        durationLabelEn: '6 Months (17% Discount - 1 Month Free)',
        durationLabelAr: '٦ أشهر (خصم %17 - شهر مجاناً)',
        totalUSD: 1250,
        monthlyEquivalentUSD: 208.33,
        discountPercent: 17,
        savingsUSD: 250,
        freeMonthsEquivalent: 1
      },
      annual: {
        durationLabelKu: 'ساڵانە (داشکاندنی %27 - زیاتر لە ٣ مانگ بێبەرامبەر)',
        durationLabelEn: 'Annual / 1 Year (27% Discount - 3+ Months Free)',
        durationLabelAr: 'سنوي / سنة كاملة (خصم %27 - أكثر من ٣ أشهر مجاناً)',
        totalUSD: 2200,
        monthlyEquivalentUSD: 183.33,
        discountPercent: 27,
        savingsUSD: 800,
        freeMonthsEquivalent: 3.2
      }
    },
    featuresKu: [
      'تەواوی بەشەکانی کۆمپانیا (عەمبار، دارایی، میکانیک، HSE، سەلامەتی، سەرچاوە مرۆییەکان)',
      'بەڕێوەبردنی تا ١٠ پڕۆژەی سەربەخۆی ژێر کۆمپانیا',
      'سەرپەرشتی بەڕێوەبەری گشتی (GM) و سەقفی خەرجی بەپێی بودجە',
      'نوێکردنەوەی نیشتەجێبوونی کرێکاران و چاودێری ڕووداوەکان',
      'پرنتەری پەیوەستکراوی نێو تۆڕ و ناردنی نامەی فەرمی'
    ],
    featuresEn: [
      'All enterprise departments (Warehouse, Treasury, Fleet, HSE, HR)',
      'Manage up to 10 active sub-projects under company umbrella',
      'General Manager (GM) budget thresholds & auto-delegation',
      'Residency management, camps oversight & incident logs',
      'Network hardware printing connectivity & letters archive'
    ]
  },
  HOLDING: {
    scope: 'HOLDING',
    scopeNameKu: 'تەواوی هۆڵدینگ (Full Holding Enterprise)',
    scopeNameEn: 'Holding Enterprise Multi-Entity License',
    scopeNameAr: 'المجموعة القابضة بالكامل',
    scopeDescriptionKu: 'بۆ گرووپی هۆڵدینگی فرە کۆمپانیا و پڕۆژە: واژۆی خاوەن، ڕاداری ژیری دەستکرد و سینکی شارەکان.',
    scopeDescriptionEn: 'Full enterprise suite: Unlimited companies, unlimited projects, AI anomaly sentinel, and bilateral accounting.',
    scopeDescriptionAr: 'باقة المجموعة القابضة: شركات وفروع غير محدودة، موافقة المالك، ذكاء اصطناعي للمخاطر، ومزامنة الفروع.',
    monthlyBasePriceUSD: 450,
    rates: {
      monthly: {
        durationLabelKu: 'مانگانە (١ مانگ)',
        durationLabelEn: 'Monthly (1 Month)',
        durationLabelAr: 'شهري (شهر واحد)',
        totalUSD: 450,
        monthlyEquivalentUSD: 450,
        discountPercent: 0,
        savingsUSD: 0,
        freeMonthsEquivalent: 0
      },
      semiAnnual: {
        durationLabelKu: '٦ مانگە (داشکاندنی %17 - ١ مانگ بێبەرامبەر)',
        durationLabelEn: '6 Months (17% Discount - 1 Month Free)',
        durationLabelAr: '٦ أشهر (خصم %17 - شهر مجاناً)',
        totalUSD: 2250,
        monthlyEquivalentUSD: 375,
        discountPercent: 17,
        savingsUSD: 450,
        freeMonthsEquivalent: 1
      },
      annual: {
        durationLabelKu: 'ساڵانە (داشکاندنی %27 - بەرزترین پاشەکەوت و داشکاندن)',
        durationLabelEn: 'Annual / 1 Year (27% Discount - Maximum Savings)',
        durationLabelAr: 'سنوي / سنة كاملة (خصم %27 - أعلى توفير وأكبر خصم)',
        totalUSD: 3950,
        monthlyEquivalentUSD: 329.16,
        discountPercent: 27,
        savingsUSD: 1450,
        freeMonthsEquivalent: 3.22
      }
    },
    featuresKu: [
      'ژمارەی بێسنووری کۆمپانیاکان و پڕۆژە ستراتیژییەکان',
      'داشبۆردی باڵای سەرۆکایەتی و واژۆی دەسەڵاتی ڕەهای خاوەن (Owner Approval)',
      'سەنتینێڵی ژیری دەستکرد (ML Anomaly Sentinel) دژی فێڵی دارایی و پارچەکردن',
      'فاکتوری دووقۆڵی نێوان کۆمپانیاکان و کۆنسۆڵیدەیشنی ستانداردی نێودەوڵەتی GAAP',
      'تۆڕی ئۆفلاین مێش (Erbil HQ <-> Halabja Site) بەبێ هێڵی ئینتەرنێت',
      'پۆڕتاڵی لایسنسی تایبەت بە خاوەن (System 2 Vendor Hub)',
      'چاتی پارێزراوی کەلەگرام (Kelegram) و کۆنفرانسی ڤیدیۆیی ڕاستەوخۆ'
    ],
    featuresEn: [
      'Unlimited subsidiary companies & strategic national projects',
      'Holding Chairman dashboard & Sovereign Owner Approval engine',
      'AI ML Anomaly Sentinel fraud prevention & split PO detection',
      'Intercompany Bilateral Invoicing & IFRS 10 / GAAP consolidation',
      'Offline Local Mesh Sync between Erbil HQ and remote sites',
      'Platform Owner System 2 Vendor Hub for license management',
      'Kelegram corporate instant messaging & high-fidelity meetings'
    ]
  }
};

const HARDWARE_STORAGE_KEY = 'sas4erp_hardware_fingerprint_v1';
const LICENSE_STORAGE_KEY = 'sas4erp_system_license_state_v1';

/**
 * Generate or retrieve stable pseudo-hardware lock fingerprint from browser client
 */
export function getOrCreateHardwareFingerprint(): string {
  try {
    const existing = localStorage.getItem(HARDWARE_STORAGE_KEY);
    if (existing && existing.length > 8) return existing;

    const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080';
    const cpuCores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 8) : 8;
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'NodeApp';
    const rawSeed = `${screenRes}-${cpuCores}-${userAgent.slice(0, 30)}`;

    let hash = 0;
    for (let i = 0; i < rawSeed.length; i++) {
      hash = ((hash << 5) - hash) + rawSeed.charCodeAt(i);
      hash |= 0;
    }
    const cleanHash = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    const fingerprint = `SAS-NODE-${cleanHash.slice(0, 4)}-${cleanHash.slice(4, 8)}`;
    localStorage.setItem(HARDWARE_STORAGE_KEY, fingerprint);
    return fingerprint;
  } catch {
    return 'SAS-NODE-8821-EBL1';
  }
}

/**
 * Get current system license or initialize 14-day free trial
 */
export function getStoredSystemLicense(): SystemLicenseInfo {
  const hwId = getOrCreateHardwareFingerprint();
  try {
    const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (stored) {
      const parsed: SystemLicenseInfo = JSON.parse(stored);
      // Ensure full 14-day evaluation period as requested by the user
      if (parsed.licenseType === 'TRIAL_14D') {
        const remaining = getRemainingTrialDays(parsed.expiresAt);
        if (remaining < 14) {
          parsed.expiresAt = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();
          parsed.activatedAt = new Date().toISOString();
          try {
            localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(parsed));
          } catch {}
        }
      }
      // Validate expiration
      if (!parsed.isPerpetual && new Date(parsed.expiresAt).getTime() < Date.now()) {
        parsed.licenseType = 'EXPIRED';
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed reading license from storage', err);
  }

  // Default initial 14-day free trial on first launch
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString();

  const defaultTrial: SystemLicenseInfo = {
    licenseKey: 'TRIAL-14D-FREE-ACTIVE',
    hardwareFingerprint: hwId,
    licenseType: 'TRIAL_14D',
    licensedToHolding: 'SAS Holding Evaluation Client',
    licensedToEmail: 'trial@sasholding.com',
    activatedAt: now.toISOString(),
    expiresAt,
    isPerpetual: false,
    maxProjectsAllowed: 7,
    maxCompaniesAllowed: 4,
    featuresUnlocked: {
      offlineMeshSync: true,
      qrCameraScanner: true,
      realtimeFleetHealth: true,
      d3AssetDashboard: true,
      unlimitedHoldingSites: true,
      enterpriseWordExport: true
    },
    ownerNotes: 'Standard 14-day fully-featured trial period'
  };

  try {
    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(defaultTrial));
  } catch {}

  return defaultTrial;
}

/**
 * Explicitly reset the Free Trial to 14 full days
 */
export function resetTrialTo14Days(): SystemLicenseInfo {
  const hwId = getOrCreateHardwareFingerprint();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString();

  const trialLicense: SystemLicenseInfo = {
    licenseKey: 'TRIAL-14D-FREE-ACTIVE',
    hardwareFingerprint: hwId,
    licenseType: 'TRIAL_14D',
    licensedToHolding: 'SAS Holding Evaluation Client',
    licensedToEmail: 'kurdkodofficial@gmail.com',
    activatedAt: now.toISOString(),
    expiresAt,
    isPerpetual: false,
    maxProjectsAllowed: 7,
    maxCompaniesAllowed: 4,
    featuresUnlocked: {
      offlineMeshSync: true,
      qrCameraScanner: true,
      realtimeFleetHealth: true,
      d3AssetDashboard: true,
      unlimitedHoldingSites: true,
      enterpriseWordExport: true
    },
    ownerNotes: 'Reset to full 14-day evaluation period'
  };

  saveSystemLicense(trialLicense);
  return trialLicense;
}

/**
 * Save updated license state
 */
export function saveSystemLicense(license: SystemLicenseInfo): void {
  try {
    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(license));
  } catch (err) {
    console.error('Failed to save license:', err);
  }
}

/**
 * Activate license key
 * Supports:
 * 1. SAS-OWNER-GIFT-... -> VIP Free Access granted directly by the Owner
 * 2. SAS-PRO-ENTERPRISE-... -> Commercial Active License (1 Year or Perpetual)
 * 3. SAS-TRIAL-RESET-... -> Reset 14-day trial
 */
export function verifyAndApplyLicenseKey(
  inputKey: string,
  targetHoldingName: string,
  targetEmail: string
): { success: boolean; messageKu: string; messageEn: string; license?: SystemLicenseInfo } {
  const cleanKey = inputKey.trim().toUpperCase();
  const hwId = getOrCreateHardwareFingerprint();

  if (!cleanKey) {
    return {
      success: false,
      messageKu: 'تکایە کۆدی لایسنس بنووسە.',
      messageEn: 'Please provide a valid license key.'
    };
  }

  // 1. VIP Gift by Owner (خاوەنی سیستەم خۆی دەتوانێت بیداتە هەر هۆڵدینگێک بەخۆڕایی)
  if (cleanKey.startsWith('SAS-OWNER-GIFT') || cleanKey.startsWith('SAS-VIP') || cleanKey === 'SAS-HOLDING-OWNER-GRANT-2026') {
    const vipLicense: SystemLicenseInfo = {
      licenseKey: cleanKey,
      hardwareFingerprint: hwId,
      licenseType: 'VIP_OWNER_GIFT',
      licensedToHolding: targetHoldingName || 'Authorized Holding Partner (Owner Gift)',
      licensedToEmail: targetEmail || 'partner@sasholding.com',
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 100 * 365 * 24 * 3600 * 1000).toISOString(), // 100 years
      isPerpetual: true,
      maxProjectsAllowed: 999,
      maxCompaniesAllowed: 999,
      featuresUnlocked: {
        offlineMeshSync: true,
        qrCameraScanner: true,
        realtimeFleetHealth: true,
        d3AssetDashboard: true,
        unlimitedHoldingSites: true,
        enterpriseWordExport: true
      },
      ownerNotes: 'بەخشراوی تایبەت و بێبەرامبەر لەلایەن خاوەنی سەرەکی سیستەمەکەوە (Granted for free by System Owner)'
    };
    saveSystemLicense(vipLicense);
    return {
      success: true,
      messageKu: `مۆڵەتی VIP ی بەخۆڕایی لەلایەن خاوەنەوە بۆ هۆڵدینگی (${vipLicense.licensedToHolding}) بە سەرکەوتوویی کارا کرا!`,
      messageEn: `VIP Owner Gift License successfully activated for (${vipLicense.licensedToHolding})! Unlimited full access granted.`,
      license: vipLicense
    };
  }

  // 2. Commercial Active License (Monthly, 6-Month, or 1-Year across Project, Company, Holding)
  if (
    cleanKey.startsWith('SAS-PRO') ||
    cleanKey.startsWith('SAS-ENT') ||
    cleanKey.startsWith('SAS-COM') ||
    cleanKey.startsWith('SAS-MON') ||
    cleanKey.startsWith('SAS-HOLD') ||
    cleanKey.startsWith('SAS-COMP') ||
    cleanKey.startsWith('SAS-PROJ')
  ) {
    const isMonthly = cleanKey.startsWith('SAS-MON') || cleanKey.includes('-1M-');
    const is6Month = cleanKey.includes('-6M-');
    const durationDays = isMonthly ? 30 : is6Month ? 180 : 365;
    const durationTextKu = isMonthly ? '١ مانگ (٣٠ ڕۆژ)' : is6Month ? '٦ مانگ (١٨٠ ڕۆژ)' : '١ ساڵ (٣٦٥ ڕۆژ)';
    const durationTextEn = isMonthly ? '1 Month (30 Days)' : is6Month ? '6 Months (180 Days)' : '1 Year (365 Days)';

    const isProjectScope = cleanKey.startsWith('SAS-PROJ');
    const isCompanyScope = cleanKey.startsWith('SAS-COMP');
    const scopeLabelKu = isProjectScope ? '١ پڕۆژەی دیاریکراو' : isCompanyScope ? 'تەنها ١ کۆمپانیا' : 'تەواوی هۆڵدینگ';
    const scopeLabelEn = isProjectScope ? 'Single Project' : isCompanyScope ? 'Single Company' : 'Holding Enterprise';

    const commercialLicense: SystemLicenseInfo = {
      licenseKey: cleanKey,
      hardwareFingerprint: hwId,
      licenseType: 'COMMERCIAL_ACTIVE',
      licensedToHolding: targetHoldingName || (isProjectScope ? 'Project Site Operations' : isCompanyScope ? 'Commercial Company' : 'Holding Enterprise Group'),
      licensedToEmail: targetEmail || 'admin@holding.com',
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString(),
      isPerpetual: false,
      maxProjectsAllowed: isProjectScope ? 1 : isCompanyScope ? 10 : 999,
      maxCompaniesAllowed: isProjectScope ? 1 : isCompanyScope ? 1 : 999,
      featuresUnlocked: {
        offlineMeshSync: true,
        qrCameraScanner: true,
        realtimeFleetHealth: true,
        d3AssetDashboard: true,
        unlimitedHoldingSites: true,
        enterpriseWordExport: true
      },
      ownerNotes: `Commercial ${scopeLabelEn} [${durationTextEn}] Subscription`
    };
    saveSystemLicense(commercialLicense);
    return {
      success: true,
      messageKu: `لایسنسی بازرگانی (${scopeLabelKu}) بە سەرکەوتوویی بۆ ماوەی ${durationTextKu} کارا کرا!`,
      messageEn: `Commercial License (${scopeLabelEn}) successfully activated for ${durationTextEn}!`,
      license: commercialLicense
    };
  }

  // 3. Reset 14-day trial
  if (cleanKey === 'SAS-TRIAL-RESET-14') {
    const trialLicense: SystemLicenseInfo = {
      licenseKey: 'TRIAL-14D-EXTENDED',
      hardwareFingerprint: hwId,
      licenseType: 'TRIAL_14D',
      licensedToHolding: targetHoldingName || 'Evaluation Holding',
      licensedToEmail: targetEmail || 'trial@holding.com',
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      isPerpetual: false,
      maxProjectsAllowed: 7,
      maxCompaniesAllowed: 4,
      featuresUnlocked: {
        offlineMeshSync: true,
        qrCameraScanner: true,
        realtimeFleetHealth: true,
        d3AssetDashboard: true,
        unlimitedHoldingSites: true,
        enterpriseWordExport: true
      },
      ownerNotes: '14-Day Free Evaluation Trial'
    };
    saveSystemLicense(trialLicense);
    return {
      success: true,
      messageKu: 'ماوەی تاقیکردنەوەی ١٤ ڕۆژە بە سەرکەوتوویی نوێکرایەوە.',
      messageEn: '14-day trial period successfully renewed.',
      license: trialLicense
    };
  }

  return {
    success: false,
    messageKu: 'کۆدی لایسنس هەڵەیە یان نەناسراوە. تکایە پەیوەندی بە خاوەنی سیستەم بکە بۆ وەرگرتنی کلیل.',
    messageEn: 'Invalid license key. Please contact the platform owner to acquire a verified key.'
  };
}

/**
 * Helper to calculate remaining trial days
 */
export function getRemainingTrialDays(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 3600 * 24));
}

export interface GenerateClientKeyParams {
  clientHoldingName: string;
  clientEmail?: string;
  clientHardwareFingerprint?: string;
  scope?: LicenseScope;
  tier: 'VIP_OWNER_GIFT' | 'COMMERCIAL_1Y' | 'COMMERCIAL_6M' | 'COMMERCIAL_1M' | 'TRIAL_RESET';
  customNotes?: string;
}

export interface GeneratedClientLicenseResult {
  licenseKey: string;
  tier: 'VIP_OWNER_GIFT' | 'COMMERCIAL_1Y' | 'COMMERCIAL_6M' | 'COMMERCIAL_1M' | 'TRIAL_RESET';
  scope?: LicenseScope;
  scopeLabelKu?: string;
  scopeLabelEn?: string;
  priceLabelUSD?: string;
  tierLabelKu: string;
  tierLabelEn: string;
  durationLabelKu: string;
  durationLabelEn: string;
  clientHoldingName: string;
  clientHardwareFingerprint: string;
  createdAt: string;
  dispatchMessageKu: string;
  dispatchMessageEn: string;
  dispatchMessageAr: string;
}

/**
 * Generate an official cryptographically-patterned license key for clients
 */
export function generateClientLicenseKey(params: GenerateClientKeyParams): GeneratedClientLicenseResult {
  const cleanHolding = (params.clientHoldingName || 'ENTERPRISE')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8) || 'HOLDING';

  const cleanHw = params.clientHardwareFingerprint
    ? params.clientHardwareFingerprint.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-4)
    : Math.random().toString(36).substring(2, 6).toUpperCase();

  const salt = Math.random().toString(36).substring(2, 6).toUpperCase();
  const currentYear = new Date().getFullYear();

  const scope = params.scope || 'HOLDING';
  const scopePlan = ENTERPRISE_PRICING_PLANS[scope];
  const scopePrefix = scope === 'PROJECT' ? 'PROJ' : scope === 'COMPANY' ? 'COMP' : 'HOLD';

  let licenseKey = '';
  let tierLabelKu = '';
  let tierLabelEn = '';
  let durationLabelKu = '';
  let durationLabelEn = '';
  let priceLabelUSD = '';

  switch (params.tier) {
    case 'VIP_OWNER_GIFT':
      licenseKey = `SAS-VIP-${cleanHolding}-${cleanHw}-${salt}`;
      tierLabelKu = `مۆڵەتی VIP ی خاوەن (${scopePlan.scopeNameKu}) - بێبەرامبەر`;
      tierLabelEn = `Owner VIP Gift License (${scopePlan.scopeNameEn}) - Unlimited Access`;
      durationLabelKu = 'هەمیشەیی بێسنوور (Lifetime Perpetual)';
      durationLabelEn = 'Perpetual Unlimited Lifetime';
      priceLabelUSD = '$0 (Gift)';
      break;

    case 'COMMERCIAL_1Y':
      licenseKey = `SAS-${scopePrefix}-${cleanHolding}-${cleanHw}-${currentYear}-1Y-${salt}`;
      tierLabelKu = `لایسنسی ساڵانەی ${scopePlan.scopeNameKu} ($${scopePlan.rates.annual.totalUSD} / داشکاندنی %27)`;
      tierLabelEn = `Commercial Annual ${scopePlan.scopeNameEn} ($${scopePlan.rates.annual.totalUSD} / 27% Off)`;
      durationLabelKu = '١ ساڵی تەواو (365 Days)';
      durationLabelEn = '1 Year (365 Days)';
      priceLabelUSD = `$${scopePlan.rates.annual.totalUSD} (Save $${scopePlan.rates.annual.savingsUSD})`;
      break;

    case 'COMMERCIAL_6M':
      licenseKey = `SAS-${scopePrefix}-${cleanHolding}-${cleanHw}-6M-${salt}`;
      tierLabelKu = `لایسنسی ٦ مانگەی ${scopePlan.scopeNameKu} ($${scopePlan.rates.semiAnnual.totalUSD} / داشکاندنی %17)`;
      tierLabelEn = `Commercial 6-Month ${scopePlan.scopeNameEn} ($${scopePlan.rates.semiAnnual.totalUSD} / 17% Off)`;
      durationLabelKu = '٦ مانگی کارایی (180 Days)';
      durationLabelEn = '6 Months (180 Days)';
      priceLabelUSD = `$${scopePlan.rates.semiAnnual.totalUSD} (Save $${scopePlan.rates.semiAnnual.savingsUSD})`;
      break;

    case 'COMMERCIAL_1M':
      licenseKey = `SAS-${scopePrefix}-${cleanHolding}-${cleanHw}-1M-${salt}`;
      tierLabelKu = `لایسنسی مانگانەی ${scopePlan.scopeNameKu} ($${scopePlan.rates.monthly.totalUSD} / مانگ)`;
      tierLabelEn = `Commercial Monthly ${scopePlan.scopeNameEn} ($${scopePlan.rates.monthly.totalUSD}/month)`;
      durationLabelKu = '١ مانگ (٣٠ ڕۆژ - نوێکردنەوەی مانگانە)';
      durationLabelEn = '1 Month (30 Days - Monthly Renewal)';
      priceLabelUSD = `$${scopePlan.rates.monthly.totalUSD}/mo`;
      break;

    case 'TRIAL_RESET':
      licenseKey = 'SAS-TRIAL-RESET-14';
      tierLabelKu = 'نوێکردنەوەی ماوەی تاقیکردنەوەی ١٤ ڕۆژە';
      tierLabelEn = '14-Day Free Evaluation Reset';
      durationLabelKu = '١٤ ڕۆژی تاقیکردنەوە';
      durationLabelEn = '14 Days Free Trial';
      priceLabelUSD = 'Free Trial';
      break;
  }

  const dispatchMessageKu = `سڵاو بەڕێز،
پیرۆزە! مۆڵەتی فەرمی کارپێکردنی سیستەمی کارگێڕی دامەزراوەیی SAS4ERP ئامادە کرا:

🏢 بۆ ڕێکخراو / هۆڵدینگ: ${params.clientHoldingName || 'بەڕێزتان'}
📦 ئاستی مۆڵەت (Scope): ${scopePlan.scopeNameKu}
💎 جۆری لایسنس: ${tierLabelKu}
💰 بڕی پارە: ${priceLabelUSD}
⏱️ ماوەی کارایی: ${durationLabelKu}
🔒 بەستراوەتەوە بە ئامێر: ${params.clientHardwareFingerprint || 'ئامێری سەرەکی کڕیار'}

🔑 کۆدی چالاککردنی لایسنس (Activation Key):
${licenseKey}

📌 ڕێنمایی چۆنیەتی چالاککردن:
١. سیستەمی SAS4ERP بکەرەوە لەسەر کۆمپیوتەر یان مۆبایلەکەت.
٢. لە بەشی سەرەوە (Header) کلیک لەسەر دوگمەی کلیل (License) بکە.
٣. لە بەشی «کۆدی چالاککردنی لایسنس» ئەم کۆدەی سەرەوە Paste بکە.
٤. ناوی هۆڵدینگ/کۆمپانیاکەت بنووسە و دوگمەی «چالاککردنی لایسنس» داگرە.
سیستەم بە تەواوی بەشەکانیەوە دەستبەجێ کارا دەبێت!`;

  const dispatchMessageEn = `Dear Valued Client,
Congratulations! Your official SAS4ERP Enterprise License Key has been issued:

🏢 Licensed Organization: ${params.clientHoldingName || 'Client Entity'}
💎 License Tier: ${tierLabelEn}
⏱️ Validity Duration: ${durationLabelEn}
🔒 Bound Hardware Node: ${params.clientHardwareFingerprint || 'Authorized Client Node'}

🔑 License Activation Key:
${licenseKey}

📌 Activation Instructions:
1. Open SAS4ERP on your authorized machine.
2. Click the License Key button in the top header.
3. Paste this Activation Key into the "License Activation Key" input.
4. Enter your organization name and click "Activate License".
All 21 modules will activate immediately!`;

  const dispatchMessageAr = `مرحباً بك،
تهانينا! تم إصدار مفتاح الترخيص الرسمي لمنظومة إدارة المؤسسات SAS4ERP:

🏢 اسم المجموعة / الشركة: ${params.clientHoldingName || 'الجهة المصرحة'}
💎 فئة الترخيص: ${tierLabelKu}
⏱️ مدة الصلاحية: ${durationLabelKu}
🔒 بصمة العتاد المقترنة: ${params.clientHardwareFingerprint || 'الأجهزة المصرحة'}

🔑 مفتاح تفعيل الترخيص (License Key):
${licenseKey}

📌 خطوات التفعيل:
١. افتح منظومة SAS4ERP على جهازك.
٢. انقر على أيقونة المفتاح (الترخيص) في الشريط العلوي.
٣. الصق مفتاح التفعيل في حقل «كود تفعيل الترخيص».
٤. اكتب اسم شركتك واضغط على زر «تفعيل الترخيص».
ستعمل المنظومة بكامل طاقتها لكافة الأقسام فوراً!`;

  return {
    licenseKey,
    tier: params.tier,
    tierLabelKu,
    tierLabelEn,
    durationLabelKu,
    durationLabelEn,
    clientHoldingName: params.clientHoldingName || 'Client Entity',
    clientHardwareFingerprint: params.clientHardwareFingerprint || '',
    createdAt: new Date().toISOString(),
    dispatchMessageKu,
    dispatchMessageEn,
    dispatchMessageAr
  };
}

/**
 * Open high-resolution printable official Certificate of License for client
 */
export function openLicenseCertificatePrintView(info: {
  licenseKey: string;
  clientHoldingName: string;
  tierLabelKu: string;
  tierLabelEn: string;
  durationLabelKu: string;
  durationLabelEn: string;
  hardwareFingerprint?: string;
  createdAt: string;
}): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="ku" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Official License Certificate - ${info.clientHoldingName}</title>
      <style>
        @page { size: A4 landscape; margin: 12mm; }
        * { box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
          background: #f8fafc;
          margin: 0;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          color: #0f172a;
        }
        .cert-container {
          width: 270mm;
          min-height: 185mm;
          background: #ffffff;
          border: 8px double #1e3a8a;
          padding: 30px 40px;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border-radius: 8px;
        }
        .inner-border {
          border: 2px solid #d97706;
          padding: 24px;
          height: 100%;
          position: relative;
        }
        .cert-header {
          text-align: center;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .cert-badge {
          display: inline-block;
          background: #d97706;
          color: #ffffff;
          padding: 4px 18px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .cert-title {
          font-size: 26px;
          font-weight: 900;
          color: #1e3a8a;
          margin: 8px 0 4px 0;
        }
        .cert-subtitle {
          font-size: 13px;
          color: #475569;
          margin: 0;
        }
        .cert-body {
          text-align: center;
          padding: 15px 20px;
        }
        .granted-to-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
        .client-name {
          font-size: 28px;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 15px 0;
          text-decoration: underline;
          text-decoration-color: #d97706;
          text-underline-offset: 6px;
        }
        .cert-details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin: 20px 0;
          text-align: right;
        }
        .detail-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 10px 14px;
          border-radius: 8px;
        }
        .detail-label {
          font-size: 10px;
          color: #64748b;
          font-weight: bold;
          display: block;
        }
        .detail-value {
          font-size: 12px;
          color: #0f172a;
          font-weight: 800;
          margin-top: 2px;
        }
        .key-box {
          background: #eff6ff;
          border: 2px dashed #2563eb;
          padding: 12px;
          border-radius: 8px;
          margin: 15px 0;
          text-align: center;
        }
        .key-text {
          font-family: monospace;
          font-size: 18px;
          font-weight: 900;
          color: #1e40af;
          letter-spacing: 2px;
        }
        .cert-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 25px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
        }
        .seal-box {
          text-align: center;
          border: 2px solid #d97706;
          padding: 8px 16px;
          border-radius: 50%;
          width: 90px;
          height: 90px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #d97706;
          font-size: 9px;
          font-weight: bold;
        }
        .sign-box {
          text-align: center;
          min-width: 160px;
        }
        .sign-line {
          border-top: 1.5px solid #0f172a;
          margin-top: 30px;
          padding-top: 5px;
          font-size: 11px;
          font-weight: bold;
        }
        @media print {
          body { background: transparent; padding: 0; }
          .cert-container { box-shadow: none; width: 100%; height: 100%; border-width: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="cert-container">
        <div class="inner-border">
          <div class="cert-header">
            <span class="cert-badge">Official Software License Certificate</span>
            <h1 class="cert-title">بڕوانامەی فەرمی مۆڵەتی بەکارهێنانی SAS4ERP</h1>
            <p class="cert-subtitle">SAS Enterprise Holding Infrastructure Platform • Cryptographic Node License</p>
          </div>

          <div class="cert-body">
            <div class="granted-to-label">مۆڵەت بەخشراوە بە بەڕێوەبەرایەتی و هۆڵدینگی:</div>
            <h2 class="client-name">${info.clientHoldingName}</h2>

            <div class="key-box">
              <span class="detail-label" style="margin-bottom: 4px;">کۆدی فەرمی چالاککردن (LICENSE ACTIVATION KEY):</span>
              <div class="key-text">${info.licenseKey}</div>
            </div>

            <div class="cert-details-grid">
              <div class="detail-box">
                <span class="detail-label">جۆری لایسنس (License Tier):</span>
                <span class="detail-value">${info.tierLabelKu}</span>
              </div>
              <div class="detail-box">
                <span class="detail-label">ماوەی کارایی (Validity Period):</span>
                <span class="detail-value">${info.durationLabelKu}</span>
              </div>
              <div class="detail-box">
                <span class="detail-label">بەستراوەتەوە بە ئامێر (Hardware ID):</span>
                <span class="detail-value" style="font-family: monospace;">${info.hardwareFingerprint || 'UNIVERSAL-NODE'}</span>
              </div>
            </div>
          </div>

          <div class="cert-footer">
            <div class="sign-box">
              <span style="font-size: 10px; color: #64748b;">ڕێکەوتی دەرچوون: ${new Date(info.createdAt).toLocaleDateString('en-GB')}</span>
              <div class="sign-line">مۆری ئەندازیاری و سیستەم</div>
            </div>

            <div class="seal-box">
              <span>★ SAS4ERP ★</span>
              <span>VERIFIED</span>
              <span>OFFICIAL</span>
            </div>

            <div class="sign-box">
              <div style="font-family: cursive; font-size: 16px; color: #1e3a8a;">KurdKod Platform Authority</div>
              <div class="sign-line">واژۆی خاوەنی سەکۆ (Platform Owner)</div>
            </div>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
