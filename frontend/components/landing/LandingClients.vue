<template>
  <section id="clients" class="vz-clients">
    <div class="vz-clients__grid" data-clients-grid>
      <div class="vz-clients__head">
        <div class="vz-section-label">
          <span>{{ copy.label }}</span>
          <i>/</i>
          <span data-secnum>04</span>
        </div>
        <h2 :aria-label="copy.title">
          <span aria-hidden="true">
            <span data-reveal>
              <span
                v-for="line in copy.titleLines || [copy.title]"
                :key="line"
                class="vz-clients__title-line"
              >{{ line }}</span>
            </span>
          </span>
        </h2>
      </div>
      <div
        class="vz-client-interactive"
        :style="{ '--active-client-index': activeIndex }"
      >
        <div class="vz-client-capsules" role="tablist" :aria-label="copy.tabAria">
          <button
            v-for="(segment, index) in segments"
            :id="`client-tab-${segment.key}`"
            :key="segment.key"
            :aria-controls="`client-panel-${segment.key}`"
            :aria-selected="activeIndex === index"
            :class="{ 'is-active': activeIndex === index }"
            role="tab"
            type="button"
            @click="$emit('update:activeIndex', index)"
            @focus="$emit('update:activeIndex', index)"
          >
            {{ segment.label }}
          </button>
        </div>

        <div class="vz-client-connector" aria-hidden="true">
          <span></span>
        </div>

        <article
          :id="`client-panel-${activeClient.key}`"
          :aria-labelledby="`client-tab-${activeClient.key}`"
          class="vz-client-copy"
          role="tabpanel"
        >
          <span>{{ activeClient.eyebrow }}</span>
          <h3>{{ activeClient.title }}</h3>
          <div class="vz-client-card-reserve">
            <div
              ref="cardSlotRef"
              class="vz-client-card-slot"
              :class="{ 'is-height-ready': isCardHeightReady }"
              :style="cardSlotStyle"
              @transitionend="handleCardTransitionEnd"
            >
              <p
                :key="activeClient.key"
                ref="cardTextRef"
                class="vz-client-card-text"
              >
                {{ activeClient.text }}
              </p>
            </div>
            <p
              v-for="segment in segments"
              :key="`client-card-reserve-${segment.key}`"
              class="vz-client-card-sizer"
              aria-hidden="true"
            >
              {{ segment.text }}
            </p>
          </div>
        </article>
      </div>
      <div
        ref="cubeRef"
        class="vz-client-cube-field"
        :data-client-cube-stage="activeClient.key"
        aria-hidden="true"
      ></div>
    </div>
  </section>
</template>

<script setup lang="ts">
type ClientSegment = {
  key: string;
  label: string;
  eyebrow: string;
  title: string;
  text: string;
};

const props = defineProps<{
  copy: {
    label: string;
    title: string;
    titleLines?: string[];
    tabAria: string;
  };
  segments: ClientSegment[];
  activeIndex: number;
}>();

const emit = defineEmits<{
  "update:activeIndex": [index: number];
  cubeReady: [element: HTMLElement | null];
  layoutChange: [];
}>();

const cubeRef = ref<HTMLElement | null>(null);
const cardSlotRef = ref<HTMLElement | null>(null);
const cardTextRef = ref<HTMLElement | null>(null);
const cardHeight = ref<number | null>(null);
const isCardHeightReady = ref(false);
let cardResizeObserver: ResizeObserver | null = null;
let cardReadyFrame = 0;
const activeClient = computed<ClientSegment>(() => props.segments[props.activeIndex] || props.segments[0]!);
const cardSlotStyle = computed(() => (
  cardHeight.value === null
    ? undefined
    : { "--client-card-height": `${cardHeight.value}px` }
));

function syncCardHeight() {
  const slot = cardSlotRef.value;
  const text = cardTextRef.value;
  if (!slot || !text) return;

  const style = getComputedStyle(slot);
  const verticalChrome = [
    style.paddingTop,
    style.paddingBottom,
    style.borderTopWidth,
    style.borderBottomWidth,
  ].reduce((total, value) => total + (Number.parseFloat(value) || 0), 0);
  // Use the unscaled layout height. getBoundingClientRect() includes the 2K
  // presentation zoom and would feed that visual size back into CSS a second time.
  const nextHeight = Math.round(text.scrollHeight + verticalChrome);
  if (nextHeight > 0 && nextHeight !== cardHeight.value) {
    cardHeight.value = nextHeight;
    void nextTick(() => emit("layoutChange"));
  }
}

function observeCardText(current: HTMLElement | null, previous?: HTMLElement | null) {
  if (previous) cardResizeObserver?.unobserve(previous);
  if (current) cardResizeObserver?.observe(current);
}

function handleCardTransitionEnd(event: TransitionEvent) {
  if (event.target === cardSlotRef.value && event.propertyName === "height") {
    emit("layoutChange");
  }
}

watch(cardTextRef, (current, previous) => {
  observeCardText(current, previous);
  void nextTick(syncCardHeight);
}, { flush: "post" });

watch(() => activeClient.value.text, () => {
  void nextTick(syncCardHeight);
}, { flush: "post" });

onMounted(async () => {
  emit("cubeReady", cubeRef.value);
  if ("ResizeObserver" in window) {
    cardResizeObserver = new ResizeObserver(syncCardHeight);
    observeCardText(cardTextRef.value);
  }
  await nextTick();
  syncCardHeight();
  cardReadyFrame = requestAnimationFrame(() => {
    isCardHeightReady.value = true;
  });
  void document.fonts?.ready.then(syncCardHeight);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(cardReadyFrame);
  cardResizeObserver?.disconnect();
  emit("cubeReady", null);
});
</script>
