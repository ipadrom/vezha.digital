from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.case_builder import CaseBlockInput, CaseDocumentUpdate, CaseMeta
from app.services.case_builder import (
    apply_published_meta,
    draft_snapshot,
    has_unpublished_changes,
    project_meta,
    restored_blocks,
)
from app.services.projects import serialize_project_detail, serialize_project_summary


def load_legacy_cleanup_migration():
    path = (
        Path(__file__).parents[1]
        / "alembic/versions/v2k3l4m5n6o7_remove_legacy_case_blocks.py"
    )
    spec = spec_from_file_location("legacy_case_cleanup_migration", path)
    assert spec and spec.loader
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_zagorulko_story_migration():
    path = (
        Path(__file__).parents[1]
        / "alembic/versions/w3l4m5n6o7p8_zagorulko_orders_story.py"
    )
    spec = spec_from_file_location("zagorulko_orders_story_migration", path)
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
                type="metrics",
                content_ru={"items": [{"value": "3", "label": "сценария"}]},
                content_en={"items": [{"value": "3", "label": "workflows"}]},
            )
        ],
    )

    assert document.blocks[0].content_ru["items"][0]["context"] == ""
    assert document.blocks[0].settings.theme == "paper"
    assert document.blocks[0].settings.surface == "card"
    assert document.blocks[0].settings.layout == "cards"
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


def test_deprecated_gallery_block_is_rejected() -> None:
    with pytest.raises(ValidationError):
        CaseBlockInput(
            type="gallery",
            content_ru={"items": [{"image_url": "/one.webp"}]},
            content_en={"items": []},
        )


@pytest.mark.parametrize(
    ("block_type", "legacy_layout", "canonical_layout"),
    [
        ("hero", "default", "case-header"),
        ("hero", "editorial", "case-header"),
        ("media_hero", "default", "media-16x9"),
        ("media_hero", "media", "media-16x9"),
        ("media_hero", "cinematic", "media-16x9"),
        ("text", "default", "editorial"),
        ("challenge_solution", "default", "narrative"),
        ("challenge_solution", "split", "narrative"),
        ("challenge_solution", "contrast", "narrative"),
        ("insight", "default", "statement"),
        ("image", "figure", "default"),
        ("image_text", "default", "image-right"),
        ("metrics", "default", "cards"),
        ("metrics", "grid", "cards"),
        ("metrics", "strip", "cards"),
        ("process", "default", "chapter"),
        ("process", "stacked", "chapter"),
        ("process", "story", "chapter"),
        ("process", "accordion", "chapter"),
        ("technologies", "default", "map"),
        ("video", "cinematic", "default"),
        ("comparison", "default", "side-by-side"),
        ("results", "default", "statement"),
        ("results", "list", "statement"),
        ("results", "panel", "statement"),
        ("custom", "default", "freeform"),
    ],
)
def test_legacy_layouts_are_normalized_to_supported_variants(
    block_type: str,
    legacy_layout: str,
    canonical_layout: str,
) -> None:
    block = CaseBlockInput(
        type=block_type,
        content_ru={},
        content_en={},
        settings={"layout": legacy_layout},
    )

    assert block.settings.layout == canonical_layout


