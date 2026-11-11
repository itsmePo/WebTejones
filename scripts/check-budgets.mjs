import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { evaluateBudget, extractImages, extractLocalReferences, gzipSize } from './lib/budgets.mjs';

const DIST = 'dist';
const PAGE = 'index.html';
const REPORT = 'reports/budget.json';

/**
 * @param {string} url ruta pública absoluta, por ejemplo `/_astro/main.css`
 */
function distPathFor(url) {
  const clean = decodeURIComponent(url.split('?')[0].split('#')[0]);
  return join(DIST, clean.replace(/^\//, ''));
}

function main() {
  const pagePath = join(DIST, PAGE);

  if (!existsSync(pagePath)) {
    console.error(`[budget] No existe ${pagePath}. Ejecuta \`npm run build\` antes.`);
    process.exit(1);
  }

  const html = readFileSync(pagePath);
  const references = extractLocalReferences(html.toString('utf8'));
  const cssBytes = references
    .filter((reference) => reference.kind === 'stylesheet')
    .reduce((sum, reference) => sum + gzipSize(readFileSync(distPathFor(reference.url))), 0);
  const jsBytes = references
    .filter((reference) => reference.kind === 'script')
    .reduce((sum, reference) => sum + gzipSize(readFileSync(distPathFor(reference.url))), 0);

  const images = extractImages(html.toString('utf8')).map((image) => {
    const file = distPathFor(image.url);

    if (!existsSync(file)) {
      console.error(`[budget] Imagen referenciada y ausente: ${image.url}`);
      process.exit(1);
    }

    return { ...image, bytes: readFileSync(file).length };
  });

  const result = evaluateBudget({
    htmlBytes: gzipSize(html),
    cssBytes,
    jsBytes,
    images,
  });

  mkdirSync('reports', { recursive: true });
  writeFileSync(REPORT, `${JSON.stringify({ page: PAGE, ...result, images }, null, 2)}\n`);

  const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
  console.log(`[budget] HTML+CSS+JS gzip: ${kb(result.textTotal)} (límite 300 KB)`);
  console.log(`[budget] Portada: ${kb(result.pageTotal)} (límite 1200 KB)`);

  if (!result.ok) {
    for (const failure of result.failures) {
      console.error(
        `[budget] ${failure.label}: ${kb(failure.actual)} > ${kb(failure.limit)}`,
      );
    }
    process.exit(1);
  }
}

main();
