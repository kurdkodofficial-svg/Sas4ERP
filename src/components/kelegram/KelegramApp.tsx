import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Smile,
  Search,
  MoreVertical,
  Phone,
  Video,
  Pin,
  Reply,
  Check,
  CheckCheck,
  Download,
  FileText,
  Volume2,
  Play,
  Pause,
  Flame,
  Heart,
  ThumbsUp,
  X,
  Share2,
  Bell,
  BellOff,
  Moon,
  Sun,
  Users,
  Radio,
  Bot,
  Bookmark,
  Building2,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Plus,
  ShieldCheck,
  Crown,
  FileSpreadsheet,
  FileImage,
  FolderArchive,
  Maximize2,
  Minimize2,
  Copy,
  Trash2,
  Forward,
  Filter,
  SlidersHorizontal,
  MessageSquare
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { getApiUrl } from '../../utils/apiConfig';
import {
  KelegramChat,
  KelegramMessage,
  KelegramFolder,
  KelegramSticker,
  KelegramAttachment
} from './types';
import {
  INITIAL_KELEGRAM_CHATS,
  INITIAL_KELEGRAM_MESSAGES,
  INITIAL_KELEGRAM_STICKERS
} from './mockData';

// Sound effect synthesizer using Web Audio API for Telegram pops & chimes
const playTelegramSound = (type: 'send' | 'receive' | 'record' | 'pop') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } else if (type === 'receive' || type === 'pop') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } else if (type === 'record') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (err) {
    // Ignore audio autoplay restrictions
  }
};

interface KelegramAppProps {
  isCompactMode?: boolean;
  onClose?: () => void;
}

