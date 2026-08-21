<template>
  <section id="about" class="vz-about">
    <div class="vz-about__inner">
      <header class="vz-about__head">
        <div class="vz-about__title">
          <div class="vz-section-label">
            <span>{{ copy.label }}</span><i>/</i><span data-secnum>01</span>
          </div>
          <h2 :aria-label="copy.teamLead">
            <span class="vz-about__team-lead--desktop" aria-hidden="true">
              <template v-if="copy.teamLeadLines">
                <span
                  v-for="line in copy.teamLeadLines"
                  :key="line"
                  class="vz-about__team-lead-line"
                >{{ line }}</span>
              </template>
              <template v-else>{{ copy.teamLead }}</template>
            </span>
            <span class="vz-about__team-lead--mobile" aria-hidden="true">{{ copy.teamLead }}</span>
          </h2>
        </div>

        <div ref="introSlotRef" class="vz-about__intro-slot">
          <div ref="introRef" class="vz-about__intro" aria-live="polite" aria-atomic="true">
            <div ref="stepStackRef" class="vz-about__step-stack">
              <div
                v-for="step in allFlowSteps"
                :key="step.number"
                class="vz-about__step-copy"
                :class="{ 'is-active': step.number === activeFlowStep.number }"
                :aria-hidden="step.number === activeFlowStep.number ? undefined : 'true'"
              >
                <div class="vz-about__step-meta">
                  <span>{{ step.number }}</span>
                  <div>
                    <strong>
                      <span class="vz-about__stage-title--desktop">{{ step.title }}</span>
                      <span class="vz-about__stage-title--mobile">{{ step.mobileTitle }}</span>
                    </strong>
                    <small>{{ step.duration }}</small>
                  </div>
                </div>
                <div class="vz-about__step-detail">
                  <p>{{ step.description }}</p>
                  <ul class="vz-about__step-deliverables">
                    <li v-for="item in step.deliverables" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        ref="flowRef"
        class="vz-about__flow"
        :class="[
          `is-${flowPhase}`,
          { 'is-autoplaying': flowPhase === 'signal' && targetStepIndex === null },
        ]"
        :aria-label="copy.flowAria"
        role="group"
      >
        <div class="vz-about__flow-controls">
          <Transition name="vz-flow-control">
            <button
              v-if="canContinueAnimation"
              class="vz-about__flow-control vz-about__flow-continue"
              type="button"
              :aria-label="copy.continueAnimation"
              @click="$emit('continue-animation')"
            >
              {{ copy.continueAnimation }}
              <span aria-hidden="true">
                <svg viewBox="0 0 20 20">
                  <path d="M4.5 10h10M11 6.5 14.5 10 11 13.5" />
                </svg>
              </span>
            </button>
          </Transition>
          <button
            class="vz-about__flow-control vz-about__flow-replay"
            type="button"
            :aria-label="copy.replay"
            @click="$emit('replay')"
          >
            {{ copy.replay }} <span aria-hidden="true">↻</span>
          </button>
        </div>

        <div class="vz-about__flow-canvas">
          <div class="vz-about__flow-zones" aria-hidden="true">
            <div class="vz-about__flow-zone vz-about__flow-zone--client"><span>{{ copy.zones[0] }}</span></div>
            <div class="vz-about__flow-zone vz-about__flow-zone--vezha"><span>{{ copy.zones[1] }}</span></div>
            <div class="vz-about__flow-zone vz-about__flow-zone--product"><span>{{ copy.zones[2] }}</span></div>
          </div>

          <LandingAboutGoo
            :flow-phase="flowPhase"
            :flow-cycle-key="flowCycleKey"
            :resume-key="resumeKey"
            :resume-elapsed-ms="resumeElapsedMs"
            :target-step-index="targetStepIndex"
            :navigation-key="navigationKey"
            :snake-segments="snakeSegments"
            @scene-ready="$emit('scene-ready', $event)"
            @stage-reached="$emit('stage-reached', $event)"
          />

          <div
            class="vz-about__flow-node vz-about__flow-node--business"
            :class="{ 'is-sending': flowPhase === 'signal' && targetStepIndex === null }"
          >
            <div class="vz-about__endpoint-content">
              <div
                :key="`business-frame-${flowCycleKey}`"
                class="vz-about__endpoint-frame"
                data-flow-anchor
              >
                <Transition name="vz-flow-icon" mode="out-in">
                  <svg :key="activeBusiness.label" class="vz-about__endpoint-icon" viewBox="0 0 256 256" aria-hidden="true">
                    <path v-for="path in activeBusiness.iconPaths" :key="path" :d="path" />
                  </svg>
                </Transition>
              </div>
              <Transition name="vz-flow-label" mode="out-in">
                <span :key="activeBusiness.label">{{ activeBusiness.label }}</span>
              </Transition>
            </div>
          </div>

          <button
            type="button"
            class="vz-about__flow-stage vz-about__flow-stage--brief"
            :class="{ 'is-active': activeStepIndex === 0 }"
            :aria-current="activeStepIndex === 0 ? 'step' : undefined"
            @click="$emit('select-step', 0)"
          >
            <span class="vz-about__flow-stage-anchor" data-flow-anchor aria-hidden="true">
              <svg class="vz-about__flow-stage-progress" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8.5" />
              </svg>
              <i></i>
            </span>
            <span class="vz-about__flow-stage-label">
              <small>00</small>
              <b>{{ copy.brief }}</b>
            </span>
          </button>

          <button
            v-for="(stage, index) in copy.stages"
            :key="stage"
            type="button"
            class="vz-about__flow-stage"
            :class="[
              `vz-about__flow-stage--${stageKeys[index]}`,
              { 'is-active': activeStepIndex === index + 1 },
            ]"
            :aria-current="activeStepIndex === index + 1 ? 'step' : undefined"
            @click="$emit('select-step', index + 1)"
          >
            <span class="vz-about__flow-stage-anchor" data-flow-anchor aria-hidden="true">
              <svg class="vz-about__flow-stage-progress" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8.5" />
              </svg>
              <i></i>
            </span>
            <span class="vz-about__flow-stage-label">
              <small>{{ String(index + 1).padStart(2, '0') }}</small>
              <b>
                <span class="vz-about__stage-title--desktop">{{ stage }}</span>
                <span class="vz-about__stage-title--mobile">{{ mobileStageTitle(stage, index) }}</span>
              </b>
            </span>
          </button>

          <div
            class="vz-about__flow-node vz-about__flow-node--product"
            :class="{
              'is-arrived': flowPhase === 'result',
              'is-active': activeStepIndex === supportStepIndex,
            }"
          >
            <div class="vz-about__endpoint-content">
              <button
                type="button"
                class="vz-about__endpoint-frame"
                data-flow-anchor
                :aria-current="activeStepIndex === supportStepIndex ? 'step' : undefined"
                :aria-label="copy.support"
                @click="$emit('select-step', supportStepIndex)"
              >
                <Transition name="vz-flow-icon" mode="out-in">
                  <svg
                    v-if="flowPhase === 'result' && activeProduct"
                    :key="activeProduct.label"
                    class="vz-about__endpoint-icon"
                    viewBox="0 0 256 256"
                    aria-hidden="true"
                  >
                    <path v-for="path in activeProduct.iconPaths" :key="path" :d="path" />
                  </svg>
                </Transition>
              </button>
              <Transition name="vz-flow-label" mode="out-in">
                <span
                  v-if="flowPhase === 'result' && activeProduct"
                  :key="activeProduct.label"
                >{{ activeProduct.label }}</span>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <div class="vz-about__proof">
        <p>{{ copy.paragraphs[0] }}</p>
        <dl>
          <div>
            <dt>1</dt>
            <dd>{{ copy.metrics[0] }}</dd>
          </div>
          <div>
            <dt>0</dt>
            <dd>{{ copy.metrics[1] }}</dd>
          </div>
          <div>
            <dt>1–4</dt>
            <dd>{{ copy.metrics[2] }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import LandingAboutGoo from "./LandingAboutGoo.vue";

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
  teamLeadLines?: [string, string, string];
  metrics: [string, string, string];
  flowAria: string;
  replay: string;
  continueAnimation: string;
  zones: [string, string, string];
  brief: string;
  support: string;
  stages: [string, string, string, string, string];
  stepDetails: Array<{ duration: string; description: string; deliverables: string[] }>;
};

