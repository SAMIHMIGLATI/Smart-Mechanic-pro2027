
import React, { useState, useEffect, useRef } from 'react';
import { Bluetooth, Activity, Power, RefreshCw, AlertTriangle, Terminal, Zap, Wifi, ArrowLeft, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { soundEngine } from '../utils/sound';

interface BluetoothScannerProps {
  lang: Language;
  onBack?: () => void;
}

const BluetoothScanner: React.FC<BluetoothScannerProps> = ({ lang, onBack }) => {
  const [connectionState, setConnectionState] = useState<'idle' | 'scanning' | 'connecting' | 'connected' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [data, setData] = useState({ rpm: 0, speed: 0, temp: 0, voltage: 0 });
  
  const t = translations[lang];
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const handleConnect = () => {
    setConnectionState('connecting');
    setLogs([]);
    
    // Simulate ObdManager.kt Logic
    const sequence = [
      { msg: "ObdManager: Initializing BluetoothAdapter...", delay: 500 },
      { msg: "ObdManager: Scanning for paired devices...", delay: 1000 },
      { msg: "ObdManager: Device found: OBDII [00:11:22:33:44:55]", delay: 2000 },
      { msg: "ObdManager: Creating RFCOMM Socket...", delay: 2500 },
      { msg: "ObdManager: Socket connected.", delay: 3000 },
      { msg: "TX: ATZ", delay: 3500 },
      { msg: "RX: ELM327 v1.5", delay: 4000 },
      { msg: "TX: ATE0", delay: 4500 },
      { msg: "RX: OK", delay: 4800 },
      { msg: "TX: 0100", delay: 5200 },
      { msg: "RX: 41 00 BE 1F B8 10", delay: 5600 },
      { msg: "ObdManager: Protocol ISO 15765-4 CAN (11/500) Detected", delay: 6000 },
      { msg: "ObdManager: Ready.", delay: 6500 }
    ];

    sequence.forEach(({ msg, delay }) => {
      setTimeout(() => {
        addLog(msg);
        soundEngine.playClick();
      }, delay);
    });

    setTimeout(() => {
      setConnectionState('connected');
      soundEngine.playSuccess();
      startDataStream();
    }, 7000);
  };

  const startDataStream = () => {
    const interval = setInterval(() => {
      setData({
        rpm: Math.floor(600 + Math.random() * 150),
        speed: 0,
        temp: Math.floor(85 + Math.random() * 5),
        voltage: Number((13.8 + Math.random() * 0.4).toFixed(1))
      });
    }, 1000);
    return () => clearInterval(interval);
  };

  return (
    <div className="bg-black min-h-screen text-green-500 font-mono p-4 pb-24">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-green-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
           {onBack && (
              <button onClick={onBack} className="p-1 rounded hover:bg-green-900/30">
                 {lang === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              </button>
           )}
           <h2 className="text-lg font-bold tracking-wider text-white">OBD MANAGER</h2>
        </div>
        <div className={`w-3 h-3 rounded-full ${connectionState === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
      </div>

      {/* Log Terminal */}
      <div className="bg-[#121212] border border-green-900 rounded p-4 h-64 overflow-y-auto mb-6 shadow-inner">
         {logs.length === 0 && <span className="text-gray-500">System Ready. Press Connect to start.</span>}
         {logs.map((log, i) => (
           <div key={i} className="mb-1 text-xs md:text-sm">{log}</div>
         ))}
         <div ref={logsEndRef} />
      </div>

      {/* Dashboard (Visible only when connected) */}
      {connectionState === 'connected' && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
           <div className="bg-green-900/20 border border-green-800 p-4 rounded flex flex-col items-center">
              <span className="text-3xl font-bold text-white">{data.rpm}</span>
              <span className="text-[10px] text-green-400">RPM</span>
           </div>
           <div className="bg-green-900/20 border border-green-800 p-4 rounded flex flex-col items-center">
              <span className="text-3xl font-bold text-white">{data.voltage}V</span>
              <span className="text-[10px] text-green-400">BATT</span>
           </div>
           <div className="bg-green-900/20 border border-green-800 p-4 rounded flex flex-col items-center">
              <span className="text-3xl font-bold text-white">{data.temp}°C</span>
              <span className="text-[10px] text-green-400">COOLANT</span>
           </div>
           <div className="bg-green-900/20 border border-green-800 p-4 rounded flex flex-col items-center">
              <span className="text-3xl font-bold text-white">NO DTCS</span>
              <span className="text-[10px] text-green-400">STATUS</span>
           </div>
        </div>
      )}

      {/* Connect Button */}
      {connectionState !== 'connected' && connectionState !== 'connecting' && (
        <button
          onClick={handleConnect}
          className="w-full py-4 bg-green-700 hover:bg-green-600 text-white font-bold rounded uppercase tracking-widest mt-4"
        >
          {t.connectObd}
        </button>
      )}
      
      {connectionState === 'connecting' && (
        <div className="w-full py-4 text-center text-green-400 animate-pulse mt-4 uppercase font-bold">
           Connecting...
        </div>
      )}

    </div>
  );
};

export default BluetoothScanner;
