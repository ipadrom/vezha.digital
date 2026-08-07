from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

CaseStatus = Literal["draft", "published", "hidden"]
BlockType = Literal[
    "hero",
    "text",
    "challenge_solution",
    "image",
    "image_text",
    "gallery",
    "metrics",
    "process",
    "quote",
    "technologies",
    "video",
    "comparison",
    "results",
    "next_case",
    "custom",
]


class FlexibleContent(BaseModel):
    model_config = ConfigDict(extra="allow")


class HeroContent(FlexibleContent):
    eyebrow: str = ""
    title: str = ""
    subtitle: str = ""
    type_label: str = ""
    industry: str = ""
    timeline: str = ""
    year: str = ""
    image_url: str = ""
    image_alt: str = ""
    device_screen_url: str = ""
    metric_value: str = ""
    metric_label: str = ""


class TextContent(FlexibleContent):
    eyebrow: str = ""
    title: str = ""
    body: str = ""


class ChallengeSolutionContent(FlexibleContent):
    eyebrow: str = ""
    title: str = ""
    challenge_label: str = ""
    challenge: str = ""
    solution_label: str = ""
    solution: str = ""


class ImageContent(FlexibleContent):
    image_url: str = ""
    alt: str = ""
    caption: str = ""


class ImageTextContent(TextContent):
    image_url: str = ""
    alt: str = ""
    caption: str = ""


class GalleryItem(FlexibleContent):
    image_url: str = ""
    alt: str = ""
    caption: str = ""


class GalleryContent(FlexibleContent):
    eyebrow: str = ""
    title: str = ""
    items: list[GalleryItem] = Field(default_factory=list)


class MetricItem(FlexibleContent):
    value: str = ""
    label: str = ""
    context: str = ""


class MetricsContent(FlexibleContent):
    eyebrow: str = ""
    title: str = ""
    summary: str = ""
    items: list[MetricItem] = Field(default_factory=list)


class ProcessItem(FlexibleContent):
    title: str = ""
    description: str = ""


class ProcessContent(FlexibleContent):
    eyebrow: str = ""
    title: str = ""
    items: list[ProcessItem] = Field(default_factory=list)


class QuoteContent(FlexibleContent):
    quote: str = ""
    author: str = ""
    role: str = ""
    logo_url: str = ""


class TechnologyItem(FlexibleContent):
    label: str = ""
    category: str = "stack"
    x: float | None = Field(default=None, ge=0, le=100)
    y: float | None = Field(default=None, ge=0, le=100)


class TechnologiesContent(FlexibleContent):
    eyebrow: str = ""
    title: str = ""
    summary: str = ""
    items: list[TechnologyItem] = Field(default_factory=list)


class VideoContent(FlexibleContent):
    eyebrow: str = ""
    title: str = ""
    video_url: str = ""
    poster_url: str = ""
    caption: str = ""


class ComparisonContent(FlexibleContent):
    eyebrow: str = ""
    title: str = ""
    before_url: str = ""
    before_alt: str = ""
    before_label: str = ""
    after_url: str = ""
    after_alt: str = ""
    after_label: str = ""


class ResultsContent(TextContent):
    link_url: str = ""
    link_label: str = ""


class NextCaseContent(FlexibleContent):
    eyebrow: str = ""
    title: str = ""
    case_slug: str = ""
    cta_label: str = ""


class CustomContent(FlexibleContent):
    title: str = ""
    elements: list[dict[str, Any]] = Field(default_factory=list)


BLOCK_CONTENT_MODELS: dict[str, type[BaseModel]] = {
    "hero": HeroContent,
    "text": TextContent,
    "challenge_solution": ChallengeSolutionContent,
    "image": ImageContent,
    "image_text": ImageTextContent,
    "gallery": GalleryContent,
    "metrics": MetricsContent,
    "process": ProcessContent,
    "quote": QuoteContent,
    "technologies": TechnologiesContent,
    "video": VideoContent,
    "comparison": ComparisonContent,
    "results": ResultsContent,
    "next_case": NextCaseContent,
    "custom": CustomContent,
}


