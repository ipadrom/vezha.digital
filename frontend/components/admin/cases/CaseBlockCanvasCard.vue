<template>
  <article ref="cardElement" class="canvas-block" :class="[{ selected, hidden: !block.is_visible, resizing: liveSpan !== null }, `theme-${block.settings.theme}`]" :style="gridStyle" tabindex="0" @click="$emit('select')" @keydown.enter.self="$emit('select')">
    <div class="canvas-block__rail"><span>{{ String(index + 1).padStart(2, '0') }}</span><i /></div>
    <header class="canvas-block__header">
      <div><small>{{ blockLabel(block.type) }}</small><b>{{ blockTitle(block, locale) }}</b></div>
      <div class="canvas-block__tools">
        <button v-if="block.settings.layout !== 'freeform'" type="button" title="Разобрать в свободную композицию" @click.stop="$emit('convert')">✦</button>
        <button type="button" :title="block.is_visible ? 'Скрыть' : 'Показать'" @click.stop="$emit('toggle')">{{ block.is_visible ? '◉' : '○' }}</button>
        <button type="button" title="Дублировать" @click.stop="$emit('duplicate')">⧉</button>
        <button type="button" title="Удалить" @click.stop="$emit('remove')">×</button>
        <span title="Перетащить">⠿</span>
      </div>
    </header>

    <div class="canvas-block__preview" :class="{ 'canvas-block__preview--hero': block.type === 'hero', 'canvas-block__preview--hero-text-only': block.type === 'hero' && block.settings.layout !== 'freeform' && !heroHasMedia, 'canvas-block__preview--freeform': block.settings.layout === 'freeform' }">
      <CaseFreeformCanvas
        v-if="block.settings.layout === 'freeform'"
        :elements="content.elements || []"
        :viewport="viewport"
        :height="Number(block.settings[`freeform_height_${viewport}`]) || 620"
        @add="$emit('element-add', $event)"
        @remove="$emit('element-remove', $event)"
        @change="$emit('element-change', $event)"
        @geometry="$emit('element-geometry', $event)"
      />
      <template v-else-if="block.type === 'hero'">
        <div class="preview-hero-copy">
          <div class="preview-hero-brand">
            <img v-if="content.logo_url" :src="content.logo_url" alt="" />
            <CaseInlineEdit class="inline-eyebrow" :model-value="content.eyebrow" placeholder="Метка" label="Метка блока" @focus="$emit('select')" @update:model-value="edit(['eyebrow'], $event)" />
          </div>
          <h3><CaseInlineEdit :model-value="content.title" placeholder="Название проекта" label="Заголовок" multiline @focus="$emit('select')" @update:model-value="edit(['title'], $event)" /></h3>
          <p><CaseInlineEdit :model-value="content.subtitle" placeholder="Добавьте подзаголовок кейса" label="Подзаголовок" multiline @focus="$emit('select')" @update:model-value="edit(['subtitle'], $event)" /></p>
          <dl class="preview-hero-facts">
            <div v-if="content.type_label"><dt>{{ locale === 'ru' ? 'Формат' : 'Format' }}</dt><dd><CaseInlineEdit :model-value="content.type_label" placeholder="Формат" label="Формат" @focus="$emit('select')" @update:model-value="edit(['type_label'], $event)" /></dd></div>
            <div v-if="content.industry"><dt>{{ locale === 'ru' ? 'Сфера' : 'Industry' }}</dt><dd><CaseInlineEdit :model-value="content.industry" placeholder="Сфера" label="Сфера" @focus="$emit('select')" @update:model-value="edit(['industry'], $event)" /></dd></div>
            <div v-if="content.timeline"><dt>{{ locale === 'ru' ? 'Срок' : 'Timeline' }}</dt><dd><CaseInlineEdit :model-value="content.timeline" placeholder="Срок" label="Срок" @focus="$emit('select')" @update:model-value="edit(['timeline'], $event)" /></dd></div>
            <div v-if="content.year"><dt>{{ locale === 'ru' ? 'Год' : 'Year' }}</dt><dd><CaseInlineEdit :model-value="content.year" placeholder="Год" label="Год" @focus="$emit('select')" @update:model-value="edit(['year'], $event)" /></dd></div>
          </dl>
        </div>
        <figure v-if="heroHasMedia" class="preview-media preview-hero-media">
          <img v-if="content.image_url" :src="content.image_url" alt="" />
          <span v-else>HERO VISUAL</span>
          <i v-if="content.device_screen_url" class="preview-device-screen"><img :src="content.device_screen_url" alt="" /></i>
          <figcaption v-if="content.metric_value"><b><CaseInlineEdit :model-value="content.metric_value" placeholder="0" label="Значение метрики" @focus="$emit('select')" @update:model-value="edit(['metric_value'], $event)" /></b><CaseInlineEdit :model-value="content.metric_label" placeholder="Метрика" label="Подпись метрики" @focus="$emit('select')" @update:model-value="edit(['metric_label'], $event)" /></figcaption>
        </figure>
      </template>
      <template v-else-if="block.type === 'image'">
        <div class="preview-media preview-media--wide"><img v-if="content.image_url" :src="content.image_url" alt="" /><span v-else>IMAGE</span></div><CaseInlineEdit class="preview-caption" :model-value="content.caption" placeholder="Добавить подпись" label="Подпись изображения" @focus="$emit('select')" @update:model-value="edit(['caption'], $event)" />
      </template>
      <template v-else-if="block.type === 'image_text'">
        <div class="preview-copy"><CaseInlineEdit class="inline-eyebrow" :model-value="content.eyebrow" placeholder="Метка" label="Метка блока" @focus="$emit('select')" @update:model-value="edit(['eyebrow'], $event)" /><h3><CaseInlineEdit :model-value="content.title" placeholder="Заголовок раздела" label="Заголовок" multiline @focus="$emit('select')" @update:model-value="edit(['title'], $event)" /></h3><p><CaseInlineEdit :model-value="content.body" placeholder="Текст раздела появится здесь" label="Текст" multiline @focus="$emit('select')" @update:model-value="edit(['body'], $event)" /></p></div><div class="preview-media"><img v-if="content.image_url" :src="content.image_url" alt="" /><span v-else>IMAGE</span></div>
      </template>
      <template v-else-if="block.type === 'challenge_solution'">
        <div class="preview-section-copy"><CaseInlineEdit class="inline-eyebrow" :model-value="content.eyebrow" placeholder="Метка" label="Метка блока" @focus="$emit('select')" @update:model-value="edit(['eyebrow'], $event)" /><CaseInlineEdit class="inline-section-title" :model-value="content.title" placeholder="Заголовок раздела" label="Заголовок" multiline @focus="$emit('select')" @update:model-value="edit(['title'], $event)" /></div>
        <div class="preview-copy"><CaseInlineEdit class="inline-eyebrow" :model-value="content.challenge_label" placeholder="Задача" label="Подпись задачи" @focus="$emit('select')" @update:model-value="edit(['challenge_label'], $event)" /><p><CaseInlineEdit :model-value="content.challenge" placeholder="Опишите исходную задачу" label="Задача" multiline @focus="$emit('select')" @update:model-value="edit(['challenge'], $event)" /></p></div><div class="preview-copy"><CaseInlineEdit class="inline-eyebrow" :model-value="content.solution_label" placeholder="Решение" label="Подпись решения" @focus="$emit('select')" @update:model-value="edit(['solution_label'], $event)" /><p><CaseInlineEdit :model-value="content.solution" placeholder="Опишите принятое решение" label="Решение" multiline @focus="$emit('select')" @update:model-value="edit(['solution'], $event)" /></p></div>
      </template>
      <template v-else-if="block.type === 'gallery'">
        <div class="preview-section-copy"><CaseInlineEdit class="inline-eyebrow" :model-value="content.eyebrow" placeholder="Метка" label="Метка блока" @focus="$emit('select')" @update:model-value="edit(['eyebrow'], $event)" /><CaseInlineEdit class="inline-section-title" :model-value="content.title" placeholder="Заголовок галереи" label="Заголовок" multiline @focus="$emit('select')" @update:model-value="edit(['title'], $event)" /></div>
        <div class="preview-grid">
          <figure v-for="(item, galleryIndex) in content.items?.slice(0, 5)" :key="galleryIndex"><img v-if="item.image_url" :src="item.image_url" :alt="item.alt || ''" /><span v-else>{{ String(galleryIndex + 1).padStart(2, '0') }}</span></figure>
          <figure v-if="!content.items?.length"><span>ADD IMAGE</span></figure>
        </div>
      </template>
      <template v-else-if="block.type === 'metrics'">
        <div class="preview-section-copy"><CaseInlineEdit class="inline-eyebrow" :model-value="content.eyebrow" placeholder="Метка" label="Метка блока" @focus="$emit('select')" @update:model-value="edit(['eyebrow'], $event)" /><CaseInlineEdit class="inline-section-title" :model-value="content.title" placeholder="Заголовок метрик" label="Заголовок" multiline @focus="$emit('select')" @update:model-value="edit(['title'], $event)" /></div>
        <div class="preview-metrics"><div v-for="(item, metricIndex) in content.items?.slice(0, 4)" :key="metricIndex"><b><CaseInlineEdit :model-value="item.value" placeholder="—" label="Значение метрики" @focus="$emit('select')" @update:model-value="edit(['items', metricIndex, 'value'], $event)" /></b><CaseInlineEdit :model-value="item.label" placeholder="Метрика" label="Подпись метрики" @focus="$emit('select')" @update:model-value="edit(['items', metricIndex, 'label'], $event)" /></div><div v-if="!content.items?.length"><b>+0%</b><span>Добавьте метрики справа</span></div></div>
      </template>
      <template v-else-if="block.type === 'process'">
        <div class="preview-section-copy"><CaseInlineEdit class="inline-eyebrow" :model-value="content.eyebrow" placeholder="Метка" label="Метка блока" @focus="$emit('select')" @update:model-value="edit(['eyebrow'], $event)" /><CaseInlineEdit class="inline-section-title" :model-value="content.title" placeholder="Заголовок этапов" label="Заголовок" multiline @focus="$emit('select')" @update:model-value="edit(['title'], $event)" /></div>
        <ol class="preview-process"><li v-for="(item, stepIndex) in content.items?.slice(0, 4)" :key="stepIndex"><span class="process-index">{{ String(stepIndex + 1).padStart(2, '0') }}</span><CaseInlineEdit :model-value="item.title" placeholder="Этап" label="Название этапа" @focus="$emit('select')" @update:model-value="edit(['items', stepIndex, 'title'], $event)" /></li><li v-if="!content.items?.length"><span class="process-index">01</span>Добавьте этапы справа</li></ol>
      </template>
      <template v-else-if="block.type === 'quote'">
        <blockquote><CaseInlineEdit :model-value="content.quote" placeholder="Цитата клиента появится здесь" label="Цитата" multiline @focus="$emit('select')" @update:model-value="edit(['quote'], $event)" /><small><CaseInlineEdit :model-value="content.author" placeholder="Имя автора" label="Автор цитаты" @focus="$emit('select')" @update:model-value="edit(['author'], $event)" /></small></blockquote>
      </template>
      <template v-else-if="block.type === 'technologies'">
        <CaseTechnologyMapEditor
          v-if="block.settings.layout === 'map'"
          :content="content"
          :settings="block.settings"
          @focus="$emit('select')"
          @edit="$emit('content-change', $event)"
          @move="$emit('node-move', $event)"
        />
        <template v-else>
          <div class="preview-section-copy"><CaseInlineEdit class="inline-eyebrow" :model-value="content.eyebrow" placeholder="Метка" label="Метка блока" @focus="$emit('select')" @update:model-value="edit(['eyebrow'], $event)" /><CaseInlineEdit class="inline-section-title" :model-value="content.title" placeholder="Заголовок технологий" label="Заголовок" multiline @focus="$emit('select')" @update:model-value="edit(['title'], $event)" /></div>
          <div class="preview-tags"><CaseInlineEdit v-for="(item, techIndex) in content.items?.slice(0, 8)" :key="techIndex" :model-value="item.label" placeholder="Technology" label="Название технологии" @focus="$emit('select')" @update:model-value="edit(['items', techIndex, 'label'], $event)" /><span v-if="!content.items?.length">+ Добавьте стек справа</span></div>
        </template>
      </template>
      <template v-else-if="block.type === 'comparison'">
        <div class="preview-section-copy"><CaseInlineEdit class="inline-eyebrow" :model-value="content.eyebrow" placeholder="Метка" label="Метка блока" @focus="$emit('select')" @update:model-value="edit(['eyebrow'], $event)" /><CaseInlineEdit class="inline-section-title" :model-value="content.title" placeholder="Заголовок сравнения" label="Заголовок" multiline @focus="$emit('select')" @update:model-value="edit(['title'], $event)" /></div>
        <div class="preview-media"><img v-if="content.before_url" :src="content.before_url" alt="" /><CaseInlineEdit v-else :model-value="content.before_label" placeholder="До" label="Подпись до" @focus="$emit('select')" @update:model-value="edit(['before_label'], $event)" /></div><div class="preview-media"><img v-if="content.after_url" :src="content.after_url" alt="" /><CaseInlineEdit v-else :model-value="content.after_label" placeholder="После" label="Подпись после" @focus="$emit('select')" @update:model-value="edit(['after_label'], $event)" /></div>
      </template>
      <template v-else-if="block.type === 'video'">
        <div class="preview-section-copy"><CaseInlineEdit class="inline-eyebrow" :model-value="content.eyebrow" placeholder="Метка" label="Метка блока" @focus="$emit('select')" @update:model-value="edit(['eyebrow'], $event)" /><CaseInlineEdit class="inline-section-title" :model-value="content.title" placeholder="Заголовок видео" label="Заголовок" multiline @focus="$emit('select')" @update:model-value="edit(['title'], $event)" /></div>
        <div class="preview-media preview-media--wide"><img v-if="content.poster_url" :src="content.poster_url" alt="" /><b>▶</b><span>{{ content.video_url ? 'VIDEO READY' : 'ADD VIDEO' }}</span></div>
      </template>
      <template v-else>
        <div class="preview-copy preview-copy--wide"><CaseInlineEdit class="inline-eyebrow" :model-value="content.eyebrow" placeholder="Метка" label="Метка блока" @focus="$emit('select')" @update:model-value="edit(['eyebrow'], $event)" /><h3><CaseInlineEdit :model-value="content.title" :placeholder="blockLabel(block.type)" label="Заголовок" multiline @focus="$emit('select')" @update:model-value="edit(['title'], $event)" /></h3><p><CaseInlineEdit :model-value="content.body || content.summary" placeholder="Введите текст блока" label="Текст" multiline @focus="$emit('select')" @update:model-value="edit([content.body !== undefined ? 'body' : 'summary'], $event)" /></p></div>
      </template>
    </div>

    <button class="canvas-block__resize" type="button" :aria-label="resizeLabel" :title="resizeLabel" @click.stop @pointerdown.stop.prevent="startResize" @pointermove.stop.prevent="moveResize" @pointerup.stop.prevent="finishResize" @pointercancel.stop.prevent="finishResize" @keydown.left.prevent="resizeWithKeyboard(-1)" @keydown.right.prevent="resizeWithKeyboard(1)"><span>{{ displaySpan }} / 12</span><i aria-hidden="true" /></button>
  </article>
