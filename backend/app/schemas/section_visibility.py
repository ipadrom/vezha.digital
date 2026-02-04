from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class SectionVisibilityBase(BaseModel):
    """Базовая схема для видимости секций"""

    section_key: str = Field(..., description="Уникальный ключ секции")
    section_name_ru: str = Field(..., description="Название секции на русском")
    section_name_en: str = Field(..., description="Название секции на английском")
    is_visible: bool = Field(default=True, description="Видимость секции на сайте")


class SectionVisibilityCreate(SectionVisibilityBase):
    """Схема для создания настройки видимости секции"""

    pass


class SectionVisibilityUpdate(BaseModel):
    """Схема для обновления настройки видимости секции"""

    section_name_ru: str | None = None
    section_name_en: str | None = None
    is_visible: bool | None = None


class SectionVisibilityResponse(SectionVisibilityBase):
    """Схема ответа с информацией о видимости секции"""

    id: UUID
    updated_at: datetime

    class Config:
        from_attributes = True


class SectionVisibilityPublic(BaseModel):
    """Публичная схема для фронтенда - только ключи видимых секций"""

    visible_sections: list[str] = Field(
        ..., description="Список ключей видимых секций"
    )