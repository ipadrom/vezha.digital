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
      :data-od-id="`case-block-${block.type}-${block.id}`"
    >
      <div class="builder-block__inner">
        <CaseFreeformBlock v-if="block.settings.layout === 'freeform' && block.type !== 'hero'" :content="block.content" :settings="block.settings" />
        <CaseEditorialAir v-else-if="block.settings.layout === 'air' && (block.type === 'challenge_solution' || block.type === 'results')" :kind="block.type" :content="block.content" :block-id="block.id" />

        <template v-else-if="block.type === 'hero'">
          <div class="builder-hero__layout">
            <div class="builder-hero__project">
              <span v-if="block.content.logo_url" class="builder-hero__mark">
                <img :src="block.content.logo_url" alt="" />
              </span>
              <span>{{ block.content.title || block.content.eyebrow }}</span>
            </div>
            <h1>{{ block.content.subtitle || block.content.title }}</h1>
            <p v-if="heroCategory(block)" class="builder-hero__category">{{ heroCategory(block) }}</p>
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
          <article class="builder-editorial" :data-variant="block.settings.layout || 'editorial'">
            <header class="builder-editorial__heading" :data-od-id="`case-heading-${block.id}`">
              <span v-if="block.content.kicker" class="builder-eyebrow">{{ block.content.kicker }}</span>
              <h2>{{ block.content.eyebrow || block.content.title }}</h2>
            </header>
            <div class="builder-editorial__copy">
              <p v-if="block.content.eyebrow && block.content.title" class="builder-editorial__lead">{{ block.content.title }}</p>
              <p v-if="block.content.body" class="builder-prose">{{ block.content.body }}</p>
              <div v-if="contentTags(block.content).length" class="builder-tags" :aria-label="locale === 'ru' ? 'Теги проекта' : 'Project tags'">
                <span v-for="tag in contentTags(block.content)" :key="tag">{{ tag }}</span>
              </div>
            </div>
          </article>
        </template>

        <template v-else-if="block.type === 'challenge_solution'">
          <article class="builder-challenge">
            <header class="builder-challenge__heading" :data-od-id="`case-heading-${block.id}`">
              <h2>{{ block.content.eyebrow }}</h2>
            </header>
            <div class="builder-challenge__copy">
              <p v-if="block.content.title" class="builder-challenge__lead">{{ block.content.title }}</p>
              <div class="builder-challenge__problem">
                <span>{{ block.content.challenge_label }}</span>
                <p>{{ block.content.challenge }}</p>
              </div>
              <dl v-if="block.content.solution || block.content.impact" class="builder-challenge__details">
                <div v-if="block.content.solution">
                  <dt>{{ block.content.solution_label }}</dt>
                  <dd>{{ block.content.solution }}</dd>
                </div>
                <div v-if="block.content.impact">
                  <dt>{{ block.content.impact_label || (locale === 'ru' ? 'Эффект' : 'Impact') }}</dt>
                  <dd>{{ block.content.impact }}</dd>
                </div>
              </dl>
            </div>
          </article>
        </template>

        <template v-else-if="block.type === 'insight'">
          <article class="builder-insight">
            <header class="builder-insight__heading">
              <span class="builder-eyebrow">{{ block.content.eyebrow }}</span>
              <h2>{{ block.content.title }}</h2>
            </header>
            <div class="builder-insight__body">
              <p class="builder-insight__statement">{{ block.content.statement }}</p>
              <dl class="builder-insight__facts">
                <div v-if="block.content.rationale" class="builder-insight__fact">
                  <dt>{{ block.content.rationale_label || (locale === 'ru' ? 'Почему' : 'Why') }}</dt>
                  <dd>{{ block.content.rationale }}</dd>
                </div>
                <div v-if="block.content.outcome" class="builder-insight__fact">
                  <dt>{{ block.content.outcome_label || (locale === 'ru' ? 'Что изменилось' : 'Outcome') }}</dt>
                  <dd>{{ block.content.outcome }}</dd>
                </div>
              </dl>
            </div>
            <figure v-if="block.content.image_url" class="builder-insight__media">
              <img :src="block.content.image_url" :alt="block.content.image_alt || ''" loading="lazy" decoding="async" />
            </figure>
          </article>
        </template>

        <template v-else-if="block.type === 'image'">
          <figure class="builder-single-image"><img v-if="block.content.image_url" :src="block.content.image_url" :alt="block.content.alt || ''" /><div v-else class="builder-placeholder">IMAGE</div><figcaption v-if="block.content.caption">{{ block.content.caption }}</figcaption></figure>
        </template>

        <template v-else-if="block.type === 'image_text'">
          <div class="builder-image-text__copy"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2><p>{{ block.content.body }}</p></div>
          <figure><img v-if="block.content.image_url" :src="block.content.image_url" :alt="block.content.alt || ''" /><div v-else class="builder-placeholder">IMAGE</div><figcaption v-if="block.content.caption">{{ block.content.caption }}</figcaption></figure>
        </template>

        <template v-else-if="block.type === 'metrics'">
          <header v-if="block.settings.show_intro !== false && (block.content.eyebrow || block.content.title || block.content.summary)" class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2><p v-if="block.content.summary">{{ block.content.summary }}</p></header>
          <div class="builder-metrics"><article v-for="(item, index) in block.content.items" :key="index" :data-demo="item.is_demo ? 'true' : undefined" :data-od-id="`case-metric-${block.id}-${index + 1}`"><b>{{ item.value }}</b><span>{{ item.label }}</span><small v-if="item.context">{{ item.context }}</small></article></div>
        </template>

        <template v-else-if="block.type === 'process'">
          <header class="builder-heading builder-process-chapter" :data-od-id="`case-heading-${block.id}`">
            <h3>{{ block.content.eyebrow }}</h3>
            <div class="builder-process-chapter__copy">
              <p v-if="block.content.title" class="builder-process-chapter__lead">{{ block.content.title }}</p>
              <p v-if="block.content.summary" class="builder-process-chapter__summary">{{ block.content.summary }}</p>
            </div>
          </header>
          <ol class="builder-process" :data-mode="processDisclosureMode(block)">
            <li v-for="(item, index) in block.content.items" :key="index" :class="{ 'is-open': isProcessOpen(block, index), 'is-active': isProcessActive(block, index) }">
              <button
                class="builder-process__trigger"
                type="button"
                :aria-expanded="isProcessOpen(block, index)"
                :aria-controls="processPanelId(block, index)"
                :data-od-id="`case-process-${block.id}-${index + 1}`"
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
                  <div class="builder-process__content" :class="{ 'builder-process__content--text-only': !processHasMedia(item) }">
                    <div class="builder-process__copy">
                      <p v-if="item.description">{{ item.description }}</p>
                    </div>
                    <div v-if="processHasMedia(item)" class="builder-process__media" :data-size="processMediaSize(item)">
                      <img v-if="item.image_url" :src="item.image_url" :alt="item.image_alt || ''" loading="lazy" decoding="async" />
                      <video v-if="item.video_url" controls playsinline preload="metadata" :poster="item.poster_url || undefined" :aria-label="item.title || undefined">
                        <source :src="item.video_url" />
                        {{ locale === 'ru' ? 'Ваш браузер не поддерживает видео.' : 'Your browser does not support video.' }}
                      </video>
                      <div v-if="!item.image_url && !item.video_url" class="builder-placeholder builder-process__placeholder">
                        <b>{{ item.media_type === 'video' ? 'VIDEO' : 'IMAGE' }}</b>
                        <span v-if="item.media_note">{{ item.media_note }}</span>
                      </div>
                    </div>
                    <div v-if="contentTags(item).length" class="builder-process__tags" :aria-label="locale === 'ru' ? 'Результаты этапа' : 'Stage deliverables'">
                      <span v-for="tag in contentTags(item)" :key="tag"><i aria-hidden="true" />{{ tag }}</span>
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
        <CaseTechnologyContours v-if="block.settings.layout === 'contours'" :content="block.content" :settings="block.settings" :locale="locale" />
        <CaseTechnologyMap v-else-if="block.settings.layout === 'map'" :content="block.content" :settings="block.settings" />
          <template v-else>
            <header class="builder-heading"><span class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2>{{ block.content.title }}</h2><p v-if="block.content.summary">{{ block.content.summary }}</p></header>
            <div class="builder-tech"><span v-for="(item, index) in block.content.items" :key="index"><small>{{ item.category }}</small>{{ item.label }}</span></div>
          </template>
        </template>

        <template v-else-if="block.type === 'video'">
          <header v-if="block.content.eyebrow || block.content.title" class="builder-heading"><span v-if="block.content.eyebrow" class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2 v-if="block.content.title">{{ block.content.title }}</h2></header>
          <figure class="builder-video" :class="{ 'builder-video--ambient': block.content.controls === false }">
            <video
              v-if="block.content.video_url"
              :autoplay="allowAutoplay && block.content.autoplay === true"
              :loop="block.content.loop === true"
              :muted="block.content.muted !== false"
              :controls="block.content.controls !== false"
              :poster="block.content.poster_url || undefined"
              :aria-label="block.content.title || block.content.caption || undefined"
              playsinline
              preload="metadata"
            >
              <source :src="block.content.video_url" />
            </video>
            <div v-else class="builder-placeholder">VIDEO</div>
            <figcaption v-if="block.content.caption">{{ block.content.caption }}</figcaption>
          </figure>
        </template>

        <template v-else-if="block.type === 'comparison'">
          <header v-if="block.content.eyebrow || block.content.title" class="builder-heading"><span v-if="block.content.eyebrow" class="builder-eyebrow">{{ block.content.eyebrow }}</span><h2 v-if="block.content.title">{{ block.content.title }}</h2></header>
          <div class="builder-comparison">
            <figure>
              <video
                v-if="block.content.before_media_type === 'video' && block.content.before_video_url"
                :autoplay="allowAutoplay && block.content.autoplay === true"
                :loop="block.content.loop === true"
                :muted="block.content.muted !== false"
                :controls="Boolean(block.content.controls) || reduceMotion"
                :poster="block.content.before_poster_url || undefined"
                :aria-label="block.content.before_alt || block.content.before_label || undefined"
                playsinline
                preload="metadata"
              >
                <source :src="block.content.before_video_url" />
              </video>
              <img v-else-if="block.content.before_media_type !== 'video' && block.content.before_url" :src="block.content.before_url" :alt="block.content.before_alt || ''" />
              <div v-else class="builder-placeholder">{{ block.content.before_media_type === 'video' ? 'VIDEO' : 'IMAGE' }}</div>
              <figcaption v-if="block.content.before_label">{{ block.content.before_label }}</figcaption>
            </figure>
            <figure>
              <video
                v-if="block.content.after_media_type === 'video' && block.content.after_video_url"
                :autoplay="allowAutoplay && block.content.autoplay === true"
                :loop="block.content.loop === true"
                :muted="block.content.muted !== false"
                :controls="Boolean(block.content.controls) || reduceMotion"
                :poster="block.content.after_poster_url || undefined"
                :aria-label="block.content.after_alt || block.content.after_label || undefined"
                playsinline
                preload="metadata"
              >
                <source :src="block.content.after_video_url" />
              </video>
              <img v-else-if="block.content.after_media_type !== 'video' && block.content.after_url" :src="block.content.after_url" :alt="block.content.after_alt || ''" />
              <div v-else class="builder-placeholder">{{ block.content.after_media_type === 'video' ? 'VIDEO' : 'IMAGE' }}</div>
              <figcaption v-if="block.content.after_label">{{ block.content.after_label }}</figcaption>
            </figure>
          </div>
        </template>

        <template v-else-if="block.type === 'results'">
          <article class="builder-results">
            <header class="builder-results__heading" :data-od-id="`case-heading-${block.id}`">
              <h2>{{ block.content.eyebrow || block.content.title }}</h2>
            </header>
            <div class="builder-results__body">
              <p v-if="block.content.eyebrow && block.content.title" class="builder-results__lead">{{ block.content.title }}</p>
              <p v-if="block.content.body" class="builder-prose">{{ block.content.body }}</p>
              <ul v-if="resultItems(block).length" class="builder-results-list">
                <li v-for="(item, index) in resultItems(block)" :key="`${item}-${index}`" :data-od-id="`case-result-${block.id}-${index + 1}`">
                  <span>{{ String(index + 1).padStart(2, '0') }}</span>
                  <p>{{ item }}</p>
                </li>
              </ul>
              <a v-if="block.content.link_url" class="builder-link" :href="block.content.link_url" target="_blank" rel="noopener">{{ block.content.link_label }} ↗</a>
            </div>
          </article>
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
import CaseTechnologyContours from '~/components/case-builder/CaseTechnologyContours.vue'
import CaseEditorialAir from '~/components/case-builder/CaseEditorialAir.vue'
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
  ['landscape', 'square', 'portrait'].includes(String(block.settings.media_aspect || ''))
    ? `builder-block--media-${block.settings.media_aspect}`
    : '',
  block.settings.caption_position === 'below' ? 'builder-block--caption-below' : '',
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
const processOpen = reactive<Record<string, number[]>>({})
const processActive = reactive<Record<string, number | null>>({})
const processDisclosureMode = (block: PublicBuilderBlock): 'single' | 'multiple' => block.settings.disclosure_mode === 'single' ? 'single' : 'multiple'
const processOpenIndexes = (block: PublicBuilderBlock): number[] => processOpen[block.id] ?? (block.settings.open_first === false ? [] : [0])
const processActiveIndex = (block: PublicBuilderBlock): number | null => processActive[block.id] === undefined
  ? (block.settings.open_first === false ? null : 0)
  : processActive[block.id]
