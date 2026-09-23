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

    <MobileSiteMenu :visible="isHeaderShown" id="landing-mobile-menu" :theme="theme" :locale="currentLocale" :contact-email="contactEmail" @toggle-theme="toggleTheme" @close="holdHeader" />

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
import { useLandingContent } from "~/composables/landing/useLandingContent";
import { useLandingHeader } from "~/composables/landing/useLandingHeader";
import { useLandingPreloader } from "~/composables/landing/useLandingPreloader";
import { useAboutFlow } from "~/composables/landing/useAboutFlow";
import { useScrollReveals } from "~/composables/landing/useScrollReveals";
import { useClientCube } from "~/composables/landing/useClientCube";
import { useSectionLiquid } from "~/composables/landing/useSectionLiquid";

definePageMeta({
  layout: false,
});

const {
  currentLocale,
  copy,
  caseFallbacks,
  casesCopy,
  projects,
  clientSegments,
  navItems,
  footerNavItems,
  marqueeItems,
  displayServices,
  displayStackGroups,
  contactEmail,
  clampStackIndex,
  loadPublicData,
} = useLandingContent();

type ThemeMode = "light" | "dark";

const rootRef = ref<HTMLElement | null>(null);
const sectionLiquidRef = ref<HTMLElement | null>(null);
const {
  preloaderRef,
  showPreloader,
  preloaderFontReady,
  introProgress,
  aboutSceneGate,
  stackSceneGate,
  markAboutSceneReady,
  markStackSceneReady,
  waitForInitialFonts,
  runPreloader,
} = useLandingPreloader({
  onExit: () => {
    setupReveals();
    updateScrollEffects();
  },
});
const { restoreInitialHashPosition, setupReveals, updateScrollEffects } = useScrollReveals({ rootRef, showPreloader });
const theme = ref<ThemeMode>("light");
const {
  isHeaderShown,
  holdHeader,
  handleHeaderZonePointerEnter,
  handleHeaderZonePointerLeave,
  handleHeaderPointerEnter,
  handleHeaderPointerLeave,
  handleHeaderFocusIn,
  handleHeaderFocusOut,
} = useLandingHeader({ rootRef, showPreloader });
const {
  aboutFlowPhase,
  aboutFlowCycleKey,
  aboutFlowResumeKey,
  aboutFlowResumeElapsedMs,
  aboutFlowTargetStepIndex,
  aboutFlowNavigationKey,
  aboutFlowStepIndex,
  aboutFlowDisplayStepIndex,
  canContinueAboutFlow,
  aboutFlowSnakeSegments,
  activeAboutBusiness,
  activeAboutProduct,
  replayAboutFlow,
  continueAboutFlow,
  selectAboutFlowStep,
  setAboutFlowReachedStep,
  setAboutFlowHost,
} = useAboutFlow({ copy });
const activeStackIndex = ref(0);
const activeClientSegment = ref(0);
const activeServiceIndex = ref(0);
const {
  setClientCubeHost,
  setClientCubeStage,
  setupClientCubeScene,
  setupClientLayoutObserver,
  updateClientCubePosition,
} = useClientCube({ rootRef, activeClientSegment, clientSegments });
const {
  enableSectionLiquid,
  setHeroHosts,
  updateHeroNegative,
  resetHeroNegative,
  startHeroNegative,
  startSectionLiquid,
  setupSectionLiquidLayoutObserver,
  queueSectionLiquidGeometrySync,
  syncNegativeWorlds,
  queueNegativeStackStateSync,
} = useSectionLiquid({
  rootRef,
  sectionLiquidRef,
  theme,
  showPreloader,
  activeServiceIndex,
  activeClientSegment,
  displayServices,
  displayStackGroups,
});

function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  localStorage.setItem("vz_theme", theme.value);
  requestAnimationFrame(() => syncNegativeWorlds(true));
}

let localeWatcherReady = false;

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
  const clientCubeReady = setupClientCubeScene();
  runPreloader([
    { label: "public data", promise: publicDataReady, weight: 40 },
    { label: "fonts", promise: fontsReady, weight: 20 },
    { label: "route scene", promise: aboutSceneGate.promise, weight: 10 },
    { label: "stack scene", promise: stackSceneGate.promise, weight: 15 },
    { label: "client scene", promise: clientCubeReady, weight: 15 },
  ]);
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
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
  setClientCubeStage(activeClientSegment.value);
  await nextTick();
  updateClientCubePosition();
  syncNegativeWorlds(true);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", scheduleUpdate);
  window.removeEventListener("resize", scheduleUpdate);
  window.visualViewport?.removeEventListener("resize", scheduleUpdate);
  if (raf) cancelAnimationFrame(raf);
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
