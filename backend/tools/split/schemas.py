from typing import NamedTuple


class PageRange(NamedTuple):
    start: int
    end: int


class SplitResult(NamedTuple):
    data: bytes
    media_type: str
    filename: str
