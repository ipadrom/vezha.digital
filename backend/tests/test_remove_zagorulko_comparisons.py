from copy import deepcopy
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

import pytest
import sqlalchemy as sa

spec = spec_from_file_location(
    "remove_comparisons",
    Path(__file__).parents[1] / "alembic/versions/i5x6y7z8a9b0_remove_zagorulko_comparisons.py",
)
migration = module_from_spec(spec)
spec.loader.exec_module(migration)


def document():
    return {
        "meta": {"title": "Published title"},
        "blocks": [
            *[{"id": block_id, "type": "comparison"} for block_id in migration.BLOCK_IDS],
            {
                "id": "steps",
                "type": "process",
                "content_ru": {"items": [{"video_url": "/demo.mp4"}]},
            },
            {"id": "other-pair", "type": "comparison", "content_ru": {"title": "Keep"}},
        ],
    }


def test_removes_only_requested_sections_without_mutation():
    value = document()
    before = deepcopy(value)
    updated = migration.remove_comparisons(value)
    assert value == before
    assert updated["blocks"] == value["blocks"][2:]
    assert updated["meta"] == value["meta"]
    assert migration.remove_comparisons(updated) == updated


@pytest.mark.parametrize("slug", migration.SLUGS)
def test_removes_draft_and_public_pairs_without_publishing_drafts_or_touching_other_cases(slug):
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
        sa.Column("content_ru", sa.JSON),
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
    public = document()
    with engine.begin() as connection:
        connection.execute(
            projects.insert().values(
                id="target",
                slug=slug,
                published_data=public,
                draft_data={"title": "Unpublished title"},
            )
        )
        connection.execute(
            projects.insert().values(id="other", slug="other-case", published_data=public)
        )
        for block in public["blocks"]:
            connection.execute(blocks.insert().values(project_id="target", **block))
        connection.execute(
            blocks.update()
            .where(blocks.c.id == "steps")
            .values(content_ru={"title": "Draft steps"})
        )
        migration.upgrade_cases(connection)
        saved = (
            connection.execute(sa.select(projects).where(projects.c.id == "target"))
            .mappings()
            .one()
        )
        assert saved["published_data"] == migration.remove_comparisons(public)
        assert saved["draft_data"] == {"title": "Unpublished title"}
        assert (
            connection.execute(
                sa.select(projects.c.published_data).where(projects.c.id == "other")
            ).scalar()
            == public
        )
        remaining = connection.execute(sa.select(blocks)).mappings().all()
        assert {row["id"] for row in remaining} == {"steps", "other-pair"}
        assert next(row for row in remaining if row["id"] == "steps")["content_ru"] == {
            "title": "Draft steps"
        }
        migration.upgrade_cases(connection)
        assert connection.execute(sa.select(sa.func.count()).select_from(revisions)).scalar() == 1
