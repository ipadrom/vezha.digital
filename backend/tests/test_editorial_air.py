import importlib.util
from pathlib import Path

from app.schemas.case_builder import CaseBlockInput


def migration(name="y5n6o7p8q9r0_editorial_air_sections.py"):
    path = Path(__file__).parents[1] / "alembic/versions" / name
    spec = importlib.util.spec_from_file_location(name.removesuffix(".py"), path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_air_layout_preserves_bilingual_editorial_fields():
    block = CaseBlockInput(
        type="challenge_solution",
        content_ru={"solution_label": "Программа сравнивает", "solution": "доступные варианты."},
        content_en={"solution_label": "The tool compares", "solution": "available options."},
        settings={"layout": "air"},
    )
    assert block.settings.layout == "air"
    assert block.content_ru["solution_label"] == "Программа сравнивает"
    assert block.content_en["solution"] == "available options."
    assert CaseBlockInput.model_validate(block.model_dump()).model_dump() == block.model_dump()


def test_air_results_keep_optional_titles_without_changing_legacy_items():
    items = [{"title": "Проверенные данные", "text": "Описание результата."}, {"text": "Без подписи."}]
    block = CaseBlockInput(type="results", content_ru={"items": items}, settings={"layout": "air"})
    assert block.content_ru["items"] == items
    assert CaseBlockInput.model_validate(block.model_dump()).content_ru["items"] == items
    assert CaseBlockInput(type="results").settings.layout == "statement"
    assert CaseBlockInput(type="challenge_solution").settings.layout == "narrative"


def test_content_migration_only_changes_the_two_story_sections_and_removes_redundant_map():
    content = migration()
    crew = {
        "id": content.CREW_TASK_ID,
        "type": "challenge_solution",
        "content_ru": {"eyebrow": "Вторая задача", "custom": "kept"},
        "content_en": {"eyebrow": "The second task"},
        "settings": {"theme": "soft", "layout": "narrative"},
    }
    result = {
        "id": content.FINANCE_RESULT_ID,
        "type": "results",
        "content_ru": {"eyebrow": "Результат третьей задачи"},
        "content_en": {"eyebrow": "Outcome of the third task"},
        "settings": {"layout": "statement"},
    }
    untouched = {"id": "other", "type": "text", "content_ru": {"body": "Сохранить"}}
    transformed = content.transform_blocks(
        [crew, {"id": content.REDUNDANT_FINANCE_MAP_ID, "type": "technologies"}, result, untouched]
    )
    assert len(transformed) == 3
    assert transformed[0]["settings"] == {"theme": "soft", "layout": "air"}
    assert transformed[0]["content_ru"]["eyebrow"] == "Вторая задача"
    assert transformed[0]["content_ru"]["custom"] == "kept"
    assert transformed[0]["content_ru"]["solution_label"] == "Программа сравнивает возможные составы"
    assert transformed[1]["settings"]["layout"] == "air"
    assert [item["title"] for item in transformed[1]["content_ru"]["items"]] == [
        "Один расчётный период",
        "Актуальные записи",
        "Спорные заказы отдельно",
        "Ручные поля сохранены",
    ]
    assert transformed[2] == untouched
    assert content.transform_blocks(transformed) == transformed


def test_followup_migration_uses_air_for_first_and_third_tasks_only():
    content = migration("z6o7p8q9r0s1_complete_editorial_air.py")
    blocks = [
        {
            "id": content.TASK_ONE_ID,
            "content_ru": {"eyebrow": "От фотографии к сообщениям"},
            "content_en": {"eyebrow": "From a photo to MAX messages"},
            "settings": {"layout": "narrative", "theme": "soft"},
        },
        {
            "id": content.TASK_THREE_ID,
            "content_ru": {"eyebrow": "Третья задача"},
            "content_en": {"eyebrow": "The third task"},
            "settings": {"layout": "narrative"},
        },
        {"id": "other", "settings": {"layout": "narrative"}},
    ]
    transformed = [content.transform_block(block) for block in blocks]
    assert transformed[0]["settings"] == {"layout": "air", "theme": "soft"}
    assert transformed[0]["content_ru"]["eyebrow"] == "От фотографии к сообщениям"
    assert transformed[0]["content_ru"]["solution_label"] == "Приложение распознаёт таблицу"
    assert transformed[1]["settings"]["layout"] == "air"
    assert transformed[1]["content_ru"]["solution_label"] == (
        "Расчёт запускается прямо из Google Таблиц"
    )
    assert transformed[2] == blocks[2]
    assert [content.transform_block(block) for block in transformed] == transformed
