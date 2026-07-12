<template>
  <section id="about" class="vz-about">
    <div class="vz-about__grid">
      <div class="vz-about__brand">
        <div class="vz-section-label">
          <span>Кто мы</span>
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
            <span>человек ведёт проект</span>
          </div>
          <div>
            <strong>0</strong>
            <span>субподрядчиков в цепочке</span>
          </div>
          <div>
            <strong>1-4</strong>
            <span>недели до первого запуска</span>
          </div>
        </div>
        <p class="vz-about__note">Не агентская цепочка, а компактная продуктовая команда, которая отвечает за результат целиком.</p>
      </div>
      <div class="vz-about__copy">
        <div class="vz-about__eyebrow">
          <span>Команда полного цикла</span>
          <span>Один ответственный человек</span>
        </div>
        <p class="vz-about__lead">
          Команда, которая ведёт проект до запуска
        </p>
        <div class="vz-about__principles">
          <article>
            <span>01</span>
            <p>Вникаем в задачу и предлагаем решения, а не просто закрываем ТЗ. Никакого субподряда и лишних звеньев между вами и результатом.</p>
          </article>
          <article>
            <span>02</span>
            <p>Нам важно, чтобы продукт реально работал в вашем бизнесе, а не выглядел красиво на сдаче и пылился после запуска.</p>
          </article>
        </div>
        <div ref="flowRef" class="vz-about__flow" :class="`is-${flowPhase}`" aria-label="Как бизнес-задача собирается в продукт">
          <button class="vz-about__flow-replay" type="button" aria-label="Повторить анимацию процесса" @click="$emit('replay')">
            Повторить ↻
          </button>
          <div class="vz-about__flow-zones" aria-hidden="true">
            <div class="vz-about__flow-zone vz-about__flow-zone--client"><span>Клиент</span></div>
            <div class="vz-about__flow-zone vz-about__flow-zone--vezha"><span>VEZHA.DIGITAL</span></div>
            <div class="vz-about__flow-zone vz-about__flow-zone--product"><span>Продукт</span></div>
          </div>
          <svg :key="flowCycleKey" class="vz-about__flow-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path class="is-primary" d="M 20.5 50 C 24 50 28 50 32 50" />
            <path v-for="segment in snakeSegments" :key="`line-${segment.key}`" :d="segment.path" />
            <path class="vz-about__flow-pulse vz-about__flow-pulse--entry" d="M 20.5 50 C 24 50 28 50 32 50" pathLength="100" stroke-dasharray="12 100" stroke-dashoffset="0" opacity="0">
              <animate attributeName="opacity" begin="0.24s" dur="0.8s" values="0;0.95;0.95;0" keyTimes="0;0.08;0.9;1" repeatCount="1" />
              <animate attributeName="stroke-dashoffset" begin="0.24s" dur="0.8s" values="0;-100" repeatCount="1" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.66 0 0.34 1" />
            </path>
            <path v-for="segment in snakeSegments" :key="`pulse-${segment.key}`" class="vz-about__flow-pulse vz-about__flow-pulse--snake" :d="segment.path" pathLength="100" stroke-dasharray="12 100" stroke-dashoffset="0" opacity="0">
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
          <div class="vz-about__flow-node vz-about__flow-node--vezha">VEZHA<br>Digital</div>
          <div class="vz-about__flow-stage vz-about__flow-stage--design">
            <span class="vz-about__flow-stage-base" aria-hidden="true"></span>
            <span class="vz-about__flow-stage-card">Design</span>
          </div>
          <div class="vz-about__flow-stage vz-about__flow-stage--ux">
            <span class="vz-about__flow-stage-base" aria-hidden="true"></span>
            <span class="vz-about__flow-stage-card">UX/UI</span>
          </div>
          <div class="vz-about__flow-stage vz-about__flow-stage--development">
            <span class="vz-about__flow-stage-base" aria-hidden="true"></span>
            <span class="vz-about__flow-stage-card">Development</span>
          </div>
          <div class="vz-about__flow-stage vz-about__flow-stage--testing">
            <span class="vz-about__flow-stage-base" aria-hidden="true"></span>
            <span class="vz-about__flow-stage-card">Testing</span>
          </div>
          <div class="vz-about__flow-node vz-about__flow-node--product" :aria-label="activeProduct?.label || 'Итоговый продукт'">
            <Transition name="vz-flow-product" mode="out-in">
              <div v-if="flowPhase === 'result' && activeProduct" :key="activeProduct.label" class="vz-about__product-content">
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
type FlowItem = {
  label: string;
  iconPaths: string[];
};

defineProps<{
  flowPhase: "signal" | "result";
  flowCycleKey: number;
  snakeSegments: Array<{ key: string; path: string; begin: string }>;
  activeBusiness: FlowItem;
  activeProduct: FlowItem | null;
}>();

const emit = defineEmits<{
  replay: [];
  "flow-ready": [element: HTMLElement | null];
}>();

const flowRef = ref<HTMLElement | null>(null);

onMounted(() => emit("flow-ready", flowRef.value));
onBeforeUnmount(() => emit("flow-ready", null));
</script>
