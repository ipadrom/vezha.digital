"""Swap nine Zagorulko fragments for recorded clips and add units to the result figures.

Items are matched by title in each language, so edited descriptions, tags and the
remaining blocks survive. Draft rows and the published snapshot are patched separately.

Revision ID: w9f0a1b2c3d4
Revises: v8e9f0a1b2c3
"""

import json
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "w9f0a1b2c3d4"
down_revision = "v8e9f0a1b2c3"
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


def load_patch():
    path = Path(__file__).parents[1] / "data" / "zagorulko_videos_20260925.json"
    return json.loads(path.read_text(encoding="utf-8"))


def media_fields(patch, item, lang):
    """The media fields one recorded clip contributes to a process item."""
    base = patch["media_dir"] + item["clip"]
    fields = {
        "media_type": "video",
        "image_url": "",
        "video_url": base + ".mp4",
        "poster_url": base + ".jpg",
        "media_size": "full",
        "media_layout": "default",
        "media_note": item["media_note"][lang],
    }
    if "media_caption" in item:
        fields["media_caption"] = item["media_caption"][lang]
    return fields


def patch_document(document, patch):
    """Return a copy of the document with the clips attached to matching process items."""
    result = deepcopy(document)
    for block in result.get("blocks", []):
        if block.get("type") == "results":
            for lang in ("ru", "en"):
                renamed = patch.get("results", {}).get(lang, {})
                for item in block.get("content_" + lang, {}).get("items", []) or []:
                    item["title"] = renamed.get(item.get("title"), item.get("title"))
        if block.get("type") != "process":
            continue
        for lang in ("ru", "en"):
            for item in block.get("content_" + lang, {}).get("items", []) or []:
                match = next(
                    (
                        entry
                        for entry in patch["items"]
                        if entry["title"][lang] == item.get("title")
                    ),
                    None,
                )
                if match is not None:
                    item.update(media_fields(patch, match, lang))
    return result


def attach_videos(connection, patch):
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=connection)
    blocks = sa.Table("project_blocks", schema, autoload_with=connection)
    revisions = sa.Table("project_revisions", schema, autoload_with=connection)
    project = (
        connection.execute(sa.select(projects).where(projects.c.slug == patch["slug"]))
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
    draft = {"blocks": [{key: row[key] for key in BLOCK_KEYS} for row in rows]}
    for block, row in zip(patch_document(draft, patch)["blocks"], rows):
        values = {key: block[key] for key in ("content_ru", "content_en") if block[key] != row[key]}
        if values:
            connection.execute(blocks.update().where(blocks.c.id == row["id"]).values(**values))
    published = project["published_data"]
    if not published:
        return
    updated = patch_document(published, patch)
    if updated == published:
        return
    now = datetime.utcnow()
    version = (
        connection.execute(
            sa.select(sa.func.max(revisions.c.version)).where(revisions.c.project_id == project_id)
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
    connection.execute(
        projects.update()
        .where(projects.c.id == project_id)
        .values(published_data=updated, published_at=now, updated_at=now)
    )


def upgrade():
    attach_videos(op.get_bind(), load_patch())


def downgrade():
    # Authored content stays; the previous public snapshot remains in revisions.
    pass
