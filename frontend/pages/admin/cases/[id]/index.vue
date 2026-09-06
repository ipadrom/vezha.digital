<template>
  <div class="case-editor">
    <header class="editor-topbar">
      <div class="editor-topbar__identity">
        <NuxtLink to="/admin/cases" title="К списку">←</NuxtLink>
        <div><small>{{ document?.meta.slug || 'NEW CASE' }}</small><b>{{ document?.meta.name_ru || 'Без названия' }}</b></div>
      </div>
      <div class="editor-topbar__history">
        <button type="button" title="Отменить" :disabled="historyIndex <= 0" @click="undo">↶</button>
        <button type="button" title="Повторить" :disabled="historyIndex >= history.length - 1" @click="redo">↷</button>
      </div>
      <div class="editor-topbar__locale">
        <button v-for="value in (['ru', 'en'] as const)" :key="value" type="button" :class="{ active: locale === value }" @click="locale = value">{{ value.toUpperCase() }}</button>
      </div>
      <div class="editor-topbar__save">
        <span :class="saveState"><i />{{ saveLabel }}</span>
        <NuxtLink v-if="document" :to="`/admin/cases/${document.id}/preview`" target="_blank">Предпросмотр ↗</NuxtLink>
        <button v-if="document" type="button" @click="openVersions">Версии</button>
        <button v-if="document?.status === 'published'" class="hide-button" type="button" @click="hide">Скрыть</button>
        <button class="publish-button" type="button" :disabled="publishing || saving || !document" @click="publish">{{ publishing ? 'Публикуем…' : document?.status === 'published' ? 'Обновить на сайте' : 'Опубликовать' }}</button>
      </div>
    </header>

    <div v-if="loading" class="editor-loading"><span /><b>Открываем конструктор</b></div>
    <div v-else-if="loadError" class="editor-loading editor-loading--error"><b>{{ loadError }}</b><NuxtLink to="/admin/cases">Вернуться к кейсам</NuxtLink></div>

    <template v-else-if="document">
      <aside class="editor-outline">
        <button class="outline-meta" type="button" :class="{ active: selectedId === null }" @click="selectedId = null"><span>⌘</span><div><b>Настройки кейса</b><small>Карточка, URL и SEO</small></div></button>
        <div class="outline-heading"><span>Структура</span><small>{{ document.blocks.length }}</small></div>
        <nav class="outline-list">
          <button v-for="(block, index) in document.blocks" :key="block.id" type="button" :class="{ active: selectedId === block.id, muted: !block.is_visible }" @click="selectedId = block.id">
            <span>{{ String(index + 1).padStart(2, '0') }}</span><div><b>{{ blockLabel(block.type) }}</b><small>{{ blockTitle(block, locale) }}</small></div><i>{{ block.type === 'hero' ? '●' : '⠿' }}</i>
          </button>
        </nav>
        <div class="block-library"><div class="outline-heading"><span>Добавить блок</span></div><button v-for="item in blockLibrary" :key="item.type" type="button" :disabled="item.type === 'hero' && document.blocks.some(block => block.type === 'hero')" @click="addBlock(item.type)"><span>{{ item.mark }}</span><div><b>{{ item.label }}</b><small>{{ item.type === 'hero' && document.blocks.some(block => block.type === 'hero') ? 'Обязательная шапка уже добавлена' : item.description }}</small></div></button></div>
      </aside>

      <main class="editor-canvas">
        <div class="canvas-toolbar"><span><b>PAGE CANVAS / {{ locale.toUpperCase() }} / 12 COL</b><small>Текст — клик · Ширина — потянуть за синий край</small></span><div><button type="button" :class="{ active: canvasWidth === 'desktop' }" @click="canvasWidth = 'desktop'">Desktop</button><button type="button" :class="{ active: canvasWidth === 'tablet' }" @click="canvasWidth = 'tablet'">Tablet</button><button type="button" :class="{ active: canvasWidth === 'mobile' }" @click="canvasWidth = 'mobile'">Mobile</button></div></div>
        <div class="canvas-sheet" :class="`canvas-sheet--${canvasWidth}`">
          <div v-if="!document.blocks.length" class="canvas-empty"><b>Страница пока пуста</b><span>Добавьте первый блок из библиотеки слева.</span></div>
          <CaseBlockCanvasCard
            v-for="(block, index) in document.blocks"
            :key="block.id"
            :block="block"
            :locale="locale"
            :index="index"
            :selected="selectedId === block.id"
            :viewport="canvasWidth"
            :draggable="block.type !== 'hero' && block.settings.layout !== 'freeform'"
            @dragstart="dragIndex = index"
            @dragover.prevent
            @drop="dropAt(index)"
            @select="selectedId = block.id"
            @toggle="toggleBlock(index)"
            @duplicate="duplicateBlock(index)"
            @remove="removeBlock(index)"
            @convert="convertBlock(index)"
            @content-change="updateBlockContent(index, $event)"
            @node-move="moveTechnologyNode(index, $event)"
            @resize="resizeBlock(index, $event)"
            @element-add="addElement(index, $event)"
            @element-remove="removeElement(index, $event)"
            @element-change="changeElement(index, $event)"
            @element-geometry="changeElementGeometry(index, $event)"
          />
          <button class="canvas-add" type="button" @click="addBlock('text')">+ Добавить текстовый блок</button>
        </div>
      </main>

      <aside class="editor-inspector">
        <CaseMetaInspector v-if="selectedId === null" :meta="document.meta" :locale="locale" @change="document.meta = $event" />
        <CaseBlockInspector v-else-if="selectedBlock" :block="selectedBlock" :locale="locale" @change="updateSelectedBlock" />
      </aside>
    </template>

    <div v-if="notice" class="editor-notice" :class="`editor-notice--${notice.type}`">{{ notice.text }}<button type="button" @click="notice = null">×</button></div>
    <div v-if="versionsOpen" class="version-backdrop" @click.self="versionsOpen = false">
      <section class="version-panel">
        <header><div><span>PUBLISH HISTORY</span><h2>Опубликованные версии</h2></div><button type="button" @click="versionsOpen = false">×</button></header>
        <p v-if="versionsLoading">Загружаем историю…</p>
        <p v-else-if="!revisions.length">История появится после первой публикации.</p>
        <template v-else>
          <article v-for="revision in revisions" :key="revision.id"><div><b>Версия {{ revision.version }}</b><small>{{ formatVersionDate(revision.created_at) }}</small></div><button type="button" @click="restoreVersion(revision.id)">Вернуть в черновик</button></article>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import CaseBlockCanvasCard from '~/components/admin/cases/CaseBlockCanvasCard.vue'
