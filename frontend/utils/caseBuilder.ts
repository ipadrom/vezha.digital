export type CaseLocale = 'ru' | 'en'
export type CaseStatus = 'draft' | 'published' | 'hidden'
export type CaseBlockType =
  | 'hero'
  | 'media_hero'
  | 'text'
  | 'challenge_solution'
  | 'insight'
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
  | 'custom'

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
  surface: 'card' | 'plain'
  width: 'standard' | 'wide' | 'full'
  spacing: 'compact' | 'normal' | 'large'
  layout: string
  alignment: 'left' | 'center' | 'right'
  disclosure_mode?: 'single' | 'multiple'
  open_first?: boolean
  show_intro?: boolean
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

export type CaseElementType = 'eyebrow' | 'heading' | 'text' | 'image' | 'video' | 'button' | 'metric'
export type CaseViewport = 'desktop' | 'tablet' | 'mobile'

export interface CaseElementBox {
  x: number
  y: number
  w: number
  h: number
}

export interface CaseFreeformElement {
  id: string
  type: CaseElementType
  text?: string
  label?: string
  value?: string
  url?: string
  alt?: string
  href?: string
  poster?: string
  desktop: CaseElementBox
  tablet: CaseElementBox
  mobile: CaseElementBox
  [key: string]: unknown
}

export const technologyMapColorDefaults = {
  accent: '#8170f5',
  background: '#f5f6fb',
  text: '#17191f',
} as const

export const caseHeroColorDefaults = {
  background: '#1c1c1c',
  text: '#f7f7f5',
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
  { type: 'media_hero', label: 'Медиа-хиро', description: 'Фото или видео на всю ширину', mark: '◫' },
  { type: 'text', label: 'Редакционная глава', description: 'Заголовок слева, текст и теги справа', mark: 'T' },
  { type: 'challenge_solution', label: 'Задача и решение', description: 'Две связанные главы', mark: '2' },
  { type: 'insight', label: 'Ключевое решение', description: 'Решение, аргумент и эффект', mark: '!' },
  { type: 'image', label: 'Крупное медиа', description: 'Полноразмерное фото или GIF между главами', mark: '□' },
  { type: 'image_text', label: 'Текст + изображение', description: 'Редакционная композиция', mark: '▤' },
  { type: 'metrics', label: 'Показатели', description: 'Карточки с числами и контекстом', mark: '%' },
  { type: 'process', label: 'Раскрывающаяся глава', description: 'Нумерованные решения с медиа и результатами', mark: '→' },
  { type: 'quote', label: 'Цитата', description: 'Отзыв клиента', mark: '“' },
  { type: 'technologies', label: 'Технологии', description: 'Стек и интеграции', mark: '</>' },
  { type: 'video', label: 'Видео', description: 'Демонстрация продукта', mark: '▶' },
  { type: 'comparison', label: 'До / после', description: 'Сравнение двух состояний', mark: '↔' },
  { type: 'results', label: 'Итог', description: 'Вывод и ссылка на продукт', mark: '✓' },
  { type: 'next_case', label: 'Следующий кейс', description: 'Переход или заявка', mark: '↗' },
  { type: 'custom', label: 'Свободный блок', description: 'Композиция из отдельных элементов', mark: '✦' },
]

