"""Shorten the MyMIT client block project button to "Открыть" / "Open".

Revision ID: u7d8e9f0a1b2
Revises: s5b6c7d8e9f0
"""

from copy import deepcopy
from datetime import datetime
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "u7d8e9f0a1b2"
down_revision = "s5b6c7d8e9f0"
branch_labels = None
depends_on = None

BLOCK_KEYS = (
    "id",
    "type",
    "content_ru",
    "content_en",
    "settings",
    "sort_order",
    "is_visible",
)
# Only the labels shipped by o1d2e3f4a5b6 are renamed; an edited label is left alone.
LABELS = {
    "content_ru": ("Открыть проект", "Открыть"),
    "content_en": ("Visit the project", "Open"),
}


def is_client_block(block):
    return (
        block.get("type") == "image_text"
        and (block.get("settings") or {}).get("layout") == "client"
    )


def patch_document(document):
    result = deepcopy(document)
    for block in result.get("blocks", []):
        if not is_client_block(block):
            continue
        for language, (old, new) in LABELS.items():
            content = block.get(language) or {}
            if content.get("project_label") == old:
                content["project_label"] = new
    return result


def upgrade_cases(db):
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=db)
    blocks = sa.Table("project_blocks", schema, autoload_with=db)
    revisions = sa.Table("project_revisions", schema, autoload_with=db)
    for project in db.execute(
        sa.select(projects).where(projects.c.slug == "mymit")
    ).mappings():
        pid = project["id"]
        rows = list(
            db.execute(
                sa.select(blocks)
                .where(blocks.c.project_id == pid)
                .order_by(blocks.c.sort_order)
            ).mappings()
        )
        public = project["published_data"]
        draft = {
            "meta": deepcopy(project["draft_data"] or (public or {}).get("meta", {})),
            "blocks": [
                {k: str(r[k]) if k == "id" else r[k] for k in BLOCK_KEYS} for r in rows
            ],
        }
        updated_draft = patch_document(draft)
        updated_public = patch_document(public) if public else None
        if draft == updated_draft and public == updated_public:
            continue
        now = datetime.utcnow()
        version = (
            db.execute(
                sa.select(sa.func.max(revisions.c.version)).where(
                    revisions.c.project_id == pid
                )
            ).scalar()
            or 0
        )
        snapshots = ([public] if public else []) + ([draft] if draft != public else [])
        if updated_public and updated_public != public:
            snapshots.append(updated_public)
        for offset, snapshot in enumerate(snapshots, 1):
            db.execute(
                revisions.insert().values(
                    id=str(uuid4()),
                    project_id=pid,
                    version=version + offset,
                    snapshot=snapshot,
                    created_at=now,
                )
            )
        for before, after in zip(draft["blocks"], updated_draft["blocks"]):
            if before != after:
                db.execute(
                    blocks.update()
                    .where(blocks.c.project_id == pid, blocks.c.id == after["id"])
                    .values(
                        content_ru=after["content_ru"], content_en=after["content_en"]
                    )
                )
        values = {"updated_at": now}
        if public != updated_public:
            values.update(published_data=updated_public, published_at=now)
        db.execute(projects.update().where(projects.c.id == pid).values(**values))


def upgrade():
    upgrade_cases(op.get_bind())


def downgrade():
    # The labels are editable in the admin; saved revisions keep the previous wording.
    pass
