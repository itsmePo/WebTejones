import { describe, expect, it } from 'vitest';
import {
  coverageFromSummary,
  mutationFromReport,
  playwrightFromReport,
  renderSummary,
  round,
} from '../../scripts/lib/quality-summary.mjs';

describe('round', () => {
  it('redondea con el número de decimales indicado', () => {
    expect(round(12.345, 2)).toBe(12.35);
    expect(round(99.999)).toBe(100);
    expect(round(0.12345, 3)).toBe(0.123);
  });
});

describe('coverageFromSummary', () => {
  it('extrae los porcentajes totales', () => {
    const summary = {
      total: {
        lines: { pct: 92.5 },
        branches: { pct: 91 },
        functions: { pct: 100 },
        statements: { pct: 93.2 },
      },
    };

    expect(coverageFromSummary(summary)).toEqual({
      lines: 92.5,
      branches: 91,
      functions: 100,
      statements: 93.2,
    });
  });

  it('devuelve null cuando faltan métricas', () => {
    expect(coverageFromSummary({ total: { lines: { pct: 90 } } })).toEqual({
      lines: 90,
      branches: null,
      functions: null,
      statements: null,
    });
    expect(coverageFromSummary({} as any)).toEqual({
      lines: null,
      branches: null,
      functions: null,
      statements: null,
    });
  });
});

describe('mutationFromReport', () => {
  it('calcula detectados sobre válidos sin contar errores ni ignorados', () => {
    const report = {
      files: {
        'a.ts': {
          mutants: [
            { status: 'Killed' },
            { status: 'Killed' },
            { status: 'Survived' },
            { status: 'NoCoverage' },
            { status: 'Timeout' },
            { status: 'RuntimeError' },
            { status: 'CompileError' },
            { status: 'Ignored' },
          ],
        },
      },
    };

    expect(mutationFromReport(report)).toEqual({ detected: 3, valid: 5, score: 60 });
  });

  it('devuelve score null si no hay mutantes válidos', () => {
    expect(mutationFromReport({ files: { 'a.ts': { mutants: [{ status: 'Ignored' }] } } })).toEqual({
      detected: 0,
      valid: 0,
      score: null,
    });
    expect(mutationFromReport({} as any)).toEqual({ detected: 0, valid: 0, score: null });
  });
});

describe('playwrightFromReport', () => {
  it('resume las estadísticas de Playwright', () => {
    const report = { stats: { expected: 8, unexpected: 1, flaky: 2, skipped: 0 } };

    expect(playwrightFromReport(report)).toEqual({
      expected: 8,
      unexpected: 1,
      flaky: 2,
      skipped: 0,
      ok: false,
    });
  });

  it('usa ceros si no hay estadísticas', () => {
    expect(playwrightFromReport({})).toEqual({
      expected: 0,
      unexpected: 0,
      flaky: 0,
      skipped: 0,
      ok: true,
    });
  });
});

describe('renderSummary', () => {
  const complete = {
    coverage: { lines: 92.5, branches: 91, functions: 100, statements: 93.2 },
    mutation: { detected: 45, valid: 50, score: 90 },
    playwright: { expected: 12, unexpected: 0, flaky: 0, skipped: 0, ok: true },
    budget: { ok: true, textTotal: 307200, pageTotal: 1258291 },
    lighthouse: { lcp: 2500, cls: 0.1, tbt: 200, totalBytes: 1258291, routes: 2 },
    missing: [],
  };

  it('marca en verde un informe completo dentro de umbrales', () => {
    const markdown = renderSummary(complete);

    expect(markdown).toContain('# Informe combinado de calidad (G0)');
    expect(markdown).toContain('| Cobertura (unitarias + integración) | líneas 92.5 % / ramas 91 % | ≥ 90 % | ✅ |');
    expect(markdown).toContain('| Mutación (Stryker) | 90 % | ≥ 90 % | ✅ |');
    expect(markdown).toContain('| Presupuesto (HTML+CSS+JS) | 300.0 KB | ≤ 300 KB | ✅ |');
    expect(markdown).toContain('| Lighthouse LCP | 2500 ms | ≤ 2500 ms | ✅ |');
    expect(markdown).toContain('| Lighthouse CLS | 0.1 | ≤ 0,1 | ✅ |');
    expect(markdown).toContain('| TBT (proxy de laboratorio de INP) | 200 ms | ≤ 200 ms | ✅ |');
    expect(markdown).not.toContain('⛔');
    expect(markdown).not.toContain('❌');
  });

  it('marca en rojo la cobertura y la mutación por debajo del mínimo', () => {
    const markdown = renderSummary({
      ...complete,
      coverage: { lines: 89.9, branches: 95, functions: 100, statements: 90 },
      mutation: { detected: 44, valid: 50, score: 88 },
    });

    expect(markdown).toContain('| Cobertura (unitarias + integración) | líneas 89.9 % / ramas 95 % | ≥ 90 % | ❌ |');
    expect(markdown).toContain('| Mutación (Stryker) | 88 % | ≥ 90 % | ❌ |');
  });

  it('marca en rojo E2E, presupuesto y métricas fuera de límite', () => {
    const markdown = renderSummary({
      ...complete,
      playwright: { expected: 10, unexpected: 2, flaky: 0, skipped: 0, ok: false },
      budget: { ok: false, textTotal: 307201, pageTotal: 1258292 },
      lighthouse: { lcp: 2501, cls: 0.11, tbt: 201, totalBytes: 1258292, routes: 2 },
    });

    expect(markdown).toContain('| E2E (Playwright) | 10 ok / 2 fallos | 0 fallos | ❌ |');
    expect(markdown).toContain('| Presupuesto (portada) | 1228.8 KB | ≤ 1200 KB | ❌ |');
    expect(markdown).toContain('| Lighthouse LCP | 2501 ms | ≤ 2500 ms | ❌ |');
    expect(markdown).toContain('| Lighthouse CLS | 0.11 | ≤ 0,1 | ❌ |');
    expect(markdown).toContain('| TBT (proxy de laboratorio de INP) | 201 ms | ≤ 200 ms | ❌ |');
    expect(markdown).toContain('| Lighthouse total transferido | 1228.8 KB | ≤ 1200 KB | ❌ |');
  });

  it('declara los reportes ausentes', () => {
    const markdown = renderSummary({ missing: ['reports/coverage/coverage-summary.json'] });

    expect(markdown).toContain('⛔ sin datos');
    expect(markdown).toContain('—');
    expect(markdown).toContain(
      '> Reportes ausentes: reports/coverage/coverage-summary.json. Ejecuta el paso correspondiente del gate.',
    );
  });
});
