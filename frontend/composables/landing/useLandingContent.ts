import { computed, ref } from "vue";
import type { IAdvantages } from "~/utils/interfaces/IAdvantages";
import type { IProjects } from "~/utils/interfaces/IProjects";
import type { IServices } from "~/utils/interfaces/IServices";
import type { ISettings } from "~/utils/interfaces/ISettings";
import type { ITechStack } from "~/utils/interfaces/ITechStack";
import enMessagesRaw from "~/locales/en.json?raw";
import ruMessagesRaw from "~/locales/ru.json?raw";
import { getCaseFallbacks } from "~/utils/caseFallbacks";

export type StackGroup = {
  title: string;
  description: string;
  items: string[];
};

export type DisplayService = {
  n: string;
  title: string;
  desc: string;
  meta: string[];
};

export type ClientSegment = {
  key: string;
  label: string;
  eyebrow: string;
  title: string;
  text: string;
};

export type LocaleCode = "ru" | "en";

export type NavItem = {
  href: string;
  label: string;
};


export type LandingCopy = {
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
    casesLink: string;
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
    navLabels: string[];
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
    copied: string;
    copyEmailAria: string;
    copyPhoneAria: string;
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

export function useLandingContent() {
  const {
    getServices,
    getProjects,
    getAdvantages,
    getTechStack,
    getSettings,
  } = useApi();
  const { locale } = useI18n();

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

  const displayServices = computed<DisplayService[]>(() => {
    if (!services.value.length) return fallbackServices.value;

    return services.value.slice(0, 8).map((service, index) => ({
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

  const contactEmail = computed(() => settings.value?.contact_email || "contact@vezha.digital");

  function toNumber(value: number) {
    return value.toString().padStart(2, "0");
  }

  function clampStackIndex(index: number, length = displayStackGroups.value.length) {
    return Math.max(0, Math.min(Math.max(0, length - 1), index));
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

  return {
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
  };
}
