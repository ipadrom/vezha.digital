from copy import deepcopy
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from test_mymit_case_release import migration as release_migration

# Fragments that the recorded clips replaced in the originally published case.
OLD_FRAGMENTS = {
    "auth.mp4": "auth-channels.png",
    "onboarding.mp4": "onboarding.png",
    "favorites.mp4": "favorites.png",
    "search.mp4": "search.png",
    "interval.mp4": "booking-interval.png",
    "earlystart.mp4": "early-start.png",
    "reschedule.mp4": "reschedule.png",
    "extension.mp4": "extension.png",
    "minutes.mp4": "minute-balance.png",
    "analytics.mp4": "analytics-detail.png",
    "admin-bookings.mp4": "admin-bookings.png",
}
NEW_TITLES = {
    "Скидка за повторное посещение",
    "Return-visit discount",
    "Суммы с копейками и точная длительность",
    "Exact amounts and durations",
    "Кампании повторных визитов",
    "Return-visit campaigns",
}


def migration():
    path = (
        Path(__file__).parents[1] / "alembic/versions/s5b6c7d8e9f0_mymit_case_videos.py"
    )
    spec = spec_from_file_location("mymit_case_videos", path)
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def items(document, heading, language="content_ru"):
    for block in document["blocks"]:
        if block["type"] == "process" and block["content_ru"].get("eyebrow") == heading:
            return block[language]["items"]
    raise AssertionError(heading)


def old_document():
    """The case as published before the clips: image fragments, no dev-branch items."""
    document = release_migration().load_document()
    for block in document["blocks"]:
        for language in ("content_ru", "content_en"):
            content = block.get(language, {})
            if block["type"] == "process":
                kept = []
                for item in content["items"]:
                    if item["title"] in NEW_TITLES:
                        continue
                    if item.get("media_type") == "video":
                        name = item.pop("video_url").rsplit("/", 1)[1]
                        item.pop("poster_url")
                        item["media_type"] = "image"
                        item["image_url"] = (
                            "/cases/mymit/2026-09/" + OLD_FRAGMENTS[name]
                        )
                    if item["title"].startswith(
                        ("Несколько броней", "Multiple bookings")
                    ):
                        item["description"] = "Old early-start copy"
                    kept.append(item)
                content["items"] = kept
            if block["type"] == "results":
                for item in content["items"]:
                    if item["title"] in (
                        "Больше возможностей для бронирования.",
                        "More booking options.",
                    ):
                        item["text"] = "Old results copy"
    return document


def test_videos_replace_fragments_and_new_items_are_inserted_once():
    module = migration()
    before = old_document()
    before["meta"]["name_ru"] = "Editorial title"
    favorites = items(before, "Поиск кабинки")[0]
    assert favorites["title"] == "Избранные кабинки"
    assert favorites["image_url"].endswith("favorites.png")
    favorites["description"] = "Editorial favorites copy"
    after = module.patch_document(before)

    assert after["meta"] == before["meta"]
    assert after["blocks"][0] == before["blocks"][0]
    updated = items(after, "Поиск кабинки")[0]
    assert updated["description"] == "Editorial favorites copy"
    assert updated["media_type"] == "video"
    assert updated["video_url"] == "/cases/mymit/2026-09/favorites.mp4"
    assert updated["poster_url"] == "/cases/mymit/2026-09/favorites.jpg"
    assert "image_url" not in updated
    assert items(after, "Поиск кабинки")[2]["image_url"].endswith("working-hours.png")

    videos = [
        item
        for block in after["blocks"]
        if block["type"] == "process"
        for item in block["content_en"]["items"]
        if item.get("media_type") == "video"
    ]
    assert len(videos) == 12
    assert all(
        item["video_url"].endswith(".mp4") and item["poster_url"].endswith(".jpg")
        for item in videos
    )

    payments = [item["title"] for item in items(after, "Оплата и время")]
    assert payments[-2:] == [
        "Скидка за повторное посещение",
        "Суммы с копейками и точная длительность",
    ]
    admin_en = [
        item["title"] for item in items(after, "Управление сервисом", "content_en")
    ]
    assert admin_en[-1] == "Return-visit campaigns"
    assert [item["title"] for item in items(after, "Кабинка и приложение")] == [
        item["title"] for item in items(before, "Кабинка и приложение")
    ]
    early = items(after, "Бронирование и сеанс")[1]
    assert early["title"] == "Несколько броней и ранний старт"
    assert "15 минут" in early["description"]

    results = next(b for b in after["blocks"] if b["type"] == "results")
    assert any(
        "повторное посещение" in item["text"] for item in results["content_ru"]["items"]
    )
    assert module.patch_document(deepcopy(after)) == after
    assert before != after
    # The release snapshot already carries the clips, so the patch leaves it unchanged.
    release = release_migration().load_document()
    assert module.patch_document(deepcopy(release)) == release
