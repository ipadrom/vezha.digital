<template>
  <div class="freeform-editor">
    <div class="freeform-palette" @click.stop>
      <span>Добавить</span>
      <button v-for="item in palette" :key="item.type" type="button" @click="emit('add', item.type)"><b>{{ item.mark }}</b>{{ item.label }}</button>
    </div>

    <div ref="stageElement" class="freeform-canvas" :style="stageStyle" @click.stop="selectedId = null">
      <div v-if="!elements.length" class="freeform-empty"><b>Пустая композиция</b><span>Добавьте заголовок, изображение или другой элемент сверху.</span></div>
      <div
        v-for="(element, index) in elements"
        :key="element.id"
        class="freeform-item"
        :class="[`freeform-item--${element.type}`, { selected: selectedId === element.id }]"
        :style="elementStyle(element)"
        @click.stop="select(element.id)"
      >
        <button class="freeform-item__move" type="button" title="Переместить элемент" @pointerdown.stop.prevent="startPointer($event, index, 'move')">⠿</button>
        <button class="freeform-item__remove" type="button" title="Удалить элемент" @click.stop="emit('remove', index)">×</button>

        <CaseInlineEdit v-if="element.type === 'eyebrow'" class="freeform-eyebrow" :model-value="element.text || ''" placeholder="Метка" label="Метка" @update:model-value="changeField(index, 'text', $event)" />
        <h3 v-else-if="element.type === 'heading'"><CaseInlineEdit :model-value="element.text || ''" placeholder="Заголовок" label="Заголовок" multiline @update:model-value="changeField(index, 'text', $event)" /></h3>
        <p v-else-if="element.type === 'text'"><CaseInlineEdit :model-value="element.text || ''" placeholder="Введите текст" label="Текст" multiline @update:model-value="changeField(index, 'text', $event)" /></p>
        <div v-else-if="element.type === 'image'" class="freeform-image"><img v-if="element.url" :src="element.url" alt="" /><span v-else>IMAGE</span></div>
        <div v-else-if="element.type === 'video'" class="freeform-image"><img v-if="element.poster" :src="element.poster" alt="" /><span>▶ VIDEO</span></div>
        <div v-else-if="element.type === 'button'" class="freeform-button"><CaseInlineEdit :model-value="element.text || ''" placeholder="Кнопка" label="Текст кнопки" @update:model-value="changeField(index, 'text', $event)" /><b>↗</b></div>
        <div v-else-if="element.type === 'metric'" class="freeform-metric"><b><CaseInlineEdit :model-value="element.value || ''" placeholder="100%" label="Значение" @update:model-value="changeField(index, 'value', $event)" /></b><CaseInlineEdit :model-value="element.label || ''" placeholder="Результат" label="Подпись" @update:model-value="changeField(index, 'label', $event)" /></div>

        <button class="freeform-item__resize" type="button" title="Изменить размер элемента" @pointerdown.stop.prevent="startPointer($event, index, 'resize')"><i /></button>
      </div>
    </div>

    <div v-if="selectedElement && selectedIndex >= 0" class="freeform-properties" @click.stop>
      <span>{{ elementLabel(selectedElement.type) }} / {{ viewport }}</span>
      <label v-if="selectedElement.type === 'image'">URL изображения<input :value="selectedElement.url || ''" placeholder="/media/image.jpg" @input="changeField(selectedIndex, 'url', inputValue($event))" /></label>
      <label v-if="selectedElement.type === 'image'">Alt<input :value="selectedElement.alt || ''" placeholder="Описание изображения" @input="changeField(selectedIndex, 'alt', inputValue($event))" /></label>
      <label v-if="selectedElement.type === 'video'">URL видео<input :value="selectedElement.url || ''" placeholder="/media/video.mp4" @input="changeField(selectedIndex, 'url', inputValue($event))" /></label>
      <label v-if="selectedElement.type === 'video'">Постер<input :value="selectedElement.poster || ''" placeholder="/media/poster.jpg" @input="changeField(selectedIndex, 'poster', inputValue($event))" /></label>
      <label v-if="selectedElement.type === 'button'">Ссылка<input :value="selectedElement.href || ''" placeholder="https://" @input="changeField(selectedIndex, 'href', inputValue($event))" /></label>
      <small>Позиция и размер сохраняются отдельно для текущего экрана.</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import CaseInlineEdit from '~/components/admin/cases/CaseInlineEdit.vue'
import type { CaseElementBox, CaseElementType, CaseFreeformElement, CaseViewport } from '~/utils/caseBuilder'

const props = defineProps<{ elements: CaseFreeformElement[]; viewport: CaseViewport; height: number }>()
const emit = defineEmits<{
  add: [type: CaseElementType]
  remove: [index: number]
  change: [payload: { index: number; field: string; value: string }]
  geometry: [payload: { index: number; viewport: CaseViewport; box: CaseElementBox }]
}>()

