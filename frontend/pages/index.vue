<template>
  <div ref="rootRef" class="vz-min vz-motion-ready" :data-theme="theme">
    <CaseScrollThumb v-if="!showPreloader" :theme="theme" />
    <div v-if="showPreloader" ref="preloaderRef" data-preloader class="vz-preloader">
      <LandingLoaderPattern :progress="introProgress" />
      <div class="vz-preloader__bottom">
        <div class="vz-preloader__count" :style="{ visibility: preloaderFontReady ? 'visible' : 'hidden' }"><span>{{ Math.floor(introProgress).toString().padStart(2, "0") }}</span><span>%</span></div>
      </div>
    </div>

    <div class="vz-motion-atmosphere" aria-hidden="true">
      <span class="vz-motion-atmosphere__orb vz-motion-atmosphere__orb--a"></span>
      <span class="vz-motion-atmosphere__orb vz-motion-atmosphere__orb--b"></span>
      <span class="vz-motion-atmosphere__orb vz-motion-atmosphere__orb--c"></span>
    </div>

    <div
      v-show="!showPreloader"
      class="vz-nav-hover-zone"
      aria-hidden="true"
      @pointerenter="handleHeaderZonePointerEnter"
      @pointerleave="handleHeaderZonePointerLeave"
    ></div>
    <nav
      class="vz-nav"
      :data-nav-visible="isHeaderShown ? 'true' : 'false'"
      :aria-hidden="isHeaderShown ? undefined : 'true'"
      :inert="isHeaderShown ? undefined : true"
      :aria-label="copy.nav.aria"
      data-od-id="global-header"
      @pointerenter="handleHeaderPointerEnter"
      @pointerleave="handleHeaderPointerLeave"
      @focusin="handleHeaderFocusIn"
      @focusout="handleHeaderFocusOut"
    >
      <SiteBrand class="vz-logo" :theme="theme" to="/#hero" />
      <div class="vz-nav__links" data-nav-links>
        <a v-for="item in navItems" :key="item.href" :href="item.href">{{ item.label }}</a>
      </div>
      <div class="vz-nav__actions">
        <button class="vz-icon-button" type="button" :aria-label="copy.nav.themeAria" @click="toggleTheme">
          <SiteThemeIcon :theme="theme" />
        </button>
        <a class="vz-nav__cta" href="#contacts" data-nav-cta>{{ copy.nav.cta }}</a>
      </div>
    </nav>

    <MobileSiteMenu :visible="!showPreloader" id="landing-mobile-menu" :theme="theme" :locale="currentLocale" @toggle-theme="toggleTheme" />

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
        <div class="vz-section-liquid__target vz-section-liquid__target--gallery" data-gallery-liquid-target hidden></div>
        <div class="vz-section-label vz-section-liquid__target vz-section-liquid__target--gallery" data-section-label-liquid-target hidden></div>
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

    <LandingServices
      :services="displayServices"
      :copy="copy.services"
      @active-change="handleServiceActiveChange"
    />

    <LandingCases
      :projects="projects"
      :fallback="caseFallbacks"
      :copy="casesCopy"
    />

    <LandingAbout
      :copy="copy.about"
      :flow-phase="aboutFlowPhase"
      :flow-cycle-key="aboutFlowCycleKey"
      :resume-key="aboutFlowResumeKey"
      :resume-elapsed-ms="aboutFlowResumeElapsedMs"
      :target-step-index="aboutFlowTargetStepIndex"
      :navigation-key="aboutFlowNavigationKey"
      :active-step-index="aboutFlowStepIndex"
      :display-step-index="aboutFlowDisplayStepIndex"
      :can-continue-animation="canContinueAboutFlow"
      :snake-segments="aboutFlowSnakeSegments"
      :active-business="activeAboutBusiness"
      :active-product="activeAboutProduct"
      @replay="replayAboutFlow"
      @continue-animation="continueAboutFlow"
      @select-step="selectAboutFlowStep"
      @stage-reached="setAboutFlowReachedStep"
      @flow-ready="setAboutFlowHost"
      @scene-ready="markAboutSceneReady"
    />

    <LandingStack
      :groups="displayStackGroups"
      :copy="copy.stack"
      @active-change="handleStackActiveChange"
      @scene-ready="markStackSceneReady"
    />

    <LandingClients
      v-model:active-index="activeClientSegment"
      :copy="copy.clients"
      :segments="clientSegments"
      @cube-ready="setClientCubeHost"
      @layout-change="updateClientCubePosition"
    />

    <LandingContacts :copy="copy.contacts" :contact-email="contactEmail" />

    <LandingFooter
      :copy="copy.footer"
      :contact-email="contactEmail"
      :nav-items="footerNavItems"
    />
  </div>
</template>

<script setup lang="ts">
import MobileSiteMenu from "~/components/ui/MobileSiteMenu.vue";
import SiteBrand from "~/components/ui/SiteBrand.vue";
import SiteThemeIcon from "~/components/ui/SiteThemeIcon.vue";
import LandingAbout from "~/components/landing/LandingAbout.vue";
import LandingCases from "~/components/landing/LandingCases.vue";
import LandingLoaderPattern from "~/components/landing/LandingLoaderPattern.vue";
import CaseScrollThumb from "~/components/cases/CaseScrollThumb.vue";
import type { IAdvantages } from "~/utils/interfaces/IAdvantages";
import type { IProjects } from "~/utils/interfaces/IProjects";
import type { IServices } from "~/utils/interfaces/IServices";
import type { ISettings } from "~/utils/interfaces/ISettings";
import type { ITechStack } from "~/utils/interfaces/ITechStack";
import enMessagesRaw from "~/locales/en.json?raw";
import ruMessagesRaw from "~/locales/ru.json?raw";
import { getCaseFallbacks } from "~/utils/caseFallbacks";
import {
  getLandingPresentationScale,
  syncThreeRendererPixelRatio,
} from "~/utils/threeRenderQuality";

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
    teamLeadLines?: [string, string, string];
    metrics: [string, string, string];
    flowAria: string;
    replay: string;
    continueAnimation: string;
    zones: [string, string, string];
    brief: string;
    support: string;
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
    navAria: string;
    previousAria: string;
    nextAria: string;
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
    titleLines?: string[];
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

type InitialLoadTask = {
  label: string;
  promise: Promise<unknown>;
  weight: number;
};

function createInitialSceneGate() {
  let settled = false;
  let complete!: (rendered: boolean) => void;
  const promise = new Promise<boolean>((resolve) => {
    complete = (rendered: boolean) => {
      if (settled) return;
      settled = true;
      resolve(rendered);
    };
  });

  return { complete, promise };
}

const rootRef = ref<HTMLElement | null>(null);
const heroRef = ref<HTMLElement | null>(null);
const heroNegativeRef = ref<HTMLElement | null>(null);
const sectionLiquidRef = ref<HTMLElement | null>(null);
const aboutFlowRef = ref<HTMLElement | null>(null);
const clientCubeRef = ref<HTMLElement | null>(null);
const preloaderRef = ref<HTMLElement | null>(null);
const showPreloader = ref(true);
const preloaderFontReady = ref(false);
const introProgress = ref(0);
const aboutSceneGate = createInitialSceneGate();
const stackSceneGate = createInitialSceneGate();
const theme = ref<ThemeMode>("light");
const isHeaderVisible = ref(false);
const isHeaderBlockedByStack = ref(false);
const isHeaderShown = computed(() => !showPreloader.value && (isHeaderVisible.value && !isHeaderBlockedByStack.value));
const activeStackIndex = ref(0);
const activeClientSegment = ref(0);
const enableMotionLayer = true;
const enableSectionLiquid = true;
const activeServiceIndex = ref(0);
let heroFxRaf = 0;
let heroFxLastFrame = 0;
let preloaderFrameId = 0;
let preloaderExitTimer = 0;
let preloaderRunToken = 0;
let sectionLiquidRaf = 0;
let sectionLiquidResizeTimer = 0;
let sectionLiquidLayoutRaf = 0;
let sectionLiquidLayoutObserver: ResizeObserver | null = null;
let sectionLiquidForceCloneOnLayoutSync = false;
let sectionLiquidLastScrollY = 0;
let sectionLiquidScrollDirection = 0;
let sectionLiquidViewportWidth = 0;
let sectionLiquidViewportScale = 1;
let sectionLiquidStackLock: {
  x: number;
  y: number;
  radius: number;
  headingAnimating: boolean;
  stickyBounds: { top: number; left: number; width: number; height: number } | null;
} | null = null;
let negativeStackSyncQueued = false;
let aboutFlowResultTimer: ReturnType<typeof setTimeout> | null = null;
let aboutFlowStepTimers: Array<ReturnType<typeof setTimeout>> = [];
let aboutFlowObserver: IntersectionObserver | null = null;
let clientCubeCleanup: (() => void) | null = null;
let clientCubeSetupToken = 0;
let updateClientCubeStage: ((index: number) => void) | null = null;
let clientLayoutResizeObserver: ResizeObserver | null = null;
let clientLayoutMotionCleanup: (() => void) | null = null;
let clientLayoutMotionRaf = 0;
let isHeaderZoneHovered = false;
let isHeaderHovered = false;
let isHeaderFocused = false;
let headerIdleTimer: ReturnType<typeof setTimeout> | null = null;
let headerLastScrollY = 0;
let headerWasDesktop: boolean | null = null;

