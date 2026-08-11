<template>
  <div class="inspector-form">
    <header><span>BLOCK / {{ block.type.toUpperCase() }}</span><h2>{{ blockLabel(block.type) }}</h2></header>

    <details open>
      <summary>Контент {{ locale.toUpperCase() }}</summary>
      <p v-if="isFreeform" class="inspector-hint">Это свободная композиция. Текст меняется прямо на холсте; здесь удобно загрузить изображения и указать ссылки.</p>
      <template v-if="isFreeform">
        <div v-for="(element, index) in freeformElements" :key="element.id" class="repeat-card freeform-element-card">
          <div class="repeat-card__head"><span>{{ freeformElementLabel(element.type) }} {{ index + 1 }}</span><button type="button" @click="removeFreeformElement(index)">Удалить</button></div>
          <label v-if="['eyebrow', 'heading', 'text', 'button'].includes(element.type)"><span>Текст</span><textarea v-if="element.type === 'text'" :value="element.text || ''" rows="3" @input="setFreeformElement(index, 'text', valueOf($event))" /><input v-else :value="element.text || ''" @input="setFreeformElement(index, 'text', valueOf($event))" /></label>
          <template v-if="element.type === 'image'"><label><span>Изображение</span><AdminMediaInput :model-value="element.url || ''" @update:model-value="setFreeformElement(index, 'url', $event)" /></label><label><span>Alt</span><input :value="element.alt || ''" @input="setFreeformElement(index, 'alt', valueOf($event))" /></label></template>
          <template v-if="element.type === 'video'"><label><span>Видео</span><AdminMediaInput :model-value="element.url || ''" accept="video/mp4,video/webm" @update:model-value="setFreeformElement(index, 'url', $event)" /></label><label><span>Постер</span><AdminMediaInput :model-value="element.poster || ''" @update:model-value="setFreeformElement(index, 'poster', $event)" /></label></template>
          <label v-if="element.type === 'button'"><span>Ссылка</span><input :value="element.href || ''" @input="setFreeformElement(index, 'href', valueOf($event))" /></label>
          <template v-if="element.type === 'metric'"><label><span>Значение</span><input :value="element.value || ''" @input="setFreeformElement(index, 'value', valueOf($event))" /></label><label><span>Подпись</span><input :value="element.label || ''" @input="setFreeformElement(index, 'label', valueOf($event))" /></label></template>
        </div>
      </template>
      <label v-for="field in fields" :key="field.key">
        <span>{{ field.label }}</span>
        <AdminMediaInput v-if="field.media" :model-value="content[field.key] || ''" :accept="field.accept" @update:model-value="setContent(field.key, $event)" />
        <input v-else-if="field.kind === 'checkbox'" type="checkbox" :checked="Boolean(content[field.key])" @change="setContentBoolean(field.key, $event)" />
        <textarea v-else-if="field.kind === 'textarea'" :value="content[field.key] || ''" :rows="field.rows || 4" @input="setContent(field.key, valueOf($event))" />
        <input v-else :value="content[field.key] || ''" :type="field.kind || 'text'" @input="setContent(field.key, valueOf($event))" />
      </label>

      <p v-if="block.type === 'technologies' && block.settings.layout === 'map'" class="inspector-hint">Название меняется прямо в узле. Чтобы расставить элементы, тяните карточки по схеме; линии перестроятся сами.</p>

      <div v-if="block.type === 'technologies' && block.settings.layout === 'map'" class="map-color-settings">
        <div class="map-color-settings__grid">
          <label v-for="color in mapColorFields" :key="color.key">
            <span>{{ color.label }}</span>
            <div class="map-color-input">
              <input type="color" :value="settingColor(color.key, color.fallback)" :aria-label="color.label" @input="setMapColor(color.key, valueOf($event), color.fallback)" />
              <input type="text" :value="settingColor(color.key, color.fallback)" maxlength="7" spellcheck="false" @input="setMapColorIfValid(color.key, valueOf($event))" @change="setMapColor(color.key, valueOf($event), color.fallback)" />
            </div>
          </label>
        </div>
        <div class="map-color-presets" aria-label="Готовые акцентные цвета">
          <button v-for="preset in mapAccentPresets" :key="preset.value" type="button" :title="preset.label" :aria-label="preset.label" :class="{ active: settingColor('map_accent', technologyMapColorDefaults.accent) === preset.value }" :style="{ background: preset.value }" @click="setSetting('map_accent', preset.value)" />
        </div>
      </div>

      <template v-if="itemFields.length">
        <div v-for="(item, index) in items" :key="index" class="repeat-card">
          <div class="repeat-card__head"><span>{{ itemName }} {{ index + 1 }}</span><button type="button" @click="removeItem(index)">Удалить</button></div>
          <label v-for="field in itemFields" :key="field.key">
            <span>{{ field.label }}</span>
            <AdminMediaInput v-if="field.media" :model-value="item[field.key] || ''" @update:model-value="setItem(index, field.key, $event)" />
            <textarea v-else-if="field.kind === 'textarea'" :value="item[field.key] || ''" rows="2" @input="setItem(index, field.key, valueOf($event))" />
            <input v-else :value="item[field.key] || ''" @input="setItem(index, field.key, valueOf($event))" />
          </label>
        </div>
        <button class="inspector-add" type="button" @click="addItem">+ Добавить {{ itemName.toLowerCase() }}</button>
      </template>
    </details>

    <details open class="grid-settings">
      <summary>Расположение на странице</summary>
      <p class="inspector-hint">Тяните синий край карточки прямо на холсте. Здесь можно задать точное значение отдельно для каждого экрана.</p>
      <div v-for="viewport in gridBreakpoints" :key="viewport.key" class="grid-control">
        <div class="grid-control__head"><b>{{ viewport.label }}</b><small>{{ spanFor(viewport.key) }} / 12 колонок</small></div>
        <div class="grid-control__sizes" :aria-label="`Ширина блока: ${viewport.label}`">
          <button
            v-for="span in viewport.spans"
            :key="span"
            type="button"
            :class="{ active: spanFor(viewport.key) === span }"
            @click="setGridSpan(viewport.key, span)"
          >{{ span === 12 ? '100%' : span === 8 ? '⅔' : span === 6 ? '½' : '⅓' }}</button>
        </div>
        <div class="grid-control__ruler" aria-hidden="true">
          <i v-for="column in 12" :key="column" :class="{ active: gridCellActive(viewport.key, column) }" />
        </div>
        <label>
          <span>Позиция</span>
          <select :value="positionMode(viewport.key)" @change="setGridPosition(viewport.key, valueOf($event) as GridPosition)">
            <option value="auto">Авто / рядом с предыдущим</option>
            <option value="left">С новой строки слева</option>
            <option value="center">По центру</option>
            <option value="right">Справа</option>
          </select>
        </label>
      </div>
    </details>

    <details open>
      <summary>Оформление</summary>
      <label><span>Фон</span><select :value="block.settings.theme" @change="setSetting('theme', valueOf($event))"><option value="paper">Светлая карточка</option><option value="soft">Мягкий градиент</option><option value="ink">Графитовый</option><option value="signal">Акцентный градиент</option></select></label>
      <div class="inspector-pair">
        <label><span>Контент внутри</span><select :value="block.settings.width" @change="setSetting('width', valueOf($event))"><option value="standard">Обычный</option><option value="wide">Широкий</option><option value="full">Без полей</option></select></label>
        <label><span>Отступ</span><select :value="block.settings.spacing" @change="setSetting('spacing', valueOf($event))"><option value="compact">Компактный</option><option value="normal">Обычный</option><option value="large">Большой</option></select></label>
      </div>
      <label><span>Композиция</span><select :value="block.settings.layout" @change="setSetting('layout', valueOf($event))"><option v-for="layout in layouts" :key="layout.value" :value="layout.value">{{ layout.label }}</option></select></label>
      <div v-if="isFreeform" class="freeform-heights">
        <label v-for="viewport in gridBreakpoints" :key="viewport.key"><span>Высота {{ viewport.label }}</span><input type="number" min="320" max="1400" step="20" :value="Number(block.settings[`freeform_height_${viewport.key}`]) || 620" @input="setSetting(`freeform_height_${viewport.key}`, Number(valueOf($event)))" /></label>
      </div>
      <label><span>Выравнивание</span><select :value="block.settings.alignment" @change="setSetting('alignment', valueOf($event))"><option value="left">Слева</option><option value="center">По центру</option><option value="right">Справа</option></select></label>
      <label><span>Якорь раздела</span><input :value="String(block.settings.anchor || '')" placeholder="например: story" @input="setSetting('anchor', valueOf($event).trim())" /><small>Используется для ссылок вида #story.</small></label>
    </details>
  </div>
