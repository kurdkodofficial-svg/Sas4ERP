import { SyncConflictLog, ConflictResolutionPolicy } from '../types/syncConflict';

export const initialConflictPolicy: ConflictResolutionPolicy = {
  defaultStrategy: 'HOLDING_AUTHORITY',
  autoResolveMinorDiscrepancies: true,
  alertCfoAboveUSD: 10000,
  quarantineDesyncedNodes: false
};

export const initialSyncConflictLogs: SyncConflictLog[] = [
  {
    id: 'conf-2026-001',
    timestamp: '2026-11-01T04:45:10Z',
    entityType: 'PURCHASE_ORDER',
    entityId: 'po-101-stl',
    entityReference: 'PO-2026-089 (شیشی بیناسازی پڕۆژە)',
    holdingNodeName: 'Erbil Executive HQ (سەرۆکایەتی هۆڵدینگ)',
    holdingLocation: 'Erbil HQ - World Trade Center',
    branchNodeName: 'Halabja Branch Office & Field Site (پڕۆژەی هەڵەبجە)',
    branchLocation: 'Halabja - Industrial Project Site',
    conflictType: 'CONCURRENT_EDIT',
    severity: 'CRITICAL',
    status: 'UNRESOLVED',
    descriptionEn: 'Both Erbil HQ and Halabja Site edited unit prices and quantities concurrently during remote network fluctuation.',
    descriptionKu: 'هەردوو لاپتۆپی هەولێر و هەڵەبجە لە یەک کاتدا دەستکاری نرخ و بڕی شیشی داواکراویان کردووە کاتێک ئینتەرنێت کاتی پچڕاوە.',
    diffs: [
      {
        fieldName: 'totalAmountUSD',
        fieldLabelEn: 'Total Amount (USD)',
        fieldLabelKu: 'کۆی گشتی پارە (دۆلار)',
        holdingValue: '$48,000 USD (Approved ceiling by Chairman)',
        branchValue: '$53,200 USD (Emergency price hike updated by Site)'
      },
      {
        fieldName: 'quantity',
        fieldLabelEn: 'Quantity (Tons)',
        fieldLabelKu: 'بڕ (تەن)',
        holdingValue: '60 Tons',
        branchValue: '68 Tons (Extra 8 Tons added on site)'
      },
      {
        fieldName: 'status',
        fieldLabelEn: 'Approval Status',
        fieldLabelKu: 'دۆخی ڕەزامەندی',
        holdingValue: 'APPROVED_BY_OWNER',
        branchValue: 'PENDING_REVISED_APPROVAL'
      }
    ]
  },
  {
    id: 'conf-2026-002',
    timestamp: '2026-11-01T03:15:22Z',
    entityType: 'WAREHOUSE_ITEM',
    entityId: 'wh-cment-40',
    entityReference: 'ITEM-CMT-425 (چیمەنتۆی پۆرتلاندی پەسەندکراو)',
    holdingNodeName: 'Erbil Executive HQ (سەرۆکایەتی هۆڵدینگ)',
    holdingLocation: 'Erbil Central Logistics',
    branchNodeName: 'Sulaymaniyah Energy & Construction (سلێمانی)',
    branchLocation: 'Sulaymaniyah Branch Store',
    conflictType: 'VERSION_MISMATCH',
    severity: 'WARNING',
    status: 'UNRESOLVED',
    descriptionEn: 'Sulaymaniyah branch reconnected from offline state with stale physical inventory count (v11 vs cloud store v14).',
    descriptionKu: 'لقی سلێمانی لە ئۆفلاینەوە گەڕاوەتەوە و ژمارەی چیمەنتۆی بەردەستی کۆگا لەگەڵ سێرڤەری سەرەکی جیاوازی ٥٠ تەن دروست دەکات.',
    diffs: [
      {
        fieldName: 'availableStockTons',
        fieldLabelEn: 'Available Physical Stock',
        fieldLabelKu: 'کەلوپەلی فیعلی لە کۆگا',
        holdingValue: '320 Tons (Central Ledger)',
        branchValue: '270 Tons (Local site recount - 50 tons consumed)'
      },
      {
        fieldName: 'lastAuditBatch',
        fieldLabelEn: 'Audit Batch Reference',
        fieldLabelKu: 'ژمارەی چێکی ناوخۆیی',
        holdingValue: 'BATCH-HQ-990',
        branchValue: 'BATCH-SUL-LOCAL-14'
      }
    ]
  },
  {
    id: 'conf-2026-003',
    timestamp: '2026-10-31T21:30:00Z',
    entityType: 'GATE_LOG',
    entityId: 'gate-zk-88',
    entityReference: 'GATE-ENTRY-092 (بارهەڵگری دەروازەی زاخۆ)',
    holdingNodeName: 'Erbil Executive HQ (سەرۆکایەتی هۆڵدینگ)',
    holdingLocation: 'Erbil Central Gate Controller',
    branchNodeName: 'Zakho Logistics & Gate Terminal (دەروازەی زاخۆ)',
    branchLocation: 'Zakho Border Terminal',
    conflictType: 'GATE_STATUS_DESYNC',
    severity: 'CRITICAL',
    status: 'RESOLVED_HOLDING_WINS',
    resolvedAt: '2026-10-31T22:00:00Z',
    resolvedBy: 'IT Security Administrator & Holding Chairman',
    resolutionNotes: 'Holding Master enforced: Truck quarantined due to missing bill of lading clearance in central database.',
    descriptionEn: 'Zakho gate terminal allowed truck entry offline, but Holding Security flagged unverified customs clearance.',
    descriptionKu: 'تێرمیناڵی زاخۆ لە دۆخی ئۆفلایندا ڕێگەی داوە بە ترێلە بەڵام لە سێرڤەری سەرەکی هۆڵدینگ بەهۆی نەبوونی مۆری گومرگی ڕاگیراوە.',
    diffs: [
      {
        fieldName: 'decision',
        fieldLabelEn: 'Gate Clearance Status',
        fieldLabelKu: 'بڕیاری تێپەڕبوون لە دەروازە',
        holdingValue: 'REJECTED_QUARANTINED',
        branchValue: 'ADMITTED (Offline Gate Scan)',
        resolvedValue: 'REJECTED_QUARANTINED'
      }
    ]
  },
  {
    id: 'conf-2026-004',
    timestamp: '2026-10-31T18:10:45Z',
    entityType: 'PROJECT_BUDGET',
    entityId: 'proj-101-budget',
    entityReference: 'PROJ-101 (بودجەی هەڵەبجە قۆناغی ٢)',
    holdingNodeName: 'Erbil Executive HQ (سەرۆکایەتی هۆڵدینگ)',
    holdingLocation: 'Erbil Executive Finance',
    branchNodeName: 'Halabja Branch Office & Field Site (پڕۆژەی هەڵەبجە)',
    branchLocation: 'Halabja Field Office',
    conflictType: 'BUDGET_CEILING_DIVERGENCE',
    severity: 'WARNING',
    status: 'RESOLVED_MERGED',
    resolvedAt: '2026-10-31T19:00:00Z',
    resolvedBy: 'Holding CFO & PM Halabja',
    resolutionNotes: 'Merged by applying approved contingency variance clause (+5% allocation with holding approval seal).',
    descriptionEn: 'Site registered urgent sub-contractor commitment exceeding the updated holding quarterly expenditure cap.',
    descriptionKu: 'پڕۆژەی هەڵەبجە گرێبەستی بەپەلەی تۆمارکردبوو کە سنوری بودجەی مانگانەی تێپەڕاندبوو بە ڕێژەی ٥٪.',
    diffs: [
      {
        fieldName: 'allocatedBudgetUSD',
        fieldLabelEn: 'Allocated Budget Cap',
        fieldLabelKu: 'سنوری بودجەی ڕێگەپێدراو',
        holdingValue: '$1,200,000 USD',
        branchValue: '$1,260,000 USD (Emergency allocation added on site)',
        resolvedValue: '$1,260,000 USD (Contingency Approved)'
      }
    ]
  }
];
