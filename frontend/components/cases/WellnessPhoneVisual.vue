<template>
  <figure class="wellness-phone" :class="`wellness-phone--${variant}`">
    <img
      class="wellness-phone__scene"
      src="/cases/wellness-app/hero-hand-device-v2.png"
      alt=""
      aria-hidden="true"
    />
    <div class="wellness-phone__screen" aria-hidden="true">
      <div v-if="variant === 'default'" class="wellness-phone__brand">
        <img class="wellness-phone__brand-mark" src="/cases/wellness-app/wellness-mark.svg" alt="" />
        <strong>WELLNESS</strong>
        <small>APP</small>
      </div>
      <img v-else src="/cases/wellness-app/screen-timer.png" alt="" />
      <span class="wellness-phone__notch"></span>
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
  object-position: 50% 50%;
}

.wellness-phone__screen {
  position: absolute;
  width: auto;
  overflow: hidden;
  border-radius: 4.6% / 2.4%;
  transform: translateX(-50%);
  transform-origin: center;
  background: #000;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.04);
}

.wellness-phone--default .wellness-phone__screen {
  top: 9.7%;
  left: 50%;
  height: 78.7%;
  aspect-ratio: .443;
}

.wellness-phone--wide .wellness-phone__scene { object-position: 51.7% 50%; }

.wellness-phone--wide .wellness-phone__screen {
  top: 9.7%;
  left: calc(50% + clamp(7px, 2.1vh, 22px));
  height: 75.7%;
  aspect-ratio: .477;
}

.wellness-phone__screen img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
  filter: contrast(1.08);
}

.wellness-phone__brand {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #f6f8fb;
  background:
    radial-gradient(circle at 50% 44%, rgba(45, 204, 241, .13), transparent 31%),
    #020407;
}

.wellness-phone__brand-mark {
  width: clamp(72px, 34%, 116px);
  aspect-ratio: 1;
  margin-bottom: 24px;
  border-radius: 24%;
  object-fit: contain;
  box-shadow: 0 20px 44px rgba(92, 185, 234, .18);
}

.wellness-phone__brand strong {
  font: 600 clamp(15px, 3.1vh, 27px)/1 var(--font-ui);
  letter-spacing: .16em;
  text-indent: .16em;
}

.wellness-phone__brand small {
  margin-top: 8px;
  color: rgba(230, 237, 246, .55);
  font: 500 clamp(7px, 1.3vh, 11px)/1 var(--font-mono);
  letter-spacing: .54em;
  text-indent: .54em;
}

.wellness-phone__notch {
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
  .wellness-phone--default .wellness-phone__scene { object-position: 50% 50%; }
  .wellness-phone--default .wellness-phone__screen { left: 50%; height: 78.7%; }
  .wellness-phone--wide .wellness-phone__scene { object-position: 51.7% 50%; }
  .wellness-phone--wide .wellness-phone__screen { left: calc(50% + 10px); height: 75.7%; }
}

@media (prefers-reduced-motion: reduce) {
  .wellness-phone__screen { transform: translateX(-50%); }
}
</style>
