<template>
  <div ref="rootRef" class="vz-min" :data-theme="theme">
    <div v-if="showPreloader" ref="preloaderRef" data-preloader class="vz-preloader">
      <div class="vz-preloader__top">
        <span>2026 / Загрузка</span>
        <span>Vezha / Digital</span>
      </div>
      <div class="vz-preloader__bottom">
        <div class="vz-preloader__count"><span>{{ introProgress.toString().padStart(2, "0") }}</span><span>%</span></div>
        <div class="vz-preloader__meta">Пространство 000<br />Base · Moscow</div>
      </div>
    </div>

    <nav class="vz-nav" aria-label="Основная навигация">
      <a class="vz-logo" href="#hero" aria-label="VEZHA Digital">
        <span>VEZHA</span>
        <small>Digital</small>
      </a>
      <div class="vz-nav__links" data-nav-links>
        <a href="#about">Кто мы</a>
        <a href="#stack">Стек</a>
        <a href="#services">Услуги</a>
        <a href="#stages">Этапы</a>
        <a href="#contacts">Контакты</a>
      </div>
      <div class="vz-nav__actions">
        <button class="vz-icon-button" type="button" aria-label="Сменить тему" @click="toggleTheme">
          {{ theme === "dark" ? "☀" : "☾" }}
        </button>
        <a class="vz-nav__cta" href="#contacts" data-nav-cta>Обсудить проект</a>
        <button class="vz-menu-button" type="button" aria-label="Открыть меню" data-nav-toggle @click="isMenuOpen = true">
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>

    <div v-show="isMenuOpen" class="vz-mobile-menu" data-mobile-menu>
      <div class="vz-mobile-menu__top">
        <div class="vz-logo">
          <span>VEZHA</span>
          <small>Digital</small>
        </div>
        <button class="vz-icon-button" type="button" aria-label="Закрыть меню" @click="isMenuOpen = false">✕</button>
      </div>
      <div class="vz-mobile-menu__links">
        <a v-for="item in navItems" :key="item.href" :href="item.href" @click="isMenuOpen = false">{{ item.label }}</a>
      </div>
      <a class="vz-mobile-menu__cta" href="#contacts" @click="isMenuOpen = false">Обсудить проект →</a>
      <div class="vz-mobile-menu__bottom">
        <span>2026 / Веб-студия</span>
        <span>Base / Moscow</span>
      </div>
    </div>

    <section id="hero" class="vz-hero">
      <div class="vz-hero__art" aria-hidden="true">
        <div class="vz-aura vz-aura--top"></div>
        <div class="vz-aura vz-aura--bottom"></div>
        <div class="vz-orbit">
          <svg data-orbit viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="98" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 7" />
          </svg>
        </div>
        <span v-for="corner in 4" :key="corner" :class="`vz-corner vz-corner--${corner}`"><i></i><b></b></span>
      </div>

      <div class="vz-hero__inner">
        <div class="vz-hero__meta" data-hero-meta>
          <span>2026 / Веб-студия</span>
          <span>Base / Moscow</span>
        </div>
        <div class="vz-hero__kicker">
          <span>✦</span>
          <span>Engineering clarity through code</span>
        </div>
        <h1>
          <span><span data-reveal>Продукты,</span></span>
          <span><span data-reveal>которые работают</span></span>
          <span><span data-reveal>в вашем бизнесе</span></span>
        </h1>
        <div class="vz-hero__grid" data-hero-grid>
          <p>
            Telegram Mini Apps, боты, сайты, интернет-магазины, AI и корпоративные системы.
            Команда полного цикла — без субподряда и лишних звеньев.
          </p>
          <div class="vz-hero__actions">
            <a class="vz-button vz-button--dark" href="#contacts">Обсудить проект →</a>
            <a class="vz-button-link" href="#stack">Смотреть стек <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div class="vz-hero__stats" data-hero-stats>
          <span>От 40 000 ₽</span>
          <span>/</span>
          <span>Запуск 1–4 недели</span>
          <span>/</span>
          <span>Полный цикл</span>
          <span>/</span>
          <span>Без субподряда</span>
        </div>
      </div>
    </section>

    <div class="vz-marquee" aria-label="Направления разработки">
      <div>
        <span v-for="item in marqueeItems" :key="`a-${item}`">{{ item }} <i>✦</i></span>
        <span v-for="item in marqueeItems" :key="`b-${item}`" aria-hidden="true">{{ item }} <i>✦</i></span>
      </div>
    </div>

    <section id="about" class="vz-about">
      <div class="vz-about__grid">
        <div class="vz-section-label">
          <span>Кто мы</span>
          <i>/</i>
          <span data-secnum>01</span>
        </div>
        <div class="vz-about__copy">
          <p class="vz-about__lead">
            Мы — команда полного цикла. Каждый проект ведёт конкретный человек: от первого разговора до запуска.
          </p>
          <div class="vz-about__cols">
            <p>Вникаем в задачу и предлагаем решения, а не просто закрываем ТЗ. Никакого субподряда и лишних звеньев между вами и результатом.</p>
            <p>Нам важно, чтобы продукт реально работал в вашем бизнесе, а не выглядел красиво на сдаче и пылился после запуска.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="stack" data-stack-section class="vz-stack">
      <div class="vz-sticky">
        <div class="vz-sticky__inner">
          <div class="vz-sec-head" data-sec-head>
            <div>
              <div class="vz-section-label">
                <span>Стек</span>
                <i>/</i>
                <span data-secnum>02</span>
              </div>
              <h2>Стек подбирается под задачу, а не по трендам</h2>
            </div>
            <div class="vz-sec-meta" data-sec-meta>
              <div><span data-stack-counter>01</span><i> / {{ toNumber(displayStackGroups.length) }}</i></div>
              <p>Каждый инструмент проверен в реальных проектах и предсказуем в поддержке.</p>
            </div>
          </div>

          <div class="vz-stack__timeline">
            <div class="vz-stack__line" data-stack-line><span data-line-fill></span></div>
            <article
              v-for="group in displayStackGroups"
              :key="group.title"
              data-stack-item
              class="vz-stack-item"
            >
              <div data-label>{{ group.title }}</div>
              <div>
                <span data-halo></span>
                <span data-dot></span>
              </div>
              <div>
                <p>{{ group.description }}</p>
                <div>
                  <span v-for="item in group.items" :key="item">{{ item }}</span>
                </div>
              </div>
            </article>
          </div>

          <div class="vz-scroll-hint" data-stack-hint>
            <span>Скролл</span>
            <span>↓</span>
            <span>категории подсвечиваются по очереди</span>
          </div>
        </div>
      </div>
    </section>

    <section id="services" data-services-pin class="vz-services">
      <div class="vz-sticky">
        <div class="vz-sticky__inner">
          <div class="vz-sec-head" data-sec-head>
            <div>
              <div class="vz-section-label">
                <span>Услуги</span>
                <i>/</i>
                <span data-secnum>03</span>
              </div>
              <h2><span><span data-reveal>Что мы делаем</span></span></h2>
            </div>
            <div class="vz-services__counter"><span data-serv-counter>01 / 07</span></div>
          </div>

          <div class="vz-services__grid" data-serv-grid>
            <div class="vz-services__nav" data-serv-list>
              <button
                v-for="(service, index) in displayServices"
                :key="service.title"
                data-serv-nav
                type="button"
                @click="scrollToService(index)"
              >
                <span data-serv-nav-num>{{ service.n }}</span>
                <span data-serv-nav-label>{{ service.title }}</span>
              </button>
            </div>

            <div class="vz-services__stage" data-serv-stage>
              <div class="vz-services__devices" data-serv-devices>
                <div class="vz-device-mac" data-device-mac>
                  <div class="vz-macbook" data-macbook>
                    <div class="vz-macbook__tilt">
                      <div class="vz-macbook__lid" data-mac-lid>
                        <div class="vz-macbook__notch"></div>
                        <div class="vz-macbook__screen-wrap" data-screen-wrap>
                          <div
                            v-for="(screen, index) in serviceScreens"
                            :key="screen.type"
                            data-screen
                            :data-si="index"
                            :class="['vz-screen', `vz-screen--${screen.type}`]"
                          >
                            <div v-if="screen.type === 'miniapp'" class="vz-screen-miniapp">
                              <div class="vz-screen-topbar">
                                <span></span>
                                <i>Mini app</i>
                              </div>
                              <div class="vz-screen-hero-line"></div>
                              <div class="vz-screen-cards">
                                <b></b>
                                <b></b>
                              </div>
                              <div class="vz-screen-button"></div>
                            </div>

                            <div v-else-if="screen.type === 'bot'" class="vz-screen-chat">
                              <div class="vz-screen-chatbar"><span></span><b></b></div>
                              <div class="vz-bubble vz-bubble--left"></div>
                              <div class="vz-bubble vz-bubble--right"></div>
                              <div class="vz-bubble vz-bubble--choice"></div>
                              <div class="vz-chat-input"></div>
                            </div>

                            <div v-else-if="screen.type === 'site'" class="vz-screen-site">
                              <div class="vz-browserbar"><span></span><i>vezha.digital</i></div>
                              <div class="vz-site-grid">
                                <div></div>
                                <b></b>
                              </div>
                            </div>

                            <div v-else-if="screen.type === 'shop'" class="vz-screen-shop">
                              <div class="vz-shop-top"><span></span><b>2</b></div>
                              <div class="vz-shop-grid">
                                <i v-for="cell in 6" :key="cell"></i>
                              </div>
                            </div>

                            <div v-else-if="screen.type === 'ai'" class="vz-screen-ai">
                              <div class="vz-ai-top"><span>✦</span><b></b></div>
                              <div class="vz-bubble vz-bubble--right"></div>
                              <div class="vz-ai-answer"><span>✦</span><i></i></div>
                              <div class="vz-ai-plan"></div>
                              <div class="vz-ai-flow"><b></b><b></b><b></b></div>
                            </div>

                            <div v-else-if="screen.type === 'corp'" class="vz-screen-corp">
                              <div class="vz-corp-side"></div>
                              <div class="vz-corp-main">
                                <div class="vz-corp-head"></div>
                                <div class="vz-corp-cards"><b></b><b></b><b></b></div>
                                <div class="vz-corp-chart"><i v-for="bar in 6" :key="bar"></i></div>
                              </div>
                            </div>

                            <div v-else class="vz-screen-mobile">
                              <div class="vz-code-pane">
                                <span>// app/main.go</span>
                                <b>func main() {</b>
                                <i>app := mobile.New()</i>
                                <i>app.Screen("home")</i>
                                <i>app.Render(ui.List{</i>
                                <i>Title: "Каталог"</i>
                                <b>}</b>
                              </div>
                              <div class="vz-phone-pane">
                                <div class="vz-phone">
                                  <span></span>
                                  <b></b>
                                  <i></i>
                                </div>
                              </div>
                            </div>
                            <div class="vz-screen-shine"></div>
                          </div>
                        </div>
                      </div>
                      <div class="vz-macbook__base">
                        <span></span>
                        <i></i>
                      </div>
                    </div>
                    <div class="vz-macbook__shadow"></div>
                  </div>
                </div>
              </div>

              <div class="vz-service-caption" data-serv-caption>
                <article
                  v-for="service in displayServices"
                  :key="service.n"
                  data-serv-panel
                  class="vz-service-panel"
                >
                  <div class="vz-service-panel__title">
                    <span>{{ service.n }}</span>
                    <h3>{{ service.title }}</h3>
                  </div>
                  <p>{{ service.desc }}</p>
                  <div data-serv-metawrap>
                    <span v-for="meta in service.meta" :key="meta">{{ meta }}</span>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div class="vz-services__bar"><span data-serv-bar></span></div>
          <div class="vz-scroll-hint" data-serv-hint>
            <span>Скролл</span>
            <span>↓</span>
            <span>услуги сменяют друг друга</span>
          </div>
        </div>
      </div>
    </section>

    <section id="clients" class="vz-clients">
      <div class="vz-clients__grid" data-clients-grid>
        <div>
          <div class="vz-section-label">
            <span>Для любых клиентов</span>
            <i>/</i>
            <span>✦</span>
          </div>
          <h2><span><span data-reveal>От частного специалиста до компании</span></span></h2>
        </div>
        <div class="vz-client-tags">
          <span v-for="client in displayClients" :key="client">{{ client }}</span>
        </div>
      </div>
    </section>

    <section id="stages" class="vz-stages" data-stages-dark>
      <div class="vz-go-layer" data-go-layer aria-hidden="true">
        <pre>package main

import (
  "encoding/json"
  "log"
  "net/http"
  "time"
)

type Project struct {
  ID        string    `json:"id"`
  Title     string    `json:"title"`
  Stage     string    `json:"stage"`
  CreatedAt time.Time `json:"created_at"`
}</pre>
        <pre>func listProjects(w http.ResponseWriter, r *http.Request) {
  if r.Method != http.MethodGet {
    http.Error(w, "method not allowed", 405)
    return
  }
  projects, err := store.All(r.Context())
  if err != nil {
    http.Error(w, err.Error(), 500)
    return
  }
  _ = json.NewEncoder(w).Encode(projects)
}</pre>
      </div>
      <div class="vz-stages__aura" aria-hidden="true"></div>
      <div class="vz-wrap">
        <div class="vz-stages__head">
          <div class="vz-section-label">
            <span>Этапы</span>
            <i>/</i>
            <span data-secnum>04</span>
          </div>
          <h2><span><span data-reveal>Анатомия разработки</span></span></h2>
          <p>«Понятный процесс, где каждый этап приближает вас к продукту, который работает в вашем бизнесе»</p>
        </div>
        <div class="vz-stage-cards" data-stages-cards>
          <article
            v-for="(stage, index) in displayStages"
            :key="stage.n"
            data-stage-card
            data-rise
            :class="['vz-stage-card', { 'vz-stage-card--dark': index === 1 || index === 3 || index === 6 }]"
          >
            <div class="vz-stage-card__num">{{ stage.n }}</div>
            <div class="vz-stage-card__content">
              <span>{{ stage.dur }}</span>
              <h3>{{ stage.title }}</h3>
              <p>{{ stage.desc }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="contacts" class="vz-contacts">
      <div class="vz-contacts__art" aria-hidden="true">
        <div></div>
        <span v-for="corner in 4" :key="corner" :class="`vz-corner vz-corner--${corner}`"><i></i><b></b></span>
      </div>
      <div class="vz-contacts__inner">
        <div class="vz-section-label">
          <span>Контакты</span>
          <i>/</i>
          <span data-secnum>05</span>
        </div>
        <h2><span><span data-reveal>Обсудим проект и рассчитаем точную стоимость</span></span></h2>
        <div class="vz-contacts__buttons" data-contacts-btns>
          <a class="vz-button vz-button--dark" :href="`mailto:${contactEmail}`">Написать нам</a>
          <a class="vz-button vz-button--light" :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
        </div>
      </div>
    </section>

    <footer class="vz-footer">
      <div class="vz-footer__top" data-footer-top>
        <span>Всё по проекту. В одном месте. Спокойно.</span>
        <a href="#hero">Конец полотна ↑ В начало</a>
      </div>
      <div class="vz-footer__cols" data-footer-cols>
        <div>
          <span>Year</span>
          <strong>2026</strong>
        </div>
        <div>
          <span>Base</span>
          <p>Москва<br />Россия</p>
        </div>
        <div>
          <span>Contact</span>
          <nav>
            <a :href="`mailto:${contactEmail}`">{{ contactEmail }} →</a>
            <a href="#hero">vezha.digital ↗</a>
          </nav>
        </div>
        <div>
          <span>Навигация</span>
          <nav>
            <a href="#about">Кто мы</a>
            <a href="#stack">Стек</a>
            <a href="#services">Услуги</a>
            <a href="#stages">Этапы</a>
          </nav>
        </div>
      </div>
      <div class="vz-footer__sign" data-footer-sign>
        <div>
          <span>2026 / Sign-off</span>
          <span>vezha.digital</span>
        </div>
        <strong data-clip-reveal>VEZHA</strong>
      </div>
      <div class="vz-footer__legal" data-footer-legal>
        <span>© 2026 · VEZHA DIGITAL</span>
        <span>ИП Анищенко Д. А. · ОГРНИП 326774600075626 · ИНН 773421830976</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { IAdvantages } from "~/utils/interfaces/IAdvantages";
import type { IClientType } from "~/utils/interfaces/IClientTypes";
import type { IProjects } from "~/utils/interfaces/IProjects";
import type { IServices } from "~/utils/interfaces/IServices";
import type { ISettings } from "~/utils/interfaces/ISettings";
import type { ITechStack } from "~/utils/interfaces/ITechStack";
import type { IWorkStages } from "~/utils/interfaces/IWorkStages";

definePageMeta({
  layout: false,
});

type StackGroup = {
  title: string;
  description: string;
  items: string[];
};

type DisplayService = {
  n: string;
  title: string;
  desc: string;
  meta: string[];
};

type DisplayStage = {
  n: string;
  title: string;
  desc: string;
  dur: string;
};

const {
  getServices,
  getProjects,
  getAdvantages,
  getTechStack,
  getWorkStages,
  getSettings,
  getClientTypes,
} = useApi();

const rootRef = ref<HTMLElement | null>(null);
const preloaderRef = ref<HTMLElement | null>(null);
const showPreloader = ref(true);
const introProgress = ref(0);
const theme = ref("light");
const isMenuOpen = ref(false);

const services = ref<IServices[]>([]);
const projects = ref<IProjects[]>([]);
const advantages = ref<IAdvantages[]>([]);
const techStack = ref<ITechStack[]>([]);
const workStages = ref<IWorkStages[]>([]);
const clientTypes = ref<IClientType[]>([]);
const settings = ref<ISettings | null>(null);

const navItems = [
  { href: "#about", label: "Кто мы" },
  { href: "#stack", label: "Стек" },
  { href: "#services", label: "Услуги" },
  { href: "#stages", label: "Этапы" },
  { href: "#contacts", label: "Контакты" },
];

const marqueeItems = [
  "Веб-разработка под ключ",
  "Telegram Mini Apps",
  "Telegram боты",
  "Веб-сайты",
  "Интернет-магазины",
  "AI и автоматизация",
  "Корпоративные системы",
];

const fallbackServices: DisplayService[] = [
  { n: "01", title: "Telegram Mini Apps", desc: "Полноценные приложения внутри Telegram: каталог, профиль, оплата.", meta: ["Каталог", "Оплата", "Профиль"] },
  { n: "02", title: "Telegram боты", desc: "Автоматизация продаж, записи и поддержки прямо в чате.", meta: ["Продажи", "Запись", "Поддержка"] },
  { n: "03", title: "Веб-сайты", desc: "Лендинги и корпоративные сайты, которые быстро грузятся и продают.", meta: ["Лендинги", "Корпоративные", "SEO"] },
  { n: "04", title: "Интернет-магазины", desc: "Каталог, корзина, оплата и интеграции со складом и CRM.", meta: ["Корзина", "Оплата", "CRM"] },
  { n: "05", title: "AI и автоматизация", desc: "Ассистенты и обработка заявок на стороне ИИ — меньше рутины.", meta: ["Ассистенты", "Заявки", "Интеграции"] },
  { n: "06", title: "Корпоративные системы", desc: "Внутренние порталы, CRM и учётные системы под ваши процессы.", meta: ["CRM", "Порталы", "Учёт"] },
  { n: "07", title: "Мобильные приложения", desc: "Нативные и кроссплатформенные приложения для iOS и Android.", meta: ["iOS", "Android", "PWA"] },
];

const serviceScreens = [
  { type: "miniapp" },
  { type: "bot" },
  { type: "site" },
  { type: "shop" },
  { type: "ai" },
  { type: "corp" },
  { type: "mobile" },
];

const fallbackStackGroups: StackGroup[] = [
  { title: "Frontend", description: "Интерфейсы, которые быстро грузятся и удобно работают на любом устройстве.", items: ["React", "Vue 3", "Next.js", "TypeScript", "Tailwind"] },
  { title: "Backend", description: "Надёжная серверная часть, которая не ляжет под нагрузкой и легко масштабируется.", items: ["Python", "FastAPI", "PostgreSQL", "Redis"] },
  { title: "DevOps", description: "Стабильный деплой и мониторинг: предсказуемые релизы и аптайм без сюрпризов.", items: ["Docker", "Nginx", "CI/CD", "Linux"] },
  { title: "Mobile", description: "Мобильные приложения и PWA с нативным ощущением на iOS и Android.", items: ["React Native", "Expo", "PWA", "Flutter"] },
];

const devOpsTechNames = new Set(["docker", "nginx", "ci/cd", "ci cd", "linux", "kubernetes", "github actions", "gitlab ci"]);

const fallbackClients = [
  "Лендинг для фотографа",
  "Сайт-портфолио",
  "Бот для записи",
  "Мини-магазин в Telegram",
  "Личный AI-ассистент",
];

const fallbackStages: DisplayStage[] = [
  { n: "01", title: "Анализ", desc: "Изучаем бизнес, цели и аудиторию, фиксируем техническое задание.", dur: "1–3 дня" },
  { n: "02", title: "Проектирование", desc: "Прототипы экранов, архитектура системы и UX-логика продукта.", dur: "2–4 дня" },
  { n: "03", title: "Дизайн", desc: "Визуальная концепция, UI Kit и адаптив под устройства.", dur: "3–7 дней" },
  { n: "04", title: "Разработка", desc: "Frontend, Backend, API-интеграции и code review.", dur: "7–21 день" },
  { n: "05", title: "Тестирование", desc: "Функциональное и нагрузочное тестирование, фикс багов.", dur: "2–5 дней" },
  { n: "06", title: "Запуск", desc: "Деплой на сервер, настройка CI/CD и мониторинга.", dur: "1–2 дня" },
  { n: "07", title: "Поддержка", desc: "Мониторинг, обновления, доработки и консультации.", dur: "Ongoing" },
];

const displayServices = computed<DisplayService[]>(() => {
  if (!services.value.length) return fallbackServices;

  return services.value.slice(0, 7).map((service, index) => ({
    n: toNumber(index + 1),
    title: service.name || service.title || fallbackServices[index]?.title || "Услуга",
    desc: service.description || service.about || fallbackServices[index]?.desc || "Проектируем и запускаем продукт под задачу бизнеса.",
    meta: service.features?.slice(0, 3).map((feature) => feature.text) || fallbackServices[index]?.meta || [],
  }));
});

const displayStackGroups = computed<StackGroup[]>(() => {
  if (!techStack.value.length) return fallbackStackGroups;

  const grouped = techStack.value.reduce<Record<string, string[]>>((acc, item) => {
    const name = item.name?.trim();
    if (!name) return acc;

    let key = normalizeStackCategory(item.category);
    if (key === "backend" && devOpsTechNames.has(normalizeTechName(name))) key = "devops";

    acc[key] ||= [];
    acc[key].push(name);
    return acc;
  }, {});

  return fallbackStackGroups.map((fallback) => {
    const key = normalizeStackCategory(fallback.title);

    return {
      ...fallback,
      items: mergeStackItems(grouped[key] || [], fallback.items),
    };
  });
});

const displayClients = computed(() => {
  if (clientTypes.value.length) return clientTypes.value.slice(0, 7).map((client) => client.title);
  if (projects.value.length) return projects.value.slice(0, 7).map((project) => project.type || project.name);
  return fallbackClients;
});

const displayStages = computed<DisplayStage[]>(() => {
  if (!workStages.value.length) return fallbackStages;

  return workStages.value.slice(0, 7).map((stage, index) => ({
    n: toNumber(stage.step_number || index + 1),
    title: stage.title,
    desc: stage.description || stage.full_description,
    dur: stage.duration || fallbackStages[index]?.dur || "По плану",
  }));
});

const contactEmail = computed(() => settings.value?.contact_email || "contact@vezha.digital");

function toNumber(value: number) {
  return value.toString().padStart(2, "0");
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

  return [...primary, ...fallback].filter((item) => {
    const key = normalizeTechName(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);
}

function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme.value);
  localStorage.setItem("vz_theme", theme.value);
}

function runPreloader() {
  const seen = sessionStorage.getItem("vz_loaded") === "1";
  if (seen) {
    showPreloader.value = false;
    return;
  }

  const duration = 1150;
  const started = performance.now();

  const step = (now: number) => {
    const progress = Math.min(1, (now - started) / duration);
    introProgress.value = Math.round((1 - Math.pow(1 - progress, 2)) * 100);

    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }

    sessionStorage.setItem("vz_loaded", "1");
    if (preloaderRef.value) {
      preloaderRef.value.style.transform = "translateY(-100%)";
      preloaderRef.value.style.pointerEvents = "none";
    }
    window.setTimeout(() => {
      showPreloader.value = false;
    }, 900);
  };

  requestAnimationFrame(step);
}

function setupReveals() {
  const root = rootRef.value;
  if (!root) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
    if (element.dataset.revealed) return;
    element.style.transform = "translateY(110%)";
    element.style.opacity = "0";
    element.style.willChange = "transform";
  });

  root.querySelectorAll<HTMLElement>("[data-clip-reveal]").forEach((element) => {
    if (element.dataset.clipped) return;
    element.style.clipPath = "inset(0 100% 0 0)";
  });

  root.querySelectorAll<HTMLElement>("[data-rise]").forEach((element) => {
    if (element.dataset.risen) return;
    element.style.opacity = "0";
    element.style.transform = "translateY(48px)";
    element.style.willChange = "transform, opacity";
  });
}

