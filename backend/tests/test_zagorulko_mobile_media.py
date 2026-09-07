import importlib.util
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).parents[1]
spec = importlib.util.spec_from_file_location(
    "mobile_media", ROOT / "alembic/versions/e1t2u3v4w5x6_zagorulko_mobile_media.py"
)
migration = importlib.util.module_from_spec(spec)
spec.loader.exec_module(migration)


def example_document():
    return {
        "meta": {
            "slug": "gbu-process-automation",
            "name_ru": "Synthetic case",
            "private_draft_field": "keep",
        },
        "blocks": [
            {
                "id": "hero",
                "type": "hero",
                "sort_order": 0,
                "settings": {},
                "content_ru": {"title": "Preserve this title", "subtitle": "Published subtitle"},
                "content_en": {"title": "Keep"},
            },
            {
                "id": "3f1d741c-0ab2-5a56-add0-a84c8b23f40e",
                "type": "process",
                "sort_order": 1,
                "settings": {"anchor": "keep-anchor"},
                "content_ru": {"items": [{"description": "Keep first description"}, {}, {}]},
                "content_en": {"items": [{"description": "Keep English description"}, {}, {}]},
            },
            {
                "id": "unrelated",
                "type": "text",
                "sort_order": 2,
                "settings": {},
                "content_ru": {"body": "Untouched"},
                "content_en": {"body": "Untouched"},
            },
        ],
    }


def test_patch_preserves_unrelated_edits_and_does_not_mutate_input():
    document = example_document()
    original = deepcopy(document)
    result = migration.patch_document(document, migration.load_patch())
    assert document == original
    assert result["meta"]["private_draft_field"] == "keep"
    assert result["blocks"][0]["content_ru"]["title"] == "ИП Загорулько"
    assert result["blocks"][0]["content_ru"]["subtitle"] == "Published subtitle"
    process = result["blocks"][2]
    assert process["settings"]["anchor"] == "keep-anchor"
    assert process["content_ru"]["items"][0]["description"] == "Keep first description"
    assert process["content_en"]["items"][0]["description"] == "Keep English description"
    assert result["blocks"][-1]["content_ru"] == original["blocks"][-1]["content_ru"]


def test_patch_is_idempotent_and_public_draft_stay_separate():
    patch = migration.load_patch()
    draft = example_document()
    public = example_document()
    draft["blocks"][0]["content_ru"]["subtitle"] = "Unpublished subtitle"
    public_result = migration.patch_document(public, patch)
    draft_result = migration.patch_document(draft, patch)
    assert public_result["blocks"][0]["content_ru"]["subtitle"] == "Published subtitle"
    assert draft_result["blocks"][0]["content_ru"]["subtitle"] == "Unpublished subtitle"
    assert migration.patch_document(public_result, patch) == public_result
    assert sum(b["type"] == "media_hero" for b in public_result["blocks"]) == 1


def test_every_media_reference_exists_and_matches_case_scope():
    patch = migration.load_patch()
    public = ROOT.parent / "frontend/public"

    def inspect(value):
        if isinstance(value, str) and value.startswith("/cases/"):
            assert value.startswith("/cases/gbu-process-automation/")
            assert (public / value.lstrip("/")).is_file(), value
        elif isinstance(value, dict):
            for item in value.values():
                inspect(item)
        elif isinstance(value, list):
            for item in value:
                inspect(item)

    inspect(patch)
