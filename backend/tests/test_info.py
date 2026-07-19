def test_info_returns_metadata(client, three_page_pdf):
    resp = client.post("/api/info", files={"file": ("doc.pdf", three_page_pdf, "application/pdf")})
    assert resp.status_code == 200
    data = resp.json()
    assert data["pages"] == 3
    assert data["size_bytes"] == len(three_page_pdf)
    assert "title" in data
    assert "author" in data


def test_info_rejects_corrupt_pdf(client, bad_pdf):
    resp = client.post("/api/info", files={"file": ("bad.pdf", bad_pdf, "application/pdf")})
    assert resp.status_code == 400