function scanReveals() {
  const root = rootRef.value;
  if (!root) return;
  const vh = window.innerHeight;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
    const wrap = element.parentElement || element;
    const rect = wrap.getBoundingClientRect();
    const inView = rect.top < vh * 0.92 && rect.bottom > -40;

    if (reduceMotion || inView) {
      if (!element.dataset.revealed) {
        element.dataset.revealed = "1";
        element.style.transition = "transform .9s cubic-bezier(.22,1,.36,1), opacity .9s ease";
      }
      element.style.transform = "translateY(0)";
      element.style.opacity = "1";
    }
  });

  root.querySelectorAll<HTMLElement>("[data-clip-reveal]").forEach((element) => {
    const rect = element.getBoundingClientRect();
    const inView = rect.top < vh * 0.86 && rect.bottom > -40;
    if (reduceMotion || inView) {
      if (!element.dataset.clipped) {
        element.dataset.clipped = "1";
        element.style.transition = "clip-path 1.5s cubic-bezier(.16,1,.3,1)";
      }
      element.style.clipPath = "inset(0 0% 0 0)";
    }
  });

  root.querySelectorAll<HTMLElement>("[data-rise]").forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const inView = rect.top < vh * 0.9 && rect.bottom > -40;

    if (reduceMotion || inView) {
      if (!element.dataset.risen) {
        element.dataset.risen = "1";
        element.style.transition = "transform .8s cubic-bezier(.22,1,.36,1), opacity .8s ease";
        element.style.transitionDelay = `${(index % 3) * 0.08 + Math.floor(index / 3) * 0.05}s`;
      }
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }
  });
}

