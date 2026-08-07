from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.case_builder import CaseBlockPublic


class ProjectMetricInput(BaseModel):
    value: str
    label_ru: str
    label_en: str
    context_ru: str | None = None
    context_en: str | None = None
    sort_order: int = 0


class ProjectGalleryInput(BaseModel):
    image_url: str
    alt_ru: str
    alt_en: str
    caption_ru: str | None = None
    caption_en: str | None = None
    sort_order: int = 0


class ProjectTechnologyInput(BaseModel):
    label: str
    category: str = "stack"
    sort_order: int = 0


class ProjectBase(BaseModel):
    type_ru: str
    type_en: str
    name_ru: str
    name_en: str
    description_ru: str | None = None
    description_en: str | None = None
    slug: str | None = None
    subtitle_ru: str | None = None
    subtitle_en: str | None = None
    industry_ru: str | None = None
    industry_en: str | None = None
    year: str | None = None
    timeline_ru: str | None = None
    timeline_en: str | None = None
    challenge_ru: str | None = None
    challenge_en: str | None = None
    solution_ru: str | None = None
    solution_en: str | None = None
    result_summary_ru: str | None = None
    result_summary_en: str | None = None
    image_url: str | None = None
    cover_image_url: str | None = None
    project_url: str | None = None
    hero_metric_value: str | None = None
    hero_metric_label_ru: str | None = None
    hero_metric_label_en: str | None = None
    testimonial_ru: str | None = None
    testimonial_en: str | None = None
    testimonial_author_ru: str | None = None
    testimonial_author_en: str | None = None
    sort_order: int = 0
    is_active: bool = True
    is_featured: bool = False


class ProjectCreate(ProjectBase):
    metrics: list[ProjectMetricInput] = Field(default_factory=list)
    gallery: list[ProjectGalleryInput] = Field(default_factory=list)
    technologies: list[ProjectTechnologyInput] = Field(default_factory=list)


class ProjectUpdate(BaseModel):
    type_ru: str | None = None
    type_en: str | None = None
    name_ru: str | None = None
    name_en: str | None = None
    description_ru: str | None = None
    description_en: str | None = None
    slug: str | None = None
    subtitle_ru: str | None = None
    subtitle_en: str | None = None
    industry_ru: str | None = None
    industry_en: str | None = None
    year: str | None = None
    timeline_ru: str | None = None
    timeline_en: str | None = None
    challenge_ru: str | None = None
    challenge_en: str | None = None
    solution_ru: str | None = None
    solution_en: str | None = None
    result_summary_ru: str | None = None
    result_summary_en: str | None = None
    image_url: str | None = None
    cover_image_url: str | None = None
    project_url: str | None = None
    hero_metric_value: str | None = None
    hero_metric_label_ru: str | None = None
    hero_metric_label_en: str | None = None
    testimonial_ru: str | None = None
    testimonial_en: str | None = None
    testimonial_author_ru: str | None = None
    testimonial_author_en: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    metrics: list[ProjectMetricInput] | None = None
    gallery: list[ProjectGalleryInput] | None = None
    technologies: list[ProjectTechnologyInput] | None = None


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    metrics: list[ProjectMetricInput] = Field(default_factory=list)
    gallery: list[ProjectGalleryInput] = Field(default_factory=list)
    technologies: list[ProjectTechnologyInput] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class ProjectMetricPublic(BaseModel):
    value: str
    label: str
    context: str | None = None
    sort_order: int = 0


class ProjectGalleryPublic(BaseModel):
    image_url: str
    alt: str
    caption: str | None = None
    sort_order: int = 0


class ProjectTechnologyPublic(BaseModel):
    label: str
    category: str
    sort_order: int = 0


class ProjectPublic(BaseModel):
    id: UUID
    slug: str | None
    type: str
    name: str
    subtitle: str | None
    industry: str | None
    description: str | None
    image_url: str | None
    cover_image_url: str | None
    project_url: str | None
    hero_metric_value: str | None
    hero_metric_label: str | None
    is_featured: bool
    sort_order: int
    metrics: list[ProjectMetricPublic] = Field(default_factory=list)


class ProjectDetailPublic(ProjectPublic):
    year: str | None
    timeline: str | None
    challenge: str | None
    solution: str | None
    result_summary: str | None
    testimonial: str | None
    testimonial_author: str | None
    gallery: list[ProjectGalleryPublic] = Field(default_factory=list)
    technologies: list[ProjectTechnologyPublic] = Field(default_factory=list)
    blocks: list[CaseBlockPublic] = Field(default_factory=list)
    seo_title: str | None = None
    seo_description: str | None = None
    seo_image_url: str | None = None
    seo_noindex: bool = False