</template>

<script setup lang="ts">
import CaseInlineEdit from '~/components/admin/cases/CaseInlineEdit.vue'
import CaseTechnologyMapEditor from '~/components/admin/cases/CaseTechnologyMapEditor.vue'
import CaseFreeformCanvas from '~/components/admin/cases/CaseFreeformCanvas.vue'
import type { CaseBlock, CaseContentEdit, CaseElementBox, CaseElementType, CaseLocale, CaseViewport } from '~/utils/caseBuilder'
import { blockLabel, blockTitle } from '~/utils/caseBuilder'
const props = defineProps<{ block: CaseBlock; locale: CaseLocale; index: number; selected: boolean; viewport: 'desktop' | 'tablet' | 'mobile' }>()
const emit = defineEmits<{
  select: []
  toggle: []
  duplicate: []
  remove: []
  convert: []
  resize: [span: number]
  'content-change': [edit: CaseContentEdit]
  'node-move': [payload: { index: number; x: number; y: number }]
  'element-add': [type: CaseElementType]
  'element-remove': [index: number]
  'element-change': [payload: { index: number; field: string; value: string }]
  'element-geometry': [payload: { index: number; viewport: CaseViewport; box: CaseElementBox }]
}>()
const cardElement = ref<HTMLElement | null>(null)
const content = computed(() => props.locale === 'ru' ? props.block.content_ru : props.block.content_en)
const heroHasMedia = computed(() => Boolean(content.value.image_url || content.value.device_screen_url || content.value.metric_value))
const liveSpan = ref<number | null>(null)
const currentSpan = computed(() => Math.max(1, Math.min(12, Number(props.block.settings[`${props.viewport}_span`]) || 12)))
const displaySpan = computed(() => liveSpan.value ?? currentSpan.value)
const gridStyle = computed(() => {
  const span = displaySpan.value
  const rawStart = Math.max(0, Number(props.block.settings[`${props.viewport}_start`]) || 0)
  const start = rawStart && rawStart + span <= 13 ? String(rawStart) : 'auto'
  return { gridColumn: `${start} / span ${span}` }
})
const resizeLabel = computed(() => `Изменить ширину блока. Сейчас ${displaySpan.value} из 12 колонок`)

