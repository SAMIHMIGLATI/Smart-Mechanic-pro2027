
import React, { useState, useEffect } from 'react';
import { AppMode, TruckBrand, Language, User } from '../types';
import { Search, Code2, Bluetooth, Gift, Share2, Truck, Crown, Info, ArrowRight, BookOpen, LayoutDashboard, Activity, X, ShieldCheck, Settings, Coins, User as UserIcon, ToggleLeft, ToggleRight, Calendar, Hash, Gauge, Camera, AlertCircle, Star } from 'lucide-react';
import { translations } from '../utils/translations';
import { soundEngine } from '../utils/sound';
import PaymentModal from './PaymentModal';
import { TruckSchematic } from './TruckSchematic';

interface HomeDashboardProps {
  onNavigate: (mode: AppMode) => void;
  onSearchRequest: (term: string) => void;
  selectedBrand?: TruckBrand;
  onSelectBrand: (brand: TruckBrand | undefined) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  lang: Language;
  user: User | null;
  onUpgrade?: () => void;
  onAddPoints?: (amount: number) => void;
}

const brandLogos: Record<TruckBrand, string> = {
  Renault: 'https://cdn.simpleicons.org/renault/FFCC33',
  Volvo: 'https://cdn.simpleicons.org/volvo/14296C',
  Scania: 'https://cdn.simpleicons.org/scania/041E42',
  MAN: 'https://cdn.simpleicons.org/man/E40045',
  DAF: 'https://cdn.simpleicons.org/daf/005C94',
  Iveco: 'https://cdn.simpleicons.org/iveco/004899',
  Ford: 'https://cdn.simpleicons.org/ford/003399',
};

const truckModels: Record<TruckBrand, string[]> = {
  Renault: ['Magnum', 'Premium', 'Kerax', 'Midlum', 'T Series', 'C Series', 'K Series', 'D Series', 'E-Tech'],
  Volvo: ['FH', 'FM', 'FMX', 'FL', 'VNL', 'VNR', 'VNX'],
  Scania: ['3-Series', '4-Series', 'P-Series', 'G-Series', 'R-Series', 'S-Series', 'XT-Range'],
  MAN: ['TGX', 'TGS', 'TGM', 'TGL', 'eTGM'],
  DAF: ['XF', 'XG', 'XG+', 'CF', 'XD', 'LF'],
  Iveco: ['Stralis / S-Way', 'Eurocargo', 'Trakker', 'Daily', 'eDaily'],
  Ford: ['F-MAX', 'Cargo'],
};

