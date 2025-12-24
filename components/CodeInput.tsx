import React, { useState, useRef, useEffect } from 'react';
import { FaultCodeData, TruckBrand, Language, DiagnosisResult } from '../types';
import { Search, Hash, Server, Activity, Truck, Camera, Image as ImageIcon, RefreshCcw, Keyboard, X, Power, AlertTriangle, Trash2 } from 'lucide-react';
import { translations } from '../utils/translations';
import { analyzeImageFault } from '../services/geminiService';
import { soundEngine } from '../utils/sound';

interface CodeInputProps {
  onSearch: (data: FaultCodeData) => void;
  isLoading: boolean;
  selectedBrand: TruckBrand;
  selectedModel: string;
  lang: Language;
  onImageAnalysis?: (result: DiagnosisResult) => void;
  setIsLoading?: (loading: boolean) => void;
  onReset?: () => void;
}

const CodeInput: React.FC<CodeInputProps> = ({ onSearch, isLoading, selectedBrand, selectedModel, lang, onImageAnalysis, setIsLoading, onReset }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'camera'>('manual');
  
  // Manual State
  const [mid, setMid] = useState('');
  const [pidSid, setPidSid] = useState('');
  const [isSid, setIsSid] = useState(false);
  const [fmi, setFmi] = useState('');
  
  // Camera State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Scan State
  const [progress, setProgress] = useState(0);
  const [scanText, setScanText] = useState('');

  const t = translations[lang];

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const startCamera = async () => {
    try {
      stopCamera(); 
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
             videoRef.current?.play().catch(e => console.error("Play error:", e));
        };
        streamRef.current = stream;
        setIsStreaming(true);
        setCameraPermission(true);
        soundEngine.playScan();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      try {
         const streamFallback = await navigator.mediaDevices.getUserMedia({ video: true });
         if (videoRef.current) {
            videoRef.current.srcObject = streamFallback;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play();
            };
            streamRef.current = streamFallback;
            setIsStreaming(true);
            setCameraPermission(true);
         }
      } catch (e) {
         setCameraPermission(false);
         alert(t.cameraError || 'Unable to access camera');
      }
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      soundEngine.playClick();
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedImage(imageDataUrl);
        stopCamera();
        handleImageAnalyze(imageDataUrl);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mid || !pidSid || !fmi) return;

    const data: FaultCodeData = {
      mid,
      fmi,
      pid: !isSid ? pidSid : undefined,
      sid: isSid ? pidSid : undefined,
    };
    onSearch(data);
  };

  const handleManualClear = () => {
    setMid('');
    setPidSid('');
    setFmi('');
    soundEngine.playClick();
    if (onReset) onReset();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        handleImageAnalyze(result);
      };
      reader.onerror = () => {
        alert('حدث خطأ أثناء تحميل الصورة من المعرض.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageAnalyze = async (imageData: string) => {
    if (!imageData || !setIsLoading || !onImageAnalysis) return;
    
    setIsLoading(true);
    setProgress(0);
    setScanText('جاري الاتصال بالخادم...');
    soundEngine.playBoot();
    
    const simulatedCodes = [
      "SCANNING RENAULT DXi PATTERN...", 
      "IDENTIFYING SENSOR LOCATION...", 
      "LOADING 70 627 PROTOCOL...",
      "EXTRACTING FAULT DATA...",
      "MAPPING VOLVO/RENAULT CHASSIS...",
      "FINALIZING DIAGNOSIS..."
    ];

    let step = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return 98;
        return prev + Math.floor(Math.random() * 5) + 2;
      });

      if (Math.random() > 0.5) {
         setScanText(simulatedCodes[step % simulatedCodes.length]);
         step++;
      }
    }, 200);

    try {
      const base64Data = imageData.split(',')[1];
      if (!base64Data) throw new Error("INVALID_IMAGE_DATA");
      
      const result = await analyzeImageFault(base64Data, selectedBrand, selectedModel, lang);
      
      clearInterval(interval);
      setProgress(100);
      setScanText('اكتمل التحليل بنجاح');
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      onImageAnalysis(result);
      soundEngine.playSuccess();
    } catch (error: any) {
      console.error("Image Analysis Error:", error);
      clearInterval(interval);
      soundEngine.playError();
      
      const errorMsg = lang === 'ar' 
        ? 'حدث خطأ أثناء تحليل الصورة. يرجى التأكد من وضوح الكود أو الحساس.' 
        : 'Error analyzing image. Please ensure the code or sensor is clear.';
      
      alert(errorMsg);
      setSelectedImage(null);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRetake = () => {
    setSelectedImage(null);
    if (onReset) onReset();
    startCamera();
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-zinc-200">
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="flex px-2 pt-2 gap-1">
          <button
            onClick={() => {
              setActiveTab('manual');
              stopCamera();
            }}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center justify-center gap-2
              ${activeTab === 'manual' 
                ? 'bg-zinc-50 text-red-600' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
          >
            <Keyboard className="w-4 h-4" />
            {t.manualInput}
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center justify-center gap-2
              ${activeTab === 'camera' 
                ? 'bg-zinc-50 text-red-600' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
          >
            <Camera className="w-4 h-4" />
            {t.cameraScan}
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-zinc-50 relative">
        <div className="absolute top-4 right-4 md:top-6 md:right-8 flex items-center gap-2 text-[10px] font-mono text-zinc-400 bg-white px-2 py-1 rounded-full border border-zinc-200 shadow-sm z-10">
          <Truck className="w-3 h-3" />
          {selectedBrand} {selectedModel}
        </div>

        {activeTab === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="group">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  <Server className="w-4 h-4" />
                  {t.midLabel}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={mid}
                    onChange={(e) => setMid(e.target.value)}
                    placeholder="128"
                    className="w-full h-14 pl-4 pr-4 bg-white border-2 border-zinc-200 rounded-lg text-2xl font-mono font-bold text-zinc-800 focus:border-red-600 focus:ring-0 transition-colors placeholder-zinc-200 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <Hash className="w-4 h-4" />
                    {t.pidSidLabel}
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setIsSid(!isSid)}
                    className="text-[10px] px-2 py-0.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded font-bold transition-colors"
                  >
                    {isSid ? 'SID/PSID' : 'PID/PPID'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={pidSid}
                    onChange={(e) => setPidSid(e.target.value)}
                    placeholder="131"
                    className="w-full h-14 pl-4 pr-4 bg-white border-2 border-zinc-200 rounded-lg text-2xl font-mono font-bold text-zinc-800 focus:border-red-600 focus:ring-0 transition-colors placeholder-zinc-200 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  <Activity className="w-4 h-4" />
                  {t.fmiLabel}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={fmi}
                    onChange={(e) => setFmi(e.target.value)}
                    placeholder="05"
                    className="w-full h-14 pl-4 pr-4 bg-white border-2 border-zinc-200 rounded-lg text-2xl font-mono font-bold text-zinc-800 focus:border-red-600 focus:ring-0 transition-colors placeholder-zinc-200 shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-center pt-2">
              <button
                type="button"
                onClick={handleManualClear}
                className="h-14 w-14 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-600 flex items-center justify-center transition-colors shadow-sm"
                title="Clear Inputs"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 h-14 rounded-lg text-white font-bold text-lg shadow-lg shadow-red-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3
                  ${isLoading 
                    ? 'bg-zinc-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600'
                  }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t.processing}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>{t.analyze}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <input 
              type="file" 
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden" 
            />
            <canvas ref={canvasRef} className="hidden" />

            <div className="relative rounded-3xl overflow-hidden border-4 border-zinc-800 shadow-2xl bg-black aspect-[3/4] md:aspect-video mx-auto max-w-md ring-1 ring-white/10 group">
                
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isStreaming && !selectedImage ? 'opacity-100' : 'opacity-0'}`}
                />

                {selectedImage && (
                  <img 
                    src={selectedImage} 
                    alt="Capture" 
                    className={`absolute inset-0 w-full h-full object-contain bg-black transition-all duration-300 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100'}`} 
                  />
                )}

                {!isStreaming && !selectedImage && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 p-6 text-center">
                     <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4 border border-zinc-700 shadow-lg shadow-red-900/10">
                        <Camera className="w-10 h-10 text-zinc-400" />
                     </div>
                     <h3 className="text-white font-bold text-lg mb-2">{t.cameraScan}</h3>
                     <p className="text-zinc-500 text-xs mb-6 max-w-[200px]">
                       {lang === 'ar' 
                         ? 'يرجى السماح للكاميرا بالمسح الضوئي للأكواد أو القطع.' 
                         : 'Please allow camera access to scan codes or parts.'}
                     </p>
                     <div className="flex flex-col gap-3 w-full max-w-xs">
                        <button 
                          onClick={startCamera}
                          className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                        >
                          <Power className="w-4 h-4" />
                          {t.startCamera}
                        </button>
                        <button 
                          onClick={triggerFileInput}
                          className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <ImageIcon className="w-4 h-4" />
                          {t.uploadFile}
                        </button>
                     </div>
                  </div>
                )}

                {(isStreaming || isLoading) && (
                  <div className="absolute inset-0 z-30 pointer-events-none">
                      <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12">
                         <div className="w-full h-full border-2 border-white/20 rounded-lg relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-md"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-md"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-md"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-md"></div>
                            
                            <div className="absolute w-full h-0.5 bg-red-500/80 shadow-[0_0_15px_rgba(220,38,38,0.8)] top-0 animate-[scan-line_2s_linear_infinite]"></div>

                            {isLoading && (
                               <div className="absolute top-4 left-4 bg-black/80 backdrop-blur px-3 py-1 rounded border-l-2 border-green-500">
                                  <div className="flex items-center gap-2">
                                     <RefreshCcw className="w-3 h-3 text-green-500 animate-spin" />
                                     <span className="text-[10px] font-mono text-green-400">{scanText}</span>
                                  </div>
                               </div>
                            )}
                         </div>
                      </div>
                  </div>
                )}

                {isStreaming && !isLoading && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center items-center gap-6 z-40 bg-gradient-to-t from-black/80 to-transparent">
                     <button 
                       onClick={stopCamera}
                       className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
                     >
                       <X className="w-6 h-6" />
                     </button>
                     
                     <button 
                       onClick={captureImage}
                       className="w-16 h-16 rounded-full border-4 border-white bg-red-600/90 hover:bg-red-500 hover:scale-105 transition-all shadow-xl"
                     ></button>
                     
                     <button 
                        onClick={triggerFileInput}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
                     >
                        <ImageIcon className="w-6 h-6" />
                     </button>
                  </div>
                )}
            </div>

            {selectedImage && !isLoading && (
               <div className="flex gap-4">
                  <button 
                    onClick={handleRetake}
                    className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    {t.cameraScan}
                  </button>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeInput;