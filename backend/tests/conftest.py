import io

import pytest
from fastapi.testclient import TestClient
from pypdf import PdfWriter

from main import app


@pytest.fixture
def client():
    return TestClient(app)


def make_pdf(pages: int = 1, width: float = 200, height: float = 300) -> bytes:
    """Build an in-memory PDF with the given number of blank pages."""
    writer = PdfWriter()
    for _ in range(pages):
        writer.add_blank_page(width=width, height=height)
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


@pytest.fixture
def pdf_factory():
    """Factory fixture: pdf_factory(pages) -> bytes."""
    return make_pdf


@pytest.fixture
def one_page_pdf() -> bytes:
    return make_pdf(1)


@pytest.fixture
def three_page_pdf() -> bytes:
    return make_pdf(3)


@pytest.fixture
def bad_pdf() -> bytes:
    return b"this is definitely not a pdf"