function updateScrollEffects() {
  const root = rootRef.value;
  if (!root) return;
  scanReveals();

  const stack = root.querySelector<HTMLElement>("[data-stack-section]");
  const stackItems = root.querySelectorAll<HTMLElement>("[data-stack-item]");
  const stackFill = root.querySelector<HTMLElement>("[data-line-fill]");
  const stackCounter = root.querySelector<HTMLElement>("[data-stack-counter]");

  if (stack && stackItems.length) {
    const rect = stack.getBoundingClientRect();
    const total = stack.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, total > 0 ? -rect.top / total : 0));
    const active = Math.min(stackItems.length - 1, Math.floor(progress * stackItems.length));

    stackItems.forEach((item, index) => {
      const isActive = index === active;
      const isPast = index < active;
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";

      const dot = item.querySelector<HTMLElement>("[data-dot]");
      const label = item.querySelector<HTMLElement>("[data-label]");
      const halo = item.querySelector<HTMLElement>("[data-halo]");
      if (dot) {
        dot.style.background = isActive ? "var(--ink)" : "var(--dot)";
        dot.style.borderColor = isActive || isPast ? "var(--ink)" : "var(--dotbd)";
        dot.style.transform = `scale(${isActive ? 1.3 : 1})`;
      }
      if (label) label.style.color = isActive || isPast ? "var(--ink)" : "var(--idle)";
      if (halo) halo.style.opacity = isActive ? "1" : "0";
    });

    if (stackFill) stackFill.style.height = `${(progress * 100).toFixed(2)}%`;
    if (stackCounter) stackCounter.textContent = toNumber(active + 1);
  }

  const servicesSection = root.querySelector<HTMLElement>("[data-services-pin]");
  if (!servicesSection) return;
  const panels = root.querySelectorAll<HTMLElement>("[data-serv-panel]");
  const navs = root.querySelectorAll<HTMLElement>("[data-serv-nav]");
  const screens = root.querySelectorAll<HTMLElement>("[data-screen]");
  const bar = root.querySelector<HTMLElement>("[data-serv-bar]");
  const counter = root.querySelector<HTMLElement>("[data-serv-counter]");
  const total = servicesSection.offsetHeight - window.innerHeight;
  const rect = servicesSection.getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, total > 0 ? -rect.top / total : 0));
  const introProgress = Math.max(0, Math.min(1, (progress - 0.1) / 0.12));
  const carouselProgress = Math.max(0, Math.min(1, (progress - 0.19) / 0.81));
  const frame = carouselProgress * Math.max(0, panels.length - 1);
  const active = Math.round(frame);

  panels.forEach((panel, index) => {
    const distance = frame - index;
    const isActive = index === active;
    panel.style.opacity = isActive ? "1" : "0";
    panel.style.transform = `translateY(${(-distance * 46).toFixed(1)}px)`;
    panel.style.pointerEvents = isActive ? "auto" : "none";
  });

  screens.forEach((screen, index) => {
    const distance = index - frame;
    screen.style.transform = `translateX(${(distance * 100).toFixed(2)}%)`;
    screen.style.opacity = Math.max(0, 1.12 - Math.abs(distance)).toFixed(3);
    screen.style.zIndex = Math.abs(distance) < 0.5 ? "3" : "2";
  });

  const easedOpen = introProgress * introProgress * (3 - 2 * introProgress);
  const mac = root.querySelector<HTMLElement>("[data-device-mac]");
  if (mac) {
    mac.style.opacity = "1";
    mac.style.transform = "translateX(0)";
    const lid = mac.querySelector<HTMLElement>("[data-mac-lid]");
    const screenWrap = mac.querySelector<HTMLElement>("[data-screen-wrap]");
    if (lid) lid.style.transform = `rotateX(${(-(1 - easedOpen) * 90).toFixed(1)}deg)`;
    if (screenWrap) screenWrap.style.opacity = Math.max(0, Math.min(1, (easedOpen - 0.55) / 0.35)).toFixed(3);
  }

  navs.forEach((nav, index) => {
    const on = index === active;
    const label = nav.querySelector<HTMLElement>("[data-serv-nav-label]");
    const num = nav.querySelector<HTMLElement>("[data-serv-nav-num]");
    if (label) {
      label.style.color = on ? "var(--ink)" : "var(--muted2)";
      label.style.fontWeight = on ? "600" : "400";
    }
    if (num) num.style.color = on ? "var(--ink)" : "var(--hair)";
    nav.style.borderBottomColor = on ? "var(--ink)" : "var(--border)";
    nav.style.paddingLeft = on ? "12px" : "2px";
  });

  if (bar) bar.style.width = `${(carouselProgress * 100).toFixed(2)}%`;
  if (counter) counter.textContent = `${toNumber(active + 1)} / ${toNumber(panels.length)}`;
}

