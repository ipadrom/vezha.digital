<template>
  <section
      id="advantages"
      class="section"
      ref="advantagesRef"
  >
    <div class="advantages-layout">

        <!-- Left: big title + tags -->
        <div class="advantages-left fade-item" :style="{ '--enter-delay': '0ms' }">
          <h2 class="section-title advantages-title">
            {{ $t('advantages.title') }} <span class="bracket">&gt;</span>
          </h2>
          <!-- Tags for active card -->
          <TransitionGroup name="tags" tag="div" class="advantages-tags">
            <span
              v-for="tag in activeTags"
              :key="tag"
              class="advantages-tag"
            >{{ tag }}</span>
          </TransitionGroup>
        </div>

        <!-- Right: always-open cards with hover (desktop) -->
        <div v-if="isSectionVisible" class="advantages-right advantages-desktop-only">
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

        <!-- Mobile: tabs + single card + tags -->
        <div v-if="isSectionVisible" class="advantages-mobile-only">
          <!-- Tab buttons -->
          <div class="adv-tabs">
            <button
              v-for="(advantage, index) in advantages"
              :key="advantage.id"
              class="adv-tab"
              :class="{ active: activeIndex === index }"
              @click="hoverCard(index)"
            >{{ advantage.title }}</button>
          </div>

          <!-- Active card with tags inside -->
          <Transition name="fade" mode="out-in">
            <div :key="activeIndex" class="adv-card">
              <h3 class="adv-card__title">{{ advantages[activeIndex]?.title }}</h3>
              <p class="adv-card__desc">{{ advantages[activeIndex]?.description }}</p>
              <div class="adv-mobile-tags">
                <span
                  v-for="tag in activeTags.slice(0, 3)"
                  :key="tag"
                  class="adv-mobile-tag"
                >{{ tag }}</span>
              </div>
            </div>
          </Transition>
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
  padding: 0 3.125vw;
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

/* Tags */
.advantages-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
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
  font-size: 1.2vw;
  font-weight: 600;
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
  padding: 1vw 2vw;
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
  box-shadow: -10px 0 20px -5px rgba(0, 229, 255, 0.25);
}

.accordion-card__title {
  font-family: var(--font-inter);
  font-size: 3vw;
  font-weight: 800;
  color: var(--accent);
  margin-bottom: 14px;
  line-height: 1.2;
}

.accordion-card__description {
  color: #e0e0e0;
  line-height: 1.8;
  font-family: var(--font-inter);
  font-size: 1.2vw;
  font-weight: 400;
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

/* Mobile show/hide */
.advantages-mobile-only { display: none; }
.advantages-desktop-only { display: flex; flex-direction: column; gap: 12px; }

@media (max-width: 900px) {
  .advantages-layout {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0 20px;
  }

  .advantages-left {
    position: static;
  }

  .advantages-title {
    font-size: clamp(2rem, 4vw, 3rem);
    text-align: left;
    white-space: normal;
    margin-bottom: 16px;
  }

  /* Hide tags on left column on mobile (tags shown below card) */
  .advantages-tags {
    display: none;
  }

  .advantages-desktop-only { display: none; }
  .advantages-mobile-only { display: flex; flex-direction: column; gap: 14px; }

  /* Tab buttons row */
  .adv-tabs {
    display: flex;
    gap: 8px;
  }

  .adv-tab {
    flex: 1;
    padding: 10px 6px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: #e0e0e0;
    font-family: var(--font-inter);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
    text-align: center;
    line-height: 1.3;
  }

  .adv-tab.active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--bg);
  }

  /* Content card */
  .adv-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: 18px 20px 18px 24px;
    position: relative;
    overflow: hidden;
  }

  .adv-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent);
  }

  .adv-card__title {
    font-family: var(--font-inter);
    font-size: 1.3rem;
    font-weight: bold;
    color: var(--accent);
    margin: 0 0 10px 0;
  }

  .adv-card__desc {
    font-family: var(--font-inter);
    font-size: 0.83rem;
    color: #e0e0e0;
    line-height: 1.7;
    margin: 0;
  }

  /* Tags row inside card — стиль как в блоке Стек */
  .adv-mobile-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 14px;
  }

  .adv-mobile-tag {
    display: inline-block;
    padding: 4px 12px;
    border: 2px solid var(--accent);
    background: var(--accent);
    color: var(--bg);
    font-family: var(--font-inter);
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* Fade transition */
  .fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
}
</style>
