import type { Ref } from "vue";

export function useLandingStackScroll(
  rootRef: Ref<HTMLElement | null>,
  itemCount: Ref<number>,
  onIndexChange: (index: number, progress: number) => void,
) {
  const activeIndex = ref(0);
  const progress = ref(0);
  let raf = 0;

  function updateFromScroll() {
    const section = rootRef.value;
    if (!section) return;

    const total = Math.max(1, section.offsetHeight - window.innerHeight);
    const nextProgress = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / total));
    const count = Math.max(1, itemCount.value);
    const nextIndex = count > 1
      ? Math.min(count - 1, Math.floor(nextProgress * (count - 1) + 1e-6))
      : 0;

    progress.value = nextProgress;
    if (activeIndex.value !== nextIndex) activeIndex.value = nextIndex;
    onIndexChange(nextIndex, nextProgress);
  }

  function scheduleUpdate() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      updateFromScroll();
    });
  }

  function scrollToIndex(index: number) {
    const section = rootRef.value;
    const count = itemCount.value;
    if (!section || count < 1) return;

    const nextIndex = Math.max(0, Math.min(count - 1, index));
    const maxProgress = count > 1 ? nextIndex / (count - 1) : 0;
    const scrollRange = Math.max(0, section.offsetHeight - window.innerHeight);

    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    window.scrollTo({
      top: Math.ceil(sectionTop + scrollRange * maxProgress),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  onMounted(() => {
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    nextTick(scheduleUpdate);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", scheduleUpdate);
    window.removeEventListener("resize", scheduleUpdate);
    if (raf) cancelAnimationFrame(raf);
  });

  watch(itemCount, () => nextTick(scheduleUpdate));

  return { activeIndex, progress, scrollToIndex, scheduleUpdate };
}
