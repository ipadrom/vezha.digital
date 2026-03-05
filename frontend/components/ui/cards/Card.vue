<template>
  <div :class="['card', 'fade-item', { 'is-transparent': transparent }]">
    <div v-if="icon" class="card-icon-container">
      <img
          :src="icon"
          alt=""
          class="card-icon"
      />
    </div>

    <div class="card-body">
      <h3 v-if="title" class="font-bold">
        {{ title }}
      </h3>

      <div class="card-texts">
        <p v-if="description"
        >
          {{ description }}
        </p>
        <p v-if="since_description"
        >
          {{ since_description }}
        </p>
        <p v-if="duration"
        >
          {{ duration }}
        </p>
        <p v-if="details"
        >
          {{ details }}
        </p>
        <p v-if="points"
        >
          {{ points }}
        </p>
      </div>

      <slot/>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string,
  description?: string,
  since_description?: string,
  duration?: string,
  details?: string,
  points?: string,
  transparent?: boolean,
  icon?: string,
}>()
</script>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: row;
  gap: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 24px;
  height: 100%;
  box-shadow: -10px 0 15px -5px rgba(0, 229, 255, 0.15);
}

.card-icon-container {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  object-fit: contain;
  color: var(--accent);
}

.card-body {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card h3 {
  font-family: var(--font-inter);
  font-size: 1.5rem;
  margin-bottom: 12px;
  color: var(--accent);
  line-height: 1.2;
}

.card p {
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.card p:last-child {
  margin-bottom: 0;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
  animation: scanLineDown 0.6s ease-out forwards;
}

.card.is-transparent {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0;
}

.card.is-transparent::before {
  display: none;
}

.fade-item {
  animation: cardRevealDown 0.8s ease-out forwards;
}

@media (max-width: 768px) {
  .card {
    flex-direction: row;
    align-items: center;
    text-align: left;
    gap: 16px;
    padding: 10px;
  }

  .card p {
    line-height: 1.4;
    font-size: 0.75rem;
  }

  .card-icon {
    width: 32px;
    height: 32px;
    margin-top: 4px;
    align-items: center;
  }

  .card h3 {
    display: none;
  }
}
</style>