function getNearestIndex(viewport: HTMLElement, slides: HTMLElement[]): number {
  const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  slides.forEach((slide, index) => {
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    const distance = Math.abs(slideCenter - viewportCenter);

    if (distance < closestDistance) {
      closestIndex = index;
      closestDistance = distance;
    }
  });

  return closestIndex;
}

function initSlider(root: HTMLElement): void {
  if (root.dataset.initialized === "true") return;

  const viewport = root.querySelector<HTMLElement>("[data-slider-viewport]");
  const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-slide]"));
  const previous = root.querySelector<HTMLButtonElement>("[data-slider-prev]");
  const next = root.querySelector<HTMLButtonElement>("[data-slider-next]");
  const bar = root.querySelector<HTMLElement>("[data-slider-bar]");

  if (!viewport || slides.length === 0) return;

  root.dataset.initialized = "true";

  const total = slides.length;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = getNearestIndex(viewport, slides);
  let scrollTimer: number | undefined;
  let scrollFrame = 0;
  let resizeFrame = 0;

  function update(index: number): void {
    const safeIndex = Math.max(0, Math.min(index, total - 1));
    activeIndex = safeIndex;

    if (bar) {
      const percentage = (safeIndex / (total - 1)) * 100;
      bar.style.transform = `translateX(${percentage}%)`;
    }
  }

  const goTo = (index: number): void => {
    const nextIndex = (index + total) % total;
    const slide = slides[nextIndex];

    if (!slide) return;

    update(nextIndex);
    viewport.scrollTo({
      left: slide.offsetLeft - viewport.offsetLeft,
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
  };

  viewport.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(scrollFrame);

      scrollFrame = requestAnimationFrame(() => {
        const index = getNearestIndex(viewport, slides);
        if (index !== activeIndex) update(index);
      });

      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        update(getNearestIndex(viewport, slides));
      }, 160);
    },
    { passive: true },
  );

  previous?.addEventListener("click", () => goTo(activeIndex - 1));
  next?.addEventListener("click", () => goTo(activeIndex + 1));

  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);

    resizeFrame = requestAnimationFrame(() => {
      const slide = slides[activeIndex];
      if (slide) {
        viewport.scrollTo({ left: slide.offsetLeft - viewport.offsetLeft, behavior: "auto" });
      }
    });
  });

  update(activeIndex);
}

export function initImageSliders(): void {
  document.querySelectorAll<HTMLElement>("[data-slider]").forEach(initSlider);
}
