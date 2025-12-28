
export class ImageProcessor {
  /**
   * Procesa la imagen para extraer el canal Alpha eliminando fondos sólidos (Magenta/Blanco).
   */
  static async processAlpha(
    sourceUrl: string, 
    threshold: number = 45, 
    feather: number = 2
  ): Promise<string> {
    const img = await this.loadImage(sourceUrl);
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas context failed");
    
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Detectar color de fondo dominante en las esquinas
    const corners = [
      (0) * 4,
      (canvas.width - 1) * 4,
      ((canvas.height - 1) * canvas.width) * 4,
      (canvas.height * canvas.width - 1) * 4
    ];
    
    let bgR = 0, bgG = 0, bgB = 0;
    corners.forEach(idx => {
      bgR += data[idx];
      bgG += data[idx+1];
      bgB += data[idx+2];
    });
    bgR /= 4; bgG /= 4; bgB /= 4;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      
      // Distancia euclidiana de color (ponderada para percepción humana)
      const dist = Math.sqrt(
        Math.pow(r - bgR, 2) * 0.3 + 
        Math.pow(g - bgG, 2) * 0.59 + 
        Math.pow(b - bgB, 2) * 0.11
      );

      if (dist < threshold) {
        data[i + 3] = 0; // Transparente total
      } else if (dist < threshold + feather) {
        // Suavizado de bordes (Feathering)
        const alpha = ((dist - threshold) / feather);
        data[i + 3] = Math.round(alpha * 255);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  /**
   * PIXELGUARD™ CORE: Valida si la silueta generada se mantiene dentro de los límites de la base.
   */
  static async checkSilhouetteDrift(baseUrl: string, genUrl: string): Promise<number> {
    const baseImg = await this.loadImage(baseUrl);
    const genImg = await this.loadImage(genUrl);

    const canvas = document.createElement('canvas');
    canvas.width = 128; 
    canvas.height = 128;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    // Extract Base Mask
    ctx.clearRect(0, 0, 128, 128);
    ctx.drawImage(baseImg, 0, 0, 128, 128);
    const baseData = ctx.getImageData(0, 0, 128, 128).data;
    const baseMask = new Uint8Array(128 * 128);
    
    // Color de esquina para fondo
    const br = baseData[0], bg = baseData[1], bb = baseData[2];

    for (let i = 0; i < baseData.length; i += 4) {
      const r = baseData[i], g = baseData[i+1], b = baseData[i+2];
      const diff = Math.abs(r-br) + Math.abs(g-bg) + Math.abs(b-bb);
      baseMask[i/4] = diff < 30 ? 0 : 1;
    }

    // Extract Gen Mask
    ctx.clearRect(0, 0, 128, 128);
    ctx.drawImage(genImg, 0, 0, 128, 128);
    const genData = ctx.getImageData(0, 0, 128, 128).data;
    
    let driftPixels = 0;
    let totalSubjectPixels = 0;

    for (let i = 0; i < genData.length; i += 4) {
      const r = genData[i], g = genData[i+1], b = genData[i+2];
      const diff = Math.abs(r-br) + Math.abs(g-bg) + Math.abs(b-bb);
      const isSubject = diff >= 30;
      
      if (isSubject) {
        totalSubjectPixels++;
        if (baseMask[i/4] === 0) driftPixels++;
      }
    }

    return totalSubjectPixels === 0 ? 0 : (driftPixels / totalSubjectPixels) * 100;
  }

  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }
}
