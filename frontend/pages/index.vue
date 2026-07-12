<template>
  <div ref="rootRef" class="vz-min" :data-theme="theme">
    <div v-if="showPreloader" ref="preloaderRef" data-preloader class="vz-preloader">
      <div class="vz-preloader__top">
        <span>2026 / Загрузка</span>
        <span>Vezha / Digital</span>
      </div>
      <div class="vz-preloader__bottom">
        <div class="vz-preloader__count"><span>{{ introProgress.toString().padStart(2, "0") }}</span><span>%</span></div>
        <div class="vz-preloader__meta">Пространство 000<br />Base · Moscow</div>
      </div>
    </div>

    <nav class="vz-nav" aria-label="Основная навигация">
      <a class="vz-logo" href="#hero" aria-label="VEZHA Digital">
        <span>VEZHA</span>
        <small>Digital</small>
      </a>
      <div class="vz-nav__links" data-nav-links>
        <a href="#about">Кто мы</a>
        <a href="#stack">Стек</a>
        <a href="#services">Услуги</a>
        <a href="#stages">Этапы</a>
        <a href="#contacts">Контакты</a>
      </div>
      <div class="vz-nav__actions">
        <button class="vz-icon-button" type="button" aria-label="Сменить тему" @click="toggleTheme">
          {{ theme === "dark" ? "☀" : "☾" }}
        </button>
        <a class="vz-nav__cta" href="#contacts" data-nav-cta>Обсудить проект</a>
        <button class="vz-menu-button" type="button" aria-label="Открыть меню" data-nav-toggle @click="isMenuOpen = true">
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>

    <div v-show="isMenuOpen" class="vz-mobile-menu" data-mobile-menu>
      <div class="vz-mobile-menu__top">
        <div class="vz-logo">
          <span>VEZHA</span>
          <small>Digital</small>
        </div>
        <button class="vz-icon-button" type="button" aria-label="Закрыть меню" @click="isMenuOpen = false">✕</button>
      </div>
      <div class="vz-mobile-menu__links">
        <a v-for="item in navItems" :key="item.href" :href="item.href" @click="isMenuOpen = false">{{ item.label }}</a>
      </div>
      <a class="vz-mobile-menu__cta" href="#contacts" @click="isMenuOpen = false">Обсудить проект →</a>
      <div class="vz-mobile-menu__bottom">
        <span>2026 / Веб-студия</span>
        <span>Base / Moscow</span>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="enableSectionLiquid"
        ref="sectionLiquidRef"
        class="vz-section-liquid"
        :data-theme="theme"
        aria-hidden="true"
      >
        <div class="vz-negative-world vz-negative-world--page" data-negative-world="page"></div>
      </div>
    </Teleport>

    <LandingHero
      :marquee-items="marqueeItems"
      @pointer-enter="updateHeroNegative"
      @pointer-move="updateHeroNegative"
      @pointer-leave="resetHeroNegative"
      @hero-ready="setHeroHosts"
    />

    <LandingAbout
      :flow-phase="aboutFlowPhase"
      :flow-cycle-key="aboutFlowCycleKey"
      :snake-segments="aboutFlowSnakeSegments"
      :active-business="activeAboutBusiness"
      :active-product="activeAboutProduct"
      @replay="replayAboutFlow"
      @flow-ready="setAboutFlowHost"
    />

    <LandingStack
      :groups="displayStackGroups"
      :active-index="activeStackIndex"
      :active-layer="activeStackLayer"
      :total="toNumber(displayStackGroups.length)"
      @select="setActiveStackIndex"
      @sphere-ready="setStackSphereHost"
    />

    <LandingServices :services="displayServices" @select="scrollToService" />

    <LandingClients
      v-model:active-index="activeClientSegment"
      :segments="clientSegments"
      @cube-ready="setClientCubeHost"
    />

    <LandingStages :stages="displayStages" />

    <LandingContacts :contact-email="contactEmail" />

    <LandingFooter
      :contact-email="contactEmail"
      :game="footerGame"
      :game-status="footerGameStatus"
      :game-score="footerGameScore"
      :obstacles="footerObstacles"
      @jump="jumpFooterDino"
      @game-ready="setFooterGameHost"
    />
  </div>
</template>

<script setup lang="ts">
import { useFooterRunner } from "~/composables/landing/useFooterRunner";
import { useLandingClientCube } from "~/composables/landing/useLandingClientCube";
import { useLandingLiquid } from "~/composables/landing/useLandingLiquid";
import { useLandingStackSphere } from "~/composables/landing/useLandingStackSphere";
import LandingAbout from "~/components/landing/LandingAbout.vue";
import LandingContacts from "~/components/landing/LandingContacts.vue";
import LandingClients from "~/components/landing/LandingClients.vue";
import LandingFooter from "~/components/landing/LandingFooter.vue";
import LandingHero from "~/components/landing/LandingHero.vue";
import LandingServices from "~/components/landing/LandingServices.vue";
import LandingStack from "~/components/landing/LandingStack.vue";
import LandingStages from "~/components/landing/LandingStages.vue";
import type { IServices } from "~/utils/interfaces/IServices";
import type { ISettings } from "~/utils/interfaces/ISettings";
import type { ITechStack } from "~/utils/interfaces/ITechStack";
import type { IWorkStages } from "~/utils/interfaces/IWorkStages";

