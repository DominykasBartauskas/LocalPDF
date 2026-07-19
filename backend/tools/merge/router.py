import asyncio
from typing import List

from fastapi import APIRouter, File, HTTPException, UploadFile

from tools.merge.handler import merge_pdfs
from utils import pdf_download_response, temp_pdfs

router = APIRouter()


@router.post("/merge")
async def merge(files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files are required")

    async with temp_pdfs(files) as paths:
        loop = asyncio.get_running_loop()
        try:
            data = await loop.run_in_executor(None, merge_pdfs, paths)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e) or "Invalid or corrupt PDF file")

    return pdf_download_response(data, "merged.pdf")
