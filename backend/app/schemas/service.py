from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ServiceBase(BaseModel):
    icon: str = "code"
    name_ru: str
    name_en: str
    description_ru: str
    description_en: str
    examples_ru: Optional[str] = None
    examples_en: Optional[str] = None
    price_from: int = 0
    price_currency: str = "₽"
    sort_order: int = 0
    is_active: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    icon: Optional[str] = None
    name_ru: Optional[str] = None
    name_en: Optional[str] = None
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    examples_ru: Optional[str] = None
    examples_en: Optional[str] = None
    price_from: Optional[int] = None
    price_currency: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class ServiceResponse(ServiceBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ServicePublic(BaseModel):
    id: UUID
    icon: str
    name: str
    description: str
    examples: Optional[str]
    price_from: int
    price_currency: str

    class Config:
        from_attributes = True
