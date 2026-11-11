import { defineConfig } from 'vitest/config';

/**
 * Configuración aislada para Stryker: solo unitarias, sin cobertura ni
 * proyectos de integración. Stryker necesita tiempos de ejecución cortos.
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.spec.ts'],
    setupFiles: ['tests/unit/setup.ts'],
    restoreMocks: true,
    coverage: { enabled: false },
  },
});
