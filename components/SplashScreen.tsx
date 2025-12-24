
import React, { useEffect, useState } from 'react';
import { Truck, Cpu, ShieldCheck, Database, Zap, Settings } from 'lucide-react';

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState('Initializing System...');

  const loadingLogs = [
    { p: 5, text: 'Loading Samih Truck Pro libraries...' },
    { p: 15, text: 'Verifying advanced system profiles...' },
    { p: 25, text: 'Connecting to 70 627 database...' },
    { p: 40, text: 'Loading smart sensor schematics...' },
    { p: 60, text: 'Activating Samih AI Engine...' },
    { p: 80, text: 'Downloading assembly protocols...' },
    { p: 95, text: 'Samih Truck Pro is ready.' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1;
        
        // Update logs based on progress
        const currentLog = [...loadingLogs].reverse().find(l => next >= l.p);
        if (currentLog) setLog(currentLog.text);

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 800);
          return 100;
        }
        return next;
      });
    }, 40); // Total ~4 seconds

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden font-sans select-none">
      
      {/* Background with Dynamic Visuals */}
      <div className="absolute inset-0 z-0">
         <img 
           src="https://images.unsplash.com/photo-1591768793355-74d7c836017c?q=80&w=2000" 
           className="w-full h-full object-cover opacity-20 scale-110 blur-sm animate-[pulse-slow_8s_ease-in-out_infinite]"
           alt="Background"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-red-950/20"></div>
         
         {/* Grid Overlay */}
         <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Futuristic Scanner Effect */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_20px_#ef4444] animate-[scan-line_3s_linear_infinite] opacity-50"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center max-w-lg w-full px-6">
        
        {/* Animated Logo Container */}
        <div className="relative mb-12">
           <div className="absolute inset-0 bg-red-600 rounded-3xl blur-[40px] opacity-20 animate-pulse"></div>
           <div className="w-24 h-24 bg-gradient-to-br from-zinc-900 to-black rounded-3xl border-2 border-red-500/50 flex items-center justify-center shadow-2xl relative">
              <Truck className="w-12 h-12 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              <div className="absolute -top-2 -right-2 bg-red-600 px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-tighter shadow-lg">SAMIH</div>
           </div>
           
           {/* Decorative Orbitals */}
           <div className="absolute -inset-4 border border-zinc-800 rounded-full animate-[spin_10s_linear_infinite]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
           </div>
        </div>

        {/* Title Section */}
        <div className="text-center space-y-2 mb-16">
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
              SMART <span className="text-red-600">MECHANIC</span>
           </h1>
           <div className="flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-zinc-800"></span>
              <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                 Samih Truck Pro
              </span>
              <span className="h-px w-8 bg-zinc-800"></span>
           </div>
        </div>

        {/* Technical Progress Container */}
        <div className="w-full space-y-4">
           
           {/* Dynamic Log Text */}
           <div className="flex items-center justify-between text-[10px] font-mono font-bold px-1">
              <div className="flex items-center gap-2 text-zinc-400">
                 <Settings className="w-3 h-3 animate-spin-slow" />
                 <span className="animate-pulse">{log}</span>
              </div>
              <span className="text-red-500">{progress}%</span>
           </div>

           {/* High-Tech Progress Bar */}
           <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-[1px] shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-red-800 via-red-600 to-red-400 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] transition-all duration-100 ease-linear relative"
                style={{ width: `${progress}%` }}
              >
                 <div className="absolute top-0 right-0 h-full w-8 bg-white/30 blur-sm"></div>
              </div>
           </div>

           {/* System Icons Status */}
           <div className="flex justify-between items-center pt-4 px-2">
              <StatusItem icon={<Cpu />} label="CPU" active={progress > 20} />
              <StatusItem icon={<Database />} label="DATA" active={progress > 40} />
              <StatusItem icon={<ShieldCheck />} label="SEC" active={progress > 60} />
              <StatusItem icon={<Zap />} label="AI" active={progress > 85} />
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-10 left-0 right-0 text-center">
         <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.5em] opacity-50">
            Powered by Samih Pro Technik AI
         </p>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; transform: scale(1.1); }
          50% { opacity: 0.25; transform: scale(1.15); }
        }
        @keyframes scan-line {
          0% { top: -10%; }
          100% { top: 110%; }
        }
      `}</style>
    </div>
  );
};

const StatusItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean }> = ({ icon, label, active }) => (
  <div className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${active ? 'opacity-100 scale-100' : 'opacity-20 scale-90'}`}>
     <div className={`p-2 rounded-lg border ${active ? 'bg-red-600/10 border-red-500/30 text-red-500' : 'bg-transparent border-zinc-800 text-zinc-700'}`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
     </div>
     <span className="text-[8px] font-black text-zinc-600 tracking-tighter uppercase">{label}</span>
  </div>
);

export default SplashScreen;
