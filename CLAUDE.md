# LocalPDF — Claude Project Rules

## Project overview
A self-hosted PDF toolkit (merge, split, rotate, compress, etc.) for homelab use.
Single Docker service: FastAPI serves both the API and the built React frontend.
No auth. No external uploads. Fully private.

## Current state
- ✅ /api/info
- ✅ /api/merge
- ✅ /api/split
- ⬜ /api/rotate
- ⬜ /api/delete
- ⬜ /api/reorder
- ⬜ /api/compress
- ⬜ /api/extract-images

## Stack
- **Backend**: Python 3.12, FastAPI, uv — lives in `backend/`
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, DaisyUI v5, react-router-dom, lucide-react, pnpm — lives in `frontend/`
- **PDF processing**: pypdf, pikepdf, Pillow
- **Notifications**: react-hot-toast (for edge cases only — prefer inline result cards)
- **Deployment**: Docker + Docker Compose (single service)

## Project structure
```
backend/
  main.py           # App setup, middleware, router registration, static mount
  utils.py          # Shared utilities (temp_pdf, temp_pdfs context managers)
  routers/          # One file per feature/tool
    info.py
    merge.py
    split.py
frontend/
  index.html        # data-theme="light" set here
  src/
    App.tsx         # BrowserRouter + Routes (one Route per tool)
    main.tsx
    index.css       # Tailwind + DaisyUI plugin + primary color override (maroon)
    hooks/
      useApi.ts     # Shared API hook — use for every backend call
    components/
      FileDropzone.tsx   # Shared dropzone — use for every file upload
      ToolLayout.tsx     # Shared wrapper for tool pages (back nav + title)
      ToolGrid.tsx       # Main page — grid of tool cards
      (one file per tool: MergeTool.tsx, SplitTool.tsx, ...)
```

## Backend conventions

### Routes
- All API endpoints live under `/api/*` via `app.include_router(router, prefix="/api")`
- Each tool gets its own router file in `backend/routers/`
- `main.py` only contains: app setup, middleware, router registrations, static mount
- `/health` lives directly in `main.py` (no prefix)

### File uploads
- Always use the `temp_pdf` / `temp_pdfs` async context managers from `utils.py`
- Never inline temp file logic in route handlers

```python
# Single file
async with temp_pdf(file) as path:
    ...

# Multiple files
async with temp_pdfs(files) as paths:
    ...
```

- If the uploaded file is not a valid PDF, `PdfReader` will raise `PdfReadError` — catch it and return `HTTPException(400, "Invalid or corrupted PDF")`

### Blocking I/O
- All pypdf/pikepdf/Pillow operations are synchronous — always offload via `run_in_executor`

```python
loop = asyncio.get_running_loop()
data = await loop.run_in_executor(None, _sync_helper, path)
```

### Error handling
- Catch `PdfReadError` (and other library-specific exceptions) and raise `HTTPException(status_code=400)`
- Never let unhandled library exceptions propagate as 500s

### Dependencies
- Manage with `uv add` — never edit `pyproject.toml` manually
- All runtime deps go in `[project.dependencies]`, not dev deps

## Frontend conventions

### API calls
- Always use the `useApi` hook — never call `fetch` directly in components
- The hook handles loading state, errors, and file downloads
- JSON endpoints return `{ data, loading, error, request }` — render `data` as needed
- Download endpoints (`download: true`) resolve with `null` data — do not attempt to render the response

```ts
const { data, loading, error, request } = useApi<ResponseType>()
await request('/info', { body: formData })
await request('/merge', { body: formData, download: true, filename: 'merged.pdf' })
```

### File uploads
- Always use the `FileDropzone` component — never build custom dropzones

```tsx
<FileDropzone onFiles={handleFiles} />
<FileDropzone onFiles={handleFiles} multiple label="Drop PDFs to merge" />
```

### Routing
- `react-router-dom` (`BrowserRouter` + `Routes`) — one `Route` per tool
- Main page `/` renders `ToolGrid`; each tool lives at `/<tool-id>` (e.g. `/merge`, `/split`)
- Wrap every tool page in `<ToolLayout title="...">` for consistent back-nav header
- Register new routes in `App.tsx` and add the tool card to `ToolGrid.tsx`

### Result states
- Tool pages show inline result cards (success/error) after an operation — do NOT use `toast.promise` for primary feedback
- Use the `submitted && !loading` pattern to derive result state from `useApi` without stale closure issues:
  ```tsx
  const showResult = submitted && !loading
  const isSuccess = showResult && !error
  const isError = showResult && !!error
  ```
- Success card: green border, `CheckCircle` icon, relevant info, "Do it again" reset button
- Error card: red border, `XCircle` icon, error message from API (already parsed by `useApi`)

### Notifications
- `react-hot-toast` for incidental feedback only (e.g. silent background errors)
- Do NOT use `toast.promise` for primary tool operations — use inline result cards instead

### Styling
- Tailwind CSS v4 for layout and spacing
- DaisyUI v5 components for UI elements (buttons, cards, alerts)
- Theme: forced `data-theme="light"` in `index.html`; primary color overridden to maroon in `index.css`
- Icons: `lucide-react` — current icons are placeholders pending custom icon assets; use lucide-react for all new tools until replaced
- No heavy UI libraries — keep it lean
- One component file per tool in `src/components/`

### Package manager
- Always use `pnpm` — never `npm` or `yarn`

## Dev workflow

### Backend
```bash
cd backend
uv run uvicorn main:app --reload
# API at http://localhost:8585
```

### Frontend
```bash
cd frontend
pnpm dev
# UI at http://localhost:5173
# /api/* proxied to http://localhost:8585
```

### Production
```bash
cp .env.example .env
docker compose up --build
# Everything at http://localhost:8585
```

## URL routing
| Context | Frontend calls | Reaches backend at |
|---------|---------------|-------------------|
| Dev | `fetch('/api/info')` → Vite proxy | `POST /api/info` |
| Production | `fetch('/api/info')` → same origin | `POST /api/info` |

The Vite proxy forwards `/api/*` without rewriting — the `/api` prefix is preserved end-to-end.

## What NOT to do
- Do not add auth — this is intentionally auth-free
- Do not add heavy UI libraries (no MUI, Chakra, Radix, etc.)
- Do not call `fetch` directly in components — use `useApi`
- Do not inline temp file handling — use `temp_pdf`
- Do not run blocking PDF operations on the event loop — use `run_in_executor`
- Do not use `npm` or `yarn` — use `pnpm`