import CaseBlockInspector from '~/components/admin/cases/CaseBlockInspector.vue'
import CaseMetaInspector from '~/components/admin/cases/CaseMetaInspector.vue'
import type { CaseBlock, CaseBlockType, CaseContentEdit, CaseDocument, CaseElementBox, CaseElementType, CaseLocale, CaseRevision, CaseViewport } from '~/utils/caseBuilder'
import { blockLabel, blockLibrary, blockTitle, caseHeroColorDefaults, convertBlockToFreeform, createCaseBlock, createCaseElement, deepClone } from '~/utils/caseBuilder'

definePageMeta({ layout: 'admin-layout' })
const route = useRoute()
const { getCase, saveCase, publishCase, hideCase, listRevisions, restoreRevision } = useCaseAdmin()
const document = ref<CaseDocument | null>(null)
const loading = ref(true)
const loadError = ref('')
const locale = ref<CaseLocale>('ru')
const selectedId = ref<string | null>(null)
const canvasWidth = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
const dragIndex = ref<number | null>(null)
const saving = ref(false)
const publishing = ref(false)
const dirty = ref(false)
const applying = ref(false)
const notice = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const versionsOpen = ref(false)
const versionsLoading = ref(false)
const revisions = ref<CaseRevision[]>([])
const history = ref<Array<{ meta: CaseDocument['meta']; blocks: CaseBlock[] }>>([])
const historyIndex = ref(-1)
let saveTimer: ReturnType<typeof setTimeout> | undefined
let historyTimer: ReturnType<typeof setTimeout> | undefined

