from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import CurrentAdmin, DbSession
from app.models import ClientType
from app.schemas import (
    ClientTypeCreate,
    ClientTypeResponse,
    ClientTypeUpdate,
    MessageResponse,
    ReorderRequest,
)

router = APIRouter()


@router.get("", response_model=list[ClientTypeResponse])
async def get_client_types(
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(select(ClientType).order_by(ClientType.sort_order))
    return result.scalars().all()


@router.post("", response_model=ClientTypeResponse, status_code=status.HTTP_201_CREATED)
async def create_client_type(
    data: ClientTypeCreate,
    admin: CurrentAdmin,
    db: DbSession,
):
    client_type = ClientType(**data.model_dump())
    db.add(client_type)
    await db.commit()
    await db.refresh(client_type)
    return client_type


@router.get("/{client_type_id}", response_model=ClientTypeResponse)
async def get_client_type(
    client_type_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(select(ClientType).where(ClientType.id == client_type_id))
    client_type = result.scalar_one_or_none()
    if not client_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client type not found",
        )
    return client_type


@router.put("/{client_type_id}", response_model=ClientTypeResponse)
async def update_client_type(
    client_type_id: UUID,
    data: ClientTypeUpdate,
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(select(ClientType).where(ClientType.id == client_type_id))
    client_type = result.scalar_one_or_none()
    if not client_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client type not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(client_type, key, value)

    await db.commit()
    await db.refresh(client_type)
    return client_type


@router.delete("/{client_type_id}", response_model=MessageResponse)
async def delete_client_type(
    client_type_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(select(ClientType).where(ClientType.id == client_type_id))
    client_type = result.scalar_one_or_none()
    if not client_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client type not found",
        )

    await db.delete(client_type)
    await db.commit()
    return MessageResponse(message="Client type deleted successfully")


@router.patch("/reorder", response_model=MessageResponse)
async def reorder_client_types(
    data: ReorderRequest,
    admin: CurrentAdmin,
    db: DbSession,
):
    for item in data.items:
        result = await db.execute(select(ClientType).where(ClientType.id == item.id))
        client_type = result.scalar_one_or_none()
        if client_type:
            client_type.sort_order = item.sort_order

    await db.commit()
    return MessageResponse(message="Client types reordered successfully")