function markAboutSceneReady(rendered: boolean) {
  aboutSceneGate.complete(rendered);
}

function markStackSceneReady(rendered: boolean) {
  stackSceneGate.complete(rendered);
}

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
  mobileDirectionX: -1,
  mobileDirectionY: 1,
  speed: 0,
  targetX: 0.76,
  targetY: 0.43,
  velocityX: 0.00048,
  velocityY: 0.00018,
};

const mobileHeroFxHorizontalTraversalMs = 24000;
const mobileHeroFxVerticalTraversalMs = 18000;

const sectionLiquidState = {
  initialized: false,
  lastTargetKey: "",
  targetRadius: 104,
  targetX: 0,
  targetY: 0,
};

const services = ref<IServices[]>([]);
const projects = ref<IProjects[]>([]);
const advantages = ref<IAdvantages[]>([]);
const techStack = ref<ITechStack[]>([]);
const settings = ref<ISettings | null>(null);

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
  intro: "Показываем задачу, ход решения и продукт в реальном сценарии.",
  tabAria: "Выберите кейс",
  open: "Открыть кейс",
  proof: "Сценарий",
  empty: "Опубликованные кейсы скоро появятся здесь.",
} : {
  label: "Selected cases",
  title: "Project gallery",
  intro: "The task, the decisions and the product working in a real scenario.",
  tabAria: "Select a case",
  open: "Open case",
  proof: "Journey",
  empty: "Published case studies will appear here soon.",
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
const aboutSupportStepIndex = 6;
const aboutFlowStepDurationMs = 4500;
const aboutFlowSnakeSegments = [
  { key: "design", path: "M 25 50 C 29 50 31 69 35 69", begin: "3.95s" },
  { key: "ux", path: "M 35 69 C 39 69 41 30 45 30", begin: "8.45s" },
  { key: "development", path: "M 45 30 C 50 30 50 65 55 65", begin: "12.95s" },
  { key: "testing", path: "M 55 65 C 60 65 60 33 65 33", begin: "17.45s" },
  { key: "launch", path: "M 65 33 C 70 33 70 50 75 50", begin: "21.95s" },
  { key: "product", path: "M 75 50 L 87.5 50", begin: "25.8s" },
];
const aboutFlowStepDelaysMs = Array.from(
  { length: aboutSupportStepIndex - 1 },
  (_, index) => (index + 1) * aboutFlowStepDurationMs,
);
const aboutFlowResultDelayMs = aboutSupportStepIndex * aboutFlowStepDurationMs;
const aboutFlowBusinessIndex = ref(0);
const aboutFlowStepIndex = ref(0);
const aboutFlowDisplayStepIndex = ref(0);
const activeAboutProduct = ref<AboutFlowItem | null>(null);
const aboutFlowPhase = ref<"signal" | "result">("result");
const aboutFlowCycleKey = ref(0);
const aboutFlowResumeKey = ref(0);
const aboutFlowResumeElapsedMs = ref(0);
const aboutFlowTargetStepIndex = ref<number | null>(null);
const aboutFlowNavigationKey = ref(0);
const activeAboutBusiness = computed<AboutFlowItem>(() => (
  aboutBusinessItems.value[aboutFlowBusinessIndex.value] || aboutBusinessItems.value[0]!
));
const canContinueAboutFlow = computed(() => (
  aboutFlowTargetStepIndex.value !== null
  && aboutFlowTargetStepIndex.value < aboutSupportStepIndex
));

const clientSegments = computed(() => copy.value.clients.segments);
const navItems = computed(() => {
  const items = copy.value.nav.items.filter((item) => item.href !== "#stages");
  const contactsIndex = items.findIndex((item) => item.href === "#contacts");
  items.splice(contactsIndex < 0 ? items.length : contactsIndex, 0, {
    href: "#cases",
    label: currentLocale.value === "ru" ? "Кейсы" : "Cases",
  });
  const order = ["#hero", "#services", "#cases", "#about", "#stack", "#clients", "#contacts"];
  return items.sort((a, b) => order.indexOf(a.href) - order.indexOf(b.href));
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
  aboutFlowTargetStepIndex.value = null;
  if (advanceBusiness) {
    aboutFlowBusinessIndex.value = (aboutFlowBusinessIndex.value + 1) % aboutBusinessItems.value.length;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    aboutFlowStepIndex.value = aboutSupportStepIndex;
    aboutFlowDisplayStepIndex.value = aboutSupportStepIndex;
    activeAboutProduct.value = pickNextAboutProduct();
    aboutFlowPhase.value = "result";
    return;
  }

  activeAboutProduct.value = null;
  aboutFlowStepIndex.value = 0;
  aboutFlowDisplayStepIndex.value = 0;
  aboutFlowPhase.value = "signal";
  aboutFlowCycleKey.value += 1;
  aboutFlowStepTimers = aboutFlowStepDelaysMs.map((delay, index) => setTimeout(() => {
    aboutFlowStepIndex.value = index + 1;
    aboutFlowDisplayStepIndex.value = index + 1;
  }, delay));
  aboutFlowResultTimer = setTimeout(() => {
    aboutFlowStepIndex.value = aboutSupportStepIndex;
    aboutFlowDisplayStepIndex.value = aboutSupportStepIndex;
    activeAboutProduct.value = pickNextAboutProduct();
    aboutFlowPhase.value = "result";
    aboutFlowResultTimer = null;
  }, aboutFlowResultDelayMs);
}

function replayAboutFlow() {
  runAboutFlowCycle(true);
}

function continueAboutFlow() {
  const currentStep = Math.max(
    0,
    Math.min(aboutSupportStepIndex - 1, aboutFlowTargetStepIndex.value ?? aboutFlowStepIndex.value),
  );
  const resumeElapsedMs = Number.parseFloat(aboutFlowSnakeSegments[currentStep]?.begin || "0") * 1000;

  clearAboutFlowResultTimer();
  clearAboutFlowStepTimers();
  aboutFlowTargetStepIndex.value = null;
  activeAboutProduct.value = null;
  aboutFlowPhase.value = "signal";
  aboutFlowResumeElapsedMs.value = resumeElapsedMs;
  aboutFlowResumeKey.value += 1;

  aboutFlowStepTimers = aboutFlowStepDelaysMs.flatMap((delay, index) => {
    const nextStep = index + 1;
    if (nextStep <= currentStep) return [];
    return [setTimeout(() => {
      aboutFlowStepIndex.value = nextStep;
      aboutFlowDisplayStepIndex.value = nextStep;
    }, Math.max(0, delay - resumeElapsedMs))];
  });

  aboutFlowResultTimer = setTimeout(() => {
    aboutFlowStepIndex.value = aboutSupportStepIndex;
    aboutFlowDisplayStepIndex.value = aboutSupportStepIndex;
    activeAboutProduct.value = pickNextAboutProduct();
    aboutFlowPhase.value = "result";
    aboutFlowResultTimer = null;
  }, Math.max(0, aboutFlowResultDelayMs - resumeElapsedMs));
}

function selectAboutFlowStep(index: number) {
  const target = Math.max(0, Math.min(aboutSupportStepIndex, index));
  const isSupportStep = target === aboutSupportStepIndex;
  aboutFlowObserver?.disconnect();
  aboutFlowObserver = null;
  clearAboutFlowResultTimer();
  clearAboutFlowStepTimers();
  activeAboutProduct.value = isSupportStep
    ? activeAboutProduct.value || pickNextAboutProduct()
    : null;
  aboutFlowStepIndex.value = target;
  aboutFlowDisplayStepIndex.value = target;
  aboutFlowTargetStepIndex.value = target;
  aboutFlowPhase.value = isSupportStep ? "result" : "signal";
  aboutFlowNavigationKey.value += 1;
}

function setAboutFlowReachedStep(index: number) {
  aboutFlowStepIndex.value = Math.max(0, Math.min(aboutSupportStepIndex, index));
}

function setupAboutFlowObserver() {
  if (!aboutFlowRef.value) return;
  aboutFlowObserver?.disconnect();

  if (!("IntersectionObserver" in window)) {
    runAboutFlowCycle(false);
    return;
  }

  aboutFlowObserver = new IntersectionObserver((entries) => {
    if (aboutFlowTargetStepIndex.value !== null) {
      aboutFlowObserver?.disconnect();
      aboutFlowObserver = null;
      return;
    }
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
  const preferredOrder = new Map(fallback.map((item, index) => [normalizeTechName(item), index]));
  const items = [...primary, ...fallback].filter((item) => {
    const key = normalizeTechName(item);
    if (replacedBackendTechNames.has(key)) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return items
    .map((item, index) => ({ item, index, order: preferredOrder.get(normalizeTechName(item)) ?? Number.MAX_SAFE_INTEGER }))
    .sort((a, b) => a.order - b.order || a.index - b.index)
    .slice(0, 5)
    .map(({ item }) => item);
}

function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  localStorage.setItem("vz_theme", theme.value);
  requestAnimationFrame(() => syncNegativeWorlds(true));
}

function clearHeaderIdleTimer() {
  if (!headerIdleTimer) return;
  window.clearTimeout(headerIdleTimer);
  headerIdleTimer = null;
}

function isDesktopHeaderViewport() {
  return window.matchMedia("(min-width: 901px)").matches;
}

function updateHeaderStackCollision() {
  if (!isDesktopHeaderViewport()) {
    isHeaderBlockedByStack.value = false;
    return false;
  }
  const stack = rootRef.value?.querySelector<HTMLElement>("[data-stack-section]");
  const header = rootRef.value?.querySelector<HTMLElement>(".vz-nav");
  if (!stack || !header) {
    isHeaderBlockedByStack.value = false;
    return false;
  }

  // Use the resting position: the hidden header is translated above the viewport.
  const headerTop = header.offsetTop;
  const headerBottom = headerTop + header.offsetHeight;
  const rect = stack.getBoundingClientRect();
  isHeaderBlockedByStack.value = rect.top < headerBottom && rect.bottom > headerTop;
  return isHeaderBlockedByStack.value;
}

function revealHeader() {
  if (updateHeaderStackCollision()) {
    clearHeaderIdleTimer();
    isHeaderVisible.value = false;
    return;
  }

  clearHeaderIdleTimer();
  isHeaderVisible.value = true;
}

function queueHeaderHide(delay = 820) {
  clearHeaderIdleTimer();
  if (!isDesktopHeaderViewport() && Math.max(0, window.scrollY) <= 12) {
    isHeaderVisible.value = true;
    return;
  }
  headerIdleTimer = window.setTimeout(() => {
    headerIdleTimer = null;
    if (isHeaderZoneHovered || isHeaderHovered || isHeaderFocused) return;
    isHeaderVisible.value = false;
  }, delay);
}

function handleHeaderScroll() {
  const nextScrollY = Math.max(0, window.scrollY);

  if (showPreloader.value) {
    headerLastScrollY = nextScrollY;
    return;
  }

  if (isDesktopHeaderViewport()) {
    headerLastScrollY = nextScrollY;
    revealHeader();
    queueHeaderHide();
    return;
  }

  if (nextScrollY <= 12) {
    headerLastScrollY = nextScrollY;
    revealHeader();
    return;
  }

  headerLastScrollY = nextScrollY;
  revealHeader();
  queueHeaderHide();
}

function handleHeaderZonePointerEnter(event: PointerEvent) {
  if (event.pointerType === "touch") return;
  isHeaderZoneHovered = true;
  revealHeader();
}

function handleHeaderZonePointerLeave(event: PointerEvent) {
  if (event.pointerType === "touch") return;
  isHeaderZoneHovered = false;
  queueHeaderHide(220);
}

function handleHeaderPointerEnter(event: PointerEvent) {
  if (event.pointerType === "touch") return;
  isHeaderHovered = true;
  revealHeader();
}

function handleHeaderPointerLeave(event: PointerEvent) {
  if (event.pointerType === "touch") return;
  isHeaderHovered = false;
  queueHeaderHide(220);
}

function handleHeaderFocusIn() {
  isHeaderFocused = true;
  revealHeader();
}

function handleHeaderFocusOut(event: FocusEvent) {
  const nav = event.currentTarget;
  const next = event.relatedTarget;
  if (nav instanceof HTMLElement && next instanceof Node && nav.contains(next)) return;
  isHeaderFocused = false;
  queueHeaderHide(220);
}

function handleHeaderResize() {
  updateHeaderStackCollision();
  const isDesktop = isDesktopHeaderViewport();
  headerLastScrollY = Math.max(0, window.scrollY);
  if (headerWasDesktop === isDesktop) return;

  headerWasDesktop = isDesktop;
  clearHeaderIdleTimer();
  isHeaderVisible.value = !isDesktop;
}

let publicDataRequestId = 0;

async function waitForInitialFonts() {
  const fonts = document.fonts;
  if (!fonts) return false;

  const results = await Promise.allSettled([
    fonts.load('400 1em "Onest"', "VEZHA Digital"),
    fonts.load('600 1em "Onest"', "Проекты, которые работают"),
    fonts.load('500 1em "JetBrains Mono"', "0123456789% / Loading").then((faces) => {
      preloaderFontReady.value = faces.length > 0 && faces.every((face) => face.status === "loaded");
      return faces;
    }),
  ]);
  await fonts.ready;
  return results.every((result) => result.status === "fulfilled");
}

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

async function setupClientCubeScene(): Promise<boolean> {
  const host = clientCubeRef.value;
  if (!host) return false;
  if (clientCubeCleanup) return true;
  const setupToken = ++clientCubeSetupToken;

  try {
    const THREE = await import("three");
    const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
    if (
      setupToken !== clientCubeSetupToken
      || clientCubeRef.value !== host
      || !host.isConnected
    ) return false;
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    syncThreeRendererPixelRatio(renderer, host);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

    const ambient = new THREE.AmbientLight(0xffffff, 0.34);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(3.8, 4.4, 5.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -3.6;
    keyLight.shadow.camera.right = 3.6;
    keyLight.shadow.camera.top = 3.6;
    keyLight.shadow.camera.bottom = -3.6;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 18;
    keyLight.shadow.bias = -0.00045;
    keyLight.shadow.normalBias = 0.024;
    keyLight.shadow.radius = 4;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xe9f7ff, 2.05);
    rimLight.position.set(-4.4, 2.4, -3.2);
    scene.add(rimLight);
    const fillLight = new THREE.DirectionalLight(0xaedfff, 0.82);
    fillLight.position.set(-2.6, -1.2, 4.6);
    scene.add(fillLight);
    const glintLight = new THREE.PointLight(0xf7fbff, 11.5, 11, 2.1);
    glintLight.position.set(4.8, 5.4, 4.6);
    scene.add(glintLight);

    const rootGroup = new THREE.Group();
    rootGroup.position.set(1.32, 0, 0);
    rootGroup.rotation.set(0, 0, 0);
    scene.add(rootGroup);
    keyLight.target = rootGroup;
    rimLight.target = rootGroup;
    fillLight.target = rootGroup;

    const contactShadowCanvas = document.createElement("canvas");
    contactShadowCanvas.width = 384;
    contactShadowCanvas.height = 384;
    const contactShadowContext = contactShadowCanvas.getContext("2d");
    if (contactShadowContext) {
      const contactGradient = contactShadowContext.createRadialGradient(192, 192, 10, 192, 192, 178);
      contactGradient.addColorStop(0, "rgba(28, 39, 48, 0.3)");
      contactGradient.addColorStop(0.36, "rgba(39, 53, 64, 0.19)");
      contactGradient.addColorStop(0.72, "rgba(56, 72, 84, 0.07)");
      contactGradient.addColorStop(1, "rgba(56, 72, 84, 0)");
      contactShadowContext.fillStyle = contactGradient;
      contactShadowContext.fillRect(0, 0, 384, 384);
    }
    const contactShadowTexture = new THREE.CanvasTexture(contactShadowCanvas);
    contactShadowTexture.colorSpace = THREE.SRGBColorSpace;
    const contactShadowGeometry = new THREE.PlaneGeometry(3.2, 2.8);
    const contactShadowMaterial = new THREE.MeshBasicMaterial({
      depthWrite: false,
      map: contactShadowTexture,
      opacity: 0.78,
      transparent: true,
    });
    const contactShadow = new THREE.Mesh(contactShadowGeometry, contactShadowMaterial);
    contactShadow.position.set(-0.26, -0.965, -0.1);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.renderOrder = -1;
    rootGroup.add(contactShadow);

    const shadowCatcherGeometry = new THREE.PlaneGeometry(4.2, 4.2);
    const shadowCatcherMaterial = new THREE.ShadowMaterial({
      color: 0x273743,
      opacity: 0.16,
      transparent: true,
    });
    const shadowCatcher = new THREE.Mesh(shadowCatcherGeometry, shadowCatcherMaterial);
    shadowCatcher.position.set(0, -0.975, 0);
    shadowCatcher.rotation.x = -Math.PI / 2;
    shadowCatcher.receiveShadow = true;
    shadowCatcher.renderOrder = -2;
    rootGroup.add(shadowCatcher);

    const cubeGeometry = new RoundedBoxGeometry(0.54, 0.54, 0.54, 5, 0.052);
    const edgeGeometry = new THREE.EdgesGeometry(cubeGeometry, 32);
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
    const faceColors = [0xcbd0d5, 0xb8bec5, 0xe6e9ec, 0x9299a1, 0xd6dade, 0xbfc5cb];
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
            clearcoat: 1,
            clearcoatRoughness: faceIndex === 2 ? 0.035 : 0.055,
            color,
            dithering: true,
            envMap,
            envMapIntensity: faceIndex === 2 ? 3.1 : 2.65,
            metalness: 0.96,
            reflectivity: 1,
            roughness: faceIndex === 2 ? 0.1 : faceIndex === 3 ? 0.22 : 0.145,
            specularIntensity: 1,
            transparent: false,
          }));
          const mesh = new THREE.Mesh(cubeGeometry, materials);
          const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x343a41,
            opacity: 0.46,
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
          mesh.castShadow = true;
          mesh.receiveShadow = true;
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
    keyLight.position.set(4.8, 5.2, 5.6);
    glintLight.position.set(5.2, 5.7, 4.2);
    rimLight.position.set(-4.4, 2.4, -3.2);
    contactShadow.position.set(-0.26, -0.965, -0.1);
    scene.environmentRotation.y = -0.28;

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
          record.mesh.visible = shouldShow;
        }
      });
      if (immediate || reduceMotion) render();
    };
    updateClientCubeStage = setStage;

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      syncThreeRendererPixelRatio(renderer, host);
      renderer.setSize(width, height, false);
      const aspect = width / height;
      const baseAspect = 1.08;
      camera.left = -(cameraViewHeight * baseAspect) / 2;
      camera.right = camera.left + cameraViewHeight * aspect;
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
          const isAtHiddenRest = record.scale <= 0.205
            && record.mesh.position.distanceToSquared(record.fly) <= 0.0025;
          record.mesh.visible = shouldShow || !isAtHiddenRest;
        });

        render();
      }

      frameId = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const viewport = window.visualViewport;
    window.addEventListener("resize", resize, { passive: true });
    viewport?.addEventListener("resize", resize, { passive: true });
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
      window.removeEventListener("resize", resize);
      viewport?.removeEventListener("resize", resize);
      intersectionObserver.disconnect();
      if (updateClientCubeStage === setStage) updateClientCubeStage = null;
      cubeGeometry.dispose();
      edgeGeometry.dispose();
      contactShadowGeometry.dispose();
      contactShadowMaterial.dispose();
      contactShadowTexture.dispose();
      shadowCatcherGeometry.dispose();
      shadowCatcherMaterial.dispose();
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
    return true;
  } catch (error) {
    if (setupToken !== clientCubeSetupToken || clientCubeRef.value !== host) return false;
    console.info("VEZHA client cube 3D fallback is inactive:", error);
    if (host.isConnected) host.hidden = true;
    return false;
  }
}

