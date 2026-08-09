<template>
  <div ref="rootRef" class="vz-min" :data-theme="theme">
    <div v-if="showPreloader" ref="preloaderRef" data-preloader class="vz-preloader">
      <div class="vz-preloader__top">
        <span>{{ copy.preloader.loading }}</span>
        <span>Vezha / Digital</span>
      </div>
      <div class="vz-preloader__bottom">
        <div class="vz-preloader__count"><span>{{ introProgress.toString().padStart(2, "0") }}</span><span>%</span></div>
        <div class="vz-preloader__meta">
          <template v-for="(item, index) in copy.preloader.meta.filter(Boolean)" :key="item">
            <br v-if="index" />{{ item }}
          </template>
        </div>
      </div>
    </div>

    <nav class="vz-nav" :aria-label="copy.nav.aria">
      <a class="vz-logo" href="#hero" aria-label="VEZHA Digital">
        <span>VEZHA</span>
        <small>Digital</small>
      </a>
      <div class="vz-nav__links" data-nav-links>
        <a v-for="item in navItems" :key="item.href" :href="item.href">{{ item.label }}</a>
      </div>
      <div class="vz-nav__actions">
        <button class="vz-icon-button" type="button" :aria-label="copy.nav.themeAria" @click="toggleTheme">
          {{ theme === "dark" ? "☀" : "☾" }}
        </button>
        <a class="vz-nav__cta" href="#contacts" data-nav-cta>{{ copy.nav.cta }}</a>
        <button class="vz-menu-button" type="button" :aria-label="copy.nav.menuOpen" data-nav-toggle @click="isMenuOpen = true">
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
        <div class="vz-mobile-menu__controls">
          <button class="vz-icon-button" type="button" :aria-label="copy.nav.themeAria" @click="toggleTheme">
            {{ theme === "dark" ? "☀" : "☾" }}
          </button>
          <button class="vz-icon-button" type="button" :aria-label="copy.nav.menuClose" @click="isMenuOpen = false">✕</button>
        </div>
      </div>
      <div class="vz-mobile-menu__links">
        <a v-for="item in navItems" :key="item.href" :href="item.href" @click="isMenuOpen = false">{{ item.label }}</a>
      </div>
      <a class="vz-mobile-menu__cta" href="#contacts" @click="isMenuOpen = false">{{ copy.nav.mobileCta }}</a>
      <div class="vz-mobile-menu__bottom">
        <span>{{ copy.hero.meta[0] }}</span>
        <span>{{ copy.hero.meta[1] }}</span>
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
        <div class="vz-section-liquid__target" data-section-liquid-target hidden></div>
      </div>
    </Teleport>

    <LandingHero
      :copy="copy.hero"
      :marquee-aria="copy.marqueeAria"
      :marquee-items="marqueeItems"
      @pointer-enter="updateHeroNegative"
      @pointer-move="updateHeroNegative"
      @pointer-leave="resetHeroNegative"
      @hero-ready="setHeroHosts"
    />

    <LandingAbout
      :copy="copy.about"
      :flow-phase="aboutFlowPhase"
      :flow-cycle-key="aboutFlowCycleKey"
      :active-step-index="aboutFlowStepIndex"
      :snake-segments="aboutFlowSnakeSegments"
      :active-business="activeAboutBusiness"
      :active-product="activeAboutProduct"
      @replay="replayAboutFlow"
      @flow-ready="setAboutFlowHost"
    />

    <LandingStack
      :groups="displayStackGroups"
      :copy="copy.stack"
      @active-change="handleStackActiveChange"
    />

    <LandingServices
      :services="displayServices"
      :copy="copy.services"
      @active-change="handleServiceActiveChange"
    />

    <LandingClients
      v-model:active-index="activeClientSegment"
      :copy="copy.clients"
      :segments="clientSegments"
      @cube-ready="setClientCubeHost"
    />

    <LandingCases
      :projects="projects"
      :fallback="caseFallbacks"
      :copy="casesCopy"
    />

    <LandingContacts :copy="copy.contacts" :contact-email="contactEmail" />

    <LandingFooter
      :copy="copy.footer"
      :contact-email="contactEmail"
      :nav-items="footerNavItems"
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
import LandingAbout from "~/components/landing/LandingAbout.vue";
import LandingCases from "~/components/landing/LandingCases.vue";
import type { IAdvantages } from "~/utils/interfaces/IAdvantages";
import type { IProjects } from "~/utils/interfaces/IProjects";
import type { IServices } from "~/utils/interfaces/IServices";
import type { ISettings } from "~/utils/interfaces/ISettings";
import type { ITechStack } from "~/utils/interfaces/ITechStack";
import enMessagesRaw from "~/locales/en.json?raw";
import ruMessagesRaw from "~/locales/ru.json?raw";
import { getCaseFallbacks } from "~/utils/caseFallbacks";

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

type FooterObstacle = {
  id: number;
  letter: string;
  passed: boolean;
  width: number;
  x: number;
};

type HeroLiquidBounds = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

type SectionLiquidTarget = {
  element: HTMLElement;
  key: string;
  rect: DOMRect;
  sectionRect: DOMRect;
};

type ThreeModule = typeof import("three");

type LocaleCode = "ru" | "en";
type ThemeMode = "light" | "dark";
type NavItem = {
  href: string;
  label: string;
};

type LandingCopy = {
  preloader: {
    loading: string;
    meta: [string, string];
  };
  nav: {
    aria: string;
    themeAria: string;
    langAria: string;
    menuOpen: string;
    menuClose: string;
    cta: string;
    mobileCta: string;
    items: NavItem[];
  };
  hero: {
    meta: [string, string];
    kicker: string;
    title: string[];
    text: string;
    cta: string;
    servicesLink: string;
    stats: string[];
  };
  marqueeAria: string;
  marqueeItems: string[];
  about: {
    label: string;
    paragraphs: [string, string];
    note: string;
    eyebrow: [string, string];
    teamLead: string;
    metrics: [string, string, string];
    flowAria: string;
    replay: string;
    zones: [string, string, string];
    brief: string;
    stages: [string, string, string, string, string];
    stepDetails: Array<{ duration: string; description: string; deliverables: string[] }>;
    business: [string, string, string, string];
    products: [string, string, string, string];
  };
  stack: {
    label: string;
    title: string;
    meta: string;
    hint: [string, string];
    groups: StackGroup[];
  };
  services: {
    label: string;
    title: string;
    hint: [string, string];
    navLabels: [string, string, string, string, string, string, string];
    screens: Record<string, Record<string, string>>;
    commercialLabels: {
      price: string;
      timeline: string;
      included: string;
    };
    commercial: Array<{
      price: string;
      timeline: string;
      included: [string, string, string, string];
    }>;
    asideCta: {
      eyebrow: string;
      link: string;
      note: string;
    };
    fallback: DisplayService[];
    fallbackTitle: string;
    fallbackDesc: string;
  };
  clients: {
    label: string;
    title: string;
    tags: string[];
    tabAria: string;
    segments: ClientSegment[];
  };
  contacts: {
    label: string;
    title: string;
    emailCta: string;
  };
  footer: {
    topLink: string;
    base: [string, string];
    yearLabel: string;
    baseLabel: string;
    contactLabel: string;
    signOff: string;
    navLabel: string;
    legal: string;
    game: {
      name: string;
      aria: string;
      ready: string;
      running: string;
      crash: string;
    };
  };
  head: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
};
const {
  getServices,
  getProjects,
  getAdvantages,
  getTechStack,
  getSettings,
} = useApi();
const { locale } = useI18n();

const rootRef = ref<HTMLElement | null>(null);
const heroRef = ref<HTMLElement | null>(null);
const heroNegativeRef = ref<HTMLElement | null>(null);
const sectionLiquidRef = ref<HTMLElement | null>(null);
const aboutFlowRef = ref<HTMLElement | null>(null);
const aboutLiquidRef = ref<HTMLElement | null>(null);
const stackSphereRef = ref<HTMLElement | null>(null);
const clientCubeRef = ref<HTMLElement | null>(null);
const footerGameRef = ref<HTMLElement | null>(null);
const preloaderRef = ref<HTMLElement | null>(null);
const showPreloader = ref(true);
const introProgress = ref(0);
const theme = ref<ThemeMode>("light");
const isMenuOpen = ref(false);
const activeStackIndex = ref(0);
const activeClientSegment = ref(0);
const enableMotionLayer = true;
const enableSectionLiquid = true;
const activeServiceIndex = ref(0);
let heroFxRaf = 0;
let heroFxLastFrame = 0;
let sectionLiquidRaf = 0;
let sectionLiquidLastFrame = 0;
let sectionLiquidLastScrollY = 0;
let sectionLiquidScrollDirection = 0;
let sectionLiquidStackLock: {
  x: number;
  y: number;
  radius: number;
  stickyBounds: { top: number; left: number; width: number; height: number } | null;
} | null = null;
let negativeStackSyncQueued = false;
let footerGameRaf = 0;
let footerGameLastFrame = 0;
let footerGameLastScrollY = 0;
let footerGameNextId = 0;
let footerGameSpawnIn = 0;
let footerGameStartBlockedUntil = 0;
let footerGameNeedsReentry = false;
let aboutLiquidCleanup: (() => void) | null = null;
let aboutFlowResultTimer: ReturnType<typeof setTimeout> | null = null;
let aboutFlowStepTimers: Array<ReturnType<typeof setTimeout>> = [];
let aboutFlowObserver: IntersectionObserver | null = null;
let stackSphereCleanup: (() => void) | null = null;
let clientCubeCleanup: (() => void) | null = null;
let updateClientCubeStage: ((index: number) => void) | null = null;

const heroFxState = {
  active: false,
  angle: 0,
  currentX: 0.76,
  currentY: 0.43,
  hasPointer: false,
  lastPointerX: 0,
  lastPointerY: 0,
  lastX: 0.76,
  lastY: 0.43,
  speed: 0,
  targetX: 0.76,
  targetY: 0.43,
  velocityX: 0.00048,
  velocityY: 0.00018,
};

const sectionLiquidState = {
  angle: -0.35,
  arcX: 0,
  arcY: 0,
  currentX: 0,
  currentY: 0,
  initialized: false,
  lastTargetKey: "",
  lastX: 0,
  lastY: 0,
  radius: 104,
  speed: 0,
  targetRadius: 104,
  targetX: 0,
  targetY: 0,
  velocityX: 0,
  velocityY: 0,
};

const services = ref<IServices[]>([]);
const projects = ref<IProjects[]>([]);
const advantages = ref<IAdvantages[]>([]);
const techStack = ref<ITechStack[]>([]);
const settings = ref<ISettings | null>(null);
const footerObstacles = ref<FooterObstacle[]>([]);

const footerGameLetters = ["V", "E", "Z", "H", "A"];
const footerGame = ref({
  best: 0,
  crashed: false,
  dinoY: 0,
  running: false,
  score: 0,
  speed: 3.6,
  status: "READY",
  velocityY: 0,
});


const devOpsTechNames = new Set(["docker", "nginx", "ci/cd", "ci cd", "linux", "kubernetes", "github actions", "gitlab ci"]);
const replacedBackendTechNames = new Set(["python", "fastapi"]);

const currentLocale = computed<LocaleCode>(() => (locale.value === "ru" ? "ru" : "en"));
const enMessages = JSON.parse(enMessagesRaw) as { landing: LandingCopy };
const ruMessages = JSON.parse(ruMessagesRaw) as { landing: LandingCopy };
const landingMessages = { ru: ruMessages.landing, en: enMessages.landing };
const copy = computed(() => landingMessages[currentLocale.value] as LandingCopy);
const caseFallbacks = computed(() => getCaseFallbacks(currentLocale.value));
const casesCopy = computed(() => currentLocale.value === "ru" ? {
  label: "Избранные кейсы",
  title: "Галерея проектов",
  intro: "Показываем задачу, логику решения и то, как продукт работает в реальном сценарии.",
  tabAria: "Выберите кейс",
  open: "Открыть кейс",
} : {
  label: "Selected cases",
  title: "Project gallery",
  intro: "The task, the reasoning and the way each product works in a real scenario.",
  tabAria: "Select a case",
  open: "Open case",
});

const aboutBusinessIcons = [
  [
    "M224,40V76a8,8,0,0,1-16,0V48H180a8,8,0,0,1,0-16h36A8,8,0,0,1,224,40Zm-8,132a8,8,0,0,0-8,8v28H180a8,8,0,0,0,0,16h36a8,8,0,0,0,8-8V180A8,8,0,0,0,216,172ZM76,208H48V180a8,8,0,0,0-16,0v36a8,8,0,0,0,8,8H76a8,8,0,0,0,0-16ZM40,84a8,8,0,0,0,8-8V48H76a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8V76A8,8,0,0,0,40,84Zm136,92a8,8,0,0,1-6.41-3.19,52,52,0,0,0-83.2,0,8,8,0,1,1-12.8-9.62A67.94,67.94,0,0,1,101,141.51a40,40,0,1,1,53.94,0,67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,176,176Zm-48-40a24,24,0,1,0-24-24A24,24,0,0,0,128,136Z",
  ],
  [
    "M216,96A88,88,0,1,0,72,163.83V240a8,8,0,0,0,11.58,7.16L128,225l44.43,22.21A8.07,8.07,0,0,0,176,248a8,8,0,0,0,8-8V163.83A87.85,87.85,0,0,0,216,96ZM56,96a72,72,0,1,1,72,72A72.08,72.08,0,0,1,56,96ZM168,227.06l-36.43-18.21a8,8,0,0,0-7.16,0L88,227.06V174.37a87.89,87.89,0,0,0,80,0ZM128,152A56,56,0,1,0,72,96,56.06,56.06,0,0,0,128,152Zm0-96A40,40,0,1,1,88,96,40,40,0,0,1,128,56Z",
  ],
  [
    "M224,64H176V56a24,24,0,0,0-24-24H104A24,24,0,0,0,80,56v8H32A16,16,0,0,0,16,80V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V80A16,16,0,0,0,224,64ZM96,56a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM224,80v32H192v-8a8,8,0,0,0-16,0v8H80v-8a8,8,0,0,0-16,0v8H32V80Zm0,112H32V128H64v8a8,8,0,0,0,16,0v-8h96v8a8,8,0,0,0,16,0v-8h32v64Z",
  ],
  [
    "M240,208H224V96a16,16,0,0,0-16-16H144V32a16,16,0,0,0-24.88-13.32L39.12,72A16,16,0,0,0,32,85.34V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM208,96V208H144V96ZM48,85.34,128,32V208H48ZM112,112v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm-32,0v16a8,8,0,0,1-16,0V112a8,8,0,1,1,16,0Zm0,56v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm32,0v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Z",
  ],
];

const aboutProductIcons = [
  [
    "M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64ZM69.61,53.08C85.07,44.65,105.81,40,128,40s42.93,4.65,58.39,13.08C200.12,60.57,208,70.38,208,80s-7.88,19.43-21.61,26.92C170.93,115.35,150.19,120,128,120s-42.93-4.65-58.39-13.08C55.88,99.43,48,89.62,48,80S55.88,60.57,69.61,53.08ZM186.39,202.92C170.93,211.35,150.19,216,128,216s-42.93-4.65-58.39-13.08C55.88,195.43,48,185.62,48,176V159.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64V176C208,185.62,200.12,195.43,186.39,202.92Z",
  ],
  ["M228.88,26.19a9,9,0,0,0-9.16-1.57L17.06,103.93a14.22,14.22,0,0,0,2.43,27.21L72,141.45V200a15.92,15.92,0,0,0,10,14.83,15.91,15.91,0,0,0,17.51-3.73l25.32-26.26L165,220a15.88,15.88,0,0,0,10.51,4,16.3,16.3,0,0,0,5-.79,15.85,15.85,0,0,0,10.67-11.63L231.77,35A9,9,0,0,0,228.88,26.19Zm-61.14,36L78.15,126.35l-49.6-9.73ZM88,200V152.52l24.79,21.74Zm87.53,8L92.85,135.5l119-85.29Z"],
  ["M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V88H40V56Zm0,144H40V104H216v96Z"],
  ["M104,216a16,16,0,1,1-16-16A16,16,0,0,1,104,216Zm88-16a16,16,0,1,0,16,16A16,16,0,0,0,192,200ZM239.71,74.14l-25.64,92.28A24.06,24.06,0,0,1,191,184H92.16A24.06,24.06,0,0,1,69,166.42L33.92,40H16a8,8,0,0,1,0-16H40a8,8,0,0,1,7.71,5.86L57.19,64H232a8,8,0,0,1,7.71,10.14ZM221.47,80H61.64l22.81,82.14A8,8,0,0,0,92.16,168H191a8,8,0,0,0,7.71-5.86Z"],
];

const aboutBusinessItems = computed<AboutFlowItem[]>(() => copy.value.about.business.map((label, index) => ({
  label,
  iconPaths: aboutBusinessIcons[index] || aboutBusinessIcons[0]!,
})));
const aboutProductItems = computed<AboutFlowItem[]>(() => copy.value.about.products.map((label, index) => ({
  label,
  iconPaths: aboutProductIcons[index] || aboutProductIcons[0]!,
})));
const aboutFlowSnakeSegments = [
  { key: "design", path: "M 25 50 C 29 50 31 69 35 69", begin: "6.22s" },
  { key: "ux", path: "M 35 69 C 39 69 41 30 45 30", begin: "12.21s" },
  { key: "development", path: "M 45 30 C 50 30 50 65 55 65", begin: "18.19s" },
  { key: "testing", path: "M 55 65 C 60 65 60 33 65 33", begin: "24.18s" },
  { key: "launch", path: "M 65 33 C 70 33 70 50 75 50", begin: "30.16s" },
  { key: "product", path: "M 75 50 L 87.5 50", begin: "36.14s" },
];
const aboutFlowStepDelaysMs = [6770, 12750, 18740, 24720, 30700];
const aboutFlowResultDelayMs = 37130;
const aboutFlowBusinessIndex = ref(0);
const aboutFlowStepIndex = ref(0);
const activeAboutProduct = ref<AboutFlowItem | null>(null);
const aboutFlowPhase = ref<"signal" | "result">("result");
const aboutFlowCycleKey = ref(0);
const activeAboutBusiness = computed<AboutFlowItem>(() => (
  aboutBusinessItems.value[aboutFlowBusinessIndex.value] || aboutBusinessItems.value[0]!
));

const clientSegments = computed(() => copy.value.clients.segments);
const navItems = computed(() => {
  const items = copy.value.nav.items.filter((item) => item.href !== "#stages");
  const contactsIndex = items.findIndex((item) => item.href === "#contacts");
  items.splice(contactsIndex < 0 ? items.length : contactsIndex, 0, {
    href: "#cases",
    label: currentLocale.value === "ru" ? "Кейсы" : "Cases",
  });
  return items;
});
const footerNavItems = computed(() => navItems.value.filter((item) => item.href !== "#contacts"));
const marqueeItems = computed(() => copy.value.marqueeItems);
const fallbackServices = computed(() => copy.value.services.fallback);
const fallbackStackGroups = computed(() => copy.value.stack.groups);
const fallbackClients = computed(() => copy.value.clients.tags);

