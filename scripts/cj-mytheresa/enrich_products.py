"""
enrich_products.py — Daily auto-enrichment for InvestedLuxury products.

Runs three passes:

PASS 1 — AFFILIATE WRAPPING
  Find products with raw Mytheresa URLs (not CJ-wrapped).
  Search CJ feed for matching SKU. Wrap with proper CJ tracking link.

PASS 2 — IMAGE AUTO-FETCH
  Find products with at least one valid affiliate link but NO images[].
  Use the imageLink from the CJ result to download a packshot,
  upload to Sanity assets, attach as the product's primary image.
  Never overwrites existing images (Midjourney editorial shots stay).

PASS 3 — REVALIDATION
  Discover articles affected by mutated products, hit /api/revalidate.

Exit codes:
  0 = success (even if some entries needed review)
  1 = fatal error (auth, network, or Sanity API failure)

Env vars required:
  SANITY_TOKEN          — Sanity write token (Editor role minimum)
  CJ_PAT                — CJ Personal Access Token
  REVALIDATE_SECRET     — for /api/revalidate (optional, skip if missing)

CLI:
  --dry-run     Preview only. Do not write to Sanity.
  --apply       Apply mutations to Sanity.
  --skip-images Skip Pass 2 (image fetch) — useful when iterating wrapping logic.
  --limit N     Process only first N products in each pass.
"""

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SANITY_PROJECT = "4b3ap7pf"
SANITY_DATASET = "production"
SANITY_API_VERSION = "v2024-01-01"
SANITY_QUERY_URL = (
    f"https://{SANITY_PROJECT}.api.sanity.io/{SANITY_API_VERSION}"
    f"/data/query/{SANITY_DATASET}"
)
SANITY_MUTATE_URL = (
    f"https://{SANITY_PROJECT}.api.sanity.io/{SANITY_API_VERSION}"
    f"/data/mutate/{SANITY_DATASET}"
)
SANITY_ASSET_URL = (
    f"https://{SANITY_PROJECT}.api.sanity.io/{SANITY_API_VERSION}"
    f"/assets/images/{SANITY_DATASET}"
)

PLACEHOLDER_URLS = {
    "https://www.mytheresa.com/",
    "https://mytheresa.com/",
    "https://www.mytheresa.com",
    "https://mytheresa.com",
    "",
}

# CJ wrapping (re-using from existing scripts)
CJ_PUB_ID = "101713247"
CJ_LINK_ID_US = "15513564"
CJ_WRAP_DOMAIN = "anrdoezrs.net"


def log(msg: str) -> None:
    print(f"[enrich] {msg}", flush=True)


# ---------------------------------------------------------------------------
# Sanity I/O
# ---------------------------------------------------------------------------


def sanity_token() -> str:
    t = os.environ.get("SANITY_TOKEN")
    if not t:
        raise RuntimeError("SANITY_TOKEN env var not set")
    return t


def sanity_query(groq: str) -> Any:
    qs = urllib.parse.urlencode({"query": groq})
    req = urllib.request.Request(
        f"{SANITY_QUERY_URL}?{qs}",
        headers={"Authorization": f"Bearer {sanity_token()}"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())["result"]


def sanity_mutate(mutations: list[dict], dry_run: bool = False) -> dict:
    body = json.dumps({"mutations": mutations}).encode("utf-8")
    url = SANITY_MUTATE_URL
    if dry_run:
        url += "?dryRun=true"
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Authorization": f"Bearer {sanity_token()}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())


