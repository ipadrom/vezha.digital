from __future__ import annotations

from typing import Any
from uuid import uuid4

from app.models import Project, ProjectBlock
from app.schemas.case_builder import (
    CaseBlockInput,
    CaseBlockResponse,
    CaseDocumentResponse,
    CaseMeta,
    CaseSummaryResponse,
)


def _value(value: Any) -> Any:
    return value if value is not None else ""


def legacy_meta(project: Project) -> CaseMeta:
    return CaseMeta(
        slug=_value(project.slug),
        name_ru=_value(project.name_ru),
        name_en=_value(project.name_en),
        type_ru=_value(project.type_ru),
        type_en=_value(project.type_en),
        description_ru=_value(project.description_ru),
        description_en=_value(project.description_en),
        subtitle_ru=_value(project.subtitle_ru),
        subtitle_en=_value(project.subtitle_en),
        industry_ru=_value(project.industry_ru),
        industry_en=_value(project.industry_en),
        year=_value(project.year),
        timeline_ru=_value(project.timeline_ru),
        timeline_en=_value(project.timeline_en),
        image_url=_value(project.image_url),
        cover_image_url=_value(project.cover_image_url),
        project_url=_value(project.project_url),
        hero_metric_value=_value(project.hero_metric_value),
        hero_metric_label_ru=_value(project.hero_metric_label_ru),
        hero_metric_label_en=_value(project.hero_metric_label_en),
        is_featured=project.is_featured,
        sort_order=project.sort_order,
    )


def legacy_blocks(project: Project) -> list[CaseBlockInput]:
    blocks: list[CaseBlockInput] = [
        CaseBlockInput(
            id=uuid4(),
            type="hero",
            content_ru={
                "eyebrow": "Кейс",
                "title": _value(project.name_ru),
                "subtitle": _value(project.subtitle_ru or project.description_ru),
                "type_label": _value(project.type_ru),
                "industry": _value(project.industry_ru),
                "timeline": _value(project.timeline_ru),
                "year": _value(project.year),
                "image_url": _value(project.cover_image_url or project.image_url),
                "image_alt": _value(project.name_ru),
                "metric_value": _value(project.hero_metric_value),
                "metric_label": _value(project.hero_metric_label_ru),
            },
            content_en={
                "eyebrow": "Case",
                "title": _value(project.name_en),
                "subtitle": _value(project.subtitle_en or project.description_en),
                "type_label": _value(project.type_en),
                "industry": _value(project.industry_en),
                "timeline": _value(project.timeline_en),
                "year": _value(project.year),
                "image_url": _value(project.cover_image_url or project.image_url),
                "image_alt": _value(project.name_en),
                "metric_value": _value(project.hero_metric_value),
                "metric_label": _value(project.hero_metric_label_en),
            },
            sort_order=0,
            settings={"theme": "paper", "width": "wide", "spacing": "large"},
        )
    ]

    if project.challenge_ru or project.solution_ru or project.challenge_en or project.solution_en:
        blocks.append(
            CaseBlockInput(
                id=uuid4(),
                type="challenge_solution",
                content_ru={
                    "eyebrow": "История",
                    "title": "Сначала — задача. Потом — интерфейс.",
                    "challenge_label": "Вызов",
                    "challenge": _value(project.challenge_ru),
                    "solution_label": "Решение",
                    "solution": _value(project.solution_ru),
                },
                content_en={
                    "eyebrow": "Story",
                    "title": "The task comes first. The interface follows.",
                    "challenge_label": "Challenge",
                    "challenge": _value(project.challenge_en),
                    "solution_label": "Solution",
                    "solution": _value(project.solution_en),
                },
                sort_order=len(blocks),
            )
        )

    if project.gallery:
        blocks.append(
            CaseBlockInput(
                id=uuid4(),
                type="gallery",
                content_ru={
                    "eyebrow": "Интерфейс",
                    "title": "Продукт в деталях",
                    "items": [
                        {
                            "image_url": item.image_url,
                            "alt": _value(item.alt_ru),
                            "caption": _value(item.caption_ru),
                        }
                        for item in project.gallery
                    ],
                },
                content_en={
                    "eyebrow": "Interface",
                    "title": "Product in detail",
                    "items": [
                        {
                            "image_url": item.image_url,
                            "alt": _value(item.alt_en),
                            "caption": _value(item.caption_en),
                        }
                        for item in project.gallery
                    ],
                },
                settings={"theme": "soft", "width": "wide", "layout": "mosaic"},
                sort_order=len(blocks),
            )
        )

    if project.metrics or project.result_summary_ru or project.result_summary_en:
        blocks.append(
            CaseBlockInput(
                id=uuid4(),
                type="metrics",
                content_ru={
                    "eyebrow": "Результат",
                    "title": "Что изменилось",
                    "summary": _value(project.result_summary_ru),
                    "items": [
                        {
                            "value": item.value,
                            "label": _value(item.label_ru),
                            "context": _value(item.context_ru),
                        }
                        for item in project.metrics
                    ],
                },
                content_en={
                    "eyebrow": "Result",
                    "title": "What changed",
                    "summary": _value(project.result_summary_en),
                    "items": [
                        {
                            "value": item.value,
                            "label": _value(item.label_en),
                            "context": _value(item.context_en),
                        }
                        for item in project.metrics
                    ],
                },
                settings={"theme": "ink", "width": "wide"},
                sort_order=len(blocks),
            )
        )

    if project.testimonial_ru or project.testimonial_en:
        blocks.append(
            CaseBlockInput(
                id=uuid4(),
                type="quote",
                content_ru={
                    "quote": _value(project.testimonial_ru),
                    "author": _value(project.testimonial_author_ru),
                },
                content_en={
                    "quote": _value(project.testimonial_en),
                    "author": _value(project.testimonial_author_en),
                },
                sort_order=len(blocks),
            )
        )

    if project.technologies:
        items = [
            {"label": item.label, "category": item.category}
            for item in project.technologies
        ]
        blocks.append(
            CaseBlockInput(
                id=uuid4(),
                type="technologies",
                content_ru={
                    "eyebrow": "Технологии",
                    "title": "Технический контур",
                    "items": items,
                },
                content_en={
                    "eyebrow": "Technology",
                    "title": "Technical scope",
                    "items": items,
                },
                settings={"theme": "soft", "width": "wide"},
                sort_order=len(blocks),
            )
        )

    blocks.append(
        CaseBlockInput(
            id=uuid4(),
            type="next_case",
            content_ru={"eyebrow": "Дальше", "title": "Следующий кейс", "cta_label": "Открыть"},
            content_en={"eyebrow": "Next", "title": "Next case", "cta_label": "Open"},
            settings={"theme": "signal", "width": "wide", "spacing": "large"},
            sort_order=len(blocks),
        )
    )
    return blocks