definePageMeta({
  layout: false,
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

type ClientSegment = {
  key: string;
  label: string;
  eyebrow: string;
  title: string;
  text: string;
};

type AboutFlowItem = {
  label: string;
  iconPaths: string[];
};

const {
  getServices,
  getTechStack,
  getWorkStages,
  getSettings,
} = useApi();

const rootRef = ref<HTMLElement | null>(null);
const heroRef = ref<HTMLElement | null>(null);
const heroNegativeRef = ref<HTMLElement | null>(null);
const sectionLiquidRef = ref<HTMLElement | null>(null);
const aboutFlowRef = ref<HTMLElement | null>(null);
const stackSphereRef = ref<HTMLElement | null>(null);
const clientCubeRef = ref<HTMLElement | null>(null);
const footerGameRef = ref<HTMLElement | null>(null);
const preloaderRef = ref<HTMLElement | null>(null);
const showPreloader = ref(true);
const introProgress = ref(0);
const theme = ref("light");
const isMenuOpen = ref(false);
const activeStackIndex = ref(0);
const activeClientSegment = ref(0);
const enableMotionLayer = true;
const enableSectionLiquid = true;

function setHeroHosts(hero: HTMLElement | null, negative: HTMLElement | null) {
  heroRef.value = hero;
  heroNegativeRef.value = negative;
}

function setAboutFlowHost(element: HTMLElement | null) {
  aboutFlowRef.value = element;
}

function setStackSphereHost(element: HTMLElement | null) {
  stackSphereRef.value = element;
}

function setClientCubeHost(element: HTMLElement | null) {
  clientCubeRef.value = element;
}

let activeServiceIndex = 0;
let stackWheelAccumulator = 0;
let stackWheelIsLocked = false;
let stackWheelLockUntil = 0;
let stackWheelSnapUntil = 0;

const services = ref<IServices[]>([]);
const techStack = ref<ITechStack[]>([]);
const workStages = ref<IWorkStages[]>([]);
const settings = ref<ISettings | null>(null);

const {
  game: footerGame,
  score: footerGameScore,
  status: footerGameStatus,
  obstacles: footerObstacles,
  setHost: setFooterGameHost,
  jump: jumpFooterDino,
  updateFromScroll: updateFooterGameFromScroll,
} = useFooterRunner(footerGameRef);

const navItems = [
  { href: "#about", label: "Кто мы" },
  { href: "#stack", label: "Стек" },
  { href: "#services", label: "Услуги" },
  { href: "#stages", label: "Этапы" },
  { href: "#contacts", label: "Контакты" },
];

const marqueeItems = [
  "Веб-разработка под ключ",
  "Telegram Mini Apps",
  "Telegram боты",
  "Веб-сайты",
  "Интернет-магазины",
  "AI и автоматизация",
  "Корпоративные системы",
];

const fallbackServices: DisplayService[] = [
  { n: "01", title: "Telegram Mini Apps", desc: "Полноценные приложения внутри Telegram: каталог, профиль, оплата.", meta: ["Каталог", "Оплата", "Профиль"] },
  { n: "02", title: "Telegram боты", desc: "Автоматизация продаж, записи и поддержки прямо в чате.", meta: ["Продажи", "Запись", "Поддержка"] },
  { n: "03", title: "Веб-сайты", desc: "Лендинги и корпоративные сайты, которые быстро грузятся и продают.", meta: ["Лендинги", "Корпоративные", "SEO"] },
  { n: "04", title: "Интернет-магазины", desc: "Каталог, корзина, оплата и интеграции со складом и CRM.", meta: ["Корзина", "Оплата", "CRM"] },
  { n: "05", title: "AI и автоматизация", desc: "Ассистенты и обработка заявок на стороне ИИ — меньше рутины.", meta: ["Ассистенты", "Заявки", "Интеграции"] },
  { n: "06", title: "Корпоративные системы", desc: "Внутренние порталы, CRM и учётные системы под ваши процессы.", meta: ["CRM", "Порталы", "Учёт"] },
  { n: "07", title: "Мобильные приложения", desc: "Нативные и кроссплатформенные приложения для iOS и Android.", meta: ["iOS", "Android", "PWA"] },
];

const fallbackStackGroups: StackGroup[] = [
  { title: "Frontend", description: "Интерфейсы, которые быстро грузятся и удобно работают на любом устройстве.", items: ["React", "Vue 3", "Next.js", "TypeScript", "Tailwind"] },
  { title: "Backend", description: "Надёжная серверная часть, которая не ляжет под нагрузкой и легко масштабируется.", items: ["Python", "FastAPI", "PostgreSQL", "Redis"] },
  { title: "DevOps", description: "Стабильный деплой и мониторинг: предсказуемые релизы и аптайм без сюрпризов.", items: ["Docker", "Nginx", "CI/CD", "Linux"] },
  { title: "Mobile", description: "Мобильные приложения и PWA с нативным ощущением на iOS и Android.", items: ["React Native", "Expo", "PWA", "Flutter"] },
];

const devOpsTechNames = new Set(["docker", "nginx", "ci/cd", "ci cd", "linux", "kubernetes", "github actions", "gitlab ci"]);

const clientSegments: ClientSegment[] = [
  {
    key: "private",
    label: "Частные лица",
    eyebrow: "Личный запуск",
    title: "Сайт, бот или мини-продукт без лишней сложности",
    text: "Собираем понятную первую версию: портфолио, лендинг, запись, оплату или Telegram-инструмент. Берём на себя структуру, дизайн, запуск и спокойное сопровождение после релиза.",
  },
  {
    key: "small-business",
    label: "Малый/средний бизнес",
    eyebrow: "Продажи и процессы",
    title: "Цифровой контур, который помогает расти каждый день",
    text: "Делаем сайты, магазины, Mini Apps, CRM-связки и автоматизацию заявок. Подключаем оплату, аналитику, склад, Telegram и внутренние сценарии, чтобы команда тратила меньше времени на ручную работу.",
  },
  {
    key: "enterprise",
    label: "Корпорации",
    eyebrow: "Системный уровень",
    title: "Надёжные сервисы под сложные команды и регламенты",
    text: "Проектируем корпоративные порталы, личные кабинеты, интеграции и админ-панели с ролями, безопасностью и предсказуемым релизным процессом. Документируем решения и держим архитектуру масштабируемой.",
  },
];

const aboutBusinessItems: AboutFlowItem[] = [
  {
    label: "Частный спец.",
    iconPaths: [
      "M20 21a8 8 0 0 0-16 0",
      "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    ],
  },
  {
    label: "Эксперт",
    iconPaths: [
      "M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
      "M9 14 7 22l5-3 5 3-2-8",
    ],
  },
  {
    label: "Мастерская",
    iconPaths: [
      "M14.7 6.3a4 4 0 0 0-5-5l2.1 2.1-2.8 2.8-2.1-2.1a4 4 0 0 0 5 5l-8.6 8.6a2 2 0 0 0 2.8 2.8l8.6-8.6a4 4 0 0 0 5-5l-2.1 2.1-2.8-2.8 2.1-2.1a4 4 0 0 0-5 0Z",
    ],
  },
  {
    label: "Салон",
    iconPaths: [
      "M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
      "M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
      "M8.7 8.7 21 3",
      "M8.7 15.3 21 21",
      "M9 12h4",
    ],
  },
  {
    label: "Кафе",
    iconPaths: [
      "M4 7h13v8a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V7Z",
      "M17 9h2a3 3 0 0 1 0 6h-2",
      "M7 3v1",
      "M11 3v1",
      "M15 3v1",
    ],
  },
  {
    label: "Клиника",
    iconPaths: ["M8 3h8v5h5v8h-5v5H8v-5H3V8h5V3Z"],
  },
  {
    label: "Студия",
    iconPaths: [
      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
      "M14.3 8h6.9",
      "M9.7 8 4 17.9",
      "M7.4 12h-5.8",
      "M9.7 16h-6.9",
      "M14.3 16 20 6.1",
      "M16.6 12h5.8",
    ],
  },
  {
    label: "E-commerce",
    iconPaths: [
      "M6 8h12l1 13H5L6 8Z",
      "M9 10V6a3 3 0 0 1 6 0v4",
    ],
  },
  {
    label: "B2B-команда",
    iconPaths: [
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
      "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
      "M22 21v-2a4 4 0 0 0-3-3.9",
      "M16 3.1a4 4 0 0 1 0 7.8",
    ],
  },
  {
    label: "Корпорация",
    iconPaths: [
      "M4 21V3h10v18",
      "M14 9h6v12",
      "M2 21h20",
      "M7 7h1M11 7h1M7 11h1M11 11h1M7 15h1M11 15h1M17 13h1M17 17h1",
    ],
  },
];

const aboutProductItems: AboutFlowItem[] = [
  {
    label: "CRM",
    iconPaths: [
      "M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3Z",
      "M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6",
      "M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
    ],
  },
  {
    label: "Telegram Mini App",
    iconPaths: [
      "M22 2 11 13",
      "M22 2 15 22l-4-9-9-4 20-7Z",
    ],
  },
  {
    label: "Сайт",
    iconPaths: [
      "M3 4h18v16H3V4Z",
      "M3 8h18",
      "M7 6h.01",
    ],
  },
  {
    label: "Лендинг",
    iconPaths: [
      "M3 3h18v18H3V3Z",
      "M7 7h10",
      "M7 11h6",
      "M7 16h4",
    ],
  },
  {
    label: "Бот",
    iconPaths: [
      "M5 8h14v11H5V8Z",
      "M8 3h8",
      "M12 3V1",
      "M9 12h.01M15 12h.01",
      "M9 16h6",
    ],
  },
  {
    label: "Интернет-магазин",
    iconPaths: [
      "M3 4h2l2 12h10l3-8H6",
      "M9 21h.01M17 21h.01",
    ],
  },
  {
    label: "Личный кабинет",
    iconPaths: [
      "M3 5h18v14H3V5Z",
      "M8 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
      "M5 17a3 3 0 0 1 6 0",
      "M14 10h4M14 14h4",
    ],
  },
  {
    label: "Дашборд",
    iconPaths: [
      "M3 3h7v7H3V3Z",
      "M14 3h7v7h-7V3Z",
      "M3 14h7v7H3v-7Z",
      "M14 14h7v7h-7v-7Z",
    ],
  },
  {
    label: "PWA",
    iconPaths: [
      "M7 2h10v20H7V2Z",
      "M11 18h2",
    ],
  },
  {
    label: "AI-ассистент",
    iconPaths: [
      "M12 3l1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z",
      "M19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z",
      "M5 13l.5 1.5L7 15l-1.5.5L5 17l-.5-1.5L3 15l1.5-.5L5 13Z",
    ],
  },
];

const aboutFlowSnakeSegments = [
  { key: "design", path: "M 32 50 C 37 50 39 70 44 70", begin: "1.07s" },
  { key: "ux", path: "M 44 70 C 49 70 48 30 53 30", begin: "1.52s" },
  { key: "development", path: "M 53 30 C 58 30 58 66 63 66", begin: "1.97s" },
  { key: "testing", path: "M 63 66 C 68 66 69 34 74 34", begin: "2.42s" },
  { key: "product", path: "M 74 34 C 80 34 82 50 86.5 50", begin: "2.87s" },
];

const aboutFlowSignalArrivalMs = 3320;
const aboutFlowProductEnterMs = 120;
const aboutFlowResultDelayMs = aboutFlowSignalArrivalMs - aboutFlowProductEnterMs;
const aboutFlowBusinessIndex = ref(0);
const activeAboutProduct = ref<AboutFlowItem | null>(null);
const aboutFlowPhase = ref<"signal" | "result">("result");
const aboutFlowCycleKey = ref(0);
const activeAboutBusiness = computed<AboutFlowItem>(() => aboutBusinessItems[aboutFlowBusinessIndex.value] || aboutBusinessItems[0]!);
let aboutFlowResultTimer: ReturnType<typeof setTimeout> | null = null;
let aboutFlowObserver: IntersectionObserver | null = null;

const fallbackStages: DisplayStage[] = [
  { n: "01", title: "Анализ", desc: "Изучаем бизнес, цели и аудиторию, фиксируем техническое задание.", dur: "1–3 дня" },
  { n: "02", title: "Проектирование", desc: "Прототипы экранов, архитектура системы и UX-логика продукта.", dur: "2–4 дня" },
  { n: "03", title: "Дизайн", desc: "Визуальная концепция, UI Kit и адаптив под устройства.", dur: "3–7 дней" },
  { n: "04", title: "Разработка", desc: "Frontend, Backend, API-интеграции и code review.", dur: "7–21 день" },
  { n: "05", title: "Тестирование", desc: "Функциональное и нагрузочное тестирование, фикс багов.", dur: "2–5 дней" },
  { n: "06", title: "Запуск", desc: "Деплой на сервер, настройка CI/CD и мониторинга.", dur: "1–2 дня" },
  { n: "07", title: "Поддержка", desc: "Мониторинг, обновления, доработки и консультации.", dur: "Ongoing" },
];

const displayServices = computed<DisplayService[]>(() => {
  if (!services.value.length) return fallbackServices;

  return services.value.slice(0, 7).map((service, index) => ({
    n: toNumber(index + 1),
    title: service.name || service.title || fallbackServices[index]?.title || "Услуга",
    desc: service.description || service.about || fallbackServices[index]?.desc || "Проектируем и запускаем продукт под задачу бизнеса.",
    meta: service.features?.slice(0, 3).map((feature) => feature.text) || fallbackServices[index]?.meta || [],
  }));
});

const displayStackGroups = computed<StackGroup[]>(() => {
  if (!techStack.value.length) return fallbackStackGroups;

  const grouped = techStack.value.reduce<Record<string, string[]>>((acc, item) => {
    const name = item.name?.trim();
    if (!name) return acc;

    let key = normalizeStackCategory(item.category);
    if (key === "backend" && devOpsTechNames.has(normalizeTechName(name))) key = "devops";

    acc[key] ||= [];
    acc[key].push(name);
    return acc;
  }, {});

  return fallbackStackGroups.map((fallback) => {
    const key = normalizeStackCategory(fallback.title);

    return {
      ...fallback,
      items: mergeStackItems(grouped[key] || [], fallback.items),
    };
  });
});

const activeStackLayer = computed(() => {
  const title = displayStackGroups.value[activeStackIndex.value]?.title?.toLowerCase() || "frontend";
  if (title.includes("backend")) return "core";
  if (title.includes("devops")) return "bridge";
  if (title.includes("mobile")) return "all";
  return "surface";
});
function pickNextAboutProduct(): AboutFlowItem | null {
  if (aboutProductItems.length <= 1) return aboutProductItems[0] || null;

  let next = activeAboutProduct.value;
  while (next?.label === activeAboutProduct.value?.label) {
    next = aboutProductItems[Math.floor(Math.random() * aboutProductItems.length)] || null;
  }

  return next;
}

function clearAboutFlowResultTimer() {
  if (!aboutFlowResultTimer) return;
  clearTimeout(aboutFlowResultTimer);
  aboutFlowResultTimer = null;
}

function runAboutFlowCycle(advanceBusiness = true) {
  clearAboutFlowResultTimer();
  if (advanceBusiness) {
    aboutFlowBusinessIndex.value = (aboutFlowBusinessIndex.value + 1) % aboutBusinessItems.length;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    activeAboutProduct.value = pickNextAboutProduct();
    aboutFlowPhase.value = "result";
    return;
  }

  activeAboutProduct.value = null;
  aboutFlowPhase.value = "signal";
  aboutFlowCycleKey.value += 1;

  aboutFlowResultTimer = setTimeout(() => {
    activeAboutProduct.value = pickNextAboutProduct();
    aboutFlowPhase.value = "result";
    aboutFlowResultTimer = null;
  }, aboutFlowResultDelayMs);
}

function replayAboutFlow() {
  runAboutFlowCycle(true);
}

function setupAboutFlowObserver() {
  if (!aboutFlowRef.value) return;

  if (!("IntersectionObserver" in window)) {
    runAboutFlowCycle(false);
    return;
  }

  aboutFlowObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    runAboutFlowCycle(false);
    aboutFlowObserver?.disconnect();
    aboutFlowObserver = null;
  }, { threshold: 0.42 });

  aboutFlowObserver.observe(aboutFlowRef.value);
}

function stopAboutFlow() {
  aboutFlowObserver?.disconnect();
  aboutFlowObserver = null;
  clearAboutFlowResultTimer();
}

const displayStages = computed<DisplayStage[]>(() => {
  if (!workStages.value.length) return fallbackStages;

  return workStages.value.slice(0, 7).map((stage, index) => ({
    n: toNumber(stage.step_number || index + 1),
    title: stage.title,
    desc: stage.description || stage.full_description,
    dur: stage.duration || fallbackStages[index]?.dur || "По плану",
  }));
});

const contactEmail = computed(() => settings.value?.contact_email || "contact@vezha.digital");

const {
  setup: setupStackSphereScene,
  updatePosition: updateStackSpherePosition,
  cleanup: cleanupStackSphere,
} = useLandingStackSphere({
  hostRef: stackSphereRef,
  activeLayer: activeStackLayer,
});

const {
  setup: setupClientCubeScene,
  updatePosition: updateClientCubePosition,
  setStage: updateClientCubeStage,
  cleanup: cleanupClientCube,
} = useLandingClientCube({
  rootRef,
  hostRef: clientCubeRef,
  activeSegment: activeClientSegment,
  segmentCount: clientSegments.length,
});

const {
  updateHeroNegative,
  resetHeroNegative,
  startHeroNegative,
  startSectionLiquid,
  forceSectionLiquidTarget,
  syncNegativeWorlds,
  setSectionLiquidScrollY,
  cleanup: cleanupLandingLiquid,
} = useLandingLiquid({
  rootRef,
  heroRef,
  heroNegativeRef,
  sectionLiquidRef,
  theme,
  showPreloader,
  activeStackIndex,
  activeClientSegment,
  getServicesCount: () => displayServices.value.length,
  getStackGroupsCount: () => displayStackGroups.value.length,
  getStagesCount: () => displayStages.value.length,
  getActiveServiceIndex: () => activeServiceIndex,
  isStackWheelLocked: () => stackWheelIsLocked,
  enabled: enableSectionLiquid,
});

function toNumber(value: number) {
  return value.toString().padStart(2, "0");
}

function clampServiceIndex(index: number, length = displayServices.value.length) {
  return Math.max(0, Math.min(Math.max(0, length - 1), index));
}

function clampStackIndex(index: number, length = displayStackGroups.value.length) {
  return Math.max(0, Math.min(Math.max(0, length - 1), index));
}

function clampValue(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeTechName(value: string) {
  return value.trim().toLowerCase();
}

function normalizeStackCategory(value?: string) {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized.includes("front")) return "frontend";
  if (normalized.includes("back")) return "backend";
  if (normalized.includes("dev") || normalized.includes("ops") || normalized.includes("infra")) return "devops";
  if (normalized.includes("mobile") || normalized.includes("app")) return "mobile";
  return "backend";
}

function mergeStackItems(primary: string[], fallback: string[]) {
  const seen = new Set<string>();

  return [...primary, ...fallback].filter((item) => {
    const key = normalizeTechName(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);
}

function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  localStorage.setItem("vz_theme", theme.value);
  requestAnimationFrame(() => syncNegativeWorlds(true));
}

function setActiveStackIndex(index: number) {
  const nextIndex = clampStackIndex(index);
  if (activeStackIndex.value === nextIndex) return;

  activeStackIndex.value = nextIndex;
  updateScrollEffects();
  syncNegativeWorlds(true);
}

function normalizeWheelDeltaY(event: WheelEvent) {
  if (event.deltaMode === 1) return event.deltaY * 16;
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

function isStackWheelLockReady(section: HTMLElement) {
  const rect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const topGuard = window.innerWidth > 900 ? 76 : 56;
  const bottomGuard = window.innerWidth > 900 ? 72 : 44;
  const topLockTolerance = window.innerWidth > 900 ? 14 : 10;
  const maxVisibleHeight = Math.min(rect.height, viewportHeight);
  if (maxVisibleHeight <= 0) return false;

  const visibleHeight = clampValue(
    Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0),
    0,
    maxVisibleHeight,
  );
  const visibleRatio = visibleHeight / maxVisibleHeight;
  const sectionFitsViewport = rect.height <= viewportHeight - topGuard - bottomGuard;

  if (sectionFitsViewport) {
    const targetTop = getStackLockTargetTop(section);
    const topTolerance = Math.max(48, viewportHeight * 0.055);

    return (
      Math.abs(rect.top - targetTop) <= topTolerance &&
      visibleRatio >= 0.98
    );
  }

  return (
    rect.top <= topLockTolerance &&
    rect.top >= -topGuard &&
    rect.bottom >= viewportHeight - bottomGuard &&
    visibleRatio >= 0.94
  );
}

function getStackLockTargetTop(section: HTMLElement) {
  const rect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const topGuard = window.innerWidth > 900 ? 76 : 56;
  const bottomGuard = window.innerWidth > 900 ? 72 : 44;
  const sectionFitsViewport = rect.height <= viewportHeight - topGuard - bottomGuard;

  if (!sectionFitsViewport) return 0;

  const freeSpace = Math.max(0, viewportHeight - rect.height);
  return Math.max(topGuard, freeSpace / 2);
}

function getStackLockScrollY(section: HTMLElement) {
  const rect = section.getBoundingClientRect();
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return clampValue(window.scrollY + rect.top - getStackLockTargetTop(section), 0, maxScroll);
}

function shouldSnapStackIntoLock(section: HTMLElement, direction: number) {
  const rect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const topGuard = window.innerWidth > 900 ? 76 : 56;
  const bottomGuard = window.innerWidth > 900 ? 72 : 44;
  const snapLine = Math.max(28, topGuard * 0.46);
  const targetTop = getStackLockTargetTop(section);
  const sectionFitsViewport = rect.height <= viewportHeight - topGuard - bottomGuard;
  const atStart = activeStackIndex.value <= 0;
  const atEnd = activeStackIndex.value >= displayStackGroups.value.length - 1;

  if (direction > 0 && atEnd && rect.top < topGuard + 48 && rect.bottom > 0) return false;
  if (direction < 0 && atStart && rect.top > -48 && rect.top < viewportHeight) return false;

  if (sectionFitsViewport) {
    const snapWindow = Math.max(84, viewportHeight * 0.095);

    return (
      rect.top >= targetTop - snapWindow &&
      rect.top <= targetTop + snapWindow &&
      rect.bottom <= viewportHeight + bottomGuard &&
      rect.bottom >= rect.height * 0.62
    );
  }

  if (direction > 0) {
    return (
      rect.top > -topGuard &&
      rect.top <= snapLine &&
      rect.bottom >= viewportHeight - bottomGuard
    );
  }

  return (
    rect.bottom >= viewportHeight - snapLine &&
    rect.bottom <= viewportHeight + topGuard &&
    rect.top <= topGuard
  );
}

function snapStackIntoLock(section: HTMLElement, direction: number, now: number) {
  stackWheelAccumulator = 0;
  stackWheelIsLocked = true;
  stackWheelSnapUntil = now + 420;
  stackWheelLockUntil = now + 520;

  setActiveStackIndex(direction > 0 ? 0 : displayStackGroups.value.length - 1);
  forceSectionLiquidTarget("stack");
  window.scrollTo({
    top: getStackLockScrollY(section),
    behavior: "smooth",
  });
}

function releaseStackFromLock(section: HTMLElement, direction: number, now: number) {
  const rect = section.getBoundingClientRect();
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const distance = Math.min(rect.height, window.innerHeight * 0.82);
  const targetY = clampValue(window.scrollY + distance * direction, 0, maxScroll);

  stackWheelAccumulator = 0;
  stackWheelIsLocked = false;
  stackWheelSnapUntil = now + 360;
  stackWheelLockUntil = now + 360;

  window.scrollTo({
    top: targetY,
    behavior: "smooth",
  });
}

function handleStackWheel(event: WheelEvent) {
  if (window.innerWidth <= 900 || displayStackGroups.value.length < 2) return;
  if (event.ctrlKey) return;
  const section = rootRef.value?.querySelector<HTMLElement>("[data-stack-section]");
  if (!section) return;

  const now = performance.now();
  const delta = normalizeWheelDeltaY(event);
  if (delta === 0) return;
  const direction = delta > 0 ? 1 : -1;

  if (now < stackWheelSnapUntil) {
    if (!event.cancelable) return;
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (!isStackWheelLockReady(section)) {
    stackWheelAccumulator = 0;
    stackWheelIsLocked = false;
    if (!shouldSnapStackIntoLock(section, direction)) return;
    if (!event.cancelable) return;
    event.preventDefault();
    event.stopPropagation();
    snapStackIntoLock(section, direction, now);
    return;
  }

  if (!stackWheelIsLocked) {
    stackWheelIsLocked = true;
    forceSectionLiquidTarget("stack");
  }

  const atStart = activeStackIndex.value <= 0;
  const atEnd = activeStackIndex.value >= displayStackGroups.value.length - 1;

  if ((direction < 0 && atStart) || (direction > 0 && atEnd)) {
    stackWheelAccumulator = 0;
    if (!event.cancelable) return;
    event.preventDefault();
    event.stopPropagation();
    releaseStackFromLock(section, direction, now);
    return;
  }

  if (!event.cancelable) return;
  event.preventDefault();
  event.stopPropagation();

  if (now < stackWheelLockUntil) return;

  stackWheelAccumulator += delta;
  if (Math.abs(stackWheelAccumulator) < 64) return;

  setActiveStackIndex(activeStackIndex.value + (stackWheelAccumulator > 0 ? 1 : -1));
  stackWheelAccumulator = 0;
  stackWheelLockUntil = now + 520;
}




function runPreloader() {
  const seen = sessionStorage.getItem("vz_loaded") === "1";
  if (seen) {
    showPreloader.value = false;
    return;
  }

  const duration = 1150;
  const started = performance.now();

  const step = (now: number) => {
    const progress = Math.min(1, (now - started) / duration);
    introProgress.value = Math.round((1 - Math.pow(1 - progress, 2)) * 100);

    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }

    sessionStorage.setItem("vz_loaded", "1");
    if (preloaderRef.value) {
      preloaderRef.value.style.transform = "translateY(-100%)";
      preloaderRef.value.style.pointerEvents = "none";
    }
    window.setTimeout(() => {
      showPreloader.value = false;
    }, 900);
  };

  requestAnimationFrame(step);
}

function setupReveals() {
  const root = rootRef.value;
  if (!root) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;
  if (enableMotionLayer) root.classList.add("vz-motion-ready");

  root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
    if (element.dataset.revealed) return;
    element.style.transform = "translateY(110%)";
    element.style.opacity = "0";
    element.style.filter = "";
    element.style.willChange = "transform";
  });

  root.querySelectorAll<HTMLElement>("[data-clip-reveal]").forEach((element) => {
    if (element.dataset.clipped) return;
    element.style.clipPath = "inset(0 100% 0 0)";
  });
}

