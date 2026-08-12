import type { IProjectBlock } from "./interfaces/IProjects";

type WellnessLocale = "ru" | "en";

const assets = "/cases/wellness-app";

const settings = (
  theme: "paper" | "soft" | "ink" | "signal" = "paper",
  extra: Record<string, unknown> = {},
) => ({
  theme,
  width: "wide" as const,
  spacing: "normal" as const,
  layout: "default",
  alignment: "left" as const,
  surface: "card" as const,
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
  const pick = (ruValue: string, enValue: string) => ru ? ruValue : enValue;
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
      logo_url: `${assets}/training-mark.svg`,
      eyebrow: pick("VEZHA / ПРОДУКТОВЫЙ КЕЙС", "VEZHA / PRODUCT CASE"),
      title: "WELLNESS APP",
      subtitle: pick(
        "Тренировка, прогрессия и питание — в одном локальном PWA.",
        "Workout, progression and nutrition in one local-first PWA.",
      ),
      type_label: "PRODUCT DESIGN / PWA",
      industry: "FITNESS & NUTRITION",
      timeline: "VUE 3 / LOCAL-FIRST",
      year: "2026",
      image_url: `${assets}/wellness-promo-poster.jpg`,
      image_alt: pick("Мобильное приложение для тренировок и питания", "Mobile workout and nutrition application"),
      metric_value: "2×1",
      metric_label: pick("единый ежедневный сценарий", "one daily system"),
    }, 0, settings("paper", {
      spacing: "compact",
      hero_background: "#f1f0eb",
      hero_text: "#080808",
    })),

    block("video", "media_hero", {
      video_url: `${assets}/wellness-promo.mp4`,
      poster_url: `${assets}/wellness-promo-poster.jpg`,
      image_url: "",
      alt: pick(
        "WELLNESS APP: тренировка, восстановление и питание",
        "WELLNESS APP: workout, recovery and nutrition",
      ),
      caption: pick(
        "От первого действия — к собранному дню",
        "From the first action to a coherent day",
      ),
      autoplay: true,
      loop: true,
      muted: true,
      controls: false,
    }, 1, settings("ink", {
      width: "full",
      spacing: "compact",
      layout: "media-16x9",
    })),

    block("context", "text", {
      eyebrow: pick("О проекте", "About the project"),
      title: pick(
        "Один инструмент для той части дня, которая раньше распадалась на таймеры, заметки и таблицы.",
        "One tool for the part of the day that used to fragment across timers, notes and spreadsheets.",
      ),
      body: pick(
        "WELLNESS APP начинался как компактный трекер домашней круговой тренировки. Он держал порядок упражнений, считал отдых по реальному времени и сохранял нагрузку между занятиями. По мере развития продукта к тренировочному сценарию добавились прогрессия, техника упражнений, рецепты и меню на день.\n\nВместо набора независимых функций получилась одна последовательность: открыть план, пройти только доступный сейчас шаг, восстановиться, сохранить новую нагрузку и собрать питание без перехода в другой сервис.",
        "WELLNESS APP began as a compact home circuit workout tracker. It kept the exercise order, measured rest against wall-clock time and preserved load between sessions. As the product evolved, progression, exercise guidance, recipes and daily meal planning joined the workout flow.\n\nRather than a set of isolated features, the product became one sequence: open the plan, complete the one available step, recover, preserve the new load and plan nutrition without switching tools.",
      ),
    }, 2, settings("soft", {
      spacing: "large",
      anchor: "story",
      desktop_span: 6,
    })),

    block("facts", "metrics", {
      eyebrow: pick("Продукт в цифрах", "Product facts"),
      title: pick(
        "Компактная система, построенная вокруг повторяемого действия.",
        "A focused system built around a repeatable action.",
      ),
      summary: pick(
        "Без выдуманных KPI: только параметры, которые зафиксированы в работающем продукте.",
        "No invented KPIs — only parameters present in the working product.",
      ),
      items: [
        { value: "04", label: pick("последовательных блока", "gated workout blocks"), context: pick("Пресс → сила → удары → растяжка", "Abs → strength → strikes → stretch") },
        { value: "5×7", label: pick("силовой цикл", "strength sequence"), context: pick("Пять кругов по семь упражнений", "Five rounds of seven exercises") },
        { value: "03", label: pick("занятия до шага прогрессии", "sessions per progression step"), context: pick("Новая ступень нагрузки", "A new load step") },
        { value: "LOCAL", label: pick("состояние на устройстве", "on-device state"), context: pick("Быстрый возврат к сценарию", "Immediate return to the flow") },
      ],
    }, 3, settings("paper", {
      anchor: "evidence",
      surface: "plain",
      desktop_span: 6,
    })),

    block("challenge", "challenge_solution", {
      eyebrow: pick("Задача", "Challenge"),
      title: pick(
        "Расширить личный тренировочный инструмент, не превратив его в тяжёлый wellness-комбайн.",
        "Expand a personal workout tool without turning it into a heavy wellness suite.",
      ),
      challenge_label: pick("Что мешало", "What stood in the way"),
      challenge: pick(
        "Во время занятия нельзя требовать постоянной навигации и контроля экрана. При этом нагрузка должна расти последовательно, таймер — переживать уход приложения в фон, а питание — оставаться достаточно простым для ежедневного использования.",
        "A workout cannot demand constant navigation or screen attention. At the same time, load must progress coherently, timers must survive backgrounding, and nutrition must remain simple enough for daily use.",
      ),
      solution_label: pick("Что сделали", "What we did"),
      solution: pick(
        "Мы выстроили продукт как управляемую последовательность состояний. Интерфейс открывает только следующий доступный шаг, автоматизирует отдых и прогрессию, а после тренировки продолжает тот же ритм в меню, рецептах и расчёте КБЖУ.",
        "We shaped the product as a controlled sequence of states. The interface exposes only the next available action, automates recovery and progression, then carries the same rhythm into menus, recipes and macro calculations.",
      ),
    }, 4, settings("soft", {
      spacing: "large",
      surface: "plain",
    })),

    block("process", "process", {
      eyebrow: pick("Логика решения", "Solution logic"),
      title: pick(
        "Собрали интерфейс вокруг реального порядка действий — от первого блока до рациона.",
        "The interface follows the real order of actions — from the first block to the daily plan.",
      ),
      items: [
        {
          title: pick("Собрали день в одну систему", "Connected the day into one system"),
          description: pick(
            "Тренировка, таймер, прогрессия и питание получили общий ритм и одинаковую логику переходов. Пользователь всегда понимает текущее состояние и ближайшее действие.",
            "Workout, timer, progression and nutrition share one rhythm and the same transition logic. The current state and nearest action always stay clear.",
          ),
          image_url: `${assets}/system-flow.gif`,
          image_alt: pick("Тренировка и питание соединяются в единый сценарий WELLNESS APP", "Workout and nutrition connect into one WELLNESS APP flow"),
          media_size: "full",
          tags: [pick("Два контура", "Two flows"), pick("Один ритм", "One rhythm"), "LOCAL-FIRST"],
        },
        {
          title: pick("Открывали только следующий шаг", "Revealed only the next available step"),
          description: pick(
            "Пресс, силовая часть, удары и растяжка идут в фиксированном порядке. Неактивные блоки приглушены, а после выполнения интерфейс сам переводит фокус на ближайшее действие.",
            "Abs, strength, strikes and stretching follow a fixed order. Inactive blocks recede, and completing one step moves the interface focus to the next available action.",
          ),
          image_url: `${assets}/sequence-flow.gif`,
          image_alt: pick("Последовательное открытие доступных блоков тренировки", "Workout blocks unlocking in sequence"),
          media_size: "full",
          tags: [pick("Пошаговый сценарий", "Gated flow"), pick("Один фокус", "Single focus"), pick("Без дашборда", "No dashboard detour")],
        },
        {
          title: pick("Оставили подсказку внутри действия", "Kept guidance inside the action"),
          description: pick(
            "Техника упражнения открывается нижним листом поверх текущего контекста. Схема движения и короткая инструкция доступны именно в тот момент, когда они нужны, без выхода из тренировки.",
            "Exercise technique opens in a bottom sheet over the current context. The movement diagram and concise guidance appear exactly when needed without leaving the workout.",
          ),
          image_url: `${assets}/technique-flow.gif`,
          image_alt: pick("Открытие подсказки по технике поверх текущего упражнения", "Technique guidance opening over the current exercise"),
          media_size: "full",
          tags: ["BOTTOM SHEET", pick("Техника движения", "Movement guidance"), pick("Контекст сохранён", "Context preserved")],
        },
        {
          title: pick("Сделали восстановление частью потока", "Made recovery part of the flow"),
          description: pick(
            "Полноэкранный таймер считает отдых по реальному времени, поддерживает паузу и пропуск, а звук и вибрация сообщают о возврате к нагрузке.",
            "The full-screen wall-clock timer supports pause and skip, while sound and vibration signal the return to movement without constant screen checks.",
          ),
          image_url: `${assets}/recovery-flow.gif`,
          image_alt: pick("Таймер отдыха с паузой и возвращением к нагрузке", "Recovery timer with pause and return to movement"),
          media_size: "full",
          tags: ["WALL-CLOCK", "WAKE LOCK", pick("Звук + вибрация", "Sound + haptics")],
        },
        {
          title: pick("Связали повторения, вес и следующий цикл", "Connected reps, weight and the next cycle"),
          description: pick(
            "Каждые три завершённые тренировки продукт переводит программу на следующую ступень. После потолка повторений добавляется вес, а ручная корректировка оставляет пользователю контроль над фактической нагрузкой.",
            "Every three completed sessions move the program to the next step. Reaching the rep ceiling adds weight, while manual adjustment keeps the actual load under the user’s control.",
          ),
          image_url: `${assets}/progression-flow.gif`,
          image_alt: pick("Прогрессия повторений, веса и следующего тренировочного цикла", "Progression across reps, weight and the next workout cycle"),
          media_size: "full",
          tags: ["DOUBLE PROGRESSION", pick("Повторы + вес", "Reps + weight"), pick("Ручная настройка", "Manual tuning")],
        },
        {
          title: pick("Продлили сценарий до питания", "Extended the flow into nutrition"),
          description: pick(
            "Дневные меню собирают блюда и итоговые КБЖУ, рецепты рассчитывают порции, а поиск ингредиентов через серверный прокси Open Food Facts ускоряет наполнение без хранения внешних учётных данных в клиенте.",
            "Daily menus combine meals and macro totals, recipes calculate servings, and ingredient search through a server-side Open Food Facts proxy speeds up entry without exposing external credentials in the client.",
          ),
          image_url: `${assets}/nutrition-process-flow.gif`,
          image_alt: pick("Переход от дневного меню к рецепту, ингредиентам и КБЖУ", "Flow from daily menu to recipe, ingredients and macros"),
          media_size: "full",
          tags: [pick("Меню на день", "Daily menus"), pick("Порции и КБЖУ", "Servings and macros"), "OPEN FOOD FACTS"],
        },
      ],
    }, 5, settings("paper", {
      spacing: "large",
      surface: "plain",
      desktop_span: 12,
    })),

    block("workout-copy", "text", {
      eyebrow: pick("Тренировочный опыт", "Workout experience"),
      title: pick(
        "Интерфейс остаётся в фоне, пока пользователь движется.",
        "The interface stays in the background while the user moves.",
      ),
      body: pick(
        "Сценарий последовательно открывает пресс, силовой блок, удары и растяжку. Внутри силового круга активным остаётся одно упражнение, а ближайшая кнопка продолжает поток вместо того, чтобы возвращать к дашборду.\n\nПолноэкранный wall-clock таймер, Wake Lock, звук и вибрация позволяют положить телефон рядом и не следить за каждой секундой.",
        "The flow progressively unlocks abs, strength, strikes and stretching. Inside the strength circuit, one exercise remains active and the nearest action advances the flow instead of returning to a dashboard.\n\nA full-screen wall-clock timer, Wake Lock, sound and vibration let the phone stay nearby without demanding attention every second.",
      ),
    }, 6, settings("paper", {
      spacing: "large",
      surface: "plain",
      desktop_span: 6,
    })),

    block("workout-visual", "image", {
      image_url: `${assets}/workout-flow.gif`,
      alt: pick("Переход от плана тренировки к активному упражнению", "Transition from workout plan to the active exercise"),
      caption: "",
    }, 7, settings("paper", {
      spacing: "compact",
      desktop_span: 6,
      image_bleed: true,
    })),

    block("workout-screens", "gallery", {
      eyebrow: pick("Тренировка", "Workout"),
      title: pick(
        "План, активное действие и восстановление — без разрыва контекста.",
        "Plan, active movement and recovery without breaking context.",
      ),
      items: [
        { image_url: `${assets}/training-plan.jpg`, alt: pick("План тренировки", "Workout plan"), caption: pick("Последовательность блоков", "Gated block sequence") },
        { image_url: `${assets}/training-active.jpg`, alt: pick("Активный силовой круг", "Active strength round"), caption: pick("Одно текущее упражнение", "One current exercise") },
        { image_url: `${assets}/training-rest.jpg`, alt: pick("Таймер отдыха", "Rest timer"), caption: pick("Восстановление по реальному времени", "Wall-clock recovery") },
      ],
    }, 8, settings("ink", { width: "full", spacing: "large", layout: "phones" })),

    block("nutrition-copy", "text", {
      eyebrow: pick("Питание", "Nutrition"),
      title: pick(
        "Тренировка заканчивается. Дневной сценарий — нет.",
        "The workout ends. The daily flow does not.",
      ),
      body: pick(
        "Вторая вкладка продолжает продукт через понятные сущности: меню на день, приём пищи, рецепт и ингредиент. Пользователь видит КБЖУ на каждом уровне, меняет количество порций и собирает рацион из уже сохранённых блюд.\n\nДанные рецептов и меню остаются локальными, поэтому ежедневная работа не зависит от отдельного аккаунта или облачного кабинета.",
        "The second tab continues the product through clear objects: daily menu, meal, recipe and ingredient. Macros remain visible at every level, serving counts stay adjustable, and a day can be assembled from saved dishes.\n\nRecipe and menu data stay local, so everyday use does not depend on a separate account or cloud dashboard.",
      ),
    }, 9, settings("soft", {
      spacing: "large",
      surface: "plain",
      desktop_span: 6,
    })),

    block("nutrition-visual", "image", {
      image_url: `${assets}/nutrition-flow.gif`,
      alt: pick("Переход от дневного меню к рецепту и ингредиентам", "Transition from daily menu to recipe and ingredients"),
      caption: "",
    }, 10, settings("soft", {
      spacing: "compact",
      desktop_span: 6,
      image_bleed: true,
    })),

    block("nutrition-screens", "gallery", {
      eyebrow: pick("Питание", "Nutrition"),
      title: pick(
        "От общего плана дня — к конкретной порции.",
        "From the complete day to a specific serving.",
      ),
      items: [
        { image_url: `${assets}/food-daily-menu.jpg`, alt: pick("Меню на день", "Daily menu"), caption: pick("Итог дня и каждого приёма пищи", "Daily and meal-level totals") },
        { image_url: `${assets}/food-recipes.jpg`, alt: pick("Библиотека рецептов", "Recipe library"), caption: pick("Рецепты по роли в рационе", "Recipes by role in the diet") },
        { image_url: `${assets}/food-recipe-detail.jpg`, alt: pick("Страница рецепта", "Recipe page"), caption: pick("Порции, ингредиенты и КБЖУ", "Servings, ingredients and macros") },
      ],
    }, 11, settings("ink", { width: "full", spacing: "large", layout: "phones" })),

    block("technologies", "technologies", {
      eyebrow: pick("Технологический контур", "Technology"),
      title: pick(
        "Лёгкая клиентская архитектура с точечным серверным слоем.",
        "A lightweight client architecture with a focused server layer.",
      ),
      summary: pick(
        "Состояние остаётся на устройстве. Сервер подключается только для внешнего поиска продуктов.",
        "State stays on device. The server is introduced only for external product search.",
      ),
      items: [
        { label: "Vue 3 + Vite", category: "CLIENT", x: 17, y: 20 },
        { label: "LocalStorage", category: "STATE", x: 27, y: 84 },
        { label: "Wake Lock + WebAudio", category: "DEVICE", x: 82, y: 20 },
        { label: "Node 22 Proxy", category: "SERVER", x: 73, y: 84 },
        { label: "Open Food Facts", category: "DATA", x: 14, y: 49 },
        { label: "Docker", category: "DELIVERY", x: 86, y: 49 },
      ],
    }, 12, settings("soft", {
      width: "wide",
      spacing: "compact",
      layout: "map",
      desktop_span: 7,
      anchor: "technical",
      map_accent: "#8170f5",
      map_background: "#f5f6fb",
      map_text: "#17191f",
    })),

    block("result", "results", {
      eyebrow: pick("Результат", "Outcome"),
      title: pick(
        "Личный трекер вырос в цельную систему ежедневного использования.",
        "A personal tracker grew into one coherent system for daily use.",
      ),
      body: pick(
        "Продукт ведёт пользователя через тренировку, сохраняет контекст нагрузки и продолжает тот же сценарий в питании. При этом он остаётся компактным: данные хранятся на устройстве, навигация ограничена двумя основными разделами, а сервер используется только там, где действительно нужен внешний источник.",
        "The product guides the workout, preserves load context and continues the same flow into nutrition. It remains focused: data stays on device, navigation is limited to two primary sections, and the server is used only where an external source is genuinely required.",
      ),
      link_url: "",
      link_label: "",
    }, 13, settings("signal", {
      spacing: "large",
      desktop_span: 5,
    })),

    block("next", "next_case", {
      eyebrow: pick("Другие проекты", "More work"),
      title: pick("Продолжить знакомство с работами VEZHA", "Continue exploring the work of VEZHA"),
      case_slug: "",
      cta_label: pick("Смотреть все кейсы", "View all cases"),
    }, 14, settings("soft", { spacing: "large" })),
  ];
}
