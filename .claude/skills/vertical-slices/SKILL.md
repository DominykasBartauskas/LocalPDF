---
name: vertical-slices
description: How LocalPDF tools are vertically sliced — one PDF tool spanning a backend router, a frontend component, and its wiring (route + tool card); when to add shared helpers vs keep logic in the slice
argument-hint: "[new-slice | review <path> | explain]"
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash
model: sonnet
effort: medium
---

Apply LocalPDF's vertical-slice convention: `$ARGUMENTS`

## Source of truth

The project rules and stack live in the repo's `CLAUDE.md` — **read it first**:

!`cat CLAUDE.md`

## What a slice is

A **slice** = one PDF tool (merge, split, rotate, …) implemented end-to-end:

- **Backend**: one router file in `backend/routers/<tool>.py` exposing `POST /api/<tool>`.
- **Frontend**: one component `frontend/src/components/<Tool>Tool.tsx`.
- **Wiring**: a `<Route>` in `App.tsx` and a card in `ToolGrid.tsx`.

Tools are **stateless transforms** — no DB, no auth, no persistence. Input is
uploaded PDF(s) + form params; output is a streamed file (or JSON for `/info`).

## Quick decision flow

1. **Backend router shape.** Every tool gets its own file in `backend/routers/`.
   - Pure sync PDF work goes in a private `_<verb>_pdf(path, ...)` helper.
   - The `async def` handler only: validates params, opens a `temp_pdf`/`temp_pdfs`
     context, offloads the helper via `run_in_executor`, and returns a
     `StreamingResponse` (or dict).
   - Register it in `main.py` with `app.include_router(<tool>.router, prefix="/api")`.
2. **Shared vs slice-local logic.** Start with the logic inline in the router's
   `_sync` helper. Promote a helper into `utils.py` only when a **second** router
   needs it (as `rotate_pages`/`delete_pages` already are). Never pre-extract "for
   consistency."
3. **File handling.** Always use `temp_pdf`/`temp_pdfs` from `utils.py` — never
   inline `tempfile` logic in a handler.
4. **Blocking work.** All pypdf/pikepdf/Pillow calls are synchronous — always run
   them through `loop.run_in_executor(None, _helper, ...)`. Never on the event loop.
5. **Errors.** Catch library errors (`PdfReadError`, `pikepdf.PdfError`) and bad
   input inside the sync helper (raise `ValueError`), then map to
   `HTTPException(status_code=400)` in the handler. Never let a library exception
   surface as a 500.
6. **Frontend slice shape.** One `<Tool>Tool.tsx` component per tool, wrapped in
   `<ToolLayout title="…">`. Use `FileDropzone` for uploads and the `useApi` hook
   for the call — never `fetch` directly. Use `download: true` for file responses;
   render `data` for JSON responses.
7. **Result states.** Show inline result cards (success = green/`CheckCircle` +
   "Do it again"; error = red/`XCircle` + parsed API message). Derive state with the
   `submitted && !loading` pattern — do NOT use `toast.promise` for primary feedback.
8. **Wiring.** Register the `<Route path="/<tool>">` in `App.tsx` and flip/add the
   tool's card in `ToolGrid.tsx` (set `available: true`). Keep the icon a
   `lucide-react` placeholder until custom assets land.

## Actions

- **new-slice** — scaffold a full tool: `backend/routers/<tool>.py` (sync helper +
  handler + `main.py` registration), `frontend/src/components/<Tool>Tool.tsx`, its
  `App.tsx` route, and its `ToolGrid.tsx` card. Confirm existing layout with `ls`
  before writing, and mirror an existing tool (e.g. `rotate`) closely.
- **review `<path>`** — check a slice against Decisions 1–8: blocking work off the
  event loop, `temp_pdf` used (no inline temp logic), library errors mapped to 400,
  `useApi`/`FileDropzone` used (no raw `fetch`/custom dropzone), inline result cards
  (no `toast.promise`), route + card both wired.
- **explain** — print `CLAUDE.md` above and walk the requester through the flow.

## Don't

- Don't add auth, a database, or persistence — tools are stateless.
- Don't inline `tempfile` handling — use `temp_pdf`/`temp_pdfs`.
- Don't run blocking PDF work on the event loop — use `run_in_executor`.
- Don't pre-extract a helper into `utils.py` before a second consumer exists.
- Don't call `fetch` directly or build a custom dropzone — use `useApi`/`FileDropzone`.
- Don't use `toast.promise` for primary tool feedback — use inline result cards.
- Don't use `npm`/`yarn` (use `pnpm`) or edit `pyproject.toml` by hand (use `uv add`).
