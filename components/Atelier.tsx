
import React, { useState, useRef, useMemo } from 'react';
import { AppState, GeneticTraits } from '../types';
import { DNA_TAGS, IDENTITY_TAGS, GEAR_TAGS } from '../constants';
import { IconButton, Tag, Loader, ComparisonSlider, NeuralLog, PixelCanvas } from './UI';
import { ImageProcessor } from '../services/imageProcessor';

interface AtelierProps {
  state: AppState;
  prompt: string;
  setPrompt: (v: string) => void;
  onUpload: (url: string) => void;
  onExtractDNA: (prompt: string, currentImage: string) => void;
  onRefineIdentity: (prompt: string) => void;
  onForgeGear: (prompt: string) => void;
  onReset: () => void;
}

export const Atelier: React.FC<AtelierProps> = ({ 
  state, prompt, setPrompt, onUpload, onExtractDNA, onRefineIdentity, onForgeGear, onReset 
}) => {
  const [activeCategory, setActiveCategory] = useState("");
  const [editTool, setEditTool] = useState<'brush' | 'eraser' | 'none'>('none');
  const [canvasImage, setCanvasImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determinar qué tags mostrar según la fase
  const currentTags = useMemo(() => {
    switch (state.phase) {
      case 'EXTRACTION': return DNA_TAGS;
      case 'IDENTITY': return IDENTITY_TAGS;
      case 'GEAR': return GEAR_TAGS;
      default: return [];
    }
  }, [state.phase]);

  // Inicializar categoría activa si cambia la fase
  useMemo(() => {
    if (currentTags.length > 0) setActiveCategory(currentTags[0].category);
  }, [currentTags]);

  const handleDownload = async (transparent: boolean = false) => {
    const url = state.activeParent?.url || state.identityBase || state.dnaBase;
    if (!url) return;
    const finalUrl = transparent ? await ImageProcessor.processAlpha(url) : url;
    const link = document.createElement('a');
    link.href = finalUrl;
    link.download = `spriteforge-${state.phase}-${Date.now()}.png`;
    link.click();
  };

  const handleForgeAction = () => {
    if (!prompt && state.phase !== 'EXTRACTION') return;
    switch (state.phase) {
      case 'EXTRACTION': 
        onExtractDNA(prompt || "Base mannequin, no clothes", canvasImage || state.rawUpload!); 
        break;
      case 'IDENTITY': onRefineIdentity(prompt); break;
      case 'GEAR': onForgeGear(prompt); break;
    }
    setPrompt(""); 
    setEditTool('none');
  };

  const getPhaseConfig = () => {
    switch (state.phase) {
      case 'EXTRACTION': return { label: 'DNA FORGE', color: 'text-purple-400', btn: 'bg-purple-600', shadow: 'shadow-purple-900/20' };
      case 'IDENTITY': return { label: 'IDENTITY MATRIX', color: 'text-emerald-400', btn: 'bg-emerald-600', shadow: 'shadow-emerald-900/20' };
      case 'GEAR': return { label: 'GEAR SYNTHESIS', color: 'text-indigo-400', btn: 'bg-indigo-600', shadow: 'shadow-indigo-900/20' };
      default: return { label: 'SYSTEM', color: 'text-slate-400', btn: 'bg-slate-600', shadow: '' };
    }
  };

  const config = getPhaseConfig();

  if (state.phase === 'INTAKE') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 bg-[#050505]">
        <div onClick={() => fileInputRef.current?.click()} className="w-full max-w-xs aspect-square border-2 border-dashed border-indigo-500/20 rounded-[3.5rem] bg-indigo-500/5 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all shadow-2xl">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-600/40">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          </div>
          <p className="text-[14px] font-black uppercase tracking-[0.3em] text-white">Neural Intake</p>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-3 opacity-60">Upload Source Image</p>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              const r = new FileReader();
              r.onload = () => onUpload(r.result as string);
              r.readAsDataURL(f);
            }
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#050505] relative overflow-hidden">
      {/* Sprite Preview Area (Top) */}
      <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-[0.03] checker-bg pointer-events-none" />
        
        {/* Stage-specific Viewport */}
        <div className={`relative flex items-center justify-center w-full h-full transition-all duration-1000 ${state.phase === 'IDENTITY' ? 'scale-[1.5] translate-y-[10%]' : 'scale-110'}`}>
          {state.phase === 'EXTRACTION' && (
            editTool !== 'none' ? (
              <PixelCanvas 
                imageUrl={canvasImage || state.rawUpload!} 
                tool={editTool as 'brush' | 'eraser'} 
                onSave={setCanvasImage}
                color={state.config.protocols.backgroundStyle === 'magenta' ? '#FF00FF' : '#000000'}
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={canvasImage || state.rawUpload!} className="max-h-[85%] object-contain" style={{ imageRendering: 'pixelated' }} />
                {!canvasImage && <p className="absolute text-[8px] font-black uppercase tracking-[1em] text-purple-500/40 pointer-events-none">Analyzing Structure</p>}
              </div>
            )
          )}
          {state.phase === 'IDENTITY' && (
             <ComparisonSlider before={state.dnaBase!} after={state.identityBase || state.dnaBase!} className="w-full h-full" />
          )}
          {state.phase === 'GEAR' && (
             state.activeParent ? <ComparisonSlider before={state.identityBase!} after={state.activeParent.url} /> : <img src={state.identityBase!} className="max-h-[85%] object-contain" style={{imageRendering:'pixelated'}} />
          )}
        </div>

        {/* HUD Controls: Side Toolbar */}
        <div className="absolute top-6 right-6 flex flex-col gap-4 z-[150]">
          <IconButton onClick={() => handleDownload(false)} variant="primary"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></IconButton>
          <IconButton onClick={() => handleDownload(true)} variant="success" className="border-emerald-500/20"><svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></IconButton>
        </div>

        {/* HUD Controls: Edit Tools (Contextual) */}
        {state.phase === 'EXTRACTION' && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[150] p-2 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl">
            <IconButton 
              active={editTool === 'eraser'} 
              onClick={() => setEditTool(editTool === 'eraser' ? 'none' : 'eraser')}
              className="w-10 h-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </IconButton>
            <IconButton 
              active={editTool === 'brush'} 
              onClick={() => setEditTool(editTool === 'brush' ? 'none' : 'brush')}
              className="w-10 h-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </IconButton>
            <div className="h-px bg-white/10 mx-2" />
            <IconButton 
              variant="danger" 
              onClick={() => { setCanvasImage(null); setEditTool('none'); }}
              className="w-10 h-10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </IconButton>
          </div>
        )}

        <div className="absolute top-6 left-6 z-[150]">
          <button onClick={onReset} className="px-4 py-2.5 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2 shadow-2xl">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
            Reset
          </button>
        </div>
      </div>

      <NeuralLog active={state.isGenerating} />

      {/* Unified Control Center (Bottom) */}
      <div className="shrink-0 bg-[#050505] border-t border-white/5 p-6 pb-12 safe-bottom z-[140] shadow-[0_-30px_60px_rgba(0,0,0,1)]">
        <div className="flex flex-col gap-5 animate-in slide-in-from-bottom duration-500">
          
          {/* Phase Indicator */}
          <div className="flex items-center gap-4">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.btn}`} />
            <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${config.color}`}>{config.label}</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          {/* Prompt Area */}
          <textarea 
            value={prompt} onChange={(e) => setPrompt(e.target.value)} 
            placeholder={state.phase === 'EXTRACTION' ? "Clean armored parts or specify body type..." : `Describe your ${state.phase.toLowerCase()} details...`}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[13px] text-white h-24 outline-none focus:border-white/20 resize-none placeholder:text-slate-700 font-medium"
          />

          {/* Dynamic Tags Area */}
          <div className="space-y-4">
            <div className="flex gap-4 overflow-x-auto no-scrollbar border-b border-white/5 pb-2">
              {currentTags.map(cat => (
                <button 
                  key={cat.category} 
                  onClick={() => setActiveCategory(cat.category)} 
                  className={`whitespace-nowrap text-[9px] font-black uppercase tracking-widest pb-1 transition-all ${activeCategory === cat.category ? config.color + ' border-b-2' : 'text-slate-700'}`}
                >
                  {cat.category}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {currentTags.find(c => c.category === activeCategory)?.tags.map(tag => (
                <Tag key={tag} label={tag} onClick={() => setPrompt(prompt ? `${prompt}, ${tag}` : tag)} />
              ))}
            </div>
          </div>

          {/* Execute Action */}
          <button 
            onClick={handleForgeAction} 
            disabled={state.isGenerating || (state.phase !== 'EXTRACTION' && !prompt)} 
            className={`w-full py-5 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.6em] text-white shadow-2xl transition-all active:scale-95 disabled:opacity-20 ${config.btn} ${config.shadow}`}
          >
            {state.phase === 'GEAR' ? 'Forge Evolution' : state.phase === 'EXTRACTION' ? 'Purify Base DNA' : 'Lock Identity'}
          </button>
        </div>
      </div>

      {state.isGenerating && <Loader message={`${config.label} in Progress...`} />}
    </div>
  );
};
