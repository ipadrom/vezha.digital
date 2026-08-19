"""Compose WELLNESS APP as a reference-led editorial case story.

Revision ID: u1j2k3l4m5n6
Revises: t0i1j2k3l4m5
"""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime
from uuid import NAMESPACE_URL, UUID, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "u1j2k3l4m5n6"
down_revision: str = "t0i1j2k3l4m5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SLUG = "wellness-app"


def _uuid(name: str) -> UUID:
    return uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/{SLUG}#pluto-structure-{name}")


def _settings(
    *,
    theme: str = "paper",
    width: str = "wide",
    spacing: str = "large",
    layout: str = "editorial",
    surface: str = "plain",
    **extra: object,
) -> dict[str, object]:
    return {
        "theme": theme,
        "surface": surface,
        "width": width,
        "spacing": spacing,
        "layout": layout,
        "alignment": "left",
        "desktop_span": 12,
        "desktop_start": 0,
        "tablet_span": 12,
        "tablet_start": 0,
        "mobile_span": 12,
        "mobile_start": 0,
        **extra,
    }


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


def _copy_row(row: dict[str, object]) -> dict[str, object]:
    return {
        "id": row["id"],
        "type": row["type"],
        "content_ru": dict(row.get("content_ru") or {}),
        "content_en": dict(row.get("content_en") or {}),
        "settings": dict(row.get("settings") or {}),
        "sort_order": int(row["sort_order"]),
        "is_visible": bool(row.get("is_visible", True)),
    }


def _with(
    row: dict[str, object],
    order: int,
    *,
    block_type: str | None = None,
    content_ru: dict[str, object] | None = None,
    content_en: dict[str, object] | None = None,
    settings: dict[str, object] | None = None,
) -> dict[str, object]:
    updated = _copy_row(row)
    updated["sort_order"] = order
    if block_type is not None:
        updated["type"] = block_type
    if content_ru is not None:
        updated["content_ru"] = content_ru
    if content_en is not None:
        updated["content_en"] = content_en
    if settings is not None:
        updated["settings"] = settings
    return updated


def _new(
    name: str,
    block_type: str,
    order: int,
    content_ru: dict[str, object],
    content_en: dict[str, object],
    settings: dict[str, object],
) -> dict[str, object]:
    return {
        "id": _uuid(f"block-{name}"),
        "type": block_type,
        "content_ru": content_ru,
        "content_en": content_en,
        "settings": settings,
        "sort_order": order,
        "is_visible": True,
    }


