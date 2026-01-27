<template>
  <section
      id="advantages"
      class="section"
      ref="advantagesRef"
  >
    <div class="container-main">
      <h2 class="section-title">
        <span class="bracket">&lt;</span>{{ $t('advantages.title') }}<span class="bracket">/&gt;</span>
      </h2>

      <TransitionGroup
          v-if="isSectionVisible"
          name="advantage"
          tag="div"
          class="advantages"
          appear
      >
          <div v-for="(advantage, index) in advantages"
               :key="advantage.id"
               class="advantage"
               :style="{ '--enter-delay': `${index * 600}ms`}"
          >
            <div class="advantage__main">
              <h3 class="font-bold">{{ advantage.title }}</h3>
              <p>{{ advantage.subtitle || advantage.description.substring(0, 50) + '...' }}</p>
            </div>
            <div class="advantage__details">
              <p>{{ advantage.description }}</p>
            </div>
          </div>
      </TransitionGroup>

    </div>
  </section>
</template>

<script setup lang="ts">
import {useSectionVisible} from "~/composables/useSectionVisible";
const { isSectionVisible, targetRef: advantagesRef } = useSectionVisible( 0.1)

defineProps<{
  advantages: any[]
}>()

</script>

<style scoped>
.advantages {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.advantage {
  background: var(--bg-secondary);
  border: 3px solid var(--border);
  border-left: 3px solid var(--accent);
  padding: 30px;
  transition: all 0.3s;
  cursor: default;
  min-height: auto;
  color: #e0e0e0;
  border-radius: 0;

  box-shadow:
      inset 0 0 0 var(--accent),
      0 0 6px rgba(0, 255, 65, 0.15);

  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.5s forwards;
  animation-delay: var(--enter-delay);
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.advantage__main h3 {
  font-family: var(--font-epilepsy);
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--accent);
}

.advantage__main p {
  color: #e0e0e0;
}

.advantage__details {
  max-height: none;
  opacity: 1;
  overflow: visible;
  transition: all 0.4s;
  margin-top: 20px;
}

.advantage__details p {
  color: #e0e0e0;
  line-height: 1.8;
}

@media (max-width: 768px) {
  .advantages {
    grid-template-columns: 1fr;
  }
}
</style>
