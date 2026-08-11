"""Refresh WELLNESS APP with the current card-based case presentation."""

from collections.abc import Sequence
from datetime import datetime
from uuid import NAMESPACE_URL, UUID, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "k1f2a3b4c5d6"
down_revision: str = "j0e1f2a3b4c5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SLUG = "wellness-app"
ROOT = "/cases/wellness-app"


def _uuid(name: str) -> UUID:
    return uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/{SLUG}#refresh-{name}")


def _settings(
    theme: str = "paper",
    *,
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
    ru: dict[str, object],
    en: dict[str, object],
    order: int,
    settings: dict[str, object] | None = None,
) -> dict[str, object]:
    return {
        "id": str(_uuid(f"block-{key}")),
        "type": block_type,
        "content_ru": ru,
        "content_en": en,
        "settings": settings or _settings(),
        "sort_order": order,
        "is_visible": True,
    }


def _meta() -> dict[str, object]:
    return {
        "slug": SLUG,
        "name_ru": "WELLNESS APP",
        "name_en": "WELLNESS APP",
        "type_ru": "PRODUCT DESIGN / FRONTEND",
        "type_en": "PRODUCT DESIGN / FRONTEND",
        "description_ru": "Единый мобильный ритм для тренировок, прогрессии, рецептов и дневного питания.",
        "description_en": "One mobile rhythm for workouts, progression, recipes and daily nutrition.",
        "subtitle_ru": "Тренировка, прогресс и питание работают как одна система.",
        "subtitle_en": "Workouts, progress and nutrition work as one system.",
        "industry_ru": "Wellness & Sports",
        "industry_en": "Wellness & Sports",
        "year": "2026",
        "timeline_ru": "PWA → Vue 3",
        "timeline_en": "PWA → Vue 3",
        "image_url": f"{ROOT}/hero-hand-device-v2.png",
        "cover_image_url": f"{ROOT}/hero-hand-device-v2.png",
        "project_url": "",
        "hero_metric_value": "2×1",
        "hero_metric_label_ru": "тренировки + питание",
        "hero_metric_label_en": "workouts + nutrition",
        "is_featured": True,
        "sort_order": 0,
        "seo_title_ru": "WELLNESS APP — продуктовый кейс VEZHA Digital",
        "seo_title_en": "WELLNESS APP — product case by VEZHA Digital",
        "seo_description_ru": "Как мы объединили тренировочный сценарий, прогрессию и питание в компактной PWA.",
        "seo_description_en": "How we united workouts, progression and nutrition in a compact PWA.",
        "seo_image_url": f"{ROOT}/hero-hand-device-v2.png",
        "seo_noindex": True,
    }


