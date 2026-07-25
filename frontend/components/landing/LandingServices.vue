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
          <div class="vz-services__counter"><span data-serv-counter>01 / 07</span></div>
        </div>

        <div class="vz-services__grid" data-serv-grid>
          <div class="vz-services__nav" data-serv-list>
            <button
              v-for="(service, index) in services"
              :key="`${service.n}-${service.title}`"
              data-serv-nav
              type="button"
              @click="select(index)"
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
                          :key="screen"
                          data-screen
                          :data-si="index"
                          :class="['vz-screen', `vz-screen--${screen}`]"
                        >
                          <div v-if="screen === 'miniapp'" class="vz-screen-miniapp">
                            <div class="vz-screen-topbar"><span></span><i>Mini app</i></div>
                            <div class="vz-screen-hero-line"></div>
                            <div class="vz-screen-cards"><b></b><b></b></div>
                            <div class="vz-screen-button"></div>
                          </div>
                          <div v-else-if="screen === 'bot'" class="vz-screen-chat">
                            <div class="vz-screen-chatbar"><span></span><b></b></div>
                            <div class="vz-bubble vz-bubble--left"></div>
                            <div class="vz-bubble vz-bubble--right"></div>
                            <div class="vz-bubble vz-bubble--choice"></div>
                            <div class="vz-chat-input"></div>
                          </div>
                          <div v-else-if="screen === 'site'" class="vz-screen-site">
                            <div class="vz-browserbar"><span></span><i>vezha.digital</i></div>
                            <div class="vz-site-grid"><div></div><b></b></div>
                          </div>
                          <div v-else-if="screen === 'shop'" class="vz-screen-shop">
                            <div class="vz-shop-top"><span></span><b>2</b></div>
                            <div class="vz-shop-grid"><i v-for="cell in 6" :key="cell"></i></div>
                          </div>
                          <div v-else-if="screen === 'ai'" class="vz-screen-ai">
                            <div class="vz-ai-top"><span>✦</span><b></b></div>
                            <div class="vz-bubble vz-bubble--right"></div>
                            <div class="vz-ai-answer"><span>✦</span><i></i></div>
                            <div class="vz-ai-plan"></div>
                            <div class="vz-ai-flow"><b></b><b></b><b></b></div>
                          </div>
                          <div v-else-if="screen === 'corp'" class="vz-screen-corp">
                            <div class="vz-corp-side"></div>
                            <div class="vz-corp-main">
                              <div class="vz-corp-head"></div>
                              <div class="vz-corp-cards"><b></b><b></b><b></b></div>
                              <div class="vz-corp-chart"><i v-for="bar in 6" :key="bar"></i></div>
                            </div>
                          </div>
                          <div v-else class="vz-screen-mobile">
                            <pre class="vz-code-pane">// App/MainView.swift
import SwiftUI

@main
struct VezhaApp: App {
    var body: some Scene {
        WindowGroup { CatalogView() }
    }
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
              </div>
            </div>

            <div class="vz-service-caption" data-serv-caption>
              <article v-for="service in services" :key="service.n" data-serv-panel class="vz-service-panel">
                <div class="vz-service-panel__title"><span>{{ service.n }}</span><h3>{{ service.title }}</h3></div>
                <p>{{ service.desc }}</p>
                <div data-serv-metawrap><span v-for="meta in service.meta" :key="meta">{{ meta }}</span></div>
              </article>
            </div>
          </div>
        </div>

        <div class="vz-services__bar"><span data-serv-bar></span></div>
        <div class="vz-scroll-hint" data-serv-hint>
          <span>{{ copy.hint[0] }}</span><span>→</span><span>{{ copy.hint[1] }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useLandingServices } from "~/composables/landing/useLandingServices";

type LandingService = { n: string; title: string; desc: string; meta: string[] };
type LandingServicesCopy = { label: string; title: string; hint: [string, string] };

const props = defineProps<{ services: LandingService[]; copy: LandingServicesCopy }>();
const emit = defineEmits<{ activeChange: [index: number] }>();
const rootRef = ref<HTMLElement | null>(null);
const serviceScreens = ["miniapp", "bot", "site", "shop", "ai", "corp", "mobile"] as const;
const serviceCount = computed(() => props.services.length);
const { select } = useLandingServices(rootRef, serviceCount, (index) => emit("activeChange", index));
</script>

<style src="~/assets/css/landing-redesign.css"></style>
