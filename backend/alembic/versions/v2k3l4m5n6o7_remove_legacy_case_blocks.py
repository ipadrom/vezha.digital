"""Remove retired case blocks and canonicalize case layouts.

Revision ID: v2k3l4m5n6o7
Revises: u1j2k3l4m5n6
"""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime
from uuid import NAMESPACE_URL, UUID, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "v2k3l4m5n6o7"
down_revision: str = "u1j2k3l4m5n6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

GBU_SLUG = "gbu-process-automation"
DEPRECATED_BLOCK_TYPES = {"gallery"}

DEFAULT_LAYOUTS = {
    "hero": "case-header",
    "media_hero": "media-16x9",
    "text": "editorial",
    "challenge_solution": "narrative",
    "insight": "statement",
    "image": "default",
    "image_text": "image-right",
    "metrics": "cards",
    "process": "chapter",
    "quote": "default",
    "technologies": "map",
    "video": "default",
    "comparison": "side-by-side",
    "results": "statement",
    "next_case": "default",
    "custom": "freeform",
}

SUPPORTED_LAYOUTS = {
    "hero": {"case-header"},
    "media_hero": {"media-16x9", "media-3x2", "media-natural"},
    "text": {"overview", "editorial", "split", "lead"},
    "challenge_solution": {"narrative"},
    "insight": {"statement", "media-right"},
    "image": {"default"},
    "image_text": {"image-right", "image-left"},
    "metrics": {"cards"},
    "process": {"chapter"},
    "quote": {"default"},
    "technologies": {"map", "tags"},
    "video": {"default"},
    "comparison": {"side-by-side", "stacked"},
    "results": {"statement"},
    "next_case": {"default"},
    "custom": {"freeform"},
}

LEGACY_LAYOUT_ALIASES = {
    "hero": {"default": "case-header", "editorial": "case-header"},
    "media_hero": {"default": "media-16x9", "media": "media-16x9", "cinematic": "media-16x9"},
    "text": {"default": "editorial"},
    "challenge_solution": {
        "default": "narrative",
        "split": "narrative",
        "contrast": "narrative",
    },
    "insight": {"default": "statement"},
    "image": {"figure": "default"},
    "image_text": {"default": "image-right"},
    "metrics": {"default": "cards", "grid": "cards", "strip": "cards"},
    "process": {
        "default": "chapter",
        "stacked": "chapter",
        "story": "chapter",
        "accordion": "chapter",
    },
    "technologies": {"default": "map"},
    "video": {"cinematic": "default"},
    "comparison": {"default": "side-by-side"},
    "results": {
        "default": "statement",
        "list": "statement",
        "panel": "statement",
    },
}


def _uuid(name: str) -> UUID:
    return uuid5(NAMESPACE_URL, f"https://vezha.digital/cases/layout-v3#{name}")


def _canonical_layout(block_type: str, layout: object) -> str:
    value = str(layout or "default")
    if value == "freeform" and block_type != "hero":
        return value
    value = LEGACY_LAYOUT_ALIASES.get(block_type, {}).get(value, value)
    if value in SUPPORTED_LAYOUTS.get(block_type, {"default"}):
        return value
    return DEFAULT_LAYOUTS.get(block_type, "default")


def _normalize_block(source: dict[str, object]) -> dict[str, object] | None:
    block_type = str(source.get("type") or "")
    if block_type in DEPRECATED_BLOCK_TYPES:
        return None
    block = dict(source)
    block["content_ru"] = dict(source.get("content_ru") or {})
    block["content_en"] = dict(source.get("content_en") or {})
    settings = dict(source.get("settings") or {})
    settings["layout"] = _canonical_layout(block_type, settings.get("layout"))
    block["settings"] = settings
    block["is_visible"] = bool(source.get("is_visible", True))
    return block


def _normalize_blocks(blocks: list[dict[str, object]]) -> list[dict[str, object]]:
    normalized = [block for source in blocks if (block := _normalize_block(source)) is not None]
    normalized.sort(key=lambda block: int(block.get("sort_order", 0)))
    for order, block in enumerate(normalized):
        block["sort_order"] = order
    return normalized


