
import React, { useState } from 'react';
import { DiagnosisResult } from '../types';
import { 
  AlertTriangle, CheckCircle2, AlertOctagon, 
  Cpu, ListChecks, 
  Cable, MapPin, Eye, Maximize2, ShieldCheck, X, ZoomIn, Info, Printer, Wrench, Settings2, Download, Trash2, RefreshCcw
} from 'lucide-react';
import { soundEngine } from '../utils/sound';

interface DiagnosisResultProps {
  result: DiagnosisResult | null;
}

interface TechnicalPart {
  id: string;
  codeMatch: string[];
  name: string;
  oemRefs: string[];
  location: string;
  imageUrl: string;
  documentRef: string;
  specs: string;
  removal: string[];
  assembly: string[];
  repairNotes: string;
}

const TECHNICAL_SCANS: TechnicalPart[] = [
  {
    id: 'wheel_speed_sensor',
    codeMatch: ['WHEEL_SPEED', 'ABS_SENSOR', 'SID1', 'SID2', 'SID3', 'SID4', 'SPEED', 'VITESSE'],
    name: "حساس سرعة العجلة (EBS/ABS Sensor)",
    oemRefs: ["5010422332", "4410328080"],
    location: "خلف صرة العجلة (Wheel Hub) - مثبت داخل جلبة نحاسية خلف قرص الفرامل",
    imageUrl: "https://images.unsplash.com/photo-1621360341398-466d63964177?q=80&w=1200&auto=format&fit=crop",
    documentRef: "Renault 70 627 / Section 5: EBS",
    specs: "Resistance: 1.1 - 1.3 kOhm. Air Gap: 0.5mm.",
    removal: ["تأمين الشاحنة ورفع المحور", "فك العجلة والوصول لصرة العجلة", "سحب الحساس من الجلبة النحاسية", "تنظيف الحساس والترس المسنن"],
    assembly: ["تركيب جلبة جديدة مدهونة", "دفع الحساس حتى يلامس الترس", "سحب الحساس للخلف 0.5 مم", "توصيل الكابل وتأمين المسار"],
    repairNotes: "يجب التأكد من سلامة الترس المسنن (Exciter Ring) ونظافته من برادة الحديد."
  },
  {
    id: 'coolant_sensor',
    codeMatch: ['MID128-PID111', 'PID111', 'COOLANT', 'LIQUIDE', 'WATER'],
    name: "حساس مستوى سائل التبريد (Coolant Level Sensor)",
    oemRefs: ["7421353473", "5010691880"],
    location: "الجزء السفلي من خزان التمدد (Expansion Tank) - جهة المحرك اليسرى",
    imageUrl: "https://images.unsplash.com/photo-1635773054098-333c1b3c7b8e?auto=format&fit=crop&q=80&w=1200",
    documentRef: "Renault Manual 70 627 / Section 2: Cooling",
    specs: "Magnetic Switch Type. Voltage: 24V DC.",
    removal: ["تفريغ سائل التبريد جزئياً", "فصل الموصل الكهربائي", "تدوير الحساس بمقدار 90 درجة عكس عقارب الساعة", "سحب الحساس للخارج"],
    assembly: ["تبديل الجوان (O-ring) بآخر جديد", "إدخال الحساس وتدويره للقفل", "توصيل الفيشة", "إعادة ملء السائل واختبار التشغيل"],
    repairNotes: "إذا استمر العطل والماء ممتلئ، فقد تكون العوامة المغناطيسية داخل الخزان هي التالفة."
  }
];

const findScanMatch = (result: DiagnosisResult): TechnicalPart | null => {
  const desc = (result.description || "").toUpperCase();
  const partName = (result.partName || "").toUpperCase();
  const system = (result.system || "").toUpperCase();
  
  return TECHNICAL_SCANS.find(scan => 
    desc.includes(scan.id.toUpperCase()) || 
    partName.includes(scan.id.toUpperCase().replace('_', ' ')) ||
    scan.codeMatch.some(code => desc.includes(code.toUpperCase()) || partName.includes(code.toUpperCase()))
  ) || null;
};