const localizedDefaults: Record<CaseBlockType, [Record<string, any>, Record<string, any>]> = {
  hero: [
    { logo_url: '', eyebrow: 'Кейс', title: 'Название проекта', subtitle: '', type_label: '', industry: '', timeline: '', year: '', image_url: '', image_alt: '', device_screen_url: '', metric_value: '', metric_label: '' },
    { logo_url: '', eyebrow: 'Case', title: 'Project name', subtitle: '', type_label: '', industry: '', timeline: '', year: '', image_url: '', image_alt: '', device_screen_url: '', metric_value: '', metric_label: '' },
  ],
  media_hero: [
    { image_url: '', video_url: '', poster_url: '', alt: '', caption: '', autoplay: true, loop: true, muted: true, controls: false },
    { image_url: '', video_url: '', poster_url: '', alt: '', caption: '', autoplay: true, loop: true, muted: true, controls: false },
  ],
  text: [
    { kicker: '', eyebrow: 'Контекст', title: 'Ключевой тезис раздела', body: '', tags: [] },
    { kicker: '', eyebrow: 'Context', title: 'Key section statement', body: '', tags: [] },
  ],
  challenge_solution: [
    { eyebrow: 'История', title: 'От задачи к решению', challenge_label: 'Задача', challenge: '', solution_label: 'Решение', solution: '', impact_label: 'Эффект', impact: '' },
    { eyebrow: 'Story', title: 'From challenge to solution', challenge_label: 'Challenge', challenge: '', solution_label: 'Solution', solution: '', impact_label: 'Impact', impact: '' },
  ],
  insight: [
    { eyebrow: 'Ключевое решение', title: 'Сформулируйте главное решение', statement: '', rationale_label: 'Почему', rationale: '', outcome_label: 'Что изменилось', outcome: '', image_url: '', image_alt: '' },
    { eyebrow: 'Key decision', title: 'State the defining decision', statement: '', rationale_label: 'Why', rationale: '', outcome_label: 'Outcome', outcome: '', image_url: '', image_alt: '' },
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
    { eyebrow: 'Процесс', title: 'Как мы работали', summary: '', items: [{ title: 'Первый этап', description: '', image_url: '', image_alt: '', video_url: '', poster_url: '', media_size: 'medium', tags: [] }] },
    { eyebrow: 'Process', title: 'How we worked', summary: '', items: [{ title: 'First stage', description: '', image_url: '', image_alt: '', video_url: '', poster_url: '', media_size: 'medium', tags: [] }] },
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
    { eyebrow: 'Итог', title: 'Результат проекта', body: '', items: [], link_url: '', link_label: 'Открыть продукт' },
    { eyebrow: 'Outcome', title: 'Project result', body: '', items: [], link_url: '', link_label: 'Open product' },
  ],
  next_case: [
    { eyebrow: 'Дальше', title: 'Следующий кейс', case_slug: '', cta_label: 'Открыть' },
    { eyebrow: 'Next', title: 'Next case', case_slug: '', cta_label: 'Open' },
  ],
  custom: [
    { title: 'Свободный блок', elements: [] },
    { title: 'Freeform block', elements: [] },
  ],
}

const newId = () => import.meta.client && 'randomUUID' in crypto
  ? crypto.randomUUID()
  : `block-${Date.now()}-${Math.random().toString(16).slice(2)}`

export const createCaseElementId = () => `element-${Date.now()}-${Math.random().toString(16).slice(2)}`

const elementGeometry = (type: CaseElementType, index = 0): Pick<CaseFreeformElement, CaseViewport> => {
  const offset = Math.min(index, 4)
  const desktopByType: Record<CaseElementType, CaseElementBox> = {
    eyebrow: { x: 5, y: 8 + offset * 8, w: 42, h: 7 },
    heading: { x: 5, y: 18 + offset * 22, w: 44, h: 24 },
    text: { x: 5, y: 47 + offset * 17, w: 42, h: 15 },
    image: { x: 53, y: 8 + offset * 42, w: 42, h: 38 },
    video: { x: 53, y: 8 + offset * 42, w: 42, h: 38 },
    button: { x: 5, y: 82 - offset * 12, w: 25, h: 9 },
    metric: { x: 73 - offset * 25, y: 72, w: 22, h: 19 },
  }
  const mobileByType: Record<CaseElementType, CaseElementBox> = {
    eyebrow: { x: 5, y: 5 + offset * 8, w: 90, h: 6 },
    heading: { x: 5, y: 14 + offset * 14, w: 90, h: 15 },
    text: { x: 5, y: 33 + offset * 13, w: 90, h: 11 },
    image: { x: 5, y: 51 + offset * 29, w: 90, h: 26 },
    video: { x: 5, y: 51 + offset * 29, w: 90, h: 26 },
    button: { x: 5, y: 91 - offset * 10, w: 48, h: 7 },
    metric: { x: 55 - offset * 50, y: 80, w: 40, h: 13 },
  }
  const desktop = desktopByType[type]
  const mobile = mobileByType[type]
  return {
    desktop,
    tablet: { ...desktop, x: desktop.x === 53 ? 52 : desktop.x, w: desktop.w === 42 ? 43 : desktop.w },
    mobile,
  }
}

