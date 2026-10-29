import React, { useState } from 'react';
import {
  ScanLine,
  X,
  CheckCircle2,
  Boxes,
  Wallet,
  Building2,
  Truck,
  ShieldCheck,
  Sparkles,
  Camera,
  Upload,
  ArrowRight,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';

export const GateScannerModal: React.FC = () => {
  const {
    isGateScannerOpen,
    setIsGateScannerOpen,
    purchaseOrders,
    processGateScan,
    currentUser,
    setActiveTab,
  } = useERP();

  const { t, language } = useLanguage();

  const [selectedPoNumber, setSelectedPoNumber] = useState<string>('PO-SAS-2026-9821');
  const [customBarcode, setCustomBarcode] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('Mustafa Tariq');
  const [vehiclePlate, setVehiclePlate] = useState<string>('48122 Erbil Commercial');
  const [gateLocation, setGateLocation] = useState<string>('Main Security Gate #1 (South Inbound)');
  
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  if (!isGateScannerOpen) return null;

  const handleExecuteScan = async () => {
    setIsScanning(true);
    setScanResult(null);

    // Simulate laser reading and triple-sync trigger
    setTimeout(async () => {
      const targetBarcode = customBarcode.trim() || selectedPoNumber;
      const res = await processGateScan(targetBarcode, {
        driverName,
        vehiclePlate,
        gateName: gateLocation,
      });

      setIsScanning(false);
      setScanResult(res);
    }, 1200);
  };

  const handleAiReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiProcessing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch('/api/gemini/scan-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            invoiceText: file.name,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.data?.purchaseOrderRef) {
            setSelectedPoNumber(data.data.purchaseOrderRef);
          }
          if (data.data?.driverOrVehicle) {
            setVehiclePlate(data.data.driverOrVehicle);
          }
        }
      } catch (err) {
        console.error('OCR error', err);
      } finally {
        setIsAiProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsGateScannerOpen(false);
            setScanResult(null);
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          id="close-gate-scanner-modal-btn"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-xs">
            <ScanLine className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {t('gateScannerTitle')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('tripleNotificationNotice')}
            </p>
          </div>
        </div>

        {!scanResult ? (
          <div className="space-y-6">
            {/* Viewfinder Scanner Laser Animation */}
            <div className="relative bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center overflow-hidden min-h-[220px]">
              
              {/* Animated scanning laser */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_15px_#10b981] animate-bounce top-1/2 -translate-y-1/2 z-20" />
              )}

              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-xs">
                <Camera className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-900">
                {isScanning ? 'Reading Invoice Barcode & Syncing Systems...' : 'Align Purchase Bill Barcode or Select Active PO'}
              </p>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Security gate scanner instantly decodes PO numbers, sends real-time inward alerts, and updates ledgers.
              </p>

              {/* Upload Invoice Image with AI OCR */}
              <div className="mt-4 flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 shadow-xs transition">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isAiProcessing ? 'AI Analyzing...' : 'Upload Physical Bill (AI OCR)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAiReceiptUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Input Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Registered Purchase Order
                </label>
                <select
                  value={selectedPoNumber}
                  onChange={(e) => setSelectedPoNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                  id="gate-po-select"
                >
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.poNumber}>
                      {po.poNumber} — ${po.totalAmountUSD.toLocaleString()} ({po.supplierName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Or Enter Raw Barcode / Invoice Ref
                </label>
                <input
                  type="text"
                  placeholder="e.g. PO-SAS-2026-9821"
                  value={customBarcode}
                  onChange={(e) => setCustomBarcode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                  id="gate-barcode-custom-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Vehicle Plate / Commercial Truck #
                </label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Scan Trigger Action Button */}
            <div className="pt-2">
              <button
                onClick={handleExecuteScan}
                disabled={isScanning}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xs flex items-center justify-center gap-2 transition transform active:scale-98 disabled:opacity-50 cursor-pointer"
                id="execute-gate-scan-action-btn"
              >
                <ScanLine className="w-5 h-5 animate-pulse" />
                <span>{isScanning ? 'Verifying & Triggering Triple Automation...' : 'Execute Gate Scan & Sync All Departments'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Success Triple Sync Result View */
          <div className="space-y-6 animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3.5 text-emerald-800">
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-emerald-950">
                  Gate Inward Verified & Triple Automation Triggered!
                </h3>
                <p className="text-xs text-emerald-700">
                  Barcode {scanResult.po?.poNumber} processed. Warehouse, Finance, and Project Management are synchronized.
                </p>
              </div>
            </div>

            {/* Visual Multi-Department Synchronized Workflow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Department 1: Warehouse */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                  <Boxes className="w-4 h-4" />
                  <span>1. {t('warehouseNotified')}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Stock received in system. Inward bin location allocated: <strong>Zone A / Rack 04</strong>.
                </p>
                <span className="text-[10px] inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  Inventory Stock +{scanResult.po?.items?.length || 1} Categories
                </span>
              </div>

              {/* Department 2: Finance */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <Wallet className="w-4 h-4" />
                  <span>2. {t('financeAutoPosted')}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Automated Journal voucher posted for <strong>${scanResult.po?.totalAmountUSD?.toLocaleString()} USD</strong> against Accounts Payable.
                </p>
                <span className="text-[10px] inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 font-mono">
                  {scanResult.po?.financeEntry?.voucherNo || 'VCH-AUTO-POSTED'}
                </span>
              </div>

              {/* Department 3: Management */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>3. {t('managerAlerted')}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Alert dispatched to <strong>{scanResult.po?.requestedBy}</strong> and Company GM.
                </p>
                <span className="text-[10px] inline-block px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                  Triple Sync Confirmed
                </span>
              </div>
            </div>

            {/* Action buttons after scan */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsGateScannerOpen(false);
                  setActiveTab('finance');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
              >
                Inspect Finance Journal Entry
              </button>
              <button
                onClick={() => {
                  setIsGateScannerOpen(false);
                  setActiveTab('warehouse');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
              >
                View Updated Warehouse Stock
              </button>
              <button
                onClick={() => {
                  setScanResult(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
              >
                Scan Another Delivery
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
