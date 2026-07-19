import asyncio

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from tools.split.handler import split_pdf
from utils import pdf_download_response, temp_pdf

router = APIRouter()


@router.post("/split")
async def split(file: UploadFile = File(...), ranges: str = Form(...)):
    async with temp_pdf(file) as path:
        loop = asyncio.get_running_loop()
        try:
            data, media_type, filename = await loop.run_in_executor(
                None, split_pdf, path, ranges
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e) or "Invalid or corrupt PDF file")

    return pdf_download_response(data, filename, media_type)
