import asyncio
import io
import zipfile
from pathlib import Path
from typing import List

import pikepdf
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from utils import temp_pdf

router = APIRouter()


def _parse_ranges(range_str: str, total_pages: int) -> List[tuple[int, int]]:
    ranges = []
    for part in range_str.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            halves = part.split("-", 1)
            try:
                start, end = int(halves[0].strip()), int(halves[1].strip())
            except ValueError:
                raise ValueError(f"Invalid range: '{part}'")
        else:
            try:
                start = end = int(part)
            except ValueError:
                raise ValueError(f"Invalid page number: '{part}'")
        if start < 1 or end > total_pages or start > end:
            raise ValueError(
                f"Range {start}-{end} is out of bounds (PDF has {total_pages} pages)"
            )
        ranges.append((start, end))
    if not ranges:
        raise ValueError("No valid ranges specified")
    return ranges


def _split_pdf(path: Path, range_str: str) -> tuple[bytes, str, str]:
    try:
        with pikepdf.open(path) as src:
            total = len(src.pages)
            ranges = _parse_ranges(range_str, total)

            results = []
            for start, end in ranges:
                out = pikepdf.Pdf.new()
                try:
                    for i in range(start - 1, end):
                        out.pages.append(src.pages[i])
                    buf = io.BytesIO()
                    out.save(buf)
                    results.append((start, end, buf.getvalue()))
                finally:
                    out.close()
    except pikepdf.PdfError as e:
        raise ValueError(str(e))

    if len(results) == 1:
        start, end, data = results[0]
        name = f"page-{start}.pdf" if start == end else f"pages-{start}-{end}.pdf"
        return data, "application/pdf", name

    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for start, end, data in results:
            name = f"page-{start}.pdf" if start == end else f"pages-{start}-{end}.pdf"
            zf.writestr(name, data)
    return zip_buf.getvalue(), "application/zip", "split.zip"


@router.post("/split")
async def split(file: UploadFile = File(...), ranges: str = Form(...)):
    async with temp_pdf(file) as path:
        loop = asyncio.get_running_loop()
        try:
            data, media_type, filename = await loop.run_in_executor(
                None, _split_pdf, path, ranges
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e) or "Invalid or corrupt PDF file")

    return StreamingResponse(
        io.BytesIO(data),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
