"""Make the Zagorulko case cover full width in draft and public snapshots.

Revision ID: f2u3v4w5x6y7
Revises: e1t2u3v4w5x6
"""

from copy import deepcopy
from datetime import datetime
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "f2u3v4w5x6y7"
down_revision = "e1t2u3v4w5x6"
branch_labels = None
depends_on = None

PROJECT_ID = "4810c91e-8c5d-589e-8ec3-2259a1ff7cfa"
COVER_ID = "d38a1d06-ff06-5ec9-a709-b59397d2af90"
COVER_SETTINGS = {"width": "full", "spacing": "compact"}


def upgrade():
    connection = op.get_bind()
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=connection)
    blocks = sa.Table("project_blocks", schema, autoload_with=connection)
    revisions = sa.Table("project_revisions", schema, autoload_with=connection)
    project = (
        connection.execute(sa.select(projects).where(projects.c.id == PROJECT_ID))
        .mappings()
        .one_or_none()
    )
    if project is None:
        return

    cover = (
        connection.execute(
            sa.select(blocks).where(blocks.c.project_id == PROJECT_ID, blocks.c.id == COVER_ID)
        )
        .mappings()
        .one_or_none()
    )
    if cover is not None:
        settings = {**(cover["settings"] or {}), **COVER_SETTINGS}
        if settings != cover["settings"]:
            connection.execute(
                blocks.update().where(blocks.c.id == COVER_ID).values(settings=settings)
            )

    published = project["published_data"]
    if not published:
        return
    updated = deepcopy(published)
    for block in updated.get("blocks", []):
        if str(block["id"]) == COVER_ID:
            block.setdefault("settings", {}).update(COVER_SETTINGS)
    if updated == published:
        return

    now = datetime.utcnow()
    version = (
        connection.execute(
            sa.select(sa.func.max(revisions.c.version)).where(revisions.c.project_id == PROJECT_ID)
        ).scalar()
        or 0
    )
    connection.execute(
        revisions.insert().values(
            id=str(uuid4()),
            project_id=PROJECT_ID,
            version=version + 1,
            snapshot=updated,
            created_at=now,
        )
    )
    connection.execute(
        projects.update()
        .where(projects.c.id == PROJECT_ID)
        .values(
            published_data=updated,
            published_at=now,
            updated_at=now,
        )
    )


def downgrade():
    # Preserve authored content; the prior snapshot remains available in revisions.
    pass
