<template>

    <ServiceHero
      :service="service"
      @openModal="showModal = true"
    />

    <section class="about-service">
      <div class="container">
        <h2><span class="bracket">&lt;</span>Об услуге<span class="bracket">/&gt;</span></h2>
        <p>
          Telegram Mini Apps — это веб-приложения, которые запускаются прямо внутри мессенджера Telegram без установки.
          Они позволяют создать полноценный интернет-магазин, игру, сервис бронирования или любое другое приложение,
          которое ваши пользователи смогут открыть в один клик из Telegram. Удобно, быстро и современно.
        </p>
        <p>
          Мы разрабатываем Mini Apps под ключ: от дизайна интерфейса до запуска в Telegram. Создаем адаптивный дизайн,
          программируем frontend и backend, интегрируем платежные системы и обеспечиваем бесперебойную работу вашего приложения.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">
          <span class="bracket">&lt;</span>
          Что входит в услугу
          <span class="bracket">/&gt;</span>
        </h2>
        <!-- Desktop view -->
        <div class="features-grid features-desktop">
          <div
              v-for="(feature, index) in features"
              :key="index"
              class="feature-card fade-item"
              :style="{'--enter-delay': `${index * 150}ms`}"
          >
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>

        <!-- Mobile view -->
        <div class="features-mobile">
          <div class="features-list">
            <div
                v-for="(feature, index) in features"
                :key="index"
                :class="['feature-item', { active: activeFeature === index }]"
                @click="activeFeature = index"
            >
              <div class="feature-item__title">{{ feature.title }}</div>
            </div>
          </div>
          <div class="features-description">
            <Transition name="fade" mode="out-in">
              <div :key="activeFeature" class="description-content">
                <p>{{ features[activeFeature]?.description }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container-main">
        <h2 class="section-title">
          <span class="bracket">&lt;</span>
          Примеры проектов с ценами
          <span class="bracket">/&gt;</span>
        </h2>
        <div class="pricing-block">
          <div class="pricing-list">
            <div
                v-for="(project, index) in projects"
                :key="index"
                class="pricing-item fade-item"
                :class="{ active: activeProject === index }"
                :style="{'--enter-delay': `${index * 120}ms`}"
                @mouseenter="!isPricingMobile && (activeProject = index)"
                @click="onPricingClick(index)"
            >
              <!-- Desktop: заголовок карточки -->
              <div v-if="!isPricingMobile" class="pricing-header">
                <h3>{{ project.title }}</h3>
                <div class="pricing-meta">
                  <p class="price">{{ project.price }}</p>
                  <p class="duration">{{ project.duration }}</p>
                </div>
              </div>

              <!-- Mobile: заголовок карточки -->
              <div v-else class="pricing-header">
                <h3>{{ project.title }}</h3>
                <div class="pricing-meta">
                  <p class="price">{{ project.price }}</p>
                  <p class="duration">{{ project.duration }}</p>
                </div>
              </div>

              <!-- Mobile: раскрытый контент карточки -->
              <div v-if="activeProject === index && isPricingMobile" class="pricing-mobile-content">
                <p class="desc">{{ project.description }}</p>
                <button class="contact-btn" @click.stop="showModal = true">Связаться</button>
              </div>
            </div>
          </div>
          <!-- Desktop: правая панель с описанием -->
          <div v-if="!isPricingMobile" class="pricing-details fade-item" style="--enter-delay: 0.1s">
            <TransitionGroup name="fade-down" appear>
              <div
                  v-for="(project, index) in projects"
                  :key="index"
                  class="pricing-detail fade-item"
                  :class="{ active: activeProject === index }"
                  style="--enter-delay: 0.1s"
              >
                <h3>{{ project.title }}</h3>
                <p class="price">{{ project.price }}</p>
                <p class="duration">Срок: {{ project.duration }}</p>
                <p class="desc">{{ project.description }}</p>
              </div>
            </TransitionGroup>
          </div>
        </div>
        <p class="pricing-note">* Цены указаны за базовый функционал. Финальная стоимость рассчитывается индивидуально с учетом всех требований.</p>
      </div>
    </section>

    <section class="section" id="projects">
      <div class="container">
        <h2 class="section-title">
          <span class="bracket">&lt;</span>
          Кейсы
          <span class="bracket">/&gt;</span>
        </h2>
        <div class="projects">
          <div class="project" onclick="openProjectModal(1)">
            <div class="project__image"></div>
            <div class="project__info">
              <h3>Название проекта</h3>
              <p>Тип проекта</p>
            </div>
            <div class="project__hover">
              <h3>Название проекта</h3>
              <p class="type">Тип проекта</p>
              <p class="desc">Подробное описание проекта Telegram Mini App</p>
              <div class="tags">
                <span>React</span>
                <span>Telegram</span>
                <span>FastAPI</span>
              </div>
              <button class="btn btn--small" onclick="event.stopPropagation()">Смотреть проект</button>
            </div>
          </div>

          <div class="project" onclick="openProjectModal(2)">
            <div class="project__image"></div>
            <div class="project__info">
              <h3>Название проекта</h3>
              <p>Тип проекта</p>
            </div>
            <div class="project__hover">
              <h3>Название проекта</h3>
              <p class="type">Тип проекта</p>
              <p class="desc">Подробное описание проекта Telegram Mini App</p>
              <div class="tags">
                <span>Vue.js</span>
                <span>Telegram</span>
                <span>Python</span>
              </div>
              <button class="btn btn--small" onclick="event.stopPropagation()">Смотреть проект</button>
            </div>
          </div>
        </div>
      </div>

      <ContactModal
          v-model:showModal="showModal"
      />

      <Contacts :settings="settings" @openModal="showModal = true" />
    </section>
</template>
<script setup lang="ts">
import Contacts from "~/components/site/sections/Contacts.vue";
import type {IService} from "~/utils/interfaces/IService";
import ServiceHero from "~/components/site/services/ServiceHero.vue";
import ContactModal from "~/components/modals/ContactModal.vue";
definePageMeta({
  layout: 'site-custom'
})
const api = useApi()
const route = useRoute()
const serviceId = computed(() => route.params.id as string)

const showModal = ref(false)
const activeFeature = ref(0)
const activeProject = ref<number | null>(0)

// MOBILE: определение мобильного вида для pricing блока
const isPricingMobile = ref(false)
const checkIsPricingMobile = () => {
  isPricingMobile.value = window.innerWidth <= 992
}

// MOBILE: обработчик клика по карточке (только на мобильном)
const onPricingClick = (index: number) => {
  if (!isPricingMobile.value) return
  activeProject.value = activeProject.value === index ? null : index
}

const projects = [
  { title: 'Простой магазин', price: 'от 200 000 ₽', duration: '5-7 дней', description: 'Каталог товаров, корзина, оформление заказа, уведомления' },
  { title: 'Каталог услуг', price: 'от 150 000 ₽', duration: '5-7 дней', description: 'Отображение услуг, запись на время, календарь, уведомления' },
  { title: 'Игра', price: 'от 400 000 ₽', duration: '15-20 дней', description: 'Игровая механика, лидерборд, система наград, профиль игрока' },
  { title: 'Сервис бронирования', price: 'от 300 000 ₽', duration: '10-15 дней', description: 'Выбор услуги/времени, онлайн-оплата, календарь, напоминания' },
  { title: 'Сервис доставки', price: 'от 450 000 ₽', duration: '18-22 дня', description: 'Меню, корзина, адрес доставки, трекинг заказа, оплата' },
  { title: 'Система лояльности', price: 'от 350 000 ₽', duration: '12-18 дней', description: 'Баллы, уровни, достижения, история покупок, персональные предложения' },
]

interface Feature {
  title: string
  description: string
}

const features: Feature[] = [
  { title: 'Дизайн интерфейса', description: 'Разработка UI/UX дизайна с учетом guidelines Telegram и лучших практик мобильных приложений' },
  { title: 'Backend + Admin панель', description: 'Серверная часть на FastAPI с базой данных PostgreSQL и удобная панель администратора' },
  { title: 'Интеграция платежей', description: 'Подключение Telegram Payments, ЮKassa, Stripe или других платежных систем' },
  { title: 'Авторизация через Telegram', description: 'Безопасная авторизация пользователей через Telegram без дополнительной регистрации' },
  { title: 'Адаптивная верстка', description: 'Интерфейс адаптирован под все разрешения экранов от мобильных до планшетов' },
  { title: 'Тестирование и деплой', description: 'Полное тестирование функционала, размещение на сервере и публикация в Telegram' },
]


const settings = ref<Record<string, string>>({})

const {data: service} = await useAsyncData<IService>(
    `service-${serviceId.value}`,
    () => api.getServiceId(serviceId.value),
    {
      watch: [serviceId]
    }
)

onMounted(async () => {
  checkIsPricingMobile()
  const data = await api.getSettings();
  settings.value = data.settings;
});
</script>

<style scoped>
.service-hero h1 {
  font-family: var(--font-pixel);
}

.service-hero h1:hover {
  animation: glitch 0.3s infinite;
}

.about-service {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  max-width: 1300px;
  margin: 0 auto;
}

.about-service h2 {
  font-size: 2rem;
  margin-bottom: 30px;
  font-family: var(--font-pixel);
}

.about-service h2:hover {
  animation: glitch 0.3s infinite;
}

.about-service p {
  color: var(--text-dim);
  line-height: 1.8;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-content: center;
  gap: 30px;
  margin: auto;
  max-width: 1200px;
}

.feature-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  padding: 30px;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: -10px 0 15px -5px rgba(0, 255, 65, 0.3);
}

