from copy import deepcopy
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import sqlalchemy as sa

from app.schemas.case_builder import CaseBlockInput

spec = spec_from_file_location(
    "phone_showcase", Path(__file__).parents[1] / "alembic/versions/g3v4w5x6y7z8_phone_showcase.py"
)
migration = module_from_spec(spec)
spec.loader.exec_module(migration)


def block(text="Draft only"):
    return {
        "id": migration.TARGETS["gbu-process-automation"][0],
        "type": "process",
        "settings": {"layout": "chapter", "anchor": "keep"},
        "content_ru": {
            "items": [{"title": text, "video_url": "/demo.mp4", "poster_url": "/demo.png"}]
        },
        "content_en": {
            "items": [
                {
                    "title": "Example",
                    "image_url": "/example.png",
                    "secondary_image_url": "/example-2.png",
                    "image_label": "First",
                    "secondary_image_label": "Second",
                }
            ]
        },
    }


def test_schema_roundtrip_and_legacy_default():
    value = block()
    value["settings"]["layout"] = "phone-showcase"
    saved = CaseBlockInput.model_validate(value).model_dump(mode="json")
    restored = CaseBlockInput.model_validate(saved)
    assert restored.settings.layout == "phone-showcase"
    assert restored.content_ru["items"][0]["video_url"] == "/demo.mp4"
    assert restored.content_en["items"][0]["secondary_image_label"] == "Second"
    assert CaseBlockInput.model_validate(block()).settings.layout == "chapter"


def test_patch_is_scoped_idempotent_and_does_not_mutate_input():
    value = block()
    before = deepcopy(value)
    updated = migration.patch_block(value, "gbu-process-automation")
    assert updated["settings"] == {"layout": "phone-showcase", "anchor": "keep"}
    assert updated["content_ru"] == value["content_ru"]
    assert value == before
    assert migration.patch_block(updated, "gbu-process-automation") == updated
    assert migration.patch_block(value, "other-case") == value
    value["settings"]["layout"] = "freeform"
    assert migration.patch_block(value, "gbu-process-automation") == value


def test_migration_keeps_public_and_draft_separate_and_creates_one_revision():
    schema = sa.MetaData()
    projects = sa.Table(
        "projects",
        schema,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("slug", sa.String),
        sa.Column("published_data", sa.JSON),
        sa.Column("draft_data", sa.JSON),
        sa.Column("published_at", sa.DateTime),
        sa.Column("updated_at", sa.DateTime),
    )
    blocks = sa.Table(
        "project_blocks",
        schema,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("project_id", sa.String),
        sa.Column("type", sa.String),
        sa.Column("settings", sa.JSON),
        sa.Column("content_ru", sa.JSON),
        sa.Column("content_en", sa.JSON),
    )
    revisions = sa.Table(
        "project_revisions",
        schema,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("project_id", sa.String),
        sa.Column("version", sa.Integer),
        sa.Column("snapshot", sa.JSON),
        sa.Column("created_at", sa.DateTime),
    )
    engine = sa.create_engine("sqlite://")
    public = {"meta": {"slug": "gbu-process-automation"}, "blocks": [block("Published text")]}
    other = block("Unrelated algorithm")
    other["id"] = "other-block"
    schema.create_all(engine)
    with engine.begin() as connection:
        connection.execute(
            projects.insert().values(
                id="project",
                slug="gbu-process-automation",
                draft_data={"name_ru": "Unpublished name"},
                published_data=public,
            )
        )
        connection.execute(blocks.insert().values(project_id="project", **block()))
        connection.execute(blocks.insert().values(project_id="project", **other))
        migration.upgrade_cases(connection)
        saved = connection.execute(sa.select(projects)).mappings().one()
        draft = (
            connection.execute(sa.select(blocks).where(blocks.c.id == block()["id"]))
            .mappings()
            .one()
        )
        assert draft["content_ru"]["items"][0]["title"] == "Draft only"
        assert (
            saved["published_data"]["blocks"][0]["content_ru"]["items"][0]["title"]
            == "Published text"
        )
        assert saved["draft_data"] == {"name_ru": "Unpublished name"}
        assert saved["published_data"]["blocks"][0]["settings"]["layout"] == "phone-showcase"
        assert (
            connection.execute(
                sa.select(blocks.c.settings).where(blocks.c.id == "other-block")
            ).scalar()
            == other["settings"]
        )
        migration.upgrade_cases(connection)
        assert connection.execute(sa.select(sa.func.count()).select_from(revisions)).scalar() == 1


def test_algorithm_converts_for_both_slugs_without_changing_media():
    for slug in ("gbu-process-automation", "process-automation"):
        value = block()
        value["id"] = migration.TARGETS[slug][1]
        updated = migration.patch_block(value, slug)
        assert updated["settings"]["layout"] == "phone-showcase"
        assert updated["content_ru"] == value["content_ru"]
        assert updated["content_en"] == value["content_en"]


def test_ssag_keeps_authored_copy_and_labels():
    value = block()
    value["id"] = migration.TARGETS["ssag"][0]
    value["content_ru"] = {
        "summary": "Описание. Скриншоты сняты в эмуляторе приложения.",
        "items": [{"image_url": "/cases/ssag/screens/map.png", "image_label": "Моя карта"}],
    }
    updated = migration.patch_block(value, "ssag")
    assert updated["content_ru"]["summary"] == "Описание."
    assert updated["content_ru"]["items"][0]["image_label"] == "Моя карта"
    assert updated["content_ru"]["items"][0]["secondary_image_label"] == "Карточка места"
