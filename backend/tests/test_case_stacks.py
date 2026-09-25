import importlib.util
import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).parents[1]
spec = importlib.util.spec_from_file_location(
    "case_stacks", ROOT / "alembic/versions/x0g1b2c3d4e5_case_stacks.py"
)
migration = importlib.util.module_from_spec(spec)
spec.loader.exec_module(migration)


def stack_block(document):
    return next(b for b in document["blocks"] if b["type"] == "technologies")


def example_document():
    return {
        "blocks": [
            {
                "id": "hero",
                "type": "hero",
                "content_ru": {"title": "Keep"},
                "content_en": {"title": "Keep"},
            },
            {
                "id": "stack",
                "type": "technologies",
                "content_ru": {
                    "eyebrow": "Стек проекта",
                    "summary": "Старое описание",
                    "items": [
                        {
                            "id": "next",
                            "label": "Edited label",
                            "icon": "react",
                            "group": "Приложение",
                            "description": "Edited description",
                            "related_ids": [],
                            "x": None,
                            "y": None,
                        },
                        {
                            "id": "custom",
                            "label": "Свой пункт",
                            "group": "Прочее",
                            "description": "Stays",
                            "related_ids": [],
                        },
                    ],
                },
                "content_en": {
                    "eyebrow": "Technology stack",
                    "summary": "Old summary",
                    "items": [
                        {
                            "id": "next",
                            "label": "Next.js / React",
                            "icon": "react",
                            "group": "Application",
                            "description": "Old",
                            "related_ids": [],
                        },
                        {
                            "id": "custom",
                            "label": "Custom",
                            "group": "Other",
                            "description": "Stays",
                            "related_ids": [],
                        },
                    ],
                },
            },
        ]
    }


def test_mymit_patch_merges_by_id_appends_new_items_and_keeps_custom_ones():
    patch = migration.load_patch()["cases"]["mymit"]
    document = example_document()
    original = deepcopy(document)
    result = migration.patch_document(document, patch)
    assert document == original
    ru = stack_block(result)["content_ru"]
    ids = [item["id"] for item in ru["items"]]
    assert ids[:2] == ["next", "custom"]
    assert {"charts", "alice", "firmware", "ota"} <= set(ids)
    first = ru["items"][0]
    assert first["icon"] == "nextdotjs"
    assert first["related_ids"] == ["charts", "push", "fastapi", "payments"]
    assert first["description"] != "Edited description"
    assert ru["items"][1]["description"] == "Stays"
    assert ru["summary"] == patch["summary"]["ru"]
    en = stack_block(result)["content_en"]
    assert en["items"][0]["label"] == "Next.js / React"
    assert en["items"][0]["group"] == "Application"
    assert len(en["items"]) == len(ru["items"])
    assert result["blocks"][0] == original["blocks"][0]
    assert migration.patch_document(result, patch) == result


def test_zagorulko_patch_only_links_existing_items():
    patch = migration.load_patch()["cases"]["gbu-process-automation"]
    document = example_document()
    stack_block(document)["content_ru"]["items"][0]["id"] = "python"
    stack_block(document)["content_en"]["items"][0]["id"] = "python"
    result = migration.patch_document(document, patch)
    ru = stack_block(result)["content_ru"]
    assert [item["id"] for item in ru["items"]] == ["python", "custom"]
    assert ru["items"][0]["related_ids"] == ["flask", "ortools", "pillow"]
    assert ru["items"][0]["label"] == "Edited label"
    assert ru["summary"] == "Старое описание"


def test_links_point_at_listed_items_and_icons_exist():
    data = migration.load_patch()["cases"]
    icons = ROOT.parent / "frontend/public/icons/technology"
    for slug, case_patch in data.items():
        ids = {item["id"] for item in case_patch["items"]}
        for item in case_patch["items"]:
            assert item["id"] not in item["related_ids"], (slug, item["id"])
            assert set(item["related_ids"]) <= ids, (slug, item["id"])
            if "icon" in item:
                assert (icons / f"{item['icon']}.svg").is_file(), item["icon"]
            for lang in ("ru", "en"):
                if lang in item:
                    assert item[lang]["label"] and item[lang]["group"] and item[lang]["description"]


def test_authored_mymit_stack_matches_patch():
    authored = json.loads((ROOT.parent / "media/mymit-case/case.json").read_text(encoding="utf-8"))
    patch = migration.load_patch()["cases"]["mymit"]
    block = stack_block(authored)
    assert [item["id"] for item in block["content_ru"]["items"]][-4:] == [
        "charts",
        "alice",
        "firmware",
        "ota",
    ]
    assert block["content_ru"]["summary"] == patch["summary"]["ru"]
    assert migration.patch_document(authored, patch) == authored
