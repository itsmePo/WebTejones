import { afterEach, describe, expect, it, vi } from 'vitest';
import { processPhotos } from '../../src/lib/gallery';

describe('gallery lib', () => {
  it('processes photos successfully with fallback or optimization', async () => {
    const photos = [
      { alt: 'Foto 1 de prueba', src: '/src/assets/fotos/foto-1.jpg' },
      { alt: 'Foto 2 de prueba', src: '/src/assets/fotos/foto-2.jpg' },
    ];

    const result = await processPhotos(photos);
    expect(result).toHaveLength(2);
    expect(result[0].alt).toBe('Foto 1 de prueba');
    expect(result[0].width).toBe(800);
    expect(result[0].height).toBe(500);
  });

  it('skips photos without src', async () => {
    const photos = [
      { alt: 'Foto sin src', src: '' },
    ];

    const result = await processPhotos(photos);
    expect(result).toHaveLength(0);
  });
});
