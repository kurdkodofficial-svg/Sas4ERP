import { IntercompanyInvoice, IntercompanyBilateralPair } from '../types/intercompany';

export const initialIntercompanyInvoices: IntercompanyInvoice[] = [
  // Pair 1: Falcon Construction buys prefabricated structural steel from Zagros Steel
  {
    id: 'ic-inv-1-exp',
    pairId: 'pair-ic-9001',
    pairCode: 'IC-PAIR-9001',
    invoiceNumber: 'IC-EXP-2026-001',
    direction: 'EXPENSE_BUYER',
    buyerCompanyId: 'comp-1', // Falcon Construction
    buyerCompanyName: 'Falcon Heavy Construction Co.',
    buyerProjectId: 'proj-101',
    buyerProjectName: 'Erbil Business Towers Complex',
    sellerCompanyId: 'comp-3', // Zagros Steel
    sellerCompanyName: 'Zagros Steel & Industrial Rebar Co.',
    sellerProjectId: 'proj-103',
    sellerProjectName: 'Industrial Foundry & Smelter Expansion',
    title: 'Fabricated High-Tensile Steel Girders (Batch B-14)',
    titleKu: 'تیرە ئاسنە ئامادەکراوەکانی هەیکەلی پڕۆژە (بەشی B-14)',
    titleAr: 'عوارض فولاذية مسبقة الصنع لهيكل المشروع (دفعة B-14)',
    description: 'Internal procurement of 450 metric tons of custom-milled ASTM A572 structural steel beams for tower cores.',
    category: 'RAW_MATERIALS',
    quantity: 450,
    unit: 'Tons',
    unitPriceUSD: 1200,
    amountUSD: 540000,
    amountIQD: 540000 * 1310,
    issueDate: '2026-09-12',
    dueDate: '2026-10-30',
    status: 'MUTUALLY_CONFIRMED',
    eliminatedInConsolidation: true,
    cryptoVerificationHash: 'SHA256:IC-MIRROR-ZAGROS-FALCON-540K-A8F29',
    referencePoNumber: 'PO-2026-1049',
    notes: 'Approved under internal transfer pricing framework at 8% below external market rate.'
  },
  {
    id: 'ic-inv-1-rev',
    pairId: 'pair-ic-9001',
    pairCode: 'IC-PAIR-9001',
    invoiceNumber: 'IC-REV-2026-001',
    direction: 'REVENUE_SELLER',
    buyerCompanyId: 'comp-1',
    buyerCompanyName: 'Falcon Heavy Construction Co.',
    buyerProjectId: 'proj-101',
    buyerProjectName: 'Erbil Business Towers Complex',
    sellerCompanyId: 'comp-3',
    sellerCompanyName: 'Zagros Steel & Industrial Rebar Co.',
    sellerProjectId: 'proj-103',
    sellerProjectName: 'Industrial Foundry & Smelter Expansion',
    title: 'Fabricated High-Tensile Steel Girders (Batch B-14)',
    titleKu: 'تیرە ئاسنە ئامادەکراوەکانی هەیکەلی پڕۆژە (بەشی B-14)',
    titleAr: 'عوارض فولاذية مسبقة الصنع لهيكل المشروع (دفعة B-14)',
    description: 'Internal sales fulfillment of 450 metric tons of structural steel to sister subsidiary Falcon Construction.',
    category: 'RAW_MATERIALS',
    quantity: 450,
    unit: 'Tons',
    unitPriceUSD: 1200,
    amountUSD: 540000,
    amountIQD: 540000 * 1310,
    issueDate: '2026-09-12',
    dueDate: '2026-10-30',
    status: 'MUTUALLY_CONFIRMED',
    eliminatedInConsolidation: true,
    cryptoVerificationHash: 'SHA256:IC-MIRROR-ZAGROS-FALCON-540K-A8F29',
    referencePoNumber: 'PO-2026-1049',
    notes: 'Auto-generated mirror revenue entry matched with buyer PO-2026-1049.'
  },

  // Pair 2: Tigris Logistics provides heavy equipment freight for Falcon Construction
  {
    id: 'ic-inv-2-exp',
    pairId: 'pair-ic-9002',
    pairCode: 'IC-PAIR-9002',
    invoiceNumber: 'IC-EXP-2026-002',
    direction: 'EXPENSE_BUYER',
    buyerCompanyId: 'comp-1',
    buyerCompanyName: 'Falcon Heavy Construction Co.',
    buyerProjectId: 'proj-102',
    buyerProjectName: 'Highway Overpass & Infrastructure',
    sellerCompanyId: 'comp-2',
    sellerCompanyName: 'Tigris Fleet Logistics & Supply Chain Co.',
    sellerProjectId: 'proj-104',
    sellerProjectName: 'Central Freight Hub & Cold Storage',
    title: 'Heavy Lowboy Machinery Haulage & Site Crane Dispatch',
    titleKu: 'گواستنەوەی ئامێرە قورسەکان و کەرینەکانی هێڵی سەرەکی',
    titleAr: 'نقل الآليات الثقيلة وتشغيل رافعات الموقع',
    description: 'Fleet transport of 18 hydraulic excavators and tower crane sections from Umm Qasr port to Erbil site.',
    category: 'LOGISTICS_TRANSPORT',
    quantity: 18,
    unit: 'Convoys',
    unitPriceUSD: 8500,
    amountUSD: 153000,
    amountIQD: 153000 * 1310,
    issueDate: '2026-09-28',
    dueDate: '2026-10-25',
    status: 'SETTLED',
    eliminatedInConsolidation: true,
    cryptoVerificationHash: 'SHA256:IC-MIRROR-TIGRIS-FALCON-153K-C7741',
    settledAt: '2026-10-20',
    settledBy: 'Holding Central Treasury Clearing',
    referencePoNumber: 'PO-2026-1082',
    notes: 'Intercompany freight clearing settled through central holding treasury.'
  },
  {
    id: 'ic-inv-2-rev',
    pairId: 'pair-ic-9002',
    pairCode: 'IC-PAIR-9002',
    invoiceNumber: 'IC-REV-2026-002',
    direction: 'REVENUE_SELLER',
    buyerCompanyId: 'comp-1',
    buyerCompanyName: 'Falcon Heavy Construction Co.',
    buyerProjectId: 'proj-102',
    buyerProjectName: 'Highway Overpass & Infrastructure',
    sellerCompanyId: 'comp-2',
    sellerCompanyName: 'Tigris Fleet Logistics & Supply Chain Co.',
    sellerProjectId: 'proj-104',
    sellerProjectName: 'Central Freight Hub & Cold Storage',
    title: 'Heavy Lowboy Machinery Haulage & Site Crane Dispatch',
    titleKu: 'گواستنەوەی ئامێرە قورسەکان و کەرینەکانی هێڵی سەرەکی',
    titleAr: 'نقل الآليات الثقيلة وتشغيل رافعات الموقع',
    description: 'Internal revenue accrued for convoy haulage for Highway Overpass project.',
    category: 'LOGISTICS_TRANSPORT',
    quantity: 18,
    unit: 'Convoys',
    unitPriceUSD: 8500,
    amountUSD: 153000,
    amountIQD: 153000 * 1310,
    issueDate: '2026-09-28',
    dueDate: '2026-10-25',
    status: 'SETTLED',
    eliminatedInConsolidation: true,
    cryptoVerificationHash: 'SHA256:IC-MIRROR-TIGRIS-FALCON-153K-C7741',
    settledAt: '2026-10-20',
    settledBy: 'Holding Central Treasury Clearing',
    referencePoNumber: 'PO-2026-1082',
    notes: 'Direct internal settlement recognized in subsidiary ledger.'
  },

  // Pair 3: Horizon Tech Solutions provides SCADA & Smart Metering integration for Tigris Logistics
  {
    id: 'ic-inv-3-exp',
    pairId: 'pair-ic-9003',
    pairCode: 'IC-PAIR-9003',
    invoiceNumber: 'IC-EXP-2026-003',
    direction: 'EXPENSE_BUYER',
    buyerCompanyId: 'comp-2',
    buyerCompanyName: 'Tigris Fleet Logistics & Supply Chain Co.',
    buyerProjectId: 'proj-104',
    buyerProjectName: 'Central Freight Hub & Cold Storage',
    sellerCompanyId: 'comp-4',
    sellerCompanyName: 'Horizon Smart Grid & Telecommunications',
    sellerProjectId: 'proj-105',
    sellerProjectName: 'Fiber Optic Backbone & IoT Sensor Network',
    title: 'Cold Storage IoT Telemetry & GPS Asset Tracking Subsystem',
    titleKu: 'سیستەمی چاودێری پلەی گەرمی ساردکەرەوەکان و شوێنپێهەڵگرتنی بار',
    titleAr: 'نظام تتبع الأسطول وإنترنت الأشياء لمستودعات التبريد',
    description: 'Installation of 120 temperature IoT sensors and automated dispatch tracking firmware.',
    category: 'ENGINEERING_SERVICES',
    quantity: 1,
    unit: 'Turnkey Project',
    unitPriceUSD: 88000,
    amountUSD: 88000,
    amountIQD: 88000 * 1310,
    issueDate: '2026-10-05',
    dueDate: '2026-11-15',
    status: 'PENDING_MUTUAL_ACCEPTANCE',
    eliminatedInConsolidation: true,
    cryptoVerificationHash: 'SHA256:IC-MIRROR-HORIZON-TIGRIS-88K-E9912',
    referencePoNumber: 'PO-2026-1120',
    notes: 'Awaiting site acceptance certificate from Tigris warehouse manager.'
  },
  {
    id: 'ic-inv-3-rev',
    pairId: 'pair-ic-9003',
    pairCode: 'IC-PAIR-9003',
    invoiceNumber: 'IC-REV-2026-003',
    direction: 'REVENUE_SELLER',
    buyerCompanyId: 'comp-2',
    buyerCompanyName: 'Tigris Fleet Logistics & Supply Chain Co.',
    buyerProjectId: 'proj-104',
    buyerProjectName: 'Central Freight Hub & Cold Storage',
    sellerCompanyId: 'comp-4',
    sellerCompanyName: 'Horizon Smart Grid & Telecommunications',
    sellerProjectId: 'proj-105',
    sellerProjectName: 'Fiber Optic Backbone & IoT Sensor Network',
    title: 'Cold Storage IoT Telemetry & GPS Asset Tracking Subsystem',
    titleKu: 'سیستەمی چاودێری پلەی گەرمی ساردکەرەوەکان و شوێنپێهەڵگرتنی بار',
    titleAr: 'نظام تتبع الأسطول وإنترنت الأشياء لمستودعات التبريد',
    description: 'Telecommunications & telemetry engineering service billed to Tigris Logistics.',
    category: 'ENGINEERING_SERVICES',
    quantity: 1,
    unit: 'Turnkey Project',
    unitPriceUSD: 88000,
    amountUSD: 88000,
    amountIQD: 88000 * 1310,
    issueDate: '2026-10-05',
    dueDate: '2026-11-15',
    status: 'PENDING_MUTUAL_ACCEPTANCE',
    eliminatedInConsolidation: true,
    cryptoVerificationHash: 'SHA256:IC-MIRROR-HORIZON-TIGRIS-88K-E9912',
    referencePoNumber: 'PO-2026-1120',
    notes: 'Engineers deployed on site; preliminary acceptance signed.'
  }
];

