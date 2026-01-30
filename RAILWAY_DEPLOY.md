# Деплой на Railway

## Шаг 1: Подготовка проекта

1. Зарегистрируйтесь на [Railway.app](https://railway.app/)
2. Установите Railway CLI (опционально):
```bash
npm i -g @railway/cli
```

## Шаг 2: Создание проекта

### Вариант A: Через веб-интерфейс (рекомендуется)

1. Зайдите на [railway.app/new](https://railway.app/new)
2. Выберите "Deploy from GitHub repo"
3. Подключите ваш GitHub аккаунт и выберите репозиторий
4. Railway автоматически создаст проект

### Вариант B: Через CLI

```bash
railway login
railway init
railway link
```

## Шаг 3: Настройка сервисов

Railway требует отдельный сервис для каждого компонента. Вам нужно создать 3 сервиса:

### 1. PostgreSQL Database

1. В Railway Dashboard нажмите "New" → "Database" → "Add PostgreSQL"
2. Railway автоматически создаст переменные:
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

### 2. Backend Service

1. Нажмите "New" → "GitHub Repo" → выберите ваш репозиторий
2. В настройках сервиса:
   - **Root Directory**: `backend`
   - **Build Command**: (оставьте пустым, Dockerfile сделает все)
   - **Start Command**: (оставьте пустым, Dockerfile сделает все)

3. Добавьте переменные окружения в разделе "Variables":
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=your-secret-key-here
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
TELEGRAM_BOT_USERNAME=your-bot-username
ADMIN_TELEGRAM_IDS=123456789,987654321
CORS_ORIGINS=https://your-frontend-domain.railway.app
PORT=8000
```

4. В разделе "Settings" → "Networking":
   - Включите "Public Networking"
   - Railway выдаст вам URL типа `backend-production-xxxx.up.railway.app`

### 3. Frontend Service

1. Нажмите "New" → "GitHub Repo" → выберите ваш репозиторий (еще раз)
2. В настройках сервиса:
   - **Root Directory**: `frontend`
   - **Build Command**: (оставьте пустым, Dockerfile сделает все)
   - **Start Command**: (оставьте пустым, Dockerfile сделает все)

3. Добавьте переменные окружения:
```
NUXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NUXT_PUBLIC_TELEGRAM_BOT_USERNAME=your-bot-username
PORT=3000
```

4. В разделе "Settings" → "Networking":
   - Включите "Public Networking"
   - Railway выдаст вам URL типа `frontend-production-xxxx.up.railway.app`

## Шаг 4: Настройка Railway.toml для каждого сервиса

Railway требует указать корневую директорию для каждого сервиса.

### Backend railway.toml
Создайте файл `backend/railway.toml`:
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT"
restartPolicyType = "always"
```

### Frontend railway.toml
Создайте файл `frontend/railway.toml`:
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "node .output/server/index.mjs"
restartPolicyType = "always"
```

## Шаг 5: Инициализация базы данных

После деплоя backend, нужно инициализировать БД:

### Через Railway CLI:
```bash
railway run --service backend python -c "from app.database import init_db; init_db()"
```

### Или через Railway Dashboard:
1. Откройте backend сервис
2. Перейдите в "Settings" → "Deploy" → "Deploy Trigger"
3. Добавьте команду для инициализации в переменные или выполните через консоль

## Шаг 6: Настройка CORS

Обновите переменную `CORS_ORIGINS` в backend сервисе с актуальным URL frontend:
```
CORS_ORIGINS=https://your-frontend-production-xxxx.up.railway.app
```

## Шаг 7: Настройка домена (опционально)

1. В настройках frontend сервиса перейдите в "Settings" → "Domains"
2. Нажмите "Custom Domain"
3. Добавьте свой домен и настройте DNS записи:
   - Тип: CNAME
   - Имя: @ или www
   - Значение: предоставленный Railway CNAME

## Автоматический деплой

Railway автоматически деплоит при пуше в главную ветку GitHub. Настроить можно в "Settings" → "Deploy":
- Branch: `main` или `master`
- Auto Deploy: включено

## Мониторинг и логи

- Логи доступны в разделе "Deployments" каждого сервиса
- Метрики использования ресурсов в разделе "Metrics"
- Alerts можно настроить в "Settings" → "Alerts"

## Стоимость

Railway предоставляет:
- $5 бесплатных кредитов в месяц для новых пользователей
- $0.000231/GB-час для памяти
- $0.000463/vCPU-час для процессора
- PostgreSQL: ~$5-10/месяц при базовом использовании

Примерная стоимость для вашего проекта: $10-20/месяц

## Troubleshooting

### Ошибка подключения к БД
- Проверьте, что `DATABASE_URL` правильно настроен
- Убедитесь, что backend сервис имеет доступ к Postgres сервису

### Frontend не может подключиться к Backend
- Проверьте `NUXT_PUBLIC_API_URL` в frontend
- Убедитесь, что CORS настроен правильно в backend

### Build failures
- Проверьте логи в разделе "Deployments"
- Убедитесь, что Dockerfile корректны и все зависимости установлены

## Полезные команды Railway CLI

```bash
# Логин
railway login

# Подключиться к проекту
railway link

# Просмотр логов
railway logs

# Выполнить команду в сервисе
railway run <command>

# Открыть проект в браузере
railway open
```
