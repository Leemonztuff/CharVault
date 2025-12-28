
import React from 'react';
import { GeneratedOutfit } from '../types';
import { IconButton } from './UI';

interface VaultProps {
  outfits: GeneratedOutfit[];
  activeId?: string;
  onSelect: (o: GeneratedOutfit) => void;
  onDelete: (id: string) => void;
}

export const Vault: React.FC<VaultProps> = ({ outfits, activeId, onSelect, onDelete }) => {
  return (
    <div className="h-full overflow-y-auto p-6 pb-24 grid grid-cols-2 gap-4 no-scrollbar animate-in slide-in-from-bottom-4 duration-500">
      {outfits.map(outfit => (
        <div 
          key={outfit.id} 
          onClick={() => onSelect(outfit)}
          className={`aspect-[3/4] bg-[#0a0a0a] rounded-3xl border p-4 relative group cursor-pointer overflow-hidden transition-all duration-300 ${
            activeId === outfit.id ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-white/5 hover:border-white/20'
          }`}
        >
          <div className="absolute inset-0 opacity-[0.03] checker-bg pointer-events-none" />
          <img 
            src={outfit.url} 
            className="w-full h-full object-contain relative z-10 transition-transform group-hover:scale-110 duration-500" 
            alt="Vault Asset" 
          />
          
          <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 rounded-full text-[8px] font-black text-indigo-400 border border-white/5 z-20 uppercase tracking-widest">
            Step {outfit.evolutionStep}
          </div>

          <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconButton 
              variant="danger" 
              onClick={() => onDelete(outfit.id)}
              className="w-8 h-8 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
          </div>

          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <p className="text-[7px] font-bold text-slate-500 uppercase truncate bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/5">
              {outfit.prompt || "Raw Synthesis"}
            </p>
          </div>
        </div>
      ))}

      {outfits.length === 0 && (
        <div className="col-span-2 py-32 text-center opacity-40">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
            <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">DNA Archive Offline</p>
          <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest mt-2">No se han guardado activos en el buffer neural</p>
        </div>
      )}
    </div>
  );
};
