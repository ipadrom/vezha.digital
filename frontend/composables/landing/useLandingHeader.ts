import { computed, onBeforeUnmount, onMounted, ref, type Ref } from "vue";

type UseLandingHeaderOptions = {
  rootRef: Ref<HTMLElement | null>;
  showPreloader: Ref<boolean>;
};

const HEADER_SAFE_MARGIN = 36;

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

  // Restart the idle countdown instead of dropping the header the moment a
  // transient overlay, such as the mobile menu, stops holding it open.
  function holdHeader() {
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

  // The hover zone no longer takes pointer events, so controls under it stay clickable;
  // the header is summoned from document moves instead, and never while a control is hovered.
  function handleDocumentPointerMove(event: PointerEvent) {
    if (event.pointerType === "touch" || !isDesktopHeaderViewport()) return;
    const zone = rootRef.value?.querySelector<HTMLElement>(".vz-nav-hover-zone");
    const rect = zone?.getBoundingClientRect();
    const inZone = Boolean(rect) && rect!.width > 0
      && event.clientY <= rect!.bottom && event.clientX >= rect!.left && event.clientX <= rect!.right;
    const overControl = inZone && event.target instanceof Element
      && Boolean(event.target.closest("a, button, [role='button'], input, select, textarea, label, summary"));
    // Controls marked data-header-safe get a margin around them, so approaching them does not summon the header either.
    const nearSafeControl = inZone && !overControl && Array.from(
      rootRef.value?.querySelectorAll<HTMLElement>("[data-header-safe]") ?? [],
    ).some((element) => {
      const safe = element.getBoundingClientRect();
      return safe.width > 0 && event.clientX >= safe.left - HEADER_SAFE_MARGIN && event.clientX <= safe.right + HEADER_SAFE_MARGIN
        && event.clientY >= safe.top - HEADER_SAFE_MARGIN && event.clientY <= safe.bottom + HEADER_SAFE_MARGIN;
    });
    const hovered = inZone && !overControl && !nearSafeControl;
    if (hovered === isHeaderZoneHovered) return;
    isHeaderZoneHovered = hovered;
    if (hovered) revealHeader();
    else queueHeaderHide(220);
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
    isHeaderVisible.value = headerLastScrollY <= 12;
  }

  onMounted(() => {
    handleHeaderResize();
    window.addEventListener("scroll", handleHeaderScroll, { passive: true });
    window.addEventListener("resize", handleHeaderResize, { passive: true });
    document.addEventListener("pointermove", handleDocumentPointerMove, { passive: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", handleHeaderScroll);
    window.removeEventListener("resize", handleHeaderResize);
    document.removeEventListener("pointermove", handleDocumentPointerMove);
    clearHeaderIdleTimer();
  });

  return {
    isHeaderShown,
    holdHeader,
    handleHeaderZonePointerEnter,
    handleHeaderZonePointerLeave,
    handleHeaderPointerEnter,
    handleHeaderPointerLeave,
    handleHeaderFocusIn,
    handleHeaderFocusOut,
  };
}