function scrollToService(index: number) {
  const root = rootRef.value;
  const section = root?.querySelector<HTMLElement>("[data-services-pin]");
  if (!section) return;

  const total = section.offsetHeight - window.innerHeight;
  const target = section.offsetTop + (displayServices.value.length > 1 ? index / (displayServices.value.length - 1) : 0) * total;
  window.scrollTo({ top: target, behavior: "smooth" });
}

let raf = 0;
function scheduleUpdate() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    updateScrollEffects();
  });
}

onMounted(async () => {
  theme.value = localStorage.getItem("vz_theme") || "light";
  document.documentElement.setAttribute("data-theme", theme.value);
  runPreloader();
  setupReveals();
  scanReveals();
  updateScrollEffects();
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);

  try {
    const [
      servicesData,
      projectsData,
      advantagesData,
      techStackData,
      workStagesData,
      settingsData,
      clientTypeData,
    ] = await Promise.all([
      getServices(),
      getProjects(),
      getAdvantages(),
      getTechStack(),
      getWorkStages(),
      getSettings(),
      getClientTypes(),
    ]);

    services.value = servicesData;
    projects.value = projectsData;
    advantages.value = advantagesData;
    techStack.value = techStackData;
    workStages.value = workStagesData;
    settings.value = settingsData.settings;
    clientTypes.value = clientTypeData;
    await nextTick();
    setupReveals();
    updateScrollEffects();
  } catch (error) {
    console.info("VEZHA public data fallback is active:", error);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", scheduleUpdate);
  window.removeEventListener("resize", scheduleUpdate);
  if (raf) cancelAnimationFrame(raf);
});

watch(displayServices, async () => {
  await nextTick();
  updateScrollEffects();
});

useHead({
  title: "VEZHA Digital - Веб-разработка под ключ",
  meta: [
    {
      name: "description",
      content: "Разработка Telegram Mini Apps, ботов, веб-сайтов, интернет-магазинов, AI и корпоративных систем.",
    },
    { property: "og:title", content: "VEZHA Digital - продукты, которые работают в бизнесе" },
    { property: "og:description", content: "Команда полного цикла для Telegram, web, AI и корпоративных систем." },
    { property: "og:type", content: "website" },
  ],
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
    },
  ],
});
</script>

<style>
.vz-min,
.vz-min * {
  box-sizing: border-box;
}

