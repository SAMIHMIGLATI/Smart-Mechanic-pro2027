
import React, { useEffect, useRef, useState } from 'react';

interface MatrixLoaderProps {
  onFinish: () => void;
}

const MatrixLoader: React.FC<MatrixLoaderProps> = ({ onFinish }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [logText, setLogText] = useState("INITIALIZING...");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%';
    const letters = katakana.split('');

    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const intervalId = setInterval(draw, 33);

    // Simulation Logic
    const logs = [
      "LOADING KERNEL...",
      "DECRYPTING ASSETS...",
      "MOUNTING VOLUMES...",
      "VERIFYING SECURITY...",
      "ESTABLISHING CONNECTION...",
      "SYSTEM READY"
    ];

    let currentLog = 0;
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(progressInterval);
          clearInterval(intervalId);
          setTimeout(onFinish, 500);
          return 100;
        }
        
        if (next % 20 === 0 && currentLog < logs.length - 1) {
           currentLog++;
           setLogText(logs[currentLog]);
        }
        
        return next;
      });
    }, 60);

    return () => {
      clearInterval(intervalId);
      clearInterval(progressInterval);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] bg-black text-green-500 font-mono overflow-hidden flex flex-col items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      <div className="relative z-10 w-full max-w-md p-6 bg-black/80 border border-green-500/30 rounded-xl backdrop-blur-sm">
         <div className="text-xl font-bold mb-4 text-center tracking-widest">SYSTEM LOADING</div>
         <div className="h-4 w-full bg-green-900/30 rounded border border-green-500/50 overflow-hidden mb-2">
            <div 
              className="h-full bg-green-500 shadow-[0_0_10px_#0F0]" 
              style={{ width: `${progress}%` }}
            ></div>
         </div>
         <div className="flex justify-between text-xs">
            <span>{logText}</span>
            <span>{progress}%</span>
         </div>
      </div>
    </div>
  );
};

export default MatrixLoader;
