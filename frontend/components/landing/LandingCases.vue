<template>
  <section id="cases" class="vz-cases" aria-labelledby="cases-title">
    <header class="vz-cases__heading">
      <div class="vz-cases__title-block">
        <div class="vz-section-label"><span>{{ copy.label }}</span><i>/</i><span>05</span></div>
        <h2 id="cases-title"><span><span data-reveal>{{ copy.title }}</span></span></h2>
      </div>
      <p>{{ copy.intro }}</p>
    </header>

    <div v-if="cases.length" class="vz-cases__shell">
      <div class="vz-cases__case-nav">
        <div
          class="vz-cases__tabs"
          role="tablist"
          :aria-label="copy.tabAria"
          aria-orientation="horizontal"
          @keydown="onTabsKeydown"
        >
          <button
            v-for="(item, index) in cases"
            :id="`case-tab-${index}`"
            :key="item.slug || item.id"
            type="button"
            role="tab"
            :aria-controls="`case-panel-${index}`"
            :aria-label="`${two(index + 1)}. ${item.name}. ${item.type}`"
            :aria-selected="index === activeIndex"
            :tabindex="index === activeIndex ? 0 : -1"
            @click="selectCase(index)"
          >
            <span>{{ two(index + 1) }}</span>
            <b>{{ caseLabel(item) }}</b>
            <i aria-hidden="true"></i>
          </button>
        </div>

        <div
          class="vz-cases__mobile-controls"
          :aria-label="currentLocale === 'ru' ? 'Навигация по кейсам' : 'Case navigation'"
        >
          <button
            type="button"
            :aria-label="currentLocale === 'ru' ? 'Предыдущий кейс' : 'Previous case'"
            @click="move(-1, false)"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M9 5 4 10l5 5M4 10h12" /></svg>
          </button>
          <button
            type="button"
            :aria-label="currentLocale === 'ru' ? 'Следующий кейс' : 'Next case'"
            @click="move(1, false)"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m11 5 5 5-5 5M4 10h12" /></svg>
          </button>
        </div>
      </div>

      <Transition name="case-switch" mode="out-in">
        <article
          v-if="activeCase"
          :id="`case-panel-${activeIndex}`"
          :key="casePanelKey"
          class="vz-cases__active"
          role="tabpanel"
          :aria-labelledby="`case-tab-${activeIndex}`"
        >
          <Transition name="case-switch" mode="out-in">
            <CaseArtifactVisual
              :key="activeCase.id"
              :project="activeCase"
              :index-label="two(activeIndex + 1)"
              :locale="currentLocale"
            />
          </Transition>

          <footer class="vz-cases__caption">
            <div class="vz-cases__identity">
              <Transition name="case-copy" mode="out-in">
                <h3 :key="`case-title-${activeCase.id}`">{{ activeCase.name }}</h3>
              </Transition>
            </div>
            <div :key="`case-meta-${activeCase.id}`" class="vz-cases__meta-layout">
              <dl class="vz-cases__facts">
                <div class="vz-cases__fact">
                  <dt>{{ metaLabels.format }}</dt>
                  <dd>{{ caseFormat(activeCase) }}</dd>
                </div>
                <div class="vz-cases__fact">
                  <dt>{{ metaLabels.product }}</dt>
                  <dd>{{ caseLabel(activeCase) }}</dd>
                </div>
                <div class="vz-cases__fact">
                  <dt>{{ metaLabels.client }}</dt>
                  <dd>{{ activeCase.industry || metaLabels.privateClient }}</dd>
                </div>
              </dl>

              <div class="vz-cases__brand" :aria-label="`${metaLabels.logo}: ${caseLabel(activeCase)}`">
                <img
                  v-if="caseLogoSrc(activeCase)"
                  :src="caseLogoSrc(activeCase)"
                  alt=""
                  aria-hidden="true"
                />
                <span v-else aria-hidden="true">{{ caseMonogram(activeCase) }}</span>
              </div>

              <div class="vz-cases__stack-card">
                <span>{{ metaLabels.stack }}</span>
                <strong>{{ caseStack(activeCase) }}</strong>
              </div>
            </div>
            <NuxtLink class="vz-cases__link" :to="`/cases/${activeCase.slug}`">
              {{ copy.open }}
              <svg aria-hidden="true" viewBox="0 0 20 20">
                <path d="M4 10h11M11 6l4 4-4 4" />
              </svg>
            </NuxtLink>
          </footer>
        </article>
      </Transition>
    </div>

    <div v-else class="vz-cases__empty" role="status">
      <span>00</span>
      <p>{{ copy.empty }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import CaseArtifactVisual from "~/components/cases/CaseArtifactVisual.vue";
import type { IProjects } from "~/utils/interfaces/IProjects";
import { mergeFeaturedProjects, moveCaseIndex } from "~/utils/landingCases";

const props = defineProps<{
  projects: IProjects[];
  fallback: IProjects[];
  copy: {
    label: string;
    title: string;
    intro: string;
    tabAria: string;
    open: string;
    proof: string;
    empty: string;
  };
}>();

const { locale } = useI18n();
const currentLocale = computed<"ru" | "en">(() => locale.value === "ru" ? "ru" : "en");
const activeIndex = ref(0);

const cases = computed(() => mergeFeaturedProjects(props.projects, props.fallback));
const activeCase = computed(() => cases.value[activeIndex.value]);
const desktopMediaQuery = "(min-width: 901px)";
const isDesktop = ref(import.meta.client ? window.matchMedia(desktopMediaQuery).matches : true);
const casePanelKey = computed(() => isDesktop.value
  ? "desktop-case-panel"
  : `case-panel-${activeCase.value?.id ?? activeIndex.value}`);
const two = (value: number) => value.toString().padStart(2, "0");

let desktopMedia: MediaQueryList | undefined;

function onDesktopMediaChange(event: MediaQueryListEvent) {
  isDesktop.value = event.matches;
}

onMounted(() => {
  desktopMedia = window.matchMedia(desktopMediaQuery);
  isDesktop.value = desktopMedia.matches;
  desktopMedia.addEventListener("change", onDesktopMediaChange);
});

onBeforeUnmount(() => {
  desktopMedia?.removeEventListener("change", onDesktopMediaChange);
});

const labelsBySlug: Record<string, { ru: string; en: string }> = {
  "wellness-app": { ru: "Wellness App", en: "Wellness App" },
  "restaurant-menu": { ru: "Заказ в Telegram", en: "Telegram ordering" },
  "ai-support": { ru: "AI-поддержка", en: "AI support" },
  "crm-workspace": { ru: "CRM", en: "CRM" },
};

const formatsBySlug: Record<string, string> = {
  "wellness-app": "PWA",
  "restaurant-menu": "Telegram Mini App",
  "ai-support": "AI / Automation",
  "crm-workspace": "Corporate System",
};

const logosBySlug: Record<string, string> = {
  "wellness-app": "/cases/wellness-app/wellness-mark.svg",
};

const stacksBySlug: Record<string, string> = {
  "wellness-app": "Vue 3 / Vite",
  "restaurant-menu": "Vue 3 / FastAPI",
  "ai-support": "LLM / Vector Search",
  "crm-workspace": "Nuxt / PostgreSQL",
};

const metaLabels = computed(() => currentLocale.value === "ru"
  ? { format: "Формат", product: "Продукт", client: "Заказчик", logo: "Логотип", stack: "Стек", privateClient: "Частный заказчик" }
  : { format: "Format", product: "Product", client: "Client", logo: "Logo", stack: "Stack", privateClient: "Private client" });

function caseLabel(project: IProjects) {
  const slug = project.slug || "";
  return labelsBySlug[slug]?.[currentLocale.value] || project.name;
}

function caseFormat(project: IProjects) {
  const slug = project.slug || "";
  return formatsBySlug[slug] || project.type;
}

function caseLogoSrc(project: IProjects) {
  return logosBySlug[project.slug || ""] || "";
}

function caseStack(project: IProjects) {
  return stacksBySlug[project.slug || ""] || "Web / API";
}

function caseMonogram(project: IProjects) {
  const words = caseLabel(project).split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0]?.slice(0, 3).toUpperCase() || "VZ";
  return words.slice(0, 3).map((word) => word[0]).join("").toUpperCase();
}

