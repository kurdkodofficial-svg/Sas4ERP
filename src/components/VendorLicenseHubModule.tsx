import React, { useState, useEffect } from 'react';
import {
  Crown,
  Key,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Printer,
  Send,
  Cpu,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  ExternalLink,
  Sparkles,
  FileText,
  UserCheck,
  ChevronRight,
  ArrowRight,
  Download
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import {
  SystemLicenseInfo,
  getOrCreateHardwareFingerprint,
  generateClientLicenseKey,
  openLicenseCertificatePrintView,
  getRemainingTrialDays,
  verifyAndApplyLicenseKey,
  GeneratedClientLicenseResult,
  LicenseScope,
  ENTERPRISE_PRICING_PLANS,
  resetTrialTo14Days
} from '../utils/licenseManager';
import { getUIText } from '../utils/langHelper';

export interface ClientSubscriberRecord {
  id: string;
  holdingName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  hardwareFingerprint: string;
  planTier: 'COMMERCIAL_1M' | 'COMMERCIAL_6M' | 'COMMERCIAL_1Y' | 'VIP_OWNER_GIFT' | 'TRIAL_RESET';
  activeLicenseKey: string;
  startDate: string;
  expiresAt: string;
  monthlyFeeUSD: number;
  paymentStatus: 'PAID' | 'PENDING_RENEWAL' | 'OVERDUE';
  notes?: string;
}

const SUBSCRIBERS_STORAGE_KEY = 'sas4erp_client_subscribers_registry_v1';

const INITIAL_SUBSCRIBERS: ClientSubscriberRecord[] = [
  {
    id: 'SUB-2026-001',
    holdingName: 'Erbil Heights & Skyline Towers',
    contactName: 'ئەندازیار کاروان ئەحمەد',
    contactEmail: 'ceo@erbilheights.iq',
    contactPhone: '+964 750 445 1122',
    hardwareFingerprint: 'SAS-NODE-4E89-B201',
    planTier: 'COMMERCIAL_1M',
    activeLicenseKey: 'SAS-MON-ERBILHEI-B201-1M-88A2',
    startDate: new Date(Date.now() - 25 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(), // 5 days left
    monthlyFeeUSD: 350,
    paymentStatus: 'PENDING_RENEWAL',
    notes: 'پێویستی بە نوێکردنەوەی مانگانە هەیە لە ٥ ڕۆژی داهاتوودا'
  },
  {
    id: 'SUB-2026-002',
    holdingName: 'Slemani Grand Plaza & Logistics',
    contactName: 'دکتۆر ئاراس کەریم',
    contactEmail: 'info@slemanigrand.com',
    contactPhone: '+964 770 123 4567',
    hardwareFingerprint: 'SAS-NODE-89F1-A3C9',
    planTier: 'COMMERCIAL_1M',
    activeLicenseKey: 'SAS-MON-SLEMANIG-A3C9-1M-44C1',
    startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(),
    monthlyFeeUSD: 350,
    paymentStatus: 'PAID',
    notes: 'بەشداربووی مانگانەی ڕێکخراو'
  },
  {
    id: 'SUB-2026-003',
    holdingName: 'Halabja Agro-Industry Group',
    contactName: 'کاک بێستون عومەر',
    contactEmail: 'besitun@halabja-agro.com',
    contactPhone: '+964 750 998 7766',
    hardwareFingerprint: 'SAS-NODE-33C2-DD41',
    planTier: 'COMMERCIAL_1M',
    activeLicenseKey: 'SAS-MON-HALABJAA-DD41-1M-99Z1',
    startDate: new Date(Date.now() - 32 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() - 2 * 86400000).toISOString(), // Expired
    monthlyFeeUSD: 350,
    paymentStatus: 'OVERDUE',
    notes: 'لایسنس بەسەرچووە - چاوەڕوانی پارەدان و نوێکردنەوەی کلیلە'
  },
  {
    id: 'SUB-2026-004',
    holdingName: 'Duhok Commercial Infrastructure Ltd',
    contactName: 'ئەندازیار شێروان بارزانی',
    contactEmail: 'sherwan@duhokinfra.iq',
    contactPhone: '+964 750 334 5566',
    hardwareFingerprint: 'SAS-NODE-12B7-99E4',
    planTier: 'COMMERCIAL_1Y',
    activeLicenseKey: 'SAS-PRO-DUHOKCOM-99E4-2026-X771',
    startDate: new Date(Date.now() - 60 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 305 * 86400000).toISOString(),
    monthlyFeeUSD: 3500,
    paymentStatus: 'PAID',
    notes: 'لایسنسی تەواوی ساڵانە'
  },
  {
    id: 'SUB-2026-005',
    holdingName: 'Zagros Energy & Power Grid',
    contactName: 'کاک هەندرێن سەعید',
    contactEmail: 'hendren@zagros-energy.com',
    contactPhone: '+964 771 889 0011',
    hardwareFingerprint: 'SAS-NODE-55A1-CC88',
    planTier: 'VIP_OWNER_GIFT',
    activeLicenseKey: 'SAS-VIP-ZAGROSEN-CC88-L100',
    startDate: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 36500 * 86400000).toISOString(),
    monthlyFeeUSD: 0,
    paymentStatus: 'PAID',
    notes: 'مۆڵەتی VIP هەمیشەیی و بێبەرامبەر وەک شەریک'
  }
];

export const VendorLicenseHubModule: React.FC = () => {
  const { language } = useLanguage();
  const { systemLicense, setSystemLicense, setActiveTab, currentUser } = useERP();

  // Machine Hardware Fingerprint
  const currentMachineHw = getOrCreateHardwareFingerprint();

  // Subscribers Database State
  const [subscribers, setSubscribers] = useState<ClientSubscriberRecord[]>(() => {
    try {
      const saved = localStorage.getItem(SUBSCRIBERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SUBSCRIBERS;
  });

  // Sync subscribers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(subscribers));
    } catch {}
  }, [subscribers]);

  // Key Generator Form State
  const [genHoldingName, setGenHoldingName] = useState<string>('');
  const [genContactEmail, setGenContactEmail] = useState<string>('');
  const [genClientHw, setGenClientHw] = useState<string>('');
  const [genScope, setGenScope] = useState<LicenseScope>('HOLDING');
  const [genTier, setGenTier] = useState<'COMMERCIAL_1M' | 'COMMERCIAL_6M' | 'COMMERCIAL_1Y' | 'VIP_OWNER_GIFT' | 'TRIAL_RESET'>('COMMERCIAL_1M');
  const [selectedPricingScope, setSelectedPricingScope] = useState<LicenseScope>('HOLDING');
  const [pricingCurrency, setPricingCurrency] = useState<'USD' | 'IQD'>('USD');
  const [isPricingGuideOpen, setIsPricingGuideOpen] = useState<boolean>(true);
  const [resetTrialSuccess, setResetTrialSuccess] = useState<string | null>(null);

  const handleResetTrial14Days = async () => {
    try {
      const refreshed = resetTrialTo14Days();
      setSystemLicense(refreshed);
      await fetch('/api/license/reset-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email })
      });
      setResetTrialSuccess(
        language === 'ku'
          ? 'پیرۆزە! ماوەی تاقیکردنەوەی ١٤ ڕۆژە بە سەرکەوتوویی بۆ ئەم ئامێرە و سێرڤەر نوێکرایەوە.'
          : 'Success! 14-day free trial period successfully reset for this device and server.'
      );
      setTimeout(() => setResetTrialSuccess(null), 4500);
    } catch (e) {
      console.error(e);
    }
  };
  
  // Generated Result
  const [latestResult, setLatestResult] = useState<GeneratedClientLicenseResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedDispatch, setCopiedDispatch] = useState<boolean>(false);
  const [dispatchLang, setDispatchLang] = useState<'ku' | 'en' | 'ar'>('ku');
  const [testLocalFeedback, setTestLocalFeedback] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRING' | 'OVERDUE'>('ALL');

  // Add Client Modal State
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientContact, setNewClientContact] = useState<string>('');
  const [newClientEmail, setNewClientEmail] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [newClientHw, setNewClientHw] = useState<string>('');
  const [newClientTier, setNewClientTier] = useState<'COMMERCIAL_1M' | 'COMMERCIAL_6M' | 'COMMERCIAL_1Y' | 'VIP_OWNER_GIFT'>('COMMERCIAL_1M');
  const [newClientFee, setNewClientFee] = useState<number>(350);

  // Selected client for quick view / renewal dispatch modal
  const [selectedClientForDispatch, setSelectedClientForDispatch] = useState<ClientSubscriberRecord | null>(null);

  // Filtered subscribers list
  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch =
      sub.holdingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.activeLicenseKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.hardwareFingerprint.toLowerCase().includes(searchTerm.toLowerCase());

    const daysLeft = getRemainingTrialDays(sub.expiresAt);
    if (statusFilter === 'ACTIVE') return matchesSearch && daysLeft > 7;
    if (statusFilter === 'EXPIRING') return matchesSearch && daysLeft > 0 && daysLeft <= 7;
    if (statusFilter === 'OVERDUE') return matchesSearch && (daysLeft <= 0 || sub.paymentStatus === 'OVERDUE');
    return matchesSearch;
  });

  // Calculate statistics
  const activeCount = subscribers.filter(s => getRemainingTrialDays(s.expiresAt) > 0).length;
  const expiringCount = subscribers.filter(s => {
    const d = getRemainingTrialDays(s.expiresAt);
    return d > 0 && d <= 7;
  }).length;
  const overdueCount = subscribers.filter(s => getRemainingTrialDays(s.expiresAt) <= 0).length;
  const monthlyRecurringUSD = subscribers
    .filter(s => s.planTier === 'COMMERCIAL_1M' && s.paymentStatus === 'PAID')
    .reduce((acc, curr) => acc + curr.monthlyFeeUSD, 0);

  // Generate Key Handler
  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genHoldingName.trim()) return;

    const result = generateClientLicenseKey({
      clientHoldingName: genHoldingName.trim(),
      clientEmail: genContactEmail.trim() || undefined,
      clientHardwareFingerprint: genClientHw.trim() || undefined,
      scope: genScope,
      tier: genTier
    });

    setLatestResult(result);
    setTestLocalFeedback(null);
  };

  // 1-Click Monthly Renewal Handler for a Client in the Table
  const handleRenewClientMonthly = (client: ClientSubscriberRecord) => {
    const daysToAdd = 30;
    const now = new Date();
    // If expired, start from now; otherwise add 30 days to existing expiry
    const baseDate = new Date(client.expiresAt).getTime() > now.getTime()
      ? new Date(client.expiresAt)
      : now;
    const newExpiresAt = new Date(baseDate.getTime() + daysToAdd * 86400000).toISOString();

    // Generate fresh monthly key bound to client hardware
    const result = generateClientLicenseKey({
      clientHoldingName: client.holdingName,
      clientEmail: client.contactEmail,
      clientHardwareFingerprint: client.hardwareFingerprint,
      tier: 'COMMERCIAL_1M'
    });

    // Update client record
    setSubscribers(prev =>
      prev.map(item =>
        item.id === client.id
          ? {
              ...item,
              activeLicenseKey: result.licenseKey,
              expiresAt: newExpiresAt,
              paymentStatus: 'PAID',
              notes: `نوێکرایەوە لە ${new Date().toLocaleDateString('ku')} بۆ ماوەی ٣٠ ڕۆژ`
            }
          : item
      )
    );

    // Set as latest result and open dispatch preview
    setLatestResult(result);
    setSelectedClientForDispatch({
      ...client,
      activeLicenseKey: result.licenseKey,
      expiresAt: newExpiresAt,
      paymentStatus: 'PAID'
    });
  };

  // Copy Key to Clipboard
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Copy Dispatch Message
  const handleCopyDispatch = (msg: string) => {
    navigator.clipboard.writeText(msg);
    setCopiedDispatch(true);
    setTimeout(() => setCopiedDispatch(false), 2000);
  };

  // Print Official Certificate
  const handlePrintCertificate = (res: GeneratedClientLicenseResult) => {
    openLicenseCertificatePrintView({
      licenseKey: res.licenseKey,
      clientHoldingName: res.clientHoldingName,
      tierLabelKu: res.tierLabelKu,
      tierLabelEn: res.tierLabelEn,
      durationLabelKu: res.durationLabelKu,
      durationLabelEn: res.durationLabelEn,
      hardwareFingerprint: res.clientHardwareFingerprint || currentMachineHw,
      createdAt: res.createdAt
    });
  };

  // Test Key locally on current machine
  const handleApplyToThisMachine = (key: string, holdingName: string) => {
    const res = verifyAndApplyLicenseKey(key, holdingName, currentUser.email);
    if (res.success && res.license) {
      setSystemLicense(res.license);
      setTestLocalFeedback(
        language === 'ku'
          ? `پیرۆزە! لایسنسەکە دەستبەجێ لەسەر ئەم ئامێرەش کارا کرا: ${res.messageKu}`
          : `Success! License activated locally on this workstation: ${res.messageEn}`
      );
    } else {
      setTestLocalFeedback(res.messageKu || 'هەڵە لە کاراکردن');
    }
  };

  // Handle Add New Client Submit
  const handleAddNewClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const days = newClientTier === 'COMMERCIAL_1M' ? 30 : newClientTier === 'COMMERCIAL_6M' ? 180 : 365;
    const expiresAt = newClientTier === 'VIP_OWNER_GIFT'
      ? new Date(Date.now() + 36500 * 86400000).toISOString()
      : new Date(Date.now() + days * 86400000).toISOString();

    const genRes = generateClientLicenseKey({
      clientHoldingName: newClientName,
      clientEmail: newClientEmail,
      clientHardwareFingerprint: newClientHw || undefined,
      tier: newClientTier
    });

    const newRecord: ClientSubscriberRecord = {
      id: `SUB-2026-${String(subscribers.length + 1).padStart(3, '0')}`,
      holdingName: newClientName,
      contactName: newClientContact || 'بەڕێوەبەری سەرەکی',
      contactEmail: newClientEmail || 'client@holding.com',
      contactPhone: newClientPhone || '-',
      hardwareFingerprint: newClientHw || 'SAS-NODE-UNIV-9921',
      planTier: newClientTier,
      activeLicenseKey: genRes.licenseKey,
      startDate: new Date().toISOString(),
      expiresAt,
      monthlyFeeUSD: newClientFee,
      paymentStatus: 'PAID',
      notes: 'کڕیاری نوێ لە سەکۆ تۆمارکرا'
    };

    setSubscribers(prev => [newRecord, ...prev]);
    setLatestResult(genRes);
    setIsAddClientModalOpen(false);

    // Reset fields
    setNewClientName('');
    setNewClientContact('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientHw('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Top Dual-System Context Banner: OWNER SYSTEM 2 */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white border-2 border-amber-400 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Crown className="w-4 h-4" />
                <span>{language === 'ku' ? 'سیستەمی دووەم: پۆڕتاڵی تایبەتی خاوەنی سەکۆ' : 'System 2: Platform Owner Command Center'}</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold">
                ● {language === 'ku' ? 'شاردراوە لە کڕیاران (Strictly Hidden From Clients)' : 'Strictly Hidden From Clients'}
              </span>

              <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold flex items-center gap-1.5 font-mono">
                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>kurdkodofficial@gmail.com</span>
                <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-sans font-bold">
                  {language === 'ku' ? 'خاوەنی سەکۆ' : 'Owner'}
                </span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {language === 'ku'
                ? 'کۆنتڕۆڵی لایسنس و بەشداربووان: نوێکردنەوەی مانگانە و دروستکردنی کلیل'
                : 'Platform Owner Licensing Hub: Monthly Renewals & Client Key Engine'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {language === 'ku'
                ? 'ئەم بەشە تایبەتە بە جەنابت وەک خاوەنی سیستەم و کڕیارەکان نایبینن. لێرەوە دەتوانیت لایسنسی مانگانە (٣٠ ڕۆژ) یان ساڵانە بۆ کڕیاران دروست بکەیت، لایسنسەکانیان بە ١ کرتە نوێ بکەیتەوە، و نامەی ئامادەکراوی واتسئەپ و بڕوانامەی فەرمی A4 بۆ کڕیار دەربکەیت.'
                : 'This executive command center is exclusively available to you as platform owner. Manage recurring client subscriptions, issue hardware-bound license keys, and handle 1-click monthly renewals.'}
            </p>
          </div>

          {/* Quick Dual-System Switcher & Action Buttons */}
          <div className="flex items-center gap-2 self-stretch lg:self-auto shrink-0 flex-wrap">
            {/* Reset Trial to 14 Days Button */}
            <button
              onClick={handleResetTrial14Days}
              className="px-3.5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md transform active:scale-95"
              title={language === 'ku' ? 'نوێکردنەوەی ماوەی تاقیکردنەوە بۆ ١٤ ڕۆژ' : 'Reset Trial to 14 Days'}
            >
              <RefreshCw className="w-4 h-4 text-slate-950" />
              <span>{language === 'ku' ? '🔄 نوێکردنەوە بۆ ١٤ ڕۆژ' : '🔄 Reset Trial 14D'}</span>
            </button>

            {/* Toggle Pricing Matrix Guide Button */}
            <button
              onClick={() => setIsPricingGuideOpen(prev => !prev)}
              className={`px-3.5 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border backdrop-blur-md ${
                isPricingGuideOpen
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{language === 'ku' ? '📊 پلانی نرخەکان' : '📊 Pricing Matrix'}</span>
            </button>

            <button
              onClick={() => setActiveTab('holding-dashboard')}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-white/20 backdrop-blur-md"
              title="Return to Standard Client ERP Operations"
            >
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>{language === 'ku' ? '🏢 چوون بۆ سیستەمی هۆڵدینگ (ERP)' : '🏢 Open Client ERP System'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Trial Feedback Alert */}
      {resetTrialSuccess && (
        <div className="bg-emerald-500 text-slate-950 p-4 rounded-2xl shadow-lg border-2 border-emerald-300 font-black text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
            <span>{resetTrialSuccess}</span>
          </div>
          <span className="text-[10px] bg-slate-950 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono">
            14 DAYS ACTIVE
          </span>
        </div>
      )}

      {/* Official Subscription Pricing Guide (Holding vs Company vs Project with 1M, 6M, 1Y Discounts) */}
      {isPricingGuideOpen && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-md space-y-5 animate-in fade-in">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                  <Crown className="w-3.5 h-3.5" />
                  <span>{language === 'ku' ? 'پێشنیاری فەرمی نرخەکانی لایسنس' : 'Official Pricing Strategy'}</span>
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {language === 'ku' ? 'داشکاندنی %17 بۆ ٦ مانگ • %27 بۆ ساڵانە' : '17% off for 6M • 27% off for 1Y'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                {language === 'ku'
                  ? 'نرخی بەشداربوونی هۆڵدینگ، کۆمپانیا و پڕۆژە (بە داشکاندنی ٦ مانگە و ساڵانە)'
                  : 'Holding, Company & Project Subscription Matrix with Progressive Discounts'}
              </h2>
            </div>

            {/* Currency Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setPricingCurrency('USD')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  pricingCurrency === 'USD'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setPricingCurrency('IQD')}
                className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  pricingCurrency === 'IQD'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                IQD (د.ع)
              </button>
            </div>
          </div>

          {/* 3 Scope Selector Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['HOLDING', 'COMPANY', 'PROJECT'] as LicenseScope[]).map((scopeKey) => {
              const plan = ENTERPRISE_PRICING_PLANS[scopeKey];
              const isSelected = selectedPricingScope === scopeKey;
              return (
                <button
                  key={scopeKey}
                  type="button"
                  onClick={() => {
                    setSelectedPricingScope(scopeKey);
                    setGenScope(scopeKey);
                  }}
                  className={`p-4 rounded-2xl border-2 text-right transition cursor-pointer relative ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${
                      isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {plan.scopeNameKu}
                    </span>
                    <span className="font-mono text-xs font-black text-amber-800">
                      ${plan.monthlyBasePriceUSD}/mo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {language === 'ku' ? plan.scopeDescriptionKu : plan.scopeDescriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Pricing Details Cards for Selected Scope */}
          {(() => {
            const plan = ENTERPRISE_PRICING_PLANS[selectedPricingScope];
            const toCurrency = (usd: number) => {
              if (pricingCurrency === 'IQD') {
                return `${(usd * 1500).toLocaleString()} د.ع`;
              }
              return `$${usd.toLocaleString()}`;
            };

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Monthly (1 Month) */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">
                        {language === 'ku' ? 'مانگانە (١ مانگ)' : 'Monthly (1 Month)'}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        {language === 'ku' ? 'نرخی بنەڕەتی' : 'Standard Rate'}
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                        {toCurrency(plan.rates.monthly.totalUSD)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                        {language === 'ku' ? 'بۆ ماوەی ٣٠ ڕۆژ' : 'per 30-day renewal'}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                      <div>✓ {language === 'ku' ? 'نوێکردنەوەی مانگانە بە کلیل' : 'Monthly cryptographic key'}</div>
                      <div>✓ {language === 'ku' ? 'گونجاوە بۆ تاقیکردنەوەی خێرا' : 'Flexible short-term commitment'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGenScope(selectedPricingScope);
                        setGenTier('COMMERCIAL_1M');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>{language === 'ku' ? 'دروستکردنی کلیلی مانگانە' : 'Select Monthly Key'}</span>
                    </button>
                  </div>

                  {/* Card 2: 6 Months (17% Discount - 1 Month Free) */}
                  <div className="p-4 rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50/50 to-amber-100/30 shadow-md space-y-3 relative overflow-hidden">
                    <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase shadow-xs">
                      {language === 'ku' ? '١ مانگ خۆڕایی (%17)' : '1 Month Free'}
                    </div>
                    <div className="flex items-center justify-between pt-3">
                      <span className="text-xs font-black text-amber-950">
                        {language === 'ku' ? '٦ مانگە (نیوە ساڵ)' : '6 Months (Semi-Annual)'}
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                        {toCurrency(plan.rates.semiAnnual.totalUSD)}
                      </div>
                      <div className="text-[11px] text-amber-900 font-bold mt-0.5 flex items-center gap-1">
                        <span>{language === 'ku' ? `تەنها ${toCurrency(Math.round(plan.rates.semiAnnual.monthlyEquivalentUSD))}/مانگ` : `${toCurrency(Math.round(plan.rates.semiAnnual.monthlyEquivalentUSD))}/mo`}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                          {language === 'ku' ? `پاشەکەوتی ${toCurrency(plan.rates.semiAnnual.savingsUSD)}` : `Save ${toCurrency(plan.rates.semiAnnual.savingsUSD)}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-700 space-y-1 pt-2 border-t border-amber-200/80">
                      <div>✓ {language === 'ku' ? '١٨٠ ڕۆژی بەردەوامی سیستەم' : '180 days uninterrupted runtime'}</div>
                      <div>✓ {language === 'ku' ? 'داشکاندنی تەواوی یەک مانگ' : '1 full month free discount'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGenScope(selectedPricingScope);
                        setGenTier('COMMERCIAL_6M');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{language === 'ku' ? 'دروستکردنی کلیلی ٦ مانگە' : 'Select 6-Month Key'}</span>
                    </button>
                  </div>

                  {/* Card 3: Annual (1 Year - 27% Discount - Max Savings) */}
                  <div className="p-4 rounded-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-50/50 to-indigo-50/40 shadow-lg space-y-3 relative overflow-hidden">
                    <div className="absolute top-2 left-2 bg-blue-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase shadow-xs">
                      {language === 'ku' ? 'باشترین نرخ (٣+ مانگ خۆڕایی)' : 'Best Value (3+ Mo Free)'}
                    </div>
                    <div className="flex items-center justify-between pt-3">
                      <span className="text-xs font-black text-blue-950">
                        {language === 'ku' ? 'ساڵانە (١ ساڵی تەواو)' : 'Annual (1 Full Year)'}
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900 font-mono">
                        {toCurrency(plan.rates.annual.totalUSD)}
                      </div>
                      <div className="text-[11px] text-blue-900 font-bold mt-0.5 flex items-center gap-1">
                        <span>{language === 'ku' ? `تەنها ${toCurrency(Math.round(plan.rates.annual.monthlyEquivalentUSD))}/مانگ` : `${toCurrency(Math.round(plan.rates.annual.monthlyEquivalentUSD))}/mo`}</span>
                        <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                          {language === 'ku' ? `پاشەکەوتی ${toCurrency(plan.rates.annual.savingsUSD)}` : `Save ${toCurrency(plan.rates.annual.savingsUSD)}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-700 space-y-1 pt-2 border-t border-blue-200/80">
                      <div>✓ {language === 'ku' ? '٣٦٥ ڕۆژی بێ وەستان و نوێکردنەوە' : '365 days continuous enterprise access'}</div>
                      <div>✓ {language === 'ku' ? 'داشکاندنی زیاتر لە ٣ مانگ بەخۆڕایی' : 'More than 3 months free'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGenScope(selectedPricingScope);
                        setGenTier('COMMERCIAL_1Y');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>{language === 'ku' ? 'دروستکردنی کلیلی ساڵانە' : 'Select Annual Key'}</span>
                    </button>
                  </div>
                </div>

                {/* Features included in this scope */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs">
                  <span className="font-bold text-slate-800 block mb-1.5">
                    {language === 'ku' ? `تایبەتمەندییە بەردەستەکانی ئاستی (${plan.scopeNameKu}):` : `Included Features for (${plan.scopeNameEn}):`}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                    {plan.featuresKu.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* KPI Cards: Platform Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Clients */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              {language === 'ku' ? 'کۆی کڕیارانی تۆمارکراو' : 'Total Client Holdings'}
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {subscribers.length}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{activeCount} {language === 'ku' ? 'مۆڵەتی کارا' : 'Active licenses'}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Expiring Soon (< 7 Days) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              {language === 'ku' ? 'نوێکردنەوەی لە ٧ ڕۆژدا' : 'Expiring within 7 Days'}
            </span>
            <span className="text-2xl font-black text-amber-600 mt-0.5 block">
              {expiringCount}
            </span>
            <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              <span>{language === 'ku' ? 'پێویستیان بە نوێکردنەوەیە' : 'Renewal required soon'}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue / Expired */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              {language === 'ku' ? 'لایسنسی بەسەرچوو' : 'Overdue / Expired'}
            </span>
            <span className="text-2xl font-black text-rose-600 mt-0.5 block">
              {overdueCount}
            </span>
            <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{language === 'ku' ? 'ڕاگیراوە تا پارەدان' : 'Locked pending renewal'}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Machine Hardware Fingerprint & Local License */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xs flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              {language === 'ku' ? 'ناسنامەی ئامێری ئێستا' : 'Your Hardware Node ID'}
            </span>
            <span className="text-xs font-mono font-black text-white mt-1 block truncate">
              {currentMachineHw}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
              {systemLicense?.licenseType === 'VIP_OWNER_GIFT'
                ? 'VIP Owner Lifetime'
                : systemLicense?.licenseType === 'COMMERCIAL_ACTIVE'
                ? 'Commercial Active'
                : 'Active Node'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Generator Studio on Left/Top + Subscribers Database Table on Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* =========================================================================
            SECTION 1: KEY GENERATOR STUDIO (5 Columns)
        ========================================================================= */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                  <Key className="w-4 h-4 font-black" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    {language === 'ku' ? 'ستۆدیۆی دروستکردنی کلیل' : 'License Key Generator Studio'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ku' ? 'دروستکردنی کلیل بە شێوازی پارێزراو بۆ کڕیار' : 'Generate verified hardware-bound license keys'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                OWNER ONLY
              </span>
            </div>

            <form onSubmit={handleGenerateKey} className="space-y-3.5">
              {/* Organization Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  {language === 'ku' ? 'ناوی هۆڵدینگ یان کۆمپانیای کڕیار:' : 'Client Holding / Company Name:'} *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={genHoldingName}
                    onChange={(e) => setGenHoldingName(e.target.value)}
                    placeholder="Erbil Towers Holding"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Client Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">
                  {language === 'ku' ? 'ئیمەیڵی پەیوەندی کڕیار (ئیختیاری):' : 'Client Email (Optional):'}
                </label>
                <input
                  type="email"
                  value={genContactEmail}
                  onChange={(e) => setGenContactEmail(e.target.value)}
                  placeholder="contact@erbiltowers.iq"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Client Hardware Node ID */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 block">
                    {language === 'ku' ? 'ناسنامەی ئامێری کڕیار (Hardware Node ID):' : 'Client Machine Hardware ID:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setGenClientHw(currentMachineHw)}
                    className="text-[10px] text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                  >
                    {language === 'ku' ? 'دانانی ئەم ئامێرە' : 'Use this machine'}
                  </button>
                </div>
                <div className="relative">
                  <Cpu className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={genClientHw}
                    onChange={(e) => setGenClientHw(e.target.value)}
                    placeholder="SAS-NODE-4E89-B201"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 uppercase font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {language === 'ku'
                    ? 'ئەگەر بەتاڵ بێت، کلیلەکە گشتگیر (Universal) دەبێت.'
                    : 'If empty, a universal enterprise node key is generated.'}
                </span>
              </div>

              {/* Scope Selection: Holding vs Company vs Project */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  {language === 'ku' ? 'ئاستی لایسنس (Scope):' : 'License Scope:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGenScope('HOLDING');
                      setSelectedPricingScope('HOLDING');
                    }}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      genScope === 'HOLDING'
                        ? 'bg-amber-100 border-amber-500 font-black text-amber-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-black">🏢 {language === 'ku' ? 'هۆڵدینگ' : 'Holding'}</div>
                    <div className="text-[10px] text-amber-800 font-bold font-mono">$450/mo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGenScope('COMPANY');
                      setSelectedPricingScope('COMPANY');
                    }}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      genScope === 'COMPANY'
                        ? 'bg-amber-100 border-amber-500 font-black text-amber-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-black">🏢 {language === 'ku' ? '١ کۆمپانیا' : 'Company'}</div>
                    <div className="text-[10px] text-amber-800 font-bold font-mono">$250/mo</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGenScope('PROJECT');
                      setSelectedPricingScope('PROJECT');
                    }}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      genScope === 'PROJECT'
                        ? 'bg-amber-100 border-amber-500 font-black text-amber-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-black">🏗️ {language === 'ku' ? '١ پڕۆژە' : 'Project'}</div>
                    <div className="text-[10px] text-amber-800 font-bold font-mono">$120/mo</div>
                  </button>
                </div>
              </div>

              {/* Tier Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  {language === 'ku' ? 'ماوە و جۆری لایسنس:' : 'Subscription Duration Tier:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Monthly - 30 Days (Primary) */}
                  <button
                    type="button"
                    onClick={() => setGenTier('COMMERCIAL_1M')}
                    className={`p-2.5 rounded-xl border text-right transition cursor-pointer flex items-center gap-2 ${
                      genTier === 'COMMERCIAL_1M'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/50 text-amber-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-xs">⚡ مانگانە (${ENTERPRISE_PRICING_PLANS[genScope].rates.monthly.totalUSD})</div>
                      <div className="text-[9px] text-slate-500">٣٠ ڕۆژ - نوێکردنەوە</div>
                    </div>
                  </button>

                  {/* 1 Year */}
                  <button
                    type="button"
                    onClick={() => setGenTier('COMMERCIAL_1Y')}
                    className={`p-2.5 rounded-xl border text-right transition cursor-pointer flex items-center gap-2 ${
                      genTier === 'COMMERCIAL_1Y'
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/50 text-blue-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-xs">💼 ساڵانە (${ENTERPRISE_PRICING_PLANS[genScope].rates.annual.totalUSD})</div>
                      <div className="text-[9px] text-emerald-700 font-bold">%27 داشکاندن • ٣٦٥ ڕۆژ</div>
                    </div>
                  </button>

                  {/* 6 Months */}
                  <button
                    type="button"
                    onClick={() => setGenTier('COMMERCIAL_6M')}
                    className={`p-2.5 rounded-xl border text-right transition cursor-pointer flex items-center gap-2 ${
                      genTier === 'COMMERCIAL_6M'
                        ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-400/50 text-indigo-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-xs">🏢 ٦ مانگە (${ENTERPRISE_PRICING_PLANS[genScope].rates.semiAnnual.totalUSD})</div>
                      <div className="text-[9px] text-amber-800 font-bold">%17 داشکاندن • ١٨٠ ڕۆژ</div>
                    </div>
                  </button>

                  {/* VIP Owner Gift */}
                  <button
                    type="button"
                    onClick={() => setGenTier('VIP_OWNER_GIFT')}
                    className={`p-2.5 rounded-xl border text-right transition cursor-pointer flex items-center gap-2 ${
                      genTier === 'VIP_OWNER_GIFT'
                        ? 'bg-yellow-50 border-yellow-500 ring-2 ring-yellow-400/50 text-yellow-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Crown className="w-4 h-4 text-yellow-600 shrink-0" />
                    <div>
                      <div className="font-extrabold text-xs">👑 VIP خاوەن</div>
                      <div className="text-[9px] text-slate-500">هەمیشەیی بێسنوور</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-amber-500/25"
              >
                <Key className="w-4 h-4" />
                <span>{language === 'ku' ? 'دروستکردنی کلیل بۆ کڕیار' : 'Generate License Key'}</span>
              </button>
            </form>
          </div>

          {/* GENERATED KEY RESULT DISPLAY (With Bold Clear Writings Underneath) */}
          {latestResult && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-400 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-black text-xs text-slate-900">
                    {language === 'ku' ? 'کلیلی دروستکراو بۆ کڕیار:' : 'Generated Key for Client:'}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                  READY
                </span>
              </div>

              {/* The Key Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950 text-amber-300 font-mono text-center space-y-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-sans font-bold">
                  {latestResult.clientHoldingName} • {latestResult.durationLabelKu}
                </span>
                <div className="text-xs sm:text-sm font-black tracking-wider break-all select-all text-amber-300">
                  {latestResult.licenseKey}
                </div>
              </div>

              {/* =========================================================
                  CRITICAL: NOOSINEKANI TAYBET BA KLIL (CLEAR TEXT UNDER KEY)
                  As specifically requested by user:
                  "نووسینەکانی تایبەت بە کلیل ئێستا دیار نیە ، با ئەو نووسینانە لەژێر کلیلەکە بە روونی دەرکەون ."
              ========================================================= */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2.5">
                <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-700" />
                  <span>{language === 'ku' ? 'نووسین و وردەکارییەکانی تایبەت بەم کلیلە:' : 'License Key Terms & Directives:'}</span>
                </span>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-amber-200">
                    <span className="font-extrabold text-slate-900 shrink-0">🏢 بۆ کۆمپانیا:</span>
                    <span className="text-slate-700 font-bold">{latestResult.clientHoldingName}</span>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-amber-200">
                    <span className="font-extrabold text-slate-900 shrink-0">⏱️ ماوەی کارایی:</span>
                    <span className="text-emerald-700 font-extrabold">{latestResult.durationLabelKu} ({latestResult.durationLabelEn})</span>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-amber-200">
                    <span className="font-extrabold text-slate-900 shrink-0">🔒 ئامێری بەستراو:</span>
                    <span className="font-mono text-slate-700 font-bold">{latestResult.clientHardwareFingerprint || 'گشتگیر (Universal Workstation)'}</span>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-amber-200">
                    <span className="font-extrabold text-slate-900 shrink-0">⚡ بەشە کراوەکان:</span>
                    <span className="text-blue-700 font-bold">تەواوی ٢١ بەش، میشی ناوخۆیی ئۆفلاین، و گۆڕەری Word ⇄ PDF</span>
                  </div>

                  <div className="bg-amber-100/70 p-2 rounded-xl border border-amber-300 text-[11px] text-amber-950 font-medium">
                    📌 <strong>ڕێنمایی نوێکردنەوەی مانگانە:</strong> کڕیار ناتوانێت ئەم کلیلە دەستکاری بکات یان خۆی دروستی بکات. سەرەتای هەر مانگێک لە ڕێگەی ئەم پۆڕتاڵەوە کلیلەکەی بۆ نوێ دەکرێتەوە دوای گەیشتنی پارەی بەشداری.
                  </div>
                </div>
              </div>

              {/* Action Buttons: Copy, WhatsApp, Print, Test Local */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Copy Key Button */}
                <button
                  type="button"
                  onClick={() => handleCopyKey(latestResult.licenseKey)}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? (language === 'ku' ? 'کۆپیکرا' : 'Copied') : (language === 'ku' ? 'کۆپی کلیل' : 'Copy Key')}</span>
                </button>

                {/* Print Certificate Button */}
                <button
                  type="button"
                  onClick={() => handlePrintCertificate(latestResult)}
                  className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'ku' ? 'چاپکردنی بڕوانامە' : 'Print Certificate'}</span>
                </button>

                {/* Copy WhatsApp Dispatch */}
                <button
                  type="button"
                  onClick={() => {
                    const msg = dispatchLang === 'ku'
                      ? latestResult.dispatchMessageKu
                      : dispatchLang === 'ar'
                      ? latestResult.dispatchMessageAr
                      : latestResult.dispatchMessageEn;
                    handleCopyDispatch(msg);
                  }}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedDispatch ? <Check className="w-3.5 h-3.5 text-white" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{copiedDispatch ? (language === 'ku' ? 'نامەکە کۆپیکرا' : 'Copied') : (language === 'ku' ? 'کۆپی نامەی واتسئەپ' : 'Copy WhatsApp Msg')}</span>
                </button>

                {/* Test on this machine */}
                <button
                  type="button"
                  onClick={() => handleApplyToThisMachine(latestResult.licenseKey, latestResult.clientHoldingName)}
                  className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Test and apply key immediately on this computer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'ku' ? 'تاقیکردنەوە لێرە' : 'Apply Locally'}</span>
                </button>
              </div>

              {testLocalFeedback && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{testLocalFeedback}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* =========================================================================
            SECTION 2: SUBSCRIBERS DATABASE & 1-CLICK MONTHLY RENEWAL TABLE (7 Columns)
        ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>{language === 'ku' ? 'تۆماری بەشداربووان و نوێکردنەوەی مانگانە' : 'Client Subscribers Registry & Monthly Renewals'}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === 'ku' ? 'بەڕێوەبردنی کڕیاران و نوێکردنەوەی مانگانەی لایسنس بە ١ کرتە' : 'Manage client entities and perform 1-click recurring renewals'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'ku' ? 'تۆمارکردنی کڕیاری نوێ' : 'Add Client'}</span>
              </button>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'ku' ? 'گەڕان بەدوای کۆمپانیا، ناوی کڕیار، یان کلیل...' : 'Search by holding, contact, or key...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'ku' ? 'هەموو' : 'All'} ({subscribers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'ku' ? 'چالاک' : 'Active'} ({activeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('EXPIRING')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'EXPIRING' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'ku' ? '٧ ڕۆژ' : '<7d'} ({expiringCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('OVERDUE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === 'OVERDUE' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'ku' ? 'بەسەرچوو' : 'Overdue'} ({overdueCount})
                </button>
              </div>
            </div>

            {/* Subscribers Table */}
            <div className="space-y-3">
              {filteredSubscribers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {language === 'ku' ? 'هیچ کڕیارێک نەدۆزرایەوە بەم مەرجانە.' : 'No client records found matching search filters.'}
                </div>
              ) : (
                filteredSubscribers.map((client) => {
                  const daysRemaining = getRemainingTrialDays(client.expiresAt);
                  const isExpired = daysRemaining <= 0;
                  const isExpiringSoon = !isExpired && daysRemaining <= 7;

                  return (
                    <div
                      key={client.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isExpired
                          ? 'bg-rose-50/60 border-rose-300'
                          : isExpiringSoon
                          ? 'bg-amber-50/70 border-amber-300'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        
                        {/* Company Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900">
                              {client.holdingName}
                            </span>
                            
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              client.planTier === 'VIP_OWNER_GIFT'
                                ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                                : client.planTier === 'COMMERCIAL_1Y'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {client.planTier === 'COMMERCIAL_1M'
                                ? 'مانگانە (١M)'
                                : client.planTier === 'COMMERCIAL_6M'
                                ? '٦ مانگە'
                                : client.planTier === 'COMMERCIAL_1Y'
                                ? '١ ساڵە'
                                : 'VIP هەمیشەیی'}
                            </span>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isExpired
                                ? 'bg-rose-600 text-white'
                                : isExpiringSoon
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isExpired
                                ? 'بەسەرچووە'
                                : isExpiringSoon
                                ? `${daysRemaining} ڕۆژی ماوە`
                                : `${daysRemaining} ڕۆژ کارایە`}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                            <span>👤 {client.contactName}</span>
                            <span>📞 {client.contactPhone}</span>
                            <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-[10px] text-slate-700">
                              Node: {client.hardwareFingerprint}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] text-slate-400 font-bold">کلیل:</span>
                            <span className="font-mono text-xs font-bold text-slate-800 select-all bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {client.activeLicenseKey}
                            </span>
                          </div>
                        </div>

                        {/* Renewal Action Buttons */}
                        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 flex-wrap sm:flex-nowrap">
                          {/* CRITICAL: 1-Click Monthly Renewal Button */}
                          <button
                            type="button"
                            onClick={() => handleRenewClientMonthly(client)}
                            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm shadow-emerald-600/30"
                            title={language === 'ku' ? 'نوێکردنەوەی لایسنس بۆ مانگی داهاتوو بە ١ کرتە' : 'Renew license for next month in 1 click'}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{language === 'ku' ? '⚡ نوێکردنەوە بۆ مانگی داهاتوو' : '⚡ Renew for 1 Month'}</span>
                          </button>

                          {/* Copy Key */}
                          <button
                            type="button"
                            onClick={() => handleCopyKey(client.activeLicenseKey)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Copy License Key"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Certificate */}
                          <button
                            type="button"
                            onClick={() => {
                              openLicenseCertificatePrintView({
                                licenseKey: client.activeLicenseKey,
                                clientHoldingName: client.holdingName,
                                tierLabelKu: client.planTier === 'COMMERCIAL_1M' ? 'لایسنسی مانگانە' : 'لایسنسی بازرگانی',
                                tierLabelEn: 'Commercial Enterprise',
                                durationLabelKu: '٣٠ ڕۆژ (نوێکراوەی مانگانە)',
                                durationLabelEn: '30 Days Renewal',
                                hardwareFingerprint: client.hardwareFingerprint,
                                createdAt: new Date().toISOString()
                              });
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Print Official Certificate"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>

      {/* =========================================================================
          ADD NEW CLIENT MODAL
      ========================================================================= */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-sm text-slate-900">
                  {language === 'ku' ? 'تۆمارکردنی کڕیاری نوێ لە سیستەم' : 'Register New Client Subscriber'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewClientSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">ناوی هۆڵدینگ / کۆمپانیا: *</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Zagros Construction Holding"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">ناوی بەرپرس:</label>
                  <input
                    type="text"
                    value={newClientContact}
                    onChange={(e) => setNewClientContact(e.target.value)}
                    placeholder="ئەندازیار هیوا ڕەحمان"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">مۆبایل:</label>
                  <input
                    type="text"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+964 750 123 4567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">ئیمەیڵ:</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="hiwa@zagros.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 block">ناسنامەی ئامێر (Node ID):</label>
                  <input
                    type="text"
                    value={newClientHw}
                    onChange={(e) => setNewClientHw(e.target.value)}
                    placeholder="SAS-NODE-XXXX-XXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">پلانی لایسنس:</label>
                <select
                  value={newClientTier}
                  onChange={(e: any) => setNewClientTier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="COMMERCIAL_1M">⚡ بازرگانی مانگانە (٣٠ ڕۆژ - نوێکردنەوە)</option>
                  <option value="COMMERCIAL_6M">🏢 بازرگانی ٦ مانگە (١٨٠ ڕۆژ)</option>
                  <option value="COMMERCIAL_1Y">💼 بازرگانی ساڵانە (٣٦٥ ڕۆژ)</option>
                  <option value="VIP_OWNER_GIFT">👑 VIP خاوەن (هەمیشەیی بێسنوور)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-black transition cursor-pointer shadow-sm"
                >
                  تۆمارکردن و دروستکردنی کلیل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
