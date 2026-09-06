export interface CaseTechnology {
  id?: string
  label?: string
  category?: string
  group?: string
  description?: string
  icon?: string
  related_ids?: string[]
  x?: number | null
  y?: number | null
}

export const technologyIcons = [
  { value: 'blocks', label: 'Компонент' },
  { value: 'python', label: 'Python' },
  { value: 'flask', label: 'Flask' },
  { value: 'docker', label: 'Docker' },
  { value: 'gunicorn', label: 'Gunicorn' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'googlesheets', label: 'Google Sheets' },
  { value: 'googleappsscript', label: 'Google Apps Script' },
  { value: 'nodedotjs', label: 'Node.js' },
  { value: 'scan-text', label: 'Распознавание текста' },
  { value: 'image', label: 'Изображение' },
  { value: 'monitor', label: 'Веб-интерфейс' },
  { value: 'cloud', label: 'Облачное хранилище' },
  { value: 'plug', label: 'Интеграция / API' },
  { value: 'message-circle', label: 'Мессенджер' },
  { value: 'messages-square', label: 'История чатов' },
  { value: 'file-json', label: 'JSON' },
  { value: 'file-code', label: 'Обработка данных' },
  { value: 'list-checks', label: 'Сверка' },
  { value: 'calculator', label: 'Расчёт' },
  { value: 'key-round', label: 'Настройки доступа' },
  { value: 'lock-keyhole', label: 'Блокировка' },
  { value: 'network', label: 'Рабочие связи' },
] as const

const iconNames = new Set<string>(technologyIcons.map(icon => icon.value))
export function technologyIconPath(name?: string) {
  return `/icons/technology/${name && iconNames.has(name) ? name : 'blocks'}.svg`
}
export function technologyId(item: CaseTechnology, index: number) {
  return item.id || `technology-${index}`
}
export function technologyGroups(items: CaseTechnology[], fallback: string) {
  const groups = new Map<string, Array<CaseTechnology & { id: string }>>()
  items.forEach((item, index) => {
    const group = item.group?.trim() || fallback
    if (!groups.has(group)) groups.set(group, [])
    groups.get(group)!.push({ ...item, id: technologyId(item, index) })
  })
  return Array.from(groups, ([label, nodes]) => ({ label, nodes }))
}
export function relatedTechnologies(items: CaseTechnology[], active: CaseTechnology) {
  const ids = new Set(active.related_ids || [])
  return items.filter((item, index) => ids.has(technologyId(item, index)) && item !== active)
}
