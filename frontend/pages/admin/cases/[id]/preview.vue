<template>
  <div class="draft-preview">
    <header><NuxtLink :to="`/admin/cases/${route.params.id}`">← Вернуться в редактор</NuxtLink><span>ПРЕДПРОСМОТР ЧЕРНОВИКА</span><div><button v-for="value in (['ru','en'] as const)" :key="value" type="button" :class="{ active: locale === value }" @click="locale = value">{{ value.toUpperCase() }}</button></div></header>
    <div v-if="loading" class="preview-state">Загружаем предпросмотр…</div>
    <div v-else-if="error" class="preview-state">{{ error }}</div>
    <PublicCaseBuilder v-else-if="document" :blocks="localizedBlocks(document.blocks, locale)" :locale="locale" />
  </div>
</template>

<script setup lang="ts">
import PublicCaseBuilder from '~/components/case-builder/PublicCaseBuilder.vue'
import type { CaseDocument, CaseLocale } from '~/utils/caseBuilder'
import { localizedBlocks } from '~/utils/caseBuilder'
definePageMeta({ layout: false })
const route = useRoute()
const { getCase } = useCaseAdmin()
const { initAuth } = useAuth()
const locale = ref<CaseLocale>('ru')
const document = ref<CaseDocument | null>(null)
const loading = ref(true)
const error = ref('')
onMounted(async () => { initAuth(); try { document.value = await getCase(String(route.params.id)); useHead({ title: `Предпросмотр — ${document.value.meta.name_ru}` }) } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Не удалось открыть предпросмотр' } finally { loading.value = false } })
</script>

<style scoped>
.draft-preview { min-height:100vh; color-scheme:light; background:#fff; }.draft-preview>header { position:sticky; top:0; z-index:100; height:50px; padding:0 16px; display:grid; grid-template-columns:1fr auto 1fr; align-items:center; color:white; background:#121722; }.draft-preview header a { color:white; font-size:11px; text-decoration:none; }.draft-preview header>span { color:#9ba8b9; font:600 9px var(--font-mono); letter-spacing:.12em; }.draft-preview header>div { justify-self:end; padding:3px; border:1px solid #354052; border-radius:5px; }.draft-preview header button { width:34px; height:25px; border:0; border-radius:3px; color:#8e9aad; background:transparent; font:600 9px var(--font-mono); }.draft-preview header button.active { color:white; background:#303a49; }.preview-state { min-height:calc(100vh - 50px); display:grid; place-items:center; color:#697386; }
@media(max-width:600px){.draft-preview>header{grid-template-columns:1fr auto}.draft-preview header>span{display:none}}
</style>