export const createCaseElement = (type: CaseElementType, index = 0): CaseFreeformElement => ({
  id: createCaseElementId(),
  type,
  ...(type === 'eyebrow' ? { text: 'Метка' } : {}),
  ...(type === 'heading' ? { text: 'Новый заголовок' } : {}),
  ...(type === 'text' ? { text: 'Введите текст' } : {}),
  ...(type === 'image' ? { url: '', alt: '' } : {}),
  ...(type === 'video' ? { url: '', poster: '' } : {}),
  ...(type === 'button' ? { text: 'Открыть', href: '' } : {}),
  ...(type === 'metric' ? { value: '100%', label: 'Результат' } : {}),
  ...elementGeometry(type, index),
})

const pairedElement = (
  type: CaseElementType,
  index: number,
  ru: Partial<CaseFreeformElement>,
  en: Partial<CaseFreeformElement>,
): [CaseFreeformElement, CaseFreeformElement] => {
  const base = createCaseElement(type, index)
  return [{ ...structuredClone(base), ...ru }, { ...structuredClone(base), ...en }]
}

export const convertBlockToFreeform = (block: CaseBlock): CaseBlock => {
  if (block.settings.layout === 'freeform') return deepClone(block)
  const ru = block.content_ru || {}
  const en = block.content_en || {}
  const ruElements: CaseFreeformElement[] = []
  const enElements: CaseFreeformElement[] = []
  const add = (type: CaseElementType, ruValue: Partial<CaseFreeformElement>, enValue: Partial<CaseFreeformElement>) => {
    const occurrence = ruElements.filter(item => item.type === type).length
    const [ruElement, enElement] = pairedElement(type, occurrence, ruValue, enValue)
    ruElements.push(ruElement)
    enElements.push(enElement)
  }
  const addText = (type: CaseElementType, key: string) => {
    if (ru[key] || en[key]) add(type, { text: String(ru[key] || '') }, { text: String(en[key] || '') })
  }

  addText('eyebrow', 'eyebrow')
  addText('heading', 'title')
  for (const key of ['subtitle', 'body', 'summary', 'challenge', 'solution', 'impact', 'statement', 'rationale', 'outcome', 'quote']) addText('text', key)

  const imagePairs = [
    ['image_url', block.type === 'media_hero' ? 'alt' : 'image_alt'],
    ['before_url', 'before_alt'],
    ['after_url', 'after_alt'],
  ]
  for (const [urlKey, altKey] of imagePairs) {
    if (ru[urlKey] || en[urlKey]) add('image', { url: ru[urlKey] || '', alt: ru[altKey] || '' }, { url: en[urlKey] || '', alt: en[altKey] || '' })
  }
  if (ru.device_screen_url || en.device_screen_url) {
    const screenGeometry = {
      desktop: { x: 71, y: 12, w: 6, h: 29 },
      tablet: { x: 70, y: 12, w: 7, h: 29 },
      mobile: { x: 44, y: 54, w: 13, h: 19 },
    }
    add('image', { url: ru.device_screen_url || '', alt: '', ...screenGeometry }, { url: en.device_screen_url || '', alt: '', ...screenGeometry })
  }
  if (ru.video_url || en.video_url) add('video', { url: ru.video_url || '', poster: ru.poster_url || '' }, { url: en.video_url || '', poster: en.poster_url || '' })
  const ruItems = Array.isArray(ru.items) ? ru.items : []
  const enItems = Array.isArray(en.items) ? en.items : []
  ruItems.forEach((item: Record<string, any>, index: number) => {
    const translated = enItems[index] || {}
    if (item.video_url || translated.video_url) add('video', { url: item.video_url || '', poster: item.poster_url || '' }, { url: translated.video_url || '', poster: translated.poster_url || '' })
    else if (item.image_url || translated.image_url) add('image', { url: item.image_url || '', alt: item.image_alt || item.alt || '' }, { url: translated.image_url || '', alt: translated.image_alt || translated.alt || '' })
    else if (item.value || translated.value) add('metric', { value: item.value || '', label: item.label || '' }, { value: translated.value || '', label: translated.label || '' })
    else if (item.title || item.label || translated.title || translated.label) add('text', { text: item.title || item.label || '' }, { text: translated.title || translated.label || '' })
  })
  if (ru.metric_value || en.metric_value) add('metric', { value: ru.metric_value || '', label: ru.metric_label || '' }, { value: en.metric_value || '', label: en.metric_label || '' })
  if (ru.link_url || en.link_url) add('button', { text: ru.link_label || '', href: ru.link_url || '' }, { text: en.link_label || '', href: en.link_url || '' })
  if (block.type === 'next_case') add('button', { text: ru.cta_label || 'Открыть', href: ru.case_slug ? `/cases/${ru.case_slug}` : '' }, { text: en.cta_label || 'Open', href: en.case_slug ? `/cases/${en.case_slug}` : '' })

  return {
    ...deepClone(block),
    content_ru: { ...ru, elements: ruElements },
    content_en: { ...en, elements: enElements },
    settings: {
      ...block.settings,
      layout: 'freeform',
      freeform_height_desktop: 620,
      freeform_height_tablet: 560,
      freeform_height_mobile: 720,
    },
  }
}

