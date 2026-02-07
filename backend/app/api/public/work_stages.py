from fastapi import APIRouter, Query
from sqlalchemy import select

from app.core.deps import DbSession
from app.models import WorkStage
from app.models.work_stage_point import WorkStagePoint
from app.schemas.work_stage import WorkStagePointPublic, WorkStagePublic

router = APIRouter()


@router.get("", response_model=list[WorkStagePublic])
async def get_work_stages(
    db: DbSession,
    lang: str = Query("ru", regex="^(ru|en)$"),
):
    result = await db.execute(
        select(WorkStage).where(WorkStage.is_active).order_by(WorkStage.step_number)
    )
    stages = result.scalars().all()

    stage_ids = [s.id for s in stages]

    points_by_stage: dict = {sid: [] for sid in stage_ids}
    if stage_ids:
        points_result = await db.execute(
            select(WorkStagePoint)
            .where(WorkStagePoint.stage_id.in_(stage_ids), WorkStagePoint.is_active)
            .order_by(WorkStagePoint.sort_order)
        )
        for p in points_result.scalars().all():
            points_by_stage[p.stage_id].append(
                WorkStagePointPublic(
                    id=p.id,
                    text=p.text_ru if lang == "ru" else p.text_en,
                )
            )

    return [
        WorkStagePublic(
            id=s.id,
            step_number=s.step_number,
            title=s.title_ru if lang == "ru" else s.title_en,
            description=s.description_ru if lang == "ru" else s.description_en,
            duration=s.duration_ru if lang == "ru" else s.duration_en,
            full_description=s.full_description_ru if lang == "ru" else s.full_description_en,
            points=points_by_stage.get(s.id, []),
        )
        for s in stages
    ]