const props = defineProps<{
  copy: AboutCopy;
  flowPhase: "signal" | "result";
  flowCycleKey: number;
  resumeKey: number;
  resumeElapsedMs: number;
  targetStepIndex: number | null;
  navigationKey: number;
  activeStepIndex: number;
  displayStepIndex: number;
  snakeSegments: Array<{ key: string; path: string; begin: string }>;
  activeBusiness: AboutFlowItem;
  activeProduct: AboutFlowItem | null;
  canContinueAnimation: boolean;
}>();

const emit = defineEmits<{
  replay: [];
  "continue-animation": [];
  "select-step": [index: number];
  "stage-reached": [index: number];
  "flow-ready": [element: HTMLElement | null];
  "scene-ready": [rendered: boolean];
}>();

const flowRef = ref<HTMLElement | null>(null);
const introRef = ref<HTMLElement | null>(null);
const introSlotRef = ref<HTMLElement | null>(null);
const stepStackRef = ref<HTMLElement | null>(null);
let introHeightFrame = 0;
let introResizeObserver: ResizeObserver | null = null;
let lastIntroSlotWidth = 0;
const stageKeys = ["design", "ux", "development", "testing", "launch"] as const;
const supportStepIndex = stageKeys.length + 1;
const mobileStageTitle = (stage: string, index: number) => (
  stageKeys[index] === "testing" && stage === "Тестирование" ? "Тест" : stage
);
const allFlowSteps = computed(() => Array.from({ length: supportStepIndex + 1 }, (_, index) => {
  const details = props.copy.stepDetails[index] || { duration: "", description: "", deliverables: [] };
  const title = index === 0
    ? props.copy.brief
    : index === supportStepIndex
      ? props.copy.support
      : props.copy.stages[index - 1] || "";
  return {
    number: String(index).padStart(2, "0"),
    title,
    mobileTitle: index > 0 && index < supportStepIndex
      ? mobileStageTitle(title, index - 1)
      : title,
    ...details,
  };
}));
const activeFlowStep = computed(() => {
  const index = Math.max(0, Math.min(supportStepIndex, props.displayStepIndex));
  return allFlowSteps.value[index];
});