const selectedBlock = computed(() => document.value?.blocks.find(block => block.id === selectedId.value) || null)
const saveState = computed(() => saving.value ? 'saving' : dirty.value ? 'dirty' : 'saved')
const saveLabel = computed(() => saving.value ? 'Сохраняем…' : dirty.value ? 'Есть изменения' : 'Сохранено')

watch(document, () => {
  if (!document.value || applying.value || loading.value) return
  dirty.value = true
  clearTimeout(saveTimer)
  clearTimeout(historyTimer)
  saveTimer = setTimeout(saveNow, 1200)
  historyTimer = setTimeout(captureHistory, 500)
}, { deep: true })

onMounted(async () => {
  let addedMandatoryHero = false
  try {
    document.value = await getCase(String(route.params.id))
    addedMandatoryHero = enforceMandatoryHero()
    selectedId.value = document.value.blocks[0]?.id || null
    captureHistory()
    useHead({ title: `${document.value.meta.name_ru || 'Новый кейс'} — VEZHA Studio` })
  } catch (cause) { loadError.value = cause instanceof Error ? cause.message : 'Кейс не найден' }
  finally {
    loading.value = false
    if (addedMandatoryHero) {
      dirty.value = true
      saveTimer = setTimeout(saveNow, 400)
    }
  }
})

onBeforeUnmount(() => { clearTimeout(saveTimer); clearTimeout(historyTimer) })

function captureHistory() {
  if (!document.value || applying.value) return
  const snapshot = { meta: deepClone(document.value.meta), blocks: deepClone(document.value.blocks) }
  const current = history.value[historyIndex.value]
  if (current && JSON.stringify(current) === JSON.stringify(snapshot)) return
  history.value = [...history.value.slice(0, historyIndex.value + 1), snapshot].slice(-40)
  historyIndex.value = history.value.length - 1
}

function restoreHistory(index: number) {
  if (!document.value || !history.value[index]) return
  applying.value = true
  document.value.meta = deepClone(history.value[index].meta)
  document.value.blocks = deepClone(history.value[index].blocks)
  historyIndex.value = index
  dirty.value = true
  nextTick(() => { applying.value = false; saveTimer = setTimeout(saveNow, 700) })
}
const undo = () => restoreHistory(historyIndex.value - 1)
const redo = () => restoreHistory(historyIndex.value + 1)

async function saveNow(force = false): Promise<boolean> {
  if (!document.value) return false
  if (!dirty.value && !force) return true
  if (saving.value) return false
  saving.value = true
  clearTimeout(saveTimer)
  try {
    const response = await saveCase(document.value)
    applying.value = true
    document.value.status = response.status
    document.value.updated_at = response.updated_at
    document.value.published_at = response.published_at
    document.value.has_unpublished_changes = response.has_unpublished_changes
    dirty.value = false
    nextTick(() => { applying.value = false })
    return true
  } catch (cause) {
    showNotice('error', cause instanceof Error ? cause.message : 'Не удалось сохранить изменения')
    return false
  }
  finally { saving.value = false }
}

async function publish() {
  if (!document.value) return
  publishing.value = true
  try {
    const heroBlocks = document.value.blocks.filter(block => block.type === 'hero')
    if (!heroBlocks.length) throw new Error('Добавьте блок «Обложка» перед публикацией')
    if (!heroBlocks.some(block => block.is_visible)) {
      heroBlocks[0].is_visible = true
      selectedId.value = heroBlocks[0].id
      dirty.value = true
    }
    if (!await saveNow(true)) throw new Error('Сначала нужно сохранить изменения')
    applying.value = true
    document.value = await publishCase(document.value.id)
    selectedId.value = document.value.blocks.find(block => block.id === selectedId.value)?.id || document.value.blocks[0]?.id || null
    dirty.value = false
    showNotice('success', 'Кейс опубликован')
    nextTick(() => { applying.value = false })
  } catch (cause) { showNotice('error', cause instanceof Error ? cause.message : 'Не удалось опубликовать кейс') }
  finally { publishing.value = false }
}

async function hide() {
  if (!document.value || !confirm('Скрыть кейс с сайта? Черновик и опубликованная версия сохранятся.')) return
  try { applying.value = true; document.value = await hideCase(document.value.id); showNotice('success', 'Кейс скрыт с сайта') }
  catch (cause) { showNotice('error', cause instanceof Error ? cause.message : 'Не удалось скрыть кейс') }
  finally { nextTick(() => { applying.value = false }) }
}