function alignActiveTabToStart(index: number) {
  if (!window.matchMedia("(max-width: 900px)").matches) return;

  const tab = document.getElementById(`case-tab-${index}`);
  const tabList = tab?.closest<HTMLElement>(".vz-cases__tabs");
  if (!tab || !tabList) return;

  const tabRect = tab.getBoundingClientRect();
  const listRect = tabList.getBoundingClientRect();
  const gap = Number.parseFloat(window.getComputedStyle(tabList).columnGap) || 0;
  const trailingSpace = Math.max(0, tabList.clientWidth - tabRect.width - gap);
  const startLeft = tabList.scrollLeft + tabRect.left - listRect.left;

  tabList.style.setProperty("--vz-tabs-trailing-space", `${trailingSpace}px`);
  tabList.scrollTo({ left: Math.max(0, startLeft), behavior: "auto" });
}

function selectCase(index: number, focus = false) {
  activeIndex.value = index;
  nextTick(() => {
    const tab = document.getElementById(`case-tab-${index}`);
    if (focus) tab?.focus();
    alignActiveTabToStart(index);
  });
}

function move(direction: 1 | -1, focus = true) {
  selectCase(moveCaseIndex(activeIndex.value, direction, cases.value.length), focus);
}

function onTabsKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    move(1);
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    move(-1);
  } else if (event.key === "Home") {
    event.preventDefault();
    selectCase(0, true);
  } else if (event.key === "End") {
    event.preventDefault();
    selectCase(Math.max(cases.value.length - 1, 0), true);
  }
}

watch(cases, () => { if (activeIndex.value >= cases.value.length) activeIndex.value = 0; });
</script>

<style src="~/assets/css/landing-cases.css"></style>
