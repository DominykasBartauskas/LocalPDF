import io

import pikepdf
import pytest
from fastapi import UploadFile

from utils import delete_pages, rotate_pages, temp_pdf, temp_pdfs

from .conftest import make_pdf


def _upload(data: bytes, name: str = "doc.pdf") -> UploadFile:
    return UploadFile(filename=name, file=io.BytesIO(data))


@pytest.mark.asyncio
async def test_temp_pdf_writes_and_cleans_up(one_page_pdf):
    async with temp_pdf(_upload(one_page_pdf)) as path:
        assert path.exists()
        assert path.read_bytes() == one_page_pdf
        saved = path
    assert not saved.exists()


@pytest.mark.asyncio
async def test_temp_pdf_uses_owner_only_permissions(one_page_pdf):
    async with temp_pdf(_upload(one_page_pdf)) as path:
        assert (path.stat().st_mode & 0o777) == 0o600


@pytest.mark.asyncio
async def test_temp_pdf_cleans_up_on_exception(one_page_pdf):
    saved = None
    with pytest.raises(RuntimeError):
        async with temp_pdf(_upload(one_page_pdf)) as path:
            saved = path
            assert path.exists()
            raise RuntimeError("boom")
    assert saved is not None and not saved.exists()


@pytest.mark.asyncio
async def test_temp_pdfs_writes_and_cleans_up(one_page_pdf, three_page_pdf):
    async with temp_pdfs([_upload(one_page_pdf), _upload(three_page_pdf)]) as paths:
        assert len(paths) == 2
        assert all(p.exists() for p in paths)
        saved = list(paths)
    assert all(not p.exists() for p in saved)


def test_rotate_pages_applies_absolute_rotation():
    pdf = pikepdf.open(io.BytesIO(make_pdf(3)))
    rotate_pages(pdf, {0: 90, 2: 180})
    assert pdf.pages[0].Rotate == 90
    assert "Rotate" not in pdf.pages[1]
    assert pdf.pages[2].Rotate == 180


def test_delete_pages_removes_by_index():
    pdf = pikepdf.open(io.BytesIO(make_pdf(4)))
    delete_pages(pdf, {0, 2})
    assert len(pdf.pages) == 2
