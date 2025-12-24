
import React, { useState, useEffect } from 'react';
import { MaintenanceRecord, User, Language } from '../types';
import { Wrench, Plus, Save, Trash2, Gauge, Droplet, Timer, AlertCircle, TrendingUp, DollarSign, BrainCircuit, Activity, Crown, Lock, Calculator } from 'lucide-react';
import { translations } from '../utils/translations';

interface MaintenanceLogProps {
  user?: User | null;
  lang?: Language;
}

const MaintenanceLog: React.FC<MaintenanceLogProps> = ({ user, lang = 'ar' }) => {
  const [logs, setLogs] = useState<MaintenanceRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nextServiceKm, setNextServiceKm] = useState<number | null>(null);
  
  // Cost Estimation State
  const [laborRate, setLaborRate] = useState<number>(() => {
    const saved = localStorage.getItem('sm_labor_rate');
    return saved ? Number(saved) : 2000; // Default 2000 DZD/Hour
  });

  // Form State
  const [type, setType] = useState('تغيير زيت محرك');
  const [mileage, setMileage] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const t = translations[lang] || translations['ar'];

  // Standard Rates for Estimates (Parts Cost + Standard Hours)
  const standardRates: Record<string, { parts: number, hours: number }> = {
    'تغيير زيت محرك': { parts: 12000, hours: 1.0 },
    'تغيير فلتر زيت': { parts: 3500, hours: 0.5 },
    'تغيير فلتر ديزل': { parts: 4500, hours: 0.8 },
    'تغيير فلتر هواء': { parts: 6000, hours: 0.3 },
    'صيانة الفرامل': { parts: 18000, hours: 2.5 },
    'تغيير زيت قير': { parts: 25000, hours: 1.5 },
  };

  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem('renault_maintenance_logs');
      if (savedLogs) {
        const parsedLogs = JSON.parse(savedLogs);
        
        if (Array.isArray(parsedLogs)) {
          // Robust sort with safety checks
          parsedLogs.sort((a, b) => {
             const dateA = a.date ? new Date(a.date).getTime() : 0;
             const dateB = b.date ? new Date(b.date).getTime() : 0;
             return dateB - dateA;
          });
          
          setLogs(parsedLogs);
          
          // Calculate next service (Example: +20,000km from last oil change)
          // Safe check for 'type' existence and type
          const lastOilChange = parsedLogs.find(l => 
            l && typeof l.type === 'string' && l.type.includes('زيت محرك')
          );
          
          if (lastOilChange && lastOilChange.mileage) {
            setNextServiceKm(Number(lastOilChange.mileage) + 20000);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load maintenance logs:", e);
      // Reset corrupted storage to prevent app crash
      localStorage.removeItem('renault_maintenance_logs');
      setLogs([]);
    }
  }, []);

  const saveLogs = (newLogs: MaintenanceRecord[]) => {
    try {
      localStorage.setItem('renault_maintenance_logs', JSON.stringify(newLogs));
      setLogs(newLogs);
      
      // Recalculate next service immediately
      const lastOilChange = newLogs.find(l => 
        l && typeof l.type === 'string' && l.type.includes('زيت محرك')
      );
      
      if (lastOilChange && lastOilChange.mileage) {
        setNextServiceKm(Number(lastOilChange.mileage) + 20000);
      }
    } catch (e) {
      console.error("Failed to save logs", e);
      alert("Failed to save data. Storage might be full.");
    }
  };

  const handleLaborRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLaborRate(val);
    localStorage.setItem('sm_labor_rate', val.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mileage) return;
    
    const newRecord: MaintenanceRecord = {
      id: Date.now().toString(),
      date,
      type: type || 'أخرى',
      mileage: Number(mileage),
      notes: notes || '',
      cost: cost ? Number(cost) : undefined
    };
    
    const updatedLogs = [newRecord, ...logs].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
    });
    
    saveLogs(updatedLogs);
    setShowForm(false);
    // Reset form
    setMileage('');
    setNotes('');
    setCost('');
  };

  const deleteLog = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      const updatedLogs = logs.filter(log => log.id !== id);
      saveLogs(updatedLogs);
    }
  };

  const maintenanceTypes = [
    'تغيير زيت محرك',
    'تغيير فلتر زيت',
    'تغيير فلتر ديزل',
    'تغيير فلتر هواء',
    'صيانة الفرامل',
    'تغيير زيت قير',
    'إصلاح كهرباء',
    'أخرى'
  ];

  // Analytics Logic (Pro Features)
  const totalCost = logs.reduce((acc, log) => acc + (log.cost || 0), 0);
  
  const calculateHealthScore = () => {
    if (logs.length === 0) return 0;
    let score = 100;
    const lastService = logs[0];
    if (!lastService || !lastService.date) return 0;
    
    const daysSince = (new Date().getTime() - new Date(lastService.date).getTime()) / (1000 * 3600 * 24);
    
    // Deduct for time inactivity
    if (daysSince > 90) score -= 10;
    if (daysSince > 180) score -= 20;
    
    // Deduct for missing critical services (Simplified logic)
    const hasOilChange = logs.some(l => l && typeof l.type === 'string' && l.type.includes('زيت'));
    if (!hasOilChange) score -= 30;

    return Math.max(0, score);
  };

  const healthScore = calculateHealthScore();

  // Calculate Next Service Estimate (Assuming next service is Oil + Filters)
  const calculateNextServiceEstimate = () => {
    const oil = standardRates['تغيير زيت محرك'];
    const filter = standardRates['تغيير فلتر زيت'];
    
    if (!oil || !filter) return 0;

    const partsTotal = oil.parts + filter.parts;
    const laborTotal = (oil.hours + filter.hours) * laborRate;

    return partsTotal + laborTotal;
  };

  const nextServiceEstimate = calculateNextServiceEstimate();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header & Next Service Card */}
      <div className="bg-zinc-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start">
          <div>
             <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
              <Wrench className="w-5 h-5 text-red-500" />
              {t.maintenance}
            </h2>
            <p className="text-zinc-400 text-sm">
              {logs.length} سجلات محفوظة
            </p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors shadow-lg"
          >
            {showForm ? <XIcon /> : <Plus className="w-6 h-6" />}
          </button>
        </div>

        {nextServiceKm && (
          <div className="mt-6 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-bold uppercase">موعد غيار الزيت القادم</div>
              <div className="text-xl font-mono font-bold text-white tracking-wider">
                {nextServiceKm.toLocaleString()} <span className="text-xs text-zinc-500">KM</span>
              </div>
            </div>
          </div>
        )}
        
        <Droplet className="absolute -right-4 -bottom-4 w-32 h-32 text-zinc-800 opacity-50" />
      </div>

      {/* PRO Analytics Section */}
      <div className="relative">
        {!user?.isPro && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 rounded-xl flex items-center justify-center border border-white/50">
             <div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl text-center transform scale-95 md:scale-100 max-w-xs mx-auto">
               <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
                 <Lock className="w-6 h-6 text-zinc-900" />
               </div>
               <h3 className="text-white font-bold text-lg mb-1">{t.proVersion}</h3>
               <p className="text-zinc-400 text-xs mb-4">{t.unlockAnalytics}</p>
               <button className="bg-amber-500 text-zinc-900 px-4 py-2 rounded-lg text-sm font-bold w-full hover:bg-amber-400 transition-colors">
                 {t.upgradeToPro}
               </button>
             </div>
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!user?.isPro ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
           {/* Cost Card */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-green-100 rounded-lg">
                 <DollarSign className="w-5 h-5 text-green-600" />
               </div>
               <span className="text-sm font-bold text-zinc-500 uppercase">{t.totalCost}</span>
             </div>
             <p className="text-2xl font-black text-zinc-800 tracking-tight">
               {totalCost.toLocaleString()} <span className="text-sm text-zinc-400 font-medium">DZD</span>
             </p>
             <div className="mt-3 text-xs text-green-600 flex items-center gap-1 font-bold">
               <TrendingUp className="w-3 h-3" />
               <span>{t.spendingTrend}</span>
             </div>
           </div>

           {/* Health Score Card */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-blue-100 rounded-lg">
                 <Activity className="w-5 h-5 text-blue-600" />
               </div>
               <span className="text-sm font-bold text-zinc-500 uppercase">{t.vehicleHealth}</span>
             </div>
             <div className="flex items-center gap-4">
               <div className="relative w-12 h-12 flex items-center justify-center">
                 <svg className="transform -rotate-90 w-full h-full">
                   <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-100" />
                   <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125} strokeDashoffset={125 - (125 * healthScore) / 100} className="text-blue-500" />
                 </svg>
                 <span className="absolute text-xs font-bold text-blue-600">{healthScore}%</span>
               </div>
               <div>
                  <p className="font-bold text-zinc-800">
                    {healthScore >= 90 ? t.healthExcellent : healthScore >= 70 ? t.healthGood : t.healthPoor}
                  </p>
                  <p className="text-[10px] text-zinc-400">Based on history</p>
               </div>
             </div>
           </div>

           {/* Estimates & Calculator Card (NEW) */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Calculator className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-sm font-bold text-zinc-500 uppercase">تقدير الصيانة القادمة</span>
                </div>
                <p className="text-2xl font-black text-zinc-800 tracking-tight">
                  {nextServiceEstimate.toLocaleString()} <span className="text-sm text-zinc-400 font-medium">DZD</span>
                </p>
                <p className="text-[10px] text-zinc-400 mt-1">
                  تقدير تكلفة زيت + فلاتر + يد عاملة
                </p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-zinc-100">
                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">سعر يد العمل (ساعة)</label>
                <input 
                  type="number" 
                  value={laborRate}
                  onChange={handleLaborRateChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs font-bold"
                />
              </div>
           </div>

           {/* AI Prediction Card */}
           <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-5 rounded-xl shadow-lg border border-indigo-700 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl"></div>
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <BrainCircuit className="w-5 h-5 text-purple-300" />
                  <span className="text-sm font-bold text-purple-200 uppercase">{t.aiPrediction}</span>
                </div>
                <p className="text-xs leading-relaxed text-indigo-100 mb-2">
                  {t.predictionText}
                </p>
                <div className="h-1 w-full bg-indigo-950/50 rounded-full overflow-hidden mt-2">
                   <div className="h-full bg-purple-400 w-3/4"></div>
                </div>
             </div>
           </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border-2 border-red-100 animate-in slide-in-from-top-4">
          <h3 className="font-bold text-zinc-800 mb-4 border-b pb-2">تسجيل عملية صيانة جديدة</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">نوع الصيانة</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:border-red-500 outline-none"
              >
                {maintenanceTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">العداد (كم)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    placeholder="000000"
                    required
                    className="w-full p-3 pl-8 bg-zinc-50 border border-zinc-200 rounded-lg focus:border-red-500 outline-none"
                  />
                  <Gauge className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">التكلفة (اختياري)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-3 pl-8 bg-zinc-50 border border-zinc-200 rounded-lg focus:border-red-500 outline-none"
                  />
                  <DollarSign className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-zinc-700 mb-1">التاريخ</label>
               <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:border-red-500 outline-none"
               />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">ملاحظات إضافية</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="نوع الزيت، رقم القطعة، اسم الورشة..."
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:border-red-500 outline-none h-24"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-red-600/20"
            >
              <Save className="w-5 h-5" />
              حفظ السجل
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
               <AlertCircle className="w-8 h-8 text-zinc-300" />
            </div>
            <p className="text-zinc-500 font-medium">سجل الصيانة فارغ</p>
            <p className="text-xs text-zinc-400 mt-1">اضغط على زر (+) في الأعلى لإضافة أول عملية صيانة</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 flex justify-between items-start group">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-zinc-800 text-base">{log.type}</span>
                  <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-200">
                    {log.date}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-600 mb-2">
                  <span className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-mono font-bold">
                    <Gauge className="w-3 h-3" />
                    {Number(log.mileage).toLocaleString()}
                  </span>
                  {log.cost && (
                    <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-mono font-bold">
                      <DollarSign className="w-3 h-3" />
                      {Number(log.cost).toLocaleString()}
                    </span>
                  )}
                </div>
                {log.notes && (
                  <p className="text-xs text-zinc-500 bg-zinc-50 p-2 rounded-lg inline-block border border-zinc-100">
                    {log.notes}
                  </p>
                )}
              </div>
              <button 
                onClick={() => deleteLog(log.id)}
                className="text-zinc-300 hover:text-red-500 p-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default MaintenanceLog;
