"""Add grouped, interactive stacks to the Zagorulko case without replacing its story.

Revision ID: x4m5n6o7p8q9
Revises: w3l4m5n6o7p8
"""

from copy import deepcopy
from datetime import datetime
from uuid import NAMESPACE_URL, uuid4, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "x4m5n6o7p8q9"
down_revision = "w3l4m5n6o7p8"
branch_labels = None
depends_on = None
SLUG = "gbu-process-automation"


def block_id(name):
    return str(uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/{SLUG}#story-v1-{name}"))


def node(label, group, icon, role, description, related=()):
    """Bilingual editorial data; IDs and relations are independent of visible labels."""
    return dict(
        label=label, group=group, icon=icon, role=role, description=description, related=related
    )


LAUNCH = {
    "docker": node(
        ("Docker", "Docker"),
        ("Запуск", "Runtime"),
        "docker",
        ("Окружение", "Environment"),
        (
            "Упаковывает приложение и его зависимости в контейнер, чтобы при запуске на сервере использовалось то же окружение, в котором мы проверяли работу программы.",
            "Packages the application and its dependencies into a container so the server uses the same environment in which the tool was tested.",
        ),
        ("gunicorn",),
    ),
    "gunicorn": node(
        ("Gunicorn", "Gunicorn"),
        ("Запуск", "Runtime"),
        "gunicorn",
        ("Веб-сервер", "Web server"),
        (
            "Принимает веб-запросы и передаёт их приложению Flask, которое выполняет обработку и возвращает результат в браузер. Запускается внутри контейнера Docker.",
            "Accepts web requests and passes them to Flask, which processes them and returns the result to the browser. Runs inside the Docker container.",
        ),
        ("flask", "docker"),
    ),
}

SPECS = {
    "stack": {
        "flask": node(
            ("Flask", "Flask"),
            ("Приложение", "Application"),
            "flask",
            ("Веб-приложение", "Web application"),
            (
                "Связывает загрузку фотографии, запуск распознавания и экран проверки заказов, через который сотрудник просматривает результат перед передачей в MAX.",
                "Connects photo upload, recognition and the order review screen, where a staff member checks the result before sending it to MAX.",
            ),
            ("python", "interface", "gunicorn"),
        ),
        "python": node(
            ("Python", "Python"),
            ("Приложение", "Application"),
            "python",
            ("Обработка заказов", "Order processing"),
            (
                "Собирает распознанные фрагменты в отдельные заказы с временем, маршрутом и количеством людей, после чего готовит текст сообщений для проверки сотрудником.",
                "Assembles recognized fragments into orders with time, route and crew size, then prepares message text for a staff member to review.",
            ),
            ("ocr", "pillow", "flask"),
        ),
        "pillow": node(
            ("Pillow", "Pillow"),
            ("Приложение", "Application"),
            "image",
            ("Подготовка снимка", "Image preparation"),
            (
                "Помогает подготовить загруженную фотографию к обработке, чтобы приложение работало с изображением нужного формата до обращения к сервису распознавания.",
                "Prepares the uploaded photo for processing so the application has an image in the required format before calling the recognition service.",
            ),
            ("python", "ocr"),
        ),
        "ocr": node(
            ("Yandex Vision OCR", "Yandex Vision OCR"),
            ("Внешние сервисы", "External services"),
            "scan-text",
            ("Распознавание", "Recognition"),
            (
                "Читает текст на фотографии и возвращает координаты распознанных фрагментов, по которым наша программа восстанавливает строки таблицы и разделяет заказы.",
                "Reads text in the photo and returns fragment coordinates, which our program uses to reconstruct table rows and separate the orders.",
            ),
            ("python", "pillow"),
        ),
        "green": node(
            ("GREEN-API", "GREEN-API"),
            ("Внешние сервисы", "External services"),
            "plug",
            ("Передача в MAX", "MAX integration"),
            (
                "Передаёт подготовленные сообщения в MAX после проверки в приложении, поэтому сотруднику остаётся вписать назначенных людей и переслать им нужные заказы.",
                "Sends prepared messages to MAX after the in-app review, leaving staff to add the assigned people and forward the relevant orders.",
            ),
            ("python", "flask"),
        ),
        "storage": node(
            ("Object Storage", "Object Storage"),
            ("Внешние сервисы", "External services"),
            "cloud",
            ("Хранение данных", "Data storage"),
            (
                "Используется для хранения и синхронизации рабочих данных приложения отдельно от контейнера, в котором выполняется обработка заказов.",
                "Stores and synchronizes application data separately from the container that processes the orders.",
            ),
            ("python", "docker"),
        ),
        "interface": node(
            ("HTML / CSS / JavaScript", "HTML / CSS / JavaScript"),
            ("Интерфейс", "Interface"),
            "monitor",
            ("Экран сотрудника", "Staff workspace"),
            (
                "В браузере сотрудник загружает фотографию, открывает распознанные заказы и исправляет спорные поля, прежде чем разрешить отправку подготовленных сообщений.",
                "Staff upload a photo in the browser, open the recognized orders and correct uncertain fields before allowing the prepared messages to be sent.",
            ),
            ("flask", "green"),
        ),
        **LAUNCH,
    },
    "crew-stack": {
        "python": node(
            ("Python", "Python"),
            ("Приложение", "Application"),
            "python",
            ("Подбор составов", "Crew assignment"),
            (
                "Сравнивает возможные составы с учётом карточек сотрудников, заданных правил и истории совместной работы, чтобы предложить бригады для сегодняшнего списка.",
                "Compares candidate crews against employee profiles, configured rules and shared work history to propose groups for today's roster.",
            ),
            ("history", "flask"),
        ),
        "flask": node(
            ("Flask", "Flask"),
            ("Приложение", "Application"),
            "flask",
            ("API приложения", "Application API"),
            (
                "Принимает список и параметры расчёта из интерфейса, запускает подбор и возвращает составы для проверки, а затем принимает подтверждённый результат.",
                "Accepts the roster and calculation settings, starts assignment and returns the proposed crews for review, then accepts the confirmed result.",
            ),
            ("python", "interface", "gunicorn"),
        ),
        "history": node(
            ("JSON history", "JSON history"),
            ("Данные", "Data"),
            "file-json",
            ("История составов", "Crew history"),
            (
                "Хранит подтверждённые составы в структурированном виде, чтобы при следующем подборе программа могла учитывать, кто уже работал вместе и как часто повторялись сочетания.",
                "Keeps confirmed crews in a structured format so subsequent assignments can account for who has worked together and how often combinations recur.",
            ),
            ("python", "storage"),
        ),
        "storage": node(
            ("Object Storage", "Object Storage"),
            ("Данные", "Data"),
            "cloud",
            ("Синхронизация", "Synchronization"),
            (
                "Помогает сохранять и синхронизировать рабочие данные и историю подтверждённых составов независимо от запуска самого приложения.",
                "Persists and synchronizes working data and confirmed crew history independently of the application runtime.",
            ),
            ("history", "python"),
        ),
        "interface": node(
            ("HTML / CSS / JavaScript", "HTML / CSS / JavaScript"),
            ("Интерфейс", "Interface"),
            "monitor",
            ("Работа с бригадами", "Crew workspace"),
            (
                "Показывает предложенные бригады и спорные назначения, позволяет пересчитать расклад или вручную перенести сотрудника в другой состав перед сохранением.",
                "Shows proposed crews and uncertain assignments, allowing staff to recalculate or manually move a person to another crew before saving.",
            ),
            ("flask", "python"),
        ),
        **LAUNCH,
    },
    "finance-system-map": {
        "max": node(
            ("MAX", "MAX"),
            ("Источники", "Sources"),
            "message-circle",
            ("Заказы в мессенджере", "Orders in messenger"),
            (
                "Сотрудники продолжают работать с заказами в привычных чатах, а скрипт получает сообщения за выбранный период, чтобы не переносить их в таблицу вручную.",
                "Staff continue handling orders in their usual chats while the script retrieves messages for the selected period, avoiding manual copying into the spreadsheet.",
            ),
            ("chats", "green"),
        ),
        "chats": node(
            ("Два чата", "Two chats"),
            ("Источники", "Sources"),
            "messages-square",
            ("Исходные и заполненные", "Original and completed"),
            (
                "История исходных заказов сопоставляется с заполненными сообщениями из второго чата, благодаря чему расчёт можно проверить по двум источникам.",
                "Original order history is compared with completed messages from the second chat so the calculation can be checked against both sources.",
            ),
            ("max", "reconcile"),
        ),
        "green": node(
            ("GREEN-API", "GREEN-API"),
            ("Загрузка и разбор", "Import and parsing"),
            "plug",
            ("История MAX", "MAX history"),
            (
                "Загружает сообщения из нужных чатов за указанный период и передаёт их скрипту, который извлекает сведения о заказах для последующей сверки.",
                "Retrieves messages from the relevant chats for the selected period and passes them to the script for order extraction and reconciliation.",
            ),
            ("max", "parser"),
        ),
        "parser": node(
            ("Парсер сообщений", "Message parser"),
            ("Загрузка и разбор", "Import and parsing"),
            "file-code",
            ("Структура заказа", "Order structure"),
            (
                "Извлекает данные из текста сообщений и приводит их к единому виду, чтобы одни и те же заказы можно было сопоставить независимо от оформления в чате.",
                "Extracts data from message text and normalizes it so matching orders can be compared despite formatting differences between messages.",
            ),
            ("green", "reconcile"),
        ),
        "reconcile": node(
            ("Контроль + факт", "Control + actual"),
            ("Сверка и расчёт", "Checks and calculations"),
            "list-checks",
            ("Проверка совпадений", "Matching records"),
            (
                "Сопоставляет исходные заказы с заполненными, отделяя совпавшие записи от расхождений, которые сотруднику нужно проверить до окончательного расчёта.",
                "Matches original orders with completed records, separating matches from discrepancies that staff need to review before finalizing the calculation.",
            ),
            ("chats", "parser", "accruals"),
        ),
        "accruals": node(
            ("Начисления", "Accruals"),
            ("Сверка и расчёт", "Checks and calculations"),
            "calculator",
            ("Финансовые показатели", "Financial figures"),
            (
                "Использует разобранные и сверенные записи для расчёта показателей за период, сохраняя связь результата с заказами, по которым он был получен.",
                "Uses parsed and reconciled records to calculate figures for the period while retaining their connection to the underlying orders.",
            ),
            ("reconcile", "sheets"),
        ),
        "sheets": node(
            ("Google Sheets", "Google Sheets"),
            ("Результат", "Output"),
            "googlesheets",
            ("Готовая выгрузка", "Completed export"),
            (
                "Сотрудник получает заполненные листы с расчётом и отдельно видит расхождения, чтобы проверять конкретные записи вместо повторного подсчёта всей истории чатов.",
                "Staff receive populated calculation sheets with discrepancies shown separately, allowing them to review specific records instead of recounting the entire chat history.",
            ),
            ("accruals", "reconcile"),
        ),
    },
    "finance-stack": {
        "apps-script": node(
            ("Google Apps Script", "Google Apps Script"),
            ("Приложение", "Application"),
            "googleappsscript",
            ("Запуск из таблицы", "Spreadsheet runtime"),
            (
                "Выполняет загрузку сообщений, сверку и запись результатов внутри Google Таблиц, поэтому для подготовки расчёта не нужно открывать отдельное приложение.",
                "Runs message import, reconciliation and result writing within Google Sheets, without requiring staff to open a separate application.",
            ),
            ("javascript", "sheets", "green"),
        ),
        "javascript": node(
            ("JavaScript", "JavaScript"),
            ("Приложение", "Application"),
            "javascript",
            ("Парсинг и расчёты", "Parsing and calculations"),
            (
                "Описывает правила разбора сообщений, сопоставления заказов и расчёта показателей, которые мы проверяем отдельно от доступа к рабочим чатам.",
                "Implements message parsing, order matching and calculation rules, which are tested independently of access to working chats.",
            ),
            ("apps-script", "tests"),
        ),
        "green": node(
            ("GREEN-API", "GREEN-API"),
            ("Внешние сервисы", "External services"),
            "plug",
            ("История MAX", "MAX history"),
            (
                "Соединяет скрипт с мессенджером и отдаёт историю сообщений, из которой программа собирает заказы для выбранного расчётного периода.",
                "Connects the script to the messenger and provides the message history used to assemble orders for the selected reporting period.",
            ),
            ("apps-script", "properties"),
        ),
        "sheets": node(
            ("Google Sheets", "Google Sheets"),
            ("Интерфейс", "Interface"),
            "googlesheets",
            ("Рабочие листы", "Worksheets"),
            (
                "Остаётся привычным рабочим местом для запуска выгрузки, просмотра рассчитанных показателей и проверки записей, по которым источники не совпали.",
                "Remains the familiar workspace for starting an export, viewing calculated figures and checking records where the sources disagree.",
            ),
            ("apps-script", "lock"),
        ),
        "properties": node(
            ("Script Properties", "Script Properties"),
            ("Контроль и настройки", "Controls and settings"),
            "key-round",
            ("Параметры подключения", "Connection settings"),
            (
                "Хранит настройки подключения отдельно от содержимого расчётных листов, чтобы скрипт мог обращаться к нужной интеграции без ручного ввода параметров при каждом запуске.",
                "Keeps connection settings separate from calculation cells so the script can access the configured integration without re-entering parameters on every run.",
            ),
            ("green", "apps-script"),
        ),
        "lock": node(
            ("Document Lock", "Document Lock"),
            ("Контроль и настройки", "Controls and settings"),
            "lock-keyhole",
            ("Защита от наложений", "Concurrent run protection"),
            (
                "Не даёт нескольким запускам одновременно изменять одну таблицу, чтобы повторное нажатие на выгрузку не приводило к наложению операций записи.",
                "Prevents multiple runs from modifying the spreadsheet concurrently so repeated export requests do not overlap their write operations.",
            ),
            ("apps-script", "sheets"),
        ),
        "tests": node(
            ("Node.js tests", "Node.js tests"),
            ("Контроль и настройки", "Controls and settings"),
            "nodedotjs",
            ("Проверка логики", "Logic tests"),
            (
                "Проверяют парсинг и расчёты на вымышленных сообщениях, позволяя находить ошибки в правилах обработки без выгрузки реальной переписки.",
                "Check parsing and calculations against fictional messages so errors in processing rules can be found without retrieving real conversations.",
            ),
            ("javascript",),
        ),
    },
}

TARGETS = {block_id(name): spec for name, spec in SPECS.items()}


def enrich_content(source, spec, locale):
    content = deepcopy(source or {})
    original = content.get("items", [])
    by_label = {item.get("label"): item for item in original}
    result = []
    consumed = set()
    for key, config in spec.items():
        labels = config["label"]
        candidates = (*labels, "Docker / Gunicorn") if key == "docker" else labels
        match = next((label for label in candidates if label in by_label), None)
        # Only Gunicorn may be added as the second half of the existing runtime node.
        if match is None and not (key == "gunicorn" and "Docker / Gunicorn" in by_label):
            continue
        item = deepcopy(by_label[match]) if match else {}
        if match:
            consumed.add(match)
        item.update(
            id=item.get("id") or key,
            label=labels[locale]
            if match == "Docker / Gunicorn" or match is None
            else item["label"],
            group=item.get("group") or config["group"][locale],
            icon=item.get("icon") or config["icon"],
            description=item.get("description") or config["description"][locale],
            category=config["role"][locale],
            related_ids=item.get("related_ids") or list(config["related"]),
        )
        result.append(item)
    # Preserve any manually added nodes instead of silently removing them.
    result.extend(deepcopy(item) for item in original if item.get("label") not in consumed)
    content["items"] = result
    return content


def enrich_block(source):
    block = deepcopy(dict(source))
    spec = TARGETS.get(str(block.get("id")))
    if block.get("type") != "technologies" or not spec:
        return block
    for index, key in enumerate(("content_ru", "content_en")):
        block[key] = enrich_content(block.get(key), spec, index)
    block["settings"] = {**block.get("settings", {}), "layout": "contours"}
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
        "blocks": [enrich_block(block) for block in published.get("blocks", [])],
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
    # Keep both current states recoverable; draft edits are never published implicitly.
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
        changed = enrich_block(row)
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
    # Editorial revisions can be restored explicitly from the case studio.
    pass
