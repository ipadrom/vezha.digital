from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException, status

from sqlalchemy import select

from app.core.deps import DbSession, CurrentAdmin
from app.models import Advantage
from app.schemas import (
    AdvantageCreate, AdvantageUpdate, AdvantageResponse,
    ReorderRequest, MessageResponse
)

router = APIRouter()


@router.get("", response_model=List[AdvantageResponse])
async def get_advantages(
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(Advantage).order_by(Advantage.sort_order)
    )
    return result.scalars().all()


@router.post("", response_model=AdvantageResponse, status_code=status.HTTP_201_CREATED)
async def create_advantage(
    data: AdvantageCreate,
    admin: CurrentAdmin,
    db: DbSession,
):

    advantage = Advantage(**data.model_dump())
    db.add(advantage)
    await db.commit()
    await db.refresh(advantage)
    return advantage


@router.put("/{advantage_id}", response_model=AdvantageResponse)
async def update_advantage(
    advantage_id: UUID,
    data: AdvantageUpdate,
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(Advantage).where(Advantage.id == advantage_id)
    )
    advantage = result.scalar_one_or_none()
    if not advantage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advantage not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(advantage, key, value)

    await db.commit()
    await db.refresh(advantage)
    return advantage


@router.delete("/{advantage_id}", response_model=MessageResponse)
async def delete_advantage(
    advantage_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(Advantage).where(Advantage.id == advantage_id)
    )
    advantage = result.scalar_one_or_none()
    if not advantage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advantage not found",
        )

    await db.delete(advantage)
    await db.commit()
    return MessageResponse(message="Advantage deleted successfully")


@router.patch("/reorder", response_model=MessageResponse)
async def reorder_advantages(
    data: ReorderRequest,
    admin: CurrentAdmin,
    db: DbSession,
):

    for item in data.items:
        result = await db.execute(
            select(Advantage).where(Advantage.id == item.id)
        )
        advantage = result.scalar_one_or_none()
        if advantage:
            advantage.sort_order = item.sort_order

    await db.commit()
    return MessageResponse(message="Advantages reordered successfully")
