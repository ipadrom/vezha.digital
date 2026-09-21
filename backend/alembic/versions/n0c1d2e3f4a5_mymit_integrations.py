"""Update MyMIT integrations while preserving other editorial content.

Revision ID: n0c1d2e3f4a5
Revises: m9b0c1d2e3f4
"""

import json
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "n0c1d2e3f4a5"
down_revision = "m9b0c1d2e3f4"
branch_labels = None
depends_on = None


def patch_document(document):
    result = deepcopy(document)
    approved = json.loads(
        (Path(__file__).parents[1] / "data/mymit_case_20260921.json").read_text("utf-8")
    )
    chapters = {b.get("content_ru", {}).get("eyebrow"): b for b in approved["blocks"]}
    for block in result["blocks"]:
        heading = block.get("content_ru", {}).get("eyebrow")
        if block["type"] != "process" or heading not in ("Уведомления", "Кабинка и приложение"):
            continue
        for language in ("content_ru", "content_en"):
            source = chapters[heading][language]["items"]
            items = block[language]["items"]
            if heading == "Уведомления":
                old_title = (
                    "Голосовые объявления по событиям брони"
                    if language == "content_ru"
                    else "Booking-triggered announcements"
                )
                replacements = [(old_title, source[1])]
            else:
                old_title = (
                    "Подключение и доступ устройств"
                    if language == "content_ru"
                    else "Device connection and access"
                )
                replacements = [(old_title, source[0])]
            for old_title, new in replacements:
                for item in items:
                    if item["title"] in (old_title, new["title"]):
                        item.update({k: new[k] for k in ("title", "description")})
                        if "image_alt" in item:
                            item["image_alt"] = new["title"]
            if heading == "Кабинка и приложение":
                for new in source[2:]:
                    if not any(item["title"] == new["title"] for item in items):
                        items.append(deepcopy(new))
    return result


def upgrade_cases(db):
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=db)
    blocks = sa.Table("project_blocks", schema, autoload_with=db)
    revisions = sa.Table("project_revisions", schema, autoload_with=db)
    for project in db.execute(sa.select(projects).where(projects.c.slug == "mymit")).mappings():
        pid = project["id"]
        rows = list(
            db.execute(
                sa.select(blocks).where(blocks.c.project_id == pid).order_by(blocks.c.sort_order)
            ).mappings()
        )
        keys = ("id", "type", "content_ru", "content_en", "settings", "sort_order", "is_visible")
        public = project["published_data"]
        draft = {
            "meta": deepcopy(project["draft_data"] or (public or {}).get("meta", {})),
            "blocks": [{k: str(r[k]) if k == "id" else r[k] for k in keys} for r in rows],
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
        for before, after in zip(draft["blocks"], updated_draft["blocks"]):
            if before != after:
                db.execute(
                    blocks.update()
                    .where(blocks.c.project_id == pid, blocks.c.id == after["id"])
                    .values(content_ru=after["content_ru"], content_en=after["content_en"])
                )
        values = {"updated_at": now}
        if public != updated_public:
            values.update(published_data=updated_public, published_at=now)
        db.execute(projects.update().where(projects.c.id == pid).values(**values))


def upgrade():
    upgrade_cases(op.get_bind())


def downgrade():
    # Restore editorial content through the saved admin revisions.
    pass
