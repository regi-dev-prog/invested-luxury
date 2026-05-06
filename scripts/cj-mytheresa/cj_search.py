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


def best_match(results: list[dict], brand: str, name: str,
               prefer_advertiser: str = "2817689") -> dict | None:
    """
    Pick the best Mytheresa product match.
    Scoring (highest wins):
      +20  exact brand match in result.brand
      +10  brand appears in result.title
      +5   each name keyword appears in result.title (3+ chars)
      +15  advertiser is preferred (default: Mytheresa US/CA = 2817689)
      +10  URL contains '/en-us/' or '/us/en/' (US-targeted)
      +10  availability == 'in stock' (case-insensitive)
      -100 missing link
    Returns the highest-scoring match if score > 0, else None.
    """
    if not results:
        return None

    brand_lower = (brand or "").lower().strip()
    # Tokenize name, drop tiny + common words
    stopwords = {"the", "and", "for", "with", "small", "medium", "large",
                 "mini", "micro", "bag", "bags", "shoe", "shoes"}
    name_words = {
        w.lower() for w in (name or "").replace("-", " ").split()
        if len(w) > 2 and w.lower() not in stopwords
    }

    scored = []
    for r in results:
        title = (r.get("title") or "").lower()
        r_brand = (r.get("brand") or "").lower()
        r_advertiser = str(r.get("advertiserId") or "")
        link = r.get("link") or ""
        availability = (r.get("availability") or "").lower()

        score = 0
        if brand_lower:
            if brand_lower == r_brand:
                score += 20
            elif brand_lower in r_brand or r_brand in brand_lower:
                score += 15
            if brand_lower in title:
                score += 10
        # Name keyword overlap
        matches = sum(1 for w in name_words if w in title)
        score += matches * 5
        # Prefer the right advertiser program
        if r_advertiser == prefer_advertiser:
            score += 15
        # Prefer en-us / us/en URLs (American audience)
        if "/en-us/" in link or "/us/en/" in link:
            score += 10
        # In-stock preference
        if "in stock" in availability or "instock" in availability:
            score += 10
        # Penalty for missing link
        if not link:
            score -= 100

        scored.append((score, r))

    scored.sort(key=lambda x: x[0], reverse=True)
    if scored and scored[0][0] >= 20:  # require at least decent confidence
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