export const createCaseBlock = (type: CaseBlockType): CaseBlock => {
  const defaults = localizedDefaults[type]
  return {
    id: newId(),
    type,
    content_ru: structuredClone(defaults[0]),
    content_en: structuredClone(defaults[1]),
    settings: {
      theme: ['hero', 'media_hero', 'insight'].includes(type) ? 'ink' : type === 'technologies' ? 'soft' : type === 'next_case' ? 'signal' : 'paper',
      surface: ['text', 'image', 'metrics', 'challenge_solution', 'process', 'results'].includes(type) ? 'plain' : 'card',
      width: type === 'hero' ? 'full' : ['media_hero', 'text', 'image', 'gallery', 'metrics', 'process', 'results', 'technologies', 'next_case', 'insight'].includes(type) ? 'wide' : 'standard',
      spacing: ['hero', 'text', 'process', 'results', 'next_case', 'insight'].includes(type) ? 'large' : ['image', 'technologies', 'media_hero'].includes(type) ? 'compact' : 'normal',
      layout: type === 'hero' ? 'case-header' : type === 'custom' ? 'freeform' : type === 'gallery' ? 'mosaic' : type === 'technologies' ? 'map' : type === 'media_hero' ? 'media-16x9' : type === 'text' ? 'editorial' : type === 'metrics' ? 'cards' : type === 'challenge_solution' ? 'narrative' : type === 'process' ? 'chapter' : type === 'insight' || type === 'results' ? 'statement' : 'default',
      alignment: 'left',
      desktop_span: 12,
      desktop_start: 0,
      tablet_span: 12,
      tablet_start: 0,
      mobile_span: 12,
      mobile_start: 0,
      ...(type === 'hero' ? {
        hero_background: caseHeroColorDefaults.background,
        hero_text: caseHeroColorDefaults.text,
      } : {}),
      ...(type === 'custom' ? {
        freeform_height_desktop: 620,
        freeform_height_tablet: 560,
        freeform_height_mobile: 720,
      } : {}),
      ...(type === 'technologies' ? {
        map_accent: technologyMapColorDefaults.accent,
        map_background: technologyMapColorDefaults.background,
        map_text: technologyMapColorDefaults.text,
      } : {}),
      ...(type === 'process' ? {
        disclosure_mode: 'multiple',
        open_first: false,
      } : {}),
      ...(type === 'metrics' ? {
        show_intro: true,
      } : {}),
    },
    sort_order: 0,
    is_visible: true,
  }
}

export const blockLabel = (type: CaseBlockType) => blockLibrary.find(item => item.type === type)?.label || type

export const blockTitle = (block: CaseBlock, locale: CaseLocale) => {
  const content = locale === 'ru' ? block.content_ru : block.content_en
  return content.title || content.eyebrow || content.caption || blockLabel(block.type)
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
