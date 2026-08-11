"""Refresh WELLNESS APP with the editorial story and a full-width media hero."""

from collections.abc import Sequence
from datetime import datetime
from uuid import NAMESPACE_URL, UUID, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "l2a3b4c5d6e7"
down_revision: str = "k1f2a3b4c5d6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SLUG = "wellness-app"
ROOT = "/cases/wellness-app"


def _uuid(name: str) -> UUID:
    # Keep the block ids introduced by the previous WELLNESS migration stable.
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
        "description_ru": "WELLNESS APP связывает программу тренировок, таймер, прогрессию, рецепты и дневное меню в одном компактном продукте.",
        "description_en": "WELLNESS APP connects workout planning, timers, progression, recipes and daily meal planning in one focused product.",
        "subtitle_ru": "Превращаем персональный трекер тренировок в цельный ежедневный опыт — от первого подхода до собранного рациона.",
        "subtitle_en": "Turning a personal workout tracker into a connected daily experience — from the first set to a complete meal plan.",
        "industry_ru": "Wellness & Sports",
        "industry_en": "Wellness & Sports",
        "year": "2026",
        "timeline_ru": "PWA → Vue 3",
        "timeline_en": "PWA → Vue 3",
        "image_url": f"{ROOT}/hero-hand-device-v2.png",
        "cover_image_url": f"{ROOT}/hero-hand-device-v2.png",
        "project_url": "",
        "hero_metric_value": "2×1",
        "hero_metric_label_ru": "связанных контура",
        "hero_metric_label_en": "connected flows",
        "is_featured": True,
        "sort_order": 0,
        "seo_title_ru": "WELLNESS APP — продуктовый кейс VEZHA Digital",
        "seo_title_en": "WELLNESS APP — product case by VEZHA Digital",
        "seo_description_ru": "Как тренировочный трекер вырос в связанный ежедневный продукт для тренировок, прогрессии и питания.",
        "seo_description_en": "How a workout tracker grew into a connected daily product for workouts, progression and nutrition.",
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
                "subtitle": "Превращаем персональный трекер тренировок в цельный ежедневный опыт — от первого подхода до собранного рациона.",
                "type_label": "PRODUCT DESIGN / FRONTEND",
                "industry": "WELLNESS & SPORTS",
                "timeline": "PWA → VUE 3",
                "year": "2026",
                "image_url": f"{ROOT}/hero-hand-device-v2.png",
                "image_alt": "Wellness-приложение на экране смартфона",
                "device_screen_url": f"{ROOT}/screen-timer.png",
                "metric_value": "2×1",
                "metric_label": "связанных контура",
            },
            {
                "logo_url": f"{ROOT}/wellness-mark.svg",
                "eyebrow": "VEZHA / PRODUCT CASE",
                "title": "WELLNESS APP",
                "subtitle": "Turning a personal workout tracker into a connected daily experience — from the first set to a complete meal plan.",
                "type_label": "PRODUCT DESIGN / FRONTEND",
                "industry": "WELLNESS & SPORTS",
                "timeline": "PWA → VUE 3",
                "year": "2026",
                "image_url": f"{ROOT}/hero-hand-device-v2.png",
                "image_alt": "Wellness application shown on a smartphone",
                "device_screen_url": f"{ROOT}/screen-timer.png",
                "metric_value": "2×1",
                "metric_label": "connected flows",
            },
            0,
            _settings(spacing="large"),
        ),
        _block(
            "context",
            "text",
            {
                "eyebrow": "О проекте",
                "title": "Один продукт для той части дня, которая раньше жила в разных инструментах.",
                "body": "WELLNESS APP начинался как компактный инструмент для прохождения тренировки: программа держала порядок упражнений, таймер — ритм отдыха, а прогрессия — историю нагрузки. По мере использования стало ясно, что полезный сценарий обрывается слишком рано: после последнего подхода питание, рецепты и план дня снова расходятся по заметкам и другим сервисам.\n\nМы расширили продукт вокруг реального пользовательского дня. Тренировочный контур и сценарии питания получили общую логику, единый визуальный язык и понятные переходы, сохранив компактность первоначальной PWA.",
            },
            {
                "eyebrow": "About the project",
                "title": "One product for the part of the day that used to live across different tools.",
                "body": "WELLNESS APP began as a compact workout companion: the program held the exercise order, the timer kept the pace of recovery, and progression stored the history of each load. With regular use, it became clear that the useful journey ended too early. After the final set, nutrition, recipes and the plan for the day scattered across notes and other services.\n\nWe expanded the product around the user’s real day. Workout and nutrition flows gained shared logic, one visual language and clear transitions while preserving the focus of the original PWA.",
            },
            1,
            _settings("soft", spacing="large", anchor="story"),
        ),
        _block(
            "video",
            "media_hero",
            {
                "video_url": f"{ROOT}/wellness-promo.mp4",
                "poster_url": f"{ROOT}/wellness-promo-poster.jpg",
                "image_url": "",
                "alt": "WELLNESS APP: тренировки, прогрессия и питание",
                "caption": "Как тренировка продолжается в прогрессии и питании",
                "autoplay": True,
                "loop": True,
                "muted": True,
                "controls": False,
            },
            {
                "video_url": f"{ROOT}/wellness-promo.mp4",
                "poster_url": f"{ROOT}/wellness-promo-poster.jpg",
                "image_url": "",
                "alt": "WELLNESS APP: workouts, progression and nutrition",
                "caption": "How a workout continues through progression and nutrition",
                "autoplay": True,
                "loop": True,
                "muted": True,
                "controls": False,
            },
            2,
            _settings("ink", width="full", spacing="compact", layout="media-16x9"),
        ),
        _block(
            "facts",
            "metrics",
            {
                "eyebrow": "В основе решения",
                "title": "Компактный продукт, собранный вокруг ежедневных действий.",
                "summary": "Вместо разрозненных инструментов — два связанных пользовательских контура и шесть ключевых экранов.",
                "items": [
                    {"value": "02", "label": "основных сценария", "context": "Тренировка + питание"},
                    {"value": "06", "label": "ключевых экранов", "context": "От программы до меню"},
                    {"value": "PWA", "label": "установка без стора", "context": "Запуск из браузера"},
                    {"value": "LOCAL", "label": "состояние на устройстве", "context": "Быстрый повторный доступ"},
                ],
            },
            {
                "eyebrow": "At the core",
                "title": "A focused product built around everyday actions.",
                "summary": "Instead of disconnected tools, the product brings together two user flows and six core screens.",
                "items": [
                    {"value": "02", "label": "core flows", "context": "Workout + nutrition"},
                    {"value": "06", "label": "core screens", "context": "From program to meal plan"},
                    {"value": "PWA", "label": "store-free install", "context": "Launched from the browser"},
                    {"value": "LOCAL", "label": "on-device state", "context": "Fast return access"},
                ],
            },
            3,
            _settings(anchor="evidence"),
        ),
        _block(
            "challenge",
            "challenge_solution",
            {
                "eyebrow": "Задача",
                "title": "Расширить продукт, не превратив его в тяжёлый wellness-комбайн.",
                "challenge_label": "Что мешало",
                "challenge": "Первая версия уверенно вела только по тренировке. Прогрессия не складывалась в непрерывный путь, питание оставалось за пределами приложения, а каждый новый модуль мог сделать навигацию тяжелее.",
                "solution_label": "Что сделали",
                "solution": "Мы построили систему вокруг повторяемого дневного цикла: выбрать программу, пройти занятие, сохранить нагрузку, собрать блюда и увидеть итог дня. Все сценарии работают на одной компонентной основе и говорят одним визуальным языком.",
            },
            {
                "eyebrow": "Challenge",
                "title": "Expand the product without turning it into an overloaded wellness suite.",
                "challenge_label": "What stood in the way",
                "challenge": "The first version confidently guided only the workout itself. Progression did not form a continuous journey, nutrition stayed outside the app, and every new module risked making navigation heavier.",
                "solution_label": "What we did",
                "solution": "We shaped the system around a repeatable daily loop: choose a program, complete the session, save the load, assemble meals and see the day as a whole. Every flow runs on one component foundation and speaks the same visual language.",
            },
            4,
            _settings("soft", spacing="large"),
        ),
        _block(
            "process",
            "process",
            {
                "eyebrow": "Наш процесс",
                "title": "От карты дня — к целостному мобильному продукту.",
                "items": [
                    {"title": "Разобрали ядро продукта", "description": "Зафиксировали действия, которые уже приносили пользу, и нашли разрывы между программой, таймером, прогрессией и питанием."},
                    {"title": "Перестроили UX вокруг дня", "description": "Собрали последовательность экранов так, чтобы каждое состояние подсказывало один следующий шаг и не требовало возвращаться к дашборду."},
                    {"title": "Создали единую UI-систему", "description": "Перенесли тренировку и питание на общие компоненты, правила типографики и мобильную иерархию."},
                    {"title": "Подготовили к реальному использованию", "description": "Сохранили local-first модель, добавили wake lock, звук и вибрацию и упаковали продукт в устанавливаемую PWA."},
                ],
            },
            {
                "eyebrow": "Our process",
                "title": "From mapping the day to a coherent mobile product.",
                "items": [
                    {"title": "Mapped the product core", "description": "We identified the actions that already delivered value and found the gaps between the program, timer, progression and nutrition."},
                    {"title": "Reframed the UX around the day", "description": "We arranged the screens so every state suggests one next action without sending the user back to a dashboard."},
                    {"title": "Created one UI system", "description": "We brought workout and nutrition flows onto shared components, typography rules and a common mobile hierarchy."},
                    {"title": "Prepared it for everyday use", "description": "We kept the local-first model, added wake lock, sound and vibration, and packaged the product as an installable PWA."},
                ],
            },
            5,
            _settings(spacing="large"),
        ),
        _block(
            "workout-copy",
            "text",
            {
                "eyebrow": "Тренировочный опыт",
                "title": "Интерфейс остаётся в фоне, пока пользователь движется.",
                "body": "Во время тренировки внимание должно быть на движении, а не на навигации. Поэтому активный сценарий показывает только текущий блок, упражнение и ближайшее действие. Таймер встроен в паузу между подходами, а звук и вибрация позволяют не следить за экраном каждую секунду.\n\nПосле занятия веса и повторения остаются в истории прогрессии. Следующая тренировка начинается уже с контекста, а не с пустой формы.",
            },
            {
                "eyebrow": "Workout experience",
                "title": "The interface stays in the background while the user moves.",
                "body": "During a workout, attention belongs on movement rather than navigation. The active flow therefore shows only the current block, the exercise and the nearest action. The timer lives inside the pause between sets, while sound and vibration remove the need to watch the screen every second.\n\nWhen the session ends, weights and reps remain in progression history. The next workout begins with context instead of an empty form.",
            },
            6,
            _settings(spacing="large"),
        ),
        _block(
            "workout-screens",
            "gallery",
            {
                "eyebrow": "Ключевые экраны",
                "title": "Весь тренировочный путь без лишних переходов.",
                "items": [
                    {"image_url": f"{ROOT}/screen-workout-home.png", "alt": "Программа тренировки", "caption": "Программа и порядок блоков"},
                    {"image_url": f"{ROOT}/screen-progression.png", "alt": "Прогрессия нагрузки", "caption": "История нагрузки"},
                    {"image_url": f"{ROOT}/screen-timer.png", "alt": "Таймер отдыха", "caption": "Отдых между подходами"},
                ],
            },
            {
                "eyebrow": "Key screens",
                "title": "The complete workout journey without unnecessary steps.",
                "items": [
                    {"image_url": f"{ROOT}/screen-workout-home.png", "alt": "Workout program", "caption": "Program and block order"},
                    {"image_url": f"{ROOT}/screen-progression.png", "alt": "Load progression", "caption": "Load history"},
                    {"image_url": f"{ROOT}/screen-timer.png", "alt": "Rest timer", "caption": "Recovery between sets"},
                ],
            },
            7,
            _settings("ink", width="full", layout="phones"),
        ),
        _block(
            "nutrition-copy",
            "text",
            {
                "eyebrow": "Питание",
                "title": "Рацион становится продолжением плана, а не отдельной задачей.",
                "body": "Мы не строили ещё один сложный счётчик калорий. Вместо этого организовали рецепты по роли в рационе, связали размер порции с КБЖУ и дали возможность собрать меню на день из уже понятных блюд.\n\nПользователь двигается от выбора рецепта к конкретной порции и видит итог дня в том же продукте, где только что закончил тренировку.",
            },
            {
                "eyebrow": "Nutrition",
                "title": "Nutrition becomes a continuation of the plan, not a separate task.",
                "body": "We did not build another complicated calorie counter. Instead, recipes are organized by their role in the diet, serving size is connected to macros, and a daily menu can be assembled from familiar dishes.\n\nThe user moves from choosing a recipe to a specific serving and sees the whole day inside the same product where the workout just ended.",
            },
            8,
            _settings("soft", spacing="large"),
        ),
        _block(
            "nutrition-screens",
            "gallery",
            {
                "eyebrow": "Ключевые экраны",
                "title": "От идеи блюда — к собранному меню дня.",
                "items": [
                    {"image_url": f"{ROOT}/screen-food-home.png", "alt": "Библиотека рецептов", "caption": "Рецепты по категориям"},
                    {"image_url": f"{ROOT}/screen-recipe.png", "alt": "Рецепт и пищевая ценность", "caption": "Порция и КБЖУ"},
                    {"image_url": f"{ROOT}/screen-daily-menu.png", "alt": "Дневное меню", "caption": "Собранное меню дня"},
                ],
            },
            {
                "eyebrow": "Key screens",
                "title": "From a meal idea to a complete daily menu.",
                "items": [
                    {"image_url": f"{ROOT}/screen-food-home.png", "alt": "Recipe library", "caption": "Recipes by category"},
                    {"image_url": f"{ROOT}/screen-recipe.png", "alt": "Recipe and nutrition values", "caption": "Serving and macros"},
                    {"image_url": f"{ROOT}/screen-daily-menu.png", "alt": "Daily menu", "caption": "Complete daily menu"},
                ],
            },
            9,
            _settings("ink", width="full", layout="phones"),
        ),
        _block(
            "technologies",
            "technologies",
            {
                "eyebrow": "Технологии",
                "title": "Лёгкая PWA-основа с возможностями нативного устройства.",
                "summary": "Vue 3 и Vite держат компонентный интерфейс, local-first состояние ускоряет ежедневный доступ, а системные API поддерживают активный режим тренировки.",
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
                "eyebrow": "Technologies",
                "title": "A lightweight PWA foundation with native device capabilities.",
                "summary": "Vue 3 and Vite power the component interface, local-first state keeps daily access fast, and device APIs support the active workout mode.",
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
                "eyebrow": "Результат",
                "title": "WELLNESS APP превратился из одного полезного сценария в связанный продукт на каждый день.",
                "body": "Теперь пользователь может выбрать тренировку, пройти её с таймером, сохранить прогрессию и собрать питание на день, не меняя инструменты. Новая структура оставляет продукт быстрым и сфокусированным, но даёт ему пространство для развития — новых программ, рецептов и персональных сценариев.",
                "link_url": "",
                "link_label": "",
            },
            {
                "eyebrow": "Results",
                "title": "WELLNESS APP grew from one useful flow into a connected product for every day.",
                "body": "A user can now choose a workout, complete it with the timer, preserve progression and assemble the day’s nutrition without changing tools. The new structure keeps the product fast and focused while leaving room for new programs, recipes and personal flows.",
                "link_url": "",
                "link_label": "",
            },
            11,
            _settings("signal", spacing="large"),
        ),
        _block(
            "next",
            "next_case",
            {"eyebrow": "Другие проекты", "title": "Продолжить знакомство с работами VEZHA", "case_slug": "", "cta_label": "Смотреть все кейсы"},
            {"eyebrow": "More work", "title": "Continue exploring the work of VEZHA", "case_slug": "", "cta_label": "View all cases"},
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
        sa.column("challenge_ru", sa.Text()),
        sa.column("challenge_en", sa.Text()),
        sa.column("solution_ru", sa.Text()),
        sa.column("solution_en", sa.Text()),
        sa.column("result_summary_ru", sa.Text()),
        sa.column("result_summary_en", sa.Text()),
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
            challenge_ru="Расширить тренировочный трекер, не превратив его в перегруженный wellness-комбайн.",
            challenge_en="Expand a workout tracker without turning it into an overloaded wellness suite.",
            solution_ru="Мы собрали тренировку и питание вокруг одного повторяемого дневного цикла и единой компонентной системы.",
            solution_en="We organized workout and nutrition flows around one repeatable daily loop and a shared component system.",
            result_summary_ru="Один полезный сценарий вырос в связанный продукт на каждый день — быстрый, сфокусированный и готовый к развитию.",
            result_summary_en="One useful flow grew into a connected daily product that stays fast, focused and ready to evolve.",
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
    # Case content is editor data; a downgrade must not overwrite subsequent edits.
    pass
