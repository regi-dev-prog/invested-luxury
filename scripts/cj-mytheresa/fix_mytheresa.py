"""
fix_mytheresa.py — End-to-end orchestrator (v3: strict matching).

Two separate flows for different target types:

  PRODUCTS (Sanity product documents → affiliateLinks[].url):
    Search CJ feed by `brand + name` with strict mandatory filters
    (gender, brand, category, model). Wrap if confident match found,
    else surface to manual review.

  ARTICLE BODY MARKDEFS (markDefs[].href in article body):
    Different logic:
      - Designer-page URL (e.g. /designers/loro-piana) → keep as-is, just
        re-wrap with current SID. Designer pages don't have product IDs to
        validate against the feed.
      - Specific product URL → search CJ by URL slug tokens, apply same
        strict filters as products.
      - Homepage URL → skip (TODO).

Outputs:
  - REPORT.md          summary
  - approved_plan.json mutations the script is confident about (HIGH match)
  - review.csv         candidates needing manual approval (medium match)
  - todo.md            no match found, needs manual hunting

Modes:
  --search-only      no Sanity writes ever. just produce reports.
  --apply-approved   apply only HIGH-confidence matches (default: dry-run)
  --apply-all        apply HIGH + manually-approved (requires review.csv with approve column)
"""
import os
import sys
import json
import re
import csv
import time
import argparse
import unicodedata
from pathlib import Path

