import type { IProjectDetail } from "./interfaces/IProjects";
import { getWellnessCaseBlocks } from "./wellnessCaseBuilder";

type LocaleCode = "ru" | "en";

// Only real project content may be used when the API is unavailable.
export function getCaseFallbacks(locale: LocaleCode): IProjectDetail[] {
  const ru = locale === "ru";
  return [
    {
      id: "wellness-app", slug: "wellness-app", sort_order: 0, is_featured: true,
      type: "PRODUCT DESIGN / PWA", name: "WELLNESS APP",
      subtitle: ru ? "Тренировка, прогрессия и питание — в одном локальном PWA." : "Workout, progression and nutrition in one local-first PWA.",
      industry: "Fitness & Nutrition", description: ru ? "Последовательная домашняя тренировка, прогрессия нагрузки, рецепты и дневные меню в одном компактном продукте." : "A gated home workout, load progression, recipes and daily menus in one focused product.",
      image_url: "/cases/wellness-app/wellness-promo-poster.jpg", cover_image_url: "/cases/wellness-app/wellness-promo-poster.jpg", project_url: null, hero_metric_value: "2×1", hero_metric_label: ru ? "единый ежедневный сценарий" : "one daily system",
      year: "2026", timeline: "Vue 3 / Local-first",
      challenge: ru ? "Расширить личный тренировочный инструмент, не превратив его в тяжёлый wellness-комбайн." : "Expand a personal workout tool without turning it into a heavy wellness suite.",
      solution: ru ? "Мы выстроили продукт как последовательность состояний: один текущий шаг, автоматизированный отдых и прогрессия, затем меню и рецепты в том же ритме." : "We shaped the product as a sequence of states: one current action, automated recovery and progression, then menus and recipes in the same rhythm.",
      result_summary: ru ? "Личный трекер вырос в цельную систему ежедневного использования, сохранив локальные данные и компактную навигацию." : "A personal tracker grew into one coherent daily system while preserving local data and focused navigation.",
      testimonial: null, testimonial_author: null,
      metrics: [
        { value: "04", label: ru ? "последовательных блока" : "gated workout blocks", context: ru ? "Пресс → сила → удары → растяжка" : "Abs → strength → strikes → stretch", sort_order: 0 },
        { value: "5×7", label: ru ? "силовой цикл" : "strength sequence", context: ru ? "Пять кругов по семь упражнений" : "Five rounds of seven exercises", sort_order: 1 },
        { value: "03", label: ru ? "занятия до шага прогрессии" : "sessions per progression step", context: ru ? "Новая ступень нагрузки" : "A new load step", sort_order: 2 },
        { value: "LOCAL", label: ru ? "состояние на устройстве" : "on-device state", context: ru ? "Быстрый возврат к сценарию" : "Immediate return to the flow", sort_order: 3 },
      ],
      gallery: [], technologies: [
        { label: "Vue 3 + Vite", category: "CLIENT", sort_order: 0 },
        { label: "LocalStorage", category: "STATE", sort_order: 1 },
        { label: "Wake Lock + WebAudio", category: "DEVICE", sort_order: 2 },
        { label: "Node 22 Proxy", category: "SERVER", sort_order: 3 },
        { label: "Open Food Facts", category: "DATA", sort_order: 4 },
        { label: "Docker", category: "DELIVERY", sort_order: 5 },
      ],
      blocks: getWellnessCaseBlocks(locale),
      seo_noindex: true,
    },
  ];
}
