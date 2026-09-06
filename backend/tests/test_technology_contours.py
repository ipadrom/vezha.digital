from copy import deepcopy
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.schemas.case_builder import CaseBlockInput


def migration(name):
    path = Path(__file__).parents[1] / "alembic/versions" / name
    spec = spec_from_file_location(name.removesuffix(".py"), path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_enrichment_is_scoped_idempotent_and_preserves_current_copy():
    story = migration("w3l4m5n6o7p8_zagorulko_orders_story.py")
    contours = migration("x4m5n6o7p8q9_technology_contours.py")
    originals = story._story_blocks()
    original_copy = deepcopy(originals)
    for block in originals:
        result = contours.enrich_block(block)
        assert contours.enrich_block(result) == result
        if block["type"] != "technologies":
            assert result == block
            continue
        validated = CaseBlockInput.model_validate(result)
        assert validated.settings.layout == "contours"
        for locale in ("content_ru", "content_en"):
            assert result[locale]["title"] == block[locale]["title"]
            assert result[locale]["summary"] == block[locale]["summary"]
            items = result[locale]["items"]
            ids = {item["id"] for item in items}
            assert len(ids) == len(items)
            assert len({item["group"] for item in items}) == 4
            assert all(item["icon"] and len(item["description"]) > 50 for item in items)
            assert all(set(item["related_ids"]) <= ids for item in items)
            assert not any(item["label"] == "Docker / Gunicorn" for item in items)
        assert [item["id"] for item in result["content_ru"]["items"]] == [
            item["id"] for item in result["content_en"]["items"]
        ]
    assert originals == original_copy


def test_custom_nodes_and_edits_are_not_removed():
    contours = migration("x4m5n6o7p8q9_technology_contours.py")
    spec = contours.SPECS["stack"]
    source = {
        "title": "Current copy",
        "items": [
            {
                "label": "Python",
                "description": "An edited description",
                "icon": "network",
                "group": "Custom group",
            },
            {"label": "My additional node", "custom_property": 12},
        ],
    }
    updated = contours.enrich_content(source, spec, 0)
    assert updated["title"] == source["title"]
    assert updated["items"][0]["description"] == "An edited description"
    assert updated["items"][0]["group"] == "Custom group"
    assert updated["items"][1] == source["items"][1]
    assert len(updated["items"]) == 2


def test_unknown_case_blocks_stay_unchanged():
    contours = migration("x4m5n6o7p8q9_technology_contours.py")
    source = {
        "id": "unrelated",
        "type": "technologies",
        "content_ru": {"items": [{"label": "Python"}]},
    }
    assert contours.enrich_block(source) == source


def test_contour_contract_roundtrips_and_limits_long_descriptions():
    source = {
        "type": "technologies",
        "settings": {"layout": "contours"},
        "content_ru": {
            "items": [
                {
                    "id": "python",
                    "label": "Python",
                    "group": "Приложение",
                    "description": "Собирает заказы",
                    "icon": "python",
                    "related_ids": ["flask"],
                }
            ]
        },
    }
    block = CaseBlockInput.model_validate(source)
    restored = CaseBlockInput.model_validate(block.model_dump())
    assert restored.content_ru == block.content_ru
    assert restored.content_ru["items"][0]["related_ids"] == ["flask"]
    source["content_ru"]["items"][0]["description"] = "x" * 4001
    with pytest.raises(ValidationError):
        CaseBlockInput.model_validate(source)
