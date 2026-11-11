import { readFile, writeFile } from 'node:fs/promises';
import { buildHeaders, resolveDeployMode } from './lib/headers.mjs';

const basePath = 'public/_headers';
const distPath = 'dist/_headers';
const mode = resolveDeployMode();

const base = await readFile(basePath, 'utf8');
const output = buildHeaders(base, mode);

await writeFile(distPath, output, 'utf8');

console.log(
  `[headers] Rama "${mode.branch}": ${mode.production ? 'producción (sin noindex)' : 'preview (X-Robots-Tag: noindex)'}`,
);
