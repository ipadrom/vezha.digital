<template>
  <section id="about" class="vz-about">
    <div class="vz-about__grid">
      <div class="vz-about__brand">
        <div class="vz-section-label">
          <span>{{ copy.label }}</span>
          <i>/</i>
          <span data-secnum>01</span>
        </div>
        <div class="vz-about__mark" aria-hidden="true">
          <span>VEZHA</span>
          <i>digital</i>
        </div>
        <div class="vz-about__metrics vz-about__metrics--brand">
          <div>
            <strong>01</strong>
            <span>{{ copy.metrics[0] }}</span>
          </div>
          <div>
            <strong>0</strong>
            <span>{{ copy.metrics[1] }}</span>
          </div>
          <div>
            <strong>1-4</strong>
            <span>{{ copy.metrics[2] }}</span>
          </div>
        </div>
        <p class="vz-about__note">{{ copy.note }}</p>
      </div>

      <div class="vz-about__copy">
        <div class="vz-about__eyebrow">
          <span>{{ copy.eyebrow[0] }}</span>
          <span>{{ copy.eyebrow[1] }}</span>
        </div>
        <p class="vz-about__lead">{{ copy.teamLead }}</p>
        <div class="vz-about__principles">
          <article>
            <span>01</span>
            <p>{{ copy.paragraphs[0] }}</p>
          </article>
          <article>
            <span>02</span>
            <p>{{ copy.paragraphs[1] }}</p>
          </article>
        </div>

        <div
          ref="flowRef"
          class="vz-about__flow"
          :class="`is-${flowPhase}`"
          :aria-label="copy.flowAria"
        >
          <button
            class="vz-about__flow-replay"
            type="button"
            :aria-label="copy.replay"
            @click="$emit('replay')"
          >
            {{ copy.replay }} ↻
          </button>

          <div class="vz-about__flow-zones" aria-hidden="true">
            <div class="vz-about__flow-zone vz-about__flow-zone--client"><span>{{ copy.zones[0] }}</span></div>
            <div class="vz-about__flow-zone vz-about__flow-zone--vezha"><span>{{ copy.zones[1] }}</span></div>
            <div class="vz-about__flow-zone vz-about__flow-zone--product"><span>{{ copy.zones[2] }}</span></div>
          </div>

          <svg
            :key="flowCycleKey"
            class="vz-about__flow-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path class="is-primary" d="M 20.5 50 C 24 50 28 50 32 50" />
            <path v-for="segment in snakeSegments" :key="`line-${segment.key}`" :d="segment.path" />
            <path
              class="vz-about__flow-pulse vz-about__flow-pulse--entry"
              d="M 20.5 50 C 24 50 28 50 32 50"
              pathLength="100"
              stroke-dasharray="12 100"
              stroke-dashoffset="0"
              opacity="0"
            >
              <animate attributeName="opacity" begin="0.24s" dur="0.8s" values="0;0.95;0.95;0" keyTimes="0;0.08;0.9;1" repeatCount="1" />
              <animate attributeName="stroke-dashoffset" begin="0.24s" dur="0.8s" values="0;-100" repeatCount="1" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.66 0 0.34 1" />
            </path>
            <path
              v-for="segment in snakeSegments"
              :key="`pulse-${segment.key}`"
              class="vz-about__flow-pulse vz-about__flow-pulse--snake"
              :d="segment.path"
              pathLength="100"
              stroke-dasharray="12 100"
              stroke-dashoffset="0"
              opacity="0"
            >
              <animate attributeName="opacity" :begin="segment.begin" dur="0.45s" values="0;0.95;0.95;0" keyTimes="0;0.08;0.9;1" repeatCount="1" />
              <animate attributeName="stroke-dashoffset" :begin="segment.begin" dur="0.45s" values="0;-100" repeatCount="1" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.66 0 0.34 1" />
            </path>
          </svg>

          <div class="vz-about__flow-node vz-about__flow-node--business">
            <Transition name="vz-flow-business">
              <div :key="activeBusiness.label" class="vz-about__business-content">
                <svg class="vz-about__business-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path v-for="path in activeBusiness.iconPaths" :key="path" :d="path" />
                </svg>
                <span class="vz-about__business-label">{{ activeBusiness.label }}</span>
              </div>
            </Transition>
          </div>

          <div class="vz-about__flow-node vz-about__flow-node--vezha">VEZHA<br />Digital</div>

          <div
            v-for="(stage, index) in copy.stages"
            :key="stage"
            class="vz-about__flow-stage"
            :class="`vz-about__flow-stage--${stageKeys[index]}`"
          >
            <span class="vz-about__flow-stage-base" aria-hidden="true"></span>
            <span class="vz-about__flow-stage-card">{{ stage }}</span>
          </div>

          <div class="vz-about__flow-node vz-about__flow-node--product">
            <Transition name="vz-flow-product" mode="out-in">
              <div
                v-if="flowPhase === 'result' && activeProduct"
                :key="activeProduct.label"
                class="vz-about__product-content"
              >
                <svg class="vz-about__product-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path v-for="path in activeProduct.iconPaths" :key="path" :d="path" />
                </svg>
                <span class="vz-about__product-label">{{ activeProduct.label }}</span>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type AboutFlowItem = {
  label: string;
  iconPaths: string[];
};

