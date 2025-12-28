
export type ImageSize = '1K' | '2K' | '4K';
export type ModelType = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
export type BackgroundStyle = 'magenta' | 'white' | 'gray' | 'gradient';

// Flujo lineal estricto
export type WorkflowPhase = 'INTAKE' | 'EXTRACTION' | 'IDENTITY' | 'GEAR';

export interface GeneticTraits {
  eyes: string;
  hairStyle: string;
  hairColor: string;
  skinTone: string;
  marks: string;
}

// Added NeuralNode interface to fix missing export error in constants.ts
export interface NeuralNode {
  id: string;
  label: string;
  description: string;
  instruction: string;
  isActive: boolean;
  isLocked?: boolean;
}

export interface GeneratedOutfit {
  id: string;
  url: string;
  originalUrl: string;
  parentId?: string;
  prompt: string;
  timestamp: number;
  model: ModelType;
  aspectRatio: AspectRatio;
  evolutionStep: number;
  geneticTraits?: GeneticTraits;
}

export interface ForgeConfig {
  model: ModelType;
  size: ImageSize;
  aspectRatio: AspectRatio;
  mutationStrength: number;
  // Added protocols field to fix error in constants.ts
  protocols: {
    backgroundStyle: BackgroundStyle;
    pixelPerfect: boolean;
    strongOutline: boolean;
    hd2dStyle: boolean;
  };
  // Added neuralChain field to fix error in geminiService.ts and constants.ts
  neuralChain: NeuralNode[];
}

export interface AppState {
  rawUpload: string | null;      // Imagen original subida
  dnaBase: string | null;        // Maniquí sin ropa
  identityBase: string | null;   // Personaje con rasgos aplicados
  activeParent: GeneratedOutfit | null;
  outfits: GeneratedOutfit[];
  isGenerating: boolean;
  config: ForgeConfig;
  error: string | null;
  phase: WorkflowPhase;
}
