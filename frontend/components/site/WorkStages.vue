<template>
  <section id="stages" class="section">
    <div class="container-main">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>{{ $t('stages.title') }}<span class="bracket">/&gt;</span>
      </h2>

      <div class="stages-timeline">
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
  </section>
</template>

<script setup lang="ts">
defineProps<{
  stages: any[]
}>()
</script>

<style scoped>
.stages-timeline {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  gap: 40px;
  overflow-x: visible;
  padding: 40px 0;
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
  z-index: 2;
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
  top: 50%;
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
  max-height: 400px;
  overflow: hidden;
  color: #e0e0e0;
  border-radius: 0;
}

.stage-wrapper:hover .stage-overlay {
  opacity: 1;
  visibility: visible;
}

.stage-wrapper:hover {
  z-index: 2000;
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
}
</style>
