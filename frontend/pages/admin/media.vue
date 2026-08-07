<template>
  <div class="media-page">
    <header>
      <div><span>ASSET LIBRARY / {{ assets.length }}</span><h1>Медиа</h1><p>Файлы для обложек, галерей и видеоблоков.</p></div>
      <label class="media-upload" :class="{ disabled: uploading }">
        <input type="file" accept="image/*,video/mp4,video/webm" :disabled="uploading" @change="handleUpload" />
        {{ uploading ? 'Загружаем…' : '+ Загрузить файл' }}
      </label>
    </header>
    <p v-if="error" class="media-error">{{ error }}</p>
    <div v-if="loading" class="media-empty">Загружаем медиатеку…</div>
    <div v-else-if="!assets.length" class="media-empty">Медиатека пуста. Загрузите первый файл.</div>
    <section v-else class="media-grid">
      <article v-for="asset in assets" :key="asset.id">
        <div class="media-preview">
          <video v-if="asset.content_type.startsWith('video/')" :src="asset.url" muted />
          <img v-else :src="asset.url" alt="" />
          <span>{{ asset.content_type.split('/')[1]?.toUpperCase() }}</span>
        </div>
        <div class="media-info">
          <b>{{ asset.filename.split('/').pop() }}</b>
          <small>{{ formatSize(asset.size) }}</small>
          <input v-model="asset.alt_ru" type="text" placeholder="Alt на русском" @blur="saveAlt(asset)" />
          <input v-model="asset.alt_en" type="text" placeholder="Alt in English" @blur="saveAlt(asset)" />
          <div><button type="button" @click="copyUrl(asset.url)">Копировать URL</button><button class="danger" type="button" @click="remove(asset)">Удалить</button></div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { MediaAsset } from '~/utils/caseBuilder'

definePageMeta({ layout: 'admin-layout' })
useHead({ title: 'Медиа — VEZHA Studio' })
const { listMedia, uploadMedia, updateMedia, deleteMedia } = useCaseAdmin()
const assets = ref<MediaAsset[]>([])
const loading = ref(true)
const uploading = ref(false)
const error = ref('')

onMounted(async () => {
  try { assets.value = await listMedia() }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Не удалось загрузить медиа' }
  finally { loading.value = false }
})

async function handleUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  error.value = ''
  try { assets.value.unshift(await uploadMedia(file)) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Ошибка загрузки' }
  finally { uploading.value = false; input.value = '' }
}

async function remove(asset: MediaAsset) {
  if (!confirm('Удалить файл из хранилища? Ссылки на него перестанут работать.')) return
  try { await deleteMedia(asset.id); assets.value = assets.value.filter(item => item.id !== asset.id) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Не удалось удалить файл' }
}

async function saveAlt(asset: MediaAsset) {
  try { Object.assign(asset, await updateMedia(asset)) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Не удалось сохранить alt-текст' }
}

const copyUrl = (url: string) => navigator.clipboard.writeText(url)
const formatSize = (size: number) => size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} МБ` : `${Math.ceil(size / 1024)} КБ`
</script>

<style scoped>
.media-page { min-height: 100vh; padding: 46px clamp(24px, 4vw, 68px) 80px; overflow-y: auto; }
.media-page header { max-width: 1360px; margin: 0 auto 32px; display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; }
.media-page header span { color: var(--studio-blue); font: 600 11px var(--font-mono); letter-spacing: .12em; }
.media-page h1 { margin: 10px 0 5px; font: 700 clamp(42px, 6vw, 76px)/1 var(--font-epilepsy); }
.media-page header p { margin: 0; color: var(--studio-muted); }
.media-upload { padding: 13px 18px; border-radius: 8px; color: white; background: var(--studio-blue); font-weight: 700; cursor: pointer; }
.media-upload input { display: none; }
.media-upload.disabled { opacity: .55; }
.media-grid { max-width: 1360px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.media-grid article { overflow: hidden; border: 1px solid var(--studio-line); border-radius: 10px; background: white; }
.media-preview { position: relative; aspect-ratio: 4/3; background: #e8ecf1; }
.media-preview img, .media-preview video { width: 100%; height: 100%; object-fit: cover; }
.media-preview span { position: absolute; left: 8px; bottom: 8px; padding: 4px 6px; color: white; background: rgba(18,23,34,.78); font: 600 8px var(--font-mono); }
.media-info { padding: 12px; display: grid; gap: 6px; }
.media-info b { overflow: hidden; font: 500 11px var(--font-mono); text-overflow: ellipsis; white-space: nowrap; }
.media-info small { color: var(--studio-muted); }
.media-info > input { width:100%; height:32px; padding:0 8px; border:1px solid var(--studio-line); border-radius:5px; color:var(--studio-ink); background:white; font-size:10px; }
.media-info div { display: flex; justify-content: space-between; margin-top: 5px; }
.media-info button { padding: 0; border: 0; color: var(--studio-blue); background: none; font-size: 11px; cursor: pointer; }
.media-info button.danger { color: var(--studio-danger); }
.media-empty { max-width: 1360px; min-height: 280px; margin: auto; display: grid; place-items: center; border: 1px dashed #c4cbd6; color: var(--studio-muted); }
.media-error { max-width: 1360px; margin: 0 auto 16px; padding: 10px 12px; color: #9d2525; background: #ffe8e8; }
@media (max-width: 640px) { .media-page { padding: 28px 14px 60px; } .media-page header { align-items: stretch; flex-direction: column; } .media-upload { text-align: center; } }
</style>
