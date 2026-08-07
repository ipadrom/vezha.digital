<template>
  <div class="inspector-form">
    <header><span>CASE SETTINGS</span><h2>Настройки кейса</h2></header>

    <details open>
      <summary>Основное</summary>
      <label><span>Название {{ locale.toUpperCase() }}</span><input :value="localized('name')" @input="setLocalized('name', valueOf($event))" /></label>
      <label><span>Короткое описание</span><textarea rows="3" :value="localized('description')" @input="setLocalized('description', valueOf($event))" /></label>
      <label><span>Тип проекта</span><input :value="localized('type')" placeholder="Web / Mobile / AI" @input="setLocalized('type', valueOf($event))" /></label>
      <label><span>Сфера</span><input :value="localized('industry')" @input="setLocalized('industry', valueOf($event))" /></label>
      <div class="inspector-pair">
        <label><span>Год</span><input :value="meta.year" @input="set('year', valueOf($event))" /></label>
        <label><span>Срок</span><input :value="localized('timeline')" @input="setLocalized('timeline', valueOf($event))" /></label>
      </div>
    </details>

    <details open>
      <summary>Адрес и карточка</summary>
      <label>
        <span>Slug</span>
        <div class="slug-field"><input :value="meta.slug" placeholder="project-name" @input="set('slug', valueOf($event))" /><button type="button" @click="makeSlug">Создать</button></div>
        <small>/cases/{{ meta.slug || 'project-name' }}</small>
      </label>
      <label><span>Обложка карточки</span><AdminMediaInput :model-value="meta.cover_image_url" @update:model-value="set('cover_image_url', $event)" /></label>
      <label><span>Ссылка на продукт</span><input :value="meta.project_url" type="url" @input="set('project_url', valueOf($event))" /></label>
      <div class="inspector-pair">
        <label><span>Порядок</span><input :value="meta.sort_order" type="number" @input="set('sort_order', Number(valueOf($event)))" /></label>
        <label class="check"><input :checked="meta.is_featured" type="checkbox" @change="set('is_featured', checkedOf($event))" /><span>На главной</span></label>
      </div>
    </details>

    <details>
      <summary>SEO</summary>
      <label><span>Title {{ locale.toUpperCase() }}</span><input :value="localized('seo_title')" @input="setLocalized('seo_title', valueOf($event))" /></label>
      <label><span>Description</span><textarea rows="3" :value="localized('seo_description')" @input="setLocalized('seo_description', valueOf($event))" /></label>
      <label><span>Изображение для соцсетей</span><AdminMediaInput :model-value="meta.seo_image_url" @update:model-value="set('seo_image_url', $event)" /></label>
      <label class="check"><input :checked="meta.seo_noindex" type="checkbox" @change="set('seo_noindex', checkedOf($event))" /><span>Не индексировать страницу</span></label>
    </details>
  </div>
</template>

<script setup lang="ts">
import AdminMediaInput from '~/components/admin/cases/AdminMediaInput.vue'
import type { CaseLocale, CaseMeta } from '~/utils/caseBuilder'
import { slugifyCase } from '~/utils/caseBuilder'

const props = defineProps<{ meta: CaseMeta; locale: CaseLocale }>()
const emit = defineEmits<{ change: [meta: CaseMeta] }>()
const localized = (field: string) => (props.meta as any)[`${field}_${props.locale}`] ?? ''
const set = (field: keyof CaseMeta, value: unknown) => emit('change', { ...props.meta, [field]: value })
const setLocalized = (field: string, value: string) => set(`${field}_${props.locale}` as keyof CaseMeta, value)
const valueOf = (event: Event) => (event.target as HTMLInputElement).value
const checkedOf = (event: Event) => (event.target as HTMLInputElement).checked
const makeSlug = () => set('slug', slugifyCase(props.meta.name_en || props.meta.name_ru))
</script>

<style scoped src="~/assets/css/admin-case-inspector.css"></style>
