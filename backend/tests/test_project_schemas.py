from app.schemas.project import ProjectCreate, ProjectUpdate


def valid_project_payload() -> dict:
    return {
        "type_ru": "Telegram Mini App",
        "type_en": "Telegram Mini App",
        "name_ru": "Меню ресторана",
        "name_en": "Restaurant menu",
        "slug": "restaurant-menu",
        "subtitle_ru": "Меню, которое продаёт",
        "subtitle_en": "A menu that sells",
        "is_featured": True,
        "metrics": [
            {
                "value": "+28%",
                "label_ru": "конверсия в заказ",
                "label_en": "order conversion",
                "context_ru": "После запуска Mini App",
                "context_en": "After the Mini App launch",
                "sort_order": 0,
            }
        ],
        "gallery": [],
        "technologies": [
            {"label": "Vue", "category": "stack", "sort_order": 0}
        ],
    }


def test_project_create_accepts_fixed_case_content() -> None:
    project = ProjectCreate.model_validate(valid_project_payload())

    assert project.slug == "restaurant-menu"
    assert project.metrics[0].label_ru == "конверсия в заказ"
    assert project.technologies[0].category == "stack"


def test_project_update_keeps_nested_collections_optional() -> None:
    update = ProjectUpdate.model_validate({"result_summary_ru": "Рост подтверждён"})

    assert update.metrics is None
    assert update.gallery is None