def _section_settings(
    source: dict[str, object],
    *,
    layout: str,
    theme: str = "paper",
    spacing: str = "large",
    **extra: object,
) -> dict[str, object]:
    settings = dict(source.get("settings") or {})
    settings.update(
        theme=theme,
        surface="plain",
        width="wide",
        spacing=spacing,
        layout=layout,
        alignment="left",
        desktop_span=12,
        desktop_start=0,
        tablet_span=12,
        tablet_start=0,
        mobile_span=12,
        mobile_start=0,
        **extra,
    )
    return settings


def _insight_as_text(content: dict[str, object]) -> dict[str, object]:
    paragraphs = [
        str(content.get("statement") or "").strip(),
        str(content.get("rationale") or "").strip(),
        str(content.get("outcome") or "").strip(),
    ]
    return {
        "kicker": "",
        "eyebrow": str(content.get("eyebrow") or ""),
        "title": str(content.get("title") or ""),
        "body": "\n\n".join(paragraph for paragraph in paragraphs if paragraph),
        "tags": [],
    }


def _compose_gbu(source_blocks: list[dict[str, object]]) -> list[dict[str, object]]:
    blocks = _normalize_blocks(source_blocks)
    by_type = {str(block["type"]): block for block in blocks}
    required = {
        "hero",
        "media_hero",
        "text",
        "challenge_solution",
        "process",
        "image",
        "insight",
        "metrics",
        "results",
        "technologies",
        "next_case",
    }
    if not required.issubset(by_type):
        return blocks

    hero = by_type["hero"]
    hero["settings"] = {
        **dict(hero["settings"]),
        "layout": "case-header",
        "desktop_span": 12,
        "desktop_start": 0,
    }

    media = by_type["media_hero"]
    media["settings"] = {
        **dict(media["settings"]),
        "layout": "media-16x9",
        "desktop_span": 12,
        "desktop_start": 0,
    }

    about = by_type["text"]
    about["content_ru"] = {**dict(about["content_ru"]), "kicker": ""}
    about["content_en"] = {**dict(about["content_en"]), "kicker": ""}
    about["settings"] = _section_settings(about, layout="overview")

    challenge = by_type["challenge_solution"]
    challenge["settings"] = _section_settings(challenge, layout="narrative", theme="soft")

    process = by_type["process"]
    process["settings"] = _section_settings(
        process,
        layout="chapter",
        disclosure_mode="multiple",
        open_first=False,
    )

    image = by_type["image"]
    image["settings"] = _section_settings(image, layout="default", theme="soft")

    insight = by_type["insight"]
    insight["type"] = "text"
    insight["content_ru"] = _insight_as_text(dict(insight["content_ru"]))
    insight["content_en"] = _insight_as_text(dict(insight["content_en"]))
    insight["settings"] = _section_settings(insight, layout="editorial")

    metrics = by_type["metrics"]
    metrics_ru = dict(metrics["content_ru"])
    metrics_en = dict(metrics["content_en"])
    metrics_intro = {
        "id": _uuid("gbu-metrics-intro"),
        "type": "text",
        "content_ru": {
            "kicker": "",
            "eyebrow": str(metrics_ru.get("eyebrow") or ""),
            "title": str(metrics_ru.get("title") or ""),
            "body": str(metrics_ru.get("summary") or ""),
            "tags": [],
        },
        "content_en": {
            "kicker": "",
            "eyebrow": str(metrics_en.get("eyebrow") or ""),
            "title": str(metrics_en.get("title") or ""),
            "body": str(metrics_en.get("summary") or ""),
            "tags": [],
        },
        "settings": _section_settings(metrics, layout="editorial"),
        "sort_order": 0,
        "is_visible": True,
    }
    metrics["content_ru"] = {**metrics_ru, "eyebrow": "", "title": "", "summary": ""}
    metrics["content_en"] = {**metrics_en, "eyebrow": "", "title": "", "summary": ""}
    metrics["settings"] = _section_settings(
        metrics,
        layout="cards",
        spacing="normal",
        show_intro=False,
    )

    results = by_type["results"]
    results["content_ru"] = {**dict(results["content_ru"]), "kicker": ""}
    results["content_en"] = {**dict(results["content_en"]), "kicker": ""}
    results["settings"] = _section_settings(results, layout="statement")

    technology = by_type["technologies"]
    technology["settings"] = {
        **dict(technology["settings"]),
        "layout": "map",
        "desktop_span": 12,
        "desktop_start": 0,
    }

    next_case = by_type["next_case"]
    next_case["settings"] = {**dict(next_case["settings"]), "layout": "default"}

    composition = [
        hero,
        media,
        about,
        challenge,
        process,
        image,
        insight,
        metrics_intro,
        metrics,
        results,
        technology,
        next_case,
    ]
    for order, block in enumerate(composition):
        block["sort_order"] = order
    return composition


