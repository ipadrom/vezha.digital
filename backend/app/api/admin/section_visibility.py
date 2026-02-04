from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import CurrentAdmin, DbSession
from app.models import SectionVisibility
from app.schemas import (
    MessageResponse,
    SectionVisibilityCreate,
    SectionVisibilityResponse,
    SectionVisibilityUpdate,
)
from app.services.cache import cache_service

router = APIRouter()

# Ключ кеша для инвалидации
CACHE_KEY = "visible_sections"


def invalidate_cache():
    """Инвалидировать кеш видимых секций"""
    cache_service.delete(CACHE_KEY)


@router.get("", response_model=list[SectionVisibilityResponse])
async def get_sections_visibility(
    admin: CurrentAdmin,
    db: DbSession,
):
    """Получить список всех секций с настройками видимости"""
    result = await db.execute(select(SectionVisibility))
    return result.scalars().all()


@router.get("/{section_key}", response_model=SectionVisibilityResponse)
async def get_section_visibility(
    section_key: str,
    admin: CurrentAdmin,
    db: DbSession,
):
    """Получить настройки видимости конкретной секции"""
    result = await db.execute(
        select(SectionVisibility).where(SectionVisibility.section_key == section_key)
    )
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Section with key '{section_key}' not found",
        )
    return section


@router.post("", response_model=SectionVisibilityResponse, status_code=status.HTTP_201_CREATED)
async def create_section_visibility(
    data: SectionVisibilityCreate,
    admin: CurrentAdmin,
    db: DbSession,
):
    """Создать новую настройку видимости секции"""
    # Проверяем, что секция с таким ключом еще не существует
    result = await db.execute(
        select(SectionVisibility).where(SectionVisibility.section_key == data.section_key)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Section with key '{data.section_key}' already exists",
        )

    section = SectionVisibility(**data.model_dump())
    db.add(section)
    await db.commit()
    await db.refresh(section)

    # Инвалидируем кеш
    invalidate_cache()

    return section


@router.patch("/{section_key}/visibility", response_model=SectionVisibilityResponse)
async def set_section_visibility(
    section_key: str,
    is_visible: bool,
    admin: CurrentAdmin,
    db: DbSession,
):
    """Установить видимость секции (упрощенный endpoint)"""
    result = await db.execute(
        select(SectionVisibility).where(SectionVisibility.section_key == section_key)
    )
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Section with key '{section_key}' not found",
        )

    section.is_visible = is_visible
    await db.commit()
    await db.refresh(section)

    # Инвалидируем кеш
    invalidate_cache()

    return section


@router.put("/{section_key}", response_model=SectionVisibilityResponse)
async def update_section_visibility(
    section_key: str,
    data: SectionVisibilityUpdate,
    admin: CurrentAdmin,
    db: DbSession,
):
    """Обновить настройки видимости секции"""
    result = await db.execute(
        select(SectionVisibility).where(SectionVisibility.section_key == section_key)
    )
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Section with key '{section_key}' not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(section, key, value)

    await db.commit()
    await db.refresh(section)

    # Инвалидируем кеш
    invalidate_cache()

    return section


@router.delete("/{section_key}", response_model=MessageResponse)
async def delete_section_visibility(
    section_key: str,
    admin: CurrentAdmin,
    db: DbSession,
):
    """Удалить настройку видимости секции"""
    result = await db.execute(
        select(SectionVisibility).where(SectionVisibility.section_key == section_key)
    )
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Section with key '{section_key}' not found",
        )

    await db.delete(section)
    await db.commit()

    # Инвалидируем кеш
    invalidate_cache()

    return MessageResponse(message=f"Section '{section_key}' visibility settings deleted successfully")


@router.patch("/{section_key}/toggle", response_model=SectionVisibilityResponse)
async def toggle_section_visibility(
    section_key: str,
    admin: CurrentAdmin,
    db: DbSession,
):
    """Переключить видимость секции (показать/скрыть)"""
    result = await db.execute(
        select(SectionVisibility).where(SectionVisibility.section_key == section_key)
    )
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Section with key '{section_key}' not found",
        )

    section.is_visible = not section.is_visible
    await db.commit()
    await db.refresh(section)

    # Инвалидируем кеш
    invalidate_cache()

    return section