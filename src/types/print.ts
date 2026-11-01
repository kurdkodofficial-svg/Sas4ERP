import { PrinterDeviceConfig, PurchaseOrder } from './erp';

export type PrintableContentType = 
  | 'PURCHASE_ORDER'
  | 'DIGITAL_APPROVAL'
  | 'KPI_REPORT'
  | 'FINANCIAL_STATEMENT'
  | 'AUDIT_LOG'
  | 'GATE_PASS'
  | 'CUSTOM_DOCUMENT';

export type PrintJobStatus = 
  | 'QUEUED' 
  | 'SPOOLING' 
  | 'TRANSMITTING' 
  | 'PRINTED' 
  | 'FAILED' 
  | 'CANCELLED';

export interface PrintJob {
  id: string;
  jobTitle: string;
  jobTitleKu?: string;
  jobTitleAr?: string;
  contentType: PrintableContentType;
  documentId?: string;
  documentNumber?: string;
  printerId: string;
  printerName: string;
  printerIp?: string;
  printerPort?: number;
  printerType: 'STANDARD_A4' | 'THERMAL_80MM' | 'THERMAL_58MM' | 'NETWORK_IP';
  paperSize: 'A4' | 'Letter' | '80mm' | '58mm';
  copies: number;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  status: PrintJobStatus;
  progressPercent: number; // 0 - 100
  submittedAt: string;
  completedAt?: string;
  errorMessage?: string;
  payloadBytesSize: number;
  isNetworkSocket: boolean;
  rawPayloadSnippet?: string;
  metadata?: Record<string, any>;
}

export interface PrintOptions {
  printerId?: string;
  copies?: number;
  paperSize?: 'A4' | 'Letter' | '80mm' | '58mm';
  orientation?: 'PORTRAIT' | 'LANDSCAPE';
  silent?: boolean;
  includeDigitalSignature?: boolean;
  includeOfficialSeal?: boolean;
  includeAuditHash?: boolean;
  printDirectToSocket?: boolean;
  format?: 'A4' | '80MM' | '58MM';
}

export interface PrintResult {
  success: boolean;
  jobId: string;
  printer: PrinterDeviceConfig;
  messageEn: string;
  messageKu: string;
  messageAr: string;
  timestamp: string;
  bytesSent: number;
  latencyMs?: number;
}

export interface PrintableReportSection {
  heading: string;
  headingKu?: string;
  headingAr?: string;
  type: 'TABLE' | 'KEY_VALUES' | 'SUMMARY_CARDS' | 'TEXT';
  data: any;
}

export interface PrintableReportData {
  title: string;
  titleKu?: string;
  titleAr?: string;
  subtitle?: string;
  holdingName: string;
  chairmanName?: string;
  generatedBy: string;
  date: string;
  timeHorizon?: string;
  summaryMetrics?: Array<{ label: string; value: string | number; sub?: string }>;
  sections?: PrintableReportSection[];
  tableHeaders?: string[];
  tableRows?: Array<Array<string | number>>;
  verifiedHash?: string;
  signatureImage?: string;
  sealImage?: string;
}

export interface PrintManagerInterface {
  printers: PrinterDeviceConfig[];
  defaultPrinter: PrinterDeviceConfig | null;
  printQueue: PrintJob[];
  isPrinting: boolean;
  activeJob: PrintJob | null;
  lastPrintResult: PrintResult | null;

  // Direct Printing Methods
  printDocument: (doc: { title: string; htmlContent?: string; textContent?: string; data?: any; type: PrintableContentType }, options?: PrintOptions) => Promise<PrintResult>;
  printPurchaseOrder: (po: PurchaseOrder, options?: PrintOptions) => Promise<PrintResult>;
  printDigitalApproval: (po: PurchaseOrder, options?: PrintOptions) => Promise<PrintResult>;
  printKpiReport: (reportData: PrintableReportData, options?: PrintOptions) => Promise<PrintResult>;
  printAuditLog: (auditEntries: any[], options?: PrintOptions) => Promise<PrintResult>;
  printDirectToNetworkSocket: (printerId: string, payload: string | Uint8Array, jobTitle: string, options?: PrintOptions) => Promise<PrintResult>;

  // Management Methods
  testPrinterConnection: (printerId: string) => Promise<{ success: boolean; latencyMs: number; message: string }>;
  cancelPrintJob: (jobId: string) => void;
  reprintJob: (jobId: string) => Promise<PrintResult | null>;
  clearPrintHistory: () => void;
}
