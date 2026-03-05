import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pypdf import PdfReader
from utils import temp_pdf

load_dotenv()

app = FastAPI(title="LocalPDF API")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Accept"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/info")
async def info(file: UploadFile = File(...)):
    async with temp_pdf(file) as path:
        reader = PdfReader(path)
        meta = reader.metadata or {}

        return JSONResponse({
            "pages": len(reader.pages),
            "size_bytes": path.stat().st_size,
            "title": meta.get("/Title", "") or "",
            "author": meta.get("/Author", "") or "",
        })


static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
