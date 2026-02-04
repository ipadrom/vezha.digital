import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

from app.core.database import async_session_maker
from app.core.storage import storage
from app.models import (
    Advantage,
    Project,
    Service,
    SiteSetting,
    TechCategory,
    TechStack,
    WorkStage,
)

load_dotenv()


async def seed_services(session):
    services = [
        Service(
            icon="smartphone",
            name_ru="Telegram Mini Apps",
            name_en="Telegram Mini Apps",
            description_ru="Полный цикл разработки мини-приложений в Telegram",
            description_en="Full cycle development of mini-apps in Telegram",
            examples_ru="Примеры: меню, магазины, игры, сервисы бронирования, системы лояльности",
            examples_en="Examples: menus, stores, games, booking services, loyalty systems",
            price_from=100000,
            price_currency="₽",
            sort_order=0,
        ),
        Service(
            icon="bot",
            name_ru="Telegram боты",
            name_en="Telegram Bots",
            description_ru="Автоматизация бизнес-процессов через Telegram-ботов",
            description_en="Business process automation through Telegram bots",
            examples_ru="Примеры: приём заявок, рассылки, запись на услуги, AI-помощники",
            examples_en="Examples: order intake, newsletters, service booking, AI assistants",
            price_from=80000,
            price_currency="₽",
            sort_order=1,
        ),
        Service(
            icon="globe",
            name_ru="Веб-сайты",
            name_en="Websites",
            description_ru="Разработка современных адаптивных сайтов",
            description_en="Development of modern responsive websites",
            examples_ru="Примеры: лендинги, корпоративные сайты, каталоги, блоги",
            examples_en="Examples: landing pages, corporate sites, catalogs, blogs",
            price_from=50000,
            price_currency="₽",
            sort_order=2,
        ),
        Service(
            icon="shopping-cart",
            name_ru="Интернет-магазины",
            name_en="E-commerce",
            description_ru="Полнофункциональные решения для e-commerce",
            description_en="Full-featured e-commerce solutions",
            examples_ru="Примеры: от простых магазинов до крупных площадок с каталогами",
            examples_en="Examples: from simple stores to large marketplaces with catalogs",
            price_from=200000,
            price_currency="₽",
            sort_order=3,
        ),
        Service(
            icon="cpu",
            name_ru="AI и автоматизация",
            name_en="AI & Automation",
            description_ru="Внедрение AI решений и автоматизация процессов",
            description_en="AI solutions implementation and process automation",
            examples_ru="Примеры: чат-боты с AI, анализ данных, интеграция API",
            examples_en="Examples: AI chatbots, data analysis, API integration",
            price_from=120000,
            price_currency="₽",
            sort_order=4,
        ),
        Service(
            icon="building",
            name_ru="Корпоративные системы",
            name_en="Enterprise Systems",
            description_ru="Разработка внутренних систем для бизнеса",
            description_en="Development of internal business systems",
            examples_ru="Примеры: CRM, учёт времени, HR-системы, аналитика",
            examples_en="Examples: CRM, time tracking, HR systems, analytics",
            price_from=400000,
            price_currency="₽",
            sort_order=5,
        ),
        Service(
            icon="smartphone",
            name_ru="Мобильные приложения",
            name_en="Mobile Applications",
            description_ru="Разработка кроссплатформенных PWA-приложений",
            description_en="Cross-platform PWA application development",
            examples_ru="Примеры: Progressive Web Apps с функциями нативных приложений",
            examples_en="Examples: Progressive Web Apps with native app features",
            price_from=300000,
            price_currency="₽",
            sort_order=6,
        ),
    ]
    session.add_all(services)


async def seed_advantages(session):
    advantages = [
        Advantage(
            icon="zap",
            title_ru="Быстрая разработка",
            title_en="Fast Development",
            description_ru="От 5 дней до 1 месяца в зависимости от сложности",
            description_en="From 5 days to 1 month depending on complexity",
            sort_order=0,
        ),
        Advantage(
            icon="trending-down",
            title_ru="Цены ниже рынка",
            title_en="Below Market Prices",
            description_ru="На 20-40% дешевле, чем у конкурентов",
            description_en="20-40% cheaper than competitors",
            sort_order=1,
        ),
    ]
    session.add_all(advantages)


