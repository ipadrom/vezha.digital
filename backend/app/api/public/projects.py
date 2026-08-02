from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.deps import DbSession
from app.models import Project
from app.schemas import ProjectDetailPublic, ProjectPublic
from app.services.projects import serialize_project_detail, serialize_project_summary

router = APIRouter()


@router.get("", response_model=list[ProjectPublic])
async def get_projects(
    db: DbSession,
    lang: str = Query("ru", regex="^(ru|en)$"),
):
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.metrics))
        .where(Project.is_active)
        .order_by(Project.sort_order)
    )
    projects = result.scalars().all()
    return [serialize_project_summary(project, lang) for project in projects]


@router.get("/{slug}", response_model=ProjectDetailPublic)
async def get_project_by_slug(
    slug: str,
    db: DbSession,
    lang: str = Query("ru", pattern="^(ru|en)$"),
):
    result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.metrics),
            selectinload(Project.gallery),
            selectinload(Project.technologies),
        )
        .where(Project.slug == slug, Project.is_active)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return serialize_project_detail(project, lang)
