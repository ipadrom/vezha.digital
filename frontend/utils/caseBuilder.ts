export type CaseLocale = 'ru' | 'en'
export type CaseStatus = 'draft' | 'published' | 'hidden'
export type CaseBlockType =
  | 'hero'
  | 'text'
  | 'challenge_solution'
  | 'image'
  | 'image_text'
  | 'gallery'
  | 'metrics'
  | 'process'
  | 'quote'
  | 'technologies'
  | 'video'
  | 'comparison'
  | 'results'
  | 'next_case'

export interface CaseMeta {
  slug: string
  name_ru: string
  name_en: string
  type_ru: string
  type_en: string
  description_ru: string
  description_en: string
  subtitle_ru: string
  subtitle_en: string
  industry_ru: string
  industry_en: string
  year: string
  timeline_ru: string
  timeline_en: string
  image_url: string
  cover_image_url: string
  project_url: string
  hero_metric_value: string
  hero_metric_label_ru: string
  hero_metric_label_en: string
  is_featured: boolean
  sort_order: number
  seo_title_ru: string
  seo_title_en: string
  seo_description_ru: string
  seo_description_en: string
  seo_image_url: string
  seo_noindex: boolean
}

export interface CaseBlockSettings {
  theme: 'paper' | 'soft' | 'ink' | 'signal'
  width: 'standard' | 'wide' | 'full'
  spacing: 'compact' | 'normal' | 'large'
  layout: string
  alignment: 'left' | 'center' | 'right'
  desktop_span: number
  desktop_start: number
  tablet_span: number
  tablet_start: number
  mobile_span: number
  mobile_start: number
  [key: string]: unknown
}

export interface CaseBlock {
  id: string
  type: CaseBlockType
  content_ru: Record<string, any>
  content_en: Record<string, any>
  settings: CaseBlockSettings
  sort_order: number
  is_visible: boolean
}

export interface CaseContentEdit {
  path: Array<string | number>
  value: string | number
}

export const technologyMapColorDefaults = {
  accent: '#806eff',
  background: '#121419',
  text: '#f4f6fa',
} as const

export const normalizeHexColor = (value: unknown, fallback: string) => {
  const color = String(value || '').trim()
  return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : fallback
}

const hexToRgb = (value: string) => {
  const color = value.slice(1)
  return `${Number.parseInt(color.slice(0, 2), 16)}, ${Number.parseInt(color.slice(2, 4), 16)}, ${Number.parseInt(color.slice(4, 6), 16)}`
}

export const technologyMapStyle = (settings: Record<string, unknown>): Record<string, string> => {
  const accent = normalizeHexColor(settings.map_accent, technologyMapColorDefaults.accent)
  const background = normalizeHexColor(settings.map_background, technologyMapColorDefaults.background)
  const text = normalizeHexColor(settings.map_text, technologyMapColorDefaults.text)
  return {
    '--tech-map-accent': accent,
    '--tech-map-accent-rgb': hexToRgb(accent),
    '--tech-map-background': background,
    '--tech-map-text': text,
    '--tech-map-text-rgb': hexToRgb(text),
  }
}

export interface CaseDocument {
  id: string
  status: CaseStatus
  meta: CaseMeta
  blocks: CaseBlock[]
  has_unpublished_changes: boolean
  published_at: string | null
  updated_at: string
}

export interface CaseSummary {
  id: string
  slug: string
  name_ru: string
  name_en: string
  cover_image_url: string
  status: CaseStatus
  is_featured: boolean
  sort_order: number
  has_unpublished_changes: boolean
  published_at: string | null
  updated_at: string
}

export interface MediaAsset {
  id: string
  url: string
  filename: string
  content_type: string
  size: number
  alt_ru?: string | null
  alt_en?: string | null
  created_at: string
}

export interface CaseRevision {
  id: string
  version: number
  created_at: string
}

export interface PublicBuilderBlock {
  id: string
  type: CaseBlockType
  content: Record<string, any>
  settings: CaseBlockSettings
  sort_order: number
}

