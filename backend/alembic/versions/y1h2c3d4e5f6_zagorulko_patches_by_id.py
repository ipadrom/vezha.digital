"""Re-apply the Zagorulko clip and stack patches to the case found by its id or either slug.

w9f0a1b2c3d4 and x0g1b2c3d4e5 looked the case up by the local slug
`gbu-process-automation`; production publishes it as `process-automation`, so those
patches never reached it there. Both patches are idempotent, so environments that already
carry them are left unchanged.

Revision ID: y1h2c3d4e5f6
Revises: x0g1b2c3d4e5
"""

from datetime import datetime
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "y1h2c3d4e5f6"
down_revision = "x0g1b2c3d4e5"
branch_labels = None
depends_on = None

PROJECT_ID = "4810c91e-8c5d-589e-8ec3-2259a1ff7cfa"
SLUGS = ("gbu-process-automation", "process-automation")
BLOCK_KEYS = ("id", "type", "content_ru", "content_en", "settings", "sort_order", "is_visible")


def load_migration(name):
    path = Path(__file__).with_name(name)
    spec = spec_from_file_location(path.stem, path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def patch_document(document):
    """Both earlier patches, in their original order."""
    videos = load_migration("w9f0a1b2c3d4_zagorulko_case_videos.py")
    stacks = load_migration("x0g1b2c3d4e5_case_stacks.py")
    result = videos.patch_document(document, videos.load_patch())
    return stacks.patch_document(result, stacks.load_patch()["cases"]["gbu-process-automation"])


def find_project(connection, projects):
    rows = list(
        connection.execute(
            sa.select(projects).where(
                sa.or_(projects.c.id == PROJECT_ID, projects.c.slug.in_(SLUGS))
            )
        ).mappings()
    )
    by_id = [row for row in rows if str(row["id"]) == PROJECT_ID]
    return (by_id or rows or [None])[0]


def upgrade():
    connection = op.get_bind()
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=connection)
    blocks = sa.Table("project_blocks", schema, autoload_with=connection)
    revisions = sa.Table("project_revisions", schema, autoload_with=connection)
    project = find_project(connection, projects)
    if project is None:
        return
    project_id = project["id"]
    rows = list(
        connection.execute(
            sa.select(blocks).where(blocks.c.project_id == project_id).order_by(blocks.c.sort_order)
        ).mappings()
    )
    draft = {"blocks": [{key: row[key] for key in BLOCK_KEYS} for row in rows]}
    for block, row in zip(patch_document(draft)["blocks"], rows):
        values = {key: block[key] for key in ("content_ru", "content_en") if block[key] != row[key]}
        if values:
            connection.execute(blocks.update().where(blocks.c.id == row["id"]).values(**values))
    published = project["published_data"]
    if not published:
        return
    updated = patch_document(published)
    if updated == published:
        return
    now = datetime.utcnow()
    version = (
        connection.execute(
            sa.select(sa.func.max(revisions.c.version)).where(revisions.c.project_id == project_id)
        ).scalar()
        or 0
    )
    connection.execute(
        revisions.insert().values(
            id=str(uuid4()),
            project_id=project_id,
            version=version + 1,
            snapshot=updated,
            created_at=now,
        )
    )
    connection.execute(
        projects.update()
        .where(projects.c.id == project_id)
        .values(published_data=updated, published_at=now, updated_at=now)
    )


def downgrade():
    # Authored content stays; the previous public snapshot remains in revisions.
    pass
