"""Use the editorial air layout for the first and third tasks.

Revision ID: z6o7p8q9r0s1
Revises: y5n6o7p8q9r0
"""

from copy import deepcopy
from datetime import datetime
from uuid import NAMESPACE_URL, uuid4, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "z6o7p8q9r0s1"
down_revision = "y5n6o7p8q9r0"
branch_labels = None
depends_on = None

SLUG = "gbu-process-automation"


def block_id(name):
    return str(uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/{SLUG}#story-v1-{name}"))


TASK_ONE_ID = block_id("task-one")
TASK_THREE_ID = block_id("task-three")

TASK_COPY = {
    TASK_ONE_ID: {
        "content_ru": {
            "title": (
                "Вечером сотрудник получает фотографию или PDF с заказами "
                "на следующий день и готовит по каждому из них отдельное "
                "сообщение в MAX."
            ),
            "challenge": (
                "В одной таблице могут быть сразу несколько заказов со своим "
                "временем, маршрутом и количеством людей. Раньше сотрудник "
                "увеличивал изображение, читал очередную строку, переключался "
                "в MAX и набирал сообщение вручную, а затем возвращался "
                "к таблице и повторял всё для следующего заказа."
            ),
            "solution_label": "Приложение распознаёт таблицу",
            "solution": (
                "с помощью Yandex Vision OCR, восстанавливает строки "
                "по координатам фрагментов и собирает из них отдельные заказы "
                "с редактируемыми полями."
            ),
            "impact_label": "Перед отправкой результат можно проверить,",
            "impact": (
                "после чего готовые сообщения попадают в «Избранное» MAX, "
                "где сотрудник вписывает назначенных людей и пересылает задания "
                "участникам выезда."
            ),
        },
        "content_en": {
            "title": (
                "In the evening, staff receive a photo or PDF with the next "
                "day's orders and prepare a separate MAX message for each one."
            ),
            "challenge": (
                "One table can contain several orders, each with its own time, "
                "route and crew size. Staff previously enlarged the image, read "
                "one row, switched to MAX and typed the message by hand before "
                "returning to the table and repeating the process."
            ),
            "solution_label": "The application reads the table",
            "solution": (
                "with Yandex Vision OCR, reconstructs its rows from fragment "
                "coordinates and turns them into separate editable orders."
            ),
            "impact_label": "The result can be checked before it is sent,",
            "impact": (
                "after which the prepared messages arrive in MAX Saved Messages, "
                "where staff add the assigned people and forward each task "
                "to the relevant crew."
            ),
        },
    },
    TASK_THREE_ID: {
        "content_ru": {
            "title": (
                "Раз в две недели те же сообщения нужны для расчёта финансовых "
                "показателей, поэтому сотруднику приходилось заново разбирать "
                "историю двух чатов MAX."
            ),
            "challenge": (
                "Заказы могли измениться или исчезнуть из переписки, "
                "а заполненные сообщения нужно было сопоставить с исходными "
                "заявками, определить актуальные версии и только после этого "
                "разнести начисления по людям."
            ),
            "solution_label": "Расчёт запускается прямо из Google Таблиц",
            "solution": (
                "где Google Apps Script через GREEN-API загружает обе истории "
                "MAX, сверяет заказы и заполняет листы за выбранную половину месяца."
            ),
            "impact_label": "Расхождения остаются видимыми,",
            "impact": (
                "поэтому сотрудник проверяет только спорные записи, например "
                "заполненный заказ без исходной заявки, а не пересчитывает всю "
                "переписку вручную."
            ),
        },
        "content_en": {
            "title": (
                "Every two weeks the same messages are needed for financial "
                "calculations, which previously meant reviewing the history "
                "of two MAX chats again."
            ),
            "challenge": (
                "Orders could change or disappear from the conversation, while "
                "completed messages had to be matched with the original requests "
                "and the current version identified before payments could be "
                "assigned to each person."
            ),
            "solution_label": "The calculation starts inside Google Sheets",
            "solution": (
                "where Google Apps Script uses GREEN-API to load both MAX histories, "
                "reconcile the orders and populate the sheets for the selected "
                "half of the month."
            ),
            "impact_label": "Discrepancies remain visible,",
            "impact": (
                "so staff review only the records that need attention, such as "
                "a completed order with no original request, instead of recounting "
                "the entire conversation by hand."
            ),
        },
    },
}


def transform_block(source):
    block = deepcopy(dict(source))
    copy = TASK_COPY.get(str(block.get("id")))
    if copy is None:
        return block
    for language in ("content_ru", "content_en"):
        block[language] = {
            **deepcopy(block.get(language) or {}),
            **deepcopy(copy[language]),
        }
    block["settings"] = {**deepcopy(block.get("settings") or {}), "layout": "air"}
    return block


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
    updated = {
        **published,
        "blocks": [transform_block(block) for block in published.get("blocks", [])],
    }
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
