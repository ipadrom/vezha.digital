"""Use the editorial air layout for two Zagorulko story sections.

Revision ID: y5n6o7p8q9r0
Revises: x4m5n6o7p8q9
"""

from copy import deepcopy
from datetime import datetime
from uuid import NAMESPACE_URL, uuid4, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "y5n6o7p8q9r0"
down_revision = "x4m5n6o7p8q9"
branch_labels = None
depends_on = None

SLUG = "gbu-process-automation"


def block_id(name):
    return str(uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/{SLUG}#story-v1-{name}"))


CREW_TASK_ID = block_id("crew-task")
FINANCE_RESULT_ID = block_id("finance-result")
REDUNDANT_FINANCE_MAP_ID = block_id("finance-system-map")

CREW_COPY = {
    "content_ru": {
        "title": (
            "Каждый день нужно заново собрать бригады из четырёх человек, "
            "когда в списке от 50 до 60 сотрудников и вчерашние составы "
            "подходят лишь частично."
        ),
        "challenge": (
            "При ручном распределении приходится вспоминать, кто с кем "
            "сработался и какие сочетания лучше не повторять, одновременно "
            "учитывая рост, комплекцию и внешние признаки сотрудников."
        ),
        "solution_label": "Программа сравнивает возможные составы",
        "solution": (
            "по сегодняшнему списку, карточкам сотрудников, заданным правилам "
            "и истории совместной работы, после чего предлагает бригады "
            "для проверки."
        ),
        "impact_label": "Окончательное решение остаётся у сотрудника,",
        "impact": (
            "который может перенести человека в другую бригаду и сохранить "
            "подтверждённые составы в историю для следующих расчётов."
        ),
    },
    "content_en": {
        "title": (
            "Every day, teams of four have to be assembled again from a list "
            "of 50 to 60 people because the previous lineups are only partly usable."
        ),
        "challenge": (
            "Doing this by hand means remembering who worked well together "
            "and which combinations should not be repeated, while also accounting "
            "for height, build and other relevant physical attributes."
        ),
        "solution_label": "The program compares possible lineups",
        "solution": (
            "against today's list, employee records, set rules and the history "
            "of previous work, then proposes teams for review."
        ),
        "impact_label": "The final decision stays with the person in charge,",
        "impact": (
            "who can move someone to another team and save the confirmed lineups "
            "to history for future calculations."
        ),
    },
}

FINANCE_COPY = {
    "content_ru": {
        "body": (
            "Сотрудник запускает расчёт из меню таблицы и получает показатели "
            "за полмесяца вместе с листом проверки, в котором видны учтённые "
            "заказы и расхождения."
        ),
        "items": [
            {
                "title": "Один расчётный период",
                "text": "Заказы из двух чатов MAX собраны за первую или вторую половину месяца.",
            },
            {
                "title": "Актуальные записи",
                "text": "Удалённые сообщения и старые версии заказов исключены из расчёта.",
            },
            {
                "title": "Спорные заказы отдельно",
                "text": (
                    "Записи без исходной заявки не попадают в начисления "
                    "и остаются на проверку."
                ),
            },
            {
                "title": "Ручные поля сохранены",
                "text": (
                    "Повторная выгрузка обновляет расчётные блоки, "
                    "не затрагивая поля за их пределами."
                ),
            },
        ],
    },
    "content_en": {
        "body": (
            "The employee starts the calculation from the spreadsheet menu "
            "and receives figures for half a month together with a review sheet "
            "that shows the orders included and any discrepancies."
        ),
        "items": [
            {
                "title": "One reporting period",
                "text": (
                    "Orders from the two MAX chats are collected for either half "
                    "of the month."
                ),
            },
            {
                "title": "Current records only",
                "text": (
                    "Deleted messages and superseded order versions are excluded "
                    "from the calculation."
                ),
            },
            {
                "title": "Disputed orders kept separate",
                "text": (
                    "Records with no source request are excluded from payments "
                    "and left for review."
                ),
            },
            {
                "title": "Manual fields preserved",
                "text": (
                    "A repeat export refreshes the calculation area without "
                    "changing fields outside it."
                ),
            },
        ],
    },
}


def transform_block(source):
    block = deepcopy(dict(source))
    identifier = str(block.get("id"))
    copy = None
    if identifier == CREW_TASK_ID:
        copy = CREW_COPY
    elif identifier == FINANCE_RESULT_ID:
        copy = FINANCE_COPY
    if copy is None:
        return block
    for language in ("content_ru", "content_en"):
        block[language] = {**deepcopy(block.get(language) or {}), **deepcopy(copy[language])}
    block["settings"] = {**deepcopy(block.get("settings") or {}), "layout": "air"}
    return block


def transform_blocks(source):
    return [
        transform_block(block)
        for block in source
        if str(block.get("id")) != REDUNDANT_FINANCE_MAP_ID
    ]


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
        if str(row["id"]) == REDUNDANT_FINANCE_MAP_ID:
            connection.execute(blocks.delete().where(blocks.c.id == row["id"]))
            continue
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
