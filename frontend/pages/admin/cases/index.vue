<template>
  <div class="cases-index">
    <header class="cases-index__header">
      <div>
        <span class="studio-kicker">CASE ASSEMBLY / {{ filteredCases.length }}</span>
        <h1>Кейсы</h1>
        <p>Собирайте историю проекта из блоков, проверяйте черновик и публикуйте одним действием.</p>
      </div>
      <button class="studio-primary" type="button" :disabled="creating" @click="createNewCase">
        {{ creating ? 'Создаём…' : '+ Новый кейс' }}
      </button>
    </header>

    <section class="cases-toolbar" aria-label="Фильтры кейсов">
      <label>
        <span>Поиск</span>
        <input v-model="search" type="search" placeholder="Название или slug" />
      </label>
      <div class="cases-toolbar__filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          :class="{ active: statusFilter === filter.value }"
          @click="statusFilter = filter.value"
        >
          {{ filter.label }} <small>{{ countByStatus(filter.value) }}</small>
        </button>
      </div>
    </section>

    <div v-if="loading" class="cases-state">Загружаем монтажный стол…</div>
    <div v-else-if="error" class="cases-state cases-state--error">
      <b>Не удалось загрузить кейсы</b><span>{{ error }}</span><button type="button" @click="loadCases">Повторить</button>
    </div>
    <div v-else-if="!filteredCases.length" class="cases-state">
      <b>{{ cases.length ? 'Ничего не найдено' : 'Пока нет ни одного кейса' }}</b>
      <span>{{ cases.length ? 'Измените поиск или фильтр.' : 'Создайте первый кейс и соберите его из блоков.' }}</span>
    </div>

    <section v-else class="case-list">
      <article v-for="(item, index) in filteredCases" :key="item.id" class="case-row">
        <NuxtLink class="case-row__cover" :to="`/admin/cases/${item.id}`">
          <img v-if="item.cover_image_url" :src="item.cover_image_url" alt="" />
          <span v-else>{{ String(index + 1).padStart(2, '0') }}</span>
        </NuxtLink>
        <div class="case-row__main">
          <div class="case-row__title">
            <span>{{ item.slug || 'slug не задан' }}</span>
            <h2>{{ item.name_ru || 'Без названия' }}</h2>
            <p>{{ item.name_en || 'English title is empty' }}</p>
          </div>
          <div class="case-row__state">
            <span :class="`status status--${item.status}`">{{ statusLabel(item.status) }}</span>
            <small v-if="item.has_unpublished_changes && item.status !== 'draft'">Есть новый черновик</small>
            <small v-else>Обновлён {{ formatDate(item.updated_at) }}</small>
          </div>
        </div>
        <div class="case-row__actions">
          <NuxtLink :to="`/admin/cases/${item.id}`">Редактировать</NuxtLink>
          <button type="button" @click="duplicate(item)">Дублировать</button>
          <a v-if="item.status === 'published' && item.slug" :href="`/cases/${item.slug}`" target="_blank" rel="noopener">На сайте ↗</a>
          <button class="danger" type="button" @click="remove(item)">Удалить</button>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { CaseStatus, CaseSummary } from '~/utils/caseBuilder'

definePageMeta({ layout: 'admin-layout' })
useHead({ title: 'Кейсы — VEZHA Studio' })

const router = useRouter()
const { listCases, createCase, duplicateCase, deleteCase } = useCaseAdmin()
const cases = ref<CaseSummary[]>([])
const loading = ref(true)
const creating = ref(false)
const error = ref('')
const search = ref('')
const statusFilter = ref<'all' | CaseStatus>('all')

const filters: Array<{ value: 'all' | CaseStatus; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'draft', label: 'Черновики' },
  { value: 'published', label: 'На сайте' },
  { value: 'hidden', label: 'Скрытые' },
]

const filteredCases = computed(() => {
  const query = search.value.trim().toLowerCase()
  return cases.value.filter(item => {
    const statusMatches = statusFilter.value === 'all' || item.status === statusFilter.value
    const queryMatches = !query || [item.name_ru, item.name_en, item.slug].some(value => value?.toLowerCase().includes(query))
    return statusMatches && queryMatches
  })
})

const countByStatus = (status: 'all' | CaseStatus) => status === 'all'
  ? cases.value.length
  : cases.value.filter(item => item.status === status).length

const statusLabel = (status: CaseStatus) => ({ draft: 'Черновик', published: 'Опубликован', hidden: 'Скрыт' }[status])
const formatDate = (value: string) => new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' }).format(new Date(value))

async function loadCases() {
  loading.value = true
  error.value = ''
  try { cases.value = await listCases() }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'Неизвестная ошибка' }
  finally { loading.value = false }
}

async function createNewCase() {
  creating.value = true
  try {
    const created = await createCase()
    await router.push(`/admin/cases/${created.id}`)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Не удалось создать кейс'
  } finally { creating.value = false }
}

