from uuid import UUID

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
    step_number: int | None = None
    title_ru: str | None = None
    title_en: str | None = None
    description_ru: str | None = None
    description_en: str | None = None
    is_active: bool | None = None


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
