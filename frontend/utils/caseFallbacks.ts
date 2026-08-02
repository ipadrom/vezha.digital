import type { IProjectDetail } from "./interfaces/IProjects";

type LocaleCode = "ru" | "en";

// Presentation-only case copy used when the local API is unavailable.
// Replace with verified CMS content before production publication.
export function getCaseFallbacks(locale: LocaleCode): IProjectDetail[] {
  const ru = locale === "ru";
  return [
    {
      id: "concept-menu", slug: "restaurant-menu", sort_order: 0, is_featured: true,
      type: "TELEGRAM MINI APP", name: ru ? "Меню, которое ведёт к заказу" : "A menu that leads to checkout",
      subtitle: ru ? "Цифровой сценарий ресторана внутри привычного мессенджера." : "A restaurant journey inside a familiar messenger.",
      industry: ru ? "HoReCa" : "Hospitality", description: ru ? "Каталог, корзина и заказ собраны в один короткий путь без установки отдельного приложения." : "Catalog, cart and checkout form one short journey with no extra app to install.",
      image_url: null, cover_image_url: null, project_url: null, hero_metric_value: "01", hero_metric_label: ru ? "единый сценарий" : "unified journey",
      year: "2026", timeline: ru ? "MVP / 4 этапа" : "MVP / 4 stages",
      challenge: ru ? "Перенести меню и оформление заказа в Telegram, сохранив ощущение полноценного цифрового продукта и понятную навигацию на маленьком экране." : "Bring menu browsing and checkout into Telegram while retaining a polished product feel and clear small-screen navigation.",
      solution: ru ? "Мы построили интерфейс вокруг одного действия: выбрать блюдо, уточнить детали и отправить заказ. Категории остаются под рукой, а корзина не прерывает контекст." : "We built the interface around one action: choose, customize and send an order. Categories stay close while the cart preserves context.",
      result_summary: ru ? "Получился компактный сервис, который связывает витрину ресторана, заказ и коммуникацию в одном канале." : "The result is a compact service connecting the restaurant storefront, checkout and communication in one channel.",
      testimonial: null, testimonial_author: null,
      metrics: [
        { value: "01", label: ru ? "путь до заказа" : "path to checkout", context: ru ? "Без перехода между сервисами" : "No service switching", sort_order: 0 },
        { value: "04", label: ru ? "ключевых экрана" : "core screens", context: ru ? "Каталог · карточка · корзина · статус" : "Catalog · item · cart · status", sort_order: 1 },
        { value: "RU/EN", label: ru ? "локализация" : "localization", context: ru ? "Контент готов к двум языкам" : "Content ready for two languages", sort_order: 2 },
      ],
      gallery: [], technologies: [
        { label: "Vue 3", category: "stack", sort_order: 0 }, { label: "FastAPI", category: "stack", sort_order: 1 },
        { label: "Telegram WebApp", category: "integration", sort_order: 2 }, { label: "PostgreSQL", category: "stack", sort_order: 3 },
      ],
    },
    {
      id: "concept-ai", slug: "ai-support", sort_order: 1, is_featured: true,
      type: "AI / AUTOMATION", name: ru ? "Поддержка, которая помнит контекст" : "Support that remembers context",
      subtitle: ru ? "AI-помощник для первой линии и внутренней базы знаний." : "An AI copilot for frontline support and internal knowledge.",
      industry: ru ? "Сервисы" : "Services", description: ru ? "Единое окно для вопросов клиентов, поиска по базе и передачи сложных диалогов оператору." : "One workspace for customer questions, knowledge retrieval and human handoff.",
      image_url: null, cover_image_url: null, project_url: null, hero_metric_value: "AI", hero_metric_label: ru ? "в рабочем контуре" : "in the workflow",
      year: "2026", timeline: ru ? "Прототип → пилот" : "Prototype → pilot",
      challenge: ru ? "Сократить повторяющиеся действия операторов и при этом сохранить контролируемый, прозрачный ответ клиенту." : "Reduce repetitive support work while keeping every customer answer controlled and transparent.",
      solution: ru ? "Ассистент ищет релевантные фрагменты базы знаний, формирует черновик ответа и показывает источники перед отправкой." : "The assistant retrieves relevant knowledge, drafts an answer and exposes its sources before sending.",
      result_summary: ru ? "Вместо отдельного чат-бота получился рабочий инструмент рядом с текущим процессом команды." : "Rather than a separate chatbot, the product acts as a tool embedded in the team’s existing workflow.",
      testimonial: null, testimonial_author: null,
      metrics: [
        { value: "RAG", label: ru ? "поиск по знаниям" : "knowledge retrieval", context: ru ? "Ответ опирается на базу" : "Answers grounded in sources", sort_order: 0 },
        { value: "HITL", label: ru ? "контроль оператора" : "human control", context: ru ? "Решение остаётся за человеком" : "The human stays in charge", sort_order: 1 },
        { value: "API", label: ru ? "интеграционный слой" : "integration layer", context: ru ? "Без замены текущих систем" : "No system replacement", sort_order: 2 },
      ], gallery: [], technologies: [
        { label: "LLM", category: "stack", sort_order: 0 }, { label: "Vector Search", category: "stack", sort_order: 1 },
        { label: "CRM API", category: "integration", sort_order: 2 }, { label: "Audit Log", category: "integration", sort_order: 3 },
      ],
    },
    {
      id: "concept-crm", slug: "crm-workspace", sort_order: 2, is_featured: true,
      type: "CORPORATE SYSTEM", name: ru ? "CRM без информационного шума" : "A CRM without the noise",
      subtitle: ru ? "Операционный экран для команды, которой важны действия, а не таблицы." : "An operations workspace built around actions, not tables.",
      industry: ru ? "B2B" : "B2B", description: ru ? "Сделки, задачи и история коммуникации собраны вокруг следующего шага менеджера." : "Deals, tasks and communication history organized around the manager’s next action.",
      image_url: null, cover_image_url: null, project_url: null, hero_metric_value: "360°", hero_metric_label: ru ? "контекст сделки" : "deal context",
      year: "2026", timeline: ru ? "Discovery → release" : "Discovery → release",
      challenge: ru ? "Объединить разрозненные данные и убрать необходимость собирать контекст сделки из нескольких вкладок." : "Unify scattered data and remove the need to reconstruct deal context across multiple tabs.",
      solution: ru ? "Главный экран показывает состояние воронки, риски и конкретные следующие действия. Детали открываются по мере необходимости." : "The main view exposes pipeline state, risk and explicit next actions, while details reveal progressively.",
      result_summary: ru ? "Система стала спокойнее визуально и точнее отражает ежедневный процесс команды." : "The system is visually calmer and more closely mirrors the team’s daily process.",
      testimonial: null, testimonial_author: null,
      metrics: [
        { value: "360°", label: ru ? "карточка клиента" : "client view", context: ru ? "История и действия рядом" : "History and actions together", sort_order: 0 },
        { value: "03", label: ru ? "рабочих режима" : "work modes", context: ru ? "Воронка · список · фокус" : "Pipeline · list · focus", sort_order: 1 },
        { value: "RBAC", label: ru ? "роли доступа" : "access roles", context: ru ? "Данные по зонам ответственности" : "Data by responsibility", sort_order: 2 },
      ], gallery: [], technologies: [
        { label: "Nuxt", category: "stack", sort_order: 0 }, { label: "PostgreSQL", category: "stack", sort_order: 1 },
        { label: "Telephony", category: "integration", sort_order: 2 }, { label: "Email", category: "integration", sort_order: 3 },
      ],
    },
  ];
}