def sanity_upload_image(image_bytes: bytes, content_type: str = "image/jpeg",
                        filename: str = "product.jpg") -> str:
    """Upload bytes to Sanity assets. Returns the asset _id."""
    qs = urllib.parse.urlencode({"filename": filename})
    req = urllib.request.Request(
        f"{SANITY_ASSET_URL}?{qs}",
        data=image_bytes,
        headers={
            "Authorization": f"Bearer {sanity_token()}",
            "Content-Type": content_type,
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        result = json.loads(r.read())
    asset_id = result["document"]["_id"]
    return asset_id


# ---------------------------------------------------------------------------
# CJ wrapping helpers
# ---------------------------------------------------------------------------


def wrap_url(target: str, sid: str, link_id: str = CJ_LINK_ID_US) -> str:
    """Build a CJ deep-link wrap around a target URL with a tracking SID."""
    encoded = urllib.parse.quote(target, safe="")
    return (
        f"https://www.{CJ_WRAP_DOMAIN}/click-{CJ_PUB_ID}-{link_id}"
        f"?sid={sid}&url={encoded}"
    )


def is_wrapped(url: str) -> bool:
    """True if URL is already a CJ tracking link."""
    if not url:
        return False
    return CJ_WRAP_DOMAIN in url or "click-" in url


def is_placeholder(url: str | None) -> bool:
    """True if URL is empty or points to a retailer homepage."""
    if not url:
        return True
    return url.strip() in PLACEHOLDER_URLS


def derive_sid(doc_id: str, slug: str | None = None) -> str:
    """Build a CJ SID from product doc_id or slug. Format: il-<slug>"""
    base = slug or doc_id.replace("product-", "")
    base = base.lower().replace("_", "-").replace(" ", "-")
    if not base.startswith("il-"):
        base = f"il-{base}"
    return base


# ---------------------------------------------------------------------------
# Image download
# ---------------------------------------------------------------------------


def download_image(url: str, max_bytes: int = 5 * 1024 * 1024) -> tuple[bytes, str]:
    """Download an image from a URL. Returns (bytes, content_type)."""
    req = urllib.request.Request(
        url,
        headers={
            # Mimic a browser — Mytheresa CDN sometimes blocks generic UAs
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read(max_bytes)
        if len(data) >= max_bytes:
            raise ValueError(f"Image > {max_bytes} bytes, refusing to download")
        ct = r.headers.get("Content-Type", "image/jpeg").split(";")[0].strip()
    return data, ct


# ---------------------------------------------------------------------------
# Pass 1 — Affiliate wrapping
# ---------------------------------------------------------------------------


PRODUCTS_NEEDING_WRAP_GROQ = """
*[_type == "product"
  && count(affiliateLinks[
      defined(url)
      && url != ""
      && (url match "*mytheresa.com*")
      && !(url match "*anrdoezrs.net*")
      && !(url match "*tkqlhce.com*")
      && !(url match "*dpbolvw.net*")
      && !(url match "*jdoqocy.com*")
      && !(url match "*kqzyfj.com*")
  ]) > 0
] {
  _id,
  name,
  "slug": slug.current,
  "brand": brand->name,
  affiliateLinks[]{
    _key,
    url,
    retailer,
    isPrimary
  }
}
"""


def find_products_needing_wrap() -> list[dict]:
    """Find products that have at least one raw Mytheresa URL (not CJ-wrapped)."""
    return sanity_query(PRODUCTS_NEEDING_WRAP_GROQ) or []


def build_wrap_mutations(products: list[dict], limit: int | None = None) -> tuple[list[dict], list[dict]]:
    """Build mutation patches to wrap raw URLs in-place.
    Returns (mutations, plan) where plan has human-readable diffs."""
    mutations = []
    plan = []
    n = 0
    for p in products:
        if limit and n >= limit:
            break
        sid = derive_sid(p["_id"], p.get("slug"))
        for link in p.get("affiliateLinks") or []:
            url = link.get("url") or ""
            if not url or is_wrapped(url) or "mytheresa.com" not in url:
                continue
            if is_placeholder(url):
                # Don't wrap placeholders in pass 1; pass 1 only fixes raw real URLs
                continue
            new_url = wrap_url(url, sid)
            location = f'affiliateLinks[_key=="{link["_key"]}"].url'
            mutations.append({
                "patch": {
                    "query": f'*[_id == "{p["_id"]}" || _id == "drafts.{p["_id"]}"]',
                    "set": {location: new_url},
                }
            })
            plan.append({
                "doc_id": p["_id"],
                "doc_name": p.get("name") or p["_id"],
                "location": location,
                "old_url": url,
                "new_url": new_url,
                "kind": "wrap",
            })
            n += 1
            if limit and n >= limit:
                break
    return mutations, plan


# ---------------------------------------------------------------------------
# Pass 2 — Image auto-fetch
# ---------------------------------------------------------------------------


PRODUCTS_NEEDING_IMAGE_GROQ = """
*[_type == "product"
  && !defined(images[0])
  && count(affiliateLinks[
      defined(url)
      && url != ""
      && url != "https://www.mytheresa.com/"
      && url != "https://mytheresa.com/"
  ]) > 0
] {
  _id,
  name,
  "slug": slug.current,
  "brand": brand->name,
  affiliateLinks[]{
    _key,
    url,
    isPrimary
  }
}
"""


def find_products_needing_image() -> list[dict]:
    return sanity_query(PRODUCTS_NEEDING_IMAGE_GROQ) or []


def fetch_image_from_cj(brand: str, name: str) -> str | None:
    """Search CJ for a product matching brand + name, return imageLink (or None).

    Tries multiple keyword variations because Sanity product names sometimes
    already include the brand (e.g. name='The Row Margaux 15' brand='The Row'),
    which causes duplicate-brand keywords like 'The Row The Row Margaux 15'
    that confuse CJ's search.
    """
    from cj_search import search_product, best_match

    brand = (brand or "").strip()
    name = (name or "").strip()
    if not brand and not name:
        return None

    # Build keyword variations to try in order
    keywords = []
    name_lower = name.lower()
    brand_lower = brand.lower()
    if brand_lower and name_lower.startswith(brand_lower):
        # name already includes brand → don't duplicate
        keywords.append(name)
        # Also try without brand prefix if name has more words
        rest = name[len(brand):].strip()
        if rest and rest != name:
            keywords.append(f"{brand} {rest}")  # normalized form
    else:
        keywords.append(f"{brand} {name}".strip())
        if name:
            keywords.append(name)  # fallback: just the name
        if brand:
            keywords.append(brand)  # last resort: brand only (rare match)

    # Deduplicate while preserving order
    seen = set()
    unique_keywords = []
    for k in keywords:
        kn = k.lower().strip()
        if kn and kn not in seen:
            seen.add(kn)
            unique_keywords.append(k)

    for kw in unique_keywords:
        try:
            results = search_product(kw, advertiser="us", limit=20)
        except Exception as e:
            log(f"    CJ search failed for '{kw}': {e}")
            continue
        if not results:
            continue
        best, _ = best_match(results, brand=brand, name=name)
        if best and best.get("imageLink"):
            return best["imageLink"]

    return None


def attach_image_to_product(doc_id: str, asset_id: str, dry_run: bool = False) -> bool:
    """Attach an existing Sanity image asset as the product's primary image."""
    import secrets
    new_image_block = {
        "_type": "image",
        "_key": secrets.token_hex(6),
        "asset": {"_type": "reference", "_ref": asset_id},
    }
    mutation = {
        "patch": {
            "query": f'*[_id == "{doc_id}" || _id == "drafts.{doc_id}"]',
            "setIfMissing": {"images": []},
            "insert": {
                "after": "images[-1]",
                "items": [new_image_block],
            },
        }
    }
    sanity_mutate([mutation], dry_run=dry_run)
    return True


def run_image_pass(products: list[dict], dry_run: bool, limit: int | None) -> dict:
    """Try to fetch images for products that need them. Returns stats."""
    stats = {"checked": 0, "fetched": 0, "uploaded": 0, "attached": 0,
             "no_match": 0, "download_failed": 0, "upload_failed": 0,
             "attach_failed": 0}
    for i, p in enumerate(products):
        if limit and i >= limit:
            break
        stats["checked"] += 1
        brand = p.get("brand") or ""
        name = p.get("name") or ""
        log(f"  [{i+1}/{len(products)}] {p['_id']}: {brand} {name}")

        # 1. Find imageLink in CJ feed
        image_url = fetch_image_from_cj(brand, name)
        if not image_url:
            log(f"      ✗ no CJ match (no_match)")
            stats["no_match"] += 1
            continue
        stats["fetched"] += 1
        log(f"      ✓ found imageLink: {image_url[:80]}")

        if dry_run:
            continue

        # 2. Download
        try:
            data, ctype = download_image(image_url)
            log(f"      ✓ downloaded {len(data)} bytes ({ctype})")
        except Exception as e:
            log(f"      ✗ download failed: {e}")
            stats["download_failed"] += 1
            continue

        # 3. Upload to Sanity
        try:
            ext = ctype.split("/")[-1].split(";")[0].strip() or "jpg"
            slug = (p.get("slug") or p["_id"]).replace("product-", "")
            filename = f"{slug}-cj.{ext}"
            asset_id = sanity_upload_image(data, content_type=ctype, filename=filename)
            log(f"      ✓ uploaded asset {asset_id}")
            stats["uploaded"] += 1
        except Exception as e:
            log(f"      ✗ upload failed: {e}")
            stats["upload_failed"] += 1
            continue

        # 4. Attach to product
        try:
            attach_image_to_product(p["_id"], asset_id, dry_run=False)
            log(f"      ✓ attached to {p['_id']}")
            stats["attached"] += 1
        except Exception as e:
            log(f"      ✗ attach failed: {e}")
            stats["attach_failed"] += 1
            continue

        time.sleep(0.7)  # be polite to Mytheresa CDN
    return stats


# ---------------------------------------------------------------------------
# Pass 3 — Revalidation
# ---------------------------------------------------------------------------


def find_affected_article_paths(product_doc_ids: set[str]) -> list[str]:
    if not product_doc_ids:
        return []
    ids_str = ",".join(f'"{x}"' for x in sorted(product_doc_ids))
    # Use string concat instead of .format() — GROQ uses {} for projections
    # which conflicts with str.format() placeholder syntax.
    groq = (
        '*[_type == "article" && defined(slug.current) && ('
        f'primaryProduct._ref in [{ids_str}] || '
        f'count(secondaryProducts[_ref in [{ids_str}]]) > 0 || '
        f'count(body[].markDefs[reference._ref in [{ids_str}]]) > 0'
        ')] {'
        '"slug": slug.current, '
        '"categorySlug": coalesce(categories[0]->slug.current, ""), '
        '"parentSlug": coalesce(categories[0]->parentCategory->slug.current, "")'
        '}'
    )
    try:
        articles = sanity_query(groq)
    except Exception as e:
        log(f"  ✗ article discovery failed: {e}")
        return []
    paths = set()
    for a in articles or []:
        parent = a.get("parentSlug") or ""
        cat = a.get("categorySlug") or ""
        slug = a.get("slug") or ""
        if parent and cat and slug:
            paths.add(f"/{parent}/{cat}/{slug}")
    return sorted(paths)


def revalidate_paths(paths: list[str], secret: str) -> None:
    for p in paths:
        try:
            qs = urllib.parse.urlencode({"secret": secret, "path": p})
            url = f"https://investedluxury.com/api/revalidate?{qs}"
            with urllib.request.urlopen(url, timeout=30) as r:
                resp = json.loads(r.read())
            ok = "✓" if resp.get("ok") else "✗"
            log(f"  {ok} {p}")
        except Exception as e:
            log(f"  ✗ {p}  →  {type(e).__name__}: {e}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview only. No writes to Sanity.")
    parser.add_argument("--apply", action="store_true",
                        help="Apply mutations to Sanity.")
    parser.add_argument("--skip-images", action="store_true",
                        help="Skip Pass 2 (image fetch).")
    parser.add_argument("--limit", type=int, default=None,
                        help="Limit each pass to N products.")
    args = parser.parse_args()

    if not args.dry_run and not args.apply:
        log("ERROR: pass --dry-run or --apply")
        return 1

    summary = {
        "wrap": {"raw_products": 0, "mutations": 0},
        "image": {},
        "revalidate": {"paths": 0},
        "errors": [],
    }
    mutated_doc_ids: set[str] = set()

    # ============================================================
    # PASS 1 — Affiliate wrapping
    # ============================================================
    log("=" * 70)
    log("PASS 1 — Affiliate wrapping")
    log("=" * 70)
    try:
        raw_products = find_products_needing_wrap()
        summary["wrap"]["raw_products"] = len(raw_products)
        log(f"Found {len(raw_products)} products with raw Mytheresa URLs")

        mutations, plan = build_wrap_mutations(raw_products, limit=args.limit)
        summary["wrap"]["mutations"] = len(mutations)
        log(f"Built {len(mutations)} wrap mutations")

        for entry in plan[:20]:
            log(f"  {entry['doc_id']}: {entry['old_url'][:80]} → wrapped")

        if mutations:
            log(f"Calling Sanity (dryRun={args.dry_run})…")
            sanity_mutate(mutations, dry_run=args.dry_run)
            log(f"  ✓ {len(mutations)} mutations applied")
            for entry in plan:
                mutated_doc_ids.add(entry["doc_id"])
    except Exception as e:
        log(f"  ✗ Pass 1 failed: {e}")
        summary["errors"].append(f"pass1: {e}")

    # ============================================================
    # PASS 2 — Image auto-fetch
    # ============================================================
    if args.skip_images:
        log("")
        log("PASS 2 — SKIPPED (--skip-images)")
    else:
        log("")
        log("=" * 70)
        log("PASS 2 — Image auto-fetch")
        log("=" * 70)
        try:
            need_image = find_products_needing_image()
            log(f"Found {len(need_image)} products without images that have valid affiliate links")
            stats = run_image_pass(need_image, args.dry_run, args.limit)
            summary["image"] = stats
            log(f"  Image pass stats: {stats}")
            # No need to add to mutated_doc_ids — image attach already triggers
            # Sanity update event, and articles using the product will rebuild
            # via the wrap pass discovery (or the next ISR cycle).
        except Exception as e:
            log(f"  ✗ Pass 2 failed: {e}")
            summary["errors"].append(f"pass2: {e}")

    # ============================================================
    # PASS 3 — Revalidate affected articles
    # ============================================================
    log("")
    log("=" * 70)
    log("PASS 3 — Revalidate affected article paths")
    log("=" * 70)
    secret = os.environ.get("REVALIDATE_SECRET")
    if args.dry_run:
        log("  (skipping revalidate in --dry-run mode)")
    elif not secret:
        log("  (REVALIDATE_SECRET not set — skipping revalidate)")
    elif not mutated_doc_ids:
        log("  (no products mutated — nothing to revalidate)")
    else:
        log(f"Discovering articles using {len(mutated_doc_ids)} mutated products…")
        paths = find_affected_article_paths(mutated_doc_ids)
        summary["revalidate"]["paths"] = len(paths)
        log(f"Found {len(paths)} affected article paths")
        if paths:
            time.sleep(2)  # let Sanity propagate
            revalidate_paths(paths, secret)

    # ============================================================
    # Summary
    # ============================================================
    log("")
    log("=" * 70)
    log("SUMMARY")
    log("=" * 70)
    log(json.dumps(summary, indent=2))

    return 1 if summary["errors"] else 0


if __name__ == "__main__":
    sys.exit(main())
