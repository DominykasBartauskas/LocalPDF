from pathlib import Path

from pypdf import PdfReader
from pypdf.errors import PdfReadError


def extract_pdf_info(path: Path) -> dict:
    try:
        reader = PdfReader(path)
        meta = reader.metadata or {}
        return {
            "pages": len(reader.pages),
            "size_bytes": path.stat().st_size,
            "title": meta.get("/Title", "") or "",
            "author": meta.get("/Author", "") or "",
        }
    except PdfReadError as e:
        raise ValueError(str(e))
