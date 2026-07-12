import type { Ref } from "vue";

type HeroLiquidBounds = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

type SectionLiquidTarget = {
  key: string;
  rect: DOMRect;
};

type UseLandingLiquidOptions = {
  rootRef: Ref<HTMLElement | null>;
  heroRef: Ref<HTMLElement | null>;
  heroNegativeRef: Ref<HTMLElement | null>;
  sectionLiquidRef: Ref<HTMLElement | null>;
  theme: Ref<string>;
  showPreloader: Ref<boolean>;
  activeStackIndex: Ref<number>;
  activeClientSegment: Ref<number>;
  getServicesCount: () => number;
  getStackGroupsCount: () => number;
  getStagesCount: () => number;
  getActiveServiceIndex: () => number;
  isStackWheelLocked: () => boolean;
  enabled: boolean;
};

export function useLandingLiquid(options: UseLandingLiquidOptions) {
  const {
    rootRef,
    heroRef,
    heroNegativeRef,
    sectionLiquidRef,
    theme,
    showPreloader,
    activeStackIndex,
    activeClientSegment,
    getServicesCount,
    getStackGroupsCount,
    getStagesCount,
    getActiveServiceIndex,
    isStackWheelLocked,
  } = options;
  const enableSectionLiquid = options.enabled;

  let heroFxRaf = 0;
  let heroFxLastFrame = 0;
  let sectionLiquidRaf = 0;
  let sectionLiquidLastFrame = 0;
  let sectionLiquidLastScrollY = 0;
  let sectionLiquidScrollDirection = 0;
  let motionPreference: MediaQueryList | null = null;
  let motionPreferenceListener: ((event: MediaQueryListEvent) => void) | null = null;

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
    speed: 0,
    targetX: 0.76,
    targetY: 0.43,
    velocityX: 0.00048,
    velocityY: 0.00018,
  };

  const sectionLiquidState = {
    angle: -0.35,
    arcX: 0,
    arcY: 0,
    currentX: 0,
    currentY: 0,
    initialized: false,
    lastTargetKey: "",
    lastX: 0,
    lastY: 0,
    radius: 104,
    speed: 0,
    targetRadius: 104,
    targetX: 0,
    targetY: 0,
    velocityX: 0,
    velocityY: 0,
  };

  function clampValue(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  function getMotionPreference() {
    if (motionPreference) return motionPreference;

    motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionPreferenceListener = (event) => {
      if (event.matches) {
        if (heroFxRaf) cancelAnimationFrame(heroFxRaf);
        if (sectionLiquidRaf) cancelAnimationFrame(sectionLiquidRaf);
        heroFxRaf = 0;
        sectionLiquidRaf = 0;
        heroRef.value?.classList.remove("is-hero-fx-active");
        deactivateSectionLiquid();
        return;
      }

      startHeroNegative();
      startSectionLiquid();
    };
    motionPreference.addEventListener("change", motionPreferenceListener);
    return motionPreference;
  }

  function prefersReducedMotion() {
    return getMotionPreference().matches;
  }

  function deactivateSectionLiquid() {
    const overlay = sectionLiquidRef.value;
    if (!overlay) return;

    overlay.classList.remove("is-active");
    overlay.removeAttribute("data-active-key");
  }

  function getSectionLiquidTargets() {
    const root = rootRef.value;
    if (!root) return [];

    const configs = [
      { key: "hero", selector: "#hero h1" },
      { key: "about", selector: "#about .vz-about__mark span" },
      { key: "stack", selector: "#stack .vz-sec-head h2" },
      { key: "services", selector: "#services .vz-sec-head h2" },
      { key: "clients", selector: "#clients h2" },
      { key: "stages", selector: "#stages h2" },
      { key: "contacts", selector: "#contacts h2" },
      { key: "footer", selector: ".vz-footer__sign strong" },
    ];

    return configs.reduce<SectionLiquidTarget[]>((targets, config) => {
      const element = root.querySelector<HTMLElement>(config.selector);
      if (!element) return targets;

      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return targets;

      targets.push({
        key: config.key,
        rect,
      });

      return targets;
    }, []);
  }

  function getSectionLiquidRadius(target: SectionLiquidTarget) {
    const wideLimit = window.innerWidth * 0.13;
    const byWidth = target.rect.width * 0.2;
    const byHeight = target.rect.height * (target.key === "footer" ? 0.46 : 0.72);
    return clampValue(Math.max(78, Math.min(wideLimit, byWidth, byHeight)), 68, 162);
  }

  function isSectionLiquidTargetFullyVisible(target: SectionLiquidTarget) {
    const topGuard = window.innerWidth > 900 ? 76 : 62;
    const bottomGuard = 24;
    return target.rect.top >= topGuard && target.rect.bottom <= window.innerHeight - bottomGuard;
  }

  function isSectionLiquidTargetVisible(target: SectionLiquidTarget) {
    const topGuard = window.innerWidth > 900 ? 76 : 62;
    const bottomGuard = 24;
    return target.rect.bottom > topGuard && target.rect.top < window.innerHeight - bottomGuard;
  }

  function getSectionLiquidTargetCenter(target: SectionLiquidTarget) {
    return (target.rect.top + target.rect.bottom) / 2;
  }

  function formatStablePx(value: number) {
    return `${Number(value.toFixed(3))}px`;
  }

  function getClosestSectionLiquidTarget(targets: SectionLiquidTarget[]) {
    const viewportCenter = window.innerHeight * 0.5;
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
      target.rect.top < window.innerHeight
    ));

    return viewportTargets.length ? getClosestSectionLiquidTarget(viewportTargets) : getClosestSectionLiquidTarget(targets);
  }

  function getSectionLiquidSwitchLine(direction: number) {
    return window.innerHeight * (direction > 0 ? 0.43 : 0.57);
  }

  function isSectionLiquidTargetReadyToEnter(target: SectionLiquidTarget, direction: number) {
    const center = getSectionLiquidTargetCenter(target);
    const switchLine = getSectionLiquidSwitchLine(direction);
    const enterLine = window.innerHeight * (direction > 0 ? 0.78 : 0.22);

    return direction > 0
      ? center >= switchLine && center <= enterLine
      : center <= switchLine && center >= enterLine;
  }

  function getNextSectionLiquidTarget(targets: SectionLiquidTarget[]) {
    const direction = sectionLiquidScrollDirection;

    if (isStackWheelLocked()) {
      const stackTarget = targets.find((target) => target.key === "stack");
      if (stackTarget && stackTarget.key !== sectionLiquidState.lastTargetKey) return stackTarget;
    }

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
    const deltaX = nextTargetX - sectionLiquidState.targetX;
    const deltaY = nextTargetY - sectionLiquidState.targetY;

    sectionLiquidState.currentX += deltaX;
    sectionLiquidState.currentY += deltaY;
    sectionLiquidState.lastX += deltaX;
    sectionLiquidState.lastY += deltaY;
    sectionLiquidState.targetX = nextTargetX;
    sectionLiquidState.targetY = nextTargetY;
    sectionLiquidState.targetRadius = getSectionLiquidRadius(currentTarget);
  }

  function commitSectionLiquidTarget(target: SectionLiquidTarget, snap = false) {
    const targetX = target.rect.left + target.rect.width / 2;
    const targetY = target.rect.top + target.rect.height / 2;
    const targetRadius = getSectionLiquidRadius(target);

    if (snap || !sectionLiquidState.initialized) {
      sectionLiquidState.currentX = targetX;
      sectionLiquidState.currentY = targetY;
      sectionLiquidState.lastX = targetX;
      sectionLiquidState.lastY = targetY;
      sectionLiquidState.arcX = 0;
      sectionLiquidState.arcY = 0;
      sectionLiquidState.radius = targetRadius;
      sectionLiquidState.speed = 0;
      sectionLiquidState.velocityX = 0;
      sectionLiquidState.velocityY = 0;
      sectionLiquidState.initialized = true;
    } else {
      const dx = targetX - sectionLiquidState.currentX;
      const dy = targetY - sectionLiquidState.currentY;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const direction = targetY >= sectionLiquidState.currentY ? 1 : -1;
      const normalX = -dy / distance;
      const normalY = dx / distance;
      const arc = clampValue(distance * 0.14, 34, 112) * direction;
      const impulse = clampValue(distance * 0.0038, 1.2, 5.8);

      sectionLiquidState.arcX = normalX * arc;
      sectionLiquidState.arcY = normalY * arc * 0.38;
      sectionLiquidState.velocityX += normalX * impulse * direction;
      sectionLiquidState.velocityY += normalY * impulse * 0.38 * direction;
    }

    sectionLiquidState.lastTargetKey = target.key;
    sectionLiquidState.targetX = targetX;
    sectionLiquidState.targetY = targetY;
    sectionLiquidState.targetRadius = targetRadius;
  }

  function forceSectionLiquidTarget(key: string, snap = false) {
    if (!enableSectionLiquid) return;
    if (prefersReducedMotion()) {
      deactivateSectionLiquid();
      return;
    }

    const target = getSectionLiquidTargets().find((item) => item.key === key);
    if (!target) return;

    commitSectionLiquidTarget(target, snap);
    updateNegativeWorldPositions();

    const overlay = sectionLiquidRef.value;
    if (!overlay) return;

    overlay.classList.toggle("is-active", key !== "hero");
    overlay.dataset.activeKey = key;
  }

  function startSectionLiquid() {
    if (!enableSectionLiquid || sectionLiquidRaf) return;
    if (prefersReducedMotion()) {
      deactivateSectionLiquid();
      return;
    }

    sectionLiquidLastFrame = performance.now();
    sectionLiquidRaf = requestAnimationFrame(animateSectionLiquid);
  }

  function animateSectionLiquid(now: number) {
    sectionLiquidRaf = 0;
    if (prefersReducedMotion()) {
      deactivateSectionLiquid();
      return;
    }

    const overlay = sectionLiquidRef.value;
    if (!overlay || !enableSectionLiquid) return;

    const frame = clampValue((now - sectionLiquidLastFrame) / 16.67, 0, 2.4);
    sectionLiquidLastFrame = now;
    updateSectionLiquidScrollDirection();
    const targets = getSectionLiquidTargets();

    if (!targets.length && !sectionLiquidState.initialized) {
      overlay.classList.remove("is-active");
      overlay.removeAttribute("data-active-key");
      sectionLiquidRaf = requestAnimationFrame(animateSectionLiquid);
      return;
    }

    if (!sectionLiquidState.initialized) {
      commitSectionLiquidTarget(getInitialSectionLiquidTarget(targets), true);
    } else {
      const nextTarget = getNextSectionLiquidTarget(targets);
      if (nextTarget) commitSectionLiquidTarget(nextTarget);
      else syncCurrentSectionLiquidTarget(targets);
    }

    updateNegativeWorldPositions();

    const targetX = sectionLiquidState.targetX;
    const targetY = sectionLiquidState.targetY;
    const targetRadius = sectionLiquidState.targetRadius;
    const directDistance = Math.hypot(targetX - sectionLiquidState.currentX, targetY - sectionLiquidState.currentY);
    const landing = clampValue(1 - directDistance / 180, 0, 1);
    const steerX = targetX + sectionLiquidState.arcX * (1 - landing * 0.72) - sectionLiquidState.currentX;
    const steerY = targetY + sectionLiquidState.arcY * (1 - landing * 0.86) - sectionLiquidState.currentY;
    const horizontalDamping = 0.82 - landing * 0.08;
    const verticalDamping = 0.76 - landing * 0.1;

    sectionLiquidState.velocityX += steerX * (0.012 + (1 - landing) * 0.002) * frame;
    sectionLiquidState.velocityY += steerY * (0.009 + (1 - landing) * 0.002) * frame;
    sectionLiquidState.velocityX *= Math.pow(horizontalDamping, frame);
    sectionLiquidState.velocityY *= Math.pow(verticalDamping, frame);
    sectionLiquidState.velocityY = clampValue(sectionLiquidState.velocityY, -18, 18);
    sectionLiquidState.currentX += sectionLiquidState.velocityX * frame;
    sectionLiquidState.currentY += sectionLiquidState.velocityY * frame;
    sectionLiquidState.arcX *= Math.pow(0.9, frame);
    sectionLiquidState.arcY *= Math.pow(0.82, frame);
    sectionLiquidState.radius += (targetRadius - sectionLiquidState.radius) * 0.08 * frame;

    const velocityX = sectionLiquidState.currentX - sectionLiquidState.lastX;
    const velocityY = sectionLiquidState.currentY - sectionLiquidState.lastY;
    const travel = Math.hypot(velocityX, velocityY);
    if (travel > 0.15) sectionLiquidState.angle = Math.atan2(velocityY, velocityX);
    sectionLiquidState.speed = clampValue(sectionLiquidState.speed * 0.88 + clampValue(travel / 24, 0, 1) * 0.12, 0, 1);
    sectionLiquidState.lastX = sectionLiquidState.currentX;
    sectionLiquidState.lastY = sectionLiquidState.currentY;

    const bounds = {
      bottom: window.innerHeight,
      height: window.innerHeight,
      left: 0,
      right: window.innerWidth,
      top: 0,
      width: window.innerWidth,
    };
    const moveIntensity = clampValue(Math.max(sectionLiquidState.speed, directDistance / 340), 0, 1);
    const renderRadius = sectionLiquidState.radius * (1 - moveIntensity * 0.34);
    const path = buildHeroLiquidPath(
      sectionLiquidState.currentX,
      sectionLiquidState.currentY,
      renderRadius,
      now * 0.001,
      sectionLiquidState.speed,
      sectionLiquidState.angle,
      bounds,
    );

    const activeKey = sectionLiquidState.lastTargetKey;
    overlay.classList.toggle("is-active", Boolean(activeKey) && activeKey !== "hero");
    overlay.dataset.activeKey = activeKey;
    applyHeroClip(overlay, path);
    sectionLiquidRaf = requestAnimationFrame(animateSectionLiquid);
  }

  function updateHeroNegative(event: PointerEvent) {
    const hero = heroRef.value;
    if (!hero || event.pointerType === "touch") return;

    const rect = hero.getBoundingClientRect();
    const bounds = getHeroLiquidBounds(hero, rect);
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
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
    if (prefersReducedMotion()) {
      heroRef.value?.classList.remove("is-hero-fx-active");
      return;
    }

    heroFxLastFrame = performance.now();
    heroFxRaf = requestAnimationFrame(animateHeroNegative);
  }

  function animateHeroNegative(now: number) {
    if (prefersReducedMotion()) {
      heroFxRaf = 0;
      heroRef.value?.classList.remove("is-hero-fx-active");
      return;
    }

    const hero = heroRef.value;
    const mask = heroNegativeRef.value;
    if (!hero || !mask) {
      heroFxRaf = 0;
      return;
    }

    const rect = hero.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) {
      heroFxRaf = requestAnimationFrame(animateHeroNegative);
      return;
    }

    const frame = clampValue((now - heroFxLastFrame) / 16.67, 0, 2);
    heroFxLastFrame = now;
    const bounds = getHeroLiquidBounds(hero, rect);
    const radius = clampValue(Math.min(bounds.width * 0.16, bounds.height * 0.46, rect.width * 0.105), 76, 148);
    const centerInset = Math.min(radius * 0.14, bounds.width * 0.18, bounds.height * 0.18);
    const minCenterX = Math.min(bounds.left + centerInset, bounds.right);
    const maxCenterX = Math.max(bounds.right - centerInset, minCenterX);
    const minCenterY = Math.min(bounds.top + centerInset, bounds.bottom);
    const maxCenterY = Math.max(bounds.bottom - centerInset, minCenterY);
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
    heroFxRaf = requestAnimationFrame(animateHeroNegative);
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

    const titleRect = title.getBoundingClientRect();
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
    return value.toFixed(1);
  }

  function getNegativeWorldSignature(scope: "hero" | "page") {
    return [
      scope,
      theme.value,
      showPreloader.value ? "preloader" : "ready",
      getServicesCount(),
      getStackGroupsCount(),
      getStagesCount(),
      activeStackIndex.value,
      getActiveServiceIndex(),
      activeClientSegment.value,
    ].join(":");
  }

  function cleanupNegativeClone(clone: HTMLElement) {
    clone.dataset.negativeClone = "true";
    clone.setAttribute("aria-hidden", "true");
    clone.removeAttribute("id");
    clone.classList.remove("vz-motion-ready");
    clone.querySelectorAll<HTMLElement>("#hero, #about, [data-stack-section], [data-services-pin], #clients, #stages, #contacts, .vz-footer").forEach((section) => {
      section.classList.add("is-motion-visible");
    });
    clone.querySelectorAll<HTMLElement>(".vz-section-liquid, .vz-hero__negative, .vz-preloader, .vz-mobile-menu").forEach((element) => element.remove());
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

  function syncNegativeWorlds(force = false) {
    const root = rootRef.value;
    const hero = heroRef.value;
    const pageHost = sectionLiquidRef.value?.querySelector<HTMLElement>("[data-negative-world='page']");
    const heroHost = heroNegativeRef.value?.querySelector<HTMLElement>("[data-negative-world='hero']");

    if (root && pageHost) {
      const signature = getNegativeWorldSignature("page");
      if (force || pageHost.dataset.signature !== signature) {
        mountNegativeClone(pageHost, root);
        pageHost.dataset.signature = signature;
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
    const pageHost = sectionLiquidRef.value?.querySelector<HTMLElement>("[data-negative-world='page']");
    if (root && pageHost) {
      const rect = root.getBoundingClientRect();
      const height = Math.max(root.scrollHeight, document.documentElement.scrollHeight, window.innerHeight);

      pageHost.style.left = formatStablePx(rect.left);
      pageHost.style.top = formatStablePx(rect.top);
      pageHost.style.width = formatStablePx(rect.width);
      pageHost.style.minHeight = `${height}px`;
    }
  }

  function setSectionLiquidScrollY(value = window.scrollY) {
    sectionLiquidLastScrollY = value;
  }

  function cleanup() {
    if (heroFxRaf) cancelAnimationFrame(heroFxRaf);
    if (sectionLiquidRaf) cancelAnimationFrame(sectionLiquidRaf);
    heroFxRaf = 0;
    sectionLiquidRaf = 0;
    if (motionPreference && motionPreferenceListener) {
      motionPreference.removeEventListener("change", motionPreferenceListener);
    }
    motionPreference = null;
    motionPreferenceListener = null;
  }

  return {
    updateHeroNegative,
    resetHeroNegative,
    startHeroNegative,
    startSectionLiquid,
    forceSectionLiquidTarget,
    syncNegativeWorlds,
    setSectionLiquidScrollY,
    cleanup,
  };
}
