import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv

from app.core.database import async_session_maker
from app.core.storage import storage
from app.models import (
    AboutSection,
    Advantage,
    ClientType,
    Project,
    Service,
    ServiceExample,
    ServiceFeature,
    ServiceItem,
    SiteSetting,
    TechCategory,
    TechStack,
    WorkStage,
    WorkStagePoint,
)

load_dotenv()


async def clear_database(session):
    """Clear all tables before seeding."""
    print("Clearing existing data...")
    # Delete child records first (foreign key constraints)
    await session.execute(WorkStagePoint.__table__.delete())
    await session.execute(ServiceExample.__table__.delete())
    await session.execute(ServiceFeature.__table__.delete())
    await session.execute(ServiceItem.__table__.delete())
    # Delete parent records
    await session.execute(TechStack.__table__.delete())
    await session.execute(WorkStage.__table__.delete())
    await session.execute(Project.__table__.delete())
    await session.execute(Service.__table__.delete())
    await session.execute(Advantage.__table__.delete())
    await session.execute(ClientType.__table__.delete())
    await session.execute(AboutSection.__table__.delete())
    await session.execute(SiteSetting.__table__.delete())
    await session.commit()
    print("✓ Database cleared!")


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
            deadline_ru="от 1 до 3 недель",
            deadline_en="from 1 to 3 weeks",
            about_ru="Telegram Mini Apps — это современный способ создания веб-приложений, которые работают прямо в Telegram. Мы разрабатываем полнофункциональные приложения с использованием передовых технологий: React, Vue.js, TypeScript. Наши решения отличаются высокой производительностью, интуитивным интерфейсом и полной интеграцией с экосистемой Telegram.",
            about_en="Telegram Mini Apps is a modern way to create web applications that work directly in Telegram. We develop full-featured applications using cutting-edge technologies: React, Vue.js, TypeScript. Our solutions are characterized by high performance, intuitive interface and full integration with the Telegram ecosystem.",
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
            deadline_ru="от 5 дней до 2 недель",
            deadline_en="from 5 days to 2 weeks",
            about_ru="Telegram боты — это мощный инструмент для автоматизации бизнес-процессов. Мы создаем ботов любой сложности: от простых информационных до сложных систем с интеграцией баз данных, платежных систем и внешних API. Используем Python, aiogram и современные подходы к разработке.",
            about_en="Telegram bots are a powerful tool for automating business processes. We create bots of any complexity: from simple informational to complex systems with database integration, payment systems and external APIs. We use Python, aiogram and modern development approaches.",
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
            deadline_ru="от 1 до 4 недель",
            deadline_en="from 1 to 4 weeks",
            about_ru="Создаем современные веб-сайты с адаптивным дизайном, быстрой загрузкой и SEO-оптимизацией. Используем актуальные технологии: React, Next.js, Vue.js, Tailwind CSS. Все сайты оптимизированы для мобильных устройств и поисковых систем.",
            about_en="We create modern websites with responsive design, fast loading and SEO optimization. We use current technologies: React, Next.js, Vue.js, Tailwind CSS. All sites are optimized for mobile devices and search engines.",
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
            deadline_ru="от 3 до 8 недель",
            deadline_en="from 3 to 8 weeks",
            about_ru="Разрабатываем полнофункциональные интернет-магазины с удобной админ-панелью, интеграцией платежных систем, управлением товарами и заказами. Поддержка различных способов оплаты, автоматизация процессов, аналитика продаж.",
            about_en="We develop full-featured online stores with a convenient admin panel, payment system integration, product and order management. Support for various payment methods, process automation, sales analytics.",
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
            deadline_ru="от 2 до 6 недель",
            deadline_en="from 2 to 6 weeks",
            about_ru="Интегрируем современные AI-решения в ваш бизнес: чат-боты на базе GPT, системы анализа данных, автоматизация рутинных задач. Работаем с OpenAI API, LangChain, создаем кастомные ML-модели под ваши задачи.",
            about_en="We integrate modern AI solutions into your business: GPT-based chatbots, data analysis systems, routine task automation. We work with OpenAI API, LangChain, create custom ML models for your tasks.",
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
            deadline_ru="от 6 до 12 недель",
            deadline_en="from 6 to 12 weeks",
            about_ru="Создаем корпоративные системы для автоматизации внутренних процессов: CRM, ERP, системы управления проектами, HR-платформы. Используем современный стек технологий, обеспечиваем безопасность данных и масштабируемость решений.",
            about_en="We create corporate systems for internal process automation: CRM, ERP, project management systems, HR platforms. We use modern technology stack, ensure data security and solution scalability.",
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
            deadline_ru="от 4 до 10 недель",
            deadline_en="from 4 to 10 weeks",
            about_ru="Разрабатываем кроссплатформенные PWA-приложения, которые работают на всех устройствах. Пользователи могут устанавливать приложение на домашний экран, работать офлайн, получать push-уведомления — как в нативных приложениях, но без необходимости публикации в App Store и Google Play.",
            about_en="We develop cross-platform PWA applications that work on all devices. Users can install the app on their home screen, work offline, receive push notifications — just like native apps, but without the need to publish in the App Store and Google Play.",
            price_from=300000,
            price_currency="₽",
            sort_order=6,
        ),
    ]
    session.add_all(services)
    await session.flush()  # To get service IDs
    return services


