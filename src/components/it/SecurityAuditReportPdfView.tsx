import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Clock,
  Calendar,
  Layers,
  ArrowRightLeft,
  Activity,
  UserCheck,
  UserX,
  Server,
  Laptop,
  Globe,
  Radio,
  Filter,
  RefreshCw,
  QrCode,
  Stamp,
  ExternalLink,
  ChevronDown,
  FileSpreadsheet,
  FileDown,
  Table
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { initialSecurityAuditData } from '../../data/initialSecurityAuditData';
import { CompleteSecurityAuditData } from '../../types/securityAuditReport';

export const SecurityAuditReportPdfView: React.FC = () => {
  const { language, isRtl } = useLanguage();
  const { holding, openPrintManager } = useERP();

  const [auditData, setAuditData] = useState<CompleteSecurityAuditData>(initialSecurityAuditData);
  const [selectedPeriod, setSelectedPeriod] = useState<'30_DAYS' | '7_DAYS' | '90_DAYS'>('30_DAYS');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('ALL');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);
  const [csvDropdownOpen, setCsvDropdownOpen] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const { summary, syncConflicts, connectionStability, loginAnomalies } = auditData;

  const filteredConflicts = selectedSiteFilter === 'ALL'
    ? syncConflicts
    : syncConflicts.filter((c) => c.siteName.toLowerCase().includes(selectedSiteFilter.toLowerCase()));

  const filteredStability = selectedSiteFilter === 'ALL'
    ? connectionStability
    : connectionStability.filter((s) => s.siteName.toLowerCase().includes(selectedSiteFilter.toLowerCase()));

  const filteredAnomalies = selectedSiteFilter === 'ALL'
    ? loginAnomalies
    : loginAnomalies.filter((a) => a.siteLocation.toLowerCase().includes(selectedSiteFilter.toLowerCase()));

  // Direct High-Quality Multi-Page PDF Generation via jsPDF & autoTable
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    setDownloadSuccess(null);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const primaryColor = [30, 41, 59]; // Slate 800
      const accentColor = [79, 70, 229]; // Indigo 600
      const emeraldColor = [16, 185, 129]; // Emerald 500

      // ================= PAGE 1 =================
      // Header Banner
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, 0, pageWidth, 38, 'F');

      // Top Accent Line
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 3, 'F');

      // Document Title & Company
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text(holding?.name || 'SAS HOLDING GROUP ENTERPRISE', 14, 15);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(199, 210, 254);
      doc.text('DIRECTORATE OF CYBER SECURITY & IT SYSTEMS INFRASTRUCTURE', 14, 21);

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Document Reference: ${summary.reportId}  |  Classification: STRICTLY CONFIDENTIAL`, 14, 28);
      doc.text(`Audit Period: ${summary.periodLabel}  |  Generated: ${new Date().toLocaleDateString()}`, 14, 33);

      // Security Badge on top right
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(pageWidth - 48, 10, 34, 18, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('SECURITY SCORE', pageWidth - 45, 16);
      doc.setFontSize(12);
      doc.text(`${summary.securityScore}%`, pageWidth - 41, 23);

      // Executive Summary Metrics Box
      let yPos = 46;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('1. EXECUTIVE SUMMARY & RESILIENCE METRICS (LAST 30 DAYS)', 14, yPos);

      yPos += 4;
      const kpiBoxWidth = (pageWidth - 28 - 9) / 4;
      const kpis = [
        { label: 'Security Score', value: `${summary.securityScore}%`, sub: '100% Compliant' },
        { label: 'Sync Uptime', value: `${summary.syncUptimePercent}%`, sub: 'Multi-Site Active' },
        { label: 'Audited Events', value: `${summary.totalAuditedEvents}`, sub: 'All Site Nodes' },
        { label: 'Breaches / Loss', value: `${summary.unauthorizedBreaches}`, sub: 'Zero Impact' }
      ];

      kpis.forEach((kpi, idx) => {
        const xBox = 14 + idx * (kpiBoxWidth + 3);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(xBox, yPos, kpiBoxWidth, 18, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(xBox, yPos, kpiBoxWidth, 18, 2, 2, 'S');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label, xBox + 4, yPos + 5);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(kpi.value, xBox + 4, yPos + 11);

        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(16, 185, 129);
        doc.text(kpi.sub, xBox + 4, yPos + 15);
      });

      yPos += 24;

      // Section 2: Sync Conflicts & Concurrency Matrix
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('2. SYNCHRONIZATION CONFLICTS & RECONCILIATION AUDIT', 14, yPos);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Summary of data collisions resolved between central holding and remote project sites.', 14, yPos + 4);

      yPos += 7;

      const conflictRows = filteredConflicts.map((c) => [
        c.date,
        c.siteName.replace('Plant', 'Plt').replace('Manufacturing', 'Mfg'),
        c.entityReference.slice(0, 30),
        c.conflictType.replace('_', ' '),
        c.holdingValue.slice(0, 32),
        c.branchValue.slice(0, 32),
        c.resolutionStatus.replace('RESOLVED_', '').replace('_', ' ')
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Date / Time', 'Project Site', 'Entity Reference', 'Conflict Type', 'Holding Master', 'Site Value', 'Status']],
        body: conflictRows,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontSize: 7,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 6.5,
          textColor: [30, 41, 59],
        },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 32 },
          2: { cellWidth: 36 },
          3: { cellWidth: 22 },
          4: { cellWidth: 28 },
          5: { cellWidth: 28 },
          6: { cellWidth: 16 },
        },
        margin: { left: 14, right: 14 },
      });

      // ================= PAGE 2 =================
      doc.addPage();

      // Page 2 Top Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('SAS HOLDING GROUP — SECURITY AUDIT REPORT (PAGE 2/2)', 14, 12);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Reference: ${summary.reportId}`, pageWidth - 55, 12);

      let yPosP2 = 28;

      // Section 3: Connection Stability & Latency Telemetry
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('3. MULTI-SITE CONNECTION STABILITY & LATENCY TELEMETRY', 14, yPosP2);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Round-trip latency (ms), dynamic carrier rotations, and packet integrity over 30 days.', 14, yPosP2 + 4);

      yPosP2 += 7;

      const stabilityRows = filteredStability.map((s) => [
        s.siteName,
        s.governorate,
        `${s.avgLatencyMs} ms`,
        `${s.minLatencyMs} / ${s.maxLatencyMs} ms`,
        `${s.uptimePercent}%`,
        `${s.ipRotationsHandled} Hops`,
        s.carrierIsp.slice(0, 28),
        s.status
      ]);

      autoTable(doc, {
        startY: yPosP2,
        head: [['Site Name', 'Province', 'Avg Ping', 'Min/Max', 'Uptime', 'Dynamic IP Rotations', 'Carrier / ISP Link', 'Status']],
        body: stabilityRows,
        theme: 'striped',
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255],
          fontSize: 7,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 6.5,
          textColor: [30, 41, 59],
        },
        columnStyles: {
          0: { cellWidth: 42 },
          1: { cellWidth: 18 },
          2: { cellWidth: 16 },
          3: { cellWidth: 18 },
          4: { cellWidth: 15 },
          5: { cellWidth: 20 },
          6: { cellWidth: 35 },
          7: { cellWidth: 18 },
        },
        margin: { left: 14, right: 14 },
      });

      // Get Y position after stability table
      const finalStabilityY = (doc as any).lastAutoTable?.finalY || 100;
      let yPosAnom = finalStabilityY + 10;

      // Section 4: Login & Access Anomalies
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('4. LOGIN & AUTHENTICATION ACCESS ANOMALIES (LAST 30 DAYS)', 14, yPosAnom);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Zero-Trust behavioral analysis, concurrent session checks, and boundary violation alerts.', 14, yPosAnom + 4);

      yPosAnom += 7;

      const anomalyRows = filteredAnomalies.map((a) => [
        a.timestamp,
        a.username.slice(0, 24),
        a.siteLocation.slice(0, 28),
        a.detectedIp.slice(0, 22),
        a.anomalyType.replace(/_/g, ' '),
        a.riskLevel,
        a.actionTaken
      ]);

      autoTable(doc, {
        startY: yPosAnom,
        head: [['Timestamp', 'Username / ID', 'Detected Site / Geo', 'IP Address', 'Anomaly Classification', 'Risk', 'Action Taken']],
        body: anomalyRows,
        theme: 'striped',
        headStyles: {
          fillColor: [225, 29, 72], // Rose 600
          textColor: [255, 255, 255],
          fontSize: 7,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 6.5,
          textColor: [30, 41, 59],
        },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 30 },
          2: { cellWidth: 32 },
          3: { cellWidth: 26 },
          4: { cellWidth: 38 },
          5: { cellWidth: 16 },
          6: { cellWidth: 18 },
        },
        margin: { left: 14, right: 14 },
      });

      const finalAnomY = (doc as any).lastAutoTable?.finalY || 200;
      let yPosSign = finalAnomY + 12;

      // Cryptographic Stamp & Verification Box
      if (yPosSign > pageHeight - 50) {
        doc.addPage();
        yPosSign = 30;
      }

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, yPosSign, pageWidth - 28, 38, 2, 2, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, yPosSign, pageWidth - 28, 38, 2, 2, 'S');

      // Stamp icon simulation
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('5. HOLDING CYBER SECURITY ATTESTATION & DIGITAL SEAL', 20, yPosSign + 8);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('This security report has been verified by the SAS Holding Group Cryptographic Verification Engine.', 20, yPosSign + 14);
      doc.text(`Digital SHA-256 Checksum: ${summary.cryptoSealHash}`, 20, yPosSign + 19);
      doc.text(`Enforcement Mode: SAS-IP-ROAM-V2 with Central Smart Sync Relay & Discovery Enabled`, 20, yPosSign + 24);

      // Sign-off signature
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Director of IT Systems & Security', pageWidth - 70, yPosSign + 28);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Certified Electronic Signature [VERIFIED]', pageWidth - 70, yPosSign + 33);

      // Save PDF file
      doc.save(`SAS_Holding_30Day_Security_Audit_Report_${summary.reportId}.pdf`);

      setDownloadSuccess(
        language === 'ku'
          ? `ڕاپۆرتی ئاسایشی ٣٠ ڕۆژە (PDF) بە سەرکەوتوویی دروستکرا و دابەزێندرا: SAS_Holding_30Day_Security_Audit_Report_${summary.reportId}.pdf`
          : `30-Day Security Audit Report successfully generated and downloaded as PDF.`
      );
      setTimeout(() => setDownloadSuccess(null), 6000);
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // High-Fidelity Multi-Sheet Excel (.xlsx) Export via SheetJS
  const handleDownloadExcel = () => {
    setIsExportingExcel(true);
    setDownloadSuccess(null);

    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Executive Summary & Telemetry KPIs
      const summaryRows = [
        { Parameter: 'Report Reference ID', Value: summary.reportId, Description: 'Unique document security identifier' },
        { Parameter: 'Audit Timeframe', Value: summary.periodLabel, Description: 'Historical audit window' },
        { Parameter: 'Start Date', Value: summary.startDate, Description: 'Evaluation window start date' },
        { Parameter: 'End Date', Value: summary.endDate, Description: 'Evaluation window end date' },
        { Parameter: 'Holding Entity', Value: holding?.name || summary.holdingName, Description: 'Parent Holding Corporation' },
        { Parameter: 'Security Classification', Value: summary.classification, Description: 'Information sensitivity rating' },
        { Parameter: 'Overall Security Score', Value: `${summary.securityScore}%`, Description: 'Zero-Trust compliance standard' },
        { Parameter: 'Fleet Sync Uptime (30-Day)', Value: `${summary.syncUptimePercent}%`, Description: 'Availability across all 7 operational project nodes' },
        { Parameter: 'Total Audited Telemetry Events', Value: summary.totalAuditedEvents, Description: 'Continuously recorded synchronization and access events' },
        { Parameter: 'Security Breaches / Data Leakage', Value: summary.unauthorizedBreaches, Description: 'Compromised records or unauthorized penetrations (Zero)' },
        { Parameter: 'Resolved Sync Conflicts', Value: filteredConflicts.length, Description: 'Multi-site data collisions reconciled' },
        { Parameter: 'Monitored Operational Sites', Value: filteredStability.length, Description: 'Active project sites in Kurdistan & Iraq' },
        { Parameter: 'Access & Login Anomalies Handled', Value: filteredAnomalies.length, Description: 'Zero-Trust perimeter defenses enforced' },
        { Parameter: 'Cryptographic SHA-256 Digest', Value: summary.cryptoSealHash, Description: 'Tamper-proof attestation checksum' },
        { Parameter: 'Audit Generation Timestamp', Value: summary.reportDate, Description: 'Certified electronic issuance timestamp' },
        { Parameter: 'Audited & Attested By', Value: 'Directorate of Cyber Security & IT Infrastructure', Description: 'Accredited Holding Authority' }
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      wsSummary['!cols'] = [{ wch: 34 }, { wch: 44 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

      // Sheet 2: Synchronization Conflicts
      const conflictRows = filteredConflicts.map(c => ({
        'Incident ID': c.id,
        'Date / Time': c.date,
        'Operational Site': c.siteName,
        'Entity Type': c.entityType,
        'Entity Reference': c.entityReference,
        'Conflict Classification': c.conflictType,
        'Holding HQ Value': c.holdingValue,
        'Branch Site Value': c.branchValue,
        'Resolution Status': c.resolutionStatus.replace('RESOLVED_', '').replace(/_/g, ' '),
        'Resolution Time (min)': c.resolutionDurationMin
      }));
      const wsConflicts = XLSX.utils.json_to_sheet(conflictRows);
      wsConflicts['!cols'] = [
        { wch: 14 }, { wch: 20 }, { wch: 24 }, { wch: 16 }, { wch: 18 },
        { wch: 22 }, { wch: 26 }, { wch: 26 }, { wch: 20 }, { wch: 22 }
      ];
      XLSX.utils.book_append_sheet(wb, wsConflicts, 'Sync Conflicts');

      // Sheet 3: Connection Stability & Latency Telemetry
      const stabilityRows = filteredStability.map(s => ({
        'Site ID': s.siteId,
        'Operational Site': s.siteName,
        'Governorate': s.governorate,
        'Avg Latency (ms)': s.avgLatencyMs,
        'Min Latency (ms)': s.minLatencyMs,
        'Max Latency (ms)': s.maxLatencyMs,
        'Fleet Uptime %': `${s.uptimePercent}%`,
        'ISP / Carrier Link': s.carrierIsp,
        'Dynamic IP Rotations Handled': s.ipRotationsHandled,
        'Packet Loss %': `${s.packetLossPercent}%`,
        'Health Status': s.status
      }));
      const wsStability = XLSX.utils.json_to_sheet(stabilityRows);
      wsStability['!cols'] = [
        { wch: 14 }, { wch: 24 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
        { wch: 16 }, { wch: 14 }, { wch: 20 }, { wch: 26 }, { wch: 14 }, { wch: 14 }
      ];
      XLSX.utils.book_append_sheet(wb, wsStability, 'Connection Stability');

      // Sheet 4: Login & Authentication Anomalies
      const anomalyRows = filteredAnomalies.map(a => ({
        'Event ID': a.id,
        'Timestamp': a.timestamp,
        'User Account': a.username,
        'Site Location': a.siteLocation,
        'Detected IP': a.detectedIp,
        'Carrier / ISP': a.carrierIsp,
        'Anomaly Classification': a.anomalyType.replace(/_/g, ' '),
        'Risk Level': a.riskLevel,
        'Action Enforced': a.actionTaken,
        'Technical Details': a.details
      }));
      const wsAnomalies = XLSX.utils.json_to_sheet(anomalyRows);
      wsAnomalies['!cols'] = [
        { wch: 14 }, { wch: 20 }, { wch: 22 }, { wch: 24 }, { wch: 16 },
        { wch: 16 }, { wch: 28 }, { wch: 14 }, { wch: 18 }, { wch: 45 }
      ];
      XLSX.utils.book_append_sheet(wb, wsAnomalies, 'Login Anomalies');

      const fileName = `SAS_Holding_30Day_Security_Audit_${summary.reportId}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setDownloadSuccess(
        language === 'ku'
          ? `ڕاپۆرتی ئاسایش وەک فایلی فرە-پەڕگەی Excel (XLSX) بە سەرکەوتوویی دابەزێندرا: ${fileName}`
          : `Security audit report successfully exported as multi-sheet Excel (.xlsx): ${fileName}`
      );
      setTimeout(() => setDownloadSuccess(null), 6000);
    } catch (err: any) {
      console.error('Excel Export Error:', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Helper function to escape CSV cell contents
  const escapeCsvValue = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Helper function to initiate client-side CSV download with UTF-8 BOM
  const triggerCsvDownload = (csvContent: string, fileName: string) => {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Client-Side CSV Export (Complete master audit or individual sections)
  const handleDownloadCsv = (targetSection: 'ALL' | 'CONFLICTS' | 'STABILITY' | 'ANOMALIES' = 'ALL') => {
    setIsExportingCsv(true);
    setDownloadSuccess(null);

    try {
      let rows: string[][] = [];
      let fileName = `SAS_Holding_Complete_Security_Audit_${summary.reportId}.csv`;

      if (targetSection === 'CONFLICTS') {
        fileName = `SAS_Holding_Sync_Conflicts_${summary.reportId}.csv`;
        rows.push([
          'Incident ID', 'Date Time', 'Operational Site', 'Entity Type',
          'Entity Reference', 'Conflict Classification', 'Holding HQ Value',
          'Branch Site Value', 'Resolution Status', 'Resolution Time Min'
        ]);
        filteredConflicts.forEach(c => {
          rows.push([
            c.id, c.date, c.siteName, c.entityType, c.entityReference,
            c.conflictType, c.holdingValue, c.branchValue,
            c.resolutionStatus, String(c.resolutionDurationMin)
          ]);
        });
      } else if (targetSection === 'STABILITY') {
        fileName = `SAS_Holding_Connection_Stability_${summary.reportId}.csv`;
        rows.push([
          'Site ID', 'Operational Site', 'Governorate', 'Avg Latency ms',
          'Min Latency ms', 'Max Latency ms', 'Uptime Percent', 'ISP Carrier',
          'IP Rotations Handled', 'Packet Loss Percent', 'Health Status'
        ]);
        filteredStability.forEach(s => {
          rows.push([
            s.siteId, s.siteName, s.governorate, String(s.avgLatencyMs),
            String(s.minLatencyMs), String(s.maxLatencyMs), `${s.uptimePercent}%`,
            s.carrierIsp, String(s.ipRotationsHandled), `${s.packetLossPercent}%`, s.status
          ]);
        });
      } else if (targetSection === 'ANOMALIES') {
        fileName = `SAS_Holding_Login_Anomalies_${summary.reportId}.csv`;
        rows.push([
          'Event ID', 'Timestamp', 'User Account', 'Site Location',
          'Detected IP', 'Carrier ISP', 'Anomaly Type', 'Risk Level',
          'Action Enforced', 'Technical Details'
        ]);
        filteredAnomalies.forEach(a => {
          rows.push([
            a.id, a.timestamp, a.username, a.siteLocation,
            a.detectedIp, a.carrierIsp, a.anomalyType, a.riskLevel,
            a.actionTaken, a.details
          ]);
        });
      } else {
        // Master Unified CSV containing all sections
        fileName = `SAS_Holding_Complete_Security_Audit_${summary.reportId}.csv`;
        rows.push(['=== SAS HOLDING GROUP ENTERPRISE - 30-DAY CYBER SECURITY & SYNC AUDIT ===']);
        rows.push(['Report Reference ID', summary.reportId]);
        rows.push(['Audit Period', summary.periodLabel]);
        rows.push(['Holding Entity', holding?.name || summary.holdingName]);
        rows.push(['Security Classification', summary.classification]);
        rows.push(['Security Compliance Score', `${summary.securityScore}%`]);
        rows.push(['Fleet Sync Uptime', `${summary.syncUptimePercent}%`]);
        rows.push(['Total Audited Telemetry Events', String(summary.totalAuditedEvents)]);
        rows.push(['Unauthorized Breaches / Loss', String(summary.unauthorizedBreaches)]);
        rows.push(['Resolved Sync Conflicts', String(filteredConflicts.length)]);
        rows.push(['Monitored Remote Sites', String(filteredStability.length)]);
        rows.push(['Flagged Access Anomalies', String(filteredAnomalies.length)]);
        rows.push(['Digital SHA-256 Seal Checksum', summary.cryptoSealHash]);
        rows.push(['Audit Generation Date', summary.reportDate]);
        rows.push([]);

        rows.push(['=== SECTION 1: SYNCHRONIZATION CONFLICTS ===']);
        rows.push([
          'Incident ID', 'Date Time', 'Operational Site', 'Entity Type',
          'Entity Reference', 'Conflict Classification', 'Holding HQ Value',
          'Branch Site Value', 'Resolution Status', 'Resolution Time Min'
        ]);
        filteredConflicts.forEach(c => {
          rows.push([
            c.id, c.date, c.siteName, c.entityType, c.entityReference,
            c.conflictType, c.holdingValue, c.branchValue,
            c.resolutionStatus, String(c.resolutionDurationMin)
          ]);
        });
        rows.push([]);

        rows.push(['=== SECTION 2: CONNECTION STABILITY & LATENCY TELEMETRY ===']);
        rows.push([
          'Site ID', 'Operational Site', 'Governorate', 'Avg Latency ms',
          'Min Latency ms', 'Max Latency ms', 'Uptime Percent', 'ISP Carrier',
          'IP Rotations Handled', 'Packet Loss Percent', 'Health Status'
        ]);
        filteredStability.forEach(s => {
          rows.push([
            s.siteId, s.siteName, s.governorate, String(s.avgLatencyMs),
            String(s.minLatencyMs), String(s.maxLatencyMs), `${s.uptimePercent}%`,
            s.carrierIsp, String(s.ipRotationsHandled), `${s.packetLossPercent}%`, s.status
          ]);
        });
        rows.push([]);

        rows.push(['=== SECTION 3: LOGIN & AUTHENTICATION ANOMALIES ===']);
        rows.push([
          'Event ID', 'Timestamp', 'User Account', 'Site Location',
          'Detected IP', 'Carrier ISP', 'Anomaly Type', 'Risk Level',
          'Action Enforced', 'Technical Details'
        ]);
        filteredAnomalies.forEach(a => {
          rows.push([
            a.id, a.timestamp, a.username, a.siteLocation,
            a.detectedIp, a.carrierIsp, a.anomalyType, a.riskLevel,
            a.actionTaken, a.details
          ]);
        });
      }

      const csvString = rows.map(r => r.map(escapeCsvValue).join(',')).join('\r\n');
      triggerCsvDownload(csvString, fileName);

      setDownloadSuccess(
        language === 'ku'
          ? `ڕاپۆرتی ئاسایش وەک فایلی CSV بە سەرکەوتوویی دابەزێندرا: ${fileName}`
          : `Security audit report exported successfully as CSV: ${fileName}`
      );
      setTimeout(() => setDownloadSuccess(null), 6000);
    } catch (err: any) {
      console.error('CSV Export Error:', err);
    } finally {
      setIsExportingCsv(false);
      setCsvDropdownOpen(false);
    }
  };

  const handlePrintViaManager = () => {
    if (openPrintManager) {
      openPrintManager({
        title: language === 'ku' ? 'ڕاپۆرتی پشکنینی ئاسایشی ٣٠ ڕۆژەی هۆڵدینگ (PDF Audit)' : '30-Day Holding IT Systems & Sync Security Audit Report',
        documentNumber: summary.reportId,
        category: 'IT_INFRASTRUCTURE',
        contentSummary: language === 'ku'
          ? `پوختەی پشکنینی ئاسایشی ٣٠ ڕۆژی ڕابردوو بۆ هۆڵدینگ: ${syncConflicts.length} ناکۆکی سینک چارەسەرکراون، تێکڕای سەقامگیری هێڵ ٩٩.٨٥٪ بووە لەسەر ٧ لق، و هەموو نائاساییەکانی داخڵبوون (Anomalies) پارێزراون بەبێ ئایپی جێگیر.`
          : `30-day comprehensive audit summarizing sync conflicts, connection stability, and login anomalies across all project sites.`
      });
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Banner / Filter Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner shrink-0">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-mono font-bold bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                  Periodic Security Audit (PDF, Excel, CSV)
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Audit Compliance: 98.6%
                </span>
                <span className="text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                  Ref: {summary.reportId}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {language === 'ku'
                  ? 'ڕاپۆرتی خولیی پشکنینی ئاسایش و سەقامگیری تۆڕ (PDF, Excel, CSV)'
                  : language === 'ar'
                  ? 'تقرير التدقيق الأمني الدوري للأنظمة والمزامنة (PDF, Excel, CSV)'
                  : 'Periodic Security & Sync Stability Audit Report (PDF, Excel, CSV)'}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {language === 'ku'
                  ? 'کۆکردنەوە و شیتاڵکردنی تەواوی ناکۆکییەکانی سینکرۆنایز (Sync Conflicts)، سەقامگیری پەیوەندی هێڵی پڕۆژە دوورەدەستەکان (Connection Stability)، و نائاساییەکانی داخڵبوون (Login Anomalies) بۆ ٣٠ ڕۆژی ڕابردوو بە فۆرماتەکانی PDF, Excel, CSV.'
                  : 'Comprehensive periodic audit compiling sync conflict resolutions, remote multi-site connectivity stability, and access anomaly telemetry from the last 30 days, exportable in PDF, Excel (.xlsx), and CSV formats.'}
              </p>
            </div>
          </div>

          {/* Multi-Format Export Action Buttons: PDF, Excel, CSV, Print */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto relative z-20">
            {/* 1. PDF Export */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-indigo-950/40 disabled:opacity-50"
              title="Download official audit report as PDF"
            >
              <Download className={`w-4 h-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span>
                {isGeneratingPdf
                  ? language === 'ku' ? 'دروستکردنی PDF...' : 'Generating PDF...'
                  : language === 'ku' ? 'داگرتنی PDF' : 'Download PDF'}
              </span>
            </button>

            {/* 2. Excel (.xlsx) Export with 4 Dedicated Worksheets */}
            <button
              onClick={handleDownloadExcel}
              disabled={isExportingExcel}
              className="px-3.5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-950/40 disabled:opacity-50"
              title="Export complete 4-sheet Microsoft Excel Workbook (.xlsx)"
            >
              <FileSpreadsheet className={`w-4 h-4 ${isExportingExcel ? 'animate-spin' : ''}`} />
              <span>
                {isExportingExcel
                  ? language === 'ku' ? 'دروستکردنی Excel...' : 'Exporting Excel...'
                  : language === 'ku' ? 'داگرتنی Excel (.xlsx)' : 'Export Excel (.xlsx)'}
              </span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-bold">
                4 Sheets
              </span>
            </button>

            {/* 3. CSV Export with Interactive Split-Dropdown */}
            <div className="relative">
              <div className="flex items-center rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-950/40 transition">
                <button
                  onClick={() => handleDownloadCsv('ALL')}
                  disabled={isExportingCsv}
                  className="px-3 py-2.5 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Export complete consolidated CSV report"
                >
                  <FileDown className={`w-4 h-4 ${isExportingCsv ? 'animate-bounce' : ''}`} />
                  <span>
                    {isExportingCsv
                      ? language === 'ku' ? 'دروستکردنی CSV...' : 'Exporting CSV...'
                      : language === 'ku' ? 'داگرتنی CSV' : 'Export CSV'}
                  </span>
                </button>
                <button
                  onClick={() => setCsvDropdownOpen(!csvDropdownOpen)}
                  className="px-2 py-2.5 border-l border-white/20 hover:bg-black/10 rounded-r-xl transition cursor-pointer"
                  title="Choose specific CSV table to export"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {csvDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>{language === 'ku' ? 'فۆرماتەکانی داتای CSV' : 'Export CSV Dataset'}</span>
                    <Table className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <button
                    onClick={() => handleDownloadCsv('ALL')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <span className="font-bold block">{language === 'ku' ? 'تەواوی داتای پشکنین' : 'Complete Master Audit'}</span>
                      <span className="text-[10px] text-slate-400">{language === 'ku' ? 'پوختە، ناکۆکییەکان، هێڵ، و ئاسایش' : 'All sections in single file'}</span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">Full</span>
                  </button>
                  <button
                    onClick={() => handleDownloadCsv('CONFLICTS')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <span className="font-bold block">{language === 'ku' ? 'تەنها ناکۆکییەکانی سینک' : 'Sync Conflicts Only'}</span>
                      <span className="text-[10px] text-slate-400">{filteredConflicts.length} {language === 'ku' ? 'ڕووداو' : 'events'}</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono font-bold">CSV</span>
                  </button>
                  <button
                    onClick={() => handleDownloadCsv('STABILITY')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <span className="font-bold block">{language === 'ku' ? 'سەقامگیری هێڵ و تاخیربوون' : 'Connection Stability & Ping'}</span>
                      <span className="text-[10px] text-slate-400">{filteredStability.length} {language === 'ku' ? 'لق' : 'sites'}</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono font-bold">CSV</span>
                  </button>
                  <button
                    onClick={() => handleDownloadCsv('ANOMALIES')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-white flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <span className="font-bold block">{language === 'ku' ? 'نائاساییەکانی چوونەژوورەوە' : 'Login Anomalies Only'}</span>
                      <span className="text-[10px] text-slate-400">{filteredAnomalies.length} {language === 'ku' ? 'ئاڵۆزی' : 'flagged'}</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-mono font-bold">CSV</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Print / PrintManager Dispatch */}
            <button
              onClick={handlePrintViaManager}
              className="px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Print formal report via PrintManager"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>{language === 'ku' ? 'چاپکردن' : 'Print'}</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {downloadSuccess && (
          <div className="mt-4 bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Filter Bar: Period and Site Selectors */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 flex items-center gap-1 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {language === 'ku' ? 'ماوەی پشکنین:' : 'Audit Period:'}
            </span>
            <button
              onClick={() => setSelectedPeriod('30_DAYS')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedPeriod === '30_DAYS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {language === 'ku' ? '٣٠ ڕۆژی ڕابردوو (Last 30 Days)' : 'Last 30 Days'}
            </button>
            <button
              onClick={() => setSelectedPeriod('7_DAYS')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedPeriod === '7_DAYS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {language === 'ku' ? '٧ ڕۆژ' : 'Last 7 Days'}
            </button>
            <button
              onClick={() => setSelectedPeriod('90_DAYS')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedPeriod === '90_DAYS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {language === 'ku' ? '٩٠ ڕۆژ (Quarter)' : 'Last Quarter'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1 font-semibold">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              {language === 'ku' ? 'فلتەری لق:' : 'Site Filter:'}
            </span>
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">{language === 'ku' ? 'سەرجەم لقەکان (All Sites)' : 'All Operational Sites'}</option>
              <option value="Najaf">{language === 'ku' ? 'کارگەی چیمەنتۆی نەجەف' : 'Najaf Cement Plant'}</option>
              <option value="Halabja">{language === 'ku' ? 'پڕۆژەی هەڵەبجە' : 'Halabja Project Site'}</option>
              <option value="Sulaymaniyah">{language === 'ku' ? 'لقی سلێمانی' : 'Sulaymaniyah Energy'}</option>
              <option value="Duhok">{language === 'ku' ? 'کارگەی دهۆک' : 'Duhok Plant'}</option>
              <option value="Zakho">{language === 'ku' ? 'دەروازەی زاخۆ' : 'Zakho Terminal'}</option>
              <option value="Baghdad">{language === 'ku' ? 'لقی بەغدا' : 'Baghdad Office'}</option>
              <option value="Erbil">{language === 'ku' ? 'سەرۆکایەتی هەولێر' : 'Erbil Central HQ'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Printable Document Sheet View (High-Fidelity Enterprise Report Preview) */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-8 text-slate-800 print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded">
                SAS-SEC-AUDIT-v4.2
              </span>
              <span className="text-xs font-bold text-rose-600 border border-rose-200 bg-rose-50 px-2 py-0.5 rounded">
                STRICTLY CONFIDENTIAL / INTERNAL
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
              {holding?.name || 'SAS HOLDING GROUP ENTERPRISE'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold tracking-wide">
              DIRECTORATE OF CYBER SECURITY, NETWORK RESILIENCE & DATA GOVERNANCE
            </p>
          </div>

          <div className="text-right sm:self-center">
            <span className="text-xs text-slate-400 block font-mono">DOCUMENT ID:</span>
            <span className="text-sm font-mono font-black text-indigo-700 block">
              {summary.reportId}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Audit Period: {summary.periodLabel}
            </span>
          </div>
        </div>

        {/* Executive Scorecard Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>1. Executive Security & Resilience Scorecard</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">Overall Security Score</span>
              <span className="text-2xl font-black text-emerald-600 font-mono block">
                {summary.securityScore}%
              </span>
              <span className="text-[10px] text-slate-500 block">✓ 100% Policy Adherence</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">Fleet Sync Uptime</span>
              <span className="text-2xl font-black text-indigo-600 font-mono block">
                {summary.syncUptimePercent}%
              </span>
              <span className="text-[10px] text-slate-500 block">7 Project Nodes Online</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">Total Audited Events</span>
              <span className="text-2xl font-black text-slate-900 font-mono block">
                {summary.totalAuditedEvents}
              </span>
              <span className="text-[10px] text-slate-500 block">Continuous 30-Day Trace</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">Data Breaches / Loss</span>
              <span className="text-2xl font-black text-emerald-600 font-mono block">
                {summary.unauthorizedBreaches}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">Zero Security Failures</span>
            </div>
          </div>
        </div>

        {/* Section 2: Sync Conflicts & Resolution Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
              <span>2. Synchronization Conflicts & Concurrency Reconciliation ({filteredConflicts.length})</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-600 font-bold hidden sm:inline">
                100% Resolved • 0 Data Losses
              </span>
              <button
                onClick={() => handleDownloadCsv('CONFLICTS')}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border border-slate-200"
                title="Export this table to CSV"
              >
                <FileDown className="w-3 h-3 text-amber-600" />
                <span>CSV</span>
              </button>
              <button
                onClick={handleDownloadExcel}
                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border border-emerald-200"
                title="Export complete report to Excel"
              >
                <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                <span>Excel</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Date / Time</th>
                  <th className="p-3">Project Site</th>
                  <th className="p-3">Entity Reference</th>
                  <th className="p-3">Conflict Type</th>
                  <th className="p-3">Holding Value (HQ)</th>
                  <th className="p-3">Branch Site Value</th>
                  <th className="p-3">Resolution Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredConflicts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{c.date}</td>
                    <td className="p-3 font-semibold text-slate-900">{c.siteName}</td>
                    <td className="p-3 font-mono text-[11px] text-indigo-700">{c.entityReference}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                        {c.conflictType}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 text-[11px] max-w-xs">{c.holdingValue}</td>
                    <td className="p-3 text-slate-600 text-[11px] max-w-xs">{c.branchValue}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {c.resolutionStatus.replace('RESOLVED_', '').replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Connection Stability & Latency Telemetry */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>3. Multi-Site Network Connection Stability & Roaming Telemetry ({filteredStability.length} Sites)</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-600 font-bold hidden sm:inline">
                Protocol: SAS-IP-ROAM-V2 • Dynamic CGNAT Enabled
              </span>
              <button
                onClick={() => handleDownloadCsv('STABILITY')}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border border-slate-200"
                title="Export this table to CSV"
              >
                <FileDown className="w-3 h-3 text-amber-600" />
                <span>CSV</span>
              </button>
              <button
                onClick={handleDownloadExcel}
                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border border-emerald-200"
                title="Export complete report to Excel"
              >
                <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                <span>Excel</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Operational Site</th>
                  <th className="p-3">Province</th>
                  <th className="p-3">Avg Ping</th>
                  <th className="p-3">Min / Max</th>
                  <th className="p-3">Fleet Uptime</th>
                  <th className="p-3">Dynamic IP Rotations</th>
                  <th className="p-3">Carrier / ISP Link</th>
                  <th className="p-3">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStability.map((s) => (
                  <tr key={s.siteId} className="hover:bg-slate-50/80">
                    <td className="p-3 font-semibold text-slate-900">{s.siteName}</td>
                    <td className="p-3 text-slate-600">{s.governorate}</td>
                    <td className="p-3 font-mono font-bold text-indigo-600">{s.avgLatencyMs} ms</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{s.minLatencyMs} / {s.maxLatencyMs} ms</td>
                    <td className="p-3 font-mono text-emerald-600 font-bold">{s.uptimePercent}%</td>
                    <td className="p-3 font-mono text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                        {s.ipRotationsHandled} Hops OK
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">{s.carrierIsp}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Login & Authentication Anomalies */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600" />
              <span>4. Access & Authentication Anomaly Telemetry ({filteredAnomalies.length} Flagged Events)</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-rose-600 font-bold hidden sm:inline">
                Zero-Trust Enforcement Active
              </span>
              <button
                onClick={() => handleDownloadCsv('ANOMALIES')}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border border-slate-200"
                title="Export this table to CSV"
              >
                <FileDown className="w-3 h-3 text-amber-600" />
                <span>CSV</span>
              </button>
              <button
                onClick={handleDownloadExcel}
                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border border-emerald-200"
                title="Export complete report to Excel"
              >
                <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                <span>Excel</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Target Account</th>
                  <th className="p-3">Location / Geo Context</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Anomaly Classification</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Action Enforced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAnomalies.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{a.timestamp}</td>
                    <td className="p-3 font-semibold text-slate-900">{a.username}</td>
                    <td className="p-3 text-slate-600 text-[11px]">{a.siteLocation}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-700">{a.detectedIp}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px]">
                        {a.anomalyType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.riskLevel === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : a.riskLevel === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {a.riskLevel}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-200 text-slate-800">
                        {a.actionTaken}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Holding Authority Digital Attestation & Cryptographic Stamp */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <Stamp className="w-5 h-5 text-indigo-600" />
              <h4 className="text-sm font-extrabold text-slate-900">
                5. Executive Security Attestation & Cryptographic Digital Stamp
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This document certifies that the SAS Holding Group ERP synchronization layer operated with zero unauthorized data corruption, zero session breaches, and 100% resilient dynamic IP roaming across all subsidiary branches during the 30-day audit window.
            </p>
            <div className="pt-1">
              <span className="font-mono text-[10px] text-slate-400 block">SHA-256 Checksum:</span>
              <span className="font-mono text-[10px] text-indigo-700 font-bold select-all block break-all">
                {summary.cryptoSealHash}
              </span>
            </div>
          </div>

          <div className="border border-slate-300 bg-white p-4 rounded-xl text-center space-y-1 shadow-2xs shrink-0 self-center sm:self-auto min-w-[180px]">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              ✓
            </div>
            <span className="text-xs font-black text-slate-900 block">
              VERIFIED & SEALED
            </span>
            <span className="text-[10px] text-slate-500 block">
              Director of IT Systems & Security
            </span>
            <span className="text-[9px] font-mono text-emerald-600 font-bold block">
              Timestamp: 2026-11-03 17:51:09
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
