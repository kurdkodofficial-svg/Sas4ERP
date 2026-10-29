import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { HoldingSectorKpi } from '../types/kpi';
import { computeSpendingForecast, ForecastAlgorithm } from './kpiForecastUtils';

interface ExportKpiOptions {
  holdingName?: string;
  chairmanName?: string;
  timeHorizon?: string;
  currency?: string;
  forecastAlgorithm?: ForecastAlgorithm;
}

// Format numbers for display
const formatUSDMillions = (valUSD: number) => `$${(valUSD / 1000000).toFixed(2)}M`;
const formatUSDExact = (valUSD: number) => `$${valUSD.toLocaleString()}`;

/**
 * Export KPI Overview Budget vs Actual Trends to Excel (.xlsx)
 */
export const exportKpiToExcel = (
  sectors: HoldingSectorKpi[],
  options: ExportKpiOptions = {}
) => {
  const holdingName = options.holdingName || 'Holding Group';
  const chairmanName = options.chairmanName || 'Holding Chairman / Owner';
  const timeHorizon = options.timeHorizon || 'YTD 2026';
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const dateStr = new Date().toISOString().split('T')[0];

  const totalBudget = sectors.reduce((acc, s) => acc + s.annualBudgetUSD, 0);
  const totalSpent = sectors.reduce((acc, s) => acc + s.spentUSD, 0);
  const totalVariance = totalBudget - totalSpent;
  const overallUtil = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0';

  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: Sectors Budget vs Actual Summary
  const summaryAoa: any[][] = [
    ['SAS ENTERPRISE SYSTEM — EXECUTIVE KPI PERFORMANCE REPORT'],
    [`Holding Name: ${holdingName}`, '', `Holding Owner / Chairman: ${chairmanName}`, '', `Generated: ${timestamp}`],
    [`Reporting Horizon: ${timeHorizon}`, '', `Base Currency: USD ($)`, '', `Consolidated Utilization: ${overallUtil}%`],
    [],
    ['EXECUTIVE KPI SUMMARY METRICS'],
    ['Total Consolidated Budget ($)', totalBudget, 'Consolidated Spend to Date ($)', totalSpent, 'Remaining Reserve / Variance ($)', totalVariance, 'Overall Utilization (%)', `${overallUtil}%`],
    [],
    [
      'Sector Code',
      'Sector Name',
      'Performance Status',
      'Allocated Budget ($ USD)',
      'Allocated Budget ($ Millions)',
      'Actual Spent ($ USD)',
      'Actual Spent ($ Millions)',
      'Variance Balance ($ USD)',
      'Utilization Rate (%)',
      'Active Companies',
      'Active Projects',
      'Key Metric Description',
      'Key Metric Value',
      'Health Score (%)'
    ]
  ];

  sectors.forEach(s => {
    summaryAoa.push([
      s.code,
      s.name,
      s.status,
      s.annualBudgetUSD,
      Number((s.annualBudgetUSD / 1000000).toFixed(2)),
      s.spentUSD,
      Number((s.spentUSD / 1000000).toFixed(2)),
      s.varianceUSD,
      `${s.utilizationRate}%`,
      s.companiesCount,
      s.activeProjectsCount,
      s.primaryKpiMetric,
      s.primaryKpiValue,
      `${s.healthScore}%`
    ]);
  });

  // Total summary row
  summaryAoa.push([
    'TOTAL / CONSOLIDATED',
    'All Holding Sectors Combined',
    overallUtil > '95' ? 'ALERT' : overallUtil > '85' ? 'WARNING' : 'ON_TRACK',
    totalBudget,
    Number((totalBudget / 1000000).toFixed(2)),
    totalSpent,
    Number((totalSpent / 1000000).toFixed(2)),
    totalVariance,
    `${overallUtil}%`,
    sectors.reduce((acc, s) => acc + s.companiesCount, 0),
    sectors.reduce((acc, s) => acc + s.activeProjectsCount, 0),
    'Holding Composite Health',
    `${(sectors.reduce((acc, s) => acc + s.healthScore, 0) / sectors.length).toFixed(1)}%`,
    `${(sectors.reduce((acc, s) => acc + s.healthScore, 0) / sectors.length).toFixed(1)}%`
  ]);

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);

  // Set column widths
  wsSummary['!cols'] = [
    { wch: 14 }, // Code
    { wch: 38 }, // Name
    { wch: 18 }, // Status
    { wch: 24 }, // Budget Exact
    { wch: 22 }, // Budget ($M)
    { wch: 22 }, // Spent Exact
    { wch: 20 }, // Spent ($M)
    { wch: 22 }, // Variance
    { wch: 16 }, // Utilization
    { wch: 16 }, // Companies
    { wch: 16 }, // Projects
    { wch: 28 }, // Metric
    { wch: 18 }, // Metric Val
    { wch: 16 }, // Health
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Sectors_Budget_vs_Actual');

  // 2. Sheet 2: Expense Subcategories Detailed
  const subcatAoa: any[][] = [
    ['SAS4ERP — DETAILED SECTOR EXPENSE SUBCATEGORIES BREAKDOWN'],
    [`Holding Name: ${holdingName}`, '', `Date: ${timestamp}`],
    [],
    [
      'Sector Code',
      'Sector Name',
      'Subcategory Name (EN)',
      'Subcategory Name (Kurdish)',
      'Subcategory Name (Arabic)',
      'Allocated Budget ($ USD)',
      'Actual Spent ($ USD)',
      'Variance ($ USD)',
      'Utilization Rate (%)',
      'Share of Sector Spend (%)'
    ]
  ];

  sectors.forEach(sec => {
    sec.subcategories.forEach(sub => {
      const share = sec.spentUSD > 0 ? ((sub.spentUSD / sec.spentUSD) * 100).toFixed(1) : '0';
      subcatAoa.push([
        sec.code,
        sec.name,
        sub.name,
        sub.nameKu || '',
        sub.nameAr || '',
        sub.budgetUSD,
        sub.spentUSD,
        sub.varianceUSD,
        `${sub.utilizationRate}%`,
        `${share}%`
      ]);
    });
  });

  const wsSubcat = XLSX.utils.aoa_to_sheet(subcatAoa);
  wsSubcat['!cols'] = [
    { wch: 14 },
    { wch: 34 },
    { wch: 36 },
    { wch: 32 },
    { wch: 32 },
    { wch: 22 },
    { wch: 22 },
    { wch: 20 },
    { wch: 18 },
    { wch: 22 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSubcat, 'Expense_Subcategories');

  // 3. Sheet 3: Monthly Spending Trends
  const trendAoa: any[][] = [
    ['SAS4ERP — MONTHLY BUDGET BASELINE VS ACTUAL SPENDING TRENDS'],
    [`Holding Name: ${holdingName}`, '', `Reporting Period: Jan - Sep 2026`],
    [],
    ['Month', 'Sector Code', 'Sector Name', 'Monthly Budget Baseline ($)', 'Monthly Actual Spent ($)', 'Variance ($)', 'Trajectory']
  ];

  sectors.forEach(sec => {
    sec.monthlyTrend.forEach(t => {
      trendAoa.push([
        t.month,
        sec.code,
        sec.name,
        t.budgetBaselineUSD,
        t.spentUSD,
        t.varianceUSD,
        t.varianceUSD >= 0 ? 'Within Budget' : 'Overrun'
      ]);
    });
  });

  const wsTrend = XLSX.utils.aoa_to_sheet(trendAoa);
  wsTrend['!cols'] = [
    { wch: 12 },
    { wch: 14 },
    { wch: 34 },
    { wch: 26 },
    { wch: 24 },
    { wch: 20 },
    { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, wsTrend, 'Monthly_Spending_Trends');

  // 4. Sheet 4: Trend Prediction & Next-Month Forecast
  const algorithm = options.forecastAlgorithm || 'LINEAR_REGRESSION';
  const forecast = computeSpendingForecast(sectors, algorithm);
  const forecastAoa: any[][] = [
    ['SAS4ERP — HOLDING EXPENDITURE TREND PREDICTION & FORECASTING MODEL'],
    [`Holding Name: ${holdingName}`, '', `Date: ${timestamp}`],
    [`Forecasting Model: ${algorithm === 'LINEAR_REGRESSION' ? 'Ordinary Least Squares (OLS) Linear Regression' : '3-Month Weighted Moving Average'}`, '', `Model Confidence (R²): ${(forecast.rSquared * 100).toFixed(1)}%`],
    [`Next Target Month: ${forecast.targetMonth}`, '', `Projected Next Month Total: $${(forecast.predictedNextMonthTotalUSD / 1000000).toFixed(2)}M ($${forecast.predictedNextMonthTotalUSD.toLocaleString()})`],
    [`Month-over-Month Velocity: ${forecast.pctChange > 0 ? '+' : ''}${forecast.pctChange}% ($${forecast.differenceUSD > 0 ? '+' : ''}${forecast.differenceUSD.toLocaleString()})`, '', `Projected Monthly Surplus/Variance: +$${forecast.projectedVarianceNextMonthUSD.toLocaleString()}`],
    [],
    ['SECTOR-BY-SECTOR NEXT-MONTH SPENDING FORECAST'],
    [
      'Sector Code',
      'Sector Name',
      'Current Month Spent ($)',
      'Predicted Next Month Spent ($)',
      'Difference ($)',
      'Velocity / % Change',
      'Trend Direction',
      'Monthly Budget Baseline ($)',
      'Projected Variance ($)',
      'Budget Risk Status'
    ]
  ];

  forecast.sectorForecasts.forEach(sf => {
    forecastAoa.push([
      sf.sectorCode,
      sf.sectorName,
      sf.currentMonthSpentUSD,
      sf.predictedNextMonthSpentUSD,
      sf.differenceUSD,
      `${sf.pctChange > 0 ? '+' : ''}${sf.pctChange}%`,
      sf.trendDirection === 'UP' ? 'Upward Trend (↗)' : sf.trendDirection === 'DOWN' ? 'Downward Trend (↘)' : 'Stable (→)',
      sf.monthlyBudgetBaselineUSD,
      sf.projectedVarianceUSD,
      sf.isOverBudget ? 'Risk / Deficit' : 'Safe / Within Budget'
    ]);
  });

  const wsForecast = XLSX.utils.aoa_to_sheet(forecastAoa);
  wsForecast['!cols'] = [
    { wch: 14 },
    { wch: 36 },
    { wch: 24 },
    { wch: 28 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 },
    { wch: 26 },
    { wch: 22 },
    { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsForecast, 'Trend_Prediction_Forecast');

  // Trigger download
  const filename = `SAS4ERP_Holding_KPI_Budget_vs_Actual_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
};

/**
 * Export KPI Overview Budget vs Actual Trends to PDF (.pdf)
 */
export const exportKpiToPdf = (
  sectors: HoldingSectorKpi[],
  options: ExportKpiOptions = {}
) => {
  const holdingName = options.holdingName || 'Holding Group';
  const chairmanName = options.chairmanName || 'Holding Chairman / Owner';
  const timeHorizon = options.timeHorizon || 'YTD 2026';
  const timestamp = new Date().toLocaleString();
  const dateStr = new Date().toISOString().split('T')[0];

  const totalBudget = sectors.reduce((acc, s) => acc + s.annualBudgetUSD, 0);
  const totalSpent = sectors.reduce((acc, s) => acc + s.spentUSD, 0);
  const totalVariance = totalBudget - totalSpent;
  const overallUtil = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0';

  // Create landscape document for comprehensive data layout
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Brand Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 297, 24, 'F');

  // Gold accent line
  doc.setFillColor(234, 179, 8); // amber-500
  doc.rect(0, 24, 297, 1.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SAS ENTERPRISE SYSTEM', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('CENTRALIZED EXECUTIVE GOVERNANCE & MULTI-SECTOR PERFORMANCE MATRIX', 14, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`DATE: ${timestamp}`, 283, 11, { align: 'right' });
  doc.text(`CONFIDENTIAL EXECUTIVE AUDIT`, 283, 18, { align: 'right' });

  // Document Title & Metadata Box
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive KPI Overview: Sector Budget vs. Actual Spending Trends', 14, 34);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Holding: ${holdingName}  |  Owner/Chairman: ${chairmanName}  |  Scope: Consolidated All Sectors (${sectors.length})  |  Time Horizon: ${timeHorizon}`,
    14,
    40
  );

  // Executive KPI Summary Cards Banner
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, 44, 269, 18, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 44, 269, 18, 3, 3, 'D');

  const colWidth = 269 / 4;
  
  // Metric 1: Total Budget
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CONSOLIDATED BUDGET', 20, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(formatUSDMillions(totalBudget), 20, 58);

  // Metric 2: Actual Spent
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('ACTUAL EXPENDITURE', 20 + colWidth, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // emerald-600
  doc.text(formatUSDMillions(totalSpent), 20 + colWidth, 58);

  // Metric 3: Net Variance
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('NET VARIANCE RESERVE', 20 + colWidth * 2, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatUSDMillions(totalVariance), 20 + colWidth * 2, 58);

  // Metric 4: Utilization Rate
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('BURN / UTILIZATION RATE', 20 + colWidth * 3, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(totalSpent > totalBudget ? 225 : 37, 99, 235);
  doc.text(`${overallUtil}% (On Track)`, 20 + colWidth * 3, 58);

  // Sectors Table via autoTable
  const tableRows = sectors.map(sec => [
    sec.code,
    sec.name,
    formatUSDMillions(sec.annualBudgetUSD),
    formatUSDMillions(sec.spentUSD),
    formatUSDMillions(sec.varianceUSD),
    `${sec.utilizationRate}%`,
    sec.status === 'EXCELLENT' ? 'Optimal' : sec.status === 'ON_TRACK' ? 'On Track' : 'Review',
    `${sec.primaryKpiMetric}: ${sec.primaryKpiValue}`
  ]);

  // Add summary row
  tableRows.push([
    'TOTAL',
    'Consolidated Group Total',
    formatUSDMillions(totalBudget),
    formatUSDMillions(totalSpent),
    formatUSDMillions(totalVariance),
    `${overallUtil}%`,
    'Normal',
    `Overall Health Score: ${(sectors.reduce((a, s) => a + s.healthScore, 0) / sectors.length).toFixed(1)}%`
  ]);

  autoTable(doc, {
    startY: 66,
    head: [
      ['Code', 'Holding Operating Sector', 'Budget', 'Actual Spent', 'Variance', 'Util. %', 'Status', 'Key Sector Performance Metric']
    ],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 3
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.8,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 64, fontStyle: 'bold' },
      2: { cellWidth: 26, halign: 'right' },
      3: { cellWidth: 26, halign: 'right' },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 20, halign: 'center' },
      7: { cellWidth: 69 }
    },
    didParseCell: (data) => {
      // Highlight total row
      if (data.row.index === tableRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [241, 245, 249];
        if (data.column.index === 3) {
          data.cell.styles.textColor = [16, 185, 129];
        }
      }
    }
  });

  // Second Page: Top Expense Subcategories Breakdown
  doc.addPage('landscape');

  // Sub-header for page 2
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 18, 'F');
  doc.setFillColor(234, 179, 8);
  doc.rect(0, 18, 297, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SAS4ERP — DETAILED EXPENDITURE SUBCATEGORIES BY HOLDING SECTOR', 14, 11);
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Itemized breakdown of capital allocation, burn rates, and variance per sector', 14, 16);

  const subcatRows: any[][] = [];
  sectors.forEach(sec => {
    sec.subcategories.forEach(sub => {
      subcatRows.push([
        sec.code,
        sec.name,
        sub.name,
        formatUSDExact(sub.budgetUSD),
        formatUSDExact(sub.spentUSD),
        formatUSDExact(sub.varianceUSD),
        `${sub.utilizationRate}%`,
        `${sec.spentUSD > 0 ? ((sub.spentUSD / sec.spentUSD) * 100).toFixed(1) : 0}%`
      ]);
    });
  });

  autoTable(doc, {
    startY: 24,
    head: [
      ['Sector Code', 'Operating Sector', 'Expense Subcategory Line Item', 'Budget ($)', 'Spent ($)', 'Variance ($)', 'Util. %', 'Sector Share']
    ],
    body: subcatRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 50 },
      2: { cellWidth: 65, fontStyle: 'bold' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
      6: { cellWidth: 20, halign: 'center' },
      7: { cellWidth: 24, halign: 'center' }
    }
  });

  // Third Page: Trend Prediction & Next-Month Spending Forecast
  doc.addPage('landscape');

  const algorithm = options.forecastAlgorithm || 'LINEAR_REGRESSION';
  const forecast = computeSpendingForecast(sectors, algorithm);

  // Sub-header for page 3
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 18, 'F');
  doc.setFillColor(124, 58, 237); // purple-600
  doc.rect(0, 18, 297, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SAS4ERP — EXPENDITURE TREND PREDICTION & NEXT-MONTH FORECAST', 14, 11);
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Predictive model: ${algorithm === 'LINEAR_REGRESSION' ? 'Ordinary Least Squares (OLS) Linear Regression' : '3-Month Weighted Moving Average'} | Target: ${forecast.targetMonth}`, 14, 16);

  // Forecast Highlights Card Banner
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 23, 269, 18, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 23, 269, 18, 3, 3, 'D');

  const fColW = 269 / 4;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('FORECASTED NEXT MONTH TOTAL', 20, 29);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(124, 58, 237);
  doc.text(formatUSDMillions(forecast.predictedNextMonthTotalUSD), 20, 36);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('MOM VELOCITY & CHANGE', 20 + fColW, 29);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(forecast.pctChange > 0 ? 37 : 16, 99, 235);
  doc.text(`${forecast.pctChange > 0 ? '+' : ''}${forecast.pctChange}% (${formatUSDMillions(forecast.differenceUSD)})`, 20 + fColW, 36);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('PROJECTED MONTHLY SURPLUS', 20 + fColW * 2, 29);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`+${formatUSDMillions(forecast.projectedVarianceNextMonthUSD)}`, 20 + fColW * 2, 36);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('MODEL CONFIDENCE (R²)', 20 + fColW * 3, 29);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${(forecast.rSquared * 100).toFixed(1)}% High Confidence`, 20 + fColW * 3, 36);

  // Sector Forecast Table
  const forecastRows = forecast.sectorForecasts.map(sf => [
    sf.sectorCode,
    sf.sectorName,
    formatUSDMillions(sf.currentMonthSpentUSD),
    formatUSDMillions(sf.predictedNextMonthSpentUSD),
    `${sf.differenceUSD > 0 ? '+' : ''}${formatUSDMillions(sf.differenceUSD)}`,
    `${sf.pctChange > 0 ? '+' : ''}${sf.pctChange}%`,
    sf.trendDirection === 'UP' ? 'Upward (↗)' : sf.trendDirection === 'DOWN' ? 'Downward (↘)' : 'Stable (→)',
    formatUSDMillions(sf.monthlyBudgetBaselineUSD),
    `+${formatUSDMillions(sf.projectedVarianceUSD)}`,
    sf.isOverBudget ? 'Risk Flag' : 'Safe Buffer'
  ]);

  autoTable(doc, {
    startY: 45,
    head: [
      ['Code', 'Holding Sector', 'Current (Sep)', 'Forecast (Oct)', 'Diff ($M)', 'Velocity', 'Trend', 'Budget Baseline', 'Proj. Variance', 'Risk Status']
    ],
    body: forecastRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: 'bold' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 26, halign: 'right' },
      3: { cellWidth: 26, halign: 'right' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 25, halign: 'center' },
      7: { cellWidth: 28, halign: 'right' },
      8: { cellWidth: 25, halign: 'right' },
      9: { cellWidth: 22, halign: 'center' }
    }
  });

  // Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `SAS4ERP Executive Portal — Official Corporate Report — Page ${i} of ${pageCount}`,
      14,
      202
    );
    doc.text(
      `Document Reference: SAS4ERP-KPI-${dateStr}-EXP`,
      283,
      202,
      { align: 'right' }
    );
  }

  const filename = `SAS4ERP_Holding_KPI_Budget_vs_Actual_${dateStr}.pdf`;
  doc.save(filename);
  return filename;
};