</template>

<script setup lang="ts">
import AdminMediaInput from '~/components/admin/cases/AdminMediaInput.vue'
import type { CaseBlock, CaseElementType, CaseFreeformElement, CaseLocale } from '~/utils/caseBuilder'
import { blockLabel, deepClone, normalizeHexColor, technologyMapColorDefaults } from '~/utils/caseBuilder'

type Field = { key: string; label: string; kind?: string; rows?: number; media?: boolean; accept?: string }
type GridViewport = 'desktop' | 'tablet' | 'mobile'
type GridPosition = 'auto' | 'left' | 'center' | 'right'
const props = defineProps<{ block: CaseBlock; locale: CaseLocale }>()
const emit = defineEmits<{ change: [block: CaseBlock] }>()
const key = computed<'content_ru' | 'content_en'>(() => props.locale === 'ru' ? 'content_ru' : 'content_en')
const content = computed(() => props.block[key.value])
const items = computed<any[]>(() => content.value.items || [])
const isFreeform = computed(() => props.block.settings.layout === 'freeform')
const freeformElements = computed<CaseFreeformElement[]>(() => Array.isArray(content.value.elements) ? content.value.elements : [])
const valueOf = (event: Event) => (event.target as HTMLInputElement).value
const gridBreakpoints: Array<{ key: GridViewport; label: string; spans: number[] }> = [
  { key: 'desktop', label: 'Desktop', spans: [12, 8, 6, 4] },
  { key: 'tablet', label: 'Tablet', spans: [12, 8, 6] },
  { key: 'mobile', label: 'Mobile', spans: [12, 6] },
]
const mapColorFields = [
  { key: 'map_accent', label: 'Акцент', fallback: technologyMapColorDefaults.accent },
  { key: 'map_background', label: 'Фон карты', fallback: technologyMapColorDefaults.background },
  { key: 'map_text', label: 'Текст', fallback: technologyMapColorDefaults.text },
]
const mapAccentPresets = [
  { label: 'Кобальтовый', value: '#2864f0' },
  { label: 'Фиолетовый', value: '#806eff' },
  { label: 'Малиновый', value: '#ed3b72' },
  { label: 'Бирюзовый', value: '#00a995' },
  { label: 'Янтарный', value: '#e59b20' },
]

