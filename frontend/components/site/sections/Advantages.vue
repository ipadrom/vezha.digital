<template>
  <section
      id="advantages"
      class="section"
      ref="advantagesRef"
  >
    <div class="container-main">
      <div class="advantages-layout">

        <!-- Left: big title + tags -->
        <div class="advantages-left fade-item" :style="{ '--enter-delay': '0ms' }">
          <h2 class="section-title advantages-title">
            <span class="bracket">&lt;</span>{{ $t('advantages.title') }}<span class="bracket">/&gt;</span>
          </h2>
          <p class="advantages-subtitle">{{ $t('advantages.subtitle') }}</p>

          <!-- Tags for active card -->
          <TransitionGroup name="tags" tag="div" class="advantages-tags">
            <span
              v-for="tag in activeTags"
              :key="tag"
              class="advantages-tag"
            >{{ tag }}</span>
          </TransitionGroup>
        </div>

        <!-- Right: always-open cards with hover -->
        <div v-if="isSectionVisible" class="advantages-right">
          <div
            v-for="(advantage, index) in advantages"
            :key="advantage.id"
            class="accordion-card fade-item"
            :class="{ 'accordion-card--active': activeIndex === index }"
            :style="{ '--enter-delay': `${(index + 1) * 200}ms` }"
            @mouseenter="hoverCard(index)"
          >
            <h3 class="accordion-card__title">{{ advantage.title }}</h3>
            <p class="accordion-card__description">{{ advantage.description }}</p>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSectionVisible } from "~/composables/useSectionVisible";
const { isSectionVisible, targetRef: advantagesRef } = useSectionVisible(0.1)

defineProps<{
  advantages: any[]
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

function hoverCard(index: number) {
  activeIndex.value = index
}
</script>

<style scoped>
.advantages-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;
}

.advantages-left {
  position: sticky;
  top: 80px;
  align-self: start;
  /* Sticky корректно работает в CSS Grid: прилипает только внутри своей строки */
}

.advantages-title {
  text-align: left;
  margin-top: 0;
  margin-bottom: 16px;
}

.advantages-subtitle {
  color: #b0b0b0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  margin-bottom: 32px;
}

/* Tags */
.advantages-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  position: relative;
  min-height: 80px; /* фиксирует высоту пока старые теги уходят */
}

.advantages-tag {
  display: inline-block;
  padding: 5px 14px;
  border: 2px solid var(--accent);
  background: var(--accent);
  color: var(--bg);
  font-family: var(--font-epilepsy);
  font-size: 0.85rem;
}

/* Tags transition */
.tags-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tags-leave-active {
  transition: opacity 0.15s ease;
  position: absolute; /* убирает из потока — новые не дёргаются */
}
.tags-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
.tags-leave-to {
  opacity: 0;
}

/* Accordion cards */
.advantages-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.accordion-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 24px 30px;
  cursor: default;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.accordion-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}

.accordion-card--active {
  border-color: var(--accent);
  box-shadow: -10px 0 20px -5px rgba(0, 255, 65, 0.25);
}

.accordion-card__title {
  font-family: var(--font-epilepsy);
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--accent);
  margin-bottom: 14px;
  line-height: 1.2;
}

.accordion-card__description {
  color: #e0e0e0;
  line-height: 1.8;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
}

/* Appear animation */
.fade-item {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
  animation: cardRevealDown 0.9s ease-out forwards;
  animation-delay: var(--enter-delay, 0s);
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
  .advantages-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .advantages-left {
    position: static;
  }

  .advantages-title {
    font-size: clamp(2rem, 8vw, 3rem);
  }
}
</style>
