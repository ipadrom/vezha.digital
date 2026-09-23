<template>
  <section id="contacts" class="vz-contacts">
    <div class="vz-contacts__art" aria-hidden="true">
      <div></div>
    </div>
    <div class="vz-contacts__inner">
      <div class="vz-section-label">
        <span>{{ copy.label }}</span>
        <i>/</i>
        <span data-secnum>06</span>
      </div>
      <h2><span><span data-reveal>{{ copy.title }}</span></span></h2>
      <div class="vz-contacts__buttons" data-contacts-btns>
        <button class="vz-button vz-button--light" type="button" :aria-label="copy.copyEmailAria" @click="copyValue('email', contactEmail)">
          <svg class="vz-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
          <span class="vz-contacts__value">
            <span class="vz-contacts__value-text" :style="{ opacity: copiedKey === 'email' ? 0 : 1 }">{{ contactEmail }}</span>
            <span class="vz-contacts__value-copied" aria-hidden="true" :style="{ opacity: copiedKey === 'email' ? 1 : 0 }">{{ copy.copied }}</span>
          </span>
        </button>
        <a class="vz-button vz-button--light" :href="contactTelegram.url" target="_blank" rel="noopener noreferrer">
          <svg class="vz-contact-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M21.4 3.6c.3-1.2-.5-1.7-1.4-1.3L2.5 9c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4L17.3 5.3c.5-.3.9-.1.5.3l-8.5 7.7-.3 4.7c.5 0 .7-.2 1-.5l2.2-2.1 4.6 3.4c.9.5 1.5.3 1.7-.8L21.4 3.6Z" />
          </svg>
          <span>Telegram {{ contactTelegram.handle }}</span>
        </a>
        <button class="vz-button vz-button--light" type="button" :aria-label="copy.copyPhoneAria" @click="copyValue('phone', contactPhone)">
          <svg class="vz-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
          </svg>
          <span class="vz-contacts__value">
            <span class="vz-contacts__value-text" :style="{ opacity: copiedKey === 'phone' ? 0 : 1 }">{{ contactPhone }}</span>
            <span class="vz-contacts__value-copied" aria-hidden="true" :style="{ opacity: copiedKey === 'phone' ? 1 : 0 }">{{ copy.copied }}</span>
          </span>
        </button>
      </div>
      <p class="vz-contacts__copy-status" role="status" aria-live="polite">{{ copiedKey ? copy.copied : "" }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { contactPhone, contactTelegram, useContactCopy } from "~/composables/useContactCopy";

defineProps<{
  copy: {
    label: string;
    title: string;
    copied: string;
    copyEmailAria: string;
    copyPhoneAria: string;
    emailCta: string;
  };
  contactEmail: string;
}>();

const { copiedKey, copyValue } = useContactCopy();
</script>

<style scoped>
@property --contact-border-sweep {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

.vz-contacts__buttons .vz-button {
  position: relative;
  gap: 10px;
  transition: transform 180ms var(--ease-out);
}

/* The copy controls are buttons, so they need the anchor's chrome-free look. */
.vz-contacts__buttons button.vz-button {
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-size: var(--type-control);
  font-weight: 500;
}

/* Keep the button its own width while the confirmation covers the value. */
.vz-contacts__value {
  position: relative;
  display: inline-flex;
}

.vz-contacts__value-text,
.vz-contacts__value-copied {
  transition: opacity 140ms ease;
}

.vz-contacts__value-copied {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  inset: 0;
}

.vz-contacts__copy-status {
  position: absolute;
  overflow: hidden;
  width: 1px;
  height: 1px;
  clip-path: inset(50%);
  white-space: nowrap;
}

.vz-contacts__buttons .vz-button::after {
  content: "";
  position: absolute;
  inset: -1px;
  border: 2px solid #68bdff;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  --contact-border-sweep: 0deg;
  mask-image: conic-gradient(
    from 0deg,
    #000 0deg var(--contact-border-sweep),
    transparent var(--contact-border-sweep) calc(360deg - var(--contact-border-sweep)),
    #000 calc(360deg - var(--contact-border-sweep)) 360deg
  );
  transition: --contact-border-sweep 280ms ease, opacity 180ms ease;
}

.vz-contacts__buttons .vz-button:focus-visible::after {
  opacity: 1;
  --contact-border-sweep: 180deg;
  transition: none;
}

@media (hover: hover) and (pointer: fine) {
  .vz-contacts__buttons .vz-button:hover {
    transform: translateY(-4px);
  }

  .vz-contacts__buttons .vz-button:hover::after {
    opacity: 1;
    --contact-border-sweep: 180deg;
  }

  .vz-contacts__buttons .vz-button:active {
    transform: translateY(-1px);
    transition-duration: 120ms;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vz-contacts__buttons .vz-button,
  .vz-contacts__buttons .vz-button:hover,
  .vz-contacts__buttons .vz-button:active {
    transform: none;
    transition: none;
  }

  .vz-contacts__buttons .vz-button::after {
    mask-image: none;
    transition: opacity 180ms ease;
  }
}

.vz-contact-icon {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
}
</style>
