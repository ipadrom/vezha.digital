from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.case_builder import CaseBlockInput, CaseDocumentUpdate, CaseMeta
from app.services.projects import serialize_project_detail, serialize_project_summary


def load_wellness_migration():
    path = Path(__file__).parents[1] / "alembic/versions/i9d0e1f2a3b4_import_wellness_case.py"
    spec = spec_from_file_location("wellness_case_migration", path)
    assert spec and spec.loader
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def published_snapshot() -> dict:
    return {
        "meta": {
            "slug": "signal-app",
            "name_ru": "Сигнал",
            "name_en": "Signal",
            "type_ru": "Мобильное приложение",
            "type_en": "Mobile app",
            "description_ru": "Описание",
            "description_en": "Description",
            "subtitle_ru": "Связь без шума",
            "subtitle_en": "Communication without noise",
            "industry_ru": "Коммуникации",
            "industry_en": "Communications",
            "year": "2026",
            "timeline_ru": "12 недель",
            "timeline_en": "12 weeks",
            "image_url": "",
            "cover_image_url": "/cover.webp",
            "project_url": "",
            "hero_metric_value": "+42%",
            "hero_metric_label_ru": "активация",
            "hero_metric_label_en": "activation",
            "is_featured": True,
            "sort_order": 2,
            "seo_title_ru": "Сигнал — кейс",
            "seo_title_en": "Signal case",
            "seo_description_ru": "SEO RU",
            "seo_description_en": "SEO EN",
            "seo_image_url": "/social.webp",
            "seo_noindex": False,
        },
        "blocks": [
            {
                "id": str(uuid4()),
                "type": "metrics",
                "content_ru": {
                    "eyebrow": "Результат",
                    "title": "Эффект",
                    "summary": "Рост",
                    "items": [{"value": "+42%", "label": "активация", "context": ""}],
                },
                "content_en": {
                    "eyebrow": "Result",
                    "title": "Effect",
                    "summary": "Growth",
                    "items": [{"value": "+42%", "label": "activation", "context": ""}],
                },
                "settings": {"theme": "ink", "width": "wide"},
                "sort_order": 1,
                "is_visible": True,
            }
        ],
    }


def test_block_document_validates_nested_builder_content() -> None:
    document = CaseDocumentUpdate(
        meta=CaseMeta(slug="signal-app"),
        blocks=[
            CaseBlockInput(
                type="gallery",
                content_ru={"items": [{"image_url": "/one.webp", "alt": "Экран"}]},
                content_en={"items": [{"image_url": "/one.webp", "alt": "Screen"}]},
            )
        ],
    )

    assert document.blocks[0].content_ru["items"][0]["caption"] == ""
    assert document.blocks[0].settings.theme == "paper"
    assert document.blocks[0].settings.desktop_span == 12
    assert document.blocks[0].settings.mobile_start == 0


def test_block_document_rejects_unknown_type() -> None:
    with pytest.raises(ValidationError):
        CaseBlockInput(type="raw_html", content_ru={}, content_en={})


def test_block_document_rejects_grid_values_outside_twelve_columns() -> None:
    with pytest.raises(ValidationError):
        CaseBlockInput(
            type="text",
            content_ru={},
            content_en={},
            settings={"desktop_span": 13},
        )


def test_technology_map_validates_node_positions() -> None:
    block = CaseBlockInput(
        type="technologies",
        content_ru={
            "title": "PRODUCT / WEB / API",
            "items": [{"label": "Vue 3", "category": "Client", "x": 18, "y": 24}],
        },
        content_en={
            "title": "PRODUCT / WEB / API",
            "items": [{"label": "Vue 3", "category": "Client", "x": 18, "y": 24}],
        },
        settings={"theme": "ink", "layout": "map"},
    )

    assert block.content_ru["items"][0]["x"] == 18
    assert block.content_ru["items"][0]["y"] == 24

    with pytest.raises(ValidationError):
        CaseBlockInput(
            type="technologies",
            content_ru={"items": [{"label": "Vue 3", "x": 101, "y": 20}]},
            content_en={},
        )


def test_wellness_import_is_a_complete_bilingual_builder_document() -> None:
    migration = load_wellness_migration()
    document = CaseDocumentUpdate(
        meta=migration._meta(),
        blocks=migration._blocks(),
    )

    assert document.meta.slug == "wellness-app"
    assert len(document.blocks) == 11
    assert document.blocks[0].content_ru["title"] == "WELLNESS APP"
    assert document.blocks[0].content_en["title"] == "WELLNESS APP"
    assert document.blocks[0].content_ru["device_screen_url"].endswith("screen-timer.png")
    assert [block.type for block in document.blocks].count("gallery") == 2
    assert all(block.content_ru != block.content_en for block in document.blocks[1:8])
    assert document.blocks[1].settings.anchor == "evidence"
    assert document.blocks[2].settings.anchor == "story"
    assert document.blocks[7].settings.anchor == "technical"

    serialized = str(migration._blocks())
    for filename in (
        "hero-hand-device-v2.png",
        "screen-workout-home.png",
        "screen-progression.png",
        "screen-timer.png",
        "screen-food-home.png",
        "screen-recipe.png",
        "screen-daily-menu.png",
    ):
        assert filename in serialized


def test_public_serializer_reads_only_published_snapshot() -> None:
    project = SimpleNamespace(
        id=uuid4(),
        slug="legacy-slug",
        published_data=published_snapshot(),
    )

    summary = serialize_project_summary(project, "en")
    detail = serialize_project_detail(project, "ru")

    assert summary.slug == "signal-app"
    assert summary.name == "Signal"
    assert summary.metrics[0].label == "activation"
    assert detail.blocks[0].content["title"] == "Эффект"
    assert detail.seo_title == "Сигнал — кейс"


def test_public_serializer_defaults_empty_project_type() -> None:
    snapshot = published_snapshot()
    snapshot["meta"]["type_ru"] = ""
    snapshot["meta"]["type_en"] = ""
    project = SimpleNamespace(id=uuid4(), slug="signal-app", published_data=snapshot)

    assert serialize_project_summary(project, "ru").type == "Проект"
    assert serialize_project_summary(project, "en").type == "Project"