class BlockSettings(BaseModel):
    model_config = ConfigDict(extra="allow")

    theme: Literal["paper", "soft", "ink", "signal"] = "paper"
    width: Literal["standard", "wide", "full"] = "standard"
    spacing: Literal["compact", "normal", "large"] = "normal"
    layout: str = "default"
    alignment: Literal["left", "center", "right"] = "left"
    desktop_span: int = Field(default=12, ge=1, le=12)
    desktop_start: int = Field(default=0, ge=0, le=12)
    tablet_span: int = Field(default=12, ge=1, le=12)
    tablet_start: int = Field(default=0, ge=0, le=12)
    mobile_span: int = Field(default=12, ge=1, le=12)
    mobile_start: int = Field(default=0, ge=0, le=12)

    @model_validator(mode="after")
    def validate_grid_placement(self) -> "BlockSettings":
        for viewport in ("desktop", "tablet", "mobile"):
            span = getattr(self, f"{viewport}_span")
            start = getattr(self, f"{viewport}_start")
            if start and start + span > 13:
                raise ValueError(f"{viewport} block placement exceeds the 12-column grid")
        return self


class CaseBlockInput(BaseModel):
    id: UUID | None = None
    type: BlockType
    content_ru: dict[str, Any] = Field(default_factory=dict)
    content_en: dict[str, Any] = Field(default_factory=dict)
    settings: BlockSettings = Field(default_factory=BlockSettings)
    sort_order: int = 0
    is_visible: bool = True

    @model_validator(mode="after")
    def validate_localized_content(self) -> "CaseBlockInput":
        content_model = BLOCK_CONTENT_MODELS[self.type]
        self.content_ru = content_model.model_validate(self.content_ru).model_dump()
        self.content_en = content_model.model_validate(self.content_en).model_dump()
        return self


class CaseBlockResponse(CaseBlockInput):
    id: UUID


class CaseMeta(BaseModel):
    slug: str = Field(
        default="",
        max_length=160,
        pattern=r"^$|^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )
    name_ru: str = Field(default="", max_length=255)
    name_en: str = Field(default="", max_length=255)
    type_ru: str = Field(default="", max_length=100)
    type_en: str = Field(default="", max_length=100)
    description_ru: str = ""
    description_en: str = ""
    subtitle_ru: str = Field(default="", max_length=255)
    subtitle_en: str = Field(default="", max_length=255)
    industry_ru: str = Field(default="", max_length=160)
    industry_en: str = Field(default="", max_length=160)
    year: str = Field(default="", max_length=20)
    timeline_ru: str = Field(default="", max_length=120)
    timeline_en: str = Field(default="", max_length=120)
    image_url: str = ""
    cover_image_url: str = ""
    project_url: str = ""
    hero_metric_value: str = Field(default="", max_length=80)
    hero_metric_label_ru: str = Field(default="", max_length=160)
    hero_metric_label_en: str = Field(default="", max_length=160)
    is_featured: bool = False
    sort_order: int = 0
    seo_title_ru: str = Field(default="", max_length=255)
    seo_title_en: str = Field(default="", max_length=255)
    seo_description_ru: str = ""
    seo_description_en: str = ""
    seo_image_url: str = ""
    seo_noindex: bool = False


class CaseCreate(BaseModel):
    meta: CaseMeta = Field(default_factory=CaseMeta)


class CaseDocumentUpdate(BaseModel):
    meta: CaseMeta
    blocks: list[CaseBlockInput] = Field(default_factory=list, max_length=100)


class CaseSummaryResponse(BaseModel):
    id: UUID
    slug: str
    name_ru: str
    name_en: str
    cover_image_url: str
    status: CaseStatus
    is_featured: bool
    sort_order: int
    has_unpublished_changes: bool
    published_at: datetime | None
    updated_at: datetime


class CaseDocumentResponse(BaseModel):
    id: UUID
    status: CaseStatus
    meta: CaseMeta
    blocks: list[CaseBlockResponse]
    has_unpublished_changes: bool
    published_at: datetime | None
    updated_at: datetime


class CaseRevisionResponse(BaseModel):
    id: UUID
    version: int
    created_at: datetime


class CaseBlockPublic(BaseModel):
    id: str
    type: BlockType
    content: dict[str, Any]
    settings: dict[str, Any] = Field(default_factory=dict)
    sort_order: int


class MediaAssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    url: str
    filename: str
    content_type: str
    size: int
    alt_ru: str | None
    alt_en: str | None
    created_at: datetime


class MediaAssetUpdate(BaseModel):
    alt_ru: str | None = None
    alt_en: str | None = None
