"""Publish three storytelling chapters for the Zagorulko case.

Revision ID: w3l4m5n6o7p8
Revises: v2k3l4m5n6o7
"""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime
from uuid import NAMESPACE_URL, UUID, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "w3l4m5n6o7p8"
down_revision: str = "v2k3l4m5n6o7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SLUG = "gbu-process-automation"


def _uuid(name: str) -> UUID:
    return uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/{SLUG}#story-v1-{name}")


def _settings(
    layout: str,
    *,
    theme: str = "paper",
    spacing: str = "large",
    width: str = "wide",
    **extra: object,
) -> dict[str, object]:
    return {
        "theme": theme,
        "surface": "plain",
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
    name: str,
    block_type: str,
    content_ru: dict[str, object],
    content_en: dict[str, object],
    settings: dict[str, object],
) -> dict[str, object]:
    return {
        "id": _uuid(name),
        "type": block_type,
        "content_ru": content_ru,
        "content_en": content_en,
        "settings": settings,
        "sort_order": 0,
        "is_visible": True,
    }


def _meta(source: dict[str, object] | None = None) -> dict[str, object]:
    return {
        "sort_order": 80,
        **dict(source or {}),
        "slug": SLUG,
        "name_ru": "Автоматизация рабочих процессов ИП Загорулько",
        "name_en": "Zagorulko — workflow automation",
        "type_ru": "Автоматизация процессов",
        "type_en": "Workflow automation",
        "description_ru": (
            "Как мы помогли ИП Загорулько разбирать фотографии заказов, собирать бригады и считать "
            "заказы за полмесяца."
        ),
        "description_en": (
            "How we helped Zagorulko read photographed orders, assemble crews and prepare "
            "half-monthly order calculations."
        ),
        "subtitle_ru": "Три программы для заказов, бригад и расчётов",
        "subtitle_en": "Three tools for orders, crews and reporting",
        "industry_ru": "Операционные процессы",
        "industry_en": "Operations",
        "timeline_ru": "3 связанные задачи",
        "timeline_en": "3 related tasks",
        "hero_metric_value": "",
        "hero_metric_label_ru": "",
        "hero_metric_label_en": "",
        "seo_title_ru": "Автоматизация рабочих процессов ИП Загорулько",
        "seo_title_en": "Zagorulko — workflow automation",
        "seo_description_ru": (
            "Как мы помогли ИП Загорулько переносить заказы с фотографий в MAX, подбирать бригады с "
            "учётом рабочих связей и сводить расчёты в Google Таблицах."
        ),
        "seo_description_en": (
            "Automation for Zagorulko: photographed orders to MAX, crew assignment based on working "
            "relationships, and half-monthly calculations in Google Sheets."
        ),
    }


