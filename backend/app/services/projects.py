from collections.abc import Iterable
from typing import Any

from app.models import ProjectGalleryItem, ProjectMetric, ProjectTechnology
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


def serialize_project_summary(project: Any, lang: str) -> ProjectPublic:
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
