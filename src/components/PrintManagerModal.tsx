import React, { useState, useEffect } from 'react';
import {
  Printer,
  Wifi,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  RotateCcw,
  Settings2,
  FileText,
  Receipt,
  Radio,
  Sliders,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Clock,
  Send,
  Eye,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Stamp,
  QrCode,
  DollarSign
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { getUIText } from '../utils/langHelper';
import { PrinterDeviceConfig, PurchaseOrder } from '../types/erp';
import { PrintJob, PrintOptions, PrintableReportData } from '../types/print';

interface PrintManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocument?: PurchaseOrder | null;
  initialTab?: 'PRINT_DIRECT' | 'PRINTERS' | 'QUEUE' | 'REPORTS';
}

export const PrintManagerModal: React.FC<PrintManagerModalProps> = ({
  isOpen,
  onClose,
  initialDocument,
  initialTab = 'PRINT_DIRECT'
}) => {
  const {
    holding,
    companies,
    projects,
    purchaseOrders,
    approvalAuditTrail,
    printerDevices,
    defaultPrinter,
    addPrinterDevice,
    updatePrinterDevice,
    deletePrinterDevice,
    setDefaultPrinter,
    printManager,
    printQueue,
    printPurchaseOrder,
    printKpiReport,
    reprintJob,
    cancelPrintJob,
    clearPrintHistory
  } = useERP();

  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'PRINT_DIRECT' | 'PRINTERS' | 'QUEUE' | 'REPORTS'>(initialTab);

  // Selected Target Document for Printing
  const [selectedPoId, setSelectedPoId] = useState<string>(
    initialDocument?.id || purchaseOrders[0]?.id || ''
  );

  const selectedPO = purchaseOrders.find(p => p.id === selectedPoId) || initialDocument || purchaseOrders[0] || null;

  // Print Settings State
  const [targetPrinterId, setTargetPrinterId] = useState<string>(
    defaultPrinter?.id || printerDevices[0]?.id || ''
  );
  const [paperFormat, setPaperFormat] = useState<'A4' | '80MM' | '58MM'>('A4');
  const [printCopies, setPrintCopies] = useState<number>(1);
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');
  const [includeSeal, setIncludeSeal] = useState<boolean>(true);
  const [includeSignature, setIncludeSignature] = useState<boolean>(true);
  const [sendDirectSocket, setSendDirectSocket] = useState<boolean>(false);

  // Testing & Notification State
  const [testingPrinterId, setTestingPrinterId] = useState<string | null>(null);
  const [pingResultNotice, setPingResultNotice] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // New Printer Creation Form State
  const [isAddingNewPrinter, setIsAddingNewPrinter] = useState<boolean>(false);
  const [newPrnName, setNewPrnName] = useState<string>('');
  const [newPrnType, setNewPrnType] = useState<'STANDARD_A4' | 'THERMAL_80MM' | 'THERMAL_58MM' | 'NETWORK_IP'>('NETWORK_IP');
  const [newPrnIp, setNewPrnIp] = useState<string>('192.168.1.185');
  const [newPrnPort, setNewPrnPort] = useState<number>(9100);
  const [newPrnPaper, setNewPrnPaper] = useState<'A4' | 'Letter' | '80mm' | '58mm'>('A4');
  const [newPrnAutoPrint, setNewPrnAutoPrint] = useState<boolean>(false);

  // Selected Job for Raw Inspection
  const [inspectedJob, setInspectedJob] = useState<PrintJob | null>(null);

  useEffect(() => {
    if (initialDocument) {
      setSelectedPoId(initialDocument.id);
      setActiveTab('PRINT_DIRECT');
    }
  }, [initialDocument]);

  useEffect(() => {
    if (defaultPrinter) {
      setTargetPrinterId(defaultPrinter.id);
      setPaperFormat(defaultPrinter.paperSize === '80mm' ? '80MM' : defaultPrinter.paperSize === '58mm' ? '58MM' : 'A4');
      setSendDirectSocket(defaultPrinter.type === 'NETWORK_IP');
    }
  }, [defaultPrinter]);

  if (!isOpen) return null;

  const currentSelectedPrinter = printerDevices.find(p => p.id === targetPrinterId) || defaultPrinter || printerDevices[0];

  // Ping Test Handler
  const handlePingPrinter = async (printer: PrinterDeviceConfig) => {
    setTestingPrinterId(printer.id);
    setPingResultNotice(null);

    const result = await printManager.testPrinterPing(printer);
    setTestingPrinterId(null);
    setPingResultNotice(
      language === 'ku'
        ? `ئامێری ${printer.name} (${printer.ipAddress || '192.168.1.180'}) بەردەستە! خێرایی وەڵام: ${result.latencyMs}ms.`
        : language === 'ar'
        ? `الطابعة ${printer.name} متصلة وجاهزة! سرعة الاستجابة: ${result.latencyMs}ms.`
        : `Printer ${printer.name} is ONLINE! Ping latency: ${result.latencyMs}ms.`
    );
    setTimeout(() => setPingResultNotice(null), 4000);
  };

  // Direct Print PO / Approval Execution
  const handleExecutePrintPO = async () => {
    if (!selectedPO) return;
    setIsDispatching(true);

    try {
      const result = await printPurchaseOrder(selectedPO, {
        printerId: targetPrinterId,
        copies: printCopies,
        format: paperFormat,
        orientation,
        includeOfficialSeal: includeSeal,
        includeDigitalSignature: includeSignature,
        printDirectToSocket: sendDirectSocket || currentSelectedPrinter?.type === 'NETWORK_IP'
      });

      setIsDispatching(false);
      setActionSuccessNotice(
        language === 'ku' ? result.messageKu : language === 'ar' ? result.messageAr : result.messageEn
      );
      setTimeout(() => setActionSuccessNotice(null), 4000);
    } catch {
      setIsDispatching(false);
    }
  };

  // Direct Print KPI Executive Report
  const handleExecutePrintKpiReport = async () => {
    setIsDispatching(true);
    const mockKpiData: PrintableReportData = {
      title: 'Consolidated Holding Sector Performance & Budget Review',
      titleKu: 'ڕاپۆرتی خەرجی و کارایی کەرتەکانی سەر بە هۆڵدینگ',
      titleAr: 'تقرير الأداء وميزانية القطاعات للمجموعة القابضة',
      holdingName: holding.name || 'SAS Holding International',
      generatedBy: holding.chairmanName || 'Executive Operations Center',
      date: new Date().toLocaleDateString(),
      timeHorizon: 'Year-to-Date (YTD 2026)',
      summaryMetrics: [
        { label: 'Total Allocated Budget', value: '$84.50M USD' },
        { label: 'Actual Spent to Date', value: '$68.20M USD' },
        { label: 'Uncommitted Capital Reserve', value: '+$16.30M USD' },
        { label: 'Overall Capital Utilization', value: '80.7%' }
      ],
      tableHeaders: ['Sector Code', 'Sector Name', 'Allocated Budget', 'Actual Spent', 'Variance', 'Status'],
      tableRows: [
        ['SEC-INF', 'Infrastructure & Civil Works', 28500000, 22800000, 5700000, 'ON_TRACK'],
        ['SEC-PWR', 'Energy & Power Infrastructure', 18000000, 15400000, 2600000, 'ON_TRACK'],
        ['SEC-REL', 'Commercial Real Estate', 14200000, 11900000, 2300000, 'ON_TRACK'],
        ['SEC-LOG', 'Fleet & Supply Chain Logistics', 9500000, 8100000, 1400000, 'ON_TRACK'],
        ['SEC-TECH', 'Enterprise Digital & Telecom', 8200000, 6200000, 2000000, 'OPTIMAL']
      ],
      verifiedHash: `SIG-REPORT-KPI-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    };

    try {
      const result = await printKpiReport(mockKpiData, {
        printerId: targetPrinterId,
        copies: printCopies,
        format: 'A4',
        orientation: 'LANDSCAPE',
        printDirectToSocket: sendDirectSocket || currentSelectedPrinter?.type === 'NETWORK_IP'
      });

      setIsDispatching(false);
      setActionSuccessNotice(
        language === 'ku' ? result.messageKu : language === 'ar' ? result.messageAr : result.messageEn
      );
      setTimeout(() => setActionSuccessNotice(null), 4000);
    } catch {
      setIsDispatching(false);
    }
  };

  // Add New Hardware/Network Printer
  const handleAddNewPrinterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrnName.trim()) return;

    addPrinterDevice({
      name: newPrnName.trim(),
      type: newPrnType,
      ipAddress: newPrnType === 'NETWORK_IP' ? newPrnIp.trim() : undefined,
      port: newPrnType === 'NETWORK_IP' ? newPrnPort : undefined,
      isDefault: printerDevices.length === 0,
      status: 'ONLINE',
      autoPrintOnApproval: newPrnAutoPrint,
      paperSize: newPrnPaper,
      copies: 1
    });

    setNewPrnName('');
    setIsAddingNewPrinter(false);
    setActionSuccessNotice(
      language === 'ku' ? 'پرینتەری نوێی تۆڕ بە سەرکەوتوویی زیادکرا' : 'New network printer added successfully'
    );
    setTimeout(() => setActionSuccessNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header Bar */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-md">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  {language === 'ku' ? 'بەڕێوەبەری چاپی دامەزراوەیی (PrintManager Utility)' : language === 'ar' ? 'مدير الطباعة المتقدم للمؤسسة' : 'ERP PrintManager & Network Station'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {printerDevices.filter(p => p.status === 'ONLINE').length} {language === 'ku' ? 'بەستراوە' : 'Online'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {language === 'ku'
                  ? 'چاپی ڕاستەوخۆ بە پرینتەرەکانی تۆڕ (Port 9100/RAW)، پسوولەی سێرمال ٨٠ملم، بەڵگەنامە و بڕیارە واژۆکراوەکان'
                  : 'Direct printing to network printers (RAW/Socket), thermal POS 80mm receipts, approved vouchers & KPI reports'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Default Printer Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-mono text-[11px] truncate max-w-[140px]">
                {defaultPrinter?.name || 'Standard Printer'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {actionSuccessNotice && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2.5 flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
        )}

        {pingResultNotice && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-2 flex items-center gap-2 text-blue-900 text-xs font-semibold animate-in slide-in-from-top-1">
            <Radio className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />
            <span>{pingResultNotice}</span>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="px-6 pt-3 pb-0 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'PRINT_DIRECT', label: language === 'ku' ? 'چاپی ڕاستەوخۆی بەڵگەنامە' : 'Direct Print & Preview', icon: FileText },
            { id: 'REPORTS', label: language === 'ku' ? 'ڕاپۆرت و بڕیارە فەرمییەکان' : 'Reports & Approvals', icon: Sparkles },
            { id: 'QUEUE', label: language === 'ku' ? 'ڕیزی کارەکانی پرینتەر' : 'Print Queue & History', icon: Clock, count: printQueue.length },
            { id: 'PRINTERS', label: language === 'ku' ? 'پرینتەرەکانی تۆڕ و ڕێکخستن' : 'Network Printers Config', icon: Settings2, count: printerDevices.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer border-t border-s border-e ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 border-slate-200 shadow-xs -mb-px'
                  : 'bg-transparent text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body Content by Tab */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">

          {/* ========================================================================= */}
          {/* TAB 1: DIRECT PRINT & DOCUMENT PREVIEW */}
          {/* ========================================================================= */}
          {activeTab === 'PRINT_DIRECT' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (5 Cols): Print Settings & Destination */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Document Selector */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    {language === 'ku' ? 'بەڵگەنامەی داواکراو بۆ چاپ:' : 'Select Document to Print:'}
                  </label>
                  <select
                    value={selectedPoId}
                    onChange={(e) => setSelectedPoId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
                  >
                    {purchaseOrders.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.poNumber} — ${po.totalAmountUSD.toLocaleString()} ({po.supplierName}) [{po.status}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Printer Station Destination */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                      {language === 'ku' ? 'پرینتەری مەبەست (Destination):' : 'Target Network Printer:'}
                    </label>
                    {currentSelectedPrinter?.type === 'NETWORK_IP' && (
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {currentSelectedPrinter.ipAddress}:{currentSelectedPrinter.port || 9100}
                      </span>
                    )}
                  </div>

                  <select
                    value={targetPrinterId}
                    onChange={(e) => setTargetPrinterId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
                  >
                    {printerDevices.map((prn) => (
                      <option key={prn.id} value={prn.id}>
                        {prn.name} [{prn.type}] {prn.isDefault ? '★ (Default)' : ''}
                      </option>
                    ))}
                  </select>

                  {/* Test Ping Action for Target Printer */}
                  {currentSelectedPrinter && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        {currentSelectedPrinter.status === 'ONLINE' ? '🟢 Online & Ready' : '⚪ Standby'}
                      </span>
                      <button
                        onClick={() => handlePingPrinter(currentSelectedPrinter)}
                        disabled={testingPrinterId === currentSelectedPrinter.id}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Radio className={`w-3.5 h-3.5 ${testingPrinterId === currentSelectedPrinter.id ? 'animate-spin' : ''}`} />
                        <span>{language === 'ku' ? 'پشکنینی پەیوەندی (Ping)' : 'Test Connection'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Print Parameters: Format, Copies, Orientation */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    {language === 'ku' ? 'هەڵبژاردنەکانی قەبارە و دەرچوون:' : 'Output Parameters:'}
                  </span>

                  {/* Format Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'A4', label: 'Standard A4', desc: 'Executive Sheet' },
                      { id: '80MM', label: 'Thermal 80mm', desc: 'POS Receipt' },
                      { id: '58MM', label: 'Thermal 58mm', desc: 'Compact Slip' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setPaperFormat(f.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          paperFormat === f.id
                            ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-2xs font-bold'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs font-bold block">{f.label}</span>
                        <span className="text-[9px] text-slate-400 block">{f.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Copies & Orientation */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        {language === 'ku' ? 'ژمارەی کۆپی' : 'Number of Copies'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={printCopies}
                        onChange={(e) => setPrintCopies(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        {language === 'ku' ? 'ئاراستەی لاپەڕە' : 'Orientation'}
                      </label>
                      <select
                        value={orientation}
                        onChange={(e) => setOrientation(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                      >
                        <option value="PORTRAIT">Portrait (ستوونی)</option>
                        <option value="LANDSCAPE">Landscape (ئاسۆیی)</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggle Options: Seal, Signature, Direct Socket */}
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeSeal}
                        onChange={(e) => setIncludeSeal(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                      />
                      <span className="font-semibold text-slate-700">
                        {language === 'ku' ? 'لەخۆگرتنی مۆری فەرمی هۆڵدینگ/کۆمپانیا' : 'Include Official Holding/Company Seal'}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeSignature}
                        onChange={(e) => setIncludeSignature(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                      />
                      <span className="font-semibold text-slate-700">
                        {language === 'ku' ? 'لەخۆگرتنی واژۆی ئەلیکترۆنی و کلیلی کۆدکراو' : 'Include Electronic Signature & Cryptographic Key'}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendDirectSocket}
                        onChange={(e) => setSendDirectSocket(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                      />
                      <span className="font-semibold text-slate-700">
                        {language === 'ku' ? 'ناردنی ڕاستەوخۆ بە سۆکێتی تۆڕ (Port 9100 RAW Socket)' : 'Direct Raw Socket Stream to Network IP'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Print Dispatch Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleExecutePrintPO}
                    disabled={isDispatching}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs shadow-md transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className={`w-4 h-4 ${isDispatching ? 'animate-bounce' : ''}`} />
                    <span>
                      {isDispatching
                        ? (language === 'ku' ? 'لە پرۆسەی ناردن و چاپکردندایە...' : 'Transmitting Print Stream...')
                        : (language === 'ku' ? 'چاپکردنی ڕاستەوخۆ بە پرینتەر' : `Print Document via ${currentSelectedPrinter?.name}`)}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (selectedPO) {
                        printManager.executeBrowserPrint(printManager.generatePurchaseOrderHtml(selectedPO, { format: paperFormat }));
                      }
                    }}
                    className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>{language === 'ku' ? 'پێداچوونەوە لە پەڕەی چاپی سیستەم (System Print)' : 'System Browser Print Dialog'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column (7 Cols): High-Fidelity Live Document Preview Pane */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-800">
                      {language === 'ku' ? 'پێشبینینی شێوازی چاپی فەرمی:' : 'Official Output Preview:'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 font-bold">
                      {paperFormat}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {selectedPO?.poNumber || 'VOUCHER'}
                  </span>
                </div>

                {/* Simulated Document Preview Area */}
                <div className="flex-1 bg-slate-100/70 p-4 rounded-2xl border border-slate-200/90 overflow-y-auto max-h-[500px]">
                  {selectedPO ? (
                    paperFormat === '80MM' || paperFormat === '58MM' ? (
                      /* Thermal Slip Preview */
                      <div className="bg-white p-4 rounded-xl shadow-xs mx-auto max-w-[280px] font-mono text-[10px] space-y-2 border border-slate-200">
                        <div className="text-center font-bold text-xs">SAS4ERP ENTERPRISE</div>
                        <div className="text-center text-[9px] border-b border-dashed border-slate-300 pb-2">
                          OFFICIAL REQUISITION RECEIPT<br />{selectedPO.poNumber}
                        </div>
                        <div className="space-y-1 pt-1">
                          <div>VENDOR: {selectedPO.supplierName}</div>
                          <div>TOTAL: ${selectedPO.totalAmountUSD.toLocaleString()} {selectedPO.currency}</div>
                          <div>STATUS: {selectedPO.status}</div>
                        </div>
                        <div className="border-t border-dashed border-slate-300 pt-2 text-center text-[9px] text-slate-500">
                          *** SEALED & DIGITALLY VERIFIED ***
                        </div>
                      </div>
                    ) : (
                      /* A4 Document Preview */
                      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4 text-xs">
                        <div className="flex justify-between border-b pb-3 border-slate-800">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SAS4ERP HOLDING SYSTEM</span>
                            <h3 className="font-extrabold text-base text-slate-900">{holding.name || 'Holding Enterprise Group'}</h3>
                            <span className="text-slate-500 text-[10px]">{selectedPO.companyId} • Central Requisition</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-blue-700 block">{selectedPO.poNumber}</span>
                            <span className="text-[10px] text-slate-400">{selectedPO.createdDate}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border text-[11px]">
                          <div><strong>Vendor:</strong> {selectedPO.supplierName}</div>
                          <div><strong>Amount:</strong> <span className="text-emerald-600 font-bold">${selectedPO.totalAmountUSD.toLocaleString()}</span></div>
                        </div>

                        <table className="w-full text-start text-[11px] border-collapse">
                          <thead>
                            <tr className="bg-slate-900 text-white">
                              <th className="p-1.5 text-start">Item</th>
                              <th className="p-1.5 text-center">Qty</th>
                              <th className="p-1.5 text-end">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {selectedPO.items.map((it, i) => (
                              <tr key={i}>
                                <td className="p-1.5">{it.name}</td>
                                <td className="p-1.5 text-center">{it.quantity}</td>
                                <td className="p-1.5 text-end">${it.totalUSD.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Signature and Seal Preview */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div className="text-center">
                            <Stamp className="w-8 h-8 text-rose-600 mx-auto opacity-80" />
                            <span className="text-[9px] font-bold text-slate-600 block mt-1">Official Seal</span>
                          </div>
                          <div className="text-center">
                            <span className="font-serif italic text-blue-900 font-bold block text-sm">
                              {selectedPO.holdingApproval?.approvedBy || holding.chairmanName || 'Holding Chairman'}
                            </span>
                            <span className="text-[9px] text-slate-500 block">Authorized Signature</span>
                          </div>
                          <div className="text-right font-mono text-[8px] text-slate-500">
                            <div>SEC-KEY: {selectedPO.holdingApproval?.signatureHash || 'SIG-VERIFIED-2026'}</div>
                            <div>STATUS: APPROVED</div>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      No document selected
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Destination: {currentSelectedPrinter?.name}</span>
                  <span>Protocol: {currentSelectedPrinter?.type === 'NETWORK_IP' ? 'JetDirect TCP/9100' : 'Local Spooler'}</span>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: REPORTS & APPROVALS PRINT STUDIO */}
          {/* ========================================================================= */}
          {activeTab === 'REPORTS' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {language === 'ku' ? 'چاپکردنی یەک-کلیکی ڕاپۆرتە فەرمییەکان' : 'One-Click Executive Report Generation & Printing'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'ku'
                    ? 'ڕاپۆرتی پوختەی KPI، دابەشکردنی بودجەی کەرتەکان، و تۆماری وردبینی بە فۆرماتی A4 ئاسۆیی لەگەڵ واژۆ و مۆری فەرمی بنێرە بۆ پرینتەر.'
                    : 'Dispatch consolidated KPI summaries, sector budget allocations, and compliance audit logs to network printers.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: KPI Dashboard Summary */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {language === 'ku' ? 'ڕاپۆرتی کارایی کەرتەکان (KPI Summary)' : 'Holding KPI & Sectors Report'}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {language === 'ku'
                        ? 'بودجەی تەواوی کەرتەکان ($84.5M)، کۆی خەرجکراو، باڵانسی یەدەگ و هێڵی پێشبینی خەرجی مانگانە.'
                        : 'Consolidated sector budgets ($84.5M), actual spend, reserve variances, and forecast trajectories.'}
                    </p>
                  </div>

                  <button
                    onClick={handleExecutePrintKpiReport}
                    disabled={isDispatching}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{language === 'ku' ? 'چاپکردنی ڕاپۆرت (Landscape)' : 'Print KPI Report'}</span>
                  </button>
                </div>

                {/* Card 2: Approved Requisitions & Signatures */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {language === 'ku' ? 'بەڵگەنامە پەسەندکراوەکان بە مۆر' : 'Signed & Sealed Orders'}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {language === 'ku'
                        ? 'فەرمانەکانی کڕین کە بە مۆری فەرمی و کلیلی ئەمنیی خاوەنی هۆڵدینگ واژۆکراون.'
                        : 'Official requisitions with verified electronic signatures, holding seals, and SHA-256 keys.'}
                    </p>
                  </div>

                  <button
                    onClick={handleExecutePrintPO}
                    disabled={isDispatching}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Stamp className="w-3.5 h-3.5" />
                    <span>{language === 'ku' ? 'چاپکردنی فەرمانی واژۆکراو' : 'Print Sealed Voucher'}</span>
                  </button>
                </div>

                {/* Card 3: Audit Trail Log */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-purple-300 transition">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {language === 'ku' ? 'تۆماری مێژووی وردبینی (Audit Trail)' : 'Compliance Audit Trail Ledger'}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {language === 'ku'
                        ? 'تەواوی کردارە ئەنجامدراوەکان، کات و ڕێکەوت، واژۆی بەرپرسان و کلیلی دڵنیایی دیجیتاڵی.'
                        : 'Full transaction timeline, authorized signatories, timestamped decisions, and verification hashes.'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (approvalAuditTrail.length > 0) {
                        const auditHtml = `
                          <html><head><title>Audit Trail</title><style>body{font-family:sans-serif;padding:20px;font-size:11px;} table{width:100%;border-collapse:collapse;} th,td{padding:6px;border-bottom:1px solid #ccc;text-align:left;}</style></head>
                          <body>
                            <h2>SAS4ERP COMPLIANCE AUDIT LEDGER</h2>
                            <table><thead><tr><th>Date</th><th>PO</th><th>Action</th><th>User</th><th>Role</th><th>Hash</th></tr></thead>
                            <tbody>${approvalAuditTrail.map(a => `<tr><td>${a.timestamp}</td><td>${a.poNumber}</td><td>${a.action}</td><td>${a.performedBy}</td><td>${a.performerRole}</td><td>${a.signatureHash || 'N/A'}</td></tr>`).join('')}</tbody>
                            </table>
                          </body></html>
                        `;
                        printManager.executeBrowserPrint(auditHtml);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{language === 'ku' ? 'چاپکردنی مێژووی وردبینی' : 'Print Audit Ledger'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PRINT QUEUE & SPOOLER HISTORY */}
          {/* ========================================================================= */}
          {activeTab === 'QUEUE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {language === 'ku' ? 'ڕیزی پەیوەستکراوی پرینتەر و مێژووی کارەکان' : 'Active Network Print Queue & Spooler'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ku'
                      ? 'چاودێریکردنی ڕەوشی ناردنی فەرمانەکان بۆ پرینتەری تۆڕ لە کاتی ڕاستەقینەدا.'
                      : 'Real-time monitoring of document packets transmitted to local & network printers.'}
                  </p>
                </div>

                {printQueue.length > 0 && (
                  <button
                    onClick={clearPrintHistory}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'ku' ? 'پاککردنەوەی مێژوو' : 'Clear History'}</span>
                  </button>
                )}
              </div>

              {printQueue.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                  <Printer className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">
                    {language === 'ku' ? 'هیچ کارێکی چاپکردن لە ڕیزدا نییە' : 'Print Queue is currently empty'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {language === 'ku' ? 'هەر بەڵگەنامەیەک یان ڕاپۆرتێک چاپ بکەیت، لێرە تۆمار دەبێت.' : 'Printed documents and reports will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <table className="w-full text-start border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 text-start">{language === 'ku' ? 'ناونیشانی کار' : 'Job Title'}</th>
                        <th className="py-3 px-3 text-start">{language === 'ku' ? 'پرینتەری مەبەست' : 'Target Printer'}</th>
                        <th className="py-3 px-3 text-center">{language === 'ku' ? 'قەبارەی بایت' : 'Size'}</th>
                        <th className="py-3 px-3 text-center">{language === 'ku' ? 'دۆخ' : 'Status'}</th>
                        <th className="py-3 px-3 text-end">{language === 'ku' ? 'کات' : 'Submitted'}</th>
                        <th className="py-3 px-4 text-center">{language === 'ku' ? 'کردار' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {printQueue.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 text-start">
                            <span className="font-bold text-slate-900 block">{job.jobTitle}</span>
                            <span className="text-[10px] font-mono text-slate-400">{job.id}</span>
                          </td>
                          <td className="py-3.5 px-3 text-start">
                            <span className="font-semibold text-slate-800 block">{job.printerName}</span>
                            {job.printerIp && (
                              <span className="text-[10px] font-mono text-blue-600 block">
                                {job.printerIp}:{job.printerPort || 9100}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                            {(job.payloadBytesSize / 1024).toFixed(1)} KB
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              job.status === 'PRINTED' ? 'bg-emerald-100 text-emerald-800' :
                              job.status === 'TRANSMITTING' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                              job.status === 'SPOOLING' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {job.status === 'PRINTED' && <Check className="w-3 h-3 text-emerald-600" />}
                              <span>{job.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-end font-mono text-slate-500 text-[11px]">
                            {new Date(job.submittedAt).toLocaleTimeString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => reprintJob(job.id)}
                                className="px-2 py-1 rounded-lg text-[11px] font-bold bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white transition cursor-pointer flex items-center gap-1"
                                title="Reprint Job"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>{language === 'ku' ? 'چاپکردنەوە' : 'Reprint'}</span>
                              </button>

                              {job.status === 'QUEUED' && (
                                <button
                                  onClick={() => cancelPrintJob(job.id)}
                                  className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Cancel Job"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: NETWORK PRINTERS CONFIGURATION */}
          {/* ========================================================================= */}
          {activeTab === 'PRINTERS' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {language === 'ku' ? 'پرینتەرە ناسێندراوەکانی تۆڕ و بارستە چاپ' : 'Registered Network & Hardware Printers'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ku'
                      ? 'بەستنەوەی ڕاستەوخۆ بە پرینتەری هۆڵدینگ لە ڕێگەی IP Address و Port 9100.'
                      : 'Configure local and direct network IP printers for automatic order dispatching.'}
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingNewPrinter(!isAddingNewPrinter)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ku' ? 'زیادکردنی پرینتەری نوێ' : 'Add Network Printer'}</span>
                </button>
              </div>

              {/* Add New Printer Form Collapsible */}
              {isAddingNewPrinter && (
                <form
                  onSubmit={handleAddNewPrinterSubmit}
                  className="bg-white p-5 rounded-2xl border-2 border-blue-400 shadow-md space-y-4 animate-in fade-in"
                >
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 text-blue-700">
                    <Wifi className="w-4 h-4" />
                    <span>{language === 'ku' ? 'ڕێکخستنی پرینتەری نوێی تۆڕ (TCP/IP)' : 'Configure New Network TCP/IP Printer'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">
                        {language === 'ku' ? 'ناوی پرینتەر' : 'Printer Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={newPrnName}
                        onChange={(e) => setNewPrnName(e.target.value)}
                        placeholder="e.g. Finance HQ LaserJet"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">
                        {language === 'ku' ? 'جۆری پرینتەر' : 'Printer Type'}
                      </label>
                      <select
                        value={newPrnType}
                        onChange={(e) => setNewPrnType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                      >
                        <option value="NETWORK_IP">Network IP (Direct RAW)</option>
                        <option value="STANDARD_A4">Standard A4 / Laser</option>
                        <option value="THERMAL_80MM">Thermal POS 80mm</option>
                        <option value="THERMAL_58MM">Thermal POS 58mm</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">
                        {language === 'ku' ? 'قەبارەی کاغەز' : 'Paper Size'}
                      </label>
                      <select
                        value={newPrnPaper}
                        onChange={(e) => setNewPrnPaper(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                      >
                        <option value="A4">A4 Standard</option>
                        <option value="Letter">Letter</option>
                        <option value="80mm">80mm Thermal</option>
                        <option value="58mm">58mm Thermal</option>
                      </select>
                    </div>
                  </div>

                  {newPrnType === 'NETWORK_IP' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          IP Address
                        </label>
                        <input
                          type="text"
                          required
                          value={newPrnIp}
                          onChange={(e) => setNewPrnIp(e.target.value)}
                          placeholder="192.168.1.180"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-mono text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          Raw Port (Standard: 9100)
                        </label>
                        <input
                          type="number"
                          required
                          value={newPrnPort}
                          onChange={(e) => setNewPrnPort(parseInt(e.target.value) || 9100)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-mono text-xs font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={newPrnAutoPrint}
                        onChange={(e) => setNewPrnAutoPrint(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600"
                      />
                      <span className="font-semibold text-slate-700">
                        {language === 'ku' ? 'چاپی خۆکارانە لە کاتی پەسەندکردنی فەرماندا' : 'Auto-print immediately upon Owner approval'}
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingNewPrinter(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                      >
                        {language === 'ku' ? 'پاشگەزبوونەوە' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
                      >
                        {language === 'ku' ? 'زیادکردنی پرینتەر' : 'Save Printer'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Printer Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {printerDevices.map((device) => (
                  <div
                    key={device.id}
                    className={`bg-white p-5 rounded-2xl border transition shadow-2xs space-y-3 ${
                      device.isDefault ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                          device.type === 'NETWORK_IP' ? 'bg-indigo-50 text-indigo-700' :
                          device.type.includes('THERMAL') ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          <Printer className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                              {device.name}
                            </h4>
                            {device.isDefault && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800">
                                Default
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                            {device.type} • {device.paperSize}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-bold text-emerald-700">Online</span>
                      </div>
                    </div>

                    {device.ipAddress && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-mono flex items-center justify-between">
                        <span className="text-slate-500">Socket Host:</span>
                        <span className="font-bold text-slate-800">{device.ipAddress}:{device.port || 9100}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        {!device.isDefault && (
                          <button
                            onClick={() => setDefaultPrinter(device.id)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            {language === 'ku' ? 'دانان وەک بنەڕەتی' : 'Set as Default'}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePingPrinter(device)}
                          disabled={testingPrinterId === device.id}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center gap-1"
                        >
                          <Radio className={`w-3 h-3 ${testingPrinterId === device.id ? 'animate-spin' : ''}`} />
                          <span>Ping</span>
                        </button>

                        {printerDevices.length > 1 && (
                          <button
                            onClick={() => deletePrinterDevice(device.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                            title="Remove Printer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {language === 'ku'
                ? 'بەڕێوەبەری چاپی SAS4ERP بەستراوە بە هەموو فەرمان و ڕاپۆرتەکانی ناو سیستم'
                : 'SAS4ERP PrintManager connected to enterprise approvals & reporting pipeline'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
          >
            {language === 'ku' ? 'داخستن' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
