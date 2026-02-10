<template>
  <div class="stage-overlay">
    <div class="stage-info">
      <p class="duration">Длительность: {{ duration }}</p>
      <p class="info">{{ details }}</p>
      <div>
        <p><strong>Что входит:</strong></p>
        <ul>
          <li v-for="(feature, idx) in features" :key="idx">
            {{ feature }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    duration?: string;
    details?: string;
    features: string[];
  }>()
</script>

<style scoped>
.stage-overlay {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-secondary);
  border: 3px solid var(--accent);
  padding: 25px;
  width: 350px;
  height: 315px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
  z-index: 1000;
  max-height: calc(100vh - 120px);
  overflow-y: hidden;
  color: #e0e0e0;
  border-radius: 0;
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
</style>