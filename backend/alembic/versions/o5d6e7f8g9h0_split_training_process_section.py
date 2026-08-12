"""Split the Training process chapter into adjacent text and process blocks.

Revision ID: o5d6e7f8g9h0
Revises: n4c5d6e7f8g9
"""

from collections.abc import Sequence
from datetime import datetime
from uuid import NAMESPACE_URL, UUID, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "o5d6e7f8g9h0"
down_revision: str = "n4c5d6e7f8g9"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SLUG = "wellness-app"


def _uuid(name: str) -> UUID:
    return uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/{SLUG}#split-process-{name}")


def _settings(span: int) -> dict[str, object]:
    return {
        "theme": "paper",
        "surface": "plain",
        "width": "wide",
        "spacing": "large",
        "layout": "default",
        "alignment": "left",
        "desktop_span": span,
        "desktop_start": 0,
        "tablet_span": 12,
        "tablet_start": 0,
        "mobile_span": 12,
        "mobile_start": 0,
    }


def upgrade() -> None:
    connection = op.get_bind()
    now = datetime.utcnow()
    projects = sa.table(
        "projects",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("slug", sa.String()),
        sa.column("draft_data", postgresql.JSONB()),
        sa.column("published_data", postgresql.JSONB()),
        sa.column("published_at", sa.DateTime()),
        sa.column("updated_at", sa.DateTime()),
        sa.column("status", sa.String()),
        sa.column("is_active", sa.Boolean()),
    )
    blocks_table = sa.table(
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

    project = connection.execute(
        sa.select(projects.c.id, projects.c.draft_data).where(projects.c.slug == SLUG)
    ).mappings().one_or_none()
    if project is None:
        return

    rows = list(
        connection.execute(
            sa.select(
                blocks_table.c.id,
                blocks_table.c.type,
                blocks_table.c.content_ru,
                blocks_table.c.content_en,
                blocks_table.c.settings,
                blocks_table.c.sort_order,
                blocks_table.c.is_visible,
            )
            .where(blocks_table.c.project_id == project["id"])
            .order_by(blocks_table.c.sort_order)
        ).mappings()
    )
    intro = next(
        (
            row
            for row in rows
            if row["type"] == "text" and row["content_ru"].get("eyebrow") == "Наш процесс"
        ),
        None,
    )
    process = next((row for row in rows if row["type"] == "process"), None)
    if process is None:
        return

    inserted = intro is None
    normalized: list[dict[str, object]] = []
    for row in rows:
        item = dict(row)
        if intro is not None and row["id"] == intro["id"]:
            item.update(
                content_ru={
                    "eyebrow": "Наш процесс",
                    "title": "От тренировки — к системе дня.",
                    "body": "Логика продукта\n\nТренировка · прогрессия · питание",
                },
                content_en={
                    "eyebrow": "Our process",
                    "title": "From a workout to a system for the day.",
                    "body": "Product logic\n\nWorkout · progression · nutrition",
                },
                settings=_settings(4),
                sort_order=5,
            )
        elif row["id"] == process["id"]:
            ru = dict(row["content_ru"])
            en = dict(row["content_en"])
            ru.update(
                eyebrow="Логика решения",
                title="Собрали интерфейс вокруг реального порядка действий — от первого блока до рациона.",
            )
            en.update(
                eyebrow="Solution logic",
                title="The interface follows the real order of actions — from the first block to the daily plan.",
            )
            item.update(content_ru=ru, content_en=en, settings=_settings(8), sort_order=6)
        elif inserted and row["sort_order"] >= 6:
            item["sort_order"] = row["sort_order"] + 1
        normalized.append(item)

    if inserted:
        normalized.append(
            {
                "id": _uuid("intro"),
                "type": "text",
                "content_ru": {
                    "eyebrow": "Наш процесс",
                    "title": "От тренировки — к системе дня.",
                    "body": "Логика продукта\n\nТренировка · прогрессия · питание",
                },
                "content_en": {
                    "eyebrow": "Our process",
                    "title": "From a workout to a system for the day.",
                    "body": "Product logic\n\nWorkout · progression · nutrition",
                },
                "settings": _settings(4),
                "sort_order": 5,
                "is_visible": True,
            }
        )

    normalized.sort(key=lambda item: int(item["sort_order"]))
    for index, item in enumerate(normalized):
        item["sort_order"] = index

    connection.execute(blocks_table.delete().where(blocks_table.c.project_id == project["id"]))
    connection.execute(
        blocks_table.insert(),
        [
            {
                **item,
                "project_id": project["id"],
            }
            for item in normalized
        ],
    )
    snapshot = {
        "meta": project["draft_data"],
        "blocks": [
            {
                "id": str(item["id"]),
                "type": item["type"],
                "content_ru": item["content_ru"],
                "content_en": item["content_en"],
                "settings": item["settings"],
                "sort_order": item["sort_order"],
                "is_visible": item["is_visible"],
            }
            for item in normalized
        ],
    }
    connection.execute(
        projects.update().where(projects.c.id == project["id"]).values(
            published_data=snapshot,
            published_at=now,
            updated_at=now,
            status="published",
            is_active=True,
        )
    )
    previous_version = connection.execute(
        sa.select(sa.func.max(revisions.c.version)).where(revisions.c.project_id == project["id"])
    ).scalar_one_or_none() or 0
    version = previous_version + 1
    connection.execute(
        revisions.insert().values(
            id=_uuid(f"revision-{version}"),
            project_id=project["id"],
            version=version,
            snapshot=snapshot,
            created_at=now,
        )
    )


def downgrade() -> None:
    # Content may be edited after deployment; downgrading must not overwrite it.
    pass
