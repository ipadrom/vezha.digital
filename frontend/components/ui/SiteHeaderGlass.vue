<template>
  <svg class="site-header-glass-filter" width="0" height="0" aria-hidden="true" focusable="false">
    <defs>
      <filter id="site-header-refraction" x="-10%" y="-40%" width="120%" height="180%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves="2" seed="8" result="glass-waves" />
        <feGaussianBlur in="glass-waves" stdDeviation="2" result="glass-map" />
        <feDisplacementMap in="SourceGraphic" in2="glass-map" scale="24" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
  <div class="site-header-glass" aria-hidden="true" :data-visible="visible ? 'true' : 'false'"></div>
</template>

<script setup lang="ts">
// The blur band behind the header on the landing and case pages; styles live in site-header.css.
defineProps<{ visible: boolean }>();
</script>