.vz-min {
  --bg: #ffffff;
  --ink: #1c1d21;
  --text2: #565a62;
  --text3: #6b6f77;
  --chipink: #45484e;
  --muted: #9ba0a8;
  --muted2: #b9bdc3;
  --idle: #c2c6cc;
  --hair: #cdd1d6;
  --border: #ececef;
  --border2: #f0f1f3;
  --surface: #f6f7f9;
  --surface-bd: #eceef0;
  --hover: #fafbfc;
  --chipbd: #e5e7ea;
  --ghost: #f1f2f4;
  --dotbd: #d9dce0;
  --dot: #ffffff;
  --btnhover: #36373d;
  --slash: #dcdfe3;
  --navbg: rgba(255, 255, 255, 0.72);
  --halo: rgba(28, 29, 33, 0.07);
  --slate: #3f4d5b;
  --aura: rgba(63, 77, 91, 0.1);
  --alu1: #eceef0;
  --alu2: #cfd2d6;
  --alu3: #b7babf;
  --bezel: #0c0c0e;
  --code: #d7dce4;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: "Onest", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.vz-min[data-theme="dark"] {
  --bg: #0e0f12;
  --ink: #f2f3f5;
  --text2: #a6acb4;
  --text3: #969ca4;
  --chipink: #c6cbd1;
  --muted: #79808a;
  --muted2: #5c626b;
  --idle: #41464e;
  --hair: #34383f;
  --border: #26282d;
  --border2: #1b1d21;
  --surface: #15171b;
  --surface-bd: #212429;
  --hover: #181a1e;
  --chipbd: #2b2e34;
  --ghost: #191b1f;
  --dotbd: #3b404a;
  --dot: #ffffff;
  --btnhover: #d9dbdf;
  --slash: #34383f;
  --navbg: rgba(14, 15, 18, 0.66);
  --halo: rgba(255, 255, 255, 0.28);
  --slate: #3f4d5b;
  --aura: rgba(63, 77, 91, 0.24);
  --alu1: #bfc2c8;
  --alu2: #94979e;
  --alu3: #787b82;
  --bezel: #050506;
  --code: #2b3a5a;
}

.vz-min ::selection {
  background: var(--ink);
  color: var(--bg);
}

@keyframes vz-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes vz-orbit {
  to { transform: rotate(360deg); }
}

.vz-preloader {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  background: var(--bg);
  transition: transform 0.9s cubic-bezier(0.76, 0, 0.24, 1);
}

.vz-preloader__top,
.vz-preloader__meta,
.vz-section-label,
.vz-hero__meta,
.vz-hero__kicker,
.vz-hero__stats,
.vz-scroll-hint,
.vz-footer__top,
.vz-footer__cols > div > span,
.vz-footer__sign > div,
.vz-footer__legal,
.vz-services__counter,
.vz-stage-row > span:first-child,
.vz-stage-row > span:last-child {
  font-family: "JetBrains Mono", monospace;
}

.vz-preloader__top {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}

.vz-preloader__bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
}

.vz-preloader__count {
  color: var(--ink);
  font-family: "JetBrains Mono", monospace;
  font-size: clamp(72px, 17vw, 230px);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 0.86;
}

.vz-preloader__count span:last-child {
  color: var(--idle);
}

.vz-preloader__meta {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.16em;
  line-height: 1.7;
  text-align: right;
  text-transform: uppercase;
}

.vz-nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  display: flex;
  height: 68px;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  border-bottom: 1px solid var(--border);
  background: var(--navbg);
  backdrop-filter: saturate(1.4) blur(14px);
}

.vz-logo {
  display: flex;
  align-items: baseline;
  gap: 7px;
  color: var(--ink);
  text-decoration: none;
}

.vz-logo span {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.vz-logo small {
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.vz-nav__links {
  display: flex;
  align-items: center;
  gap: 30px;
}

.vz-nav__links a,
.vz-footer a {
  color: var(--text2);
  text-decoration: none;
}

.vz-nav__links a {
  font-size: 14px;
}

.vz-nav__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vz-icon-button,
.vz-menu-button {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
}

.vz-nav__cta,
.vz-button,
.vz-mobile-menu__cta {
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
}

.vz-nav__cta {
  padding: 11px 20px;
  background: var(--ink);
  color: var(--bg);
  font-size: 14px;
}

.vz-menu-button {
  display: none;
  flex-direction: column;
  gap: 4px;
}

.vz-menu-button span {
  display: block;
  width: 17px;
  height: 1.5px;
  background: var(--ink);
}

.vz-mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 150;
  display: flex;
  flex-direction: column;
  padding: 22px 24px 40px;
  background: var(--bg);
}

.vz-mobile-menu__top,
.vz-mobile-menu__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vz-mobile-menu__links {
  display: flex;
  flex-direction: column;
  margin-top: 38px;
}

.vz-mobile-menu__links a {
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  color: var(--ink);
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-decoration: none;
  text-transform: uppercase;
}

.vz-mobile-menu__cta {
  margin-top: 30px;
  padding: 17px;
  background: var(--ink);
  color: var(--bg);
  font-size: 16px;
  text-align: center;
}

.vz-mobile-menu__bottom {
  margin-top: auto;
  padding-top: 30px;
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.vz-hero {
  position: relative;
  max-width: 1240px;
  margin: 0 auto;
  padding: 150px 40px 92px;
}

.vz-hero__art,
.vz-contacts__art {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.vz-aura,
.vz-contacts__art > div {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--aura) 0%, transparent 70%);
}

.vz-aura--top {
  top: -110px;
  right: -150px;
  width: 540px;
  height: 540px;
}

.vz-aura--bottom {
  bottom: -250px;
  left: 3%;
  width: 480px;
  height: 480px;
}

.vz-orbit {
  position: absolute;
  top: 52%;
  right: 1%;
  width: min(56vmin, 540px);
  height: min(56vmin, 540px);
  transform: translateY(-50%);
}

.vz-orbit svg {
  width: 100%;
  height: 100%;
  color: var(--hair);
  opacity: 0.55;
  animation: vz-orbit 48s linear infinite;
  transform-origin: 50% 50%;
}

.vz-corner {
  position: absolute;
  width: 11px;
  height: 11px;
}

.vz-corner i,
.vz-corner b {
  position: absolute;
  display: block;
  background: var(--muted2);
}

.vz-corner i {
  top: 0;
  left: 50%;
  width: 1px;
  height: 100%;
  transform: translateX(-50%);
}

.vz-corner b {
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  transform: translateY(-50%);
}

.vz-corner--1 { top: 26px; left: 26px; }
.vz-corner--2 { top: 26px; right: 26px; }
.vz-corner--3 { bottom: 26px; left: 26px; }
.vz-corner--4 { right: 26px; bottom: 26px; }

.vz-hero__inner,
.vz-contacts__inner {
  position: relative;
  z-index: 1;
}

.vz-hero__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.vz-hero__kicker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 58px;
  color: var(--muted2);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.vz-hero__kicker span:first-child {
  color: var(--ink);
}

.vz-hero h1 {
  margin: 22px 0 0;
  font-size: clamp(42px, 7vw, 104px);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 0.95;
  text-transform: uppercase;
}

.vz-hero h1 > span,
.vz-services h2 > span,
.vz-clients h2 > span,
.vz-stages h2 > span,
.vz-contacts h2 > span {
  display: block;
  overflow: hidden;
  padding-bottom: 0.08em;
}

.vz-hero h1 > span {
  padding-bottom: 0.06em;
}

.vz-hero h1 span span,
.vz-services h2 span span,
.vz-clients h2 span span,
.vz-stages h2 span span,
.vz-contacts h2 span span {
  display: block;
}

.vz-hero__grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 60px;
  align-items: end;
  margin-top: 50px;
}

.vz-hero__grid p {
  max-width: 52ch;
  margin: 0;
  color: var(--text2);
  font-size: 19px;
  line-height: 1.55;
}

.vz-hero__actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-start;
  justify-self: end;
}

.vz-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.vz-button--dark {
  padding: 16px 28px;
  background: var(--ink);
  color: var(--bg);
}

.vz-button--light {
  padding: 17px 28px;
  border: 1px solid var(--dotbd);
  color: var(--ink);
}

.vz-button-link {
  display: inline-flex;
  gap: 9px;
  padding-left: 4px;
  color: var(--ink);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
}

.vz-hero__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 58px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vz-hero__stats span:nth-child(even) {
  color: var(--slash);
}