function addBlock(type: CaseBlockType) {
  if (!document.value) return
  if (type === 'hero' && document.value.blocks.some(block => block.type === 'hero')) {
    showNotice('error', 'В кейсе уже есть обязательная шапка')
    return
  }
  const block = createCaseBlock(type)
  const selectedIndex = document.value.blocks.findIndex(item => item.id === selectedId.value)
  const insertAt = selectedIndex >= 0 ? selectedIndex + 1 : document.value.blocks.length
  document.value.blocks.splice(insertAt, 0, block)
  normalizeOrder()
  selectedId.value = block.id
}

function duplicateBlock(index: number) {
  if (!document.value) return
  if (document.value.blocks[index]?.type === 'hero') return
  const block = deepClone(document.value.blocks[index])
  block.id = createCaseBlock(block.type).id
  document.value.blocks.splice(index + 1, 0, block)
  normalizeOrder()
  selectedId.value = block.id
}
function removeBlock(index: number) {
  if (!document.value) return
  const target = document.value.blocks[index]
  if (target.type === 'hero' && document.value.blocks.filter(block => block.type === 'hero').length <= 1) {
    showNotice('error', 'В кейсе должна остаться хотя бы одна обложка')
    return
  }
  const [removed] = document.value.blocks.splice(index, 1)
  if (selectedId.value === removed.id) selectedId.value = document.value.blocks[index]?.id || document.value.blocks[index - 1]?.id || null
  normalizeOrder()
}
function toggleBlock(index: number) {
  if (!document.value) return
  const target = document.value.blocks[index]
  const visibleHeroes = document.value.blocks.filter(block => block.type === 'hero' && block.is_visible)
  if (target.type === 'hero' && target.is_visible && visibleHeroes.length <= 1) {
    showNotice('error', 'Обложку нельзя скрыть: она обязательна для публикации')
    return
  }
  target.is_visible = !target.is_visible
}
function convertBlock(index: number) {
  const block = document.value?.blocks[index]
  if (!block || block.type === 'hero') return
  document.value!.blocks[index] = convertBlockToFreeform(block)
  selectedId.value = block.id
  showNotice('success', 'Блок разобран: элементы можно двигать и менять по отдельности')
}
function addElement(index: number, type: CaseElementType) {
  const block = document.value?.blocks[index]
  if (!block) return
  const ruElements = Array.isArray(block.content_ru.elements) ? block.content_ru.elements : (block.content_ru.elements = [])
  const enElements = Array.isArray(block.content_en.elements) ? block.content_en.elements : (block.content_en.elements = [])
  const ruElement = createCaseElement(type, ruElements.filter((item: { type?: string }) => item.type === type).length)
  const enElement = deepClone(ruElement)
  const english: Partial<Record<CaseElementType, Partial<typeof enElement>>> = {
    eyebrow: { text: 'Label' }, heading: { text: 'New heading' }, text: { text: 'Enter text' }, button: { text: 'Open' }, metric: { value: '100%', label: 'Result' },
  }
  Object.assign(enElement, english[type] || {})
  ruElements.push(ruElement)
  enElements.push(enElement)
}
function removeElement(blockIndex: number, elementIndex: number) {
  const block = document.value?.blocks[blockIndex]
  if (!block) return
  const id = block.content_ru.elements?.[elementIndex]?.id || block.content_en.elements?.[elementIndex]?.id
  for (const key of ['content_ru', 'content_en'] as const) {
    if (!Array.isArray(block[key].elements)) continue
    block[key].elements = block[key].elements.filter((item: { id?: string }, index: number) => id ? item.id !== id : index !== elementIndex)
  }
}
function changeElement(blockIndex: number, payload: { index: number; field: string; value: string }) {
  const block = document.value?.blocks[blockIndex]
  if (!block) return
  const key = locale.value === 'ru' ? 'content_ru' : 'content_en'
  const element = block[key].elements?.[payload.index]
  if (element) element[payload.field] = payload.value
}
function changeElementGeometry(blockIndex: number, payload: { index: number; viewport: CaseViewport; box: CaseElementBox }) {
  const block = document.value?.blocks[blockIndex]
  if (!block) return
  const id = block.content_ru.elements?.[payload.index]?.id || block.content_en.elements?.[payload.index]?.id
  for (const key of ['content_ru', 'content_en'] as const) {
    const elements = block[key].elements
    if (!Array.isArray(elements)) continue
    const element = (id && elements.find((item: { id?: string }) => item.id === id)) || elements[payload.index]
    if (element) element[payload.viewport] = deepClone(payload.box)
  }
}
function updateSelectedBlock(value: CaseBlock) { if (!document.value) return; const index = document.value.blocks.findIndex(block => block.id === value.id); if (index >= 0) document.value.blocks[index] = value }
function updateBlockContent(index: number, edit: CaseContentEdit) {
  const block = document.value?.blocks[index]
  if (!block || !edit.path.length) return
  const contentKey = locale.value === 'ru' ? 'content_ru' : 'content_en'
  let target: any = block[contentKey]
  for (const segment of edit.path.slice(0, -1)) {
    if (target?.[segment] === undefined) return
    target = target[segment]
  }
  target[edit.path.at(-1)!] = edit.value
}
function moveTechnologyNode(index: number, payload: { index: number; x: number; y: number }) {
  const block = document.value?.blocks[index]
  if (!block || block.type !== 'technologies') return
  for (const contentKey of ['content_ru', 'content_en'] as const) {
    const item = block[contentKey].items?.[payload.index]
    if (!item) continue
    item.x = payload.x
    item.y = payload.y
  }
}
function resizeBlock(index: number, span: number) {
  const block = document.value?.blocks[index]
  if (!block) return
  const spanKey = `${canvasWidth.value}_span`
  const startKey = `${canvasWidth.value}_start`
  const nextSpan = Math.max(1, Math.min(12, Math.round(span)))
  const start = Math.max(0, Number(block.settings[startKey]) || 0)
  block.settings[spanKey] = nextSpan
  if (start && start + nextSpan > 13) block.settings[startKey] = Math.max(1, 13 - nextSpan)
}
function dropAt(index: number) { if (!document.value || dragIndex.value === null || dragIndex.value === index) return; const [block] = document.value.blocks.splice(dragIndex.value, 1); document.value.blocks.splice(index, 0, block); dragIndex.value = null; normalizeOrder() }
function enforceMandatoryHero() {
  if (!document.value) return false
  const blocks = document.value.blocks
  let heroIndex = blocks.findIndex(block => block.type === 'hero')
  let changed = false
  if (heroIndex < 0) {
    const hero = createCaseBlock('hero')
    hero.content_ru.title = document.value.meta.name_ru || hero.content_ru.title
    hero.content_en.title = document.value.meta.name_en || hero.content_en.title
    hero.content_ru.subtitle = document.value.meta.subtitle_ru || document.value.meta.description_ru || ''
    hero.content_en.subtitle = document.value.meta.subtitle_en || document.value.meta.description_en || ''
    hero.content_ru.industry = document.value.meta.industry_ru || document.value.meta.type_ru || ''
    hero.content_en.industry = document.value.meta.industry_en || document.value.meta.type_en || ''
    hero.content_ru.year = document.value.meta.year || ''
    hero.content_en.year = document.value.meta.year || ''
    blocks.unshift(hero)
    heroIndex = 0
    changed = true
  }
  if (heroIndex > 0) {
    blocks.unshift(blocks.splice(heroIndex, 1)[0])
    changed = true
  }
  const hero = blocks[0]
  const previousSettings = JSON.stringify(hero.settings)
  if (!hero.is_visible) changed = true
  hero.is_visible = true
  Object.assign(hero.settings, {
    width: 'full',
    layout: 'case-header',
    desktop_span: 12,
    desktop_start: 0,
    tablet_span: 12,
    tablet_start: 0,
    mobile_span: 12,
    mobile_start: 0,
    hero_background: hero.settings.hero_background || caseHeroColorDefaults.background,
    hero_text: hero.settings.hero_text || caseHeroColorDefaults.text,
  })
  return changed || previousSettings !== JSON.stringify(hero.settings)
}
function normalizeOrder() { enforceMandatoryHero(); document.value?.blocks.forEach((block, index) => { block.sort_order = index }) }
function showNotice(type: 'success' | 'error', text: string) { notice.value = { type, text }; setTimeout(() => { if (notice.value?.text === text) notice.value = null }, 5000) }
async function openVersions() { if (!document.value) return; versionsOpen.value = true; versionsLoading.value = true; try { revisions.value = await listRevisions(document.value.id) } catch (cause) { showNotice('error', cause instanceof Error ? cause.message : 'Не удалось загрузить версии') } finally { versionsLoading.value = false } }
async function restoreVersion(revisionId: string) { if (!document.value || !confirm('Вернуть эту версию в черновик? Текущий черновик будет заменён.')) return; try { applying.value = true; document.value = await restoreRevision(document.value.id, revisionId); selectedId.value = document.value.blocks[0]?.id || null; dirty.value = false; versionsOpen.value = false; showNotice('success', 'Версия восстановлена в черновик') } catch (cause) { showNotice('error', cause instanceof Error ? cause.message : 'Не удалось восстановить версию') } finally { nextTick(() => { applying.value = false; captureHistory() }) } }
const formatVersionDate = (value: string) => new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
</script>

