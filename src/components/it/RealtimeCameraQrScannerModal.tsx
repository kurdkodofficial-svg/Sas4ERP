import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  X,
  Scan,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  ZapOff,
  SwitchCamera,
  Upload,
  ArrowRightLeft,
  UserCheck,
  Building2,
  Calendar,
  Phone,
  HardDrive,
  Sparkles,
  ShieldCheck,
  Check,
  RefreshCw,
  LogOut,
  LogIn
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  HardwareAssetRecord,
  HardwareCheckoutLog
} from '../../types/itAssetTracking';

interface RealtimeCameraQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteOptions: Array<{ id: string; code: string; nameEn: string; nameKu: string }>;
  onAssetUpdated: () => void;
  onNotify: (notice: { ku: string; en: string }) => void;
}

export const RealtimeCameraQrScannerModal: React.FC<RealtimeCameraQrScannerModalProps> = ({
  isOpen,
  onClose,
  siteOptions,
  onAssetUpdated,
  onNotify
}) => {
  const { language } = useLanguage();

  // Camera & Stream State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);

  // Scan & Detection State
  const [isProcessingDetection, setIsProcessingDetection] = useState<boolean>(false);
  const [detectedRawPayload, setDetectedRawPayload] = useState<string | null>(null);
  const [scannedAsset, setScannedAsset] = useState<HardwareAssetRecord | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [lastScanTimestamp, setLastScanTimestamp] = useState<number>(0);

  // Checkout Form State
  const [checkedOutTo, setCheckedOutTo] = useState<string>('Alan Soran (Lead Network Engineer)');
  const [technicianPhone, setTechnicianPhone] = useState<string>('+964 750 119 4432');
  const [destinationSiteId, setDestinationSiteId] = useState<string>('proj-4');
  const [checkoutPurpose, setCheckoutPurpose] = useState<HardwareCheckoutLog['purpose']>('FIELD_MAINTENANCE');
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState<boolean>(false);

  // Play audio beep on QR detection
  const playBeep = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 high note
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch {
      // Audio context might be restricted before interaction; safe to ignore
    }
  }, []);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Verify and match asset from inventory database
  const handleVerifyPayload = useCallback(async (payloadString: string) => {
    setDetectedRawPayload(payloadString);
    setIsProcessingDetection(true);
    setVerificationError(null);

    try {
      const res = await fetch('/api/it-assets/scan-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrPayloadString: payloadString
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error('Non-JSON response from server');
      }

      const data = await res.json();
      if (data.success && data.asset) {
        playBeep();
        setScannedAsset(data.asset);
        // Pre-fill destination site with asset's assigned site
        if (data.asset.assignedSiteId) {
          setDestinationSiteId(data.asset.assignedSiteId);
        }
        if (data.asset.assignedTechnician) {
          setCheckedOutTo(data.asset.assignedTechnician);
        }
        if (data.asset.technicianPhone) {
          setTechnicianPhone(data.asset.technicianPhone);
        }
      } else {
        setVerificationError(
          language === 'ku'
            ? data.messageKu || 'کۆدی سکانکراو لە بنکەی داتای ئامێرەکاندا نەدۆزرایەوە.'
            : data.messageEn || 'Scanned QR code could not be verified in the hardware inventory database.'
        );
      }
    } catch (err: any) {
      console.error('Scan verify error:', err);
      setVerificationError(
        language === 'ku'
          ? 'هەڵە لە پەیوەندی بە سێرڤەر بۆ پشتڕاستکردنەوەی ئامێرەکە.'
          : 'Failed to verify scanned QR code with the inventory server.'
      );
    } finally {
      setIsProcessingDetection(false);
    }
  }, [language, playBeep]);

  // Frame processing loop with jsQR & BarcodeDetector
  const processFrame = useCallback(() => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Set canvas dimensions to match video stream
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Throttle decoding to prevent frame locking
    const now = Date.now();
    if (!scannedAsset && !isProcessingDetection && now - lastScanTimestamp > 250) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data && code.data.trim()) {
        setLastScanTimestamp(now);
        handleVerifyPayload(code.data);
      }
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [handleVerifyPayload, isProcessingDetection, lastScanTimestamp, scannedAsset]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setVerificationError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        language === 'ku'
          ? 'کامێرای ئامێر لەم وێبگەڕەدا پشتگیری نەکراوە.'
          : 'Camera device is not supported on this browser or platform.'
      );
      return;
    }

    try {
      stopCamera();

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }

      // Enumerate camera devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setAvailableCameras(videoDevices);
    } catch (err: any) {
      console.warn('Camera initialization issue:', err);
      setCameraError(
        language === 'ku'
          ? 'نەتوانرا پەیوەندی بە کامێرای ئامێرەوە بکرێت. تکایە ڕێگەپێدانی کامێرا بدە یان وێنەی کۆدی QR باربکە.'
          : 'Could not access the camera. Please allow camera permissions or upload a QR image below.'
      );
      setIsCameraActive(false);
    }
  }, [cameraFacingMode, language, processFrame, stopCamera]);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && (track.getCapabilities as any)?.()?.torch) {
      try {
        const next = !torchEnabled;
        await (track as any).applyConstraints({
          advanced: [{ torch: next }]
        });
        setTorchEnabled(next);
      } catch (err) {
        console.warn('Torch not supported', err);
      }
    }
  };

  // Toggle front/back camera
  const toggleFacingMode = () => {
    setCameraFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle uploaded QR image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleVerifyPayload(code.data);
        } else {
          setVerificationError(
            language === 'ku'
              ? 'هیچ کۆدێکی QR لە وێنە بارکراوەکەدا نەدۆزرایەوە.'
              : 'No valid QR code could be found in the uploaded image.'
          );
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // One-click quick tester for sample assets
  const handleQuickSampleScan = (assetTag: string) => {
    handleVerifyPayload(assetTag);
  };

  // Submit Check-Out to Backend
  const handleExecuteCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedAsset) return;

    const chosenSite = siteOptions.find(s => s.id === destinationSiteId) || siteOptions[0];

    setIsSubmittingCheckout(true);
    try {
      const res = await fetch(`/api/it-assets/${scannedAsset.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkedOutTo,
          technicianPhone,
          destinationSiteId: chosenSite.id,
          destinationSiteName: chosenSite.nameEn,
          purpose: checkoutPurpose,
          expectedReturnDate,
          authorizedBy: 'SAS IT Infrastructure Lead',
          notes: checkoutNotes.trim() || 'Checked out via Real-Time Camera QR Scanner'
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error('Checkout service returned unexpected response');
      }

      const data = await res.json();
      if (data.success && data.asset) {
        onNotify({
          ku: data.messageKu || `ئامێری [${scannedAsset.assetTag}] بە سەرکەوتوویی دەرکرا بۆ (${checkedOutTo}).`,
          en: data.messageEn || `Asset [${scannedAsset.assetTag}] successfully checked out to (${checkedOutTo}).`
        });
        onAssetUpdated();
        onClose();
      } else {
        throw new Error(data.message || 'Checkout failed');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(language === 'ku' ? `هەڵە لە دەرکردنی ئامێر: ${err.message}` : `Error checking out asset: ${err.message}`);
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  // Submit Check-In (Return to Inventory) to Backend
  const handleExecuteCheckin = async () => {
    if (!scannedAsset) return;

    setIsSubmittingCheckout(true);
    try {
      const res = await fetch(`/api/it-assets/${scannedAsset.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receivedBy: 'SAS IT Asset Controller',
          notes: 'Returned to warehouse inventory via Real-Time Camera QR Scanner'
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error('Checkin service returned unexpected response');
      }

      const data = await res.json();
      if (data.success && data.asset) {
        onNotify({
          ku: data.messageKu || `ئامێری [${scannedAsset.assetTag}] گەڕێندرایەوە ناو کۆگا.`,
          en: data.messageEn || `Asset [${scannedAsset.assetTag}] returned to inventory.`
        });
        onAssetUpdated();
        onClose();
      } else {
        throw new Error(data.message || 'Checkin failed');
      }
    } catch (err: any) {
      console.error('Checkin error:', err);
      alert(language === 'ku' ? `هەڵە لە گەڕاندنەوەی ئامێر: ${err.message}` : `Error checking in asset: ${err.message}`);
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  // Reset scan state to scan next asset
  const handleScanAnother = () => {
    setScannedAsset(null);
    setDetectedRawPayload(null);
    setVerificationError(null);
  };

  // Start camera on modal open, stop on close
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedAsset(null);
      setDetectedRawPayload(null);
      setVerificationError(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  const isAlreadyCheckedOut = scannedAsset?.status === 'CHECKED_OUT';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir={language === 'en' ? 'ltr' : 'rtl'}
      >
        {/* Header Bar */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">
                  {language === 'ku'
                    ? 'پشکنەری کامێرای ڕاستەوخۆ و دەرکردنی ئامێر'
                    : language === 'ar'
                    ? 'الماسح الضوئي المباشر بالكاميرا لصرف الأجهزة'
                    : 'Real-Time QR Camera Scanner & Check-Out'}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {language === 'ku'
                  ? 'کامێرای مۆبایل یان لاپتۆپەکەت بگرە لەسەر بارکۆدی QR بۆ ناسینەوەی ڕاستەوخۆ و تۆمارکردنی دەرکردن'
                  : language === 'ar'
                  ? 'وجه كاميرا الجهاز نحو رمز QR للتعرف الفوري على الجهاز وإتمام عملية الصرف'
                  : 'Point device camera at hardware QR code to identify and check out from inventory database.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Main Body (2-Column Grid on desktop) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left / Top Column: Camera Viewfinder (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3.5">
            {/* Camera Viewport Container */}
            <div className="relative aspect-video sm:aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-inner flex items-center justify-center">
              {/* Video Element */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isCameraActive && !scannedAsset ? 'opacity-100' : 'opacity-40'
                }`}
              />

              {/* Hidden Offscreen Canvas for jsQR decoding */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Animated Laser Scanning Line & Reticle Overlay */}
              {isCameraActive && !scannedAsset && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Outer Targeting Corners */}
                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-transparent">
                    {/* Top-Left Corner */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-xl" />
                    {/* Top-Right Corner */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-xl" />
                    {/* Bottom-Left Corner */}
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-xl" />
                    {/* Bottom-Right Corner */}
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-xl" />

                    {/* Sweeping Laser Line */}
                    <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce" />

                    <div className="absolute inset-x-0 bottom-3 text-center">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-300 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        ALIGN QR CODE IN FRAME
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Identified Success Overlay Freeze */}
              {scannedAsset && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-3 animate-in fade-in zoom-in-95">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      ASSET VERIFIED IN DATABASE
                    </span>
                    <h4 className="font-black text-lg text-white mt-0.5">
                      {scannedAsset.assetTag}
                    </h4>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto truncate">
                      {scannedAsset.model}
                    </p>
                  </div>
                  <button
                    onClick={handleScanAnother}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{language === 'ku' ? 'سکانکردنی ئامێرێکی تر' : 'Scan Next Asset'}</span>
                  </button>
                </div>
              )}

              {/* Camera Error or No Camera Fallback Overlay */}
              {cameraError && !scannedAsset && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-rose-200">
                      {language === 'ku' ? 'کێشەی دەستگەیشتن بە کامێرا' : 'Camera Unavailable'}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                      {cameraError}
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'ku' ? 'دووبارە هەوڵبدەرەوە' : 'Retry Camera'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Camera Controls & File Upload Strip */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Switch Front/Rear Camera"
                >
                  <SwitchCamera className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {cameraFacingMode === 'environment' ? 'Rear Cam' : 'Front Cam'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`p-1.5 rounded-xl font-bold transition cursor-pointer ${
                    torchEnabled
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Toggle Torch / Flashlight"
                >
                  {torchEnabled ? <Zap className="w-4 h-4 text-amber-600" /> : <ZapOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Upload QR Image Fallback */}
              <label className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold flex items-center gap-1.5 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>{language === 'ku' ? 'بارکردنی وێنەی QR' : 'Upload QR Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Demo Sample Assets (Instant Testing) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === 'ku' ? 'تاقیکردنەوەی خێرا (ئامێرە تۆمارکراوەکانی کۆگا):' : 'Quick Test (Sample Registered Hardware QRs):'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickSampleScan('SAS-HW-SRV-101')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 border border-slate-200 text-[11px] font-mono font-bold transition cursor-pointer shadow-2xs"
                >
                  Dell Server (SAS-HW-SRV-101)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSampleScan('SAS-HW-SCAN-301')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 border border-slate-200 text-[11px] font-mono font-bold transition cursor-pointer shadow-2xs"
                >
                  Zakho Scanner (SAS-HW-SCAN-301)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSampleScan('SAS-HW-RTR-401')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 border border-slate-200 text-[11px] font-mono font-bold transition cursor-pointer shadow-2xs"
                >
                  Teltonika Gateway (SAS-HW-RTR-401)
                </button>
              </div>
            </div>

            {verificationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{verificationError}</span>
              </div>
            )}
          </div>

          {/* Right / Bottom Column: Identified Asset Specs & Check-Out Form (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {!scannedAsset ? (
              <div className="h-full min-h-[300px] rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center bg-slate-50/60 text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
                  <Scan className="w-7 h-7 text-indigo-500 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-700">
                    {language === 'ku' ? 'چاوەڕوانی سکانکردنی ئامێرە' : 'Waiting for Hardware QR Scan'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                    {language === 'ku'
                      ? 'کاتێک کامێراکە کۆدی QR دەخوێنێتەوە، زانیاری تەواوی ئامێرەکە و فۆڕمی دەرکردن (Check-Out) لێرەدا دەردەکەوێت.'
                      : 'Once a QR code is detected by the camera, full asset specifications and the check-out workflow will appear here.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                {/* Identified Hardware Unit Header Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 border border-indigo-200/90 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white">
                        {scannedAsset.assetTag}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                        {scannedAsset.deviceType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAlreadyCheckedOut
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isAlreadyCheckedOut
                        ? (language === 'ku' ? 'دەرکراوە (Checked Out)' : 'Checked Out')
                        : (language === 'ku' ? 'لە کۆگادایە (In Inventory)' : 'Available in Inventory')}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-sm leading-tight">
                      {scannedAsset.model}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                      SN: {scannedAsset.serialNumber} • IP: {scannedAsset.ipAddress}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 text-indigo-700 font-semibold truncate max-w-[200px]">
                      <Building2 className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span>{language === 'ku' ? scannedAsset.assignedSiteNameKu : scannedAsset.assignedSiteNameEn}</span>
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {scannedAsset.locationRoom}
                    </span>
                  </div>
                </div>

                {/* If Asset is ALREADY CHECKED OUT -> Show Return (Check-In) workflow */}
                {isAlreadyCheckedOut ? (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <LogOut className="w-4 h-4 text-amber-700" />
                      <span>
                        {language === 'ku'
                          ? 'ئەم ئامێرە ئێستا لە دەرەوەی کۆگایە:'
                          : 'Current Check-Out Record:'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-amber-200/60">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Checked Out To:</span>
                        <strong className="text-slate-900">{scannedAsset.currentCheckout?.checkedOutTo}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Destination Site:</span>
                        <span className="text-indigo-700 font-semibold">{scannedAsset.currentCheckout?.destinationSiteName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Purpose:</span>
                        <span className="font-medium text-slate-800">{scannedAsset.currentCheckout?.purpose}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Expected Return:</span>
                        <span className="font-mono font-bold text-amber-800">{scannedAsset.currentCheckout?.expectedReturnDate}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleExecuteCheckin}
                      disabled={isSubmittingCheckout}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
                    >
                      {isSubmittingCheckout ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <LogIn className="w-4 h-4" />
                      )}
                      <span>
                        {language === 'ku'
                          ? 'گەڕاندنەوە بۆ ناو کۆگای ئایتی (Check-In to Inventory)'
                          : 'Check-In (Return to Inventory)'}
                      </span>
                    </button>
                  </div>
                ) : (
                  /* If Asset is AVAILABLE -> Show Check-Out Form */
                  <form onSubmit={handleExecuteCheckout} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        {language === 'ku' ? 'ئەندازیار یان تەکنیکاری وەرگر (Checked Out To):' : 'Checked Out To (Technician/Engineer):'}
                      </label>
                      <input
                        type="text"
                        value={checkedOutTo}
                        onChange={(e) => setCheckedOutTo(e.target.value)}
                        placeholder="e.g. Alan Soran (Network Ops Lead)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          {language === 'ku' ? 'ژمارەی مۆبایل:' : 'Contact Phone:'}
                        </label>
                        <input
                          type="text"
                          value={technicianPhone}
                          onChange={(e) => setTechnicianPhone(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          {language === 'ku' ? 'بەرواری گەڕاندنەوە:' : 'Return Date:'}
                        </label>
                        <input
                          type="date"
                          value={expectedReturnDate}
                          onChange={(e) => setExpectedReturnDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        {language === 'ku' ? 'پڕۆژەی مەبەست (Destination Site):' : 'Destination Project Site:'}
                      </label>
                      <select
                        value={destinationSiteId}
                        onChange={(e) => setDestinationSiteId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
                      >
                        {siteOptions.map(s => (
                          <option key={s.id} value={s.id}>
                            {language === 'ku' ? s.nameKu : s.nameEn} ({s.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        {language === 'ku' ? 'مەبەستی دەرکردن (Checkout Purpose):' : 'Checkout Purpose:'}
                      </label>
                      <select
                        value={checkoutPurpose}
                        onChange={(e) => setCheckoutPurpose(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800"
                      >
                        <option value="FIELD_MAINTENANCE">Field Maintenance & Site Repair</option>
                        <option value="CLIENT_SITE_DEPLOYMENT">Remote Client Site Deployment</option>
                        <option value="EMERGENCY_SPARE_SWAP">Emergency Spare Hardware Swap</option>
                        <option value="SYSTEMS_UPGRADE">Hardware Firmware / Infrastructure Upgrade</option>
                        <option value="TEMPORARY_TESTING">Temporary Laboratory / Testing Validation</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        {language === 'ku' ? 'تێبینی و ڕێنمایی مەیدانی:' : 'Mission Notes:'}
                      </label>
                      <input
                        type="text"
                        value={checkoutNotes}
                        onChange={(e) => setCheckoutNotes(e.target.value)}
                        placeholder="e.g. Approved by Holding IT Director for border failover test"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingCheckout}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-50 mt-2"
                    >
                      {isSubmittingCheckout ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      <span>
                        {language === 'ku'
                          ? 'تۆمارکردنی دەرکردنی ئامێر لە داتابەیس (Execute Check-Out)'
                          : 'Execute Asset Check-Out'}
                      </span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ECDSA Cryptographic QR Verification Active</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            {language === 'ku' ? 'داخستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