export const KelegramApp: React.FC<KelegramAppProps> = ({ isCompactMode = false, onClose }) => {
  const {
    companies,
    projects,
    purchaseOrders,
    anomalyAlerts,
    currentUser,
    startCallWithManager
  } = useERP();

  const { language, isRtl } = useLanguage();

  // State
  const [chats, setChats] = useState<KelegramChat[]>(() => {
    try {
      const saved = localStorage.getItem('kelegram_chats_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_KELEGRAM_CHATS;
  });

  const [activeChatId, setActiveChatId] = useState<string>('chat-channel-holding');
  const [messagesMap, setMessagesMap] = useState<Record<string, KelegramMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('kelegram_messages_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_KELEGRAM_MESSAGES;
  });

  const [activeFolder, setActiveFolder] = useState<KelegramFolder>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT' | 'HOLDING_DIRECTIVE'>('NORMAL');
  const [replyingMessage, setReplyingMessage] = useState<KelegramMessage | null>(null);
  
  // UI Panels
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false);
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState<boolean>(false);
  const [isSearchInChatOpen, setIsSearchInChatOpen] = useState<boolean>(false);
  const [chatSearchKeyword, setChatSearchKeyword] = useState<string>('');
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voiceProgress, setVoiceProgress] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState<boolean>(false);
  const [newChatType, setNewChatType] = useState<'group' | 'channel'>('group');
  const [newChatName, setNewChatName] = useState<string>('');
  const [newChatDesc, setNewChatDesc] = useState<string>('');

  // Context Menu & Quick Action States (Right-Click Telegram Menu)
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    message: KelegramMessage;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [forwardModalMessage, setForwardModalMessage] = useState<KelegramMessage | null>(null);
  const [forwardSearchQuery, setForwardSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global Left Panel Search states & filter scope
  const [globalSearchFilter, setGlobalSearchFilter] = useState<'all' | 'contact' | 'message' | 'channel' | 'group' | 'direct' | 'bot'>('all');
  const leftSearchInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<any>(null);
  const voicePlayerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global shortcut (Ctrl+K or /) to focus Left Panel search bar
  useEffect(() => {
    const handleGlobalSearchKey = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputFocused = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        leftSearchInputRef.current?.focus();
        leftSearchInputRef.current?.select();
      } else if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        leftSearchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalSearchKey);
    return () => window.removeEventListener('keydown', handleGlobalSearchKey);
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('kelegram_chats_v1', JSON.stringify(chats));
    } catch {}
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem('kelegram_messages_v1', JSON.stringify(messagesMap));
    } catch {}
  }, [messagesMap]);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesMap, activeChatId]);

  // Active chat details
  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const activeMessages = (messagesMap[activeChatId] || []).filter(msg => {
    if (!chatSearchKeyword.trim()) return true;
    return msg.text?.toLowerCase().includes(chatSearchKeyword.toLowerCase());
  });

  // Global Search Filtering across Contacts, Message Content, and Chat Types
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredChats = chats
    .map(chat => {
      if (!normalizedQuery) {
        return {
          ...chat,
          _searchMatch: undefined,
        };
      }

      // 1. Contact Name & Metadata match
      const matchedByContact =
        chat.name.toLowerCase().includes(normalizedQuery) ||
        Boolean(chat.nameKu && chat.nameKu.toLowerCase().includes(normalizedQuery)) ||
        Boolean(chat.nameAr && chat.nameAr.toLowerCase().includes(normalizedQuery)) ||
        Boolean(chat.username && chat.username.toLowerCase().includes(normalizedQuery)) ||
        Boolean(chat.companyName && chat.companyName.toLowerCase().includes(normalizedQuery)) ||
        Boolean(chat.bio && chat.bio.toLowerCase().includes(normalizedQuery)) ||
        Boolean(chat.phone && chat.phone.toLowerCase().includes(normalizedQuery));

      // 2. Chat Type match (explicit type or localized keywords)
      const typeLower = chat.type.toLowerCase();
      const matchedByType =
        typeLower.includes(normalizedQuery) ||
        (chat.type === 'channel' && (normalizedQuery.includes('channel') || normalizedQuery.includes('کەناڵ') || normalizedQuery.includes('قناة') || normalizedQuery === 'چەناڵ')) ||
        (chat.type === 'group' && (normalizedQuery.includes('group') || normalizedQuery.includes('گروپ') || normalizedQuery.includes('مجموعة') || normalizedQuery === 'گرووپ')) ||
        (chat.type === 'direct' && (normalizedQuery.includes('direct') || normalizedQuery.includes('بەڕێوەبەر') || normalizedQuery.includes('مباشر') || normalizedQuery.includes('پەیوەندی') || normalizedQuery.includes('contact') || normalizedQuery.includes('کەس'))) ||
        (chat.type === 'bot' && (normalizedQuery.includes('bot') || normalizedQuery.includes('بۆت') || normalizedQuery.includes('بوت'))) ||
        (chat.type === 'saved' && (normalizedQuery.includes('saved') || normalizedQuery.includes('پاشەکەوت') || normalizedQuery.includes('محفوظ')));

      // 3. Message Content match (search full conversation history and last message)
      let matchedByMessage = chat.lastMessageText.toLowerCase().includes(normalizedQuery);
      let matchingSnippet: string | undefined = matchedByMessage ? chat.lastMessageText : undefined;
      let matchingTimestamp: string | undefined = matchedByMessage ? chat.lastMessageTime : undefined;

      const chatMsgs = messagesMap[chat.id] || [];
      for (let i = chatMsgs.length - 1; i >= 0; i--) {
        const msg = chatMsgs[i];
        const textMatch = msg.text && msg.text.toLowerCase().includes(normalizedQuery);
        const fileMatch = msg.attachment && msg.attachment.name.toLowerCase().includes(normalizedQuery);
        const senderMatch = msg.senderName && msg.senderName.toLowerCase().includes(normalizedQuery);

        if (textMatch || fileMatch || senderMatch) {
          matchedByMessage = true;
          matchingSnippet = msg.text || (msg.attachment ? `📎 ${msg.attachment.name}` : msg.senderName);
          matchingTimestamp = msg.timestamp;
          break;
        }
      }

      const isMatched = matchedByContact || matchedByMessage || matchedByType;

      return {
        ...chat,
        _searchMatch: {
          matchedByContact,
          matchedByMessage,
          matchedByType,
          matchingSnippet,
          matchingTimestamp,
          isMatched,
        },
      };
    })
    .filter(chat => {
      // When a query is entered, filter by match and selected scope
      if (normalizedQuery) {
        const match = chat._searchMatch;
        if (!match || !match.isMatched) return false;

        // Apply active search filter scope
        if (globalSearchFilter === 'contact' && !match.matchedByContact) return false;
        if (globalSearchFilter === 'message' && !match.matchedByMessage) return false;
        if (globalSearchFilter === 'channel' && chat.type !== 'channel') return false;
        if (globalSearchFilter === 'group' && chat.type !== 'group') return false;
        if (globalSearchFilter === 'direct' && chat.type !== 'direct') return false;
        if (globalSearchFilter === 'bot' && chat.type !== 'bot') return false;
      } else {
        // If no search query, filter strictly by selected folder
        if (activeFolder === 'direct') return chat.type === 'direct';
        if (activeFolder === 'groups') return chat.type === 'group';
        if (activeFolder === 'channels') return chat.type === 'channel';
        if (activeFolder === 'bots') return chat.type === 'bot';
        if (activeFolder === 'saved') return chat.type === 'saved';
      }

      return true;
    });

  // Voice note recording simulation
  const startVoiceRecording = () => {
    setIsRecordingVoice(true);
    setRecordingSeconds(0);
    playTelegramSound('record');
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
  };

  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const sendVoiceNote = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    const duration = Math.max(1, recordingSeconds);
    setIsRecordingVoice(false);
    setRecordingSeconds(0);

    const randomWaveform = Array.from({ length: 24 }, () => Math.floor(Math.random() * 80) + 20);

    const newMsg: KelegramMessage = {
      id: `msg-voice-${Date.now()}`,
      chatId: activeChatId,
      senderId: currentUser.id || 'user-owner',
      senderName: language === 'ku' ? 'تۆ' : 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      isOutgoing: true,
      voiceNote: {
        durationSec: duration,
        waveform: randomWaveform,
      },
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));

    updateChatLastMessage(activeChatId, language === 'ku' ? '🎤 دەنگی تۆمارکراو' : '🎤 Voice message');
    playTelegramSound('send');
  };

  // Voice playback simulation
  const togglePlayVoice = (msgId: string, durationSec: number) => {
    if (playingVoiceId === msgId) {
      if (voicePlayerRef.current) clearInterval(voicePlayerRef.current);
      setPlayingVoiceId(null);
      setVoiceProgress(0);
    } else {
      if (voicePlayerRef.current) clearInterval(voicePlayerRef.current);
      setPlayingVoiceId(msgId);
      setVoiceProgress(0);
      playTelegramSound('pop');
      const stepMs = 100;
      const totalSteps = (durationSec * 1000) / stepMs;
      let currentStep = 0;

      voicePlayerRef.current = setInterval(() => {
        currentStep++;
        const pct = Math.min(100, Math.round((currentStep / totalSteps) * 100));
        setVoiceProgress(pct);
        if (currentStep >= totalSteps) {
          clearInterval(voicePlayerRef.current);
          setPlayingVoiceId(null);
          setVoiceProgress(0);
        }
      }, stepMs);
    }
  };

  // Helper to update chat list snippet
  const updateChatLastMessage = (chatId: string, textSnippet: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          lastMessageText: textSnippet,
          lastMessageTime: timeStr,
          unreadCount: 0,
        };
      }
      return c;
    }));
  };

  // Send standard text message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const isDirective = priority === 'HOLDING_DIRECTIVE';
    const textToSend = inputText.trim();
    const newMsg: KelegramMessage = {
      id: `msg-${Date.now()}`,
      chatId: activeChatId,
      senderId: currentUser.id || 'user-owner',
      senderName: language === 'ku' ? `${currentUser.name} (تۆ)` : `${currentUser.name} (You)`,
      senderAvatar: '👑',
      senderRole: currentUser.role,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      isOutgoing: true,
      isDirective,
      priority,
      replyTo: replyingMessage ? {
        id: replyingMessage.id,
        senderName: replyingMessage.senderName,
        text: replyingMessage.text || (language === 'ku' ? 'میدیا/دەنگ' : 'Media/Voice'),
      } : undefined,
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));

    updateChatLastMessage(activeChatId, textToSend);
    setInputText('');
    setReplyingMessage(null);
    playTelegramSound('send');

    // Trigger Bot Response if in @KelegramERPBot
    if (activeChat.type === 'bot' || activeChat.id === 'chat-bot-erp') {
      handleBotInteraction(textToSend);
    }
  };

  // Send Sticker
  const handleSendSticker = (sticker: KelegramSticker) => {
    const newMsg: KelegramMessage = {
      id: `msg-stk-${Date.now()}`,
      chatId: activeChatId,
      senderId: currentUser.id || 'user-owner',
      senderName: language === 'ku' ? 'تۆ' : 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      isOutgoing: true,
      sticker,
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));

    updateChatLastMessage(activeChatId, `[ستیكەر: ${sticker.labelKu}]`);
    setIsEmojiPickerOpen(false);
    playTelegramSound('send');
  };

  // Bot response engine
  const handleBotInteraction = (cmd: string) => {
    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);
      let replyContent = '';
      let replyButtons: any = undefined;

      const normalized = cmd.trim().toLowerCase();

      if (normalized.includes('/start') || normalized.includes('دەستپێک')) {
        replyContent = `سڵاو بەڕێزم! کەڵەگرام ئامادەیە بۆ خزمەتکردن 🤖\nدەتوانیت پرسیار لەسەر بودجە، کڕین، پرۆژەکان، و زەنگی ئاگاداری بکەیت.`;
        replyButtons = [
          [{ text: '📊 کورتەی دۆخ / Status', command: '/status' }, { text: '💰 بودجە / Budget', command: '/budget' }],
          [{ text: '🏗️ پڕۆژەکان / Projects', command: '/projects' }, { text: '⚠️ هۆشدارییەکان / Alerts', command: '/alerts' }],
        ];
      } else if (normalized.includes('/status') || normalized.includes('دۆخ')) {
        const totalPendingPOs = purchaseOrders.filter(p => p.status === 'PENDING_OWNER_APPROVAL').length;
        const totalAnomalies = anomalyAlerts.filter(a => a.status === 'TRIGGERED').length;
        replyContent = `📊 دۆخی گشتی هۆلدینگ لەم چرکەیەدا:\n\n• کۆمپانیاکان: ${companies.length} کۆمپانیای چالاک\n• پڕۆژە ستراتیژییەکان: ${projects.length} پڕۆژە\n• داواکاری چاوەڕوانی واژۆ: ${totalPendingPOs} کڕین\n• هۆشدارییەکانی AI Sentinel: ${totalAnomalies} حالەت\n\nسیستەم لە دۆخی ئاسایی کارکردندایە ✅`;
      } else if (normalized.includes('/budget') || normalized.includes('بودجە')) {
        const totalBudget = companies.reduce((acc, c) => acc + (c.annualBudgetUSD || 0), 0);
        const totalSpent = companies.reduce((acc, c) => acc + (c.spentUSD || 0), 0);
        const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
        replyContent = `💰 کورتەی دارایی هۆلدینگ:\n\n• کۆی بودجەی پەسەندکراو: $${totalBudget.toLocaleString()}\n• کۆی خەرجکراو: $${totalSpent.toLocaleString()} (${pct}%)\n• ماوەی بەردەست: $${(totalBudget - totalSpent).toLocaleString()}\n\nچاودێری ورد بەپێی بەشەکان لە تابی Finance بەردەستە.`;
      } else if (normalized.includes('/projects') || normalized.includes('پڕۆژە')) {
        const projectNames = projects.slice(0, 4).map(p => `• ${p.name} (${p.progressPercentage}% تەواوبوو)`).join('\n');
        replyContent = `🏗️ گرنگترین پڕۆژەکانی ئێستا:\n\n${projectNames}\n\nبۆ بینینی هێڵکاری گانت، کلیک لە بەشی Gantt & Reports بکە.`;
      } else if (normalized.includes('/alerts') || normalized.includes('ئاگاداری')) {
        const pendingAlerts = anomalyAlerts.slice(0, 3).map(a => `⚠️ ${a.titleKu || a.title}`).join('\n');
        replyContent = `⚡ چاودێری زیرەکی دەستکرد (AI Sentinel):\n\n${pendingAlerts || 'هیچ هۆشدارییەکی مەترسیدار نییە.'}`;
      } else {
        replyContent = `پەیامەکەت گەیشت بە سیستەم! بۆ بەدەستهێنانی داتای ڕاستەوخۆ دەتوانیت ئەم فەرمانانە بەکاربێنیت:\n/status - کورتەی دۆخ\n/budget - باڵانسی بودجە\n/projects - پڕۆژەکان\n/alerts - زەنگی مەترسی`;
      }

      const botMsg: KelegramMessage = {
        id: `msg-bot-${Date.now()}`,
        chatId: activeChatId,
        senderId: 'bot-erp',
        senderName: 'بۆتی هۆشمەندی کەڵەگرام',
        senderAvatar: '🤖',
        text: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
        isOutgoing: false,
        botButtons: replyButtons,
      };

      setMessagesMap(prev => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), botMsg],
      }));
      updateChatLastMessage(activeChatId, replyContent.slice(0, 45) + '...');
      playTelegramSound('receive');
    }, 700);
  };

  // Add Reaction
  const handleAddReaction = (msgId: string, emoji: string) => {
    setMessagesMap(prev => {
      const currentList = prev[activeChatId] || [];
      const updated = currentList.map(msg => {
        if (msg.id === msgId) {
          const currentReactions = { ...(msg.reactions || {}) };
          currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
          return {
            ...msg,
            reactions: currentReactions,
          };
        }
        return msg;
      });
      return { ...prev, [activeChatId]: updated };
    });
    playTelegramSound('pop');
  };

  // File Attachment Upload Simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.name.endsWith('.pdf')
      ? 'pdf'
      : file.name.match(/\.(png|jpg|jpeg|webp)$/i)
        ? 'image'
        : file.name.match(/\.(xlsx|xls|csv)$/i)
          ? 'sheet'
          : 'doc';

    const fileSizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const newMsg: KelegramMessage = {
      id: `msg-file-${Date.now()}`,
      chatId: activeChatId,
      senderId: currentUser.id || 'user-owner',
      senderName: language === 'ku' ? 'تۆ' : 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      isOutgoing: true,
      text: language === 'ku' ? `فایلی هاوپێچ: ${file.name}` : `Attached file: ${file.name}`,
      attachment: {
        name: file.name,
        size: fileSizeStr,
        type: fileType as any,
      },
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));

    updateChatLastMessage(activeChatId, `📎 ${file.name}`);
    playTelegramSound('send');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Toast Notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  // Close context menu on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setForwardModalMessage(null);
      }
    };
    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu]);

  // Context Menu Trigger on Message Right-Click
  const handleMessageContextMenu = (e: React.MouseEvent, msg: KelegramMessage) => {
    e.preventDefault();
    e.stopPropagation();

    const menuWidth = 240;
    const menuHeight = 310;

    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = Math.max(16, window.innerWidth - menuWidth - 16);
    }
    if (y + menuHeight > window.innerHeight) {
      y = Math.max(16, window.innerHeight - menuHeight - 16);
    }

    setContextMenu({ x, y, message: msg });
  };

  // Copy Message Text to Clipboard
  const handleCopyMessageText = (msg: KelegramMessage) => {
    const textToCopy =
      msg.text ||
      (msg.attachment ? `${msg.attachment.name} (${msg.attachment.size})` : msg.voiceNote ? 'Voice Note' : msg.sticker ? msg.sticker.emoji : '');

    if (textToCopy) {
      try {
        if (navigator?.clipboard?.writeText) {
          navigator.clipboard.writeText(textToCopy);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = textToCopy;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
      } catch {}
      showToast(
        language === 'ku'
          ? 'دەقی پەیامەکە لەبەرگیرایەوە 📋'
          : language === 'ar'
          ? 'تم نسخ نص الرسالة 📋'
          : 'Message text copied to clipboard 📋'
      );
      playTelegramSound('pop');
    }
    setContextMenu(null);
  };

  // Delete Message for Everyone
  const handleDeleteForEveryone = (msgId: string) => {
    setMessagesMap(prev => {
      const list = prev[activeChatId] || [];
      const updated = list.filter(m => m.id !== msgId);
      const lastMsg = updated[updated.length - 1];
      if (lastMsg) {
        updateChatLastMessage(activeChatId, lastMsg.text || 'پەیام');
      } else {
        updateChatLastMessage(activeChatId, '');
      }
      return { ...prev, [activeChatId]: updated };
    });

    // Unpin if the deleted message was pinned
    const msgToDelete = (messagesMap[activeChatId] || []).find(m => m.id === msgId);
    if (msgToDelete && activeChat.pinnedMessage === msgToDelete.text) {
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, pinnedMessage: undefined } : c));
    }

    playTelegramSound('pop');
    showToast(
      language === 'ku'
        ? 'پەیامەکە بۆ هەمووان سڕایەوە 🗑️'
        : language === 'ar'
        ? 'تم حذف الرسالة للجميع 🗑️'
        : 'Message deleted for everyone 🗑️'
    );
    setContextMenu(null);
  };

  // Toggle Pin message in chat
  const handleTogglePinMessage = (msg: KelegramMessage) => {
    const isPinned = activeChat.pinnedMessage === msg.text;
    const newPinned = isPinned ? undefined : msg.text;
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, pinnedMessage: newPinned } : c));
    playTelegramSound('pop');
    showToast(
      isPinned
        ? (language === 'ku' ? 'پەیامەکە لە جێگیرکردن لادرا 📌' : 'Message unpinned')
        : (language === 'ku' ? 'پەیامەکە لە سەرەوە جێگیرکرا 📌' : 'Message pinned to top')
    );
    setContextMenu(null);
  };

  // Forward message to a destination chat
  const handleForwardMessageToChat = (targetChatId: string) => {
    if (!forwardModalMessage) return;

    const targetChat = chats.find(c => c.id === targetChatId);
    const forwardSender = forwardModalMessage.senderName;

    const forwardedMsg: KelegramMessage = {
      id: `msg-fwd-${Date.now()}`,
      chatId: targetChatId,
      senderId: currentUser.id || 'user-owner',
      senderName: language === 'ku' ? 'تۆ' : 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      isOutgoing: true,
      text: forwardModalMessage.text,
      attachment: forwardModalMessage.attachment,
      sticker: forwardModalMessage.sticker,
      voiceNote: forwardModalMessage.voiceNote,
      replyTo: {
        id: forwardModalMessage.id,
        senderName: `${language === 'ku' ? 'پێشەوەکراو لە' : language === 'ar' ? 'محوّل من' : 'Forwarded from'}: ${forwardSender}`,
        text: forwardModalMessage.text || (forwardModalMessage.attachment ? forwardModalMessage.attachment.name : 'فایل'),
      },
    };

    setMessagesMap(prev => ({
      ...prev,
      [targetChatId]: [...(prev[targetChatId] || []), forwardedMsg],
    }));

    updateChatLastMessage(targetChatId, `[پێشەوەکراو] ${forwardModalMessage.text || 'پەیام'}`.slice(0, 45));
    playTelegramSound('send');

    const targetName = targetChat ? (language === 'ku' && targetChat.nameKu ? targetChat.nameKu : targetChat.name) : 'گفتوگۆ';
    showToast(
      language === 'ku'
        ? `پەیامەکە بە سەرکەوتوویی پێشەوەکرا بۆ (${targetName}) 🚀`
        : language === 'ar'
        ? `تمت إعادة التوجيه إلى (${targetName}) 🚀`
        : `Message forwarded to (${targetName}) 🚀`
    );

    setForwardModalMessage(null);
  };

  // Create new Group / Channel
  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim()) return;

    const newId = `chat-${newChatType}-${Date.now()}`;
    const newChat: KelegramChat = {
      id: newId,
      type: newChatType,
      name: newChatName,
      nameKu: newChatName,
      avatar: newChatType === 'channel' ? '📢' : '👥',
      avatarBg: newChatType === 'channel' ? 'bg-sky-600 text-white' : 'bg-indigo-600 text-white',
      onlineStatus: newChatType === 'channel' ? '1 سەبسکرایبەر (تۆ)' : '١ ئەندام (تۆ)',
      unreadCount: 0,
      lastMessageText: language === 'ku' ? 'کەناڵ/گروپ دروستکرا.' : 'Created group/channel.',
      lastMessageTime: 'ئێستا',
      folder: newChatType === 'channel' ? 'channels' : 'groups',
      bio: newChatDesc || (language === 'ku' ? 'گروپ یان کەناڵی نوێی کەڵەگرام' : 'New Kelegram space'),
      username: newChatName.toLowerCase().replace(/\s+/g, '_'),
    };

    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newId);
    setMessagesMap(prev => ({
      ...prev,
      [newId]: [
        {
          id: `msg-welcome-${Date.now()}`,
          chatId: newId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: language === 'ku'
            ? `بەخێربێن بۆ ${newChatName}! پەیام یان ڕاگەیاندن بنێرە.`
            : `Welcome to ${newChatName}!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          isOutgoing: true,
        },
      ],
    }));

    setIsNewChatModalOpen(false);
    setNewChatName('');
    setNewChatDesc('');
    playTelegramSound('pop');
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`rounded-3xl border overflow-hidden shadow-2xl transition-all duration-300 flex flex-col ${
        isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-[#eef2f5] border-slate-300/80 text-slate-800'
      } ${isCompactMode ? 'h-[620px] w-full' : 'h-[calc(100vh-140px)] min-h-[680px] w-full'}`}
    >
      {/* Kelegram Global Top Bar */}
      <div className="bg-[#2AABEE] text-white px-4 py-2.5 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          {/* Telegram Iconic Paper Plane / Kelegram Brand Icon */}
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner relative group">
            <Send className="w-5 h-5 -rotate-45 -translate-y-0.5 translate-x-0.5 text-white" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#2AABEE]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                {language === 'ku' ? 'کەڵەگرام' : language === 'ar' ? 'كَلَغرام' : 'Kelegram'}
              </h2>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Telegram Recreation
              </span>
            </div>
            <p className="text-[11px] text-white/80 leading-none">
              {language === 'ku'
                ? 'نامەبەری پارێزراو و خێرای هۆلدینگ بۆ بەڕێوەبەران، کەناڵەکان و بۆتەکان'
                : 'Enterprise Telegram with Voice Notes, Channels, Groups & Smart Bots'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Create new channel/group */}
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer"
            title="Create Group / Channel"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'ku' ? 'کەناڵ/گروپ' : 'New Chat'}</span>
          </button>

          {/* Download Codebase ZIP */}
          <a
            href={getApiUrl('/api/export-codebase-zip')}
            download="SAS4ERP-Full-Source-Code.zip"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer"
            title={language === 'ku' ? 'داگرتنی تەواوی کۆدەکانی سیستم بە فایلی ZIP' : 'Download Complete Codebase ZIP'}
          >
            <Download className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden md:inline">{language === 'ku' ? 'کۆدەکان (ZIP)' : 'Code ZIP'}</span>
          </a>

          {/* Dark / Light Telegram Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(prev => !prev)}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            title={isDarkMode ? 'Light Mode' : 'Night Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Close compact drawer button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/15 hover:bg-rose-500 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Telegram Split Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* ========================================================= */}
        {/* LEFT PANEL: Chat List, Search, & Folders (Telegram Sidebar) */}
        {/* ========================================================= */}
        <div
          className={`w-full sm:w-[340px] md:w-[380px] shrink-0 border-r flex flex-col transition-all duration-300 ${
            isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* ========================================================= */}
          {/* GLOBAL SEARCH BAR INSIDE LEFT PANEL */}
          {/* ========================================================= */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
            {/* Search Input Box */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all ${
                searchQuery
                  ? 'ring-2 ring-[#2AABEE]/40 border-[#2AABEE]'
                  : isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-slate-200 focus-within:border-blue-500'
                  : 'bg-slate-100 border-slate-200 text-slate-800 focus-within:border-blue-500 focus-within:bg-white'
              }`}
            >
              <Search className={`w-4 h-4 shrink-0 transition-colors ${searchQuery ? 'text-[#2AABEE]' : 'text-slate-400'}`} />
              <input
                ref={leftSearchInputRef}
                type="text"
                placeholder={
                  language === 'ku'
                    ? 'گەڕان بەپێی ناو، نێو پەیامەکان، یان جۆری چات...'
                    : language === 'ar'
                    ? 'بحث بالاسم، نص الرسائل، أو نوع المحادثة...'
                    : 'Search by contact name, message content, or chat type...'
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none placeholder-slate-400 font-medium"
              />
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    leftSearchInputRef.current?.focus();
                  }}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  title={language === 'ku' ? 'سڕینەوەی گەڕان' : 'Clear search'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-500 font-mono font-bold shrink-0">
                  Ctrl K
                </kbd>
              )}
            </div>

            {/* Quick Filter Scope Tabs (All, Contact, Message, Chat Types) */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
              {[
                { id: 'all', labelKu: 'هەموو', labelEn: 'All', icon: Sparkles },
                { id: 'contact', labelKu: '👤 ناو/کەس', labelEn: 'Contacts', icon: Users },
                { id: 'message', labelKu: '💬 پەیامەکان', labelEn: 'Messages', icon: MessageSquare },
                { id: 'channel', labelKu: '📢 کەناڵ', labelEn: 'Channels', icon: Radio },
                { id: 'group', labelKu: '👥 گروپ', labelEn: 'Groups', icon: Users },
                { id: 'bot', labelKu: '🤖 بۆت', labelEn: 'Bots', icon: Bot },
              ].map(scope => {
                const isScopeActive = globalSearchFilter === scope.id;
                return (
                  <button
                    key={scope.id}
                    onClick={() => setGlobalSearchFilter(scope.id as any)}
                    className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 text-[10px] flex items-center gap-1 ${
                      isScopeActive
                        ? 'bg-[#2AABEE] text-white shadow-xs'
                        : isDarkMode
                        ? 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                    }`}
                  >
                    <span>{language === 'ku' ? scope.labelKu : scope.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Feedback & Results Count Bar */}
            {searchQuery.trim() && (
              <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-slate-100 dark:border-slate-800/60">
                <span className="flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2AABEE] animate-pulse" />
                  <span>
                    {filteredChats.length} {language === 'ku' ? 'گفتوگۆ دۆزرایەوە' : 'conversations found'}
                  </span>
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-blue-500 hover:underline font-bold cursor-pointer"
                >
                  {language === 'ku' ? 'پاککردنەوە' : 'Reset'}
                </button>
              </div>
            )}
          </div>

          {/* Telegram Folders / Tabs (Only visible when not actively searching) */}
          {!searchQuery.trim() && (
            <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar shrink-0 text-xs">
              {[
                { id: 'all', labelKu: 'هەموو', labelEn: 'All', icon: Sparkles },
                { id: 'channels', labelKu: 'کەناڵ', labelEn: 'Channels', icon: Radio },
                { id: 'groups', labelKu: 'گروپەکان', labelEn: 'Groups', icon: Users },
                { id: 'direct', labelKu: 'بەڕێوەبەران', labelEn: 'Direct', icon: Building2 },
                { id: 'bots', labelKu: 'بۆتەکان', labelEn: 'Bots', icon: Bot },
                { id: 'saved', labelKu: 'پاشەکەوت', labelEn: 'Saved', icon: Bookmark },
              ].map(tab => {
                const isActive = activeFolder === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFolder(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#2AABEE] text-white shadow-xs'
                        : isDarkMode
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{language === 'ku' ? tab.labelKu : tab.labelEn}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Chat List Items with Search Highlights & Snippets */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Search className="w-8 h-8 mx-auto opacity-30 text-blue-500" />
                <p className="text-xs font-bold">
                  {language === 'ku'
                    ? `هیچ ئەنجامێک بۆ "${searchQuery}" نەدۆزرایەوە.`
                    : `No conversations found matching "${searchQuery}".`}
                </p>
                <p className="text-[10px] text-slate-500">
                  {language === 'ku'
                    ? 'دەتوانیت بگەڕێیت بەپێی ناوی بەڕێوەبەر، دەقی پەیام یان جۆری چات (کەناڵ، گروپ، بۆت).'
                    : 'Try searching by contact name, message content, or chat type (channel, group, bot).'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setGlobalSearchFilter('all');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
                >
                  {language === 'ku' ? 'پیشاندانی هەموو گفتوگۆکان' : 'Show All Conversations'}
                </button>
              </div>
            ) : (
              filteredChats.map(chat => {
                const isSelected = activeChatId === chat.id;
                const matchInfo = chat._searchMatch;

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setReplyingMessage(null);
                      // Clear unread
                      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
                    }}
                    className={`p-3 rounded-2xl cursor-pointer transition flex items-start gap-3 relative ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                          : 'bg-[#eef7fe] border border-blue-200 text-slate-900'
                        : isDarkMode
                          ? 'hover:bg-slate-800/60 text-slate-300'
                          : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {/* Avatar with Status badge & Chat Type Icon */}
                    <div className="relative shrink-0 mt-0.5">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-xs ${
                          chat.avatarBg || 'bg-blue-500 text-white'
                        }`}
                      >
                        {chat.avatar}
                      </div>
                      {chat.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                      )}
                    </div>

                    {/* Chat Content Snippet */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {language === 'ku' && chat.nameKu ? chat.nameKu : chat.name}
                          </h4>
                          {chat.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          )}
                          {/* Chat Type Badges */}
                          {chat.type === 'channel' && (
                            <span className="text-[9px] px-1 py-0.2 rounded-md bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 font-bold">
                              {language === 'ku' ? 'کەناڵ' : 'Channel'}
                            </span>
                          )}
                          {chat.type === 'group' && (
                            <span className="text-[9px] px-1 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold">
                              {language === 'ku' ? 'گروپ' : 'Group'}
                            </span>
                          )}
                          {chat.type === 'bot' && (
                            <span className="text-[9px] px-1 py-0.2 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold">
                              {language === 'ku' ? 'بۆت' : 'Bot'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {matchInfo?.matchingTimestamp || chat.lastMessageTime}
                        </span>
                      </div>

                      {/* Default Last Message preview */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-snug">
                          {chat.lastMessageText}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          {chat.isPinned && (
                            <Pin className="w-3 h-3 text-slate-400 rotate-45" />
                          )}
                          {chat.unreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-[#2AABEE] text-white text-[10px] font-black min-w-[18px] text-center shadow-xs">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Deep Matched Message Content snippet preview */}
                      {searchQuery.trim() && matchInfo?.matchingSnippet && matchInfo.matchedByMessage && (
                        <div className="mt-1.5 px-2 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1.5 truncate">
                          <MessageSquare className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="font-extrabold shrink-0">
                            {language === 'ku' ? 'هاوتا لە پەیام:' : 'Message match:'}
                          </span>
                          <span className="truncate italic font-medium">"{matchInfo.matchingSnippet}"</span>
                        </div>
                      )}

                      {/* Matched by Contact or Type badge */}
                      {searchQuery.trim() && matchInfo?.matchedByContact && !matchInfo.matchedByMessage && (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/50 dark:border-emerald-800/50">
                            ✓ {language === 'ku' ? 'هاوتای ناوی پەیوەندی' : 'Matched Contact Name'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: Active Conversation & Telegram Chat Area */}
        {/* ========================================================= */}
        <div
          className={`flex-1 flex flex-col relative transition-all duration-300 ${
            isDarkMode ? 'bg-[#0b1329]' : 'bg-[#e5eff5]'
          }`}
          style={{
            backgroundImage: isDarkMode
              ? 'radial-gradient(#1e293b 1px, transparent 1px)'
              : 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {/* Active Chat Telegram Header */}
          <div
            className={`p-3.5 px-5 border-b flex items-center justify-between shadow-xs shrink-0 transition-colors ${
              isDarkMode ? 'bg-[#1e293b]/95 border-slate-800' : 'bg-white/95 border-slate-200'
            }`}
          >
            {/* Contact details + Click to open Drawer */}
            <div
              onClick={() => setIsInfoDrawerOpen(prev => !prev)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold shadow-xs ${
                  activeChat.avatarBg || 'bg-blue-600 text-white'
                }`}
              >
                {activeChat.avatar}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-blue-500 transition">
                    {language === 'ku' && activeChat.nameKu ? activeChat.nameKu : activeChat.name}
                  </h3>
                  {activeChat.isVerified && (
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  {isBotTyping ? (
                    <span className="text-blue-500 font-bold animate-pulse flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {language === 'ku' ? 'خەریکی وەڵامدانەوەیە...' : 'typing...'}
                    </span>
                  ) : (
                    activeChat.onlineStatus
                  )}
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Direct Call / Voice Conference Trigger */}
              {activeChat.managerId && (
                <button
                  onClick={() => {
                    const managerComp = companies.find(c => `gm-${c.id}` === activeChat.managerId);
                    startCallWithManager({
                      id: activeChat.managerId,
                      name: activeChat.name,
                      role: 'General Manager',
                      company: managerComp?.name || activeChat.companyName || 'Subsidiary',
                      phone: activeChat.phone || '+964 750 000 0000',
                      email: 'manager@holding.com',
                      avatar: activeChat.avatar,
                      status: 'Online',
                    });
                  }}
                  className="p-2 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition cursor-pointer"
                  title="Direct Phone Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
              )}

              {/* In-chat search button */}
              <button
                onClick={() => setIsSearchInChatOpen(prev => !prev)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isSearchInChatOpen
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
                title="Search in conversation"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* View contact info drawer */}
              <button
                onClick={() => setIsInfoDrawerOpen(prev => !prev)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isInfoDrawerOpen
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
                title="Chat Details & Info"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Optional Search in Chat Bar */}
          {isSearchInChatOpen && (
            <div className="p-2.5 px-4 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'ku' ? 'پەیڤێک بنووسە بۆ دۆزینەوە لەم چاتەدا...' : 'Search within this chat...'}
                value={chatSearchKeyword}
                onChange={e => setChatSearchKeyword(e.target.value)}
                className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                autoFocus
              />
              {chatSearchKeyword && (
                <button
                  onClick={() => setChatSearchKeyword('')}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Telegram Pinned Message Banner */}
          {activeChat.pinnedMessage && (
            <div
              className={`px-4 py-2 border-b flex items-center justify-between text-xs backdrop-blur-sm cursor-pointer ${
                isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-white/80 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-1 h-7 bg-blue-500 rounded-full shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] font-extrabold text-blue-500 uppercase tracking-wider">
                    {language === 'ku' ? 'پەیامی جێگیرکراو (Pinned)' : 'Pinned Message'}
                  </div>
                  <div className="truncate text-[11px] font-medium">{activeChat.pinnedMessage}</div>
                </div>
              </div>
              <Pin className="w-3.5 h-3.5 text-blue-500 rotate-45 shrink-0" />
            </div>
          )}

          {/* Messages Feed Area */}
          <div
            onScroll={() => {
              if (contextMenu) setContextMenu(null);
            }}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5"
          >
            {activeMessages.map(msg => {
              const isMe = msg.isOutgoing;
              const isDirective = msg.isDirective || msg.priority === 'HOLDING_DIRECTIVE';
              const isUrgent = msg.priority === 'URGENT';

              return (
                <div
                  key={msg.id}
                  onContextMenu={(e) => handleMessageContextMenu(e, msg)}
                  className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Name for Groups & Channels */}
                  {!isMe && (activeChat.type === 'group' || activeChat.type === 'channel') && (
                    <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 px-2 mb-1 flex items-center gap-1">
                      {msg.senderAvatar && <span>{msg.senderAvatar}</span>}
                      <span>{msg.senderName}</span>
                      {msg.senderRole && (
                        <span className="text-[9px] font-normal text-slate-400">({msg.senderRole})</span>
                      )}
                    </span>
                  )}

                  {/* Telegram Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-lg md:max-w-xl p-3.5 rounded-3xl shadow-xs transition-all relative ${
                      isMe
                        ? isDirective
                          ? 'bg-amber-500 text-white rounded-br-xs'
                          : isUrgent
                            ? 'bg-rose-600 text-white rounded-br-xs'
                            : isDarkMode
                              ? 'bg-[#2b5278] text-white rounded-br-xs'
                              : 'bg-[#EFFDDE] text-slate-900 border border-emerald-100 rounded-br-xs'
                        : isDarkMode
                          ? 'bg-[#1e293b] border border-slate-700/80 text-slate-100 rounded-bl-xs'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                    }`}
                  >
                    {/* Holding Directive Gold Banner */}
                    {isDirective && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 mb-1.5 rounded-full bg-white/20 text-white text-[10px] font-black tracking-wide">
                        <Crown className="w-3 h-3 text-amber-200" />
                        <span>{language === 'ku' ? 'فەرمانی خاوەنی هۆلدینگ (DIRECTIVE)' : 'HOLDING DIRECTIVE'}</span>
                      </div>
                    )}

                    {/* Reply Quote Banner inside bubble */}
                    {msg.replyTo && (
                      <div
                        className={`mb-2 p-2 rounded-xl text-xs flex items-center gap-2 border-l-2 ${
                          isMe
                            ? isDarkMode ? 'bg-black/20 border-blue-300' : 'bg-emerald-100/60 border-emerald-600'
                            : isDarkMode ? 'bg-slate-800 border-blue-400' : 'bg-slate-100 border-blue-500'
                        }`}
                      >
                        <Reply className="w-3 h-3 text-blue-500 rotate-180 shrink-0" />
                        <div className="truncate text-[11px]">
                          <span className="font-bold text-blue-500 block">{msg.replyTo.senderName}</span>
                          <span className="opacity-80 truncate block">{msg.replyTo.text}</span>
                        </div>
                      </div>
                    )}

                    {/* Voice Note Player */}
                    {msg.voiceNote && (
                      <div className="flex items-center gap-3 p-1.5 min-w-[220px]">
                        <button
                          onClick={() => togglePlayVoice(msg.id, msg.voiceNote!.durationSec)}
                          className="w-10 h-10 rounded-full bg-[#2AABEE] hover:bg-[#229ED9] text-white flex items-center justify-center shrink-0 shadow-md transition transform active:scale-95 cursor-pointer"
                        >
                          {playingVoiceId === msg.id ? (
                            <Pause className="w-5 h-5 fill-white" />
                          ) : (
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1 space-y-1">
                          {/* Animated Waveform Bars */}
                          <div className="flex items-center gap-0.5 h-6">
                            {msg.voiceNote.waveform.map((bar, idx) => {
                              const isPast = playingVoiceId === msg.id && (idx / msg.voiceNote!.waveform.length) * 100 <= voiceProgress;
                              return (
                                <span
                                  key={idx}
                                  style={{ height: `${Math.max(15, bar)}%` }}
                                  className={`w-1 rounded-full transition-all duration-150 ${
                                    isPast
                                      ? 'bg-blue-600 dark:bg-blue-400'
                                      : isMe
                                        ? 'bg-slate-400/80 dark:bg-white/40'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                            <span>
                              0:{msg.voiceNote.durationSec < 10 ? `0${msg.voiceNote.durationSec}` : msg.voiceNote.durationSec}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider font-sans font-bold">
                              Voice Note
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* File Attachment Card */}
                    {msg.attachment && (
                      <div
                        className={`flex items-center gap-3 p-2.5 rounded-2xl mb-1.5 transition ${
                          isMe
                            ? 'bg-black/10 dark:bg-black/20 text-inherit'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                          {msg.attachment.type === 'pdf' ? (
                            <FileText className="w-5 h-5" />
                          ) : msg.attachment.type === 'sheet' ? (
                            <FileSpreadsheet className="w-5 h-5" />
                          ) : msg.attachment.type === 'image' ? (
                            <FileImage className="w-5 h-5" />
                          ) : (
                            <FolderArchive className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-xs truncate">{msg.attachment.name}</h5>
                          <span className="text-[10px] opacity-70">{msg.attachment.size}</span>
                        </div>
                        <button
                          onClick={() => {
                            // Trigger synthetic download feedback
                            const a = document.createElement('a');
                            a.href = '#';
                            a.innerText = msg.attachment!.name;
                            alert(language === 'ku' ? `فایلی ${msg.attachment!.name} دابەزێندرا.` : `Downloading ${msg.attachment!.name}`);
                          }}
                          className="p-2 rounded-xl bg-white/40 hover:bg-white/80 text-blue-600 transition cursor-pointer"
                          title="Download attachment"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Sticker Card */}
                    {msg.sticker && (
                      <div className="p-2 text-center space-y-1">
                        <div
                          className={`w-28 h-28 mx-auto rounded-3xl bg-gradient-to-tr ${msg.sticker.bgGradient} flex items-center justify-center text-5xl shadow-lg transform hover:scale-105 transition cursor-pointer`}
                        >
                          {msg.sticker.emoji}
                        </div>
                        <span className="text-xs font-black block mt-1 tracking-wide">
                          {language === 'ku' ? msg.sticker.labelKu : msg.sticker.labelEn}
                        </span>
                      </div>
                    )}

                    {/* Text content */}
                    {msg.text && (
                      <p className="text-xs leading-relaxed whitespace-pre-line font-medium break-words">
                        {msg.text}
                      </p>
                    )}

                    {/* Telegram Interactive Bot Inline Buttons */}
                    {msg.botButtons && (
                      <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 space-y-1.5">
                        {msg.botButtons.map((row, rIdx) => (
                          <div key={rIdx} className="grid grid-cols-2 gap-1.5">
                            {row.map((btn, bIdx) => (
                              <button
                                key={bIdx}
                                onClick={() => handleBotInteraction(btn.command)}
                                className="px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/30 text-blue-600 dark:text-blue-300 font-bold text-[11px] transition text-center cursor-pointer active:scale-95 shadow-2xs"
                              >
                                {btn.text}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bottom Metadata: Time, Channel views, Checkmarks */}
                    <div className="flex items-center justify-end gap-2 mt-1 text-[10px] opacity-75">
                      {msg.viewsCount && (
                        <span className="flex items-center gap-0.5 font-mono">
                          👁 {msg.viewsCount.toLocaleString()}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                      {isMe && (
                        <span>
                          {msg.status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Reaction Badges Row */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-2 pt-1">
                        {Object.entries(msg.reactions).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700 text-xs font-bold hover:scale-105 transition cursor-pointer"
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] opacity-90">{count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message Action Bar on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-2 mt-0.5 text-slate-400">
                    <button
                      onClick={() => setReplyingMessage(msg)}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-500 transition cursor-pointer"
                      title="Reply"
                    >
                      <Reply className="w-3.5 h-3.5 rotate-180" />
                    </button>
                    <button
                      onClick={() => handleAddReaction(msg.id, '❤️')}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-500 transition cursor-pointer"
                      title="Heart Reaction"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAddReaction(msg.id, '🔥')}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-500 transition cursor-pointer"
                      title="Flame Reaction"
                    >
                      <Flame className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAddReaction(msg.id, '👍')}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-500 transition cursor-pointer"
                      title="Thumbs Up"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleMessageContextMenu(e, msg)}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                      title={language === 'ku' ? 'کردارەکانی پەیام (کلیکی لای ڕاست)' : 'Message actions (Right-click)'}
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* ========================================================= */}
          {/* BOTTOM TELEGRAM INPUT BAR: Text, Voice, Stickers, Priority */}
          {/* ========================================================= */}
          <div
            className={`p-3 sm:p-4 border-t transition-colors shrink-0 ${
              isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {/* Replying Quote Bar if replying */}
            {replyingMessage && (
              <div
                className={`flex items-center justify-between p-2 mb-2 rounded-xl text-xs border-l-4 border-blue-500 ${
                  isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-blue-50 text-slate-800'
                }`}
              >
                <div className="truncate">
                  <span className="font-extrabold text-blue-500 block">
                    {language === 'ku' ? 'وەڵامدانەوە بۆ:' : 'Replying to:'} {replyingMessage.senderName}
                  </span>
                  <span className="text-[11px] opacity-80 truncate block">{replyingMessage.text}</span>
                </div>
                <button
                  onClick={() => setReplyingMessage(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Sticker / Emoji Drawer Panel */}
            {isEmojiPickerOpen && (
              <div
                className={`p-3 mb-2 rounded-2xl border shadow-lg max-h-52 overflow-y-auto ${
                  isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black text-blue-500">
                    {language === 'ku' ? 'ستیكەر و هێماکانی کەڵەگرام' : 'Kelegram Official Stickers'}
                  </span>
                  <button onClick={() => setIsEmojiPickerOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Stickers Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {INITIAL_KELEGRAM_STICKERS.map(stk => (
                    <button
                      key={stk.id}
                      onClick={() => handleSendSticker(stk)}
                      className="p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:scale-105 transition flex flex-col items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <span className="text-2xl">{stk.emoji}</span>
                      <span className="text-[9px] font-bold truncate max-w-full">
                        {language === 'ku' ? stk.labelKu : stk.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Priority & Executive Directives Selector */}
            <div className="flex items-center justify-between gap-2 mb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">
                  {language === 'ku' ? 'ئاستی پەیام:' : 'Priority:'}
                </span>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer ${
                    priority === 'HOLDING_DIRECTIVE'
                      ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                      : priority === 'URGENT'
                        ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200'
                        : isDarkMode
                          ? 'bg-slate-800 text-slate-200 border-slate-700'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <option value="NORMAL">{language === 'ku' ? 'ئاسایی' : 'Standard'}</option>
                  <option value="URGENT">{language === 'ku' ? '⚡ زۆر بەپەلە' : '⚡ Urgent'}</option>
                  <option value="HOLDING_DIRECTIVE">{language === 'ku' ? '👑 فەرمانی خاوەنی هۆلدینگ' : '👑 Holding Directive'}</option>
                </select>
              </div>

              {activeChat.type === 'bot' && (
                <span className="text-[10px] text-blue-500 font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  {language === 'ku' ? 'دەتوانیت بنووسیت /start یان کلیک لە دوگمەکان بکەیت' : 'Type /start or click bot keys'}
                </span>
              )}
            </div>

            {/* Voice Recording Active Bar */}
            {isRecordingVoice ? (
              <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-2.5 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping" />
                  <span className="text-xs font-black text-rose-700 dark:text-rose-300">
                    {language === 'ku' ? 'دەنگ تۆمار دەکرێت:' : 'Recording Audio:'} 0:
                    {recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelVoiceRecording}
                    className="px-3 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
                  >
                    {language === 'ku' ? 'هەڵوەشاندنەوە' : 'Cancel'}
                  </button>
                  <button
                    onClick={sendVoiceNote}
                    className="px-4 py-1.5 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] text-white text-xs font-black flex items-center gap-1 shadow-sm transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'ku' ? 'ناردنی دەنگ' : 'Send Voice'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Input Form */
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Attach Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-2xl text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                  title="Attach File or Document"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Sticker / Emoji Panel Trigger */}
                <button
                  type="button"
                  onClick={() => setIsEmojiPickerOpen(prev => !prev)}
                  className={`p-2.5 rounded-2xl transition cursor-pointer shrink-0 ${
                    isEmojiPickerOpen
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-500 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Stickers & Reactions"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Text Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={
                      language === 'ku'
                        ? 'نامەیەک بنووسە لە کەڵەگرامدا...'
                        : 'Write a message in Kelegram...'
                    }
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    className={`w-full text-xs font-medium rounded-2xl px-4 py-3 border focus:ring-2 focus:ring-[#2AABEE] focus:outline-none transition ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500'
                        : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Mic OR Send Button */}
                {inputText.trim() ? (
                  <button
                    type="submit"
                    className="w-11 h-11 rounded-2xl bg-[#2AABEE] hover:bg-[#229ED9] text-white flex items-center justify-center shadow-md transition transform active:scale-95 cursor-pointer shrink-0"
                    title="Send Message"
                  >
                    <Send className="w-5 h-5 -rotate-45 -translate-y-0.5 translate-x-0.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-slate-800 hover:bg-[#2AABEE] text-blue-600 dark:text-blue-400 hover:text-white flex items-center justify-center shadow-xs transition transform active:scale-95 cursor-pointer shrink-0"
                    title="Record Voice Note"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </form>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SLIDE-OVER INFO DRAWER: Profile, Bio, Media, Mute Settings */}
        {/* ========================================================= */}
        {isInfoDrawerOpen && (
          <div
            className={`w-72 sm:w-80 border-l p-4 flex flex-col shrink-0 animate-in slide-in-from-right duration-200 overflow-y-auto ${
              isDarkMode ? 'bg-[#1e293b] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                {language === 'ku' ? 'زانیاری کەڵەگرام' : 'Chat Information'}
              </h4>
              <button
                onClick={() => setIsInfoDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar & Name */}
            <div className="py-6 text-center space-y-2 border-b border-slate-100 dark:border-slate-800">
              <div
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-black shadow-md ${
                  activeChat.avatarBg || 'bg-blue-600 text-white'
                }`}
              >
                {activeChat.avatar}
              </div>
              <h3 className="font-black text-sm">{activeChat.name}</h3>
              {activeChat.username && (
                <span className="text-xs text-blue-500 font-mono">@{activeChat.username}</span>
              )}
              <p className="text-[11px] text-slate-500">{activeChat.onlineStatus}</p>
            </div>

            {/* Bio & Details */}
            <div className="py-4 space-y-3 text-xs border-b border-slate-100 dark:border-slate-800">
              {activeChat.bio && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    {language === 'ku' ? 'دەربارە / پێناسە' : 'Bio / Description'}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {activeChat.bio}
                  </p>
                </div>
              )}

              {activeChat.phone && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    {language === 'ku' ? 'ژمارەی مۆبایل' : 'Phone'}
                  </span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                    {activeChat.phone}
                  </span>
                </div>
              )}

              {activeChat.companyName && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    {language === 'ku' ? 'کۆمپانیای سەرپەرشتیار' : 'Company'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeChat.companyName}
                  </span>
                </div>
              )}
            </div>

            {/* Shared Media Counters */}
            <div className="py-4 space-y-2 text-xs border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                {language === 'ku' ? 'میدیا و هاوپێچە هاوبەشەکان' : 'Shared Media & Files'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-black block">6 فایلی PDF</span>
                  <span className="text-[10px] text-slate-400">ڕاپۆرت و گرێبەست</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-black block">12 دەنگ</span>
                  <span className="text-[10px] text-slate-400">تۆمارکراوی مەیدانی</span>
                </div>
              </div>
            </div>

            {/* Notification Toggle */}
            <div className="pt-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-500" />
                <span className="font-bold">{language === 'ku' ? 'ئاگادارکردنەوەکان' : 'Notifications'}</span>
              </div>
              <input
                type="checkbox"
                defaultChecked={!activeChat.isMuted}
                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL: Create New Telegram Group or Channel in Kelegram */}
      {/* ========================================================= */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#2AABEE] text-white flex items-center justify-center">
                  <Send className="w-4 h-4 -rotate-45" />
                </div>
                <h3 className="font-black text-base">
                  {language === 'ku' ? 'دروستکردنی گروپ یان کەناڵی نوێ' : 'New Telegram Channel / Group'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewChat} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  {language === 'ku' ? 'جۆری شوێن' : 'Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewChatType('group')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                      newChatType === 'group'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>{language === 'ku' ? 'گروپی هاوبەش' : 'Group'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewChatType('channel')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                      newChatType === 'channel'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    <span>{language === 'ku' ? 'کەناڵی پەخش' : 'Broadcast Channel'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  {language === 'ku' ? 'ناوی کەناڵ یان گروپ' : 'Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    newChatType === 'channel'
                      ? (language === 'ku' ? 'بۆ نموونە: کەناڵی ئاگاداری پڕۆژەی سلێمانی' : 'e.g. Slemani Site Broadcast')
                      : (language === 'ku' ? 'بۆ نموونە: گروپی ئەندازیارانی کارەبا' : 'e.g. Electrical Engineers Group')
                  }
                  value={newChatName}
                  onChange={e => setNewChatName(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  {language === 'ku' ? 'پێناسە یان ڕێنمایی (Bio)' : 'Description / Bio'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'ku' ? 'تایبەتمەندی و ئامانجی ئەم فەزایە بنووسە...' : 'Short description...'}
                  value={newChatDesc}
                  onChange={e => setNewChatDesc(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {language === 'ku' ? 'پاشگەزبوونەوە' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2AABEE] hover:bg-[#229ED9] text-white shadow-md cursor-pointer transition transform active:scale-95"
                >
                  {language === 'ku' ? 'دروستکردن' : 'Create Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RIGHT-CLICK CONTEXT MENU (TELEGRAM STYLE) */}
      {/* ========================================================= */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-[9999] w-60 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/90 shadow-2xl overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100 text-slate-800 dark:text-slate-100 text-xs font-semibold select-none"
        >
          {/* Quick Reaction Emoji Bar */}
          <div className="flex items-center justify-around px-2 py-1.5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50">
            {['❤️', '🔥', '👍', '👏', '😂', '🎉'].map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  handleAddReaction(contextMenu.message.id, emoji);
                  setContextMenu(null);
                }}
                className="text-base p-1 rounded-xl hover:scale-125 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply */}
          <button
            onClick={() => {
              setReplyingMessage(contextMenu.message);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer text-left rtl:text-right"
          >
            <Reply className="w-4 h-4 text-blue-500 rotate-180 shrink-0" />
            <span className="flex-1 font-bold">
              {language === 'ku' ? 'وەڵامدانەوە' : language === 'ar' ? 'رد' : 'Reply'}
            </span>
          </button>

          {/* Forward */}
          <button
            onClick={() => {
              setForwardModalMessage(contextMenu.message);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer text-left rtl:text-right"
          >
            <Forward className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="flex-1 font-bold">
              {language === 'ku' ? 'پێشەوەکردن (Forward)' : language === 'ar' ? 'إعادة توجيه' : 'Forward'}
            </span>
          </button>

          {/* Copy Message Text */}
          <button
            onClick={() => handleCopyMessageText(contextMenu.message)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer text-left rtl:text-right"
          >
            <Copy className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="flex-1 font-bold">
              {language === 'ku' ? 'لەبەرگرتنەوەی دەقی پەیام' : language === 'ar' ? 'نسخ نص الرسالة' : 'Copy message text'}
            </span>
          </button>

          {/* Pin / Unpin */}
          <button
            onClick={() => handleTogglePinMessage(contextMenu.message)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer text-left rtl:text-right"
          >
            <Pin className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="flex-1 font-bold">
              {activeChat.pinnedMessage === contextMenu.message.text
                ? (language === 'ku' ? 'لابردنی جێگیرکراو' : 'Unpin')
                : (language === 'ku' ? 'جێگیرکردنی پەیام (Pin)' : 'Pin message')}
            </span>
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-700/60 my-1" />

          {/* Delete for everyone */}
          <button
            onClick={() => handleDeleteForEveryone(contextMenu.message.id)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition cursor-pointer text-left rtl:text-right"
          >
            <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="flex-1 font-bold">
              {language === 'ku' ? 'سڕینەوە بۆ هەمووان' : language === 'ar' ? 'حذف للجميع' : 'Delete for everyone'}
            </span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* FORWARD MESSAGE MODAL */}
      {/* ========================================================= */}
      {forwardModalMessage && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Forward className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-800 dark:text-slate-100">
                    {language === 'ku' ? 'پێشەوەکردنی پەیام' : language === 'ar' ? 'إعادة توجيه الرسالة' : 'Forward Message'}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {language === 'ku' ? 'چات یان کەناڵی وەرگر هەڵبژێرە' : 'Select a destination chat or channel'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setForwardModalMessage(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quoted Message Preview */}
            <div className="p-3 mx-4 mt-3 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border-l-4 border-blue-500 text-xs">
              <div className="text-[11px] font-bold text-blue-500 mb-0.5">
                {forwardModalMessage.senderName}
              </div>
              <div className="text-slate-700 dark:text-slate-300 line-clamp-2">
                {forwardModalMessage.text || (forwardModalMessage.attachment ? `📎 ${forwardModalMessage.attachment.name}` : '🎤 Voice message')}
              </div>
            </div>

            {/* Search Input */}
            <div className="p-4 pb-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={language === 'ku' ? 'گەڕان لە کەناڵ و گفتوگۆکان...' : 'Search chats & channels...'}
                  value={forwardSearchQuery}
                  onChange={e => setForwardSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto p-4 pt-1 space-y-1.5">
              {chats
                .filter(chat =>
                  chat.name.toLowerCase().includes(forwardSearchQuery.toLowerCase()) ||
                  (chat.nameKu && chat.nameKu.includes(forwardSearchQuery))
                )
                .map(chat => {
                  const isCurrent = chat.id === activeChatId;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => handleForwardMessageToChat(chat.id)}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                            chat.avatarBg || 'bg-blue-600 text-white'
                          }`}
                        >
                          {chat.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate">
                              {language === 'ku' && chat.nameKu ? chat.nameKu : chat.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold">
                                {language === 'ku' ? 'ئێستا' : 'Current'}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">
                            {chat.companyName || chat.onlineStatus || chat.lastMessageText || 'Kelegram Hub'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleForwardMessageToChat(chat.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#2AABEE] hover:bg-[#229ED9] text-white text-xs font-bold transition transform active:scale-95 shadow-xs flex items-center gap-1 shrink-0"
                      >
                        <Forward className="w-3.5 h-3.5" />
                        <span>{language === 'ku' ? 'بنێرە' : 'Send'}</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TOAST NOTIFICATION PILL */}
      {/* ========================================================= */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] px-4 py-2.5 bg-slate-950/90 text-white text-xs font-bold rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700/80 animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2 select-none">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};

export default KelegramApp;
