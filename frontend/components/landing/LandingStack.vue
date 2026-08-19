<template>
  <section id="stack" ref="rootRef" data-stack-section class="vz-stack">
    <div class="vz-sticky">
      <div class="vz-sticky__inner">
        <div class="vz-sec-head" data-sec-head>
          <div>
            <div class="vz-section-label">
              <span>{{ copy.label }}</span><i>/</i><span data-secnum>02</span>
            </div>
            <h2>{{ copy.title }}</h2>
          </div>
          <div class="vz-sec-meta" data-sec-meta>
            <div><span data-stack-counter>{{ counter }}</span><i> / {{ total }}</i></div>
            <p>{{ copy.meta }}</p>
          </div>
        </div>

        <div class="vz-stack__mobile-layout">
          <div ref="timelineRef" class="vz-stack__timeline">
            <div class="vz-stack__line" data-stack-line :style="lineStyle">
              <span data-line-fill :style="{ height: `${progress * 100}%` }"></span>
            </div>
            <article
              v-for="(group, index) in groups"
              :key="group.title"
              :aria-current="activeIndex === index ? 'step' : undefined"
              :class="{ 'is-active': activeIndex === index, 'is-past': index < activeIndex }"
              data-stack-item
              class="vz-stack-item"
              role="button"
              tabindex="0"
              @click="scrollToIndex(index)"
              @keydown.enter.prevent="scrollToIndex(index)"
              @keydown.space.prevent="scrollToIndex(index)"
            >
              <div data-label>{{ group.title }}</div>
              <div><span data-halo></span><span data-dot></span></div>
              <div class="vz-stack-item__details" aria-hidden="true">
                <p>{{ group.description }}</p>
                <div><span v-for="item in group.items" :key="item">{{ item }}</span></div>
              </div>
            </article>

            <div
              v-if="activeGroup"
              class="vz-stack__active-card"
              :style="activeCardStyle"
              aria-live="polite"
            >
              <Transition name="vz-stack-card-content" mode="out-in">
                <div :key="`${activeIndex}-${activeGroup.title}`" class="vz-stack__active-card-body">
                  <p>{{ activeGroup.description }}</p>
                  <div>
                    <span v-for="item in activeGroup.items" :key="item">{{ item }}</span>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <div v-if="activeGroup" class="vz-stack__mobile-details">
            <p>{{ activeGroup.description }}</p>
            <div>
              <span v-for="item in balancedMobileItems" :key="item">{{ item }}</span>
            </div>
          </div>
        </div>

        <div class="vz-stack__sphere-window">
          <div
            ref="sphereRef"
            class="vz-stack__sphere"
            :data-layer="activeLayer"
            aria-hidden="true"
          ></div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useLandingStackScroll } from "~/composables/landing/useLandingStackScroll";
import { useLandingStackSphere } from "~/composables/landing/useLandingStackSphere";
import { resolveStackVisualLayer } from "~/utils/landingStackOrbit";

type StackGroup = { title: string; description: string; items: string[] };
type StackCopy = { label: string; title: string; meta: string; hint: [string, string] };

const props = defineProps<{ groups: StackGroup[]; copy: StackCopy }>();
const emit = defineEmits<{
  activeChange: [index: number, progress: number];
}>();

const rootRef = ref<HTMLElement | null>(null);
const sphereRef = ref<HTMLElement | null>(null);
const timelineRef = ref<HTMLElement | null>(null);
const lineStyle = ref<Record<string, string>>({});
const activeCardStyle = ref<Record<string, string>>({});
const itemCount = computed(() => props.groups.length);
const total = computed(() => String(props.groups.length).padStart(2, "0"));
const { activeIndex, progress, scrollToIndex } = useLandingStackScroll(
  rootRef,
  itemCount,
  (index, value) => emit("activeChange", index, value),
);
const counter = computed(() => String(activeIndex.value + 1).padStart(2, "0"));
const activeGroup = computed(() => props.groups[activeIndex.value] || null);
const balancedMobileItems = computed(() => {
  const items = activeGroup.value?.items || [];
  if (items.length !== 4) return items;

  const [longest, secondLongest, secondShortest, shortest] = [...items]
    .sort((left, right) => right.length - left.length);

  return [longest, shortest, secondLongest, secondShortest];
});
const activeLayer = computed(() => (
  resolveStackVisualLayer(props.groups[activeIndex.value]?.title)
));

const stackSphere = useLandingStackSphere({
  hostRef: sphereRef,
  activeLayer,
});

let timelineResizeObserver: ResizeObserver | null = null;

