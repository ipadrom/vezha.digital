from fastapi import APIRouter, Query
from sqlalchemy import select

from app.core.deps import DbSession
from app.models import Project
from app.schemas import ProjectPublic

router = APIRouter()


@router.get("", response_model=list[ProjectPublic])
async def get_projects(
    db: DbSession,
    lang: str = Query("ru", regex="^(ru|en)$"),
):
    result = await db.execute(
        select(Project).where(Project.is_active == True).order_by(Project.sort_order)
    )
    projects = result.scalars().all()

    return [
        ProjectPublic(
            id=p.id,
            type=p.type_ru if lang == "ru" else p.type_en,
            name=p.name_ru if lang == "ru" else p.name_en,
            description=p.description_ru if lang == "ru" else p.description_en,
            image_url=p.image_url,
            project_url=p.project_url,
        )
        for p in projects
    ]
