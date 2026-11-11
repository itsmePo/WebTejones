/**
 * Utilidades puras del informe combinado de calidad. La CLI
 * `scripts/summarize-quality.mjs` solo lee ficheros y delega aquí.
 */

export function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** @param {{ total: Record<string, { pct: number }> }} summary */
export function coverageFromSummary(summary) {
  const total = summary?.total ?? {};
  const pct = (key) => (typeof total[key]?.pct === 'number' ? total[key].pct : null);
  return {
    lines: pct('lines'),
    branches: pct('branches'),
    functions: pct('functions'),
    statements: pct('statements'),
  };
}

/**
 * Puntuación de mutación: detectados / válidos, donde válidos excluye
 * compileError y runtimeError (no son mutantes evaluables).
 * @param {{ files: Record<string, { mutants: { status: string }[] }> }} report
 */
export function mutationFromReport(report) {
  const statuses = Object.values(report?.files ?? {}).flatMap((file) =>
    (file.mutants ?? []).map((mutant) => mutant.status),
  );
  const detected = statuses.filter((status) => ['Killed', 'Timeout'].includes(status)).length;
  const valid = statuses.filter(
    (status) => !['CompileError', 'RuntimeError', 'Ignored'].includes(status),
  ).length;

  return {
    detected,
    valid,
    score: valid === 0 ? null : round((detected / valid) * 100),
  };
}

/** @param {{ stats?: { expected: number, unexpected: number, flaky: number, skipped: number } }} report */
export function playwrightFromReport(report) {
  const stats = report?.stats ?? {};
  return {
    expected: stats.expected ?? 0,
    unexpected: stats.unexpected ?? 0,
    flaky: stats.flaky ?? 0,
    skipped: stats.skipped ?? 0,
    ok: (stats.unexpected ?? 0) === 0,
  };
}

function percentOrDash(value) {
  return value === null || value === undefined ? '—' : `${round(value)} %`;
}

function state(ok, blocked = false) {
  if (blocked) return '⛔ bloqueado';
  return ok ? '✅' : '❌';
}

/**
 * @param {{
 *   coverage?: ReturnType<typeof coverageFromSummary>,
 *   mutation?: ReturnType<typeof mutationFromReport>,
 *   playwright?: ReturnType<typeof playwrightFromReport>,
 *   budget?: { ok: boolean, textTotal?: number, pageTotal?: number },
 *   lighthouse?: { lcp?: number | null, cls?: number | null, tbt?: number | null,
 *     totalBytes?: number | null, routes?: number },
 *   missing?: string[],
 * }} data
 */
export function renderSummary(data) {
  const { coverage, mutation, playwright, budget, lighthouse, missing = [] } = data;
  const kb = (bytes) =>
    typeof bytes === 'number' ? `${(bytes / 1024).toFixed(1)} KB` : '—';
  const ms = (value) => (typeof value === 'number' ? `${Math.round(value)} ms` : '—');

  const rows = [
    [
      'Cobertura (unitarias + integración)',
      `líneas ${percentOrDash(coverage?.lines)} / ramas ${percentOrDash(coverage?.branches)}`,
      '≥ 90 %',
      coverage ? state((coverage.lines ?? 0) >= 90 && (coverage.branches ?? 0) >= 90) : '⛔ sin datos',
    ],
    [
      'Mutación (Stryker)',
      percentOrDash(mutation?.score ?? null),
      '≥ 90 %',
      mutation ? state((mutation.score ?? 0) >= 90) : '⛔ sin datos',
    ],
    [
      'E2E (Playwright)',
      playwright ? `${playwright.expected} ok / ${playwright.unexpected} fallos` : '—',
      '0 fallos',
      playwright ? state(playwright.ok) : '⛔ sin datos',
    ],
    [
      'Presupuesto (HTML+CSS+JS)',
      kb(budget?.textTotal),
      '≤ 300 KB',
      budget ? state(budget.ok) : '⛔ sin datos',
    ],
    [
      'Presupuesto (portada)',
      kb(budget?.pageTotal),
      '≤ 1200 KB',
      budget ? state(budget.ok) : '⛔ sin datos',
    ],
    [
      'Lighthouse LCP',
      ms(lighthouse?.lcp),
      '≤ 2500 ms',
      lighthouse?.lcp != null ? state(lighthouse.lcp <= 2500) : '⛔ sin datos',
    ],
    [
      'Lighthouse CLS',
      typeof lighthouse?.cls === 'number' ? String(round(lighthouse.cls, 3)) : '—',
      '≤ 0,1',
      lighthouse?.cls != null ? state(lighthouse.cls <= 0.1) : '⛔ sin datos',
    ],
    [
      'TBT (proxy de laboratorio de INP)',
      ms(lighthouse?.tbt),
      '≤ 200 ms',
      lighthouse?.tbt != null ? state(lighthouse.tbt <= 200) : '⛔ sin datos',
    ],
    [
      'Lighthouse total transferido',
      kb(lighthouse?.totalBytes),
      '≤ 1200 KB',
      lighthouse?.totalBytes != null ? state(lighthouse.totalBytes <= 1258291) : '⛔ sin datos',
    ],
  ];

  const missingNote = missing.length
    ? `\n> Reportes ausentes: ${missing.join(', ')}. Ejecuta el paso correspondiente del gate.\n`
    : '';

  return [
    '# Informe combinado de calidad (G0)',
    '',
    '| Puerta | Valor | Umbral | Estado |',
    '| --- | --- | --- | --- |',
    ...rows.map((row) => `| ${row.join(' | ')} |`),
    missingNote,
  ].join('\n');
}
