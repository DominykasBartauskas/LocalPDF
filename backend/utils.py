import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List
from fastapi import UploadFile
import pikepdf


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


def rotate_pages(pdf: pikepdf.Pdf, rotations: dict[int, int]) -> None:
    """Apply absolute rotation to selected pages of an open pikepdf.Pdf."""
    for page_index, degrees in rotations.items():
        pdf.pages[page_index].rotate(degrees, relative=False)


def delete_pages(pdf: pikepdf.Pdf, to_delete: set[int]) -> None:
    """Remove pages at the given 0-based indices from an open pikepdf.Pdf."""
    for i in sorted(to_delete, reverse=True):
        del pdf.pages[i]
