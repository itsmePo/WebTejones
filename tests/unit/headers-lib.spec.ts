import { describe, expect, it } from 'vitest';
import { buildHeaders, PREVIEW_ROBOTS_HEADER, resolveDeployMode } from '../../scripts/lib/headers.mjs';

const BASE = `/*
  X-Content-Type-Options: nosniff

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
`;

describe('resolveDeployMode', () => {
  it('trata un build local sin rama como preview', () => {
    expect(resolveDeployMode({})).toEqual({ branch: '(local)', production: false });
  });

  it('considera producción la rama main', () => {
    expect(resolveDeployMode({ CF_PAGES_BRANCH: 'main' })).toEqual({
      branch: 'main',
      production: true,
    });
  });

  it('recorta espacios de la rama', () => {
    expect(resolveDeployMode({ CF_PAGES_BRANCH: '  main  ' }).production).toBe(true);
  });

  it('cualquier otra rama es preview', () => {
    expect(resolveDeployMode({ CF_PAGES_BRANCH: 'feature/t-01' })).toEqual({
      branch: 'feature/t-01',
      production: false,
    });
  });

  it('una rama vacía vuelve a modo local', () => {
    expect(resolveDeployMode({ CF_PAGES_BRANCH: '   ' }).branch).toBe('(local)');
  });
});

describe('buildHeaders', () => {
  it('no toca las cabeceras en producción', () => {
    expect(buildHeaders(BASE, { production: true })).toBe(BASE);
  });

  it('inyecta noindex justo después de la regla /* en preview', () => {
    const output = buildHeaders(BASE, { production: false });
    const lines = output.split('\n');

    expect(lines[0]).toBe('/*');
    expect(lines[1]).toBe(PREVIEW_ROBOTS_HEADER);
    expect(lines[2]).toBe('  X-Content-Type-Options: nosniff');
    expect(output).toContain('X-Robots-Tag: noindex');
  });

  it('es idempotente: no duplica la cabecera', () => {
    const once = buildHeaders(BASE, { production: false });
    const twice = buildHeaders(once, { production: false });

    expect(twice).toBe(once);
    expect(twice.match(/X-Robots-Tag: noindex/g)).toHaveLength(1);
  });

  it('falla si el archivo base no tiene la regla /*', () => {
    expect(() => buildHeaders('/solo-una-ruta\n  A: b\n', { production: false })).toThrow(
      /falta la regla/,
    );
  });

  it('mantiene el resto del archivo intacto', () => {
    const output = buildHeaders(BASE, { production: false });

    expect(output).toContain('/_astro/*\n  Cache-Control: public, max-age=31536000, immutable');
    expect(output.endsWith('immutable\n')).toBe(true);
  });
});
