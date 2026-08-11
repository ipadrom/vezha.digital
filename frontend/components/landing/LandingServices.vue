<template>
  <section id="services" ref="rootRef" data-services-pin class="vz-services">
    <div class="vz-sticky">
      <div class="vz-sticky__inner">
        <div class="vz-sec-head" data-sec-head>
          <div>
            <div class="vz-section-label">
              <span>{{ copy.label }}</span><i>/</i><span data-secnum>03</span>
            </div>
            <h2><span><span data-reveal>{{ copy.title }}</span></span></h2>
          </div>
        </div>

        <div class="vz-services__grid" data-serv-grid>
          <div class="vz-services__rail">
            <div
              class="vz-services__nav vz-services__nav--desktop"
              data-serv-list
              role="tablist"
              :aria-label="copy.navAria"
              aria-orientation="horizontal"
              @keydown="onNavKeydown"
            >
              <span class="vz-services__nav-highlight" data-serv-nav-highlight aria-hidden="true"></span>
              <button
                v-for="(service, index) in services"
                :id="`service-tab-${index}`"
                :key="`${service.n}-${service.title}`"
                data-serv-nav
                type="button"
                role="tab"
                :aria-controls="`service-panel-${index}`"
                :aria-label="`${service.n}. ${copy.navLabels[index] ?? service.title}`"
                :aria-selected="index === activeIndex"
                :tabindex="index === activeIndex ? 0 : -1"
                @click="selectService(index)"
              >
                <span data-serv-nav-num>{{ service.n }}</span>
                <span data-serv-nav-label class="vz-services__nav-label-full">{{ service.title }}</span>
                <span data-serv-nav-label class="vz-services__nav-label-compact">{{ copy.navLabels[index] ?? service.title }}</span>
              </button>
            </div>

            <div class="vz-cases__case-nav vz-services__case-nav">
              <div
                class="vz-cases__tabs vz-services__mobile-tabs"
                role="tablist"
                :aria-label="copy.navAria"
                aria-orientation="horizontal"
                @keydown="onNavKeydown"
              >
                <button
                  v-for="(service, index) in services"
                  :id="`service-mobile-tab-${index}`"
                  :key="`mobile-${service.n}-${service.title}`"
                  data-serv-mobile-nav
                  type="button"
                  role="tab"
                  :aria-controls="`service-panel-${index}`"
                  :aria-label="`${service.n}. ${copy.navLabels[index] ?? service.title}`"
                  :aria-selected="index === activeIndex"
                  :tabindex="index === activeIndex ? 0 : -1"
                  @click="selectService(index)"
                >
                  <span>{{ service.n }}</span>
                  <b>{{ copy.navLabels[index] ?? service.title }}</b>
                  <i aria-hidden="true"></i>
                </button>
              </div>

              <div class="vz-cases__mobile-controls" :aria-label="copy.navAria">
                <button type="button" :aria-label="copy.previousAria" @click="move(-1)">
                  <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M9 5 4 10l5 5M4 10h12" /></svg>
                </button>
                <button type="button" :aria-label="copy.nextAria" @click="move(1)">
                  <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m11 5 5 5-5 5M4 10h12" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="vz-service-caption" data-serv-caption aria-live="polite">
            <article
              v-for="(service, index) in services"
              :id="`service-panel-${index}`"
              :key="service.n"
              data-serv-panel
              class="vz-service-panel"
              role="tabpanel"
              :aria-labelledby="`service-tab-${index}`"
            >
              <div class="vz-service-panel__title"><span>{{ service.n }}</span><h3>{{ service.title }}</h3></div>
              <p>{{ service.desc }}</p>
              <div class="vz-service-commercial">
                <div class="vz-service-commercial__metrics">
                  <div>
                    <small>{{ copy.commercialLabels.price }}</small>
                    <strong>{{ copy.commercial[index]?.price }}</strong>
                  </div>
                  <div>
                    <small>{{ copy.commercialLabels.timeline }}</small>
                    <strong>{{ copy.commercial[index]?.timeline }}</strong>
                  </div>
                </div>
                <div class="vz-service-commercial__included" data-serv-included>
                  <small>{{ copy.commercialLabels.included }}</small>
                  <div class="vz-service-commercial__chips" data-serv-metawrap>
                    <span v-for="item in copy.commercial[index]?.included ?? []" :key="item">{{ item }}</span>
                  </div>
                </div>
              </div>
            </article>
            <span class="vz-service-panel__cta-divider" aria-hidden="true"></span>
            <a class="vz-service-panel__cta vz-service-panel__cta--shared" data-serv-shared-cta href="#contacts">
              <span>
                <small>{{ copy.asideCta.eyebrow }}</small>
                <strong>{{ copy.asideCta.link }}</strong>
              </span>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M5 12h13M13 7l5 5-5 5" />
              </svg>
            </a>
          </div>

          <a class="vz-services__aside-cta" href="#contacts">
            <small>{{ copy.asideCta.eyebrow }}</small>
            <strong>
              <span>{{ copy.asideCta.link }}</span>
              <b aria-hidden="true">→</b>
            </strong>
            <em>{{ copy.asideCta.note }}</em>
          </a>

          <div class="vz-services__stage" data-serv-stage>
            <div class="vz-services__devices" data-serv-devices inert aria-hidden="true">
              <div class="vz-device-mac" data-device-mac>
                <div class="vz-macbook" data-macbook>
                  <div class="vz-macbook__tilt">
                    <div class="vz-macbook__lid" data-mac-lid>
                      <div class="vz-macbook__screen-wrap" data-screen-wrap>
                        <div
                          v-for="(screen, index) in serviceScreens"
                          :key="screen"
                          data-screen
                          :data-si="index"
                          :class="['vz-screen', `vz-screen--${screen}`]"
                        >
                          <div v-if="screen === 'miniapp'" class="vz-screen-miniapp">
                            <div class="vz-service-ui vz-service-ui--miniapp">
                              <header><span></span><b>{{ copy.screens.miniapp.app }}</b><i>•••</i></header>
                              <main><small>{{ copy.screens.miniapp.collection }}</small><strong>{{ copy.screens.miniapp.select }}<br>{{ copy.screens.miniapp.order }}<br>{{ copy.screens.miniapp.done }}</strong><div><i><b>{{ copy.screens.miniapp.firstItem }}</b><small>€ 45</small></i><i><b>{{ copy.screens.miniapp.secondItem }}</b><small>€ 80</small></i></div></main>
                              <footer><span>{{ copy.screens.miniapp.continue }}</span><b>→</b></footer>
                            </div>
                            <div class="vz-screen-topbar"><span></span><i>Mini app</i></div>
                            <div class="vz-screen-hero-line"></div>
                            <div class="vz-screen-cards"><b></b><b></b></div>
                            <div class="vz-screen-button"></div>
                          </div>
                          <div v-else-if="screen === 'bot'" class="vz-screen-chat">
                            <div class="vz-service-ui vz-service-ui--bot">
                              <header><span></span><b>{{ copy.screens.bot.app }}</b><i>•••</i></header>
                              <small>{{ copy.screens.bot.today }}</small>
                              <div class="vz-ui-message is-in">{{ copy.screens.bot.incoming }}</div>
                              <div class="vz-ui-message is-out">{{ copy.screens.bot.outgoing }}</div>
                              <nav><button>{{ copy.screens.bot.site }}</button><button>{{ copy.screens.bot.miniapp }}</button></nav>
                              <footer><span>{{ copy.screens.bot.message }}</span><b>↑</b></footer>
                            </div>
                            <div class="vz-screen-chatbar"><span></span><b></b></div>
                            <div class="vz-bubble vz-bubble--left"></div>
                            <div class="vz-bubble vz-bubble--right"></div>
                            <div class="vz-bubble vz-bubble--choice"></div>
                            <div class="vz-chat-input"></div>
                          </div>
                          <div v-else-if="screen === 'site'" class="vz-screen-site">
                            <div class="vz-service-ui vz-service-ui--site">
                              <header><span></span><i>{{ copy.screens.site.browser }}</i></header>
                              <main><small>{{ copy.screens.site.eyebrow }}</small><strong>{{ copy.screens.site.products }}<br><em>{{ copy.screens.site.thatWork }}</em></strong><div></div></main>
                              <footer><span>{{ copy.screens.site.strategy }}</span><span>{{ copy.screens.site.design }}</span><span>{{ copy.screens.site.code }}</span></footer>
                            </div>
                            <div class="vz-browserbar"><span></span><i>vezha.digital</i></div>
                            <div class="vz-site-grid"><div></div><b></b></div>
                          </div>
                          <div v-else-if="screen === 'shop'" class="vz-screen-shop">
                            <div class="vz-service-ui vz-service-ui--shop">
                              <header><strong>{{ copy.screens.shop.brand }}</strong><span>{{ copy.screens.shop.catalog }}</span><b>02</b></header>
                              <nav><span>{{ copy.screens.shop.all }}</span><i>{{ copy.screens.shop.filter }} ↗</i></nav>
                              <main><article v-for="product in 3" :key="product"><div><i></i></div><small>{{ copy.screens.shop[`item${product}`] }}</small><strong>{{ 120 + product * 35 }} €</strong></article></main>
                            </div>
                            <div class="vz-shop-top"><span></span><b>2</b></div>
                            <div class="vz-shop-grid"><i v-for="cell in 6" :key="cell"></i></div>
                          </div>
                          <div v-else-if="screen === 'ai'" class="vz-screen-ai">
                            <div class="vz-service-ui vz-service-ui--ai">
                              <header><span>{{ copy.screens.ai.title }}</span><b>{{ copy.screens.ai.live }}</b></header>
                              <main>
                                <article><small>01</small><strong>{{ copy.screens.ai.request }}</strong><i></i></article><span>→</span>
                                <article class="is-accent"><small>02</small><strong>{{ copy.screens.ai.analysis }}</strong><i></i></article><span>→</span>
                                <article class="is-dark"><small>03</small><strong>{{ copy.screens.ai.crm }}</strong><i></i></article>
                              </main>
                              <footer><span>{{ copy.screens.ai.newLeads }} <b>24</b></span><span>{{ copy.screens.ai.processed }} <b>21</b></span><span>{{ copy.screens.ai.saved }} <b>68%</b></span></footer>
                            </div>
                            <div class="vz-ai-top"><span>✦</span><b></b></div>
                            <div class="vz-bubble vz-bubble--right"></div>
                            <div class="vz-ai-answer"><span>✦</span><i></i></div>
                            <div class="vz-ai-plan"></div>
                            <div class="vz-ai-flow"><b></b><b></b><b></b></div>
                          </div>
                          <div v-else-if="screen === 'corp'" class="vz-screen-corp">
                            <div class="vz-service-ui vz-service-ui--corp">
                              <aside><b>V</b><i></i><i></i><i></i><span></span></aside>
                              <main>
                                <header><strong>{{ copy.screens.corp.workspace }}</strong><span>{{ copy.screens.corp.date }}</span></header>
                                <section><article><small>01</small><b>148</b></article><article><small>02</small><b>92%</b></article><article><small>03</small><b>06</b></article></section>
                                <div><header><b>{{ copy.screens.corp.project }}</b><b>{{ copy.screens.corp.owner }}</b><b>{{ copy.screens.corp.status }}</b></header><p><span>{{ copy.screens.corp.platform }}</span><span>AK</span><i>{{ copy.screens.corp.active }}</i></p><p><span>{{ copy.screens.corp.portal }}</span><span>MV</span><i>{{ copy.screens.corp.review }}</i></p><p><span>{{ copy.screens.corp.system }}</span><span>DS</span><i>{{ copy.screens.corp.ready }}</i></p></div>
                              </main>
                            </div>
                            <div class="vz-corp-side"></div>
                            <div class="vz-corp-main">
                              <div class="vz-corp-head"></div>
                              <div class="vz-corp-cards"><b></b><b></b><b></b></div>
                              <div class="vz-corp-chart"><i v-for="bar in 6" :key="bar"></i></div>
                            </div>
                          </div>
                          <div v-else class="vz-screen-mobile">
                            <div class="vz-service-ui vz-service-ui--mobile">
                              <header><span></span><b>{{ copy.screens.mobile.greeting }}</b><i>•••</i></header>
                              <main><small>{{ copy.screens.mobile.balance }}</small><strong>€ 24,680</strong><span>+12.8%</span></main>
                              <section><article><i>↗</i><b>{{ copy.screens.mobile.send }}</b></article><article><i>+</i><b>{{ copy.screens.mobile.add }}</b></article></section>
                              <div><b>{{ copy.screens.mobile.activity }}</b><p><span>{{ copy.screens.mobile.firstPayment }}</span><strong>− € 19</strong></p><p><span>{{ copy.screens.mobile.secondPayment }}</span><strong>− € 340</strong></p></div>
                              <nav><i></i><i></i><i></i><i></i></nav>
                            </div>
                            <pre class="vz-code-pane">// cmd/app/main.go
