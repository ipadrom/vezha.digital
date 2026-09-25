"""Start case process accordions collapsed, except the SSAG phone showcase.

Process blocks shipped with `open_first: true`, so every case opened its first step on
load. Clear the flag on every process block outside SSAG and outside the phone
showcase layout, whose phone always shows one step. Draft blocks and the published
snapshot are both patched; the patch is idempotent.

Revision ID: z8p9q0r1s2t3
Revises: y1h2c3d4e5f6
"""

from datetime import datetime
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "z8p9q0r1s2t3"
down_revision = "y1h2c3d4e5f6"
branch_labels = None
depends_on = None

KEEP_SLUGS = ("ssag",)


def collapses(block):
    settings = block.get("settings") or {}
    return (
        block.get("type") == "process"
        and settings.get("layout") != "phone-showcase"
        and settings.get("open_first") is not False
    )


def collapsed_settings(settings):
    return {**(settings or {}), "open_first": False}


def patch_document(document):
    blocks = document.get("blocks") if isinstance(document, dict) else None
    if not isinstance(blocks, list):
        return document
    return {
        **document,
        "blocks": [
            {**block, "settings": collapsed_settings(block.get("settings"))} if collapses(block) else block
            for block in blocks
        ],
    }


def upgrade():
    connection = op.get_bind()
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=connection)
    blocks = sa.Table("project_blocks", schema, autoload_with=connection)
    revisions = sa.Table("project_revisions", schema, autoload_with=connection)
    rows = list(
        connection.execute(sa.select(projects).where(projects.c.slug.notin_(KEEP_SLUGS))).mappings()
    )
    for project in rows:
        project_id = project["id"]
        for block in connection.execute(
            sa.select(blocks).where(blocks.c.project_id == project_id, blocks.c.type == "process")
        ).mappings():
            if collapses(block):
                connection.execute(
                    blocks.update()
                    .where(blocks.c.id == block["id"])
                    .values(settings=collapsed_settings(block["settings"]))
                )
        published = project["published_data"]
        if not published:
            continue
        updated = patch_document(published)
        if updated == published:
            continue
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
    # Editors can re-enable "open first" per block; the previous snapshot stays in revisions.
    pass
