"""Apply the approved SSAG MVP copy and media to draft and published content.

Revision ID: j6y7z8a9b0c1
Revises: i5x6y7z8a9b0
"""

import json
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from uuid import uuid4

import sqlalchemy as sa

from alembic import op

revision = "j6y7z8a9b0c1"
down_revision = "i5x6y7z8a9b0"
branch_labels = None
depends_on = None


def load_patch():
    return json.loads(
        (Path(__file__).parents[1] / "data/ssag_refresh_20260917.json").read_text("utf-8")
    )


def patch_block(block, patch):
    result = deepcopy(block)
    change = patch["blocks"].get(block["type"])
    if not change:
        return result
    for lang in ("ru", "en"):
        key = f"content_{lang}"
        result[key] = {**(result.get(key) or {}), **deepcopy(change[key])}
        if block["type"] == "technologies":
            for item in result[key].get("items", []):
                description = patch["technology_descriptions"][lang].get(item.get("id"))
                if description is not None:
                    item["description"] = description
    layout = {"media_hero": "media-16x9", "process": "phone-showcase"}.get(block["type"])
    if layout:
        result["settings"] = {**(result.get("settings") or {}), "layout": layout}
    return result


def check_structure(blocks, patch):
    for kind in patch["blocks"]:
        if sum(block["type"] == kind for block in blocks) != 1:
            raise ValueError(f"SSAG refresh expects exactly one {kind} block")


def patch_document(document, patch):
    check_structure(document["blocks"], patch)
    result = deepcopy(document)
    result["meta"] = {**result["meta"], **patch["meta"]}
    result["blocks"] = [patch_block(block, patch) for block in result["blocks"]]
    return result


def upgrade_cases(connection):
    patch = load_patch()
    schema = sa.MetaData()
    projects = sa.Table("projects", schema, autoload_with=connection)
    blocks = sa.Table("project_blocks", schema, autoload_with=connection)
    revisions = sa.Table("project_revisions", schema, autoload_with=connection)
    for project in connection.execute(
        sa.select(projects).where(projects.c.slug == "ssag")
    ).mappings():
        rows = list(
            connection.execute(
                sa.select(blocks).where(blocks.c.project_id == project["id"])
            ).mappings()
        )
        check_structure(rows, patch)
        published = project["published_data"]
        updated = patch_document(published, patch) if published else None
        changed = False
        for row in rows:
            after = patch_block(dict(row), patch)
            values = {
                key: after[key]
                for key in ("content_ru", "content_en", "settings")
                if after[key] != row[key]
            }
            if values:
                connection.execute(blocks.update().where(blocks.c.id == row["id"]).values(**values))
                changed = True
        values = {}
        draft = project["draft_data"]
        if draft is not None:
            next_draft = {**draft, **patch["meta"]}
            if next_draft != draft:
                values["draft_data"] = next_draft
        if published and updated != published:
            # Retain the exact old public snapshot as well as the new one.
            version = (
                connection.execute(
                    sa.select(sa.func.max(revisions.c.version)).where(
                        revisions.c.project_id == project["id"]
                    )
                ).scalar()
                or 0
            )
            now = datetime.utcnow()
            for offset, snapshot in enumerate((published, updated), 1):
                connection.execute(
                    revisions.insert().values(
                        id=str(uuid4()),
                        project_id=project["id"],
                        version=version + offset,
                        snapshot=snapshot,
                        created_at=now,
                    )
                )
            values.update(published_data=updated, published_at=now)
            values.update({key: value for key, value in patch["meta"].items() if key in projects.c})
        if values or changed:
            values["updated_at"] = datetime.utcnow()
            connection.execute(
                projects.update().where(projects.c.id == project["id"]).values(**values)
            )


def upgrade():
    upgrade_cases(op.get_bind())


def downgrade():
    # Editorial content is restored through admin revisions, not destructive SQL.
    pass
