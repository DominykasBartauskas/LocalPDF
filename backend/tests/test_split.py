import io
import zipfile

from pypdf import PdfReader


def _pages(data: bytes) -> int:
    return len(PdfReader(io.BytesIO(data)).pages)


def test_split_single_range_returns_pdf(client, three_page_pdf):
    resp = client.post(
        "/api/split",
        files={"file": ("doc.pdf", three_page_pdf, "application/pdf")},
        data={"ranges": "1-2"},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert _pages(resp.content) == 2


def test_split_multiple_ranges_returns_zip(client, three_page_pdf):
    resp = client.post(
        "/api/split",
        files={"file": ("doc.pdf", three_page_pdf, "application/pdf")},
        data={"ranges": "1,3"},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/zip"
    zf = zipfile.ZipFile(io.BytesIO(resp.content))
    assert len(zf.namelist()) == 2


def test_split_rejects_out_of_bounds(client, three_page_pdf):
    resp = client.post(
        "/api/split",
        files={"file": ("doc.pdf", three_page_pdf, "application/pdf")},
        data={"ranges": "1-99"},
    )
    assert resp.status_code == 400


def test_split_rejects_invalid_range(client, three_page_pdf):
    resp = client.post(
        "/api/split",
        files={"file": ("doc.pdf", three_page_pdf, "application/pdf")},
        data={"ranges": "abc"},
    )
    assert resp.status_code == 400
