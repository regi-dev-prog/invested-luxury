"""URL wrapping/parsing utilities for CJ + Mytheresa."""
from urllib.parse import quote, unquote, urlparse, parse_qs
import hashlib

CJ_PID = "101713247"
CJ_DOMAIN = "anrdoezrs.net"

# Mytheresa programs (in CJ)
LINK_IDS = {
    "us": "15513564",   # Mytheresa US/CA
    "uk": "15512623",   # Mytheresa UK
    "intl": "15513483", # Mytheresa - International
}
DEFAULT_LINK = LINK_IDS["us"]

CJ_DOMAINS = (
    "anrdoezrs.net", "tkqlhce.com", "jdoqocy.com",
    "kqzyfj.com", "dpbolvw.net", "emjcd.com", "qksrv.net",
)


def is_already_wrapped(url: str) -> bool:
    """True if URL is a CJ deep link."""
    if not url:
        return False
    return any(d in url for d in CJ_DOMAINS)


def is_mytheresa(url: str) -> bool:
    """True if URL is a raw (un-wrapped) mytheresa.com URL."""
    if not url:
        return False
    return "mytheresa.com" in url and not is_already_wrapped(url)


def extract_underlying_url(wrapped_url: str) -> str | None:
    """
    Given a CJ-wrapped URL like:
      https://www.anrdoezrs.net/click-101713247-15513564?sid=il-foo&url=https%3A%2F%2Fwww.mytheresa.com%2Fus%2Fen%2Fwomen%2Ffoo
    Return the underlying mytheresa.com URL.
    """
    if not is_already_wrapped(wrapped_url):
        return None
    try:
        parsed = urlparse(wrapped_url)
        params = parse_qs(parsed.query)
        url_param = params.get("url", [None])[0]
        if url_param:
            return unquote(url_param)
    except Exception:
        pass
    return None


def build_sid(slug: str, max_total: int = 64) -> str:
    """Build SID with truncation + hash suffix for uniqueness."""
    sid = f"il-{slug}"
    if len(sid) > max_total:
        h = hashlib.md5(slug.encode()).hexdigest()[:4]
        sid = f"il-{slug[:max_total - 3 - 1 - 4]}-{h}"
    return sid


def wrap_url(myt_url: str, sid: str, link_id: str = DEFAULT_LINK) -> str:
    """Build CJ deep link from a raw mytheresa URL."""
    encoded = quote(myt_url, safe="")
    return f"https://www.{CJ_DOMAIN}/click-{CJ_PID}-{link_id}?sid={sid}&url={encoded}"


def normalize_mytheresa_url(url: str) -> str:
    """
    Normalize Mytheresa URL paths.
    /en-us/foo  → /us/en/foo  (newer canonical format used by CJ feed)
    Strips tracking params.
    """
    if not url or "mytheresa.com" not in url:
        return url
    # Strip query/hash
    base = url.split("?")[0].split("#")[0].rstrip("/")
    # Normalize locale
    base = base.replace("/en-us/", "/us/en/")
    return base


# Self-test
if __name__ == "__main__":
    test = "https://www.mytheresa.com/us/en/women/loro-piana-open-walk-suede-ankle-boots-green-p00795149"
    sid = build_sid("loro-piana-open-walk")
    wrapped = wrap_url(test, sid)
    print(f"Original: {test}")
    print(f"SID:      {sid}")
    print(f"Wrapped:  {wrapped}")
    print()
    extracted = extract_underlying_url(wrapped)
    print(f"Extracted: {extracted}")
    assert extracted == test, f"Extraction failed: {extracted}"
    assert is_already_wrapped(wrapped)
    assert is_mytheresa(test)
    assert not is_mytheresa(wrapped)
    print("✓ All tests pass")
