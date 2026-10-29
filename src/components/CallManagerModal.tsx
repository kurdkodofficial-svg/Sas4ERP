import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Crown,
  Send,
  Sparkles,
  X,
  FileCheck
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';

export const CallManagerModal: React.FC = () => {
  const {
    isCallModalOpen,
    closeCallModal,
    activeCallingManager,
    currentUser,
    sendDirectMessage,
  } = useERP();

  const { t, language } = useLanguage();

  const [callDuration, setCallDuration] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [quickDirective, setQuickDirective] = useState<string>('');
  const [sentDirectives, setSentDirectives] = useState<string[]>([]);

  useEffect(() => {
    let interval: any;
    if (isCallModalOpen) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCallModalOpen]);

  if (!isCallModalOpen || !activeCallingManager) return null;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDirective.trim()) return;
    sendDirectMessage('user-gm-1', quickDirective, 'HOLDING_DIRECTIVE');
    setSentDirectives(prev => [...prev, quickDirective]);
    setQuickDirective('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Encrypted Direct Line
                </span>
                <span className="text-xs text-slate-500 font-mono">{formatDuration(callDuration)}</span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                {activeCallingManager.name} ({activeCallingManager.role})
              </h2>
            </div>
          </div>

          <button
            onClick={closeCallModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Simulation Feeds */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          
          {/* Manager Feed */}
          <div className="aspect-video bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden text-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800/80 text-slate-200">
                {activeCallingManager.company}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="flex flex-col items-center justify-center my-auto">
              <div className="w-16 h-16 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-3xl shadow-md">
                {activeCallingManager.avatar || '👔'}
              </div>
              <span className="text-xs font-bold text-white mt-2">{activeCallingManager.name}</span>
              <span className="text-[10px] text-slate-400">{activeCallingManager.phone}</span>
            </div>

            <div className="text-[10px] text-emerald-400 font-mono">Audio HD 48kHz • Connected</div>
          </div>

          {/* Caller / Holding Owner Feed */}
          <div className="aspect-video bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden text-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Holding Owner
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>

            <div className="flex flex-col items-center justify-center my-auto">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-3xl shadow-md">
                {currentUser.avatar}
              </div>
              <span className="text-xs font-bold text-white mt-2">{currentUser.name}</span>
            </div>

            <div className="text-[10px] text-slate-400 font-mono">Primary Executive Channel</div>
          </div>

        </div>

        {/* Live Executive Directive Dispatch during Call */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Instant Directive / Task Dispatch</span>
            </span>
            <span className="text-[10px] text-slate-500">Sends priority notification to manager</span>
          </div>

          <form onSubmit={handleSendDirective} className="flex gap-2">
            <input
              type="text"
              placeholder="Type urgent directive (e.g. Expedite gate release for concrete mixer)..."
              value={quickDirective}
              onChange={(e) => setQuickDirective(e.target.value)}
              className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

          {sentDirectives.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {sentDirectives.map((d, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Directive Logged: "{d}"</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-3.5 rounded-2xl border transition cursor-pointer ${
              isAudioMuted ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoMuted(!isVideoMuted)}
            className={`p-3.5 rounded-2xl border transition cursor-pointer ${
              isVideoMuted ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={closeCallModal}
            className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>

      </div>
    </div>
  );
};