async def seed_projects(session):
    projects = [
        Project(
            type_ru="Telegram Mini App",
            type_en="Telegram Mini App",
            name_ru="Меню ресторана",
            name_en="Restaurant Menu",
            description_ru="Интерактивное меню с корзиной и оплатой",
            description_en="Interactive menu with cart and payment",
            sort_order=0,
        ),
        Project(
            type_ru="Веб-сайт",
            type_en="Website",
            name_ru="Корпоративный сайт",
            name_en="Corporate Website",
            description_ru="Сайт для IT-компании",
            description_en="Website for IT company",
            sort_order=1,
        ),
        Project(
            type_ru="Telegram бот",
            type_en="Telegram Bot",
            name_ru="Бот записи на услуги",
            name_en="Service Booking Bot",
            description_ru="Автоматизация записи клиентов",
            description_en="Client booking automation",
            sort_order=2,
        ),
        Project(
            type_ru="Интернет-магазин",
            type_en="E-commerce",
            name_ru="Магазин электроники",
            name_en="Electronics Store",
            description_ru="Полнофункциональный интернет-магазин",
            description_en="Full-featured online store",
            sort_order=3,
        ),
        Project(
            type_ru="AI решение",
            type_en="AI Solution",
            name_ru="AI-ассистент",
            name_en="AI Assistant",
            description_ru="Интеллектуальный помощник для бизнеса",
            description_en="Intelligent business assistant",
            sort_order=4,
        ),
        Project(
            type_ru="Корпоративная система",
            type_en="Enterprise System",
            name_ru="CRM-система",
            name_en="CRM System",
            description_ru="Система управления клиентами",
            description_en="Customer management system",
            sort_order=5,
        ),
    ]
    session.add_all(projects)


async def upload_tech_icons():
    """Upload 3D tech icons to MinIO storage."""
    icons_dir = Path(__file__).parent.parent / "voxel_tech_icons"

    if not icons_dir.exists():
        print(f"Warning: Icons directory not found at {icons_dir}")
        return

    print("Uploading 3D tech icons to MinIO...")

    # Get all technology folders
    tech_folders = [f for f in icons_dir.iterdir() if f.is_dir()]

    for tech_folder in tech_folders:
        tech_name = tech_folder.name
        print(f"  Uploading {tech_name}...")

        # Upload all files in the folder
        for file_path in tech_folder.iterdir():
            if file_path.is_file():
                with open(file_path, "rb") as f:
                    content_type = "model/gltf+json" if file_path.suffix == ".gltf" else "image/png"
                    storage.upload_file(
                        file_data=f.read(),
                        filename=file_path.name,
                        content_type=content_type,
                        prefix=f"voxel_tech_icons/{tech_name}/",
                    )

    print("✓ 3D tech icons uploaded successfully!")


async def seed_tech_stack(session):
    base_url = os.getenv('MINIO_PUBLIC_URL')

    tech_items = [
        # Frontend
        TechStack(
            category=TechCategory.FRONTEND,
            icon=f"{base_url}/uploads/voxel_tech_icons/react/palette.png",
            icon_format=f"{base_url}/uploads/voxel_tech_icons/react/react.gltf",
            name="REACT",
            subtitle_ru="UI библиотека",
            subtitle_en="UI Library",
            sort_order=0,
        ),
        TechStack(
            category=TechCategory.FRONTEND,
            icon=f"{base_url}/uploads/voxel_tech_icons/vue/palette.png",
            icon_format=f"{base_url}/uploads/voxel_tech_icons/vue/vue.gltf",
            name="VUE 3",
            subtitle_ru="Прогрессивный фреймворк",
            subtitle_en="Progressive Framework",
            sort_order=1,
        ),
        TechStack(
            category=TechCategory.FRONTEND,
            icon=f"{base_url}/uploads/voxel_tech_icons/nextjs/palette.png",
            icon_format=f"{base_url}/uploads/voxel_tech_icons/nextjs/nextjs.gltf",
            name="Next.js",
            subtitle_ru="React фреймворк",
            subtitle_en="React Framework",
            sort_order=2,
        ),
        TechStack(
            category=TechCategory.FRONTEND,
            icon=f"{base_url}/uploads/voxel_tech_icons/typescript/palette.png",
            icon_format=f"{base_url}/uploads/voxel_tech_icons/typescript/typescript.gltf",
            name="TypeScript",
            subtitle_ru="Типизация JS",
            subtitle_en="JS Typing",
            sort_order=3,
        ),
        TechStack(
            category=TechCategory.FRONTEND,
            icon=f"{base_url}/uploads/voxel_tech_icons/tailwind/palette.png",
            icon_format=f"{base_url}/uploads/voxel_tech_icons/tailwind/tailwind.gltf",
            name="Tailwind",
            subtitle_ru="CSS фреймворк",
            subtitle_en="CSS Framework",
            sort_order=4,
        ),

        # Backend
        TechStack(
            category=TechCategory.BACKEND,
            icon=f"{base_url}/uploads/voxel_tech_icons/python/palette.png",
            icon_format=f"{base_url}/uploads/voxel_tech_icons/python/python.gltf",
            name="Python",
            subtitle_ru="Основной язык",
            subtitle_en="Primary Language",
            sort_order=0,
        ),
        TechStack(
            category=TechCategory.BACKEND,
            icon=f"{base_url}/uploads/voxel_tech_icons/fastapi/palette.png",
            icon_format=f"{base_url}/uploads/voxel_tech_icons/fastapi/fastapi.gltf",
            name="FastAPI",
            subtitle_ru="Веб-фреймворк",
            subtitle_en="Web Framework",
            sort_order=1,
        ),
        TechStack(
            category=TechCategory.BACKEND,
            icon=f"{base_url}/uploads/voxel_tech_icons/postgresql/palette.png",
            icon_format=f"{base_url}/uploads/voxel_tech_icons/postgresql/postgresql.gltf",
            name="PostgreSQL",
            subtitle_ru="База данных",
            subtitle_en="Database",
            sort_order=2,
        ),
        TechStack(
            category=TechCategory.BACKEND,
            icon=f"{base_url}/uploads/voxel_tech_icons/docker/palette.png",
            icon_format=f"{base_url}/uploads/voxel_tech_icons/docker/docker.gltf",
            name="Docker",
            subtitle_ru="Контейнеризация",
            subtitle_en="Containerization",
            sort_order=3,
        ),
    ]
    session.add_all(tech_items)


