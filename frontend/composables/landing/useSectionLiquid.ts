import { onBeforeUnmount, onMounted, ref, type ComputedRef, type Ref } from "vue";
import { clampValue, formatStablePx, getLandingLayoutRect, getLandingLayoutViewport } from "~/utils/landingLayout";

type HeroLiquidBounds = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

type SectionLiquidTarget = {
  element: HTMLElement;
  key: string;
  rect: DOMRect;
  sectionRect: DOMRect;
};

const mobileHeroFxHorizontalTraversalMs = 24000;
const mobileHeroFxVerticalTraversalMs = 18000;

const negativeCloneSurfaceTokens = [
  ["--landing-glass", "transparent"],
  ["--landing-glass-strong", "transparent"],
  ["--landing-glass-border", "transparent"],
  ["--landing-glass-shadow", "none"],
  ["--landing-card-surface", "transparent"],
  ["--landing-card-surface-north-east", "transparent"],
  ["--landing-card-surface-cyan-left", "transparent"],
  ["--landing-card-surface-violet-top", "transparent"],
  ["--landing-card-surface-diagonal", "transparent"],
  ["--landing-card-border", "transparent"],
  ["--landing-card-shadow", "none"],
  ["--services-card-gradient", "transparent"],
  ["--services-card-border", "transparent"],
  ["--services-card-shadow", "none"],
] as const;

type UseSectionLiquidOptions = {
  rootRef: Ref<HTMLElement | null>;
  sectionLiquidRef: Ref<HTMLElement | null>;
  theme: Ref<"light" | "dark">;
  showPreloader: Ref<boolean>;
  activeServiceIndex: Ref<number>;
  activeClientSegment: Ref<number>;
  displayServices: ComputedRef<unknown[]>;
  displayStackGroups: ComputedRef<unknown[]>;
};

