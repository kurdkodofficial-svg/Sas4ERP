import { HoldingSectorKpi, SectorExpenseSubcategory, SectorVoucherTransaction } from '../types/kpi';
import { Company, Project } from '../types/erp';

export const getHoldingSectorsData = (companies: Company[] = [], projects: Project[] = []): HoldingSectorKpi[] => {
  // Base Sector Definitions
  const baseSectors: HoldingSectorKpi[] = [
    {
      id: 'sec-construction',
      code: 'SEC-CONST',
      name: 'Construction & Civil Infrastructure',
      nameKu: 'کەرتی بیناسازی و ژێرخانی گشتی',
      nameAr: 'قطاع الإنشاءات والبنية التحتية',
      description: 'Major civil works, roads, bridges, reinforced concrete, and heavy foundation engineering.',
      descriptionKu: 'پرۆژە گەورەکانی بیناسازی، ڕێگاوبان، پردەکان، کۆنکرێتی چەکدار و ئەندازیاری بناغە.',
      descriptionAr: 'أعمال الهندسة المدنية الكبرى، الطرق، الجسور، الخرسانة المسلحة وهندسة الأساسات.',
      color: '#2563eb', // Royal Blue
      annualBudgetUSD: 42500000,
      spentUSD: 34800000,
      varianceUSD: 7700000,
      utilizationRate: 81.9,
      companiesCount: 3,
      activeProjectsCount: 14,
      primaryKpiMetric: 'On-Schedule Milestones',
      primaryKpiValue: '94.2%',
      healthScore: 92,
      status: 'ON_TRACK',
      subcategories: [
        { id: 'sub-c1', name: 'Structural Works & Rebar', nameKu: 'کارەکانی کۆنکرێت و شیش', nameAr: 'الهياكل الإنشائية وحديد التسليح', budgetUSD: 14500000, spentUSD: 12200000, varianceUSD: 2300000, utilizationRate: 84.1, color: '#2563eb' },
        { id: 'sub-c2', name: 'Heavy Earthmoving & Grading', nameKu: 'خاککاری و ڕێکخستنی زەوی', nameAr: 'الحفريات والتسوية الثقيلة', budgetUSD: 9800000, spentUSD: 8100000, varianceUSD: 1700000, utilizationRate: 82.7, color: '#3b82f6' },
        { id: 'sub-c3', name: 'Asphalt, Paving & Access Roads', nameKu: 'قیرتاوکردن و ڕێگاکانی هاتووچۆ', nameAr: 'الإسفلت وتعبيد الطرق', budgetUSD: 7200000, spentUSD: 5900000, varianceUSD: 1300000, utilizationRate: 81.9, color: '#60a5fa' },
        { id: 'sub-c4', name: 'Site Drainage & Deep Foundation', nameKu: 'ئاوەڕۆ و بناغەی قووڵ', nameAr: 'شبكات الصرف والأساسات العميقة', budgetUSD: 6000000, spentUSD: 4800000, varianceUSD: 1200000, utilizationRate: 80.0, color: '#93c5fd' },
        { id: 'sub-c5', name: 'Scaffolding & Safety Structures', nameKu: 'ئێسکەبەندی و ڕێکاری سەلامەتی', nameAr: 'السقالات وهياكل الحماية', budgetUSD: 5000000, spentUSD: 3800000, varianceUSD: 1200000, utilizationRate: 76.0, color: '#bfdbfe' },
      ],
      recentVouchers: [
        { id: 'v-c1', date: '2026-09-28', voucherNumber: 'VCH-CONST-901', description: 'High-Tensile Deformed Steel Rebar (Grade 60) - 450 Tons', subcategory: 'Structural Works & Rebar', companyName: 'Al-Bina Construction Co.', vendor: 'Sulaymaniyah Steel Works Ltd.', amountUSD: 345000, status: 'HOLDING_APPROVED' },
        { id: 'v-c2', date: '2026-09-24', voucherNumber: 'VCH-CONST-884', description: 'Hydraulic Excavator Fleet Fuel & Track Maintenance', subcategory: 'Heavy Earthmoving & Grading', companyName: 'Delta Infrastructure Ltd.', vendor: 'North Heavy Machinery & Fuel', amountUSD: 182000, status: 'AUDITED' },
        { id: 'v-c3', date: '2026-09-18', voucherNumber: 'VCH-CONST-862', description: 'Batch Plant Ready-Mix Concrete C35/45 Pouring (Site A)', subcategory: 'Structural Works & Rebar', companyName: 'Al-Bina Construction Co.', vendor: 'National Cement & Concrete', amountUSD: 240000, status: 'AUDITED' },
        { id: 'v-c4', date: '2026-09-10', voucherNumber: 'VCH-CONST-841', description: 'Laser Asphalt Screed Paver Rental & Bitumen Supply', subcategory: 'Asphalt, Paving & Access Roads', companyName: 'Delta Infrastructure Ltd.', vendor: 'Kurdistan Asphalt Group', amountUSD: 128500, status: 'AUDITED' },
      ],
      monthlyTrend: [
        { month: 'Jan', budgetBaselineUSD: 3540000, spentUSD: 2900000, varianceUSD: 640000 },
        { month: 'Feb', budgetBaselineUSD: 3540000, spentUSD: 3200000, varianceUSD: 340000 },
        { month: 'Mar', budgetBaselineUSD: 3540000, spentUSD: 3850000, varianceUSD: -310000 },
        { month: 'Apr', budgetBaselineUSD: 3540000, spentUSD: 3600000, varianceUSD: -60000 },
        { month: 'May', budgetBaselineUSD: 3540000, spentUSD: 4100000, varianceUSD: -560000 },
        { month: 'Jun', budgetBaselineUSD: 3540000, spentUSD: 4250000, varianceUSD: -710000 },
        { month: 'Jul', budgetBaselineUSD: 3540000, spentUSD: 4400000, varianceUSD: -860000 },
        { month: 'Aug', budgetBaselineUSD: 3540000, spentUSD: 4300000, varianceUSD: -760000 },
        { month: 'Sep', budgetBaselineUSD: 3540000, spentUSD: 4200000, varianceUSD: -660000 },
      ]
    },
    {
      id: 'sec-energy',
      code: 'SEC-ENRG',
      name: 'Energy, Power & Fuel Utilities',
      nameKu: 'کەرتی وزە، بەرهەمهێنانی کارەبا و سووتەمەنی',
      nameAr: 'قطاع الطاقة وتوليد الكهرباء والوقود',
      description: 'Thermal gas turbines, electrical substations, industrial diesel generation, and grid synchronizers.',
      descriptionKu: 'تۆڕباینی غازی، وێستگەکانی کارەبا، بەرهەمهێنانی دیزڵی پیشەسازی و هاوئاهەنگکەرەکانی تۆڕ.',
      descriptionAr: 'توربينات الغاز، المحطات الكهربائية الفرعية، توليد الديزل الصناعي والمزامنة الكهربائية.',
      color: '#eab308', // Amber / Yellow
      annualBudgetUSD: 28000000,
      spentUSD: 24200000,
      varianceUSD: 3800000,
      utilizationRate: 86.4,
      companiesCount: 2,
      activeProjectsCount: 8,
      primaryKpiMetric: 'Power Uptime Factor',
      primaryKpiValue: '99.6%',
      healthScore: 95,
      status: 'ON_TRACK',
      subcategories: [
        { id: 'sub-e1', name: 'Turbine Overhaul & Spare Blades', nameKu: 'نۆژەنکردنەوەی تۆڕباین و پەڕەکان', nameAr: 'صيانة التوربينات وقطع الغيار', budgetUSD: 10200000, spentUSD: 9100000, varianceUSD: 1100000, utilizationRate: 89.2, color: '#eab308' },
        { id: 'sub-e2', name: 'Strategic Fuel Reserves (Diesel/Gas)', nameKu: 'سووتەمەنی یەدەگ و گازۆیل', nameAr: 'احتياطيات الوقود الاستراتيجي', budgetUSD: 8500000, spentUSD: 7400000, varianceUSD: 1100000, utilizationRate: 87.1, color: '#f59e0b' },
        { id: 'sub-e3', name: 'Step-up Transformers & Switchgear', nameKu: 'محویلە و دابەشکاری ڤۆڵتیە بەرز', nameAr: 'المحولات ولوحات التوزيع الكهربائية', budgetUSD: 5100000, spentUSD: 4300000, varianceUSD: 800000, utilizationRate: 84.3, color: '#d97706' },
        { id: 'sub-e4', name: 'Transmission Lines & Towers', nameKu: 'هێڵەکانی گواستنەوە و تاوەرەکان', nameAr: 'خطوط النقل وأبراج الضغط العالي', budgetUSD: 4200000, spentUSD: 3400000, varianceUSD: 800000, utilizationRate: 81.0, color: '#b45309' },
      ],
      recentVouchers: [
        { id: 'v-e1', date: '2026-09-29', voucherNumber: 'VCH-ENRG-412', description: 'Heavy Gas Turbine Filter Element Replacement Batch (GE Frame 9E)', subcategory: 'Turbine Overhaul & Spare Blades', companyName: 'Apex Energy Solutions', vendor: 'Global Turbine Services GmbH', amountUSD: 295000, status: 'HOLDING_APPROVED' },
        { id: 'v-e2', date: '2026-09-22', voucherNumber: 'VCH-ENRG-398', description: 'Bulk Low-Sulfur Industrial Diesel Delivery - 800,000 Liters', subcategory: 'Strategic Fuel Reserves (Diesel/Gas)', companyName: 'Apex Energy Solutions', vendor: 'Bazian Petroleum Refinery', amountUSD: 480000, status: 'AUDITED' },
        { id: 'v-e3', date: '2026-09-12', voucherNumber: 'VCH-ENRG-374', description: '132kV SF6 Gas Insulated Switchgear Circuit Breaker Overhaul', subcategory: 'Step-up Transformers & Switchgear', companyName: 'Kurdistan Power Gen Corp', vendor: 'ABB Power Grids Middle East', amountUSD: 185000, status: 'AUDITED' },
      ],
      monthlyTrend: [
        { month: 'Jan', budgetBaselineUSD: 2330000, spentUSD: 1950000, varianceUSD: 380000 },
        { month: 'Feb', budgetBaselineUSD: 2330000, spentUSD: 2100000, varianceUSD: 230000 },
        { month: 'Mar', budgetBaselineUSD: 2330000, spentUSD: 2450000, varianceUSD: -120000 },
        { month: 'Apr', budgetBaselineUSD: 2330000, spentUSD: 2700000, varianceUSD: -370000 },
        { month: 'May', budgetBaselineUSD: 2330000, spentUSD: 2950000, varianceUSD: -620000 },
        { month: 'Jun', budgetBaselineUSD: 2330000, spentUSD: 3100000, varianceUSD: -770000 },
        { month: 'Jul', budgetBaselineUSD: 2330000, spentUSD: 3150000, varianceUSD: -820000 },
        { month: 'Aug', budgetBaselineUSD: 2330000, spentUSD: 2900000, varianceUSD: -570000 },
        { month: 'Sep', budgetBaselineUSD: 2330000, spentUSD: 2900000, varianceUSD: -570000 },
      ]
    },
    {
      id: 'sec-realestate',
      code: 'SEC-REAL',
      name: 'Real Estate & Commercial Development',
      nameKu: 'کەرتی نیشتەجێبوون و پەرەپێدانی بازرگانی',
      nameAr: 'قطاع التطوير العقاري والمجمعات التجارية',
      description: 'Luxury residential towers, mixed-use corporate headquarters, retail plazas, and master planning.',
      descriptionKu: 'تاوەرە گرانبەهاکانی نیشتەجێبوون، بارەگای بازرگانی، مۆڵەکان و ماستەرپلان.',
      descriptionAr: 'الأبراج السكنية الفاخرة، مقرات الشركات، المراكز التجارية والتخطيط الرئيسي.',
      color: '#7c3aed', // Purple
      annualBudgetUSD: 36000000,
      spentUSD: 29400000,
      varianceUSD: 6600000,
      utilizationRate: 81.7,
      companiesCount: 2,
      activeProjectsCount: 9,
      primaryKpiMetric: 'Pre-Lease / Sales Velocity',
      primaryKpiValue: '82.4%',
      healthScore: 90,
      status: 'ON_TRACK',
      subcategories: [
        { id: 'sub-r1', name: 'Curtain Wall Facades & Double Glazing', nameKu: 'ڕوکاری شووشە و ئەلەمنیۆم', nameAr: 'الواجهات الزجاجية والألمنيوم', budgetUSD: 11800000, spentUSD: 9900000, varianceUSD: 1900000, utilizationRate: 83.9, color: '#7c3aed' },
        { id: 'sub-r2', name: 'HVAC Chiller Plants & Ducting', nameKu: 'سیستەمی فێنککەرەوە و سپلیت چیلەر', nameAr: 'أنظمة التكييف والتهوية المركزية', budgetUSD: 9400000, spentUSD: 7800000, varianceUSD: 1600000, utilizationRate: 83.0, color: '#8b5cf6' },
        { id: 'sub-r3', name: 'Luxury Interior Finishing & Marble', nameKu: 'مەرمەر، کارامیک و دیکۆراتی ناوەوە', nameAr: 'التشطيبات الفاخرة والرخام', budgetUSD: 8600000, spentUSD: 6900000, varianceUSD: 1700000, utilizationRate: 80.2, color: '#a78bfa' },
        { id: 'sub-r4', name: 'Elevators & Escalators Installation', nameKu: 'مەصعەد و قادرمەی کارەبایی', nameAr: 'المصاعد والسلالم المتحركة', budgetUSD: 6200000, spentUSD: 4800000, varianceUSD: 1400000, utilizationRate: 77.4, color: '#c4b5fd' },
      ],
      recentVouchers: [
        { id: 'v-r1', date: '2026-09-27', voucherNumber: 'VCH-REAL-620', description: 'KONE High-Speed Passenger Elevators (Group 4) Advance Payment', subcategory: 'Elevators & Escalators Installation', companyName: 'Horizon Real Estate Holdings', vendor: 'KONE Middle East FZCO', amountUSD: 520000, status: 'HOLDING_APPROVED' },
        { id: 'v-r2', date: '2026-09-20', voucherNumber: 'VCH-REAL-598', description: 'Italian Botticino Marble Slabs (20,000 sq ft) for Main Atrium', subcategory: 'Luxury Interior Finishing & Marble', companyName: 'Horizon Real Estate Holdings', vendor: 'Carrara Stone Exports', amountUSD: 215000, status: 'AUDITED' },
        { id: 'v-r3', date: '2026-09-14', voucherNumber: 'VCH-REAL-571', description: 'Centrifugal Water-Cooled Chillers (Carrier 600 TR units)', subcategory: 'HVAC Chiller Plants & Ducting', companyName: 'Capital Towers Development', vendor: 'Carrier HVAC Iraq Agency', amountUSD: 380000, status: 'AUDITED' },
      ],
      monthlyTrend: [
        { month: 'Jan', budgetBaselineUSD: 3000000, spentUSD: 2400000, varianceUSD: 600000 },
        { month: 'Feb', budgetBaselineUSD: 3000000, spentUSD: 2700000, varianceUSD: 300000 },
        { month: 'Mar', budgetBaselineUSD: 3000000, spentUSD: 3200000, varianceUSD: -200000 },
        { month: 'Apr', budgetBaselineUSD: 3000000, spentUSD: 3350000, varianceUSD: -350000 },
        { month: 'May', budgetBaselineUSD: 3000000, spentUSD: 3600000, varianceUSD: -600000 },
        { month: 'Jun', budgetBaselineUSD: 3000000, spentUSD: 3750000, varianceUSD: -750000 },
        { month: 'Jul', budgetBaselineUSD: 3000000, spentUSD: 3600000, varianceUSD: -600000 },
        { month: 'Aug', budgetBaselineUSD: 3000000, spentUSD: 3500000, varianceUSD: -500000 },
        { month: 'Sep', budgetBaselineUSD: 3000000, spentUSD: 3300000, varianceUSD: -300000 },
      ]
    },
    {
      id: 'sec-logistics',
      code: 'SEC-LOG',
      name: 'Logistics, Transport & Supply Chain',
      nameKu: 'کەرتی لۆجستی، گواستنەوە و دابینکردن',
      nameAr: 'قطاع النقل والخدمات اللوجستية وسلاسل الإمداد',
      description: 'Fleet operations, long-haul trailers, border customs clearance, and automated warehouse hubs.',
      descriptionKu: 'بەڕێوەبردنی کەشتیگەلی بارهەڵگر، تڕێلە درێژەکان، ڕێکاری گومرگی سنووری و کۆگای ئۆتۆماتیکی.',
      descriptionAr: 'إدارة أسطول النقل، الشاحنات الثقيلة، التخليص الجمركي الحدودي والمستودعات المؤتمتة.',
      color: '#0284c7', // Sky / Cyan Blue
      annualBudgetUSD: 19500000,
      spentUSD: 15900000,
      varianceUSD: 3600000,
      utilizationRate: 81.5,
      companiesCount: 2,
      activeProjectsCount: 6,
      primaryKpiMetric: 'Fleet Dispatch Reliability',
      primaryKpiValue: '98.5%',
      healthScore: 94,
      status: 'ON_TRACK',
      subcategories: [
        { id: 'sub-l1', name: 'Heavy Truck Fleet & Prime Movers', nameKu: 'کڕین و چاککردنەوەی تڕێلەکان', nameAr: 'شاحنات النقل الثقيل والقاطرات', budgetUSD: 7800000, spentUSD: 6500000, varianceUSD: 1300000, utilizationRate: 83.3, color: '#0284c7' },
        { id: 'sub-l2', name: 'Fleet Diesel, Tires & Preventive Maint.', nameKu: 'تایەر، گازۆیل و چاکسازی ڕۆتینی', nameAr: 'الوقود والإطارات والصيانة الدورية', budgetUSD: 5200000, spentUSD: 4300000, varianceUSD: 900000, utilizationRate: 82.7, color: '#0ea5e9' },
        { id: 'sub-l3', name: 'Warehouse Automation & Racking', nameKu: 'سیستەمی ڕەفەی کۆگا و بارکۆد', nameAr: 'أتمتة المستودعات وأرفف التخزين', budgetUSD: 3800000, spentUSD: 3000000, varianceUSD: 800000, utilizationRate: 78.9, color: '#38bdf8' },
        { id: 'sub-l4', name: 'Customs Clearance & Transit Tariffs', nameKu: 'ڕەسمی گومرگی و مۆڵەتی سنووری', nameAr: 'التخليص الجمركي ورسوم الترانزيت', budgetUSD: 2700000, spentUSD: 2100000, varianceUSD: 600000, utilizationRate: 77.8, color: '#7dd3fc' },
      ],
      recentVouchers: [
        { id: 'v-l1', date: '2026-09-26', voucherNumber: 'VCH-LOG-319', description: 'Mercedes-Benz Actros 3340 Tractor Head Preventive Service & Michelin Tires (80 pcs)', subcategory: 'Fleet Diesel, Tires & Preventive Maint.', companyName: 'Al-Rawasi Heavy Logistics', vendor: 'Mercedes-Benz Iraq Commercial', amountUSD: 164000, status: 'HOLDING_APPROVED' },
        { id: 'v-l2', date: '2026-09-19', voucherNumber: 'VCH-LOG-304', description: 'Border Port Customs Duty & Import Freight Clearance (Ibrahim Khalil)', subcategory: 'Customs Clearance & Transit Tariffs', companyName: 'Al-Rawasi Heavy Logistics', vendor: 'Customs Clearing Directorate', amountUSD: 98000, status: 'AUDITED' },
        { id: 'v-l3', date: '2026-09-08', voucherNumber: 'VCH-LOG-281', description: 'Electric Forklifts (Toyota 3.5 Ton) & High-Bay Pallet Racks', subcategory: 'Warehouse Automation & Racking', companyName: 'Global Cargo & Freight Ltd.', vendor: 'Toyota Material Handling ME', amountUSD: 210000, status: 'AUDITED' },
      ],
      monthlyTrend: [
        { month: 'Jan', budgetBaselineUSD: 1625000, spentUSD: 1300000, varianceUSD: 325000 },
        { month: 'Feb', budgetBaselineUSD: 1625000, spentUSD: 1450000, varianceUSD: 175000 },
        { month: 'Mar', budgetBaselineUSD: 1625000, spentUSD: 1700000, varianceUSD: -75000 },
        { month: 'Apr', budgetBaselineUSD: 1625000, spentUSD: 1850000, varianceUSD: -225000 },
        { month: 'May', budgetBaselineUSD: 1625000, spentUSD: 1950000, varianceUSD: -325000 },
        { month: 'Jun', budgetBaselineUSD: 1625000, spentUSD: 2050000, varianceUSD: -425000 },
        { month: 'Jul', budgetBaselineUSD: 1625000, spentUSD: 1950000, varianceUSD: -325000 },
        { month: 'Aug', budgetBaselineUSD: 1625000, spentUSD: 1850000, varianceUSD: -225000 },
        { month: 'Sep', budgetBaselineUSD: 1625000, spentUSD: 1800000, varianceUSD: -175000 },
      ]
    },
    {
      id: 'sec-manufacturing',
      code: 'SEC-MFG',
      name: 'Industrial Manufacturing & Materials',
      nameKu: 'کەرتی پیشەسازی، بەرهەمهێنان و کەرەستە',
      nameAr: 'قطاع التصنيع الصناعي وإنتاج المواد',
      description: 'Pre-cast concrete fabrication, structural steel fabrication, plastic piping, and industrial assembly.',
      descriptionKu: 'بەرهەمهێنانی کۆنکرێتی پێشوەخت، دروستکردنی پەیکەری ئاسن، بۆڕی پلاستیک و داڕشتنی پیشەسازی.',
      descriptionAr: 'تصنيع الخرسانة الجاهزة، الهياكل الفولاذية، الأنابيب البلاستيكية والتجميع الصناعي.',
      color: '#10b981', // Emerald Green
      annualBudgetUSD: 22000000,
      spentUSD: 18700000,
      varianceUSD: 3300000,
      utilizationRate: 85.0,
      companiesCount: 2,
      activeProjectsCount: 7,
      primaryKpiMetric: 'Factory Production Yield',
      primaryKpiValue: '97.1%',
      healthScore: 93,
      status: 'ON_TRACK',
      subcategories: [
        { id: 'sub-m1', name: 'Raw Material Billet & Polymer Pellets', nameKu: 'کەرەستەی خاوی ئاسن و پێکهاتەی پلاستیک', nameAr: 'المواد الخام الكيميائية وبليت الحديد', budgetUSD: 9500000, spentUSD: 8200000, varianceUSD: 1300000, utilizationRate: 86.3, color: '#10b981' },
        { id: 'sub-m2', name: 'Extrusion & CNC Milling Machinery', nameKu: 'ئامێرەکانی سی ئێن سی و داڕشتن', nameAr: 'ماكينات السحب والتشكيل CNC', budgetUSD: 5800000, spentUSD: 4900000, varianceUSD: 900000, utilizationRate: 84.5, color: '#059669' },
        { id: 'sub-m3', name: 'Quality Testing Laboratory & Certs', nameKu: 'تاقیگەی پشکنینی کوالێتی و بڕوانامە', nameAr: 'مختبرات فحص الجودة والمعايرة', budgetUSD: 3500000, spentUSD: 3000000, varianceUSD: 500000, utilizationRate: 85.7, color: '#047857' },
        { id: 'sub-m4', name: 'Packaging, Palletizing & Industrial Scrap', nameKu: 'پاکێجکردن و بەڕێوەبردنی پاشماوە', nameAr: 'التغليف والتعبئة وإدارة المخلفات', budgetUSD: 3200000, spentUSD: 2600000, varianceUSD: 600000, utilizationRate: 81.3, color: '#065f46' },
      ],
      recentVouchers: [
        { id: 'v-m1', date: '2026-09-25', voucherNumber: 'VCH-MFG-510', description: 'High-Density Polyethylene (HDPE 100) Raw Pellets (600 Metric Tons)', subcategory: 'Raw Material Billet & Polymer Pellets', companyName: 'Kurdistan Industrial Polymers', vendor: 'Sabic Petrochemicals Supply', amountUSD: 375000, status: 'HOLDING_APPROVED' },
        { id: 'v-m2', date: '2026-09-17', voucherNumber: 'VCH-MFG-488', description: 'Laser Metal Cutting & 5-Axis CNC Milling Tooling Heads', subcategory: 'Extrusion & CNC Milling Machinery', companyName: 'Zagros Steel & Pipe Factory', vendor: 'Trumpf Machinery Deutschland', amountUSD: 230000, status: 'AUDITED' },
        { id: 'v-m3', date: '2026-09-09', voucherNumber: 'VCH-MFG-462', description: 'Tensile & Hydrostatic Pipe Pressure Testing Rig Calibrations', subcategory: 'Quality Testing Laboratory & Certs', companyName: 'Zagros Steel & Pipe Factory', vendor: 'TÜV Rheinland Middle East', amountUSD: 65000, status: 'AUDITED' },
      ],
      monthlyTrend: [
        { month: 'Jan', budgetBaselineUSD: 1833000, spentUSD: 1500000, varianceUSD: 333000 },
        { month: 'Feb', budgetBaselineUSD: 1833000, spentUSD: 1700000, varianceUSD: 133000 },
        { month: 'Mar', budgetBaselineUSD: 1833000, spentUSD: 1950000, varianceUSD: -117000 },
        { month: 'Apr', budgetBaselineUSD: 1833000, spentUSD: 2100000, varianceUSD: -267000 },
        { month: 'May', budgetBaselineUSD: 1833000, spentUSD: 2300000, varianceUSD: -467000 },
        { month: 'Jun', budgetBaselineUSD: 1833000, spentUSD: 2400000, varianceUSD: -567000 },
        { month: 'Jul', budgetBaselineUSD: 1833000, spentUSD: 2350000, varianceUSD: -517000 },
        { month: 'Aug', budgetBaselineUSD: 1833000, spentUSD: 2250000, varianceUSD: -417000 },
        { month: 'Sep', budgetBaselineUSD: 1833000, spentUSD: 2150000, varianceUSD: -317000 },
      ]
    },
    {
      id: 'sec-technology',
      code: 'SEC-TECH',
      name: 'Technology, Telecom & Digital Systems',
      nameKu: 'کەرتی تەکنەلۆژیا، گەیاندن و سیستەمی دیجیتاڵی',
      nameAr: 'قطاع التكنولوجيا والاتصالات والأنظمة الرقمية',
      description: 'Enterprise ERP, fiber-optic distribution, secure server rooms, corporate cybersecurity, and IoT telemetry.',
      descriptionKu: 'سیستەمی ERPی پێشکەوتوو، تۆڕی فایبەر، ژووری سێرڤەری پارێزراو، ئاسایشی ئەلیکترۆنی و ئینتەرنێتی شتەکان.',
      descriptionAr: 'منظومة ساس السحابية، توزيع الألياف الضوئية، غرف الخوادم المحمية، الأمن السيبراني وإنترنت الأشياء.',
      color: '#6366f1', // Indigo
      annualBudgetUSD: 12000000,
      spentUSD: 9300000,
      varianceUSD: 2700000,
      utilizationRate: 77.5,
      companiesCount: 1,
      activeProjectsCount: 5,
      primaryKpiMetric: 'Network & Cloud Uptime',
      primaryKpiValue: '99.98%',
      healthScore: 98,
      status: 'EXCELLENT',
      subcategories: [
        { id: 'sub-t1', name: 'SAS4ERP Cloud & Database Infrastructure', nameKu: 'ژێرخانی هەوری و داتابەیسی SAS4ERP', nameAr: 'البنية السحابية وقواعد بيانات ساس', budgetUSD: 4800000, spentUSD: 3900000, varianceUSD: 900000, utilizationRate: 81.3, color: '#6366f1' },
        { id: 'sub-t2', name: 'Fiber-Optic Site Links & Microwave Towers', nameKu: 'هێڵی فایبەر ئۆپتیک و تاوەری پەیوەندی', nameAr: 'وصلات الألياف الضوئية وأبراج الميكروويف', budgetUSD: 3200000, spentUSD: 2500000, varianceUSD: 700000, utilizationRate: 78.1, color: '#4f46e5' },
        { id: 'sub-t3', name: 'Enterprise Cybersecurity & Firewalls', nameKu: 'ئاسایشی ئەلیکترۆنی و سێرڤەری پارێزراو', nameAr: 'الأمن السيبراني وجدران الحماية', budgetUSD: 2400000, spentUSD: 1800000, varianceUSD: 600000, utilizationRate: 75.0, color: '#4338ca' },
        { id: 'sub-t4', name: 'Gate Barcode Scanners & GPS Trackers', nameKu: 'سکێنەری دەروازە و جی پی ئێسی بارکردن', nameAr: 'ماسحات الباركود والبوابات وأجهزة التتبع', budgetUSD: 1600000, spentUSD: 1100000, varianceUSD: 500000, utilizationRate: 68.8, color: '#3730a3' },
      ],
      recentVouchers: [
        { id: 'v-t1', date: '2026-09-23', voucherNumber: 'VCH-TECH-211', description: 'Enterprise Data Center Tier-3 Server Hardware & SAN Storage Expand', subcategory: 'SAS4ERP Cloud & Database Infrastructure', companyName: 'Apex Digital Systems', vendor: 'Dell Technologies Middle East', amountUSD: 245000, status: 'HOLDING_APPROVED' },
        { id: 'v-t2', date: '2026-09-15', voucherNumber: 'VCH-TECH-195', description: 'Next-Gen Fortinet Enterprise NGFW FortiGate Firewalls & Licenses', subcategory: 'Enterprise Cybersecurity & Firewalls', companyName: 'Apex Digital Systems', vendor: 'Fortinet Gulf Distribution', amountUSD: 130000, status: 'AUDITED' },
        { id: 'v-t3', date: '2026-09-03', voucherNumber: 'VCH-TECH-178', description: 'Industrial Gate Automated Optical Barcode Scanners & Rugged Tablets', subcategory: 'Gate Barcode Scanners & GPS Trackers', companyName: 'Apex Digital Systems', vendor: 'Zebra Technologies ME', amountUSD: 84000, status: 'AUDITED' },
      ],
      monthlyTrend: [
        { month: 'Jan', budgetBaselineUSD: 1000000, spentUSD: 750000, varianceUSD: 250000 },
        { month: 'Feb', budgetBaselineUSD: 1000000, spentUSD: 850000, varianceUSD: 150000 },
        { month: 'Mar', budgetBaselineUSD: 1000000, spentUSD: 980000, varianceUSD: 20000 },
        { month: 'Apr', budgetBaselineUSD: 1000000, spentUSD: 1050000, varianceUSD: -50000 },
        { month: 'May', budgetBaselineUSD: 1000000, spentUSD: 1150000, varianceUSD: -150000 },
        { month: 'Jun', budgetBaselineUSD: 1000000, spentUSD: 1200000, varianceUSD: -200000 },
        { month: 'Jul', budgetBaselineUSD: 1000000, spentUSD: 1150000, varianceUSD: -150000 },
        { month: 'Aug', budgetBaselineUSD: 1000000, spentUSD: 1100000, varianceUSD: -100000 },
        { month: 'Sep', budgetBaselineUSD: 1000000, spentUSD: 1070000, varianceUSD: -70000 },
      ]
    },
    {
      id: 'sec-hospitality',
      code: 'SEC-HOSP',
      name: 'Corporate Facilities, Camps & Support',
      nameKu: 'کەرتی کەمپەکان، نیشتەجێبوون و خزمەتگوزاری',
      nameAr: 'قطاع المرافق ومخيمات السكن والخدمات اللوجستية',
      description: 'Camp accommodation for specialists, central industrial catering, site clinics, and 24/7 security perimeter.',
      descriptionKu: 'نیشتەجێبوونی کەمپی پسپۆڕان، خۆراک و کەیتەرینگی پیشەسازی، کلینیکی مەیدانی و پاسەوانی ۲۴ کاتژمێری.',
      descriptionAr: 'إعاشة عمال وخبراء المواقع، الإعاشة المركزية، العيادات الميدانية والحراسة الأمنية الشاملة.',
      color: '#f97316', // Orange
      annualBudgetUSD: 8500000,
      spentUSD: 6800000,
      varianceUSD: 1700000,
      utilizationRate: 80.0,
      companiesCount: 1,
      activeProjectsCount: 4,
      primaryKpiMetric: 'Camp Safety & Health Score',
      primaryKpiValue: '99.1%',
      healthScore: 96,
      status: 'ON_TRACK',
      subcategories: [
        { id: 'sub-h1', name: 'Camp Accommodation & HVAC Maintenance', nameKu: 'چاکسازی کەمپ و سپلیتەکان', nameAr: 'صيانة مباني المخيمات والتكييف', budgetUSD: 3600000, spentUSD: 2900000, varianceUSD: 700000, utilizationRate: 80.6, color: '#f97316' },
        { id: 'sub-h2', name: 'Industrial Catering & Food Supplies', nameKu: 'خۆراک و ئامادەکردنی ژەمەکان', nameAr: 'الإعاشة الجماعية وتموين المواد الغذائية', budgetUSD: 2700000, spentUSD: 2200000, varianceUSD: 500000, utilizationRate: 81.5, color: '#ea580c' },
        { id: 'sub-h3', name: 'Site Clinic, Med Supplies & First Aid', nameKu: 'کلینیکی تەندروستی و دەرمان', nameAr: 'العيادات الميدانية والإسعافات الطبية', budgetUSD: 1300000, spentUSD: 1000000, varianceUSD: 300000, utilizationRate: 76.9, color: '#c2410c' },
        { id: 'sub-h4', name: 'Sanitation, Waste Removal & Pest Control', nameKu: 'پاکوخاوێنی، نەهێشتنی مێروو و زبڵ', nameAr: 'النظافة ومكافحة الحشرات والنفايات', budgetUSD: 900000, spentUSD: 700000, varianceUSD: 200000, utilizationRate: 77.8, color: '#9a3412' },
      ],
      recentVouchers: [
        { id: 'v-h1', date: '2026-09-24', voucherNumber: 'VCH-HOSP-142', description: 'Central Workforce Camp Industrial Kitchen Food Supplies (Contract Q3)', subcategory: 'Industrial Catering & Food Supplies', companyName: 'Holding Corporate Services', vendor: 'Zagros Food Distribution LLC', amountUSD: 125000, status: 'HOLDING_APPROVED' },
        { id: 'v-h2', date: '2026-09-16', voucherNumber: 'VCH-HOSP-128', description: 'Camp Modular Accommodation Quarters Air Conditioners & Repairs', subcategory: 'Camp Accommodation & HVAC Maintenance', companyName: 'Holding Corporate Services', vendor: 'Korek Electro Services', amountUSD: 74000, status: 'AUDITED' },
        { id: 'v-h3', date: '2026-09-05', voucherNumber: 'VCH-HOSP-111', description: 'Emergency Medical Supplies, Defibrillators & First Aid Site Units', subcategory: 'Site Clinic, Med Supplies & First Aid', companyName: 'Holding Corporate Services', vendor: 'MedCare Pharmaceuticals', amountUSD: 48000, status: 'AUDITED' },
      ],
      monthlyTrend: [
        { month: 'Jan', budgetBaselineUSD: 708000, spentUSD: 540000, varianceUSD: 168000 },
        { month: 'Feb', budgetBaselineUSD: 708000, spentUSD: 610000, varianceUSD: 98000 },
        { month: 'Mar', budgetBaselineUSD: 708000, spentUSD: 690000, varianceUSD: 18000 },
        { month: 'Apr', budgetBaselineUSD: 708000, spentUSD: 750000, varianceUSD: -42000 },
        { month: 'May', budgetBaselineUSD: 708000, spentUSD: 820000, varianceUSD: -112000 },
        { month: 'Jun', budgetBaselineUSD: 708000, spentUSD: 860000, varianceUSD: -152000 },
        { month: 'Jul', budgetBaselineUSD: 708000, spentUSD: 870000, varianceUSD: -162000 },
        { month: 'Aug', budgetBaselineUSD: 708000, spentUSD: 850000, varianceUSD: -142000 },
        { month: 'Sep', budgetBaselineUSD: 708000, spentUSD: 810000, varianceUSD: -102000 },
      ]
    }
  ];

  // If user has specific companies configured, enrich the company count and budgets dynamically
  if (companies.length > 0) {
    // If user has reset all company financials to 0
    const allCompaniesZero = companies.every(c => (c.annualBudgetUSD || 0) === 0 && (c.spentUSD || 0) === 0);
    if (allCompaniesZero) {
      return baseSectors.map(sec => ({
        ...sec,
        annualBudgetUSD: 0,
        spentUSD: 0,
        varianceUSD: 0,
        utilizationRate: 0,
        status: 'ON_TRACK',
        subcategories: sec.subcategories.map(sub => ({
          ...sub,
          budgetUSD: 0,
          spentUSD: 0,
          varianceUSD: 0,
          utilizationRate: 0,
        })),
        recentVouchers: [],
        monthlyTrend: sec.monthlyTrend.map(m => ({
          ...m,
          budgetBaselineUSD: 0,
          spentUSD: 0,
          varianceUSD: 0,
        })),
      }));
    }

    return baseSectors.map(sec => {
      // Find matching companies based on industry or code keywords
      const matchedCompanies = companies.filter(c => {
        const ind = (c.industry || '').toLowerCase();
        const nm = (c.name || '').toLowerCase();
        if (sec.id === 'sec-construction' && (ind.includes('construct') || ind.includes('infra') || nm.includes('bina') || nm.includes('const'))) return true;
        if (sec.id === 'sec-energy' && (ind.includes('energy') || ind.includes('power') || ind.includes('oil') || ind.includes('gas'))) return true;
        if (sec.id === 'sec-realestate' && (ind.includes('real') || ind.includes('estate') || ind.includes('tower') || ind.includes('property'))) return true;
        if (sec.id === 'sec-logistics' && (ind.includes('logic') || ind.includes('transport') || ind.includes('cargo') || ind.includes('freight'))) return true;
        if (sec.id === 'sec-manufacturing' && (ind.includes('manuf') || ind.includes('factor') || ind.includes('plant') || ind.includes('steel'))) return true;
        if (sec.id === 'sec-technology' && (ind.includes('tech') || ind.includes('it') || ind.includes('telecom') || ind.includes('software'))) return true;
        return false;
      });

      if (matchedCompanies.length > 0) {
        const compBudget = matchedCompanies.reduce((acc, c) => acc + (c.annualBudgetUSD || 0), 0);
        const compSpent = matchedCompanies.reduce((acc, c) => acc + (c.spentUSD || 0), 0);
        
        // If company has actual budget numbers, blend them
        const blendedBudget = compBudget > 0 ? compBudget : sec.annualBudgetUSD;
        const blendedSpent = compSpent > 0 ? compSpent : sec.spentUSD;
        const variance = blendedBudget - blendedSpent;
        const utilization = blendedBudget > 0 ? Number(((blendedSpent / blendedBudget) * 100).toFixed(1)) : 0;

        return {
          ...sec,
          companiesCount: Math.max(sec.companiesCount, matchedCompanies.length),
          annualBudgetUSD: blendedBudget,
          spentUSD: blendedSpent,
          varianceUSD: variance,
          utilizationRate: utilization,
          status: utilization > 95 ? 'ALERT' : utilization > 85 ? 'WARNING' : 'ON_TRACK',
        };
      }

      return sec;
    });
  }

  return baseSectors;
};
