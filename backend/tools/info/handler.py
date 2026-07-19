from pathlib import Path

from pypdf import PdfReader
from pypdf.errors import PdfReadError

from tools.info.schemas import InfoResponse


def extract_pdf_info(path: Path) -> InfoResponse:
    try:
        reader = PdfReader(path)
        meta = reader.metadata or {}
        return InfoResponse(
            pages=len(reader.pages),
            size_bytes=path.stat().st_size,
            title=meta.get("/Title", "") or "",
            author=meta.get("/Author", "") or "",
        )
    except PdfReadError as e:
        raise ValueError(str(e))
