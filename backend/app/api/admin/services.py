from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException, status

from sqlalchemy import select

from app.core.deps import DbSession, CurrentAdmin
from app.models import Service
from app.schemas import (
    ServiceCreate, ServiceUpdate, ServiceResponse,
    ReorderRequest, MessageResponse
)

router = APIRouter()


@router.get("", response_model=List[ServiceResponse])
async def get_services(
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(Service).order_by(Service.sort_order)
    )
    return result.scalars().all()


@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    data: ServiceCreate,
    admin: CurrentAdmin,
    db: DbSession,
):

    service = Service(**data.model_dump())
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return service


@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(
    service_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(Service).where(Service.id == service_id)
    )
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )
    return service


@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: UUID,
    data: ServiceUpdate,
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(Service).where(Service.id == service_id)
    )
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(service, key, value)

    await db.commit()
    await db.refresh(service)
    return service


@router.delete("/{service_id}", response_model=MessageResponse)
async def delete_service(
    service_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(Service).where(Service.id == service_id)
    )
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    await db.delete(service)
    await db.commit()
    return MessageResponse(message="Service deleted successfully")


@router.patch("/reorder", response_model=MessageResponse)
async def reorder_services(
    data: ReorderRequest,
    admin: CurrentAdmin,
    db: DbSession,
):

    for item in data.items:
        result = await db.execute(
            select(Service).where(Service.id == item.id)
        )
        service = result.scalar_one_or_none()
        if service:
            service.sort_order = item.sort_order

    await db.commit()
    return MessageResponse(message="Services reordered successfully")
