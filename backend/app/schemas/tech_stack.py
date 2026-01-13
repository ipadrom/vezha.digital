from uuid import UUID
from typing import Optional
from pydantic import BaseModel

from app.models.tech_stack import TechCategory


class TechStackBase(BaseModel):
    category: TechCategory
    icon: str
    name: str
    subtitle_ru: Optional[str] = None
    subtitle_en: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class TechStackCreate(TechStackBase):
    pass


class TechStackUpdate(BaseModel):
    category: Optional[TechCategory] = None
    icon: Optional[str] = None
    name: Optional[str] = None
    subtitle_ru: Optional[str] = None
    subtitle_en: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class TechStackResponse(TechStackBase):
    id: UUID

    class Config:
        from_attributes = True


class TechStackPublic(BaseModel):
    id: UUID
    category: TechCategory
    icon: str
    name: str
    subtitle: Optional[str]

    class Config:
        from_attributes = True