type ResizeState = { pointerId: number; startX: number; startSpan: number; pitch: number; maxSpan: number; target: HTMLElement }
let resizeState: ResizeState | null = null

function edit(path: Array<string | number>, value: string) { emit('content-change', { path, value }) }

function startResize(event: PointerEvent) {
  const card = cardElement.value
  const sheet = card?.parentElement
  const target = event.currentTarget as HTMLElement
  if (!card || !sheet) return
  emit('select')
  const sheetRect = sheet.getBoundingClientRect()
  const cardRect = card.getBoundingClientRect()
  const sheetStyle = getComputedStyle(sheet)
  const paddingLeft = Number.parseFloat(sheetStyle.paddingLeft) || 0
  const paddingRight = Number.parseFloat(sheetStyle.paddingRight) || 0
  const gap = Number.parseFloat(sheetStyle.columnGap) || 0
  const contentWidth = sheet.clientWidth - paddingLeft - paddingRight
  const columnWidth = Math.max(1, (contentWidth - gap * 11) / 12)
  const pitch = columnWidth + gap
  const visualStart = Math.max(1, Math.min(12, Math.round((cardRect.left - sheetRect.left - paddingLeft) / pitch) + 1))
  resizeState = { pointerId: event.pointerId, startX: event.clientX, startSpan: currentSpan.value, pitch, maxSpan: 13 - visualStart, target }
  liveSpan.value = currentSpan.value
  target.setPointerCapture(event.pointerId)
}

