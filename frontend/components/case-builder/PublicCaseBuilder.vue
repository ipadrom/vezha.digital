<template>
  <div class="builder-case" :data-locale="locale">
    <section
      v-for="block in orderedBlocks"
      :key="block.id"
      :id="String(block.settings.anchor || '') || undefined"
      class="builder-block"
      :class="blockClasses(block)"
      :style="blockGridStyle(block)"
      :data-block="block.type"
    >
      <div class="builder-block__inner">
        <CaseFreeformBlock v-if="block.settings.layout === 'freeform'" :content="block.content" :settings="block.settings" />

        <template v-else-if="block.type === 'hero'">
          <div class="builder-hero__copy">
            <span class="builder-eyebrow">{{ block.content.eyebrow }}</span>
            <h1>{{ block.content.title }}</h1>
            <p>{{ block.content.subtitle }}</p>
            <dl>
              <div v-if="block.content.type_label"><dt>{{ locale === 'ru' ? 'Формат' : 'Format' }}</dt><dd>{{ block.content.type_label }}</dd></div>
              <div v-if="block.content.industry"><dt>{{ locale === 'ru' ? 'Сфера' : 'Industry' }}</dt><dd>{{ block.content.industry }}</dd></div>
              <div v-if="block.content.timeline"><dt>{{ locale === 'ru' ? 'Срок' : 'Timeline' }}</dt><dd>{{ block.content.timeline }}</dd></div>
              <div v-if="block.content.year"><dt>{{ locale === 'ru' ? 'Год' : 'Year' }}</dt><dd>{{ block.content.year }}</dd></div>
            </dl>
          </div>
          <figure v-if="heroHasMedia(block)" class="builder-hero__media">
            <img v-if="block.content.image_url" :src="block.content.image_url" :alt="block.content.image_alt || ''" />
            <div v-else class="builder-placeholder"><span>VEZHA / CASE</span><i /><i /><i /></div>
            <span v-if="block.content.device_screen_url" class="builder-hero__device-screen" aria-hidden="true"><img :src="block.content.device_screen_url" alt="" /></span>
            <figcaption v-if="block.content.metric_value"><b>{{ block.content.metric_value }}</b><span>{{ block.content.metric_label }}</span></figcaption>
          </figure>
        </template>

        <template v-else-if="block.type === 'text'">
          <header class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2></header>
          <p class="builder-prose">{{ block.content.body }}</p>
        </template>

        <template v-else-if="block.type === 'challenge_solution'">
          <header class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2></header>
          <div class="builder-duo">
            <article><span>{{ block.content.challenge_label }}</span><p>{{ block.content.challenge }}</p></article>
            <article><span>{{ block.content.solution_label }}</span><p>{{ block.content.solution }}</p></article>
          </div>
        </template>

        <template v-else-if="block.type === 'image'">
          <figure class="builder-single-image"><img v-if="block.content.image_url" :src="block.content.image_url" :alt="block.content.alt || ''" /><div v-else class="builder-placeholder">IMAGE</div><figcaption v-if="block.content.caption">{{ block.content.caption }}</figcaption></figure>
        </template>

        <template v-else-if="block.type === 'image_text'">
          <div class="builder-image-text__copy"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2><p>{{ block.content.body }}</p></div>
          <figure><img v-if="block.content.image_url" :src="block.content.image_url" :alt="block.content.alt || ''" /><div v-else class="builder-placeholder">IMAGE</div><figcaption v-if="block.content.caption">{{ block.content.caption }}</figcaption></figure>
        </template>

        <template v-else-if="block.type === 'gallery'">
          <header class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2></header>
          <div class="builder-gallery" :class="`builder-gallery--${block.settings.layout}`"><figure v-for="(item, index) in block.content.items" :key="`${item.image_url}-${index}`"><img :src="item.image_url" :alt="item.alt || ''" /><figcaption v-if="item.caption">{{ item.caption }}</figcaption></figure></div>
        </template>

        <template v-else-if="block.type === 'metrics'">
          <header class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2><p v-if="block.content.summary">{{ block.content.summary }}</p></header>
          <div class="builder-metrics"><article v-for="(item, index) in block.content.items" :key="index"><b>{{ item.value }}</b><span>{{ item.label }}</span><small v-if="item.context">{{ item.context }}</small></article></div>
        </template>

        <template v-else-if="block.type === 'process'">
          <header class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2></header>
          <ol class="builder-process"><li v-for="(item, index) in block.content.items" :key="index"><span>{{ String(index + 1).padStart(2, '0') }}</span><div><h3>{{ item.title }}</h3><p>{{ item.description }}</p></div></li></ol>
        </template>

        <template v-else-if="block.type === 'quote'">
          <blockquote class="builder-quote"><img v-if="block.content.logo_url" :src="block.content.logo_url" alt="" /><p>“{{ block.content.quote }}”</p><footer><b>{{ block.content.author }}</b><span v-if="block.content.role">{{ block.content.role }}</span></footer></blockquote>
        </template>

        <template v-else-if="block.type === 'technologies'">
          <CaseTechnologyMap v-if="block.settings.layout === 'map'" :content="block.content" :settings="block.settings" />
          <template v-else>
            <header class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2><p v-if="block.content.summary">{{ block.content.summary }}</p></header>
            <div class="builder-tech"><span v-for="(item, index) in block.content.items" :key="index"><small>{{ item.category }}</small>{{ item.label }}</span></div>
          </template>
        </template>

        <template v-else-if="block.type === 'video'">
          <header class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2></header>
          <figure class="builder-video"><video v-if="block.content.video_url" controls playsinline :poster="block.content.poster_url || undefined"><source :src="block.content.video_url" /></video><div v-else class="builder-placeholder">VIDEO</div><figcaption v-if="block.content.caption">{{ block.content.caption }}</figcaption></figure>
        </template>

        <template v-else-if="block.type === 'comparison'">
          <header class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2></header>
          <div class="builder-comparison"><figure><img v-if="block.content.before_url" :src="block.content.before_url" :alt="block.content.before_alt || ''" /><div v-else class="builder-placeholder">BEFORE</div><figcaption>{{ block.content.before_label }}</figcaption></figure><figure><img v-if="block.content.after_url" :src="block.content.after_url" :alt="block.content.after_alt || ''" /><div v-else class="builder-placeholder">AFTER</div><figcaption>{{ block.content.after_label }}</figcaption></figure></div>
        </template>

        <template v-else-if="block.type === 'results'">
          <header class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2></header><p class="builder-prose">{{ block.content.body }}</p><a v-if="block.content.link_url" class="builder-link" :href="block.content.link_url" target="_blank" rel="noopener">{{ block.content.link_label }} ↗</a>
        </template>

        <template v-else-if="block.type === 'next_case'">
          <span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2><NuxtLink class="builder-next-link" :to="block.content.case_slug ? `/cases/${block.content.case_slug}` : '/#cases'">{{ block.content.cta_label || (locale === 'ru' ? 'Открыть' : 'Open') }} <b>↗</b></NuxtLink>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import CaseTechnologyMap from '~/components/case-builder/CaseTechnologyMap.vue'
