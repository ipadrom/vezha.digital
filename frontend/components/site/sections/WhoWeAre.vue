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
              <span class="bracket"></span>Кто мы<span class="bracket">&gt;</span>
            </h2>
            <Card
                v-for="(item, index) in aboutUsData"
                :key="index"
                :title="item.title"
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
                  :title="stat.value"
                  :description="stat.description"
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

const { isSectionVisible, targetRef: techStackRef } = useSectionVisible(0.1)

const props = defineProps<{
  aboutSection: IAboutSection[]
}>()

const stats = [
  { value: 'с 2016 года', description: '...' },
  { value: '95% проектов — «под ключ»', description: '...' },
  { value: 'от 14 до 45 дней', description: '...' },
  { value: 'в 2–5 раз', description: '...' },
]

const aboutUsData = [
  {
    title: 'О нашей команде',
    description: 'Мы - команда опытных разработчиков, специализирующихся на создании современных веб-решений, Telegram Mini Apps и интеграции искусственного интеллекта. Наша миссия - превращать идеи в надежные цифровые продукты, используя передовые технологии и подходы.',
    since_description:'С 2020 года мы помогли более чем 100 клиентам реализовать их цифровую трансформацию, уделяя особое внимание качеству кода, юзабилити и скорости разработки.'
  }
]
</script>

<style scoped>
.who-we-are {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  height: 100%;
}

.who-we-are__left-wrapper {
  width: 100%;
  display: block;
}

.who-we-are > * {
  min-width: 0;
}

.who-we-are__left {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-end;
}

.who-we-are__left :deep(.card) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding-left: 0;
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
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.who-we-are__left .section-title,
.who-we-are__right .section-title {
  text-align: start;
  margin-bottom: 30px;
}

.stats-grid{
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  width: 100%;
  gap: 20px;
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
    text-align: center;
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

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
