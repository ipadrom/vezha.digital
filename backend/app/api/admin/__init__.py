from fastapi import APIRouter

from app.api.admin import (
    auth,
    services,
    projects,
    advantages,
    tech_stack,
    work_stages,
    settings,
    requests,
    upload,
)

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Admin Auth"])
router.include_router(services.router, prefix="/services", tags=["Admin Services"])
router.include_router(projects.router, prefix="/projects", tags=["Admin Projects"])
router.include_router(advantages.router, prefix="/advantages", tags=["Admin Advantages"])
router.include_router(tech_stack.router, prefix="/tech-stack", tags=["Admin Tech Stack"])
router.include_router(work_stages.router, prefix="/work-stages", tags=["Admin Work Stages"])
router.include_router(settings.router, prefix="/settings", tags=["Admin Settings"])
router.include_router(requests.router, prefix="/requests", tags=["Admin Requests"])
router.include_router(upload.router, prefix="/upload", tags=["Admin Upload"])
