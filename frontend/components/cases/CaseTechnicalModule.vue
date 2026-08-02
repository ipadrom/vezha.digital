<template>
  <section v-if="technologies.length" id="technical" class="case-technical">
    <header><span>{{ locale === "ru" ? "03 / Техническое досье" : "03 / Technical dossier" }}</span><h2>{{ locale === "ru" ? "Что держит продукт изнутри" : "What holds the product together" }}</h2></header>
    <div class="case-technical__map" aria-hidden="true">
      <div class="case-technical__node case-technical__node--main">{{ projectType }}</div>
      <div v-for="(item, index) in technologies.slice(0, 6)" :key="`${item.label}-${index}`" class="case-technical__node" :class="`n-${index}`">{{ item.label }}</div>
      <svg viewBox="0 0 100 60" preserveAspectRatio="none"><path v-for="index in Math.min(6, technologies.length)" :key="index" :d="`M50 30 L${[18,34,66,82,28,72][index - 1]} ${[12,50,50,12,30,30][index - 1]}`" /></svg>
    </div>
    <div class="case-technical__list">
      <div v-for="group in groups" :key="group.category"><span>{{ group.category }}</span><p>{{ group.items.join(" · ") }}</p></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { IProjectTechnology } from "~/utils/interfaces/IProjects";
const props = defineProps<{ technologies: IProjectTechnology[]; projectType: string; locale: "ru" | "en" }>();
const groups = computed(() => Object.entries(props.technologies.reduce<Record<string, string[]>>((acc, item) => {
  (acc[item.category] ||= []).push(item.label); return acc;
}, {})).map(([category, items]) => ({ category, items })));
</script>
