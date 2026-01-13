# Деплой VEZHA Digital на VPS

Сайт будет доступен по адресу: `https://n1x9s.site/vezha/`

## Требования

- VPS с Ubuntu 20.04+
- Docker и Docker Compose
- Nginx (уже установлен для основного сайта)
- Домен n1x9s.site с SSL

---

## Шаг 1: Подготовка на локальной машине

### Закоммить и запушить код
```bash
cd /Users/n1x9s/Developer/myprjcts/ipadrom
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## Шаг 2: На VPS сервере

### 2.1 Подключись к серверу
```bash
ssh user@твой_сервер
```

### 2.2 Установи Docker (если нет)
```bash
# Проверь установлен ли Docker
docker --version

# Если нет - установи
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Перелогинься для применения группы
exit
ssh user@твой_сервер
```

### 2.3 Склонируй проект
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/ipadrom.git vezha
cd vezha
```

### 2.4 Создай файл с паролем БД
```bash
# Сгенерируй надёжный пароль
PASS=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24)
echo "Твой пароль БД: $PASS"

# Сохрани в файл
cat > .env.prod << EOF
POSTGRES_PASSWORD=$PASS
EOF
```

### 2.5 Настрой backend/.env.production
```bash
# Сгенерируй SECRET_KEY
SECRET=$(openssl rand -hex 32)

# Отредактируй файл
nano backend/.env.production
```

Замени значения:
```env
DATABASE_URL=postgresql+asyncpg://vezha:ПАРОЛЬ_ИЗ_ШАГА_2.4@vezha-db:5432/vezha

SECRET_KEY=СЕКРЕТ_ИЗ_КОМАНДЫ_ВЫШЕ

TELEGRAM_BOT_TOKEN=8339597464:AAFH8QO5tb9D0sqMIfwQ5zu11FFLPZkF1Ko
TELEGRAM_CHAT_ID=534957228
TELEGRAM_BOT_USERNAME=vezhadigitalbot

ADMIN_TELEGRAM_IDS=534957228

CORS_ORIGINS=https://n1x9s.site

UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=10485760

ROOT_PATH=/vezha/api
```

---

## Шаг 3: Запуск контейнеров

### 3.1 Собери и запусти
```bash
cd /var/www/vezha

# Загрузи переменные окружения
export $(cat .env.prod | xargs)

# Собери образы
docker compose -f docker-compose.prod.yml build

# Запусти контейнеры
docker compose -f docker-compose.prod.yml up -d

# Проверь статус
docker compose -f docker-compose.prod.yml ps
```

### 3.2 Подожди и запусти миграции
```bash
# Подожди пока БД запустится (10-15 сек)
sleep 15

# Запусти миграции
docker compose -f docker-compose.prod.yml exec vezha-backend alembic upgrade head
```

### 3.3 Загрузи демо-данные
```bash
docker compose -f docker-compose.prod.yml exec vezha-backend python seed.py
```

### 3.4 Проверь что контейнеры работают
```bash
# Должно показать 3 контейнера: vezha-backend, vezha-frontend, vezha-db
docker compose -f docker-compose.prod.yml ps

# Проверь логи если что-то не работает
docker compose -f docker-compose.prod.yml logs -f
```

---

## Шаг 4: Настройка Nginx

### 4.1 Открой конфиг своего сайта
```bash
sudo nano /etc/nginx/sites-available/n1x9s.site
```

### 4.2 Добавь внутрь блока `server { ... }` (где уже есть SSL):
```nginx
# =====================
# VEZHA Digital
# =====================

# Frontend
location /vezha/ {
    proxy_pass http://127.0.0.1:3001/vezha/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# Backend API
location /vezha/api/ {
    proxy_pass http://127.0.0.1:8001/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Uploads (картинки проектов)
location /vezha/uploads/ {
    alias /var/www/vezha/backend/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 4.3 Проверь и перезапусти Nginx
```bash
# Проверь синтаксис
sudo nginx -t

# Если OK - перезагрузи
sudo systemctl reload nginx
```

---

## Шаг 5: Настройка Telegram

### 5.1 Зарегистрируй домен в @BotFather
1. Открой Telegram → @BotFather
2. `/mybots`
3. Выбери `vezhadigitalbot`
4. `Bot Settings` → `Domain`
5. Введи: `n1x9s.site`

---

## Шаг 6: Проверка

### Открой в браузере:
- **Сайт:** https://n1x9s.site/vezha/
- **API Docs:** https://n1x9s.site/vezha/api/docs
- **Админка:** https://n1x9s.site/vezha/admin/login

---

## Полезные команды

### Просмотр логов
```bash
cd /var/www/vezha

# Все логи
docker compose -f docker-compose.prod.yml logs -f

# Только backend
docker compose -f docker-compose.prod.yml logs -f vezha-backend

# Только frontend
docker compose -f docker-compose.prod.yml logs -f vezha-frontend
```

### Перезапуск
```bash
cd /var/www/vezha
docker compose -f docker-compose.prod.yml restart
```

### Остановка
```bash
docker compose -f docker-compose.prod.yml down
```

### Обновление после изменений в коде
```bash
cd /var/www/vezha
git pull origin main
export $(cat .env.prod | xargs)
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec vezha-backend alembic upgrade head
```

### Очистка (если нужно начать заново)
```bash
cd /var/www/vezha
docker compose -f docker-compose.prod.yml down -v  # -v удалит БД!
```

---

## Troubleshooting

### Ошибка "permission denied"
```bash
sudo chown -R $USER:$USER /var/www/vezha
```

### Контейнер не запускается
```bash
docker compose -f docker-compose.prod.yml logs vezha-backend
```

### Nginx ошибка 502 Bad Gateway
```bash
# Проверь что контейнеры запущены
docker compose -f docker-compose.prod.yml ps

# Проверь что порты слушаются
sudo netstat -tlnp | grep -E "3001|8001"
```

### БД не подключается
```bash
# Проверь логи БД
docker compose -f docker-compose.prod.yml logs vezha-db

# Проверь пароль в .env.prod и backend/.env.production - они должны совпадать!
```
