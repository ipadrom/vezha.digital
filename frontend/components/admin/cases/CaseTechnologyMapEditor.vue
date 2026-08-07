<template>
  <section class="technology-map-editor" :class="{ moving: dragState !== null }" :style="mapStyle">
    <div ref="surfaceElement" class="technology-map-editor__surface">
      <div class="technology-map-editor__grid" aria-hidden="true" />
      <div class="technology-map-editor__glow" aria-hidden="true" />
      <svg class="technology-map-editor__links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line
          v-for="(item, nodeIndex) in nodes"
          :key="`link-${nodeIndex}`"
          x1="50"
          y1="50"
          :x2="nodePosition(item, nodeIndex).x"
          :y2="nodePosition(item, nodeIndex).y"
        />
      </svg>

      <div class="technology-map-editor__core">
        <span class="technology-map-editor__core-label">CORE</span>
        <CaseInlineEdit
          :model-value="content.title"
          placeholder="PRODUCT / WEB / API"
          label="Центральный узел"
          multiline
          @focus="$emit('focus')"
          @update:model-value="$emit('edit', { path: ['title'], value: $event })"
        />
      </div>

      <article
        v-for="(item, nodeIndex) in nodes"
        :key="nodeIndex"
        class="technology-map-editor__node"
        :class="{ active: dragState?.index === nodeIndex }"
        :style="nodeStyle(item, nodeIndex)"
        @pointerdown.stop="startNodeMove($event, nodeIndex)"
        @pointermove.stop="moveNode"
        @pointerup.stop="finishNodeMove"
        @pointercancel.stop="finishNodeMove"
      >
        <span class="technology-map-editor__node-index">{{ String(nodeIndex + 1).padStart(2, '0') }}</span>
        <CaseInlineEdit
          :model-value="item.label"
          placeholder="Technology"
          label="Название узла"
          @focus="$emit('focus')"
          @update:model-value="$emit('edit', { path: ['items', nodeIndex, 'label'], value: $event })"
        />
        <button
          type="button"
          aria-label="Переместить узел"
          title="Потяните, чтобы переместить узел"
          @keydown.left.prevent.stop="nudgeNode(nodeIndex, -2, 0)"
          @keydown.right.prevent.stop="nudgeNode(nodeIndex, 2, 0)"
          @keydown.up.prevent.stop="nudgeNode(nodeIndex, 0, -2)"
          @keydown.down.prevent.stop="nudgeNode(nodeIndex, 0, 2)"
        ><i /><i /><i /></button>
      </article>
    </div>

    <div v-if="groups.length" class="technology-map-editor__groups">
      <section v-for="group in groups" :key="group.category">
        <small>{{ group.category }}</small>
        <p>{{ group.items.join(' · ') }}</p>
      </section>
    </div>
    <p v-else class="technology-map-editor__empty">Добавьте узлы в правой панели</p>
  </section>
</template>

<script setup lang="ts">
import CaseInlineEdit from '~/components/admin/cases/CaseInlineEdit.vue'
import type { CaseBlockSettings, CaseContentEdit } from '~/utils/caseBuilder'
import { technologyMapStyle } from '~/utils/caseBuilder'

type TechnologyNode = { label?: string; category?: string; x?: number | null; y?: number | null }
type NodePosition = { x: number; y: number }
type DragState = { index: number; pointerId: number; target: HTMLElement; bounds: DOMRect; position: NodePosition }

const props = defineProps<{ content: Record<string, any>; settings: CaseBlockSettings }>()
const emit = defineEmits<{
  edit: [edit: CaseContentEdit]
  move: [payload: { index: number; x: number; y: number }]
  focus: []
}>()

const surfaceElement = ref<HTMLElement | null>(null)
const dragState = ref<DragState | null>(null)
const nodes = computed<TechnologyNode[]>(() => props.content.items || [])
const mapStyle = computed(() => technologyMapStyle(props.settings))
const fallbackPositions: NodePosition[] = [
  { x: 18, y: 20 }, { x: 82, y: 20 }, { x: 28, y: 78 }, { x: 72, y: 78 },
  { x: 16, y: 49 }, { x: 84, y: 49 }, { x: 38, y: 18 }, { x: 62, y: 82 },
]

