from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.case_builder import CaseBlockInput, CaseDocumentUpdate, CaseMeta
from app.services.projects import serialize_project_detail, serialize_project_summary


def load_wellness_migration():
    path = Path(__file__).parents[1] / "alembic/versions/l2a3b4c5d6e7_refresh_wellness_editorial_story.py"
    spec = spec_from_file_location("wellness_case_migration", path)
    assert spec and spec.loader
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_pluto_structure_migration():
    path = Path(__file__).parents[1] / "alembic/versions/u1j2k3l4m5n6_pluto_case_structure.py"
    spec = spec_from_file_location("pluto_case_structure_migration", path)
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
    assert document.blocks[0].settings.surface == "card"
    assert document.blocks[0].settings.desktop_span == 12
    assert document.blocks[0].settings.mobile_start == 0


def test_insight_preserves_decision_rationale_and_outcome() -> None:
    block = CaseBlockInput(
        type="insight",
        content_ru={
            "eyebrow": "Ключевое решение",
            "title": "Показывать только следующий шаг",
            "statement": "Интерфейс ведёт пользователя по ближайшему действию.",
            "rationale_label": "Почему",
            "rationale": "Так пользователь сохраняет внимание на задаче.",
            "outcome_label": "Эффект",
            "outcome": "Одна логика работает во всех сценариях.",
        },
        content_en={
            "eyebrow": "Key decision",
            "title": "Reveal only the next step",
            "statement": "The interface guides the nearest action.",
            "rationale": "Attention stays on the task.",
            "outcome": "One model works across scenarios.",
        },
        settings={"theme": "ink", "layout": "statement"},
    )

    assert block.content_ru["statement"].startswith("Интерфейс")
    assert block.content_ru["rationale_label"] == "Почему"
    assert block.content_en["outcome"] == "One model works across scenarios."
    assert block.settings.layout == "statement"


def test_gallery_frame_defaults_and_rejects_unknown_values() -> None:
    block = CaseBlockInput(
        type="gallery",
        content_ru={"items": [{"image_url": "/one.webp", "frame": "device"}]},
        content_en={"items": [{"image_url": "/one.webp"}]},
    )

    assert block.content_ru["items"][0]["frame"] == "device"
    assert block.content_en["items"][0]["frame"] == "auto"

    with pytest.raises(ValidationError):
        CaseBlockInput(
            type="gallery",
            content_ru={"items": [{"image_url": "/one.webp", "frame": "floating"}]},
            content_en={"items": []},
        )


def test_process_disclosure_settings_allow_single_or_multiple_open_items() -> None:
    block = CaseBlockInput(
        type="process",
        content_ru={"items": [{"title": "Исследование"}]},
        content_en={"items": [{"title": "Research"}]},
        settings={"layout": "story", "disclosure_mode": "multiple", "open_first": True},
    )

    assert block.settings.disclosure_mode == "multiple"
    assert block.settings.open_first is True

    with pytest.raises(ValidationError):
        CaseBlockInput(
            type="process",
            content_ru={"items": []},
            content_en={"items": []},
            settings={"disclosure_mode": "hover"},
        )


def test_editorial_text_tags_process_summary_and_metric_intro_are_preserved() -> None:
    overview = CaseBlockInput(
        type="text",
        content_ru={"kicker": "Кейс", "eyebrow": "О проекте", "title": "Ключевой тезис", "body": "Описание", "tags": ["Nuxt 3", "FastAPI"]},
        content_en={"kicker": "Case", "eyebrow": "About", "title": "Key statement", "body": "Description", "tags": ["Nuxt 3", "FastAPI"]},
        settings={"layout": "overview"},
    )
    process = CaseBlockInput(
        type="process",
        content_ru={"title": "Процесс", "summary": "Вводный текст", "items": []},
        content_en={"title": "Process", "summary": "Intro copy", "items": []},
    )
    metrics = CaseBlockInput(
        type="metrics",
        content_ru={"items": []},
        content_en={"items": []},
        settings={"layout": "cards", "show_intro": False},
    )

    assert overview.content_ru["tags"] == ["Nuxt 3", "FastAPI"]
    assert overview.settings.layout == "overview"
    assert process.content_ru["summary"] == "Вводный текст"
    assert metrics.settings.show_intro is False


def test_results_preserve_editable_outcome_items() -> None:
    block = CaseBlockInput(
        type="results",
        content_ru={"title": "Результат", "items": [{"text": "Контекст сохраняется"}]},
        content_en={"title": "Outcome", "items": [{"text": "Context is preserved"}]},
    )

    assert block.content_ru["items"] == [{"text": "Контекст сохраняется"}]
    assert block.content_en["items"] == [{"text": "Context is preserved"}]


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


