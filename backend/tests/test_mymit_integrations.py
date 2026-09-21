from copy import deepcopy
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import sqlalchemy as sa
from test_mymit_case_release import migration as release_migration


def migration():
    path = Path(__file__).parents[1] / "alembic/versions/n0c1d2e3f4a5_mymit_integrations.py"
    spec = spec_from_file_location("mymit_integrations", path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def old_document():
    document = release_migration().load_document()
    for block in document["blocks"]:
        heading = block.get("content_ru", {}).get("eyebrow")
        for language in ("content_ru", "content_en"):
            if heading == "Уведомления":
                block[language]["items"][1]["title"] = (
                    "Голосовые объявления по событиям брони"
                    if language == "content_ru"
                    else "Booking-triggered announcements"
                )
                block[language]["items"][1]["description"] = "Old announcement copy"
            if heading == "Кабинка и приложение":
                block[language]["items"] = block[language]["items"][:2]
                block[language]["items"][0]["title"] = (
                    "Подключение и доступ устройств"
                    if language == "content_ru"
                    else "Device connection and access"
                )
                block[language]["items"][0]["description"] = "Old MQTT copy"
    return document


def test_patch_preserves_other_edits_and_is_idempotent():
    module = migration()
    before = old_document()
    before["meta"]["name_ru"] = "Editorial title"
    before["blocks"][0]["content_ru"]["title"] = "Editorial hero"
    after = module.patch_document(before)
    assert after["meta"] == before["meta"]
    assert after["blocks"][0] == before["blocks"][0]
    assert module.patch_document(after) == after
    for block in after["blocks"]:
        if block.get("content_ru", {}).get("eyebrow") == "Кабинка и приложение":
            assert len(block["content_ru"]["items"]) == 4
            assert len(block["content_en"]["items"]) == 4
    assert before != after


def test_database_update_preserves_drafts_ids_other_cases_and_history():
    metadata = sa.MetaData()
    projects = sa.Table(
        "projects",
        metadata,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("slug", sa.String),
        sa.Column("name_ru", sa.String),
        sa.Column("is_active", sa.Boolean),
        sa.Column("status", sa.String),
        sa.Column("draft_data", sa.JSON),
        sa.Column("published_data", sa.JSON),
        *[sa.Column(k, sa.DateTime) for k in ("created_at", "updated_at", "published_at")],
    )
    blocks = sa.Table(
        "project_blocks",
        metadata,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("project_id", sa.String),
        sa.Column("type", sa.String),
        sa.Column("sort_order", sa.Integer),
        sa.Column("is_visible", sa.Boolean),
        *[sa.Column(k, sa.JSON) for k in ("content_ru", "content_en", "settings")],
    )
    revisions = sa.Table(
        "project_revisions",
        metadata,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("project_id", sa.String),
        sa.Column("version", sa.Integer),
        sa.Column("snapshot", sa.JSON),
        sa.Column("created_at", sa.DateTime),
    )
    engine = sa.create_engine("sqlite://")
    metadata.create_all(engine)
    with engine.begin() as db:
        pid = release_migration().seed_case(db, old_document())
        original = db.execute(sa.select(projects.c.published_data)).scalar_one()
        first = original["blocks"][0]
        edit = deepcopy(first["content_ru"])
        edit["title"] = "Unpublished hero edit"
        db.execute(blocks.update().where(blocks.c.id == first["id"]).values(content_ru=edit))
        db.execute(projects.insert().values(id="other", slug="other", name_ru="Untouched"))
        migration().upgrade_cases(db)
        updated = db.execute(
            sa.select(projects.c.published_data).where(projects.c.id == pid)
        ).scalar_one()
        assert updated == migration().patch_document(original)
        assert (
            db.execute(
                sa.select(blocks.c.content_ru).where(blocks.c.id == first["id"])
            ).scalar_one()
            == edit
        )
        assert (
            db.execute(sa.select(projects.c.name_ru).where(projects.c.id == "other")).scalar_one()
            == "Untouched"
        )
        assert set(db.execute(sa.select(blocks.c.id)).scalars()) == {
            b["id"] for b in original["blocks"]
        }
        snapshots = list(db.execute(sa.select(revisions.c.snapshot)).scalars())
        assert original in snapshots
        assert any(s["blocks"][0]["content_ru"] == edit for s in snapshots)
        count = len(snapshots)
        migration().upgrade_cases(db)
        assert db.execute(sa.select(sa.func.count()).select_from(revisions)).scalar_one() == count