.feature-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--shadow);
  transform: translateY(-5px);
}

.feature-card h3 {
  font-family: var(--font-epilepsy);
  font-size: 1.4rem;
  margin-bottom: 15px;
  color: var(--accent);
  font-weight: 700;
}

.feature-card p {
  color: #e0e0e0;
  line-height: 1.8;
}

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

/* Features mobile */
.features-mobile {
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

@media (max-width: 768px) {
  .features-desktop {
    display: none !important;
  }

  .features-mobile {
    display: grid;
    grid-template-columns: 40% 60%;
    gap: 15px;
    min-height: 300px;
  }

  .features-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .feature-item {
    background: transparent;
    border: none;
    border-left: 3px solid transparent;
    padding: 10px 0 10px 15px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .feature-item.active {
    border-left-color: var(--accent);
    box-shadow: -10px 0 15px -5px rgba(0, 255, 65, 0.3);
  }

  .feature-item:hover {
    border-left-color: var(--accent);
  }

  .feature-item__title {
    font-family: var(--font-epilepsy);
    font-size: 0.85rem;
    line-height: 1.3;
    color: #e0e0e0;
    text-align: left;
    font-weight: 700;
  }

  .features-description {
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    padding: 20px;
    display: flex;
    align-items: flex-start;
  }

  .description-content {
    color: #e0e0e0;
    line-height: 1.6;
    font-size: 0.9rem;
  }

  .description-content p {
    margin: 0;
  }
}

/* Pricing block */
.pricing-block {
  display: flex;
  gap: 30px;
}

.pricing-list {
  flex: 0 0 450px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: visible;
  padding-right: 5px;
}

.pricing-item {
  background: var(--bg-secondary);
  border: 3px solid var(--border);
  padding: 12px;
  cursor: pointer;
  color: #e0e0e0;
  border-left: 3px solid var(--accent);
  transition: all 0.2s ease-out;
  box-shadow: -10px 0 15px -5px rgba(0, 255, 65, 0.3);
}

.pricing-item:hover,
.pricing-item.active {
  border-color: var(--accent);
  box-shadow: 0 0 15px var(--shadow);
}

.pricing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}

.pricing-item h3 {
  font-family: var(--font-epilepsy);
  font-size: 1.1rem;
  margin: 0;
  color: var(--text);
  flex: 1;
  font-weight: 700;
}

.pricing-item .price {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  color: var(--accent);
  margin: 0 0 0 10px;
  font-weight: 600;
  white-space: nowrap;
  position: relative;
}

.pricing-item .price::after {
  content: " ->";
  font-family: var(--font-epilepsy);
  margin-left: 5px;
}

.pricing-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-left: 10px;
}

