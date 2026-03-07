import asyncio
import io
from pathlib import Path
from typing import List

import pikepdf
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from utils import temp_pdfs

router = APIRouter()


def _merge_pdfs(paths: List[Path]) -> bytes:
    merged = pikepdf.Pdf.new()
    try:
        for path in paths:
            try:
                with pikepdf.open(path) as src:
                    merged.pages.extend(src.pages)
            except pikepdf.PdfError as e:
                raise ValueError(str(e))
        buf = io.BytesIO()
        merged.save(buf)
        return buf.getvalue()
    finally:
        merged.close()


@router.post("/merge")
async def merge(files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files are required")

    async with temp_pdfs(files) as paths:
        loop = asyncio.get_running_loop()
        try:
            data = await loop.run_in_executor(None, _merge_pdfs, paths)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e) or "Invalid or corrupt PDF file")

    return StreamingResponse(
        io.BytesIO(data),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=merged.pdf"},
    )