function syncIntroHeight() {
  cancelAnimationFrame(introHeightFrame);
  introHeightFrame = requestAnimationFrame(() => {
    const intro = introRef.value;
    const slot = introSlotRef.value;
    const stack = stepStackRef.value;
    if (!intro || !slot || !stack) return;

    const steps = [...stack.querySelectorAll<HTMLElement>(".vz-about__step-copy")];
    if (!steps.length) return;
    const stepHeights = steps.map((step) => Math.ceil(
      Math.max(step.scrollHeight, step.offsetHeight),
    ));
    const activeIndex = Math.max(0, Math.min(stepHeights.length - 1, props.displayStepIndex));
    const activeHeight = stepHeights[activeIndex] || Math.max(...stepHeights);
    const reservedHeight = Math.max(...stepHeights);
    const introStyle = getComputedStyle(intro);
    const verticalChrome = [
      introStyle.paddingTop,
      introStyle.paddingBottom,
      introStyle.borderTopWidth,
      introStyle.borderBottomWidth,
    ].reduce((total, value) => total + (Number.parseFloat(value) || 0), 0);

    slot.style.setProperty("--about-intro-current-height", `${activeHeight + verticalChrome}px`);
    slot.style.setProperty("--about-intro-reserved-height", `${reservedHeight + verticalChrome}px`);
    slot.style.setProperty("--about-step-height", `${activeHeight}px`);
  });
}

watch(() => props.displayStepIndex, syncIntroHeight, { flush: "post" });
watch(() => props.copy, syncIntroHeight, { deep: true, flush: "post" });

onMounted(async () => {
  emit("flow-ready", flowRef.value);
  await nextTick();
  syncIntroHeight();
  if ("ResizeObserver" in window && introSlotRef.value) {
    introResizeObserver = new ResizeObserver(([entry]) => {
      const nextWidth = entry?.contentRect.width || 0;
      if (Math.abs(nextWidth - lastIntroSlotWidth) < 0.5) return;
      lastIntroSlotWidth = nextWidth;
      syncIntroHeight();
    });
    introResizeObserver.observe(introSlotRef.value);
  }
  document.fonts?.ready.then(syncIntroHeight);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(introHeightFrame);
  introResizeObserver?.disconnect();
  emit("flow-ready", null);
});
</script>

<style scoped>
.vz-about {
  --flow-blue: #5aa9ff;
  --about-head-flow-gap: clamp(32px, 4vw, 48px);
  position: relative;
  overflow: clip;
  padding: var(--section-space) 40px var(--section-space);
}

.vz-about__inner {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
}

.vz-about__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: clamp(36px, 4vw, 64px);
  margin-bottom: var(--about-head-flow-gap);
}

@media (min-width: 901px) {
  .vz-about {
    --about-content-edge: calc((var(--section-space) + var(--about-head-flow-gap)) / 2);
    padding-top: var(--about-content-edge);
  }

  .vz-about__head {
    margin-bottom: var(--about-content-edge);
  }

}

.vz-about__stage-title--mobile { display: none; }

.vz-about__title {
  width: 100%;
  max-width: 520px;
  flex: 1 1 520px;
}

.vz-about__head h2 {
  max-width: 520px;
  margin: 0;
  color: var(--ink);
  font-size: var(--type-section);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.02;
  text-wrap: balance;
  text-transform: uppercase;
}

.vz-about__team-lead--desktop,
.vz-about__team-lead-line {
  display: block;
}

.vz-about__team-lead-line {
  white-space: nowrap;
}

.vz-about__team-lead--mobile {
  display: none;
}

@media (min-width: 901px) and (max-width: 1023px) {
  .vz-about__head h2 {
    font-size: clamp(36px, 4vw, 42px);
  }
}

.vz-about__intro-slot {
  --about-intro-current-height: 196px;
  --about-intro-reserved-height: 196px;
  --about-step-height: 154px;
  position: relative;
  width: clamp(460px, 46vw, 600px);
  height: var(--about-intro-reserved-height);
  flex: 0 0 auto;
  margin-top: 12px;
}

.vz-about__intro {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: var(--about-intro-current-height);
  box-sizing: border-box;
  padding: 20px;
  overflow: hidden;
  border: 1px solid var(--landing-card-border, color-mix(in srgb, var(--ink) 7%, transparent));
  border-radius: 20px;
  background: var(--landing-card-surface-north-east, var(--landing-card-surface, var(--bg)));
  box-shadow: var(--landing-card-shadow, 0 24px 54px -38px color-mix(in srgb, var(--ink) 38%, transparent));
  backdrop-filter: blur(18px) saturate(1.08);
  transition: height 360ms var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1));
}

.vz-about__step-stack {
  display: grid;
  height: var(--about-step-height);
  transition: height 360ms var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1));
}

.vz-about__step-copy {
  display: grid;
  grid-area: 1 / 1;
  min-height: 0;
  align-self: start;
  grid-template-columns: minmax(150px, 0.62fr) minmax(0, 1.38fr);
  align-items: start;
  gap: clamp(14px, 1.2vw, 18px);
  padding-top: 0;
  border-top: 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  pointer-events: none;
  transition:
    opacity 220ms cubic-bezier(0.23, 1, 0.32, 1),
    transform 220ms cubic-bezier(0.23, 1, 0.32, 1),
    visibility 0s linear 220ms;
}

.vz-about__step-copy.is-active {
  opacity: 1;
  visibility: visible;
  transform: none;
  pointer-events: auto;
  transition-delay: 0s;
}

