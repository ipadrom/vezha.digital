from copy import deepcopy
from pathlib import Path

import sqlalchemy as sa
from test_ssag_refresh import load, release

from app.schemas.case_builder import CaseDocumentUpdate

refresh = load("k7z8a9b0c1d2_*")


def test_approved_document_and_assets():
    doc = refresh.load_document()
    CaseDocumentUpdate.model_validate(
        {"meta": {**doc["meta"], "slug": "gbu-process-automation"}, "blocks": doc["blocks"]}
    )
    assert len(doc["blocks"]) == 9
    assert sum(b["type"] == "technologies" for b in doc["blocks"]) == 1
    root = Path(__file__).parents[2] / "frontend/public"

    def check(value):
        if isinstance(value, str) and value.startswith("/cases/"):
            assert (root / value.lstrip("/")).is_file(), value
        elif isinstance(value, dict):
            for child in value.values():
                check(child)
        elif isinstance(value, list):
            for child in value:
                check(child)

    check(doc)


def test_scoped_migration_backups_and_idempotence():
    schema = sa.MetaData()
    projects = sa.Table(
        "projects",
        schema,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("slug", sa.String),
        sa.Column("status", sa.String),
        sa.Column("cover_image_url", sa.String),
        sa.Column("draft_data", sa.JSON),
        sa.Column("published_data", sa.JSON),
        sa.Column("updated_at", sa.DateTime),
        sa.Column("published_at", sa.DateTime),
    )
    blocks = sa.Table(
        "project_blocks",
        schema,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("project_id", sa.String),
        sa.Column("type", sa.String),
        sa.Column("sort_order", sa.Integer),
        sa.Column("is_visible", sa.Boolean),
        *[sa.Column(k, sa.JSON) for k in ("settings", "content_ru", "content_en")],
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
    schema.create_all(engine)
    old = release.load_document()
    for index, block in enumerate(old["blocks"]):
        block["id"] = f"old-block-{index}"
    old["meta"]["slug"] = "gbu-process-automation"
    old["meta"]["status"] = "hidden"
    draft_meta = {**old["meta"], "subtitle_ru": "Unpublished previous text"}
    with engine.begin() as db:
        db.execute(
            projects.insert().values(
                id="gbu",
                slug="gbu-process-automation",
                status="hidden",
                draft_data=draft_meta,
                published_data=old,
            )
        )
        for block in old["blocks"]:
            db.execute(blocks.insert().values(project_id="gbu", **block))
        db.execute(projects.insert().values(id="other", slug="unrelated", status="draft"))
        refresh.upgrade_cases(db)
        updated = db.execute(sa.select(projects).where(projects.c.id == "gbu")).mappings().one()
        assert updated["status"] == "hidden"
        assert len(updated["published_data"]["blocks"]) == 9
        assert updated["cover_image_url"].endswith("cover-work-center.svg")
        assert db.execute(sa.select(sa.func.count()).select_from(blocks)).scalar() == 9
        snapshots = (
            db.execute(sa.select(revisions.c.snapshot).order_by(revisions.c.version))
            .scalars()
            .all()
        )
        assert snapshots[0] == old
        assert snapshots[1]["meta"] == draft_meta
        assert snapshots[-1] == updated["published_data"]
        refresh.upgrade_cases(db)
        assert db.execute(sa.select(sa.func.count()).select_from(revisions)).scalar() == len(
            snapshots
        )
        assert (
            db.execute(sa.select(projects.c.status).where(projects.c.id == "other")).scalar()
            == "draft"
        )


def test_ssag_changes_only_palette():
    original = release.load_document()
    before = deepcopy(original)
    changed = refresh.patch_document(original, "ssag")
    assert original == before
    assert changed["meta"] == original["meta"]
    for old, new in zip(original["blocks"], changed["blocks"]):
        assert old["content_ru"] == new["content_ru"]
        if old["type"] == "hero":
            assert new["settings"]["hero_background"] == "#fffbf4"
        else:
            assert old == new