def test_media_hero_validates_full_width_image_or_video_content() -> None:
    block = CaseBlockInput(
        type="media_hero",
        content_ru={
            "video_url": "/case/story.mp4",
            "poster_url": "/case/poster.webp",
            "caption": "История продукта",
            "autoplay": True,
            "loop": True,
            "muted": True,
            "controls": False,
        },
        content_en={
            "video_url": "/case/story.mp4",
            "poster_url": "/case/poster.webp",
            "caption": "Product story",
        },
        settings={"width": "full", "layout": "media-16x9"},
    )

    assert block.content_ru["video_url"] == "/case/story.mp4"
    assert block.content_ru["controls"] is False
    assert block.content_en["autoplay"] is True
    assert block.settings.width == "full"


def test_process_preserves_disclosure_media_tags_and_plain_surface() -> None:
    block = CaseBlockInput(
        type="process",
        content_ru={"items": [{"title": "Исследование", "description": "Текст", "image_url": "/process.gif", "image_alt": "Команда", "video_url": "/process.mp4", "poster_url": "/poster.webp", "media_size": "compact", "tags": ["UX", "Strategy"]}]},
        content_en={"items": [{"title": "Research", "description": "Copy", "image_url": "/process.gif", "image_alt": "Team", "video_url": "/process.webm", "poster_url": "/poster.webp", "media_size": "full", "tags": ["UX", "Strategy"]}]},
        settings={"surface": "plain"},
    )

    assert block.content_ru["items"][0]["tags"] == ["UX", "Strategy"]
    assert block.content_en["items"][0]["image_url"] == "/process.gif"
    assert block.content_ru["items"][0]["video_url"] == "/process.mp4"
    assert block.content_en["items"][0]["poster_url"] == "/poster.webp"
    assert block.content_ru["items"][0]["media_size"] == "compact"
    assert block.content_en["items"][0]["media_size"] == "full"
    assert block.settings.surface == "plain"


def test_process_media_size_defaults_and_rejects_unknown_values() -> None:
    block = CaseBlockInput(
        type="process",
        content_ru={"items": [{"title": "Этап"}]},
        content_en={"items": [{"title": "Stage"}]},
    )

    assert block.content_ru["items"][0]["media_size"] == "medium"
    assert block.content_en["items"][0]["media_size"] == "medium"

    with pytest.raises(ValidationError):
        CaseBlockInput(
            type="process",
            content_ru={"items": [{"media_size": "giant"}]},
            content_en={"items": []},
        )


def test_custom_block_preserves_freeform_elements_and_responsive_geometry() -> None:
    element = {
        "id": "heading-1",
        "type": "heading",
        "text": "Свободный заголовок",
        "desktop": {"x": 5, "y": 10, "w": 50, "h": 20},
        "tablet": {"x": 5, "y": 10, "w": 60, "h": 20},
        "mobile": {"x": 5, "y": 8, "w": 90, "h": 16},
    }
    block = CaseBlockInput(
        type="custom",
        content_ru={"title": "Свой блок", "elements": [element]},
        content_en={"title": "Custom block", "elements": [{**element, "text": "Free heading"}]},
        settings={"layout": "freeform", "freeform_height_mobile": 720},
    )

    assert block.content_ru["elements"][0]["desktop"]["w"] == 50
    assert block.content_en["elements"][0]["text"] == "Free heading"
    assert block.settings.freeform_height_mobile == 720


def test_wellness_import_is_a_complete_bilingual_builder_document() -> None:
    migration = load_wellness_migration()
    document = CaseDocumentUpdate(
        meta=migration._meta(),
        blocks=migration._blocks(),
    )

    assert document.meta.slug == "wellness-app"
    assert len(document.blocks) == 13
    assert document.blocks[0].content_ru["title"] == "WELLNESS APP"
    assert document.blocks[0].content_en["title"] == "WELLNESS APP"
    assert document.blocks[0].content_ru["device_screen_url"].endswith("screen-timer.png")
    assert document.blocks[0].content_ru["logo_url"].endswith("wellness-mark.svg")
    assert document.blocks[0].content_ru["metric_value"] == "2×1"
    assert [block.type for block in document.blocks].count("gallery") == 2
    assert [block.type for block in document.blocks].count("media_hero") == 1
    assert [block.type for block in document.blocks].count("video") == 0
    assert document.blocks[2].content_ru["video_url"].endswith("wellness-promo.mp4")
    assert document.blocks[2].settings.layout == "media-16x9"
    assert "О проекте" == document.blocks[1].content_ru["eyebrow"]
    assert all(block.content_ru != block.content_en for block in document.blocks[1:10])
    assert document.blocks[1].settings.anchor == "story"
    assert document.blocks[3].settings.anchor == "evidence"
    assert document.blocks[10].settings.anchor == "technical"
    assert all("is_demo" not in item for item in document.blocks[3].content_ru["items"])

    serialized = str(migration._blocks())
    for filename in (
        "hero-hand-device-v2.png",
        "screen-workout-home.png",
        "screen-progression.png",
        "screen-timer.png",
        "screen-food-home.png",
        "screen-recipe.png",
        "screen-daily-menu.png",
        "wellness-promo.mp4",
        "wellness-mark.svg",
    ):
        assert filename in serialized