const HomeDashboard: React.FC<HomeDashboardProps> = ({ 
  onNavigate, 
  onSearchRequest, 
  selectedBrand, 
  onSelectBrand,
  selectedModel,
  onSelectModel,
  lang,
  user,
  onUpgrade,
  onAddPoints
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [year, setYear] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [mileage, setMileage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [giftAvailable, setGiftAvailable] = useState(false);
  const [giftTimeLeft, setGiftTimeLeft] = useState('');
  const [showSchematicModal, setShowSchematicModal] = useState(false);
  const [showCodeGuideModal, setShowCodeGuideModal] = useState(false);
  
  const [showAboutSettings, setShowAboutSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'info' | 'security' | 'settings'>('info');
  const [rewardsEnabled, setRewardsEnabled] = useState(true);
  const [proEnabled, setProEnabled] = useState(user?.isPro || false);

  const t = translations[lang];

  useEffect(() => {
    const checkGiftStatus = () => {
      const lastClaim = localStorage.getItem('last_daily_gift');
      if (!lastClaim) {
        setGiftAvailable(true);
      } else {
        const lastDate = new Date(parseInt(lastClaim));
        const now = new Date();
        const diffMs = now.getTime() - lastDate.getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;

        if (diffMs >= oneDayMs) {
          setGiftAvailable(true);
        } else {
          setGiftAvailable(false);
          const remainingMs = oneDayMs - diffMs;
          const hours = Math.floor(remainingMs / (1000 * 60 * 60));
          const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          setGiftTimeLeft(`${hours}h ${minutes}m`);
        }
      }
    };

    checkGiftStatus();
    const interval = setInterval(checkGiftStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleClaimGift = () => {
    if (!rewardsEnabled) return;
    if (giftAvailable && onAddPoints) {
      onAddPoints(100);
      localStorage.setItem('last_daily_gift', Date.now().toString());
      setGiftAvailable(false);
      soundEngine.playSuccess();
      alert(lang === 'ar' ? '🎁 مبروك! حصلت على 100 نقطة' : '🎁 Congrats! You got 100 Points');
    }
  };

  const handleShareApp = async () => {
    if (!rewardsEnabled) return;
    const shareData = {
      title: 'Smart Mechanic Pro',
      text: lang === 'ar' ? 'أقوى تطبيق لتشخيص أعطال الشاحنات بالذكاء الاصطناعي! حمله الآن.' : 'The best AI Truck Diagnostic App! Download now.',
      url: window.location.href || 'https://smart-mechanic-app.com'
    };

    try {
      const safeUrl = window.location.href.startsWith('http') ? window.location.href : 'https://smart-mechanic-app.com';
      if (navigator.share && navigator.canShare({ url: safeUrl })) {
        await navigator.share({ ...shareData, url: safeUrl });
        if (onAddPoints) {
          onAddPoints(50);
          soundEngine.playSuccess();
        }
      } else {
        throw new Error('Share API not supported');
      }
    } catch (err) {
      try {
         const textToCopy = `${shareData.text} ${shareData.url}`;
         await navigator.clipboard.writeText(textToCopy);
         const msg = lang === 'ar' 
             ? 'تم نسخ الرابط! شاركه مع أصدقائك في واتساب أو فيسبوك لتربح النقاط.' 
             : 'Link copied! Share it on WhatsApp or Facebook to earn points.';
         alert(msg);
         if (onAddPoints) {
            onAddPoints(10);
            soundEngine.playClick();
         }
      } catch (clipboardErr) {
         console.error('Clipboard failed', clipboardErr);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) onSearchRequest(searchTerm);
  };

  const handleConvertGems = () => {
     if (!user || !onAddPoints || !onUpgrade) return;
     if ((user.points || 0) >= 500) {
        onAddPoints(-500);
        onUpgrade();
        setProEnabled(true);
        soundEngine.playSuccess();
        alert(lang === 'ar' ? 'تم تفعيل النسخة الاحترافية بنجاح!' : 'PRO version activated successfully!');
     } else {
        soundEngine.playError();
        alert(t.insufficientGems);
     }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 4) {
        setYear(val);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 relative">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 h-64 group bg-black">
        <img 
          src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1600&auto=format&fit=crop" 
          alt="Scania Truck" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-600/20 to-transparent h-[20%] w-full animate-[scan-line_3s_linear_infinite] pointer-events-none border-t border-b border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.5)]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
        
        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          <div>
             <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter italic">
               SMART
               <span className="text-red-600 block text-4xl md:text-6xl">MECHANIC PRO</span>
             </h1>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative max-w-md mt-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.quickSearch}
              className="w-full h-12 pl-12 pr-20 bg-white/10 border border-white/20 rounded-xl text-white placeholder-zinc-400 focus:border-red-500 focus:bg-black/60 outline-none transition-all backdrop-blur-md"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <button type="submit" className="absolute right-1 top-1 bottom-1 bg-red-600 hover:bg-red-500 text-white px-4 rounded-lg text-xs font-bold">
              SCAN
            </button>
          </form>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-zinc-100 flex flex-col gap-6">
        <div className="space-y-3">
          <label className="text-sm font-bold text-zinc-600 uppercase tracking-wide flex items-center gap-2">
            <Truck className="w-4 h-4 text-red-600" />
            {t.selectBrand}
          </label>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {(Object.keys(brandLogos) as TruckBrand[]).map((brand) => (
              <button
                key={brand}
                onClick={() => {
                  soundEngine.playClick();
                  if (selectedBrand === brand) {
                    onSelectBrand(undefined); 
                    onSelectModel('');
                  } else {
                    onSelectBrand(brand);
                    onSelectModel('');
                  }
                }}
                className={`flex-shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border-2 relative overflow-hidden group
                  ${selectedBrand === brand 
                    ? 'border-red-600 bg-red-50 shadow-lg scale-105' 
                    : 'border-zinc-100 bg-white hover:border-red-200 hover:shadow-md'}`}
              >
                <img src={brandLogos[brand]} alt={brand} className="w-8 h-8 object-contain transition-transform group-hover:scale-110" />
                <span className={`text-[10px] font-bold ${selectedBrand === brand ? 'text-red-700' : 'text-zinc-600'}`}>
                  {brand}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className={`space-y-3 transition-all duration-500 ${selectedBrand ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>
          <label className="text-sm font-bold text-zinc-600 uppercase tracking-wide flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-red-600" />
            {t.selectModel}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedBrand && truckModels[selectedBrand]?.map((model) => (
              <button
                key={model}
                onClick={() => {
                  soundEngine.playClick();
                  onSelectModel(model);
                }}
                className={`py-3 px-4 rounded-xl text-sm font-bold text-center transition-all border-2
                  ${selectedModel === model 
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg transform scale-105' 
                    : 'bg-zinc-50 text-zinc-600 border-zinc-100 hover:border-zinc-300 hover:bg-white'}`}
              >
                {model}
              </button>
            ))}
          </div>
        </div>

        <div className={`space-y-4 transition-all duration-500 ${selectedModel ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>
           <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                {t.productionYear}
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={year}
                onChange={handleYearChange}
                placeholder={t.enterYear}
                className="w-full h-14 pl-4 pr-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-lg font-mono font-bold text-zinc-800 focus:border-red-600 focus:bg-white outline-none transition-all shadow-sm"
              />
           </div>
           {/* ... Other inputs remain same ... */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-red-500" />
                {lang === 'ar' ? 'رقم المحرك' : 'Engine Number'}
              </label>
              <input
                type="text"
                value={engineNumber}
                onChange={(e) => setEngineNumber(e.target.value)}
                placeholder="Ex: D13K..."
                className="w-full h-14 pl-4 pr-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-lg font-mono font-bold text-zinc-800 focus:border-red-600 focus:bg-white outline-none transition-all shadow-sm"
              />
           </div>
        </div>

        <button
          onClick={() => {
            soundEngine.playSuccess();
            onNavigate(AppMode.DECODER);
          }}
          disabled={!selectedModel}
          className={`w-full py-4 rounded-xl font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 group
            ${selectedModel 
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600' 
              : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}
        >
          {t.checkCode}
          <ArrowRight className={`w-6 h-6 transition-transform ${selectedModel ? 'group-hover:translate-x-1' : ''}`} />
        </button>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
         <div onClick={() => onNavigate(AppMode.OBD)} className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-red-500 transition-all h-36">
            <Gauge className="w-6 h-6 text-white" />
            <span className="text-sm font-bold text-white">{lang === 'ar' ? 'فحص OBD' : 'OBD Check'}</span>
         </div>
         <div onClick={() => onNavigate(AppMode.DECODER)} className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-red-500 transition-all h-36">
            <Camera className="w-6 h-6 text-white" />
            <span className="text-sm font-bold text-white">{lang === 'ar' ? 'مسح الكود' : 'Scan Code'}</span>
         </div>
         <div onClick={() => setShowSchematicModal(true)} className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-red-500 transition-all h-36">
            <Truck className="w-6 h-6 text-white" />
            <span className="text-sm font-bold text-white">{lang === 'ar' ? 'بيانات الشاحنة' : 'Truck Data'}</span>
         </div>
         <div onClick={() => setShowPaymentModal(true)} className="bg-gradient-to-br from-yellow-400 to-amber-600 p-4 rounded-2xl border border-yellow-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-all h-36">
            <Star className="w-6 h-6 fill-white text-white" />
            <span className="text-sm font-black text-white uppercase tracking-wider text-center">VIP Premium</span>
         </div>
         <div onClick={handleClaimGift} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all h-36 ${giftAvailable ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
            <Gift className="w-6 h-6" />
            <span className="text-xs font-bold">{giftAvailable ? (lang === 'ar' ? 'استلم الهدية!' : 'Claim Gift!') : t.dailyGift}</span>
         </div>
         <div onClick={handleShareApp} className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500 transition-all h-36">
            <Share2 className="w-6 h-6 text-white" />
            <span className="text-xs font-bold text-white">{t.shareWin}</span>
         </div>
      </div>
      
      {/* Footer Branding Removed as per request */}

      {showPaymentModal && (
        <PaymentModal 
          onClose={() => setShowPaymentModal(false)} 
          onSuccess={() => {
             setShowPaymentModal(false);
             if (onUpgrade) onUpgrade();
          }}
          lang={lang}
          plan="monthly"
        />
      )}

      {showAboutSettings && (
         <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
               <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                  <h3 className="font-bold text-zinc-800 flex items-center gap-2">
                     <Settings className="w-5 h-5 text-red-600" />
                     {t.aboutTitle}
                  </h3>
                  <button onClick={() => setShowAboutSettings(false)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                     <X className="w-5 h-5 text-zinc-500" />
                  </button>
               </div>
               <div className="flex p-2 gap-2 bg-zinc-50 border-b border-zinc-100">
                  {['info', 'security', 'settings'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveSettingsTab(tab as any)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${activeSettingsTab === tab ? 'bg-white shadow text-red-600' : 'text-zinc-500'}`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
               </div>
               <div className="p-6 overflow-y-auto">
                  {activeSettingsTab === 'info' && (
                     <div className="space-y-6 text-center">
                        <div className="w-20 h-20 bg-zinc-900 rounded-3xl mx-auto flex items-center justify-center shadow-xl">
                           <Truck className="w-10 h-10 text-white" />
                        </div>
                        <div>
                           <h2 className="text-2xl font-black text-zinc-900">SMART MECHANIC</h2>
                           <p className="text-zinc-500 text-sm font-mono">v3.0.0 PRO</p>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-right">
                           <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                              {t.aboutAppDesc}
                           </p>
                        </div>
                     </div>
                  )}
                  {activeSettingsTab === 'security' && (
                     <div className="space-y-4 text-right" dir="rtl">
                        <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                           <ShieldCheck className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                           <div>
                              <h4 className="font-bold text-green-800 text-sm">{t.dataEncryption}</h4>
                              <p className="text-xs text-green-700 mt-1">{t.dataEncryptionDesc}</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                           <UserIcon className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                           <div>
                              <h4 className="font-bold text-blue-800 text-sm">{t.secureLogin}</h4>
                              <p className="text-xs text-blue-700 mt-1">{t.secureLoginDesc}</p>
                           </div>
                        </div>
                     </div>
                  )}
                  {activeSettingsTab === 'settings' && (
                     <div className="space-y-6">
                        <div className="space-y-4">
                           <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                              <span className="text-sm font-bold text-zinc-700">{t.toggleRewards}</span>
                              <button onClick={() => setRewardsEnabled(!rewardsEnabled)} className="text-red-600">
                                 {rewardsEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-zinc-300" />}
                              </button>
                           </div>
                        </div>
                        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 text-center">
                           <Coins className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                           <h4 className="font-bold text-amber-800 mb-1">{t.convertGems}</h4>
                           <button 
                             onClick={handleConvertGems}
                             className="w-full py-2 bg-amber-500 text-white rounded-lg font-bold text-sm shadow-lg mt-2"
                           >
                             {t.convertBtn} (500 Gems)
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}

      {showSchematicModal && (
        <TruckSchematic onClose={() => setShowSchematicModal(false)} />
      )}
    </div>
  );
};

export default HomeDashboard;
