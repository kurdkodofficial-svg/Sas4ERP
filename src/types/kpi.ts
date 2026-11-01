export interface SectorExpenseSubcategory {
  id: string;
  name: string;
  nameKu: string;
  nameAr: string;
  budgetUSD: number;
  spentUSD: number;
  varianceUSD: number;
  utilizationRate: number;
  color: string;
}

export interface SectorVoucherTransaction {
  id: string;
  date: string;
  voucherNumber: string;
  description: string;
  subcategory: string;
  companyName: string;
  vendor: string;
  amountUSD: number;
  status: 'AUDITED' | 'PENDING_AUDIT' | 'HOLDING_APPROVED';
}

export interface SectorMonthlyTrendPoint {
  month: string;
  budgetBaselineUSD: number;
  spentUSD: number;
  varianceUSD: number;
}

export interface HoldingSectorKpi {
  id: string;
  code: string;
  name: string;
  nameKu: string;
  nameAr: string;
  description: string;
  descriptionKu?: string;
  descriptionAr?: string;
  color: string;
  annualBudgetUSD: number;
  spentUSD: number;
  varianceUSD: number;
  utilizationRate: number;
  companiesCount: number;
  activeProjectsCount: number;
  primaryKpiMetric: string;
  primaryKpiValue: string;
  healthScore: number;
  status: 'EXCELLENT' | 'ON_TRACK' | 'WARNING' | 'ALERT';
  subcategories: SectorExpenseSubcategory[];
  recentVouchers: SectorVoucherTransaction[];
  monthlyTrend: SectorMonthlyTrendPoint[];
}

export type KpiTimeHorizon = 'YTD' | 'Q3_2026' | 'FULL_YEAR';
export type KpiMetricView = 'BUDGET_VS_SPENT' | 'UTILIZATION_RATE' | 'MONTHLY_TRAJECTORY' | 'TREND_PREDICTION';
