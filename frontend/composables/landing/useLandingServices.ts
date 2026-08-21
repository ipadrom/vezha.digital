import type { Ref } from "vue";
import {
  getServiceHighlightLayoutBounds,
  getServiceHighlightTargetBounds,
  type ServiceHighlightBounds,
} from "~/utils/landingServicesHighlight";
import { getLandingPresentationScale } from "~/utils/threeRenderQuality";

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
  let layoutSettleTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingActiveNotification = false;
  let textMeasureCanvas: HTMLCanvasElement | null = null;
  const captionWidthCache = new WeakMap<HTMLElement, { signature: string; width: number }>();

  function readCssPixels(value: string) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function measureText(element: HTMLElement | null, text = element?.textContent?.trim() || "") {
    if (!element || !text) return 0;
    textMeasureCanvas ||= document.createElement("canvas");
    const context = textMeasureCanvas.getContext("2d");
    if (!context) return element.scrollWidth;

    const style = getComputedStyle(element);
    const compactText = text.trim().replace(/\s+/g, " ");
    const transformedText = style.textTransform === "uppercase"
      ? compactText.toLocaleUpperCase()
      : style.textTransform === "lowercase"
        ? compactText.toLocaleLowerCase()
        : compactText;
    context.font = style.font;
    return context.measureText(transformedText).width
      + Math.max(0, transformedText.length - 1) * readCssPixels(style.letterSpacing);
  }

  function measureBalancedTwoLineText(element: HTMLElement | null) {
    if (!element) return 0;
    const words = (element.textContent ?? "").trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) return measureText(element);

    let bestWidth = measureText(element);
    for (let split = 1; split < words.length; split += 1) {
      const firstLineWidth = measureText(element, words.slice(0, split).join(" "));
      const secondLineWidth = measureText(element, words.slice(split).join(" "));
      bestWidth = Math.min(bestWidth, Math.max(firstLineWidth, secondLineWidth));
    }
    return bestWidth;
  }

  function measureTextBox(element: HTMLElement) {
    const style = getComputedStyle(element);
    return measureText(element)
      + readCssPixels(style.paddingLeft)
      + readCssPixels(style.paddingRight)
      + readCssPixels(style.borderLeftWidth)
      + readCssPixels(style.borderRightWidth);
  }

  function getDesktopCaptionWidth(
    root: HTMLElement,
    caption: HTMLElement,
    panel: HTMLElement,
    metawrap: HTMLElement,
    sharedCta: HTMLElement,
  ) {
    if (!window.matchMedia("(min-width: 1200px)").matches) return null;

    const captionRect = caption.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const presentationScale = getLandingPresentationScale(root);
    const panelStyle = getComputedStyle(panel);
    const horizontalPadding = readCssPixels(panelStyle.paddingLeft) + readCssPixels(panelStyle.paddingRight);
    const titleWrap = panel.querySelector<HTMLElement>(".vz-service-panel__title");
    const title = panel.querySelector<HTMLElement>(".vz-service-panel__title h3");
    const titleNumber = panel.querySelector<HTMLElement>(".vz-service-panel__title span");
    const description = panel.querySelector<HTMLElement>(":scope > p");
    const metricCells = Array.from(panel.querySelectorAll<HTMLElement>(".vz-service-commercial__metrics > div"));
    const chipRows = Array.from(metawrap.querySelectorAll<HTMLElement>(".vz-service-commercial__chips-row"));
    const firstChip = metawrap.querySelector<HTMLElement>("span");
    const ctaSmall = sharedCta.querySelector<HTMLElement>("small");
    const ctaStrong = sharedCta.querySelector<HTMLElement>("strong");
    const ctaIcon = sharedCta.querySelector<SVGElement>("svg");
    const ctaStyle = getComputedStyle(sharedCta);
    const signature = [
      panel.textContent,
      title ? getComputedStyle(title).font : "",
      description ? getComputedStyle(description).font : "",
      firstChip ? getComputedStyle(firstChip).font : "",
      ctaSmall ? getComputedStyle(ctaSmall).font : "",
      panelStyle.paddingLeft,
      panelStyle.paddingRight,
      ctaStyle.left,
      ctaStyle.right,
      ctaStyle.paddingLeft,
      ctaStyle.paddingRight,
    ].join("|");
    const cachedWidth = captionWidthCache.get(panel);

    let naturalWidth = cachedWidth?.signature === signature ? cachedWidth.width : 0;
    if (!naturalWidth) {
      const titleStyle = titleWrap ? getComputedStyle(titleWrap) : null;
      const titleWidth = title && titleNumber
        ? measureTextBox(titleNumber)
          + readCssPixels(titleStyle?.columnGap ?? "0")
          + measureBalancedTwoLineText(title)
        : 0;
      // Body copy may gain a third line and grow the already-fluid height.
      // Titles, metrics and chips define the horizontal comfort of the card.
      const descriptionWidth = Math.min(248, measureBalancedTwoLineText(description));
      const widestMetricCell = metricCells.reduce((widest, cell) => {
        const cellStyle = getComputedStyle(cell);
        const label = cell.querySelector<HTMLElement>("small");
        const value = cell.querySelector<HTMLElement>("strong");
        const contentWidth = Math.max(measureText(label), measureText(value));
        return Math.max(
          widest,
          contentWidth + readCssPixels(cellStyle.paddingLeft) + readCssPixels(cellStyle.paddingRight),
        );
      }, 0);
      const metricsWidth = widestMetricCell * Math.max(1, metricCells.length);
      const chipWidth = chipRows.reduce((largest, row) => {
        const chips = Array.from(row.querySelectorAll<HTMLElement>("span"));
        const gap = readCssPixels(getComputedStyle(row).columnGap || getComputedStyle(row).gap) || 5;
        const rowWidth = chips.reduce((sum, chip) => sum + measureTextBox(chip), 0)
          + Math.max(0, chips.length - 1) * gap;
        return Math.max(largest, rowWidth);
      }, 0);
      const ctaWidth = Math.max(measureBalancedTwoLineText(ctaSmall), measureText(ctaStrong))
        + (ctaIcon?.getBoundingClientRect().width ?? 0) / presentationScale
        + readCssPixels(ctaStyle.columnGap)
        + readCssPixels(ctaStyle.paddingLeft)
        + readCssPixels(ctaStyle.paddingRight);
      const ctaOuterInsets = readCssPixels(ctaStyle.left) + readCssPixels(ctaStyle.right);
      const preferredContentWidth = Math.max(titleWidth, descriptionWidth, metricsWidth, chipWidth);
      naturalWidth = Math.ceil(Math.max(
        preferredContentWidth + horizontalPadding + 12,
        ctaWidth + ctaOuterInsets + 12,
      ));
      captionWidthCache.set(panel, { signature, width: naturalWidth });
    }

    const viewportWidth = window.innerWidth / presentationScale;
    const safeRight = Math.min(viewportWidth - 40, rootRect.right / presentationScale + 60);
    const availableWidth = Math.max(0, safeRight - captionRect.left / presentationScale);

    return Math.round(Math.min(availableWidth, 420, Math.max(292, naturalWidth)));
  }

  function getRelativeHighlightBounds(element: HTMLElement, navList: HTMLElement): ServiceHighlightBounds {
    const elementRect = element.getBoundingClientRect();
    const navRect = navList.getBoundingClientRect();
    const presentationScale = getLandingPresentationScale(navList);

    return {
      x: (elementRect.left - navRect.left) / presentationScale,
      y: (elementRect.top - navRect.top) / presentationScale,
      width: elementRect.width / presentationScale,
      height: elementRect.height / presentationScale,
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
      const activePanel = panels[active];
      if (activePanel) {
        const targetWidth = getDesktopCaptionWidth(root, caption, activePanel, activeMetawrap, sharedCta);
        if (targetWidth !== null) {
          const targetCaptionWidth = `${targetWidth}px`;
          if (caption.style.width !== targetCaptionWidth) caption.style.width = targetCaptionWidth;
        } else {
          caption.style.removeProperty("width");
        }
      }

      const captionRect = caption.getBoundingClientRect();
      const metawrapRect = activeMetawrap.getBoundingClientRect();
      const presentationScale = getLandingPresentationScale(root);
      const metawrapTransform = getComputedStyle(activeMetawrap).transform;
      const animatedMetawrapY = metawrapTransform === "none"
        ? 0
        : new DOMMatrixReadOnly(metawrapTransform).m42;
      const metawrapBottom = (
        metawrapRect.bottom - captionRect.top
      ) / presentationScale - animatedMetawrapY;
      const dividerGap = Number.parseFloat(getComputedStyle(activeIncluded).paddingTop) || 12;
      const contentCtaTop = Math.ceil(metawrapBottom + dividerGap * 2 + 1);
      const isWideDesktop = window.matchMedia("(min-width: 1200px)").matches;
      const cardBottomSpace = isWideDesktop
        ? 24
        : window.matchMedia("(max-width: 900px)").matches ? 20 : 10;
      const ctaTop = contentCtaTop;
      const requiredCaptionHeight = Math.ceil(
        ctaTop + sharedCta.offsetHeight + cardBottomSpace,
      );
      const targetCaptionHeight = `${requiredCaptionHeight}px`;

      // Keep the divider on the caption rather than inside the lifting CTA.
      // Both layers inherit the same geometry, but only the CTA responds to hover.
      sharedCta.style.removeProperty("--service-cta-offset");
      sharedCta.style.removeProperty("--service-divider-gap");
      caption.style.setProperty("--service-cta-offset", `${ctaTop}px`);
      caption.style.setProperty("--service-divider-gap", `${dividerGap}px`);
      sharedCta.style.top = "0";
      sharedCta.style.bottom = "auto";

      if (caption.style.height !== targetCaptionHeight) {
        caption.style.height = targetCaptionHeight;
        caption.style.minHeight = targetCaptionHeight;
      }
      // The desktop card shares the fixed grid center with the seven-row menu.
      // Its midpoint therefore stays level with the fourth row (Internet shops),
      // while height changes expand evenly above and below that anchor.
      caption.style.transform = "";

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
      caption.style.removeProperty("width");
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

  function scheduleSettledRender() {
    if (layoutSettleTimer) clearTimeout(layoutSettleTimer);
    layoutSettleTimer = setTimeout(() => {
      layoutSettleTimer = null;
      scheduleRender();
    }, 460);
  }

  function select(index: number) {
    const count = Math.max(1, serviceCount.value);
    activeIndex.value = ((index % count) + count) % count;
    pendingActiveNotification = true;
    scheduleRender();
    nextTick(() => {
      scheduleRender();
      scheduleSettledRender();
    });
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
      const caption = rootRef.value.querySelector<HTMLElement>("[data-serv-caption]");
      const sharedCta = rootRef.value.querySelector<HTMLElement>("[data-serv-shared-cta]");
      if (caption) layoutResizeObserver.observe(caption);
      if (sharedCta) layoutResizeObserver.observe(sharedCta);
    }
    void document.fonts?.ready.then(scheduleRender);
    nextTick(scheduleRender);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("scroll", scheduleRender);
    window.removeEventListener("resize", handleResize);
    if (raf) cancelAnimationFrame(raf);
    if (layoutSettleTimer) clearTimeout(layoutSettleTimer);
    highlightAnimation?.cancel();
    layoutResizeObserver?.disconnect();
  });

  watch(serviceCount, () => {
    if (activeIndex.value >= serviceCount.value) select(0);
    nextTick(scheduleRender);
  });

  return { activeIndex, select, scheduleRender };
}
