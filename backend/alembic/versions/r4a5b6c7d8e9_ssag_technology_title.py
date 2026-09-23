"""Drop the SSAG technology card title that repeated the technologies listed below it.

Revision ID: r4a5b6c7d8e9
Revises: q3f4a5b6c7d8
"""

from copy import deepcopy
from datetime import datetime
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "r4a5b6c7d8e9"
down_revision = "q3f4a5b6c7d8"
branch_labels = None
depends_on = None

SLUG = "ssag"


def clear_title(block):
    """Return the block with an empty technology title, or the same block when nothing changes."""
    if block.get("type") != "technologies":
        return block
    result = deepcopy(block)
    for key in ("content_ru", "content_en"):
        if (result.get(key) or {}).get("title"):
            result[key] = {**result[key], "title": ""}
    return result


def patch_document(document):
    if not document:
        return document
    return {**document, "blocks": [clear_title(block) for block in document.get("blocks", [])]}


def upgrade():
    db = op.get_bind()
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=db)
    blocks = sa.Table("project_blocks", schema, autoload_with=db)
    revisions = sa.Table("project_revisions", schema, autoload_with=db)
    project = db.execute(sa.select(projects).where(projects.c.slug == SLUG)).mappings().one_or_none()
    if project is None:
        return
    now = datetime.utcnow()
    for row in db.execute(
        sa.select(blocks).where(blocks.c.project_id == project["id"], blocks.c.type == "technologies")
    ).mappings():
        patched = clear_title(dict(row))
        if patched["content_ru"] != row["content_ru"] or patched["content_en"] != row["content_en"]:
            db.execute(
                blocks.update()
                .where(blocks.c.id == row["id"])
                .values(content_ru=patched["content_ru"], content_en=patched["content_en"])
            )
    public = project["published_data"]
    updated = patch_document(public)
    if public and updated != public:
        # Keep the previous snapshot restorable from the admin revision history.
        version = db.execute(
            sa.select(sa.func.max(revisions.c.version)).where(revisions.c.project_id == project["id"])
        ).scalar() or 0
        db.execute(revisions.insert().values(
            id=str(uuid4()), project_id=project["id"], version=version + 1, snapshot=public, created_at=now,
        ))
        db.execute(projects.update().where(projects.c.id == project["id"]).values(
            published_data=updated, published_at=now, updated_at=now,
        ))


def downgrade():
    # Restore the title through the saved admin revision.
    pass
