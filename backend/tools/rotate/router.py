import asyncio

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from tools.rotate.handler import rotate_pdf
from utils import pdf_download_response, temp_pdf

router = APIRouter()


@router.post("/rotate")
async def rotate(file: UploadFile = File(...), rotations: str = Form(...)):
    async with temp_pdf(file) as path:
        loop = asyncio.get_running_loop()
        try:
            data = await loop.run_in_executor(None, rotate_pdf, path, rotations)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e) or "Invalid or corrupt PDF file")

    return pdf_download_response(data, "rotated.pdf")