const displayServices = computed<DisplayService[]>(() => {
  if (!services.value.length) return fallbackServices.value;

  return services.value.slice(0, 7).map((service, index) => ({
    n: toNumber(index + 1),
    title: service.name || service.title || fallbackServices.value[index]?.title || copy.value.services.fallbackTitle,
    desc: service.description || service.about || fallbackServices.value[index]?.desc || copy.value.services.fallbackDesc,
    meta: service.features?.slice(0, 3).map((feature) => feature.text) || fallbackServices.value[index]?.meta || [],
  }));
});

const displayStackGroups = computed<StackGroup[]>(() => {
  if (!techStack.value.length) return fallbackStackGroups.value;

  const grouped = techStack.value.reduce<Record<string, string[]>>((acc, item) => {
    const name = item.name?.trim();
    if (!name) return acc;

    let key = normalizeStackCategory(item.category);
    if (key === "backend" && devOpsTechNames.has(normalizeTechName(name))) key = "devops";

    acc[key] ||= [];
    acc[key].push(name);
    return acc;
  }, {});

  return fallbackStackGroups.value.map((fallback) => {
    const key = normalizeStackCategory(fallback.title);

    return {
      ...fallback,
      items: mergeStackItems(grouped[key] || [], fallback.items),
    };
  });
});

const activeClient = computed(() => clientSegments.value[activeClientSegment.value] || clientSegments.value[0]);
const footerGameScore = computed(() => Math.floor(footerGame.value.score).toString().padStart(4, "0"));
const footerGameStatus = computed(() => {
  if (footerGame.value.crashed) return copy.value.footer.game.crash;
  if (footerGame.value.running) return copy.value.footer.game.running;
  return copy.value.footer.game.ready;
});

const contactEmail = computed(() => settings.value?.contact_email || "contact@vezha.digital");

function setAboutFlowHost(element: HTMLElement | null) {
  aboutFlowRef.value = element;
}

function setHeroHosts(hero: HTMLElement | null, negative: HTMLElement | null) {
  heroRef.value = hero;
  heroNegativeRef.value = negative;
}

function setClientCubeHost(element: HTMLElement | null) {
  clientCubeRef.value = element;
}

function setFooterGameHost(element: HTMLElement | null) {
  footerGameRef.value = element;
}

function pickNextAboutProduct(): AboutFlowItem | null {
  const items = aboutProductItems.value;
  if (items.length <= 1) return items[0] || null;

  let next = activeAboutProduct.value;
  while (next?.label === activeAboutProduct.value?.label) {
    next = items[Math.floor(Math.random() * items.length)] || null;
  }
  return next;
}

function clearAboutFlowResultTimer() {
  if (!aboutFlowResultTimer) return;
  clearTimeout(aboutFlowResultTimer);
  aboutFlowResultTimer = null;
}

function clearAboutFlowStepTimers() {
  aboutFlowStepTimers.forEach((timer) => clearTimeout(timer));
  aboutFlowStepTimers = [];
}

function runAboutFlowCycle(advanceBusiness = true) {
  clearAboutFlowResultTimer();
  clearAboutFlowStepTimers();
  if (advanceBusiness) {
    aboutFlowBusinessIndex.value = (aboutFlowBusinessIndex.value + 1) % aboutBusinessItems.value.length;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    aboutFlowStepIndex.value = 5;
    activeAboutProduct.value = pickNextAboutProduct();
    aboutFlowPhase.value = "result";
    return;
  }

  activeAboutProduct.value = null;
  aboutFlowStepIndex.value = 0;
  aboutFlowPhase.value = "signal";
  aboutFlowCycleKey.value += 1;
  aboutFlowStepTimers = aboutFlowStepDelaysMs.map((delay, index) => setTimeout(() => {
    aboutFlowStepIndex.value = index + 1;
  }, delay));
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
  aboutFlowObserver?.disconnect();

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
  clearAboutFlowStepTimers();
}

function toNumber(value: number) {
  return value.toString().padStart(2, "0");
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
    if (replacedBackendTechNames.has(key)) return false;
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

let publicDataRequestId = 0;

async function loadPublicData(lang: LocaleCode = currentLocale.value) {
  const requestId = ++publicDataRequestId;
  const results = await Promise.allSettled([
    getServices(lang),
    getProjects(lang),
    getAdvantages(lang),
    getTechStack(lang),
    getSettings(lang),
  ] as const);

  if (requestId !== publicDataRequestId || lang !== currentLocale.value) return;

  const [servicesResult, projectsResult, advantagesResult, techStackResult, settingsResult] = results;
  if (servicesResult.status === "fulfilled") services.value = servicesResult.value;
  if (projectsResult.status === "fulfilled") projects.value = projectsResult.value;
  if (advantagesResult.status === "fulfilled") advantages.value = advantagesResult.value;
  if (techStackResult.status === "fulfilled") techStack.value = techStackResult.value;
  if (settingsResult.status === "fulfilled") settings.value = settingsResult.value.settings;

  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length) console.info(`VEZHA public data fallback is active for ${failures.length} section(s).`);
}

let localeWatcherReady = false;

