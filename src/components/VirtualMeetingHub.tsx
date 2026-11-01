import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Users,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Send,
  FileText,
  PhoneOff,
  Crown,
  Volume2,
  VolumeX,
  Languages,
  Radio,
  Headphones,
  Captions,
  AudioLines,
  RefreshCw,
  Layers,
  Building2,
  Briefcase,
  Play,
  Sliders,
  Check,
  ChevronDown,
  UserCheck,
  Plus
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { Language, VirtualMeeting } from '../types/erp';

interface ChatMessageItem {
  id: string;
  sender: string;
  time: string;
  text: string;
  translatedText?: Record<Language, string>;
  isTranslating?: boolean;
}

interface LiveSubtitle {
  speaker: string;
  speakerRole: string;
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: Language;
  timestamp: string;
}

export const VirtualMeetingHub: React.FC = () => {
  const {
    virtualMeetings,
    activeMeeting,
    startMeeting,
    endMeeting,
    updateMeetingMinutes,
    currentUser,
    holding,
    companies,
    projects,
    generalManagers,
  } = useERP();

  const { t, language, translateText } = useLanguage();

  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');

  // Headphone & Simultaneous Live Voice Interpretation State
  const [isHeadphoneConnected, setIsHeadphoneConnected] = useState<boolean>(true);
  const [headphoneChannelLang, setHeadphoneChannelLang] = useState<Language>(language);
  const [isAutoVoicePlay, setIsAutoVoicePlay] = useState<boolean>(true);
  const [speechVolume, setSpeechVolume] = useState<number>(1);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState<boolean>(true);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [isSpeakingNow, setIsSpeakingNow] = useState<boolean>(false);

  // Active Meeting Setup / Selector Mode
  const [selectedMeetingMode, setSelectedMeetingMode] = useState<'JOINT_PM_GM' | 'GM_REVIEW' | 'PM_REVIEW' | 'BOARD_GENERAL'>('JOINT_PM_GM');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedGmId, setSelectedGmId] = useState<string>('');
  const [isConfiguringMeeting, setIsConfiguringMeeting] = useState<boolean>(false);

  // Active Live Subtitle
  const [activeSubtitle, setActiveSubtitle] = useState<LiveSubtitle>({
    speaker: holding.chairmanName || 'خاوەنی هۆلدینگ (Holding Owner)',
    speakerRole: 'Chairman & Holding CEO',
    originalText: 'بەخێربێن بۆ ژووری میتینگی سەرکردایەتی. سەرجەم بەڕێوەبەرانی گشتی و پڕۆژەکان بە هاوئاهەنگی ڕاستەوخۆ کار دەکەن.',
    translatedText: language === 'en'
      ? 'Welcome to the Executive Leadership Room. All General Managers and Project Managers are directly coordinated.'
      : language === 'ar'
      ? 'مرحباً بكم في غرفة القيادة التنفيذية. جميع المدراء العامين ومدراء المشاريع ينسقون مباشرة.'
      : 'بەخێربێن بۆ ژووری میتینگی سەرکردایەتی. سەرجەم بەڕێوەبەرانی گشتی و پڕۆژەکان بە هاوئاهەنگی ڕاستەوخۆ کار دەکەن.',
    sourceLang: 'ku',
    targetLang: language,
    timestamp: 'Just now',
  });

  // Auto-translate chat messages
  const [autoTranslateChat, setAutoTranslateChat] = useState<boolean>(true);
  const [chatLog, setChatLog] = useState<ChatMessageItem[]>([
    {
      id: 'c1',
      sender: holding.chairmanName || 'خاوەنی هۆلدینگ (Holding Owner)',
      time: '09:00',
      text: 'سڵاو لە هەمووان. چاودێری بودجە و کۆنتڕۆڵی دەروازەی سەرەکی چالاک کراوە.',
      translatedText: {
        en: 'Hello everyone. Budget monitoring and main gate control have been activated.',
        ar: 'مرحباً بالجميع. تم تفعيل مراقبة الميزانية والتحكم بالبوابة الرئيسية.',
        ku: 'سڵاو لە هەمووان. چاودێری بودجە و کۆنتڕۆڵی دەروازەی سەرەکی چالاک کراوە.',
      }
    },
    {
      id: 'c2',
      sender: 'د. طارق الجبوري (General Manager)',
      time: '09:02',
      text: 'تمت مطابقة حسابات الكشوفات وتدقيق أداء المشاريع التابعة للشركة.',
      translatedText: {
        ku: 'حیسابات و وردبینی لە ئەدای پڕۆژەکانی سەربە کۆمپانیاکەمان تەواو کرا.',
        en: 'Reconciliation of statements and audit of subsidiary project performance has been concluded.',
        ar: 'تمت مطابقة حسابات الكشوفات وتدقيق أداء المشاريع التابعة للشركة.',
      }
    },
    {
      id: 'c3',
      sender: 'ڕێبین کاروان (Project Manager)',
      time: '09:04',
      text: 'قۆناغی هەیکەلی پڕۆژەکە ٨٥٪ی تەواوبووە و پێویستمان بە بەشی دووەمی کەرەستەی بیناسازییە.',
      translatedText: {
        ar: 'تم إنجاز ٨٥٪ من الهيكل الإنشائي للمشروع ونحتاج للدفعة الثانية من مواد البناء.',
        en: '85% of project structural work is complete and we require the second shipment of materials.',
        ku: 'قۆناغی هەیکەلی پڕۆژەکە ٨٥٪ی تەواوبووە و پێویستمان بە بەشی دووەمی کەرەستەی بیناسازییە.',
      }
    }
  ]);

  const [meetingNotes, setMeetingNotes] = useState<string>(
    'Key Discussion: Direct coordination between Project Manager, Supervising Division General Manager, and Holding Owner / CEO. Capital expenditures strictly validated against central vouchers.'
  );
  const [isGeneratingAiMinutes, setIsGeneratingAiMinutes] = useState<boolean>(false);
  const [isTranslatingNotes, setIsTranslatingNotes] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Sync headphone channel language with active app language on mount
  useEffect(() => {
    setHeadphoneChannelLang(language);
  }, [language]);

  // Provide realistic fallback list if projects or companies are clean/empty
  const activeProjectsList = projects.length > 0 ? projects : [
    {
      id: 'p-demo-1',
      companyId: companies[0]?.id || 'c-demo-1',
      name: 'Erbil Royal Towers',
      nameKu: 'پڕۆژەی تاوەرەکانی شاهانەی هەولێر',
      projectManager: 'ئەندازیار ڕێبین کاروان (Project Manager)',
      status: 'IN_PROGRESS',
      budgetUSD: 1450000,
      spentUSD: 820000,
    },
    {
      id: 'p-demo-2',
      companyId: companies[1]?.id || 'c-demo-2',
      name: 'Sulaymaniyah Logistics Park',
      nameKu: 'پڕۆژەی پارکی لۆجستی سلێمانی',
      projectManager: 'ئەندازیار بێستون نادر (Project Manager)',
      status: 'PLANNING',
      budgetUSD: 980000,
      spentUSD: 230000,
    }
  ];

  const activeCompaniesList = companies.length > 0 ? companies : [
    {
      id: 'c-demo-1',
      name: 'Horizon Construction Ltd',
      nameKu: 'کۆمپانیای بیناسازی ئاسۆ',
      generalManager: 'د. سەردار کەمال (General Manager)',
      country: 'Iraq - Kurdistan',
      city: 'Erbil',
      currency: 'USD',
      totalBudgetUSD: 5000000,
      totalSpentUSD: 1800000,
      departments: [],
      projects: []
    },
    {
      id: 'c-demo-2',
      name: 'Apex Logistics & Trade',
      nameKu: 'کۆمپانیای بازرگانی و لۆجستی ئەپێکس',
      generalManager: 'کاک دلێر جەلال (General Manager)',
      country: 'Iraq - Kurdistan',
      city: 'Sulaymaniyah',
      currency: 'USD',
      totalBudgetUSD: 3000000,
      totalSpentUSD: 950000,
      departments: [],
      projects: []
    }
  ];

  // Pick or Build Current Meeting
  const currentMeeting: VirtualMeeting = activeMeeting || virtualMeetings[0] || {
    id: 'meet-default',
    title: 'Holding Strategic Leadership Board',
    titleKu: 'کۆبوونەوەی سێ-قۆڵی: پڕۆژە + بەڕێوەبەری گشتی + خاوەنی هۆلدینگ',
    hostName: holding.chairmanName || 'خاوەنی هۆلدینگ (Holding Owner)',
    scheduledTime: 'Live Session (چالاکە)',
    status: 'LIVE',
    attendees: [
      {
        name: holding.chairmanName || 'خاوەنی هۆلدینگ (Holding Owner)',
        role: 'Holding Owner / CEO',
        company: holding.name || t('holdingGroup'),
        avatar: '👑',
        isAudioOn: true,
        isVideoOn: true,
        category: 'OWNER',
        nativeLang: 'ku'
      },
      {
        name: 'د. سەردار کەمال (General Manager)',
        role: 'بەڕێوەبەری گشتی کۆمپانیای بیناسازی',
        company: 'کۆمپانیای بیناسازی ئاسۆ',
        avatar: '🏢',
        isAudioOn: true,
        isVideoOn: true,
        category: 'GM',
        nativeLang: 'ku'
      },
      {
        name: 'ئەندازیار ڕێبین کاروان (Project Manager)',
        role: 'بەڕێوەبەری پڕۆژەی تاوەری شاهانە',
        company: 'پڕۆژەی تاوەری هەولێر',
        avatar: '📐',
        isAudioOn: true,
        isVideoOn: true,
        category: 'PM',
        nativeLang: 'ku'
      },
      {
        name: 'David Miller (Group CFO)',
        role: 'Chief Financial Officer',
        company: 'Holding Finance Hub',
        avatar: '💼',
        isAudioOn: true,
        isVideoOn: false,
        category: 'STAFF',
        nativeLang: 'en'
      }
    ],
    agenda: [
      'ڕەزامەندی لەسەر خەرجییەکانی پڕۆژە لە لایەن خاوەن هۆلدینگ',
      'ڕاپۆرتی کارگێڕیی بەڕێوەبەری گشتی و هەماهەنگی لەگەڵ بەڕێوەبەری پڕۆژە',
      'دابینکردنی کەرەستە و بەستنەوە بە کۆگا و دەروازەی سەرەکی'
    ],
    actionItems: []
  };

  // Launch a tailored meeting matching the user requirements
  const handleLaunchConfiguredMeeting = (mode: 'JOINT_PM_GM' | 'GM_REVIEW' | 'PM_REVIEW' | 'BOARD_GENERAL') => {
    const ownerAttendee = {
      name: holding.chairmanName || 'خاوەنی هۆلدینگ (Holding Owner)',
      role: 'Holding Owner / CEO',
      company: holding.name || t('holdingGroup'),
      avatar: '👑',
      isAudioOn: true,
      isVideoOn: true,
      category: 'OWNER' as const,
      nativeLang: 'ku'
    };

    if (mode === 'JOINT_PM_GM') {
      // Find selected project
      const proj = activeProjectsList.find(p => p.id === selectedProjectId) || activeProjectsList[0];
      const supervisingComp = activeCompaniesList.find(c => c.id === proj.companyId) || activeCompaniesList[0];
      
      // Find GM of that company or matching GM profile
      const matchedGmProfile = generalManagers.find(g => g.assignedCompanyId === supervisingComp.id);
      const gmName = matchedGmProfile
        ? (matchedGmProfile.fullNameKu || matchedGmProfile.fullName)
        : (supervisingComp.generalManager || 'بەڕێوەبەری گشتی ئەو بەشە (Supervising GM)');
      
      const pmName = proj.projectManager || 'بەڕێوەبەری پڕۆژە (Project Manager)';

      startMeeting({
        title: `Joint Strategic Review: ${proj.name} with Division GM & Holding Owner`,
        titleKu: `کۆبوونەوەی سێ-قۆڵی: ${proj.nameKu || proj.name} لەگەڵ بەڕێوەبەری گشتی (${supervisingComp.nameKu || supervisingComp.name}) و خاوەنی هۆلدینگ`,
        titleAr: `اجتماع ثلاثي: مشروع ${proj.name} مع المدير العام المشرف ورئيس المجموعة`,
        meetingType: 'JOINT_PM_GM',
        companyId: supervisingComp.id,
        projectId: proj.id,
        attendees: [
          ownerAttendee,
          {
            name: `${gmName}`,
            role: `بەڕێوەبەری گشتی (${supervisingComp.nameKu || supervisingComp.name})`,
            company: supervisingComp.nameKu || supervisingComp.name,
            avatar: '🏢',
            isAudioOn: true,
            isVideoOn: true,
            category: 'GM',
            nativeLang: 'ku'
          },
          {
            name: `${pmName}`,
            role: `بەڕێوەبەری پڕۆژە (${proj.nameKu || proj.name})`,
            company: proj.nameKu || proj.name,
            avatar: '📐',
            isAudioOn: true,
            isVideoOn: true,
            category: 'PM',
            nativeLang: 'ku'
          },
          {
            name: 'Marcus Brody (COO)',
            role: 'Chief Operations Officer',
            company: 'Holding Operations Hub',
            avatar: '👔',
            isAudioOn: true,
            isVideoOn: true,
            category: 'STAFF',
            nativeLang: 'en'
          }
        ],
        agenda: [
          `پێشکەشکردنی ڕاپۆرتی بەڕێوەبەری پڕۆژە (${pmName}) لەسەر خشتەی کار و بەربەستەکان`,
          `هەڵسەنگاندنی بەڕێوەبەری گشتی (${gmName}) لەسەر بودجە و بەڵێندەرە لاوەکییەکان`,
          `بڕیاری کۆتایی و پەسەندکردنی داواکارییەکان لەلایەن خاوەن هۆلدینگ / CEO`
        ]
      });
    } else if (mode === 'GM_REVIEW') {
      const targetGm = generalManagers.find(g => g.id === selectedGmId) || generalManagers[0];
      const gmName = targetGm ? (targetGm.fullNameKu || targetGm.fullName) : 'د. سەردار کەمال (General Manager)';
      const compName = targetGm?.assignedCompanyName || 'Holding Subsidiary Operations';

      startMeeting({
        title: `Executive GM Review: ${gmName} with Holding Owner & CEO`,
        titleKu: `کۆبوونەوەی ستراتیژی لەگەڵ بەڕێوەبەری گشتی: ${gmName}`,
        titleAr: `جلسة مراجعة استراتيجية مع المدير العام: ${gmName}`,
        meetingType: 'GM_REVIEW',
        companyId: targetGm?.assignedCompanyId,
        attendees: [
          ownerAttendee,
          {
            name: gmName,
            role: targetGm?.title || 'General Manager',
            company: compName,
            avatar: '🏢',
            isAudioOn: true,
            isVideoOn: true,
            category: 'GM',
            nativeLang: 'ku'
          },
          {
            name: 'David Miller (Finance Head)',
            role: 'Chief Financial Officer',
            company: 'Holding Finance',
            avatar: '💼',
            isAudioOn: true,
            isVideoOn: false,
            category: 'STAFF',
            nativeLang: 'en'
          }
        ],
        agenda: [
          'پێداچوونەوەی KPI و کارە جێبەجێکراوەکانی کۆمپانیاکە',
          'وردبینی لە داواکاری کڕین (PO) و بودجەی خەرجکراو',
          'ڕێنمایی ڕاستەوخۆ لە خاوەنی هۆلدینگەوە بۆ بەڕێوەبەری گشتی'
        ]
      });
    } else if (mode === 'PM_REVIEW') {
      const proj = activeProjectsList.find(p => p.id === selectedProjectId) || activeProjectsList[0];
      const pmName = proj.projectManager || 'بەڕێوەبەری پڕۆژە (Project Manager)';

      startMeeting({
        title: `Project Site Performance: ${proj.name} with Holding Owner`,
        titleKu: `کۆبوونەوە لەگەڵ بەڕێوەبەری پڕۆژە: ${proj.nameKu || proj.name} لەگەڵ خاوەنی هۆلدینگ`,
        titleAr: `مراجعة تنفيذية مع مدير مشروع: ${proj.name}`,
        meetingType: 'PM_REVIEW',
        projectId: proj.id,
        attendees: [
          ownerAttendee,
          {
            name: pmName,
            role: 'بەڕێوەبەری پڕۆژە (Project Manager)',
            company: proj.nameKu || proj.name,
            avatar: '📐',
            isAudioOn: true,
            isVideoOn: true,
            category: 'PM',
            nativeLang: 'ku'
          },
          {
            name: 'بەرپرسی ئاسایش و لۆجستی (Gate Controller)',
            role: 'Logistics & Safety Controller',
            company: 'Central Gate',
            avatar: '🛡️',
            isAudioOn: true,
            isVideoOn: true,
            category: 'STAFF',
            nativeLang: 'ku'
          }
        ],
        agenda: [
          'ڕێژەی تەواوبوونی پڕۆژە و شیکاریی بەربەستەکانی گۆڕەپان',
          'داواکاریی کەرەستەی بەپەلە و پشکنینی دەروازەی کۆگا',
          'ڕەزامەندی ڕاستەوخۆی خاوەنی هۆلدینگ'
        ]
      });
    } else {
      // Full Board
      startMeeting({
        title: 'Full Holding Board of Directors & General Managers',
        titleKu: 'ئەنجوومەنی گشتی هۆلدینگ: خاوەن هۆلدینگ + سەرجەم بەڕێوەبەرانی گشتی',
        titleAr: 'المجلس العام للمجموعة: رئيس مجلس الإدارة وجميع المدراء العامين',
        meetingType: 'BOARD_GENERAL',
        attendees: [
          ownerAttendee,
          ...activeCompaniesList.map((comp, idx) => ({
            name: comp.generalManager || `بەڕێوەبەری گشتی ${comp.nameKu || comp.name}`,
            role: `General Manager - ${comp.nameKu || comp.name}`,
            company: comp.nameKu || comp.name,
            avatar: idx % 2 === 0 ? '🏢' : '👔',
            isAudioOn: true,
            isVideoOn: true,
            category: 'GM' as const,
            nativeLang: idx % 2 === 0 ? 'ku' : 'ar'
          }))
        ],
        agenda: [
          'ڕاپۆرتی گشتی تەواوی کۆمپانیاکانی ژێر باڵی هۆلدینگ',
          'ستراتیژی وەبەرهێنان و پەسەندکردنی پلانی دارایی ساڵانە',
          'بەستنەوەی سیستەمی کۆنترۆڵی ناوەندی'
        ]
      });
    }

    setIsConfiguringMeeting(false);
  };

  // Audio Speech Synthesis Player (خوێندنەوەی دەنگ بۆ ناو هێذفۆن)
  const playVoiceSynthesis = (textToSpeak: string, langTarget: Language) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      if (langTarget === 'ar') {
        utterance.lang = 'ar-SA';
      } else if (langTarget === 'en') {
        utterance.lang = 'en-US';
      } else {
        // Kurdish Sorani - browsers usually fall back gracefully
        utterance.lang = 'ar-IQ';
      }
      utterance.rate = speechRate;
      utterance.volume = isHeadphoneConnected ? speechVolume : 0.8;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeakingNow(true);
      utterance.onend = () => setIsSpeakingNow(false);
      utterance.onerror = () => setIsSpeakingNow(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setIsSpeakingNow(false);
    }
  };

  // Broadcast spoken sentence with instant translation to listener's earphone channel
  const broadcastSpokenSpeech = async (
    speakerName: string,
    role: string,
    spokenText: string,
    srcLang: string
  ) => {
    const target = headphoneChannelLang;
    let translated = spokenText;
    if (srcLang !== target) {
      translated = await translateText(spokenText, target, srcLang as Language);
    }

    const newSub: LiveSubtitle = {
      speaker: speakerName,
      speakerRole: role,
      originalText: spokenText,
      translatedText: translated,
      sourceLang: srcLang,
      targetLang: target,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setActiveSubtitle(newSub);

    // If auto voice play is on (or headphones enabled), play audio directly in recipient's desired earphone language!
    if (isAutoVoicePlay || isHeadphoneConnected) {
      playVoiceSynthesis(translated, target);
    }

    // Add to chat log
    if (spokenText.trim().length > 3) {
      const translatedMap: Record<Language, string> = {
        ku: srcLang === 'ku' ? spokenText : await translateText(spokenText, 'ku'),
        ar: srcLang === 'ar' ? spokenText : await translateText(spokenText, 'ar'),
        en: srcLang === 'en' ? spokenText : await translateText(spokenText, 'en'),
      };

      setChatLog(prev => [
        ...prev,
        {
          id: 'spk-' + Date.now(),
          sender: `${speakerName} (🎙️ Live Voice)`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: spokenText,
          translatedText: translatedMap,
        }
      ]);
    }
  };

  // Test Headphone Sound Output
  const handleTestHeadphones = () => {
    const sampleSentences: Record<Language, string> = {
      ku: 'هێذفۆنی وەرگێڕانی هاوکات چالاکە. تۆ ئێستا دەنگی بەڕێوەبەران بە زمانی کوردی دەبیستیت.',
      ar: 'سماعات الترجمة الفورية تعمل بنجاح. أنت الآن تسمع الصوت باللغة العربية.',
      en: 'Real-time headphone audio channel is connected. You are now listening to speech interpreted in English.'
    };
    playVoiceSynthesis(sampleSentences[headphoneChannelLang], headphoneChannelLang);
  };

  // Trigger realistic authentic speech from any attendee in the room
  const triggerAttendeeSpeech = (attendee: VirtualMeeting['attendees'][number]) => {
    if (attendee.category === 'PM') {
      const pmSentences = [
        { text: 'جەنابی خاوەن هۆلدینگ، قۆناغی هەیکەلی پڕۆژەکەمان ٨٥٪ی تەواوبووە و پێویستمان بە پەسەندکردنی بەشی دووەمی کڕینی شیش و چیمەنتۆیە.', lang: 'ku' },
        { text: 'We have aligned our site contractor schedules, awaiting purchase order release from the Holding Owner.', lang: 'en' },
        { text: 'تم فحص جودة الخرسانة في الموقع والمشروع يسير وفق الخطة الزمنية المعتمدة.', lang: 'ar' }
      ];
      const pick = pmSentences[Math.floor(Math.random() * pmSentences.length)];
      broadcastSpokenSpeech(attendee.name, attendee.role, pick.text, pick.lang);
    } else if (attendee.category === 'GM') {
      const gmSentences = [
        { text: 'وەک بەڕێوەبەری گشتی ئەو بەشە، وردبینیم لە داواکارییەکانی بەڕێوەبەری پڕۆژە کردووە و لەگەڵ بودجەی دیاریکراو هاوتایە.', lang: 'ku' },
        { text: 'I have verified the departmental requisition with finance and recommend the Holding Owner approve the allocation.', lang: 'en' },
        { text: 'بصفتي المدير العام للشركة، راجعت تقرير مدير المشروع وأؤكد جاهزية التوريد من المورد المعتمد.', lang: 'ar' }
      ];
      const pick = gmSentences[Math.floor(Math.random() * gmSentences.length)];
      broadcastSpokenSpeech(attendee.name, attendee.role, pick.text, pick.lang);
    } else if (attendee.category === 'OWNER') {
      const ownerSentences = [
        { text: 'ڕەزامەندیم دا لەسەر خەرجکردنی بڕە پارەی پێویست. پێویستە پسوولەکان ڕاستەوخۆ بچنە سیستەمی ژمێریاری و کۆگای سەرەکی.', lang: 'ku' },
        { text: 'As Holding Owner, I authorize this capital expenditure. Ensure strict barcode verification at the main gate.', lang: 'en' },
        { text: 'بصفتي مالك المجموعة، تمت الموافقة على أمر الشراء مع الالتزام برقابة البوابة المركزية.', lang: 'ar' }
      ];
      const pick = ownerSentences[Math.floor(Math.random() * ownerSentences.length)];
      broadcastSpokenSpeech(attendee.name, attendee.role, pick.text, pick.lang);
    } else {
      broadcastSpokenSpeech(attendee.name, attendee.role, 'All ledger vouchers and allocations are validated with zero discrepancy.', 'en');
    }
  };

  // Start / Stop Microphone Speech Recognition
  const toggleMicrophoneLive = () => {
    if (isListeningMic) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListeningMic(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'ar' ? 'ar-IQ' : language === 'ku' ? 'ku' : 'en-US';

        recognition.onstart = () => setIsListeningMic(true);
        recognition.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            await broadcastSpokenSpeech(currentUser.name, currentUser.role, transcript, language);
          }
          setIsListeningMic(false);
        };
        recognition.onerror = () => setIsListeningMic(false);
        recognition.onend = () => setIsListeningMic(false);
        recognition.start();
        return;
      } catch (err) {
        console.warn('SpeechRecognition failed fallback', err);
      }
    }

    // Fallback simulation
    setIsListeningMic(true);
    setTimeout(async () => {
      const sampleSentences = [
        { text: 'ڕەزامەندی لەسەر داواکارییەکانی پڕۆژە درا و لە ڕێگەی دەروازەی هۆلدینگەوە بار دەکرێت.', lang: 'ku' },
        { text: 'Directives approved by Executive Leadership. Dispatching logistics shipments.', lang: 'en' },
        { text: 'تمت المصادقة على طلبات الصرف وتوجيه مدير المشروع بمتابعة التنفيذ.', lang: 'ar' },
      ];
      const pick = sampleSentences[Math.floor(Math.random() * sampleSentences.length)];
      await broadcastSpokenSpeech(currentUser.name, currentUser.role, pick.text, pick.lang);
      setIsListeningMic(false);
    }, 2000);
  };

  // Send Chat message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const original = chatMessage.trim();
    setChatMessage('');

    const newChatId = 'msg-' + Date.now();
    const newMsg: ChatMessageItem = {
      id: newChatId,
      sender: currentUser.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: original,
      isTranslating: true,
    };

    setChatLog(prev => [...prev, newMsg]);

    const [transKu, transAr, transEn] = await Promise.all([
      language === 'ku' ? original : translateText(original, 'ku'),
      language === 'ar' ? original : translateText(original, 'ar'),
      language === 'en' ? original : translateText(original, 'en'),
    ]);

    setChatLog(prev =>
      prev.map(item =>
        item.id === newChatId
          ? {
              ...item,
              translatedText: { ku: transKu, ar: transAr, en: transEn },
              isTranslating: false,
            }
          : item
      )
    );
  };

  // Translate Notes
  const handleTranslateNotes = async (targetLang: Language) => {
    if (!meetingNotes.trim()) return;
    setIsTranslatingNotes(true);
    try {
      const translated = await translateText(meetingNotes, targetLang);
      setMeetingNotes(translated);
    } catch (err) {
      console.error('Error translating notes:', err);
    } finally {
      setIsTranslatingNotes(false);
    }
  };

  // Generate AI Minutes
  const handleGenerateAiMinutes = async () => {
    setIsGeneratingAiMinutes(true);
    try {
      const response = await fetch('/api/gemini/meeting-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentMeeting.title,
          company: holding.name || 'Holding Enterprise',
          attendees: currentMeeting.attendees.map(a => `${a.name} (${a.role})`),
          notes: meetingNotes + '\n' + chatLog.map(c => `${c.sender}: ${c.text}`).join('\n'),
          language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.summary) {
          updateMeetingMinutes(currentMeeting.id, data.summary);
        }
      }
    } catch (err) {
      console.error('Error generating minutes:', err);
    } finally {
      setIsGeneratingAiMinutes(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Session & Room Mode Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                سیستەمی ژووری میتینگی سەرکردایەتی هۆلدینگ و وەرگێڕانی زمان (Executive Boardroom & Live Interpreter)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {language === 'ku' && currentMeeting.titleKu ? currentMeeting.titleKu : language === 'ar' && currentMeeting.titleAr ? currentMeeting.titleAr : currentMeeting.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>خاوەن/سەرۆک: <strong className="text-slate-900">{currentMeeting.hostName}</strong></span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px]">
                {currentMeeting.attendees.length} بەڕێوەبەر و بەشداربوو لە هێڵدان
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsConfiguringMeeting(!isConfiguringMeeting)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>هەڵبژاردنی جۆری کۆبوونەوە (Meeting Modes)</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            <button
              onClick={handleGenerateAiMinutes}
              disabled={isGeneratingAiMinutes}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
              id="generate-ai-minutes-btn"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGeneratingAiMinutes ? 'نووسینی کۆنووس بە AI...' : 'دروستکردنی کۆنووسی فەرمی (Minutes)'}</span>
            </button>
          </div>
        </div>

        {/* Meeting Modes Launcher Modal / Drawer */}
        {isConfiguringMeeting && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  ڕێکخستنی کۆبوونەوە لەگەڵ بەڕێوەبەران (Select Meeting Participants)
                </h3>
                <p className="text-xs text-slate-500">
                  دەتوانیت هەر بەڕێوەبەرێکی گشتی یا بەڕێوەبەری پڕۆژە، یا بەڕێوەبەری پڕۆژە لەگەڵ بەڕێوەبەری گشتی ئەو بەشەی پرۆژەکەی پێوە بەستراوە لەگەڵ خاوەن هۆلدینگ/CEO کۆبکەیتەوە.
                </p>
              </div>
              <button
                onClick={() => setIsConfiguringMeeting(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-1"
              >
                داخستن ✕
              </button>
            </div>

            {/* Mode Selection Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Mode 1: Joint 3-Party Room */}
              <div
                onClick={() => setSelectedMeetingMode('JOINT_PM_GM')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedMeetingMode === 'JOINT_PM_GM'
                    ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    🔗
                  </span>
                  <span className="text-xs font-bold text-slate-900">کۆبوونەوەی سێ-قۆڵی</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  بەڕێوەبەری پڕۆژە + بەڕێوەبەری گشتی ئەو بەشەی پرۆژەکەی پێوە بەستراوە + خاوەن هۆلدینگ / CEO
                </p>
              </div>

              {/* Mode 2: GM 1-on-1 */}
              <div
                onClick={() => setSelectedMeetingMode('GM_REVIEW')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedMeetingMode === 'GM_REVIEW'
                    ? 'bg-purple-50/80 border-purple-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                    🏢
                  </span>
                  <span className="text-xs font-bold text-slate-900">کۆبوونەوە لەگەڵ بەڕێوەبەری گشتی</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  کۆبوونەوەی تایبەتی بەڕێوەبەری گشتی یەکێک لە کۆمپانیاکان لەگەڵ خاوەنی هۆلدینگ
                </p>
              </div>

              {/* Mode 3: PM 1-on-1 */}
              <div
                onClick={() => setSelectedMeetingMode('PM_REVIEW')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedMeetingMode === 'PM_REVIEW'
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    📐
                  </span>
                  <span className="text-xs font-bold text-slate-900">کۆبوونەوە لەگەڵ بەڕێوەبەری پڕۆژە</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  بەڕێوەبەری پڕۆژەیەکی تایبەت ڕاستەوخۆ لەگەڵ خاوەنی هۆلدینگ بۆ چارەسەری بەربەستەکان
                </p>
              </div>

              {/* Mode 4: Full Board */}
              <div
                onClick={() => setSelectedMeetingMode('BOARD_GENERAL')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  selectedMeetingMode === 'BOARD_GENERAL'
                    ? 'bg-amber-50/80 border-amber-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                    👑
                  </span>
                  <span className="text-xs font-bold text-slate-900">ئەنجوومەنی گشتی هۆلدینگ</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  خاوەن هۆلدینگ لەگەڵ سەرجەم بەڕێوەبەرانی گشتی کۆمپانیاکان و سەرۆکی بەشەکان
                </p>
              </div>

            </div>

            {/* Dynamic Pickers based on Mode */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              
              {selectedMeetingMode === 'JOINT_PM_GM' && (
                <div className="flex-1 space-y-1 w-full">
                  <label className="text-xs font-bold text-slate-700 block">
                    پڕۆژەکە هەڵبژێرە (سیستەم بە ئۆتۆماتیک بەڕێوەبەری پڕۆژە و بەڕێوەبەری گشتی ئەو بەشەی پێوە بەستراوە بانگهێشت دەکات):
                  </label>
                  <select
                    value={selectedProjectId || activeProjectsList[0]?.id}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    {activeProjectsList.map(p => {
                      const comp = activeCompaniesList.find(c => c.id === p.companyId);
                      return (
                        <option key={p.id} value={p.id}>
                          {p.nameKu || p.name} — سەرپەرشتیار: {comp?.nameKu || comp?.name || 'کۆمپانیای پەیوەندیدار'} (بەڕێوەبەری پڕۆژە: {p.projectManager})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {selectedMeetingMode === 'GM_REVIEW' && (
                <div className="flex-1 space-y-1 w-full">
                  <label className="text-xs font-bold text-slate-700 block">
                    بەڕێوەبەری گشتی هەڵبژێرە بۆ کۆبوونەوە لەگەڵ خاوەنی هۆلدینگ:
                  </label>
                  <select
                    value={selectedGmId || generalManagers[0]?.id || ''}
                    onChange={(e) => setSelectedGmId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    {generalManagers.length > 0 ? (
                      generalManagers.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.fullNameKu || g.fullName} — {g.title} ({g.assignedCompanyName || 'Holding'})
                        </option>
                      ))
                    ) : (
                      activeCompaniesList.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.generalManager || 'بەڕێوەبەری گشتی'} — ({c.nameKu || c.name})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {selectedMeetingMode === 'PM_REVIEW' && (
                <div className="flex-1 space-y-1 w-full">
                  <label className="text-xs font-bold text-slate-700 block">
                    بەڕێوەبەری کام پڕۆژە بانگهێشت دەکرێت بۆ لای خاوەن هۆلدینگ؟
                  </label>
                  <select
                    value={selectedProjectId || activeProjectsList[0]?.id}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    {activeProjectsList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nameKu || p.name} — بەڕێوەبەری پڕۆژە: {p.projectManager}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedMeetingMode === 'BOARD_GENERAL' && (
                <div className="flex-1 text-xs text-slate-600">
                  <strong className="text-slate-900">ئەنجوومەنی گشتی:</strong> خاوەن هۆلدینگ لەگەڵ سەرجەم بەڕێوەبەرانی گشتی کە لەلایەن سوپەر ئەدمینەوە زیادکراون.
                </div>
              )}

              <button
                type="button"
                onClick={() => handleLaunchConfiguredMeeting(selectedMeetingMode)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition transform active:scale-95 shrink-0 cursor-pointer"
              >
                دەستپێکردنی کۆبوونەوە بەم پێکهاتەیە ▶
              </button>

            </div>

          </div>
        )}

        {/* PERSONAL HEADPHONES & MULTI-LANGUAGE AUDIO INTERPRETATION DECK (هێذفۆن و وەرگێڕانی هاوکاتی دەنگ) */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Headphone Status Indicator */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                  isHeadphoneConnected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Headphones className="w-6 h-6 animate-pulse" />
                </div>
                {isHeadphoneConnected && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                    <span>سیستەمی هێذفۆنی وەرگێڕانی ڕاستەوخۆ</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                      Live Audio Interpreting
                    </span>
                  </h3>
                </div>
                <p className="text-[11px] text-indigo-200/90 mt-0.5">
                  هێذفۆن بخەرە گوێت — هەرکەسێک بە زمانی خۆی قسە بکات، تۆ بە زمانی دڵخوازی خۆت دەنگەکە دەبیستیت
                </p>
              </div>
            </div>

            {/* Earphone Language Channel Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-300">کەناڵی دەنگی هێذفۆن:</span>

              {/* Kurdish Channel */}
              <button
                onClick={() => {
                  setHeadphoneChannelLang('ku');
                  playVoiceSynthesis('کەناڵی دەنگی کوردی هەڵبژێردرا', 'ku');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  headphoneChannelLang === 'ku'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                <span>☀️ کەناڵی کوردی</span>
                {headphoneChannelLang === 'ku' && <Check className="w-3.5 h-3.5" />}
              </button>

              {/* Arabic Channel */}
              <button
                onClick={() => {
                  setHeadphoneChannelLang('ar');
                  playVoiceSynthesis('تم اختيار القناة الصوتية العربية', 'ar');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  headphoneChannelLang === 'ar'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                <span>🇮🇶 القناة العربية</span>
                {headphoneChannelLang === 'ar' && <Check className="w-3.5 h-3.5" />}
              </button>

              {/* English Channel */}
              <button
                onClick={() => {
                  setHeadphoneChannelLang('en');
                  playVoiceSynthesis('English audio channel selected', 'en');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  headphoneChannelLang === 'en'
                    ? 'bg-blue-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                <span>🇬🇧 English Channel</span>
                {headphoneChannelLang === 'en' && <Check className="w-3.5 h-3.5" />}
              </button>

              {/* Headphone Audio Test Button */}
              <button
                onClick={handleTestHeadphones}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/50 hover:bg-indigo-600 text-indigo-100 border border-indigo-400/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="تاقیکردنەوەی دەنگ لە ناو هێذفۆن"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-200" />
                <span>تاقیکردنەوەی هێذفۆن</span>
              </button>
            </div>

          </div>

          {/* Equalizer & Audio Options bar */}
          <div className="mt-3 pt-3 border-t border-indigo-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-indigo-300 text-[11px]">
                <AudioLines className={`w-4 h-4 ${isSpeakingNow ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                <span>دۆخی دەنگ: {isSpeakingNow ? 'قسەکەر دەبیسترێت (Speaking...)' : 'ئامادە بۆ وەرگێڕان'}</span>
              </div>

              <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutoVoicePlay}
                  onChange={(e) => setIsAutoVoicePlay(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>خوێندنەوەی ڕاستەوخۆ بە دەنگ بۆ ناو گوێ</span>
              </label>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>خێرایی دەنگ:</span>
              <button
                onClick={() => setSpeechRate(0.85)}
                className={`px-2 py-0.5 rounded ${speechRate === 0.85 ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
              >
                0.85x
              </button>
              <button
                onClick={() => setSpeechRate(1.0)}
                className={`px-2 py-0.5 rounded ${speechRate === 1.0 ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
              >
                1.0x
              </button>
              <button
                onClick={() => setSpeechRate(1.2)}
                className={`px-2 py-0.5 rounded ${speechRate === 1.2 ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}
              >
                1.2x
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Main Video Conference Stage & Attendees Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Video Grid, Screen Share & Live AI Closed Captions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm relative text-white">
            
            {/* Screen Share View */}
            {isScreenSharing && (
              <div className="aspect-video w-full bg-slate-950 border border-blue-500/40 rounded-2xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden mb-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                  <Monitor className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-base font-extrabold text-white">
                  Sharing Screen: SAS4ERP Holding Operational Master Financial Dashboard
                </h3>
                <p className="text-xs text-slate-400 max-w-md mt-1">
                  Broadcasting live subsidiary budget allocations, gate scanner throughput, and open purchase orders to all attendees.
                </p>
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                  ● Live Broadcast
                </span>
              </div>
            )}

            {/* Video Participants Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3.5">
              {currentMeeting.attendees.map((attendee, idx) => {
                const isOwner = attendee.category === 'OWNER' || attendee.role.includes('Owner') || attendee.role.includes('Chairman');
                const isGM = attendee.category === 'GM' || attendee.role.includes('General Manager') || attendee.role.includes('بەڕێوەبەری گشتی');
                const isPM = attendee.category === 'PM' || attendee.role.includes('Project Manager') || attendee.role.includes('بەڕێوەبەری پڕۆژە');

                return (
                  <div
                    key={idx}
                    className="aspect-video sm:aspect-4/3 bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/50 transition shadow-sm"
                  >
                    {/* Top Row: Tag / Role & Mic */}
                    <div className="flex items-center justify-between z-10 gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isOwner && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-400" />
                            خاوەن هۆلدینگ / CEO
                          </span>
                        )}
                        {isGM && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-purple-400" />
                            بەڕێوەبەری گشتی (GM)
                          </span>
                        )}
                        {isPM && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-emerald-400" />
                            بەڕێوەبەری پڕۆژە (PM)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {attendee.isAudioOn ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Mic className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <MicOff className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Avatar Center with pulse */}
                    <div className="flex flex-col items-center justify-center my-auto">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-3xl shadow-lg relative group-hover:scale-105 transition transform">
                        {attendee.avatar}
                        {isSpeakingNow && activeSubtitle.speaker.includes(attendee.name.split(' ')[0]) && (
                          <span className="absolute -inset-1 rounded-2xl border-2 border-emerald-400 animate-ping opacity-75" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-white mt-2 text-center truncate max-w-[200px]">
                        {attendee.name}
                      </span>
                      <span className="text-[10px] text-slate-400 text-center truncate max-w-[220px]">
                        {attendee.role} • {attendee.company}
                      </span>
                    </div>

                    {/* Bottom Action: Trigger Speech button for this Manager */}
                    <div className="z-10 bg-slate-900/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 border border-slate-800">
                      <span className="text-[10px] text-slate-400 truncate">
                        زمانی قسەکەر: {attendee.nativeLang === 'en' ? 'English' : attendee.nativeLang === 'ar' ? 'العربية' : 'کوردی'}
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => triggerAttendeeSpeech(attendee)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition shadow-xs cursor-pointer active:scale-95 shrink-0"
                        title="دەستپێکردنی قسەکردنی ئەم بەڕێوەبەرە بە زمانی خۆی تا لە ناو هێذفۆنەکە وەرگێڕانەکەی ببیستیت"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>قسەکردن 🎙️</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* LIVE AI VOICE & CLOSED CAPTIONS BANNER (ژێرنووس و وەرگێڕانی هاوکاتی دەنگ) */}
            {isCaptionsEnabled && activeSubtitle && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/40 backdrop-blur-md shadow-xl space-y-2 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                      <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
                      وەرگێڕانی دەنگ بۆ ناو هێذفۆن
                    </span>
                    <span className="text-[11px] font-bold text-amber-400">
                      {activeSubtitle.speaker}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({activeSubtitle.speakerRole})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playVoiceSynthesis(activeSubtitle.translatedText, activeSubtitle.targetLang)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold transition cursor-pointer"
                      title="گوێگرتن لەم دەنگە بە وەرگێڕدراوی"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-indigo-300" />
                      <span>{isSpeakingNow ? 'دەنگ لە ناو هێذفۆندایە...' : 'گوێگرتن لە دەنگ'}</span>
                    </button>
                  </div>
                </div>

                {/* Subtitle Body: Original + Translated */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex items-start gap-2 text-slate-400">
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                      دەنگی سەرەکی ({activeSubtitle.sourceLang.toUpperCase()}):
                    </span>
                    <p className="italic text-slate-300 text-[11px] leading-relaxed">
                      "{activeSubtitle.originalText}"
                    </p>
                  </div>

                  <div className="flex items-start gap-2 text-white">
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold shrink-0">
                      لە ناو هێذفۆن ({activeSubtitle.targetLang.toUpperCase()}):
                    </span>
                    <p className="font-semibold text-emerald-300 text-sm leading-relaxed flex-1">
                      {activeSubtitle.translatedText}
                    </p>
                    {isSpeakingNow && (
                      <AudioLines className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Conference Control Toolbar */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={toggleMicrophoneLive}
                className={`px-4 py-2.5 rounded-2xl border font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md ${
                  isListeningMic
                    ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-500 text-white'
                }`}
                title="قسەبکە بۆ وەرگێڕانی ڕاستەوخۆ بە دەنگ و نووسین"
              >
                <Mic className="w-4 h-4" />
                <span>{isListeningMic ? 'دەنگی تۆ دەبیسترێت... (Listening)' : 'قسەبکە و وەربگێڕە (Push to Talk)'}</span>
              </button>

              <button
                onClick={() => setIsCaptionsEnabled(!isCaptionsEnabled)}
                className={`p-3 rounded-2xl border transition cursor-pointer ${
                  isCaptionsEnabled
                    ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
                title={isCaptionsEnabled ? 'ژێرنووس و وەرگێڕان چالاکە' : 'ژێرنووس و وەرگێڕان ناچالاکە'}
              >
                <Captions className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className={`p-3 rounded-2xl border transition cursor-pointer ${
                  isAudioMuted
                    ? 'bg-rose-600/20 border-rose-500 text-rose-400'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoDisabled(!isVideoDisabled)}
                className={`p-3 rounded-2xl border transition cursor-pointer ${
                  isVideoDisabled
                    ? 'bg-rose-600/20 border-rose-500 text-rose-400'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title={isVideoDisabled ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-3 rounded-2xl border transition cursor-pointer ${
                  isScreenSharing
                    ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title="Share Screen"
              >
                <Monitor className="w-5 h-5" />
              </button>

              <button
                onClick={() => endMeeting(currentMeeting.id)}
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>کۆتایی بە کۆبوونەوە</span>
              </button>
            </div>

          </div>

          {/* AI Generated Minutes of Meeting / Formal Record */}
          {currentMeeting.meetingMinutes && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-600 font-extrabold text-sm">
                <FileText className="w-4 h-4" />
                <span>Executive Minutes of Meeting (کۆنووسی فەرمی کۆبوونەوە)</span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-line border border-slate-200">
                {currentMeeting.meetingMinutes}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Agenda, Trilingual Notes & Live Room Chat with Translation */}
        <div className="space-y-4">
          
          {/* Meeting Agenda */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>کارنامەی کۆبوونەوە (Meeting Agenda)</span>
            </h3>
            <div className="space-y-2">
              {currentMeeting.agenda.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Discussion Notes with 1-Click Translation */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                تێبینی و بڕیارەکان (Live Notes)
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleTranslateNotes('ku')}
                  disabled={isTranslatingNotes}
                  className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold transition cursor-pointer"
                  title="وەرگێڕانی تێبینی بۆ کوردی"
                >
                  بۆ کوردی
                </button>
                <button
                  onClick={() => handleTranslateNotes('ar')}
                  disabled={isTranslatingNotes}
                  className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold transition cursor-pointer"
                  title="ترجمة الملاحظات إلى العربية"
                >
                  للعربية
                </button>
                <button
                  onClick={() => handleTranslateNotes('en')}
                  disabled={isTranslatingNotes}
                  className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold transition cursor-pointer"
                  title="Translate notes to English"
                >
                  To EN
                </button>
              </div>
            </div>
            <textarea
              rows={3}
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-2xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
              placeholder="تێبینی، فەرمان، و ڕێنمایی نوێ بنووسە..."
            />
            {isTranslatingNotes && (
              <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                تێبینییەکان وەردەگێڕدرێن...
              </p>
            )}
          </div>

          {/* Live In-Call Message Feed with Instant Multi-language Translation */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3 flex flex-col h-[380px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>گفتوگۆی ژوور بە وەرگێڕانی دەستبەجێ</span>
              </h3>
              
              <button
                onClick={() => setAutoTranslateChat(!autoTranslateChat)}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                  autoTranslateChat
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
                title="وەرگێڕانی ئۆتۆماتیکی پەیامەکان بۆ زمانی من"
              >
                <Languages className="w-3 h-3 text-blue-600" />
                <span>{autoTranslateChat ? 'وەرگێڕان چالاکە' : 'وەرگێڕان ناچالاکە'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {chatLog.map((chat) => {
                const targetText =
                  autoTranslateChat && chat.translatedText && chat.translatedText[language]
                    ? chat.translatedText[language]
                    : chat.text;
                const isDifferentFromOriginal = targetText !== chat.text;

                return (
                  <div key={chat.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-bold text-slate-900 truncate max-w-[150px]">{chat.sender}</span>
                      <span>{chat.time}</span>
                    </div>

                    <div className="flex items-start justify-between gap-1">
                      <p className="text-slate-800 leading-snug font-medium">
                        {targetText}
                      </p>
                      
                      <button
                        onClick={() => playVoiceSynthesis(targetText, language)}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer shrink-0"
                        title="گوێگرتن لەم پەیامە بە دەنگ"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isDifferentFromOriginal && (
                      <p className="text-[10px] text-slate-400 border-t border-slate-100/80 pt-1 italic">
                        دەقی سەرەکی: "{chat.text}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="پەیام بنووسە بە هەر زمانێک..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={toggleMicrophoneLive}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isListeningMic ? 'bg-rose-500 text-white border-rose-600 animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title="دەنگ بنێرە بۆ وەرگێڕان"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
                title="ناردن"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
