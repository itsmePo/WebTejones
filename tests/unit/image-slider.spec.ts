import { afterEach, describe, expect, it, vi } from 'vitest';

interface SliderOptions {
  slides?: number;
  withViewport?: boolean;
  withStatus?: boolean;
  withControls?: boolean;
  titles?: boolean;
}

interface SliderFixture {
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

function buildSlider(options: SliderOptions = {}): SliderFixture {
  const {
    slides = 3,
    withViewport = true,
    withStatus = true,
    withControls = true,
    titles = true,
  } = options;

  const slideMarkup = Array.from(
    { length: slides },
    (_, index) =>
      `<article data-slide${titles ? ` data-slide-title="Diapositiva ${index + 1}"` : ''}>${
        index + 1
      }</article>`,
  ).join('');
  const dotMarkup = Array.from(
    { length: slides },
    () => '<button type="button" data-slider-dot></button>',
  ).join('');

  document.body.innerHTML = `
    <section data-slider>
      ${
        withViewport
          ? `<div data-slider-viewport tabindex="0">${slideMarkup}</div>`
          : slideMarkup
      }
      ${withControls ? `<button data-slider-prev>Anterior</button><button data-slider-next>Siguiente</button>${dotMarkup}` : ''}
      ${withControls ? '<span data-slider-current></span>' : ''}
      ${withStatus ? '<p data-slider-status></p>' : ''}
    </section>`;

  const root = document.querySelector<HTMLElement>('[data-slider]')!;
  const viewport = root.querySelector<HTMLElement>('[data-slider-viewport]')!;
  const slideElements = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));

  return {
    root,
    viewport,
    slides: slideElements,
    status: root.querySelector('[data-slider-status]'),
    current: root.querySelector('[data-slider-current]'),
    dots: Array.from(root.querySelectorAll<HTMLButtonElement>('[data-slider-dot]')),
    prev: root.querySelector('[data-slider-prev]'),
    next: root.querySelector('[data-slider-next]'),
    scrollTo: vi.fn(),
  };
}

function setGeometry(element: HTMLElement, left: number, width: number): void {
  Object.defineProperty(element, 'offsetLeft', { configurable: true, get: () => left });
  Object.defineProperty(element, 'offsetWidth', { configurable: true, get: () => width });
}

function prepare(fixture: SliderFixture, { scrollLeft = 0, clientWidth = 300 } = {}): void {
  Object.defineProperty(fixture.viewport, 'scrollLeft', {
    configurable: true,
    writable: true,
    value: scrollLeft,
  });
  Object.defineProperty(fixture.viewport, 'clientWidth', { configurable: true, get: () => clientWidth });
  fixture.slides.forEach((slide, index) => setGeometry(slide, index * 300, 300));
  fixture.viewport.scrollTo = fixture.scrollTo as unknown as typeof fixture.viewport.scrollTo;
}

async function initSlider(): Promise<void> {
  vi.resetModules();
  const module = await import('../../src/scripts/image-slider');
  module.initImageSliders();
}

