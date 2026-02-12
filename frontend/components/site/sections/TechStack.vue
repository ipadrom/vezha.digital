<template>
  <section
      id="stack"
      class="section"
      ref="techStackRef"
  >
    <div class="container-main">
      <div class="who-we-are">

        <!-- Left: title + text (всегда в DOM для корректного sticky) -->
        <div class="who-we-are__left">
          <h2 class="section-title who-we-are__title">
            <span class="bracket">&lt;</span>Кто мы<span class="bracket">/&gt;</span>
          </h2>
          <div class="who-we-are__text">
            <p>{{ aboutUs.description }}</p>
            <p>{{ aboutUs.since_description }}</p>
          </div>
        </div>

        <!-- Right: 2x2 stat cards -->
        <div class="who-we-are__right">
          <div v-if="isSectionVisible" class="stats-grid">
            <div
              v-for="(stat, index) in stats"
              :key="index"
              class="stat-card fade-in"
              :style="{ '--enter-delay': `${index * 150}ms` }"
            >
              <h3 class="stat-card__value">{{ stat.value }}</h3>
              <p class="stat-card__description">{{ stat.description }}</p>
            </div>
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
  description: 'Мы — команда опытных разработчиков, специализирующихся на создании современных веб-решений, Telegram Mini Apps и интеграции искусственного интеллекта. Наша миссия — превращать идеи в надёжные цифровые продукты.',
  since_description: 'Уделяем особое внимание качеству кода, юзабилити и скорости разработки. Остаёмся на связи после запуска.'
}

const stats = [
  {
    value: 'с 2016 года',
    description: 'Создаём сайты, сервисы и цифровые решения — для тех, кто требует качества, надёжности и результата'
  },
  {
    value: '95% проектов — «под ключ»',
    description: 'Прорабатываем всё: от дизайна и логики до SEO, интеграций и поддержки. Один подрядчик — весь цикл'
  },
  {
    value: 'от 14 до 45 дней',
    description: 'Среднее время запуска зависит от масштаба: от быстрых лендингов до сложных корпоративных решений'
  },
  {
    value: 'в 2–5 раз',
    description: 'Растёт доход клиентов благодаря грамотной упаковке, продуманной структуре и продвижению'
  },
]
</script>

<style scoped>
.who-we-are {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;
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
  margin-bottom: 24px;
}

.who-we-are__text {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.who-we-are__text p {
  color: #e0e0e0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  line-height: 1.8;
}

/* Right: 2x2 grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 24px;
  position: relative;
  box-shadow: -4px 0 0 0 var(--accent), -10px 0 15px -5px rgba(0, 255, 65, 0.2);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}

.stat-card__value {
  font-family: var(--font-epilepsy);
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--accent);
  margin-bottom: 12px;
  line-height: 1.2;
}

.stat-card__description {
  color: #e0e0e0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  line-height: 1.7;
}

/* Appear animation */
.fade-in {
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
  .who-we-are {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .who-we-are__left {
    position: static;
  }

  .who-we-are__title {
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
