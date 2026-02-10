<template>
  <div class="card fade-item">
    <h3 class="font-bold fade-item">
      {{title}}
    </h3>
    <p class="fade-item">
      {{description}}
    </p>
    <p class="fade-item">
      {{since_description}}
    </p>

    <slot/>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title?: String,
    description?: String,
    since_description?: String,
  }>()
</script>

<style scoped>
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 30px;
  border-radius: 0;
  flex-grow: 1;
  height: auto;
  width: auto;

  box-shadow:
      -10px 0 15px -5px
      rgba(0, 255, 65, 0.3);
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;

  width: 4px;
  height: 0;

  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);

  animation: scanLineDown 0.6s ease-out forwards;
}

.card h3 {
  font-family: var(--font-epilepsy);
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: var(--accent);
}

.card p {
  color: #e0e0e0;
  line-height: 1.8;
  margin-bottom: 15px;
}

.card p:last-child {
  margin-bottom: 0;
}

@keyframes cardRevealDown {
  0% {
    opacity: 0;
    transform: translateY(-20px);
    clip-path: inset(0 0 100% 0);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    clip-path: inset(0 0 0 0);
  }
}

@keyframes scanLineDown {
  to {
    height: 100%;
  }
}

.fade-item {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
  animation: cardRevealDown 0.9s ease-out forwards;
  animation-delay: var(--enter-delay, 0s);
}
</style>