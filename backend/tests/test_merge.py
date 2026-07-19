import io

from pypdf import PdfReader


def _pages(data: bytes) -> int:
    return len(PdfReader(io.BytesIO(data)).pages)


def test_merge_combines_page_counts(client, one_page_pdf, three_page_pdf):
    resp = client.post(
        "/api/merge",
        files=[
            ("files", ("a.pdf", one_page_pdf, "application/pdf")),
            ("files", ("b.pdf", three_page_pdf, "application/pdf")),
        ],
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert _pages(resp.content) == 4


def test_merge_requires_at_least_two_files(client, one_page_pdf):
    resp = client.post(
        "/api/merge",
        files=[("files", ("a.pdf", one_page_pdf, "application/pdf"))],
    )
    assert resp.status_code == 400


def test_merge_rejects_corrupt_file(client, one_page_pdf, bad_pdf):
    resp = client.post(
        "/api/merge",
        files=[
            ("files", ("a.pdf", one_page_pdf, "application/pdf")),
            ("files", ("bad.pdf", bad_pdf, "application/pdf")),
        ],
    )
    assert resp.status_code == 400
