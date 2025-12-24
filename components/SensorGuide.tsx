
import React, { useState, useEffect } from 'react';
import { sensorsData } from '../data/sensors';
import { Search, MapPin, Activity, Info, X, Cpu } from 'lucide-react';
import { SensorData } from '../types';

interface SensorGuideProps {
  initialSearch?: string;
}

const SensorGuide: React.FC<SensorGuideProps> = ({ initialSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);

  // If initialSearch changes (e.g. coming from Home), update local state
  useEffect(() => {
    if (initialSearch !== undefined) setSearchTerm(initialSearch);
  }, [initialSearch]);

  const filteredSensors = sensorsData.filter(sensor => {
    const term = (searchTerm || '').toLowerCase();
    const name = (sensor.name || '').toLowerCase();
    const code = (sensor.code || '').toLowerCase();
    const func = (sensor.function || '').toLowerCase();
    
    return name.includes(term) || code.includes(term) || func.includes(term);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-zinc-200 sticky top-0 z-20">
        <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-red-600" />
          معرض الحساسات (Engine Gallery)
        </h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="ابحث عن حساس (مثال: تيربو، PID 100)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pr-12 pl-4 bg-zinc-50 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
        </div>
      </div>

      {/* Grid of Sensors (No Images) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
        {filteredSensors.map(sensor => (
          <div 
            key={sensor.id}
            onClick={() => setSelectedSensor(sensor)}
            className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm hover:shadow-lg hover:border-red-300 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
            
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors shadow-sm">
                 <Cpu className="w-6 h-6" />
              </div>
              <span className="bg-zinc-100 text-zinc-600 text-xs font-mono px-2 py-1 rounded font-bold group-hover:bg-zinc-800 group-hover:text-white transition-colors border border-zinc-200">
                {sensor.code}
              </span>
            </div>
            
            <h3 className="font-bold text-zinc-800 text-lg mb-2 group-hover:text-red-600 transition-colors relative z-10">{sensor.name}</h3>
            
            <div className="mt-auto pt-3 flex items-start gap-1.5 text-xs text-zinc-500 border-t border-zinc-100 relative z-10">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-400" />
              <span className="line-clamp-2 leading-relaxed">{sensor.location}</span>
            </div>
          </div>
        ))}

        {filteredSensors.length === 0 && (
          <div className="col-span-full text-center py-10 text-zinc-400">
            لا توجد نتائج مطابقة لـ "{searchTerm}"
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSensor && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-zinc-100 p-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                   <Activity className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 leading-tight">{selectedSensor.name}</h3>
                  <span className="text-xs font-mono text-zinc-500 font-bold">{selectedSensor.code}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSensor(null)}
                className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200"
              >
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold text-sm uppercase tracking-wider">
                    <Info className="w-4 h-4" />
                    الوظيفة
                  </div>
                  <p className="text-zinc-700 leading-relaxed text-sm font-medium">{selectedSensor.function}</p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-800 mb-2 flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-red-500" />
                    الموقع الدقيق
                  </h4>
                  <p className="text-zinc-600 bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-sm leading-relaxed">
                    {selectedSensor.location}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-800 mb-3 text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    الأعراض الشائعة
                  </h4>
                  <ul className="space-y-2">
                    {selectedSensor.symptoms.map((sym, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-zinc-700 text-sm bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 mt-1.5"></span>
                        {sym}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <h4 className="font-bold text-zinc-800 mb-2 text-sm">ملاحظات فنية</h4>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      {selectedSensor.description}
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedSensor(null)}
                className="w-full py-3.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-lg"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorGuide;
