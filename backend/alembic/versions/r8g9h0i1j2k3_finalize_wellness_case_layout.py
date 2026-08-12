"""Finalize the WELLNESS APP process, media pairs and facts layout.

Revision ID: r8g9h0i1j2k3
Revises: q7f8g9h0i1j2
"""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime
from uuid import NAMESPACE_URL, UUID, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "r8g9h0i1j2k3"
down_revision: str = "q7f8g9h0i1j2"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SLUG = "wellness-app"


def _uuid(name: str) -> UUID:
    return uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/{SLUG}#final-layout-{name}")


def _process_media(locale: str) -> list[tuple[str, str]]:
    if locale == "ru":
        return [
            ("system-flow.gif", "Тренировка и питание соединяются в единый сценарий WELLNESS APP"),
            ("sequence-flow.gif", "Последовательное открытие доступных блоков тренировки"),
            ("technique-flow.gif", "Открытие подсказки по технике поверх текущего упражнения"),
            ("recovery-flow.gif", "Таймер отдыха с паузой и возвращением к нагрузке"),
            ("progression-flow.gif", "Прогрессия повторений, веса и следующего тренировочного цикла"),
            ("nutrition-process-flow.gif", "Переход от дневного меню к рецепту, ингредиентам и КБЖУ"),
        ]
    return [
        ("system-flow.gif", "Workout and nutrition connect into one WELLNESS APP flow"),
        ("sequence-flow.gif", "Workout blocks unlocking in sequence"),
        ("technique-flow.gif", "Technique guidance opening over the current exercise"),
        ("recovery-flow.gif", "Recovery timer with pause and return to movement"),
        ("progression-flow.gif", "Progression across reps, weight and the next workout cycle"),
        ("nutrition-process-flow.gif", "Flow from daily menu to recipe, ingredients and macros"),
    ]


def _patch_process(content: dict[str, object], locale: str) -> dict[str, object]:
    updated = dict(content)
    items = [dict(item) for item in updated.get("items", [])]
    for item, (filename, alt) in zip(items, _process_media(locale), strict=False):
        item["image_url"] = f"/cases/wellness-app/{filename}"
        item["image_alt"] = alt
        item["media_size"] = "full"
    updated["items"] = items
    return updated


def _patch_technology(content: dict[str, object]) -> dict[str, object]:
    updated = dict(content)
    items = [dict(item) for item in updated.get("items", [])]
    for item in items:
        if item.get("label") == "LocalStorage":
            item.update(x=27, y=84)
        elif item.get("label") == "Node 22 Proxy":
            item.update(x=73, y=84)
    updated["items"] = items
    return updated


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

    project = connection.execute(
        sa.select(
            projects.c.id,
            projects.c.draft_data,
            projects.c.published_data,
        ).where(projects.c.slug == SLUG)
    ).mappings().one_or_none()
    if project is None:
        return

    rows = connection.execute(
        sa.select(
            blocks.c.id,
            blocks.c.type,
            blocks.c.content_ru,
            blocks.c.content_en,
            blocks.c.settings,
            blocks.c.sort_order,
            blocks.c.is_visible,
        ).where(blocks.c.project_id == project["id"]).order_by(blocks.c.sort_order)
    ).mappings().all()

    normalized: list[dict[str, object]] = []
    for source in rows:
        row = dict(source)
        settings = dict(row.get("settings") or {})
        content_ru = dict(row.get("content_ru") or {})
        content_en = dict(row.get("content_en") or {})
        order = int(row["sort_order"])

        if order == 5 and row["type"] == "text":
            connection.execute(blocks.delete().where(blocks.c.id == row["id"]))
            continue

        final_order = order - 1 if order > 5 else order

        if order == 3:
            settings["surface"] = "plain"
        elif order == 4:
            settings["surface"] = "plain"
        elif order == 6:
            settings.update(desktop_span=12, surface="plain")
            content_ru = _patch_process(content_ru, "ru")
            content_en = _patch_process(content_en, "en")
        elif order == 8:
            content_ru.update(
                image_url="/cases/wellness-app/workout-flow.gif",
                alt="Переход от плана тренировки к активному упражнению",
                caption="",
            )
            content_en.update(
                image_url="/cases/wellness-app/workout-flow.gif",
                alt="Transition from workout plan to the active exercise",
                caption="",
            )
        elif order == 11:
            content_ru.update(
                image_url="/cases/wellness-app/nutrition-flow.gif",
                alt="Переход от дневного меню к рецепту и ингредиентам",
                caption="",
            )
            content_en.update(
                image_url="/cases/wellness-app/nutrition-flow.gif",
                alt="Transition from daily menu to recipe and ingredients",
                caption="",
            )
        elif order == 13:
            content_ru = _patch_technology(content_ru)
            content_en = _patch_technology(content_en)

        connection.execute(
            blocks.update().where(blocks.c.id == row["id"]).values(
                content_ru=content_ru,
                content_en=content_en,
                settings=settings,
                sort_order=final_order,
            )
        )
        normalized.append(
            {
                "id": row["id"],
                "type": row["type"],
                "content_ru": content_ru,
                "content_en": content_en,
                "settings": settings,
                "sort_order": final_order,
                "is_visible": bool(row["is_visible"]),
            }
        )

    published = project["published_data"] or {}
    meta = dict(project["draft_data"] or published.get("meta") or {})
    snapshot = {
        "meta": meta,
        "blocks": [
            {
                **row,
                "id": str(row["id"]),
            }
            for row in normalized
        ],
    }
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
        sa.select(sa.func.max(revisions.c.version)).where(
            revisions.c.project_id == project["id"]
        )
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
    # Case content is editable; downgrading must not overwrite later changes.
    pass
