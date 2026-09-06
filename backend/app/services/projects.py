from collections.abc import Iterable
from typing import Any

from app.models import ProjectGalleryItem, ProjectMetric, ProjectTechnology
from app.schemas.case_builder import (
    DEPRECATED_BLOCK_TYPES,
    CaseBlockPublic,
    canonical_block_layout,
)
from app.schemas.project import (
    ProjectDetailPublic,
    ProjectGalleryInput,
    ProjectGalleryPublic,
    ProjectMetricInput,
    ProjectMetricPublic,
    ProjectPublic,
    ProjectTechnologyInput,
    ProjectTechnologyPublic,
)


def _localized(item: Any, field: str, lang: str) -> Any:
    return getattr(item, f"{field}_{lang}", None) or getattr(item, f"{field}_ru", None)


def _metrics(items: Iterable[Any], lang: str) -> list[ProjectMetricPublic]:
    return [
        ProjectMetricPublic(
            value=item.value,
            label=_localized(item, "label", lang),
            context=_localized(item, "context", lang),
            sort_order=item.sort_order,
        )
        for item in items
    ]


def _snapshot_value(meta: dict[str, Any], field: str, lang: str) -> Any:
    return meta.get(f"{field}_{lang}") or meta.get(f"{field}_ru") or None


def _snapshot_content(block: dict[str, Any], lang: str) -> dict[str, Any]:
    return block.get(f"content_{lang}") or block.get("content_ru") or {}


def _published_blocks(project: Any, lang: str) -> list[CaseBlockPublic]:
    if not project.published_data:
        return []
    result: list[CaseBlockPublic] = []
    for index, block in enumerate(project.published_data.get("blocks", [])):
        block_type = block.get("type")
        if not block.get("is_visible", True) or block_type in DEPRECATED_BLOCK_TYPES:
            continue
        settings = dict(block.get("settings") or {})
        settings["layout"] = canonical_block_layout(block_type, settings.get("layout"))
        result.append(
            CaseBlockPublic(
                id=str(block.get("id", "")),
                type=block_type,
                content=_snapshot_content(block, lang),
                settings=settings,
                sort_order=block.get("sort_order", index),
            )
        )
    return result


def _snapshot_metrics(blocks: list[CaseBlockPublic]) -> list[ProjectMetricPublic]:
    block = next((item for item in blocks if item.type == "metrics"), None)
    if not block:
        return []
    return [
        ProjectMetricPublic(
            value=item.get("value", ""),
            label=item.get("label", ""),
            context=item.get("context") or None,
            sort_order=index,
        )
        for index, item in enumerate(block.content.get("items", []))
    ]


def serialize_project_summary(project: Any, lang: str) -> ProjectPublic:
    published_data = getattr(project, "published_data", None)
    if published_data:
        meta = published_data.get("meta", {})
        blocks = _published_blocks(project, lang)
        return ProjectPublic(
            id=project.id,
            slug=meta.get("slug") or project.slug,
            type=_snapshot_value(meta, "type", lang)
            or ("Проект" if lang == "ru" else "Project"),
            name=_snapshot_value(meta, "name", lang) or "",
            subtitle=_snapshot_value(meta, "subtitle", lang),
            industry=_snapshot_value(meta, "industry", lang),
            description=_snapshot_value(meta, "description", lang),
            image_url=meta.get("image_url") or None,
            cover_image_url=meta.get("cover_image_url") or None,
            project_url=meta.get("project_url") or None,
            hero_metric_value=meta.get("hero_metric_value") or None,
            hero_metric_label=_snapshot_value(meta, "hero_metric_label", lang),
            is_featured=bool(meta.get("is_featured")),
            sort_order=int(meta.get("sort_order", 0)),
            metrics=_snapshot_metrics(blocks),
        )
    return ProjectPublic(
        id=project.id,
        slug=project.slug,
        type=_localized(project, "type", lang),
        name=_localized(project, "name", lang),
        subtitle=_localized(project, "subtitle", lang),
        industry=_localized(project, "industry", lang),
        description=_localized(project, "description", lang),
        image_url=project.image_url,
        cover_image_url=project.cover_image_url,
        project_url=project.project_url,
        hero_metric_value=project.hero_metric_value,
        hero_metric_label=_localized(project, "hero_metric_label", lang),
        is_featured=project.is_featured,
        sort_order=project.sort_order,
        metrics=_metrics(project.metrics, lang),
    )


def serialize_project_detail(project: Any, lang: str) -> ProjectDetailPublic:
    published_data = getattr(project, "published_data", None)
    if published_data:
        meta = published_data.get("meta", {})
        blocks = _published_blocks(project, lang)
        challenge_block = next(
            (item for item in blocks if item.type == "challenge_solution"), None
        )
        metrics_block = next((item for item in blocks if item.type == "metrics"), None)
        quote_block = next((item for item in blocks if item.type == "quote"), None)
        technology_block = next(
            (item for item in blocks if item.type == "technologies"), None
        )
        summary = serialize_project_summary(project, lang).model_dump()
        return ProjectDetailPublic(
            **summary,
            year=meta.get("year") or None,
            timeline=_snapshot_value(meta, "timeline", lang),
            challenge=challenge_block.content.get("challenge") if challenge_block else None,
            solution=challenge_block.content.get("solution") if challenge_block else None,
            result_summary=metrics_block.content.get("summary") if metrics_block else None,
            testimonial=quote_block.content.get("quote") if quote_block else None,
            testimonial_author=quote_block.content.get("author") if quote_block else None,
            gallery=[],
            technologies=[
                ProjectTechnologyPublic(
                    label=item.get("label", ""),
                    category=item.get("category", "stack"),
                    sort_order=index,
                )
                for index, item in enumerate(
                    technology_block.content.get("items", []) if technology_block else []
                )
            ],
            blocks=blocks,
            seo_title=_snapshot_value(meta, "seo_title", lang),
            seo_description=_snapshot_value(meta, "seo_description", lang),
            seo_image_url=meta.get("seo_image_url") or None,
            seo_noindex=bool(meta.get("seo_noindex")),
        )
    summary = serialize_project_summary(project, lang).model_dump()
    return ProjectDetailPublic(
        **summary,
        year=project.year,
        timeline=_localized(project, "timeline", lang),
        challenge=_localized(project, "challenge", lang),
        solution=_localized(project, "solution", lang),
        result_summary=_localized(project, "result_summary", lang),
        testimonial=_localized(project, "testimonial", lang),
        testimonial_author=_localized(project, "testimonial_author", lang),
        gallery=[
            ProjectGalleryPublic(
                image_url=item.image_url,
                alt=_localized(item, "alt", lang),
                caption=_localized(item, "caption", lang),
                sort_order=item.sort_order,
            )
            for item in project.gallery
        ],
        technologies=[
            ProjectTechnologyPublic(
                label=item.label,
                category=item.category,
                sort_order=item.sort_order,
            )
            for item in project.technologies
        ],
        blocks=[],
    )


def replace_project_children(
    project: Any,
    *,
    metrics: list[ProjectMetricInput] | None = None,
    gallery: list[ProjectGalleryInput] | None = None,
    technologies: list[ProjectTechnologyInput] | None = None,
) -> None:
    if metrics is not None:
        project.metrics = [ProjectMetric(**item.model_dump()) for item in metrics]
    if gallery is not None:
        project.gallery = [ProjectGalleryItem(**item.model_dump()) for item in gallery]
    if technologies is not None:
        project.technologies = [ProjectTechnology(**item.model_dump()) for item in technologies]