<style scoped>
.case-editor { height: 100vh; display: grid; grid-template: 64px minmax(0,1fr) / 248px minmax(420px,1fr) 318px; color-scheme: light; overflow: hidden; background: var(--studio-paper); }
.editor-topbar { grid-column: 1 / -1; z-index: 20; min-width: 0; display: grid; grid-template-columns: minmax(220px,1fr) auto auto minmax(360px,1fr); align-items: center; gap: 12px; padding: 0 14px; border-bottom: 1px solid #313947; color: white; background: var(--studio-ink); }
.editor-topbar button, .editor-topbar a { color: inherit; }
.editor-topbar__identity { min-width: 0; display: flex; align-items: center; gap: 11px; }.editor-topbar__identity > a { width: 31px; height: 31px; display: grid; place-items: center; border: 1px solid #394251; border-radius: 6px; text-decoration: none; }.editor-topbar__identity > div { min-width: 0; display: grid; }.editor-topbar__identity small { color: #8190a5; font: 8px var(--font-mono); }.editor-topbar__identity b { overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.editor-topbar__history, .editor-topbar__locale { display: flex; padding: 3px; border: 1px solid #394251; border-radius: 6px; }.editor-topbar__history button, .editor-topbar__locale button { min-width: 30px; height: 26px; border: 0; border-radius: 4px; background: transparent; cursor: pointer; }.editor-topbar button:disabled { opacity: .35; cursor: default; }.editor-topbar__locale button { color: #8290a4; font: 600 9px var(--font-mono); }.editor-topbar__locale button.active { color: white; background: #313a49; }
.editor-topbar__save { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }.editor-topbar__save > span { display: flex; align-items: center; gap: 6px; color: #8f9caf; font-size: 9px; }.editor-topbar__save > span i { width: 6px; height: 6px; border-radius: 50%; background: #5c6879; }.editor-topbar__save > span.dirty i { background: #ffbe3d; }.editor-topbar__save > span.saving i { background: #7ba0ff; animation: pulse 1s infinite; }.editor-topbar__save > span.saved i { background: #42c98b; }.editor-topbar__save a, .editor-topbar__save button { height: 34px; padding: 0 11px; display: grid; place-items: center; border: 1px solid #394251; border-radius: 6px; background: transparent; font-size: 10px; text-decoration: none; cursor: pointer; }.editor-topbar__save .publish-button { border-color: var(--studio-blue); background: var(--studio-blue); font-weight: 700; }.editor-topbar__save .hide-button { color: #b4becd; }
.editor-outline, .editor-inspector { min-height: 0; overflow-y: auto; background: white; }.editor-outline { border-right: 1px solid var(--studio-line); }.editor-inspector { border-left: 1px solid var(--studio-line); }
.outline-meta { width: calc(100% - 20px); margin: 12px 10px 7px; padding: 10px; display: grid; grid-template-columns: 28px 1fr; align-items: center; gap: 8px; border: 1px solid var(--studio-line); border-radius: 7px; background: #f7f8fa; text-align: left; cursor: pointer; }.outline-meta > span { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 5px; color: white; background: var(--studio-ink); }.outline-meta div, .outline-list div, .block-library div { min-width: 0; display: grid; }.outline-meta b, .outline-list b, .block-library b { font-size: 10px; }.outline-meta small, .outline-list small, .block-library small { overflow: hidden; color: var(--studio-muted); font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }.outline-meta.active { border-color: var(--studio-blue); background: var(--studio-blue-soft); }
.outline-heading { padding: 10px 14px 6px; display: flex; justify-content: space-between; color: var(--studio-muted); font: 600 8px var(--font-mono); letter-spacing: .09em; text-transform: uppercase; }
.outline-list { display: grid; padding: 0 8px; }.outline-list button { min-height: 43px; padding: 7px; display: grid; grid-template-columns: 25px 1fr auto; align-items: center; gap: 5px; border: 0; border-radius: 6px; background: transparent; text-align: left; cursor: pointer; }.outline-list button > span { color: #8a95a5; font: 8px var(--font-mono); }.outline-list button > i { color: #a3acb9; font-style: normal; }.outline-list button:hover { background: #f3f5f7; }.outline-list button.active { background: var(--studio-blue-soft); }.outline-list button.active > span { color: var(--studio-blue); }.outline-list button.muted { opacity: .45; }
.block-library { margin-top: 12px; padding: 5px 8px 24px; border-top: 1px solid var(--studio-line); }.block-library > button { width: 100%; min-height: 46px; padding: 7px; display: grid; grid-template-columns: 29px 1fr; align-items: center; gap: 8px; border: 0; border-radius: 6px; background: transparent; text-align: left; cursor: pointer; }.block-library > button:hover { background: #f1f4f7; }.block-library > button:disabled { opacity: .45; cursor: default; }.block-library > button:disabled:hover { background: transparent; }.block-library > button > span { width: 29px; height: 29px; display: grid; place-items: center; border: 1px solid #d5dbe4; border-radius: 5px; color: var(--studio-blue); font: 600 10px var(--font-mono); }
.editor-canvas { min-width: 0; min-height: 0; overflow: auto; background-color: #e8ebf0; background-image: radial-gradient(#c4cad3 0.75px, transparent .75px); background-size: 14px 14px; }.canvas-toolbar { position: sticky; top: 0; z-index: 10; height: 42px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #d3d8e0; background: rgba(244,246,248,.9); backdrop-filter: blur(8px); }.canvas-toolbar > span { display: flex; align-items: center; gap: 10px; color: #788396; }.canvas-toolbar > span b { font: 600 8px var(--font-mono); letter-spacing: .1em; }.canvas-toolbar > span small { font-size: 8px; }.canvas-toolbar > div { display: flex; }.canvas-toolbar button { height: 26px; padding: 0 9px; border: 0; border-radius: 4px; color: #788396; background: transparent; font-size: 9px; cursor: pointer; }.canvas-toolbar button.active { color: var(--studio-ink); background: white; box-shadow: 0 1px 4px rgba(18,23,34,.12); }
.canvas-sheet { width: min(100% - 46px, 920px); min-height: calc(100% - 90px); margin: 22px auto 48px; padding: 18px; display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); grid-auto-flow: row; align-content: start; gap: 10px; border: 1px solid #cbd1da; background-color: #f7f8fa; background-image: linear-gradient(90deg, rgba(40,100,240,.045) 1px, transparent 1px); background-size: calc(100% / 12) 100%; box-shadow: 0 20px 50px rgba(25,33,45,.12); }.canvas-sheet--tablet { width: min(720px, calc(100% - 34px)); }.canvas-sheet--mobile { width: min(390px, calc(100% - 28px)); }.canvas-add, .canvas-empty { grid-column: 1 / -1; }.canvas-add { min-height: 40px; border: 1px dashed #b9c1cd; border-radius: 5px; color: #7a8698; background: rgba(247,248,250,.9); cursor: pointer; }.canvas-add:hover { color: var(--studio-blue); border-color: var(--studio-blue); }.canvas-empty { min-height: 260px; display: grid; place-items: center; align-content: center; gap: 5px; color: var(--studio-muted); }.canvas-empty b { color: var(--studio-ink); }
.editor-loading { grid-column: 1 / -1; display: grid; place-items: center; align-content: center; gap: 15px; background: var(--studio-paper); }.editor-loading > span { width: 32px; height: 32px; border: 2px solid #d6dce5; border-top-color: var(--studio-blue); border-radius: 50%; animation: spin .8s linear infinite; }.editor-loading--error b { color: var(--studio-danger); }.editor-loading a { color: var(--studio-blue); }
.editor-notice { position: fixed; right: 20px; bottom: 20px; z-index: 120; min-width: 260px; padding: 13px 42px 13px 14px; border-radius: 7px; color: white; box-shadow: 0 14px 35px rgba(18,23,34,.24); }.editor-notice--success { background: var(--studio-green); }.editor-notice--error { background: var(--studio-danger); }.editor-notice button { position: absolute; right: 10px; border: 0; color: inherit; background: none; cursor: pointer; }
.version-backdrop { position: fixed; inset: 0; z-index: 130; display: grid; place-items: center; padding: 20px; background: rgba(10,14,20,.58); backdrop-filter: blur(4px); }.version-panel { width: min(100%,520px); max-height: min(680px,85vh); padding: 22px; overflow: auto; border-radius: 12px; color: var(--studio-ink); background: white; box-shadow: 0 30px 80px rgba(0,0,0,.3); }.version-panel > header { display: flex; align-items: start; justify-content: space-between; margin-bottom: 20px; }.version-panel header span { color: var(--studio-blue); font: 600 9px var(--font-mono); letter-spacing: .12em; }.version-panel h2 { margin: 5px 0 0; font-size: 23px; }.version-panel header button { width: 30px; height: 30px; border: 0; border-radius: 50%; background: #eef1f5; cursor: pointer; }.version-panel > p { padding: 30px 0; color: var(--studio-muted); text-align: center; }.version-panel article { padding: 13px 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 1px solid var(--studio-line); }.version-panel article div { display: grid; }.version-panel article small { color: var(--studio-muted); }.version-panel article button { padding: 8px 10px; border: 1px solid var(--studio-line); border-radius: 6px; color: var(--studio-blue); background: white; font-size: 10px; cursor: pointer; }
@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 50% { opacity: .3; } }
@media (max-width: 1180px) { .case-editor { grid-template-columns: 220px minmax(380px,1fr) 280px; }.editor-topbar { grid-template-columns: minmax(180px,1fr) auto auto minmax(300px,1fr); }.editor-topbar__save > span { display: none; } }
@media (max-width: 940px) { .case-editor { height: auto; min-height: calc(100vh - 58px); grid-template: 58px auto auto / 210px minmax(0,1fr); overflow: visible; }.editor-topbar { position: sticky; top: 58px; grid-template-columns: 1fr auto auto; }.editor-topbar__history { display: none; }.editor-topbar__save > a, .editor-topbar__save .hide-button { display: none; }.editor-outline { max-height: calc(100vh - 116px); position: sticky; top: 116px; }.editor-canvas { min-height: calc(100vh - 116px); }.editor-inspector { grid-column: 1 / -1; max-height: none; border-top: 1px solid var(--studio-line); border-left: 0; }.editor-inspector :deep(.inspector-form) { max-width: 680px; margin: auto; }.editor-loading { min-height: calc(100vh - 116px); } }
@media (max-width: 640px) { .case-editor { display: block; padding-top: 58px; }.editor-topbar { position: fixed; top: 58px; left: 0; right: 0; height: 58px; }.editor-topbar__locale { display: none; }.editor-topbar__identity small { display: none; }.editor-topbar__save .publish-button { padding: 0 8px; }.editor-outline { position: static; max-height: 44vh; padding-top: 8px; border-bottom: 1px solid var(--studio-line); }.block-library { display: grid; grid-template-columns: 1fr 1fr; }.block-library .outline-heading { grid-column: 1 / -1; }.editor-canvas { min-height: 70vh; }.canvas-sheet { width: calc(100% - 20px); margin-top: 10px; padding: 8px; }.editor-inspector { min-height: 60vh; } }
</style>
