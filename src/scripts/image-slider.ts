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
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-slider-dot]"));
  const previous = root.querySelector<HTMLButtonElement>("[data-slider-prev]");
  const next = root.querySelector<HTMLButtonElement>("[data-slider-next]");
  const current = root.querySelector<HTMLElement>("[data-slider-current]");
  const status = root.querySelector<HTMLElement>("[data-slider-status]");

  if (!viewport || slides.length === 0) return;

  root.dataset.initialized = "true";

  const total = slides.length;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = getNearestIndex(viewport, slides);
  let lastAnnouncedIndex = -1;
  let scrollTimer: number | undefined;
  let scrollFrame = 0;
  let resizeFrame = 0;

  const formatNumber = (value: number) => String(value).padStart(2, "0");

  function update(index: number, announce: boolean): void {
    const safeIndex = Math.max(0, Math.min(index, total - 1));

    activeIndex = safeIndex;

    if (current) current.textContent = formatNumber(safeIndex + 1);

    dots.forEach((dot, dotIndex) => {
      dot.setAttribute("aria-current", dotIndex === safeIndex ? "true" : "false");
    });

    if (announce && status && safeIndex !== lastAnnouncedIndex) {
      const title = slides[safeIndex]?.dataset.slideTitle ?? "";
      status.textContent = `Diapositiva ${safeIndex + 1} de ${total}${title ? `: ${title}` : ""}.`;
      lastAnnouncedIndex = safeIndex;
    }
  }

  const goTo = (index: number): void => {
    const nextIndex = (index + total) % total;
    const slide = slides[nextIndex];

    if (!slide) return;

    update(nextIndex, true);
    viewport.scrollTo({
      left: slide.offsetLeft,
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
  };

  viewport.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(scrollFrame);

      scrollFrame = requestAnimationFrame(() => {
        const index = getNearestIndex(viewport, slides);

        if (index !== activeIndex) update(index, false);
      });

      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        update(getNearestIndex(viewport, slides), true);
      }, 160);
    },
    { passive: true },
  );

  previous?.addEventListener("click", () => goTo(activeIndex - 1));
  next?.addEventListener("click", () => goTo(activeIndex + 1));

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => goTo(index));
  });

  viewport.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        goTo(activeIndex - 1);
        break;
      case "ArrowRight":
        event.preventDefault();
        goTo(activeIndex + 1);
        break;
      case "Home":
        event.preventDefault();
        goTo(0);
        break;
      case "End":
        event.preventDefault();
        goTo(total - 1);
        break;
    }
  });

  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);

    resizeFrame = requestAnimationFrame(() => {
      const slide = slides[activeIndex];

      if (slide) {
        viewport.scrollTo({ left: slide.offsetLeft, behavior: "auto" });
      }
    });
  });

  update(activeIndex, false);
}

export function initImageSliders(): void {
  document.querySelectorAll<HTMLElement>("[data-slider]").forEach(initSlider);
}