function scanReveals() {
  const root = rootRef.value;
  if (!root) return;
  const vh = window.innerHeight;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
    const wrap = element.parentElement || element;
    const rect = wrap.getBoundingClientRect();
    const inView = rect.top < vh * 0.92 && rect.bottom > -40;

    if (reduceMotion || inView) {
      if (!element.dataset.revealed) {
        element.dataset.revealed = "1";
        element.style.transition = "transform 1s cubic-bezier(.16,1,.3,1), opacity .9s ease";
      }
      element.style.transform = "translateY(0)";
      element.style.opacity = "1";
      element.style.filter = "";
    }
  });

  root.querySelectorAll<HTMLElement>("[data-clip-reveal]").forEach((element) => {
    const rect = element.getBoundingClientRect();
    const inView = rect.top < vh * 0.86 && rect.bottom > -40;
    if (reduceMotion || inView) {
      if (!element.dataset.clipped) {
        element.dataset.clipped = "1";
        element.style.transition = "clip-path 1.5s cubic-bezier(.16,1,.3,1)";
      }
      element.style.clipPath = "inset(0 0% 0 0)";
    }
  });
}

function scanSectionEntrances() {
  const root = rootRef.value;
  if (!root) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sections = root.querySelectorAll<HTMLElement>("#hero, #about, [data-stack-section], [data-services-pin], #clients, #stages, #contacts, .vz-footer");

  sections.forEach((section) => {
    if (section.classList.contains("is-motion-visible")) return;
    if (!enableMotionLayer || reduceMotion) {
      section.classList.add("is-motion-visible");
      return;
    }

    const rect = section.getBoundingClientRect();
    const triggerTop = window.innerHeight * 0.84;
    const triggerBottom = window.innerHeight * 0.08;
    if (rect.top < triggerTop && rect.bottom > triggerBottom) {
      section.classList.add("is-motion-visible");
    }
  });
}

