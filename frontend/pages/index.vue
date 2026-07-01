<template>
  <div class="vz-home">
    <Transition name="vz-intro">
      <div v-if="showIntro" class="vz-intro" aria-hidden="true">
        <div class="vz-intro__top">
          <span>VEZHA DIGITAL</span>
          <span>{{ introProgress.toString().padStart(2, '0') }}</span>
        </div>
        <div class="vz-intro__brand">VEZHA</div>
        <div class="vz-intro__bottom">Engineering clarity through code</div>
      </div>
    </Transition>

    <section id="hero" class="vz-hero" aria-labelledby="hero-title">
      <div class="vz-hero__orbit" aria-hidden="true"></div>
      <div class="vz-hero__meta">
        <span>2026 / Веб-студия</span>
        <span>Base / Moscow</span>
        <span>Engineering clarity through code</span>
      </div>

      <div class="vz-hero__seal" aria-hidden="true">
        <span>ВЕБ-СТУДИЯ</span>
        <strong>VEZHA</strong>
        <span>DIGITAL</span>
      </div>

      <div class="vz-hero__grid">
        <div>
          <p class="vz-kicker">Продукты, которые работают в вашем бизнесе</p>
          <h1 id="hero-title">Telegram Mini Apps, боты, сайты, магазины, AI и корпоративные системы.</h1>
        </div>
        <div class="vz-hero__aside">
          <p>
            Команда полного цикла: проектирование, дизайн, разработка, запуск и поддержка.
            Ведём проект без субподряда и лишних звеньев.
          </p>
          <div class="vz-actions">
            <button class="vz-button vz-button--primary" type="button" @click="showModal = true">
              Обсудить проект
              <span aria-hidden="true">→</span>
            </button>
            <a class="vz-button vz-button--ghost" href="#stack">
              Смотреть стек
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>

      <div class="vz-hero__stats" aria-label="Ключевые условия">
        <span>{{ heroPriceLabel }}</span>
        <span>Запуск 1-4 недели</span>
        <span>Полный цикл</span>
        <span>Без субподряда</span>
      </div>
    </section>

    <section id="about" class="vz-section vz-about" aria-labelledby="about-title">
      <div class="vz-section__label">
        <span>Кто мы</span>
        <span>01</span>
      </div>
      <div class="vz-about__copy">
        <h2 id="about-title">Мы — команда полного цикла.</h2>
        <p>
          Каждый проект ведёт конкретный человек: от первого разговора до запуска.
          Вникаем в задачу и предлагаем решения, а не просто закрываем ТЗ.
        </p>
        <p>
          Нам важно, чтобы продукт реально работал в вашем бизнесе, а не выглядел
          красиво на сдаче и пылился после запуска.
        </p>
      </div>
    </section>

    <section id="stack" class="vz-section vz-stack" aria-labelledby="stack-title">
      <div class="vz-stack__sticky">
        <div class="vz-section__label">
          <span>Стек</span>
          <span>02</span>
        </div>
        <div class="vz-stack__head">
          <h2 id="stack-title">Стек подбирается под задачу, а не по трендам</h2>
          <p>Каждый инструмент проверен в реальных проектах и предсказуем в поддержке.</p>
        </div>
        <div class="vz-stack__line" aria-hidden="true"></div>
        <div class="vz-stack__items">
          <article v-for="(group, index) in displayStackGroups" :key="group.title" class="vz-stack-card">
            <span class="vz-stack-card__num">{{ toNumber(index + 1) }} / {{ toNumber(displayStackGroups.length) }}</span>
            <div class="vz-stack-card__dot" aria-hidden="true"></div>
            <div>
              <h3>{{ group.title }}</h3>
              <p>{{ group.description }}</p>
              <div class="vz-tags">
                <span v-for="item in group.items" :key="item">{{ item }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="services" class="vz-section vz-services" aria-labelledby="services-title">
      <div class="vz-section__label">
        <span>Услуги</span>
        <span>03</span>
      </div>
      <div class="vz-services__layout">
        <div class="vz-services__head">
          <p class="vz-kicker">Что мы делаем</p>
          <h2 id="services-title">От Telegram-продуктов до внутренних систем.</h2>
          <p>
            Каждую услугу упаковываем в понятный план: цель, сроки, результат,
            интеграции и поддержка после запуска.
          </p>
          <div class="vz-service-nav" role="tablist" aria-label="Услуги">
            <button
              v-for="(service, index) in displayServices"
              :key="service.title"
              :class="{ 'is-active': activeServiceIndex === index }"
              type="button"
              role="tab"
              :aria-selected="activeServiceIndex === index"
              @click="activeServiceIndex = index"
              @mouseenter="activeServiceIndex = index"
            >
              <span>{{ service.n }}</span>
              {{ service.title }}
            </button>
          </div>
        </div>
        <div class="vz-service-stage">
          <Transition name="vz-service" mode="out-in">
            <article :key="activeService.title" class="vz-service-panel">
              <span>{{ activeService.n }}</span>
              <h3>{{ activeService.title }}</h3>
              <p>{{ activeService.desc }}</p>
              <div class="vz-tags">
                <span v-for="meta in activeService.meta" :key="meta">{{ meta }}</span>
              </div>
            </article>
          </Transition>
        </div>
      </div>
    </section>

    <section id="clients" class="vz-clients" aria-labelledby="clients-title">
      <div class="vz-section__label">
        <span>Для любых клиентов</span>
        <span>✦</span>
      </div>
      <h2 id="clients-title">От частного специалиста до компании</h2>
      <div class="vz-client-grid">
        <span v-for="client in displayClients" :key="client">{{ client }}</span>
      </div>
    </section>

    <section id="stages" class="vz-section vz-stages" aria-labelledby="stages-title">
      <div class="vz-section__label">
        <span>Этапы работы</span>
        <span>04</span>
      </div>
      <div class="vz-stages__head">
        <h2 id="stages-title">Полный контроль на каждом шаге</h2>
        <p>
          Фиксированные сроки, регулярные отчёты и согласование на каждом этапе.
          Никаких сюрпризов — только предсказуемый результат.
        </p>
      </div>
      <div class="vz-stage-list">
        <article v-for="stage in displayStages" :key="stage.title" class="vz-stage-row">
          <span>{{ stage.n }}</span>
          <h3>{{ stage.title }}</h3>
          <p>{{ stage.desc }}</p>
          <small>{{ stage.dur }}</small>
        </article>
      </div>
    </section>

    <section id="contacts" class="vz-contacts" aria-labelledby="contacts-title">
      <div class="vz-contacts__circle" aria-hidden="true"></div>
      <div class="vz-section__label">
        <span>Контакты</span>
        <span>05</span>
      </div>
      <h2 id="contacts-title">Обсудим проект и рассчитаем точную стоимость</h2>
      <div class="vz-actions vz-actions--center">
        <button class="vz-button vz-button--primary" type="button" @click="showModal = true">
          Написать нам
          <span aria-hidden="true">→</span>
        </button>
        <a class="vz-button vz-button--ghost" :href="`mailto:${contactEmail}`">
          {{ contactEmail }}
        </a>
      </div>
    </section>

    <ContactModal v-model:showModal="showModal" />
  </div>
</template>

<script setup lang="ts">
import ContactModal from "~/components/modals/ContactModal.vue";
import type { IAdvantages } from "~/utils/interfaces/IAdvantages";
import type { IClientType } from "~/utils/interfaces/IClientTypes";
import type { IProjects } from "~/utils/interfaces/IProjects";
import type { IServices } from "~/utils/interfaces/IServices";
import type { ISettings } from "~/utils/interfaces/ISettings";
import type { ITechStack } from "~/utils/interfaces/ITechStack";
import type { IWorkStages } from "~/utils/interfaces/IWorkStages";

definePageMeta({
  layout: "site-custom",
});

type StackGroup = {
  title: string;
  description: string;
  items: string[];
};

type DisplayService = {
  n: string;
  title: string;
  desc: string;
  meta: string[];
};

type DisplayStage = {
  n: string;
  title: string;
  desc: string;
  dur: string;
};

const {
  getServices,
  getProjects,
  getAdvantages,
  getTechStack,
  getWorkStages,
  getSettings,
  getClientTypes,
} = useApi();

const showModal = ref(false);
const showIntro = ref(false);
const introProgress = ref(0);
const activeServiceIndex = ref(0);

const services = ref<IServices[]>([]);
const projects = ref<IProjects[]>([]);
const advantages = ref<IAdvantages[]>([]);
const techStack = ref<ITechStack[]>([]);
const workStages = ref<IWorkStages[]>([]);
const clientTypes = ref<IClientType[]>([]);
const settings = ref<ISettings | null>(null);

const fallbackServices: DisplayService[] = [
  {
    n: "01",
    title: "Telegram Mini Apps",
    desc: "Полноценные приложения внутри Telegram: каталог, профиль, оплата и личный кабинет.",
    meta: ["Каталог", "Оплата", "Профиль"],
  },
  {
    n: "02",
    title: "Telegram боты",
    desc: "Автоматизация продаж, записи и поддержки прямо в чате, без лишних экранов.",
    meta: ["Продажи", "Запись", "Поддержка"],
  },
  {
    n: "03",
    title: "Веб-сайты",
    desc: "Лендинги и корпоративные сайты, которые быстро грузятся, понятно объясняют и продают.",
    meta: ["Лендинги", "Корпоративные", "SEO"],
  },
  {
    n: "04",
    title: "Интернет-магазины",
    desc: "Каталог, корзина, оплата, склад и CRM в одной устойчивой системе.",
    meta: ["Корзина", "Оплата", "CRM"],
  },
  {
    n: "05",
    title: "AI и автоматизация",
    desc: "Ассистенты, обработка заявок и интеграции, которые снимают рутину с команды.",
    meta: ["Ассистенты", "Заявки", "Интеграции"],
  },
  {
    n: "06",
    title: "Корпоративные системы",
    desc: "Внутренние порталы, CRM и учётные системы под реальные процессы компании.",
    meta: ["CRM", "Порталы", "Учёт"],
  },
  {
    n: "07",
    title: "Мобильные приложения",
    desc: "Нативные и кроссплатформенные приложения для iOS, Android и PWA-сценариев.",
    meta: ["iOS", "Android", "PWA"],
  },
];

const fallbackStackGroups: StackGroup[] = [
  {
    title: "Frontend",
    description: "Интерфейсы, которые быстро грузятся и удобно работают на любом устройстве.",
    items: ["React", "Vue 3", "Next.js", "TypeScript", "Tailwind"],
  },
  {
    title: "Backend",
    description: "Надёжная серверная часть, которая не ляжет под нагрузкой и легко масштабируется.",
    items: ["Python", "FastAPI", "PostgreSQL", "Redis"],
  },
  {
    title: "DevOps",
    description: "Стабильный деплой и мониторинг: предсказуемые релизы и аптайм без сюрпризов.",
    items: ["Docker", "Nginx", "CI/CD", "Linux"],
  },
  {
    title: "Mobile",
    description: "Мобильные приложения и PWA с нативным ощущением на iOS и Android.",
    items: ["React Native", "Expo", "PWA", "Flutter"],
  },
];

const fallbackClients = [
  "Лендинг для фотографа",
  "Сайт-портфолио",
  "Бот для записи",
  "Мини-магазин в Telegram",
  "Личный AI-ассистент",
];

const fallbackStages: DisplayStage[] = [
  { n: "01", title: "Анализ", desc: "Изучаем бизнес, цели и аудиторию, фиксируем техническое задание.", dur: "1-3 дня" },
  { n: "02", title: "Проектирование", desc: "Прототипы экранов, архитектура системы и UX-логика продукта.", dur: "2-4 дня" },
  { n: "03", title: "Дизайн", desc: "Визуальная концепция, UI Kit и адаптив под устройства.", dur: "3-7 дней" },
  { n: "04", title: "Разработка", desc: "Frontend, Backend, API-интеграции и code review.", dur: "7-21 день" },
  { n: "05", title: "Тестирование", desc: "Функциональное и нагрузочное тестирование, фикс багов.", dur: "2-5 дней" },
  { n: "06", title: "Запуск", desc: "Деплой на сервер, настройка CI/CD и мониторинга.", dur: "1-2 дня" },
  { n: "07", title: "Поддержка", desc: "Мониторинг, обновления, доработки и консультации.", dur: "Ongoing" },
];

const displayServices = computed<DisplayService[]>(() => {
  if (!services.value.length) return fallbackServices;

  return services.value.map((service, index) => ({
    n: toNumber(index + 1),
    title: service.name || service.title || fallbackServices[index]?.title || "Услуга",
    desc: service.description || service.about || fallbackServices[index]?.desc || "Проектируем и запускаем продукт под задачу бизнеса.",
    meta: service.features?.slice(0, 3).map((feature) => feature.text) || fallbackServices[index]?.meta || [],
  }));
});

const activeService = computed(() => displayServices.value[activeServiceIndex.value] || displayServices.value[0]);

const displayStackGroups = computed<StackGroup[]>(() => {
  if (!techStack.value.length) return fallbackStackGroups;

  const grouped = techStack.value.reduce<Record<string, string[]>>((acc, item) => {
    const key = item.category || "Stack";
    acc[key] ||= [];
    acc[key].push(item.name);
    return acc;
  }, {});

  return Object.entries(grouped).slice(0, 4).map(([title, items], index) => ({
    title,
    description: fallbackStackGroups[index]?.description || "Технологии подбираем под требования продукта и поддержку после запуска.",
    items: items.slice(0, 5),
  }));
});

const displayClients = computed(() => {
  if (clientTypes.value.length) {
    return clientTypes.value.slice(0, 7).map((client) => client.title);
  }

  if (projects.value.length) {
    return projects.value.slice(0, 7).map((project) => project.type || project.name);
  }

  return fallbackClients;
});

const displayStages = computed<DisplayStage[]>(() => {
  if (!workStages.value.length) return fallbackStages;

  return workStages.value.map((stage, index) => ({
    n: toNumber(stage.step_number || index + 1),
    title: stage.title,
    desc: stage.description || stage.full_description,
    dur: stage.duration || fallbackStages[index]?.dur || "По плану",
  }));
});

const contactEmail = computed(() => settings.value?.contact_email || "contact@vezha.digital");
const heroPriceLabel = computed(() => {
  const price = settings.value?.hero_price?.trim() || "50,000";
  if (price.toLowerCase().startsWith("от ")) return price;
  return `От ${price}${price.includes("₽") ? "" : " ₽"}`;
});

function toNumber(value: number) {
  return value.toString().padStart(2, "0");
}

function runIntro() {
  const seen = sessionStorage.getItem("vz_intro_seen") === "1";
  if (seen) return;

  showIntro.value = true;
  const started = performance.now();
  const duration = 900;

  const frame = (now: number) => {
    const progress = Math.min(1, (now - started) / duration);
    introProgress.value = Math.round(progress * 100);

    if (progress < 1) {
      requestAnimationFrame(frame);
      return;
    }

    sessionStorage.setItem("vz_intro_seen", "1");
    window.setTimeout(() => {
      showIntro.value = false;
    }, 240);
  };

  requestAnimationFrame(frame);
}

onMounted(async () => {
  try {
    const [
      servicesData,
      projectsData,
      advantagesData,
      techStackData,
      workStagesData,
      settingsData,
      clientTypeData,
    ] = await Promise.all([
      getServices(),
      getProjects(),
      getAdvantages(),
      getTechStack(),
      getWorkStages(),
      getSettings(),
      getClientTypes(),
    ]);

    services.value = servicesData;
    projects.value = projectsData;
    advantages.value = advantagesData;
    techStack.value = techStackData;
    workStages.value = workStagesData;
    settings.value = settingsData.settings;
    clientTypes.value = clientTypeData;
  } catch (error) {
    console.info("VEZHA public data fallback is active:", error);
  }
});

watch(displayServices, (items) => {
  if (activeServiceIndex.value > items.length - 1) {
    activeServiceIndex.value = 0;
  }
});

useHead({
  title: "VEZHA Digital - Веб-разработка под ключ",
  meta: [
    {
      name: "description",
      content: "Разработка Telegram Mini Apps, ботов, веб-сайтов, интернет-магазинов, AI и корпоративных систем.",
    },
    { property: "og:title", content: "VEZHA Digital - продукты, которые работают в бизнесе" },
    { property: "og:description", content: "Команда полного цикла для Telegram, web, AI и корпоративных систем." },
    { property: "og:type", content: "website" },
  ],
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Onest:wght@400;500;600;700;800&display=swap",
    },
  ],
});
</script>