function getLayoutCenterY(element: HTMLElement, ancestor: HTMLElement) {
  let offset = element.offsetHeight / 2;
  let current: HTMLElement | null = element;

  while (current && current !== ancestor) {
    offset += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  if (current === ancestor) return offset;

  const ancestorRect = ancestor.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  return elementRect.top + elementRect.height / 2 - ancestorRect.top;
}

function updateActiveCardPosition() {
  const timeline = timelineRef.value;
  if (!timeline) return;

  const items = timeline.querySelectorAll<HTMLElement>("[data-stack-item]");
  const activeItem = items.item(activeIndex.value);
  if (!activeItem) return;

  activeCardStyle.value = {
    "--stack-card-y": `${getLayoutCenterY(activeItem, timeline).toFixed(3)}px`,
  };
}

function updateTimelineGeometry() {
  const timeline = timelineRef.value;
  if (!timeline) return;

  const dots = timeline.querySelectorAll<HTMLElement>("[data-dot]");
  const firstDot = dots.item(0);
  const lastDot = dots.item(dots.length - 1);
  if (!firstDot || !lastDot) return;

  // Layout offsets intentionally ignore entrance transforms. Measuring visual
  // rects while the rows reveal would leave the rail shifted after they settle.
  const start = getLayoutCenterY(firstDot, timeline);
  const end = getLayoutCenterY(lastDot, timeline);

  lineStyle.value = {
    top: `${start.toFixed(3)}px`,
    bottom: "auto",
    height: `${Math.max(0, end - start).toFixed(3)}px`,
  };
  updateActiveCardPosition();
}

onMounted(async () => {
  await nextTick();
  updateTimelineGeometry();
  if (timelineRef.value) {
    timelineResizeObserver = new ResizeObserver(updateTimelineGeometry);
    timelineResizeObserver.observe(timelineRef.value);
  }
  stackSphere.updatePosition();
  void stackSphere.setup();
});

watch(itemCount, async () => {
  await nextTick();
  updateTimelineGeometry();
});

watch(activeIndex, async () => {
  await nextTick();
  updateActiveCardPosition();
});

onBeforeUnmount(() => {
  timelineResizeObserver?.disconnect();
  timelineResizeObserver = null;
  stackSphere.cleanup();
});
</script>

<style scoped>
.vz-stack {
  min-height: 380vh;
  padding: 0;
}

.vz-stack > .vz-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  min-height: 620px;
  overflow: clip;
}

@media (max-width: 900px) {
  .vz-stack {
    min-height: 0;
    padding: var(--section-space) 0;
  }

  .vz-stack > .vz-sticky {
    position: relative;
    top: auto;
    height: auto;
    min-height: 0;
    overflow: visible;
  }

.vz-stack-item > div:last-child {
    max-height: none;
    opacity: 1;
    transform: none;
  }
}

.vz-stack-item [data-halo] {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@media (min-width: 901px) {
  .vz-stack-item > .vz-stack-item__details {
    visibility: hidden;
    pointer-events: none;
  }

  .vz-stack__active-card {
    --stack-card-y: 58px;
    position: absolute;
    top: 0;
    right: 0;
    left: 320px;
    z-index: 3;
    display: flex;
    min-height: 112px;
    align-items: center;
    padding: 14px 18px;
    overflow: hidden;
    border: 1px solid var(--landing-card-border, color-mix(in srgb, var(--ink) 7%, transparent));
    border-radius: 16px;
    background: var(--landing-card-surface-cyan-left, var(--landing-card-surface, var(--bg)));
    box-shadow: var(--landing-card-shadow, 0 22px 50px -34px color-mix(in srgb, var(--ink) 36%, transparent));
    backdrop-filter: blur(18px) saturate(1.08);
    pointer-events: none;
    transform: translate3d(0, calc(var(--stack-card-y) - 50%), 0);
    transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }

  .vz-stack__active-card-body {
    width: 100%;
  }

  .vz-stack__active-card p {
    max-width: 48ch;
    margin: 0 0 10px;
    color: var(--text2);
    font-size: var(--type-body);
    line-height: 1.45;
  }

  .vz-stack__active-card-body > div {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .vz-stack__active-card span {
    display: inline-flex;
    min-height: 30px;
    align-items: center;
    padding: 6px 11px;
    border: 1px solid var(--chipbd);
    border-radius: 999px;
    color: var(--chipink);
    font-family: "JetBrains Mono", monospace;
    font-size: var(--type-chip);
    letter-spacing: 0.03em;
    white-space: nowrap;
  }

  .vz-stack-card-content-enter-active {
    transition:
      opacity 240ms var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1)),
      transform 240ms var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1));
  }

  .vz-stack-card-content-leave-active {
    transition:
      opacity 140ms ease-in,
      transform 140ms ease-in;
  }

  .vz-stack-card-content-enter-from {
    opacity: 0;
    transform: translate3d(0, 5px, 0);
  }

  .vz-stack-card-content-leave-to {
    opacity: 0;
    transform: translate3d(0, -3px, 0);
  }
}

@media (max-width: 900px) {
  .vz-stack__active-card {
    display: none;
  }

  .vz-stack__mobile-details {
    padding: 13px 12px;
    border: 1px solid var(--landing-card-border, color-mix(in srgb, var(--ink) 7%, transparent));
    border-radius: 16px;
    background: var(--landing-card-surface-violet-top, var(--landing-card-surface, var(--bg)));
    box-shadow: var(--landing-card-shadow, 0 18px 44px -32px color-mix(in srgb, var(--ink) 32%, transparent));
    backdrop-filter: blur(16px) saturate(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .vz-stack__active-card {
    transition: none;
  }

  .vz-stack-card-content-enter-active,
  .vz-stack-card-content-leave-active {
    transition: opacity 125ms var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1));
  }
}
</style>
