
import React, { useEffect, useState } from 'react';
import { Truck, Trees, Cloud, Moon, FileText, Database, ShieldCheck } from 'lucide-react';

interface DrivingSceneProps {
  onFinish: () => void;
}

const DrivingScene: React.FC<DrivingSceneProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [loadPercent, setLoadPercent] = useState(0);

  useEffect(() => {
    // Loading percentage simulation during drive
    const interval = setInterval(() => {
       setLoadPercent(prev => {
          if (prev >= 100) return 100;
          return prev + 1;
       });
    }, 30);

    // Automatically close after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // Wait for fade out
    }, 4000);

    return () => {
        clearTimeout(timer);
        clearInterval(interval);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-zinc-950 flex flex-col justify-end overflow-hidden transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={() => { setIsVisible(false); setTimeout(onFinish, 300); }}
    >
      {/* Matrix Overlay Layer */}
      <div className="absolute inset-0 z-40 pointer-events-none opacity-20">
         <div className="w-full h-full bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* System Loading Overlay */}
      <div className="absolute top-10 left-10 z-50 font-mono text-green-500 text-xs space-y-1 opacity-80 hidden md:block">
         <div>> MOUNTING SYSTEM VOLUMES... [OK]</div>
         <div>> VERIFYING SECURITY KEYS... [OK]</div>
         <div>> LOADING DRIVER MODULES... {loadPercent}%</div>
         <div>> INITIALIZING AI CORE...</div>
      </div>

      {/* Sky & Moon */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-zinc-900 to-zinc-800">
        <div className="absolute top-10 right-10 animate-pulse">
           <Moon className="w-16 h-16 text-yellow-100/80 drop-shadow-[0_0_15px_rgba(254,240,138,0.5)]" />
        </div>
        
        {/* Moving Clouds */}
        <div className="absolute top-20 right-[-100px] animate-[float-clouds_20s_linear_infinite] opacity-20">
           <Cloud className="w-24 h-24 text-white" />
        </div>
      </div>

      {/* Floating Files Animation */}
      <div className="absolute inset-0 z-30 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 animate-bounce duration-[3s]">
            <FileText className="w-12 h-12 text-blue-400 opacity-40" />
         </div>
         <div className="absolute top-1/3 right-1/4 animate-bounce duration-[4s]">
            <Database className="w-10 h-10 text-green-400 opacity-40" />
         </div>
         <div className="absolute top-1/2 left-1/2 animate-bounce duration-[2s]">
            <ShieldCheck className="w-14 h-14 text-red-400 opacity-40" />
         </div>
      </div>

      {/* Background Mountains/Hills */}
      <div className="absolute bottom-32 left-0 w-[200%] h-48 bg-zinc-800 rounded-[100%] blur-sm translate-y-20 animate-[drive-trees_20s_linear_infinite]"></div>

      {/* Moving Trees */}
      <div className="absolute bottom-24 left-0 w-full flex gap-32 animate-[drive-trees_3s_linear_infinite]">
         {Array.from({ length: 10 }).map((_, i) => (
            <div key={`tree-front-${i}`} className="transform scale-150">
               <Trees className="w-32 h-32 text-zinc-900 drop-shadow-lg" />
            </div>
         ))}
      </div>

      {/* Road */}
      <div className="relative h-32 bg-zinc-900 border-t-4 border-zinc-700 w-full z-10 overflow-hidden flex items-center">
         <div className="absolute top-1/2 w-full flex gap-16 animate-[drive-road_0.8s_linear_infinite]">
            {Array.from({ length: 20 }).map((_, i) => (
               <div key={`line-${i}`} className="w-12 h-2 bg-yellow-500/50 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.4)]"></div>
            ))}
         </div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asphalt-dark.png')] opacity-30"></div>
      </div>

      {/* The Truck with Trailer */}
      <div className="absolute bottom-16 left-4 md:left-20 z-20 flex items-end">
         {/* Trailer */}
         <div className="w-48 h-32 bg-zinc-800 border-2 border-zinc-700 rounded-lg relative -mr-4 mb-1 animate-[bounce-truck_0.55s_ease-in-out_infinite]">
            <div className="absolute bottom-2 right-4 w-10 h-10 bg-black rounded-full border-2 border-zinc-600"></div>
            <div className="absolute bottom-2 right-16 w-10 h-10 bg-black rounded-full border-2 border-zinc-600"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-black text-2xl opacity-20">
               SMART MECHANIC
            </div>
         </div>
         
         {/* Truck Cab */}
         <div className="relative animate-[bounce-truck_0.5s_ease-in-out_infinite] z-10">
            <div className="relative transform scale-150 md:scale-[2]">
               <div className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.6)]">
                  <Truck className="w-20 h-20 fill-zinc-900" />
               </div>
               <div className="absolute top-10 right-0 w-64 h-24 bg-gradient-to-r from-yellow-200/50 to-transparent transform rotate-12 blur-md"></div>
            </div>
         </div>
      </div>

      {/* Progress Bar Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-50">
         <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 transition-all duration-100" style={{ width: `${loadPercent}%` }}></div>
         </div>
         <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
            <span>LOADING RESOURCES...</span>
            <span>{loadPercent}%</span>
         </div>
      </div>

      <style>{`
        @keyframes float-clouds {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100vw); }
        }
        @keyframes drive-trees {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        @keyframes drive-road {
          0% { transform: translateX(0); }
          100% { transform: translateX(-200px); }
        }
        @keyframes bounce-truck {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
};

export default DrivingScene;
