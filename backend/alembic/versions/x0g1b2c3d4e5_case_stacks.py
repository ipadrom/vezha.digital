"""Link related technologies in the Zagorulko stack and expand the MyMIT stack.

Technology items are matched by id inside `technologies` blocks: listed fields are merged,
unknown items are appended, everything else in the case stays as edited. Draft rows and the
published snapshot are patched separately.

Revision ID: x0g1b2c3d4e5
Revises: w9f0a1b2c3d4
"""

import json
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "x0g1b2c3d4e5"
down_revision = "w9f0a1b2c3d4"
branch_labels = None
depends_on = None

BLOCK_KEYS = ("id", "type", "content_ru", "content_en", "settings", "sort_order", "is_visible")


def load_patch():
    path = Path(__file__).parents[1] / "data" / "case_stacks_20260925.json"
    return json.loads(path.read_text(encoding="utf-8"))


def merged_item(existing, entry, lang):
    item = dict(existing or {"x": None, "y": None, "category": ""})
    item["id"] = entry["id"]
    if "icon" in entry:
        item["icon"] = entry["icon"]
    if "related_ids" in entry:
        item["related_ids"] = list(entry["related_ids"])
    item.update(entry.get(lang, {}))
    return item


def patch_document(document, case_patch):
    """Return a copy of the case document with the stack patch applied to its technologies blocks."""
    result = deepcopy(document)
    for block in result.get("blocks", []):
        if block.get("type") != "technologies":
            continue
        for lang in ("ru", "en"):
            content = block.setdefault("content_" + lang, {})
            if "summary" in case_patch:
                content["summary"] = case_patch["summary"][lang]
            items = content.get("items") or []
            by_id = {item.get("id"): item for item in items}
            for entry in case_patch["items"]:
                if entry["id"] in by_id:
                    by_id[entry["id"]].update(merged_item(by_id[entry["id"]], entry, lang))
                elif lang in entry:
                    items.append(merged_item(None, entry, lang))
            content["items"] = items
    return result


def patch_case(connection, slug, case_patch):
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=connection)
    blocks = sa.Table("project_blocks", schema, autoload_with=connection)
    revisions = sa.Table("project_revisions", schema, autoload_with=connection)
    project = (
        connection.execute(sa.select(projects).where(projects.c.slug == slug))
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
    for block, row in zip(patch_document(draft, case_patch)["blocks"], rows):
        values = {key: block[key] for key in ("content_ru", "content_en") if block[key] != row[key]}
        if values:
            connection.execute(blocks.update().where(blocks.c.id == row["id"]).values(**values))
    published = project["published_data"]
    if not published:
        return
    updated = patch_document(published, case_patch)
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
    connection = op.get_bind()
    for slug, case_patch in load_patch()["cases"].items():
        patch_case(connection, slug, case_patch)


def downgrade():
    # Authored content stays; the previous public snapshot remains in revisions.
    pass
