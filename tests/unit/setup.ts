import { vi } from 'vitest';

// jsdom no implementa matchMedia ni el desplazamiento de contenedores: se
// suplen aquí para poder probar los scripts tal y como corren en el navegador.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList;
}

if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}

if (typeof window.requestAnimationFrame !== 'function') {
  window.requestAnimationFrame = ((callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(performance.now()), 16)) as typeof window.requestAnimationFrame;
  window.cancelAnimationFrame = (handle: number) => window.clearTimeout(handle);
}