package main

import "net/http"

func main() {
    api := newAPI()
    http.ListenAndServe(":8080", api)
}</pre>
                            <div class="vz-phone-pane"><div class="vz-phone"><span></span><b></b><i></i></div></div>
                          </div>
                          <div class="vz-screen-shine"></div>
                        </div>
                      </div>
                    </div>
                    <div class="vz-macbook__base"><span></span><i></i></div>
                  </div>
                  <div class="vz-macbook__shadow"></div>
                </div>

                <div class="vz-services__callouts">
                  <span
                    v-for="(item, index) in activeServiceCallouts"
                    :key="`${activeIndex}-${item}`"
                    :data-callout-position="index"
                  >
                    <small>{{ String(index + 1).padStart(2, "0") }}</small>
                    <b>{{ item }}</b>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useLandingServices } from "~/composables/landing/useLandingServices";

type LandingService = { n: string; title: string; desc: string; meta: string[] };
type LandingServicesCopy = {
  label: string;
  title: string;
  hint: [string, string];
  navLabels: [string, string, string, string, string, string, string];
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
};

const props = defineProps<{ services: LandingService[]; copy: LandingServicesCopy }>();
const emit = defineEmits<{ activeChange: [index: number] }>();
const rootRef = ref<HTMLElement | null>(null);
const serviceScreens = ["miniapp", "bot", "site", "shop", "ai", "corp", "mobile"] as const;
const serviceCount = computed(() => props.services.length);
const { activeIndex, select } = useLandingServices(rootRef, serviceCount, (index) => emit("activeChange", index));
const activeServiceCallouts = computed(() => props.copy.commercial[activeIndex.value]?.included ?? []);

