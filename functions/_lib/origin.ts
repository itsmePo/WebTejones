export function validateOrigin(request: Request, allowedOrigin?: string): boolean {
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');
  const host = request.headers.get('Host');

  if (!origin && !referer) {
    // Permitir solicitudes directas si no hay cabeceras (por ejemplo, tests o clientes estrictos sin JS)
    return true;
  }

  if (allowedOrigin) {
    if (origin && origin === allowedOrigin) return true;
    if (referer && referer.startsWith(allowedOrigin)) return true;
    return false;
  }

  if (host) {
    if (origin && origin.includes(host)) return true;
    if (referer && referer.includes(host)) return true;
    return false;
  }

  return true;
}