const fieldMap: Record<string, Field[]> = {
  hero: [{ key: 'logo_url', label: 'Логотип проекта', media: true }, { key: 'eyebrow', label: 'Метка' }, { key: 'title', label: 'Заголовок' }, { key: 'subtitle', label: 'Подзаголовок', kind: 'textarea', rows: 3 }, { key: 'type_label', label: 'Тип' }, { key: 'industry', label: 'Сфера' }, { key: 'timeline', label: 'Срок' }, { key: 'year', label: 'Год' }, { key: 'image_url', label: 'Главное изображение', media: true }, { key: 'image_alt', label: 'Alt изображения' }, { key: 'device_screen_url', label: 'Экран внутри устройства', media: true }, { key: 'metric_value', label: 'Значение метрики' }, { key: 'metric_label', label: 'Подпись метрики' }],
  media_hero: [{ key: 'image_url', label: 'Изображение', media: true, accept: 'image/*' }, { key: 'video_url', label: 'Видео', media: true, accept: 'video/mp4,video/webm' }, { key: 'poster_url', label: 'Обложка видео', media: true, accept: 'image/*' }, { key: 'alt', label: 'Описание медиа' }, { key: 'caption', label: 'Подпись', kind: 'textarea', rows: 3 }, { key: 'autoplay', label: 'Автозапуск без звука', kind: 'checkbox' }, { key: 'loop', label: 'Зациклить видео', kind: 'checkbox' }, { key: 'muted', label: 'Без звука', kind: 'checkbox' }, { key: 'controls', label: 'Показывать управление', kind: 'checkbox' }],
  text: [{ key: 'eyebrow', label: 'Метка' }, { key: 'title', label: 'Заголовок' }, { key: 'body', label: 'Текст', kind: 'textarea', rows: 8 }],
  challenge_solution: [{ key: 'eyebrow', label: 'Метка' }, { key: 'title', label: 'Заголовок' }, { key: 'challenge_label', label: 'Подпись задачи' }, { key: 'challenge', label: 'Задача', kind: 'textarea', rows: 6 }, { key: 'solution_label', label: 'Подпись решения' }, { key: 'solution', label: 'Решение', kind: 'textarea', rows: 6 }],
  image: [{ key: 'image_url', label: 'Изображение', media: true }, { key: 'alt', label: 'Alt' }, { key: 'caption', label: 'Подпись', kind: 'textarea' }],
  image_text: [{ key: 'eyebrow', label: 'Метка' }, { key: 'title', label: 'Заголовок' }, { key: 'body', label: 'Текст', kind: 'textarea', rows: 7 }, { key: 'image_url', label: 'Изображение', media: true }, { key: 'alt', label: 'Alt' }, { key: 'caption', label: 'Подпись' }],
  gallery: [{ key: 'eyebrow', label: 'Метка' }, { key: 'title', label: 'Заголовок' }],
  metrics: [{ key: 'eyebrow', label: 'Метка' }, { key: 'title', label: 'Заголовок' }, { key: 'summary', label: 'Общий результат', kind: 'textarea' }],
  process: [{ key: 'eyebrow', label: 'Метка' }, { key: 'title', label: 'Заголовок' }],
  quote: [{ key: 'quote', label: 'Цитата', kind: 'textarea', rows: 7 }, { key: 'author', label: 'Автор' }, { key: 'role', label: 'Должность' }, { key: 'logo_url', label: 'Логотип', media: true }],
  technologies: [{ key: 'eyebrow', label: 'Метка' }, { key: 'title', label: 'Заголовок' }, { key: 'summary', label: 'Описание', kind: 'textarea' }],
  video: [{ key: 'eyebrow', label: 'Метка' }, { key: 'title', label: 'Заголовок' }, { key: 'video_url', label: 'Видео', media: true, accept: 'video/mp4,video/webm' }, { key: 'poster_url', label: 'Обложка видео', media: true }, { key: 'caption', label: 'Подпись' }],
  comparison: [{ key: 'eyebrow', label: 'Метка' }, { key: 'title', label: 'Заголовок' }, { key: 'before_url', label: 'До', media: true }, { key: 'before_alt', label: 'Alt до' }, { key: 'before_label', label: 'Подпись до' }, { key: 'after_url', label: 'После', media: true }, { key: 'after_alt', label: 'Alt после' }, { key: 'after_label', label: 'Подпись после' }],
  results: [{ key: 'eyebrow', label: 'Метка' }, { key: 'title', label: 'Заголовок' }, { key: 'body', label: 'Итог', kind: 'textarea', rows: 7 }, { key: 'link_url', label: 'Ссылка', kind: 'url' }, { key: 'link_label', label: 'Текст ссылки' }],
  next_case: [{ key: 'eyebrow', label: 'Метка' }, { key: 'title', label: 'Заголовок' }, { key: 'case_slug', label: 'Slug следующего кейса' }, { key: 'cta_label', label: 'Текст ссылки' }],
}