export const blockLibrary: Array<{
  type: CaseBlockType
  label: string
  description: string
  mark: string
}> = [
  { type: 'hero', label: 'Обложка', description: 'Первый экран и ключевая метрика', mark: 'H' },
  { type: 'text', label: 'Текст', description: 'Заголовок и повествование', mark: 'T' },
  { type: 'challenge_solution', label: 'Задача и решение', description: 'Две связанные главы', mark: '2' },
  { type: 'image', label: 'Изображение', description: 'Один крупный визуал', mark: '□' },
  { type: 'image_text', label: 'Текст + изображение', description: 'Редакционная композиция', mark: '▤' },
  { type: 'gallery', label: 'Галерея', description: 'Сетка или мозаика', mark: '▦' },
  { type: 'metrics', label: 'Метрики', description: 'Цифры и доказательства', mark: '%' },
  { type: 'process', label: 'Этапы', description: 'Последовательность работы', mark: '→' },
  { type: 'quote', label: 'Цитата', description: 'Отзыв клиента', mark: '“' },
  { type: 'technologies', label: 'Технологии', description: 'Стек и интеграции', mark: '</>' },
  { type: 'video', label: 'Видео', description: 'Демонстрация продукта', mark: '▶' },
  { type: 'comparison', label: 'До / после', description: 'Сравнение двух состояний', mark: '↔' },
  { type: 'results', label: 'Итог', description: 'Вывод и ссылка на продукт', mark: '✓' },
  { type: 'next_case', label: 'Следующий кейс', description: 'Переход или заявка', mark: '↗' },
]

const localizedDefaults: Record<CaseBlockType, [Record<string, any>, Record<string, any>]> = {
  hero: [
    { eyebrow: 'Кейс', title: 'Название проекта', subtitle: '', type_label: '', industry: '', timeline: '', year: '', image_url: '', image_alt: '', device_screen_url: '', metric_value: '', metric_label: '' },
    { eyebrow: 'Case', title: 'Project name', subtitle: '', type_label: '', industry: '', timeline: '', year: '', image_url: '', image_alt: '', device_screen_url: '', metric_value: '', metric_label: '' },
  ],
  text: [
    { eyebrow: 'Контекст', title: 'Заголовок раздела', body: '' },
    { eyebrow: 'Context', title: 'Section title', body: '' },
  ],
  challenge_solution: [
    { eyebrow: 'История', title: 'От задачи к решению', challenge_label: 'Задача', challenge: '', solution_label: 'Решение', solution: '' },
    { eyebrow: 'Story', title: 'From challenge to solution', challenge_label: 'Challenge', challenge: '', solution_label: 'Solution', solution: '' },
  ],
  image: [
    { image_url: '', alt: '', caption: '' },
    { image_url: '', alt: '', caption: '' },
  ],
  image_text: [
    { eyebrow: 'Детали', title: 'Заголовок раздела', body: '', image_url: '', alt: '', caption: '' },
    { eyebrow: 'Details', title: 'Section title', body: '', image_url: '', alt: '', caption: '' },
  ],
  gallery: [
    { eyebrow: 'Интерфейс', title: 'Продукт в деталях', items: [] },
    { eyebrow: 'Interface', title: 'Product in detail', items: [] },
  ],
  metrics: [
    { eyebrow: 'Результат', title: 'Что изменилось', summary: '', items: [] },
    { eyebrow: 'Result', title: 'What changed', summary: '', items: [] },
  ],
  process: [
    { eyebrow: 'Процесс', title: 'Как мы работали', items: [] },
    { eyebrow: 'Process', title: 'How we worked', items: [] },
  ],
  quote: [
    { quote: '', author: '', role: '', logo_url: '' },
    { quote: '', author: '', role: '', logo_url: '' },
  ],
  technologies: [
    {
      eyebrow: 'Техническая карта',
      title: 'PRODUCT / WEB / API',
      summary: '',
      items: [
        { label: 'Vue 3 + Nuxt', category: 'Client', x: 18, y: 20 },
        { label: 'PWA / Local-first', category: 'Client', x: 30, y: 78 },
        { label: 'Sound + Vibration', category: 'Device', x: 82, y: 20 },
        { label: 'Wake Lock', category: 'Device', x: 70, y: 78 },
        { label: 'Open Data API', category: 'Data', x: 25, y: 48 },
        { label: 'Docker', category: 'Delivery', x: 78, y: 48 },
      ],
    },
    {
      eyebrow: 'Technical map',
      title: 'PRODUCT / WEB / API',
      summary: '',
      items: [
        { label: 'Vue 3 + Nuxt', category: 'Client', x: 18, y: 20 },
        { label: 'PWA / Local-first', category: 'Client', x: 30, y: 78 },
        { label: 'Sound + Vibration', category: 'Device', x: 82, y: 20 },
        { label: 'Wake Lock', category: 'Device', x: 70, y: 78 },
        { label: 'Open Data API', category: 'Data', x: 25, y: 48 },
        { label: 'Docker', category: 'Delivery', x: 78, y: 48 },
      ],
    },
  ],
  video: [
    { eyebrow: 'Демонстрация', title: 'Продукт в действии', video_url: '', poster_url: '', caption: '' },
    { eyebrow: 'Demo', title: 'Product in action', video_url: '', poster_url: '', caption: '' },
  ],
  comparison: [
    { eyebrow: 'Сравнение', title: 'До и после', before_url: '', before_alt: '', before_label: 'До', after_url: '', after_alt: '', after_label: 'После' },
    { eyebrow: 'Comparison', title: 'Before and after', before_url: '', before_alt: '', before_label: 'Before', after_url: '', after_alt: '', after_label: 'After' },
  ],
  results: [
    { eyebrow: 'Итог', title: 'Результат проекта', body: '', link_url: '', link_label: 'Открыть продукт' },
    { eyebrow: 'Outcome', title: 'Project result', body: '', link_url: '', link_label: 'Open product' },
  ],
  next_case: [
    { eyebrow: 'Дальше', title: 'Следующий кейс', case_slug: '', cta_label: 'Открыть' },
    { eyebrow: 'Next', title: 'Next case', case_slug: '', cta_label: 'Open' },
  ],
}

