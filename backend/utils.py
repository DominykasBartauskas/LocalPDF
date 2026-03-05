import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import UploadFile


@asynccontextmanager
async def temp_pdf(file: UploadFile):
    path = Path(tempfile.mktemp(suffix=".pdf"))
    try:
        path.write_bytes(await file.read())
        yield path
    finally:
        path.unlink(missing_ok=True)
