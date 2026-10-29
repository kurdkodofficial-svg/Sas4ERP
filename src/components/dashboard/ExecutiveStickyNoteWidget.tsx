import React, { useState, useEffect, useId, useMemo } from 'react';
import {
  StickyNote,
  Plus,
  Trash2,
  Copy,
  Check,
  CheckSquare,
  Square,
  Download,
  Pin,
  X,
  Minimize2,
  Sparkles,
  Clock,
  Building2,
  Flame,
  ListCheck,
  AlignLeft,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../types/erp';
import { getUIText } from '../../utils/langHelper';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type StickyNotePriority = 'HIGH' | 'NORMAL' | 'LOW';
export type StickyNoteColor = 'amber' | 'slate' | 'emerald' | 'rose' | 'purple';

export interface ExecutiveStickyNote {
  id: string;
  title: string;
  content: string;
  priority: StickyNotePriority;
  color: StickyNoteColor;
  companyId?: string;
  projectId?: string;
  isPinned?: boolean;
  mode: 'text' | 'checklist';
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_SESSION_KEY = 'sas4erp_executive_sticky_notes_session';
const STORAGE_LOCAL_KEY = 'sas4erp_executive_sticky_notes_persistent';

const colorThemes: Record<
  StickyNoteColor,
  {
    bg: string;
    border: string;
    headerBg: string;
    tabActive: string;
    text: string;
    accent: string;
    badge: string;
  }
> = {
  amber: {
    bg: 'bg-amber-50/95',
    border: 'border-amber-300',
    headerBg: 'bg-amber-100/80',
    tabActive: 'bg-amber-400 text-amber-950 font-bold shadow-xs',
    text: 'text-amber-950',
    accent: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  slate: {
    bg: 'bg-slate-50/95',
    border: 'border-slate-300',
    headerBg: 'bg-slate-200/70',
    tabActive: 'bg-slate-800 text-white font-bold shadow-xs',
    text: 'text-slate-900',
    accent: 'text-slate-700',
    badge: 'bg-slate-200 text-slate-800 border-slate-300'
  },
  emerald: {
    bg: 'bg-emerald-50/95',
    border: 'border-emerald-300',
    headerBg: 'bg-emerald-100/80',
    tabActive: 'bg-emerald-600 text-white font-bold shadow-xs',
    text: 'text-emerald-950',
    accent: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  rose: {
    bg: 'bg-rose-50/95',
    border: 'border-rose-300',
    headerBg: 'bg-rose-100/80',
    tabActive: 'bg-rose-500 text-white font-bold shadow-xs',
    text: 'text-rose-950',
    accent: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-900 border-rose-300'
  },
  purple: {
    bg: 'bg-purple-50/95',
    border: 'border-purple-300',
    headerBg: 'bg-purple-100/80',
    tabActive: 'bg-purple-600 text-white font-bold shadow-xs',
    text: 'text-purple-950',
    accent: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-900 border-purple-300'
  }
};

const getDefaultNotesByLang = (lang: Language): ExecutiveStickyNote[] => {
  if (lang === 'ku') {
    return [
      {
        id: 'note-1',
        title: 'بەدواداچوونی کڕینی کرێنی قورس و فڕنی کارگە',
        content: 'پێداچوونەوە بە فەرمانی کڕینی کرێنی قورس (١٨٥ هەزار دۆلار) پێش کۆبوونەوەی دەستەی کارگێڕی. گفتوگۆ لەگەڵ بەڕێوەبەری گشتی لەسەر جیاوازی نرخی دابینکەران.',
        priority: 'HIGH',
        color: 'amber',
        isPinned: true,
        mode: 'checklist',
        checklist: [
          { id: 'c1', text: 'پشکنینی جیاوازی نرخی تەندەر و ئۆفەری ٣ دابینکەر', completed: true },
          { id: 'c2', text: 'دڵنیابوونەوە لە تێپەڕنەکردنی سنووری ٩٠٪ی بودجە لەگەڵ بەڕێوەبەری دارایی', completed: false },
          { id: 'c3', text: 'واژۆکردنی فەرمی نووسراوی ڕەزامەندی خاوەنی هۆلدینگ', completed: false }
        ],
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'note-2',
        title: 'بەپەلە: نوێکردنەوەی ئیقامەی ئەندازیارانی بیانی',
        content: 'پشکنین بۆ ئەو پسپۆڕە بیانییانەی کەمتر لە ١٤ ڕۆژیان ماوە بۆ بەسەرچوونی ئیقامەکانیان لە کۆمپانیای گەیاندن، بۆ ڕێگری لە غەرامەی یاسایی.',
        priority: 'HIGH',
        color: 'rose',
        isPinned: false,
        mode: 'text',
        checklist: [],
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  }

  if (lang === 'ar') {
    return [
      {
        id: 'note-1',
        title: 'متابعة شراء الرافعة الثقيلة وأفران المصنع',
        content: 'مراجعة أمر شراء الرافعة الثقيلة (١٨٥ ألف دولار) قبل اجتماع مجلس الإدارة. مناقشة عروض الأسعار مع المدير العام للشركة.',
        priority: 'HIGH',
        color: 'amber',
        isPinned: true,
        mode: 'checklist',
        checklist: [
          { id: 'c1', text: 'تدقيق فروقات أسعار المناقصات لـ ٣ موردين', completed: true },
          { id: 'c2', text: 'التأكد من عدم تجاوز سقف ٩٠٪ مع المدير المالي', completed: false },
          { id: 'c3', text: 'المصادقة والتوقيع على كتاب الموافقة النهائي', completed: false }
        ],
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'note-2',
        title: 'عاجل: تجديد إقامات الكوادر الهندسية الأجنبية',
        content: 'متابعة إقامات المهندسين التي تنتهي خلال ١٤ يوماً في شركة الاتصالات لتفادي الغرامات الرسمية.',
        priority: 'HIGH',
        color: 'rose',
        isPinned: false,
        mode: 'text',
        checklist: [],
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  }

  return [
    {
      id: 'note-1',
      title: 'Heavy Equipment PO Follow-up & Plant Furnace',
      content: 'Review heavy crane procurement PO ($185k) before Thursday board meeting. Consult GM regarding local supplier quote differences.',
      priority: 'HIGH',
      color: 'amber',
      isPinned: true,
      mode: 'checklist',
      checklist: [
        { id: 'c1', text: 'Audit procurement vendor quotation disparity', completed: true },
        { id: 'c2', text: 'Confirm 90% budget threshold safety margin with CFO', completed: false },
        { id: 'c3', text: 'Sign executive authorization letter if compliant', completed: false }
      ],
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 'note-2',
      title: 'Urgent: Expatriate Visa Approvals',
      content: 'Double-check 3 specialists whose Iqamas expire within 14 days to prevent regulatory fines from Ministry of Labor.',
      priority: 'HIGH',
      color: 'rose',
      isPinned: false,
      mode: 'text',
      checklist: [],
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];
};

export const ExecutiveStickyNoteWidget: React.FC = () => {
  const { companies, projects } = useERP();
  const { language } = useLanguage();
  const isRTL = language === 'ku' || language === 'ar';

  // Persistence preference: Session vs LocalStorage
  const [persistAcrossSessions, setPersistAcrossSessions] = useState<boolean>(() => {
    return localStorage.getItem('sas4erp_sticky_persist_local') === 'true';
  });

  // Load notes from sessionStorage (or localStorage if opted in)
  const [notes, setNotes] = useState<ExecutiveStickyNote[]>(() => {
    try {
      const storage = persistAcrossSessions ? localStorage : sessionStorage;
      const key = persistAcrossSessions ? STORAGE_LOCAL_KEY : STORAGE_SESSION_KEY;
      const saved = storage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return getDefaultNotesByLang(language);
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => notes[0]?.id || 'note-1');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [newChecklistText, setNewChecklistText] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');

  // Active note lookup
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || notes[0] || null;
  }, [notes, activeNoteId]);

  // Persist notes into sessionStorage whenever notes change
  useEffect(() => {
    try {
      const storage = persistAcrossSessions ? localStorage : sessionStorage;
      const key = persistAcrossSessions ? STORAGE_LOCAL_KEY : STORAGE_SESSION_KEY;
      storage.setItem(key, JSON.stringify(notes));
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Could not save notes to storage:', err);
    }
  }, [notes, persistAcrossSessions]);

  const handleTogglePersistence = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setPersistAcrossSessions(val);
    localStorage.setItem('sas4erp_sticky_persist_local', String(val));
    try {
      if (val) {
        localStorage.setItem(STORAGE_LOCAL_KEY, JSON.stringify(notes));
      } else {
        sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(notes));
      }
    } catch {
      // silent
    }
  };

  // Add new note
  const handleCreateNote = () => {
    const newId = `note-${Date.now()}`;
    const newNote: ExecutiveStickyNote = {
      id: newId,
      title: isRTL ? 'تێبینی نوێ' : 'New Executive Memo',
      content: '',
      priority: 'NORMAL',
      color: 'amber',
      isPinned: false,
      mode: 'text',
      checklist: [],
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newId);
  };

  // Update current active note field
  const handleUpdateActiveNote = (updates: Partial<ExecutiveStickyNote>) => {
    if (!activeNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id
          ? {
              ...n,
              ...updates,
              updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          : n
      )
    );
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    if (notes.length <= 1) {
      // Keep at least one note, just clear it
      setNotes([
        {
          id: `note-${Date.now()}`,
          title: isRTL ? 'تێبینی نوێ' : 'Draft Reminder',
          content: '',
          priority: 'NORMAL',
          color: 'amber',
          isPinned: false,
          mode: 'text',
          checklist: [],
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (activeNoteId === id) {
      setActiveNoteId(remaining[0].id);
    }
  };

  // Checklist handlers
  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim() || !activeNote) return;
    const item: ChecklistItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false
    };
    handleUpdateActiveNote({
      checklist: [...(activeNote.checklist || []), item]
    });
    setNewChecklistText('');
  };

  const handleToggleChecklistItem = (itemId: string) => {
    if (!activeNote) return;
    const updated = (activeNote.checklist || []).map((c) =>
      c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    handleUpdateActiveNote({ checklist: updated });
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    if (!activeNote) return;
    const updated = (activeNote.checklist || []).filter((c) => c.id !== itemId);
    handleUpdateActiveNote({ checklist: updated });
  };

  // Copy to clipboard
  const handleCopyNote = () => {
    if (!activeNote) return;
    let fullText = `[EXECUTIVE MEMO - ${activeNote.title}]\nPriority: ${activeNote.priority}\n`;
    if (activeNote.mode === 'checklist') {
      fullText += `\nCHECKLIST:\n`;
      activeNote.checklist.forEach((c) => {
        fullText += `${c.completed ? '[✓]' : '[ ]'} ${c.text}\n`;
      });
      if (activeNote.content) {
        fullText += `\nNOTES:\n${activeNote.content}\n`;
      }
    } else {
      fullText += `\n${activeNote.content}\n`;
    }

    navigator.clipboard?.writeText(fullText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  // Download note as .txt
  const handleDownloadNote = () => {
    if (!activeNote) return;
    let text = `========================================\nHOLDING OWNER EXECUTIVE MEMO\n========================================\nTitle: ${activeNote.title}\nDate: ${activeNote.updatedAt}\nPriority: ${activeNote.priority}\n\n`;
    if (activeNote.mode === 'checklist') {
      text += `CHECKLIST ITEMS:\n`;
      activeNote.checklist.forEach((c) => {
        text += `- [${c.completed ? 'X' : ' '}] ${c.text}\n`;
      });
      if (activeNote.content) {
        text += `\nADDITIONAL CONTEXT:\n${activeNote.content}\n`;
      }
    } else {
      text += activeNote.content;
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-note-${activeNote.title.replace(/[^a-zA-Z0-9]/g, '_') || 'memo'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Quick preset templates
  const applyTemplate = (type: 'po' | 'board' | 'risk' | 'gm') => {
    if (!activeNote) return;
    if (type === 'po') {
      handleUpdateActiveNote({
        title: isRTL ? 'پەسەندکردنی فەرمانی کڕین (PO Approval)' : 'PO Approval Verification',
        priority: 'HIGH',
        color: 'amber',
        mode: 'checklist',
        checklist: [
          { id: 't1', text: isRTL ? 'پشکنینی بەراوردی ٣ تەندەر' : 'Verify 3-supplier quote comparison', completed: false },
          { id: 't2', text: isRTL ? 'دڵنیابوونەوە لە تێپەڕنەکردنی ٩٠٪ی بودجە' : 'Confirm under 90% budget threshold', completed: false },
          { id: 't3', text: isRTL ? 'واژۆکردنی فەرمانی خەرجی' : 'Execute executive owner signature', completed: false }
        ]
      });
    } else if (type === 'board') {
      handleUpdateActiveNote({
        title: isRTL ? 'ئەجێندای کۆبوونەوەی دەستەی بەڕێوەبردن' : 'Board Meeting Agenda & Directives',
        priority: 'HIGH',
        color: 'purple',
        mode: 'checklist',
        checklist: [
          { id: 'b1', text: isRTL ? 'پێداچوونەوە بە داهاتی چارەکی سێیەم' : 'Review Q3 consolidated EBITDA', completed: false },
          { id: 'b2', text: isRTL ? 'بڕیاردان لەسەر کڕینی کەرەستەی ئەربیل ستیل' : 'Decide on Erbil Steel expansion CAPEX', completed: false },
          { id: 'b3', text: isRTL ? 'پلانی بەڕێوەبەرانی نوێ' : 'Succession & GM quarterly evaluations', completed: false }
        ]
      });
    } else if (type === 'risk') {
      handleUpdateActiveNote({
        title: isRTL ? 'هۆشداری مەترسی و نائاسایی کڕین' : 'Urgent Risk & ML Anomaly Inquiry',
        priority: 'HIGH',
        color: 'rose',
        mode: 'text',
        content: isRTL
          ? 'پێویستە لێکۆڵینەوە لە دابەشکردنی داواکارییەکانی کڕین (Split-PO) بکرێت بۆ دڵنیابوون لەوەی بە ئەنقەست لەژێر سنووری ٥٠ هەزار دۆلار نەهێڵراوەتەوە.'
          : 'Instruct internal compliance audit on split purchase orders detected below $50k threshold. Request GM clarification within 24 hours.'
      });
    } else if (type === 'gm') {
      handleUpdateActiveNote({
        title: isRTL ? 'پەیوەندی لەگەڵ بەڕێوەبەری کۆمپانیا' : 'Direct Call GM Follow-up',
        priority: 'NORMAL',
        color: 'emerald',
        mode: 'text',
        content: isRTL
          ? 'تەلەفۆن بۆ بەڕێوەبەری گشتی سەبارەت بە کاتی گەیشتنی بارەکانی دەروازە و مۆڵەتی کرێکارە بیانییەکان.'
          : 'Call General Manager to check gate logistics throughput and resolve expiring specialist work visas before month-end.'
      });
    }
  };

  // High priority / incomplete reminders count
  const uncompletedItemsCount = useMemo(() => {
    let count = 0;
    notes.forEach((n) => {
      if (n.priority === 'HIGH') count++;
      if (n.mode === 'checklist') {
        count += n.checklist.filter((c) => !c.completed).length;
      }
    });
    return count;
  }, [notes]);

  const activeTheme = activeNote ? colorThemes[activeNote.color] : colorThemes.amber;

  return (
    <>
      {/* Floating Launcher Button (Bottom Corner) */}
      <div
        className={`fixed bottom-6 ${
          isRTL ? 'left-6' : 'right-6'
        } z-40 flex items-center print:hidden`}
        id="executive-sticky-note-container"
      >
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-extrabold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-amber-300 cursor-pointer"
            id="open-executive-sticky-notes-btn"
            title="Open Executive Sticky Note (Session Drafts)"
          >
            <div className="relative">
              <StickyNote className="w-5 h-5 text-slate-950 drop-shadow-xs" />
              {uncompletedItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {uncompletedItemsCount > 9 ? '9+' : uncompletedItemsCount}
                </span>
              )}
            </div>

            <span className="text-xs tracking-tight font-black">
              {isRTL ? 'تێبینی سەرۆکایەتی' : 'Executive Sticky Notes'}
            </span>

            <span className="hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-900/20 text-slate-900">
              {notes.length}
            </span>
          </button>
        )}
      </div>

      {/* Expanded Floating Sticky Notepad Window */}
      {isOpen && activeNote && (
        <div
          className={`fixed bottom-6 ${
            isRTL ? 'left-6' : 'right-6'
          } z-40 w-[92vw] sm:w-[420px] max-h-[85vh] flex flex-col rounded-3xl shadow-2xl border-2 ${
            activeTheme.border
          } ${activeTheme.bg} backdrop-blur-xl animate-in slide-in-from-bottom-6 duration-200 print:hidden overflow-hidden`}
          id="executive-sticky-notes-window"
        >
          {/* Top Window Header */}
          <div className={`px-4 py-3 border-b ${activeTheme.border} ${activeTheme.headerBg} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/90 text-amber-950 flex items-center justify-center shadow-xs">
                <StickyNote className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-slate-900 tracking-tight">
                    {isRTL ? 'یاداشتی خێرا و ڕەشنووسی خاوەن' : 'Executive Sticky Notes'}
                  </h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {persistAcrossSessions ? (isRTL ? 'هەمیشەیی' : 'Persistent') : (isRTL ? 'دانیشتن' : 'Session')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-600">
                  {isRTL ? 'خۆکارانە پاشەکەوت دەبێت لە وێبگەڕدا' : 'Auto-saved per session'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCreateNote}
                className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white text-slate-800 border border-slate-300/80 flex items-center justify-center hover:shadow-xs transition cursor-pointer"
                title={isRTL ? 'زیادکردنی تێبینی نوێ' : 'New Note'}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white text-slate-800 border border-slate-300/80 flex items-center justify-center hover:shadow-xs transition cursor-pointer"
                title={isRTL ? 'داخستن / بچووککردنەوە' : 'Minimize'}
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notes Selector Bar / Tabs */}
          <div className="px-3 pt-2.5 pb-2 flex items-center gap-1.5 overflow-x-auto border-b border-slate-200/60 bg-white/40">
            {notes.map((n, idx) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setActiveNoteId(n.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] transition shrink-0 cursor-pointer ${
                  n.id === activeNote.id
                    ? colorThemes[n.color].tabActive
                    : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80'
                }`}
              >
                {n.isPinned && <Pin className="w-2.5 h-2.5 fill-current" />}
                {n.priority === 'HIGH' && <Flame className="w-2.5 h-2.5 text-rose-500 fill-current" />}
                <span className="max-w-[100px] truncate font-medium">
                  {n.title || `Memo #${idx + 1}`}
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={handleCreateNote}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white/80 transition cursor-pointer shrink-0"
              title="Add another memo"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Workspace Body */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[420px] space-y-3.5">
            {/* Note Title & Pin / Priority strip */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                  placeholder={isRTL ? 'ناونیشانی تێبینی یان بابەتەکە بنووسە...' : 'Title of draft memo...'}
                  className="w-full bg-transparent font-extrabold text-sm text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-none transition pb-0.5"
                />
                <button
                  type="button"
                  onClick={() => handleUpdateActiveNote({ isPinned: !activeNote.isPinned })}
                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                    activeNote.isPinned
                      ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-2xs'
                      : 'bg-white/70 text-slate-400 hover:text-slate-700 border-slate-200'
                  }`}
                  title={activeNote.isPinned ? 'Pinned Note' : 'Pin Note'}
                >
                  <Pin className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              {/* Priority & Color Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Priority Selector */}
                <div className="flex items-center gap-1 bg-white/70 p-0.5 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => handleUpdateActiveNote({ priority: 'HIGH' })}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      activeNote.priority === 'HIGH'
                        ? 'bg-rose-500 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-rose-600'
                    }`}
                  >
                    <Flame className="w-2.5 h-2.5" />
                    <span>{isRTL ? 'مەترسیدار' : 'High'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateActiveNote({ priority: 'NORMAL' })}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      activeNote.priority === 'NORMAL'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-blue-600'
                    }`}
                  >
                    <span>{isRTL ? 'ئاسایی' : 'Normal'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateActiveNote({ priority: 'LOW' })}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      activeNote.priority === 'LOW'
                        ? 'bg-slate-700 text-white shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    <span>{isRTL ? 'نزم' : 'Low'}</span>
                  </button>
                </div>

                {/* Color Selector */}
                <div className="flex items-center gap-1 bg-white/70 p-1 rounded-xl border border-slate-200/80">
                  {(['amber', 'emerald', 'rose', 'purple', 'slate'] as StickyNoteColor[]).map((clr) => (
                    <button
                      key={clr}
                      type="button"
                      onClick={() => handleUpdateActiveNote({ color: clr })}
                      className={`w-3.5 h-3.5 rounded-full border transition cursor-pointer ${
                        clr === 'amber'
                          ? 'bg-amber-400 border-amber-500'
                          : clr === 'emerald'
                          ? 'bg-emerald-400 border-emerald-500'
                          : clr === 'rose'
                          ? 'bg-rose-400 border-rose-500'
                          : clr === 'purple'
                          ? 'bg-purple-400 border-purple-500'
                          : 'bg-slate-500 border-slate-600'
                      } ${activeNote.color === clr ? 'scale-125 ring-2 ring-slate-800' : 'opacity-70 hover:opacity-100'}`}
                      title={clr}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Templates & Mode Switcher */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
              {/* Mode: Free text vs Checklist */}
              <div className="flex items-center bg-white/80 p-0.5 rounded-xl border border-slate-200 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => handleUpdateActiveNote({ mode: 'text' })}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    activeNote.mode === 'text'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AlignLeft className="w-3 h-3" />
                  <span>{isRTL ? 'دەق' : 'Memo'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateActiveNote({ mode: 'checklist' })}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                    activeNote.mode === 'checklist'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListCheck className="w-3 h-3" />
                  <span>{isRTL ? 'هەنگاوەکان' : 'Checklist'}</span>
                  {activeNote.checklist?.length > 0 && (
                    <span className="text-[9px] px-1 rounded-full bg-slate-200 text-slate-800">
                      {activeNote.checklist.filter((c) => c.completed).length}/{activeNote.checklist.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tag with Holding Company */}
              <select
                value={activeNote.companyId || ''}
                onChange={(e) => handleUpdateActiveNote({ companyId: e.target.value || undefined })}
                className="bg-white/80 border border-slate-200 text-slate-800 rounded-xl px-2 py-1 text-[10px] font-medium focus:outline-none cursor-pointer max-w-[130px] truncate"
              >
                <option value="">{isRTL ? 'هەموو هۆلدینگ' : 'No Company Tag'}</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Template Presets for Executive Action */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                {isRTL ? 'داڕشتە:' : 'Templates:'}
              </span>
              <button
                type="button"
                onClick={() => applyTemplate('po')}
                className="px-2 py-0.5 rounded-lg bg-white/70 hover:bg-white text-slate-700 hover:text-amber-900 border border-slate-200 text-[10px] font-medium shrink-0 transition cursor-pointer"
              >
                {isRTL ? 'فەرمانی کڕین' : 'PO Review'}
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('board')}
                className="px-2 py-0.5 rounded-lg bg-white/70 hover:bg-white text-slate-700 hover:text-purple-900 border border-slate-200 text-[10px] font-medium shrink-0 transition cursor-pointer"
              >
                {isRTL ? 'دەستەی کارگێڕی' : 'Board Prep'}
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('risk')}
                className="px-2 py-0.5 rounded-lg bg-white/70 hover:bg-white text-slate-700 hover:text-rose-900 border border-slate-200 text-[10px] font-medium shrink-0 transition cursor-pointer"
              >
                {isRTL ? 'مەترسی ML' : 'Risk Sentinel'}
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('gm')}
                className="px-2 py-0.5 rounded-lg bg-white/70 hover:bg-white text-slate-700 hover:text-emerald-900 border border-slate-200 text-[10px] font-medium shrink-0 transition cursor-pointer"
              >
                {isRTL ? 'تەلەفۆنی GM' : 'Call GM'}
              </button>
            </div>

            {/* Content Mode 1: Checklist Mode */}
            {activeNote.mode === 'checklist' && (
              <div className="space-y-2">
                {/* List of items */}
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {(!activeNote.checklist || activeNote.checklist.length === 0) && (
                    <p className="text-xs text-slate-400 italic py-2 text-center">
                      {isRTL ? 'هیچ خاڵێک زیاد نەکراوە. لە خوارەوە خاڵێک بنووسە.' : 'No checklist items yet. Add one below.'}
                    </p>
                  )}
                  {(activeNote.checklist || []).map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white/70 hover:bg-white border border-slate-200/70 transition"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleChecklistItem(item.id)}
                        className="flex items-center gap-2 flex-1 text-left rtl:text-right cursor-pointer"
                      >
                        {item.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span
                          className={`text-xs transition ${
                            item.completed
                              ? 'line-through text-slate-400 font-normal'
                              : 'text-slate-800 font-semibold'
                          }`}
                        >
                          {item.text}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteChecklistItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new checklist item input */}
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                    placeholder={isRTL ? 'هەنگاوێکی نوێ زیادبکە + ئینتەر دابگرە...' : 'Add reminder item & press Enter...'}
                    className="flex-1 bg-white/90 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                  >
                    {isRTL ? 'زیادکردن' : 'Add'}
                  </button>
                </div>

                {/* Optional additional text area in checklist mode */}
                <div>
                  <textarea
                    rows={2}
                    value={activeNote.content}
                    onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                    placeholder={isRTL ? 'تێبینی زیاتر، کاتی پەیوەندی، وردەکاری خاوەن...' : 'Optional memo notes or extra context...'}
                    className="w-full bg-white/60 border border-slate-200/80 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono resize-none"
                  />
                </div>
              </div>
            )}

            {/* Content Mode 2: Freeform Memo Notepad */}
            {activeNote.mode === 'text' && (
              <div>
                <textarea
                  rows={7}
                  value={activeNote.content}
                  onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                  placeholder={
                    isRTL
                      ? 'یاداشتی گرنگ بنووسە: بۆ نموونە پێداچوونەوە بە گرێبەستەکان، پەیوەندی بە بەڕێوەبەری کارگە، بڕیار لەسەر خەرجی کتوپڕ...'
                      : 'Draft quick thoughts, executive directives, urgent reminders, questions for GMs, or notes before signing...'
                  }
                  className="w-full bg-white/80 border border-slate-300/80 rounded-2xl p-3 text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium resize-none shadow-inner"
                />
              </div>
            )}

            {/* Footer Control Bar with Actions & Storage Preference */}
            <div className="pt-2 border-t border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px]">
                    {isRTL ? `پارێزراوە لە دانیشتن (${lastSavedTime})` : `Saved in session (${lastSavedTime})`}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopyNote}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 text-[10px] font-bold shadow-2xs transition cursor-pointer"
                    title="Copy note to clipboard"
                  >
                    {copyFeedback ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">{isRTL ? 'کۆپیکرا!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>{isRTL ? 'کۆپی' : 'Copy'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadNote}
                    className="p-1 rounded-lg bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs transition cursor-pointer"
                    title={isRTL ? 'داگرتن وەک فایل' : 'Export Note'}
                  >
                    <Download className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteNote(activeNote.id)}
                    className="p-1 rounded-lg bg-white/80 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 shadow-2xs transition cursor-pointer"
                    title={isRTL ? 'سڕینەوەی ئەم یاداشتە' : 'Delete Memo'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Persistence Toggle Option */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 bg-white/40 px-2 py-1 rounded-lg border border-slate-200/50">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={persistAcrossSessions}
                    onChange={handleTogglePersistence}
                    className="w-3 h-3 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>
                    {isRTL
                      ? 'هێشتنەوە لە دوای داخستنی وێبگەڕیش (Persistent LocalStorage)'
                      : 'Keep even after closing browser tab'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
