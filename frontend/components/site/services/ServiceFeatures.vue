<template>
  <section class="section">
    <div class="container">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>
        Что входит в услугу
        <span class="bracket">/&gt;</span>
      </h2>
      <div class="features-grid">
        <Card
            v-for="item in items"
            :key="item.id"
            class="feature-card"
        >
          <h3>{{item.title}}</h3>
          <p>{{item.description}}</p>
        </Card>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {IServiceItems} from "~/utils/interfaces/IServices";
import Card from "~/components/ui/cards/Card.vue";

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

.feature-card:hover {
  border-color: var(--accent);
  box-shadow:
      inset 0 0 0 3px var(--accent),
      0 0 15px var(--accent);
  transform: translateY(-5px);
}

.feature-card p {
  color: #e0e0e0;
  line-height: 1.6;
}
</style>