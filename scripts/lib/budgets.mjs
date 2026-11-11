import { gzipSync } from 'node:zlib';

/**
 * Presupuesto de rendimiento (docs/plan.md §4 y docs/implementation-plan.md §0).
 * Los límites se expresan en bytes y se comparan con `<=`.
 */
export const LIMITS = {
  /** HTML + CSS + JS iniciales, gzip, todo incluido. */
  htmlCssJsGzip: 300 * 1024,
  /** Portada completa sin contar el vídeo (que no se descarga). */
  pageTotal: 1.2 * 1024 * 1024,
  /** Imagen de portada / hero. */
  heroImage: 250 * 1024,
  /** Cada imagen de la galería. */
  galleryImage: 200 * 1024,
  /** Cualquier otra imagen servida (miniaturas, posters). */
  defaultImage: 250 * 1024,
};

export function gzipSize(buffer) {
  return gzipSync(buffer).length;
}

export function budgetFor(budget) {
  if (budget === 'gallery') return LIMITS.galleryImage;
  if (budget === 'hero') return LIMITS.heroImage;
  return LIMITS.defaultImage;
}

export function isLocalUrl(url) {
  return url.startsWith('/') && !url.startsWith('//');
}

function readAttribute(tag, name) {
  const match = new RegExp(`\\b${name}="([^"]*)"`).exec(tag);
  return match?.[1] ?? '';
}

/**
 * Referencias locales de script y hoja de estilos del HTML.
 * @param {string} html
 * @returns {{ kind: 'script' | 'stylesheet', url: string }[]}
 */
export function extractLocalReferences(html) {
  const references = [];

  for (const match of html.matchAll(/<(?:script|link)\b[^>]*>/g)) {
    const tag = match[0];

    if (tag.startsWith('<link')) {
      if (readAttribute(tag, 'rel') !== 'stylesheet') continue;
      const url = readAttribute(tag, 'href');
      if (url && isLocalUrl(url)) references.push({ kind: 'stylesheet', url });
      continue;
    }

    const url = readAttribute(tag, 'src');
    if (url && isLocalUrl(url)) references.push({ kind: 'script', url });
  }

  return references;
}

/**
 * Imágenes locales declaradas en el HTML junto con su presupuesto.
 * Convención: `data-budget="hero"` o `data-budget="gallery"`; sin atributo se
 * aplica el límite por defecto (250 KB). Se cuentan `src` y los candidatos de
 * `srcset` para no colar una variante más pesada por el `srcset`.
 * @param {string} html
 * @returns {{ budget: 'hero' | 'gallery' | 'default', url: string }[]}
 */
export function extractImages(html) {
  const images = [];

  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0];
    const marker = readAttribute(tag, 'data-budget');
    const budget = marker === 'hero' || marker === 'gallery' ? marker : 'default';
    const urls = new Set();

    const src = readAttribute(tag, 'src');
    if (src) urls.add(src);

    for (const candidate of readAttribute(tag, 'srcset').split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url) urls.add(url);
    }

    for (const url of urls) {
      if (isLocalUrl(url)) images.push({ budget, url });
    }
  }

  return images;
}

/**
 * @param {{ htmlBytes: number, cssBytes: number, jsBytes: number, images: { budget: string, bytes: number, url: string }[] }} input
 * @returns {{ failures: { actual: number, label: string, limit: number }[], ok: boolean, pageTotal: number, textTotal: number }}
 */
export function evaluateBudget({ htmlBytes, cssBytes, jsBytes, images }) {
  const failures = [];
  const textTotal = htmlBytes + cssBytes + jsBytes;

  if (textTotal > LIMITS.htmlCssJsGzip) {
    failures.push({
      label: 'HTML+CSS+JS (gzip)',
      actual: textTotal,
      limit: LIMITS.htmlCssJsGzip,
    });
  }

  for (const image of images) {
    const limit = budgetFor(image.budget);
    if (image.bytes > limit) {
      failures.push({ label: image.url, actual: image.bytes, limit });
    }
  }

  const pageTotal = textTotal + images.reduce((sum, image) => sum + image.bytes, 0);

  if (pageTotal > LIMITS.pageTotal) {
    failures.push({ label: 'Portada completa', actual: pageTotal, limit: LIMITS.pageTotal });
  }

  return { ok: failures.length === 0, failures, pageTotal, textTotal };
}