function updateClientCubePosition() {
  const host = clientCubeRef.value;
  const grid = rootRef.value?.querySelector<HTMLElement>("[data-clients-grid]");
  if (!host || !grid) return;

  if (window.innerWidth <= 900) {
    host.style.removeProperty("--client-cube-left");
    host.style.removeProperty("--client-cube-top");
    grid.style.removeProperty("--client-content-height");
    grid.querySelector<HTMLElement>(".vz-clients__head")
      ?.style.removeProperty("--client-head-y");
    grid.querySelector<HTMLElement>(".vz-client-copy")
      ?.style.removeProperty("--client-copy-y");
    return;
  }

  const headingGroup = grid.querySelector<HTMLElement>(".vz-clients__head");
  const heading = headingGroup?.querySelector<HTMLElement>("h2");
  const activeTitle = grid.querySelector<HTMLElement>(".vz-client-copy h3");
  const activeCard = grid.querySelector<HTMLElement>(".vz-client-card-slot");
  const cardReserve = grid.querySelector<HTMLElement>(".vz-client-card-reserve");
  const capsules = grid.querySelector<HTMLElement>(".vz-client-capsules");
  const gridRect = grid.getBoundingClientRect();
  const headingRect = heading?.getBoundingClientRect();
  const titleRect = activeTitle?.getBoundingClientRect();
  const cardRect = activeCard?.getBoundingClientRect();
  const capsulesRect = capsules?.getBoundingClientRect();
  const cubeRect = host.getBoundingClientRect();
  const presentationScale = getLandingPresentationScale(host);
  const cubeWidth = cubeRect.width / presentationScale || host.offsetWidth;
  const cubeHeight = cubeRect.height / presentationScale || host.offsetHeight;
  const reservedCardBottom = cardReserve?.getBoundingClientRect().bottom
    ?? activeCard?.getBoundingClientRect().bottom
    ?? gridRect.top;
  const nextContentHeight = `${Math.ceil((reservedCardBottom - gridRect.top) / presentationScale)}px`;

  if (grid.style.getPropertyValue("--client-content-height") !== nextContentHeight) {
    grid.style.setProperty("--client-content-height", nextContentHeight);
  }
  if (!cubeWidth || !cubeHeight || !headingRect) return;

  const targetViewportY = titleRect && cardRect
    ? (titleRect.bottom + cardRect.top) / 2
    : headingRect.top + headingRect.height / 2;

  if (headingGroup) {
    const renderedHeadOffset = Number.parseFloat(
      getComputedStyle(headingGroup).getPropertyValue("--client-head-y"),
    ) || 0;
    const currentHeadingCenter = headingRect.top + headingRect.height / 2;
    const nextHeadOffset = `${Math.round(
      renderedHeadOffset + (targetViewportY - currentHeadingCenter) / presentationScale,
    )}px`;
    if (headingGroup.style.getPropertyValue("--client-head-y") !== nextHeadOffset) {
      headingGroup.style.setProperty("--client-head-y", nextHeadOffset);
    }
  }

  const cubeVisualCenterRatio = 0.62;
  const rightSceneRoom = Math.max(0, cubeWidth - cubeHeight * 1.08);
  const targetRightWithinGrid = (
    (capsulesRect?.right ?? gridRect.right) - gridRect.left
  ) / presentationScale;
  // The canvas reserves transparent space on the right, so align the visible cube edge.
  const nextLeft = `${Math.round(targetRightWithinGrid - cubeWidth + rightSceneRoom)}px`;
  const nextTop = `${Math.round(
    (targetViewportY - gridRect.top) / presentationScale - cubeHeight * cubeVisualCenterRatio,
  )}px`;

  if (host.style.getPropertyValue("--client-cube-left") !== nextLeft) {
    host.style.setProperty("--client-cube-left", nextLeft);
  }
  if (host.style.getPropertyValue("--client-cube-top") !== nextTop) {
    host.style.setProperty("--client-cube-top", nextTop);
  }
}