const itemFieldMap: Record<string, Field[]> = {
  gallery: [{ key: 'image_url', label: 'Изображение', media: true }, { key: 'alt', label: 'Alt' }, { key: 'caption', label: 'Подпись', kind: 'textarea' }],
  metrics: [{ key: 'value', label: 'Значение' }, { key: 'label', label: 'Подпись' }, { key: 'context', label: 'Контекст', kind: 'textarea' }],
  process: [{ key: 'title', label: 'Название' }, { key: 'description', label: 'Описание', kind: 'textarea' }],
  technologies: [{ key: 'label', label: 'Технология' }, { key: 'category', label: 'Категория' }],
}
const itemDefaults: Record<string, any> = { gallery: { image_url: '', alt: '', caption: '' }, metrics: { value: '', label: '', context: '' }, process: { title: '', description: '' }, technologies: { label: '', category: 'stack' } }
const itemNames: Record<string, string> = { gallery: 'Изображение', metrics: 'Метрика', process: 'Этап', technologies: 'Технология' }
const fields = computed(() => isFreeform.value ? [] : fieldMap[props.block.type] || [])
const itemFields = computed(() => isFreeform.value ? [] : itemFieldMap[props.block.type] || [])
const itemName = computed(() => itemNames[props.block.type] || 'Элемент')
const layouts = computed(() => isFreeform.value ? [{ value: 'freeform', label: 'Свободная композиция' }] : ({
  media_hero: [{ value: 'media-16x9', label: 'Кино / 16:9' }, { value: 'media-3x2', label: 'Фото / 3:2' }, { value: 'media-natural', label: 'Исходные пропорции' }],
  gallery: [{ value: 'mosaic', label: 'Мозаика' }, { value: 'grid', label: 'Сетка' }, { value: 'strip', label: 'Лента' }, { value: 'phones', label: 'Экраны устройства' }],
  image_text: [{ value: 'image-right', label: 'Изображение справа' }, { value: 'image-left', label: 'Изображение слева' }],
  metrics: [{ value: 'grid', label: 'Сетка' }, { value: 'strip', label: 'Лента' }],
  comparison: [{ value: 'side-by-side', label: 'Рядом' }, { value: 'stacked', label: 'Друг под другом' }],
  technologies: [{ value: 'map', label: 'Карта связей' }, { value: 'tags', label: 'Карточки' }],
}[props.block.type] || [{ value: 'default', label: 'Стандартная' }]))