export function useSectionLiquid(options: UseSectionLiquidOptions) {
  const {
    rootRef,
    sectionLiquidRef,
    theme,
    showPreloader,
    activeServiceIndex,
    activeClientSegment,
    displayServices,
    displayStackGroups,
  } = options;
  const heroRef = ref<HTMLElement | null>(null);
  const heroNegativeRef = ref<HTMLElement | null>(null);
  const enableSectionLiquid = true;
  let heroFxRaf = 0;
  let heroFxLastFrame = 0;
  let sectionLiquidRaf = 0;
  let sectionLiquidResizeTimer = 0;
  let sectionLiquidLayoutRaf = 0;
  let sectionLiquidLayoutObserver: ResizeObserver | null = null;
  let sectionLiquidForceCloneOnLayoutSync = false;
  let sectionLiquidLastScrollY = 0;
  let sectionLiquidScrollDirection = 0;
  let sectionLiquidViewportWidth = 0;
  let sectionLiquidViewportScale = 1;
  let sectionLiquidStackLock: {
    x: number;
    y: number;
    radius: number;
    headingAnimating: boolean;
    stickyBounds: { top: number; left: number; width: number; height: number } | null;
  } | null = null;
  let negativeStackSyncQueued = false;

  const heroFxState = {
    active: false,
    angle: 0,
    currentX: 0.76,
    currentY: 0.43,
    hasPointer: false,
    lastPointerX: 0,
    lastPointerY: 0,
    lastX: 0.76,
    lastY: 0.43,
    mobileDirectionX: -1,
    mobileDirectionY: 1,
    speed: 0,
    targetX: 0.76,
    targetY: 0.43,
    velocityX: 0.00048,
    velocityY: 0.00018,
  };

  const sectionLiquidState = {
    initialized: false,
    lastTargetKey: "",
    targetRadius: 104,
    targetX: 0,
    targetY: 0,
  };

  // --- Section liquid: targets & geometry ---

  function setHeroHosts(hero: HTMLElement | null, negative: HTMLElement | null) {
    heroRef.value = hero;
    heroNegativeRef.value = negative;
  }

  function getSectionLiquidTargets() {
    const root = rootRef.value;
    if (!root) return [];

    const configs = [
      { key: "hero", selector: "#hero h1", section: "#hero" },
      { key: "services", selector: "#services .vz-sec-head h2", section: "#services" },
      { key: "cases", selector: "#cases .vz-cases__heading h2", section: "#cases" },
      { key: "about", selector: "#about .vz-about__head h2", section: "#about" },
      { key: "stack", selector: "#stack .vz-sec-head h2", section: "#stack" },
      { key: "clients", selector: "#clients h2", section: "#clients" },
      { key: "contacts", selector: "#contacts h2", section: "#contacts" },
      { key: "footer", selector: ".vz-footer__sign strong", section: ".vz-footer" },
    ];

    return configs.reduce<SectionLiquidTarget[]>((targets, config) => {
      const element = root.querySelector<HTMLElement>(config.selector);
      const section = root.querySelector<HTMLElement>(config.section);
      if (!element || !section) return targets;

      const rect = getLandingLayoutRect(element);
      if (rect.width < 2 || rect.height < 2) return targets;

      targets.push({
        element,
        key: config.key,
        rect,
        sectionRect: getLandingLayoutRect(section),
      });

      return targets;
    }, []);
  }

  function getSectionLiquidRadius(target: SectionLiquidTarget) {
    if (window.innerWidth <= 900) {
      const mobileWidth = window.innerWidth * 0.11;
      const mobileTargetWidth = target.rect.width * 0.16;
      const mobileTargetHeight = target.rect.height * (target.key === "footer" ? 0.38 : 0.56);
      return clampValue(
        Math.max(52, Math.min(mobileWidth, mobileTargetWidth, mobileTargetHeight)),
        48,
        70,
      );
    }

    const wideLimit = getLandingLayoutViewport(target.element).width * 0.13;
    const byWidth = target.rect.width * 0.2;
    const byHeight = target.rect.height * (target.key === "footer" ? 0.46 : 0.72);
    return clampValue(Math.max(78, Math.min(wideLimit, byWidth, byHeight)), 68, 162);
  }

  function isSectionLiquidTargetFullyVisible(target: SectionLiquidTarget) {
    const viewportHeight = getLandingLayoutViewport(target.element).height;
    const topGuard = window.innerWidth > 900 ? 76 : 62;
    const bottomGuard = 24;
    return target.rect.top >= topGuard && target.rect.bottom <= viewportHeight - bottomGuard;
  }

  function isSectionLiquidTargetVisible(target: SectionLiquidTarget) {
    const viewportHeight = getLandingLayoutViewport(target.element).height;
    const topGuard = window.innerWidth > 900 ? 76 : 62;
    const bottomGuard = 24;
    return target.rect.bottom > topGuard && target.rect.top < viewportHeight - bottomGuard;
  }

  function getSectionLiquidTargetCenter(target: SectionLiquidTarget) {
    return (target.rect.top + target.rect.bottom) / 2;
  }

  function getStackLiquidScrollLock(targets: SectionLiquidTarget[]) {
    if (window.innerWidth <= 900) return null;
    if (sectionLiquidState.lastTargetKey !== "stack") return null;

    const stackTarget = targets.find((target) => target.key === "stack");
    const sticky = stackTarget?.element.closest<HTMLElement>(".vz-sticky");
    if (!stackTarget || !sticky) return null;

    // The sticky panel can be taller than the viewport on short screens.
    const stickyHeight = getLandingLayoutRect(sticky).height;
    if (stackTarget.sectionRect.top > 0 || stackTarget.sectionRect.bottom < stickyHeight) {
      return null;
    }

    return stackTarget;
  }

  function getClosestSectionLiquidTarget(targets: SectionLiquidTarget[]) {
    const viewportCenter = getLandingLayoutViewport(targets[0]?.element).height * 0.5;
    return targets.reduce((best, target) => {
      const bestDistance = Math.abs(getSectionLiquidTargetCenter(best) - viewportCenter);
      const distance = Math.abs(getSectionLiquidTargetCenter(target) - viewportCenter);
      return distance < bestDistance ? target : best;
    });
  }

  function getInitialSectionLiquidTarget(targets: SectionLiquidTarget[]) {
    const fullyVisible = targets.filter(isSectionLiquidTargetFullyVisible);
    if (fullyVisible.length) return getClosestSectionLiquidTarget(fullyVisible);

    const viewportTargets = targets.filter((target) => (
      target.rect.bottom > 0 &&
      target.rect.top < getLandingLayoutViewport(target.element).height
    ));

    return viewportTargets.length ? getClosestSectionLiquidTarget(viewportTargets) : getClosestSectionLiquidTarget(targets);
  }

  function getSectionLiquidSwitchLine(direction: number) {
    return getLandingLayoutViewport(rootRef.value).height * (direction > 0 ? 0.43 : 0.57);
  }

  function isSectionLiquidTargetReadyToEnter(target: SectionLiquidTarget, direction: number) {
    const center = getSectionLiquidTargetCenter(target);
    const switchLine = getSectionLiquidSwitchLine(direction);
    const enterLine = getLandingLayoutViewport(target.element).height * (direction > 0 ? 0.78 : 0.22);

    return direction > 0
      ? center >= switchLine && center <= enterLine
      : center <= switchLine && center >= enterLine;
  }

  function getNextSectionLiquidTarget(targets: SectionLiquidTarget[]) {
    const direction = sectionLiquidScrollDirection;

    if (direction) {
      const visibleTargets = targets.filter(isSectionLiquidTargetVisible);
      const directionalFromViewport = visibleTargets.filter((target) => isSectionLiquidTargetReadyToEnter(target, direction));

      if (directionalFromViewport.length) {
        const nextTarget = directionalFromViewport.reduce((best, target) => (
          direction > 0
            ? getSectionLiquidTargetCenter(target) < getSectionLiquidTargetCenter(best) ? target : best
            : getSectionLiquidTargetCenter(target) > getSectionLiquidTargetCenter(best) ? target : best
        ));
        return nextTarget.key === sectionLiquidState.lastTargetKey ? null : nextTarget;
      }

      const currentTarget = targets.find((target) => target.key === sectionLiquidState.lastTargetKey);
      if (currentTarget && isSectionLiquidTargetVisible(currentTarget)) return null;
      if (visibleTargets.length) {
        const closestVisible = getClosestSectionLiquidTarget(visibleTargets);
        return closestVisible.key === sectionLiquidState.lastTargetKey ? null : closestVisible;
      }

      return null;
    }

    const currentTarget = targets.find((target) => target.key === sectionLiquidState.lastTargetKey);
    if (currentTarget && isSectionLiquidTargetVisible(currentTarget)) return null;

    const fullyVisible = targets.filter((target) => (
      target.key !== sectionLiquidState.lastTargetKey &&
      isSectionLiquidTargetFullyVisible(target)
    ));

    return fullyVisible.length ? getClosestSectionLiquidTarget(fullyVisible) : null;
  }

  function updateSectionLiquidScrollDirection() {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - sectionLiquidLastScrollY;
    if (Math.abs(delta) > 0.5) sectionLiquidScrollDirection = delta > 0 ? 1 : -1;
    sectionLiquidLastScrollY = currentScrollY;
  }

  function syncCurrentSectionLiquidTarget(targets: SectionLiquidTarget[]) {
    if (!sectionLiquidState.lastTargetKey) return;

    const currentTarget = targets.find((target) => target.key === sectionLiquidState.lastTargetKey);
    if (!currentTarget) return;

    const nextTargetX = currentTarget.rect.left + currentTarget.rect.width / 2;
    const nextTargetY = currentTarget.rect.top + currentTarget.rect.height / 2;
    sectionLiquidState.targetX = nextTargetX;
    sectionLiquidState.targetY = nextTargetY;
    sectionLiquidState.targetRadius = getSectionLiquidRadius(currentTarget);
  }

  function hideSectionLiquidTargetOverlay() {
    const targetHost = sectionLiquidRef.value?.querySelector<HTMLElement>("[data-section-liquid-target]");
    if (targetHost) targetHost.hidden = true;
  }

  function clearSectionLiquidTextAlignment() {
    sectionLiquidRef.value
      ?.querySelectorAll<HTMLElement>("[data-liquid-text-aligned], [data-liquid-clone-aligned]")
      .forEach((element) => {
        element.style.translate = "";
        element.removeAttribute("data-liquid-text-aligned");
        element.removeAttribute("data-liquid-clone-aligned");
      });
  }

  function syncSectionLiquidGeometry(forceClone = false) {
    const overlay = sectionLiquidRef.value;
    if (!overlay) return;

    sectionLiquidStackLock = null;
    if (forceClone) syncNegativeWorlds(true);

    const targets = getSectionLiquidTargets();
    if (!targets.length) {
      overlay.classList.remove("is-active", "is-stack-active");
      hideSectionLiquidTargetOverlay();
      return;
    }

    const activeTarget = targets.find(({ key }) => key === sectionLiquidState.lastTargetKey)
      ?? getInitialSectionLiquidTarget(targets);
    if (forceClone || !sectionLiquidState.initialized) commitSectionLiquidTarget(activeTarget);
    else syncCurrentSectionLiquidTarget(targets);
    updateNegativeWorldPositions();
    syncSectionLiquidTargetOverlay(getSectionLiquidTargets());
    startSectionLiquid();
  }

  function queueSectionLiquidGeometrySync(forceClone = false) {
    sectionLiquidForceCloneOnLayoutSync ||= forceClone;
    if (sectionLiquidResizeTimer || sectionLiquidLayoutRaf) return;

    sectionLiquidLayoutRaf = requestAnimationFrame(() => {
      sectionLiquidLayoutRaf = 0;
      const shouldForceClone = sectionLiquidForceCloneOnLayoutSync;
      sectionLiquidForceCloneOnLayoutSync = false;
      syncSectionLiquidGeometry(shouldForceClone);
    });
  }

  function handleSectionLiquidResize() {
    const nextViewportWidth = window.innerWidth;
    const nextViewportScale = window.visualViewport?.scale ?? 1;
    const widthChanged = Math.abs(nextViewportWidth - sectionLiquidViewportWidth) > 1;
    const scaleChanged = Math.abs(nextViewportScale - sectionLiquidViewportScale) > 0.01;
    sectionLiquidViewportWidth = nextViewportWidth;
    sectionLiquidViewportScale = nextViewportScale;

    // Mobile browser chrome changes only the viewport height while scrolling.
    // Rebuilding the overlay for that transient resize blanks the liquid mark for
    // a frame, so keep the existing layer and let its animation use fresh bounds.
    if (nextViewportWidth <= 900 && !widthChanged && !scaleChanged) {
      startSectionLiquid();
      return;
    }

    const overlay = sectionLiquidRef.value;
    if (sectionLiquidRaf) cancelAnimationFrame(sectionLiquidRaf);
    sectionLiquidRaf = 0;
    if (sectionLiquidResizeTimer) window.clearTimeout(sectionLiquidResizeTimer);
    if (sectionLiquidLayoutRaf) cancelAnimationFrame(sectionLiquidLayoutRaf);
    sectionLiquidLayoutRaf = 0;
    sectionLiquidStackLock = null;
    sectionLiquidForceCloneOnLayoutSync = true;
    overlay?.classList.remove("is-active", "is-stack-active");
    clearSectionLiquidTextAlignment();
    hideSectionLiquidTargetOverlay();

    sectionLiquidResizeTimer = window.setTimeout(() => {
      sectionLiquidResizeTimer = 0;
      queueSectionLiquidGeometrySync(true);
    }, 90);
  }

  function setupSectionLiquidLayoutObserver() {
    if (sectionLiquidLayoutObserver || !("ResizeObserver" in window)) return;
    const targets = getSectionLiquidTargets();
    if (!targets.length) return;

    sectionLiquidLayoutObserver = new ResizeObserver(() => queueSectionLiquidGeometrySync());
    targets.forEach(({ element }) => sectionLiquidLayoutObserver?.observe(element));
  }

  function syncMobileSectionLiquidTargetOverlay(targets: SectionLiquidTarget[]) {
    const overlay = sectionLiquidRef.value;
    const targetHost = overlay?.querySelector<HTMLElement>("[data-section-liquid-target]");
    const target = targets.find(({ key }) => key === sectionLiquidState.lastTargetKey);
    if (!overlay || !targetHost || !target || target.key === "hero") return;

    const sourceText = target.element.querySelector<HTMLElement>("[data-reveal]")
      ?? target.element;
    syncLiquidTextOverlay(sourceText, targetHost, target.key);
  }

  function syncLiquidTextOverlay(sourceText: HTMLElement, targetHost: HTMLElement, key: string) {
    const overlay = sectionLiquidRef.value;
    if (!overlay) return;
    const sourceRect = getLandingLayoutRect(sourceText);
    const overlayRect = getLandingLayoutRect(overlay);
    const sourceStyle = window.getComputedStyle(sourceText);
    const text = sourceText.textContent?.replace(/\s+/g, " ").trim() ?? "";
    if (!text) return;

    const styleSignature = [
      key,
      text,
      sourceRect.width.toFixed(2),
      sourceStyle.fontFamily,
      sourceStyle.fontSize,
      sourceStyle.fontStyle,
      sourceStyle.fontWeight,
      sourceStyle.lineHeight,
      sourceStyle.letterSpacing,
      sourceStyle.textAlign,
      sourceStyle.display,
      sourceStyle.gap,
      sourceStyle.textTransform,
      sourceStyle.whiteSpace,
      sourceStyle.wordBreak,
      sourceStyle.getPropertyValue("text-wrap"),
    ].join("|");

    if (targetHost.dataset.mobileLiquidSignature !== styleSignature) {
      const clonedChildren = Array.from(sourceText.childNodes, (node) => node.cloneNode(true));
      targetHost.replaceChildren(...clonedChildren);
      targetHost.style.fontFamily = sourceStyle.fontFamily;
      targetHost.style.fontSize = sourceStyle.fontSize;
      targetHost.style.fontStyle = sourceStyle.fontStyle;
      targetHost.style.fontWeight = sourceStyle.fontWeight;
      targetHost.style.lineHeight = sourceStyle.lineHeight;
      targetHost.style.letterSpacing = sourceStyle.letterSpacing;
      targetHost.style.textAlign = sourceStyle.textAlign;
      targetHost.style.display = sourceStyle.display;
      targetHost.style.gap = sourceStyle.gap;
      targetHost.style.alignItems = sourceStyle.alignItems;
      targetHost.style.justifyContent = sourceStyle.justifyContent;
      targetHost.style.flexWrap = sourceStyle.flexWrap;
      targetHost.style.textTransform = sourceStyle.textTransform;
      targetHost.style.whiteSpace = sourceStyle.whiteSpace;
      targetHost.style.wordBreak = sourceStyle.wordBreak;
      targetHost.style.overflowWrap = sourceStyle.overflowWrap;
      targetHost.style.setProperty("text-wrap", sourceStyle.getPropertyValue("text-wrap"));
      targetHost.style.setProperty("font-kerning", sourceStyle.getPropertyValue("font-kerning"));
      targetHost.style.setProperty("font-feature-settings", sourceStyle.getPropertyValue("font-feature-settings"));
      targetHost.style.setProperty("font-variation-settings", sourceStyle.getPropertyValue("font-variation-settings"));
      targetHost.dataset.mobileLiquidSignature = styleSignature;
    }

    targetHost.hidden = false;
    targetHost.style.left = "0px";
    targetHost.style.top = "0px";
    targetHost.style.width = formatStablePx(sourceRect.width);
    targetHost.style.height = formatStablePx(sourceRect.height);
    targetHost.style.transform = `translate3d(${formatStablePx(sourceRect.left - overlayRect.left)}, ${formatStablePx(sourceRect.top - overlayRect.top)}, 0)`;
  }

  function syncGalleryLiquidText() {
    const copies = [
      { source: "#cases .vz-cases__heading > p", host: "[data-gallery-liquid-target]", key: "cases-intro" },
    ];
    for (const copy of copies) {
      const source = rootRef.value?.querySelector<HTMLElement>(copy.source);
      const host = sectionLiquidRef.value?.querySelector<HTMLElement>(copy.host);
      if (!host) continue;
      host.hidden = true;
      if (!source) continue;
      const rect = source.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
      syncLiquidTextOverlay(source, host, copy.key);
    }
  }

  function syncSectionLiquidLabel() {
    const host = sectionLiquidRef.value?.querySelector<HTMLElement>("[data-section-label-liquid-target]");
    if (!host) return;
    host.hidden = true;
    const key = sectionLiquidState.lastTargetKey;
    if (!key || key === "hero" || key === "footer") return;
    const source = rootRef.value?.querySelector<HTMLElement>(`#${key} .vz-section-label`);
    if (!source) return;
    syncLiquidTextOverlay(source, host, `${key}-label`);

    // Match each label fragment to its live position, including wrapping and
    // section-specific spacing that the full-page negative clone cannot share.
    const sourceRect = getLandingLayoutRect(source);
    Array.from(source.children).forEach((child, index) => {
      const copy = host.children[index] as HTMLElement | undefined;
      if (!(child instanceof HTMLElement) || !copy) return;
      const rect = getLandingLayoutRect(child);
      const style = getComputedStyle(child);
      copy.style.position = "absolute";
      copy.style.margin = "0";
      copy.style.left = formatStablePx(rect.left - sourceRect.left);
      copy.style.top = formatStablePx(rect.top - sourceRect.top);
      copy.style.width = formatStablePx(rect.width);
      copy.style.height = formatStablePx(rect.height);
      copy.style.font = style.font;
      copy.style.letterSpacing = style.letterSpacing;
    });
  }

  function syncSectionLiquidTargetOverlay(targets: SectionLiquidTarget[]) {
    syncSectionLiquidLabel();
    syncGalleryLiquidText();
    clearSectionLiquidTextAlignment();
    hideSectionLiquidTargetOverlay();
    if (!sectionLiquidState.lastTargetKey) return;
    if (window.innerWidth <= 900) {
      syncMobileSectionLiquidTargetOverlay(targets);
      return;
    }

    const target = targets.find(({ key }) => key === sectionLiquidState.lastTargetKey);
    const cloneRoot = sectionLiquidRef.value?.querySelector<HTMLElement>(
      "[data-negative-world='page'] [data-negative-clone='true']",
    );
    if (!target || !cloneRoot) return;

    const cloneSelectors: Record<string, string> = {
      hero: "[data-negative-section='hero'] h1",
      about: "[data-negative-section='about'] .vz-about__head h2",
      stack: "[data-negative-section='stack'] .vz-sec-head h2",
      services: "[data-negative-section='services'] .vz-sec-head h2",
      clients: "[data-negative-section='clients'] h2",
      cases: "[data-negative-section='cases'] .vz-cases__heading h2",
      contacts: "[data-negative-section='contacts'] h2",
      footer: "[data-negative-section='footer'] .vz-footer__sign strong",
    };
    const cloneTarget = cloneRoot.querySelector<HTMLElement>(
      cloneSelectors[target.key] ?? "",
    );
    const cloneSection = cloneTarget?.closest<HTMLElement>("[data-negative-section]");
    if (!cloneTarget || !cloneSection) return;

    const sourceText = target.element.querySelector<HTMLElement>("[data-reveal]")
      ?? target.element;
    const cloneText = cloneTarget.querySelector<HTMLElement>("span span")
      ?? cloneTarget;
    const cloneSectionRect = getLandingLayoutRect(cloneSection);

    if (target.key !== "stack") {
      cloneSection.style.translate = `${formatStablePx(target.sectionRect.left - cloneSectionRect.left)} ${formatStablePx(target.sectionRect.top - cloneSectionRect.top)}`;
      cloneSection.dataset.liquidCloneAligned = "true";
    }

    const sourceRect = getLandingLayoutRect(sourceText);
    const cloneRect = getLandingLayoutRect(cloneText);

    cloneTarget.style.translate = `${formatStablePx(sourceRect.left - cloneRect.left)} ${formatStablePx(sourceRect.top - cloneRect.top)}`;
    cloneTarget.dataset.liquidTextAligned = "true";
  }

  function commitSectionLiquidTarget(target: SectionLiquidTarget) {
    const changed = target.key !== sectionLiquidState.lastTargetKey;
    sectionLiquidState.initialized = true;
    sectionLiquidState.lastTargetKey = target.key;
    sectionLiquidState.targetX = target.rect.left + target.rect.width / 2;
    sectionLiquidState.targetY = target.rect.top + target.rect.height / 2;
    sectionLiquidState.targetRadius = getSectionLiquidRadius(target);

    // Reveal at the new heading; never interpolate the mark across the page.
    const overlay = sectionLiquidRef.value;
    if (overlay && changed) {
      overlay.getAnimations().forEach((animation) => animation.cancel());
      if (target.key !== "hero") {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        overlay.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: reduceMotion ? 200 : 1000,
          easing: getComputedStyle(overlay).getPropertyValue("--ease-out").trim() || "cubic-bezier(0.23, 1, 0.32, 1)",
        });
      }
    }
  }

  function startSectionLiquid() {
    if (!enableSectionLiquid) return;
    if (sectionLiquidResizeTimer) return;
    if (sectionLiquidRaf) return;
    sectionLiquidRaf = requestAnimationFrame(animateSectionLiquid);
  }

  function animateSectionLiquid(now: number) {
    sectionLiquidRaf = 0;
    const overlay = sectionLiquidRef.value;
    if (!overlay || !enableSectionLiquid) return;

    updateSectionLiquidScrollDirection();
    const targets = getSectionLiquidTargets();
    const useStackScrollLock = window.innerWidth > 900;
    if (!useStackScrollLock) sectionLiquidStackLock = null;

    if (!targets.length && !sectionLiquidState.initialized) {
      overlay.classList.remove("is-active");
      overlay.removeAttribute("data-active-key");
      hideSectionLiquidTargetOverlay();
      sectionLiquidRaf = requestAnimationFrame(animateSectionLiquid);
      return;
    }

    if (!sectionLiquidState.initialized) {
      commitSectionLiquidTarget(getInitialSectionLiquidTarget(targets));
    } else {
      const nextTarget = getNextSectionLiquidTarget(targets);
      if (nextTarget) commitSectionLiquidTarget(nextTarget);
      else {
        if (
          sectionLiquidState.lastTargetKey === "stack"
          && !getStackLiquidScrollLock(targets)
        ) {
          sectionLiquidStackLock = null;
        }
        if (!sectionLiquidStackLock) syncCurrentSectionLiquidTarget(targets);
      }
    }

    const stackScrollLock = getStackLiquidScrollLock(targets);
    if (stackScrollLock) {
      const sticky = stackScrollLock.element.closest<HTMLElement>(".vz-sticky");
      const heading = stackScrollLock.element.closest<HTMLElement>(".vz-sec-head");
      const headingAnimating = heading?.getAnimations({ subtree: true })
        .some((animation) => animation.playState === "running") ?? false;

      // Capture once per sticky interval. Only follow the heading while its
      // entrance animation is running, including its final settled frame.
      if (!sectionLiquidStackLock || headingAnimating || sectionLiquidStackLock.headingAnimating) {
        const stickyRect = sticky ? getLandingLayoutRect(sticky) : null;
        sectionLiquidStackLock = {
          x: stackScrollLock.rect.left + stackScrollLock.rect.width / 2,
          y: stackScrollLock.rect.top + stackScrollLock.rect.height / 2,
          radius: getSectionLiquidRadius(stackScrollLock),
          headingAnimating,
          stickyBounds: stickyRect
            ? {
                top: stickyRect.top,
                left: stickyRect.left,
                width: stickyRect.width,
                height: stickyRect.height,
              }
            : null,
        };
      }

      sectionLiquidState.targetX = sectionLiquidStackLock.x;
      sectionLiquidState.targetY = sectionLiquidStackLock.y;
      sectionLiquidState.targetRadius = sectionLiquidStackLock.radius;
    } else {
      sectionLiquidStackLock = null;
      syncCurrentSectionLiquidTarget(targets);
    }

    overlay.classList.toggle(
      "is-stack-active",
      useStackScrollLock && Boolean(sectionLiquidStackLock),
    );
    updateNegativeWorldPositions();
    syncSectionLiquidTargetOverlay(targets);

    const overlayRect = getLandingLayoutRect(overlay);
    const activeKey = sectionLiquidState.lastTargetKey;
    const radius = sectionLiquidState.targetRadius;
    const centerX = sectionLiquidState.targetX - overlayRect.left;
    const centerY = sectionLiquidState.targetY - overlayRect.top;
    // Clip the mark the way the hero does. iOS Safari renders a clip path on a
    // layer this tall but silently drops a mask image on one.
    const path = buildHeroLiquidPath(
      centerX,
      centerY,
      radius,
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : now * 0.001,
      0,
      -0.35,
      {
        left: 0,
        top: 0,
        right: overlayRect.width,
        bottom: overlayRect.height,
        width: overlayRect.width,
        height: overlayRect.height,
      },
    );
    // While the stack is pinned, the active card must read as sitting on top of the mark:
    // punch its rounded rectangle out of the clip instead of painting the dark fill over it.
    const card = sectionLiquidStackLock
      ? rootRef.value?.querySelector<HTMLElement>("[data-stack-section] .vz-stack__active-card")
      : null;
    const cardRect = card ? getLandingLayoutRect(card) : null;
    if (cardRect && cardRect.width > 0 && cardRect.height > 0) {
      // The fill lives on ::before; an even-odd path of "whole overlay + card" leaves a card-shaped hole in it.
      const hole = `M0 0 H${formatPathNumber(overlayRect.width)} V${formatPathNumber(overlayRect.height)} H0 Z ${buildRoundedRectPath(cardRect.left - overlayRect.left, cardRect.top - overlayRect.top, cardRect.width, cardRect.height, 16)}`;
      overlay.style.setProperty("--liquid-card-hole", `"${hole}"`);
    } else {
      overlay.style.removeProperty("--liquid-card-hole");
    }
    applyHeroClip(overlay, path);

    overlay.classList.toggle("is-active", Boolean(activeKey) && activeKey !== "hero");
    overlay.dataset.activeKey = activeKey;

    // Keep the mark attached to sticky headings while their layout changes.
    sectionLiquidRaf = requestAnimationFrame(animateSectionLiquid);
  }

  function updateHeroNegative(event: PointerEvent) {
    const hero = heroRef.value;
    if (!hero || event.pointerType === "touch") return;

    const visualRect = hero.getBoundingClientRect();
    const presentationScale = getLandingPresentationScale(hero);
    const rect = getLandingLayoutRect(hero);
    const bounds = getHeroLiquidBounds(hero, rect);
    const pointerX = (event.clientX - visualRect.left) / presentationScale;
    const pointerY = (event.clientY - visualRect.top) / presentationScale;
    const isInsideBounds = pointerX >= bounds.left && pointerX <= bounds.right && pointerY >= bounds.top && pointerY <= bounds.bottom;
    if (!isInsideBounds) return;

    heroFxState.active = true;
    heroFxState.targetX = pointerX / rect.width;
    heroFxState.targetY = pointerY / rect.height;

    if (event.type === "pointermove") {
      if (heroFxState.hasPointer) {
        const pointerImpulseX = clampValue((pointerX - heroFxState.lastPointerX) / rect.width, -0.045, 0.045);
        const pointerImpulseY = clampValue((pointerY - heroFxState.lastPointerY) / rect.height, -0.045, 0.045);
        heroFxState.velocityX += pointerImpulseX * 0.034;
        heroFxState.velocityY += pointerImpulseY * 0.034;
      }

      heroFxState.hasPointer = true;
      heroFxState.lastPointerX = pointerX;
      heroFxState.lastPointerY = pointerY;
    }

    startHeroNegative();
  }

  function resetHeroNegative() {
    heroFxState.active = false;
    heroFxState.hasPointer = false;
    startHeroNegative();
  }

  function startHeroNegative() {
    if (heroFxRaf) return;
    heroFxLastFrame = performance.now();
    heroFxRaf = requestAnimationFrame(animateHeroNegative);
  }

  function animateHeroNegative(now: number) {
    heroFxRaf = 0;
    const hero = heroRef.value;
    const mask = heroNegativeRef.value;
    if (!hero || !mask) {
      return;
    }

    const rect = getLandingLayoutRect(hero);
    if (rect.width < 1 || rect.height < 1) {
      heroFxRaf = requestAnimationFrame(animateHeroNegative);
      return;
    }

    const elapsedMs = clampValue(now - heroFxLastFrame, 0, 50);
    const frame = clampValue(elapsedMs / 16.67, 0, 2);
    heroFxLastFrame = now;
    const bounds = getHeroLiquidBounds(hero, rect);
    const isMobileHeroFx = window.innerWidth <= 900;
    const radius = clampValue(Math.min(bounds.width * 0.16, bounds.height * 0.46, rect.width * 0.105), 76, 148) * (isMobileHeroFx ? 0.67 : 1);
    const centerInset = Math.min(radius * 0.14, bounds.width * 0.18, bounds.height * 0.18);
    const minCenterX = Math.min(bounds.left + centerInset, bounds.right);
    const maxCenterX = Math.max(bounds.right - centerInset, minCenterX);
    const minCenterY = Math.min(bounds.top + centerInset, bounds.bottom);
    const maxCenterY = Math.max(isMobileHeroFx ? bounds.top + radius * 0.45 : bounds.bottom - centerInset, minCenterY);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isMobileHeroFx) {
      let nextX = clampValue(heroFxState.currentX * rect.width, minCenterX, maxCenterX);
      let nextY = clampValue(heroFxState.currentY * rect.height, minCenterY, maxCenterY);

      if (!reduceMotion) {
        const horizontalRange = Math.max(1, maxCenterX - minCenterX);
        const verticalRange = Math.max(1, maxCenterY - minCenterY);
        nextX += heroFxState.mobileDirectionX * horizontalRange * elapsedMs / mobileHeroFxHorizontalTraversalMs;
        nextY += heroFxState.mobileDirectionY * verticalRange * elapsedMs / mobileHeroFxVerticalTraversalMs;

        if (nextX <= minCenterX || nextX >= maxCenterX) {
          heroFxState.mobileDirectionX *= -1;
          nextX = clampValue(nextX, minCenterX, maxCenterX);
        }
        if (nextY <= minCenterY || nextY >= maxCenterY) {
          heroFxState.mobileDirectionY *= -1;
          nextY = clampValue(nextY, minCenterY, maxCenterY);
        }
      }

      heroFxState.currentX = nextX / rect.width;
      heroFxState.currentY = nextY / rect.height;
    } else {
      const targetX = clampValue(heroFxState.targetX * rect.width, minCenterX, maxCenterX) / rect.width;
      const targetY = clampValue(heroFxState.targetY * rect.height, minCenterY, maxCenterY) / rect.height;

      if (heroFxState.active) {
        const dx = targetX - heroFxState.currentX;
        const dy = targetY - heroFxState.currentY;
        heroFxState.velocityX += dx * 0.0024 * frame;
        heroFxState.velocityY += dy * 0.0024 * frame;
      }

      const velocity = Math.hypot(heroFxState.velocityX, heroFxState.velocityY);
      if (!heroFxState.active && velocity < 0.00016) {
        heroFxState.velocityX += Math.cos(heroFxState.angle || -0.24) * 0.000012 * frame;
        heroFxState.velocityY += Math.sin(heroFxState.angle || -0.24) * 0.000012 * frame;
      }

      const damping = heroFxState.active ? 0.992 : 0.996;
      heroFxState.velocityX *= Math.pow(damping, frame);
      heroFxState.velocityY *= Math.pow(damping, frame);
      heroFxState.currentX += heroFxState.velocityX * frame;
      heroFxState.currentY += heroFxState.velocityY * frame;

      const clampedCenterX = clampValue(heroFxState.currentX * rect.width, minCenterX, maxCenterX);
      const clampedCenterY = clampValue(heroFxState.currentY * rect.height, minCenterY, maxCenterY);
      if (Math.abs(clampedCenterX - heroFxState.currentX * rect.width) > 0.1) {
        heroFxState.currentX = clampedCenterX / rect.width;
        heroFxState.velocityX = Math.sign(minCenterX + maxCenterX - clampedCenterX * 2 || 1) * Math.max(0.00022, Math.abs(heroFxState.velocityX) * 0.76);
      }
      if (Math.abs(clampedCenterY - heroFxState.currentY * rect.height) > 0.1) {
        heroFxState.currentY = clampedCenterY / rect.height;
        heroFxState.velocityY = Math.sign(minCenterY + maxCenterY - clampedCenterY * 2 || 1) * Math.max(0.00016, Math.abs(heroFxState.velocityY) * 0.76);
      }
    }

    const velocityX = (heroFxState.currentX - heroFxState.lastX) * rect.width;
    const velocityY = (heroFxState.currentY - heroFxState.lastY) * rect.height;
    const travel = Math.hypot(velocityX, velocityY);

    if (travel > 0.2) heroFxState.angle = Math.atan2(velocityY, velocityX);
    heroFxState.speed = clampValue(heroFxState.speed * 0.9 + clampValue(travel / 20, 0, 1) * 0.08, 0, 1);
    heroFxState.lastX = heroFxState.currentX;
    heroFxState.lastY = heroFxState.currentY;

    const x = heroFxState.currentX * rect.width;
    const y = heroFxState.currentY * rect.height;
    const path = buildHeroLiquidPath(x, y, radius, now * 0.001, heroFxState.speed, heroFxState.angle, bounds);
    hero.classList.add("is-hero-fx-active");

    applyHeroClip(mask, path);
    if (!isMobileHeroFx || !reduceMotion) {
      heroFxRaf = requestAnimationFrame(animateHeroNegative);
    }
  }

  function getHeroLiquidBounds(hero: HTMLElement, heroRect: DOMRect): HeroLiquidBounds {
    const title = hero.querySelector<HTMLElement>("h1");
    if (!title) {
      return {
        bottom: heroRect.height,
        height: heroRect.height,
        left: 0,
        right: heroRect.width,
        top: 0,
        width: heroRect.width,
      };
    }

    const titleRect = getLandingLayoutRect(title);
    const left = clampValue(titleRect.left - heroRect.left, 0, heroRect.width);
    const top = clampValue(titleRect.top - heroRect.top, 0, heroRect.height);
    const right = clampValue(titleRect.right - heroRect.left, left, heroRect.width);
    const bottom = clampValue(titleRect.bottom - heroRect.top, top, heroRect.height);

    return {
      bottom,
      height: Math.max(1, bottom - top),
      left,
      right,
      top,
      width: Math.max(1, right - left),
    };
  }

  function buildHeroLiquidPath(cx: number, cy: number, baseRadius: number, time: number, speed: number, angle: number, bounds: HeroLiquidBounds) {
    const pointCount = 42;
    const points: Array<{ x: number; y: number }> = [];
    const wallRange = baseRadius * 1.05;
    const leftPressure = clampValue((bounds.left + wallRange - cx) / wallRange, 0, 1);
    const rightPressure = clampValue((cx - (bounds.right - wallRange)) / wallRange, 0, 1);
    const topPressure = clampValue((bounds.top + wallRange - cy) / wallRange, 0, 1);
    const bottomPressure = clampValue((cy - (bounds.bottom - wallRange)) / wallRange, 0, 1);
    const wallXPressure = Math.max(leftPressure, rightPressure);
    const wallYPressure = Math.max(topPressure, bottomPressure);

    for (let index = 0; index < pointCount; index += 1) {
      const a = (Math.PI * 2 * index) / pointCount;
      const flow = Math.cos(a - angle);
      const side = Math.sin(a - angle);
      const wobble =
        Math.sin(a * 3 + time * 2.2) * 0.095 +
        Math.sin(a * 5 - time * 1.55) * 0.06 +
        Math.sin(a * 7 + time * 0.84) * 0.036;
      const motionPulse = Math.cos((a - angle) * 2) * speed * 0.07;
      const surfaceTension = Math.abs(side) * speed * 0.04;
      const radius = baseRadius * (1 + wobble + motionPulse - surfaceTension);
      const stretch = baseRadius * speed * flow * 0.085;
      const rx = radius * (1 - wallXPressure * 0.22 + wallYPressure * 0.08);
      const ry = radius * (1 - wallYPressure * 0.22 + wallXPressure * 0.08);
      const wallSlideX = Math.sin(a * 2 + time * 1.7) * wallYPressure * baseRadius * 0.012;
      const wallSlideY = Math.cos(a * 2 - time * 1.45) * wallXPressure * baseRadius * 0.012;
      const rawX = cx + Math.cos(a) * rx + Math.cos(angle) * stretch + wallSlideX;
      const rawY = cy + Math.sin(a) * ry + Math.sin(angle) * stretch + wallSlideY;
      const clampedX = clampValue(rawX, bounds.left, bounds.right);
      const clampedY = clampValue(rawY, bounds.top, bounds.bottom);

      points.push({
        x: clampedX,
        y: clampedY,
      });
    }

    return getClosedCurvePath(points, bounds);
  }

  function buildRoundedRectPath(x: number, y: number, width: number, height: number, radius: number) {
    const r = Math.max(0, Math.min(radius, width / 2, height / 2));
    const f = formatPathNumber;
    return `M${f(x + r)} ${f(y)} H${f(x + width - r)} A${f(r)} ${f(r)} 0 0 1 ${f(x + width)} ${f(y + r)} V${f(y + height - r)} A${f(r)} ${f(r)} 0 0 1 ${f(x + width - r)} ${f(y + height)} H${f(x + r)} A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + height - r)} V${f(y + r)} A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)} Z`;
  }

  function applyHeroClip(element: HTMLElement, value: string) {
    const clipPath = `path("${value}")`;
    element.style.clipPath = clipPath;
    element.style.setProperty("-webkit-clip-path", clipPath);
  }

  function getClosedCurvePath(points: Array<{ x: number; y: number }>, bounds?: HeroLiquidBounds) {
    const size = points.length;
    const clampX = (value: number) => bounds ? clampValue(value, bounds.left, bounds.right) : value;
    const clampY = (value: number) => bounds ? clampValue(value, bounds.top, bounds.bottom) : value;
    const segments = [`M ${formatPathNumber(clampX(points[0].x))} ${formatPathNumber(clampY(points[0].y))}`];

    for (let index = 0; index < size; index += 1) {
      const p0 = points[(index - 1 + size) % size];
      const p1 = points[index];
      const p2 = points[(index + 1) % size];
      const p3 = points[(index + 2) % size];
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;

      segments.push(
        `C ${formatPathNumber(clampX(c1x))} ${formatPathNumber(clampY(c1y))} ${formatPathNumber(clampX(c2x))} ${formatPathNumber(clampY(c2y))} ${formatPathNumber(clampX(p2.x))} ${formatPathNumber(clampY(p2.y))}`,
      );
    }

    return `${segments.join(" ")} Z`;
  }

  function formatPathNumber(value: number) {
    return value.toFixed(3);
  }

  // --- Negative worlds ---

  function getNegativeWorldSignature(scope: "hero" | "page") {
    return [
      scope,
      theme.value,
      showPreloader.value ? "preloader" : "ready",
      displayServices.value.length,
      displayStackGroups.value.length,
      activeServiceIndex.value,
      activeClientSegment.value,
    ].join(":");
  }

  function cleanupNegativeClone(clone: HTMLElement) {
    clone.dataset.negativeClone = "true";
    clone.setAttribute("aria-hidden", "true");
    clone.removeAttribute("id");
    clone.classList.remove("vz-motion-ready");
    negativeCloneSurfaceTokens.forEach(([property, value]) => {
      clone.style.setProperty(property, value, "important");
    });
    clone.querySelectorAll<HTMLElement>("#hero, #about, [data-stack-section], [data-services-pin], #clients, #cases, #contacts, .vz-footer").forEach((section) => {
      section.dataset.negativeSection = section.id || (section.classList.contains("vz-footer") ? "footer" : "");
      section.classList.add("is-motion-visible");
    });
    clone.querySelectorAll<HTMLElement>(".vz-nav, .vz-section-liquid, .vz-hero__negative, .vz-preloader, .vz-mobile-menu, .vz-motion-atmosphere").forEach((element) => element.remove());
    clone.querySelectorAll<HTMLElement>("[id]").forEach((element) => element.removeAttribute("id"));
    clone.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
      element.style.transition = "none";
      element.style.willChange = "auto";
    });
    clone.querySelectorAll<HTMLElement>("[data-clip-reveal]").forEach((element) => {
      element.style.clipPath = "inset(0 0 0 0)";
      element.style.transition = "none";
    });
    clone.querySelectorAll<HTMLElement>("[data-reveal], [data-clipped], [data-revealed]").forEach((element) => {
      element.removeAttribute("data-reveal");
      element.removeAttribute("data-clipped");
      element.removeAttribute("data-revealed");
    });
    clone.querySelectorAll<HTMLElement>("[data-clip-reveal]").forEach((element) => element.removeAttribute("data-clip-reveal"));
    clone.querySelectorAll<HTMLElement>("a, button, input, textarea, select").forEach((element) => {
      element.setAttribute("tabindex", "-1");
    });
  }

  function mountNegativeClone(host: HTMLElement, source: HTMLElement) {
    host.textContent = "";
    const clone = source.cloneNode(true) as HTMLElement;
    cleanupNegativeClone(clone);
    host.appendChild(clone);
  }

  function syncNegativeStackState() {
    const source = rootRef.value?.querySelector<HTMLElement>("[data-stack-section]");
    const clone = sectionLiquidRef.value?.querySelector<HTMLElement>(
      "[data-negative-world='page'] [data-stack-section]",
    );
    if (!source || !clone) return;

    const sourceItems = source.querySelectorAll<HTMLElement>("[data-stack-item]");
    const cloneItems = clone.querySelectorAll<HTMLElement>("[data-stack-item]");
    cloneItems.forEach((item, index) => {
      const sourceItem = sourceItems.item(index);
      if (!sourceItem) return;

      item.classList.toggle("is-active", sourceItem.classList.contains("is-active"));
      item.classList.toggle("is-past", sourceItem.classList.contains("is-past"));
      const ariaCurrent = sourceItem.getAttribute("aria-current");
      if (ariaCurrent) item.setAttribute("aria-current", ariaCurrent);
      else item.removeAttribute("aria-current");
    });

    const sourceCounter = source.querySelector<HTMLElement>("[data-stack-counter]");
    const cloneCounter = clone.querySelector<HTMLElement>("[data-stack-counter]");
    if (sourceCounter && cloneCounter && cloneCounter.textContent !== sourceCounter.textContent) {
      cloneCounter.textContent = sourceCounter.textContent;
    }

    const sourceFill = source.querySelector<HTMLElement>("[data-line-fill]");
    const cloneFill = clone.querySelector<HTMLElement>("[data-line-fill]");
    if (sourceFill && cloneFill && cloneFill.style.height !== sourceFill.style.height) {
      cloneFill.style.height = sourceFill.style.height;
    }

    const sourceSphere = source.querySelector<HTMLElement>(".vz-stack__sphere");
    const cloneSphere = clone.querySelector<HTMLElement>(".vz-stack__sphere");
    const sphereLayer = sourceSphere?.dataset.layer;
    if (cloneSphere && sphereLayer && cloneSphere.dataset.layer !== sphereLayer) {
      cloneSphere.dataset.layer = sphereLayer;
    }
  }

  function queueNegativeStackStateSync() {
    if (negativeStackSyncQueued) return;
    negativeStackSyncQueued = true;
    void nextTick(() => {
      negativeStackSyncQueued = false;
      syncNegativeStackState();
    });
  }

  function syncNegativeWorlds(force = false) {
    const root = rootRef.value;
    const hero = heroRef.value;
    const pageHost = sectionLiquidRef.value?.querySelector<HTMLElement>("[data-negative-world='page']");
    const heroHost = heroNegativeRef.value?.querySelector<HTMLElement>("[data-negative-world='hero']");
    const useLightMobileLiquid = window.innerWidth <= 900;
    const mobileSignature = "mobile-light";

    if (root && pageHost) {
      if (useLightMobileLiquid) {
        if (pageHost.dataset.signature !== mobileSignature || pageHost.childElementCount) {
          pageHost.textContent = "";
          pageHost.dataset.signature = mobileSignature;
        }
      } else {
        const signature = getNegativeWorldSignature("page");
        if (force || pageHost.dataset.signature !== signature) {
          mountNegativeClone(pageHost, root);
          pageHost.dataset.signature = signature;
        }
      }
    }

    if (hero && heroHost) {
      const signature = getNegativeWorldSignature("hero");
      if (force || heroHost.dataset.signature !== signature) {
        mountNegativeClone(heroHost, hero);
        heroHost.dataset.signature = signature;
      }
    }

    updateNegativeWorldPositions();
  }

  function updateNegativeWorldPositions() {
    const root = rootRef.value;
    const overlay = sectionLiquidRef.value;
    const pageHost = sectionLiquidRef.value?.querySelector<HTMLElement>("[data-negative-world='page']");
    if (root && overlay && pageHost) {
      const stackPinned = window.innerWidth > 900
        && sectionLiquidState.lastTargetKey === "stack"
        && Boolean(sectionLiquidStackLock);
      overlay.classList.toggle("is-stack-active", stackPinned);
      overlay.style.position = "";
      overlay.style.right = "";
      overlay.style.bottom = "";
      overlay.style.minHeight = "";
      const rect = getLandingLayoutRect(root);
      const layoutViewport = getLandingLayoutViewport(root);
      const height = Math.max(root.scrollHeight, root.offsetHeight, layoutViewport.height);
      const cloneStackSticky = pageHost.querySelector<HTMLElement>(
        "[data-negative-clone='true'] [data-stack-section] > .vz-sticky",
      );
      const sourceStackSticky = root.querySelector<HTMLElement>(
        "[data-stack-section] > .vz-sticky",
      );

      if (stackPinned) {
        overlay.style.left = "0px";
        overlay.style.top = "0px";
        overlay.style.width = formatStablePx(layoutViewport.width);
        overlay.style.height = formatStablePx(layoutViewport.height);

        const stickyRect = sectionLiquidStackLock?.stickyBounds
          ?? (sourceStackSticky ? getLandingLayoutRect(sourceStackSticky) : null)
          ?? null;
        if (stickyRect && cloneStackSticky) {
          cloneStackSticky.style.position = "fixed";
          cloneStackSticky.style.top = formatStablePx(stickyRect.top);
          cloneStackSticky.style.right = "auto";
          cloneStackSticky.style.bottom = "auto";
          cloneStackSticky.style.left = formatStablePx(stickyRect.left);
          cloneStackSticky.style.width = formatStablePx(stickyRect.width);
          cloneStackSticky.style.height = formatStablePx(stickyRect.height);
        }
        return;
      }

      if (cloneStackSticky) {
        cloneStackSticky.style.position = "";
        cloneStackSticky.style.top = "";
        cloneStackSticky.style.right = "";
        cloneStackSticky.style.bottom = "";
        cloneStackSticky.style.left = "";
        cloneStackSticky.style.width = "";
        cloneStackSticky.style.height = "";
      }

      const documentLeft = rect.left + window.scrollX / layoutViewport.scale;
      const documentTop = rect.top + window.scrollY / layoutViewport.scale;
      overlay.style.left = formatStablePx(documentLeft);
      overlay.style.top = formatStablePx(documentTop);
      overlay.style.width = formatStablePx(rect.width);
      overlay.style.height = `${height}px`;

      pageHost.style.left = "0px";
      pageHost.style.top = "0px";
      pageHost.style.width = "100%";
      pageHost.style.minHeight = `${height}px`;
    }
  }

  onMounted(() => {
    sectionLiquidLastScrollY = window.scrollY;
    sectionLiquidViewportWidth = window.innerWidth;
    sectionLiquidViewportScale = window.visualViewport?.scale ?? 1;
    window.addEventListener("resize", handleSectionLiquidResize, { passive: true });
    window.visualViewport?.addEventListener("resize", handleSectionLiquidResize, { passive: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleSectionLiquidResize);
    window.visualViewport?.removeEventListener("resize", handleSectionLiquidResize);
    sectionLiquidLayoutObserver?.disconnect();
    if (heroFxRaf) cancelAnimationFrame(heroFxRaf);
    if (sectionLiquidRaf) cancelAnimationFrame(sectionLiquidRaf);
    if (sectionLiquidLayoutRaf) cancelAnimationFrame(sectionLiquidLayoutRaf);
    if (sectionLiquidResizeTimer) window.clearTimeout(sectionLiquidResizeTimer);
  });

  return {
    enableSectionLiquid,
    setHeroHosts,
    updateHeroNegative,
    resetHeroNegative,
    startHeroNegative,
    startSectionLiquid,
    setupSectionLiquidLayoutObserver,
    queueSectionLiquidGeometrySync,
    syncNegativeWorlds,
    queueNegativeStackStateSync,
  };
}
