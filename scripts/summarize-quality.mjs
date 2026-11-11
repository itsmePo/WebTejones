import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import {
  coverageFromSummary,
  mutationFromReport,
  playwrightFromReport,
  renderSummary,
} from './lib/quality-summary.mjs';

const FILES = {
  coverage: 'reports/coverage/coverage-summary.json',
  mutation: 'reports/mutation/mutation.json',
  playwright: 'reports/playwright/results.json',
  budget: 'reports/budget.json',
  lighthouse: 'reports/lighthouse/manifest.json',
};

function readJson(path) {
  if (!existsSync(path)) return null;

  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function lighthouseSummary(manifest) {
  if (!Array.isArray(manifest) || manifest.length === 0) return undefined;

  const routes = new Set();
  const metrics = { lcp: 0, cls: 0, tbt: 0, totalBytes: 0 };
  let samples = 0;

  for (const entry of manifest) {
    const report = entry?.jsonPath ? readJson(entry.jsonPath) : null;
    if (!report?.audits) continue;

    routes.add(entry.url);
    metrics.lcp = Math.max(metrics.lcp, report.audits['largest-contentful-paint']?.numericValue ?? 0);
    metrics.cls = Math.max(metrics.cls, report.audits['cumulative-layout-shift']?.numericValue ?? 0);
    metrics.tbt = Math.max(metrics.tbt, report.audits['total-blocking-time']?.numericValue ?? 0);
    metrics.totalBytes = Math.max(
      metrics.totalBytes,
      report.audits['total-byte-weight']?.numericValue ?? 0,
    );
    samples += 1;
  }

  return samples === 0 ? undefined : { ...metrics, routes: routes.size };
}

const coverage = readJson(FILES.coverage);
const mutation = readJson(FILES.mutation);
const playwright = readJson(FILES.playwright);
const budget = readJson(FILES.budget);
const lighthouse = lighthouseSummary(readJson(FILES.lighthouse));

const missing = Object.entries(FILES)
  .filter(([key]) => !readJson(FILES[key]))
  .map(([, path]) => path);

const summary = {
  generatedAt: new Date().toISOString(),
  coverage: coverage ? coverageFromSummary(coverage) : null,
  mutation: mutation ? mutationFromReport(mutation) : null,
  playwright: playwright ? playwrightFromReport(playwright) : null,
  budget: budget ? { ok: budget.ok, textTotal: budget.textTotal, pageTotal: budget.pageTotal } : null,
  lighthouse: lighthouse ?? null,
  missing,
};

mkdirSync('reports', { recursive: true });
writeFileSync('reports/quality-summary.json', `${JSON.stringify(summary, null, 2)}\n`);
writeFileSync('reports/quality-summary.md', `${renderSummary(summary)}\n`);

console.log(renderSummary(summary));