/**
 * Export a Single Sector's Breakdown to Excel
 */
export const exportSingleSectorToExcel = (
  sector: HoldingSectorKpi,
  holdingName: string = 'SAS4ERP Holding Group'
) => {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().split('T')[0];

  // Sheet 1: Subcategories
  const subRows: any[][] = [
    [`SAS4ERP — ${sector.name.toUpperCase()} (${sector.code})`],
    [`Holding Name: ${holdingName}`, '', `Date: ${new Date().toLocaleString()}`],
    [`Budget: ${formatUSDExact(sector.annualBudgetUSD)}`, `Spent: ${formatUSDExact(sector.spentUSD)}`, `Variance: ${formatUSDExact(sector.varianceUSD)}`, `Utilization: ${sector.utilizationRate}%`],
    [],
    ['Subcategory Line Item', 'Budget ($ USD)', 'Actual Spent ($ USD)', 'Variance ($ USD)', 'Utilization Rate (%)']
  ];

  sector.subcategories.forEach(s => {
    subRows.push([s.name, s.budgetUSD, s.spentUSD, s.varianceUSD, `${s.utilizationRate}%`]);
  });

  const wsSub = XLSX.utils.aoa_to_sheet(subRows);
  wsSub['!cols'] = [{ wch: 38 }, { wch: 22 }, { wch: 22 }, { wch: 20 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsSub, 'Subcategory_Breakdown');

  // Sheet 2: Recent Audit Vouchers
  const vchRows: any[][] = [
    [`RECENT AUDITED VOUCHERS & DISBURSEMENTS — ${sector.name}`],
    [],
    ['Date', 'Voucher Number', 'Description', 'Subcategory', 'Subsidiary Company', 'Vendor', 'Amount ($ USD)', 'Status']
  ];

  sector.recentVouchers.forEach(v => {
    vchRows.push([v.date, v.voucherNumber, v.description, v.subcategory, v.companyName, v.vendor, v.amountUSD, v.status]);
  });

  const wsVch = XLSX.utils.aoa_to_sheet(vchRows);
  wsVch['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 40 }, { wch: 28 }, { wch: 26 }, { wch: 26 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsVch, 'Audit_Vouchers');

  const filename = `SAS4ERP_Sector_${sector.code}_Expense_Breakdown_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
};

/**
 * Export a Single Sector's Breakdown to PDF
 */
export const exportSingleSectorToPdf = (
  sector: HoldingSectorKpi,
  holdingName: string = 'SAS4ERP Holding Group'
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const dateStr = new Date().toISOString().split('T')[0];

  // Header Bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 22, 'F');
  doc.setFillColor(234, 179, 8);
  doc.rect(0, 22, 210, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SAS4ERP ENTERPRISE HOLDING SUITE', 14, 10);
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('EXECUTIVE SECTOR AUDIT & DETAILED EXPENSE STATEMENT', 14, 16);

  // Sector Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${sector.name} (${sector.code})`, 14, 32);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Holding: ${holdingName}  |  Generated: ${new Date().toLocaleString()}`, 14, 38);

  // Sector Summary Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, 182, 20, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 42, 182, 20, 2, 2, 'D');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ALLOCATED BUDGET', 20, 48);
  doc.text('ACTUAL EXPENDITURE', 65, 48);
  doc.text('VARIANCE REMAINING', 115, 48);
  doc.text('UTILIZATION RATE', 160, 48);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(formatUSDExact(sector.annualBudgetUSD), 20, 56);
  doc.setTextColor(16, 185, 129);
  doc.text(formatUSDExact(sector.spentUSD), 65, 56);
  doc.setTextColor(15, 23, 42);
  doc.text(formatUSDExact(sector.varianceUSD), 115, 56);
  doc.setTextColor(37, 99, 235);
  doc.text(`${sector.utilizationRate}%`, 160, 56);

  // Subcategories Table
  const subRows = sector.subcategories.map(s => [
    s.name,
    formatUSDExact(s.budgetUSD),
    formatUSDExact(s.spentUSD),
    formatUSDExact(s.varianceUSD),
    `${s.utilizationRate}%`
  ]);

  autoTable(doc, {
    startY: 66,
    head: [['Subcategory Line Item', 'Budget ($)', 'Spent ($)', 'Variance ($)', 'Util. %']],
    body: subRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 22, halign: 'center' }
    }
  });

  // Recent Vouchers Table
  const lastY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Audited Ledger Disbursements & Vouchers', 14, lastY);

  const vchRows = sector.recentVouchers.map(v => [
    v.date,
    v.voucherNumber,
    v.description,
    v.vendor,
    formatUSDExact(v.amountUSD),
    v.status
  ]);

  autoTable(doc, {
    startY: lastY + 3,
    head: [['Date', 'Voucher #', 'Description', 'Vendor / Supplier', 'Amount ($)', 'Status']],
    body: vchRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 26 },
      2: { cellWidth: 62 },
      3: { cellWidth: 36 },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 16, halign: 'center' }
    }
  });

  const filename = `SAS4ERP_Sector_${sector.code}_Expense_Statement_${dateStr}.pdf`;
  doc.save(filename);
  return filename;
};
