import io
import os
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List
from fastapi import UploadFile
from fastapi.responses import StreamingResponse
import pikepdf


async def _spool_to_temp(file: UploadFile) -> Path:
    """Atomically create a secure temp file and write the upload into it."""
    fd, name = tempfile.mkstemp(suffix=".pdf")
    path = Path(name)
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(await file.read())
    except BaseException:
        path.unlink(missing_ok=True)
        raise
    return path


@asynccontextmanager
async def temp_pdf(file: UploadFile):
    path = await _spool_to_temp(file)
    try:
        yield path
    finally:
        path.unlink(missing_ok=True)


@asynccontextmanager
async def temp_pdfs(files: List[UploadFile]):
    paths: List[Path] = []
    try:
        for file in files:
            paths.append(await _spool_to_temp(file))
        yield paths
    finally:
        for path in paths:
            path.unlink(missing_ok=True)


def pdf_download_response(
    data: bytes, filename: str, media_type: str = "application/pdf"
) -> StreamingResponse:
    """Stream bytes back as a downloadable attachment."""
    return StreamingResponse(
        io.BytesIO(data),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def rotate_pages(pdf: pikepdf.Pdf, rotations: dict[int, int]) -> None:
    """Apply absolute rotation to selected pages of an open pikepdf.Pdf."""
    for page_index, degrees in rotations.items():
        pdf.pages[page_index].rotate(degrees, relative=False)


def delete_pages(pdf: pikepdf.Pdf, to_delete: set[int]) -> None:
    """Remove pages at the given 0-based indices from an open pikepdf.Pdf."""
    for i in sorted(to_delete, reverse=True):
        del pdf.pages[i]
