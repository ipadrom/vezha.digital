export type WellnessLocale = "ru" | "en";

export interface WellnessScreen {
  src: string;
  alt: string;
  caption: string;
}

export interface WellnessChapter {
  id: "workout" | "food";
  number: string;
  eyebrow: string;
  title: string;
  lead: string;
  points: string[];
  screens: WellnessScreen[];
}

export interface WellnessEvolutionStage {
  label: string;
  title: string;
  points: string[];
}

export interface WellnessCaseContent {
  demoLabel: string;
  evidenceTitle: string;
  evidenceLead: string;
  evolution: {
    eyebrow: string;
    title: string;
    before: WellnessEvolutionStage;
    after: WellnessEvolutionStage;
  };
  chapters: WellnessChapter[];
  technical: { eyebrow: string; title: string; lead: string };
  conclusion: { eyebrow: string; title: string; lead: string };
}

export function getWellnessCaseContent(locale: WellnessLocale): WellnessCaseContent {
  const ru = locale === "ru";

  return {
    demoLabel: ru
      ? "Демонстрационные KPI — временные значения для просмотра композиции кейса."
      : "Demonstration KPIs — temporary values used to preview the case composition.",
    evidenceTitle: ru ? "Показатели продукта" : "Product indicators",
    evidenceLead: ru
      ? "Пока продукт обезличен, цифры показывают формат будущего доказательного блока, а не подтверждённый результат."
      : "While the product remains anonymous, the figures demonstrate the future evidence block rather than verified results.",
    evolution: {
      eyebrow: ru ? "01 / Эволюция" : "01 / Evolution",
      title: ru ? "Из личного инструмента — в цельный ежедневный продукт" : "From a personal tool to one coherent daily product",
      before: {
        label: ru ? "До / компактная PWA" : "Before / compact PWA",
        title: ru ? "Трекер закрывал одну тренировку" : "A tracker handled one workout",
        points: ru
          ? ["Линейный сценарий упражнений", "Разрозненные экраны прогресса", "Питание оставалось вне продукта"]
          : ["A linear exercise flow", "Separate progress screens", "Nutrition lived outside the product"],
      },
      after: {
        label: ru ? "После / Vue-продукт" : "After / Vue product",
        title: ru ? "Одна система связывает действие и привычку" : "One system connects action and habit",
        points: ru
          ? ["Тренировка, таймеры и прогрессия", "Рецепты, порции и КБЖУ", "Дневные меню в общем мобильном ритме"]
          : ["Workouts, timers and progression", "Recipes, servings and macros", "Daily menus in one mobile rhythm"],
      },
    },
    chapters: [
      {
        id: "workout",
        number: "02",
        eyebrow: ru ? "Продуктовый модуль" : "Product module",
        title: ru ? "Тренировка ведёт пользователя, а не требует контроля" : "The workout guides the user instead of asking for supervision",
        lead: ru
          ? "Сценарий удерживает фокус на текущем действии: показывает порядок блоков, регулирует отдых и сохраняет рабочую нагрузку."
          : "The flow keeps attention on the current action: it exposes the sequence, manages rest and preserves working load.",
        points: ru
          ? ["Пошаговая программа с отдельными типами нагрузки", "Полноэкранный таймер со звуком и вибрацией", "Прогрессия повторений и веса без таблиц"]
          : ["Step-by-step program across load types", "Full-screen timer with sound and vibration", "Rep and weight progression without spreadsheets"],
        screens: [
          { src: "/cases/wellness-app/screen-workout-home.png", alt: ru ? "Главный экран тренировки с программой упражнений" : "Workout home with the exercise program", caption: ru ? "Программа дня" : "Daily program" },
          { src: "/cases/wellness-app/screen-progression.png", alt: ru ? "Экран прогрессии нагрузки и веса" : "Load and weight progression screen", caption: ru ? "Прогрессия" : "Progression" },
          { src: "/cases/wellness-app/screen-timer.png", alt: ru ? "Полноэкранный таймер отдыха" : "Full-screen rest timer", caption: ru ? "Контекстный таймер" : "Contextual timer" },
        ],
      },
      {
        id: "food",
        number: "03",
        eyebrow: ru ? "Продуктовый модуль" : "Product module",
        title: ru ? "Питание превращено из заметок в рабочую систему" : "Nutrition moves from notes into a working system",
        lead: ru
          ? "Библиотека рецептов, расчёт порций и дневные меню работают как продолжение тренировочного сценария."
          : "The recipe library, serving calculations and daily menus act as a continuation of the workout flow.",
        points: ru
          ? ["Рецепты сгруппированы по роли в рационе", "КБЖУ рассчитывается на порцию", "Меню собирает блюда и итог дня в одном экране"]
          : ["Recipes grouped by their role in the diet", "Macros calculated per serving", "Menus combine dishes and daily totals in one view"],
        screens: [
          { src: "/cases/wellness-app/screen-food-home.png", alt: ru ? "Библиотека рецептов с категориями и КБЖУ" : "Recipe library with categories and macros", caption: ru ? "Библиотека" : "Library" },
          { src: "/cases/wellness-app/screen-recipe.png", alt: ru ? "Страница рецепта с пищевой ценностью" : "Recipe page with nutrition values", caption: ru ? "Рецепт и порции" : "Recipe and servings" },
          { src: "/cases/wellness-app/screen-daily-menu.png", alt: ru ? "Дневное меню с итоговыми КБЖУ" : "Daily menu with macro totals", caption: ru ? "Рацион на день" : "Daily plan" },
        ],
      },
    ],
    technical: {
      eyebrow: ru ? "04 / Технический контур" : "04 / Technical dossier",
      title: ru ? "Local-first основа и возможности устройства" : "A local-first core with device capabilities",
      lead: ru
        ? "Vue 3 отвечает за цельный интерфейс, локальное хранение — за быстрый ежедневный доступ, а системные API поддерживают таймеры даже в активной тренировке."
        : "Vue 3 provides the unified interface, local storage keeps daily access immediate, and device APIs support active workout timers.",
    },
    conclusion: {
      eyebrow: ru ? "05 / Итог" : "05 / Outcome",
      title: ru ? "Не набор функций, а один ритм заботы о себе" : "Not a feature set, but one rhythm of self-care",
      lead: ru
        ? "Эволюция продукта построена вокруг повторяемого дня: спланировать, выполнить, восстановиться и увидеть прогресс — без переключения между сервисами."
        : "The product evolution follows a repeatable day: plan, perform, recover and see progress without switching between services.",
    },
  };
}