.pricing-item .duration {
  font-size: 0.85rem;
  color: var(--text-dim);
  margin: 0;
  white-space: nowrap;
}

.pricing-details {
  flex: 1 1 40%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  padding: 30px;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 15px -5px rgba(0, 255, 65, 0.3);
}

.pricing-detail {
  display: none;
  color: #e0e0e0;
  position: relative;
}

.pricing-detail.active {
  display: block;
  padding-bottom: 20px;
}

.pricing-detail h3 {
  font-family: var(--font-epilepsy);
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: var(--accent);
  font-weight: 700;
}

.pricing-detail .price {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;
  color: var(--accent);
  margin-bottom: 15px;
  font-weight: 600;
}

.pricing-detail .duration {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  color: var(--accent);
  margin-bottom: 15px;
}

.pricing-detail .desc {
  font-size: 1.1rem;
  color: #e0e0e0;
  margin-bottom: 25px;
  line-height: 1.6;
}

.pricing-note {
  font-size: 0.9rem;
  color: var(--text-dim);
  font-style: italic;
  margin-top: 15px;
  text-align: center;
}

/* Pricing animations */
.pricing-block .fade-item {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
  animation: cardRevealDown 0.9s ease-out forwards;
  animation-delay: var(--enter-delay, 0s);
}

