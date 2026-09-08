"""Match the SSAG walkthrough by its screens across independently imported cases.

Revision ID: h4w5x6y7z8a9
Revises: g3v4w5x6y7z8
"""

from copy import deepcopy
from datetime import datetime
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "h4w5x6y7z8a9"
down_revision = "g3v4w5x6y7z8"
branch_labels = None
depends_on = None

SCREENS = {
    "/cases/ssag/screens/contacts.png",
    "/cases/ssag/screens/map.png",
    "/cases/ssag/screens/message-preview.png",
    "/cases/ssag/screens/countdown.png",
}


def patch_block(block):
    result = deepcopy(block)
    if result.get("type") != "process":
        return result
    settings = result.get("settings") or {}
    if settings.get("layout", "chapter") not in ("chapter", "phone-showcase"):
        return result
    # Imported documents can have different block UUIDs in draft and production.
    # Match the complete screen set in either locale, within the SSAG project only.
    if not any(
        {item.get("image_url") for item in (result.get(key) or {}).get("items", [])} == SCREENS
        for key in ("content_ru", "content_en")
    ):
        return result
    result["settings"] = {**settings, "layout": "phone-showcase"}
    for key, note, labels in (
        ("content_ru", "Скриншоты сняты в эмуляторе приложения.", ("Карта", "Карточка места")),
        ("content_en", "Captured from the app running in an emulator.", ("Map", "Place details")),
    ):
        content = result.get(key) or {}
        if note in (content.get("summary") or ""):
            content["summary"] = content["summary"].replace(note, "").strip()
        for item in content.get("items", []):
            if item.get("image_url") == "/cases/ssag/screens/map.png":
                if not item.get("image_label"):
                    item["image_label"] = labels[0]
                if not item.get("secondary_image_label"):
                    item["secondary_image_label"] = labels[1]
    return result


def upgrade_cases(connection):
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=connection)
    blocks = sa.Table("project_blocks", schema, autoload_with=connection)
    revisions = sa.Table("project_revisions", schema, autoload_with=connection)
    for project in connection.execute(
        sa.select(projects).where(projects.c.slug == "ssag")
    ).mappings():
        draft_changed = False
        for row in connection.execute(
            sa.select(blocks).where(blocks.c.project_id == project["id"])
        ).mappings():
            before = {
                key: row[key] for key in ("id", "type", "settings", "content_ru", "content_en")
            }
            after = patch_block(before)
            values = {
                key: after[key]
                for key in ("settings", "content_ru", "content_en")
                if after[key] != before[key]
            }
            if values:
                connection.execute(blocks.update().where(blocks.c.id == row["id"]).values(**values))
                draft_changed = True
        values = {}
        published = project["published_data"]
        if published:
            updated = deepcopy(published)
            updated["blocks"] = [patch_block(block) for block in updated.get("blocks", [])]
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
        if values or draft_changed:
            values["updated_at"] = datetime.utcnow()
            connection.execute(
                projects.update().where(projects.c.id == project["id"]).values(**values)
            )


def upgrade():
    upgrade_cases(op.get_bind())


def downgrade():
    # Keep editorial changes; previous published snapshots remain in revisions.
    pass