async def seed_service_examples(session, services):
    """Seed service examples (примеры работ для каждой услуги)."""
    examples = [
        # Telegram Mini Apps примеры
        ServiceExample(
            service_id=services[0].id,
            title_ru="Интерактивное меню ресторана",
            title_en="Interactive Restaurant Menu",
            description_ru="Полнофункциональное меню с корзиной, оплатой и доставкой",
            description_en="Full-featured menu with cart, payment and delivery",
            price_from=120000,
            price_currency="₽",
            deadline_ru="1–2 недели",
            deadline_en="1–2 weeks",
            sort_order=0,
        ),
        ServiceExample(
            service_id=services[0].id,
            title_ru="Магазин одежды",
            title_en="Clothing Store",
            description_ru="Каталог товаров с фильтрами, размерами и примеркой AR",
            description_en="Product catalog with filters, sizes and AR try-on",
            price_from=150000,
            price_currency="₽",
            deadline_ru="2–3 недели",
            deadline_en="2–3 weeks",
            sort_order=1,
        ),
        # Telegram боты примеры
        ServiceExample(
            service_id=services[1].id,
            title_ru="Бот для записи в салон красоты",
            title_en="Beauty Salon Booking Bot",
            description_ru="Запись на услуги, выбор мастера, напоминания о записи",
            description_en="Service booking, master selection, appointment reminders",
            price_from=90000,
            price_currency="₽",
            deadline_ru="5–10 дней",
            deadline_en="5–10 days",
            sort_order=0,
        ),
        ServiceExample(
            service_id=services[1].id,
            title_ru="AI-помощник для поддержки клиентов",
            title_en="AI Customer Support Assistant",
            description_ru="Умный бот на базе GPT для ответов на вопросы клиентов",
            description_en="Smart GPT-based bot for answering customer questions",
            price_from=130000,
            price_currency="₽",
            deadline_ru="1–2 недели",
            deadline_en="1–2 weeks",
            sort_order=1,
        ),
        # Веб-сайты примеры
        ServiceExample(
            service_id=services[2].id,
            title_ru="Лендинг для стартапа",
            title_en="Startup Landing Page",
            description_ru="Одностраничный сайт с формой захвата лидов",
            description_en="Single-page site with lead capture form",
            price_from=50000,
            price_currency="₽",
            deadline_ru="3–5 дней",
            deadline_en="3–5 days",
            sort_order=0,
        ),
        ServiceExample(
            service_id=services[2].id,
            title_ru="Корпоративный сайт",
            title_en="Corporate Website",
            description_ru="Многостраничный сайт с блогом и формой обратной связи",
            description_en="Multi-page site with blog and contact form",
            price_from=120000,
            price_currency="₽",
            deadline_ru="2–4 недели",
            deadline_en="2–4 weeks",
            sort_order=1,
        ),
    ]
    session.add_all(examples)


