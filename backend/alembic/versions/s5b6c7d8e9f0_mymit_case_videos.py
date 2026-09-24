"""Add MyMIT interaction videos and dev-branch items without touching other editorial content.

Revision ID: s5b6c7d8e9f0
Revises: r4a5b6c7d8e9
"""

import json
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "s5b6c7d8e9f0"
down_revision = "r4a5b6c7d8e9"
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
MEDIA_KEYS = (
    "media_type",
    "image_url",
    "image_alt",
    "video_url",
    "poster_url",
    "media_size",
    "media_layout",
)
# Items whose copy changed in the approved document; other descriptions keep their editorial edits.
RETEXT = {
    "Несколько броней и ранний старт",
    "Multiple bookings and early starts",
    "Больше возможностей для бронирования.",
    "More booking options.",
}


def load_document():
    path = Path(__file__).parents[1] / "data" / "mymit_case_20260921.json"
    return json.loads(path.read_text(encoding="utf-8"))


def _sync_items(items, approved):
    """Apply approved media to matching items and insert missing approved items in order."""
    for index, new in enumerate(approved):
        match = next(
            (item for item in items if item.get("title") == new.get("title")), None
        )
        if match is None:
            anchor = approved[index - 1]["title"] if index else None
            position = next(
                (i + 1 for i, item in enumerate(items) if item.get("title") == anchor),
                len(items),
            )
            items.insert(position, deepcopy(new))
            continue
        if new.get("media_type") in ("image", "video"):
            for key in MEDIA_KEYS:
                if key in new:
                    match[key] = new[key]
                else:
                    match.pop(key, None)
        if new["title"] in RETEXT:
            match["description"] = new["description"]


def patch_document(document):
    result = deepcopy(document)
    approved = load_document()
    chapters = {
        b["content_ru"].get("eyebrow"): b
        for b in approved["blocks"]
        if b["type"] == "process"
    }
    results = next((b for b in approved["blocks"] if b["type"] == "results"), None)
    for block in result["blocks"]:
        heading = block.get("content_ru", {}).get("eyebrow")
        if block["type"] == "process" and heading in chapters:
            for language in ("content_ru", "content_en"):
                _sync_items(
                    block[language].setdefault("items", []),
                    chapters[heading][language]["items"],
                )
        elif block["type"] == "results" and results:
            for language in ("content_ru", "content_en"):
                for new in results[language]["items"]:
                    if new["title"] not in RETEXT:
                        continue
                    for item in block.get(language, {}).get("items", []):
                        if item.get("title") == new["title"]:
                            item["text"] = new["text"]
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
        existing = {block["id"] for block in draft["blocks"]}
        for block in updated_draft["blocks"]:
            if block["id"] in existing:
                db.execute(
                    blocks.update()
                    .where(blocks.c.project_id == pid, blocks.c.id == block["id"])
                    .values(sort_order=block["sort_order"], settings=block["settings"])
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
