<template>
  <span
    ref="editable"
    class="inline-edit"
    :class="{ 'inline-edit--multiline': multiline }"
    :contenteditable="'plaintext-only'"
    :data-placeholder="placeholder"
    :aria-label="label"
    :aria-multiline="multiline"
    role="textbox"
    spellcheck="true"
    draggable="false"
    @focus="startEditing"
    @input="handleInput"
    @blur="finishEditing"
    @keydown="handleKeydown"
    @dragstart.prevent
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  label?: string
  multiline?: boolean
}>(), {
  modelValue: '',
  placeholder: 'Введите текст',
  label: 'Редактировать текст',
  multiline: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string]; focus: [] }>()
const editable = ref<HTMLElement | null>(null)
const editing = ref(false)
let valueBeforeEditing = ''

function syncDom(value: string) {
  if (!editable.value || editing.value) return
  editable.value.textContent = value || ''
}

watch(() => props.modelValue, value => syncDom(value || ''))
onMounted(() => syncDom(props.modelValue || ''))

function startEditing() {
  editing.value = true
  valueBeforeEditing = props.modelValue || ''
  emit('focus')
}

function currentValue() {
  const value = editable.value?.innerText.replace(/\r/g, '') || ''
  return props.multiline ? value : value.replace(/\n+/g, ' ')
}

function handleInput() {
  emit('update:modelValue', currentValue())
}

function finishEditing() {
  editing.value = false
  const value = currentValue()
  if (editable.value) editable.value.textContent = value
  emit('update:modelValue', value)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !props.multiline) {
    event.preventDefault()
    editable.value?.blur()
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    if (editable.value) editable.value.textContent = valueBeforeEditing
    emit('update:modelValue', valueBeforeEditing)
    editable.value?.blur()
  }
}
</script>

<style scoped>
.inline-edit { display: block; min-width: 1ch; border-radius: 3px; outline: none; cursor: text; white-space: nowrap; }
.inline-edit--multiline { white-space: pre-wrap; }
.inline-edit:empty::before { color: currentColor; content: attr(data-placeholder); opacity: .42; pointer-events: none; }
.inline-edit:hover { box-shadow: 0 0 0 2px rgba(40,100,240,.12); }
.inline-edit:focus { background: rgba(255,255,255,.78); box-shadow: 0 0 0 2px var(--studio-blue), 0 5px 16px rgba(18,23,34,.1); color: #18202d; }
.theme-ink .inline-edit:focus, .theme-signal .inline-edit:focus { background: white; }
@media (prefers-reduced-motion: no-preference) { .inline-edit { transition: box-shadow .14s ease, background-color .14s ease; } }
</style>
