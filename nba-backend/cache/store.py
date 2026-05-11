import time
from typing import Any, Optional

_cache = {}


def get(key: str) -> Optional[Any]:
    if key in _cache:
        value, expires_at = _cache[key]
        if time.time() < expires_at:
            return value
        del _cache[key]
    return None


def set(key: str, value: Any, ttl: int = 30) -> None:
    _cache[key] = (value, time.time() + ttl)


def invalidate(key: str) -> None:
    _cache.pop(key, None)