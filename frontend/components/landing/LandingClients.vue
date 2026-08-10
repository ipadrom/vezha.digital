<template>
  <section id="clients" class="vz-clients">
    <div class="vz-clients__grid" data-clients-grid>
      <div class="vz-clients__head">
        <div class="vz-section-label">
          <span>{{ copy.label }}</span>
          <i>/</i>
          <span data-secnum>04</span>
        </div>
        <h2><span><span data-reveal>{{ copy.title }}</span></span></h2>
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
          <span :key="`${activeClient.key}-eyebrow`">{{ activeClient.eyebrow }}</span>
          <h3 :key="`${activeClient.key}-title`">{{ activeClient.title }}</h3>
          <p :key="`${activeClient.key}-text`">{{ activeClient.text }}</p>
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
    tabAria: string;
  };
  segments: ClientSegment[];
  activeIndex: number;
}>();

const emit = defineEmits<{
  "update:activeIndex": [index: number];
  cubeReady: [element: HTMLElement | null];
}>();

const cubeRef = ref<HTMLElement | null>(null);
const activeClient = computed<ClientSegment>(() => props.segments[props.activeIndex] || props.segments[0]!);

onMounted(() => emit("cubeReady", cubeRef.value));
onBeforeUnmount(() => emit("cubeReady", null));
</script>
