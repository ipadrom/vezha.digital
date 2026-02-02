from fastapi import APIRouter, Query
from sqlalchemy import select

from app.core.deps import DbSession
from app.models import AboutSection
from app.schemas import AboutSectionPublic

router = APIRouter()


@router.get("", response_model=list[AboutSectionPublic])
async def get_about_sections(
    db: DbSession,
    lang: str = Query("ru", regex="^(ru|en)$"),
):
    result = await db.execute(
        select(AboutSection).where(AboutSection.is_active).order_by(AboutSection.sort_order)
    )
    about_sections = result.scalars().all()

    return [
        AboutSectionPublic(
            id=s.id,
            title=s.title_ru if lang == "ru" else s.title_en,
            description=s.description_ru if lang == "ru" else s.description_en,
        )
        for s in about_sections
    ]
