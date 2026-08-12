<template>
  <div ref="builderRoot" class="builder-case" :data-locale="locale">
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
        <CaseFreeformBlock v-if="block.settings.layout === 'freeform' && block.type !== 'hero'" :content="block.content" :settings="block.settings" />

        <template v-else-if="block.type === 'hero'">
          <div class="builder-hero__layout">
            <div class="builder-hero__copy">
              <span class="builder-eyebrow">{{ block.content.eyebrow }}</span>
              <div>
                <h1>{{ block.content.title }}</h1>
                <p v-if="block.content.subtitle">{{ block.content.subtitle }}</p>
              </div>
            </div>
            <aside class="builder-hero__identity">
              <div class="builder-hero__logo-stage">
                <img v-if="block.content.logo_url" class="builder-hero__logo" :src="block.content.logo_url" :alt="`${block.content.title || ''} logo`" />
              </div>
              <div v-if="heroCategory(block) || block.content.year" class="builder-hero__meta" :aria-label="locale === 'ru' ? 'Категория и дата кейса' : 'Case category and date'">
                <span v-if="heroCategory(block)">{{ heroCategory(block) }}</span>
                <i v-if="heroCategory(block) && block.content.year" aria-hidden="true" />
                <time v-if="block.content.year">{{ block.content.year }}</time>
              </div>
            </aside>
          </div>
        </template>

        <template v-else-if="block.type === 'media_hero'">
          <figure class="builder-media-hero">
            <video
              v-if="block.content.video_url"
              :autoplay="allowAutoplay && block.content.autoplay !== false"
              :loop="block.content.loop !== false"
              :muted="block.content.muted !== false"
              :controls="Boolean(block.content.controls) || reduceMotion"
              :poster="block.content.poster_url || undefined"
              :aria-label="block.content.alt || block.content.caption || undefined"
              playsinline
              preload="metadata"
            >
              <source :src="block.content.video_url" />
            </video>
            <img v-else-if="block.content.image_url" :src="block.content.image_url" :alt="block.content.alt || ''" decoding="async" />
            <div v-else class="builder-placeholder">MEDIA HERO</div>
            <figcaption v-if="block.content.caption">{{ block.content.caption }}</figcaption>
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
          <div class="builder-gallery" :class="`builder-gallery--${block.settings.layout}`"><figure v-for="(item, index) in block.content.items" :key="`${item.image_url}-${index}`"><img :src="item.image_url" :alt="item.alt || ''" loading="lazy" decoding="async" /><figcaption v-if="item.caption"><span>{{ String(index + 1).padStart(2, '0') }}</span>{{ item.caption }}</figcaption></figure></div>
        </template>

        <template v-else-if="block.type === 'metrics'">
          <header class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2><p v-if="block.content.summary">{{ block.content.summary }}</p></header>
          <div class="builder-metrics"><article v-for="(item, index) in block.content.items" :key="index" :data-demo="item.is_demo ? 'true' : undefined"><b>{{ item.value }}</b><span>{{ item.label }}</span><small v-if="item.context">{{ item.context }}</small></article></div>
        </template>

        <template v-else-if="block.type === 'process'">
          <header class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2></header>
          <ol class="builder-process">
            <li v-for="(item, index) in block.content.items" :key="index" :class="{ 'is-open': isProcessOpen(block, index) }">
              <button
                class="builder-process__trigger"
                type="button"
                :aria-expanded="isProcessOpen(block, index)"
                :aria-controls="processPanelId(block, index)"
                @click="toggleProcess(block, index)"
              >
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                <b>{{ item.title }}</b>
                <i aria-hidden="true"><span /><span /></i>
              </button>
              <div
                :id="processPanelId(block, index)"
                class="builder-process__panel"
                :data-open="isProcessOpen(block, index) ? 'true' : 'false'"
                :aria-hidden="!isProcessOpen(block, index)"
              >
                <div>
                  <div class="builder-process__content" :class="{ 'builder-process__content--text-only': !item.image_url && !item.video_url }">
                    <div class="builder-process__copy">
                      <p v-if="item.description">{{ item.description }}</p>
                    </div>
                    <div v-if="item.image_url || item.video_url" class="builder-process__media" :data-size="processMediaSize(item)">
                      <img v-if="item.image_url" :src="item.image_url" :alt="item.image_alt || ''" loading="lazy" decoding="async" />
                      <video v-if="item.video_url" controls playsinline preload="metadata" :poster="item.poster_url || undefined" :aria-label="item.title || undefined">
                        <source :src="item.video_url" />
                        {{ locale === 'ru' ? 'Ваш браузер не поддерживает видео.' : 'Your browser does not support video.' }}
                      </video>
                    </div>
                    <div v-if="processTags(item).length" class="builder-process__tags" :aria-label="locale === 'ru' ? 'Результаты этапа' : 'Stage deliverables'">
                      <span v-for="tag in processTags(item)" :key="tag"><i aria-hidden="true" />{{ tag }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ol>
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
          <figure class="builder-video"><video v-if="block.content.video_url" controls playsinline preload="metadata" :poster="block.content.poster_url || undefined"><source :src="block.content.video_url" /></video><div v-else class="builder-placeholder">VIDEO</div><figcaption v-if="block.content.caption">{{ block.content.caption }}</figcaption></figure>
        </template>

        <template v-else-if="block.type === 'comparison'">
          <header class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2></header>
          <div class="builder-comparison"><figure><img v-if="block.content.before_url" :src="block.content.before_url" :alt="block.content.before_alt || ''" /><div v-else class="builder-placeholder">BEFORE</div><figcaption>{{ block.content.before_label }}</figcaption></figure><figure><img v-if="block.content.after_url" :src="block.content.after_url" :alt="block.content.after_alt || ''" /><div v-else class="builder-placeholder">AFTER</div><figcaption>{{ block.content.after_label }}</figcaption></figure></div>
        </template>

        <template v-else-if="block.type === 'results'">
          <header class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2></header><p class="builder-prose">{{ block.content.body }}</p><a v-if="block.content.link_url" class="builder-link" :href="block.content.link_url" target="_blank" rel="noopener">{{ block.content.link_label }} ↗</a>
        </template>

        <template v-else-if="block.type === 'next_case'">
          <div class="builder-next-shell">
            <header class="builder-next-header">
              <div>
                <span class="builder-eyebrow">{{ block.content.eyebrow }}</span>
                <h2>{{ block.content.title }}</h2>
              </div>
              <NuxtLink class="builder-next-link" :to="block.content.case_slug ? `/cases/${block.content.case_slug}` : '/#cases'">
                {{ block.content.cta_label || (locale === 'ru' ? 'Открыть' : 'Open') }} <b>↗</b>
              </NuxtLink>
            </header>

            <div v-if="relatedCases.length" class="builder-related-cases">
              <NuxtLink
                v-for="(project, index) in relatedCases"
                :key="project.slug || project.id"
                class="builder-related-card"
                :to="`/cases/${project.slug}`"
              >
                <div class="builder-related-card__visual" :data-project="project.slug">
                  <img
                    v-if="project.cover_image_url || project.image_url"
                    :src="project.cover_image_url || project.image_url || ''"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <div v-else class="builder-related-card__mock" aria-hidden="true">
                    <span>VEZHA / CASE {{ two(index + 1) }}</span>
                    <div><i /><i /><i /><i /></div>
                    <strong>{{ project.hero_metric_value || two(index + 1) }}</strong>
                    <small>{{ project.hero_metric_label || project.industry }}</small>
                  </div>
                </div>
                <div class="builder-related-card__copy">
                  <div><span>{{ two(index + 1) }}</span><small>{{ project.type }}</small></div>
                  <h3>{{ project.name }}</h3>
                  <p>{{ project.description || project.subtitle }}</p>
                  <b aria-hidden="true">↗</b>
                </div>
              </NuxtLink>
            </div>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import CaseTechnologyMap from '~/components/case-builder/CaseTechnologyMap.vue'
import CaseFreeformBlock from '~/components/case-builder/CaseFreeformBlock.vue'
import { caseHeroColorDefaults, normalizeHexColor, type CaseLocale, type PublicBuilderBlock } from '~/utils/caseBuilder'
import type { IProjects } from '~/utils/interfaces/IProjects'
const props = defineProps<{ blocks: PublicBuilderBlock[]; locale: CaseLocale; relatedProjects?: IProjects[] }>()
const builderRoot = ref<HTMLElement | null>(null)
const reduceMotion = ref(true)
const allowAutoplay = ref(false)
let motionQuery: MediaQueryList | null = null
const orderedBlocks = computed(() => [...props.blocks].sort((a, b) => {
  if (a.type === 'hero' && b.type !== 'hero') return -1
  if (a.type !== 'hero' && b.type === 'hero') return 1
  return a.sort_order - b.sort_order
}))
const relatedCases = computed(() => (props.relatedProjects || []).filter((project) => project.slug).slice(0, 3))
const two = (value: number) => String(value).padStart(2, '0')
const heroCategory = (block: PublicBuilderBlock) => String(block.content.industry || block.content.type_label || '').trim()
const blockClasses = (block: PublicBuilderBlock) => [
  `builder-block--${block.type}`,
  `builder-block--${block.settings.theme || 'paper'}`,
  `builder-block--${block.type === 'hero' ? 'full' : block.settings.width || 'standard'}`,
  `builder-block--space-${block.settings.spacing || 'normal'}`,
  `builder-block--align-${block.settings.alignment || 'left'}`,
  `builder-block--layout-${block.settings.layout || 'default'}`,
  block.settings.surface === 'plain' ? 'builder-block--plain' : 'builder-block--card',
  block.type === 'image' && block.settings.image_bleed ? 'builder-block--image-bleed' : '',
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
  if (block.type === 'hero') {
    style['--case-hero-background'] = normalizeHexColor(block.settings.hero_background, caseHeroColorDefaults.background)
    style['--case-hero-text'] = normalizeHexColor(block.settings.hero_text, caseHeroColorDefaults.text)
  }
  return style
}
const processOpen = reactive<Record<string, number | null>>({})
const isProcessOpen = (block: PublicBuilderBlock, index: number) => (processOpen[block.id] === undefined ? 0 : processOpen[block.id]) === index
const toggleProcess = (block: PublicBuilderBlock, index: number) => {
  processOpen[block.id] = isProcessOpen(block, index) ? null : index
}
const processPanelId = (block: PublicBuilderBlock, index: number) => `process-${block.id}-${index}`
const processTags = (item: Record<string, any>): string[] => Array.isArray(item.tags)
  ? item.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)
  : String(item.tags || '').split(',').map(tag => tag.trim()).filter(Boolean)
const processMediaSize = (item: Record<string, any>): 'compact' | 'medium' | 'full' => {
  const size = String(item.media_size || '')
  return size === 'compact' || size === 'full' ? size : 'medium'
}
const syncMediaMotion = async () => {
  const shouldReduce = Boolean(motionQuery?.matches)
  reduceMotion.value = shouldReduce
  allowAutoplay.value = !shouldReduce
  await nextTick()
  builderRoot.value?.querySelectorAll<HTMLVideoElement>('.builder-media-hero video').forEach((video) => {
    if (shouldReduce) video.pause()
    else if (video.autoplay) void video.play().catch(() => undefined)
  })
}
onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', syncMediaMotion)
  void syncMediaMotion()
})
onBeforeUnmount(() => motionQuery?.removeEventListener('change', syncMediaMotion))
</script>

<style src="~/assets/css/case-builder-public.css"></style>
