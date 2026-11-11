/**
 * `_headers` de Cloudflare Pages: lógica pura para inyectar `noindex` solo en
 * despliegues que no son producción. Producción = rama `main`.
 *
 * Cloudflare Pages interpreta `_headers` en el despliegue, no en local; por eso
 * esta lógica se prueba con unitarias y el archivo generado con integración.
 */

export const PREVIEW_ROBOTS_HEADER = '  X-Robots-Tag: noindex';

/**
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env
 * @returns {{ branch: string, production: boolean }}
 */
export function resolveDeployMode(env = process.env) {
  const branch = (env.CF_PAGES_BRANCH ?? '').trim();
  return {
    branch: branch === '' ? '(local)' : branch,
    production: branch === 'main',
  };
}

/**
 * @param {string} base contenido de `_headers` con las cabeceras de seguridad
 * @param {{ production: boolean }} mode
 * @returns {string}
 */
export function buildHeaders(base, { production }) {
  if (production) return base;

  if (base.includes('X-Robots-Tag: noindex')) return base;

  const lines = base.split('\n');
  const ruleIndex = lines.findIndex((line) => line.trim() === '/*');

  if (ruleIndex === -1) {
    throw new Error('_headers inválido: falta la regla "/*"');
  }

  lines.splice(ruleIndex + 1, 0, PREVIEW_ROBOTS_HEADER);
  return lines.join('\n');
}
