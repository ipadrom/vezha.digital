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

        <div
          ref="sphereRef"
          class="vz-stack__sphere"
          :data-layer="activeLayer"
          aria-hidden="true"
        ></div>

        <div class="vz-stack__timeline">
          <div class="vz-stack__line" data-stack-line>
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
            <div>
              <p>{{ group.description }}</p>
              <div><span v-for="item in group.items" :key="item">{{ item }}</span></div>
            </div>
          </article>
        </div>

        <div class="vz-scroll-hint" data-stack-hint>
          <span>{{ copy.hint[0] }}</span><span>↓</span><span>{{ copy.hint[1] }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useLandingStackScroll } from "~/composables/landing/useLandingStackScroll";

type StackGroup = { title: string; description: string; items: string[] };
type StackCopy = { label: string; title: string; meta: string; hint: [string, string] };

const props = defineProps<{ groups: StackGroup[]; copy: StackCopy }>();
const emit = defineEmits<{
  activeChange: [index: number, progress: number];
  sphereReady: [element: HTMLElement];
}>();

const rootRef = ref<HTMLElement | null>(null);
const sphereRef = ref<HTMLElement | null>(null);
const itemCount = computed(() => props.groups.length);
const total = computed(() => String(props.groups.length).padStart(2, "0"));
const { activeIndex, progress, scrollToIndex } = useLandingStackScroll(
  rootRef,
  itemCount,
  (index, value) => emit("activeChange", index, value),
);
const counter = computed(() => String(activeIndex.value + 1).padStart(2, "0"));
const activeLayer = computed(() => {
  const title = props.groups[activeIndex.value]?.title?.toLowerCase() || "frontend";
  if (title.includes("backend")) return "core";
  if (title.includes("devops")) return "bridge";
  if (title.includes("mobile")) return "all";
  return "surface";
});

onMounted(() => {
  if (sphereRef.value) emit("sphereReady", sphereRef.value);
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
</style>
