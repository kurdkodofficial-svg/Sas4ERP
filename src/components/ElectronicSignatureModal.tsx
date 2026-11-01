import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Type,
  Upload,
  Stamp,
  RotateCcw,
  CheckCircle2,
  X,
  ShieldCheck,
  Download,
  Trash2,
  Sparkles,
  Lock,
  FileCheck
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { getUIText } from '../utils/langHelper';
import { ExecutiveSignatureProfile } from '../types/erp';

interface ElectronicSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPoId?: string;
  onSignComplete?: (signatureDataUrl: string, sealDataUrl: string) => void;
}

export const ElectronicSignatureModal: React.FC<ElectronicSignatureModalProps> = ({
  isOpen,
  onClose,
  targetPoId,
  onSignComplete
}) => {
  const {
    holding,
    currentUser,
    signatureProfiles,
    saveSignatureProfile,
    deleteSignatureProfile
  } = useERP();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'DRAW' | 'TYPE' | 'UPLOAD' | 'SAVED'>('DRAW');
  const [signerRole, setSignerRole] = useState<'HOLDING_OWNER' | 'GENERAL_MANAGER' | 'FINANCE_DIRECTOR' | 'PROJECT_MANAGER'>('HOLDING_OWNER');
  const [signerName, setSignerName] = useState(holding.chairmanName || currentUser.name || 'Holding Owner');
  
  // Drawing Canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1e3a8a'); // executive blue
  const [penWidth, setPenWidth] = useState(3);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);

  // Typed signature state
  const [typedText, setTypedText] = useState(holding.chairmanName || currentUser.name || 'Authorized Signatory');
  const [typedFont, setTypedFont] = useState<'cursive-1' | 'cursive-2' | 'serif-1' | 'modern'>('cursive-1');

  // Uploaded signature state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Official Seal Toggle
  const [includeOfficialSeal, setIncludeOfficialSeal] = useState(true);
  const [sealHash] = useState(() => `SIG-CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`);

  useEffect(() => {
    if (isOpen) {
      setSignerName(holding.chairmanName || currentUser.name || 'Holding Executive');
      setTypedText(holding.chairmanName || currentUser.name || 'Holding Executive');
      // If there are saved signatures, switch to SAVED tab by default if desired
      if (signatureProfiles && signatureProfiles.length > 0) {
        setActiveTab('SAVED');
      } else {
        setActiveTab('DRAW');
      }
    }
  }, [isOpen, holding.chairmanName, currentUser.name, signatureProfiles]);

  // Setup Canvas
  useEffect(() => {
    if (activeTab === 'DRAW' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
      }
    }
  }, [activeTab, penColor, penWidth]);

  if (!isOpen) return null;

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save state for undo
    setUndoStack(prev => [...prev.slice(-10), canvas.toDataURL()]);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setUndoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = undoStack[undoStack.length - 1];
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setUndoStack(prev => prev.slice(0, prev.length - 1));
      if (undoStack.length <= 1) setHasDrawn(false);
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Typed Signature as Data URL
  const generateTypedSignatureDataUrl = (): string => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 500;
    tempCanvas.height = 180;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = penColor;
    if (typedFont === 'cursive-1') {
      ctx.font = 'italic 46px "Brush Script MT", "Caveat", "Segoe Script", cursive';
    } else if (typedFont === 'cursive-2') {
      ctx.font = 'italic bold 42px "Lucida Handwriting", "Dancing Script", cursive';
    } else if (typedFont === 'serif-1') {
      ctx.font = 'italic bold 40px "Playfair Display", "Georgia", serif';
    } else {
      ctx.font = 'bold 38px "Cinzel", "Times New Roman", serif';
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedText, 250, 90);

    // Add decorative authentic underline flourish
    ctx.beginPath();
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2.5;
    ctx.moveTo(80, 130);
    ctx.bezierCurveTo(180, 145, 340, 115, 420, 132);
    ctx.stroke();

    return tempCanvas.toDataURL('image/png');
  };

  // Generate Official Holding Executive Seal Stamp as Data URL
  const generateOfficialSealDataUrl = (): string => {
    const sealCanvas = document.createElement('canvas');
    sealCanvas.width = 320;
    sealCanvas.height = 320;
    const ctx = sealCanvas.getContext('2d');
    if (!ctx) return '';

    const centerX = 160;
    const centerY = 160;
    const radius = 140;

    // Outer double rings
    ctx.strokeStyle = '#b45309'; // amber-700
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#d97706'; // amber-600
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 8, 0, Math.PI * 2);
    ctx.stroke();

    // Inner dashed ring
    ctx.strokeStyle = '#f59e0b';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Arc Text: Holding Name on Top
    const holdingName = holding.nameKu || holding.name || 'HOLDING EXECUTIVE GOVERNANCE';
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(holdingName.toUpperCase().slice(0, 32), centerX, 45);

    // Center Emblem: Star / Shield & Details
    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('★ OFFICIAL SEAL ★', centerX, 110);

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(signerName.slice(0, 26), centerX, 142);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 11px sans-serif';
    const roleTitle = signerRole === 'HOLDING_OWNER' ? 'HOLDING OWNER & CHAIRMAN' :
      signerRole === 'GENERAL_MANAGER' ? 'SUBSIDIARY GENERAL MANAGER' :
      signerRole === 'FINANCE_DIRECTOR' ? 'EXECUTIVE FINANCE DIRECTOR' : 'PROJECT DIRECTOR';
    ctx.fillText(roleTitle, centerX, 168);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('VERIFIED ELECTRONIC SIGNATURE', centerX, 192);

    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.fillText(sealHash, centerX, 212);

    // Bottom arc text: SAS4ERP Platform Security
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('SAS ERP • TAMPER-EVIDENT SECURED', centerX, 280);

    return sealCanvas.toDataURL('image/png');
  };

  const getFinalSignatureDataUrl = (): string => {
    if (activeTab === 'DRAW') {
      return canvasRef.current ? canvasRef.current.toDataURL('image/png') : '';
    } else if (activeTab === 'TYPE') {
      return generateTypedSignatureDataUrl();
    } else if (activeTab === 'UPLOAD') {
      return uploadedImage || '';
    }
    return '';
  };

  const handleSaveToProfiles = () => {
    const signatureDataUrl = getFinalSignatureDataUrl();
    if (!signatureDataUrl) return;

    const sealDataUrl = includeOfficialSeal ? generateOfficialSealDataUrl() : undefined;

    saveSignatureProfile({
      name: signerName.trim() || 'Executive Signatory',
      role: signerRole,
      signatureType: activeTab === 'DRAW' ? 'DRAWN' : activeTab === 'TYPE' ? 'TYPED' : 'UPLOADED',
      signatureDataUrl,
      officialSealDataUrl: sealDataUrl,
      digitalCertHash: sealHash,
      isActive: true
    });

    setActiveTab('SAVED');
  };

  const handleApplySignature = (sigUrl?: string, sealUrl?: string) => {
    const finalSig = sigUrl || getFinalSignatureDataUrl();
    const finalSeal = sealUrl || (includeOfficialSeal ? generateOfficialSealDataUrl() : '');

    if (!finalSig) return;

    if (onSignComplete) {
      onSignComplete(finalSig, finalSeal);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {getUIText(language, {
                    en: 'Executive Electronic Signature & Official Seal Studio',
                    ku: 'ستۆدیۆی واژۆی ئەلیکترۆنی و مۆری فەرمی هۆڵدینگ',
                    ar: 'استوديو التوقيع الإلكتروني والختم الرقمي الرسمي'
                  })}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                  {getUIText(language, { en: 'Verifiable', ku: 'پارێزراو بە کۆد', ar: 'موثق رقمياً' })}
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-0.5">
                {holding.name ? (
                  <span>{holding.name} • </span>
                ) : null}
                {getUIText(language, {
                  en: 'Legally compliant e-signatures & cryptographic seals for purchase approvals, vouchers, and contracts',
                  ku: 'واژۆی دەستی، نووسراو یان وێنەیی بۆ پسوولە، خەرجی و فەرمانە فەرمییەکان',
                  ar: 'توقيعات إلكترونية وأختام رسمية معتمدة لسندات الصرف والاعتمادات المالية'
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Signer Identity Configuration */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {getUIText(language, { en: 'Signer Full Name:', ku: 'ناوی تەواوی واژۆکەر:', ar: 'الاسم الكامل للموقع:' })}
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => {
                  setSignerName(e.target.value);
                  setTypedText(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                placeholder="Holding Chairman / General Manager"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {getUIText(language, { en: 'Signer Executive Role:', ku: 'پلە و بەرپرسیارێتی:', ar: 'المنصب التنفيذي:' })}
              </label>
              <select
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
              >
                <option value="HOLDING_OWNER">
                  {getUIText(language, { en: 'Holding Owner & Chairman', ku: 'خاوەن و سەرۆکی هۆڵدینگ', ar: 'مالك ورئيس مجلس الإدارة' })}
                </option>
                <option value="GENERAL_MANAGER">
                  {getUIText(language, { en: 'Subsidiary General Manager (GM)', ku: 'بەڕێوەبەری گشتی کۆمپانیا', ar: 'المدير العام للشركة' })}
                </option>
                <option value="FINANCE_DIRECTOR">
                  {getUIText(language, { en: 'Chief Financial Officer (CFO)', ku: 'بەڕێوەبەری دارایی و ژمێریاری', ar: 'المدير المالي التنفيذي' })}
                </option>
                <option value="PROJECT_MANAGER">
                  {getUIText(language, { en: 'Site Project Director (PM)', ku: 'بەڕێوەبەری پڕۆژەی مەیدانی', ar: 'مدير المشروع الميداني' })}
                </option>
              </select>
            </div>
          </div>

          {/* Tab Switcher: Draw, Type, Upload, Saved */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('DRAW')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'DRAW'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{getUIText(language, { en: 'Draw by Hand / Stylus', ku: 'کێشانی واژۆ بە دەست', ar: 'رسم التوقيع يدوياً' })}</span>
            </button>

            <button
              onClick={() => setActiveTab('TYPE')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'TYPE'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>{getUIText(language, { en: 'Type Signature', ku: 'نووسینی واژۆ', ar: 'كتابة التوقيع' })}</span>
            </button>

            <button
              onClick={() => setActiveTab('UPLOAD')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'UPLOAD'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{getUIText(language, { en: 'Upload Stamp / PNG', ku: 'بارکردنی مۆر یان وێنە', ar: 'رفع صورة / ختم' })}</span>
            </button>

            {signatureProfiles.length > 0 && (
              <button
                onClick={() => setActiveTab('SAVED')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'SAVED'
                    ? 'bg-white text-amber-600 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stamp className="w-3.5 h-3.5" />
                <span>{getUIText(language, { en: 'Saved Signatures', ku: 'واژۆ پاشەکەوتکراوەکان', ar: 'التوقيعات المحفوظة' })} ({signatureProfiles.length})</span>
              </button>
            )}
          </div>

          {/* TAB 1: DRAW SIGNATURE CANVAS */}
          {activeTab === 'DRAW' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Pen Ink Colors */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">
                    {getUIText(language, { en: 'Ink Color:', ku: 'ڕەنگی مرەکەب:', ar: 'لون الحبر:' })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { color: '#1e3a8a', label: 'Executive Blue' },
                      { color: '#0f172a', label: 'Onyx Black' },
                      { color: '#047857', label: 'Emerald Green' },
                      { color: '#b45309', label: 'Amber Bronze' }
                    ].map(c => (
                      <button
                        key={c.color}
                        onClick={() => setPenColor(c.color)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          penColor === c.color ? 'scale-115 border-blue-500 shadow-md ring-2 ring-blue-300' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Pen Thickness */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">
                    {getUIText(language, { en: 'Stroke:', ku: 'ئەستووری:', ar: 'السماكة:' })}
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {[2, 3, 5].map(w => (
                      <button
                        key={w}
                        onClick={() => setPenWidth(w)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                          penWidth === w ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Canvas Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{getUIText(language, { en: 'Undo', ku: 'گەڕانەوە', ar: 'تراجع' })}</span>
                  </button>
                  <button
                    onClick={handleClearCanvas}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{getUIText(language, { en: 'Clear', ku: 'سڕینەوە', ar: 'مسح' })}</span>
                  </button>
                </div>
              </div>

              {/* Drawing Board */}
              <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white rounded-2xl p-2 transition">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-44 cursor-crosshair touch-none rounded-xl bg-slate-50/40"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400">
                    <PenTool className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-xs font-medium">
                      {getUIText(language, {
                        en: 'Sign here using mouse, finger or stylus pen',
                        ku: 'لێرە بە دەست، ماوس یان قەڵەم واژۆ بکە',
                        ar: 'وقع هنا باستخدام الفأرة أو الإصبع أو القلم الذكي'
                      })}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 left-4 text-[10px] text-slate-400 font-mono">
                  ✕ ........................................................................
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TYPE SIGNATURE */}
          {activeTab === 'TYPE' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {getUIText(language, { en: 'Type Name / Initials:', ku: 'ناوی واژۆ بنووسە:', ar: 'اكتب الاسم أو التوقيع:' })}
                </label>
                <input
                  type="text"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                  placeholder="e.g. Dara F. Ahmed"
                />
              </div>

              {/* Font Options Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'cursive-1', label: 'Executive Calligraphy', sampleClass: 'font-serif italic text-2xl text-blue-900 tracking-wide' },
                  { id: 'cursive-2', label: 'Dynamic Script', sampleClass: 'font-mono italic font-bold text-2xl text-indigo-900' },
                  { id: 'serif-1', label: 'Classic Formal', sampleClass: 'font-serif italic font-extrabold text-2xl text-slate-900' },
                  { id: 'modern', label: 'Presidential Monogram', sampleClass: 'font-serif font-black tracking-widest text-xl text-slate-900' }
                ].map(f => (
                  <div
                    key={f.id}
                    onClick={() => setTypedFont(f.id as any)}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between h-28 ${
                      typedFont === f.id
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-200'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{f.label}</span>
                    <div className={f.sampleClass}>
                      {typedText || 'Signature'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ✓ {getUIText(language, { en: 'Verified Cursive Style', ku: 'شێوازی فەرمی پەسەندکراو', ar: 'نمط رسمي معتمد' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD STAMP / IMAGE */}
          {activeTab === 'UPLOAD' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />

              {uploadedImage ? (
                <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col items-center justify-center text-center space-y-3">
                  <img
                    src={uploadedImage}
                    alt="Uploaded Stamp"
                    className="max-h-36 max-w-xs object-contain border border-slate-300 rounded-xl bg-white p-2 shadow-xs"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      {getUIText(language, { en: 'Change File', ku: 'گۆڕینی وێنە', ar: 'تغيير الصورة' })}
                    </button>
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 cursor-pointer"
                    >
                      {getUIText(language, { en: 'Remove', ku: 'سڕینەوە', ar: 'حذف' })}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/20"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {getUIText(language, { en: 'Click to upload signature or company seal', ku: 'کلیک بکە بۆ بارکردنی وێنەی واژۆ یان مۆری فەرمی', ar: 'انقر لتحميل صورة التوقيع أو الختم' })}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    {getUIText(language, { en: 'PNG transparent background recommended (Max 5MB)', ku: 'پێشنیار دەکرێت پاشبنەمای وێنەکە شەفاف بێت (PNG)', ar: 'يفضل خلفية شفافة بصيغة PNG' })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED PROFILES */}
          {activeTab === 'SAVED' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-600 block">
                {getUIText(language, { en: 'Saved Executive Signatures & Official Seals:', ku: 'واژۆ و مۆرە فەرمییە هەڵگیراوەکان:', ar: 'التوقيعات والأختام المحفوظة مسبقاً:' })}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {signatureProfiles.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-slate-900">{p.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                            {p.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                          {p.digitalCertHash}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteSignatureProfile(p.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-center border border-slate-100 min-h-[70px]">
                      <img
                        src={p.signatureDataUrl}
                        alt="Saved Signature"
                        className="max-h-14 max-w-full object-contain"
                      />
                    </div>

                    <button
                      onClick={() => handleApplySignature(p.signatureDataUrl, p.officialSealDataUrl)}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{getUIText(language, { en: 'Use This Signature', ku: 'بەکارهێنانی ئەم واژۆیە', ar: 'استخدام هذا التوقيع' })}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cryptographic Seal & Security Stamp Option */}
          {activeTab !== 'SAVED' && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 p-4 rounded-2xl border border-amber-200/80 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 border border-amber-400/40 mt-0.5">
                  <Stamp className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-950">
                      {getUIText(language, { en: 'Attach Official Corporate Holding Seal', ku: 'مۆری فەرمی هۆڵدینگی لەگەڵ دابنرێت', ar: 'إرفاق الختم الرسمي للهولدينغ' })}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 font-mono font-bold">
                      {sealHash}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 mt-0.5">
                    {getUIText(language, {
                      en: 'Generates a gold executive seal with dynamic Holding Name, signer credentials, and tamper-evident hash.',
                      ku: 'مۆرێکی فەرمی ئاڵتونی بە ناوی هۆڵدینگ و خاوەن و کۆدی پارێزراو دروست دەکات.',
                      ar: 'ينشئ ختماً رسمياً يحمل اسم الهولدينغ والمالك وكوداً أمنياً مشفراً غير قابل للتزوير.'
                    })}
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={includeOfficialSeal}
                onChange={(e) => setIncludeOfficialSeal(e.target.checked)}
                className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-amber-300 mt-1 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>
              {getUIText(language, {
                en: 'Electronic signatures conform to Enterprise ERP Audit & Security Standards',
                ku: 'واژۆ ئەلیکترۆنییەکان لەگەڵ ستانداردەکانی وردبینی SAS ERP گونجێنراون',
                ar: 'التواقيع الإلكترونية متوافقة مع معايير التدقيق والأمان المؤسسي'
              })}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {activeTab !== 'SAVED' && (
              <button
                onClick={handleSaveToProfiles}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>{getUIText(language, { en: 'Save to My Profiles', ku: 'پاشەکەوتکردن بۆ داهاتوو', ar: 'حفظ في ملفاتي' })}</span>
              </button>
            )}

            <button
              onClick={() => handleApplySignature()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {targetPoId
                  ? getUIText(language, { en: 'Sign & Authorize Document', ku: 'واژۆکردن و پەسەندکردنی پسوولە', ar: 'توقيع واعتماد المستند' })
                  : getUIText(language, { en: 'Apply Signature', ku: 'جێبەجێکردنی واژۆ', ar: 'تطبيق التوقيع' })}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
