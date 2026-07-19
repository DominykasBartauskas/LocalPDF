from pydantic import BaseModel


class InfoResponse(BaseModel):
    pages: int
    size_bytes: int
    title: str = ""
    author: str = ""