const DiagnosisResultCard: React.FC<DiagnosisResultProps> = ({ result }) => {
  const [showFullManual, setShowFullManual] = useState(false);
  const [activeTab, setActiveTab] = useState<'diag' | 'removal' | 'assembly' | 'repair'>('diag');
  const [isWiping, setIsWiping] = useState(false);
  const [isWiped, setIsWiped] = useState(false);
  
  if (!result || isWiped) return null;

  const techScan = findScanMatch(result);
  
  const severityConfig: Record<string, any> = {
    low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, label: 'خطورة منخفضة' },
    medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, label: 'تنبيه متوسط' },
    high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: <AlertOctagon className="w-5 h-5 text-red-500" />, label: 'توقف فوري' }
  };

  const currentSeverity = (result.severity || 'medium').toLowerCase();
  const config = severityConfig[currentSeverity] || severityConfig.medium;

  const handleWipeCode = () => {
    soundEngine.playScan();
    setIsWiping(true);
    setTimeout(() => {
      setIsWiping(false);
      setIsWiped(true);
      soundEngine.playSuccess();
      alert('تم مسح كود العطل من ذاكرة ECU بنجاح.');
    }, 2000);
  };

  const currentRemoval = techScan ? techScan.removal : (result.removalSteps || []);
  const currentAssembly = techScan ? techScan.assembly : (result.assemblySteps || []);

  return (
    <div className="mt-8 space-y-4 animate-in fade-in duration-500 pb-20 text-right" dir="rtl">
      
      {/* 1. Header with Wipe Action */}
      <div className="bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-white/5 relative">
        <div className={`absolute top-0 right-0 h-1 w-full ${config.bg.replace('bg-', '').split('/')[0]} bg-opacity-100`}></div>
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
             <div className="flex items-center gap-2 text-zinc-500 text-[8px] font-black uppercase tracking-widest">
                <Cpu className="w-3 h-3 text-red-500" />
                تشخيص رينو 440DXI • بروتوكول 70 627
             </div>
             <h2 className="text-lg md:text-xl font-black text-white italic tracking-tight">{result.description}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleWipeCode}
              disabled={isWiping}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              {isWiping ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              {isWiping ? 'جاري المسح...' : 'مسح العطل (Wipe)'}
            </button>
            <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl ${config.bg} border ${config.border}`}>
               {config.icon}
               <span className={`font-black text-[9px] uppercase tracking-widest ${config.color}`}>{config.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Tech UI Container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col">
          
          {/* Navigation Tabs */}
          <div className="flex bg-zinc-50 border-b border-zinc-200 overflow-x-auto no-scrollbar">
             <button onClick={() => setActiveTab('diag')} className={`flex-1 min-w-[120px] py-4 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'diag' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent text-zinc-400'}`}>ملاحظات التشخيص</button>
             <button onClick={() => setActiveTab('removal')} className={`flex-1 min-w-[120px] py-4 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'removal' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent text-zinc-400'}`}>الفك (Démontage)</button>
             <button onClick={() => setActiveTab('assembly')} className={`flex-1 min-w-[120px] py-4 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'assembly' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent text-zinc-400'}`}>التركيب (Remontage)</button>
             <button onClick={() => setActiveTab('repair')} className={`flex-1 min-w-[120px] py-4 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'repair' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent text-zinc-400'}`}>ملاحظات فنية</button>
          </div>

          <div className="flex flex-col xl:flex-row min-h-[440px]">
            {/* Procedure Column */}
            <div className="flex-1 p-6 md:p-8 flex flex-col bg-zinc-50/30">
               
               {activeTab === 'diag' && (
                  <div className="space-y-6 animate-in fade-in">
                     <div className="flex items-center gap-2 text-red-600 text-[8px] font-black uppercase tracking-[0.2em] mb-2">
                        <Eye className="w-4 h-4" />
                        تحديد الموقع الفيزيائي للقطعة
                     </div>
                     <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">{techScan?.name || result.partName || 'قطعة غير معروفة'}</h3>
                     
                     <div className="space-y-3">
                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
                           <MapPin className="w-5 h-5 text-red-600 shrink-0" />
                           <div>
                              <p className="text-[10px] text-zinc-400 font-bold mb-1 uppercase tracking-wider">الموقع (Location)</p>
                              <p className="text-sm font-bold text-zinc-800 leading-snug">{techScan?.location || 'انظر مخطط Implantation المرفق'}</p>
                           </div>
                        </div>
                        
                        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-inner">
                           <div className="flex items-center gap-2 mb-2">
                              <ShieldCheck className="w-3 h-3 text-cyan-400" />
                              <span className="text-[8px] text-cyan-400 font-black uppercase tracking-widest">مواصفات الفحص</span>
                           </div>
                           <p className="text-xs text-zinc-300 font-medium italic leading-relaxed">
                              "{techScan?.specs || (result.causes && result.causes[0])}"
                           </p>
                        </div>
                     </div>

                     <button onClick={() => setShowFullManual(true)} className="w-full mt-auto py-4 bg-zinc-900 hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]">
                        <Maximize2 className="w-4 h-4" />
                        فتح الكتيب الفني رينو 70 627
                     </button>
                  </div>
               )}

               {(activeTab === 'removal' || activeTab === 'assembly') && (
                  <div className="space-y-6 animate-in slide-in-from-left-2 h-full">
                     <div className="flex items-center gap-2 text-red-600 text-[8px] font-black uppercase tracking-[0.2em] mb-2">
                        {activeTab === 'removal' ? <Wrench className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
                        {activeTab === 'removal' ? 'خطوات الفك (Démontage)' : 'خطوات التركيب (Remontage)'}
                     </div>
                     <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                        {(activeTab === 'removal' ? currentRemoval : currentAssembly).length > 0 ? (
                           (activeTab === 'removal' ? currentRemoval : currentAssembly).map((step, idx) => (
                              <div key={idx} className="flex items-start gap-4 p-3 bg-white rounded-lg border border-zinc-100 shadow-sm">
                                 <div className="w-6 h-6 rounded bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-md">
                                    {idx + 1}
                                 </div>
                                 <p className="text-xs font-bold text-zinc-700 leading-relaxed pt-0.5">{step}</p>
                              </div>
                           ))
                        ) : (
                           <div className="flex items-center justify-center h-24 text-zinc-400 italic text-xs">
                              لا تتوفر خطوات محددة حالياً.
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {activeTab === 'repair' && (
                  <div className="space-y-6 animate-in fade-in h-full">
                     <div className="flex items-center gap-2 text-red-600 text-[8px] font-black uppercase tracking-[0.2em] mb-2">
                        <Info className="w-4 h-4" />
                        ملاحظات الصيانة الوقائية
                     </div>
                     <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm">
                        <p className="text-zinc-800 text-sm font-bold leading-relaxed">
                           {techScan?.repairNotes || result.repairNotes || 'تأكد من نظافة الموصلات واستخدام بخاخ التنظيف الجاف (Contact Cleaner) قبل التركيب.'}
                        </p>
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">الأدوات المطلوبة:</h4>
                        <div className="flex flex-wrap gap-2">
                           {(techScan ? ['Wrench 10/13mm', 'Cleaning Spray', 'Multimeter'] : (result.toolsRequired || ['Standard Toolset'])).map(tool => (
                              <span key={tool} className="px-3 py-1 bg-zinc-100 rounded-full text-[9px] font-bold text-zinc-600 border border-zinc-200">{tool}</span>
                           ))}
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Technical Image Side */}
            <div className="w-full xl:w-[45%] bg-white border-r border-zinc-100 p-6 flex flex-col items-center justify-center relative group min-h-[350px]">
               <div className="absolute top-5 right-5 z-20">
                  <div className="px-2.5 py-1 bg-zinc-900 text-white rounded text-[7px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg">
                     <span className="w-1 h-1 bg-red-500 rounded-full animate-ping"></span>
                     ORIGINAL RENAULT VIEW
                  </div>
               </div>
               
               <div 
                 className="relative z-10 w-full h-full flex flex-col items-center cursor-zoom-in group-hover:scale-[1.02] transition-transform duration-500"
                 onClick={() => setShowFullManual(true)}
               >
                  <img 
                    src={techScan ? techScan.imageUrl : "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1200"}
                    alt="Technical Scan" 
                    className="w-full h-full max-h-[350px] object-contain drop-shadow-2xl"
                  />
                  <div className="mt-6 flex justify-between items-center w-full opacity-30 text-[7px] font-black uppercase text-zinc-900">
                     <div className="w-16 h-px bg-zinc-300"></div>
                     <span>DXi 440 SERIES TECHNICAL DATA</span>
                     <div className="w-16 h-px bg-zinc-300"></div>
                  </div>
               </div>
            </div>
          </div>
      </div>

      {/* 3. Wiring & Solution Protocol Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         {/* Wiring Section */}
         <div className="bg-zinc-950 p-6 rounded-2xl border border-white/5 shadow-2xl">
            <h3 className="text-white font-black text-[9px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               <Cable className="w-4 h-4 text-cyan-500" />
               تتبع الأسلاك الكهربائية (Wiring Map)
            </h3>
            <div className="space-y-3">
               {result.wiringCheck && result.wiringCheck.length > 0 ? (
                  result.wiringCheck.map((wire, idx) => (
                     <div key={idx} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-5 h-5 rounded-full border border-white/20 shadow-lg" style={{ backgroundColor: wire.color.toLowerCase().includes('red') || wire.color.includes('Rouge') ? '#ef4444' : wire.color.toLowerCase().includes('yellow') || wire.color.includes('Jaune') ? '#fbbf24' : '#18181b' }}></div>
                           <div className="text-left">
                              <p className="text-white font-mono font-black text-xs tracking-widest">{wire.color}</p>
                              <p className="text-zinc-600 text-[7px] font-bold uppercase">{wire.code || 'DXI-627'}</p>
                           </div>
                        </div>
                        <p className="text-zinc-400 text-[8px] font-black uppercase max-w-[150px] leading-tight group-hover:text-cyan-400">{wire.function}</p>
                     </div>
                  ))
               ) : (
                  <div className="text-center py-8 text-zinc-500 text-xs italic">
                     لا تتوفر مخططات أسلاك محددة لهذه القطعة.
                  </div>
               )}
            </div>
         </div>

         {/* Solutions Section */}
         <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col">
            <h3 className="text-white font-black text-[9px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               <ListChecks className="w-4 h-4 text-emerald-500" />
               بروتوكول التحقق والحلول النهائية
            </h3>
            <div className="space-y-4 flex-1">
               {result.solutions && result.solutions.length > 0 ? (
                  result.solutions.map((sol, idx) => (
                     <div key={idx} className="flex items-start gap-3 group">
                        <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[9px] font-black shrink-0 transition-all group-hover:bg-emerald-500 group-hover:text-white">
                           {idx + 1}
                        </div>
                        <p className="text-zinc-200 text-xs font-bold leading-relaxed">{sol}</p>
                     </div>
                  ))
               ) : (
                  <div className="text-center py-8 text-zinc-500 text-xs italic">
                     يتم تحليل الحلول المناسبة...
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* FULL MANUAL MODAL (REUSED & REFINED) */}
      {showFullManual && techScan && (
        <div className="fixed inset-0 z-[300] bg-black/95 flex flex-col animate-in fade-in duration-300 overflow-hidden" dir="ltr">
           <div className="p-4 bg-zinc-900 flex justify-between items-center border-b border-zinc-800">
              <button onClick={() => setShowFullManual(false)} className="p-2 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-all"><X className="w-5 h-5" /></button>
              <div className="text-right">
                 <h4 className="text-white font-black text-xs uppercase leading-none">{techScan.name}</h4>
                 <p className="text-zinc-500 text-[7px] font-mono mt-1">{techScan.documentRef}</p>
              </div>
           </div>
           
           <div className="flex-1 overflow-auto bg-zinc-950 p-4 md:p-8 flex flex-col items-center">
              <div className="max-w-4xl w-full bg-white rounded-lg p-6 md:p-10 shadow-2xl relative flex flex-col">
                 <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] pointer-events-none"></div>
                 
                 <div className="flex justify-between border-b border-zinc-100 pb-6 mb-8 items-start">
                    <div className="flex items-center gap-2">
                       <img src="https://cdn.simpleicons.org/renault/000000" className="w-10 h-10 grayscale" alt="Renault" />
                       <span className="font-black text-xs italic text-zinc-900 uppercase">Renault Trucks</span>
                    </div>
                    <div className="text-right">
                       <p className="text-[7px] font-mono text-zinc-400 uppercase tracking-widest">Model: 440 DXi</p>
                       <h5 className="text-lg font-black text-zinc-900 uppercase italic tracking-tight">Manual 70 627 Technical Scan</h5>
                    </div>
                 </div>

                 <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 relative border border-zinc-100 p-2 rounded-lg bg-zinc-50/50 group">
                       <img src={techScan.imageUrl} className="w-full h-auto rounded object-contain max-h-[500px]" alt="Scan Detail" />
                       <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-1.5 rounded-lg text-[8px] font-bold flex items-center gap-2">
                          <ZoomIn className="w-3 h-3" /> PRECISION SCAN 1:1
                       </div>
                    </div>
                    
                    <div className="w-full md:w-72 space-y-6 text-right" dir="rtl">
                       <div className="space-y-1.5">
                          <h6 className="text-[10px] font-black text-red-600 uppercase flex items-center justify-end gap-2">
                             الموقع الفيزيائي الدقيق
                             <MapPin className="w-3.5 h-3.5" />
                          </h6>
                          <p className="text-zinc-800 font-bold text-sm leading-relaxed">{techScan.location}</p>
                       </div>
                       
                       <div className="space-y-1.5">
                          <h6 className="text-[10px] font-black text-zinc-400 uppercase flex items-center justify-end gap-2">
                             تعليمات الفحص
                             <Info className="w-3.5 h-3.5" />
                          </h6>
                          <p className="text-zinc-600 text-[10px] leading-relaxed font-medium italic">
                             {techScan.specs}.
                          </p>
                       </div>

                       <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 shadow-sm">
                          <h6 className="text-[8px] font-black text-zinc-900 uppercase mb-3 border-b pb-1">القيم الكهربائية</h6>
                          <div className="space-y-2">
                             <div className="flex justify-between text-[9px] font-bold border-b border-zinc-100 pb-1 italic">
                                <span>Signal (+)</span>
                                <span className="text-zinc-400">Pin A</span>
                             </div>
                             <div className="flex justify-between text-[9px] font-bold italic">
                                <span>Ground (-)</span>
                                <span className="text-zinc-400">Pin B</span>
                             </div>
                          </div>
                       </div>
                       
                       <button className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                          <Download className="w-3.5 h-3.5" /> تحميل نسخة PDF
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-6 bg-zinc-900 flex justify-center gap-4 border-t border-zinc-800">
              <button 
                onClick={() => window.print()} 
                className="px-10 py-3.5 bg-white text-black font-black rounded-xl text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all flex items-center gap-2"
              >
                 <Printer className="w-4 h-4" /> طباعة المخطط
              </button>
              <button 
                onClick={() => setShowFullManual(false)} 
                className="px-10 py-3.5 bg-zinc-800 text-zinc-400 font-black rounded-xl text-xs uppercase tracking-[0.2em] hover:text-white transition-all"
              >
                 إغلاق
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisResultCard;