const isProcessOpen = (block: PublicBuilderBlock, index: number) => processOpenIndexes(block).includes(index)
const isProcessActive = (block: PublicBuilderBlock, index: number) => processActiveIndex(block) === index
const toggleProcess = (block: PublicBuilderBlock, index: number) => {
  const current = processOpenIndexes(block)
  if (current.includes(index)) {
    const next = current.filter(openIndex => openIndex !== index)
    processOpen[block.id] = next
    if (processActiveIndex(block) === index) processActive[block.id] = next.length ? next[next.length - 1] : null
    return
  }
  processOpen[block.id] = processDisclosureMode(block) === 'single'
    ? [index]
    : [...current, index].sort((a, b) => a - b)
  processActive[block.id] = index
}
const processPanelId = (block: PublicBuilderBlock, index: number) => `process-${block.id}-${index}`
const contentTags = (item: Record<string, any>): string[] => Array.isArray(item.tags)
  ? item.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)
  : String(item.tags || '').split(',').map(tag => tag.trim()).filter(Boolean)
const resultItems = (block: PublicBuilderBlock): string[] => Array.isArray(block.content.items)
  ? block.content.items
      .map((item: unknown) => typeof item === 'string' ? item : String((item as Record<string, unknown>)?.text || ''))
      .map((item: string) => item.trim())
      .filter(Boolean)
  : []
const processMediaSize = (item: Record<string, any>): 'compact' | 'medium' | 'full' => {
  const size = String(item.media_size || '')
  return size === 'compact' || size === 'full' ? size : 'medium'
}
const processHasMedia = (item: Record<string, any>): boolean => Boolean(
  item.image_url || item.video_url || item.media_type === 'image' || item.media_type === 'video',
)
const syncMediaMotion = async () => {
  const shouldReduce = Boolean(motionQuery?.matches)
  reduceMotion.value = shouldReduce
  allowAutoplay.value = !shouldReduce
  await nextTick()
  builderRoot.value?.querySelectorAll<HTMLVideoElement>('.builder-media-hero video, .builder-video video, .builder-comparison video').forEach((video) => {
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
<style src="~/assets/css/case-builder-v2.css"></style>
