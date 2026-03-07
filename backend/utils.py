import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List
from fastapi import UploadFile


@asynccontextmanager
async def temp_pdf(file: UploadFile):
    path = Path(tempfile.mktemp(suffix=".pdf"))
    try:
        path.write_bytes(await file.read())
        yield path
    finally:
        path.unlink(missing_ok=True)


@asynccontextmanager
async def temp_pdfs(files: List[UploadFile]):
    paths: List[Path] = []
    try:
        for file in files:
            path = Path(tempfile.mktemp(suffix=".pdf"))
            paths.append(path)
            path.write_bytes(await file.read())
        yield paths
    finally:
        for path in paths:
            path.unlink(missing_ok=True)