function createAboutLiquidEnvironment(THREE: ThreeModule) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#ffffff");
    sky.addColorStop(0.24, "#e9ecef");
    sky.addColorStop(0.42, "#111318");
    sky.addColorStop(0.52, "#ffffff");
    sky.addColorStop(0.72, "#d7dbe0");
    sky.addColorStop(1, "#ffffff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillRect(0, 0, canvas.width, 58);
    ctx.fillRect(0, 238, canvas.width, 36);
    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.fillRect(0, 184, canvas.width, 34);
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.beginPath();
    ctx.ellipse(780, 130, 210, 46, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(240, 330, 240, 58, 0.14, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createAboutLiquidGeometry(THREE: ThreeModule) {
  const radialSegments = 180;
  const tubeSegments = 30;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const radial = new THREE.Vector3();
  const binormal = new THREE.Vector3(0, 0, 1);

  for (let i = 0; i <= radialSegments; i += 1) {
    const u = (i / radialSegments) * Math.PI * 2;
    const centerX = Math.cos(u) * (1.72 + Math.sin(u * 3.1 + 0.28) * 0.12 + Math.cos(u * 5.2) * 0.05);
    const centerY = Math.sin(u) * (0.86 + Math.cos(u * 2.4 - 0.7) * 0.08) + Math.sin(u * 2 + 0.45) * 0.06;
    const centerZ = Math.sin(u * 2.6 - 0.4) * 0.12;
    const tube = 0.34 + Math.sin(u * 3.4 + 1.2) * 0.035 + Math.cos(u * 5.1) * 0.025;

    radial.set(Math.cos(u), Math.sin(u) * 0.74, 0).normalize();

    for (let j = 0; j <= tubeSegments; j += 1) {
      const v = (j / tubeSegments) * Math.PI * 2;
      const oval = 1 + Math.sin(u * 2.2 + 0.3) * 0.1;
      const px = centerX + radial.x * Math.cos(v) * tube * oval + binormal.x * Math.sin(v) * tube * 0.72;
      const py = centerY + radial.y * Math.cos(v) * tube * oval + binormal.y * Math.sin(v) * tube * 0.72;
      const pz = centerZ + radial.z * Math.cos(v) * tube * oval + binormal.z * Math.sin(v) * tube * 0.72;

      positions.push(px, py, pz);
      uvs.push(i / radialSegments, j / tubeSegments);
    }
  }

  for (let i = 0; i < radialSegments; i += 1) {
    for (let j = 0; j < tubeSegments; j += 1) {
      const a = i * (tubeSegments + 1) + j;
      const b = (i + 1) * (tubeSegments + 1) + j;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

async function setupAboutLiquidScene() {
  const host = aboutLiquidRef.value;
  if (!host || aboutLiquidCleanup) return;

  try {
    const THREE = await import("three");
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const envMap = createAboutLiquidEnvironment(THREE);
    scene.environment = envMap;
    scene.add(new THREE.AmbientLight(0xffffff, 0.82));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2.8, 2.2, 4.4);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x7f8a98, 1.35);
    rimLight.position.set(-2.2, -1.8, 3.4);
    scene.add(rimLight);

    const geometry = createAboutLiquidGeometry(THREE);
    const material = new THREE.MeshPhysicalMaterial({
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      color: 0xf7f8f9,
      envMap,
      envMapIntensity: 1.6,
      metalness: 1,
      roughness: 0.16,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.set(-0.58, 0.16, -0.1);
    mesh.scale.setScalar(0.88);
    scene.add(mesh);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frameId = 0;
    let isVisible = true;
    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const tick = (time: number) => {
      if (isVisible) {
        mesh.rotation.x = -0.58 + Math.sin(time * 0.00022) * 0.035;
        mesh.rotation.y = 0.16 + Math.sin(time * 0.00016 + 1.1) * 0.045;
        mesh.rotation.z = -0.1 + Math.sin(time * 0.00018) * 0.03;
        renderer.render(scene, camera);
      }

      frameId = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = Boolean(entry?.isIntersecting);
    });
    intersectionObserver.observe(host);
    resize();
    if (!reduceMotion) frameId = requestAnimationFrame(tick);

    aboutLiquidCleanup = () => {
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      geometry.dispose();
      material.dispose();
      envMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      aboutLiquidCleanup = null;
    };
  } catch (error) {
    console.info("VEZHA about 3D fallback is inactive:", error);
    host.hidden = true;
  }
}

function createStackSpherePoints(THREE: ThreeModule, count: number, radius: number, yScale = 1) {
  const points: import("three").Vector3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < count; index += 1) {
    const y = count === 1 ? 0 : 1 - (index / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = index * goldenAngle;
    points.push(new THREE.Vector3(
      Math.cos(theta) * r * radius,
      y * radius * yScale,
      Math.sin(theta) * r * radius,
    ));
  }

  return points;
}

function createStackSpherePairs(points: import("three").Vector3[], neighbors: number, maxDistance: number) {
  const pairs: Array<[number, number]> = [];
  const seen = new Set<string>();

  points.forEach((point, index) => {
    const nearest = points
      .map((target, targetIndex) => ({
        distance: point.distanceTo(target),
        targetIndex,
      }))
      .filter((item) => item.targetIndex !== index && item.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, neighbors);

    nearest.forEach(({ targetIndex }) => {
      const a = Math.min(index, targetIndex);
      const b = Math.max(index, targetIndex);
      const key = `${a}:${b}`;
      if (seen.has(key)) return;
      seen.add(key);
      pairs.push([a, b]);
    });
  });

  return pairs;
}

function createStackLineGeometry(THREE: ThreeModule, points: import("three").Vector3[], pairs: Array<[number, number]>) {
  const positions: number[] = [];

  pairs.forEach(([a, b]) => {
    positions.push(points[a].x, points[a].y, points[a].z, points[b].x, points[b].y, points[b].z);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function createStackBridgeGeometry(THREE: ThreeModule, corePoints: import("three").Vector3[], surfacePoints: import("three").Vector3[]) {
  const positions: number[] = [];
  const surfaceRadiusX = surfacePoints.reduce((max, point) => Math.max(max, Math.abs(point.x)), 0);
  const surfaceRadiusY = surfacePoints.reduce((max, point) => Math.max(max, Math.abs(point.y)), 0);
  const surfaceRadiusZ = surfacePoints.reduce((max, point) => Math.max(max, Math.abs(point.z)), 0);
  const inset = 0.92;

  corePoints.forEach((point, index) => {
    if (index % 2 !== 0) return;

    const direction = point.clone().normalize();
    const distanceToSurface = 1 / Math.sqrt(
      (direction.x * direction.x) / (surfaceRadiusX * surfaceRadiusX)
      + (direction.y * direction.y) / (surfaceRadiusY * surfaceRadiusY)
      + (direction.z * direction.z) / (surfaceRadiusZ * surfaceRadiusZ),
    );
    const surface = direction.multiplyScalar(distanceToSurface * inset);
    positions.push(point.x, point.y, point.z, surface.x, surface.y, surface.z);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

async function setupStackSphereScene() {
  const host = stackSphereRef.value;
  if (!host || stackSphereCleanup) return;

  try {
    const THREE = await import("three");
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    const labelLayer = document.createElement("div");
    labelLayer.className = "vz-stack__sphere-labels";
    labelLayer.setAttribute("aria-hidden", "true");
    host.replaceChildren(renderer.domElement, labelLayer);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 5.7);

    const rootGroup = new THREE.Group();
    rootGroup.rotation.set(-0.16, -0.4, 0.08);
    scene.add(rootGroup);

    const surfaceGroup = new THREE.Group();
    const bridgeGroup = new THREE.Group();
    const coreGroup = new THREE.Group();
    rootGroup.add(bridgeGroup, surfaceGroup, coreGroup);

    const geometries: import("three").BufferGeometry[] = [];
    const trackedMaterials: Array<{
      baseOpacity: number;
      layer: "surface" | "core" | "bridge";
      material: import("three").Material & { opacity: number };
    }> = [];
    const trackedGroups = [
      { group: surfaceGroup, layer: "surface" as const, scale: 1 },
      { group: coreGroup, layer: "core" as const, scale: 1 },
      { group: bridgeGroup, layer: "bridge" as const, scale: 1 },
    ];

    const trackMaterial = <T extends import("three").Material & { opacity: number }>(
      material: T,
      layer: "surface" | "core" | "bridge",
      baseOpacity: number,
    ) => {
      material.transparent = true;
      material.depthWrite = false;
      material.opacity = baseOpacity * 0.16;
      trackedMaterials.push({ baseOpacity, layer, material });
      return material;
    };

    const surfacePoints = createStackSpherePoints(THREE, 118, 1.62, 0.98);
    const corePoints = createStackSpherePoints(THREE, 72, 0.62, 1);
    type StackLabelLayer = "surface" | "core" | "bridge" | "all";
    type StackLabelPoint = {
      element: HTMLSpanElement;
      point: import("three").Vector3;
      layer: StackLabelLayer;
      projectionGroup: import("three").Object3D;
    };
    type StackLabelSpec = {
      angle: number;
      color: string;
      label: string;
      layer: StackLabelLayer;
      projectionGroup: import("three").Object3D;
      radius: number;
      radiusZ: number;
      slug: string;
      y: number;
    };

    const labelSpecs: StackLabelSpec[] = [
      { layer: "surface", label: "React", slug: "react", color: "#61DAFB", angle: 2.75, y: 0.66, radius: 1.72, radiusZ: 1.62, projectionGroup: rootGroup },
      { layer: "surface", label: "Vue 3", slug: "vuedotjs", color: "#4FC08D", angle: 2.19, y: 0.28, radius: 1.72, radiusZ: 1.62, projectionGroup: rootGroup },
      { layer: "surface", label: "Next.js", slug: "nextdotjs", color: "#111318", angle: 1.63, y: -0.08, radius: 1.72, radiusZ: 1.62, projectionGroup: rootGroup },
      { layer: "surface", label: "TypeScript", slug: "typescript", color: "#3178C6", angle: 1.07, y: 0.46, radius: 1.72, radiusZ: 1.62, projectionGroup: rootGroup },
      { layer: "surface", label: "Tailwind", slug: "tailwindcss", color: "#06B6D4", angle: 0.51, y: -0.48, radius: 1.72, radiusZ: 1.62, projectionGroup: rootGroup },
      { layer: "core", label: "Go", slug: "go", color: "#00ADD8", angle: 2.55, y: 0.28, radius: 0.82, radiusZ: 0.76, projectionGroup: coreGroup },
      { layer: "core", label: "Gin", slug: "gin", color: "#008ECF", angle: 1.25, y: -0.18, radius: 0.82, radiusZ: 0.76, projectionGroup: coreGroup },
      { layer: "core", label: "PostgreSQL", slug: "postgresql", color: "#4169E1", angle: -0.15, y: 0.16, radius: 0.82, radiusZ: 0.76, projectionGroup: coreGroup },
      { layer: "core", label: "Redis", slug: "redis", color: "#DC382D", angle: -1.55, y: -0.3, radius: 0.82, radiusZ: 0.76, projectionGroup: coreGroup },
      { layer: "bridge", label: "Docker", slug: "docker", color: "#2496ED", angle: 2.8, y: 0.48, radius: 1.28, radiusZ: 1.2, projectionGroup: bridgeGroup },
      { layer: "bridge", label: "Nginx", slug: "nginx", color: "#009639", angle: 1.25, y: -0.34, radius: 1.28, radiusZ: 1.2, projectionGroup: bridgeGroup },
      { layer: "bridge", label: "CI/CD", slug: "githubactions", color: "#7C3AED", angle: -0.2, y: 0.32, radius: 1.28, radiusZ: 1.2, projectionGroup: bridgeGroup },
      { layer: "bridge", label: "Linux", slug: "linux", color: "#F5B800", angle: -1.7, y: -0.46, radius: 1.28, radiusZ: 1.2, projectionGroup: bridgeGroup },
      { layer: "all", label: "React Native", slug: "react", color: "#61DAFB", angle: 2.65, y: 0.44, radius: 1.5, radiusZ: 1.4, projectionGroup: rootGroup },
      { layer: "all", label: "Expo", slug: "expo", color: "#111318", angle: 1.2, y: -0.24, radius: 1.5, radiusZ: 1.4, projectionGroup: rootGroup },
      { layer: "all", label: "PWA", slug: "pwa", color: "#5A0FC8", angle: -0.2, y: 0.3, radius: 1.5, radiusZ: 1.4, projectionGroup: rootGroup },
      { layer: "all", label: "Flutter", slug: "flutter", color: "#54C5F8", angle: -1.65, y: -0.4, radius: 1.5, radiusZ: 1.4, projectionGroup: rootGroup },
    ];

    const createStackLabelElement = (spec: StackLabelSpec) => {
      const element = document.createElement("span");
      const icon = document.createElement("span");
      const image = document.createElement("img");
      const text = document.createElement("span");

      element.className = "vz-stack__sphere-label";
      element.dataset.layer = spec.layer;
      element.style.opacity = "0";
      icon.className = "vz-stack__sphere-label-icon";
      icon.style.setProperty("--stack-tech-color", spec.color);
      image.src = `https://cdn.simpleicons.org/${spec.slug}/ffffff`;
      image.alt = "";
      image.decoding = "async";
      icon.appendChild(image);
      text.className = "vz-stack__sphere-label-text";
      text.textContent = spec.label;
      element.append(icon, text);
      labelLayer.appendChild(element);
      return element;
    };

    const stackLabelPoints = labelSpecs.flatMap<StackLabelPoint>((spec) => {
      const point = new THREE.Vector3(
        Math.cos(spec.angle) * spec.radius,
        spec.y,
        Math.sin(spec.angle) * spec.radiusZ,
      );
      const element = createStackLabelElement(spec);
      const loopElement = createStackLabelElement(spec);
      return [
        { element, point, layer: spec.layer, projectionGroup: spec.projectionGroup },
        {
          element: loopElement,
          point: new THREE.Vector3(-point.x, point.y, -point.z),
          layer: spec.layer,
          projectionGroup: spec.projectionGroup,
        },
      ];
    });

    const surfacePointGeometry = new THREE.BufferGeometry().setFromPoints(surfacePoints);
    const corePointGeometry = new THREE.BufferGeometry().setFromPoints(corePoints);
    const surfaceLineGeometry = createStackLineGeometry(THREE, surfacePoints, createStackSpherePairs(surfacePoints, 5, 0.72));
    const coreLineGeometry = createStackLineGeometry(THREE, corePoints, createStackSpherePairs(corePoints, 4, 0.52));
    const bridgeGeometry = createStackBridgeGeometry(THREE, corePoints, surfacePoints);
    const coreShellGeometry = new THREE.IcosahedronGeometry(0.68, 3);
    const coreInnerGeometry = new THREE.IcosahedronGeometry(0.34, 2);
    geometries.push(
      surfacePointGeometry,
      corePointGeometry,
      surfaceLineGeometry,
      coreLineGeometry,
      bridgeGeometry,
      coreShellGeometry,
      coreInnerGeometry,
    );

    surfaceGroup.add(
      new THREE.LineSegments(
        surfaceLineGeometry,
        trackMaterial(new THREE.LineBasicMaterial({ color: 0x1b1d22 }), "surface", 0.22),
      ),
      new THREE.Points(
        surfacePointGeometry,
        trackMaterial(new THREE.PointsMaterial({ color: 0x17191e, size: 0.036, sizeAttenuation: true }), "surface", 0.8),
      ),
    );

    coreGroup.add(
      new THREE.Mesh(
        coreInnerGeometry,
        trackMaterial(new THREE.MeshBasicMaterial({ color: 0x111318 }), "core", 0.18),
      ),
      new THREE.Mesh(
        coreShellGeometry,
        trackMaterial(new THREE.MeshBasicMaterial({ color: 0x111318, wireframe: true }), "core", 0.28),
      ),
      new THREE.LineSegments(
        coreLineGeometry,
        trackMaterial(new THREE.LineBasicMaterial({ color: 0x111318 }), "core", 0.46),
      ),
      new THREE.Points(
        corePointGeometry,
        trackMaterial(new THREE.PointsMaterial({ color: 0x111318, size: 0.058, sizeAttenuation: true }), "core", 0.96),
      ),
    );

    bridgeGroup.add(
      new THREE.LineSegments(
        bridgeGeometry,
        trackMaterial(new THREE.LineBasicMaterial({ color: 0x5d6470 }), "bridge", 0.34),
      ),
    );

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frameId = 0;
    let lastFrame = performance.now();
    let lastPositionCheck = 0;
    let isVisible = true;
    const positionInterval = window.setInterval(updateStackSpherePosition, 300);

    const fadeRange = (value: number, from: number, to: number) => (
      clampValue((value - from) / (to - from), 0, 1)
    );
    const updateStackLabels = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      const activeLayer = (host.dataset.layer || "surface") as StackLabelLayer;
      rootGroup.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);

      stackLabelPoints.forEach((item, index) => {
        const world = item.point.clone();
        item.projectionGroup.localToWorld(world);
        const counterpart = stackLabelPoints[index % 2 === 0 ? index + 1 : index - 1]!;
        const counterpartWorld = counterpart.point.clone();
        counterpart.projectionGroup.localToWorld(counterpartWorld);
        const projected = world.clone().project(camera);
        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;
        const edgeFade = (
          fadeRange(projected.x, -0.96, -0.84)
          * (1 - fadeRange(projected.x, 0.76, 0.9))
        );
        const frontFade = fadeRange(world.z, -0.1, 0.14);
        const isFrontOfPair = (
          world.z > counterpartWorld.z
          || (world.z === counterpartWorld.z && index % 2 === 0)
        );
        const opacity = (
          activeLayer === item.layer && isFrontOfPair
            ? clampValue(edgeFade * frontFade, 0, 1)
            : 0
        );
        const scale = 0.78 + frontFade * 0.2;

        item.element.style.opacity = opacity.toFixed(3);
        item.element.style.zIndex = String(Math.round(100 + world.z * 20));
        item.element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      });
    };

    const resize = () => {
      updateStackSpherePosition();
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      updateStackLabels();
    };

    const getLayerTargets = () => {
      const layer = host.dataset.layer || "surface";
      if (layer === "core") return { bridge: 0.16, core: 1, surface: 0.12 };
      if (layer === "bridge") return { bridge: 1, core: 0.38, surface: 0.26 };
      if (layer === "all") return { bridge: 0.82, core: 0.82, surface: 0.86 };
      return { bridge: 0.16, core: 0.1, surface: 1 };
    };

    const tick = (now: number) => {
      const frame = clampValue((now - lastFrame) / 16.67, 0, 2.2);
      lastFrame = now;

      if (isVisible) {
        if (now - lastPositionCheck > 250) {
          lastPositionCheck = now;
          updateStackSpherePosition();
        }

        const targets = getLayerTargets();
        trackedMaterials.forEach(({ baseOpacity, layer, material }) => {
          const targetOpacity = baseOpacity * targets[layer];
          material.opacity += (targetOpacity - material.opacity) * 0.08 * frame;
        });

        trackedGroups.forEach((item) => {
          const targetScale = 1 + targets[item.layer] * 0.055;
          item.scale += (targetScale - item.scale) * 0.06 * frame;
          item.group.scale.setScalar(item.scale);
        });

        rootGroup.rotation.y += 0.0022 * frame;
        rootGroup.rotation.x = -0.16 + Math.sin(now * 0.00022) * 0.08;
        rootGroup.rotation.z = 0.08 + Math.sin(now * 0.00018 + 1.2) * 0.045;
        renderer.render(scene, camera);
        updateStackLabels();
      }

      frameId = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const layoutObserver = new ResizeObserver(updateStackSpherePosition);
    const inner = host.closest<HTMLElement>(".vz-sticky__inner");
    const timeline = inner?.querySelector<HTMLElement>(".vz-stack__timeline");
    if (inner) layoutObserver.observe(inner);
    if (timeline) layoutObserver.observe(timeline);
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", updateStackSpherePosition, { passive: true });
    viewport?.addEventListener("scroll", updateStackSpherePosition, { passive: true });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = Boolean(entry?.isIntersecting);
    });
    intersectionObserver.observe(host);
    resize();
    if (!reduceMotion) frameId = requestAnimationFrame(tick);

    stackSphereCleanup = () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.clearInterval(positionInterval);
      resizeObserver.disconnect();
      layoutObserver.disconnect();
      viewport?.removeEventListener("resize", updateStackSpherePosition);
      viewport?.removeEventListener("scroll", updateStackSpherePosition);
      intersectionObserver.disconnect();
      geometries.forEach((geometry) => geometry.dispose());
      trackedMaterials.forEach(({ material }) => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      labelLayer.remove();
      stackSphereCleanup = null;
    };
  } catch (error) {
    console.info("VEZHA stack 3D fallback is inactive:", error);
    host.hidden = true;
  }
}

function createClientCubeEnvironment(THREE: ThreeModule) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
  base.addColorStop(0, "#f8fafc");
  base.addColorStop(0.2, "#ffffff");
  base.addColorStop(0.38, "#05070b");
  base.addColorStop(0.48, "#2a2d33");
  base.addColorStop(0.58, "#f4f7fb");
  base.addColorStop(0.72, "#07090e");
  base.addColorStop(0.84, "#11141a");
  base.addColorStop(1, "#eef3f7");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bands = [
    { x: 44, width: 74, alpha: 0.86, color: "#ffffff" },
    { x: 154, width: 148, alpha: 0.86, color: "#02040a" },
    { x: 344, width: 54, alpha: 0.9, color: "#ffffff" },
    { x: 500, width: 168, alpha: 0.82, color: "#080b12" },
    { x: 704, width: 78, alpha: 0.78, color: "#ffffff" },
    { x: 850, width: 96, alpha: 0.38, color: "#dfe8ef" },
  ];

  bands.forEach((band) => {
    const gradient = ctx.createLinearGradient(band.x, 0, band.x + band.width, 0);
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(0.28, band.color);
    gradient.addColorStop(0.72, band.color);
    gradient.addColorStop(1, "transparent");
    ctx.globalAlpha = band.alpha;
    ctx.fillStyle = gradient;
    ctx.fillRect(band.x - band.width * 0.4, 0, band.width * 1.8, canvas.height);
  });

  ctx.globalAlpha = 0.82;
  const horizon = ctx.createLinearGradient(0, 210, canvas.width, 300);
  horizon.addColorStop(0, "rgba(255,255,255,0)");
  horizon.addColorStop(0.22, "rgba(255,255,255,0.86)");
  horizon.addColorStop(0.42, "rgba(2,4,8,0.96)");
  horizon.addColorStop(0.62, "rgba(255,255,255,0.9)");
  horizon.addColorStop(0.82, "rgba(15,18,24,0.82)");
  horizon.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = horizon;
  ctx.fillRect(0, 218, canvas.width, 70);

  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.46;
  const glow = ctx.createRadialGradient(740, 118, 0, 740, 118, 280);
  glow.addColorStop(0, "rgba(232,242,248,0.88)");
  glow.addColorStop(0.36, "rgba(255,255,255,0.82)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(440, 0, 584, 300);

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

async function setupClientCubeScene() {
  const host = clientCubeRef.value;
  if (!host || clientCubeCleanup) return;

  try {
    const THREE = await import("three");
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    const cameraViewHeight = 4.25;
    const camera = new THREE.OrthographicCamera(-2.2, 2.2, 2.2, -2.2, 0.1, 100);
    camera.position.set(4.8, 4.1, 4.8);
    camera.lookAt(0, 0, 0);

    const environment = createClientCubeEnvironment(THREE);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = environment ? pmrem.fromEquirectangular(environment) : null;
    const envMap = envTarget?.texture || null;
    if (envMap) scene.environment = envMap;

    const ambient = new THREE.AmbientLight(0xffffff, 0.42);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.7);
    keyLight.position.set(3.8, 4.4, 5.2);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xe9f4f8, 1.15);
    rimLight.position.set(-4.4, 2.4, -3.2);
    scene.add(rimLight);

    const rootGroup = new THREE.Group();
    rootGroup.position.set(1.32, 0, 0);
    rootGroup.rotation.set(0, 0, 0);
    scene.add(rootGroup);

    const cubeGeometry = new THREE.BoxGeometry(0.54, 0.54, 0.54);
    const edgeGeometry = new THREE.EdgesGeometry(cubeGeometry, 18);
    const cubeRecords: Array<{
      edgeMaterial: import("three").LineBasicMaterial;
      fly: import("three").Vector3;
      home: import("three").Vector3;
      materials: import("three").MeshPhysicalMaterial[];
      mesh: import("three").Mesh;
      order: number;
      scale: number;
      visibleStage: number;
    }> = [];
    const spacing = 0.66;
    const faceColors = [0xffffff, 0xffffff, 0x9ca0a6, 0xffffff, 0xffffff, 0xffffff];
    const mediumBusinessCubeMask = [
      [
        [true, true, true],
        [true, true, true],
        [true, true, true],
      ],
      [
        [true, true, true],
        [true, true, false],
        [true, false, false],
      ],
      [
        [true, true, false],
        [true, false, false],
        [false, false, false],
      ],
    ];

    for (let layer = 0; layer < 3; layer += 1) {
      for (let row = 0; row < 3; row += 1) {
        for (let column = 0; column < 3; column += 1) {
          const visibleStage = layer === 0 ? 0 : mediumBusinessCubeMask[layer]?.[row]?.[column] ? 1 : 2;
          const materials = faceColors.map((color, faceIndex) => new THREE.MeshPhysicalMaterial({
            clearcoat: 0.92,
            clearcoatRoughness: faceIndex === 2 ? 0.08 : 0.045,
            color,
            envMap,
            envMapIntensity: faceIndex === 2 ? 1.35 : 1.7,
            metalness: 0.08,
            opacity: 0,
            reflectivity: 0.55,
            roughness: faceIndex === 2 ? 0.42 : 0.24,
            specularIntensity: faceIndex === 2 ? 0.72 : 0.95,
            transparent: true,
          }));
          const mesh = new THREE.Mesh(cubeGeometry, materials);
          const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x8c949d,
            opacity: 0,
            transparent: true,
          });
          const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
          edges.renderOrder = 2;
          mesh.add(edges);

          const home = new THREE.Vector3(
            (column - 1) * spacing,
            (layer - 1) * spacing,
            (row - 1) * spacing,
          );
          const fly = home.clone().add(new THREE.Vector3(
            3.1 + row * 0.24 + column * 0.08,
            0.34 + (column - 1) * 0.16 + layer * 0.08,
            0.64 - row * 0.12 + layer * 0.06,
          ));
          const order = column * 9 + row * 3 + layer;

          mesh.position.copy(fly);
          mesh.scale.setScalar(0.18);
          mesh.visible = false;
          rootGroup.add(mesh);
          cubeRecords.push({ edgeMaterial, fly, home, materials, mesh, order, scale: 0.18, visibleStage });
        }
      }
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frameId = 0;
    let isVisible = true;
    let lastFrame = performance.now();
    let currentStage = clampValue(activeClientSegment.value, 0, clientSegments.value.length - 1);
    let transitionFromStage = currentStage;
    let stageChangedAt = performance.now();

    const render = () => renderer.render(scene, camera);
    const setStage = (index: number, immediate = false) => {
      const nextStage = clampValue(index, 0, clientSegments.value.length - 1);
      transitionFromStage = immediate ? nextStage : currentStage;
      currentStage = nextStage;
      stageChangedAt = performance.now();
      cubeRecords.forEach((record) => {
        const shouldShow = record.visibleStage <= currentStage;
        if (immediate || reduceMotion) {
          record.mesh.position.copy(shouldShow ? record.home : record.fly);
          record.scale = shouldShow ? 1 : 0.18;
          record.mesh.scale.setScalar(record.scale);
          record.materials.forEach((material) => { material.opacity = shouldShow ? 1 : 0; });
          record.edgeMaterial.opacity = shouldShow ? 0.36 : 0;
          record.mesh.visible = shouldShow;
        } else if (shouldShow) {
          record.mesh.visible = true;
        }
      });
      if (immediate || reduceMotion) render();
    };
    updateClientCubeStage = setStage;

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      const aspect = width / height;
      camera.left = -(cameraViewHeight * aspect) / 2;
      camera.right = (cameraViewHeight * aspect) / 2;
      camera.top = cameraViewHeight / 2;
      camera.bottom = -cameraViewHeight / 2;
      camera.updateProjectionMatrix();
      render();
    };

    const tick = (now: number) => {
      const frame = clampValue((now - lastFrame) / 16.67, 0, 2.2);
      lastFrame = now;

      if (isVisible) {
        cubeRecords.forEach((record) => {
          const delay = record.order * 34;
          let shouldShow = record.visibleStage <= currentStage;
          if (shouldShow && currentStage > transitionFromStage && record.visibleStage > transitionFromStage) {
            shouldShow = now >= stageChangedAt + delay;
          }
          if (!shouldShow && currentStage < transitionFromStage && record.visibleStage <= transitionFromStage) {
            shouldShow = now < stageChangedAt + delay;
          }
          const target = shouldShow ? record.home : record.fly;
          const moveEase = (shouldShow ? 0.085 : 0.07) * frame;
          record.mesh.position.lerp(target, moveEase);
          record.scale += ((shouldShow ? 1 : 0.18) - record.scale) * 0.1 * frame;
          record.mesh.scale.setScalar(record.scale);
          record.materials.forEach((material) => {
            material.opacity += ((shouldShow ? 1 : 0) - material.opacity) * 0.12 * frame;
          });
          record.edgeMaterial.opacity += ((shouldShow ? 0.36 : 0) - record.edgeMaterial.opacity) * 0.12 * frame;
          record.mesh.visible = shouldShow || record.materials[0].opacity > 0.02;
        });

        render();
      }

      frameId = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = Boolean(entry?.isIntersecting);
    });
    intersectionObserver.observe(host);
    resize();
    setStage(currentStage, true);
    if (!reduceMotion) frameId = requestAnimationFrame(tick);

    clientCubeCleanup = () => {
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (updateClientCubeStage === setStage) updateClientCubeStage = null;
      cubeGeometry.dispose();
      edgeGeometry.dispose();
      cubeRecords.forEach(({ edgeMaterial, materials }) => {
        edgeMaterial.dispose();
        materials.forEach((material) => material.dispose());
      });
      environment?.dispose();
      envTarget?.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      clientCubeCleanup = null;
    };
  } catch (error) {
    console.info("VEZHA client cube 3D fallback is inactive:", error);
    host.hidden = true;
  }
}

function updateStackSpherePosition() {
  const host = stackSphereRef.value;
  if (!host || window.innerWidth <= 900) return;

  const inner = host.closest<HTMLElement>(".vz-sticky__inner");
  const timeline = inner?.querySelector<HTMLElement>(".vz-stack__timeline");
  const meta = inner?.querySelector<HTMLElement>(".vz-sec-meta");
  const items = timeline ? Array.from(timeline.querySelectorAll<HTMLElement>("[data-stack-item]")) : [];
  const backendItem = items[1];
  const devopsItem = items[2];
  if (!inner || !meta || !backendItem || !devopsItem) return;

  const innerRect = inner.getBoundingClientRect();
  const metaRect = meta.getBoundingClientRect();
  const backendRect = backendItem.getBoundingClientRect();
  const devopsRect = devopsItem.getBoundingClientRect();
  const sphereRect = host.getBoundingClientRect();
  const sphereSize = sphereRect.height || host.offsetHeight;
  const sphereWidth = sphereRect.width || host.offsetWidth;
  if (!sphereSize || !sphereWidth) return;

  const backendCenter = backendRect.top + backendRect.height / 2;
  const devopsCenter = devopsRect.top + devopsRect.height / 2;
  const targetY = (backendCenter + devopsCenter) / 2 - innerRect.top;
  const targetX = metaRect.left + metaRect.width / 2 - innerRect.left;
  const nextTop = `${Math.round(targetY - sphereSize / 2)}px`;
  const nextLeft = `${Math.round(targetX - sphereWidth / 2)}px`;
  if (host.style.getPropertyValue("--stack-sphere-top") !== nextTop) {
    host.style.setProperty("--stack-sphere-top", nextTop);
  }
  if (host.style.getPropertyValue("--stack-sphere-left") !== nextLeft) {
    host.style.setProperty("--stack-sphere-left", nextLeft);
  }
}

function updateClientCubePosition() {
  const host = clientCubeRef.value;
  const grid = rootRef.value?.querySelector<HTMLElement>("[data-clients-grid]");
  if (!host || !grid) return;

  if (window.innerWidth <= 900) {
    host.style.removeProperty("--client-cube-left");
    host.style.removeProperty("--client-cube-top");
    return;
  }

  const section = grid.closest<HTMLElement>("#clients");
  const connector = grid.querySelector<HTMLElement>(".vz-client-connector");
  const gridRect = grid.getBoundingClientRect();
  const sectionRect = section?.getBoundingClientRect() || gridRect;
  const connectorRect = connector?.getBoundingClientRect();
  const cubeRect = host.getBoundingClientRect();
  const cubeWidth = cubeRect.width || host.offsetWidth;
  const cubeHeight = cubeRect.height || host.offsetHeight;
  if (!cubeWidth || !cubeHeight) return;

  const upperLineY = connectorRect?.bottom || gridRect.top;
  const lowerLineY = sectionRect.bottom;
  const targetViewportY = (upperLineY + lowerLineY) / 2;
  const cubeVisualCenterRatio = 0.62;
  const nextLeft = `${Math.round(gridRect.width - cubeWidth)}px`;
  const nextTop = `${Math.round(targetViewportY - gridRect.top - cubeHeight * cubeVisualCenterRatio)}px`;

  if (host.style.getPropertyValue("--client-cube-left") !== nextLeft) {
    host.style.setProperty("--client-cube-left", nextLeft);
  }
  if (host.style.getPropertyValue("--client-cube-top") !== nextTop) {
    host.style.setProperty("--client-cube-top", nextTop);
  }
}

function getFooterGameTrack() {
  return footerGameRef.value?.querySelector<HTMLElement>("[data-footer-game-track]") || null;
}

function isFooterGameVisible() {
  const el = footerGameRef.value;
  if (!el) return false;

  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

function resetFooterGame() {
  footerGame.value.crashed = false;
  footerGame.value.dinoY = 0;
  footerGame.value.score = 0;
  footerGame.value.speed = 3.6;
  footerGame.value.status = "READY";
  footerGame.value.velocityY = 0;
  footerObstacles.value = [];
  footerGameSpawnIn = 420;
}

function stopFooterGameLoop() {
  if (footerGameRaf) cancelAnimationFrame(footerGameRaf);
  footerGameRaf = 0;
  footerGameLastFrame = 0;
}

function startFooterGameLoop() {
  if (footerGameRaf) return;

  footerGameLastFrame = performance.now();
  footerGameRaf = requestAnimationFrame(tickFooterGame);
}

function endFooterGame() {
  if (!footerGame.value.running && !footerGameRaf && !footerObstacles.value.length && footerGame.value.score === 0) return;

  stopFooterGameLoop();
  resetFooterGame();
}

function endFooterGameFromScrollUp() {
  footerGameStartBlockedUntil = performance.now() + 1100;
  endFooterGame();
}

function startFooterGame() {
  if (!footerGameRef.value || !isFooterGameVisible()) return;

  if (footerGame.value.crashed) resetFooterGame();
  if (!footerObstacles.value.length) footerGameSpawnIn = Math.max(footerGameSpawnIn, 420);

  footerGame.value.running = true;
  footerGame.value.status = "RUNNING";
  startFooterGameLoop();
}

function crashFooterGame() {
  footerGame.value.running = false;
  footerGame.value.crashed = true;
  footerGame.value.status = "CRASH";
  footerGame.value.best = Math.max(footerGame.value.best, Math.floor(footerGame.value.score));
  stopFooterGameLoop();
}

function spawnFooterObstacle(trackWidth: number) {
  const letter = footerGameLetters[footerGameNextId % footerGameLetters.length];

  footerObstacles.value.push({
    id: footerGameNextId,
    letter,
    passed: false,
    width: letter === "I" ? 34 : 58,
    x: trackWidth + 54,
  });

  footerGameNextId += 1;
  footerGameSpawnIn = 460 + Math.random() * 380;
}

function tickFooterGame(now: number) {
  footerGameRaf = 0;
  if (!footerGame.value.running) return;
  if (!isFooterGameVisible()) {
    endFooterGame();
    return;
  }

  const track = getFooterGameTrack();
  const trackWidth = track?.clientWidth || 900;
  const delta = clampValue(now - footerGameLastFrame, 0, 34);
  const frame = delta / 16.67;
  footerGameLastFrame = now;

  footerGame.value.speed = Math.min(8.6, footerGame.value.speed + 0.0019 * frame);
  footerGame.value.score += 0.07 * frame;
  footerGame.value.velocityY -= 0.82 * frame;
  footerGame.value.dinoY += footerGame.value.velocityY * frame;

  if (footerGame.value.dinoY <= 0) {
    footerGame.value.dinoY = 0;
    if (footerGame.value.velocityY < 0) footerGame.value.velocityY = 0;
  }

  footerGameSpawnIn -= footerGame.value.speed * frame;
  if (footerGameSpawnIn <= 0) spawnFooterObstacle(trackWidth);

  const dinoLeft = 74;
  const dinoRight = 118;
  const collisionHeight = 50;

  footerObstacles.value.forEach((obstacle) => {
    obstacle.x -= footerGame.value.speed * frame;

    if (!obstacle.passed && obstacle.x + obstacle.width < dinoLeft) {
      obstacle.passed = true;
      footerGame.value.score += 8;
    }

    const overlapsX = obstacle.x < dinoRight && obstacle.x + obstacle.width > dinoLeft;
    if (overlapsX && footerGame.value.dinoY < collisionHeight) crashFooterGame();
  });

  footerObstacles.value = footerObstacles.value.filter((obstacle) => obstacle.x > -96);

  if (footerGame.value.running) footerGameRaf = requestAnimationFrame(tickFooterGame);
}

function jumpFooterDino() {
  if (!isFooterGameVisible()) return;

  if (footerGame.value.crashed) {
    resetFooterGame();
    startFooterGame();
  } else if (!footerGame.value.running) {
    startFooterGame();
  }

  if (footerGame.value.dinoY <= 1) footerGame.value.velocityY = 15.8;
}

function updateFooterGameFromScroll() {
  const currentY = window.scrollY;
  const delta = currentY - footerGameLastScrollY;
  const visible = isFooterGameVisible();

  if (!visible) {
    endFooterGame();
    footerGameNeedsReentry = false;
    footerGameLastScrollY = currentY;
    return;
  }

  if (delta < -1) {
    footerGameNeedsReentry = true;
    endFooterGameFromScrollUp();
    footerGameLastScrollY = currentY;
    return;
  }

  if (delta > 1 && !footerGameNeedsReentry && performance.now() > footerGameStartBlockedUntil) startFooterGame();

  footerGameLastScrollY = currentY;
}

function getSectionLiquidTargets() {
  const root = rootRef.value;
  if (!root) return [];

  const configs = [
    { key: "hero", selector: "#hero h1", section: "#hero" },
    { key: "about", selector: "#about .vz-about__head h2", section: "#about" },
    { key: "stack", selector: "#stack .vz-sec-head h2", section: "#stack" },
    { key: "services", selector: "#services .vz-sec-head h2", section: "#services" },
    { key: "clients", selector: "#clients h2", section: "#clients" },
    { key: "contacts", selector: "#contacts h2", section: "#contacts" },
    { key: "footer", selector: ".vz-footer__sign strong", section: ".vz-footer" },
  ];

  return configs.reduce<SectionLiquidTarget[]>((targets, config) => {
    const element = root.querySelector<HTMLElement>(config.selector);
    const section = root.querySelector<HTMLElement>(config.section);
    if (!element || !section) return targets;

    const rect = element.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return targets;

    targets.push({
      element,
      key: config.key,
      rect,
      sectionRect: section.getBoundingClientRect(),
    });

    return targets;
  }, []);
}

function getSectionLiquidRadius(target: SectionLiquidTarget) {
  if (window.innerWidth <= 900) {
    const mobileWidth = window.innerWidth * 0.11;
    const mobileTargetWidth = target.rect.width * 0.16;
    const mobileTargetHeight = target.rect.height * (target.key === "footer" ? 0.38 : 0.56);
    return clampValue(
      Math.max(52, Math.min(mobileWidth, mobileTargetWidth, mobileTargetHeight)),
      48,
      70,
    );
  }

  const wideLimit = window.innerWidth * 0.13;
  const byWidth = target.rect.width * 0.2;
  const byHeight = target.rect.height * (target.key === "footer" ? 0.46 : 0.72);
  return clampValue(Math.max(78, Math.min(wideLimit, byWidth, byHeight)), 68, 162);
}

function isSectionLiquidTargetFullyVisible(target: SectionLiquidTarget) {
  const topGuard = window.innerWidth > 900 ? 76 : 62;
  const bottomGuard = 24;
  return target.rect.top >= topGuard && target.rect.bottom <= window.innerHeight - bottomGuard;
}

function isSectionLiquidTargetVisible(target: SectionLiquidTarget) {
  const topGuard = window.innerWidth > 900 ? 76 : 62;
  const bottomGuard = 24;
  return target.rect.bottom > topGuard && target.rect.top < window.innerHeight - bottomGuard;
}

function getSectionLiquidTargetCenter(target: SectionLiquidTarget) {
  return (target.rect.top + target.rect.bottom) / 2;
}

function getStackLiquidScrollLock(targets: SectionLiquidTarget[]) {
  if (window.innerWidth <= 900) return null;
  if (sectionLiquidState.lastTargetKey !== "stack") return null;

  const stackTarget = targets.find((target) => target.key === "stack");
  if (
    !stackTarget
    || stackTarget.sectionRect.top > 0
    || stackTarget.sectionRect.bottom < window.innerHeight
  ) return null;

  return stackTarget;
}

function formatStablePx(value: number) {
  return `${Number(value.toFixed(3))}px`;
}

function getClosestSectionLiquidTarget(targets: SectionLiquidTarget[]) {
  const viewportCenter = window.innerHeight * 0.5;
  return targets.reduce((best, target) => {
    const bestDistance = Math.abs(getSectionLiquidTargetCenter(best) - viewportCenter);
    const distance = Math.abs(getSectionLiquidTargetCenter(target) - viewportCenter);
    return distance < bestDistance ? target : best;
  });
}

function getInitialSectionLiquidTarget(targets: SectionLiquidTarget[]) {
  const fullyVisible = targets.filter(isSectionLiquidTargetFullyVisible);
  if (fullyVisible.length) return getClosestSectionLiquidTarget(fullyVisible);

  const viewportTargets = targets.filter((target) => (
    target.rect.bottom > 0 &&
    target.rect.top < window.innerHeight
  ));

  return viewportTargets.length ? getClosestSectionLiquidTarget(viewportTargets) : getClosestSectionLiquidTarget(targets);
}

function getSectionLiquidSwitchLine(direction: number) {
  return window.innerHeight * (direction > 0 ? 0.43 : 0.57);
}

function isSectionLiquidTargetReadyToEnter(target: SectionLiquidTarget, direction: number) {
  const center = getSectionLiquidTargetCenter(target);
  const switchLine = getSectionLiquidSwitchLine(direction);
  const enterLine = window.innerHeight * (direction > 0 ? 0.78 : 0.22);

  return direction > 0
    ? center >= switchLine && center <= enterLine
    : center <= switchLine && center >= enterLine;
}

function getNextSectionLiquidTarget(targets: SectionLiquidTarget[]) {
  const direction = sectionLiquidScrollDirection;

  if (direction) {
    const visibleTargets = targets.filter(isSectionLiquidTargetVisible);
    const directionalFromViewport = visibleTargets.filter((target) => isSectionLiquidTargetReadyToEnter(target, direction));

    if (directionalFromViewport.length) {
      const nextTarget = directionalFromViewport.reduce((best, target) => (
        direction > 0
          ? getSectionLiquidTargetCenter(target) < getSectionLiquidTargetCenter(best) ? target : best
          : getSectionLiquidTargetCenter(target) > getSectionLiquidTargetCenter(best) ? target : best
      ));
      return nextTarget.key === sectionLiquidState.lastTargetKey ? null : nextTarget;
    }

    const currentTarget = targets.find((target) => target.key === sectionLiquidState.lastTargetKey);
    if (currentTarget && isSectionLiquidTargetVisible(currentTarget)) return null;
    if (visibleTargets.length) {
      const closestVisible = getClosestSectionLiquidTarget(visibleTargets);
      return closestVisible.key === sectionLiquidState.lastTargetKey ? null : closestVisible;
    }

    return null;
  }

  const fullyVisible = targets.filter((target) => (
    target.key !== sectionLiquidState.lastTargetKey &&
    isSectionLiquidTargetFullyVisible(target)
  ));

  return fullyVisible.length ? getClosestSectionLiquidTarget(fullyVisible) : null;
}

function updateSectionLiquidScrollDirection() {
  const currentScrollY = window.scrollY;
  const delta = currentScrollY - sectionLiquidLastScrollY;
  if (Math.abs(delta) > 0.5) sectionLiquidScrollDirection = delta > 0 ? 1 : -1;
  sectionLiquidLastScrollY = currentScrollY;
}

function syncCurrentSectionLiquidTarget(targets: SectionLiquidTarget[]) {
  if (!sectionLiquidState.lastTargetKey) return;

  const currentTarget = targets.find((target) => target.key === sectionLiquidState.lastTargetKey);
  if (!currentTarget) return;

  const nextTargetX = currentTarget.rect.left + currentTarget.rect.width / 2;
  const nextTargetY = currentTarget.rect.top + currentTarget.rect.height / 2;
  const deltaX = nextTargetX - sectionLiquidState.targetX;
  const deltaY = nextTargetY - sectionLiquidState.targetY;

  sectionLiquidState.currentX += deltaX;
  sectionLiquidState.currentY += deltaY;
  sectionLiquidState.lastX += deltaX;
  sectionLiquidState.lastY += deltaY;
  sectionLiquidState.targetX = nextTargetX;
  sectionLiquidState.targetY = nextTargetY;
  sectionLiquidState.targetRadius = getSectionLiquidRadius(currentTarget);
}

function hideSectionLiquidTargetOverlay() {
  const targetHost = sectionLiquidRef.value?.querySelector<HTMLElement>("[data-section-liquid-target]");
  if (targetHost) targetHost.hidden = true;
}

function clearSectionLiquidTextAlignment() {
  sectionLiquidRef.value
    ?.querySelectorAll<HTMLElement>("[data-liquid-text-aligned], [data-liquid-clone-aligned]")
    .forEach((element) => {
      element.style.translate = "";
      element.removeAttribute("data-liquid-text-aligned");
      element.removeAttribute("data-liquid-clone-aligned");
    });
}

function syncSectionLiquidTargetOverlay(targets: SectionLiquidTarget[]) {
  clearSectionLiquidTextAlignment();
  hideSectionLiquidTargetOverlay();
  if (!sectionLiquidState.lastTargetKey) return;
  if (window.innerWidth > 900 && sectionLiquidState.lastTargetKey === "stack") return;

  const target = targets.find(({ key }) => key === sectionLiquidState.lastTargetKey);
  const cloneRoot = sectionLiquidRef.value?.querySelector<HTMLElement>(
    "[data-negative-world='page'] [data-negative-clone='true']",
  );
  if (!target || !cloneRoot) return;

  const cloneSelectors: Record<string, string> = {
    hero: "[data-negative-section='hero'] h1",
    about: "[data-negative-section='about'] .vz-about__head h2",
    stack: "[data-negative-section='stack'] .vz-sec-head h2",
    services: "[data-negative-section='services'] .vz-sec-head h2",
    clients: "[data-negative-section='clients'] h2",
    contacts: "[data-negative-section='contacts'] h2",
    footer: "[data-negative-section='footer'] .vz-footer__sign strong",
  };
  const cloneTarget = cloneRoot.querySelector<HTMLElement>(
    cloneSelectors[target.key] ?? "",
  );
  if (!cloneTarget) return;

  const sourceText = target.element.querySelector<HTMLElement>("[data-reveal]")
    ?? target.element;
  const cloneText = cloneTarget.querySelector<HTMLElement>("span span")
    ?? cloneTarget;
  const sourceRect = sourceText.getBoundingClientRect();
  const cloneRect = cloneText.getBoundingClientRect();

  cloneTarget.style.translate = `${formatStablePx(sourceRect.left - cloneRect.left)} ${formatStablePx(sourceRect.top - cloneRect.top)}`;
  cloneTarget.dataset.liquidCloneAligned = "true";
}

function commitSectionLiquidTarget(target: SectionLiquidTarget, snap = false) {
  const targetX = target.rect.left + target.rect.width / 2;
  const targetY = target.rect.top + target.rect.height / 2;
  const targetRadius = getSectionLiquidRadius(target);

  if (snap || !sectionLiquidState.initialized) {
    sectionLiquidState.currentX = targetX;
    sectionLiquidState.currentY = targetY;
    sectionLiquidState.lastX = targetX;
    sectionLiquidState.lastY = targetY;
    sectionLiquidState.arcX = 0;
    sectionLiquidState.arcY = 0;
    sectionLiquidState.radius = targetRadius;
    sectionLiquidState.speed = 0;
    sectionLiquidState.velocityX = 0;
    sectionLiquidState.velocityY = 0;
    sectionLiquidState.initialized = true;
  } else {
    const dx = targetX - sectionLiquidState.currentX;
    const dy = targetY - sectionLiquidState.currentY;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const direction = targetY >= sectionLiquidState.currentY ? 1 : -1;
    const normalX = -dy / distance;
    const normalY = dx / distance;
    const arc = clampValue(distance * 0.14, 34, 112) * direction;
    const impulse = clampValue(distance * 0.0038, 1.2, 5.8);

    sectionLiquidState.arcX = normalX * arc;
    sectionLiquidState.arcY = normalY * arc * 0.38;
    sectionLiquidState.velocityX += normalX * impulse * direction;
    sectionLiquidState.velocityY += normalY * impulse * 0.38 * direction;
  }

  sectionLiquidState.lastTargetKey = target.key;
  sectionLiquidState.targetX = targetX;
  sectionLiquidState.targetY = targetY;
  sectionLiquidState.targetRadius = targetRadius;
}

function startSectionLiquid() {
  if (!enableSectionLiquid || sectionLiquidRaf) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  sectionLiquidLastFrame = performance.now();
  sectionLiquidRaf = requestAnimationFrame(animateSectionLiquid);
}

function animateSectionLiquid(now: number) {
  sectionLiquidRaf = 0;
  const overlay = sectionLiquidRef.value;
  if (!overlay || !enableSectionLiquid) return;

  const frame = clampValue((now - sectionLiquidLastFrame) / 16.67, 0, 2.4);
  sectionLiquidLastFrame = now;
  updateSectionLiquidScrollDirection();
  const targets = getSectionLiquidTargets();
  const useStackScrollLock = window.innerWidth > 900;
  if (!useStackScrollLock) sectionLiquidStackLock = null;

  if (!targets.length && !sectionLiquidState.initialized) {
    overlay.classList.remove("is-active");
    overlay.removeAttribute("data-active-key");
    hideSectionLiquidTargetOverlay();
    sectionLiquidRaf = requestAnimationFrame(animateSectionLiquid);
    return;
  }

  if (!sectionLiquidState.initialized) {
    commitSectionLiquidTarget(getInitialSectionLiquidTarget(targets), true);
  } else {
    const nextTarget = getNextSectionLiquidTarget(targets);
    if (nextTarget) commitSectionLiquidTarget(nextTarget);
    else if (!sectionLiquidStackLock) syncCurrentSectionLiquidTarget(targets);
  }

  const stackScrollLock = getStackLiquidScrollLock(targets);
  if (stackScrollLock) {
    if (!sectionLiquidStackLock) {
      const sticky = rootRef.value?.querySelector<HTMLElement>(
        "[data-stack-section] > .vz-sticky",
      );
      const stickyRect = sticky?.getBoundingClientRect();
      sectionLiquidStackLock = {
        x: stackScrollLock.rect.left + stackScrollLock.rect.width / 2,
        y: stackScrollLock.rect.top + stackScrollLock.rect.height / 2,
        radius: getSectionLiquidRadius(stackScrollLock),
        stickyBounds: stickyRect
          ? {
              top: stickyRect.top,
              left: stickyRect.left,
              width: stickyRect.width,
              height: stickyRect.height,
            }
          : null,
      };
    }

    sectionLiquidState.targetX = sectionLiquidStackLock.x;
    sectionLiquidState.targetY = sectionLiquidStackLock.y;
    sectionLiquidState.targetRadius = sectionLiquidStackLock.radius;
  } else if (sectionLiquidState.lastTargetKey === "stack" && sectionLiquidScrollDirection < 0) {
    sectionLiquidStackLock = null;
  } else if (sectionLiquidState.lastTargetKey !== "stack") {
    sectionLiquidStackLock = null;
  }

  overlay.classList.toggle(
    "is-stack-active",
    useStackScrollLock && sectionLiquidState.lastTargetKey === "stack",
  );
  updateNegativeWorldPositions();
  syncSectionLiquidTargetOverlay(targets);

  const targetX = sectionLiquidState.targetX;
  const targetY = sectionLiquidState.targetY;
  const targetRadius = sectionLiquidState.targetRadius;
  const directDistance = Math.hypot(targetX - sectionLiquidState.currentX, targetY - sectionLiquidState.currentY);
  const landing = clampValue(1 - directDistance / 180, 0, 1);
  const steerX = targetX + sectionLiquidState.arcX * (1 - landing * 0.72) - sectionLiquidState.currentX;
  const steerY = targetY + sectionLiquidState.arcY * (1 - landing * 0.86) - sectionLiquidState.currentY;
  const horizontalDamping = 0.82 - landing * 0.08;
  const verticalDamping = 0.76 - landing * 0.1;

  sectionLiquidState.velocityX += steerX * (0.012 + (1 - landing) * 0.002) * frame;
  sectionLiquidState.velocityY += steerY * (0.009 + (1 - landing) * 0.002) * frame;
  sectionLiquidState.velocityX *= Math.pow(horizontalDamping, frame);
  sectionLiquidState.velocityY *= Math.pow(verticalDamping, frame);
  sectionLiquidState.velocityY = clampValue(sectionLiquidState.velocityY, -18, 18);
  sectionLiquidState.currentX += sectionLiquidState.velocityX * frame;
  sectionLiquidState.currentY += sectionLiquidState.velocityY * frame;
  sectionLiquidState.arcX *= Math.pow(0.9, frame);
  sectionLiquidState.arcY *= Math.pow(0.82, frame);
  sectionLiquidState.radius += (targetRadius - sectionLiquidState.radius) * 0.08 * frame;

  const lockDistance = Math.hypot(
    sectionLiquidState.targetX - sectionLiquidState.currentX,
    sectionLiquidState.targetY - sectionLiquidState.currentY,
  );
  const lockVelocity = Math.hypot(
    sectionLiquidState.velocityX,
    sectionLiquidState.velocityY,
  );
  if (sectionLiquidStackLock && lockDistance < 0.75 && lockVelocity < 0.15) {
    sectionLiquidState.currentX = sectionLiquidState.targetX;
    sectionLiquidState.currentY = sectionLiquidState.targetY;
    sectionLiquidState.lastX = sectionLiquidState.targetX;
    sectionLiquidState.lastY = sectionLiquidState.targetY;
    sectionLiquidState.arcX = 0;
    sectionLiquidState.arcY = 0;
    sectionLiquidState.velocityX = 0;
    sectionLiquidState.velocityY = 0;
  }

  const velocityX = sectionLiquidState.currentX - sectionLiquidState.lastX;
  const velocityY = sectionLiquidState.currentY - sectionLiquidState.lastY;
  const travel = Math.hypot(velocityX, velocityY);
  if (travel > 0.15) sectionLiquidState.angle = Math.atan2(velocityY, velocityX);
  sectionLiquidState.speed = clampValue(sectionLiquidState.speed * 0.88 + clampValue(travel / 24, 0, 1) * 0.12, 0, 1);
  sectionLiquidState.lastX = sectionLiquidState.currentX;
  sectionLiquidState.lastY = sectionLiquidState.currentY;

  const overlayRect = overlay.getBoundingClientRect();
  const bounds = {
    bottom: window.innerHeight - overlayRect.top,
    height: window.innerHeight,
    left: -overlayRect.left,
    right: window.innerWidth - overlayRect.left,
    top: -overlayRect.top,
    width: window.innerWidth,
  };
  const moveIntensity = clampValue(Math.max(sectionLiquidState.speed, directDistance / 340), 0, 1);
  const renderRadius = sectionLiquidState.radius * (1 - moveIntensity * 0.34);
  const activeKey = sectionLiquidState.lastTargetKey;
  const path = buildHeroLiquidPath(
    sectionLiquidState.currentX - overlayRect.left,
    sectionLiquidState.currentY - overlayRect.top,
    renderRadius,
    now * 0.001,
    sectionLiquidState.speed,
    sectionLiquidState.angle,
    bounds,
  );

  overlay.classList.toggle("is-active", Boolean(activeKey) && activeKey !== "hero");
  overlay.dataset.activeKey = activeKey;
  applyHeroClip(overlay, path);
  sectionLiquidRaf = requestAnimationFrame(animateSectionLiquid);
}

function updateHeroNegative(event: PointerEvent) {
  const hero = heroRef.value;
  if (!hero || event.pointerType === "touch") return;

  const rect = hero.getBoundingClientRect();
  const bounds = getHeroLiquidBounds(hero, rect);
  const pointerX = event.clientX - rect.left;
  const pointerY = event.clientY - rect.top;
  const isInsideBounds = pointerX >= bounds.left && pointerX <= bounds.right && pointerY >= bounds.top && pointerY <= bounds.bottom;
  if (!isInsideBounds) return;

  heroFxState.active = true;
  heroFxState.targetX = pointerX / rect.width;
  heroFxState.targetY = pointerY / rect.height;

  if (event.type === "pointermove") {
    if (heroFxState.hasPointer) {
      const pointerImpulseX = clampValue((pointerX - heroFxState.lastPointerX) / rect.width, -0.045, 0.045);
      const pointerImpulseY = clampValue((pointerY - heroFxState.lastPointerY) / rect.height, -0.045, 0.045);
      heroFxState.velocityX += pointerImpulseX * 0.034;
      heroFxState.velocityY += pointerImpulseY * 0.034;
    }

    heroFxState.hasPointer = true;
    heroFxState.lastPointerX = pointerX;
    heroFxState.lastPointerY = pointerY;
  }

  startHeroNegative();
}

function resetHeroNegative() {
  heroFxState.active = false;
  heroFxState.hasPointer = false;
  startHeroNegative();
}

function startHeroNegative() {
  if (heroFxRaf) return;
  heroFxLastFrame = performance.now();
  heroFxRaf = requestAnimationFrame(animateHeroNegative);
}

function animateHeroNegative(now: number) {
  const hero = heroRef.value;
  const mask = heroNegativeRef.value;
  if (!hero || !mask) {
    heroFxRaf = 0;
    return;
  }

  const rect = hero.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) {
    heroFxRaf = requestAnimationFrame(animateHeroNegative);
    return;
  }

  const frame = clampValue((now - heroFxLastFrame) / 16.67, 0, 2);
  heroFxLastFrame = now;
  const bounds = getHeroLiquidBounds(hero, rect);
  const radius = clampValue(Math.min(bounds.width * 0.16, bounds.height * 0.46, rect.width * 0.105), 76, 148);
  const centerInset = Math.min(radius * 0.14, bounds.width * 0.18, bounds.height * 0.18);
  const minCenterX = Math.min(bounds.left + centerInset, bounds.right);
  const maxCenterX = Math.max(bounds.right - centerInset, minCenterX);
  const minCenterY = Math.min(bounds.top + centerInset, bounds.bottom);
  const maxCenterY = Math.max(bounds.bottom - centerInset, minCenterY);
  const targetX = clampValue(heroFxState.targetX * rect.width, minCenterX, maxCenterX) / rect.width;
  const targetY = clampValue(heroFxState.targetY * rect.height, minCenterY, maxCenterY) / rect.height;

  if (heroFxState.active) {
    const dx = targetX - heroFxState.currentX;
    const dy = targetY - heroFxState.currentY;
    heroFxState.velocityX += dx * 0.0024 * frame;
    heroFxState.velocityY += dy * 0.0024 * frame;
  }

  const velocity = Math.hypot(heroFxState.velocityX, heroFxState.velocityY);
  if (!heroFxState.active && velocity < 0.00016) {
    heroFxState.velocityX += Math.cos(heroFxState.angle || -0.24) * 0.000012 * frame;
    heroFxState.velocityY += Math.sin(heroFxState.angle || -0.24) * 0.000012 * frame;
  }

  const damping = heroFxState.active ? 0.992 : 0.996;
  heroFxState.velocityX *= Math.pow(damping, frame);
  heroFxState.velocityY *= Math.pow(damping, frame);
  heroFxState.currentX += heroFxState.velocityX * frame;
  heroFxState.currentY += heroFxState.velocityY * frame;

  const clampedCenterX = clampValue(heroFxState.currentX * rect.width, minCenterX, maxCenterX);
  const clampedCenterY = clampValue(heroFxState.currentY * rect.height, minCenterY, maxCenterY);
  if (Math.abs(clampedCenterX - heroFxState.currentX * rect.width) > 0.1) {
    heroFxState.currentX = clampedCenterX / rect.width;
    heroFxState.velocityX = Math.sign(minCenterX + maxCenterX - clampedCenterX * 2 || 1) * Math.max(0.00022, Math.abs(heroFxState.velocityX) * 0.76);
  }
  if (Math.abs(clampedCenterY - heroFxState.currentY * rect.height) > 0.1) {
    heroFxState.currentY = clampedCenterY / rect.height;
    heroFxState.velocityY = Math.sign(minCenterY + maxCenterY - clampedCenterY * 2 || 1) * Math.max(0.00016, Math.abs(heroFxState.velocityY) * 0.76);
  }

  const velocityX = (heroFxState.currentX - heroFxState.lastX) * rect.width;
  const velocityY = (heroFxState.currentY - heroFxState.lastY) * rect.height;
  const travel = Math.hypot(velocityX, velocityY);

  if (travel > 0.2) heroFxState.angle = Math.atan2(velocityY, velocityX);
  heroFxState.speed = clampValue(heroFxState.speed * 0.9 + clampValue(travel / 20, 0, 1) * 0.08, 0, 1);
  heroFxState.lastX = heroFxState.currentX;
  heroFxState.lastY = heroFxState.currentY;

  const x = heroFxState.currentX * rect.width;
  const y = heroFxState.currentY * rect.height;
  const path = buildHeroLiquidPath(x, y, radius, now * 0.001, heroFxState.speed, heroFxState.angle, bounds);
  hero.classList.add("is-hero-fx-active");

  applyHeroClip(mask, path);
  heroFxRaf = requestAnimationFrame(animateHeroNegative);
}

function getHeroLiquidBounds(hero: HTMLElement, heroRect: DOMRect): HeroLiquidBounds {
  const title = hero.querySelector<HTMLElement>("h1");
  if (!title) {
    return {
      bottom: heroRect.height,
      height: heroRect.height,
      left: 0,
      right: heroRect.width,
      top: 0,
      width: heroRect.width,
    };
  }

  const titleRect = title.getBoundingClientRect();
  const left = clampValue(titleRect.left - heroRect.left, 0, heroRect.width);
  const top = clampValue(titleRect.top - heroRect.top, 0, heroRect.height);
  const right = clampValue(titleRect.right - heroRect.left, left, heroRect.width);
  const bottom = clampValue(titleRect.bottom - heroRect.top, top, heroRect.height);

  return {
    bottom,
    height: Math.max(1, bottom - top),
    left,
    right,
    top,
    width: Math.max(1, right - left),
  };
}

function buildHeroLiquidPath(cx: number, cy: number, baseRadius: number, time: number, speed: number, angle: number, bounds: HeroLiquidBounds) {
  const pointCount = 42;
  const points: Array<{ x: number; y: number }> = [];
  const wallRange = baseRadius * 1.05;
  const leftPressure = clampValue((bounds.left + wallRange - cx) / wallRange, 0, 1);
  const rightPressure = clampValue((cx - (bounds.right - wallRange)) / wallRange, 0, 1);
  const topPressure = clampValue((bounds.top + wallRange - cy) / wallRange, 0, 1);
  const bottomPressure = clampValue((cy - (bounds.bottom - wallRange)) / wallRange, 0, 1);
  const wallXPressure = Math.max(leftPressure, rightPressure);
  const wallYPressure = Math.max(topPressure, bottomPressure);

  for (let index = 0; index < pointCount; index += 1) {
    const a = (Math.PI * 2 * index) / pointCount;
    const flow = Math.cos(a - angle);
    const side = Math.sin(a - angle);
    const wobble =
      Math.sin(a * 3 + time * 2.2) * 0.095 +
      Math.sin(a * 5 - time * 1.55) * 0.06 +
      Math.sin(a * 7 + time * 0.84) * 0.036;
    const motionPulse = Math.cos((a - angle) * 2) * speed * 0.07;
    const surfaceTension = Math.abs(side) * speed * 0.04;
    const radius = baseRadius * (1 + wobble + motionPulse - surfaceTension);
    const stretch = baseRadius * speed * flow * 0.085;
    const rx = radius * (1 - wallXPressure * 0.22 + wallYPressure * 0.08);
    const ry = radius * (1 - wallYPressure * 0.22 + wallXPressure * 0.08);
    const wallSlideX = Math.sin(a * 2 + time * 1.7) * wallYPressure * baseRadius * 0.012;
    const wallSlideY = Math.cos(a * 2 - time * 1.45) * wallXPressure * baseRadius * 0.012;
    const rawX = cx + Math.cos(a) * rx + Math.cos(angle) * stretch + wallSlideX;
    const rawY = cy + Math.sin(a) * ry + Math.sin(angle) * stretch + wallSlideY;
    const clampedX = clampValue(rawX, bounds.left, bounds.right);
    const clampedY = clampValue(rawY, bounds.top, bounds.bottom);

    points.push({
      x: clampedX,
      y: clampedY,
    });
  }

  return getClosedCurvePath(points, bounds);
}

function applyHeroClip(element: HTMLElement, value: string) {
  const clipPath = `path("${value}")`;
  element.style.clipPath = clipPath;
  element.style.setProperty("-webkit-clip-path", clipPath);
}

function getClosedCurvePath(points: Array<{ x: number; y: number }>, bounds?: HeroLiquidBounds) {
  const size = points.length;
  const clampX = (value: number) => bounds ? clampValue(value, bounds.left, bounds.right) : value;
  const clampY = (value: number) => bounds ? clampValue(value, bounds.top, bounds.bottom) : value;
  const segments = [`M ${formatPathNumber(clampX(points[0].x))} ${formatPathNumber(clampY(points[0].y))}`];

  for (let index = 0; index < size; index += 1) {
    const p0 = points[(index - 1 + size) % size];
    const p1 = points[index];
    const p2 = points[(index + 1) % size];
    const p3 = points[(index + 2) % size];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    segments.push(
      `C ${formatPathNumber(clampX(c1x))} ${formatPathNumber(clampY(c1y))} ${formatPathNumber(clampX(c2x))} ${formatPathNumber(clampY(c2y))} ${formatPathNumber(clampX(p2.x))} ${formatPathNumber(clampY(p2.y))}`,
    );
  }

  return `${segments.join(" ")} Z`;
}

function formatPathNumber(value: number) {
  return value.toFixed(3);
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
  const sections = root.querySelectorAll<HTMLElement>("#hero, #about, [data-stack-section], [data-services-pin], #clients, #contacts, .vz-footer");

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
  scanSectionEntrances();
  scanReveals();
}

function handleStackActiveChange(index: number) {
  if (activeStackIndex.value !== index) {
    activeStackIndex.value = index;
    updateStackSpherePosition();
  }
  queueNegativeStackStateSync();
}

function handleStackSphereReady(element: HTMLElement) {
  stackSphereRef.value = element;
  nextTick(() => {
    updateStackSpherePosition();
    void setupStackSphereScene();
  });
}

function handleServiceActiveChange(index: number) {
  activeServiceIndex.value = index;
  syncNegativeWorlds(true);
}

function getNegativeWorldSignature(scope: "hero" | "page") {
  return [
    scope,
    theme.value,
    showPreloader.value ? "preloader" : "ready",
    displayServices.value.length,
    displayStackGroups.value.length,
    activeServiceIndex.value,
    activeClientSegment.value,
  ].join(":");
}

function cleanupNegativeClone(clone: HTMLElement) {
  clone.dataset.negativeClone = "true";
  clone.setAttribute("aria-hidden", "true");
  clone.removeAttribute("id");
  clone.classList.remove("vz-motion-ready");
  clone.querySelectorAll<HTMLElement>("#hero, #about, [data-stack-section], [data-services-pin], #clients, #contacts, .vz-footer").forEach((section) => {
    section.dataset.negativeSection = section.id || (section.classList.contains("vz-footer") ? "footer" : "");
    section.classList.add("is-motion-visible");
  });
  clone.querySelectorAll<HTMLElement>(".vz-section-liquid, .vz-hero__negative, .vz-preloader, .vz-mobile-menu").forEach((element) => element.remove());
  clone.querySelectorAll<HTMLElement>("[id]").forEach((element) => element.removeAttribute("id"));
  clone.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
    element.style.opacity = "1";
    element.style.transform = "translateY(0)";
    element.style.transition = "none";
    element.style.willChange = "auto";
  });
  clone.querySelectorAll<HTMLElement>("[data-clip-reveal]").forEach((element) => {
    element.style.clipPath = "inset(0 0 0 0)";
    element.style.transition = "none";
  });
  clone.querySelectorAll<HTMLElement>("[data-reveal], [data-clipped], [data-revealed]").forEach((element) => {
    element.removeAttribute("data-reveal");
    element.removeAttribute("data-clipped");
    element.removeAttribute("data-revealed");
  });
  clone.querySelectorAll<HTMLElement>("[data-clip-reveal]").forEach((element) => element.removeAttribute("data-clip-reveal"));
  clone.querySelectorAll<HTMLElement>("a, button, input, textarea, select").forEach((element) => {
    element.setAttribute("tabindex", "-1");
  });
}

function mountNegativeClone(host: HTMLElement, source: HTMLElement) {
  host.textContent = "";
  const clone = source.cloneNode(true) as HTMLElement;
  cleanupNegativeClone(clone);
  host.appendChild(clone);
}

function syncNegativeStackState() {
  const source = rootRef.value?.querySelector<HTMLElement>("[data-stack-section]");
  const clone = sectionLiquidRef.value?.querySelector<HTMLElement>(
    "[data-negative-world='page'] [data-stack-section]",
  );
  if (!source || !clone) return;

  const sourceItems = source.querySelectorAll<HTMLElement>("[data-stack-item]");
  const cloneItems = clone.querySelectorAll<HTMLElement>("[data-stack-item]");
  cloneItems.forEach((item, index) => {
    const sourceItem = sourceItems.item(index);
    if (!sourceItem) return;

    item.classList.toggle("is-active", sourceItem.classList.contains("is-active"));
    item.classList.toggle("is-past", sourceItem.classList.contains("is-past"));
    const ariaCurrent = sourceItem.getAttribute("aria-current");
    if (ariaCurrent) item.setAttribute("aria-current", ariaCurrent);
    else item.removeAttribute("aria-current");
  });

  const sourceCounter = source.querySelector<HTMLElement>("[data-stack-counter]");
  const cloneCounter = clone.querySelector<HTMLElement>("[data-stack-counter]");
  if (sourceCounter && cloneCounter && cloneCounter.textContent !== sourceCounter.textContent) {
    cloneCounter.textContent = sourceCounter.textContent;
  }

  const sourceFill = source.querySelector<HTMLElement>("[data-line-fill]");
  const cloneFill = clone.querySelector<HTMLElement>("[data-line-fill]");
  if (sourceFill && cloneFill && cloneFill.style.height !== sourceFill.style.height) {
    cloneFill.style.height = sourceFill.style.height;
  }

  const sourceSphere = source.querySelector<HTMLElement>(".vz-stack__sphere");
  const cloneSphere = clone.querySelector<HTMLElement>(".vz-stack__sphere");
  const sphereLayer = sourceSphere?.dataset.layer;
  if (cloneSphere && sphereLayer && cloneSphere.dataset.layer !== sphereLayer) {
    cloneSphere.dataset.layer = sphereLayer;
  }
}

function queueNegativeStackStateSync() {
  if (negativeStackSyncQueued) return;
  negativeStackSyncQueued = true;
  void nextTick(() => {
    negativeStackSyncQueued = false;
    syncNegativeStackState();
  });
}

function syncNegativeWorlds(force = false) {
  const root = rootRef.value;
  const hero = heroRef.value;
  const pageHost = sectionLiquidRef.value?.querySelector<HTMLElement>("[data-negative-world='page']");
  const heroHost = heroNegativeRef.value?.querySelector<HTMLElement>("[data-negative-world='hero']");

  if (root && pageHost) {
    const signature = getNegativeWorldSignature("page");
    if (force || pageHost.dataset.signature !== signature) {
      mountNegativeClone(pageHost, root);
      pageHost.dataset.signature = signature;
    }
  }

  if (hero && heroHost) {
    const signature = getNegativeWorldSignature("hero");
    if (force || heroHost.dataset.signature !== signature) {
      mountNegativeClone(heroHost, hero);
      heroHost.dataset.signature = signature;
    }
  }

  updateNegativeWorldPositions();
}

function updateNegativeWorldPositions() {
  const root = rootRef.value;
  const overlay = sectionLiquidRef.value;
  const pageHost = sectionLiquidRef.value?.querySelector<HTMLElement>("[data-negative-world='page']");
  if (root && overlay && pageHost) {
    const rect = root.getBoundingClientRect();
    const height = Math.max(root.scrollHeight, root.offsetHeight, window.innerHeight);
    const cloneStackSticky = pageHost.querySelector<HTMLElement>(
      "[data-negative-clone='true'] [data-stack-section] > .vz-sticky",
    );
    const sourceStackSticky = root.querySelector<HTMLElement>(
      "[data-stack-section] > .vz-sticky",
    );

    if (window.innerWidth > 900 && sectionLiquidState.lastTargetKey === "stack") {
      overlay.style.left = "0px";
      overlay.style.top = "0px";
      overlay.style.width = formatStablePx(window.innerWidth);
      overlay.style.height = formatStablePx(window.innerHeight);

      const stickyRect = sectionLiquidStackLock?.stickyBounds
        ?? sourceStackSticky?.getBoundingClientRect()
        ?? null;
      if (stickyRect && cloneStackSticky) {
        cloneStackSticky.style.position = "fixed";
        cloneStackSticky.style.top = formatStablePx(stickyRect.top);
        cloneStackSticky.style.right = "auto";
        cloneStackSticky.style.bottom = "auto";
        cloneStackSticky.style.left = formatStablePx(stickyRect.left);
        cloneStackSticky.style.width = formatStablePx(stickyRect.width);
        cloneStackSticky.style.height = formatStablePx(stickyRect.height);
      }
      return;
    }

    if (cloneStackSticky) {
      cloneStackSticky.style.position = "";
      cloneStackSticky.style.top = "";
      cloneStackSticky.style.right = "";
      cloneStackSticky.style.bottom = "";
      cloneStackSticky.style.left = "";
      cloneStackSticky.style.width = "";
      cloneStackSticky.style.height = "";
    }

    const documentLeft = rect.left + window.scrollX;
    const documentTop = rect.top + window.scrollY;
    overlay.style.left = formatStablePx(documentLeft);
    overlay.style.top = formatStablePx(documentTop);
    overlay.style.width = formatStablePx(rect.width);
    overlay.style.height = `${height}px`;

    pageHost.style.left = "0px";
    pageHost.style.top = "0px";
    pageHost.style.width = "100%";
    pageHost.style.minHeight = `${height}px`;
  }
}

let raf = 0;
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
  theme.value = localStorage.getItem("vz_theme") || "light";
  localeWatcherReady = true;
  runPreloader();
  setupReveals();
  updateScrollEffects();
  sectionLiquidLastScrollY = window.scrollY;
  footerGameLastScrollY = window.scrollY;
  await nextTick();
  syncNegativeWorlds(true);
  updateStackSpherePosition();
  updateClientCubePosition();
  startHeroNegative();
  startSectionLiquid();
  setupAboutFlowObserver();
  void setupClientCubeScene();
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  await loadPublicData();
  await nextTick();
  setupReveals();
  updateScrollEffects();
  updateStackSpherePosition();
  updateClientCubePosition();
  syncNegativeWorlds(true);
  startHeroNegative();
});

