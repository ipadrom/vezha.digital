<template>
  <div class="advantages-mobile-only">
    <div class="mobile-tabs">
      <button
          v-for="(clientType, index) in clientTypes"
          :key="clientType.id"
          :class="['mobile-tab', { active: activeTab === index }]"
          @click="activeTab = index; activeIndex = index"
      >
        {{ clientType.title }}
      </button>
    </div>

    <div v-if="clientTypes.length" class="advantages-mobile-card">
      <div class="advantage">
        <Card
            :title="clientTypes[activeTab].title"
            :description="clientTypes[activeTab].description"
            class="advantages-card-custom"
        >
          <div class="adv-mobile-tags">
            <span
                v-for="tag in activeTags.slice(0,3)"
                :key="tag"
                class="adv-mobile-tag"
            >
              {{ tag }}
            </span>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from "~/components/ui/cards/Card.vue";
import type {IClientType} from "~/utils/interfaces/IClientTypes";

const activeTab = ref(0)
const activeIndex = ref(0)

const clientTypes: IClientType[] = [
  {
    id: "e3fcd488-e8d4-4ac4-ae1d-9cdaf92a91b9",
    title: "Малый бизнес",
    subtitle: "Кафе, салоны, магазины",
    description: "Помогаем малому бизнесу автоматизировать процессы и выйти в онлайн. Создаем доступные решения: от простых ботов для приема заказов до полноценных интернет-магазинов. Быстрый запуск, понятные инструменты, поддержка на каждом этапе."
  },
  {
    id: "b099037d-9355-412a-91e6-b252b9a981b7",
    title: "Средний бизнес",
    subtitle: "Компании, сети, франшизы",
    description: "Разрабатываем комплексные решения для среднего бизнеса: корпоративные системы, CRM, автоматизация процессов продаж и маркетинга. Интеграция с существующими системами, аналитика, масштабируемость."
  },
  {
    id: "fea7a9fd-f755-43de-9a5d-3ef49db5ecf6",
    title: "Стартапы",
    subtitle: "MVP и прототипы",
    description: "Быстро создаем MVP для стартапов: от идеи до первых пользователей за 2-4 недели. Помогаем проверить гипотезы с минимальными вложениями, итерируем на основе фидбека. Готовы расти вместе с вашим проектом."
  },
  {
    id: "6dbe52cd-fb1f-454e-81a8-4dfa35501f57",
    title: "Частные лица",
    subtitle: "Блогеры, фрилансеры",
    description: "Создаем персональные проекты: сайты-портфолио, боты для автоматизации, лендинги для продажи услуг. Доступные цены, индивидуальный подход, обучение работе с готовым продуктом."
  }
]

const tagsByIndex: Record<number, string[]> = {
  0: ['Лендинг для фотографа', 'Сайт-портфолио', 'Бот для записи', 'Мини-магазин в Telegram', 'Личный AI-ассистент'],
  1: ['CRM для стоматологии', 'Мини-апп для магазина цветов', 'Бот для автоматизации заявок', 'Интернет-магазин одежды', 'Система бронирования'],
  2: ['CRM-система для завода', 'Telegram Mini App для банка', 'Интерактивный лендинг', 'Корпоративный квест', 'AI-помощник для сотрудников'],
  3: ['Личный проект', 'Мини-бот', 'Портфолио сайт', 'Лендинг', 'AI-инструмент']
}

const activeTags = computed(() => tagsByIndex[activeIndex.value] ?? [])
</script>

<style scoped>
.advantages-mobile-only {
  display: none;
}

@media (max-width: 900px) {
  .advantages-mobile-only {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .mobile-tabs {
    display: flex;
    gap: 8px;
  }

  .mobile-tab {
    flex: 1;
    padding: 10px 6px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: #e0e0e0;
    font-family: var(--font-inter);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    text-align: center;
  }

  .mobile-tab.active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--bg);
  }

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
}
</style>