function updateScrollEffects() {
  const root = rootRef.value;
  if (!root) return;
  scanSectionEntrances();
  scanReveals();

  const stack = root.querySelector<HTMLElement>("[data-stack-section]");
  const stackItems = root.querySelectorAll<HTMLElement>("[data-stack-item]");
  const stackFill = root.querySelector<HTMLElement>("[data-line-fill]");
  const stackCounter = root.querySelector<HTMLElement>("[data-stack-counter]");

  if (stack && stackItems.length) {
    const active = clampStackIndex(activeStackIndex.value, stackItems.length);
    activeStackIndex.value = active;
    const progress = stackItems.length > 1 ? active / (stackItems.length - 1) : 1;
    updateStackSpherePosition();

    stackItems.forEach((item, index) => {
      const isActive = index === active;
      const isPast = index < active;
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";

      const dot = item.querySelector<HTMLElement>("[data-dot]");
      const label = item.querySelector<HTMLElement>("[data-label]");
      const halo = item.querySelector<HTMLElement>("[data-halo]");
      if (dot) {
        dot.style.background = isActive ? "var(--ink)" : "var(--dot)";
        dot.style.borderColor = isActive || isPast ? "var(--ink)" : "var(--dotbd)";
        dot.style.transform = `scale(${isActive ? 1.3 : 1})`;
      }
      if (label) label.style.color = isActive || isPast ? "var(--ink)" : "var(--idle)";
      if (halo) halo.style.opacity = isActive ? "1" : "0";
    });

    if (stackFill) stackFill.style.height = `${(progress * 100).toFixed(2)}%`;
    if (stackCounter) stackCounter.textContent = toNumber(active + 1);
  }

  const servicesSection = root.querySelector<HTMLElement>("[data-services-pin]");
  if (!servicesSection) return;
  const panels = root.querySelectorAll<HTMLElement>("[data-serv-panel]");
  const navs = root.querySelectorAll<HTMLElement>("[data-serv-nav]");
  const bar = root.querySelector<HTMLElement>("[data-serv-bar]");
  const counter = root.querySelector<HTMLElement>("[data-serv-counter]");
  const active = clampServiceIndex(activeServiceIndex, panels.length);
  activeServiceIndex = active;
  const steppedProgress = panels.length > 1 ? active / (panels.length - 1) : 1;

  panels.forEach((panel, index) => {
    const on = index === active;
    panel.style.opacity = on ? "1" : "0";
    panel.style.transform = on ? "translateY(0)" : `translateY(${index < active ? -36 : 36}px)`;
    panel.style.pointerEvents = on ? "auto" : "none";
    panel.style.zIndex = on ? "2" : "1";
    panel.setAttribute("aria-hidden", on ? "false" : "true");
  });

  navs.forEach((nav, index) => {
    const on = index === active;
    const label = nav.querySelector<HTMLElement>("[data-serv-nav-label]");
    const num = nav.querySelector<HTMLElement>("[data-serv-nav-num]");
    if (label) {
      label.style.color = on ? "var(--ink)" : "var(--muted2)";
      label.style.fontWeight = on ? "600" : "400";
    }
    if (num) num.style.color = on ? "var(--ink)" : "var(--hair)";
    nav.style.borderBottomColor = on ? "var(--ink)" : "var(--border)";
    nav.style.paddingLeft = on ? "12px" : "2px";
  });

  if (bar) bar.style.width = `${(steppedProgress * 100).toFixed(2)}%`;
  if (counter) counter.textContent = `${toNumber(active + 1)} / ${toNumber(panels.length)}`;
}

