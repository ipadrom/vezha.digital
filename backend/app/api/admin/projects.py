from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException, status

from sqlalchemy import select

from app.core.deps import DbSession, CurrentAdmin
from app.models import Project
from app.schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
    ReorderRequest, MessageResponse
)

router = APIRouter()


@router.get("", response_model=List[ProjectResponse])
async def get_projects(
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(Project).order_by(Project.sort_order)
    )
    return result.scalars().all()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    admin: CurrentAdmin,
    db: DbSession,
):

    project = Project(**data.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)

    await db.commit()
    await db.refresh(project)
    return project


@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(
    project_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):

    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    await db.delete(project)
    await db.commit()
    return MessageResponse(message="Project deleted successfully")


@router.patch("/reorder", response_model=MessageResponse)
async def reorder_projects(
    data: ReorderRequest,
    admin: CurrentAdmin,
    db: DbSession,
):

    for item in data.items:
        result = await db.execute(
            select(Project).where(Project.id == item.id)
        )
        project = result.scalar_one_or_none()
        if project:
            project.sort_order = item.sort_order

    await db.commit()
    return MessageResponse(message="Projects reordered successfully")
