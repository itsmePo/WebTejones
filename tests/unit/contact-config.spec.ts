import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadConfig({ endpoint, dev }: { endpoint?: string; dev?: boolean }) {
  vi.resetModules();
  vi.stubEnv('PUBLIC_CONTACT_FORM_ENDPOINT', endpoint ?? '');
  if (dev) {
    vi.stubEnv('DEV', 'true' as unknown as boolean);
  } else {
    vi.stubEnv('DEV', '' as unknown as boolean);
  }
  const module = await import('../../src/config/contact');
  return module.contactConfig;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('contactConfig', () => {
  it('usa el endpoint recortado y modo remoto', async () => {
    const config = await loadConfig({ endpoint: '  https://formulario.example/api  ' });

    expect(config.endpoint).toBe('https://formulario.example/api');
    expect(config.formName).toBe('contacto-tejones');
    expect(config.mode).toBe('remote');
  });

  it('sin endpoint y sin DEV queda sin configurar', async () => {
    const config = await loadConfig({ endpoint: '   ' });

    expect(config.endpoint).toBe('');
    expect(config.mode).toBe('unconfigured');
  });

  it('sin endpoint y en desarrollo usa el modo local simulado', async () => {
    const config = await loadConfig({ dev: true });

    expect(config.mode).toBe('dev');
  });

  it('el endpoint tiene prioridad sobre DEV', async () => {
    const config = await loadConfig({ endpoint: 'https://x.example', dev: true });

    expect(config.mode).toBe('remote');
  });
});
