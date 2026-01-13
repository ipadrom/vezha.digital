from fastapi import APIRouter, Query
from sqlalchemy import select

from app.core.deps import DbSession
from app.models import WorkStage
from app.schemas import WorkStagePublic

router = APIRouter()


@router.get("", response_model=list[WorkStagePublic])
async def get_work_stages(
    db: DbSession,
    lang: str = Query("ru", regex="^(ru|en)$"),
):
    result = await db.execute(
        select(WorkStage)
        .where(WorkStage.is_active == True)
        .order_by(WorkStage.step_number)
    )
    stages = result.scalars().all()

    return [
        WorkStagePublic(
            id=s.id,
            step_number=s.step_number,
            title=s.title_ru if lang == "ru" else s.title_en,
            description=s.description_ru if lang == "ru" else s.description_en,
        )
        for s in stages
    ]
