"""Add the SSAG client introduction after the cover without touching other editorial content.

Revision ID: a0r1s2t3u4v5
Revises: z8p9q0r1s2t3
"""

import json
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "a0r1s2t3u4v5"
down_revision = "z8p9q0r1s2t3"
branch_labels = None
depends_on = None

BLOCK_KEYS = ("id", "type", "content_ru", "content_en", "settings", "sort_order", "is_visible")


def load_block():
    path = Path(__file__).parents[1] / "data" / "ssag_client_block_20260927.json"
    return json.loads(path.read_text(encoding="utf-8"))


def patch_document(document):
    """Insert the client introduction after the cover media."""
    result = deepcopy(document)
    blocks = result["blocks"]
    client = load_block()
    if any(
        block["type"] == client["type"] and block.get("settings", {}).get("layout") == "client"
        for block in blocks
    ):
        return result
    position = next(
        (index + 1 for index, block in enumerate(blocks) if block["type"] == "media_hero"),
        min(1, len(blocks)),
    )
    blocks.insert(position, client)
    for index, block in enumerate(blocks):
        block["sort_order"] = index
    return result


def upgrade_cases(db):
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=db)
    blocks = sa.Table("project_blocks", schema, autoload_with=db)
    revisions = sa.Table("project_revisions", schema, autoload_with=db)
    for project in db.execute(sa.select(projects).where(projects.c.slug == "ssag")).mappings():
        pid = project["id"]
        rows = list(
            db.execute(
                sa.select(blocks).where(blocks.c.project_id == pid).order_by(blocks.c.sort_order)
            ).mappings()
        )
        public = project["published_data"]
        draft = {
            "meta": deepcopy(project["draft_data"] or (public or {}).get("meta", {})),
            "blocks": [{k: str(r[k]) if k == "id" else r[k] for k in BLOCK_KEYS} for r in rows],
        }
        updated_draft = patch_document(draft)
        updated_public = patch_document(public) if public else None
        if draft == updated_draft and public == updated_public:
            continue
        now = datetime.utcnow()
        version = (
            db.execute(
                sa.select(sa.func.max(revisions.c.version)).where(revisions.c.project_id == pid)
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
        existing = {block["id"] for block in draft["blocks"]}
        for block in updated_draft["blocks"]:
            if block["id"] in existing:
                db.execute(
                    blocks.update()
                    .where(blocks.c.project_id == pid, blocks.c.id == block["id"])
                    .values(sort_order=block["sort_order"])
                )
            else:
                db.execute(blocks.insert().values(project_id=pid, **block))
        values = {"updated_at": now}
        if public != updated_public:
            values.update(published_data=updated_public, published_at=now)
        db.execute(projects.update().where(projects.c.id == pid).values(**values))


def upgrade():
    upgrade_cases(op.get_bind())


def downgrade():
    # Restore editorial content through the saved admin revisions.
    pass
