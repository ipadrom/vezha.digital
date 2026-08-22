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

  const blocks = [
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
      tags: [pick("Продуктовый дизайн", "Product design"), "Nuxt 3", "FastAPI", "PWA"],
    }, 2, settings("paper", {
      spacing: "large",
      anchor: "story",
      surface: "plain",
      desktop_span: 12,
      layout: "overview",
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
      desktop_span: 12,
      layout: "cards",
      show_intro: false,
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
      impact_label: pick("Что изменилось", "Impact"),
      impact: pick(
        "Вместо панели управления получился спокойный маршрут: меньше решений во время действия, яснее следующий шаг и единая логика для тренировки и питания.",
        "Instead of a control panel, the product became a calm route: fewer decisions during action, a clearer next step and one logic across workout and nutrition.",
      ),
    }, 4, settings("soft", {
      spacing: "large",
      surface: "plain",
      layout: "narrative",
    })),

    block("insight", "insight", {
      eyebrow: pick("Ключевое решение", "Key decision"),
      title: pick(
        "Открывать только то, что нужно сейчас.",
        "Reveal only what is needed now.",
      ),
      statement: pick(
        "Продукт не показывает весь день как панель управления — он ведёт по ближайшему доступному действию и сохраняет контекст между шагами.",
        "The product does not expose the whole day as a dashboard. It guides the nearest available action and preserves context between steps.",
      ),
      rationale_label: pick("Почему", "Why"),
      rationale: pick(
        "Во время тренировки внимание должно оставаться на движении, а не на навигации и выборе режима.",
        "During a workout, attention should stay on movement rather than navigation and mode selection.",
      ),
      outcome_label: pick("Результат", "Outcome"),
      outcome: pick(
        "Одна и та же модель переходов работает в тренировке, восстановлении, прогрессии и питании.",
        "The same transition model now works across workout, recovery, progression and nutrition.",
      ),
      image_url: "",
      image_alt: "",
    }, 5, settings("ink", {
      width: "wide",
      spacing: "large",
      layout: "statement",
    })),

    block("process", "process", {
      eyebrow: pick("Логика решения", "Solution logic"),
      title: pick(
        "Собрали интерфейс вокруг реального порядка действий — от первого блока до рациона.",
        "The interface follows the real order of actions — from the first block to the daily plan.",
      ),
      summary: pick(
        "Каждый этап раскрывает отдельное продуктовое решение: сначала принцип, затем его поведение в интерфейсе, крупное медиа и короткий набор полученных свойств.",
        "Each stage reveals one product decision: the principle first, then its interface behavior, a large media example and a concise set of outcomes.",
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
    }, 6, settings("paper", {
      spacing: "large",
      surface: "plain",
      desktop_span: 12,
      layout: "story",
      disclosure_mode: "multiple",
      open_first: false,
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
    }, 7, settings("paper", {
      spacing: "large",
      surface: "plain",
      desktop_span: 12,
      layout: "editorial",
    })),

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
    }, 10, settings("soft", {
      spacing: "large",
      surface: "plain",
      desktop_span: 12,
      layout: "editorial",
    })),

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
    }, 13, settings("soft", {
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
    }, 14, settings("signal", {
      spacing: "large",
      desktop_span: 5,
      layout: "statement",
    })),

    block("next", "next_case", {
      eyebrow: pick("Другие проекты", "More work"),
      title: pick("Продолжить знакомство с работами VEZHA", "Continue exploring the work of VEZHA"),
      case_slug: "",
      cta_label: pick("Смотреть все кейсы", "View all cases"),
    }, 15, settings("soft", { spacing: "large" })),
  ];

  const byId = (id: string) => blocks.find((item) => item.id === `wellness-${id}`);
  const context = byId("context");
  const facts = byId("facts");
  const challenge = byId("challenge");
  const challengeMedia = byId("insight");
  const sourceProcess = byId("process");
  const processIntro = byId("workout-copy");
  const nutritionProcess = byId("nutrition-copy");
  const technologies = byId("technologies");
  const result = byId("result");
  const next = byId("next");

  if (
    context && facts && challenge && challengeMedia && sourceProcess && processIntro
    && nutritionProcess && technologies && result && next
  ) {
    const sourceItems = [...(sourceProcess.content.items || [])];
    const systemStep = sourceItems[0] || {};
    const trainingItems = sourceItems.slice(1, 3);
    const progressionItems = sourceItems.slice(3, 5);
    const nutritionStep = sourceItems[sourceItems.length - 1] || {};

    context.settings.desktop_span = 12;
    facts.settings.desktop_span = 12;

    challenge.type = "text";
    challenge.content = {
      eyebrow: pick("Задача", "Challenge"),
      title: pick(
        "Сделать продукт, который ведёт по сценарию, а не требует управлять им во время действия.",
        "Build a product that guides the flow instead of demanding management during action.",
      ),
      body: pick(
        "Тренировка не должна требовать постоянной навигации и контроля экрана. При этом нагрузка должна расти последовательно, таймер — переживать уход приложения в фон, а питание — оставаться достаточно простым для ежедневного использования.\n\nПоэтому интерфейс строится не как дашборд со всеми возможностями сразу, а как последовательность состояний: один доступный шаг, понятное восстановление, сохранённая нагрузка и продолжение того же ритма в меню и рецептах.",
        "A workout cannot demand constant navigation or screen attention. At the same time, load must progress coherently, timers must survive backgrounding, and nutrition must remain simple enough for everyday use.\n\nThe interface therefore behaves as a sequence of states rather than a dashboard of every possible action: one available step, clear recovery, preserved load and the same rhythm continuing into menus and recipes.",
      ),
      tags: [],
    };
    challenge.settings = settings("paper", {
      width: "wide",
      spacing: "large",
      surface: "plain",
      desktop_span: 12,
      layout: "editorial",
      anchor: "challenge",
    });
    challenge.sort_order = 4;

    challengeMedia.type = "image";
    challengeMedia.content = {
      image_url: systemStep.image_url || `${assets}/system-flow.gif`,
      alt: systemStep.image_alt || pick(
        "Связанный сценарий тренировки и питания WELLNESS APP",
        "Connected workout and nutrition flow in WELLNESS APP",
      ),
      caption: "",
    };
    challengeMedia.settings = settings("paper", {
      width: "wide",
      spacing: "compact",
      surface: "plain",
      desktop_span: 12,
      image_bleed: false,
    });
    challengeMedia.sort_order = 5;

    processIntro.content = {
      eyebrow: pick("Наш процесс", "Our process"),
      title: pick(
        "Разобрали ежедневный сценарий на три связанные главы: действие, восстановление и питание.",
        "We organized the daily flow into three connected chapters: action, recovery and nutrition.",
      ),
      body: pick(
        "Каждую главу проверяли на одном принципе: интерфейс показывает только актуальное состояние, сохраняет контекст между шагами и подтверждает переход крупным медиа. Внутри главы решения раскрываются по одному — с объяснением, демонстрацией и коротким набором полученных свойств.",
        "Each chapter follows one principle: the interface shows only the current state, preserves context between steps and confirms the transition with large media. Decisions open one by one with an explanation, a demonstration and a concise set of outcomes.",
      ),
      tags: [],
    };
    processIntro.settings = settings("paper", {
      width: "wide",
      spacing: "large",
      surface: "plain",
      desktop_span: 12,
      layout: "editorial",
      anchor: "process",
    });
    processIntro.sort_order = 6;

    sourceProcess.content = {
      eyebrow: pick("Тренировочный сценарий", "Workout flow"),
      title: pick(
        "План открывает только ближайшее действие и не возвращает пользователя к дашборду.",
        "The plan reveals only the nearest action and never sends the user back to a dashboard.",
      ),
      summary: pick(
        "Сначала система проводит через фиксированный порядок блоков, затем оставляет в фокусе одно упражнение и одну ближайшую кнопку. Подсказка по технике открывается поверх текущего шага, поэтому контекст занятия не теряется.",
        "The system first guides a fixed block sequence, then keeps one exercise and one nearest action in focus. Movement guidance opens over the current step, so the workout context never disappears.",
      ),
      items: trainingItems,
    };
    sourceProcess.settings = settings("paper", {
      width: "wide",
      spacing: "large",
      surface: "plain",
      desktop_span: 12,
      layout: "chapter",
      disclosure_mode: "multiple",
      open_first: false,
    });
    sourceProcess.sort_order = 7;

    nutritionProcess.type = "process";
    nutritionProcess.content = {
      eyebrow: pick("Питание", "Nutrition"),
      title: pick(
        "Тренировка заканчивается. Дневной сценарий — нет.",
        "The workout ends. The daily flow does not.",
      ),
      summary: pick(
        "Вторая вкладка продолжает продукт через понятные сущности: меню на день, приём пищи, рецепт и ингредиент. Пользователь видит КБЖУ на каждом уровне, меняет количество порций и собирает рацион из уже сохранённых блюд. Данные рецептов и меню остаются локальными, поэтому ежедневная работа не зависит от отдельного аккаунта или облачного кабинета.",
        "The second tab continues the product through clear objects: daily menu, meal, recipe and ingredient. Macros remain visible at every level, serving counts stay adjustable, and a day can be assembled from saved dishes. Recipe and menu data stay local, so everyday use does not depend on a separate account or cloud dashboard.",
      ),
      items: nutritionStep.title ? [nutritionStep] : [],
    };
    nutritionProcess.settings = settings("paper", {
      width: "wide",
      spacing: "large",
      surface: "plain",
      desktop_span: 12,
      layout: "chapter",
      disclosure_mode: "multiple",
      open_first: false,
    });
    nutritionProcess.sort_order = 11;

    result.content.items = [
      { text: pick("Пользователь проходит тренировку без возврата к дашборду.", "The workout progresses without a return to a dashboard.") },
      { text: pick("Контекст нагрузки сохраняется между занятиями.", "Load context is preserved between sessions.") },
      { text: pick("Тот же сценарий продолжается в меню, рецептах и расчёте КБЖУ.", "The same flow continues into menus, recipes and macro calculations.") },
      { text: pick("Данные остаются на устройстве, а сервер подключается только к внешнему источнику.", "Data stays on device, with the server used only for an external source.") },
    ];
    result.settings = settings("paper", {
      width: "wide",
      spacing: "large",
      surface: "plain",
      desktop_span: 12,
      layout: "statement",
      anchor: "results",
    });
    result.sort_order = 14;

    technologies.content.eyebrow = pick("Технологии", "Technologies");
    technologies.content.title = "PRODUCT / WEB / API";
    technologies.content.summary = "";
    technologies.settings.desktop_span = 12;
    technologies.sort_order = 16;
    next.sort_order = 17;

    blocks.push(
      block("progression", "process", {
        eyebrow: pick("Восстановление и прогрессия", "Recovery and progression"),
        title: pick(
          "Система помнит реальное время и нагрузку между подходами и занятиями.",
          "The system remembers real time and load between sets and sessions.",
        ),
        summary: pick(
          "Wall-clock таймер продолжает отсчёт после сворачивания приложения, а Wake Lock, звук и вибрация снимают необходимость постоянно смотреть на экран. После трёх завершённых занятий прогрессия предлагает следующую ступень, сохраняя ручной контроль над весом и повторениями.",
          "The wall-clock timer keeps counting after the app is backgrounded, while Wake Lock, sound and haptics remove the need to watch the screen. After three completed sessions, progression proposes the next step while preserving manual control over weight and repetitions.",
        ),
        items: progressionItems,
      }, 10, settings("paper", {
        width: "wide",
        spacing: "large",
        surface: "plain",
        desktop_span: 12,
        layout: "chapter",
        disclosure_mode: "multiple",
        open_first: false,
      })),
      block("approach", "text", {
        eyebrow: pick("Подход", "Our approach"),
        title: pick(
          "Лёгкая клиентская архитектура с точечным серверным слоем.",
          "A lightweight client architecture with a focused server layer.",
        ),
        body: pick(
          "Состояние остаётся на устройстве. Сервер подключается только для внешнего поиска продуктов.",
          "State stays on device. The server is introduced only for external product search.",
        ),
      }, 15, settings("paper", {
        width: "wide",
        spacing: "large",
        surface: "plain",
        desktop_span: 12,
        layout: "editorial",
        anchor: "approach",
      })),
    );
  }

  return blocks.sort((a, b) => a.sort_order - b.sort_order);
}
