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
        ? "Превращаем персональный трекер тренировок в цельный ежедневный опыт — от первого подхода до собранного рациона."
        : "Turning a personal workout tracker into a connected daily experience — from the first set to a complete meal plan.",
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
      metric_label: ru ? "связанных контура" : "connected flows",
    }, 0, settings("paper", { spacing: "large" })),

    block("context", "text", {
      eyebrow: ru ? "О проекте" : "About the project",
      title: ru
        ? "Один продукт для той части дня, которая раньше жила в разных инструментах."
        : "One product for the part of the day that used to live across different tools.",
      body: ru
        ? "WELLNESS APP начинался как компактный инструмент для прохождения тренировки: программа держала порядок упражнений, таймер — ритм отдыха, а прогрессия — историю нагрузки. По мере использования стало ясно, что полезный сценарий обрывается слишком рано: после последнего подхода питание, рецепты и план дня снова расходятся по заметкам и другим сервисам.\n\nМы расширили продукт вокруг реального пользовательского дня. Тренировочный контур и сценарии питания получили общую логику, единый визуальный язык и понятные переходы, сохранив компактность первоначальной PWA."
        : "WELLNESS APP began as a compact workout companion: the program held the exercise order, the timer kept the pace of recovery, and progression stored the history of each load. With regular use, it became clear that the useful journey ended too early. After the final set, nutrition, recipes and the plan for the day scattered across notes and other services.\n\nWe expanded the product around the user’s real day. Workout and nutrition flows gained shared logic, one visual language and clear transitions while preserving the focus of the original PWA.",
    }, 1, settings("soft", { spacing: "large", anchor: "story" })),

    block("video", "media_hero", {
      video_url: `${screens}/wellness-promo.mp4`,
      poster_url: `${screens}/wellness-promo-poster.jpg`,
      image_url: "",
      alt: ru ? "WELLNESS APP: тренировки, прогрессия и питание" : "WELLNESS APP: workouts, progression and nutrition",
      caption: ru
        ? "Как тренировка продолжается в прогрессии и питании"
        : "How a workout continues through progression and nutrition",
      autoplay: true,
      loop: true,
      muted: true,
      controls: false,
    }, 2, settings("ink", { width: "full", spacing: "compact", layout: "media-16x9" })),

    block("facts", "metrics", {
      eyebrow: ru ? "В основе решения" : "At the core",
      title: ru
        ? "Компактный продукт, собранный вокруг ежедневных действий."
        : "A focused product built around everyday actions.",
      summary: ru
        ? "Вместо разрозненных инструментов — два связанных пользовательских контура и шесть ключевых экранов."
        : "Instead of disconnected tools, the product brings together two user flows and six core screens.",
      items: [
        { value: "02", label: ru ? "основных сценария" : "core flows", context: ru ? "Тренировка + питание" : "Workout + nutrition" },
        { value: "06", label: ru ? "ключевых экранов" : "core screens", context: ru ? "От программы до меню" : "From program to meal plan" },
        { value: "PWA", label: ru ? "установка без стора" : "store-free install", context: ru ? "Запуск из браузера" : "Launched from the browser" },
        { value: "LOCAL", label: ru ? "состояние на устройстве" : "on-device state", context: ru ? "Быстрый повторный доступ" : "Fast return access" },
      ],
    }, 3, settings("paper", { anchor: "evidence" })),

    block("challenge", "challenge_solution", {
      eyebrow: ru ? "Задача" : "Challenge",
      title: ru
        ? "Расширить продукт, не превратив его в тяжёлый wellness-комбайн."
        : "Expand the product without turning it into an overloaded wellness suite.",
      challenge_label: ru ? "Что мешало" : "What stood in the way",
      challenge: ru
        ? "Первая версия уверенно вела только по тренировке. Прогрессия не складывалась в непрерывный путь, питание оставалось за пределами приложения, а каждый новый модуль мог сделать навигацию тяжелее."
        : "The first version confidently guided only the workout itself. Progression did not form a continuous journey, nutrition stayed outside the app, and every new module risked making navigation heavier.",
      solution_label: ru ? "Что сделали" : "What we did",
      solution: ru
        ? "Мы построили систему вокруг повторяемого дневного цикла: выбрать программу, пройти занятие, сохранить нагрузку, собрать блюда и увидеть итог дня. Все сценарии работают на одной компонентной основе и говорят одним визуальным языком."
        : "We shaped the system around a repeatable daily loop: choose a program, complete the session, save the load, assemble meals and see the day as a whole. Every flow runs on one component foundation and speaks the same visual language.",
    }, 4, settings("soft", { spacing: "large" })),

    block("process", "process", {
      eyebrow: ru ? "Наш процесс" : "Our process",
      title: ru ? "От карты дня — к целостному мобильному продукту." : "From mapping the day to a coherent mobile product.",
      items: [
        {
          title: ru ? "Разобрали ядро продукта" : "Mapped the product core",
          description: ru
            ? "Зафиксировали действия, которые уже приносили пользу, и нашли разрывы между программой, таймером, прогрессией и питанием."
            : "We identified the actions that already delivered value and found the gaps between the program, timer, progression and nutrition.",
        },
        {
          title: ru ? "Перестроили UX вокруг дня" : "Reframed the UX around the day",
          description: ru
            ? "Собрали последовательность экранов так, чтобы каждое состояние подсказывало один следующий шаг и не требовало возвращаться к дашборду."
            : "We arranged the screens so every state suggests one next action without sending the user back to a dashboard.",
        },
        {
          title: ru ? "Создали единую UI-систему" : "Created one UI system",
          description: ru
            ? "Перенесли тренировку и питание на общие компоненты, правила типографики и мобильную иерархию."
            : "We brought workout and nutrition flows onto shared components, typography rules and a common mobile hierarchy.",
        },
        {
          title: ru ? "Подготовили к реальному использованию" : "Prepared it for everyday use",
          description: ru
            ? "Сохранили local-first модель, добавили wake lock, звук и вибрацию и упаковали продукт в устанавливаемую PWA."
            : "We kept the local-first model, added wake lock, sound and vibration, and packaged the product as an installable PWA.",
        },
      ],
    }, 5, settings("paper", { spacing: "large" })),

    block("workout-copy", "text", {
      eyebrow: ru ? "Тренировочный опыт" : "Workout experience",
      title: ru
        ? "Интерфейс остаётся в фоне, пока пользователь движется."
        : "The interface stays in the background while the user moves.",
      body: ru
        ? "Во время тренировки внимание должно быть на движении, а не на навигации. Поэтому активный сценарий показывает только текущий блок, упражнение и ближайшее действие. Таймер встроен в паузу между подходами, а звук и вибрация позволяют не следить за экраном каждую секунду.\n\nПосле занятия веса и повторения остаются в истории прогрессии. Следующая тренировка начинается уже с контекста, а не с пустой формы."
        : "During a workout, attention belongs on movement rather than navigation. The active flow therefore shows only the current block, the exercise and the nearest action. The timer lives inside the pause between sets, while sound and vibration remove the need to watch the screen every second.\n\nWhen the session ends, weights and reps remain in progression history. The next workout begins with context instead of an empty form.",
    }, 6, settings("paper", { spacing: "large" })),

    block("workout-screens", "gallery", {
      eyebrow: ru ? "Ключевые экраны" : "Key screens",
      title: ru ? "Весь тренировочный путь без лишних переходов." : "The complete workout journey without unnecessary steps.",
      items: [
        { image_url: `${screens}/screen-workout-home.png`, alt: ru ? "Программа тренировки" : "Workout program", caption: ru ? "Программа и порядок блоков" : "Program and block order" },
        { image_url: `${screens}/screen-progression.png`, alt: ru ? "Прогрессия нагрузки" : "Load progression", caption: ru ? "История нагрузки" : "Load history" },
        { image_url: `${screens}/screen-timer.png`, alt: ru ? "Таймер отдыха" : "Rest timer", caption: ru ? "Отдых между подходами" : "Recovery between sets" },
      ],
    }, 7, settings("ink", { width: "full", spacing: "normal", layout: "phones" })),

    block("nutrition-copy", "text", {
      eyebrow: ru ? "Питание" : "Nutrition",
      title: ru
        ? "Рацион становится продолжением плана, а не отдельной задачей."
        : "Nutrition becomes a continuation of the plan, not a separate task.",
      body: ru
        ? "Мы не строили ещё один сложный счётчик калорий. Вместо этого организовали рецепты по роли в рационе, связали размер порции с КБЖУ и дали возможность собрать меню на день из уже понятных блюд.\n\nПользователь двигается от выбора рецепта к конкретной порции и видит итог дня в том же продукте, где только что закончил тренировку."
        : "We did not build another complicated calorie counter. Instead, recipes are organized by their role in the diet, serving size is connected to macros, and a daily menu can be assembled from familiar dishes.\n\nThe user moves from choosing a recipe to a specific serving and sees the whole day inside the same product where the workout just ended.",
    }, 8, settings("soft", { spacing: "large" })),

    block("nutrition-screens", "gallery", {
      eyebrow: ru ? "Ключевые экраны" : "Key screens",
      title: ru ? "От идеи блюда — к собранному меню дня." : "From a meal idea to a complete daily menu.",
      items: [
        { image_url: `${screens}/screen-food-home.png`, alt: ru ? "Библиотека рецептов" : "Recipe library", caption: ru ? "Рецепты по категориям" : "Recipes by category" },
        { image_url: `${screens}/screen-recipe.png`, alt: ru ? "Рецепт и пищевая ценность" : "Recipe and nutrition values", caption: ru ? "Порция и КБЖУ" : "Serving and macros" },
        { image_url: `${screens}/screen-daily-menu.png`, alt: ru ? "Дневное меню" : "Daily menu", caption: ru ? "Собранное меню дня" : "Complete daily menu" },
      ],
    }, 9, settings("ink", { width: "full", spacing: "normal", layout: "phones" })),

    block("technologies", "technologies", {
      eyebrow: ru ? "Технологии" : "Technologies",
      title: ru ? "Лёгкая PWA-основа с возможностями нативного устройства." : "A lightweight PWA foundation with native device capabilities.",
      summary: ru
        ? "Vue 3 и Vite держат компонентный интерфейс, local-first состояние ускоряет ежедневный доступ, а системные API поддерживают активный режим тренировки."
        : "Vue 3 and Vite power the component interface, local-first state keeps daily access fast, and device APIs support the active workout mode.",
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
      eyebrow: ru ? "Результат" : "Results",
      title: ru
        ? "WELLNESS APP превратился из одного полезного сценария в связанный продукт на каждый день."
        : "WELLNESS APP grew from one useful flow into a connected product for every day.",
      body: ru
        ? "Теперь пользователь может выбрать тренировку, пройти её с таймером, сохранить прогрессию и собрать питание на день, не меняя инструменты. Новая структура оставляет продукт быстрым и сфокусированным, но даёт ему пространство для развития — новых программ, рецептов и персональных сценариев."
        : "A user can now choose a workout, complete it with the timer, preserve progression and assemble the day’s nutrition without changing tools. The new structure keeps the product fast and focused while leaving room for new programs, recipes and personal flows.",
      link_url: "",
      link_label: "",
    }, 11, settings("signal", { spacing: "large" })),

    block("next", "next_case", {
      eyebrow: ru ? "Другие проекты" : "More work",
      title: ru ? "Продолжить знакомство с работами VEZHA" : "Continue exploring the work of VEZHA",
      case_slug: "",
      cta_label: ru ? "Смотреть все кейсы" : "View all cases",
    }, 12, settings("soft", { spacing: "large" })),
  ];
}
