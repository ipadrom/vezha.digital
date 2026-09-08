"""Use the reusable phone showcase for SSAG and the Zagorulko app walkthrough.

Revision ID: g3v4w5x6y7z8
Revises: f2u3v4w5x6y7
"""

from copy import deepcopy
from datetime import datetime
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "g3v4w5x6y7z8"
down_revision = "f2u3v4w5x6y7"
branch_labels = None
depends_on = None

TARGETS = {
    "ssag": ("e6d448e5-19b3-4c95-9899-5885748bed4a",),
    "gbu-process-automation": (
        "3f1d741c-0ab2-5a56-add0-a84c8b23f40e",
        "1cddfd62-8bdd-5d6e-a4c4-67e51a1aa760",
    ),
    "process-automation": (
        "3f1d741c-0ab2-5a56-add0-a84c8b23f40e",
        "1cddfd62-8bdd-5d6e-a4c4-67e51a1aa760",
    ),
}


def patch_block(block, slug):
    result = deepcopy(block)
    if result.get("type") != "process" or str(result.get("id")) not in TARGETS.get(slug, ()):
        return result
    settings = result.setdefault("settings", {})
    # Do not override a later editor-selected composition.
    if settings.get("layout", "chapter") not in ("chapter", "phone-showcase"):
        return result
    settings["layout"] = "phone-showcase"
    if slug == "ssag":
        for lang, note, labels in (
            ("ru", "Скриншоты сняты в эмуляторе приложения.", ("Карта", "Карточка места")),
            ("en", "Captured from the app running in an emulator.", ("Map", "Place details")),
        ):
            content = result.get("content_" + lang, {})
            if note in content.get("summary", ""):
                content["summary"] = content["summary"].replace(note, "").strip()
            for item in content.get("items", []):
                if item.get("image_url") == "/cases/ssag/screens/map.png":
                    if not item.get("image_label"):
                        item["image_label"] = labels[0]
                    if not item.get("secondary_image_label"):
                        item["secondary_image_label"] = labels[1]
    return result


def patch_document(document, slug):
    result = deepcopy(document)
    result["blocks"] = [patch_block(block, slug) for block in result.get("blocks", [])]
    return result


def upgrade_cases(connection):
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=connection)
    blocks = sa.Table("project_blocks", schema, autoload_with=connection)
    revisions = sa.Table("project_revisions", schema, autoload_with=connection)
    for project in connection.execute(
        sa.select(projects).where(projects.c.slug.in_(TARGETS))
    ).mappings():
        slug = project["slug"]
        project_id = project["id"]
        draft_changed = False
        for row in connection.execute(
            sa.select(blocks).where(blocks.c.project_id == project_id)
        ).mappings():
            before = {
                key: row[key] for key in ("id", "type", "settings", "content_ru", "content_en")
            }
            after = patch_block(before, slug)
            values = {
                key: after[key]
                for key in ("settings", "content_ru", "content_en")
                if after[key] != before[key]
            }
            if values:
                connection.execute(blocks.update().where(blocks.c.id == row["id"]).values(**values))
                draft_changed = True
        # Public text and unpublished drafts are deliberately patched independently.
        published = project["published_data"]
        values = {}
        if published:
            updated = patch_document(published, slug)
            if updated != published:
                now = datetime.utcnow()
                version = (
                    connection.execute(
                        sa.select(sa.func.max(revisions.c.version)).where(
                            revisions.c.project_id == project_id
                        )
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
                values.update(published_data=updated, published_at=now)
        if values or draft_changed:
            values["updated_at"] = datetime.utcnow()
            connection.execute(
                projects.update().where(projects.c.id == project_id).values(**values)
            )


def upgrade():
    upgrade_cases(op.get_bind())


def downgrade():
    # Preserve authored content; the prior public snapshot remains in revisions.
    pass
