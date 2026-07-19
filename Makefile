# LocalPDF — project task runner
# Backend: Python 3.12 + FastAPI + uv (backend/)
# Frontend: React 19 + Vite + pnpm (frontend/)
# Prod: Docker Compose (single service)

BACKEND  := backend
FRONTEND := frontend

.DEFAULT_GOAL := help

# ---------------------------------------------------------------------------
# Help
# ---------------------------------------------------------------------------
.PHONY: help
help: ## Show this help
	@grep -hE '^[a-zA-Z0-9_-]+:.*?## ' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ---------------------------------------------------------------------------
# Install
# ---------------------------------------------------------------------------
.PHONY: install install-backend install-frontend
install: install-backend install-frontend ## Install all dependencies

install-backend: ## Install backend dependencies (uv)
	cd $(BACKEND) && uv sync

install-frontend: ## Install frontend dependencies (pnpm)
	cd $(FRONTEND) && pnpm install

# ---------------------------------------------------------------------------
# Dev servers
# ---------------------------------------------------------------------------
.PHONY: dev-backend dev-frontend
dev-backend: ## Run backend dev server (http://localhost:8585)
	cd $(BACKEND) && uv run uvicorn main:app --reload --host 0.0.0.0 --port 8585

dev-frontend: ## Run frontend dev server (http://localhost:5173)
	cd $(FRONTEND) && pnpm dev

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
.PHONY: build
build: ## Build the frontend for production
	cd $(FRONTEND) && pnpm build

# ---------------------------------------------------------------------------
# Test
# ---------------------------------------------------------------------------
.PHONY: test test-backend test-frontend
test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend tests (pytest)
	cd $(BACKEND) && uv run pytest

test-frontend: ## Run frontend tests (vitest)
	cd $(FRONTEND) && pnpm test

# ---------------------------------------------------------------------------
# Lint
# ---------------------------------------------------------------------------
.PHONY: lint
lint: ## Lint the frontend (eslint)
	cd $(FRONTEND) && pnpm lint

# ---------------------------------------------------------------------------
# Docker (production)
# ---------------------------------------------------------------------------
.PHONY: up down logs
up: ## Build and start the production stack (http://localhost:8585)
	docker compose up --build -d

down: ## Stop the production stack
	docker compose down

logs: ## Tail production stack logs
	docker compose logs -f

# ---------------------------------------------------------------------------
# Housekeeping
# ---------------------------------------------------------------------------
.PHONY: clean
clean: ## Remove build artifacts and caches
	rm -rf $(FRONTEND)/dist
	find $(BACKEND) -type d -name __pycache__ -prune -exec rm -rf {} +
	find $(BACKEND) -type d -name .pytest_cache -prune -exec rm -rf {} +