def _story_blocks(next_case: dict[str, object] | None = None) -> list[dict[str, object]]:
    blocks = [
        _block(
            "hero",
            "hero",
            {
                "eyebrow": "ИП Загорулько",
                "title": "ИП Загорулько",
                "subtitle": "Помогли подрядчику разбирать заказы, собирать бригады и сводить расчёты.",
                "type_label": "Автоматизация процессов",
                "industry": "Операционные процессы",
                "timeline": "3 связанные задачи",
                "year": "",
                "image_url": "",
                "image_alt": "",
                "device_screen_url": "",
                "metric_value": "",
                "metric_label": "",
            },
            {
                "eyebrow": "Zagorulko",
                "title": "Zagorulko",
                "subtitle": "Helping a contractor process orders, assemble crews and prepare calculations.",
                "type_label": "Workflow automation",
                "industry": "Operations",
                "timeline": "3 related tasks",
                "year": "",
                "image_url": "",
                "image_alt": "",
                "device_screen_url": "",
                "metric_value": "",
                "metric_label": "",
            },
            _settings("case-header", width="full"),
        ),
        _block(
            "about",
            "text",
            {
                "kicker": "",
                "eyebrow": "О проекте",
                "title": "Заказы приходили фотографиями, а всю дальнейшую работу сотрудники делали вручную",
                "body": (
                    "ИП Загорулько распределяет сотрудников по выездным заказам крупной организации, поэтому "
                    "в течение рабочего дня приходится и готовить задания, и собирать под них людей. Вечером "
                    "в компанию приходит фотография таблицы с заказами, которые нужно перенести в MAX, а в "
                    "середине дня по меняющемуся списку сотрудников собирают бригады. Когда раз в две недели "
                    "наступает время расчётов, к этим же заказам возвращаются уже в переписке, чтобы "
                    "посчитать выезды и начисления.\n\nМы сделали три программы, каждая из которых взяла на "
                    "себя отдельную часть этой работы. Приложение для распознавания разбирает фотографию и "
                    "готовит сообщения в MAX, программа подбора предлагает бригады с учётом совместных "
                    "выездов, а скрипт в Google Таблицах сводит показатели за полмесяца там, где заказчик и "
                    "прежде вёл расчёты.\n\nДанные о деятельности ИП Загорулько в кейсе специально обезличены "
                    "и частично изменены, поэтому имена, маршруты, номера заказов и сообщения в примерах "
                    "заменены."
                ),
                "tags": [],
            },
            {
                "kicker": "",
                "eyebrow": "About the project",
                "title": "Orders arrived as photographs. The work after that was manual.",
                "body": (
                    "Zagorulko assigns staff to field orders for a large organisation. In the evening, a "
                    "photograph of an order table arrives and needs to be copied into MAX. By midday, the "
                    "available roster is known and crews need to be assembled. Every two weeks, someone has "
                    "to go back through the chats to prepare the calculations.\n\nWe built three tools for "
                    "these jobs. The first reads the photograph and prepares messages. The second proposes "
                    "crews using their history of working together. The third runs inside Google Sheets, "
                    "where the client already prepared the half-monthly figures.\n\nOperational data in this "
                    "case study has been deliberately anonymised and partly changed. Names, routes, order "
                    "numbers and messages in the examples have been replaced."
                ),
                "tags": [],
            },
            _settings("overview"),
        ),
        _block(
            "task-one",
            "challenge_solution",
            {
                "eyebrow": "От фотографии к сообщениям",
                "title": "",
                "challenge_label": "Как было",
                "challenge": (
                    "На одной фотографии сразу несколько заказов на завтра, у каждого из которых указаны "
                    "своё время, маршрут и количество людей. Чтобы подготовить задания, сотрудник увеличивал "
                    "таблицу, читал очередную строку и переключался в MAX, где набирал отдельное сообщение, "
                    "после чего возвращался к фотографии и повторял всё для следующего заказа. Только "
                    "разобрав таким образом всю таблицу, можно было вписать людей и разослать задания "
                    "участникам."
                ),
                "solution_label": "Что изменили",
                "solution": (
                    "Мы собрали приложение на основе Yandex Vision OCR, в которое сотрудник загружает "
                    "фотографию или PDF и получает отдельные заказы с редактируемыми полями. После проверки "
                    "и исправления спорных значений приложение отправляет подготовленные сообщения в "
                    "«Избранное» MAX, где с ними продолжают работать."
                ),
                "impact_label": "Что осталось человеку",
                "impact": (
                    "Каждый заказ остаётся отдельным сообщением, чтобы сотрудник мог вручную вписать "
                    "назначенных людей и переслать задание только тем, кто поедет на этот выезд."
                ),
            },
            {
                "eyebrow": "From a photograph to messages",
                "title": "",
                "challenge_label": "Before",
                "challenge": (
                    "One photograph contains several orders for the next day, each with its own time, route "
                    "and headcount. The operator used to enlarge the table, read a row, switch to MAX and "
                    "type a message, then return for the next row. Once the table was copied, they could add "
                    "names and send out the assignments."
                ),
                "solution_label": "What changed",
                "solution": (
                    "We built an application around Yandex Vision OCR. The operator uploads a photograph or "
                    "PDF, and the application extracts separate orders. These can be reviewed, corrected and "
                    "sent to MAX Saved Messages."
                ),
                "impact_label": "Human control",
                "impact": (
                    "The operator still adds staff names and forwards orders to the participants. That is "
                    "why each order needs its own message."
                ),
            },
            _settings("narrative", theme="soft"),
        ),
        _block(
            "source-photo",
            "image",
            {
                "image_url": "",
                "alt": "Обезличенная фотография исходной таблицы с заказами",
                "caption": (
                    "ФОТО 1 · ИСХОДНЫЙ ЗАКАЗ. Нужна специально подготовленная фотография таблицы с той же "
                    "плотностью записей и качеством снимка, с которыми сотрудник сталкивается в работе, но с "
                    "заменёнными именами, маршрутами, номерами заказов, данными агентов и примечаниями."
                ),
            },
            {
                "image_url": "",
                "alt": "An anonymised photograph of the source order table",
                "caption": (
                    "PHOTO 1 · SOURCE ORDER. Show the table as it normally arrives. Use a purpose-made copy with "
                    "names, routes, order numbers, agents and notes replaced while preserving the density and quality of the source."
                ),
            },
            _settings("default", theme="soft", width="wide"),
        ),
        _block(
            "technical-problem",
            "text",
            {
                "kicker": "",
                "eyebrow": "Главная техническая задача",
                "title": "",
                "body": (
                    "В такой таблице маршрут может занимать несколько строк, тогда как время помещается в "
                    "короткой ячейке рядом, поэтому прочитать текст ещё недостаточно, чтобы правильно "
                    "собрать заказ. OCR возвращает распознанные фрагменты, между которыми приложению нужно "
                    "восстановить связь с учётом объединённых ячеек, пропусков и возможных ошибок в "
                    "цифрах.\n\nДля этого мы написали парсер на Python, который по координатам текста "
                    "восстанавливает колонки, соединяет части маршрута и распределяет значения по полям "
                    "одного заказа. Типовые ошибки распознавания исправляет код, а сомнительные значения "
                    "остаются доступными для проверки по исходному изображению, чтобы сотрудник мог уточнить "
                    "их до отправки сообщения."
                ),
                "tags": [],
            },
            {
                "kicker": "",
                "eyebrow": "The main technical challenge",
                "title": "",
                "body": (
                    "In these tables, a route can span several lines while its time occupies one small cell "
                    "beside it. OCR can read both fragments; the application still has to establish that "
                    "they belong to the same order. Photographs also introduce merged cells, gaps and "
                    "misread digits.\n\nThat is where our parser comes in. It uses the text coordinates to "
                    "reconstruct columns, join route fragments and fill the order fields. Code handles "
                    "recurring recognition errors; the operator checks uncertain values against the source "
                    "image."
                ),
                "tags": [],
            },
            _settings("editorial"),
        ),
        _block(
            "recognition-flow",
            "process",
            {
                "eyebrow": "Как работает приложение",
                "title": "",
                "summary": (
                    "Сотрудник загружает полученную таблицу, сверяет распознанные заказы с фотографией и "
                    "после проверки отправляет подготовленные сообщения в MAX, не перепечатывая их заново."
                ),
                "items": [
                    {
                        "title": "Загрузить таблицу и разобрать заказы",
                        "description": (
                            "Сотрудник загружает фотографию или PDF, который уже прислали заказчику, после чего "
                            "приложение подготавливает изображение с помощью Pillow и отправляет его в Yandex Vision "
                            "OCR. Библиотека отвечает за размер и контраст изображения, а сервис распознавания "
                            "возвращает текст вместе с координатами, по которым можно восстановить расположение "
                            "записей в таблице.\n\nНаш Python-парсер собирает строки и связывает время, маршрут и "
                            "количество людей с нужным заказом, учитывая, что длинный маршрут может продолжаться в "
                            "соседней строке и не должен становиться отдельной записью. После обработки сотрудник "
                            "видит список заказов с редактируемыми полями, которые можно сверить с фотографией."
                        ),
                        "media_type": "video",
                        "media_note": (
                            "В видео продолжительностью 10–15 секунд показать загрузку обезличенной таблицы и "
                            "появление отдельных заказов после распознавания, а в конце открыть одну запись, чтобы "
                            "были видны время, маршрут и количество людей."
                        ),
                        "image_url": "",
                        "image_alt": "",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["Pillow", "Yandex Vision OCR", "Python parser"],
                    },
                    {
                        "title": "Сверить заказ с фотографией",
                        "description": (
                            "Если на фотографии плохо читается цифра или часть адреса, сотрудник может проверить её "
                            "по исходному фрагменту, который мы оставили рядом с полями заказа. Такое расположение "
                            "позволяет последовательно сверить время, весь маршрут и количество людей, не удерживая "
                            "значения в памяти и не переключаясь между окнами.\n\nИсправления вносятся прямо в запись, "
                            "поэтому из-за одной неверно распознанной ячейки не приходится заново набирать сообщение "
                            "целиком. Когда сотрудник заканчивает проверку, приложение использует уточнённые "
                            "значения при подготовке черновика в MAX."
                        ),
                        "media_type": "image",
                        "media_note": (
                            "Показать экран проверки одного заказа, на котором исходный фрагмент расположен рядом с "
                            "редактируемыми полями, предварительно заменив все значения на обезличенные."
                        ),
                        "image_url": "",
                        "image_alt": "Экран ручной проверки распознанного заказа",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["Human review", "Editable fields"],
                    },
                    {
                        "title": "Отправить черновики в «Избранное» MAX",
                        "description": (
                            "Заказы нужны именно в MAX, потому что там сотрудник дополняет их именами и пересылает "
                            "участникам, поэтому мы добавили отправку сообщений непосредственно из приложения. После "
                            "проверки оно собирает отдельный черновик для каждого заказа и передаёт его в "
                            "«Избранное» через GREEN-API, избавляя сотрудника от копирования текста из "
                            "промежуточного файла.\n\nВ сообщении уже указаны время, маршрут и необходимое количество "
                            "людей, так что сотруднику остаётся дописать состав и переслать задание тем, кто поедет "
                            "на выезд. Остальные заказы можно готовить независимо, поскольку каждый из них хранится "
                            "в собственном сообщении и не связан с редактированием всей таблицы."
                        ),
                        "media_type": "video",
                        "media_note": "Переход от подтверждённого заказа к нескольким отдельным черновикам в MAX без реальных имён и номеров.",
                        "image_url": "",
                        "image_alt": "",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["GREEN-API", "MAX"],
                    },
                ],
            },
            {
                "eyebrow": "How the application works",
                "title": "",
                "summary": (
                    "The evening task has three steps in the application: upload the table, review the "
                    "orders and prepare the messages."
                ),
                "items": [
                    {
                        "title": "Upload the table and extract the orders",
                        "description": (
                            "We start with the file the client already receives. The operator uploads a photograph "
                            "or PDF, and the application prepares the image for Yandex Vision OCR. Pillow handles "
                            "size and contrast. The service returns recognised text with coordinates, giving us the "
                            "information needed to reconstruct the table.\n\nOur Python parser then assembles the rows "
                            "and matches each time, route and headcount to its order. A route continuing onto "
                            "another line must not create an extra record. The operator gets a list of orders with "
                            "editable fields in place of the original photograph."
                        ),
                        "media_type": "video",
                        "media_note": "A 10–15 second video: anonymised source table, file upload, recognition and separate orders appearing. End by opening a record with its time, route and headcount visible.",
                        "image_url": "",
                        "image_alt": "",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["Pillow", "Yandex Vision OCR", "Python parser"],
                    },
                    {
                        "title": "Check each order against the photograph",
                        "description": (
                            "A digit or part of an address may be hard to read in the photograph. We kept the source "
                            "fragment beside the order fields, so the operator does not have to remember the image "
                            "or switch between windows. They can check the time, read the complete route and correct "
                            "the headcount here.\n\nEdits go straight into the record. One misread cell does not mean "
                            "typing the message again. Once the review is finished, the application uses these "
                            "values for the MAX draft."
                        ),
                        "media_type": "image",
                        "media_note": "A review screen with the source fragment and editable fields side by side, fully anonymised.",
                        "image_url": "",
                        "image_alt": "Manual review of a recognised order",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["Human review", "Editable fields"],
                    },
                    {
                        "title": "Send drafts to MAX Saved Messages",
                        "description": (
                            "The orders belong in MAX because that is where names are added and assignments are "
                            "forwarded. Ending with a file export would leave another round of copying to the "
                            "operator. Instead, the application creates a separate message for each order and sends "
                            "it to Saved Messages through GREEN-API.\n\nThe time, route and required headcount are "
                            "already there. The operator adds the crew and forwards the order to the people "
                            "attending. Other messages can be prepared independently; the whole table does not "
                            "become one long piece of text."
                        ),
                        "media_type": "video",
                        "media_note": "A transition from a confirmed order to several separate MAX drafts with all identifiers replaced.",
                        "image_url": "",
                        "image_alt": "",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["GREEN-API", "MAX"],
                    },
                ],
            },
            _settings(
                "chapter",
                theme="soft",
                disclosure_mode="multiple",
                open_first=True,
            ),
        ),
        _block(
            "recognition-media-pair",
            "comparison",
            {
                "eyebrow": "",
                "title": "",
                "before_media_type": "video",
                "before_url": "",
                "before_video_url": "",
                "before_poster_url": "",
                "before_alt": "Обезличенный процесс распознавания заказов",
                "before_label": (
                    "ВИДЕО · ПРОЦЕСС РАСПОЗНАВАНИЯ. В коротком зацикленном ролике на 6–10 секунд показать "
                    "загрузку фотографии, появление отдельных заказов после распознавания и открытие одной "
                    "записи для проверки."
                ),
                "after_media_type": "image",
                "after_url": "",
                "after_video_url": "",
                "after_poster_url": "",
                "after_alt": "Обезличенные сообщения с заказами в MAX",
                "after_label": (
                    "ФОТО · РЕЗУЛЬТАТ. Показать два или три сообщения в «Избранном» MAX, в которых читаются "
                    "время, маршрут и количество сотрудников, предварительно заменив все идентификаторы."
                ),
                "autoplay": True,
                "loop": True,
                "muted": True,
                "controls": False,
            },
            {
                "eyebrow": "",
                "title": "",
                "before_media_type": "video",
                "before_url": "",
                "before_video_url": "",
                "before_poster_url": "",
                "before_alt": "An anonymised order-recognition flow",
                "before_label": (
                    "VIDEO · RECOGNITION FLOW. A short 6–10 second loop showing image upload, recognition, "
                    "separate orders appearing and one record opening for review."
                ),
                "after_media_type": "image",
                "after_url": "",
                "after_video_url": "",
                "after_poster_url": "",
                "after_alt": "Anonymised order messages in MAX",
                "after_label": (
                    "PHOTO · RESULT. Two or three MAX Saved Messages with time, route and headcount visible. "
                    "Replace every name, phone number, order number and identifier."
                ),
                "autoplay": True,
                "loop": True,
                "muted": True,
                "controls": False,
            },
            _settings(
                "side-by-side",
                theme="soft",
                media_aspect="portrait",
                caption_position="below",
            ),
        ),
        _block(
            "result",
            "results",
            {
                "kicker": "",
                "eyebrow": "Что получилось",
                "title": "",
                "body": (
                    "Теперь сотрудник начинает вечерний разбор с загрузки файла и к моменту назначения людей "
                    "уже получает основу сообщений, которую раньше приходилось вручную переписывать с "
                    "фотографии."
                ),
                "tags": [],
                "items": [
                    {
                        "text": "Каждый заказ приходит в MAX отдельным сообщением, которое удобно дополнить и переслать."
                    },
                    {
                        "text": (
                            "Время, маршрут и количество людей переносятся с фотографии в поля заказа без повторного "
                            "набора."
                        )
                    },
                    {
                        "text": "Ошибки распознавания можно исправить в приложении, пока заказ ещё не передан в чат."
                    },
                    {
                        "text": (
                            "Когда состав на выезд определён, сотрудник сам добавляет имена участников в "
                            "подготовленное сообщение."
                        )
                    },
                ],
                "link_url": "",
                "link_label": "",
            },
            {
                "kicker": "",
                "eyebrow": "Outcome",
                "title": "",
                "body": (
                    "The evening task now starts with a file upload. By the time staff need to be assigned, "
                    "the message drafts are ready."
                ),
                "tags": [],
                "items": [
                    {
                        "text": "Each order arrives in MAX as a separate message, ready to complete and forward."
                    },
                    {
                        "text": "Time, route and headcount no longer need to be retyped from the photograph."
                    },
                    {
                        "text": "Recognition errors can be corrected in the application before anything goes to the chat."
                    },
                    {
                        "text": "The operator adds participants once the crew for that order is decided."
                    },
                ],
                "link_url": "",
                "link_label": "",
            },
            _settings("statement"),
        ),
        _block(
            "stack",
            "technologies",
            {
                "eyebrow": "Стек первой задачи",
                "title": "От фотографии до сообщения в MAX",
                "summary": (
                    "Yandex Vision OCR читает изображение, после чего Python собирает заказы, Flask "
                    "показывает их для проверки, а GREEN-API передаёт подготовленные сообщения в MAX."
                ),
                "items": [
                    {"x": 10.0, "y": 22.0, "label": "Yandex Vision OCR", "category": "recognition"},
                    {"x": 35.0, "y": 10.0, "label": "Python", "category": "logic"},
                    {"x": 60.0, "y": 23.0, "label": "Flask", "category": "backend"},
                    {"x": 84.0, "y": 12.0, "label": "Pillow", "category": "image"},
                    {
                        "x": 17.0,
                        "y": 72.0,
                        "label": "HTML / CSS / JavaScript",
                        "category": "interface",
                    },
                    {"x": 46.0, "y": 84.0, "label": "GREEN-API", "category": "MAX"},
                    {"x": 73.0, "y": 70.0, "label": "Object Storage", "category": "sync"},
                    {"x": 91.0, "y": 86.0, "label": "Docker / Gunicorn", "category": "runtime"},
                ],
            },
            {
                "eyebrow": "Stack for the first task",
                "title": "From a photograph to a MAX message",
                "summary": (
                    "Yandex Vision OCR reads the image. Python assembles the orders, Flask serves the review "
                    "screen, and GREEN-API delivers the MAX messages."
                ),
                "items": [
                    {"x": 10.0, "y": 22.0, "label": "Yandex Vision OCR", "category": "recognition"},
                    {"x": 35.0, "y": 10.0, "label": "Python", "category": "logic"},
                    {"x": 60.0, "y": 23.0, "label": "Flask", "category": "backend"},
                    {"x": 84.0, "y": 12.0, "label": "Pillow", "category": "image"},
                    {
                        "x": 17.0,
                        "y": 72.0,
                        "label": "HTML / CSS / JavaScript",
                        "category": "interface",
                    },
                    {"x": 46.0, "y": 84.0, "label": "GREEN-API", "category": "MAX"},
                    {"x": 73.0, "y": 70.0, "label": "Object Storage", "category": "sync"},
                    {"x": 91.0, "y": 86.0, "label": "Docker / Gunicorn", "category": "runtime"},
                ],
            },
            _settings("map"),
        ),
        _block(
            "crew-task",
            "challenge_solution",
            {
                "eyebrow": "Вторая задача",
                "title": "",
                "challenge_label": "Почему вручную сложно",
                "challenge": (
                    "В середине дня нужно распределить 50–60 человек по бригадам из четырёх, причём список "
                    "каждый раз меняется и вчерашние составы подходят лишь частично. Приходится заново "
                    "вспоминать, кто с кем сработался, кому нужен другой бригадир и какие сочетания лучше не "
                    "повторять, одновременно учитывая рост, комплекцию и внешние признаки сотрудников."
                ),
                "solution_label": "Что сделали",
                "solution": (
                    "Для этой задачи мы написали программу, которая сопоставляет сегодняшний список с "
                    "карточками сотрудников, заданными правилами и историей подтверждённых составов, а затем "
                    "сравнивает возможные сочетания и предлагает бригады."
                ),
                "impact_label": "Контроль остаётся у человека",
                "impact": (
                    "Предложенные бригады можно изменить в интерфейсе, перетащив сотрудника в другой состав, "
                    "а после проверки сохранить подтверждённый результат в историю для следующих расчётов."
                ),
            },
            {
                "eyebrow": "The second task",
                "title": "",
                "challenge_label": "Why manual assignment is difficult",
                "challenge": (
                    "Around midday, 50–60 people need to be divided into four-person crews. The roster "
                    "changes each time, so yesterday's groups are only partly useful. Someone has to recall "
                    "who works well together, who needs a different leader and which combinations should not "
                    "be repeated. Height, build and appearance also need to be considered."
                ),
                "solution_label": "What we built",
                "solution": (
                    "We wrote a crew-assignment program for this job. It takes today's roster, employee "
                    "profiles, explicit rules and confirmed crew history, then compares combinations and "
                    "proposes an assignment."
                ),
                "impact_label": "Human control remains",
                "impact": (
                    "Crews can be edited in the interface, including by dragging an employee into another "
                    "group. The confirmed result is saved to history."
                ),
            },
            _settings("narrative", theme="soft"),
        ),
        _block(
            "crew-input",
            "video",
            {
                "eyebrow": "",
                "title": "",
                "video_url": "/cases/gbu-process-automation/crew-network-graph.mp4",
                "poster_url": "/cases/gbu-process-automation/crew-network-graph-poster.jpg",
                "autoplay": True,
                "loop": True,
                "muted": True,
                "controls": False,
                "caption": (
                    "ВИДЕОВИЗУАЛИЗАЦИЯ · КАРТА СВЯЗЕЙ. Три бригадира показаны как опорные узлы, вокруг "
                    "которых расположены карточки сотрудников. Числа на линиях отражают накопленный вес "
                    "совместной работы и помогают показать, как алгоритм выделяет наиболее сильные связи при "
                    "подборе составов, при этом все имена, узлы и значения в ролике условны."
                ),
            },
            {
                "eyebrow": "",
                "title": "",
                "video_url": "/cases/gbu-process-automation/crew-network-graph.mp4",
                "poster_url": "/cases/gbu-process-automation/crew-network-graph-poster.jpg",
                "autoplay": True,
                "loop": True,
                "muted": True,
                "controls": False,
                "caption": (
                    "VIDEO VISUALISATION · RELATIONSHIP MAP. Three crew leaders act as anchor nodes, "
                    "while employees appear as individual cards. Numbers on the lines represent accumulated "
                    "collaboration weight; the algorithm highlights the largest values and assembles stable crews. "
                    "Every name, node and value in the video is illustrative."
                ),
            },
            _settings("default", width="wide"),
        ),
        _block(
            "crew-algorithm",
            "process",
            {
                "eyebrow": "Алгоритм внутри",
                "title": "",
                "summary": (
                    "Программа сопоставляет историю совместных выездов с правилами заказчика и постепенно "
                    "собирает составы, проверяя, как каждое назначение влияет на остальные бригады."
                ),
                "items": [
                    {
                        "title": "Разобрать список и выбрать бригадиров",
                        "description": (
                            "Поскольку доступный состав меняется каждый день, программа начинает с текущего списка и "
                            "находит карточку каждого сотрудника, приводя варианты написания имени к одной записи и "
                            "убирая повторы. Это помогает не принять сокращённое имя за нового человека и сохранить "
                            "связь с его предыдущими выездами.\n\nПри выборе бригадиров программа сначала обращается к "
                            "явным отметкам в карточках и учитывает заданные приоритеты и иерархию, чтобы опираться "
                            "на подтверждённые роли. Если таких людей не хватает, она проверяет, кто уже выступал "
                            "бригадиром в прошлых составах, и использует эту историю для выбора оставшихся лидеров, "
                            "вокруг которых будут собираться группы."
                        ),
                        "media_type": "image",
                        "media_note": (
                            "Показать обезличенный фрагмент дневного списка с несколькими сотрудниками и тремя "
                            "отмеченными бригадирами, дополнив его атрибутами одной карточки и явно обозначив, что "
                            "это лишь пример, а не весь список из 50–60 человек."
                        ),
                        "image_url": "",
                        "image_alt": "Обезличенный список сотрудников и бригадиров",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["Roster", "Aliases", "Leader rules"],
                    },
                    {
                        "title": "Оценить, кто с кем сработался",
                        "description": (
                            "Историю выездов мы представили в виде взвешенного графа, где каждый сотрудник "
                            "становится узлом, а совместная работа образует связи между людьми. При расчёте отдельно "
                            "учитываются пары, устойчивые тройки и четвёрки, а также опыт с конкретным бригадиром, "
                            "поэтому накопленная история влияет на оценку сразу на нескольких уровнях.\n\nДавние "
                            "выезды постепенно теряют вес, чтобы одна удачная бригада из прошлого не определяла "
                            "подбор для любого нового списка, а заданные правила совместимости дополняют "
                            "исторические данные. Полученные числа позволяют сравнивать варианты между собой, но не "
                            "выражают вероятность успеха и не гарантируют, что выбранные люди обязательно "
                            "сработаются."
                        ),
                        "media_type": "video",
                        "media_note": (
                            "В анимации показать трёх бригадиров и плашки сотрудников, между которыми появляются "
                            "числовые веса связей, после чего наиболее сильные связи выделяются при выборе составов."
                        ),
                        "image_url": "",
                        "image_alt": "",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "full",
                        "tags": ["Weighted graph", "Time decay"],
                    },
                    {
                        "title": "Собрать первые составы",
                        "description": (
                            "Если полностью укомплектовать одну бригаду до перехода к следующей, ей достанутся самые "
                            "подходящие люди, тогда как остальные придётся собирать из оставшихся кандидатов. "
                            "Поэтому мы используем подбор по кругу, при котором каждая группа получает очередного "
                            "сотрудника и только после этого очередь возвращается к первой бригаде.\n\nКаждый кандидат "
                            "оценивается по связям со всем составом, включая опыт работы с бригадиром, ограничения "
                            "на пары и разброс роста, который при превышении допустимого значения снижает оценку. "
                            "Комплекция и внешние признаки помогают выбрать между близкими по основному баллу "
                            "вариантами, после чего полученные бригады по четыре человека переходят к проверке "
                            "перестановками."
                        ),
                        "media_type": "image",
                        "media_note": "Промежуточный экран с тремя предложенными бригадами, общей оценкой и понятными причинами спорных назначений.",
                        "image_url": "",
                        "image_alt": "Промежуточная автоматическая разбивка на бригады",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["Greedy pass", "Crew score", "Constraints"],
                    },
                    {
                        "title": "Проверить перестановки и выбрать расклад",
                        "description": (
                            "После первой сборки программа пробует менять людей местами между бригадами или заменять "
                            "участника тем, кто пока остался без назначения, сохраняя перестановку, если она "
                            "улучшает общую оценку. При этом сравнивается весь расклад, поскольку удачный обмен "
                            "должен помогать распределению в целом, а не только одной группе.\n\nЧтобы проверить "
                            "больше вариантов, алгоритм выполняет 40 воспроизводимых перестроений и после каждого "
                            "снова ищет улучшения с помощью обменов. Из найденных решений он сохраняет лучшее и "
                            "проверяет, что каждый человек либо назначен в одну бригаду, либо остался в отдельном "
                            "списке без назначения.\n\nПолученный расклад сотрудник просматривает в интерфейсе и при "
                            "необходимости вручную перетаскивает людей между группами с учётом обстоятельств "
                            "конкретного дня, после чего подтверждённые составы пополняют историю выездов."
                        ),
                        "media_type": "video",
                        "media_note": (
                            "В ролике показать, как программа перестраивает варианты и повышает итоговую оценку, "
                            "после чего фиксирует три готовые бригады и список людей без назначения."
                        ),
                        "image_url": "",
                        "image_alt": "",
                        "video_url": "",
                        "poster_url": "",
                        "tags": ["Local search", "40 perturbations"],
                    },
                ],
            },
            {
                "eyebrow": "Inside the algorithm",
                "title": "",
                "summary": (
                    "Assignment uses shared work history and the client's rules. These four steps explain "
                    "how the proposed crews are formed."
                ),
                "items": [
                    {
                        "title": "Read the roster and choose the leaders",
                        "description": (
                            "The people available today may not be available tomorrow. The program first reads the "
                            "current roster and finds each employee's profile. Name variants are mapped to one "
                            "record and duplicates removed. Otherwise, an abbreviation could be mistaken for a new "
                            "person with no work history.\n\nNext come the leaders. People explicitly marked in their "
                            "profiles take precedence, following priority and hierarchy rules. A person's past "
                            "leadership role is only used when there are too few confirmed leaders. These are the "
                            "people around whom the crews will form."
                        ),
                        "media_type": "image",
                        "media_note": "An anonymised excerpt of the daily roster with several employees and three example leaders, plus one profile's attributes. Clearly present it as an excerpt, not the full 50–60-person roster.",
                        "image_url": "",
                        "image_alt": "An anonymised employee and crew-leader roster",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["Roster", "Aliases", "Leader rules"],
                    },
                    {
                        "title": "Score experience working together",
                        "description": (
                            "We represented shared work history as a weighted graph. Employees are its nodes, and "
                            "their work together creates the edges. Stronger historical evidence contributes more to "
                            "the score. Pairs, stable triples, four-person groups and experience with a particular "
                            "leader are counted separately.\n\nTime matters too: older jobs gradually lose weight, so "
                            "one successful crew from the past does not become the answer to every new roster. "
                            "Explicit compatibility rules are added to the history. Graph weights compare "
                            "alternatives; they are not percentages or promises that a group will work well together."
                        ),
                        "media_type": "video",
                        "media_note": "An animated graph with three leaders, employee cards, numeric edge weights and the strongest relationships being selected.",
                        "image_url": "",
                        "image_alt": "",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "full",
                        "tags": ["Weighted graph", "Time decay"],
                    },
                    {
                        "title": "Assemble the first crews",
                        "description": (
                            "Filling one crew completely before starting the next would give it the best-matched "
                            "people and leave the rest to work with whoever remained. We assign in rounds: each "
                            "group takes its next candidate before the turn returns to the first.\n\nA candidate is "
                            "scored against the whole crew. The calculation considers experience with the leader, "
                            "pair restrictions and height spread. An excessive spread reduces the score. Build and "
                            "appearance help distinguish alternatives with similar primary scores. This produces the "
                            "first four-person crews, ready to be tested through swaps."
                        ),
                        "media_type": "image",
                        "media_note": "An intermediate result with three proposed crews, total scores and clear reasons for disputed assignments.",
                        "image_url": "",
                        "image_alt": "An intermediate automatic crew assignment",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["Greedy pass", "Crew score", "Constraints"],
                    },
                    {
                        "title": "Test swaps and choose an assignment",
                        "description": (
                            "After the first pass, the program swaps people and compares the total score. A swap may "
                            "involve two crews, or a crew and someone who is still unassigned. Changes that improve "
                            "the result are retained.\n\nThe search goes further than these exchanges. The algorithm "
                            "makes 40 reproducible perturbations and looks for improvements after each one. It keeps "
                            "the best result found, then checks that nobody has been lost or assigned twice.\n\nThe "
                            "operator can now review the assignment in the interface. If today's circumstances "
                            "require a different crew, they can drag people between groups. Only the confirmed "
                            "assignment becomes part of the history."
                        ),
                        "media_type": "video",
                        "media_note": "A calculation clip in which alternatives change, the score improves and three final crews plus extras are fixed.",
                        "image_url": "",
                        "image_alt": "",
                        "video_url": "",
                        "poster_url": "",
                        "tags": ["Local search", "40 perturbations"],
                    },
                ],
            },
            _settings(
                "chapter",
                theme="soft",
                disclosure_mode="multiple",
                open_first=True,
            ),
        ),
        _block(
            "crew-media-pair",
            "comparison",
            {
                "eyebrow": "",
                "title": "",
                "before_media_type": "video",
                "before_url": "",
                "before_video_url": "",
                "before_poster_url": "",
                "before_alt": "Обезличенный процесс автоматической разбивки на бригады",
                "before_label": (
                    "ВИДЕО · АВТОМАТИЧЕСКАЯ РАЗБИВКА. В ролике на 8–12 секунд показать загрузку списка и "
                    "выбор размера бригады, после которых запускается расчёт и появляются предложенные "
                    "составы."
                ),
                "after_media_type": "image",
                "after_url": "",
                "after_video_url": "",
                "after_poster_url": "",
                "after_alt": "Обезличенный результат автоматической разбивки на бригады",
                "after_label": (
                    "ФОТО · ГОТОВЫЕ БРИГАДЫ. Показать несколько составов по четыре человека с отмеченными "
                    "ролями бригадиров и спорными назначениями, дополнив экран отдельным списком людей без "
                    "назначения, если он есть."
                ),
                "autoplay": True,
                "loop": True,
                "muted": True,
                "controls": False,
            },
            {
                "eyebrow": "",
                "title": "",
                "before_media_type": "video",
                "before_url": "",
                "before_video_url": "",
                "before_poster_url": "",
                "before_alt": "An anonymised automatic crew-assignment flow",
                "before_label": (
                    "VIDEO · AUTOMATIC ASSIGNMENT. An 8–12 second clip showing roster upload, crew-size "
                    "selection, calculation and the proposed crews appearing."
                ),
                "after_media_type": "image",
                "after_url": "",
                "after_video_url": "",
                "after_poster_url": "",
                "after_alt": "An anonymised automatic crew-assignment result",
                "after_label": (
                    "PHOTO · PROPOSED CREWS. Several four-person crews, leader roles, disputed assignments "
                    "and a separate extras list when necessary."
                ),
                "autoplay": True,
                "loop": True,
                "muted": True,
                "controls": False,
            },
            _settings(
                "side-by-side",
                theme="soft",
                media_aspect="portrait",
                caption_position="below",
            ),
        ),
        _block(
            "crew-result",
            "results",
            {
                "kicker": "",
                "eyebrow": "Результат второй задачи",
                "title": "",
                "body": (
                    "Получив предложенные бригады по четыре человека и список людей без назначения, "
                    "сотрудник может сразу перейти к спорным сочетаниям и необходимым перестановкам, вместо "
                    "того чтобы каждый раз собирать все составы заново."
                ),
                "tags": [],
                "items": [
                    {"text": "У каждой бригады есть опорный бригадир."},
                    {"text": "При подборе учитываются совместные выезды и заданные ограничения."},
                    {"text": "Слабые связи и почти равнозначные варианты отмечаются для проверки."},
                    {
                        "text": "Подтверждённые составы пополняют историю, на которую опираются следующие расчёты."
                    },
                ],
                "link_url": "",
                "link_label": "",
            },
            {
                "kicker": "",
                "eyebrow": "Outcome of the second task",
                "title": "",
                "body": (
                    "The operator receives four-person crews and a list of people not yet assigned. They can "
                    "go straight to the disputed choices and adjust the groups instead of starting with a "
                    "blank roster."
                ),
                "tags": [],
                "items": [
                    {"text": "Each crew has an anchor leader."},
                    {
                        "text": "Assignment takes shared work history and explicit constraints into account."
                    },
                    {
                        "text": "Weak relationships and nearly equal alternatives are flagged for review."
                    },
                    {
                        "text": "Confirmed crews become part of the history used in future calculations."
                    },
                ],
                "link_url": "",
                "link_label": "",
            },
            _settings("statement"),
        ),
        _block(
            "crew-stack",
            "technologies",
            {
                "eyebrow": "Стек второй задачи",
                "title": "Подбор бригад на Python",
                "summary": (
                    "Расчёт, правила и история составов отделены от интерфейса, в котором сотрудник "
                    "пересчитывает расклад, вносит изменения и сохраняет подтверждённые бригады."
                ),
                "items": [
                    {"x": 10.0, "y": 24.0, "label": "Python", "category": "solver"},
                    {"x": 39.0, "y": 10.0, "label": "Flask", "category": "API"},
                    {
                        "x": 84.0,
                        "y": 22.0,
                        "label": "HTML / CSS / JavaScript",
                        "category": "interface",
                    },
                    {"x": 17.0, "y": 76.0, "label": "JSON history", "category": "data"},
                    {"x": 59.0, "y": 87.0, "label": "Object Storage", "category": "sync"},
                    {"x": 90.0, "y": 74.0, "label": "Docker / Gunicorn", "category": "runtime"},
                ],
            },
            {
                "eyebrow": "Stack for the second task",
                "title": "Crew assignment in Python",
                "summary": (
                    "The calculation, rules and crew history are separate from the interface. The operator "
                    "can rerun an assignment, edit it and save the confirmed crews."
                ),
                "items": [
                    {"x": 10.0, "y": 24.0, "label": "Python", "category": "solver"},
                    {"x": 39.0, "y": 10.0, "label": "Flask", "category": "API"},
                    {
                        "x": 84.0,
                        "y": 22.0,
                        "label": "HTML / CSS / JavaScript",
                        "category": "interface",
                    },
                    {"x": 17.0, "y": 76.0, "label": "JSON history", "category": "data"},
                    {"x": 59.0, "y": 87.0, "label": "Object Storage", "category": "sync"},
                    {"x": 90.0, "y": 74.0, "label": "Docker / Gunicorn", "category": "runtime"},
                ],
            },
            _settings("map"),
        ),
        _block(
            "task-three",
            "challenge_solution",
            {
                "eyebrow": "Третья задача",
                "title": "",
                "challenge_label": "Почему это занимало время",
                "challenge": (
                    "Через две недели те же заказы нужны уже для расчётов, поэтому раньше сотруднику "
                    "приходилось открывать два чата MAX, искать заполненные сообщения, считать выезды по "
                    "категориям и разносить начисления по людям. За это время заказ мог измениться или "
                    "исчезнуть из переписки, поэтому перед подсчётом нужно было разобраться, какая версия "
                    "остаётся актуальной и кого в итоге назначили на выезд."
                ),
                "solution_label": "Что сделали",
                "solution": (
                    "Поскольку заказчик уже вёл расчёты в Google Таблицах, мы добавили команду в их меню и "
                    "написали Google Apps Script, который через GREEN-API загружает обе истории MAX, сверяет "
                    "заказы и заполняет листы за нужную половину месяца."
                ),
                "impact_label": "Проверка остаётся видимой",
                "impact": (
                    "После обновления сотрудник разбирает отдельно показанные исключения, например "
                    "заполненный заказ, для которого в контрольном чате не нашлось исходной заявки."
                ),
            },
            {
                "eyebrow": "The third task",
                "title": "",
                "challenge_label": "Why it took so long",
                "challenge": (
                    "Two weeks later, the same orders are needed for the calculations. The operator had to "
                    "open two MAX chats, find completed orders, count them by category and allocate accruals "
                    "to staff. An order might have been revised or deleted along the way, so simply counting "
                    "messages was not enough."
                ),
                "solution_label": "What we built",
                "solution": (
                    "This job did not need a separate application. We added a command to the Google Sheet "
                    "menu and wrote a Google Apps Script. It loads both histories through GREEN-API, "
                    "reconciles the orders and fills the sheets for the relevant half-month."
                ),
                "impact_label": "Validation remains visible",
                "impact": (
                    "The operator reviews the exceptions, such as a completed order with no matching "
                    "original request."
                ),
            },
            _settings("narrative", theme="soft"),
        ),
        _block(
            "finance-input",
            "image",
            {
                "image_url": "",
                "alt": "Обезличенные контрольная и заполненная версии заказа в MAX",
                "caption": (
                    "ФОТО 6 · ИСХОДНЫЕ СООБЩЕНИЯ. Нужен обезличенный монтаж из двух сообщений одного заказа, "
                    "на котором контрольная версия без людей расположена рядом с заполненной версией со "
                    "списком участников. Сохранить структуру сообщения с датой, категорией и количеством "
                    "мест, заменив имена, маршруты, ссылки, идентификаторы и рабочие примечания."
                ),
            },
            {
                "image_url": "",
                "alt": "Anonymised control and completed versions of one MAX order",
                "caption": (
                    "PHOTO 6 · SOURCE MESSAGES. Show two anonymised messages for the same order: a control "
                    "version without people and a completed version with participants. Preserve the date, "
                    "category, seat count and message structure; replace names, routes, links, identifiers "
                    "and operational notes."
                ),
            },
            _settings("default", theme="soft", width="wide"),
        ),
        _block(
            "finance-flow",
            "process",
            {
                "eyebrow": "Как собирается отчёт",
                "title": "",
                "summary": (
                    "Для расчёта скрипт сопоставляет исходные заказы из одного чата MAX с сообщениями о "
                    "назначенных людях из другого, чтобы проверить составы и учесть выезды за один и тот же "
                    "период."
                ),
                "items": [
                    {
                        "title": "Загрузить сообщения за полмесяца",
                        "description": (
                            "Когда сотрудник запускает обновление из меню Google Таблицы, Apps Script обращается к "
                            "GREEN-API и последовательно получает истории двух рабочих чатов. Контрольные заказы из "
                            "одного чата сопоставляются с заполненными сообщениями из другого, чтобы при дальнейшей "
                            "проверке было известно, сколько людей требовалось на выезд и кто был назначен.\n\nПо "
                            "датам сообщений скрипт определяет половину месяца, за которую ведётся расчёт, с 1-го по "
                            "15-е число либо с 16-го по последний день месяца. Прежде чем сопоставлять заказы, он "
                            "проверяет, что обе истории относятся к этому периоду и в расчёт не попадут записи за "
                            "разные даты."
                        ),
                        "media_type": "video",
                        "media_note": (
                            "В коротком ролике показать выбор двух обезличенных историй MAX, по которым скрипт "
                            "определяет период, а затем отображает статус успешной загрузки."
                        ),
                        "image_url": "",
                        "image_alt": "",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["GREEN-API", "1–15 / 16–конец"],
                    },
                    {
                        "title": "Найти актуальные заказы и сверить людей",
                        "description": (
                            "Поскольку сообщение с заказом могут исправить, прислать повторно или удалить, парсер "
                            "извлекает дату, категорию, количество людей и имена участников с учётом этих изменений. "
                            "Среди повторных записей он оставляет последнюю версию, а удалённые сообщения исключает "
                            "до подсчёта, чтобы один выезд не оказался в расчёте несколько раз.\n\nЗатем скрипт "
                            "сравнивает заполненный заказ с исходным и проверяет, указаны ли все участники, "
                            "совпадает ли количество мест и существует ли контрольная заявка. Если такой заявки нет, "
                            "заказ получает отдельный статус и не участвует в начислениях, пока сотрудник не "
                            "разберётся с расхождением.\n\nПосле сверки скрипт группирует заказы по дням и категориям, "
                            "распределяет начисления между бригадиром и участниками с учётом предусмотренных "
                            "коэффициентов, а найденные расхождения собирает отдельно для проверки в таблице."
                        ),
                        "media_type": "video",
                        "media_note": (
                            "В видео продолжительностью 12–18 секунд показать на условных данных, как из нескольких "
                            "версий заказа выбирается актуальная и сравнивается с контрольной, после чего появляется "
                            "предупреждение о недостающем участнике и рассчитываются итоги по дням."
                        ),
                        "image_url": "",
                        "image_alt": "",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["Latest version", "Reconciliation", "Accruals"],
                    },
                    {
                        "title": "Заполнить таблицу и показать расхождения",
                        "description": (
                            "Скрипт записывает показатели на лист периода и обновляет контрольный лист заказов "
                            "вместе с сервисной сводкой, в которой спорные позиции видны отдельно. Сотрудник может "
                            "перейти к конкретному расхождению и проверить вызвавший его заказ, не перечитывая ради "
                            "этого всю историю сообщений.\n\nПри повторном запуске обновляются только расчётные блоки, "
                            "поэтому ручные поля за их пределами сохраняются, а блокировка одновременных запусков не "
                            "позволяет нескольким обновлениям вмешиваться друг в друга. Если во время записи "
                            "происходит ошибка, скрипт пытается вернуть изменённые диапазоны в прежнее состояние, "
                            "хотя такое восстановление не гарантирует защиты от любого сбоя."
                        ),
                        "media_type": "image",
                        "media_note": "Обезличенный итоговый лист Google Таблиц рядом со списком исключений; должны читаться структура периода и контрольные статусы.",
                        "image_url": "",
                        "image_alt": "Итоговый обезличенный отчёт и список исключений",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["Google Sheets", "Document lock"],
                    },
                ],
            },
            {
                "eyebrow": "How the report is assembled",
                "title": "",
                "summary": (
                    "The calculation needs both MAX histories: source orders and messages with assigned "
                    "staff. The script processes them together."
                ),
                "items": [
                    {
                        "title": "Load messages for the half-month",
                        "description": (
                            "The operator starts an update from the Google Sheet menu. Apps Script calls GREEN-API "
                            "and reads the two work-chat histories in sequence. One contains control orders; the "
                            "other contains completed messages with participants. Together they show how many people "
                            "were required and who was assigned.\n\nDates identify the reporting period: days 1–15 or "
                            "day 16 through the final day of the month. The script checks that both histories cover "
                            "the same half-month before matching orders. Otherwise, the calculation would be "
                            "comparing records from different reporting windows."
                        ),
                        "media_type": "video",
                        "media_note": "A short clip showing two anonymised MAX histories, period detection and a successful load state.",
                        "image_url": "",
                        "image_alt": "",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["GREEN-API", "1–15 / 16–month end"],
                    },
                    {
                        "title": "Find current orders and reconcile the crews",
                        "description": (
                            "One chat message does not necessarily mean one order. It may be corrected, resent or "
                            "deleted. The parser extracts the date, category, headcount and participants, keeping "
                            "the latest repeated version. Deleted entries are removed before counting begins.\n\nThe "
                            "completed order can then be checked against its source: are all participants listed, "
                            "does the headcount match, and is there a control order at all? An order without one "
                            "receives a separate status and is excluded from accruals.\n\nThe script groups orders by "
                            "day and category, allocates accruals across leaders and participants, and applies the "
                            "configured coefficients. Discrepancies are collected separately for the operator to "
                            "review in the sheet."
                        ),
                        "media_type": "video",
                        "media_note": "A 12–18 second video using illustrative data: repeated order versions become one current record, it is compared with the control order, a missing-participant warning appears and daily totals are calculated.",
                        "image_url": "",
                        "image_alt": "",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["Latest version", "Reconciliation", "Accruals"],
                    },
                    {
                        "title": "Fill the sheet and show discrepancies",
                        "description": (
                            "The script writes figures to the period sheet and updates the order-control sheet and "
                            "service summary. Disputed entries appear separately. The operator does not have to "
                            "reread the entire chat to investigate one of them: the relevant order is already "
                            "identified.\n\nRerunning changes only the calculation blocks; manual fields outside them "
                            "stay in place. We also added a lock against simultaneous runs. If a write fails, the "
                            "script attempts to restore the changed ranges. It cannot prevent every failure, but an "
                            "unfinished update should not silently pass for a complete report."
                        ),
                        "media_type": "image",
                        "media_note": "An anonymised final Google Sheet beside the exception list, with the period structure and validation statuses readable.",
                        "image_url": "",
                        "image_alt": "An anonymised final report and exception list",
                        "video_url": "",
                        "poster_url": "",
                        "media_size": "medium",
                        "tags": ["Google Sheets", "Document lock"],
                    },
                ],
            },
            _settings(
                "chapter",
                theme="soft",
                disclosure_mode="multiple",
                open_first=True,
            ),
        ),
        _block(
            "finance-system-map",
            "technologies",
            {
                "eyebrow": "Контур третьей задачи",
                "title": "MAX → сверка → Google Таблицы",
                "summary": (
                    "Скрипт сопоставляет исходные заказы с заполненными и после сверки записывает расчёт, "
                    "отдельно показывая расхождения, которые нужно проверить сотруднику."
                ),
                "items": [
                    {"x": 8.0, "y": 50.0, "label": "MAX", "category": "источник"},
                    {"x": 24.0, "y": 20.0, "label": "Два чата", "category": "история"},
                    {"x": 24.0, "y": 80.0, "label": "GREEN-API", "category": "загрузка"},
                    {"x": 50.0, "y": 8.0, "label": "Парсер сообщений", "category": "логика"},
                    {"x": 69.0, "y": 20.0, "label": "Контроль + факт", "category": "сверка"},
                    {"x": 69.0, "y": 80.0, "label": "Начисления", "category": "расчёт"},
                    {"x": 92.0, "y": 50.0, "label": "Google Sheets", "category": "результат"},
                ],
            },
            {
                "eyebrow": "Third-task system",
                "title": "MAX → reconciliation → Google Sheets",
                "summary": (
                    "The script matches source orders with completed ones before writing the calculations. "
                    "Discrepancies appear separately for review."
                ),
                "items": [
                    {"x": 8.0, "y": 50.0, "label": "MAX", "category": "source"},
                    {"x": 24.0, "y": 20.0, "label": "Two chats", "category": "history"},
                    {"x": 24.0, "y": 80.0, "label": "GREEN-API", "category": "import"},
                    {"x": 50.0, "y": 8.0, "label": "Message parser", "category": "logic"},
                    {"x": 69.0, "y": 20.0, "label": "Control + actual", "category": "validation"},
                    {"x": 69.0, "y": 80.0, "label": "Accruals", "category": "calculation"},
                    {"x": 92.0, "y": 50.0, "label": "Google Sheets", "category": "output"},
                ],
            },
            _settings(
                "map",
                map_accent="#8170F5",
                map_background="#F5F6FB",
                map_text="#17191F",
            ),
        ),
        _block(
            "finance-result-photo",
            "image",
            {
                "image_url": "",
                "alt": "Обезличенные расчётный и контрольный листы Google Таблицы",
                "caption": (
                    "ФОТО 7 · ГОТОВЫЙ ПЕРИОД. Нужен скриншот или аккуратный монтаж, на котором основной лист "
                    "с начислениями расположен рядом с контрольным листом с дневными количествами заказов и "
                    "сервисным статусом «ПРОВЕРКА ПРОЙДЕНА» либо блоком несовпадений. Перед съёмкой заменить "
                    "все имена, ссылки, суммы и идентификаторы."
                ),
            },
            {
                "image_url": "",
                "alt": "Anonymised calculation and control sheets in Google Sheets",
                "caption": (
                    "PHOTO 7 · COMPLETED PERIOD. Use a screenshot or a clean two-screen split: the main sheet "
                    "with accruals for anonymised staff and the control sheet with daily order counts. Include "
                    "the service status ‘VALIDATION PASSED’ or an exception block nearby. Replace every name, "
                    "link, amount and identifier."
                ),
            },
            _settings("default", theme="soft", width="wide"),
        ),
        _block(
            "finance-result",
            "results",
            {
                "kicker": "",
                "eyebrow": "Результат третьей задачи",
                "title": "",
                "body": (
                    "Сотрудник запускает расчёт за полмесяца из меню таблицы и получает показатели вместе с "
                    "контрольным листом, по которому можно проверить учтённые заказы и найти расхождения, "
                    "требующие ручного разбора."
                ),
                "tags": [],
                "items": [
                    {
                        "text": (
                            "Заказы из двух чатов MAX собраны за одну половину месяца, с 1-го по 15-е число либо с "
                            "16-го по последний день."
                        )
                    },
                    {
                        "text": (
                            "Из расчёта исключены удалённые сообщения и старые версии заказов, вместо которых учтены "
                            "актуальные записи."
                        )
                    },
                    {
                        "text": (
                            "Если у заказа нет исходной заявки, он получает отдельный статус и исключается из "
                            "начислений."
                        )
                    },
                    {
                        "text": (
                            "При повторном запуске обновляются расчётные блоки, а ручные поля за их пределами "
                            "сохраняются."
                        )
                    },
                ],
                "link_url": "",
                "link_label": "",
            },
            {
                "kicker": "",
                "eyebrow": "Outcome of the third task",
                "title": "",
                "body": (
                    "The half-monthly calculation now starts from the sheet menu. A control sheet sits "
                    "alongside the figures, showing which orders were counted and which need a closer look."
                ),
                "tags": [],
                "items": [
                    {
                        "text": "Orders from both MAX chats cover one period: days 1–15 or day 16 through month end."
                    },
                    {
                        "text": "Deleted messages and old order versions are excluded from the calculation."
                    },
                    {
                        "text": "An order without a source request gets a separate status and no accrual."
                    },
                    {
                        "text": "Rerunning updates the calculation blocks and preserves manual fields outside them."
                    },
                ],
                "link_url": "",
                "link_label": "",
            },
            _settings("statement"),
        ),
        _block(
            "finance-stack",
            "technologies",
            {
                "eyebrow": "Стек третьей задачи",
                "title": "Скрипт внутри Google Таблиц",
                "summary": (
                    "Google Apps Script получает сообщения MAX через GREEN-API и заполняет листы, используя "
                    "настройки подключения из Script Properties, а парсинг и расчёты проверяются на "
                    "вымышленных данных."
                ),
                "items": [
                    {"x": 9.0, "y": 24.0, "label": "Google Apps Script", "category": "runtime"},
                    {"x": 39.0, "y": 10.0, "label": "Google Sheets", "category": "interface"},
                    {"x": 83.0, "y": 21.0, "label": "GREEN-API", "category": "MAX history"},
                    {"x": 13.0, "y": 77.0, "label": "JavaScript", "category": "logic"},
                    {"x": 43.0, "y": 88.0, "label": "Script Properties", "category": "credentials"},
                    {"x": 72.0, "y": 80.0, "label": "Document Lock", "category": "safety"},
                    {"x": 92.0, "y": 66.0, "label": "Node.js tests", "category": "verification"},
                ],
            },
            {
                "eyebrow": "Stack for the third task",
                "title": "A script inside Google Sheets",
                "summary": (
                    "Google Apps Script reads MAX through GREEN-API and fills the sheets. API settings live "
                    "in Script Properties. Parsing and calculations are tested with synthetic data."
                ),
                "items": [
                    {"x": 9.0, "y": 24.0, "label": "Google Apps Script", "category": "runtime"},
                    {"x": 39.0, "y": 10.0, "label": "Google Sheets", "category": "interface"},
                    {"x": 83.0, "y": 21.0, "label": "GREEN-API", "category": "MAX history"},
                    {"x": 13.0, "y": 77.0, "label": "JavaScript", "category": "logic"},
                    {"x": 43.0, "y": 88.0, "label": "Script Properties", "category": "credentials"},
                    {"x": 72.0, "y": 80.0, "label": "Document Lock", "category": "safety"},
                    {"x": 92.0, "y": 66.0, "label": "Node.js tests", "category": "verification"},
                ],
            },
            _settings("map"),
        ),
    ]

    if next_case is not None:
        preserved = dict(next_case)
        preserved["settings"] = {**dict(next_case.get("settings") or {}), "layout": "default"}
        blocks.append(preserved)

    for order, block in enumerate(blocks):
        block["sort_order"] = order
    return blocks


