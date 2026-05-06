"""
fix_mytheresa.py — End-to-end orchestrator.

Flow:
  1. SCAN     — fetch all products + articles with mytheresa URLs from Sanity
  2. VALIDATE — check each URL with HTTP GET; flag 404s and soft-404s
  3. DISCOVER — for broken URLs, search CJ Product Search API for current URL
  4. WRAP     — wrap discovered URLs with CJ tracking + per-product SID
  5. APPLY    — write back to Sanity (with --apply flag, otherwise dry-run)

Usage (locally):
  SANITY_TOKEN=xxx CJ_PAT=yyy python3 fix_mytheresa.py --validate-only
  SANITY_TOKEN=xxx CJ_PAT=yyy python3 fix_mytheresa.py --apply

Usage (GitHub Actions): triggered via workflow_dispatch with inputs.
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
from validate import check_url
from cj_search import search_product, best_match


def log(msg: str, **kwargs):
    """Structured log line."""
    extras = " ".join(f"{k}={v}" for k, v in kwargs.items())
    print(f"[{time.strftime('%H:%M:%S')}] {msg} {extras}".strip())


# =============================================================================
# STEP 1: SCAN
# =============================================================================

def scan_sanity():
    """Fetch all Mytheresa-linked entries from Sanity."""
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
    """
    Build flat list of all targets that point to mytheresa.com.
    Each target has: doc_id, doc_name, slug, brand, location_path, url_field, current_url, sid_base.
    """
    targets = []

    # Products: affiliateLinks
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
                "is_wrapped": is_already_wrapped(url),
                "sid_base": slug,
            })

    # Articles: body markDefs
    for a in articles:
        slug = a.get("slug")
        body = a.get("body") or []
        for block in body:
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
                            "brand": "",  # article body links lack brand context
                            "location_path": (
                                f'body[_key=="{block["_key"]}"]'
                                f'.markDefs[_key=="{mark["_key"]}"].{field}'
                            ),
                            "current_url": val,
                            "is_wrapped": is_already_wrapped(val),
                            "sid_base": slug,
                        })
                        break  # avoid double-add if both fields present
    return targets


# =============================================================================
# STEP 2: VALIDATE
# =============================================================================

def is_homepage_url(url: str) -> bool:
    """Detect generic homepage URLs that shouldn't be validated."""
    if not url:
        return False
    underlying = extract_underlying_url(url) or url
    stripped = re.sub(r'[?#].*$', '', underlying).rstrip('/')
    return bool(re.match(r'^https?://(www\.)?mytheresa\.com$', stripped))


def validate_targets(targets, throttle: float = 0.5):
    """Add `validation` dict to each target. Skips homepages."""
    log(f"Validating {len(targets)} target URLs...")
    for i, t in enumerate(targets):
        if is_homepage_url(t["current_url"]):
            t["validation"] = {"ok": True, "skipped": "homepage", "status": None}
            continue
        url_to_check = extract_underlying_url(t["current_url"]) or t["current_url"]
        if i > 0:
            time.sleep(throttle)
        v = check_url(url_to_check)
        t["validation"] = v
        flag = "✓" if v["ok"] else "✗"
        soft = " (soft-404)" if v.get("is_404_page") else ""
        log(f"  {flag} [{v['status']}]{soft} {t['doc_name'][:50]}", brand=t.get("brand"))
    return targets


# =============================================================================
# STEP 3: DISCOVER (search CJ for replacement URLs)
# =============================================================================

