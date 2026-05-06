"""CJ Product Search API wrapper (GraphQL)."""
import os
import json
import urllib.request
import urllib.error
import time

ENDPOINT = "https://ads.api.cj.com/query"

# CJ identifiers — these are TWO DIFFERENT THINGS:
#   CID (Company ID)  = the publisher account → used by GraphQL API
#   PID (Property ID) = the website tracking ID → used in deep-link URLs
CID = "7910614"     # InvestedLuxury publisher account
PID = "101713247"   # InvestedLuxury.com property

# Mytheresa advertiser IDs (from CJ Get Code panels)
ADVERTISERS = {
    "us": "2817689",   # Mytheresa US/CA
    "uk": "2816786",   # Mytheresa UK
    "intl": "4189905", # Mytheresa - International
}


def _pat() -> str:
    p = os.environ.get("CJ_PAT")
    if not p:
        raise RuntimeError("CJ_PAT env var not set")
    return p


def graphql(query_str: str, max_retries: int = 3) -> dict:
    """Send GraphQL query to CJ. Returns parsed `data` field."""
    last_err = None
    for attempt in range(max_retries):
        req = urllib.request.Request(
            ENDPOINT,
            data=json.dumps({"query": query_str}).encode(),
            headers={
                "Authorization": f"Bearer {_pat()}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                body = json.loads(r.read())
                if "errors" in body:
                    raise RuntimeError(f"GraphQL errors: {body['errors']}")
                return body.get("data", {})
        except urllib.error.HTTPError as e:
            last_err = f"HTTP {e.code}: {e.read().decode()[:300]}"
            if e.code in (429, 502, 503, 504) and attempt < max_retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise RuntimeError(f"CJ API: {last_err}") from None
        except Exception as e:
            last_err = str(e)
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise RuntimeError(f"CJ API: {last_err}") from None
    raise RuntimeError(f"CJ API failed after {max_retries} attempts: {last_err}")


def search_product(keywords: str, advertiser: str = "us", limit: int = 5) -> list[dict]:
    """
    Search Mytheresa product feed by keywords.
    Returns list of {title, brand, link, price, currency, availability} dicts.

    Uses `shoppingProducts` (Mytheresa is a shopping advertiser) which exposes
    availability/price/imageLink directly without needing inline fragments.
    """
    advertiser_id = ADVERTISERS.get(advertiser, ADVERTISERS["us"])
    kw = keywords.replace('"', '\\"').replace('\n', ' ').strip()

    query = f"""
    {{
      shoppingProducts(
        companyId: "{CID}"
        partnerIds: ["{advertiser_id}"]
        keywords: ["{kw}"]
        limit: {limit}
      ) {{
        totalCount
        resultList {{
          advertiserId
          title
          brand
          link
          imageLink
          availability
          price {{ amount currency }}
        }}
      }}
    }}
    """
    data = graphql(query)
    result = data.get("shoppingProducts") or {}
    return result.get("resultList") or []


def best_match(results: list[dict], brand: str, name: str) -> dict | None:
    """
    Pick the best match from CJ search results.
    Heuristic: prefer in-stock items where brand matches and name keywords appear.
    """
    if not results:
        return None

    brand_lower = (brand or "").lower().strip()
    name_words = set(w.lower() for w in (name or "").split() if len(w) > 2)

    scored = []
    for r in results:
        title = (r.get("title") or "").lower()
        r_brand = (r.get("brand") or "").lower()
        availability = (r.get("availability") or "").lower()

        score = 0
        if brand_lower and brand_lower in r_brand:
            score += 10
        if brand_lower and brand_lower in title:
            score += 3
        # Count matching name words
        matches = sum(1 for w in name_words if w in title)
        score += matches * 2
        # Prefer in-stock
        if "stock" in availability or "available" in availability or availability == "in_stock":
            score += 5
        # Penalty for placeholder/empty
        if not r.get("link"):
            score -= 100

        scored.append((score, r))

    scored.sort(key=lambda x: x[0], reverse=True)
    if scored and scored[0][0] > 0:
        return scored[0][1]
    return None


if __name__ == "__main__":
    # Connectivity smoke test
    if "CJ_PAT" not in os.environ:
        print("CJ_PAT not set; skipping live test")
    else:
        print("Searching CJ for: 'loro piana open walk'...")
        r = search_product("loro piana open walk")
        print(f"Got {len(r)} results")
        for x in r[:3]:
            print(f"  - [{x.get('brand')}] {x.get('title')[:60]}  ({x.get('availability')})")
            print(f"    {x.get('link', '')[:80]}")