.vz-about__step-meta {
  display: block;
}

.vz-about__step-meta > span {
  display: block;
  color: var(--ink);
  font-size: clamp(42px, 4vw, 58px);
  font-weight: 600;
  letter-spacing: -0.055em;
  line-height: 0.86;
}

.vz-about__step-meta strong,
.vz-about__step-meta small {
  display: block;
}

.vz-about__step-meta strong {
  margin-top: 22px;
  color: var(--ink);
  font-size: var(--type-chip);
  font-weight: 600;
  line-height: 1.2;
  text-transform: uppercase;
}

.vz-about__step-meta small {
  margin-top: 10px;
  color: var(--muted);
  font: 500 var(--type-label)/1.3 "JetBrains Mono", monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.vz-about__step-copy p {
  max-width: 32ch;
  margin: 2px 0 0;
  color: var(--text2);
  font-size: var(--type-body);
  line-height: 1.62;
}

.vz-about__step-detail {
  min-width: 0;
}

.vz-about__step-deliverables {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 16px 0 0;
  padding: 0;
  overflow: visible;
  list-style: none;
}

.vz-about__step-deliverables li {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  justify-content: center;
  padding: 7px 13px;
  border: 1px solid var(--chipbd);
  border-radius: 999px;
  background: transparent;
  color: var(--chipink);
  font-family: "JetBrains Mono", monospace;
  font-size: var(--type-chip);
  letter-spacing: 0.03em;
  text-transform: none;
  white-space: nowrap;
}

@media (min-width: 1200px) {
  .vz-about__step-deliverables {
    flex-wrap: nowrap;
    gap: 5px;
  }

  .vz-about__step-deliverables li {
    padding-inline: 10px;
  }
}

.vz-about__flow {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-block: 1px solid var(--border);
  background:
    radial-gradient(circle at 55% 52%, color-mix(in srgb, var(--flow-blue) 7%, transparent), transparent 34%),
    linear-gradient(180deg, color-mix(in srgb, var(--ink) 1.5%, transparent), transparent 22% 78%, color-mix(in srgb, var(--ink) 1.5%, transparent));
}

.vz-about__flow-canvas {
  position: relative;
  width: 100%;
  min-height: clamp(390px, 42vw, 500px);
}

.vz-about__flow-controls {
  position: absolute;
  z-index: 5;
  top: 18px;
  right: 18px;
  display: flex;
  max-width: calc(100% - 36px);
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.vz-about__flow-control {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 44px;
  padding: 8px 0 8px 12px;
  border: 0;
  background: transparent;
  color: var(--muted);
  font: 500 calc(var(--type-micro) + 1px)/1 "JetBrains Mono", monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: color 180ms var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1));
}

.vz-about__flow-control span {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--ink);
  font-size: var(--type-chip);
  transition: transform 240ms var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1));
}

.vz-about__flow-continue svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
  transform: translateY(-0.75px);
}

@media (min-width: 901px) {
  .vz-about__flow-controls {
    flex-direction: column-reverse;
    align-items: flex-end;
    gap: 8px;
  }

  .vz-about__flow-control {
    min-height: 52px;
    gap: 10px;
    padding: 7px 0 7px 14px;
    font: 500 var(--type-label)/1 "JetBrains Mono", monospace;
  }

  .vz-about__flow-control span {
    width: 38px;
    height: 38px;
    font-size: 16px;
  }

  .vz-about__flow-continue svg {
    width: 16px;
    height: 16px;
  }
}

.vz-about__flow-control:focus-visible {
  color: var(--ink);
  outline: 1px solid var(--flow-blue);
  outline-offset: 4px;
}

.vz-about__flow-zones {
  position: absolute;
  z-index: 0;
  inset: 0;
  display: grid;
  grid-template-columns: 25fr 50fr 25fr;
  pointer-events: none;
}

.vz-about__flow-zone {
  position: relative;
  min-width: 0;
}

.vz-about__flow-zone:not(:last-child) {
  border-right: 1px solid var(--border);
}

.vz-about__flow-zone--vezha {
  background-image: linear-gradient(90deg, transparent, color-mix(in srgb, var(--flow-blue) 3%, transparent), transparent);
}

.vz-about__flow-zone span {
  position: absolute;
  bottom: 24px;
  left: 50%;
  color: var(--muted2);
  font: 500 clamp(9px, 0.72vw, 11px)/1 "JetBrains Mono", monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transform: translateX(-50%);
  white-space: nowrap;
}

.vz-about__flow-node,
.vz-about__flow-stage {
  position: absolute;
  z-index: 4;
  left: var(--x);
  top: var(--y);
  transform: translate(-50%, -50%);
}

.vz-about__flow-node--business,
.vz-about__flow-node--product {
  display: block;
  width: 25%;
  min-height: 112px;
  transform: none;
}

.vz-about__flow-node--business { --x: 0%; --y: 50%; }
.vz-about__flow-node--product { --x: 75%; --y: 50%; }

.vz-about__flow-node--product .vz-about__endpoint-frame {
  padding: 0;
  appearance: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.vz-about__flow-node--product .vz-about__endpoint-frame:focus-visible {
  outline: 2px solid var(--flow-blue);
  outline-offset: 6px;
}

.vz-about__endpoint-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 14px;
  color: var(--ink);
  text-align: center;
}

