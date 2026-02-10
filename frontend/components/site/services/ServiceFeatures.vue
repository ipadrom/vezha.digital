<template>
  <section class="section">
    <div class="container">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>
        Что входит в услугу
        <span class="bracket">/&gt;</span>
      </h2>
      <div class="features-grid stages-desktop">
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

    <!-- Mobile view -->
    <div class="stages-mobile">
      <div class="stages-list">
        <div
            v-for="item in items"
            :key="item.id"
            :class="['stage-item', { active: activeItem === item.title }]"
            @click="activeItem = item.title"
        >
          <div class="stage-item__number">{{ String(item.title).padStart(2, '0') }}</div>
        </div>
      </div>
      <div class="stages-description">
        <Transition name="fade" mode="out-in">
          <div :key="activeItem" class="description-content">
            <p>{{ items.find(t => t.title === activeItem)?.description }}</p>
          </div>
        </Transition>
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

const activeItem = ref('')
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

.feature-card p {
  color: #e0e0e0;
  line-height: 1.6;
}

.stages-mobile {
  display: none;
}

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
    font-size: 1rem;
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

  .stages-desktop {
    display: none !important;
  }
}
</style>