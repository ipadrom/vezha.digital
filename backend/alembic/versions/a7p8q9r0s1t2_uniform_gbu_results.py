"""Align the first two GBU result sections with the third.

Revision ID: a7p8q9r0s1t2
Revises: z6o7p8q9r0s1
"""

from copy import deepcopy
from datetime import datetime
from uuid import uuid4

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision = "a7p8q9r0s1t2"
down_revision = "z6o7p8q9r0s1"
branch_labels = None
depends_on = None
SLUG = "gbu-process-automation"
RESULT_TITLES = {
    "1ce06ff8-b690-5b30-9b9f-9e5568c1bf9e": {
        "content_ru": ["Отдельное сообщение на заказ", "Без повторного набора", "Проверка до отправки", "Готовая основа задания"],
        "content_en": ["One message per order", "No retyping", "Review before sending", "A prepared task message"],
    },
    "0643cfc0-e856-587f-9f8e-e7a834a3ceb1": {
        "content_ru": ["Бригадир в каждом составе", "История и ограничения", "Спорные сочетания видны", "Основа следующих расчётов"],
        "content_en": ["A foreman in every team", "History and constraints", "Uncertain lineups flagged", "A basis for future calculations"],
    },
}


def transform_block(source):
    block = deepcopy(dict(source))
    titles = RESULT_TITLES.get(str(block.get("id")))
    if titles is None or block.get("type") != "results":
        return block
    block["settings"] = {**block.get("settings", {}), "layout": "air"}
    for language, labels in titles.items():
        content = block.get(language) or {}
        for index, item in enumerate(content.get("items", [])):
            if isinstance(item, dict) and index < len(labels) and not item.get("title"):
                item["title"] = labels[index]
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
