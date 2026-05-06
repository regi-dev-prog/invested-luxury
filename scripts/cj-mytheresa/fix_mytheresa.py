"""
fix_mytheresa.py — End-to-end orchestrator (v2: CJ-feed-driven).

Strategy:
  Use the CJ shoppingProducts feed as the source of truth. For each Mytheresa
  link in Sanity, search the feed by brand+name. If a confident match is found,
  the feed link is the canonical current URL. Wrap it with CJ tracking, write
  to Sanity. If no confident match, mark for manual TODO.

We DO NOT do HTTP validation against mytheresa.com because:
  - Mytheresa serves 200 status with soft-404 page bodies for deleted products
  - Anti-bot heuristics may serve different content to scripts vs browsers
  - The CJ feed is what the affiliate program actually offers right now

Usage:
  SANITY_TOKEN=xxx CJ_PAT=yyy python3 fix_mytheresa.py                # dry-run
  SANITY_TOKEN=xxx CJ_PAT=yyy python3 fix_mytheresa.py --apply        # write
  SANITY_TOKEN=xxx CJ_PAT=yyy python3 fix_mytheresa.py --search-only  # report only
"""
import os
import sys
import json
import re
import time
import argparse
from pathlib import Path

from sanity_io import query, mutate
from wrap_utils import (
    is_already_wrapped, is_mytheresa, extract_underlying_url,
    build_sid, wrap_url, normalize_mytheresa_url,
)
from cj_search import search_product, best_match, ADVERTISERS


def log(msg: str, **kwargs):
    extras = " ".join(f"{k}={v}" for k, v in kwargs.items())
    print(f"[{time.strftime('%H:%M:%S')}] {msg} {extras}".strip(), flush=True)


# =============================================================================
# STEP 1: SCAN
# =============================================================================

def scan_sanity():
    log("Scanning Sanity for products...")
    products = query("""
    *[_type == "product"]{
      _id, name, "slug": slug.current,
      "brand": brand->name,
      affiliateLinks[]{ _key, retailer, url, isPrimary }
    }
    """)
    log(f"Fetched {len(products)} product documents")

    log("Scanning Sanity for articles...")
    articles = query("""
    *[_type == "article"]{
      _id, title, "slug": slug.current,
      body[]{
        _key, _type,
        markDefs[]{ _key, _type, href, url, retailer }
      }
    }
    """)
    log(f"Fetched {len(articles)} article documents")
    return products, articles


def extract_targets(products, articles):
    """Build flat list of Mytheresa-pointing entries."""
    targets = []

    for p in products:
        slug = p.get("slug")
        for link in (p.get("affiliateLinks") or []):
            url = link.get("url") or ""
            if "mytheresa.com" not in url:
                continue
            targets.append({
                "doc_type": "product",
                "doc_id": p["_id"],
                "doc_name": p.get("name") or "(unnamed)",
                "slug": slug,
                "brand": p.get("brand") or "",
                "location_path": f'affiliateLinks[_key=="{link["_key"]}"].url',
                "current_url": url,
                "underlying_url": extract_underlying_url(url) if is_already_wrapped(url) else url,
                "is_wrapped": is_already_wrapped(url),
                "sid_base": slug,
            })

    for a in articles:
        slug = a.get("slug")
        for block in (a.get("body") or []):
            if block.get("_type") != "block":
                continue
            for mark in (block.get("markDefs") or []):
                for field in ("href", "url"):
                    val = mark.get(field) or ""
                    if "mytheresa.com" in val:
                        targets.append({
                            "doc_type": "article",
                            "doc_id": a["_id"],
                            "doc_name": a.get("title") or "(untitled)",
                            "slug": slug,
                            "brand": "",  # body links lack brand context
                            "location_path": (
                                f'body[_key=="{block["_key"]}"]'
                                f'.markDefs[_key=="{mark["_key"]}"].{field}'
                            ),
                            "current_url": val,
                            "underlying_url": (
                                extract_underlying_url(val) if is_already_wrapped(val) else val
                            ),
                            "is_wrapped": is_already_wrapped(val),
                            "sid_base": slug,
                        })
                        break
    return targets


# =============================================================================
# STEP 2: CJ FEED DISCOVERY
# =============================================================================

def is_homepage_url(url: str) -> bool:
    if not url:
        return False
    stripped = re.sub(r'[?#].*$', '', url).rstrip('/')
    return bool(re.match(r'^https?://(www\.)?mytheresa\.com$', stripped))


