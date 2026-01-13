from uuid import UUID
from typing import Optional
from pydantic import BaseModel


class WorkStageBase(BaseModel):
    step_number: int
    title_ru: str
    title_en: str
    description_ru: str
    description_en: str
    is_active: bool = True


class WorkStageCreate(WorkStageBase):
    pass


class WorkStageUpdate(BaseModel):
    step_number: Optional[int] = None
    title_ru: Optional[str] = None
    title_en: Optional[str] = None
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    is_active: Optional[bool] = None


class WorkStageResponse(WorkStageBase):
    id: UUID

    class Config:
        from_attributes = True


class WorkStagePublic(BaseModel):
    id: UUID
    step_number: int
    title: str
    description: str

    class Config:
        from_attributes = True