const groups = computed(() => {
  const grouped = nodes.value.reduce<Record<string, string[]>>((result, item) => {
    const category = item.category?.trim() || 'Stack'
    const label = item.label?.trim()
    if (label) (result[category] ||= []).push(label)
    return result
  }, {})
  return Object.entries(grouped).map(([category, items]) => ({ category, items }))
})

function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)) }
function storedPosition(item: TechnologyNode, index: number): NodePosition {
  const fallback = fallbackPositions[index % fallbackPositions.length]
  return {
    x: item.x == null ? fallback.x : clamp(Number(item.x), 7, 93),
    y: item.y == null ? fallback.y : clamp(Number(item.y), 10, 90),
  }
}
function nodePosition(item: TechnologyNode, index: number) {
  return dragState.value?.index === index ? dragState.value.position : storedPosition(item, index)
}
function nodeStyle(item: TechnologyNode, index: number) {
  const position = nodePosition(item, index)
  return { left: `${position.x}%`, top: `${position.y}%` }
}
function positionFromPointer(event: PointerEvent, bounds: DOMRect): NodePosition {
  return {
    x: clamp(((event.clientX - bounds.left) / bounds.width) * 100, 7, 93),
    y: clamp(((event.clientY - bounds.top) / bounds.height) * 100, 10, 90),
  }
}
function startNodeMove(event: PointerEvent, index: number) {
  if ((event.target as HTMLElement).closest('[contenteditable="plaintext-only"]')) return
  const surface = surfaceElement.value
  const target = event.currentTarget as HTMLElement
  if (!surface) return
  event.preventDefault()
  emit('focus')
  target.setPointerCapture(event.pointerId)
  dragState.value = {
    index,
    pointerId: event.pointerId,
    target,
    bounds: surface.getBoundingClientRect(),
    position: storedPosition(nodes.value[index], index),
  }
}
function moveNode(event: PointerEvent) {
  const state = dragState.value
  if (!state || state.pointerId !== event.pointerId) return
  event.preventDefault()
  state.position = positionFromPointer(event, state.bounds)
}
function finishNodeMove(event: PointerEvent) {
  const state = dragState.value
  if (!state || state.pointerId !== event.pointerId) return
  event.preventDefault()
  if (state.target.hasPointerCapture(event.pointerId)) state.target.releasePointerCapture(event.pointerId)
  const position = state.position
  const index = state.index
  dragState.value = null
  emit('move', { index, x: Math.round(position.x * 10) / 10, y: Math.round(position.y * 10) / 10 })
}
function nudgeNode(index: number, deltaX: number, deltaY: number) {
  const current = storedPosition(nodes.value[index], index)
  emit('focus')
  emit('move', {
    index,
    x: clamp(current.x + deltaX, 7, 93),
    y: clamp(current.y + deltaY, 10, 90),
  })
}
</script>

