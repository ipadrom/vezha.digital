from uuid import UUID

from pydantic import BaseModel


class WorkStagePointPublic(BaseModel):
    id: UUID
    text: str

    class Config:
        from_attributes = True


class WorkStageBase(BaseModel):
    step_number: int
    title_ru: str
    title_en: str
    description_ru: str
    description_en: str
    duration_ru: str | None = None
    duration_en: str | None = None
    full_description_ru: str | None = None
    full_description_en: str | None = None
    is_active: bool = True


class WorkStageCreate(WorkStageBase):
    pass


class WorkStageUpdate(BaseModel):
    step_number: int | None = None
    title_ru: str | None = None
    title_en: str | None = None
    description_ru: str | None = None
    description_en: str | None = None
    duration_ru: str | None = None
    duration_en: str | None = None
    full_description_ru: str | None = None
    full_description_en: str | None = None
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
    duration: str | None = None
    full_description: str | None = None
    points: list[WorkStagePointPublic] = []

    class Config:
        from_attributes = True
