"""
CJ Product Search wrapper with STRICT matching.

Hard filters (mandatory — fail = reject candidate):
  - gender: link must NOT contain /men/, /enfant/, /kids/, /homme/, /baby/
  - brand:  link path or title must contain the Sanity brand
  - category: link path/title must match Sanity product category bucket
  - model:  if Sanity name has a known model identifier, link must contain it

Soft scoring on top of hard filters:
  - +20  exact brand match in result.brand field
  - +15  preferred advertiser (Mytheresa US/CA)
  - +10  link contains '/en-us/' or '/us/en/'
  - +10  in stock
  - +5   per overlapping name keyword (>=3 chars, not stopword)

Returns candidate only if:
  - passes ALL hard filters
  - score >= 50
  - name word overlap >= 60%
"""
import os
import json
import re
import time
import unicodedata
import urllib.request
import urllib.error

ENDPOINT = "https://ads.api.cj.com/query"
CID = "7910614"     # publisher company account
PID = "101713247"   # property tracker (used in deep-link wrap, not API)

ADVERTISERS = {
    "us":   "2817689",
    "uk":   "2816786",
    "intl": "4189905",
}

# Hard filter: link must NOT contain any of these segments
DISALLOWED_GENDER_SEGMENTS = (
    "/men/", "/homme/", "/enfant/", "/kids/", "/baby/", "/uomo/",
)

# Known model identifiers - if Sanity name contains one, it MUST appear in CJ result
MODEL_IDENTIFIERS = {
    "margaux", "jodie", "peekaboo", "park", "manhattan", "loulou",
    "kate", "mamma baguette", "andiamo", "marcie", "woody", "lauren",
    "cleo", "re-edition", "open walk", "lakeside", "summer charms",
    "summer walk", "extra pocket", "grande unita", "sesia", "park",
    "canal", "fisherman", "hereditas", "round", "zipped", "danielle",
    "olivia", "lotus", "arizona", "anagram", "intrecciato", "vlogo",
    "horsebit", "chelsea", "riding",
}

# Category buckets for matching (Sanity name words → bucket)
CATEGORY_BUCKETS = {
    "bag": {"bag", "tote", "clutch", "crossbody", "pouch", "satchel", "shoulder", "hobo", "bucket"},
    "shoe": {"shoe", "shoes", "boot", "boots", "sandal", "sandals", "loafer", "loafers",
             "flat", "flats", "pump", "pumps", "sneaker", "sneakers", "mule", "mules",
             "espadrille", "espadrilles", "slipper", "slippers", "heel", "heels"},
    "clothing": {"shirt", "blouse", "sweater", "cardigan", "coat", "jacket", "blazer",
                 "pants", "trousers", "jeans", "dress", "skirt", "robe", "top",
                 "t-shirt", "tee", "knit", "vest"},
    "belt": {"belt"},
    "scarf": {"scarf", "wrap", "shawl", "stole"},
    "jewelry": {"earring", "earrings", "necklace", "bracelet", "ring", "pendant"},
    "sunglasses": {"sunglasses", "glasses", "eyewear"},
    "hat": {"hat", "cap", "beanie"},
}


def _pat() -> str:
    p = os.environ.get("CJ_PAT")
    if not p:
        raise RuntimeError("CJ_PAT env var not set")
    return p


def _normalize(s: str) -> str:
    """Lowercase, strip accents, alphanumeric+space only."""
    if not s:
        return ""
    s = unicodedata.normalize("NFKD", s).encode("ASCII", "ignore").decode()
    return re.sub(r"[^a-z0-9 ]", " ", s.lower())


def _categorize(text: str) -> set:
    """Which category buckets does this text match?"""
    tokens = set(_normalize(text).split())
    matched = set()
    for bucket, words in CATEGORY_BUCKETS.items():
        if tokens & words:
            matched.add(bucket)
    return matched


def graphql(query_str: str, max_retries: int = 3) -> dict:
    last_err = None
    for attempt in range(max_retries):
        req = urllib.request.Request(
            ENDPOINT,
            data=json.dumps({"query": query_str}).encode(),
            headers={"Authorization": f"Bearer {_pat()}", "Content-Type": "application/json"},
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
                time.sleep(2 ** attempt); continue
            raise RuntimeError(f"CJ API: {last_err}") from None
        except Exception as e:
            last_err = str(e)
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt); continue
            raise RuntimeError(f"CJ API: {last_err}") from None
    raise RuntimeError(f"CJ API failed after {max_retries}: {last_err}")