<style scoped>
.technology-map-editor { grid-column: 1 / -1; min-width: 0; color: var(--tech-map-text); background: var(--tech-map-background); }
.technology-map-editor__surface { position: relative; min-height: clamp(330px, 48cqw, 520px); overflow: hidden; border: 1px solid rgba(var(--tech-map-text-rgb),.2); }
.technology-map-editor__grid { position: absolute; inset: 0; opacity: .58; background-image: linear-gradient(rgba(var(--tech-map-text-rgb),.1) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--tech-map-text-rgb),.1) 1px,transparent 1px); background-size: 32px 32px; }
.technology-map-editor__glow { position: absolute; left: 50%; top: 50%; width: 52%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle,rgba(var(--tech-map-accent-rgb),.52) 0,rgba(var(--tech-map-accent-rgb),.22) 34%,transparent 68%); transform: translate(-50%,-50%); pointer-events: none; }
.technology-map-editor__links { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.technology-map-editor__links line { stroke: rgba(var(--tech-map-text-rgb),.28); stroke-width: 1; stroke-dasharray: 3 5; vector-effect: non-scaling-stroke; }
.technology-map-editor__core,.technology-map-editor__node { position: absolute; z-index: 2; min-width: 116px; max-width: 190px; padding: 13px 15px; border: 1px solid rgba(var(--tech-map-text-rgb),.42); color: var(--tech-map-text); background: var(--tech-map-background); font: 600 10px/1.3 var(--font-mono); letter-spacing: .07em; text-align: center; text-transform: uppercase; transform: translate(-50%,-50%); }
.technology-map-editor__core { left: 50%; top: 50%; min-width: 190px; padding: 18px 20px; border-color: var(--tech-map-accent); box-shadow: 0 0 34px rgba(var(--tech-map-accent-rgb),.28); }
.technology-map-editor__core-label { display: block; margin-bottom: 7px; color: var(--tech-map-accent); font-size: 7px; letter-spacing: .14em; }
.technology-map-editor__core > .inline-edit { color: var(--tech-map-text); font-size: 11px; }
.technology-map-editor__node { cursor: grab; touch-action: none; transition: border-color .14s,box-shadow .14s; }
.technology-map-editor__node:hover,.technology-map-editor__node.active { border-color: var(--tech-map-accent); box-shadow: 0 0 0 2px rgba(var(--tech-map-accent-rgb),.14); }
.technology-map-editor__node.active { z-index: 5; cursor: grabbing; }
.technology-map-editor__node-index { position: absolute; left: 4px; top: 4px; color: rgba(var(--tech-map-text-rgb),.48); font-size: 6px; }
.technology-map-editor__node button { position: absolute; right: 3px; top: 3px; width: 20px; height: 16px; padding: 0; display: flex; align-items: center; justify-content: center; gap: 2px; border: 0; color: #7c8595; background: transparent; cursor: grab; }
.technology-map-editor__node button i { width: 2px; height: 8px; border-radius: 2px; background: currentColor; }
.technology-map-editor__node button:focus-visible { color: var(--tech-map-text); outline: 1px solid var(--tech-map-accent); }
.technology-map-editor__groups { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); border: 1px solid rgba(var(--tech-map-text-rgb),.2); border-top: 0; }
.technology-map-editor__groups section { min-height: 84px; padding: 15px; border-right: 1px solid rgba(var(--tech-map-text-rgb),.2); border-bottom: 1px solid rgba(var(--tech-map-text-rgb),.2); }
.technology-map-editor__groups section:nth-child(3n) { border-right: 0; }
.technology-map-editor__groups section:nth-child(4):last-child { grid-column: 1 / -1; border-right: 0; }
.technology-map-editor__groups small { display: block; margin-bottom: 17px; color: rgba(var(--tech-map-text-rgb),.55); font: 600 7px var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
.technology-map-editor__groups p { margin: 0; color: var(--tech-map-text); font-size: 10px; line-height: 1.4; }
.technology-map-editor__empty { margin: 0; padding: 20px; color: rgba(var(--tech-map-text-rgb),.58); font: 9px var(--font-mono); text-align: center; }
.technology-map-editor.moving { user-select: none; }
@container (max-width: 560px) {
  .technology-map-editor__surface { min-height: auto; padding: 12px; display: grid; grid-template-columns: 1fr; gap: 7px; }
  .technology-map-editor__grid,.technology-map-editor__glow,.technology-map-editor__links { display: none; }
  .technology-map-editor__core,.technology-map-editor__node { position: relative; left: auto!important; top: auto!important; min-width: 0; max-width: none; transform: none; }
  .technology-map-editor__core { order: -1; }
  .technology-map-editor__groups { grid-template-columns: 1fr; }
  .technology-map-editor__groups section,.technology-map-editor__groups section:nth-child(3n) { min-height: 0; border-right: 0; }
}
</style>
