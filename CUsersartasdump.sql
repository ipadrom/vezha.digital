--
-- PostgreSQL database dump
--

\restrict jwaUmrlSBs1iNYxyKGMu9IZawYXMRsGuxKGCEXvoplb8RmIPEMccd5cLDEw4GDi

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: techcategory; Type: TYPE; Schema: public; Owner: vezha
--

CREATE TYPE public.techcategory AS ENUM (
    'FRONTEND',
    'BACKEND'
);


ALTER TYPE public.techcategory OWNER TO vezha;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: about_sections; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.about_sections (
    id uuid NOT NULL,
    title_ru character varying(255) NOT NULL,
    title_en character varying(255) NOT NULL,
    description_ru text NOT NULL,
    description_en text NOT NULL,
    sort_order integer NOT NULL,
    is_active boolean NOT NULL
);


ALTER TABLE public.about_sections OWNER TO vezha;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.admins (
    id uuid NOT NULL,
    telegram_id bigint NOT NULL,
    username character varying(100),
    first_name character varying(100),
    last_name character varying(100),
    photo_url character varying(500),
    is_active boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    last_login timestamp without time zone
);


ALTER TABLE public.admins OWNER TO vezha;

--
-- Name: advantages; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.advantages (
    id uuid NOT NULL,
    icon character varying(500) NOT NULL,
    title_ru character varying(255) NOT NULL,
    title_en character varying(255) NOT NULL,
    description_ru text NOT NULL,
    description_en text NOT NULL,
    sort_order integer NOT NULL,
    is_active boolean NOT NULL
);


ALTER TABLE public.advantages OWNER TO vezha;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO vezha;

--
-- Name: client_types; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.client_types (
    id uuid NOT NULL,
    title_ru character varying(255) NOT NULL,
    title_en character varying(255) NOT NULL,
    subtitle_ru character varying(255) NOT NULL,
    subtitle_en character varying(255) NOT NULL,
    description_ru text NOT NULL,
    description_en text NOT NULL,
    sort_order integer NOT NULL,
    is_active boolean NOT NULL
);


ALTER TABLE public.client_types OWNER TO vezha;

