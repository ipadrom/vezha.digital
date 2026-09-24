from copy import deepcopy
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from test_mymit_client_block import migration as client_block_migration


def migration():
    path = (
        Path(__file__).parents[1]
        / "alembic/versions/u7d8e9f0a1b2_mymit_client_button_labels.py"
    )
    spec = spec_from_file_location("mymit_client_button_labels", path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def old_document():
    block = client_block_migration().load_block()
    block["content_ru"]["project_label"] = "Открыть проект"
    block["content_en"]["project_label"] = "Visit the project"
    other = {
        "id": "text",
        "type": "text",
        "content_ru": {"project_label": "Открыть проект", "body": "text"},
        "content_en": {"project_label": "Visit the project", "body": "text"},
        "settings": {"layout": "overview"},
        "sort_order": 1,
        "is_visible": True,
    }
    return {"meta": {"slug": "mymit"}, "blocks": [block, other]}


def test_only_the_shipped_project_label_is_shortened():
    module = migration()
    before = old_document()
    before["blocks"][0]["content_ru"]["contact_label"] = "Editorial contact"
    after = module.patch_document(before)

    client = after["blocks"][0]
    assert client["content_ru"]["project_label"] == "Открыть"
    assert client["content_en"]["project_label"] == "Open"
    assert client["content_ru"]["contact_label"] == "Editorial contact"
    assert after["blocks"][1] == before["blocks"][1]
    assert after["meta"] == before["meta"]
    assert module.patch_document(deepcopy(after)) == after

    edited = old_document()
    edited["blocks"][0]["content_ru"]["project_label"] = "На сайт"
    assert (
        module.patch_document(edited)["blocks"][0]["content_ru"]["project_label"]
        == "На сайт"
    )
    assert (
        module.patch_document(edited)["blocks"][0]["content_en"]["project_label"]
        == "Open"
    )
