<template>
  <section v-if="service" class="service-hero">
    <div class="container">
      <div class="service-hero__content">
        <h1>{{service.name}}</h1>
        <p class="service-hero__subtitle">{{service.description}}</p>
        <p class="service-hero__price">от {{service.price_from}} {{service.price_currency}}</p>
        <button
            @click="$emit('openModal')"
            class="btn btn-primary hidden sm:inline-block"
        >
          {{ $t('services.discuss_project') }}
        </button>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
  import type {IService} from "~/utils/interfaces/IService";

  defineProps<{
    service: IService | null
  }>()

  defineEmits(['openModal'])
</script>
<style scoped>
.service-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 150px 20px 80px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.service-hero__content {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.service-hero h1 {
  font-size: clamp(2.5rem, 5vw, 4rem);
  margin-bottom: 20px;
}

.service-hero__subtitle {
  font-size: 1.3rem;
  color: var(--text-dim);
  margin-bottom: 15px;
}

.service-hero__price {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2rem;
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 30px;
}
</style>