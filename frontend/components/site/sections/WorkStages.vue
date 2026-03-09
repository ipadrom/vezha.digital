<template>
  <div class="container-main">
    <h2 class="section-title">
      <span class="bracket"></span>{{ $t('stages.title') }} <span class="bracket">&gt;</span>
    </h2>
  </div>

  <!-- Канвас во всю ширину секции -->
  <div class="stages-timeline-wrapper" ref="wrapperRef">
    <div class="stages-timeline stages-desktop">
      <StarfieldParallax class="stack-stars"/>
      <WorkStagesContent
          :stages="stages"
      />

      <!-- Scroll progress indicator -->
      <ScrollProgressIndicator
          :progress="scrollProgressNorm"
      />
    </div>
  </div>

    <WorkStagesMobile
        :stages="stages"
        class="stages-mobile"
    />
</template>

<script setup lang="ts">
import WorkStagesContent from "~/components/ui/work-stages-content/WorkStagesContent.vue";
import StarfieldParallax from "~/components/ui/3d/canvas/StarfieldParallax.vue";
import type {IWorkStages} from "~/utils/interfaces/IWorkStages";
import ScrollProgressIndicator from "~/components/ui/ScrollProgressIndicator.vue";
import {onBeforeUnmount, ref} from "vue";
import WorkStagesMobile from "~/components/mobile-view/WorkStagesMobile.vue";

defineProps<{
  stages: IWorkStages[]
}>()

const scrollProgressNorm = ref(0)
const wrapperRef = ref<HTMLElement | null>(null)

function onScroll() {
  const wrapper = wrapperRef.value
  if (!wrapper) return
  const rect     = wrapper.getBoundingClientRect()
  const viewH    = window.innerHeight
  const scrolled = -rect.top
  const total    = wrapper.offsetHeight - viewH
  scrollProgressNorm.value = total > 0
      ? Math.min(1, Math.max(0, scrolled / total))
      : 0
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.stages-timeline-wrapper{
  position: relative;
  width: 100%;
  height: 200vh;
}

.stages-timeline {
  top: 12rem;
  position: sticky;
  width: 100%;
  overflow: hidden;
  background: #060610;
}

.stack-stars {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.stage-wrapper:hover .stage-overlay {
  opacity: 1;
  visibility: visible;
}

.stage-wrapper:hover {
  z-index: 10;
}

.stages-mobile {
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes glitch {
  0% {
    text-shadow: 2px 2px var(--accent), -2px -2px #ff00ff;
  }
  25% {
    text-shadow: -2px 2px var(--accent), 2px -2px #ff00ff;
  }
  50% {
    text-shadow: 2px -2px var(--accent), -2px 2px #ff00ff;
  }
  75% {
    text-shadow: -2px -2px var(--accent), 2px 2px #ff00ff;
  }
  100% {
    text-shadow: 2px 2px var(--accent), -2px -2px #ff00ff;
  }
}

@media (max-width: 1024px) {
  .stages-timeline {
    flex-wrap: wrap;
    gap: 30px;
  }

  .stage-wrapper {
    min-width: calc(50% - 30px);
  }

  .stage-overlay {
    position: relative;
    top: 0;
    left: 0;
    transform: none;
    width: 100%;
    margin-top: 15px;
    opacity: 1;
    visibility: visible;
  }
}

@media (max-width: 768px) {
  .stages-timeline-wrapper {
    display: none;
  }

  .stages-mobile {
    display: block;
  }

  .stages-timeline {
    flex-direction: column;
    gap: 20px;
  }

  .stage-wrapper {
    width: 100%;
    min-width: auto;
  }

  .stages-desktop {
    display: none !important;
  }

  .description-content p {
    margin: 0;
  }
}
</style>
