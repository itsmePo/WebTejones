import { defineConfig } from 'vitest/config';

/**
 * Vitest se divide en dos proyectos que comparten un único informe de cobertura:
 * unitarias (jsdom) e integración sobre el HTML generado en `dist/`.
 * El umbral combinado de líneas y ramas es 90 % (objetivo 100 %, G0.3/G0.4).
 */
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'scripts/lib/**/*.mjs'],
      exclude: ['src/env.d.ts', '**/*.d.ts'],
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      reportsDirectory: 'reports/coverage',
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90,
      },
    },
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['tests/unit/**/*.spec.ts'],
          setupFiles: ['tests/unit/setup.ts'],
          restoreMocks: true,
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'node',
          include: ['tests/integration/**/*.test.ts'],
          // La integración valida el HTML generado: `npm run build` es requisito.
        },
      },
    ],
  },
});