def test_pluto_structure_preserves_media_and_builds_three_closed_chapters() -> None:
    migration = load_pluto_structure_migration()
    block_types = [
        "hero",
        "media_hero",
        "text",
        "metrics",
        "challenge_solution",
        "insight",
        "process",
        "text",
        "image",
        "gallery",
        "text",
        "image",
        "gallery",
        "technologies",
        "results",
        "next_case",
    ]
    process_media = [
        "/cases/wellness-app/system-flow.gif",
        "/cases/wellness-app/sequence-flow.gif",
        "/cases/wellness-app/technique-flow.gif",
        "/cases/wellness-app/recovery-flow.gif",
        "/cases/wellness-app/progression-flow.gif",
        "/cases/wellness-app/nutrition-process-flow.gif",
    ]
    gallery_media = [
        "/cases/wellness-app/training-plan.jpg",
        "/cases/wellness-app/training-active.jpg",
        "/cases/wellness-app/training-rest.jpg",
        "/cases/wellness-app/food-daily-menu.jpg",
        "/cases/wellness-app/food-recipes.jpg",
        "/cases/wellness-app/food-recipe-detail.jpg",
    ]

    rows = []
    for order, block_type in enumerate(block_types):
        content = {"title": f"Block {order}"}
        if order == 0:
            content = {"title": "WELLNESS APP", "logo_url": "/cases/wellness-app/training-mark.svg"}
        elif order == 1:
            content = {
                "video_url": "/cases/wellness-app/wellness-promo.mp4",
                "poster_url": "/cases/wellness-app/wellness-promo-poster.jpg",
            }
        elif order == 3:
            content = {"items": []}
        elif order == 6:
            content = {
                "items": [
                    {
                        "title": f"Step {index + 1}",
                        "description": "Description",
                        "image_url": media_url,
                        "image_alt": "Flow",
                        "media_size": "full",
                        "tags": ["UX", "PWA", "STATE"],
                    }
                    for index, media_url in enumerate(process_media)
                ]
            }
        elif order in (8, 11):
            content = {
                "image_url": "/cases/wellness-app/workout-flow.gif"
                if order == 8
                else "/cases/wellness-app/nutrition-flow.gif",
                "alt": "Flow",
                "caption": "",
            }
        elif order in (9, 12):
            offset = 0 if order == 9 else 3
            content = {
                "items": [
                    {"image_url": url, "alt": "Screen", "caption": ""}
                    for url in gallery_media[offset : offset + 3]
                ]
            }
        elif order == 13:
            content = {"items": []}
        elif order == 14:
            content = {"title": "Result", "body": "Body", "items": []}

        rows.append(
            {
                "id": uuid4(),
                "type": block_type,
                "content_ru": content,
                "content_en": dict(content),
                "settings": {"theme": "paper", "surface": "plain"},
                "sort_order": order,
                "is_visible": True,
            }
        )

    hero_before = dict(rows[0]["content_ru"])
    media_hero_before = dict(rows[1]["content_ru"])
    composed = migration._compose(rows)

    assert len(composed) == 18
    assert [block["sort_order"] for block in composed] == list(range(18))
    assert composed[0]["content_ru"] == hero_before
    assert composed[1]["content_ru"] == media_hero_before
    assert composed[4]["type"] == "text"
    assert composed[5]["type"] == "image"
    chapters = [block for block in composed if block["type"] == "process"]
    assert [len(block["content_ru"]["items"]) for block in chapters] == [2, 2, 1]
    assert all(block["settings"]["layout"] == "chapter" for block in chapters)
    assert all(block["settings"]["disclosure_mode"] == "multiple" for block in chapters)
    assert all(block["settings"]["open_first"] is False for block in chapters)
    assert all(CaseBlockInput.model_validate(block) for block in composed)

    serialized = str(composed)
    for media_url in [
        "/cases/wellness-app/training-mark.svg",
        "/cases/wellness-app/wellness-promo.mp4",
        "/cases/wellness-app/wellness-promo-poster.jpg",
        *process_media,
        "/cases/wellness-app/workout-flow.gif",
        "/cases/wellness-app/nutrition-flow.gif",
        *gallery_media,
    ]:
        assert media_url in serialized


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
