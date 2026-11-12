import React, { useState, useEffect, useRef } from 'react';
import {
  ScanLine,
  X,
  CheckCircle2,
  Boxes,
  Wallet,
  Building2,
  Truck,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Camera,
  Upload,
  ArrowRight,
  AlertCircle,
  FileText,
  XCircle,
  Lock,
  Volume2,
  Barcode,
  Layers,
  ChevronRight,
  Clock,
  RotateCcw
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { PurchaseOrder } from '../types/erp';

export const GateScannerModal: React.FC = () => {
  const {
    isGateScannerOpen,
    setIsGateScannerOpen,
    purchaseOrders,
    processGateScan,
    isPoFullyApproved,
    canPoEnterProject,
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

  // Real Camera Scanner State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play audio scanner feedback
  const playScannerSound = (isSuccess: boolean = true) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (isSuccess) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, ctx.currentTime); // 1760Hz crisp supermarket beep
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
        osc.start();
        osc.stop(ctx.currentTime + 0.14);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime); // Low warning buzz
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (_) {}
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera stream could not be started:', err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isGateScannerOpen) return null;

  const handleExecuteScan = async (barcodeToScan?: string) => {
    setIsScanning(true);
    setScanResult(null);

    const targetBarcode = barcodeToScan || customBarcode.trim() || selectedPoNumber;

    setTimeout(async () => {
      const res = await processGateScan(targetBarcode, {
        driverName,
        vehiclePlate,
        gateName: gateLocation,
      });

      setIsScanning(false);
      setScanResult(res);
      playScannerSound(res.success);

      if (isCameraActive) {
        stopCamera();
      }
    }, 900);
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
            setCustomBarcode(data.data.purchaseOrderRef);
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
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden my-6">
        
        {/* Close Button */}
        <button
          onClick={() => {
            stopCamera();
            setIsGateScannerOpen(false);
            setScanResult(null);
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer z-10"
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
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                {language === 'ku' ? 'سکانی بارکۆدی پسوولەی دەروازە و پڕۆژە' : 'Inward Purchase Receipt Barcode Scanner'}
              </h2>
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>3-WAY AUTO SYNC</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ku'
                ? 'لەگەڵ سکانکردنی بارکۆدی پسوولە: ڕێژەی کۆگا نوێ دەبێتەوە، ئاگاداری ڕاستەوخۆ دەچێت بۆ (کۆگا، دارایی، بەڕێوەبەری پڕۆژە)، و قەواڵەی دارایی خۆکارانە تۆمار دەکرێت.'
                : 'Instantly updates inventory levels, triggers real-time alerts to Warehouse, Finance, and Project/Company Manager, and records corresponding ledger voucher.'}
            </p>
          </div>
        </div>

        {!scanResult ? (
          <div className="space-y-6">
            
            {/* Viewfinder Scanner Laser Animation & Camera Container */}
            <div className="relative bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 flex flex-col items-center justify-center text-center overflow-hidden min-h-[240px] text-white shadow-inner">
              
              {/* Live Camera Stream if active */}
              {isCameraActive ? (
                <div className="relative w-full h-[220px] max-w-md mx-auto rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Targeting crosshairs */}
                  <div className="absolute inset-8 border-2 border-emerald-400 rounded-xl pointer-events-none opacity-80" />
                  <div className="absolute top-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded text-emerald-400 font-mono">
                    LIVE CAMERA FEED
                  </div>
                </div>
              ) : (
                <div className="py-4 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
                    <ScanLine className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-white">
                      {isScanning ? 'Optical Laser Scanning Barcode & Synchronizing Systems...' : 'Align Purchase Bill Barcode to Scanner'}
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mt-1">
                      {language === 'ku'
                        ? 'بارکۆدی سەر فەرمانی کڕین یان پسوولەی دەروازە بخەرە بەردەم سکانەر بۆ جێبەجێکردنی هاوکات لە کۆگا و دارایی و پڕۆژە.'
                        : 'Aim camera at physical barcode receipt or select any active purchase order below to simulate gate scan.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Animated scanning laser line */}
              <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-bounce top-1/2 -translate-y-1/2 z-20 pointer-events-none" />

              {/* Camera & OCR controls */}
              <div className="mt-3 flex items-center gap-2.5 z-10 flex-wrap justify-center">
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 transition cursor-pointer backdrop-blur-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'ku' ? 'کردنەوەی کامێرای مۆبایل/کۆمپیوتەر' : 'Open Live Camera'}</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-xs font-bold text-white transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{language === 'ku' ? 'داخستنی کامێرا' : 'Close Camera'}</span>
                  </button>
                )}

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 transition backdrop-blur-xs">
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isAiProcessing ? 'AI Analyzing...' : (language === 'ku' ? 'بارکردنی وێنەی پسوولە (AI OCR)' : 'Upload Invoice Photo')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAiReceiptUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Quick Barcode Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ku' ? 'کۆدی بارکۆد یان ژمارەی PO بنووسە:' : 'Barcode Code or PO Number:'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. PO-SAS-2026-9821"
                    value={customBarcode || selectedPoNumber}
                    onChange={(e) => {
                      setCustomBarcode(e.target.value);
                      setSelectedPoNumber(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleExecuteScan();
                      }
                    }}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500 pl-8"
                    id="gate-barcode-custom-input"
                  />
                  <ScanLine className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ku' ? 'ناوی شۆفێر:' : 'Driver Name:'}
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ku' ? 'تابلۆی ئۆتۆمبێل:' : 'Vehicle Plate:'}
                </label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Scannable Purchase Orders with Visual Barcodes */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Barcode className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ku' ? 'پسوولەکانی کڕین بە بارکۆدی ڕاستەقینە (کلیک بکە بۆ سکانی دەستبەجێ):' : 'Active Inward Receipts with Barcodes (Click to Test Scan):'}</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {purchaseOrders.length} {language === 'ku' ? 'پسوولە تۆمارکراوە' : 'registered orders'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-56 overflow-y-auto p-1">
                {purchaseOrders.map((po) => {
                  const entryPerm = canPoEnterProject(po);
                  const isCleared = entryPerm.allowed;

                  return (
                    <div
                      key={po.id}
                      className={`p-3.5 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                        isCleared
                          ? 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-sm'
                          : 'bg-rose-50/50 border-rose-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono font-black text-xs text-slate-900">{po.poNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCleared ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {isCleared ? (language === 'ku' ? 'ڕێگەپێدراو' : 'Cleared') : (language === 'ku' ? 'ڕاگیراو' : 'Locked')}
                          </span>
                        </div>

                        {/* Visual SVG Barcode Rendering */}
                        <div className="bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200/80 my-1 flex flex-col items-center">
                          <svg className="w-full h-8" viewBox="0 0 160 35" preserveAspectRatio="none">
                            {[
                              2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 1, 3, 2, 2, 1, 3, 1, 4, 2, 1, 3, 1, 2, 1, 3, 2, 1, 2
                            ].map((w, i) => (
                              <rect
                                key={i}
                                x={i * 3.8}
                                y={0}
                                width={w * 0.9}
                                height={35}
                                fill="#0f172a"
                              />
                            ))}
                          </svg>
                          <span className="font-mono text-[9px] text-slate-500 tracking-widest mt-0.5">*{po.poNumber}*</span>
                        </div>

                        <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                          <div className="flex justify-between font-semibold">
                            <span className="truncate max-w-[120px]">{po.supplierName}</span>
                            <span className="font-mono font-extrabold text-slate-900">${po.totalAmountUSD.toLocaleString()}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">
                            {po.items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ')}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedPoNumber(po.poNumber);
                          setCustomBarcode(po.poNumber);
                          handleExecuteScan(po.poNumber);
                        }}
                        disabled={isScanning}
                        className={`mt-2.5 w-full py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs ${
                          isCleared
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                      >
                        <ScanLine className="w-3.5 h-3.5" />
                        <span>{language === 'ku' ? '⚡ سکانکردنی ئەم بارکۆدە' : '⚡ Scan This Barcode'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scan Trigger Action Button */}
            <div className="pt-2">
              <button
                onClick={() => handleExecuteScan()}
                disabled={isScanning}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition transform active:scale-98 disabled:opacity-50 cursor-pointer"
                id="execute-gate-scan-action-btn"
              >
                <ScanLine className="w-5 h-5 animate-pulse" />
                <span>
                  {isScanning
                    ? (language === 'ku' ? 'سکانکردن و ئەنجامدانی ئۆتۆمەیشن لە هەموو بەشەکان...' : 'Verifying Barcode & Executing 3-Way Automation...')
                    : (language === 'ku' ? 'جێبەجێکردنی سکانی بارکۆد و هاوکاتکردنی کۆگا و دارایی و پڕۆژە' : 'Execute Barcode Scan & Sync Inventory, Finance, and Project')}
                </span>
              </button>
            </div>
          </div>
        ) : !scanResult.success ? (
          /* BLOCKED / REFUSED GATE RESULT VIEW */
          <div className="space-y-6 animate-in zoom-in-95 duration-200">
            <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 text-rose-950 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 shrink-0">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-rose-900">
                    {language === 'ku' ? '⛔ ڕێگری لە چوونەژوورەوەی بارهەڵگر (Gate Pass Refused)' : '⛔ Gate Entry Refused: Executive Authorization Incomplete'}
                  </h3>
                  <p className="text-xs text-rose-700 mt-0.5">
                    {scanResult.message}
                  </p>
                </div>
              </div>

              {scanResult.po && scanResult.po.workflowState && (
                <div className="bg-white p-3.5 rounded-2xl border border-rose-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">
                    {language === 'ku' ? 'هێڵی پەسەندکردنی ئەم داواکارییە هێشتا تەواو نەبووە (مەرجی خاوەنی هۆڵدینگ):' : 'Required Signatures Missing in Pipeline (Holding Owner Gate):'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {scanResult.po.workflowState.steps.map((st: any) => {
                      const done = st.status === 'APPROVED';
                      return (
                        <div key={st.stepNumber} className={`p-2 rounded-xl border text-[11px] ${done ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                          <div className="flex items-center justify-between font-bold">
                            <span>{language === 'ku' ? st.titleKu : st.titleEn}</span>
                            <span>{done ? '✓' : '⏳'}</span>
                          </div>
                          <span className="text-[10px] block opacity-75">{done ? 'Approved' : 'Pending Signature'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsGateScannerOpen(false);
                  setActiveTab('procurement');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
              >
                {language === 'ku' ? 'پێداچوونەوە لە بەشی کڕین' : 'Review in Procurement'}
              </button>
              <button
                onClick={() => setScanResult(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer shadow-xs"
              >
                {language === 'ku' ? 'دووبارە تاقیکردنەوە' : 'Scan Another Delivery'}
              </button>
            </div>
          </div>
        ) : (
          /* SUCCESS TRIPLE-SYNC RESULT VIEW */
          <div className="space-y-6 animate-in zoom-in-95 duration-200">
            {/* Header Success Box */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 text-emerald-950 shadow-xs">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-emerald-950">
                      {language === 'ku' ? '🎉 پسوولە بە سەرکەوتوویی لە دەروازە سکان کرا!' : 'Gate Inward Verified & 3-Way Automation Completed!'}
                    </h3>
                    <p className="text-xs text-emerald-800 font-medium mt-0.5">
                      {language === 'ku'
                        ? `پسوولەی داواکاری (${scanResult.po?.poNumber}) وەرگیرا. کۆگا، دارایی و پڕۆژە ڕاستەوخۆ هاوکات کران.`
                        : `Receipt for ${scanResult.po?.poNumber} verified. Inventory, Finance, and Project Management synchronized.`}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs font-extrabold px-3 py-1 bg-white text-emerald-800 rounded-xl border border-emerald-300 shadow-2xs">
                  ${scanResult.po?.totalAmountUSD?.toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* The 3 Synchronized Core Operations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Warehouse Inventory Automatically Updated */}
              <div className="bg-blue-50/70 border-2 border-blue-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    <span>1. {language === 'ku' ? 'نوێکردنەوەی خۆکارانەی کۆگا' : '1. Inventory Levels Updated'}</span>
                  </div>
                  <p className="text-[11px] text-blue-950/80 mt-1 leading-relaxed">
                    {language === 'ku'
                      ? 'بڕی کەلوپەلەکان ڕاستەوخۆ بۆ بەردەست لە مەخزەن زیادکران بە شوێنی دیاریکراو.'
                      : 'Stock quantities directly incremented on central warehouse database.'}
                  </p>

                  {/* Items list */}
                  <div className="mt-2.5 space-y-1.5">
                    {scanResult.itemsUpdated && scanResult.itemsUpdated.length > 0 ? (
                      scanResult.itemsUpdated.map((it: any, idx: number) => (
                        <div key={idx} className="bg-white/90 p-2 rounded-xl border border-blue-200 text-xs flex items-center justify-between">
                          <span className="font-bold text-slate-800 truncate max-w-[130px]">{it.name}</span>
                          <span className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                            +{it.quantityAdded} {it.unit}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white/90 p-2 rounded-xl border border-blue-200 text-xs">
                        <span className="font-bold text-slate-800">{scanResult.po?.items?.length || 1} material items added to inventory stock</span>
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-100 text-blue-800 self-start">
                  ✅ Stock Levels Active
                </span>
              </div>

              {/* Card 2: Financial Transaction Automatically Initiated */}
              <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>2. {language === 'ku' ? 'تۆمارکردنی قەواڵەی دارایی' : '2. Finance Transaction Recorded'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-950/80 mt-1 leading-relaxed">
                    {language === 'ku'
                      ? 'قەواڵەی دارایی (Journal Voucher) بە شێوەی خۆکار لە دەفتەری دارایی تۆمار کرا.'
                      : 'Automatic Journal Voucher posted against Accounts Payable & Project Escrow.'}
                  </p>

                  <div className="mt-2.5 bg-white/90 p-2.5 rounded-xl border border-emerald-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Voucher Ref:</span>
                      <span className="font-mono font-black text-emerald-800 text-[11px]">
                        {scanResult.voucherNo || scanResult.po?.financeEntry?.voucherNo || 'VCH-AUTO-POSTED'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Amount Debit:</span>
                      <span className="font-mono font-bold text-slate-900">
                        ${scanResult.po?.totalAmountUSD?.toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 self-start">
                  ⚡ Auto Ledger Posted
                </span>
              </div>

              {/* Card 3: Real-Time Multi-Manager Alerts */}
              <div className="bg-purple-50/70 border-2 border-purple-200 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>3. {language === 'ku' ? 'ئاگاداری ڕاستەوخۆ بۆ بەڕێوەبەران' : '3. Real-Time Manager Alerts'}</span>
                  </div>
                  <p className="text-[11px] text-purple-950/80 mt-1 leading-relaxed">
                    {language === 'ku'
                      ? 'ئاگاداری هاوکات نێردرا بۆ بەرپرسی کۆگا، بەڕێوەبەری دارایی و بەڕێوەبەری پڕۆژە.'
                      : 'Live alerts pushed to Warehouse Officer, Finance Head, and PM/GM.'}
                  </p>

                  <div className="mt-2.5 space-y-1.5 text-xs">
                    <div className="bg-white/90 p-2 rounded-xl border border-purple-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">📦 Warehouse Officer</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Notified</span>
                    </div>
                    <div className="bg-white/90 p-2 rounded-xl border border-purple-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">💼 Finance Head</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Notified</span>
                    </div>
                    <div className="bg-white/90 p-2 rounded-xl border border-purple-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">🏢 Project / Company GM</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Notified</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-100 text-purple-800 self-start">
                  🔔 3-Way Alerts Dispatched
                </span>
              </div>
            </div>

            {/* Quick Navigation Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsGateScannerOpen(false);
                  setActiveTab('finance');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ku' ? 'پشکنینی قەواڵە لە دارایی' : 'Inspect Finance Journal'}</span>
              </button>
              <button
                onClick={() => {
                  setIsGateScannerOpen(false);
                  setActiveTab('warehouse');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Boxes className="w-3.5 h-3.5 text-blue-600" />
                <span>{language === 'ku' ? 'سەیرکردنی کۆگای نوێکراوە' : 'View Updated Warehouse Stock'}</span>
              </button>
              <button
                onClick={() => {
                  setScanResult(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'ku' ? 'سکانکردنی پسوولەیەکی تر' : 'Scan Another Delivery'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
