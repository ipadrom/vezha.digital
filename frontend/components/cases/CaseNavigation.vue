<template>
  <div class="builder-next-shell">
    <header class="builder-next-header">
      <div>
        <span v-if="content.eyebrow" class="builder-eyebrow">{{ content.eyebrow }}</span>
        <h2>{{ navigationTitle }}</h2>
      </div>
      <NuxtLink class="builder-next-link" to="/#cases">
        {{ allCasesLabel }} <b aria-hidden="true">↗</b>
      </NuxtLink>
    </header>
    <nav v-if="relatedCases.length" class="case-cover-grid" :style="{ '--cover-columns': relatedCases.length }" :aria-label="locale === 'ru' ? 'Другие проекты' : 'More projects'">
      <NuxtLink v-for="project in relatedCases" :key="project.slug" class="case-cover-link" :to="`/cases/${project.slug}`" :aria-label="`${locale === 'ru' ? 'Смотреть' : 'View'}: ${project.name}`">
        <img v-if="project.cover_image_url || project.image_url" :src="project.cover_image_url || project.image_url || ''" alt="" loading="lazy" decoding="async" />
        <div v-else class="case-cover-placeholder" aria-hidden="true">{{ project.name }}</div>
        <span class="case-cover-shade" aria-hidden="true"></span>
        <div class="case-cover-content">
          <div class="case-cover-details">
          <span v-if="project.type" class="case-cover-type">{{ project.type }}</span>
          <h3>{{ project.name }}</h3>
          </div>
          <span class="case-cover-action"><span>{{ content.card_cta_label || (locale === 'ru' ? 'Смотреть кейс' : 'View case') }}</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10" /></svg></span>
        </div>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { IProjects } from '~/utils/interfaces/IProjects'
import { selectRelatedCases } from '~/utils/caseNavigation'
const props = defineProps<{ content: Record<string, any>; locale: 'ru' | 'en'; relatedProjects?: IProjects[]; currentSlug?: string }>()
const navigationTitle = computed(() => props.content.title && !['Следующий кейс', 'Next case'].includes(props.content.title) ? props.content.title : props.locale === 'ru' ? 'Другие проекты' : 'More projects')
const allCasesLabel = computed(() => props.content.cta_label && !['Открыть', 'Open'].includes(props.content.cta_label) ? props.content.cta_label : props.locale === 'ru' ? 'Все кейсы' : 'All cases')
const { data: publishedProjects } = useNavigationCases(() => props.locale)
const relatedCases = computed(() => selectRelatedCases(props.relatedProjects ?? publishedProjects.value, props.content, props.currentSlug))
</script>

<style scoped>
.case-cover-grid { display: grid; grid-template-columns: repeat(var(--cover-columns, 2), minmax(0, 1fr)); align-items: start; gap: 20px; margin-top: 40px; }
.case-cover-link { position: relative; display: block; min-width: 0; overflow: hidden; isolation: isolate; border-radius: 20px; background: var(--case-v2-surface, var(--bg)); color: #fff; text-decoration: none; }
.case-cover-link > img { display: block; width: 100%; height: auto; }
.case-cover-placeholder { display: grid; place-items: center; aspect-ratio: 16 / 10; padding: 24px; color: var(--case-v2-fg, var(--text)); font-size: 28px; text-align: center; }
.case-cover-shade { position: absolute; inset: 0; background: rgb(6 10 18 / 64%); opacity: 0; pointer-events: none; transition: opacity 280ms ease; }
.case-cover-content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: end; align-items: start; padding: clamp(18px, 2.4vw, 32px); pointer-events: none; }
.case-cover-details { width: 100%; opacity: 0; transform: translateY(10px); transition: opacity 220ms ease, transform 320ms cubic-bezier(.2,.7,.2,1); pointer-events: none; }
.case-cover-type { display: block; width: 100%; margin: 0; padding: 0; text-align: left; text-indent: 0; color: #e0e4ed; font: 500 11px/1.4 var(--font-mono); letter-spacing: .06em; text-transform: uppercase; }
.case-cover-content h3 { margin: 10px 0 18px; color: #fff; font: 500 clamp(22px, 2.2vw, 34px)/1.12 var(--font-ui); letter-spacing: -.025em; text-wrap: balance; overflow-wrap: anywhere; }
.case-cover-action { display: inline-flex; align-items: center; align-self: flex-end; justify-content: center; gap: 10px; min-height: 48px; box-sizing: border-box; padding: 12px 20px; border: 1px solid rgb(255 255 255 / 14%); border-radius: 999px; background: #1c1d21; color: #fff; font: 600 16px/1.3 var(--font-ui); white-space: nowrap; transition: background-color 180ms ease; }
.case-cover-action > span { text-decoration: none; }
.case-cover-link:is(:hover, :focus-visible) .case-cover-action { background: #33353b; }
.case-cover-action svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.case-cover-link:is(:hover, :focus-visible) .case-cover-shade { opacity: 1; }
.case-cover-link:is(:hover, :focus-visible) .case-cover-details { opacity: 1; transform: none; }
.case-cover-link:focus-visible { outline: 3px solid var(--case-v2-focus, var(--text)); outline-offset: 5px; }
@media (hover: none), (max-width: 767px) {
  .case-cover-shade { opacity: 1; }
  .case-cover-details { opacity: 1; transform: none; }
}
@media (max-width: 900px) {
  .case-cover-grid { grid-template-columns: minmax(0, 1fr); gap: 20px; margin-top: 28px; }
  .case-cover-content h3 { font-size: clamp(22px, 4vw, 32px); }
}
@media (max-width: 420px) {
  .case-cover-content { padding: 16px; }
  .case-cover-type { font-size: 10px; }
  .case-cover-content h3 { margin-block: 6px 8px; font-size: 21px; }
  .case-cover-action { min-height: 44px; padding: 10px 16px; font-size: 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .case-cover-shade, .case-cover-details, .case-cover-action { transition: none; transform: none; }
}
</style>
