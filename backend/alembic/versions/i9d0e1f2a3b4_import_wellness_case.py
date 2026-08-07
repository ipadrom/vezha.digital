"""Import the existing bilingual WELLNESS APP case into the block builder.

The import is intentionally data-only and safe to run during deployment. Existing
published builder content for the same slug always wins; an old legacy record with
the slug is upgraded in place.
"""

from collections.abc import Sequence
from datetime import datetime
from uuid import NAMESPACE_URL, UUID, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "i9d0e1f2a3b4"
down_revision: str = "h8c9d0e1f2a3"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SLUG = "wellness-app"


def _uuid(name: str) -> UUID:
    return uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/{SLUG}#{name}")


def _settings(
    *,
    theme: str = "paper",
    width: str = "wide",
    spacing: str = "normal",
    layout: str = "default",
    **extra: object,
) -> dict[str, object]:
    return {
        "theme": theme,
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


def _block(
    key: str,
    block_type: str,
    content_ru: dict[str, object],
    content_en: dict[str, object],
    settings: dict[str, object],
    order: int,
) -> dict[str, object]:
    return {
        "id": str(_uuid(f"block-{key}")),
        "type": block_type,
        "content_ru": content_ru,
        "content_en": content_en,
        "settings": settings,
        "sort_order": order,
        "is_visible": True,
    }


def _meta() -> dict[str, object]:
    return {
        "slug": SLUG,
        "name_ru": "WELLNESS APP",
        "name_en": "WELLNESS APP",
        "type_ru": "PRODUCT / PWA / VUE",
        "type_en": "PRODUCT / PWA / VUE",
        "description_ru": "Мобильный продукт объединяет тренировки, прогрессию нагрузки, питание, рецепты и КБЖУ.",
        "description_en": "A mobile product combining workouts, load progression, nutrition, recipes and macros.",
        "subtitle_ru": "От персонального трекера к единой системе тренировок и питания.",
        "subtitle_en": "From a personal tracker to one training and nutrition system.",
        "industry_ru": "Wellness",
        "industry_en": "Wellness",
        "year": "2026",
        "timeline_ru": "PWA → Vue-продукт",
        "timeline_en": "PWA → Vue product",
        "image_url": "/cases/wellness-app/hero-hand-device-v2.png",
        "cover_image_url": "/cases/wellness-app/hero-hand-device-v2.png",
        "project_url": "",
        "hero_metric_value": "3,2×",
        "hero_metric_label_ru": "демо: регулярность",
        "hero_metric_label_en": "demo: consistency",
        "is_featured": True,
        "sort_order": 0,
        "seo_title_ru": "WELLNESS APP — продуктовый кейс VEZHA Digital",
        "seo_title_en": "WELLNESS APP — product case by VEZHA Digital",
        "seo_description_ru": "Кейс о развитии wellness-продукта: тренировки, таймеры, питание, рецепты и дневные меню.",
        "seo_description_en": "A wellness product case covering workouts, timers, nutrition, recipes and daily menus.",
        "seo_image_url": "/cases/wellness-app/hero-hand-device-v2.png",
        "seo_noindex": True,
    }


def _blocks() -> list[dict[str, object]]:
    screens = "/cases/wellness-app"
    return [
        _block(
            "hero",
            "hero",
            {
                "eyebrow": "Кейс",
                "title": "WELLNESS APP",
                "subtitle": "От персонального трекера к единой системе тренировок и питания.",
                "type_label": "PRODUCT / PWA / VUE",
                "industry": "Wellness",
                "timeline": "PWA → Vue-продукт",
                "year": "2026",
                "image_url": f"{screens}/hero-hand-device-v2.png",
                "image_alt": "Wellness-приложение на экране телефона в руке",
                "device_screen_url": f"{screens}/screen-timer.png",
                "metric_value": "3,2×",
                "metric_label": "демо: регулярность",
            },
            {
                "eyebrow": "Case",
                "title": "WELLNESS APP",
                "subtitle": "From a personal tracker to one training and nutrition system.",
                "type_label": "PRODUCT / PWA / VUE",
                "industry": "Wellness",
                "timeline": "PWA → Vue product",
                "year": "2026",
                "image_url": f"{screens}/hero-hand-device-v2.png",
                "image_alt": "Wellness application shown on a phone held in hand",
                "device_screen_url": f"{screens}/screen-timer.png",
                "metric_value": "3.2×",
                "metric_label": "demo: consistency",
            },
            _settings(spacing="large"),
            0,
        ),
        _block(
            "metrics",
            "metrics",
            {
                "eyebrow": "01 / Показатели",
                "title": "Показатели продукта",
                "summary": "Пока продукт обезличен, цифры показывают формат будущего доказательного блока, а не подтверждённый результат. Демонстрационные KPI можно заменить в админке.",
                "items": [
                    {"value": "78%", "label": "завершённых тренировок", "context": "Демонстрационные данные", "is_demo": True},
                    {"value": "3,2×", "label": "регулярность занятий", "context": "Демонстрационные данные", "is_demo": True},
                    {"value": "−42%", "label": "времени на планирование", "context": "Демонстрационные данные", "is_demo": True},
                    {"value": "18 дней", "label": "активность в месяц", "context": "Демонстрационные данные", "is_demo": True},
                ],
            },
            {
                "eyebrow": "01 / Evidence",
                "title": "Product indicators",
                "summary": "While the product remains anonymous, the figures demonstrate the future evidence block rather than verified results. Demonstration KPIs can be replaced in the admin.",
                "items": [
                    {"value": "78%", "label": "workouts completed", "context": "Demonstration data", "is_demo": True},
                    {"value": "3.2×", "label": "training consistency", "context": "Demonstration data", "is_demo": True},
                    {"value": "−42%", "label": "planning time", "context": "Demonstration data", "is_demo": True},
                    {"value": "18 days", "label": "monthly activity", "context": "Demonstration data", "is_demo": True},
                ],
            },
            _settings(layout="grid", anchor="evidence"),
            1,
        ),
        _block(
            "evolution",
            "challenge_solution",
            {
                "eyebrow": "02 / Эволюция",
                "title": "Из личного инструмента — в цельный ежедневный продукт",
                "challenge_label": "До / компактная PWA",
                "challenge": "Трекер закрывал одну тренировку\n\n01  Линейный сценарий упражнений\n02  Разрозненные экраны прогресса\n03  Питание оставалось вне продукта",
                "solution_label": "После / Vue-продукт",
                "solution": "Одна система связывает действие и привычку\n\n01  Тренировка, таймеры и прогрессия\n02  Рецепты, порции и КБЖУ\n03  Дневные меню в общем мобильном ритме",
            },
            {
                "eyebrow": "02 / Evolution",
                "title": "From a personal tool to one coherent daily product",
                "challenge_label": "Before / compact PWA",
                "challenge": "A tracker handled one workout\n\n01  A linear exercise flow\n02  Separate progress screens\n03  Nutrition lived outside the product",
                "solution_label": "After / Vue product",
                "solution": "One system connects action and habit\n\n01  Workouts, timers and progression\n02  Recipes, servings and macros\n03  Daily menus in one mobile rhythm",
            },
            _settings(theme="soft", spacing="large", anchor="story"),
            2,
        ),
        _block(
            "workout-copy",
            "text",
            {
                "eyebrow": "03 / Продуктовый модуль",
                "title": "Тренировка ведёт пользователя, а не требует контроля",
                "body": "Сценарий удерживает фокус на текущем действии: показывает порядок блоков, регулирует отдых и сохраняет рабочую нагрузку.\n\n• Пошаговая программа с отдельными типами нагрузки\n• Полноэкранный таймер со звуком и вибрацией\n• Прогрессия повторений и веса без таблиц",
            },
            {
                "eyebrow": "03 / Product module",
                "title": "The workout guides the user instead of asking for supervision",
                "body": "The flow keeps attention on the current action: it exposes the sequence, manages rest and preserves working load.\n\n• Step-by-step program across load types\n• Full-screen timer with sound and vibration\n• Rep and weight progression without spreadsheets",
            },
            _settings(spacing="large"),
            3,
        ),
        _block(
            "workout-screens",
            "gallery",
            {
                "eyebrow": "03 / Экраны",
                "title": "Тренировочный сценарий",
                "items": [
                    {"image_url": f"{screens}/screen-workout-home.png", "alt": "Главный экран тренировки с программой упражнений", "caption": "01 / Программа дня"},
                    {"image_url": f"{screens}/screen-progression.png", "alt": "Экран прогрессии нагрузки и веса", "caption": "02 / Прогрессия"},
                    {"image_url": f"{screens}/screen-timer.png", "alt": "Полноэкранный таймер отдыха", "caption": "03 / Контекстный таймер"},
                ],
            },
            {
                "eyebrow": "03 / Screens",
                "title": "Workout flow",
                "items": [
                    {"image_url": f"{screens}/screen-workout-home.png", "alt": "Workout home with the exercise program", "caption": "01 / Daily program"},
                    {"image_url": f"{screens}/screen-progression.png", "alt": "Load and weight progression screen", "caption": "02 / Progression"},
                    {"image_url": f"{screens}/screen-timer.png", "alt": "Full-screen rest timer", "caption": "03 / Contextual timer"},
                ],
            },
            _settings(theme="ink", width="full", spacing="compact", layout="phones"),
            4,
        ),
        _block(
            "food-copy",
            "text",
            {
                "eyebrow": "04 / Продуктовый модуль",
                "title": "Питание превращено из заметок в рабочую систему",
                "body": "Библиотека рецептов, расчёт порций и дневные меню работают как продолжение тренировочного сценария.\n\n• Рецепты сгруппированы по роли в рационе\n• КБЖУ рассчитывается на порцию\n• Меню собирает блюда и итог дня в одном экране",
            },
            {
                "eyebrow": "04 / Product module",
                "title": "Nutrition moves from notes into a working system",
                "body": "The recipe library, serving calculations and daily menus act as a continuation of the workout flow.\n\n• Recipes grouped by their role in the diet\n• Macros calculated per serving\n• Menus combine dishes and daily totals in one view",
            },
            _settings(spacing="large"),
            5,
        ),
        _block(
            "food-screens",
            "gallery",
            {
                "eyebrow": "04 / Экраны",
                "title": "Питание в ежедневном ритме",
                "items": [
                    {"image_url": f"{screens}/screen-food-home.png", "alt": "Библиотека рецептов с категориями и КБЖУ", "caption": "01 / Библиотека"},
                    {"image_url": f"{screens}/screen-recipe.png", "alt": "Страница рецепта с пищевой ценностью", "caption": "02 / Рецепт и порции"},
                    {"image_url": f"{screens}/screen-daily-menu.png", "alt": "Дневное меню с итоговыми КБЖУ", "caption": "03 / Рацион на день"},
                ],
            },
            {
                "eyebrow": "04 / Screens",
                "title": "Nutrition in the daily rhythm",
                "items": [
                    {"image_url": f"{screens}/screen-food-home.png", "alt": "Recipe library with categories and macros", "caption": "01 / Library"},
                    {"image_url": f"{screens}/screen-recipe.png", "alt": "Recipe page with nutrition values", "caption": "02 / Recipe and servings"},
                    {"image_url": f"{screens}/screen-daily-menu.png", "alt": "Daily menu with macro totals", "caption": "03 / Daily plan"},
                ],
            },
            _settings(theme="ink", width="full", spacing="compact", layout="phones"),
            6,
        ),
        _block(
            "technical-copy",
            "text",
            {
                "eyebrow": "05 / Технический контур",
                "title": "Local-first основа и возможности устройства",
                "body": "Vue 3 отвечает за цельный интерфейс, локальное хранение — за быстрый ежедневный доступ, а системные API поддерживают таймеры даже в активной тренировке.",
            },
            {
                "eyebrow": "05 / Technical dossier",
                "title": "A local-first core with device capabilities",
                "body": "Vue 3 provides the unified interface, local storage keeps daily access immediate, and device APIs support active workout timers.",
            },
            _settings(theme="ink", spacing="large", anchor="technical"),
            7,
        ),
        _block(
            "technologies",
            "technologies",
            {
                "eyebrow": "Техническая карта",
                "title": "PRODUCT / PWA / VUE",
                "summary": "",
                "items": [
                    {"label": "Vue 3 + Vite", "category": "CLIENT", "x": 18, "y": 20},
                    {"label": "PWA / Local-first", "category": "CLIENT", "x": 30, "y": 78},
                    {"label": "Sound + Vibration", "category": "DEVICE", "x": 82, "y": 20},
                    {"label": "Wake Lock", "category": "DEVICE", "x": 70, "y": 78},
                    {"label": "Open Food Facts", "category": "DATA", "x": 25, "y": 48},
                    {"label": "Docker", "category": "DELIVERY", "x": 78, "y": 48},
                ],
            },
            {
                "eyebrow": "Technical map",
                "title": "PRODUCT / PWA / VUE",
                "summary": "",
                "items": [
                    {"label": "Vue 3 + Vite", "category": "CLIENT", "x": 18, "y": 20},
                    {"label": "PWA / Local-first", "category": "CLIENT", "x": 30, "y": 78},
                    {"label": "Sound + Vibration", "category": "DEVICE", "x": 82, "y": 20},
                    {"label": "Wake Lock", "category": "DEVICE", "x": 70, "y": 78},
                    {"label": "Open Food Facts", "category": "DATA", "x": 25, "y": 48},
                    {"label": "Docker", "category": "DELIVERY", "x": 78, "y": 48},
                ],
            },
            _settings(
                theme="ink",
                width="full",
                spacing="compact",
                layout="map",
                map_accent="#806eff",
                map_background="#121419",
                map_text="#f4f6fa",
            ),
            8,
        ),
        _block(
            "result",
            "results",
            {
                "eyebrow": "06 / Итог",
                "title": "Не набор функций, а один ритм заботы о себе",
                "body": "Эволюция продукта построена вокруг повторяемого дня: спланировать, выполнить, восстановиться и увидеть прогресс — без переключения между сервисами.",
                "link_url": "",
                "link_label": "",
            },
            {
                "eyebrow": "06 / Outcome",
                "title": "Not a feature set, but one rhythm of self-care",
                "body": "The product evolution follows a repeatable day: plan, perform, recover and see progress without switching between services.",
                "link_url": "",
                "link_label": "",
            },
            _settings(theme="signal", spacing="large"),
            9,
        ),
        _block(
            "next",
            "next_case",
            {"eyebrow": "Дальше", "title": "Другие проекты", "case_slug": "", "cta_label": "К списку кейсов"},
            {"eyebrow": "Next", "title": "More projects", "case_slug": "", "cta_label": "All cases"},
            _settings(spacing="large"),
            10,
        ),
    ]


def upgrade() -> None:
    connection = op.get_bind()
    now = datetime.utcnow()
    meta = _meta()
    blocks = _blocks()
    snapshot = {"meta": meta, "blocks": blocks}

    projects = sa.table(
        "projects",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("slug", sa.String()),
        sa.column("type_ru", sa.String()),
        sa.column("type_en", sa.String()),
        sa.column("name_ru", sa.String()),
        sa.column("name_en", sa.String()),
        sa.column("description_ru", sa.Text()),
        sa.column("description_en", sa.Text()),
        sa.column("subtitle_ru", sa.String()),
        sa.column("subtitle_en", sa.String()),
        sa.column("industry_ru", sa.String()),
        sa.column("industry_en", sa.String()),
        sa.column("year", sa.String()),
        sa.column("timeline_ru", sa.String()),
        sa.column("timeline_en", sa.String()),
        sa.column("image_url", sa.String()),
        sa.column("cover_image_url", sa.String()),
        sa.column("hero_metric_value", sa.String()),
        sa.column("hero_metric_label_ru", sa.String()),
        sa.column("hero_metric_label_en", sa.String()),
        sa.column("sort_order", sa.Integer()),
        sa.column("is_active", sa.Boolean()),
        sa.column("is_featured", sa.Boolean()),
        sa.column("status", sa.String()),
        sa.column("draft_data", postgresql.JSONB()),
        sa.column("published_data", postgresql.JSONB()),
        sa.column("published_at", sa.DateTime()),
        sa.column("created_at", sa.DateTime()),
        sa.column("updated_at", sa.DateTime()),
    )
    project_blocks = sa.table(
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

    existing = connection.execute(
        sa.select(projects.c.id, projects.c.published_data).where(projects.c.slug == SLUG)
    ).mappings().first()
    imported_project_id = _uuid("project")
    if (
        existing
        and existing["published_data"]
        and existing["id"] != imported_project_id
    ):
        return

    project_id = existing["id"] if existing else imported_project_id
    project_values = {
        "slug": SLUG,
        "type_ru": meta["type_ru"],
        "type_en": meta["type_en"],
        "name_ru": meta["name_ru"],
        "name_en": meta["name_en"],
        "description_ru": meta["description_ru"],
        "description_en": meta["description_en"],
        "subtitle_ru": meta["subtitle_ru"],
        "subtitle_en": meta["subtitle_en"],
        "industry_ru": meta["industry_ru"],
        "industry_en": meta["industry_en"],
        "year": meta["year"],
        "timeline_ru": meta["timeline_ru"],
        "timeline_en": meta["timeline_en"],
        "image_url": meta["image_url"],
        "cover_image_url": meta["cover_image_url"],
        "hero_metric_value": meta["hero_metric_value"],
        "hero_metric_label_ru": meta["hero_metric_label_ru"],
        "hero_metric_label_en": meta["hero_metric_label_en"],
        "sort_order": meta["sort_order"],
        "is_active": True,
        "is_featured": True,
        "status": "published",
        "draft_data": meta,
        "published_data": snapshot,
        "published_at": now,
        "updated_at": now,
    }
    if existing:
        connection.execute(
            projects.update().where(projects.c.id == project_id).values(**project_values)
        )
        connection.execute(
            project_blocks.delete().where(project_blocks.c.project_id == project_id)
        )
    else:
        connection.execute(
            projects.insert().values(id=project_id, created_at=now, **project_values)
        )

    connection.execute(
        project_blocks.insert(),
        [
            {
                "id": UUID(str(block["id"])),
                "project_id": project_id,
                "type": block["type"],
                "content_ru": block["content_ru"],
                "content_en": block["content_en"],
                "settings": block["settings"],
                "sort_order": block["sort_order"],
                "is_visible": block["is_visible"],
            }
            for block in blocks
        ],
    )
    has_revision = connection.execute(
        sa.select(revisions.c.id).where(revisions.c.project_id == project_id).limit(1)
    ).scalar_one_or_none()
    if not has_revision:
        connection.execute(
            revisions.insert().values(
                id=_uuid("revision-1"),
                project_id=project_id,
                version=1,
                snapshot=snapshot,
                created_at=now,
            )
        )


def downgrade() -> None:
    # Published case content is user data. A downgrade must not delete it after an
    # editor may have changed it; the preceding schema downgrade keeps legacy fields.
    pass
