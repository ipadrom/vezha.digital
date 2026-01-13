from uuid import UUID

from pydantic import BaseModel


class ReorderItem(BaseModel):
    id: UUID
    sort_order: int


class ReorderRequest(BaseModel):
    items: list[ReorderItem]


class MessageResponse(BaseModel):
    message: str


class UploadResponse(BaseModel):
    url: str
    filename: str
