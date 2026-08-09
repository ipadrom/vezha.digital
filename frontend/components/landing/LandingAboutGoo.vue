<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

type Point = { x: number; y: number };
type Particle = Point & {
  t: number;
  leg: number;
  radius: number;
  bornAt: number;
  born: boolean;
};
type Link = { a: number; b: number; weight: number };
type Junction = { t: number; bornAt: number; born: boolean };

const props = defineProps<{
  flowPhase: "signal" | "result";
  flowCycleKey: number;
  snakeSegments: Array<{ begin: string }>;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

const LEG_COUNT = 7;
const TRAVEL_MS = 1200;
const FINAL_SETTLE_MS = 760;
const DESKTOP_PARTICLES_PER_LEG = [3, 3, 3, 4, 3, 3, 4];
const MOBILE_PARTICLES_PER_LEG = [2, 2, 2, 3, 2, 2, 3];
const OFFSETS = [-8, 18, -24, 13, -31, 26, -15, 34, -22, 10, -35, 20, -12, 29, -27, 16, -33, 24, -17, 31, -21, 14, -9];

let context: CanvasRenderingContext2D | null = null;
let resizeObserver: ResizeObserver | null = null;
let visibilityObserver: IntersectionObserver | null = null;
let motionQuery: MediaQueryList | null = null;
let mobileQuery: MediaQueryList | null = null;
let frameId = 0;
let width = 0;
let height = 0;
let dpr = 1;
let cycleStartedAt = 0;
let lastProgress = 1;
let reducedMotion = false;
let inViewport = true;
let routeAnchors: Point[] = [];
let particles: Particle[] = [];
let links: Link[] = [];
let junctions: Junction[] = [];

function fallbackAnchors(): Point[] {
  if (mobileQuery?.matches) {
    return [
      { x: width * 0.5, y: height * 0.15 },
      { x: width * 0.5, y: height * 0.3 },
      { x: width * 0.25, y: height * 0.38 },
      { x: width * 0.5, y: height * 0.46 },
      { x: width * 0.75, y: height * 0.54 },
      { x: width * 0.25, y: height * 0.62 },
      { x: width * 0.5, y: height * 0.7 },
      { x: width * 0.5, y: height * 0.85 },
    ];
  }

  return [
    { x: width * 0.125, y: height * 0.5 },
    { x: width * 0.25, y: height * 0.5 },
    { x: width * 0.35, y: height * 0.69 },
    { x: width * 0.45, y: height * 0.3 },
    { x: width * 0.55, y: height * 0.65 },
    { x: width * 0.65, y: height * 0.33 },
    { x: width * 0.75, y: height * 0.5 },
    { x: width * 0.875, y: height * 0.5 },
  ];
}

function refreshAnchors() {
  const canvas = canvasRef.value;
  const host = canvas?.parentElement;
  if (!canvas || !host) {
    routeAnchors = fallbackAnchors();
    return;
  }

  const hostRect = host.getBoundingClientRect();
  const anchorElements = [...host.querySelectorAll<HTMLElement>("[data-flow-anchor]")];
  if (anchorElements.length !== LEG_COUNT + 1) {
    routeAnchors = fallbackAnchors();
    return;
  }

  routeAnchors = anchorElements.map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - hostRect.left,
      y: rect.top + rect.height / 2 - hostRect.top,
    };
  });
}

