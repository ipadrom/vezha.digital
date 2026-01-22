<template>
  <div class="pattern-container pattern-left">
    <div class="pattern-repeater">
      <img v-for="i in 5" :key="i" src="/pattern/pattern-left.svg" alt="" aria-hidden="true" />
    </div>
  </div>
  <div class="pattern-container pattern-right">
    <div class="pattern-repeater">
      <img v-for="i in 5" :key="i" src="/pattern/pattern-right.svg" alt="" aria-hidden="true" />
    </div>
  </div>
</template>
<script setup lang="ts">
</script>
<style scoped>
.pattern-container {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 120px;
  z-index: 1;
  pointer-events: none;
  opacity: 0.7;
}

.pattern-left {
  left: 0;
}

.pattern-right {
  right: 0;
}

.pattern-repeater {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.pattern-repeater img {
  display: block;
  margin: 0 auto;
  width: 100%;
  object-fit: cover;
  flex-shrink: 0;
  transform: scaleY(1.2);
  transform-origin: center;
}

@media (max-width: 1400px) {
  .pattern-container {
    display: none;
  }
}
</style>