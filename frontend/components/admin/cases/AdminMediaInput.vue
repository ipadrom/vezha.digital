<template>
  <div class="media-input">
    <div v-if="modelValue" class="media-input__preview">
      <video v-if="isVideo" :src="modelValue" muted />
      <img v-else :src="modelValue" alt="" />
      <button type="button" title="Убрать файл" @click="$emit('update:modelValue', '')">×</button>
    </div>
    <input :value="modelValue" type="url" placeholder="https://… или загрузите файл" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    <label :class="{ disabled: uploading }">
      <input type="file" :accept="accept" :disabled="uploading" @change="upload" />
      {{ uploading ? 'Загрузка…' : 'Загрузить' }}
    </label>
    <small v-if="error">{{ error }}</small>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue: string; accept?: string }>(), { accept: 'image/*' })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const { uploadMedia } = useCaseAdmin()
const uploading = ref(false)
const error = ref('')
const isVideo = computed(() => /\.(mp4|webm)(?:$|\?)/i.test(props.modelValue))

async function upload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  error.value = ''
  try { emit('update:modelValue', (await uploadMedia(file)).url) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Не удалось загрузить файл' }
  finally { uploading.value = false; input.value = '' }
}
</script>

<style scoped>
.media-input { display: grid; grid-template-columns: 1fr auto; gap: 7px; }
.media-input__preview { position: relative; grid-column: 1 / -1; aspect-ratio: 16/7; overflow: hidden; border: 1px solid var(--studio-line); border-radius: 7px; background: #e9edf2; }
.media-input__preview img, .media-input__preview video { width: 100%; height: 100%; object-fit: cover; }
.media-input__preview button { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border: 0; border-radius: 50%; color: white; background: rgba(18,23,34,.78); cursor: pointer; }
.media-input > input { min-width: 0; height: 36px; padding: 0 9px; border: 1px solid var(--studio-line); border-radius: 6px; color: var(--studio-ink); background: white; font-size: 11px; }
.media-input > label { height: 36px; padding: 0 10px; display: grid; place-items: center; border: 1px solid var(--studio-line); border-radius: 6px; color: var(--studio-blue); background: white; font-size: 11px; cursor: pointer; }
.media-input > label input { display: none; }
.media-input > label.disabled { opacity: .55; }
.media-input > small { grid-column: 1 / -1; color: var(--studio-danger); }
</style>
