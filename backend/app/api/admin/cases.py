from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.deps import CurrentAdmin, DbSession
from app.models import Project, ProjectRevision
from app.schemas import (
    CaseBlockInput,
    CaseCreate,
    CaseDocumentResponse,
    CaseDocumentUpdate,
    CaseMeta,
    CaseRevisionResponse,
    CaseSummaryResponse,
    MessageResponse,
)
from app.services.case_builder import (
    apply_published_meta,
    document_response,
    draft_snapshot,
    project_blocks,
    replace_blocks,
    summary_response,
)

router = APIRouter()


def _case_options():
    return (
        selectinload(Project.blocks),
        selectinload(Project.metrics),
        selectinload(Project.gallery),
        selectinload(Project.technologies),
        selectinload(Project.revisions),
    )


async def _get_case(project_id: UUID, db: DbSession) -> Project:
    result = await db.execute(
        select(Project).options(*_case_options()).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return project


@router.get("", response_model=list[CaseSummaryResponse])
async def list_cases(admin: CurrentAdmin, db: DbSession):
    result = await db.execute(
        select(Project).options(*_case_options()).order_by(Project.sort_order, Project.created_at)
    )
    return [summary_response(project) for project in result.scalars().unique().all()]


@router.post("", response_model=CaseDocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_case(data: CaseCreate, admin: CurrentAdmin, db: DbSession):
    meta = data.meta
    project = Project(
        slug=None,
        name_ru=meta.name_ru,
        name_en=meta.name_en,
        type_ru=meta.type_ru or "Проект",
        type_en=meta.type_en or "Project",
        description_ru=meta.description_ru,
        description_en=meta.description_en,
        image_url=meta.image_url,
        sort_order=meta.sort_order,
        is_active=False,
        is_featured=meta.is_featured,
        status="draft",
        draft_data=meta.model_dump(mode="json"),
    )
    db.add(project)
    await db.commit()
    return document_response(await _get_case(project.id, db))


@router.get("/{project_id}", response_model=CaseDocumentResponse)
async def get_case(project_id: UUID, admin: CurrentAdmin, db: DbSession):
    return document_response(await _get_case(project_id, db))


@router.put("/{project_id}", response_model=CaseDocumentResponse)
async def save_case(
    project_id: UUID,
    data: CaseDocumentUpdate,
    admin: CurrentAdmin,
    db: DbSession,
):
    project = await _get_case(project_id, db)
    project.draft_data = data.meta.model_dump(mode="json")
    project.updated_at = datetime.utcnow()
    replace_blocks(project, data.blocks)
    await db.commit()
    return document_response(await _get_case(project.id, db))


@router.post("/{project_id}/publish", response_model=CaseDocumentResponse)
async def publish_case(project_id: UUID, admin: CurrentAdmin, db: DbSession):
    project = await _get_case(project_id, db)
    snapshot = draft_snapshot(project)
    meta = snapshot["meta"]
    visible_blocks = [block for block in snapshot["blocks"] if block["is_visible"]]

    if not meta["slug"] or not meta["name_ru"] or not meta["name_en"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Slug and both case titles are required before publishing",
        )
    if not any(block["type"] == "hero" for block in visible_blocks):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A visible hero block is required before publishing",
        )

    duplicate = await db.execute(
        select(Project.id).where(Project.slug == meta["slug"], Project.id != project.id)
    )
    if duplicate.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A published case with this slug already exists",
        )

    version = max((revision.version for revision in project.revisions), default=0) + 1
    project.revisions.append(ProjectRevision(version=version, snapshot=snapshot))
    project.published_data = snapshot
    project.published_at = datetime.utcnow()
    project.status = "published"
    project.is_active = True
    apply_published_meta(project, CaseMeta.model_validate(meta))
    await db.commit()
    return document_response(await _get_case(project.id, db))


@router.post("/{project_id}/hide", response_model=CaseDocumentResponse)
async def hide_case(project_id: UUID, admin: CurrentAdmin, db: DbSession):
    project = await _get_case(project_id, db)
    project.status = "hidden"
    project.is_active = False
    await db.commit()
    return document_response(await _get_case(project.id, db))


@router.post("/{project_id}/duplicate", response_model=CaseDocumentResponse)
async def duplicate_case(project_id: UUID, admin: CurrentAdmin, db: DbSession):
    source = await _get_case(project_id, db)
    meta = draft_snapshot(source)["meta"]
    meta["slug"] = f"{meta['slug']}-copy" if meta["slug"] else ""
    meta["name_ru"] = f"{meta['name_ru']} — копия".strip()
    meta["name_en"] = f"{meta['name_en']} — copy".strip()
    copy = Project(
        name_ru=meta["name_ru"],
        name_en=meta["name_en"],
        type_ru=meta["type_ru"] or "Проект",
        type_en=meta["type_en"] or "Project",
        description_ru=meta["description_ru"],
        description_en=meta["description_en"],
        slug=None,
        image_url=meta["image_url"],
        is_active=False,
        is_featured=False,
        status="draft",
        draft_data={**meta, "is_featured": False},
    )
    replace_blocks(
        copy,
        [block.model_copy(update={"id": None}) for block in project_blocks(source)],
    )
    db.add(copy)
    await db.commit()
    return document_response(await _get_case(copy.id, db))


@router.get("/{project_id}/revisions", response_model=list[CaseRevisionResponse])
async def list_revisions(project_id: UUID, admin: CurrentAdmin, db: DbSession):
    project = await _get_case(project_id, db)
    return [
        CaseRevisionResponse(id=item.id, version=item.version, created_at=item.created_at)
        for item in project.revisions
    ]


@router.post("/{project_id}/revisions/{revision_id}/restore", response_model=CaseDocumentResponse)
async def restore_revision(
    project_id: UUID,
    revision_id: UUID,
    admin: CurrentAdmin,
    db: DbSession,
):
    project = await _get_case(project_id, db)
    revision = next((item for item in project.revisions if item.id == revision_id), None)
    if not revision:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revision not found")
    project.draft_data = revision.snapshot["meta"]
    project.updated_at = datetime.utcnow()
    replace_blocks(
        project,
        [CaseBlockInput.model_validate(block) for block in revision.snapshot["blocks"]],
    )
    await db.commit()
    return document_response(await _get_case(project.id, db))


@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_case(project_id: UUID, admin: CurrentAdmin, db: DbSession):
    project = await _get_case(project_id, db)
    await db.delete(project)
    await db.commit()
    return MessageResponse(message="Case deleted")
