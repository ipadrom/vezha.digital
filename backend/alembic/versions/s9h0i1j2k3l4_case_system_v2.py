"""Introduce the case-system v2 insight block and editorial layouts.

Revision ID: s9h0i1j2k3l4
Revises: r8g9h0i1j2k3
"""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime
from uuid import NAMESPACE_URL, UUID, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "s9h0i1j2k3l4"
down_revision: str = "r8g9h0i1j2k3"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SLUG = "wellness-app"


def _uuid(name: str) -> UUID:
    return uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/{SLUG}#case-system-v2-{name}")


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
    now: datetime,
) -> None:
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


def upgrade() -> None:
    connection = op.get_bind()
    projects, blocks, revisions = _tables()
    project = connection.execute(
        sa.select(
            projects.c.id,
            projects.c.draft_data,
            projects.c.published_data,
        ).where(projects.c.slug == SLUG)
    ).mappings().one_or_none()
    if project is None:
        return

    project = dict(project)
    rows = connection.execute(
        sa.select(
            blocks.c.id,
            blocks.c.type,
            blocks.c.content_ru,
            blocks.c.content_en,
            blocks.c.settings,
            blocks.c.sort_order,
        ).where(blocks.c.project_id == project["id"]).order_by(blocks.c.sort_order.desc())
    ).mappings().all()

    for source in rows:
        row = dict(source)
        order = int(row["sort_order"])
        settings = dict(row.get("settings") or {})
        content_ru = dict(row.get("content_ru") or {})
        content_en = dict(row.get("content_en") or {})

        if row["type"] == "text" and order in {2, 6, 9}:
            settings["layout"] = "editorial"
        elif row["type"] == "challenge_solution" and order == 4:
            settings["layout"] = "narrative"
            content_ru.update(
                impact_label="Что изменилось",
                impact="Вместо панели управления получился спокойный маршрут: меньше решений во время действия, яснее следующий шаг и единая логика для тренировки и питания.",
            )
            content_en.update(
                impact_label="Impact",
                impact="Instead of a control panel, the product became a calm route: fewer decisions during action, a clearer next step and one logic across workout and nutrition.",
            )
        elif row["type"] == "process" and order == 5:
            settings["layout"] = "story"
            settings["disclosure_mode"] = "multiple"
            settings["open_first"] = True
        elif row["type"] == "results" and order == 13:
            settings["layout"] = "statement"

        next_order = order + 1 if order >= 5 else order
        connection.execute(
            blocks.update().where(blocks.c.id == row["id"]).values(
                content_ru=content_ru,
                content_en=content_en,
                settings=settings,
                sort_order=next_order,
            )
        )

    insight_id = _uuid("insight")
    existing = connection.execute(
        sa.select(blocks.c.id).where(blocks.c.id == insight_id)
    ).scalar_one_or_none()
    if existing is None:
        connection.execute(
            blocks.insert().values(
                id=insight_id,
                project_id=project["id"],
                type="insight",
                content_ru={
                    "eyebrow": "Ключевое решение",
                    "title": "Открывать только то, что нужно сейчас.",
                    "statement": "Продукт не показывает весь день как панель управления — он ведёт по ближайшему доступному действию и сохраняет контекст между шагами.",
                    "rationale_label": "Почему",
                    "rationale": "Во время тренировки внимание должно оставаться на движении, а не на навигации и выборе режима.",
                    "outcome_label": "Результат",
                    "outcome": "Одна и та же модель переходов работает в тренировке, восстановлении, прогрессии и питании.",
                    "image_url": "",
                    "image_alt": "",
                },
                content_en={
                    "eyebrow": "Key decision",
                    "title": "Reveal only what is needed now.",
                    "statement": "The product does not expose the whole day as a dashboard. It guides the nearest available action and preserves context between steps.",
                    "rationale_label": "Why",
                    "rationale": "During a workout, attention should stay on movement rather than navigation and mode selection.",
                    "outcome_label": "Outcome",
                    "outcome": "The same transition model now works across workout, recovery, progression and nutrition.",
                    "image_url": "",
                    "image_alt": "",
                },
                settings={
                    "theme": "ink",
                    "surface": "card",
                    "width": "wide",
                    "spacing": "large",
                    "layout": "statement",
                    "alignment": "left",
                    "desktop_span": 12,
                    "desktop_start": 0,
                    "tablet_span": 12,
                    "tablet_start": 0,
                    "mobile_span": 12,
                    "mobile_start": 0,
                },
                sort_order=5,
                is_visible=True,
            )
        )

    _publish_snapshot(connection, projects, blocks, revisions, project, datetime.utcnow())


def downgrade() -> None:
    connection = op.get_bind()
    projects, blocks, revisions = _tables()
    project = connection.execute(
        sa.select(
            projects.c.id,
            projects.c.draft_data,
            projects.c.published_data,
        ).where(projects.c.slug == SLUG)
    ).mappings().one_or_none()
    if project is None:
        return

    project = dict(project)
    connection.execute(blocks.delete().where(blocks.c.id == _uuid("insight")))
    rows = connection.execute(
        sa.select(blocks.c.id, blocks.c.sort_order)
        .where(blocks.c.project_id == project["id"], blocks.c.sort_order > 5)
        .order_by(blocks.c.sort_order)
    ).mappings().all()
    for row in rows:
        connection.execute(
            blocks.update().where(blocks.c.id == row["id"]).values(sort_order=int(row["sort_order"]) - 1)
        )
    _publish_snapshot(connection, projects, blocks, revisions, project, datetime.utcnow())