def _compose(rows: list[dict[str, object]]) -> list[dict[str, object]]:
    ordered = sorted((_copy_row(row) for row in rows), key=lambda row: int(row["sort_order"]))
    by_order = {int(row["sort_order"]): row for row in ordered}
    required = {
        0: "hero",
        1: "media_hero",
        2: "text",
        3: "metrics",
        4: "challenge_solution",
        5: "insight",
        6: "process",
        7: "text",
        8: "image",
        9: "gallery",
        10: "text",
        11: "image",
        12: "gallery",
        13: "technologies",
        14: "results",
        15: "next_case",
    }
    if any(by_order.get(order, {}).get("type") != block_type for order, block_type in required.items()):
        raise RuntimeError("WELLNESS APP block structure does not match the expected pre-composition state")

    source_ru = dict(by_order[6]["content_ru"])
    source_en = dict(by_order[6]["content_en"])
    items_ru = [dict(item) for item in source_ru.get("items", [])]
    items_en = [dict(item) for item in source_en.get("items", [])]
    if len(items_ru) < 6 or len(items_en) < 6:
        raise RuntimeError("WELLNESS APP process media is incomplete")

    context_ru = {
        "kicker": "",
        "eyebrow": "О проекте",
        "title": "Один инструмент для той части дня, которая раньше распадалась на таймеры, заметки и таблицы.",
        "body": "WELLNESS APP начинался как компактный трекер домашней круговой тренировки. Он держал порядок упражнений, считал отдых по реальному времени и сохранял нагрузку между занятиями. По мере развития продукта к тренировочному сценарию добавились прогрессия, техника упражнений, рецепты и меню на день.\n\nВместо набора независимых функций получилась одна последовательность: открыть план, пройти только доступный сейчас шаг, восстановиться, сохранить новую нагрузку и собрать питание без перехода в другой сервис.",
        "tags": ["Продуктовый дизайн", "Nuxt 3", "FastAPI", "PWA"],
    }
    context_en = {
        "kicker": "",
        "eyebrow": "About the project",
        "title": "One tool for the part of the day that used to fragment across timers, notes and spreadsheets.",
        "body": "WELLNESS APP began as a compact home circuit workout tracker. It kept the exercise order, measured rest against wall-clock time and preserved load between sessions. As the product evolved, progression, exercise guidance, recipes and daily meal planning joined the workout flow.\n\nRather than a set of isolated features, the product became one sequence: open the plan, complete the one available step, recover, preserve the new load and plan nutrition without switching tools.",
        "tags": ["Product design", "Nuxt 3", "FastAPI", "PWA"],
    }
    metrics_ru = {
        "eyebrow": "Продукт в цифрах",
        "title": "Компактная система, построенная вокруг повторяемого действия.",
        "summary": "Без выдуманных KPI: только параметры, которые зафиксированы в работающем продукте.",
        "items": [
            {"value": "04", "label": "последовательных блока", "context": "Пресс → сила → удары → растяжка"},
            {"value": "5×7", "label": "силовой цикл", "context": "Пять кругов по семь упражнений"},
            {"value": "03", "label": "занятия до шага прогрессии", "context": "Новая ступень нагрузки"},
            {"value": "LOCAL", "label": "состояние на устройстве", "context": "Быстрый возврат к сценарию"},
        ],
    }
    metrics_en = {
        "eyebrow": "Product facts",
        "title": "A focused system built around a repeatable action.",
        "summary": "No invented KPIs — only parameters present in the working product.",
        "items": [
            {"value": "04", "label": "gated workout blocks", "context": "Abs → strength → strikes → stretch"},
            {"value": "5×7", "label": "strength sequence", "context": "Five rounds of seven exercises"},
            {"value": "03", "label": "sessions per progression step", "context": "A new load step"},
            {"value": "LOCAL", "label": "on-device state", "context": "Immediate return to the flow"},
        ],
    }
    challenge_ru = {
        "kicker": "",
        "eyebrow": "Задача",
        "title": "Сделать продукт, который ведёт по сценарию, а не требует управлять им во время действия.",
        "body": "Тренировка не должна требовать постоянной навигации и контроля экрана. При этом нагрузка должна расти последовательно, таймер — переживать уход приложения в фон, а питание — оставаться достаточно простым для ежедневного использования.\n\nПоэтому интерфейс строится не как дашборд со всеми возможностями сразу, а как последовательность состояний: один доступный шаг, понятное восстановление, сохранённая нагрузка и продолжение того же ритма в меню и рецептах.",
        "tags": [],
    }
    challenge_en = {
        "kicker": "",
        "eyebrow": "Challenge",
        "title": "Build a product that guides the flow instead of demanding management during action.",
        "body": "A workout cannot demand constant navigation or screen attention. At the same time, load must progress coherently, timers must survive backgrounding, and nutrition must remain simple enough for everyday use.\n\nThe interface therefore behaves as a sequence of states rather than a dashboard of every possible action: one available step, clear recovery, preserved load and the same rhythm continuing into menus and recipes.",
        "tags": [],
    }
    process_intro_ru = {
        "kicker": "",
        "eyebrow": "Наш процесс",
        "title": "Разобрали ежедневный сценарий на три связанные главы: действие, восстановление и питание.",
        "body": "Каждую главу проверяли на одном принципе: интерфейс показывает только актуальное состояние, сохраняет контекст между шагами и подтверждает переход крупным медиа. Внутри главы решения раскрываются по одному — с объяснением, демонстрацией и коротким набором полученных свойств.",
        "tags": [],
    }
    process_intro_en = {
        "kicker": "",
        "eyebrow": "Our process",
        "title": "We organized the daily flow into three connected chapters: action, recovery and nutrition.",
        "body": "Each chapter follows one principle: the interface shows only the current state, preserves context between steps and confirms the transition with large media. Decisions open one by one with an explanation, a demonstration and a concise set of outcomes.",
        "tags": [],
    }
    chapter_settings = _settings(
        layout="chapter",
        disclosure_mode="multiple",
        open_first=False,
    )
    training_ru = {
        "eyebrow": "Тренировочный сценарий",
        "title": "План открывает только ближайшее действие и не возвращает пользователя к дашборду.",
        "summary": "Сначала система проводит через фиксированный порядок блоков, затем оставляет в фокусе одно упражнение и одну ближайшую кнопку. Подсказка по технике открывается поверх текущего шага, поэтому контекст занятия не теряется.",
        "items": items_ru[1:3],
    }
    training_en = {
        "eyebrow": "Workout flow",
        "title": "The plan reveals only the nearest action and never sends the user back to a dashboard.",
        "summary": "The system first guides a fixed block sequence, then keeps one exercise and one nearest action in focus. Movement guidance opens over the current step, so the workout context never disappears.",
        "items": items_en[1:3],
    }
    progression_ru = {
        "eyebrow": "Восстановление и прогрессия",
        "title": "Система помнит реальное время и нагрузку между подходами и занятиями.",
        "summary": "Wall-clock таймер продолжает отсчёт после сворачивания приложения, а Wake Lock, звук и вибрация снимают необходимость постоянно смотреть на экран. После трёх завершённых занятий прогрессия предлагает следующую ступень, сохраняя ручной контроль над весом и повторениями.",
        "items": items_ru[3:5],
    }
    progression_en = {
        "eyebrow": "Recovery and progression",
        "title": "The system remembers real time and load between sets and sessions.",
        "summary": "The wall-clock timer keeps counting after the app is backgrounded, while Wake Lock, sound and haptics remove the need to watch the screen. After three completed sessions, progression proposes the next step while preserving manual control over weight and repetitions.",
        "items": items_en[3:5],
    }
    nutrition_ru = {
        "eyebrow": "Питание",
        "title": "Тренировка заканчивается. Дневной сценарий — нет.",
        "summary": "Вторая вкладка продолжает продукт через понятные сущности: меню на день, приём пищи, рецепт и ингредиент. Пользователь видит КБЖУ на каждом уровне, меняет количество порций и собирает рацион из уже сохранённых блюд. Данные рецептов и меню остаются локальными, поэтому ежедневная работа не зависит от отдельного аккаунта или облачного кабинета.",
        "items": [items_ru[-1]],
    }
    nutrition_en = {
        "eyebrow": "Nutrition",
        "title": "The workout ends. The daily flow does not.",
        "summary": "The second tab continues the product through clear objects: daily menu, meal, recipe and ingredient. Macros remain visible at every level, serving counts stay adjustable, and a day can be assembled from saved dishes. Recipe and menu data stay local, so everyday use does not depend on a separate account or cloud dashboard.",
        "items": [items_en[-1]],
    }
    result_ru = dict(by_order[14]["content_ru"])
    result_en = dict(by_order[14]["content_en"])
    result_ru.update(
        items=[
            {"text": "Пользователь проходит тренировку без возврата к дашборду."},
            {"text": "Контекст нагрузки сохраняется между занятиями."},
            {"text": "Тот же сценарий продолжается в меню, рецептах и расчёте КБЖУ."},
            {"text": "Данные остаются на устройстве, а сервер подключается только к внешнему источнику."},
        ]
    )
    result_en.update(
        items=[
            {"text": "The workout progresses without a return to a dashboard."},
            {"text": "Load context is preserved between sessions."},
            {"text": "The same flow continues into menus, recipes and macro calculations."},
            {"text": "Data stays on device, with the server used only for an external source."},
        ]
    )
    technology_ru = dict(by_order[13]["content_ru"])
    technology_en = dict(by_order[13]["content_en"])
    technology_ru.update(eyebrow="Технологии", title="PRODUCT / WEB / API", summary="")
    technology_en.update(eyebrow="Technologies", title="PRODUCT / WEB / API", summary="")

    system_ru = items_ru[0]
    system_en = items_en[0]
    composition = [
        _with(by_order[0], 0),
        _with(by_order[1], 1),
        _with(by_order[2], 2, content_ru=context_ru, content_en=context_en, settings=_settings(layout="overview", anchor="story")),
        _with(by_order[3], 3, content_ru=metrics_ru, content_en=metrics_en, settings=_settings(spacing="normal", layout="cards", show_intro=False, anchor="evidence")),
        _with(by_order[4], 4, block_type="text", content_ru=challenge_ru, content_en=challenge_en, settings=_settings(anchor="challenge")),
        _with(
            by_order[5],
            5,
            block_type="image",
            content_ru={"image_url": system_ru.get("image_url", "/cases/wellness-app/system-flow.gif"), "alt": system_ru.get("image_alt", ""), "caption": ""},
            content_en={"image_url": system_en.get("image_url", "/cases/wellness-app/system-flow.gif"), "alt": system_en.get("image_alt", ""), "caption": ""},
            settings=_settings(spacing="compact", layout="default", image_bleed=False),
        ),
        _with(by_order[7], 6, content_ru=process_intro_ru, content_en=process_intro_en, settings=_settings(anchor="process")),
        _with(by_order[6], 7, content_ru=training_ru, content_en=training_en, settings=chapter_settings),
        _with(by_order[8], 8, settings=_settings(spacing="compact", layout="default", image_bleed=False)),
        _with(by_order[9], 9),
        _new("progression", "process", 10, progression_ru, progression_en, chapter_settings),
        _with(by_order[10], 11, block_type="process", content_ru=nutrition_ru, content_en=nutrition_en, settings=chapter_settings),
        _with(by_order[11], 12, settings=_settings(spacing="compact", layout="default", image_bleed=False)),
        _with(by_order[12], 13),
        _with(by_order[14], 14, content_ru=result_ru, content_en=result_en, settings=_settings(layout="statement", anchor="results")),
        _new(
            "approach",
            "text",
            15,
            {"kicker": "", "eyebrow": "Подход", "title": "Лёгкая клиентская архитектура с точечным серверным слоем.", "body": "Состояние остаётся на устройстве. Сервер подключается только для внешнего поиска продуктов.", "tags": []},
            {"kicker": "", "eyebrow": "Our approach", "title": "A lightweight client architecture with a focused server layer.", "body": "State stays on device. The server is introduced only for external product search.", "tags": []},
            _settings(anchor="approach"),
        ),
        _with(by_order[13], 16, content_ru=technology_ru, content_en=technology_en, settings={**dict(by_order[13]["settings"]), "desktop_span": 12}),
        _with(by_order[15], 17),
    ]
    return composition


