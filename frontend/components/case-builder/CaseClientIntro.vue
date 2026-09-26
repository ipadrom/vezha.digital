<template>
  <article class="case-client">
    <header class="case-client__identity">
      <div class="builder-editorial__heading"><h2>{{ content.eyebrow }}</h2></div>
    </header>
    <div class="case-client__content">
      <div class="case-client__person">
        <img v-if="content.image_url" :src="content.image_url" :alt="content.alt || ''" width="220" height="220" loading="lazy" decoding="async" />
        <div>
          <h3>{{ content.title }}</h3>
          <p v-if="content.caption">{{ content.caption }}</p>
          <div v-if="buttonCount" class="case-client__actions" :class="{ 'case-client__actions--single': buttonCount === 1 }">
            <button v-if="email" class="case-client__button case-client__button--email" type="button" :aria-label="`${t('landing.contacts.copyEmailAria')}: ${email}`" @click="copyValue('email', email)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
              <span class="case-client__value">
                <span :style="{ opacity: copiedKey === 'email' ? 0 : 1 }">{{ email }}</span>
                <span class="case-client__value-copied" aria-hidden="true" :style="{ opacity: copiedKey === 'email' ? 1 : 0 }">{{ t('landing.contacts.copied') }}</span>
              </span>
            </button>
            <a v-if="contactUrl" class="case-client__button" :href="contactUrl" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M21.4 3.6c.3-1.2-.5-1.7-1.4-1.3L2.5 9c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4L17.3 5.3c.5-.3.9-.1.5.3l-8.5 7.7-.3 4.7c.5 0 .7-.2 1-.5l2.2-2.1 4.6 3.4c.9.5 1.5.3 1.7-.8L21.4 3.6Z" /></svg>
              <span>{{ content.contact_label }}</span>
            </a>
            <a v-if="safeLink(content.project_url)" class="case-client__button case-client__button--project" :href="safeLink(content.project_url)" target="_blank" rel="noopener noreferrer">
              <img v-if="content.logo_url" :src="content.logo_url" alt="" class="case-client__button-logo" />
              <span>{{ content.project_label }}</span>
            </a>
          </div>
          <p class="case-client__copy-status" role="status" aria-live="polite">{{ copiedKey ? t('landing.contacts.copied') : '' }}</p>
        </div>
      </div>
      <div class="case-client__story">
        <p v-for="(paragraph, index) in paragraphs" :key="index" class="builder-prose"><template v-if="index === 0 && content.logo_url && content.logo_label && paragraph.startsWith(content.logo_label)"><img class="case-client__inline-logo" :src="content.logo_url" :alt="content.logo_label" />{{ paragraph.slice(content.logo_label.length) }}</template><template v-else>{{ paragraph }}</template></p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useContactCopy } from '~/composables/useContactCopy'

const props = defineProps<{ content: Record<string, any> }>()
const { t } = useI18n()
const { copiedKey, copyValue } = useContactCopy()
function safeLink(value: unknown) {
  try { const url = new URL(String(value)); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined } catch { return undefined }
}
// The address is copied on click, like the landing contacts, rather than opened as a mailto link.
const email = computed(() => { const value = String(props.content.contact_email || '').trim(); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : '' })
const contactUrl = computed(() => props.content.show_contact === false ? undefined : safeLink(props.content.contact_url))
// A lone button stretches across the column.
const buttonCount = computed(() => [email.value, contactUrl.value, safeLink(props.content.project_url)].filter(Boolean).length)
const paragraphs = computed(() => String(props.content.body || '').split(/\n\s*\n/).filter(Boolean))
</script>

<style scoped>
.case-client {
  display: grid;
  grid-template-columns: var(--case-editorial-grid, 1fr 1fr);
  gap: var(--case-editorial-gap, 48px);
  color: var(--case-ink);
}
.case-client__identity, .case-client__content { min-width: 0; }
.case-client__content { display: grid; grid-template-columns: minmax(310px, 1.15fr) minmax(0, 1.7fr); align-items: start; gap: clamp(28px, 3vw, 48px); }
.case-client__person { display: flex; flex-direction: column; align-items: center; width: fit-content; max-width: 100%; gap: 24px; min-width: 0; }
.case-client__person > img { width: min(100%, 220px); height: auto; aspect-ratio: 1; object-fit: cover; border-radius: 50%; }
/* Name, caption and buttons sit centred under the portrait. */
.case-client__person > div { width: 100%; text-align: center; }
.case-client h3 { margin: 0; white-space: nowrap; font: 540 clamp(22px, 2vw, 28px)/1.12 var(--font-ui); letter-spacing: -0.035em; }
.case-client__person p { margin: 12px 0 0; font-size: 15px; line-height: 1.5; color: var(--case-muted); }
.case-client__story { min-width: 0; }
.case-client__story p { margin: 0; }
.case-client__inline-logo { display: inline-block; width: auto; height: 0.95em; vertical-align: -0.04em; }
.case-client__story p + p { margin-top: 1.58em; }
/* Equal columns: both buttons take the width of the wider label. */
.case-client__actions { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; justify-content: center; width: fit-content; max-width: 100%; gap: 8px; margin: 24px auto 0; }
.case-client__actions--single { width: 100%; }
.case-client__actions--single .case-client__button { width: 100%; font-size: 16px; }
.case-client__button { display: flex; align-items: center; justify-content: center; gap: 7px; min-width: 0; min-height: 48px; padding: 11px 10px; box-sizing: border-box; border: 1px solid color-mix(in srgb, var(--case-ink) 18%, transparent); border-radius: 999px; background: transparent; color: var(--case-ink); font: 500 14px/1.3 var(--font-ui); text-decoration: none; }
.case-client__button svg { width: 20px; height: 20px; flex: 0 0 20px; }
.case-client__button--project { background: #ff4c00; border-color: #ff4c00; color: #161616; }
.case-client__button-logo { width: 30px; height: 14px; object-fit: contain; filter: brightness(0); }
.case-client__value { display: inline-grid; min-width: 0; }
.case-client__value > span { grid-area: 1 / 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: opacity 180ms ease; }
.case-client__copy-status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.case-client__button:hover { opacity: 0.88; }
.case-client__button:focus-visible { outline: 2px solid var(--case-ink); outline-offset: 4px; }
@media (max-width: 1100px) {
  .case-client__person { justify-self: center; }
}
@media (min-width: 768px) and (max-width: 1100px) {
  .case-client__content { grid-template-columns: 1fr; }
}
@media (max-width: 767px) {
  .case-client { grid-template-columns: 1fr; gap: 26px; }
  .case-client__content { grid-template-columns: 1fr; gap: 28px; }
  .case-client__person { gap: 20px; }
  .case-client__person > img { width: 180px; }
}
</style>