function update(mutator: (copy: CaseBlock) => void) { const copy = deepClone(props.block); mutator(copy); emit('change', copy) }
function setContent(field: string, value: unknown) { update(copy => { copy[key.value][field] = value }) }
function setContentBoolean(field: string, event: Event) { setContent(field, (event.target as HTMLInputElement).checked) }
const freeformElementLabel = (type: CaseElementType) => ({ eyebrow: 'Метка', heading: 'Заголовок', text: 'Текст', image: 'Изображение', video: 'Видео', button: 'Кнопка', metric: 'Метрика' }[type] || type)
function setFreeformElement(index: number, field: string, value: string) { update(copy => { if (copy[key.value].elements?.[index]) copy[key.value].elements[index][field] = value }) }
function removeFreeformElement(index: number) {
  update(copy => {
    const id = copy[key.value].elements?.[index]?.id
    for (const localeKey of ['content_ru', 'content_en'] as const) {
      if (Array.isArray(copy[localeKey].elements)) copy[localeKey].elements = copy[localeKey].elements.filter((item: { id?: string }, itemIndex: number) => id ? item.id !== id : itemIndex !== index)
    }
  })
}
function setSetting(field: string, value: unknown) { update(copy => { (copy.settings as any)[field] = value }) }
function settingColor(field: string, fallback: string) { return normalizeHexColor(props.block.settings[field], fallback) }
function setMapColor(field: string, value: string, fallback: string) { setSetting(field, normalizeHexColor(value, fallback)) }
function setMapColorIfValid(field: string, value: string) { if (/^#[0-9a-f]{6}$/i.test(value.trim())) setSetting(field, value.trim().toLowerCase()) }
function spanFor(viewport: GridViewport) { return Math.max(1, Math.min(12, Number(props.block.settings[`${viewport}_span`]) || 12)) }
function startFor(viewport: GridViewport) { return Math.max(0, Number(props.block.settings[`${viewport}_start`]) || 0) }
function startFromPosition(position: GridPosition, span: number) {
  if (position === 'auto') return 0
  if (position === 'left') return 1
  if (position === 'right') return 13 - span
  return Math.floor((12 - span) / 2) + 1
}
function positionMode(viewport: GridViewport): GridPosition {
  const span = spanFor(viewport)
  const start = startFor(viewport)
  if (!start) return 'auto'
  if (start === 1) return 'left'
  if (start === 13 - span) return 'right'
  return 'center'
}
function setGridSpan(viewport: GridViewport, span: number) {
  const position = positionMode(viewport)
  update(copy => {
    ;(copy.settings as any)[`${viewport}_span`] = span
    ;(copy.settings as any)[`${viewport}_start`] = startFromPosition(position, span)
  })
}
function setGridPosition(viewport: GridViewport, position: GridPosition) {
  setSetting(`${viewport}_start`, startFromPosition(position, spanFor(viewport)))
}
function gridCellActive(viewport: GridViewport, column: number) {
  const span = spanFor(viewport)
  const start = startFor(viewport) || 1
  return column >= start && column < start + span
}
function addItem() {
  update(copy => {
    copy.content_ru.items ||= []
    copy.content_en.items ||= []
    const fallbackPositions = [{ x: 18, y: 20 }, { x: 82, y: 20 }, { x: 28, y: 78 }, { x: 72, y: 78 }, { x: 16, y: 49 }, { x: 84, y: 49 }, { x: 38, y: 18 }, { x: 62, y: 82 }]
    const base = structuredClone(itemDefaults[copy.type])
    if (copy.type === 'technologies') Object.assign(base, fallbackPositions[copy.content_ru.items.length % fallbackPositions.length])
    copy.content_ru.items.push(structuredClone(base))
    copy.content_en.items.push(structuredClone(base))
  })
}
function removeItem(index: number) { update(copy => { copy.content_ru.items?.splice(index, 1); copy.content_en.items?.splice(index, 1) }) }
function setItem(index: number, field: string, value: string) { update(copy => { copy[key.value].items[index][field] = value }) }
</script>

<style scoped src="~/assets/css/admin-case-inspector.css"></style>
<style scoped>
.freeform-element-card { border-left:2px solid var(--studio-blue); }
.freeform-heights { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; }
.freeform-heights label { min-width:0; }.freeform-heights input { width:100%; }
@media(max-width:360px){.freeform-heights{grid-template-columns:1fr}}
</style>
