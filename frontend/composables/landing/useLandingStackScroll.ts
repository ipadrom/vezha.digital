import type { Ref } from "vue";

export function useLandingStackScroll(
  rootRef: Ref<HTMLElement | null>,
  itemCount: Ref<number>,
  onIndexChange: (index: number, progress: number) => void,
) {
  const activeIndex = ref(0);
  const progress = ref(0);
  let raf = 0;
  let mobileAutoplayTimer: ReturnType<typeof window.setInterval> | null = null;
  let manualMobileSelection = false;

  function setMobileIndex(index: number) {
    const count = Math.max(1, itemCount.value);
    const nextIndex = ((index % count) + count) % count;
    const nextProgress = count > 1 ? nextIndex / (count - 1) : 0;

    activeIndex.value = nextIndex;
    progress.value = nextProgress;
    onIndexChange(nextIndex, nextProgress);
  }

  function stopMobileAutoplay() {
    if (!mobileAutoplayTimer) return;
    window.clearInterval(mobileAutoplayTimer);
    mobileAutoplayTimer = null;
  }

  function startMobileAutoplay() {
    if (
      mobileAutoplayTimer
      || manualMobileSelection
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    mobileAutoplayTimer = window.setInterval(() => {
      const section = rootRef.value;
      if (
        !section
        || manualMobileSelection
        || document.hidden
        || window.innerWidth > 900
      ) return;

      const rect = section.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight * 0.82
        && rect.bottom > window.innerHeight * 0.18;
      if (!isVisible) return;

      setMobileIndex(activeIndex.value + 1);
    }, 3200);
  }

  function updateFromScroll() {
    const section = rootRef.value;
    if (!section) return;
    if (window.innerWidth <= 900) return;

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
    if (window.innerWidth <= 900) {
      manualMobileSelection = true;
      stopMobileAutoplay();
      setMobileIndex(nextIndex);
      return;
    }

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
    startMobileAutoplay();
    nextTick(scheduleUpdate);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", scheduleUpdate);
    window.removeEventListener("resize", scheduleUpdate);
    if (raf) cancelAnimationFrame(raf);
    stopMobileAutoplay();
  });

  watch(itemCount, () => nextTick(scheduleUpdate));

  return { activeIndex, progress, scrollToIndex, scheduleUpdate };
}
