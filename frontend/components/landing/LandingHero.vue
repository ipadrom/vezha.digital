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
        <span v-for="item in copy.meta.filter(Boolean)" :key="item">{{ item }}</span>
      </div>
      <div class="vz-hero__kicker">
        <span>{{ copy.kicker }}</span>
      </div>
      <h1>
        <span v-for="line in copy.title" :key="line"><span data-reveal>{{ line }}</span></span>
      </h1>
      <div class="vz-hero__grid" data-hero-grid>
        <p>{{ copy.text }}</p>
        <div class="vz-hero__actions">
          <a class="vz-button vz-button--dark" href="#contacts">{{ copy.cta }}</a>
          <a class="vz-button-link" href="#services">{{ copy.servicesLink }} <span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <div class="vz-hero__stats" data-hero-stats>
        <span v-for="stat in copy.stats" :key="stat">{{ stat }}</span>
      </div>
    </div>

    <div ref="negativeRef" class="vz-hero__negative vz-hero__negative--main" aria-hidden="true">
      <div class="vz-hero__negative-plane" data-hero-negative-plane>
        <div class="vz-negative-world vz-negative-world--hero" data-negative-world="hero"></div>
      </div>
    </div>

    <div class="vz-marquee" :aria-label="marqueeAria">
      <div>
        <span v-for="item in marqueeItems" :key="`a-${item}`">{{ item }} <i>✦</i></span>
        <span v-for="item in marqueeItems" :key="`b-${item}`" aria-hidden="true">{{ item }} <i>✦</i></span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  copy: {
    meta: [string, string];
    kicker: string;
    title: string[];
    text: string;
    cta: string;
    servicesLink: string;
    stats: string[];
  };
  marqueeAria: string;
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
