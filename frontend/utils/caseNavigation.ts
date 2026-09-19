import type { IProjects } from './interfaces/IProjects'

export function selectRelatedCases(projects: IProjects[], content: Record<string, any>, currentSlug = ''): IProjects[] {
  const seen = new Set<string>()
  const available = projects.filter(project => {
    if (!project.slug || project.slug === currentSlug || seen.has(project.slug)) return false
    seen.add(project.slug)
    return true
  })
  const requested = Array.isArray(content.case_slugs) ? content.case_slugs : content.case_slug ? [content.case_slug] : []
  if (requested.length) {
    return [...new Set<string>(requested)].map(slug => available.find(project => project.slug === slug)).filter((project): project is IProjects => Boolean(project)).slice(0, 3)
  }
  return [...available].sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order).slice(0, 3)
}
