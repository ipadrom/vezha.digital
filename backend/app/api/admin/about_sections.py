from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.deps import CurrentAdmin, DbSession
from app.models import AboutSection
from app.schemas import (
    AboutSectionCreate,
    AboutSectionResponse,
    AboutSectionUpdate,
    MessageResponse,
    ReorderRequest,
)

router = APIRouter()


@router.get("", response_model=list[AboutSectionResponse])
async def get_about_sections(
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(select(AboutSection).order_by(AboutSection.sort_order))
    return result.scalars().all()


@router.post("", response_model=AboutSectionResponse, status_code=status.HTTP_201_CREATED)
async def create_about_section(
    data: AboutSectionCreate,
    admin: CurrentAdmin,
    db: DbSession,
):
    about_section = AboutSection(**data.model_dump())
    db.add(about_section)
    await db.commit()
    await db.refresh(about_section)
    return about_section


@router.get("/{about_section_id}", response_model=AboutSectionResponse)
async def get_about_section(
    about_section_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(select(AboutSection).where(AboutSection.id == about_section_id))
    about_section = result.scalar_one_or_none()
    if not about_section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="About section not found",
        )
    return about_section


@router.put("/{about_section_id}", response_model=AboutSectionResponse)
async def update_about_section(
    about_section_id: UUID,
    data: AboutSectionUpdate,
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(select(AboutSection).where(AboutSection.id == about_section_id))
    about_section = result.scalar_one_or_none()
    if not about_section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="About section not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(about_section, key, value)

    await db.commit()
    await db.refresh(about_section)
    return about_section


@router.delete("/{about_section_id}", response_model=MessageResponse)
async def delete_about_section(
    about_section_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(select(AboutSection).where(AboutSection.id == about_section_id))
    about_section = result.scalar_one_or_none()
    if not about_section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="About section not found",
        )

    await db.delete(about_section)
    await db.commit()
    return MessageResponse(message="About section deleted successfully")


@router.patch("/reorder", response_model=MessageResponse)
async def reorder_about_sections(
    data: ReorderRequest,
    admin: CurrentAdmin,
    db: DbSession,
):
    for item in data.items:
        result = await db.execute(select(AboutSection).where(AboutSection.id == item.id))
        about_section = result.scalar_one_or_none()
        if about_section:
            about_section.sort_order = item.sort_order

    await db.commit()
    return MessageResponse(message="About sections reordered successfully")