async def seed_service_features(session, services):
    """Seed service features (ключевые особенности услуг)."""
    features = [
        # Telegram Mini Apps
        ServiceFeature(
            service_id=services[0].id,
            text_ru="Работает прямо в Telegram без установки",
            text_en="Works directly in Telegram without installation",
            sort_order=0,
        ),
        ServiceFeature(
            service_id=services[0].id,
            text_ru="Интеграция с Telegram Payments",
            text_en="Integration with Telegram Payments",
            sort_order=1,
        ),
        ServiceFeature(
            service_id=services[0].id,
            text_ru="Доступ к данным пользователя Telegram",
            text_en="Access to Telegram user data",
            sort_order=2,
        ),
        # Telegram боты
        ServiceFeature(
            service_id=services[1].id,
            text_ru="24/7 автоматизация процессов",
            text_en="24/7 process automation",
            sort_order=0,
        ),
        ServiceFeature(
            service_id=services[1].id,
            text_ru="Интеграция с вашими системами",
            text_en="Integration with your systems",
            sort_order=1,
        ),
        ServiceFeature(
            service_id=services[1].id,
            text_ru="Аналитика и статистика",
            text_en="Analytics and statistics",
            sort_order=2,
        ),
        # Веб-сайты
        ServiceFeature(
            service_id=services[2].id,
            text_ru="Адаптивный дизайн для всех устройств",
            text_en="Responsive design for all devices",
            sort_order=0,
        ),
        ServiceFeature(
            service_id=services[2].id,
            text_ru="SEO-оптимизация из коробки",
            text_en="SEO optimization out of the box",
            sort_order=1,
        ),
        ServiceFeature(
            service_id=services[2].id,
            text_ru="Быстрая загрузка страниц",
            text_en="Fast page loading",
            sort_order=2,
        ),
    ]
    session.add_all(features)


async def seed_service_items(session, services):
    """Seed service items (что входит в услугу)."""
    items = [
        # Telegram Mini Apps
        ServiceItem(
            service_id=services[0].id,
            title_ru="Дизайн интерфейса",
            title_en="Interface Design",
            description_ru="Разработка UI/UX дизайна в стиле Telegram",
            description_en="UI/UX design development in Telegram style",
            sort_order=0,
        ),
        ServiceItem(
            service_id=services[0].id,
            title_ru="Frontend разработка",
            title_en="Frontend Development",
            description_ru="React/Vue.js + TypeScript + Telegram SDK",
            description_en="React/Vue.js + TypeScript + Telegram SDK",
            sort_order=1,
        ),
        ServiceItem(
            service_id=services[0].id,
            title_ru="Backend API",
            title_en="Backend API",
            description_ru="FastAPI + PostgreSQL + Redis",
            description_en="FastAPI + PostgreSQL + Redis",
            sort_order=2,
        ),
        ServiceItem(
            service_id=services[0].id,
            title_ru="Деплой и настройка",
            title_en="Deploy and Setup",
            description_ru="Настройка сервера, домена, SSL-сертификата",
            description_en="Server, domain, SSL certificate setup",
            sort_order=3,
        ),
        # Telegram боты
        ServiceItem(
            service_id=services[1].id,
            title_ru="Логика бота",
            title_en="Bot Logic",
            description_ru="Программирование всех функций и команд",
            description_en="Programming all functions and commands",
            sort_order=0,
        ),
        ServiceItem(
            service_id=services[1].id,
            title_ru="База данных",
            title_en="Database",
            description_ru="Проектирование и настройка БД",
            description_en="Database design and setup",
            sort_order=1,
        ),
        ServiceItem(
            service_id=services[1].id,
            title_ru="Админ-панель",
            title_en="Admin Panel",
            description_ru="Веб-интерфейс для управления ботом",
            description_en="Web interface for bot management",
            sort_order=2,
        ),
    ]
    session.add_all(items)


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


