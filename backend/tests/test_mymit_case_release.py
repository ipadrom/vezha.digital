from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import sqlalchemy as sa

from app.schemas.case_builder import CaseDocumentUpdate


def migration():
    path = Path(__file__).parents[1] / "alembic/versions/m9b0c1d2e3f4_publish_mymit_case.py"
    spec = spec_from_file_location("mymit_release", path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_release_document_matches_authored_case_and_shipped_assets():
    import json

    raw = migration().load_document()
    root = Path(__file__).parents[2]
    assert raw == json.loads((root / "media/mymit-case/case.json").read_text())
    document = CaseDocumentUpdate.model_validate(raw)
    assert document.meta.slug == "mymit"
    assert len(document.blocks) == 12
    processes = [block for block in document.blocks if block.type == "process"]
    assert len(processes) == 7
    for language in ("content_ru", "content_en"):
        assert sum(len(getattr(block, language)["items"]) for block in processes) == 21

    def walk(value):
        if isinstance(value, dict):
            for item in value.values():
                yield from walk(item)
        elif isinstance(value, list):
            for item in value:
                yield from walk(item)
        elif isinstance(value, str) and value.startswith("/cases/mymit/"):
            yield value

    for asset in walk(raw):
        assert (root / "frontend/public" / asset.lstrip("/")).is_file(), asset


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
        assert connection.execute(sa.select(sa.func.count()).select_from(blocks)).scalar() == 12
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
        assert connection.execute(sa.select(sa.func.count()).select_from(blocks)).scalar() == 12
        assert (
            connection.execute(
                sa.select(projects.c.name_ru).where(projects.c.id == "other-case")
            ).scalar()
            == "Untouched"
        )