type AboutCopy = {
  label: string;
  paragraphs: [string, string];
  note: string;
  eyebrow: [string, string];
  teamLead: string;
  metrics: [string, string, string];
  flowAria: string;
  replay: string;
  zones: [string, string, string];
  stages: [string, string, string, string];
};

defineProps<{
  copy: AboutCopy;
  flowPhase: "signal" | "result";
  flowCycleKey: number;
  snakeSegments: Array<{ key: string; path: string; begin: string }>;
  activeBusiness: AboutFlowItem;
  activeProduct: AboutFlowItem | null;
}>();

const emit = defineEmits<{
  replay: [];
  "flow-ready": [element: HTMLElement | null];
}>();

const flowRef = ref<HTMLElement | null>(null);
const stageKeys = ["design", "ux", "development", "testing"] as const;

onMounted(() => emit("flow-ready", flowRef.value));
onBeforeUnmount(() => emit("flow-ready", null));
</script>

<style scoped>
.vz-about {
  position: relative;
  overflow: clip;
  padding: var(--section-space) 40px;
}

.vz-about__grid {
  position: relative;
  display: grid;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  align-items: center;
  grid-template-columns: minmax(320px, 430px) minmax(0, 1fr);
  gap: clamp(56px, 8vw, 118px);
}

.vz-about__brand,
.vz-about__copy,
.vz-about__flow {
  min-width: 0;
}

.vz-about__brand {
  position: relative;
  z-index: 1;
  align-self: stretch;
  display: flex;
  min-height: clamp(420px, 58vh, 520px);
  flex-direction: column;
  justify-content: space-between;
}

.vz-about__mark {
  position: relative;
  display: grid;
  min-height: clamp(168px, 26vh, 232px);
  margin-top: clamp(26px, 5vh, 46px);
  place-items: center start;
}

.vz-about__mark span {
  position: relative;
  z-index: 1;
  max-width: 100%;
  color: var(--ink);
  font-size: clamp(58px, 7.5vw, 118px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.82;
}

.vz-about__mark i {
  position: absolute;
  right: 0;
  bottom: 18px;
  color: var(--muted2);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  font-style: normal;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.vz-about__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 32px;
  border: 1px solid var(--border);
}

.vz-about__metrics div {
  min-height: 108px;
  padding: 18px;
}

.vz-about__metrics div + div {
  border-left: 1px solid var(--border);
}

.vz-about__metrics strong {
  display: block;
  color: var(--ink);
  font-size: clamp(32px, 3vw, 48px);
  line-height: 0.9;
}

.vz-about__metrics span {
  display: block;
  margin-top: 18px;
  color: var(--text2);
  font-size: 13px;
  line-height: 1.35;
}

.vz-about__note {
  max-width: 32ch;
  margin: 28px 0 0;
  color: var(--text2);
  font-size: 16px;
  line-height: 1.55;
}

.vz-about__copy {
  position: relative;
  z-index: 1;
  justify-self: end;
  width: 100%;
  max-width: 760px;
}

.vz-about__eyebrow {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  margin-bottom: 20px;
  color: var(--muted2);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.vz-about__eyebrow span + span::before {
  content: "/";
  margin-right: 22px;
  color: var(--slash);
}

.vz-about__lead {
  max-width: 13ch;
  margin: 0;
  color: var(--ink);
  font-size: clamp(34px, 4vw, 56px);
  font-weight: 650;
  letter-spacing: -0.04em;
  line-height: 0.98;
  text-transform: uppercase;
}

.vz-about__principles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: clamp(26px, 4vh, 38px);
  border-block: 1px solid var(--border);
}

.vz-about__principles article {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 18px;
  padding: 20px 0;
}

.vz-about__principles article + article {
  padding-left: 28px;
  border-left: 1px solid var(--border);
}

.vz-about__principles span {
  color: var(--muted2);
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
}

.vz-about__principles p {
  margin: 0;
  color: var(--text2);
  font-size: 16px;
  line-height: 1.65;
}

.vz-about__flow {
  position: relative;
  width: 125%;
  min-height: clamp(320px, 40vh, 390px);
  margin: clamp(20px, 3.6vh, 32px) 0 46px -25%;
  overflow: visible;
}

.vz-about__flow-replay {
  position: absolute;
  z-index: 4;
  top: 0;
  right: 0;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg);
  color: var(--muted);
  font: 500 9px/1 "JetBrains Mono", monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
}

