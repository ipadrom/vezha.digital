<template>
  <section class="section">
    <div class="container">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>
        Что входит в услугу
        <span class="bracket">/&gt;</span>
      </h2>
      <div class="features-grid">
        <div
            v-for="item in items"
            :key="item.id"
            class="feature-card"
        >
          <h3>{{item.title}}</h3>
          <p>{{item.description}}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {IServiceItems} from "~/utils/interfaces/IServices";

defineProps<{
  items: IServiceItems[]
}>()
</script>

<style scoped>
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  justify-content: center;
  gap: 30px;
  margin: auto;
  max-width: 1100px;
}

.feature-card {
  max-width: 366px;
  max-height: 212px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  padding: 30px;
  transition: all 0.3s;
  cursor: pointer;

  box-shadow:
      -10px 0 15px -5px
      rgba(0, 255, 65, 0.3);
}

.feature-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--shadow);
  transform: translateY(-5px);
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  font-family: var(--font-epilepsy);
  color: var(--accent);
}

.feature-card p {
  color: #e0e0e0;
  line-height: 1.6;
}
</style>