def _blocks() -> list[dict[str, object]]:
    return [
        _block(
            "hero",
            "hero",
            {
                "logo_url": f"{ROOT}/wellness-mark.svg",
                "eyebrow": "VEZHA / ПРОДУКТОВЫЙ КЕЙС",
                "title": "WELLNESS APP",
                "subtitle": "Ежедневный ритм, в котором тренировка, прогресс и питание работают как одна система.",
                "type_label": "PRODUCT DESIGN / FRONTEND",
                "industry": "WELLNESS & SPORTS",
                "timeline": "PWA → VUE 3",
                "year": "2026",
                "image_url": f"{ROOT}/hero-hand-device-v2.png",
                "image_alt": "Wellness-приложение на экране смартфона",
                "device_screen_url": f"{ROOT}/screen-timer.png",
                "metric_value": "2×1",
                "metric_label": "тренировки + питание",
            },
            {
                "logo_url": f"{ROOT}/wellness-mark.svg",
                "eyebrow": "VEZHA / PRODUCT CASE",
                "title": "WELLNESS APP",
                "subtitle": "A daily rhythm where workouts, progress and nutrition work as one system.",
                "type_label": "PRODUCT DESIGN / FRONTEND",
                "industry": "WELLNESS & SPORTS",
                "timeline": "PWA → VUE 3",
                "year": "2026",
                "image_url": f"{ROOT}/hero-hand-device-v2.png",
                "image_alt": "Wellness application shown on a smartphone",
                "device_screen_url": f"{ROOT}/screen-timer.png",
                "metric_value": "2×1",
                "metric_label": "workouts + nutrition",
            },
            0,
            _settings(spacing="large"),
        ),
        _block(
            "context",
            "text",
            {
                "eyebrow": "Контекст продукта",
                "title": "Приложение выросло из персонального трекера в систему на каждый день.",
                "body": "Первая версия помогала пройти тренировку: показывала порядок упражнений, держала таймер и сохраняла нагрузку. Но реальный день не заканчивался последним подходом.\n\nМы связали тренировочный контур с питанием, рецептами, порциями и дневным меню — без перегруженного дашборда и переключения между сервисами.",
            },
            {
                "eyebrow": "Product context",
                "title": "The app grew from a personal tracker into an everyday system.",
                "body": "The first version guided a workout, kept the timer and saved working loads. But the real day did not end with the final set.\n\nWe connected that flow with nutrition, recipes, servings and daily menus — without an overloaded dashboard or switching services.",
            },
            1,
            _settings("soft", spacing="large", anchor="story"),
        ),
        _block(
            "video",
            "video",
            {
                "eyebrow": "Продукт в движении",
                "title": "Один ритм — от плана до восстановления",
                "video_url": f"{ROOT}/wellness-promo.mp4",
                "poster_url": f"{ROOT}/wellness-promo-poster.jpg",
                "caption": "Короткий обзор тренировочного и пищевого сценариев",
            },
            {
                "eyebrow": "Product in motion",
                "title": "One rhythm — from planning to recovery",
                "video_url": f"{ROOT}/wellness-promo.mp4",
                "poster_url": f"{ROOT}/wellness-promo-poster.jpg",
                "caption": "A short view of the workout and nutrition flows",
            },
            2,
            _settings(width="full", spacing="compact", layout="cinematic"),
        ),
        _block(
            "facts",
            "metrics",
            {
                "eyebrow": "Факты продукта",
                "title": "Масштаб решения — в реализованных сценариях, а не в рекламных процентах.",
                "summary": "Показываем только то, что подтверждено текущим продуктом.",
                "items": [
                    {"value": "02", "label": "связанных контура", "context": "Тренировки и питание"},
                    {"value": "06", "label": "ключевых экранов", "context": "Показаны в кейсе"},
                    {"value": "PWA", "label": "мобильный формат", "context": "Установка из браузера"},
                    {"value": "LOCAL", "label": "данные под рукой", "context": "Local-first состояние"},
                ],
            },
            {
                "eyebrow": "Product facts",
                "title": "The solution is measured in working flows, not advertising percentages.",
                "summary": "Only facts confirmed by the current product are shown.",
                "items": [
                    {"value": "02", "label": "connected flows", "context": "Workouts and nutrition"},
                    {"value": "06", "label": "core screens", "context": "Shown in the case"},
                    {"value": "PWA", "label": "mobile format", "context": "Installable from a browser"},
                    {"value": "LOCAL", "label": "data close at hand", "context": "Local-first state"},
                ],
            },
            3,
            _settings(anchor="evidence"),
        ),
        _block(
            "challenge",
            "challenge_solution",
            {
                "eyebrow": "Задача и решение",
                "title": "Убрать разрыв между тренировкой и остальным днём.",
                "challenge_label": "Исходная версия",
                "challenge": "Компактная PWA закрывала один линейный сценарий. Прогресс жил в отдельных экранах, питание — вне продукта, а контекст приходилось собирать самому.",
                "solution_label": "Новая система",
                "solution": "Компонентное Vue-приложение объединило план, активную тренировку, прогрессию, рецепты и дневной рацион в повторяемый цикл.",
            },
            {
                "eyebrow": "Challenge and solution",
                "title": "Remove the gap between a workout and the rest of the day.",
                "challenge_label": "Starting point",
                "challenge": "The compact PWA covered one linear flow. Progress lived on separate screens and nutrition outside the product.",
                "solution_label": "New system",
                "solution": "A component-based Vue application united planning, active workouts, progression, recipes and daily nutrition into one cycle.",
            },
            4,
            _settings("soft", spacing="large"),
        ),
        _block(
            "process",
            "process",
            {
                "eyebrow": "Как строили продукт",
                "title": "Четыре шага от полезного инструмента к цельному опыту.",
                "items": [
                    {"title": "Разобрали ежедневный сценарий", "description": "Оставили на каждом экране один понятный следующий шаг."},
                    {"title": "Собрали тренировочный контур", "description": "Связали программу, нагрузку, таймер и прогрессию."},
                    {"title": "Добавили питание в тот же ритм", "description": "Рецепты, порции, КБЖУ и меню стали продолжением дня."},
                    {"title": "Укрепили мобильную основу", "description": "Vue 3, local-first данные, wake lock, звук и вибрация."},
                ],
            },
            {
                "eyebrow": "How the product was shaped",
                "title": "Four steps from a useful tool to a coherent experience.",
                "items": [
                    {"title": "Mapped the daily scenario", "description": "Kept one clear next step on every screen."},
                    {"title": "Built the workout loop", "description": "Connected the program, load, timer and progression."},
                    {"title": "Brought nutrition into the same rhythm", "description": "Recipes, servings, macros and menus continued the day."},
                    {"title": "Hardened the mobile foundation", "description": "Vue 3, local-first data, wake lock, sound and vibration."},
                ],
            },
            5,
            _settings(spacing="large"),
        ),
        _block(
            "workout-copy",
            "text",
            {
                "eyebrow": "Тренировочный контур",
                "title": "Во время занятия интерфейс не отвлекает — он ведёт.",
                "body": "Пользователь видит текущий блок, нужное упражнение и следующий переход. Таймер становится частью сценария, а прогрессия повторений и веса сохраняется без ручных таблиц.\n\nЗвук, вибрация и wake lock поддерживают занятие, когда внимание занято движением.",
            },
            {
                "eyebrow": "Workout flow",
                "title": "During a workout, the interface guides instead of distracting.",
                "body": "The user sees the current block, exercise and next transition. The timer becomes part of the flow while rep and weight progression is saved without manual spreadsheets.\n\nSound, vibration and wake lock support the session when attention is occupied by movement.",
            },
            6,
            _settings(spacing="large"),
        ),
        _block(
            "workout-screens",
            "gallery",
            {
                "eyebrow": "Интерфейс тренировки",
                "title": "Программа, прогрессия и таймер в одном контексте.",
                "items": [
                    {"image_url": f"{ROOT}/screen-workout-home.png", "alt": "Программа тренировки", "caption": "Программа дня"},
                    {"image_url": f"{ROOT}/screen-progression.png", "alt": "Прогрессия нагрузки", "caption": "Прогрессия"},
                    {"image_url": f"{ROOT}/screen-timer.png", "alt": "Таймер отдыха", "caption": "Контекстный таймер"},
                ],
            },
            {
                "eyebrow": "Workout interface",
                "title": "Program, progression and timer in one context.",
                "items": [
                    {"image_url": f"{ROOT}/screen-workout-home.png", "alt": "Workout program", "caption": "Daily program"},
                    {"image_url": f"{ROOT}/screen-progression.png", "alt": "Load progression", "caption": "Progression"},
                    {"image_url": f"{ROOT}/screen-timer.png", "alt": "Rest timer", "caption": "Contextual timer"},
                ],
            },
            7,
            _settings("ink", width="full", layout="phones"),
        ),
        _block(
            "nutrition-copy",
            "text",
            {
                "eyebrow": "Контур питания",
                "title": "Питание перестало быть набором заметок и расчётов.",
                "body": "Библиотека рецептов организована по роли блюда в рационе. Порции автоматически пересчитывают КБЖУ, а дневное меню сводит блюда и итог дня на одном экране.\n\nПитание остаётся конкретным действием внутри общего плана, а не отдельной дисциплиной.",
            },
            {
                "eyebrow": "Nutrition flow",
                "title": "Nutrition stopped being a collection of notes and calculations.",
                "body": "The recipe library is organized by each dish’s role. Servings recalculate macros while the daily menu combines dishes and totals in one view.\n\nNutrition remains a concrete action inside the common plan rather than a separate discipline.",
            },
            8,
            _settings("soft", spacing="large"),
        ),
        _block(
            "nutrition-screens",
            "gallery",
            {
                "eyebrow": "Интерфейс питания",
                "title": "От библиотеки рецептов — к собранному дню.",
                "items": [
                    {"image_url": f"{ROOT}/screen-food-home.png", "alt": "Библиотека рецептов", "caption": "Библиотека"},
                    {"image_url": f"{ROOT}/screen-recipe.png", "alt": "Рецепт и пищевая ценность", "caption": "Рецепт и порции"},
                    {"image_url": f"{ROOT}/screen-daily-menu.png", "alt": "Дневное меню", "caption": "Рацион на день"},
                ],
            },
            {
                "eyebrow": "Nutrition interface",
                "title": "From a recipe library to a complete day.",
                "items": [
                    {"image_url": f"{ROOT}/screen-food-home.png", "alt": "Recipe library", "caption": "Library"},
                    {"image_url": f"{ROOT}/screen-recipe.png", "alt": "Recipe and nutrition values", "caption": "Recipe and servings"},
                    {"image_url": f"{ROOT}/screen-daily-menu.png", "alt": "Daily menu", "caption": "Daily plan"},
                ],
            },
            9,
            _settings("ink", width="full", layout="phones"),
        ),
        _block(
            "technologies",
            "technologies",
            {
                "eyebrow": "Технический контур",
                "title": "PRODUCT / PWA / VUE",
                "summary": "Архитектура поддерживает быстрый ежедневный доступ и возможности мобильного устройства.",
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
                "eyebrow": "Technical contour",
                "title": "PRODUCT / PWA / VUE",
                "summary": "The architecture supports immediate daily access and mobile device capabilities.",
                "items": [
                    {"label": "Vue 3 + Vite", "category": "CLIENT", "x": 18, "y": 20},
                    {"label": "PWA / Local-first", "category": "CLIENT", "x": 30, "y": 78},
                    {"label": "Sound + Vibration", "category": "DEVICE", "x": 82, "y": 20},
                    {"label": "Wake Lock", "category": "DEVICE", "x": 70, "y": 78},
                    {"label": "Open Food Facts", "category": "DATA", "x": 25, "y": 48},
                    {"label": "Docker", "category": "DELIVERY", "x": 78, "y": 48},
                ],
            },
            10,
            _settings(
                "ink",
                width="full",
                spacing="compact",
                layout="map",
                anchor="technical",
                map_accent="#ad9cff",
                map_background="#151826",
                map_text="#f7f8ff",
            ),
        ),
        _block(
            "result",
            "results",
            {
                "eyebrow": "Итог",
                "title": "Не набор функций, а один повторяемый ритм заботы о себе.",
                "body": "Пользователь может спланировать занятие, выполнить его, восстановиться и собрать питание на день, не меняя инструменты и не теряя контекст. Продукт остаётся компактным, но воспринимается как единая система.",
                "link_url": "",
                "link_label": "",
            },
            {
                "eyebrow": "Outcome",
                "title": "Not a feature set, but one repeatable rhythm of self-care.",
                "body": "The user can plan a session, complete it, recover and assemble daily nutrition without changing tools or losing context. The product stays compact while feeling like one system.",
                "link_url": "",
                "link_label": "",
            },
            11,
            _settings("signal", spacing="large"),
        ),
        _block(
            "next",
            "next_case",
            {"eyebrow": "Следующий шаг", "title": "Посмотреть другие проекты", "case_slug": "", "cta_label": "К галерее кейсов"},
            {"eyebrow": "Next step", "title": "Explore more projects", "case_slug": "", "cta_label": "Back to case gallery"},
            12,
            _settings("soft", spacing="large"),
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

    project_id = connection.execute(
        sa.select(projects.c.id).where(projects.c.slug == SLUG)
    ).scalar_one_or_none()
    if project_id is None:
        return

    connection.execute(
        projects.update().where(projects.c.id == project_id).values(
            type_ru=meta["type_ru"],
            type_en=meta["type_en"],
            name_ru=meta["name_ru"],
            name_en=meta["name_en"],
            description_ru=meta["description_ru"],
            description_en=meta["description_en"],
            subtitle_ru=meta["subtitle_ru"],
            subtitle_en=meta["subtitle_en"],
            industry_ru=meta["industry_ru"],
            industry_en=meta["industry_en"],
            year=meta["year"],
            timeline_ru=meta["timeline_ru"],
            timeline_en=meta["timeline_en"],
            image_url=meta["image_url"],
            cover_image_url=meta["cover_image_url"],
            hero_metric_value=meta["hero_metric_value"],
            hero_metric_label_ru=meta["hero_metric_label_ru"],
            hero_metric_label_en=meta["hero_metric_label_en"],
            sort_order=meta["sort_order"],
            is_active=True,
            is_featured=True,
            status="published",
            draft_data=meta,
            published_data=snapshot,
            published_at=now,
            updated_at=now,
        )
    )
    connection.execute(project_blocks.delete().where(project_blocks.c.project_id == project_id))
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
    previous_version = connection.execute(
        sa.select(sa.func.max(revisions.c.version)).where(revisions.c.project_id == project_id)
    ).scalar_one_or_none() or 0
    version = previous_version + 1
    connection.execute(
        revisions.insert().values(
            id=_uuid(f"revision-{version}"),
            project_id=project_id,
            version=version,
            snapshot=snapshot,
            created_at=now,
        )
    )


def downgrade() -> None:
    # Published case content is editor data; a downgrade must not overwrite it.
    pass
