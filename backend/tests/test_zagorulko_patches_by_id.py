import importlib.util
from pathlib import Path

ROOT = Path(__file__).parents[1]
spec = importlib.util.spec_from_file_location(
    "zagorulko_by_id", ROOT / "alembic/versions/y1h2c3d4e5f6_zagorulko_patches_by_id.py"
)
migration = importlib.util.module_from_spec(spec)
spec.loader.exec_module(migration)


def example_document():
    return {
        "blocks": [
            {
                "id": "process",
                "type": "process",
                "content_ru": {
                    "items": [
                        {
                            "title": "Проверка перед отправкой",
                            "media_type": "image",
                            "image_url": "/cases/gbu-process-automation/2026-09/app-edit.png",
                        }
                    ]
                },
                "content_en": {
                    "items": [{"title": "Review before sending", "media_type": "image"}]
                },
            },
            {
                "id": "stack",
                "type": "technologies",
                "content_ru": {"items": [{"id": "python", "label": "Python", "related_ids": []}]},
                "content_en": {"items": [{"id": "python", "label": "Python", "related_ids": []}]},
            },
        ]
    }


def test_composes_both_patches_and_is_idempotent():
    result = migration.patch_document(example_document())
    item = result["blocks"][0]["content_ru"]["items"][0]
    assert item["media_type"] == "video"
    assert item["video_url"] == "/cases/gbu-process-automation/2026-09/review.mp4"
    assert result["blocks"][1]["content_ru"]["items"][0]["related_ids"] == [
        "flask",
        "ortools",
        "pillow",
    ]
    assert migration.patch_document(result) == result


def test_targets_the_shipped_project_id_and_both_slugs():
    mobile = ROOT / "alembic/data/zagorulko_mobile_media_20260907.json"
    assert migration.PROJECT_ID in mobile.read_text(encoding="utf-8")
    assert set(migration.SLUGS) == {"gbu-process-automation", "process-automation"}