async def seed_work_stages(session):
    stages = [
        WorkStage(
            step_number=1,
            title_ru="Анализ и планирование",
            title_en="Analysis & Planning",
            description_ru="Обсуждение целей, анализ технических требований, составление плана",
            description_en="Discussing goals, analyzing technical requirements, creating a plan",
        ),
        WorkStage(
            step_number=2,
            title_ru="Дизайн и прототипирование",
            title_en="Design & Prototyping",
            description_ru="Создание макетов интерфейса, согласование с заказчиком",
            description_en="Creating interface mockups, client approval",
        ),
        WorkStage(
            step_number=3,
            title_ru="Разработка и тестирование",
            title_en="Development & Testing",
            description_ru="Написание кода, тестирование, исправление багов",
            description_en="Writing code, testing, bug fixing",
        ),
        WorkStage(
            step_number=4,
            title_ru="Запуск и поддержка",
            title_en="Launch & Support",
            description_ru="Деплой на сервер, первый месяц поддержки бесплатно",
            description_en="Server deployment, first month of support free",
        ),
    ]
    session.add_all(stages)


async def seed_settings(session):
    settings_data = [
        SiteSetting(
            key="hero_title",
            value_ru="Разработка под ключ от {price} ₽",
            value_en="Turnkey Development from {price} ₽",
        ),
        SiteSetting(
            key="hero_subtitle",
            value_ru="Запустим ваш проект за 1-4 недели",
            value_en="We'll launch your project in 1-4 weeks",
        ),
        SiteSetting(
            key="hero_price",
            value_ru="50 000",
            value_en="50,000",
        ),
        SiteSetting(
            key="contact_telegram",
            value_ru="@company_manager",
            value_en="@company_manager",
        ),
        SiteSetting(
            key="contact_email",
            value_ru="hello@vezha.digital",
            value_en="hello@vezha.digital",
        ),
        SiteSetting(
            key="contact_phone",
            value_ru="+7 (777) 777-77-77",
            value_en="+7 (777) 777-77-77",
        ),
        SiteSetting(
            key="footer_copyright",
            value_ru="VEZHA Digital. Все права защищены.",
            value_en="VEZHA Digital. All rights reserved.",
        ),
        SiteSetting(
            key="cta_title",
            value_ru="Готовы начать?",
            value_en="Ready to Start?",
        ),
        SiteSetting(
            key="cta_subtitle",
            value_ru="Обсудим ваш проект и рассчитаем точную стоимость",
            value_en="Let's discuss your project and calculate the exact cost",
        ),
    ]
    session.add_all(settings_data)


async def main():
    # First, upload 3D tech icons to MinIO
    await upload_tech_icons()

    async with async_session_maker() as session:
        print("\nSeeding database...")
        print("Seeding services...")
        await seed_services(session)

        print("Seeding advantages...")
        await seed_advantages(session)

        print("Seeding projects...")
        await seed_projects(session)

        print("Seeding tech stack...")
        await seed_tech_stack(session)

        print("Seeding work stages...")
        await seed_work_stages(session)

        print("Seeding settings...")
        await seed_settings(session)

        await session.commit()
        print("\n✓ Done! Database seeded successfully with 3D icons!")


if __name__ == "__main__":
    asyncio.run(main())