async def seed_client_types(session):
    """Seed client types (типы клиентов)."""
    client_types = [
        ClientType(
            title_ru="Малый бизнес",
            title_en="Small Business",
            subtitle_ru="Кафе, салоны, магазины",
            subtitle_en="Cafes, salons, stores",
            description_ru="Помогаем малому бизнесу автоматизировать процессы и выйти в онлайн. Создаем доступные решения: от простых ботов для приема заказов до полноценных интернет-магазинов. Быстрый запуск, понятные инструменты, поддержка на каждом этапе.",
            description_en="We help small businesses automate processes and go online. We create affordable solutions: from simple order bots to full-fledged online stores. Quick launch, clear tools, support at every stage.",
            sort_order=0,
        ),
        ClientType(
            title_ru="Средний бизнес",
            title_en="Medium Business",
            subtitle_ru="Компании, сети, франшизы",
            subtitle_en="Companies, chains, franchises",
            description_ru="Разрабатываем комплексные решения для среднего бизнеса: корпоративные системы, CRM, автоматизация процессов продаж и маркетинга. Интеграция с существующими системами, аналитика, масштабируемость.",
            description_en="We develop comprehensive solutions for medium-sized businesses: corporate systems, CRM, sales and marketing process automation. Integration with existing systems, analytics, scalability.",
            sort_order=1,
        ),
        ClientType(
            title_ru="Стартапы",
            title_en="Startups",
            subtitle_ru="MVP и прототипы",
            subtitle_en="MVP and prototypes",
            description_ru="Быстро создаем MVP для стартапов: от идеи до первых пользователей за 2-4 недели. Помогаем проверить гипотезы с минимальными вложениями, итерируем на основе фидбека. Готовы расти вместе с вашим проектом.",
            description_en="We quickly create MVPs for startups: from idea to first users in 2-4 weeks. We help test hypotheses with minimal investment, iterate based on feedback. Ready to grow with your project.",
            sort_order=2,
        ),
        ClientType(
            title_ru="Частные лица",
            title_en="Individuals",
            subtitle_ru="Блогеры, фрилансеры",
            subtitle_en="Bloggers, freelancers",
            description_ru="Создаем персональные проекты: сайты-портфолио, боты для автоматизации, лендинги для продажи услуг. Доступные цены, индивидуальный подход, обучение работе с готовым продуктом.",
            description_en="We create personal projects: portfolio sites, automation bots, landing pages for selling services. Affordable prices, individual approach, training on working with the finished product.",
            sort_order=3,
        ),
    ]
    session.add_all(client_types)


async def seed_about_sections(session):
    """Seed about sections (о компании/команде)."""
    sections = [
        AboutSection(
            title_ru="Наша философия",
            title_en="Our Philosophy",
            description_ru="Мы верим, что качественные IT-решения должны быть доступны каждому бизнесу, независимо от его размера. Поэтому мы предлагаем оптимальное соотношение цены и качества, используя современные технологии и лучшие практики разработки.",
            description_en="We believe that quality IT solutions should be accessible to every business, regardless of its size. That's why we offer the best price-quality ratio, using modern technologies and best development practices.",
            sort_order=0,
        ),
        AboutSection(
            title_ru="Наш подход",
            title_en="Our Approach",
            description_ru="Мы работаем по agile-методологии: разбиваем проект на этапы, показываем промежуточные результаты, быстро реагируем на изменения. Вы всегда в курсе прогресса и можете влиять на процесс разработки.",
            description_en="We work according to agile methodology: we break the project into stages, show intermediate results, quickly respond to changes. You are always aware of the progress and can influence the development process.",
            sort_order=1,
        ),
        AboutSection(
            title_ru="Технологии",
            title_en="Technologies",
            description_ru="Используем проверенный стек технологий: Python, React, Vue.js, TypeScript, PostgreSQL, Docker. Это позволяет создавать надежные, быстрые и масштабируемые решения, которые легко поддерживать и развивать.",
            description_en="We use a proven technology stack: Python, React, Vue.js, TypeScript, PostgreSQL, Docker. This allows us to create reliable, fast and scalable solutions that are easy to maintain and develop.",
            sort_order=2,
        ),
    ]
    session.add_all(sections)


