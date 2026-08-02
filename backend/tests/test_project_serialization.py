import uuid
from types import SimpleNamespace

from app.services.projects import serialize_project_detail, serialize_project_summary


def project_fixture() -> SimpleNamespace:
    return SimpleNamespace(
        id=uuid.uuid4(),
        slug="restaurant-menu",
        type_ru="Telegram Mini App",
        type_en="Telegram Mini App",
        name_ru="Меню ресторана",
        name_en="Restaurant menu",
        subtitle_ru="Заказ без лишних шагов",
        subtitle_en="Ordering without extra steps",
        industry_ru="HoReCa",
        industry_en="Hospitality",
        description_ru="Цифровое меню внутри Telegram.",
        description_en="A digital menu inside Telegram.",
        image_url=None,
        cover_image_url=None,
        project_url=None,
        hero_metric_value="04",
        hero_metric_label_ru="недели до запуска",
        hero_metric_label_en="weeks to launch",
        is_featured=True,
        sort_order=1,
        year="2026",
        timeline_ru="4 недели",
        timeline_en="4 weeks",
        challenge_ru="Упростить заказ.",
        challenge_en="Simplify ordering.",
        solution_ru="Mini App с коротким сценарием.",
        solution_en="A Mini App with a short flow.",
        result_summary_ru="Один понятный путь до заказа.",
        result_summary_en="One clear path to checkout.",
        testimonial_ru=None,
        testimonial_en=None,
        testimonial_author_ru=None,
        testimonial_author_en=None,
        metrics=[
            SimpleNamespace(
                value="01",
                label_ru="единый сценарий",
                label_en="unified journey",
                context_ru="От меню до заказа",
                context_en="From menu to checkout",
                sort_order=0,
            )
        ],
        gallery=[],
        technologies=[],
    )


def test_summary_uses_requested_locale() -> None:
    project = project_fixture()

    ru = serialize_project_summary(project, "ru")
    en = serialize_project_summary(project, "en")

    assert ru.name == "Меню ресторана"
    assert en.name == "Restaurant menu"
    assert ru.metrics[0].label == "единый сценарий"
    assert en.metrics[0].context == "From menu to checkout"


def test_detail_keeps_optional_groups_empty() -> None:
    detail = serialize_project_detail(project_fixture(), "ru")

    assert detail.gallery == []
    assert detail.technologies == []
    assert detail.timeline == "4 недели"
