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
          ref="tabListRef"
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
            @click="selectCase(index, false, true)"
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
            @click="move(-1, false, true)"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M9 5 4 10l5 5M4 10h12" /></svg>
          </button>
          <button
            type="button"
            :aria-label="currentLocale === 'ru' ? 'Следующий кейс' : 'Next case'"
            @click="move(1, false, true)"
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
                <div
                  class="vz-cases__fact"
                  role="group"
                  tabindex="0"
                  :aria-label="`${metaLabels.format}: ${caseFormat(activeCase)}`"
                  :aria-describedby="`case-meta-format-${activeCase.id}`"
                >
                  <dt>{{ metaLabels.format }}</dt>
                  <dd>
                    <span class="vz-cases__meta-value">{{ caseFormat(activeCase) }}</span>
                    <span :id="`case-meta-format-${activeCase.id}`" class="vz-cases__meta-detail">{{ caseMetaDetail(activeCase, "format") }}</span>
                  </dd>
                </div>
                <div
                  class="vz-cases__fact"
                  role="group"
                  tabindex="0"
                  :aria-label="`${metaLabels.product}: ${caseLabel(activeCase)}`"
                  :aria-describedby="`case-meta-product-${activeCase.id}`"
                >
                  <dt>{{ metaLabels.product }}</dt>
                  <dd>
                    <span class="vz-cases__meta-value">{{ caseLabel(activeCase) }}</span>
                    <span :id="`case-meta-product-${activeCase.id}`" class="vz-cases__meta-detail">{{ caseMetaDetail(activeCase, "product") }}</span>
                  </dd>
                </div>
                <div
                  class="vz-cases__fact"
                  role="group"
                  tabindex="0"
                  :aria-label="`${metaLabels.client}: ${activeCase.industry || metaLabels.privateClient}`"
                  :aria-describedby="`case-meta-client-${activeCase.id}`"
                >
                  <dt>{{ metaLabels.client }}</dt>
                  <dd>
                    <span class="vz-cases__meta-value">{{ activeCase.industry || metaLabels.privateClient }}</span>
                    <span :id="`case-meta-client-${activeCase.id}`" class="vz-cases__meta-detail">{{ caseMetaDetail(activeCase, "client") }}</span>
                  </dd>
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

              <div
                class="vz-cases__stack-card"
                role="group"
                tabindex="0"
                :aria-label="`${metaLabels.stack}: ${caseStack(activeCase)}`"
                :aria-describedby="`case-meta-stack-${activeCase.id}`"
              >
                <span>{{ metaLabels.stack }}</span>
                <strong>
                  <span class="vz-cases__meta-value">{{ caseStack(activeCase) }}</span>
                  <span :id="`case-meta-stack-${activeCase.id}`" class="vz-cases__meta-detail">{{ caseMetaDetail(activeCase, "stack") }}</span>
                </strong>
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
import { getLandingPresentationScale } from "~/utils/threeRenderQuality";

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
const tabListRef = ref<HTMLElement | null>(null);

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
  void nextTick(() => keepActiveTabVisible(activeIndex.value));
}

function onTabsViewportResize() {
  keepActiveTabVisible(activeIndex.value);
}

onMounted(() => {
  desktopMedia = window.matchMedia(desktopMediaQuery);
  isDesktop.value = desktopMedia.matches;
  desktopMedia.addEventListener("change", onDesktopMediaChange);
  window.addEventListener("resize", onTabsViewportResize, { passive: true });
});