.vz-marquee {
  overflow: hidden;
  padding: 22px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.vz-marquee > div {
  display: inline-flex;
  white-space: nowrap;
  animation: vz-marquee 32s linear infinite;
  will-change: transform;
}

.vz-marquee span {
  display: inline-flex;
  align-items: center;
  padding: 0 24px;
  color: var(--ink);
  font-size: clamp(20px, 2.4vw, 30px);
  font-weight: 600;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}

.vz-marquee i {
  margin-left: 24px;
  color: var(--hair);
  font-style: normal;
}

.vz-about {
  padding: 120px 40px 110px;
}

.vz-about__grid,
.vz-clients__grid {
  display: grid;
  max-width: 1240px;
  margin: 0 auto;
}

.vz-about__grid {
  grid-template-columns: 300px 1fr;
  gap: 80px;
}

.vz-section-label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.vz-section-label i {
  margin: 0 9px;
  color: var(--hair);
  font-style: normal;
}

.vz-about__copy {
  max-width: 720px;
}

.vz-about__lead {
  margin: 0;
  font-size: clamp(26px, 3vw, 38px);
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.3;
}

.vz-about__cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  margin-top: 48px;
}

.vz-about__cols p,
.vz-sec-meta p,
.vz-stage-row p,
.vz-stages__head p,
.vz-service-panel p {
  color: var(--text2);
  line-height: 1.65;
}

.vz-about__cols p {
  margin: 0;
  font-size: 16px;
}

.vz-stack,
.vz-services {
  position: relative;
  border-top: 1px solid var(--border2);
}

.vz-stack {
  min-height: 380vh;
}

.vz-services {
  min-height: 580vh;
}

.vz-sticky {
  position: sticky;
  top: 0;
  display: flex;
  height: 100vh;
  align-items: center;
  overflow: hidden;
}

.vz-sticky__inner {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 40px;
}

.vz-sec-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 40px;
  margin-bottom: 52px;
}

.vz-sec-head h2,
.vz-clients h2,
.vz-stages h2,
.vz-contacts h2 {
  margin: 0;
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.05;
  text-transform: uppercase;
}

.vz-sec-head h2 {
  max-width: 640px;
  margin-top: 20px;
  font-size: clamp(32px, 4vw, 52px);
}

.vz-sec-meta {
  max-width: 360px;
  flex-shrink: 0;
}

.vz-sec-meta div {
  color: var(--ink);
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  letter-spacing: 0.06em;
}

.vz-sec-meta div span {
  font-size: 40px;
  font-weight: 500;
}

.vz-sec-meta div i {
  color: var(--muted2);
  font-size: 17px;
  font-style: normal;
}

.vz-sec-meta p {
  margin: 12px 0 0;
  font-size: 14px;
}

.vz-stack__timeline {
  position: relative;
}

.vz-stack__line {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 281px;
  width: 1px;
  background: var(--border);
}

.vz-stack__line span {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 0%;
  background: var(--ink);
}

.vz-stack-item {
  display: grid;
  grid-template-columns: 240px 80px 1fr;
  align-items: center;
  min-height: 116px;
  opacity: 1;
  transform: translateY(0);
}

.vz-stack-item > div:first-child {
  padding-right: 24px;
  color: var(--idle);
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-align: right;
  transition: color 0.25s ease;
}

.vz-stack-item > div:nth-child(2) {
  position: relative;
  display: flex;
  justify-content: center;
}

.vz-stack-item [data-halo] {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--halo);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.vz-stack-item [data-dot] {
  position: relative;
  width: 15px;
  height: 15px;
  border: 2px solid var(--dotbd);
  border-radius: 50%;
  background: var(--bg);
  transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
}

.vz-stack-item p {
  max-width: 46ch;
  margin: 0 0 16px;
  color: var(--text2);
  font-size: 16px;
  line-height: 1.55;
}

.vz-stack-item > div:last-child > div,
.vz-service-panel [data-serv-metawrap] {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.vz-stack-item span:not([data-dot], [data-halo]),
.vz-service-panel [data-serv-metawrap] span {
  padding: 7px 13px;
  border: 1px solid var(--chipbd);
  border-radius: 999px;
  color: var(--chipink);
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  letter-spacing: 0.03em;
}

.vz-scroll-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 46px;
  color: var(--muted2);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.vz-services h2,
.vz-stages h2 {
  font-size: clamp(34px, 4.4vw, 56px);
}

.vz-services__counter {
  flex-shrink: 0;
  color: var(--ink);
  font-size: 14px;
  letter-spacing: 0.08em;
}

.vz-services__grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 70px;
  align-items: start;
}

.vz-services__nav {
  border-top: 1px solid var(--border);
}

.vz-services__nav button {
  display: flex;
  width: 100%;
  align-items: baseline;
  gap: 16px;
  padding: 13px 2px;
  border: 0;
  border-bottom: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: padding-left 0.3s cubic-bezier(0.76, 0, 0.24, 1);
}

.vz-services__nav button span:first-child {
  color: var(--hair);
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  letter-spacing: 0.04em;
}

.vz-services__nav button span:last-child {
  color: var(--muted2);
  font-size: 17px;
  letter-spacing: -0.01em;
}

.vz-services__stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  min-height: 0;
}

.vz-services__devices {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 372px;
  align-items: center;
  justify-items: center;
}

.vz-device-mac {
  grid-area: 1 / 1;
  opacity: 1;
  will-change: transform, opacity;
}

.vz-macbook {
  --sw: clamp(280px, 38vw, 500px);
  position: relative;
  perspective: 1800px;
}

.vz-macbook__tilt {
  transform: rotateX(4deg);
  transform-style: preserve-3d;
}

.vz-macbook__lid {
  position: relative;
  width: var(--sw);
  padding: 10px 10px 12px;
  border-radius: 18px 18px 6px 6px;
  background: linear-gradient(155deg, #34373d, #141619 62%);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 9%), inset 0 -2px 3px rgb(0 0 0 / 45%), 0 42px 70px -22px rgb(0 0 0 / 62%);
  transform-origin: center bottom;
  will-change: transform;
}

.vz-macbook__notch {
  position: absolute;
  top: 9px;
  left: 50%;
  z-index: 4;
  width: 94px;
  height: 15px;
  border-radius: 0 0 9px 9px;
  background: #0a0a0c;
  transform: translateX(-50%);
}

.vz-macbook__screen-wrap {
  position: relative;
  width: 100%;
  height: calc(var(--sw) * 0.625);
  overflow: hidden;
  border-radius: 9px;
  background: var(--bg);
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 35%);
  transition: opacity 0.12s linear;
}

.vz-screen {
  position: absolute;
  inset: 0;
  opacity: 0;
  overflow: hidden;
  background: var(--bg);
  color: var(--ink);
  font-family: "Onest", system-ui, sans-serif;
  will-change: opacity, transform;
}

.vz-screen-shine {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  background: linear-gradient(118deg, rgb(255 255 255 / 10%), transparent 42%);
}

.vz-screen-topbar,
.vz-screen-chatbar,
.vz-browserbar,
.vz-shop-top,
.vz-ai-top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 13px;
  border-bottom: 1px solid var(--border);
}

.vz-screen-topbar {
  justify-content: space-between;
}

.vz-screen-topbar span,
.vz-screen-chatbar span,
.vz-ai-top span {
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background: var(--ink);
}

.vz-screen-topbar i,
.vz-browserbar i {
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 8px;
  font-style: normal;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.vz-screen-hero-line {
  height: 60px;
  margin: 11px 13px 0;
  border-radius: 10px;
  background: linear-gradient(120deg, var(--slate), #29323c);
}

.vz-screen-cards,
.vz-shop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  padding: 11px 13px 0;
}

.vz-screen-cards b,
.vz-shop-grid i {
  min-height: 58px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: linear-gradient(var(--surface), var(--surface)) content-box;
  padding: 7px;
}

.vz-screen-button {
  height: 30px;
  margin: 11px 13px 13px;
  border-radius: 8px;
  background: var(--ink);
}

.vz-screen-chat,
.vz-screen-miniapp,
.vz-screen-site,
.vz-screen-shop,
.vz-screen-ai,
.vz-screen-corp,
.vz-screen-mobile {
  display: flex;
  height: 100%;
  flex-direction: column;
}

.vz-bubble {
  width: 58%;
  height: 34px;
  margin: 12px 13px 0;
  border-radius: 11px 11px 11px 3px;
  background: var(--surface);
}

.vz-bubble--right {
  align-self: flex-end;
  border-radius: 11px 11px 3px 11px;
  background: var(--ink);
}

.vz-bubble--choice {
  width: 68%;
  height: 56px;
}

.vz-chat-input {
  height: 46px;
  margin-top: auto;
  border-top: 1px solid var(--border);
}

.vz-browserbar {
  background: var(--surface);
}

.vz-browserbar span {
  width: 40px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, #e0655a 0 8px, #e6b34d 8px 22px, #57b96a 22px 36px);
}

.vz-site-grid {
  display: grid;
  flex: 1;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 14px;
  align-items: center;
  padding: 16px 15px;
}

.vz-site-grid div,
.vz-site-grid b {
  height: 108px;
  border-radius: 10px;
}

.vz-site-grid div {
  background: repeating-linear-gradient(to bottom, var(--ink), var(--ink) 10px, transparent 10px, transparent 17px);
}

.vz-site-grid b {
  background: linear-gradient(135deg, var(--surface), var(--border));
}

.vz-shop-grid {
  grid-template-columns: repeat(3, 1fr);
  flex: 1;
}

.vz-shop-top {
  justify-content: space-between;
}

.vz-shop-top span,
.vz-ai-top b {
  width: 70px;
  height: 7px;
  border-radius: 999px;
  background: var(--ink);
}

.vz-shop-top b {
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border-radius: 6px;
  background: var(--ink);
  color: var(--bg);
  font-size: 10px;
}

.vz-ai-answer {
  display: flex;
  gap: 8px;
  padding: 12px 13px 0;
}

.vz-ai-answer span {
  display: grid;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid var(--ink);
  border-radius: 5px;
  font-size: 9px;
}

.vz-ai-answer i,
.vz-ai-plan {
  flex: 1;
  min-height: 44px;
  border-radius: 8px;
  background: var(--surface);
}

.vz-ai-plan {
  margin: 10px 13px 0;
  border: 1px solid var(--border);
}

.vz-ai-flow {
  display: flex;
  gap: 6px;
  margin: 10px 13px 0;
}

.vz-ai-flow b {
  flex: 1;
  height: 20px;
  border-radius: 6px;
  background: var(--surface);
}

.vz-ai-flow b:last-child {
  background: var(--ink);
}

.vz-screen-corp {
  flex-direction: row;
}

.vz-corp-side {
  width: 46px;
  border-right: 1px solid var(--border);
  background: var(--surface);
}

.vz-corp-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 12px 14px;
}