def search_product(keywords: str, advertiser: str = "us", limit: int = 20) -> list[dict]:
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
          advertiserId advertiserName
          title brand link imageLink
          availability
          price {{ amount currency }}
        }}
      }}
    }}
    """
    data = graphql(query)
    return (data.get("shoppingProducts") or {}).get("resultList") or []


def _passes_hard_filters(result: dict, sanity_brand: str, sanity_name: str,
                         sanity_category_bucket: str | None) -> tuple[bool, str]:
    """Return (passes, reason)."""
    link = result.get("link") or ""
    title = result.get("title") or ""
    if not link:
        return False, "no link"

    link_norm = _normalize(link)
    title_norm = _normalize(title)
    name_norm = _normalize(sanity_name)
    brand_norm = _normalize(sanity_brand)

    # Filter 1: gender
    link_lower = link.lower()
    for bad in DISALLOWED_GENDER_SEGMENTS:
        if bad in link_lower:
            return False, f"wrong-gender ({bad.strip('/')})"

    # Filter 2: brand must appear in link path OR title
    if brand_norm:
        # Use first word of brand for short check (e.g. "saint laurent" → "saint")
        brand_tokens = brand_norm.split()
        primary_brand = brand_tokens[0]
        # Multi-word brands need full match (loro piana, saint laurent, the row)
        if len(brand_tokens) >= 2:
            full_brand_in_link = brand_norm.replace(" ", "-") in link_lower or \
                                 brand_norm.replace(" ", "") in link_lower.replace("-", "")
            full_brand_in_title = brand_norm in title_norm
            if not (full_brand_in_link or full_brand_in_title):
                return False, f"brand-mismatch ({brand_norm} not in link/title)"
        else:
            if primary_brand not in link_lower and primary_brand not in title_norm:
                return False, f"brand-mismatch ({primary_brand} not in link/title)"

    # Filter 3: category bucket match
    if sanity_category_bucket:
        result_buckets = _categorize(title) | _categorize(link)
        if sanity_category_bucket not in result_buckets:
            # belt is dual: accessory or category. allow exact bucket match only.
            return False, f"category-mismatch (sanity:{sanity_category_bucket}, result:{result_buckets or 'none'})"

    # Filter 4: model identifier (if Sanity name has one, must appear in result)
    sanity_models = {m for m in MODEL_IDENTIFIERS if m in name_norm}
    if sanity_models:
        result_text = link_norm + " " + title_norm
        if not any(m.replace("-", " ") in result_text or m.replace(" ", "-") in link_lower
                   for m in sanity_models):
            return False, f"model-mismatch (need {sanity_models})"

    # Filter 5: name keyword overlap >= 60%
    stopwords = {"the", "and", "for", "with", "small", "medium", "large", "mini",
                 "micro", "petite", "tiny", "bag", "bags"}
    name_tokens = {w for w in name_norm.split() if len(w) > 2 and w not in stopwords}
    title_tokens = set(title_norm.split())
    if name_tokens:
        overlap = len(name_tokens & title_tokens) / len(name_tokens)
        if overlap < 0.60:
            return False, f"low-overlap ({overlap:.0%} of {len(name_tokens)} words)"

    return True, "passed all filters"


def _detect_sanity_category(name: str, retailer_category: str | None = None) -> str | None:
    """Determine Sanity product's category bucket from name."""
    if retailer_category:
        rc_norm = _normalize(retailer_category)
        for bucket in CATEGORY_BUCKETS:
            if bucket in rc_norm:
                return bucket
    buckets = _categorize(name)
    return next(iter(buckets)) if len(buckets) == 1 else (
        "bag" if "bag" in buckets else (
            "shoe" if "shoe" in buckets else next(iter(buckets), None)
        )
    )


def best_match(results: list[dict], brand: str, name: str,
               category_hint: str | None = None,
               prefer_advertiser: str = "2817689") -> tuple[dict | None, list[dict]]:
    """
    Returns (best_match, all_evaluated_with_reasons).
    `all_evaluated` is each candidate with score + filter_reason for debugging.
    """
    if not results:
        return None, []

    sanity_bucket = category_hint or _detect_sanity_category(name)
    evaluated = []

    for r in results:
        passes, reason = _passes_hard_filters(r, brand, name, sanity_bucket)
        score = 0
        if passes:
            link = r.get("link") or ""
            title = (r.get("title") or "").lower()
            r_brand = (r.get("brand") or "").lower()
            r_advertiser = str(r.get("advertiserId") or "")
            availability = (r.get("availability") or "").lower()

            brand_norm = _normalize(brand)
            if brand_norm and brand_norm == _normalize(r_brand):
                score += 20
            elif brand_norm and brand_norm in _normalize(r_brand):
                score += 15

            if r_advertiser == prefer_advertiser:
                score += 15

            # URL format preference — Mytheresa redirect bug
            # Format A `/us/en/women/...-pXXXXXXXX` works correctly.
            # Format B `/en-us/...-NNNN.html` is auto-redirected by Mytheresa
            # to dead old URLs (verified May 2026 — they 404 with ?rdr=mag).
            # Strongly prefer A so when CJ has both formats, A wins.
            if "/us/en/women/" in link:
                score += 25
            elif "/en-us/" in link:
                score += 0  # explicit zero — leave B as last resort
            if "in stock" in availability:
                score += 10

            stopwords = {"the", "and", "for", "with", "small", "medium", "large",
                         "mini", "micro", "petite"}
            name_tokens = {w for w in _normalize(name).split()
                           if len(w) > 2 and w not in stopwords}
            title_tokens = set(_normalize(title).split())
            score += 5 * len(name_tokens & title_tokens)

        evaluated.append({
            "result": r,
            "score": score,
            "passes": passes,
            "reason": reason,
        })

    # Best = highest score among passing filters
    passing = [e for e in evaluated if e["passes"]]
    if not passing:
        return None, evaluated
    passing.sort(key=lambda e: e["score"], reverse=True)
    best = passing[0]
    if best["score"] < 50:
        return None, evaluated
    return best["result"], evaluated