def upgrade() -> None:
    connection = op.get_bind()
    projects, blocks, revisions = _tables()
    project = connection.execute(
        sa.select(projects.c.id, projects.c.draft_data, projects.c.published_data)
        .where(projects.c.slug == SLUG)
    ).mappings().one_or_none()
    if project is None:
        return

    rows = [
        dict(row)
        for row in connection.execute(
            sa.select(
                blocks.c.id,
                blocks.c.type,
                blocks.c.content_ru,
                blocks.c.content_en,
                blocks.c.settings,
                blocks.c.sort_order,
                blocks.c.is_visible,
            ).where(blocks.c.project_id == project["id"])
        ).mappings()
    ]
    composed = _compose(rows)
    connection.execute(blocks.delete().where(blocks.c.project_id == project["id"]))
    connection.execute(
        blocks.insert(),
        [{**block, "project_id": project["id"]} for block in composed],
    )

    now = datetime.utcnow()
    published = project["published_data"] or {}
    meta = dict(project["draft_data"] or published.get("meta") or {})
    snapshot = {
        "meta": meta,
        "blocks": [{**block, "id": str(block["id"])} for block in composed],
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
    connection = op.get_bind()
    projects, blocks, revisions = _tables()
    project = connection.execute(
        sa.select(projects.c.id, projects.c.draft_data, projects.c.published_data)
        .where(projects.c.slug == SLUG)
    ).mappings().one_or_none()
    if project is None:
        return

    expected = {
        0: "hero",
        1: "media_hero",
        2: "text",
        3: "metrics",
        4: "challenge_solution",
        5: "insight",
        6: "process",
        7: "text",
        8: "image",
        9: "gallery",
        10: "text",
        11: "image",
        12: "gallery",
        13: "technologies",
        14: "results",
        15: "next_case",
    }
    previous_snapshot: dict[str, object] | None = None
    snapshots = connection.execute(
        sa.select(revisions.c.snapshot)
        .where(revisions.c.project_id == project["id"])
        .order_by(revisions.c.version.desc())
    ).scalars().all()
    for candidate in snapshots:
        candidate_blocks = list((candidate or {}).get("blocks") or [])
        by_order = {int(block["sort_order"]): block for block in candidate_blocks}
        if len(candidate_blocks) == len(expected) and all(
            by_order.get(order, {}).get("type") == block_type
            for order, block_type in expected.items()
        ):
            previous_snapshot = dict(candidate)
            break

    if previous_snapshot is None:
        raise RuntimeError("The pre-composition WELLNESS APP revision could not be found")

    restored = []
    for block in previous_snapshot["blocks"]:
        restored.append(
            {
                "id": UUID(str(block["id"])),
                "project_id": project["id"],
                "type": block["type"],
                "content_ru": dict(block.get("content_ru") or {}),
                "content_en": dict(block.get("content_en") or {}),
                "settings": dict(block.get("settings") or {}),
                "sort_order": int(block["sort_order"]),
                "is_visible": bool(block.get("is_visible", True)),
            }
        )

    connection.execute(blocks.delete().where(blocks.c.project_id == project["id"]))
    connection.execute(blocks.insert(), restored)

    now = datetime.utcnow()
    meta = dict(
        previous_snapshot.get("meta")
        or project["draft_data"]
        or (project["published_data"] or {}).get("meta")
        or {}
    )
    restored_snapshot = {
        "meta": meta,
        "blocks": [
            {
                "id": str(block["id"]),
                "type": block["type"],
                "content_ru": block["content_ru"],
                "content_en": block["content_en"],
                "settings": block["settings"],
                "sort_order": block["sort_order"],
                "is_visible": block["is_visible"],
            }
            for block in restored
        ],
    }
    connection.execute(
        projects.update().where(projects.c.id == project["id"]).values(
            draft_data=meta,
            published_data=restored_snapshot,
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
            snapshot=restored_snapshot,
            created_at=now,
        )
    )