.vz-about__flow-zones {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 32fr 49fr 19fr;
}

.vz-about__flow-zone {
  position: relative;
}

.vz-about__flow-zone:not(:last-child) {
  border-right: 1px solid color-mix(in srgb, var(--ink) 9%, transparent);
}

.vz-about__flow-zone span {
  position: absolute;
  bottom: -34px;
  left: 50%;
  color: var(--muted2);
  font: 500 10px/1 "JetBrains Mono", monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transform: translateX(-50%);
  white-space: nowrap;
}

.vz-about__flow-lines {
  position: absolute;
  z-index: 1;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.vz-about__flow-lines path {
  fill: none;
  stroke: color-mix(in srgb, var(--muted2) 34%, transparent);
  stroke-linecap: round;
  stroke-width: 1.48;
  vector-effect: non-scaling-stroke;
}

.vz-about__flow-lines path.vz-about__flow-pulse {
  stroke: #5aa9ff;
  stroke-width: 1.1;
  filter: drop-shadow(0 0 5px rgba(90, 169, 255, 0.52));
}

.vz-about__flow-node,
.vz-about__flow-stage {
  position: absolute;
  z-index: 2;
  left: var(--x);
  top: var(--y);
  color: var(--ink);
  font-family: "JetBrains Mono", monospace;
  text-align: center;
  text-transform: uppercase;
  transform: translate(-50%, -50%);
}

.vz-about__flow-node--vezha {
  --x: 32%;
  --y: 50%;
  display: grid;
  width: 88px;
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  font-size: 11px;
}

.vz-about__flow-node--business {
  --x: 16%;
  --y: 50%;
}

.vz-about__flow-node--product {
  --x: 90.5%;
  --y: 50%;
}

.vz-about__flow-node--business,
.vz-about__flow-node--product {
  width: clamp(118px, 10.5vw, 144px);
  min-height: 100px;
  transform: translate(-50%, 0);
}

.vz-about__business-content,
.vz-about__product-content {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.vz-about__business-icon,
.vz-about__product-icon {
  width: clamp(48px, 4vw, 56px);
  height: auto;
  box-sizing: content-box;
  margin-bottom: -32px;
  padding: 4px;
  overflow: visible;
  background: var(--bg);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.45;
  stroke-linecap: round;
  stroke-linejoin: round;
  transform: translateY(-50%);
}

.vz-about__business-label,
.vz-about__product-label {
  display: block;
  width: 100%;
  min-height: 2.3em;
  overflow-wrap: anywhere;
  line-height: 1.15;
}

.vz-about__flow-stage {
  width: 72px;
  aspect-ratio: 1;
  font-size: 9px;
}

.vz-about__flow-stage-base,
.vz-about__flow-stage-card {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 7px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
}

.vz-about__flow-stage-base {
  z-index: 0;
  background: color-mix(in srgb, var(--ink) 4%, var(--bg));
  box-shadow: 0 10px 20px color-mix(in srgb, var(--ink) 7%, transparent);
  transform: translateY(7px);
}

.vz-about__flow-stage-card {
  z-index: 1;
  overflow-wrap: anywhere;
  background: color-mix(in srgb, var(--bg) 97%, transparent);
  box-shadow: 0 8px 20px color-mix(in srgb, var(--ink) 5%, transparent);
  transform: translateY(0);
  will-change: transform;
}

.vz-about__flow-stage--design { --x: 44%; --y: 70%; }
.vz-about__flow-stage--ux { --x: 53%; --y: 30%; }
.vz-about__flow-stage--development { --x: 63%; --y: 66%; }
.vz-about__flow-stage--testing { --x: 74%; --y: 34%; }

.vz-about__flow.is-signal .vz-about__flow-node--vezha {
  animation: vz-flow-node-receive 0.38s 0.84s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.vz-about__flow.is-signal .vz-about__flow-stage--design .vz-about__flow-stage-card {
  animation: vz-flow-stage-lift 0.45s 1.32s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.vz-about__flow.is-signal .vz-about__flow-stage--ux .vz-about__flow-stage-card {
  animation: vz-flow-stage-lift 0.45s 1.77s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.vz-about__flow.is-signal .vz-about__flow-stage--development .vz-about__flow-stage-card {
  animation: vz-flow-stage-lift 0.45s 2.22s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.vz-about__flow.is-signal .vz-about__flow-stage--testing .vz-about__flow-stage-card {
  animation: vz-flow-stage-lift 0.45s 2.67s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes vz-flow-node-receive {
  0%,
  100% {
    border-color: var(--border);
    background: color-mix(in srgb, var(--bg) 94%, transparent);
    color: var(--ink);
    box-shadow: 0 14px 34px color-mix(in srgb, var(--ink) 6%, transparent);
  }
  50% {
    border-color: color-mix(in srgb, #9b6cff 68%, var(--border));
    background: color-mix(in srgb, #9b6cff 7%, var(--bg));
    color: var(--ink);
    box-shadow: 0 0 22px color-mix(in srgb, #9b6cff 24%, transparent);
  }
}

@keyframes vz-flow-stage-lift {
  0%,
  100% {
    border-color: var(--border);
    background: color-mix(in srgb, var(--bg) 97%, transparent);
    box-shadow: 0 8px 20px color-mix(in srgb, var(--ink) 5%, transparent);
    transform: translateY(0);
  }
  45%,
  62% {
    border-color: color-mix(in srgb, #5aa9ff 68%, var(--border));
    background: color-mix(in srgb, #5aa9ff 7%, var(--bg));
    box-shadow: 0 14px 24px color-mix(in srgb, #5aa9ff 24%, transparent);
    transform: translateY(-9px);
  }
}

.vz-flow-business-enter-active,
.vz-flow-business-leave-active {
  transition:
    opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.vz-flow-business-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.vz-flow-business-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.vz-flow-product-enter-active {
  transition:
    opacity 0.12s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);
}

.vz-flow-product-leave-active {
  transition:
    opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.vz-flow-product-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}

.vz-flow-product-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

@media (max-width: 900px) {
  .vz-about {
    padding: var(--section-space) 20px;
    overflow: hidden;
  }

  .vz-about__grid {
    grid-template-columns: 1fr;
    gap: 56px;
  }

  .vz-about__brand {
    min-height: 0;
  }

  .vz-about__mark span {
    font-size: clamp(64px, 20vw, 104px);
  }

  .vz-about__copy {
    max-width: none;
  }

  .vz-about__principles {
    grid-template-columns: 1fr;
  }

  .vz-about__principles article + article {
    padding-left: 0;
    border-top: 1px solid var(--border);
    border-left: 0;
  }

  .vz-about__flow {
    width: 100%;
    min-height: 300px;
    margin-left: 0;
  }

  .vz-about__flow-zone span {
    font-size: 8px;
    letter-spacing: 0.08em;
  }

  .vz-about__flow-node--business,
  .vz-about__flow-node--product {
    width: 90px;
  }

  .vz-about__flow-stage {
    width: 52px;
    font-size: 7px;
  }
}

@media (max-width: 520px) {
  .vz-about__metrics div {
    min-height: 92px;
    padding: 12px;
  }

  .vz-about__metrics span {
    font-size: 11px;
  }
}
</style>
