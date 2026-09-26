<template>
  <section
    id="hero"
    ref="heroRef"
    class="vz-hero"
    @pointermove="handlePointerMove"
    @pointerleave="resetPointer"
  >
    <div class="vz-hero__art" aria-hidden="true">
      <div class="vz-aura vz-aura--top"></div>
      <div class="vz-monolith">
        <div class="vz-monolith__body">
          <div class="vz-monolith__face vz-monolith__face--left">
            <span class="vz-monolith__brand">VEZHA</span>
          </div>
          <div class="vz-monolith__face vz-monolith__face--right">
            <span class="vz-monolith__slogan"><span>Small</span><span>ideas</span><span>big</span><span>results</span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="vz-hero__inner">
      <h1>
        <span v-for="(line, index) in copy.title" :key="line"><span data-reveal :data-reveal-order="index">{{ line }}</span></span>
      </h1>
      <div class="vz-hero__grid" data-hero-grid>
        <div class="vz-hero__actions">
          <a class="vz-button vz-button--dark" href="#contacts">{{ copy.cta }}</a>
          <a class="vz-button-link" href="#cases">{{ copy.casesLink }} <span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <div class="vz-hero__stats" data-hero-stats>
        <span v-for="stat in copy.stats" :key="stat">{{ stat }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  copy: {
    title: string[];
    cta: string;
    casesLink: string;
    stats: string[];
  };
}>();

const emit = defineEmits<{
  "hero-ready": [hero: HTMLElement | null, negative: HTMLElement | null];
}>();

const heroRef = ref<HTMLElement | null>(null);
let apexObserver: ResizeObserver | null = null;
let reduceMotion: MediaQueryList | null = null;
let pointerRaf = 0;
let scrollRaf = 0;
let pointerX = 0;
let pointerY = 0;

// Pointer parallax: the monolith leans toward the cursor, eased by a CSS transition.
function handlePointerMove(event: PointerEvent) {
  const hero = heroRef.value;
  if (!hero || event.pointerType === "touch" || reduceMotion?.matches) return;
  const rect = hero.getBoundingClientRect();
  pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
  pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
  if (pointerRaf) return;
  pointerRaf = requestAnimationFrame(() => {
    pointerRaf = 0;
    hero.style.setProperty("--hero-px", pointerX.toFixed(3));
    hero.style.setProperty("--hero-py", pointerY.toFixed(3));
  });
}

function resetPointer() {
  heroRef.value?.style.setProperty("--hero-px", "0");
  heroRef.value?.style.setProperty("--hero-py", "0");
}

// Scroll parallax keeps some depth on touch screens, where there is no cursor.
function handleScroll() {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0;
    const hero = heroRef.value;
    if (!hero || reduceMotion?.matches) return;
    const progress = Math.max(0, Math.min(1, window.scrollY / Math.max(1, hero.offsetHeight)));
    hero.style.setProperty("--hero-scroll", progress.toFixed(3));
  });
}

// Desktop apex sits between the first and second title lines. offsetTop ignores
// the reveal and parallax transforms, so the apex stays put while they run.
function syncApex() {
  const hero = heroRef.value;
  const inner = hero?.querySelector<HTMLElement>(".vz-hero__inner");
  const firstLine = hero?.querySelector<HTMLElement>("h1 > span");
  if (!hero || !inner || !firstLine) return;
  const apexY = inner.offsetTop + firstLine.offsetTop + firstLine.offsetHeight;
  hero.style.setProperty("--hero-apex-y", `${apexY}px`);
}

onMounted(() => {
  reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  syncApex();
  apexObserver = new ResizeObserver(syncApex);
  if (heroRef.value) apexObserver.observe(heroRef.value);
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
  emit("hero-ready", heroRef.value, null);
});

onBeforeUnmount(() => {
  apexObserver?.disconnect();
  window.removeEventListener("scroll", handleScroll);
  cancelAnimationFrame(pointerRaf);
  cancelAnimationFrame(scrollRaf);
  emit("hero-ready", null, null);
});
</script>

<style scoped>
@media (max-width: 900px) {
  .vz-hero__grid {
    margin-top: 34px;
  }

  .vz-hero__actions {
    width: 100%;
    align-items: stretch;
    justify-self: stretch;
  }

  .vz-hero__actions .vz-button {
    box-sizing: border-box;
    width: 100%;
    min-height: 54px;
  }

  .vz-hero__actions .vz-button-link {
    align-self: center;
  }

  .vz-hero__stats {
    margin-top: 32px;
  }

  .vz-hero__stats span {
    font-size: clamp(11px, 3vw, 12px);
    letter-spacing: 0.01em;
  }
}
</style>
