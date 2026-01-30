from fastapi import APIRouter

from app.api.public import (
    advantages,
    client_types,
    contact,
    projects,
    services,
    settings,
    tech_stack,
    work_stages,
)

router = APIRouter()

router.include_router(services.router, prefix="/services", tags=["Services"])
router.include_router(projects.router, prefix="/projects", tags=["Projects"])
router.include_router(advantages.router, prefix="/advantages", tags=["Advantages"])
router.include_router(client_types.router, prefix="/client-types", tags=["Client Types"])
router.include_router(tech_stack.router, prefix="/tech-stack", tags=["Tech Stack"])
router.include_router(work_stages.router, prefix="/work-stages", tags=["Work Stages"])
router.include_router(settings.router, prefix="/settings", tags=["Settings"])
router.include_router(contact.router, prefix="/contact", tags=["Contact"])