async def seed_projects(session):
    projects = [
        Project(
            type_ru="Telegram Mini App",
            type_en="Telegram Mini App",
            name_ru="Меню ресторана",
            name_en="Restaurant Menu",
            description_ru="Интерактивное меню с корзиной, оплатой и интеграцией с системой доставки. Клиенты могут просматривать блюда, добавлять в корзину, оплачивать через Telegram Payments и отслеживать статус заказа.",
            description_en="Interactive menu with cart, payment and delivery system integration. Customers can browse dishes, add to cart, pay via Telegram Payments and track order status.",
            image_url="https://placehold.co/600x400/2563eb/ffffff?text=Restaurant+Menu",
            project_url="https://t.me/restaurant_menu_bot",
            sort_order=0,
        ),
        Project(
            type_ru="Веб-сайт",
            type_en="Website",
            name_ru="Корпоративный сайт",
            name_en="Corporate Website",
            description_ru="Современный корпоративный сайт для IT-компании с разделами о услугах, кейсах, команде и блогом. Адаптивный дизайн, SEO-оптимизация, форма обратной связи.",
            description_en="Modern corporate website for IT company with sections about services, cases, team and blog. Responsive design, SEO optimization, contact form.",
            image_url="https://placehold.co/600x400/059669/ffffff?text=Corporate+Site",
            project_url="https://example-corp.com",
            sort_order=1,
        ),
        Project(
            type_ru="Telegram бот",
            type_en="Telegram Bot",
            name_ru="Бот записи на услуги",
            name_en="Service Booking Bot",
            description_ru="Автоматизация записи клиентов в салон красоты. Выбор мастера, услуги, времени, напоминания о записи, интеграция с календарем и CRM-системой.",
            description_en="Automation of client booking in beauty salon. Master selection, service, time, appointment reminders, calendar and CRM integration.",
            image_url="https://placehold.co/600x400/dc2626/ffffff?text=Booking+Bot",
            project_url="https://t.me/beauty_booking_bot",
            sort_order=2,
        ),
        Project(
            type_ru="Интернет-магазин",
            type_en="E-commerce",
            name_ru="Магазин электроники",
            name_en="Electronics Store",
            description_ru="Полнофункциональный интернет-магазин электроники с каталогом, фильтрами, корзиной, личным кабинетом, интеграцией оплаты и доставки. Админ-панель для управления товарами и заказами.",
            description_en="Full-featured electronics online store with catalog, filters, cart, personal account, payment and delivery integration. Admin panel for product and order management.",
            image_url="https://placehold.co/600x400/7c3aed/ffffff?text=Electronics+Store",
            project_url="https://example-electronics.com",
            sort_order=3,
        ),
        Project(
            type_ru="AI решение",
            type_en="AI Solution",
            name_ru="AI-ассистент для поддержки",
            name_en="AI Support Assistant",
            description_ru="Интеллектуальный помощник на базе GPT для автоматизации клиентской поддержки. Отвечает на вопросы, помогает с заказами, передает сложные случаи операторам.",
            description_en="Intelligent GPT-based assistant for customer support automation. Answers questions, helps with orders, transfers complex cases to operators.",
            image_url="https://placehold.co/600x400/ea580c/ffffff?text=AI+Assistant",
            project_url="https://t.me/ai_support_bot",
            sort_order=4,
        ),
        Project(
            type_ru="Корпоративная система",
            type_en="Enterprise System",
            name_ru="CRM-система",
            name_en="CRM System",
            description_ru="Кастомная CRM-система для управления клиентами, сделками и задачами. Воронка продаж, автоматизация процессов, интеграция с email и мессенджерами, аналитика.",
            description_en="Custom CRM system for managing customers, deals and tasks. Sales funnel, process automation, email and messenger integration, analytics.",
            image_url="https://placehold.co/600x400/0891b2/ffffff?text=CRM+System",
            project_url="https://example-crm.com",
            sort_order=5,
        ),
    ]
    session.add_all(projects)


