from copy import deepcopy
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import sqlalchemy as sa
from test_mymit_case_release import migration as release_migration
from test_mymit_case_videos import old_document


def migration():
    path = (
        Path(__file__).parents[1] / "alembic/versions/v8e9f0a1b2c3_mymit_case_repair.py"
    )
    spec = spec_from_file_location("mymit_case_repair", path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def reverted_document():
    """The state after a publish from a stale draft: old fragments plus a saved signal navigation."""
    document = old_document()
    document["blocks"].append(
        {
            "id": "navigation",
            "type": "next_case",
            "content_ru": {"title": "Другие проекты", "case_slugs": []},
            "content_en": {"title": "More projects", "case_slugs": []},
            "settings": {
                "theme": "signal",
                "surface": "card",
                "width": "wide",
                "layout": "default",
            },
            "sort_order": len(document["blocks"]),
            "is_visible": True,
        }
    )
    return document


def test_patch_restores_videos_and_plain_navigation():
    module = migration()
    before = reverted_document()
    after = module.patch_document(before)
    videos = [
        item
        for block in after["blocks"]
        if block["type"] == "process"
        for item in block["content_ru"]["items"]
        if item.get("media_type") == "video"
    ]
    assert len(videos) == 12
    navigation = after["blocks"][-1]
    assert navigation["settings"]["theme"] == "paper"
    assert navigation["settings"]["surface"] == "plain"
    assert navigation["settings"]["width"] == "wide"
    assert module.patch_document(deepcopy(after)) == after


def test_database_repair_updates_block_rows_and_published_snapshot():
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
        *[
            sa.Column(k, sa.DateTime)
            for k in ("created_at", "updated_at", "published_at")
        ],
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
        pid = release_migration().seed_case(db, reverted_document())
        original = db.execute(sa.select(projects.c.published_data)).scalar_one()
        migration().upgrade_cases(db)
        rows = list(
            db.execute(
                sa.select(blocks)
                .where(blocks.c.project_id == pid)
                .order_by(blocks.c.sort_order)
            ).mappings()
        )
        row_videos = [
            item
            for row in rows
            if row["type"] == "process"
            for item in row["content_ru"]["items"]
            if item.get("media_type") == "video"
        ]
        assert len(row_videos) == 12
        assert rows[-1]["settings"]["theme"] == "paper"
        published = db.execute(
            sa.select(projects.c.published_data).where(projects.c.id == pid)
        ).scalar_one()
        assert published == migration().patch_document(original)
        assert original in list(db.execute(sa.select(revisions.c.snapshot)).scalars())
        count = db.execute(
            sa.select(sa.func.count()).select_from(revisions)
        ).scalar_one()
        migration().upgrade_cases(db)
        assert (
            db.execute(sa.select(sa.func.count()).select_from(revisions)).scalar_one()
            == count
        )
