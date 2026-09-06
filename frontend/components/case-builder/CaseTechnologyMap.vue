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
        <span v-if="content.summary">{{ content.summary }}</span>
      </div>
      <div
        v-for="(item, index) in nodes"
        :key="`${item.label}-${index}`"
        class="case-technology-map__node"
        :style="nodeStyle(item, index)"
      >
        <CaseTechnologyIcon v-if="item.icon" class="case-technology-map__node-mark" :name="item.icon" />
        <i v-else aria-hidden="true" />
        <span><small>{{ item.category || String(index + 1).padStart(2, '0') }}</small><b>{{ item.label }}</b></span>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import type { CaseBlockSettings } from '~/utils/caseBuilder'
import { technologyMapStyle } from '~/utils/caseBuilder'
import CaseTechnologyIcon from './CaseTechnologyIcon.vue'

type TechnologyNode = { label?: string; category?: string; icon?: string; x?: number | null; y?: number | null }
type NodePosition = { x: number; y: number }

const props = defineProps<{ content: Record<string, any>; settings: CaseBlockSettings }>()
const nodes = computed<TechnologyNode[]>(() => props.content.items || [])
const mapStyle = computed(() => technologyMapStyle(props.settings))
const fallbackPositions: NodePosition[] = [
  { x: 18, y: 20 }, { x: 82, y: 20 }, { x: 27, y: 84 }, { x: 73, y: 84 },
  { x: 16, y: 49 }, { x: 84, y: 49 }, { x: 38, y: 18 }, { x: 62, y: 82 },
]
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
.case-technology-map {
  min-height: 100%;
  color: var(--tech-map-text);
  background: var(--tech-map-background);
}

.case-technology-map__surface {
  position: relative;
  min-height: clamp(500px, 52cqw, 620px);
  overflow: hidden;
  border: 1px solid rgba(var(--tech-map-text-rgb), .1);
  border-radius: 24px;
  background:
    radial-gradient(circle at 52% 48%, rgba(var(--tech-map-accent-rgb), .16), transparent 32%),
    radial-gradient(circle at 8% 8%, rgba(116, 213, 242, .14), transparent 36%),
    linear-gradient(145deg, color-mix(in srgb, var(--tech-map-background) 92%, white), var(--tech-map-background));
}

.case-technology-map__glow {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 38%;
  aspect-ratio: 1;
  border-radius: 42% 58% 61% 39% / 43% 42% 58% 57%;
  background: linear-gradient(145deg, rgba(var(--tech-map-accent-rgb), .28), rgba(82, 212, 236, .2));
  filter: blur(28px);
  translate: -50% -50%;
}

.case-technology-map svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.case-technology-map svg line {
  stroke: var(--tech-map-accent);
  stroke-width: 1.25;
  opacity: .24;
  vector-effect: non-scaling-stroke;
}

.case-technology-map__core,
.case-technology-map__node {
  position: absolute;
  z-index: 2;
  color: var(--tech-map-text);
  transform: translate(-50%, -50%);
}

.case-technology-map__core {
  left: 50%;
  top: 50%;
  width: min(34%, 310px);
  min-width: 250px;
  padding: 28px;
  border: 1px solid rgba(var(--tech-map-text-rgb), .1);
  border-radius: 28px;
  background:
    radial-gradient(circle at 12% 5%, rgba(255, 255, 255, .74), transparent 38%),
    linear-gradient(135deg, rgba(var(--tech-map-accent-rgb), .42), rgba(82, 212, 236, .34));
  box-shadow: 0 28px 72px -46px rgba(var(--tech-map-accent-rgb), .7);
}

.case-technology-map__core small,
.case-technology-map__node small {
  display: block;
  color: color-mix(in srgb, var(--tech-map-text) 58%, transparent);
  font: 650 8px/1 var(--font-mono);
  letter-spacing: .13em;
  text-transform: uppercase;
}

.case-technology-map__core small {
  margin-bottom: 16px;
}

.case-technology-map__core b {
  display: block;
  font: 560 clamp(18px, 2.4cqw, 25px)/1.08 var(--font-ui);
  letter-spacing: -.035em;
  text-wrap: balance;
}

.case-technology-map__core > span {
  display: block;
  margin-top: 18px;
  color: color-mix(in srgb, var(--tech-map-text) 68%, transparent);
  font-size: 12px;
  line-height: 1.45;
}

.case-technology-map__node {
  width: clamp(154px, 27cqw, 216px);
  min-width: 154px;
  max-width: 230px;
  padding: 11px 15px 11px 11px;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(var(--tech-map-text-rgb), .1);
  border-radius: 999px;
  background: color-mix(in srgb, var(--tech-map-background) 78%, white 22%);
  box-shadow: 0 18px 45px -36px rgba(var(--tech-map-text-rgb), .42);
}

.case-technology-map__node > i {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(var(--tech-map-accent-rgb), .92), #62d8e4);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .58);
}
.case-technology-map__node-mark { --technology-icon-size: 28px; }

.case-technology-map__node > span {
  min-width: 0;
}

.case-technology-map__node small {
  margin-bottom: 5px;
}

.case-technology-map__node b {
  display: block;
  overflow: hidden;
  font: 620 clamp(11px, 1.35cqw, 14px)/1.15 var(--font-ui);
  letter-spacing: -.015em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@container (max-width: 680px) {
  .case-technology-map__surface {
    min-height: auto;
    padding: 14px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .case-technology-map__glow,
  .case-technology-map svg {
    display: none;
  }

  .case-technology-map__core,
  .case-technology-map__node {
    position: relative;
    left: auto !important;
    top: auto !important;
    width: auto;
    min-width: 0;
    max-width: none;
    transform: none;
  }

  .case-technology-map__core {
    grid-column: 1 / -1;
    order: -1;
  }
}

@container (max-width: 430px) {
  .case-technology-map__surface {
    grid-template-columns: 1fr;
  }

  .case-technology-map__core {
    grid-column: 1;
  }
}
</style>
