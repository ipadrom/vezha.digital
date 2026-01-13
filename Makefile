.PHONY: help install dev build start stop restart logs clean migrate seed test

# Colors
GREEN  := \033[0;32m
YELLOW := \033[0;33m
CYAN   := \033[0;36m
RESET  := \033[0m

help: ## Показать справку
	@echo ""
	@echo "$(CYAN)VEZHA Digital - Команды$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ============================================
# DEVELOPMENT
# ============================================

install: ## Установить зависимости (backend + frontend)
	@echo "$(YELLOW)Installing backend dependencies...$(RESET)"
	cd backend && uv sync
	@echo "$(YELLOW)Installing frontend dependencies...$(RESET)"
	cd frontend && npm install
	@echo "$(GREEN)Done!$(RESET)"

install-backend: ## Установить только backend зависимости
	cd backend && uv sync

install-frontend: ## Установить только frontend зависимости
	cd frontend && npm install

dev-backend: ## Запустить backend (dev)
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Запустить frontend (dev)
	cd frontend && npm run dev

dev: ## Запустить backend и frontend параллельно (dev)
	@make -j2 dev-backend dev-frontend

# ============================================
# DATABASE
# ============================================

migrate-create: ## Создать новую миграцию (usage: make migrate-create MSG="description")
	cd backend && uv run alembic revision --autogenerate -m "$(MSG)"

migrate: ## Применить миграции
	cd backend && uv run alembic upgrade head

migrate-down: ## Откатить последнюю миграцию
	cd backend && uv run alembic downgrade -1

migrate-history: ## Показать историю миграций
	cd backend && uv run alembic history

seed: ## Заполнить БД демо-данными
	cd backend && uv run python seed.py

db-reset: ## Сбросить БД и заполнить заново
	cd backend && uv run alembic downgrade base && uv run alembic upgrade head && uv run python seed.py

# ============================================
# DOCKER
# ============================================

docker-build: ## Собрать Docker образы
	docker-compose build

docker-up: ## Запустить все контейнеры
	docker-compose up -d

docker-down: ## Остановить все контейнеры
	docker-compose down

docker-restart: ## Перезапустить контейнеры
	docker-compose down && docker-compose up -d

docker-logs: ## Показать логи всех контейнеров
	docker-compose logs -f

docker-logs-backend: ## Показать логи backend
	docker-compose logs -f backend

docker-logs-frontend: ## Показать логи frontend
	docker-compose logs -f frontend

docker-ps: ## Статус контейнеров
	docker-compose ps

docker-shell-backend: ## Зайти в shell backend контейнера
	docker-compose exec backend sh

docker-shell-frontend: ## Зайти в shell frontend контейнера
	docker-compose exec frontend sh

docker-shell-db: ## Зайти в PostgreSQL
	docker-compose exec db psql -U vezha -d vezha

docker-migrate: ## Применить миграции в Docker
	docker-compose exec backend alembic upgrade head

docker-seed: ## Заполнить БД демо-данными в Docker
	docker-compose exec backend python seed.py

docker-clean: ## Удалить контейнеры, образы и volumes
	docker-compose down -v --rmi local

# ============================================
# BUILD
# ============================================

build-frontend: ## Собрать frontend для production
	cd frontend && npm run build

build: docker-build ## Собрать все для production

# ============================================
# UTILITIES
# ============================================

clean: ## Очистить временные файлы
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".nuxt" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".output" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".venv" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "$(GREEN)Cleaned!$(RESET)"

env-copy: ## Скопировать .env.example в .env
	cp .env.example .env
	cp .env.example backend/.env
	cp frontend/.env.example frontend/.env
	@echo "$(GREEN)Don't forget to edit .env files!$(RESET)"

lint: ## Запустить линтеры
	cd backend && uv run ruff check .
	cd frontend && npm run lint

format: ## Отформатировать код
	cd backend && uv run ruff format .

# ============================================
# PRODUCTION
# ============================================

prod-deploy: ## Деплой на production (build + up)
	@echo "$(YELLOW)Building images...$(RESET)"
	docker-compose build --no-cache
	@echo "$(YELLOW)Starting containers...$(RESET)"
	docker-compose up -d
	@echo "$(YELLOW)Running migrations...$(RESET)"
	docker-compose exec backend alembic upgrade head
	@echo "$(GREEN)Deployed!$(RESET)"

prod-update: ## Обновить production (pull + rebuild + restart)
	git pull
	docker-compose build
	docker-compose up -d
	docker-compose exec backend alembic upgrade head
	@echo "$(GREEN)Updated!$(RESET)"
