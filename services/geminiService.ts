
import { GoogleGenAI } from "@google/genai";
import { ForgeConfig, GeneticTraits } from "../types";

export class GeminiService {
  /**
   * Base Template Forge: Generates the technical mannequin.
   */
  static async extractBaseDNA(sourceImage: string, config: ForgeConfig, userPrompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const systemInstruction = `
      ACT AS A SENIOR PIXEL ARTIST FOR CLASSIC JRPGS (16-BIT / HD-2D STYLE).
      OBJECTIVE: Create a high-quality TECHNICAL BODY TEMPLATE (Mannequin).

      TECHNICAL SPECS:
      1. STYLE: Pure Pixel Art. Cluster shading, clean outlines, limited palette.
      2. PIXEL RATIO: Strict 1x1 consistency. No pixel doubling or sub-pixels.
      3. PROPORTIONS: Classic JRPG (slightly larger head, compact body).
      4. BACKGROUND: Solid Magenta #FF00FF ONLY. No effects, glows, or decorations.
      5. SUBJECT: Base character in neutral undergarments. High contrast shading on skin/hair.
      
      DESIGN: ${userPrompt}
      STRIP: All weapons, armor, props, and background elements. Output ONLY the isolated body asset.
    `;

    try {
      const response = await ai.models.generateContent({
        model: config.model,
        contents: { parts: [
          { inlineData: { data: this.stripBase64(sourceImage), mimeType: 'image/jpeg' } },
          { text: "GENERATE PROFESSIONAL JRPG PIXEL ART BASE TEMPLATE ON SOLID #FF00FF." }
        ]},
        config: { 
          systemInstruction, 
          imageConfig: { 
            aspectRatio: config.aspectRatio,
            ...(config.model === 'gemini-3-pro-image-preview' ? { imageSize: config.size } : {})
          } 
        },
      });
      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return part ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : "";
    } catch (e: any) { throw new Error(e.message); }
  }

  /**
   * Identity Matrix: Refines face and hair with precision.
   */
  static async synthesizeIdentity(equippedImage: string, baseDNA: string, traits: Partial<GeneticTraits>, config: ForgeConfig): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const systemInstruction = `
      YOU ARE AN EXPERT SPRITE POLISHER.
      OBJECTIVE: Refine face and hair while maintaining pixel integrity.
      
      RULES:
      - EYES: Defined pixel-by-pixel (JRPG style).
      - HAIR: Shaded by volume clumps (not individual strands).
      - CLEANLINESS: Zero pixel noise. Every pixel must have a purpose.
      - BACKGROUND: Solid Magenta #FF00FF.
      
      TRAITS: ${traits.marks || "Sharp facial features and stylized hair."}
    `;

    try {
      const response = await ai.models.generateContent({
        model: config.model,
        contents: { parts: [
          { inlineData: { data: this.stripBase64(baseDNA), mimeType: 'image/jpeg' } },
          { text: "REFINE PIXEL ART IDENTITY. MAINTAIN JRPG AESTHETIC AND MAGENTA BACKGROUND." }
        ]},
        config: { 
          systemInstruction, 
          imageConfig: { 
            aspectRatio: config.aspectRatio,
            ...(config.model === 'gemini-3-pro-image-preview' ? { imageSize: config.size } : {})
          } 
        },
      });
      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return part ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : "";
    } catch (e: any) { throw new Error(e.message); }
  }

  /**
   * Gear Synthesis: Handles complex layering with IDENTITY DNA LOCK™ protection.
   */
  static async synthesizeEvolution(baseImage: string, parentUrl: string | null, prompt: string, config: ForgeConfig): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const systemInstruction = `
      ACT AS A MASTER SPRITE GEAR DESIGNER.
      OBJECTIVE: Layer equipment over the technical mannequin while locking character identity.

      [IDENTITY DNA LOCK™ ENFORCED]
      - MODULE 16 — FACE ANCHOR: The face defines canonical identity. Preserve eye shape, position, pixel placement, and expression. FORBIDDEN to redraw the face.
      - MODULE 17 — HAIR LOCK: Hairstyle and hair silhouette are locked. Do not change length, shape, parting, or volume.
      - MODULE 18 — SKIN TONE LOCK: Maintain the base skin palette exactly. No recoloring allowed.
      - MODULE 19/20 — IDENTITY GUARD: If face/hair/skin mismatch is detected, the asset is invalid.

      [LAYER HIERARCHY PROTOCOL]
      1. UNDERLAYER: Body-mapped tunics, leggings, base fabrics.
      2. PADDING: Gambesons, leather buffers under armor.
      3. MAIN GEAR: Breastplates, pauldrons, grebas, heavy robes.
      4. OVER-GEAR: Belts, bandoliers, pouches, holsters.
      5. OUTER: Cloaks, hoods, mantles, flowing accessories.

      [PHYSICAL CONSISTENCY]
      - VOLUME: Gear must add physical depth/thickness to the base silhouette.
      - FOLDS: Cloth must wrinkle and drape according to gravity and the body forms underneath.
      - OCLUSIÓN: Upper layers MUST cast subtle shadows on the layers directly below.
      - LIGHTING: Consistent 45-degree light source for the whole sprite.

      TECHNICAL: Solid Magenta #FF00FF background. Clean Pixel Art.
      GEAR REQUEST: ${prompt}
    `;

    try {
      const response = await ai.models.generateContent({
        model: config.model,
        contents: { parts: [
          { inlineData: { data: this.stripBase64(baseImage), mimeType: 'image/jpeg' } },
          { text: "TECHNICAL BASE MANNEQUIN WITH LOCKED IDENTITY." },
          ...(parentUrl ? [{ inlineData: { data: this.stripBase64(parentUrl), mimeType: 'image/jpeg' } }, { text: "CURRENT GEAR STATE" }] : []),
          { text: `APPLY COMPLEX LAYERING: ${prompt}. RESPECT DEPTH, GRAVITY, AND IDENTITY LOCK.` }
        ]},
        config: { 
          systemInstruction, 
          imageConfig: { 
            aspectRatio: config.aspectRatio,
            ...(config.model === 'gemini-3-pro-image-preview' ? { imageSize: config.size } : {})
          } 
        },
      });
      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return part ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : "";
    } catch (e: any) { throw new Error(e.message); }
  }

  private static stripBase64(url: string): string {
    return url.split(',')[1] || url;
  }
}