.vz-about__endpoint-icon {
  width: clamp(38px, 3.4vw, 46px);
  height: clamp(38px, 3.4vw, 46px);
  overflow: visible;
  fill: currentColor;
}

.vz-about__endpoint-frame {
  position: relative;
  display: grid;
  width: clamp(72px, 6.5vw, 86px);
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--bg);
  box-shadow: 0 14px 34px color-mix(in srgb, var(--ink) 7%, transparent);
  margin-bottom: clamp(-43px, -3.25vw, -36px);
  transform: translateY(-50%);
  transition: border-color 320ms ease;
}

.vz-about__flow-node--product.is-active .vz-about__endpoint-frame {
  border-color: var(--flow-blue);
}

@media (hover: hover) {
  .vz-about__flow-node--product .vz-about__endpoint-frame:hover { border-color: var(--flow-blue); }
}

.vz-about__flow-node--product.is-arrived .vz-about__endpoint-frame {
  animation: vz-flow-product-arrival 720ms 210ms cubic-bezier(0.23, 1, 0.32, 1) both;
}

.vz-about__flow-node--business.is-sending .vz-about__endpoint-frame {
  animation: vz-flow-client-send 680ms 240ms cubic-bezier(0.23, 1, 0.32, 1) both;
}

.vz-about__flow-node--business.is-sending .vz-about__endpoint-frame::after,
.vz-about__flow-node--product.is-arrived .vz-about__endpoint-frame::after {
  position: absolute;
  inset: -1px;
  border: 1px solid var(--flow-blue);
  border-radius: inherit;
  content: "";
  opacity: 0;
  pointer-events: none;
  animation: vz-flow-product-ring 760ms 210ms cubic-bezier(0.23, 1, 0.32, 1) both;
}

.vz-about__flow-node--business.is-sending .vz-about__endpoint-frame::after {
  animation-delay: 240ms;
}

@keyframes vz-flow-client-send {
  0% {
    border-color: var(--border);
    transform: translateY(-50%) scale(1);
  }
  32% {
    border-color: var(--flow-blue);
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--flow-blue) 9%, transparent), 0 12px 30px color-mix(in srgb, var(--ink) 8%, transparent);
    transform: translateY(-50%) scale(0.95);
  }
  66% {
    border-color: var(--flow-blue);
    transform: translateY(-50%) scale(1.06);
  }
  100% {
    border-color: var(--border);
    box-shadow: 0 14px 34px color-mix(in srgb, var(--ink) 7%, transparent);
    transform: translateY(-50%) scale(1);
  }
}

@keyframes vz-flow-product-arrival {
  0% {
    border-color: var(--flow-blue);
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--flow-blue) 28%, transparent);
    transform: translateY(-50%) scale(0.94);
  }
  48% {
    border-color: var(--flow-blue);
    box-shadow: 0 0 0 8px color-mix(in srgb, var(--flow-blue) 10%, transparent), 0 16px 38px color-mix(in srgb, var(--ink) 10%, transparent);
    transform: translateY(-50%) scale(1.07);
  }
  100% {
    border-color: var(--border);
    box-shadow: 0 14px 34px color-mix(in srgb, var(--ink) 7%, transparent);
    transform: translateY(-50%) scale(1);
  }
}

@keyframes vz-flow-product-ring {
  0% { opacity: 0; transform: scale(0.9); }
  24% { opacity: 0.55; }
  100% { opacity: 0; transform: scale(1.38); }
}

.vz-about__endpoint-content span {
  max-width: 17ch;
  font: 500 clamp(9px, 0.78vw, 11px)/1.3 "JetBrains Mono", monospace;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.vz-about__flow-stage {
  width: 110px;
  height: 72px;
  margin: 0;
  padding: 0;
  border: 0;
  appearance: none;
  background: transparent;
  color: var(--ink);
  font: inherit;
  cursor: pointer;
}

.vz-about__flow-stage:focus-visible { outline: none; }

.vz-about__flow-stage:focus-visible .vz-about__flow-stage-anchor {
  outline: 2px solid var(--flow-blue);
  outline-offset: 7px;
}

.vz-about__flow-stage-anchor {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  display: grid;
  width: 14px;
  height: 14px;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--bg);
  box-shadow: 0 0 0 5px var(--bg), 0 0 0 6px var(--border);
  transform: translate(-50%, -50%);
  transition:
    background-color 240ms cubic-bezier(0.23, 1, 0.32, 1),
    border-color 240ms cubic-bezier(0.23, 1, 0.32, 1),
    transform 240ms cubic-bezier(0.23, 1, 0.32, 1);
}

.vz-about__flow-stage-anchor i {
  position: relative;
  z-index: 2;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--ink);
  transition: background-color 240ms cubic-bezier(0.23, 1, 0.32, 1);
}

.vz-about__flow-stage-progress {
  position: absolute;
  z-index: 1;
  inset: -5px;
  width: calc(100% + 10px);
  height: calc(100% + 10px);
  overflow: visible;
  opacity: 0;
  pointer-events: none;
  transform: rotate(-90deg);
}

.vz-about__flow-stage-progress circle {
  fill: none;
  stroke: var(--ink);
  stroke-width: 2.75;
  stroke-linecap: round;
  stroke-dasharray: 53.407;
  stroke-dashoffset: 53.407;
}

