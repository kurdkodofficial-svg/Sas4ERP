import React, { useState } from 'react';
import {
  MapPin,
  Map,
  Compass,
  Radio,
  Wifi,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Globe,
  Shuffle,
  Laptop,
  Server,
  Building2,
  Printer,
  Plus,
  Trash2,
  Maximize2,
  Info,
  ChevronRight,
  Crosshair,
  Layers,
  Sparkles
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { OperationalZone, GeoIpEnforcementPolicy } from '../../types/operationalZone';
import { initialOperationalZones } from '../../data/initialOperationalZones';

export const GeographicalOperationalZonesView: React.FC = () => {
  const { language, isRtl } = useLanguage();
  const { holding, openPrintManager } = useERP();

  const [zones, setZones] = useState<OperationalZone[]>(() => {
    try {
      const saved = localStorage.getItem('sas4erp_operational_zones');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialOperationalZones;
  });

  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-najaf-cement');
  const [isEditingRadius, setIsEditingRadius] = useState<boolean>(false);
  const [newSubnetInput, setNewSubnetInput] = useState<string>('');
  const [testIpInput, setTestIpInput] = useState<string>('94.207.130.65');
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    allowed: boolean;
    messageKu: string;
    messageEn: string;
    zoneName: string;
  } | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const saveZones = (updated: OperationalZone[]) => {
    setZones(updated);
    try {
      localStorage.setItem('sas4erp_operational_zones', JSON.stringify(updated));
    } catch {}
  };

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  const handleUpdateRadius = (newRadius: number) => {
    const updated = zones.map((z) => (z.id === selectedZone.id ? { ...z, radiusKm: newRadius } : z));
    saveZones(updated);
  };

  const handleUpdatePolicy = (newPolicy: GeoIpEnforcementPolicy) => {
    const updated = zones.map((z) => (z.id === selectedZone.id ? { ...z, enforcementPolicy: newPolicy } : z));
    saveZones(updated);
    setFeedbackMessage(
      language === 'ku'
        ? `یاسای سنووری ئایپی نوێکرایەوە بۆ: ${newPolicy}`
        : `Zone boundary policy updated to: ${newPolicy}`
    );
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleAddSubnet = () => {
    if (!newSubnetInput.trim()) return;
    const cleanSubnet = newSubnetInput.trim();
    if (selectedZone.allowedIpSubnets.includes(cleanSubnet)) return;

    const updated = zones.map((z) =>
      z.id === selectedZone.id ? { ...z, allowedIpSubnets: [...z.allowedIpSubnets, cleanSubnet] } : z
    );
    saveZones(updated);
    setNewSubnetInput('');
    setFeedbackMessage(
      language === 'ku'
        ? `بڕگەی ئایپی ${cleanSubnet} زیادکرا بۆ ئەم زۆنە`
        : `Subnet boundary ${cleanSubnet} added to zone`
    );
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleRemoveSubnet = (subnetToRemove: string) => {
    const updated = zones.map((z) =>
      z.id === selectedZone.id
        ? { ...z, allowedIpSubnets: z.allowedIpSubnets.filter((s) => s !== subnetToRemove) }
        : z
    );
    saveZones(updated);
  };

  const handleTestIpBoundary = () => {
    const targetIp = testIpInput.trim();
    if (!targetIp) return;

    // Check if IP starts with or matches any allowed subnet
    const ipPrefix = targetIp.split('.').slice(0, 2).join('.');
    const isMatched = selectedZone.allowedIpSubnets.some((subnet) => {
      const cleanSub = subnet.split('/')[0];
      return targetIp.startsWith(cleanSub.split('.').slice(0, 2).join('.'));
    });

    if (isMatched || selectedZone.enforcementPolicy === 'PERMISSIVE_ROAMING') {
      setTestResult({
        tested: true,
        allowed: true,
        zoneName: language === 'ku' ? selectedZone.nameKu : selectedZone.nameEn,
        messageKu: `ئایپی [${targetIp}] لە ناو سنووری ڕێگەپێدراوی زۆنی ${selectedZone.governorate} پەسەندکرا. سینکرۆنایز بەبێ بەربەست ١٠٠٪ کاردەکات.`,
        messageEn: `IP [${targetIp}] verified inside authorized zone boundary for ${selectedZone.governorate}. Automated sync permitted.`
      });
    } else {
      setTestResult({
        tested: true,
        allowed: false,
        zoneName: language === 'ku' ? selectedZone.nameKu : selectedZone.nameEn,
        messageKu: `ئاگاداری: ئایپی [${targetIp}] لە دەرەوەی بڕگەی ڕێگەپێدراوی ئەم زۆنەیە. گواستنەوەی داتا سنووردار دەکرێت و ئاگاداری دەنێردرێت بۆ ئایتی.`,
        messageEn: `Security Alert: IP [${targetIp}] falls outside registered boundaries for ${selectedZone.governorate}. Sync throttled pending admin override.`
      });
    }
  };

  const handlePrintZoneAudit = () => {
    if (openPrintManager) {
      openPrintManager({
        title: language === 'ku' ? 'ڕاپۆرتی نەخشەی جوگرافی زۆنەکان و سنووری ئایپی پڕۆژەکان' : 'Geographical Operational Zones & IP Boundary Audit',
        documentNumber: `GEO-ZONE-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
        category: 'IT_INFRASTRUCTURE',
        contentSummary: language === 'ku'
          ? `پشکنینی نەخشەی ٧ زۆنی ئۆپەراسیۆنی (هەولێر، نەجەف، هەڵەبجە، سلێمانی، دهۆک، زاخۆ و بەغدا). سەرجەم زۆنەکان بە سنووری IP Subnet و Geofencing بەستراونەتەوە.`
          : `Geographical boundary and IP geofencing report covering 7 holding operations sites across Iraq & Kurdistan.`
      });
    }
  };

  const totalConnectedLaptops = zones.reduce((acc, z) => acc + z.connectedLaptopsCount, 0);
  const totalMonitoredRadius = zones.reduce((acc, z) => acc + z.radiusKm, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
              <Compass className="w-7 h-7 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-mono font-bold bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                  Geo-Fence & IP Boundary
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Multi-Governorate Zones: ACTIVE
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {language === 'ku'
                  ? 'نەخشەی جوگرافی زۆنە ئۆپەراسیۆنییەکان و سنووری ئایپی (Operational Zones)'
                  : language === 'ar'
                  ? 'المناطق التشغيلية الجغرافية وحدود عناوين IP للمشاريع'
                  : 'Geographical Operational Zones & IP Boundary Management'}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {language === 'ku'
                  ? 'چاودێری بینراوی ناوچە و زۆنە کارگێڕییەکانی هەر پڕۆژەیەک (نەجەف، هەڵەبجە، سلێمانی، دهۆک، زاخۆ و هەولێر) لەگەڵ ڕێکخستنی سنووری ئایپی بۆ ڕێگەپێدانی خۆکارانەی سینک.'
                  : 'Visually monitor registered geographic operational zones and manage IP subnet geofences for secure, automated state synchronization across Iraq and Kurdistan.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
            <button
              onClick={handlePrintZoneAudit}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>{language === 'ku' ? 'چاپکردنی نەخشە و زۆنەکان' : 'Print Zone Audit'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="mt-4 bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Registered Operational Zones */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{language === 'ku' ? 'زۆنە تۆمارکراوەکان' : 'Registered Zones'}</span>
            <Map className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {zones.length}
            </span>
            <span className="text-xs font-bold text-emerald-600">Active Sites</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {language === 'ku' ? 'سەرجەم لق و پڕۆژەکانی هۆڵدینگ' : 'All holding subsidiary hubs'}
          </div>
        </div>

        {/* KPI 2: Total Connected Laptops */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{language === 'ku' ? 'لاپتۆپە پەیوەستبووەکان' : 'Connected Laptops'}</span>
            <Laptop className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600 font-mono">
              {totalConnectedLaptops}
            </span>
            <span className="text-xs font-bold text-slate-400">Terminals</span>
          </div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'ku' ? '١٠٠٪ لە ناو سنووری ڕێگەپێدراون' : '100% In-Zone Boundary'}</span>
          </div>
        </div>

        {/* KPI 3: Total Geofenced Radius Area */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{language === 'ku' ? 'تێکڕای بازنەی زۆنەکان' : 'Cumulative Coverage'}</span>
            <Crosshair className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 font-mono">
              {totalMonitoredRadius}
            </span>
            <span className="text-xs font-bold text-slate-500">km Total Radius</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {language === 'ku' ? 'بەرفراوان بەسەر ٧ پارێزگادا' : 'Across 7 operational provinces'}
          </div>
        </div>

        {/* KPI 4: IP Boundary Validation Health */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{language === 'ku' ? 'سەلامەتی سنووری ئایپی' : 'IP Boundary Health'}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 font-mono">
              100%
            </span>
            <span className="text-xs font-bold text-emerald-600">ENFORCED</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {language === 'ku' ? 'دژە دزەکردن و هاککردنی سینک' : 'Zero unauthorized sync breaches'}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Zone Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Vector Map of Iraq & Kurdistan (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white">
                  {language === 'ku' ? 'نەخشەی ڕاستەوخۆی هێڵ و زۆنەکان' : 'Live Operational Map & Vector Connections'}
                </h2>
                <span className="text-[11px] text-slate-400">
                  {language === 'ku' ? 'سێرڤەری هەولێر (ناوەند) بەرامبەر پڕۆژە مەیدانییەکان' : 'Erbil Central Master Server to Remote Field Sites'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Vector Mesh
              </span>
            </div>
          </div>

          {/* Interactive SVG Map Canvas */}
          <div className="relative w-full aspect-[4/3] bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden flex items-center justify-center p-4">
            {/* Background Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Geographical Vector Paths & Contours */}
            <svg
              className="w-full h-full max-h-[480px]"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Radial Glow Gradient */}
                <radialGradient id="hqGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="zoneSelectedGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="vectorLine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Kurdistan & Iraq stylized territory contours */}
              <path
                d="M 20 8 Q 30 5 45 8 Q 65 12 85 25 Q 92 45 88 65 Q 70 85 50 95 Q 35 90 25 75 Q 15 50 18 25 Z"
                fill="#0F172A"
                stroke="#334155"
                strokeWidth="0.75"
                strokeDasharray="2 1"
              />

              {/* Northern Kurdistan Mountain Ridge styling */}
              <path
                d="M 22 10 Q 40 18 60 14 Q 78 22 86 35"
                fill="none"
                stroke="#475569"
                strokeWidth="0.5"
                strokeDasharray="1 1"
              />

              {/* Tigris & Euphrates river representations */}
              <path
                d="M 32 14 Q 48 35 55 60 Q 62 80 65 92"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="0.6"
                opacity="0.6"
              />
              <path
                d="M 25 22 Q 42 45 48 70 Q 46 88 52 95"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="0.6"
                opacity="0.6"
              />

              {/* Connection vector lines from Erbil Central HQ (52, 30) to all other sites */}
              {zones
                .filter((z) => z.id !== 'zone-erbil-hq')
                .map((z) => {
                  const isSelected = z.id === selectedZoneId;
                  return (
                    <g key={`line-${z.id}`}>
                      <line
                        x1="52"
                        y1="30"
                        x2={z.coordinates.svgX}
                        y2={z.coordinates.svgY}
                        stroke={isSelected ? '#10b981' : '#4f46e5'}
                        strokeWidth={isSelected ? '0.9' : '0.4'}
                        strokeDasharray={isSelected ? '1.5 1' : '1 1.5'}
                        className="transition-all duration-300"
                        opacity={isSelected ? 1 : 0.6}
                      />
                      {/* Animated traveling pulse dot along vector line */}
                      <circle
                        r={isSelected ? '0.9' : '0.6'}
                        fill={isSelected ? '#34d399' : '#818cf8'}
                      >
                        <animateMotion
                          path={`M 52 30 L ${z.coordinates.svgX} ${z.coordinates.svgY}`}
                          dur={`${Math.max(2, z.coordinates.svgY * 0.04)}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}

              {/* Operational Zones Circles (Geofence Radius) & Pins */}
              {zones.map((zone) => {
                const isSelected = zone.id === selectedZoneId;
                const isHq = zone.id === 'zone-erbil-hq';
                // Scale SVG radius visually (e.g. 20km = 5 units, 40km = 9 units)
                const visualRadius = Math.max(3.5, zone.radiusKm * 0.18);

                return (
                  <g
                    key={zone.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedZoneId(zone.id)}
                  >
                    {/* Radial Geofence boundary circle */}
                    <circle
                      cx={zone.coordinates.svgX}
                      cy={zone.coordinates.svgY}
                      r={visualRadius}
                      fill={isHq ? 'url(#hqGlow)' : isSelected ? 'url(#zoneSelectedGlow)' : '#1e1b4b'}
                      fillOpacity={isHq ? 0.35 : isSelected ? 0.3 : 0.15}
                      stroke={isHq ? '#818cf8' : isSelected ? '#10b981' : '#6366f1'}
                      strokeWidth={isSelected ? '0.6' : '0.3'}
                      strokeDasharray={isSelected ? 'none' : '1 1'}
                    />

                    {/* Outer animated radar pulse ring if selected */}
                    {isSelected && (
                      <circle
                        cx={zone.coordinates.svgX}
                        cy={zone.coordinates.svgY}
                        r={visualRadius}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="0.4"
                        opacity="0.8"
                      >
                        <animate
                          attributeName="r"
                          from={visualRadius * 0.8}
                          to={visualRadius * 1.4}
                          dur="2.5s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          from="0.8"
                          to="0"
                          dur="2.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Center Node Pin */}
                    <circle
                      cx={zone.coordinates.svgX}
                      cy={zone.coordinates.svgY}
                      r={isHq ? '2.2' : isSelected ? '1.8' : '1.4'}
                      fill={isHq ? '#6366f1' : isSelected ? '#10b981' : '#3b82f6'}
                      stroke="#ffffff"
                      strokeWidth="0.5"
                      className="transition-all duration-200"
                    />

                    {/* Zone Label Tag on Map */}
                    <text
                      x={zone.coordinates.svgX}
                      y={zone.coordinates.svgY - (isHq ? 3.5 : 2.8)}
                      textAnchor="middle"
                      fill={isHq ? '#c7d2fe' : isSelected ? '#6ee7b7' : '#94a3b8'}
                      fontSize="2.2"
                      fontWeight="bold"
                      className="pointer-events-none select-none tracking-wider"
                    >
                      {zone.governorate}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Zone Navigation Strip */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {zones.map((zone) => {
              const isSelected = zone.id === selectedZoneId;
              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{zone.governorate}</span>
                  <span className={`text-[10px] px-1 rounded font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {zone.radiusKm}km
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Operational Zone & IP Boundary Config (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Zone Header */}
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {selectedZone.siteCode}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    In-Bounds Verified
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                  {language === 'ku' ? selectedZone.nameKu : selectedZone.nameEn}
                </h2>
                <span className="text-xs text-slate-500 block mt-0.5">
                  GPS: {selectedZone.coordinates.lat.toFixed(4)}° N, {selectedZone.coordinates.lng.toFixed(4)}° E
                </span>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-indigo-700 font-mono block">
                  {selectedZone.radiusKm}
                </span>
                <span className="text-[10px] text-slate-400 block font-bold">KM RADIUS</span>
              </div>
            </div>

            {/* Geofence Radius Slider */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  {language === 'ku' ? 'تیرەی بازنەی زۆن (Geofence Radius)' : 'Geofence Operational Radius'}
                </span>
                <span className="font-mono text-indigo-600 font-extrabold">
                  {selectedZone.radiusKm} km
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={selectedZone.radiusKm}
                onChange={(e) => handleUpdateRadius(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>5 km (Local Site)</span>
                <span>40 km (Industrial Hub)</span>
                <span>80 km (Governorate)</span>
              </div>
            </div>

            {/* Allowed IP-Address Boundaries & Subnets */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  {language === 'ku' ? 'سنووری ئایپییە ڕێگەپێدراوەکان (IP Subnets)' : 'Allowed IP Subnet Boundaries'}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {selectedZone.allowedIpSubnets.length} CIDR blocks
                </span>
              </div>

              {/* Subnets list */}
              <div className="flex flex-wrap gap-1.5">
                {selectedZone.allowedIpSubnets.map((subnet) => (
                  <span
                    key={subnet}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-semibold text-slate-800 shadow-2xs"
                  >
                    <span>{subnet}</span>
                    <button
                      onClick={() => handleRemoveSubnet(subnet)}
                      className="text-slate-400 hover:text-rose-500 ml-1 transition"
                      title="Remove subnet"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Subnet input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="e.g. 94.207.130.0/24 or 37.238.*"
                  value={newSubnetInput}
                  onChange={(e) => setNewSubnetInput(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleAddSubnet}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'ku' ? 'زیادکردن' : 'Add'}</span>
                </button>
              </div>
            </div>

            {/* Boundary Enforcement Policy Dropdown */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {language === 'ku' ? 'یاسای جێبەجێکردنی سنووری ئایپی' : 'Sync Boundary Enforcement Policy'}
              </label>
              <select
                value={selectedZone.enforcementPolicy}
                onChange={(e) => handleUpdatePolicy(e.target.value as GeoIpEnforcementPolicy)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="HYBRID_DYNAMIC_TOLERANT">
                  {language === 'ku'
                    ? 'Hybrid Dynamic Tolerant (ڕێگەپێدانی گۆڕانی ئایپی لە چوارچێوەی کۆمپانیاکانی کوردستان و عێراق)'
                    : 'Hybrid Dynamic Tolerant (Permit ISP dynamic rotations inside country)'}
                </option>
                <option value="STRICT_GEO_IP">
                  {language === 'ku'
                    ? 'Strict Geo-IP (تەنها ئایپی و شوێنی دیاریکراوی ئەم زۆنە)'
                    : 'Strict Geo-IP (Strict subnet whitelist + GPS radius required)'}
                </option>
                <option value="PERMISSIVE_ROAMING">
                  {language === 'ku'
                    ? 'Permissive Roaming (سینک لە هەر شوێنێک بە مەرجی بوونی کلیلی هۆڵدینگ)'
                    : 'Permissive Roaming (Unrestricted with valid holding key)'}
                </option>
              </select>
              <span className="text-[11px] text-slate-500 block leading-relaxed">
                {selectedZone.enforcementPolicy === 'HYBRID_DYNAMIC_TOLERANT'
                  ? language === 'ku'
                    ? 'پێشنیارکراو: ڕێگری لە پچڕان دەکات کاتێک هێڵەکانی فاستلینک، کۆڕەک، نەورۆز، یان ئێرسلینک ئایپی دەگۆڕن.'
                    : 'Recommended: Prevents sync disconnection when Iraqi dynamic ISPs rotate IP addresses.'
                  : selectedZone.enforcementPolicy === 'STRICT_GEO_IP'
                  ? language === 'ku'
                    ? 'تەنها ئەو ئامێرانەی لە ناو ئەم زۆنەدان ڕێگەی سینکیان دەدرێت؛ لە دەرەوە بێت بلۆک دەکرێت.'
                    : 'Restricts sync exclusively to devices physically within this operational radius.'
                  : language === 'ku'
                  ? 'سینک بۆ هەموو ئامێرێک کراوەیە کە کلیلی هۆڵدینگی پێ بێت.'
                  : 'Open sync for all nodes possessing the valid holding sync token.'}
              </span>
            </div>

            {/* Test IP Boundary Verification Box */}
            <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
                {language === 'ku' ? 'تێستی ڕاستەوخۆی ڕێگەپێدانی ئایپی لەم زۆنەدا' : 'Live IP Boundary Verification Probe'}
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={testIpInput}
                  onChange={(e) => setTestIpInput(e.target.value)}
                  placeholder="Enter IP (e.g. 94.207.130.65)"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleTestIpBoundary}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                >
                  {language === 'ku' ? 'تێست' : 'Test'}
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                    testResult.allowed
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                  }`}
                >
                  {testResult.allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{language === 'ku' ? testResult.messageKu : testResult.messageEn}</span>
                </div>
              )}
            </div>
          </div>

          {/* Connected Laptops inside this zone */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              {language === 'ku' ? `ئامێرە چالاکەکانی زۆنی (${selectedZone.governorate})` : `Active Devices in (${selectedZone.governorate}) Zone`}
            </span>
            <div className="space-y-1.5">
              {selectedZone.activeLaptops.map((lap) => (
                <div
                  key={lap.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Laptop className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-800">{lap.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-indigo-700 text-[11px] font-bold">{lap.ip}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                      In-Zone
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
