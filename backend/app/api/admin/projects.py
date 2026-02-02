import os
import uuid as uuid_module
from uuid import UUID

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from sqlalchemy import select

from app.config import settings
from app.core.deps import CurrentAdmin, DbSession
from app.core.storage import storage
from app.models import Project
from app.schemas import (
    MessageResponse,
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
    ReorderRequest,
    UploadResponse,
)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
CONTENT_TYPE_MAP = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
}

router = APIRouter()


@router.get("", response_model=list[ProjectResponse])
async def get_projects(
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(select(Project).order_by(Project.sort_order))
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

# a
@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):
    result = await db.execute(select(Project).where(Project.id == project_id))
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
    result = await db.execute(select(Project).where(Project.id == project_id))
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
    result = await db.execute(select(Project).where(Project.id == project_id))
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
        result = await db.execute(select(Project).where(Project.id == item.id))
        project = result.scalar_one_or_none()
        if project:
            project.sort_order = item.sort_order

    await db.commit()
    return MessageResponse(message="Projects reordered successfully")


@router.post("/upload", response_model=UploadResponse)
async def upload_new_project_image(
    admin: CurrentAdmin,
    file: UploadFile = File(...),
):
    """Upload image for a new project (before creating the project)."""
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read and validate file size
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE // 1024 // 1024}MB",
        )

    # Upload image
    unique_filename = f"{uuid_module.uuid4()}{ext}"
    content_type = CONTENT_TYPE_MAP.get(ext, "application/octet-stream")

    try:
        url = storage.upload_file(
            file_data=content,
            filename=unique_filename,
            content_type=content_type,
            prefix="projects/",
        )

        return UploadResponse(url=url, filename=unique_filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}",
        )


@router.post("/{project_id}/image", response_model=ProjectResponse)
async def upload_project_image(
    project_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
    file: UploadFile = File(...),
):
    """Upload image for a specific project and update the project."""
    # Get project
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read and validate file size
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE // 1024 // 1024}MB",
        )

    # Delete old image if exists
    if project.image_url:
        storage.delete_file_by_url(project.image_url)

    # Upload new image
    unique_filename = f"{uuid_module.uuid4()}{ext}"
    content_type = CONTENT_TYPE_MAP.get(ext, "application/octet-stream")

    try:
        url = storage.upload_file(
            file_data=content,
            filename=unique_filename,
            content_type=content_type,
            prefix="projects/",
        )

        # Update project
        project.image_url = url
        await db.commit()
        await db.refresh(project)

        return project
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}",
        )
