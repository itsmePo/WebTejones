import { afterEach, describe, expect, it, vi } from 'vitest';

interface GalleryOptions {
  slides?: number;
  withViewport?: boolean;
  withStatus?: boolean;
  withControls?: boolean;
  titles?: boolean;
}

interface GalleryFixture {
  root: HTMLElement;
  viewport: HTMLElement;
  slides: HTMLElement[];
  status: HTMLElement | null;
  current: HTMLElement | null;
  dots: HTMLButtonElement[];
  prev: HTMLButtonElement | null;
  next: HTMLButtonElement | null;
  scrollTo: ReturnType<typeof vi.fn>;
}

function buildGallery(options: GalleryOptions = {}): GalleryFixture {
  const {
    slides = 8,
    withViewport = true,
    withStatus = true,
    withControls = true,
    titles = true,
  } = options;

  const slideMarkup = Array.from(
    { length: slides },
    (_, index) =>
      `<article data-slide${titles ? ` data-slide-title="Foto ${index + 1}"` : ''}>${
        index + 1
      }</article>`,
  ).join('');
  const dotMarkup = Array.from(
    { length: slides },
    () => '<button type="button" data-gallery-dot></button>',
  ).join('');

  document.body.innerHTML = `
    <section data-gallery>
      ${
        withViewport
          ? `<div data-gallery-viewport tabindex="0">${slideMarkup}</div>`
          : slideMarkup
      }
      ${withControls ? `<button data-gallery-prev>Anterior</button><button data-gallery-next>Siguiente</button>${dotMarkup}` : ''}
      ${withControls ? '<span data-gallery-current></span>' : ''}
      ${withStatus ? '<p data-gallery-status></p>' : ''}
    </section>`;

  const root = document.querySelector<HTMLElement>('[data-gallery]')!;
  const viewport = root.querySelector<HTMLElement>('[data-gallery-viewport]')!;
  const slideElements = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));

  return {
    root,
    viewport,
    slides: slideElements,
    status: root.querySelector('[data-gallery-status]'),
    current: root.querySelector('[data-gallery-current]'),
    dots: Array.from(root.querySelectorAll<HTMLButtonElement>('[data-gallery-dot]')),
    prev: root.querySelector('[data-gallery-prev]'),
    next: root.querySelector('[data-gallery-next]'),
    scrollTo: vi.fn(),
  };
}

function setGeometry(element: HTMLElement, left: number, width: number): void {
  Object.defineProperty(element, 'offsetLeft', { configurable: true, get: () => left });
  Object.defineProperty(element, 'offsetWidth', { configurable: true, get: () => width });
}

function prepare(fixture: GalleryFixture, { scrollLeft = 0, clientWidth = 300 } = {}): void {
  Object.defineProperty(fixture.viewport, 'scrollLeft', {
    configurable: true,
    writable: true,
    value: scrollLeft,
  });
  Object.defineProperty(fixture.viewport, 'clientWidth', { configurable: true, get: () => clientWidth });
  fixture.slides.forEach((slide, index) => setGeometry(slide, index * 300, 300));
  fixture.viewport.scrollTo = fixture.scrollTo as unknown as typeof fixture.viewport.scrollTo;
}

async function initGallery(): Promise<void> {
  vi.resetModules();
  const module = await import('../../src/scripts/gallery');
  module.initGallery();
}

function setReducedMotion(matches: boolean): void {
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches } as MediaQueryList);
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.classList.remove('js');
});

describe('initGallery', () => {
  it('no falla si no hay galerías', async () => {
    document.body.innerHTML = '<p>sin galería</p>';
    await expect(initGallery()).resolves.toBeUndefined();
  });

  it('ignora galería sin viewport', async () => {
    const fixture = buildGallery({ withViewport: false });
    if (fixture.viewport) {
      prepare(fixture);
    }
    await initGallery();
    expect(fixture.root.dataset.initialized).toBeUndefined();
  });

  it('ignora galería sin diapositivas', async () => {
    const fixture = buildGallery({ slides: 0 });
    prepare(fixture);
    await initGallery();
    expect(fixture.root.dataset.initialized).toBeUndefined();
  });

  it('inicializa posición, contador, puntos y añade clase .js', async () => {
    const fixture = buildGallery();
    prepare(fixture);
    await initGallery();

    expect(fixture.root.dataset.initialized).toBe('true');
    expect(document.documentElement.classList.contains('js')).toBe(true);
    expect(fixture.current?.textContent).toBe('01');
    expect(fixture.status?.textContent).toBe('');
    expect(fixture.dots[0]?.getAttribute('aria-current')).toBe('true');
  });

  it('avanza con el botón siguiente y envuelve al final', async () => {
    const fixture = buildGallery();
    prepare(fixture);
    await initGallery();

    fixture.next!.click();
    expect(fixture.current?.textContent).toBe('02');
    expect(fixture.status?.textContent).toBe('Foto 2 de 8: Foto 2.');
    expect(fixture.scrollTo).toHaveBeenLastCalledWith({ left: 300, behavior: 'smooth' });
  });

  it('retrocede con el botón anterior y envuelve al principio', async () => {
    const fixture = buildGallery();
    prepare(fixture);
    await initGallery();

    fixture.prev!.click();
    expect(fixture.current?.textContent).toBe('08');
  });

  it('salta con los puntos y navega por teclado', async () => {
    const fixture = buildGallery();
    prepare(fixture);
    await initGallery();

    fixture.dots[3]!.click();
    expect(fixture.current?.textContent).toBe('04');

    const right = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
    fixture.viewport.dispatchEvent(right);
    expect(right.defaultPrevented).toBe(true);
    expect(fixture.current?.textContent).toBe('05');

    fixture.viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', cancelable: true }));
    expect(fixture.current?.textContent).toBe('08');

    fixture.viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', cancelable: true }));
    expect(fixture.current?.textContent).toBe('01');
  });

  it('respeta prefers-reduced-motion', async () => {
    setReducedMotion(true);
    const fixture = buildGallery();
    prepare(fixture);
    await initGallery();

    fixture.next!.click();
    expect(fixture.scrollTo).toHaveBeenLastCalledWith({ left: 300, behavior: 'auto' });
  });
});
