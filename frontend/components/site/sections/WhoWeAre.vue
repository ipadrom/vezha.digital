<template>
  <section
      id="stack"
      class="section"
      ref="techStackRef"
  >
    <div class="container-main">
      <div class="who-we-are" v-if="isSectionVisible">
        <!-- Left Column: About Us -->
        <TransitionGroup
          name="fade-down"
          appear
          tag="div"
          class="who-we-are__left-wrapper"
        >
          <div class="who-we-are__left">
            <h2 class="section-title who-we-are__title">
              <span class="bracket"></span>Кто мы <span class="bracket">&gt;</span>
            </h2>
            <Card
                v-for="(item, index) in aboutUsData"
                :key="index"
                :description="item.description"
                :since_description="item.since_description"
                :transparent="true"
                class="who-we-are__text"
            />
          </div>
        </TransitionGroup>

        <TransitionGroup
          name="fade-down"
          appear
          tag="div"
          class="who-we-are__left-wrapper"
        >
          <div class="who-we-are__right">
            <div v-if="isSectionVisible" class="stats-grid">
              <div
                  v-for="(stat, index) in stats"
                  :key="index"
                  class="stat-card fade-in"
                  :style="{ '--enter-delay': `${index * 150}ms` }"
              >
                <Card
                  :description="stat.description"
                  :icon="stat.icon"
                  class="who-we-are-card"
                />
              </div>
            </div>
          </div>
        </TransitionGroup>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {useSectionVisible} from "~/composables/useSectionVisible";
import Card from "~/components/ui/cards/Card.vue";
import type {IAboutSection} from "~/utils/interfaces/IAboutSection";
import chevronsUp from '~/assets/icons/chevrons-up.svg?url'
import fileLock from '~/assets/icons/file-lock.svg?url'
import notepadText from '~/assets/icons/notepad-text-dashed.svg?url'
import percent from '~/assets/icons/percent.svg?url'
import refreshCw from '~/assets/icons/refresh-cw.svg?url'
import handCoins from '~/assets/icons/hand-coins.svg?url'
const { isSectionVisible, targetRef: techStackRef } = useSectionVisible(0.1)

const props = defineProps<{
  aboutSection: IAboutSection[]
}>()

const stats = [
  {
    description: 'На 20-30% дешевле других агенств',
    icon: percent
  },
  {
    description: '2 дня от обсуждения до старта работы',
    icon: chevronsUp
  },
  {
    description: 'Полный цикл разработки от идеи до запуска',
    icon: refreshCw
  },
  {
    description: 'Соответствие 152-ФЗ о персональных данных',
    icon: fileLock
  },
  {
    description: 'Поэтапная оплата, платите за результат',
    icon: handCoins
  },
  {
    description: 'Макет и ТЗ до подписания договора',
    icon: notepadText
  },
]

const aboutUsData = [
  {
    description:
        'Мы — команда разработчиков, создающих веб-сервисы, Telegram Mini Apps и AI-решения для бизнеса.',
    since_description:
        'Работаем по современным стандартам архитектуры и уделяем особое внимание производительности и безопасности.',
    icon: refreshCw
  },
  {
    description:
        'Наша цель — не просто написать код, а создать продукт, который приносит прибыль и масштабируется.',
    since_description:
        'Мы глубоко погружаемся в бизнес-логику и предлагаем оптимальные технологические решения.',
    icon: handCoins
  }
]
</script>

<style scoped>
.who-we-are {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: stretch;
}

.who-we-are__left-wrapper {
  width: 100%;
  display: block;
  padding: 0;
}

.who-we-are > * {
  min-width: 0;
}

.who-we-are__left {
  display: flex;
  flex-direction: column;
}

.who-we-are__title {
  margin-top: 0;
  margin-bottom: 30px;
  line-height: 1;
}

.fade-down-enter-from{
  opacity: 0;
  transform: translateY(-15px);
}

.fade-down-enter-to{
  opacity: 1;
  transform: translateY(0);
}

.fade-down-enter-active{
  transition: all 0.5s ease-out;
  transition-delay: var(--enter-delay, 0s);
}

.who-we-are__right {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.who-we-are__right :deep(.card){
  min-width: 325px !important;
  max-height: 150px !important;
}

.who-we-are__left .section-title,
.who-we-are__right .section-title {
  text-align: start;
  margin-bottom: 30px;
}

.stats-grid{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-card {
  width: 100%;
  display: flex;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 992px) {
  .who-we-are {
    gap: 40px;
  }
}

@media (max-width: 768px) {
  .who-we-are {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .who-we-are__left .section-title,
  .who-we-are__right .section-title {
    text-align: start;
  }

  .stack-group h3 {
    margin-bottom: 15px;
    text-align: center;
  }

  .tech-item h4 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.85rem;
  }
}
</style>
