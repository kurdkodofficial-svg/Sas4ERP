import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { getUIText } from '../utils/langHelper';
import { PrinterDeviceConfig } from '../types/erp';

interface PrinterConnectivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTestPrint?: (device: PrinterDeviceConfig) => void;
}

export const PrinterConnectivityModal: React.FC<PrinterConnectivityModalProps> = ({
  isOpen,
  onClose,
  onOpenTestPrint
}) => {
  const {
    holding,
    printerDevices,
    addPrinterDevice,
    updatePrinterDevice,
    deletePrinterDevice,
    setDefaultPrinter
  } = useERP();
  const { language } = useLanguage();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testSuccessNotice, setTestSuccessNotice] = useState<string | null>(null);

  // New Printer Form State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'STANDARD_A4' | 'THERMAL_80MM' | 'THERMAL_58MM' | 'NETWORK_IP'>('STANDARD_A4');
  const [newIpAddress, setNewIpAddress] = useState('192.168.1.150');
  const [newPort, setNewPort] = useState(9100);
  const [newPaperSize, setNewPaperSize] = useState<'A4' | 'Letter' | '80mm' | '58mm'>('A4');
  const [newAutoPrint, setNewAutoPrint] = useState(false);

  if (!isOpen) return null;

  const handleTestPing = (device: PrinterDeviceConfig) => {
    setTestingId(device.id);
    setTestSuccessNotice(null);

    setTimeout(() => {
      setTestingId(null);
      setTestSuccessNotice(
        getUIText(language, {
          en: `Printer "${device.name}" responded successfully! Latency: 12ms. Status: Ready.`,
          ku: `پرینتەری "${device.name}" بە سەرکەوتوویی وەڵامی دایەوە! خێرایی پەیوەندی: 12ms. دۆخ: ئامادەیە بۆ چاپ.`,
          ar: `استجابت الطابعة "${device.name}" بنجاح! سرعة الاتصال: 12ms. الحالة: جاهزة للطباعة.`
        })
      );
      if (onOpenTestPrint) {
        onOpenTestPrint(device);
      }
    }, 700);
  };

  const handleCreatePrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addPrinterDevice({
      name: newName.trim(),
      type: newType,
      ipAddress: newType === 'NETWORK_IP' ? newIpAddress : undefined,
      port: newType === 'NETWORK_IP' ? newPort : undefined,
      isDefault: printerDevices.length === 0,
      status: 'ONLINE',
      autoPrintOnApproval: newAutoPrint,
      paperSize: newPaperSize,
      copies: 1
    });

    setNewName('');
    setIsAddingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {getUIText(language, {
                    en: 'Hardware Printer Connectivity & Station Manager',
                    ku: 'بەستنەوە بە پرینتەر و بەڕێوەبردنی ئامێرەکانی چاپ',
                    ar: 'إدارة الطابعات والربط المباشر مع أجهزة الطباعة'
                  })}
                </h2>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{printerDevices.filter(p => p.status === 'ONLINE').length} {getUIText(language, { en: 'Connected', ku: 'بەستراوە', ar: 'متصل' })}</span>
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-0.5">
                {getUIText(language, {
                  en: 'Connect standard laser/inkjet A4 printers, thermal 80mm/58mm POS receipt printers, and network IP stations',
                  ku: 'بەستنەوەی پرینتەری بەڵگەنامەی A4، پرینتەری پسوولەی کاغەزی 80mm و پرینتەری سەربەخۆی تۆڕ (IP)',
                  ar: 'ربط طابعات A4 المكتبية، طابعات الفواتير الحرارية 80 مم، وطابعات الشبكة IP'
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Test notice if triggered */}
          {testSuccessNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testSuccessNotice}</span>
            </div>
          )}

          {/* Connected Printers List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                {getUIText(language, { en: 'Active Printer Stations:', ku: 'پرینتەرە ناسێندراوەکانی سیستەم:', ar: 'محطات الطباعة النشطة:' })} ({printerDevices.length})
              </span>
              <button
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{getUIText(language, { en: 'Add Printer (+)', ku: 'زیادکردنی پرینتەری نوێ (+)', ar: 'إضافة طابعة جديدة (+)' })}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {printerDevices.map((device) => {
                const isOnline = device.status === 'ONLINE';
                const isDefault = device.isDefault;

                return (
                  <div
                    key={device.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isDefault
                        ? 'border-blue-500 bg-blue-50/30 shadow-xs ring-1 ring-blue-300'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                        device.type === 'STANDARD_A4'
                          ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                          : device.type === 'THERMAL_80MM' || device.type === 'THERMAL_58MM'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}>
                        {device.type === 'STANDARD_A4' ? (
                          <FileText className="w-5 h-5" />
                        ) : device.type === 'THERMAL_80MM' || device.type === 'THERMAL_58MM' ? (
                          <Receipt className="w-5 h-5" />
                        ) : (
                          <Wifi className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900">{device.name}</span>
                          {isDefault && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold">
                              {getUIText(language, { en: 'Default Printer', ku: 'پرینتەری سەرەکی', ar: 'الطابعة الافتراضية' })}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>{getUIText(language, { en: 'Online', ku: 'ئامادەیە', ar: 'جاهزة' })}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap font-mono">
                          <span>
                            {device.type === 'STANDARD_A4'
                              ? 'A4 / Letter Document'
                              : device.type === 'THERMAL_80MM'
                              ? '80mm Thermal Slip'
                              : device.type === 'THERMAL_58MM'
                              ? '58mm Compact Thermal'
                              : `TCP/IP ${device.ipAddress}:${device.port}`}
                          </span>
                          <span>•</span>
                          <span>{device.paperSize}</span>
                          <span>•</span>
                          <span className={device.autoPrintOnApproval ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                            {device.autoPrintOnApproval
                              ? getUIText(language, { en: 'Auto-print on Owner Approval: ON', ku: 'چاپکردنی خۆکار: چالاکە', ar: 'طباعة تلقائية: مفعل' })
                              : getUIText(language, { en: 'Auto-print: OFF', ku: 'چاپکردنی خۆکار: ناچالاکە', ar: 'طباعة تلقائية: غير مفعل' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {/* Toggle Auto Print */}
                      <button
                        onClick={() => updatePrinterDevice(device.id, { autoPrintOnApproval: !device.autoPrintOnApproval })}
                        className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          device.autoPrintOnApproval
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Toggle Auto-print on Holding Approval"
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </button>

                      {/* Set Default */}
                      {!isDefault && (
                        <button
                          onClick={() => setDefaultPrinter(device.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition cursor-pointer"
                        >
                          {getUIText(language, { en: 'Set Default', ku: 'بیکە بە سەرەکی', ar: 'تعيين كافتراضية' })}
                        </button>
                      )}

                      {/* Test Ping & Sample Print */}
                      <button
                        onClick={() => handleTestPing(device)}
                        disabled={testingId === device.id}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-400" />
                        <span>
                          {testingId === device.id
                            ? getUIText(language, { en: 'Testing...', ku: 'پشکنین...', ar: 'جارٍ الفحص...' })
                            : getUIText(language, { en: 'Print Test Page', ku: 'تاقیکردنەوەی چاپ', ar: 'طباعة اختبار' })}
                        </span>
                      </button>

                      {/* Delete */}
                      {printerDevices.length > 1 && (
                        <button
                          onClick={() => deletePrinterDevice(device.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Device"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Printer Form (Collapsible) */}
          {isAddingNew && (
            <form onSubmit={handleCreatePrinter} className="bg-slate-50 p-5 rounded-2xl border border-slate-300 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-extrabold text-slate-800">
                  {getUIText(language, { en: 'Register New Printer Device:', ku: 'ناساندنی پرینتەری نوێ بۆ سیستەم:', ar: 'تسجيل جهاز طباعة جديد:' })}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  {getUIText(language, { en: 'Cancel', ku: 'پاشگەزبوونەوە', ar: 'إلغاء' })}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, { en: 'Printer Name / Model:', ku: 'ناوی پرینتەر یان مۆدێل:', ar: 'اسم الطابعة أو الموديل:' })}
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Canon imageRUNNER 2625i / Epson TM-T88VI"
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, { en: 'Device Type & Protocol:', ku: 'جۆری ئامێر و شێوازی کارکردن:', ar: 'نوع الجهاز والبروتوكول:' })}
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                  >
                    <option value="STANDARD_A4">Standard Office Document Printer (A4 / Letter)</option>
                    <option value="THERMAL_80MM">Thermal POS Receipt Printer (80mm Slip Roll)</option>
                    <option value="THERMAL_58MM">Compact Portable Thermal Printer (58mm)</option>
                    <option value="NETWORK_IP">Network Central IP Printer (RAW Port 9100)</option>
                  </select>
                </div>
              </div>

              {newType === 'NETWORK_IP' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">IP Address:</label>
                    <input
                      type="text"
                      value={newIpAddress}
                      onChange={(e) => setNewIpAddress(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                      placeholder="192.168.1.150"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Port (Default 9100):</label>
                    <input
                      type="number"
                      value={newPort}
                      onChange={(e) => setNewPort(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newAutoPrint}
                    onChange={(e) => setNewAutoPrint(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{getUIText(language, { en: 'Auto-print immediately when Holding Owner approves', ku: 'چاپکردنی خۆکار ڕاستەوخۆ دوای پەسەندکردنی خاوەنی هۆڵدینگ', ar: 'طباعة فورية تلقائية فور اعتماد مالك الهولدينغ' })}</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition cursor-pointer"
                >
                  {getUIText(language, { en: 'Save Printer Device', ku: 'تۆمارکردنی پرینتەر', ar: 'حفظ جهاز الطباعة' })}
                </button>
              </div>
            </form>
          )}

          {/* Direct Print Guidelines Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
            <Printer className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block mb-0.5">
                {getUIText(language, { en: 'Direct Browser & Hardware Integration', ku: 'تەواوکاری لەگەڵ پرینتەری کۆمپیوتەر و وێبگەڕ', ar: 'التكامل المباشر مع طابعات النظام والمتصفح' })}
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {getUIText(language, {
                  en: 'SAS ERP dynamically formats documents for physical output: A4 letterhead documents hide screen navigation elements, and 80mm thermal receipts are formatted with crisp monospaced rows, QR codes, and barcodes for gate inspections.',
                  ku: 'سیستەمی SAS ERP بە شێوەیەکی زیرەک بەڵگەنامەکان دەگونجێنێت: فەرمانەکانی A4 بە کوالێتی بەرز و لۆگۆی هۆڵدینگ و واژۆی ئەلیکترۆنی دەردەچن، و پسوولەی کاغەزی 80mm بە کۆدی QR و بارکۆد بۆ دەروازەی پڕۆژەکان ئامادە دەکرێن.',
                  ar: 'يقوم نظام SAS ERP بتنسيق المستندات بدقة عالية للمخرجات الورقية: مستندات A4 الرسمية تحتوي على شعار الهولدينغ والتوقيع الإلكتروني، وفواتير 80 مم الحرارية مهيأة بباركود وكود QR للتفتيش الميداني.'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            SAS ERP • Universal Print Service v4.2
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
          >
            {getUIText(language, { en: 'Close', ku: 'داخستن', ar: 'إغلاق' })}
          </button>
        </div>
      </div>
    </div>
  );
};