function catmullRom(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

function pointOnRoute(progress: number): Point {
  const route = routeAnchors.length === LEG_COUNT + 1 ? routeAnchors : fallbackAnchors();
  const scaled = Math.max(0, Math.min(0.999999, progress)) * (route.length - 1);
  const segment = Math.floor(scaled);
  const local = scaled - segment;
  const p1 = route[segment]!;
  const p2 = route[Math.min(segment + 1, route.length - 1)]!;
  const p0 = route[Math.max(segment - 1, 0)]!;
  const p3 = route[Math.min(segment + 2, route.length - 1)]!;
  return catmullRom(p0, p1, p2, p3, local);
}

function normalOnRoute(progress: number): Point {
  const before = pointOnRoute(Math.max(0, progress - 0.003));
  const after = pointOnRoute(Math.min(1, progress + 0.003));
  const dx = after.x - before.x;
  const dy = after.y - before.y;
  const length = Math.hypot(dx, dy) || 1;
  return { x: -dy / length, y: dx / length };
}

function particleTarget(t: number, offset: number): Point {
  const routePoint = pointOnRoute(t);
  const normal = normalOnRoute(t);
  const responsiveOffset = offset * (mobileQuery?.matches ? 0.72 : 1);
  return {
    x: routePoint.x + normal.x * responsiveOffset,
    y: routePoint.y + normal.y * responsiveOffset,
  };
}

function isOutsideJunctionGuards(target: Point, radius: number) {
  return routeAnchors.every((anchor, index) => {
    const endpoint = index === 0 || index === routeAnchors.length - 1;
    const guard = endpoint
      ? (mobileQuery?.matches ? 33 : 54)
      : (mobileQuery?.matches ? 17 : 22);
    return Math.hypot(target.x - anchor.x, target.y - anchor.y) >= guard + radius;
  });
}

function findSafeParticle(leg: number, slot: number, count: number, offset: number, radius: number) {
  const ideal = (slot + 1) / (count + 1);
  const candidates = Array.from({ length: 177 }, (_, index) => 0.16 + index * (0.68 / 176))
    .sort((a, b) => Math.abs(a - ideal) - Math.abs(b - ideal));

  for (const offsetScale of [1, 0.72, 0.46]) {
    for (const local of candidates) {
      const t = (leg + local) / LEG_COUNT;
      const target = particleTarget(t, offset * offsetScale);
      if (isOutsideJunctionGuards(target, radius)) {
        return { t, target };
      }
    }
  }

  return null;
}

function resetWorld(now = performance.now(), revealProgress = 0, settled = false) {
  let offsetIndex = 0;
  particles = [];

  const particlesPerLeg = mobileQuery?.matches
    ? MOBILE_PARTICLES_PER_LEG
    : DESKTOP_PARTICLES_PER_LEG;

  particlesPerLeg.forEach((count, leg) => {
    for (let slot = 0; slot < count; slot += 1) {
      const offset = OFFSETS[offsetIndex % OFFSETS.length]!;
      const radius = 2.6 + ((offsetIndex * 17) % 5) * 0.58;
      const safe = findSafeParticle(leg, slot, count, offset, radius);
      offsetIndex += 1;
      if (!safe) continue;

      const born = settled || safe.t <= revealProgress - 0.006;
      particles.push({
        x: safe.target.x,
        y: safe.target.y,
        t: safe.t,
        leg,
        radius,
        born,
        bornAt: born ? now - 2000 : 0,
      });
    }
  });

  particles.sort((a, b) => a.t - b.t);
  links = [];
  for (let leg = 0; leg < LEG_COUNT; leg += 1) {
    const indexes = particles
      .map((particle, index) => ({ particle, index }))
      .filter(({ particle }) => particle.leg === leg)
      .map(({ index }) => index);

    for (let index = 1; index < indexes.length; index += 1) {
      links.push({ a: indexes[index - 1]!, b: indexes[index]!, weight: 0.72 });
      if (index > 1) links.push({ a: indexes[index - 2]!, b: indexes[index]!, weight: 0.38 });
      if (index > 2) links.push({ a: indexes[index - 3]!, b: indexes[index]!, weight: 0.24 });
    }
  }

  junctions = Array.from({ length: LEG_COUNT + 1 }, (_, index) => {
    const t = index / LEG_COUNT;
    const born = index === 0 || settled || t <= revealProgress + 0.003;
    return { t, born, bornAt: born ? now - 2000 : 0 };
  });
}

function easeInOut(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

function revealWorld(progress: number, now: number) {
  particles.forEach((particle) => {
    if (!particle.born && particle.t <= progress - 0.006) {
      particle.born = true;
      particle.bornAt = now;
    }
  });

  junctions.forEach((junction) => {
    if (!junction.born && progress >= junction.t - 0.003) {
      junction.born = true;
      junction.bornAt = now;
    }
  });
}

function revealClientDeparture(elapsed: number, now: number) {
  const entryStartsAt = legStartTimes()[0] ?? 0;
  if (elapsed < entryStartsAt) return;
  const firstRouteParticle = particles.find((particle) => particle.leg === 0);
  if (!firstRouteParticle || firstRouteParticle.born) return;
  firstRouteParticle.born = true;
  firstRouteParticle.bornAt = now;
}

function rodGrowth(now: number, startedAt: number, delay = 0, settled = false) {
  if (settled) return 1;
  const raw = Math.max(0, Math.min(1, (now - startedAt - delay) / 520));
  return 1 - (1 - raw) ** 3;
}

function drawRod(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  growth: number,
  highlighted: boolean,
  weight = 0.72,
) {
  if (growth <= 0) return;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(from.x + (to.x - from.x) * growth, from.y + (to.y - from.y) * growth);
  ctx.lineWidth = 0.75 + weight * 0.7;
  if (highlighted) {
    ctx.strokeStyle = `rgba(91, 154, 255, ${growth * 0.58})`;
    ctx.shadowColor = "rgba(113, 105, 245, 0.32)";
    ctx.shadowBlur = 5;
  } else {
    ctx.strokeStyle = `rgba(29, 30, 34, ${growth * (0.11 + weight * 0.2)})`;
    ctx.shadowBlur = 0;
  }
  ctx.stroke();
}

function drawScene(progress: number, now: number, settled = false) {
  if (!context || !width || !height) return;
  const ctx = context;
  ctx.clearRect(0, 0, width, height);

  links.forEach((link) => {
    const a = particles[link.a]!;
    const b = particles[link.b]!;
    if (!a.born || !b.born) return;
    const growth = rodGrowth(now, Math.max(a.bornAt, b.bornAt), 140, settled);
    const middleT = (a.t + b.t) * 0.5;
    const recent = Math.max(0, 1 - Math.abs(progress - middleT) * 11);
    drawRod(ctx, a, b, growth, !settled && recent > 0.08, link.weight);
  });
  ctx.shadowBlur = 0;

  junctions.forEach((junction, junctionIndex) => {
    if (!junction.born) return;
    const anchor = routeAnchors[junctionIndex];
    if (!anchor) return;

    if (junctionIndex > 0) {
      const incoming = particles.filter((particle) => particle.born && particle.leg === junctionIndex - 1).slice(-3);
      incoming.forEach((particle, index) => {
        const growth = rodGrowth(now, junction.bornAt, 70 + index * 70, settled);
        drawRod(ctx, particle, anchor, growth, !settled && Math.abs(progress - junction.t) < 0.055, 0.86 - index * 0.1);
      });
    }

    if (junctionIndex < LEG_COUNT) {
      const outgoing = particles
        .filter((particle) => particle.born && particle.leg === junctionIndex)
        .slice(0, junctionIndex === 0 ? 3 : 2);
      outgoing.forEach((particle, index) => {
        const delay = junctionIndex === 0 ? index * 60 : 140 + index * 60;
        const growth = rodGrowth(now, particle.bornAt, delay, settled);
        drawRod(ctx, anchor, particle, growth, !settled && Math.abs(progress - particle.t) < 0.065, 0.78 - index * 0.08);
      });
    }
  });
  ctx.shadowBlur = 0;

  particles.forEach((particle) => {
    if (!particle.born) return;
    const age = settled ? 1 : Math.min(1, (now - particle.bornAt) / 400);
    const recent = Math.max(0, 1 - Math.abs(progress - particle.t) * 14);
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius * (0.72 + age * 0.28), 0, Math.PI * 2);
    ctx.fillStyle = recent > 0.15 && !settled
      ? `rgba(${Math.round(46 + recent * 22)}, ${Math.round(48 + recent * 70)}, ${Math.round(54 + recent * 158)}, ${0.72 + recent * 0.28})`
      : `rgba(29, 30, 34, ${0.72 + age * 0.24})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(particle.x - particle.radius * 0.25, particle.y - particle.radius * 0.28, Math.max(0.65, particle.radius * 0.17), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + recent * 0.34})`;
    ctx.fill();
  });
}

function legStartTimes() {
  return [240, ...props.snakeSegments.map((segment) => Number.parseFloat(segment.begin) * 1000)];
}

function progressAt(elapsed: number) {
  const starts = legStartTimes();
  for (let leg = 0; leg < LEG_COUNT; leg += 1) {
    const start = starts[leg] ?? 0;
    if (elapsed < start) return leg / LEG_COUNT;
    if (elapsed < start + TRAVEL_MS) {
      return (leg + easeInOut((elapsed - start) / TRAVEL_MS)) / LEG_COUNT;
    }
  }
  return 1;
}

function finalAnimationEnd() {
  const starts = legStartTimes();
  return (starts[LEG_COUNT - 1] ?? 0) + TRAVEL_MS + FINAL_SETTLE_MS;
}

function shouldAnimate(now = performance.now()) {
  if (reducedMotion || document.hidden || !inViewport || !cycleStartedAt) return false;
  return now - cycleStartedAt < finalAnimationEnd();
}

function animationFrame(now: number) {
  const elapsed = Math.max(0, now - cycleStartedAt);
  lastProgress = progressAt(elapsed);
  revealClientDeparture(elapsed, now);
  revealWorld(lastProgress, now);
  drawScene(lastProgress, now);

  if (shouldAnimate(now)) {
    frameId = requestAnimationFrame(animationFrame);
  } else {
    frameId = 0;
    if (lastProgress >= 1) {
      resetWorld(now, 1, true);
      drawScene(1, now, true);
    }
  }
}

function ensureAnimation() {
  if (!frameId && shouldAnimate()) frameId = requestAnimationFrame(animationFrame);
}

function startCycle() {
  const now = performance.now();
  cycleStartedAt = now;
  lastProgress = 0;
  resetWorld(now);
  drawScene(0, now);
  cancelAnimationFrame(frameId);
  frameId = 0;
  ensureAnimation();
}

function showSettled() {
  const now = performance.now();
  lastProgress = 1;
  resetWorld(now, 1, true);
  drawScene(1, now, true);
}

function resizeCanvas() {
  const canvas = canvasRef.value;
  const host = canvas?.parentElement;
  if (!canvas || !host) return;
  const rect = host.getBoundingClientRect();
  width = Math.max(1, rect.width);
  height = Math.max(1, rect.height);
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context = canvas.getContext("2d");
  context?.setTransform(dpr, 0, 0, dpr, 0, 0);
  refreshAnchors();

  const now = performance.now();
  const settled = reducedMotion || (!cycleStartedAt && props.flowPhase === "result") || lastProgress >= 1;
  resetWorld(now, settled ? 1 : lastProgress, settled);
  drawScene(settled ? 1 : lastProgress, now, settled);
}

function onDocumentVisibility() {
  if (document.hidden) {
    cancelAnimationFrame(frameId);
    frameId = 0;
  } else {
    ensureAnimation();
  }
}

function onMotionPreference(event: MediaQueryListEvent | MediaQueryList) {
  reducedMotion = event.matches;
  cancelAnimationFrame(frameId);
  frameId = 0;
  if (reducedMotion) showSettled();
  else if (props.flowPhase === "signal") startCycle();
  else showSettled();
}

watch(() => props.flowCycleKey, async () => {
  await nextTick();
  refreshAnchors();
  startCycle();
});

watch(() => props.flowPhase, (phase) => {
  if (phase === "signal") {
    ensureAnimation();
    return;
  }
  if (!cycleStartedAt || reducedMotion || lastProgress >= 1) showSettled();
  else ensureAnimation();
});

onMounted(async () => {
  const canvas = canvasRef.value;
  const host = canvas?.parentElement;
  if (!canvas || !host) return;
  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mobileQuery = window.matchMedia("(max-width: 720px)");
  reducedMotion = motionQuery.matches;
  motionQuery.addEventListener("change", onMotionPreference);
  mobileQuery.addEventListener("change", resizeCanvas);
  resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(host);
  visibilityObserver = new IntersectionObserver(([entry]) => {
    inViewport = Boolean(entry?.isIntersecting);
    if (inViewport) ensureAnimation();
    else {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }, { rootMargin: "120px 0px" });
  visibilityObserver.observe(host);
  document.addEventListener("visibilitychange", onDocumentVisibility);
  await nextTick();
  resizeCanvas();
  if (props.flowPhase === "signal") startCycle();
  else showSettled();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId);
  resizeObserver?.disconnect();
  visibilityObserver?.disconnect();
  motionQuery?.removeEventListener("change", onMotionPreference);
  mobileQuery?.removeEventListener("change", resizeCanvas);
  document.removeEventListener("visibilitychange", onDocumentVisibility);
  particles = [];
  links = [];
  junctions = [];
  context = null;
});
</script>

<template>
  <canvas ref="canvasRef" class="vz-about-goo" aria-hidden="true"></canvas>
</template>

<style scoped>
.vz-about-goo {
  position: absolute;
  z-index: 1;
  inset: 0;
  display: block;
  pointer-events: none;
}
</style>