const palette: Array<{ type: CaseElementType; label: string; mark: string }> = [
  { type: 'eyebrow', label: 'Метка', mark: 'E' },
  { type: 'heading', label: 'Заголовок', mark: 'H' },
  { type: 'text', label: 'Текст', mark: 'T' },
  { type: 'image', label: 'Картинка', mark: '□' },
  { type: 'video', label: 'Видео', mark: '▶' },
  { type: 'button', label: 'Кнопка', mark: '↗' },
  { type: 'metric', label: 'Метрика', mark: '%' },
]

const stageElement = ref<HTMLElement | null>(null)
const selectedId = ref<string | null>(null)
const liveBoxes = ref<Record<string, CaseElementBox>>({})
const selectedIndex = computed(() => props.elements.findIndex(item => item.id === selectedId.value))
const selectedElement = computed(() => selectedIndex.value >= 0 ? props.elements[selectedIndex.value] : null)
const stageStyle = computed(() => ({ height: `${Math.max(320, Math.min(760, Number(props.height) || 620))}px` }))

const safeBox = (element: CaseFreeformElement) => {
  const box = liveBoxes.value[element.id] || element[props.viewport]
  return { x: Number(box?.x) || 0, y: Number(box?.y) || 0, w: Math.max(4, Number(box?.w) || 20), h: Math.max(4, Number(box?.h) || 10) }
}
const elementStyle = (element: CaseFreeformElement) => {
  const box = safeBox(element)
  return { left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }
}
const elementLabel = (type: CaseElementType) => palette.find(item => item.type === type)?.label || type
const inputValue = (event: Event) => (event.target as HTMLInputElement).value
const select = (id: string) => { selectedId.value = id }
const changeField = (index: number, field: string, value: string) => emit('change', { index, field, value })

type PointerMode = 'move' | 'resize'
type PointerState = { pointerId: number; index: number; id: string; mode: PointerMode; startX: number; startY: number; box: CaseElementBox; target: HTMLElement }
let pointerState: PointerState | null = null

function startPointer(event: PointerEvent, index: number, mode: PointerMode) {
  const element = props.elements[index]
  if (!element || !stageElement.value) return
  selectedId.value = element.id
  const target = event.currentTarget as HTMLElement
  pointerState = { pointerId: event.pointerId, index, id: element.id, mode, startX: event.clientX, startY: event.clientY, box: safeBox(element), target }
  target.setPointerCapture(event.pointerId)
  target.addEventListener('pointermove', movePointer)
  target.addEventListener('pointerup', finishPointer)
  target.addEventListener('pointercancel', finishPointer)
}

function movePointer(event: PointerEvent) {
  if (!pointerState || event.pointerId !== pointerState.pointerId || !stageElement.value) return
  const rect = stageElement.value.getBoundingClientRect()
  const dx = (event.clientX - pointerState.startX) / rect.width * 100
  const dy = (event.clientY - pointerState.startY) / rect.height * 100
  const start = pointerState.box
  const box = pointerState.mode === 'move'
    ? { ...start, x: Math.max(0, Math.min(100 - start.w, start.x + dx)), y: Math.max(0, Math.min(100 - start.h, start.y + dy)) }
    : { ...start, w: Math.max(4, Math.min(100 - start.x, start.w + dx)), h: Math.max(4, Math.min(100 - start.y, start.h + dy)) }
  liveBoxes.value = { ...liveBoxes.value, [pointerState.id]: box }
}

function finishPointer(event: PointerEvent) {
  if (!pointerState || event.pointerId !== pointerState.pointerId) return
  const state = pointerState
  const box = liveBoxes.value[state.id] || state.box
  state.target.removeEventListener('pointermove', movePointer)
  state.target.removeEventListener('pointerup', finishPointer)
  state.target.removeEventListener('pointercancel', finishPointer)
  if (state.target.hasPointerCapture(event.pointerId)) state.target.releasePointerCapture(event.pointerId)
  pointerState = null
  const rounded = Object.fromEntries(Object.entries(box).map(([key, value]) => [key, Math.round(value * 10) / 10])) as unknown as CaseElementBox
  emit('geometry', { index: state.index, viewport: props.viewport, box: rounded })
  const next = { ...liveBoxes.value }
  delete next[state.id]
  liveBoxes.value = next
}
</script>