.vz-corp-head {
  height: 28px;
  margin-bottom: 12px;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--ink) 0 35%, transparent 35% 100%);
}

.vz-corp-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 11px;
}

.vz-corp-cards b {
  height: 48px;
  border: 1px solid var(--border);
  border-radius: 7px;
}

.vz-corp-chart {
  display: flex;
  flex: 1;
  align-items: flex-end;
  gap: 7px;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.vz-corp-chart i {
  flex: 1;
  height: 50%;
  border-radius: 3px 3px 0 0;
  background: var(--surface);
}

.vz-corp-chart i:nth-child(2),
.vz-corp-chart i:nth-child(5) {
  height: 78%;
  background: var(--slate);
}

.vz-corp-chart i:nth-child(4) {
  height: 92%;
  background: var(--ink);
}

.vz-screen-mobile {
  flex-direction: row;
}

.vz-code-pane {
  flex: 1.2;
  padding: 12px 14px;
  border-right: 1px solid var(--border);
  color: var(--ink);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  line-height: 1.55;
}

.vz-code-pane span {
  display: block;
  color: var(--muted2);
}

.vz-code-pane b,
.vz-code-pane i {
  display: block;
  font-style: normal;
  font-weight: 400;
}

.vz-phone-pane {
  display: flex;
  flex: 0.82;
  align-items: center;
  justify-content: center;
  background: var(--surface);
}

.vz-phone {
  position: relative;
  height: 84%;
  aspect-ratio: 118 / 240;
  padding: 5px;
  border-radius: 22px;
  background: #0b0b0d;
  box-shadow: 0 14px 24px -12px rgb(0 0 0 / 50%);
}

.vz-phone span {
  position: absolute;
  top: 8px;
  left: 50%;
  z-index: 3;
  width: 34px;
  height: 10px;
  border-radius: 999px;
  background: #000;
  transform: translateX(-50%);
}

.vz-phone b {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 17px;
  background: var(--bg);
}

.vz-macbook__base {
  position: relative;
  width: calc(var(--sw) + 40px);
  margin-left: -20px;
}

.vz-macbook__base span {
  display: block;
  height: 4px;
  border-radius: 3px 3px 0 0;
  background: linear-gradient(#828791, #4d515a);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 40%);
}

.vz-macbook__base i {
  display: block;
  height: 16px;
  border-radius: 0 0 13px 13px;
  background: linear-gradient(#3c3f46, #1b1d21);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 12%), inset 0 -2px 3px rgb(0 0 0 / 55%), 0 3px 5px rgb(0 0 0 / 30%);
}

.vz-macbook__shadow {
  position: relative;
  z-index: -1;
  width: calc(var(--sw) * 0.94);
  height: 44px;
  margin: -8px auto 0;
  background: radial-gradient(ellipse, rgb(0 0 0 / 36%), transparent 68%);
  filter: blur(13px);
}

.vz-service-caption {
  position: relative;
  width: 100%;
  max-width: 640px;
  min-height: 128px;
}

.vz-service-panel {
  position: absolute;
  inset: 0;
  opacity: 0;
  will-change: opacity, transform;
}

.vz-service-panel__title {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.vz-service-panel__title span {
  color: var(--muted2);
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
}

.vz-service-panel h3 {
  margin: 0;
  font-size: clamp(23px, 2.3vw, 31px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.05;
  text-transform: uppercase;
}

.vz-service-panel p {
  max-width: 54ch;
  margin: 13px 0 0;
  font-size: 15px;
  line-height: 1.5;
}

.vz-service-panel [data-serv-metawrap] {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.vz-services__bar {
  position: relative;
  overflow: hidden;
  height: 2px;
  margin-top: 48px;
  background: var(--border);
}

.vz-services__bar span {
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 2px;
  background: var(--ink);
  transition: width 0.12s linear;
}

.vz-services .vz-scroll-hint {
  margin-top: 18px;
}

.vz-clients {
  padding: 120px 40px;
  border-top: 1px solid var(--surface-bd);
  background: var(--surface);
}

.vz-clients__grid {
  grid-template-columns: 360px 1fr;
  gap: 80px;
  align-items: center;
}

.vz-clients h2 {
  margin-top: 22px;
  font-size: clamp(30px, 3.6vw, 46px);
}

.vz-client-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.vz-client-tags span {
  padding: 14px 22px;
  border: 1px solid var(--chipbd);
  border-radius: 999px;
  background: var(--bg);
  color: var(--ink);
  font-size: 16px;
}

.vz-stages {
  position: relative;
  overflow: hidden;
  padding: 132px 40px 140px;
  border-top: 1px solid var(--border2);
  background: var(--bg);
  color: var(--ink);
}

.vz-stages__aura {
  position: absolute;
  top: -150px;
  right: -110px;
  z-index: 0;
  width: 780px;
  height: 660px;
  background: radial-gradient(ellipse at top right, var(--aura), transparent 62%);
  pointer-events: none;
}

.vz-go-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  color: var(--code);
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  line-height: 1.5;
  opacity: 0.55;
  pointer-events: none;
}

.vz-go-layer pre {
  position: absolute;
  top: 96px;
  left: 30px;
  margin: 0;
  white-space: pre;
}

.vz-go-layer pre:last-child {
  top: 150px;
  right: 30px;
  left: auto;
}

.vz-wrap {
  position: relative;
  z-index: 2;
  max-width: 1240px;
  margin: 0 auto;
}

.vz-stages__head {
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}

.vz-stages__head .vz-section-label {
  display: inline-flex;
  margin-bottom: 26px;
}

.vz-stages__head h2 {
  max-width: none;
  margin: 0;
  font-size: clamp(40px, 6vw, 82px);
  letter-spacing: -0.03em;
  line-height: 1;
}

.vz-stages__head p {
  max-width: 50ch;
  margin: 26px auto 0;
  color: var(--text2);
  font-size: 18px;
  line-height: 1.5;
}

.vz-stage-cards {
  position: relative;
  z-index: 2;
  display: grid;
  max-width: 1180px;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  margin: 78px auto 0;
}

.vz-stage-cards > .vz-stage-card:nth-child(3n + 2) {
  margin-top: 64px;
}

.vz-stage-cards > .vz-stage-card:nth-child(3n) {
  margin-top: 32px;
}

.vz-stage-card {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 246px;
  padding: 30px 30px 26px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--surface);
}

.vz-stage-card--dark {
  border-color: var(--ink);
  background: var(--ink);
}

.vz-stage-card__num {
  position: absolute;
  right: 16px;
  bottom: -8px;
  color: color-mix(in srgb, var(--ink) 6%, transparent);
  font-family: "JetBrains Mono", monospace;
  font-size: 104px;
  font-weight: 500;
  line-height: 1;
  pointer-events: none;
}

.vz-stage-card--dark .vz-stage-card__num {
  color: color-mix(in srgb, var(--bg) 16%, transparent);
}

.vz-stage-card__content {
  position: relative;
  z-index: 1;
}

.vz-stage-card__content > span {
  display: inline-block;
  padding: 6px 12px;
  border: 1px solid var(--chipbd);
  border-radius: 999px;
  color: var(--muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vz-stage-card--dark .vz-stage-card__content > span {
  border-color: color-mix(in srgb, var(--bg) 42%, transparent);
  color: var(--bg);
}

.vz-stage-card h3 {
  margin: 22px 0 0;
  color: var(--ink);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.vz-stage-card--dark h3 {
  color: var(--bg);
}

.vz-stage-card p {
  margin: 14px 0 0;
  color: var(--text3);
  font-size: 15px;
  line-height: 1.55;
}

.vz-stage-card--dark p {
  color: color-mix(in srgb, var(--bg) 82%, transparent);
}

.vz-contacts {
  position: relative;
  overflow: hidden;
  padding: 140px 40px 120px;
  border-top: 1px solid var(--border2);
}

.vz-contacts__art > div {
  top: 44%;
  left: 50%;
  width: min(64vmin, 660px);
  height: min(64vmin, 660px);
  transform: translate(-50%, -50%);
}

.vz-contacts__inner {
  max-width: 1240px;
  margin: 0 auto;
  text-align: center;
}

.vz-contacts .vz-section-label {
  display: inline-flex;
  margin-bottom: 30px;
}

.vz-contacts h2 {
  max-width: 18ch;
  margin: 0 auto;
  font-size: clamp(40px, 6vw, 80px);
  letter-spacing: -0.03em;
  line-height: 1.02;
}

.vz-contacts__buttons {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 48px;
}

.vz-footer {
  border-top: 1px solid var(--border);
  background: var(--bg);
}

.vz-footer__top,
.vz-footer__cols,
.vz-footer__sign,
.vz-footer__legal {
  max-width: 1240px;
  margin: 0 auto;
}

.vz-footer__top {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 40px;
  border-bottom: 1px solid var(--border);
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.vz-footer__top a {
  color: var(--muted);
}

.vz-footer__cols {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  padding: 64px 40px 52px;
}

.vz-footer__cols > div > span {
  display: block;
  margin-bottom: 14px;
  color: var(--muted2);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.vz-footer__cols strong {
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.vz-footer__cols p,
.vz-footer__cols nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  color: var(--text2);
  font-size: 15px;
  line-height: 1.6;
}

.vz-footer__cols nav a:first-child {
  color: var(--ink);
}

.vz-footer__sign {
  padding: 22px 40px 0;
  border-top: 1px solid var(--border);
}

.vz-footer__sign > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--muted2);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.vz-footer__sign strong {
  display: block;
  overflow: hidden;
  color: var(--ink);
  font-size: clamp(64px, 14vw, 210px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.06;
  text-transform: uppercase;
}

.vz-footer__legal {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 40px 44px;
  color: var(--muted2);
  font-size: 11px;
  letter-spacing: 0.06em;
}

@media (prefers-reduced-motion: reduce) {
  .vz-orbit svg,
  .vz-marquee > div {
    animation: none !important;
  }
}

@media (min-width: 901px) and (max-height: 840px) {
  .vz-macbook {
    --sw: clamp(300px, 33vw, 430px);
  }

  .vz-services [data-sec-head] {
    margin-bottom: 26px;
  }

  .vz-service-caption {
    min-height: 116px;
  }
}

@media (max-width: 900px) {
  .vz-preloader {
    padding: 24px;
  }

  .vz-nav {
    padding: 0 20px;
  }

  .vz-nav__links,
  .vz-nav__cta {
    display: none;
  }

  .vz-menu-button {
    display: flex;
  }

  .vz-hero {
    padding: 112px 20px 60px;
  }

  .vz-hero h1 {
    font-size: clamp(30px, 8.4vw, 46px);
  }

  .vz-hero__grid,
  .vz-about__grid,
  .vz-clients__grid,
  .vz-services__grid {
    grid-template-columns: 1fr;
  }

  .vz-hero__grid {
    gap: 30px;
  }

  .vz-hero__actions {
    justify-self: start;
  }

  .vz-hero__stats {
    gap: 10px 14px;
    margin-top: 44px;
  }

  .vz-about {
    padding: 72px 20px 60px;
  }

  .vz-about__grid {
    gap: 22px;
  }

  .vz-about__lead {
    font-size: 22px;
  }

  .vz-about__cols {
    grid-template-columns: 1fr;
    gap: 18px;
    margin-top: 26px;
  }

  .vz-sticky {
    align-items: flex-start;
    padding-top: 84px;
    padding-bottom: 20px;
  }

  .vz-sticky__inner {
    padding: 0 20px;
  }

  .vz-sec-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 26px;
  }

  .vz-sec-meta {
    display: none;
  }

  .vz-stack h2 {
    max-width: none;
    font-size: 18px;
    line-height: 1.15;
  }

  .vz-services h2 {
    font-size: 26px;
  }

  .vz-stack__line {
    left: 16px;
  }

  .vz-stack-item {
    grid-template-columns: 33px 1fr;
    grid-template-rows: auto auto;
    align-items: start;
    min-height: 0;
    column-gap: 12px;
    row-gap: 2px;
    padding: 7px 0;
  }

  .vz-stack-item > div:first-child {
    grid-column: 2;
    grid-row: 1;
    padding-right: 0;
    font-size: 18px;
    text-align: left;
  }

  .vz-stack-item > div:nth-child(2) {
    grid-column: 1;
    grid-row: 1;
  }

  .vz-stack-item > div:nth-child(3) {
    grid-column: 2;
    grid-row: 2;
  }

  .vz-stack-item p {
    max-width: none;
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 1.4;
  }

  .vz-stack-item span:not([data-dot], [data-halo]) {
    padding: 5px 10px;
    font-size: 11px;
  }

  .vz-stack-item > div:last-child > div {
    gap: 6px;
  }

  [data-stack-hint],
  [data-serv-list] {
    display: none;
  }

  .vz-services__stage {
    align-items: center;
    gap: 22px;
    min-height: 0;
  }

  .vz-services__devices {
    min-height: 300px;
  }

  .vz-macbook {
    --sw: min(80vw, 350px);
  }

  .vz-service-caption {
    min-height: 152px;
  }

  .vz-service-panel h3 {
    font-size: 22px;
  }

  .vz-service-panel p {
    font-size: 14px;
  }

  .vz-service-panel [data-serv-metawrap] {
    margin-top: 14px;
  }

  .vz-services .vz-scroll-hint {
    margin-top: 16px;
  }

  .vz-clients {
    padding: 72px 20px;
  }

  .vz-stages {
    padding: 80px 20px 92px;
  }

  .vz-clients__grid {
    gap: 26px;
  }

  .vz-stage-cards {
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    margin-top: 50px;
  }

  .vz-stage-cards > .vz-stage-card {
    margin-top: 0;
    margin-bottom: 18px;
  }

  .vz-stage-card {
    min-height: 220px;
    padding: 22px 22px 20px;
  }

  .vz-stage-card h3 {
    font-size: 22px;
  }

  .vz-go-layer {
    font-size: 10px;
  }

  .vz-go-layer pre {
    left: 14px;
  }

  .vz-go-layer pre:last-child {
    display: none;
  }

  .vz-contacts {
    padding: 88px 20px 80px;
  }

  .vz-contacts h2 {
    font-size: clamp(26px, 8vw, 40px);
  }

  .vz-contacts__buttons {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .vz-contacts__buttons a {
    justify-content: center;
    text-align: center;
  }

  .vz-footer__top {
    flex-direction: column;
    gap: 8px;
    padding: 20px;
  }

  .vz-footer__cols {
    grid-template-columns: 1fr 1fr;
    gap: 26px 20px;
    padding: 44px 20px 36px;
  }

  .vz-footer__sign {
    padding: 20px 20px 0;
  }

  .vz-footer__legal {
    flex-direction: column;
    gap: 6px;
    padding: 16px 20px 34px;
  }
}

@media (max-width: 900px) and (max-height: 700px) {
  .vz-sticky {
    padding-top: 74px;
  }

  .vz-stack-item > div:nth-child(3) > div {
    display: none;
  }

  .vz-stack-item p {
    margin-bottom: 0;
  }

  .vz-stage-card p,
  .vz-service-panel [data-serv-metawrap] {
    display: none;
  }
}

@media (max-width: 520px) {
  .vz-hero__meta span {
    font-size: 11px;
  }

  .vz-hero h1 {
    font-size: clamp(26px, 8vw, 40px);
  }

  .vz-stage-cards {
    grid-template-columns: 1fr;
  }

  .vz-footer__cols {
    gap: 22px 16px;
  }
}
</style>