<style scoped>
.vz-home {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
}

.vz-intro {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  background: var(--bg);
  color: var(--text);
}

.vz-intro__top,
.vz-intro__bottom {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}

.vz-intro__brand {
  font-size: clamp(72px, 18vw, 220px);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 0.85;
}

.vz-intro-enter-active,
.vz-intro-leave-active {
  transition: transform 0.8s cubic-bezier(0.76, 0, 0.24, 1);
}

.vz-intro-enter-from,
.vz-intro-leave-to {
  transform: translateY(-100%);
}

.vz-section,
.vz-hero,
.vz-clients,
.vz-contacts {
  position: relative;
  max-width: 1240px;
  margin: 0 auto;
  padding-inline: 40px;
}

.vz-section__label {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 34px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}

.vz-kicker {
  margin: 0 0 16px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}

.vz-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  padding: 14px 24px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font: 500 15px/1 var(--font-ui);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, gap 0.2s ease, transform 0.2s ease;
}

.vz-button:hover {
  gap: 14px;
  transform: translateY(-1px);
}

.vz-button:focus-visible,
.vz-service-nav button:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 3px;
}

.vz-button--primary {
  background: var(--text);
  color: var(--bg);
  border-color: var(--text);
}

.vz-button--primary:hover {
  background: var(--btn-hover);
  color: var(--bg);
}

