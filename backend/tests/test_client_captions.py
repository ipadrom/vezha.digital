from copy import deepcopy
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from test_ssag_client_block import migration as client_block_migration


def migration():
    path = Path(__file__).parents[1] / "alembic/versions/c2t3u4v5w6x7_client_captions.py"
    spec = spec_from_file_location("client_captions", path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def document():
    other = {
        "id": "text",
        "type": "text",
        "content_ru": {"caption": "Репетитор английского · Путешественник"},
        "content_en": {"caption": "English tutor · Traveller"},
        "settings": {"layout": "overview"},
        "sort_order": 1,
        "is_visible": True,
    }
    return {"meta": {"slug": "ssag"}, "blocks": [client_block_migration().load_block(), other]}


def test_replaces_only_the_shipped_client_caption():
    module = migration()
    before = document()
    after = module.patch_document(before, "ssag")

    client = after["blocks"][0]
    assert client["content_ru"]["caption"] == "Дипломированный лингвист · Фаундер SSAG"
    assert client["content_en"]["caption"] == "Qualified linguist · SSAG founder"
    assert after["blocks"][1] == before["blocks"][1]
    assert module.patch_document(after, "ssag") == after


def test_keeps_a_caption_edited_in_the_admin():
    module = migration()
    edited = document()
    edited["blocks"][0]["content_ru"]["caption"] = "Edited"
    after = module.patch_document(deepcopy(edited), "ssag")
    assert after["blocks"][0]["content_ru"]["caption"] == "Edited"
    assert after["blocks"][0]["content_en"]["caption"] == "Qualified linguist · SSAG founder"


def test_names_konstantin_as_the_support_agency_founder():
    module = migration()
    block = document()["blocks"][0]
    block["content_ru"]["caption"] = "Предприниматель · МИТ"
    block["content_en"]["caption"] = "Entrepreneur · MIT"
    after = module.patch_document({"meta": {"slug": "mymit"}, "blocks": [block]}, "mymit")
    assert after["blocks"][0]["content_ru"]["caption"] == "Основатель SUPPORT AGENCY · МИТ"
    assert after["blocks"][0]["content_en"]["caption"] == "Founder of SUPPORT AGENCY · MIT"
    ssag = module.patch_document({"meta": {"slug": "ssag"}, "blocks": [deepcopy(block)]}, "ssag")
    assert ssag["blocks"][0]["content_ru"]["caption"] == "Предприниматель · МИТ"
