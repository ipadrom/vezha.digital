"""Remove the two standalone screen pairs from the Zagorulko case.

Revision ID: i5x6y7z8a9b0
Revises: h4w5x6y7z8a9
"""

from copy import deepcopy
from datetime import datetime
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "i5x6y7z8a9b0"
down_revision = "h4w5x6y7z8a9"
branch_labels = None
depends_on = None

SLUGS = ("gbu-process-automation", "process-automation")
BLOCK_IDS = ("5db977d0-4a69-5bbf-a151-b8d8737cd33d", "36589002-d349-5e82-ad57-2109acdd61f4")


def remove_comparisons(document):
    result = deepcopy(document)
    result["blocks"] = [
        block
        for block in result.get("blocks", [])
        if not (block.get("type") == "comparison" and str(block.get("id")) in BLOCK_IDS)
    ]
    return result


def upgrade_cases(connection):
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=connection)
    blocks = sa.Table("project_blocks", schema, autoload_with=connection)
    revisions = sa.Table("project_revisions", schema, autoload_with=connection)
    for project in connection.execute(
        sa.select(projects).where(projects.c.slug.in_(SLUGS))
    ).mappings():
        # Media files and process steps remain intact. Draft and published
        # documents are edited separately, without publishing other draft work.
        deleted = connection.execute(
            blocks.delete().where(
                blocks.c.project_id == project["id"],
                blocks.c.id.in_(BLOCK_IDS),
                blocks.c.type == "comparison",
            )
        ).rowcount
        values = {}
        published = project["published_data"]
        if published:
            updated = remove_comparisons(published)
            if updated != published:
                now = datetime.utcnow()
                version = (
                    connection.execute(
                        sa.select(sa.func.max(revisions.c.version)).where(
                            revisions.c.project_id == project["id"]
                        )
                    ).scalar()
                    or 0
                )
                connection.execute(
                    revisions.insert().values(
                        id=str(uuid4()),
                        project_id=project["id"],
                        version=version + 1,
                        snapshot=updated,
                        created_at=now,
                    )
                )
                values.update(published_data=updated, published_at=now)
        if values or deleted:
            values["updated_at"] = datetime.utcnow()
            connection.execute(
                projects.update().where(projects.c.id == project["id"]).values(**values)
            )


def upgrade():
    upgrade_cases(op.get_bind())


def downgrade():
    # Do not reinsert obsolete sections over subsequent editorial changes.
    # Earlier published snapshots remain available in case revisions.
    pass
