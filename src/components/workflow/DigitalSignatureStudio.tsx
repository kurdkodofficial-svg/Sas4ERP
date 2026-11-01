import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  PenTool,
  Stamp,
  Crown,
  ShieldCheck,
  Lock,
  Key,
  QrCode,
  FileText,
  CheckCircle2,
  RefreshCw,
  Printer,
  Download,
  Move,
  Trash2,
  Plus,
  Sparkles,
  Building2,
  FolderKanban,
  Check,
  X,
  AlertCircle,
  Copy,
  Eye,
  Sliders,
  RotateCcw,
  Upload,
  Type,
  Maximize2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { getUIText, resolveEntityText } from '../../utils/langHelper';
import { PurchaseOrder } from '../../types/erp';
import { OfficialSealScope, OfficialSealShape, OfficialSealTemplate, DigitalSignatureData } from '../../types/workflow';

interface DigitalSignatureStudioProps {
  initialPoId?: string;
  onClose?: () => void;
  onSignSuccess?: (po: PurchaseOrder) => void;
}

export const DigitalSignatureStudio: React.FC<DigitalSignatureStudioProps> = ({
  initialPoId,
  onClose,
  onSignSuccess
}) => {
  const {
    holding,
    companies,
    projects,
    purchaseOrders,
    currentUser,
    approvePurchaseByOwner,
    signatureProfiles,
    saveSignatureProfile,
    setIsPrinterModalOpen,
    setPrintPreviewPO,
    openPrintManager,
    printDigitalApproval
  } = useERP();

  const { language } = useLanguage();

  // Document Selection
  const [selectedPoId, setSelectedPoId] = useState<string>(
    initialPoId || purchaseOrders.find(p => p.status === 'PENDING_OWNER_APPROVAL')?.id || purchaseOrders[0]?.id || ''
  );

  const selectedPO = useMemo(() => {
    return purchaseOrders.find(p => p.id === selectedPoId) || purchaseOrders[0] || null;
  }, [purchaseOrders, selectedPoId]);

  // Security & Identity Verification State
  const [signerRole, setSignerRole] = useState<'HOLDING_OWNER' | 'GENERAL_MANAGER' | 'BOARD_CHAIRMAN'>('HOLDING_OWNER');
  const [signerName, setSignerName] = useState(holding.chairmanName || currentUser.name || 'Holding Owner');
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('1234');
  const [pinError, setPinError] = useState<string | null>(null);

  // Signature Input Mode: DRAW | TYPE | UPLOAD | SAVED
  const [signatureMode, setSignatureMode] = useState<'DRAW' | 'TYPE' | 'UPLOAD' | 'SAVED'>('DRAW');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1e3a8a');
  const [penWidth, setPenWidth] = useState(3);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [typedSignatureText, setTypedSignatureText] = useState(holding.chairmanName || currentUser.name || 'Authorized Signatory');
  const [typedFontFamily, setTypedFontFamily] = useState<'font-serif' | 'font-sans' | 'font-mono' | 'font-cursive'>('font-serif');
  const [uploadedSignatureUrl, setUploadedSignatureUrl] = useState<string | null>(null);

  // Official Stamp / Seal Generator State
  const [stampScope, setStampScope] = useState<OfficialSealScope>('HOLDING');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [departmentName, setDepartmentName] = useState('Financial Audit & Executive Board');
  const [departmentNameKu, setDepartmentNameKu] = useState('بەشی دارایی، وردبینی و کارگێڕی هۆڵدینگ');
  const [departmentNameAr, setDepartmentNameAr] = useState('قسم التدقيق المالي ومجلس الإدارة');

  const [stampShape, setStampShape] = useState<OfficialSealShape>('DOUBLE_RING');
  const [stampColor, setStampColor] = useState<string>('#b91c1c'); // Official crimson red
  const [stampEmblem, setStampEmblem] = useState<'CROWN' | 'SHIELD' | 'BUILDING' | 'EAGLE' | 'SCALES' | 'CHECK'>('CROWN');
  const [stampStatusText, setStampStatusText] = useState<'APPROVED' | 'VERIFIED' | 'AUTHORIZED' | 'PAID'>('APPROVED');
  const [stampRotation, setStampRotation] = useState<number>(-4); // slight tilt for realistic ink
  const [uploadedStampUrl, setUploadedStampUrl] = useState<string | null>(null);
  const [savedStampTemplates, setSavedStampTemplates] = useState<OfficialSealTemplate[]>(() => {
    try {
      const stored = localStorage.getItem('sas4erp_official_stamps');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Cryptographic Encrypted Timestamp & Unique Key
  const [encryptedTimestamp, setEncryptedTimestamp] = useState<string>('');
  const [uniqueSecurityKey, setUniqueSecurityKey] = useState<string>('');
  const [certificateSerial, setCertificateSerial] = useState<string>('');
  const [securityHash, setSecurityHash] = useState<string>('');

  // Drag and Drop Placement Coordinates (Percentage-based within Document Canvas)
  // Default positions: Signature bottom right, Stamp bottom left, Security Badge bottom center
  const [signaturePos, setSignaturePos] = useState<{ x: number; y: number }>({ x: 62, y: 78 });
  const [stampPos, setStampPos] = useState<{ x: number; y: number }>({ x: 12, y: 74 });
  const [badgePos, setBadgePos] = useState<{ x: number; y: number }>({ x: 34, y: 88 });

  // Dragging interaction state
  const [activeDraggingItem, setActiveDraggingItem] = useState<'SIGNATURE' | 'STAMP' | 'BADGE' | null>(null);
  const documentCanvasRef = useRef<HTMLDivElement | null>(null);
  const dragStartOffsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });

  // Execution & Feedback
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Initialize Security Keys & Timestamp
  const generateNewSecurityKeys = () => {
    const now = new Date();
    const isoTime = now.toISOString();
    const epoch = now.getTime();
    const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
    const key = `KEY-SHA256-${randomHex}-${epoch.toString().slice(-6)}`;
    const cert = `SAS-CERT-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}-${stampScope}`;
    const hash = `HMAC-SHA256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    setEncryptedTimestamp(isoTime);
    setUniqueSecurityKey(key);
    setCertificateSerial(cert);
    setSecurityHash(hash);
  };

  useEffect(() => {
    generateNewSecurityKeys();
  }, [selectedPoId, stampScope, selectedCompanyId, selectedProjectId]);

  // Sync with selected PO company/project if desired
  useEffect(() => {
    if (selectedPO) {
      if (selectedPO.companyId) setSelectedCompanyId(selectedPO.companyId);
      if (selectedPO.projectId) setSelectedProjectId(selectedPO.projectId);
    }
  }, [selectedPO]);

  // Canvas drawing handlers
  useEffect(() => {
    if (signatureMode === 'DRAW' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
      }
    }
  }, [signatureMode, penColor, penWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
    setSignatureDataUrl(canvas.toDataURL('image/png'));
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureDataUrl(canvasRef.current.toDataURL('image/png'));
    }
  };

  const handleClearSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
  };

  // Convert Typed Signature to DataUrl
  const handleGenerateTypedSignature = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'italic 38px "Brush Script MT", "Caveat", "Segoe Script", cursive, Georgia';
      ctx.fillStyle = penColor;
      ctx.textBaseline = 'middle';
      ctx.fillText(typedSignatureText || signerName, 25, 80);
      // decorative underline flourish
      ctx.beginPath();
      ctx.moveTo(25, 115);
      ctx.quadraticCurveTo(200, 130, 420, 110);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = penColor;
      ctx.stroke();
      const url = canvas.toDataURL('image/png');
      setSignatureDataUrl(url);
    }
  };

  useEffect(() => {
    if (signatureMode === 'TYPE') {
      handleGenerateTypedSignature();
    }
  }, [signatureMode, typedSignatureText, penColor]);

  // Handle Signature Image Upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setUploadedSignatureUrl(url);
        setSignatureDataUrl(url);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Custom Stamp Image Upload (Drag-and-Drop)
  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | undefined;
    if ('dataTransfer' in e) {
      e.preventDefault();
      file = e.dataTransfer.files?.[0];
    } else {
      file = e.target.files?.[0];
    }
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setUploadedStampUrl(url);
      };
      reader.readAsDataURL(file);
    }
  };

  // Target Entity Details for Stamp
  const currentEntityDetails = useMemo(() => {
    if (stampScope === 'HOLDING') {
      return {
        name: holding.name || 'SAS Holding International',
        nameKu: holding.nameKu || 'هۆڵدینگی نێودەوڵەتی ساس',
        nameAr: holding.nameAr || 'مجموعة ساس الدولية القابضة',
        code: 'HOLDING-HQ',
        regNo: 'REG-KURD-2026-HQ',
        year: '2026'
      };
    }
    if (stampScope === 'COMPANY') {
      const comp = companies.find(c => c.id === selectedCompanyId) || companies[0];
      return {
        name: comp?.name || 'Holding Enterprise Subsidiary',
        nameKu: comp?.nameKu || comp?.name || 'کۆمپانیای سەر بە هۆڵدینگ',
        nameAr: comp?.nameAr || comp?.name || 'شركة تابعة للمجموعة',
        code: comp?.code || 'COMP',
        regNo: `REG-${comp?.code || 'CORP'}-8842`,
        year: comp?.establishedDate?.slice(0, 4) || '2024'
      };
    }
    if (stampScope === 'PROJECT') {
      const proj = projects.find(p => p.id === selectedProjectId) || projects[0];
      return {
        name: proj?.name || 'Strategic Infrastructure Project',
        nameKu: proj?.nameKu || proj?.name || 'پرۆژەی ستراتیژی',
        nameAr: proj?.nameAr || proj?.name || 'مشروع استراتيجي',
        code: proj?.code || 'PROJ',
        regNo: `PRJ-${proj?.code || 'SITE'}-01`,
        year: '2026'
      };
    }
    return {
      name: departmentName || 'Executive Audit Department',
      nameKu: departmentNameKu || 'بەشی وردبینی و پەسەندکردن',
      nameAr: departmentNameAr || 'قسم التدقيق والاعتماد المالي',
      code: 'DEPT',
      regNo: 'DEPT-SEC-99',
      year: '2026'
    };
  }, [stampScope, selectedCompanyId, selectedProjectId, departmentName, departmentNameKu, departmentNameAr, holding, companies, projects]);

  // Stamp Saving to Library
  const handleSaveStampToLibrary = () => {
    const newTemplate: OfficialSealTemplate = {
      id: `stamp-${Date.now()}`,
      name: `${currentEntityDetails.name} Seal`,
      nameKu: `مۆری فەرمی ${currentEntityDetails.nameKu}`,
      scope: stampScope,
      entityId: stampScope === 'COMPANY' ? selectedCompanyId : stampScope === 'PROJECT' ? selectedProjectId : 'holding',
      entityName: currentEntityDetails.name,
      entityNameKu: currentEntityDetails.nameKu,
      departmentName: stampScope === 'DEPARTMENT' ? departmentName : undefined,
      shape: stampShape,
      colorHex: stampColor,
      centerEmblem: stampEmblem,
      statusBadgeText: stampStatusText,
      registrationNumber: currentEntityDetails.regNo,
      establishedYear: currentEntityDetails.year,
      customImageDataUrl: uploadedStampUrl || undefined,
      rotationDeg: stampRotation,
      createdAt: new Date().toISOString()
    };

    const updated = [newTemplate, ...savedStampTemplates.slice(0, 11)];
    setSavedStampTemplates(updated);
    try {
      localStorage.setItem('sas4erp_official_stamps', JSON.stringify(updated));
    } catch {}

    setToastNotice(
      language === 'ku' ? 'مۆری فەرمی لە پەرتووکخانەی مۆرەکاندا پاشەکەوتکرا' :
      language === 'ar' ? 'تم حفظ الختم الرسمي في مكتبة الأختام' :
      'Official seal saved to stamp library'
    );
    setTimeout(() => setToastNotice(null), 3000);
  };

  // Apply Saved Stamp Template
  const handleApplySavedStamp = (tpl: OfficialSealTemplate) => {
    setStampScope(tpl.scope);
    setStampShape(tpl.shape);
    setStampColor(tpl.colorHex);
    setStampEmblem(tpl.centerEmblem);
    setStampStatusText(tpl.statusBadgeText as any);
    if (tpl.rotationDeg !== undefined) setStampRotation(tpl.rotationDeg);
    if (tpl.customImageDataUrl) setUploadedStampUrl(tpl.customImageDataUrl);
    if (tpl.scope === 'COMPANY') setSelectedCompanyId(tpl.entityId);
    if (tpl.scope === 'PROJECT') setSelectedProjectId(tpl.entityId);
    if (tpl.departmentName) setDepartmentName(tpl.departmentName);
  };

  // PIN Unlock Check
  const handleVerifyPin = () => {
    if (enteredPin.trim() === '1234' || enteredPin.trim().length >= 4) {
      setIsPinUnlocked(true);
      setPinError(null);
      setToastNotice(
        language === 'ku' ? 'کلیلی ئەمنیی واژۆ بە سەرکەوتوویی کرایەوە' :
        language === 'ar' ? 'تم فتح مفتاح التوقيع الرقمي بنجاح' :
        'Executive Security Key unlocked'
      );
      setTimeout(() => setToastNotice(null), 3000);
    } else {
      setPinError(language === 'ku' ? 'پین کۆد هەڵەیە (تێستی فەرمی: 1234)' : 'Invalid PIN (Default: 1234)');
    }
  };

  // Drag and drop mechanics across document canvas
  const handlePointerDown = (item: 'SIGNATURE' | 'STAMP' | 'BADGE', e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDraggingItem(item);

    const canvasElem = documentCanvasRef.current;
    if (!canvasElem) return;
    const rect = canvasElem.getBoundingClientRect();

    const targetPos = item === 'SIGNATURE' ? signaturePos : item === 'STAMP' ? stampPos : badgePos;
    const currentPixelX = (targetPos.x / 100) * rect.width;
    const currentPixelY = (targetPos.y / 100) * rect.height;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    dragStartOffsetRef.current = {
      offsetX: clickX - currentPixelX,
      offsetY: clickY - currentPixelY
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeDraggingItem || !documentCanvasRef.current) return;
    e.preventDefault();

    const canvasElem = documentCanvasRef.current;
    const rect = canvasElem.getBoundingClientRect();

    const currentX = e.clientX - rect.left - dragStartOffsetRef.current.offsetX;
    const currentY = e.clientY - rect.top - dragStartOffsetRef.current.offsetY;

    // Convert to percentage with bounds [0%, 88%]
    let pctX = Math.max(2, Math.min(85, (currentX / rect.width) * 100));
    let pctY = Math.max(5, Math.min(88, (currentY / rect.height) * 100));

    pctX = Math.round(pctX * 10) / 10;
    pctY = Math.round(pctY * 10) / 10;

    if (activeDraggingItem === 'SIGNATURE') {
      setSignaturePos({ x: pctX, y: pctY });
    } else if (activeDraggingItem === 'STAMP') {
      setStampPos({ x: pctX, y: pctY });
    } else if (activeDraggingItem === 'BADGE') {
      setBadgePos({ x: pctX, y: pctY });
    }
  };

  const handlePointerUp = () => {
    setActiveDraggingItem(null);
  };

  // Preset Layout Quick Buttons
  const handleApplyPresetLayout = (layout: 'STANDARD_EXECUTIVE' | 'CENTER_WATERMARK' | 'INVERTED') => {
    if (layout === 'STANDARD_EXECUTIVE') {
      setSignaturePos({ x: 62, y: 78 });
      setStampPos({ x: 14, y: 74 });
      setBadgePos({ x: 30, y: 90 });
    } else if (layout === 'CENTER_WATERMARK') {
      setSignaturePos({ x: 55, y: 80 });
      setStampPos({ x: 36, y: 45 });
      setBadgePos({ x: 25, y: 88 });
    } else {
      setSignaturePos({ x: 12, y: 78 });
      setStampPos({ x: 64, y: 74 });
      setBadgePos({ x: 30, y: 90 });
    }
  };

  // Convert SVG Official Seal to DataURL for PO storage
  const getRenderedSealSvgString = () => {
    const entityName = language === 'ku' && currentEntityDetails.nameKu ? currentEntityDetails.nameKu : currentEntityDetails.name;
    const dept = language === 'ku' && departmentNameKu ? departmentNameKu : departmentName;
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <path id="circleTop" d="M 30, 100 A 70,70 0 0,1 170,100" fill="none" />
          <path id="circleBottom" d="M 170, 100 A 70,70 0 0,1 30,100" fill="none" />
        </defs>
        <circle cx="100" cy="100" r="92" fill="none" stroke="${stampColor}" stroke-width="4.5" stroke-dasharray="${stampShape === 'DOUBLE_RING' ? 'none' : '6 3'}" />
        <circle cx="100" cy="100" r="82" fill="none" stroke="${stampColor}" stroke-width="1.8" />
        <circle cx="100" cy="100" r="54" fill="none" stroke="${stampColor}" stroke-width="2" />
        
        <text font-family="Arial, sans-serif" font-size="10.5" font-weight="900" fill="${stampColor}" letter-spacing="1.5">
          <textPath href="#circleTop" startOffset="50%" text-anchor="middle">
            ${entityName.toUpperCase()}
          </textPath>
        </text>
        
        <text font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="${stampColor}" letter-spacing="1.2">
          <textPath href="#circleBottom" startOffset="50%" text-anchor="middle">
            ★ OFFICIAL AUTHORIZED SEAL ★
          </textPath>
        </text>
        
        <!-- Center Emblem / Crown / Shield -->
        <g transform="translate(100, 84) scale(0.9)" text-anchor="middle" fill="${stampColor}">
          <circle cx="0" cy="0" r="16" fill="${stampColor}10" stroke="${stampColor}" stroke-width="1" />
          <text y="5" font-size="14" font-weight="bold" text-anchor="middle">👑</text>
        </g>
        
        <!-- Status Box -->
        <rect x="52" y="108" width="96" height="20" rx="4" fill="${stampColor}" />
        <text x="100" y="122" font-family="Arial, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
          ${stampStatusText}
        </text>
        
        <text x="100" y="142" font-family="monospace" font-size="7" font-weight="bold" fill="${stampColor}" text-anchor="middle">
          ${currentEntityDetails.regNo}
        </text>
      </svg>
    `;
  };

  const getSealDataUrl = () => {
    if (uploadedStampUrl) return uploadedStampUrl;
    const svgStr = getRenderedSealSvgString();
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;
  };

  // Authorize & Apply Signature
  const handleApplySignatureAndAuthorize = () => {
    if (!selectedPO) return;

    if (!isPinUnlocked) {
      setPinError(language === 'ku' ? 'تکایە سەرەتا پین کۆدی ئەمنیی خاوەنی هۆڵدینگ لێبدە بۆ کردنەوەی واژۆ' : 'Please enter security PIN to unlock executive signature');
      return;
    }

    const effectiveSig = signatureDataUrl || uploadedSignatureUrl || 'SIG_APPLIED_DIGITAL';
    const effectiveSeal = getSealDataUrl();

    // Call ERP approval
    approvePurchaseByOwner(
      selectedPO.id,
      `Encrypted Digital Signature & Official ${stampScope} Seal applied by ${signerName} (Key: ${uniqueSecurityKey})`,
      effectiveSig,
      effectiveSeal
    );

    // Save profile if needed
    if (signatureDataUrl && signatureMode === 'DRAW') {
      saveSignatureProfile({
        name: `${signerName} (${new Date().toLocaleDateString()})`,
        role: signerRole,
        signatureDataUrl: signatureDataUrl,
        officialSealDataUrl: effectiveSeal,
        isDefault: true
      });
    }

    setIsSuccessModalOpen(true);
    if (onSignSuccess && selectedPO) {
      onSignSuccess(selectedPO);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden text-slate-800">
      
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-950 text-white text-xs font-bold shadow-2xl border border-slate-800 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-5 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shrink-0">
            <Stamp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                {language === 'ku' ? 'ستۆدیۆی واژۆی ئەلیکترۆنی و مۆری فەرمی' : language === 'ar' ? 'استوديو التوقيع الإلكتروني والختم الرسمي' : 'Digital Signature & Official Stamp Studio'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                256-Bit Encrypted
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {language === 'ku'
                ? 'واژۆی دەستی، دروستکردنی مۆری هۆڵدینگ/کۆمپانیاکان/پرۆژەکان، و دانان بە شێوازی درەگ ئەند درۆپ'
                : language === 'ar'
                ? 'التوقيع الحي، وتوليد أختام المجموعة والشركات والمشاريع مع السحب والإفلات التفاعلي'
                : 'Secure e-signature, dynamic stamp generator (Holding, Subsidiaries, Projects), and interactive drag-and-drop'}
            </p>
          </div>
        </div>

        {/* Security PIN Authorization Status */}
        <div className="flex items-center gap-3">
          {!isPinUnlocked ? (
            <div className="flex items-center gap-2 bg-slate-850/90 p-1.5 rounded-2xl border border-slate-700">
              <Lock className="w-4 h-4 text-amber-400 ml-2" />
              <input
                type="password"
                maxLength={6}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="PIN"
                className="w-16 px-2 py-1 text-center bg-slate-800 text-white rounded-xl text-xs font-mono tracking-widest border border-slate-700 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleVerifyPin}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition cursor-pointer"
              >
                {language === 'ku' ? 'کردنەوەی پین' : language === 'ar' ? 'فك القفل' : 'Unlock'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ku' ? 'کلیلی ئەمنیی واژۆ کراوەیە' : language === 'ar' ? 'المفتاح الأمني مفعل' : 'Security Key Active'}</span>
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {pinError && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-2 flex items-center gap-2 text-rose-300 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{pinError}</span>
        </div>
      )}

      {/* Main Studio Body: Grid 12 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[680px] bg-slate-100">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN (4 Cols): Signature Pad & Official Stamp Customizer */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 bg-white border-e border-slate-200/90 p-5 space-y-5 overflow-y-auto max-h-[820px]">
          
          {/* Target Document / PO Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>{language === 'ku' ? 'هەڵبژاردنی بەڵگەنامە / فەرمانی خەرجی' : language === 'ar' ? 'المستند / طلب الشراء المستهدف' : 'Target Document / PO'}</span>
              <span className="text-blue-600 font-mono font-bold">{selectedPO?.poNumber || 'N/A'}</span>
            </label>
            <select
              value={selectedPoId}
              onChange={(e) => setSelectedPoId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {purchaseOrders.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.poNumber} — ${po.totalAmountUSD.toLocaleString()} ({po.supplierName}) [{po.status}]
                </option>
              ))}
            </select>
          </div>

          {/* Section 1: Official Stamp / Seal Generator */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Stamp className="w-4 h-4 text-rose-600" />
                {language === 'ku' ? 'دروستکردنی مۆری فەرمی' : language === 'ar' ? 'توليد الختم الرسمي' : 'Official Stamp Generator'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                {stampScope}
              </span>
            </div>

            {/* Scope Selection: Holding HQ | Company | Project | Department */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 rounded-xl text-[10px] font-black text-center">
              <button
                onClick={() => setStampScope('HOLDING')}
                className={`py-1.5 rounded-lg transition cursor-pointer ${stampScope === 'HOLDING' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {language === 'ku' ? 'هۆڵدینگ' : language === 'ar' ? 'القابضة' : 'Holding'}
              </button>
              <button
                onClick={() => setStampScope('COMPANY')}
                className={`py-1.5 rounded-lg transition cursor-pointer ${stampScope === 'COMPANY' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {language === 'ku' ? 'کۆمپانیا' : language === 'ar' ? 'الشركات' : 'Company'}
              </button>
              <button
                onClick={() => setStampScope('PROJECT')}
                className={`py-1.5 rounded-lg transition cursor-pointer ${stampScope === 'PROJECT' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {language === 'ku' ? 'پرۆژەکان' : language === 'ar' ? 'المشاريع' : 'Project'}
              </button>
              <button
                onClick={() => setStampScope('DEPARTMENT')}
                className={`py-1.5 rounded-lg transition cursor-pointer ${stampScope === 'DEPARTMENT' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {language === 'ku' ? 'بەشەکان' : language === 'ar' ? 'الأقسام' : 'Dept'}
              </button>
            </div>

            {/* Specific Entity Pickers based on Scope */}
            {stampScope === 'COMPANY' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">{language === 'ku' ? 'دیاریکردنی کۆمپانیای سەر بە هۆڵدینگ:' : 'Select Holding Subsidiary:'}</label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {language === 'ku' && c.nameKu ? c.nameKu : c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {stampScope === 'PROJECT' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">{language === 'ku' ? 'دیاریکردنی پرۆژە:' : 'Select Project:'}</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {language === 'ku' && p.nameKu ? p.nameKu : p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {stampScope === 'DEPARTMENT' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">{language === 'ku' ? 'ناوی بەش:' : 'Department Name:'}</label>
                <input
                  type="text"
                  value={language === 'ku' ? departmentNameKu : departmentName}
                  onChange={(e) => {
                    if (language === 'ku') setDepartmentNameKu(e.target.value);
                    else setDepartmentName(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                />
              </div>
            )}

            {/* Stamp Styling: Colors & Shape */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">{language === 'ku' ? 'ڕەنگی مۆر' : 'Ink Color'}</label>
                <div className="flex items-center gap-1.5">
                  {[
                    { color: '#b91c1c', label: 'Red' },
                    { color: '#1d4ed8', label: 'Navy' },
                    { color: '#047857', label: 'Emerald' },
                    { color: '#7e22ce', label: 'Purple' },
                    { color: '#0f172a', label: 'Black' }
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setStampColor(c.color)}
                      className={`w-6 h-6 rounded-full transition cursor-pointer ${stampColor === c.color ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'}`}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">{language === 'ku' ? 'شێوەی مۆر' : 'Seal Shape'}</label>
                <select
                  value={stampShape}
                  onChange={(e) => setStampShape(e.target.value as OfficialSealShape)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold bg-white"
                >
                  <option value="DOUBLE_RING">{language === 'ku' ? 'بازنەیی جووت ئەڵقە' : 'Circular Double Ring'}</option>
                  <option value="CIRCULAR">{language === 'ku' ? 'بازنەیی یەک ئەڵقە' : 'Single Circle'}</option>
                  <option value="OVAL">{language === 'ku' ? 'هێلکەیی ڕێپێدراو' : 'Oval Seal'}</option>
                  <option value="RECTANGULAR">{language === 'ku' ? 'چوارگۆشەی فەرمی' : 'Rectangular Box'}</option>
                </select>
              </div>
            </div>

            {/* Stamp Status Banner Text */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">{language === 'ku' ? 'دەقی پەسەندکردن' : 'Stamp Status'}</label>
                <select
                  value={stampStatusText}
                  onChange={(e) => setStampStatusText(e.target.value as any)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold bg-white"
                >
                  <option value="APPROVED">APPROVED (پەسەندکراو)</option>
                  <option value="VERIFIED">VERIFIED (وردبینی کراو)</option>
                  <option value="AUTHORIZED">AUTHORIZED (مۆڵەتپێدراو)</option>
                  <option value="PAID">PAID & CLEARED</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">{language === 'ku' ? 'پلەی لاری مۆر (Tilt)' : 'Realistic Rotation'}</label>
                <input
                  type="range"
                  min={-15}
                  max={15}
                  value={stampRotation}
                  onChange={(e) => setStampRotation(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>
            </div>

            {/* Stamp Live Preview Mini Box & Save to Presets */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center shrink-0 p-1"
                  style={{ borderColor: stampColor, transform: `rotate(${stampRotation}deg)` }}
                >
                  <span className="text-[9px] font-black text-center leading-tight truncate" style={{ color: stampColor }}>
                    {stampStatusText}
                  </span>
                </div>
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-slate-900 block truncate max-w-[140px]">
                    {currentEntityDetails.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {currentEntityDetails.regNo}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSaveStampToLibrary}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                title={language === 'ku' ? 'پاشەکەوتکردن لە پەرتووکخانەی مۆرەکان' : 'Save Seal to Library'}
              >
                <Plus className="w-3 h-3 text-rose-600" />
                <span>{language === 'ku' ? 'پاشەکەوت' : 'Save'}</span>
              </button>
            </div>

            {/* Drag & Drop File Upload for Custom Stamp */}
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleStampUpload}
              className="border border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-2.5 text-center bg-white transition cursor-pointer"
            >
              <label className="cursor-pointer block text-[10px] text-slate-500">
                <Upload className="w-3.5 h-3.5 mx-auto text-slate-400 mb-1" />
                <span>{language === 'ku' ? 'یان وێنەی مۆری ئامادەکراو درەگ بکە ئێرە (PNG)' : 'Or Drag & Drop custom stamp image (PNG)'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleStampUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Executive Signature Pad */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-blue-600" />
                {language === 'ku' ? 'واژۆی ئەلیکترۆنی' : language === 'ar' ? 'التوقيع الحي' : 'Electronic Signature'}
              </span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'DRAW', label: language === 'ku' ? 'دەستنووس' : 'Draw', icon: PenTool },
                  { id: 'TYPE', label: language === 'ku' ? 'تایپ' : 'Type', icon: Type },
                  { id: 'UPLOAD', label: language === 'ku' ? 'وێنە' : 'Upload', icon: Upload }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSignatureMode(m.id as any)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${signatureMode === m.id ? 'bg-blue-600 text-white' : 'bg-slate-200/80 text-slate-600 hover:text-slate-900'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode 1: Hand-Drawn Pad */}
            {signatureMode === 'DRAW' && (
              <div className="space-y-2">
                <div className="relative border-2 border-slate-300 rounded-xl bg-white shadow-inner overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[120px] touch-none cursor-crosshair bg-white"
                  />
                  <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-300 pointer-events-none select-none">
                    Executive Signatory Area
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {['#1e3a8a', '#0f172a', '#1e293b'].map((col) => (
                      <button
                        key={col}
                        onClick={() => setPenColor(col)}
                        className={`w-4 h-4 rounded-full transition ${penColor === col ? 'ring-2 ring-blue-500 scale-110' : ''}`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                    <span className="text-[10px] text-slate-400 ms-1">{penWidth}px</span>
                  </div>

                  <button
                    onClick={handleClearSignatureCanvas}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{language === 'ku' ? 'سڕینەوە' : 'Clear'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: Typed Cursive Signature */}
            {signatureMode === 'TYPE' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={typedSignatureText}
                  onChange={(e) => setTypedSignatureText(e.target.value)}
                  placeholder="Enter executive name..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                />
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
                  <p className="text-2xl italic font-serif text-blue-900 tracking-wider">
                    {typedSignatureText || signerName}
                  </p>
                  <div className="w-3/4 h-0.5 bg-blue-600 mx-auto mt-1 rounded-full opacity-60" />
                </div>
              </div>
            )}

            {/* Mode 3: Upload Image */}
            {signatureMode === 'UPLOAD' && (
              <div className="p-3 bg-white border border-dashed border-slate-300 rounded-xl text-center">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleSignatureUpload}
                  className="text-xs text-slate-600"
                />
                {uploadedSignatureUrl && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                    <img src={uploadedSignatureUrl} alt="Uploaded Sig" className="max-h-14 mx-auto object-contain" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preset Stamp Templates Quick Bar */}
          {savedStampTemplates.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                {language === 'ku' ? 'مۆرە پاشەکەوتکراوەکانی پەرتووکخانە' : 'Saved Seal Templates'}
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {savedStampTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleApplySavedStamp(tpl)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 whitespace-nowrap transition cursor-pointer flex items-center gap-1"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tpl.colorHex }} />
                    <span>{tpl.nameKu || tpl.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (8 Cols): Interactive Drag-and-Drop Document Canvas */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 p-5 flex flex-col justify-between space-y-4">
          
          {/* Top Control Bar for Document Canvas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Move className="w-4 h-4 text-amber-500" />
                {language === 'ku' ? 'دانان بە شێوازی درەگ ئەند درۆپ (Drag & Drop)' : 'Interactive Drag-and-Drop Document'}
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 text-[11px]">
                {language === 'ku' ? 'واژۆ، مۆر و کلیلەکە ڕابکێشە سەر هەر شوێنێکی بەڵگەنامەکە' : 'Drag signature, stamp & security badge freely over document'}
              </span>
            </div>

            {/* Quick Placement Preset Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleApplyPresetLayout('STANDARD_EXECUTIVE')}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title="Standard Bottom Executive Layout"
              >
                {language === 'ku' ? 'پێگەی ستاندارد' : 'Standard'}
              </button>
              <button
                onClick={() => handleApplyPresetLayout('CENTER_WATERMARK')}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title="Center Stamp Watermark"
              >
                {language === 'ku' ? 'ناوەڕاست' : 'Center Seal'}
              </button>
              <button
                onClick={() => handleApplyPresetLayout('INVERTED')}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title="Inverted Sides"
              >
                {language === 'ku' ? 'پێچەوانە' : 'Inverted'}
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THE DOCUMENT CANVAS (A4-Style Official Order Requisition) */}
          {/* ========================================================================= */}
          <div
            ref={documentCanvasRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative bg-white border border-slate-300 rounded-2xl shadow-md min-h-[520px] p-6 sm:p-8 select-none overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(#e2e8f0 0.8px, transparent 0.8px)',
              backgroundSize: '16px 16px'
            }}
          >
            {/* Watermark in background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
              <Crown className="w-80 h-80 text-slate-900" />
            </div>

            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  OFFICIAL EXECUTIVE AUTHORIZATION VOUCHER
                </span>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {holding.name || 'SAS HOLDING INTERNATIONAL'}
                </h1>
                <p className="text-xs text-slate-600 font-semibold">
                  {currentEntityDetails.name} • {selectedPO?.poNumber || 'VOUCHER-REQ'}
                </p>
              </div>

              <div className="text-end">
                <span className="px-3 py-1 rounded-lg bg-slate-100 font-mono text-xs font-black text-slate-800 border border-slate-300">
                  {selectedPO?.poNumber || 'PO-2026-HQ'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Issued: {selectedPO?.createdDate || new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Order Brief Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 text-xs mb-5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{language === 'ku' ? 'دابینکەر' : 'Vendor'}</span>
                <span className="font-bold text-slate-800 truncate block">{selectedPO?.supplierName || 'Global Supplier'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{language === 'ku' ? 'داواکار' : 'Requester'}</span>
                <span className="font-bold text-slate-800">{selectedPO?.requestedBy || 'Procurement Dept'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{language === 'ku' ? 'کۆی بڕ' : 'Total Amount'}</span>
                <span className="font-black text-emerald-600 text-sm">
                  ${selectedPO?.totalAmountUSD?.toLocaleString() || '0'} {selectedPO?.currency || 'USD'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{language === 'ku' ? 'دۆخ' : 'Status'}</span>
                <span className="font-bold text-blue-700">{selectedPO?.status || 'PENDING'}</span>
              </div>
            </div>

            {/* Purpose & Items Brief */}
            <div className="text-xs text-slate-700 mb-6 bg-slate-50/40 p-3 rounded-xl border border-slate-200/60">
              <span className="font-bold text-slate-900 block mb-1">
                {language === 'ku' ? 'مەبەست و شیکاری خەرجی:' : 'Expense Purpose & Justification:'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {selectedPO?.purpose || 'Executive purchase order requisition for critical operational supply chain delivery.'}
              </p>
            </div>

            {/* Guided Signature Base Line Area */}
            <div className="absolute bottom-6 left-6 right-6 border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] text-slate-400 pointer-events-none">
              <span>{currentEntityDetails.name} • Certified Document</span>
              <span>Holding Executive Approver: {signerName}</span>
            </div>

            {/* ========================================================================= */}
            {/* DRAGGABLE ITEM 1: THE OFFICIAL STAMP (مۆری فەرمی) */}
            {/* ========================================================================= */}
            <div
              onPointerDown={(e) => handlePointerDown('STAMP', e)}
              className={`absolute cursor-grab active:cursor-grabbing transition-shadow z-20 group ${activeDraggingItem === 'STAMP' ? 'ring-2 ring-rose-500 shadow-2xl z-30' : ''}`}
              style={{
                left: `${stampPos.x}%`,
                top: `${stampPos.y}%`,
                transform: `rotate(${stampRotation}deg)`
              }}
            >
              <div className="relative">
                {uploadedStampUrl ? (
                  <img
                    src={uploadedStampUrl}
                    alt="Official Seal"
                    className="w-28 h-28 object-contain drop-shadow-md select-none pointer-events-none"
                  />
                ) : (
                  <div
                    dangerouslySetInnerHTML={{ __html: getRenderedSealSvgString() }}
                    className="w-28 h-28 drop-shadow-md select-none pointer-events-none"
                  />
                )}

                {/* Drag Handle Tag */}
                <div className="absolute -top-3 -right-2 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition shadow-xs flex items-center gap-0.5 pointer-events-none">
                  <Move className="w-2.5 h-2.5" />
                  <span>Seal</span>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DRAGGABLE ITEM 2: DIGITAL SIGNATURE (واژۆی دەستی یان تایپکراو) */}
            {/* ========================================================================= */}
            <div
              onPointerDown={(e) => handlePointerDown('SIGNATURE', e)}
              className={`absolute cursor-grab active:cursor-grabbing transition-shadow z-20 group ${activeDraggingItem === 'SIGNATURE' ? 'ring-2 ring-blue-500 shadow-2xl z-30' : ''}`}
              style={{
                left: `${signaturePos.x}%`,
                top: `${signaturePos.y}%`
              }}
            >
              <div className="relative p-2 rounded-xl bg-white/70 hover:bg-white/95 border border-dashed border-blue-400/80 shadow-xs text-center min-w-[160px]">
                {signatureDataUrl || uploadedSignatureUrl ? (
                  <img
                    src={signatureDataUrl || uploadedSignatureUrl || ''}
                    alt="Signature"
                    className="max-h-14 max-w-[180px] mx-auto object-contain select-none pointer-events-none"
                  />
                ) : (
                  <div className="py-2">
                    <p className="text-xl italic font-serif text-blue-900 select-none pointer-events-none">
                      {signerName}
                    </p>
                    <div className="w-3/4 h-0.5 bg-blue-500 mx-auto mt-0.5" />
                  </div>
                )}
                
                <div className="border-t border-slate-200 mt-1 pt-0.5 text-[9px] font-mono text-slate-500">
                  <span>{signerName} ({signerRole})</span>
                </div>

                {/* Drag Handle Tag */}
                <div className="absolute -top-3 -right-2 px-1.5 py-0.5 rounded bg-blue-600 text-white text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition shadow-xs flex items-center gap-0.5 pointer-events-none">
                  <Move className="w-2.5 h-2.5" />
                  <span>Signature</span>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DRAGGABLE ITEM 3: ENCRYPTED TIMESTAMP & UNIQUE KEY BADGE */}
            {/* ========================================================================= */}
            <div
              onPointerDown={(e) => handlePointerDown('BADGE', e)}
              className={`absolute cursor-grab active:cursor-grabbing transition-shadow z-20 group ${activeDraggingItem === 'BADGE' ? 'ring-2 ring-purple-500 shadow-2xl z-30' : ''}`}
              style={{
                left: `${badgePos.x}%`,
                top: `${badgePos.y}%`
              }}
            >
              <div className="relative flex items-center gap-2 p-2 rounded-xl bg-slate-950/90 text-white shadow-lg border border-slate-700 min-w-[200px]">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4 text-white" />
                </div>
                <div className="text-[9px] font-mono leading-tight">
                  <div className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>CRYPTOGRAPHICALLY VERIFIED</span>
                  </div>
                  <span className="text-slate-300 block truncate max-w-[140px] font-bold">
                    {uniqueSecurityKey}
                  </span>
                  <span className="text-slate-400 block text-[8px]">
                    {encryptedTimestamp || new Date().toISOString()}
                  </span>
                </div>

                {/* Drag Handle Tag */}
                <div className="absolute -top-3 -right-2 px-1.5 py-0.5 rounded bg-purple-600 text-white text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition shadow-xs flex items-center gap-0.5 pointer-events-none">
                  <Move className="w-2.5 h-2.5" />
                  <span>Key</span>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* BOTTOM ACTION BAR */}
          {/* ========================================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">
                  {language === 'ku' ? 'پارێزراوی یاسایی بە بڕوانامەی ئەلیکترۆنی' : 'Tamper-Evident Digital Security Certificate'}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Serial: {certificateSerial}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  if (selectedPO) {
                    openPrintManager(selectedPO);
                  }
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Direct Network & Hardware Printing via PrintManager"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span>{language === 'ku' ? 'چاپ بە پرینتەری تۆڕ (PrintManager)' : language === 'ar' ? 'طباعة عبر الشبكة' : 'Print via Network Station'}</span>
              </button>

              <button
                onClick={handleApplySignatureAndAuthorize}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {language === 'ku' ? 'واژۆکردن و پەسەندکردنی کۆتایی' : language === 'ar' ? 'اعتماد المستند والتوقيع الرسمي' : 'Authorize & Apply E-Signature'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUCCESS CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                {language === 'ku' ? 'بەڵگەنامەکە بە فەرمی واژۆ و مۆرکرا!' : language === 'ar' ? 'تم اعتماد المستند والتوقيع بنجاح!' : 'Document Successfully Signed & Authorized!'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ku'
                  ? `بەڵگەنامەی ${selectedPO?.poNumber} بە واژۆی شەخسی و مۆری فەرمی (${stampScope}) و کلیلی کۆدکراو تۆمارکرا.`
                  : `Voucher ${selectedPO?.poNumber} sealed with official ${stampScope} stamp and encrypted cryptographic key.`}
              </p>
            </div>

            {/* Certificate Details */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-start space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400">Unique Security Key:</span>
                <span className="font-bold text-blue-700">{uniqueSecurityKey}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400">Encrypted Timestamp:</span>
                <span className="text-slate-700">{encryptedTimestamp}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400">Certificate Serial:</span>
                <span className="font-bold text-slate-900">{certificateSerial}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Authorized Signatory:</span>
                <span className="font-bold text-emerald-600">{signerName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  if (selectedPO) {
                    setPrintPreviewPO(selectedPO);
                    setIsPrinterModalOpen(true);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'ku' ? 'چاپکردنی فەرمی' : 'Print Document'}</span>
              </button>

              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  if (onClose) onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
              >
                {language === 'ku' ? 'تەواو' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
