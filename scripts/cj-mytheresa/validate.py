"""Validate that Mytheresa URLs are live (return 200, not 404)."""
import urllib.request
import urllib.error
import time

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"


def check_url(url: str, timeout: int = 15, max_retries: int = 2) -> dict:
    """
    Check a URL. Returns:
      {
        "url": original,
        "status": int or None,
        "ok": bool,
        "final_url": str or None,    # after redirects
        "is_404_page": bool,          # detected from page content
        "error": str or None,
      }
    """
    last_err = None
    for attempt in range(max_retries + 1):
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"},
                method="GET",
            )
            with urllib.request.urlopen(req, timeout=timeout) as r:
                # Read just enough to detect 404 page
                content = r.read(20000).decode("utf-8", errors="ignore")
                final_url = r.url
                # Mytheresa returns 200 for "soft 404" pages — must inspect body
                soft_404 = (
                    "Page not found" in content
                    or "no longer online" in content
                    or "We apologize" in content
                )
                return {
                    "url": url,
                    "status": r.status,
                    "ok": r.status == 200 and not soft_404,
                    "final_url": final_url,
                    "is_404_page": soft_404,
                    "error": None,
                }
        except urllib.error.HTTPError as e:
            return {
                "url": url,
                "status": e.code,
                "ok": False,
                "final_url": None,
                "is_404_page": False,
                "error": f"HTTP {e.code}",
            }
        except Exception as e:
            last_err = f"{type(e).__name__}: {e}"
            if attempt < max_retries:
                time.sleep(1 + attempt)
                continue
    return {
        "url": url,
        "status": None,
        "ok": False,
        "final_url": None,
        "is_404_page": False,
        "error": last_err or "unknown",
    }


def batch_check(urls: list[str], delay: float = 0.5) -> list[dict]:
    """Check multiple URLs sequentially with throttling."""
    results = []
    for i, u in enumerate(urls):
        if i > 0:
            time.sleep(delay)
        results.append(check_url(u))
    return results


if __name__ == "__main__":
    test_urls = [
        "https://www.mytheresa.com/us/en/women/loro-piana-open-walk-suede-ankle-boots-green-p00795149",
        "https://www.mytheresa.com/",
    ]
    for u in test_urls:
        r = check_url(u)
        flag = "✓" if r["ok"] else "✗"
        print(f"{flag} [{r['status']}] {u[:80]}")
        if r["is_404_page"]:
            print(f"    (soft-404 page detected)")
        if r["error"]:
            print(f"    error: {r['error']}")
