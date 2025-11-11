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

# gRPC Testing Commands
grpc-ui: ## Launch gRPC web UI for interactive testing
	@echo "🚀 Launching gRPC UI..."
	@echo "Opening browser to test gRPC endpoints interactively"
	@echo "Press Ctrl+C to stop"
	grpcui -plaintext localhost:9090

grpc-list: ## List all available gRPC services
	@echo "📋 Available gRPC Services:"
	@grpcurl -plaintext localhost:9090 list

grpc-list-auth: ## List all AuthService methods
	@echo "🔐 AuthService Methods:"
	@grpcurl -plaintext localhost:9090 list datifyy.auth.v1.AuthService

grpc-describe: ## Describe RegisterWithEmail method
	@echo "📖 Method Description:"
	@grpcurl -plaintext localhost:9090 describe datifyy.auth.v1.AuthService.RegisterWithEmail

grpc-test-register: ## Test registration endpoint via gRPC
	@echo "Testing RegisterWithEmail via gRPC..."
	@echo '{"credentials":{"email":"makefile@example.com","password":"TestPass123*","name":"Makefile Test"}}' | \
		grpcurl -plaintext -d @ localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail

rest-test-register: ## Test registration endpoint via REST
	@echo "Testing RegisterWithEmail via REST..."
	@curl -X POST http://localhost:8080/api/v1/auth/register/email \
		-H "Content-Type: application/json" \
		-d '{"email":"makefile-rest@example.com","password":"TestPass123*","name":"Makefile REST Test"}'

grpc-test-page: ## Open browser test page
	@echo "Opening test page in browser..."
	open grpc-test.html

dev: ## Start development environment and watch logs
	docker-compose up -d postgres redis
	@echo "Waiting for database and Redis to be ready..."
	@sleep 5
	docker-compose up backend frontend

# ==============================================================================
# Proto & API Development Tools
# ==============================================================================

studio: ## Launch Buf Studio for interactive API testing
	@echo "🚀 Launching Buf Studio..."
	@echo ""
	@echo "Buf Studio will open in your browser at:"
	@echo "https://studio.buf.build"
	@echo ""
	@echo "To explore your proto files:"
	@echo "1. Click 'Load Schema' in Buf Studio"
	@echo "2. Select 'From Local Files'"
	@echo "3. Navigate to: $(PWD)/proto"
	@echo ""
	@echo "Available services:"
	@echo "  • datifyy.auth.v1.AuthService   - Authentication & Authorization"
	@echo "  • datifyy.user.v1.UserService   - User Profile Management"
	@echo ""
	@echo "NOTE: Your backend currently uses REST (HTTP)."
	@echo "To test with Buf Studio, you'll need to implement gRPC server."
	@echo ""
	@echo "Press Ctrl+C to return to terminal"
	@open "https://studio.buf.build"

studio-local: ## Run Buf Studio locally (requires buf CLI)
	@echo "🚀 Starting local Buf Studio server..."
	@cd proto && buf beta studio --listen 127.0.0.1:8081
	@echo "Studio running at http://localhost:8081"

proto-lint: ## Lint proto files
	@echo "🔍 Linting proto files..."
	docker-compose run --rm proto-gen "cd proto && buf lint"
	@echo "✓ Proto files linted!"

proto-breaking: ## Check for breaking changes in proto files
	@echo "🔍 Checking for breaking changes..."
	docker-compose run --rm proto-gen "cd proto && buf breaking --against '.git#branch=main'"
	@echo "✓ No breaking changes detected!"

proto-format: ## Format proto files
	@echo "✨ Formatting proto files..."
	docker-compose run --rm proto-gen "cd proto && buf format -w"
	@echo "✓ Proto files formatted!"

proto-docs: ## Generate proto documentation
	@echo "📚 Generating proto documentation..."
	@mkdir -p docs/proto
	docker-compose run --rm proto-gen "cd proto && buf generate --template buf.gen.docs.yaml"
	@echo "✓ Documentation generated in docs/proto/"
	@echo "Open docs/proto/index.html to view"

proto-status: ## Show proto file statistics
	@echo "📊 Proto File Statistics:"
	@echo ""
	@echo "Services:"
	@grep -r "^service" proto --include="*.proto" | wc -l | xargs echo "  Services defined:"
	@echo ""
	@echo "Messages:"
	@grep -r "^message" proto --include="*.proto" | wc -l | xargs echo "  Messages defined:"
	@echo ""
	@echo "Enums:"
	@grep -r "^enum" proto --include="*.proto" | wc -l | xargs echo "  Enums defined:"
	@echo ""
	@echo "RPCs:"
	@grep -r "rpc " proto --include="*.proto" | wc -l | xargs echo "  RPC methods defined:"
	@echo ""
	@echo "Files:"
	@find proto -name "*.proto" -not -path "*/buf/*" | wc -l | xargs echo "  Proto files:"

grpcurl-health: ## Test gRPC health check (when gRPC is implemented)
	@echo "Testing gRPC server health..."
	@grpcurl -plaintext localhost:9090 grpc.health.v1.Health/Check || echo "⚠️  gRPC server not running yet"

grpcurl-list: ## List available gRPC services (when gRPC is implemented)
	@echo "Available gRPC services:"
	@grpcurl -plaintext localhost:9090 list || echo "⚠️  gRPC server not running yet"

grpcurl-auth: ## Example: Test auth service with grpcurl
	@echo "Example: Register with email"
	@echo '{"credentials": {"email": "test@example.com", "password": "password123", "name": "Test User"}}' | \
		grpcurl -plaintext -d @ localhost:9090 datifyy.auth.v1.AuthService/RegisterWithEmail || \
		echo "⚠️  gRPC server not running yet"