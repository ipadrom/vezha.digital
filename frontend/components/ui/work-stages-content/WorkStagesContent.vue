<template>
  <section class="process" ref="container">
    <svg
        class="process__svg"
        viewBox="0 0 1100 300"
        preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <path
          d="M 80 190 L 250 100 L 410 210 L 550 90 L 710 200 L 870 95 L 1030 185"
          fill="none"
          stroke="#00E5FF"
          stroke-width="1.5"
          opacity="0.35"
          filter="url(#glow)"
      />
    </svg>

    <div
        v-for="(stage, index) in props.stages"
        :key="stage.id"
        class="step"
        :class="{ active: index === activeIndex }"
        :style="getStepStyle(index)"
        @mouseenter="activeIndex = index"
    >
      <div class="dot"></div>
      <div class="step__content">
        <span class="num">{{ stage.step_number }}</span>
        <span class="label">{{ stage.title }}</span>
      </div>

      <div v-if="activeIndex === index" class="tooltip">
        <Card
          :title="stage.title"
          :description="stage.description"
          :duration="stage.duration"
          :details="stage.details"
          :features="stage.features"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import Card from "~/components/ui/cards/Card.vue";
import IWorkStages from "~/utils/interfaces/IWorkStages.js";

const container = ref(null);
const activeIndex = ref(0);
const scale = ref(1);

const props = defineProps<{
  stages: IWorkStages[]
}>();

const coords = [
  { x: 80, y: 190 },
  { x: 250, y: 100 },
  { x: 410, y: 210 },
  { x: 550, y: 90 },
  { x: 710, y: 200 },
  { x: 870, y: 95 },
  { x: 1030, y: 185 }
];

const stages = ref([]);

const updateScale = () => {
  if (container.value) {
    scale.value = container.value.offsetWidth / 1100;
  }
};

const getStepStyle = (index) => {
  const point = coords[index];
  return {
    left: `${point.x * scale.value}px`,
    top: `${point.y * scale.value}px`,
    position: 'absolute',
    transform: 'translate(-50%, -50%)'
  };
};

onMounted(() => {
  updateScale();
  window.addEventListener("resize", updateScale);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateScale);
});
</script>

<style scoped>
.process {
  position: relative;
  width: 100%;
  max-width: 1100px;
  margin: 100px auto;
  aspect-ratio: 1100 / 300;
}

.process__svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.step {
  position: absolute;
  z-index: 2;
  cursor: pointer;
}

.step::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  transform: translate(-50%, -50%);
  background: var(--accent, #00eaff);
  border-radius: 50%;
  opacity: 0;
  filter: blur(8px);
  z-index: 0;
}

.step.active::before,
.step:hover::before {
  opacity: 0.15;
}

.step .dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--accent, #00eaff);
  background: none;
  box-shadow: 0 0 8px var(--accent, #00eaff);
  z-index: 1;
  position: relative;
}

.step .dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 14px;
  height: 14px;
  transform: translate(-50%, -50%);
  background: var(--accent, #00eaff);
  border-radius: 50%;
  filter: drop-shadow(0 0 5px var(--accent, #00eaff));
}

.step.active .dot,
.step:hover .dot {
  border-width: 2.5px;
  box-shadow: 0 0 12px var(--accent, #00eaff);
}

.step__content {
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  white-space: nowrap;
}

.num {
  display: block;
  color: #00eaff;
  font-weight: bold;
  font-size: 12px;
}

.label {
  display: block;
  font-size: 13px;
  color: white;
  opacity: 0.8;
}

.tooltip {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  z-index: 10;
  pointer-events: none;
}

.tooltip :deep(h3) {
  font-size: 0.9rem;
}

.tooltip :deep(p){
  font-size: 0.75rem;
}
</style>