def discover_replacements(targets, throttle: float = 1.0):
    """For broken/homepage targets, search CJ for current URL. Adds `discovered` field."""
    needs_discovery = [
        t for t in targets
        if not t["validation"]["ok"] or t["validation"].get("skipped") == "homepage"
    ]
    log(f"Searching CJ Product Search API for {len(needs_discovery)} replacements...")

    for i, t in enumerate(needs_discovery):
        if i > 0:
            time.sleep(throttle)

        # Construct best search query
        keywords = " ".join(filter(None, [t.get("brand"), t["doc_name"]]))
        # Strip noisy terms
        keywords = re.sub(r'\b(medium|small|large|mini|micro)\b', '', keywords, flags=re.I).strip()

        try:
            results = search_product(keywords, advertiser="us", limit=5)
            match = best_match(results, t.get("brand", ""), t["doc_name"])
            if match and match.get("link"):
                t["discovered"] = {
                    "title": match.get("title"),
                    "brand": match.get("brand"),
                    "link": match["link"],
                    "price": match.get("price"),
                    "availability": match.get("availability"),
                    "raw_results_count": len(results),
                }
                log(f"  ✓ Found: {match.get('title', '')[:60]} → {match['link'][:60]}")
            else:
                t["discovered"] = None
                log(f"  ✗ No match for: {keywords[:60]}  ({len(results)} results)")
        except Exception as e:
            t["discovered"] = None
            t["discovery_error"] = str(e)
            log(f"  ⚠ Search failed for {keywords[:50]}: {e}")
    return targets


# =============================================================================
# STEP 4 + 5: WRAP + APPLY
# =============================================================================

def build_mutations(targets):
    """Build Sanity mutations for targets that have a discovered replacement."""
    mutations = []
    plan_log = []

    for t in targets:
        # Skip if no replacement was found and current URL is fine
        if t["validation"]["ok"] and t["validation"].get("skipped") != "homepage":
            # URL works and was already wrapped or doesn't need wrapping change → skip
            if t["is_wrapped"]:
                continue
            # Raw mytheresa URL that works — wrap it as-is
            sid = build_sid(t["sid_base"])
            new_url = wrap_url(t["current_url"], sid)
            action = "wrap-existing"
        elif t.get("discovered") and t["discovered"].get("link"):
            # Broken URL — replace with discovered URL
            new_link = t["discovered"]["link"]
            # If discovered link is already a CJ deeplink (Mytheresa feed often returns these), extract
            if is_already_wrapped(new_link):
                new_url = new_link
            else:
                sid = build_sid(t["sid_base"])
                new_url = wrap_url(normalize_mytheresa_url(new_link), sid)
            action = "replace-discovered"
        else:
            # No fix possible — leave to manual TODO
            continue

        mutations.append({
            "patch": {
                "query": f'*[_id == "{t["doc_id"]}" || _id == "drafts.{t["doc_id"]}"]',
                "set": { t["location_path"]: new_url }
            }
        })
        plan_log.append({**t, "new_url": new_url, "action": action})

    return mutations, plan_log


def apply_mutations(mutations, plan, dry_run: bool):
    """Submit mutations in batches of 100 (Sanity limit)."""
    if not mutations:
        log("No mutations to apply.")
        return None

    log(f"{'DRY-RUN' if dry_run else 'APPLYING'} {len(mutations)} mutations...")
    BATCH = 100
    total_applied = 0
    last_txn = None
    for i in range(0, len(mutations), BATCH):
        batch = mutations[i:i + BATCH]
        result = mutate(batch, dry_run=dry_run)
        last_txn = result.get("transactionId")
        total_applied += len(batch)
        log(f"  batch {i // BATCH + 1}: {len(batch)} ops, txn={last_txn}")

    return {"total": total_applied, "last_transaction": last_txn}


# =============================================================================
# REPORTING
# =============================================================================

