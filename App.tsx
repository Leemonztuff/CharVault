
import React, { useState, useEffect } from 'react';
import { useSpriteForge } from './hooks/useSpriteForge';
import { Atelier } from './components/Atelier';
import { Vault } from './components/Vault';
import { EvolutionTree } from './components/EvolutionTree';
import { IconButton, Slider } from './components/UI';

type TabType = 'atelier' | 'vault' | 'evolution';

const App: React.FC = () => {
  const { state, dispatch, extractDNA, refineIdentity, forgeGear } = useSpriteForge();
  const [activeTab, setActiveTab] = useState<TabType>('atelier');
  const [prompt, setPrompt] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);

  // Check if API key has been selected as required by guidelines for certain models
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      } else {
        setApiKeySelected(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume success after triggering the selection dialog
      setApiKeySelected(true);
    }
  };

  const handleSelectAsset = (outfit: any) => {
    dispatch({ type: 'SET_ACTIVE_OUTFIT', payload: outfit });
    setPrompt(outfit.prompt || '');
    setActiveTab('atelier');
  };

  const showNav = state.phase !== 'INTAKE' && state.phase !== 'EXTRACTION';

  // Enforcement for gemini-3-pro-image-preview usage
  if (state.config.model === 'gemini-3-pro-image-preview' && apiKeySelected === false) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#050505] p-10 text-center z-[1000]">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl border border-white/10">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white mb-4">Pro Key Required</h2>
        <p className="text-slate-400 text-xs max-w-xs mb-8 leading-relaxed">
          High-quality image generation via Gemini 3 Pro requires a selected API key from a paid GCP project.
        </p>
        <button 
          onClick={handleSelectApiKey}
          className="px-8 py-4 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all"
        >
          Select Billing Key
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-6 text-[9px] font-bold text-indigo-400 uppercase tracking-widest hover:underline opacity-60"
        >
          View Billing Documentation
        </a>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#050505] text-[#f8fafc] font-sans overflow-hidden">
      <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl z-[200]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg border border-white/10">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h1 className="text-[12px] font-black uppercase tracking-[0.4em] leading-none">SpriteForge</h1>
            <p className="text-[7px] font-black uppercase tracking-widest text-indigo-500 mt-1 opacity-60">Linear Creation Pipeline</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <IconButton onClick={() => setIsConfigOpen(true)} className="w-8 h-8">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.94-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
          </IconButton>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'atelier' && (
          <Atelier 
            state={state} prompt={prompt} setPrompt={setPrompt}
            onUpload={(url) => dispatch({ type: 'UPLOAD_RAW', payload: url })}
            onExtractDNA={extractDNA}
            onRefineIdentity={refineIdentity}
            onForgeGear={() => forgeGear(prompt)}
            onReset={() => dispatch({ type: 'RESET_FLOW' })}
          />
        )}
        {activeTab === 'vault' && (
          <Vault outfits={state.outfits} activeId={state.activeParent?.id} onSelect={handleSelectAsset} onDelete={(id) => dispatch({type:'REMOVE_OUTFIT', payload: id})} />
        )}
        {activeTab === 'evolution' && (
          <EvolutionTree outfits={state.outfits} baseImage={state.identityBase || state.dnaBase} activeId={state.activeParent?.id} onSelect={handleSelectAsset} />
        )}

        {state.error && (
          <div className="absolute bottom-24 left-6 right-6 bg-red-600 p-4 rounded-2xl flex items-center justify-between z-[300] shadow-2xl animate-in slide-in-from-bottom">
            <span className="text-[10px] font-black uppercase text-white truncate max-w-[80%]">{state.error}</span>
            <button onClick={() => dispatch({ type: 'SET_ERROR', payload: null })} className="p-2">✕</button>
          </div>
        )}
      </main>

      {showNav && (
        <nav className="h-20 shrink-0 bg-black/60 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around safe-bottom z-[200]">
          {[
            { id: 'atelier', label: 'Funnel', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'evolution', label: 'History', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
            { id: 'vault', label: 'Vault', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' }
          ].map(t => (
            <button 
              key={t.id} onClick={() => setActiveTab(t.id as TabType)} 
              className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === t.id ? 'text-indigo-400' : 'text-slate-600'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={t.icon} /></svg>
              <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
            </button>
          ))}
        </nav>
      )}

      {isConfigOpen && (
        <div className="fixed inset-0 z-[500] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsConfigOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a] rounded-t-[3rem] p-8 border-t border-white/5 max-h-[80vh] overflow-y-auto no-scrollbar shadow-2xl">
            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-8 border-l-4 border-indigo-600 pl-4">Neural Config</h3>
            <Slider label="Mutation Strength" value={state.config.mutationStrength} min={0} max={100} onChange={() => {}} />
            <div className="h-24" />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
