from uuid import UUID

from pydantic import BaseModel


class AdvantageBase(BaseModel):
    icon: str = "star"
    title_ru: str
    title_en: str
    description_ru: str
    description_en: str
    sort_order: int = 0
    is_active: bool = True


class AdvantageCreate(AdvantageBase):
    pass


class AdvantageUpdate(BaseModel):
    icon: str | None = None
    title_ru: str | None = None
    title_en: str | None = None
    description_ru: str | None = None
    description_en: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class AdvantageResponse(AdvantageBase):
    id: UUID

    class Config:
        from_attributes = True


class AdvantagePublic(BaseModel):
    id: UUID
    icon: str
    title: str
    description: str

    class Config:
        from_attributes = True
