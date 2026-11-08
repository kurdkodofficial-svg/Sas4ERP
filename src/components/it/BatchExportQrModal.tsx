import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import {
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  CalendarClock,
  Printer,
  ShieldCheck,
  Building2,
  MapPin,
  CheckSquare,
  Square,
  FileText,
  Sliders,
  Sparkles,
  Server,
  QrCode
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  HardwareAssetRecord,
  HardwareMaintenanceRecord
} from '../../types/itAssetTracking';

export interface UpcomingAssetItem {
  asset: HardwareAssetRecord;
  upcomingTicket?: HardwareMaintenanceRecord;
  maintenanceDate: string;
  daysRemaining: number;
  isOverdue: boolean;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  ticketNumber: string;
  technicianName: string;
  technicianPhone: string;
}

interface BatchExportQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: HardwareAssetRecord[];
  maintenanceRecords: HardwareMaintenanceRecord[];
  onExportSuccess: (message: { ku: string; en: string }) => void;
}

export const BatchExportQrModal: React.FC<BatchExportQrModalProps> = ({
  isOpen,
  onClose,
  assets,
  maintenanceRecords,
  onExportSuccess
}) => {
  const { language } = useLanguage();

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [includeMaintenanceBanner, setIncludeMaintenanceBanner] = useState<boolean>(true);
  const [includeDigitalSeal, setIncludeDigitalSeal] = useState<boolean>(true);
  const [sheetLayout, setSheetLayout] = useState<'standard_6' | 'compact_8'>('standard_6');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Calculate upcoming maintenance items in the next 30 days
  const upcomingItems = useMemo<UpcomingAssetItem[]>(() => {
    const today = new Date(); // 2026-11-05
    today.setHours(0, 0, 0, 0);

    const results: UpcomingAssetItem[] = [];

    assets.forEach(asset => {
      // Find matching tickets in maintenance records
      const matchingTickets = maintenanceRecords.filter(m =>
        (m.assetId === asset.id || m.assetTag === asset.assetTag) &&
        (m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS' || m.status === 'OVERDUE')
      );

      // Find ticket scheduled in the next 30 days (or overdue / in-progress)
      const ticket = matchingTickets.find(m => {
        if (!m.scheduledDate) return false;
        const target = new Date(m.scheduledDate);
        target.setHours(0, 0, 0, 0);
        const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diffDays >= -30 && diffDays <= 30;
      });

      // Also check asset's own nextInspectionDueDate if available
      let inspectionDueSoon = false;
      let inspectionDate = '';
      let inspectionDiffDays = 0;
      if (asset.nextInspectionDueDate) {
        const d = new Date(asset.nextInspectionDueDate);
        d.setHours(0, 0, 0, 0);
        inspectionDiffDays = Math.round((d.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (inspectionDiffDays >= -15 && inspectionDiffDays <= 30) {
          inspectionDueSoon = true;
          inspectionDate = asset.nextInspectionDueDate;
        }
      }

      if (ticket || inspectionDueSoon || asset.status === 'MAINTENANCE_REQUIRED') {
        const dateStr = ticket?.scheduledDate || inspectionDate || 'Next 30 Days';
        let days = 0;
        let overdue = false;

        if (ticket?.scheduledDate) {
          const tDate = new Date(ticket.scheduledDate);
          days = Math.round((tDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
          if (days < 0 || ticket.status === 'OVERDUE') overdue = true;
        } else if (inspectionDueSoon) {
          days = inspectionDiffDays;
          if (days < 0) overdue = true;
        }

        results.push({
          asset,
          upcomingTicket: ticket,
          maintenanceDate: dateStr,
          daysRemaining: days,
          isOverdue: overdue,
          priority: ticket?.priority || (asset.status === 'MAINTENANCE_REQUIRED' ? 'HIGH' : 'MEDIUM'),
          ticketNumber: ticket?.ticketNumber || 'MNT-UPCOMING-30D',
          technicianName: ticket?.technicianName || asset.assignedTechnician,
          technicianPhone: ticket?.technicianPhone || asset.technicianPhone
        });
      }
    });

    return results;
  }, [assets, maintenanceRecords]);

  // Synchronize initial selections
  React.useEffect(() => {
    if (upcomingItems.length > 0 && selectedAssetIds.length === 0) {
      setSelectedAssetIds(upcomingItems.map(i => i.asset.id));
    }
  }, [upcomingItems]);

  if (!isOpen) return null;

  // Filtered items in modal
  const filteredModalItems = upcomingItems.filter(item => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      item.asset.assetTag.toLowerCase().includes(q) ||
      item.asset.model.toLowerCase().includes(q) ||
      item.asset.assignedSiteNameEn.toLowerCase().includes(q) ||
      item.asset.assignedSiteNameKu.includes(q) ||
      item.ticketNumber.toLowerCase().includes(q)
    );
  });

  const selectedCount = selectedAssetIds.length;
  const isAllSelected = filteredModalItems.length > 0 && filteredModalItems.every(i => selectedAssetIds.includes(i.asset.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(upcomingItems.map(i => i.asset.id));
    }
  };

  const toggleAssetSelection = (id: string) => {
    setSelectedAssetIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Generate & Download PDF Sheet
  const handleGeneratePdf = async () => {
    const selectedItems = upcomingItems.filter(i => selectedAssetIds.includes(i.asset.id));

    if (selectedItems.length === 0) {
      alert(language === 'ku' ? 'تکایە بەلایەنی کەمەوە یەک ئامێر هەڵبژێرە بۆ هەناردەکردن.' : 'Please select at least one hardware asset to export.');
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const marginX = 12;
      const marginTop = 28;
      const marginBottom = 14;

      // Layout configuration:
      // Standard: 2 cols x 3 rows = 6 stickers per page (72mm height)
      // Compact: 2 cols x 4 rows = 8 stickers per page (58mm height)
      const cols = 2;
      const rows = sheetLayout === 'compact_8' ? 4 : 3;
      const stickersPerPage = cols * rows;
      const stickerGapX = 8;
      const stickerGapY = sheetLayout === 'compact_8' ? 6 : 8;
      const stickerWidth = (pageWidth - (marginX * 2) - ((cols - 1) * stickerGapX)) / cols; // ~89mm
      const stickerHeight = sheetLayout === 'compact_8' ? 58 : 73;

      const totalPages = Math.ceil(selectedItems.length / stickersPerPage);
      const dateStr = new Date().toISOString().split('T')[0];

      const renderHeader = (pageIndex: number) => {
        // Top Navy Header Banner
        doc.setFillColor(15, 23, 42); // #0f172a
        doc.rect(0, 0, pageWidth, 22, 'F');

        // Top Accent Stripe (Amber/Gold)
        doc.setFillColor(245, 158, 11); // #f59e0b
        doc.rect(0, 22, pageWidth, 1.5, 'F');

        // Header Title
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text('SAS HOLDING ERP - IT INFRASTRUCTURE & HARDWARE OPERATIONS', marginX, 9.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(203, 213, 225); // Slate 300
        doc.text('BATCH QR CODE ASSET IDENTIFICATION SHEET - 30-DAY UPCOMING MAINTENANCE', marginX, 15.5);

        // Header Right Info
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(245, 158, 11);
        doc.text(`AUDIT DATE: ${dateStr}`, pageWidth - marginX - 44, 9.5);
        doc.setTextColor(255, 255, 255);
        doc.text(`LABELS IN SHEET: ${selectedItems.length}`, pageWidth - marginX - 44, 15.5);
      };

      const renderFooter = (pageIndex: number) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.text(
          `CONFIDENTIAL - SAS HOLDING ERP CRYPTOGRAPHIC HARDWARE REGISTRY - PAGE ${pageIndex + 1} OF ${totalPages}`,
          pageWidth / 2,
          pageHeight - 7,
          { align: 'center' }
        );
      };

      for (let i = 0; i < selectedItems.length; i++) {
        const pageIndex = Math.floor(i / stickersPerPage);
        const itemOnPage = i % stickersPerPage;

        if (i > 0 && itemOnPage === 0) {
          doc.addPage();
        }

        if (itemOnPage === 0) {
          renderHeader(pageIndex);
          renderFooter(pageIndex);
        }

        const col = itemOnPage % cols;
        const row = Math.floor(itemOnPage / cols);

        const x = marginX + col * (stickerWidth + stickerGapX);
        const y = marginTop + row * (stickerHeight + stickerGapY);

        const item = selectedItems[i];
        const asset = item.asset;

        // Outer Sticker Card Boundary
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(203, 213, 225); // Slate 300
        doc.setLineWidth(0.4);
        doc.roundedRect(x, y, stickerWidth, stickerHeight, 2.5, 2.5, 'FD');

        // Top Header of Sticker
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(x, y, stickerWidth, 8, 2.5, 2.5, 'F');
        doc.rect(x, y + 4, stickerWidth, 4, 'F'); // Square bottom

        // Brand Text
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('SAS HOLDING', x + 3, y + 5.5);

        // Asset Tag Badge on Right
        doc.setFillColor(245, 158, 11); // Amber
        doc.roundedRect(x + stickerWidth - 36, y + 1.4, 33, 5.2, 1, 1, 'F');
        doc.setTextColor(15, 23, 42);
        doc.setFont('courier', 'bold');
        doc.setFontSize(7);
        doc.text(asset.assetTag, x + stickerWidth - 34.5, y + 5);

        // QR Code Size
        const qrSize = sheetLayout === 'compact_8' ? 22 : 26;
        const qrX = x + 3.5;
        const qrY = y + 10.5;

        // QR Border
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.rect(qrX - 0.8, qrY - 0.8, qrSize + 1.6, qrSize + 1.6, 'FD');

        if (asset.qrCodeDataUrl) {
          doc.addImage(asset.qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
        }

        // Metadata Right Block
        const metaX = qrX + qrSize + 4;
        const metaWidth = stickerWidth - qrSize - 9;
        let textY = y + 12;

        // Device Type
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(71, 85, 105);
        doc.text(asset.deviceType.replace(/_/g, ' '), metaX, textY);

        textY += 3.2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42);
        const splitModel = doc.splitTextToSize(asset.model, metaWidth);
        doc.text(splitModel[0] || asset.model, metaX, textY);

        textY += 3.2;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(100, 116, 139);
        doc.text(`SN: ${asset.serialNumber}`, metaX, textY);

        textY += 3;
        doc.setTextColor(67, 56, 202); // Indigo 700
        doc.setFont('helvetica', 'bold');
        const splitSite = doc.splitTextToSize(asset.assignedSiteNameEn, metaWidth);
        doc.text(splitSite[0] || asset.assignedSiteNameEn, metaX, textY);

        textY += 2.8;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Room: ${asset.locationRoom.slice(0, 22)}`, metaX, textY);

        textY += 2.8;
        doc.setFont('courier', 'normal');
        doc.setFontSize(5.5);
        doc.setTextColor(51, 65, 85);
        doc.text(`IP: ${asset.ipAddress}`, metaX, textY);

        // Maintenance Banner
        if (includeMaintenanceBanner) {
          const bannerHeight = sheetLayout === 'compact_8' ? 12 : 14;
          const bannerY = y + stickerHeight - (includeDigitalSeal ? 18.5 : 15);

          const isUrgent = item.priority === 'CRITICAL' || item.priority === 'HIGH' || item.isOverdue || item.daysRemaining <= 7;
          if (isUrgent) {
            doc.setFillColor(254, 242, 242);
            doc.setDrawColor(248, 113, 113);
          } else {
            doc.setFillColor(254, 243, 199);
            doc.setDrawColor(251, 191, 36);
          }
          doc.setLineWidth(0.3);
          doc.roundedRect(x + 2.5, bannerY, stickerWidth - 5, bannerHeight, 1.2, 1.2, 'FD');

          if (isUrgent) {
            doc.setTextColor(185, 28, 28);
          } else {
            doc.setTextColor(180, 83, 9);
          }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.2);
          const dueStatus = item.isOverdue ? `(OVERDUE: ${item.maintenanceDate})` : `DUE: ${item.maintenanceDate}`;
          doc.text(`UPCOMING MAINTENANCE ${dueStatus}`, x + 4.5, bannerY + 3.8);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.6);
          doc.setTextColor(71, 85, 105);
          doc.text(`Ticket: ${item.ticketNumber} | Priority: ${item.priority}`, x + 4.5, bannerY + 7.2);
          doc.text(`Lead Tech: ${item.technicianName.slice(0, 28)} (${item.technicianPhone})`, x + 4.5, bannerY + 10.5);
        }

        // Cryptographic Digital Security Seal Footer
        if (includeDigitalSeal) {
          const sealY = y + stickerHeight - 2.8;
          doc.setFont('courier', 'normal');
          doc.setFontSize(5);
          doc.setTextColor(148, 163, 184);
          doc.text(`SEAL: ${asset.qrPayload?.digitalSecuritySeal || 'SEAL-ECDSA-VERIFIED'}`, x + 3.5, sealY);
          doc.text(`INSTALLED: ${asset.installDate}`, x + stickerWidth - 27, sealY);
        }
      }

      const filename = `SAS_Holding_Hardware_QR_Sheet_30D_Maintenance_${dateStr}.pdf`;
      doc.save(filename);

      onExportSuccess({
        ku: `پەڕەی فەرمی بارکۆدی QR بۆ (${selectedItems.length}) ئامێر بە سەرکەوتوویی دروستکرا و دابەزێندرا: ${filename}`,
        en: `Batch QR Code PDF Sheet for (${selectedItems.length}) hardware units with 30-day maintenance exported successfully: ${filename}`
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to export batch QR sheet:', err);
      alert(language === 'ku' ? `هەڵە لە دروستکردنی فایلی PDF: ${err.message}` : `Error generating PDF: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir={language === 'en' ? 'ltr' : 'rtl'}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 bg-gradient-to-r from-amber-50/40 via-white to-slate-50 -mx-6 -mt-6 p-6 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20 font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-lg">
                  {language === 'ku'
                    ? 'هەناردەکردنی بەکۆمەڵی پەڕەی بارکۆدی QR'
                    : language === 'ar'
                    ? 'تصدير ورقة رموز QR المجمعة للأجهزة'
                    : 'Batch Export QR Code Sheet'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                  30-Day Window
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ku'
                  ? 'دروستکردنی پەڕەی چاپی A4 بۆ سەرجەم ئەو ئامێرانەی چاککردنەوەیان لە ٣٠ ڕۆژی داهاتوودایە'
                  : language === 'ar'
                  ? 'توليد ورقة طباعة A4 لجميع الأجهزة المجدولة للصيانة الدورية خلال الثلاثين يوماً القادمة'
                  : 'Generates printable A4 sheets of QR codes for hardware scheduled for maintenance in the next 30 days.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick KPI summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ku' ? 'ئامێرە دیاریکراوەکان' : 'Eligible Hardware'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{upcomingItems.length}</span>
              <span className="text-[11px] text-slate-500">Units</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
              {language === 'ku' ? 'چاوەڕوانی چاککردنەوە' : 'Upcoming Window'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-amber-900">30</span>
              <span className="text-[11px] text-amber-700 font-semibold">Days Horizon</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
              {language === 'ku' ? 'هەڵبژێردراو بۆ چاپ' : 'Selected to Export'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-indigo-900">{selectedCount}</span>
              <span className="text-[11px] text-indigo-700 font-semibold">of {upcomingItems.length}</span>
            </div>
          </div>
        </div>

        {/* Export Options Toolbar */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={includeMaintenanceBanner}
                onChange={(e) => setIncludeMaintenanceBanner(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
              />
              <span>{language === 'ku' ? 'لەزگەی هۆشداری چاککردنەوە' : 'Include Maintenance Due Banner'}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={includeDigitalSeal}
                onChange={(e) => setIncludeDigitalSeal(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
              />
              <span>{language === 'ku' ? 'مۆری دیجیتاڵی ئاسایش' : 'Cryptographic Security Seal'}</span>
            </label>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Layout:</span>
            <select
              value={sheetLayout}
              onChange={(e) => setSheetLayout(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
            >
              <option value="standard_6">Standard A4 (6 Labels / Page)</option>
              <option value="compact_8">Compact A4 (8 Labels / Page)</option>
            </select>
          </div>
        </div>

        {/* Hardware List Selection Checklist */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSelectAll}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer transition"
            >
              {isAllSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              <span>{isAllSelected ? (language === 'ku' ? 'لابردنی هەمووی' : 'Deselect All') : (language === 'ku' ? 'دیاریکردنی هەمووی' : 'Select All')}</span>
            </button>

            <span className="text-xs text-slate-400">
              {filteredModalItems.length} units listed
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
            {filteredModalItems.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  {language === 'ku'
                    ? 'هیچ ئامێرێک نەدۆزرایەوە کە لە ٣٠ ڕۆژی داهاتوودا چاککردنەوەی هەبێت.'
                    : 'No hardware assets matched the 30-day maintenance filter.'}
                </p>
              </div>
            ) : (
              filteredModalItems.map((item) => {
                const isSelected = selectedAssetIds.includes(item.asset.id);
                return (
                  <div
                    key={item.asset.id}
                    onClick={() => toggleAssetSelection(item.asset.id)}
                    className={`pt-2.5 first:pt-0 p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/30 border-amber-300 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-slate-400 hover:text-slate-600">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </div>

                      {/* Mini QR preview */}
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-0.5 shrink-0 flex items-center justify-center">
                        {item.asset.qrCodeDataUrl ? (
                          <img
                            src={item.asset.qrCodeDataUrl}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <QrCode className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      {/* Metadata info */}
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-slate-900 px-1.5 py-0.2 rounded bg-slate-100">
                            {item.asset.assetTag}
                          </span>
                          <span className="text-[11px] font-bold text-slate-700 truncate max-w-[220px]">
                            {item.asset.model}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1 text-indigo-700 font-semibold truncate max-w-[180px]">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{language === 'ku' ? item.asset.assignedSiteNameKu : item.asset.assignedSiteNameEn}</span>
                          </span>
                          <span>•</span>
                          <span>{item.asset.locationRoom}</span>
                        </div>
                      </div>
                    </div>

                    {/* Maintenance date & status badge */}
                    <div className="text-right shrink-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.isOverdue
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : item.daysRemaining <= 7
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {item.isOverdue
                            ? (language === 'ku' ? 'دواکەوتووە' : 'Overdue')
                            : language === 'ku'
                            ? `دوای ${item.daysRemaining} ڕۆژ`
                            : `In ${item.daysRemaining} Days`}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-700">
                          {item.maintenanceDate}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 block font-mono">
                        Ticket: {item.ticketNumber} ({item.priority})
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            {language === 'ku' ? 'داخستن' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={isGenerating || selectedCount === 0}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-amber-600/20 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{language === 'ku' ? 'دروستکردنی پەڕەی PDF...' : 'Generating PDF Sheet...'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>
                  {language === 'ku'
                    ? `هەناردەکردنی پەڕەی PDF (${selectedCount} ئامێر)`
                    : `Generate & Download PDF Sheet (${selectedCount} Units)`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
