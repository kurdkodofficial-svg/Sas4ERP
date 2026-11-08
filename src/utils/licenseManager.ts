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

  // 2. Commercial Active License
  if (cleanKey.startsWith('SAS-PRO') || cleanKey.startsWith('SAS-ENT') || cleanKey.startsWith('SAS-COM')) {
    const commercialLicense: SystemLicenseInfo = {
      licenseKey: cleanKey,
      hardwareFingerprint: hwId,
      licenseType: 'COMMERCIAL_ACTIVE',
      licensedToHolding: targetHoldingName || 'Commercial Holding Enterprise',
      licensedToEmail: targetEmail || 'admin@holding.com',
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(), // 1 year
      isPerpetual: false,
      maxProjectsAllowed: 50,
      maxCompaniesAllowed: 20,
      featuresUnlocked: {
        offlineMeshSync: true,
        qrCameraScanner: true,
        realtimeFleetHealth: true,
        d3AssetDashboard: true,
        unlimitedHoldingSites: true,
        enterpriseWordExport: true
      },
      ownerNotes: 'Commercial 1-Year Enterprise Subscription'
    };
    saveSystemLicense(commercialLicense);
    return {
      success: true,
      messageKu: `لایسنسی بازرگانی بە سەرکەوتوویی بۆ ماوەی یەک ساڵ کارا کرا!`,
      messageEn: `Commercial Enterprise License successfully activated for 1 Year!`,
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
