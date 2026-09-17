"""Apply the approved Zagorulko content to its production permalink.

Revision ID: l8a9b0c1d2e3
Revises: k7z8a9b0c1d2
"""

import json
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "l8a9b0c1d2e3"
down_revision = "k7z8a9b0c1d2"
branch_labels = None
depends_on = None


def load_document():
    return json.loads(
        (Path(__file__).parents[1] / "data/zagorulko_refresh_20260918.json").read_text("utf-8")
    )


def patch_document(document, slug):
    result = deepcopy(document)
    if slug == "process-automation":
        approved = load_document()
        result["meta"].update(approved["meta"])
        result["blocks"] = approved["blocks"]
    return result


def upgrade_cases(db):
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=db)
    blocks = sa.Table("project_blocks", schema, autoload_with=db)
    revisions = sa.Table("project_revisions", schema, autoload_with=db)
    for project in db.execute(
        sa.select(projects).where(projects.c.slug.in_(["process-automation"]))
    ).mappings():
        pid = project["id"]
        rows = list(
            db.execute(
                sa.select(blocks).where(blocks.c.project_id == pid).order_by(blocks.c.sort_order)
            ).mappings()
        )
        keys = ("id", "type", "content_ru", "content_en", "settings", "sort_order", "is_visible")
        draft = {
            "meta": deepcopy(
                project["draft_data"] or (project["published_data"] or {}).get("meta", {})
            ),
            "blocks": [{k: str(r[k]) if k == "id" else r[k] for k in keys} for r in rows],
        }
        updated_draft = patch_document(draft, project["slug"])
        public = project["published_data"]
        updated_public = patch_document(public, project["slug"]) if public else None
        if draft == updated_draft and public == updated_public:
            continue
        now = datetime.utcnow()
        version = (
            db.execute(
                sa.select(sa.func.max(revisions.c.version)).where(revisions.c.project_id == pid)
            ).scalar()
            or 0
        )
        # Preserve both the previous public version and any unpublished edits.
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
        if draft != updated_draft:
            # Scoped replacement implements the approved removal of old chapters.
            db.execute(blocks.delete().where(blocks.c.project_id == pid))
            for block in updated_draft["blocks"]:
                db.execute(blocks.insert().values(project_id=pid, **block))
        values = {"draft_data": updated_draft["meta"], "updated_at": now}
        if public and updated_public != public:
            values.update(published_data=updated_public, published_at=now)
            if project["slug"] == "process-automation":
                values.update({k: v for k, v in load_document()["meta"].items() if k in projects.c})
        db.execute(projects.update().where(projects.c.id == pid).values(**values))


def upgrade():
    upgrade_cases(op.get_bind())


def downgrade():
    # Restore editorial content through saved admin revisions.
    pass