def write_report(targets, plan, output_dir: str = "."):
    out = Path(output_dir)
    out.mkdir(exist_ok=True, parents=True)

    # Full data dump
    with open(out / "targets.json", "w") as f:
        json.dump(targets, f, indent=2, ensure_ascii=False, default=str)
    with open(out / "mutation_plan.json", "w") as f:
        json.dump(plan, f, indent=2, ensure_ascii=False, default=str)

    # Human-readable summary
    lines = ["# Mytheresa URL Fix Report", ""]
    lines.append(f"- Total targets: {len(targets)}")
    ok = sum(1 for t in targets if t["validation"]["ok"])
    broken = sum(1 for t in targets if not t["validation"]["ok"] and t["validation"].get("skipped") != "homepage")
    homepage = sum(1 for t in targets if t["validation"].get("skipped") == "homepage")
    discovered = sum(1 for t in targets if t.get("discovered"))
    lines.append(f"- ✓ URL valid (200): {ok}")
    lines.append(f"- ✗ URL broken (404/soft-404): {broken}")
    lines.append(f"- ⊘ Homepage URL (skipped validation): {homepage}")
    lines.append(f"- 🔍 CJ replacement found: {discovered}")
    lines.append(f"- 📝 Mutations planned: {len(plan)}")
    lines.append("")

    # Group: broken without replacement
    todo = [t for t in targets if not t["validation"]["ok"] and not t.get("discovered")]
    if todo:
        lines.append("## ⚠ Manual TODO (broken, no CJ replacement)")
        lines.append("")
        for t in todo:
            v = t["validation"]
            reason = v.get("error") or ("soft-404" if v.get("is_404_page") else f"HTTP {v.get('status')}")
            lines.append(f"- [{t['doc_type']}] **{t['doc_name']}** — {reason}")
            lines.append(f"  - id: `{t['doc_id']}`")
            lines.append(f"  - url: {t['current_url'][:120]}")
        lines.append("")

    if plan:
        lines.append("## ✓ Planned Changes")
        lines.append("")
        for p in plan:
            lines.append(f"- [{p['action']}] {p['doc_name']}")
            lines.append(f"  - sid: `il-{p['sid_base']}`")
            lines.append(f"  - new: `{p['new_url'][:100]}...`")
        lines.append("")

    with open(out / "REPORT.md", "w") as f:
        f.write("\n".join(lines))
    log(f"Wrote report to {out}/REPORT.md")


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true",
                        help="Actually apply mutations (default: dry-run)")
    parser.add_argument("--validate-only", action="store_true",
                        help="Only validate URLs; skip discovery + writes")
    parser.add_argument("--scope", choices=["all", "broken-only", "wrapped-only"], default="all",
                        help="Subset of targets to process")
    parser.add_argument("--output-dir", default=".",
                        help="Directory for reports (default: .)")
    parser.add_argument("--throttle-validate", type=float, default=0.5)
    parser.add_argument("--throttle-cj", type=float, default=1.0)
    args = parser.parse_args()

    # Step 1: scan
    products, articles = scan_sanity()
    targets = extract_targets(products, articles)
    log(f"Total Mytheresa-linked targets: {len(targets)}")

    # Filter by scope
    if args.scope == "wrapped-only":
        targets = [t for t in targets if t["is_wrapped"]]
    elif args.scope == "broken-only":
        # Pre-filter requires validation; do scope filter post-validate instead
        pass
    log(f"After scope='{args.scope}' filter: {len(targets)} targets")

    # Step 2: validate
    targets = validate_targets(targets, throttle=args.throttle_validate)

    # broken-only filter applied post-validation
    if args.scope == "broken-only":
        targets = [t for t in targets if not t["validation"]["ok"]]
        log(f"After broken-only filter: {len(targets)} targets")

    if args.validate_only:
        log("Validation complete (--validate-only); skipping discovery + apply.")
        # Still write report so user sees what's broken
        write_report(targets, plan=[], output_dir=args.output_dir)
        return

    # Step 3: discover replacements
    targets = discover_replacements(targets, throttle=args.throttle_cj)

    # Step 4: build mutations
    mutations, plan = build_mutations(targets)
    log(f"Built {len(mutations)} mutations")

    # Write report regardless of apply mode
    write_report(targets, plan, output_dir=args.output_dir)

    # Step 5: apply (or dry-run)
    if mutations:
        result = apply_mutations(mutations, plan, dry_run=not args.apply)
        if result:
            log(f"{'Applied' if args.apply else 'DRY-RUN simulated'}: {result['total']} ops")
            log(f"Last transaction ID: {result['last_transaction']}")

    log("Done.")


if __name__ == "__main__":
    main()