async def upload_tech_icons():
    """Upload 3D tech icons to MinIO storage."""
    icons_dir = Path(__file__).parent / "voxel_tech_icons"

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
            duration_ru="1-3 дня",
            duration_en="1-3 days",
            full_description_ru="На этом этапе мы детально разбираем ваши задачи и цели проекта. Проводим встречу (онлайн или офлайн), обсуждаем функциональные требования, целевую аудиторию, ожидаемые результаты. Анализируем конкурентов, подбираем оптимальный стек технологий. Составляем техническое задание и план разработки с четкими сроками и этапами.",
            full_description_en="At this stage, we analyze your tasks and project goals in detail. We hold a meeting (online or offline), discuss functional requirements, target audience, expected results. We analyze competitors, select the optimal technology stack. We create technical specifications and a development plan with clear deadlines and stages.",
        ),
        WorkStage(
            step_number=2,
            title_ru="Дизайн и прототипирование",
            title_en="Design & Prototyping",
            description_ru="Создание макетов интерфейса, согласование с заказчиком",
            description_en="Creating interface mockups, client approval",
            duration_ru="2-5 дней",
            duration_en="2-5 days",
            full_description_ru="Разрабатываем UI/UX дизайн будущего продукта. Создаем прототипы основных экранов и пользовательских сценариев. Подбираем цветовую палитру, шрифты, иконки. Показываем макеты вам на согласование, вносим правки. После утверждения дизайна переходим к разработке. Используем Figma для создания интерактивных прототипов.",
            full_description_en="We develop UI/UX design for the future product. We create prototypes of main screens and user scenarios. We select color palette, fonts, icons. We show you mockups for approval, make adjustments. After design approval, we move to development. We use Figma to create interactive prototypes.",
        ),
        WorkStage(
            step_number=3,
            title_ru="Разработка и тестирование",
            title_en="Development & Testing",
            description_ru="Написание кода, тестирование, исправление багов",
            description_en="Writing code, testing, bug fixing",
            duration_ru="1-8 недель",
            duration_en="1-8 weeks",
            full_description_ru="Основной этап работы — программирование всех функций продукта. Пишем чистый, масштабируемый код с использованием лучших практик. Регулярно показываем промежуточные результаты, собираем ваш фидбек. Проводим тестирование: функциональное, интеграционное, нагрузочное. Исправляем найденные баги. Оптимизируем производительность.",
            full_description_en="The main stage of work is programming all product functions. We write clean, scalable code using best practices. We regularly show intermediate results, collect your feedback. We conduct testing: functional, integration, load. We fix found bugs. We optimize performance.",
        ),
        WorkStage(
            step_number=4,
            title_ru="Запуск и поддержка",
            title_en="Launch & Support",
            description_ru="Деплой на сервер, первый месяц поддержки бесплатно",
            description_en="Server deployment, first month of support free",
            duration_ru="1-2 дня + 1 месяц",
            duration_en="1-2 days + 1 month",
            full_description_ru="Разворачиваем проект на боевом сервере. Настраиваем домен, SSL-сертификат, мониторинг. Проверяем работу всех функций в продакшене. Обучаем вас работе с админ-панелью, если она есть. Передаем всю документацию и исходный код. Первый месяц предоставляем бесплатную техническую поддержку: исправление багов, консультации, небольшие доработки.",
            full_description_en="We deploy the project on the production server. We configure domain, SSL certificate, monitoring. We check all functions in production. We train you to work with the admin panel, if any. We transfer all documentation and source code. We provide free technical support for the first month: bug fixes, consultations, minor improvements.",
        ),
    ]
    session.add_all(stages)
    await session.flush()  # To get stage IDs
    return stages