async function duplicate(item: CaseSummary) {
  try {
    const created = await duplicateCase(item.id)
    await router.push(`/admin/cases/${created.id}`)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Не удалось дублировать кейс' }
}

async function remove(item: CaseSummary) {
  if (!confirm(`Удалить кейс «${item.name_ru || 'Без названия'}»? Это действие нельзя отменить.`)) return
  try {
    await deleteCase(item.id)
    cases.value = cases.value.filter(value => value.id !== item.id)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Не удалось удалить кейс' }
}

onMounted(loadCases)
</script>

<style scoped>
.cases-index { min-height: 100vh; padding: 46px clamp(24px, 4vw, 68px) 80px; overflow-y: auto; }
.cases-index__header { max-width: 1360px; margin: 0 auto 38px; display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; }
.studio-kicker { color: var(--studio-blue); font: 600 11px/1 var(--font-mono); letter-spacing: .12em; }
.cases-index h1 { margin: 12px 0 8px; font: 700 clamp(42px, 6vw, 82px)/.92 var(--font-epilepsy); letter-spacing: -.035em; }
.cases-index__header p { max-width: 620px; margin: 0; color: var(--studio-muted); font-size: 15px; }
.studio-primary { min-height: 46px; padding: 0 20px; border: 0; border-radius: 8px; color: white; background: var(--studio-blue); font-weight: 700; cursor: pointer; box-shadow: 0 10px 24px rgba(40,100,240,.2); }
.studio-primary:disabled { opacity: .6; }
.cases-toolbar { max-width: 1360px; margin: 0 auto 16px; padding: 12px; display: flex; align-items: end; justify-content: space-between; gap: 18px; border: 1px solid var(--studio-line); border-radius: 12px; background: rgba(255,255,255,.76); }
.cases-toolbar label { display: grid; gap: 5px; min-width: min(360px, 45vw); }
.cases-toolbar label span { color: var(--studio-muted); font: 600 9px var(--font-mono); letter-spacing: .1em; text-transform: uppercase; }
.cases-toolbar input { height: 38px; padding: 0 12px; border: 1px solid var(--studio-line); border-radius: 7px; background: white; color: var(--studio-ink); outline: none; }
.cases-toolbar input:focus { border-color: var(--studio-blue); box-shadow: 0 0 0 3px var(--studio-blue-soft); }
.cases-toolbar__filters { display: flex; gap: 4px; }
.cases-toolbar__filters button { height: 38px; padding: 0 12px; border: 0; border-radius: 7px; color: var(--studio-muted); background: transparent; cursor: pointer; }
.cases-toolbar__filters button.active { color: var(--studio-ink); background: var(--studio-blue-soft); }
.cases-toolbar__filters small { margin-left: 5px; font: 500 10px var(--font-mono); }
.case-list { max-width: 1360px; margin: 0 auto; display: grid; gap: 8px; }
.case-row { min-height: 116px; display: grid; grid-template-columns: 148px minmax(0, 1fr) auto; border: 1px solid var(--studio-line); border-radius: 12px; overflow: hidden; background: var(--studio-white); transition: border-color .18s, transform .18s; }
.case-row:hover { border-color: #b7c0ce; transform: translateY(-1px); }
.case-row__cover { position: relative; min-height: 116px; display: grid; place-items: center; overflow: hidden; color: #9aa4b4; background: #e9edf2; font: 600 28px var(--font-mono); text-decoration: none; }
.case-row__cover::after { content: ''; position: absolute; inset: 9px; border: 1px solid rgba(18,23,34,.12); pointer-events: none; }
.case-row__cover img { width: 100%; height: 100%; object-fit: cover; }
.case-row__main { padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; gap: 22px; }
.case-row__title > span { color: var(--studio-blue); font: 500 10px var(--font-mono); }
.case-row__title h2 { margin: 5px 0 1px; font: 700 22px/1.15 var(--font-ui); }
.case-row__title p { margin: 0; color: var(--studio-muted); font-size: 13px; }
.case-row__state { min-width: 145px; display: grid; justify-items: start; gap: 8px; }
.case-row__state small { color: var(--studio-muted); font-size: 11px; }
.status { padding: 5px 8px; border-radius: 5px; font: 600 9px var(--font-mono); letter-spacing: .06em; text-transform: uppercase; }
.status--draft { color: #725c00; background: #fff1b7; }
.status--published { color: #08784b; background: #dff8ec; }
.status--hidden { color: #5f6876; background: #e9edf2; }
.case-row__actions { width: 136px; padding: 15px 16px; display: grid; align-content: center; gap: 4px; border-left: 1px solid var(--studio-line); }
.case-row__actions a, .case-row__actions button { padding: 4px 0; border: 0; color: var(--studio-muted); background: none; font-size: 11px; text-align: left; text-decoration: none; cursor: pointer; }
.case-row__actions a:hover, .case-row__actions button:hover { color: var(--studio-blue); }
.case-row__actions .danger:hover { color: var(--studio-danger); }
.cases-state { max-width: 1360px; min-height: 300px; margin: 0 auto; display: grid; place-items: center; align-content: center; gap: 9px; border: 1px dashed #c4cbd6; border-radius: 12px; color: var(--studio-muted); background: rgba(255,255,255,.5); }
.cases-state b { color: var(--studio-ink); font-size: 18px; }
.cases-state button { border: 0; color: var(--studio-blue); background: none; cursor: pointer; }
.cases-state--error b { color: var(--studio-danger); }
@media (max-width: 900px) { .case-row { grid-template-columns: 110px 1fr; } .case-row__actions { grid-column: 1 / -1; width: auto; display: flex; gap: 16px; border-top: 1px solid var(--studio-line); border-left: 0; } .case-row__main { align-items: flex-start; } }
@media (max-width: 660px) { .cases-index { padding: 28px 14px 60px; } .cases-index__header { align-items: stretch; flex-direction: column; } .cases-toolbar { align-items: stretch; flex-direction: column; } .cases-toolbar label { min-width: 0; } .cases-toolbar__filters { overflow-x: auto; } .case-row { grid-template-columns: 82px 1fr; } .case-row__main { padding: 15px; flex-direction: column; gap: 12px; } .case-row__state { min-width: 0; } }
</style>
