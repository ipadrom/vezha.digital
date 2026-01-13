from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ProjectBase(BaseModel):
    type_ru: str
    type_en: str
    name_ru: str
    name_en: str
    description_ru: str | None = None
    description_en: str | None = None
    image_url: str | None = None
    project_url: str | None = None
    sort_order: int = 0
    is_active: bool = True


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    type_ru: str | None = None
    type_en: str | None = None
    name_ru: str | None = None
    name_en: str | None = None
    description_ru: str | None = None
    description_en: str | None = None
    image_url: str | None = None
    project_url: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


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
    description: str | None
    image_url: str | None
    project_url: str | None

    class Config:
        from_attributes = True