export const groupInvoicesIntoBilateralPairs = (invoices: IntercompanyInvoice[]): IntercompanyBilateralPair[] => {
  const pairMap = new Map<string, { exp?: IntercompanyInvoice; rev?: IntercompanyInvoice }>();

  invoices.forEach(inv => {
    if (!pairMap.has(inv.pairId)) {
      pairMap.set(inv.pairId, {});
    }
    const pair = pairMap.get(inv.pairId)!;
    if (inv.direction === 'EXPENSE_BUYER') {
      pair.exp = inv;
    } else {
      pair.rev = inv;
    }
  });

  const bilateralPairs: IntercompanyBilateralPair[] = [];

  pairMap.forEach((val, pairId) => {
    if (val.exp && val.rev) {
      bilateralPairs.push({
        pairId,
        pairCode: val.exp.pairCode,
        title: val.exp.title,
        titleKu: val.exp.titleKu,
        titleAr: val.exp.titleAr,
        buyerCompanyId: val.exp.buyerCompanyId,
        buyerCompanyName: val.exp.buyerCompanyName,
        sellerCompanyId: val.exp.sellerCompanyId,
        sellerCompanyName: val.exp.sellerCompanyName,
        amountUSD: val.exp.amountUSD,
        amountIQD: val.exp.amountIQD,
        category: val.exp.category,
        status: val.exp.status,
        issueDate: val.exp.issueDate,
        dueDate: val.exp.dueDate,
        expenseInvoice: val.exp,
        revenueInvoice: val.rev,
        cryptoVerificationHash: val.exp.cryptoVerificationHash,
        eliminatedInConsolidation: val.exp.eliminatedInConsolidation
      });
    }
  });

  return bilateralPairs.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
};
