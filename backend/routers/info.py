import asyncio
from fastapi import APIRouter, File, HTTPException, UploadFile
from pathlib import Path
from pypdf import PdfReader
from pypdf.errors import PdfReadError
from utils import temp_pdf

router = APIRouter()


def _extract_pdf_info(path: Path) -> dict:
    try:
        reader = PdfReader(path)
        meta = reader.metadata or {}
        return {
            "pages": len(reader.pages),
            "size_bytes": path.stat().st_size,
            "title": meta.get("/Title", "") or "",
            "author": meta.get("/Author", "") or "",
        }
    except PdfReadError as e:
        raise ValueError(str(e))


@router.post("/info")
async def info(file: UploadFile = File(...)):
    async with temp_pdf(file) as path:
        loop = asyncio.get_running_loop()
        try:
            data = await loop.run_in_executor(None, _extract_pdf_info, path)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e) or "Invalid or corrupt PDF file")
        return data
