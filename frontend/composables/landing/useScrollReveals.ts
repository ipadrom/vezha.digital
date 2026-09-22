import type { Ref } from "vue";

const enableMotionLayer = true;

type UseScrollRevealsOptions = {
  rootRef: Ref<HTMLElement | null>;
  showPreloader: Ref<boolean>;
};

export function useScrollReveals(options: UseScrollRevealsOptions) {
  const { rootRef, showPreloader } = options;

  function restoreInitialHashPosition() {
    const targetId = window.location.hash.slice(1);
    if (!targetId) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = document.getElementById(targetId);
        if (!target) return;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
      });
    });
  }

  function setupReveals() {
    const root = rootRef.value;
    if (!root) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    if (enableMotionLayer) root.classList.add("vz-motion-ready");

    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
      if (element.dataset.revealed) return;
      element.style.transform = "translateY(110%)";
      element.style.opacity = "0";
      element.style.filter = "";
      element.style.willChange = "transform, opacity";
    });

    root.querySelectorAll<HTMLElement>("[data-clip-reveal]").forEach((element) => {
      if (element.dataset.clipped) return;
      element.style.clipPath = "inset(0 100% 0 0)";
    });
  }

  function scanReveals() {
    const root = rootRef.value;
    if (!root) return;
    const vh = window.innerHeight;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
      if (showPreloader.value && element.closest("#hero")) return;
      const wrap = element.parentElement || element;
      const rect = wrap.getBoundingClientRect();
      const inView = rect.top < vh * 0.92 && rect.bottom > -40;

      if (reduceMotion || inView) {
        if (!element.dataset.revealed) {
          element.dataset.revealed = "1";
          const order = Math.max(0, Number(element.dataset.revealOrder) || 0);
          const delay = Math.min(order * 70, 210);
          element.style.transition = `transform 720ms cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms, opacity 600ms cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms`;
        }
        element.style.transform = "translateY(0)";
        element.style.opacity = "1";
        element.style.filter = "";
      }
    });

    root.querySelectorAll<HTMLElement>("[data-clip-reveal]").forEach((element) => {
      const rect = element.getBoundingClientRect();
      const inView = rect.top < vh * 0.86 && rect.bottom > -40;
      if (reduceMotion || inView) {
        if (!element.dataset.clipped) {
          element.dataset.clipped = "1";
          element.style.transition = "clip-path 800ms cubic-bezier(0.77, 0, 0.175, 1)";
        }
        element.style.clipPath = "inset(0 0% 0 0)";
      }
    });
  }

  function scanSectionEntrances() {
    const root = rootRef.value;
    if (!root) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = root.querySelectorAll<HTMLElement>("#hero, #about, [data-stack-section], [data-services-pin], #clients, #cases, #contacts, .vz-footer");

    sections.forEach((section) => {
      if (section.classList.contains("is-motion-visible")) return;
      if (!enableMotionLayer || reduceMotion) {
        section.classList.add("is-motion-visible");
        return;
      }

      if (showPreloader.value && section.id === "hero") return;

      const rect = section.getBoundingClientRect();
      const triggerTop = window.innerHeight * 0.84;
      const triggerBottom = window.innerHeight * 0.08;
      if (rect.top < triggerTop && rect.bottom > triggerBottom) {
        section.classList.add("is-motion-visible");
      }
    });
  }

  function updateScrollEffects() {
    scanSectionEntrances();
    scanReveals();
  }

  return {
    restoreInitialHashPosition,
    setupReveals,
    updateScrollEffects,
  };
}