const newId = () => import.meta.client && 'randomUUID' in crypto
  ? crypto.randomUUID()
  : `block-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const createCaseBlock = (type: CaseBlockType): CaseBlock => {
  const defaults = localizedDefaults[type]
  return {
    id: newId(),
    type,
    content_ru: structuredClone(defaults[0]),
    content_en: structuredClone(defaults[1]),
    settings: {
      theme: ['metrics', 'technologies'].includes(type) ? 'ink' : type === 'next_case' ? 'signal' : 'paper',
      width: ['hero', 'gallery', 'metrics', 'technologies', 'next_case'].includes(type) ? 'wide' : 'standard',
      spacing: ['hero', 'next_case'].includes(type) ? 'large' : type === 'technologies' ? 'compact' : 'normal',
      layout: type === 'gallery' ? 'mosaic' : type === 'technologies' ? 'map' : 'default',
      alignment: 'left',
      desktop_span: 12,
      desktop_start: 0,
      tablet_span: 12,
      tablet_start: 0,
      mobile_span: 12,
      mobile_start: 0,
      ...(type === 'technologies' ? {
        map_accent: technologyMapColorDefaults.accent,
        map_background: technologyMapColorDefaults.background,
        map_text: technologyMapColorDefaults.text,
      } : {}),
    },
    sort_order: 0,
    is_visible: true,
  }
}

export const blockLabel = (type: CaseBlockType) => blockLibrary.find(item => item.type === type)?.label || type

export const blockTitle = (block: CaseBlock, locale: CaseLocale) => {
  const content = locale === 'ru' ? block.content_ru : block.content_en
  return content.title || content.eyebrow || blockLabel(block.type)
}

export const localizedBlocks = (blocks: CaseBlock[], locale: CaseLocale): PublicBuilderBlock[] => blocks
  .filter(block => block.is_visible)
  .map(block => ({
    id: block.id,
    type: block.type,
    content: locale === 'ru' ? block.content_ru : block.content_en,
    settings: block.settings,
    sort_order: block.sort_order,
  }))

export const slugifyCase = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/[\s_]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '')

export const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