from sanity_io import query, mutate
from wrap_utils import (
    is_already_wrapped, is_mytheresa, extract_underlying_url,
    build_sid, wrap_url, normalize_mytheresa_url,
)
from cj_search import search_product, best_match, ADVERTISERS, _detect_sanity_category


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
      "categoryName": category->name,
      affiliateLinks[]{ _key, retailer, url, isPrimary }
    }
    """)
    log(f"Fetched {len(products)} products")

    log("Scanning Sanity for articles...")
    articles = query("""
    *[_type == "article"]{
      _id, title, "slug": slug.current,
      body[]{
        _key, _type,
        markDefs[]{ _key, _type, href, url }
      }
    }
    """)
    log(f"Fetched {len(articles)} articles")
    return products, articles


def extract_targets(products, articles):
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
                "category_name": p.get("categoryName") or "",
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
                            "brand": "",
                            "category_name": "",
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
# STEP 2: URL CLASSIFICATION
# =============================================================================

def classify_url(url: str) -> str:
    """Return one of: homepage, designer, designer-category, category, product, unknown"""
    if not url:
        return "unknown"
    u = url.lower()
    stripped = re.sub(r'[?#].*$', '', u).rstrip('/')
    if re.match(r'^https?://(www\.)?mytheresa\.com$', stripped):
        return "homepage"
    if "/designers/" in stripped:
        seg = stripped.split("/designers/")[1].rstrip(".html")
        return "designer-category" if "/" in seg.strip("/") else "designer"
    if re.search(r'/[a-z-]+/(bags|shoes|clothing|accessories|jewelry)(\.html)?/?$', stripped):
        return "category"
    # has product ID like p00795149 or trailing -1234567.html
    if re.search(r'-p\d{6,}', stripped) or re.search(r'-\d{6,}\.html', stripped):
        return "product"
    # generic deep path
    if re.search(r'/(us/en|en-us)/[a-z]', stripped):
        return "product"
    return "unknown"


def derive_search_keywords(target: dict) -> str:
    """Build CJ keyword query for a target."""
    if target["doc_type"] == "product":
        brand = (target.get("brand") or "").strip()
        name = (target.get("doc_name") or "").strip()
        # Remove brand from name to avoid duplication
        if brand:
            name = re.sub(re.escape(brand), '', name, flags=re.I).strip()
        return " ".join(filter(None, [brand, name])).strip()
    else:
        # Article markDef — keywords from URL slug, NOT from article title
        url = target.get("underlying_url") or target["current_url"]
        path = re.sub(r'[?#].*$', '', url)
        # Designer page: extract designer name from path
        if "/designers/" in path:
            designer = path.split("/designers/")[1].rstrip(".html").rstrip("/")
            return designer.replace("-", " ")
        # Specific product URL: extract from last path segment
        slug = path.rstrip("/").split("/")[-1]
        slug = re.sub(r'-p\d{6,}.*$', '', slug)
        slug = re.sub(r'-\d{6,}\.html$', '', slug)
        return slug.replace("-", " ")


# =============================================================================
# STEP 3: SEARCH + MATCH
# =============================================================================

def discover_replacements(targets, throttle: float = 0.5):
    """Fill in target['discovered'] and target['url_class'] for each."""
    log(f"Discovering replacements for {len(targets)} targets...")
    for i, t in enumerate(targets):
        if i > 0 and i % 10 == 0:
            log(f"  progress {i}/{len(targets)}")
        if i > 0:
            time.sleep(throttle)

        url_to_classify = t.get("underlying_url") or t["current_url"]
        t["url_class"] = classify_url(url_to_classify)

        # Designer-page articles: don't search the feed, leave URL as-is
        if t["doc_type"] == "article" and t["url_class"] in ("designer", "designer-category"):
            t["discovered"] = None
            t["match_decision"] = "keep-as-is"
            t["match_reason"] = f"designer/category page; CJ feed only has products"
            continue

        # Homepage URLs: TODO regardless
        if t["url_class"] == "homepage":
            t["discovered"] = None
            t["match_decision"] = "todo"
            t["match_reason"] = "homepage URL"
            continue

        # Missing slug → cannot generate SID
        if not t.get("slug"):
            t["discovered"] = None
            t["match_decision"] = "todo"
            t["match_reason"] = "missing slug in Sanity (cannot generate SID)"
            continue

        kw = derive_search_keywords(t)
        if not kw or len(kw) < 4:
            t["discovered"] = None
            t["match_decision"] = "todo"
            t["match_reason"] = f"insufficient keywords: '{kw}'"
            continue

        try:
            results = search_product(kw, advertiser="us", limit=20)
            t["search_results_count"] = len(results)
            match, evaluated = best_match(
                results,
                brand=t.get("brand", ""),
                name=t["doc_name"] if t["doc_type"] == "product" else kw,
                category_hint=_detect_sanity_category(
                    t["doc_name"], t.get("category_name")
                ) if t["doc_type"] == "product" else None,
            )
            if match and match.get("link"):
                t["discovered"] = {
                    "title": match.get("title"),
                    "brand": match.get("brand"),
                    "link": match["link"],
                    "advertiser_id": str(match.get("advertiserId") or ""),
                    "availability": match.get("availability"),
                    "price": match.get("price"),
                }
                t["match_decision"] = "approved"
                t["match_reason"] = "passed all filters; high confidence"
                # Save top-3 alternatives for review
                t["alternatives"] = [
                    {
                        "title": e["result"].get("title"),
                        "link": e["result"].get("link"),
                        "score": e["score"],
                        "passes": e["passes"],
                        "reason": e["reason"],
                    }
                    for e in evaluated[:3]
                ]
            else:
                t["discovered"] = None
                t["match_decision"] = "review"
                # show top candidates with rejection reasons for human review
                t["alternatives"] = [
                    {
                        "title": e["result"].get("title"),
                        "link": e["result"].get("link"),
                        "score": e["score"],
                        "passes": e["passes"],
                        "reason": e["reason"],
                    }
                    for e in evaluated[:5]
                ]
                if not evaluated:
                    t["match_reason"] = "no results in CJ feed"
                    t["match_decision"] = "todo"
                else:
                    t["match_reason"] = (
                        f"no candidate passed strict filters "
                        f"(top reason: {evaluated[0]['reason']})"
                    )
        except Exception as e:
            t["discovered"] = None
            t["match_decision"] = "error"
            t["match_reason"] = f"CJ API error: {e}"
            log(f"  ⚠ search failed for '{kw[:40]}': {e}")
    return targets


# =============================================================================
# STEP 4: BUILD MUTATIONS
# =============================================================================

def build_mutations(targets, *, include_manually_approved: bool = False):
    """Build Sanity mutations from approved decisions."""
    mutations, plan = [], []
    for t in targets:
        decision = t.get("match_decision")

        if decision == "keep-as-is":
            # Designer page article: just rewrap if not already wrapped (keep URL same)
            if not t["is_wrapped"]:
                sid = build_sid(t["sid_base"])
                new_url = wrap_url(t["underlying_url"], sid)
                mutations.append({
                    "patch": {
                        "query": f'*[_id == "{t["doc_id"]}" || _id == "drafts.{t["doc_id"]}"]',
                        "set": {t["location_path"]: new_url}
                    }
                })
                plan.append({**t, "new_url": new_url, "action": "rewrap-designer-page"})
            continue

        if decision == "approved":
            d = t["discovered"]
            clean_link = d["link"].split("?")[0]
            sid = build_sid(t["sid_base"])
            new_url = wrap_url(clean_link, sid)
            mutations.append({
                "patch": {
                    "query": f'*[_id == "{t["doc_id"]}" || _id == "drafts.{t["doc_id"]}"]',
                    "set": {t["location_path"]: new_url}
                }
            })
            plan.append({**t, "new_url": new_url, "action": "rewrap-from-feed"})
            continue

        if decision == "manually-approved" and include_manually_approved:
            d = t["discovered"]
            clean_link = d["link"].split("?")[0]
            sid = build_sid(t["sid_base"])
            new_url = wrap_url(clean_link, sid)
            mutations.append({
                "patch": {
                    "query": f'*[_id == "{t["doc_id"]}" || _id == "drafts.{t["doc_id"]}"]',
                    "set": {t["location_path"]: new_url}
                }
            })
            plan.append({**t, "new_url": new_url, "action": "rewrap-manually-approved"})
            continue

    return mutations, plan


def apply_mutations(mutations, dry_run: bool):
    if not mutations:
        log("No mutations.")
        return None
    log(f"{'DRY-RUN' if dry_run else 'APPLYING'} {len(mutations)} mutations...")
    BATCH = 100
    last_txn = None
    for i in range(0, len(mutations), BATCH):
        batch = mutations[i:i + BATCH]
        result = mutate(batch, dry_run=dry_run)
        last_txn = result.get("transactionId")
        log(f"  batch {i // BATCH + 1}: {len(batch)} ops, txn={last_txn}")
    return {"total": len(mutations), "last_txn": last_txn}


# =============================================================================
# REPORTING
# =============================================================================

def write_outputs(targets, plan, output_dir: str):
    out = Path(output_dir)
    out.mkdir(exist_ok=True, parents=True)

    with open(out / "targets.json", "w") as f:
        json.dump(targets, f, indent=2, ensure_ascii=False, default=str)
    with open(out / "approved_plan.json", "w") as f:
        json.dump(plan, f, indent=2, ensure_ascii=False, default=str)

    # Bucket by decision
    buckets = {"approved": [], "review": [], "keep-as-is": [], "todo": [], "error": []}
    for t in targets:
        d = t.get("match_decision") or "todo"
        buckets.setdefault(d, []).append(t)

    # Write CSV for manual review (mid-confidence cases)
    review_path = out / "review.csv"
    with open(review_path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow([
            "approve (Y/N)", "doc_type", "doc_name", "doc_id", "brand",
            "category", "current_url",
            "candidate_1_title", "candidate_1_link", "candidate_1_score", "candidate_1_passes", "candidate_1_reason",
            "candidate_2_title", "candidate_2_link", "candidate_2_score", "candidate_2_passes", "candidate_2_reason",
            "candidate_3_title", "candidate_3_link", "candidate_3_score", "candidate_3_passes", "candidate_3_reason",
            "match_reason",
        ])
        for t in buckets["review"]:
            row = ["", t["doc_type"], t["doc_name"], t["doc_id"],
                   t.get("brand", ""), t.get("category_name", ""),
                   (t.get("underlying_url") or t["current_url"])[:200]]
            for alt in (t.get("alternatives") or [])[:3]:
                row.extend([
                    (alt.get("title") or "")[:80],
                    (alt.get("link") or "")[:200],
                    str(alt.get("score") or 0),
                    "Y" if alt.get("passes") else "N",
                    (alt.get("reason") or "")[:80],
                ])
            # Pad if fewer than 3 alternatives
            while len(row) < 22:
                row.extend(["", "", "", "", ""])
            row.append(t.get("match_reason", "")[:200])
            w.writerow(row)

    # Markdown summary
    lines = ["# Mytheresa URL Refresh — Strict Match Report", ""]
    lines.append(f"- Total Mytheresa entries: {len(targets)}")
    lines.append(f"- ✅ Auto-approved (HIGH confidence): {len(buckets['approved'])}")
    lines.append(f"- 🔵 Designer-page (re-wrap as-is): {len(buckets['keep-as-is'])}")
    lines.append(f"- 🟡 Manual review needed: {len(buckets['review'])} → see `review.csv`")
    lines.append(f"- ⚠ TODO (no match in feed): {len(buckets['todo'])}")
    lines.append(f"- ❌ Errors: {len(buckets['error'])}")
    lines.append(f"- 📝 Mutations planned: {len(plan)}")
    lines.append("")

    if buckets["approved"]:
        lines.append(f"## ✅ Auto-Approved ({len(buckets['approved'])})")
        lines.append("")
        for t in buckets["approved"]:
            d = t["discovered"]
            lines.append(f"- **{t['doc_name']}** ({t['doc_type']})")
            lines.append(f"  - Old: `{(t.get('underlying_url') or t['current_url'])[:120]}`")
            lines.append(f"  - New: `{d['link'][:120]}`")
            lines.append(f"  - SID: `il-{t['sid_base']}` | Brand: {d.get('brand')} | Avail: {d.get('availability')}")
            lines.append("")

    if buckets["review"]:
        lines.append(f"## 🟡 Manual Review Needed ({len(buckets['review'])})")
        lines.append("Open `review.csv`, mark `approve (Y/N)` column, re-run with `--apply-all`.")
        lines.append("")
        for t in buckets["review"]:
            lines.append(f"- **{t['doc_name']}** ({t['doc_type']}) — {t.get('match_reason', '')[:100]}")

    if buckets["todo"]:
        lines.append("")
        lines.append(f"## ⚠ TODO ({len(buckets['todo'])})")
        lines.append("")
        for t in buckets["todo"]:
            lines.append(f"- **{t['doc_name']}** ({t['doc_type']}) — {t.get('match_reason', '')[:100]}")
            lines.append(f"  - id: `{t['doc_id']}` | url: `{t['current_url'][:100]}`")

    with open(out / "REPORT.md", "w") as f:
        f.write("\n".join(lines))
    log(f"Reports written to {out}")
    log(f"  - REPORT.md (summary)")
    log(f"  - approved_plan.json ({len(plan)} mutations ready)")
    log(f"  - review.csv ({len(buckets['review'])} for manual review)")
    log(f"  - targets.json (full data)")


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply-approved", action="store_true",
                        help="Apply HIGH-confidence approved mutations to Sanity")
    parser.add_argument("--apply-all", action="store_true",
                        help="Also apply manually-approved entries from review.csv (TODO)")
    parser.add_argument("--search-only", action="store_true",
                        help="Only search; never apply")
    parser.add_argument("--curated-file", default=None,
                        help="Path to curated_approved.txt (one 'doc_id|location_path' "
                             "per line). When set, ONLY entries in this whitelist are "
                             "included in mutations. Other approvals are dropped.")
    parser.add_argument("--limit", type=int, default=None,
                        help="Process only first N targets (debug)")
    parser.add_argument("--target-docs", default=None,
                        help="Comma-separated list of doc_ids to process "
                             "(e.g. 'product-loro-piana-open-walk,product-the-row-canal-leather-loafer'). "
                             "Filters targets BEFORE CJ search to save API calls. "
                             "Useful for re-searching a subset after best_match logic changes.")
    parser.add_argument("--output-dir", default=".")
    parser.add_argument("--throttle-cj", type=float, default=0.5)
    args = parser.parse_args()

    # Load curated whitelist if provided
    curated_keys = None
    if args.curated_file:
        whitelist = set()
        with open(args.curated_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    whitelist.add(line)
        curated_keys = whitelist
        log(f"Curated whitelist loaded: {len(curated_keys)} entries from {args.curated_file}")

    products, articles = scan_sanity()
    targets = extract_targets(products, articles)
    log(f"Total Mytheresa entries: {len(targets)}")

    if args.target_docs:
        wanted = {x.strip() for x in args.target_docs.split(",") if x.strip()}
        before = len(targets)
        targets = [t for t in targets if t.get("doc_id") in wanted]
        log(f"--target-docs filter: {before} → {len(targets)} entries "
            f"(matched {len({t['doc_id'] for t in targets})}/{len(wanted)} requested doc_ids)")
        unmatched = wanted - {t["doc_id"] for t in targets}
        if unmatched:
            log(f"⚠ {len(unmatched)} requested doc_ids not found in Sanity:")
            for d in sorted(unmatched):
                log(f"    {d}")

    if args.limit:
        targets = targets[:args.limit]
        log(f"Limited to first {args.limit}")

    targets = discover_replacements(targets, throttle=args.throttle_cj)

    counts = {}
    for t in targets:
        d = t.get("match_decision") or "?"
        counts[d] = counts.get(d, 0) + 1
    log(f"Decision summary: {counts}")

    mutations, plan = build_mutations(targets, include_manually_approved=False)

    # Apply curated whitelist filter
    if curated_keys is not None:
        before = len(mutations)
        # Re-build mutations + plan filtered by whitelist
        filtered_mutations = []
        filtered_plan = []
        for m, p in zip(mutations, plan):
            key = f"{p['doc_id']}|{p['location_path']}"
            if key in curated_keys:
                filtered_mutations.append(m)
                filtered_plan.append(p)
        mutations, plan = filtered_mutations, filtered_plan
        log(f"Curated filter: {before} → {len(mutations)} mutations "
            f"(dropped {before - len(mutations)} not in whitelist)")
        # Sanity check: warn if whitelist has entries we didn't see
        plan_keys = {f"{p['doc_id']}|{p['location_path']}" for p in plan}
        missing = curated_keys - plan_keys
        if missing:
            log(f"⚠ {len(missing)} curated entries did NOT match any approved entry:")
            for k in sorted(missing):
                log(f"    {k}")

    write_outputs(targets, plan, output_dir=args.output_dir)

    if args.search_only:
        log("--search-only: skipping mutation phase.")
        return

    if mutations and (args.apply_approved or not (args.apply_all)):
        result = apply_mutations(mutations, dry_run=not args.apply_approved)
        if result:
            log(f"{'Applied' if args.apply_approved else 'Dry-run'}: "
                f"{result['total']} ops, last_txn={result['last_txn']}")

    log("Done.")


if __name__ == "__main__":
    main()
