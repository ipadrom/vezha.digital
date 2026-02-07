from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import CurrentAdmin, DbSession
from app.models import Service, ServiceExample
from app.schemas import (
    MessageResponse,
    ReorderRequest,
    ServiceExampleCreate,
    ServiceExampleResponse,
    ServiceExampleUpdate,
)

router = APIRouter()


async def _get_service_or_404(service_id: UUID, db: DbSession) -> Service:
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service


@router.get("/{service_id}/examples", response_model=list[ServiceExampleResponse])
async def get_service_examples(service_id: UUID, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    result = await db.execute(
        select(ServiceExample).where(ServiceExample.service_id == service_id).order_by(ServiceExample.sort_order)
    )
    return result.scalars().all()


@router.post("/{service_id}/examples", response_model=ServiceExampleResponse, status_code=status.HTTP_201_CREATED)
async def create_service_example(service_id: UUID, data: ServiceExampleCreate, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    example = ServiceExample(**data.model_dump())
    example.service_id = service_id
    db.add(example)
    await db.commit()
    await db.refresh(example)
    return example


@router.get("/{service_id}/examples/{example_id}", response_model=ServiceExampleResponse)
async def get_service_example(service_id: UUID, example_id: UUID, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    result = await db.execute(
        select(ServiceExample).where(ServiceExample.id == example_id, ServiceExample.service_id == service_id)
    )
    example = result.scalar_one_or_none()
    if not example:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service example not found")
    return example


@router.put("/{service_id}/examples/{example_id}", response_model=ServiceExampleResponse)
async def update_service_example(
    service_id: UUID, example_id: UUID, data: ServiceExampleUpdate, admin: CurrentAdmin, db: DbSession
):
    await _get_service_or_404(service_id, db)
    result = await db.execute(
        select(ServiceExample).where(ServiceExample.id == example_id, ServiceExample.service_id == service_id)
    )
    example = result.scalar_one_or_none()
    if not example:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service example not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(example, key, value)

    await db.commit()
    await db.refresh(example)
    return example


@router.delete("/{service_id}/examples/{example_id}", response_model=MessageResponse)
async def delete_service_example(service_id: UUID, example_id: UUID, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    result = await db.execute(
        select(ServiceExample).where(ServiceExample.id == example_id, ServiceExample.service_id == service_id)
    )
    example = result.scalar_one_or_none()
    if not example:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service example not found")

    await db.delete(example)
    await db.commit()
    return MessageResponse(message="Service example deleted successfully")


@router.patch("/{service_id}/examples/reorder", response_model=MessageResponse)
async def reorder_service_examples(service_id: UUID, data: ReorderRequest, admin: CurrentAdmin, db: DbSession):
    await _get_service_or_404(service_id, db)
    for reorder_item in data.items:
        result = await db.execute(
            select(ServiceExample).where(
                ServiceExample.id == reorder_item.id, ServiceExample.service_id == service_id
            )
        )
        example = result.scalar_one_or_none()
        if example:
            example.sort_order = reorder_item.sort_order

    await db.commit()
    return MessageResponse(message="Service examples reordered successfully")
