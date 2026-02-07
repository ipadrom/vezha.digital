from fastapi import APIRouter

from app.api.admin import (
    about_sections,
    advantages,
    auth,
    client_types,
    projects,
    requests,
    section_visibility,
    service_items,
    services,
    settings,
    tech_stack,
    upload,
    work_stages,
)

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Admin Auth"])
router.include_router(services.router, prefix="/services", tags=["Admin Services"])
router.include_router(service_items.router, prefix="/services", tags=["Admin Service Items"])
router.include_router(projects.router, prefix="/projects", tags=["Admin Projects"])
router.include_router(advantages.router, prefix="/advantages", tags=["Admin Advantages"])
router.include_router(client_types.router, prefix="/client-types", tags=["Admin Client Types"])
router.include_router(about_sections.router, prefix="/about-sections", tags=["Admin About Sections"])
router.include_router(tech_stack.router, prefix="/tech-stack", tags=["Admin Tech Stack"])
router.include_router(work_stages.router, prefix="/work-stages", tags=["Admin Work Stages"])
router.include_router(settings.router, prefix="/settings", tags=["Admin Settings"])
router.include_router(section_visibility.router, prefix="/section-visibility", tags=["Admin Section Visibility"])
router.include_router(requests.router, prefix="/requests", tags=["Admin Requests"])
router.include_router(upload.router, prefix="/upload", tags=["Admin Upload"])
