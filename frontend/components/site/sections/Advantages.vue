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

       <!-- Mobile tabs -->
      <div class="mobile-tabs">
        <button
          v-for="(tab, index) in mobileTabs"
          :key="index"
          :class="['mobile-tab', { active: activeTab === index }]"
          @click="activeTab = index"
        >
          {{ tab }}
        </button>
      </div>

      <TransitionGroup
          v-if="isSectionVisible"
          name="advantage"
          tag="div"
          class="advantages advantages-desktop"
          appear
      >
          <div 
              v-for="(advantage, index) in advantages"
              :key="advantage.id"
              class="advantage fade-item"
              :style="{ '--enter-delay': `${index * 500}ms`}"
          >
            <div class="advantage__main">
              <h3 class="font-bold fade-item" style="--enter-delay: 0.1s">{{ advantage.title }}</h3>
              <p class="advantage__subtitle fade-item" style="--enter-delay: 0.2s">{{ advantage.subtitle || advantage.description.substring(0, 50) + '...' }}</p>
            </div>
          </div>
      </TransitionGroup>

        <!-- Mobile view - single card based on active tab -->
      <div v-if="isSectionVisible && advantages.length" class="advantages advantages-mobile">
          <div
              v-for="(advantage, index) in advantages"
              :key="advantage.id"
              v-show="activeTab === index"
              class="advantage"
          >
            <div class="advantage__main">
              <h3 class="font-bold">{{ advantages[activeTab]?.title }}</h3>
              <p class="advantage__subtitle">{{ advantages[activeTab]?.subtitle }}</p>
            </div>
            <div class="advantage__details">
              <p>{{ advantages[activeTab]?.description }}</p>
            </div>
          </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import {useSectionVisible} from "~/composables/useSectionVisible";
const { isSectionVisible, targetRef: advantagesRef } = useSectionVisible( 0.1)

defineProps<{
  advantages: any[]
}>()


const activeTab = ref(0)
const mobileTabs = ['Частные клиенты', 'Малый/средний бизнес', 'Для гигантов']

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
      -10px 0 15px -5px
      rgba(0, 255, 65, 0.3);

  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.5s forwards;
  animation-delay: var(--enter-delay);
}

.advantage__main h3 {
  font-family: var(--font-epilepsy);
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: var(--accent);
}

.advantage__main p {
  color: #e0e0e0;
}

.advantage__subtitle {
  color: #b0b0b0;
  font-size: 0.95rem;
  font-style: italic;
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

.fade-item {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
  animation: cardRevealDown 0.9s ease-out forwards;
  animation-delay: var(--enter-delay, 0s);
}

.mobile-tabs {
  display: none;
}

.advantages-mobile {
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@media (max-width: 768px) {
  .advantages {
    grid-template-columns: 1fr;
  }

   .advantages-desktop {
    display: none !important;
  }

  .advantages-mobile {
    display: block;
  }
  
  .mobile-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }

  .mobile-tab {
    flex: 1;
    padding: 10px 8px;
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
    line-height: 1.2;
  }

  .mobile-tab.active {
    background: var(--accent);
    color: var(--bg);
    border-color: var(--accent);
  }

  .mobile-tab:hover {
    border-color: var(--accent);
  }

  .advantages-mobile .advantage {
    min-height: 280px;
  }
}
</style>
