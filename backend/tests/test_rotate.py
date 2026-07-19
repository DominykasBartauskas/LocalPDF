import io
import json

from pypdf import PdfReader


def test_rotate_applies_rotation(client, three_page_pdf):
    resp = client.post(
        "/api/rotate",
        files={"file": ("doc.pdf", three_page_pdf, "application/pdf")},
        data={"rotations": json.dumps({"0": 90, "2": 180})},
    )
    assert resp.status_code == 200
    reader = PdfReader(io.BytesIO(resp.content))
    assert reader.pages[0].rotation == 90
    assert reader.pages[1].rotation == 0
    assert reader.pages[2].rotation == 180


def test_rotate_rejects_out_of_range_index(client, one_page_pdf):
    resp = client.post(
        "/api/rotate",
        files={"file": ("doc.pdf", one_page_pdf, "application/pdf")},
        data={"rotations": json.dumps({"5": 90})},
    )
    assert resp.status_code == 400


def test_rotate_rejects_invalid_degrees(client, one_page_pdf):
    resp = client.post(
        "/api/rotate",
        files={"file": ("doc.pdf", one_page_pdf, "application/pdf")},
        data={"rotations": json.dumps({"0": 45})},
    )
    assert resp.status_code == 400


def test_rotate_rejects_malformed_json(client, one_page_pdf):
    resp = client.post(
        "/api/rotate",
        files={"file": ("doc.pdf", one_page_pdf, "application/pdf")},
        data={"rotations": "{not json"},
    )
    assert resp.status_code == 400
