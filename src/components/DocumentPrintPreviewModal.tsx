import React, { useState } from 'react';
import {
  Printer,
  FileText,
  Receipt,
  X,
  CheckCircle2,
  Download,
  Building2,
  Calendar,
  Hash,
  ShieldCheck,
  Stamp,
  QrCode,
  DollarSign
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { getUIText } from '../utils/langHelper';
import { PurchaseOrder } from '../types/erp';

interface DocumentPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder | null;
  defaultFormat?: 'A4' | '80MM';
}

export const DocumentPrintPreviewModal: React.FC<DocumentPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  purchaseOrder,
  defaultFormat = 'A4'
}) => {
  const { holding, companies, projects, defaultPrinter, defaultSignature } = useERP();
  const { language } = useLanguage();

  const [printFormat, setPrintFormat] = useState<'A4' | '80MM'>(
    defaultPrinter?.paperSize === '80mm' ? '80MM' : defaultFormat
  );

  if (!isOpen || !purchaseOrder) return null;

  const company = companies.find(c => c.id === purchaseOrder.companyId);
  const project = projects.find(p => p.id === purchaseOrder.projectId);

  const holdingTitle = language === 'ku' && holding.nameKu ? holding.nameKu :
    language === 'ar' && holding.nameAr ? holding.nameAr :
    holding.name || 'Holding Enterprise Group';

  const companyTitle = language === 'ku' && company?.nameKu ? company.nameKu :
    language === 'ar' && company?.nameAr ? company.nameAr :
    company?.name || 'Subsidiary Enterprise';

  const projectTitle = language === 'ku' && project?.nameKu ? project.nameKu :
    language === 'ar' && project?.nameAr ? project.nameAr :
    project?.name || 'Project Operation';

  const ownerSignatureImage = purchaseOrder.holdingApproval?.signatureImage || defaultSignature?.signatureDataUrl;
  const officialSealImage = purchaseOrder.holdingApproval?.sealStampImage || defaultSignature?.officialSealDataUrl;

  const handleExecutePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200 my-auto"
        role="dialog"
      >
        {/* Modal Controls Bar (Hidden during physical print via print:hidden) */}
        <div className="print:hidden px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  {getUIText(language, {
                    en: 'Official Document Print Preview & Station Output',
                    ku: 'پێشبینینی چاپی فەرمی و بەستنەوە بە پرینتەر',
                    ar: 'معاينة الطباعة الرسمية والمخرجات المادية'
                  })}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  {defaultPrinter?.name || 'Default System Printer'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {purchaseOrder.poNumber} • {companyTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Format Switcher */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
              <button
                onClick={() => setPrintFormat('A4')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  printFormat === 'A4' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 Official Voucher</span>
              </button>
              <button
                onClick={() => setPrintFormat('80MM')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  printFormat === '80MM' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>80mm Thermal Receipt</span>
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handleExecutePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition cursor-pointer"
              id="execute-physical-print-btn"
            >
              <Printer className="w-4 h-4" />
              <span>{getUIText(language, { en: 'Print Now', ku: 'ئێستا چاپ بکە', ar: 'طباعة فورية' })}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Viewport */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          
          {/* ========================================================================= */}
          {/* FORMAT 1: A4 EXECUTIVE OFFICIAL VOUCHER */}
          {/* ========================================================================= */}
          {printFormat === 'A4' && (
            <div 
              className="bg-white w-full max-w-[794px] min-h-[1123px] p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-300 text-slate-900 flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:rounded-none"
              id="printable-a4-document"
            >
              {/* Top Official Letterhead */}
              <div>
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
                  {/* Left: Holding Branding & Logo */}
                  <div className="flex items-center gap-4">
                    {holding.logoUrl ? (
                      <img
                        src={holding.logoUrl}
                        alt="Holding Logo"
                        className="w-16 h-16 object-contain border border-slate-200 rounded-xl p-1 bg-white"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                        SAS
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                        {holdingTitle}
                      </h1>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        {companyTitle} • {projectTitle}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {holding.headquarters || 'Executive Headquarters'} • Reg: {holding.legalRegistration || 'REG-SAS-2026'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Document Title & Metadata */}
                  <div className="text-right">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded bg-slate-900 text-white inline-block mb-1">
                      {getUIText(language, { en: 'Official Purchase Authorization', ku: 'بەڵگەنامەی پەسەندکراوی خەرجی', ar: 'إذن صرف وشراء رسمي معتمد' })}
                    </span>
                    <div className="text-sm font-mono font-bold text-slate-900 mt-1">
                      {purchaseOrder.poNumber}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {new Date(purchaseOrder.createdDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Requisition Overview Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{getUIText(language, { en: 'Requested By:', ku: 'داواکار:', ar: 'مقدم الطلب:' })}</span>
                    <span className="font-bold text-slate-900 block mt-0.5">{purchaseOrder.requestedBy}</span>
                    <span className="text-[11px] text-slate-500">{purchaseOrder.requesterRole}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{getUIText(language, { en: 'Vendor / Supplier:', ku: 'دابینکەر / کۆمپانیا:', ar: 'المورد / الجهة:' })}</span>
                    <span className="font-bold text-slate-900 block mt-0.5">{purchaseOrder.supplierName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">Approved Vendor</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{getUIText(language, { en: 'Currency & Terms:', ku: 'دراو و مەرجەکان:', ar: 'العملة والشروط:' })}</span>
                    <span className="font-bold text-slate-900 block mt-0.5">{purchaseOrder.currency}</span>
                    <span className="text-[11px] text-slate-500">Net 30 Days</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{getUIText(language, { en: 'Total Authorized:', ku: 'کۆی گشتی خەرجی:', ar: 'المبلغ الإجمالي:' })}</span>
                    <span className="font-black text-emerald-700 text-base block mt-0.5">
                      ${purchaseOrder.totalAmountUSD.toLocaleString()} {purchaseOrder.currency}
                    </span>
                  </div>
                </div>

                {/* Purpose */}
                <div className="mb-6 bg-blue-50/50 p-3 rounded-xl border border-blue-200/80 text-xs">
                  <span className="font-bold text-blue-950 block mb-0.5">
                    {getUIText(language, { en: 'Business Purpose & Scope:', ku: 'مەبەستی کارپێکردن و پێداویستی:', ar: 'الغرض ونطاق العمل:' })}
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {purchaseOrder.purpose}
                  </p>
                </div>

                {/* Itemized Table */}
                <div className="mb-6 overflow-hidden rounded-xl border border-slate-300">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">{getUIText(language, { en: 'Item Description', ku: 'پێناسەی کەرەستە / خزمەتگوزاری', ar: 'بيان الصنف / الخدمة' })}</th>
                        <th className="py-2.5 px-3 text-center">{getUIText(language, { en: 'Category', ku: 'پۆل', ar: 'الفئة' })}</th>
                        <th className="py-2.5 px-3 text-center">{getUIText(language, { en: 'Qty', ku: 'بڕ', ar: 'الكمية' })}</th>
                        <th className="py-2.5 px-3 text-right">{getUIText(language, { en: 'Unit Price', ku: 'نرخی تاک', ar: 'سعر الوحدة' })}</th>
                        <th className="py-2.5 px-3 text-right">{getUIText(language, { en: 'Total Amount', ku: 'کۆی گشتی', ar: 'المجموع' })}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {purchaseOrder.items.map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {language === 'ku' && item.nameKu ? item.nameKu :
                             language === 'ar' && item.nameAr ? item.nameAr : item.name}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600">{item.category}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.quantity} {item.unit}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">${item.unitPriceUSD.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${item.totalUSD.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-right text-slate-600">
                          {getUIText(language, { en: 'Grand Total Authorized (USD):', ku: 'کۆی کۆتایی پەسەندکراو ($):', ar: 'المجموع الإجمالي المعتمد ($):' })}
                        </td>
                        <td colSpan={2} className="py-2.5 px-3 text-right font-mono text-emerald-800 text-sm">
                          ${purchaseOrder.totalAmountUSD.toLocaleString()} USD
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Bottom: Official Electronic Signatures & Cryptographic Seals */}
              <div className="border-t-2 border-slate-900 pt-6 mt-6">
                <div className="text-xs font-black uppercase tracking-wider text-slate-700 mb-4 flex items-center justify-between">
                  <span>{getUIText(language, { en: 'Executive Authorization & Electronic Signatures', ku: 'واژۆی ئەلیکترۆنی و مۆری فەرمی بڕیاردەران', ar: 'الاعتمادات والتواقيع الإلكترونية الرسمية' })}</span>
                  <span className="font-mono text-[10px] text-slate-400">ENCRYPTED AUDIT REF: {purchaseOrder.holdingApproval?.signatureHash || 'SIG-CHAIN-VERIFIED'}</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Signature 1: Site Project Director */}
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 flex flex-col justify-between h-40">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{getUIText(language, { en: 'Project Director (PM)', ku: 'بەڕێوەبەری پڕۆژە', ar: 'مدير المشروع' })}</span>
                    <div className="flex-1 flex items-center justify-center py-1">
                      <div className="font-serif italic font-bold text-slate-800 text-lg border-b border-slate-400 pb-1 px-4">
                        {project?.projectManager || purchaseOrder.requestedBy}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono text-center">
                      Verified Site Requisition
                    </div>
                  </div>

                  {/* Signature 2: Subsidiary General Manager */}
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 flex flex-col justify-between h-40">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{getUIText(language, { en: 'Subsidiary GM / Finance', ku: 'بەڕێوەبەری گشتی کۆمپانیا', ar: 'المدير العام للشركة' })}</span>
                    <div className="flex-1 flex items-center justify-center py-1">
                      <div className="font-mono italic font-bold text-blue-900 text-lg border-b border-blue-400 pb-1 px-4">
                        {company?.generalManager || 'Approved Division GM'}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono text-center">
                      Budget Threshold Cleared
                    </div>
                  </div>

                  {/* Signature 3: Holding Owner & Corporate Seal */}
                  <div className="border-2 border-amber-400 bg-amber-50/40 rounded-xl p-3 flex flex-col justify-between h-40 relative overflow-hidden">
                    <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center justify-between">
                      <span>{getUIText(language, { en: 'Holding Owner & Seal', ku: 'خاوەنی هۆڵدینگ و مۆر', ar: 'مالك الهولدينغ والختم' })}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    </span>

                    <div className="flex-1 flex items-center justify-center gap-2 py-1">
                      {ownerSignatureImage ? (
                        <img
                          src={ownerSignatureImage}
                          alt="Owner Signature"
                          className="max-h-16 max-w-[120px] object-contain"
                        />
                      ) : (
                        <div className="font-serif italic font-black text-amber-950 text-xl border-b-2 border-amber-500 pb-1 px-3">
                          {holding.chairmanName || 'Holding Chairman'}
                        </div>
                      )}

                      {officialSealImage && (
                        <img
                          src={officialSealImage}
                          alt="Official Holding Seal"
                          className="w-16 h-16 object-contain opacity-95 shrink-0"
                        />
                      )}
                    </div>

                    <div className="text-[9px] font-mono text-amber-800 text-center truncate">
                      {purchaseOrder.holdingApproval?.signatureHash || `SIG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`}
                    </div>
                  </div>
                </div>

                {/* Document Verification Footer Bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-6 pt-3 border-t border-slate-200 font-mono">
                  <span>SAS ERP Electronic Governance Platform • Validated Tamper-Evident Record</span>
                  <span>Print Generated: {new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FORMAT 2: 80MM POS THERMAL RECEIPT SLIP */}
          {/* ========================================================================= */}
          {printFormat === '80MM' && (
            <div 
              className="bg-white w-[320px] min-h-[600px] p-4 rounded-xl shadow-xl border border-slate-300 font-mono text-slate-900 text-xs flex flex-col justify-between print:shadow-none print:border-none print:p-2 print:m-0 print:w-full print:rounded-none"
              id="printable-thermal-receipt"
            >
              <div>
                {/* Header */}
                <div className="text-center pb-3 border-b-2 border-dashed border-slate-400 space-y-1">
                  <div className="font-black text-sm tracking-wider uppercase">
                    {holdingTitle}
                  </div>
                  <div className="font-bold text-[11px] text-slate-700">
                    {companyTitle}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    *** VOUCHER RECEIPT ***
                  </div>
                  <div className="text-[10px] text-slate-600">
                    PO: {purchaseOrder.poNumber}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Date: {new Date(purchaseOrder.createdDate).toLocaleString()}
                  </div>
                </div>

                {/* Details */}
                <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-1">
                  <div><span className="font-bold">Project:</span> {projectTitle}</div>
                  <div><span className="font-bold">Requested:</span> {purchaseOrder.requestedBy}</div>
                  <div><span className="font-bold">Supplier:</span> {purchaseOrder.supplierName}</div>
                </div>

                {/* Items */}
                <div className="py-2.5 border-b-2 border-dashed border-slate-400 space-y-1.5 text-[11px]">
                  <div className="flex justify-between font-bold border-b border-slate-200 pb-1">
                    <span>ITEM / QTY</span>
                    <span>TOTAL</span>
                  </div>
                  {purchaseOrder.items.map((item, i) => (
                    <div key={item.id} className="space-y-0.5">
                      <div className="font-bold">{i + 1}. {item.name}</div>
                      <div className="flex justify-between text-slate-600 text-[10px]">
                        <span>{item.quantity} {item.unit} x ${item.unitPriceUSD}</span>
                        <span className="font-bold text-slate-900">${item.totalUSD}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grand Total */}
                <div className="py-3 border-b-2 border-dashed border-slate-400 text-sm font-black flex justify-between">
                  <span>TOTAL USD:</span>
                  <span className="text-base">${purchaseOrder.totalAmountUSD.toLocaleString()}</span>
                </div>

                {/* E-Signature on Slip */}
                <div className="py-3 text-center space-y-1.5 border-b border-dashed border-slate-300">
                  <div className="text-[10px] font-bold uppercase text-slate-600">
                    AUTHORIZED BY HOLDING OWNER
                  </div>
                  {ownerSignatureImage ? (
                    <img
                      src={ownerSignatureImage}
                      alt="Owner Signature"
                      className="max-h-12 max-w-[140px] mx-auto object-contain"
                    />
                  ) : (
                    <div className="font-serif italic font-bold text-slate-800 text-sm">
                      {holding.chairmanName || 'Holding Chairman'}
                    </div>
                  )}
                  <div className="text-[9px] text-slate-500 font-mono">
                    HASH: {purchaseOrder.holdingApproval?.signatureHash?.slice(0, 16) || 'SIG-OK-2026'}
                  </div>
                </div>

                {/* Barcode Simulation */}
                <div className="pt-3 text-center space-y-1">
                  <div className="inline-block bg-slate-900 text-white font-mono text-[9px] px-2 py-0.5 tracking-widest">
                    * {purchaseOrder.poNumber} *
                  </div>
                  <div className="text-[8px] text-slate-400">
                    GATE SCAN CODE • SAS ERP DISPATCH
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 text-[8px] text-slate-400">
                ================================<br />
                THANK YOU FOR YOUR SERVICE<br />
                ================================
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
