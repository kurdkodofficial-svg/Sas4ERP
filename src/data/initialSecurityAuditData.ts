import { CompleteSecurityAuditData } from '../types/securityAuditReport';

export const initialSecurityAuditData: CompleteSecurityAuditData = {
  summary: {
    reportId: 'SEC-AUDIT-2026-M11-8842',
    reportDate: '2026-11-03',
    periodLabel: 'Last 30 Days (Oct 04, 2026 – Nov 03, 2026)',
    startDate: '2026-10-04',
    endDate: '2026-11-03',
    holdingName: 'SAS Holding Group Enterprise',
    classification: 'STRICTLY_CONFIDENTIAL',
    securityScore: 98.6,
    totalAuditedEvents: 1248,
    unauthorizedBreaches: 0,
    syncUptimePercent: 99.85,
    cryptoSealHash: 'e7b8c912f4a56d80e1239bf02874adca8192038174fecb891234abcd5678ef01'
  },
  syncConflicts: [
    {
      id: 'sc-01',
      date: '2026-11-02 14:28',
      siteName: 'Najaf Cement Manufacturing Plant',
      entityType: 'PRODUCTION_BATCH',
      entityReference: 'BATCH-NJF-2026-88 (Kiln Line 2 Output)',
      conflictType: 'VALUE_MISMATCH',
      holdingValue: '4,200 Tons (HQ Central Production Quota)',
      branchValue: '4,800 Tons (Actual kiln output logged at Najaf Plant)',
      resolutionStatus: 'RESOLVED_HOLDING_MASTER',
      resolutionDurationMin: 18
    },
    {
      id: 'sc-02',
      date: '2026-10-29 09:15',
      siteName: 'Halabja Branch Office & Field Site',
      entityType: 'PURCHASE_ORDER',
      entityReference: 'PO-2026-4421 (Rebar Couplers & Binding Wire)',
      conflictType: 'CONCURRENT_EDIT',
      holdingValue: '$58,000 USD (Approved ceiling by Chairman)',
      branchValue: '$64,000 USD (Emergency price hike at local site)',
      resolutionStatus: 'AUTO_MERGED',
      resolutionDurationMin: 12
    },
    {
      id: 'sc-03',
      date: '2026-10-25 18:40',
      siteName: 'Zakho Logistics & Gate Terminal',
      entityType: 'GATE_ENTRY_LOG',
      entityReference: 'WAYBILL-ZKH-902 (Steel Coil Transit)',
      conflictType: 'FIELD_OVERWRITE',
      holdingValue: 'Standard 48h Clearance Window',
      branchValue: 'Express 6h Border Fast-Track',
      resolutionStatus: 'RESOLVED_BRANCH',
      resolutionDurationMin: 22
    },
    {
      id: 'sc-04',
      date: '2026-10-20 11:05',
      siteName: 'Sulaymaniyah Energy Subsidiary',
      entityType: 'FINANCE_LEDGER',
      entityReference: 'DISBURSE-SLE-108 (High-Voltage Cable)',
      conflictType: 'BUDGET_CAP_EXCEEDED',
      holdingValue: '$42,500 USD (Authorized budget cap)',
      branchValue: '$46,200 USD (Site installation surcharge)',
      resolutionStatus: 'RESOLVED_HOLDING_MASTER',
      resolutionDurationMin: 15
    },
    {
      id: 'sc-05',
      date: '2026-10-15 16:20',
      siteName: 'Baghdad Commercial Liaison Hub',
      entityType: 'PURCHASE_ORDER',
      entityReference: 'TENDER-BGD-2026-09 (Ministry Supply Contract)',
      conflictType: 'CONCURRENT_EDIT',
      holdingValue: 'Net 30 Payment Terms',
      branchValue: 'Net 15 Advance Terms',
      resolutionStatus: 'AUTO_MERGED',
      resolutionDurationMin: 9
    },
    {
      id: 'sc-06',
      date: '2026-10-09 13:50',
      siteName: 'Duhok Concrete & Steel Plant',
      entityType: 'WAREHOUSE_STOCK',
      entityReference: 'SKU-DHK-C45 (Ready-Mix C45 Inventory)',
      conflictType: 'VALUE_MISMATCH',
      holdingValue: '1,450 m³ in store',
      branchValue: '1,620 m³ logged after overnight pour',
      resolutionStatus: 'RESOLVED_BRANCH',
      resolutionDurationMin: 8
    }
  ],
  connectionStability: [
    {
      siteId: 'site-ebl-hq',
      siteName: 'Erbil Executive HQ Central Hub',
      governorate: 'Erbil',
      avgLatencyMs: 1.2,
      minLatencyMs: 0.8,
      maxLatencyMs: 3.5,
      uptimePercent: 99.99,
      carrierIsp: 'Newroz Telecom FTTH Enterprise',
      ipRotationsHandled: 2,
      packetLossPercent: 0.0,
      status: 'EXCELLENT'
    },
    {
      siteId: 'site-njf-cmt',
      siteName: 'Najaf Cement Manufacturing Plant',
      governorate: 'Najaf',
      avgLatencyMs: 56.4,
      minLatencyMs: 48.0,
      maxLatencyMs: 78.5,
      uptimePercent: 99.82,
      carrierIsp: 'Earthlink Southern Iraq / Asiacell Cellular',
      ipRotationsHandled: 16,
      packetLossPercent: 0.01,
      status: 'STABLE'
    },
    {
      siteId: 'site-hlb-prj',
      siteName: 'Halabja Branch Office & Field Site',
      governorate: 'Halabja',
      avgLatencyMs: 33.8,
      minLatencyMs: 28.5,
      maxLatencyMs: 46.0,
      uptimePercent: 99.91,
      carrierIsp: 'Fastlink LTE Iraq / GoranNet Fiber',
      ipRotationsHandled: 14,
      packetLossPercent: 0.0,
      status: 'EXCELLENT'
    },
    {
      siteId: 'site-sle-eng',
      siteName: 'Sulaymaniyah Energy Subsidiary',
      governorate: 'Sulaymaniyah',
      avgLatencyMs: 25.6,
      minLatencyMs: 22.0,
      maxLatencyMs: 38.0,
      uptimePercent: 99.94,
      carrierIsp: 'Newroz Telecom FTTH Enterprise',
      ipRotationsHandled: 6,
      packetLossPercent: 0.0,
      status: 'EXCELLENT'
    },
    {
      siteId: 'site-dhk-plt',
      siteName: 'Duhok Concrete & Steel Plant',
      governorate: 'Duhok',
      avgLatencyMs: 41.5,
      minLatencyMs: 36.0,
      maxLatencyMs: 62.0,
      uptimePercent: 99.88,
      carrierIsp: 'Korek Telecom 4G Data Core',
      ipRotationsHandled: 9,
      packetLossPercent: 0.02,
      status: 'STABLE'
    },
    {
      siteId: 'site-zkh-gat',
      siteName: 'Zakho Logistics & Gate Terminal',
      governorate: 'Zakho',
      avgLatencyMs: 47.2,
      minLatencyMs: 42.0,
      maxLatencyMs: 71.0,
      uptimePercent: 99.78,
      carrierIsp: 'Asiacell 4G Roaming Gateway',
      ipRotationsHandled: 12,
      packetLossPercent: 0.03,
      status: 'STABLE'
    },
    {
      siteId: 'site-bgd-cml',
      siteName: 'Baghdad Commercial Liaison Hub',
      governorate: 'Baghdad',
      avgLatencyMs: 52.8,
      minLatencyMs: 46.0,
      maxLatencyMs: 75.0,
      uptimePercent: 99.84,
      carrierIsp: 'TarinNet Wireless / Earthlink Enterprise',
      ipRotationsHandled: 9,
      packetLossPercent: 0.02,
      status: 'STABLE'
    }
  ],
  loginAnomalies: [
    {
      id: 'anom-01',
      timestamp: '2026-11-01 23:42',
      username: 'dara.fareeq@skyline.holding.com',
      siteLocation: 'Erbil & Basra simultaneous access',
      detectedIp: '185.120.76.19 / 37.238.204.11',
      carrierIsp: 'Earthlink Southern Gateway',
      anomalyType: 'MULTI_CITY_CONCURRENT_LOGIN',
      riskLevel: 'HIGH',
      actionTaken: 'CHALLENGED_MFA',
      details: 'Concurrent active session initiated from Basra IP while active in Erbil. MFA re-challenge satisfied by GM.'
    },
    {
      id: 'anom-02',
      timestamp: '2026-10-27 03:15',
      username: 'gate.operator.zakho@holding.com',
      siteLocation: 'Zakho Border Gate Terminal',
      detectedIp: '91.108.188.45',
      carrierIsp: 'Unknown Foreign Host',
      anomalyType: 'FAILED_AUTH_BURST',
      riskLevel: 'CRITICAL',
      actionTaken: 'BLOCKED',
      details: '14 consecutive failed password attempts within 45 seconds from external non-whitelisted IP. IP blacklisted.'
    },
    {
      id: 'anom-03',
      timestamp: '2026-10-21 16:10',
      username: 'haider.najaf@cement.holding.com',
      siteLocation: 'Najaf Cement Plant',
      detectedIp: '94.207.130.65',
      carrierIsp: 'Earthlink Southern Iraq',
      anomalyType: 'OUT_OF_GEOFENCE_ACCESS',
      riskLevel: 'MEDIUM',
      actionTaken: 'QUARANTINED',
      details: 'Workstation connected from 48km outside registered quarry geofence radius. Temporary roaming verified via Holding Key.'
    },
    {
      id: 'anom-04',
      timestamp: '2026-10-14 02:20',
      username: 'finance.clerk.hlb@holding.com',
      siteLocation: 'Halabja Field Office',
      detectedIp: '37.238.114.82',
      carrierIsp: 'Fastlink LTE Iraq',
      anomalyType: 'UNUSUAL_HOURS_ACCESS',
      riskLevel: 'LOW',
      actionTaken: 'RESOLVED_LEGITIMATE',
      details: 'Night shift access for emergency concrete pour invoice entry. Validated by project manager signature.'
    },
    {
      id: 'anom-05',
      timestamp: '2026-10-08 19:45',
      username: 'temp.contractor@holding.com',
      siteLocation: 'Sulaymaniyah Energy Hub',
      detectedIp: '185.120.76.99',
      carrierIsp: 'Newroz Telecom FTTH',
      anomalyType: 'PRIVILEGE_ELEVATION_ATTEMPT',
      riskLevel: 'HIGH',
      actionTaken: 'BLOCKED',
      details: 'Contractor terminal attempted to access Owner Treasury Chart of Accounts. Blocked by Zero-Trust RBAC guard.'
    }
  ]
};
