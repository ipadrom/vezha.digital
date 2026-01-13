from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ProjectBase(BaseModel):
    type_ru: str
    type_en: str
    name_ru: str
    name_en: str
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    image_url: Optional[str] = None
    project_url: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    type_ru: Optional[str] = None
    type_en: Optional[str] = None
    name_ru: Optional[str] = None
    name_en: Optional[str] = None
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    image_url: Optional[str] = None
    project_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class ProjectResponse(ProjectBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectPublic(BaseModel):
    id: UUID
    type: str
    name: str
    description: Optional[str]
    image_url: Optional[str]
    project_url: Optional[str]

    class Config:
        from_attributes = True
