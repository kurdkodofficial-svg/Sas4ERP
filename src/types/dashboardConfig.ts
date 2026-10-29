export type ExecutiveFocusPreset = 'ALL' | 'FINANCE' | 'PROJECTS' | 'RISK';

export type WidgetId =
  | 'macro_kpis'
  | 'kpi_overview'
  | 'ml_anomaly_monitor'
  | 'project_expenditure_chart'
  | 'general_managers'
  | 'financial_summary'
  | 'pending_approvals'
  | 'projects_radar'
  | 'subsidiary_matrix'
  | 'departmental_operations'
  | 'recent_activities'
  | 'directors_directory'
  | 'risk_compliance'
  | 'machinery_telemetry';

export interface WidgetConfig {
  id: WidgetId;
  name: string;
  nameKu?: string;
  nameAr?: string;
  description: string;
  enabled: boolean;
  order: number;
}

export type MacroKpiId = 
  | 'total_budget'
  | 'total_spent'
  | 'revenue_runway'
  | 'total_workforce'
  | 'pending_pos'
  | 'active_projects'
  | 'iqama_risk'
  | 'gate_deliveries';

export interface DashboardSettings {
  preset: ExecutiveFocusPreset;
  visibleWidgets: WidgetId[];
  widgetOrder: WidgetId[];
  selectedMacroKpis: MacroKpiId[];
  selectedCompanyFilter: string | 'ALL';
  selectedTimeHorizon: 'YTD' | 'Q3_2026' | 'LAST_30D';
  currencyDisplay: 'USD' | 'IQD';
  compactView: boolean;
}

export const defaultDashboardSettings: DashboardSettings = {
  preset: 'ALL',
  visibleWidgets: [
    'macro_kpis',
    'kpi_overview',
    'ml_anomaly_monitor',
    'project_expenditure_chart',
    'general_managers',
    'pending_approvals',
    'financial_summary',
    'projects_radar',
    'subsidiary_matrix',
    'departmental_operations',
    'recent_activities',
    'directors_directory',
    'risk_compliance',
  ],
  widgetOrder: [
    'macro_kpis',
    'kpi_overview',
    'ml_anomaly_monitor',
    'project_expenditure_chart',
    'general_managers',
    'pending_approvals',
    'financial_summary',
    'projects_radar',
    'subsidiary_matrix',
    'departmental_operations',
    'recent_activities',
    'directors_directory',
    'risk_compliance',
  ],
  selectedMacroKpis: [
    'total_budget',
    'total_spent',
    'total_workforce',
    'pending_pos',
  ],
  selectedCompanyFilter: 'ALL',
  selectedTimeHorizon: 'YTD',
  currencyDisplay: 'USD',
  compactView: false,
};

export const availableWidgetsList: { id: WidgetId; name: string; desc: string; category: string }[] = [
  { id: 'macro_kpis', name: 'Executive Macro KPIs', desc: 'Top high-level performance numbers and indicators', category: 'Overview' },
  { id: 'kpi_overview', name: 'KPI Overview: Budget vs. Actual Trends', desc: 'Visualizes sector performance metrics and budget vs actual spending trends using Recharts with itemized expense breakdown and PDF/Excel export', category: 'Overview' },
  { id: 'project_expenditure_chart', name: 'Real-Time Project Expenditure vs Budget (Recharts)', desc: 'Interactive Recharts dashboard visualizing project expenditure versus budget across different company subsidiaries', category: 'Finance' },
  { id: 'general_managers', name: 'General Managers Command & Progress (بەڕێوەبەرە گشتیەکان)', desc: 'Add, supervise, and inspect progress and dashboards of all Subsidiary General Managers under the Holding Owner', category: 'Management' },
  { id: 'pending_approvals', name: 'Urgent Owner Approvals', desc: 'Holding purchase authorizations above threshold ($5,000+)', category: 'Finance' },
  { id: 'financial_summary', name: 'Holding Financial Matrix & Burn Rate', desc: 'Visual charts comparing subsidiary budgets, spend, and cash runway', category: 'Finance' },
  { id: 'projects_radar', name: 'Group Projects Delivery & Milestones', desc: 'Milestone tracking, on-time health, and workforce on site across all projects', category: 'Operations' },
  { id: 'subsidiary_matrix', name: 'Subsidiaries Performance & Efficiency', desc: 'Detailed breakdown and comparisons for all managed group companies', category: 'Operations' },
  { id: 'departmental_operations', name: 'Holding Departmental Transparency & Operations', desc: 'Deep-dive inspection for Holding GM/Owner into all Engineering, Finance, Procurement, HSE, and Site departments', category: 'Governance' },
  { id: 'recent_activities', name: 'Live Corporate Activity Feed', desc: 'Real-time event stream of gate scans, POs, HSE logs, and letters', category: 'Activity' },
  { id: 'directors_directory', name: 'General Managers Quick-Dial & Comms', desc: 'Direct hotlines and video meeting dispatch to all subsidiary GMs', category: 'Management' },
  { id: 'risk_compliance', name: 'Expatriate Residence & Iqama Compliance', desc: 'Government visa/iqama expiration alerts and civil defense status', category: 'Governance' },
];