def is_designer_or_category_url(url: str) -> bool:
    """Detect URLs pointing to designer pages or category pages (not specific product)."""
    if not url:
        return False
    path = re.sub(r'[?#].*$', '', url).rstrip('/')
    # /designers/X or /designers/X.html
    if "/designers/" in path:
        seg = path.split("/designers/")[1].rstrip(".html")
        return "/" not in seg.strip("/") or True  # designer + category both lack product ID
    # /BRAND/category.html (e.g. /fendi/bags.html)
    if re.search(r'/[a-z-]+/(bags|shoes|clothing|accessories|jewelry)(\.html)?$', path):
        return True
    return False


def derive_search_keywords(target: dict) -> str:
    """Build CJ search query from target's brand + name."""
    brand = (target.get("brand") or "").strip()
    name = (target.get("doc_name") or "").strip()
    # Strip noise words that may not appear in CJ titles
    name = re.sub(
        r'\b(medium|small|large|mini|micro|the row|loro piana|toteme|chloé|chloe|fendi|bottega|saint laurent|valentino|prada|loewe)\b',
        '', name, flags=re.I
    ).strip()
    name = re.sub(r'\s+', ' ', name)
    keywords = " ".join(filter(None, [brand, name])).strip()
    return keywords or name or brand


def discover_replacements(targets, throttle: float = 1.0):
    """For each target, search CJ feed and attach a 'discovered' field."""
    log(f"Searching CJ feed for {len(targets)} products...")
    for i, t in enumerate(targets):
        if i > 0 and i % 5 == 0:
            log(f"  progress {i}/{len(targets)}")
        if i > 0:
            time.sleep(throttle)

        kw = derive_search_keywords(t)
        if not kw:
            t["discovered"] = None
            t["discovery_note"] = "empty keywords"
            continue

        try:
            results = search_product(kw, advertiser="us", limit=20)
            match = best_match(results, t.get("brand", ""), t["doc_name"],
                               prefer_advertiser=ADVERTISERS["us"])
            if match and match.get("link"):
                t["discovered"] = {
                    "title": match.get("title"),
                    "brand": match.get("brand"),
                    "link": match["link"],
                    "advertiser_id": str(match.get("advertiserId") or ""),
                    "availability": match.get("availability"),
                    "price": match.get("price"),
                    "results_total": len(results),
                }
            else:
                t["discovered"] = None
                t["discovery_note"] = (
                    f"no confident match in {len(results)} results"
                    if results else "0 results"
                )
        except Exception as e:
            t["discovered"] = None
            t["discovery_error"] = str(e)
            log(f"  ⚠ CJ search failed for {t['doc_name'][:40]}: {e}")
    return targets


# =============================================================================
# STEP 3: PLAN MUTATIONS
# =============================================================================

def normalize_link_for_compare(url: str) -> str:
    """Strip query/hash + locale prefix variations for URL equality check."""
    if not url:
        return ""
    base = re.sub(r'[?#].*$', '', url).rstrip('/').lower()
    base = base.replace("/en-us/", "/").replace("/us/en/", "/")
    return base


def build_mutations(targets):
    """Build mutations only where Sanity URL meaningfully differs from CJ feed."""
    mutations = []
    plan = []
    skipped_no_match = []
    skipped_already_current = []

    for t in targets:
        # Strip CJ tracking params from discovered link before comparison
        discovered_link = (t.get("discovered") or {}).get("link", "")
        if not discovered_link:
            skipped_no_match.append(t)
            continue

        # CJ feed sometimes appends ?feed_num= etc - strip before wrap
        clean_discovered = discovered_link.split("?")[0]
        # If feed link is already CJ-wrapped (rare), use as-is
        if is_already_wrapped(clean_discovered):
            new_url = clean_discovered
            action = "use-feed-prewrapped"
        else:
            sid = build_sid(t["sid_base"])
            new_url = wrap_url(clean_discovered, sid)
            action = "rewrap-from-feed"

        # Compare what's currently in Sanity (extracted underlying URL)
        current_underlying = t.get("underlying_url") or t["current_url"]
        if normalize_link_for_compare(current_underlying) == normalize_link_for_compare(clean_discovered):
            # Same product URL, but might still be wrapped vs raw
            if t["is_wrapped"]:
                skipped_already_current.append(t)
                continue  # already wrapped to current canonical URL
            action = "wrap-already-current"

        mutations.append({
            "patch": {
                "query": f'*[_id == "{t["doc_id"]}" || _id == "drafts.{t["doc_id"]}"]',
                "set": {t["location_path"]: new_url}
            }
        })
        plan.append({**t, "new_url": new_url, "action": action})

    return mutations, plan, skipped_no_match, skipped_already_current


