from fastapi import APIRouter
from sqlalchemy import select

from app.core.deps import DbSession
from app.models import SectionVisibility
from app.schemas import SectionVisibilityPublic
from app.services.cache import cache_service

router = APIRouter()

# Ключ для кеша
CACHE_KEY = "visible_sections"
# TTL для кеша (в секундах) - 5 минут
CACHE_TTL = 300


@router.get("", response_model=SectionVisibilityPublic)
async def get_visible_sections(
    db: DbSession,
):
    """
    Получить список ключей видимых секций для фронтенда.
    Результат кешируется на 5 минут для оптимизации производительности.
    """
    # Проверяем кеш
    cached_data = cache_service.get(CACHE_KEY)
    if cached_data is not None:
        return SectionVisibilityPublic(visible_sections=cached_data)

    # Если в кеше нет данных, запрашиваем из БД
    result = await db.execute(
        select(SectionVisibility.section_key).where(SectionVisibility.is_visible == True)
    )
    visible_sections = [row[0] for row in result.all()]

    # Сохраняем в кеш
    cache_service.set(CACHE_KEY, visible_sections, ttl=CACHE_TTL)

    return SectionVisibilityPublic(visible_sections=visible_sections)