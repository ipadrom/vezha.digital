from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import sqlalchemy as sa

from app.schemas.case_builder import CaseDocumentUpdate


def migration():
    path = Path(__file__).parents[1] / "alembic/versions/d0s1t2u3v4w5_publish_ssag_case.py"
    spec = spec_from_file_location("ssag_release", path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_release_document_keeps_full_map_and_detail_pair():
    document = CaseDocumentUpdate.model_validate(migration().load_document())
    assert document.meta.slug == "ssag"
    assert len(document.blocks) == 8
    process = next(block for block in document.blocks if block.type == "process")
    for content in (process.content_ru, process.content_en):
        assert all(item["media_layout"] == "phone" for item in content["items"])
        assert content["items"][1]["image_url"].endswith("/screens/map.png")
        assert content["items"][1]["secondary_image_url"].endswith("/screens/place-card.png")
    assert not any(block.type == "video" for block in document.blocks)


def test_insert_publishes_all_blocks_and_preserves_later_edits():
    release = migration()
    document = release.load_document()
    schema = sa.MetaData()
    projects = sa.Table(
        "projects",
        schema,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("slug", sa.String, unique=True),
        sa.Column("name_ru", sa.String),
        sa.Column("is_active", sa.Boolean),
        sa.Column("status", sa.String),
        sa.Column("draft_data", sa.JSON),
        sa.Column("published_data", sa.JSON),
        *[sa.Column(name, sa.DateTime) for name in ("published_at", "created_at", "updated_at")],
    )
    blocks = sa.Table(
        "project_blocks",
        schema,
        sa.Column("id", sa.String, primary_key=True),
        sa.Column("project_id", sa.String),
        sa.Column("type", sa.String),
        *[sa.Column(name, sa.JSON) for name in ("content_ru", "content_en", "settings")],
        sa.Column("sort_order", sa.Integer),
        sa.Column("is_visible", sa.Boolean),
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
    with engine.begin() as connection:
        connection.execute(
            projects.insert().values(id="other-case", slug="other-case", name_ru="Untouched")
        )
        project_id = release.seed_case(connection, document)
        project = (
            connection.execute(sa.select(projects).where(projects.c.id == project_id))
            .mappings()
            .one()
        )
        assert project["is_active"] is True
        assert project["status"] == "published"
        assert len(project["published_data"]["blocks"]) == len(document["blocks"])
        assert connection.execute(sa.select(sa.func.count()).select_from(blocks)).scalar() == 8
        assert connection.execute(sa.select(sa.func.count()).select_from(revisions)).scalar() == 1

        connection.execute(
            projects.update().where(projects.c.id == project_id).values(name_ru="Later studio edit")
        )
        assert release.seed_case(connection, document) == project_id
        assert (
            connection.execute(
                sa.select(projects.c.name_ru).where(projects.c.id == project_id)
            ).scalar()
            == "Later studio edit"
        )
        assert connection.execute(sa.select(sa.func.count()).select_from(blocks)).scalar() == 8
        assert (
            connection.execute(
                sa.select(projects.c.name_ru).where(projects.c.id == "other-case")
            ).scalar()
            == "Untouched"
        )