.vz-about__flow-stage-label {
  position: absolute;
  top: calc(50% + 21px);
  left: 50%;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 34px;
  padding: 8px 12px;
  border-radius: 999px;
  color: var(--ink);
  background: transparent;
  isolation: isolate;
  transform: translateX(-50%);
  white-space: nowrap;
  transition:
    color 400ms ease,
    transform 400ms var(--ease-in-out, cubic-bezier(0.77, 0, 0.175, 1));
}

.vz-about__flow-stage-label::before {
  position: absolute;
  z-index: 0;
  inset: 0;
  border-radius: inherit;
  background: var(--ink);
  box-shadow: 0 10px 24px color-mix(in srgb, var(--ink) 12%, transparent);
  content: "";
  opacity: 0;
  pointer-events: none;
  transform: scale(0.97);
  transition:
    opacity 400ms ease,
    transform 400ms var(--ease-in-out, cubic-bezier(0.77, 0, 0.175, 1));
}

.vz-about__flow-stage--brief .vz-about__flow-stage-label,
.vz-about__flow-stage--ux .vz-about__flow-stage-label,
.vz-about__flow-stage--testing .vz-about__flow-stage-label {
  top: auto;
  bottom: calc(50% + 21px);
}

.vz-about__flow-stage-label small {
  position: relative;
  z-index: 1;
  color: var(--muted2);
  font: 500 var(--type-micro)/1 "JetBrains Mono", monospace;
  letter-spacing: 0.1em;
  transition: color 400ms ease;
}