watch(activeClientSegment, async () => {
  updateClientCubeStage?.(activeClientSegment.value);
  await nextTick();
  updateClientCubePosition();
  syncNegativeWorlds(true);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", scheduleUpdate);
  window.removeEventListener("resize", scheduleUpdate);
  if (raf) cancelAnimationFrame(raf);
  if (heroFxRaf) cancelAnimationFrame(heroFxRaf);
  if (sectionLiquidRaf) cancelAnimationFrame(sectionLiquidRaf);
  stopAboutFlow();
  stackSphereCleanup?.();
  clientCubeCleanup?.();
  stopFooterGameLoop();
});

watch(displayStackGroups, () => {
  activeStackIndex.value = clampStackIndex(activeStackIndex.value);
  updateScrollEffects();
  void nextTick(updateStackSpherePosition);
});

watch(currentLocale, async (nextLocale) => {
  document.documentElement.lang = currentLocale.value;
  if (!localeWatcherReady) return;
  await loadPublicData(nextLocale);
  await nextTick();
  setupReveals();
  updateScrollEffects();
});

watch(displayServices, async () => {
  await nextTick();
  updateScrollEffects();
  syncNegativeWorlds(true);
  startSectionLiquid();
});

const themeInitScript = `!function(){try{var t=localStorage.getItem("vz_theme");if(t!=="dark"&&t!=="light"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t}catch(e){}}();`;

