<template>
  <div>
    <nav class="stack-menu">
      <div
          v-for="tech in techs"
          :key="tech.id"
          class="stack-menu-item"
          :class="{ active: hoveredTech === tech.id }"
          @mouseenter="onMenuEnter(tech.id)"
          @mouseleave="onMenuLeave"
      >
        <span>{{ tech.name }}</span>
      </div>
    </nav>
  </div>
</template>
<script setup lang="ts">
import type { ITechStack } from "~/utils/interfaces/ITechStack";

const props = defineProps<{
  techs: ITechStack[],
  hoveredTech: string | null
}>()

const emit = defineEmits<{
  (e: 'update:hoveredTech', id: string | null): void
}>()

function onMenuEnter(id: string) {
  emit('update:hoveredTech', id)
}

function onMenuLeave() {
  emit('update:hoveredTech', null)
}

</script>
<style>
.stack-menu {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 18px;
  pointer-events: auto;
}

.stack-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  justify-content: flex-end;
}

.stack-menu-item span {
  font-family: var(--font-ui);
  font-size: 1rem;
  color: var(--text-dim);
  transition: color 0.3s;
  letter-spacing: 0.05em;
}

.stack-menu-item::after {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-dim);
  flex-shrink: 0;
  transition: background 0.3s, box-shadow 0.3s;
}

.stack-menu-item:hover span,
.stack-menu-item.active span {
  color: var(--accent);
}

.stack-menu-item:hover::after,
.stack-menu-item.active::after {
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
}

@media (max-width: 768px) {
  .stack-menu {
    display: none;
  }
}
</style>
