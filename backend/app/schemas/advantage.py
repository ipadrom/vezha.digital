from uuid import UUID
from typing import Optional
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
    icon: Optional[str] = None
    title_ru: Optional[str] = None
    title_en: Optional[str] = None
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


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