def apply_mutations(mutations, dry_run: bool):
    if not mutations:
        log("No mutations to apply.")
        return None
    log(f"{'DRY-RUN' if dry_run else 'APPLYING'} {len(mutations)} mutations...")
    BATCH = 100
    last_txn = None
    for i in range(0, len(mutations), BATCH):
        batch = mutations[i:i + BATCH]
        result = mutate(batch, dry_run=dry_run)
        last_txn = result.get("transactionId")
        log(f"  batch {i // BATCH + 1}: {len(batch)} ops, txn={last_txn}")
    return {"total": len(mutations), "last_transaction": last_txn}


# =============================================================================
# REPORTING
# =============================================================================

def write_report(targets, plan, skipped_no_match, skipped_already_current, output_dir: str):
    out = Path(output_dir)
    out.mkdir(exist_ok=True, parents=True)

    with open(out / "targets.json", "w") as f:
        json.dump(targets, f, indent=2, ensure_ascii=False, default=str)
    with open(out / "mutation_plan.json", "w") as f:
        json.dump(plan, f, indent=2, ensure_ascii=False, default=str)

    # Markdown summary
    lines = ["# Mytheresa URL Refresh Report", ""]
    lines.append(f"- **Total Mytheresa-pointing entries scanned:** {len(targets)}")
    lines.append(f"- **Found in CJ feed (canonical URL available):** {sum(1 for t in targets if t.get('discovered'))}")
    lines.append(f"- **Not in CJ feed (manual TODO):** {len(skipped_no_match)}")
    lines.append(f"- **Already pointing to current URL (skipped):** {len(skipped_already_current)}")
    lines.append(f"- **Mutations planned:** {len(plan)}")
    lines.append("")

    if plan:
        lines.append("## ✓ Planned Updates")
        lines.append("")
        for p in plan:
            d = p.get("discovered") or {}
            lines.append(f"### {p['doc_name']}  ({p['doc_type']})")
            lines.append(f"- **Action:** `{p['action']}`")
            lines.append(f"- **SID:** `{build_sid(p['sid_base'])}`")
            lines.append(f"- **Old underlying URL:** {p.get('underlying_url') or p['current_url']}")
            lines.append(f"- **New (from CJ feed):** {d.get('link', '')}")
            lines.append(f"- **CJ advertiser:** {d.get('advertiser_id')} | availability: {d.get('availability')}")
            lines.append("")

    if skipped_no_match:
        lines.append("## ⚠ Manual TODO (no confident CJ match)")
        lines.append("")
        for t in skipped_no_match:
            note = t.get("discovery_note") or t.get("discovery_error") or "no match"
            lines.append(f"- **{t['doc_name']}** ({t['doc_type']}, brand: `{t.get('brand') or '?'}`) — {note}")
            lines.append(f"  - id: `{t['doc_id']}`")
            lines.append(f"  - current url: {t['current_url'][:140]}")
            lines.append("")

    if skipped_already_current:
        lines.append(f"## ✓ Already Current ({len(skipped_already_current)})")
        lines.append("")
        for t in skipped_already_current[:50]:
            lines.append(f"- {t['doc_name']}")
        if len(skipped_already_current) > 50:
            lines.append(f"- … and {len(skipped_already_current) - 50} more")
        lines.append("")

    with open(out / "REPORT.md", "w") as f:
        f.write("\n".join(lines))
    log(f"Report written to {out}/REPORT.md")


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true",
                        help="Actually write mutations to Sanity (default: dry-run)")
    parser.add_argument("--search-only", action="store_true",
                        help="Search CJ feed and report; skip Sanity writes entirely")
    parser.add_argument("--limit", type=int, default=None,
                        help="Process only the first N targets (debug)")
    parser.add_argument("--output-dir", default=".")
    parser.add_argument("--throttle-cj", type=float, default=0.5)
    args = parser.parse_args()

    products, articles = scan_sanity()
    targets = extract_targets(products, articles)
    log(f"Mytheresa-pointing entries: {len(targets)}")

    if args.limit:
        targets = targets[:args.limit]
        log(f"Limited to first {args.limit} for debugging")

    targets = discover_replacements(targets, throttle=args.throttle_cj)

    found = sum(1 for t in targets if t.get("discovered"))
    log(f"CJ matches: {found}/{len(targets)}")

    mutations, plan, skipped_no_match, skipped_already_current = build_mutations(targets)
    log(f"Plan: {len(mutations)} updates, {len(skipped_no_match)} TODO, "
        f"{len(skipped_already_current)} already current")

    write_report(targets, plan, skipped_no_match, skipped_already_current,
                 output_dir=args.output_dir)

    if args.search_only:
        log("--search-only: skipping mutation phase.")
        return

    if mutations:
        result = apply_mutations(mutations, dry_run=not args.apply)
        if result:
            log(f"{'Applied' if args.apply else 'Dry-run simulated'}: "
                f"{result['total']} ops, last_txn={result['last_transaction']}")

    log("Done.")


if __name__ == "__main__":
    main()
