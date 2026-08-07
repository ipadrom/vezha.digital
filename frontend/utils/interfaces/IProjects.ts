export interface IProjectMetric {
  value: string
  label: string
  context?: string | null
  sort_order: number
  is_demo?: boolean
}

export interface IProjectGalleryItem {
  image_url: string
  alt: string
  caption?: string | null
  sort_order: number
}

export interface IProjectTechnology {
  label: string
  category: string
  sort_order: number
}

export interface IProjectBlock {
  id: string
  type: import('~/utils/caseBuilder').CaseBlockType
  content: Record<string, any>
  settings: import('~/utils/caseBuilder').CaseBlockSettings
  sort_order: number
}

export interface IProjects {
  id: string
  slug: string | null
  type: string
  name: string
  subtitle?: string | null
  industry?: string | null
  description?: string | null
  image_url?: string | null
  cover_image_url?: string | null
  project_url?: string | null
  hero_metric_value?: string | null
  hero_metric_label?: string | null
  is_featured: boolean
  sort_order: number
  metrics: IProjectMetric[]
}

export interface IProjectDetail extends IProjects {
  year?: string | null
  timeline?: string | null
  challenge?: string | null
  solution?: string | null
  result_summary?: string | null
  testimonial?: string | null
  testimonial_author?: string | null
  gallery: IProjectGalleryItem[]
  technologies: IProjectTechnology[]
  blocks: IProjectBlock[]
  seo_title?: string | null
  seo_description?: string | null
  seo_image_url?: string | null
  seo_noindex?: boolean
}
