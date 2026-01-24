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
        <div class="features-grid">
          <div class="feature-card">
            <h3>Дизайн интерфейса</h3>
            <p>Разработка UI/UX дизайна с учетом guidelines Telegram и лучших практик мобильных приложений</p>
          </div>

          <div class="feature-card">
            <h3>Backend + Admin панель</h3>
            <p>Серверная часть на FastAPI с базой данных PostgreSQL и удобная панель администратора</p>
          </div>

          <div class="feature-card">
            <h3>Интеграция платежей</h3>
            <p>Подключение Telegram Payments, ЮKassa, Stripe или других платежных систем</p>
          </div>

          <div class="feature-card">
            <h3>Авторизация через Telegram</h3>
            <p>Безопасная авторизация пользователей через Telegram без дополнительной регистрации</p>
          </div>

          <div class="feature-card">
            <h3>Адаптивная верстка</h3>
            <p>Интерфейс адаптирован под все разрешения экранов от мобильных до планшетов</p>
          </div>

          <div class="feature-card">
            <h3>Тестирование и деплой</h3>
            <p>Полное тестирование функционала, размещение на сервере и публикация в Telegram</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">
          <span class="bracket">&lt;</span>
          Примеры проектов с ценами
          <span class="bracket">/&gt;</span>
        </h2>
        <div class="pricing-table">
          <table>
            <thead>
            <tr>
              <th>Тип проекта</th>
              <th>Описание</th>
              <th>Цена</th>
              <th>Срок</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td><strong>Простой магазин</strong></td>
              <td>Каталог товаров, корзина, оформление заказа, уведомления</td>
              <td class="price-cell">от 200 000 ₽</td>
              <td>5-7 дней</td>
            </tr>
            <tr>
              <td><strong>Каталог услуг</strong></td>
              <td>Отображение услуг, запись на время, календарь, уведомления</td>
              <td class="price-cell">от 150 000 ₽</td>
              <td>5-7 дней</td>
            </tr>
            <tr>
              <td><strong>Игра</strong></td>
              <td>Игровая механика, лидерборд, система наград, профиль игрока</td>
              <td class="price-cell">от 400 000 ₽</td>
              <td>15-20 дней</td>
            </tr>
            <tr>
              <td><strong>Сервис бронирования</strong></td>
              <td>Выбор услуги/времени, онлайн-оплата, календарь, напоминания</td>
              <td class="price-cell">от 300 000 ₽</td>
              <td>10-15 дней</td>
            </tr>
            <tr>
              <td><strong>Сервис доставки</strong></td>
              <td>Меню, корзина, адрес доставки, трекинг заказа, оплата</td>
              <td class="price-cell">от 450 000 ₽</td>
              <td>18-22 дня</td>
            </tr>
            <tr>
              <td><strong>Система лояльности</strong></td>
              <td>Баллы, уровни, достижения, история покупок, персональные предложения</td>
              <td class="price-cell">от 350 000 ₽</td>
              <td>12-18 дней</td>
            </tr>
            </tbody>
          </table>
          <p class="pricing-note">* Цены указаны за базовый функционал. Финальная стоимость рассчитывается индивидуально с учетом всех требований.</p>
        </div>
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

const settings = ref<Record<string, string>>({})

const {data: service} = await useAsyncData<IService>(
    `service-${serviceId.value}`,
    () => api.getServiceId(serviceId.value),
    {
      watch: [serviceId]
    }
)

onMounted(async () => {
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  justify-content: center;
  gap: 30px;
  margin: auto;
  max-width: 1100px;
}

.feature-card {
  max-width: 366px;
  max-height: 212px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 30px;
  transition: all 0.3s;
  cursor: pointer;
}

.feature-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--shadow);
  transform: translateY(-5px);
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 15px;
  font-family: var(--font-pixel);
}

.feature-card p {
  color: var(--text-dim);
  line-height: 1.6;
}

.pricing-table {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
}

.pricing-table table {

  border-collapse: collapse;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
}

.pricing-table th,
.pricing-table td {
  padding: 20px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.pricing-table th {
  background: var(--bg-tertiary);
  color: var(--accent);
  font-weight: 600;
}

.pricing-table td {
  color: var(--text-dim);
}

.pricing-table tr:last-child td {
  border-bottom: none;
}

.pricing-table tr:hover {
  background: var(--bg-tertiary);
}

.price-cell {
  color: var(--accent);
  font-weight: 600;
  white-space: nowrap;
  font-size: 1rem;
}

.pricing-note {
  font-size: 0.9rem;
  color: var(--text-dim);
  font-style: italic;
  margin-top: 15px;
}

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