.fade-down-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-down-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-down-enter-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
  transition-delay: 0.25s;
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

/* Pricing expand animation */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* =============================================
   MOBILE: Стили для мобильного вида pricing блока
   ============================================= */

/* Mobile: контент раскрытой карточки */
.pricing-mobile-content {
  margin-top: 10px;
}

.pricing-mobile-content .desc {
  font-size: 0.95rem;
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 15px;
}

.pricing-mobile-content .contact-btn {
  padding: 10px 24px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  border: 1px solid var(--accent);
  background: var(--accent);
  color: var(--bg);
  cursor: pointer;
  transition: all 0.3s;
}

.pricing-mobile-content .contact-btn:hover {
  background: var(--bg);
  color: var(--accent);
}

/* Mobile: медиа-запрос для адаптивности */
@media (max-width: 992px) {
  .pricing-block {
    display: block;
  }

  .pricing-list {
    flex: none;
    width: 100%;
  }

  .pricing-item {
    width: 100%;
    box-sizing: border-box;
  }

  /* Mobile: активная карточка с полной зелёной рамкой */
  .pricing-item.active {
    border: 3px solid var(--accent);
  }

  .pricing-item .price::after {
    content: " ->";
  }
}
/* ============================================= */

/* Projects */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 30px;
}

.project {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 1160px;
  background: var(--bg-secondary);
  border: 3px solid var(--border);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  color: #e0e0e0;
  border-radius: 0;
  margin: auto;
}

.project:hover {
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--shadow);
}

.project__image {
  width: 100%;
  height: 250px;
  background: repeating-linear-gradient(
      45deg,
      var(--bg-tertiary),
      var(--bg-tertiary) 10px,
      var(--bg-secondary) 10px,
      var(--bg-secondary) 20px
  );
}

.project__info {
  padding: 20px;
}

.project__info h3 {
  font-family: var(--font-epilepsy);
  font-size: 1.3rem;
  margin-bottom: 10px;
}

.project__info p {
  color: #e0e0e0;
}

.project__hover {
  position: absolute;
  inset: 0;
  background: var(--bg-secondary);
  padding: 30px;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transition: all 0.3s;
  pointer-events: none;
}

.project:hover .project__hover {
  opacity: 1;
  pointer-events: auto;
}

.project__hover h3 {
  font-family: var(--font-epilepsy);
  font-size: 1.3rem;
  margin-bottom: 10px;
}

.project__hover .type {
  color: #e0e0e0;
  margin-bottom: 15px;
}

.project__hover .desc {
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 20px;
  flex: 1;
}

.project__hover .tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.project__hover .tags span {
  padding: 5px 12px;
  border: 1px solid var(--accent);
  color: var(--accent);
  font-size: 0.8rem;
}
</style>