function scrollToService(index: number) {
  activeServiceIndex = clampServiceIndex(index);
  updateScrollEffects();
  syncNegativeWorlds(true);
}


let raf = 0;
let isPageUnmounted = false;
function scheduleUpdate() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    updateScrollEffects();
    updateClientCubePosition();
    updateFooterGameFromScroll();
    syncNegativeWorlds();
  });
}

onMounted(async () => {
  isPageUnmounted = false;
  theme.value = localStorage.getItem("vz_theme") || "light";
  runPreloader();
  setupReveals();
  updateScrollEffects();
  setSectionLiquidScrollY();
  await nextTick();
  if (isPageUnmounted) return;
  syncNegativeWorlds(true);
  updateStackSpherePosition();
  updateClientCubePosition();
  startHeroNegative();
  startSectionLiquid();
  setupAboutFlowObserver();
  void setupStackSphereScene();
  void setupClientCubeScene();
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("wheel", handleStackWheel, { passive: false, capture: true });
  window.addEventListener("resize", scheduleUpdate);

  try {
    const [
      servicesData,
      techStackData,
      workStagesData,
      settingsData,
    ] = await Promise.all([
      getServices(),
      getTechStack(),
      getWorkStages(),
      getSettings(),
    ]);

    if (isPageUnmounted) return;

    services.value = servicesData;
    techStack.value = techStackData;
    workStages.value = workStagesData;
    settings.value = settingsData.settings;
    await nextTick();
    if (isPageUnmounted) return;
    setupReveals();
    updateScrollEffects();
    updateStackSpherePosition();
    updateClientCubePosition();
    syncNegativeWorlds(true);
    startHeroNegative();
  } catch (error) {
    if (isPageUnmounted) return;
    console.info("VEZHA public data fallback is active:", error);
    await nextTick();
    if (isPageUnmounted) return;
    updateStackSpherePosition();
    updateClientCubePosition();
    syncNegativeWorlds(true);
    startHeroNegative();
  }
});

watch(activeClientSegment, async () => {
  updateClientCubeStage(activeClientSegment.value);
  await nextTick();
  updateClientCubePosition();
  syncNegativeWorlds(true);
});

onBeforeUnmount(() => {
  isPageUnmounted = true;
  window.removeEventListener("scroll", scheduleUpdate);
  window.removeEventListener("wheel", handleStackWheel, { capture: true });
  window.removeEventListener("resize", scheduleUpdate);
  if (raf) cancelAnimationFrame(raf);
  stopAboutFlow();
  cleanupLandingLiquid();
  cleanupStackSphere();
  cleanupClientCube();
});

watch(displayStackGroups, () => {
  activeStackIndex.value = clampStackIndex(activeStackIndex.value);
  updateScrollEffects();
  void nextTick(updateStackSpherePosition);
});

watch(displayServices, async () => {
  await nextTick();
  updateScrollEffects();
  syncNegativeWorlds(true);
  startSectionLiquid();
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
      href: "https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
    },
  ],
});
</script>

<style src="~/assets/css/landing-redesign.css"></style>
