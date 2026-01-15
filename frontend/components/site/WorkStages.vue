<template>
  <section id="stages" class="section">
    <div class="container-main">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>{{ $t('stages.title') }}<span class="bracket">/&gt;</span>
      </h2>

      <div class="stages-timeline">
        <div v-for="stage in stages" :key="stage.id" class="stage-wrapper">
          <div class="stage-title">
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

.stages-timeline::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-image: radial-gradient(circle, var(--accent) 1px, transparent 1px);
  background-size: 8px 1px;
  background-position: 0 0;
  background-repeat: repeat-x;
  z-index: 0;
  transform: translateY(-50%);
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
  margin-bottom: 10px;
  font-size: 1rem;
  text-align: center;
  font-family: var(--font-pixel);
  color: var(--text);
}

.stage-number {
  font-size: 2.5rem;
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-pixel);
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
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-secondary);
  border: 1px solid var(--accent);
  padding: 25px;
  width: 350px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
  z-index: 3;
  max-height: 400px;
  box-shadow: 0 0 20px var(--shadow);
  margin-top: 10px;
  overflow: hidden;
}

.stage-wrapper:hover .stage-overlay {
  opacity: 1;
  visibility: visible;
}

.stage-info {
  color: var(--text-dim);
  line-height: 1.6;
  width: 100%;
}

.stage-info .duration {
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
  color: var(--text-dim);
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

  .stages-timeline::before {
    display: none;
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