function getLandingLayoutRect(element: Element) {
  const rect = element.getBoundingClientRect();
  const presentationScale = getLandingPresentationScale(element);
  return DOMRect.fromRect({
    x: rect.x / presentationScale,
    y: rect.y / presentationScale,
    width: rect.width / presentationScale,
    height: rect.height / presentationScale,
  });
}

function getLandingLayoutViewport(element: Element | null = rootRef.value) {
  const presentationScale = getLandingPresentationScale(element);
  return {
    height: window.innerHeight / presentationScale,
    scale: presentationScale,
    width: window.innerWidth / presentationScale,
  };
}

function getSectionLiquidTargets() {
  const root = rootRef.value;
  if (!root) return [];

  const configs = [
    { key: "hero", selector: "#hero h1", section: "#hero" },
    { key: "services", selector: "#services .vz-sec-head h2", section: "#services" },
    { key: "cases", selector: "#cases .vz-cases__heading h2", section: "#cases" },
    { key: "about", selector: "#about .vz-about__head h2", section: "#about" },
    { key: "stack", selector: "#stack .vz-sec-head h2", section: "#stack" },
    { key: "clients", selector: "#clients h2", section: "#clients" },
    { key: "contacts", selector: "#contacts h2", section: "#contacts" },
    { key: "footer", selector: ".vz-footer__sign strong", section: ".vz-footer" },
  ];

  return configs.reduce<SectionLiquidTarget[]>((targets, config) => {
    const element = root.querySelector<HTMLElement>(config.selector);
    const section = root.querySelector<HTMLElement>(config.section);
    if (!element || !section) return targets;

    const rect = getLandingLayoutRect(element);
    if (rect.width < 2 || rect.height < 2) return targets;

    targets.push({
      element,
      key: config.key,
      rect,
      sectionRect: getLandingLayoutRect(section),
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

  const wideLimit = getLandingLayoutViewport(target.element).width * 0.13;
  const byWidth = target.rect.width * 0.2;
  const byHeight = target.rect.height * (target.key === "footer" ? 0.46 : 0.72);
  return clampValue(Math.max(78, Math.min(wideLimit, byWidth, byHeight)), 68, 162);
}

function isSectionLiquidTargetFullyVisible(target: SectionLiquidTarget) {
  const viewportHeight = getLandingLayoutViewport(target.element).height;
  const topGuard = window.innerWidth > 900 ? 76 : 62;
  const bottomGuard = 24;
  return target.rect.top >= topGuard && target.rect.bottom <= viewportHeight - bottomGuard;
}

function isSectionLiquidTargetVisible(target: SectionLiquidTarget) {
  const viewportHeight = getLandingLayoutViewport(target.element).height;
  const topGuard = window.innerWidth > 900 ? 76 : 62;
  const bottomGuard = 24;
  return target.rect.bottom > topGuard && target.rect.top < viewportHeight - bottomGuard;
}

function getSectionLiquidTargetCenter(target: SectionLiquidTarget) {
  return (target.rect.top + target.rect.bottom) / 2;
}

function getStackLiquidScrollLock(targets: SectionLiquidTarget[]) {
  if (window.innerWidth <= 900) return null;
  if (sectionLiquidState.lastTargetKey !== "stack") return null;

  const stackTarget = targets.find((target) => target.key === "stack");
  const sticky = stackTarget?.element.closest<HTMLElement>(".vz-sticky");
  if (!stackTarget || !sticky) return null;

  // The sticky panel can be taller than the viewport on short screens.
  const stickyHeight = getLandingLayoutRect(sticky).height;
  if (stackTarget.sectionRect.top > 0 || stackTarget.sectionRect.bottom < stickyHeight) {
    return null;
  }

  return stackTarget;
}

function formatStablePx(value: number) {
  return `${Number(value.toFixed(3))}px`;
}

function getClosestSectionLiquidTarget(targets: SectionLiquidTarget[]) {
  const viewportCenter = getLandingLayoutViewport(targets[0]?.element).height * 0.5;
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
    target.rect.top < getLandingLayoutViewport(target.element).height
  ));

  return viewportTargets.length ? getClosestSectionLiquidTarget(viewportTargets) : getClosestSectionLiquidTarget(targets);
}

function getSectionLiquidSwitchLine(direction: number) {
  return getLandingLayoutViewport().height * (direction > 0 ? 0.43 : 0.57);
}

function isSectionLiquidTargetReadyToEnter(target: SectionLiquidTarget, direction: number) {
  const center = getSectionLiquidTargetCenter(target);
  const switchLine = getSectionLiquidSwitchLine(direction);
  const enterLine = getLandingLayoutViewport(target.element).height * (direction > 0 ? 0.78 : 0.22);

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

  const currentTarget = targets.find((target) => target.key === sectionLiquidState.lastTargetKey);
  if (currentTarget && isSectionLiquidTargetVisible(currentTarget)) return null;

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

function syncSectionLiquidGeometry(forceClone = false) {
  const overlay = sectionLiquidRef.value;
  if (!overlay) return;

  sectionLiquidStackLock = null;
  if (forceClone) syncNegativeWorlds(true);

  const targets = getSectionLiquidTargets();
  if (!targets.length) {
    overlay.classList.remove("is-active", "is-stack-active");
    hideSectionLiquidTargetOverlay();
    return;
  }

  const activeTarget = targets.find(({ key }) => key === sectionLiquidState.lastTargetKey)
    ?? getInitialSectionLiquidTarget(targets);
  if (forceClone || !sectionLiquidState.initialized) commitSectionLiquidTarget(activeTarget);
  else syncCurrentSectionLiquidTarget(targets);
  updateNegativeWorldPositions();
  syncSectionLiquidTargetOverlay(getSectionLiquidTargets());
  startSectionLiquid();
}

function queueSectionLiquidGeometrySync(forceClone = false) {
  sectionLiquidForceCloneOnLayoutSync ||= forceClone;
  if (sectionLiquidResizeTimer || sectionLiquidLayoutRaf) return;

  sectionLiquidLayoutRaf = requestAnimationFrame(() => {
    sectionLiquidLayoutRaf = 0;
    const shouldForceClone = sectionLiquidForceCloneOnLayoutSync;
    sectionLiquidForceCloneOnLayoutSync = false;
    syncSectionLiquidGeometry(shouldForceClone);
  });
}

function handleSectionLiquidResize() {
  const nextViewportWidth = window.innerWidth;
  const nextViewportScale = window.visualViewport?.scale ?? 1;
  const widthChanged = Math.abs(nextViewportWidth - sectionLiquidViewportWidth) > 1;
  const scaleChanged = Math.abs(nextViewportScale - sectionLiquidViewportScale) > 0.01;
  sectionLiquidViewportWidth = nextViewportWidth;
  sectionLiquidViewportScale = nextViewportScale;

  // Mobile browser chrome changes only the viewport height while scrolling.
  // Rebuilding the overlay for that transient resize blanks the liquid mark for
  // a frame, so keep the existing layer and let its animation use fresh bounds.
  if (nextViewportWidth <= 900 && !widthChanged && !scaleChanged) {
    startSectionLiquid();
    return;
  }

  const overlay = sectionLiquidRef.value;
  if (sectionLiquidRaf) cancelAnimationFrame(sectionLiquidRaf);
  sectionLiquidRaf = 0;
  if (sectionLiquidResizeTimer) window.clearTimeout(sectionLiquidResizeTimer);
  if (sectionLiquidLayoutRaf) cancelAnimationFrame(sectionLiquidLayoutRaf);
  sectionLiquidLayoutRaf = 0;
  sectionLiquidStackLock = null;
  sectionLiquidForceCloneOnLayoutSync = true;
  overlay?.classList.remove("is-active", "is-stack-active");
  clearSectionLiquidTextAlignment();
  hideSectionLiquidTargetOverlay();

  sectionLiquidResizeTimer = window.setTimeout(() => {
    sectionLiquidResizeTimer = 0;
    queueSectionLiquidGeometrySync(true);
  }, 90);
}

function setupSectionLiquidLayoutObserver() {
  if (sectionLiquidLayoutObserver || !("ResizeObserver" in window)) return;
  const targets = getSectionLiquidTargets();
  if (!targets.length) return;

  sectionLiquidLayoutObserver = new ResizeObserver(() => queueSectionLiquidGeometrySync());
  targets.forEach(({ element }) => sectionLiquidLayoutObserver?.observe(element));
}

function setupClientLayoutObserver() {
  if (clientLayoutResizeObserver || !("ResizeObserver" in window)) return;
  const grid = rootRef.value?.querySelector<HTMLElement>("[data-clients-grid]");
  const heading = grid?.querySelector<HTMLElement>(".vz-clients__head h2");
  if (!grid || !heading) return;

  clientLayoutResizeObserver = new ResizeObserver(updateClientCubePosition);
  clientLayoutResizeObserver.observe(grid);
  clientLayoutResizeObserver.observe(heading);

  const section = grid.closest<HTMLElement>(".vz-clients");
  if (section && !clientLayoutMotionCleanup) {
    const handleMotionEnd = () => {
      if (clientLayoutMotionRaf) cancelAnimationFrame(clientLayoutMotionRaf);
      clientLayoutMotionRaf = requestAnimationFrame(() => {
        clientLayoutMotionRaf = 0;
        updateClientCubePosition();
      });
    };

    section.addEventListener("animationend", handleMotionEnd);
    clientLayoutMotionCleanup = () => {
      section.removeEventListener("animationend", handleMotionEnd);
      if (clientLayoutMotionRaf) cancelAnimationFrame(clientLayoutMotionRaf);
      clientLayoutMotionRaf = 0;
      clientLayoutMotionCleanup = null;
    };
  }
}

function syncMobileSectionLiquidTargetOverlay(targets: SectionLiquidTarget[]) {
  const overlay = sectionLiquidRef.value;
  const targetHost = overlay?.querySelector<HTMLElement>("[data-section-liquid-target]");
  const target = targets.find(({ key }) => key === sectionLiquidState.lastTargetKey);
  if (!overlay || !targetHost || !target || target.key === "hero") return;

  const sourceText = target.element.querySelector<HTMLElement>("[data-reveal]")
    ?? target.element;
  syncLiquidTextOverlay(sourceText, targetHost, target.key);
}

function syncLiquidTextOverlay(sourceText: HTMLElement, targetHost: HTMLElement, key: string) {
  const overlay = sectionLiquidRef.value;
  if (!overlay) return;
  const sourceRect = getLandingLayoutRect(sourceText);
  const overlayRect = getLandingLayoutRect(overlay);
  const sourceStyle = window.getComputedStyle(sourceText);
  const text = sourceText.textContent?.replace(/\s+/g, " ").trim() ?? "";
  if (!text) return;

  const styleSignature = [
    key,
    text,
    sourceRect.width.toFixed(2),
    sourceStyle.fontFamily,
    sourceStyle.fontSize,
    sourceStyle.fontStyle,
    sourceStyle.fontWeight,
    sourceStyle.lineHeight,
    sourceStyle.letterSpacing,
    sourceStyle.textAlign,
    sourceStyle.display,
    sourceStyle.gap,
    sourceStyle.textTransform,
    sourceStyle.whiteSpace,
    sourceStyle.wordBreak,
    sourceStyle.getPropertyValue("text-wrap"),
  ].join("|");

  if (targetHost.dataset.mobileLiquidSignature !== styleSignature) {
    const clonedChildren = Array.from(sourceText.childNodes, (node) => node.cloneNode(true));
    targetHost.replaceChildren(...clonedChildren);
    targetHost.style.fontFamily = sourceStyle.fontFamily;
    targetHost.style.fontSize = sourceStyle.fontSize;
    targetHost.style.fontStyle = sourceStyle.fontStyle;
    targetHost.style.fontWeight = sourceStyle.fontWeight;
    targetHost.style.lineHeight = sourceStyle.lineHeight;
    targetHost.style.letterSpacing = sourceStyle.letterSpacing;
    targetHost.style.textAlign = sourceStyle.textAlign;
    targetHost.style.display = sourceStyle.display;
    targetHost.style.gap = sourceStyle.gap;
    targetHost.style.alignItems = sourceStyle.alignItems;
    targetHost.style.justifyContent = sourceStyle.justifyContent;
    targetHost.style.flexWrap = sourceStyle.flexWrap;
    targetHost.style.textTransform = sourceStyle.textTransform;
    targetHost.style.whiteSpace = sourceStyle.whiteSpace;
    targetHost.style.wordBreak = sourceStyle.wordBreak;
    targetHost.style.overflowWrap = sourceStyle.overflowWrap;
    targetHost.style.setProperty("text-wrap", sourceStyle.getPropertyValue("text-wrap"));
    targetHost.style.setProperty("font-kerning", sourceStyle.getPropertyValue("font-kerning"));
    targetHost.style.setProperty("font-feature-settings", sourceStyle.getPropertyValue("font-feature-settings"));
    targetHost.style.setProperty("font-variation-settings", sourceStyle.getPropertyValue("font-variation-settings"));
    targetHost.dataset.mobileLiquidSignature = styleSignature;
  }

  targetHost.hidden = false;
  targetHost.style.left = "0px";
  targetHost.style.top = "0px";
  targetHost.style.width = formatStablePx(sourceRect.width);
  targetHost.style.height = formatStablePx(sourceRect.height);
  targetHost.style.transform = `translate3d(${formatStablePx(sourceRect.left - overlayRect.left)}, ${formatStablePx(sourceRect.top - overlayRect.top)}, 0)`;
}

function syncGalleryLiquidText() {
  const copies = [
    { source: "#cases .vz-cases__heading > p", host: "[data-gallery-liquid-target]", key: "cases-intro" },
  ];
  for (const copy of copies) {
    const source = rootRef.value?.querySelector<HTMLElement>(copy.source);
    const host = sectionLiquidRef.value?.querySelector<HTMLElement>(copy.host);
    if (!host) continue;
    host.hidden = true;
    if (!source) continue;
    const rect = source.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
    syncLiquidTextOverlay(source, host, copy.key);
  }
}

function syncSectionLiquidLabel() {
  const host = sectionLiquidRef.value?.querySelector<HTMLElement>("[data-section-label-liquid-target]");
  if (!host) return;
  host.hidden = true;
  const key = sectionLiquidState.lastTargetKey;
  if (!key || key === "hero" || key === "footer") return;
  const source = rootRef.value?.querySelector<HTMLElement>(`#${key} .vz-section-label`);
  if (!source) return;
  syncLiquidTextOverlay(source, host, `${key}-label`);

  // Match each label fragment to its live position, including wrapping and
  // section-specific spacing that the full-page negative clone cannot share.
  const sourceRect = getLandingLayoutRect(source);
  Array.from(source.children).forEach((child, index) => {
    const copy = host.children[index] as HTMLElement | undefined;
    if (!(child instanceof HTMLElement) || !copy) return;
    const rect = getLandingLayoutRect(child);
    const style = getComputedStyle(child);
    copy.style.position = "absolute";
    copy.style.margin = "0";
    copy.style.left = formatStablePx(rect.left - sourceRect.left);
    copy.style.top = formatStablePx(rect.top - sourceRect.top);
    copy.style.width = formatStablePx(rect.width);
    copy.style.height = formatStablePx(rect.height);
    copy.style.font = style.font;
    copy.style.letterSpacing = style.letterSpacing;
  });
}

function syncSectionLiquidTargetOverlay(targets: SectionLiquidTarget[]) {
  syncSectionLiquidLabel();
  syncGalleryLiquidText();
  clearSectionLiquidTextAlignment();
  hideSectionLiquidTargetOverlay();
  if (!sectionLiquidState.lastTargetKey) return;
  if (window.innerWidth <= 900) {
    syncMobileSectionLiquidTargetOverlay(targets);
    return;
  }

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
    cases: "[data-negative-section='cases'] .vz-cases__heading h2",
    contacts: "[data-negative-section='contacts'] h2",
    footer: "[data-negative-section='footer'] .vz-footer__sign strong",
  };
  const cloneTarget = cloneRoot.querySelector<HTMLElement>(
    cloneSelectors[target.key] ?? "",
  );
  const cloneSection = cloneTarget?.closest<HTMLElement>("[data-negative-section]");
  if (!cloneTarget || !cloneSection) return;

  const sourceText = target.element.querySelector<HTMLElement>("[data-reveal]")
    ?? target.element;
  const cloneText = cloneTarget.querySelector<HTMLElement>("span span")
    ?? cloneTarget;
  const cloneSectionRect = getLandingLayoutRect(cloneSection);

  if (target.key !== "stack") {
    cloneSection.style.translate = `${formatStablePx(target.sectionRect.left - cloneSectionRect.left)} ${formatStablePx(target.sectionRect.top - cloneSectionRect.top)}`;
    cloneSection.dataset.liquidCloneAligned = "true";
  }

  const sourceRect = getLandingLayoutRect(sourceText);
  const cloneRect = getLandingLayoutRect(cloneText);

  cloneTarget.style.translate = `${formatStablePx(sourceRect.left - cloneRect.left)} ${formatStablePx(sourceRect.top - cloneRect.top)}`;
  cloneTarget.dataset.liquidTextAligned = "true";
}

function commitSectionLiquidTarget(target: SectionLiquidTarget) {
  const changed = target.key !== sectionLiquidState.lastTargetKey;
  sectionLiquidState.initialized = true;
  sectionLiquidState.lastTargetKey = target.key;
  sectionLiquidState.targetX = target.rect.left + target.rect.width / 2;
  sectionLiquidState.targetY = target.rect.top + target.rect.height / 2;
  sectionLiquidState.targetRadius = getSectionLiquidRadius(target);

  // Reveal at the new heading; never interpolate the mark across the page.
  const overlay = sectionLiquidRef.value;
  if (overlay && changed) {
    overlay.getAnimations().forEach((animation) => animation.cancel());
    if (target.key !== "hero") {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      overlay.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: reduceMotion ? 200 : 1000,
        easing: getComputedStyle(overlay).getPropertyValue("--ease-out").trim() || "cubic-bezier(0.23, 1, 0.32, 1)",
      });
    }
  }
}

