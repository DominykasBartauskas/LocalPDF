import asyncio

from fastapi import APIRouter, File, HTTPException, UploadFile

from tools.info.handler import extract_pdf_info
from tools.info.schemas import InfoResponse
from utils import temp_pdf

router = APIRouter()


@router.post("/info", response_model=InfoResponse)
async def info(file: UploadFile = File(...)) -> InfoResponse:
    async with temp_pdf(file) as path:
        loop = asyncio.get_running_loop()
        try:
            data = await loop.run_in_executor(None, extract_pdf_info, path)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e) or "Invalid or corrupt PDF file")
        return data
