import asyncio
import io
import json
from pathlib import Path

import pikepdf
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from utils import rotate_pages, temp_pdf

router = APIRouter()

VALID_DEGREES = {0, 90, 180, 270}


def _rotate_pdf(path: Path, rotations_json: str) -> bytes:
    try:
        raw: dict = json.loads(rotations_json)
    except json.JSONDecodeError:
        raise ValueError("Invalid rotations format")

    try:
        with pikepdf.open(path) as pdf:
            total = len(pdf.pages)
            rotations: dict[int, int] = {}
            for k, v in raw.items():
                idx = int(k)
                deg = int(v)
                if idx < 0 or idx >= total:
                    raise ValueError(f"Page index {idx} out of range (PDF has {total} pages)")
                if deg not in VALID_DEGREES:
                    raise ValueError(f"Invalid degrees: {deg}")
                rotations[idx] = deg

            rotate_pages(pdf, rotations)
            buf = io.BytesIO()
            pdf.save(buf)
            return buf.getvalue()
    except pikepdf.PdfError as e:
        raise ValueError(str(e))


@router.post("/rotate")
async def rotate(file: UploadFile = File(...), rotations: str = Form(...)):
    async with temp_pdf(file) as path:
        loop = asyncio.get_running_loop()
        try:
            data = await loop.run_in_executor(None, _rotate_pdf, path, rotations)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    return StreamingResponse(
        io.BytesIO(data),
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="rotated.pdf"'},
    )
