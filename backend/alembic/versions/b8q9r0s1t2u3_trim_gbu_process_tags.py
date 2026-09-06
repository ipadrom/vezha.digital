"""Keep only useful process tags in the GBU case.

Revision ID: b8q9r0s1t2u3
Revises: a7p8q9r0s1t2
"""

from copy import deepcopy
from datetime import datetime
from uuid import uuid4

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision = "b8q9r0s1t2u3"
down_revision = "a7p8q9r0s1t2"
branch_labels = None
depends_on = None
SLUG = "gbu-process-automation"


def transform_block(source):
    block = deepcopy(dict(source))
    if block.get("type") != "process":
        return block
    for language in ("content_ru", "content_en"):
        for item in (block.get(language) or {}).get("items", []):
            tags = item.get("tags", [])
            if not isinstance(tags, list):
                continue
            kept = []
            for tag in tags:
                if tag in ("1–15 / 16–конец", "1–15 / 16–end"):
                    kept.append(tag)
                elif tag in ("40 perturbations", "40 перестроений"):
                    kept.append("40 перестроений" if language == "content_ru" else "40 perturbations")
            item["tags"] = kept
    return block


def transform_blocks(source):
    return [transform_block(block) for block in source]

def upgrade():
    connection = op.get_bind()
    projects = sa.table(
        "projects",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("slug", sa.String()),
        sa.column("draft_data", postgresql.JSONB()),
        sa.column("published_data", postgresql.JSONB()),
        sa.column("updated_at", sa.DateTime()),
    )
    blocks = sa.table(
        "project_blocks",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("project_id", postgresql.UUID(as_uuid=True)),
        sa.column("type", sa.String()),
        sa.column("content_ru", postgresql.JSONB()),
        sa.column("content_en", postgresql.JSONB()),
        sa.column("settings", postgresql.JSONB()),
        sa.column("sort_order", sa.Integer()),
        sa.column("is_visible", sa.Boolean()),
    )
    revisions = sa.table(
        "project_revisions",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("project_id", postgresql.UUID(as_uuid=True)),
        sa.column("version", sa.Integer()),
        sa.column("snapshot", postgresql.JSONB()),
        sa.column("created_at", sa.DateTime()),
    )
    project = (
        connection.execute(sa.select(projects).where(projects.c.slug == SLUG))
        .mappings()
        .one_or_none()
    )
    if project is None:
        return

    rows = (
        connection.execute(
            sa.select(blocks)
            .where(blocks.c.project_id == project["id"])
            .order_by(blocks.c.sort_order)
        )
        .mappings()
        .all()
    )
    published = deepcopy(project["published_data"] or {})
    updated = {**published, "blocks": transform_blocks(published.get("blocks", []))}
    version = (
        connection.execute(
            sa.select(sa.func.max(revisions.c.version)).where(
                revisions.c.project_id == project["id"]
            )
        ).scalar()
        or 0
    )
    now = datetime.utcnow()
    draft_backup = {
        "meta": deepcopy(project["draft_data"] or {}),
        "blocks": [
            {
                key: str(value) if key == "id" else value
                for key, value in dict(row).items()
                if key != "project_id"
            }
            for row in rows
        ],
    }
    for snapshot in (published, draft_backup, updated):
        version += 1
        connection.execute(
            revisions.insert().values(
                id=uuid4(),
                project_id=project["id"],
                version=version,
                snapshot=snapshot,
                created_at=now,
            )
        )

    for row in rows:
        changed = transform_block(row)
        if changed != dict(row):
            connection.execute(
                blocks.update()
                .where(blocks.c.id == row["id"])
                .values(
                    content_ru=changed["content_ru"],
                    content_en=changed["content_en"],
                    settings=changed["settings"],
                )
            )
    connection.execute(
        projects.update()
        .where(projects.c.id == project["id"])
        .values(published_data=updated, updated_at=now)
    )


def downgrade():
    # The full pre-change draft and published states are retained in case revisions.
    pass
