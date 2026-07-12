<template>
  <section
    id="hero"
    ref="heroRef"
    class="vz-hero"
    @pointerenter="$emit('pointer-enter', $event)"
    @pointermove="$emit('pointer-move', $event)"
    @pointerleave="$emit('pointer-leave', $event)"
  >
    <div class="vz-hero__art" aria-hidden="true">
      <div class="vz-aura vz-aura--top"></div>
      <div class="vz-orbit">
        <svg data-orbit viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="98" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 7" />
        </svg>
      </div>
    </div>

    <div class="vz-hero__inner">
      <div class="vz-hero__meta" data-hero-meta>
        <span>2026 / Веб-студия</span>
        <span>Base / Moscow</span>
      </div>
      <div class="vz-hero__kicker">
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
        <span>Запуск 1–4 недели</span>
        <span>Полный цикл</span>
        <span>Без субподряда</span>
      </div>
    </div>

    <div ref="negativeRef" class="vz-hero__negative vz-hero__negative--main" aria-hidden="true">
      <div class="vz-hero__negative-plane" data-hero-negative-plane>
        <div class="vz-negative-world vz-negative-world--hero" data-negative-world="hero"></div>
      </div>
    </div>

    <div class="vz-marquee" aria-label="Направления разработки">
      <div>
        <span v-for="item in marqueeItems" :key="`a-${item}`">{{ item }} <i>✦</i></span>
        <span v-for="item in marqueeItems" :key="`b-${item}`" aria-hidden="true">{{ item }} <i>✦</i></span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  marqueeItems: string[];
}>();

const emit = defineEmits<{
  "pointer-enter": [event: PointerEvent];
  "pointer-move": [event: PointerEvent];
  "pointer-leave": [event: PointerEvent];
  "hero-ready": [hero: HTMLElement | null, negative: HTMLElement | null];
}>();

const heroRef = ref<HTMLElement | null>(null);
const negativeRef = ref<HTMLElement | null>(null);

onMounted(() => emit("hero-ready", heroRef.value, negativeRef.value));
onBeforeUnmount(() => emit("hero-ready", null, null));
</script>
