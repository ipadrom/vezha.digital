<template>
  <div
    v-show="isVisible"
    ref="thumbRef"
    class="case-scroll-thumb"
    :data-dragging="isDragging ? 'true' : 'false'"
    :data-theme="theme"
    :style="thumbStyle"
    aria-hidden="true"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
  ></div>
</template>

<script setup lang="ts">
const props = defineProps<{ theme: "light" | "dark" }>();

const thumbRef = ref<HTMLElement | null>(null);
const thumbHeight = ref(0);
const thumbTop = ref(4);
const isVisible = ref(false);
const isDragging = ref(false);
let frameId = 0;
let resizeObserver: ResizeObserver | null = null;
let dragStartPointerY = 0;
let dragStartScrollY = 0;

const EDGE = 4;
const MIN_THUMB_HEIGHT = 44;

const theme = computed(() => props.theme);
const thumbStyle = computed(() => ({
  height: `${thumbHeight.value}px`,
  transform: `translate3d(0, ${thumbTop.value}px, 0)`,
}));

function readScrollMetrics() {
  const root = document.documentElement;
  const viewportHeight = window.innerHeight;
  const scrollHeight = Math.max(root.scrollHeight, document.body.scrollHeight);
  const maxScroll = Math.max(0, scrollHeight - viewportHeight);
  const trackHeight = Math.max(0, viewportHeight - EDGE * 2);
  const height = maxScroll > 0
    ? Math.min(trackHeight, Math.max(MIN_THUMB_HEIGHT, Math.round((viewportHeight / scrollHeight) * trackHeight)))
    : 0;
  const travel = Math.max(0, trackHeight - height);

  return { height, maxScroll, trackHeight, travel };
}

function measureThumb() {
  frameId = 0;
  const { height, maxScroll, travel } = readScrollMetrics();
  thumbHeight.value = height;
  thumbTop.value = EDGE + (maxScroll > 0 ? (window.scrollY / maxScroll) * travel : 0);
  isVisible.value = maxScroll > 1 && height > 0;
}

function scheduleMeasure() {
  if (frameId) return;
  frameId = window.requestAnimationFrame(measureThumb);
}

function handlePointerDown(event: PointerEvent) {
  if (!isVisible.value || event.button !== 0) return;
  event.preventDefault();
  isDragging.value = true;
  dragStartPointerY = event.clientY;
  dragStartScrollY = window.scrollY;
  thumbRef.value?.setPointerCapture(event.pointerId);
}

function handlePointerMove(event: PointerEvent) {
  if (!isDragging.value) return;
  event.preventDefault();
  const { maxScroll, travel } = readScrollMetrics();
  if (travel <= 0) return;
  const nextScrollY = dragStartScrollY + (event.clientY - dragStartPointerY) * (maxScroll / travel);
  window.scrollTo({ top: Math.max(0, Math.min(maxScroll, nextScrollY)), behavior: "auto" });
}

function handlePointerUp(event: PointerEvent) {
  if (!isDragging.value) return;
  isDragging.value = false;
  if (thumbRef.value?.hasPointerCapture(event.pointerId)) thumbRef.value.releasePointerCapture(event.pointerId);
}

onMounted(() => {
  window.addEventListener("scroll", scheduleMeasure, { passive: true });
  window.addEventListener("resize", scheduleMeasure, { passive: true });
  resizeObserver = new ResizeObserver(scheduleMeasure);
  resizeObserver.observe(document.body);
  nextTick(scheduleMeasure);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", scheduleMeasure);
  window.removeEventListener("resize", scheduleMeasure);
  resizeObserver?.disconnect();
  if (frameId) window.cancelAnimationFrame(frameId);
});
</script>

<style scoped>
.case-scroll-thumb {
  position: fixed;
  top: 0;
  right: 2px;
  z-index: 400;
  width: 6px;
  border-radius: 999px;
  background: #aaa9a4;
  cursor: grab;
  opacity: .88;
  pointer-events: auto;
  touch-action: none;
  transition: background-color 160ms var(--ease-out, cubic-bezier(.23, 1, .32, 1)), opacity 160ms var(--ease-out, cubic-bezier(.23, 1, .32, 1));
  will-change: transform;
}

.case-scroll-thumb[data-theme="dark"] {
  background: #565960;
}

.case-scroll-thumb[data-dragging="true"] {
  cursor: grabbing;
  opacity: 1;
}

@media (hover: hover) and (pointer: fine) {
  .case-scroll-thumb:hover {
    background: #6e63e8;
    opacity: 1;
  }
}

@media (max-width: 760px) {
  .case-scroll-thumb {
    right: 1px;
    width: 4px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .case-scroll-thumb {
    transition: opacity 120ms var(--ease-out, cubic-bezier(.23, 1, .32, 1));
  }
}
</style>
