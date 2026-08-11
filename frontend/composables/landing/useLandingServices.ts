import type { Ref } from "vue";
import {
  getServiceHighlightLayoutBounds,
  getServiceHighlightTargetBounds,
  type ServiceHighlightBounds,
} from "~/utils/landingServicesHighlight";

export function useLandingServices(
  rootRef: Ref<HTMLElement | null>,
  serviceCount: Ref<number>,
  onActiveChange: (index: number) => void,
) {
  const activeIndex = ref(0);
  let raf = 0;
  let highlightAnimation: Animation | null = null;
  let highlightTargetIndex = -1;
  let layoutResizeObserver: ResizeObserver | null = null;
  let pendingActiveNotification = false;

  function getRelativeHighlightBounds(element: HTMLElement, navList: HTMLElement): ServiceHighlightBounds {
    const elementRect = element.getBoundingClientRect();
    const navRect = navList.getBoundingClientRect();

    return {
      x: elementRect.left - navRect.left,
      y: elementRect.top - navRect.top,
      width: elementRect.width,
      height: elementRect.height,
    };
  }

  function placeHighlight(
    highlight: HTMLElement,
    bounds: ServiceHighlightBounds,
  ) {
    highlight.style.top = "0px";
    highlight.style.left = "0px";
    highlight.style.width = `${bounds.width}px`;
    highlight.style.height = `${bounds.height}px`;
    highlight.style.transform = `translate3d(${bounds.x}px, ${bounds.y}px, 0)`;
    highlight.style.transformOrigin = "top left";
    highlight.dataset.ready = "true";
  }

  function syncServiceHighlight(root: HTMLElement, navs: NodeListOf<HTMLElement>, active: number) {
    const navList = root.querySelector<HTMLElement>("[data-serv-list]");
    const highlight = root.querySelector<HTMLElement>("[data-serv-nav-highlight]");
    const target = navs[active];
    if (!navList || !highlight || !target) return;

    const targetElement = target;
    const horizontalPadding = 0;
    const verticalPadding = 0;
    const targetBounds = getServiceHighlightTargetBounds(
      getServiceHighlightLayoutBounds(targetElement),
      horizontalPadding,
      verticalPadding,
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isReady = highlight.dataset.ready === "true";
    const activeChanged = highlightTargetIndex !== active;

    if (isReady && !activeChanged) return;

    if (!isReady || reducedMotion) {
      highlightAnimation?.cancel();
      highlightAnimation = null;
      placeHighlight(highlight, targetBounds);
      highlightTargetIndex = active;
      return;
    }

    const currentBounds = getRelativeHighlightBounds(highlight, navList);
    const scaleX = currentBounds.width / Math.max(1, targetBounds.width);
    const scaleY = currentBounds.height / Math.max(1, targetBounds.height);

    highlightAnimation?.cancel();
    placeHighlight(highlight, targetBounds);
    const animation = highlight.animate(
      [
        {
          transform: `translate3d(${currentBounds.x}px, ${currentBounds.y}px, 0) scale(${scaleX}, ${scaleY})`,
        },
        {
          transform: `translate3d(${targetBounds.x}px, ${targetBounds.y}px, 0) scale(1, 1)`,
        },
      ],
      {
        duration: 250,
        easing: "cubic-bezier(0.77, 0, 0.175, 1)",
      },
    );
    highlightAnimation = animation;
    highlightTargetIndex = active;
    animation.addEventListener("finish", () => {
      if (highlightAnimation === animation) highlightAnimation = null;
    }, { once: true });
  }

  function render() {
    const root = rootRef.value;
    if (!root) return;

    const panels = root.querySelectorAll<HTMLElement>("[data-serv-panel]");
    const navs = root.querySelectorAll<HTMLElement>("[data-serv-nav]");
    const screens = root.querySelectorAll<HTMLElement>("[data-screen]");
    const bar = root.querySelector<HTMLElement>("[data-serv-bar]");
    const rect = root.getBoundingClientRect();
    const intro = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight * 0.62)));
    const active = Math.max(0, Math.min(activeIndex.value, Math.max(0, panels.length - 1)));
    const progress = panels.length > 1 ? active / (panels.length - 1) : 1;

    panels.forEach((panel, index) => {
      const isActive = index === active;
      panel.style.opacity = isActive ? "1" : "0";
      panel.style.transform = "none";
      panel.style.pointerEvents = isActive ? "auto" : "none";
      panel.style.zIndex = isActive ? "2" : "1";
      panel.setAttribute("aria-hidden", isActive ? "false" : "true");
      panel.toggleAttribute("inert", !isActive);
    });

    const caption = root.querySelector<HTMLElement>("[data-serv-caption]");
    const sharedCta = root.querySelector<HTMLElement>("[data-serv-shared-cta]");
    const activeIncluded = panels[active]?.querySelector<HTMLElement>("[data-serv-included]");
    const activeMetawrap = activeIncluded?.querySelector<HTMLElement>("[data-serv-metawrap]");

    if (caption && sharedCta && activeIncluded && activeMetawrap) {
      caption.style.height = "";
      caption.style.minHeight = "";

      const captionRect = caption.getBoundingClientRect();
      const metawrapRect = activeMetawrap.getBoundingClientRect();
      const metawrapTransform = getComputedStyle(activeMetawrap).transform;
      const animatedMetawrapY = metawrapTransform === "none"
        ? 0
        : new DOMMatrixReadOnly(metawrapTransform).m42;
      const metawrapBottom = metawrapRect.bottom - captionRect.top - animatedMetawrapY;
      const dividerGap = Number.parseFloat(getComputedStyle(activeIncluded).paddingTop) || 12;
      const contentCtaTop = Math.ceil(metawrapBottom + dividerGap * 2 + 1);
      const isWideDesktop = window.matchMedia("(min-width: 1200px)").matches;
      const desktopCardBottomSpace = 18;
      const ctaTop = isWideDesktop
        ? Math.max(0, Math.floor(caption.clientHeight - sharedCta.offsetHeight - desktopCardBottomSpace))
        : contentCtaTop;

      // Keep the divider on the caption rather than inside the lifting CTA.
      // Both layers inherit the same geometry, but only the CTA responds to hover.
      sharedCta.style.removeProperty("--service-cta-offset");
      sharedCta.style.removeProperty("--service-divider-gap");
      caption.style.setProperty("--service-cta-offset", `${ctaTop}px`);
      caption.style.setProperty("--service-divider-gap", `${dividerGap}px`);
      sharedCta.style.top = "0";
      sharedCta.style.bottom = "auto";

      if (isWideDesktop) {
        const contentHeight = ctaTop + sharedCta.offsetHeight;
        const centerOffset = Math.round((caption.clientHeight - contentHeight) / 2 - 20);
        caption.style.transform = `translateY(${centerOffset}px)`;
      } else {
        const cardBottomSpace = window.matchMedia("(max-width: 900px)").matches ? 20 : 10;
        const contentHeight = Math.ceil(ctaTop + sharedCta.offsetHeight + cardBottomSpace);
        caption.style.height = `${contentHeight}px`;
        caption.style.minHeight = `${contentHeight}px`;
        caption.style.transform = "";
      }

      if (sharedCta.dataset.positioned !== "true" || caption.dataset.positioned !== "true") {
        requestAnimationFrame(() => {
          sharedCta.dataset.positioned = "true";
          caption.dataset.positioned = "true";
        });
      }
    } else if (caption && sharedCta) {
      sharedCta.style.removeProperty("--service-cta-offset");
      sharedCta.style.removeProperty("--service-divider-gap");
      caption.style.removeProperty("--service-cta-offset");
      caption.style.removeProperty("--service-divider-gap");
      sharedCta.style.top = "";
      sharedCta.style.bottom = "";
      delete sharedCta.dataset.positioned;
      caption.style.transform = "";
      delete caption.dataset.positioned;
    }

    const reduceScreenMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    screens.forEach((screen) => {
      const index = Number(screen.dataset.si);
      const isActive = index === active;
      const hadState = screen.dataset.active !== undefined;
      const wasActive = screen.dataset.active === "true";

      screen.dataset.active = isActive ? "true" : "false";
      screen.style.zIndex = isActive ? "3" : "2";
      screen.style.pointerEvents = isActive ? "auto" : "none";
      screen.style.transition = "none";
      screen.setAttribute("aria-hidden", isActive ? "false" : "true");

      if (!hadState || reduceScreenMotion) {
        screen.getAnimations().forEach((animation) => animation.cancel());
        screen.style.transform = isActive
          ? "translate3d(0, 0, 0) scale(1)"
          : "translate3d(-26%, 5%, 0) scale(0.94)";
        screen.style.opacity = isActive ? "1" : "0";
        return;
      }

      if (isActive === wasActive) return;

      screen.getAnimations().forEach((animation) => animation.cancel());

      if (isActive) {
        screen.style.transform = "translate3d(0, 0, 0) scale(1)";
        screen.style.opacity = "1";
        screen.animate(
          [
            { opacity: 0, transform: "translate3d(4%, 2%, 0) scale(0.985)" },
            { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
          ],
          {
            duration: 380,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          },
        );
        return;
      }

      // The outgoing view bends left and recedes under the new active screen.
      // This keeps the transition away from the readable centre of the device.
      screen.style.transform = "translate3d(-26%, 5%, 0) scale(0.94)";
      screen.style.opacity = "0";
      screen.animate(
        [
          { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)", offset: 0 },
          { opacity: 0.78, transform: "translate3d(-9%, -7%, 0) scale(0.982)", offset: 0.38 },
          { opacity: 0, transform: "translate3d(-26%, 5%, 0) scale(0.94)", offset: 1 },
        ],
        {
          duration: 540,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );
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
      nav.setAttribute("aria-selected", index === active ? "true" : "false");
    });
    syncServiceHighlight(root, navs, active);

    if (bar) bar.style.width = `${(progress * 100).toFixed(2)}%`;
    if (pendingActiveNotification) {
      pendingActiveNotification = false;
      onActiveChange(active);
    }
  }

  function scheduleRender() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      render();
    });
  }

  function select(index: number) {
    const count = Math.max(1, serviceCount.value);
    activeIndex.value = ((index % count) + count) % count;
    pendingActiveNotification = true;
    scheduleRender();
  }

  function handleResize() {
    const highlight = rootRef.value?.querySelector<HTMLElement>("[data-serv-nav-highlight]");
    highlightAnimation?.cancel();
    highlightAnimation = null;
    highlightTargetIndex = -1;
    if (highlight) delete highlight.dataset.ready;
    scheduleRender();
  }

  onMounted(() => {
    window.addEventListener("scroll", scheduleRender, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    if (rootRef.value && "ResizeObserver" in window) {
      layoutResizeObserver = new ResizeObserver(scheduleRender);
      layoutResizeObserver.observe(rootRef.value);
    }
    void document.fonts?.ready.then(scheduleRender);
    nextTick(scheduleRender);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", scheduleRender);
    window.removeEventListener("resize", handleResize);
    if (raf) cancelAnimationFrame(raf);
    highlightAnimation?.cancel();
    layoutResizeObserver?.disconnect();
  });

  watch(serviceCount, () => {
    if (activeIndex.value >= serviceCount.value) select(0);
    nextTick(scheduleRender);
  });

  return { activeIndex, select, scheduleRender };
}
