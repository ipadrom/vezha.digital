<template>
  <section id="stages" class="section">
    <div class="container-main">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>{{ $t('stages.title') }}<span class="bracket">/&gt;</span>
      </h2>

      <div class="stages-timeline stages-desktop">
        <StarfieldParallax/>
        <WorkStagesContent
          :stages="stages"
        />
      </div>
    </div>

    <!-- Mobile view -->
    <div class="stages-mobile">
      <div class="stages-list">
        <div
            v-for="stage in stages"
            :key="stage.id"
            :class="['stage-item', { active: activeStage === stage.step_number }]"
            @click="activeStage = stage.step_number"
        >
          <div class="stage-item__number">{{ String(stage.step_number).padStart(2, '0') }}</div>
          <div class="stage-item__title">{{ stage.title }}</div>
        </div>
      </div>
      <div class="stages-description">
        <Transition name="fade" mode="out-in">
          <div :key="activeStage" class="description-content">
            <p>{{ stages.find(s => s.step_number === activeStage)?.description }}</p>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import WorkStagesContent from "~/components/ui/work-stages-content/WorkStagesContent.vue";
import StarfieldParallax from "~/components/ui/3d/StarfieldParallax.vue";
import type {IWorkStages} from "~/utils/interfaces/IWorkStages";

defineProps<{
  stages: IWorkStages[]
}>()

const activeStage = ref(1)
</script>

<style scoped>
.stages-timeline {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  gap: 40px;
  overflow-x: visible;
  width: 100%;
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

  .stages-mobile {
    display: grid;
    grid-template-columns: 40% 60%;
    gap: 15px;
    min-height: 300px;
  }

  .stages-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .stage-item {
    background: transparent;
    border: none;
    border-left: 3px solid transparent;
    padding: 10px 0 10px 15px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stage-item.active {
    border-left-color: var(--accent);
    box-shadow: -10px 0 15px -5px rgba(0, 255, 65, 0.3);
  }

  .stage-item:hover {
    border-left-color: var(--accent);
  }

  .stage-item__number {
    font-family: var(--font-epilepsy);
    font-size: 2rem;
    color: var(--accent);
    font-weight: 700;
    text-align: left;
  }

  .stage-item__title {
    font-family: var(--font-epilepsy);
    font-size: 0.85rem;
    line-height: 1.3;
    color: #e0e0e0;
    text-align: left;
    font-weight: 700;
  }

  .stages-description {
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    padding: 20px;
    display: flex;
    align-items: flex-start;
  }

  .description-content {
    color: #e0e0e0;
    line-height: 1.6;
    font-size: 0.9rem;
  }

  .description-content p {
    margin: 0;
  }
}
</style>
