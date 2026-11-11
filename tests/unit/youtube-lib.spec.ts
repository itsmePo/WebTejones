import { describe, it, expect } from 'vitest';
import { validateYoutubeId, buildEmbedUrl, watchUrl } from '../../src/lib/youtube';

describe('youtube.ts', () => {
  it('validates correct 11-character YouTube IDs', () => {
    expect(validateYoutubeId('dQw4w9WgXcQ')).toBe(true);
    expect(validateYoutubeId('abc123XYZ-_')).toBe(true);
  });

  it('rejects invalid YouTube IDs', () => {
    expect(validateYoutubeId('tooShort')).toBe(false);
    expect(validateYoutubeId('thisIsWayTooLong123')).toBe(false);
    expect(validateYoutubeId('')).toBe(false);
    expect(validateYoutubeId('invalid@char!')).toBe(false);
  });

  it('builds nocookie embed URL correctly', () => {
    expect(buildEmbedUrl('dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('throws on building embed URL with invalid ID', () => {
    expect(() => buildEmbedUrl('invalid')).toThrow('ID de YouTube inválido');
  });

  it('builds watch fallback URL correctly', () => {
    expect(watchUrl('dQw4w9WgXcQ')).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('throws on building watch URL with invalid ID', () => {
    expect(() => watchUrl('invalid')).toThrow('ID de YouTube inválido');
  });
});