def project_meta(project: Project) -> CaseMeta:
    if project.draft_data:
        return CaseMeta.model_validate(project.draft_data)
    return legacy_meta(project)


def project_blocks(project: Project) -> list[CaseBlockInput]:
    if project.blocks:
        return [
            CaseBlockInput(
                id=block.id,
                type=block.type,
                content_ru=block.content_ru,
                content_en=block.content_en,
                settings=block.settings,
                sort_order=block.sort_order,
                is_visible=block.is_visible,
            )
            for block in project.blocks
        ]
    return legacy_blocks(project)


def block_snapshot(blocks: list[CaseBlockInput]) -> list[dict[str, Any]]:
    return [block.model_dump(mode="json") for block in sorted(blocks, key=lambda item: item.sort_order)]


def draft_snapshot(project: Project) -> dict[str, Any]:
    return {
        "meta": project_meta(project).model_dump(mode="json"),
        "blocks": block_snapshot(project_blocks(project)),
    }


def has_unpublished_changes(project: Project) -> bool:
    if project.status == "draft":
        return True
    if not project.published_data:
        return bool(project.draft_data or project.blocks)
    return draft_snapshot(project) != project.published_data


def document_response(project: Project) -> CaseDocumentResponse:
    blocks = project_blocks(project)
    return CaseDocumentResponse(
        id=project.id,
        status=project.status,
        meta=project_meta(project),
        blocks=[CaseBlockResponse.model_validate(block.model_dump()) for block in blocks],
        has_unpublished_changes=has_unpublished_changes(project),
        published_at=project.published_at,
        updated_at=project.updated_at,
    )


def summary_response(project: Project) -> CaseSummaryResponse:
    meta = project_meta(project)
    return CaseSummaryResponse(
        id=project.id,
        slug=meta.slug,
        name_ru=meta.name_ru,
        name_en=meta.name_en,
        cover_image_url=meta.cover_image_url or meta.image_url,
        status=project.status,
        is_featured=meta.is_featured,
        sort_order=meta.sort_order,
        has_unpublished_changes=has_unpublished_changes(project),
        published_at=project.published_at,
        updated_at=project.updated_at,
    )


def replace_blocks(project: Project, blocks: list[CaseBlockInput]) -> None:
    existing = {block.id: block for block in project.blocks}
    updated: list[ProjectBlock] = []
    for index, data in enumerate(blocks):
        block = existing.get(data.id) if data.id else None
        if block is None:
            block = ProjectBlock(id=data.id) if data.id else ProjectBlock()
        block.type = data.type
        block.content_ru = data.content_ru
        block.content_en = data.content_en
        block.settings = data.settings.model_dump(mode="json")
        block.sort_order = index
        block.is_visible = data.is_visible
        updated.append(block)
    project.blocks = updated


def apply_published_meta(project: Project, meta: CaseMeta) -> None:
    for field in (
        "slug",
        "name_ru",
        "name_en",
        "type_ru",
        "type_en",
        "description_ru",
        "description_en",
        "subtitle_ru",
        "subtitle_en",
        "industry_ru",
        "industry_en",
        "year",
        "timeline_ru",
        "timeline_en",
        "image_url",
        "cover_image_url",
        "project_url",
        "hero_metric_value",
        "hero_metric_label_ru",
        "hero_metric_label_en",
        "is_featured",
        "sort_order",
    ):
        value = getattr(meta, field)
        if field == "type_ru":
            value = value or "Проект"
        elif field == "type_en":
            value = value or "Project"
        elif field not in {"name_ru", "name_en", "is_featured", "sort_order"}:
            value = value or None
        setattr(project, field, value)
