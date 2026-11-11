import { describe, expect, it } from 'vitest';
import {
  budgetFor,
  evaluateBudget,
  extractImages,
  extractLocalReferences,
  gzipSize,
  isLocalUrl,
  LIMITS,
} from '../../scripts/lib/budgets.mjs';

describe('gzipSize', () => {
  it('devuelve el tamaño comprimido en bytes', () => {
    const raw = Buffer.from('a'.repeat(1024));
    const compressed = gzipSize(raw);

    expect(compressed).toBeGreaterThan(0);
    expect(compressed).toBeLessThan(raw.length);
  });
});

describe('isLocalUrl', () => {
  it('acepta rutas absolutas del sitio', () => {
    expect(isLocalUrl('/_astro/main.css')).toBe(true);
    expect(isLocalUrl('/')).toBe(true);
  });

  it('rechaza URLs externas y protocol-relative', () => {
    expect(isLocalUrl('https://example.com/a.js')).toBe(false);
    expect(isLocalUrl('//cdn.example.com/a.js')).toBe(false);
    expect(isLocalUrl('relativa.css')).toBe(false);
  });
});

describe('budgetFor', () => {
  it('aplica 200 KB a la galería', () => {
    expect(budgetFor('gallery')).toBe(200 * 1024);
  });

  it('aplica 250 KB al hero', () => {
    expect(budgetFor('hero')).toBe(250 * 1024);
  });

  it('aplica el límite por defecto al resto', () => {
    expect(budgetFor('default')).toBe(LIMITS.defaultImage);
    expect(budgetFor(undefined)).toBe(250 * 1024);
  });
});

describe('extractLocalReferences', () => {
  it('encuentra scripts y hojas de estilo locales', () => {
    const html = `
      <link rel="stylesheet" href="/_astro/site.css">
      <script type="module" src="/_astro/page.js"></script>
    `;

    expect(extractLocalReferences(html)).toEqual([
      { kind: 'stylesheet', url: '/_astro/site.css' },
      { kind: 'script', url: '/_astro/page.js' },
    ]);
  });

  it('ignora recursos externos, preloads y enlaces sin href', () => {
    const html = `
      <link rel="stylesheet" href="https://cdn.example.com/x.css">
      <link rel="preload" href="/_astro/font.woff2">
      <link rel="stylesheet">
      <script src="//cdn.example.com/x.js"></script>
      <script src="https://example.com/y.js"></script>
    `;

    expect(extractLocalReferences(html)).toEqual([]);
  });

  it('detecta la hoja de estilos aunque el orden de atributos cambie', () => {
    const html = '<link href="/styles.css" media="all" rel="stylesheet">';

    expect(extractLocalReferences(html)).toEqual([
      { kind: 'stylesheet', url: '/styles.css' },
    ]);
  });
});

describe('extractImages', () => {
  it('extrae src y todos los candidatos de srcset', () => {
    const html =
      '<img src="/hero.jpg" srcset="/hero-400.jpg 400w, /hero-800.jpg 800w" alt="Banda">';

    expect(extractImages(html)).toEqual([
      { budget: 'default', url: '/hero.jpg' },
      { budget: 'default', url: '/hero-400.jpg' },
      { budget: 'default', url: '/hero-800.jpg' },
    ]);
  });

  it('respeta el presupuesto declarado en data-budget', () => {
    const html = `
      <img src="/hero.jpg" data-budget="hero" alt="Portada">
      <img src="/galeria-1.jpg" data-budget="gallery" alt="Directo">
      <img src="/otra.jpg" data-budget="desconocido" alt="Otra">
    `;

    expect(extractImages(html)).toEqual([
      { budget: 'hero', url: '/hero.jpg' },
      { budget: 'gallery', url: '/galeria-1.jpg' },
      { budget: 'default', url: '/otra.jpg' },
    ]);
  });

  it('ignora imágenes externas y srcset vacío', () => {
    const html = `
      <img src="https://example.com/a.jpg" alt="Externa">
      <img src="/local.jpg" srcset="" alt="Local">
      <img alt="Sin fuente">
    `;

    expect(extractImages(html)).toEqual([{ budget: 'default', url: '/local.jpg' }]);
  });
});

describe('evaluateBudget', () => {
  const base = {
    htmlBytes: 1000,
    cssBytes: 500,
    jsBytes: 500,
    images: [] as { budget: string; bytes: number; url: string }[],
  };

  it('pasa justo en el límite', () => {
    const result = evaluateBudget({ ...base, htmlBytes: LIMITS.htmlCssJsGzip - 1000 });

    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.textTotal).toBe(LIMITS.htmlCssJsGzip);
  });

  it('falla un byte por encima del límite de HTML+CSS+JS', () => {
    const result = evaluateBudget({ ...base, htmlBytes: LIMITS.htmlCssJsGzip - 999 });

    expect(result.ok).toBe(false);
    expect(result.failures).toEqual([
      {
        label: 'HTML+CSS+JS (gzip)',
        actual: LIMITS.htmlCssJsGzip + 1,
        limit: LIMITS.htmlCssJsGzip,
      },
    ]);
  });

  it('aplica el límite de galería por imagen', () => {
    const result = evaluateBudget({
      ...base,
      images: [{ budget: 'gallery', bytes: LIMITS.galleryImage + 1, url: '/g.jpg' }],
    });

    expect(result.failures).toEqual([
      { label: '/g.jpg', actual: LIMITS.galleryImage + 1, limit: LIMITS.galleryImage },
    ]);
  });

  it('acepta una imagen de galería de exactamente 200 KB y un hero de 250 KB', () => {
    const result = evaluateBudget({
      ...base,
      images: [
        { budget: 'gallery', bytes: LIMITS.galleryImage, url: '/g.jpg' },
        { budget: 'hero', bytes: LIMITS.heroImage, url: '/h.jpg' },
      ],
    });

    expect(result.ok).toBe(true);
  });

  it('falla si la portada supera 1,2 MB', () => {
    const image = { budget: 'default', bytes: LIMITS.defaultImage, url: '/foto.jpg' };
    const result = evaluateBudget({
      ...base,
      images: [image, image, image, image, image, image],
    });

    expect(result.ok).toBe(false);
    expect(result.failures.map((failure: { label: string }) => failure.label)).toEqual([
      'Portada completa',
    ]);
  });

  it('suma el total de texto e imágenes', () => {
    const result = evaluateBudget({
      ...base,
      images: [{ budget: 'default', bytes: 2000, url: '/a.jpg' }],
    });

    expect(result.textTotal).toBe(2000);
    expect(result.pageTotal).toBe(4000);
  });
});
