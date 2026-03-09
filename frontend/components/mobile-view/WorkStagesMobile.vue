<template>
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
</template>

<script setup lang="ts">
import {ref} from "vue";
import type {IWorkStages} from "~/utils/interfaces/IWorkStages";

const activeStage = ref(1)

defineProps<{
  stages: IWorkStages[]
}>()

</script>

<style scoped>
@media (max-width: 768px) {
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
}
</style>