.vz-about__flow-stage-label b {
  position: relative;
  z-index: 1;
  font: 600 var(--type-chip)/1 "Onest", sans-serif;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.vz-about__flow-stage.is-active { z-index: 5; }

.vz-about__flow-stage.is-active .vz-about__flow-stage-anchor {
  border-color: var(--ink);
  background: var(--ink);
  transform: translate(-50%, -50%) scale(1.16);
}

.vz-about__flow-stage.is-active .vz-about__flow-stage-anchor i {
  background: var(--flow-blue);
}

.vz-about__flow.is-autoplaying .vz-about__flow-stage.is-active .vz-about__flow-stage-anchor {
  animation: vz-about-stage-focus 4500ms linear both;
}

.vz-about__flow.is-autoplaying .vz-about__flow-stage.is-active .vz-about__flow-stage-progress {
  opacity: 1;
}

.vz-about__flow.is-autoplaying .vz-about__flow-stage.is-active .vz-about__flow-stage-progress circle {
  animation: vz-about-stage-progress 4500ms linear forwards;
}

@keyframes vz-about-stage-focus {
  0% { transform: translate(-50%, -50%) scale(1); }
  6%, 94% { transform: translate(-50%, -50%) scale(1.22); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

@keyframes vz-about-stage-progress {
  from { stroke-dashoffset: 53.407; }
  to { stroke-dashoffset: 0; }
}

.vz-about__flow-stage.is-active .vz-about__flow-stage-label {
  color: var(--bg);
  background: transparent;
  transform: translateX(-50%) translateY(-3px);
}

.vz-about__flow-stage.is-active .vz-about__flow-stage-label::before {
  opacity: 1;
  transform: scale(1);
}

.vz-about__flow-stage.is-active .vz-about__flow-stage-label small {
  color: rgb(255 255 255 / 46%);
}

.vz-about__flow-stage--brief { --x: 25%; --y: 50%; }
.vz-about__flow-stage--design { --x: 35%; --y: 69%; }
.vz-about__flow-stage--ux { --x: 45%; --y: 30%; }
.vz-about__flow-stage--development { --x: 55%; --y: 65%; }
.vz-about__flow-stage--testing { --x: 65%; --y: 33%; }
.vz-about__flow-stage--launch { --x: 75%; --y: 50%; }

.vz-about__proof {
  display: grid;
  grid-template-columns: minmax(280px, 1.35fr) minmax(0, 2fr);
  gap: clamp(24px, 3vw, 48px);
  align-items: center;
  padding-top: clamp(28px, 4vw, 56px);
}

.vz-about__proof > p {
  max-width: 44ch;
  margin: 0;
  color: var(--text2);
  font-size: var(--type-body);
  line-height: 1.6;
}

.vz-about__proof dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.vz-about__proof dl div {
  position: relative;
  display: flex;
  min-height: 112px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--landing-card-border, color-mix(in srgb, var(--ink) 7%, transparent));
  border-radius: 16px;
  background: var(--about-proof-surface, var(--landing-card-surface, var(--bg)));
  box-shadow: var(--landing-card-shadow, 0 20px 46px -36px color-mix(in srgb, var(--ink) 34%, transparent));
  backdrop-filter: blur(16px) saturate(1.08);
}

.vz-about__proof dl div:nth-child(1) {
  --about-proof-surface: var(--landing-card-surface-cyan-left, var(--landing-card-surface));
}

.vz-about__proof dl div:nth-child(2) {
  --about-proof-surface: var(--landing-card-surface-violet-top, var(--landing-card-surface));
}

.vz-about__proof dl div:nth-child(3) {
  --about-proof-surface: var(--landing-card-surface-diagonal, var(--landing-card-surface));
}

.vz-about__proof dl div:not(:last-child)::after {
  display: none;
}

.vz-about__proof dt {
  color: var(--ink);
  font-size: clamp(28px, 2.6vw, 38px);
  font-weight: 600;
  letter-spacing: -0.045em;
  line-height: 1;
}

.vz-about__proof dd {
  margin: 0;
  color: var(--text2);
  font-size: var(--type-body);
  line-height: 1.35;
}

.vz-flow-icon-enter-active,
.vz-flow-icon-leave-active,
.vz-flow-label-enter-active,
.vz-flow-label-leave-active {
  transition:
    opacity 180ms cubic-bezier(0.23, 1, 0.32, 1),
    transform 180ms cubic-bezier(0.23, 1, 0.32, 1);
}

.vz-flow-icon-enter-from { opacity: 0; transform: scale(0.94); }
.vz-flow-icon-leave-to { opacity: 0; transform: scale(0.97); }
.vz-flow-label-enter-from { opacity: 0; transform: translateY(4px); }
.vz-flow-label-leave-to { opacity: 0; transform: translateY(-4px); }

@media (hover: hover) and (pointer: fine) {
  .vz-about__flow-replay:hover { color: var(--ink); }
  .vz-about__flow-replay:hover span { transform: rotate(-90deg); }
  .vz-about__flow-continue:hover { color: var(--ink); }
  .vz-about__flow-continue:hover span { transform: translateX(2px); }
}

@media (max-width: 900px) {
  .vz-about { padding: var(--section-space) 20px var(--section-space); }
  .vz-about__head { align-items: flex-start; flex-direction: column; gap: 30px; margin-bottom: 48px; }
  .vz-about__title { flex: none; }
  .vz-about__title,
  .vz-about__head h2 { width: 100%; max-width: 100%; }
  .vz-about__head h2 { font-size: var(--type-section); }
  .vz-about__team-lead--desktop { display: none; }
  .vz-about__team-lead--mobile { display: block; }
  .vz-about__intro-slot { width: min(100%, 520px); margin-top: 0; }
  .vz-about__step-copy p { max-width: 44ch; }
  .vz-about__proof { grid-template-columns: 1fr; gap: 24px; }
  .vz-about__proof > p { max-width: 58ch; }
}

@media (max-width: 720px) {
  .vz-about__stage-title--desktop { display: none; }
  .vz-about__stage-title--mobile { display: inline; }
  .vz-about__head { margin-bottom: 14px; }
  .vz-about__intro { padding: 12px 16px 10px; }
  .vz-about__step-stack { grid-template-rows: max-content; }
  .vz-about__flow {
    --mobile-business-center-y: 15%;
    overflow: visible;
  }
  .vz-about__flow-canvas { width: 100%; height: 488px; min-height: 488px; }
  .vz-about__intro { border-radius: 18px; }
  .vz-about__flow-controls {
    top: var(--mobile-business-center-y);
    right: 14px;
    max-width: calc(100% - 28px);
    flex-direction: column-reverse;
    align-items: flex-end;
    gap: 0;
    transform: translateY(-50%);
  }
  .vz-about__flow-zones { grid-template-columns: 1fr; grid-template-rows: 30fr 40fr 30fr; }
  .vz-about__flow-zone:not(:last-child) { border-right: 0; border-bottom: 1px solid var(--border); }
  .vz-about__flow-zone span {
    top: 50%;
    bottom: auto;
    left: 8px;
    font-size: var(--type-micro);
    letter-spacing: 0.12em;
    transform: translateY(-50%) rotate(180deg);
    writing-mode: vertical-rl;
  }
  .vz-about__flow-node--business,
  .vz-about__flow-node--product { width: 100%; --x: 0%; }
  .vz-about__flow-node--business { --y: var(--mobile-business-center-y); }
  .vz-about__flow-node--product { --y: 85%; }
  .vz-about__flow-stage--brief { --x: 50%; --y: 30%; }
  .vz-about__flow-stage--design { --x: 25%; --y: 38%; }
  .vz-about__flow-stage--ux { --x: 50%; --y: 46%; }
  .vz-about__flow-stage--development { --x: 75%; --y: 54%; }
  .vz-about__flow-stage--testing { --x: 25%; --y: 62%; }
  .vz-about__flow-stage--launch { --x: 50%; --y: 70%; }
  .vz-about__flow-stage { width: 92px; height: 58px; }
  .vz-about__flow-stage-anchor {
    width: 11px;
    height: 11px;
    box-shadow: 0 0 0 4px var(--bg), 0 0 0 5px var(--border);
  }
  .vz-about__flow-stage-anchor i { width: 3px; height: 3px; }
  .vz-about__flow-stage-label,
  .vz-about__flow-stage--brief .vz-about__flow-stage-label,
  .vz-about__flow-stage--ux .vz-about__flow-stage-label,
  .vz-about__flow-stage--testing .vz-about__flow-stage-label {
    top: 50%;
    right: auto;
    bottom: auto;
    left: calc(50% + 15px);
    gap: 7px;
    padding: 7px 9px;
    transform: translateY(-50%);
  }
  .vz-about__flow-stage-label small { font-size: var(--type-micro); }
  .vz-about__flow-stage-label b { font-size: calc(var(--type-micro) + 2px); }
  .vz-about__flow-stage.is-active .vz-about__flow-stage-label {
    transform: translateY(-50%) translateX(3px);
  }
  .vz-about__flow-stage--design .vz-about__flow-stage-label {
    top: calc(50% + 15px);
    right: auto;
    bottom: auto;
    left: 50%;
    transform: translateX(-50%);
  }
  .vz-about__flow-stage--design.is-active .vz-about__flow-stage-label {
    transform: translateX(-50%) translateY(3px);
  }
  .vz-about__flow-stage--development .vz-about__flow-stage-label {
    top: calc(50% + 15px);
    right: auto;
    bottom: auto;
    left: 50%;
    transform: translateX(-50%);
  }
  .vz-about__flow-stage--development.is-active .vz-about__flow-stage-label {
    transform: translateX(-50%) translateY(3px);
  }
  .vz-about__flow-stage--ux .vz-about__flow-stage-label,
  .vz-about__flow-stage--testing .vz-about__flow-stage-label {
    top: auto;
    right: auto;
    bottom: calc(50% + 15px);
    left: 50%;
    transform: translateX(-50%);
  }
  .vz-about__flow-stage--ux.is-active .vz-about__flow-stage-label,
  .vz-about__flow-stage--testing.is-active .vz-about__flow-stage-label {
    transform: translateX(-50%) translateY(-3px);
  }
  .vz-about__endpoint-frame {
    width: 56px;
    margin-bottom: -28px;
  }
  .vz-about__endpoint-icon { width: 28px; height: 28px; }
  .vz-about__endpoint-content { gap: 6px; }
  .vz-about__endpoint-content span { max-width: 15ch; font-size: calc(var(--type-micro) + 2px); line-height: 1.2; }
  .vz-about__flow-node--business .vz-about__endpoint-content > span {
    position: absolute;
    top: -43px;
    left: 0;
    width: 100%;
    max-width: none;
    text-align: center;
  }
  .vz-about__proof dl { grid-template-columns: 1fr; gap: 10px; }
  .vz-about__proof dl div {
    min-height: 82px;
    flex-direction: row;
    align-items: center;
    gap: 18px;
    padding: 16px 18px;
  }
  .vz-about__proof dt { font-size: 28px; }
  .vz-about__proof dd { max-width: 24ch; font-size: var(--type-caption); text-align: right; }
  .vz-about__step-copy {
    height: auto;
    min-height: 0;
    grid-template-columns: minmax(92px, 0.58fr) minmax(0, 1.42fr);
    gap: 14px;
    padding-top: 0;
  }
  .vz-about__step-meta > span { font-size: 40px; }
  .vz-about__step-meta strong { margin-top: 12px; font-size: var(--type-label); }
  .vz-about__step-meta small { margin-top: 5px; font-size: var(--type-label); }
  .vz-about__step-copy p {
    max-width: none;
    margin: 0;
    color: var(--text2);
    font-size: var(--type-caption);
    line-height: 1.4;
  }
  .vz-about__step-deliverables {
    flex-wrap: nowrap;
    gap: 5px;
    margin-top: 6px;
  }
  .vz-about__step-deliverables li {
    min-height: 28px;
    padding: 4px 6px;
    font-size: var(--type-chip);
    white-space: nowrap;
  }
  .vz-about__step-deliverables li:nth-child(n + 3) { display: none; }
}

@media (max-width: 390px) {
  .vz-about__step-copy { grid-template-columns: 80px minmax(0, 1fr); gap: 10px; }
  .vz-about__step-meta > span { font-size: 36px; }
}

@media (max-width: 370px) {
  .vz-about__step-detail { display: contents; }
  .vz-about__step-copy p { grid-column: 2; }
  .vz-about__step-deliverables { grid-column: 1 / -1; }
}

@media (prefers-reduced-motion: reduce) {
  .vz-about__flow-continue {
    display: none;
  }

  .vz-about__flow-node--business.is-sending .vz-about__endpoint-frame,
  .vz-about__flow-node--business.is-sending .vz-about__endpoint-frame::after,
  .vz-about__flow-node--product.is-arrived .vz-about__endpoint-frame,
  .vz-about__flow-node--product.is-arrived .vz-about__endpoint-frame::after {
    animation: none;
  }
  .vz-about__flow-replay span,
  .vz-about__flow-continue span,
  .vz-about__flow-stage-anchor,
  .vz-about__flow-stage-anchor i,
  .vz-about__flow-stage-label,
  .vz-flow-icon-enter-active,
  .vz-flow-icon-leave-active,
  .vz-flow-label-enter-active,
  .vz-flow-label-leave-active,
  .vz-about__step-copy { transition-duration: 1ms; }

  .vz-about__flow-stage-label::before,
  .vz-about__flow-stage.is-active .vz-about__flow-stage-label::before {
    transform: none;
    transition: opacity 180ms ease;
  }

  .vz-about__flow.is-autoplaying .vz-about__flow-stage.is-active .vz-about__flow-stage-anchor,
  .vz-about__flow.is-autoplaying .vz-about__flow-stage.is-active .vz-about__flow-stage-progress circle {
    animation: none;
  }

  .vz-about__flow-stage-progress {
    display: none;
  }

  .vz-about__intro,
  .vz-about__step-stack {
    transition-duration: 1ms;
  }
}

.vz-flow-control-enter-active,
.vz-flow-control-leave-active {
  transition:
    opacity 180ms var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1)),
    transform 180ms var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1));
}

.vz-flow-control-enter-from,
.vz-flow-control-leave-to {
  opacity: 0;
  transform: translate3d(6px, 0, 0);
}
</style>
