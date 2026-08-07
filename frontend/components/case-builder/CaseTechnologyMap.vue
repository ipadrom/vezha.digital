<template>
  <section class="case-technology-map" :style="mapStyle" :aria-label="content.eyebrow || 'Technology map'">
    <div class="case-technology-map__surface">
      <div class="case-technology-map__glow" aria-hidden="true" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line
          v-for="(item, index) in nodes"
          :key="`connection-${index}`"
          x1="50"
          y1="50"
          :x2="positionFor(item, index).x"
          :y2="positionFor(item, index).y"
        />
      </svg>
      <div class="case-technology-map__core">
        <small>{{ content.eyebrow || 'CORE' }}</small>
        <b>{{ content.title || 'PRODUCT / WEB / API' }}</b>
      </div>
      <div
        v-for="(item, index) in nodes"
        :key="`${item.label}-${index}`"
        class="case-technology-map__node"
        :style="nodeStyle(item, index)"
      >{{ item.label }}</div>
    </div>

    <div v-if="groups.length" class="case-technology-map__groups">
      <section v-for="group in groups" :key="group.category">
        <small>{{ group.category }}</small>
        <p>{{ group.items.join(' · ') }}</p>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CaseBlockSettings } from '~/utils/caseBuilder'
import { technologyMapStyle } from '~/utils/caseBuilder'

type TechnologyNode = { label?: string; category?: string; x?: number | null; y?: number | null }
type NodePosition = { x: number; y: number }

const props = defineProps<{ content: Record<string, any>; settings: CaseBlockSettings }>()
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
function positionFor(item: TechnologyNode, index: number): NodePosition {
  const fallback = fallbackPositions[index % fallbackPositions.length]
  return {
    x: item.x == null ? fallback.x : clamp(Number(item.x), 7, 93),
    y: item.y == null ? fallback.y : clamp(Number(item.y), 10, 90),
  }
}
function nodeStyle(item: TechnologyNode, index: number) {
  const position = positionFor(item, index)
  return { left: `${position.x}%`, top: `${position.y}%` }
}
</script>

<style scoped>
.case-technology-map { color:var(--tech-map-text); background:var(--tech-map-background); }
.case-technology-map__surface { position:relative; min-height:clamp(470px,48vw,690px); overflow:hidden; border:1px solid rgba(var(--tech-map-text-rgb),.2); background-image:linear-gradient(rgba(var(--tech-map-text-rgb),.1) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--tech-map-text-rgb),.1) 1px,transparent 1px); background-size:43px 43px; }
.case-technology-map__glow { position:absolute; left:50%; top:50%; width:48%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle,rgba(var(--tech-map-accent-rgb),.5) 0,rgba(var(--tech-map-accent-rgb),.22) 36%,transparent 69%); transform:translate(-50%,-50%); }
.case-technology-map svg { position:absolute; inset:0; width:100%; height:100%; }
.case-technology-map svg line { stroke:rgba(var(--tech-map-text-rgb),.3); stroke-width:1; stroke-dasharray:4 7; vector-effect:non-scaling-stroke; }
.case-technology-map__core,.case-technology-map__node { position:absolute; z-index:2; min-width:150px; max-width:250px; padding:19px 22px; border:1px solid rgba(var(--tech-map-text-rgb),.42); color:var(--tech-map-text); background:var(--tech-map-background); font:600 clamp(10px,1vw,13px)/1.3 var(--font-mono); letter-spacing:.1em; text-align:center; text-transform:uppercase; transform:translate(-50%,-50%); }
.case-technology-map__core { left:50%; top:50%; min-width:230px; padding:27px 30px; border-color:var(--tech-map-accent); box-shadow:0 0 55px rgba(var(--tech-map-accent-rgb),.28); }
.case-technology-map__core small { display:block; margin-bottom:10px; color:var(--tech-map-accent); font:600 8px var(--font-mono); letter-spacing:.15em; }
.case-technology-map__core b { font:600 clamp(11px,1.2vw,15px) var(--font-mono); }
.case-technology-map__groups { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); border:1px solid rgba(var(--tech-map-text-rgb),.2); border-top:0; }
.case-technology-map__groups section { min-height:145px; padding:30px 34px; border-right:1px solid rgba(var(--tech-map-text-rgb),.2); border-bottom:1px solid rgba(var(--tech-map-text-rgb),.2); }
.case-technology-map__groups section:nth-child(3n) { border-right:0; }
.case-technology-map__groups section:nth-child(4):last-child { grid-column:1 / -1; border-right:0; }
.case-technology-map__groups small { display:block; margin-bottom:35px; color:rgba(var(--tech-map-text-rgb),.55); font:600 9px var(--font-mono); letter-spacing:.08em; text-transform:uppercase; }
.case-technology-map__groups p { margin:0; color:var(--tech-map-text); font-size:clamp(15px,1.6vw,21px); line-height:1.45; }
@container (max-width:760px) {
  .case-technology-map__surface { min-height:auto; padding:14px; display:grid; grid-template-columns:1fr 1fr; gap:8px; background-size:28px 28px; }
  .case-technology-map__glow,.case-technology-map svg { display:none; }
  .case-technology-map__core,.case-technology-map__node { position:relative; left:auto!important; top:auto!important; min-width:0; max-width:none; padding:16px 12px; transform:none; }
  .case-technology-map__core { grid-column:1 / -1; order:-1; }
  .case-technology-map__groups { grid-template-columns:1fr; }
  .case-technology-map__groups section,.case-technology-map__groups section:nth-child(3n) { min-height:0; padding:22px 18px; border-right:0; }
  .case-technology-map__groups small { margin-bottom:12px; }
}
@container (max-width:430px) { .case-technology-map__surface { grid-template-columns:1fr; }.case-technology-map__core { grid-column:1; } }
</style>
