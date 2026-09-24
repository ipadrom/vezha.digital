"""Re-apply the MyMIT video patch to draft blocks and calm the saved navigation block.

Revision ID: v8e9f0a1b2c3
Revises: u7d8e9f0a1b2

s5b6c7d8e9f0 updated the published snapshot but left block content untouched, so a
publish from the admin restored the old fragments. This revision applies the same
patch to block rows and to the published snapshot, and gives the navigation block the
plain paper look of the automatic one instead of the signal fill it was saved with.
"""

from copy import deepcopy
from datetime import datetime
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "v8e9f0a1b2c3"
down_revision = "u7d8e9f0a1b2"
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


def videos_migration():
    path = Path(__file__).with_name("s5b6c7d8e9f0_mymit_case_videos.py")
    spec = spec_from_file_location("mymit_case_videos_for_repair", path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def patch_document(document):
    result = videos_migration().patch_document(document)
    for block in result.get("blocks", []):
        settings = block.get("settings") or {}
        if block.get("type") == "next_case" and settings.get("theme") == "signal":
            block["settings"] = {**settings, "theme": "paper", "surface": "plain"}
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
                        content_ru=after["content_ru"],
                        content_en=after["content_en"],
                        settings=after["settings"],
                    )
                )
        values = {"updated_at": now}
        if public != updated_public:
            values.update(published_data=updated_public, published_at=now)
        db.execute(projects.update().where(projects.c.id == pid).values(**values))


def upgrade():
    upgrade_cases(op.get_bind())


def downgrade():
    # Saved revisions keep the previous content; nothing to undo automatically.
    pass