.vz-button--ghost {
  background: transparent;
  color: var(--text);
}

.vz-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}

.vz-actions--center {
  justify-content: center;
}

.vz-hero {
  min-height: min(860px, calc(100vh - 10px));
  padding-top: 126px;
  padding-bottom: 72px;
  overflow: hidden;
}

.vz-hero__orbit {
  position: absolute;
  top: 104px;
  left: 50%;
  width: min(470px, 62vw);
  aspect-ratio: 1;
  border: 1px dashed var(--hair);
  border-radius: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.vz-hero__meta,
.vz-hero__stats {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

.vz-hero__meta span:last-child {
  text-align: right;
}

.vz-hero__seal {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  margin: 42px auto 0;
  width: min(560px, 100%);
  text-align: center;
}

.vz-hero__seal span {
  font-family: var(--font-mono);
  font-size: clamp(14px, 2vw, 24px);
  letter-spacing: 0.34em;
  color: var(--muted-2);
}

.vz-hero__seal strong {
  margin: 8px 0 4px;
  font-size: clamp(72px, 10vw, 132px);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 0.88;
  color: var(--text);
}

.vz-hero__grid {
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 60px;
  align-items: end;
  margin-top: 44px;
}

.vz-hero h1 {
  max-width: 780px;
  margin: 0;
  font-size: clamp(40px, 5.2vw, 72px);
  line-height: 0.96;
  font-weight: 700;
  letter-spacing: 0;
}

.vz-hero__aside {
  display: grid;
  gap: 28px;
}

.vz-hero__aside p {
  margin: 0;
  max-width: 520px;
  color: var(--text-2);
  font-size: 18px;
  line-height: 1.7;
}

.vz-hero__stats {
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-top: 42px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.vz-about {
  display: grid;
  grid-template-columns: minmax(180px, 0.35fr) 1fr;
  gap: 72px;
  padding-top: 120px;
  padding-bottom: 110px;
  border-top: 1px solid var(--border-2);
}

.vz-about .vz-section__label {
  display: grid;
  align-content: start;
  margin: 0;
}

.vz-about__copy {
  max-width: 880px;
}

.vz-about h2,
.vz-stack h2,
.vz-services h2,
.vz-clients h2,
.vz-stages h2,
.vz-contacts h2 {
  margin: 0;
  font-size: clamp(34px, 5vw, 74px);
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0;
}

.vz-about p {
  margin: 34px 0 0;
  font-size: clamp(22px, 3.1vw, 42px);
  line-height: 1.18;
  color: var(--text);
}

.vz-about p + p {
  color: var(--text-2);
}

.vz-stack {
  max-width: none;
  min-height: 330vh;
  padding: 0;
  border-top: 1px solid var(--border-2);
}

.vz-stack__sticky {
  position: sticky;
  top: 0;
  display: grid;
  grid-template-columns: minmax(260px, 0.75fr) minmax(0, 1.25fr);
  gap: 72px;
  min-height: 100vh;
  max-width: 1240px;
  margin: 0 auto;
  padding: 112px 40px 72px;
  align-items: center;
}

.vz-stack__head {
  align-self: start;
}

.vz-stack__head p,
.vz-services__head > p,
.vz-stages__head p {
  margin: 22px 0 0;
  max-width: 560px;
  color: var(--text-2);
  font-size: 17px;
  line-height: 1.7;
}

.vz-stack__line {
  position: absolute;
  top: 19%;
  bottom: 13%;
  left: calc(50% - 58px);
  width: 1px;
  background: var(--border);
}

.vz-stack__items {
  display: grid;
  gap: 0;
}

.vz-stack-card {
  display: grid;
  grid-template-columns: 112px 48px 1fr;
  gap: 22px;
  align-items: center;
  min-height: 120px;
  padding: 12px 0;
}

.vz-stack-card__num {
  justify-self: end;
  font-family: var(--font-mono);
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.vz-stack-card__dot {
  width: 16px;
  height: 16px;
  border: 1px solid var(--text);
  border-radius: 50%;
  background: var(--bg);
  box-shadow: 0 0 0 10px var(--bg);
}

.vz-stack-card h3,
.vz-stage-row h3 {
  margin: 0;
  font-size: clamp(22px, 2.2vw, 32px);
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: 0;
}

.vz-stack-card p,
.vz-stage-row p,
.vz-service-panel p {
  margin: 10px 0 0;
  color: var(--text-2);
  font-size: 15px;
  line-height: 1.55;
}

.vz-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.vz-tags span {
  display: inline-flex;
  align-items: center;
  min-height: 29px;
  padding: 6px 11px;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--text-2);
  background: var(--surface);
}

.vz-services {
  max-width: none;
  padding: 0;
  border-top: 1px solid var(--border-2);
}

.vz-services > .vz-section__label {
  max-width: 1240px;
  margin: 0 auto;
  padding: 112px 40px 0;
}

.vz-services__layout {
  display: grid;
  grid-template-columns: minmax(320px, 0.78fr) minmax(0, 1.22fr);
  gap: 72px;
  max-width: 1240px;
  margin: 0 auto;
  padding: 34px 40px 120px;
}

.vz-services__head {
  position: sticky;
  top: 96px;
  align-self: start;
}

.vz-service-nav {
  display: grid;
  margin-top: 42px;
  border-top: 1px solid var(--border);
}

.vz-service-nav button {
  display: grid;
  grid-template-columns: 46px 1fr;
  gap: 12px;
  width: 100%;
  padding: 17px 2px;
  border: 0;
  border-bottom: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  text-align: left;
  font: 500 15px/1.2 var(--font-ui);
  cursor: pointer;
  transition: color 0.2s ease, padding-left 0.2s ease, border-color 0.2s ease;
}

.vz-service-nav button span {
  font-family: var(--font-mono);
  color: var(--hair);
}

.vz-service-nav button.is-active {
  padding-left: 12px;
  color: var(--text);
  border-bottom-color: var(--text);
}

.vz-service-nav button.is-active span {
  color: var(--text);
}

.vz-service-stage {
  min-height: 620px;
  display: flex;
  align-items: center;
  border-left: 1px solid var(--border);
  padding-left: 58px;
}

.vz-service-panel {
  max-width: 680px;
}

.vz-service-panel > span {
  display: block;
  margin-bottom: 18px;
  font-family: var(--font-mono);
  font-size: clamp(72px, 11vw, 152px);
  line-height: 0.8;
  color: var(--hair);
}

.vz-service-panel h3 {
  margin: 0;
  max-width: 620px;
  font-size: clamp(40px, 6vw, 86px);
  line-height: 0.94;
  font-weight: 700;
  letter-spacing: 0;
}

.vz-service-panel p {
  max-width: 540px;
  margin-top: 26px;
  font-size: 18px;
  line-height: 1.65;
}

.vz-service-enter-active,
.vz-service-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.vz-service-enter-from,
.vz-service-leave-to {
  opacity: 0;
  transform: translateY(18px);
}

.vz-clients {
  padding-top: 120px;
  padding-bottom: 120px;
  background: var(--surface);
  border-top: 1px solid var(--surface-bd);
  max-width: none;
}

.vz-clients > * {
  max-width: 1240px;
  margin-left: auto;
  margin-right: auto;
}

.vz-clients .vz-section__label,
.vz-clients h2,
.vz-client-grid {
  padding-left: 40px;
  padding-right: 40px;
}

.vz-clients h2 {
  max-width: 1040px;
}

.vz-client-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 44px;
}

.vz-client-grid span {
  padding: 13px 18px;
  border: 1px solid var(--surface-bd);
  border-radius: 999px;
  color: var(--text-2);
  background: var(--bg);
}

.vz-stages {
  padding-top: 120px;
  padding-bottom: 120px;
  border-top: 1px solid var(--border-2);
}

.vz-stages__head {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(260px, 0.48fr);
  gap: 56px;
  align-items: start;
}

.vz-stage-list {
  margin-top: 58px;
  border-top: 1px solid var(--border);
}

.vz-stage-row {
  display: grid;
  grid-template-columns: 90px 280px 1fr 130px;
  gap: 30px;
  align-items: baseline;
  padding: 28px 0;
  border-bottom: 1px solid var(--border);
  transition: background 0.2s ease, padding-inline 0.2s ease;
}

.vz-stage-row:hover {
  background: var(--hover);
  padding-inline: 12px;
}

.vz-stage-row > span,
.vz-stage-row small {
  font-family: var(--font-mono);
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vz-stage-row p {
  margin: 0;
}

.vz-stage-row small {
  text-align: right;
}

.vz-contacts {
  max-width: none;
  overflow: hidden;
  padding-top: 140px;
  padding-bottom: 120px;
  border-top: 1px solid var(--border-2);
  text-align: center;
}

.vz-contacts > *:not(.vz-contacts__circle) {
  position: relative;
  z-index: 1;
  max-width: 1240px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 40px;
  padding-right: 40px;
}

.vz-contacts .vz-section__label {
  max-width: 1240px;
  margin-bottom: 34px;
}

.vz-contacts h2 {
  max-width: 960px;
}

.vz-contacts .vz-actions {
  margin-top: 48px;
}

.vz-contacts__circle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(680px, 84vw);
  aspect-ratio: 1;
  border: 1px dashed var(--hair);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

@media (prefers-reduced-motion: reduce) {
  .vz-button,
  .vz-service-enter-active,
  .vz-service-leave-active,
  .vz-intro-enter-active,
  .vz-intro-leave-active {
    transition: none;
  }
}

@media (max-width: 980px) {
  .vz-section,
  .vz-hero,
  .vz-clients,
  .vz-contacts {
    padding-left: 22px;
    padding-right: 22px;
  }

  .vz-hero {
    min-height: auto;
    padding-top: 118px;
    padding-bottom: 64px;
  }

  .vz-hero__meta,
  .vz-hero__stats {
    gap: 10px 14px;
  }

  .vz-hero__meta {
    display: grid;
  }

  .vz-hero__meta span:last-child {
    text-align: left;
  }

  .vz-hero__grid,
  .vz-about,
  .vz-stack__sticky,
  .vz-services__layout,
  .vz-stages__head {
    grid-template-columns: 1fr;
    gap: 36px;
  }

  .vz-hero__seal {
    margin-top: 46px;
  }

  .vz-about {
    padding-top: 72px;
    padding-bottom: 72px;
  }

  .vz-stack {
    min-height: auto;
  }

  .vz-stack__sticky {
    position: relative;
    min-height: auto;
    padding: 74px 22px;
  }

  .vz-stack__line {
    left: 45px;
    top: 250px;
    bottom: 86px;
  }

  .vz-stack-card {
    grid-template-columns: 34px 1fr;
    gap: 10px 16px;
    min-height: 0;
    padding: 18px 0;
  }

  .vz-stack-card__num {
    grid-column: 2;
    justify-self: start;
  }

  .vz-stack-card__dot {
    grid-column: 1;
    grid-row: 1 / span 2;
    margin-top: 3px;
  }

  .vz-stack-card > div:last-child {
    grid-column: 2;
  }

  .vz-services > .vz-section__label {
    padding: 74px 22px 0;
  }

  .vz-services__layout {
    padding: 26px 22px 78px;
  }

  .vz-services__head {
    position: relative;
    top: auto;
  }

  .vz-service-stage {
    min-height: auto;
    border-left: 0;
    border-top: 1px solid var(--border);
    padding: 34px 0 0;
  }

  .vz-clients {
    padding-top: 74px;
    padding-bottom: 76px;
  }

  .vz-clients .vz-section__label,
  .vz-clients h2,
  .vz-client-grid,
  .vz-contacts > *:not(.vz-contacts__circle) {
    padding-left: 22px;
    padding-right: 22px;
  }

  .vz-stages,
  .vz-contacts {
    padding-top: 78px;
    padding-bottom: 78px;
  }

  .vz-stage-row {
    grid-template-columns: 34px 1fr;
    gap: 4px 14px;
    padding: 22px 0;
  }

  .vz-stage-row h3,
  .vz-stage-row p,
  .vz-stage-row small {
    grid-column: 2;
  }

  .vz-stage-row small {
    margin-top: 6px;
    text-align: left;
  }
}

@media (max-width: 560px) {
  .vz-intro {
    padding: 24px;
  }

  .vz-hero h1 {
    font-size: clamp(34px, 10.5vw, 46px);
  }

  .vz-hero__seal strong {
    font-size: clamp(58px, 18vw, 92px);
  }

  .vz-hero__seal span,
  .vz-hero__stats,
  .vz-section__label {
    font-size: 11px;
  }

  .vz-hero__aside p,
  .vz-service-panel p {
    font-size: 16px;
  }

  .vz-button,
  .vz-actions,
  .vz-contacts .vz-button {
    width: 100%;
  }

  .vz-button {
    padding-left: 16px;
    padding-right: 16px;
  }

  .vz-about p {
    font-size: 24px;
  }

  .vz-service-nav button {
    grid-template-columns: 38px 1fr;
    font-size: 14px;
  }

  .vz-service-panel > span {
    font-size: 72px;
  }

  .vz-service-panel h3 {
    font-size: clamp(36px, 11vw, 54px);
  }

  .vz-tags span {
    font-size: 10px;
  }
}
</style>
