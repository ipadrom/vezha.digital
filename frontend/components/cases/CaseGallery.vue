<template>
  <section v-if="gallery.length" class="case-gallery" :aria-label="locale === 'ru' ? 'Галерея проекта' : 'Project gallery'">
    <figure v-for="(item, index) in gallery" :key="item.image_url" :class="{ 'case-gallery__item--wide': index % 3 === 0 }">
      <img :src="item.image_url" :alt="item.alt" loading="lazy" />
      <figcaption v-if="item.caption"><span>{{ String(index + 1).padStart(2, '0') }}</span>{{ item.caption }}</figcaption>
    </figure>
  </section>
</template>

<script setup lang="ts">
import type { IProjectGalleryItem } from "~/utils/interfaces/IProjects";
defineProps<{ gallery: IProjectGalleryItem[]; locale: "ru" | "en" }>();
</script>