def test_unknown_layout_is_rejected() -> None:
    with pytest.raises(ValidationError):
        CaseBlockInput(
            type="process",
            content_ru={"items": []},
            content_en={"items": []},
            settings={"layout": "experimental"},
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
    assert block.settings.layout == "chapter"

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
        content_ru={
            "kicker": "Кейс",
            "eyebrow": "О проекте",
            "title": "Ключевой тезис",
            "body": "Описание",
            "tags": ["Nuxt 3", "FastAPI"],
        },
        content_en={
            "kicker": "Case",
            "eyebrow": "About",
            "title": "Key statement",
            "body": "Description",
            "tags": ["Nuxt 3", "FastAPI"],
        },
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


def test_video_block_preserves_playback_preferences() -> None:
    block = CaseBlockInput(
        type="video",
        content_ru={
            "video_url": "/case/network.mp4",
            "autoplay": True,
            "loop": True,
            "muted": True,
            "controls": False,
        },
        content_en={"video_url": "/case/network.mp4"},
    )

    assert block.content_ru["autoplay"] is True
    assert block.content_ru["loop"] is True
    assert block.content_ru["muted"] is True
    assert block.content_ru["controls"] is False
    assert block.content_en["autoplay"] is False
    assert block.content_en["controls"] is True


def test_process_preserves_disclosure_media_tags_and_plain_surface() -> None:
    block = CaseBlockInput(
        type="process",
        content_ru={
            "items": [
                {
                    "title": "Исследование",
                    "description": "Текст",
                    "image_url": "/process.gif",
                    "image_alt": "Команда",
                    "video_url": "/process.mp4",
                    "poster_url": "/poster.webp",
                    "media_size": "compact",
                    "tags": ["UX", "Strategy"],
                }
            ]
        },
        content_en={
            "items": [
                {
                    "title": "Research",
                    "description": "Copy",
                    "image_url": "/process.gif",
                    "image_alt": "Team",
                    "video_url": "/process.webm",
                    "poster_url": "/poster.webp",
                    "media_size": "full",
                    "tags": ["UX", "Strategy"],
                }
            ]
        },
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
        content_en={
            "title": "Custom block",
            "elements": [{**element, "text": "Free heading"}],
        },
        settings={"layout": "freeform", "freeform_height_mobile": 720},
    )

    assert block.content_ru["elements"][0]["desktop"]["w"] == 50
    assert block.content_en["elements"][0]["text"] == "Free heading"
    assert block.settings.freeform_height_mobile == 720


def test_cleanup_migration_removes_gallery_and_canonicalizes_layouts() -> None:
    cleanup = load_legacy_cleanup_migration()
    blocks = [
        {
            "id": str(uuid4()),
            "type": "gallery",
            "content_ru": {"items": []},
            "content_en": {"items": []},
            "settings": {"layout": "grid"},
            "sort_order": 1,
            "is_visible": True,
        },
        {
            "id": str(uuid4()),
            "type": "process",
            "content_ru": {"items": []},
            "content_en": {"items": []},
            "settings": {"layout": "story"},
            "sort_order": 4,
            "is_visible": True,
        },
        {
            "id": str(uuid4()),
            "type": "results",
            "content_ru": {"items": []},
            "content_en": {"items": []},
            "settings": {"layout": "panel"},
            "sort_order": 9,
            "is_visible": True,
        },
    ]

    normalized = cleanup._normalize_blocks(blocks)

    assert [block["type"] for block in normalized] == ["process", "results"]
    assert [block["settings"]["layout"] for block in normalized] == [
        "chapter",
        "statement",
    ]
    assert [block["sort_order"] for block in normalized] == [0, 1]


def test_revision_restore_drops_deprecated_blocks_and_normalizes_layouts() -> None:
    restored = restored_blocks(
        [
            {
                "type": "gallery",
                "content_ru": {"items": []},
                "content_en": {"items": []},
                "settings": {"layout": "grid"},
            },
            {
                "type": "process",
                "content_ru": {"items": []},
                "content_en": {"items": []},
                "settings": {"layout": "story"},
            },
        ]
    )

    assert [block.type for block in restored] == ["process"]
    assert restored[0].settings.layout == "chapter"


def test_zagorulko_story_is_a_bilingual_three_task_document() -> None:
    migration = load_zagorulko_story_migration()
    blocks = migration._story_blocks()
    document = CaseDocumentUpdate(meta=migration._meta(), blocks=blocks)

    assert document.meta.name_ru == "Автоматизация рабочих процессов ИП Загорулько"
    prose_types = {"text", "challenge_solution", "process", "results"}
    for block in document.blocks:
        if block.type not in prose_types:
            continue
        for content in (block.content_ru, block.content_en):
            assert content["eyebrow"]
            if block.id == migration._uuid("about"):
                assert content["title"]
            else:
                assert content["title"] == ""
                assert (
                    content.get("body")
                    or content.get("challenge")
                    or content.get("summary")
                )
    assert [block.type for block in document.blocks] == [
        "hero",
        "text",
        "challenge_solution",
        "image",
        "text",
        "process",
        "comparison",
        "results",
        "technologies",
        "challenge_solution",
        "video",
        "process",
        "comparison",
        "results",
        "technologies",
        "challenge_solution",
        "image",
        "process",
        "technologies",
        "image",
        "results",
        "technologies",
    ]
    by_name = {
        name: next(
            block for block in document.blocks if block.id == migration._uuid(name)
        )
        for name in (
            "recognition-flow",
            "recognition-media-pair",
            "crew-input",
            "crew-algorithm",
            "crew-media-pair",
            "crew-stack",
            "finance-flow",
            "finance-system-map",
            "finance-stack",
        )
    }
    for name, stage_count in (
        ("recognition-flow", 3),
        ("crew-algorithm", 4),
        ("finance-flow", 3),
    ):
        for content in (by_name[name].content_ru, by_name[name].content_en):
            assert content["eyebrow"]
            assert content["title"] == ""
            assert content["summary"]
            assert len(content["items"]) == stage_count
            for item in content["items"]:
                paragraphs = item["description"].split("\n\n")
                assert len(paragraphs) >= 2
                assert all(paragraph.strip() for paragraph in paragraphs)
        assert all(
            item["media_type"] in {"image", "video"} and item["media_note"]
            for item in by_name[name].content_ru["items"]
        )
        assert all(
            item["media_type"] in {"image", "video"} and item["media_note"]
            for item in by_name[name].content_en["items"]
        )
    for name in ("recognition-media-pair", "crew-input", "crew-media-pair"):
        for content in (by_name[name].content_ru, by_name[name].content_en):
            assert content["eyebrow"] == ""
            assert content["title"] == ""
    for name in ("recognition-media-pair", "crew-media-pair"):
        media_pair = by_name[name]
        assert media_pair.type == "comparison"
        assert media_pair.settings.layout == "side-by-side"
        assert media_pair.settings.model_dump()["media_aspect"] == "portrait"
        assert media_pair.settings.model_dump()["caption_position"] == "below"
        assert media_pair.content_ru["before_media_type"] == "video"
        assert media_pair.content_ru["after_media_type"] == "image"
        assert media_pair.content_ru["autoplay"] is True
        assert media_pair.content_ru["loop"] is True
        assert media_pair.content_ru["muted"] is True
        assert media_pair.content_ru["controls"] is False
    assert by_name["crew-stack"].settings.layout == "map"
    assert by_name["finance-stack"].settings.layout == "map"
    assert (
        by_name["finance-system-map"].settings.model_dump()["map_background"]
        == "#F5F6FB"
    )
    assert all(block.type != "media_hero" for block in document.blocks)
    assert sum(block.type == "image" for block in document.blocks) == 3
    assert sum(block.type == "video" for block in document.blocks) == 1
    assert sum(block.type == "comparison" for block in document.blocks) == 2
    assert all(
        block.content_ru["autoplay"] is True
        and block.content_ru["loop"] is True
        and block.content_ru["muted"] is True
        and block.content_ru["controls"] is False
        for block in document.blocks
        if block.type == "video"
    )
    assert all(
        block.settings.width == "wide"
        for block in document.blocks
        if block.type in {"image", "video"}
    )
    assert (
        by_name["crew-input"].content_ru["video_url"].endswith("crew-network-graph.mp4")
    )
    assert by_name["crew-input"].content_ru["autoplay"] is True
    assert by_name["crew-input"].content_ru["loop"] is True
    assert by_name["crew-input"].content_ru["muted"] is True
    assert by_name["crew-input"].content_ru["controls"] is False

    serialized_ru = str([block.content_ru for block in document.blocks])
    serialized_en = str([block.content_en for block in document.blocks])
    assert "специально обезличены" in serialized_ru
    assert "ФОТО 1 · ИСХОДНЫЙ ЗАКАЗ" in serialized_ru
    assert "ВИДЕО · ПРОЦЕСС РАСПОЗНАВАНИЯ" in serialized_ru
    assert "ФОТО · РЕЗУЛЬТАТ" in serialized_ru
    assert "Yandex Vision OCR" in serialized_ru
    assert "GREEN-API" in serialized_ru
    assert "50–60 человек" in serialized_ru
    assert "40 воспроизводимых перестроений" in serialized_ru
    assert "ВИДЕОВИЗУАЛИЗАЦИЯ · КАРТА СВЯЗЕЙ" in serialized_ru
    assert "Три бригадира показаны как опорные узлы" in serialized_ru
    assert "Числа на линиях" in serialized_ru
    assert "вручную перетаскивает одного участника" not in serialized_ru
    assert "ФОТО · ГОТОВЫЕ БРИГАДЫ" in serialized_ru
    assert "Через две недели те же заказы нужны уже для расчётов" in serialized_ru
    assert "ФОТО 6 · ИСХОДНЫЕ СООБЩЕНИЯ" in serialized_ru
    assert "ФОТО 7 · ГОТОВЫЙ ПЕРИОД" in serialized_ru
    assert (
        "заказ получает отдельный статус и не участвует в начислениях" in serialized_ru
    )
    assert "Google Apps Script" in serialized_ru
    assert "deliberately anonymised" in serialized_en
    assert "ГБУ" not in serialized_ru
    assert "Ритуал" not in serialized_ru
    assert "Михаил" not in serialized_ru
    assert "Misha Sheets" not in serialized_ru
    assert "Crew Assignment" not in serialized_ru


def test_zagorulko_russian_copy_has_no_dash_or_colon_separators() -> None:
    migration = load_zagorulko_story_migration()

    def check_copy(value: object, path: str) -> None:
        if isinstance(value, dict):
            for key, child in value.items():
                if not key.endswith("_url"):
                    check_copy(child, f"{path}.{key}")
        elif isinstance(value, list):
            for index, child in enumerate(value):
                check_copy(child, f"{path}[{index}]")
        elif isinstance(value, str):
            assert not any(
                separator in value for separator in ("—", ":", " – ", " - ")
            ), path

    for block in migration._story_blocks():
        check_copy(block["content_ru"], str(block["id"]))
    for key, value in migration._meta().items():
        if key.endswith("_ru"):
            check_copy(value, f"meta.{key}")


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


def test_related_case_selection_survives_block_roundtrip():
    block = CaseBlockInput(
        type="next_case",
        content_ru={"case_slugs": ["demo-b", "demo-a"], "card_cta_label": "View"},
    )
    restored = CaseBlockInput.model_validate(block.model_dump())
    assert restored.content_ru["case_slugs"] == ["demo-b", "demo-a"]
    assert restored.content_ru["card_cta_label"] == "View"


def test_related_case_selection_limits_and_legacy_compatibility():
    with pytest.raises(ValidationError):
        CaseBlockInput(
            type="next_case", content_ru={"case_slugs": ["a", "b", "c", "d"]}
        )
    block = CaseBlockInput(type="next_case", content_ru={"case_slug": "legacy-demo"})
    assert block.content_ru["case_slug"] == "legacy-demo"
    assert block.content_ru["case_slugs"] is None


def test_case_order_comes_from_the_project_column_not_the_draft() -> None:
    draft = CaseMeta(
        slug="signal", name_ru="Сигнал", name_en="Signal", sort_order=9
    ).model_dump(mode="json")
    project = SimpleNamespace(draft_data=draft, sort_order=2, is_featured=False)

    assert project_meta(project).sort_order == 2

    apply_published_meta(
        project, CaseMeta.model_validate({**draft, "is_featured": True})
    )
    assert project.sort_order == 2
    assert project.is_featured is True


def test_reordering_a_published_case_does_not_flag_a_new_draft() -> None:
    meta = CaseMeta(slug="signal", name_ru="Сигнал", name_en="Signal", sort_order=0)
    block = SimpleNamespace(
        id=uuid4(),
        type="hero",
        content_ru={"title": "Сигнал"},
        content_en={"title": "Signal"},
        settings={"layout": "case-header"},
        sort_order=0,
        is_visible=True,
    )
    project = SimpleNamespace(
        status="published",
        draft_data=meta.model_dump(mode="json"),
        blocks=[block],
        sort_order=0,
        published_data=None,
    )
    project.published_data = draft_snapshot(project)
    assert has_unpublished_changes(project) is False

    project.sort_order = 5  # moved in the admin list
    assert project_meta(project).sort_order == 5
    assert has_unpublished_changes(project) is False

    block.content_ru = {"title": "Другой заголовок"}
    assert has_unpublished_changes(project) is True
