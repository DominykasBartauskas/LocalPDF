import io
from pathlib import Path
from typing import List

import pikepdf


def merge_pdfs(paths: List[Path]) -> bytes:
    merged = pikepdf.Pdf.new()
    try:
        for path in paths:
            try:
                with pikepdf.open(path) as src:
                    merged.pages.extend(src.pages)
            except pikepdf.PdfError as e:
                raise ValueError(str(e))
        buf = io.BytesIO()
        merged.save(buf)
        return buf.getvalue()
    finally:
        merged.close()
