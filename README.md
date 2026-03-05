# LocalPDF
A self-hosted PDF toolkit for merging, splitting, rotating, compressing and more. No uploads, no limits, fully private.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Python 3.12, uv |
| PDF processing | pypdf, pikepdf, Pillow |
| Frontend | React 18, Vite |

## Project structure

```
LocalPDF/
├── backend/        # FastAPI application
├── frontend/       # React 18 + Vite application
└── .env.example    # Environment variable template
```

## Getting started

### Backend

```bash
cp .env.example .env
cd backend
uv sync
uv run uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
Health check: `GET http://localhost:8000/health`

### Frontend

Coming soon.

## Environment variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_HOST` | `0.0.0.0` | Host the API binds to |
| `BACKEND_PORT` | `8000` | Port the API listens on |
| `BACKEND_RELOAD` | `true` | Enable hot reload (dev only) |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated CORS origins |
