
import { NeuralNode, ForgeConfig } from './types';

export const INITIAL_NEURAL_CHAIN: NeuralNode[] = [
  { id: 'engine-core', label: 'SPRITE ENGINE', description: 'Professional pixel logic.', instruction: 'ROLE: Professional JRPG Pixel Artist. Use cluster shading and hand-placed pixel look.', isActive: true, isLocked: true },
  { id: 'dna-lock', label: 'IDENTITY LOCK', description: 'Face/Hair protection.', instruction: 'ENFORCE IDENTITY DNA LOCK™. Do not alter face, hair silhouette, or skin tones of the base sprite.', isActive: true },
  { id: 'pixel-precision', label: 'PIXEL LOCK', description: 'Consistent sizing.', instruction: 'Maintain consistent 1x1 pixel size throughout the entire sprite. No soft edges.', isActive: true },
  { id: 'chroma-key', label: 'CHROMA PURE', description: 'Technical background.', instruction: 'FORCE BACKGROUND TO #FF00FF MAGENTA. ABSOLUTELY NO GRADIENTS OR EFFECTS.', isActive: true }
];

export const DEFAULT_CONFIG: ForgeConfig = {
  model: 'gemini-2.5-flash-image',
  size: '1K',
  aspectRatio: '1:1',
  mutationStrength: 50,
  protocols: {
    backgroundStyle: 'magenta',
    pixelPerfect: true,
    strongOutline: true,
    hd2dStyle: true
  },
  neuralChain: INITIAL_NEURAL_CHAIN
};

export const DNA_TAGS = [
  { category: "Body Structure", tags: ["JRPG Heroic Male", "JRPG Heroic Female", "Classic SD Proportions", "Compact 16-bit Body"] },
  { category: "Technical Pose", tags: ["A-Pose (Frontal)", "Battle Idle (Static)", "3/4 Profile Tech"] },
  { category: "Art Fidelity", tags: ["High Contrast Shading", "Limited Palette", "Clean Outline"] }
];

export const IDENTITY_TAGS = [
  { category: "Face Polish", tags: ["RPG Expressive Eyes", "Minimalist Mouth", "Defined Face Shape"] },
  { category: "Hair Volume", tags: ["Stylized Clumps", "High Highlight Hair", "Sharp Spiky Tips", "Wavy Blocky Hair"] },
  { category: "Skin Detail", tags: ["Step Shading", "Warmer Tones", "Cool Shadows"] }
];

export const GEAR_TAGS = [
  { category: "Layer 1: Base Tunic", tags: ["Linen Undershirt", "Silk Base Layer", "Quilted Gambeson", "Wrapped Bandages", "Padded Bodysuit"] },
  { category: "Layer 2: Plate/Armor", tags: ["Heavy Breastplate", "Brigandine Vest", "Shoulder Pauldrons", "Chainmail Overlay", "Reinforced Greaves"] },
  { category: "Layer 3: Straps/Gear", tags: ["Double Bandolier", "Utility Sash", "Leather Belt & Pouches", "Gold Filigree Trim", "Decorative Chains"] },
  { category: "Layer 4: Outer/Capes", tags: ["Royal Mantle", "High Collar Cape", "Tattered Hood", "Fur-Lined Cloak", "Knightly Surcoat"] }
];

export const QUICK_TAGS = GEAR_TAGS;
