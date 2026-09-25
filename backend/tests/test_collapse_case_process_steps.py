import importlib.util
from pathlib import Path

ROOT = Path(__file__).parents[1]
spec = importlib.util.spec_from_file_location(
    "collapse_process_steps", ROOT / "alembic/versions/z8p9q0r1s2t3_collapse_case_process_steps.py"
)
migration = importlib.util.module_from_spec(spec)
spec.loader.exec_module(migration)


def example_document():
    return {
        "title": "Example",
        "blocks": [
            {"id": "chapter", "type": "process", "settings": {"layout": "chapter", "open_first": True}},
            {"id": "unset", "type": "process", "settings": {"layout": "story"}},
            {"id": "phone", "type": "process", "settings": {"layout": "phone-showcase", "open_first": True}},
            {"id": "text", "type": "text", "settings": {"open_first": True}},
        ],
    }


def test_collapses_accordions_but_not_the_phone_showcase():
    result = migration.patch_document(example_document())
    settings = {block["id"]: block["settings"] for block in result["blocks"]}
    assert settings["chapter"] == {"layout": "chapter", "open_first": False}
    assert settings["unset"]["open_first"] is False
    assert settings["phone"]["open_first"] is True
    assert settings["text"]["open_first"] is True
    assert result["title"] == "Example"
    assert migration.patch_document(result) == result


def test_leaves_ssag_untouched():
    assert migration.KEEP_SLUGS == ("ssag",)
