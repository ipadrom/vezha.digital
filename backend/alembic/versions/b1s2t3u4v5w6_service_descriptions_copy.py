"""Rewrite landing service descriptions; mobile apps now cover native iOS and Android, not only PWA.

Revision ID: b1s2t3u4v5w6
Revises: a0r1s2t3u4v5
"""

import sqlalchemy as sa

from alembic import op

revision = "b1s2t3u4v5w6"
down_revision = "a0r1s2t3u4v5"
branch_labels = None
depends_on = None

# (service name, column, current text, new text). Texts edited in the admin since are left alone.
CHANGES = [
    (
        "Мобильные приложения",
        "description_ru",
        "PWA-приложение, которое работает на iOS и Android без публикации в магазинах и долгой модерации.",
        "Разрабатываем нативные приложения для iOS и Android, а также PWA без публикации в магазинах "
        "и долгой модерации.",
    ),
    (
        "Мобильные приложения",
        "description_en",
        "A PWA that works on iOS and Android without app store submission or lengthy review.",
        "We build native iOS and Android apps, as well as PWAs that skip app store submission "
        "and lengthy review.",
    ),
    (
        "Веб-сайты",
        "description_ru",
        "Делаем сайты, которые работают на всех устройствах: лендинги, корпоративные сайты, "
        "каталоги и промо-страницы.",
        "Делаем лендинги, корпоративные сайты, каталоги и промо-страницы, удобные на любых устройствах.",
    ),
    (
        "Интернет-магазины",
        "description_ru",
        "Магазин, который удобно использовать покупателю и легко администрировать вам.",
        "Магазин, удобный для покупателя и простой в управлении для вас.",
    ),
    (
        "Корпоративные системы",
        "description_ru",
        "Инструмент, который работает именно под ваши процессы, а не требует подстраиваться "
        "под готовое решение.",
        "Инструмент под ваши процессы, без подстройки под готовое решение.",
    ),
    (
        "Поддержка существующих решений",
        "description_ru",
        "Берём на поддержку продукт, который уже работает: разбираемся в коде, исправляем ошибки, "
        "дорабатываем функции и следим за стабильностью.",
        "Берём на поддержку работающий продукт. Разбираемся в коде, исправляем ошибки, "
        "дорабатываем функции и следим за стабильностью.",
    ),
]


def apply(bind, reverse=False):
    for name, column, old, new in CHANGES:
        current, target = (new, old) if reverse else (old, new)
        bind.execute(
            sa.text(
                f"UPDATE services SET {column} = :target WHERE name_ru = :name AND {column} = :current"
            ),
            {"target": target, "name": name, "current": current},
        )


def upgrade():
    apply(op.get_bind())


def downgrade():
    apply(op.get_bind(), reverse=True)
