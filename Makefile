.PHONY: help build up down logs clean generate db-reset test test-backend test-frontend

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all containers
	docker-compose build

up: ## Start all services
	docker-compose up -d
	@echo "Services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8080"
	@echo "Postgres: localhost:5432"
	@echo "Redis:    localhost:6379"

down: ## Stop all services
	docker-compose down

restart: down up ## Restart all services

logs: ## Tail logs from all services
	docker-compose logs -f

logs-backend: ## Tail logs from backend only
	docker-compose logs -f backend

logs-frontend: ## Tail logs from frontend only
	docker-compose logs -f frontend

generate: ## Generate proto types
	docker-compose run --rm proto-gen "cd proto && buf generate"
	@echo "Proto types generated!"

proto-watch: ## Watch proto files for changes and auto-generate types
	@echo "👀 Starting proto watcher..."
	@echo "Proto files will auto-generate when modified"
	@docker-compose --profile dev-tools up proto-watcher

db-reset: ## Reset database
	docker-compose down -v postgres
	docker-compose up -d postgres
	@echo "Database reset!"

db-migrate: ## Run database migrations
	docker-compose exec backend sh -c "cat migrations/*.sql | psql $$DATABASE_URL"
	@echo "Migrations applied!"

db-seed: ## Seed database with sample data
	docker-compose exec postgres psql -U devuser -d monorepo_dev -f /docker-entrypoint-initdb.d/init.sql
	@echo "Database seeded!"

db-console: ## Open PostgreSQL console
	docker-compose exec postgres psql -U devuser -d monorepo_dev

redis-cli: ## Open Redis CLI
	docker-compose exec redis redis-cli

clean: ## Remove all containers, volumes, and generated files
	docker-compose down -v
	rm -rf apps/backend/gen apps/frontend/src/gen
	@echo "Cleaned up!"

shell-backend: ## Open shell in backend container
	docker-compose exec backend sh

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend sh

shell-db: ## Open psql shell
	docker-compose exec postgres psql -U devuser -d monorepo_dev

test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend tests
	docker-compose exec backend go test -v ./...

test-frontend: ## Run frontend tests
	docker-compose exec frontend npm run test:ci

test-coverage: ## Run tests with coverage
	@echo "Running backend tests with coverage..."
	docker-compose exec backend go test -v -cover ./...
	@echo "Running frontend tests with coverage..."
	docker-compose exec frontend npm run test:coverage

test-integration: ## Run integration tests with test database
	docker-compose -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from backend-test

test-db: ## Start test database
	docker-compose -f docker-compose.test.yml up -d postgres-test redis-test
	@echo "Test database started on port 5433"
	@echo "Test Redis started on port 6380"

test-db-down: ## Stop test database
	docker-compose -f docker-compose.test.yml down

install-frontend: ## Install frontend dependencies
	docker-compose exec frontend npm install

install-backend: ## Install backend dependencies
	docker-compose exec backend go mod download

ps: ## Show running containers
	docker-compose ps

prune: ## Remove unused Docker resources
	docker system prune -af --volumes
	@echo "Docker system pruned!"

status: ## Check service health status
	@echo "Checking service status..."
	@curl -s http://localhost:8080/health > /dev/null && echo "✓ Backend is healthy" || echo "✗ Backend is not responding"
	@curl -s http://localhost:3000 > /dev/null && echo "✓ Frontend is healthy" || echo "✗ Frontend is not responding"
	@docker-compose exec postgres pg_isready > /dev/null 2>&1 && echo "✓ PostgreSQL is ready" || echo "✗ PostgreSQL is not ready"
	@docker-compose exec redis redis-cli ping > /dev/null 2>&1 && echo "✓ Redis is ready" || echo "✗ Redis is not ready"

dev: ## Start development environment and watch logs
	docker-compose up -d postgres redis
	@echo "Waiting for database and Redis to be ready..."
	@sleep 5
	docker-compose up backend frontend