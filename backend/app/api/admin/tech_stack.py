from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import CurrentAdmin, DbSession
from app.models import TechStack
from app.schemas import (
    MessageResponse,
    ReorderRequest,
    TechStackCreate,
    TechStackResponse,
    TechStackUpdate,
)

router = APIRouter()


@router.get("", response_model=list[TechStackResponse])
async def get_tech_stack(
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(
        select(TechStack).order_by(TechStack.category, TechStack.sort_order)
    )
    return result.scalars().all()


@router.post("", response_model=TechStackResponse, status_code=status.HTTP_201_CREATED)
async def create_tech_stack(
    data: TechStackCreate,
    admin: CurrentAdmin,
    db: DbSession,
):
    tech = TechStack(**data.model_dump())
    db.add(tech)
    await db.commit()
    await db.refresh(tech)
    return tech


@router.put("/{tech_id}", response_model=TechStackResponse)
async def update_tech_stack(
    tech_id: UUID,
    data: TechStackUpdate,
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(select(TechStack).where(TechStack.id == tech_id))
    tech = result.scalar_one_or_none()
    if not tech:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tech stack item not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tech, key, value)

    await db.commit()
    await db.refresh(tech)
    return tech


@router.delete("/{tech_id}", response_model=MessageResponse)
async def delete_tech_stack(
    tech_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(select(TechStack).where(TechStack.id == tech_id))
    tech = result.scalar_one_or_none()
    if not tech:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tech stack item not found",
        )

    await db.delete(tech)
    await db.commit()
    return MessageResponse(message="Tech stack item deleted successfully")


@router.patch("/reorder", response_model=MessageResponse)
async def reorder_tech_stack(
    data: ReorderRequest,
    admin: CurrentAdmin,
    db: DbSession,
):
    for item in data.items:
        result = await db.execute(select(TechStack).where(TechStack.id == item.id))
        tech = result.scalar_one_or_none()
        if tech:
            tech.sort_order = item.sort_order

    await db.commit()
    return MessageResponse(message="Tech stack reordered successfully")