def _tables() -> tuple[sa.TableClause, sa.TableClause, sa.TableClause]:
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
        sa.column("timeline_ru", sa.String()),
        sa.column("timeline_en", sa.String()),
        sa.column("challenge_ru", sa.Text()),
        sa.column("challenge_en", sa.Text()),
        sa.column("solution_ru", sa.Text()),
        sa.column("solution_en", sa.Text()),
        sa.column("result_summary_ru", sa.Text()),
        sa.column("result_summary_en", sa.Text()),
        sa.column("hero_metric_value", sa.String()),
        sa.column("hero_metric_label_ru", sa.String()),
        sa.column("hero_metric_label_en", sa.String()),
        sa.column("draft_data", postgresql.JSONB()),
        sa.column("published_data", postgresql.JSONB()),
        sa.column("status", sa.String()),
        sa.column("published_at", sa.DateTime()),
        sa.column("sort_order", sa.Integer()),
        sa.column("is_active", sa.Boolean()),
        sa.column("is_featured", sa.Boolean()),
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
    return projects, project_blocks, revisions


def _json_blocks(blocks: list[dict[str, object]]) -> list[dict[str, object]]:
    return [{**block, "id": str(block["id"])} for block in blocks]


def upgrade() -> None:
    connection = op.get_bind()
    projects, project_blocks, revisions = _tables()
    now = datetime.utcnow()

    project = (
        connection.execute(
            sa.select(projects.c.id, projects.c.published_data).where(projects.c.slug == SLUG)
        )
        .mappings()
        .one_or_none()
    )
    if project is None:
        # Production may not have the locally authored case yet. Bootstrap only
        # this slug, then use the same publication path as an existing case.
        initial_meta = _meta()
        project = {"id": _uuid("project"), "published_data": {}}
        connection.execute(
            projects.insert().values(
                id=project["id"],
                slug=SLUG,
                type_ru=initial_meta["type_ru"],
                type_en=initial_meta["type_en"],
                name_ru=initial_meta["name_ru"],
                name_en=initial_meta["name_en"],
                sort_order=initial_meta["sort_order"],
                is_active=True,
                is_featured=False,
                status="draft",
                created_at=now,
                updated_at=now,
            )
        )

    published = dict(project["published_data"] or {})
    source_blocks = [dict(block) for block in published.get("blocks", [])]
    next_case = next((block for block in source_blocks if block.get("type") == "next_case"), None)
    meta = _meta(dict(published.get("meta") or {}))
    blocks = _story_blocks(next_case)
    snapshot = {"meta": meta, "blocks": _json_blocks(blocks)}

    challenge = next(block for block in blocks if block["type"] == "challenge_solution")
    result = next(block for block in blocks if block["type"] == "results")
    connection.execute(
        projects.update()
        .where(projects.c.id == project["id"])
        .values(
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
            timeline_ru=meta["timeline_ru"],
            timeline_en=meta["timeline_en"],
            challenge_ru=challenge["content_ru"]["challenge"],
            challenge_en=challenge["content_en"]["challenge"],
            solution_ru=challenge["content_ru"]["solution"],
            solution_en=challenge["content_en"]["solution"],
            result_summary_ru=result["content_ru"]["body"],
            result_summary_en=result["content_en"]["body"],
            hero_metric_value="",
            hero_metric_label_ru="",
            hero_metric_label_en="",
            draft_data=meta,
            published_data=snapshot,
            status="published",
            published_at=now,
            updated_at=now,
        )
    )

    connection.execute(project_blocks.delete().where(project_blocks.c.project_id == project["id"]))
    connection.execute(
        project_blocks.insert(),
        [{**block, "project_id": project["id"]} for block in blocks],
    )

    previous_version = (
        connection.execute(
            sa.select(sa.func.max(revisions.c.version)).where(
                revisions.c.project_id == project["id"]
            )
        ).scalar_one_or_none()
        or 0
    )
    version = previous_version + 1
    connection.execute(
        revisions.insert().values(
            id=_uuid(f"revision-{version}"),
            project_id=project["id"],
            version=version,
            snapshot=snapshot,
            created_at=now,
        )
    )


def downgrade() -> None:
    # This is a curated public-content revision. Historical snapshots remain
    # available in project_revisions and can be restored from the admin studio.
    pass
