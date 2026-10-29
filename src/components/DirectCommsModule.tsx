import React, { useState } from 'react';
import {
  PhoneCall,
  Video,
  Send,
  Sparkles,
  MessageSquare,
  Globe,
  Crown,
  Search,
  CheckCheck,
  UserCheck,
  Building2
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';

export const DirectCommsModule: React.FC = () => {
  const {
    companies,
    projects,
    directMessages,
    sendDirectMessage,
    startCallWithManager,
    currentUser,
  } = useERP();

  const { t, language } = useLanguage();

  const [selectedManagerId, setSelectedManagerId] = useState<string>('user-gm-1');
  const [inputText, setInputText] = useState<string>('');
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT' | 'HOLDING_DIRECTIVE'>('HOLDING_DIRECTIVE');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Managers directory
  const managers = companies.map(c => ({
    id: `gm-${c.id}`,
    name: c.generalManager,
    role: 'General Manager',
    company: c.name,
    phone: c.gmPhone,
    email: c.gmEmail,
    avatar: '👔',
    status: 'Online',
  }));

  const activeManager = managers.find(m => m.id === selectedManagerId) || managers[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendDirectMessage(activeManager.id, inputText, priority);
    setInputText('');
  };

  const handleAiTranslate = async () => {
    if (!inputText) return;
    setIsTranslating(true);
    try {
      const targetLang = language === 'ku' ? 'ar' : language === 'ar' ? 'en' : 'ku';
      const res = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          targetLanguage: targetLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) {
          setInputText(data.translatedText);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <PhoneCall className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t('navContactManagers')} & Direct Dispatch
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immediate 1-on-1 audio/video line, encrypted executive channel, and multilingual translated messaging.
          </p>
        </div>
      </div>

      {/* Main Comms Split Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Directors Directory */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Holding Executive Roster
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
              {managers.length} Online
            </span>
          </div>

          <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
            {managers.map((mgr) => {
              const isSelected = activeManager.id === mgr.id;
              return (
                <div
                  key={mgr.id}
                  onClick={() => setSelectedManagerId(mgr.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition flex items-center justify-between ${
                    isSelected ? 'bg-blue-50/80 border border-blue-200 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
                      {mgr.avatar}
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-xs text-slate-900">{mgr.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{mgr.company}</p>
                      <span className="text-[10px] text-blue-600 font-mono">{mgr.phone}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startCallWithManager(mgr);
                    }}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white transition cursor-pointer"
                    title="Direct Call"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Direct Messaging & Command Console */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col h-[600px]">
          
          {/* Active Manager Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-2xl">
                {activeManager.avatar}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{activeManager.name}</h3>
                <p className="text-xs text-slate-500">{activeManager.role} • {activeManager.company}</p>
                <span className="text-[11px] text-blue-600 font-mono">{activeManager.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => startCallWithManager(activeManager)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Directly</span>
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
            {directMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const isDirective = msg.priority === 'HOLDING_DIRECTIVE';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-xs ${
                      isMe
                        ? isDirective
                          ? 'bg-amber-500 text-white rounded-tr-none'
                          : 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-100 border border-slate-200 text-slate-900 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] opacity-80 mb-0.5">
                      <span className="font-bold">{msg.senderName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    {isDirective && (
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/20 text-white text-[9px] font-extrabold">
                        <Crown className="w-2.5 h-2.5" /> HOLDING DIRECTIVE
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-line">{msg.messageText}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input with AI Translation */}
          <form onSubmit={handleSendMessage} className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">Priority:</span>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2 py-0.5 text-xs font-semibold focus:bg-white focus:outline-none"
                >
                  <option value="HOLDING_DIRECTIVE">👑 Holding Directive</option>
                  <option value="URGENT">⚡ Urgent Priority</option>
                  <option value="NORMAL">Standard Message</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAiTranslate}
                disabled={isTranslating || !inputText}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isTranslating ? 'Translating...' : 'Translate to Other Lang (AI)'}</span>
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type executive instruction, directive, or feedback..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition transform active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch</span>
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
};
