import type { Ref } from "vue";

export function useDevelopmentAnatomyReveal(
  rootRef: Ref<HTMLElement | null>,
  onReveal: () => void,
) {
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    const root = rootRef.value;
    if (!root) return;

    const reveal = () => {
      root.classList.add("is-anatomy-visible");
      onReveal();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      return;
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        reveal();
        observer?.disconnect();
        observer = null;
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    observer.observe(root);
  });

  onBeforeUnmount(() => observer?.disconnect());
}
