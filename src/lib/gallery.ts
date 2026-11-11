export interface PhotoItem {
  alt: string;
  src: string | any;
}

interface ProcessedPhoto {
  alt: string;
  src: string;
  srcset: string;
  width: number;
  height: number;
}

export async function processPhotos(fotos: PhotoItem[]): Promise<ProcessedPhoto[]> {
  const processed: ProcessedPhoto[] = [];

  for (const foto of fotos) {
    if (!foto.src) continue;
    
    const srcStr = typeof foto.src === 'string' ? foto.src : '';
    processed.push({
      alt: foto.alt,
      src: srcStr,
      srcset: srcStr,
      width: 800,
      height: 500,
    });
  }

  return processed;
}
