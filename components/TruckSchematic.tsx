
import React, { useState } from 'react';
import { Truck, MapPin, X, Info } from 'lucide-react';

interface TruckSchematicProps {
  onClose: () => void;
}

// Data extracted from "Implantation" PDFs
const COMPONENT_LOCATIONS = [
  { id: 'mid128', name: 'Engine ECU (MID 128)', x: 25, y: 70, description: 'Located on the left side of the engine block.' },
  { id: 'mid144', name: 'VECU (MID 144)', x: 20, y: 35, description: 'Inside the cab, passenger side dashboard area.' },
  { id: 'mid136', name: 'EBS Module (MID 136)', x: 45, y: 80, description: 'Chassis frame rail, usually left side.' },
  { id: 'mid185', name: 'APM (Air Dryer) (MID 185)', x: 35, y: 80, description: 'Behind the cab or on the chassis rail.' },
  { id: 'mid150', name: 'Air Suspension (ECS)', x: 60, y: 75, description: 'Chassis frame, near rear axle.' },
  { id: 'mid220', name: 'Tachograph', x: 25, y: 25, description: 'Overhead console or dashboard.' },
];

export const TruckSchematic: React.FC<TruckSchematicProps> = ({ onClose }) => {
  const [selectedPart, setSelectedPart] = useState<any>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-zinc-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
           <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                 <Truck className="w-8 h-8 text-red-600" />
                 TRUCK SCHEMATIC MAP
              </h2>
              <p className="text-zinc-500 text-sm mt-1">Component Locations (Renault Standard)</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
           
           {/* Sidebar Info */}
           <div className="w-full md:w-80 bg-zinc-900 p-6 border-r border-zinc-800 overflow-y-auto z-10 shadow-xl">
              {selectedPart ? (
                 <div className="animate-in slide-in-from-left duration-300">
                    <h3 className="text-xl font-bold text-white mb-2">{selectedPart.name}</h3>
                    <div className="h-1 w-20 bg-red-600 rounded-full mb-4"></div>
                    <p className="text-zinc-400 mb-6 leading-relaxed">{selectedPart.description}</p>
                    <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
                       <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase mb-2">
                          <Info className="w-4 h-4" /> Diagnostic Note
                       </div>
                       <p className="text-zinc-300 text-sm">Check wiring harness connectors (Black/Yellow) for corrosion at this location.</p>
                    </div>
                 </div>
              ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <Truck className="w-16 h-16 mb-4 text-zinc-600" />
                    <p className="text-zinc-500">Select a component on the map to view details.</p>
                 </div>
              )}
           </div>

           {/* The Map */}
           <div className="flex-1 relative bg-zinc-950 flex items-center justify-center p-8 overflow-hidden">
              
              {/* Truck Silhouette (CSS Art / SVG representation) */}
              <div className="relative w-full max-w-2xl aspect-[2/1]">
                 {/* Cab */}
                 <div className="absolute left-[10%] top-[20%] w-[25%] h-[60%] border-4 border-zinc-700 rounded-2xl bg-zinc-900/50"></div>
                 {/* Chassis */}
                 <div className="absolute left-[20%] top-[60%] w-[70%] h-[5%] bg-zinc-700 rounded"></div>
                 {/* Wheels */}
                 <div className="absolute left-[20%] top-[65%] w-[12%] aspect-square rounded-full border-4 border-zinc-600 bg-zinc-800"></div>
                 <div className="absolute left-[70%] top-[65%] w-[12%] aspect-square rounded-full border-4 border-zinc-600 bg-zinc-800"></div>
                 
                 {/* Interactive Points */}
                 {COMPONENT_LOCATIONS.map((part) => (
                    <button
                      key={part.id}
                      onClick={() => setSelectedPart(part)}
                      className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg z-20 group
                        ${selectedPart?.id === part.id ? 'bg-red-600 scale-125 ring-4 ring-red-900/50' : 'bg-zinc-800 border-2 border-zinc-600 hover:bg-white hover:border-white'}`}
                      style={{ left: `${part.x}%`, top: `${part.y}%` }}
                    >
                       <MapPin className={`w-4 h-4 ${selectedPart?.id === part.id ? 'text-white' : 'text-zinc-400 group-hover:text-black'}`} />
                       
                       {/* Tooltip */}
                       <span className="absolute bottom-full mb-2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                          {part.name}
                       </span>
                    </button>
                 ))}

              </div>
              
              <div className="absolute bottom-4 right-4 text-zinc-600 text-xs font-mono">
                 SCHEMATIC REFERENCE: 70 627
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};
