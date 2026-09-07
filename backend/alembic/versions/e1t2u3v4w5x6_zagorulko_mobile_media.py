"""Attach reviewed mobile media to Zagorulko without replacing other case edits.

Revision ID: e1t2u3v4w5x6
Revises: d0s1t2u3v4w5
"""

import json
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "e1t2u3v4w5x6"
down_revision = "d0s1t2u3v4w5"
branch_labels = None
depends_on = None


def load_patch():
    path = Path(__file__).parents[1] / "data" / "zagorulko_mobile_media_20260907.json"
    return json.loads(path.read_text(encoding="utf-8"))


def patch_document(document, patch):
    """Merge media fields into one snapshot, preserving all other authored fields."""
    result = deepcopy(document)
    result["meta"].update(patch["meta"])
    for block in result["blocks"]:
        change = patch["blocks"].get(str(block["id"]), {})
        block.setdefault("settings", {}).update(change.get("settings", {}))
        for lang in ("ru", "en"):
            content = block.setdefault("content_" + lang, {})
            if block["type"] == "hero":
                content["logo_url"] = patch["hero_logo"]
                content["title"] = patch["hero_titles"][lang]
                content["eyebrow"] = patch["hero_titles"][lang]
            content.update(change.get("shared", {}))
            content.update(change.get("content_" + lang, {}))
            for index, item_patch in change.get("items", {}).items():
                items = content.get("items", [])
                if int(index) < len(items):
                    items[int(index)].update(item_patch.get("shared", {}))
                    items[int(index)].update(item_patch.get(lang, {}))
    cover_id = patch["cover_block"]["id"]
    if not any(str(b["id"]) == cover_id for b in result["blocks"]):
        hero_index = next((i for i, b in enumerate(result["blocks"]) if b["type"] == "hero"), -1)
        result["blocks"].insert(hero_index + 1, deepcopy(patch["cover_block"]))
        for index, block in enumerate(result["blocks"]):
            block["sort_order"] = index
    return result


def attach_media(connection, patch):
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=connection)
    blocks = sa.Table("project_blocks", schema, autoload_with=connection)
    revisions = sa.Table("project_revisions", schema, autoload_with=connection)
    project = (
        connection.execute(sa.select(projects).where(projects.c.id == patch["project_id"]))
        .mappings()
        .one_or_none()
    )
    if project is None:
        return
    project_id = project["id"]
    rows = list(
        connection.execute(
            sa.select(blocks).where(blocks.c.project_id == project_id).order_by(blocks.c.sort_order)
        ).mappings()
    )
    current_blocks = [
        {
            key: row[key]
            for key in (
                "id",
                "type",
                "content_ru",
                "content_en",
                "settings",
                "sort_order",
                "is_visible",
            )
        }
        for row in rows
    ]
    for block in current_blocks:
        block["id"] = str(block["id"])
    draft = {"meta": project["draft_data"] or {}, "blocks": current_blocks}
    updated_draft = patch_document(draft, patch)
    row_by_id = {str(row["id"]): row for row in rows}
    for block in updated_draft["blocks"]:
        existing = row_by_id.get(block["id"])
        if existing is None:
            connection.execute(blocks.insert().values(project_id=project_id, **block))
        else:
            values = {
                key: block[key]
                for key in ("content_ru", "content_en", "settings", "sort_order")
                if block[key] != existing[key]
            }
            if values:
                connection.execute(
                    blocks.update().where(blocks.c.id == existing["id"]).values(**values)
                )
    values = {
        key: value
        for key, value in patch["meta"].items()
        if key in projects.c and project[key] != value
    }
    if updated_draft["meta"] != draft["meta"]:
        values["draft_data"] = updated_draft["meta"]
    # Patch the public snapshot separately: unpublished text must remain unpublished.
    published = project["published_data"]
    if published:
        updated_public = patch_document(published, patch)
        if updated_public != published:
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
                    snapshot=updated_public,
                    created_at=now,
                )
            )
            values.update(published_data=updated_public, published_at=now)
    if values:
        values["updated_at"] = datetime.utcnow()
        connection.execute(projects.update().where(projects.c.id == project_id).values(**values))


def upgrade():
    attach_media(op.get_bind(), load_patch())


def downgrade():
    # Preserve authored content; the previous public snapshot remains in revisions.
    pass