function startSectionLiquid() {
  if (!enableSectionLiquid) return;
  if (sectionLiquidResizeTimer) return;
  if (sectionLiquidRaf) return;
  sectionLiquidRaf = requestAnimationFrame(animateSectionLiquid);
}

function animateSectionLiquid(now: number) {
  sectionLiquidRaf = 0;
  const overlay = sectionLiquidRef.value;
  if (!overlay || !enableSectionLiquid) return;

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
    commitSectionLiquidTarget(getInitialSectionLiquidTarget(targets));
  } else {
    const nextTarget = getNextSectionLiquidTarget(targets);
    if (nextTarget) commitSectionLiquidTarget(nextTarget);
    else {
      if (
        sectionLiquidState.lastTargetKey === "stack"
        && !getStackLiquidScrollLock(targets)
      ) {
        sectionLiquidStackLock = null;
      }
      if (!sectionLiquidStackLock) syncCurrentSectionLiquidTarget(targets);
    }
  }

  const stackScrollLock = getStackLiquidScrollLock(targets);
  if (stackScrollLock) {
    const sticky = stackScrollLock.element.closest<HTMLElement>(".vz-sticky");
    const heading = stackScrollLock.element.closest<HTMLElement>(".vz-sec-head");
    const headingAnimating = heading?.getAnimations({ subtree: true })
      .some((animation) => animation.playState === "running") ?? false;

    // Capture once per sticky interval. Only follow the heading while its
    // entrance animation is running, including its final settled frame.
    if (!sectionLiquidStackLock || headingAnimating || sectionLiquidStackLock.headingAnimating) {
      const stickyRect = sticky ? getLandingLayoutRect(sticky) : null;
      sectionLiquidStackLock = {
        x: stackScrollLock.rect.left + stackScrollLock.rect.width / 2,
        y: stackScrollLock.rect.top + stackScrollLock.rect.height / 2,
        radius: getSectionLiquidRadius(stackScrollLock),
        headingAnimating,
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
  } else {
    sectionLiquidStackLock = null;
    syncCurrentSectionLiquidTarget(targets);
  }

  overlay.classList.toggle(
    "is-stack-active",
    useStackScrollLock && Boolean(sectionLiquidStackLock),
  );
  updateNegativeWorldPositions();
  syncSectionLiquidTargetOverlay(targets);

  const overlayRect = getLandingLayoutRect(overlay);
  const activeKey = sectionLiquidState.lastTargetKey;
  const radius = sectionLiquidState.targetRadius;
  const size = radius * 4;
  const path = buildHeroLiquidPath(
    size / 2,
    size / 2,
    radius,
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : now * 0.001,
    0,
    -0.35,
    { left: 0, top: 0, right: size, bottom: size, width: size, height: size },
  );
  // Keep the crisp mask local to the mark instead of rasterizing the entire page.
  const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><path fill="white" d="${path}"/></svg>`;
  overlay.style.maskImage = `url("data:image/svg+xml,${encodeURIComponent(mask)}")`;
  overlay.style.maskSize = `${size}px ${size}px`;
  overlay.style.maskPosition = `${sectionLiquidState.targetX - overlayRect.left - size / 2}px ${sectionLiquidState.targetY - overlayRect.top - size / 2}px`;

  overlay.classList.toggle("is-active", Boolean(activeKey) && activeKey !== "hero");
  overlay.dataset.activeKey = activeKey;

  // Keep the mark attached to sticky headings while their layout changes.
  sectionLiquidRaf = requestAnimationFrame(animateSectionLiquid);
}

function updateHeroNegative(event: PointerEvent) {
  const hero = heroRef.value;
  if (!hero || event.pointerType === "touch") return;

  const visualRect = hero.getBoundingClientRect();
  const presentationScale = getLandingPresentationScale(hero);
  const rect = getLandingLayoutRect(hero);
  const bounds = getHeroLiquidBounds(hero, rect);
  const pointerX = (event.clientX - visualRect.left) / presentationScale;
  const pointerY = (event.clientY - visualRect.top) / presentationScale;
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
  heroFxRaf = 0;
  const hero = heroRef.value;
  const mask = heroNegativeRef.value;
  if (!hero || !mask) {
    return;
  }

  const rect = getLandingLayoutRect(hero);
  if (rect.width < 1 || rect.height < 1) {
    heroFxRaf = requestAnimationFrame(animateHeroNegative);
    return;
  }

  const elapsedMs = clampValue(now - heroFxLastFrame, 0, 50);
  const frame = clampValue(elapsedMs / 16.67, 0, 2);
  heroFxLastFrame = now;
  const bounds = getHeroLiquidBounds(hero, rect);
  const isMobileHeroFx = window.innerWidth <= 900;
  const radius = clampValue(Math.min(bounds.width * 0.16, bounds.height * 0.46, rect.width * 0.105), 76, 148) * (isMobileHeroFx ? 0.67 : 1);
  const centerInset = Math.min(radius * 0.14, bounds.width * 0.18, bounds.height * 0.18);
  const minCenterX = Math.min(bounds.left + centerInset, bounds.right);
  const maxCenterX = Math.max(bounds.right - centerInset, minCenterX);
  const minCenterY = Math.min(bounds.top + centerInset, bounds.bottom);
  const maxCenterY = Math.max(isMobileHeroFx ? bounds.top + radius * 0.45 : bounds.bottom - centerInset, minCenterY);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (isMobileHeroFx) {
    let nextX = clampValue(heroFxState.currentX * rect.width, minCenterX, maxCenterX);
    let nextY = clampValue(heroFxState.currentY * rect.height, minCenterY, maxCenterY);

    if (!reduceMotion) {
      const horizontalRange = Math.max(1, maxCenterX - minCenterX);
      const verticalRange = Math.max(1, maxCenterY - minCenterY);
      nextX += heroFxState.mobileDirectionX * horizontalRange * elapsedMs / mobileHeroFxHorizontalTraversalMs;
      nextY += heroFxState.mobileDirectionY * verticalRange * elapsedMs / mobileHeroFxVerticalTraversalMs;

      if (nextX <= minCenterX || nextX >= maxCenterX) {
        heroFxState.mobileDirectionX *= -1;
        nextX = clampValue(nextX, minCenterX, maxCenterX);
      }
      if (nextY <= minCenterY || nextY >= maxCenterY) {
        heroFxState.mobileDirectionY *= -1;
        nextY = clampValue(nextY, minCenterY, maxCenterY);
      }
    }

    heroFxState.currentX = nextX / rect.width;
    heroFxState.currentY = nextY / rect.height;
  } else {
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
  if (!isMobileHeroFx || !reduceMotion) {
    heroFxRaf = requestAnimationFrame(animateHeroNegative);
  }
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

  const titleRect = getLandingLayoutRect(title);
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

const PRELOADER_MIN_VISIBLE_MS = 760;
const PRELOADER_TASK_TIMEOUT_MS = 6500;

function waitForDelay(duration: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, duration));
}

function waitForCommittedPaint() {
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(fallbackTimer);
      resolve();
    };
    const fallbackTimer = window.setTimeout(finish, 220);
    requestAnimationFrame(() => requestAnimationFrame(finish));
  });
}

function settleInitialLoadTask(task: InitialLoadTask, onComplete: () => void) {
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = (status: "ready" | "fallback" | "timeout", error?: unknown) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutTimer);
      if (status !== "ready") {
        console.info(`VEZHA initial ${task.label} ${status} is active.`, error || "");
      }
      onComplete();
      resolve();
    };
    const timeoutTimer = window.setTimeout(
      () => finish("timeout"),
      PRELOADER_TASK_TIMEOUT_MS,
    );

    void task.promise.then((result) => {
      finish(result === false ? "fallback" : "ready");
    }).catch((error) => finish("fallback", error));
  });
}

function beginPreloaderExit(runToken: number) {
  if (runToken !== preloaderRunToken || !showPreloader.value) return;
  sessionStorage.setItem("vz_loaded", "1");
  if (preloaderRef.value) {
    preloaderRef.value.style.transform = "translateY(-100%)";
    preloaderRef.value.style.pointerEvents = "none";
  }
  preloaderExitTimer = window.setTimeout(() => {
    if (runToken !== preloaderRunToken) return;
    showPreloader.value = false;
    void nextTick(() => {
      setupReveals();
      updateScrollEffects();
    });
  }, 900);
}

function runPreloader(tasks: InitialLoadTask[]) {
  const runToken = ++preloaderRunToken;
  cancelAnimationFrame(preloaderFrameId);
  window.clearTimeout(preloaderExitTimer);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    sessionStorage.setItem("vz_loaded", "1");
    showPreloader.value = false;
    return;
  }

  const seen = sessionStorage.getItem("vz_loaded") === "1";
  const replayLoader = import.meta.dev && new URLSearchParams(window.location.search).get("loader") === "1";
  if (seen && !replayLoader) {
    showPreloader.value = false;
    return;
  }

  introProgress.value = 0;
  const started = performance.now();
  const totalWeight = Math.max(1, tasks.reduce((total, task) => total + task.weight, 0));
  let completedWeight = 0;
  let resourcesReady = false;
  let displayedProgress = 0;
  let previousFrame = started;

  const trackedTasks = tasks.map((task) => settleInitialLoadTask(task, () => {
    completedWeight += task.weight;
  }));

  void Promise.all([
    Promise.all(trackedTasks),
    waitForDelay(PRELOADER_MIN_VISIBLE_MS),
  ]).then(() => waitForCommittedPaint()).then(() => {
    if (runToken === preloaderRunToken) resourcesReady = true;
  });

  const step = (now: number) => {
    if (runToken !== preloaderRunToken) return;
    const delta = Math.max(0, Math.min(64, now - previousFrame));
    previousFrame = now;
    const completion = completedWeight / totalWeight;
    const target = resourcesReady ? 1 : Math.min(0.94, 0.04 + completion * 0.9);
    const easing = 1 - Math.exp(-delta / 135);
    displayedProgress += (target - displayedProgress) * easing;

    if (resourcesReady && displayedProgress >= 0.995) {
      introProgress.value = 100;
      preloaderFrameId = requestAnimationFrame(() => beginPreloaderExit(runToken));
      return;
    }

    const displayLimit = resourcesReady ? 99.9 : 94;
    introProgress.value = Math.max(
      introProgress.value,
      Math.min(displayLimit, displayedProgress * 100),
    );
    preloaderFrameId = requestAnimationFrame(step);
  };

  preloaderFrameId = requestAnimationFrame(step);
}

function restoreInitialHashPosition() {
  const targetId = window.location.hash.slice(1);
  if (!targetId) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    });
  });
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
    element.style.willChange = "transform, opacity";
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
    if (showPreloader.value && element.closest("#hero")) return;
    const wrap = element.parentElement || element;
    const rect = wrap.getBoundingClientRect();
    const inView = rect.top < vh * 0.92 && rect.bottom > -40;

    if (reduceMotion || inView) {
      if (!element.dataset.revealed) {
        element.dataset.revealed = "1";
        const order = Math.max(0, Number(element.dataset.revealOrder) || 0);
        const delay = Math.min(order * 70, 210);
        element.style.transition = `transform 720ms cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms, opacity 600ms cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms`;
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
        element.style.transition = "clip-path 800ms cubic-bezier(0.77, 0, 0.175, 1)";
      }
      element.style.clipPath = "inset(0 0% 0 0)";
    }
  });
}

function scanSectionEntrances() {
  const root = rootRef.value;
  if (!root) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sections = root.querySelectorAll<HTMLElement>("#hero, #about, [data-stack-section], [data-services-pin], #clients, #cases, #contacts, .vz-footer");

  sections.forEach((section) => {
    if (section.classList.contains("is-motion-visible")) return;
    if (!enableMotionLayer || reduceMotion) {
      section.classList.add("is-motion-visible");
      return;
    }

    if (showPreloader.value && section.id === "hero") return;

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
  }
  queueNegativeStackStateSync();
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

const negativeCloneSurfaceTokens = [
  ["--landing-glass", "transparent"],
  ["--landing-glass-strong", "transparent"],
  ["--landing-glass-border", "transparent"],
  ["--landing-glass-shadow", "none"],
  ["--landing-card-surface", "transparent"],
  ["--landing-card-surface-north-east", "transparent"],
  ["--landing-card-surface-cyan-left", "transparent"],
  ["--landing-card-surface-violet-top", "transparent"],
  ["--landing-card-surface-diagonal", "transparent"],
  ["--landing-card-border", "transparent"],
  ["--landing-card-shadow", "none"],
  ["--services-card-gradient", "transparent"],
  ["--services-card-border", "transparent"],
  ["--services-card-shadow", "none"],
] as const;

function cleanupNegativeClone(clone: HTMLElement) {
  clone.dataset.negativeClone = "true";
  clone.setAttribute("aria-hidden", "true");
  clone.removeAttribute("id");
  clone.classList.remove("vz-motion-ready");
  negativeCloneSurfaceTokens.forEach(([property, value]) => {
    clone.style.setProperty(property, value, "important");
  });
  clone.querySelectorAll<HTMLElement>("#hero, #about, [data-stack-section], [data-services-pin], #clients, #cases, #contacts, .vz-footer").forEach((section) => {
    section.dataset.negativeSection = section.id || (section.classList.contains("vz-footer") ? "footer" : "");
    section.classList.add("is-motion-visible");
  });
  clone.querySelectorAll<HTMLElement>(".vz-nav, .vz-section-liquid, .vz-hero__negative, .vz-preloader, .vz-mobile-menu, .vz-motion-atmosphere").forEach((element) => element.remove());
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
  const useLightMobileLiquid = window.innerWidth <= 900;
  const mobileSignature = "mobile-light";

  if (root && pageHost) {
    if (useLightMobileLiquid) {
      if (pageHost.dataset.signature !== mobileSignature || pageHost.childElementCount) {
        pageHost.textContent = "";
        pageHost.dataset.signature = mobileSignature;
      }
    } else {
      const signature = getNegativeWorldSignature("page");
      if (force || pageHost.dataset.signature !== signature) {
        mountNegativeClone(pageHost, root);
        pageHost.dataset.signature = signature;
      }
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
    const stackPinned = window.innerWidth > 900
      && sectionLiquidState.lastTargetKey === "stack"
      && Boolean(sectionLiquidStackLock);
    overlay.classList.toggle("is-stack-active", stackPinned);
    overlay.style.position = "";
    overlay.style.right = "";
    overlay.style.bottom = "";
    overlay.style.minHeight = "";
    const rect = getLandingLayoutRect(root);
    const layoutViewport = getLandingLayoutViewport(root);
    const height = Math.max(root.scrollHeight, root.offsetHeight, layoutViewport.height);
    const cloneStackSticky = pageHost.querySelector<HTMLElement>(
      "[data-negative-clone='true'] [data-stack-section] > .vz-sticky",
    );
    const sourceStackSticky = root.querySelector<HTMLElement>(
      "[data-stack-section] > .vz-sticky",
    );

    if (stackPinned) {
      overlay.style.left = "0px";
      overlay.style.top = "0px";
      overlay.style.width = formatStablePx(layoutViewport.width);
      overlay.style.height = formatStablePx(layoutViewport.height);

      const stickyRect = sectionLiquidStackLock?.stickyBounds
        ?? (sourceStackSticky ? getLandingLayoutRect(sourceStackSticky) : null)
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

    const documentLeft = rect.left + window.scrollX / layoutViewport.scale;
    const documentTop = rect.top + window.scrollY / layoutViewport.scale;
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
  // Wake the liquid layer directly from the scroll event so its fixed mobile
  // overlay is updated in the very next paint, not one animation frame later.
  startSectionLiquid();
  startHeroNegative();
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    updateScrollEffects();
    updateClientCubePosition();
    syncNegativeWorlds();
  });
}

onMounted(async () => {
  theme.value = localStorage.getItem("vz_theme") || "light";
  localeWatcherReady = true;
  const publicDataReady = loadPublicData();
  const fontsReady = waitForInitialFonts();
  setupReveals();
  updateScrollEffects();
  sectionLiquidLastScrollY = window.scrollY;
  sectionLiquidViewportWidth = window.innerWidth;
  sectionLiquidViewportScale = window.visualViewport?.scale ?? 1;
  handleHeaderResize();
  await nextTick();
  setupClientLayoutObserver();
  syncNegativeWorlds(true);
  setupSectionLiquidLayoutObserver();
  updateClientCubePosition();
  void fontsReady.then(() => {
    updateClientCubePosition();
    queueSectionLiquidGeometrySync(true);
  }).catch(() => {});
  startHeroNegative();
  startSectionLiquid();
  setupAboutFlowObserver();
  const clientCubeReady = setupClientCubeScene();
  runPreloader([
    { label: "public data", promise: publicDataReady, weight: 40 },
    { label: "fonts", promise: fontsReady, weight: 20 },
    { label: "route scene", promise: aboutSceneGate.promise, weight: 10 },
    { label: "stack scene", promise: stackSceneGate.promise, weight: 15 },
    { label: "client scene", promise: clientCubeReady, weight: 15 },
  ]);
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
  window.addEventListener("resize", handleSectionLiquidResize, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("resize", handleHeaderResize, { passive: true });
  window.visualViewport?.addEventListener("resize", handleSectionLiquidResize, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleUpdate, { passive: true });
  await publicDataReady;
  await nextTick();
  restoreInitialHashPosition();
  setupReveals();
  updateScrollEffects();
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
  preloaderRunToken += 1;
  cancelAnimationFrame(preloaderFrameId);
  window.clearTimeout(preloaderExitTimer);
  aboutSceneGate.complete(false);
  stackSceneGate.complete(false);
  clientCubeSetupToken += 1;
  window.removeEventListener("scroll", scheduleUpdate);
  window.removeEventListener("scroll", handleHeaderScroll);
  window.removeEventListener("resize", handleSectionLiquidResize);
  window.removeEventListener("resize", scheduleUpdate);
  window.removeEventListener("resize", handleHeaderResize);
  window.visualViewport?.removeEventListener("resize", handleSectionLiquidResize);
  window.visualViewport?.removeEventListener("resize", scheduleUpdate);
  clearHeaderIdleTimer();
  clientLayoutResizeObserver?.disconnect();
  clientLayoutMotionCleanup?.();
  sectionLiquidLayoutObserver?.disconnect();
  if (raf) cancelAnimationFrame(raf);
  if (heroFxRaf) cancelAnimationFrame(heroFxRaf);
  if (sectionLiquidRaf) cancelAnimationFrame(sectionLiquidRaf);
  if (sectionLiquidLayoutRaf) cancelAnimationFrame(sectionLiquidLayoutRaf);
  if (sectionLiquidResizeTimer) window.clearTimeout(sectionLiquidResizeTimer);
  stopAboutFlow();
  clientCubeCleanup?.();
});

watch(displayStackGroups, () => {
  activeStackIndex.value = clampStackIndex(activeStackIndex.value);
  updateScrollEffects();
});

watch(currentLocale, async (nextLocale) => {
  document.documentElement.lang = currentLocale.value;
  if (!localeWatcherReady) return;
  await loadPublicData(nextLocale);
  await nextTick();
  setupReveals();
  updateScrollEffects();
  syncNegativeWorlds(true);
  queueSectionLiquidGeometrySync(true);
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
    class: "landing-route overlay-scrollbar-route",
    "data-theme": theme.value,
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

<style src="~/assets/css/landing-base.css"></style>
<style src="~/assets/css/landing-motion.css"></style>
<style src="~/assets/css/landing-preloader.css"></style>
<style src="~/assets/css/landing-nav.css"></style>
<style src="~/assets/css/landing-hero.css"></style>
<style src="~/assets/css/landing-liquid.css"></style>
<style src="~/assets/css/landing-sections.css"></style>
<style src="~/assets/css/landing-clients.css"></style>
<style src="~/assets/css/landing-contacts-footer.css"></style>
<style src="~/assets/css/landing-responsive.css"></style>
<style src="~/assets/css/landing-transplants.css"></style>

<style src="~/assets/css/site-polish.css"></style>