import CaseFreeformBlock from '~/components/case-builder/CaseFreeformBlock.vue'
import type { CaseLocale, PublicBuilderBlock } from '~/utils/caseBuilder'
const props = defineProps<{ blocks: PublicBuilderBlock[]; locale: CaseLocale }>()
const orderedBlocks = computed(() => [...props.blocks].sort((a, b) => a.sort_order - b.sort_order))
const heroHasMedia = (block: PublicBuilderBlock) => Boolean(block.content.image_url || block.content.device_screen_url || block.content.metric_value)
const blockClasses = (block: PublicBuilderBlock) => [
  `builder-block--${block.type}`,
  `builder-block--${block.settings.theme || 'paper'}`,
  `builder-block--${block.settings.width || 'standard'}`,
  `builder-block--space-${block.settings.spacing || 'normal'}`,
  `builder-block--align-${block.settings.alignment || 'left'}`,
  `builder-block--layout-${block.settings.layout || 'default'}`,
  block.type === 'hero' && block.settings.layout !== 'freeform' && !heroHasMedia(block) ? 'builder-block--hero-text-only' : '',
]
const blockGridStyle = (block: PublicBuilderBlock): Record<string, string> => {
  const style: Record<string, string> = {}
  for (const viewport of ['desktop', 'tablet', 'mobile'] as const) {
    const span = Math.max(1, Math.min(12, Number(block.settings[`${viewport}_span`]) || 12))
    const rawStart = Math.max(0, Number(block.settings[`${viewport}_start`]) || 0)
    const start = rawStart && rawStart + span <= 13 ? String(rawStart) : 'auto'
    style[`--case-${viewport}-span`] = String(span)
    style[`--case-${viewport}-start`] = start
  }
  return style
}
</script>

<style src="~/assets/css/case-builder-public.css"></style>
