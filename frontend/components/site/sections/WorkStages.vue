<template>
  <section id="stages" class="section">
    <div class="container-main">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>{{ $t('stages.title') }}<span class="bracket">/&gt;</span>
      </h2>

      <div class="stages-timeline stages-desktop">
        <div v-for="stage in stages" :key="stage.id" class="stage-wrapper">
          <div class="stage-title section-title">
            <span class="bracket">&lt;</span>{{ stage.title }}<span class="bracket">/&gt;</span>
          </div>
          <div class="stage-number">
            <span class="bracket">&lt;</span>{{ String(stage.step_number).padStart(2, '0') }}<span class="bracket">&gt;</span>
          </div>
          <div class="stage-brief">{{ stage.description }}</div>
          <div class="stage-overlay">
            <div class="stage-info">
              <p v-if="stage.duration" class="duration">Длительность: {{ stage.duration }}</p>
              <p v-if="stage.details" class="info">{{ stage.details }}</p>
              <div v-if="stage.features && stage.features.length">
                <p><strong>Что входит:</strong></p>
                <ul>
                  <li v-for="(feature, idx) in stage.features" :key="idx">{{ feature }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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
defineProps<{
  stages: any[]
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

.stage-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 220px;
  z-index: 1;
  flex: 0 1 auto;
}

.stage-title {
  font-family: var(--font-epilepsy);
  margin-bottom: 10px;
  font-size: 1.2rem;
  text-align: center;
}

.stage-number {
  font-family: var(--font-epilepsy);
  font-size: 2.5rem;
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 10px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.stage-number:hover {
  animation: glitch 0.3s infinite;
}

.stage-brief {
  color: var(--text-dim);
  text-align: center;
  margin-bottom: 15px;
  font-size: 0.9rem;
  line-height: 1.4;
  max-width: 200px;
}

.stage-overlay {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-secondary);
  border: 3px solid var(--accent);
  padding: 25px;
  width: 350px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
  z-index: 1000;
  max-height: calc(100vh - 120px);
  overflow-y: hidden;
  color: #e0e0e0;
  border-radius: 0;
}

.stage-wrapper:hover .stage-overlay {
  opacity: 1;
  visibility: visible;
}

.stage-wrapper:hover {
  z-index: 1;
}

.stage-info {
  color: #e0e0e0;
  line-height: 1.6;
  width: 100%;
}

.stage-info .duration {
  font-family: var(--font-epilepsy);
  color: var(--accent);
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 0.9rem;
}

.stage-info .info {
  margin-bottom: 15px;
}

.stage-info ul {
  list-style: none;
  margin-top: 8px;
  padding: 0;
}

.stage-info ul li {
  color: #e0e0e0;
  padding: 3px 0 3px 15px;
  position: relative;
  font-size: 0.85rem;
}

.stage-info ul li::before {
  content: '>';
  position: absolute;
  left: 0;
  color: var(--accent);
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
