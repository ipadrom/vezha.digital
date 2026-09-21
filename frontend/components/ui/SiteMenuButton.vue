<template>
  <button
    class="site-menu-button"
    type="button"
    :aria-label="label"
    :aria-expanded="expanded"
    :aria-controls="controls"
    @touchstart.passive="startTouch"
    @touchmove.passive="moveTouch"
    @touchcancel="touch = null"
    @touchend="finishTouch"
    @click="emit('activate')"
  >
    <span></span><span></span>
  </button>
</template>

<script setup lang="ts">
defineProps<{ label: string; expanded: boolean; controls: string }>();
const emit = defineEmits<{ activate: [] }>();
let touch: { x: number; y: number } | null = null;
function startTouch(event: TouchEvent) {
  touch = event.touches.length === 1
    ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
    : null;
}
function moveTouch(event: TouchEvent) {
  const current = event.touches[0];
  if (touch && (!current || Math.hypot(current.clientX - touch.x, current.clientY - touch.y) > 10)) touch = null;
}
function finishTouch(event: TouchEvent) {
  const start = touch;
  const end = event.changedTouches[0];
  touch = null;
  if (!start || !end || event.touches.length || Math.hypot(end.clientX - start.x, end.clientY - start.y) > 10) return;
  // Activate on finger release; suppress the later compatibility click on iOS.
  event.preventDefault();
  emit('activate');
}
</script>

<style scoped>
.site-menu-button { display: flex; flex: 0 0 44px; width: 44px; height: 44px; padding: 0; box-sizing: border-box; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border: 1px solid var(--menu-rule, var(--border)); border-radius: 50%; background: rgb(255 255 255 / 16%); color: inherit; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.site-menu-button:active { transform: none; }
.site-menu-button span { display: block; width: 17px; height: 1.5px; margin: 0; background: currentColor; transition: none; }
.site-menu-button[aria-expanded="true"] span:first-child { transform: translateY(2.75px) rotate(45deg); }
.site-menu-button[aria-expanded="true"] span:last-child { transform: translateY(-2.75px) rotate(-45deg); }
@media (min-width: 901px) { .site-menu-button { display: none; } }
</style>