<style scoped>
.freeform-editor { min-width:0; grid-column:1/-1; display:grid; background:#f7f8fa; }
.freeform-palette { min-height:46px; padding:7px 10px; display:flex; align-items:center; gap:5px; overflow-x:auto; border-bottom:1px solid #d7dde5; background:#fff; }
.freeform-palette>span { margin-right:5px; color:#7b8697; font:600 7px var(--font-mono); letter-spacing:.08em; text-transform:uppercase; }
.freeform-palette button { min-height:29px; padding:0 9px; display:flex; align-items:center; gap:6px; border:1px solid #d7dde5; border-radius:3px; color:#283140; background:#fff; font:600 8px var(--font-ui); white-space:nowrap; cursor:pointer; }
.freeform-palette button:hover { border-color:var(--studio-blue); color:var(--studio-blue); }
.freeform-palette button b { color:var(--studio-blue); font:700 8px var(--font-mono); }
.freeform-canvas { position:relative; min-height:320px; overflow:hidden; background-color:#f8f9fb; background-image:linear-gradient(#e6e9ef 1px,transparent 1px),linear-gradient(90deg,#e6e9ef 1px,transparent 1px); background-size:32px 32px; }
.freeform-empty { position:absolute; inset:0; display:grid; place-content:center; gap:6px; color:#808b9c; text-align:center; pointer-events:none; }
.freeform-empty b { color:#263041; font-size:14px; }.freeform-empty span { font-size:10px; }
.freeform-item { position:absolute; z-index:1; min-width:44px; min-height:30px; border:1px solid transparent; overflow:visible; }
.freeform-item:hover,.freeform-item.selected { z-index:2; border-color:var(--studio-blue); box-shadow:0 0 0 2px rgba(40,100,240,.12); }
.freeform-item__move,.freeform-item__remove,.freeform-item__resize { position:absolute; z-index:5; padding:0; border:0; opacity:0; cursor:pointer; }
.freeform-item:hover .freeform-item__move,.freeform-item:hover .freeform-item__remove,.freeform-item:hover .freeform-item__resize,.freeform-item.selected .freeform-item__move,.freeform-item.selected .freeform-item__remove,.freeform-item.selected .freeform-item__resize { opacity:1; }
.freeform-item__move { top:-22px; left:-1px; width:31px; height:21px; color:#fff; background:var(--studio-blue); cursor:move; touch-action:none; }
.freeform-item__remove { top:-22px; right:-1px; width:23px; height:21px; color:#fff; background:#18202d; }
.freeform-item__resize { right:-6px; bottom:-6px; width:14px; height:14px; border:2px solid #fff; background:var(--studio-blue); box-shadow:0 0 0 1px var(--studio-blue); cursor:nwse-resize; touch-action:none; }
.freeform-eyebrow { color:var(--studio-blue); font:600 8px var(--font-mono); letter-spacing:.08em; text-transform:uppercase; }
.freeform-item h3 { width:100%; height:100%; margin:0; display:flex; align-items:center; overflow:hidden; font:500 clamp(24px,5cqw,64px)/.88 var(--font-ui); letter-spacing:-.065em; }
.freeform-item p { width:100%; height:100%; margin:0; overflow:hidden; color:#697486; font-size:clamp(10px,1.5cqw,16px); line-height:1.4; white-space:pre-line; }
.freeform-image { width:100%; height:100%; display:grid; place-items:center; overflow:hidden; color:#8993a2; background:#dfe4ea; font:600 8px var(--font-mono); }
.freeform-image img { width:100%; height:100%; object-fit:cover; }
.freeform-item--video .freeform-image { position:relative; }.freeform-item--video .freeform-image img { position:absolute; inset:0; }.freeform-item--video .freeform-image span { position:relative; z-index:1; padding:6px 8px; color:#fff; background:rgba(0,0,0,.58); }
.freeform-button { height:100%; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid; font:600 9px var(--font-mono); text-transform:uppercase; }
.freeform-metric { width:100%; height:100%; padding:10px; display:grid; align-content:center; overflow:hidden; color:#fff; background:var(--studio-blue); }
.freeform-metric b { font:700 clamp(18px,3.5cqw,42px)/1 var(--font-mono); }.freeform-metric>.inline-edit { margin-top:5px; font-size:8px; }
.freeform-properties { min-height:51px; padding:9px 12px; display:flex; align-items:end; gap:10px; border-top:1px solid #d7dde5; background:#fff; }
.freeform-properties>span { align-self:center; margin-right:auto; color:var(--studio-blue); font:600 7px var(--font-mono); text-transform:uppercase; }
.freeform-properties label { display:grid; gap:3px; color:#7d8797; font:600 6px var(--font-mono); text-transform:uppercase; }.freeform-properties input { width:190px; height:28px; padding:0 8px; border:1px solid #d7dde5; border-radius:3px; font:10px var(--font-ui); }
.freeform-properties small { max-width:190px; color:#8791a0; font-size:8px; line-height:1.3; }
@container (max-width:640px) { .freeform-properties { align-items:stretch; flex-direction:column; }.freeform-properties input { width:100%; }.freeform-properties small { max-width:none; } }
</style>
