from uuid import UUID

from pydantic import BaseModel

from app.models.tech_stack import TechCategory


class TechStackBase(BaseModel):
    category: TechCategory
    icon: str
    name: str
    subtitle_ru: str | None = None
    subtitle_en: str | None = None
    sort_order: int = 0
    is_active: bool = True


class TechStackCreate(TechStackBase):
    pass


class TechStackUpdate(BaseModel):
    category: TechCategory | None = None
    icon: str | None = None
    name: str | None = None
    subtitle_ru: str | None = None
    subtitle_en: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class TechStackResponse(TechStackBase):
    id: UUID

    class Config:
        from_attributes = True


class TechStackPublic(BaseModel):
    id: UUID
    category: TechCategory
    icon: str
    name: str
    subtitle: str | None

    class Config:
        from_attributes = True