onBeforeUnmount(() => {
  desktopMedia?.removeEventListener("change", onDesktopMediaChange);
  window.removeEventListener("resize", onTabsViewportResize);
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

type CaseMetaField = "format" | "product" | "client" | "stack";

const metaDetailsBySlug: Record<string, Record<CaseMetaField, { ru: string; en: string }>> = {
  "wellness-app": {
    format: {
      ru: "PWA — сайт, который устанавливается как приложение.",
      en: "A PWA is a website installed and used like an app.",
    },
    product: {
      ru: "Wellness App — приложение для тренировок и здоровья.",
      en: "Wellness App is an app for workouts and health.",
    },
    client: {
      ru: "Заказчик — специалист по фитнесу и питанию.",
      en: "The client is a fitness and nutrition specialist.",
    },
    stack: {
      ru: "Vue 3 — интерфейс, Vite — сборка приложения.",
      en: "Vue 3 is the interface; Vite builds the app.",
    },
  },
  "restaurant-menu": {
    format: {
      ru: "Mini App — приложение внутри Telegram.",
      en: "A Mini App runs inside Telegram.",
    },
    product: {
      ru: "Сервис для выбора блюд и оформления заказа.",
      en: "A service for choosing dishes and placing an order.",
    },
    client: {
      ru: "Заказчик — ресторанный бизнес.",
      en: "The client is a restaurant business.",
    },
    stack: {
      ru: "Vue 3 — интерфейс, FastAPI — сервер.",
      en: "Vue 3 is the interface; FastAPI is the server.",
    },
  },
  "ai-support": {
    format: {
      ru: "AI-автоматизация — передача рутинных задач нейросети.",
      en: "AI automation delegates routine tasks to an AI model.",
    },
    product: {
      ru: "AI-поддержка — помощник для клиентов и операторов.",
      en: "AI support assists customers and operators.",
    },
    client: {
      ru: "Заказчик — команда клиентского сервиса.",
      en: "The client is a customer service team.",
    },
    stack: {
      ru: "LLM понимает запрос, Vector Search ищет ответ.",
      en: "The LLM reads the request; Vector Search finds the answer.",
    },
  },
  "crm-workspace": {
    format: {
      ru: "Корпоративная система — внутренний рабочий сервис.",
      en: "A corporate system is an internal work service.",
    },
    product: {
      ru: "CRM — система для сделок, задач и клиентов.",
      en: "A CRM manages deals, tasks and customers.",
    },
    client: {
      ru: "Заказчик — B2B-компания и отдел продаж.",
      en: "The client is a B2B company and its sales team.",
    },
    stack: {
      ru: "Nuxt — приложение, PostgreSQL — хранение данных.",
      en: "Nuxt powers the app; PostgreSQL stores the data.",
    },
  },
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

function caseMetaDetail(project: IProjects, field: CaseMetaField) {
  const ru = currentLocale.value === "ru";
  const detail = metaDetailsBySlug[project.slug || ""]?.[field];
  if (detail) return detail[currentLocale.value];

  if (field === "format") {
    const format = caseFormat(project);
    return ru ? `${format} — способ запуска и использования продукта.` : `${format} is how the product launches and is used.`;
  }
  if (field === "product") {
    const product = caseLabel(project);
    return ru ? `${product} — цифровой продукт, созданный для задачи клиента.` : `${product} is a digital product built for the client's task.`;
  }
  if (field === "client") {
    const industry = project.industry || metaLabels.value.privateClient;
    return ru ? `Заказчик работает в сфере ${industry}.` : `The client works in ${industry}.`;
  }
  const stack = caseStack(project);
  return ru
    ? `${stack} — технологии, на которых работает продукт.`
    : `${stack} is the technology behind the product.`;
}

function caseMonogram(project: IProjects) {
  const words = caseLabel(project).split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0]?.slice(0, 3).toUpperCase() || "VZ";
  return words.slice(0, 3).map((word) => word[0]).join("").toUpperCase();
}

function keepActiveTabVisible(index: number, animate = false) {
  const tabList = tabListRef.value;
  const tab = tabList?.querySelector<HTMLElement>(`#case-tab-${index}`);
  if (!tab || !tabList) return;

  const tabRect = tab.getBoundingClientRect();
  const listRect = tabList.getBoundingClientRect();
  const gap = Number.parseFloat(window.getComputedStyle(tabList).columnGap) || 0;
  const presentationScale = getLandingPresentationScale(tabList);
  const tabWidth = tabRect.width / presentationScale;
  const tabLeft = tabList.scrollLeft + (tabRect.left - listRect.left) / presentationScale;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!window.matchMedia("(max-width: 900px)").matches) {
    tabList.style.removeProperty("--vz-tabs-trailing-space");
    const edge = Math.max(12, gap);
    const tabRight = tabLeft + tabWidth;
    const visibleLeft = tabList.scrollLeft + edge;
    const visibleRight = tabList.scrollLeft + tabList.clientWidth - edge;
    let nextLeft = tabList.scrollLeft;

    if (tabLeft < visibleLeft) nextLeft = tabLeft - edge;
    else if (tabRight > visibleRight) nextLeft = tabRight - tabList.clientWidth + edge;
    else return;

    const maxScroll = Math.max(0, tabList.scrollWidth - tabList.clientWidth);
    tabList.scrollTo({
      left: Math.max(0, Math.min(maxScroll, nextLeft)),
      behavior: animate && !reduceMotion ? "smooth" : "auto",
    });
    return;
  }

  const trailingSpace = Math.max(0, tabList.clientWidth - tabWidth - gap);

  tabList.style.setProperty("--vz-tabs-trailing-space", `${trailingSpace}px`);
  tabList.scrollTo({
    left: Math.max(0, tabLeft),
    behavior: animate && !reduceMotion ? "smooth" : "auto",
  });
}

function selectCase(index: number, focus = false, animate = false) {
  activeIndex.value = index;
  nextTick(() => {
    const tab = tabListRef.value?.querySelector<HTMLElement>(`#case-tab-${index}`);
    if (focus) tab?.focus();
    keepActiveTabVisible(index, animate);
  });
}

function move(direction: 1 | -1, focus = true, animate = false) {
  selectCase(moveCaseIndex(activeIndex.value, direction, cases.value.length), focus, animate);
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

watch(cases, async () => {
  if (activeIndex.value >= cases.value.length) activeIndex.value = 0;
  await nextTick();
  keepActiveTabVisible(activeIndex.value);
});
</script>

<style src="~/assets/css/landing-cases.css"></style>