def _tables() -> tuple[sa.TableClause, sa.TableClause, sa.TableClause]:
    projects = sa.table(
        "projects",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("slug", sa.String()),
        sa.column("draft_data", postgresql.JSONB()),
        sa.column("published_data", postgresql.JSONB()),
        sa.column("updated_at", sa.DateTime()),
    )
    blocks = sa.table(
        "project_blocks",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("project_id", postgresql.UUID(as_uuid=True)),
        sa.column("type", sa.String()),
        sa.column("content_ru", postgresql.JSONB()),
        sa.column("content_en", postgresql.JSONB()),
        sa.column("settings", postgresql.JSONB()),
        sa.column("sort_order", sa.Integer()),
        sa.column("is_visible", sa.Boolean()),
    )
    revisions = sa.table(
        "project_revisions",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("project_id", postgresql.UUID(as_uuid=True)),
        sa.column("version", sa.Integer()),
        sa.column("snapshot", postgresql.JSONB()),
        sa.column("created_at", sa.DateTime()),
    )
    return projects, blocks, revisions


def _json_blocks(blocks: list[dict[str, object]]) -> list[dict[str, object]]:
    return [{**block, "id": str(block.get("id") or "")} for block in blocks]


def upgrade() -> None:
    connection = op.get_bind()
    projects, blocks, revisions = _tables()
    now = datetime.utcnow()

    project_rows = connection.execute(
        sa.select(projects.c.id, projects.c.slug, projects.c.draft_data, projects.c.published_data)
    ).mappings().all()
    for project in project_rows:
        rows = [
            dict(row)
            for row in connection.execute(
                sa.select(
                    blocks.c.id,
                    blocks.c.type,
                    blocks.c.content_ru,
                    blocks.c.content_en,
                    blocks.c.settings,
                    blocks.c.sort_order,
                    blocks.c.is_visible,
                ).where(blocks.c.project_id == project["id"])
            ).mappings()
        ]
        normalized_rows = _compose_gbu(rows) if project["slug"] == GBU_SLUG else _normalize_blocks(rows)
        if rows:
            connection.execute(blocks.delete().where(blocks.c.project_id == project["id"]))
            if normalized_rows:
                connection.execute(
                    blocks.insert(),
                    [{**block, "project_id": project["id"]} for block in normalized_rows],
                )

        published = dict(project["published_data"] or {})
        if not published:
            continue
        source_snapshot_blocks = [dict(block) for block in published.get("blocks", [])]
        normalized_snapshot_blocks = (
            _compose_gbu(source_snapshot_blocks)
            if project["slug"] == GBU_SLUG
            else _normalize_blocks(source_snapshot_blocks)
        )
        snapshot = {
            **published,
            "blocks": _json_blocks(normalized_snapshot_blocks),
        }
        connection.execute(
            projects.update().where(projects.c.id == project["id"]).values(
                published_data=snapshot,
                updated_at=now,
            )
        )
        if source_snapshot_blocks != snapshot["blocks"]:
            previous_version = connection.execute(
                sa.select(sa.func.max(revisions.c.version)).where(revisions.c.project_id == project["id"])
            ).scalar_one_or_none() or 0
            version = previous_version + 1
            connection.execute(
                revisions.insert().values(
                    id=_uuid(f"{project['slug']}-revision-{version}"),
                    project_id=project["id"],
                    version=version,
                    snapshot=snapshot,
                    created_at=now,
                )
            )


def downgrade() -> None:
    # Retired blocks and layouts intentionally stay removed.
    pass