async def seed_work_stage_points(session, stages):
    """Seed work stage points (ключевые пункты этапов работы)."""
    points = [
        # Этап 1: Анализ и планирование
        WorkStagePoint(
            stage_id=stages[0].id,
            text_ru="Встреча и обсуждение проекта",
            text_en="Meeting and project discussion",
            sort_order=0,
        ),
        WorkStagePoint(
            stage_id=stages[0].id,
            text_ru="Анализ конкурентов и рынка",
            text_en="Competitor and market analysis",
            sort_order=1,
        ),
        WorkStagePoint(
            stage_id=stages[0].id,
            text_ru="Составление ТЗ и плана",
            text_en="Creating specifications and plan",
            sort_order=2,
        ),
        # Этап 2: Дизайн и прототипирование
        WorkStagePoint(
            stage_id=stages[1].id,
            text_ru="Разработка UI/UX дизайна",
            text_en="UI/UX design development",
            sort_order=0,
        ),
        WorkStagePoint(
            stage_id=stages[1].id,
            text_ru="Создание интерактивных прототипов",
            text_en="Creating interactive prototypes",
            sort_order=1,
        ),
        WorkStagePoint(
            stage_id=stages[1].id,
            text_ru="Согласование и внесение правок",
            text_en="Approval and making adjustments",
            sort_order=2,
        ),
        # Этап 3: Разработка и тестирование
        WorkStagePoint(
            stage_id=stages[2].id,
            text_ru="Frontend и Backend разработка",
            text_en="Frontend and Backend development",
            sort_order=0,
        ),
        WorkStagePoint(
            stage_id=stages[2].id,
            text_ru="Интеграция с внешними сервисами",
            text_en="Integration with external services",
            sort_order=1,
        ),
        WorkStagePoint(
            stage_id=stages[2].id,
            text_ru="Тестирование и оптимизация",
            text_en="Testing and optimization",
            sort_order=2,
        ),
        # Этап 4: Запуск и поддержка
        WorkStagePoint(
            stage_id=stages[3].id,
            text_ru="Деплой на продакшен сервер",
            text_en="Deploy to production server",
            sort_order=0,
        ),
        WorkStagePoint(
            stage_id=stages[3].id,
            text_ru="Настройка мониторинга",
            text_en="Monitoring setup",
            sort_order=1,
        ),
        WorkStagePoint(
            stage_id=stages[3].id,
            text_ru="Обучение и передача проекта",
            text_en="Training and project handover",
            sort_order=2,
        ),
    ]
    session.add_all(points)


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
        # Clear existing data
        await clear_database(session)

        print("\nSeeding database...")

        print("Seeding services...")
        services = await seed_services(session)

        print("Seeding service examples...")
        await seed_service_examples(session, services)

        print("Seeding service features...")
        await seed_service_features(session, services)

        print("Seeding service items...")
        await seed_service_items(session, services)

        print("Seeding advantages...")
        await seed_advantages(session)

        print("Seeding client types...")
        await seed_client_types(session)

        print("Seeding about sections...")
        await seed_about_sections(session)

        print("Seeding projects...")
        await seed_projects(session)

        print("Seeding tech stack...")
        await seed_tech_stack(session)

        print("Seeding work stages...")
        stages = await seed_work_stages(session)

        print("Seeding work stage points...")
        await seed_work_stage_points(session, stages)

        print("Seeding settings...")
        await seed_settings(session)

        await session.commit()
        print("\n✓ Done! Database seeded successfully with all fields filled!")


if __name__ == "__main__":
    asyncio.run(main())
