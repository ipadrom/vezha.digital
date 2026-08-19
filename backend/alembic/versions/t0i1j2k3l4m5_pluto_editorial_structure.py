"""Adopt the reference-led editorial structure for the wellness case.

Revision ID: t0i1j2k3l4m5
Revises: s9h0i1j2k3l4
"""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime
from uuid import NAMESPACE_URL, UUID, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "t0i1j2k3l4m5"
down_revision: str = "s9h0i1j2k3l4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SLUG = "wellness-app"


def _uuid(name: str) -> UUID:
    return uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/{SLUG}#pluto-editorial-{name}")


def _tables() -> tuple[sa.TableClause, sa.TableClause, sa.TableClause]:
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
    return projects, blocks, revisions


def _snapshot(connection: sa.Connection, blocks: sa.TableClause, project_id: UUID) -> list[dict[str, object]]:
    rows = connection.execute(
        sa.select(
            blocks.c.id,
            blocks.c.type,
            blocks.c.content_ru,
            blocks.c.content_en,
            blocks.c.settings,
            blocks.c.sort_order,
            blocks.c.is_visible,
        ).where(blocks.c.project_id == project_id).order_by(blocks.c.sort_order)
    ).mappings().all()
    return [
        {
            "id": str(row["id"]),
            "type": row["type"],
            "content_ru": dict(row["content_ru"] or {}),
            "content_en": dict(row["content_en"] or {}),
            "settings": dict(row["settings"] or {}),
            "sort_order": int(row["sort_order"]),
            "is_visible": bool(row["is_visible"]),
        }
        for row in rows
    ]


def _publish_snapshot(
    connection: sa.Connection,
    projects: sa.TableClause,
    blocks: sa.TableClause,
    revisions: sa.TableClause,
    project: dict[str, object],
) -> None:
    now = datetime.utcnow()
    published = project.get("published_data") or {}
    meta = dict(project.get("draft_data") or published.get("meta") or {})
    snapshot = {"meta": meta, "blocks": _snapshot(connection, blocks, project["id"])}
    connection.execute(
        projects.update().where(projects.c.id == project["id"]).values(
            draft_data=meta,
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


def _update_block(
    connection: sa.Connection,
    blocks: sa.TableClause,
    project_id: UUID,
    block_type: str,
    order: int,
    *,
    content_ru: dict[str, object] | None = None,
    content_en: dict[str, object] | None = None,
    settings: dict[str, object] | None = None,
    remove_content: Sequence[str] = (),
    remove_settings: Sequence[str] = (),
) -> None:
    row = connection.execute(
        sa.select(
            blocks.c.id,
            blocks.c.content_ru,
            blocks.c.content_en,
            blocks.c.settings,
        ).where(
            blocks.c.project_id == project_id,
            blocks.c.type == block_type,
            blocks.c.sort_order == order,
        )
    ).mappings().one_or_none()
    if row is None:
        return

    next_ru = dict(row["content_ru"] or {})
    next_en = dict(row["content_en"] or {})
    next_settings = dict(row["settings"] or {})
    next_ru.update(content_ru or {})
    next_en.update(content_en or {})
    next_settings.update(settings or {})
    for key in remove_content:
        next_ru.pop(key, None)
        next_en.pop(key, None)
    for key in remove_settings:
        next_settings.pop(key, None)

    connection.execute(
        blocks.update().where(blocks.c.id == row["id"]).values(
            content_ru=next_ru,
            content_en=next_en,
            settings=next_settings,
        )
    )


def _project(connection: sa.Connection, projects: sa.TableClause) -> dict[str, object] | None:
    row = connection.execute(
        sa.select(projects.c.id, projects.c.draft_data, projects.c.published_data)
        .where(projects.c.slug == SLUG)
    ).mappings().one_or_none()
    return dict(row) if row else None


def upgrade() -> None:
    connection = op.get_bind()
    projects, blocks, revisions = _tables()
    project = _project(connection, projects)
    if project is None:
        return

    _update_block(
        connection,
        blocks,
        project["id"],
        "text",
        2,
        content_ru={"tags": ["Продуктовый дизайн", "Nuxt 3", "FastAPI", "PWA"]},
        content_en={"tags": ["Product design", "Nuxt 3", "FastAPI", "PWA"]},
        settings={"theme": "paper", "surface": "plain", "desktop_span": 12, "layout": "overview"},
    )
    _update_block(
        connection,
        blocks,
        project["id"],
        "metrics",
        3,
        settings={"surface": "plain", "desktop_span": 12, "layout": "cards", "show_intro": False},
    )
    _update_block(
        connection,
        blocks,
        project["id"],
        "process",
        6,
        content_ru={
            "summary": "Каждый этап раскрывает отдельное продуктовое решение: сначала принцип, затем его поведение в интерфейсе, крупное медиа и короткий набор полученных свойств."
        },
        content_en={
            "summary": "Each stage reveals one product decision: the principle first, then its interface behavior, a large media example and a concise set of outcomes."
        },
        settings={"layout": "story", "disclosure_mode": "multiple", "open_first": True, "desktop_span": 12},
    )
    _update_block(connection, blocks, project["id"], "text", 7, settings={"desktop_span": 12, "layout": "editorial"})
    _update_block(connection, blocks, project["id"], "image", 8, settings={"desktop_span": 12, "image_bleed": False})
    _update_block(connection, blocks, project["id"], "text", 10, settings={"desktop_span": 12, "layout": "editorial"})
    _update_block(connection, blocks, project["id"], "image", 11, settings={"desktop_span": 12, "image_bleed": False})
    _publish_snapshot(connection, projects, blocks, revisions, project)


def downgrade() -> None:
    connection = op.get_bind()
    projects, blocks, revisions = _tables()
    project = _project(connection, projects)
    if project is None:
        return

    _update_block(
        connection,
        blocks,
        project["id"],
        "text",
        2,
        settings={"theme": "soft", "surface": "card", "desktop_span": 6, "layout": "editorial"},
        remove_content=("tags",),
    )
    _update_block(
        connection,
        blocks,
        project["id"],
        "metrics",
        3,
        settings={"surface": "plain", "desktop_span": 6, "layout": "default"},
        remove_settings=("show_intro",),
    )
    _update_block(connection, blocks, project["id"], "process", 6, remove_content=("summary",))
    _update_block(connection, blocks, project["id"], "text", 7, settings={"desktop_span": 6})
    _update_block(connection, blocks, project["id"], "image", 8, settings={"desktop_span": 6, "image_bleed": True})
    _update_block(connection, blocks, project["id"], "text", 10, settings={"desktop_span": 6})
    _update_block(connection, blocks, project["id"], "image", 11, settings={"desktop_span": 6, "image_bleed": True})
    _publish_snapshot(connection, projects, blocks, revisions, project)
