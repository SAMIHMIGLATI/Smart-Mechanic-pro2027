
import React, { useState, useEffect } from 'react';
import { Truck, Globe, User, LogOut, Info, X, Crown, Code2, AlertOctagon, ArrowRight, ArrowLeft, Mic, MicOff, ChevronDown, Coins, Home, HelpCircle, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { TruckBrand, Language, User as UserType } from '../types';
import { translations } from '../utils/translations';
import { soundEngine } from '../utils/sound.ts';

interface HeaderProps {
  selectedBrand?: TruckBrand;
  selectedModel?: string;
  lang: Language;
  onLangChange: (lang: Language) => void;
  user: UserType | null;
  onLogout: () => void;
  onLoginClick: () => void;
  onLogoClick: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  onHome?: () => void;
  isListening?: boolean;
  onVoiceToggle?: () => void;
  voiceSupported?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  selectedBrand, 
  lang, 
  onLangChange, 
  user, 
  onLogout, 
  onLoginClick, 
  onLogoClick,
  showBackButton = false,
  onBack,
  onHome,
  isListening = false,
  onVoiceToggle,
  voiceSupported = false
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Support Form State
  const [errorType, setErrorType] = useState('');
  const [issueText, setIssueText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const handleClickOutside = () => {
      setShowLangMenu(false);
      setShowUserMenu(false);
    };
    if (showLangMenu || showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showLangMenu, showUserMenu]);

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueText.trim()) return;
    
    setIsSubmitting(true);
    soundEngine.playClick();
    
    // Simulate report submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      soundEngine.playSuccess();
      setTimeout(() => {
        setShowHelpModal(false);
        setIsSubmitted(false);
        setErrorType('');
        setIssueText('');
      }, 2000);
    }, 1500);
  };

  return (
    <>
      <header className="relative z-50">
        <div className="bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-all duration-300">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-3">
                {showBackButton && (
                  <button
                    onClick={(e) => { e.stopPropagation(); soundEngine.playClick(); if (onBack) onBack(); }}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center border border-white/5 transition-all active:scale-95"
                  >
                    {lang === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                  </button>
                )}

                {showBackButton && onHome && (
                  <button
                    onClick={(e) => { e.stopPropagation(); soundEngine.playClick(); onHome(); }}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center border border-white/5 transition-all active:scale-95 hidden md:flex"
                  >
                    <Home className="w-5 h-5" />
                  </button>
                )}

                <div 
                  onClick={(e) => { e.stopPropagation(); soundEngine.playSuccess(); onLogoClick(); }}
                  className="flex items-center gap-3 cursor-pointer group select-none"
                >
                  <div className="relative w-11 h-11 bg-gradient-to-br from-red-600 to-black rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20 border border-red-500/30 group-hover:border-red-500/60 transition-all duration-300 group-hover:scale-105">
                     <Truck className="w-6 h-6 text-white relative z-10 drop-shadow-md" />
                  </div>
                  <div className="hidden xs:flex flex-col">
                    <h1 className="text-xl font-black tracking-tighter uppercase leading-none text-white group-hover:text-red-50 transition-colors">
                      SMART<span className="text-red-600">.</span>
                    </h1>
                    <div className="flex items-center gap-1.5">
                       <span className="text-[10px] text-zinc-400 font-bold tracking-[0.25em] uppercase group-hover:text-red-400 transition-colors">
                         PRO TECHNIK
                       </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-3">
                {user && (
                  <div className="hidden md:flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400">{user.points || 0}</span>
                  </div>
                )}

                {voiceSupported && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); if (onVoiceToggle) onVoiceToggle(); }}
                    className={`relative p-2.5 rounded-full transition-all duration-300 border active:scale-95
                      ${isListening ? 'bg-red-600/20 text-red-500 border-red-500/50' : 'bg-white/5 text-zinc-400 hover:text-white border-white/5'}`}
                  >
                    {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
                  </button>
                )}

                <button 
                  onClick={(e) => { e.stopPropagation(); soundEngine.playClick(); setShowHelpModal(true); }}
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-full transition-all border border-white/5"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); soundEngine.playClick(); setShowAboutModal(true); }}
                  className="hidden sm:flex p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-full transition-all border border-white/5"
                >
                  <Info className="w-5 h-5" />
                </button>

                <div className="relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); soundEngine.playClick(); setShowLangMenu(!showLangMenu); }}
                    className="h-10 px-3 rounded-full flex items-center gap-2 transition-all border bg-white/5 text-zinc-400 border-white/5"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">{lang}</span>
                  </button>
                  {showLangMenu && (
                    <div className="absolute top-full right-0 mt-2 w-36 bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden z-50">
                      <div className="p-1.5 space-y-0.5">
                        {['ar', 'en', 'fr'].map((l) => (
                          <button 
                            key={l}
                            onClick={() => { onLangChange(l as Language); setShowLangMenu(false); }}
                            className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${lang === l ? 'bg-red-600/10 text-red-500' : 'text-zinc-400 hover:bg-white/5'}`}
                          >
                            {l === 'ar' ? 'العربية' : l === 'en' ? 'English' : 'Français'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); soundEngine.playClick(); user ? setShowUserMenu(!showUserMenu) : onLoginClick(); }} className="group relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 overflow-hidden ${user ? 'border-amber-500/50' : 'border-white/10'}`}>
                      {user ? <span className="font-black text-xs text-white">{user.name.charAt(0).toUpperCase()}</span> : <User className="w-4 h-4 text-zinc-400" />}
                    </div>
                  </button>
                  {showUserMenu && user && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden z-50">
                      <div className="p-4 border-b border-white/5 bg-white/5">
                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      </div>
                      <div className="p-1.5">
                        <button onClick={onLogout} className="w-full text-right px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-bold flex items-center justify-end gap-2">
                          {t.logout}
                          <LogOut className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Support / Help Modal (Refined as requested) */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowHelpModal(false)}></div>
          <div className="relative bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
             
             {isSubmitted ? (
               <div className="p-12 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    {/* Fixed: Added CheckCircle to imports to solve "Cannot find name 'CheckCircle'" error */}
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t.reportSent}</h3>
                  <p className="text-zinc-400 text-sm">We will get back to you shortly.</p>
               </div>
             ) : (
               <>
                 <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-950/50">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                       <AlertCircle className="w-6 h-6 text-red-500" />
                       {t.howItWorks}
                    </h3>
                    <button onClick={() => setShowHelpModal(false)} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 transition-colors">
                       <X className="w-5 h-5" />
                    </button>
                 </div>
                 
                 <form onSubmit={handleSupportSubmit} className="p-6 space-y-6">
                    <div className="bg-red-600/10 p-4 rounded-2xl border border-red-500/20">
                      <p className="text-sm text-zinc-300 leading-relaxed italic">
                        {t.supportDesc}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t.errorType}</label>
                      <select 
                        value={errorType}
                        onChange={(e) => setErrorType(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-red-500 transition-colors"
                        required
                      >
                        <option value="">-- {lang === 'ar' ? 'اختر النوع' : 'Select Type'} --</option>
                        <option value="diag">Diagnostic Error</option>
                        <option value="ui">UI/Interface Bug</option>
                        <option value="auth">Account/Login Issue</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t.issueDescription}</label>
                      <textarea 
                        value={issueText}
                        onChange={(e) => setIssueText(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white h-32 outline-none focus:border-red-500 transition-colors resize-none"
                        placeholder="..."
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-900/20 flex items-center justify-center gap-3 transition-all"
                    >
                      {isSubmitting ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                        <>
                          <Send className="w-5 h-5" />
                          {t.sendReport}
                        </>
                      )}
                    </button>
                    
                    <div className="text-center">
                       <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
                          Samih Pro Technic • v3.5.0
                       </p>
                    </div>
                 </form>
               </>
             )}
          </div>
        </div>
      )}

      {showAboutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowAboutModal(false)}></div>
          <div className="relative bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-md shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-6 pb-8 bg-gradient-to-b from-white/5 to-transparent rounded-t-3xl">
               <button onClick={() => setShowAboutModal(false)} className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full transition-colors z-20">
                  <X className="w-5 h-5" />
               </button>
               <div className="flex flex-col items-center">
                 <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-black rounded-3xl flex items-center justify-center shadow-2xl shadow-red-900/30 mb-4 border border-white/10">
                    <Truck className="w-10 h-10 text-white" />
                 </div>
                 <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">SMART<span className="text-red-500">.</span> MECHANIC</h2>
                 <p className="text-zinc-500 text-xs font-mono mt-2">v3.5.0 PRO TECHNIK</p>
               </div>
            </div>
            <div className="p-6 pt-0 space-y-6">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                <p className="text-zinc-400 text-sm leading-relaxed text-center">
                  {t.aboutAppDesc}
                </p>
              </div>
              <button onClick={() => setShowAboutModal(false)} className="w-full py-4 bg-zinc-800 text-white rounded-2xl font-bold uppercase tracking-wider text-sm">
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
