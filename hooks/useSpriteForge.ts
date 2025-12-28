
import { useReducer, useCallback, useEffect } from 'react';
import { AppState, GeneratedOutfit, GeneticTraits, WorkflowPhase } from '../types';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { DEFAULT_CONFIG } from '../constants';

type ForgeAction = 
  | { type: 'UPLOAD_RAW'; payload: string }
  | { type: 'SET_DNA_BASE'; payload: string }
  | { type: 'SET_IDENTITY_BASE'; payload: string }
  | { type: 'SET_ACTIVE_OUTFIT'; payload: GeneratedOutfit | null }
  | { type: 'ADD_OUTFIT'; payload: GeneratedOutfit }
  | { type: 'SET_PHASE'; payload: WorkflowPhase }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_FLOW' }
  | { type: 'REMOVE_OUTFIT'; payload: string }
  | { type: 'LOAD_VAULT'; payload: GeneratedOutfit[] };

function forgeReducer(state: AppState, action: ForgeAction): AppState {
  switch (action.type) {
    case 'UPLOAD_RAW': 
      return { ...state, rawUpload: action.payload, phase: 'EXTRACTION' };
    case 'SET_DNA_BASE': 
      return { ...state, dnaBase: action.payload, phase: 'IDENTITY' };
    case 'SET_IDENTITY_BASE': 
      return { ...state, identityBase: action.payload, phase: 'GEAR' };
    case 'SET_ACTIVE_OUTFIT':
      return { ...state, activeParent: action.payload };
    case 'ADD_OUTFIT':
      return { ...state, outfits: [action.payload, ...state.outfits] };
    case 'REMOVE_OUTFIT':
      return { ...state, outfits: state.outfits.filter(o => o.id !== action.payload) };
    case 'SET_PHASE': return { ...state, phase: action.payload };
    case 'SET_LOADING': return { ...state, isGenerating: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'LOAD_VAULT': return { ...state, outfits: action.payload };
    case 'RESET_FLOW': return { ...state, rawUpload: null, dnaBase: null, identityBase: null, phase: 'INTAKE', activeParent: null };
    default: return state;
  }
}

export function useSpriteForge() {
  const [state, dispatch] = useReducer(forgeReducer, {
    rawUpload: null,
    dnaBase: null,
    identityBase: null,
    activeParent: null,
    outfits: [],
    isGenerating: false,
    config: DEFAULT_CONFIG,
    error: null,
    phase: 'INTAKE'
  });

  useEffect(() => {
    StorageService.getAllOutfits().then(data => dispatch({ type: 'LOAD_VAULT', payload: data }));
  }, []);

  const extractDNA = useCallback(async (userPrompt: string, currentImage: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const dna = await GeminiService.extractBaseDNA(currentImage, state.config, userPrompt);
      dispatch({ type: 'SET_DNA_BASE', payload: dna });
    } catch (e: any) { dispatch({ type: 'SET_ERROR', payload: e.message }); }
    finally { dispatch({ type: 'SET_LOADING', payload: false }); }
  }, [state.config]);

  const refineIdentity = useCallback(async (userPrompt: string) => {
    if (!state.dnaBase) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const identity = await GeminiService.synthesizeIdentity(state.dnaBase, state.dnaBase, { marks: userPrompt }, state.config);
      dispatch({ type: 'SET_IDENTITY_BASE', payload: identity });
    } catch (e: any) { dispatch({ type: 'SET_ERROR', payload: e.message }); }
    finally { dispatch({ type: 'SET_LOADING', payload: false }); }
  }, [state.dnaBase, state.config]);

  const forgeGear = useCallback(async (userPrompt: string) => {
    if (!state.identityBase) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const outfitUrl = await GeminiService.synthesizeEvolution(state.identityBase, state.activeParent?.url || null, userPrompt, state.config);
      const newOutfit: GeneratedOutfit = {
        id: crypto.randomUUID(),
        url: outfitUrl,
        originalUrl: outfitUrl,
        prompt: userPrompt,
        timestamp: Date.now(),
        model: state.config.model,
        aspectRatio: state.config.aspectRatio,
        evolutionStep: (state.activeParent?.evolutionStep || 0) + 1
      };
      await StorageService.saveOutfit(newOutfit);
      dispatch({ type: 'ADD_OUTFIT', payload: newOutfit });
      dispatch({ type: 'SET_ACTIVE_OUTFIT', payload: newOutfit });
    } catch (e: any) { dispatch({ type: 'SET_ERROR', payload: e.message }); }
    finally { dispatch({ type: 'SET_LOADING', payload: false }); }
  }, [state.identityBase, state.activeParent, state.config]);

  return { state, dispatch, extractDNA, refineIdentity, forgeGear };
}