function alignActiveServiceToStart(index: number) {
  if (!window.matchMedia("(max-width: 900px)").matches) return;

  const nav = rootRef.value?.querySelector<HTMLElement>(".vz-services__mobile-tabs");
  const tab = rootRef.value?.querySelectorAll<HTMLElement>("[data-serv-mobile-nav]")[index];
  if (!nav || !tab) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tabRect = tab.getBoundingClientRect();
  const navRect = nav.getBoundingClientRect();
  const gap = Number.parseFloat(window.getComputedStyle(nav).columnGap) || 0;
  const trailingSpace = Math.max(0, nav.clientWidth - tabRect.width - gap);
  const startLeft = nav.scrollLeft + tabRect.left - navRect.left;

  nav.style.setProperty("--vz-tabs-trailing-space", `${trailingSpace}px`);
  nav.scrollTo({ left: Math.max(0, startLeft), behavior: reduceMotion ? "auto" : "smooth" });
}

function selectService(index: number, focus = false) {
  select(index);
  nextTick(() => {
    const selector = window.matchMedia("(max-width: 900px)").matches
      ? "[data-serv-mobile-nav]"
      : "[data-serv-nav]";
    const tab = rootRef.value?.querySelectorAll<HTMLElement>(selector)[activeIndex.value];
    if (focus) tab?.focus();
    alignActiveServiceToStart(activeIndex.value);
  });
}

function move(direction: 1 | -1, focus = false) {
  if (!serviceCount.value) return;
  selectService(activeIndex.value + direction, focus);
}

function onNavKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    move(1, true);
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    move(-1, true);
  } else if (event.key === "Home") {
    event.preventDefault();
    selectService(0, true);
  } else if (event.key === "End") {
    event.preventDefault();
    selectService(Math.max(serviceCount.value - 1, 0), true);
  }
}
</script>

<style src="~/assets/css/landing-redesign.css"></style>