function moveResize(event: PointerEvent) {
  if (!resizeState || event.pointerId !== resizeState.pointerId) return
  const delta = Math.round((event.clientX - resizeState.startX) / resizeState.pitch)
  liveSpan.value = Math.max(1, Math.min(resizeState.maxSpan, resizeState.startSpan + delta))
}

function finishResize(event: PointerEvent) {
  if (!resizeState || event.pointerId !== resizeState.pointerId) return
  const nextSpan = liveSpan.value ?? resizeState.startSpan
  if (resizeState.target.hasPointerCapture(event.pointerId)) resizeState.target.releasePointerCapture(event.pointerId)
  resizeState = null
  liveSpan.value = null
  if (nextSpan !== currentSpan.value) emit('resize', nextSpan)
}

function resizeWithKeyboard(direction: number) {
  const rawStart = Math.max(0, Number(props.block.settings[`${props.viewport}_start`]) || 0)
  const maxSpan = rawStart ? 13 - rawStart : 12
  const nextSpan = Math.max(1, Math.min(maxSpan, currentSpan.value + direction))
  if (nextSpan !== currentSpan.value) emit('resize', nextSpan)
}
</script>

<style scoped>
.canvas-block {
  position: relative;
  min-width: 0;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  overflow: visible;
  border: 1px solid rgb(38 46 60 / 12%);
  border-radius: 22px;
  color: #1c1d21;
  background: rgb(255 255 255 / 82%);
  box-shadow: 0 16px 45px rgb(39 48 66 / 7%);
  outline: none;
  transition: border-color .16s, box-shadow .16s, opacity .16s;
  container-type: inline-size;
}
.canvas-block:hover { border-color: rgb(74 86 108 / 30%); }
.canvas-block.selected { border-color: #947eff; box-shadow: 0 0 0 3px rgb(148 126 255 / 14%), 0 22px 58px rgb(55 45 106 / 11%); }
.canvas-block.resizing { user-select: none; transition: none; }
.canvas-block.hidden { opacity: .45; }
.canvas-block__rail { grid-row: 1 / 3; display: grid; grid-template-rows: auto 1fr; justify-items: center; gap: 9px; padding: 16px 0; border-right: 1px solid rgb(38 46 60 / 9%); border-radius: 21px 0 0 21px; background: linear-gradient(180deg, rgb(248 248 255 / 88%), rgb(238 248 253 / 72%)); }
.canvas-block__rail span { color: #7d8290; font: 600 8px var(--font-mono); }
.canvas-block__rail i { width: 1px; background: linear-gradient(#c8c8db, transparent); }
.canvas-block__header { min-height: 52px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgb(38 46 60 / 8%); }
.canvas-block__header > div:first-child { min-width: 0; display: grid; }
.canvas-block__header small { color: #7865ed; font: 600 7px var(--font-mono); letter-spacing: .06em; text-transform: uppercase; }
.canvas-block__header b { overflow: hidden; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.canvas-block__tools { display: flex; align-items: center; gap: 2px; }
.canvas-block__tools button { width: 26px; height: 26px; border: 0; border-radius: 9px; color: #788396; background: transparent; cursor: pointer; }
.canvas-block__tools button:hover { color: #1c1d21; background: rgb(141 126 239 / 10%); }
.canvas-block__tools > span { padding-left: 4px; color: #8b95a5; cursor: grab; }
.canvas-block__preview { min-height: 138px; margin: 10px; padding: clamp(18px, 3.2vw, 38px); display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: center; gap: clamp(16px, 3cqw, 28px); overflow: hidden; border: 1px solid rgb(255 255 255 / 70%); border-radius: 18px; background: radial-gradient(circle at 95% 5%, #fff 0, transparent 38%), radial-gradient(circle at 8% 92%, rgb(178 157 255 / 18%), transparent 44%), linear-gradient(145deg, #fff, #f6fbfd); }
.canvas-block__preview--hero { min-height: 0; padding: clamp(32px, 7cqw, 68px) clamp(18px, 4cqw, 42px); grid-template-columns: minmax(0, .92fr) minmax(280px, 1.08fr); gap: clamp(24px, 5cqw, 54px); }
.canvas-block__preview--hero-text-only { grid-template-columns: minmax(0, 1fr); }
.canvas-block__preview--hero-text-only .preview-hero-copy { max-width: 680px; }
.canvas-block__preview--freeform { min-height: 0; padding: 0; display: block; }
.theme-soft .canvas-block__preview { background: radial-gradient(circle at 92% 8%, #fff 0, transparent 39%), radial-gradient(circle at 10% 88%, rgb(174 155 255 / 25%), transparent 45%), radial-gradient(circle at 92% 86%, rgb(88 214 255 / 16%), transparent 42%), #f4f5ff; }
.theme-ink .canvas-block__preview { color: #f8f8ff; border-color: rgb(255 255 255 / 9%); background: radial-gradient(circle at 18% 14%, rgb(151 129 255 / 24%), transparent 42%), radial-gradient(circle at 90% 86%, rgb(62 200 220 / 14%), transparent 42%), #171925; }
.theme-signal .canvas-block__preview { color: #171822; background: radial-gradient(circle at 12% 8%, rgb(255 255 255 / 48%), transparent 40%), radial-gradient(circle at 92% 88%, rgb(80 223 226 / 65%), transparent 44%), linear-gradient(135deg, #c4b6ff, #8dc8ff 55%, #73dfd8); }
.inline-eyebrow { color: #7865ed; font: 600 7px var(--font-mono); letter-spacing: .08em; text-transform: uppercase; }
.theme-ink .inline-eyebrow { color: #b9abff; }
.theme-signal .inline-eyebrow { color: #34304a; }
.preview-hero-copy { min-width: 0; }
.preview-hero-brand { display: flex; align-items: center; gap: 10px; }
.preview-hero-brand > img { width: 34px; height: 34px; border-radius: 10px; box-shadow: 0 10px 24px rgb(45 39 77 / 17%); }
.preview-hero-copy h3 { margin: 16px 0 18px; font: 500 clamp(36px, 6.5cqw, 62px)/.9 var(--font-ui); letter-spacing: -.065em; overflow-wrap: normal; word-break: normal; }
.preview-copy { min-width: 0; padding: clamp(13px, 2.3cqw, 22px); border: 1px solid rgb(42 48 61 / 9%); border-radius: 16px; background: rgb(255 255 255 / 52%); }
.theme-ink .preview-copy { border-color: rgb(255 255 255 / 10%); background: rgb(255 255 255 / 4%); }
.preview-copy h3 { margin: 5px 0; font-size: clamp(16px, 2.5vw, 26px); font-weight: 500; line-height: 1; letter-spacing: -.04em; }
.preview-hero-copy p { margin: 0 0 clamp(24px, 5cqw, 46px); color: #656b77; font-size: clamp(11px, 1.7cqw, 15px); line-height: 1.48; white-space: pre-line; }
.preview-copy p { max-height: 68px; margin: 10px 0 0; overflow: hidden; color: #656b77; font-size: 9px; line-height: 1.55; white-space: pre-line; }
.theme-ink p { color: #c7cada; }
.preview-hero-facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; margin: 0; }
.preview-hero-facts div { min-width: 0; padding: 11px; border: 1px solid rgb(42 48 61 / 9%); border-radius: 12px; background: rgb(255 255 255 / 45%); }
.preview-hero-facts dt { opacity: .55; font: 7px var(--font-mono); text-transform: uppercase; }
.preview-hero-facts dd { margin: 4px 0 0; overflow-wrap: anywhere; font-size: 10px; }
.preview-copy--wide, .preview-media--wide, .preview-section-copy, .preview-caption { grid-column: 1 / -1; }
.preview-section-copy { display: grid; gap: 5px; }
.inline-section-title { max-width: 92%; font: 500 clamp(17px, 3.2cqw, 30px)/1 var(--font-ui); letter-spacing: -.045em; }
.preview-caption { color: #778294; font: 8px var(--font-mono); }
.preview-media { position: relative; min-height: 120px; display: grid; place-items: center; overflow: hidden; border-radius: 16px; color: #8c96a6; background: linear-gradient(145deg, #edf0f8, #e5f3f6); font: 600 9px var(--font-mono); }
.preview-hero-media { min-height: clamp(360px, 70cqw, 620px); margin: 0; box-shadow: 0 24px 60px rgb(40 43 62 / 14%); }
.preview-media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.preview-media .preview-device-screen { position: absolute; top: 9.7%; left: calc(50% + 3px); z-index: 2; height: 75.7%; aspect-ratio: .477; overflow: hidden; border-radius: 4.6% / 2.4%; transform: translateX(-50%); }
.preview-media .preview-device-screen img { width: 100%; height: 100%; object-fit: fill; }
.preview-media b, .preview-media span { z-index: 1; }
.preview-media b { font-size: 22px; }
.preview-hero-media figcaption { position: absolute; right: 14px; bottom: 14px; z-index: 3; max-width: 132px; padding: 13px; display: grid; border-radius: 14px; color: #171822; background: linear-gradient(135deg, #c2b4ff, #7bdfe2); box-shadow: 0 12px 28px rgb(27 31 48 / 20%); }
.preview-hero-media figcaption b { font: 700 24px/1 var(--font-ui); }
.preview-hero-media figcaption > .inline-edit { margin-top: 5px; font-size: 7px; }
.preview-grid { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.preview-grid figure { position: relative; min-height: clamp(120px, 27cqw, 230px); margin: 0; display: grid; place-items: center; overflow: hidden; border: 6px solid #1c1e29; border-radius: clamp(14px, 2.5cqw, 24px); background: #e7ebf1; color: #798290; font: 7px var(--font-mono); box-shadow: 0 16px 32px rgb(25 28 42 / 17%); }
.preview-grid img { width: 100%; height: 100%; object-fit: cover; }
.preview-metrics { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(78px, 1fr)); gap: 7px; }
.preview-metrics div { min-height: 82px; padding: 12px; display: grid; align-content: center; border: 1px solid rgb(42 48 61 / 10%); border-radius: 14px; background: rgb(255 255 255 / 48%); }
.theme-ink .preview-metrics div { border-color: rgb(255 255 255 / 12%); background: rgb(255 255 255 / 4%); }
.preview-metrics b { font: 650 23px var(--font-ui); }
.preview-metrics > div > .inline-edit { font-size: 8px; opacity: .7; }
.preview-process { grid-column: 1 / -1; margin: 0; padding: 0; display: grid; gap: 7px; list-style: none; }
.preview-process li { padding: 11px 13px; display: grid; grid-template-columns: 32px 1fr; align-items: center; border: 1px solid rgb(42 48 61 / 9%); border-radius: 13px; background: rgb(255 255 255 / 44%); font-size: 10px; }
.preview-process .process-index { color: #7865ed; font: 8px var(--font-mono); }
blockquote { grid-column: 1 / -1; margin: 0; font: 600 clamp(17px, 3vw, 30px)/1.2 var(--font-ui); }
blockquote small { display: block; margin-top: 12px; color: #778294; font: 9px var(--font-mono); }
.preview-tags { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 6px; }
.preview-tags span { padding: 8px 10px; border: 1px solid currentColor; border-radius: 999px; font: 8px var(--font-mono); }
.canvas-block__resize { position: absolute; top: 50%; right: -9px; z-index: 6; width: 18px; height: 62px; padding: 0; display: grid; grid-template-columns: repeat(3, 2px); place-items: center; gap: 2px; border: 1px solid #6857d7; border-radius: 8px; color: white; background: #7e6ae8; box-shadow: 0 7px 20px rgb(83 67 179 / 25%); cursor: ew-resize; opacity: 0; transform: translateY(-50%); touch-action: none; transition: opacity .14s ease, transform .14s ease; }
.canvas-block__resize span { position: absolute; right: 22px; padding: 5px 7px; border-radius: 7px; color: white; background: #18202d; font: 600 7px var(--font-mono); white-space: nowrap; opacity: 0; pointer-events: none; transform: translateX(4px); transition: opacity .14s ease, transform .14s ease; }
.canvas-block__resize i, .canvas-block__resize::before, .canvas-block__resize::after { width: 2px; height: 18px; border-radius: 2px; background: rgb(255 255 255 / 88%); content: ''; }
.canvas-block:hover .canvas-block__resize, .canvas-block.selected .canvas-block__resize, .canvas-block.resizing .canvas-block__resize, .canvas-block__resize:focus-visible { opacity: 1; }
.canvas-block__resize:hover span, .canvas-block__resize:focus-visible span, .canvas-block.resizing .canvas-block__resize span { opacity: 1; transform: translateX(0); }
.canvas-block__resize:focus-visible { outline: 2px solid white; outline-offset: 2px; }
@media (max-width: 640px) { .canvas-block__preview { grid-template-columns: 1fr; } .preview-copy--wide, .preview-media--wide, .preview-section-copy, .preview-caption, .preview-grid, .preview-metrics, .preview-process, blockquote, .preview-tags { grid-column: 1; } }
@container (max-width: 520px) { .canvas-block { grid-template-columns: 30px minmax(0,1fr); border-radius: 16px; } .canvas-block__rail { padding-top: 10px; border-radius: 15px 0 0 15px; } .canvas-block__header { padding: 7px 8px; } .canvas-block__tools button { width: 21px; } .canvas-block__preview { min-height: 110px; margin: 6px; padding: 16px; grid-template-columns: 1fr; gap: 14px; border-radius: 13px; } .canvas-block__preview--hero { padding: clamp(22px, 7cqw, 34px) 16px; } .preview-copy--wide, .preview-media--wide, .preview-section-copy, .preview-caption, .preview-grid, .preview-metrics, .preview-process, blockquote, .preview-tags { grid-column: 1; } .preview-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } .preview-hero-copy h3 { font-size: clamp(34px, 12cqw, 54px); } .preview-hero-media { min-height: clamp(300px, 110cqw, 480px); } .canvas-block__resize span { display: none; } }
</style>
