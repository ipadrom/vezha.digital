from typing import List
from fastapi import APIRouter, Query

from sqlalchemy import select

from app.core.deps import DbSession
from app.models import Advantage
from app.schemas import AdvantagePublic

router = APIRouter()


@router.get("", response_model=List[AdvantagePublic])
async def get_advantages(
    db: DbSession,
    lang: str = Query("ru", regex="^(ru|en)$"),
):

    result = await db.execute(
        select(Advantage)
        .where(Advantage.is_active == True)
        .order_by(Advantage.sort_order)
    )
    advantages = result.scalars().all()

    return [
        AdvantagePublic(
            id=a.id,
            icon=a.icon,
            title=a.title_ru if lang == "ru" else a.title_en,
            description=a.description_ru if lang == "ru" else a.description_en,
        )
        for a in advantages
    ]
