<template>
  <section
      id="advantages"
      class="section"
      ref="advantagesRef"
  >
    <div class="container-main">
      <div class="advantages-layout">

        <div class="advantages-left fade-item" :style="{ '--enter-delay': '0ms' }">
          <h2 class="section-title advantages-title">
            {{ $t('advantages.title') }} <span class="bracket">&gt;</span>
          </h2>
          <p class="advantages-subtitle">{{ $t('advantages.subtitle') }}</p>

          <TransitionGroup name="tags" tag="div" class="advantages-tags">
            <span v-for="tag in activeTags" :key="tag" class="advantages-tag">
              {{ tag }}
            </span>
          </TransitionGroup>
        </div>

        <TransitionGroup
            v-if="isSectionVisible"
            name="advantage"
            tag="div"
            class="advantages-right advantages-desktop"
            appear
        >
          <div
              v-for="(advantage, index) in advantages"
              :key="advantage.id"
              class="accordion-card-wrapper fade-item"
              :style="{ '--enter-delay': `${index * 300}ms`}"
              @mouseenter="activeIndex = index"
          >
            <Card
                :title="advantage.title"
                :description="advantage.description"
                :class="{ 'accordion-card--active': activeIndex === index }"
                class="advantages-card-custom"
            />
          </div>
        </TransitionGroup>

        <AdvantagesMobile/>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {useSectionVisible} from "~/composables/useSectionVisible";
import Card from "~/components/ui/cards/Card.vue";
import type {IAdvantages} from "~/utils/interfaces/IAdvantages";
import type {IClientType} from "~/utils/interfaces/IClientTypes";
import AdvantagesMobile from "~/components/mobile-view/AdvantagesMobile.vue";
const { isSectionVisible, targetRef: advantagesRef } = useSectionVisible( 0.1)

defineProps<{
  advantages: IAdvantages[],
  clientTypes: IClientType[]
}>()

const activeIndex = ref(0)

const tagsByIndex: Record<number, string[]> = {
  0: [
    'Лендинг для фотографа',
    'Сайт-портфолио',
    'Бот для записи',
    'Мини-магазин в Telegram',
    'Личный AI-ассистент',
  ],
  1: [
    'CRM для стоматологии',
    'Мини-апп для магазина цветов',
    'Бот для автоматизации заявок',
    'Интернет-магазин одежды',
    'Система бронирования',
  ],
  2: [
    'CRM-система для завода',
    'Telegram Mini App для банка',
    'Интерактивный лендинг',
    'Корпоративный квест',
    'AI-помощник для сотрудников',
  ],
}

const activeTags = computed(() => tagsByIndex[activeIndex.value] ?? [])
</script>

<style scoped>
.advantages-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;
  margin-top: 10rem;
}

.advantages-mobile{
  display: none;
}

.advantages-right {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

:deep(.advantages-card-custom) {
  padding: 24px 30px !important;
  cursor: pointer;

}

:deep(.advantages-card-custom h3) {
  font-size: 1.8rem;
  margin-bottom: 14px;
}

:deep(.advantages-card-custom.accordion-card--active) {
  border-color: var(--accent);
  box-shadow:
      inset 0 0 0 3px var(--accent),
      0 0 15px var(--accent);
}

.advantages-left {
  position: sticky;
  top: 80px;
  align-self: start;
}

.advantages-title {
  text-align: left;
  margin-top: 0;
  margin-bottom: 16px;
  white-space: nowrap;
}

.advantages-subtitle {
  color: #b0b0b0;
  font-family: var(--font-inter);
  font-size: 0.95rem;
  margin-bottom: 32px;
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

.advantages-subtitle {
  color: #b0b0b0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  margin-bottom: 32px;
}

.advantage__details p {
  color: #e0e0e0;
  line-height: 1.8;
}

.advantages-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  position: relative;
  min-height: 80px;
}

.advantages-tag {
  display: inline-block;
  padding: 5px 14px;
  border: 2px solid var(--accent);
  background: var(--accent);
  color: var(--bg);
  font-family: var(--font-inter);
  font-size: 0.85rem;
}

.tags-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tags-leave-active {
  transition: opacity 0.2s ease;
  position: absolute;
}
.tags-enter-from {
  opacity: 0;
}
.tags-leave-to {
  opacity: 0;
}

.fade-item {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
  animation: cardRevealDown 0.9s ease-out forwards;
  animation-delay: var(--enter-delay, 0s);
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

@media (max-width: 900px) {
  .advantages-desktop {
    display: none;
  }

  .advantages-subtitle{
    display: none;
  }

  .advantages-tags{
    display: none;
  }

  .advantages-mobile {
    display: block;
  }

  .advantages-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .advantages-left{
    position: static;
  }

  .advantages-title {
    font-size: clamp(2rem, 8vw, 3rem);
  }
}
</style>
