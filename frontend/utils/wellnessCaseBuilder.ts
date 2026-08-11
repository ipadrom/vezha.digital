import type { IProjectBlock } from "./interfaces/IProjects";

type WellnessLocale = "ru" | "en";

const screens = "/cases/wellness-app";

const settings = (
  theme: "paper" | "soft" | "ink" | "signal" = "paper",
  extra: Record<string, unknown> = {},
) => ({
  theme,
  width: "wide" as const,
  spacing: "normal" as const,
  layout: "default",
  alignment: "left" as const,
  desktop_span: 12,
  desktop_start: 0,
  tablet_span: 12,
  tablet_start: 0,
  mobile_span: 12,
  mobile_start: 0,
  ...extra,
});

export function getWellnessCaseBlocks(locale: WellnessLocale): IProjectBlock[] {
  const ru = locale === "ru";
  const block = (
    id: string,
    type: IProjectBlock["type"],
    content: Record<string, any>,
    order: number,
    blockSettings = settings(),
  ): IProjectBlock => ({
    id: `wellness-${id}`,
    type,
    content,
    settings: blockSettings,
    sort_order: order,
  });

  return [
    block("hero", "hero", {
      logo_url: `${screens}/wellness-mark.svg`,
      eyebrow: ru ? "VEZHA / ПРОДУКТОВЫЙ КЕЙС" : "VEZHA / PRODUCT CASE",
      title: "WELLNESS APP",
      subtitle: ru
        ? "Ежедневный ритм, в котором тренировка, прогресс и питание работают как одна система."
        : "A daily rhythm where workouts, progress and nutrition work as one system.",
      type_label: ru ? "PRODUCT DESIGN / FRONTEND" : "PRODUCT DESIGN / FRONTEND",
      industry: "WELLNESS & SPORTS",
      timeline: ru ? "PWA → VUE 3" : "PWA → VUE 3",
      year: "2026",
      image_url: `${screens}/hero-hand-device-v2.png`,
      image_alt: ru
        ? "Wellness-приложение на экране смартфона"
        : "Wellness application shown on a smartphone",
      device_screen_url: `${screens}/screen-timer.png`,
      metric_value: "2×1",
      metric_label: ru ? "тренировки + питание" : "workouts + nutrition",
    }, 0, settings("paper", { spacing: "large" })),

    block("context", "text", {
      eyebrow: ru ? "Контекст продукта" : "Product context",
      title: ru
        ? "Приложение выросло из персонального трекера в систему на каждый день."
        : "The app grew from a personal tracker into an everyday system.",
      body: ru
        ? "Первая версия помогала пройти тренировку: показывала порядок упражнений, держала таймер и сохраняла нагрузку. Но реальный день пользователя не заканчивался последним подходом.\n\nМы связали тренировочный контур с питанием, рецептами, порциями и дневным меню — без перегруженного дашборда и переключения между сервисами."
        : "The first version helped complete a workout: it exposed the exercise order, kept the timer and saved the working load. But the user’s real day did not end with the final set.\n\nWe connected the workout flow with nutrition, recipes, servings and daily menus — without an overloaded dashboard or service switching.",
    }, 1, settings("soft", { spacing: "large", anchor: "story" })),

    block("video", "video", {
      eyebrow: ru ? "Продукт в движении" : "Product in motion",
      title: ru ? "Один ритм — от плана до восстановления" : "One rhythm — from planning to recovery",
      video_url: `${screens}/wellness-promo.mp4`,
      poster_url: `${screens}/wellness-promo-poster.jpg`,
      caption: ru
        ? "Короткий обзор тренировочного и пищевого сценариев"
        : "A short view of the workout and nutrition flows",
    }, 2, settings("paper", { width: "full", spacing: "compact", layout: "cinematic" })),

    block("facts", "metrics", {
      eyebrow: ru ? "Факты продукта" : "Product facts",
      title: ru
        ? "Масштаб решения — в реализованных сценариях, а не в рекламных процентах."
        : "The solution is measured in working flows, not advertising percentages.",
      summary: ru
        ? "Показываем только то, что подтверждено текущим продуктом."
        : "Only facts confirmed by the current product are shown.",
      items: [
        { value: "02", label: ru ? "связанных контура" : "connected flows", context: ru ? "Тренировки и питание" : "Workouts and nutrition" },
        { value: "06", label: ru ? "ключевых экранов" : "core screens", context: ru ? "Показаны в кейсе" : "Shown in the case" },
        { value: "PWA", label: ru ? "мобильный формат" : "mobile format", context: ru ? "Установка из браузера" : "Installable from the browser" },
        { value: "LOCAL", label: ru ? "данные под рукой" : "data close at hand", context: ru ? "Local-first состояние" : "Local-first state" },
      ],
    }, 3, settings("paper", { anchor: "evidence" })),

    block("challenge", "challenge_solution", {
      eyebrow: ru ? "Задача и решение" : "Challenge and solution",
      title: ru
        ? "Убрать разрыв между тренировкой и остальным днём."
        : "Remove the gap between a workout and the rest of the day.",
      challenge_label: ru ? "Исходная версия" : "Starting point",
      challenge: ru
        ? "Компактная PWA закрывала один линейный сценарий. Прогресс жил в отдельных экранах, питание — вне продукта, а пользователю приходилось собирать контекст самому."
        : "The compact PWA covered one linear flow. Progress lived on separate screens, nutrition outside the product, and the user had to reconstruct the context.",
      solution_label: ru ? "Новая система" : "New system",
      solution: ru
        ? "Компонентное Vue-приложение объединило план, активную тренировку, прогрессию, рецепты и дневной рацион в понятный повторяемый цикл."
        : "A component-based Vue application united planning, active workouts, progression, recipes and daily nutrition into one repeatable cycle.",
    }, 4, settings("soft", { spacing: "large" })),

    block("process", "process", {
      eyebrow: ru ? "Как строили продукт" : "How the product was shaped",
      title: ru ? "Четыре шага от полезного инструмента к цельному опыту." : "Four steps from a useful tool to a coherent experience.",
      items: [
        {
          title: ru ? "Разобрали ежедневный сценарий" : "Mapped the daily scenario",
          description: ru
            ? "Отделили обязательные действия от второстепенных и оставили на каждом экране один понятный следующий шаг."
            : "Separated essential actions from secondary ones and kept one clear next step on every screen.",
        },
        {
          title: ru ? "Собрали тренировочный контур" : "Built the workout loop",
          description: ru
            ? "Связали программу, типы нагрузки, таймер, завершение подхода и сохранение прогрессии."
            : "Connected the program, load types, timer, set completion and progression state.",
        },
        {
          title: ru ? "Добавили питание в тот же ритм" : "Brought nutrition into the same rhythm",
          description: ru
            ? "Рецепты, порции, КБЖУ и меню стали продолжением дня, а не отдельным калькулятором."
            : "Recipes, servings, macros and menus became a continuation of the day, not a separate calculator.",
        },
        {
          title: ru ? "Укрепили мобильную основу" : "Hardened the mobile foundation",
          description: ru
            ? "Перенесли интерфейс на Vue 3, сохранили local-first данные и подключили wake lock, звук и вибрацию."
            : "Moved the interface to Vue 3, retained local-first data and connected wake lock, sound and vibration.",
        },
      ],
    }, 5, settings("paper", { spacing: "large" })),

    block("workout-copy", "text", {
      eyebrow: ru ? "Тренировочный контур" : "Workout flow",
      title: ru
        ? "Во время занятия интерфейс не отвлекает — он ведёт."
        : "During a workout, the interface guides instead of distracting.",
      body: ru
        ? "Пользователь видит текущий блок, нужное упражнение и следующий переход. Таймер становится частью сценария, а прогрессия повторений и веса сохраняется без ручных таблиц.\n\nЗвук, вибрация и wake lock поддерживают занятие, когда внимание занято движением."
        : "The user sees the current block, the required exercise and the next transition. The timer becomes part of the flow, while rep and weight progression is preserved without manual spreadsheets.\n\nSound, vibration and wake lock support the session when attention is occupied by movement.",
    }, 6, settings("paper", { spacing: "large" })),

    block("workout-screens", "gallery", {
      eyebrow: ru ? "Интерфейс тренировки" : "Workout interface",
      title: ru ? "Программа, прогрессия и таймер в одном контексте." : "Program, progression and timer in one context.",
      items: [
        { image_url: `${screens}/screen-workout-home.png`, alt: ru ? "Программа тренировки" : "Workout program", caption: ru ? "Программа дня" : "Daily program" },
        { image_url: `${screens}/screen-progression.png`, alt: ru ? "Прогрессия нагрузки" : "Load progression", caption: ru ? "Прогрессия" : "Progression" },
        { image_url: `${screens}/screen-timer.png`, alt: ru ? "Таймер отдыха" : "Rest timer", caption: ru ? "Контекстный таймер" : "Contextual timer" },
      ],
    }, 7, settings("ink", { width: "full", spacing: "normal", layout: "phones" })),

    block("nutrition-copy", "text", {
      eyebrow: ru ? "Контур питания" : "Nutrition flow",
      title: ru
        ? "Питание перестало быть набором заметок и расчётов."
        : "Nutrition stopped being a collection of notes and calculations.",
      body: ru
        ? "Библиотека рецептов организована по роли блюда в рационе. Порции автоматически пересчитывают КБЖУ, а дневное меню сводит блюда и итог дня на одном экране.\n\nТак питание остаётся конкретным действием внутри общего плана, а не отдельной дисциплиной."
        : "The recipe library is organized by the dish’s role in the diet. Servings recalculate macros, while the daily menu combines dishes and totals in one view.\n\nNutrition remains a concrete action inside the common plan instead of a separate discipline.",
    }, 8, settings("soft", { spacing: "large" })),

    block("nutrition-screens", "gallery", {
      eyebrow: ru ? "Интерфейс питания" : "Nutrition interface",
      title: ru ? "От библиотеки рецептов — к собранному дню." : "From a recipe library to a complete day.",
      items: [
        { image_url: `${screens}/screen-food-home.png`, alt: ru ? "Библиотека рецептов" : "Recipe library", caption: ru ? "Библиотека" : "Library" },
        { image_url: `${screens}/screen-recipe.png`, alt: ru ? "Рецепт и пищевая ценность" : "Recipe and nutrition values", caption: ru ? "Рецепт и порции" : "Recipe and servings" },
        { image_url: `${screens}/screen-daily-menu.png`, alt: ru ? "Дневное меню" : "Daily menu", caption: ru ? "Рацион на день" : "Daily plan" },
      ],
    }, 9, settings("ink", { width: "full", spacing: "normal", layout: "phones" })),

    block("technologies", "technologies", {
      eyebrow: ru ? "Технический контур" : "Technical contour",
      title: "PRODUCT / PWA / VUE",
      summary: ru
        ? "Архитектура поддерживает быстрый ежедневный доступ и возможности мобильного устройства."
        : "The architecture supports immediate daily access and mobile device capabilities.",
      items: [
        { label: "Vue 3 + Vite", category: "CLIENT", x: 18, y: 20 },
        { label: "PWA / Local-first", category: "CLIENT", x: 30, y: 78 },
        { label: "Sound + Vibration", category: "DEVICE", x: 82, y: 20 },
        { label: "Wake Lock", category: "DEVICE", x: 70, y: 78 },
        { label: "Open Food Facts", category: "DATA", x: 25, y: 48 },
        { label: "Docker", category: "DELIVERY", x: 78, y: 48 },
      ],
    }, 10, settings("ink", {
      width: "full",
      spacing: "compact",
      layout: "map",
      anchor: "technical",
      map_accent: "#ad9cff",
      map_background: "#151826",
      map_text: "#f7f8ff",
    })),

    block("result", "results", {
      eyebrow: ru ? "Итог" : "Outcome",
      title: ru
        ? "Не набор функций, а один повторяемый ритм заботы о себе."
        : "Not a feature set, but one repeatable rhythm of self-care.",
      body: ru
        ? "Пользователь может спланировать занятие, выполнить его, восстановиться и собрать питание на день, не меняя инструменты и не теряя контекст. Продукт остаётся компактным, но воспринимается как единая система."
        : "The user can plan a session, complete it, recover and assemble daily nutrition without changing tools or losing context. The product stays compact while feeling like one system.",
      link_url: "",
      link_label: "",
    }, 11, settings("signal", { spacing: "large" })),

    block("next", "next_case", {
      eyebrow: ru ? "Следующий шаг" : "Next step",
      title: ru ? "Посмотреть другие проекты" : "Explore more projects",
      case_slug: "",
      cta_label: ru ? "К галерее кейсов" : "Back to case gallery",
    }, 12, settings("soft", { spacing: "large" })),
  ];
}
