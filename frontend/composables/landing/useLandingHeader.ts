import { computed, onBeforeUnmount, onMounted, ref, type Ref } from "vue";

type UseLandingHeaderOptions = {
  rootRef: Ref<HTMLElement | null>;
  showPreloader: Ref<boolean>;
};

export function useLandingHeader(options: UseLandingHeaderOptions) {
  const { rootRef, showPreloader } = options;
  const isHeaderVisible = ref(false);
  const isHeaderBlockedByStack = ref(false);
  const isHeaderShown = computed(() => !showPreloader.value && (isHeaderVisible.value && !isHeaderBlockedByStack.value));
  let isHeaderZoneHovered = false;
  let isHeaderHovered = false;
  let isHeaderFocused = false;
  let headerIdleTimer: number | null = null;
  let headerLastScrollY = 0;
  let headerWasDesktop: boolean | null = null;

  function clearHeaderIdleTimer() {
    if (!headerIdleTimer) return;
    window.clearTimeout(headerIdleTimer);
    headerIdleTimer = null;
  }

  function isDesktopHeaderViewport() {
    return window.matchMedia("(min-width: 901px)").matches;
  }

  function updateHeaderStackCollision() {
    if (!isDesktopHeaderViewport()) {
      isHeaderBlockedByStack.value = false;
      return false;
    }
    const stack = rootRef.value?.querySelector<HTMLElement>("[data-stack-section]");
    const header = rootRef.value?.querySelector<HTMLElement>(".vz-nav");
    if (!stack || !header) {
      isHeaderBlockedByStack.value = false;
      return false;
    }

    // Use the resting position: the hidden header is translated above the viewport.
    const headerTop = header.offsetTop;
    const headerBottom = headerTop + header.offsetHeight;
    const rect = stack.getBoundingClientRect();
    isHeaderBlockedByStack.value = rect.top < headerBottom && rect.bottom > headerTop;
    return isHeaderBlockedByStack.value;
  }

  function revealHeader() {
    if (updateHeaderStackCollision()) {
      clearHeaderIdleTimer();
      isHeaderVisible.value = false;
      return;
    }

    clearHeaderIdleTimer();
    isHeaderVisible.value = true;
  }

  function queueHeaderHide(delay = 820) {
    clearHeaderIdleTimer();
    if (Math.max(0, window.scrollY) <= 12) {
      isHeaderVisible.value = true;
      return;
    }
    headerIdleTimer = window.setTimeout(() => {
      headerIdleTimer = null;
      if (isHeaderZoneHovered || isHeaderHovered || isHeaderFocused) return;
      isHeaderVisible.value = false;
    }, delay);
  }

  function handleHeaderScroll() {
    const nextScrollY = Math.max(0, window.scrollY);

    if (showPreloader.value) {
      headerLastScrollY = nextScrollY;
      return;
    }

    // Like the case pages: at the very top the header stays put on every viewport.
    if (nextScrollY <= 12) {
      headerLastScrollY = nextScrollY;
      revealHeader();
      return;
    }

    if (isDesktopHeaderViewport()) {
      headerLastScrollY = nextScrollY;
      revealHeader();
      queueHeaderHide();
      return;
    }

    headerLastScrollY = nextScrollY;
    revealHeader();
    queueHeaderHide();
  }

  function handleHeaderZonePointerEnter(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    isHeaderZoneHovered = true;
    revealHeader();
  }

  function handleHeaderZonePointerLeave(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    isHeaderZoneHovered = false;
    queueHeaderHide(220);
  }

  function handleHeaderPointerEnter(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    isHeaderHovered = true;
    revealHeader();
  }

  function handleHeaderPointerLeave(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    isHeaderHovered = false;
    queueHeaderHide(220);
  }

  function handleHeaderFocusIn() {
    isHeaderFocused = true;
    revealHeader();
  }

  function handleHeaderFocusOut(event: FocusEvent) {
    const nav = event.currentTarget;
    const next = event.relatedTarget;
    if (nav instanceof HTMLElement && next instanceof Node && nav.contains(next)) return;
    isHeaderFocused = false;
    queueHeaderHide(220);
  }

  function handleHeaderResize() {
    updateHeaderStackCollision();
    const isDesktop = isDesktopHeaderViewport();
    headerLastScrollY = Math.max(0, window.scrollY);
    if (headerWasDesktop === isDesktop) return;

    headerWasDesktop = isDesktop;
    clearHeaderIdleTimer();
    isHeaderVisible.value = headerLastScrollY <= 12 || !isDesktop;
  }

  onMounted(() => {
    handleHeaderResize();
    window.addEventListener("scroll", handleHeaderScroll, { passive: true });
    window.addEventListener("resize", handleHeaderResize, { passive: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", handleHeaderScroll);
    window.removeEventListener("resize", handleHeaderResize);
    clearHeaderIdleTimer();
  });

  return {
    isHeaderShown,
    handleHeaderZonePointerEnter,
    handleHeaderZonePointerLeave,
    handleHeaderPointerEnter,
    handleHeaderPointerLeave,
    handleHeaderFocusIn,
    handleHeaderFocusOut,
  };
}
