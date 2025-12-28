
import React, { useMemo, useRef } from 'react';
import { GeneratedOutfit } from '../types';

interface TreeNodeProps {
  outfit: GeneratedOutfit;
  onSelect: (o: GeneratedOutfit) => void;
  isActive: boolean;
  id: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({ outfit, onSelect, isActive, id }) => (
  <div 
    id={id}
    onClick={() => onSelect(outfit)}
    className={`relative shrink-0 w-24 h-24 rounded-2xl border-2 transition-all duration-500 cursor-pointer group ${
      isActive 
      ? 'border-indigo-500 bg-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.6)] z-20 scale-110' 
      : 'border-white/10 bg-black/60 hover:border-white/40 hover:scale-105 z-10'
    }`}
  >
    <div className="absolute inset-0 opacity-[0.05] checker-bg rounded-2xl pointer-events-none" />
    <img 
      src={outfit.url} 
      className="w-full h-full object-contain p-2 relative z-10" 
      style={{ imageRendering: 'pixelated' }}
      alt="Node"
    />
    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity">
      <span className="text-[7px] font-black uppercase tracking-widest text-indigo-300 bg-black/60 px-2 py-0.5 rounded border border-white/5">
        STEP {outfit.evolutionStep}
      </span>
    </div>
  </div>
);

interface EvolutionTreeProps {
  outfits: GeneratedOutfit[];
  baseImage: string | null;
  activeId?: string;
  onSelect: (o: GeneratedOutfit) => void;
}

export const EvolutionTree: React.FC<EvolutionTreeProps> = ({ outfits, baseImage, activeId, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const treeStructure = useMemo(() => {
    const levels: Record<number, GeneratedOutfit[]> = {};
    outfits.forEach(o => {
      const step = o.evolutionStep || 1;
      if (!levels[step]) levels[step] = [];
      levels[step].push(o);
    });
    return Object.entries(levels).sort(([a], [b]) => Number(a) - Number(b));
  }, [outfits]);

  if (!baseImage) return null;

  return (
    <div className="h-full w-full bg-[#050505] overflow-auto relative no-scrollbar flex flex-col items-center py-20 px-10 gap-24" ref={containerRef}>
      {/* Origin Point */}
      <div className="relative z-20">
        <div className="w-32 h-32 rounded-[3rem] border-4 border-indigo-600/30 bg-indigo-600/5 p-6 relative group transition-all hover:border-indigo-500/60">
          <div className="absolute inset-0 bg-indigo-600/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
          <img 
            src={baseImage} 
            className="w-full h-full object-contain relative z-10 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
            style={{ imageRendering: 'pixelated' }}
            alt="Base"
          />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] whitespace-nowrap">
            Genetic Origin
          </div>
        </div>
        {treeStructure.length > 0 && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 h-24 w-0.5 bg-gradient-to-b from-indigo-500 to-indigo-500/20" />
        )}
      </div>

      {/* Evolution Branches */}
      {treeStructure.map(([step, nodes]) => (
        <div key={step} className="flex flex-col items-center gap-24 w-full">
          <div className="flex gap-16 justify-center flex-wrap max-w-6xl relative z-20">
            {nodes.map(node => (
              <TreeNode 
                key={node.id}
                id={`node-${node.id}`}
                outfit={node} 
                onSelect={onSelect} 
                isActive={activeId === node.id}
              />
            ))}
          </div>
          {/* Vertical Path to next step if exists */}
          {Number(step) < treeStructure.length && (
             <div className="h-24 w-0.5 bg-indigo-500/20" />
          )}
        </div>
      ))}

      {outfits.length === 0 && (
        <div className="flex flex-col items-center opacity-30 mt-10">
          <div className="w-0.5 h-32 bg-gradient-to-b from-indigo-500 to-transparent" />
          <p className="text-[10px] font-black uppercase tracking-[0.6em] mt-10 text-slate-500">Awaiting Evolution</p>
        </div>
      )}

      {/* Decorative Grid and Dust */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] checker-bg z-0" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent)] z-0" />
      
      <div className="h-40 shrink-0" />
    </div>
  );
};