function setReducedMotion(matches: boolean): void {
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches } as MediaQueryList);
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('initImageSliders', () => {
  it('no falla si no hay sliders', async () => {
    document.body.innerHTML = '<p>sin slider</p>';

    await expect(initSlider()).resolves.toBeUndefined();
  });

  it('ignora un slider sin viewport', async () => {
    const fixture = buildSlider({ withViewport: false });
    if (fixture.viewport) {
      prepare(fixture);
    }
    await initSlider();

    expect(fixture.root.dataset.initialized).toBeUndefined();
  });

  it('ignora un slider sin diapositivas', async () => {
    const fixture = buildSlider({ slides: 0 });
    prepare(fixture);
    await initSlider();

    expect(fixture.root.dataset.initialized).toBeUndefined();
  });

  it('inicializa posición, contador y puntos sin anunciar', async () => {
    const fixture = buildSlider();
    prepare(fixture);
    await initSlider();

    expect(fixture.root.dataset.initialized).toBe('true');
    expect(fixture.current?.textContent).toBe('01');
    expect(fixture.status?.textContent).toBe('');
    expect(fixture.dots.map((dot) => dot.getAttribute('aria-current'))).toEqual([
      'true',
      'false',
      'false',
    ]);
  });

  it('no duplica manejadores si se inicializa dos veces', async () => {
    const fixture = buildSlider();
    prepare(fixture);
    await initSlider();
    await initSlider();

    fixture.next!.click();

    expect(fixture.current?.textContent).toBe('02');
  });

  it('avanza con el botón siguiente y envuelve al final', async () => {
    const fixture = buildSlider();
    prepare(fixture);
    await initSlider();

    fixture.next!.click();
    expect(fixture.current?.textContent).toBe('02');
    expect(fixture.status?.textContent).toBe('Diapositiva 2 de 3: Diapositiva 2.');
    expect(fixture.scrollTo).toHaveBeenLastCalledWith({ left: 300, behavior: 'smooth' });

    fixture.next!.click();
    fixture.next!.click();
    expect(fixture.current?.textContent).toBe('01');
    expect(fixture.scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'smooth' });
  });

  it('retrocede con el botón anterior y envuelve al principio', async () => {
    const fixture = buildSlider();
    prepare(fixture);
    await initSlider();

    fixture.prev!.click();

    expect(fixture.current?.textContent).toBe('03');
    expect(fixture.dots[2]?.getAttribute('aria-current')).toBe('true');
  });

  it('salta a la diapositiva del punto pulsado', async () => {
    const fixture = buildSlider();
    prepare(fixture);
    await initSlider();

    fixture.dots[2]!.click();

    expect(fixture.current?.textContent).toBe('03');
    expect(fixture.scrollTo).toHaveBeenLastCalledWith({ left: 600, behavior: 'smooth' });
  });

  it('no anuncia dos veces la misma diapositiva', async () => {
    const fixture = buildSlider();
    prepare(fixture);
    await initSlider();

    fixture.dots[1]!.click();
    const announced = fixture.status?.textContent;
    fixture.dots[1]!.click();

    expect(fixture.status?.textContent).toBe(announced);
    expect(announced).toBe('Diapositiva 2 de 3: Diapositiva 2.');
  });

  it('navega con el teclado y evita el desplazamiento nativo', async () => {
    const fixture = buildSlider();
    prepare(fixture);
    await initSlider();

    const right = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
    fixture.viewport.dispatchEvent(right);
    expect(right.defaultPrevented).toBe(true);
    expect(fixture.current?.textContent).toBe('02');

    const left = new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true });
    fixture.viewport.dispatchEvent(left);
    expect(left.defaultPrevented).toBe(true);
    expect(fixture.current?.textContent).toBe('01');

    fixture.viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', cancelable: true }));
    expect(fixture.current?.textContent).toBe('03');

    fixture.viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', cancelable: true }));
    expect(fixture.current?.textContent).toBe('01');
  });

  it('ignora teclas que no son de navegación', async () => {
    const fixture = buildSlider();
    prepare(fixture);
    await initSlider();
    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });

    fixture.viewport.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(fixture.scrollTo).not.toHaveBeenCalled();
  });

  it('actualiza el contador al desplazar sin anunciar y anuncia al parar', async () => {
    vi.useFakeTimers();
    const fixture = buildSlider();
    prepare(fixture);
    await initSlider();

    fixture.viewport.scrollLeft = 300;
    fixture.viewport.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(20);

    expect(fixture.current?.textContent).toBe('02');
    expect(fixture.status?.textContent).toBe('');

    await vi.advanceTimersByTimeAsync(200);

    expect(fixture.status?.textContent).toBe('Diapositiva 2 de 3: Diapositiva 2.');
  });

  it('no anuncia al desplazar si el índice no cambia', async () => {
    vi.useFakeTimers();
    const fixture = buildSlider();
    prepare(fixture);
    await initSlider();

    // En la inicialización se llamó a update(activeIndex, false), por lo que lastAnnouncedIndex sigue siendo -1.
    // Para probar que no anuncia al desplazar si el índice no cambia, primero simulamos un anuncio previo (o inicializamos y marcamos lastAnnouncedIndex como 0).
    // O mejor aún: despachamos scroll cuando lastAnnouncedIndex ya es igual al activeIndex actual (0).
    // Como initSlider llama a update(activeIndex, false), lastAnnouncedIndex es -1, por lo que el primer update(0, true) sí anuncia.
    // Una vez anunciado, si vuelve a dispararse scroll en el mismo índice, como safeIndex (0) === lastAnnouncedIndex (0), no debe anunciar.
    
    // Forzamos el estado como si ya se hubiera anunciado la diapositiva 1:
    fixture.viewport.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(200);
    expect(fixture.status?.textContent).toBe('Diapositiva 1 de 3: Diapositiva 1.');

    // Limpiamos o cambiamos el textContent para verificar si el siguiente scroll con el mismo índice reanuncia o no
    fixture.status!.textContent = '';

    // Disparamos otro scroll en la misma posición (índice 0)
    fixture.viewport.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(200);

    expect(fixture.status?.textContent).toBe('');
  });

  it('respeta prefers-reduced-motion', async () => {
    setReducedMotion(true);
    const fixture = buildSlider();
    prepare(fixture);
    await initSlider();

    fixture.next!.click();

    expect(fixture.scrollTo).toHaveBeenLastCalledWith({ left: 300, behavior: 'auto' });
  });

  it('recentra la diapositiva activa al redimensionar', async () => {
    const fixture = buildSlider();
    prepare(fixture);
    await initSlider();
    fixture.next!.click();
    fixture.scrollTo.mockClear();

    window.dispatchEvent(new Event('resize'));
    await vi.waitFor(() =>
      expect(fixture.scrollTo).toHaveBeenCalledWith({ left: 300, behavior: 'auto' }),
    );
  });

  it('anuncia sin título cuando la diapositiva no lo declara', async () => {
    const fixture = buildSlider({ titles: false });
    prepare(fixture);
    await initSlider();

    fixture.next!.click();

    expect(fixture.status?.textContent).toBe('Diapositiva 2 de 3.');
  });

  it('usa dos dígitos cuando hay diez diapositivas', async () => {
    const fixture = buildSlider({ slides: 10 });
    prepare(fixture);
    await initSlider();
    fixture.dots[9]!.click();

    expect(fixture.current?.textContent).toBe('10');
    expect(fixture.status?.textContent).toBe('Diapositiva 10 de 10: Diapositiva 10.');
  });

  it('funciona sin controles, contador ni estado', async () => {
    const fixture = buildSlider({ withControls: false, withStatus: false });
    prepare(fixture);
    await initSlider();

    expect(() => fixture.viewport.dispatchEvent(new Event('scroll'))).not.toThrow();
  });
});
