<template>
  <figure class="wellness-phone" :class="`wellness-phone--${variant}`">
    <img
      class="wellness-phone__scene"
      src="/cases/wellness-app/hero-hand-device.png"
      alt=""
      aria-hidden="true"
    />
    <div class="wellness-phone__screen" aria-hidden="true">
      <img src="/cases/wellness-app/screen-workout-home.png" alt="" />
      <span></span>
    </div>
    <figcaption class="sr-only">
      {{ locale === "ru" ? `Приложение ${title} на экране телефона в руке` : `${title} application shown on a phone held in hand` }}
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string;
  locale?: "ru" | "en";
  variant?: "default" | "wide";
}>(), {
  locale: "ru",
  variant: "default",
});
</script>

<style scoped>
.wellness-phone {
  position: absolute;
  inset: 0;
  margin: 0;
  overflow: hidden;
  background: #060a0f;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.wellness-phone__scene {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 53.4% 50%;
}

.wellness-phone__screen {
  position: absolute;
  top: 9.7%;
  left: calc(50% + clamp(7px, 3.1vh, 32px));
  width: auto;
  height: 75.1%;
  aspect-ratio: .542;
  overflow: hidden;
  border-radius: 7.5% / 4.2%;
  transform: translateX(-50%) perspective(1200px) rotateZ(-1deg) rotateY(-1deg);
  transform-origin: center;
  background: #000;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.04);
}

.wellness-phone__screen img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
  filter: saturate(.9) contrast(1.03);
}

.wellness-phone__screen span {
  position: absolute;
  top: 0;
  left: 50%;
  width: 34%;
  height: 3.2%;
  border-radius: 0 0 12px 12px;
  transform: translateX(-50%);
  background: #020305;
}

@media (max-width: 900px) {
  .wellness-phone__scene { object-position: 53% 50%; }
  .wellness-phone__screen { left: calc(50% + 12px); height: 75%; }
}

@media (prefers-reduced-motion: reduce) {
  .wellness-phone__screen { transform: translateX(-50%) rotateZ(-1deg); }
}
</style>
