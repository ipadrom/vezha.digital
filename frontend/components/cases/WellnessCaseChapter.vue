<template>
  <section :id="chapter.id" class="wellness-chapter" :class="{ 'wellness-chapter--reverse': reverse }">
    <header class="wellness-chapter__header">
      <span>{{ chapter.number }} / {{ chapter.eyebrow }}</span>
      <h2>{{ chapter.title }}</h2>
    </header>
    <div class="wellness-chapter__copy">
      <p>{{ chapter.lead }}</p>
      <ul><li v-for="point in chapter.points" :key="point">{{ point }}</li></ul>
    </div>
    <div class="wellness-chapter__screens">
      <figure v-for="(screen, index) in chapter.screens" :key="screen.src" :class="{ 'is-lead': index === 0 }">
        <div><img :src="screen.src" :alt="screen.alt" :loading="index === 0 ? 'eager' : 'lazy'" /></div>
        <figcaption><span>{{ String(index + 1).padStart(2, "0") }}</span>{{ screen.caption }}</figcaption>
      </figure>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WellnessChapter } from "~/utils/wellnessCaseContent";
withDefaults(defineProps<{ chapter: WellnessChapter; reverse?: boolean }>(), { reverse: false });
</script>
