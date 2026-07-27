import type { Ref } from "vue";

export function useLandingServices(
  rootRef: Ref<HTMLElement | null>,
  serviceCount: Ref<number>,
  onActiveChange: (index: number) => void,
) {
  const activeIndex = ref(0);
  let raf = 0;
  let autoplayTimer: ReturnType<typeof window.setInterval> | null = null;
  let manualPauseUntil = 0;

  function render() {
    const root = rootRef.value;
    if (!root) return;

    const panels = root.querySelectorAll<HTMLElement>("[data-serv-panel]");
    const navs = root.querySelectorAll<HTMLElement>("[data-serv-nav]");
    const screens = root.querySelectorAll<HTMLElement>("[data-screen]");
    const bar = root.querySelector<HTMLElement>("[data-serv-bar]");
    const counter = root.querySelector<HTMLElement>("[data-serv-counter]");
    const rect = root.getBoundingClientRect();
    const intro = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight * 0.62)));
    const active = Math.max(0, Math.min(activeIndex.value, Math.max(0, panels.length - 1)));
    const progress = panels.length > 1 ? active / (panels.length - 1) : 1;

    panels.forEach((panel, index) => {
      const isActive = index === active;
      panel.style.opacity = isActive ? "1" : "0";
      panel.style.transform = isActive ? "translateY(0)" : `translateY(${index < active ? -36 : 36}px)`;
      panel.style.pointerEvents = isActive ? "auto" : "none";
      panel.style.zIndex = isActive ? "2" : "1";
      panel.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    screens.forEach((screen) => {
      const index = Number(screen.dataset.si);
      const isActive = index === active;
      screen.dataset.active = isActive ? "true" : "false";
      screen.style.transform = `translateY(${isActive ? "0" : index < active ? "-12px" : "12px"}) scale(${isActive ? "1" : "0.985"})`;
      screen.style.opacity = isActive ? "1" : "0";
      screen.style.zIndex = isActive ? "3" : "2";
      screen.style.pointerEvents = isActive ? "auto" : "none";
    });

    const deviceByIndex = ["phone", "phone", "laptop", "laptop", "laptop", "laptop", "phone"] as const;
    const activeDevice = deviceByIndex[active] ?? "laptop";
    root.dataset.activeServiceDevice = activeDevice;

    const easedOpen = intro * intro * (3 - 2 * intro);
    const lid = root.querySelector<HTMLElement>("[data-mac-lid]");
    const screenWrap = root.querySelector<HTMLElement>("[data-screen-wrap]");
    if (lid) {
      lid.style.transform = activeDevice === "laptop"
        ? `rotateX(${(-(1 - easedOpen) * 68).toFixed(1)}deg) translateY(${((1 - easedOpen) * 5).toFixed(1)}px)`
        : "rotateX(0deg) translateY(0)";
    }
    if (screenWrap) screenWrap.style.opacity = Math.max(0, Math.min(1, (easedOpen - 0.22) / 0.48)).toFixed(3);

    navs.forEach((nav, index) => {
      nav.dataset.active = index === active ? "true" : "false";
      nav.setAttribute("aria-pressed", index === active ? "true" : "false");
    });

    if (bar) bar.style.width = `${(progress * 100).toFixed(2)}%`;
    if (counter) counter.textContent = `${String(active + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
  }

  function scheduleRender() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      render();
    });
  }

  function select(index: number, manual = true) {
    const count = Math.max(1, serviceCount.value);
    activeIndex.value = ((index % count) + count) % count;
    if (manual) manualPauseUntil = performance.now() + 6500;
    onActiveChange(activeIndex.value);
    scheduleRender();
  }

  function startAutoplay() {
    if (autoplayTimer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    autoplayTimer = window.setInterval(() => {
      const root = rootRef.value;
      if (!root || document.hidden || performance.now() < manualPauseUntil) return;
      const rect = root.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.82 && rect.bottom > window.innerHeight * 0.18) {
        select(activeIndex.value + 1, false);
      }
    }, 3200);
  }

  onMounted(() => {
    window.addEventListener("scroll", scheduleRender, { passive: true });
    window.addEventListener("resize", scheduleRender, { passive: true });
    startAutoplay();
    nextTick(scheduleRender);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", scheduleRender);
    window.removeEventListener("resize", scheduleRender);
    if (raf) cancelAnimationFrame(raf);
    if (autoplayTimer) window.clearInterval(autoplayTimer);
  });

  watch(serviceCount, () => {
    if (activeIndex.value >= serviceCount.value) select(0, false);
    nextTick(scheduleRender);
  });

  return { activeIndex, select, scheduleRender };
}
