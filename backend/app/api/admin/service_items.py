from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import CurrentAdmin, DbSession
from app.models import Service, ServiceItem
from app.schemas import (
    MessageResponse,
    ReorderRequest,
    ServiceItemCreate,
    ServiceItemResponse,
    ServiceItemUpdate,
)

router = APIRouter()


async def _get_service_or_404(service_id: UUID, db: DbSession) -> Service:
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service


@router.get("/{service_id}/items", response_model=list[ServiceItemResponse])
async def get_service_items(service_id: UUID, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    result = await db.execute(
        select(ServiceItem).where(ServiceItem.service_id == service_id).order_by(ServiceItem.sort_order)
    )
    return result.scalars().all()


@router.post("/{service_id}/items", response_model=ServiceItemResponse, status_code=status.HTTP_201_CREATED)
async def create_service_item(service_id: UUID, data: ServiceItemCreate, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    item = ServiceItem(**data.model_dump())
    item.service_id = service_id
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/{service_id}/items/{item_id}", response_model=ServiceItemResponse)
async def get_service_item(service_id: UUID, item_id: UUID, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    result = await db.execute(
        select(ServiceItem).where(ServiceItem.id == item_id, ServiceItem.service_id == service_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service item not found")
    return item


@router.put("/{service_id}/items/{item_id}", response_model=ServiceItemResponse)
async def update_service_item(
    service_id: UUID, item_id: UUID, data: ServiceItemUpdate, admin: CurrentAdmin, db: DbSession
):
    await _get_service_or_404(service_id, db)
    result = await db.execute(
        select(ServiceItem).where(ServiceItem.id == item_id, ServiceItem.service_id == service_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service item not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{service_id}/items/{item_id}", response_model=MessageResponse)
async def delete_service_item(service_id: UUID, item_id: UUID, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    result = await db.execute(
        select(ServiceItem).where(ServiceItem.id == item_id, ServiceItem.service_id == service_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service item not found")

    await db.delete(item)
    await db.commit()
    return MessageResponse(message="Service item deleted successfully")


@router.patch("/{service_id}/items/reorder", response_model=MessageResponse)
async def reorder_service_items(service_id: UUID, data: ReorderRequest, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    for reorder_item in data.items:
        result = await db.execute(
            select(ServiceItem).where(ServiceItem.id == reorder_item.id, ServiceItem.service_id == service_id)
        )
        item = result.scalar_one_or_none()
        if item:
            item.sort_order = reorder_item.sort_order

    await db.commit()
    return MessageResponse(message="Service items reordered successfully")