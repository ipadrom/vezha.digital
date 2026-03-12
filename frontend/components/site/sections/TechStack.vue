<template>
  <section
      id="stack"
      class="section"
      ref="techStackRef"
  >
    <div class="who-we-are">

        <!-- Left: title + text (всегда в DOM для корректного sticky) -->
        <div class="who-we-are__left">
          <h2 class="section-title who-we-are__title">
            Кто мы <span class="bracket">&gt;</span>
          </h2>
          <div class="who-we-are__text">
            <p>{{ aboutUs.description }}</p>
            <p>{{ aboutUs.since_description }}</p>
          </div>
        </div>

        <!-- Right: horizontal icon cards -->
        <div class="who-we-are__right">
          <div v-if="isSectionVisible" class="icon-cards">

            <div class="icon-card" :style="{ '--enter-delay': '0ms' }">
              <div class="icon-card__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
              </div>
              <p class="icon-card__label">На 20–30% дешевле других агентств</p>
            </div>

            <div class="icon-card" :style="{ '--enter-delay': '150ms' }">
              <div class="icon-card__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>
              </div>
              <p class="icon-card__label">2 дня от обсуждения до старта работы</p>
            </div>

            <div class="icon-card" :style="{ '--enter-delay': '300ms' }">
              <div class="icon-card__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
              </div>
              <p class="icon-card__label">Полный цикл разработки от идеи до запуска</p>
            </div>

            <div class="icon-card" :style="{ '--enter-delay': '450ms' }">
              <div class="icon-card__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.8V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M9 17v-2a2 2 0 0 0-4 0v2"/><rect width="8" height="5" x="3" y="17" rx="1"/></svg>
              </div>
              <p class="icon-card__label">Соответствие 152-ФЗ о персональных данных</p>
            </div>

            <div class="icon-card" :style="{ '--enter-delay': '600ms' }">
              <div class="icon-card__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/></svg>
              </div>
              <p class="icon-card__label">Поэтапная оплата, платите за результат</p>
            </div>

            <div class="icon-card" :style="{ '--enter-delay': '750ms' }">
              <div class="icon-card__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M12 2v4"/><path d="M16 2v4"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M20 12v2"/><path d="M20 18v2a2 2 0 0 1-2 2h-1"/><path d="M13 22h-2"/><path d="M7 22H6a2 2 0 0 1-2-2v-2"/><path d="M4 14v-2"/><path d="M4 8V6a2 2 0 0 1 2-2h2"/><path d="M8 10h6"/><path d="M8 14h8"/><path d="M8 18h5"/></svg>
              </div>
              <p class="icon-card__label">Макет и ТЗ до подписания договора</p>
            </div>

          </div>
        </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { useSectionVisible } from "~/composables/useSectionVisible";

const { isSectionVisible, targetRef: techStackRef } = useSectionVisible(0.1)

const aboutUs = {
  description: 'Мы небольшая команда — каждый проект ведёт конкретный человек, а не безликий менеджер. Специализируемся на Telegram Mini Apps, сайтах и корпоративных системах. Погружаемся в задачу, предлагаем решения, а не просто выполняем ТЗ.',
  since_description: 'Нам важно одно — чтобы то, что мы делаем, реально работало и приносило результат. Не берём проекты ради галочки и не исчезаем после сдачи.'
}

</script>

<style scoped>
.who-we-are {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(30px, 3.125vw, 80px);
  align-items: start;
  padding: 0 3.125vw;
}

/* Left */
.who-we-are__left {
  position: sticky;
  top: 80px;
  align-self: start;
}

.who-we-are__title {
  text-align: left;
  margin-top: 0;
  margin-bottom: clamp(16px, 1.25vw, 32px);
}

.who-we-are__text {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.who-we-are__text p {
  color: #e0e0e0;
  font-family: var(--font-inter);
  font-size: 1.5vw;
  line-height: 1.8;
  font-weight: 400;
}

/* Right: icon cards grid */
.icon-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(10px, 0.83vw, 24px);
}

.icon-card {
  display: flex;
  align-items: center;
  gap: clamp(12px, 1.04vw, 28px);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 1vw 1.5vw;
  position: relative;
  box-shadow: -10px 0 15px -5px rgba(0, 229, 255, 0.15);
  opacity: 0;
  animation: iconFadeUp 0.5s ease-out forwards;
  animation-delay: var(--enter-delay, 0s);
  transition: border-color 0.3s;
}

.icon-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}

.icon-card:hover {
  border-color: rgba(0, 229, 255, 0.3);
}

.icon-card__icon {
  color: var(--accent);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 6px rgba(0, 229, 255, 0.4));
}

.icon-card__label {
  font-family: var(--font-inter);
  font-size: 1.2vw;
  font-weight: 600;
  color: #e0e0e0;
  line-height: 1.8;
}

@keyframes iconFadeUp {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 900px) {
  .section {
    margin-bottom: 20px;
  }

  .who-we-are {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0 20px;
  }

  .who-we-are__left {
    position: static;
  }

  .who-we-are__title {
    text-align: left;
  }

  .who-we-are__text p {
    font-size: 0.95rem;
    line-height: 1.8;
  }

  .icon-cards {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .icon-card {
    padding: 12px 14px;
    gap: 10px;
  }

  .icon-card__icon svg {
    width: 22px;
    height: 22px;
  }

  .icon-card__label {
    font-size: 0.78rem;
    line-height: 1.4;
  }
}
</style>
