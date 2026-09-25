import importlib.util
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).parents[1]
spec = importlib.util.spec_from_file_location(
    "zagorulko_videos", ROOT / "alembic/versions/w9f0a1b2c3d4_zagorulko_case_videos.py"
)
migration = importlib.util.module_from_spec(spec)
spec.loader.exec_module(migration)


def example_document():
    return {
        "meta": {"slug": "gbu-process-automation"},
        "blocks": [
            {
                "id": "hero",
                "type": "hero",
                "content_ru": {"title": "ИП Загорулько"},
                "content_en": {"title": "Zagorulko"},
            },
            {
                "id": "process",
                "type": "process",
                "content_ru": {
                    "items": [
                        {
                            "title": "Разбор фотографии",
                            "media_type": "video",
                            "video_url": "/cases/gbu-process-automation/2026-09/orders-recorded.mp4",
                            "poster_url": "/cases/gbu-process-automation/2026-09/orders-recorded.jpg",
                        },
                        {
                            "title": "Проверка перед отправкой",
                            "description": "Edited description stays",
                            "tags": ["keep"],
                            "media_type": "image",
                            "image_url": "/cases/gbu-process-automation/2026-09/app-edit.png",
                            "media_note": "Old screenshot note",
                            "media_caption": "",
                        },
                    ]
                },
                "content_en": {
                    "items": [
                        {"title": "Reading the photograph", "media_type": "video"},
                        {
                            "title": "Review before sending",
                            "media_type": "image",
                            "image_url": "/cases/gbu-process-automation/2026-09/app-edit.png",
                        },
                    ]
                },
            },
            {
                "id": "results",
                "type": "results",
                "content_ru": {
                    "items": [
                        {"title": "Заказы с фото\n20 → 1 минута", "text": "keep"},
                        {"title": "Расчёт в таблице\nнесколько часов → 30 секунд", "text": "keep"},
                    ]
                },
                "content_en": {
                    "items": [{"title": "Orders from photos\n20 → 1 minute", "text": "keep"}]
                },
            },
            {
                "id": "sheets",
                "type": "process",
                "content_ru": {
                    "items": [
                        {
                            "title": "Обновление периода",
                            "media_type": "image",
                            "image_url": "/cases/gbu-process-automation/2026-09/sheet-totals.png",
                            "media_caption": "Пример выгрузки по заказам «Элит».",
                        }
                    ]
                },
                "content_en": {
                    "items": [
                        {
                            "title": "Updating a period",
                            "media_type": "image",
                            "media_caption": "Elite export example.",
                        }
                    ]
                },
            },
        ],
    }


def items(document, block_id, lang):
    block = next(b for b in document["blocks"] if b["id"] == block_id)
    return block["content_" + lang]["items"]


def test_clips_replace_matching_fragments_and_keep_other_fields():
    document = example_document()
    original = deepcopy(document)
    result = migration.patch_document(document, migration.load_patch())
    assert document == original
    review_ru = items(result, "process", "ru")[1]
    assert review_ru["media_type"] == "video"
    assert review_ru["video_url"] == "/cases/gbu-process-automation/2026-09/review.mp4"
    assert review_ru["poster_url"] == "/cases/gbu-process-automation/2026-09/review.jpg"
    assert review_ru["image_url"] == ""
    assert review_ru["description"] == "Edited description stays"
    assert review_ru["tags"] == ["keep"]
    assert review_ru["media_note"] != "Old screenshot note"
    assert review_ru["media_caption"] == ""
    review_en = items(result, "process", "en")[1]
    assert review_en["video_url"] == review_ru["video_url"]
    assert review_en["media_note"] != review_ru["media_note"]
    # Items outside the patch, including already recorded clips, are untouched.
    assert items(result, "process", "ru")[0] == original["blocks"][1]["content_ru"]["items"][0]
    assert result["blocks"][0] == original["blocks"][0]


def test_sheet_clips_replace_the_export_caption_and_patch_is_idempotent():
    patch = migration.load_patch()
    result = migration.patch_document(example_document(), patch)
    update_ru = items(result, "sheets", "ru")[0]
    assert update_ru["video_url"].endswith("/sheet-update.mp4")
    assert "копия" in update_ru["media_caption"]
    assert "replica" in items(result, "sheets", "en")[0]["media_caption"]
    assert migration.patch_document(result, patch) == result


def test_every_clip_and_poster_exists_in_case_scope():
    patch = migration.load_patch()
    public = ROOT.parent / "frontend/public"
    assert len(patch["items"]) == 9
    for item in patch["items"]:
        for lang in ("ru", "en"):
            fields = migration.media_fields(patch, item, lang)
            for key in ("video_url", "poster_url"):
                assert fields[key].startswith("/cases/gbu-process-automation/")
                assert (public / fields[key].lstrip("/")).is_file(), fields[key]


def test_result_figures_get_units_and_unknown_titles_stay():
    result = migration.patch_document(example_document(), migration.load_patch())
    ru = items(result, "results", "ru")
    assert ru[0]["title"] == "Заказы с фото\n20 минут → 1 минута"
    assert ru[0]["text"] == "keep"
    assert ru[1]["title"] == "Расчёт в таблице\nнесколько часов → 30 секунд"
    assert items(result, "results", "en")[0]["title"] == "Orders from photos\n20 minutes → 1 minute"
