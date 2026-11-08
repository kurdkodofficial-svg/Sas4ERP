import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useERP } from '../../context/ERPContext';
import {
  HardwareAssetRecord,
  HardwareDeviceType,
  HardwareOperationalStatus,
  SiteHardwareSummary,
  HardwareMaintenanceRecord
} from '../../types/itAssetTracking';
import { BatchExportQrModal } from './BatchExportQrModal';
import { RealtimeCameraQrScannerModal } from './RealtimeCameraQrScannerModal';
import {
  Server,
  QrCode,
  Radio,
  Cpu,
  Search,
  Filter,
  Plus,
  Printer,
  Scan,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  ArrowRightLeft,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Phone,
  HardDrive,
  Wifi,
  Eye,
  Sliders,
  Sparkles,
  Download,
  CalendarClock,
  Calendar,
  FileDown,
  Camera,
  LogOut,
  LogIn,
  FileText
} from 'lucide-react';

export const HardwareAssetTrackingView: React.FC = () => {
  const { language } = useLanguage();
  const { projects } = useERP();

  // State
  const [assets, setAssets] = useState<HardwareAssetRecord[]>([]);
  const [summary, setSummary] = useState<{ kpis: any; sites: SiteHardwareSummary[] } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modals
  const [stickerModalAsset, setStickerModalAsset] = useState<HardwareAssetRecord | null>(null);
  const [scannerModalOpen, setScannerModalOpen] = useState<boolean>(false);
  const [cameraScannerModalOpen, setCameraScannerModalOpen] = useState<boolean>(false);
  const [registerModalOpen, setRegisterModalOpen] = useState<boolean>(false);
  const [relocateModalAsset, setRelocateModalAsset] = useState<HardwareAssetRecord | null>(null);
  const [actionNotice, setActionNotice] = useState<{ ku: string; en: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Scanner State
  const [scanInputText, setScanInputText] = useState<string>('');
  const [scanVerificationResult, setScanVerificationResult] = useState<any | null>(null);
  const [scanSelectedSite, setScanSelectedSite] = useState<string>('proj-1');

  // Relocation Form State
  const [relocateTargetSite, setRelocateTargetSite] = useState<string>('proj-2');
  const [relocateReason, setRelocateReason] = useState<string>('Operational hardware redeployment');
  const [relocateTechName, setRelocateTechName] = useState<string>('Lead Systems Engineer');

  // New Asset Form State
  const [newDeviceType, setNewDeviceType] = useState<HardwareDeviceType>('GATE_SCANNER');
  const [newModel, setNewModel] = useState<string>('');
  const [newManufacturer, setNewManufacturer] = useState<string>('Hikvision');
  const [newSerialNumber, setNewSerialNumber] = useState<string>('');
  const [newMacAddress, setNewMacAddress] = useState<string>('');
  const [newIpAddress, setNewIpAddress] = useState<string>('');
  const [newAssignedSiteId, setNewAssignedSiteId] = useState<string>('proj-1');
  const [newLocationRoom, setNewLocationRoom] = useState<string>('');
  const [newTechnician, setNewTechnician] = useState<string>('Diyar Nawzad');
  const [newTechPhone, setNewTechPhone] = useState<string>('+964 750 123 4567');
  const [newSpecsKu, setNewSpecsKu] = useState<string>('');
  const [newSpecsEn, setNewSpecsEn] = useState<string>('');
  const [newPowerWatts, setNewPowerWatts] = useState<number>(100);

  // Maintenance & Batch Export State
  const [maintenanceRecords, setMaintenanceRecords] = useState<HardwareMaintenanceRecord[]>([]);
  const [batchExportModalOpen, setBatchExportModalOpen] = useState<boolean>(false);
  const [upcomingFilterOnly, setUpcomingFilterOnly] = useState<boolean>(false);

  // Fetch assets, summary & maintenance records
  const fetchAssetsData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [assetsRes, summaryRes, maintenanceRes] = await Promise.all([
        fetch('/api/it-assets'),
        fetch('/api/it-assets/summary'),
        fetch('/api/it-maintenance')
      ]);

      if (assetsRes.ok && assetsRes.headers.get('content-type')?.includes('application/json')) {
        const data = await assetsRes.json();
        if (data.assets) setAssets(data.assets);
      }

      if (summaryRes.ok && summaryRes.headers.get('content-type')?.includes('application/json')) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }

      if (maintenanceRes.ok && maintenanceRes.headers.get('content-type')?.includes('application/json')) {
        const mntData = await maintenanceRes.json();
        if (mntData.records) setMaintenanceRecords(mntData.records);
      }
    } catch (err) {
      console.error('Failed to load IT assets:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssetsData();
  }, []);

  // Map of hardware assets with upcoming maintenance in next 30 days
  const upcomingMaintenanceMap = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const map = new Map<string, { date: string; days: number; isOverdue: boolean; ticket?: HardwareMaintenanceRecord; priority: string }>();

    assets.forEach(asset => {
      const matchingTickets = maintenanceRecords.filter(m =>
        (m.assetId === asset.id || m.assetTag === asset.assetTag) &&
        (m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS' || m.status === 'OVERDUE')
      );

      const ticket = matchingTickets.find(m => {
        if (!m.scheduledDate) return false;
        const target = new Date(m.scheduledDate);
        target.setHours(0, 0, 0, 0);
        const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diff >= -30 && diff <= 30;
      });

      let inspectionDate = '';
      let inspectionDiff = 0;
      let inspectionDueSoon = false;
      if (asset.nextInspectionDueDate) {
        const d = new Date(asset.nextInspectionDueDate);
        d.setHours(0, 0, 0, 0);
        inspectionDiff = Math.round((d.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (inspectionDiff >= -15 && inspectionDiff <= 30) {
          inspectionDueSoon = true;
          inspectionDate = asset.nextInspectionDueDate;
        }
      }

      if (ticket || inspectionDueSoon || asset.status === 'MAINTENANCE_REQUIRED') {
        const dateStr = ticket?.scheduledDate || inspectionDate || 'Next 30 Days';
        let days = 0;
        let isOverdue = false;
        if (ticket?.scheduledDate) {
          const tDate = new Date(ticket.scheduledDate);
          days = Math.round((tDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
          if (days < 0 || ticket.status === 'OVERDUE') isOverdue = true;
        } else if (inspectionDueSoon) {
          days = inspectionDiff;
          if (days < 0) isOverdue = true;
        }

        map.set(asset.id, {
          date: dateStr,
          days,
          isOverdue,
          ticket,
          priority: ticket?.priority || (asset.status === 'MAINTENANCE_REQUIRED' ? 'HIGH' : 'MEDIUM')
        });
      }
    });

    return map;
  }, [assets, maintenanceRecords]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      if (selectedSiteFilter !== 'ALL' && asset.assignedSiteId !== selectedSiteFilter && asset.assignedSiteCode !== selectedSiteFilter) {
        return false;
      }
      if (selectedTypeFilter !== 'ALL' && asset.deviceType !== selectedTypeFilter) {
        return false;
      }
      if (selectedStatusFilter !== 'ALL' && asset.status !== selectedStatusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTag = asset.assetTag.toLowerCase().includes(q);
        const matchesModel = asset.model.toLowerCase().includes(q);
        const matchesSerial = asset.serialNumber.toLowerCase().includes(q);
        const matchesIp = asset.ipAddress.toLowerCase().includes(q);
        const matchesSite = asset.assignedSiteNameEn.toLowerCase().includes(q) || asset.assignedSiteNameKu.includes(q);
        const matchesTech = asset.assignedTechnician.toLowerCase().includes(q);
        if (!matchesTag && !matchesModel && !matchesSerial && !matchesIp && !matchesSite && !matchesTech) {
          return false;
        }
      }
      if (upcomingFilterOnly && !upcomingMaintenanceMap.has(asset.id)) {
        return false;
      }
      return true;
    });
  }, [assets, selectedSiteFilter, selectedTypeFilter, selectedStatusFilter, searchQuery, upcomingFilterOnly, upcomingMaintenanceMap]);

  // Project sites list
  const siteOptions = useMemo(() => {
    const defaultSites = [
      { id: 'proj-1', code: 'ZONE-EBL-HQ', nameEn: 'Skyline Towers Erbil HQ Hub', nameKu: 'سەرۆکایەتی هۆڵدینگ (هەولێر - ناوەند)' },
      { id: 'proj-2', code: 'ZONE-NJF-CMT', nameEn: 'Najaf Cement Manufacturing Plant', nameKu: 'کارگەی بەرهەمهێنانی چیمەنتۆی نەجەف' },
      { id: 'proj-3', code: 'ZONE-HLB-PRJ', nameEn: 'Halabja Branch Office & Central Warehouse', nameKu: 'لقی هەڵەبجە و کۆگای دابەشکردنی پارێزگا' },
      { id: 'proj-4', code: 'ZONE-ZKH-DPT', nameEn: 'Zakho Border Logistics & Customs Depot', nameKu: 'کۆگای گومرگی و لۆجستی نێودەوڵەتی زاخۆ' },
      { id: 'proj-5', code: 'ZONE-SUL-DST', nameEn: 'Sulaymaniyah Distribution & Logistics Hub', nameKu: 'مەڵبەندی لۆجستی و گەنجینەکانی سلێمانی' },
      { id: 'proj-6', code: 'ZONE-BGD-HUB', nameEn: 'Baghdad Commercial Liaison & Gateway', nameKu: 'لقی بازرگانی و هەماهەنگی بەغدا' },
      { id: 'proj-7', code: 'ZONE-DHK-WH', nameEn: 'Duhok Regional Warehouse & Distribution', nameKu: 'کۆگای هەرێمی دهۆک و دابەشکردنی باکوور' }
    ];

    if (projects && projects.length > 0) {
      return defaultSites;
    }
    return defaultSites;
  }, [projects]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle register new hardware
  const handleRegisterNewAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.trim() || !newSerialNumber.trim()) return;

    const chosenSite = siteOptions.find(s => s.id === newAssignedSiteId) || siteOptions[0];

    try {
      const res = await fetch('/api/it-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceType: newDeviceType,
          model: newModel,
          manufacturer: newManufacturer,
          serialNumber: newSerialNumber,
          macAddress: newMacAddress || '00:1A:2B:3C:4D:5E',
          ipAddress: newIpAddress || '192.168.1.100',
          assignedSiteId: chosenSite.id,
          assignedSiteCode: chosenSite.code,
          assignedSiteNameEn: chosenSite.nameEn,
          assignedSiteNameKu: chosenSite.nameKu,
          locationRoom: newLocationRoom || 'Main Equipment Rack',
          assignedTechnician: newTechnician,
          technicianPhone: newTechPhone,
          specsSummaryEn: newSpecsEn || 'Registered physical hardware asset unit',
          specsSummaryKu: newSpecsKu || 'یەکەی ئامێری تەکنیکی تۆمارکراو',
          powerSupplyWatts: newPowerWatts
        })
      });

      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setActionNotice({
          ku: data.messageKu || 'ئامێر بە سەرکەوتوویی لەگەڵ کۆدی QR تۆمارکرا.',
          en: data.messageEn || 'Asset registered with QR code successfully.'
        });
        setTimeout(() => setActionNotice(null), 4000);
        setRegisterModalOpen(false);
        // Reset form
        setNewModel('');
        setNewSerialNumber('');
        setNewMacAddress('');
        setNewIpAddress('');
        await fetchAssetsData(true);
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  // Handle relocate hardware
  const handleRelocateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relocateModalAsset) return;

    const chosenSite = siteOptions.find(s => s.id === relocateTargetSite) || siteOptions[0];

    try {
      const res = await fetch(`/api/it-assets/${relocateModalAsset.id}/relocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newSiteId: chosenSite.id,
          newSiteCode: chosenSite.code,
          newSiteNameEn: chosenSite.nameEn,
          newSiteNameKu: chosenSite.nameKu,
          reason: relocateReason,
          technicianName: relocateTechName
        })
      });

      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setActionNotice({
          ku: data.messageKu || 'شوێنی ئامێرەکە بە سەرکەوتوویی گۆڕدرا و بارکۆدی نوێ دروستکرا.',
          en: data.messageEn || 'Hardware relocated and QR code regenerated successfully.'
        });
        setTimeout(() => setActionNotice(null), 4000);
        setRelocateModalAsset(null);
        await fetchAssetsData(true);
      }
    } catch (err) {
      console.error('Relocation error:', err);
    }
  };

  // Handle Verify Scanned QR
  const handleVerifyScannedPayload = async (payloadToTest?: string) => {
    const rawPayload = payloadToTest || scanInputText;
    if (!rawPayload.trim()) return;

    const currentSite = siteOptions.find(s => s.id === scanSelectedSite);

    try {
      const res = await fetch('/api/it-assets/scan-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrPayloadString: rawPayload,
          currentSiteId: scanSelectedSite,
          currentSiteName: currentSite?.nameEn
        })
      });

      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setScanVerificationResult(data);
      }
    } catch (err) {
      console.error('QR verification error:', err);
    }
  };

  // Helper icons
  const getDeviceIcon = (type: HardwareDeviceType) => {
    switch (type) {
      case 'SERVER':
        return <Server className="w-4 h-4 text-indigo-600" />;
      case 'GATE_SCANNER':
        return <Scan className="w-4 h-4 text-emerald-600" />;
      case 'ROUTER_GATEWAY':
      case 'FIREWALL':
        return <Radio className="w-4 h-4 text-blue-600" />;
      case 'NETWORK_SWITCH':
        return <Sliders className="w-4 h-4 text-purple-600" />;
      default:
        return <Cpu className="w-4 h-4 text-slate-600" />;
    }
  };

  const getDeviceTypeBadge = (type: HardwareDeviceType) => {
    switch (type) {
      case 'SERVER':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
            <Server className="w-3 h-3" />
            Server
          </span>
        );
      case 'GATE_SCANNER':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <Scan className="w-3 h-3" />
            Gate Scanner
          </span>
        );
      case 'ROUTER_GATEWAY':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Radio className="w-3 h-3" />
            Router / SD-WAN
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
            {type}
          </span>
        );
    }
  };

  const getStatusBadge = (status: HardwareOperationalStatus) => {
    switch (status) {
      case 'OPERATIONAL_ACTIVE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </span>
        );
      case 'MAINTENANCE_REQUIRED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            Maintenance
          </span>
        );
      case 'STANDBY_BACKUP':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Standby
          </span>
        );
      case 'CHECKED_OUT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 shadow-2xs">
            <LogOut className="w-3 h-3 text-amber-600" />
            <span>{language === 'ku' ? 'دەرکراوە / لە دەستدایە' : 'Checked Out'}</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Summary */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-50/60 via-transparent to-transparent -mr-20 -mt-20 rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{language === 'ku' ? 'چاودێری و تۆماری ئامێرەکان بە بارکۆدی QR' : 'Hardware Asset Tracking & QR Mapping'}</span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    ERP Seal Verified
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'ku'
                    ? 'بەستنەوە و نەخشاندنی ئامێرە فیزیاییەکان (سێرڤەر، سکێنەری دەروازە، ڕاوتەرەکان) بۆ پڕۆژە دیاریکراوەکان لە ڕێگەی کۆدی QR ی دروستکراوی سیستەمی ERP'
                    : 'Mapping physical hardware units (servers, gate scanners, routers) to specific project sites using cryptographic QR codes generated by the ERP.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Real-time Camera QR Scanner & Asset Check-out */}
            <button
              onClick={() => setCameraScannerModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/30"
              title={
                language === 'ku'
                  ? 'پشکنەری ڕاستەوخۆی کامێرا بۆ خوێندنەوەی QR و دەرکردنی ئامێر لە کۆگا'
                  : 'Real-Time Camera QR Scanner & Inventory Checkout'
              }
              id="camera-qr-scanner-btn"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <Camera className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'کامێرای سکانی ڕاستەوخۆ (Check-out)' : 'Live Camera QR Scanner'}</span>
            </button>

            <button
              onClick={() => {
                setScanInputText('');
                setScanVerificationResult(null);
                setScannerModalOpen(true);
              }}
              className="px-3 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Manual / Emulated QR Code Scanner"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'سکانی مەیدانی' : 'Field Scanner'}</span>
            </button>

            {/* Batch Export QR Sheet Button for Upcoming 30-Day Maintenance */}
            <button
              onClick={() => setBatchExportModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-amber-600/20"
              title={
                language === 'ku'
                  ? 'هەناردەکردنی بەکۆمەڵی پەڕەی بارکۆدی QR بۆ ئامێرەکانی چاککردنەوەی ٣٠ ڕۆژە'
                  : 'Batch Export QR Code Sheet for hardware marked with upcoming 30-day maintenance'
              }
              id="batch-export-qr-btn"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'هەناردەی بەکۆمەڵ (PDF)' : 'Batch Export'}</span>
              {upcomingMaintenanceMap.size > 0 && (
                 <span className="px-1.5 py-0.2 rounded-full bg-amber-950/40 text-amber-100 text-[10px] font-mono font-bold">
                   {upcomingMaintenanceMap.size}
                 </span>
              )}
            </button>

            {/* Trilingual Word User Manual Button */}
            <button
              onClick={async () => {
                const { generateEnterpriseUserManualDocx } = await import('../../utils/userManualDocxGenerator');
                const blob = await generateEnterpriseUserManualDocx();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `SAS_Holding_ERP_User_Manual_Trilingual_2026.docx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setActionNotice({
                  ku: 'فایلی وۆردی ڕێبەری بەکارهێنان بە سەرکەوتوویی دابەزێنرا!',
                  en: 'Trilingual Word User Manual downloaded successfully!'
                });
                setTimeout(() => setActionNotice(null), 6000);
              }}
              className="px-3.5 py-2 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-blue-700/20"
              title={
                language === 'ku'
                  ? 'داگرتنی فایلی وۆردی ڕێبەری بەکارهێنانی سیستەم بە سێ زمان (کوردی • English • العربية)'
                  : 'Download Trilingual System User Manual in Microsoft Word format (.docx)'
              }
              id="download-manual-docx-asset-btn"
            >
              <FileText className="w-3.5 h-3.5 text-blue-200" />
              <span>{language === 'ku' ? 'فایلی وۆردی ڕێبەر' : 'Word Manual (.docx)'}</span>
            </button>

            <button
              onClick={() => setRegisterModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'تۆمارکردنی ئامێری نوێ' : 'Register Hardware'}</span>
            </button>

            <button
              onClick={() => fetchAssetsData(false)}
              disabled={isRefreshing}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer disabled:opacity-50"
              title="Refresh Asset Registry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Action Notice */}
        {actionNotice && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs text-indigo-900 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold">{language === 'ku' ? actionNotice.ku : actionNotice.en}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-indigo-400 hover:text-indigo-700 font-bold">×</button>
          </div>
        )}

        {/* Fleet Asset KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
          {/* Total Units */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'کۆی ئامێرە تۆمارکراوەکان' : 'Total Tracked Assets'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {summary?.kpis.totalAssets ?? assets.length}
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                QR Mapped
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              {summary?.kpis.totalSitesMapped ?? 7} Project Sites
            </span>
          </div>

          {/* Servers */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'سێرڤەرە سەرەکییەکان' : 'Physical Servers'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-900">
                {summary?.kpis.serversCount ?? 3}
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                Rack & Micro
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Dell, HPE & Supermicro
            </span>
          </div>

          {/* Gate Scanners */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'سکێنەرەکانی دەروازە' : 'Gate Scanners & ANPR'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-900">
                {summary?.kpis.gateScannersCount ?? 4}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                Optical Check
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Turnstiles & License OCR
            </span>
          </div>

          {/* Routers & SD-WAN */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'ڕاوتەر و گەیتوەیەکان' : 'Routers & Gateways'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-900">
                {summary?.kpis.routersCount ?? 7}
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                Fiber & LTE
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Cisco, MikroTik & Fortinet
            </span>
          </div>

          {/* Operational Status */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200/90 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'ڕەوشی ئیشکردن' : 'Operational Status'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-800">
                100%
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {summary?.kpis.operationalCount ?? assets.length} Active
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              0 Maintenance Flagged
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {/* Search box */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ku' ? 'گەڕان بەپێی تاگی ئامێر، مۆدێل، سێریاڵ...' : 'Search by asset tag, model, serial, IP...'}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* Project Site Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
            >
              <option value="ALL">{language === 'ku' ? 'سەرجەم پڕۆژە و لقەکان' : 'All Project Sites'}</option>
              {siteOptions.map(s => (
                <option key={s.id} value={s.id}>
                  {language === 'ku' ? s.nameKu : s.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Device Type Selector */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedTypeFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedTypeFilter('SERVER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedTypeFilter === 'SERVER'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              <Server className="w-3 h-3" />
              Servers
            </button>
            <button
              onClick={() => setSelectedTypeFilter('GATE_SCANNER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedTypeFilter === 'GATE_SCANNER'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              <Scan className="w-3 h-3" />
              Gate Scanners
            </button>
            <button
              onClick={() => setSelectedTypeFilter('ROUTER_GATEWAY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedTypeFilter === 'ROUTER_GATEWAY'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
              }`}
            >
              <Radio className="w-3 h-3" />
              Routers
            </button>

            {/* Upcoming 30D Maintenance Filter */}
            <button
              onClick={() => setUpcomingFilterOnly(!upcomingFilterOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                upcomingFilterOnly
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>{language === 'ku' ? 'چاککردنەوەی ٣٠ ڕۆژە' : 'Upcoming 30D Maintenance'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${upcomingFilterOnly ? 'bg-amber-800 text-white' : 'bg-amber-200/80 text-amber-900'}`}>
                {upcomingMaintenanceMap.size}
              </span>
            </button>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500 self-end md:self-auto">
          {filteredAssets.length} Units Matching
        </span>
      </div>

      {/* Hardware Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-3xl p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between space-y-4"
          >
            {/* Header: Tag + Device Type badge + Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white tracking-wider">
                    {asset.assetTag}
                  </span>
                  {getDeviceTypeBadge(asset.deviceType)}
                </div>
                {getStatusBadge(asset.status)}
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-1" title={asset.model}>
                  {asset.model}
                </h3>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {asset.manufacturer} • SN: <span className="font-mono font-semibold text-slate-700">{asset.serialNumber}</span>
                </span>
              </div>

              {/* Upcoming Maintenance Badge if marked within next 30 days */}
              {upcomingMaintenanceMap.has(asset.id) && (
                <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CalendarClock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">
                      {language === 'ku'
                        ? `چاککردنەوە: ${upcomingMaintenanceMap.get(asset.id)?.date}`
                        : `Maintenance: ${upcomingMaintenanceMap.get(asset.id)?.date}`}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                      upcomingMaintenanceMap.get(asset.id)?.isOverdue
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-200/80 text-amber-900'
                    }`}
                  >
                    {upcomingMaintenanceMap.get(asset.id)?.isOverdue
                      ? (language === 'ku' ? 'دواکەوتووە' : 'Overdue')
                      : (language === 'ku' ? 'نزیکە' : 'Due Soon')}
                  </span>
                </div>
              )}
            </div>

            {/* Middle Section: QR Code preview + Site Mapping info */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-center gap-3.5">
              {/* QR Preview (Clickable to open printable sticker) */}
              <div
                onClick={() => setStickerModalAsset(asset)}
                className="w-20 h-20 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs shrink-0 cursor-pointer group relative overflow-hidden flex items-center justify-center"
                title="Click to view full printable QR Asset Tag"
              >
                {asset.qrCodeDataUrl ? (
                  <img
                    src={asset.qrCodeDataUrl}
                    alt={asset.assetTag}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode className="w-10 h-10 text-slate-400" />
                )}
                <div className="absolute inset-0 bg-indigo-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[9px] font-bold">
                  Print QR
                </div>
              </div>

              {/* Site Assignment Details */}
              <div className="space-y-1 text-xs min-w-0 flex-1">
                <div className="flex items-center gap-1 text-indigo-700 font-extrabold text-[11px] truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{language === 'ku' ? asset.assignedSiteNameKu : asset.assignedSiteNameEn}</span>
                </div>
                <p className="text-[11px] text-slate-600 truncate font-medium">
                  {asset.locationRoom}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                  <span className="font-mono text-slate-700 font-bold">{asset.ipAddress}</span>
                  <span>•</span>
                  <span>{asset.powerSupplyWatts}W</span>
                </div>
              </div>
            </div>

            {/* Technical Specs & Technician */}
            <div className="space-y-1 text-xs">
              {asset.status === 'CHECKED_OUT' && asset.currentCheckout && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1 text-amber-800">
                      <LogOut className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === 'ku' ? 'دەرکراوە بۆ پشکنین/بەکارھێنان:' : 'Checked out to:'}</span>
                    </span>
                    <span className="font-mono text-[10px] text-amber-700">{asset.currentCheckout.checkedOutDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-amber-800">
                    <span className="font-bold">{asset.currentCheckout.technicianName} ({asset.currentCheckout.technicianPhone})</span>
                    <span>{asset.currentCheckout.targetSiteName}</span>
                  </div>
                  <p className="text-[10px] text-amber-700 italic truncate">
                    {asset.currentCheckout.purpose}: {asset.currentCheckout.notes || 'No extra notes'}
                  </p>
                </div>
              )}

              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                {language === 'ku' ? asset.specsSummaryKu : asset.specsSummaryEn}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1 truncate max-w-[170px]">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{asset.assignedTechnician}</span>
                </span>
                <span className="font-mono">
                  Audit: {asset.lastAuditDate}
                </span>
              </div>
            </div>

            {/* Card Footer: Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
              <button
                onClick={() => setStickerModalAsset(asset)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="View & Print QR Sticker Label"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'ku' ? 'چاپی لەزگەی QR' : 'Print Sticker'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setRelocateModalAsset(asset);
                    setRelocateTargetSite(asset.assignedSiteId === 'proj-1' ? 'proj-2' : 'proj-1');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Relocate to another project site"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>{language === 'ku' ? 'گواستنەوە' : 'Relocate'}</span>
                </button>

                <button
                  onClick={() => handleCopy(JSON.stringify(asset.qrPayload, null, 2), asset.id)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  title="Copy QR Payload JSON"
                >
                  {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal 1: Printable Hardware Asset Sticker */}
      {stickerModalAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {language === 'ku' ? 'لەزگەی فەرمی بارکۆدی ئامێر' : 'Official Hardware Asset Label'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Standard Industrial Format (2.5" x 3.5")
                  </span>
                </div>
              </div>
              <button
                onClick={() => setStickerModalAsset(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* The Physical Sticker Box (Optimized for thermal printer or physical printing) */}
            <div
              id="printable-asset-sticker"
              className="border-2 border-slate-900 rounded-2xl p-5 bg-white text-slate-900 space-y-4 shadow-sm"
            >
              {/* Sticker Corporate Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wider text-slate-900">
                    SAS HOLDING GROUP
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                    IT INFRASTRUCTURE ASSET
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-base font-black px-2.5 py-0.5 rounded bg-slate-900 text-white block">
                    {stickerModalAsset.assetTag}
                  </span>
                </div>
              </div>

              {/* Sticker Body: QR Code + Meta details */}
              <div className="flex items-center gap-4">
                <div className="w-36 h-36 border border-slate-300 p-1 rounded-xl bg-white shrink-0 flex items-center justify-center">
                  <img
                    src={stickerModalAsset.qrCodeDataUrl}
                    alt={stickerModalAsset.assetTag}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-1.5 text-xs flex-1">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Model & Device</span>
                    <strong className="font-black text-slate-900 text-xs block leading-tight">
                      {stickerModalAsset.model}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Serial Number</span>
                    <span className="font-mono font-bold text-slate-800 text-xs block">
                      {stickerModalAsset.serialNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Project Site</span>
                    <span className="font-extrabold text-indigo-700 text-xs block">
                      {stickerModalAsset.assignedSiteNameEn}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Location / Room</span>
                    <span className="text-slate-600 text-[11px] block truncate">
                      {stickerModalAsset.locationRoom}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sticker Footer Security Seal */}
              <div className="border-t-2 border-slate-900 pt-2 flex items-center justify-between text-[9px] font-mono font-semibold text-slate-600">
                <span>IP: {stickerModalAsset.ipAddress}</span>
                <span>MAC: {stickerModalAsset.macAddress}</span>
                <span>VERIFIED: {stickerModalAsset.installDate}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-mono">
                {stickerModalAsset.qrPayload?.digitalSecuritySeal}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const printContents = document.getElementById('printable-asset-sticker')?.innerHTML;
                    const originalContents = document.body.innerHTML;
                    if (printContents) {
                      window.print();
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'ku' ? 'چاپکردنی لەزگە' : 'Print Label Sticker'}</span>
                </button>
                <button
                  onClick={() => setStickerModalAsset(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {language === 'ku' ? 'داخستن' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Field QR Code Scanner & Checkpoint Verifier */}
      {scannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Scan className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {language === 'ku' ? 'پشکنەری مەیدانی کۆدی QR ی ئامێرەکان' : 'Field Hardware QR Code Verifier'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Verify physical hardware presence & authorized project site
                  </span>
                </div>
              </div>
              <button
                onClick={() => setScannerModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Checkpoint Site Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {language === 'ku' ? 'ئەم پشکنینە لە کام پڕۆژەیە ئەنجام دەدرێت؟' : 'Current Checkpoint Project Site:'}
              </label>
              <select
                value={scanSelectedSite}
                onChange={(e) => setScanSelectedSite(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none"
              >
                {siteOptions.map(s => (
                  <option key={s.id} value={s.id}>
                    {language === 'ku' ? s.nameKu : s.nameEn} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Test Simulation Quick Select */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>{language === 'ku' ? 'هەڵبژاردنی خێرای ئامێر بۆ تاقیکردنەوە:' : 'Quick Select Hardware to Test Scan:'}</span>
                <span className="text-[10px] text-slate-400">Simulates Camera Optical Capture</span>
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {assets.slice(0, 5).map(a => (
                  <button
                    key={a.id}
                    onClick={() => {
                      const payloadStr = JSON.stringify(a.qrPayload);
                      setScanInputText(payloadStr);
                      handleVerifyScannedPayload(payloadStr);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-mono font-bold text-slate-700 transition cursor-pointer shrink-0"
                  >
                    {a.assetTag}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea or Scanner Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {language === 'ku' ? 'ناوەڕۆکی کۆدی QR ی سکانکراو یان تاگی ئامێر:' : 'Scanned QR Code Payload or Asset Tag:'}
              </label>
              <textarea
                value={scanInputText}
                onChange={(e) => setScanInputText(e.target.value)}
                placeholder='{"assetTag":"SAS-HW-SCAN-201","serialNumber":"HIK-ANPR-99201D"...} or enter SAS-HW-SRV-101'
                rows={3}
                className="w-full p-3 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={() => handleVerifyScannedPayload()}
              className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'ku' ? 'پشکنین و بەراوردکردن' : 'Verify Hardware & Authorized Site'}</span>
            </button>

            {/* Verification Result Card */}
            {scanVerificationResult && (
              <div className={`p-4 rounded-2xl border transition animate-fadeIn space-y-3 ${
                scanVerificationResult.isSiteMatched
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-amber-50/70 border-amber-300'
              }`}>
                <div className="flex items-center gap-2">
                  {scanVerificationResult.isSiteMatched ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs">
                      {scanVerificationResult.isSiteMatched ? 'Authorized Hardware Presence' : 'Site Mismatch Warning'}
                    </h5>
                    <p className="text-[11px] text-slate-600">
                      {language === 'ku' ? scanVerificationResult.messageKu : scanVerificationResult.messageEn}
                    </p>
                  </div>
                </div>

                {scanVerificationResult.asset && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Asset Tag:</span>
                      <strong className="font-mono text-slate-800">{scanVerificationResult.asset.assetTag}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Model:</span>
                      <strong className="text-slate-800">{scanVerificationResult.asset.model}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Registered Site:</span>
                      <strong className="text-indigo-700">{scanVerificationResult.asset.assignedSiteNameEn}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">IP / MAC:</span>
                      <span className="font-mono text-slate-700">{scanVerificationResult.asset.ipAddress}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 3: Register New Hardware Asset Form */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {language === 'ku' ? 'تۆمارکردنی ئامێری تەکنیکی نوێ' : 'Register New Physical Hardware Asset'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Auto-generates cryptographic QR code asset tag
                  </span>
                </div>
              </div>
              <button
                onClick={() => setRegisterModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterNewAsset} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Device Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Device Type</label>
                  <select
                    value={newDeviceType}
                    onChange={(e) => setNewDeviceType(e.target.value as HardwareDeviceType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none"
                  >
                    <option value="SERVER">Server (Rack / Blade)</option>
                    <option value="GATE_SCANNER">Gate Scanner (ANPR / RFID Turnstile)</option>
                    <option value="ROUTER_GATEWAY">Router / SD-WAN Gateway</option>
                    <option value="FIREWALL">Firewall Appliance</option>
                    <option value="NETWORK_SWITCH">Managed Network Switch</option>
                    <option value="WEIGHBRIDGE_TERMINAL">Weighbridge Scale Terminal</option>
                    <option value="BIOMETRIC_ATTENDANCE">Biometric Attendance Scanner</option>
                  </select>
                </div>

                {/* Manufacturer */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Manufacturer</label>
                  <input
                    type="text"
                    value={newManufacturer}
                    onChange={(e) => setNewManufacturer(e.target.value)}
                    placeholder="Dell, Cisco, Hikvision, Dahua..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Model */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block">Model & Name</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="e.g. Hikvision DeepinView 4K ANPR License Scanner"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Serial Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Serial Number (SN)</label>
                  <input
                    type="text"
                    value={newSerialNumber}
                    onChange={(e) => setNewSerialNumber(e.target.value)}
                    placeholder="e.g. HIK-ANPR-99201D"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* MAC Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">MAC Address</label>
                  <input
                    type="text"
                    value={newMacAddress}
                    onChange={(e) => setNewMacAddress(e.target.value)}
                    placeholder="00:1A:2B:3C:4D:5E"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* IP Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">IP Address</label>
                  <input
                    type="text"
                    value={newIpAddress}
                    onChange={(e) => setNewIpAddress(e.target.value)}
                    placeholder="192.168.10.85"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Assigned Project Site */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Assigned Project Site</label>
                  <select
                    value={newAssignedSiteId}
                    onChange={(e) => setNewAssignedSiteId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none"
                  >
                    {siteOptions.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specific Room / Rack */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Specific Room / Gate</label>
                  <input
                    type="text"
                    value={newLocationRoom}
                    onChange={(e) => setNewLocationRoom(e.target.value)}
                    placeholder="e.g. Weighbridge Gate 2 Inbound Booth"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Technician & Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Assigned Lead Technician</label>
                  <input
                    type="text"
                    value={newTechnician}
                    onChange={(e) => setNewTechnician(e.target.value)}
                    placeholder="Eng. Alan Soran"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Hardware Specifications (English)</label>
                <input
                  type="text"
                  value={newSpecsEn}
                  onChange={(e) => setNewSpecsEn(e.target.value)}
                  placeholder="e.g. Dual-sensor 4K optical ANPR camera, laser strobe, PoE+ enabled"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Hardware Specifications (Kurdish)</label>
                <input
                  type="text"
                  value={newSpecsKu}
                  onChange={(e) => setNewSpecsKu(e.target.value)}
                  placeholder="تایبەتمەندی بە زمانی کوردی..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Generate QR & Register</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Relocate Hardware to Another Project Site */}
      {relocateModalAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {language === 'ku' ? 'گواستنەوەی ئامێر بۆ پڕۆژەیەکی تر' : 'Relocate Hardware Unit'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Regenerates QR code mapped to new site
                  </span>
                </div>
              </div>
              <button
                onClick={() => setRelocateModalAsset(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Asset being transferred:</span>
              <h4 className="font-black text-slate-900">{relocateModalAsset.model}</h4>
              <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                <span>Tag: {relocateModalAsset.assetTag}</span>
                <span>•</span>
                <span>Current Site: {relocateModalAsset.assignedSiteNameEn}</span>
              </div>
            </div>

            <form onSubmit={handleRelocateAsset} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'ku' ? 'پڕۆژەی نوێی مەبەست (New Destination Project Site):' : 'New Destination Project Site:'}
                </label>
                <select
                  value={relocateTargetSite}
                  onChange={(e) => setRelocateTargetSite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none"
                >
                  {siteOptions.filter(s => s.id !== relocateModalAsset.assignedSiteId).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nameEn} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'ku' ? 'هۆکاری گواستنەوە (Reason for Relocation):' : 'Reason for Relocation:'}
                </label>
                <input
                  type="text"
                  value={relocateReason}
                  onChange={(e) => setRelocateReason(e.target.value)}
                  placeholder="e.g. Scheduled site expansion or hardware replacement"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'ku' ? 'ئەندازیاری سەرپەرشتیار (Authorizing Technician):' : 'Authorizing Technician:'}
                </label>
                <input
                  type="text"
                  value={relocateTechName}
                  onChange={(e) => setRelocateTechName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRelocateModalAsset(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Execute Relocation & Regenerate QR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Batch Export QR Code PDF Sheet (Upcoming 30-Day Maintenance) */}
      <BatchExportQrModal
        isOpen={batchExportModalOpen}
        onClose={() => setBatchExportModalOpen(false)}
        assets={assets}
        maintenanceRecords={maintenanceRecords}
        onExportSuccess={(msg) => {
          setActionNotice(msg);
          setTimeout(() => setActionNotice(null), 6000);
        }}
      />

      {/* Modal 6: Real-Time Camera QR Code Scanner & Inventory Checkout */}
      <RealtimeCameraQrScannerModal
        isOpen={cameraScannerModalOpen}
        onClose={() => setCameraScannerModalOpen(false)}
        siteOptions={siteOptions}
        onAssetUpdated={() => {
          fetchAssetsData(true);
        }}
        onNotify={(msg) => {
          setActionNotice(msg);
          setTimeout(() => setActionNotice(null), 7000);
        }}
      />
    </div>
  );
};