useHead(() => ({
  htmlAttrs: {
    lang: currentLocale.value,
  },
  title: copy.value.head.title,
  meta: [
    {
      name: "description",
      content: copy.value.head.description,
    },
    { property: "og:title", content: copy.value.head.ogTitle },
    { property: "og:description", content: copy.value.head.ogDescription },
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
  script: [
    {
      key: "vz-theme-init",
      innerHTML: themeInitScript,
      tagPosition: "head",
    },
  ],
}));
</script>

<style>
.vz-min,
.vz-min * {
  box-sizing: border-box;
}

.vz-min {
  --bg: #ffffff;
  --ink: #1c1d21;
  --text2: #565a62;
  --text3: #6b6f77;
  --chipink: #45484e;
  --muted: #9ba0a8;
  --muted2: #b9bdc3;
  --idle: #c2c6cc;
  --hair: #cdd1d6;
  --border: #ececef;
  --border2: #f0f1f3;
  --surface: #f6f7f9;
  --surface-bd: #eceef0;
  --hover: #fafbfc;
  --chipbd: #e5e7ea;
  --ghost: #f1f2f4;
  --dotbd: #d9dce0;
  --dot: #ffffff;
  --btnhover: #36373d;
  --slash: #dcdfe3;
  --navbg: rgba(255, 255, 255, 0.72);
  --halo: rgba(28, 29, 33, 0.07);
  --aura: rgba(63, 77, 91, 0.1);
  --section-space: 80px;
  overflow-x: clip;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: "Onest", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  transition: background 0.4s ease, color 0.4s ease;
}

.vz-min[data-theme="dark"] {
  --bg: #0e0f12;
  --ink: #f2f3f5;
  --text2: #a6acb4;
  --text3: #969ca4;
  --chipink: #c6cbd1;
  --muted: #79808a;
  --muted2: #5c626b;
  --idle: #41464e;
  --hair: #34383f;
  --border: #26282d;
  --border2: #1b1d21;
  --surface: #15171b;
  --surface-bd: #212429;
  --hover: #181a1e;
  --chipbd: #2b2e34;
  --ghost: #191b1f;
  --dotbd: #3b404a;
  --dot: #ffffff;
  --btnhover: #d9dbdf;
  --slash: #34383f;
  --navbg: rgba(14, 15, 18, 0.66);
  --halo: rgba(255, 255, 255, 0.28);
  --aura: rgba(63, 77, 91, 0.24);
}

.vz-min[data-theme="dark"] .vz-about__liquid {
  mix-blend-mode: screen;
  opacity: 0.2;
}

.vz-min[data-theme="dark"] .vz-stack__sphere {
  filter: invert(1);
  opacity: 0.5;
}

.vz-min ::selection {
  background: var(--ink);
  color: var(--bg);
}

@keyframes vz-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes vz-orbit {
  to { transform: rotate(360deg); }
}

@keyframes vz-motion-rise {
  from {
    opacity: 0;
    transform: translate3d(0, 28px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes vz-motion-pop {
  from {
    opacity: 0;
    transform: translate3d(0, 18px, 0) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes vz-motion-line-x {
  from {
    opacity: 0;
    transform: scaleX(0);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes vz-motion-line-y {
  from {
    opacity: 0;
    transform: scaleY(0);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

@keyframes vz-client-copy-in {
  from {
    opacity: 0;
    transform: translate3d(0, 16px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.vz-motion-ready [data-reveal] {
  filter: none !important;
}

.vz-motion-ready #hero:not(.is-motion-visible) .vz-hero__meta,
.vz-motion-ready #hero:not(.is-motion-visible) .vz-hero__kicker,
.vz-motion-ready #hero:not(.is-motion-visible) .vz-hero__grid,
.vz-motion-ready #hero:not(.is-motion-visible) .vz-hero__stats,
.vz-motion-ready #hero:not(.is-motion-visible) > .vz-marquee,
.vz-motion-ready .vz-about:not(.is-motion-visible) .vz-section-label,
.vz-motion-ready .vz-about:not(.is-motion-visible) .vz-about__head h2,
.vz-motion-ready .vz-about:not(.is-motion-visible) .vz-about__intro,
.vz-motion-ready .vz-about:not(.is-motion-visible) .vz-about__flow,
.vz-motion-ready .vz-about:not(.is-motion-visible) .vz-about__proof,
.vz-motion-ready .vz-clients:not(.is-motion-visible) .vz-section-label,
.vz-motion-ready .vz-clients:not(.is-motion-visible) .vz-client-capsules button,
.vz-motion-ready .vz-clients:not(.is-motion-visible) .vz-client-copy > *,
.vz-motion-ready .vz-contacts:not(.is-motion-visible) .vz-section-label,
.vz-motion-ready .vz-contacts:not(.is-motion-visible) .vz-contacts__buttons,
.vz-motion-ready .vz-footer:not(.is-motion-visible) .vz-footer__top,
.vz-motion-ready .vz-footer:not(.is-motion-visible) .vz-footer__cols > div,
.vz-motion-ready .vz-footer:not(.is-motion-visible) .vz-footer__sign > div,
.vz-motion-ready .vz-footer:not(.is-motion-visible) .vz-footer__sign strong,
.vz-motion-ready .vz-footer:not(.is-motion-visible) .vz-footer__legal,
.vz-motion-ready .vz-footer:not(.is-motion-visible) .vz-footer-game {
  opacity: 0;
  transform: translate3d(0, 28px, 0);
}

.vz-motion-ready .vz-client-connector,
.vz-motion-ready .vz-footer__top,
.vz-motion-ready .vz-footer__sign {
  transform-origin: left center;
}

.vz-motion-ready .vz-client-connector span {
  transform-origin: center bottom;
}

.vz-motion-ready .vz-clients:not(.is-motion-visible) .vz-client-connector,
.vz-motion-ready .vz-footer:not(.is-motion-visible) .vz-footer__top,
.vz-motion-ready .vz-footer:not(.is-motion-visible) .vz-footer__sign {
  opacity: 0;
  transform: scaleX(0);
}

.vz-motion-ready .vz-clients:not(.is-motion-visible) .vz-client-connector span {
  opacity: 0;
  transform: translateX(-50%) scaleY(0);
}

.vz-motion-ready #hero.is-motion-visible .vz-hero__meta,
.vz-motion-ready #hero.is-motion-visible .vz-hero__kicker,
.vz-motion-ready #hero.is-motion-visible .vz-hero__grid,
.vz-motion-ready #hero.is-motion-visible .vz-hero__stats,
.vz-motion-ready #hero.is-motion-visible > .vz-marquee,
.vz-motion-ready .vz-about.is-motion-visible .vz-section-label,
.vz-motion-ready .vz-about.is-motion-visible .vz-about__head h2,
.vz-motion-ready .vz-about.is-motion-visible .vz-about__intro,
.vz-motion-ready .vz-about.is-motion-visible .vz-about__flow,
.vz-motion-ready .vz-about.is-motion-visible .vz-about__proof,
.vz-motion-ready .vz-clients.is-motion-visible .vz-section-label,
.vz-motion-ready .vz-clients.is-motion-visible .vz-client-copy > *,
.vz-motion-ready .vz-contacts.is-motion-visible .vz-section-label,
.vz-motion-ready .vz-contacts.is-motion-visible .vz-contacts__buttons,
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__top,
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__cols > div,
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__sign > div,
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__sign strong,
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__legal,
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer-game {
  animation: vz-motion-rise 0.95s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.vz-motion-ready .vz-clients.is-motion-visible .vz-client-connector,
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__top,
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__sign {
  animation: vz-motion-line-x 0.9s cubic-bezier(0.76, 0, 0.24, 1) both;
}

.vz-motion-ready .vz-clients.is-motion-visible .vz-client-connector span {
  animation: vz-motion-line-y 0.62s cubic-bezier(0.76, 0, 0.24, 1) 0.42s both;
}

.vz-motion-ready #hero.is-motion-visible .vz-hero__kicker { animation-delay: 0.08s; }
.vz-motion-ready #hero.is-motion-visible .vz-hero__grid { animation-delay: 0.34s; }
.vz-motion-ready #hero.is-motion-visible .vz-hero__stats { animation-delay: 0.5s; }
.vz-motion-ready #hero.is-motion-visible > .vz-marquee { animation-delay: 0.62s; }

.vz-motion-ready .vz-about.is-motion-visible .vz-about__head h2 { animation-delay: 0.12s; }
.vz-motion-ready .vz-about.is-motion-visible .vz-about__intro { animation-delay: 0.2s; }
.vz-motion-ready .vz-about.is-motion-visible .vz-about__flow { animation-delay: 0.3s; }
.vz-motion-ready .vz-about.is-motion-visible .vz-about__proof { animation-delay: 0.38s; }

.vz-motion-ready .vz-clients.is-motion-visible .vz-client-capsules button {
  animation: vz-motion-pop 0.82s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.vz-motion-ready .vz-clients.is-motion-visible .vz-client-capsules button:nth-child(1) { animation-delay: 0.12s; }
.vz-motion-ready .vz-clients.is-motion-visible .vz-client-capsules button:nth-child(2) { animation-delay: 0.2s; }
.vz-motion-ready .vz-clients.is-motion-visible .vz-client-capsules button:nth-child(3) { animation-delay: 0.28s; }
.vz-motion-ready .vz-clients.is-motion-visible .vz-client-copy > span { animation-delay: 0.42s; }
.vz-motion-ready .vz-clients.is-motion-visible .vz-client-copy h3 { animation-delay: 0.48s; }
.vz-motion-ready .vz-clients.is-motion-visible .vz-client-copy p { animation-delay: 0.58s; }

.vz-motion-ready .vz-client-copy > span,
.vz-motion-ready .vz-client-copy h3,
.vz-motion-ready .vz-client-copy p {
  animation: vz-client-copy-in 0.56s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.vz-motion-ready .vz-client-copy h3 { animation-delay: 0.04s; }
.vz-motion-ready .vz-client-copy p { animation-delay: 0.1s; }

.vz-motion-ready .vz-contacts.is-motion-visible .vz-contacts__buttons { animation-delay: 0.32s; }
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__cols > div:nth-child(1) { animation-delay: 0.14s; }
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__cols > div:nth-child(2) { animation-delay: 0.22s; }
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__cols > div:nth-child(3) { animation-delay: 0.3s; }
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__cols > div:nth-child(4) { animation-delay: 0.38s; }
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__sign { animation-delay: 0.46s; }
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__sign > div { animation-delay: 0.54s; }
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__sign strong { animation-delay: 0.62s; }
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer__legal { animation-delay: 0.72s; }
.vz-motion-ready .vz-footer.is-motion-visible .vz-footer-game { animation-delay: 0.82s; }

.vz-preloader {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  background: var(--bg);
  transition: transform 0.9s cubic-bezier(0.76, 0, 0.24, 1);
}

.vz-preloader__top,
.vz-preloader__meta,
.vz-section-label,
.vz-hero__meta,
.vz-hero__kicker,
.vz-hero__stats,
.vz-footer__top,
.vz-footer__cols > div > span,
.vz-footer__sign > div,
.vz-footer__legal {
  font-family: "JetBrains Mono", monospace;
}

.vz-preloader__top {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}

.vz-preloader__bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
}

.vz-preloader__count {
  color: var(--ink);
  font-family: "JetBrains Mono", monospace;
  font-size: clamp(72px, 17vw, 230px);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 0.86;
}

.vz-preloader__count span:last-child {
  color: var(--idle);
}

.vz-preloader__meta {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.16em;
  line-height: 1.7;
  text-align: right;
  text-transform: uppercase;
}

.vz-nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  display: flex;
  height: 68px;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  border-bottom: 1px solid var(--border);
  background: var(--navbg);
  backdrop-filter: saturate(1.4) blur(14px);
}

.vz-logo {
  display: flex;
  align-items: baseline;
  gap: 7px;
  color: var(--ink);
  text-decoration: none;
}

.vz-logo span {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.vz-logo small {
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.vz-nav__links {
  display: flex;
  align-items: center;
  gap: 30px;
}

.vz-nav__links a,
.vz-footer a {
  color: var(--text2);
  text-decoration: none;
}

.vz-nav__links a {
  font-size: 14px;
}

.vz-nav__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vz-icon-button,
.vz-menu-button {
  display: flex;
  height: 38px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
}

.vz-icon-button,
.vz-menu-button {
  width: 38px;
}

.vz-nav__cta,
.vz-button,
.vz-mobile-menu__cta {
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
}

.vz-nav__cta {
  padding: 11px 20px;
  background: var(--ink);
  color: var(--bg);
  font-size: 14px;
}

.vz-menu-button {
  display: none;
  flex-direction: column;
  gap: 4px;
}

.vz-menu-button span {
  display: block;
  width: 17px;
  height: 1.5px;
  background: var(--ink);
}

.vz-mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 150;
  display: flex;
  flex-direction: column;
  padding: 22px 24px 40px;
  background: var(--bg);
}

.vz-mobile-menu__top,
.vz-mobile-menu__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vz-mobile-menu__controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vz-mobile-menu__links {
  display: flex;
  flex-direction: column;
  margin-top: 38px;
}

.vz-mobile-menu__links a {
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  color: var(--ink);
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-decoration: none;
  text-transform: uppercase;
}

.vz-mobile-menu__cta {
  margin-top: 30px;
  padding: 17px;
  background: var(--ink);
  color: var(--bg);
  font-size: 16px;
  text-align: center;
}

.vz-mobile-menu__bottom {
  margin-top: auto;
  padding-top: 30px;
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.vz-hero {
  --hero-art-bottom: 138px;
  position: relative;
  isolation: isolate;
  max-width: 1320px;
  margin: 0 auto;
  padding: 150px 40px 32px;
}

.vz-hero__art {
  position: absolute;
  top: 0;
  right: 0;
  bottom: var(--hero-art-bottom);
  left: 0;
  z-index: 0;
  overflow: visible;
  pointer-events: none;
}

.vz-contacts__art {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.vz-aura,
.vz-contacts__art > div {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--aura) 0%, transparent 70%);
}

.vz-aura--top {
  top: -110px;
  right: -42px;
  width: 540px;
  height: 540px;
}

.vz-orbit {
  position: absolute;
  top: 52%;
  right: 1%;
  width: min(56vmin, 540px);
  height: min(56vmin, 540px);
  transform: translateY(-50%);
}

.vz-orbit svg {
  width: 100%;
  height: 100%;
  color: var(--hair);
  opacity: 0.55;
  animation: vz-orbit 48s linear infinite;
  transform-origin: 50% 50%;
}

.vz-hero__negative {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  clip-path: circle(0 at 64% 48%);
  contain: paint;
  transition: opacity 0.42s ease;
  will-change: clip-path, opacity;
}

.vz-hero.is-hero-fx-active .vz-hero__negative {
  opacity: 1;
}

.vz-hero__negative-plane {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--ink);
}

.vz-hero__inner,
.vz-contacts__inner {
  position: relative;
  z-index: 1;
}

.vz-hero__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.vz-hero__kicker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.vz-hero h1 {
  margin: 22px 0 0;
  font-size: clamp(42px, 7vw, 104px);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 0.95;
  text-transform: uppercase;
}

.vz-hero h1 > span,
.vz-clients h2 > span,
.vz-contacts h2 > span {
  display: block;
  overflow: hidden;
  padding-bottom: 0.08em;
}

.vz-hero h1 > span {
  padding-bottom: 0.06em;
}

.vz-hero h1 span span,
.vz-clients h2 span span,
.vz-contacts h2 span span {
  display: block;
}

.vz-hero__grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 60px;
  align-items: end;
  margin-top: 50px;
}

.vz-hero__grid p {
  max-width: 52ch;
  margin: 0;
  color: var(--text2);
  font-size: 19px;
  line-height: 1.55;
}

.vz-hero__actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-end;
  justify-self: end;
}

.vz-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.vz-button--dark {
  padding: 16px 28px;
  background: var(--ink);
  color: var(--bg);
}

.vz-button--light {
  padding: 17px 28px;
  border: 1px solid var(--dotbd);
  color: var(--ink);
}

.vz-button-link {
  display: inline-flex;
  gap: 9px;
  padding-left: 4px;
  color: var(--ink);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
}

.vz-section-liquid {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 170;
  width: 100%;
  min-height: 100vh;
  overflow: clip;
  opacity: 0;
  pointer-events: none;
  background: transparent;
  isolation: isolate;
  transition: opacity 0.22s ease;
  will-change: clip-path, opacity;
}

.vz-section-liquid::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(circle at 44% 36%, rgba(92, 216, 255, 0.16), transparent 38%),
    rgba(18, 19, 24, 0.9);
  backdrop-filter: invert(1) hue-rotate(172deg) saturate(1.22) contrast(1.08);
  -webkit-backdrop-filter: invert(1) hue-rotate(172deg) saturate(1.22) contrast(1.08);
}

.vz-section-liquid[data-theme="dark"]::before {
  background:
    radial-gradient(circle at 44% 36%, rgba(173, 156, 255, 0.14), transparent 38%),
    rgba(242, 243, 245, 0.94);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.vz-section-liquid.is-active {
  opacity: 1;
}

.vz-section-liquid.is-stack-active {
  position: fixed;
}

.vz-section-liquid.is-stack-active .vz-negative-world {
  visibility: hidden;
}

.vz-section-liquid.is-stack-active
  .vz-negative-world
  [data-negative-clone="true"]
  [data-stack-section]
  > .vz-sticky {
  visibility: visible;
  backface-visibility: hidden;
  transform: translateZ(0);
  will-change: transform;
}

.vz-section-liquid__target {
  position: absolute;
  z-index: 2;
  margin: 0;
  overflow: visible;
  pointer-events: none;
  background:
    linear-gradient(104deg, #f7f9ff 0%, #ad9cff 38%, #51d8ff 72%, #ffffff 100%);
  background-clip: text;
  color: transparent;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transform: translateZ(0);
}

.vz-section-liquid__target[hidden] {
  display: none;
}

.vz-negative-world {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  min-height: 100%;
  overflow: visible;
  color: #f7f9ff;
  pointer-events: none;
}

.vz-negative-world > [data-negative-clone="true"] {
  width: 100%;
  min-height: inherit;
  background: transparent;
  color: #f7f9ff;
  --bg: transparent;
  --ink: #f7f9ff;
  --text2: #d7def0;
  --muted: #b9bfd0;
  --muted2: #8edfff;
  --slash: rgba(247, 249, 255, 0.42);
  --border: rgba(247, 249, 255, 0.14);
  --border2: rgba(247, 249, 255, 0.08);
  --hair: rgba(247, 249, 255, 0.18);
  --dot: rgba(247, 249, 255, 0.18);
  --dotbd: rgba(247, 249, 255, 0.34);
  --idle: rgba(247, 249, 255, 0.44);
  --surface: transparent;
  --surface-bd: rgba(247, 249, 255, 0.12);
  --chipbd: rgba(247, 249, 255, 0.25);
  --navbg: transparent;
  --aura: rgba(142, 223, 255, 0.12);
  --halo: rgba(173, 156, 255, 0.18);
}

.vz-negative-world--hero {
  inset: 0;
}

.vz-negative-world--hero > .vz-hero {
  width: 100%;
  max-width: none;
  margin: 0;
}

.vz-negative-world h1,
.vz-negative-world h1 span,
.vz-negative-world h1 span span,
.vz-negative-world h2,
.vz-negative-world h2 span,
.vz-negative-world h2 span span,
.vz-negative-world .vz-about__head h2,
.vz-negative-world .vz-footer__sign strong,
.vz-negative-world .vz-footer__sign strong span,
.vz-negative-world .vz-footer-game__letter {
  background:
    linear-gradient(104deg, #f7f9ff 0%, #ad9cff 38%, #51d8ff 72%, #ffffff 100%);
  background-clip: text;
  color: transparent;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.vz-negative-world h1 *,
.vz-negative-world h2 * {
  background: inherit;
  background-clip: text;
  color: transparent;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.vz-negative-world a,
.vz-negative-world button,
.vz-negative-world p,
.vz-negative-world small,
.vz-negative-world strong {
  border-color: var(--border);
}

.vz-negative-world span {
  border-color: var(--border);
}

.vz-hero__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, max-content));
  align-items: center;
  justify-items: start;
  gap: 12px;
  margin-top: 48px;
  padding-top: 0;
  padding-bottom: 4px;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vz-hero__stats span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.vz-marquee {
  overflow: hidden;
  padding: 22px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.vz-hero > .vz-marquee {
  position: relative;
  z-index: 1;
  width: 100vw;
  margin: 20px 0 0 calc(50% - 50vw);
}

.vz-marquee > div {
  display: inline-flex;
  white-space: nowrap;
  animation: vz-marquee 32s linear infinite;
  will-change: transform;
}

.vz-marquee span {
  display: inline-flex;
  align-items: center;
  padding: 0 24px;
  color: var(--ink);
  font-size: clamp(20px, 2.4vw, 30px);
  font-weight: 600;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}

.vz-marquee i {
  margin-left: 24px;
  color: var(--hair);
  font-style: normal;
}

.vz-about__grid,
.vz-clients__grid {
  display: grid;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
}

.vz-about__grid {
  align-items: center;
  grid-template-columns: minmax(320px, 430px) minmax(0, 1fr);
  gap: clamp(56px, 8vw, 118px);
  position: relative;
}

.vz-section-label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.vz-section-label i {
  margin: 0 9px;
  color: var(--hair);
  font-style: normal;
}

.vz-about {
  position: relative;
  overflow: hidden;
}

.vz-about__liquid {
  position: absolute;
  top: clamp(82px, 9vw, 132px);
  right: max(-64px, calc((100vw - 1240px) / 2 - 64px));
  z-index: 0;
  width: clamp(300px, 30vw, 480px);
  aspect-ratio: 16 / 10;
  opacity: 0.48;
  pointer-events: none;
  transform: rotate(-8deg);
  mask-image: radial-gradient(ellipse at center, #000 44%, rgba(0, 0, 0, 0.72) 60%, transparent 82%);
}

.vz-about__liquid canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.vz-about__brand {
  position: relative;
  z-index: 1;
  align-self: stretch;
  display: flex;
  min-height: clamp(420px, 58vh, 520px);
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 0 0 2px;
}

.vz-about__mark {
  position: relative;
  display: grid;
  min-height: clamp(168px, 26vh, 232px);
  margin-top: clamp(26px, 5vh, 46px);
  place-items: center start;
}

.vz-about__mark span {
  position: relative;
  z-index: 1;
  color: var(--ink);
  font-size: clamp(58px, 7.5vw, 118px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.82;
  text-transform: uppercase;
}

.vz-about__mark i {
  position: absolute;
  right: 0;
  bottom: 18px;
  color: var(--muted2);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  font-style: normal;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.vz-about__roles {
  display: grid;
  grid-template-columns: 1fr;
  margin-top: 32px;
  border-top: 1px solid var(--border);
}

.vz-about__roles div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 15px 0;
  border-bottom: 1px solid var(--border);
}

.vz-about__roles span {
  color: var(--muted2);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
}

.vz-about__roles strong {
  color: var(--ink);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.vz-about__note {
  max-width: 32ch;
  margin: 28px 0 0;
  color: var(--text2);
  font-size: 16px;
  line-height: 1.55;
}

.vz-about__copy {
  position: relative;
  z-index: 1;
  justify-self: end;
  width: 100%;
  max-width: 760px;
}

.vz-about__eyebrow {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  margin-bottom: 20px;
  color: var(--muted2);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.vz-about__eyebrow span {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.vz-about__eyebrow span + span::before {
  content: "/";
  color: var(--slash);
}

.vz-about__lead {
  margin: 0;
  max-width: 13ch;
  font-size: clamp(34px, 4vw, 56px);
  font-weight: 650;
  letter-spacing: -0.04em;
  line-height: 0.98;
  text-transform: uppercase;
}

.vz-about__principles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  margin-top: clamp(26px, 4vh, 38px);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.vz-about__principles article {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 18px;
  padding: clamp(16px, 2.2vh, 22px) 0;
}

.vz-about__principles article + article {
  padding-left: 28px;
  border-left: 1px solid var(--border);
}

.vz-about__principles span {
  color: var(--muted2);
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  letter-spacing: 0.16em;
}

.vz-about__principles p,
.vz-sec-meta p {
  color: var(--text2);
  line-height: 1.65;
}

.vz-about__principles p {
  margin: 0;
  font-size: 16px;
}

.vz-about__metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: clamp(18px, 3vh, 24px);
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 52%, transparent);
}

.vz-about__metrics div {
  min-height: clamp(86px, 12vh, 108px);
  padding: 18px;
}

.vz-about__metrics div + div {
  border-left: 1px solid var(--border);
}

.vz-about__metrics strong {
  display: block;
  color: var(--ink);
  font-size: clamp(32px, 3vw, 48px);
  font-weight: 650;
  letter-spacing: -0.04em;
  line-height: 0.9;
}

.vz-about__metrics span {
  display: block;
  max-width: 14ch;
  margin-top: 18px;
  color: var(--text2);
  font-size: 14px;
  line-height: 1.35;
}

.vz-stack {
  position: relative;
  border-top: 1px solid var(--border2);
}

.vz-stack {
  padding: var(--section-space) 0;
}

.vz-stack > .vz-sticky {
  backface-visibility: hidden;
  transform: translateZ(0);
  will-change: transform;
}

.vz-sticky {
  display: flex;
  align-items: center;
}

.vz-sticky__inner {
  position: relative;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 40px;
}

.vz-sec-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
  margin-bottom: 52px;
}

.vz-sec-head h2,
.vz-clients h2,
.vz-contacts h2 {
  margin: 0;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.05;
  text-transform: uppercase;
}

.vz-sec-head h2 {
  max-width: 640px;
  margin-top: 20px;
  font-size: clamp(32px, 4vw, 52px);
}

.vz-stack .vz-sec-head h2 {
  transform: translateX(-0.055em);
}

.vz-sec-meta {
  max-width: 360px;
  flex-shrink: 0;
}

.vz-sec-meta div {
  color: var(--ink);
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  letter-spacing: 0.06em;
}

.vz-sec-meta div span {
  font-size: 40px;
  font-weight: 500;
}

.vz-sec-meta div i {
  color: var(--muted2);
  font-size: 17px;
  font-style: normal;
}

.vz-sec-meta p {
  margin: 12px 0 0;
  font-size: 14px;
}

.vz-stack__timeline {
  position: relative;
  z-index: 1;
  max-width: min(760px, calc(100% - 430px));
}

.vz-stack__mobile-details {
  display: none;
}

.vz-stack__mobile-layout {
  display: contents;
}

.vz-stack__sphere-window {
  display: contents;
}

.vz-stack__sphere {
  --stack-sphere-size: clamp(300px, 28vw, 430px);
  position: absolute;
  top: var(--stack-sphere-top, clamp(285px, 24vw, 340px));
  left: var(--stack-sphere-left, calc(100% - 40px - var(--stack-sphere-size)));
  z-index: 0;
  width: var(--stack-sphere-size);
  aspect-ratio: 1;
  pointer-events: none;
}

.vz-stack__sphere canvas {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0.86;
  mask-image: radial-gradient(circle at 50% 50%, #000 56%, rgba(0, 0, 0, 0.72) 72%, transparent 88%);
}

.vz-stack__sphere-labels {
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
}

.vz-stack__sphere-label {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 92px;
  height: 34px;
  padding: 0 12px 0 10px;
  border: 1px solid color-mix(in srgb, var(--ink) 10%, var(--border));
  border-radius: 9px;
  background: var(--bg);
  box-shadow:
    0 8px 22px color-mix(in srgb, var(--ink) 8%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
  color: var(--ink);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  will-change: opacity, transform;
}

.vz-stack__sphere-label-icon {
  display: inline-flex;
  flex: 0 0 17px;
  width: 17px;
  height: 17px;
  color: var(--stack-tech-color);
}

.vz-stack__sphere-label-icon svg {
  display: block;
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.vz-stack__sphere-label--core {
  min-width: 84px;
  height: 32px;
  padding-inline: 9px 11px;
}

.vz-stack__sphere-label--bridge {
  min-width: 82px;
  height: 32px;
  padding-inline: 9px 11px;
  border-radius: 7px;
}

.vz-stack__sphere-label--mobile {
  min-width: 88px;
  height: 32px;
  padding-inline: 9px 11px;
  border-radius: 999px;
  white-space: nowrap;
}

.vz-stack__sphere-label-icon--text {
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: var(--stack-tech-color);
  color: #fff;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.vz-stack__sphere-label-icon--text img {
  display: block;
  width: 11px;
  height: 11px;
}

.vz-stack__sphere-label-text {
  transform: translateY(0.5px);
}

.vz-stack__mobile-core-belt-glyph {
  position: absolute;
  top: 0;
  left: 0;
  color: var(--ink);
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.04em;
  text-shadow:
    -1px -1px 2px var(--bg),
    1px -1px 2px var(--bg),
    -1px 1px 2px var(--bg),
    1px 1px 2px var(--bg);
  white-space: pre;
  will-change: opacity, transform;
}

.vz-stack__line {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 279.5px;
  width: 1px;
  background: var(--border);
}

.vz-stack__line span {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 0%;
  background: var(--ink);
}

.vz-stack-item {
  display: grid;
  grid-template-columns: 240px 80px 1fr;
  align-items: center;
  cursor: pointer;
  min-height: 116px;
  opacity: 1;
  outline: none;
  transform: translateY(0);
}

.vz-stack-item:focus-visible {
  outline: 1px solid var(--ink);
  outline-offset: 8px;
}

.vz-stack-item > div:first-child {
  padding-right: 24px;
  color: var(--idle);
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-align: right;
  transition: color 0.25s ease;
}

.vz-stack-item.is-active > div:first-child {
  color: var(--ink);
}

.vz-stack-item.is-past > div:first-child {
  color: var(--text2);
}

.vz-stack-item > div:nth-child(2) {
  position: relative;
  display: flex;
  justify-content: center;
}

.vz-stack-item [data-halo] {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--halo);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.vz-stack-item [data-dot] {
  position: relative;
  width: 15px;
  height: 15px;
  border: 2px solid var(--dotbd);
  border-radius: 50%;
  background: var(--bg);
  transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
}

.vz-stack-item.is-active [data-halo] {
  opacity: 1;
}

.vz-stack-item.is-active [data-dot] {
  border-color: var(--ink);
  background: var(--ink);
  transform: scale(1.12);
}

.vz-stack-item.is-past [data-dot] {
  border-color: var(--ink);
  background: var(--ink);
}

.vz-stack-item p {
  max-width: 46ch;
  margin: 0 0 16px;
  color: var(--text2);
  font-size: 16px;
  line-height: 1.55;
}

.vz-stack-item > div:last-child {
  transition:
    opacity 0.36s ease,
    transform 0.46s cubic-bezier(0.22, 1, 0.36, 1);
}

.vz-stack-item:not(.is-active) > div:last-child {
  opacity: 0.62;
  transform: translateX(-4px);
}

.vz-stack-item.is-active > div:last-child,
.vz-stack-item.is-past > div:last-child {
  opacity: 1;
  transform: translateX(0);
}

.vz-stack-item > div:last-child > div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.vz-stack-item span:not([data-dot], [data-halo]),
.vz-hero__stats span {
  padding: 7px 13px;
  border: 1px solid var(--chipbd);
  border-radius: 999px;
  color: var(--chipink);
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  letter-spacing: 0.03em;
  text-transform: none;
  white-space: nowrap;
}

.vz-about,
.vz-clients,
.vz-contacts {
  display: flex;
  align-items: center;
}

.vz-about {
  padding: 0 40px var(--section-space);
}

.vz-clients {
  padding: var(--section-space) 40px;
  border-top: 1px solid var(--border2);
  background: var(--bg);
}

@media (min-width: 901px) {
  .vz-clients {
    padding-bottom: calc(var(--section-space) + 64px);
  }
}

.vz-clients__grid {
  position: relative;
  grid-template-columns: 360px 1fr;
  gap: 80px;
  align-items: center;
  height: clamp(540px, 56vh, 620px);
  min-height: 0;
}

.vz-clients h2 {
  margin-top: 22px;
  font-size: clamp(30px, 3.6vw, 46px);
}

.vz-client-interactive {
  --active-client-index: 0;
  position: relative;
  z-index: 2;
  align-self: start;
  width: 100%;
  height: 500px;
  min-height: 0;
  justify-self: stretch;
}

.vz-client-capsules {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(12px, 1.2vw, 18px);
}

.vz-client-capsules button {
  display: flex;
  height: 64px;
  min-height: 0;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border: 1px solid var(--chipbd);
  border-radius: 999px;
  background: var(--bg);
  color: var(--ink);
  cursor: pointer;
  font: inherit;
  font-size: 16px;
  line-height: 1.2;
  transition:
    background 0.26s ease,
    border-color 0.26s ease,
    color 0.26s ease;
}

.vz-client-capsules button:hover,
.vz-client-capsules button:focus-visible {
  border-color: var(--ink);
}

.vz-client-capsules button.is-active {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--bg);
}

.vz-client-connector {
  position: relative;
  height: 48px;
  border-bottom: 1px solid var(--border);
}

.vz-client-connector span {
  position: absolute;
  bottom: -1px;
  left: calc((100% / 3) * var(--active-client-index) + (100% / 6));
  width: 1px;
  height: 100%;
  background: var(--ink);
  transform: translateX(-50%);
  transition: left 0.34s cubic-bezier(0.76, 0, 0.24, 1);
}

.vz-client-copy {
  position: relative;
  z-index: 2;
  height: 392px;
  min-height: 0;
  max-width: 440px;
  padding-top: 28px;
}

.vz-client-copy > span {
  display: block;
  color: var(--muted2);
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.vz-client-copy h3 {
  max-width: 13ch;
  height: 6.45em;
  margin: 14px 0 0;
  color: var(--ink);
  font-size: clamp(28px, 3vw, 42px);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.05;
  text-transform: uppercase;
}

.vz-client-copy p {
  max-width: 62ch;
  height: 10.4em;
  min-height: 0;
  margin: 18px 0 0;
  color: var(--text2);
  font-size: 17px;
  line-height: 1.65;
}

.vz-client-cube-field {
  --client-cube-size: clamp(390px, 36vw, 540px);
  position: absolute;
  top: var(--client-cube-top, 50%);
  left: var(--client-cube-left, calc(100% - var(--client-cube-size)));
  z-index: 1;
  width: var(--client-cube-size);
  aspect-ratio: 1.08;
  opacity: 0.96;
  pointer-events: none;
}

.vz-client-cube-field canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.vz-wrap {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
}

.vz-contacts {
  position: relative;
  overflow: hidden;
  padding: var(--section-space) 40px;
  border-top: 1px solid var(--border2);
}

.vz-contacts__art > div {
  top: 44%;
  left: 50%;
  width: min(64vmin, 660px);
  height: min(64vmin, 660px);
  transform: translate(-50%, -50%);
}

.vz-contacts__inner {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  text-align: center;
}

.vz-contacts .vz-section-label {
  display: inline-flex;
  margin-bottom: 30px;
}

.vz-contacts h2 {
  max-width: 18ch;
  margin: 0 auto;
  font-size: clamp(40px, 6vw, 80px);
  letter-spacing: -0.03em;
  line-height: 1.02;
}

.vz-contacts__buttons {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 48px;
}

.vz-footer {
  position: relative;
  border-top: 1px solid var(--border);
  background: var(--bg);
}

.vz-footer__top,
.vz-footer__cols,
.vz-footer__sign,
.vz-footer__legal {
  max-width: 1240px;
  margin: 0 auto;
}

.vz-footer__top {
  position: absolute;
  right: max(40px, calc((100% - 1240px) / 2 + 40px));
  bottom: calc(100% + 18px);
  z-index: 2;
  display: flex;
  justify-content: flex-end;
  width: max-content;
  max-width: calc(100% - 80px);
  margin: 0;
  padding: 0;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.vz-footer__top a {
  color: var(--muted);
  white-space: nowrap;
}

.vz-footer__cols {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  padding: 64px 40px 52px;
}

.vz-footer__cols.vz-footer__cols--without-base {
  grid-template-columns: repeat(3, 1fr);
}

.vz-footer__cols > div > span {
  display: block;
  margin-bottom: 14px;
  color: var(--muted2);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.vz-footer__cols strong {
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.vz-footer__cols p,
.vz-footer__cols nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  color: var(--text2);
  font-size: 15px;
  line-height: 1.6;
}

.vz-footer__cols nav a:first-child {
  color: var(--ink);
}

.vz-footer__sign {
  padding: 22px 40px 0;
  border-top: 1px solid var(--border);
}

.vz-footer__sign > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--muted2);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.vz-footer__sign strong {
  display: block;
  overflow: hidden;
  color: var(--ink);
  font-size: clamp(64px, 14vw, 210px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.06;
  text-transform: uppercase;
}

.vz-footer__sign strong span {
  display: inline-block;
}

.vz-footer__legal {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 40px 44px;
  color: var(--muted2);
  font-size: 11px;
  letter-spacing: 0.06em;
}

.vz-footer-game {
  position: relative;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 40px 68px;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
}

.vz-footer-game__hitbox {
  position: absolute;
  inset: 0;
  z-index: 4;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
}

.vz-footer-game__hitbox:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: -2px;
}

.vz-footer-game__hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  color: var(--muted2);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.vz-footer-game__track {
  position: relative;
  overflow: hidden;
  height: clamp(150px, 16vw, 188px);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background:
    linear-gradient(180deg, transparent 0%, rgba(154, 160, 168, 0.05) 100%);
}

.vz-footer-game__track::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.46;
  background-image:
    linear-gradient(to right, var(--border2) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border2) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: linear-gradient(90deg, transparent, #000 16%, #000 84%, transparent);
  pointer-events: none;
}

.vz-footer-game__ground {
  position: absolute;
  right: 0;
  bottom: 39px;
  left: 0;
  height: 1px;
  background: var(--hair);
}

.vz-footer-game__ground::before {
  content: "";
  position: absolute;
  right: 0;
  bottom: -6px;
  left: 0;
  height: 6px;
  background: repeating-linear-gradient(90deg, var(--border) 0 18px, transparent 18px 34px);
}

.vz-footer-game__dino {
  position: absolute;
  bottom: 40px;
  left: 72px;
  z-index: 2;
  width: 50px;
  height: 56px;
  transform-origin: 50% 100%;
  will-change: transform;
}

.vz-footer-game__dino::before {
  content: "";
  position: absolute;
  top: 0;
  right: 1px;
  width: 28px;
  height: 25px;
  border-radius: 3px 6px 2px 2px;
  background: var(--ink);
}

.vz-footer-game__dino::after,
.vz-footer-game__dino b {
  content: "";
  position: absolute;
  bottom: 0;
  width: 8px;
  height: 17px;
  background: var(--ink);
  transform-origin: top center;
}

.vz-footer-game__dino::after {
  left: 14px;
}

.vz-footer-game__dino b {
  left: 28px;
}

.vz-footer-game__dino span {
  position: absolute;
  right: 12px;
  bottom: 13px;
  width: 31px;
  height: 28px;
  border-radius: 6px 5px 2px 2px;
  background: var(--ink);
}

.vz-footer-game__dino span::before {
  content: "";
  position: absolute;
  top: 10px;
  left: -16px;
  width: 20px;
  height: 10px;
  background: var(--ink);
  clip-path: polygon(0 10%, 100% 35%, 100% 100%, 0 72%);
}

.vz-footer-game__dino i {
  position: absolute;
  top: 7px;
  right: 8px;
  z-index: 1;
  width: 4px;
  height: 4px;
  background: var(--bg);
}

.vz-footer-game__letter {
  position: absolute;
  bottom: 35px;
  left: 0;
  z-index: 1;
  min-width: 58px;
  color: var(--ink);
  font-size: clamp(54px, 5.2vw, 82px);
  font-weight: 700;
  letter-spacing: -0.08em;
  line-height: 0.86;
  text-align: center;
  text-transform: uppercase;
  will-change: transform;
}

.vz-footer-game.is-paused .vz-footer-game__track {
  opacity: 0.74;
}

.vz-footer-game.is-crashed .vz-footer-game__track {
  border-color: var(--ink);
}

.vz-footer-game.is-running .vz-footer-game__dino::after {
  animation: vz-dino-leg-a 0.2s steps(2, end) infinite;
}

.vz-footer-game.is-running .vz-footer-game__dino b {
  animation: vz-dino-leg-b 0.2s steps(2, end) infinite;
}

@keyframes vz-dino-leg-a {
  0%,
49% { transform: translateY(0); }
  50%,
100% { transform: translateY(5px); }
}

@keyframes vz-dino-leg-b {
  0%,
49% { transform: translateY(5px); }
  50%,
100% { transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .vz-orbit svg,
.vz-marquee > div {
    animation: none !important;
  }

  .vz-client-copy > *,
.vz-client-capsules button,
.vz-client-connector span,
.vz-hero__negative,
.vz-hero__negative-plane,
.vz-section-liquid,
.vz-footer-game__dino::after,
.vz-footer-game__dino b {
    transition: none !important;
    animation: none !important;
  }
}

@media (max-width: 900px) {
  .vz-min {
    --section-space: 56px;
  }

  .vz-preloader {
    padding: 24px;
  }

  .vz-nav {
    padding: 0 20px;
  }

  .vz-nav__links,
.vz-nav__cta {
    display: none;
  }

  .vz-menu-button {
    display: flex;
  }

  .vz-hero {
    --hero-art-bottom: 118px;
    padding: 112px 20px 24px;
  }

  .vz-hero > .vz-marquee {
    margin-top: 16px;
  }

  .vz-hero h1 {
    font-size: clamp(30px, 8.4vw, 46px);
  }

  .vz-hero__grid,
.vz-about__grid,
.vz-clients__grid {
    grid-template-columns: 1fr;
  }

  .vz-hero__grid {
    gap: 30px;
  }

  .vz-hero__actions {
    align-items: flex-start;
    justify-self: start;
  }

  .vz-hero__stats {
    grid-template-columns: repeat(2, max-content);
    gap: 10px 12px;
    margin-top: 44px;
  }

  .vz-about {
    padding: 0 20px var(--section-space);
  }

  .vz-about__liquid {
    display: none;
  }

  .vz-about__grid {
    gap: 22px;
  }

  .vz-about__brand {
    min-height: 0;
  }

  .vz-about__mark {
    min-height: 158px;
    margin-top: 22px;
  }

  .vz-about__mark span {
    font-size: clamp(52px, 18vw, 82px);
  }

  .vz-about__roles {
    margin-top: 22px;
  }

  .vz-about__note {
    margin-top: 20px;
    font-size: 15px;
  }

  .vz-about__copy {
    justify-self: stretch;
    max-width: none;
  }

  .vz-about__lead {
    max-width: 14ch;
    font-size: clamp(30px, 10vw, 42px);
  }

  .vz-about__principles {
    grid-template-columns: 1fr;
    margin-top: 28px;
  }

  .vz-about__principles article {
    grid-template-columns: 34px 1fr;
    gap: 12px;
    padding: 18px 0;
  }

  .vz-about__principles article + article {
    padding-left: 0;
    border-top: 1px solid var(--border);
    border-left: 0;
  }

  .vz-about__metrics {
    grid-template-columns: 1fr;
    margin-top: 20px;
  }

  .vz-about__metrics div {
    min-height: 0;
    padding: 18px;
  }

  .vz-about__metrics div + div {
    border-top: 1px solid var(--border);
    border-left: 0;
  }

  .vz-about__metrics span {
    max-width: none;
    margin-top: 10px;
  }

  .vz-sticky {
    align-items: flex-start;
  }

  .vz-sticky__inner {
    padding: 0 20px;
  }

  .vz-sec-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 26px;
  }

  .vz-sec-meta {
    display: none;
  }

  .vz-stack h2 {
    max-width: none;
    font-size: 26px;
    line-height: 1.05;
  }

  .vz-stack {
    padding: var(--section-space) 0;
  }

  .vz-stack__sphere-window {
    position: relative;
    display: block;
    overflow: hidden;
    width: calc(100% + 40px);
    height: clamp(150px, 54vw, 220px);
    margin: 18px -20px calc(var(--section-space) * -1);
  }

  .vz-stack__sphere {
    --stack-sphere-size: min(108vw, 430px);
    position: absolute;
    top: 0;
    left: 50%;
    display: block;
    width: var(--stack-sphere-size);
    transform: translateX(-50%);
  }

  .vz-stack__sphere[data-layer="mobile"] {
    --stack-sphere-size: min(92vw, 390px);
    top: calc(clamp(-30px, -7vw, -20px) - min(7vw, 30px));
  }

  .vz-stack__sphere[data-layer="mobile"] canvas {
    -webkit-mask-image: none;
    mask-image: none;
  }

  .vz-stack__sphere-label--mobile {
    gap: 6px;
    min-width: 76px;
    height: 29px;
    padding-inline: 7px 9px;
    font-size: 11px;
  }

  .vz-stack__sphere-label--mobile .vz-stack__sphere-label-icon {
    flex-basis: 15px;
    width: 15px;
    height: 15px;
  }

  .vz-stack__timeline {
    grid-column: 1;
    display: grid;
    row-gap: 12px;
    max-width: none;
  }

  .vz-stack__mobile-layout {
    position: relative;
    display: grid;
    grid-template-columns: 132px minmax(0, 1fr);
    gap: 16px;
    min-height: 218px;
  }

  .vz-stack__line {
    left: 16px;
  }

  .vz-stack-item {
    grid-template-columns: 33px 1fr;
    grid-template-rows: auto auto;
    align-items: start;
    min-height: 0;
    column-gap: 12px;
    row-gap: 4px;
    padding: 4px 0;
  }

  .vz-stack-item > div:first-child {
    grid-column: 2;
    grid-row: 1;
    padding-right: 0;
    font-size: 18px;
    text-align: left;
  }

  .vz-stack-item:not(.is-active) > div:first-child {
    color: var(--muted2);
  }

  .vz-stack-item > div:nth-child(2) {
    grid-column: 1;
    grid-row: 1;
  }

  .vz-stack-item:not(.is-active) [data-dot] {
    border-color: var(--dotbd);
    background: var(--bg);
    transform: none;
  }

  .vz-stack-item > div:nth-child(3) {
    display: none;
  }

  .vz-stack__mobile-details {
    position: absolute;
    top: 0;
    right: 0;
    left: 148px;
    display: block;
    min-height: 112px;
    margin: 0;
  }

  .vz-stack__mobile-details p {
    max-width: none;
    margin: 0 0 8px;
    color: var(--text2);
    font-size: 13px;
    line-height: 1.4;
  }

  .vz-stack__mobile-details > div {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .vz-stack__mobile-details span {
    padding: 5px 10px;
    border: 1px solid var(--chipbd);
    border-radius: 999px;
    color: var(--chipink);
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    letter-spacing: 0.03em;
  }

  [data-stack-hint] {
    display: none;
  }

  .vz-stack-item p {
    max-width: none;
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 1.4;
  }

  .vz-stack-item span:not([data-dot], [data-halo]) {
    padding: 5px 10px;
    font-size: 11px;
  }

  .vz-stack-item > div:last-child > div {
    gap: 6px;
  }

  .vz-clients {
    padding: var(--section-space) 20px;
  }

  .vz-clients__grid {
    gap: 26px;
    height: auto;
    min-height: 0;
  }

  .vz-client-interactive {
    width: 100%;
    height: auto;
    min-height: 0;
  }

  .vz-client-capsules {
    gap: 8px;
  }

  .vz-client-capsules button {
    height: 58px;
    min-height: 0;
    padding: 10px 8px;
    font-size: 13px;
  }

  .vz-client-connector {
    height: 36px;
  }

  .vz-client-connector span {
    height: 100%;
  }

  .vz-client-copy {
    height: auto;
    min-height: 0;
    padding-top: 22px;
  }

  .vz-client-cube-field {
    top: 322px;
    left: 66.6667%;
    right: auto;
    bottom: auto;
    width: 210px;
    opacity: 0.72;
    transform: translateX(-50%);
  }

  .vz-client-copy h3 {
    height: 4.7em;
    max-width: none;
    font-size: 25px;
  }

  .vz-client-copy p {
    height: auto;
    min-height: 0;
    margin-top: 122px;
    font-size: 15px;
    line-height: 1.55;
  }

  .vz-contacts {
    padding: var(--section-space) 20px;
  }

  .vz-contacts h2 {
    font-size: clamp(26px, 8vw, 40px);
  }

  .vz-contacts__buttons {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .vz-contacts__buttons a {
    justify-content: center;
    text-align: center;
  }

  .vz-footer__top {
    right: 20px;
    bottom: calc(100% + 14px);
    flex-direction: row;
    max-width: calc(100% - 40px);
    padding: 0;
  }

  .vz-footer__cols {
    grid-template-columns: 1fr 1fr;
    gap: 26px 20px;
    padding: 44px 20px 36px;
  }

  .vz-footer__cols.vz-footer__cols--without-base {
    grid-template-columns: 1fr 1fr;
  }

  .vz-footer__sign {
    padding: 20px 20px 0;
  }

  .vz-footer__legal {
    flex-direction: column;
    gap: 6px;
    padding: 16px 20px 34px;
  }

  .vz-footer-game {
    padding: 0 20px 44px;
  }

  .vz-footer-game__hud {
    gap: 10px;
    font-size: 10px;
    letter-spacing: 0.11em;
  }

  .vz-footer-game__track {
    height: 138px;
  }

  .vz-footer-game__letter {
    bottom: 36px;
    min-width: 48px;
    font-size: 58px;
  }
}

@media (max-width: 900px) and (max-height: 700px) {
  .vz-stack-item > div:nth-child(3) > div {
    display: none;
  }

  .vz-stack-item p {
    margin-bottom: 0;
  }
}

@media (max-width: 520px) {
  .vz-hero__meta span {
    font-size: 11px;
  }

  .vz-hero h1 {
    font-size: clamp(26px, 8vw, 40px);
  }

  .vz-footer__cols {
    gap: 22px 16px;
  }
}

/* Scoped prod transplants: Services + Development Anatomy only. */


.vz-preloader__top,
.vz-preloader__meta,
.vz-section-label,
.vz-hero__meta,
.vz-hero__kicker,
.vz-hero__stats,
.vz-scroll-hint,
.vz-footer__top,
.vz-footer__cols > div > span,
.vz-footer__sign > div,
.vz-footer__legal {
  font-family: "JetBrains Mono", monospace;
}

.vz-hero h1 > span,
.vz-clients h2 > span,
.vz-contacts h2 > span {
  display: block;
  overflow: hidden;
  padding-bottom: 0.08em;
}

.vz-hero h1 span span,
.vz-clients h2 span span,
.vz-contacts h2 span span {
  display: block;
}

.vz-about__cols p,
.vz-sec-meta p {
  color: var(--text2);
  line-height: 1.65;
}

.vz-stack {
  position: relative;
  border-top: 1px solid var(--border2);
}

.vz-sec-head h2,
.vz-clients h2,
.vz-contacts h2 {
  margin: 0;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.05;
  text-transform: uppercase;
}

.vz-stack-item > div:last-child > div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.vz-stack-item span:not([data-dot], [data-halo]) {
  padding: 7px 13px;
  border: 1px solid var(--chipbd);
  border-radius: 999px;
  color: var(--chipink);
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  letter-spacing: 0.03em;
}

@media (max-width: 900px) {

  .vz-hero__grid,
.vz-about__grid,
.vz-clients__grid {
    grid-template-columns: 1fr;
  }
}

/* Final alignment guard: later transplant rules must not override contact centering. */
.vz-contacts__inner {
  display: flex;
  width: 100%;
  max-width: 1240px;
  margin-inline: auto;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.vz-contacts__inner > h2 {
  width: min(100%, 18ch);
  margin-inline: auto;
}

.vz-contacts__buttons {
  width: fit-content;
  margin-inline: auto;
}

@media (max-width: 900px) {
  .vz-contacts__buttons {
    width: 100%;
    max-width: 520px;
  }
}

</style>