--
-- Name: contact_requests; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.contact_requests (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    contact character varying(255) NOT NULL,
    message text NOT NULL,
    ip_address character varying(45),
    user_agent text,
    is_processed boolean NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.contact_requests OWNER TO vezha;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.projects (
    id uuid NOT NULL,
    type_ru character varying(100) NOT NULL,
    type_en character varying(100) NOT NULL,
    name_ru character varying(255) NOT NULL,
    name_en character varying(255) NOT NULL,
    description_ru text,
    description_en text,
    image_url character varying(500),
    project_url character varying(500),
    sort_order integer NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.projects OWNER TO vezha;

--
-- Name: section_visibility; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.section_visibility (
    id uuid NOT NULL,
    section_key character varying(100) NOT NULL,
    section_name_ru character varying(200) NOT NULL,
    section_name_en character varying(200) NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.section_visibility OWNER TO vezha;

--
-- Name: service_examples; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.service_examples (
    id uuid NOT NULL,
    service_id uuid NOT NULL,
    title_ru character varying(255) NOT NULL,
    title_en character varying(255) NOT NULL,
    description_ru text,
    description_en text,
    price_from integer DEFAULT 0 NOT NULL,
    price_currency character varying(10) DEFAULT '₽'::character varying NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deadline_ru character varying(255),
    deadline_en character varying(255)
);


ALTER TABLE public.service_examples OWNER TO vezha;

--
-- Name: service_features; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.service_features (
    id uuid NOT NULL,
    service_id uuid NOT NULL,
    text_ru character varying(500) NOT NULL,
    text_en character varying(500) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.service_features OWNER TO vezha;

--
-- Name: service_items; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.service_items (
    id uuid NOT NULL,
    service_id uuid NOT NULL,
    title_ru character varying(255) NOT NULL,
    title_en character varying(255) NOT NULL,
    description_ru text,
    description_en text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.service_items OWNER TO vezha;

--
-- Name: services; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.services (
    id uuid NOT NULL,
    icon character varying(500) NOT NULL,
    name_ru character varying(255) NOT NULL,
    name_en character varying(255) NOT NULL,
    description_ru text NOT NULL,
    description_en text NOT NULL,
    examples_ru text,
    examples_en text,
    price_from integer NOT NULL,
    price_currency character varying(10) NOT NULL,
    sort_order integer NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deadline_ru text,
    deadline_en text,
    about_ru text,
    about_en text
);


ALTER TABLE public.services OWNER TO vezha;

--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.site_settings (
    id uuid NOT NULL,
    key character varying(100) NOT NULL,
    value_ru text,
    value_en text
);


ALTER TABLE public.site_settings OWNER TO vezha;

--
-- Name: tech_stack; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.tech_stack (
    id uuid NOT NULL,
    category public.techcategory NOT NULL,
    icon character varying(500) NOT NULL,
    name character varying(100) NOT NULL,
    subtitle_ru character varying(255),
    subtitle_en character varying(255),
    sort_order integer NOT NULL,
    is_active boolean NOT NULL,
    icon_format character varying(255)
);


ALTER TABLE public.tech_stack OWNER TO vezha;

--
-- Name: work_stage_points; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.work_stage_points (
    id uuid NOT NULL,
    stage_id uuid NOT NULL,
    text_ru character varying(500) NOT NULL,
    text_en character varying(500) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.work_stage_points OWNER TO vezha;

--
-- Name: work_stages; Type: TABLE; Schema: public; Owner: vezha
--

CREATE TABLE public.work_stages (
    id uuid NOT NULL,
    step_number integer NOT NULL,
    title_ru character varying(255) NOT NULL,
    title_en character varying(255) NOT NULL,
    description_ru text NOT NULL,
    description_en text NOT NULL,
    is_active boolean NOT NULL,
    duration_ru character varying(100),
    duration_en character varying(100),
    full_description_ru text,
    full_description_en text
);


ALTER TABLE public.work_stages OWNER TO vezha;

--
-- Data for Name: about_sections; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.about_sections (id, title_ru, title_en, description_ru, description_en, sort_order, is_active) FROM stdin;
d9f95737-f65f-484b-9136-18af69af0f81	Кто мы	Who we are	Мы небольшая команда — каждый проект ведёт конкретный человек, а не безликий менеджер. Специализируемся на Telegram Mini Apps, сайтах и корпоративных системах. Погружаемся в задачу, предлагаем решения, а не просто выполняем ТЗ.	We're a small team — every project has a real person behind it, not a faceless account manager. We specialize in Telegram Mini Apps, websites, and enterprise systems. We dig into the problem and bring ideas to the table, not just execute specs.	0	t
7fe78f0c-443e-4f75-84e3-2cf4ca86c523	Наш принцип	Our Principle	Нам важно одно — чтобы то, что мы делаем, реально работало и приносило результат. Не берём проекты ради галочки и не исчезаем после сдачи.	We care about one thing — that what we build actually works and delivers results. We don't take on projects just to check a box, and we don't disappear after launch.	1	t
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.admins (id, telegram_id, username, first_name, last_name, photo_url, is_active, created_at, last_login) FROM stdin;
\.


--
-- Data for Name: advantages; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.advantages (id, icon, title_ru, title_en, description_ru, description_en, sort_order, is_active) FROM stdin;
fd5712f9-c54b-431e-87a6-1a9983c3f392	percent	На 20–30% дешевле других агентств	20–30% cheaper than other agencies	На 20–30% дешевле других агентств	20–30% cheaper than other agencies	0	t
76ef4579-e697-4918-9045-0e118a0d0ce2	zap	2 дня от обсуждения до старта работы	2 days from discussion to project kickoff	2 дня от обсуждения до старта работы	2 days from discussion to project kickoff	1	t
8df16892-9536-4a88-a9e6-c62808f06533	refresh-cw	Полный цикл разработки от идеи до запуска	Full cycle development — from idea to launch	Полный цикл разработки от идеи до запуска	Full cycle development — from idea to launch	2	t
f752490a-4efa-478c-ad03-03e26fb173ba	shield	Соответствие 152-ФЗ о персональных данных	Compliance with 152-FZ personal data law	Соответствие 152-ФЗ о персональных данных	Compliance with 152-FZ personal data law	3	t
08a9a436-c8dd-4738-b419-9ca38b98938a	credit-card	Поэтапная оплата, платите за результат	Pay as you go, pay for results	Поэтапная оплата, платите за результат	Pay as you go, pay for results	4	t
c8b332ef-d797-4d55-b63a-c1e0195f1692	file-text	Макет и ТЗ до подписания договора	Mockup and specs before signing the contract	Макет и ТЗ до подписания договора	Mockup and specs before signing the contract	5	t
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.alembic_version (version_num) FROM stdin;
c4d5e6f7a8b9
\.


--
-- Data for Name: client_types; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.client_types (id, title_ru, title_en, subtitle_ru, subtitle_en, description_ru, description_en, sort_order, is_active) FROM stdin;
fc528a0a-265f-44b2-8fec-ba585c678b6c	Частные клиенты	Individuals	Идеи, MVP, простые решения	Ideas, MVP, simple solutions	Есть идея, но нет чёткого понимания как её реализовать. Разберёмся вместе: выясним что нужно, предложим подходящее решение и возьмём в работу. Без лишних сложностей и раздутых бюджетов.	Got an idea but don't know where to start, no problem. We'll figure it out together: understand what you actually need, suggest the right solution and build it. No bloated budgets, no unnecessary complexity.	0	t
35d4de2f-bfc7-4680-b878-0fe221d87113	Малый/средний бизнес	Small/medium business	Автоматизация, онлайн-инструменты	Automation, online tools	Разрабатываем инструменты, которые решают конкретные бизнес-задачи: автоматизация, онлайн-сервисы, внутренние системы. Вникаем в процессы и предлагаем то, что имеет смысл именно для вашего бизнеса.	We automate processes, take businesses online, and build tools that actually get used, not ones that collect dust after delivery. We go deep on your workflow, suggest what makes sense and stay in touch after launch.	1	t
21e6d7bb-559a-4494-b14c-66b7cb0dc71a	Корпорации	Corporations	Спецпроекты, Telegram Mini Apps	Special projects, Telegram Mini Apps	Берёмся за спецпроекты и нестандартные задачи: интерактивные лендинги, Telegram Mini Apps, мини-игры, квесты. Без корпоративной волокиты — быстрое согласование и короткий путь от идеи до запуска.	We build special projects and help test hypotheses: interactive landing pages, mini-games, quests, Telegram Mini Apps. Non-standard format, fast launch, high user engagement.	2	t
\.


--
-- Data for Name: contact_requests; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.contact_requests (id, name, contact, message, ip_address, user_agent, is_processed, created_at) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.projects (id, type_ru, type_en, name_ru, name_en, description_ru, description_en, image_url, project_url, sort_order, is_active, created_at, updated_at) FROM stdin;
297b0e4b-9255-42da-81ca-5cb3010a8215	Telegram Mini App	Telegram Mini App	Меню ресторана	Restaurant Menu	Интерактивное меню с корзиной, оплатой и интеграцией с системой доставки. Клиенты могут просматривать блюда, добавлять в корзину, оплачивать через Telegram Payments и отслеживать статус заказа.	Interactive menu with cart, payment and delivery system integration. Customers can browse dishes, add to cart, pay via Telegram Payments and track order status.	https://placehold.co/600x400/2563eb/ffffff?text=Restaurant+Menu	https://t.me/restaurant_menu_bot	0	t	2026-03-14 21:09:48.298216	2026-03-14 21:09:48.298219
8e09faea-49c7-4f27-8c2f-ff386e107df2	Веб-сайт	Website	Корпоративный сайт	Corporate Website	Современный корпоративный сайт для IT-компании с разделами о услугах, кейсах, команде и блогом. Адаптивный дизайн, SEO-оптимизация, форма обратной связи.	Modern corporate website for IT company with sections about services, cases, team and blog. Responsive design, SEO optimization, contact form.	https://placehold.co/600x400/059669/ffffff?text=Corporate+Site	https://example-corp.com	1	t	2026-03-14 21:09:48.298225	2026-03-14 21:09:48.298226
871c8c60-7287-4928-b189-1ab6c6d1c696	Telegram бот	Telegram Bot	Бот записи на услуги	Service Booking Bot	Автоматизация записи клиентов в салон красоты. Выбор мастера, услуги, времени, напоминания о записи, интеграция с календарем и CRM-системой.	Automation of client booking in beauty salon. Master selection, service, time, appointment reminders, calendar and CRM integration.	https://placehold.co/600x400/dc2626/ffffff?text=Booking+Bot	https://t.me/beauty_booking_bot	2	t	2026-03-14 21:09:48.298229	2026-03-14 21:09:48.29823
202c1eb8-c742-43bb-a798-d95f326bc52f	Интернет-магазин	E-commerce	Магазин электроники	Electronics Store	Полнофункциональный интернет-магазин электроники с каталогом, фильтрами, корзиной, личным кабинетом, интеграцией оплаты и доставки. Админ-панель для управления товарами и заказами.	Full-featured electronics online store with catalog, filters, cart, personal account, payment and delivery integration. Admin panel for product and order management.	https://placehold.co/600x400/7c3aed/ffffff?text=Electronics+Store	https://example-electronics.com	3	t	2026-03-14 21:09:48.298234	2026-03-14 21:09:48.298234
a62a1407-3a6e-4e01-ad4d-bcf353c7a1ab	AI решение	AI Solution	AI-ассистент для поддержки	AI Support Assistant	Интеллектуальный помощник на базе GPT для автоматизации клиентской поддержки. Отвечает на вопросы, помогает с заказами, передает сложные случаи операторам.	Intelligent GPT-based assistant for customer support automation. Answers questions, helps with orders, transfers complex cases to operators.	https://placehold.co/600x400/ea580c/ffffff?text=AI+Assistant	https://t.me/ai_support_bot	4	t	2026-03-14 21:09:48.298238	2026-03-14 21:09:48.298239
5e8ef229-bdd4-4071-9c74-42bfb1e8b3b4	Корпоративная система	Enterprise System	CRM-система	CRM System	Кастомная CRM-система для управления клиентами, сделками и задачами. Воронка продаж, автоматизация процессов, интеграция с email и мессенджерами, аналитика.	Custom CRM system for managing customers, deals and tasks. Sales funnel, process automation, email and messenger integration, analytics.	https://placehold.co/600x400/0891b2/ffffff?text=CRM+System	https://example-crm.com	5	t	2026-03-14 21:09:48.298242	2026-03-14 21:09:48.298243
\.


--
-- Data for Name: section_visibility; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.section_visibility (id, section_key, section_name_ru, section_name_en, is_visible, updated_at) FROM stdin;
efdd4630-48f7-4fea-857d-a13507943bfe	services	Услуги	Services	t	2026-03-14 21:09:40.118523
d4bdad04-de63-433e-91d5-5b9d264b379f	advantages	Преимущества	Advantages	t	2026-03-14 21:09:40.118523
b71d42d1-ee08-4ade-bf7d-7cd65470e149	projects	Проекты	Projects	t	2026-03-14 21:09:40.118523
eb2b31e3-cd90-4e13-bbb5-1cbf3ef6ad61	tech_stack	Технологический стек	Tech Stack	t	2026-03-14 21:09:40.118523
8cc48b06-2f6b-4ed4-ad29-dc540aeefa53	work_stages	Этапы работы	Work Stages	t	2026-03-14 21:09:40.118523
ab0ae2d2-fc4e-4719-b51a-738accbef23c	client_types	Типы клиентов	Client Types	t	2026-03-14 21:09:40.118523
a21efc28-33a4-4f36-818e-0c90854c6865	about_sections	О нас	About Us	t	2026-03-14 21:09:40.118523
\.


--
-- Data for Name: service_examples; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.service_examples (id, service_id, title_ru, title_en, description_ru, description_en, price_from, price_currency, sort_order, is_active, created_at, updated_at, deadline_ru, deadline_en) FROM stdin;
30f3e5ab-44f4-4feb-8c9c-314f87cc13e0	9f4de2f2-4f22-4ae3-8eaf-34a7cff3196a	Интерактивное меню ресторана	Interactive Restaurant Menu	Полнофункциональное меню с корзиной, оплатой и доставкой	Full-featured menu with cart, payment and delivery	120000	₽	0	t	2026-03-14 21:09:48.301166	2026-03-14 21:09:48.30117	1–2 недели	1–2 weeks
7d22962f-4be0-41eb-9068-39986186e9ff	9f4de2f2-4f22-4ae3-8eaf-34a7cff3196a	Магазин одежды	Clothing Store	Каталог товаров с фильтрами, размерами и примеркой AR	Product catalog with filters, sizes and AR try-on	150000	₽	1	t	2026-03-14 21:09:48.301181	2026-03-14 21:09:48.301182	2–3 недели	2–3 weeks
c1248f4e-fc35-44c5-b453-d7c060ef49b1	57a38935-072c-4351-a7dc-44cb1f6f68e1	Бот для записи в салон красоты	Beauty Salon Booking Bot	Запись на услуги, выбор мастера, напоминания о записи	Service booking, master selection, appointment reminders	90000	₽	0	t	2026-03-14 21:09:48.301189	2026-03-14 21:09:48.30119	5–10 дней	5–10 days
3f175a95-b317-4a74-bf7c-ec0107fe7654	57a38935-072c-4351-a7dc-44cb1f6f68e1	AI-помощник для поддержки клиентов	AI Customer Support Assistant	Умный бот на базе GPT для ответов на вопросы клиентов	Smart GPT-based bot for answering customer questions	130000	₽	1	t	2026-03-14 21:09:48.301195	2026-03-14 21:09:48.301196	1–2 недели	1–2 weeks
3ede66ca-47bc-4bf2-8734-b49739b366a3	fe742571-652f-4545-b675-2df2099b9be8	Лендинг для стартапа	Startup Landing Page	Одностраничный сайт с формой захвата лидов	Single-page site with lead capture form	50000	₽	0	t	2026-03-14 21:09:48.301201	2026-03-14 21:09:48.301202	3–5 дней	3–5 days
40c0930a-d3b7-49e2-9048-77b675ce8577	fe742571-652f-4545-b675-2df2099b9be8	Корпоративный сайт	Corporate Website	Многостраничный сайт с блогом и формой обратной связи	Multi-page site with blog and contact form	120000	₽	1	t	2026-03-14 21:09:48.301207	2026-03-14 21:09:48.301208	2–4 недели	2–4 weeks
\.


--
-- Data for Name: service_features; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.service_features (id, service_id, text_ru, text_en, sort_order, is_active, created_at, updated_at) FROM stdin;
9ada25e5-015c-4d8e-bb38-30e12adb06e1	9f4de2f2-4f22-4ae3-8eaf-34a7cff3196a	Работает прямо в Telegram без установки	Works directly in Telegram without installation	0	t	2026-03-14 21:09:48.30747	2026-03-14 21:09:48.307473
469d39b0-898f-4dbd-a010-bc18ae8c5ab3	9f4de2f2-4f22-4ae3-8eaf-34a7cff3196a	Интеграция платёжных систем	Payment system integration	1	t	2026-03-14 21:09:48.307479	2026-03-14 21:09:48.307479
1614028c-ecab-4755-b967-5c49607cb34d	9f4de2f2-4f22-4ae3-8eaf-34a7cff3196a	Авторизация через Telegram	Telegram authorization	2	t	2026-03-14 21:09:48.307483	2026-03-14 21:09:48.307484
91281151-ec6d-47e8-9113-ccdfb17ecc8c	9f4de2f2-4f22-4ae3-8eaf-34a7cff3196a	Административная панель	Admin panel	3	t	2026-03-14 21:09:48.307487	2026-03-14 21:09:48.307487
5548ba21-b79c-48fe-a01f-665ac9df058e	57a38935-072c-4351-a7dc-44cb1f6f68e1	Интеграция с внешними API	External API integration	0	t	2026-03-14 21:09:48.30749	2026-03-14 21:09:48.307491
f6c76470-3756-4ec4-860b-947b1903e5fc	57a38935-072c-4351-a7dc-44cb1f6f68e1	Работа с базой данных	Database integration	1	t	2026-03-14 21:09:48.307494	2026-03-14 21:09:48.307495
687ce7df-84eb-4791-9179-badb1300d972	57a38935-072c-4351-a7dc-44cb1f6f68e1	Административная панель	Admin panel	2	t	2026-03-14 21:09:48.307498	2026-03-14 21:09:48.307499
9e924ad8-9fcb-4033-a02c-ee4ed41cbc9c	57a38935-072c-4351-a7dc-44cb1f6f68e1	Мультиязычность	Multilingual support	3	t	2026-03-14 21:09:48.307502	2026-03-14 21:09:48.307503
a2d9fc5c-e1a2-48db-8523-4ee07a16bbce	fe742571-652f-4545-b675-2df2099b9be8	Адаптивный дизайн для всех устройств	Responsive design for all devices	0	t	2026-03-14 21:09:48.307506	2026-03-14 21:09:48.307506
73e8cfd1-9cd2-43c6-83bd-b0b49acf0b55	fe742571-652f-4545-b675-2df2099b9be8	SEO оптимизация из коробки	SEO optimization out of the box	1	t	2026-03-14 21:09:48.307509	2026-03-14 21:09:48.30751
a3361fa0-50dd-449b-81cd-01894a271196	fe742571-652f-4545-b675-2df2099b9be8	Быстрая загрузка страниц	Fast page loading	2	t	2026-03-14 21:09:48.307513	2026-03-14 21:09:48.307514
86fe83de-171a-4a20-aa3d-16215550a586	fe742571-652f-4545-b675-2df2099b9be8	Интеграция с формами обратной связи	Contact form integration	3	t	2026-03-14 21:09:48.307517	2026-03-14 21:09:48.307518
2e26632b-b584-44ef-984e-614dee85f409	e982c9ab-576e-4496-9932-d55075073cd9	Корзина и оформление заказа	Cart and checkout	0	t	2026-03-14 21:09:48.307521	2026-03-14 21:09:48.307522
de0e7ab2-ff70-4cd1-a629-1e0aac72e70a	e982c9ab-576e-4496-9932-d55075073cd9	Интеграция платёжных систем	Payment system integration	1	t	2026-03-14 21:09:48.307525	2026-03-14 21:09:48.307526
709c5754-820a-41de-90e5-c842c1396eea	e982c9ab-576e-4496-9932-d55075073cd9	Личный кабинет покупателя	Customer account	2	t	2026-03-14 21:09:48.307529	2026-03-14 21:09:48.307529
2630372c-4967-4de9-afe1-c2bcb5a454bf	e982c9ab-576e-4496-9932-d55075073cd9	Административная панель	Admin panel	3	t	2026-03-14 21:09:48.307532	2026-03-14 21:09:48.307533
9792d663-be0c-4093-9825-e47a1dff03e6	dfa1fe02-fa60-42de-aae9-cf5127dbf20a	Обучение на ваших данных	Training on your data	0	t	2026-03-14 21:09:48.307536	2026-03-14 21:09:48.307537
223b7d2b-94ea-40e4-a6f3-69863e2959b9	dfa1fe02-fa60-42de-aae9-cf5127dbf20a	Интеграция в существующие системы	Integration into existing systems	1	t	2026-03-14 21:09:48.30754	2026-03-14 21:09:48.307541
f1d044b0-b265-4f7a-b2cb-122f4c942449	dfa1fe02-fa60-42de-aae9-cf5127dbf20a	Создание кастомных AI решений	Custom AI solutions	2	t	2026-03-14 21:09:48.307544	2026-03-14 21:09:48.307545
9d655b78-caf9-42f6-bf8d-2be546076593	dfa1fe02-fa60-42de-aae9-cf5127dbf20a	YandexGPT, GigaChat и другие модели	YandexGPT, GigaChat and other models	3	t	2026-03-14 21:09:48.307548	2026-03-14 21:09:48.307548
414f81c2-fb14-4edc-a51e-bb0e7cce0fb3	389d9b7c-0d47-49dc-9eac-aaf257545ccd	Интеграция с 1С и Битрикс24	Integration with 1C and Bitrix24	0	t	2026-03-14 21:09:48.307552	2026-03-14 21:09:48.307552
621442ce-3064-497f-a634-1a867b9736e6	389d9b7c-0d47-49dc-9eac-aaf257545ccd	OAuth авторизация	OAuth authorization	1	t	2026-03-14 21:09:48.307555	2026-03-14 21:09:48.307556
af31e931-9c6e-4016-9a89-f19d70202a21	389d9b7c-0d47-49dc-9eac-aaf257545ccd	REST API для сторонних систем	REST API for third-party systems	2	t	2026-03-14 21:09:48.307559	2026-03-14 21:09:48.30756
2ebab558-bb3c-4416-91d4-ab763ea8c824	389d9b7c-0d47-49dc-9eac-aaf257545ccd	Административная панель	Admin panel	3	t	2026-03-14 21:09:48.307564	2026-03-14 21:09:48.307564
d63ef8f9-cf0d-49d6-9073-7fb6e042d269	86ca5e9c-7e2c-4351-ae1e-ae900b7e644e	Работает на iOS и Android	Works on iOS and Android	0	t	2026-03-14 21:09:48.307568	2026-03-14 21:09:48.307568
c5b83daa-bba6-4d8b-a420-b64239d4c913	86ca5e9c-7e2c-4351-ae1e-ae900b7e644e	Установка на домашний экран	Home screen installation	1	t	2026-03-14 21:09:48.307572	2026-03-14 21:09:48.307572
2a5411ae-7606-400f-a6a5-200cad0da8d6	86ca5e9c-7e2c-4351-ae1e-ae900b7e644e	Офлайн-режим	Offline mode	2	t	2026-03-14 21:09:48.307575	2026-03-14 21:09:48.307576
92854abe-94bd-4e25-855e-fe2a41fef2aa	86ca5e9c-7e2c-4351-ae1e-ae900b7e644e	Push уведомления	Push notifications	3	t	2026-03-14 21:09:48.307663	2026-03-14 21:09:48.307664
\.


--
-- Data for Name: service_items; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.service_items (id, service_id, title_ru, title_en, description_ru, description_en, sort_order, is_active, created_at, updated_at) FROM stdin;
17af6f39-f84d-43cb-8f5e-1f33d11135b5	9f4de2f2-4f22-4ae3-8eaf-34a7cff3196a	Дизайн интерфейса	Interface Design	Разработка UI/UX дизайна в стиле Telegram	UI/UX design development in Telegram style	0	t	2026-03-14 21:09:48.312337	2026-03-14 21:09:48.31234
0adaf9fb-6c5d-4c2a-9332-5e11e528681c	9f4de2f2-4f22-4ae3-8eaf-34a7cff3196a	Frontend разработка	Frontend Development	React/Vue.js + TypeScript + Telegram SDK	React/Vue.js + TypeScript + Telegram SDK	1	t	2026-03-14 21:09:48.312346	2026-03-14 21:09:48.312347
c8e86b80-b936-42fe-b023-a3297386a3c5	9f4de2f2-4f22-4ae3-8eaf-34a7cff3196a	Backend API	Backend API	FastAPI + PostgreSQL + Redis	FastAPI + PostgreSQL + Redis	2	t	2026-03-14 21:09:48.312351	2026-03-14 21:09:48.312351
ce8b3af0-389f-4546-bfbb-03ec2ac334ff	9f4de2f2-4f22-4ae3-8eaf-34a7cff3196a	Деплой и настройка	Deploy and Setup	Настройка сервера, домена, SSL-сертификата	Server, domain, SSL certificate setup	3	t	2026-03-14 21:09:48.312355	2026-03-14 21:09:48.312355
c4e6c459-ed69-4f1b-9c81-c10a594e6d60	57a38935-072c-4351-a7dc-44cb1f6f68e1	Логика бота	Bot Logic	Программирование всех функций и команд	Programming all functions and commands	0	t	2026-03-14 21:09:48.312359	2026-03-14 21:09:48.31236
297a20b4-e8ea-4f6d-9c8f-ecd88914ecf0	57a38935-072c-4351-a7dc-44cb1f6f68e1	База данных	Database	Проектирование и настройка БД	Database design and setup	1	t	2026-03-14 21:09:48.312363	2026-03-14 21:09:48.312364
7bdf4b68-1c4e-48ab-98d6-b659a3fbe208	57a38935-072c-4351-a7dc-44cb1f6f68e1	Админ-панель	Admin Panel	Веб-интерфейс для управления ботом	Web interface for bot management	2	t	2026-03-14 21:09:48.312367	2026-03-14 21:09:48.312368
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.services (id, icon, name_ru, name_en, description_ru, description_en, examples_ru, examples_en, price_from, price_currency, sort_order, is_active, created_at, updated_at, deadline_ru, deadline_en, about_ru, about_en) FROM stdin;
57a38935-072c-4351-a7dc-44cb1f6f68e1	bot	Telegram боты	Telegram Bots	Автоматизируем рутину через Telegram: приём заявок, запись клиентов, рассылки, AI-ассистенты и любая логика под вашу задачу.	We automate routine via Telegram: order intake, client booking, newsletters, AI assistants and any logic for your task.	Приём заказов,Запись на услуги,AI-ассистент,Рассылки,Бот с оплатой,Управление группой,Опросы и викторины	Order Intake,Service Booking,AI Assistant,Newsletters,Payment Bot,Group Management,Polls & Quizzes	40000	₽	1	t	2026-03-14 21:09:48.284519	2026-03-14 21:09:48.284519	от 5 дней до 2 недель	from 5 days to 2 weeks	Telegram боты — это мощный инструмент для автоматизации бизнес-процессов. Мы создаем ботов любой сложности: от простых информационных до сложных систем с интеграцией баз данных, платежных систем и внешних API. Используем Python, aiogram и современные подходы к разработке.	Telegram bots are a powerful tool for automating business processes. We create bots of any complexity: from simple informational to complex systems with database integration, payment systems and external APIs. We use Python, aiogram and modern development approaches.
fe742571-652f-4545-b675-2df2099b9be8	globe	Веб-сайты	Websites	Делаем сайты, которые работают на всех устройствах: лендинги, корпоративные сайты, каталоги и промо-страницы.	We build sites that work on all devices: landing pages, corporate sites, catalogs and promo pages.	Лендинг,Сайт-визитка,Промо-сайт,Портфолио,Корпоративный сайт,Каталог,Блог	Landing Page,Business Card Site,Promo Site,Portfolio,Corporate Site,Catalog,Blog	40000	₽	2	t	2026-03-14 21:09:48.284524	2026-03-14 21:09:48.284524	от 1 до 4 недель	from 1 to 4 weeks	Создаем современные веб-сайты с адаптивным дизайном, быстрой загрузкой и SEO-оптимизацией. Используем актуальные технологии: React, Next.js, Vue.js, Tailwind CSS. Все сайты оптимизированы для мобильных устройств и поисковых систем.	We create modern websites with responsive design, fast loading and SEO optimization. We use current technologies: React, Next.js, Vue.js, Tailwind CSS. All sites are optimized for mobile devices and search engines.
e982c9ab-576e-4496-9932-d55075073cd9	shopping-cart	Интернет-магазины	E-commerce	Магазин, который удобно использовать покупателю и легко администрировать вам.	A store that's convenient for buyers and easy for you to manage.	До 100 товаров,До 500 товаров,Крупный магазин с аналитикой	Up to 100 products,Up to 500 products,Large store with analytics	250000	₽	3	t	2026-03-14 21:09:48.284528	2026-03-14 21:09:48.284529	от 3 до 8 недель	from 3 to 8 weeks	Разрабатываем полнофункциональные интернет-магазины с удобной админ-панелью, интеграцией платежных систем, управлением товарами и заказами. Поддержка различных способов оплаты, автоматизация процессов, аналитика продаж.	We develop full-featured online stores with a convenient admin panel, payment system integration, product and order management. Support for various payment methods, process automation, sales analytics.
dfa1fe02-fa60-42de-aae9-cf5127dbf20a	cpu	AI и автоматизация	AI & Automation	Внедряем AI туда, где это реально экономит время: чат-боты, обработка данных, автоматизация рутинных процессов.	We integrate AI where it really saves time: chatbots, data processing, routine process automation.	AI чат-бот,Помощник для сайта,Анализ текста,Система рекомендаций,Обработка изображений,Автоматизация процессов	AI Chatbot,Site Assistant,Text Analysis,Recommendation System,Image Processing,Process Automation	100000	₽	4	t	2026-03-14 21:09:48.284532	2026-03-14 21:09:48.284533	от 2 до 6 недель	from 2 to 6 weeks	Интегрируем современные AI-решения в ваш бизнес: чат-боты на базе GPT, системы анализа данных, автоматизация рутинных задач. Работаем с OpenAI API, LangChain, создаем кастомные ML-модели под ваши задачи.	We integrate modern AI solutions into your business: GPT-based chatbots, data analysis systems, routine task automation. We work with OpenAI API, LangChain, create custom ML models for your tasks.
389d9b7c-0d47-49dc-9eac-aaf257545ccd	building	Корпоративные системы	Enterprise Systems	Инструмент, который работает именно под ваши процессы, а не требует подстраиваться под готовое решение.	A tool built around your processes, not one you have to adapt to.	Учёт рабочего времени,Внутренний портал,Складская система,Аналитика,Управление проектами,HR-система	Time Tracking,Internal Portal,Warehouse System,Analytics,Project Management,HR System	450000	₽	5	t	2026-03-14 21:09:48.284536	2026-03-14 21:09:48.284537	от 6 до 12 недель	from 6 to 12 weeks	Создаем корпоративные системы для автоматизации внутренних процессов: CRM, ERP, системы управления проектами, HR-платформы. Используем современный стек технологий, обеспечиваем безопасность данных и масштабируемость решений.	We create corporate systems for internal process automation: CRM, ERP, project management systems, HR platforms. We use modern technology stack, ensure data security and solution scalability.
86ca5e9c-7e2c-4351-ae1e-ae900b7e644e	smartphone	Мобильные приложения	Mobile Applications	PWA-приложение, которое работает на iOS и Android без публикации в магазинах и долгой модерации.	A PWA that works on iOS and Android without app store submission or lengthy review.	PWA-приложение,Установка на экран,Офлайн-режим,Push-уведомления	PWA App,Home Screen Install,Offline Mode,Push Notifications	300000	₽	6	t	2026-03-14 21:09:48.28454	2026-03-14 21:09:48.284541	от 4 до 10 недель	from 4 to 10 weeks	Разрабатываем кроссплатформенные PWA-приложения, которые работают на всех устройствах. Пользователи могут устанавливать приложение на домашний экран, работать офлайн, получать push-уведомления — как в нативных приложениях, но без необходимости публикации в App Store и Google Play.	We develop cross-platform PWA applications that work on all devices. Users can install the app on their home screen, work offline, receive push notifications — just like native apps, but without the need to publish in the App Store and Google Play.
9f4de2f2-4f22-4ae3-8eaf-34a7cff3196a	smartphone	Telegram Mini Apps	Telegram Mini Apps	Разрабатываем мини-приложения внутри Telegram: от простого каталога до полноценного сервиса с оплатой и личным кабинетом.	We build mini-apps inside Telegram: from a simple catalog to a full-featured service with payments and user accounts.	Магазин,Каталог товаров,Сервис бронирования,Система лояльности,Доска объявлений,Игровое приложение,Сервис доставки,Приложение знакомств	Store,Product Catalog,Booking Service,Loyalty System,Classifieds,Game App,Delivery Service,Dating App	100000	₽	0	t	2026-03-14 21:09:48.284506	2026-03-14 21:09:48.284511	от 1 до 3 недель	from 1 to 3 weeks	Telegram Mini Apps — это современный способ создания веб-приложений, которые работают прямо в Telegram. Мы разрабатываем полнофункциональные приложения с использованием передовых технологий: React, Vue.js, TypeScript. Наши решения отличаются высокой производительностью, интуитивным интерфейсом и полной интеграцией с экосистемой Telegram.	Telegram Mini Apps is a modern way to create web applications that work directly in Telegram. We develop full-featured applications using cutting-edge technologies: React, Vue.js, TypeScript. Our solutions are characterized by high performance, intuitive interface and full integration with the Telegram ecosystem.
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.site_settings (id, key, value_ru, value_en) FROM stdin;
4b3ebbcf-c0c6-475a-b34c-2aec805e41b5	hero_title	Разработка корпоративных систем и AI-решений	Development of enterprise systems and AI solutions
cda5a7dc-aa34-43f8-b93a-9116a32adaae	hero_subtitle	Запустим ваш проект за 1-4 недели	We'll launch your project in 1-4 weeks
161d22b4-5d4e-4e7f-8bbb-9292e06f211e	hero_price	50 000	50,000
3ad7bc8d-3c73-4e4d-96e9-f7f08b3a14cb	contact_telegram	@vezha_digital	@vezha_digital
e4524ae9-7aea-4f2a-a29b-e2665a381541	contact_email	contact@vezha.digital	contact@vezha.digital
ae5ea4cc-3055-4b86-98ac-deacf5cb3b3a	contact_phone	+7 (993) 900 23-66	+7 (993) 900 23-66
264a6cfb-0df8-4d8c-9c3d-607ae8952acb	footer_copyright	VEZHA Digital. Все права защищены.	VEZHA Digital. All rights reserved.
1c3ba317-3216-4a03-98f0-b9b10342c5db	cta_title	Готовы начать?	Ready to Start?
3115c360-01c9-4ef1-9e86-be7257697c71	cta_subtitle	Обсудим ваш проект и рассчитаем точную стоимость	Let's discuss your project and calculate the exact cost
\.


--
-- Data for Name: tech_stack; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.tech_stack (id, category, icon, name, subtitle_ru, subtitle_en, sort_order, is_active, icon_format) FROM stdin;
6011f565-5a5d-420a-a421-a565066c74f1	FRONTEND	http://localhost:9000/uploads/voxel_tech_icons/react/palette.png	REACT	UI библиотека	UI Library	0	t	http://localhost:9000/uploads/voxel_tech_icons/react/react.gltf
054ee130-9064-4fa4-9c5c-9ce25998d3af	FRONTEND	http://localhost:9000/uploads/voxel_tech_icons/vue/palette.png	VUE 3	Прогрессивный фреймворк	Progressive Framework	1	t	http://localhost:9000/uploads/voxel_tech_icons/vue/vue.gltf
313f7ec6-f1c1-465a-9234-eba9803c9dde	FRONTEND	http://localhost:9000/uploads/voxel_tech_icons/nextjs/palette.png	Next.js	React фреймворк	React Framework	2	t	http://localhost:9000/uploads/voxel_tech_icons/nextjs/nextjs.gltf
d29478bb-50cb-422c-9cd3-560da18b3613	FRONTEND	http://localhost:9000/uploads/voxel_tech_icons/typescript/palette.png	TypeScript	Типизация JS	JS Typing	3	t	http://localhost:9000/uploads/voxel_tech_icons/typescript/typescript.gltf
30892ed5-9cdd-43b8-8b53-16d571430e47	FRONTEND	http://localhost:9000/uploads/voxel_tech_icons/tailwind/palette.png	Tailwind	CSS фреймворк	CSS Framework	4	t	http://localhost:9000/uploads/voxel_tech_icons/tailwind/tailwind.gltf
e5a03dc5-d661-4d3e-b76b-7905ff49305c	BACKEND	http://localhost:9000/uploads/voxel_tech_icons/python/palette.png	Python	Основной язык	Primary Language	0	t	http://localhost:9000/uploads/voxel_tech_icons/python/python.gltf
b95a1b8f-704f-4064-ad14-b64d01934a69	BACKEND	http://localhost:9000/uploads/voxel_tech_icons/fastapi/palette.png	FastAPI	Веб-фреймворк	Web Framework	1	t	http://localhost:9000/uploads/voxel_tech_icons/fastapi/fastapi.gltf
85a04e49-b5ea-47ed-aace-8ab0887aa983	BACKEND	http://localhost:9000/uploads/voxel_tech_icons/postgresql/palette.png	PostgreSQL	База данных	Database	2	t	http://localhost:9000/uploads/voxel_tech_icons/postgresql/postgresql.gltf
5d0cd807-4bac-4886-90d1-10dd7b48e3a7	BACKEND	http://localhost:9000/uploads/voxel_tech_icons/docker/palette.png	Docker	Контейнеризация	Containerization	3	t	http://localhost:9000/uploads/voxel_tech_icons/docker/docker.gltf
\.


--
-- Data for Name: work_stage_points; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.work_stage_points (id, stage_id, text_ru, text_en, sort_order, is_active, created_at, updated_at) FROM stdin;
e12ebf7a-9aa6-453f-8d29-9bc8439749f1	118c1e00-4369-4120-9f14-c8e0b262f18b	Созвон с заказчиком	Meeting and project discussion	0	t	2026-03-14 21:09:48.351884	2026-03-14 21:09:48.351887
7f64664d-8cf8-4bbb-abfd-ac7ca8c52c39	118c1e00-4369-4120-9f14-c8e0b262f18b	Формулировка задачи и ТЗ	Competitor and market analysis	1	t	2026-03-14 21:09:48.351893	2026-03-14 21:09:48.351893
673f5b36-06df-425f-bc66-dbae07b67e69	118c1e00-4369-4120-9f14-c8e0b262f18b	Оценка сроков и стоимости	Creating specifications and plan	2	t	2026-03-14 21:09:48.351897	2026-03-14 21:09:48.351897
3a0fb079-2c03-48af-9534-675fa80c6a90	da3f3b2a-dc7e-4c32-bd82-cb8f79e0609f	Wireframes и прототипы	UI/UX design development	0	t	2026-03-14 21:09:48.351901	2026-03-14 21:09:48.351901
97034ed5-e24e-419c-80f3-97ba52a0526f	da3f3b2a-dc7e-4c32-bd82-cb8f79e0609f	Согласование с заказчиком	Creating interactive prototypes	1	t	2026-03-14 21:09:48.351904	2026-03-14 21:09:48.351905
fe2d7d87-be84-4d1a-89a5-44b415cca149	da3f3b2a-dc7e-4c32-bd82-cb8f79e0609f	Финальные макеты	Approval and making adjustments	2	t	2026-03-14 21:09:48.351908	2026-03-14 21:09:48.351908
57865aa5-9edc-401a-8628-3c1ff6f52300	df868091-7c00-4c4d-bc94-8804a7ffeda4	UI концепция	Frontend and Backend development	0	t	2026-03-14 21:09:48.351911	2026-03-14 21:09:48.351912
c14e13c4-7319-4677-948a-273e76c44097	df868091-7c00-4c4d-bc94-8804a7ffeda4	Дизайн-система и компоненты	Integration with external services	1	t	2026-03-14 21:09:48.351915	2026-03-14 21:09:48.351916
f76bde45-8fac-4021-8db2-b73c8c8804a9	df868091-7c00-4c4d-bc94-8804a7ffeda4	Адаптация под мобильные	Testing and optimization	2	t	2026-03-14 21:09:48.351918	2026-03-14 21:09:48.351919
4d585b59-4473-4585-95ce-0ff81342e416	7016883b-f48f-4177-8f21-6665afb7f676	Frontend и backend	Deploy to production server	0	t	2026-03-14 21:09:48.351922	2026-03-14 21:09:48.351923
50247e0e-c30b-42cd-b255-9970705bc62b	7016883b-f48f-4177-8f21-6665afb7f676	Интеграции с сервисами	Monitoring setup	1	t	2026-03-14 21:09:48.351926	2026-03-14 21:09:48.351926
53542cc3-5ebb-4fef-8eca-67818159b769	7016883b-f48f-4177-8f21-6665afb7f676	Тестирование и фикс багов	Training and project handover	2	t	2026-03-14 21:09:48.351929	2026-03-14 21:09:48.35193
62f5fb87-240e-4e81-804c-4c6ec68d6006	234abf43-9ee5-4f96-8a9c-63dda83e6b6e	Функциональное тестирование	Functional testing	0	t	2026-03-15 19:23:00.951846	2026-03-15 19:23:00.951846
81c51877-6110-446e-9d82-fc7a13f6c2b9	234abf43-9ee5-4f96-8a9c-63dda83e6b6e	Нагрузочное тестирование	Load testing	1	t	2026-03-15 19:23:00.951846	2026-03-15 19:23:00.951846
4a480505-790d-48cb-9e12-0087111b0a6d	234abf43-9ee5-4f96-8a9c-63dda83e6b6e	Фикс багов	Bug fixes	2	t	2026-03-15 19:23:00.951846	2026-03-15 19:23:00.951846
0d86fe7f-9a8c-4af2-8acf-009f226637f8	f9749680-d526-4db2-8c89-d1fe0b9bfd9f	Деплой на сервер	Server deployment	0	t	2026-03-15 19:23:00.951846	2026-03-15 19:23:00.951846
732a9532-747f-4ed7-a6f0-adda1377911c	f9749680-d526-4db2-8c89-d1fe0b9bfd9f	Настройка домена и SSL	Domain and SSL setup	1	t	2026-03-15 19:23:00.951846	2026-03-15 19:23:00.951846
27b347a9-e9fb-4db0-8edb-f766774124e9	f9749680-d526-4db2-8c89-d1fe0b9bfd9f	Передача доступов	Access handover	2	t	2026-03-15 19:23:00.951846	2026-03-15 19:23:00.951846
da8e8769-c01b-4fef-9f68-8f9c93690b35	a6abc40c-4b9d-44f0-8858-adef04eccf5e	Мониторинг работоспособности	Uptime monitoring	0	t	2026-03-15 19:23:00.951846	2026-03-15 19:23:00.951846
f5390e2d-6f32-423b-b7d0-037b773b12fd	a6abc40c-4b9d-44f0-8858-adef04eccf5e	Обновление функционала	Feature updates	1	t	2026-03-15 19:23:00.951846	2026-03-15 19:23:00.951846
6f1c7646-e7fb-40c5-936b-90a850a4939c	a6abc40c-4b9d-44f0-8858-adef04eccf5e	Консультации и поддержка	Consultations and support	2	t	2026-03-15 19:23:00.951846	2026-03-15 19:23:00.951846
\.


--
-- Data for Name: work_stages; Type: TABLE DATA; Schema: public; Owner: vezha
--

COPY public.work_stages (id, step_number, title_ru, title_en, description_ru, description_en, is_active, duration_ru, duration_en, full_description_ru, full_description_en) FROM stdin;
118c1e00-4369-4120-9f14-c8e0b262f18b	1	Анализ	Analysis & Planning	Разбираемся в задаче, фиксируем цели и формируем ТЗ.	Discussing goals, analyzing technical requirements, creating a plan	t	1–3 дня	1-3 days	На этом этапе мы детально разбираем ваши задачи и цели проекта. Проводим встречу (онлайн или офлайн), обсуждаем функциональные требования, целевую аудиторию, ожидаемые результаты. Анализируем конкурентов, подбираем оптимальный стек технологий. Составляем техническое задание и план разработки с четкими сроками и этапами.	At this stage, we analyze your tasks and project goals in detail. We hold a meeting (online or offline), discuss functional requirements, target audience, expected results. We analyze competitors, select the optimal technology stack. We create technical specifications and a development plan with clear deadlines and stages.
da3f3b2a-dc7e-4c32-bd82-cb8f79e0609f	2	Проектирование	Design & Prototyping	Строим архитектуру и прорабатываем логику проекта.	Creating interface mockups, client approval	t	2–5 дней	2-5 days	Разрабатываем UI/UX дизайн будущего продукта. Создаем прототипы основных экранов и пользовательских сценариев. Подбираем цветовую палитру, шрифты, иконки. Показываем макеты вам на согласование, вносим правки. После утверждения дизайна переходим к разработке. Используем Figma для создания интерактивных прототипов.	We develop UI/UX design for the future product. We create prototypes of main screens and user scenarios. We select color palette, fonts, icons. We show you mockups for approval, make adjustments. After design approval, we move to development. We use Figma to create interactive prototypes.
df868091-7c00-4c4d-bc94-8804a7ffeda4	3	Дизайн	Development & Testing	Создаём визуальный облик: понятный и удобный.	Writing code, testing, bug fixing	t	2–5 дней	1-8 weeks	Основной этап работы — программирование всех функций продукта. Пишем чистый, масштабируемый код с использованием лучших практик. Регулярно показываем промежуточные результаты, собираем ваш фидбек. Проводим тестирование: функциональное, интеграционное, нагрузочное. Исправляем найденные баги. Оптимизируем производительность.	The main stage of work is programming all product functions. We write clean, scalable code using best practices. We regularly show intermediate results, collect your feedback. We conduct testing: functional, integration, load. We fix found bugs. We optimize performance.
7016883b-f48f-4177-8f21-6665afb7f676	4	Разработка	Launch & Support	Пишем код, интегрируем сервисы, собираем продукт.	Server deployment, first month of support free	t	1–8 недель	1-2 days + 1 month	Разворачиваем проект на боевом сервере. Настраиваем домен, SSL-сертификат, мониторинг. Проверяем работу всех функций в продакшене. Обучаем вас работе с админ-панелью, если она есть. Передаем всю документацию и исходный код. Первый месяц предоставляем бесплатную техническую поддержку: исправление багов, консультации, небольшие доработки.	We deploy the project on the production server. We configure domain, SSL certificate, monitoring. We check all functions in production. We train you to work with the admin panel, if any. We transfer all documentation and source code. We provide free technical support for the first month: bug fixes, consultations, minor improvements.
234abf43-9ee5-4f96-8a9c-63dda83e6b6e	5	Тестирование	Testing	Проверяем функциональность и стабильность на всех устройствах.	We check functionality and stability across all devices.	t	3–7 дней	3–7 days	\N	\N
f9749680-d526-4db2-8c89-d1fe0b9bfd9f	6	Запуск	Launch	Деплоим, настраиваем, передаём заказчику.	We deploy, configure, and hand over to the client.	t	1–2 дня	1–2 days	\N	\N
a6abc40c-4b9d-44f0-8858-adef04eccf5e	7	Поддержка	Support	Сопровождаем проект после запуска.	We support the project after launch.	t	Ongoing	Ongoing	\N	\N
\.


--
-- Name: about_sections about_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.about_sections
    ADD CONSTRAINT about_sections_pkey PRIMARY KEY (id);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_telegram_id_key; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_telegram_id_key UNIQUE (telegram_id);


--
-- Name: advantages advantages_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.advantages
    ADD CONSTRAINT advantages_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: client_types client_types_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.client_types
    ADD CONSTRAINT client_types_pkey PRIMARY KEY (id);


--
-- Name: contact_requests contact_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.contact_requests
    ADD CONSTRAINT contact_requests_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: section_visibility section_visibility_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.section_visibility
    ADD CONSTRAINT section_visibility_pkey PRIMARY KEY (id);


--
-- Name: section_visibility section_visibility_section_key_key; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.section_visibility
    ADD CONSTRAINT section_visibility_section_key_key UNIQUE (section_key);


--
-- Name: service_examples service_examples_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.service_examples
    ADD CONSTRAINT service_examples_pkey PRIMARY KEY (id);


--
-- Name: service_features service_features_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.service_features
    ADD CONSTRAINT service_features_pkey PRIMARY KEY (id);


--
-- Name: service_items service_items_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.service_items
    ADD CONSTRAINT service_items_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_key_key UNIQUE (key);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: tech_stack tech_stack_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.tech_stack
    ADD CONSTRAINT tech_stack_pkey PRIMARY KEY (id);


--
-- Name: work_stage_points work_stage_points_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.work_stage_points
    ADD CONSTRAINT work_stage_points_pkey PRIMARY KEY (id);


--
-- Name: work_stages work_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.work_stages
    ADD CONSTRAINT work_stages_pkey PRIMARY KEY (id);


--
-- Name: ix_section_visibility_section_key; Type: INDEX; Schema: public; Owner: vezha
--

CREATE UNIQUE INDEX ix_section_visibility_section_key ON public.section_visibility USING btree (section_key);


--
-- Name: ix_service_examples_service_id; Type: INDEX; Schema: public; Owner: vezha
--

CREATE INDEX ix_service_examples_service_id ON public.service_examples USING btree (service_id);


--
-- Name: ix_service_features_service_id; Type: INDEX; Schema: public; Owner: vezha
--

CREATE INDEX ix_service_features_service_id ON public.service_features USING btree (service_id);


--
-- Name: ix_service_items_service_id; Type: INDEX; Schema: public; Owner: vezha
--

CREATE INDEX ix_service_items_service_id ON public.service_items USING btree (service_id);


--
-- Name: ix_work_stage_points_stage_id; Type: INDEX; Schema: public; Owner: vezha
--

CREATE INDEX ix_work_stage_points_stage_id ON public.work_stage_points USING btree (stage_id);


--
-- Name: service_examples service_examples_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.service_examples
    ADD CONSTRAINT service_examples_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: service_features service_features_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.service_features
    ADD CONSTRAINT service_features_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: service_items service_items_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.service_items
    ADD CONSTRAINT service_items_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: work_stage_points work_stage_points_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vezha
--

ALTER TABLE ONLY public.work_stage_points
    ADD CONSTRAINT work_stage_points_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.work_stages(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict jwaUmrlSBs1iNYxyKGMu9IZawYXMRsGuxKGCEXvoplb8RmIPEMccd5cLDEw4GDi

