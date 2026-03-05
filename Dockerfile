# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder
RUN corepack enable
WORKDIR /app
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ .
RUN pnpm build

# Stage 2: Backend + static frontend
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:0.7.15 /uv /uvx /bin/
WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev
COPY backend/ .
COPY --from=frontend-builder /app/dist ./static

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
