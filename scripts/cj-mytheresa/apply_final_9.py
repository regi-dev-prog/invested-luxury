"""Apply the 9 final mutations from final_9_mutations.json to Sanity.

Includes:
- Patches both published + draft document IDs
- Per-mutation logging
- Auto-revalidate of affected article paths via /api/revalidate

Usage:
    python3 apply_final_9.py --dry-run            # preview only
    python3 apply_final_9.py --apply              # write to Sanity
    python3 apply_final_9.py --apply --revalidate # write + bust caches
"""
import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.parse


SANITY_PROJECT = "4b3ap7pf"
SANITY_DATASET = "production"
SANITY_API_VERSION = "v2024-01-01"
SANITY_MUTATE_URL = (
    f"https://{SANITY_PROJECT}.api.sanity.io/{SANITY_API_VERSION}/data/mutate/{SANITY_DATASET}"
)
SANITY_QUERY_URL = (
    f"https://{SANITY_PROJECT}.api.sanity.io/{SANITY_API_VERSION}/data/query/{SANITY_DATASET}"
)


def log(msg):
    print(f"[apply_final_9] {msg}", flush=True)


def sanity_query(token: str, groq: str):
    """Query Sanity API (not CDN, to get fresh data)."""
    qs = urllib.parse.urlencode({"query": groq})
    req = urllib.request.Request(
        f"{SANITY_QUERY_URL}?{qs}",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())["result"]


def sanity_mutate(token: str, mutations: list, dry_run: bool = False):
    """Send patches to Sanity. dry_run=True does Sanity-side validation only."""
    body = {"mutations": mutations}
    url = SANITY_MUTATE_URL
    if dry_run:
        url += "?dryRun=true"
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def build_patch(doc_id: str, location_path: str, new_url: str) -> dict:
    """Build a Sanity patch that targets BOTH published & draft IDs."""
    return {
        "patch": {
            "query": f'*[_id == "{doc_id}" || _id == "drafts.{doc_id}"]',
            "set": {location_path: new_url},
        }
    }


def revalidate_path(secret: str, path: str) -> dict:
    """Hit /api/revalidate to flush a Vercel page."""
    qs = urllib.parse.urlencode({"secret": secret, "path": path})
    url = f"https://investedluxury.com/api/revalidate?{qs}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


# ----------------------------------------------------------------------------
# Article path discovery — finds which articles reference each mutated product
# ----------------------------------------------------------------------------
DISCOVER_ARTICLES_GROQ = """
*[_type == "article" && defined(slug.current) && (
  defined(primaryProduct) || count(secondaryProducts) > 0
)] {
  _id,
  "slug": slug.current,
  "categorySlug": coalesce(categories[0]->slug.current, ""),
  "parentSlug": coalesce(categories[0]->parentCategory->slug.current, ""),
  "primaryProductId": primaryProduct._ref,
  "secondaryProductIds": secondaryProducts[]._ref
}
"""


def find_article_paths(token: str, product_doc_ids: set[str]) -> list[str]:
    """Find URL paths of articles that reference any of the given products."""
    articles = sanity_query(token, DISCOVER_ARTICLES_GROQ)
    affected = []
    for a in articles:
        prod_ids = set(a.get("secondaryProductIds") or [])
        if a.get("primaryProductId"):
            prod_ids.add(a["primaryProductId"])
        if prod_ids & product_doc_ids:
            parent = a.get("parentSlug") or ""
            cat = a.get("categorySlug") or ""
            slug = a.get("slug") or ""
            if parent and cat and slug:
                affected.append(f"/{parent}/{cat}/{slug}")
    return sorted(set(affected))


# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mutations-file", default="final_9_mutations.json")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--revalidate", action="store_true",
                        help="After successful apply, bust Vercel cache for "
                             "affected articles via /api/revalidate")
    args = parser.parse_args()

    if not args.dry_run and not args.apply:
        log("ERROR: must pass --dry-run or --apply")
        sys.exit(1)

    sanity_token = os.environ.get("SANITY_TOKEN")
    if not sanity_token:
        log("ERROR: SANITY_TOKEN env var required")
        sys.exit(1)

    revalidate_secret = os.environ.get("REVALIDATE_SECRET")
    if args.revalidate and not revalidate_secret:
        log("ERROR: REVALIDATE_SECRET env var required when --revalidate is set")
        sys.exit(1)

    # Load mutations
    with open(args.mutations_file) as f:
        muts = json.load(f)
    log(f"Loaded {len(muts)} mutations from {args.mutations_file}")

    # Build Sanity patches
    patches = []
    for m in muts:
        patches.append(build_patch(m["doc_id"], m["location_path"], m["new_url"]))

    log(f"Built {len(patches)} Sanity patches")
    log("")
    for m in muts:
        kind = "FORMAT-A" if m["mutation_type"] == "format_a_replace" else "DESIGNER-FB"
        log(f"  [{kind}] {m['doc_id']}")
        log(f"    location: {m['location_path']}")
        log(f"    target:   {m['underlying_target']}")
    log("")

    # Send to Sanity
    log(f"Calling Sanity mutate API (dryRun={args.dry_run})…")
    try:
        result = sanity_mutate(sanity_token, patches, dry_run=args.dry_run)
        n_results = len(result.get("results") or [])
        log(f"  ✓ Sanity returned {n_results} result entries (transactionId={result.get('transactionId', 'n/a')})")
        if args.dry_run:
            log("  (--dry-run: no actual writes performed)")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        log(f"  ✗ Sanity API error {e.code}: {body[:500]}")
        sys.exit(1)

    # Revalidate affected articles
    if args.apply and args.revalidate:
        product_ids = {m["doc_id"] for m in muts}
        log("")
        log("Discovering articles that reference these products…")
        paths = find_article_paths(sanity_token, product_ids)
        log(f"  Found {len(paths)} affected article paths:")
        for p in paths:
            log(f"    {p}")

        log("")
        log("Calling /api/revalidate for each path…")
        time.sleep(2)  # let Sanity propagate
        for p in paths:
            try:
                r = revalidate_path(revalidate_secret, p)
                ok = r.get("ok")
                log(f"  {'✓' if ok else '✗'} {p}  →  {r.get('results') or r.get('error')}")
            except Exception as e:
                log(f"  ✗ {p}  →  {type(e).__name__}: {e}")

    log("")
    log("Done.")


if __name__ == "__main__":
    main()
